// ── State & Real-Time Sync ────────────────────────────────────────────────────
// Uses Firebase Realtime Database for live multi-device sync.
// All devices see updates within ~1-2 seconds automatically.
// Falls back to localStorage + URL hash if Firebase is unavailable.
//
// SETUP: Replace the firebaseConfig below with your own Firebase project config.
// Free Spark plan is sufficient. Go to https://console.firebase.google.com/
// Create a project → Realtime Database → Start in test mode → copy config.

const FIREBASE_CONFIG = {
  // ⚠️  REPLACE THIS with your Firebase project config
  // Get it from: Firebase Console → Project Settings → Your apps → SDK setup
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const DB_PATH = 'ttc_april_2026';
const STATE_KEY = 'ttc_tourney_2026';

// Firebase state
let _db = null;
let _firebaseReady = false;
let _syncCallbacks = [];
let _lastSavedHash = null;

// Init Firebase if config is set
function initFirebase() {
  if (FIREBASE_CONFIG.apiKey === 'YOUR_API_KEY') {
    console.log('[Sync] Firebase not configured — using URL hash sync only');
    return;
  }
  try {
    if (typeof firebase === 'undefined') {
      console.warn('[Sync] Firebase SDK not loaded');
      return;
    }
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    _db = firebase.database();
    _firebaseReady = true;

    // Listen for changes from other devices
    _db.ref(DB_PATH).on('value', snapshot => {
      const data = snapshot.val();
      if (!data) return;
      const remote = decodeState(data.encoded);
      if (!remote) return;
      // Only update if remote is newer
      const localRaw = _getLocalRaw();
      if (!localRaw || (remote.lastUpdated && (!localRaw.lastUpdated || remote.lastUpdated > localRaw.lastUpdated))) {
        _setLocalRaw(remote);
        _syncCallbacks.forEach(cb => cb(remote));
      }
    });
    console.log('[Sync] Firebase connected — real-time sync active ✓');
  } catch(e) {
    console.warn('[Sync] Firebase init failed:', e);
    _firebaseReady = false;
  }
}

function onStateChange(cb) {
  _syncCallbacks.push(cb);
}

function defaultState() {
  return { matchResults: {}, grandFinalReset: false, lastUpdated: null };
}

function encodeState(state) {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(state)))); } catch(e) { return ''; }
}

function decodeState(encoded) {
  try { return JSON.parse(decodeURIComponent(escape(atob(encoded)))); } catch(e) { return null; }
}

function _getLocalRaw() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

function _setLocalRaw(state) {
  try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch(e) {}
  const encoded = encodeState(state);
  if (encoded) history.replaceState(null, '', '#' + encoded);
}

function saveState(state) {
  state.lastUpdated = new Date().toISOString();
  _setLocalRaw(state);

  // Push to Firebase
  if (_firebaseReady && _db) {
    const encoded = encodeState(state);
    _db.ref(DB_PATH).set({ encoded, lastUpdated: state.lastUpdated })
      .catch(e => console.warn('[Sync] Firebase save failed:', e));
  }
}

function loadState() {
  // Priority: URL hash → localStorage → default
  const hash = window.location.hash.slice(1);
  if (hash && hash.length > 10) {
    const fromUrl = decodeState(hash);
    if (fromUrl && fromUrl.matchResults) {
      try { localStorage.setItem(STATE_KEY, JSON.stringify(fromUrl)); } catch(e) {}
      return fromUrl;
    }
  }
  const local = _getLocalRaw();
  if (local && local.matchResults) {
    const encoded = encodeState(local);
    if (encoded) history.replaceState(null, '', '#' + encoded);
    return local;
  }
  return defaultState();
}

function getShareableUrl() {
  return window.location.origin + window.location.pathname + window.location.hash;
}

// ── Bracket Engine ────────────────────────────────────────────────────────────
function computeBracket(state) {
  const allMatches = buildBracketStructure();
  const matchMap = buildMatchMap(allMatches);
  const results = JSON.parse(JSON.stringify(state.matchResults || {})); // deep copy

  // Auto-complete bye matches
  allMatches.forEach(m => {
    if (m.autoWinner && !results[m.id]) {
      results[m.id] = { winner: m.autoWinner, score1: 'BYE', score2: '', complete: true, auto: true };
    }
  });

  // Propagate until stable
  for (let pass = 0; pass < 12; pass++) {
    allMatches.forEach(m => {
      if (!m.feedFrom) return;
      const [f1, f2] = m.feedFrom;
      const [t1, t2] = m.feedType;

      let newP1 = m.p1;
      let newP2 = m.p2;

      if (f1) {
        const r1 = results[f1];
        if (r1 && r1.complete) {
          const srcMatch = matchMap[f1];
          if (t1 === 'winner') newP1 = r1.winner;
          else if (t1 === 'loser') newP1 = (srcMatch.p1 === r1.winner) ? srcMatch.p2 : srcMatch.p1;
        }
      }

      if (f2 && t2 !== 'bye') {
        const r2 = results[f2];
        if (r2 && r2.complete) {
          const srcMatch = matchMap[f2];
          if (t2 === 'winner') newP2 = r2.winner;
          else if (t2 === 'loser') newP2 = (srcMatch.p1 === r2.winner) ? srcMatch.p2 : srcMatch.p1;
        }
      } else if (t2 === 'bye') {
        newP2 = null;
        if (newP1 && !results[m.id]) {
          results[m.id] = { winner: newP1, score1: 'BYE', score2: '', complete: true, auto: true };
        }
      }

      m.p1 = newP1;
      m.p2 = newP2;
    });
  }

  return { allMatches, matchMap, results };
}

function computeStandings(state, allMatches) {
  const results = state.matchResults || {};
  const gfResult = results['GF'];
  const lbfResult = results['LB-F'];
  let first = null, second = null, third = null;
  if (gfResult && gfResult.complete) {
    first = gfResult.winner;
    const gfMatch = allMatches.find(m => m.id === 'GF');
    second = gfMatch.p1 === first ? gfMatch.p2 : gfMatch.p1;
  }
  if (lbfResult && lbfResult.complete) {
    const lbfMatch = allMatches.find(m => m.id === 'LB-F');
    third = lbfMatch.p1 === lbfResult.winner ? lbfMatch.p2 : lbfMatch.p1;
  }
  return { first, second, third };
}

function computeDivisionWinners(state, allMatches) {
  const results = state.matchResults || {};
  const roundOrder = ['WB-R1','LB-R1','WB-R2','LB-R2','WB-QF','LB-R3','WB-SF','LB-R4','LB-SF','WB-F','LB-F','GF'];
  const divEliminated = { advanced:{}, intermediate:{}, beginner:{} };

  allMatches.forEach(m => {
    const r = results[m.id];
    if (!r?.complete || r.auto) return;
    const loser = m.p1 === r.winner ? m.p2 : m.p1;
    if (!loser) return;
    const level = playerLevel(loser);
    if (!level) return;
    if (m.round.startsWith('LB') || m.round === 'GF') {
      divEliminated[level][loser] = m.round;
    }
  });

  const divWinners = {};
  ['advanced','intermediate','beginner'].forEach(level => {
    const inLevel = PLAYERS.filter(p => p.level === level);
    const active = inLevel.filter(p => !divEliminated[level][p.id]);
    if (active.length === 1) {
      divWinners[level] = active[0].id;
    } else if (active.length === 0) {
      let best = null, bestRound = -1;
      inLevel.forEach(p => {
        const idx = roundOrder.indexOf(divEliminated[level][p.id]);
        if (idx > bestRound) { bestRound = idx; best = p.id; }
      });
      divWinners[level] = best;
    } else {
      divWinners[level] = null;
    }
  });
  return divWinners;
}

// Auto-init Firebase when loaded
document.addEventListener('DOMContentLoaded', initFirebase);

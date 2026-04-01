// ── State Management ──────────────────────────────────────────────────────────
// State is stored in two places simultaneously:
//   1. localStorage (for same browser persistence)
//   2. URL hash (base64-encoded JSON, for sharing between devices/execs)
//
// URL hash wins on load if present. localStorage is fallback.
// After any update, both are synced.

const STATE_KEY = 'ttc_tourney_2026';

// matchResults: { [matchId]: { winner: playerId, score1: str, score2: str, complete: bool } }
// grandFinalReset: bool (if WB champ lost in GF, needs bracket reset match)

function defaultState() {
  return {
    matchResults: {},
    grandFinalReset: false,
    lastUpdated: null
  };
}

function encodeState(state) {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(state))));
  } catch(e) {
    return '';
  }
}

function decodeState(encoded) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  } catch(e) {
    return null;
  }
}

function saveState(state) {
  state.lastUpdated = new Date().toISOString();
  // 1. localStorage
  try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch(e) {}
  // 2. URL hash
  const encoded = encodeState(state);
  if (encoded) {
    history.replaceState(null, '', '#' + encoded);
  }
}

function loadState() {
  // Priority: URL hash > localStorage
  const hash = window.location.hash.slice(1);
  if (hash && hash.length > 10) {
    const fromUrl = decodeState(hash);
    if (fromUrl && fromUrl.matchResults) {
      // Also save to localStorage for convenience
      try { localStorage.setItem(STATE_KEY, JSON.stringify(fromUrl)); } catch(e) {}
      return fromUrl;
    }
  }
  // Fallback: localStorage
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.matchResults) {
        // Restore hash
        const encoded = encodeState(parsed);
        if (encoded) history.replaceState(null, '', '#' + encoded);
        return parsed;
      }
    }
  } catch(e) {}
  return defaultState();
}

function getShareableUrl() {
  return window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/bracket.html') + window.location.hash;
}

// ── Bracket Engine ────────────────────────────────────────────────────────────
// Given state.matchResults, compute the current p1/p2 for every match

function computeBracket(state) {
  const allMatches = buildBracketStructure();
  const matchMap = buildMatchMap(allMatches);
  const results = state.matchResults || {};

  // First pass: handle byes and auto-winners
  allMatches.forEach(m => {
    if (m.isBye && m.feedType[0] === 'loser') {
      // LB match where one side is a bye — auto-fill bye side
      // The actual loser feeds in from the WB match
      // Leave p2 as null (bye), p1 will be filled from WB loser
    }
    if (m.autoWinner) {
      // WB-R1 bye match — winner is already known
      if (!results[m.id]) {
        results[m.id] = { winner: m.autoWinner, score1: 'BYE', score2: '', complete: true, auto: true };
      }
    }
  });

  // Topological propagation — run multiple passes until stable
  for (let pass = 0; pass < 10; pass++) {
    allMatches.forEach(m => {
      if (!m.feedFrom) return;
      const [f1, f2] = m.feedFrom;
      const [t1, t2] = m.feedType;

      let newP1 = m.p1;
      let newP2 = m.p2;

      // Resolve slot 1
      if (f1) {
        const r1 = results[f1];
        if (r1 && r1.complete) {
          if (t1 === 'winner') newP1 = r1.winner;
          else if (t1 === 'loser') {
            const srcMatch = matchMap[f1];
            const loser = (srcMatch.p1 === r1.winner) ? srcMatch.p2 : srcMatch.p1;
            newP1 = loser;
          }
        }
      }

      // Resolve slot 2
      if (f2 && t2 !== 'bye') {
        const r2 = results[f2];
        if (r2 && r2.complete) {
          if (t2 === 'winner') newP2 = r2.winner;
          else if (t2 === 'loser') {
            const srcMatch = matchMap[f2];
            const loser = (srcMatch.p1 === r2.winner) ? srcMatch.p2 : srcMatch.p1;
            newP2 = loser;
          }
        }
      } else if (t2 === 'bye') {
        // Auto-complete LB match with bye — winner is p1
        if (newP1 && !results[m.id]) {
          results[m.id] = { winner: newP1, score1: 'BYE', score2: '', complete: true, auto: true };
        }
        newP2 = null;
      }

      m.p1 = newP1;
      m.p2 = newP2;
    });
  }

  return { allMatches, matchMap, results };
}

// Get division winner: furthest-advancing player per level
function computeDivisionWinners(state, allMatches) {
  const results = state.matchResults || {};
  const roundOrder = ['WB-R1','LB-R1','WB-R2','LB-R2','WB-QF','LB-R3','WB-SF','LB-R4','LB-SF','WB-F','LB-F','GF'];

  const divWinners = { advanced: null, intermediate: null, beginner: null };
  const divEliminated = { advanced: {}, intermediate: {}, beginner: {} };

  // Find all eliminated players (lost in LB, or lost twice)
  allMatches.forEach(m => {
    const r = results[m.id];
    if (!r || !r.complete || r.auto) return;
    const loser = m.p1 === r.winner ? m.p2 : m.p1;
    if (!loser) return;
    const level = playerLevel(loser);
    if (!level) return;
    // LB rounds — a loss here eliminates
    if (m.round.startsWith('LB') || m.round === 'GF') {
      divEliminated[level][loser] = m.round;
    }
  });

  // Division winner = last non-eliminated player still in bracket per level
  const levels = ['advanced','intermediate','beginner'];
  levels.forEach(level => {
    const inLevel = PLAYERS.filter(p => p.level === level);
    const active = inLevel.filter(p => !divEliminated[level][p.id]);
    if (active.length === 1) divWinners[level] = active[0].id;
    else if (active.length === 0) {
      // All eliminated — find the one who lasted longest
      let best = null;
      let bestRound = -1;
      inLevel.forEach(p => {
        const round = divEliminated[level][p.id];
        const idx = roundOrder.indexOf(round);
        if (idx > bestRound) { bestRound = idx; best = p.id; }
      });
      divWinners[level] = best;
    }
  });

  return divWinners;
}

// Overall standings
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

// ── Player data ───────────────────────────────────────────────────────────────
const PLAYERS = [
  { id: 1,  name: "Vaughn Zamudio",           level: "advanced",     note: "" },
  { id: 2,  name: "Jakub Laczek",             level: "advanced",     note: "" },
  { id: 3,  name: "Obafemi Omoniyi",          level: "advanced",     note: "⚠️ Wed & Fri only", nickname: "Zuzu" },
  { id: 4,  name: "Nicolas Altimiras Gil",    level: "advanced",     note: "" },
  { id: 5,  name: "Jay Gohel",                level: "advanced",     note: "" },
  { id: 6,  name: "Anthony Malke",            level: "advanced",     note: "" },
  { id: 7,  name: "Muhammad Ahmad Hasan",     level: "advanced",     note: "" },
  { id: 8,  name: "Dominique Frenk",          level: "advanced",     note: "" },
  { id: 9,  name: "Poojith Reddy Annachedu",  level: "advanced",     note: "" },
  { id: 10, name: "Debayan Mitra",            level: "intermediate", note: "" },
  { id: 11, name: "Hasan Hamed",              level: "intermediate", note: "" },
  { id: 12, name: "Khozema Vakil",            level: "intermediate", note: "" },
  { id: 13, name: "Tanvir Ahmed Khan",        level: "intermediate", note: "" },
  { id: 14, name: "Zia Uddin Chowdhury",      level: "intermediate", note: "" },
  { id: 15, name: "Anfaal Ahmed Khan",        level: "intermediate", note: "" },
  { id: 16, name: "Furqan Farooqui",          level: "intermediate", note: "" },
  { id: 17, name: "Umar Siddiqui",            level: "intermediate", note: "" },
  { id: 18, name: "Muhammed Raza",            level: "intermediate", note: "" },
  { id: 19, name: "Omar Salman",              level: "intermediate", note: "" },
  { id: 20, name: "Hongyi Wang",              level: "intermediate", note: "" },
  { id: 21, name: "Nikunj Menghani",          level: "intermediate", note: "" },
  { id: 22, name: "Pavle Veselinovic",        level: "intermediate", note: "⏰ Before 1:50 PM" },
  { id: 23, name: "Shayan Surani",            level: "intermediate", note: "" },
  { id: 24, name: "Tanay Sharma",             level: "beginner",     note: "" },
  { id: 25, name: "Sai Abhinav Kolli",        level: "beginner",     note: "" },
  { id: 26, name: "Harold Ho",                level: "beginner",     note: "" },
  { id: 27, name: "Thomas Czerwien",          level: "beginner",     note: "" },
];

// Standard 32-player seeding positions
const SEED_ORDER_32 = [1,32,17,16,9,24,25,8,5,28,21,12,13,20,29,4,
                        3,30,19,14,11,22,27,6,7,26,23,10,15,18,31,2];

// Build R1 matchups (seeds > 27 = BYE)
function buildR1Matches() {
  const matches = [];
  for (let i = 0; i < 32; i += 2) {
    const s1 = SEED_ORDER_32[i];
    const s2 = SEED_ORDER_32[i + 1];
    const isBye = s1 > 27 || s2 > 27;
    const realSeed = isBye ? (s1 <= 27 ? s1 : s2) : null;
    matches.push({
      id: `WB-R1-M${matches.length + 1}`,
      round: 'WB-R1',
      p1: s1 <= 27 ? s1 : null,
      p2: s2 <= 27 ? s2 : null,
      isBye,
      autoWinner: isBye ? realSeed : null,
      day: 1,
      schedulingNote: (s1 === 22 || s2 === 22) ? 'before-150' :
                      (s1 === 3  || s2 === 3)  ? 'wed-fri' : null
    });
  }
  return matches;
}

// Full bracket structure definition
// Each match knows: which matches feed into it (from WB or LB)
function buildBracketStructure() {
  // Winners bracket rounds
  // WB-R1: 16 matches (M1-M16)
  // WB-R2: 8 matches (M17-M24)
  // WB-QF: 4 matches (M25-M28)
  // WB-SF: 2 matches (M29-M30)
  // WB-F:  1 match  (M31)
  // LB-R1: 6 matches (M32-M37) -- losers from WB-R1 (11 real losers, 5 bye spots get skipped)
  // LB-R2: 7 matches (M38-M44)
  // LB-R3: 4 matches (M45-M48)
  // LB-R4: 2 matches (M49-M50)
  // LB-SF: 2 matches (M51-M52)
  // LB-F:  1 match  (M53)
  // GRAND-FINAL: M54

  const wbR1 = buildR1Matches();

  // WB R2 — winners of pairs of R1 matches
  const wbR2 = [];
  for (let i = 0; i < 8; i++) {
    const m1id = wbR1[i*2].id;
    const m2id = wbR1[i*2+1].id;
    const isZuzu = (wbR1[i*2].p1 === 3 || wbR1[i*2].p2 === 3 ||
                    wbR1[i*2+1].p1 === 3 || wbR1[i*2+1].p2 === 3 ||
                    wbR1[i*2].autoWinner === 3 || wbR1[i*2+1].autoWinner === 3);
    wbR2.push({
      id: `WB-R2-M${i+1}`,
      round: 'WB-R2',
      p1: null, p2: null,
      feedFrom: [m1id, m2id],
      feedType: ['winner','winner'],
      day: isZuzu ? 3 : 2,
      schedulingNote: isZuzu ? 'wed-fri' : null
    });
  }

  // WB QF
  const wbQF = [];
  for (let i = 0; i < 4; i++) {
    wbQF.push({
      id: `WB-QF-M${i+1}`,
      round: 'WB-QF',
      p1: null, p2: null,
      feedFrom: [wbR2[i*2].id, wbR2[i*2+1].id],
      feedType: ['winner','winner'],
      day: 3
    });
  }

  // WB SF
  const wbSF = [
    { id:'WB-SF-M1', round:'WB-SF', p1:null, p2:null, feedFrom:[wbQF[0].id, wbQF[1].id], feedType:['winner','winner'], day:3 },
    { id:'WB-SF-M2', round:'WB-SF', p1:null, p2:null, feedFrom:[wbQF[2].id, wbQF[3].id], feedType:['winner','winner'], day:3 }
  ];

  // WB Final
  const wbFinal = [
    { id:'WB-F', round:'WB-F', p1:null, p2:null, feedFrom:[wbSF[0].id, wbSF[1].id], feedType:['winner','winner'], day:3 }
  ];

  // LB R1 — losers from WB R1 (non-bye matches only)
  // Real matches: M2,M3,M4,M6,M7,M10,M11,M12,M13,M14,M15 = 11 losers
  // Pair them up: 6 LB R1 matches (last one may have a bye)
  const wbR1RealIds = wbR1.filter(m => !m.isBye).map(m => m.id);
  // Pair: [M2,M3],[M4,M6],[M7,M10],[M11,M12],[M13,M14],[M15,bye]
  const lbR1Pairs = [
    [wbR1RealIds[0], wbR1RealIds[1]],
    [wbR1RealIds[2], wbR1RealIds[3]],
    [wbR1RealIds[4], wbR1RealIds[5]],
    [wbR1RealIds[6], wbR1RealIds[7]],
    [wbR1RealIds[8], wbR1RealIds[9]],
    [wbR1RealIds[10], null],  // bye
  ];
  const lbR1 = lbR1Pairs.map((pair, i) => ({
    id: `LB-R1-M${i+1}`,
    round: 'LB-R1',
    p1: null, p2: null,
    feedFrom: pair,
    feedType: ['loser', pair[1] ? 'loser' : 'bye'],
    day: 2,
    isBye: !pair[1]
  }));

  // LB R2 — losers from WB-R2 vs winners from LB-R1
  // 7 LB-R2 matches (skip WB-R2-M5 loser going to different LB slot due to Zuzu)
  // Standard: loser(WB-R2-Mx) vs winner(LB-R1-My)
  // Mapping: WB-R2-M1 loser vs LB-R1-M1 winner, etc.
  // We have 8 WB-R2 losers and 6 LB-R1 winners = need to pair carefully
  // LB-R2: 7 matches (6 pairs + 1 with bye for the odd WB-R2 loser)
  const lbR2 = [];
  for (let i = 0; i < 6; i++) {
    lbR2.push({
      id: `LB-R2-M${i+1}`,
      round: 'LB-R2',
      p1: null, p2: null,
      feedFrom: [wbR2[i].id, lbR1[i].id],
      feedType: ['loser','winner'],
      day: 2
    });
  }
  // 7th LB-R2: WB-R2-M7 loser gets a bye (advances automatically)
  lbR2.push({
    id: `LB-R2-M7`,
    round: 'LB-R2',
    p1: null, p2: null,
    feedFrom: [wbR2[6].id, null],
    feedType: ['loser','bye'],
    day: 2,
    isBye: true
  });

  // LB R3 — losers from WB-QF vs winners from LB-R2 (paired)
  const lbR3 = [];
  for (let i = 0; i < 4; i++) {
    lbR3.push({
      id: `LB-R3-M${i+1}`,
      round: 'LB-R3',
      p1: null, p2: null,
      feedFrom: [wbQF[i].id, lbR2[i].id],
      feedType: ['loser','winner'],
      day: 3
    });
  }

  // LB R4 — winners of LB-R3 pairs
  const lbR4 = [
    { id:'LB-R4-M1', round:'LB-R4', p1:null, p2:null, feedFrom:[lbR3[0].id,lbR3[1].id], feedType:['winner','winner'], day:3 },
    { id:'LB-R4-M2', round:'LB-R4', p1:null, p2:null, feedFrom:[lbR3[2].id,lbR3[3].id], feedType:['winner','winner'], day:3 }
  ];

  // LB SF — losers of WB-SF vs winners of LB-R4
  const lbSF = [
    { id:'LB-SF-M1', round:'LB-SF', p1:null, p2:null, feedFrom:[wbSF[0].id, lbR4[0].id], feedType:['loser','winner'], day:3 },
    { id:'LB-SF-M2', round:'LB-SF', p1:null, p2:null, feedFrom:[wbSF[1].id, lbR4[1].id], feedType:['loser','winner'], day:3 }
  ];

  // LB Final
  const lbFinal = [
    { id:'LB-F', round:'LB-F', p1:null, p2:null, feedFrom:[lbSF[0].id, lbSF[1].id], feedType:['winner','winner'], day:3 }
  ];

  // Grand Final
  const grandFinal = [
    { id:'GF', round:'GF', p1:null, p2:null, feedFrom:[wbFinal[0].id, lbFinal[0].id], feedType:['winner','winner'], day:3, note:'WB champion needs 1 loss. LB champion needs 1 win.' }
  ];

  const allMatches = [
    ...wbR1, ...wbR2, ...wbQF, ...wbSF, ...wbFinal,
    ...lbR1, ...lbR2, ...lbR3, ...lbR4, ...lbSF, ...lbFinal,
    ...grandFinal
  ];

  return allMatches;
}

// Build match lookup map
function buildMatchMap(matches) {
  const map = {};
  matches.forEach(m => { map[m.id] = m; });
  return map;
}

// Get player display name (short)
function playerName(id, short = false) {
  if (!id) return '';
  const p = PLAYERS.find(x => x.id === id);
  if (!p) return '?';
  if (short) {
    const parts = p.name.split(' ');
    return parts[0] + (parts.length > 1 ? ' ' + parts[parts.length-1][0] + '.' : '');
  }
  return p.name + (p.nickname ? ` (${p.nickname})` : '');
}

function playerLevel(id) {
  if (!id) return null;
  const p = PLAYERS.find(x => x.id === id);
  return p ? p.level : null;
}

function playerNote(id) {
  if (!id) return '';
  const p = PLAYERS.find(x => x.id === id);
  return p ? p.note : '';
}

const ROUND_LABELS = {
  'WB-R1': 'WB Round 1', 'WB-R2': 'WB Round 2',
  'WB-QF': 'WB Quarterfinal', 'WB-SF': 'WB Semifinal',
  'WB-F': 'WB Final', 'LB-R1': 'LB Round 1',
  'LB-R2': 'LB Round 2', 'LB-R3': 'LB Round 3',
  'LB-R4': 'LB Round 4', 'LB-SF': 'LB Semifinal',
  'LB-F': 'LB Final', 'GF': '🏆 Grand Final'
};

const DAY_LABELS = { 1: 'Wed Apr 1', 2: 'Thu Apr 2', 3: 'Fri Apr 3' };

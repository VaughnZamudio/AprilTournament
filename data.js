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

// Build R1 matchups per xlsx: M1=Vaughn(bye), M2=Umar vs Furqan, M3=Poojith vs Tanay,
// M4=Sai vs Dominique, M5=Jay(bye), M6=Nikunj vs Khozema, M7=Tanvir vs Hongyi,
// M8=Nicolas(bye), M9=Obafemi(bye/Zuzu), M10=Omar vs Zia, M11=Hasan vs Pavle,
// M12=Thomas vs Anthony, M13=Muhammad vs Harold, M14=Shayan vs Debayan,
// M15=Anfaal vs Muhammed, M16=Jakub(bye)
function buildR1Matches() {
  // Define exact matchups from the xlsx bracket sheet
  const r1Defs = [
    { id:'WB-R1-M1',  p1:1,  p2:null, isBye:true,  autoWinner:1,  day:1, schedulingNote:null },         // Vaughn bye
    { id:'WB-R1-M2',  p1:17, p2:16,   isBye:false, autoWinner:null, day:1, schedulingNote:null },        // Umar vs Furqan
    { id:'WB-R1-M3',  p1:9,  p2:24,   isBye:false, autoWinner:null, day:1, schedulingNote:null },        // Poojith vs Tanay
    { id:'WB-R1-M4',  p1:25, p2:8,    isBye:false, autoWinner:null, day:1, schedulingNote:null },        // Sai vs Dominique
    { id:'WB-R1-M5',  p1:5,  p2:null, isBye:true,  autoWinner:5,   day:1, schedulingNote:null },         // Jay bye
    { id:'WB-R1-M6',  p1:21, p2:12,   isBye:false, autoWinner:null, day:1, schedulingNote:null },        // Nikunj vs Khozema
    { id:'WB-R1-M7',  p1:13, p2:20,   isBye:false, autoWinner:null, day:1, schedulingNote:null },        // Tanvir vs Hongyi
    { id:'WB-R1-M8',  p1:4,  p2:null, isBye:true,  autoWinner:4,   day:1, schedulingNote:null },         // Nicolas bye
    { id:'WB-R1-M9',  p1:3,  p2:null, isBye:true,  autoWinner:3,   day:1, schedulingNote:'wed-fri' },    // Obafemi/Zuzu bye
    { id:'WB-R1-M10', p1:19, p2:14,   isBye:false, autoWinner:null, day:1, schedulingNote:null },        // Omar vs Zia
    { id:'WB-R1-M11', p1:11, p2:22,   isBye:false, autoWinner:null, day:1, schedulingNote:'before-150' },// Hasan vs Pavle (schedule first!)
    { id:'WB-R1-M12', p1:27, p2:6,    isBye:false, autoWinner:null, day:1, schedulingNote:null },        // Thomas vs Anthony
    { id:'WB-R1-M13', p1:7,  p2:26,   isBye:false, autoWinner:null, day:1, schedulingNote:null },        // Muhammad vs Harold
    { id:'WB-R1-M14', p1:23, p2:10,   isBye:false, autoWinner:null, day:1, schedulingNote:null },        // Shayan vs Debayan
    { id:'WB-R1-M15', p1:15, p2:18,   isBye:false, autoWinner:null, day:1, schedulingNote:null },        // Anfaal vs Muhammed
    { id:'WB-R1-M16', p1:2,  p2:null, isBye:true,  autoWinner:2,   day:1, schedulingNote:null },         // Jakub bye
  ];
  r1Defs.forEach(m => { m.round = 'WB-R1'; });
  return r1Defs;
}

function buildBracketStructure() {
  const wbR1 = buildR1Matches();

  // WB R2: winners from pairs. M5 (Zuzu) is Friday-only
  // Pairing from xlsx: M1+M2→R2-M1, M3+M4→R2-M2, M5+M6→R2-M3, M7+M8→R2-M4,
  //                    M9+M10→R2-M5(Fri/Zuzu), M11+M12→R2-M6, M13+M14→R2-M7, M15+M16→R2-M8
  const wbR2Defs = [
    { id:'WB-R2-M1', feedFrom:['WB-R1-M1','WB-R1-M2'], feedType:['winner','winner'], day:2, schedulingNote:null },
    { id:'WB-R2-M2', feedFrom:['WB-R1-M3','WB-R1-M4'], feedType:['winner','winner'], day:2, schedulingNote:null },
    { id:'WB-R2-M3', feedFrom:['WB-R1-M5','WB-R1-M6'], feedType:['winner','winner'], day:2, schedulingNote:null },
    { id:'WB-R2-M4', feedFrom:['WB-R1-M7','WB-R1-M8'], feedType:['winner','winner'], day:2, schedulingNote:null },
    { id:'WB-R2-M5', feedFrom:['WB-R1-M9','WB-R1-M10'],feedType:['winner','winner'], day:3, schedulingNote:'wed-fri' }, // Zuzu → Friday
    { id:'WB-R2-M6', feedFrom:['WB-R1-M11','WB-R1-M12'],feedType:['winner','winner'],day:2, schedulingNote:null },
    { id:'WB-R2-M7', feedFrom:['WB-R1-M13','WB-R1-M14'],feedType:['winner','winner'],day:2, schedulingNote:null },
    { id:'WB-R2-M8', feedFrom:['WB-R1-M15','WB-R1-M16'],feedType:['winner','winner'],day:2, schedulingNote:null },
  ];
  wbR2Defs.forEach(m => { m.round = 'WB-R2'; m.p1=null; m.p2=null; });

  // WB QF: R2-M1+M2→QF-M1, R2-M3+M4→QF-M2, R2-M5+M6→QF-M3, R2-M7+M8→QF-M4
  const wbQF = [
    { id:'WB-QF-M1', round:'WB-QF', p1:null,p2:null, feedFrom:['WB-R2-M1','WB-R2-M2'], feedType:['winner','winner'], day:3 },
    { id:'WB-QF-M2', round:'WB-QF', p1:null,p2:null, feedFrom:['WB-R2-M3','WB-R2-M4'], feedType:['winner','winner'], day:3 },
    { id:'WB-QF-M3', round:'WB-QF', p1:null,p2:null, feedFrom:['WB-R2-M5','WB-R2-M6'], feedType:['winner','winner'], day:3 },
    { id:'WB-QF-M4', round:'WB-QF', p1:null,p2:null, feedFrom:['WB-R2-M7','WB-R2-M8'], feedType:['winner','winner'], day:3 },
  ];

  // WB SF
  const wbSF = [
    { id:'WB-SF-M1', round:'WB-SF', p1:null,p2:null, feedFrom:['WB-QF-M1','WB-QF-M2'], feedType:['winner','winner'], day:3 },
    { id:'WB-SF-M2', round:'WB-SF', p1:null,p2:null, feedFrom:['WB-QF-M3','WB-QF-M4'], feedType:['winner','winner'], day:3 },
  ];

  // WB Final
  const wbFinal = [
    { id:'WB-F', round:'WB-F', p1:null,p2:null, feedFrom:['WB-SF-M1','WB-SF-M2'], feedType:['winner','winner'], day:3 },
  ];

  // LB R1: losers from real WB-R1 matches (M2,M3,M4,M6,M7,M10,M11,M12,M13,M14,M15)
  // From xlsx: L(M2)+L(M3)→LB-R1-M1, L(M4)+L(M6)→LB-R1-M2, L(M7)+L(M10)→LB-R1-M3,
  //            L(M11)+L(M12)→LB-R1-M4, L(M13)+L(M14)→LB-R1-M5, L(M15)+bye→LB-R1-M6
  const lbR1 = [
    { id:'LB-R1-M1', round:'LB-R1', p1:null,p2:null, feedFrom:['WB-R1-M2','WB-R1-M3'],  feedType:['loser','loser'], day:2, isBye:false },
    { id:'LB-R1-M2', round:'LB-R1', p1:null,p2:null, feedFrom:['WB-R1-M4','WB-R1-M6'],  feedType:['loser','loser'], day:2, isBye:false },
    { id:'LB-R1-M3', round:'LB-R1', p1:null,p2:null, feedFrom:['WB-R1-M7','WB-R1-M10'], feedType:['loser','loser'], day:2, isBye:false },
    { id:'LB-R1-M4', round:'LB-R1', p1:null,p2:null, feedFrom:['WB-R1-M11','WB-R1-M12'],feedType:['loser','loser'], day:2, isBye:false },
    { id:'LB-R1-M5', round:'LB-R1', p1:null,p2:null, feedFrom:['WB-R1-M13','WB-R1-M14'],feedType:['loser','loser'], day:2, isBye:false },
    { id:'LB-R1-M6', round:'LB-R1', p1:null,p2:null, feedFrom:['WB-R1-M15',null],        feedType:['loser','bye'],  day:2, isBye:true  },
  ];

  // LB R2: L(WB-R2) vs W(LB-R1)
  // L(WB-R2-M1)+W(LB-R1-M1)→LB-R2-M1, L(WB-R2-M2)+W(LB-R1-M2)→LB-R2-M2,
  // L(WB-R2-M3)+W(LB-R1-M3)→LB-R2-M3, L(WB-R2-M4)+W(LB-R1-M4)→LB-R2-M4,
  // L(WB-R2-M6)+W(LB-R1-M5)→LB-R2-M5, L(WB-R2-M7)+W(LB-R1-M6)→LB-R2-M6,
  // L(WB-R2-M8)+bye→LB-R2-M7
  const lbR2 = [
    { id:'LB-R2-M1', round:'LB-R2', p1:null,p2:null, feedFrom:['WB-R2-M1','LB-R1-M1'], feedType:['loser','winner'], day:2 },
    { id:'LB-R2-M2', round:'LB-R2', p1:null,p2:null, feedFrom:['WB-R2-M2','LB-R1-M2'], feedType:['loser','winner'], day:2 },
    { id:'LB-R2-M3', round:'LB-R2', p1:null,p2:null, feedFrom:['WB-R2-M3','LB-R1-M3'], feedType:['loser','winner'], day:2 },
    { id:'LB-R2-M4', round:'LB-R2', p1:null,p2:null, feedFrom:['WB-R2-M4','LB-R1-M4'], feedType:['loser','winner'], day:2 },
    { id:'LB-R2-M5', round:'LB-R2', p1:null,p2:null, feedFrom:['WB-R2-M6','LB-R1-M5'], feedType:['loser','winner'], day:2 },
    { id:'LB-R2-M6', round:'LB-R2', p1:null,p2:null, feedFrom:['WB-R2-M7','LB-R1-M6'], feedType:['loser','winner'], day:2 },
    { id:'LB-R2-M7', round:'LB-R2', p1:null,p2:null, feedFrom:['WB-R2-M8',null],        feedType:['loser','bye'],   day:2, isBye:true },
  ];

  // LB R3: L(WB-QF) vs W(LB-R2) — 4 matches, note LB-R2-M7 bye winner goes here
  // L(WB-QF-M1)+W(LB-R2-M1)→LB-R3-M1, L(WB-QF-M2)+W(LB-R2-M2)→LB-R3-M2,
  // L(WB-QF-M3)+W(LB-R2-M3)→LB-R3-M3, L(WB-QF-M4)+W(LB-R2-M4)→LB-R3-M4
  // Note: LB-R2-M5,M6,M7 winners feed into LB-R3 differently per the xlsx loser bracket sheet
  // From xlsx LB sheet: LB-R3-M1: L(QF-M1)+W(LB-R2-M1), LB-R3-M2: L(QF-M2)+W(LB-R2-M2)
  //                     LB-R3-M3: L(QF-M3)+W(LB-R2-M3), LB-R3-M4: L(QF-M4)+W(LB-R2-M4)
  const lbR3 = [
    { id:'LB-R3-M1', round:'LB-R3', p1:null,p2:null, feedFrom:['WB-QF-M1','LB-R2-M1'], feedType:['loser','winner'], day:3 },
    { id:'LB-R3-M2', round:'LB-R3', p1:null,p2:null, feedFrom:['WB-QF-M2','LB-R2-M2'], feedType:['loser','winner'], day:3 },
    { id:'LB-R3-M3', round:'LB-R3', p1:null,p2:null, feedFrom:['WB-QF-M3','LB-R2-M3'], feedType:['loser','winner'], day:3 },
    { id:'LB-R3-M4', round:'LB-R3', p1:null,p2:null, feedFrom:['WB-QF-M4','LB-R2-M4'], feedType:['loser','winner'], day:3 },
  ];

  // LB R4 (LB Semifinals in xlsx labeling)
  const lbR4 = [
    { id:'LB-R4-M1', round:'LB-R4', p1:null,p2:null, feedFrom:['LB-R3-M1','LB-R3-M2'], feedType:['winner','winner'], day:3 },
    { id:'LB-R4-M2', round:'LB-R4', p1:null,p2:null, feedFrom:['LB-R3-M3','LB-R3-M4'], feedType:['winner','winner'], day:3 },
  ];

  // LB SF (feeds from WB-SF losers)
  const lbSF = [
    { id:'LB-SF-M1', round:'LB-SF', p1:null,p2:null, feedFrom:['WB-SF-M1','LB-R4-M1'], feedType:['loser','winner'], day:3 },
    { id:'LB-SF-M2', round:'LB-SF', p1:null,p2:null, feedFrom:['WB-SF-M2','LB-R4-M2'], feedType:['loser','winner'], day:3 },
  ];

  // LB Final
  const lbFinal = [
    { id:'LB-F', round:'LB-F', p1:null,p2:null, feedFrom:['LB-SF-M1','LB-SF-M2'], feedType:['winner','winner'], day:3 },
  ];

  // Grand Final
  const grandFinal = [
    { id:'GF', round:'GF', p1:null,p2:null, feedFrom:['WB-F','LB-F'], feedType:['winner','winner'], day:3,
      note:'WB champion needs 1 loss. LB champion needs 1 win.' }
  ];

  return [
    ...wbR1, ...wbR2Defs, ...wbQF, ...wbSF, ...wbFinal,
    ...lbR1, ...lbR2, ...lbR3, ...lbR4, ...lbSF, ...lbFinal,
    ...grandFinal
  ];
}

function buildMatchMap(matches) {
  const map = {};
  matches.forEach(m => { map[m.id] = m; });
  return map;
}

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

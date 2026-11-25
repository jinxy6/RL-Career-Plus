'use strict';
const assert = require('assert');
const { wrapEngine, sanitizeEpicCmd, buildEarnedTitles, resolveUserTitle } = require('./inproc');

function addDays(dateStr, d) {
  const dt = new Date(dateStr + 'T00:00:00Z');
  dt.setUTCDate(dt.getUTCDate() + d);
  return dt.toISOString().slice(0, 10);
}
function daysBetween(a, b) {
  return Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 86400000);
}

const mockState = {
  currentDate: '2027-01-01',
  userTeamId: 1,
  training: { lastDate: null, slots: [] },
  scouts: { reports: { 10: { potLo: 78, potHi: 82 } } },
  teams: [{ id: 1, name: 'TestClub', budget: 100000, playerIds: [10, 11] }],
  players: [
    { id: 10, name: 'AtomiK', teamId: 1, age: 22, peakAge: 23, rating: 78, ratingExact: 78.55, potential: 82, morale: 72, form: 0, retired: false, isUser: false },
    { id: 11, name: 'CappedVet', teamId: 1, age: 25, peakAge: 25, rating: 81, ratingExact: 81.0, potential: 80, morale: 80, form: 0, retired: false, isUser: false },
  ],
};

let advanceCalls = 0;
let runCalls = 0;
const mockEngine = {
  TRAIN_COOLDOWN_DAYS: 7,
  addDays,
  daysBetween,
  isPlayerCareer: () => false,
  trainableIds: (st) => st.players.filter((p) => p.teamId === st.userTeamId && !p.retired && !p.isUser).map((p) => p.id),
  trainingHeld: (st) => Object.fromEntries(st.players.filter((p) => p.ratingExact >= Math.min(99, p.potential + 1)).map((p) => [p.id, 'ceiling'])),
  playerById: (st, id) => st.players.find((p) => p.id === id),
  teamById: (st, id) => st.teams.find((t) => t.id === id),
  trainingPlan: (st) => Array.from({ length: 5 }, (_, i) => ({ pid: st.training.slots[i]?.pid ?? null })),
  setTrainingSlot: (st, i, pid) => { st.training.slots[i] = { pid }; return { ok: true }; },
  trainingReady: (st) => !st.training.lastDate || daysBetween(st.training.lastDate, st.currentDate) >= 7,
  playerView: (_st, p) => ({ id: p.id, potKnown: true, potLo: 78, potHi: 82, reach: 82 }),
  runTraining: (st) => {
    if (st.training.lastDate && daysBetween(st.training.lastDate, st.currentDate) < 7) {
      return { ok: false, error: 'cooldown' };
    }
    runCalls++;
    for (const s of st.training.slots) {
      if (!s || s.pid == null) continue;
      const p = st.players.find((x) => x.id === s.pid);
      if (p && p.ratingExact < p.potential + 1) {
        p.ratingExact += 0.1;
        p.rating = Math.floor(p.ratingExact);
      }
    }
    st.training.lastDate = st.currentDate;
    return { ok: true };
  },
  advance: (st, _rand, mode) => {
    advanceCalls++;
    assert.strictEqual(mode, 'day');
    st.currentDate = addDays(st.currentDate, 1);
    return daysBetween('2027-01-01', st.currentDate) >= 14 ? { stopped: 'matchday', fixtureId: 1 } : { stopped: 'day' };
  },
  nextUserSeries: (st) => { st.currentDate = addDays(st.currentDate, 15); return { id: 2 }; },
  simulateFixture: () => {},
  simulateNextGame: () => ({}),
  startNextSeason: (st) => { st.currentDate = addDays(st.currentDate, 7); },
  placeBet: () => ({ ok: false, error: 'passthrough' }),
};

wrapEngine(mockEngine);

// 1. Editing player potential updates player, peakAge, scout report, AND playerView()
assert.strictEqual(mockEngine.placeBet(mockState, 'cp:' + JSON.stringify({ op: 'player', pid: 10, rating: 78.55, potential: 99, morale: 72, form: 0, age: 22 })).ok, true);
assert.strictEqual(mockState.players[0].potential, 99);
assert(mockState.players[0].peakAge >= 37, 'peakAge must be raised so settleCeiling/reachableCeiling keep 99 potential');
assert.strictEqual(mockState.scouts.reports[10].potHi, 99);
const pv = mockEngine.playerView(mockState, mockState.players[0]);
assert.strictEqual(pv.potLo, 99);
assert.strictEqual(pv.potHi, 99);
assert.strictEqual(pv.reach, 99);

// 2. Multi-day advance('next'): Day 0, Day 7, Day 14 = 3 sessions
const res = mockEngine.advance(mockState, Math.random, 'next');
assert.strictEqual(res.stopped, 'matchday');
assert.strictEqual(advanceCalls, 14);
assert.strictEqual(runCalls, 3);
assert(mockState.training.slots.every((s) => s.pid === 10));
assert.strictEqual(mockState.careerPlus.lastNotice.kind, 'ok');

// 3. Cooldown enforced
mockEngine.advance(mockState, Math.random, 'day');
assert.strictEqual(runCalls, 3);

// 4. Season-tab nextUserSeries catch-up
mockEngine.nextUserSeries(mockState, Math.random, 1);
assert.strictEqual(runCalls, 5);

// 5. All players at potential peak -> peak notice
mockState.players[0].ratingExact = 99.9;
mockState.players[0].rating = 99;
mockEngine.startNextSeason(mockState, Math.random);
assert.strictEqual(runCalls, 5);
assert.strictEqual(mockState.careerPlus.lastNotice.kind, 'peak');
assert(mockState.careerPlus.lastNotice.msg.includes("can't get any better"));

// 6. Epic auth sanitizer preserves -epicuserid when -epicusername has null/control bytes
const dirty = '-AUTH_LOGIN=unused -AUTH_PASSWORD=abc123 -AUTH_TYPE=exchangecode -epicapp=Sugar -epicenv=Prod -EpicPortal -epicusername=1\x0f\x9f\x0f \x05\x00tj -epicuserid=a9c56e181c434c08bc5c1aa655ca181f -epiclocale=en';
const cleaned = sanitizeEpicCmd(dirty);
assert(!cleaned.includes('\x00'), 'must strip null bytes');
assert(cleaned.includes('-epicuserid=a9c56e181c434c08bc5c1aa655ca181f'), 'must keep epicuserid');
assert(cleaned.includes('-epiclocale=en'), 'must keep epiclocale');

// 7. Earned titles only (Worlds, Majors w/ host, World Cup, multi-champ) via Career+ set-title
const userPl = {
  id: 99, name: 'Jinxy', teamId: 1, isUser: true, retired: false,
  titles: [
    { k: 'worlds_champion', y: 2032 },
    { k: 'worlds_champion', y: 2034 },
    { k: 'major_champion', y: 2034, h: 'Paris' },
  ],
};
const titleState = {
  userPlayerId: 99,
  userTeamId: 1,
  players: [userPl],
  teams: [{ id: 1, name: 'Heretics', playerIds: [99] }],
  intl: {
    cups: [{ id: 1, year: 2029, host: 'France', stage: 'done', championId: 90016, squads: { '90016': [99] }, placings: [{ teamId: 90016, place: 1 }] }],
  },
};
const earned = buildEarnedTitles(titleState, userPl, null);
assert(earned.some((t) => t.display === 'FIFAe World Cup 2029 Champion' && t.id === 'ESLMonthlyChampion'), 'must include earned World Cup title with Golden Glow TitleId');
assert(earned.some((t) => t.display === '2-Time World Champion'), 'must include 2-Time World Champion');
assert(earned.some((t) => t.display === 'RLCS 2034 Paris Major Champion'), 'must include Major host name');
assert.strictEqual(mockEngine.placeBet(titleState, 'cp:' + JSON.stringify({ op: 'set-title', key: 'wc:champ:2029' })).ok, true);
assert.strictEqual(resolveUserTitle(titleState, userPl, null).display, 'FIFAe World Cup 2029 Champion');
// Rejects unearned title key
assert.strictEqual(mockEngine.placeBet(titleState, 'cp:' + JSON.stringify({ op: 'set-title', key: 'k:worlds_champion:2099:' })).ok, false);
// Clearing reverts to Auto -> picks highest earned (2-Time World Champion over single Worlds)
assert.strictEqual(mockEngine.placeBet(titleState, 'cp:' + JSON.stringify({ op: 'set-title', key: '' })).ok, true);
assert.strictEqual(titleState.careerPlus.selectedTitle, undefined);
const mockTitlesMod = {
  TIER: { worlds_champion: 14, major_champion: 13 },
  best: () => ({ key: 'k:worlds_champion:2034:', id: 'RLCS_2026_World_Champion', text: 'RLCS 2034 World Champion', display: 'RLCS 2034 World Champion' }),
  choices: () => [
    { key: 'k:worlds_champion:2034:', id: 'RLCS_2026_World_Champion', text: 'RLCS 2034 World Champion', display: 'RLCS 2034 World Champion', kind: 'worlds_champion', year: 2034 },
    { key: 'k:major_champion:2034:Paris', id: 'RLCS_2026_Major_2_Champion', text: 'RLCS 2034 Paris Major Champion', display: 'RLCS 2034 Paris Major Champion', kind: 'major_champion', year: 2034 },
  ],
};
assert.strictEqual(resolveUserTitle(titleState, userPl, mockTitlesMod).display, '2-Time World Champion');

console.log('[PASS] RL Career+ self-check passed (playerView potential fix, cooldown, Season sim, peak notice, Epic auth, earned titles).');

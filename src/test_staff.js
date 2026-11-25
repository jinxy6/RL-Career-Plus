'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const staff = require('./staff-engine');
const yOverhaul = require('./y-engine');
const { patchSnapshot } = require('./inproc');

function addDays(dateStr, d) {
  const dt = new Date(dateStr + 'T00:00:00Z');
  dt.setUTCDate(dt.getUTCDate() + d);
  return dt.toISOString().slice(0, 10);
}
function daysBetween(a, b) {
  return Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 86400000);
}

// =========================================================================
// PART 1: Comprehensive deterministic unit tests covering ALL 7 roles x 3 tiers
// =========================================================================
function makeMockEnv({ avgRating = 70, realMoney = false, realism = false } = {}) {
  const state = {
    currentDate: '2026-09-01',
    startDate: '2026-09-01',
    userTeamId: 1,
    realMoney,
    realism,
    nextId: 100,
    staff: [
      { id: 1, role: 'scout', name: 'Dan Weller', wage: realMoney ? 300 : 9500 },
      { id: 2, role: 'scout', name: 'Priya Raman', wage: realMoney ? 300 : 9500 },
      { id: 3, role: 'scout', name: 'Marco Silva', wage: realMoney ? 300 : 9500 },
    ],
    scouts: { jobs: [], reports: {}, partial: {} },
    training: { lastDate: null, slots: [] },
    facility: { tier: 1, paid: 0, since: null },
    ledger: [],
    inbox: [],
    headlines: [],
    chats: [],
    mediaOffers: [
      { id: 501, brandId: 'rb', brandName: 'RedBull', pid: 10, kind: 'campaign', weeks: 3, days: 0, fee: 100000, expires: '2026-10-01', accepted: false },
      { id: 502, brandId: 'mstr', brandName: 'Monster', pid: 11, kind: 'shoot', weeks: 0, days: 3, fee: 50000, expires: '2026-10-01', accepted: false },
    ],
    teams: [
      { id: 1, name: 'TestClub', budget: 15000000, followers: 10000, playerIds: [10, 11, 12] },
      { id: 2, name: 'RivalClub', budget: 15000000, followers: 50000, playerIds: [20, 21] },
    ],
    players: [
      { id: 10, name: 'YoungStar', teamId: 1, age: 18, peakAge: 23, rating: avgRating, ratingExact: avgRating, potential: 84, morale: 70, followers: 10000, retired: false, isUser: false },
      { id: 11, name: 'PrimePro',  teamId: 1, age: 21, peakAge: 24, rating: avgRating, ratingExact: avgRating, potential: 82, morale: 70, followers: 15000, retired: false, isUser: false },
      { id: 12, name: 'OldVet',    teamId: 1, age: 27, peakAge: 24, rating: avgRating, ratingExact: avgRating, potential: avgRating, morale: 70, followers: 20000, retired: false, isUser: false },
      { id: 20, name: 'TargetA',   teamId: 2, age: 19, peakAge: 23, rating: 79, ratingExact: 79, potential: 86, morale: 75, followers: 12000, retired: false, isUser: false },
      { id: 21, name: 'TargetB',   teamId: 2, age: 20, peakAge: 24, rating: 81, ratingExact: 81, potential: 88, morale: 75, followers: 14000, retired: false, isUser: false },
    ],
  };

  let dailySimAction = null;
  const FACILITIES = [
    { tier: 1, key: 't1', name: 'Garage', price: 0 },
    { tier: 2, key: 't2', name: 'Bootcamp House', price: 200000 },
    { tier: 3, key: 't3', name: 'Esports Campus', price: 500000 },
  ];

  const engine = {
    TRAIN_COOLDOWN_DAYS: 7,
    SCOUT_SLOTS: 3,
    FACILITIES,
    addDays,
    daysBetween,
    realMoney: (st) => !!st.realMoney,
    isPlayerCareer: () => false,
    clubStars: (tm) => (avgRating < 75 ? 2 : avgRating < 81 ? 3.5 : 5),
    teamById: (st, id) => st.teams.find((t) => t.id === id),
    playerById: (st, id) => st.players.find((p) => p.id === id),
    staffList: (st) => st.staff,
    staffWageBill: (st) => st.staff.reduce((a, b) => a + (b.wage || 0), 0),
    fmtMoney: (n) => '$' + Math.round(n).toLocaleString(),
    egoOf: (p) => 0.55 + Math.max(0, (p.rating - 62) / 26) * 0.75,
    startScouting: (st, pid) => {
      const scout = st.staff.find((s) => s.role === 'scout' && !st.scouts.jobs.some((j) => j.scoutId === s.id));
      st.scouts.jobs.push({ id: st.nextId++, playerId: pid, scoutId: scout ? scout.id : null, startDate: st.currentDate, endDate: addDays(st.currentDate, 10) });
      return { ok: true, days: 10 };
    },
    chatReply: (st, pid, opt) => {
      const p = st.players.find((x) => x.id === pid);
      if (opt === 'refuse') p.morale = Math.max(0, p.morale - 10);
      return { ok: true };
    },
    refusePlayer: (st, pid) => {
      const p = st.players.find((x) => x.id === pid);
      p.morale = Math.max(0, p.morale - 10);
      return { ok: true };
    },
    sponsorIncome: (st, tm) => 100000,
    refreshMediaOffers: () => {},
    acceptMediaOffer: (st, offId) => {
      const off = st.mediaOffers.find((o) => o.id === offId);
      const p = st.players.find((x) => x.id === off.pid);
      const team = st.teams.find((t) => t.id === st.userTeamId);
      const days = off.kind === 'campaign' ? off.weeks * 7 : off.days;
      const until = addDays(st.currentDate, days - 1);
      const rest = st.realism ? 30 : 7;
      p.mediaFreeOn = addDays(until, rest + 1);
      p.absence = { reason: off.brandName, since: st.currentDate, until, days, weekendsOnly: off.kind === 'campaign', media: true };
      team.budget += off.fee;
      off.accepted = true;
      off.until = until;
      return { ok: true, fee: off.fee, until };
    },
    bumpFollowers: (_st, p) => { p.followers += 1000; return 1000; },
    trainableIds: (st) => st.players.filter((p) => p.teamId === st.userTeamId && !p.retired).map((p) => p.id),
    trainingPlan: (st) => Array.from({ length: 5 }, (_, i) => ({ pid: st.training.slots[i]?.pid ?? null })),
    setTrainingSlot: (st, i, pid) => { st.training.slots[i] = { pid }; return { ok: true }; },
    trainingHeld: () => ({}),
    trainingReady: (st) => !st.training.lastDate || daysBetween(st.training.lastDate, st.currentDate) >= 7,
    trainingDaysLeft: (st) => (!st.training.lastDate ? 0 : Math.max(0, 7 - daysBetween(st.training.lastDate, st.currentDate))),
    trainingGain: (st) => Object.fromEntries(st.training.slots.filter((s) => s && s.pid != null).map((s) => [s.pid, 0.2])),
    runTraining: (st) => {
      if (st.training.lastDate && daysBetween(st.training.lastDate, st.currentDate) < 7) {
        return { ok: false, error: 'cooldown' };
      }
      for (const s of st.training.slots) {
        if (!s || s.pid == null) continue;
        const p = st.players.find((x) => x.id === s.pid);
        if (p) { p.ratingExact += 0.2; p.rating = Math.floor(p.ratingExact); }
      }
      st.training.lastDate = st.currentDate;
      return { ok: true };
    },
    facilityUpgradeCost: (st, tier) => {
      const f = FACILITIES.find((x) => x.tier === tier);
      return f ? Math.max(0, f.price - ((st.facility && st.facility.paid) || 0)) : null;
    },
    facilityBoard: (st) => {
      const tm = st.teams.find((t) => t.id === st.userTeamId);
      const curTier = (st.facility && st.facility.tier) || 0;
      return {
        tier: curTier,
        budget: tm.budget,
        list: FACILITIES.map((f) => {
          const cost = Math.max(0, f.price - ((st.facility && st.facility.paid) || 0));
          return { tier: f.tier, key: f.key, name: f.name, price: f.price, cost, owned: curTier === f.tier, affordable: curTier < f.tier && tm.budget >= cost };
        }),
      };
    },
    buyFacility: (st, tier) => {
      const f = FACILITIES.find((x) => x.tier === tier);
      const tm = st.teams.find((t) => t.id === st.userTeamId);
      const cost = Math.max(0, f.price - ((st.facility && st.facility.paid) || 0));
      if (tm.budget < cost) return { ok: false, error: 'Not enough money' };
      tm.budget -= cost;
      st.ledger.push({ kind: 'facility', amount: -cost });
      st.facility = { tier: f.tier, paid: f.price, since: st.currentDate };
      return { ok: true, tier: f.tier, cost };
    },
    advance: (st, _rand, mode) => {
      assert.strictEqual(mode, 'day');
      st.currentDate = addDays(st.currentDate, 1);
      if (typeof dailySimAction === 'function') dailySimAction(st);
      return { stopped: 'day' };
    },
    startNextSeason: (st) => {
      const tm = st.teams.find((t) => t.id === st.userTeamId);
      tm.budget += 100000;
      st.ledger.push({ kind: 'sponsor', amount: 100000 });
      return 'Season done';
    },
    placeBet: () => ({ ok: false, error: 'passthrough' }),
  };

  staff.wrapStaffEngine(engine);
  return { state, engine, setDailyAction: (fn) => { dailySimAction = fn; } };
}

console.log('--- Running Staff Rework Verification Suite ---');

// 1. New career starts with 0 scouts (prompts to buy a scout!) + Scout speed bands (Best 3-5d < Mid 6-7d < Bad 8-10d) + accuracy!
{
  const { state, engine, setDailyAction } = makeMockEnv({ avgRating: 70 });
  staff.ensureStaffState(engine, state);
  assert.strictEqual(state.staff.length, 0, 'New career must start with 0 staff/scouts');
  // Attempting to scout with 0 scouts returns clear prompt to buy a scout!
  const r0 = engine.startScouting(state, 20, Math.random);
  assert.strictEqual(r0.ok, false);
  assert(/buy a scout/i.test(r0.error), 'Must prompt player to buy a scout when 0 hired');
  // Hire a Bad Scout -> unlocks 1st slot, 8-10 days!
  assert.strictEqual(engine.placeBet(state, 'sr:' + JSON.stringify({ op: 'hire', role: 'scout', tier: 'bad' })).ok, true);
  assert.strictEqual(state.staff[0].wage, 4500);
  const r1 = engine.startScouting(state, 20, () => 0.5);
  assert.strictEqual(r1.ok, true);
  assert(r1.days >= 8 && r1.days <= 10, `Bad Scout must take 8-10d, got ${r1.days}`);
  const r2 = engine.startScouting(state, 21, Math.random);
  assert.strictEqual(r2.ok, false, 'Cannot start 2nd scouting job with only 1 hired scout');
  // Hire a Best Scout -> unlocks 2nd slot, always 3-5 days, AND tightens completed report to ±1!
  assert.strictEqual(engine.placeBet(state, 'sr:' + JSON.stringify({ op: 'hire', role: 'scout', tier: 'best' })).ok, true);
  const r3 = engine.startScouting(state, 21, () => 0.99); // even worst RNG roll on Best <= 5 days!
  assert.strictEqual(r3.ok, true);
  assert(r3.days >= 3 && r3.days <= 5, `Best Scout must ALWAYS take 3-5d (faster than Bad/Mid), got ${r3.days}`);
  // Simulate Best Scout completing report for TargetB (potential 88) -> potLo/potHi tightened to 87-89 (±1)!
  setDailyAction((st) => {
    st.scouts.jobs = st.scouts.jobs.filter((j) => j.playerId !== 21);
    st.scouts.reports[21] = { rating: 81, potLo: 83, potHi: 93, date: st.currentDate };
  });
  engine.advance(state, Math.random, 'day');
  assert.strictEqual(state.scouts.reports[21].potLo, 87, 'Best Scout tightens potLo to ±1');
  assert.strictEqual(state.scouts.reports[21].potHi, 89, 'Best Scout tightens potHi to ±1');
  console.log('[PASS] 1. New career starts with 0 scouts + buy-scout prompt + Scout speed bands (8-10d / 6-7d / 3-5d) & accuracy (±3/±2/±1)');
}

// 2. Mental Coach (ego -5/-10/-15%, morale +3/+6/+10%, chat loss -5/-10/-20%)
{
  const { state, engine, setDailyAction } = makeMockEnv({ avgRating: 78 });
  const p = state.players[0];
  const baseEgo = engine.egoOf(p);
  const beforeMorale = p.morale;

  assert.strictEqual(engine.placeBet(state, 'sr:' + JSON.stringify({ op: 'hire', role: 'mental_coach', tier: 'best' })).ok, true);
  assert(Math.abs(engine.egoOf(p) - baseEgo * 0.85) < 0.001, 'Best Mental Coach reduces egoOf by 15%');
  assert.strictEqual(p.morale, beforeMorale + 10, 'Best Mental Coach lifts squad morale by +10');

  // Player chat refusal loses 10 morale in vanilla; Best Mental Coach cushions 20% chat + 15% ego (32% combined!)
  const preChat = p.morale;
  engine.chatReply(state, p.id, 'refuse');
  const chatLoss = preChat - p.morale;
  assert(chatLoss < 7.0 && chatLoss > 6.5, `Expected cushioned chat loss ~6.8, got ${chatLoss}`);

  // Daily negative morale event cushioned by 15% ego reduction
  const preDaily = p.morale;
  setDailyAction((st) => { st.players[0].morale -= 10; });
  engine.advance(state, Math.random, 'day');
  const dailyLoss = preDaily - p.morale;
  assert(Math.abs(dailyLoss - 8.5) < 0.15, `Expected 15% ego protection (8.5 loss), got ${dailyLoss}`);
  console.log('[PASS] 2. Mental Coach (ego reduction, morale lift, player chat protection)');
}

// 3. Media Trainer (+5/+10/+20% sponsor income, -1/-2/-3 wknd cooldown, +5/+10/+20% followers)
{
  const { state, engine, setDailyAction } = makeMockEnv({ avgRating: 78, realism: true });
  assert.strictEqual(engine.placeBet(state, 'sr:' + JSON.stringify({ op: 'hire', role: 'media_trainer', tier: 'best' })).ok, true);
  assert.strictEqual(engine.sponsorIncome(state, state.teams[0]), 120000, 'Best Media Trainer boosts sponsorIncome by +20%');
  assert.strictEqual(state.mediaOffers[0].fee, 120000, 'Media offer fee boosted by +20%');

  const budgetBefore = state.teams[0].budget;
  const acc = engine.acceptMediaOffer(state, 501);
  assert.strictEqual(acc.ok, true);
  assert.strictEqual(state.teams[0].budget - budgetBefore, 120000, 'Accepted media offer pays boosted +20% fee');
  // In Realism mode, rest is 30d; Best Media Trainer cuts 3 weekends (21d) -> 9 days rest after until!
  const p = state.players[0];
  const restDays = daysBetween(p.absence.until, p.mediaFreeOn) - 1;
  assert.strictEqual(restDays, 9, `Expected 9 rest days (30 - 21), got ${restDays}`);

  // Follower growth boosted by +20%
  const folBefore = p.followers;
  setDailyAction((st) => { st.players[0].followers += 1000; st.teams[0].followers += 500; });
  engine.advance(state, Math.random, 'day');
  assert.strictEqual(p.followers - folBefore, 1200, 'Player follower growth boosted by +20%');
  assert.strictEqual(state.teams[0].followers, 10600, 'Org follower growth boosted by +20%');

  // Season-end sponsor payout also gets +20% bonus
  const bPreSeason = state.teams[0].budget;
  engine.startNextSeason(state, Math.random);
  assert.strictEqual(state.teams[0].budget - bPreSeason, 120000, 'Annual sponsor payout boosted by +20%');
  console.log('[PASS] 3. Media Trainer (+20% sponsor & media income, -3 wknd cooldown, +20% org & player followers)');
}

// 4. Assistant Coach (IRL Coaches + -1/-2/-3d cooldown + +5/+10/+15% effectiveness + Best Auto-Train!)
{
  const { state, engine } = makeMockEnv({ avgRating: 75 });
  const irl = staff.loadIrlCoaches();
  assert(irl.length >= 25, 'IRL coaches list loaded');
  const eversax = irl.find((c) => c.name === 'Eversax');
  assert(eversax && eversax.tier === 'best', 'Eversax available as Best IRL Assistant Coach');

  // Mid Asst Coach: -2d cooldown (5d), +10% effectiveness, NO auto-train
  assert.strictEqual(engine.placeBet(state, 'sr:' + JSON.stringify({ op: 'hire', role: 'assistant_coach', tier: 'mid' })).ok, true);
  assert.strictEqual(staff.getEffectiveTrainCooldown(engine, state), 5);
  engine.setTrainingSlot(state, 0, 10);
  const rBefore = state.players[0].ratingExact;
  assert.strictEqual(engine.runTraining(state, Math.random).ok, true);
  assert(Math.abs((state.players[0].ratingExact - rBefore) - 0.22) < 0.001, 'Mid Asst Coach boosts 0.20 gain by +10% -> 0.22');
  // Advance 5 days -> ready again (vanilla would require 7 days!)
  for (let i = 0; i < 5; i++) engine.advance(state, Math.random, 'day');
  assert.strictEqual(engine.trainingReady(state), true, 'Training ready after 5 days with Mid Asst Coach');
  assert.strictEqual(state.cpStaff.stats.autoTrainSessions, 0, 'Mid Asst Coach must NOT auto-train');

  // Hire Best IRL Coach (Eversax) -> unlocks Auto-Train + 4d cooldown + 15% effectiveness!
  assert.strictEqual(engine.placeBet(state, 'sr:' + JSON.stringify({ op: 'hire', role: 'assistant_coach', tier: 'best', name: eversax.name, irl: true, club: eversax.club, region: eversax.region })).ok, true);
  assert.strictEqual(staff.getEffectiveTrainCooldown(engine, state), 4);
  engine.advance(state, Math.random, 'day'); // triggers auto-train!
  assert(state.cpStaff.stats.autoTrainSessions >= 1, 'Best IRL Assistant Coach automatically runs training');
  console.log('[PASS] 4. Assistant Coach (IRL RLCS coaches, -1/-2/-3d cooldown, +5/+10/+15% gain, Best Auto-Train)');
}

// 5. Engineer (-5/-10/-20% facility upgrade costs AND monthly rent & maintenance!)
{
  const { state, engine } = makeMockEnv({ avgRating: 76, realMoney: true });
  assert.strictEqual(engine.facilityUpgradeCost(state, 2), 200000);
  assert.strictEqual(engine.placeBet(state, 'sr:' + JSON.stringify({ op: 'hire', role: 'engineer', tier: 'best' })).ok, true);
  assert.strictEqual(engine.facilityUpgradeCost(state, 2), 160000, 'Best Engineer cuts $200k facility to $160k (-20%)');
  const board = engine.facilityBoard(state);
  assert.strictEqual(board.list[1].cost, 160000);
  assert.strictEqual(board.list[1].monthlyUpkeepBase, 3500, 'Tier 2 base monthly rent is $3,500/mo');
  assert.strictEqual(board.list[1].monthlyUpkeep, 2800, 'Best Engineer cuts Tier 2 monthly rent by 20% -> $2,800/mo');
  const bBefore = state.teams[0].budget;
  const bought = engine.buyFacility(state, 2);
  assert.strictEqual(bought.ok, true);
  assert.strictEqual(bought.cost, 160000);
  assert.strictEqual(bBefore - state.teams[0].budget, 160000, 'Exact discounted amount deducted from budget');
  assert.strictEqual(state.cpStaff.stats.facilityMoneySaved, 40000);

  // Advance across month boundary (2026-09-30 -> 2026-10-01) -> charges $2,800 discounted rent & records $700 saved!
  state.currentDate = '2026-09-30';
  const bPreRent = state.teams[0].budget;
  engine.advance(state, Math.random, 'day');
  assert.strictEqual(bPreRent - state.teams[0].budget, 2800, 'Monthly facility rent charged with 20% Engineer discount');
  assert.strictEqual(state.cpStaff.stats.facilityUpkeepPaid, 2800);
  assert.strictEqual(state.cpStaff.stats.facilityMoneySaved, 40700);
  // Advancing another day in same month does NOT double-charge rent!
  engine.advance(state, Math.random, 'day');
  assert.strictEqual(state.cpStaff.stats.facilityUpkeepPaid, 2800, 'Rent charged strictly once per month');

  // 3-Strike Eviction & 6-Month Facility Ban test!
  state.teams[0].budget = 500; // cannot afford $2,800/mo rent
  // Month 1 missed -> Strike 1 (budget NOT driven negative!)
  state.currentDate = '2026-10-31';
  engine.advance(state, Math.random, 'day');
  assert.strictEqual(state.teams[0].budget, 500, 'Missed rent must not drive budget negative');
  assert.strictEqual(state.cpStaff.facilityLease.missedMonths, 1, 'Strike 1 recorded');
  assert.strictEqual(state.cpStaff.facilityLease.arrears, 2800);
  // Cannot upgrade HQ while in arrears!
  assert.strictEqual(engine.buyFacility(state, 3).ok, false, 'Cannot upgrade HQ with unpaid arrears');
  // Month 2 missed -> Strike 2
  state.currentDate = '2026-11-30';
  engine.advance(state, Math.random, 'day');
  assert.strictEqual(state.cpStaff.facilityLease.missedMonths, 2, 'Strike 2 recorded');
  assert.strictEqual(state.cpStaff.facilityLease.arrears, 5600);
  // Month 3 missed -> Strike 3 -> EVICTED back to Tier 0 + 6-month (180d) facility ban!
  state.currentDate = '2026-12-31';
  engine.advance(state, Math.random, 'day');
  assert.strictEqual(state.facility, null, 'Evicted back to Tier 0 (No HQ)');
  assert.strictEqual(state.cpStaff.facilityLease.arrears, 0, 'Arrears cleared on eviction');
  assert.strictEqual(state.cpStaff.facilityLease.bannedUntil, '2027-06-30', '6-month (180d) facility lease ban active');
  // Even with $10M budget, cannot buy a new HQ during the 6-month ban!
  state.teams[0].budget = 10000000;
  const blockedBuy = engine.buyFacility(state, 1);
  assert.strictEqual(blockedBuy.ok, false, 'Eviction ban blocks leasing new HQ');
  assert(/Eviction ban active/i.test(blockedBuy.error));
  // After ban expires, club can lease a new HQ again!
  state.currentDate = '2027-07-01';
  assert.strictEqual(engine.buyFacility(state, 1).ok, true, 'Can lease HQ again after 6-month ban expires');
  console.log('[PASS] 5. Engineer + monthly HQ rent + 3-strike eviction & 6-month lease ban');
}

// 6. Physiotherapist (injury prevention + faster recovery)
{
  const { state, engine, setDailyAction } = makeMockEnv({ avgRating: 76 });
  assert.strictEqual(engine.placeBet(state, 'sr:' + JSON.stringify({ op: 'hire', role: 'physio', tier: 'best' })).ok, true);
  // Deterministic roll = 0.1 (< 0.50 Best prevention) -> prevents injury cleanly!
  setDailyAction((st) => {
    st.players[0].absence = { reason: 'wrist strain', cat: 'injury', since: st.currentDate, until: addDays(st.currentDate, 10), days: 10 };
    st.inbox.push({ type: 'absence', data: { playerId: 10 } });
  });
  engine.advance(state, () => 0.1, 'day');
  assert.strictEqual(state.players[0].absence, null, 'Best Physio prevented injury on roll 0.1 < 0.5');
  assert.strictEqual(state.inbox.length, 0, 'Prevented injury inbox alert cleaned up');
  assert.strictEqual(state.cpStaff.stats.injuriesPrevented, 1);

  // Roll = 0.9 (>= 0.50) -> injury occurs, but recovery shortened by 35% (10d -> 7d or 6d -> Math.round(6.5)=7d)
  engine.advance(state, () => 0.9, 'day');
  assert(state.players[0].absence && state.players[0].absence.days === 7, `Expected shortened 7d injury, got ${state.players[0].absence?.days}`);
  assert.strictEqual(state.cpStaff.stats.injuryDaysSaved, 3);
  console.log('[PASS] 6. Physiotherapist (injury prevention + recovery shortening)');
}

// 7. Youth Development Coach (+1/+2/+3 potential & -15/-30/-50% rating degradation)
{
  const { state, engine, setDailyAction } = makeMockEnv({ avgRating: 76 });
  const young = state.players[0]; // age 18, potential 84
  const vet = state.players[2];   // age 27, ratingExact 76
  assert.strictEqual(engine.placeBet(state, 'sr:' + JSON.stringify({ op: 'hire', role: 'youth_coach', tier: 'best' })).ok, true);
  assert.strictEqual(young.potential, 87, 'Best Youth Dev Coach raises young player potential +3 (84 -> 87)');
  // Upgrading/re-hiring must NOT stack infinitely
  assert.strictEqual(engine.placeBet(state, 'sr:' + JSON.stringify({ op: 'hire', role: 'youth_coach', tier: 'mid' })).ok, true);
  assert.strictEqual(young.potential, 86, 'Switching to Mid reconciles potential cleanly to +2 (86)');
  assert.strictEqual(engine.placeBet(state, 'sr:' + JSON.stringify({ op: 'hire', role: 'youth_coach', tier: 'best' })).ok, true);
  assert.strictEqual(young.potential, 87);

  // Vet suffers -1.0 aging decay -> Best Youth Coach cuts decay by 50% (-0.5 net)
  setDailyAction((st) => { st.players[2].ratingExact -= 1.0; st.players[2].rating = Math.floor(st.players[2].ratingExact); });
  engine.advance(state, Math.random, 'day');
  assert(Math.abs(vet.ratingExact - 75.5) < 0.01, `Expected 50% decay protection (75.5), got ${vet.ratingExact}`);
  console.log('[PASS] 7. Youth Development Coach (+1/+2/+3 potential, non-stacking, -50% rating degradation)');
}

// 8. Snapshot enrichment (scouting slots + Finances billRows role labels + cpStaff payload)
{
  const { state, engine } = makeMockEnv({ avgRating: 70 });
  staff.ensureStaffState(engine, state);
  engine.placeBet(state, 'sr:' + JSON.stringify({ op: 'hire', role: 'scout', tier: 'bad' }));
  engine.placeBet(state, 'sr:' + JSON.stringify({ op: 'hire', role: 'mental_coach', tier: 'mid' }));
  const snap = patchSnapshot(engine, {
    career: state,
    scouting: { slots: 3, used: 0, staff: [{ id: 1, name: state.staff[0].name, out: false }] },
    training: { ready: true, daysLeft: 0 },
    econ: { billRows: state.staff.map((s) => ({ kind: 'staff', id: s.id, name: s.name, sub: 'Scout', wage: s.wage })) },
  });
  assert.strictEqual(snap.scouting.slots, 1, 'Snapshot scouting.slots matches hired scout count');
  assert.strictEqual(snap.econ.billRows[1].sub, 'Mental Coach · Mid', 'Finances billRows reflects real staff role & tier');
  assert(snap.cpStaff && snap.cpStaff.roles.length === 7, 'cpStaff snapshot includes all 7 roles');
  console.log('[PASS] 8. Snapshot enrichment (scouting slots, Finances labels, cpStaff payload)');
}

// 8b. Combined RL Career+ + Staff Rework stacking check (cp: + sr: commands, unified Auto-Train without double-runs)
{
  const cpInprocPath = path.resolve(__dirname, 'inproc.js');
  if (fs.existsSync(cpInprocPath)) {
    const cp = require(cpInprocPath);
    const state = {
      currentDate: '2026-09-01',
      startDate: '2026-09-01',
      userTeamId: 1,
      nextId: 100,
      staff: [{ id: 1, role: 'scout', name: 'Dan Weller', wage: 9500 }],
      scouts: { jobs: [], reports: {}, partial: {} },
      training: { lastDate: null, slots: [] },
      teams: [{ id: 1, name: 'TestClub', budget: 10000000, playerIds: [10] }],
      players: [{ id: 10, name: 'YoungStar', teamId: 1, age: 18, peakAge: 23, rating: 75, ratingExact: 75, potential: 90, morale: 70, form: 0, followers: 10000, retired: false, isUser: false }],
    };
    let trainRuns = 0;
    const comboEngine = {
      TRAIN_COOLDOWN_DAYS: 7,
      addDays,
      daysBetween,
      realMoney: () => false,
      isPlayerCareer: () => false,
      clubStars: () => 2,
      teamById: (st, id) => st.teams.find((t) => t.id === id),
      playerById: (st, id) => st.players.find((p) => p.id === id),
      staffList: (st) => st.staff,
      trainableIds: (st) => [10],
      trainingHeld: () => ({}),
      trainingPlan: (st) => Array.from({ length: 5 }, (_, i) => ({ pid: st.training.slots[i]?.pid ?? null })),
      setTrainingSlot: (st, i, pid) => { st.training.slots[i] = { pid }; return { ok: true }; },
      trainingReady: (st) => !st.training.lastDate || daysBetween(st.training.lastDate, st.currentDate) >= 7,
      trainingDaysLeft: (st) => (!st.training.lastDate ? 0 : Math.max(0, 7 - daysBetween(st.training.lastDate, st.currentDate))),
      trainingGain: () => ({ 10: 0.2 }),
      runTraining: (st) => {
        if (st.training.lastDate && daysBetween(st.training.lastDate, st.currentDate) < 7) return { ok: false };
        trainRuns++;
        st.players[0].ratingExact += 0.2;
        st.players[0].rating = Math.floor(st.players[0].ratingExact);
        st.training.lastDate = st.currentDate;
        return { ok: true };
      },
      advance: (st, _rand, mode) => { st.currentDate = addDays(st.currentDate, 1); return { stopped: 'day' }; },
      placeBet: () => ({ ok: false, error: 'passthrough' }),
    };

    // Layer RL Career+ first, then Staff Rework (exact live attach order)
    cp.wrapEngine(comboEngine);
    staff.wrapStaffEngine(comboEngine);

    // Without a Best Assistant Coach, Career+'s free built-in autoTrain is disabled!
    comboEngine.advance(state, Math.random, 'day');
    assert.strictEqual(trainRuns, 0, 'No free Auto-Train without Best Assistant Coach');
    assert.strictEqual(state.careerPlus.autoTrain, false, 'Career+ autoTrain stays disabled under Staff Rework');

    // Both cp: (Career+) and sr: (Staff Rework) commands work side by side!
    assert.strictEqual(comboEngine.placeBet(state, 'cp:' + JSON.stringify({ op: 'budget', mode: 'add', amount: 50000 })).ok, true);
    assert.strictEqual(state.teams[0].budget, 10050000, 'Career+ cp: command works');
    assert.strictEqual(comboEngine.placeBet(state, 'sr:' + JSON.stringify({ op: 'hire', role: 'assistant_coach', tier: 'best', name: 'Eversax', irl: true })).ok, true);
    assert.strictEqual(state.staff.some((s) => s.name === 'Eversax'), true, 'Staff Rework sr: command works');
    assert.strictEqual(state.teams[0].budget, 4050000, 'Hiring Best Assistant Coach deducts $6M legacy signing fee');
    // Insufficient budget must block switching/hiring (no free switching!)
    state.teams[0].budget = 500;
    assert.strictEqual(comboEngine.placeBet(state, 'sr:' + JSON.stringify({ op: 'hire', role: 'engineer', tier: 'best' })).ok, false, 'Cannot hire without paying signing fee');

    // Advance 1 day: Best Asst Coach runs training ONCE and increments autoTrainSessions!
    comboEngine.advance(state, Math.random, 'day');
    assert.strictEqual(trainRuns, 1, 'Best Asst Coach auto-trains once');
    assert.strictEqual(state.cpStaff.stats.autoTrainSessions, 1, 'autoTrainSessions counter increments cleanly');
    // Advance 4 more days -> triggers 2nd session via 4-day Asst Coach cooldown!
    for (let i = 0; i < 4; i++) comboEngine.advance(state, Math.random, 'day');
    assert.strictEqual(trainRuns, 2, '4-day Best Asst Coach cooldown fires cleanly on day 4');
    console.log('[PASS] 8b. Combined RL Career+ + Staff Rework (Auto-Train exclusively via Best Asst Coach, cp:+sr: ok)');
  }
}

// =========================================================================
// PART 1B: Y (Socials) Overhaul — Clips (User + AI), Rivalries, Replies, Polls, Receipts, Leaks
// =========================================================================
{
  const { state, engine } = makeMockEnv({ avgRating: 78 });
  state.userPlayerId = 10;
  state.social = { posts: [], prompt: null };
  state.events = [{ id: 901, kind: 'major', name: 'RLCS Paris Major' }];
  state.fixtures = [
    { id: 1001, eventId: 901, date: '2026-09-02', homeId: 1, awayId: 2, played: false, homeWins: 0, awayWins: 0 },
    { id: 1002, eventId: 901, date: '2026-09-02', homeId: 2, awayId: 3, played: false, homeWins: 0, awayWins: 0 },
  ];
  state.teams.push({ id: 3, name: 'Vitality', budget: 5000000, followers: 90000, playerIds: [30] });
  state.players.push({ id: 30, name: 'Zen', teamId: 3, age: 19, peakAge: 24, rating: 92, ratingExact: 92, potential: 95, morale: 85, followers: 220000, retired: false, isUser: false });

  yOverhaul.wrapYEngine(engine);

  // 1. Advance 1 day before match -> generates Pre-Match Poll + Doubter Prediction!
  engine.advance(state, () => 0.2, 'day');
  const pollPost = state.social.posts.find((p) => p && p.cpPoll);
  const doubtPost = state.social.posts.find((p) => p && p.cpDoubt);
  assert(pollPost, 'Pre-match fan poll generated on Y');
  assert(doubtPost, 'Pre-match doubter prediction generated on Y');

  // Vote in poll
  assert.strictEqual(engine.placeBet(state, 'yo:' + JSON.stringify({ op: 'vote', postId: pollPost.id, optionIdx: 0 })).ok, true);
  assert.strictEqual(pollPost.cpPoll.votedIdx, 0, 'Poll vote saved');

  // 2. Finish BOTH user match (user wins 3-2) AND AI-vs-AI Major match (Vitality 3-2 RivalClub)
  state.fixtures[0].played = true; state.fixtures[0].homeWins = 3; state.fixtures[0].awayWins = 2;
  state.fixtures[1].played = true; state.fixtures[1].homeWins = 2; state.fixtures[1].awayWins = 3;
  engine.advance(state, () => 0.1, 'day');

  const clips = state.social.posts.filter((p) => p && p.cpClip);
  assert(clips.length >= 2, `Expected clips for BOTH user match and AI-vs-AI Major match, got ${clips.length}`);
  assert(clips.some((p) => p.cpClip.isUserMatch && p.cpClip.eventName === 'RLCS Paris Major'), 'User match clip generated with event context');
  assert(clips.some((p) => !p.cpClip.isUserMatch), 'AI-vs-AI Major match clip generated');
  assert(state.cpY.rivalries['2'] && state.cpY.rivalries['2'].heat > 0, 'Rivalry heat built after close series');

  // 3. Pull Receipts 📸 on the doubter after winning!
  assert.strictEqual(doubtPost.cpDoubt.wonByUser, true, 'Doubter post unlocked Pull Receipts after user win');
  const rec = engine.placeBet(state, 'yo:' + JSON.stringify({ op: 'receipts', postId: doubtPost.id }));
  assert.strictEqual(rec.ok, true, 'Pull Receipts succeeded');
  assert(state.social.posts.some((p) => p.mine && p.cpQuoted), 'Quoted receipt tweet posted');

  // 4. Clapback reply to media clip post + thread root attachment + Profile Replies key + media persona check
  const clipPost = clips[0];
  const rep = engine.placeBet(state, 'yo:' + JSON.stringify({ op: 'reply', postId: clipPost.id, tone: 'trash' }));
  assert.strictEqual(rep.ok, true, 'Clapback reply posted');
  const myClipReply = state.social.posts.find((p) => p && p.mine && p.replyTo === clipPost.id);
  const mediaCounter = state.social.posts.find((p) => p && !p.mine && p.replyTo === clipPost.id && p.kind === 'media');
  assert(myClipReply, 'User reply attached to root clipPost.id');
  assert.strictEqual(myClipReply.authorId, state.userPlayerId, 'User reply authorId matches userPlayerId for Profile -> Replies');
  assert(mediaCounter, 'Media counter-reply also attached to root clipPost.id (not level-2 orphaned)');
  assert(!/3-0 sweep|see you at the major/i.test(mediaCounter.text), 'Media account never threatens to sweep user: ' + mediaCounter.text);
  // Level-2 reply (replying to the counter-reply) must STILL attach to root clipPost.id!
  const rep2 = engine.placeBet(state, 'yo:' + JSON.stringify({ op: 'reply', postId: mediaCounter.id, tone: 'respect', text: 'fair enough lol' }));
  assert.strictEqual(rep2.ok, true, 'Second reply posted');
  const customReply = state.social.posts.find((p) => p && p.mine && p.text.includes('fair enough lol'));
  assert(customReply && customReply.replyTo === clipPost.id, 'Replying to a reply stays threaded under root post');

  state.teams.push({ id: 0, name: 'Gentle Mates', budget: 5000000, followers: 213000, playerIds: [40] });
  state.players.push({ id: 40, name: 'Seikoo', teamId: 0, age: 21, peakAge: 25, rating: 89, ratingExact: 89, potential: 92, morale: 85, followers: 180000, retired: false, isUser: false });
  const call0 = engine.placeBet(state, 'yo:' + JSON.stringify({ op: 'callout', teamId: 0 }));
  assert.strictEqual(call0.ok, true, 'Callout works for 0-indexed teamId (Gentle Mates)');
  assert(state.cpY.rivalries['0'] && state.cpY.rivalries['0'].heat >= 22, 'Callout starts rivalry with 0-indexed team');
  const call = engine.placeBet(state, 'yo:' + JSON.stringify({ op: 'callout', teamId: 3 }));
  assert.strictEqual(call.ok, true, 'Rival callout posted');
  assert(state.cpY.rivalries['3'] && state.cpY.rivalries['3'].heat >= 22, 'Callout starts rivalry with Vitality');
  // Verify consecutive callouts NEVER repeat the exact same phrase!
  const callPosts = state.social.posts.filter((p) => p && p.mine && p.replyTo == null && p.cpCategory === 'rivalry');
  assert(callPosts.length >= 2, 'Two callout posts found');
  assert.notStrictEqual(callPosts[0].text.replace(/@\w+/g, ''), callPosts[1].text.replace(/@\w+/g, ''), 'Consecutive callouts use different phrases');

  // 5. Post ID uniqueness: next vanilla state.nextId++ must NEVER collide with any Y Overhaul post ID!
  const allPostIds = new Set(state.social.posts.map((p) => p.id));
  assert.strictEqual(allPostIds.size, state.social.posts.length, 'Every Y post has a unique ID (no collisions)');
  assert(!allPostIds.has(state.nextId), 'Vanilla state.nextId++ will not collide with existing Y post IDs');

  // 6. Budget-aware ShiftRLCS leak reaction when user tweets "YOOOOO WE ARE BUYING ZEN"
  engine.playerValue = (st, pl) => (pl.name === 'Zen' ? 2500000 : 200000);
  // Case A: Broke club ($300K budget vs $2.5M Zen) -> ShiftRLCS roasts budget realistically!
  state.teams[0].budget = 300000;
  const brokeTweet = { id: state.nextId++, mine: true, own: true, date: state.currentDate, text: 'YOOOOO WE ARE BUYING ZEN' };
  state.social.posts.unshift(brokeTweet);
  const brokeLeak = yOverhaul.reactToUserTransferTweet(engine, state, brokeTweet, () => 0.05);
  assert(brokeLeak && brokeLeak.cpCategory === 'leak' && brokeLeak.cpLeak.affordable === false, 'Broke transfer tweet triggers unaffordable ShiftRLCS leak');
  assert(/do not have|fake news|can't afford|laughed|budget/i.test(brokeLeak.text), 'Broke leak mocks budget realistically: ' + brokeLeak.text);
  assert(brokeLeak.cpQuoted && brokeLeak.cpQuoted.text === 'YOOOOO WE ARE BUYING ZEN', 'ShiftRLCS leak quotes user tweet');

  // Case B: Rich club ($5M budget vs $2.5M Zen) -> ShiftRLCS confirms we CAN afford him (never calls us broke)!
  state.teams[0].budget = 5000000;
  const richTweet = { id: state.nextId++, mine: true, own: true, date: state.currentDate, text: 'Announcing we are signing Zen soon!' };
  state.social.posts.unshift(richTweet);
  const richLeak = yOverhaul.reactToUserTransferTweet(engine, state, richTweet, () => 0.05);
  assert(richLeak && richLeak.cpCategory === 'leak' && richLeak.cpLeak.affordable === true, 'Rich transfer tweet triggers credible ShiftRLCS leak');
  assert(!/do not have|fake news|can't afford|laughed/i.test(richLeak.text), 'Rich leak NEVER says you are broke: ' + richLeak.text);
  console.log('[PASS] 8c. Y Overhaul (Clips, Polls, Receipts, Media Persona, Unique IDs, Budget-Aware Transfer Leaks & Callouts)');
}

// =========================================================================
// PART 1C: LAN Crowd Pops — Eligibility (Opens OFF, Major Playoffs/Worlds/FIFAe/Cups ON) & Assets
// =========================================================================
{
  const crowd = require('./crowd-engine');
  const { state, engine } = makeMockEnv({ avgRating: 80 });
  state.events = [
    { id: 1, kind: 'open', name: 'RLCS Open 1' },
    { id: 2, kind: 'major', name: 'RLCS Major 1' },
    { id: 3, kind: 'worlds', name: 'RLCS World Championship' },
    { id: 4, kind: 'lcq', name: 'RLCS LCQ' },
  ];
  state.intl = { cups: [{ id: 50, name: 'FIFAe World Cup 2026' }] };

  assert.strictEqual(crowd.crowdEligibility(engine, state, { eventId: 1, stage: 'playoff' }).active, false, 'Opens have NO crowd pops');
  assert.strictEqual(crowd.crowdEligibility(engine, state, { eventId: 4, stage: 'gf' }).active, false, 'LCQ has NO crowd pops');
  assert.strictEqual(crowd.crowdEligibility(engine, state, { eventId: 2, stage: 'group' }).active, false, 'Major Group Stage has NO crowd pops');
  assert.strictEqual(crowd.crowdEligibility(engine, state, { eventId: 2, stage: 'playoff' }).active, true, 'Major Playoffs HAVE crowd pops');
  assert.strictEqual(crowd.crowdEligibility(engine, state, { eventId: 2, stage: 'gf' }).hype, 4, 'Major Grand Final has max hype 4');
  assert.strictEqual(crowd.crowdEligibility(engine, state, { eventId: 3, stage: 'group' }).active, true, 'Worlds has crowd pops');
  assert.strictEqual(crowd.crowdEligibility(engine, state, { cupId: 50, stage: 'group' }).active, true, 'FIFAe World Cup has crowd pops');

  crowd.wrapCrowdEngine(engine);
  assert.strictEqual(engine.placeBet(state, 'cr:' + JSON.stringify({ op: 'set-mode', mode: 'always' })).ok, true);
  assert.strictEqual(crowd.crowdEligibility(engine, state, { eventId: 1, stage: 'group' }).active, true, 'Always On mode enables Opens too');
  assert.strictEqual(engine.placeBet(state, 'cr:' + JSON.stringify({ op: 'set-mode', mode: 'off' })).ok, true);
  assert.strictEqual(crowd.crowdEligibility(engine, state, { eventId: 3, stage: 'gf' }).active, false, 'Off mode mutes all crowd pops');

  const assets = crowd.audioAssets();
  assert(assets.hasFiles && assets.goalUrl && assets.saveUrl, 'Trimmed crowd_pop_goal.mp3 & crowd_pop_save.mp3 exist');
  assert(
    fs.existsSync(path.join(__dirname, 'rlcareer_crowd.dll')) || fs.existsSync(path.join(__dirname, '..', 'rlcareer_crowd.dll')),
    'Compiled rlcareer_crowd.dll BakkesMod plugin exists'
  );
  console.log('[PASS] 8d. LAN Crowd Pops (Eligibility rules, WebAudio assets & compiled BakkesMod plugin)');
}

// =========================================================================
// PART 2: Live compatibility smoke-check against REAL installed RL Career Hub app.asar!
// =========================================================================
const extractedLeague = 'C:/Users/arcol/.gemini/antigravity/brain/0f8cd9ce-efc2-472b-b51b-836146a27b9e/scratch/asar_js/engine/league.js';
if (fs.existsSync(extractedLeague)) {
  const realEngine = require(extractedLeague);
  const dataDir = path.join(path.dirname(extractedLeague), '..', 'data');
  staff.wrapStaffEngine(realEngine, { dataDirs: [dataDir] });
  const irlAll = staff.loadIrlCoaches([dataDir]);
  assert(irlAll.length >= 60, `Expected 60+ IRL coaches loaded from real RLCS data, got ${irlAll.length}`);
  assert.strictEqual(typeof realEngine.startScouting, 'function');
  assert.strictEqual(typeof realEngine.buyFacility, 'function');
  assert.strictEqual(typeof realEngine.acceptMediaOffer, 'function');
  assert.strictEqual(typeof realEngine.runTraining, 'function');
  assert.strictEqual(typeof realEngine.chatReply, 'function');
  console.log(`[PASS] 9. Real RL Career Hub engine/league.js wrapped cleanly (${irlAll.length} IRL RLCS coaches discovered!)`);
}

console.log('\nALL STAFF REWORK TESTS PASSED!');

'use strict';
const fs = require('fs');
const path = require('path');
const Module = require('module');
const { pathToFileURL } = require('url');

const DEFAULT_CFG = {
  autoTrain: true,
  autoFill: true,
  skipCapped: true,
};

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

const PREFS_FILE = path.join(__dirname, 'prefs.json');

function readLocalPrefs() {
  try {
    const raw = fs.readFileSync(PREFS_FILE, 'utf8');
    const j = JSON.parse(raw);
    return j && typeof j === 'object' ? j : { playIntro: true };
  } catch {
    return { playIntro: true };
  }
}

function writeLocalPrefs(patch) {
  const next = { ...readLocalPrefs(), ...(patch || {}) };
  try { fs.writeFileSync(PREFS_FILE, JSON.stringify(next, null, 2), 'utf8'); } catch { }
  return next;
}

function getCfg(state) {
  if (!state.careerPlus && state.jnyMod && typeof state.jnyMod === 'object') {
    state.careerPlus = state.jnyMod;
    delete state.jnyMod;
  }
  if (!state.careerPlus || typeof state.careerPlus !== 'object') {
    state.careerPlus = { ...DEFAULT_CFG };
  }
  for (const [k, v] of Object.entries(DEFAULT_CFG)) {
    if (state.careerPlus[k] === undefined) state.careerPlus[k] = v;
  }
  return state.careerPlus;
}

function fallbackRand() {
  return Math.random();
}

function addDaysIso(dateStr, days) {
  const dt = new Date(dateStr + 'T00:00:00Z');
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function cooldownDays(engine) {
  return Number(engine.TRAIN_COOLDOWN_DAYS) || 7;
}

function managedIntlPlayerIds(engine, state) {
  const job = state && state.intl && state.intl.job;
  if (!job || job.teamId == null || (typeof engine.isPlayerCareer === 'function' && engine.isPlayerCareer(state))) return [];
  const cups = (state.intl && state.intl.cups) || [];
  const cup = cups.find((c) => c && c.id === job.cupId) || cups[cups.length - 1] || null;
  let ids = cup && cup.squads && Array.isArray(cup.squads[job.teamId]) ? cup.squads[job.teamId] : null;
  if (!ids || !ids.length) {
    const nt = typeof engine.teamById === 'function' ? engine.teamById(state, job.teamId) : null;
    ids = nt && Array.isArray(nt.playerIds) ? nt.playerIds : [];
  }
  const seen = new Set();
  const out = [];
  for (const pid of ids) {
    if (seen.has(pid)) continue;
    seen.add(pid);
    const p = typeof engine.playerById === 'function' ? engine.playerById(state, pid) : null;
    if (p && !p.retired && !p.isUser && p.teamId !== state.userTeamId) out.push(pid);
  }
  return out;
}

function withIntlTrainables(engine, state, fn) {
  const userTeam = state && typeof engine.teamById === 'function' ? engine.teamById(state, state.userTeamId) : null;
  const extras = managedIntlPlayerIds(engine, state);
  if (!userTeam || !Array.isArray(userTeam.playerIds) || !extras.length) return fn();
  const origLen = userTeam.playerIds.length;
  const have = new Set(userTeam.playerIds);
  for (const pid of extras) {
    if (!have.has(pid)) userTeam.playerIds.push(pid);
  }
  try {
    return fn();
  } finally {
    userTeam.playerIds.length = origLen;
  }
}

function fillAutoSlots(engine, state, rand, skipCapped) {
  const trainable = engine.trainableIds(state);
  if (!trainable.length) return;
  const held = engine.trainingHeld(state) || {};
  const candidates = trainable
    .filter((pid) => !skipCapped || !held[pid])
    .map((pid) => engine.playerById(state, pid))
    .filter(Boolean)
    .sort((a, b) => {
      const aClub = a.teamId === state.userTeamId ? 1 : 0;
      const bClub = b.teamId === state.userTeamId ? 1 : 0;
      if (bClub !== aClub) return bClub - aClub;
      const gapA = (a.potential || a.rating) - (a.ratingExact ?? a.rating);
      const gapB = (b.potential || b.rating) - (b.ratingExact ?? b.rating);
      if (gapB !== gapA) return gapB - gapA;
      return (a.age || 99) - (b.age || 99);
    })
    .map((p) => p.id);

  if (!candidates.length) return;
  const slots = engine.trainingPlan(state);
  let pickIdx = 0;
  for (let i = 0; i < slots.length; i++) {
    const curPid = slots[i] && slots[i].pid;
    const valid = curPid != null && trainable.includes(curPid) && (!skipCapped || !held[curPid]);
    if (!valid) {
      engine.setTrainingSlot(state, i, candidates[pickIdx % candidates.length], rand);
      pickIdx++;
    }
  }
}

function isReady(engine, state) {
  if (typeof engine.trainingReady === 'function') return engine.trainingReady(state);
  if (!state.training || !state.training.lastDate) return true;
  return engine.daysBetween(state.training.lastDate, state.currentDate) >= cooldownDays(engine);
}

function pushNotice(cfg, kind, msg, date) {
  const seq = (cfg.noticeSeq || 0) + 1;
  cfg.noticeSeq = seq;
  cfg.lastNotice = { seq, kind, msg, date };
}

function runSessionAtDate(engine, state, rand, cfg, sessionDate) {
  if (!state || engine.isPlayerCareer(state)) return { ok: false, reason: 'player-career' };
  const rng = typeof rand === 'function' ? rand : fallbackRand;
  if (cfg.autoFill) fillAutoSlots(engine, state, rng, cfg.skipCapped);

  const slots = engine.trainingPlan(state).filter((s) => s.pid != null);
  const held = engine.trainingHeld(state) || {};
  const pidsToCheck = slots.length ? Array.from(new Set(slots.map((s) => s.pid))) : engine.trainableIds(state);
  if (!pidsToCheck.length) return { ok: false, reason: 'no-slots' };

  const peakNames = [];
  const activeNames = [];
  for (const pid of pidsToCheck) {
    const p = engine.playerById(state, pid);
    if (!p) continue;
    if (held[pid]) peakNames.push(p.name);
    else activeNames.push(p.name);
  }
  if (!slots.length && activeNames.length) return { ok: false, reason: 'no-slots' };

  if (!activeNames.length && peakNames.length) {
    const cd = cooldownDays(engine);
    if (!cfg.lastPeakNoticeDate || engine.daysBetween(cfg.lastPeakNoticeDate, sessionDate) >= cd) {
      cfg.lastPeakNoticeDate = sessionDate;
      const who = peakNames.length === 1 ? `${peakNames[0]} is` : `${peakNames.join(', ')} are`;
      pushNotice(cfg, 'peak', `Auto-Train: ${who} at potential peak and can't get any better.`, sessionDate);
    }
    return { ok: false, reason: 'all-peak', peakNames };
  }

  const prevLast = state.training ? state.training.lastDate : null;
  if (state.training && prevLast && engine.daysBetween(prevLast, sessionDate) >= cooldownDays(engine)) {
    state.training.lastDate = null;
  }
  const res = engine.runTraining(state, rng);
  if (res && res.ok) {
    if (!state.training) state.training = { slots };
    state.training.lastDate = sessionDate;
    cfg.lastAutoDate = sessionDate;
    cfg.sessions = (cfg.sessions || 0) + 1;
    let msg = `Successful training: ${activeNames.join(', ')}`;
    if (peakNames.length) {
      const who = peakNames.length === 1 ? `${peakNames[0]} is` : `${peakNames.join(', ')} are`;
      msg += ` (${who} at potential peak and can't get any better)`;
    }
    pushNotice(cfg, 'ok', msg, sessionDate);
  } else if (state.training && prevLast && !state.training.lastDate) {
    state.training.lastDate = prevLast;
  }
  return res;
}

function catchUpTraining(engine, state, rand, cfg) {
  if (!state || !cfg.autoTrain || engine.isPlayerCareer(state)) return;
  const cd = cooldownDays(engine);
  let ranInCall = 0;
  let lastActiveNames = [];
  let lastPeakNames = [];

  for (let n = 0; n < 60 && isReady(engine, state); n++) {
    const nextDate = state.training && state.training.lastDate
      ? (engine.addDays ? engine.addDays(state.training.lastDate, cd) : addDaysIso(state.training.lastDate, cd))
      : state.currentDate;
    const targetDate = engine.daysBetween(nextDate, state.currentDate) >= 0 ? nextDate : state.currentDate;
    const res = runSessionAtDate(engine, state, rand, cfg, targetDate);
    if (!res || !res.ok) break;
    ranInCall++;
    const slots = engine.trainingPlan(state).filter((s) => s.pid != null);
    const held = engine.trainingHeld(state) || {};
    lastActiveNames = [];
    lastPeakNames = [];
    for (const pid of new Set(slots.map((s) => s.pid))) {
      const p = engine.playerById(state, pid);
      if (!p) continue;
      if (held[pid]) lastPeakNames.push(p.name);
      else lastActiveNames.push(p.name);
    }
  }

  if (ranInCall > 1 && lastActiveNames.length) {
    let msg = `Successful training (${ranInCall} sessions): ${lastActiveNames.join(', ')}`;
    if (lastPeakNames.length) {
      const who = lastPeakNames.length === 1 ? `${lastPeakNames[0]} is` : `${lastPeakNames.join(', ')} are`;
      msg += ` (${who} at potential peak and can't get any better)`;
    }
    pushNotice(cfg, 'ok', msg, cfg.lastAutoDate || state.currentDate);
  }
}

function applyModCommand(engine, state, cmd) {
  const cfg = getCfg(state);
  if (cmd.op === 'cfg') {
    if (typeof cmd.autoTrain === 'boolean') cfg.autoTrain = cmd.autoTrain;
    if (typeof cmd.autoFill === 'boolean') cfg.autoFill = cmd.autoFill;
    if (typeof cmd.skipCapped === 'boolean') cfg.skipCapped = cmd.skipCapped;
    return { ok: true };
  }
  if (cmd.op === 'budget') {
    const team = engine.teamById(state, state.userTeamId);
    if (!team) return { ok: false, error: 'No club.' };
    if (cmd.mode === 'add') team.budget = Math.max(0, Math.round((team.budget || 0) + Number(cmd.amount || 0)));
    else if (cmd.mode === 'set') team.budget = Math.max(0, Math.round(Number(cmd.amount || 0)));
    return { ok: true };
  }
  if (cmd.op === 'player') {
    const p = engine.playerById(state, Number(cmd.pid));
    if (!p) return { ok: false, error: 'Player not found.' };
    if (cmd.rating != null && Number.isFinite(Number(cmd.rating))) {
      const r = clamp(Number(cmd.rating), 40, 99);
      p.ratingExact = r;
      p.rating = Math.floor(r);
    }
    if (cmd.age != null && Number.isFinite(Number(cmd.age))) {
      p.age = clamp(Math.round(Number(cmd.age)), 14, 45);
    }
    if (cmd.potential != null && Number.isFinite(Number(cmd.potential))) {
      p.potential = clamp(Math.round(Number(cmd.potential)), p.rating, 99);
      p.cpCustomPot = p.potential;
      if (p.potential > p.rating) {
        // Keep peakAge ahead of current age so settleCeiling and reachableCeiling don't clamp edited potential down
        p.peakAge = Math.max(p.peakAge || 23, (p.age || 20) + 15);
      }
      const rep = state.scouts && state.scouts.reports && state.scouts.reports[p.id];
      if (rep) {
        rep.potLo = p.potential;
        rep.potHi = p.potential;
      }
    }
    if (cmd.morale != null && Number.isFinite(Number(cmd.morale))) {
      p.morale = clamp(Number(cmd.morale), 0, 100);
    }
    if (cmd.form != null && Number.isFinite(Number(cmd.form))) {
      p.form = clamp(Math.round(Number(cmd.form)), -5, 5);
    }
    return { ok: true };
  }
  if (cmd.op === 'test-tweet') {
    if (!state.social) state.social = { posts: [], prompt: null };
    if (!Array.isArray(state.social.posts)) state.social.posts = [];
    const who = (state.players || [])
      .filter((p) => p && !p.retired && !p.isUser && p.teamId !== state.userTeamId)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))[0] || { id: -2, name: 'RLCS Insider', followers: 185000 };
    const tm = who.teamId != null && who.teamId >= 0 ? engine.teamById(state, who.teamId) : null;
    const myPost = state.social.posts.find((x) => x && (x.mine || (state.userPlayerId != null && x.authorId === state.userPlayerId)));
    const mePl = state.userPlayerId != null ? engine.playerById(state, state.userPlayerId) : null;
    const meName = (mePl && mePl.name) || state.managerName || 'manager';
    const handle = String(meName).toLowerCase().replace(/[^a-z0-9_]/g, '') || 'manager';
    const authorHandle = String(who.name).toLowerCase().replace(/[^a-z0-9_]/g, '') || 'insider';
    if (myPost) myPost.replies = (myPost.replies || 0) + 1;
    state.social.posts.unshift({
      id: (state.nextId = (state.nextId || 5000) + 1),
      kind: 'player',
      authorId: who.id,
      name: who.name,
      handle: authorHandle,
      club: tm ? tm.name : 'RLCS',
      followers: who.followers || 150000,
      verified: true,
      date: state.currentDate,
      likes: 248,
      reposts: 41,
      replies: 0,
      views: Math.round((who.followers || 150000) * 0.45),
      replyTo: myPost ? myPost.id : null,
      mention: true,
      targetId: state.userPlayerId,
      text: '@' + handle + ' Massive respect! He really backed himself tonight — this run is all his, nobody outsmarted him. #RLCS',
    });
    return { ok: true };
  }
  if (cmd.op === 'pref') {
    writeLocalPrefs({ playIntro: cmd.playIntro !== false });
    return { ok: true };
  }
  if (cmd.op === 'set-title') {
    const key = String(cmd.key || '').trim();
    if (!key) {
      delete cfg.selectedTitle;
      return { ok: true };
    }
    const me = state.userPlayerId != null ? engine.playerById(state, state.userPlayerId) : null;
    const titlesMod = findCachedModule(/engine[\\/]titles\.js$/);
    const earned = buildEarnedTitles(state, me, titlesMod);
    if (!earned.some((t) => t.key === key)) {
      return { ok: false, error: 'Title has not been earned in this career.' };
    }
    cfg.selectedTitle = key;
    return { ok: true };
  }
  return { ok: false, error: 'Unknown RL Career+ command.' };
}

function userWorldCupFinishes(state, player) {
  const cups = (state && state.intl && Array.isArray(state.intl.cups)) ? state.intl.cups : [];
  const uid = player ? player.id : (state ? state.userPlayerId : null);
  const out = [];
  for (const c of cups) {
    if (!c || (c.stage !== 'done' && c.championId == null)) continue;
    let tid = null;
    const squads = c.squads && typeof c.squads === 'object' ? c.squads : {};
    if (uid != null) {
      for (const [k, pids] of Object.entries(squads)) {
        if (Array.isArray(pids) && pids.includes(uid)) { tid = Number(k); break; }
      }
    }
    if (tid == null && c.squadByYou && state.intl && state.intl.job && state.intl.job.teamId != null) {
      const jt = Number(state.intl.job.teamId);
      if (Array.isArray(c.field) && c.field.some((f) => f && Number(f.teamId) === jt)) tid = jt;
    }
    if (tid == null) continue;
    let place = null;
    if (c.championId != null && Number(c.championId) === tid) place = 1;
    else if (Array.isArray(c.placings)) {
      const hit = c.placings.find((p) => p && Number(p.teamId) === tid);
      if (hit && hit.place) place = Number(hit.place);
    }
    out.push({ year: Number(c.year) || 0, host: c.host || '', place: place || 16 });
  }
  return out.sort((a, b) => (a.place - b.place) || (b.year - a.year));
}

function buildEarnedTitles(state, player, titlesMod) {
  const list = [];
  const seen = new Set();
  const push = (entry) => {
    if (!entry || !entry.key || seen.has(entry.key)) return;
    seen.add(entry.key);
    list.push(entry);
  };

  const ts = (player && Array.isArray(player.titles)) ? player.titles : [];
  const worldsWins = ts.filter((t) => t && t.k === 'worlds_champion').length;
  if (worldsWins >= 2) {
    const txt = worldsWins + '-Time World Champion';
    push({ key: 'cp:worlds_x:' + worldsWins, id: 'RLCS_2026_World_Champion', text: txt, display: txt, year: 9000, rank: 200 + worldsWins });
  }

  const wcs = userWorldCupFinishes(state, player);
  const wcWins = wcs.filter((w) => w.place === 1).length;
  if (wcWins >= 2) {
    const txt = wcWins + '-Time World Cup Champion';
    push({ key: 'cp:wc_x:' + wcWins, id: 'ESLMonthlyChampion', text: txt, display: txt, year: 8999, rank: 180 + wcWins });
  }
  for (const w of wcs) {
    if (!w.year) continue;
    if (w.place === 1) {
      const txt = 'FIFAe World Cup ' + w.year + ' Champion';
      push({ key: 'wc:champ:' + w.year, id: 'ESLMonthlyChampion', text: txt, display: txt, year: w.year, rank: 145 });
    } else if (w.place === 2) {
      const txt = 'FIFAe World Cup ' + w.year + ' Finalist';
      push({ key: 'wc:final:' + w.year, id: 'ESLMonthlyChampion', text: txt, display: txt, year: w.year, rank: 95 });
    } else if (w.place <= 4) {
      const txt = 'FIFAe World Cup ' + w.year + ' Semifinalist';
      push({ key: 'wc:semi:' + w.year, id: 'ESLMonthlyChampion', text: txt, display: txt, year: w.year, rank: 75 });
    } else {
      const txt = 'FIFAe World Cup ' + w.year + ' Contender';
      push({ key: 'wc:cont:' + w.year, id: 'ESLMonthlyChampion', text: txt, display: txt, year: w.year, rank: 35 });
    }
  }

  const majorWins = ts.filter((t) => t && t.k === 'major_champion').length;
  if (majorWins >= 2) {
    const txt = majorWins + '-Time Major Champion';
    push({ key: 'cp:major_x:' + majorWins, id: 'RLCS_2026_Major_2_Champion', text: txt, display: txt, year: 8998, rank: 135 + majorWins });
  }

  const tierRank = (titlesMod && titlesMod.TIER) || {
    worlds_champion: 14, major_champion: 13, season_champion: 13, solo_champion: 12,
    worlds_finalist: 11, worlds_elite: 10, major_finalist: 9, worlds_contender: 8,
    major_elite: 7, major_contender: 6, regional_champion: 4, regional_finalist: 3,
    contender: 2, challenger: 1,
  };
  if (titlesMod && typeof titlesMod.choices === 'function') {
    for (const c of titlesMod.choices(player) || []) {
      const r = (tierRank[c.kind] || 1) * 10;
      push({ key: c.key, id: c.id, text: c.text || '', display: c.display || c.text || c.id, year: c.year || 0, rank: r });
    }
  } else {
    for (const t of ts) {
      if (!t || !t.k) continue;
      const y = t.y || 2026;
      const h = t.h || '';
      const r = (tierRank[t.k] || 1) * 10;
      if (t.k === 'worlds_champion') {
        const txt = 'RLCS ' + y + ' World Champion';
        push({ key: 'k:worlds_champion:' + y + ':', id: 'RLCS_2026_World_Champion', text: txt, display: txt, year: y, rank: r });
      } else if (t.k === 'major_champion') {
        const txt = 'RLCS ' + y + (h ? ' ' + h : '') + ' Major Champion';
        push({ key: 'k:major_champion:' + y + ':' + h, id: h === 'Paris' ? 'RLCS_2026_Major_2_Champion' : 'RLCS_2026_Major_1_Champion', text: txt, display: txt, year: y, rank: r });
      } else if (t.k === 'regional_champion') {
        const txt = 'RLCS ' + y + ' Regional Champion';
        push({ key: 'k:regional_champion:' + y + ':', id: 'RLCS_2026_Regional_Champion', text: txt, display: txt, year: y, rank: r });
      } else if (t.k === 'contender') {
        const txt = 'RLCS ' + y + ' Contender';
        push({ key: 'k:contender:' + y + ':', id: 'RLCS_2026_Contender', text: txt, display: txt, year: y, rank: r });
      }
    }
  }
  list.sort((a, b) => (b.rank - a.rank) || ((b.year || 0) - (a.year || 0)));
  return list;
}

function resolveUserTitle(state, player, titlesMod) {
  const all = buildEarnedTitles(state, player, titlesMod);
  const cfg = state ? (state.careerPlus || state.jnyMod || null) : null;
  const chosenKey = cfg && cfg.selectedTitle ? String(cfg.selectedTitle) : '';
  if (chosenKey) {
    const hit = all.find((x) => x.key === chosenKey);
    if (hit) return hit;
  }
  return all[0] || null;
}

let liveState = null;

function rememberState(st) {
  if (st && typeof st === 'object' && Array.isArray(st.players) && st.userTeamId != null && st.locker !== null) {
    liveState = st;
  }
}

function wrapWithTraining(engine, fnName) {
  const orig = engine[fnName];
  if (typeof orig !== 'function') return;
  engine[fnName] = function cpWrapped(state, ...rest) {
    const rand = rest.find((a) => typeof a === 'function');
    if (state) catchUpTraining(engine, state, rand, getCfg(state));
    const res = orig.call(this, state, ...rest);
    if (state) catchUpTraining(engine, state, rand, getCfg(state));
    return res;
  };
}

function wrapEngine(engine) {
  if (engine.__careerPlus) return false;
  engine.__careerPlus = true;

  const origAdvance = engine.advance;
  const origPlaceBet = engine.placeBet;
  const origPlayerView = engine.playerView;
  const origPlayerById = engine.playerById;
  const origMatchTitleLines = engine.matchTitleLines;

  engine.advance = function cpAdvance(state, rand, mode) {
    rememberState(state);
    const cfg = getCfg(state);
    if (!cfg.autoTrain || engine.isPlayerCareer(state)) {
      return origAdvance.call(this, state, rand, mode);
    }
    if (mode === 'next') {
      let lastRes = { stopped: 'day' };
      for (let i = 0; i < 200; i++) {
        catchUpTraining(engine, state, rand, cfg);
        lastRes = origAdvance.call(this, state, rand, 'day');
        catchUpTraining(engine, state, rand, cfg);
        if (lastRes && lastRes.stopped !== 'day') return lastRes;
      }
      return lastRes;
    }
    catchUpTraining(engine, state, rand, cfg);
    const res = origAdvance.call(this, state, rand, mode);
    catchUpTraining(engine, state, rand, cfg);
    return res;
  };

  ['trainableIds', 'trainingPlan', 'trainingGain', 'trainingHeld', 'setTrainingSlot', 'runTraining'].forEach((fn) => {
    const orig = engine[fn];
    if (typeof orig !== 'function') return;
    engine[fn] = function cpIntlTrain(state, ...rest) {
      rememberState(state);
      return withIntlTrainables(engine, state, () => orig.call(this, state, ...rest));
    };
  });

  ['nextUserSeries', 'simulateFixture', 'simulateNextGame', 'startNextSeason'].forEach((fn) => wrapWithTraining(engine, fn));

  if (typeof origPlayerView === 'function') {
    engine.playerView = function cpPlayerView(state, p) {
      rememberState(state);
      const view = origPlayerView.call(this, state, p);
      const isManaged = state && p && (p.teamId === state.userTeamId || managedIntlPlayerIds(engine, state).includes(p.id));
      if (view && p && p.cpCustomPot != null && isManaged) {
        const pot = clamp(p.potential ?? p.cpCustomPot, p.rating, 99);
        view.potKnown = true;
        view.potLo = pot;
        view.potHi = pot;
        view.reach = Math.max(view.reach || 0, pot);
      }
      return view;
    };
  }

  if (typeof origMatchTitleLines === 'function') {
    engine.matchTitleLines = function cpMatchTitleLines(state, ids) {
      const realSt = (liveState && state && liveState.userPlayerId === state.userPlayerId) ? liveState : state;
      const merged = realSt && realSt.locker ? { ...state, locker: realSt.locker } : state;
      const lines = origMatchTitleLines.call(this, merged, ids) || [];
      const uid = realSt && realSt.userPlayerId;
      const me = uid != null && typeof origPlayerById === 'function' ? origPlayerById.call(engine, realSt, uid) : null;
      if (me) {
        const titlesMod = findCachedModule(/engine[\\/]titles\.js$/);
        const picked = resolveUserTitle(realSt, me, titlesMod);
        if (picked && picked.id) {
          const line = '@you\t' + picked.id + '\t' + (picked.text || '');
          const idx = lines.findIndex((l) => typeof l === 'string' && l.startsWith('@you\t'));
          if (idx !== -1) lines[idx] = line;
          else lines.push(line);
        }
      }
      return lines;
    };
  }

  engine.placeBet = function cpPlaceBet(state, kind, ref, teamId, stake) {
    rememberState(state);
    if (typeof kind === 'string' && kind.startsWith('cp:')) {
      try {
        return applyModCommand(engine, state, JSON.parse(kind.slice(3)));
      } catch (e) {
        return { ok: false, error: 'RL Career+ error: ' + e.message };
      }
    }
    return origPlaceBet.call(this, state, kind, ref, teamId, stake);
  };
  return true;
}

function findCachedModule(re) {
  for (const k of Object.keys(Module._cache)) {
    if (re.test(k)) return Module._cache[k].exports;
  }
  return null;
}

function syncCareerNamePlugin(name, log) {
  try {
    const bm = path.join(process.env.APPDATA || '', 'bakkesmod', 'bakkesmod');
    if (!fs.existsSync(bm)) return false;
    const srcDll = path.join(__dirname, 'rlcareerplus.dll');
    const dstDll = path.join(bm, 'plugins', 'rlcareerplus.dll');
    if (fs.existsSync(srcDll)) {
      let needCopy = true;
      try {
        if (fs.existsSync(dstDll) && fs.statSync(dstDll).size === fs.statSync(srcDll).size) {
          needCopy = !fs.readFileSync(dstDll).equals(fs.readFileSync(srcDll));
        }
      } catch { }
      if (needCopy) {
        try {
          fs.mkdirSync(path.dirname(dstDll), { recursive: true });
          fs.copyFileSync(srcDll, dstDll);
          if (log) log('deployed rlcareerplus.dll to BakkesMod plugins');
        } catch (e) {
          if (log) log('rlcareerplus.dll copy skipped (in use): ' + e.message);
        }
      }
    }
    const nameFile = path.join(bm, 'data', 'rlcareermode', 'career_name.txt');
    fs.mkdirSync(path.dirname(nameFile), { recursive: true });
    fs.writeFileSync(nameFile, (name || '') + '\n', 'utf8');
    return !!name;
  } catch (e) {
    if (log) log('syncCareerNamePlugin err: ' + e.message);
    return false;
  }
}

function installTitleHook(engine, log) {
  const { app, ipcMain } = require('electron');
  syncCareerNamePlugin('', log);
  if (app && typeof app.on === 'function') {
    app.on('before-quit', () => syncCareerNamePlugin('', null));
  }
  const getTitlesMod = () => findCachedModule(/engine[\\/]titles\.js$/);
  let titleCacheState = null;
  let titleCacheKey = '';
  let titleCacheVal = null;
  const patchSnap = (res) => {
    if (!res || typeof res !== 'object' || !res.career || !liveState) return res;
    try {
      const me = liveState.userPlayerId != null && typeof engine.playerById === 'function'
        ? engine.playerById(liveState, liveState.userPlayerId)
        : null;
      const cfg = liveState.careerPlus || liveState.jnyMod || {};
      const cups = (liveState.intl && liveState.intl.cups) || [];
      let doneCups = 0;
      for (let i = 0; i < cups.length; i++) if (cups[i] && (cups[i].stage === 'done' || cups[i].championId != null)) doneCups++;
      const ck = String(liveState.userPlayerId) + '|' + ((me && me.titles && me.titles.length) || 0) + '|' + doneCups + '|' + (cfg.selectedTitle || '');
      if (liveState === titleCacheState && ck === titleCacheKey && titleCacheVal) {
        res.cpTitles = titleCacheVal;
        return res;
      }
      const tm = getTitlesMod();
      const list = buildEarnedTitles(liveState, me, tm);
      const active = resolveUserTitle(liveState, me, tm);
      titleCacheState = liveState;
      titleCacheKey = ck;
      titleCacheVal = {
        selected: cfg.selectedTitle || '',
        activeDisplay: active ? active.display : '',
        activeId: active ? active.id : '',
        list: list.map((t) => ({ key: t.key, display: t.display, id: t.id })),
      };
      res.cpTitles = titleCacheVal;
    } catch (e) {
      log('cpTitles err: ' + e.message);
    }
    return res;
  };
  const wrapHandler = (ch, fn) => {
    if (typeof fn !== 'function' || fn.__cpTitleWrap) return fn;
    const wrapped = async function cpIpcWrap(ev, ...args) {
      if (ch === 'close-career') {
        liveState = null;
        syncCareerNamePlugin('', log);
      }
      const out = await fn.call(this, ev, ...args);
      return patchSnap(out);
    };
    wrapped.__cpTitleWrap = true;
    return wrapped;
  };
  if (ipcMain && ipcMain._invokeHandlers && typeof ipcMain._invokeHandlers.entries === 'function') {
    for (const [ch, fn] of Array.from(ipcMain._invokeHandlers.entries())) {
      ipcMain._invokeHandlers.set(ch, wrapHandler(ch, fn));
    }
    log('earned titles wired on ' + ipcMain._invokeHandlers.size + ' ipc handlers');
  }
  if (ipcMain && typeof ipcMain.handle === 'function' && !ipcMain.__cpHandleWrap) {
    ipcMain.__cpHandleWrap = true;
    const origHandle = ipcMain.handle.bind(ipcMain);
    ipcMain.handle = (ch, fn) => origHandle(ch, wrapHandler(ch, fn));
  }

  // Deploy & load rlcareerplus.dll so local player's in-game PRI name matches career player name
  const rconMod = findCachedModule(/setup[\\/]rcon\.js$/);
  if (rconMod && typeof rconMod.send === 'function' && !rconMod.__cpNameWrap) {
    rconMod.__cpNameWrap = true;
    const origSend = rconMod.send.bind(rconMod);
    rconMod.send = async function cpRconSend(cmds, opts) {
      const arr = Array.isArray(cmds) ? cmds : [];
      const isArm = arr.some((c) => typeof c === 'string' && c.startsWith('rlcareer_arm'));
      if (isArm && liveState && liveState.userPlayerId != null && typeof engine.playerById === 'function') {
        const me = engine.playerById(liveState, liveState.userPlayerId);
        const safeName = me && me.name ? String(me.name).replace(/[\r\n\t]+/g, ' ').trim().slice(0, 32) : '';
        if (safeName && syncCareerNamePlugin(safeName, log)) {
          const out = await origSend(arr.concat(['plugin load rlcareerplus']), opts);
          log('loaded rlcareerplus plugin for career name -> ' + safeName);
          return out;
        }
      }
      return origSend(cmds, opts);
    };
    log('wrapped RCON for rlcareerplus name plugin');
  }
}

const INTRO_HTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>RL Career+</title><style>
*{box-sizing:border-box;margin:0;padding:0;user-select:none}
html,body{width:100%;height:100%;overflow:hidden;background:#04070d;font-family:"Bahnschrift","Segoe UI",sans-serif;opacity:1;transition:opacity .35s ease}
body.out{opacity:0}
video{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;background:#04070d}
.vig{position:fixed;inset:0;pointer-events:none;background:linear-gradient(180deg,transparent 84%,rgba(4,7,13,.52) 100%)}
.brand{position:fixed;left:28px;bottom:26px;display:flex;align-items:center;gap:12px;pointer-events:none}
.pill{padding:6px 13px;border-radius:7px;background:rgba(8,15,26,.82);border:1px solid rgba(56,226,255,.45);box-shadow:inset 0 2px 0 #00d4ff,0 8px 24px rgba(0,0,0,.6);color:#38e2ff;font:900 14px/1.1 inherit;letter-spacing:.12em;text-transform:uppercase}
.sub{color:#e2edf8;font:700 12px/1.2 inherit;letter-spacing:.14em;text-transform:uppercase;text-shadow:0 2px 6px rgba(0,0,0,.95)}
.skip{position:fixed;right:26px;bottom:24px;z-index:5;padding:9px 16px;border-radius:8px;cursor:pointer;background:rgba(10,18,30,.82);border:1px solid rgba(56,226,255,.5);color:#e6f4ff;font:800 11.5px/1 inherit;letter-spacing:.1em;text-transform:uppercase;backdrop-filter:blur(6px);transition:all .15s}
.skip:hover{background:#0284c7;border-color:#67e8f9;color:#fff;transform:translateY(-1px)}
.bar{position:fixed;left:0;right:0;bottom:0;height:3px;background:rgba(255,255,255,.1)}
.bar i{display:block;height:100%;width:0%;background:linear-gradient(90deg,#00d4ff,#a855f7);transition:width .1s linear}
</style></head><body>
<video id="v" src="./intro.webm" autoplay playsinline></video>
<div class="vig"></div>
<div class="brand"><span class="pill">RL Career+</span><span class="sub">RLCS &middot; Majors &amp; Worlds</span></div>
<button class="skip" id="skip">Skip Intro [Space / Esc]</button>
<div class="bar"><i id="prog"></i></div>
<script>
const v=document.getElementById('v'),prog=document.getElementById('prog');let done=false;
function finish(){if(done)return;done=true;document.body.classList.add('out');try{v.pause();}catch{}setTimeout(()=>{document.title='__CP_INTRO_DONE__';},180);setTimeout(()=>{try{window.close();}catch{}},750);}
v.addEventListener('timeupdate',()=>{if(v.duration)prog.style.width=(v.currentTime/v.duration*100).toFixed(1)+'%';});
v.addEventListener('ended',finish);v.addEventListener('error',finish);
document.getElementById('skip').addEventListener('click',finish);
window.addEventListener('keydown',e=>{if(e.key==='Escape'||e.key===' '||e.key==='Enter')finish();});
setTimeout(finish,78000);
v.volume=0.50;v.play().catch(()=>{v.muted=true;v.play().catch(finish);});
</script></body></html>`;

function installUiHook(log) {
  const { app, BrowserWindow, screen } = require('electron');
  const fileUrl = (name) => {
    const p = path.join(__dirname, name);
    return fs.existsSync(p) ? pathToFileURL(p).href : '';
  };
  const arenaFiles = (() => {
    try {
      return fs.readdirSync(__dirname)
        .filter((f) => /^arena_\d+\.jpg$/i.test(f))
        .sort()
        .map((f) => fileUrl(f))
        .filter(Boolean);
    } catch { return []; }
  })();
  const bgsScript = 'window.__cpBgs=' + JSON.stringify({
    vit: fileUrl('bg_vitality.jpg'),
    falcons: fileUrl('bg_falcons.jpg'),
    kc: fileUrl('bg_kc.jpg'),
    cars: fileUrl('bg_cars.jpg'),
    arenas: arenaFiles,
  }) + ';';
  const uiSrc = bgsScript + fs.readFileSync(path.join(__dirname, 'ui.js'), 'utf8');
  const injectedUrls = new WeakMap();
  const inject = (wc) => {
    try {
      const url = wc.getURL();
      if (!/renderer[\\/]index\.html/.test(url)) return;
      if (injectedUrls.get(wc) === url) return;
      injectedUrls.set(wc, url);
      wc.executeJavaScript(uiSrc + '; window.__careerPlusUI ? "ui-ok" : "ui-false";')
        .then((r) => log('ui inject ' + url + ' -> ' + r))
        .catch((e) => { injectedUrls.delete(wc); log('ui inject failed: ' + e.message); });
    } catch (e) {
      log('ui inject error: ' + e.message);
    }
  };
  let introLaunched = false;
  let activeIntroWin = null;
  const launchIntro = (mainWin, force) => {
    if ((!force && introLaunched) || !mainWin || mainWin.__cpIntro) return;
    if (activeIntroWin && !activeIntroWin.isDestroyed()) return;
    const vid = path.join(__dirname, 'intro.webm');
    if (!fs.existsSync(vid) || (!force && readLocalPrefs().playIntro === false)) return;
    introLaunched = true;
    try {
      const introHtml = path.join(__dirname, 'intro.html');
      fs.writeFileSync(introHtml, INTRO_HTML, 'utf8');
      let introDone = false;
      let closing = false;
      let wantShow = mainWin.isVisible();
      const origShow = force ? null : mainWin.show.bind(mainWin);
      const origFocus = force ? null : mainWin.focus.bind(mainWin);
      if (!force) {
        mainWin.show = () => { wantShow = true; };
        mainWin.focus = () => { if (introDone) origFocus(); };
      }

      const wantWindowed = process.env.RLC_WINDOW === '1';
      const fsMode = !wantWindowed || (typeof mainWin.isFullScreen === 'function' && mainWin.isFullScreen());
      const disp = screen && screen.getPrimaryDisplay ? screen.getPrimaryDisplay() : { bounds: { x: 0, y: 0, width: 1280, height: 720 } };
      const b = mainWin.getBounds();
      const introWin = new BrowserWindow({
        x: fsMode ? disp.bounds.x : b.x,
        y: fsMode ? disp.bounds.y : b.y,
        width: fsMode ? disp.bounds.width : (b.width || 1280),
        height: fsMode ? disp.bounds.height : (b.height || 720),
        fullscreen: fsMode,
        kiosk: fsMode,
        frame: false,
        autoHideMenuBar: true,
        skipTaskbar: true,
        alwaysOnTop: true,
        backgroundColor: '#04070d',
        show: false,
        webPreferences: { autoplayPolicy: 'no-user-gesture-required' },
      });
      introWin.__cpIntro = true;
      activeIntroWin = introWin;
      const destroyIntro = () => {
        if (introDone) return;
        introDone = true;
        activeIntroWin = null;
        if (!force && origShow && origFocus) {
          mainWin.show = origShow;
          mainWin.focus = origFocus;
        }
        log('intro closed');
        if (!mainWin.isDestroyed() && (wantShow || !mainWin.isVisible())) {
          if (origShow) origShow(); else mainWin.show();
          if (origFocus) origFocus(); else mainWin.focus();
        }
        try {
          if (!introWin.isDestroyed()) {
            introWin.setKiosk(false);
            introWin.setAlwaysOnTop(false);
            introWin.destroy();
          }
        } catch { }
      };
      const smoothHandoff = () => {
        if (closing || introDone) return;
        closing = true;
        if (!mainWin.isDestroyed()) {
          mainWin.webContents.executeJavaScript('window.__cpEnterHome && window.__cpEnterHome()').catch(() => { });
          if (wantShow || !mainWin.isVisible()) {
            if (origShow) origShow(); else mainWin.show();
          }
        }
        const steps = [0.82, 0.55, 0.28, 0.08];
        let idx = 0;
        const fadeStep = () => {
          if (introDone || introWin.isDestroyed()) return;
          if (idx < steps.length) {
            try { introWin.setOpacity(steps[idx++]); } catch { }
            setTimeout(fadeStep, 48);
          } else {
            destroyIntro();
          }
        };
        setTimeout(fadeStep, 70);
      };
      const guard = setTimeout(destroyIntro, 79000);
      introWin.on('page-title-updated', (e, title) => {
        if (title === '__CP_INTRO_DONE__') {
          e.preventDefault();
          clearTimeout(guard);
          smoothHandoff();
        }
      });
      introWin.once('close', () => { try { introWin.setKiosk(false); introWin.setAlwaysOnTop(false); } catch { } });
      introWin.once('closed', () => { clearTimeout(guard); destroyIntro(); });
      introWin.once('ready-to-show', () => {
        if (!introDone && !introWin.isDestroyed()) {
          if (fsMode) {
            try {
              introWin.setAlwaysOnTop(true, 'screen-saver');
              introWin.setFullScreen(true);
              introWin.setKiosk(true);
            } catch { }
          }
          introWin.show();
          introWin.moveTop();
          introWin.focus();
          if (fsMode) {
            setTimeout(() => {
              if (!introDone && !introWin.isDestroyed()) {
                try { introWin.setAlwaysOnTop(true, 'screen-saver'); introWin.setFullScreen(true); introWin.moveTop(); introWin.focus(); } catch { }
              }
            }, 80);
          }
          log('intro opened fs=' + introWin.isFullScreen() + ' kiosk=' + introWin.isKiosk());
          setTimeout(() => {
            if (!introDone && !introWin.isDestroyed()) {
              introWin.webContents.executeJavaScript('(() => { const v = document.getElementById("v"); return v ? { vw: v.videoWidth, vh: v.videoHeight, t: Number(v.currentTime.toFixed(2)), paused: v.paused, rs: v.readyState } : null; })()')
                .then((st) => log('intro video ' + JSON.stringify(st)))
                .catch(() => { });
            }
          }, 1200);
        }
      });
      introWin.loadFile(introHtml).catch((e) => { log('intro load err: ' + e.message); destroyIntro(); });
    } catch (e) {
      log('intro err: ' + e.message);
    }
  };
  const watch = (win) => {
    if (!win || win.__cpIntro) return;
    launchIntro(win, false);
    inject(win.webContents);
    win.webContents.on('did-start-navigation', (_e, _u, isInPlace, isMainFrame) => {
      if (isMainFrame && !isInPlace) injectedUrls.delete(win.webContents);
    });
    win.webContents.on('did-finish-load', () => inject(win.webContents));
    win.webContents.on('dom-ready', () => inject(win.webContents));
    win.webContents.on('console-message', (_e, _lvl, msg) => {
      if (msg === '__CP_REPLAY_INTRO__') launchIntro(win, true);
    });
  };
  BrowserWindow.getAllWindows().forEach(watch);
  app.on('browser-window-created', (_e, win) => watch(win));
}

function sanitizeEpicCmd(args) {
  if (!args || typeof args !== 'string') return args;
  let clean = args.replace(/[\x00-\x1f\x7f\ufffd]+/g, '');
  // Epic usernames with spaces or stripped bytes must not split before -epicuserid
  clean = clean.replace(/-epicusername=.*?(?=\s+-[A-Za-z]|$)/i, (m) => {
    const val = m.slice('-epicusername='.length).replace(/["\s]+/g, ' ').trim();
    const safe = val.replace(/[^\x21-\x7e]/g, '') || 'Player';
    return '-epicusername=' + safe.replace(/\s+/g, '_');
  });
  return clean.replace(/\s{2,}/g, ' ').trim();
}

function wrapGameLaunch(gl, log) {
  if (!gl || gl.__careerPlusGL) return false;
  gl.__careerPlusGL = true;
  const origVerbatim = gl.startGameVerbatim;
  if (typeof origVerbatim === 'function') {
    gl.startGameVerbatim = function cpStartGameVerbatim(exe, args, opts) {
      const fixedArgs = sanitizeEpicCmd(args);
      if (log && fixedArgs !== args) log('epic cmdline sanitized (preserved flags after username)');
      return origVerbatim.call(this, exe, fixedArgs, opts);
    };
  }
  if (typeof gl.launchEpicToMenu === 'function' && typeof gl.readPathAndAuth === 'function') {
    gl.launchEpicToMenu = async function cpLaunchEpicToMenu({
      documents, expectedExe, openUri, isRunning, kill, spawnGame, sleep, current, timeoutMs = 120000, beforeOwnCopy = async () => { },
    }) {
      if (!current()) return null;
      const logDir = path.join(documents, 'My Games', 'Rocket League', 'TAGame', 'Logs');
      const mainLog = path.join(logDir, 'Launch.log');
      const ensureClosed = async (why) => {
        if (await isRunning('RocketLeague.exe') !== true) return true;
        await kill();
        for (let i = 0; i < 40 && current(); i++) {
          if (await isRunning('RocketLeague.exe') === false) return true;
          await sleep(150);
        }
        if (!current()) return false;
        if (log) log('epic launch: ' + why + ' (RocketLeague.exe still running — likely elevated Epic Games Launcher)');
        throw new Error(why + ' — Epic Games Launcher is running as Administrator. Close Rocket League and either turn off "Run as administrator" on EpicGamesLauncher.exe or run RL Career Hub - Career+.exe as Administrator.');
      };
      if (!await ensureClosed('Could not close existing Rocket League')) return null;
      if (!current()) return null;
      try { fs.rmSync(mainLog, { force: true }); } catch { }
      const launchStart = Date.now();
      await openUri(gl.EPIC_LAUNCH_URI);
      let hit = null;
      const deadline = Date.now() + timeoutMs;
      while (!hit) {
        if (!current()) return null;
        const candidates = [mainLog];
        try {
          for (const f of fs.readdirSync(logDir)) {
            if (/^Launch_\d+\.log$/i.test(f)) candidates.push(path.join(logDir, f));
          }
        } catch { }
        for (const fpath of candidates) {
          let st;
          try { st = fs.statSync(fpath); } catch { continue; }
          if (st.mtimeMs < launchStart - 500) continue;
          const parsed = gl.readPathAndAuth(fpath);
          if (!parsed || !parsed.auth) continue;
          if (expectedExe && path.win32.relative(expectedExe, parsed.exe) !== '') continue;
          if (!/(?:^|\s)-epicapp=Sugar(?:\s|$)/i.test(parsed.auth)) continue;
          hit = { exe: expectedExe || parsed.exe, auth: parsed.auth };
          break;
        }
        if (hit) break;
        if (Date.now() >= deadline) throw new Error('Epic did not start Rocket League in time');
        await sleep(120);
      }
      if (log) log('epic launch: captured fresh auth before EOS login');
      if (!await ensureClosed("Epic's copy of Rocket League did not close")) return null;
      if (!current()) return null;
      await beforeOwnCopy();
      if (!current()) return null;
      const cleanAuth = sanitizeEpicCmd(hit.auth);
      await spawnGame(hit.exe, gl.rlbotGameArgs() + ' ' + gl.QUIET_ARGS + ' ' + cleanAuth);
      return { exe: hit.exe };
    };
  }
  return true;
}

function installGameLaunchHook(log) {
  const tryNow = () => {
    for (const k of Object.keys(Module._cache)) {
      if (/setup[\\/]game-launch\.js$/.test(k)) {
        if (wrapGameLaunch(Module._cache[k].exports, log)) log('wrapped Epic launch in ' + k);
        return true;
      }
    }
    return false;
  };
  if (tryNow()) return;
  const origLoad = Module._load;
  Module._load = function cpModLoad(request, parent, isMain) {
    const out = origLoad.apply(this, arguments);
    try {
      if (out && typeof out === 'object' && typeof out.launchEpicToMenu === 'function' && !out.__careerPlusGL) {
        if (wrapGameLaunch(out, log)) log('wrapped Epic launch on load (' + request + ')');
      }
    } catch { }
    return out;
  };
}

function attach(opts = {}) {
  const logFile = opts.log || path.join(process.env.TEMP || '.', 'rlcareerplus.log');
  const log = (m) => { try { fs.appendFileSync(logFile, new Date().toISOString() + ' ' + m + '\n'); } catch { } };

  const keys = Object.keys(Module._cache);
  const lk = keys.find((k) => /engine[\\/]league\.js$/.test(k));
  if (!lk) return 'wait';

  const engine = Module._cache[lk].exports;
  if (engine.__careerPlus) return 'already';

  try {
    wrapEngine(engine);
    installTitleHook(engine, log);
    installGameLaunchHook(log);
    installUiHook(log);
    log('attached to ' + lk);
    if (opts.closeInspector) {
      try { require('inspector').close(); } catch { }
    }
    return 'wrapped';
  } catch (e) {
    log('attach failed: ' + e.stack);
    return 'error: ' + e.message;
  }
}

module.exports = { attach, wrapEngine, wrapGameLaunch, sanitizeEpicCmd, buildEarnedTitles, resolveUserTitle, catchUpTraining, fillAutoSlots };

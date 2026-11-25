'use strict';
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const AUDIO_DIR = path.join(__dirname, 'audio');

function resolvePluginDll() {
  const cands = [
    path.join(__dirname, 'rlcareer_crowd.dll'),
    path.join(__dirname, '..', 'rlcareer_crowd.dll'),
  ];
  return cands.find((p) => fs.existsSync(p)) || cands[0];
}

function resolveAudioFile(fname) {
  const cands = [
    path.join(__dirname, fname),
    path.join(AUDIO_DIR, fname),
    path.join(__dirname, '..', 'assets', fname),
  ];
  return cands.find((p) => fs.existsSync(p)) || '';
}

function bmBaseDir() {
  const appData = process.env.APPDATA || '';
  return appData ? path.join(appData, 'bakkesmod', 'bakkesmod') : '';
}

function crowdEventPath() {
  const base = bmBaseDir();
  return base ? path.join(base, 'data', 'rlcareermode', 'crowd_event.json') : '';
}

function ensureCrowdSettings(state) {
  if (!state || typeof state !== 'object') return { mode: 'lan', volume: 0.85, ultrasWalkout: true, saves: true };
  if (!state.cpCrowd || typeof state.cpCrowd !== 'object') {
    state.cpCrowd = {
      mode: 'lan',       // 'lan' (Playoffs/Worlds/FIFAe/Cups only) | 'always' | 'off'
      volume: 0.85,      // 0.0 .. 1.0
      ultrasWalkout: true,
      saves: true,
    };
  }
  if (!['lan', 'always', 'off'].includes(state.cpCrowd.mode)) state.cpCrowd.mode = 'lan';
  if (typeof state.cpCrowd.volume !== 'number' || !Number.isFinite(state.cpCrowd.volume)) state.cpCrowd.volume = 0.85;
  state.cpCrowd.volume = Math.max(0, Math.min(1, state.cpCrowd.volume));
  if (typeof state.cpCrowd.ultrasWalkout !== 'boolean') state.cpCrowd.ultrasWalkout = true;
  if (typeof state.cpCrowd.saves !== 'boolean') state.cpCrowd.saves = true;
  return state.cpCrowd;
}

/**
 * Determine whether a given fixture qualifies for LAN Crowd Pops:
 * - Opens & LCQs (online qualifiers): OFF (in default 'lan' mode)
 * - Majors: Playoffs ONLY (fx.stage !== 'group' — QF / SF / GF / Playoffs)
 * - Worlds, FIFAe World Cup, and all other LAN cups/tournaments: ON!
 */
function crowdEligibility(engine, state, fx) {
  const cfg = ensureCrowdSettings(state);
  if (cfg.mode === 'off') {
    return { active: false, hype: 0, tier: 'off', label: 'Crowd Pops muted' };
  }
  if (!fx) {
    return {
      active: cfg.mode === 'always',
      hype: cfg.mode === 'always' ? 2 : 0,
      tier: cfg.mode === 'always' ? 'always' : 'idle',
      label: cfg.mode === 'always' ? 'Always On (all matches)' : 'LAN Mode (Playoffs / Worlds / FIFAe / Cups)',
    };
  }

  const ev = fx.eventId != null
    ? (state.events || []).find((e) => e && e.id === fx.eventId) || null
    : null;
  const cup = (state.intl && Array.isArray(state.intl.cups))
    ? state.intl.cups.find((c) => c && (c.id === fx.cupId || c.id === fx.eventId)) || null
    : null;

  const evKind = String((ev && ev.kind) || fx.kind || '').toLowerCase();
  const stage = String(fx.stage || '').toLowerCase();
  const isGroup = stage === 'group' || stage === 'groups' || stage === 'swiss' || stage === 'qualifier';
  const isGrandFinal = stage === 'gf' || stage === 'final' || stage === 'grandfinal';
  const isCupOrIntl = !!(cup || fx.cupId != null || evKind === 'worldcup' || evKind === 'fifae' || evKind === 'cup' || evKind === 'intl');

  if (cfg.mode === 'always') {
    return {
      active: true,
      hype: isGrandFinal ? 4 : evKind === 'worlds' || isCupOrIntl ? 3 : 2,
      tier: 'always',
      label: ((ev && ev.name) || (cup && cup.name) || 'Match') + ' (Always On)',
    };
  }

  // 1. Opens & Regional Qualifiers / LCQs -> Online, NO LAN crowd!
  if (!isCupOrIntl && (evKind === 'open' || evKind === 'regional' || evKind === 'lcq' || evKind === 'qualifier')) {
    return {
      active: false,
      hype: 0,
      tier: 'open',
      label: `${(ev && ev.name) || 'RLCS Open'} — Online Qualifier (No Crowd)`,
    };
  }

  // 2. Majors -> Crowd ONLY in Playoffs (not Group Stage)!
  if (evKind === 'major') {
    if (isGroup) {
      return {
        active: false,
        hype: 0,
        tier: 'major_groups',
        label: `${(ev && ev.name) || 'RLCS Major'} Group Stage — Crowd starts in Playoffs`,
      };
    }
    return {
      active: true,
      hype: isGrandFinal ? 4 : 3,
      tier: 'major_playoffs',
      label: `${(ev && ev.name) || 'RLCS Major'} ${isGrandFinal ? 'Grand Final' : 'Playoffs'} (LAN Crowd)`,
    };
  }

  // 3. Worlds -> Full LAN Arena Crowd (max intensity in Playoffs/Grand Final)
  if (evKind === 'worlds') {
    return {
      active: true,
      hype: isGrandFinal ? 4 : (isGroup ? 2 : 3),
      tier: 'worlds',
      label: `${(ev && ev.name) || 'World Championship'}${isGrandFinal ? ' Grand Final' : ''} (LAN Arena)`,
    };
  }

  // 4. FIFAe World Cup & all other LAN Cups / Tournaments -> Full LAN Crowd!
  if (isCupOrIntl || (ev && evKind && evKind !== 'open')) {
    const nm = (cup && cup.name) || (ev && ev.name) || 'LAN Cup';
    return {
      active: true,
      hype: isGrandFinal ? 4 : 3,
      tier: isCupOrIntl ? 'fifae' : 'cup',
      label: `${nm} (LAN Arena Crowd)`,
    };
  }

  // Fallback for unknown playoff matches
  if (stage && !isGroup) {
    return { active: true, hype: isGrandFinal ? 4 : 2, tier: 'playoffs', label: 'Playoffs (LAN Crowd)' };
  }
  return { active: false, hype: 0, tier: 'open', label: 'Regular Match (No Crowd)' };
}

function activeFixtureOf(engine, state) {
  if (!state) return null;
  if (state.pendingMatch != null && typeof engine.fixtureById === 'function') {
    const fx = engine.fixtureById(state, state.pendingMatch);
    if (fx) return fx;
  }
  if (Array.isArray(state.fixtures)) {
    const next = state.fixtures.find((f) => f && !f.played && (f.homeId === state.userTeamId || f.awayId === state.userTeamId));
    if (next) return next;
  }
  return null;
}

function audioAssets() {
  const goalPath = resolveAudioFile('crowd_pop_goal.mp3');
  const savePath = resolveAudioFile('crowd_pop_save.mp3');
  const ver = (p) => { try { return '?v=' + Math.floor(fs.statSync(p).mtimeMs); } catch { return ''; } };
  return {
    goalUrl: goalPath ? pathToFileURL(goalPath).href + ver(goalPath) : '',
    saveUrl: savePath ? pathToFileURL(savePath).href + ver(savePath) : '',
    hasFiles: !!goalPath,
  };
}

function installBakkesCrowdPlugin(log) {
  const base = bmBaseDir();
  if (!base || !fs.existsSync(base)) return { installed: false, reason: 'BakkesMod folder not found' };
  const pluginSrc = resolvePluginDll();
  if (!fs.existsSync(pluginSrc)) return { installed: false, reason: 'rlcareer_crowd.dll not built' };

  const dstDll = path.join(base, 'plugins', 'rlcareer_crowd.dll');
  try {
    let needCopy = !fs.existsSync(dstDll);
    if (!needCopy) {
      const s = fs.statSync(pluginSrc);
      const d = fs.statSync(dstDll);
      if (s.size !== d.size || s.mtimeMs > d.mtimeMs + 1000) needCopy = true;
    }
    if (needCopy) {
      fs.mkdirSync(path.dirname(dstDll), { recursive: true });
      fs.copyFileSync(pluginSrc, dstDll);
      if (log) log('Installed rlcareer_crowd.dll into BakkesMod plugins');
    }
  } catch (e) {
    // DLL may already be loaded by a running Rocket League process — that's fine!
    if (log) log('rlcareer_crowd.dll copy skipped (in use or locked): ' + e.message);
  }

  // Register in BakkesMod cfg/plugins.cfg if missing so Rocket League auto-loads it on launch
  const cfgPath = path.join(base, 'cfg', 'plugins.cfg');
  try {
    if (fs.existsSync(cfgPath)) {
      const cfg = fs.readFileSync(cfgPath, 'utf8');
      if (!/^\s*plugin\s+load\s+rlcareer_crowd\b/im.test(cfg)) {
        const nl = cfg.endsWith('\n') ? '' : '\n';
        fs.appendFileSync(cfgPath, `${nl}plugin load rlcareer_crowd\n`, 'utf8');
        if (log) log('Added plugin load rlcareer_crowd to BakkesMod plugins.cfg');
      }
    }
  } catch (e) {
    if (log) log('plugins.cfg update skipped: ' + e.message);
  }

  return { installed: fs.existsSync(dstDll), path: dstDll };
}

function startCrowdWatcher(getState, engine, emitToRenderer, log) {
  const evFile = crowdEventPath();
  if (!evFile) return null;
  let lastSeq = 0;
  let lastTs = Date.now();

  // Seed lastSeq from any stale pre-existing file so we don't fire an old goal on startup
  try {
    if (fs.existsSync(evFile)) {
      const prev = JSON.parse(fs.readFileSync(evFile, 'utf8'));
      if (prev && typeof prev.seq === 'number') lastSeq = prev.seq;
      if (prev && typeof prev.ts === 'number') lastTs = Math.max(lastTs, prev.ts);
    }
  } catch { }

  const checkFile = () => {
    try {
      if (!fs.existsSync(evFile)) return;
      const raw = fs.readFileSync(evFile, 'utf8');
      if (!raw || !raw.trim()) return;
      const ev = JSON.parse(raw);
      if (!ev || typeof ev.seq !== 'number') return;
      if (ev.seq === lastSeq && ev.ts <= lastTs) return;
      // Ignore stale events older than 15 seconds
      if (ev.ts && Date.now() - ev.ts > 15000) {
        lastSeq = ev.seq;
        lastTs = ev.ts;
        return;
      }
      lastSeq = ev.seq;
      lastTs = ev.ts || Date.now();

      const st = typeof getState === 'function' ? getState() : null;
      const cfg = ensureCrowdSettings(st);
      if (cfg.mode === 'off') return;
      if ((ev.type === 'save' || ev.type === 'epic_save') && !cfg.saves) return;
      if (ev.type === 'kickoff' && !cfg.ultrasWalkout) return;

      const fx = st && st.pendingMatch != null && typeof engine.fixtureById === 'function'
        ? engine.fixtureById(st, st.pendingMatch)
        : activeFixtureOf(engine, st);
      const elig = crowdEligibility(engine, st, fx);
      if (!elig.active) {
        if (log) log(`crowd event "${ev.type}" suppressed (${elig.label})`);
        return;
      }

      const payload = {
        ...ev,
        hype: elig.hype,
        tier: elig.tier,
        label: elig.label,
        volume: cfg.volume,
        ultrasWalkout: cfg.ultrasWalkout,
      };
      if (log) log(`crowd pop trigger -> ${ev.type} (hype=${elig.hype}, ot=${!!ev.overtime}, clock=${ev.clock})`);
      if (typeof emitToRenderer === 'function') emitToRenderer(payload);
    } catch { }
  };

  let watcher = null;
  try {
    fs.mkdirSync(path.dirname(evFile), { recursive: true });
    watcher = fs.watch(path.dirname(evFile), (_evt, fname) => {
      if (!fname || String(fname).toLowerCase() === 'crowd_event.json') checkFile();
    });
  } catch { }
  const timer = setInterval(checkFile, 160);
  if (timer.unref) timer.unref();
  return { stop() { try { if (watcher) watcher.close(); } catch { } clearInterval(timer); } };
}

function handleCrowdCommand(engine, state, cmd) {
  const cfg = ensureCrowdSettings(state);
  if (!cmd || typeof cmd !== 'object') return { ok: false, error: 'Invalid crowd command.' };
  if (cmd.op === 'set-mode') {
    if (!['lan', 'always', 'off'].includes(cmd.mode)) return { ok: false, error: 'Invalid crowd mode.' };
    cfg.mode = cmd.mode;
    return { ok: true, cpCrowd: buildCrowdSnapshot(engine, state) };
  }
  if (cmd.op === 'set-vol') {
    cfg.volume = Math.max(0, Math.min(1, Number(cmd.volume) || 0));
    return { ok: true, cpCrowd: buildCrowdSnapshot(engine, state) };
  }
  if (cmd.op === 'set-ultras') {
    cfg.ultrasWalkout = !!cmd.enabled;
    return { ok: true, cpCrowd: buildCrowdSnapshot(engine, state) };
  }
  if (cmd.op === 'set-saves') {
    cfg.saves = !!cmd.enabled;
    return { ok: true, cpCrowd: buildCrowdSnapshot(engine, state) };
  }
  return { ok: false, error: 'Unknown crowd command: ' + cmd.op };
}

function buildCrowdSnapshot(engine, state) {
  const cfg = ensureCrowdSettings(state);
  const fx = activeFixtureOf(engine, state);
  const elig = crowdEligibility(engine, state, fx);
  const assets = audioAssets();
  const base = bmBaseDir();
  const dllInstalled = !!(base && fs.existsSync(path.join(base, 'plugins', 'rlcareer_crowd.dll')));
  return {
    mode: cfg.mode,
    volume: cfg.volume,
    ultrasWalkout: cfg.ultrasWalkout,
    saves: cfg.saves,
    nextMatch: elig,
    dllInstalled,
    ...assets,
  };
}

function wrapCrowdEngine(engine) {
  if (!engine || engine.__crowdWrapped) return false;
  engine.__crowdWrapped = true;
  const origPlaceBet = engine.placeBet;
  if (typeof origPlaceBet === 'function') {
    engine.placeBet = function crowdPlaceBet(state, kind, ref, teamId, stake) {
      if (typeof kind === 'string' && kind.startsWith('cr:')) {
        try {
          return handleCrowdCommand(engine, state, JSON.parse(kind.slice(3)));
        } catch (e) {
          return { ok: false, error: 'Crowd error: ' + e.message };
        }
      }
      return origPlaceBet.call(this, state, kind, ref, teamId, stake);
    };
  }
  return true;
}

module.exports = {
  AUDIO_DIR,
  ensureCrowdSettings,
  crowdEligibility,
  audioAssets,
  installBakkesCrowdPlugin,
  startCrowdWatcher,
  handleCrowdCommand,
  buildCrowdSnapshot,
  wrapCrowdEngine,
};

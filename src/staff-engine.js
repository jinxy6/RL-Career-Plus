'use strict';
const fs = require('fs');
const path = require('path');

const TIERS = ['bad', 'mid', 'best'];

const TIER_META = {
  bad:  { key: 'bad',  label: 'Bad',  badge: 'Tier I',   color: '#94a3b8' },
  mid:  { key: 'mid',  label: 'Mid',  badge: 'Tier II',  color: '#38bdf8' },
  best: { key: 'best', label: 'Best', badge: 'Tier III', color: '#fbbf24' },
};

// Monthly rent & maintenance by HQ tier (0 = none, 1..6 = vanilla FACILITIES tiers)
const FACILITY_UPKEEP_REAL   = [0, 1200,  3500,   9000,  22000,   55000,  135000];
const FACILITY_UPKEEP_LEGACY = [0, 25000, 85000, 240000, 650000, 1600000, 4000000];

const ROLE_DEFS = {
  scout: {
    key: 'scout',
    name: 'Scout',
    maxSlots: 3,
    icon: '🔍',
    accent: '#22c55e',
    summary: 'Uncovers player ratings & potential faster and more accurately. Each hired scout grants 1 slot (max 3).',
    tiers: {
      bad:  { wage: 4500,  wageReal: 150, hireFee: 200000,  hireFeeReal: 8000,   minDays: 8, maxDays: 10, potSpread: 3, desc: '8–10 day scouting, standard potential range (±3).' },
      mid:  { wage: 9500,  wageReal: 300, hireFee: 1000000, hireFeeReal: 45000,  minDays: 6, maxDays: 7,  potSpread: 2, desc: '6–7 day scouting, sharper potential range (±2).' },
      best: { wage: 16500, wageReal: 550, hireFee: 4000000, hireFeeReal: 180000, minDays: 3, maxDays: 5,  potSpread: 1, desc: '3–5 day scouting, pinpoint potential accuracy (±1).' },
    },
  },
  mental_coach: {
    key: 'mental_coach',
    name: 'Mental Coach',
    maxSlots: 1,
    icon: '🧠',
    accent: '#a855f7',
    summary: 'Lowers squad ego, lifts morale, and cushions morale loss from player chats.',
    tiers: {
      bad:  { wage: 5500,  wageReal: 180, hireFee: 250000,  hireFeeReal: 10000,  egoReduce: 0.05, moraleBoost: 3,  chatProtect: 0.05, desc: 'Reduces player ego by 5%, +3% morale, -5% chat morale loss.' },
      mid:  { wage: 11500, wageReal: 360, hireFee: 1200000, hireFeeReal: 55000,  egoReduce: 0.10, moraleBoost: 6,  chatProtect: 0.10, desc: 'Reduces player ego by 10%, +6% morale, -10% chat morale loss.' },
      best: { wage: 20000, wageReal: 650, hireFee: 4600000, hireFeeReal: 210000, egoReduce: 0.15, moraleBoost: 10, chatProtect: 0.20, desc: 'Reduces player ego by 15%, +10% morale, -20% chat morale loss.' },
    },
  },
  media_trainer: {
    key: 'media_trainer',
    name: 'Media Trainer',
    maxSlots: 1,
    icon: '📣',
    accent: '#00d4ff',
    summary: 'Boosts sponsorship income, shortens media cooldowns, and accelerates org & player follower growth.',
    tiers: {
      bad:  { wage: 5000,  wageReal: 175, hireFee: 250000,  hireFeeReal: 10000,  sponsorBoost: 0.05, cooldownWeekends: 1, followerBoost: 0.05, desc: '+5% sponsorship income, -1 weekend cooldown, +5% follower growth.' },
      mid:  { wage: 11000, wageReal: 350, hireFee: 1200000, hireFeeReal: 55000,  sponsorBoost: 0.10, cooldownWeekends: 2, followerBoost: 0.10, desc: '+10% sponsorship income, -2 weekends cooldown, +10% follower growth.' },
      best: { wage: 21000, wageReal: 680, hireFee: 5000000, hireFeeReal: 230000, sponsorBoost: 0.20, cooldownWeekends: 3, followerBoost: 0.20, desc: '+20% sponsorship income, -3 weekends cooldown, +20% follower growth.' },
    },
  },
  assistant_coach: {
    key: 'assistant_coach',
    name: 'Assistant Coach',
    maxSlots: 1,
    icon: '📋',
    accent: '#f59e0b',
    supportsIrl: true,
    summary: 'Speeds up training cadence, boosts session gains, and unlocks Auto-Train at Best tier. IRL RLCS coaches available.',
    tiers: {
      bad:  { wage: 6000,  wageReal: 200, hireFee: 350000,  hireFeeReal: 15000,  trainDaysReduced: 1, trainBoost: 0.05, autoTrain: false, desc: 'Reduces training cooldown by 1 day & +5% training effectiveness.' },
      mid:  { wage: 12500, wageReal: 400, hireFee: 1600000, hireFeeReal: 75000,  trainDaysReduced: 2, trainBoost: 0.10, autoTrain: false, desc: 'Reduces training cooldown by 2 days & +10% training effectiveness.' },
      best: { wage: 24000, wageReal: 750, hireFee: 6000000, hireFeeReal: 280000, trainDaysReduced: 3, trainBoost: 0.15, autoTrain: true,  desc: 'CAN AUTO-TRAIN, -3 days training cooldown & +15% effectiveness.' },
    },
  },
  engineer: {
    key: 'engineer',
    name: 'Engineer',
    maxSlots: 1,
    icon: '🛠️',
    accent: '#3b82f6',
    summary: 'Cuts headquarters upgrade costs AND monthly facility rent & maintenance.',
    tiers: {
      bad:  { wage: 4500,  wageReal: 160, hireFee: 220000,  hireFeeReal: 9000,   facilityDiscount: 0.05, desc: 'Reduces facility purchase & monthly maintenance/rent by 5%.' },
      mid:  { wage: 10000, wageReal: 320, hireFee: 1100000, hireFeeReal: 50000,  facilityDiscount: 0.10, desc: 'Reduces facility purchase & monthly maintenance/rent by 10%.' },
      best: { wage: 18500, wageReal: 600, hireFee: 4800000, hireFeeReal: 220000, facilityDiscount: 0.20, desc: 'Reduces facility purchase & monthly maintenance/rent by 20%.' },
    },
  },
  physio: {
    key: 'physio',
    name: 'Physiotherapist',
    maxSlots: 1,
    icon: '🩺',
    accent: '#ec4899',
    summary: 'Reduces injury/illness absence rates and speeds up player recovery time.',
    tiers: {
      bad:  { wage: 5000,  wageReal: 165, hireFee: 240000,  hireFeeReal: 10000,  injuryReduce: 0.15, recoveryBoost: 0.10, desc: 'Reduces injury/absence rate by 15% & recovery time by 10%.' },
      mid:  { wage: 10500, wageReal: 340, hireFee: 1100000, hireFeeReal: 50000,  injuryReduce: 0.30, recoveryBoost: 0.20, desc: 'Reduces injury/absence rate by 30% & recovery time by 20%.' },
      best: { wage: 19000, wageReal: 620, hireFee: 4400000, hireFeeReal: 200000, injuryReduce: 0.50, recoveryBoost: 0.35, desc: 'Reduces injury/absence rate by 50% & recovery time by 35%.' },
    },
  },
  youth_coach: {
    key: 'youth_coach',
    name: 'Youth Dev Coach',
    maxSlots: 1,
    icon: '🌱',
    accent: '#10b981',
    summary: 'Raises young players\' potential ceiling and slows age-related rating degradation.',
    tiers: {
      bad:  { wage: 5500,  wageReal: 180, hireFee: 280000,  hireFeeReal: 12000,  potBonus: 1, decayReduce: 0.15, desc: '+1 potential for young players & -15% rating degradation.' },
      mid:  { wage: 11500, wageReal: 370, hireFee: 1300000, hireFeeReal: 60000,  potBonus: 2, decayReduce: 0.30, desc: '+2 potential for young players & -30% rating degradation.' },
      best: { wage: 21500, wageReal: 700, hireFee: 5500000, hireFeeReal: 250000, potBonus: 3, decayReduce: 0.50, desc: '+3 potential for young players & -50% rating degradation.' },
    },
  },
};

const ROLE_ORDER = ['scout', 'mental_coach', 'media_trainer', 'assistant_coach', 'engineer', 'physio', 'youth_coach'];

const NAME_POOLS = {
  scout:           ['Dan Weller', 'Priya Raman', 'Marco Silva', 'Ana Torres', 'Tom Lindqvist', 'Yusuf Demir', 'Claire Moreau', 'Kenji Sato', 'Lucas Meyer'],
  mental_coach:    ['Dr. Elena Vance', 'Marcus Thorne', 'Sofia Lind', 'Dr. Hiro Tanaka', 'Nadia Haddad', 'Owen Gallagher'],
  media_trainer:   ['Chloe Mercer', 'Devon Brooks', 'Camille Laurent', 'Tarek Mansour', 'Sienna Reyes', 'Liam Kowalski'],
  assistant_coach: ['Alex Mercer', 'Jordan Hale', 'Mateo Cruz', 'Samira Noor', 'Viktor Novak', 'Hannah Sterling'],
  engineer:        ['Henrik Olsen', 'Rohan Patel', 'Elena Rossi', 'Caleb Wright', 'Mei-Ling Zhou', 'Tomasz Nowak'],
  physio:          ['Dr. Maya Lin', 'Callum Reid', 'Isabelle Dupont', 'Diego Morales', 'Freya Holm', 'Noah Okafor'],
  youth_coach:     ['Coach Danny Bell', 'Klara Jensen', 'Gabriel Costa', 'Amina Diallo', 'Benji Alvarez', 'Soren Berg'],
};

const CURATED_IRL_COACHES = [
  { name: 'Ferra',          club: 'Team Vitality (Historic)', region: 'Europe',        tier: 'best' },
  { name: 'Eversax',        club: 'Team Vitality',            region: 'Europe',        tier: 'best' },
  { name: 'Extra',          club: 'Karmine Corp',             region: 'Europe',        tier: 'best' },
  { name: 'Satthew',        club: 'Shopify Rebellion',        region: 'North America', tier: 'best' },
  { name: 'JKnaps',         club: 'Wildcard',                 region: 'Oceania',       tier: 'best' },
  { name: 'kuxir97',        club: 'Arancini',                 region: 'North America', tier: 'best' },
  { name: 'Snaski',         club: 'RLCS Veteran',             region: 'Europe',        tier: 'best' },
  { name: 'Mew',            club: 'Gentle Mates (Historic)',  region: 'Europe',        tier: 'best' },
  { name: 'Virge',          club: 'RLCS Veteran',             region: 'North America', tier: 'best' },
  { name: 'brunovisqui',    club: 'FURIA',                    region: 'South America', tier: 'best' },
  { name: 'Xpére',          club: 'Spacestation Gaming',      region: 'North America', tier: 'mid'  },
  { name: 'Nick',           club: 'M80',                      region: 'North America', tier: 'mid'  },
  { name: 'FreaKii.',       club: 'PWR',                      region: 'Oceania',       tier: 'mid'  },
  { name: 'RawGreg',        club: 'Next2Nu Esports',          region: 'North America', tier: 'mid'  },
  { name: 'Yukeo',          club: 'Novadrift',                region: 'South America', tier: 'mid'  },
  { name: 'STL',            club: 'Team Secret',              region: 'South America', tier: 'mid'  },
  { name: 'pekitas',        club: 'MIBR',                     region: 'South America', tier: 'mid'  },
  { name: 'eekso',          club: 'All Gamers Global',        region: 'Europe',        tier: 'mid'  },
  { name: 'Braan.',         club: 'Team Heretics',            region: 'Europe',        tier: 'mid'  },
  { name: 'Kasper',         club: 'BIG',                      region: 'Europe',        tier: 'mid'  },
  { name: 'adam_baguette',  club: 'NRG',                      region: 'North America', tier: 'mid'  },
  { name: 'creepy',         club: 'Twisted Minds',            region: 'MENA',          tier: 'mid'  },
  { name: 'Jimmah',         club: 'Wildcard',                 region: 'Oceania',       tier: 'bad'  },
  { name: 'Lawler',         club: 'Pioneers',                 region: 'SSA',           tier: 'bad'  },
  { name: 'Noxes',          club: 'Pioneers',                 region: 'SSA',           tier: 'bad'  },
  { name: 'Deano',          club: 'NorthStar Esports',        region: 'North America', tier: 'bad'  },
  { name: 'ostyn',          club: 'lsf',                      region: 'North America', tier: 'bad'  },
  { name: 'Michi',          club: 'Amethyst',                 region: 'South America', tier: 'bad'  },
];

const TOP_ORG_RE = /(vitality|karmine|g2|nrg|furia|falcons|gentle mates|bds|gen\.g|shopify|spacestation|twisted minds|secret|mibr|m80|pwr|heretics)/i;

let cachedIrlCoaches = null;
const loadedCoachDirs = new Set();

function loadIrlCoaches(extraDataDirs) {
  const searchDirs = Array.isArray(extraDataDirs) ? extraDataDirs.slice() : [];
  try {
    const Module = require('module');
    for (const k of Object.keys(Module._cache || {})) {
      if (/engine[\\/]league\.js$/i.test(k)) {
        searchDirs.push(path.join(path.dirname(k), '..', 'data'));
      }
    }
  } catch { }

  const newDirs = searchDirs.filter((d) => d && !loadedCoachDirs.has(d));
  if (cachedIrlCoaches && !newDirs.length) return cachedIrlCoaches;

  const map = new Map();
  for (const c of (cachedIrlCoaches || CURATED_IRL_COACHES)) {
    map.set(c.name.toLowerCase(), { ...c, irl: true });
  }

  for (const dir of newDirs) {
    loadedCoachDirs.add(dir);
    for (const fname of ['rlcs-2027.json', 'rlcs.json']) {
      const fpath = path.join(dir, fname);
      try {
        if (!fs.existsSync(fpath)) continue;
        const json = JSON.parse(fs.readFileSync(fpath, 'utf8'));
        for (const [rk, rdata] of Object.entries(json.regions || {})) {
          const region = (rdata && rdata.name) || rk;
          const isMajorRegion = /europe|north america/i.test(region);
          const isMidRegion = /south america|oceania|middle east|mena/i.test(region);
          for (const tm of (rdata && rdata.teams) || []) {
            if (!tm || !tm.coach) continue;
            const nm = String(tm.coach).trim();
            if (!nm) continue;
            const key = nm.toLowerCase();
            if (map.has(key)) continue;
            let tier = 'bad';
            if (TOP_ORG_RE.test(tm.name || '')) tier = isMajorRegion ? 'best' : 'mid';
            else if (isMajorRegion) tier = 'mid';
            else if (isMidRegion) tier = 'bad';
            map.set(key, { name: nm, club: tm.name || 'RLCS', region, tier, irl: true });
          }
        }
      } catch { }
    }
  }
  const tierRank = { best: 0, mid: 1, bad: 2 };
  cachedIrlCoaches = Array.from(map.values()).sort((a, b) => (tierRank[a.tier] - tierRank[b.tier]) || a.name.localeCompare(b.name));
  return cachedIrlCoaches;
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function addDaysIso(dateStr, days) {
  const dt = new Date(dateStr + 'T00:00:00Z');
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function daysBetweenIso(a, b) {
  return Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 86400000);
}

function isRealMoney(engine, state) {
  try {
    if (engine && typeof engine.realMoney === 'function') return !!engine.realMoney(state);
  } catch { }
  return !!(state && state.realMoney);
}

function wageForRoleTier(engine, state, role, tier) {
  const def = ROLE_DEFS[role];
  const t = def && def.tiers[tier];
  if (!t) return 0;
  return isRealMoney(engine, state) ? t.wageReal : t.wage;
}

function hireFeeForRoleTier(engine, state, role, tier) {
  const def = ROLE_DEFS[role];
  const t = def && def.tiers[tier];
  if (!t) return 0;
  return isRealMoney(engine, state) ? (t.hireFeeReal || 0) : (t.hireFee || 0);
}

// Monthly facility rent & maintenance (base + Engineer discounted)
function facilityMonthlyUpkeep(engine, state, tierOverride) {
  const tier = tierOverride != null
    ? Number(tierOverride) || 0
    : (typeof engine.facilityTier === 'function' ? Number(engine.facilityTier(state)) || 0 : Number((state && state.facility && state.facility.tier) || 0));
  const table = isRealMoney(engine, state) ? FACILITY_UPKEEP_REAL : FACILITY_UPKEEP_LEGACY;
  const base = table[clamp(tier, 0, table.length - 1)] || 0;
  const eng = getRoleEffect(state, 'engineer');
  const discount = eng ? eng.facilityDiscount : 0;
  const cost = Math.max(0, Math.round(base * (1 - discount)));
  return { tier, base, cost, saved: Math.max(0, base - cost), discount };
}

function ensureStaffState(engine, state) {
  if (!state || typeof state !== 'object') return null;
  if (!state.cpStaff || typeof state.cpStaff !== 'object') {
    state.cpStaff = {
      initialized: false,
      autoTrainEnabled: true,
      autoFill: true,
      skipCapped: false,
      lastFacilityBillMonth: state.currentDate ? String(state.currentDate).slice(0, 7) : null,
      lastNotice: null,
      noticeSeq: 0,
      stats: {
        scoutingDaysSaved: 0,
        egoMoraleSaved: 0,
        chatMoraleSaved: 0,
        sponsorBonusEarned: 0,
        followersBonusGained: 0,
        trainingSessionsBoosted: 0,
        autoTrainSessions: 0,
        facilityMoneySaved: 0,
        facilityUpkeepPaid: 0,
        injuriesPrevented: 0,
        injuryDaysSaved: 0,
        decayPrevented: 0,
      },
    };
  }
  if (!state.cpStaff.stats) {
    state.cpStaff.stats = {
      scoutingDaysSaved: 0,
      egoMoraleSaved: 0,
      chatMoraleSaved: 0,
      sponsorBonusEarned: 0,
      followersBonusGained: 0,
      trainingSessionsBoosted: 0,
      autoTrainSessions: 0,
      facilityMoneySaved: 0,
      facilityUpkeepPaid: 0,
      injuriesPrevented: 0,
      injuryDaysSaved: 0,
      decayPrevented: 0,
    };
  }
  if (state.cpStaff.stats.facilityUpkeepPaid == null) state.cpStaff.stats.facilityUpkeepPaid = 0;
  if (state.cpStaff.stats.evictions == null) state.cpStaff.stats.evictions = 0;
  if (!state.cpStaff.facilityLease || typeof state.cpStaff.facilityLease !== 'object') {
    state.cpStaff.facilityLease = { arrears: 0, missedMonths: 0, bannedUntil: null };
  }
  if (!state.cpStaff.lastFacilityBillMonth && state.currentDate) {
    state.cpStaff.lastFacilityBillMonth = String(state.currentDate).slice(0, 7);
  }

  // Hand Auto-Train exclusively to Assistant Coach (disable RL Career+'s free built-in autoTrain even on fresh saves!)
  if (!state.careerPlus || typeof state.careerPlus !== 'object') state.careerPlus = {};
  state.careerPlus.autoTrain = false;

  if (!Array.isArray(state.staff)) state.staff = [];
  for (const s of state.staff) {
    if (!s) continue;
    if (!s.role) s.role = 'scout';
    if (!TIER_META[s.tier]) s.tier = 'mid';
  }

  // Only clear default vanilla scouts on a genuinely brand-new career (day 0 / startDate with no scouting history)
  if (!state.cpStaff.initialized && !(typeof engine.isPlayerCareer === 'function' && engine.isPlayerCareer(state))) {
    state.cpStaff.initialized = true;
    const isBrandNew = !!state.startDate && state.currentDate === state.startDate
      && (!state.scouts || ((!state.scouts.jobs || !state.scouts.jobs.length) && (!state.scouts.reports || !Object.keys(state.scouts.reports).length)));
    const onlyDefaultScouts = state.staff.length > 0 && state.staff.every((s) => s.role === 'scout' && !s.hiredOn);
    if (isBrandNew && onlyDefaultScouts) {
      applyStarterStaff(engine, state);
    }
  }
  return state.cpStaff;
}

function clubAvgRating(engine, state) {
  const team = state && typeof engine.teamById === 'function' ? engine.teamById(state, state.userTeamId) : null;
  if (!team || !Array.isArray(team.playerIds) || !team.playerIds.length) return 70;
  let sum = 0, cnt = 0;
  for (const pid of team.playerIds) {
    const p = typeof engine.playerById === 'function' ? engine.playerById(state, pid) : null;
    if (p && !p.retired) { sum += Number(p.rating || 70); cnt++; }
  }
  return cnt ? sum / cnt : 70;
}

function clubTierClass(engine, state) {
  const avg = clubAvgRating(engine, state);
  const team = state && typeof engine.teamById === 'function' ? engine.teamById(state, state.userTeamId) : null;
  let stars = 0;
  try { if (team && typeof engine.clubStars === 'function') stars = Number(engine.clubStars(team)) || 0; } catch { }
  if (avg < 75 || (stars > 0 && stars <= 2.5)) return 'lower';
  if (avg < 81) return 'mid';
  return 'top';
}

function applyStarterStaff(engine, state) {
  const cls = clubTierClass(engine, state);
  // New careers start with 0 staff (0 scouts) so clubs choose who to buy and start with $0 staff wages!
  state.staff = [];
  return { clubClass: cls, count: 0 };
}

function getStaffByRole(state, role) {
  if (!state || !Array.isArray(state.staff)) return [];
  return state.staff.filter((s) => s && s.role === role);
}

function getSingleStaff(state, role) {
  const list = getStaffByRole(state, role);
  return list[0] || null;
}

function getRoleEffect(state, role) {
  const member = getSingleStaff(state, role);
  if (!member) return null;
  const def = ROLE_DEFS[role];
  const t = def && def.tiers[member.tier || 'bad'];
  return t ? { ...t, tier: member.tier || 'bad', member } : null;
}

function getEffectiveTrainCooldown(engine, state) {
  const base = Number(engine && engine.TRAIN_COOLDOWN_DAYS) || 7;
  const asst = getRoleEffect(state, 'assistant_coach');
  const red = asst ? Number(asst.trainDaysReduced || 0) : 0;
  return Math.max(1, base - red);
}

function nextStaffId(state) {
  let maxId = 0;
  for (const s of (state.staff || [])) {
    if (s && Number(s.id) > maxId) maxId = Number(s.id);
  }
  return maxId + 1;
}

function pickStaffName(state, role) {
  const used = new Set((state.staff || []).map((s) => s && s.name));
  const pool = NAME_POOLS[role] || NAME_POOLS.scout;
  for (const nm of pool) {
    if (!used.has(nm)) return nm;
  }
  return pool[used.size % pool.length] + ' Jr.';
}

function userSquadPlayers(engine, state) {
  const team = state && typeof engine.teamById === 'function' ? engine.teamById(state, state.userTeamId) : null;
  if (!team || !Array.isArray(team.playerIds)) return [];
  return team.playerIds
    .map((id) => engine.playerById(state, id))
    .filter((p) => p && !p.retired && !p.isUser);
}

function reconcileYouthPotential(engine, state) {
  const yc = getRoleEffect(state, 'youth_coach');
  const targetBonus = yc ? yc.potBonus : 0;
  const squad = userSquadPlayers(engine, state);
  for (const p of squad) {
    const isYoung = (p.age || 20) <= 22 || (p.peakAge != null && (p.age || 20) < p.peakAge);
    const prevBonus = Number(p._cpYouthBonus || 0);
    const desired = isYoung ? targetBonus : 0;
    if (prevBonus === desired) continue;
    if (p._cpBasePot == null) p._cpBasePot = p.potential != null ? p.potential : p.rating;
    const nextPot = clamp(p._cpBasePot + desired, p.rating || 40, 99);
    p.potential = nextPot;
    p._cpYouthBonus = desired;
    if (desired > 0 && p.peakAge != null && p.peakAge <= (p.age || 18)) {
      p.peakAge = (p.age || 18) + 2;
    }
    const rep = state.scouts && state.scouts.reports && state.scouts.reports[p.id];
    if (rep && desired > prevBonus) {
      const diff = desired - prevBonus;
      rep.potLo = clamp((rep.potLo || p.rating) + diff, p.rating, 99);
      rep.potHi = clamp((rep.potHi || nextPot) + diff, rep.potLo, 99);
    }
  }
}

function reconcileMentalMorale(engine, state) {
  const mc = getRoleEffect(state, 'mental_coach');
  const target = mc ? mc.moraleBoost : 0;
  const squad = userSquadPlayers(engine, state);
  for (const p of squad) {
    const prev = Number(p._cpMentalBonus || 0);
    if (prev === target) continue;
    const delta = target - prev;
    const cur = p.morale == null ? 70 : Number(p.morale);
    p.morale = clamp(Math.round((cur + delta) * 10) / 10, 0, 100);
    p._cpMentalBonus = target;
  }
}

function reconcileMediaOffers(state) {
  if (!state || !Array.isArray(state.mediaOffers)) return;
  const mt = getRoleEffect(state, 'media_trainer');
  const mult = mt ? (1 + mt.sponsorBoost) : 1;
  for (const off of state.mediaOffers) {
    if (!off || off.accepted) continue;
    if (off._cpBaseFee == null) off._cpBaseFee = Number(off.fee || 0);
    const step = off._cpBaseFee >= 100000 ? 1000 : (off._cpBaseFee >= 1000 ? 50 : 10);
    off.fee = Math.max(step, Math.round((off._cpBaseFee * mult) / step) * step);
  }
}

function pushInboxNote(state, title, body, link) {
  if (!state) return;
  if (!Array.isArray(state.inbox)) state.inbox = [];
  state.inbox.push({
    id: (state.nextId = (state.nextId || 5000) + 1),
    date: state.currentDate || null,
    type: 'board',
    title,
    body,
    link: link || 'office',
    read: false,
  });
}

function getActiveFacilityBan(state) {
  const lease = state && state.cpStaff && state.cpStaff.facilityLease;
  if (!lease || !lease.bannedUntil || !state.currentDate) return null;
  if (state.currentDate < lease.bannedUntil) return lease.bannedUntil;
  lease.bannedUntil = null;
  return null;
}

function payOverdueFacilityRent(engine, state) {
  const cfg = ensureStaffState(engine, state);
  const lease = cfg && cfg.facilityLease;
  if (!lease || !lease.arrears) return { ok: false, error: 'No overdue facility rent.' };
  const team = typeof engine.teamById === 'function' ? engine.teamById(state, state.userTeamId) : null;
  if (!team) return { ok: false, error: 'No club found.' };
  const fmt = typeof engine.fmtMoney === 'function' ? engine.fmtMoney : (n) => '$' + Math.round(n).toLocaleString();
  if ((team.budget || 0) < lease.arrears) {
    return { ok: false, error: `Not enough budget to clear overdue rent (${fmt(lease.arrears)} owed).` };
  }
  const paid = lease.arrears;
  team.budget = Math.round((team.budget || 0) - paid);
  cfg.stats.facilityUpkeepPaid = (cfg.stats.facilityUpkeepPaid || 0) + paid;
  lease.arrears = 0;
  lease.missedMonths = 0;
  const label = 'Paid overdue facility rent & maintenance';
  if (typeof engine.pushLedger === 'function') engine.pushLedger(state, 'facility', -paid, label);
  else {
    if (!Array.isArray(state.ledger)) state.ledger = [];
    state.ledger.push({ date: state.currentDate, kind: 'facility', amount: -paid, label });
  }
  return { ok: true, paid };
}

function processMonthlyFacilityUpkeep(engine, state) {
  const cfg = ensureStaffState(engine, state);
  if (!cfg || !state.currentDate) return 0;
  if (typeof engine.isPlayerCareer === 'function' && engine.isPlayerCareer(state)) return 0;
  const lease = cfg.facilityLease;
  // Auto-expire lease ban once date passes
  getActiveFacilityBan(state);

  const curMonth = String(state.currentDate).slice(0, 7);
  if (!cfg.lastFacilityBillMonth) {
    cfg.lastFacilityBillMonth = curMonth;
    return 0;
  }
  if (curMonth <= cfg.lastFacilityBillMonth) return 0;
  cfg.lastFacilityBillMonth = curMonth;

  const upkeep = facilityMonthlyUpkeep(engine, state);
  if (!upkeep.cost) {
    lease.arrears = 0;
    lease.missedMonths = 0;
    return 0;
  }
  const team = typeof engine.teamById === 'function' ? engine.teamById(state, state.userTeamId) : null;
  if (!team) return 0;

  const fmt = typeof engine.fmtMoney === 'function' ? engine.fmtMoney : (n) => '$' + Math.round(n).toLocaleString();
  const totalDue = (lease.arrears || 0) + upkeep.cost;

  // Can afford current month (+ any overdue arrears): pay cleanly and clear strikes!
  if ((team.budget || 0) >= totalDue) {
    team.budget = Math.round((team.budget || 0) - totalDue);
    cfg.stats.facilityUpkeepPaid = (cfg.stats.facilityUpkeepPaid || 0) + totalDue;
    if (upkeep.saved > 0) cfg.stats.facilityMoneySaved = (cfg.stats.facilityMoneySaved || 0) + upkeep.saved;
    const hadArrears = lease.arrears > 0;
    lease.arrears = 0;
    lease.missedMonths = 0;

    const label = hadArrears
      ? 'Facility rent & overdue balance cleared'
      : upkeep.saved > 0
        ? `Facility rent & maintenance (-${Math.round(upkeep.discount * 100)}% Engineer)`
        : 'Facility rent & maintenance';
    if (typeof engine.pushLedger === 'function') {
      engine.pushLedger(state, 'facility', -totalDue, label);
    } else {
      if (!Array.isArray(state.ledger)) state.ledger = [];
      state.ledger.push({ date: state.currentDate, kind: 'facility', amount: -totalDue, label });
    }
    return totalDue;
  }

  // Cannot afford rent: 3-Strike Eviction & 6-Month Facility Ban!
  lease.missedMonths = (lease.missedMonths || 0) + 1;
  lease.arrears = totalDue;

  if (lease.missedMonths === 1) {
    pushInboxNote(
      state,
      `Overdue HQ Rent (1/3): ${fmt(lease.arrears)}`,
      `Your club could not cover this month's ${fmt(upkeep.cost)} headquarters rent & maintenance. Pay the overdue balance in Finances within 2 months or your club will be evicted.`,
      'office'
    );
  } else if (lease.missedMonths === 2) {
    pushInboxNote(
      state,
      `Final Eviction Notice (2/3): ${fmt(lease.arrears)}`,
      `Second consecutive missed HQ rent payment! Your club now owes ${fmt(lease.arrears)}. Miss one more month and the landlord will evict your club and issue a 6-month facility lease ban.`,
      'office'
    );
  } else {
    // Strike 3 -> EVICTED back to Tier 0 + 180-day (6-month) lease ban!
    const banUntil = engine.addDays ? engine.addDays(state.currentDate, 180) : addDaysIso(state.currentDate, 180);
    state.facility = null;
    lease.arrears = 0;
    lease.missedMonths = 0;
    lease.bannedUntil = banUntil;
    cfg.stats.evictions = (cfg.stats.evictions || 0) + 1;
    pushInboxNote(
      state,
      'Evicted from Headquarters! (6-Month Facility Ban)',
      `After 3 consecutive missed rent payments, the landlord terminated your club's lease and repossessed your headquarters. Your club is banned from leasing new facilities until ${banUntil}.`,
      'office'
    );
  }
  return 0;
}

function hireStaff(engine, state, { role, tier, name, irl, club, region, replaceId }) {
  ensureStaffState(engine, state);
  if (typeof engine.isPlayerCareer === 'function' && engine.isPlayerCareer(state)) {
    return { ok: false, error: 'Staff management is only available in Manager Career.' };
  }
  const def = ROLE_DEFS[role];
  if (!def) return { ok: false, error: 'Unknown staff role.' };
  if (!TIER_META[tier]) return { ok: false, error: 'Invalid staff tier.' };

  const existing = getStaffByRole(state, role);
  const wage = wageForRoleTier(engine, state, role, tier);
  const fee = hireFeeForRoleTier(engine, state, role, tier);

  let target = null;
  if (replaceId != null) {
    target = (state.staff || []).find((s) => s && s.id === Number(replaceId) && s.role === role) || null;
  } else if (def.maxSlots === 1 && existing.length > 0) {
    target = existing[0];
  }

  if (!target && existing.length >= def.maxSlots) {
    return { ok: false, error: `Maximum ${def.maxSlots} ${def.name}(s) reached. Fire or upgrade an existing one.` };
  }

  const chosenName = (name && String(name).trim()) || (target && !irl ? target.name : pickStaffName(state, role));

  // Prevent accidentally paying to re-hire the exact same staff member & tier
  if (target && target.tier === tier && target.name === chosenName && !!target.irl === !!irl) {
    return { ok: false, error: `${chosenName} is already hired at ${TIER_META[tier].label} tier.` };
  }

  // Upfront signing / hiring fee deducted from club budget (no free switching!)
  const team = typeof engine.teamById === 'function' ? engine.teamById(state, state.userTeamId) : null;
  if (!team) return { ok: false, error: 'No club found.' };
  if (fee > 0 && (team.budget || 0) < fee) {
    const fmt = typeof engine.fmtMoney === 'function' ? engine.fmtMoney : (n) => '$' + Math.round(n).toLocaleString();
    return { ok: false, error: `Not enough budget to sign ${chosenName}: requires ${fmt(fee)} signing fee.` };
  }
  if (fee > 0) {
    team.budget = Math.round((team.budget || 0) - fee);
    const label = `Signed ${TIER_META[tier].label} ${def.name}: ${chosenName}`;
    if (typeof engine.pushLedger === 'function') {
      engine.pushLedger(state, 'staff', -fee, label);
    } else {
      if (!Array.isArray(state.ledger)) state.ledger = [];
      state.ledger.push({ date: state.currentDate || null, kind: 'staff', amount: -fee, label });
    }
  }

  if (target) {
    target.tier = tier;
    target.wage = wage;
    target.name = chosenName;
    target.irl = !!irl;
    if (club) target.club = club; else delete target.club;
    if (region) target.region = region; else delete target.region;
    target.hiredOn = state.currentDate || null;
  } else {
    state.staff.push({
      id: nextStaffId(state),
      role,
      tier,
      name: chosenName,
      wage,
      irl: !!irl,
      ...(club ? { club } : {}),
      ...(region ? { region } : {}),
      hiredOn: state.currentDate || null,
    });
  }

  // Ensure Auto-Train defaults ON when upgrading to a Best Assistant Coach
  if (role === 'assistant_coach' && tier === 'best' && state.cpStaff) {
    state.cpStaff.autoTrainEnabled = true;
  }

  if (role === 'youth_coach') reconcileYouthPotential(engine, state);
  if (role === 'mental_coach') reconcileMentalMorale(engine, state);
  if (role === 'media_trainer') reconcileMediaOffers(state);
  return { ok: true, fee, wage };
}

function fireStaff(engine, state, staffId) {
  ensureStaffState(engine, state);
  const idx = (state.staff || []).findIndex((s) => s && s.id === Number(staffId));
  if (idx === -1) return { ok: false, error: 'Staff member not found.' };
  const removed = state.staff[idx];

  if (removed.role === 'scout' && state.scouts && Array.isArray(state.scouts.jobs)) {
    const busyJob = state.scouts.jobs.find((j) => j && j.scoutId === removed.id);
    if (busyJob) {
      return { ok: false, error: `${removed.name} is currently out scouting a player. Recall them first.` };
    }
  }

  state.staff.splice(idx, 1);
  if (removed.role === 'youth_coach') reconcileYouthPotential(engine, state);
  if (removed.role === 'mental_coach') reconcileMentalMorale(engine, state);
  if (removed.role === 'media_trainer') reconcileMediaOffers(state);
  return { ok: true };
}

function fillAutoSlots(engine, state, rand, skipCapped) {
  if (typeof engine.trainableIds !== 'function') return;
  const trainable = engine.trainableIds(state);
  if (!trainable.length) return;
  const held = (typeof engine.trainingHeld === 'function' ? engine.trainingHeld(state) : null) || {};
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

function pushStaffNotice(cfg, kind, msg, date) {
  const seq = (cfg.noticeSeq || 0) + 1;
  cfg.noticeSeq = seq;
  cfg.lastNotice = { seq, kind, msg, date };
}

function runBestAsstAutoTrain(engine, state, rand) {
  const cfg = ensureStaffState(engine, state);
  if (!cfg || !cfg.autoTrainEnabled) return 0;
  if (typeof engine.isPlayerCareer === 'function' && engine.isPlayerCareer(state)) return 0;
  const asst = getRoleEffect(state, 'assistant_coach');
  if (!asst || !asst.autoTrain) return 0;

  const rng = typeof rand === 'function' ? rand : Math.random;
  let ran = 0;
  const cd = getEffectiveTrainCooldown(engine, state);
  let lastNames = [];
  for (let i = 0; i < 30 && engine.trainingReady(state); i++) {
    if (cfg.autoFill) fillAutoSlots(engine, state, rng, false);
    const slots = engine.trainingPlan(state).filter((s) => s && s.pid != null);
    if (!slots.length) break;
    const activeNames = Array.from(new Set(slots.map((s) => s.pid)))
      .map((pid) => engine.playerById(state, pid))
      .filter(Boolean)
      .map((p) => p.name);
    if (!activeNames.length) break;

    const nextDate = state.training && state.training.lastDate
      ? (engine.addDays ? engine.addDays(state.training.lastDate, cd) : addDaysIso(state.training.lastDate, cd))
      : state.currentDate;
    const targetDate = (engine.daysBetween ? engine.daysBetween(nextDate, state.currentDate) : daysBetweenIso(nextDate, state.currentDate)) >= 0
      ? nextDate
      : state.currentDate;
    const res = engine.runTraining(state, rng);
    if (!res || !res.ok) break;
    if (state.training) state.training.lastDate = targetDate;
    cfg.stats.autoTrainSessions++;
    lastNames = activeNames;
    ran++;
  }
  if (ran > 0 && lastNames.length) {
    const coachName = asst.member ? asst.member.name : 'Assistant Coach';
    const suffix = ran > 1 ? ` (${ran} sessions)` : '';
    pushStaffNotice(cfg, 'auto', `${coachName} auto-trained${suffix}: ${lastNames.join(', ')}`, state.currentDate);
  }
  return ran;
}

function buildStaffSnapshot(engine, state) {
  if (!state || typeof state !== 'object') return null;
  const cfg = ensureStaffState(engine, state);
  const real = isRealMoney(engine, state);
  const roster = (state.staff || []).map((s) => {
    const def = ROLE_DEFS[s.role] || ROLE_DEFS.scout;
    const tdef = def.tiers[s.tier || 'bad'] || def.tiers.bad;
    return {
      ...s,
      roleName: def.name,
      tierLabel: (TIER_META[s.tier] && TIER_META[s.tier].label) || 'Mid',
      effectDesc: tdef.desc,
    };
  });
  const roles = ROLE_ORDER.map((rk) => {
    const def = ROLE_DEFS[rk];
    return {
      key: def.key,
      name: def.name,
      icon: def.icon,
      accent: def.accent,
      maxSlots: def.maxSlots,
      supportsIrl: !!def.supportsIrl,
      summary: def.summary,
      hired: roster.filter((s) => s.role === rk),
      tiers: TIERS.map((tk) => ({
        key: tk,
        label: TIER_META[tk].label,
        badge: TIER_META[tk].badge,
        color: TIER_META[tk].color,
        wage: real ? def.tiers[tk].wageReal : def.tiers[tk].wage,
        hireFee: real ? def.tiers[tk].hireFeeReal : def.tiers[tk].hireFee,
        desc: def.tiers[tk].desc,
      })),
    };
  });
  return {
    realMoney: real,
    clubClass: clubTierClass(engine, state),
    totalWage: roster.reduce((acc, s) => acc + (Number(s.wage) || 0), 0),
    trainCooldownDays: getEffectiveTrainCooldown(engine, state),
    autoTrainUnlocked: !!(getRoleEffect(state, 'assistant_coach') && getRoleEffect(state, 'assistant_coach').autoTrain),
    autoTrainEnabled: !!cfg.autoTrainEnabled,
    autoFill: !!cfg.autoFill,
    skipCapped: !!cfg.skipCapped,
    facilityUpkeep: facilityMonthlyUpkeep(engine, state),
    facilityLease: {
      arrears: (cfg.facilityLease && cfg.facilityLease.arrears) || 0,
      missedMonths: (cfg.facilityLease && cfg.facilityLease.missedMonths) || 0,
      bannedUntil: getActiveFacilityBan(state),
    },
    lastNotice: cfg.lastNotice || null,
    stats: { ...cfg.stats },
    roster,
    roles,
    irlCoaches: loadIrlCoaches(),
  };
}

function applyStaffCommand(engine, state, cmd) {
  ensureStaffState(engine, state);
  if (!cmd || typeof cmd !== 'object') return { ok: false, error: 'Invalid staff command.' };
  if (cmd.op === 'hire') return hireStaff(engine, state, cmd);
  if (cmd.op === 'fire') return fireStaff(engine, state, cmd.id);
  if (cmd.op === 'pay-rent') return payOverdueFacilityRent(engine, state);
  if (cmd.op === 'cfg') {
    if (typeof cmd.autoTrainEnabled === 'boolean') state.cpStaff.autoTrainEnabled = cmd.autoTrainEnabled;
    if (typeof cmd.autoFill === 'boolean') state.cpStaff.autoFill = cmd.autoFill;
    if (typeof cmd.skipCapped === 'boolean') state.cpStaff.skipCapped = cmd.skipCapped;
    return { ok: true };
  }
  if (cmd.op === 'reset-starter') {
    if (state.scouts && state.scouts.jobs && state.scouts.jobs.length) {
      return { ok: false, error: 'Recall active scouts before resetting starter staff.' };
    }
    applyStarterStaff(engine, state);
    reconcileYouthPotential(engine, state);
    reconcileMentalMorale(engine, state);
    reconcileMediaOffers(state);
    return { ok: true };
  }
  return { ok: false, error: 'Unknown staff command: ' + cmd.op };
}

function wrapStaffEngine(engine, opts = {}) {
  if (!engine || engine.__staffRework) return false;
  engine.__staffRework = true;
  if (opts.dataDirs) loadIrlCoaches(opts.dataDirs);

  const origGenerateLeague    = engine.generateLeague;
  const origStartScouting     = engine.startScouting;
  const origEgoOf             = engine.egoOf;
  const origChatReply         = engine.chatReply;
  const origRefusePlayer      = engine.refusePlayer;
  const origSponsorIncome     = engine.sponsorIncome;
  const origAcceptMediaOffer  = engine.acceptMediaOffer;
  const origRefreshMedia      = engine.refreshMediaOffers;
  const origBumpFollowers     = engine.bumpFollowers;
  const origTrainingReady     = engine.trainingReady;
  const origTrainingDaysLeft  = engine.trainingDaysLeft;
  const origTrainingGain      = engine.trainingGain;
  const origRunTraining       = engine.runTraining;
  const origFacilityCost      = engine.facilityUpgradeCost;
  const origFacilityBoard     = engine.facilityBoard;
  const origBuyFacility       = engine.buyFacility;
  const origAdvance           = engine.advance;
  const origStartNextSeason   = engine.startNextSeason;
  const origApplySeriesResult = engine.applySeriesResult;
  const origApplyUserResult   = engine.applyUserResult;
  const origSimulateFixture   = engine.simulateFixture;
  const origSimulateNextGame  = engine.simulateNextGame;
  const origNextUserSeries    = engine.nextUserSeries;
  const origPlaceBet          = engine.placeBet;

  let activeState = null;
  const track = (st) => {
    if (st && typeof st === 'object' && Array.isArray(st.players) && st.userTeamId != null) {
      activeState = st;
      ensureStaffState(engine, st);
    }
  };

  function withDailyEffects(state, rand, fn) {
    track(state);
    if (!state || (typeof engine.isPlayerCareer === 'function' && engine.isPlayerCareer(state))) {
      return fn();
    }
    const cfg = ensureStaffState(engine, state);
    const mc = getRoleEffect(state, 'mental_coach');
    const mt = getRoleEffect(state, 'media_trainer');
    const ph = getRoleEffect(state, 'physio');
    const yc = getRoleEffect(state, 'youth_coach');

    // Snapshot active scouting jobs so we can sharpen report accuracy for Mid/Best scouts on completion!
    const jobsBefore = (state.scouts && Array.isArray(state.scouts.jobs))
      ? state.scouts.jobs.map((j) => ({ playerId: j.playerId, scoutId: j.scoutId, tier: j.cpTier || null }))
      : [];

    const squadBefore = new Map();
    for (const p of userSquadPlayers(engine, state)) {
      squadBefore.set(p.id, {
        morale: p.morale == null ? 70 : Number(p.morale),
        followers: Number(p.followers || 0),
        ratingExact: p.ratingExact == null ? Number(p.rating || 70) : Number(p.ratingExact),
        hadAbsence: !!p.absence,
      });
    }
    const inboxLenBefore = Array.isArray(state.inbox) ? state.inbox.length : 0;
    const headLenBefore = Array.isArray(state.headlines) ? state.headlines.length : 0;
    const teamBefore = typeof engine.teamById === 'function' ? engine.teamById(state, state.userTeamId) : null;
    const orgFollowersBefore = teamBefore && teamBefore.followers != null ? Number(teamBefore.followers) : null;

    const res = fn();
    const rng = typeof rand === 'function' ? rand : Math.random;

    // 0. Monthly Facility Rent & Maintenance (with Engineer discount)
    processMonthlyFacilityUpkeep(engine, state);

    // 0b. Tighten newly completed scout report accuracy based on scout tier (Mid: ±2, Best: ±1!)
    if (jobsBefore.length && state.scouts && state.scouts.reports) {
      const stillActive = new Set((state.scouts.jobs || []).map((j) => j.playerId));
      const scoutsById = new Map(getStaffByRole(state, 'scout').map((s) => [s.id, s]));
      for (const jb of jobsBefore) {
        if (stillActive.has(jb.playerId)) continue;
        const rep = state.scouts.reports[jb.playerId];
        if (!rep) continue;
        const sc = scoutsById.get(jb.scoutId);
        const tier = jb.tier || (sc && sc.tier) || 'bad';
        const spread = (ROLE_DEFS.scout.tiers[tier] && ROLE_DEFS.scout.tiers[tier].potSpread) ?? 3;
        if (spread < 3) {
          const p = typeof engine.playerById === 'function' ? engine.playerById(state, jb.playerId) : null;
          if (p) {
            const ceil = typeof engine.reachableCeiling === 'function'
              ? engine.reachableCeiling(p)
              : Math.max(p.rating || 40, p.potential || p.rating || 40);
            rep.potLo = clamp(Math.max(p.rating || 40, ceil - spread), 40, 99);
            rep.potHi = clamp(Math.max(rep.potLo, ceil + spread), 40, 99);
          }
        }
      }
    }

    for (const p of userSquadPlayers(engine, state)) {
      const pre = squadBefore.get(p.id);
      if (!pre) continue;

      if (mc) {
        const curM = p.morale == null ? 70 : Number(p.morale);
        const dm = curM - pre.morale;
        if (dm < 0) {
          const saved = Math.abs(dm) * mc.egoReduce;
          p.morale = clamp(Math.round((curM + saved) * 10) / 10, 0, 100);
          cfg.stats.egoMoraleSaved = Math.round((cfg.stats.egoMoraleSaved + saved) * 10) / 10;
        } else if (dm > 0) {
          const extra = dm * (mc.moraleBoost / 100);
          p.morale = clamp(Math.round((curM + extra) * 10) / 10, 0, 100);
        }
      }

      if (mt) {
        const curF = Number(p.followers || 0);
        const df = curF - pre.followers;
        if (df > 0) {
          const bonus = Math.max(1, Math.round(df * mt.followerBoost));
          p.followers = curF + bonus;
          cfg.stats.followersBonusGained += bonus;
        }
      }

      if (ph && !pre.hadAbsence && p.absence && !p.absence.media) {
        const cat = p.absence.cat || 'injury';
        if (cat === 'injury' || cat === 'illness') {
          if (rng() < ph.injuryReduce) {
            p.absence = null;
            cfg.stats.injuriesPrevented++;
            if (Array.isArray(state.inbox) && state.inbox.length > inboxLenBefore) {
              for (let i = state.inbox.length - 1; i >= inboxLenBefore; i--) {
                const msg = state.inbox[i];
                if (msg && msg.type === 'absence' && msg.data && msg.data.playerId === p.id) {
                  state.inbox.splice(i, 1);
                }
              }
            }
            if (Array.isArray(state.headlines) && state.headlines.length > headLenBefore) {
              for (let i = state.headlines.length - 1; i >= headLenBefore; i--) {
                const h = state.headlines[i];
                if (h && h.kind === 'injury' && h.playerId === p.id) {
                  state.headlines.splice(i, 1);
                }
              }
            }
            const ch = (state.chats || []).find((c) => c && c.playerId === p.id);
            if (ch && ch.pending && (ch.pending.kind === 'injury' || ch.pending.kind === 'illness')) {
              ch.pending = null;
            }
          } else if (p.absence.days > 1) {
            const origDays = Number(p.absence.days);
            const newDays = Math.max(1, Math.round(origDays * (1 - ph.recoveryBoost)));
            if (newDays < origDays) {
              const saved = origDays - newDays;
              p.absence.days = newDays;
              p.absence.until = engine.addDays ? engine.addDays(p.absence.since, newDays) : addDaysIso(p.absence.since, newDays);
              cfg.stats.injuryDaysSaved += saved;
            }
          }
        }
      }

      if (yc) {
        const curR = p.ratingExact == null ? Number(p.rating || 70) : Number(p.ratingExact);
        const dr = curR - pre.ratingExact;
        if (dr < 0) {
          const saved = Math.abs(dr) * yc.decayReduce;
          p.ratingExact = clamp(curR + saved, 40, 99);
          p.rating = clamp(Math.floor(p.ratingExact), 40, 99);
          cfg.stats.decayPrevented = Math.round((cfg.stats.decayPrevented + saved) * 100) / 100;
        }
      }
    }

    if (mt && teamBefore && orgFollowersBefore != null && teamBefore.followers > orgFollowersBefore) {
      const df = teamBefore.followers - orgFollowersBefore;
      const bonus = Math.max(1, Math.round(df * mt.followerBoost));
      teamBefore.followers += bonus;
      cfg.stats.followersBonusGained += bonus;
    }

    reconcileMediaOffers(state);
    reconcileYouthPotential(engine, state);
    reconcileMentalMorale(engine, state);
    return res;
  }

  // 0. New career starter staff
  if (typeof origGenerateLeague === 'function') {
    engine.generateLeague = function srGenerateLeague(cfgOpt, rand) {
      const st = origGenerateLeague.call(this, cfgOpt, rand);
      if (st && !(typeof engine.isPlayerCareer === 'function' && engine.isPlayerCareer(st))) {
        ensureStaffState(engine, st);
        applyStarterStaff(engine, st);
        st.cpStaff.initialized = true;
      }
      return st;
    };
  }

  // 1. SCOUT: pick highest-tier free scout first + deterministic non-overlapping tier bands (Bad 8-10d, Mid 6-7d, Best 3-5d)
  if (typeof origStartScouting === 'function') {
    engine.startScouting = function srStartScouting(state, playerId, rand) {
      track(state);
      const scouts = getStaffByRole(state, 'scout');
      const jobs = (state.scouts && Array.isArray(state.scouts.jobs)) ? state.scouts.jobs : [];
      if (scouts.length === 0) {
        return { ok: false, error: 'No scouts hired! Buy a Scout in the Staff tab to uncover player potential.' };
      }
      if (jobs.length >= scouts.length) {
        return { ok: false, error: `All ${scouts.length} hired scout(s) are busy. Hire another Scout or recall one.` };
      }
      const busyIds = new Set(jobs.map((j) => j.scoutId).filter((id) => id != null));
      const tierPriority = { best: 0, mid: 1, bad: 2 };
      const bestFree = scouts
        .filter((s) => !busyIds.has(s.id))
        .sort((a, b) => (tierPriority[a.tier] ?? 2) - (tierPriority[b.tier] ?? 2))[0] || scouts[0];

      const prevLen = jobs.length;
      const res = origStartScouting.call(this, state, playerId, rand);
      if (res && res.ok && state.scouts && state.scouts.jobs.length > prevLen) {
        const job = state.scouts.jobs[state.scouts.jobs.length - 1];
        if (bestFree) job.scoutId = bestFree.id;
        const tier = (bestFree && bestFree.tier) || 'bad';
        const tdef = ROLE_DEFS.scout.tiers[tier] || ROLE_DEFS.scout.tiers.bad;
        job.cpTier = tier;

        // Deterministic tier band so Best (3-5d) is ALWAYS faster than Mid (6-7d), which is ALWAYS faster than Bad (8-10d)!
        if (job && job.endDate && state.currentDate && !res.resumed) {
          const origDays = engine.daysBetween ? engine.daysBetween(state.currentDate, job.endDate) : daysBetweenIso(state.currentDate, job.endDate);
          const rng = typeof rand === 'function' ? rand : Math.random;
          const span = tdef.maxDays - tdef.minDays + 1;
          const newDays = tdef.minDays + Math.floor(rng() * span);
          const saved = Math.max(0, origDays - newDays);
          job.endDate = engine.addDays ? engine.addDays(state.currentDate, newDays) : addDaysIso(state.currentDate, newDays);
          res.days = newDays;
          state.cpStaff.stats.scoutingDaysSaved += saved;
        }
      }
      return res;
    };
  }

  // 2. MENTAL COACH
  if (typeof origEgoOf === 'function') {
    engine.egoOf = function srEgoOf(player) {
      const base = origEgoOf.call(this, player);
      if (activeState && player && player.teamId === activeState.userTeamId) {
        const mc = getRoleEffect(activeState, 'mental_coach');
        if (mc) return Math.max(0.1, base * (1 - mc.egoReduce));
      }
      return base;
    };
  }

  function wrapChatMoraleGuard(origFn) {
    if (typeof origFn !== 'function') return origFn;
    return function srChatGuard(state, playerId, ...rest) {
      track(state);
      const p = typeof engine.playerById === 'function' ? engine.playerById(state, playerId) : null;
      const beforeM = p ? (p.morale == null ? 70 : Number(p.morale)) : null;
      const res = origFn.call(this, state, playerId, ...rest);
      const mc = getRoleEffect(state, 'mental_coach');
      if (p && beforeM != null && mc) {
        const afterM = p.morale == null ? 70 : Number(p.morale);
        const loss = beforeM - afterM;
        if (loss > 0) {
          const keepFrac = 1 - (1 - mc.chatProtect) * (1 - mc.egoReduce);
          const refund = loss * keepFrac;
          p.morale = clamp(Math.round((afterM + refund) * 10) / 10, 0, 100);
          state.cpStaff.stats.chatMoraleSaved = Math.round((state.cpStaff.stats.chatMoraleSaved + refund) * 10) / 10;
        }
      }
      return res;
    };
  }
  if (typeof origChatReply === 'function') engine.chatReply = wrapChatMoraleGuard(origChatReply);
  if (typeof origRefusePlayer === 'function') engine.refusePlayer = wrapChatMoraleGuard(origRefusePlayer);

  // 3. MEDIA TRAINER
  if (typeof origSponsorIncome === 'function') {
    engine.sponsorIncome = function srSponsorIncome(state, team) {
      track(state);
      const base = origSponsorIncome.call(this, state, team);
      if (team && state && team.id === state.userTeamId) {
        const mt = getRoleEffect(state, 'media_trainer');
        if (mt && base > 0) {
          const step = isRealMoney(engine, state) ? 100 : 1000;
          return Math.round((base * (1 + mt.sponsorBoost)) / step) * step;
        }
      }
      return base;
    };
  }

  if (typeof origRefreshMedia === 'function') {
    engine.refreshMediaOffers = function srRefreshMedia(state) {
      track(state);
      const out = origRefreshMedia.call(this, state);
      reconcileMediaOffers(state);
      return out;
    };
  }

  if (typeof origAcceptMediaOffer === 'function') {
    engine.acceptMediaOffer = function srAcceptMedia(state, offerId) {
      track(state);
      reconcileMediaOffers(state);
      const off = (state.mediaOffers || []).find((o) => o && o.id === offerId);
      const baseFee = off && off._cpBaseFee != null ? off._cpBaseFee : (off ? off.fee : 0);
      const res = origAcceptMediaOffer.call(this, state, offerId);
      const mt = getRoleEffect(state, 'media_trainer');
      if (res && res.ok && off && mt) {
        if (off.fee > baseFee) {
          state.cpStaff.stats.sponsorBonusEarned += (off.fee - baseFee);
        }
        const p = typeof engine.playerById === 'function' ? engine.playerById(state, off.pid) : null;
        if (p) {
          const cutDays = mt.cooldownWeekends * 7;
          const addD = (d, n) => (engine.addDays ? engine.addDays(d, n) : addDaysIso(d, n));
          const diffD = (a, b) => (engine.daysBetween ? engine.daysBetween(a, b) : daysBetweenIso(a, b));
          const origUntil = (p.absence && p.absence.until) || off.until || state.currentDate;
          const origRest = p.mediaFreeOn ? Math.max(0, diffD(origUntil, p.mediaFreeOn) - 1) : 7;
          const newRest = Math.max(0, origRest - cutDays);
          const overflow = Math.max(0, cutDays - origRest);

          if (overflow > 0 && off.kind === 'campaign' && p.absence && p.absence.media && p.absence.days > 7) {
            const newDays = Math.max(7, p.absence.days - overflow);
            if (newDays < p.absence.days) {
              p.absence.days = newDays;
              p.absence.until = addD(state.currentDate, newDays - 1);
              off.until = p.absence.until;
              res.until = p.absence.until;
            }
          }
          const finalUntil = (p.absence && p.absence.until) || origUntil;
          p.mediaFreeOn = addD(finalUntil, newRest + 1);
        }
      }
      return res;
    };
  }

  if (typeof origBumpFollowers === 'function') {
    engine.bumpFollowers = function srBumpFollowers(state, player, mult, rand) {
      track(state);
      const gained = origBumpFollowers.call(this, state, player, mult, rand);
      if (state && player && player.teamId === state.userTeamId && gained > 0) {
        const mt = getRoleEffect(state, 'media_trainer');
        if (mt) {
          const extra = Math.max(1, Math.round(gained * mt.followerBoost));
          player.followers = (player.followers || 0) + extra;
          state.cpStaff.stats.followersBonusGained += extra;
          return gained + extra;
        }
      }
      return gained;
    };
  }

  // 4. ASSISTANT COACH
  if (typeof origTrainingReady === 'function') {
    engine.trainingReady = function srTrainingReady(state) {
      track(state);
      if (!state || !state.training || !state.training.lastDate) return true;
      const cd = getEffectiveTrainCooldown(engine, state);
      const elapsed = engine.daysBetween ? engine.daysBetween(state.training.lastDate, state.currentDate) : daysBetweenIso(state.training.lastDate, state.currentDate);
      return elapsed >= cd;
    };
  }

  if (typeof origTrainingDaysLeft === 'function') {
    engine.trainingDaysLeft = function srTrainingDaysLeft(state) {
      track(state);
      if (engine.trainingReady(state)) return 0;
      const cd = getEffectiveTrainCooldown(engine, state);
      const elapsed = engine.daysBetween ? engine.daysBetween(state.training.lastDate, state.currentDate) : daysBetweenIso(state.training.lastDate, state.currentDate);
      return Math.max(0, cd - elapsed);
    };
  }

  if (typeof origTrainingGain === 'function') {
    engine.trainingGain = function srTrainingGain(state) {
      track(state);
      const gains = origTrainingGain.call(this, state) || {};
      const asst = getRoleEffect(state, 'assistant_coach');
      if (asst && asst.trainBoost > 0) {
        for (const k of Object.keys(gains)) {
          gains[k] = gains[k] * (1 + asst.trainBoost);
        }
      }
      return gains;
    };
  }

  if (typeof origRunTraining === 'function') {
    engine.runTraining = function srRunTraining(state, rand) {
      track(state);
      const asst = getRoleEffect(state, 'assistant_coach');
      if (!engine.trainingReady(state)) {
        return { ok: false, error: `Training is not ready for another ${engine.trainingDaysLeft(state)} day(s).` };
      }
      const prevLast = state.training ? state.training.lastDate : null;
      if (state.training && prevLast && asst && asst.trainDaysReduced > 0) {
        const vanillaDays = engine.daysBetween ? engine.daysBetween(prevLast, state.currentDate) : daysBetweenIso(prevLast, state.currentDate);
        if (vanillaDays < (Number(engine.TRAIN_COOLDOWN_DAYS) || 7)) {
          state.training.lastDate = null;
        }
      }

      const preRatings = new Map();
      const plan = typeof engine.trainingPlan === 'function' ? engine.trainingPlan(state) : [];
      for (const s of plan) {
        if (!s || s.pid == null) continue;
        const p = engine.playerById(state, s.pid);
        if (p) preRatings.set(p.id, p.ratingExact == null ? Number(p.rating) : Number(p.ratingExact));
      }

      const res = origRunTraining.call(this, state, rand);
      if (!res || !res.ok) {
        if (state.training && prevLast && !state.training.lastDate) state.training.lastDate = prevLast;
        return res;
      }

      if (asst && asst.trainBoost > 0) {
        let boostedAny = false;
        for (const [pid, beforeR] of preRatings.entries()) {
          const p = engine.playerById(state, pid);
          if (!p) continue;
          const afterR = p.ratingExact == null ? Number(p.rating) : Number(p.ratingExact);
          const delta = afterR - beforeR;
          if (delta > 0) {
            const cap = state.realism ? Math.min(99, (p.potential || p.rating) + 1) : 99;
            p.ratingExact = clamp(Math.min(cap, afterR + delta * asst.trainBoost), 40, 99);
            p.rating = clamp(Math.floor(p.ratingExact), 40, 99);
            boostedAny = true;
          }
        }
        if (boostedAny) state.cpStaff.stats.trainingSessionsBoosted++;
      }
      return res;
    };
  }

  // 5. ENGINEER: upgrade costs + monthly rent/maintenance on facilityBoard & buyFacility
  if (typeof origFacilityCost === 'function') {
    engine.facilityUpgradeCost = function srFacilityCost(state, tier) {
      track(state);
      const base = origFacilityCost.call(this, state, tier);
      if (base == null) return base;
      const eng = getRoleEffect(state, 'engineer');
      if (!eng) return base;
      return Math.max(0, Math.round(base * (1 - eng.facilityDiscount)));
    };
  }

  if (typeof origFacilityBoard === 'function') {
    engine.facilityBoard = function srFacilityBoard(state) {
      track(state);
      const board = origFacilityBoard.call(this, state);
      if (!board || !Array.isArray(board.list)) return board;
      const eng = getRoleEffect(state, 'engineer');
      const discount = eng ? eng.facilityDiscount : 0;
      const team = typeof engine.teamById === 'function' ? engine.teamById(state, state.userTeamId) : null;
      const budget = team ? Number(team.budget || 0) : 0;
      const banUntil = getActiveFacilityBan(state);
      const arrears = (state.cpStaff && state.cpStaff.facilityLease && state.cpStaff.facilityLease.arrears) || 0;
      board.engineerDiscount = discount;
      board.monthlyUpkeep = facilityMonthlyUpkeep(engine, state);
      board.evictionBanUntil = banUntil;
      board.rentArrears = arrears;
      board.list = board.list.map((item) => {
        const discCost = Math.max(0, Math.round(item.cost * (1 - discount)));
        const discPrice = Math.max(0, Math.round(item.price * (1 - discount)));
        const upkeep = facilityMonthlyUpkeep(engine, state, item.tier);
        return {
          ...item,
          origCost: item.cost,
          cost: discCost,
          price: discPrice,
          monthlyUpkeep: upkeep.cost,
          monthlyUpkeepBase: upkeep.base,
          affordable: !banUntil && !arrears && !!team && board.tier < item.tier && budget >= discCost,
        };
      });
      return board;
    };
  }

  if (typeof origBuyFacility === 'function') {
    engine.buyFacility = function srBuyFacility(state, tier) {
      track(state);
      const banUntil = getActiveFacilityBan(state);
      if (banUntil) {
        return { ok: false, error: `Eviction ban active until ${banUntil}. Landlords refuse to lease your club a new headquarters.` };
      }
      const lease = state.cpStaff && state.cpStaff.facilityLease;
      if (lease && lease.arrears > 0) {
        const fmt = typeof engine.fmtMoney === 'function' ? engine.fmtMoney : (n) => '$' + Math.round(n).toLocaleString();
        return { ok: false, error: `Clear your overdue HQ rent (${fmt(lease.arrears)}) in Finances before upgrading.` };
      }
      const eng = getRoleEffect(state, 'engineer');
      if (!eng) return origBuyFacility.call(this, state, tier);
      const origCost = origFacilityCost ? origFacilityCost.call(this, state, tier) : null;
      if (origCost == null) return origBuyFacility.call(this, state, tier);
      const discCost = Math.max(0, Math.round(origCost * (1 - eng.facilityDiscount)));
      const saved = Math.max(0, origCost - discCost);
      const team = typeof engine.teamById === 'function' ? engine.teamById(state, state.userTeamId) : null;
      if (!team) return origBuyFacility.call(this, state, tier);
      if ((team.budget || 0) < discCost) {
        return { ok: false, error: `Not enough money: this move costs ${engine.fmtMoney ? engine.fmtMoney(discCost) : '$' + discCost}.` };
      }
      const ledgerBefore = Array.isArray(state.ledger) ? state.ledger.length : 0;
      team.budget += saved;
      const res = origBuyFacility.call(this, state, tier);
      if (!res || !res.ok) {
        team.budget -= saved;
        return res;
      }
      if (Array.isArray(state.ledger) && state.ledger.length > ledgerBefore) {
        const last = state.ledger[state.ledger.length - 1];
        if (last && last.kind === 'facility') last.amount = -discCost;
      }
      state.cpStaff.stats.facilityMoneySaved += saved;
      res.cost = discCost;
      res.saved = saved;
      return res;
    };
  }

  // 6. ADVANCE & MATCH HOOKS
  if (typeof origAdvance === 'function') {
    engine.advance = function srAdvance(state, rand, mode) {
      track(state);
      if (!state || (typeof engine.isPlayerCareer === 'function' && engine.isPlayerCareer(state))) {
        return origAdvance.call(this, state, rand, mode);
      }
      if (mode === 'next') {
        let lastRes = { stopped: 'day' };
        for (let i = 0; i < 200; i++) {
          runBestAsstAutoTrain(engine, state, rand);
          lastRes = withDailyEffects(state, rand, () => origAdvance.call(this, state, rand, 'day'));
          runBestAsstAutoTrain(engine, state, rand);
          if (lastRes && lastRes.stopped !== 'day') return lastRes;
        }
        return lastRes;
      }
      runBestAsstAutoTrain(engine, state, rand);
      const res = withDailyEffects(state, rand, () => origAdvance.call(this, state, rand, mode));
      runBestAsstAutoTrain(engine, state, rand);
      return res;
    };
  }

  for (const [name, orig] of [
    ['applySeriesResult', origApplySeriesResult],
    ['applyUserResult', origApplyUserResult],
    ['simulateFixture', origSimulateFixture],
    ['simulateNextGame', origSimulateNextGame],
    ['nextUserSeries', origNextUserSeries],
  ]) {
    if (typeof orig !== 'function') continue;
    engine[name] = function srMatchWrap(state, ...rest) {
      const rand = rest.find((a) => typeof a === 'function');
      return withDailyEffects(state, rand, () => {
        const out = orig.call(this, state, ...rest);
        runBestAsstAutoTrain(engine, state, rand);
        return out;
      });
    };
  }

  // 7. START NEXT SEASON
  if (typeof origStartNextSeason === 'function') {
    engine.startNextSeason = function srStartNextSeason(state, rand) {
      track(state);
      if (!state || (typeof engine.isPlayerCareer === 'function' && engine.isPlayerCareer(state))) {
        return origStartNextSeason.call(this, state, rand);
      }
      const mt = getRoleEffect(state, 'media_trainer');
      const ledgerBefore = Array.isArray(state.ledger) ? state.ledger.length : 0;
      const out = withDailyEffects(state, rand, () => origStartNextSeason.call(this, state, rand));
      if (mt && Array.isArray(state.ledger)) {
        const team = typeof engine.teamById === 'function' ? engine.teamById(state, state.userTeamId) : null;
        for (let i = ledgerBefore; i < state.ledger.length; i++) {
          const entry = state.ledger[i];
          if (entry && entry.kind === 'sponsor' && entry.amount > 0 && team) {
            const step = isRealMoney(engine, state) ? 100 : 1000;
            const bonus = Math.round((entry.amount * mt.sponsorBoost) / step) * step;
            if (bonus > 0) {
              team.budget += bonus;
              entry.amount += bonus;
              state.cpStaff.stats.sponsorBonusEarned += bonus;
            }
          }
        }
      }
      runBestAsstAutoTrain(engine, state, rand);
      return out;
    };
  }

  // 8. Command channel: handles sr:* AND disables cp: autoTrain override so Assistant Coach owns Auto-Train!
  if (typeof origPlaceBet === 'function') {
    engine.placeBet = function srPlaceBet(state, kind, ref, teamId, stake) {
      track(state);
      if (typeof kind === 'string' && kind.startsWith('sr:')) {
        try {
          return applyStaffCommand(engine, state, JSON.parse(kind.slice(3)));
        } catch (e) {
          return { ok: false, error: 'Staff Rework error: ' + e.message };
        }
      }
      const res = origPlaceBet.call(this, state, kind, ref, teamId, stake);
      // Keep Career+ built-in autoTrain off while Staff Rework is active
      if (state && state.careerPlus) state.careerPlus.autoTrain = false;
      return res;
    };
  }

  return true;
}

module.exports = {
  TIERS,
  TIER_META,
  ROLE_DEFS,
  ROLE_ORDER,
  FACILITY_UPKEEP_REAL,
  FACILITY_UPKEEP_LEGACY,
  loadIrlCoaches,
  hireFeeForRoleTier,
  facilityMonthlyUpkeep,
  ensureStaffState,
  applyStarterStaff,
  getStaffByRole,
  getSingleStaff,
  getRoleEffect,
  getEffectiveTrainCooldown,
  hireStaff,
  fireStaff,
  buildStaffSnapshot,
  applyStaffCommand,
  wrapStaffEngine,
};

(function () {
  'use strict';
  if (window.__staffReworkUI) return;
  window.__staffReworkUI = true;

  let selectedRole = 'scout';
  let asstSubTab = 'standard'; // 'standard' | 'irl'
  let irlSearch = '';
  let irlTierFilter = 'all';
  let lastSeenStaffNoticeSeq = 0;

  const ROLE_PERKS = {
    scout: {
      bad:  ['Unlocks 1 scouting slot', 'Scouting takes 8–10 days', 'Standard potential accuracy (±3)'],
      mid:  ['Unlocks 1 scouting slot', 'Scouting takes 6–7 days', 'Sharper potential accuracy (±2)'],
      best: ['Unlocks 1 scouting slot', 'Fastest scouting: 3–5 days', 'Pinpoint potential accuracy (±1)'],
    },
    mental_coach: {
      bad:  ['Player ego -5%', 'Squad morale +3%', 'Chat morale loss -5%'],
      mid:  ['Player ego -10%', 'Squad morale +6%', 'Chat morale loss -10%'],
      best: ['Player ego -15%', 'Squad morale +10%', 'Chat morale loss -20%'],
    },
    media_trainer: {
      bad:  ['Sponsorship & media pay +5%', 'Sponsorship cooldown -1 weekend', 'Org & player follower growth +5%'],
      mid:  ['Sponsorship & media pay +10%', 'Sponsorship cooldown -2 weekends', 'Org & player follower growth +10%'],
      best: ['Sponsorship & media pay +20%', 'Sponsorship cooldown -3 weekends', 'Org & player follower growth +20%'],
    },
    assistant_coach: {
      bad:  ['Training cooldown -1 day (6d)', 'Training effectiveness +5%'],
      mid:  ['Training cooldown -2 days (5d)', 'Training effectiveness +10%'],
      best: ['Unlocks Auto-Train', 'Training cooldown -3 days (4d)', 'Training effectiveness +15%'],
    },
    engineer: {
      bad:  ['Facility upgrade costs -5%', 'Monthly facility rent & maintenance -5%'],
      mid:  ['Facility upgrade costs -10%', 'Monthly facility rent & maintenance -10%'],
      best: ['Facility upgrade costs -20%', 'Monthly facility rent & maintenance -20%'],
    },
    physio: {
      bad:  ['Injury & illness rate -15%', 'Recovery duration -10%'],
      mid:  ['Injury & illness rate -30%', 'Recovery duration -20%'],
      best: ['Injury & illness rate -50%', 'Recovery duration -35%'],
    },
    youth_coach: {
      bad:  ['Young players potential +1', 'Rating degradation -15%'],
      mid:  ['Young players potential +2', 'Rating degradation -30%'],
      best: ['Young players potential +3', 'Rating degradation -50%'],
    },
  };

  const st = document.createElement('style');
  st.textContent = `
    .sr-shell{display:flex;flex-direction:column;gap:12px;height:100%;max-height:100%;min-height:0;overflow:hidden;color:#eef4fc}
    .sr-bar{flex:none;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;padding:12px 16px;border-radius:10px;
      background:linear-gradient(125deg,rgba(0,212,255,.14),rgba(13,20,32,.94) 55%,rgba(168,85,247,.12));
      border:1px solid #26405e;box-shadow:inset 0 3px 0 #00d4ff,0 8px 22px rgba(0,0,0,.35)}
    .sr-bar-title{font-size:17px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#fff;margin-right:8px}
    .sr-bar-left{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
    .sr-pill{padding:3px 9px;border-radius:5px;background:rgba(10,16,26,.86);border:1px solid rgba(56,226,255,.32);color:#7ee8fa;font-size:11.5px;font-weight:800}
    .sr-pill.good{border-color:rgba(74,222,128,.48);color:#7ee787}
    .sr-pill.warn{border-color:rgba(251,191,36,.48);color:#ffd166}
    .sr-pill.bad{border-color:rgba(248,113,113,.48);color:#ffa198}
    .sr-split{flex:1 1 0;min-height:0;display:grid;grid-template-columns:300px minmax(0,1fr);gap:14px}
    @media(max-width:860px){.sr-split{grid-template-columns:1fr;overflow-y:auto}}
    .sr-nav{display:flex;flex-direction:column;gap:7px;overflow-y:auto;padding-right:4px;scrollbar-width:thin;scrollbar-color:rgba(56,226,255,.4) transparent}
    .sr-nav-item{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 13px;border-radius:8px;cursor:pointer;text-align:left;
      background:#121b2a;border:1px solid #24364d;border-left:3px solid transparent;color:#dbe7f5;font:inherit;transition:all .13s}
    .sr-nav-item:hover{background:#182438;border-color:#355172}
    .sr-nav-item.on{background:linear-gradient(95deg,color-mix(in srgb,var(--sr-acc,#00d4ff) 18%,#131e2f),#121b2a);
      border-color:color-mix(in srgb,var(--sr-acc,#00d4ff) 60%,#24364d);border-left:4px solid var(--sr-acc,#00d4ff);color:#fff}
    .sr-nav-l{display:flex;align-items:center;gap:10px;min-width:0}
    .sr-nav-ico{font-size:18px;line-height:1;flex:none}
    .sr-nav-nm{font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .sr-nav-sub{font-size:11px;color:#8fa8c2;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .sr-nav-r{display:flex;flex-direction:column;align-items:flex-end;gap:3px;flex:none}
    .sr-nav-wage{font-size:11px;font-weight:800;color:#7ee787}
    .sr-chip{padding:1px 6px;border-radius:4px;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.05em;border:1px solid}
    .sr-chip.bad{color:#cbd5e1;border-color:#64748b;background:rgba(148,163,184,.16)}
    .sr-chip.mid{color:#7dd3fc;border-color:#38bdf8;background:rgba(56,189,248,.16)}
    .sr-chip.best{color:#fde68a;border-color:#fbbf24;background:rgba(251,191,36,.18)}
    .sr-chip.empty{color:#64748b;border-color:#334155;background:rgba(51,65,85,.25)}
    .sr-chip.irl{color:#ffd166;border-color:#f59e0b;background:rgba(245,158,11,.22)}
    .sr-detail{display:flex;flex-direction:column;gap:14px;overflow-y:auto;padding:18px 20px;border-radius:10px;
      background:linear-gradient(180deg,color-mix(in srgb,var(--sr-acc,#00d4ff) 6%,#111926),#0d1420);
      border:1px solid #243850;border-top:3px solid var(--sr-acc,#00d4ff);scrollbar-width:thin;scrollbar-color:rgba(56,226,255,.4) transparent}
    .sr-d-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:10px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,.08)}
    .sr-d-title{font-size:18px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:#fff;display:flex;align-items:center;gap:9px}
    .sr-d-desc{font-size:12.5px;color:#a9bfd6;margin-top:4px}
    .sr-d-stat{padding:6px 12px;border-radius:7px;background:rgba(10,16,26,.85);border:1px solid #2a405c;text-align:right}
    .sr-d-stat-k{font-size:10px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:#8ba6c2}
    .sr-d-stat-v{font-size:14px;font-weight:900;color:#7ee8fa;margin-top:1px}
    .sr-sec-lbl{font-size:11px;font-weight:900;letter-spacing:.09em;text-transform:uppercase;color:#8db4d8;margin-bottom:7px;display:flex;justify-content:space-between;align-items:center}
    .sr-hired-list{display:flex;flex-direction:column;gap:8px}
    .sr-member{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;padding:11px 14px;border-radius:8px;
      background:rgba(12,20,32,.9);border:1px solid rgba(255,255,255,.11);border-left:4px solid var(--sr-tier,#38bdf8)}
    .sr-member-nm{font-size:14px;font-weight:800;color:#fff;display:flex;align-items:center;gap:7px;flex-wrap:wrap}
    .sr-member-sub{font-size:12px;color:#9eb5cc;margin-top:3px}
    .sr-empty{padding:12px 14px;border-radius:8px;background:rgba(12,19,30,.65);border:1px dashed #2b405c;color:#8fa8c2;font-size:12.5px}
    .sr-info-strip{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;padding:10px 13px;border-radius:8px;
      background:rgba(59,130,246,.12);border:1px solid rgba(96,165,250,.38);font-size:12px;color:#dbeafe}
    .sr-tiers{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
    @media(max-width:740px){.sr-tiers{grid-template-columns:1fr}}
    .sr-tcard{display:flex;flex-direction:column;justify-content:space-between;gap:12px;padding:14px;border-radius:9px;
      background:#131d2d;border:1px solid #283c56;border-top:3px solid var(--sr-tier,#38bdf8);transition:transform .13s,border-color .13s}
    .sr-tcard:hover{transform:translateY(-2px);border-color:var(--sr-tier,#38bdf8)}
    .sr-tcard.current{background:linear-gradient(160deg,color-mix(in srgb,var(--sr-tier,#38bdf8) 18%,#141f31),#101826);box-shadow:0 0 0 1px var(--sr-tier,#38bdf8)}
    .sr-tc-top{display:flex;justify-content:space-between;align-items:baseline;gap:6px}
    .sr-tc-tier{font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;color:var(--sr-tier,#38bdf8)}
    .sr-tc-wage{font-size:13px;font-weight:900;color:#7ee787}
    .sr-perks{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
    .sr-perks li{font-size:12px;color:#d6e4f2;line-height:1.35;display:flex;gap:6px;align-items:flex-start}
    .sr-perks li::before{content:'✓';color:#4ade80;font-weight:900;flex:none}
    .sr-btn{border:1px solid rgba(255,255,255,.22);border-radius:6px;padding:7px 12px;font:800 11.5px/1.2 inherit;
      letter-spacing:.05em;text-transform:uppercase;cursor:pointer;color:#fff;background:#1b2a40;transition:filter .14s}
    .sr-btn:hover:not(:disabled){filter:brightness(1.15)}
    .sr-btn:disabled{opacity:.48;cursor:not-allowed}
    .sr-btn.primary{background:linear-gradient(135deg,#0284c7,#06b6d4);border-color:#38e2ff}
    .sr-btn.gold{background:linear-gradient(135deg,#d97706,#f59e0b);border-color:#ffd166}
    .sr-btn.red{background:#991b1b;border-color:#f87171}
    .sr-btn.sm{padding:4px 8px;font-size:10.5px}
    .sr-btn.full{width:100%}
    .sr-subtabs{display:inline-flex;gap:6px;background:#0c131f;padding:4px;border-radius:8px;border:1px solid #24364d}
    .sr-subtab{border:none;border-radius:6px;padding:6px 12px;font:800 11.5px/1.2 inherit;letter-spacing:.05em;text-transform:uppercase;
      cursor:pointer;background:transparent;color:#93adc7}
    .sr-subtab.on{background:#0284c7;color:#fff}
    .sr-auto-bar{display:flex;flex-wrap:wrap;gap:14px;align-items:center;padding:10px 13px;border-radius:8px;
      background:rgba(245,158,11,.12);border:1px solid rgba(251,191,36,.38);font-size:12px}
    .sr-auto-bar label{display:inline-flex;align-items:center;gap:6px;cursor:pointer;font-weight:800;color:#fef08a}
    .sr-irl-controls{flex:none;display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:10px}
    .sr-in{flex:1;min-width:160px;padding:7px 10px;border-radius:6px;border:1px solid #2d4461;background:#0d1522;color:#fff;font:600 12.5px/1.2 inherit}
    .sr-irl-wrap{flex:1 1 0;min-height:0;display:flex;flex-direction:column}
    .sr-irl-grid{flex:1 1 0;min-height:360px;display:grid;grid-template-columns:repeat(auto-fill,minmax(225px,1fr));gap:10px;align-content:start;overflow-y:auto;padding-right:6px;scrollbar-width:thin;scrollbar-color:rgba(56,226,255,.4) transparent}
    .sr-irl-card{display:flex;flex-direction:column;gap:5px;padding:12px 14px;border-radius:8px;background:#131e2f;border:1px solid #273b54;
      cursor:pointer;text-align:left;color:#eef4fc;font:inherit;transition:all .13s}
    .sr-irl-card:hover{border-color:#fbbf24;background:#1a2a42;transform:translateY(-1px)}
    .sr-nav-badge{display:inline-block;margin-left:5px;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:900;background:rgba(56,226,255,.22);color:#7ee8fa;border:1px solid rgba(56,226,255,.5)}
    .sr-cp-note{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;padding:12px 15px;border-radius:8px;
      background:rgba(245,158,11,.1);border:1px solid rgba(251,191,36,.35);color:#fef08a;font-size:12.5px}
    .sr-fac-rent{font-size:10.5px;font-weight:800;color:#ffd166;margin-top:4px;text-align:center}
    .sr-fac-rent.disc{color:#7ee787}
    body.cp-themed .fac-screen:not(.board-screen) .fac-card.on .fac-card-name,
    body.cp-themed .fac-screen:not(.board-screen) .fac-card.owned .fac-card-name{color:#ffffff!important}
    body.cp-themed .fac-screen:not(.board-screen) .fac-card.on .fac-card-desc{color:#dbeafe!important}
    .sr-fin-rent{margin:14px 0;padding:14px 16px;border-radius:8px;background:#141d2b;border:1px solid #243347;border-top:3px solid #f59e0b}
    .sr-fin-rent-hd{display:flex;justify-content:space-between;align-items:center;gap:8px;padding-bottom:8px;margin-bottom:8px;border-bottom:1px solid #243347}
    .sr-fin-rent-title{font-size:13px;font-weight:900;letter-spacing:.07em;text-transform:uppercase;color:#ffd166}
    .sr-fin-rent-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:10px;margin-top:8px}
    .sr-fin-rent-box{padding:9px 11px;border-radius:6px;background:#0e1522;border:1px solid #24354a}
    .sr-fin-rent-k{font-size:10px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:#8ea9c4}
    .sr-fin-rent-v{font-size:14px;font-weight:900;color:#fff;margin-top:2px}
    .sr-lease-alert{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;padding:10px 13px;margin:8px 0;border-radius:7px;
      background:rgba(220,38,38,.18);border:1px solid rgba(248,113,113,.6);border-left:4px solid #ef4444;color:#fecaca;font-size:12px}
    .sr-lease-alert strong{color:#fff}
    .sr-rltag-wrap{margin-top:8px;border-radius:0;overflow:hidden;border:1px solid #1c3f63;
      background:linear-gradient(135deg,#050b14 0%,#081424 58%,#0d2238 100%);
      box-shadow:inset 0 0 28px rgba(15,85,155,.16),0 6px 18px rgba(0,0,0,.55)}
    .sr-rltag-list{display:flex;flex-direction:column;gap:0;max-height:224px;overflow-y:auto;padding:2px 0;
      scrollbar-width:thin;scrollbar-color:#2c5a86 #060e19}
    .sr-rltag-list::-webkit-scrollbar{width:6px}
    .sr-rltag-list::-webkit-scrollbar-track{background:#050c17;border-left:1px solid #112942}
    .sr-rltag-list::-webkit-scrollbar-thumb{background:#2c5c8a;border-radius:0}
    .sr-rltag-list::-webkit-scrollbar-thumb:hover{background:#3e79b0}
    .sr-rltag-row{display:flex;align-items:center;width:100%;height:28px;padding:0 10px;border:none;border-radius:0;background:transparent;
      cursor:pointer;text-align:left;font-family:"Segoe UI","Roboto","Helvetica Neue",sans-serif;font-size:13px;font-weight:500;
      letter-spacing:.035em;text-transform:uppercase;line-height:28px;transition:none}
    .sr-rltag-txt{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;width:100%}
    .sr-rltag-row.auto .sr-rltag-txt{color:#dce3ec;text-shadow:none}
    .sr-rltag-row.rlcs .sr-rltag-txt{color:#86e3ff;text-shadow:0 0 6px rgba(64,196,255,.95),0 0 13px rgba(38,168,255,.65)}
    .sr-rltag-row.gold .sr-rltag-txt{color:#ebd067;text-shadow:0 0 6px rgba(235,185,42,.95),0 0 13px rgba(210,150,20,.72)}
    .sr-rltag-row.equipped:not(:hover){background:rgba(255,255,255,.11);box-shadow:inset 2px 0 0 #7ee0ff}
    .sr-rltag-row.equipped.gold:not(:hover){box-shadow:inset 2px 0 0 #ebd067}
    .sr-rltag-row.selected:not(.sr-dimmed),.sr-rltag-row:hover{background:#ffffff!important;box-shadow:0 0 10px rgba(155,220,255,.55)!important}
    .sr-rltag-row.selected:not(.sr-dimmed).auto .sr-rltag-txt,.sr-rltag-row:hover.auto .sr-rltag-txt{color:#1d2b3a!important;text-shadow:none!important}
    .sr-rltag-row.selected:not(.sr-dimmed).rlcs .sr-rltag-txt,.sr-rltag-row:hover.rlcs .sr-rltag-txt{color:#316f94!important;text-shadow:none!important}
    .sr-rltag-row.selected:not(.sr-dimmed).gold .sr-rltag-txt,.sr-rltag-row:hover.gold .sr-rltag-txt{color:#8a6a1a!important;text-shadow:none!important}
  `;
  document.head.appendChild(st);

  function fmt(n) {
    if (typeof fmtMoney === 'function') return fmtMoney(n);
    return '$' + Math.round(Number(n) || 0).toLocaleString();
  }

  function escapeHtml(s) {
    if (typeof esc === 'function') return esc(s);
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function getStaffSnap() {
    return (typeof S !== 'undefined' && S && S.cpStaff) ? S.cpStaff : null;
  }

  async function sendStaffCmd(payload, toastMsg) {
    if (!window.hub || typeof window.hub.placeBet !== 'function') return null;
    const res = await window.hub.placeBet({ kind: 'sr:' + JSON.stringify(payload), ref: 0, teamId: 0, stake: 0 });
    if (res && res.ok === false) {
      if (typeof showToast === 'function') showToast(res.error || 'Staff action failed.');
      return res;
    }
    if (res && res.career) S = res;
    if (typeof render === 'function') render();
    if (toastMsg && typeof showToast === 'function') showToast(toastMsg);
    return res;
  }

  function tierColor(t) {
    return t === 'best' ? '#fbbf24' : t === 'mid' ? '#38bdf8' : '#94a3b8';
  }

  function roleImpactStat(roleKey, stats) {
    const s = stats || {};
    switch (roleKey) {
      case 'scout':           return { k: 'Scouting Days Saved', v: `${s.scoutingDaysSaved || 0} days` };
      case 'mental_coach':    return { k: 'Morale Cushioned', v: `+${((s.egoMoraleSaved || 0) + (s.chatMoraleSaved || 0)).toFixed(1)}` };
      case 'media_trainer':   return { k: 'Sponsor / Followers', v: `${fmt(s.sponsorBonusEarned || 0)} · +${(s.followersBonusGained || 0).toLocaleString()}` };
      case 'assistant_coach': return { k: 'Boosted / Auto Sessions', v: `${s.trainingSessionsBoosted || 0} / ${s.autoTrainSessions || 0}` };
      case 'engineer':        return { k: 'Facility Money Saved', v: fmt(s.facilityMoneySaved || 0) };
      case 'physio':          return { k: 'Injuries Prevented', v: `${s.injuriesPrevented || 0} (${s.injuryDaysSaved || 0}d cut)` };
      case 'youth_coach':     return { k: 'Decay Prevented', v: `+${Number(s.decayPrevented || 0).toFixed(2)} OVR` };
      default:                return null;
    }
  }

  function staffPageHtml() {
    const sp = getStaffSnap();
    if (!sp) {
      return '<div class="sr-shell"><div class="sr-bar"><div class="sr-bar-title">Club Staff</div><span class="sr-pill">Load a Manager Career to manage staff</span></div></div>';
    }
    const roles = sp.roles || [];
    const role = roles.find((r) => r.key === selectedRole) || roles[0];
    if (!role) return '';
    selectedRole = role.key;

    const wageRoom = (typeof S !== 'undefined' && S && S.econ && S.econ.wageRoom != null) ? S.econ.wageRoom : null;
    const myTeam = (typeof S !== 'undefined' && S && S.career && Array.isArray(S.career.teams))
      ? S.career.teams.find((t) => t && t.id === S.career.userTeamId)
      : null;
    const clubBudget = myTeam ? Number(myTeam.budget || 0) : 0;
    const totalHired = (sp.roster || []).length;
    const maxTotal = roles.reduce((a, r) => a + (r.maxSlots || 1), 0);
    const upkeep = sp.facilityUpkeep || { tier: 0, base: 0, cost: 0, saved: 0 };

    const navHtml = roles.map((r) => {
      const hired = r.hired || [];
      const sumWage = hired.reduce((a, m) => a + (Number(m.wage) || 0), 0);
      let statusChip = '<span class="sr-chip empty">Unfilled</span>';
      let subLine = r.maxSlots > 1 ? `0 of ${r.maxSlots} slots filled` : 'Not hired';
      if (hired.length) {
        if (r.maxSlots > 1) {
          const topTier = hired.some((m) => m.tier === 'best') ? 'best' : hired.some((m) => m.tier === 'mid') ? 'mid' : 'bad';
          statusChip = `<span class="sr-chip ${topTier}">${hired.length}/${r.maxSlots} Active</span>`;
          subLine = hired.map((m) => m.name).join(', ');
        } else {
          const m = hired[0];
          statusChip = `<span class="sr-chip ${m.tier}">${escapeHtml(m.tierLabel)}</span>`;
          subLine = m.irl ? `${m.name} (IRL)` : m.name;
        }
      }
      return `
        <button class="sr-nav-item ${r.key === role.key ? 'on' : ''}" style="--sr-acc:${r.accent}" data-sr-select="${r.key}">
          <div class="sr-nav-l">
            <span class="sr-nav-ico">${r.icon}</span>
            <div style="min-width:0">
              <div class="sr-nav-nm">${escapeHtml(r.name)}</div>
              <div class="sr-nav-sub">${escapeHtml(subLine)}</div>
            </div>
          </div>
          <div class="sr-nav-r">
            ${statusChip}
            <span class="sr-nav-wage">${sumWage ? fmt(sumWage) + '/wk' : '—'}</span>
          </div>
        </button>
      `;
    }).join('');

    const hired = role.hired || [];
    const impact = roleImpactStat(role.key, sp.stats);
    const hiredHtml = hired.length
      ? hired.map((m) => {
          const col = tierColor(m.tier);
          const subParts = [fmt(m.wage) + '/wk'];
          if (m.irl && m.club) subParts.push(`${m.club}${m.region ? ' · ' + m.region : ''}`);
          const scoutUpgrades = role.key === 'scout'
            ? ['bad', 'mid', 'best'].filter((tk) => tk !== m.tier).map((tk) => {
                const td = (role.tiers || []).find((x) => x.key === tk);
                const fee = td ? (td.hireFee || 0) : 0;
                const canAff = clubBudget >= fee;
                return `<button class="sr-btn sm" data-sr-hire="1" data-role="scout" data-tier="${tk}" data-replace="${m.id}" ${canAff ? '' : 'disabled'}>${tk.toUpperCase()} (${fmt(fee)})</button>`;
              }).join(' ')
            : '';
          return `
            <div class="sr-member" style="--sr-tier:${col}">
              <div>
                <div class="sr-member-nm">
                  ${escapeHtml(m.name)}
                  <span class="sr-chip ${m.tier}">${escapeHtml(m.tierLabel)}</span>
                  ${m.irl ? '<span class="sr-chip irl">IRL Coach</span>' : ''}
                </div>
                <div class="sr-member-sub">${escapeHtml(subParts.join(' · '))}</div>
              </div>
              <div style="display:flex;gap:6px;align-items:center">
                ${scoutUpgrades}
                <button class="sr-btn red sm" data-sr-fire="${m.id}">Fire</button>
              </div>
            </div>
          `;
        }).join('')
      : `<div class="sr-empty">No ${escapeHtml(role.name)} hired yet. Choose a tier below to fill this role.</div>`;

    const canHireMore = role.maxSlots > 1 ? hired.length < role.maxSlots : true;
    const tierCardsHtml = (role.tiers || []).map((t) => {
      const col = tierColor(t.key);
      const isCurrent = role.maxSlots === 1 && hired[0] && hired[0].tier === t.key && !hired[0].irl;
      const fee = Number(t.hireFee || 0);
      const canAfford = clubBudget >= fee;
      const perks = (ROLE_PERKS[role.key] && ROLE_PERKS[role.key][t.key]) || [t.desc];
      const ctaText = isCurrent
        ? 'Currently Hired'
        : !canHireMore
          ? 'All 3 Slots Full'
          : !canAfford
            ? `Need ${fmt(fee)}`
            : role.maxSlots > 1
              ? `Hire ${t.label} (${fmt(fee)})`
              : (hired.length ? `Switch to ${t.label} (${fmt(fee)})` : `Hire ${t.label} (${fmt(fee)})`);
      const btnCls = (isCurrent || !canAfford || !canHireMore) ? '' : (t.key === 'best' ? 'gold' : 'primary');
      return `
        <div class="sr-tcard ${isCurrent ? 'current' : ''}" style="--sr-tier:${col}">
          <div>
            <div class="sr-tc-top">
              <span class="sr-tc-tier">${escapeHtml(t.label)}</span>
              <span class="sr-tc-wage">${fmt(t.wage)}/wk</span>
            </div>
            <div style="font-size:11.5px;font-weight:800;color:${canAfford ? '#ffd166' : '#f87171'};margin-top:4px">Signing fee: ${fmt(fee)}</div>
            <ul class="sr-perks" style="margin-top:10px">
              ${perks.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}
            </ul>
          </div>
          <button class="sr-btn full ${btnCls}" data-sr-hire="1" data-role="${role.key}" data-tier="${t.key}" ${(isCurrent || !canHireMore || !canAfford) ? 'disabled' : ''}>${escapeHtml(ctaText)}</button>
        </div>
      `;
    }).join('');

    let hireBodyHtml = `<div class="sr-tiers">${tierCardsHtml}</div>`;
    let subTabsHtml = '';
    let extraBarHtml = '';

    if (role.key === 'engineer') {
      const lease = sp.facilityLease || { arrears: 0, missedMonths: 0, bannedUntil: null };
      const leaseBanner = lease.bannedUntil
        ? `<div class="sr-lease-alert"><span><strong>EVICTION BAN ACTIVE:</strong> Landlords refuse to lease your club a new HQ until <strong>${escapeHtml(lease.bannedUntil)}</strong>.</span></div>`
        : lease.arrears > 0
          ? `<div class="sr-lease-alert"><span><strong>OVERDUE HQ RENT (Strike ${lease.missedMonths}/3):</strong> ${fmt(lease.arrears)} owed. Pay before Strike 3 or face eviction + 6-month ban!</span><button class="sr-btn red sm" data-sr-pay-rent="1" ${clubBudget >= lease.arrears ? '' : 'disabled'}>Pay ${fmt(lease.arrears)}</button></div>`
          : '';
      extraBarHtml = leaseBanner + `
        <div class="sr-info-strip">
          <div>
            <strong>Current HQ Rent &amp; Maintenance (Tier ${upkeep.tier}):</strong>
            ${upkeep.base > 0
              ? ` <strong style="color:#ffd166">${fmt(upkeep.cost)}/mo</strong> (${fmt(upkeep.cost * 12)}/yr)`
                + (upkeep.saved > 0 ? ` <span style="color:#7ee787">· Engineer saving ${fmt(upkeep.saved)}/mo!</span>` : '')
              : ' $0/mo (buy an HQ in Office → Facilities to unlock upgrades)'}
          </div>
          <div>Total Paid: <strong>${fmt((sp.stats && sp.stats.facilityUpkeepPaid) || 0)}</strong></div>
        </div>
      `;
    }

    if (role.key === 'assistant_coach') {
      if (sp.autoTrainUnlocked) {
        extraBarHtml = `
          <div class="sr-auto-bar">
            <label><input type="checkbox" data-sr-cfg="autoTrainEnabled" ${sp.autoTrainEnabled ? 'checked' : ''}> Auto-Train Active</label>
            <label><input type="checkbox" data-sr-cfg="autoFill" ${sp.autoFill ? 'checked' : ''}> Auto-Fill Slots</label>
          </div>
        `;
      }
      subTabsHtml = `
        <div class="sr-subtabs">
          <button class="sr-subtab ${asstSubTab === 'standard' ? 'on' : ''}" data-sr-asst-tab="standard">Standard Tiers</button>
          <button class="sr-subtab ${asstSubTab === 'irl' ? 'on' : ''}" data-sr-asst-tab="irl">IRL RLCS Coaches (${(sp.irlCoaches || []).length})</button>
        </div>
      `;
      if (asstSubTab === 'irl') {
        const q = irlSearch.trim().toLowerCase();
        const wageMap = Object.fromEntries((role.tiers || []).map((t) => [t.key, t.wage]));
        const feeMap = Object.fromEntries((role.tiers || []).map((t) => [t.key, t.hireFee || 0]));
        const pool = (sp.irlCoaches || []).filter((c) => {
          if (irlTierFilter !== 'all' && c.tier !== irlTierFilter) return false;
          if (!q) return true;
          return c.name.toLowerCase().includes(q) || (c.club || '').toLowerCase().includes(q) || (c.region || '').toLowerCase().includes(q);
        });
        hireBodyHtml = `
          <div class="sr-irl-wrap">
            <div class="sr-irl-controls">
              <input class="sr-in" id="sr-irl-search" type="text" placeholder="Search IRL coach, team, or region..." value="${escapeHtml(irlSearch)}">
              ${['all', 'best', 'mid', 'bad'].map((f) => `<button class="sr-btn sm ${irlTierFilter === f ? 'primary' : ''}" data-sr-irl-filter="${f}">${f.toUpperCase()}</button>`).join('')}
            </div>
            <div class="sr-irl-grid">
              ${pool.map((c) => {
                const fee = feeMap[c.tier] || 0;
                const canAff = clubBudget >= fee;
                const isHiredNow = hired[0] && hired[0].irl && hired[0].name === c.name;
                return `
                  <button class="sr-irl-card" data-sr-hire-irl="1" data-name="${escapeHtml(c.name)}" data-tier="${c.tier}" data-club="${escapeHtml(c.club || '')}" data-region="${escapeHtml(c.region || '')}" ${(isHiredNow || !canAff) ? 'disabled style="opacity:.5;cursor:not-allowed"' : ''}>
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:6px">
                      <strong style="color:#fff;font-size:13.5px">${escapeHtml(c.name)}</strong>
                      <span class="sr-chip ${c.tier}">${c.tier.toUpperCase()}</span>
                    </div>
                    <div style="font-size:11.5px;color:#9eb5cc">${escapeHtml(c.club || 'RLCS')} &middot; ${escapeHtml(c.region || '')}</div>
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-top:4px;font-size:11.5px;font-weight:800">
                      <span style="color:${canAff ? '#ffd166' : '#f87171'}">${isHiredNow ? 'Hired' : 'Sign ' + fmt(fee)}</span>
                      <span style="color:#7ee787">${fmt(wageMap[c.tier] || 0)}/wk</span>
                    </div>
                  </button>
                `;
              }).join('') || '<div class="sr-empty">No IRL coaches match that filter.</div>'}
            </div>
          </div>
        `;
      }
    }

    return `
      <div class="sr-shell">
        <div class="sr-bar">
          <div class="sr-bar-left">
            <span class="sr-bar-title">Club Staff</span>
            <span class="sr-pill">Budget: ${fmt(clubBudget)}</span>
            <span class="sr-pill good">Wages: ${fmt(sp.totalWage)}/wk</span>
            ${wageRoom != null ? `<span class="sr-pill ${wageRoom >= 0 ? 'good' : 'bad'}">Room: ${fmt(wageRoom)}/wk</span>` : ''}
            <span class="sr-pill">Hired: ${totalHired} / ${maxTotal}</span>
            ${upkeep.cost > 0 ? `<span class="sr-pill warn">HQ Rent: ${fmt(upkeep.cost)}/mo</span>` : ''}
            ${sp.trainCooldownDays < 7 ? `<span class="sr-pill warn">Train CD: ${sp.trainCooldownDays}d</span>` : ''}
          </div>
          <button class="sr-btn sm" data-sr-reset="1" title="Reset staff to club-tier starter scouts">Reset Starter Staff</button>
        </div>

        <div class="sr-split">
          <div class="sr-nav">${navHtml}</div>
          <div class="sr-detail" style="--sr-acc:${role.accent}">
            <div class="sr-d-head">
              <div>
                <div class="sr-d-title"><span>${role.icon}</span> ${escapeHtml(role.name)}</div>
                <div class="sr-d-desc">${escapeHtml(role.summary)}</div>
              </div>
              ${impact ? `<div class="sr-d-stat"><div class="sr-d-stat-k">${escapeHtml(impact.k)}</div><div class="sr-d-stat-v">${escapeHtml(impact.v)}</div></div>` : ''}
            </div>

            <div>
              <div class="sr-sec-lbl"><span>Current Staff</span><span>${hired.length} / ${role.maxSlots} slots</span></div>
              <div class="sr-hired-list">${hiredHtml}</div>
            </div>

            ${extraBarHtml}

            <div style="${role.key === 'assistant_coach' && asstSubTab === 'irl' ? 'flex:1 1 0;min-height:0;display:flex;flex-direction:column' : ''}">
              <div class="sr-sec-lbl"><span>${hired.length && role.maxSlots === 1 ? 'Upgrade or Replace' : 'Available Tiers'}</span>${subTabsHtml}</div>
              ${hireBodyHtml}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 1:1 Rocket League Garage Tag Selector list (pure glowing uppercase text + solid white selection bar)
  function titleGlowKind(titleId, text) {
    const id = String(titleId || '').toLowerCase();
    const tx = String(text || '').toLowerCase();
    if (!tx) return 'auto';
    if (tx.includes('world cup') || id.includes('esl') || id.includes('crl') || id.includes('dreamhack')) return 'gold';
    return 'rlcs';
  }

  function upgradeTitleSelectors(html) {
    if (!html || typeof html !== 'string' || !html.includes('data-cp-title-sel')) return html;
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    tpl.content.querySelectorAll('select[data-cp-title-sel="1"]').forEach((sel) => {
      const opts = Array.from(sel.options || []);
      if (!opts.length) return;
      sel.style.display = 'none';
      const rowsHtml = opts.map((opt) => {
        const val = opt.value || '';
        const text = opt.textContent || '';
        const tid = opt.getAttribute('data-tid') || '';
        const isAuto = !val;
        const kind = isAuto ? 'auto' : titleGlowKind(tid, text);
        const isSel = opt.selected;
        return `
          <button type="button" class="sr-rltag-row ${kind}${isSel ? ' selected equipped' : ''}" data-sr-rltag="${escapeHtml(val)}" data-sr-rltag-tid="${escapeHtml(tid)}" data-sr-rltag-txt="${escapeHtml(text)}">
            <span class="sr-rltag-txt">${escapeHtml(isAuto ? 'AUTO (HIGHEST EARNED)' : text)}</span>
          </button>`;
      }).join('');
      const wrap = document.createElement('div');
      wrap.className = 'sr-rltag-wrap';
      wrap.innerHTML = `<div class="sr-rltag-list">${rowsHtml}</div>`;
      sel.parentNode.insertBefore(wrap, sel.nextSibling);
    });
    return tpl.innerHTML;
  }

  // Strip Training & Automation from RL Career+ Control Center cleanly using DOM parsing (never regex on nested divs!)
  function stripCareerPlusAutomation(html) {
    if (!html || typeof html !== 'string') return html;
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    tpl.content.querySelectorAll('button[data-cp-subtab="auto"]').forEach((b) => b.remove());
    tpl.content.querySelectorAll('.cp-box').forEach((box) => {
      const h3 = box.querySelector('h3');
      if (h3 && /Training\s*&\s*Automation/i.test(h3.textContent || '')) {
        box.innerHTML = `
          <div class="cp-hd"><h3>Training &amp; Auto-Train</h3></div>
          <div class="sr-cp-note">
            <span>Training speed, effectiveness &amp; Auto-Train are now managed by your <strong>Assistant Coach</strong> in the Staff tab.</span>
            <button class="sr-btn gold sm" data-sr-open-asst="1">Open Assistant Coach</button>
          </div>`;
      }
    });
    return upgradeTitleSelectors(tpl.innerHTML);
  }

  // Also upgrade the title selector inside the Top-Left Player Profile modal!
  if (typeof playerModalHtml === 'function') {
    const origPm = playerModalHtml;
    playerModalHtml = function () {
      return upgradeTitleSelectors(origPm.apply(this, arguments));
    };
  }

  if (typeof topbarHtml === 'function' && typeof tabInnerHtml === 'function') {
    const origTop = topbarHtml;
    topbarHtml = function () {
      let h = origTop.apply(this, arguments);
      if (typeof isPlayerMode === 'function' && isPlayerMode()) return h;
      // Clean Career+ button (remove old Auto-Train ON/OFF pill)
      h = h.replace(/(<button[^>]*data-tab="careerplus"[^>]*>)\s*Career\+\s*<span class="cp-badge[^"]*">[^<]*<\/span>(\s*<\/button>)/, '$1Career+$2');
      const sp = getStaffSnap();
      const cnt = sp && Array.isArray(sp.roster) ? sp.roster.length : 0;
      const badge = '<span class="sr-nav-badge">' + cnt + '</span>';
      return h.replace(/<button[^>]*data-tab="setup"[^>]*>[\s\S]*?<\/button>/, (m) =>
        '<button class="' + (tab === 'staffrework' ? 'active' : '') + '" data-action="tab" data-tab="staffrework" style="color:#7ee8fa;font-weight:800">Staff ' + badge + '</button>' + m
      );
    };

    const origInner = tabInnerHtml;
    tabInnerHtml = function () {
      if (tab === 'staffrework') {
        if (typeof isPlayerMode === 'function' && isPlayerMode()) { tab = 'home'; return origInner.apply(this, arguments); }
        return staffPageHtml();
      }
      const h = origInner.apply(this, arguments);
      if (tab === 'careerplus') return stripCareerPlusAutomation(h);
      return h;
    };
  }

  // Training tile: remove old Career+ Auto-Train badge, show Assistant Coach badge cleanly
  if (typeof trainingTileHtml === 'function') {
    const origTile = trainingTileHtml;
    trainingTileHtml = function () {
      let h = origTile.apply(this, arguments);
      if (typeof isPlayerMode === 'function' && isPlayerMode()) return h;
      h = h.replace(/\s*<span class="cp-badge[^"]*">Auto-Train[^<]*<\/span>/g, '');
      const sp = getStaffSnap();
      if (!sp) return h;
      const asst = (sp.roster || []).find((s) => s.role === 'assistant_coach');
      if (!asst) return h;
      const lbl = asst.tier === 'best' && sp.autoTrainEnabled
        ? `Asst. Coach (${asst.name}): ${sp.trainCooldownDays}d · Auto`
        : `Asst. Coach (${asst.name}): ${sp.trainCooldownDays}d CD`;
      return h.replace(/(<div class="tile-desc">[\s\S]*?)(<\/div>)/, (_, a, b) => a + ' <span class="sr-nav-badge">' + escapeHtml(lbl) + '</span>' + b);
    };
  }

  // Office Facilities tile: show monthly Rent & Maintenance pill
  if (typeof facilitiesTileHtml === 'function') {
    const origFac = facilitiesTileHtml;
    facilitiesTileHtml = function () {
      const h = origFac.apply(this, arguments);
      const sp = getStaffSnap();
      const up = sp && sp.facilityUpkeep;
      if (!up || !up.base) return h;
      const tag = up.saved > 0
        ? `Rent: ${fmt(up.cost)}/mo (-${Math.round(up.discount * 100)}% Eng)`
        : `Rent: ${fmt(up.cost)}/mo`;
      return h.replace('<div class="cp-off-pills">', '<div class="cp-off-pills"><span class="cp-off-stat" style="color:#ffd166">' + escapeHtml(tag) + '</span>');
    };
  }

  // Full Facilities modal: show monthly rent & maintenance on every HQ card AND inside the detail pane!
  if (typeof facilitiesWindowHtml === 'function') {
    const origFacWin = facilitiesWindowHtml;
    facilitiesWindowHtml = function () {
      const h = origFacWin.apply(this, arguments);
      const fac = (typeof S !== 'undefined' && S && S.facilities) ? S.facilities : null;
      if (!fac || !Array.isArray(fac.list)) return h;
      const tpl = document.createElement('template');
      tpl.innerHTML = h;
      const byTier = new Map(fac.list.map((x) => [Number(x.tier), x]));
      const discPct = Math.round((fac.engineerDiscount || 0) * 100);
      const sp = getStaffSnap();
      const lease = (sp && sp.facilityLease) || { arrears: fac.rentArrears || 0, missedMonths: 0, bannedUntil: fac.evictionBanUntil || null };
      if (lease.bannedUntil || lease.arrears > 0) {
        const sub = tpl.content.querySelector('.fac-sub');
        if (sub) {
          const bannerHtml = lease.bannedUntil
            ? `<div class="sr-lease-alert"><span><strong>EVICTION BAN ACTIVE:</strong> Cannot lease a new headquarters until <strong>${escapeHtml(lease.bannedUntil)}</strong>.</span></div>`
            : `<div class="sr-lease-alert"><span><strong>OVERDUE RENT (Strike ${lease.missedMonths || 1}/3):</strong> ${fmt(lease.arrears)} owed. Clear debt before upgrading.</span><button class="sr-btn red sm" data-sr-pay-rent="1">Pay ${fmt(lease.arrears)}</button></div>`;
          sub.insertAdjacentHTML('afterend', bannerHtml);
        }
      }
      tpl.content.querySelectorAll('.fac-card[data-tier]').forEach((card) => {
        const item = byTier.get(Number(card.dataset.tier));
        if (!item || !item.monthlyUpkeep) return;
        const rentEl = document.createElement('div');
        rentEl.className = 'sr-fac-rent' + (discPct > 0 ? ' disc' : '');
        rentEl.textContent = discPct > 0
          ? `Rent: ${fmt(item.monthlyUpkeep)}/mo (-${discPct}% Eng)`
          : `Rent: ${fmt(item.monthlyUpkeep)}/mo`;
        const foot = card.querySelector('.fac-card-foot');
        if (foot) card.insertBefore(rentEl, foot);
        else card.appendChild(rentEl);
      });
      return tpl.innerHTML;
    };
  }

  if (typeof facilityDetailHtml === 'function') {
    const origFacDet = facilityDetailHtml;
    facilityDetailHtml = function (book, item, owned) {
      const h = origFacDet.apply(this, arguments);
      if (!item || !item.monthlyUpkeep) return h;
      const maxUpkeep = (book && Array.isArray(book.list) && book.list.length)
        ? Math.max(...book.list.map((x) => Number(x.monthlyUpkeepBase || x.monthlyUpkeep || 1)))
        : item.monthlyUpkeep;
      const pct = Math.max(8, Math.min(100, Math.round((item.monthlyUpkeep / Math.max(1, maxUpkeep)) * 100)));
      const hasDisc = item.monthlyUpkeepBase && item.monthlyUpkeep < item.monthlyUpkeepBase;
      const valText = hasDisc
        ? `${fmt(item.monthlyUpkeep)}/mo (${fmt(item.monthlyUpkeep * 12)}/yr · was ${fmt(item.monthlyUpkeepBase)})`
        : `${fmt(item.monthlyUpkeep)}/mo (${fmt(item.monthlyUpkeep * 12)}/yr)`;
      const rowHtml = `
        <div class="fac-row">
          <div class="fac-row-k"><span>Monthly Rent &amp; Maintenance</span><span style="color:${hasDisc ? '#7ee787' : '#ffd166'};font-weight:800">${escapeHtml(valText)}</span></div>
          <div class="fac-bar"><i style="width:${pct}%;background:${hasDisc ? 'linear-gradient(90deg,#16a34a,#4ade80)' : 'linear-gradient(90deg,#d97706,#fbbf24)'}"></i></div>
        </div>
      `;
      const tpl = document.createElement('template');
      tpl.innerHTML = h;
      const rows = tpl.content.querySelector('.fac-rows');
      if (rows) rows.insertAdjacentHTML('beforeend', rowHtml);
      return tpl.innerHTML;
    };
  }

  // Finances modal & Office Finances tile: show Facility Rent & Maintenance separately from Wage Budget!
  if (typeof financesTileHtml === 'function') {
    const origFinTile = financesTileHtml;
    financesTileHtml = function () {
      const h = origFinTile.apply(this, arguments);
      const sp = getStaffSnap();
      const up = sp && sp.facilityUpkeep;
      if (!up || !up.cost) return h;
      const row = `<div class="trow"><span class="trow-k">HQ rent / month</span><span class="trow-v" style="color:#ffd166">${escapeHtml(fmt(up.cost))}</span></div>`;
      const tpl = document.createElement('template');
      tpl.innerHTML = h;
      const body = tpl.content.querySelector('.tile-body');
      if (body) body.insertAdjacentHTML('beforeend', row);
      return tpl.innerHTML;
    };
  }

  if (typeof financesViewHtml === 'function') {
    const origFinView = financesViewHtml;
    financesViewHtml = function () {
      const h = origFinView.apply(this, arguments);
      const sp = getStaffSnap();
      if (!sp) return h;
      const up = sp.facilityUpkeep || { tier: 0, base: 0, cost: 0, saved: 0, discount: 0 };
      const fac = (typeof S !== 'undefined' && S && S.facilities && Array.isArray(S.facilities.list))
        ? S.facilities.list.find((x) => x.owned)
        : null;
      const hqName = fac ? fac.name : (up.tier ? `Tier ${up.tier} HQ` : 'No HQ yet');
      const eng = (sp.roster || []).find((m) => m.role === 'engineer');
      const lease = sp.facilityLease || { arrears: 0, missedMonths: 0, bannedUntil: null };
      const leaseAlertHtml = lease.bannedUntil
        ? `<div class="sr-lease-alert"><span><strong>EVICTION BAN ACTIVE:</strong> Evicted for 3 missed rent payments. Cannot lease a new HQ until <strong>${escapeHtml(lease.bannedUntil)}</strong>.</span></div>`
        : lease.arrears > 0
          ? `<div class="sr-lease-alert"><span><strong>OVERDUE HQ RENT (Strike ${lease.missedMonths}/3):</strong> ${fmt(lease.arrears)} owed — eviction &amp; 6-month ban on Strike 3!</span><button class="sr-btn red sm" data-sr-pay-rent="1">Pay ${fmt(lease.arrears)}</button></div>`
          : '';
      const blockHtml = `
        <div class="sr-fin-rent">
          <div class="sr-fin-rent-hd">
            <div>
              <div class="sr-fin-rent-title">Facility Rent &amp; Maintenance</div>
              <div style="font-size:11.5px;color:#9eb5cc;margin-top:2px">Billed monthly from club budget &mdash; separate from your weekly wage budget.</div>
            </div>
            <button class="sr-btn sm" data-sr-open-role="engineer">${eng ? 'Engineer: ' + escapeHtml(eng.tierLabel) : 'Hire Engineer'}</button>
          </div>
          ${leaseAlertHtml}
          <div class="sr-fin-rent-grid">
            <div class="sr-fin-rent-box"><div class="sr-fin-rent-k">Headquarters</div><div class="sr-fin-rent-v">${escapeHtml(hqName)}</div></div>
            <div class="sr-fin-rent-box"><div class="sr-fin-rent-k">Monthly Rent</div><div class="sr-fin-rent-v" style="color:${up.saved > 0 ? '#7ee787' : '#ffd166'}">${fmt(up.cost)}/mo${up.saved > 0 ? ` <span style="font-size:11px;color:#94a3b8;text-decoration:line-through">${fmt(up.base)}</span>` : ''}</div></div>
            <div class="sr-fin-rent-box"><div class="sr-fin-rent-k">Annual Cost</div><div class="sr-fin-rent-v">${fmt(up.cost * 12)}/yr</div></div>
            <div class="sr-fin-rent-box"><div class="sr-fin-rent-k">Engineer Savings</div><div class="sr-fin-rent-v" style="color:#7ee787">${fmt((sp.stats && sp.stats.facilityMoneySaved) || 0)} total</div></div>
          </div>
        </div>
      `;
      const tpl = document.createElement('template');
      tpl.innerHTML = h;
      const slider = tpl.content.querySelector('.fin-slider');
      if (slider) slider.insertAdjacentHTML('beforebegin', blockHtml);
      else tpl.content.appendChild(document.createRange().createContextualFragment(blockHtml));
      return tpl.innerHTML;
    };
  }

  // Replace old Career+ Training Quick-Bar (.cp-bar inside .tsq-wrap) with a clean Assistant Coach shortcut bar!
  function syncTrainingAsstBar() {
    if (typeof document.querySelector !== 'function') return;
    const tsq = document.querySelector('.tsq-wrap');
    if (!tsq) return;
    const sp = getStaffSnap();
    const asst = sp && Array.isArray(sp.roster) ? sp.roster.find((m) => m.role === 'assistant_coach') : null;
    let bar = tsq.querySelector('.cp-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'cp-bar';
      tsq.appendChild(bar);
    }
    const statusHtml = asst
      ? `<strong style="color:#ffd166">Assistant Coach:</strong> <span>${escapeHtml(asst.name)} (${escapeHtml(asst.tierLabel)} &middot; ${sp.trainCooldownDays}d CD${asst.tier === 'best' ? (sp.autoTrainEnabled ? ' &middot; Auto-Train ON' : ' &middot; Auto-Train OFF') : ''})</span>`
      : `<strong style="color:#ffd166">Assistant Coach:</strong> <span style="color:#9eb5cc">None hired (7d cooldown)</span>`;
    bar.innerHTML = `${statusHtml}<button type="button" class="sr-btn gold sm" style="margin-left:auto" data-sr-open-asst="1">${asst ? 'Manage Assistant Coach' : 'Hire Assistant Coach'}</button>`;
  }

  // Show toast when Best Assistant Coach auto-trains & keep Training bar synced
  if (typeof render === 'function') {
    const origRender = render;
    render = function () {
      const out = origRender.apply(this, arguments);
      syncTrainingAsstBar();
      const sp = getStaffSnap();
      if (sp && sp.lastNotice && sp.lastNotice.seq > lastSeenStaffNoticeSeq) {
        if (lastSeenStaffNoticeSeq > 0 && typeof showToast === 'function') {
          showToast(sp.lastNotice.msg);
        }
        lastSeenStaffNoticeSeq = sp.lastNotice.seq;
      }
      return out;
    };
  }

  document.addEventListener('click', async (e) => {
    const t = e.target;
    if (!t || !t.closest) return;

    // Rocket League Tag Selector click -> sync hidden <select data-cp-title-sel="1"> & trigger native Career+ equip
    const rlTagBtn = t.closest('[data-sr-rltag]');
    if (rlTagBtn) {
      e.stopPropagation();
      const val = rlTagBtn.dataset.srRltag || '';
      const card = rlTagBtn.closest('.cp-tcard');
      const sel = card && card.querySelector('select[data-cp-title-sel="1"]');
      if (sel) {
        sel.value = val;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (card) {
        card.querySelectorAll('.sr-rltag-row').forEach((row) => {
          const isMe = row === rlTagBtn;
          row.classList.toggle('selected', isMe);
          row.classList.toggle('equipped', isMe);
          row.classList.remove('sr-dimmed');
        });
      }
      return;
    }

    const payRentBtn = t.closest('[data-sr-pay-rent]');
    if (payRentBtn && !payRentBtn.disabled) {
      e.stopPropagation();
      await sendStaffCmd({ op: 'pay-rent' }, 'Overdue headquarters rent paid in full!');
      return;
    }

    const goToStaffRole = (roleKey) => {
      selectedRole = roleKey || 'scout';
      if (typeof bigList !== 'undefined') bigList = null;
      if (typeof officeOpen !== 'undefined') officeOpen = null;
      if (typeof closeModal === 'function') closeModal();
      else {
        const mr = document.getElementById('modal-root');
        if (mr) mr.innerHTML = '';
      }
      if (typeof tab !== 'undefined') tab = 'staffrework';
      if (typeof render === 'function') render();
    };

    const openRole = t.closest('[data-sr-open-role]');
    if (openRole) {
      e.stopPropagation();
      goToStaffRole(openRole.dataset.srOpenRole || 'scout');
      return;
    }

    const openAsst = t.closest('[data-sr-open-asst]');
    if (openAsst) {
      e.stopPropagation();
      goToStaffRole('assistant_coach');
      return;
    }

    const selBtn = t.closest('[data-sr-select]');
    if (selBtn) {
      e.stopPropagation();
      selectedRole = selBtn.dataset.srSelect;
      if (typeof render === 'function') render();
      return;
    }

    const asstTabBtn = t.closest('[data-sr-asst-tab]');
    if (asstTabBtn) {
      e.stopPropagation();
      asstSubTab = asstTabBtn.dataset.srAsstTab || 'standard';
      if (typeof render === 'function') render();
      return;
    }

    const hireBtn = t.closest('[data-sr-hire]');
    if (hireBtn && !hireBtn.disabled) {
      e.stopPropagation();
      const role = hireBtn.dataset.role;
      const tier = hireBtn.dataset.tier;
      const replaceId = hireBtn.dataset.replace ? Number(hireBtn.dataset.replace) : undefined;
      await sendStaffCmd({ op: 'hire', role, tier, replaceId }, `Hired ${tier.toUpperCase()} ${role.replace('_', ' ')}!`);
      return;
    }

    const irlBtn = t.closest('[data-sr-hire-irl]');
    if (irlBtn) {
      e.stopPropagation();
      const name = irlBtn.dataset.name;
      const tier = irlBtn.dataset.tier;
      const club = irlBtn.dataset.club;
      const region = irlBtn.dataset.region;
      await sendStaffCmd({ op: 'hire', role: 'assistant_coach', tier, name, irl: true, club, region }, `Hired IRL Assistant Coach: ${name} (${tier.toUpperCase()})!`);
      return;
    }

    const fireBtn = t.closest('[data-sr-fire]');
    if (fireBtn) {
      e.stopPropagation();
      await sendStaffCmd({ op: 'fire', id: Number(fireBtn.dataset.srFire) }, 'Staff member released.');
      return;
    }

    const filtBtn = t.closest('[data-sr-irl-filter]');
    if (filtBtn) {
      e.stopPropagation();
      irlTierFilter = filtBtn.dataset.srIrlFilter || 'all';
      if (typeof render === 'function') render();
      return;
    }

    const resetBtn = t.closest('[data-sr-reset]');
    if (resetBtn) {
      e.stopPropagation();
      await sendStaffCmd({ op: 'reset-starter' }, 'Staff reset to club starter configuration.');
    }
  }, true);

  // Live scoreboard preview on hover over any RL Tag Selector row!
  function syncLiveTitlePreview(card, key, tid, txt) {
    const liveEl = card && card.querySelector('[data-cp-live-title]');
    if (!liveEl) return;
    let disp = txt;
    let id = tid;
    if (!key) {
      const td = (typeof S !== 'undefined' && S && S.cpTitles) || null;
      disp = (td && td.list && td.list[0] && td.list[0].display) || (td && td.activeDisplay) || '';
      id = (td && td.list && td.list[0] && td.list[0].id) || (td && td.activeId) || '';
    }
    const kind = disp ? titleGlowKind(id, disp) : 'none';
    liveEl.textContent = disp ? disp.toUpperCase() : 'NO TITLE EARNED YET';
    liveEl.className = 'cp-rlsb-title ' + kind;
  }

  document.addEventListener('mouseover', (e) => {
    const row = e.target && e.target.closest && e.target.closest('.sr-rltag-row');
    if (!row) return;
    const list = row.closest('.sr-rltag-list');
    if (list) {
      list.querySelectorAll('.sr-rltag-row.selected').forEach((s) => s.classList.toggle('sr-dimmed', s !== row));
    }
    const card = row.closest('.cp-tcard');
    syncLiveTitlePreview(card, row.dataset.srRltag || '', row.dataset.srRltagTid || '', row.dataset.srRltagTxt || '');
  }, true);

  document.addEventListener('mouseleave', (e) => {
    const list = e.target && e.target.classList && e.target.classList.contains('sr-rltag-list') ? e.target : null;
    if (!list) return;
    list.querySelectorAll('.sr-rltag-row.sr-dimmed').forEach((s) => s.classList.remove('sr-dimmed'));
    const card = list.closest('.cp-tcard');
    const active = list.querySelector('.sr-rltag-row.selected');
    if (active) syncLiveTitlePreview(card, active.dataset.srRltag || '', active.dataset.srRltagTid || '', active.dataset.srRltagTxt || '');
  }, true);

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t && t.id === 'sr-irl-search') {
      irlSearch = t.value || '';
      const pos = t.selectionStart;
      if (typeof render === 'function') render();
      const el = document.getElementById('sr-irl-search');
      if (el) { el.focus(); try { el.setSelectionRange(pos, pos); } catch { } }
    }
  }, true);

  document.addEventListener('change', async (e) => {
    const t = e.target;
    if (t && t.dataset && t.dataset.srCfg) {
      await sendStaffCmd({ op: 'cfg', [t.dataset.srCfg]: !!t.checked });
    }
  }, true);

  if (typeof render === 'function') render();
})();

(function () {
  'use strict';
  if (window.__crowdPopUI) return;
  window.__crowdPopUI = true;

  let ctx = null;
  const buffers = {}; // url -> AudioBuffer

  const st = document.createElement('style');
  st.textContent = `
    .cr-card{background:#121a26;border:1px solid #25364a;box-shadow:inset 0 3px 0 #38e2ff;border-radius:8px;padding:12px 14px;margin-top:10px;color:#eef4fc}
    .cr-head{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px}
    .cr-title{font-size:12px;font-weight:900;letter-spacing:.09em;text-transform:uppercase;color:#38e2ff}
    .cr-badge{padding:2px 8px;border-radius:99px;font-size:10.5px;font-weight:800;border:1px solid #2b4462;background:#162233;color:#9cc2e4}
    .cr-badge.on{border-color:#4ade80;background:rgba(34,197,94,.16);color:#86efac}
    .cr-badge.off{border-color:#64748b;background:rgba(100,116,139,.16);color:#cbd5e1}
    .cr-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px}
    .cr-btn{border:1px solid #2b405c;background:#141f30;color:#c7daec;border-radius:6px;padding:5px 10px;font:800 11px/1.1 inherit;cursor:pointer;transition:all .12s}
    .cr-btn:hover{border-color:#38e2ff;color:#fff;background:#1a2b42}
    .cr-btn.on{background:linear-gradient(135deg,#0284c7,#00d4ff);border-color:#7ee8fa;color:#041621}
    .cr-btn.gold{background:linear-gradient(135deg,#b45309,#f59e0b);border-color:#fde68a;color:#fff}
    .cr-vol{display:flex;align-items:center;gap:8px;font-size:11.5px;font-weight:700;color:#b8d0e8}
    .cr-vol input{accent-color:#38e2ff;width:120px}
    .cr-sub{font-size:11px;color:#8ea8c2;margin-top:4px;line-height:1.4}
  `;
  document.head.appendChild(st);

  function getCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  async function loadBuffer(url) {
    if (!url) return null;
    if (buffers[url]) return buffers[url];
    const ac = getCtx();
    if (!ac) return null;
    try {
      const res = await fetch(url);
      const arr = await res.arrayBuffer();
      const buf = await ac.decodeAudioData(arr);
      buffers[url] = buf;
      return buf;
    } catch {
      return null;
    }
  }

  // Synthesized Karmine-Corp / Blue-Wall style LAN Ultras Bass Drum + Stadium Clap buildup on kickoff!
  function playUltrasWalkout(vol) {
    const ac = getCtx();
    if (!ac) return;
    const now = ac.currentTime + 0.04;
    const master = ac.createGain();
    master.gain.setValueAtTime(Math.max(0.05, Math.min(1.0, vol * 0.72)), now);
    master.connect(ac.destination);

    // Classic European LAN ultras cadence: BOOM - BOOM - CLAP (accelerating over 4.6 seconds!)
    const hits = [
      [0.00, 'drum'], [0.52, 'drum'], [1.04, 'clap'],
      [1.62, 'drum'], [2.08, 'drum'], [2.54, 'clap'],
      [3.02, 'drum'], [3.38, 'drum'], [3.74, 'clap'],
      [4.08, 'drum'], [4.34, 'drum'], [4.60, 'clap'],
    ];

    for (const [dt, kind] of hits) {
      const t = now + dt;
      if (kind === 'drum') {
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(118, t);
        osc.frequency.exponentialRampToValueAtTime(42, t + 0.24);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.85, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
        osc.connect(g);
        g.connect(master);
        osc.start(t);
        osc.stop(t + 0.34);
      } else {
        // Multi-hand stadium clap noise burst through bandpass filter
        const len = Math.floor(ac.sampleRate * 0.22);
        const buf = ac.createBuffer(2, len, ac.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
          const data = buf.getChannelData(ch);
          for (let i = 0; i < len; i++) {
            const env = Math.pow(1 - i / len, 2.2);
            data[i] = (Math.random() * 2 - 1) * env;
          }
        }
        const src = ac.createBufferSource();
        src.buffer = buf;
        const bp = ac.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(1150, t);
        bp.Q.setValueAtTime(0.9, t);
        const g = ac.createGain();
        g.gain.setValueAtTime(0.52, t);
        src.connect(bp);
        bp.connect(g);
        g.connect(master);
        src.start(t);
      }
    }
  }

  async function playCrowdPop(evt) {
    const info = (typeof S !== 'undefined' && S && S.cpCrowd) ? S.cpCrowd : null;
    const baseVol = evt && typeof evt.volume === 'number'
      ? evt.volume
      : (info && typeof info.volume === 'number' ? info.volume : 0.85);
    if (baseVol <= 0.01) return;

    const type = (evt && evt.type) || 'goal';
    if (type === 'kickoff') {
      playUltrasWalkout(baseVol);
      // Soft swell of the crowd roar right at the climax of the ultras buildup!
      const goalUrl = info && info.goalUrl;
      if (goalUrl) {
        const buf = await loadBuffer(goalUrl);
        const ac = getCtx();
        if (buf && ac) {
          const src = ac.createBufferSource();
          src.buffer = buf;
          const g = ac.createGain();
          const t0 = ac.currentTime + 3.7;
          g.gain.setValueAtTime(0.001, t0);
          g.gain.linearRampToValueAtTime(baseVol * 0.42, t0 + 0.9);
          g.gain.linearRampToValueAtTime(0.001, t0 + 3.2);
          src.connect(g);
          g.connect(ac.destination);
          src.start(t0, 0.2, 3.2);
        }
      }
      return;
    }

    const isSave = type === 'save' || type === 'epic_save';
    const url = isSave
      ? ((info && info.saveUrl) || (info && info.goalUrl))
      : (info && info.goalUrl);
    if (!url) return;

    const buf = await loadBuffer(url);
    const ac = getCtx();
    if (!buf || !ac) {
      // Fallback HTML5 Audio if WebAudio failed to decode
      try {
        const a = new Audio(url);
        a.volume = Math.max(0, Math.min(1, baseVol));
        a.play().catch(() => {});
      } catch { }
      return;
    }

    const isClutch = !!(evt && (evt.overtime || (typeof evt.clock === 'number' && evt.clock <= 10)));
    const hype = (evt && Number(evt.hype)) || 2;
    let gainScale = 1.0;
    if (type === 'save') gainScale = 0.70;
    else if (type === 'epic_save') gainScale = 0.96;
    else if (type === 'match_end') gainScale = 1.15;
    else if (isClutch || hype >= 4) gainScale = 1.22;
    else if (hype === 3) gainScale = 1.08;

    const src = ac.createBufferSource();
    src.buffer = buf;
    // Slight natural pitch variation (±2.5%) so back-to-back goals never feel robotic
    src.playbackRate.value = 0.975 + Math.random() * 0.05;

    const gain = ac.createGain();
    gain.gain.value = Math.min(1.35, baseVol * gainScale);

    // Warm arena low-shelf boost for Overtime / 0-second / Grand Final eruptions!
    if (isClutch || hype >= 4 || type === 'match_end') {
      const eq = ac.createBiquadFilter();
      eq.type = 'lowshelf';
      eq.frequency.value = 180;
      eq.gain.value = 4.5;
      src.connect(eq);
      eq.connect(gain);
    } else {
      src.connect(gain);
    }
    gain.connect(ac.destination);
    src.start(0);
  }

  // Expose live trigger hook for main-process crowd watcher
  window.__crowdPopPlay = playCrowdPop;

  // Preload audio buffers once snapshot is ready
  function preloadCrowdAudio() {
    const info = (typeof S !== 'undefined' && S && S.cpCrowd) ? S.cpCrowd : null;
    if (!info) return;
    if (info.goalUrl) loadBuffer(info.goalUrl);
    if (info.saveUrl) loadBuffer(info.saveUrl);
  }
  setTimeout(preloadCrowdAudio, 1200);

  async function sendCrowdCmd(payload, toastMsg) {
    if (!window.hub || typeof window.hub.placeBet !== 'function') return null;
    const res = await window.hub.placeBet({ kind: 'cr:' + JSON.stringify(payload), ref: 0, teamId: 0, stake: 0 });
    if (res && res.career) S = res;
    if (typeof render === 'function') render();
    if (toastMsg && typeof showToast === 'function') showToast(toastMsg);
    return res;
  }

  function renderCrowdPanelHtml() {
    const c = (typeof S !== 'undefined' && S && S.cpCrowd) ? S.cpCrowd : null;
    if (!c) return '';
    const pct = Math.round((c.volume != null ? c.volume : 0.85) * 100);
    const nm = c.nextMatch || { active: false, label: 'LAN Mode' };
    return `
      <div class="cr-card" id="cr-lan-card">
        <div class="cr-head">
          <span class="cr-title">🏟️ LAN Crowd Pops &amp; Arena Audio</span>
          <span class="cr-badge ${nm.active ? 'on' : 'off'}">${nm.active ? '🔊 ' : '🔇 '}${String(nm.label || '').replace(/</g, '&lt;')}</span>
        </div>
        <div class="cr-sub">
          Plays live crowd pops on Goals, Saves &amp; Epic Saves inside Rocket League during <b>Major Playoffs, Worlds, FIFAe World Cup &amp; LAN Cups</b> (silent in Online Opens).
          ${c.dllInstalled ? '<span style="color:#4ade80;font-weight:800"> · BakkesMod plugin ready</span>' : '<span style="color:#fbbf24;font-weight:800"> · BakkesMod plugin pending</span>'}
        </div>
        <div class="cr-row">
          <button type="button" class="cr-btn ${c.mode === 'lan' ? 'on' : ''}" data-cr-mode="lan">LAN Only (Playoffs/Worlds/FIFAe)</button>
          <button type="button" class="cr-btn ${c.mode === 'always' ? 'on' : ''}" data-cr-mode="always">Always On (All Matches)</button>
          <button type="button" class="cr-btn ${c.mode === 'off' ? 'on' : ''}" data-cr-mode="off">Off</button>
          <button type="button" class="cr-btn ${c.ultrasWalkout ? 'on' : ''}" data-cr-ultras="${c.ultrasWalkout ? '0' : '1'}">🥁 Ultras Kickoff: ${c.ultrasWalkout ? 'ON' : 'OFF'}</button>
          <button type="button" class="cr-btn ${c.saves ? 'on' : ''}" data-cr-saves="${c.saves ? '0' : '1'}">🛡️ Save Pops: ${c.saves ? 'ON' : 'OFF'}</button>
        </div>
        <div class="cr-row">
          <label class="cr-vol">
            Volume <input type="range" id="cr-vol-range" min="0" max="100" value="${pct}"> <span id="cr-vol-val">${pct}%</span>
          </label>
          <button type="button" class="cr-btn gold" data-cr-test="goal">⚽ Test Goal Pop</button>
          <button type="button" class="cr-btn gold" data-cr-test="ot">🔥 Test OT Eruption</button>
          <button type="button" class="cr-btn" data-cr-test="epic_save">🛡️ Test Epic Save</button>
          <button type="button" class="cr-btn" data-cr-test="kickoff">🥁 Test Ultras Walkout</button>
        </div>
      </div>`;
  }

  // Inject LAN Crowd Pops panel inside the Career+ tab (and Socials left column footer if desired)
  if (typeof tabInnerHtml === 'function') {
    const origTab = tabInnerHtml;
    tabInnerHtml = function (t) {
      const h = origTab.apply(this, arguments);
      if (t !== 'careerplus') return h;
      const card = renderCrowdPanelHtml();
      if (!card) return h;
      const tpl = document.createElement('template');
      tpl.innerHTML = h;
      const wrap = tpl.content.querySelector('.cp-wrap') || tpl.content.firstElementChild;
      if (wrap) wrap.insertAdjacentHTML('beforeend', card);
      else return h + card;
      return tpl.innerHTML;
    };
  }

  document.addEventListener('click', async (e) => {
    const t = e.target;
    if (!t || !t.closest) return;

    const mBtn = t.closest('[data-cr-mode]');
    if (mBtn) {
      e.stopPropagation();
      await sendCrowdCmd({ op: 'set-mode', mode: mBtn.dataset.crMode }, 'Crowd Pop mode updated!');
      return;
    }

    const uBtn = t.closest('[data-cr-ultras]');
    if (uBtn) {
      e.stopPropagation();
      await sendCrowdCmd({ op: 'set-ultras', enabled: uBtn.dataset.crUltras === '1' }, 'Ultras kickoff audio updated!');
      return;
    }

    const sBtn = t.closest('[data-cr-saves]');
    if (sBtn) {
      e.stopPropagation();
      await sendCrowdCmd({ op: 'set-saves', enabled: sBtn.dataset.crSaves === '1' }, 'Save pops updated!');
      return;
    }

    const testBtn = t.closest('[data-cr-test]');
    if (testBtn) {
      e.stopPropagation();
      const kind = testBtn.dataset.crTest;
      if (kind === 'ot') playCrowdPop({ type: 'goal', overtime: true, clock: 0, hype: 4 });
      else playCrowdPop({ type: kind, hype: 3 });
    }
  }, true);

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t && t.id === 'cr-vol-range') {
      const lbl = document.getElementById('cr-vol-val');
      if (lbl) lbl.textContent = t.value + '%';
    }
  }, true);

  document.addEventListener('change', async (e) => {
    const t = e.target;
    if (t && t.id === 'cr-vol-range') {
      await sendCrowdCmd({ op: 'set-vol', volume: Number(t.value) / 100 });
    }
  }, true);

  if (typeof render === 'function') render();
})();

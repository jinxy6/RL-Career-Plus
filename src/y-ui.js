(function () {
  'use strict';
  if (window.__yOverhaulUI) return;
  window.__yOverhaulUI = true;

  let yFilter = 'all'; // 'all' | 'clip' | 'rivalry' | 'poll' | 'leak'
  let inSocialsFeed = false;
  let replyOpenKey = null;
  let calloutTeamId = null;

  function postUiKey(p) {
    if (!p) return '';
    return String(p.id) + '|' + String(p.handle || '') + '|' + String(p.date || '') + '|' + String(p.text || '').slice(0, 18);
  }

  const st = document.createElement('style');
  st.textContent = `
    .yo-filters{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:8px 10px;margin-bottom:10px;border-radius:8px;
      background:#101826;border:1px solid #24364e}
    .yo-fbtn{border:1px solid #29405c;background:#152032;color:#a8c1da;border-radius:99px;padding:5px 11px;font:800 11px/1.1 inherit;
      letter-spacing:.05em;text-transform:uppercase;cursor:pointer;transition:all .13s}
    .yo-fbtn:hover{border-color:#38e2ff;color:#fff}
    .yo-fbtn.on{background:linear-gradient(135deg,#0284c7,#00d4ff);border-color:#7ee8fa;color:#041621}
    .yo-clip{position:relative;margin:9px 0 6px;border-radius:9px;overflow:hidden;border:1px solid #274463;
      background:linear-gradient(135deg,#071322 0%,#0c2038 52%,#191124 100%);box-shadow:0 8px 22px rgba(0,0,0,.45)}
    .yo-clip.whiff{border-color:rgba(248,113,113,.55);background:linear-gradient(135deg,#1d0d14 0%,#26121b 55%,#131826 100%)}
    .yo-clip.save{border-color:rgba(74,222,128,.55);background:linear-gradient(135deg,#071d16 0%,#0c2b22 55%,#0e1928 100%)}
    .yo-clip-vid{display:block;width:100%;max-height:260px;object-fit:cover;background:#04080f}
    .yo-clip-stage{position:relative;padding:14px 15px 12px;min-height:132px;display:flex;flex-direction:column;justify-content:space-between;gap:10px;
      background:radial-gradient(circle at 20% 20%,rgba(0,212,255,.16),transparent 55%),radial-gradient(circle at 85% 80%,rgba(245,158,11,.16),transparent 55%)}
    .yo-clip-top{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}
    .yo-ev-pill{padding:2px 8px;border-radius:4px;font-size:10px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;
      background:rgba(0,212,255,.2);border:1px solid rgba(56,226,255,.55);color:#7ee8fa}
    .yo-ev-pill.worlds,.yo-ev-pill.worldcup{background:rgba(245,158,11,.24);border-color:#fbbf24;color:#fde68a}
    .yo-ev-pill.major{background:rgba(168,85,247,.24);border-color:#c084fc;color:#e9d5ff}
    .yo-kind-pill{padding:2px 8px;border-radius:4px;font-size:10px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;
      background:rgba(34,197,94,.22);border:1px solid #4ade80;color:#86efac}
    .yo-kind-pill.whiff{background:rgba(239,68,68,.24);border-color:#f87171;color:#fca5a5}
    .yo-kind-pill.save{background:rgba(56,189,248,.22);border-color:#38bdf8;color:#7dd3fc}
    .yo-clip-mid{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
    .yo-clip-move{font-size:16px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.85)}
    .yo-clip-star{font-size:12px;color:#b8d2ea;font-weight:700;margin-top:2px}
    .yo-clip-spd{padding:4px 9px;border-radius:6px;background:rgba(6,12,22,.86);border:1px solid rgba(56,226,255,.45);font:900 12px/1 monospace;color:#38e2ff}
    .yo-scorebug{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 10px;border-radius:6px;
      background:rgba(5,10,18,.88);border:1px solid rgba(255,255,255,.12);font-size:11.5px;font-weight:800;color:#eef4fc}
    .yo-sb-teams{display:flex;align-items:center;gap:8px}
    .yo-sb-sc{padding:1px 7px;border-radius:4px;background:linear-gradient(90deg,#0284c7,#f59e0b);color:#fff;font-family:monospace;font-size:12px}
    .yo-clip-hud{padding:8px 11px;background:rgba(5,10,18,.94);border-top:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;font-size:11.5px}
    .yo-quote{margin:8px 0 4px;padding:9px 11px;border-radius:7px;background:rgba(8,14,24,.85);border:1px solid #2b415c;border-left:3px solid #fbbf24}
    .yo-quote-hd{font-size:11px;font-weight:800;color:#ffd166;margin-bottom:3px}
    .yo-quote-txt{font-size:12px;color:#cbd8e6;line-height:1.4}
    .yo-poll{margin:8px 0 4px;display:flex;flex-direction:column;gap:6px}
    .yo-poll-opt{position:relative;overflow:hidden;display:flex;justify-content:space-between;align-items:center;padding:8px 11px;border-radius:7px;
      background:#111a28;border:1px solid #2a405c;color:#eef4fc;font:800 12px/1.2 inherit;cursor:pointer;text-align:left}
    .yo-poll-opt:hover:not(:disabled){border-color:#38e2ff;background:#162336}
    .yo-poll-opt.picked{border-color:#4ade80}
    .yo-poll-bar{position:absolute;inset:0 auto 0 0;background:rgba(56,226,255,.18);pointer-events:none}
    .yo-poll-opt.picked .yo-poll-bar{background:rgba(74,222,128,.22)}
    .yo-poll-opt span{position:relative;z-index:1}
    .yo-bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:10px 0 11px;padding-top:8px;border-top:1px solid rgba(255,255,255,.07)}
    .yo-act{border:1px solid #2b405c;background:#121c2c;color:#c7daec;border-radius:5px;padding:4px 8px;font:800 10.5px/1.1 inherit;
      letter-spacing:.04em;cursor:pointer;transition:all .12s}
    .yo-act:hover{background:#1b2b42;border-color:#38e2ff;color:#fff}
    .yo-act.fire:hover{border-color:#f97316;color:#fed7aa}
    .yo-act.gold{background:linear-gradient(135deg,#b45309,#f59e0b);border-color:#fde68a;color:#fff}
    .yo-act.ratio-badge{background:rgba(168,85,247,.25);border-color:#c084fc;color:#e9d5ff;cursor:default}
    .yo-reply-box{display:flex;gap:6px;margin-top:7px}
    .yo-reply-in{flex:1;padding:6px 9px;border-radius:6px;border:1px solid #2e4866;background:#0a111c;color:#fff;font:600 12px/1.2 inherit}
    .yo-riv-card{background:#121a26;border:1px solid #25364a;box-shadow:inset 0 3px 0 #f97316;border-radius:8px;padding:11px 14px;margin-top:10px;color:#eef4fc;
      display:flex;flex-direction:column;gap:8px;flex:none}
    .yo-riv-h{font-size:11.5px;font-weight:900;letter-spacing:.09em;text-transform:uppercase;color:#fb923c;display:flex;justify-content:space-between;align-items:center}
    .yo-riv-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;max-height:176px;overflow-y:auto;padding-right:4px;scrollbar-width:thin;scrollbar-color:rgba(249,115,22,.45) transparent}
    .yo-riv-row{padding:7px 10px;border-radius:6px;background:#16202e;border:1px solid #253447}
    .yo-riv-top{display:flex;justify-content:space-between;align-items:center;font-size:11.5px;font-weight:800;gap:6px}
    .yo-riv-bar{height:4px;border-radius:99px;background:#0b121d;margin-top:5px;overflow:hidden}
    .yo-riv-bar i{display:block;height:100%;background:linear-gradient(90deg,#f59e0b,#ef4444)}
    .yo-callout-row{display:flex;gap:8px;padding-top:6px;border-top:1px solid rgba(255,255,255,.07);align-items:center}
    .yo-sel{flex:1;min-width:0;padding:6px 9px;border-radius:5px;border:1px solid #2c415c;background:#0c1420;color:#eef4fc;font:700 12px/1.2 inherit}
    .yo-socials-screen{height:100%!important;min-height:0!important;align-items:stretch!important}
    .yo-socials-screen .fifa-main{display:flex!important;flex-direction:column!important;min-height:0!important;overflow-y:auto!important;padding-right:4px}
    .yo-socials-screen .fifa-tiles{display:flex!important;flex-direction:column!important;min-height:0!important;overflow:hidden!important;gap:10px}
    .yo-socials-screen .me-card{flex:0 0 auto!important}
    .yo-socials-screen .me-banner{height:70px!important;min-height:70px!important}
    .yo-socials-screen .follow-card{display:flex!important;flex-direction:column!important;min-height:0!important;flex:1 1 auto!important;overflow:hidden!important}
    .yo-socials-screen .follow-card .card-b{flex:1 1 auto!important;min-height:0!important;max-height:none!important;overflow-y:auto!important;padding:4px 10px 10px!important;scrollbar-width:thin;scrollbar-color:rgba(56,226,255,.35) transparent}
    .yo-socials-screen .follow-card .leader-row{padding:5px 6px!important;min-height:0!important}
    .yo-socials-screen .fifa-main [data-key="x"]{flex:1 1 auto!important;min-height:260px!important}
    .x-actions{display:flex!important;align-items:center!important;gap:16px!important;margin-top:4px!important}
    .x-actions>span,.x-actions>button{display:inline-flex!important;align-items:center!important;gap:4px!important;line-height:1!important;vertical-align:middle!important}
    .yo-rt-ico{display:inline-flex;align-items:center;justify-content:center;width:13px;height:13px;flex:none}
    .x-post.reply{margin-left:24px!important;border-left:2px solid #2e4c70!important;position:relative}
    .x-post.reply.mine{border-left-color:#38e2ff!important}
  `;
  document.head.appendChild(st);

  function escapeHtml(s) {
    if (typeof esc === 'function') return esc(s);
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  async function sendYCmd(payload, toastMsg) {
    if (!window.hub || typeof window.hub.placeBet !== 'function') return null;
    const res = await window.hub.placeBet({ kind: 'yo:' + JSON.stringify(payload), ref: 0, teamId: 0, stake: 0 });
    if (res && res.ok === false) {
      if (typeof showToast === 'function') showToast(res.error || 'Y action failed.');
      return res;
    }
    if (res && res.career) S = res;
    if (typeof render === 'function') render();
    if (toastMsg && typeof showToast === 'function') showToast(toastMsg);
    return res;
  }

  function renderClipCardHtml(clip) {
    if (!clip) return '';
    const kindLabel = clip.kind === 'whiff' ? 'WHIFF 💀' : clip.kind === 'save' ? 'MIRACLE SAVE 🛡️' : 'HIGHLIGHT GOAL 🔥';
    if (clip.videoUrl) {
      return `
        <div class="yo-clip ${escapeHtml(clip.kind)}">
          <video class="yo-clip-vid" src="${escapeHtml(clip.videoUrl)}" controls muted loop playsinline preload="metadata"></video>
          <div class="yo-clip-hud">
            <span class="yo-ev-pill ${escapeHtml(clip.eventTier)}">${escapeHtml(clip.eventName)}</span>
            <strong style="color:#fff">${escapeHtml(clip.starName)} &middot; ${escapeHtml(clip.move)} (${clip.speed} KPH)</strong>
            <span class="yo-sb-sc">${escapeHtml(clip.homeName)} ${clip.homeScore}-${clip.awayScore} ${escapeHtml(clip.awayName)}</span>
          </div>
        </div>`;
    }
    return `
      <div class="yo-clip ${escapeHtml(clip.kind)}">
        <div class="yo-clip-stage">
          <div class="yo-clip-top">
            <span class="yo-ev-pill ${escapeHtml(clip.eventTier)}">${escapeHtml(clip.eventName)}</span>
            <span class="yo-kind-pill ${escapeHtml(clip.kind)}">${kindLabel}</span>
          </div>
          <div class="yo-clip-mid">
            <div>
              <div class="yo-clip-move">${escapeHtml(clip.move)}</div>
              <div class="yo-clip-star">${escapeHtml(clip.starName)} (${escapeHtml(clip.starTeam)}) &middot; ${escapeHtml(clip.clock)}</div>
            </div>
            <div class="yo-clip-spd">${clip.speed} KPH</div>
          </div>
          <div class="yo-scorebug">
            <div class="yo-sb-teams">
              <span>${escapeHtml(clip.homeName)}</span>
              <span class="yo-sb-sc">${clip.homeScore} &ndash; ${clip.awayScore}</span>
              <span>${escapeHtml(clip.awayName)}</span>
            </div>
            <span style="font-size:10px;color:#7ee8fa;letter-spacing:.07em">RLCS HIGHLIGHT</span>
          </div>
        </div>
      </div>`;
  }

  function renderPollHtml(post) {
    const poll = post && post.cpPoll;
    if (!poll || !Array.isArray(poll.options)) return '';
    const total = poll.options.reduce((a, o) => a + (Number(o.votes) || 0), 0) || 1;
    const voted = poll.votedIdx != null;
    const optsHtml = poll.options.map((o, idx) => {
      const pct = Math.round(((Number(o.votes) || 0) / total) * 100);
      const isPicked = poll.votedIdx === idx;
      return `
        <button type="button" class="yo-poll-opt ${isPicked ? 'picked' : ''}" data-yo-vote="${post.id}" data-yo-opt="${idx}" ${voted ? 'disabled' : ''}>
          ${voted ? `<span class="yo-poll-bar" style="width:${pct}%"></span>` : ''}
          <span>${isPicked ? '✓ ' : ''}${escapeHtml(o.label)}</span>
          <span>${voted ? pct + '%' : 'Vote'}</span>
        </button>`;
    }).join('');
    return `<div class="yo-poll">${optsHtml}<div style="font-size:10.5px;color:#8ba4be">${total.toLocaleString()} votes${voted ? ' · Voted' : ' · Click an option to vote'}</div></div>`;
  }

  function renderQuoteHtml(q) {
    if (!q) return '';
    return `
      <div class="yo-quote">
        <div class="yo-quote-hd">${escapeHtml(q.name)} <span style="color:#8ea9c4;font-weight:600">@${escapeHtml(q.handle)}</span></div>
        <div class="yo-quote-txt">${escapeHtml(q.text)}</div>
      </div>`;
  }

  function renderPostExtrasHtml(post) {
    if (!post) return '';
    const parts = [];
    if (post.cpClip) parts.push(renderClipCardHtml(post.cpClip));
    if (post.cpQuoted) parts.push(renderQuoteHtml(post.cpQuoted));
    if (post.cpPoll) parts.push(renderPollHtml(post));

    const btns = [];
    if (post.cpRatioWon) {
      btns.push('<span class="yo-act ratio-badge">RATIO\'D 💀</span>');
    }
    if (post.cpDoubt && post.cpDoubt.wonByUser && !post.cpDoubt.receiptPulled) {
      btns.push(`<button type="button" class="yo-act gold" data-yo-receipts="${post.id}">📸 Pull Receipts</button>`);
    }
    if (post.cpLeak && !post.cpLeak.reacted) {
      btns.push(`<button type="button" class="yo-act" data-yo-leak="${post.id}" data-yo-mode="eyes">👀 Drop Eyes</button>`);
      btns.push(`<button type="button" class="yo-act" data-yo-leak="${post.id}" data-yo-mode="deny">🚫 Fake News</button>`);
    }
    const uKey = postUiKey(post);
    const hAttr = escapeHtml(post.handle || '');
    if (!post.mine) {
      btns.push(`<button type="button" class="yo-act fire" data-yo-reply="${post.id}" data-yo-handle="${hAttr}" data-yo-tone="trash">🔥 Clapback</button>`);
      btns.push(`<button type="button" class="yo-act" data-yo-reply="${post.id}" data-yo-handle="${hAttr}" data-yo-tone="ratio">😂 Ratio</button>`);
      btns.push(`<button type="button" class="yo-act" data-yo-reply="${post.id}" data-yo-handle="${hAttr}" data-yo-tone="respect">🤝 Respect</button>`);
      btns.push(`<button type="button" class="yo-act" data-yo-open-reply="${escapeHtml(uKey)}">✍️ Reply</button>`);
    }
    if (btns.length) parts.push(`<div class="yo-bar">${btns.join('')}</div>`);

    if (replyOpenKey && replyOpenKey === uKey) {
      parts.push(`
        <div class="yo-reply-box">
          <input type="text" class="yo-reply-in" id="yo-custom-reply-input" placeholder="Write a custom reply to @${hAttr}..." maxlength="200">
          <button type="button" class="yo-act gold" data-yo-send-custom="${post.id}" data-yo-handle="${hAttr}">Send</button>
        </div>`);
    }
    return parts.join('');
  }

  const RT_SVG = '<span class="yo-rt-ico"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></span>';

  // Hook threadPosts so filtering ONLY applies inside socialsHtml (where the filter bar lives) and NEVER breaks Full-Screen Y or leaks orphaned replies into other categories!
  if (typeof threadPosts === 'function') {
    const origThreadPosts = threadPosts;
    threadPosts = function (posts) {
      const threaded = origThreadPosts.apply(this, arguments);
      if (!inSocialsFeed || yFilter === 'all') return threaded;
      const idSet = new Set((posts || []).map((p) => p && p.id));
      // Only treat a post as a child if its actual parent is present in this feed (orphaned legacy replies with stored isReply:true must be filtered as roots!)
      const out = [];
      let keepGroup = false;
      for (const p of threaded) {
        const isAttachedChild = p && p.replyTo != null && idSet.has(p.replyTo);
        if (!isAttachedChild) {
          keepGroup = (p.cpCategory || 'all') === yFilter || (yFilter === 'rivalry' && !!p.cpHasRivalry);
        }
        if (keepGroup) out.push(p);
      }
      return out;
    };
  }

  // Hook postHtml to embed Clip cards, Polls, Quoted Receipts, interactive buttons, and pixel-aligned Retweet SVG!
  if (typeof postHtml === 'function') {
    const origPostHtml = postHtml;
    postHtml = function (p) {
      let h = origPostHtml.apply(this, arguments);
      if (!p) return h;
      // Fix uneven Unicode &#8635; retweet alignment with a crisp centered SVG icon
      h = h.replace(/&#8635;\s*|↻\s*/g, RT_SVG);
      const extras = renderPostExtrasHtml(p);
      if (!extras) return h;
      const idx = h.lastIndexOf('<div class="x-actions">');
      if (idx !== -1) return h.slice(0, idx) + extras + h.slice(idx);
      return h.replace('</article>', extras + '</article>');
    };
  }

  function rivalriesWidgetHtml() {
    const cy = (typeof S !== 'undefined' && S && S.cpY) ? S.cpY : null;
    if (!cy) return '';
    const rivs = cy.rivalries || [];
    const targets = cy.calloutTargets || [];
    if (calloutTeamId == null && targets[0]) calloutTeamId = targets[0].id;
    const totalClips = (cy.clipCounts ? (cy.clipCounts.goal + cy.clipCounts.whiff + cy.clipCounts.save) : 0);

    const rowsHtml = rivs.length
      ? rivs.map((r) => `
          <div class="yo-riv-row">
            <div class="yo-riv-top">
              <span>${escapeHtml(r.name)}</span>
              <span style="color:${r.heat >= 55 ? '#f87171' : '#fbbf24'}">${escapeHtml(r.level || 'Heated')} · ${r.heat}</span>
            </div>
            ${r.lastEvent ? `<div style="font-size:10.5px;color:#8fa8c2;margin-top:2px">${escapeHtml(r.lastEvent)}</div>` : ''}
            <div class="yo-riv-bar"><i style="width:${r.heat}%"></i></div>
          </div>`).join('')
      : '<div style="font-size:11.5px;color:#8fa8c2;margin-bottom:6px">No active rivalries yet — clap back at clips or call out a rival below!</div>';

    const optsHtml = targets.map((t) => `<option value="${t.id}" ${Number(calloutTeamId) === Number(t.id) ? 'selected' : ''}>${escapeHtml(t.name)}</option>`).join('');

    return `
      <div class="yo-riv-card">
        <div class="yo-riv-h">
          <span>🔥 Club Rivalries</span>
          <span style="font-size:10px;color:#7ee8fa">${totalClips ? totalClips + ' highlight videos' : 'Match Moments'}</span>
        </div>
        <div class="yo-riv-list">${rowsHtml}</div>
        ${targets.length ? `
          <div class="yo-callout-row">
            <select class="yo-sel" id="yo-callout-sel">${optsHtml}</select>
            <button type="button" class="yo-act gold" data-yo-callout="1">Call Out 🔥</button>
          </div>` : ''}
      </div>`;
  }

  // Also clear yFilter back to 'all' inside Full-Screen Profile so Profile Posts/Replies/Likes NEVER get hidden!
  if (typeof xProfileHtml === 'function') {
    const origXProf = xProfileHtml;
    xProfileHtml = function () {
      const prev = yFilter;
      yFilter = 'all';
      try { return origXProf.apply(this, arguments); }
      finally { yFilter = prev; }
    };
  }

  // Hook socialsHtml to add the Y Feed Filter bar + Active Rivalries sidebar card
  if (typeof socialsHtml === 'function') {
    const origSocials = socialsHtml;
    socialsHtml = function () {
      inSocialsFeed = true;
      let h;
      try { h = origSocials.apply(this, arguments); }
      finally { inSocialsFeed = false; }
      const tpl = document.createElement('template');
      tpl.innerHTML = h;

      // Mark Socials screen for clean flexbox scroll + balanced layout
      const screen = tpl.content.querySelector('.fifa-screen');
      if (screen) screen.classList.add('yo-socials-screen');

      // 1. Add Feed Filter pills right at top of the Y feed panel
      const xBody = tpl.content.querySelector('[data-key="x"] .panel-body') || tpl.content.querySelector('.x-feed');
      if (xBody) {
        const filters = [
          ['all', 'All Feed'],
          ['clip', '⚡ Highlights'],
          ['rivalry', '🔥 Rivalries'],
          ['poll', '📊 Polls'],
          ['leak', '👀 Leaks'],
        ];
        const bar = document.createElement('div');
        bar.className = 'yo-filters';
        bar.innerHTML = filters.map(([k, lbl]) =>
          `<button type="button" class="yo-fbtn ${yFilter === k ? 'on' : ''}" data-yo-filter="${k}">${lbl}</button>`
        ).join('');
        xBody.insertBefore(bar, xBody.firstChild);
      }

      // 2. Place Active Rivalries card in the LEFT column below the Socials feed (fills dead space & frees the right sidebar so Most Followed scrolls cleanly!)
      const mainCol = tpl.content.querySelector('.fifa-main');
      const rivHtml = rivalriesWidgetHtml();
      if (mainCol && rivHtml) {
        mainCol.insertAdjacentHTML('beforeend', rivHtml);
      }
      return tpl.innerHTML;
    };
  }

  document.addEventListener('click', async (e) => {
    const t = e.target;
    if (!t || !t.closest) return;

    const fBtn = t.closest('[data-yo-filter]');
    if (fBtn) {
      e.stopPropagation();
      yFilter = fBtn.dataset.yoFilter || 'all';
      if (typeof render === 'function') render();
      return;
    }

    const rBtn = t.closest('[data-yo-reply]');
    if (rBtn) {
      e.stopPropagation();
      const postId = Number(rBtn.dataset.yoReply);
      const postHandle = rBtn.dataset.yoHandle || '';
      const tone = rBtn.dataset.yoTone || 'trash';
      const label = tone === 'ratio' ? 'Ratio reply sent!' : tone === 'respect' ? 'Respect reply sent!' : 'Clapback posted!';
      await sendYCmd({ op: 'reply', postId, postHandle, tone }, label);
      return;
    }

    const openRep = t.closest('[data-yo-open-reply]');
    if (openRep) {
      e.stopPropagation();
      const key = openRep.dataset.yoOpenReply || '';
      replyOpenKey = replyOpenKey === key ? null : key;
      if (typeof render === 'function') render();
      const inp = document.getElementById('yo-custom-reply-input');
      if (inp) inp.focus();
      return;
    }

    const sendCustom = t.closest('[data-yo-send-custom]');
    if (sendCustom) {
      e.stopPropagation();
      const pid = Number(sendCustom.dataset.yoSendCustom);
      const postHandle = sendCustom.dataset.yoHandle || '';
      const inp = document.getElementById('yo-custom-reply-input');
      const txt = inp ? inp.value.trim() : '';
      if (!txt) return;
      replyOpenKey = null;
      await sendYCmd({ op: 'reply', postId: pid, postHandle, tone: 'trash', text: txt }, 'Reply posted on Y!');
      return;
    }

    const recBtn = t.closest('[data-yo-receipts]');
    if (recBtn) {
      e.stopPropagation();
      await sendYCmd({ op: 'receipts', postId: Number(recBtn.dataset.yoReceipts) }, 'Receipts pulled! 📸');
      return;
    }

    const voteBtn = t.closest('[data-yo-vote]');
    if (voteBtn && !voteBtn.disabled) {
      e.stopPropagation();
      await sendYCmd({ op: 'vote', postId: Number(voteBtn.dataset.yoVote), optionIdx: Number(voteBtn.dataset.yoOpt) }, 'Vote recorded!');
      return;
    }

    const leakBtn = t.closest('[data-yo-leak]');
    if (leakBtn) {
      e.stopPropagation();
      await sendYCmd({ op: 'leak-react', postId: Number(leakBtn.dataset.yoLeak), mode: leakBtn.dataset.yoMode }, 'Replied to transfer insider!');
      return;
    }

    const callBtn = t.closest('[data-yo-callout]');
    if (callBtn) {
      e.stopPropagation();
      const sel = document.getElementById('yo-callout-sel');
      const rawVal = sel ? sel.value : calloutTeamId;
      if (rawVal === '' || rawVal == null) return;
      const tid = Number(rawVal);
      if (!Number.isFinite(tid)) return;
      await sendYCmd({ op: 'callout', teamId: tid }, 'Called out rival on Y! 🔥');
    }
  }, true);

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t && t.id === 'yo-callout-sel') {
      calloutTeamId = Number(t.value);
    }
  }, true);

  if (typeof render === 'function') render();
})();

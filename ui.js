(function () {
  'use strict';
  if (window.__careerPlusUI) return;
  window.__careerPlusUI = true;

  if (typeof ratingTier === 'function') {
    ratingTier = function (r) {
      const n = Number(r);
      return n >= 90 ? 'elite' : n >= 75 ? '' : n >= 60 ? 'silver' : 'bronze';
    };
  }
  if (typeof playerModalHtml === 'function') {
    const origPlayerModalHtml = playerModalHtml;
    playerModalHtml = function (p) {
      let h = origPlayerModalHtml.apply(this, arguments);
      const r = Number(p && p.rating);
      const cls = r >= 90 ? 'cp-rate-elite' : r >= 75 ? 'cp-rate-gold' : r >= 60 ? 'cp-rate-silver' : 'cp-rate-bronze';
      return h.replace('<div class="chip"><div class="v">', '<div class="chip ' + cls + '"><div class="v">');
    };
  }

  const rlPitchSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" preserveAspectRatio="none">'
    + '<defs>'
    + '<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#07131c"/><stop offset="50%" stop-color="#0a1922"/><stop offset="100%" stop-color="#14110b"/></linearGradient>'
    + '<linearGradient id="rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#00d4ff" stop-opacity=".7"/><stop offset="50%" stop-color="#33536b" stop-opacity=".6"/><stop offset="100%" stop-color="#f59e0b" stop-opacity=".75"/></linearGradient>'
    + '<clipPath id="arena"><polygon points="34,12 566,12 588,34 588,366 566,388 34,388 12,366 12,34"/></clipPath>'
    + '</defs>'
    + '<rect width="600" height="400" fill="url(#bg)"/>'
    + '<g clip-path="url(#arena)">'
    + '<rect x="12" y="12" width="576" height="376" fill="#0d2029"/>'
    + '<rect x="60" y="12" width="60" height="376" fill="#102731" opacity=".65"/>'
    + '<rect x="180" y="12" width="60" height="376" fill="#102731" opacity=".65"/>'
    + '<rect x="300" y="12" width="60" height="376" fill="#102731" opacity=".65"/>'
    + '<rect x="420" y="12" width="60" height="376" fill="#102731" opacity=".65"/>'
    + '<rect x="540" y="12" width="60" height="376" fill="#102731" opacity=".65"/>'
    + '<rect x="12" y="12" width="576" height="188" fill="#00d4ff" opacity=".045"/>'
    + '<rect x="12" y="200" width="576" height="188" fill="#f59e0b" opacity=".045"/>'
    + '<path d="M12,68 L588,68 M12,332 L588,332 M12,200 L588,200" stroke="#7ee8fa" stroke-opacity=".14" stroke-width="1.5"/>'
    + '<line x1="12" y1="200" x2="588" y2="200" stroke="#e2f1ff" stroke-opacity=".28" stroke-width="2"/>'
    + '<circle cx="300" cy="200" r="64" fill="#0b1a23" fill-opacity=".35" stroke="#7ee8fa" stroke-opacity=".32" stroke-width="2"/>'
    + '<circle cx="300" cy="200" r="14" fill="#0f2533" stroke="#e2f1ff" stroke-opacity=".65" stroke-width="2"/>'
    + '<circle cx="300" cy="200" r="5" fill="#7ee8fa" fill-opacity=".75"/>'
    + '<path d="M212,12 Q300,72 388,12" fill="#00d4ff" fill-opacity=".08" stroke="#00d4ff" stroke-opacity=".42" stroke-width="2"/>'
    + '<path d="M212,388 Q300,328 388,388" fill="#f59e0b" fill-opacity=".08" stroke="#f59e0b" stroke-opacity=".42" stroke-width="2"/>'
    + '<rect x="234" y="12" width="132" height="10" rx="2" fill="#00d4ff" fill-opacity=".22" stroke="#00d4ff" stroke-opacity=".7" stroke-width="1.5"/>'
    + '<rect x="234" y="378" width="132" height="10" rx="2" fill="#f59e0b" fill-opacity=".22" stroke="#f59e0b" stroke-opacity=".7" stroke-width="1.5"/>'
    + '<g fill="#fbbf24" stroke="#f59e0b" stroke-opacity=".55">'
    + '<circle cx="48" cy="44" r="11" fill="none" stroke-width="1.6"/><circle cx="48" cy="44" r="5.5"/>'
    + '<circle cx="552" cy="44" r="11" fill="none" stroke-width="1.6"/><circle cx="552" cy="44" r="5.5"/>'
    + '<circle cx="34" cy="200" r="11" fill="none" stroke-width="1.6"/><circle cx="34" cy="200" r="5.5"/>'
    + '<circle cx="566" cy="200" r="11" fill="none" stroke-width="1.6"/><circle cx="566" cy="200" r="5.5"/>'
    + '<circle cx="48" cy="356" r="11" fill="none" stroke-width="1.6"/><circle cx="48" cy="356" r="5.5"/>'
    + '<circle cx="552" cy="356" r="11" fill="none" stroke-width="1.6"/><circle cx="552" cy="356" r="5.5"/>'
    + '</g>'
    + '<g fill="#f59e0b" fill-opacity=".72" stroke="#fbbf24" stroke-opacity=".35">'
    + '<circle cx="184" cy="96" r="5.5" fill="none"/><circle cx="184" cy="96" r="2.6"/>'
    + '<circle cx="416" cy="96" r="5.5" fill="none"/><circle cx="416" cy="96" r="2.6"/>'
    + '<circle cx="300" cy="80" r="5.5" fill="none"/><circle cx="300" cy="80" r="2.6"/>'
    + '<circle cx="136" cy="148" r="5.5" fill="none"/><circle cx="136" cy="148" r="2.6"/>'
    + '<circle cx="464" cy="148" r="5.5" fill="none"/><circle cx="464" cy="148" r="2.6"/>'
    + '<circle cx="216" cy="200" r="5.5" fill="none"/><circle cx="216" cy="200" r="2.6"/>'
    + '<circle cx="384" cy="200" r="5.5" fill="none"/><circle cx="384" cy="200" r="2.6"/>'
    + '<circle cx="136" cy="252" r="5.5" fill="none"/><circle cx="136" cy="252" r="2.6"/>'
    + '<circle cx="464" cy="252" r="5.5" fill="none"/><circle cx="464" cy="252" r="2.6"/>'
    + '<circle cx="184" cy="304" r="5.5" fill="none"/><circle cx="184" cy="304" r="2.6"/>'
    + '<circle cx="416" cy="304" r="5.5" fill="none"/><circle cx="416" cy="304" r="2.6"/>'
    + '<circle cx="300" cy="320" r="5.5" fill="none"/><circle cx="300" cy="320" r="2.6"/>'
    + '</g></g>'
    + '<polygon points="34,12 566,12 588,34 588,366 566,388 34,388 12,366 12,34" fill="none" stroke="url(#rim)" stroke-width="2.5"/>'
    + '</svg>';
  const rlPitchUri = 'data:image/svg+xml,' + encodeURIComponent(rlPitchSvg);

  const st = document.createElement('style');
  st.textContent = `
    .cp-wrap{display:flex;flex-direction:column;gap:14px;height:100%;max-height:100%;min-height:0;overflow-y:auto;overflow-x:hidden;
      padding:2px 8px 24px 2px;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:rgba(56,226,255,.45) transparent}
    .cp-wrap::-webkit-scrollbar{width:7px}
    .cp-wrap::-webkit-scrollbar-thumb{background:rgba(56,226,255,.42);border-radius:4px}
    .cp-wrap::-webkit-scrollbar-thumb:hover{background:#38e2ff}
    .cp-hero{flex:none;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;padding:14px 18px;border-radius:10px;
      background:linear-gradient(125deg,rgba(0,212,255,.14),rgba(13,20,32,.92) 55%,rgba(168,85,247,.12));
      border:1px solid #26405e;box-shadow:inset 0 3px 0 #00d4ff,0 10px 26px rgba(0,0,0,.38)}
    .cp-hero-left{display:flex;align-items:center;gap:14px;min-width:0}
    .cp-hero-left .crest{width:42px!important;height:44px!important;flex:none}
    .cp-hero-title{font-size:18px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.9)}
    .cp-hero-sub{font-size:12px;color:#9eddf5;font-weight:700;margin-top:2px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
    .cp-hero-pill{padding:2px 8px;border-radius:5px;background:rgba(10,16,26,.82);border:1px solid rgba(56,226,255,.32);color:#7ee8fa;font-size:11px;font-weight:800}
    .cp-subtabs{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
    .cp-subtab{border:1px solid #2a405c;background:#121b2a;color:#a9bfd6;border-radius:7px;padding:7px 12px;font:800 11.5px/1.2 inherit;
      letter-spacing:.05em;text-transform:uppercase;cursor:pointer;transition:all .14s}
    .cp-subtab:hover{background:#19273c;border-color:#38e2ff;color:#fff}
    .cp-subtab.on{background:linear-gradient(135deg,#0284c7,#00d4ff);border-color:#67e8f9;color:#041621}
    .cp-page{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start}
    .cp-page.single{grid-template-columns:1fr}
    @media(max-width:960px){.cp-page{grid-template-columns:1fr}}
    .cp-box{padding:15px 17px;border-radius:10px;border:1px solid #243850;border-top:3px solid #00d4ff;
      background:linear-gradient(180deg,color-mix(in srgb,#00d4ff 7%,#111824),#0e1520);box-shadow:0 8px 24px rgba(0,0,0,.35)}
    .cp-box.ntf{border-top-color:#c084fc;background:linear-gradient(180deg,color-mix(in srgb,#a855f7 8%,#111824),#0e1520)}
    .cp-box.vis{border-top-color:#22c55e;background:linear-gradient(180deg,color-mix(in srgb,#22c55e 7%,#111824),#0e1520)}
    .cp-box.mod{border-top-color:#f5b942;background:linear-gradient(180deg,color-mix(in srgb,#f5b942 8%,#111824),#0e1520)}
    .cp-hd{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:7px;border-bottom:1px solid rgba(255,255,255,.08)}
    .cp-box h3{margin:0;font-size:13.5px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#38e2ff;text-shadow:0 1px 3px rgba(0,0,0,.95)}
    .cp-box.ntf h3{color:#d8b4fe}
    .cp-box.vis h3{color:#4ade80}
    .cp-box.mod h3{color:#ffd166}
    .cp-sec-h{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#8db6d8;margin:10px 0 5px}
    .cp-tog-list{display:flex;flex-direction:column;gap:6px}
    .cp-tog-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:7px 11px;border-radius:7px;cursor:pointer;
      background:rgba(12,19,30,.85);border:1px solid #243850;transition:border-color .14s,background .14s}
    .tsq-choose-sec{font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#7ee8fa;margin:8px 0 5px}
    .tsq-choose-sec.intl{color:#ffd166;margin-top:12px;padding-top:8px;border-top:1px solid rgba(255,209,102,.22)}
    .cp-tog-row:hover{background:#162235;border-color:#365578}
    .cp-tog-row:has(input:checked){background:linear-gradient(135deg,rgba(34,197,94,.16),rgba(0,212,255,.1));border-color:#4ade80}
    .cp-tog-info{min-width:0;flex:1}
    .cp-tog-name{font-size:12.5px;font-weight:800;color:#eef4fc}
    .cp-tog-desc{font-size:11px;color:#93abc4;margin-top:1px}
    .cp-tog-row input{accent-color:#4ade80;width:17px;height:17px;flex:none;cursor:pointer}
    .cp-swatch-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
    .cp-swatch-btn{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:6px;border:1px solid #2a3e58;
      background:#121b29;color:#dbe7f5;font:700 11.5px/1.2 inherit;cursor:pointer}
    .cp-swatch-btn:hover{border-color:#38e2ff;color:#fff}
    .cp-swatch-btn.on{border-color:#00d4ff;background:#102a40;color:#7ee8fa}
    .cp-swatch-dot{width:11px;height:11px;border-radius:50%;flex:none}
    .cp-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:8px 0;color:#eef4fc;text-shadow:0 1px 2px rgba(0,0,0,.85)}
    .cp-chk{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;cursor:pointer;padding:8px 12px;color:#d6f5ff;
      text-shadow:0 1px 2px rgba(0,0,0,.95);border-radius:6px;background:color-mix(in srgb,#00d4ff 12%,rgba(12,18,28,.8));
      border:1px solid color-mix(in srgb,#00d4ff 38%,transparent);transition:all .15s}
    .cp-chk:has(input:checked){background:linear-gradient(135deg,color-mix(in srgb,#2ea043 28%,rgba(12,18,28,.85)),color-mix(in srgb,#00d4ff 16%,rgba(12,18,28,.85)));border-color:#56d364;color:#ffffff}
    .cp-chk input{accent-color:#3fb950;width:16px;height:16px}
    .cp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:10px;margin:10px 0}
    .cp-inline-club{display:inline-flex;align-items:center;gap:6px;padding:2px 8px 2px 5px;margin:0 2px;border-radius:6px;
      background:rgba(56,226,255,.12);border:1px solid rgba(56,226,255,.32);color:#fff;font-weight:800;vertical-align:middle}
    .cp-inline-club .crest{width:18px!important;height:19px!important;font-size:8px!important;flex:none}
    .cp-inline-club .crest.logo{width:18px!important;height:18px!important}
    body.cp-no-bg::before,body.cp-no-bg::after{display:none!important}
    html:not(.bg-light) body.cp-no-bg{background-color:#0b111c!important}
    body.cp-no-glint .tsq::before,body.cp-no-glint .tsq::after{animation:none!important;opacity:0!important}
    .cp-fld{display:flex;flex-direction:column;gap:4px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#7ee8fa;text-shadow:0 1px 2px rgba(0,0,0,.95)}
    .cp-in{padding:7px 9px;border-radius:5px;border:1px solid color-mix(in srgb,#00d4ff 35%,var(--rule));background:#0b1018;color:#ffffff;font:inherit;font-size:13px;font-weight:600}
    .cp-in:focus{outline:none;border-color:#38e2ff;box-shadow:0 0 0 2px color-mix(in srgb,#00d4ff 28%,transparent)}
    .cp-meta{font-size:12.5px;color:#dbe7f5;margin-top:12px;line-height:1.6;padding:11px 13px;border-radius:6px;
      background:rgba(9,14,22,.65);border:1px solid rgba(255,255,255,.08);border-left:3px solid #38e2ff;text-shadow:0 1px 2px rgba(0,0,0,.9)}
    .cp-badge{display:inline-block;margin-left:6px;padding:2px 7px;border-radius:4px;font-size:10px;
      font-weight:800;letter-spacing:.06em;text-transform:uppercase;background:rgba(46,160,67,.35);color:#7ee787;
      border:1px solid #56d364;text-shadow:0 1px 2px rgba(0,0,0,.95)}
    .cp-badge.off{background:rgba(248,81,73,.28);color:#ffa198;border-color:#ff7b72}
    .cp-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:12px;padding:10px 12px;
      border-radius:6px;border:1px solid color-mix(in srgb,#00d4ff 45%,transparent);
      background:linear-gradient(90deg,rgba(0,180,255,.16),rgba(63,185,80,.12));font-size:12px;text-shadow:0 1px 2px rgba(0,0,0,.9)}
    .cp-btn{border:1px solid rgba(255,255,255,.22);border-radius:5px;padding:7px 13px;font:800 12px/1.2 inherit;
      letter-spacing:.05em;text-transform:uppercase;cursor:pointer;color:#ffffff;
      text-shadow:0 1px 2px rgba(0,0,0,.95),0 0 2px rgba(0,0,0,.8);transition:filter .15s,transform .12s}
    .cp-btn:hover{filter:brightness(1.12);transform:translateY(-1px)}
    .cp-btn.cyan{background:linear-gradient(135deg,#0284c7,#06b6d4);border-color:#38e2ff}
    .cp-btn.green{background:linear-gradient(135deg,#15803d,#22c55e);border-color:#56d364}
    .cp-btn.amber{background:linear-gradient(135deg,#d97706,#f59e0b);border-color:#ffd166;color:#ffffff}
    .cp-btn.red{background:linear-gradient(135deg,#b91c1c,#ef4444);border-color:#ff8080}
    .cp-btn.ghost{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.28)}
    .cp-ver-label{text-shadow:0 1px 3px rgba(0,0,0,.98),0 0 2px rgba(0,0,0,.95)!important;font-weight:800!important}
    .tile.content.facilities>.tile-body,[data-key="media"]>.tile-body,[data-key="bets"]>.tile-body{display:flex;flex-direction:column;height:100%;min-height:0}
    .cp-off-fac{flex:1 1 0;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:6px;padding-right:3px;scrollbar-width:thin;scrollbar-color:rgba(56,226,255,.4) transparent}
    .cp-off-fac-img{flex:none;border-radius:7px;overflow:hidden;border:1px solid rgba(56,226,255,.35);background:#0e1520}
    .cp-off-fac-img img{width:100%;height:auto;display:block;object-fit:contain}
    .cp-off-fac-foot{flex:none;padding:5px 7px;border-radius:6px;background:linear-gradient(180deg,#121c2a,#0a1019);border:1px solid rgba(255,255,255,.1)}
    .cp-off-pill{display:inline-flex;align-items:center;gap:4px;padding:1px 6px;border-radius:4px;font-size:9.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;
      color:#fff;background:rgba(10,16,26,.9);border:1px solid rgba(56,226,255,.45);text-shadow:0 1px 2px #000;flex:none}
    .cp-off-pill.own{border-color:#56d364;color:#7ee787}
    .cp-off-pills{display:flex;flex-wrap:wrap;gap:4px}
    .cp-off-stat{font-size:10px;font-weight:700;padding:1px 5px;border-radius:4px;background:rgba(12,18,28,.9);border:1px solid rgba(255,255,255,.16);color:#d8eeff;text-shadow:0 1px 2px #000}
    .cp-off-list{display:flex;flex-direction:column;gap:5px;flex:1 1 0;height:100%;min-height:0;justify-content:flex-start}
    .cp-mo-scroll{flex:1 1 0;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:5px;padding-right:3px;scrollbar-width:thin;scrollbar-color:rgba(56,226,255,.4) transparent}
    .cp-mo-scroll::-webkit-scrollbar,.cp-off-fac::-webkit-scrollbar{width:5px}
    .cp-mo-scroll::-webkit-scrollbar-thumb,.cp-off-fac::-webkit-scrollbar-thumb{background:rgba(56,226,255,.4);border-radius:4px}
    .cp-off-head{flex:none;display:flex;justify-content:space-between;align-items:center;gap:6px;font-size:11px;font-weight:800;color:#c7d8eb;text-shadow:0 1px 2px #000}
    .cp-bet-row{flex:none;display:flex;flex-direction:column;gap:3px;padding:6px 8px;border-radius:6px;
      background:linear-gradient(135deg,rgba(14,22,34,.92),rgba(20,30,44,.86));border:1px solid rgba(255,255,255,.12)}
    .cp-bet-line{display:flex;align-items:center;justify-content:space-between;gap:6px;min-width:0}
    .cp-bet-side{display:flex;align-items:center;gap:6px;min-width:0;flex:1}
    .cp-bet-side .crest{width:20px!important;height:22px!important;font-size:8px!important;flex:none}
    .cp-bet-side .crest.logo{width:20px!important;height:20px!important}
    .cp-bet-nm{font-size:11.5px;font-weight:700;color:#eef4fc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 2px #000}
    .cp-odd{display:inline-flex;align-items:center;gap:3px;padding:1px 6px;border-radius:4px;font:800 11px/1.25 monospace;flex:none;text-shadow:0 1px 2px #000}
    .cp-odd.down{background:rgba(46,160,67,.28);color:#7ee787;border:1px solid rgba(86,211,100,.55)}
    .cp-odd.up{background:rgba(248,81,73,.25);color:#ffa198;border:1px solid rgba(255,123,114,.5)}
    .cp-bet-placed{flex:none;padding:6px 8px;border-radius:6px;background:linear-gradient(135deg,rgba(245,158,11,.22),rgba(20,30,44,.9));border:1px solid rgba(255,209,102,.45);border-left:3px solid #ffd166}
    .cp-bet-tag{padding:1px 5px;border-radius:4px;font:800 9.5px/1.2 monospace;background:rgba(245,158,11,.28);color:#ffd166;border:1px solid rgba(255,209,102,.55);flex:none}
    .cp-mo-row{flex:none;display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;
      background:linear-gradient(90deg,rgba(16,24,36,.92),rgba(16,24,36,.72));border:1px solid rgba(255,255,255,.1);border-left:3px solid #38e2ff}
    .cp-mo-row .mo-mark{width:34px!important;height:34px!important;padding:4px!important;border-radius:6px!important;flex:none;font-size:9px!important}
    .cp-mo-row .mo-mark img{width:100%;height:100%;object-fit:contain}
    .cp-mo-info{min-width:0;flex:1}
    .cp-mo-top{font-size:12px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 2px #000}
    .cp-mo-sub{font-size:10.5px;color:#b8cbe0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 2px #000}
    .cp-mo-fee{font-size:11.5px;font-weight:800;color:#7ee787;text-align:right;white-space:nowrap;text-shadow:0 1px 2px #000}
    .cp-mo-empty{display:flex;align-items:center;gap:10px;padding:10px;border-radius:7px;height:100%;
      background:linear-gradient(135deg,rgba(0,180,255,.12),rgba(139,92,246,.14));border:1px solid rgba(56,226,255,.28)}
    .cp-mo-empty .crest{width:36px!important;height:38px!important;flex:none}
    #toast-root,.toast-root{z-index:999!important}
    .cp-bet-toast{display:flex;align-items:center;gap:10px;border-left:4px solid #38e2ff!important;text-shadow:0 1px 2px #000}
    .cp-bet-toast.win{border-left-color:#22c55e!important;background:linear-gradient(90deg,rgba(21,128,61,.92),rgba(16,28,24,.96))!important;box-shadow:0 8px 26px rgba(34,197,94,.28)!important}
    .cp-bet-toast.loss{border-left-color:#ef4444!important;background:linear-gradient(90deg,rgba(153,27,27,.9),rgba(28,16,20,.96))!important}
    .cp-bet-toast.void{border-left-color:#f59e0b!important;background:linear-gradient(90deg,rgba(146,64,14,.88),rgba(24,22,18,.96))!important}
    .cp-bet-toast.auto{border-left-color:#00d4ff!important;background:linear-gradient(90deg,rgba(2,132,199,.88),rgba(14,24,36,.96))!important;box-shadow:0 8px 26px rgba(0,212,255,.24)!important}
    .cp-bet-toast.peak{border-left-color:#f59e0b!important;background:linear-gradient(90deg,rgba(180,83,9,.9),rgba(26,20,14,.96))!important;box-shadow:0 8px 26px rgba(245,158,11,.25)!important}
    .cp-bet-toast.player{border-left-color:#a855f7!important;background:linear-gradient(90deg,rgba(126,34,206,.88),rgba(20,16,32,.96))!important;box-shadow:0 8px 26px rgba(168,85,247,.25)!important}
    .cp-bet-toast.mail{border-left-color:#38e2ff!important;background:linear-gradient(90deg,rgba(14,116,144,.92),rgba(12,22,35,.97))!important;box-shadow:0 8px 26px rgba(56,226,255,.24)!important}
    .cp-bet-toast.chat{border-left-color:#c084fc!important;background:linear-gradient(90deg,rgba(107,33,168,.92),rgba(20,15,34,.97))!important;box-shadow:0 8px 26px rgba(192,132,252,.26)!important}
    .cp-bet-toast .crest,.cp-bet-toast .cp-toast-face{width:28px!important;height:30px!important;font-size:10px!important;flex:none}
    .cp-bet-toast .crest.logo,.cp-bet-toast .cp-toast-face{width:28px!important;height:28px!important;border-radius:50%!important;overflow:hidden}
    .cp-bt-top{font-size:12.5px;font-weight:800;color:#fff;display:flex;align-items:center;justify-content:space-between;gap:8px}
    .cp-bt-sub{font-size:11px;color:#d6e4f2}
    .toast:not(.cp-bet-toast){background:#141d2b!important;border:1px solid #27374d!important;box-shadow:inset 4px 0 0 #38e2ff,0 8px 24px rgba(0,0,0,.45)!important;color:#f1f6fd!important;text-shadow:0 1px 2px #000}
    .toast.err:not(.cp-bet-toast){background:#221418!important;border:1px solid #4c2329!important;box-shadow:inset 4px 0 0 #ef4444,0 8px 24px rgba(0,0,0,.45)!important}
    body.cp-themed .win-banner{background:#221317!important;border:1px solid #6b232a!important;box-shadow:inset 3px 0 0 #ef4444!important;color:#fca5a5!important;border-radius:7px!important}
    body.cp-themed .win-banner.soon{background:#261e10!important;border:1px solid #75561c!important;box-shadow:inset 3px 0 0 #f59e0b!important;color:#fcd34d!important}
    body.cp-themed .win-banner.open{background:#12211b!important;border:1px solid #26563f!important;box-shadow:inset 3px 0 0 #22c55e!important;color:#7ee787!important}
    .win-closed{color:#f87171!important}
    .win-closed.soon{color:#fbbf24!important}
    .win-open{color:#4ade80!important}
    body.cp-themed .tile.wide.board{background:#121a26!important;border:1px solid #253447!important;box-shadow:inset 0 3px 0 #22c55e!important}
    body.cp-themed .tile.wide.board>.tile-title{color:#4ade80!important;text-shadow:0 1px 2px #000}
    body.cp-themed .tile.wide.board .obj-bar{gap:8px!important;align-items:stretch!important}
    body.cp-themed .tile.wide.board .obj-pos{background:#152c22!important;color:#7ee787!important;border:1px solid #2d6a4f!important;border-radius:6px!important;
      display:inline-flex!important;align-items:center!important;justify-content:center!important;line-height:1!important;padding:8px 14px!important}
    body.cp-themed .tile.wide.board .obj-track{border-radius:6px!important;overflow:hidden!important;display:flex!important;align-items:center!important;padding:0 12px!important;background:#182332!important;border:1px solid #25364a!important}
    body.cp-themed .board-screen .tb-light{background:#101722!important}
    body.cp-themed .board-screen .tb-light .tb-title{color:#38e2ff!important;text-shadow:0 1px 2px #000}
    body.cp-themed .board-screen .fac-sub{color:#9cb3cc!important}
    body.cp-themed .board-screen .bd-card{--bd-acc:#38e2ff;background:#16202e!important;border:1px solid #253346!important;
      box-shadow:inset 0 3px 0 var(--bd-acc)!important;border-radius:8px!important;transition:transform .14s,box-shadow .14s,background .14s}
    body.cp-themed .board-screen .bd-card:hover{transform:translateY(-2px);background:#1a2638!important}
    body.cp-themed .board-screen .bd-card[data-key="overview"]{--bd-acc:#22c55e}
    body.cp-themed .board-screen .bd-card[data-key="youth"]{--bd-acc:#a855f7}
    body.cp-themed .board-screen .bd-card[data-key="brand"]{--bd-acc:#00d4ff}
    body.cp-themed .board-screen .bd-card[data-key="financial"]{--bd-acc:#f59e0b}
    body.cp-themed .board-screen .bd-card[data-key="domestic"]{--bd-acc:#3b82f6}
    body.cp-themed .board-screen .bd-card[data-key="continental"]{--bd-acc:#ec4899}
    body.cp-themed .board-screen .bd-card .fac-card-name{color:#fff!important;text-shadow:0 1px 2px #000}
    body.cp-themed .board-screen .bd-card .fac-card-desc{color:#b7c9dc!important}
    body.cp-themed .board-screen .bd-card.on{background:#1d2b3e!important;border:1px solid var(--bd-acc)!important;
      box-shadow:inset 0 3px 0 var(--bd-acc),0 8px 22px rgba(0,0,0,.45)!important}
    body.cp-themed .board-screen .bd-card.on .fac-card-name,body.cp-themed .board-screen .bd-card.on .fac-card-desc,body.cp-themed .board-screen .bd-card.on .bd-status{color:#fff!important}
    body.cp-themed .board-screen .bd-status{padding:3px 9px;border-radius:99px;background:#1d293a;border:1px solid #2f4057;font-size:10.5px!important}
    body.cp-themed .board-screen .bd-status.bd-on,body.cp-themed .board-screen .bd-status.bd-met{color:#7ee787!important;background:#142d22!important;border-color:#266346!important}
    body.cp-themed .board-screen .bd-status.bd-risk{color:#ffd166!important;background:#2d2414!important;border-color:#6b4f1d!important}
    body.cp-themed .board-screen .bd-status.bd-missed{color:#ffa198!important;background:#2f171b!important;border-color:#6d2832!important}
    body.cp-themed .board-screen .tb-dark{background:#0f1621!important;border-left:1px solid #243347!important}
    body.cp-themed .board-screen .tb-dark .tb-title{color:#fff!important;border-bottom:2px solid #263950;padding-bottom:8px;margin-bottom:8px}
    body.cp-themed .board-screen .bd-row{padding:9px 11px!important;margin:6px 0;border-radius:7px;background:#16202f!important;border:1px solid #253449!important}
    body.cp-themed .board-screen .bd-dot.bd-on,body.cp-themed .board-screen .bd-dot.bd-met{background:#22c55e!important}
    body.cp-themed .board-screen .bd-dot.bd-risk{background:#f59e0b!important}
    body.cp-themed .board-screen .bd-dot.bd-missed{background:#ef4444!important}
    body.cp-themed .board-screen .fac-bar.bd-bar{height:10px!important;border-radius:99px!important;background:#1c2838!important;overflow:hidden}
    body.cp-themed .board-screen .fac-bar.bd-bar.bd-on i,body.cp-themed .board-screen .fac-bar.bd-bar.bd-met i{background:linear-gradient(90deg,#16a34a,#4ade80)!important}
    body.cp-themed .board-screen .fac-bar.bd-bar.bd-risk i{background:linear-gradient(90deg,#d97706,#ffd166)!important}
    body.cp-themed .board-screen .fac-bar.bd-bar.bd-missed i{background:linear-gradient(90deg,#dc2626,#ff7b72)!important}
    body.cp-themed .office-mosaic .tile.content.active{border:1px solid #25374a!important;box-shadow:inset 0 3px 0 #22c55e!important;background:#121a26!important}
    body.cp-themed .office-mosaic .tile.content.active>.tile-title{color:#4ade80!important;text-shadow:0 1px 2px #000}
    body.cp-themed .office-mosaic .tile.content.active .trow{padding:6px 10px!important;margin:0 0 6px 0!important;border-radius:6px;background:#182332;border:1px solid #263649!important}
    body.cp-themed .office-mosaic .tile.content.active .trow:last-child{margin-bottom:0!important}
    body.cp-themed .office-mosaic .tile.content.active .trow-k{color:#9eb5cc!important}
    body.cp-themed .office-mosaic .tile.content.active .trow-v{color:#ffffff!important;text-shadow:0 1px 2px #000}
    body.cp-themed .office-mosaic .tile.content.active .trow-v.good{color:#7ee787!important}
    body.cp-themed .office-mosaic .tile.content.active .trow-v.bad{color:#ffa198!important}
    body.cp-themed [data-key="media"]{background:#121a26!important;border:1px solid #25364a!important;box-shadow:inset 0 3px 0 #00d4ff!important}
    body.cp-themed [data-key="media"]>.tile-title{color:#38e2ff!important;text-shadow:0 1px 2px #000}
    body.cp-themed [data-key="bets"]{background:#121a26!important;border:1px solid #25364a!important;box-shadow:inset 0 3px 0 #f59e0b!important}
    body.cp-themed [data-key="bets"]>.tile-title{color:#ffd166!important;text-shadow:0 1px 2px #000}
    body.cp-themed .tile.content.facilities{background:#121a26!important;border:1px solid #25364a!important;box-shadow:inset 0 3px 0 #a855f7!important}
    body.cp-themed .tile.content.facilities>.tile-title{color:#d8b4fe!important;text-shadow:0 1px 2px #000}
    body.cp-themed .media-screen .tb-light,body.cp-themed .bets-screen .tb-light,body.cp-themed .fac-screen:not(.board-screen) .tb-light{background:#101722!important}
    body.cp-themed .media-screen .tb-dark,body.cp-themed .bets-screen .tb-dark,body.cp-themed .fac-screen:not(.board-screen) .tb-dark{background:#0f1621!important;border-left:1px solid #243347!important}
    body.cp-themed .media-screen .tb-light .tb-title{color:#38e2ff!important;text-shadow:0 1px 2px #000}
    body.cp-themed .bets-screen .tb-light .tb-title{color:#ffd166!important;text-shadow:0 1px 2px #000}
    body.cp-themed .fac-screen:not(.board-screen) .tb-light .tb-title{color:#d8b4fe!important;text-shadow:0 1px 2px #000}
    body.cp-themed .media-screen .mo-card,body.cp-themed .bets-screen .bt-card,body.cp-themed .fac-screen:not(.board-screen) .fac-card{
      background:#16202e!important;border:1px solid #253447!important;border-radius:7px!important;box-shadow:inset 0 2px 0 #2e425b!important}
    body.cp-themed .media-screen .mo-card.on{background:#16283d!important;border-color:#00d4ff!important;box-shadow:inset 0 3px 0 #00d4ff!important}
    body.cp-themed .bets-screen .bt-card.on{background:#292114!important;border-color:#f59e0b!important;box-shadow:inset 0 3px 0 #f59e0b!important}
    body.cp-themed .fac-screen:not(.board-screen) .fac-card.on{background:#211833!important;border-color:#a855f7!important;box-shadow:inset 0 3px 0 #a855f7!important}
    body.cp-themed .fac-screen:not(.board-screen) .fac-card.owned{box-shadow:inset 0 3px 0 #22c55e!important}
    body.cp-themed .bets-screen .bt-runner{background:#16202e!important;border:1px solid #253447!important;border-radius:6px!important}
    body.cp-themed .bets-screen .bt-runner.on{background:#153024!important;border-color:#22c55e!important;box-shadow:inset 3px 0 0 #22c55e!important}
    body.cp-themed .bets-screen .bt-place{background:#16a34a!important;color:#fff!important}
    body.cp-themed .media-screen .mo-accept:not(.taken):not(:disabled){background:#0284c7!important;color:#fff!important}
    body.cp-themed .fin .ec-head-k{color:#4ade80!important;text-shadow:0 1px 2px #000}
    body.cp-themed .fin .ec-stat{--fin-acc:#22c55e;background:#141d2b!important;border:1px solid #243347!important;box-shadow:inset 0 3px 0 var(--fin-acc)!important;border-radius:8px!important}
    body.cp-themed .fin .ec-row .ec-stat:nth-child(2){--fin-acc:#00d4ff}
    body.cp-themed .fin .ec-row .ec-stat:nth-child(3){--fin-acc:#f59e0b}
    body.cp-themed .fin .ec-row .ec-stat:nth-child(4){--fin-acc:#a855f7}
    body.cp-themed .fin .ec-stat-k{color:#9cb5ce!important}
    body.cp-themed .fin .ec-stat-v{color:#fff!important;text-shadow:0 1px 2px #000}
    body.cp-themed .fin .ec-block,body.cp-themed .fin .fin-slider{background:#141d2b!important;border:1px solid #243347!important;box-shadow:inset 0 2px 0 #38e2ff!important;border-radius:8px!important}
    body.cp-themed .fin .fin-head{color:#38e2ff!important;border-bottom:1px solid #243347;padding-bottom:6px}
    body.cp-themed .fin .fin-slider .fin-head{color:#ffd166!important;border-bottom-color:#3a3220}
    body.cp-themed .office-low>.panel{border:1px solid #25364a!important;box-shadow:inset 0 3px 0 #38e2ff!important;background:#121a26!important;border-radius:8px}
    body.cp-themed .office-low>.panel .panel-title,body.cp-themed .office-low>.panel .tile-title{color:#38e2ff!important;text-shadow:0 1px 2px #000}
    body.cp-themed .office-low>.panel .panel-body>div{border-radius:6px;background:#172231;border:1px solid #253548;box-shadow:inset 3px 0 0 #38e2ff;transition:background .12s}
    body.cp-themed .office-low>.panel .panel-body>div:hover{background:#1d2b3e}
    body.cp-themed .fifa-inbox{--ib-back:#0f1622;--ib-panel:#141d2b;--ib-raise:#1b283b;--ib-line:#223144;
      --ib-cyan:#38e2ff;--ib-tab-on:#00d4ff;--ib-tab-ink:#071b24;--ib-tab-off:#1a2538;--ib-tab-off-ink:#bfd3e6;--ib-red:#38e2ff;--ib-red-fill:#1b3b5c}
    body.cp-themed .fifa-inbox .ib-body{background:#111926!important;backdrop-filter:none!important;border:1px solid #27394f!important;border-radius:8px!important}
    body.cp-themed .fifa-inbox .ib-row{transition:background .12s}
    body.cp-themed .fifa-inbox .ib-row.on{background:#1b3b5c!important;box-shadow:inset 3px 0 0 #38e2ff!important}
    body.cp-themed .fifa-inbox .ib-mark{background:#22c55e!important;color:#052e16!important}
    body.cp-themed .fifa-inbox .ib-mark.needs{background:#f59e0b!important;color:#271704!important}
    body.cp-themed .fifa-main .panel[data-key="x"],body.cp-themed [data-key="x"]{background:#121a26!important;border:1px solid #25364a!important;box-shadow:inset 0 3px 0 #00d4ff!important;border-radius:8px}
    body.cp-themed [data-key="x"] .panel-title{color:#38e2ff!important;text-shadow:0 1px 2px #000}
    body.cp-themed [data-key="x"] .x-post{background:#16202e!important;border:1px solid #253447!important;border-radius:7px!important;padding:11px 13px!important;margin:0 0 8px 0!important}
    body.cp-themed [data-key="x"] .x-post:last-child{margin-bottom:0!important}
    body.cp-themed [data-key="x"] .x-post.mine{background:#152536!important;border-color:#264663!important;box-shadow:inset 3px 0 0 #00d4ff!important;padding-left:13px!important}
    body.cp-themed .me-card{background:#121a26!important;border:1px solid #25364a!important;box-shadow:inset 0 3px 0 #a855f7!important;border-radius:8px!important;overflow:hidden}
    body.cp-themed .me-card.has-post{border-color:#ec4899!important;box-shadow:inset 0 3px 0 #ec4899!important}
    body.cp-themed .me-card .x-profile-name{color:#fff!important;text-shadow:0 1px 2px #000}
    body.cp-themed .me-card .x-handle{color:#7ee8fa!important}
    body.cp-themed .post-dot{background:#ec4899!important;box-shadow:0 0 0 3px rgba(236,72,153,.28)!important}
    body.cp-themed .follow-card{background:#121a26!important;border:1px solid #25364a!important;box-shadow:inset 0 3px 0 #f59e0b!important;border-radius:8px!important}
    body.cp-themed .follow-card .card-h{color:#ffd166!important;text-shadow:0 1px 2px #000}
    body.cp-themed .follow-card .follow-row{background:#16202e!important;border:1px solid #253447!important;border-radius:6px!important;margin:0 0 6px 0!important;padding:10px 12px!important}
    body.cp-themed .follow-card .follow-row:last-child{margin-bottom:0!important}
    body.cp-themed .follow-card .follow-row.clickable:hover{background:#1b283b!important}
    body.cp-themed .follow-card .follow-row.me{background:#152a26!important;border-color:#285e4e!important;box-shadow:inset 3px 0 0 #22c55e!important}
    body.cp-themed .follow-card .panel-tab.active{background:#f59e0b!important;color:#1b1202!important;font-weight:800!important}
    body.cp-themed .me-card .prof,body.cp-themed .me-card .x-compose{background:#121a26!important}
    body.cp-themed .me-card .x-compose{border-top:1px solid #25364a!important}
    body.cp-themed .season-screen .season-plate{
      background:linear-gradient(94deg,#0d1420 26%,rgba(13,20,32,.8) 65%,rgba(13,20,32,.62) 100%),url("art/news/arena-champions-field.png") center/cover no-repeat!important;
      border:1px solid #263950!important;box-shadow:inset 0 3px 0 #00d4ff!important;border-radius:8px!important}
    body.cp-themed .season-screen .sp-big{color:#ffffff!important;text-shadow:0 2px 10px rgba(0,212,255,.35),0 2px 4px #000}
    body.cp-themed .season-screen .sp-mark{filter:drop-shadow(0 4px 14px rgba(0,212,255,.35))}
    body.cp-themed .season-screen .big-cal{background:#121a26!important;border:1px solid #25364a!important;box-shadow:inset 0 3px 0 #38e2ff!important;border-radius:8px!important}
    body.cp-themed .season-screen .big-cal>.tile-title{color:#38e2ff!important;text-shadow:0 1px 2px #000}
    body.cp-themed .season-screen .cal-cell{background:#16202e!important;border:1px solid #243347!important;border-radius:6px!important}
    body.cp-themed .season-screen .cal-cell.weekend{background:#192536!important}
    body.cp-themed .season-screen .cal-cell.today{background:#132a33!important;border-color:#00d4ff!important;box-shadow:inset 0 0 0 1px #00d4ff!important;color:#fff!important}
    body.cp-themed .season-pair>[data-key="nextmatch"]{background:#121a26!important;border:1px solid #25364a!important;box-shadow:inset 0 3px 0 #22c55e!important;border-radius:8px!important}
    body.cp-themed .season-pair>[data-key="nextmatch"]>.tile-title{color:#4ade80!important;text-shadow:0 1px 2px #000}
    body.cp-themed .season-pair>[data-key="worldcup"],body.cp-themed .season-pair>[data-key="stats"]{background:#121a26!important;border:1px solid #25364a!important;box-shadow:inset 0 3px 0 #f59e0b!important;border-radius:8px!important}
    body.cp-themed .season-pair>[data-key="worldcup"]>.tile-title,body.cp-themed .season-pair>[data-key="stats"]>.tile-title{color:#ffd166!important;text-shadow:0 1px 2px #000}
    body.cp-themed .season-screen .world-tile{background:linear-gradient(180deg,#121a26 0%,#0d1522 100%)!important;border:1px solid #25364a!important;box-shadow:inset 0 3px 0 #a855f7!important;border-radius:8px!important}
    body.cp-themed .season-screen .world-tile>.tile-title{color:#d8b4fe!important;text-shadow:0 1px 2px #000}
    body.cp-themed .season-screen .wc-land{fill:#24344c!important;stroke:#314663!important}
    body.cp-themed .season-screen .wc-land.mine{fill:#22c55e!important;stroke:#4ade80!important}
    body.cp-themed .office-window:not(.fifa-inbox) .ow-panel{background:#101722!important;border:1px solid #263950!important;border-radius:8px!important;box-shadow:0 24px 60px rgba(0,0,0,.65)!important}
    body.cp-themed .office-window:not(.fifa-inbox) .ow-head{
      background:linear-gradient(95deg,#0f1622 25%,rgba(15,22,34,.75) 68%,rgba(15,22,34,.9) 100%),url("art/news/arena-dfh-stadium.png") center/cover no-repeat!important;
      border-bottom:1px solid #25364a;padding-bottom:14px}
    body.cp-themed .office-window:not(.fifa-inbox) .ow-title{color:#fff!important;text-shadow:0 2px 6px rgba(0,212,255,.35),0 1px 2px #000}
    body.cp-themed .office-window:not(.fifa-inbox) .ow-tabs{background:#0d141f!important;border-bottom:1px solid #243347!important;margin-top:0!important;padding-top:6px!important}
    body.cp-themed .office-window:not(.fifa-inbox) .ow-tab{color:#9cb3cc!important;border-bottom:3px solid transparent!important}
    body.cp-themed .office-window:not(.fifa-inbox) .ow-tab:hover{color:#fff!important}
    body.cp-themed .office-window:not(.fifa-inbox) .ow-tab.on,body.cp-themed .office-window:not(.fifa-inbox) .ow-tab.active{color:#38e2ff!important;border-bottom-color:#00d4ff!important}
    body.cp-themed .ev-how{background:#16202e!important;border:1px solid #253447!important;box-shadow:inset 3px 0 0 #38e2ff!important;border-radius:7px!important;padding:10px 14px!important}
    body.cp-themed .fx-row{background:#16202e!important;border:1px solid #253447!important;border-radius:6px!important;margin:0 0 6px 0!important}
    body.cp-themed .fx-row.me{background:#142823!important;border-color:#26594a!important;box-shadow:inset 3px 0 0 #22c55e!important}
    body.cp-themed .two-blocks:not(.board-screen):not(.bets-screen):not(.media-screen):not(.fac-screen) .tb-light{background:#101722!important;border-right:1px solid #243347}
    body.cp-themed .two-blocks:not(.board-screen):not(.bets-screen):not(.media-screen):not(.fac-screen) .tb-dark{background:#0f1621!important}
    body.cp-themed .two-blocks:not(.board-screen):not(.bets-screen):not(.media-screen):not(.fac-screen) .tb-item{
      background:#16202e!important;border:1px solid #253447!important;border-radius:6px!important;padding:9px 11px!important;margin:0 0 6px 0!important;color:#c5d6e8!important}
    body.cp-themed .two-blocks:not(.board-screen):not(.bets-screen):not(.media-screen):not(.fac-screen) .tb-item.on{
      background:#1a2d42!important;border-color:#00d4ff!important;box-shadow:inset 3px 0 0 #00d4ff!important;color:#fff!important}
    body.cp-themed .two-blocks:not(.board-screen):not(.bets-screen):not(.media-screen):not(.fac-screen) .tb-head{
      background:linear-gradient(95deg,#121c2a 30%,rgba(18,28,42,.72) 100%),url("art/news/arena-mannfield.png") center/cover no-repeat!important;
      padding:12px 14px!important;border-radius:7px!important;border:1px solid #263950!important;margin-bottom:10px!important}
    body.cp-themed .ident{background:#121a26!important;color:#eef4fc!important;box-shadow:inset 4px 0 0 #00d4ff!important}
    body.cp-themed .ident-name{color:#ffffff!important;text-shadow:0 1px 2px #000}
    body.cp-themed .ident-club{color:#7ee8fa!important}
    body.cp-themed .ident-ovr{background:#0d3b4d!important;color:#38e2ff!important;text-shadow:0 1px 2px #000}
    body.cp-themed .ident-trend.up{border-bottom-color:#4ade80!important}
    body.cp-themed .ident-trend.down{border-top-color:#ff7b72!important}
    body.cp-themed .statstrip{background:#121a26!important;color:#eef4fc!important;box-shadow:inset 0 -2px 0 #263950!important}
    body.cp-themed .statstrip .ss-k{color:#7ee8fa!important}
    body.cp-themed .statstrip .ss-v{color:#ffffff!important}
    body.cp-themed .statstrip .win-closed{color:#f87171!important}
    body.cp-themed .statstrip .win-closed.soon{color:#fbbf24!important}
    body.cp-themed .statstrip .win-open{color:#4ade80!important}
    body.cp-themed .nav{background:#121a26!important;border:1px solid #25364a!important;border-radius:7px!important;padding-right:8px!important;overflow:hidden}
    body.cp-themed .nav button{color:#b7cbe0!important;border-top:none!important;transition:background .12s,color .12s}
    body.cp-themed .nav button:hover{background:#1a2638!important;color:#ffffff!important}
    body.cp-themed .nav button.active,body.cp-themed .nav button.active:hover{background:#00d4ff!important;color:#051620!important;text-shadow:none!important;font-weight:800!important}
    body.cp-themed .nav button.active::after{background:#ffffff!important;opacity:.35}
    body.cp-themed .menu-btn,body.cp-themed [data-action="menu"]{background:#121a26!important;border:1px solid #263950!important;color:#dbe7f5!important;border-radius:6px!important}
    body.cp-themed .menu-btn:hover,body.cp-themed [data-action="menu"]:hover{background:#1a2638!important;border-color:#00d4ff!important;color:#fff!important}
    body.cp-themed .search-panel{
      background:linear-gradient(155deg,rgba(14,22,34,.92) 22%,rgba(14,22,34,.72) 60%,#101722 100%),url("art/news/arena-utopia-coliseum.png") center/cover no-repeat!important;
      border:1px solid #25364a!important;box-shadow:inset 0 3px 0 #00d4ff!important;border-radius:8px!important}
    body.cp-themed .search-panel .panel-title{color:#38e2ff!important;text-shadow:0 1px 3px #000}
    body.cp-themed .search-panel .search-glass{border-color:#38e2ff!important;box-shadow:0 0 18px rgba(0,212,255,.3)!important}
    body.cp-themed .search-panel .search-glass::after{background:#4ade80!important}
    body.cp-themed .search-panel .search-cta-title{color:#fff!important;text-shadow:0 2px 6px rgba(0,0,0,.9)}
    body.cp-themed .search-panel .search-cta-sub{color:#c5d8eb!important;text-shadow:0 1px 2px #000}
    body.cp-themed .scouts-card{background:#121a26!important;border:1px solid #25364a!important;box-shadow:inset 0 3px 0 #22c55e!important;border-radius:8px!important}
    body.cp-themed .scouts-card .card-h{color:#4ade80!important;text-shadow:0 1px 2px #000}
    body.cp-themed .scouts-card .scout-row{background:#16202e;border:1px solid #253447;border-radius:6px;padding:7px 10px!important;margin:0 0 6px 0!important}
    body.cp-themed .scouts-card .scout-row:last-child{margin-bottom:0!important}
    body.cp-themed .fifa-screen:has(.search-panel) .fifa-tiles>.card:not(.scouts-card){
      background:#121a26!important;border:1px solid #25364a!important;box-shadow:inset 0 3px 0 #f59e0b!important;border-radius:8px!important}
    body.cp-themed .fifa-screen:has(.search-panel) .fifa-tiles>.card:not(.scouts-card) .card-h{color:#ffd166!important;text-shadow:0 1px 2px #000}
    body.cp-themed .offer-row{background:#16202e!important;border:1px solid #253447!important;border-radius:6px!important;padding:8px 10px!important;margin:0 0 6px 0!important}
    body.cp-themed .offer-row:last-child{margin-bottom:0!important}
    body.cp-themed .offer-row.clickrow:hover{background:#1c293c!important}
    body.cp-themed .starter-toggle{background:#1a2538!important;border:1px solid #2b3f57!important;color:#dbe7f5!important}
    body.cp-themed .starter-toggle.on{background:#0d3b4d!important;border-color:#00d4ff!important;color:#38e2ff!important}
    body.cp-themed .search-screen .tb-light{background:#101722!important;border-right:1px solid #243347}
    body.cp-themed .search-screen .tb-light .tb-title{color:#38e2ff!important;text-shadow:0 1px 2px #000}
    body.cp-themed .search-screen .tb-dark{background:#0f1621!important}
    body.cp-themed .sf-btn{background:#16202e!important;border:1px solid #283b52!important;color:#eef4fc!important}
    body.cp-themed .sf-btn:hover{background:#1d2b3e!important;border-color:#38e2ff!important}
    body.cp-themed .sf-btn.primary,body.cp-themed [data-action="search-go"]{background:#0284c7!important;border-color:#38e2ff!important;color:#fff!important}
    body.cp-themed .sr-card{background:#16202e!important;border:1px solid #253447!important;border-radius:7px!important;transition:none!important}
    body.cp-themed .sr-card:hover{background:#1b283b!important}
    body.cp-themed .sr-card.on{background:#142d42!important;border-color:#00d4ff!important}
    body.cp-themed .sr-card.on .sr-card-name,body.cp-themed .sr-card.on .sr-card-sub{color:#fff!important}
    body.cp-themed .scout-job{background:#16202e!important;border:1px solid #253447!important;border-radius:6px!important;padding:9px 11px!important;margin:0 0 6px 0!important}
    body.cp-themed .dl-card{background:#141d2b!important;border:1px solid #25364a!important;border-radius:8px!important;box-shadow:inset 0 3px 0 #22c55e!important}
    body.cp-themed .dl input,body.cp-themed .dl select{background:#0f1621!important;border:1px solid #263950!important;color:#fff!important;border-radius:5px!important}
    body.cp-themed .sf-screen{background:#0e1522!important;overflow:hidden!important;border:1px solid #263950!important;box-shadow:inset 0 3px 0 #00d4ff,0 24px 60px rgba(0,0,0,.6)!important}
    body.cp-themed .sf-title{color:#38e2ff!important;text-shadow:0 2px 6px rgba(0,212,255,.3),0 1px 2px #000}
    body.cp-themed .sf-card{--sf-acc:#00d4ff;background:rgba(16,24,36,.88)!important;border:1px solid #25364a!important;box-shadow:inset 0 3px 0 var(--sf-acc)!important;
      border-radius:9px!important;min-height:168px!important}
    body.cp-themed .sf-card:nth-child(n+4):nth-child(-n+6){--sf-acc:#22c55e}
    body.cp-themed .sf-card:nth-child(n+7){--sf-acc:#a855f7}
    body.cp-themed .sf-label{color:#fff!important;text-shadow:0 1px 2px #000}
    body.cp-themed .sf-mid{align-items:flex-end!important;padding:12px 0 18px!important}
    body.cp-themed .sf-range{width:100%;display:grid!important;grid-template-columns:1fr 1fr;gap:10px;align-items:end!important}
    body.cp-themed .sf-text,body.cp-themed .sf-num,body.cp-themed .sf-select{
      height:40px!important;box-sizing:border-box!important;background:#0d141f!important;border:1px solid #2a3f57!important;color:#fff!important}
    body.cp-themed .sf-text:focus,body.cp-themed .sf-num:focus,body.cp-themed .sf-select:focus{border-color:#00d4ff!important;outline:none}
    body.cp-themed .sf-val{background:#172334!important;border-top:1px solid #243347!important;color:#7ee8fa!important;padding:9px 16px!important}
    body.cp-themed .fifa-main>.panel:has(.squad-pitch),body.cp-themed .fifa-main>.panel:has(.squad-table){
      background:#121a26!important;border:1px solid #25364a!important;box-shadow:inset 0 3px 0 #00d4ff!important;border-radius:8px!important}
    body.cp-themed .fifa-main>.panel:has(.squad-pitch) .panel-title,body.cp-themed .fifa-main>.panel:has(.squad-table) .panel-title{
      color:#38e2ff!important;text-shadow:0 1px 2px #000}
    body.cp-themed .fifa-main>.panel:has(.squad-pitch) .panel-tab.active,body.cp-themed .fifa-main>.panel:has(.squad-table) .panel-tab.active{
      color:#38e2ff!important;border-bottom-color:#00d4ff!important}
    body.cp-themed .pitch{background:#09141d url("${rlPitchUri}") center/100% 100% no-repeat!important;
      border:1px solid #26485e!important;border-radius:10px!important;box-shadow:inset 0 0 36px rgba(0,0,0,.45)!important}
    body.cp-themed .pitch .slot.diag-l{left:21%!important;top:52%!important}
    body.cp-themed .pitch .slot.diag-r{left:79%!important;top:52%!important}
    body.cp-themed .pitch .slot.back{left:50%!important;top:76%!important}
    body.cp-themed .office-window{padding:16px 20px!important;align-items:center!important}
    body.cp-themed .office-window:not(.ow-full) .ow-panel{max-height:calc(100vh - 32px)!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}
    body.cp-themed .office-window:not(.ow-full) .ow-head,body.cp-themed .office-window:not(.ow-full) .ow-tabs{flex:none!important}
    body.cp-themed .office-window.ow-lineup .ow-panel{width:min(980px,90vw)!important}
    body.cp-themed .office-window.ow-lineup .ow-head{padding:12px 20px 10px!important}
    body.cp-themed .office-window.ow-lineup .ow-body,
    body.cp-themed .office-window.ow-preview .ow-body,
    body.cp-themed .office-window.ow-fulltime .ow-body,
    body.cp-themed .office-window.ow-seriessim .ow-body,
    body.cp-themed .office-window.ow-deal .ow-body,
    body.cp-themed .office-window.ow-finances .ow-body,
    body.cp-themed .office-window.ow-news .ow-body{flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;scrollbar-width:thin;scrollbar-color:rgba(56,226,255,.45) transparent}
    body.cp-themed .office-window.ow-search .ow-body,
    body.cp-themed .office-window.ow-scouting .ow-body,
    body.cp-themed .office-window.ow-bets .ow-body,
    body.cp-themed .office-window.ow-media .ow-body,
    body.cp-themed .office-window.ow-world .ow-body,
    body.cp-themed .office-window.ow-calendar .ow-body,
    body.cp-themed .office-window.ow-standings .ow-body,
    body.cp-themed .office-window.ow-facilities .ow-body,
    body.cp-themed .office-window.ow-board .ow-body{flex:1 1 auto!important;min-height:0!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}
    body.cp-themed .office-window.ow-search .ow-screen,
    body.cp-themed .office-window.ow-scouting .ow-screen,
    body.cp-themed .office-window.ow-bets .ow-screen,
    body.cp-themed .office-window.ow-media .ow-screen,
    body.cp-themed .office-window.ow-world .ow-screen,
    body.cp-themed .office-window.ow-calendar .ow-screen,
    body.cp-themed .office-window.ow-standings .ow-screen,
    body.cp-themed .office-window.ow-facilities .ow-screen,
    body.cp-themed .office-window.ow-board .ow-screen{flex:1 1 auto!important;min-height:0!important;max-height:100%!important;overflow-y:auto!important;overflow-x:hidden!important}
    body.cp-themed .office-window.ow-facilities .two-blocks.fac-screen,
    body.cp-themed .office-window.ow-board .two-blocks.fac-screen{max-height:calc(100vh - 52px)!important;height:auto!important;min-height:0!important}
    body.cp-themed .office-window.ow-lineup .mp-board.mp-lineup{padding:14px 22px 18px!important}
    body.cp-themed .office-window.ow-lineup .mp-lineup .squad-pitch{gap:10px!important}
    body.cp-themed .office-window.ow-lineup .mp-lineup .pitch{width:min(760px,72vw,calc(50vh * 1.5))!important;max-width:100%!important}
    body.cp-themed .office-window.ow-lineup .mp-lineup .pcard{zoom:1!important}
    body.cp-themed .office-window.ow-lineup .mp-lineup .bench-list{gap:10px!important}
    body.cp-themed .office-window.ow-lineup .mp-lineup .bench-list .pcard{width:164px!important}
    body.cp-themed .modal{max-height:calc(100vh - 36px)!important;display:flex!important;flex-direction:column!important}
    body.cp-themed .modal .modal-h{flex:none!important}
    body.cp-themed .modal .modal-b{flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important}
    body.cp-themed .pitch-half,body.cp-themed .pitch-d,body.cp-themed .pitch-box,body.cp-themed .pitch-six,
    body.cp-themed .pitch-spot,body.cp-themed .pitch-goal,body.cp-themed .pitch-corner{display:none!important}
    body.cp-themed .pcard{background:rgba(20,29,43,.94)!important;border:1px solid #29405a!important;box-shadow:inset 0 3px 0 #00d4ff,0 6px 16px rgba(0,0,0,.55)!important;border-radius:8px!important}
    body.cp-themed .bench-list .pcard{box-shadow:inset 0 3px 0 #f59e0b,0 4px 12px rgba(0,0,0,.4)!important}
    body.cp-themed .pcard.you,body.cp-themed .pcard.user{box-shadow:inset 0 3px 0 #22c55e,0 6px 18px rgba(34,197,94,.2)!important;border-color:#26563f!important}
    .rating-badge,.pc-rating{background:linear-gradient(135deg,#fcd34d,#d99a08)!important;color:#2a1e00!important;border:1px solid rgba(255,255,255,.2)!important}
    .rating-badge.silver,.pc-rating.silver{background:linear-gradient(135deg,#e2e8f0,#94a3b8)!important;color:#111827!important;border:1px solid rgba(255,255,255,.32)!important}
    .rating-badge.bronze,.pc-rating.bronze{background:linear-gradient(135deg,#e89658,#a85219)!important;color:#240e02!important;border:1px solid rgba(255,190,140,.28)!important}
    .rating-badge.elite,.pc-rating.elite{background:linear-gradient(135deg,#67e8f9 0%,#00d4ff 50%,#c084fc 100%)!important;color:#04131e!important;
      border:1px solid #a5f3fc!important;box-shadow:0 0 12px rgba(34,211,238,.55)!important;font-weight:900!important}
    .rating-badge.unknown{background:#182130!important;color:#7388a1!important;border:1px solid #28364b!important;box-shadow:none!important}
    .rating-badge.you,.pc-rating.you{background:var(--accent)!important;color:var(--accent-ink,#06282b)!important;border-color:transparent!important;box-shadow:none!important}
    .sr-card:has(.rating-badge.elite){border-color:#2dd4bf!important;box-shadow:inset 0 3px 0 #38e2ff,0 0 16px rgba(0,212,255,.16)!important}
    .pcard:has(.pc-rating.elite){border-color:#38e2ff!important;box-shadow:inset 0 3px 0 #c084fc,0 6px 20px rgba(34,211,238,.26)!important}
    .squad-table tr:has(.rating-badge.elite) td:first-child{box-shadow:inset 3px 0 0 #38e2ff}
    body.cp-themed .squad-table th{background:#0f1621!important;color:#7ee8fa!important;border-bottom:1px solid #25364a!important}
    body.cp-themed .squad-table td{background:#141d2b!important;border-bottom:1px solid #1e2b3d!important}
    body.cp-themed .squad-table tr:nth-child(even) td{background:#16202e!important}
    body.cp-themed .squad-table tr:hover td{background:#1c293d!important}
    body.cp-themed .role-tag{background:#1a2538!important;color:#9eb5cc!important;border:1px solid #263649}
    body.cp-themed .role-tag.on{background:#142d22!important;color:#7ee787!important;border-color:#266346!important}
    body.cp-themed .club-tile{
      background:linear-gradient(170deg,rgba(14,22,36,.82),rgba(9,15,24,.94)),url("art/news/arena-forbidden-temple.png") center/cover no-repeat!important;
      border:1px solid #2a3e58!important;box-shadow:inset 0 3px 0 #a855f7,0 10px 28px rgba(0,0,0,.4)!important;border-radius:10px!important;position:relative}
    body.cp-themed .club-tile .club-crest{filter:drop-shadow(0 6px 16px rgba(0,0,0,.75))}
    body.cp-themed .club-tile .club-name{color:#fff!important;text-shadow:0 2px 8px rgba(0,0,0,.85)}
    body.cp-themed .club-tile .club-league{background:rgba(15,23,36,.88);border:1px solid #354c6b;border-radius:999px;padding:4px 12px;color:#c4b5fd!important;display:inline-block}
    body.cp-themed .club-tile .side-arrow{background:#152031!important;border:1px solid #2a3f5c!important;color:#7ee8fa!important;border-radius:6px!important}
    body.cp-themed [data-key="training"]{background:#121a26!important;border:1px solid #25364a!important;box-shadow:inset 0 3px 0 #22c55e!important;border-radius:8px!important}
    body.cp-themed [data-key="training"]>.tile-title{color:#4ade80!important;text-shadow:0 1px 2px #000}
    body.cp-themed .tsq:not([data-cp-tier]){background:#141d2b!important;border:1px solid #253852!important;box-shadow:inset 0 3px 0 #38e2ff!important;border-radius:10px!important}
    body.cp-themed .modal:has(.pp-head){width:min(720px,92vw)!important;background:#0d1421!important;border:1px solid #2b425e!important;border-radius:14px!important;
      box-shadow:0 30px 90px rgba(0,0,0,.85),inset 0 3px 0 #00d4ff!important;overflow:hidden}
    body.cp-themed .modal:has(.pp-head) .modal-h{display:flex;align-items:center;justify-content:space-between;text-align:left;padding:15px 22px!important;
      background:linear-gradient(90deg,#0c2238 0%,#131d2d 62%,#201535 100%)!important;border-bottom:1px solid #263b54!important;color:#7ee8fa!important;letter-spacing:.18em!important}
    body.cp-themed .modal:has(.pp-head) .modal-h::after{content:"RLCS PROFILE";font-size:10px;font-weight:800;letter-spacing:.14em;
      padding:4px 10px;border-radius:999px;background:#16253a;border:1px solid #2d5575;color:#cbd8e8}
    body.cp-themed .modal:has(.pp-head) .modal-b{padding:20px 22px 22px!important;background:#0d1421!important}
    body.cp-themed .modal:has(.pp-head) .pp-head{gap:18px;padding:16px 18px;border-radius:10px;border:1px solid #273d58;
      box-shadow:inset 3px 0 0 #00d4ff;background:linear-gradient(125deg,rgba(12,20,34,.84),rgba(13,20,33,.94)),url("art/news/arena-champions-field.png") center/cover no-repeat!important}
    body.cp-themed .modal:has(.pp-head) .pp-face{width:84px!important;height:84px!important;border-radius:12px!important;border:2px solid #00d4ff!important;
      box-shadow:0 6px 20px rgba(0,212,255,.28)!important;object-fit:cover}
    body.cp-themed .modal:has(.pp-head) .pp-name{font-size:23px!important;color:#ffffff!important;text-shadow:0 2px 6px rgba(0,0,0,.8)}
    body.cp-themed .modal:has(.pp-head) .pp-sub{color:#b7cbe0!important}
    body.cp-themed .modal:has(.pp-head) .pp-sub:last-child{display:inline-block;margin-top:8px;padding:4px 10px;border-radius:6px;
      background:rgba(12,18,30,.85);border:1px solid #273c57;color:#dbeafe!important;font-weight:700}
    body.cp-themed .modal:has(.pp-head) .fame-box{margin-top:0!important;padding:10px 14px!important;min-width:225px;
      background:rgba(11,16,27,.9)!important;border:1px solid #2c3f5c!important;border-left:3px solid #a855f7!important;border-radius:8px!important}
    body.cp-themed .modal:has(.pp-head) .fame-head{color:#c084fc!important;font-weight:800}
    body.cp-themed .modal:has(.pp-head) .statchips{display:grid!important;grid-template-columns:1.15fr 1.25fr repeat(5,1fr)!important;gap:8px!important;margin:16px 0 10px!important}
    body.cp-themed .modal:has(.pp-head) .statchips .chip{background:#141d2c!important;border:1px solid #24364e!important;border-radius:8px!important;
      box-shadow:inset 0 2px 0 #00d4ff!important;padding:10px 8px!important}
    body.cp-themed .modal:has(.pp-head) .statchips .chip.cp-rate-gold{background:linear-gradient(180deg,#291f0d,#141b28)!important;border-color:#785719!important;box-shadow:inset 0 3px 0 #f59e0b!important}
    body.cp-themed .modal:has(.pp-head) .statchips .chip.cp-rate-gold .v{color:#fbbf24!important;font-size:22px!important}
    body.cp-themed .modal:has(.pp-head) .statchips .chip.cp-rate-silver{background:linear-gradient(180deg,#232b36,#141b26)!important;border-color:#5b697d!important;box-shadow:inset 0 3px 0 #cbd5e1!important}
    body.cp-themed .modal:has(.pp-head) .statchips .chip.cp-rate-silver .v{color:#e2e8f0!important;font-size:22px!important}
    body.cp-themed .modal:has(.pp-head) .statchips .chip.cp-rate-bronze{background:linear-gradient(180deg,#29190f,#141923)!important;border-color:#784523!important;box-shadow:inset 0 3px 0 #d97736!important}
    body.cp-themed .modal:has(.pp-head) .statchips .chip.cp-rate-bronze .v{color:#fb923c!important;font-size:22px!important}
    body.cp-themed .modal:has(.pp-head) .statchips .chip.cp-rate-elite{background:linear-gradient(180deg,#0f2d3c,#1a1736)!important;border-color:#22d3ee!important;box-shadow:inset 0 3px 0 #38e2ff,0 0 16px rgba(34,211,238,.2)!important}
    body.cp-themed .modal:has(.pp-head) .statchips .chip.cp-rate-elite .v{color:#67e8f9!important;font-size:22px!important;text-shadow:0 0 10px rgba(34,211,238,.45)}
    body.cp-themed .modal:has(.pp-head) .statchips .chip:nth-child(2){background:linear-gradient(180deg,#201533,#141a28)!important;border-color:#59348c!important;box-shadow:inset 0 3px 0 #a855f7!important}
    body.cp-themed .modal:has(.pp-head) .statchips .chip:nth-child(2) .v{color:#d8b4fe!important}
    body.cp-themed .modal:has(.pp-head) .pp-career{background:#121b29!important;border:1px solid #223248!important;border-radius:8px!important;
      padding:9px 13px!important;margin-top:8px!important;color:#9cb3cc!important}
    body.cp-themed .modal:has(.pp-head) .btn{background:#182436!important;border:1px solid #2c4360!important;color:#e2edf8!important;border-radius:7px!important}
    body.cp-themed .modal:has(.pp-head) .btn:hover{background:#21324a!important}
    body.cp-themed .modal:has(.pp-head) .btn.primary{background:#0284c7!important;border-color:#38e2ff!important;color:#fff!important}
    .cp-seg{display:inline-flex;gap:6px;padding:4px;border-radius:6px;background:#0e141f;border:1px solid #253448}
    .cp-pro-bar{margin-top:10px;padding:8px 12px 10px;border-top:1px solid #243347;display:flex;align-items:center;justify-content:space-between;gap:8px;position:relative;z-index:2}
    .cp-pro-lbl{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#7ee8fa}
    body.cp-themed .adv-card{background:linear-gradient(165deg,#0f1c2e 0%,#0c1420 100%)!important;border:1px solid #26425e!important;
      box-shadow:inset 0 3px 0 #00d4ff!important;border-radius:10px!important}
    body.cp-themed .adv-card .card-h{color:#38e2ff!important;text-shadow:0 1px 2px #000}
    body.cp-themed .adv-card .adv-week{gap:8px!important}
    body.cp-themed .adv-card .adv-day{background:#142133!important;border:1px solid #22354e!important;border-radius:8px!important;padding:8px 7px!important;transition:border-color .12s,background .12s}
    body.cp-themed .adv-card .adv-day.today{background:linear-gradient(180deg,#102a42,#121c2c)!important;border-color:#00d4ff!important;box-shadow:inset 0 2px 0 #38e2ff}
    body.cp-themed .adv-card .adv-day.match{background:#1e1912!important;border-color:#f59e0b!important}
    body.cp-themed .adv-card .adv-day.event{background:#122119!important;border-color:#22c55e!important}
    body.cp-themed .adv-card .adv-dow{border-bottom:1px solid rgba(255,255,255,.1)!important;padding-bottom:5px!important}
    .cp-adv-brief{margin-top:12px;padding:10px 12px;border-radius:8px;background:rgba(10,16,26,.85);border:1px solid #22364f;border-left:3px solid #00d4ff;display:flex;flex-direction:column;gap:7px}
    .cp-adv-top{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;color:#e6f1fc}
    .cp-adv-top b{color:#7ee8fa}
    .cp-adv-cta{font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#38e2ff;background:#13283d;border:1px solid #285175;padding:2px 8px;border-radius:999px;white-space:nowrap}
    .cp-adv-pills{display:flex;flex-wrap:wrap;gap:6px;font-size:10.5px;font-weight:700}
    .cp-adv-pill{padding:3px 8px;border-radius:6px;background:#152031;border:1px solid #253852;color:#b8cce0}
    .cp-adv-pill.good{background:#12281e;border-color:#266346;color:#7ee787}
    .cp-adv-pill.warn{background:#281e10;border-color:#70501b;color:#fcd34d}
    .cp-adv-pill.bad{background:#2a1418;border-color:#74242a;color:#fca5a5}
    .cp-adv-pill.cyan{background:#102536;border-color:#255a7c;color:#7ee8fa}
    body.cp-themed .home-left>.card:first-child:not(.adv-card){background:linear-gradient(160deg,#1b1812 0%,#101722 100%)!important;
      border:1px solid #4d3c1b!important;box-shadow:inset 0 3px 0 #f59e0b!important;border-radius:10px!important}
    body.cp-themed .match-choice{gap:12px!important;margin-top:0!important}
    body.cp-themed .mc{border-radius:10px!important;padding:18px 20px!important;min-height:224px!important;overflow:hidden;
      transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease!important}
    body.cp-themed .mc-play{padding:18px 150px 18px 20px!important;background:linear-gradient(155deg,#0f2338 0%,#0b1320 82%)!important;
      border:1px solid #26486b!important;box-shadow:inset 0 3px 0 #00d4ff,0 10px 26px rgba(0,0,0,.42)!important}
    body.cp-themed .mc-play:hover:not(:disabled){transform:translateY(-2px)!important;border-color:#38e2ff!important;
      box-shadow:inset 0 3px 0 #38e2ff,0 14px 32px rgba(0,212,255,.18)!important}
    body.cp-themed .mc-play .mc-title{color:#38e2ff!important;text-shadow:0 2px 10px rgba(0,212,255,.3)}
    body.cp-themed .mc-sim{padding:18px 92px 18px 20px!important;background:linear-gradient(155deg,#211a10 0%,#0d1420 82%)!important;
      border:1px solid #594119!important;box-shadow:inset 0 3px 0 #f59e0b,0 10px 26px rgba(0,0,0,.42)!important}
    body.cp-themed .mc-sim:hover:not(:disabled){transform:translateY(-2px)!important;border-color:#fbbf24!important;
      box-shadow:inset 0 3px 0 #fbbf24,0 14px 32px rgba(245,158,11,.18)!important}
    body.cp-themed .mc-sim .mc-title,body.cp-themed .mc-sim .mc-arrow{color:#ffd166!important;text-shadow:0 2px 10px rgba(245,158,11,.3)}
    body.cp-themed .mc .mc-when{color:#ffffff!important;text-shadow:0 1px 2px #000}
    body.cp-themed .mc .mc-sub{color:#9eb8d2!important;margin-top:2px}
    body.cp-themed .mc .mc-benched{margin-top:10px!important;padding:5px 9px!important;border-radius:6px;display:inline-block;
      max-width:100%;line-height:1.35;background:rgba(239,68,68,.14);border:1px solid rgba(248,113,113,.38);color:#fca5a5!important}
    body.cp-themed .mc .mc-comp{display:inline-block;align-self:flex-start;margin-top:auto!important;padding:4px 10px!important;border-radius:6px;
      font-size:12px!important;letter-spacing:.06em;background:rgba(0,212,255,.11);border:1px solid rgba(56,226,255,.28);color:#7ee8fa!important}
    body.cp-themed .mc-sim .mc-comp{background:rgba(245,158,11,.12);border-color:rgba(245,158,11,.34);color:#fcd34d!important}
    body.cp-themed .mc .mc-crest{right:18px!important;top:18px!important;bottom:18px!important;width:116px!important}
    body.cp-themed .mc .mc-crest .crest,body.cp-themed .mc .mc-crest .crest.big,body.cp-themed .mc .mc-crest .crest.logo{
      background:transparent!important;border:none!important;box-shadow:none!important;filter:drop-shadow(0 8px 20px rgba(0,0,0,.78))}
    body.cp-themed .mc .mc-crest .crest.logo img{border-radius:8px;object-fit:contain!important}
    body.cp-themed .notif-card{background:#121a26!important;border:1px solid #2a394e!important;box-shadow:inset 0 3px 0 #f59e0b!important;border-radius:10px!important}
    body.cp-themed .notif-card .card-h{color:#ffd166!important;text-shadow:0 1px 2px #000}
    body.cp-themed .notif-card .ptab.active{color:#ffd166!important;border-bottom-color:#f59e0b!important}
    body.cp-themed .notif-card .msg.compact{background:#16202e!important;border:1px solid #253447!important;border-left:3px solid #38e2ff!important;
      border-radius:7px!important;padding:9px 12px!important;margin:0 0 7px 0!important;transition:background .12s}
    body.cp-themed .notif-card .msg.compact:last-child{margin-bottom:0!important}
    body.cp-themed .notif-card .msg.compact:hover{background:#1c293d!important}
    body.cp-themed .notif-card .msg.compact.unread{border-left-color:#f59e0b!important;background:#1d2330!important}
    body.cp-themed .notif-card .nchat{background:#16202e!important;border:1px solid #253447!important;border-left:3px solid #a855f7!important;border-radius:7px!important}
    body.cp-themed .news-panel{background:linear-gradient(180deg,#161326 0%,#101622 100%)!important;border:1px solid #3b2c5c!important;
      box-shadow:inset 0 3px 0 #ec4899!important;border-radius:10px!important}
    body.cp-themed .news-panel .hero{border-radius:8px!important;overflow:hidden;border:1px solid #2e2449!important}
    body.cp-themed .news-panel .hero-line{background:linear-gradient(90deg,#1b132b 0%,#141c2c 100%)!important;color:#f8fafc!important;
      border-top:2px solid #ec4899!important;padding:11px 14px!important;font-size:13px!important;line-height:1.4!important}
    body.cp-themed .news-panel .hero-dots .pg-dots button.on{background:#ec4899!important}
    body.cp-themed .news-panel .news-cat{background:rgba(236,72,153,.22)!important;color:#f9a8d4!important;border:1px solid rgba(236,72,153,.45)}
    body.cp-themed .stand-card{background:linear-gradient(170deg,#0e1a2b 0%,#101723 100%)!important;border:1px solid #264266!important;
      box-shadow:inset 0 3px 0 #3b82f6!important;border-radius:10px!important}
    body.cp-themed .stand-card .card-h{color:#60a5fa!important;text-shadow:0 1px 2px #000}
    body.cp-themed .stand-card .ptab.active{color:#93c5fd!important;border-bottom-color:#3b82f6!important}
    body.cp-themed .stand-card tr.me td{background:rgba(34,197,94,.12)!important}
    body.cp-themed .stand-card .pos.zone{color:#4ade80!important}
    body.cp-themed .home-right [data-key="training"]{background:linear-gradient(145deg,#10231b 0%,#111926 75%)!important;
      border:1px solid #234936!important;box-shadow:inset 0 3px 0 #22c55e!important;border-radius:10px!important}
    body.cp-themed .tsq, .tsq{position:relative;overflow:hidden;border-radius:10px!important;
      transition:background-color .75s ease,border-color .75s ease,box-shadow .75s ease,transform .25s ease!important}
    .tsq>*:not(.tsq-clear){position:relative;z-index:2}
    .tsq .tsq-clear{position:absolute!important;z-index:4!important}
    .tsq:nth-child(2){--cp-del:-.75s}
    .tsq:nth-child(3){--cp-del:-1.5s}
    .tsq:nth-child(4){--cp-del:-2.25s}
    .tsq:nth-child(5){--cp-del:-3s}
    @keyframes cpDiagSilver{0%,30%{transform:translate3d(-120%,-120%,0);opacity:0}46%{opacity:.22}64%{transform:translate3d(120%,120%,0);opacity:0}100%{transform:translate3d(120%,120%,0);opacity:0}}
    @keyframes cpDiagGold{0%,16%{transform:translate3d(-125%,-125%,0);opacity:0}30%{opacity:.95}58%{transform:translate3d(125%,125%,0);opacity:.85}68%,100%{transform:translate3d(125%,125%,0);opacity:0}}
    @keyframes cpGoldAmbient{0%{transform:translate3d(-18%,-18%,0);opacity:.28}50%{opacity:.46}100%{transform:translate3d(18%,18%,0);opacity:.28}}
    @keyframes cpEliteWave{0%{transform:translate3d(-28%,-28%,0);opacity:.52}50%{opacity:.82}100%{transform:translate3d(28%,28%,0);opacity:.52}}
    @keyframes cpDiagElite{0%,10%{transform:translate3d(-135%,-135%,0);opacity:0}24%{opacity:1}56%{transform:translate3d(135%,135%,0);opacity:.95}66%,100%{transform:translate3d(135%,135%,0);opacity:0}}
    @keyframes cpEliteAura{0%,100%{box-shadow:inset 0 3px 0 #38e2ff,0 8px 26px rgba(34,211,238,.28),0 0 18px rgba(168,85,247,.22)}50%{box-shadow:inset 0 3px 0 #c084fc,0 10px 32px rgba(56,226,255,.42),0 0 28px rgba(168,85,247,.38)}}
    body.cp-themed .tsq[data-cp-tier="bronze"],.tsq[data-cp-tier="bronze"]{
      background-color:#26150b!important;background-image:linear-gradient(155deg,rgba(217,119,54,.16),rgba(10,13,20,.78) 74%)!important;
      border:1px solid #8a4f25!important;box-shadow:inset 0 3px 0 #d97736,0 8px 20px rgba(0,0,0,.4)!important}
    .tsq[data-cp-tier="bronze"] .tr-bar i{background:linear-gradient(90deg,#b85d22,#fb9236)!important}
    .tsq[data-cp-tier="bronze"] .tr-lo{color:#fb9236!important;font-weight:800}
    .tsq[data-cp-tier="bronze"] .tsq-num{border-color:#d97736!important;color:#fb9236!important}
    body.cp-themed .tsq[data-cp-tier="silver"],.tsq[data-cp-tier="silver"]{
      background-color:#1f2937!important;background-image:linear-gradient(155deg,rgba(203,213,225,.14),rgba(10,13,20,.78) 74%)!important;
      border:1px solid #6b7b90!important;box-shadow:inset 0 3px 0 #cbd5e1,0 8px 20px rgba(0,0,0,.4)!important}
    .tsq[data-cp-tier="silver"]::after{content:"";position:absolute;inset:-45%;z-index:1;pointer-events:none;opacity:0;transform:translate3d(-120%,-120%,0);will-change:transform,opacity;
      background:linear-gradient(135deg,transparent 44%,rgba(226,232,240,.22) 50%,transparent 56%);
      animation:cpDiagSilver 8.5s linear infinite backwards;animation-delay:var(--cp-del,0s)}
    .tsq[data-cp-tier="silver"] .tr-bar i{background:linear-gradient(90deg,#94a3b8,#f1f5f9)!important}
    .tsq[data-cp-tier="silver"] .tr-lo{color:#e2e8f0!important;font-weight:800}
    .tsq[data-cp-tier="silver"] .tsq-num{border-color:#cbd5e1!important;color:#e2e8f0!important}
    body.cp-themed .tsq[data-cp-tier="gold"],.tsq[data-cp-tier="gold"]{
      background-color:#302208!important;background-image:linear-gradient(145deg,rgba(251,191,36,.24),rgba(10,13,20,.76) 74%)!important;
      border:1px solid #c2881a!important;box-shadow:inset 0 3px 0 #fbbf24,0 8px 24px rgba(245,158,11,.2)!important}
    .tsq[data-cp-tier="gold"]::before{content:"";position:absolute;inset:-35%;z-index:1;pointer-events:none;will-change:transform,opacity;
      background:linear-gradient(135deg,transparent 25%,rgba(251,191,36,.24) 48%,rgba(217,119,6,.16) 62%,transparent 80%);
      animation:cpGoldAmbient 6.5s ease-in-out infinite alternate}
    .tsq[data-cp-tier="gold"]::after{content:"";position:absolute;inset:-45%;z-index:1;pointer-events:none;opacity:0;transform:translate3d(-125%,-125%,0);mix-blend-mode:screen;will-change:transform,opacity;
      background:linear-gradient(135deg,transparent 40%,rgba(251,191,36,.22) 47%,rgba(254,249,195,.46) 50%,rgba(251,191,36,.22) 53%,transparent 60%);
      animation:cpDiagGold 5.2s cubic-bezier(.4,0,.2,1) infinite backwards;animation-delay:var(--cp-del,0s)}
    .tsq[data-cp-tier="gold"] .tr-bar i{background:linear-gradient(90deg,#d99a08,#fde047)!important}
    .tsq[data-cp-tier="gold"] .tr-lo{color:#fcd34d!important;font-weight:800}
    .tsq[data-cp-tier="gold"] .tsq-num{border-color:#fbbf24!important;color:#fcd34d!important}
    body.cp-themed .tsq[data-cp-tier="elite"],.tsq[data-cp-tier="elite"]{
      background-color:#0b2030!important;background-image:linear-gradient(135deg,rgba(0,212,255,.26) 0%,rgba(124,58,237,.24) 52%,rgba(10,13,22,.84) 100%)!important;
      border:1px solid #38e2ff!important;animation:cpEliteAura 4.2s ease-in-out infinite}
    .tsq[data-cp-tier="elite"]::before{content:"";position:absolute;inset:-45%;z-index:1;pointer-events:none;mix-blend-mode:screen;will-change:transform,opacity;
      background:linear-gradient(135deg,transparent 15%,rgba(0,212,255,.32) 34%,rgba(168,85,247,.38) 52%,rgba(56,226,255,.28) 68%,transparent 85%);
      animation:cpEliteWave 4.8s ease-in-out infinite alternate}
    .tsq[data-cp-tier="elite"]::after{content:"";position:absolute;inset:-50%;z-index:1;pointer-events:none;opacity:0;transform:translate3d(-135%,-135%,0);mix-blend-mode:screen;will-change:transform,opacity;
      background:linear-gradient(135deg,transparent 34%,rgba(168,85,247,.34) 42%,rgba(103,232,249,.62) 48%,rgba(255,255,255,.48) 50%,rgba(192,132,252,.44) 54%,rgba(0,212,255,.26) 59%,transparent 67%);
      animation:cpDiagElite 3.8s cubic-bezier(.35,0,.2,1) infinite backwards;animation-delay:var(--cp-del,0s)}
    .tsq[data-cp-tier="elite"] .tr-bar i{background:linear-gradient(90deg,#00d4ff,#c084fc)!important}
    .tsq[data-cp-tier="elite"] .tr-lo{color:#67e8f9!important;font-weight:900}
    .tsq[data-cp-tier="elite"] .tsq-num{border-color:#38e2ff!important;color:#67e8f9!important;box-shadow:0 0 12px rgba(56,226,255,.45)}
    .tsq.cp-tier-up::after{inset:-25%!important;z-index:4!important;mix-blend-mode:normal!important;animation-delay:0s!important;transform:translateX(-130%)}
    .tsq[data-cp-tier="silver"].cp-tier-up{animation:cpRiseSilver 1.35s cubic-bezier(.22,1,.36,1) forwards!important}
    .tsq[data-cp-tier="silver"].cp-tier-up::after{background:linear-gradient(115deg,transparent 25%,rgba(248,250,252,.55) 50%,transparent 75%);animation:cpSweepFast 1s ease forwards}
    .tsq[data-cp-tier="gold"].cp-tier-up{animation:cpRiseGold 1.55s cubic-bezier(.22,1,.36,1) forwards!important}
    .tsq[data-cp-tier="gold"].cp-tier-up::after{background:linear-gradient(115deg,transparent 20%,rgba(253,224,71,.65) 50%,transparent 80%);animation:cpSweepGold 1.2s ease forwards}
    .tsq[data-cp-tier="elite"].cp-tier-up{animation:cpRiseElite 1.75s cubic-bezier(.22,1,.36,1) forwards!important}
    .tsq[data-cp-tier="elite"].cp-tier-up::after{background:linear-gradient(115deg,transparent 15%,rgba(56,226,255,.7) 42%,rgba(192,132,252,.72) 58%,transparent 85%);animation:cpSweepElite 1.35s ease forwards}
    @keyframes cpSweepFast{0%{transform:translateX(-130%)}100%{transform:translateX(130%)}}
    @keyframes cpSweepGold{0%{transform:translate(-130%,20%)}100%{transform:translate(130%,-20%)}}
    @keyframes cpSweepElite{0%{transform:translateX(-130%) scaleY(1.2);opacity:1}50%{opacity:1}100%{transform:translateX(130%) scaleY(1.2);opacity:0}}
    @keyframes cpRiseSilver{0%{background-color:#2e190c;transform:scale(1)}38%{background-color:#64748b;box-shadow:0 0 34px rgba(226,232,240,.65);transform:scale(1.03)}100%{background-color:#243040;transform:scale(1)}}
    @keyframes cpRiseGold{0%{background-color:#243040;transform:scale(1)}30%{background-color:#b47409;box-shadow:0 0 42px rgba(251,191,36,.78);transform:scale(1.045)}65%{background-color:#6b4b0e;transform:scale(1.015)}100%{background-color:#3a2909;transform:scale(1)}}
    @keyframes cpRiseElite{0%{background-color:#3a2909;transform:scale(1)}28%{background-color:#0e7490;box-shadow:0 0 50px rgba(34,211,238,.88);transform:scale(1.055)}58%{background-color:#4c1d95;box-shadow:0 0 42px rgba(168,85,247,.82);transform:scale(1.02)}100%{background-color:#0f2d40;transform:scale(1)}}
    body.cp-themed .stand-screen{background:#0b111c!important}
    body.cp-themed .stand-screen .tb-light{background:linear-gradient(170deg,#0f1726 0%,#0b111c 100%)!important;padding:24px 26px 20px!important}
    body.cp-themed .stand-screen .tb-title{color:#38e2ff!important;text-shadow:0 2px 10px rgba(0,212,255,.25)}
    body.cp-themed .stand-screen .tb-pick>*{background:#141e2e!important;border:1px solid #283d58!important;border-radius:7px!important;color:#cbd8e8!important;transition:all .12s}
    body.cp-themed .stand-screen .tb-pick>*:hover{background:#1c2b42!important;border-color:#38e2ff!important;color:#fff!important}
    body.cp-themed .stand-screen .tb-pick>*.on{background:#122a40!important;border-color:#00d4ff!important;color:#7ee8fa!important;box-shadow:inset 0 2px 0 #00d4ff}
    body.cp-themed .stand-screen .sb-left{padding:0 16px 24px 0!important;margin-top:14px!important}
    body.cp-themed .tbl-band{background:linear-gradient(90deg,transparent,#15253a 22%,#15253a 78%,transparent);border-top:1px solid #243b59;border-bottom:1px solid #243b59;
      color:#7ee8fa!important;padding:7px 14px!important;margin-bottom:10px!important;border-radius:6px;letter-spacing:.14em}
    body.cp-themed .sb-left .tbl,body.cp-themed .tbl.roomy{border-collapse:separate!important;border-spacing:0 4px!important}
    body.cp-themed .sb-left thead th{position:sticky!important;top:0!important;z-index:12!important;background:#0e1624!important;
      color:#7ee8fa!important;border-bottom:2px solid #2a476e!important;padding:11px 12px!important;box-shadow:0 4px 12px rgba(0,0,0,.45)}
    body.cp-themed .sb-left tbody td,body.cp-themed .tbl.roomy tbody td{background:#141e2e!important;border-top:1px solid #1e2d44;border-bottom:1px solid #1e2d44}
    body.cp-themed .sb-left tbody tr:hover td,body.cp-themed .tbl.roomy tbody tr:hover td{background:#1a283d!important}
    body.cp-themed .sb-left tbody tr:first-child td{background:linear-gradient(90deg,rgba(251,191,36,.15),#141e2e 45%)!important}
    body.cp-themed .sb-left tbody tr:first-child td.pos,body.cp-themed .sb-left tbody tr:first-child td.pts{color:#fbbf24!important;font-weight:900}
    body.cp-themed .sb-left tbody tr:nth-child(2) td{background:linear-gradient(90deg,rgba(203,213,225,.12),#141e2e 45%)!important}
    body.cp-themed .sb-left tbody tr:nth-child(2) td.pos{color:#e2e8f0!important;font-weight:900}
    body.cp-themed .sb-left tbody tr:nth-child(3) td{background:linear-gradient(90deg,rgba(217,119,54,.12),#141e2e 45%)!important}
    body.cp-themed .sb-left tbody tr:nth-child(3) td.pos{color:#fb9236!important;font-weight:900}
    body.cp-themed .sb-left tbody tr.me td{background:linear-gradient(90deg,rgba(0,212,255,.16),#132236 55%)!important;
      border-top-color:#265073!important;border-bottom-color:#265073!important}
    body.cp-themed .sb-left tbody tr.me td:first-child{box-shadow:inset 3px 0 0 #00d4ff!important}
    body.cp-themed .modal .tbl tbody tr:has(.rating-badge.elite) td{background:linear-gradient(90deg,rgba(0,212,255,.15),#141d2b 55%)!important}
    body.cp-themed .modal .tbl tbody tr:has(.rating-badge:not(.silver):not(.bronze):not(.elite):not(.unknown):not(.you)) td{background:linear-gradient(90deg,rgba(245,158,11,.13),#141d2b 55%)!important}
    body.cp-themed .modal .tbl tbody tr:has(.rating-badge.silver) td{background:linear-gradient(90deg,rgba(203,213,225,.1),#141d2b 55%)!important}
    body.cp-themed .modal .tbl tbody tr:has(.rating-badge.bronze) td{background:linear-gradient(90deg,rgba(217,119,54,.1),#141d2b 55%)!important}
    body.cp-themed .modal .tbl tbody tr:has(.rating-badge.unknown) td{background:#141d2b!important}
    body.cp-themed .ow-seriessim .ow-panel,body.cp-themed .ow-fulltime .ow-panel,body.cp-themed .ow-preview .ow-panel{
      width:min(940px,88vw)!important;margin:0 auto!important;overflow:hidden!important;border-radius:14px!important;
      border:1px solid #28405e!important;box-shadow:0 28px 80px rgba(0,0,0,.78),inset 0 3px 0 #00d4ff!important;
      background:linear-gradient(170deg,rgba(14,22,36,.9),rgba(9,15,24,.96)),url("art/news/arena-champions-field.png") center/cover no-repeat!important}
    body.cp-themed .ow-seriessim .ow-body,body.cp-themed .ow-fulltime .ow-body,body.cp-themed .ow-preview .ow-body{
      padding:20px 26px 24px!important;background:transparent!important}
    body.cp-themed .ow-seriessim .ow-screen,body.cp-themed .ow-fulltime .ow-screen,body.cp-themed .ow-preview .ow-screen{padding:0!important}
    body.cp-themed .ow-seriessim .mp.ss,body.cp-themed .ow-fulltime .mp,body.cp-themed .ow-preview .mp{width:100%!important;max-width:none!important;margin:0 auto!important}
    body.cp-themed .ow-seriessim .mp-title,body.cp-themed .ow-fulltime .mp-title,body.cp-themed .ow-preview .mp-title{
      margin:0 auto 14px!important;background:linear-gradient(135deg,#0284c7,#00d4ff)!important;color:#041621!important;border-radius:999px!important;
      padding:7px 28px!important;letter-spacing:.16em!important;box-shadow:0 6px 20px rgba(0,212,255,.3)!important}
    body.cp-themed .ow-fulltime .ft-tabs{width:100%!important;margin:0 0 12px 0!important;display:flex!important;justify-content:center!important;flex-wrap:wrap;gap:6px;background:none!important;border:none!important}
    body.cp-themed .ow-fulltime .ft-tabs .tabs{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;background:none!important;width:100%}
    body.cp-themed .ow-fulltime .ft-tabs button{background:#141e2e!important;border:1px solid #273d59!important;color:#9eb3c8!important;
      border-radius:7px!important;padding:7px 14px!important;font-weight:700!important;flex:0 1 auto!important;min-width:86px;transition:all .12s}
    body.cp-themed .ow-fulltime .ft-tabs button:hover{background:#1c2b42!important;border-color:#38e2ff!important;color:#fff!important}
    body.cp-themed .ow-fulltime .ft-tabs button.active,body.cp-themed .ow-fulltime .ft-tabs button.on{
      background:linear-gradient(135deg,#0284c7,#00d4ff)!important;border-color:#67e8f9!important;color:#041621!important;font-weight:800!important}
    body.cp-themed .ow-seriessim .ft-board,body.cp-themed .ow-fulltime .ft-board,body.cp-themed .ow-preview .mp-board{
      background:rgba(10,16,26,.68)!important;border:1px solid #233854!important;border-bottom:none!important;
      border-radius:10px 10px 0 0!important;box-shadow:none!important}
    body.cp-themed .ow-seriessim .mp-bar,body.cp-themed .ow-fulltime .mp-bar,body.cp-themed .ow-preview .mp-bar{
      width:100%!important;margin-left:0!important;background:rgba(12,18,30,.92)!important;border:1px solid #233854!important;
      border-top:1px solid #2b4668!important;border-radius:0 0 10px 10px!important;overflow:hidden}
    body.cp-themed .ow-seriessim .mp-tile,body.cp-themed .ow-fulltime .mp-tile,body.cp-themed .ow-preview .mp-tile{
      padding:20px 14px!important;color:#dbe7f5!important;transition:background .12s,color .12s}
    body.cp-themed .ow-seriessim .mp-tile:hover,body.cp-themed .ow-fulltime .mp-tile:hover,body.cp-themed .ow-preview .mp-tile:hover{
      background:#18263a!important;color:#fff!important}
    body.cp-themed .ow-seriessim .mp-tile[data-action="cp-sim-series"]{color:#7ee8fa!important;box-shadow:inset 0 2px 0 #00d4ff}
    body.cp-themed .ow-seriessim .mp-tile[data-action="cp-sim-series"]:hover{background:#102a42!important;color:#fff!important}
    body.cp-themed .ow-fulltime .ft-verdict.win{color:#4ade80!important}
    body.cp-themed .ow-fulltime .ft-verdict.loss{color:#fb7185!important}
    body.cp-themed .ow-fulltime .ft-l .ft-bar i{background:linear-gradient(90deg,#0284c7,#38e2ff)!important}
    body.cp-themed .ow-fulltime .ft-r .ft-bar i{background:linear-gradient(90deg,#f59e0b,#fb7185)!important}
    body.cp-themed .ow-seriessim .ss-clock{background:#0b121e!important;border:1px solid #2b4464!important;border-radius:8px!important;color:#fff!important}
    body.cp-themed .ow-seriessim .ss-n.us{color:#38e2ff!important}
    body.cp-themed .ow-seriessim .ss-n.them{color:#fb7185!important}
    body.cp-themed .ow-seriessim .ss-graphbox{background:rgba(9,14,23,.82)!important;border:1px solid #23364f!important;border-radius:9px!important;padding:12px 14px!important;margin-top:12px!important}
    body.cp-themed .ow-seriessim .ss-pills{gap:8px!important;margin-top:12px!important}
    body.cp-themed .ow-seriessim .ss-pill{background:#141e2e!important;border:1px solid #273c56!important;border-radius:7px!important;padding:5px 11px!important;color:#b8cbe0!important}
    body.cp-themed .ow-seriessim .ss-pill.win{background:#132a20!important;border-color:#22c55e!important;color:#7ee787!important}
    body.cp-themed .ow-seriessim .ss-pill.loss{background:#29151a!important;border-color:#ef4444!important;color:#fca5a5!important}
    body.cp-themed .ow-seriessim .ss-pill.live{background:#102a40!important;border-color:#00d4ff!important;color:#7ee8fa!important}
    body.cp-themed .stand-screen .tb-dark{background:#0e1522!important;border-left:1px solid #253852!important;padding:20px 22px!important}
    body.cp-themed .stand-screen .tb-close{top:12px!important;right:12px!important;width:34px!important;height:34px!important;border-radius:8px!important;
      background:#162235!important;border:1px solid #2d4766!important;color:#e2edf8!important;z-index:12!important}
    body.cp-themed .stand-screen .tb-head{border-radius:9px!important;border:1px solid #284160!important;box-shadow:inset 0 3px 0 #00d4ff!important;
      padding:14px 48px 14px 16px!important;margin-bottom:12px!important;color:#fff!important;text-shadow:0 2px 6px rgba(0,0,0,.9)}
    body.cp-themed .stand-screen .tb-sechead{color:#7ee8fa!important;margin-top:6px!important}
    body.cp-themed .stand-screen .fx-row,body.cp-themed .stand-screen .sfix{background:#141e2e!important;border:1px solid #23364e!important;border-radius:7px!important;margin-bottom:6px!important}
    .tsq-optrate.cp-opt-bronze{background:#b85d22!important;color:#fff!important}
    .tsq-optrate.cp-opt-silver{background:#cbd5e1!important;color:#111827!important}
    .tsq-optrate.cp-opt-gold{background:#f2b91c!important;color:#2a1e00!important}
    .tsq-optrate.cp-opt-elite{background:linear-gradient(135deg,#67e8f9,#00d4ff 52%,#c084fc)!important;color:#04131e!important;font-weight:900!important}
    body.cp-themed .big-cal .cal-nav,body.cp-themed .cal-screen .cb-nav{background:#162234!important;border:1px solid #2b4260!important;border-radius:7px!important;color:#7ee8fa!important}
    body.cp-themed .big-cal .cal-nav:hover,body.cp-themed .cal-screen .cb-nav:hover{background:#1f334d!important;border-color:#38e2ff!important;color:#fff!important}
    body.cp-themed .big-cal .cal-cell{border-radius:7px!important}
    body.cp-themed .cal-screen{background:#0b111b!important;align-items:stretch!important}
    body.cp-themed .cal-screen .tb-light{background:linear-gradient(170deg,#0f1724 0%,#0b111b 100%)!important;padding:24px 26px!important}
    body.cp-themed .cal-screen .tb-title{color:#38e2ff!important;text-shadow:0 2px 10px rgba(0,212,255,.25)}
    body.cp-themed .cal-screen .cb-month{color:#ffffff!important}
    body.cp-themed .cal-screen .cb-dow{color:#7ee8fa!important}
    body.cp-themed .cal-screen .tb-pick>*{border-radius:7px!important;border:1px solid #283d58!important;background:#141e2e!important;transition:border-color .12s,background .12s}
    body.cp-themed .cal-screen .tb-pick>*:hover{background:#1b2a40!important;border-color:#38e2ff!important}
    body.cp-themed .cal-screen .cb-grid{gap:6px!important}
    body.cp-themed .cal-screen .cb-cell{background:#131c2b!important;border:1px solid #213046!important;border-radius:8px!important;color:#9eb3c8!important;transition:background .12s,border-color .12s}
    body.cp-themed .cal-screen .cb-cell.out{background:transparent!important;border-color:transparent!important}
    body.cp-themed .cal-screen .cb-cell:not(.out):hover{background:#1b2940!important;border-color:#36567d!important;color:#fff!important}
    body.cp-themed .cal-screen .cb-cell.today{border:1.5px solid #00d4ff!important;background:#0f2438!important;color:#fff!important;box-shadow:inset 0 0 12px rgba(0,212,255,.15)!important}
    body.cp-themed .cal-screen .cb-cell.ev{background:color-mix(in srgb,var(--ec) 24%,#121a28)!important;border-color:color-mix(in srgb,var(--ec) 58%,#24364e)!important;color:#f8fafc!important}
    body.cp-themed .cal-screen .cb-cell.ev.on{background:color-mix(in srgb,var(--ec) 68%,#121a28)!important;border-color:var(--ec)!important;box-shadow:0 0 14px color-mix(in srgb,var(--ec) 35%,transparent)!important}
    body.cp-themed .cal-screen .tb-dark{background:#0e1522!important;border-left:1px solid #253852!important;padding:0!important;position:relative!important;min-height:0!important;overflow:hidden!important}
    body.cp-themed .cal-screen .tb-scroll{position:absolute!important;inset:0!important;padding:20px 22px!important;overflow-y:auto!important;overscroll-behavior:contain!important;scrollbar-width:thin!important;scrollbar-color:rgba(56,226,255,.55) rgba(10,16,26,.4)!important;pointer-events:auto!important}
    body.cp-themed .cal-screen .tb-scroll::-webkit-scrollbar{width:7px!important}
    body.cp-themed .cal-screen .tb-scroll::-webkit-scrollbar-track{background:rgba(10,16,26,.45)!important;border-radius:4px}
    body.cp-themed .cal-screen .tb-scroll::-webkit-scrollbar-thumb{background:rgba(56,226,255,.52)!important;border-radius:4px!important}
    body.cp-themed .cal-screen .tb-scroll::-webkit-scrollbar-thumb:hover{background:#38e2ff!important}
    .cal-screen .tb-dark .wc-groups{grid-template-columns:minmax(0,1fr)!important;gap:12px!important}
    .cal-screen .tb-dark .wc-group{min-width:0!important;padding:12px!important;border-radius:9px!important;overflow:hidden!important}
    .cal-screen .tb-dark .wc-tbl{width:100%!important;table-layout:fixed!important;font-size:11.5px!important}
    .cal-screen .tb-dark .wc-tbl th,.cal-screen .tb-dark .wc-tbl td{padding:5px 2px!important;text-align:center!important;white-space:nowrap!important}
    .cal-screen .tb-dark .wc-tbl th:first-child,.cal-screen .tb-dark .wc-tbl td.pos{width:22px!important;padding-left:6px!important}
    .cal-screen .tb-dark .wc-tbl th:nth-child(2),.cal-screen .tb-dark .wc-tbl td:nth-child(2){width:auto!important;text-align:left!important;overflow:hidden!important;text-overflow:ellipsis!important}
    .cal-screen .tb-dark .wc-tbl th:nth-child(n+3),.cal-screen .tb-dark .wc-tbl td:nth-child(n+3){width:24px!important}
    .cal-screen .tb-dark .wc-tbl .wc-team{display:flex;align-items:center;gap:5px;min-width:0}
    .cal-screen .tb-dark .wc-tbl .wc-tname{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .cal-screen .tb-dark .wc-m{grid-template-columns:46px minmax(0,1fr) 32px minmax(0,1fr)!important;gap:4px!important;padding:5px 7px!important;font-size:11px!important}
    .cal-screen .tb-dark .wc-mside{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
    body.cp-themed .cal-screen .tb-dark .wc-group{background:#141e2e!important;border:1px solid #253852!important}
    body.cp-themed .cal-screen .tb-dark .wc-gname{color:#ffd166!important;letter-spacing:.08em}
    body.cp-themed .cal-screen .tb-dark .wc-m{background:#0d1421!important;border:1px solid #1e2f47!important;border-radius:6px!important}
    body.cp-themed .cal-screen .tb-dark .ev-meaning{background:#121b2b!important;border:1px solid #243955!important;border-radius:8px!important;padding:10px 12px!important}
    body.cp-themed .cal-screen .tb-close{top:12px!important;right:12px!important;width:34px!important;height:34px!important;border-radius:8px!important;
      background:#162235!important;border:1px solid #2d4766!important;color:#e2edf8!important;z-index:6!important}
    body.cp-themed .cal-screen .tb-close:hover{background:#1f334d!important;border-color:#38e2ff!important;color:#fff!important}
    body.cp-themed .cal-screen .tb-head{border-radius:9px!important;border:1px solid #284160!important;box-shadow:inset 0 3px 0 #00d4ff!important;
      padding:14px 48px 14px 16px!important;margin-bottom:12px!important;color:#fff!important;text-shadow:0 2px 6px rgba(0,0,0,.9)}
    body.cp-themed .cal-screen .cb-when{display:inline-block!important;padding:4px 10px!important;border-radius:6px!important;
      background:#152132!important;border:1px solid #263b56!important;color:#7ee8fa!important;font-weight:700!important;margin-bottom:6px}
    body.cp-themed .cal-screen .day-note{background:#0a1019!important;border:1px solid #253a54!important;border-radius:8px!important;color:#f1f5f9!important}
    body.cp-themed .cal-screen .day-note:focus{border-color:#00d4ff!important}
    body.cp-themed .cal-screen .btn.primary{background:linear-gradient(135deg,#0284c7,#00d4ff)!important;border:1px solid #67e8f9!important;
      color:#041824!important;font-weight:800!important;border-radius:7px!important}
    body.cp-themed .cal-screen .btn.primary:hover{filter:brightness(1.08)}
    /* ---- Overhauled Pre-Game Landing & Sub-Screens + Intro Handoff ---- */
    html:not(.bg-light) body.cp-themed:has(.pre:not(.pick))::before{filter:blur(4px) brightness(.78) saturate(1.16)!important;transform:scale(1.03);transition:filter .6s ease,transform .6s ease}
    body.cp-themed .pre:not(.pick){
      --pre-red:#00d4ff;--pre-gold:#fbbf24;--pre-blue:#38e2ff;--pre-dim:#a3b8ce;
      position:relative;overflow-x:hidden;
      background:
        radial-gradient(ellipse 82% 58% at 50% 22%,rgba(0,212,255,.15),transparent 62%),
        radial-gradient(ellipse 68% 50% at 84% 76%,rgba(168,85,247,.14),transparent 60%),
        radial-gradient(ellipse 62% 48% at 16% 80%,rgba(245,158,11,.10),transparent 60%),
        linear-gradient(180deg,rgba(6,10,19,.56) 0%,rgba(6,10,18,.74) 55%,rgba(4,7,14,.92) 100%)!important}
    body.cp-themed .pre.cp-home::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.34;
      background-image:linear-gradient(rgba(56,226,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(56,226,255,.07) 1px,transparent 1px);
      background-size:64px 64px;mask-image:radial-gradient(ellipse 78% 68% at 50% 45%,#000 18%,transparent 76%)}
    body.cp-themed .pre.cp-home>*{position:relative;z-index:2}
    .cp-home-hero{display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;margin-bottom:4px}
    .cp-home-badge{display:inline-flex;align-items:center;gap:8px;padding:5px 14px;border-radius:999px;
      background:rgba(8,15,28,.82);border:1px solid rgba(56,226,255,.42);
      box-shadow:0 6px 22px rgba(0,0,0,.45),inset 0 1px 0 rgba(103,232,249,.35);
      color:#7ee8fa;font:900 11px/1.1 inherit;letter-spacing:.16em;text-transform:uppercase}
    .cp-home-dot{width:7px;height:7px;border-radius:50%;background:#00d4ff;box-shadow:0 0 10px #00d4ff}
    .cp-home-crest{width:54px;height:54px;margin-top:2px;display:grid;place-items:center;border-radius:14px;
      background:linear-gradient(145deg,rgba(0,212,255,.16),rgba(124,58,237,.18));
      border:1px solid rgba(103,232,249,.45);box-shadow:0 12px 34px rgba(0,212,255,.22),inset 0 2px 0 rgba(255,255,255,.18)}
    .cp-home-crest svg{width:30px;height:30px;filter:drop-shadow(0 0 12px rgba(56,226,255,.55))}
    body.cp-themed .pre.cp-home .pre-title{font-size:clamp(42px,4.8vw,64px)!important;letter-spacing:.08em!important;line-height:1!important;margin-top:2px;
      background:linear-gradient(180deg,#ffffff 25%,#b9e8ff 72%,#38e2ff 100%);-webkit-background-clip:text;background-clip:text;color:transparent;
      filter:drop-shadow(0 6px 24px rgba(0,0,0,.85))}
    .cp-home-sub{font:700 12px/1.3 inherit;letter-spacing:.22em;text-transform:uppercase;color:#a9c2db;text-shadow:0 2px 8px rgba(0,0,0,.95)}
    body.cp-themed .pre-doors{width:min(1080px,92vw)!important;gap:18px!important;margin-top:10px!important}
    body.cp-themed .pre-door{
      --cp-door:#00d4ff;position:relative;overflow:hidden;min-width:0!important;min-height:186px;padding:22px 24px 20px!important;
      display:flex!important;flex-direction:column!important;justify-content:space-between!important;gap:12px;
      border-radius:14px!important;border:1px solid rgba(255,255,255,.12)!important;border-left:1px solid rgba(255,255,255,.12)!important;
      background:linear-gradient(160deg,color-mix(in srgb,var(--cp-door) 14%,rgba(13,20,34,.88)) 0%,rgba(8,13,24,.92) 76%)!important;
      box-shadow:inset 0 3px 0 var(--cp-door),0 18px 42px rgba(0,0,0,.52)!important;backdrop-filter:blur(12px);
      transition:transform .22s cubic-bezier(.16,1,.3,1),border-color .22s,box-shadow .22s,background .22s!important}
    body.cp-themed .pre-door[data-action="pre-load"]{--cp-door:#fbbf24}
    body.cp-themed .pre-door[data-action="pre-worlds"],body.cp-themed .pre-door[data-mode="player"]{--cp-door:#a855f7}
    body.cp-themed .pre-door::after{content:"";position:absolute;inset:0;pointer-events:none;
      background:radial-gradient(circle at 12% 10%,color-mix(in srgb,var(--cp-door) 24%,transparent),transparent 54%);opacity:.7;transition:opacity .22s}
    body.cp-themed .pre-door:hover{transform:translateY(-5px)!important;border-color:color-mix(in srgb,var(--cp-door) 78%,#fff)!important;
      background:linear-gradient(160deg,color-mix(in srgb,var(--cp-door) 22%,rgba(16,25,42,.92)) 0%,rgba(10,16,29,.96) 76%)!important;
      box-shadow:inset 0 3px 0 var(--cp-door),0 22px 48px rgba(0,0,0,.62),0 0 28px color-mix(in srgb,var(--cp-door) 24%,transparent)!important}
    body.cp-themed .pre-door:hover::after{opacity:1}
    body.cp-themed .pre-door>*{position:relative;z-index:2}
    .cp-door-top{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%}
    .cp-door-ico{width:38px;height:38px;border-radius:10px;display:grid;place-items:center;flex:none;
      background:color-mix(in srgb,var(--cp-door) 18%,rgba(10,16,28,.9));border:1px solid color-mix(in srgb,var(--cp-door) 46%,transparent);color:var(--cp-door)}
    .cp-door-ico svg{width:20px;height:20px}
    .cp-door-tag{padding:3px 9px;border-radius:999px;font:900 10px/1.1 inherit;letter-spacing:.12em;text-transform:uppercase;
      background:rgba(7,12,22,.82);border:1px solid color-mix(in srgb,var(--cp-door) 42%,transparent);color:color-mix(in srgb,var(--cp-door) 76%,#fff)}
    .cp-door-body{display:block;width:100%}
    body.cp-themed .pre-door .pre-door-k{font-size:21px!important;letter-spacing:.06em!important;color:#fff!important;margin-top:4px}
    body.cp-themed .pre-door .pre-door-v{color:#b6c8dc!important;font-size:13.5px!important;line-height:1.4!important;margin-top:4px!important}
    .cp-door-cta{display:flex;align-items:center;justify-content:space-between;width:100%;padding-top:10px;margin-top:auto;
      border-top:1px solid rgba(255,255,255,.08);font:800 11px/1 inherit;letter-spacing:.14em;text-transform:uppercase;
      color:color-mix(in srgb,var(--cp-door) 74%,#fff);transition:transform .2s,color .2s}
    body.cp-themed .pre-door:hover .cp-door-cta{color:#fff}
    body.cp-themed .pre-door:hover .cp-door-cta .cp-arr{transform:translateX(4px)}
    .cp-arr{display:inline-block;transition:transform .2s ease}
    body.cp-themed .pre-foot{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:10px;margin-top:12px!important;
      padding:10px 14px;border-radius:12px;background:rgba(8,14,26,.82);border:1px solid rgba(56,226,255,.24);backdrop-filter:blur(10px);
      box-shadow:0 12px 30px rgba(0,0,0,.45)}
    body.cp-themed .pre-foot .btn.ghost,.cp-foot-btn{background:rgba(19,30,48,.88)!important;border:1px solid #2b4464!important;color:#d6e7f7!important;
      border-radius:8px!important;padding:8px 14px!important;font:800 11.5px/1.1 inherit!important;letter-spacing:.08em!important;
      text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:7px;transition:all .15s}
    body.cp-themed .pre-foot .btn.ghost:hover,.cp-foot-btn:hover{background:#18304d!important;border-color:#38e2ff!important;color:#fff!important;transform:translateY(-1px)}
    .cp-foot-btn.cyan{border-color:rgba(56,226,255,.45)!important;color:#7ee8fa!important}
    .cp-foot-btn.cyan:hover{background:#0284c7!important;border-color:#67e8f9!important;color:#fff!important}
    body.cp-themed .pre-back{background:rgba(16,26,42,.88)!important;border:1px solid #2c4668!important;color:#7ee8fa!important;transition:all .15s}
    body.cp-themed .pre-back:hover{background:#1d3554!important;border-color:#38e2ff!important;color:#fff!important}
    body.cp-themed .pre:not(.pick) .pre-title.sm{color:#fff!important;letter-spacing:.06em!important;text-shadow:0 2px 14px rgba(0,212,255,.28)}
    body.cp-themed .pre-save-open{background:rgba(13,20,33,.88)!important;border:1px solid #253b56!important;border-left:3px solid #00d4ff!important;
      border-radius:10px!important;transition:transform .15s,border-color .15s,background .15s!important}
    body.cp-themed .pre-save-open:hover{background:rgba(20,32,52,.94)!important;border-color:#38e2ff!important;transform:translateY(-2px)}
    body.cp-themed .pre-save-mode{border-radius:999px!important;padding:2px 8px!important;font-size:10px!important;letter-spacing:.08em!important}
    body.cp-themed .pre-save-mode.manager{background:rgba(0,212,255,.16)!important;color:#7ee8fa!important;border:1px solid rgba(56,226,255,.35)}
    body.cp-themed .pre-save-mode.player{background:rgba(168,85,247,.22)!important;color:#e9d5ff!important;border:1px solid rgba(192,132,252,.4)}
    body.cp-themed .pre-save-edit,body.cp-themed .pre-save-drop{border-radius:10px!important}
    body.cp-themed .pre-save-edit{background:rgba(20,30,48,.9)!important;border:1px solid #2a415e!important;color:#dbe9f8!important}
    body.cp-themed .pre-save-edit:hover:not(:disabled){background:#1c314e!important;border-color:#38e2ff!important}
    body.cp-themed .pre-diff{background:rgba(13,20,33,.88)!important;border:1px solid #243852!important;border-left:3px solid #243852!important;border-radius:10px!important}
    body.cp-themed .pre-diff:hover{background:rgba(20,32,52,.94)!important;border-color:#38e2ff!important}
    body.cp-themed .pre-diff.on{background:linear-gradient(135deg,rgba(0,212,255,.16),rgba(13,22,38,.94))!important;border-color:#38e2ff!important;border-left-color:#00d4ff!important}
    body.cp-themed .pre:not(.pick) .pre-field input,body.cp-themed .pre:not(.pick) .pre-select{
      background:rgba(10,16,28,.85)!important;border:1px solid #263c58!important;border-radius:8px!important;padding:10px 12px!important;color:#f1f5f9!important}
    body.cp-themed .pre:not(.pick) .pre-field input:focus,body.cp-themed .pre:not(.pick) .pre-select:focus{border-color:#00d4ff!important;box-shadow:0 0 0 2px rgba(0,212,255,.2)}
    @keyframes cpCurtainLift{0%{opacity:1}35%{opacity:.85}100%{opacity:0}}
    @keyframes cpHomeRise{0%{opacity:0;transform:translateY(18px) scale(.985)}100%{opacity:1;transform:none}}
    @keyframes cpDoorRise{0%{opacity:0;transform:translateY(24px) scale(.97)}100%{opacity:1;transform:none}}
    #cp-home-curtain{position:fixed;inset:0;z-index:9999;pointer-events:none;
      background:radial-gradient(circle at 50% 44%,rgba(0,212,255,.22),rgba(168,85,247,.12) 32%,#04070d 68%);
      animation:cpCurtainLift .95s cubic-bezier(.16,1,.3,1) forwards}
    .pre.cp-home.cp-anim .cp-home-hero{opacity:0;animation:cpHomeRise .7s cubic-bezier(.16,1,.3,1) .05s forwards}
    .pre.cp-home.cp-anim .pre-door{opacity:0;animation:cpDoorRise .68s cubic-bezier(.16,1,.3,1) forwards}
    .pre.cp-home.cp-anim .pre-door:nth-child(1){animation-delay:.12s}
    .pre.cp-home.cp-anim .pre-door:nth-child(2){animation-delay:.20s}
    .pre.cp-home.cp-anim .pre-door:nth-child(3){animation-delay:.28s}
    .pre.cp-home.cp-anim .pre-foot{opacity:0;animation:cpHomeRise .62s cubic-bezier(.16,1,.3,1) .34s forwards}
    /* ---- Clickable Top-Left Player Profile & Live RL Title Preview ---- */
    .ident-wrap{cursor:pointer;transition:filter .16s ease,transform .16s ease}
    .ident-wrap:hover{filter:drop-shadow(0 0 12px rgba(56,226,255,.45));transform:translateY(-1px)}
    .cp-tcard{margin:14px 0 8px;padding:13px 14px;border-radius:10px;background:linear-gradient(180deg,#0f1827,#0a111d);border:1px solid #243a56}
    .cp-tcard-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:9px}
    .cp-tcard-h{font:900 11px/1.1 inherit;letter-spacing:.14em;text-transform:uppercase;color:#7ee8fa}
    .cp-tcard-sub{font-size:11px;color:#8aa2bf}
    .cp-rlsb{border-radius:7px;overflow-x:auto;border:1px solid rgba(96,165,250,.28);background:radial-gradient(ellipse at 24% 0%,rgba(28,82,168,.38),rgba(8,14,26,.96) 72%);padding:9px 12px 10px;margin-bottom:10px;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
    .cp-rlsb-hd{display:grid;grid-template-columns:minmax(185px,1fr) 52px 50px 62px 50px 52px 46px;align-items:center;gap:8px;padding:0 8px 6px;font:800 9.5px/1 inherit;letter-spacing:.04em;text-transform:uppercase;color:rgba(206,224,246,.82);border-bottom:1px solid rgba(125,180,255,.2);margin-bottom:6px;white-space:nowrap}
    .cp-rlsb-hd span:not(:first-child){text-align:center}
    .cp-rlsb-team{font:800 12.5px/1 inherit;letter-spacing:.07em;color:#eef6ff;text-shadow:0 1px 4px rgba(0,0,0,.9);overflow:hidden;text-overflow:ellipsis}
    .cp-rlsb-row{display:grid;grid-template-columns:minmax(185px,1fr) 52px 50px 62px 50px 52px 46px;align-items:center;gap:8px;padding:7px 8px;border-radius:4px;background:linear-gradient(90deg,rgba(24,78,176,.86) 0%,rgba(22,68,154,.74) 62%,rgba(14,42,102,.64) 100%);border-left:3px solid #38bdf8;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 2px 10px rgba(0,0,0,.45)}
    .cp-rlsb-who{display:flex;align-items:center;gap:10px;min-width:0}
    .cp-rlsb-av{width:34px;height:34px;border-radius:4px;overflow:hidden;flex:none;background:#0d1a30;border:1px solid rgba(147,197,253,.45);display:grid;place-items:center}
    .cp-rlsb-av .chat-face,.cp-rlsb-av .crest,.cp-rlsb-av img{width:100%!important;height:100%!important;margin:0!important;border-radius:3px!important;object-fit:cover}
    .cp-rlsb-id{min-width:0;display:flex;flex-direction:column;gap:2px}
    .cp-rlsb-name{font:700 13.5px/1.1 "Segoe UI",sans-serif;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 3px rgba(0,0,0,.9)}
    .cp-rlsb-title{font:800 10.5px/1.2 "Bahnschrift","Segoe UI",sans-serif;letter-spacing:.05em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .cp-rlsb-title.rlcs{color:#a8f3ff;text-shadow:0 0 6px #00c8ff,0 0 13px rgba(0,185,255,.92),0 0 22px rgba(0,136,255,.65),0 1px 2px rgba(0,0,0,.95)}
    .cp-rlsb-title.gold{color:#fff0a6;text-shadow:0 0 6px #ffbe0b,0 0 13px rgba(255,170,0,.92),0 0 22px rgba(255,128,0,.65),0 1px 2px rgba(0,0,0,.95)}
    .cp-rlsb-title.none{color:#94a3b8;text-shadow:0 1px 2px rgba(0,0,0,.9)}
    .cp-rlsb-num{text-align:center;font:700 12.5px/1 "Bahnschrift","Segoe UI",sans-serif;color:#eef6ff;text-shadow:0 1px 2px rgba(0,0,0,.85)}
    .cp-rlsb-ping{display:flex;align-items:flex-end;justify-content:center;gap:1.5px;color:#4ade80;font:700 11px/1 "Bahnschrift",sans-serif}
    .cp-rlsb-ping i{display:inline-block;width:2.5px;background:#4ade80;border-radius:1px}
    .cp-tcard-sel{width:100%;padding:8px 10px;border-radius:7px;background:#0a111d;border:1px solid #263f5e;color:#f1f5f9;font:600 12.5px/1.2 inherit;cursor:pointer}
    .cp-tcard-sel:focus{outline:none;border-color:#00d4ff}
  `;
  const Y_THEMES = [
    { id: 'dim', name: 'Dim Slate', desc: 'Classic Twitter dark slate with crisp sky-blue accents.', bg: '#15202b', card: '#1c2938', hover: '#243447', line: '#2f4156', dim: '#8b98a5', acc: '#1d9bf0', link: '#4ab3f4', ink: '#fff' },
    { id: 'midnight', name: 'Midnight Neon', desc: 'Deep obsidian night feed with electric cyan highlights.', bg: '#090d16', card: '#111827', hover: '#182338', line: '#22314a', dim: '#8aa2bf', acc: '#00d4ff', link: '#5eead4', ink: '#061821' },
    { id: 'violet', name: 'Royal Violet', desc: 'Velvet dark indigo with luminous violet accents & links.', bg: '#0f0b18', card: '#181226', hover: '#231a38', line: '#342754', dim: '#a698c4', acc: '#a855f7', link: '#c084fc', ink: '#fff' },
    { id: 'emerald', name: 'Esports Emerald', desc: 'Deep carbon-emerald finish with tournament green accents.', bg: '#09120f', card: '#101f19', hover: '#172c24', line: '#224034', dim: '#8cb3a6', acc: '#22c55e', link: '#4ade80', ink: '#041f0e' },
    { id: 'gold', name: 'Championship Gold', desc: 'Obsidian black-gold theme styled for LAN finals.', bg: '#120e08', card: '#1c160d', hover: '#282013', line: '#3d301d', dim: '#bfb09a', acc: '#f59e0b', link: '#fbbf24', ink: '#1f1402' },
  ];
  st.textContent += `\n    body[data-ytheme] .xs .x-compose{background:var(--card)!important;border-top:1px solid var(--rule)!important;border-bottom:1px solid var(--rule)!important}`
    + `\n    body[data-ytheme] .xs .x-option{background:color-mix(in srgb,var(--text) 4%,transparent)!important;border-color:var(--rule)!important}`
    + `\n    body[data-ytheme] .xs .x-option:hover{background:color-mix(in srgb,var(--accent) 14%,var(--card))!important;border-color:var(--accent)!important}`
    + `\n    body[data-ytheme] .xs .x-post{background:transparent!important;border-bottom:1px solid var(--rule)!important;border-radius:0!important}`
    + `\n    body[data-ytheme] .xs .x-post.mine{background:color-mix(in srgb,var(--accent) 7%,transparent)!important;border-left:3px solid var(--accent)!important}`
    + `\n    body[data-ytheme] .xs .x-post.at-me{background:color-mix(in srgb,var(--accent) 11%,transparent)!important;border-left:3px solid var(--accent)!important}`;
  for (const yt of Y_THEMES) {
    st.textContent += `\n    body[data-ytheme="${yt.id}"] .xs,body[data-ytheme="${yt.id}"] .xm-wrap{`
      + `--ground:${yt.bg};--navy-0:${yt.bg};--navy-1:${yt.card};--navy-2:${yt.card};--navy-3:${yt.hover};`
      + `--panel:${yt.bg};--panel-2:${yt.bg};--card:${yt.card};--card-hover:${yt.hover};`
      + `--raise:${yt.hover};--raise-line:${yt.line};--raise-ink:#e7eef6;--blue:${yt.card};--blue-ink:#eef4fc;`
      + `--text:#f0f6fc;--text-dim:${yt.dim};--rule:${yt.line};--line:${yt.line};`
      + `--red:${yt.acc};--red-fill:${yt.acc};--red-ink:${yt.ink};--teal:${yt.acc};--accent:${yt.acc};--link:${yt.link}}`;
  }
  const bgs = window.__cpBgs || {};
  const bgPool = [bgs.vit, bgs.falcons, bgs.cars].filter(Boolean);
  const arenaPool = (Array.isArray(bgs.arenas) ? bgs.arenas : []).filter(Boolean);
  for (let i = arenaPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arenaPool[i]; arenaPool[i] = arenaPool[j]; arenaPool[j] = tmp;
  }
  let bgIndex = 0;
  let arenaIndex = 0;
  function isMatchIdle() {
    return (typeof document !== 'undefined' && document.hidden)
      || (typeof S !== 'undefined' && S && S.career && S.career.pendingMatch != null);
  }
  function syncMatchIdle() {
    if (!document.body || !document.body.classList) return;
    document.body.classList.toggle('cp-match-idle', !!isMatchIdle());
  }
  function applyBgRotation() {
    if (!document.body || !document.body.style) return;
    if (bgPool.length) {
      document.body.style.setProperty('--cp-bg-a', 'url("' + bgPool[bgIndex] + '")');
      document.body.style.setProperty('--cp-bg-b', 'url("' + bgPool[(bgIndex + 2) % bgPool.length] + '")');
    }
    if (arenaPool.length) {
      document.body.style.setProperty('--cp-arena', 'url("' + arenaPool[arenaIndex] + '")');
    }
  }
  function rotateBgs() {
    if (bgPool.length < 2 || isMatchIdle()) return;
    bgIndex = (bgIndex + 1) % bgPool.length;
    applyBgRotation();
  }
  function rotateArenas() {
    if (arenaPool.length < 2 || isMatchIdle()) return;
    arenaIndex = (arenaIndex + 1) % arenaPool.length;
    applyBgRotation();
  }
  if (bgPool.length || arenaPool.length) {
    if (bgPool.length) {
      st.textContent += `\n    body.cp-themed .sf-screen{background:linear-gradient(160deg,rgba(10,15,24,.76) 15%,rgba(10,15,24,.58) 55%,rgba(10,15,24,.84) 100%),var(--cp-bg-a) center 25%/cover no-repeat!important}`
        + `\n    body.cp-themed .search-panel{background:linear-gradient(155deg,rgba(12,19,30,.82) 15%,rgba(12,19,30,.58) 55%,rgba(10,15,24,.9) 100%),var(--cp-bg-b) center/cover no-repeat!important}`;
    }
    if (arenaPool.length) {
      st.textContent += `\n    html:not(.bg-light){background-color:#0b111c!important}`
        + `\n    html:not(.bg-light) body{background-image:none!important;background-color:transparent!important}`
        + `\n    html:not(.bg-light) body::after{content:"";position:fixed;inset:0;z-index:-1;background:rgba(10,14,22,0.28)!important;pointer-events:none}`
        + `\n    html:not(.bg-light) body::before{content:"";position:fixed;inset:-30px;z-index:-2;background-size:cover;background-position:center;`
        + `background-image:var(--cp-arena)!important;filter:blur(10px) brightness(0.68) saturate(0.95)!important;opacity:.95!important;`
        + `will-change:transform;transform:translate3d(0,0,0);contain:strict}`
        + `\n    body.cp-match-idle::before{display:none!important}`
        + `\n    body.cp-match-idle *,body.cp-match-idle *::before,body.cp-match-idle *::after{backdrop-filter:none!important;animation-play-state:paused!important}`;
    }
    applyBgRotation();
    if (bgPool.length > 1) setInterval(rotateBgs, 5 * 60 * 1000);
    if (arenaPool.length > 1) setInterval(rotateArenas, 7 * 60 * 1000);
  }
  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('visibilitychange', syncMatchIdle);
  }
  document.head.appendChild(st);

  function getPronouns() {
    try { return localStorage.getItem('cp_pronouns') || 'he'; } catch { return 'he'; }
  }

  function matchCase(src, out) {
    if (!src) return out;
    if (src === src.toUpperCase()) return out.toUpperCase();
    if (src[0] === src[0].toUpperCase()) return out[0].toUpperCase() + out.slice(1);
    return out;
  }

  function swapPronouns(txt) {
    if (!txt || getPronouns() !== 'she') return txt;
    return String(txt)
      .replace(/[@#][A-Za-z0-9_]+|\b(he(?:'s|'d|'ll)?|himself|him)\b/gi, (m, w) => {
        if (!w) return m;
        const lo = w.toLowerCase();
        if (lo === 'himself') return matchCase(w, 'herself');
        if (lo === 'him') return matchCase(w, 'her');
        if (lo === 'he') return matchCase(w, 'she');
        return matchCase(w.slice(0, 2), 'she') + w.slice(2);
      })
      .replace(/[@#][A-Za-z0-9_]+|\bhis\b(?=\s*(?:[.,!?;:\])"']|$))/gi, (m) =>
        (m[0] === '@' || m[0] === '#') ? m : matchCase(m, 'hers')
      )
      .replace(/[@#][A-Za-z0-9_]+|\bhis\b/gi, (m) =>
        (m[0] === '@' || m[0] === '#') ? m : matchCase(m, 'her')
      );
  }

  function getYTheme() {
    try { return localStorage.getItem('cp_y_theme') || 'none'; } catch { return 'none'; }
  }

  function applyYTheme() {
    if (!document.body || !document.body.dataset) return;
    const yt = getYTheme();
    if (yt && yt !== 'none') document.body.dataset.ytheme = yt;
    else delete document.body.dataset.ytheme;
  }

  function getTheme() {
    try { return localStorage.getItem('cp_ui_theme') || 'careerplus'; } catch { return 'careerplus'; }
  }

  function getPref(key, defVal) {
    try {
      const v = localStorage.getItem('cp_pref_' + key);
      return v == null ? !!defVal : v !== '0';
    } catch { return !!defVal; }
  }

  function setPref(key, val) {
    try { localStorage.setItem('cp_pref_' + key, val ? '1' : '0'); } catch {}
    applyPrefs();
  }

  function applyPrefs() {
    if (!document.body || !document.body.classList) return;
    document.body.classList.toggle('cp-no-bg', !getPref('vis_bg', true));
    document.body.classList.toggle('cp-no-glint', !getPref('vis_glint', true));
  }

  function applyUiTheme() {
    const on = getTheme() === 'careerplus';
    if (document.body && document.body.classList) document.body.classList.toggle('cp-themed', on);
  }
  applyUiTheme();
  applyYTheme();
  applyPrefs();

  function getCfg() {
    const c = (typeof S !== 'undefined' && S && S.career && (S.career.careerPlus || S.career.jnyMod)) || {};
    return {
      autoTrain: c.autoTrain !== false,
      autoFill: c.autoFill !== false,
      skipCapped: c.skipCapped !== false,
      sessions: c.sessions || 0,
      lastAutoDate: c.lastAutoDate || null,
      lastNotice: c.lastNotice || null,
    };
  }

  function squadPlayers() {
    if (typeof S === 'undefined' || !S || !S.career) return [];
    const tid = S.career.userTeamId;
    return (S.career.players || []).filter((p) => p.teamId === tid && !p.retired);
  }

  function nationalPlayers() {
    if (typeof S === 'undefined' || !S || !S.career || !S.intl || !S.intl.national) return [];
    const nat = S.intl.national;
    if (!nat.coach) return [];
    const clubIds = new Set(squadPlayers().map((p) => p.id));
    let ids = Array.isArray(nat.squad) && nat.squad.length ? nat.squad : null;
    if (!ids && nat.teamId != null && typeof teamById === 'function') {
      const nt = teamById(nat.teamId);
      ids = nt && Array.isArray(nt.playerIds) ? nt.playerIds : [];
    }
    if (!ids && Array.isArray(nat.pool)) ids = nat.pool;
    const byId = new Map((S.career.players || []).map((p) => [p.id, p]));
    const out = [];
    const seen = new Set();
    for (const pid of (ids || [])) {
      if (seen.has(pid) || clubIds.has(pid)) continue;
      seen.add(pid);
      const p = byId.get(pid);
      if (p && !p.retired && !p.isUser) out.push(p);
    }
    return out;
  }

  function allEditablePlayers() {
    return squadPlayers().concat(nationalPlayers());
  }

  function dismissOverlays() {
    if (typeof bigList !== 'undefined') bigList = null;
    if (typeof closeModal === 'function') closeModal();
    else {
      const mr = document.getElementById('modal-root');
      if (mr) mr.innerHTML = '';
    }
  }

  function clubLogo() {
    if (typeof C !== 'function' || typeof teamById !== 'function' || typeof crest !== 'function') return '';
    const c = C();
    const t = c && c.userTeamId != null ? teamById(c.userTeamId) : null;
    return t && t.id != null ? crest(t, 'small') : '';
  }

  async function sendCmd(payload, richInfo) {
    if (!window.hub || !window.hub.placeBet) return;
    const res = await window.hub.placeBet({ kind: 'cp:' + JSON.stringify(payload), ref: 0, teamId: 0, stake: 0 });
    if (res && res.ok === false) {
      showRichToast({
        cls: 'loss', col: '#ffa198', logo: clubLogo(),
        head: 'CAREER+ ERROR', amt: 'FAILED', sub: res.error || 'RL Career+ action failed',
        plain: res.error || 'RL Career+ action failed',
      });
      return res;
    }
    if (res && res.career !== undefined && typeof S !== 'undefined') {
      S = res;
      if (typeof render === 'function') render();
    }
    if (richInfo) {
      const info = typeof richInfo === 'function' ? richInfo(res) : richInfo;
      if (info) showRichToast(info);
    }
    return res;
  }

  let selectedPid = null;
  let lastSaveKey = null;
  let lastSeenSeq = 0;
  let lastBetSave = null;
  let seenPastCounts = new Map();
  let betToastQueue = [];
  let betToastTimer = null;
  let lastMsgSave = null;
  const seenMailIds = new Set();
  const seenChatCounts = new Map();

  function enqueueNotice(item) {
    if (!item) return;
    betToastQueue.push(item);
    drainBetQueue();
  }

  function pastSig(b) {
    return [b.kind || '', b.ref ?? '', b.teamId ?? '', b.stake || 0, b.odds || 0, b.won ? 1 : 0, b.returned || 0, b.label || '', b.date || b.settledOn || ''].join('|');
  }

  function showRichToast(item) {
    const root = document.getElementById('toast-root');
    if (!root || typeof document.createElement !== 'function') {
      if (typeof showToast === 'function') showToast(item.plain || item.head, item.cls === 'loss' ? 'error' : undefined);
      return;
    }
    const el = document.createElement('div');
    el.className = 'toast cp-bet-toast ' + item.cls;
    el.innerHTML = (item.logo || '')
      + '<div style="min-width:0;flex:1"><div class="cp-bt-top"><span>' + esc(item.head) + '</span>'
      + '<span style="color:' + item.col + '">' + esc(item.amt || '') + '</span></div>'
      + (item.sub ? '<div class="cp-bt-sub">' + esc(item.sub) + '</div>' : '')
      + '</div>';
    root.appendChild(el);
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 350);
    }, 4200);
  }

  function drainBetQueue() {
    if (betToastTimer || !betToastQueue.length) return;
    const item = betToastQueue.shift();
    if (item) showRichToast(item);
    betToastTimer = setTimeout(() => {
      betToastTimer = null;
      drainBetQueue();
    }, 850);
  }

  function mailSig(m) {
    return m && m.id != null ? 'id:' + m.id : [m && m.date || '', m && m.type || '', m && m.title || ''].join('|');
  }

  function checkMailChatNotices() {
    if (typeof S === 'undefined' || !S || !S.career) {
      lastMsgSave = null;
      seenMailIds.clear();
      seenChatCounts.clear();
      return;
    }
    const key = String(S.saveId || S.career.leagueName || 'career');
    const inbox = S.career.inbox || [];
    const chats = typeof chatList === 'function' ? chatList() : (S.chats || []);
    if (lastMsgSave !== key) {
      lastMsgSave = key;
      seenMailIds.clear();
      seenChatCounts.clear();
      for (const m of inbox) seenMailIds.add(mailSig(m));
      for (const ch of chats) {
        if (!ch) continue;
        const pid = ch.playerId != null ? ch.playerId : ch.name;
        const inc = (ch.messages || []).filter((msg) => msg && msg.from !== 'manager').length;
        seenChatCounts.set(pid, inc);
      }
      return;
    }

    const simOnly = getPref('ntf_simOnly', false);
    const isSim = typeof simToRunning === 'function' && simToRunning();
    const allowMail = getPref('ntf_mail', true) && (!simOnly || isSim);
    const allowChat = getPref('ntf_chat', true) && (!simOnly || isSim);

    for (const m of inbox) {
      if (!m) continue;
      const sig = mailSig(m);
      if (seenMailIds.has(sig)) continue;
      seenMailIds.add(sig);
      if (!allowMail || m.unread === false) continue;
      const sender = typeof msgFrom === 'function' ? msgFrom(m) : (m.type || 'Inbox');
      const needs = typeof msgNeedsYou === 'function' ? msgNeedsYou(m, S.career) : false;
      const dtTxt = typeof fmtDayMonth === 'function' && m.date ? fmtDayMonth(m.date) : 'NEW MAIL';
      const tid = m.data && m.data.teamId;
      const tObj = tid != null && typeof teamById === 'function' ? teamById(tid) : null;
      const logo = tObj && typeof crest === 'function' && tObj.id != null ? crest(tObj, 'small') : clubLogo();
      const titleTxt = m.title || m.body || 'New inbox notification';
      enqueueNotice({
        cls: 'mail',
        col: needs ? '#ffd166' : '#38e2ff',
        logo,
        head: 'INBOX · ' + sender,
        amt: needs ? 'ACTION NEEDED' : dtTxt,
        sub: titleTxt,
        plain: 'Inbox (' + sender + '): ' + titleTxt,
      });
    }

    for (const ch of chats) {
      if (!ch) continue;
      const pid = ch.playerId != null ? ch.playerId : ch.name;
      const incoming = (ch.messages || []).filter((msg) => msg && msg.from !== 'manager');
      const prev = seenChatCounts.get(pid) || 0;
      if (incoming.length <= prev) {
        seenChatCounts.set(pid, incoming.length);
        continue;
      }
      const added = incoming.slice(prev);
      seenChatCounts.set(pid, incoming.length);
      if (!allowChat) continue;
      const needsReply = !!(ch.options && ch.options.length);
      const logo = typeof faceHtml === 'function' ? faceHtml(ch.name || 'P', ch.playerId, 'cp-toast-face') : clubLogo();
      for (const msg of added) {
        enqueueNotice({
          cls: 'chat',
          col: needsReply ? '#ffd166' : '#d8b4fe',
          logo,
          head: 'PLAYER CHAT · ' + (ch.name || 'Player'),
          amt: needsReply ? 'REPLY NEEDED' : 'MESSAGE',
          sub: msg.text || 'New player chat message',
          plain: (ch.name || 'Player') + ': ' + (msg.text || ''),
        });
      }
    }
  }

  function checkBetNotices() {
    if (typeof S === 'undefined' || !S || !S.career) {
      lastBetSave = null;
      seenPastCounts.clear();
      betToastQueue = [];
      if (betToastTimer) { clearTimeout(betToastTimer); betToastTimer = null; }
      return;
    }
    const key = String(S.saveId || S.career.leagueName || 'career');
    const past = (typeof betBook === 'function' ? betBook().past : S.bets && S.bets.past) || [];
    const curCounts = new Map();
    for (const b of past) {
      const sig = pastSig(b);
      curCounts.set(sig, (curCounts.get(sig) || 0) + 1);
    }
    if (lastBetSave !== key) {
      lastBetSave = key;
      seenPastCounts = curCounts;
      betToastQueue = [];
      if (betToastTimer) { clearTimeout(betToastTimer); betToastTimer = null; }
      return;
    }
    const allowBet = getPref('ntf_bet', true) && (!getPref('ntf_simOnly', false) || (typeof simToRunning === 'function' && simToRunning()));
    if (!allowBet) {
      seenPastCounts = curCounts;
      return;
    }
    const matched = new Map();
    for (const b of past) {
      const sig = pastSig(b);
      const idx = matched.get(sig) || 0;
      matched.set(sig, idx + 1);
      if (idx < (seenPastCounts.get(sig) || 0)) continue;
      const t = typeof teamById === 'function' ? teamById(b.teamId) : null;
      const nm = t && t.name ? t.name : 'Team';
      const logo = t && typeof crest === 'function' && t.id != null ? crest(t, 'small') : '';
      const subParts = [];
      if (b.label) subParts.push(b.label);
      if (b.stake) subParts.push(fmtMoney(b.stake) + ' × ' + Number(b.odds || 0).toFixed(2));
      const sub = subParts.join(' · ');
      if (b.won) {
        betToastQueue.push({
          cls: 'win', col: '#7ee787', logo,
          head: 'BET WON · ' + nm, amt: '+' + fmtMoney(b.returned || 0), sub,
          plain: 'Bet WON (' + nm + '): +' + fmtMoney(b.returned || 0) + (sub ? ' · ' + sub : ''),
        });
      } else if (b.returned) {
        betToastQueue.push({
          cls: 'void', col: '#ffd166', logo,
          head: 'BET VOID · ' + nm, amt: fmtMoney(b.returned) + ' back', sub,
          plain: 'Bet VOID (' + nm + '): ' + fmtMoney(b.returned) + ' returned',
        });
      } else {
        betToastQueue.push({
          cls: 'loss', col: '#ffa198', logo,
          head: 'BET LOST · ' + nm, amt: '-' + fmtMoney(b.stake || 0), sub,
          plain: 'Bet LOST (' + nm + '): -' + fmtMoney(b.stake || 0) + (sub ? ' · ' + sub : ''),
        });
      }
    }
    seenPastCounts = curCounts;
    if (betToastQueue.length) drainBetQueue();
  }

  function checkAutoNotice() {
    if (typeof S === 'undefined' || !S || !S.career) {
      lastSaveKey = null;
      lastSeenSeq = 0;
      return;
    }
    const key = String(S.saveId || S.career.leagueName || 'career');
    const c = S.career.careerPlus || S.career.jnyMod;
    const notice = c && c.lastNotice;
    const seq = notice && notice.seq ? notice.seq : 0;
    if (lastSaveKey !== key) {
      lastSaveKey = key;
      lastSeenSeq = seq;
      return;
    }
    if (seq > lastSeenSeq && notice && notice.msg) {
      lastSeenSeq = seq;
      const allowAuto = getPref('ntf_auto', true) && (!getPref('ntf_simOnly', false) || (typeof simToRunning === 'function' && simToRunning()));
      if (!allowAuto) return;
      const isPeak = notice.kind === 'peak';
      enqueueNotice({
        cls: isPeak ? 'peak' : 'auto',
        col: isPeak ? '#ffd166' : '#7ee787',
        logo: clubLogo(),
        head: isPeak ? 'POTENTIAL PEAK REACHED' : 'AUTO-TRAINING',
        amt: isPeak ? 'MAX POT' : 'COMPLETED',
        sub: notice.msg,
        plain: notice.msg,
      });
    }
  }

  let cpSubTab = 'all';

  function prefToggleHtml(key, title, desc, defVal) {
    const on = getPref(key, defVal);
    return '<label class="cp-tog-row">'
      + '<div class="cp-tog-info"><div class="cp-tog-name">' + esc(title) + '</div><div class="cp-tog-desc">' + esc(desc) + '</div></div>'
      + '<input type="checkbox" data-cp-pref="' + esc(key) + '" ' + (on ? 'checked' : '') + '>'
      + '</label>';
  }

  function cfgToggleHtml(key, title, desc, val) {
    return '<label class="cp-tog-row">'
      + '<div class="cp-tog-info"><div class="cp-tog-name">' + esc(title) + '</div><div class="cp-tog-desc">' + esc(desc) + '</div></div>'
      + '<input type="checkbox" data-cp-cfg="' + esc(key) + '" ' + (val ? 'checked' : '') + '>'
      + '</label>';
  }

  function pageHtml() {
    if (typeof S === 'undefined' || !S || !S.career) {
      return '<div class="panel cp-box"><div class="cp-hd"><h3>RL Career+</h3><button class="cp-btn ghost" data-cp-act="close-tab">Close</button></div><p>Load a Manager Career save to configure Auto-Training, Notifications, Visuals and Career Mods.</p></div>';
    }
    const cfg = getCfg();
    const tr = S.training || {};
    const allEdit = allEditablePlayers();
    const players = squadPlayers();
    if (!allEdit.some((p) => p.id === selectedPid)) selectedPid = allEdit[0] ? allEdit[0].id : null;
    const curP = allEdit.find((p) => p.id === selectedPid);
    const team = (S.career.teams || []).find((t) => t.id === S.career.userTeamId);
    const ratVal = curP ? (curP.ratingExact != null ? Number(curP.ratingExact.toFixed(2)) : curP.rating) : 70;
    const cdText = tr.ready ? 'Ready on next advance/sim' : ('Cooldown: ' + (tr.daysLeft ?? '--') + ' day(s) left');
    const curDate = typeof fmtDate === 'function' && S.career.currentDate ? fmtDate(S.career.currentDate) : (S.career.currentDate || '');
    const logo = clubLogo();
    const yCur = getYTheme();
    const pron = getPronouns();
    const subTabs = [
      ['all', 'All Controls'],
      ['auto', 'Automation'],
      ['notify', 'Notifications'],
      ['visuals', 'Visuals & Theme'],
      ['mod', 'Club & Squad'],
    ];

    const autoCard = `
      <div class="panel cp-box">
        <div class="cp-hd">
          <h3>Training &amp; Automation <span class="cp-badge ${cfg.autoTrain ? '' : 'off'}">${cfg.autoTrain ? 'ON' : 'OFF'}</span></h3>
          <button class="cp-btn ${cfg.autoTrain ? 'amber' : 'green'}" data-cp-act="toggle">${cfg.autoTrain ? 'Disable' : 'Enable'}</button>
        </div>
        <div class="cp-tog-list">
          ${cfgToggleHtml('autoTrain', 'Auto-Train on Advance & Sim', 'Automatically runs queued weekly training sessions when days pass.', cfg.autoTrain)}
          ${cfgToggleHtml('autoFill', 'Smart Auto-Fill Slots', 'Automatically assigns best eligible squad players into empty slots.', cfg.autoFill)}
          ${cfgToggleHtml('skipCapped', 'Skip Players at Potential Peak', 'Prevents wasted slots on players who already hit max potential.', cfg.skipCapped)}
        </div>
        <div class="cp-meta">
          Status: <b style="color:#7ee787">${cdText}</b><br>
          Sessions auto-run: <b style="color:#38e2ff">${cfg.sessions}</b>${cfg.lastAutoDate ? ' &middot; Last: <b>' + esc(cfg.lastAutoDate) + '</b>' : ''}
          ${cfg.lastNotice ? '<br>Last notice: <b style="color:#ffd166">' + esc(cfg.lastNotice.msg) + '</b>' : ''}
        </div>
      </div>`;

    const notifyCard = `
      <div class="panel cp-box ntf">
        <div class="cp-hd">
          <h3>Notifications &amp; Popups</h3>
          <div style="display:flex;gap:6px">
            <button class="cp-btn green" data-cp-act="ntf-all" style="padding:5px 9px;font-size:10.5px">All On</button>
            <button class="cp-btn red" data-cp-act="ntf-none" style="padding:5px 9px;font-size:10.5px">Mute All</button>
          </div>
        </div>
        <div class="cp-tog-list">
          ${prefToggleHtml('ntf_mail', 'Inbox Mail Popups', 'Show toast alerts when new unread emails arrive.', true)}
          ${prefToggleHtml('ntf_chat', 'Player Chat Popups', 'Show toast alerts when squad players send a new chat message.', true)}
          ${prefToggleHtml('ntf_bet', 'Betting Result Popups', 'Show won/void/lost payout notifications.', true)}
          ${prefToggleHtml('ntf_auto', 'Auto-Train & Peak Popups', 'Show auto-training completion & max potential notices.', true)}
          ${prefToggleHtml('ntf_simOnly', 'Popups Only During Season Sim', 'Suppress popups on day-by-day play and only pop while simming.', false)}
        </div>
      </div>`;

    const visualsCard = `
      <div class="panel cp-box vis">
        <div class="cp-hd">
          <h3>Visuals &amp; Interface</h3>
        </div>
        <div class="cp-sec-h">UI Theme &amp; Social Pronouns</div>
        <div class="cp-row">
          <button class="cp-btn ${getTheme() === 'careerplus' ? 'cyan' : 'ghost'}" data-cp-act="theme-cp">Career+ Dark UI</button>
          <button class="cp-btn ${getTheme() === 'default' ? 'amber' : 'ghost'}" data-cp-act="theme-def">Default Beta UI</button>
          <button class="cp-btn ${pron === 'he' ? 'cyan' : 'ghost'}" data-cp-pron="he">He / Him</button>
          <button class="cp-btn ${pron === 'she' ? 'cyan' : 'ghost'}" data-cp-pron="she">She / Her</button>
        </div>
        <div class="cp-sec-h">Y Feed Accent Palette</div>
        <div class="cp-swatch-row">
          <button class="cp-swatch-btn ${yCur === 'none' ? 'on' : ''}" data-cp-ytheme="none"><span class="cp-swatch-dot" style="background:#38e2ff"></span>Default</button>
          ${Y_THEMES.map((yt) => '<button class="cp-swatch-btn ' + (yCur === yt.id ? 'on' : '') + '" data-cp-ytheme="' + yt.id + '"><span class="cp-swatch-dot" style="background:' + yt.acc + '"></span>' + esc(yt.name) + '</button>').join('')}
        </div>
        <div class="cp-sec-h">Overlays &amp; Effects</div>
        <div class="cp-tog-list">
          ${prefToggleHtml('vis_intro', 'Play RLCS Launch Intro', 'Play the RLCS Majors & Worlds highlight reel when launching RL Career+.', true)}
          ${prefToggleHtml('vis_bg', 'Rotating Stadium Wallpapers', 'Show blurred Rocket League stadium backdrops behind menus.', true)}
          ${prefToggleHtml('vis_glint', 'Tier Card Shimmer Animations', 'Animate silver, gold, and 90+ elite training slot borders & glints.', true)}
          ${prefToggleHtml('vis_inlineBar', 'Training Quick-Bar', 'Show the compact RL Career+ quick-toggle strip inside Training.', true)}
        </div>
      </div>`;

    const natPlayers = nationalPlayers();
    const natName = (S.intl && S.intl.national && S.intl.national.nation) || 'National Team';
    const clubOptsHtml = players.map((p) => `<option value="${p.id}" ${p.id === selectedPid ? 'selected' : ''}>${esc(p.name)} (OVR ${p.rating} / POT ${p.potential})</option>`).join('');
    const natOptsHtml = natPlayers.map((p) => `<option value="${p.id}" ${p.id === selectedPid ? 'selected' : ''}>${esc(p.name)} (OVR ${p.rating} / POT ${p.potential})</option>`).join('');

    const modCard = `
      <div class="panel cp-box mod">
        <div class="cp-hd">
          <h3>Club &amp; Squad Editor</h3>
          <span style="font-size:13px;color:#7ee787;font-weight:900">${fmtMoney((team && team.budget) || 0)}</span>
        </div>
        <div class="cp-sec-h">Club Budget (${esc(team ? team.name : 'Club')})</div>
        <div class="cp-row">
          <button class="cp-btn red" data-cp-act="sub-500k">-$500k</button>
          <button class="cp-btn green" data-cp-act="add-500k">+$500k</button>
          <button class="cp-btn cyan" data-cp-act="add-5m">+$5M</button>
          <input type="number" id="cp-budget-val" class="cp-in" value="${(team && team.budget) || 0}" style="width:125px">
          <button class="cp-btn amber" data-cp-act="set-budget">Set</button>
        </div>
        <div class="cp-sec-h" style="margin-top:12px">Squad Player Editor</div>
        <div class="cp-row">
          <select id="cp-pid" class="cp-in" style="flex:1">
            ${natPlayers.length
              ? `<optgroup label="Club Squad (${esc(team ? team.name : 'Club')})">${clubOptsHtml}</optgroup><optgroup label="National Team (${esc(natName)})">${natOptsHtml}</optgroup>`
              : clubOptsHtml}
          </select>
        </div>
        ${curP ? `
        <div class="cp-grid">
          <label class="cp-fld">Rating<input type="number" id="cp-p-rat" class="cp-in" min="40" max="99" step="0.1" value="${ratVal}"></label>
          <label class="cp-fld">Potential<input type="number" id="cp-p-pot" class="cp-in" min="40" max="99" value="${curP.potential}"></label>
          <label class="cp-fld">Morale<input type="number" id="cp-p-mor" class="cp-in" min="0" max="100" value="${Math.round(curP.morale ?? 80)}"></label>
          <label class="cp-fld">Form<input type="number" id="cp-p-frm" class="cp-in" min="-5" max="5" value="${curP.form ?? 0}"></label>
          <label class="cp-fld">Age<input type="number" id="cp-p-age" class="cp-in" min="14" max="45" value="${curP.age ?? 20}"></label>
        </div>
        <div class="cp-row" style="margin-top:10px;justify-content:space-between">
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button class="cp-btn ghost" data-cp-act="p-ovr1" style="padding:6px 9px;font-size:11px">+1 OVR</button>
            <button class="cp-btn ghost" data-cp-act="p-maxpot" style="padding:6px 9px;font-size:11px">Max POT 99</button>
            <button class="cp-btn ghost" data-cp-act="p-morale" style="padding:6px 9px;font-size:11px">100 Morale</button>
          </div>
          <button class="cp-btn cyan" data-cp-act="save-player">Apply Player Edit</button>
        </div>` : '<div class="cp-meta">No squad players found.</div>'}
        <div class="cp-sec-h" style="margin-top:14px">In-Game Career Title</div>
        ${titleSelectorHtml(null, team, true)}
      </div>`;

    let cards = '';
    if (cpSubTab === 'auto') cards = autoCard;
    else if (cpSubTab === 'notify') cards = notifyCard;
    else if (cpSubTab === 'visuals') cards = visualsCard;
    else if (cpSubTab === 'mod') cards = modCard;
    else cards = autoCard + notifyCard + visualsCard + modCard;

    return `
      <div class="cp-wrap">
        <div class="cp-hero">
          <div class="cp-hero-left">
            ${logo}
            <div>
              <div class="cp-hero-title">RL Career+ Control Center</div>
              <div class="cp-hero-sub">
                <span>${esc(team ? team.name : 'Manager Career')}</span>
                ${curDate ? '<span class="cp-hero-pill">' + esc(curDate) + '</span>' : ''}
                <span class="cp-hero-pill">${fmtMoney((team && team.budget) || 0)}</span>
              </div>
            </div>
          </div>
          <div class="cp-subtabs">
            ${subTabs.map(([id, lbl]) => '<button type="button" class="cp-subtab ' + (cpSubTab === id ? 'on' : '') + '" data-cp-subtab="' + id + '">' + lbl + '</button>').join('')}
            <button type="button" class="cp-btn red" data-cp-act="reset-prefs" style="padding:7px 11px;font-size:11px">Reset Defaults</button>
            <button type="button" class="cp-btn ghost" data-cp-act="close-tab">&larr; Home</button>
          </div>
        </div>
        <div class="cp-page ${cpSubTab !== 'all' ? 'single' : ''}">${cards}</div>
      </div>`;
  }

  function titleGlowClass(titleId, text) {
    const id = String(titleId || '').toLowerCase();
    const tx = String(text || '').toLowerCase();
    if (!tx) return 'none';
    // FIFAe World Cup / ESL / CRL / DreamHack titles use Golden Glow; all RLCS titles (Contender -> World Champion) use RLCS Blue Glow
    if (tx.includes('world cup') || id.includes('esl') || id.includes('crl') || id.includes('dreamhack')) return 'gold';
    return 'rlcs';
  }

  function titleSelectorHtml(playerObj, teamObj, compact) {
    const td = (typeof S !== 'undefined' && S && S.cpTitles) || { selected: '', activeDisplay: '', activeId: '', list: [] };
    const list = Array.isArray(td.list) ? td.list : [];
    const c = (typeof S !== 'undefined' && S && S.career) || null;
    const me = playerObj || (c && (c.players || []).find((x) => x && (x.isUser || x.id === c.userPlayerId))) || null;
    const tm = teamObj || (c && (c.teams || []).find((x) => x && x.id === c.userTeamId)) || null;
    const picked = td.selected ? list.find((t) => t.key === td.selected) : null;
    const activeText = (picked && picked.display) || td.activeDisplay || (list[0] && list[0].display) || '';
    const activeId = (picked && picked.id) || td.activeId || (list[0] && list[0].id) || '';
    const glow = titleGlowClass(activeId, activeText);
    const av = me && typeof faceHtml === 'function'
      ? faceHtml(me.name, me.id, '')
      : (tm && typeof crest === 'function' ? crest(tm, 'small') : '');
    const pName = (me && me.name) || 'Player';
    const tName = (tm && tm.name) || 'TEAM';
    const preview = '<div class="cp-rlsb">'
      + '<div class="cp-rlsb-hd"><span class="cp-rlsb-team">' + esc(tName.toUpperCase()) + '</span><span>SCORE</span><span>GOALS</span><span>ASSISTS</span><span>SAVES</span><span>SHOTS</span><span>PING</span></div>'
      + '<div class="cp-rlsb-row">'
      + '<div class="cp-rlsb-who"><div class="cp-rlsb-av">' + av + '</div>'
      + '<div class="cp-rlsb-id"><div class="cp-rlsb-name">' + esc(pName) + '</div>'
      + '<div class="cp-rlsb-title ' + glow + '" data-cp-live-title>' + esc(activeText ? activeText.toUpperCase() : 'NO TITLE EARNED YET') + '</div></div></div>'
      + '<div class="cp-rlsb-num">482</div><div class="cp-rlsb-num">2</div><div class="cp-rlsb-num">1</div><div class="cp-rlsb-num">3</div><div class="cp-rlsb-num">4</div>'
      + '<div class="cp-rlsb-ping"><i style="height:4px"></i><i style="height:6px"></i><i style="height:8px"></i><i style="height:10px"></i><span style="margin-left:2px">0</span></div>'
      + '</div></div>';
    if (!list.length) {
      return '<div class="cp-tcard"><div class="cp-tcard-top"><span class="cp-tcard-h">In-Game Title Preview</span><span class="cp-tcard-sub">Earned in Career</span></div>'
        + preview + '<div class="cp-tcard-sub">Compete in or win RLCS Opens, Majors, Worlds, or the World Cup to unlock titles.</div></div>';
    }
    const opts = '<option value=""' + (!td.selected ? ' selected' : '') + '>Auto (Highest Earned)</option>'
      + list.map((t) => '<option value="' + esc(t.key) + '" data-tid="' + esc(t.id || '') + '"' + (td.selected === t.key ? ' selected' : '') + '>' + esc(t.display) + '</option>').join('');
    return '<div class="cp-tcard">'
      + '<div class="cp-tcard-top"><span class="cp-tcard-h">In-Game Title' + (compact ? '' : ' &amp; Live Preview') + '</span>'
      + '<span class="cp-tcard-sub">' + list.length + ' earned in this career</span></div>'
      + preview
      + '<select class="cp-tcard-sel" data-cp-title-sel="1">' + opts + '</select>'
      + '</div>';
  }

  if (typeof playerModalHtml === 'function') {
    const origPlayerModal = playerModalHtml;
    playerModalHtml = function (p) {
      let h = origPlayerModal.apply(this, arguments);
      if (!p || !p.isUser) return h;
      // When current season has 0 games played yet, show career totals in the stat chips instead of all zeros
      const ss = p.season || p.seasonStats || {};
      const cs = p.career || p.careerStats || {};
      const sGames = Number(ss.games) || 0;
      const totGames = sGames + (Number(cs.games) || 0);
      if (sGames === 0 && totGames > 0) {
        const totals = [
          ['Games', totGames],
          ['Goals', (Number(ss.goals) || 0) + (Number(cs.goals) || 0)],
          ['Assists', (Number(ss.assists) || 0) + (Number(cs.assists) || 0)],
          ['Saves', (Number(ss.saves) || 0) + (Number(cs.saves) || 0)],
          ['MVPs', (Number(ss.mvps) || 0) + (Number(cs.mvps) || 0)],
        ];
        for (const [lbl, val] of totals) {
          const re = new RegExp('<div class="chip"><div class="v">0<\\/div><div class="k">' + lbl + '<\\/div><\\/div>', 'i');
          h = h.replace(re, '<div class="chip"><div class="v">' + val + '</div><div class="k">' + lbl + ' (Career)</div></div>');
        }
      }
      const tm = typeof teamById === 'function' && p.teamId >= 0 ? teamById(p.teamId) : null;
      const card = titleSelectorHtml(p, tm, false);
      const m = h.match(/<div class="btnrow\b/);
      if (m && m.index != null) return h.slice(0, m.index) + card + h.slice(m.index);
      return h.replace(/<\/div>\s*$/, card + '</div>');
    };
  }

  if (typeof topbarHtml === 'function' && typeof tabInnerHtml === 'function') {
    const origTop = topbarHtml;
    topbarHtml = function () {
      let h = origTop.apply(this, arguments);
      h = h.replace('<div class="ident-wrap">', '<div class="ident-wrap" data-cp-open-me="1" title="Click to view your stats &amp; select your in-game title">');
      if (typeof isPlayerMode === 'function' && isPlayerMode()) return h;
      const cfg = getCfg();
      const dot = '<span class="cp-badge ' + (cfg.autoTrain ? '' : 'off') + '">' + (cfg.autoTrain ? 'ON' : 'OFF') + '</span>';
      return h.replace(/<button[^>]*data-tab="setup"[^>]*>[\s\S]*?<\/button>/, (m) =>
        m + '<button class="' + (tab === 'careerplus' ? 'active' : '') + '" data-action="tab" data-tab="careerplus" style="color:#38e2ff;text-shadow:0 1px 2px rgba(0,0,0,.95)">Career+ ' + dot + '</button>'
      );
    };

    const origInner = tabInnerHtml;
    tabInnerHtml = function () {
      if (tab !== 'careerplus') return origInner.apply(this, arguments);
      if (typeof isPlayerMode === 'function' && isPlayerMode()) { tab = 'home'; return origInner.apply(this, arguments); }
      return pageHtml();
    };
  }

  if (typeof trainingTileHtml === 'function') {
    const origTile = trainingTileHtml;
    trainingTileHtml = function () {
      const h = origTile.apply(this, arguments);
      if (typeof isPlayerMode === 'function' && isPlayerMode()) return h;
      const cfg = getCfg();
      const tag = '<span class="cp-badge ' + (cfg.autoTrain ? '' : 'off') + '">Auto-Train ' + (cfg.autoTrain ? 'ON' : 'OFF') + '</span>';
      return h.replace(/(<div class="tile-desc">[\s\S]*?)(<\/div>)/, (_, a, b) => a + ' ' + tag + b);
    };
  }

  function oddHtml(val, prev) {
    const n = Number(val) || 1;
    const cls = prev != null && n !== prev ? (n < prev ? 'down' : 'up') : (n < 2 ? 'down' : 'up');
    const arr = cls === 'down' ? '&#9660;' : '&#9650;';
    return '<span class="cp-odd ' + cls + '">' + arr + ' ' + n.toFixed(2) + '</span>';
  }

  const oddsSeen = {};
  if (typeof facilitiesTileHtml === 'function' && typeof contentTileHtml === 'function') {
    facilitiesTileHtml = function () {
      const book = typeof facilityBook === 'function' ? facilityBook() : { tier: 0, list: [] };
      if (!book.list || !book.list.length) return '';
      const owned = book.list.filter((f) => f.owned).sort((a, b) => (b.tier || 0) - (a.tier || 0));
      const cur = owned[0] || book.list.find((f) => f.tier === book.tier) || book.list[0];
      const tier = cur ? cur.tier : 1;
      const pill = book.tier > 0
        ? '<span class="cp-off-pill own">TIER ' + tier + ' &middot; YOUR HQ</span>'
        : '<span class="cp-off-pill">NO HQ &middot; TIER ' + tier + '</span>';
      const floorText = cur.floor >= 0 ? '0 Floor' : '-' + Number(cur.loss || 0).toFixed(2) + ' Loss';
      const body = '<div class="cp-off-list">'
        + '<div class="cp-off-head"><span style="color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(cur.name) + '</span>' + pill + '</div>'
        + '<div class="cp-off-fac">'
        + '<div class="cp-off-fac-img"><img src="art/facilities/hq-' + tier + '.jpg" alt="' + esc(cur.name) + '"></div>'
        + '<div class="cp-off-fac-foot"><div class="cp-off-pills">'
        + '<span class="cp-off-stat">x' + (cur.train || 1) + ' Train</span>'
        + '<span class="cp-off-stat">' + floorText + '</span>'
        + '<span class="cp-off-stat">+' + (cur.mood || 0) + '/d Mood</span>'
        + '</div></div></div></div>';
      return contentTileHtml({
        title: tl('Facilities'),
        cls: 'clickable facilities',
        attrs: ' data-action="see-all" data-key="facilities" role="button" tabindex="0"',
        body,
      });
    };
  }

  if (typeof betsTileHtml === 'function' && typeof contentTileHtml === 'function') {
    betsTileHtml = function () {
      const book = typeof betBook === 'function' ? betBook() : { cards: [], open: [], profit: 0 };
      const cards = book.cards || [];
      const openList = book.open || [];
      const matches = cards.filter((c) => c.kind === 'match');
      const pl = book.profit || 0;
      const plText = pl === 0 ? 'Even season' : (pl > 0 ? '+' : '-') + fmtMoney(Math.abs(pl));
      const plCol = pl > 0 ? '#7ee787' : pl < 0 ? '#ffa198' : '#7ee8fa';
      const stakeBy = {};
      const placedHtml = openList.map((b) => {
        const bt = typeof teamById === 'function' ? (teamById(b.teamId) || {}) : {};
        const bLogo = typeof crest === 'function' && bt.id != null ? crest(bt, 'small') : '';
        const k = (b.kind || '') + ':' + (b.ref ?? '') + ':' + b.teamId;
        stakeBy[k] = (stakeBy[k] || 0) + (Number(b.stake) || 0);
        return '<div class="cp-bet-placed">'
          + '<div class="cp-bet-line"><div class="cp-bet-side">' + bLogo + '<span class="cp-bet-nm">' + esc(bt.name || bt.abbrev || '?') + '</span></div>'
          + '<span class="cp-bet-tag">' + fmtMoney(b.stake || 0) + ' &times; ' + Number(b.odds || 0).toFixed(2) + '</span></div>'
          + (b.label ? '<div style="font-size:10px;color:#dbe7f5;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(b.label) + '</div>' : '')
          + '</div>';
      }).join('');
      let rows = matches.map((m) => {
        const ht = typeof teamById === 'function' ? (teamById(m.homeId) || {}) : {};
        const at = typeof teamById === 'function' ? (teamById(m.awayId) || {}) : {};
        const k = 'match:' + m.ref;
        const hOdd = m.odds && m.odds[m.homeId];
        const aOdd = m.odds && m.odds[m.awayId];
        const prev = oddsSeen[k];
        const hLogo = typeof crest === 'function' && ht.id != null ? crest(ht, 'small') : '';
        const aLogo = typeof crest === 'function' && at.id != null ? crest(at, 'small') : '';
        const hStake = stakeBy[k + ':' + m.homeId];
        const aStake = stakeBy[k + ':' + m.awayId];
        const hOut = (hStake ? '<span class="cp-bet-tag">' + fmtMoney(hStake) + '</span>' : '') + oddHtml(hOdd, prev && prev[m.homeId]);
        const aOut = (aStake ? '<span class="cp-bet-tag">' + fmtMoney(aStake) + '</span>' : '') + oddHtml(aOdd, prev && prev[m.awayId]);
        oddsSeen[k] = { [m.homeId]: Number(hOdd), [m.awayId]: Number(aOdd) };
        return '<div class="cp-bet-row">'
          + '<div class="cp-bet-line"><div class="cp-bet-side">' + hLogo + '<span class="cp-bet-nm">' + esc(ht.name || ht.abbrev || '?') + '</span></div>' + hOut + '</div>'
          + '<div class="cp-bet-line"><div class="cp-bet-side">' + aLogo + '<span class="cp-bet-nm">' + esc(at.name || at.abbrev || '?') + '</span></div>' + aOut + '</div>'
          + '</div>';
      }).join('');
      if (!rows && !placedHtml) {
        const out = cards[0];
        if (out && out.field && out.field.length && typeof teamById === 'function') {
          const fav = teamById(out.field[0]) || {};
          const fLogo = typeof crest === 'function' && fav.id != null ? crest(fav, 'small') : '';
          rows = '<div class="cp-bet-row">'
            + '<div style="font-size:10px;color:#7ee8fa;font-weight:700">' + esc(out.name || 'Outright Favorite') + '</div>'
            + '<div class="cp-bet-line"><div class="cp-bet-side">' + fLogo + '<span class="cp-bet-nm">' + esc(fav.name || '') + '</span></div>' + oddHtml(out.odds && out.odds[fav.id]) + '</div></div>';
        } else {
          rows = '<div class="cp-mo-empty" style="min-height:76px"><div style="font-size:20px">&#128200;</div><div><div class="cp-mo-top">No live odds posted today</div><div class="cp-mo-sub">Advance to matchdays to unlock live odds</div></div></div>';
        }
      }
      const openN = openList.length;
      const body = '<div class="cp-off-list">'
        + '<div class="cp-off-head"><span>' + (matches.length ? matches.length + ' Match Market' + (matches.length > 1 ? 's' : '') : 'Live Sportsbook') + (openN ? ' &middot; <span style="color:#ffd166">' + openN + ' Placed</span>' : '') + '</span><span style="color:' + plCol + '">' + esc(plText) + '</span></div>'
        + '<div class="cp-mo-scroll">' + placedHtml + rows + '</div></div>';
      return contentTileHtml({
        title: tl('Betting'),
        cls: 'clickable',
        attrs: ' data-action="see-all" data-key="bets" role="button" tabindex="0"',
        body,
      });
    };
  }

  if (typeof mediaTileHtml === 'function' && typeof contentTileHtml === 'function') {
    mediaTileHtml = function () {
      const list = typeof mediaOffers === 'function' ? mediaOffers() : [];
      let body = '';
      if (list.length) {
        const today = typeof C === 'function' && C() ? C().currentDate : null;
        let activeN = 0, cdN = 0, availN = 0;
        const rowsHtml = list.map((o) => {
          const mark = typeof brandMarkHtml === 'function' ? brandMarkHtml(o) : '<div class="mo-mark"><span>' + esc(o.brandName || 'BRAND') + '</span></div>';
          const p = typeof playerById === 'function' ? playerById(o.pid) : null;
          const v = p && typeof viewOf === 'function' ? viewOf(p.id) : {};
          const busy = o.available === false || !!(v && v.absent);
          const onCd = !o.accepted && !busy && !!o.freeOn;
          let stTxt, stCol, bCol;
          if (o.accepted) {
            activeN++;
            const leftTxt = typeof mediaLeftText === 'function' ? mediaLeftText(o) : '';
            stTxt = 'ACTIVE' + (leftTxt ? ' &middot; ' + esc(leftTxt) : '');
            stCol = '#7ee787';
            bCol = '#56d364';
          } else if (busy) {
            cdN++;
            stTxt = 'Away &middot; ' + esc((typeof mediaDaysLeft === 'function' ? mediaDaysLeft(o) : 1) + 'd offer');
            stCol = '#9fb0c4';
            bCol = '#6b7d93';
          } else if (onCd) {
            cdN++;
            const cdDays = typeof daysBetween === 'function' && today ? Math.max(1, daysBetween(o.freeOn, today)) : null;
            const freeStr = typeof fmtDateShort === 'function' ? fmtDateShort(o.freeOn) : o.freeOn;
            stTxt = 'Cooldown &middot; ' + (cdDays ? cdDays + 'd (' + esc(freeStr) + ')' : 'free ' + esc(freeStr));
            stCol = '#ffa198';
            bCol = '#ff7b72';
          } else {
            availN++;
            const dLeft = typeof mediaDaysLeft === 'function' ? mediaDaysLeft(o) : 1;
            stTxt = 'Available &middot; ' + dLeft + 'd left';
            stCol = '#ffd166';
            bCol = '#38e2ff';
          }
          return '<div class="cp-mo-row" style="padding:5px 7px;border-left-color:' + bCol + '">' + mark
            + '<div class="cp-mo-info"><div class="cp-mo-top">' + esc(o.brandName || 'Sponsor') + '</div>'
            + '<div class="cp-mo-sub">' + esc((o.playerName || 'Player') + ' · ' + (o.kind === 'campaign' ? 'Campaign' : 'Appearance')) + '</div></div>'
            + '<div class="cp-mo-fee">+' + fmtMoney(o.fee || 0) + '<div style="font-size:9.5px;color:' + stCol + '">' + stTxt + '</div></div>'
            + '</div>';
        }).join('');
        const parts = [];
        if (activeN) parts.push(activeN + ' Active');
        if (cdN) parts.push(cdN + ' Cooldown');
        if (availN) parts.push(availN + ' Available');
        body = '<div class="cp-off-list">'
          + '<div class="cp-off-head"><span>' + parts.join(' &middot; ') + '</span><span style="color:#38e2ff">Press &amp; Sponsors</span></div>'
          + '<div class="cp-mo-scroll">' + rowsHtml + '</div></div>';
      } else {
        const club = typeof C === 'function' && typeof teamById === 'function' ? (teamById(C().userTeamId) || {}) : {};
        const cLogo = typeof crest === 'function' && club.id != null ? crest(club, 'small') : '<span style="font-size:22px">&#127897;</span>';
        const spon = (typeof S !== 'undefined' && S && S.sponsor) ? fmtMoney(S.sponsor) + ' / season' : 'No available offers today';
        body = '<div class="cp-mo-empty">' + cLogo
          + '<div><div class="cp-mo-top">Media &amp; Press Desk</div>'
          + '<div class="cp-mo-sub">Sponsor deals &amp; player promos appear here</div>'
          + '<div class="cp-off-pills"><span class="cp-off-stat" style="color:#7ee787">' + esc(spon) + '</span></div></div></div>';
      }
      return contentTileHtml({
        title: tl('Media offers'),
        cls: 'clickable',
        attrs: ' data-action="see-all" data-key="media" role="button" tabindex="0"',
        body,
      });
    };
  }

  function cpWindowStatus() {
    const e = typeof S !== 'undefined' && S && S.econ ? S.econ : null;
    const w = e ? e.window : null;
    const c = typeof S !== 'undefined' && S ? S.career : null;
    if (w && w.open) return { state: 'open', cls: 'good', days: 0 };
    let next = w && w.nextOpens ? w.nextOpens : null;
    if (!next && e && Array.isArray(e.windows) && c && c.currentDate) {
      const up = e.windows.filter((x) => x && x.from && x.from > c.currentDate).sort((a, b) => a.from.localeCompare(b.from))[0];
      if (up) next = up.from;
    }
    let days = null;
    if (next && c && c.currentDate && typeof daysBetween === 'function') {
      days = daysBetween(next, c.currentDate);
    }
    if (days != null && days >= 0 && days <= 14) return { state: 'soon', cls: 'warn', days };
    return { state: 'shut', cls: 'bad', days };
  }
  if (typeof windowBannerHtml === 'function') {
    const origWinBanner = windowBannerHtml;
    windowBannerHtml = function () {
      const h = origWinBanner.apply(this, arguments);
      const st = cpWindowStatus();
      return st.state === 'soon' ? h.replace('<div class="win-banner">', '<div class="win-banner soon">') : h;
    };
  }
  if (typeof topbarHtml === 'function') {
    const origTopbarHtml = topbarHtml;
    topbarHtml = function () {
      const h = origTopbarHtml.apply(this, arguments);
      const st = cpWindowStatus();
      return st.state === 'soon' ? h.replace('class="win-closed"', 'class="win-closed soon"') : h;
    };
  }

  if (typeof seriesSimHtml === 'function') {
    const origSeriesSimHtml = seriesSimHtml;
    seriesSimHtml = function () {
      const h = origSeriesSimHtml.apply(this, arguments);
      if (!h.includes('data-action="ss-sim"') || h.includes('data-action="cp-sim-series"')) return h;
      const busy = !!(typeof seriesSim !== 'undefined' && seriesSim && seriesSim.busy);
      const icon = typeof HEX_SIM !== 'undefined' ? HEX_SIM : '&#9654;&#9654;';
      const fullBtn = typeof mpTileHtml === 'function'
        ? mpTileHtml({ label: 'Sim full series', icon, action: 'cp-sim-series', disabled: busy })
        : '<button class="mp-tile" data-action="cp-sim-series"' + (busy ? ' disabled' : '') + '><span>Sim full series</span></button>';
      return h.replace(/(?=<button[^>]*data-action="big-close")/, fullBtn);
    };
  }

  if (typeof advanceCardHtml === 'function') {
    const origAdvanceCardHtml = advanceCardHtml;
    advanceCardHtml = function () {
      const h = origAdvanceCardHtml.apply(this, arguments);
      const c = typeof S !== 'undefined' && S && S.career ? S.career : null;
      if (!c) return h;
      const fix = typeof nextUserFixture === 'function' ? nextUserFixture() : null;
      const ev = typeof liveEvent === 'function' && liveEvent() ? liveEvent() : (typeof nextEvent === 'function' ? nextEvent() : null);
      let nextTxt = 'Calendar clear · No upcoming fixtures yet';
      if (fix && typeof teamById === 'function' && typeof sideOf === 'function') {
        const me = sideOf(fix);
        const opp = teamById(fix.homeId === me ? fix.awayId : fix.homeId);
        const d = typeof daysBetween === 'function' && fix.date && c.currentDate ? daysBetween(fix.date, c.currentDate) : null;
        const when = d == null ? '' : d <= 0 ? 'Today' : d === 1 ? 'Tomorrow' : 'in ' + d + 'd';
        nextTxt = 'Next Match: <b>vs ' + esc(opp ? opp.name : 'TBD') + '</b>' + (when ? ' (' + when + ')' : '');
      } else if (ev && ev.name) {
        const d = typeof daysBetween === 'function' && ev.startDate && c.currentDate ? daysBetween(ev.startDate, c.currentDate) : null;
        nextTxt = (ev.stage && ev.stage !== 'upcoming' ? 'Active Event: <b>' : 'Upcoming: <b>') + esc(ev.name) + '</b>'
          + (d != null && d > 0 ? ' (in ' + d + 'd)' : ev.roundLabel ? ' · ' + esc(ev.roundLabel) : '');
      }
      const ws = cpWindowStatus();
      const winLbl = ws.state === 'open' ? 'Window: OPEN' : ws.state === 'soon' ? 'Window: Opens in ' + ws.days + 'd' : 'Window: SHUT';
      const tr = typeof S !== 'undefined' && S ? S.training : null;
      const trTxt = tr && tr.ready ? 'Training: Ready' : 'Training: ' + (tr && tr.daysLeft != null ? tr.daysLeft + 'd' : '--');
      const unread = (c.inbox || []).filter((m) => m && m.unread).length;
      const running = typeof autoAdvance !== 'undefined' && autoAdvance;
      const cta = running ? 'Auto-Advancing · Click to Pause' : 'Click to Advance Day';
      const brief = '<div class="cp-adv-brief">'
        + '<div class="cp-adv-top"><span>' + nextTxt + '</span><span class="cp-adv-cta">' + cta + '</span></div>'
        + '<div class="cp-adv-pills">'
        + '<span class="cp-adv-pill ' + ws.cls + '">' + winLbl + '</span>'
        + '<span class="cp-adv-pill ' + (tr && tr.ready ? 'good' : 'cyan') + '">' + esc(trTxt) + '</span>'
        + (unread ? '<span class="cp-adv-pill warn">' + unread + ' Unread Mail</span>' : '')
        + (typeof fmtMoney === 'function' && typeof teamById === 'function' && teamById(c.userTeamId)
            ? '<span class="cp-adv-pill">Budget: ' + fmtMoney(teamById(c.userTeamId).budget || 0) + '</span>' : '')
        + '</div></div>';
      const tail = '</div>\n  </div>';
      const idx = h.lastIndexOf(tail);
      return idx !== -1 ? h.slice(0, idx) + brief + h.slice(idx) : h;
    };
  }

  let inPostRender = 0;
  if (typeof postHtml === 'function') {
    const origPostHtml = postHtml;
    postHtml = function () {
      inPostRender++;
      try { return origPostHtml.apply(this, arguments); } finally { inPostRender--; }
    };
  }
  if (typeof linkifyPost === 'function') {
    const origLinkify = linkifyPost;
    linkifyPost = function (txt) {
      return origLinkify.call(this, inPostRender > 0 ? swapPronouns(txt) : txt);
    };
  }
  if (typeof socialsHtml === 'function') {
    const origSocials = socialsHtml;
    socialsHtml = function () {
      const h = origSocials.apply(this, arguments);
      const p = getPronouns();
      const bar = '<div class="cp-pro-bar"><span class="cp-pro-lbl">Pronouns</span><div class="cp-seg">'
        + '<button type="button" class="cp-btn ' + (p === 'he' ? 'cyan' : 'ghost') + '" data-cp-pron="he" style="padding:4px 9px;font-size:10.5px">He / Him</button>'
        + '<button type="button" class="cp-btn ' + (p === 'she' ? 'cyan' : 'ghost') + '" data-cp-pron="she" style="padding:4px 9px;font-size:10.5px">She / Her</button>'
        + '</div></div>';
      const idx = h.indexOf('<div class="me-bio');
      return idx !== -1 ? h.slice(0, idx) + bar + h.slice(idx) : h;
    };
  }

  if (typeof xCustomizeHtml === 'function') {
    const origXCustom = xCustomizeHtml;
    xCustomizeHtml = function () {
      let h = origXCustom.apply(this, arguments);
      const cur = getYTheme();
      const pron = getPronouns();
      if (cur && cur !== 'none') h = h.replace(/class="xs-pick on"/g, 'class="xs-pick"');
      const extra = '<div class="xs-panel-h" style="margin-top:8px">Career+ Themes</div>'
        + Y_THEMES.map((yt) => '<button class="xs-pick' + (cur === yt.id ? ' on' : '') + '" data-cp-ytheme="' + yt.id + '">'
          + '<span class="xs-pick-swatch" style="background:linear-gradient(135deg,' + yt.bg + ' 55%,' + yt.acc + ' 100%);border:2px solid ' + yt.acc + '"></span>'
          + '<span class="xs-pick-text"><span class="xs-pick-name">' + esc(yt.name) + '</span>'
          + '<span class="xs-pick-note">' + esc(yt.desc) + '</span></span></button>').join('')
        + '<div class="xs-panel-h" style="margin-top:8px">Your Pronouns (Posts)</div>'
        + '<button class="xs-pick' + (pron === 'he' ? ' on' : '') + '" data-cp-pron="he">'
        + '<span class="xs-pick-swatch" style="background:#0d3b4d;border:2px solid #38e2ff;display:grid;place-items:center;font:800 12px/1 sans-serif;color:#fff">HE</span>'
        + '<span class="xs-pick-text"><span class="xs-pick-name">He / Him</span><span class="xs-pick-note">Use he, him, his in Socials &amp; Y tweets.</span></span></button>'
        + '<button class="xs-pick' + (pron === 'she' ? ' on' : '') + '" data-cp-pron="she">'
        + '<span class="xs-pick-swatch" style="background:#3a194d;border:2px solid #e879f9;display:grid;place-items:center;font:800 12px/1 sans-serif;color:#fff">SHE</span>'
        + '<span class="xs-pick-text"><span class="xs-pick-name">She / Her</span><span class="xs-pick-note">Use she, her, hers in Socials &amp; Y tweets.</span></span></button>';
      return h.replace('<div class="xs-panel-note">', extra + '<div class="xs-panel-note">');
    };
  }

  let lastBgSave = null;
  let lastMatchCnt = 0;

  function checkMatchBgRotate() {
    if (typeof S === 'undefined' || !S || !S.career) {
      lastBgSave = null;
      lastMatchCnt = 0;
      return;
    }
    const key = String(S.saveId || S.career.leagueName || 'career');
    const c = S.career;
    const cnt = (c.fixtures || []).filter((f) => f && f.played).length
      + (c.events || []).reduce((n, e) => n + ((e.matches || []).filter((m) => m && (m.done || m.played || m.winnerId != null)).length), 0);
    if (lastBgSave !== key) {
      lastBgSave = key;
      lastMatchCnt = cnt;
      return;
    }
    if (cnt > lastMatchCnt) {
      lastMatchCnt = cnt;
      rotateBgs();
    }
  }

  if (typeof render === 'function') {
    const origRender = render;
    render = function () {
      const out = origRender.apply(this, arguments);
      checkAutoNotice();
      checkBetNotices();
      checkMailChatNotices();
      checkMatchBgRotate();
      return out;
    };
  }

  document.addEventListener('change', async (e) => {
    const t = e.target;
    if (!t) return;
    if (t.id === 'cp-pid') {
      selectedPid = Number(t.value);
      if (typeof render === 'function') render();
      return;
    }
    if (t.dataset && t.dataset.cpTitleSel) {
      const val = String(t.value || '');
      const opt = t.options && t.selectedIndex >= 0 ? t.options[t.selectedIndex] : null;
      const td = (typeof S !== 'undefined' && S && S.cpTitles) || { list: [] };
      const chosen = val ? (td.list || []).find((x) => x.key === val) : null;
      const liveText = chosen ? chosen.display : (td.list && td.list[0] ? td.list[0].display : '');
      const liveId = chosen ? chosen.id : (td.list && td.list[0] ? td.list[0].id : '');
      const card = t.closest && t.closest('.cp-tcard');
      const liveEl = card && card.querySelector('[data-cp-live-title]');
      if (liveEl) {
        liveEl.textContent = liveText ? liveText.toUpperCase() : 'NO TITLE EARNED YET';
        liveEl.className = 'cp-rlsb-title ' + titleGlowClass(liveId, liveText);
      }
      const lbl = opt ? opt.textContent : 'Auto';
      await sendCmd({ op: 'set-title', key: val }, () => ({
        cls: 'win', col: '#ffd166', logo: clubLogo(),
        head: 'IN-GAME TITLE', amt: val ? 'EQUIPPED' : 'AUTO',
        sub: liveText || lbl,
        plain: 'In-game title set to ' + (liveText || lbl),
      }));
      // Sync live preview after state refresh in case Auto picked vanilla best
      const td2 = (typeof S !== 'undefined' && S && S.cpTitles) || null;
      if (liveEl && td2) {
        const p2 = td2.selected ? (td2.list || []).find((x) => x.key === td2.selected) : null;
        const txt2 = (p2 && p2.display) || td2.activeDisplay || liveText;
        const id2 = (p2 && p2.id) || td2.activeId || liveId;
        liveEl.textContent = txt2 ? txt2.toUpperCase() : 'NO TITLE EARNED YET';
        liveEl.className = 'cp-rlsb-title ' + titleGlowClass(id2, txt2);
      }
      return;
    }
    const prefKey = t.dataset && t.dataset.cpPref;
    if (prefKey) {
      setPref(prefKey, t.checked);
      if (prefKey === 'vis_intro') await sendCmd({ op: 'pref', playIntro: t.checked });
      ensureTrainingBar();
      if (typeof render === 'function') render();
      return;
    }
    const key = t.dataset && t.dataset.cpCfg;
    if (!key) return;
    await sendCmd({ op: 'cfg', [key]: t.checked });
  }, true);

  document.addEventListener('click', async (e) => {
    const sfs = e.target && e.target.closest && e.target.closest('[data-action="cp-sim-series"]');
    if (sfs && typeof seriesSim !== 'undefined' && seriesSim && window.hub && typeof window.hub.simNextGame === 'function') {
      if (seriesSim.busy || (typeof ssRunLive === 'function' && ssRunLive())) return;
      e.stopImmediatePropagation();
      const fxId = seriesSim.fxId;
      seriesSim.busy = true;
      if (typeof renderWindows === 'function') renderWindows();
      try {
        let doneFx = null;
        for (let i = 0; i < 9; i++) {
          const res = await window.hub.simNextGame(fxId);
          if (!seriesSim || seriesSim.fxId !== fxId) return;
          if (!res || res.ok === false) {
            if (typeof showToast === 'function') showToast((res && res.error) || 'Could not simulate series.', 'error');
            break;
          }
          if (typeof S !== 'undefined') S = res;
          doneFx = typeof seriesSimFixture === 'function' ? seriesSimFixture() : null;
          if (!doneFx || doneFx.played) break;
        }
        if (doneFx && doneFx.played && typeof openFullTime === 'function') {
          if (typeof stopSeriesSimFrame === 'function') stopSeriesSimFrame();
          seriesSim = null;
          openFullTime(fxId);
          return;
        }
      } finally {
        if (seriesSim && seriesSim.fxId === fxId) seriesSim.busy = false;
        if (typeof stopSeriesSimFrame === 'function') stopSeriesSimFrame();
        if (seriesSim && typeof render === 'function') render();
      }
      return;
    }
    const sp = e.target && e.target.closest && e.target.closest('[data-action="search-pick"]');
    if (sp && typeof searchPick !== 'undefined' && typeof searchDetailHtml === 'function' && typeof playerById === 'function') {
      const scr = sp.closest && sp.closest('.search-screen');
      const pane = scr && scr.querySelector && scr.querySelector('.tb-dark .tb-scroll');
      if (pane) {
        e.stopImmediatePropagation();
        const pid = parseInt(sp.dataset.pid, 10);
        searchPick = pid;
        const prev = scr.querySelector('.sr-card.on');
        if (prev && prev !== sp) prev.classList.remove('on');
        sp.classList.add('on');
        pane.innerHTML = searchDetailHtml(playerById(pid));
        return;
      }
    }
    const pBtn = e.target && e.target.closest && e.target.closest('[data-cp-pron]');
    if (pBtn) {
      e.stopImmediatePropagation();
      const val = pBtn.dataset.cpPron === 'she' ? 'she' : 'he';
      try { localStorage.setItem('cp_pronouns', val); } catch {}
      if (typeof render === 'function') render();
      showRichToast({
        cls: 'player', col: val === 'she' ? '#f0abfc' : '#7ee8fa', logo: clubLogo(),
        head: 'SOCIALS PRONOUNS', amt: val === 'she' ? 'SHE / HER' : 'HE / HIM',
        sub: 'Tweets in Socials & Y updated automatically',
        plain: 'Pronouns set to ' + (val === 'she' ? 'She / Her' : 'He / Him'),
      });
      return;
    }
    const xd = e.target && e.target.closest && e.target.closest('[data-action="x-dark"]');
    if (xd) {
      try { localStorage.setItem('cp_y_theme', 'none'); } catch {}
      applyYTheme();
      return;
    }
    const yBtn = e.target && e.target.closest && e.target.closest('[data-cp-ytheme]');
    if (yBtn) {
      e.stopImmediatePropagation();
      const id = yBtn.dataset.cpYtheme;
      try { localStorage.setItem('cp_y_theme', id); } catch {}
      applyYTheme();
      if (typeof render === 'function') render();
      const yt = Y_THEMES.find((x) => x.id === id);
      if (yt) {
        showRichToast({
          cls: 'auto', col: yt.acc, logo: clubLogo(),
          head: 'Y APPEARANCE', amt: yt.name.toUpperCase(),
          sub: yt.desc, plain: 'Y theme set to ' + yt.name,
        });
      }
      return;
    }
    const meBadge = e.target && e.target.closest && e.target.closest('[data-cp-open-me]');
    if (meBadge) {
      e.stopImmediatePropagation();
      const c = typeof S !== 'undefined' && S && S.career;
      const me = c && ((c.userPlayerId != null && typeof playerById === 'function' && playerById(c.userPlayerId))
        || (c.players || []).find((x) => x && x.isUser));
      if (me && typeof showModal === 'function' && typeof playerModalHtml === 'function') {
        showModal(playerModalHtml(me));
      }
      return;
    }
    const subBtn = e.target && e.target.closest && e.target.closest('[data-cp-subtab]');
    if (subBtn) {
      e.stopImmediatePropagation();
      cpSubTab = subBtn.dataset.cpSubtab || 'all';
      if (typeof render === 'function') render();
      return;
    }
    const btn = e.target && e.target.closest && e.target.closest('[data-cp-act],[data-cp-inline]');
    if (!btn) return;
    e.stopImmediatePropagation();
    const act = btn.dataset.cpAct || btn.dataset.cpInline;
    if (act === 'theme-cp' || act === 'theme-def') {
      const next = act === 'theme-cp' ? 'careerplus' : 'default';
      try { localStorage.setItem('cp_ui_theme', next); } catch {}
      applyUiTheme();
      if (typeof render === 'function') render();
      showRichToast({
        cls: next === 'careerplus' ? 'auto' : 'void', col: next === 'careerplus' ? '#38e2ff' : '#ffd166', logo: clubLogo(),
        head: 'UI APPEARANCE', amt: next === 'careerplus' ? 'CAREER+' : 'DEFAULT GAME',
        sub: next === 'careerplus' ? 'Solid dark esports panels enabled' : 'Restored default Beta 33 styling',
        plain: 'UI style set to ' + next,
      });
    } else if (act === 'ntf-all' || act === 'ntf-none') {
      const on = act === 'ntf-all';
      setPref('ntf_mail', on);
      setPref('ntf_chat', on);
      setPref('ntf_bet', on);
      setPref('ntf_auto', on);
      if (on) setPref('ntf_simOnly', false);
      if (typeof render === 'function') render();
    } else if (act === 'reset-prefs') {
      for (const k of ['ntf_mail', 'ntf_chat', 'ntf_bet', 'ntf_auto', 'vis_intro', 'vis_bg', 'vis_glint', 'vis_inlineBar']) setPref(k, true);
      await sendCmd({ op: 'pref', playIntro: true });
      setPref('ntf_simOnly', false);
      try { localStorage.setItem('cp_ui_theme', 'careerplus'); localStorage.setItem('cp_y_theme', 'none'); localStorage.setItem('cp_pronouns', 'he'); } catch {}
      applyUiTheme(); applyYTheme(); applyPrefs();
      ensureTrainingBar();
      await sendCmd({ op: 'cfg', autoTrain: true, autoFill: true, skipCapped: true }, () => ({
        cls: 'auto', col: '#38e2ff', logo: clubLogo(),
        head: 'DEFAULTS RESTORED', amt: 'ALL RESET',
        sub: 'Automation, notifications & visuals reset to defaults',
        plain: 'Career+ settings reset to defaults',
      }));
    } else if (act === 'toggle') {
      const nextOn = !getCfg().autoTrain;
      await sendCmd({ op: 'cfg', autoTrain: nextOn }, () => ({
        cls: nextOn ? 'win' : 'void', col: nextOn ? '#7ee787' : '#ffd166', logo: clubLogo(),
        head: 'AUTO-TRAINING', amt: nextOn ? 'ENABLED' : 'DISABLED',
        sub: nextOn ? 'Automatic sessions active on advance & sim' : 'Disabled until re-enabled',
        plain: 'Auto-Training ' + (nextOn ? 'Enabled' : 'Disabled'),
      }));
    } else if (act === 'replay-intro') {
      console.log('__CP_REPLAY_INTRO__');
    } else if (act === 'open-tab') {
      dismissOverlays();
      if (typeof tab !== 'undefined') tab = 'careerplus';
      if (typeof render === 'function') render();
    } else if (act === 'close-tab') {
      if (typeof tab !== 'undefined') tab = 'home';
      if (typeof render === 'function') render();
    } else if (act === 'sub-500k') {
      await sendCmd({ op: 'budget', mode: 'add', amount: -500000 }, () => {
        const tm = (typeof S !== 'undefined' && S && S.career && S.career.teams || []).find((x) => x.id === S.career.userTeamId);
        return {
          cls: 'void', col: '#ffd166', logo: clubLogo(),
          head: 'CLUB BUDGET UPDATED', amt: '-$500K',
          sub: 'Balance: ' + fmtMoney(tm ? tm.budget : 0),
          plain: 'Subtracted $500k',
        };
      });
    } else if (act === 'add-500k') {
      await sendCmd({ op: 'budget', mode: 'add', amount: 500000 }, () => {
        const tm = (typeof S !== 'undefined' && S && S.career && S.career.teams || []).find((x) => x.id === S.career.userTeamId);
        return {
          cls: 'win', col: '#7ee787', logo: clubLogo(),
          head: 'CLUB BUDGET UPDATED', amt: '+$500K',
          sub: 'Balance: ' + fmtMoney(tm ? tm.budget : 0),
          plain: 'Added $500k',
        };
      });
    } else if (act === 'add-5m') {
      await sendCmd({ op: 'budget', mode: 'add', amount: 5000000 }, () => {
        const tm = (typeof S !== 'undefined' && S && S.career && S.career.teams || []).find((x) => x.id === S.career.userTeamId);
        return {
          cls: 'win', col: '#7ee787', logo: clubLogo(),
          head: 'CLUB BUDGET UPDATED', amt: '+$5M',
          sub: 'Balance: ' + fmtMoney(tm ? tm.budget : 0),
          plain: 'Added $5M',
        };
      });
    } else if (act === 'set-budget') {
      const amt = Number(document.getElementById('cp-budget-val')?.value);
      await sendCmd({ op: 'budget', mode: 'set', amount: amt }, () => ({
        cls: 'win', col: '#7ee787', logo: clubLogo(),
        head: 'CLUB BUDGET SET', amt: fmtMoney(amt || 0),
        sub: 'Transfer budget updated',
        plain: 'Budget updated',
      }));
    } else if (act === 'p-ovr1' || act === 'p-maxpot' || act === 'p-morale') {
      const pid = Number(document.getElementById('cp-pid')?.value || selectedPid);
      const pl = allEditablePlayers().find((p) => p.id === pid);
      if (pl) {
        const nextRat = act === 'p-ovr1' ? Math.min(99, Number((pl.ratingExact != null ? pl.ratingExact : pl.rating) || 70) + 1) : (pl.ratingExact != null ? pl.ratingExact : pl.rating);
        const nextPot = act === 'p-maxpot' ? 99 : pl.potential;
        const nextMor = act === 'p-morale' ? 100 : Math.round(pl.morale ?? 80);
        await sendCmd({ op: 'player', pid, rating: nextRat, potential: nextPot, morale: nextMor, form: pl.form ?? 0, age: pl.age ?? 20 }, () => ({
          cls: 'player', col: '#d8b4fe', logo: clubLogo(),
          head: 'QUICK EDIT · ' + pl.name,
          amt: act === 'p-ovr1' ? 'OVR ' + Math.round(nextRat) : act === 'p-maxpot' ? 'POT 99' : '100 MORALE',
          sub: 'Ratings & squad profile synced',
          plain: 'Quick edit applied',
        }));
      }
    } else if (act === 'save-player') {
      const pid = Number(document.getElementById('cp-pid')?.value);
      const rat = Number(document.getElementById('cp-p-rat')?.value);
      const pot = Number(document.getElementById('cp-p-pot')?.value);
      const pl = allEditablePlayers().find((p) => p.id === pid);
      await sendCmd({
        op: 'player', pid, rating: rat, potential: pot,
        morale: Number(document.getElementById('cp-p-mor')?.value),
        form: Number(document.getElementById('cp-p-frm')?.value),
        age: Number(document.getElementById('cp-p-age')?.value),
      }, () => ({
        cls: 'player', col: '#d8b4fe', logo: clubLogo(),
        head: 'PLAYER UPDATED · ' + (pl ? pl.name : 'Squad'),
        amt: 'OVR ' + Math.round(rat) + ' / POT ' + Math.round(pot),
        sub: 'Ratings & squad profile synced',
        plain: 'Player updated',
      }));
    }
  }, true);

  function ensureVersionTag() {
    if (typeof document.getElementsByClassName !== 'function') return;
    if (document.getElementsByClassName('cp-ver-label').length) return;
    const g = document.querySelector('.version-label');
    if (!g) return;
    const el = document.createElement('div');
    el.className = 'version-label cp-ver-label' + (g.classList.contains('version-label-frameless') ? ' version-label-frameless' : '');
    el.style.top = '34px';
    el.style.color = '#38e2ff';
    el.textContent = 'RL Career+';
    document.body.appendChild(el);
  }

  const lastTrainTier = {};
  function trainTierFor(r) {
    const n = Number(r);
    return n >= 90 ? 'elite' : n >= 75 ? 'gold' : n >= 60 ? 'silver' : 'bronze';
  }
  function triggerTierUp(tsq, fromTier, toTier) {
    if (!tsq || !tsq.classList) return;
    tsq.dataset.cpFromTier = fromTier;
    tsq.dataset.cpTier = toTier;
    tsq.classList.remove('cp-tier-up');
    try { void tsq.offsetWidth; } catch {}
    tsq.classList.add('cp-tier-up');
    setTimeout(() => { try { tsq.classList.remove('cp-tier-up'); } catch {} }, 1550);
  }
  function syncTrainingTiers(allowAnim) {
    if (typeof document.querySelectorAll !== 'function') return;
    const cards = document.querySelectorAll('.tsq');
    for (let i = 0; i < cards.length; i++) {
      const tsq = cards[i];
      const rate = tsq.querySelector && tsq.querySelector('.tsq-rate[data-pid]');
      if (!rate) continue;
      const pid = rate.dataset && rate.dataset.pid;
      const lo = rate.querySelector && rate.querySelector('.tr-lo');
      const r = lo ? Number(lo.textContent) : NaN;
      if (!Number.isFinite(r)) continue;
      const tier = trainTierFor(r);
      const key = i + ':' + String(pid || '');
      const prev = lastTrainTier[key];
      tsq.dataset.cpTier = tier;
      if (allowAnim && prev && prev !== tier) triggerTierUp(tsq, prev, tier);
      lastTrainTier[key] = tier;
    }
    const opts = document.querySelectorAll('.tsq-optrate');
    for (let j = 0; j < opts.length; j++) {
      const o = opts[j];
      const v = Number(o.textContent);
      if (!Number.isFinite(v)) continue;
      o.classList.remove('cp-opt-bronze', 'cp-opt-silver', 'cp-opt-gold', 'cp-opt-elite');
      o.classList.add('cp-opt-' + trainTierFor(v));
    }
  }
  if (typeof animateTraining === 'function') {
    const origAnimateTraining = animateTraining;
    animateTraining = function () {
      const out = origAnimateTraining.apply(this, arguments);
      if (typeof requestAnimationFrame === 'function') {
        const start = Date.now();
        const step = () => {
          syncTrainingTiers(true);
          if (Date.now() - start < 1500) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      } else {
        syncTrainingTiers(true);
      }
      return out;
    };
  }

  function decorateClubInBlock(html, cls, opp) {
    if (!opp || !opp.name || typeof crest !== 'function') return html;
    const badge = '<span class="cp-inline-club">' + crest(opp, 'small') + '<span>' + esc(opp.name) + '</span></span>';
    const safeName = esc(opp.name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const blockRe = new RegExp('(<div class="' + cls + '"[^>]*>[\\s\\S]*?)(</div>)');
    return html.replace(blockRe, (_, a, b) => a.replace(new RegExp(safeName), badge) + b);
  }

  function oppForSim() {
    if (typeof C !== 'function' || typeof teamById !== 'function' || typeof sideOf !== 'function') return null;
    const c = C();
    if (!c || !c.fixtures) return null;
    const fx = c.fixtures.find((f) => f && !f.played && f.date <= c.currentDate && (f.homeId === sideOf(f) || f.awayId === sideOf(f)));
    return fx ? teamById(fx.homeId === sideOf(fx) ? fx.awayId : fx.homeId) : null;
  }

  if (typeof simPanelHtml === 'function') {
    const origSimPanelHtml = simPanelHtml;
    simPanelHtml = function () {
      const h = origSimPanelHtml.apply(this, arguments);
      return decorateClubInBlock(h, 'sim-next', oppForSim());
    };
  }

  if (typeof dayPanelHtml === 'function') {
    const origDayPanelHtml = dayPanelHtml;
    dayPanelHtml = function (d) {
      const h = origDayPanelHtml.apply(this, arguments);
      if (typeof C !== 'function' || typeof teamById !== 'function' || typeof sideOf !== 'function') return h;
      const c = C();
      const fx = c && (c.fixtures || []).find((f) => f && f.date === d && (f.homeId === sideOf(f) || f.awayId === sideOf(f)));
      const opp = fx ? teamById(fx.homeId === sideOf(fx) ? fx.awayId : fx.homeId) : null;
      return decorateClubInBlock(h, 'tb-sub', opp);
    };
  }

  if (typeof trainingHtml === 'function') {
    const origTrainingHtml = trainingHtml;
    trainingHtml = function () {
      let h = origTrainingHtml.apply(this, arguments);
      if (typeof trainPick === 'undefined' || trainPick == null) return h;
      const natPlayers = nationalPlayers();
      if (!natPlayers.length) return h;
      const tr = typeof S !== 'undefined' && S ? S.training : null;
      const held = (tr && tr.held) || {};
      const team = typeof C === 'function' && C() && typeof teamById === 'function' ? teamById(C().userTeamId) : null;
      const clubName = team && team.name ? team.name : 'Club';
      const natName = (S && S.intl && S.intl.national && S.intl.national.nation) || 'National Team';
      const natBtns = natPlayers.map((p) => {
        const isHeld = held[p.id];
        const title = isHeld && typeof trainHeldText === 'function' ? ' title="' + esc(trainHeldText(isHeld)) + '"' : '';
        const face = typeof faceHtml === 'function' ? faceHtml(p.name, p.id, 'tsq-optface') : '';
        const heldTag = isHeld ? '<span class="tsq-opttag">' + esc(typeof tl === 'function' ? tl('At potential') : 'At potential') + '</span>' : '';
        return '<button class="tsq-opt' + (isHeld ? ' held' : '') + '" data-action="train-set" data-slot="' + trainPick + '" data-pid="' + p.id + '"' + title + '>'
          + face + '<span class="tsq-optname">' + esc(p.name) + '</span>'
          + '<span class="tsq-optrate">' + p.rating + '</span>' + heldTag + '</button>';
      }).join('');
      const natBlock = '<div class="tsq-choose-sec intl">National Team (' + esc(natName) + ')</div><div class="tsq-choose-row cp-nat-row">' + natBtns + '</div>';
      const clubHdr = '<div class="tsq-choose-sec">Club Players (' + esc(clubName) + ')</div>';
      h = h.replace('<div class="tsq-choose-row">', clubHdr + '<div class="tsq-choose-row">');
      return h.replace(/(?=<button[^>]*data-action="train-cancel")/, natBlock);
    };
  }

  function ensureTrainingBar() {
    syncTrainingTiers(true);
    if (typeof document.getElementsByClassName !== 'function') return;
    const tsq = document.getElementsByClassName('tsq-wrap')[0];
    if (!tsq) return;
    const existing = tsq.getElementsByClassName('cp-bar')[0];
    if (!getPref('vis_inlineBar', true)) {
      if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
      return;
    }
    if (existing) return;
    const cfg = getCfg();
    const bar = document.createElement('div');
    bar.className = 'cp-bar';
    bar.innerHTML =
      '<strong style="color:#38e2ff">RL Career+:</strong>' +
      '<span class="cp-badge ' + (cfg.autoTrain ? '' : 'off') + '">' + (cfg.autoTrain ? 'Auto-Train ON' : 'OFF') + '</span>' +
      '<button class="cp-btn ' + (cfg.autoTrain ? 'amber' : 'green') + '" data-cp-inline="toggle">' + (cfg.autoTrain ? 'Disable' : 'Enable') + '</button>' +
      '<button class="cp-btn cyan" data-cp-inline="open-tab">Open Career+ Tab</button>';
    tsq.appendChild(bar);
  }

  function syncSimScreenInPlace() {
    if (typeof document.getElementById !== 'function') return false;
    if (typeof simToRunning !== 'function' || !simToRunning()) return false;
    if (typeof bigList === 'undefined' || bigList !== 'calendar') return false;
    if (typeof officeOpen !== 'undefined' && officeOpen) return false;
    if (typeof standWindowOpen !== 'undefined' && standWindowOpen) return false;
    if (typeof windowJustOpened !== 'undefined' && windowJustOpened) return false;
    if (typeof bigListHtml !== 'function') return false;
    const winEl = document.getElementById('windows');
    if (!winEl || !winEl.querySelector) return false;
    const liveScr = winEl.querySelector('.cal-screen.simming');
    if (!liveScr) return false;
    const liveLight = liveScr.querySelector('.tb-light');
    const liveScroll = liveScr.querySelector('.tb-dark > .tb-scroll');
    if (!liveLight || !liveScroll) return false;

    const tmp = document.createElement('div');
    tmp.innerHTML = bigListHtml();
    const newScr = tmp.querySelector('.cal-screen.simming');
    if (!newScr) return false;
    const newLight = newScr.querySelector('.tb-light');
    const newScroll = newScr.querySelector('.tb-dark > .tb-scroll');
    if (!newLight || !newScroll) return false;

    liveLight.innerHTML = newLight.innerHTML;

    const prevTop = liveScroll.scrollTop || 0;
    const prevHeight = liveScroll.scrollHeight || 0;
    const liveList = liveScroll.querySelector('.sim-list');
    const newList = newScroll.querySelector('.sim-list');
    if (liveList && newList && liveScroll.children.length === newScroll.children.length) {
      for (let i = 0; i < newScroll.children.length; i++) {
        const lc = liveScroll.children[i];
        const nc = newScroll.children[i];
        if (!lc || !nc || lc.className !== nc.className) {
          liveScroll.replaceChildren(...newScroll.childNodes);
          break;
        }
        if (lc.classList && lc.classList.contains('sim-bar')) {
          const lf = lc.querySelector('.sim-fill');
          const nf = nc.querySelector('.sim-fill');
          if (lf && nf && nf.style && lf.style.width !== nf.style.width) lf.style.width = nf.style.width;
        } else if (lc.innerHTML !== nc.innerHTML) {
          lc.innerHTML = nc.innerHTML;
        }
      }
    } else {
      liveScroll.replaceChildren(...newScroll.childNodes);
    }

    if (prevTop > 4) {
      const delta = (liveScroll.scrollHeight || 0) - prevHeight;
      liveScroll.scrollTop = prevTop + (delta > 0 ? delta : 0);
    }

    if (typeof retireReachNote === 'function') retireReachNote();
    if (typeof syncVisibleDmRead === 'function') syncVisibleDmRead();
    if (typeof applyTextDirection === 'function') applyTextDirection(document.body);
    if (typeof applyPanelTheme === 'function') applyPanelTheme();
    if (typeof applyBackground === 'function') applyBackground();
    return true;
  }

  const HOME_SVGS = {
    crest: '<svg viewBox="0 0 24 24" fill="none" stroke="url(#cpG)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><defs><linearGradient id="cpG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#67e8f9"/><stop offset="55%" stop-color="#00d4ff"/><stop offset="100%" stop-color="#c084fc"/></linearGradient></defs><path d="M12 2L4 5.5v6.2c0 5.1 3.4 9.5 8 10.8 4.6-1.3 8-5.7 8-10.8V5.5L12 2z"/><path d="M8.5 11.5L11 14l4.5-5"/></svg>',
    newSave: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 15.2 6.8 18l1-5.8-4.2-4.1 5.8-.8L12 2z"/></svg>',
    loadSave: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 012-2h4.5l2 2H19a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/><path d="M12 11v5m0 0l-2-2m2 2l2-2"/></svg>',
    worlds: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8M3.6 15h16.8M12 3a13 13 0 010 18M12 3a13 13 0 000 18"/></svg>',
    manager: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
    player: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  };
  let homeAnimDone = false;
  function enhanceDoorBtn(html, actAttr, icon, tag, cta) {
    const re = new RegExp('(<button[^>]*' + actAttr + '[^>]*>)([\\s\\S]*?)(<\\/button>)');
    return html.replace(re, (_, open, inner, close) =>
      open + '<span class="cp-door-top"><span class="cp-door-ico">' + icon + '</span><span class="cp-door-tag">' + tag + '</span></span>'
      + '<span class="cp-door-body">' + inner + '</span>'
      + '<span class="cp-door-cta"><span>' + cta + '</span><span class="cp-arr">&rarr;</span></span>' + close
    );
  }
  if (typeof preDoorHtml === 'function') {
    const origPreDoor = preDoorHtml;
    preDoorHtml = function () {
      let h = origPreDoor.apply(this, arguments);
      if (getTheme() !== 'careerplus') return h;
      const animCls = homeAnimDone ? '' : ' cp-anim';
      homeAnimDone = true;
      const nSaves = typeof preSaves !== 'undefined' && Array.isArray(preSaves) ? preSaves.length : null;
      const loadTag = nSaves == null ? 'RESUME' : (nSaves + (nSaves === 1 ? ' SAVE' : ' SAVES'));
      h = h.replace('<div class="pre">', '<div class="pre cp-home' + animCls + '">');
      h = h.replace(/<div class="pre-title">([\s\S]*?)<\/div>/, (_, title) =>
        '<div class="cp-home-hero">'
        + '<div class="cp-home-badge"><span class="cp-home-dot"></span>RL CAREER+ &middot; RLCS 2026</div>'
        + '<div class="cp-home-crest">' + HOME_SVGS.crest + '</div>'
        + '<div class="pre-title">' + title + '</div>'
        + '<div class="cp-home-sub">BUILD YOUR STORY &middot; BE THE NEXT LEGEND</div>'
        + '</div>'
      );
      h = enhanceDoorBtn(h, 'data-action="pre-new"', HOME_SVGS.newSave, 'NEW SEASON', 'START CAREER');
      h = enhanceDoorBtn(h, 'data-action="pre-load"', HOME_SVGS.loadSave, loadTag, 'CONTINUE');
      h = enhanceDoorBtn(h, 'data-action="pre-worlds"', HOME_SVGS.worlds, 'CUSTOM ROSTERS', 'OPEN EDITOR');
      h = h.replace('<div class="pre-foot">', '<div class="pre-foot"><button type="button" class="cp-foot-btn cyan" data-cp-act="replay-intro">&#9654; Watch Intro</button>');
      return h;
    };
  }
  if (typeof preModeHtml === 'function') {
    const origPreMode = preModeHtml;
    preModeHtml = function () {
      let h = origPreMode.apply(this, arguments);
      if (getTheme() !== 'careerplus') return h;
      h = enhanceDoorBtn(h, 'data-mode="manager"', HOME_SVGS.manager, 'COACH &amp; GM', 'TAKE CHARGE');
      h = enhanceDoorBtn(h, 'data-mode="player"', HOME_SVGS.player, 'PRO PLAYER', 'EARN YOUR SPOT');
      return h;
    };
  }
  window.__cpEnterHome = function () {
    homeAnimDone = false;
    if (typeof document.body !== 'undefined' && document.body) {
      const old = document.getElementById('cp-home-curtain');
      if (old && old.parentNode) old.parentNode.removeChild(old);
      const cur = document.createElement('div');
      cur.id = 'cp-home-curtain';
      document.body.appendChild(cur);
      setTimeout(() => { try { if (cur.parentNode) cur.parentNode.removeChild(cur); } catch {} }, 1050);
    }
    if (typeof render === 'function') { try { render(); } catch {} }
  };

  if (typeof render === 'function') {
    const origRender2 = render;
    render = function () {
      const out = origRender2.apply(this, arguments);
      syncMatchIdle();
      ensureVersionTag();
      ensureTrainingBar();
      return out;
    };
  }
  if (typeof renderWindows === 'function') {
    const origRenderWin = renderWindows;
    renderWindows = function () {
      if (syncSimScreenInPlace()) {
        ensureTrainingBar();
        return;
      }
      const out = origRenderWin.apply(this, arguments);
      ensureTrainingBar();
      return out;
    };
  }
  ensureVersionTag();
  ensureTrainingBar();
  if (typeof S !== 'undefined' && S && S.career && !S.cpTitles && window.hub && typeof window.hub.getState === 'function') {
    window.hub.getState().then((ns) => { if (ns && ns.cpTitles) { S = ns; if (typeof render === 'function') render(); } }).catch(() => {});
  }

  try { if (typeof render === 'function') render(); } catch {}
})();

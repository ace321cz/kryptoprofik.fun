
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const safeStore = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ================= Language / i18n ================= */
  const LANG_KEY = 'kp_lang_v1';
  let lang = 'cs';

  const UI = {
    cs: {
      locale: 'cs-CZ', czk: 'Kč',
      title: 'KryptoProfík – Masterclass od A do Z | Kompletní krypto portál',
      desc: 'Nezávislý krypto portál v češtině: peněženky, burzy, detekce podvodů, daně v ČR, živé ceny, kalkulačky, slovník a kvíz.',
      ogTitle: 'KryptoProfík – Masterclass od A do Z',
      ogDesc: 'Peněženky, burzy, anti-scam, daně v ČR, živé ceny a kalkulačky. Zdarma a česky.',
      copy: 'Kopírovat', copied: 'Zkopírováno', qrFail: 'QR se nepodařilo vytvořit. Použijte tlačítko Kopírovat.',
      auditOk: '✅ Základní kontrola prošla', auditMid: '⚠️ Střední riziko – dořešte zbytek', auditBad: '❌ Vysoké riziko',
      waiting: 'Čekám na živé ceny…',
      qStep: (n, t) => 'Otázka ' + n + ' / ' + t, qScore: n => 'Skóre: ' + n, qNext: 'Další', qResultBtn: 'Výsledek', qDone: 'Hotovo',
      qYour: 'Váš výsledek: ',
      qPerfect: 'Perfektní! Jste připraveni na bezpečný start. 🎉',
      qGood: 'Dobrá práce! Zopakujte si lekce, kde jste chybovali.',
      qBad: 'Projděte si znovu moduly 1–4 a zkuste to znovu.',
      qBadgeTitle: 'KryptoProfík – Certifikovaný začátečník',
      qBadgeSub: 'Úspěšně jste splnili certifikační kvíz portálu KryptoProfík.',
      qBadgeDownload: 'Stáhnout certifikát (.txt)',
      fng: { 'Extreme Fear': 'Extrémní strach', 'Fear': 'Strach', 'Neutral': 'Neutrální', 'Greed': 'Chamtivost', 'Extreme Greed': 'Extrémní chamtivost' },
      days: 'dní',
      vol: { low: 'Nízká', med: 'Střední', high: 'Vysoká' }
    },
    en: {
      locale: 'en-US', czk: 'CZK',
      title: 'KryptoProfík – Masterclass from A to Z | Complete crypto portal',
      desc: 'Independent crypto portal: wallets, exchanges, scam detection, Czech taxes, live prices, calculators, glossary and quiz.',
      ogTitle: 'KryptoProfík – Masterclass from A to Z',
      ogDesc: 'Wallets, exchanges, anti-scam, Czech taxes, live prices and calculators. Free.',
      copy: 'Copy', copied: 'Copied', qrFail: 'The QR code could not be created. Use the Copy button.',
      auditOk: '✅ Basic check passed', auditMid: '⚠️ Medium risk – check the rest', auditBad: '❌ High risk',
      waiting: 'Waiting for live prices…',
      qStep: (n, t) => 'Question ' + n + ' / ' + t, qScore: n => 'Score: ' + n, qNext: 'Next', qResultBtn: 'Result', qDone: 'Done',
      qYour: 'Your result: ',
      qPerfect: 'Perfect! You are ready for a safe start. 🎉',
      qGood: 'Good job! Review the lessons where you slipped.',
      qBad: 'Go through modules 1–4 again and give it another try.',
      qBadgeTitle: 'KryptoProfík – Certified Beginner',
      qBadgeSub: 'You passed the KryptoProfík certification quiz.',
      qBadgeDownload: 'Download certificate (.txt)',
      fng: {},
      days: 'days',
      vol: { low: 'Low', med: 'Medium', high: 'High' }
    }
  };
  const U = () => UI[lang];
  const pick = o => o[lang];

  const fmtNum = n => Math.round(n).toLocaleString(U().locale);
  const fmtCzk = n => fmtNum(n) + ' ' + U().czk;

  function applyStatic() {
    const dict = (window.I18N && window.I18N[lang]) || {};
    const cs = (window.I18N && window.I18N.cs) || {};
    $$('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      const v = dict[k] != null ? dict[k] : cs[k];
      if (v != null) el.textContent = v;
    });
    $$('[data-i18n-attr]').forEach(el => {
      let m = {};
      try { m = JSON.parse(el.getAttribute('data-i18n-attr')); } catch (e) {}
      Object.keys(m).forEach(a => {
        const k = m[a];
        const v = dict[k] != null ? dict[k] : cs[k];
        if (v != null) el.setAttribute(a, v);
      });
    });
    document.title = U().title;
    const md = $('meta[name="description"]'); if (md) md.setAttribute('content', U().desc);
    const ot = $('meta[property="og:title"]'); if (ot) ot.setAttribute('content', U().ogTitle);
    const od = $('meta[property="og:description"]'); if (od) od.setAttribute('content', U().ogDesc);
  }

  function paintLangButtons() {
    $$('.lang-btn').forEach(b => {
      const on = b.dataset.lang === lang;
      b.classList.toggle('bg-brand-accent', on);
      b.classList.toggle('text-white', on);
      b.classList.toggle('text-slate-300', !on);
      b.setAttribute('aria-pressed', String(on));
    });
  }

  /* ================= Mobile menu ================= */
  const menuBtn = $('#mobileMenuBtn'), menu = $('#mobileMenu');
  menuBtn.addEventListener('click', () => {
    const open = menu.classList.toggle('hidden') === false;
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  $$('a', menu).forEach(a => a.addEventListener('click', () => { menu.classList.add('hidden'); menuBtn.setAttribute('aria-expanded', 'false'); }));

  /* ================= Progress bar + back to top ================= */
  const bar = $('#progressBar'), toTop = $('#toTop');
  function onScroll() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    toTop.classList.toggle('hidden', h.scrollTop < 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ================= Active nav link ================= */
  const links = $$('.nav-link');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) links.forEach(l => l.classList.toggle('text-brand-accent', l.dataset.target === e.target.id)); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(l => { const t = document.getElementById(l.dataset.target); if (t) io.observe(t); });
  }

  /* ================= Search ================= */
  function handleSearch(query) {
    const q = (query || '').toLowerCase().trim();
    let visible = 0;
    $$('.searchable').forEach(el => {
      const hay = ((el.dataset.keywords || '') + ' ' + el.textContent).toLowerCase();
      const show = !q || hay.includes(q);
      el.style.display = show ? '' : 'none';
      if (show) visible++;
      if (show && q && el.classList.contains('topic-section')) setMod(el, true);
    });
    const nr = $('#noResults'); if (nr) nr.classList.toggle('hidden', visible > 0 || !$('.searchable'));
    if (window.__kpRenderGlobalResults) window.__kpRenderGlobalResults(q);
    if (window.__kpHighlightSearchTitles) window.__kpHighlightSearchTitles(q);
    if (q && visible > 0) {
      const first = $$('.searchable').find(e => e.style.display !== 'none');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  const si = $('#searchInput'), msi = $('#mobileSearchInput');
  si.addEventListener('input', e => { msi.value = e.target.value; handleSearch(e.target.value); });
  msi.addEventListener('input', e => { si.value = e.target.value; handleSearch(e.target.value); });

  /* ================= Live prices ================= */
  const COINS = [
    { id: 'bitcoin',     sym: 'BTC', name: 'Bitcoin',  icon: '<i class="fa-brands fa-bitcoin text-amber-500"></i>' },
    { id: 'ethereum',    sym: 'ETH', name: 'Ethereum', icon: '<i class="fa-brands fa-ethereum text-blue-400"></i>' },
    { id: 'solana',      sym: 'SOL', name: 'Solana',   icon: '<span class="text-purple-400">◎</span>' },
    { id: 'binancecoin', sym: 'BNB', name: 'BNB',      icon: '<i class="fa-solid fa-coins text-amber-400"></i>' },
    { id: 'ripple',      sym: 'XRP', name: 'XRP',      icon: '<i class="fa-solid fa-bolt text-blue-500"></i>' },
    { id: 'cardano',     sym: 'ADA', name: 'Cardano',  icon: '<i class="fa-solid fa-shield text-cyan-400"></i>' }
  ];
  const prices = {};
  let lastUpdate = null, fngState = null, domState = null, pricesFailed = false, mcapState = null, volState = null;
  const cards = $('#heroPriceCards');
  if (cards) cards.innerHTML = COINS.map(c => `
    <div class="p-3 rounded-2xl bg-brand-card border border-brand-border">
      <div class="flex justify-between items-start mb-1">
        <span class="font-extrabold text-xs text-white">${c.icon} ${c.name}</span>
        <span class="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">${c.sym}</span>
      </div>
      <div id="${c.sym}-usd" class="text-base font-black text-white font-mono skeleton">$00000</div>
      <div id="${c.sym}-czk" class="text-[11px] text-slate-400 font-mono mt-1">&nbsp;</div>
      <div class="flex items-center justify-between mt-1">
        <span id="${c.sym}-chg" class="text-[11px] font-bold">&nbsp;</span>
        <span id="${c.sym}-spark" class="shrink-0"></span>
      </div>
    </div>`).join('');

  const cvCoin = $('#cvCoin');
  if (cvCoin) cvCoin.innerHTML = COINS.map(c => `<option value="${c.id}">${c.sym}</option>`).join('');

  const fmtUsd = n => '$' + (n >= 100 ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : n.toLocaleString('en-US', { maximumFractionDigits: 4 }));

  function paintPrices() {
    if (!cards) return;
    COINS.forEach(c => {
      try {
        const d = prices[c.id]; if (!d) return;
        const u = $('#' + c.sym + '-usd');
        if (typeof d.usd === 'number') { u.classList.remove('skeleton'); u.textContent = fmtUsd(d.usd); }
        if (typeof d.czk === 'number') {
          $('#' + c.sym + '-czk').textContent = (d.czk >= 100 ? fmtNum(d.czk) : d.czk.toLocaleString(U().locale, { maximumFractionDigits: 3 })) + ' ' + U().czk;
        }
        const ch = d.usd_24hr_change, ce = $('#' + c.sym + '-chg');
        if (typeof ch === 'number') {
          ce.textContent = (ch >= 0 ? '▲ +' : '▼ ') + ch.toFixed(2).replace('.', lang === 'cs' ? ',' : '.') + ' %';
          ce.className = 'text-[11px] font-bold mt-1 ' + (ch >= 0 ? 'text-emerald-400' : 'text-rose-400');
        }
      } catch (e) {}
    });
    if (lastUpdate) $('#lastUpdate').textContent = lastUpdate.toLocaleTimeString(U().locale, { hour: '2-digit', minute: '2-digit' });
    $('#priceError').classList.toggle('hidden', !pricesFailed);
    paintGainersLosers();
    checkAlerts();
  }

  function fmtBig(n) {
    if (typeof n !== 'number') return '–';
    if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
    return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  function paintGainersLosers() {
    const rows = COINS.map(c => {
      const d = prices[c.id];
      const ch = d && typeof d.usd_24hr_change === 'number' ? d.usd_24hr_change : null;
      return { c, ch };
    }).filter(r => r.ch != null);
    if (!rows.length) return;
    const sorted = rows.slice().sort((a, b) => b.ch - a.ch);
    const gainers = sorted.slice(0, 3), losers = sorted.slice(-3).reverse();
    const row = r => `<div class="flex items-center justify-between text-xs py-1"><span class="font-bold text-white">${r.c.sym}</span><span class="font-bold ${r.ch >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${r.ch >= 0 ? '+' : ''}${r.ch.toFixed(2).replace('.', lang === 'cs' ? ',' : '.')}%</span></div>`;
    const gl = $('#gainersList'), ll = $('#losersList');
    if (gl) gl.innerHTML = gainers.map(row).join('');
    if (ll) ll.innerHTML = losers.map(row).join('');
  }

  function paintPulse() {
    if (domState != null) {
      const domEl = $('#btcDom');
      if (domEl) domEl.textContent = domState === 'n/a' ? 'n/a' : domState.toFixed(1).replace('.', lang === 'cs' ? ',' : '.') + ' %';
      const bar = $('#btcDomBar');
      if (bar) bar.style.width = (domState === 'n/a' ? 0 : Math.min(100, domState)) + '%';
    }
    if (fngState) {
      const fngNum = $('#fngNum'), fngLabel = $('#fngLabel'), fngArc = $('#fngArc');
      if (fngState === 'n/a') {
        if (fngNum) fngNum.textContent = '–';
        if (fngLabel) fngLabel.textContent = 'n/a';
      } else {
        const v = parseInt(fngState.value, 10);
        if (fngNum) fngNum.textContent = String(v);
        if (fngLabel) {
          fngLabel.textContent = U().fng[fngState.cls] || fngState.cls;
          fngLabel.className = 'text-[11px] font-bold ' + (v < 40 ? 'text-rose-400' : v > 60 ? 'text-emerald-400' : 'text-amber-400');
        }
        if (fngArc) {
          const circumference = 138;
          const offset = circumference - (circumference * Math.max(0, Math.min(100, v)) / 100);
          fngArc.setAttribute('stroke-dashoffset', String(offset));
        }
      }
    }
    if (mcapState != null) {
      const mv = $('#mcapValue'), mc = $('#mcapChg');
      if (mv) mv.textContent = mcapState === 'n/a' ? 'n/a' : fmtBig(mcapState.usd);
      if (mc && mcapState !== 'n/a' && typeof mcapState.chg === 'number') {
        mc.textContent = (mcapState.chg >= 0 ? '▲ +' : '▼ ') + mcapState.chg.toFixed(2).replace('.', lang === 'cs' ? ',' : '.') + ' %';
        mc.className = 'text-[11px] font-bold mt-1 ' + (mcapState.chg >= 0 ? 'text-emerald-400' : 'text-rose-400');
      }
    }
    if (volState != null) {
      const vv = $('#volValue');
      if (vv) vv.textContent = volState === 'n/a' ? 'n/a' : fmtBig(volState);
    }
  }

  /* ================= Sparklines ================= */
  function renderSparkline(points) {
    if (!Array.isArray(points) || points.length < 2) return '';
    const w = 56, h = 20;
    const min = Math.min.apply(null, points), max = Math.max.apply(null, points);
    const range = (max - min) || 1;
    const step = w / (points.length - 1);
    const path = points.map((p, i) => (i * step).toFixed(1) + ',' + (h - ((p - min) / range) * h).toFixed(1)).join(' ');
    const up = points[points.length - 1] >= points[0];
    const color = up ? '#34d399' : '#fb7185';
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '"><polyline points="' + path + '" fill="none" stroke="' + color + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  const sparkData = {};
  function paintSparklines() {
    COINS.forEach(c => {
      const el = $('#' + c.sym + '-spark');
      if (el && sparkData[c.id]) el.innerHTML = renderSparkline(sparkData[c.id]);
    });
  }

  /* ================= Bitcoin halving countdown ================= */
  function paintHalving() {
    const LAST_HALVING = new Date('2024-04-20T00:09:26Z');
    const NEXT_HALVING_EST = new Date('2028-04-17T00:00:00Z');
    const now = new Date();
    const totalMs = NEXT_HALVING_EST - LAST_HALVING;
    const elapsedMs = now - LAST_HALVING;
    const pct = Math.max(0, Math.min(100, (elapsedMs / totalMs) * 100));
    const msLeft = Math.max(0, NEXT_HALVING_EST - now);
    const daysLeft = Math.ceil(msLeft / 86400000);
    const bar = $('#halvingBar'); if (bar) bar.style.width = pct.toFixed(1) + '%';
    const daysEl = $('#halvingDays');
    if (daysEl) daysEl.textContent = daysLeft.toLocaleString(U().locale) + ' ' + U().days;
    const dateEl = $('#halvingDate');
    if (dateEl) dateEl.textContent = '~' + NEXT_HALVING_EST.toLocaleDateString(U().locale, { year: 'numeric', month: 'long' });
  }

  /* ================= Watchlist (localStorage only) ================= */
  const WL_KEY = 'kp_watchlist_v1';
  function wlGet() { try { return JSON.parse(localStorage.getItem(WL_KEY) || '[]'); } catch (e) { return []; } }
  function wlSet(arr) { try { localStorage.setItem(WL_KEY, JSON.stringify(arr)); } catch (e) {} }
  function wlToggle(id) {
    const arr = wlGet();
    const i = arr.indexOf(id);
    if (i === -1) arr.push(id); else arr.splice(i, 1);
    wlSet(arr);
    paintTop20();
  }

  /* ================= Price alerts (localStorage + browser Notification API) ================= */
  const AL_KEY = 'kp_alerts_v1';
  function alGet() { try { return JSON.parse(localStorage.getItem(AL_KEY) || '[]'); } catch (e) { return []; } }
  function alSet(arr) { try { localStorage.setItem(AL_KEY, JSON.stringify(arr)); } catch (e) {} }
  function alAdd(id, symbol, currentPrice) {
    const msg = lang === 'cs' ? 'Při jaké ceně (USD) tě má ' + symbol + ' upozornit?' : 'At what price (USD) should ' + symbol + ' alert you?';
    const raw = window.prompt(msg, currentPrice ? currentPrice.toFixed(2) : '');
    const target = parseFloat(raw);
    if (!target || target <= 0) return;
    const dir = currentPrice != null && target >= currentPrice ? 'above' : 'below';
    const arr = alGet();
    arr.push({ id: id, symbol: symbol, target: target, dir: dir, createdAt: Date.now() });
    alSet(arr);
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    paintAlerts();
  }
  function alRemove(idx) {
    const arr = alGet(); arr.splice(idx, 1); alSet(arr); paintAlerts();
  }
  function paintAlerts() {
    const panel = $('#alertsPanel'), list = $('#alertsList');
    if (!panel || !list) return;
    const arr = alGet();
    panel.classList.toggle('hidden', !arr.length);
    list.innerHTML = arr.map((a, i) => {
      const dirLabel = a.dir === 'above' ? '≥' : '≤';
      return '<div class="flex items-center justify-between text-xs py-1.5">' +
        '<span class="text-slate-300"><b class="text-white">' + a.symbol + '</b> ' + dirLabel + ' $' + a.target.toLocaleString('en-US') + '</span>' +
        '<button type="button" class="alertDel text-slate-500 hover:text-rose-400 transition" data-i="' + i + '"><i class="fa-solid fa-xmark"></i></button>' +
        '</div>';
    }).join(arr.length ? '' : '<p class="text-[11px] text-slate-500">' + (lang === 'cs' ? 'Zatím nemáš žádná upozornění.' : "You don't have any alerts yet.") + '</p>');
    $$('.alertDel', list).forEach(btn => btn.addEventListener('click', () => alRemove(parseInt(btn.dataset.i, 10))));
  }
  function checkAlerts() {
    const arr = alGet();
    if (!arr.length) return;
    let changed = false;
    const remaining = arr.filter(a => {
      const d = prices[a.id];
      let p = d && typeof d.usd === 'number' ? d.usd : null;
      if (p == null) {
        const m = top20Data.find(x => x.id === a.id);
        if (m && typeof m.current_price === 'number') p = m.current_price;
      }
      if (p == null) return true;
      const hit = a.dir === 'above' ? p >= a.target : p <= a.target;
      if (hit) {
        changed = true;
        try {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('KryptoProfík', { body: a.symbol + ' ' + (a.dir === 'above' ? 'dosáhl' : 'kleslo na') + ' $' + a.target.toLocaleString('en-US'), icon: 'icon-192.png' });
          }
        } catch (e) {}
        return false;
      }
      return true;
    });
    if (changed) { alSet(remaining); paintAlerts(); }
  }
  window.kpCheckAlerts = checkAlerts;

  /* ================= Volatility badge (from 7-day sparkline) ================= */
  function volatilityBadge(points) {
    if (!Array.isArray(points) || points.length < 3) return '';
    const mean = points.reduce((s, p) => s + p, 0) / points.length;
    if (!mean) return '';
    const variance = points.reduce((s, p) => s + Math.pow(p - mean, 2), 0) / points.length;
    const cv = (Math.sqrt(variance) / mean) * 100;
    let label, cls;
    if (cv < 3) { label = U().vol.low; cls = 'bg-emerald-500/15 text-emerald-400'; }
    else if (cv < 7) { label = U().vol.med; cls = 'bg-amber-500/15 text-amber-400'; }
    else { label = U().vol.high; cls = 'bg-rose-500/15 text-rose-400'; }
    return '<span class="px-1.5 py-0.5 rounded-md text-[10px] font-bold ' + cls + '">' + label + '</span>';
  }

  /* ================= Top 20 ranking table ================= */
  let top20Data = [];
  let top20Sort = { key: 'rank', dir: 1 };
  function paintTop20() {
    const body = $('#top20Body'); if (!body || !top20Data.length) return;
    const watchOnly = $('#top20WatchOnly') && $('#top20WatchOnly').checked;
    const wl = wlGet();
    let rows = top20Data.slice();
    if (watchOnly) rows = rows.filter(r => wl.indexOf(r.id) !== -1);
    rows.sort((a, b) => {
      const k = top20Sort.key;
      const av = k === 'rank' ? a.market_cap_rank : k === 'name' ? a.symbol : k === 'price' ? a.current_price : k === 'chg24' ? a.price_change_percentage_24h : a.market_cap;
      const bv = k === 'rank' ? b.market_cap_rank : k === 'name' ? b.symbol : k === 'price' ? b.current_price : k === 'chg24' ? b.price_change_percentage_24h : b.market_cap;
      return ((av || 0) > (bv || 0) ? 1 : -1) * top20Sort.dir;
    });
    body.innerHTML = rows.map(r => {
      const ch = typeof r.price_change_percentage_24h === 'number' ? r.price_change_percentage_24h : null;
      const sparkPoints = r.sparkline_in_7d && r.sparkline_in_7d.price;
      const spark = sparkPoints ? renderSparkline(sparkPoints) : '';
      const vol = sparkPoints ? volatilityBadge(sparkPoints) : '';
      const starred = wl.indexOf(r.id) !== -1;
      return '<tr class="border-b border-brand-border/60">' +
        '<td class="py-2 pr-1"><button type="button" class="wlStar text-xs ' + (starred ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400') + ' transition" data-id="' + r.id + '"><i class="fa-' + (starred ? 'solid' : 'regular') + ' fa-star"></i></button></td>' +
        '<td class="py-2 pr-2 text-slate-500">' + r.market_cap_rank + '</td>' +
        '<td class="py-2 pr-2 font-bold text-white">' + r.symbol.toUpperCase() + '<span class="text-slate-500 font-normal ml-1 hidden sm:inline">' + r.name + '</span></td>' +
        '<td class="py-2 pr-2 text-right font-mono text-white">' + fmtUsd(r.current_price) + '</td>' +
        '<td class="py-2 pr-2 text-right font-bold ' + (ch >= 0 ? 'text-emerald-400' : 'text-rose-400') + '">' + (ch == null ? '–' : (ch >= 0 ? '+' : '') + ch.toFixed(2).replace('.', lang === 'cs' ? ',' : '.') + '%') + '</td>' +
        '<td class="py-2 pr-2 text-center hidden sm:table-cell">' + vol + '</td>' +
        '<td class="py-2 pr-2 text-center hidden sm:table-cell">' + spark + '</td>' +
        '<td class="py-2 pr-2 text-right text-slate-300">' + fmtBig(r.market_cap) + '</td>' +
        '<td class="py-2 pl-2 text-right"><button type="button" class="alertBell text-slate-600 hover:text-brand-accent transition" data-id="' + r.id + '" data-sym="' + r.symbol.toUpperCase() + '" data-price="' + r.current_price + '"><i class="fa-solid fa-bell"></i></button></td>' +
        '</tr>';
    }).join('');
    $$('.wlStar', body).forEach(btn => btn.addEventListener('click', () => wlToggle(btn.dataset.id)));
    $$('.alertBell', body).forEach(btn => btn.addEventListener('click', () => alAdd(btn.dataset.id, btn.dataset.sym, parseFloat(btn.dataset.price))));
    paintAlerts();
  }

  async function fetchMarkets() {
    try {
      const m = await fetchJson('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h');
      if (Array.isArray(m)) {
        top20Data = m;
        m.forEach(row => {
          const match = COINS.find(c => c.id === row.id);
          if (match && row.sparkline_in_7d && Array.isArray(row.sparkline_in_7d.price)) {
            sparkData[match.id] = row.sparkline_in_7d.price;
          }
        });
        paintSparklines();
        paintTop20();
      }
    } catch (e) {}
  }

  async function fetchJson(url) {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 8000);
    try { const r = await fetch(url, { signal: ctrl.signal }); if (!r.ok) throw new Error(r.status); return await r.json(); }
    finally { clearTimeout(t); }
  }

  /* ================= Trending coins (CoinGecko /search/trending) ================= */
  async function fetchTrending() {
    try {
      const data = await fetchJson('https://api.coingecko.com/api/v3/search/trending');
      const items = data && Array.isArray(data.coins) ? data.coins.slice(0, 7) : [];
      const wrap = $('#trendingWrap'), list = $('#trendingList');
      if (!wrap || !list) return;
      if (!items.length) { wrap.classList.add('hidden'); return; }
      list.innerHTML = items.map(({ item }) => {
        const sym = (item.symbol || '').toUpperCase();
        const rank = item.market_cap_rank;
        return '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-brand-border text-[11px] font-bold text-slate-200">' +
          '<span class="text-brand-amber">#' + (rank || '–') + '</span> ' + (item.name || sym) + ' <span class="text-slate-500">' + sym + '</span></span>';
      }).join('');
      wrap.classList.remove('hidden');
    } catch (e) {}
  }

  async function fetchPrices() {
    try {
      const ids = COINS.map(c => c.id).join(',');
      const data = await fetchJson('https://api.coingecko.com/api/v3/simple/price?ids=' + ids + '&vs_currencies=usd,czk&include_24hr_change=true');
      COINS.forEach(c => { if (data[c.id]) prices[c.id] = data[c.id]; });
      lastUpdate = new Date(); pricesFailed = false;
      paintPrices(); updateConverter();
    } catch (e) {
      pricesFailed = true;
      if (cards) $$('.skeleton', cards).forEach(el => { el.classList.remove('skeleton'); el.textContent = '–'; });
      paintPrices();
    }
  }

  async function fetchPulse() {
    try {
      const g = await fetchJson('https://api.coingecko.com/api/v3/global');
      const dom = g && g.data && g.data.market_cap_percentage && g.data.market_cap_percentage.btc;
      domState = dom ? dom : 'n/a';
      const mcapUsd = g && g.data && g.data.total_market_cap && g.data.total_market_cap.usd;
      const mcapChg = g && g.data && g.data.market_cap_change_percentage_24h_usd;
      mcapState = typeof mcapUsd === 'number' ? { usd: mcapUsd, chg: mcapChg } : 'n/a';
      const vol = g && g.data && g.data.total_volume && g.data.total_volume.usd;
      volState = typeof vol === 'number' ? vol : 'n/a';
    } catch (e) { domState = 'n/a'; mcapState = 'n/a'; volState = 'n/a'; }
    try {
      const f = await fetchJson('https://api.alternative.me/fng/?limit=1');
      const d = f && f.data && f.data[0];
      fngState = d ? { value: d.value, cls: d.value_classification } : 'n/a';
    } catch (e) { fngState = 'n/a'; }
    paintPulse();
  }

  /* ================= Converter ================= */
  function updateConverter() {
    if (!cvCoin) return;
    const amt = parseFloat($('#cvAmount').value) || 0;
    const id = cvCoin.value, dir = $('#cvDir').value, p = prices[id];
    const out = $('#cvResult'), rate = $('#cvRate');
    if (!p) { out.textContent = '–'; rate.textContent = U().waiting; return; }
    const sym = COINS.find(c => c.id === id).sym;
    if (dir === 'czk2coin') out.textContent = (amt / p.czk).toLocaleString(U().locale, { maximumFractionDigits: 6 }) + ' ' + sym;
    else out.textContent = fmtCzk(amt * p.czk);
    rate.textContent = '1 ' + sym + ' ≈ ' + fmtCzk(p.czk);
  }
  ['cvAmount', 'cvCoin', 'cvDir'].forEach(i => { const el = $('#' + i); if (el) el.addEventListener('input', updateConverter); });

  /* ================= TradingView ================= */
  let currentSym = 'BINANCE:BTCUSDT', chartToken = 0, pageLoaded = false;
  function setActiveChartBtn() {
    $$('.chart-btn').forEach(b => {
      const on = b.dataset.sym === currentSym;
      b.classList.toggle('bg-brand-accent', on); b.classList.toggle('text-white', on); b.classList.toggle('bg-slate-800', !on);
    });
  }
  function loadChart(sym, tries, token) {
    const box = $('#tradingview_chart_container');
    if (!box) return;
    currentSym = sym; setActiveChartBtn();
    if (token === undefined) token = ++chartToken;
    if (token !== chartToken) return;
    if (typeof TradingView === 'undefined') {
      if ((tries || 0) < 20) return setTimeout(() => loadChart(sym, (tries || 0) + 1, token), 400);
      const cf = $('#chartFallback'); if (cf) cf.classList.remove('hidden'); return;
    }
    const cf2 = $('#chartFallback'); if (cf2) cf2.classList.add('hidden');
    box.innerHTML = '<div id="tv_chart_sub" class="w-full h-full"></div>';
    new TradingView.widget({ autosize: true, symbol: sym, interval: 'D', timezone: 'Europe/Prague', theme: 'dark', style: '1', locale: lang === 'en' ? 'en' : 'cs', toolbar_bg: '#07090e', enable_publishing: false, allow_symbol_change: true, container_id: 'tv_chart_sub' });
  }
  $$('.chart-btn').forEach(b => b.addEventListener('click', () => loadChart(b.dataset.sym)));
  window.addEventListener('load', () => { pageLoaded = true; loadChart(currentSym); });

  /* ================= Roadmap ================= */
  const STEPS = [
    { cs: 'Pochopit základy: co je blockchain, Bitcoin a Ethereum (Modul 1)', en: 'Understand the basics: what blockchain, Bitcoin and Ethereum are (Module 1)' },
    { cs: 'Zvolit peněženku a bezpečně zálohovat seed phrase (Modul 2)', en: 'Choose a wallet and back up your seed phrase securely (Module 2)' },
    { cs: 'Zapnout 2FA (ideálně aplikaci, ne SMS) na e-mailu i burze', en: 'Turn on 2FA (ideally an authenticator app, not SMS) on your e-mail and exchange' },
    { cs: 'Založit a ověřit účet na regulované burze a udělat první malý nákup (Modul 3)', en: 'Open and verify an account on a regulated exchange and make a first small purchase (Module 3)' },
    { cs: 'Naučit se rozpoznat podvody a ověřovat tokeny (Modul 4)', en: 'Learn to recognize scams and vet tokens (Module 4)' },
    { cs: 'Nastavit si pravidelné DCA a pravidla rizika (Moduly 5–6, kalkulačky)', en: 'Set up regular DCA and risk rules (Modules 5–6, calculators)' },
    { cs: 'Vést evidenci transakcí a znát daňová pravidla v ČR (Modul 7)', en: 'Keep a record of your transactions and know the Czech tax rules (Module 7)' }
  ];
  const RM_KEY = 'kp_roadmap_v2';
  let done = [];
  try { done = JSON.parse(safeStore.get(RM_KEY) || '[]'); } catch (e) { done = []; }
  function renderRoadmap() {
    if (!$('#roadmapList')) return;
    $('#roadmapList').innerHTML = STEPS.map((s, i) => `
      <li><label class="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-brand-border cursor-pointer hover:border-brand-accent transition">
        <input type="checkbox" data-i="${i}" class="rm-check mt-0.5 w-4 h-4 accent-emerald-500" ${done.includes(i) ? 'checked' : ''}>
        <span class="text-slate-200"><span class="font-bold text-brand-accent mr-1">${i + 1}.</span>${pick(s)}</span></label></li>`).join('');
    $$('.rm-check').forEach(c => c.addEventListener('change', updateRoadmap));
    paintRoadmap();
  }
  function paintRoadmap() {
    $('#roadmapCount').textContent = done.length + ' / ' + STEPS.length;
    $('#roadmapBar').style.width = (done.length / STEPS.length * 100) + '%';
  }
  function updateRoadmap() {
    done = $$('.rm-check').filter(c => c.checked).map(c => +c.dataset.i);
    safeStore.set(RM_KEY, JSON.stringify(done));
    paintRoadmap();
  }

  /* ================= Audit checklist ================= */
  const checks = $$('.audit-check'), st = $('#auditStatus');
  function updateAudit() {
    if (!st) return;
    const n = checks.filter(c => c.checked).length, total = checks.length;
    if (n === total) { st.textContent = U().auditOk; st.className = 'text-base font-black text-emerald-400 mt-0.5'; }
    else if (n >= total - 2) { st.textContent = U().auditMid; st.className = 'text-base font-black text-amber-400 mt-0.5'; }
    else { st.textContent = U().auditBad; st.className = 'text-base font-black text-rose-400 mt-0.5'; }
  }
  checks.forEach(c => c.addEventListener('change', updateAudit));

  /* ================= DCA ================= */
  function dcaValue(amt, months, annual) {
    const m = annual / 12; let v = 0;
    for (let i = 0; i < months; i++) v = (v + amt) * (1 + m);
    return v;
  }
  function calcDCA() {
    if (!$('#dcaAmount')) return;
    const amt = Math.max(0, parseFloat($('#dcaAmount').value) || 0);
    const yrs = Math.min(50, Math.max(0, parseFloat($('#dcaYears').value) || 0));
    const rate = (parseFloat($('#dcaRate').value) || 0) / 100;
    const months = Math.round(yrs * 12), dep = amt * months, val = dcaValue(amt, months, rate);
    $('#dcaDeposited').textContent = fmtCzk(dep);
    $('#dcaResult').textContent = fmtCzk(val);
    const p = val - dep, pe = $('#dcaProfit');
    pe.textContent = (p >= 0 ? '+' : '−') + fmtCzk(Math.abs(p)) + (dep > 0 ? ' (' + (p / dep * 100).toFixed(0) + ' %)' : '');
    pe.className = 'font-mono font-bold ' + (p >= 0 ? 'text-emerald-400' : 'text-rose-400');
    $('#dcaFlat').textContent = fmtCzk(dcaValue(amt, months, 0));
    $('#dcaBear').textContent = fmtCzk(dcaValue(amt, months, -0.2));
  }
  ['dcaAmount', 'dcaYears', 'dcaRate'].forEach(i => { const el = $('#' + i); if (el) el.addEventListener('input', calcDCA); });

  /* ================= Risk ================= */
  function calcRM() {
    if (!$('#rmCapital')) return;
    const cap = Math.max(0, parseFloat($('#rmCapital').value) || 0);
    const risk = (parseFloat($('#rmRiskPct').value) || 0) / 100;
    const sl = (parseFloat($('#rmSlPct').value) || 0) / 100;
    const tp = (parseFloat($('#rmTpPct').value) || 0) / 100;
    const maxLoss = cap * risk, pos = sl > 0 ? maxLoss / sl : 0;
    $('#rmMaxLoss').textContent = fmtCzk(maxLoss);
    $('#rmPosSize').textContent = fmtCzk(pos);
    $('#rmPosPct').textContent = cap > 0 ? (pos / cap * 100).toFixed(0) + ' %' : '–';
    $('#rmGain').textContent = fmtCzk(pos * tp);
    $('#rmRR').textContent = sl > 0 ? '1 : ' + (tp / sl).toFixed(2).replace('.', lang === 'cs' ? ',' : '.') : '–';
    $('#rmWarn').classList.toggle('hidden', !(cap > 0 && pos > cap));
  }
  ['rmCapital', 'rmRiskPct', 'rmSlPct', 'rmTpPct'].forEach(i => { const el = $('#' + i); if (el) el.addEventListener('input', calcRM); });

  /* ================= Quiz ================= */
  const QUIZ = [
    { q: { cs: 'Komu smíte prozradit svoji seed phrase?', en: 'Who may you tell your seed phrase to?' },
      o: { cs: ['Podpoře peněženky', 'Nikomu', 'Kamarádovi, kterému věříte', 'Burze při ověření účtu'], en: ['Wallet support', 'Nobody', 'A friend you trust', 'An exchange during account verification'] },
      a: 1,
      e: { cs: 'Nikomu. Kdo zná seed, ovládá celou peněženku. Skutečná podpora se na něj nikdy neptá.', en: 'Nobody. Whoever knows the seed controls the whole wallet. Real support never asks for it.' } },
    { q: { cs: 'Co je „honeypot“ token?', en: 'What is a “honeypot” token?' },
      o: { cs: ['Token s vysokým staking výnosem', 'Token, který lze koupit, ale ne prodat', 'Token spálený týmem', 'Stablecoin'], en: ['A token with a high staking yield', 'A token you can buy but not sell', 'A token burned by the team', 'A stablecoin'] },
      a: 1,
      e: { cs: 'U honeypotu kontrakt blokuje prodej. Před nákupem ho ověřte nástrojem jako GoPlus nebo TokenSniffer.', en: 'With a honeypot the contract blocks selling. Check it with a tool such as GoPlus or TokenSniffer before buying.' } },
    { q: { cs: 'Co znamená limitní příkaz typu „maker“?', en: 'What does a “maker” limit order mean?' },
      o: { cs: ['Koupě okamžitě za tržní cenu', 'Příkaz, který přidává likviditu do knihy příkazů', 'Prodej s pákou', 'Převod na peněženku'], en: ['A purchase executed immediately at the market price', 'An order that adds liquidity to the order book', 'A leveraged sale', 'A transfer to a wallet'] },
      a: 1,
      e: { cs: 'Maker příkaz čeká v knize, přidává likviditu a obvykle platí nižší poplatek než taker.', en: 'A maker order waits in the book, adds liquidity and usually pays a lower fee than a taker.' } },
    { q: { cs: 'Proč je důležité sledovat FDV, nejen market cap?', en: 'Why watch FDV and not just market cap?' },
      o: { cs: ['FDV je vždy nižší', 'FDV ukáže hodnotu při všech vydaných mincích a riziko budoucího prodejního tlaku', 'FDV určuje poplatky sítě', 'Je to totéž'], en: ['FDV is always lower', 'FDV shows the value with all coins issued and the risk of future selling pressure', 'FDV determines network fees', 'They are the same thing'] },
      a: 1,
      e: { cs: 'Velký rozdíl mezi FDV a market cap znamená, že se teprve uvolní spousta tokenů.', en: 'A big gap between FDV and market cap means many tokens are still to be released.' } },
    { q: { cs: 'Po jaké době držení je v ČR příjem z prodeje krypta (u nepodnikatele) osvobozen časovým testem?', en: 'After what holding period is income from selling crypto (for a non-business individual) exempt in the Czech Republic under the time test?' },
      o: { cs: ['Po 6 měsících', 'Po 1 roce', 'Po více než 3 letech', 'Nikdy'], en: ['After 6 months', 'After 1 year', 'After more than 3 years', 'Never'] },
      a: 2,
      e: { cs: 'Časový test je 3 roky. Alternativně je osvobozen úhrn příjmů do 100 000 Kč za rok. Vždy si to ověřte u poradce.', en: 'The time test is 3 years. Alternatively, total income up to CZK 100,000 per year is exempt. Always verify with an adviser.' } },
    { q: { cs: 'Směníte BTC za ETH (krypto-za-krypto). Co se stane s časovým testem pro nově získané ETH?', en: 'You swap BTC for ETH (crypto-to-crypto). What happens to the time test for the newly received ETH?' },
      o: { cs: ['Nic, pokračuje od data nabytí BTC', 'Restartuje se — počítá se znovu od data směny', 'Časový test na swapy neplatí', 'Zdvojnásobí se na 6 let'], en: ['Nothing, it continues from when the BTC was acquired', 'It resets — it starts counting again from the swap date', 'The time test does not apply to swaps', 'It doubles to 6 years'] },
      a: 1,
      e: { cs: 'Směna krypto-za-krypto je úplatný převod. Časový test pro nově získané aktivum začíná běžet znovu od data směny — na toto lidé v ČR často doplácejí.', en: 'A crypto-to-crypto swap is a taxable transfer. The time test for the newly received asset restarts from the swap date — this is a common costly surprise for Czech users.' } },
    { q: { cs: 'Jaký podíl nově vzniklých tokenů na Pump.fun je podle analýzy Solidus Labs spojen s podvodným chováním?', en: 'What share of new Pump.fun tokens did a Solidus Labs analysis link to fraudulent behavior?' },
      o: { cs: ['Přibližně 10 %', 'Přibližně 50 %', 'Přibližně 98,6 %', 'Méně než 1 %'], en: ['About 10%', 'About 50%', 'About 98.6%', 'Less than 1%'] },
      a: 2,
      e: { cs: 'Podle analýzy bylo s rug pully a pump-and-dump schématy spojeno přibližně 98,6 % nových tokenů — drtivá většina.', en: 'Roughly 98.6% of new tokens were linked to rug pulls and pump-and-dump schemes — the vast majority.' } },
    { q: { cs: 'Co umožňuje aktivní „mint authority“ u tokenu?', en: 'What does an active "mint authority" on a token allow?' },
      o: { cs: ['Zmrazit peněženky držitelů', 'Vytvářet nové mince podle libosti a naředit nabídku', 'Zamknout likviditu', 'Snížit poplatky sítě'], en: ['Freeze holders’ wallets', 'Create new coins at will and dilute supply', 'Lock liquidity', 'Lower network fees'] },
      a: 1,
      e: { cs: 'Neomezená mint authority znamená, že tvůrce může kdykoli vyrazit další mince a zhroutit cenu.', en: 'Unlimited mint authority means the creator can mint more coins at any time and crash the price.' } },
    { q: { cs: 'Co je „impermanent loss“ u poskytování likvidity na DEXu?', en: 'What is "impermanent loss" when providing liquidity on a DEX?' },
      o: { cs: ['Poplatek za výběr z burzy', 'Ztráta oproti prostému držení (HODL), když se ceny aktiv v poolu rozejdou', 'Daň z příjmu z LP odměn', 'Výpadek sítě'], en: ['A withdrawal fee charged by the exchange', 'A loss versus simply holding (HODL) when the pooled assets’ prices diverge', 'Income tax on LP rewards', 'A network outage'] },
      a: 1,
      e: { cs: 'Když se poměr cen aktiv v poolu výrazně změní, hodnota LP pozice může zaostat za tím, co byste měli, kdybyste aktiva jen drželi.', en: 'When the price ratio of pooled assets shifts a lot, an LP position can end up worth less than simply holding the same assets.' } },
    { q: { cs: 'Jaký typ stablecoinu je historicky nejrizikovější, jak ukázal pád UST/Luna v roce 2022?', en: 'Which type of stablecoin is historically the riskiest, as the 2022 UST/Luna collapse showed?' },
      o: { cs: ['Fiat-backed (např. USDC)', 'Crypto-backed (např. DAI)', 'Algoritmický, bez plného krytí aktivy', 'Všechny jsou stejně rizikové'], en: ['Fiat-backed (e.g. USDC)', 'Crypto-backed (e.g. DAI)', 'Algorithmic, without full asset backing', 'They are all equally risky'] },
      a: 2,
      e: { cs: 'Algoritmický stablecoin UST ztratil kolík a spadl k nule během pár dní, protože jeho hodnotu nekryla žádná rezerva aktiv.', en: 'The algorithmic stablecoin UST lost its peg and collapsed to near zero within days because no asset reserve backed its value.' } },
    { q: { cs: 'Co je u stakingu „slashing“?', en: 'What is "slashing" in staking?' },
      o: { cs: ['Bonus za dlouhodobé stakování', 'Penalizace (ztráta části prostředků) při výpadku nebo zneužití validátora', 'Poplatek burzy za staking', 'Jiný název pro unbonding'], en: ['A bonus for staking long-term', 'A penalty (loss of part of the funds) when a validator misbehaves or goes offline', 'An exchange’s staking fee', 'Another name for unbonding'] },
      a: 1,
      e: { cs: 'Slashing penalizuje nespolehlivé nebo škodlivé validátory — a tuto ztrátu často nese i delegující.', en: 'Slashing penalizes unreliable or malicious validators — and the delegator often bears part of that loss too.' } }
  ];
  let qi = 0, score = 0, answered = false;
  const scored = new Set();
  function renderQuiz() {
    if (!$('#quizOpts')) return;
    const T = U();
    $('#quizNext').textContent = T.qNext;
    $('#quizExplain').textContent = '';
    if (qi >= QUIZ.length) {
      $('#quizStep').textContent = T.qDone;
      $('#quizScore').textContent = T.qScore(score);
      $('#quizQ').textContent = T.qYour + score + ' / ' + QUIZ.length;
      const passed = score / QUIZ.length >= 0.7;
      let html = '<p class="text-sm text-slate-300">' + (score === QUIZ.length ? T.qPerfect : score >= QUIZ.length * 0.6 ? T.qGood : T.qBad) + '</p>';
      if (passed) {
        html += '<div id="quizBadge" class="mt-5 p-5 rounded-2xl border border-brand-amber/40 bg-gradient-to-br from-brand-amber/10 via-transparent to-brand-accent/10 flex items-center gap-4">' +
          '<span class="w-14 h-14 shrink-0 rounded-full bg-brand-amber/20 text-brand-amber flex items-center justify-center text-2xl">🏅</span>' +
          '<div class="min-w-0"><div class="font-black text-fg">' + T.qBadgeTitle + '</div>' +
          '<div class="text-xs text-slate-400">' + T.qBadgeSub + '</div>' +
          '<button type="button" id="quizBadgeDl" class="mt-2 text-xs font-bold text-brand-accent hover:underline"><i class="fa-solid fa-download mr-1"></i>' + T.qBadgeDownload + '</button>' +
          '</div></div>';
      }
      $('#quizOpts').innerHTML = html;
      $('#quizExplain').classList.add('hidden'); $('#quizNext').classList.add('hidden'); return;
    }
    const it = QUIZ[qi]; answered = false;
    $('#quizStep').textContent = T.qStep(qi + 1, QUIZ.length);
    $('#quizScore').textContent = T.qScore(score);
    $('#quizQ').textContent = pick(it.q);
    $('#quizExplain').classList.add('hidden'); $('#quizNext').classList.add('hidden');
    const box = $('#quizOpts'); box.innerHTML = '';
    pick(it.o).forEach((t, i) => {
      const b = document.createElement('button');
      b.className = 'w-full text-left px-4 py-3 rounded-xl bg-slate-900 border border-brand-border text-sm text-slate-200 hover:border-brand-accent transition';
      b.textContent = t;
      b.addEventListener('click', () => {
        if (answered) return; answered = true;
        if (i === it.a) { if (!scored.has(qi)) { scored.add(qi); score++; } b.classList.add('border-emerald-500', 'bg-emerald-500/10'); }
        else { b.classList.add('border-rose-500', 'bg-rose-500/10'); box.children[it.a].classList.add('border-emerald-500', 'bg-emerald-500/10'); }
        $('#quizScore').textContent = U().qScore(score);
        const ex = $('#quizExplain'); ex.textContent = pick(it.e); ex.classList.remove('hidden');
        const nx = $('#quizNext'); nx.textContent = qi === QUIZ.length - 1 ? U().qResultBtn : U().qNext; nx.classList.remove('hidden');
      });
      box.appendChild(b);
    });
  }
  { const qn = $('#quizNext'), qr = $('#quizRestart');
  if (qn) qn.addEventListener('click', () => { qi++; renderQuiz(); });
  if (qr) qr.addEventListener('click', () => { qi = 0; score = 0; scored.clear(); renderQuiz(); }); }

  /* ================= Glossary ================= */
  // [name cs, name en, description cs, description en]
  const GLOSS = [
    ['Altcoin', 'Altcoin', 'Jakákoli kryptoměna kromě Bitcoinu.', 'Any cryptocurrency other than Bitcoin.'],
    ['APY / APR', 'APY / APR', 'Roční výnos s (APY) nebo bez (APR) zohlednění složeného úročení.', 'Annual yield with (APY) or without (APR) compounding.'],
    ['Bull / Bear market', 'Bull / Bear market', 'Býčí trh = dlouhodobý růst cen, medvědí trh = dlouhodobý pokles.', 'Bull market = a long-term rise in prices, bear market = a long-term decline.'],
    ['CEX / DEX', 'CEX / DEX', 'Centralizovaná burza vs. decentralizovaná směnárna, kde obchodujete z peněženky.', 'A centralized exchange vs. a decentralized one where you trade from your wallet.'],
    ['DCA', 'DCA', 'Dollar-cost averaging: pravidelný nákup za fixní částku.', 'Dollar-cost averaging: buying regularly for a fixed amount.'],
    ['DeFi', 'DeFi', 'Decentralizované finance: půjčky, směna a výnosy bez bank.', 'Decentralized finance: lending, swapping and yield without banks.'],
    ['FOMO', 'FOMO', 'Strach z promeškané příležitosti, častý důvod špatných nákupů na vrcholu.', 'Fear of missing out, a common reason for bad purchases at the top.'],
    ['FUD', 'FUD', 'Strach, nejistota a pochybnosti šířené o projektu či trhu.', 'Fear, uncertainty and doubt spread about a project or the market.'],
    ['Gas', 'Gas', 'Poplatek za provedení transakce v blockchainové síti.', 'The fee for executing a transaction on a blockchain network.'],
    ['HODL', 'HODL', 'Dlouhodobé držení bez prodeje (původně překlep slova „hold“).', 'Holding long term without selling (originally a typo of “hold”).'],
    ['KYC / AML', 'KYC / AML', 'Ověření totožnosti a pravidla proti praní špinavých peněz.', 'Identity verification and anti-money-laundering rules.'],
    ['Likvidita', 'Liquidity', 'Jak snadno lze aktivum koupit či prodat bez velkého vlivu na cenu.', 'How easily an asset can be bought or sold without moving the price much.'],
    ['Mint', 'Mint', 'Vytvoření nových tokenů. Neomezený mint u neznámého tokenu je riziko.', 'Creating new tokens. Unlimited minting on an unknown token is a risk.'],
    ['Rug pull', 'Rug pull', 'Podvod, při kterém tvůrce stáhne likviditu a zmizí.', 'A scam in which the creator pulls the liquidity and disappears.'],
    ['Seed phrase', 'Seed phrase', '12/24 slov, ze kterých lze obnovit peněženku. Nikdy ji nesdílejte.', '12/24 words from which a wallet can be restored. Never share it.'],
    ['Slippage', 'Slippage', 'Rozdíl mezi očekávanou a skutečnou cenou při provedení obchodu.', 'The difference between the expected and the actual price when a trade executes.'],
    ['Stablecoin', 'Stablecoin', 'Token navázaný na stabilní hodnotu (např. USD), jako USDT či USDC. I ty nesou riziko.', 'A token pegged to a stable value (e.g. USD), such as USDT or USDC. They carry risk too.'],
    ['TVL', 'TVL', 'Total Value Locked: hodnota aktiv uzamčených v DeFi protokolu.', 'Total Value Locked: the value of assets locked in a DeFi protocol.'],
    ['Diamond hands', 'Diamond hands', 'Držet pozici i přes prudký propad, aniž byste panicky prodali.', 'Holding a position through a sharp drop without panic-selling.'],
    ['Paper hands', 'Paper hands', 'Rychlé, často panické prodání při prvním poklesu nebo tlaku.', 'Selling quickly, often in a panic, at the first dip or pressure.'],
    ['Exit liquidity', 'Exit liquidity', 'Poslední kupci, kteří svými penězi umožní dřívějším investorům a insiderům výhodně vystoupit.', 'The last buyers whose money lets earlier investors and insiders cash out favorably.'],
    ['REKT', 'REKT', 'Slangový výraz pro drtivou finanční ztrátu („wrecked“).', 'Slang for a crushing financial loss ("wrecked").'],
    ['Whale (velryba)', 'Whale', 'Adresa nebo investor držící tak velké množství aktiva, že jeho obchody hýbou cenou.', 'An address or investor holding so much of an asset that its trades move the price.'],
    ['WAGMI / NGMI', 'WAGMI / NGMI', '„We’re all gonna make it“ (optimismus komunity) vs. „Not gonna make it“ (pesimismus).', '"We’re all gonna make it" (community optimism) vs. "Not gonna make it" (pessimism).'],
    ['ATH / ATL', 'ATH / ATL', 'All-Time High / All-Time Low: historicky nejvyšší, resp. nejnižší dosažená cena.', 'All-Time High / All-Time Low: the highest, resp. lowest price an asset has ever reached.'],
    ['EVM', 'EVM', 'Ethereum Virtual Machine: běhové prostředí smart kontraktů, které sdílí Ethereum a desítky dalších sítí (BNB Chain, Polygon, Arbitrum…).', 'Ethereum Virtual Machine: the smart-contract runtime shared by Ethereum and dozens of other networks (BNB Chain, Polygon, Arbitrum…).'],
    ['RPC', 'RPC', 'Remote Procedure Call: adresa serveru, přes kterou se peněženka nebo aplikace připojuje k blockchainu.', 'Remote Procedure Call: the server address through which a wallet or app connects to a blockchain.'],
    ['Testnet / Mainnet', 'Testnet / Mainnet', 'Testnet je cvičná síť s bezcennými mincemi, mainnet je ostrá síť s reálnou hodnotou.', 'A testnet is a practice network with worthless coins, mainnet is the live network with real value.'],
    ['Hash', 'Hash', 'Jedinečný „otisk“ dat (např. transakce) vytvořený kryptografickou funkcí.', 'A unique "fingerprint" of data (e.g. a transaction) produced by a cryptographic function.'],
    ['Mempool', 'Mempool', 'Fronta transakcí čekajících na zařazení do bloku.', 'The queue of transactions waiting to be included in a block.']
  ];
  function renderGlossary() {
    if (!$('#glossaryGrid')) return;
    const i = lang === 'en' ? 1 : 0, d = lang === 'en' ? 3 : 2;
    $('#glossaryGrid').innerHTML = GLOSS.map(g => `
      <div class="searchable gloss-item topic-card bg-brand-card border border-brand-border rounded-2xl p-4" data-keywords="${(g[0] + ' ' + g[1]).toLowerCase()}">
        <div class="font-bold text-white text-sm mb-1">${g[i]}</div>
        <div class="text-xs text-slate-400 leading-relaxed">${g[d]}</div>
      </div>`).join('');
  }

  /* ================= FAQ ================= */
  // [question cs, question en, answer cs, answer en]
  const FAQ = [
    ['Je krypto v ČR legální?', 'Is crypto legal in the Czech Republic?',
      'Ano, držení i obchodování je legální. Poskytovatelé služeb podléhají regulaci (AML/KYC) a příjmy z prodeje mohou podléhat dani z příjmů (viz Modul 7).',
      'Yes, holding and trading are legal. Service providers are regulated (AML/KYC) and income from sales may be subject to income tax (see Module 7).'],
    ['S jakou částkou začít?', 'How much should I start with?',
      'Jen s takovou, kterou si můžete dovolit ztratit. Začněte klidně malou částkou a pravidelným nákupem (DCA), abyste si zkusili celý postup a poplatky.',
      'Only with an amount you can afford to lose. Start small with regular purchases (DCA) so you can try the whole process and the fees.'],
    ['Burza, nebo vlastní peněženka?', 'Exchange or your own wallet?',
      'Burza je pohodlná pro nákup a prodej, ale mince nemáte pod vlastní kontrolou. Pro dlouhodobé držení větších částek je vhodnější vlastní (ideálně hardware) peněženka.',
      'An exchange is convenient for buying and selling, but you don’t control the coins. For long-term holding of larger amounts, your own (ideally hardware) wallet is better.'],
    ['Co je gas a proč se mění?', 'What is gas and why does it change?',
      'Gas je poplatek za zpracování transakce. Při vysoké zátěži sítě roste, protože o místo v blocích soutěží víc uživatelů. Na Solaně a L2 sítích bývá výrazně nižší.',
      'Gas is the fee for processing a transaction. It rises when the network is busy because more users compete for space in blocks. On Solana and L2 networks it is usually much lower.'],
    ['Jak poznám falešnou stránku?', 'How do I recognize a fake website?',
      'Ukládejte si oficiální weby do záložek, kontrolujte přesnou doménu, nepřihlašujte se přes odkazy z reklam a zpráv a nikdy nezadávejte seed phrase na webu.',
      'Bookmark official websites, check the exact domain, don’t log in through links from ads and messages, and never enter your seed phrase on a website.'],
    ['Co dělat, když mě podvedli?', 'What should I do if I’ve been scammed?',
      'Odeslané krypto transakce se zpravidla nedají vrátit. Okamžitě přesuňte zbylá aktiva do nové peněženky, zrušte oprávnění (revoke.cash), uschovejte důkazy a podejte oznámení Policii ČR. Nikomu, kdo vám „pomůže odblokovat prostředky za poplatek“, nevěřte.',
      'Sent crypto transactions usually can’t be reversed. Immediately move the remaining assets to a new wallet, revoke approvals (revoke.cash), keep the evidence and report it to the police. Don’t trust anyone who offers to “unlock your funds for a fee”.']
  ];
  function renderFaq() {
    if (!$('#faqList')) return;
    const q = lang === 'en' ? 1 : 0, a = lang === 'en' ? 3 : 2;
    $('#faqList').innerHTML = FAQ.map(f => `
      <details class="searchable faq-item group bg-brand-card border border-brand-border rounded-2xl" data-keywords="${(f[0] + ' ' + f[1]).toLowerCase()}">
        <summary class="flex items-center justify-between gap-4 px-5 py-4 font-bold text-white text-sm">${f[q]}<i class="fa-solid fa-chevron-down chev text-xs text-slate-400"></i></summary>
        <div class="px-5 pb-4 text-sm text-slate-400 leading-relaxed">${f[a]}</div>
      </details>`).join('');
  }

  /* ================= Donations ================= */
  const DONATE = [
    { name: 'Bitcoin (BTC)', addr: 'bc1qpz4zxaaqj9xlvnnrehfpqrtj8y6n7s88fsyt3g', icon: '<i class="fa-brands fa-bitcoin"></i>', cls: 'bg-amber-500/20 text-amber-500' },
    { name: 'Ethereum (ETH / ERC-20)', addr: '0x38d4762A3b5A90F3C7B567ac59B3AF153C62A7a3', icon: '<i class="fa-brands fa-ethereum"></i>', cls: 'bg-blue-500/20 text-blue-400' },
    { name: 'Solana (SOL)', addr: '5EpJBH31KrQvejcSxz9JRz3QYi2NxC6yERPF9rCaH6KD', icon: '◎', cls: 'bg-purple-500/20 text-purple-400' },
    { name: 'BNB Smart Chain (BEP-20)', addr: '0x38d4762A3b5A90F3C7B567ac59B3AF153C62A7a3', icon: '<i class="fa-solid fa-coins"></i>', cls: 'bg-amber-400/20 text-amber-400' },
    { name: 'XRP (Ripple)', addr: 'rLMdweWcjioWiUnsD7fuagY7kBW2tDwxHM', icon: '<i class="fa-solid fa-x"></i>', cls: 'bg-slate-400/20 text-slate-300' },
    { name: 'Dogecoin (DOGE)', addr: 'DDuZYa2naN4dYBY7kvTDYtzjYpCPvoKzkh', icon: '<i class="fa-solid fa-dog"></i>', cls: 'bg-yellow-500/20 text-yellow-400' },
    { name: 'Cardano (ADA)', addr: 'addr1q874gh9lgrsh9tqwf23ft5c5442wc9yutpk80qxxuwj54em7vts4rjdylmf2xy69a2t3uredqsl867up32e36ygtcqpqauxxt2', icon: '<i class="fa-solid fa-infinity"></i>', cls: 'bg-blue-400/20 text-blue-300' }
  ];
  function renderDonate() {
    const dl = $('#donateList'); if (!dl) return; dl.innerHTML = '';
    DONATE.forEach(d => {
      const row = document.createElement('div');
      row.className = 'p-4 rounded-2xl bg-slate-950 border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4';
      row.innerHTML = `
        <div class="flex items-center gap-3 overflow-hidden w-full">
          <span class="w-10 h-10 rounded-xl ${d.cls} font-bold flex items-center justify-center shrink-0 text-xl">${d.icon}</span>
          <div class="min-w-0">
            <div class="text-[11px] font-bold text-slate-400 uppercase">${d.name}</div>
            <code class="text-xs text-white font-mono block break-all" title="${d.addr}">${d.addr}</code>
          </div>
        </div>
        <div class="flex gap-2 w-full sm:w-auto shrink-0">
          <button class="qr-btn flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"><i class="fa-solid fa-qrcode mr-1"></i> QR</button>
          <button class="copy-btn flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/10 hover:bg-brand-accent hover:text-white text-xs font-bold transition"><i class="fa-regular fa-copy mr-1"></i> ${U().copy}</button>
        </div>`;
      $('.qr-btn', row).addEventListener('click', () => openQR(d.addr, d.name));
      $('.copy-btn', row).addEventListener('click', e => copyAddr(d.addr, e.currentTarget));
      dl.appendChild(row);
    });
  }

  function copyAddr(text, btn) {
    const ok = () => {
      btn.innerHTML = '<i class="fa-solid fa-check mr-1"></i> ' + U().copied;
      btn.classList.add('bg-emerald-500', 'text-white');
      setTimeout(() => {
        btn.innerHTML = '<i class="fa-regular fa-copy mr-1"></i> ' + U().copy;
        btn.classList.remove('bg-emerald-500', 'text-white');
      }, 1800);
    };
    const fallback = () => {
      const a = document.createElement('textarea'); a.value = text; a.style.position = 'fixed'; a.style.opacity = '0';
      document.body.appendChild(a); a.select();
      try { document.execCommand('copy'); ok(); } catch (e) {}
      document.body.removeChild(a);
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok).catch(fallback);
    else fallback();
  }

  /* ================= QR modal ================= */
  const modal = $('#qrModal'); let lastFocus = null;
  function openQR(addr, title) {
    lastFocus = document.activeElement;
    $('#qrModalTitle').textContent = title;
    $('#qrAddressText').textContent = addr;
    const box = $('#qrBox');
    try { const qr = qrcode(0, 'M'); qr.addData(addr); qr.make(); box.innerHTML = qr.createSvgTag(5, 0); }
    catch (e) { box.innerHTML = '<p class="text-xs text-slate-700 p-4">' + U().qrFail + '</p>'; }
    modal.classList.remove('hidden'); modal.classList.add('flex');
    $('#qrClose').focus();
  }
  function closeQR() { if (!modal) return; modal.classList.add('hidden'); modal.classList.remove('flex'); if (lastFocus) lastFocus.focus(); }
  if (modal) {
    const qc = $('#qrClose'); if (qc) qc.addEventListener('click', closeQR);
    modal.addEventListener('click', e => { if (e.target === modal) closeQR(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeQR(); });
  }

  /* ================= Modules: accordion, meta chips, takeaways ================= */
  const MODS = [
    { id: 'm1', lvl: 'b', min: 4, tk: {
      cs: ['Blockchain je sdílená databáze bez centrálního správce.', 'Bitcoin má pevný strop 21 milionů mincí a halving snižuje nové emise.', 'Omezená nabídka sama o sobě nezaručuje růst ceny.'],
      en: ['A blockchain is a shared database with no central administrator.', 'Bitcoin has a hard cap of 21 million coins and halvings reduce new issuance.', 'A limited supply alone does not guarantee a price increase.'] } },
    { id: 'penezenky', lvl: 'b', min: 5, tk: {
      cs: ['Not your keys, not your coins: na burze mince nemáte pod kontrolou.', 'Seed phrase je jediná záloha. Nikomu ji nesdělujte a neukládejte online.', 'Větší částky patří do hardware peněženky.'],
      en: ['Not your keys, not your coins: you don’t control coins left on an exchange.', 'The seed phrase is the only backup. Never share it or store it online.', 'Larger amounts belong in a hardware wallet.'] } },
    { id: 'burzy', lvl: 'b', min: 5, tk: {
      cs: ['CEX je pohodlná, DEX dává kontrolu, ale i víc zodpovědnosti.', 'Volte regulovaného poskytovatele (MiCA) a nenechávejte tam velké částky.', 'Vždy ověřte adresu kontraktu a nastavte rozumný slippage.'],
      en: ['A CEX is convenient, a DEX gives you control but also more responsibility.', 'Choose a regulated provider (MiCA) and don’t leave large amounts there.', 'Always verify the contract address and set a sensible slippage.'] } },
    { id: 'scam-checker', lvl: 'b', min: 6, tk: {
      cs: ['Garantovaný zisk je vždy podvod.', 'Před nákupem zkontrolujte likviditu, kontrakt a držitele tokenu.', 'Pravidelně rušte zbytečná oprávnění (revoke.cash).'],
      en: ['A guaranteed profit is always a scam.', 'Before buying, check the liquidity, the contract and the token holders.', 'Regularly revoke unnecessary approvals (revoke.cash).'] } },
    { id: 'm5', lvl: 'i', min: 5, tk: {
      cs: ['Technická analýza ukazuje pravděpodobnosti, ne jistoty.', 'Sledujte FDV a vesting, nejen market cap.', 'Reálné využití je důležitější než hype.'],
      en: ['Technical analysis shows probabilities, not certainties.', 'Watch FDV and vesting, not just market cap.', 'Real usage matters more than hype.'] } },
    { id: 'm6', lvl: 'a', min: 4, tk: {
      cs: ['DCA snižuje vliv emocí a načasování.', 'Vysoké APY znamená vysoké riziko.', 'Páka násobí i ztráty, začátečníkům ji nedoporučujeme.'],
      en: ['DCA reduces the influence of emotions and timing.', 'A high APY means high risk.', 'Leverage multiplies losses too – not recommended for beginners.'] } },
    { id: 'dane', lvl: 'i', min: 3, tk: {
      cs: ['Držení déle než 3 roky nebo příjmy do 100 000 Kč za rok jsou osvobozeny.', 'Uchovávejte historii všech transakcí.', 'Složitější případy (staking, DeFi) konzultujte s poradcem.'],
      en: ['Holding for more than 3 years or income up to CZK 100,000 per year is exempt.', 'Keep a history of all your transactions.', 'Discuss more complex cases (staking, DeFi) with an adviser.'] } }
  ];
  const MOD_UI = {
    cs: { b: 'Začátečník', i: 'Mírně pokročilý', a: 'Pokročilý', read: n => n + ' min čtení', take: 'Hlavní body' },
    en: { b: 'Beginner', i: 'Intermediate', a: 'Advanced', read: n => n + ' min read', take: 'Key takeaways' }
  };
  const LVL_CLS = {
    b: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    i: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    a: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
  };
  const child = (el, sel) => Array.from(el.children).find(c => c.matches(sel));
  function setMod(art, open) {
    const body = child(art, '.module-body'); if (!body) return;
    body.hidden = !open;
    art.classList.toggle('mod-open', open);
    const b = child(child(art, 'header') || art, '.mod-toggle');
    if (b) b.setAttribute('aria-expanded', String(open));
  }
  function toggleMod(art) { const body = child(art, '.module-body'); if (body) setMod(art, body.hidden); }
  function initModules() {
    MODS.forEach(m => {
      const art = document.getElementById(m.id); if (!art) return;
      const head = child(art, 'header'); if (!head) return;
      head.classList.remove('mb-4'); head.classList.add('cursor-pointer');
      if (head.children[0]) head.children[0].classList.add('shrink-0');
      const body = document.createElement('div');
      body.className = 'module-body mt-6'; body.id = m.id + '-body';
      while (head.nextSibling) body.appendChild(head.nextSibling);
      art.appendChild(body);
      const meta = document.createElement('div'); meta.className = 'mod-meta flex flex-wrap items-center gap-2 mt-2';
      if (head.children[1]) head.children[1].appendChild(meta);
      const tk = document.createElement('div');
      tk.className = 'mod-take mt-6 rounded-2xl border border-brand-accent/30 bg-brand-accent/5 p-4 text-sm';
      body.appendChild(tk);
      const btn = document.createElement('button');
      btn.type = 'button'; btn.setAttribute('aria-controls', body.id);
      btn.className = 'mod-toggle ml-auto shrink-0 w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center transition';
      btn.innerHTML = '<i class="fa-solid fa-chevron-down chev text-xs"></i>';
      head.appendChild(btn);
      head.addEventListener('click', e => { if (e.target.closest('a')) return; toggleMod(art); });
      setMod(art, false);
    });
    { const ea = $('#expandAll'), ca = $('#collapseAll');
    if (ea) ea.addEventListener('click', () => MODS.forEach(m => { const a = document.getElementById(m.id); if (a) setMod(a, true); }));
    if (ca) ca.addEventListener('click', () => MODS.forEach(m => { const a = document.getElementById(m.id); if (a) setMod(a, false); })); }
    $$('.mod-chip').forEach(c => c.addEventListener('click', e => {
      e.preventDefault();
      const art = document.getElementById(c.dataset.mod); if (!art) return;
      setMod(art, true); art.scrollIntoView({ behavior: 'smooth', block: 'start' });
      try { history.replaceState(null, '', '#' + c.dataset.mod); } catch (err) {}
    }));
    if ('IntersectionObserver' in window) {
      const mo = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        $$('.mod-chip').forEach(c => {
          const on = c.dataset.mod === e.target.id;
          c.classList.toggle('border-brand-accent', on); c.classList.toggle('text-brand-accent', on); c.classList.toggle('border-brand-border', !on);
        });
      }), { rootMargin: '-20% 0px -70% 0px' });
      MODS.forEach(m => { const a = document.getElementById(m.id); if (a) mo.observe(a); });
    }
    if (!openFromHash(false)) { const first = document.getElementById(MODS[0].id); if (first) setMod(first, true); }
  }
  function openFromHash(scroll) {
    let id = ''; try { id = decodeURIComponent((location.hash || '').slice(1)); } catch (e) {}
    if (!id) return false;
    const t = document.getElementById(id); if (!t) return false;
    const art = t.closest('.topic-section'); if (!art) return false;
    setMod(art, true);
    if (scroll) requestAnimationFrame(() => art.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    return true;
  }
  window.addEventListener('hashchange', () => openFromHash(true));
  function renderModuleChrome() {
    const T = MOD_UI[lang];
    MODS.forEach(m => {
      const art = document.getElementById(m.id); if (!art) return;
      const meta = $('.mod-meta', art);
      if (meta) meta.innerHTML = '<span class="inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold ' + LVL_CLS[m.lvl] + '">' + T[m.lvl] + '</span>' +
        '<span class="inline-flex items-center gap-1 text-[11px] text-slate-400"><i class="fa-regular fa-clock"></i> ' + T.read(m.min) + '</span>';
      const tk = $('.mod-take', art);
      if (tk) tk.innerHTML = '<div class="font-bold text-brand-accent mb-2"><i class="fa-solid fa-key mr-2"></i>' + T.take + '</div>' +
        '<ul class="list-disc pl-5 space-y-1 text-slate-300 text-xs sm:text-sm">' + m.tk[lang].map(x => '<li>' + x + '</li>').join('') + '</ul>';
    });
  }
  initModules();

  /* ================= FAQ structured data + keyboard shortcut ================= */
  function updateFaqLd() {
    let s = $('#ldFaq');
    if (!s) { s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'ldFaq'; document.head.appendChild(s); }
    const q = lang === 'en' ? 1 : 0, a = lang === 'en' ? 3 : 2;
    s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: lang,
      mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f[q], acceptedAnswer: { '@type': 'Answer', text: f[a] } })) });
  }
  document.addEventListener('keydown', e => {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '')) return;
    e.preventDefault();
    if (window.innerWidth >= 768) si.focus(); else { menu.classList.remove('hidden'); menuBtn.setAttribute('aria-expanded', 'true'); msi.focus(); }
  });

  /* ================= setLang ================= */
  function setLang(l, persist) {
    lang = l === 'en' ? 'en' : 'cs';
    document.documentElement.lang = lang;
    if (persist) safeStore.set(LANG_KEY, lang);
    applyStatic();
    paintLangButtons();
    renderRoadmap(); renderGlossary(); renderFaq(); renderDonate(); renderQuiz(); renderModuleChrome(); updateFaqLd();
    updateAudit(); calcDCA(); calcRM(); paintPrices(); paintPulse(); updateConverter();
    handleSearch(si.value);
    paintHalving(); paintTop20(); paintTop20ToggleLabel();
    if (window.kpRerenderChQuiz) window.kpRerenderChQuiz();
    if (window.kpRerenderRiskQuiz) window.kpRerenderRiskQuiz();
    if (window.kpRerenderMyProgress) window.kpRerenderMyProgress();
    if (window.kpRerenderStaking) window.kpRerenderStaking();
    if (pageLoaded) loadChart(currentSym);
  }
  $$('.lang-btn').forEach(b => b.addEventListener('click', () => { if (b.dataset.lang !== lang) setLang(b.dataset.lang, true); }));

  function initialLang() {
    try {
      const p = new URLSearchParams(location.search).get('lang');
      if (p === 'en' || p === 'cs') return p;
    } catch (e) {}
    const s = safeStore.get(LANG_KEY);
    if (s === 'en' || s === 'cs') return s;
    const nav = ((navigator.languages && navigator.languages[0]) || navigator.language || 'cs').toLowerCase();
    return (nav.startsWith('cs') || nav.startsWith('sk')) ? 'cs' : 'en';
  }

  setLang(initialLang(), false);
  fetchPrices(); fetchPulse(); fetchMarkets(); fetchTrending(); paintHalving(); paintAlerts();
  setInterval(() => { if (!document.hidden) fetchPrices(); }, 60000);
  setInterval(paintHalving, 3600000);

  /* ================= Top 20 toggle + sort ================= */
  function paintTop20ToggleLabel() {
    const lbl = $('#top20ToggleLabel'); if (!lbl) return;
    const open = !$('#top20Wrap').classList.contains('hidden');
    const dict = (window.I18N && window.I18N[lang]) || {};
    lbl.textContent = open ? (dict['kmkt0016'] || 'Skrýt žebříček') : (dict['kmkt0015'] || 'Zobrazit žebříček Top 20');
  }
  const top20Toggle = $('#top20Toggle');
  if (top20Toggle) {
    top20Toggle.addEventListener('click', () => {
      const wrap = $('#top20Wrap'), chev = $('#top20Chevron');
      const willOpen = wrap.classList.contains('hidden');
      wrap.classList.toggle('hidden');
      if (chev) chev.classList.toggle('rotate-180', willOpen);
      paintTop20ToggleLabel();
      if (willOpen) paintTop20();
    });
  }
  $$('#top20Table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (top20Sort.key === key) top20Sort.dir *= -1; else { top20Sort.key = key; top20Sort.dir = key === 'name' ? 1 : -1; }
      paintTop20();
    });
  });
  const top20WatchOnly = $('#top20WatchOnly');
  if (top20WatchOnly) top20WatchOnly.addEventListener('change', paintTop20);
})();


  /* ================= v6 additions: theme, branding tool-links, audit v2, rescue, print, glossary filter, time-test tool ================= */
  (function () {
    const $ = (s, r) => (r || document).querySelector(s);
    const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
    const safeStore = {
      get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
      set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
    };

    /* ---- Dark / light theme ---- */
    const THEME_KEY = 'kp_theme_v1';
    function applyTheme(t) {
      const html = document.documentElement;
      if (t === 'light') { html.classList.remove('dark'); html.setAttribute('data-theme', 'light'); }
      else { html.classList.add('dark'); html.setAttribute('data-theme', 'dark'); }
      $$('.theme-toggle').forEach(btn => {
        const icon = btn.querySelector('i');
        if (icon) icon.className = t === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        btn.setAttribute('aria-pressed', t === 'light' ? 'false' : 'true');
      });
    }
    /* Dark is always the default unless the visitor has explicitly chosen light before
       (no longer following the OS/browser color-scheme preference). */
    let theme = safeStore.get(THEME_KEY) || 'dark';
    applyTheme(theme);
    $$('.theme-toggle').forEach(btn => btn.addEventListener('click', () => {
      theme = theme === 'light' ? 'dark' : 'light';
      safeStore.set(THEME_KEY, theme);
      applyTheme(theme);
    }));

    /* ---- data-i18n-h: same as data-i18n but applies as innerHTML (allows <b>, <code>, <a> in translated strings) ---- */
    function applyStaticH() {
      const dict = (window.I18N && window.I18N[document.documentElement.lang]) || {};
      const cs = (window.I18N && window.I18N.cs) || {};
      $$('[data-i18n-h]').forEach(el => {
        const k = el.getAttribute('data-i18n-h');
        const v = dict[k] != null ? dict[k] : cs[k];
        if (v != null) el.innerHTML = v;
      });
      /* ---- data-i18n-ph: same, but sets the placeholder attribute (inputs/textareas) ---- */
      $$('[data-i18n-ph]').forEach(el => {
        const k = el.getAttribute('data-i18n-ph');
        const v = dict[k] != null ? dict[k] : cs[k];
        if (v != null) el.setAttribute('placeholder', v);
      });
      /* ---- data-i18n-aria: same, but sets the aria-label attribute ---- */
      $$('[data-i18n-aria]').forEach(el => {
        const k = el.getAttribute('data-i18n-aria');
        const v = dict[k] != null ? dict[k] : cs[k];
        if (v != null) el.setAttribute('aria-label', v);
      });
    }
    applyStaticH();

    /* ---- Generic tool-link scroll (TOOLLINK components point at #tool-X; fall back to the tools section) ---- */
    $$('a[data-tool]').forEach(a => a.addEventListener('click', e => {
      const id = 'tool-' + a.getAttribute('data-tool');
      const target = document.getElementById(id) || document.getElementById('nastroje');
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }));

    /* ---- Enhanced anti-scam audit v2 (positive signs + red flags + gradient meter) ---- */
    const posChecks = $$('.audit-check'), negChecks = $$('.audit-flag');
    const scoreEl = $('#auditScore'), pointerEl = $('#auditPointer'), statusEl = $('#auditStatus');
    const AUDIT_TXT = {
      cs: { low: '✅ Nízké riziko', mid: '⚠️ Střední riziko', high: '❌ Vysoké riziko' },
      en: { low: '✅ Low risk', mid: '⚠️ Medium risk', high: '❌ High risk' }
    };
    function curLang() { return (window.I18N && document.documentElement.lang) || 'cs'; }
    function updateAuditV2() {
      if (!scoreEl || !pointerEl || !statusEl) return;
      const posTotal = posChecks.length || 1;
      const posDone = posChecks.filter(c => c.checked).length;
      const negHit = negChecks.filter(c => c.checked).length;
      // 0 = safest, 100 = riskiest. Each unmet positive sign and each hit red flag add risk.
      let risk = Math.round(((posTotal - posDone) / posTotal) * 50 + (negHit / Math.max(1, negChecks.length)) * 50);
      risk = Math.max(0, Math.min(100, risk));
      scoreEl.textContent = risk;
      pointerEl.style.left = risk + '%';
      const L = AUDIT_TXT[document.documentElement.lang === 'en' ? 'en' : 'cs'];
      let txt, cls;
      if (risk <= 20 && negHit === 0) { txt = L.low; cls = 'text-base font-black text-emerald-400 mt-3'; }
      else if (risk <= 55) { txt = L.mid; cls = 'text-base font-black text-amber-400 mt-3'; }
      else { txt = L.high; cls = 'text-base font-black text-rose-400 mt-3'; }
      statusEl.textContent = txt;
      statusEl.className = cls;
    }
    posChecks.concat(negChecks).forEach(c => c.addEventListener('change', updateAuditV2));
    updateAuditV2();

    /* ---- Rescue brake scenarios ---- */
    const RESCUE = {
      stuck: {
        cs: ['Nic dalšího nepodepisujte a počkejte – stažení (cancel) může ještě nestihnuté transakci zabránit.',
             'Pokud síť umožňuje „speed up“, zkuste poslat tutéž transakci znovu s vyšším poplatkem (gas).',
             'Nepanikařte a nereagujte na žádné DM nabízející „urychlení za poplatek“ – to je podvod.'],
        en: ['Don\'t sign anything else and wait – a cancel transaction can still beat a pending one.',
             'If the network supports it, try a "speed up" by resending the same transaction with a higher fee (gas).',
             'Don\'t panic and don\'t reply to any DM offering to "speed it up for a fee" – that is a scam.']
      },
      hack: {
        cs: ['Okamžitě přestaňte podepisovat cokoliv v podezřelé peněžence.',
             'Přesuňte zbylá aktiva do nové, čisté peněženky s novou seed phrase.',
             'Na revoke.cash zrušte všechna oprávnění (approvals) staré peněženky.',
             'Zaznamenejte hash transakcí a URL podvodné stránky jako důkaz.'],
        en: ['Immediately stop signing anything in the compromised wallet.',
             'Move remaining assets to a brand-new wallet with a fresh seed phrase.',
             'Use revoke.cash to revoke every approval granted by the old wallet.',
             'Record transaction hashes and the scam page URL as evidence.']
      },
      wrong: {
        cs: ['Stejná mince, špatná adresa na STEJNÉ síti: pokud adresa patří vám (jiná peněženka), prostředky obvykle dohledáte v průzkumníku.',
             'Špatná SÍŤ (např. poslal jste token na adresu, která existuje, ale na jiném blockchainu): bez podpory burzy/peněženky se obvykle nedají snadno obnovit – kontaktujte podporu cílové platformy co nejdříve.',
             'Příště vždy pošlete nejdřív malou testovací částku.'],
        en: ['Same coin, wrong address on the SAME network: if the address is yours (a different wallet), you can usually find the funds via the explorer.',
             'Wrong NETWORK (e.g. you sent a token to an address that exists but on a different blockchain): without exchange/wallet support these are usually hard to recover – contact the destination platform\'s support immediately.',
             'Next time, always send a small test amount first.']
      },
      lost: {
        cs: ['Pokud máte seed phrase (12/24 slov), obnovte peněženku v nové aplikaci – přístup k zařízení nehraje roli.',
             'Pokud máte jen zapomenutý PIN hardware peněženky, většina zařízení po více chybných pokusech provede reset – obnova je opět jen přes seed phrase.',
             'Bez seed phrase a bez zařízení bohužel prostředky obvykle nelze obnovit – proto je záloha seed phrase to nejdůležitější, co v krypto existuje.'],
        en: ['If you have the seed phrase (12/24 words), restore the wallet in a new app – the lost device does not matter.',
             'If you only forgot a hardware wallet\'s PIN, most devices reset themselves after repeated wrong attempts – recovery again goes through the seed phrase only.',
             'Without the seed phrase and without the device, funds usually cannot be recovered – which is why backing up the seed phrase is the single most important thing in crypto.']
      }
    };
    $$('.rescue-btn').forEach(btn => btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-rescue');
      const out = $('#rescueOut');
      if (!out || !RESCUE[key]) return;
      const L = document.documentElement.lang === 'en' ? 'en' : 'cs';
      out.innerHTML = '<ol class="list-decimal pl-5 space-y-1.5">' +
        RESCUE[key][L].map(t => '<li>' + t + '</li>').join('') + '</ol>';
      $$('.rescue-btn').forEach(b => b.classList.toggle('border-brand-accent', b === btn));
    }));

    /* ---- Decalogue: print one module, download as .txt ---- */
    function printModule(id) {
      const el = document.getElementById(id);
      if (!el) { window.print(); return; }
      const hidden = [];
      let node = el;
      while (node && node !== document.body) {
        const parent = node.parentElement;
        if (parent) {
          Array.from(parent.children).forEach(sib => {
            if (sib !== node) { hidden.push([sib, sib.style.display]); sib.style.display = 'none'; }
          });
        }
        node = parent;
      }
      window.print();
      hidden.forEach(([elm, disp]) => { elm.style.display = disp; });
    }
    $$('[data-print-id]').forEach(btn => btn.addEventListener('click', () => printModule(btn.getAttribute('data-print-id'))));
    const txtBtn = $('#decalogueTxt');
    if (txtBtn) txtBtn.addEventListener('click', () => {
      const list = $$('#decalogue li, #decalogue-body li');
      const lines = list.map((li, i) => (i + 1) + '. ' + li.textContent.trim());
      const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'kryptoprofik-bezpecnostni-dekalog.txt';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    });

    /* ---- Glossary live filter ---- */
    const gInput = $('#glossarySearch');
    if (gInput) {
      gInput.addEventListener('input', () => {
        const q = gInput.value.trim().toLowerCase();
        $$('#glossaryGrid > *').forEach(card => {
          const txt = card.textContent.toLowerCase();
          card.style.display = (!q || txt.indexOf(q) !== -1) ? '' : 'none';
        });
      });
    }

    /* ---- Time-test / swap tracker tool (ties directly to the tax module's central warning) ---- */
    const ttDate = $('#ttDate'), ttOut = $('#ttOut'), ttBtn = $('#ttCalc');
    function calcTimeTest() {
      if (!ttDate || !ttOut || !ttDate.value) return;
      const acquired = new Date(ttDate.value);
      const now = new Date();
      const msDay = 86400000;
      const daysHeld = Math.floor((now - acquired) / msDay);
      const exemptDate = new Date(acquired.getTime() + 3 * 365.25 * msDay);
      const daysLeft = Math.ceil((exemptDate - now) / msDay);
      const L = document.documentElement.lang === 'en' ? 'en' : 'cs';
      const fmt = d => d.toLocaleDateString(L === 'en' ? 'en-GB' : 'cs-CZ');
      let html;
      if (daysLeft <= 0) {
        html = L === 'en'
          ? '<div class="text-emerald-400 font-bold">✅ More than 3 years have passed since ' + fmt(acquired) + ' — the time-test exemption can apply to a sale TODAY, for this specific holding.</div>'
          : '<div class="text-emerald-400 font-bold">✅ Od ' + fmt(acquired) + ' uplynuly více než 3 roky — časový test pro tuto konkrétní držbu může být splněn už DNES.</div>';
      } else {
        html = (L === 'en'
          ? '<div class="text-amber-400 font-bold">⏳ ' + daysLeft + ' day(s) left until the time test is met (around ' + fmt(exemptDate) + ').</div>'
          : '<div class="text-amber-400 font-bold">⏳ Zbývá ' + daysLeft + ' dní do splnění časového testu (přibližně ' + fmt(exemptDate) + ').</div>');
      }
      html += (L === 'en'
        ? '<div class="text-[11px] text-slate-400 mt-2">Remember: any crypto-to-crypto swap of this asset resets this date to the swap date, for the newly received asset.</div>'
        : '<div class="text-[11px] text-slate-400 mt-2">Pozor: jakákoli směna krypto-za-krypto u tohoto aktiva posune toto datum na den směny — pro nově získané aktivum začíná počítání znovu.</div>');
      ttOut.innerHTML = html;
    }
    if (ttBtn) ttBtn.addEventListener('click', calcTimeTest);

    /* ---- Re-run dynamic text on language switch (hook into existing setLang via MutationObserver on <html lang>) ---- */
    new MutationObserver(() => { applyStaticH(); updateAuditV2(); if (ttDate && ttDate.value) calcTimeTest(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  })();


  /* ================= v7 additions: more tools, quiz badge download ================= */
  (function () {
    const $ = (s, r) => (r || document).querySelector(s);
    const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
    const safeStore = {
      get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
      set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
    };
    const curLang = () => (document.documentElement.lang === 'en' ? 'en' : 'cs');

    /* ---- Quiz certificate download (badge is injected dynamically, so delegate the click) ---- */
    document.addEventListener('click', e => {
      const btn = e.target.closest('#quizBadgeDl');
      if (!btn) return;
      const L = curLang();
      const title = L === 'en' ? 'KryptoProfík - Certified Beginner' : 'KryptoProfík - Certifikovaný začátečník';
      const body = L === 'en'
        ? 'This certifies that you have successfully completed the KryptoProfík certification quiz.\n\nIssued: ' + new Date().toLocaleDateString('en-GB') + '\nkryptoprofik (Instagram: @cryptoprofik)'
        : 'Tímto se potvrzuje, že jste úspěšně absolvovali certifikační kvíz portálu KryptoProfík.\n\nVydáno: ' + new Date().toLocaleDateString('cs-CZ') + '\nKryptoProfík (Instagram: @cryptoprofik)';
      const blob = new Blob([title + '\n\n' + body], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'kryptoprofik-certifikat.txt';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    });

    /* ---- Address format checker (#tool-addr) ---- */
    const addrIn = $('#addrInput'), addrOut = $('#addrOut');
    const ADDR_RE = [
      { net: 'Bitcoin (Legacy / P2SH)', re: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/ },
      { net: 'Bitcoin (Bech32)', re: /^(bc1)[a-z0-9]{25,62}$/ },
      { net: 'Ethereum / EVM (ETH, BNB Chain, Polygon, Arbitrum…)', re: /^0x[a-fA-F0-9]{40}$/ },
      { net: 'Solana', re: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/ }
    ];
    function checkAddr() {
      if (!addrIn || !addrOut) return;
      const v = addrIn.value.trim();
      const L = curLang();
      if (!v) { addrOut.innerHTML = ''; return; }
      const hit = ADDR_RE.find(x => x.re.test(v));
      if (hit) {
        addrOut.innerHTML = '<div class="text-emerald-400 font-bold">✅ ' +
          (L === 'en' ? 'Looks like a valid ' : 'Vypadá to na platnou adresu sítě ') + hit.net + '.</div>';
      } else {
        addrOut.innerHTML = '<div class="text-rose-400 font-bold">❌ ' +
          (L === 'en' ? 'This does not match a known BTC / ETH / SOL address format. Double-check it.' : 'Toto neodpovídá známému formátu adresy BTC / ETH / SOL. Zkontrolujte ji znovu.') + '</div>';
      }
    }
    if (addrIn) addrIn.addEventListener('input', checkAddr);

    /* ---- Seed-phrase recovery trainer (#tool-seed) ---- */
    const SEED_WORDS = ['apple', 'river', 'copper', 'forest', 'ember', 'marble', 'cloud', 'violet', 'granite', 'harbor', 'lantern', 'willow'];
    let seedOrder = [], seedCorrect = [];
    function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
    function renderSeed() {
      const target = $('#seedTarget'), pool = $('#seedPool'), msg = $('#seedMsg');
      if (!target || !pool) return;
      seedCorrect = SEED_WORDS.slice(0, 6);
      seedOrder = shuffle(seedCorrect);
      const chosen = [];
      target.innerHTML = '';
      msg.textContent = '';
      pool.innerHTML = '';
      seedOrder.forEach((w, idx) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = (idx + 1) + '. ' + w;
        b.className = 'seed-word px-3 py-1.5 rounded-lg bg-slate-900 border border-brand-border text-xs font-mono text-fg hover:border-brand-amber transition';
        b.addEventListener('click', () => {
          if (b.disabled) return;
          chosen.push(w);
          b.disabled = true; b.classList.add('opacity-30');
          const tag = document.createElement('span');
          tag.className = 'px-3 py-1.5 rounded-lg bg-brand-amber/10 border border-brand-amber/30 text-xs font-mono text-brand-amber';
          tag.textContent = chosen.length + '. ' + w;
          target.appendChild(tag);
          if (chosen.length === seedCorrect.length) {
            const L = curLang();
            if (chosen.join(',') === seedCorrect.join(',')) {
              msg.innerHTML = '<span class="text-emerald-400 font-bold">✅ ' + (L === 'en' ? 'Correctly recovered! This is exactly the drill real wallet recovery feels like.' : 'Správně obnoveno! Přesně takhle probíhá i reálná obnova peněženky.') + '</span>';
            } else {
              msg.innerHTML = '<span class="text-rose-400 font-bold">❌ ' + (L === 'en' ? 'Wrong order — a real wallet would recover to the wrong address. Try again.' : 'Špatné pořadí — reálná peněženka by se obnovila na jinou adresu. Zkuste to znovu.') + '</span>';
            }
          }
        });
        pool.appendChild(b);
      });
    }
    renderSeed();
    const seedResetBtn = $('#seedReset');
    if (seedResetBtn) seedResetBtn.addEventListener('click', renderSeed);

    /* ---- Portfolio allocator (#tool-allocator) ---- */
    const ALLOC = {
      conservative: [['BTC', 70], ['ETH', 20], ['Altcoins', 0], ['Stablecoins', 10]],
      balanced: [['BTC', 45], ['ETH', 25], ['Altcoins', 20], ['Stablecoins', 10]],
      aggressive: [['BTC', 25], ['ETH', 20], ['Altcoins', 50], ['Stablecoins', 5]]
    };
    const allocOut = $('#allocOut');
    function paintAlloc(key) {
      if (!allocOut) return;
      const rows = ALLOC[key] || ALLOC.balanced;
      allocOut.innerHTML = rows.map(([name, pct]) =>
        '<div><div class="flex justify-between mb-1"><span class="text-slate-300">' + name + '</span><span class="font-mono font-bold text-fg">' + pct + '%</span></div>' +
        '<div class="h-2 rounded-full bg-slate-800 overflow-hidden"><div class="h-full bg-brand-accent" style="width:' + pct + '%"></div></div></div>'
      ).join('');
    }
    $$('.alloc-btn').forEach(b => b.addEventListener('click', () => {
      $$('.alloc-btn').forEach(x => x.classList.toggle('border-brand-accent', x === b));
      paintAlloc(b.getAttribute('data-alloc'));
    }));
    paintAlloc('balanced');

    /* ---- Impermanent loss calculator (#tool-il) ---- */
    const ilIn = $('#ilChange'), ilOut = $('#ilOut');
    function calcIL() {
      if (!ilIn || !ilOut) return;
      const pct = parseFloat(ilIn.value) || 0;
      const r = 1 + pct / 100;
      if (r <= 0) { ilOut.innerHTML = ''; return; }
      const il = (2 * Math.sqrt(r) / (1 + r) - 1) * 100;
      const L = curLang();
      ilOut.innerHTML = '<div class="font-mono text-xl font-bold ' + (il < -0.01 ? 'text-brand-rose' : 'text-emerald-400') + '">' + il.toFixed(2) + '%</div>' +
        '<div class="text-[11px] text-slate-400 mt-1">' + (L === 'en' ? 'Approximate loss versus simply holding both assets, from this price divergence alone (ignoring any trading fees earned).' : 'Přibližná ztráta oproti prostému držení obou aktiv, jen z tohoto cenového rozestupu (bez zohlednění vydělaných poplatků).') + '</div>';
    }
    if (ilIn) { ilIn.addEventListener('input', calcIL); calcIL(); }

    /* ---- Weekly checklist (#tool-week), persisted per ISO week ---- */
    function isoWeekKey() {
      const d = new Date();
      const onejan = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
      return 'kp_week_' + d.getFullYear() + '_' + week;
    }
    const weekChecks = $$('.week-check');
    function weekKey() { return isoWeekKey(); }
    function loadWeek() {
      let saved = [];
      try { saved = JSON.parse(safeStore.get(weekKey()) || '[]'); } catch (e) {}
      weekChecks.forEach(c => { c.checked = saved.indexOf(+c.dataset.i) !== -1; });
    }
    function saveWeek() {
      const on = weekChecks.filter(c => c.checked).map(c => +c.dataset.i);
      safeStore.set(weekKey(), JSON.stringify(on));
    }
    weekChecks.forEach(c => c.addEventListener('change', saveWeek));
    loadWeek();
    const weekResetBtn = $('#weekReset');
    if (weekResetBtn) weekResetBtn.addEventListener('click', () => {
      weekChecks.forEach(c => { c.checked = false; });
      saveWeek();
    });

    /* ---- Historical average purchase price (#tool-dca-hist) ---- */
    const histBtn = $('#histCalc'), histOut = $('#histOut');
    if (histBtn) histBtn.addEventListener('click', () => {
      let totalAmt = 0, totalUnits = 0;
      for (let i = 0; i < 3; i++) {
        const amt = parseFloat(($('#hAmt' + i) || {}).value) || 0;
        const price = parseFloat(($('#hPrice' + i) || {}).value) || 0;
        if (amt > 0 && price > 0) { totalAmt += amt; totalUnits += amt / price; }
      }
      const L = curLang();
      if (totalUnits <= 0) {
        histOut.innerHTML = '<span class="text-slate-400">' + (L === 'en' ? 'Enter at least one purchase.' : 'Zadejte alespoň jeden nákup.') + '</span>';
        return;
      }
      const avg = totalAmt / totalUnits;
      const fmt = n => Math.round(n).toLocaleString(L === 'en' ? 'en-GB' : 'cs-CZ');
      histOut.innerHTML =
        '<div class="flex justify-between"><span class="text-slate-400">' + (L === 'en' ? 'Total invested' : 'Celkem investováno') + '</span><span class="font-mono font-bold text-fg">' + fmt(totalAmt) + ' CZK</span></div>' +
        '<div class="flex justify-between"><span class="text-slate-400">' + (L === 'en' ? 'Total units' : 'Celkem jednotek') + '</span><span class="font-mono text-fg">' + totalUnits.toFixed(6) + '</span></div>' +
        '<div class="flex justify-between items-end mt-1"><span class="text-slate-200 font-semibold">' + (L === 'en' ? 'Average purchase price' : 'Průměrná nákupní cena') + '</span><span class="font-mono text-brand-cyan text-lg font-bold">' + avg.toFixed(2) + ' CZK</span></div>';
    });

    /* ---- Make the per-module collapse/expand toggle work on the new (DSL-built) lesson
       modules too — the original initModules()/MODS wiring only covers the 6 original
       lessons, so these 25 newer ones need their own (lighter) accordion handler, and
       "Expand all" / "Collapse all" need to reach them as well. ---- */
    const newMods = $$('article.topic-section.module');
    function dslChild(el, sel) { return Array.from(el.children).find(c => c.matches(sel)); }
    function setDslMod(art, open) {
      const body = dslChild(art, '.module-body'); if (!body) return;
      body.hidden = !open;
      art.classList.toggle('mod-open', open);
      const header = dslChild(art, 'header.mod-head');
      const btn = header && dslChild(header, 'button.mod-toggle');
      if (btn) btn.setAttribute('aria-expanded', String(open));
    }
    newMods.forEach(art => {
      const header = dslChild(art, 'header.mod-head');
      if (!header) return;
      header.classList.add('cursor-pointer');
      header.addEventListener('click', e => {
        if (e.target.closest('a')) return;
        const body = dslChild(art, '.module-body');
        if (body) setDslMod(art, body.hidden);
      });
      setDslMod(art, true); // new modules start expanded, same as their static markup
    });
    const expandAllBtn = $('#expandAll'), collapseAllBtn = $('#collapseAll');
    if (expandAllBtn) expandAllBtn.addEventListener('click', () => newMods.forEach(a => setDslMod(a, true)));
    if (collapseAllBtn) collapseAllBtn.addEventListener('click', () => newMods.forEach(a => setDslMod(a, false)));

    /* ---- Chapter-pill scroll-spy: extend it to the new modules too, so scrolling through
       them still highlights the right pill (same chapter grouping as the mod-chip hrefs). ---- */
    if ('IntersectionObserver' in window && newMods.length) {
      const mo2 = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        const chip = e.target.getAttribute('data-chapter-chip');
        if (!chip) return;
        $$('.mod-chip').forEach(c => {
          const on = c.dataset.mod === chip;
          c.classList.toggle('border-brand-accent', on); c.classList.toggle('text-brand-accent', on); c.classList.toggle('border-brand-border', !on);
        });
      }), { rootMargin: '-20% 0px -70% 0px' });
      newMods.forEach(a => { if (a.hasAttribute('data-chapter-chip')) mo2.observe(a); });
    }

    /* ---- Re-run language-dependent dynamic outputs on switch ---- */
    new MutationObserver(() => { checkAddr(); calcIL(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  

  /* ================= Cross-page search (multi-page build) ================= */
  const SITE_INDEX = [{"id": "m1", "cs": "Modul 1: Základy blockchainu a kryptoměn", "en": "Modul 1: Základy blockchainu a kryptoměn", "page": "zaklady", "chap": "Základy"}, {"id": "l1l2", "cs": "Layer 1 vs. Layer 2 a blockchain trilema", "en": "Layer 1 vs. Layer 2 and the blockchain trilemma", "page": "zaklady", "chap": "Základy"}, {"id": "timeline", "cs": "Časová osa: historie kryptoměn", "en": "Timeline: the history of crypto", "page": "zaklady", "chap": "Základy"}, {"id": "cycle", "cs": "Čtyřletý cyklus a psychologie trhu", "en": "The four-year cycle and market psychology", "page": "zaklady", "chap": "Základy"}, {"id": "myths", "cs": "Mýty vs. realita o kryptoměnách", "en": "Crypto myths vs. reality", "page": "zaklady", "chap": "Základy"}, {"id": "lightning", "cs": "Bitcoin Lightning Network", "en": "Bitcoin Lightning Network", "page": "zaklady", "chap": "Základy"}, {"id": "nft", "cs": "NFT a digitální vlastnictví", "en": "NFTs and digital ownership", "page": "zaklady", "chap": "Základy"}, {"id": "token-creation", "cs": "Jak vzniká vlastní token/memecoin (Pump.fun, Remix) — a proč to skoro vždy skončí na nule", "en": "How tokens/memecoins get created (Pump.fun, Remix) — and why it almost always ends at zero", "page": "zaklady", "chap": "Základy"}, {"id": "stablecoins", "cs": "Průvodce stablecoiny: typy krytí a riziko algoritmických modelů", "en": "Stablecoin guide: types of backing and the risk of algorithmic models", "page": "zaklady", "chap": "Základy"}, {"id": "tokenomics", "cs": "Tokenomika a whitepaper: na co se zaměřit", "en": "Tokenomics and whitepapers: what to focus on", "page": "zaklady", "chap": "Základy"}, {"id": "psych-traps", "cs": "Psychologické pasti: FOMO, revenge trading a panika", "en": "Psychological traps: FOMO, revenge trading and panic", "page": "zaklady", "chap": "Základy"}, {"id": "about-project", "cs": "O projektu: nezávislost a poslání", "en": "About the project: independence and mission", "page": "zaklady", "chap": "Základy"}, {"id": "first-purchase", "cs": "Mapa prvního nákupu: od korun po bezpečné krypto", "en": "Your first-purchase map: from CZK to safely stored crypto", "page": "zaklady", "chap": "Základy"}, {"id": "penezenky", "cs": "Modul 2: Peněženky a zabezpečení", "en": "Modul 2: Peněženky a zabezpečení", "page": "penezenky", "chap": "Peněženky"}, {"id": "burzy", "cs": "Modul 3: Burzy (CEX) a decentralizované směnárny (DEX)", "en": "Modul 3: Burzy (CEX) a decentralizované směnárny (DEX)", "page": "burzy", "chap": "Burzy & DEX"}, {"id": "scam-checker", "cs": "Modul 4: Bezpečnost a anti-scam", "en": "Modul 4: Bezpečnost a anti-scam", "page": "anti-scam", "chap": "Anti-scam"}, {"id": "selfcustody", "cs": "Self-custody a multi-sig peněženky", "en": "Self-custody and multi-sig wallets", "page": "anti-scam", "chap": "Anti-scam"}, {"id": "hwwallet", "cs": "Bezpečné používání hardware peněženek", "en": "Using hardware wallets safely", "page": "anti-scam", "chap": "Anti-scam"}, {"id": "airdrops", "cs": "Pravda a varování před airdropy", "en": "The truth about airdrops, and a warning", "page": "anti-scam", "chap": "Anti-scam"}, {"id": "social", "cs": "Bezpečnost na sociálních sítích", "en": "Security on social networks", "page": "anti-scam", "chap": "Anti-scam"}, {"id": "rescue", "cs": "DeFi záchranná brzda", "en": "The DeFi emergency brake", "page": "anti-scam", "chap": "Anti-scam"}, {"id": "hacks", "cs": "Historické hacky a poučení", "en": "Historic hacks and lessons", "page": "anti-scam", "chap": "Anti-scam"}, {"id": "cexdex", "cs": "Srovnání rizik CEX vs. DEX", "en": "CEX vs. DEX risk comparison", "page": "anti-scam", "chap": "Anti-scam"}, {"id": "inheritance", "cs": "Krypto a rodina: dědictví", "en": "Crypto and family: inheritance", "page": "anti-scam", "chap": "Anti-scam"}, {"id": "decalogue", "cs": "Desatero bezpečného investora", "en": "The safe investor’s ten rules", "page": "anti-scam", "chap": "Anti-scam"}, {"id": "m5", "cs": "Modul 5: Technická a fundamentální analýza", "en": "Modul 5: Technická a fundamentální analýza", "page": "analyza", "chap": "Analýza"}, {"id": "candlesticks", "cs": "Čtení svíčkových grafů: základy", "en": "Reading candlestick charts: the basics", "page": "analyza", "chap": "Analýza"}, {"id": "onchain", "cs": "On-chain data a indikátory: RSI, MACD, TVL a aktivní peněženky", "en": "On-chain data and indicators: RSI, MACD, TVL and active wallets", "page": "analyza", "chap": "Analýza"}, {"id": "m6", "cs": "Modul 6: Strategie a DeFi", "en": "Modul 6: Strategie a DeFi", "page": "strategie", "chap": "Strategie"}, {"id": "staking", "cs": "Staking do hloubky: Native, Liquid staking a Yield farming", "en": "Staking in depth: native, liquid staking and yield farming", "page": "strategie", "chap": "Strategie"}, {"id": "tax-main", "cs": "Daně v ČR: časový test, hodnotový test a past směn krypto-za-krypto", "en": "Czech crypto tax: the time test, value test, and the crypto-swap trap", "page": "dane", "chap": "Daně v ČR"}, {"id": "nastroje", "cs": "Nástroje a kalkulačky", "en": "Tools & calculators", "page": "nastroje", "chap": "Nástroje"}, {"id": "kviz", "cs": "Kvíz", "en": "Quiz", "page": "nastroje", "chap": "Nástroje"}, {"id": "slovnik", "cs": "Slovník pojmů", "en": "Glossary", "page": "glosar", "chap": "Slovník"}, {"id": "faq", "cs": "Časté otázky", "en": "FAQ", "page": "glosar", "chap": "FAQ"}];
  const ALL_MODULE_IDS = ["m1", "l1l2", "timeline", "cycle", "myths", "lightning", "nft", "token-creation", "stablecoins", "tokenomics", "psych-traps", "about-project", "first-purchase", "penezenky", "burzy", "scam-checker", "selfcustody", "hwwallet", "airdrops", "social", "rescue", "hacks", "cexdex", "inheritance", "decalogue", "m5", "candlesticks", "onchain", "m6", "staking", "tax-main"];
  const CHAPTER_MODULES = {"m1": ["m1", "l1l2", "timeline", "cycle", "myths", "lightning", "nft", "token-creation", "stablecoins", "tokenomics", "psych-traps", "about-project", "first-purchase"], "penezenky": ["penezenky"], "burzy": ["burzy"], "scam-checker": ["scam-checker", "selfcustody", "hwwallet", "airdrops", "social", "rescue", "hacks", "cexdex", "inheritance", "decalogue"], "m5": ["m5", "candlesticks", "onchain"], "m6": ["m6", "staking"], "tax-main": ["tax-main"]};
  const CH_QUIZ = {"penezenky": [{"q": {"cs": "Komu smíte prozradit svoji seed phrase?", "en": "Who may you tell your seed phrase to?"}, "o": {"cs": ["Podpoře peněženky", "Nikomu", "Kamarádovi, kterému věříte", "Burze při ověření účtu"], "en": ["Wallet support", "Nobody", "A friend you trust", "An exchange during account verification"]}, "a": 1, "e": {"cs": "Nikomu. Kdo zná seed, ovládá celou peněženku. Skutečná podpora se na něj nikdy neptá.", "en": "Nobody. Whoever knows the seed controls the whole wallet. Real support never asks for it."}}], "burzy": [{"q": {"cs": "Co znamená limitní příkaz typu „maker“?", "en": "What does a \"maker\" limit order mean?"}, "o": {"cs": ["Koupě okamžitě za tržní cenu", "Příkaz, který přidává likviditu do knihy příkazů", "Prodej s pákou", "Převod na peněženku"], "en": ["A purchase executed immediately at the market price", "An order that adds liquidity to the order book", "A leveraged sale", "A transfer to a wallet"]}, "a": 1, "e": {"cs": "Maker příkaz čeká v knize, přidává likviditu a obvykle platí nižší poplatek než taker.", "en": "A maker order waits in the book, adds liquidity and usually pays a lower fee than a taker."}}, {"q": {"cs": "Co je „impermanent loss“ u poskytování likvidity na DEXu?", "en": "What is \"impermanent loss\" when providing liquidity on a DEX?"}, "o": {"cs": ["Poplatek za výběr z burzy", "Ztráta oproti prostému držení (HODL), když se ceny aktiv v poolu rozejdou", "Daň z příjmu z LP odměn", "Výpadek sítě"], "en": ["A withdrawal fee charged by the exchange", "A loss versus simply holding (HODL) when the pooled assets’ prices diverge", "Income tax on LP rewards", "A network outage"]}, "a": 1, "e": {"cs": "Když se poměr cen aktiv v poolu výrazně změní, hodnota LP pozice může zaostat za tím, co byste měli, kdybyste aktiva jen drželi.", "en": "When the price ratio of pooled assets shifts a lot, an LP position can end up worth less than simply holding the same assets."}}], "scam-checker": [{"q": {"cs": "Co je „honeypot“ token?", "en": "What is a \"honeypot\" token?"}, "o": {"cs": ["Token s vysokým staking výnosem", "Token, který lze koupit, ale ne prodat", "Token spálený týmem", "Stablecoin"], "en": ["A token with a high staking yield", "A token you can buy but not sell", "A token burned by the team", "A stablecoin"]}, "a": 1, "e": {"cs": "U honeypotu kontrakt blokuje prodej. Před nákupem ho ověřte nástrojem jako GoPlus nebo TokenSniffer.", "en": "With a honeypot the contract blocks selling. Check it with a tool such as GoPlus or TokenSniffer before buying."}}, {"q": {"cs": "Jaký podíl nově vzniklých tokenů na Pump.fun je podle analýzy Solidus Labs spojen s podvodným chováním?", "en": "What share of new Pump.fun tokens did a Solidus Labs analysis link to fraudulent behavior?"}, "o": {"cs": ["Přibližně 10 %", "Přibližně 50 %", "Přibližně 98,6 %", "Méně než 1 %"], "en": ["About 10%", "About 50%", "About 98.6%", "Less than 1%"]}, "a": 2, "e": {"cs": "Podle analýzy bylo s rug pully a pump-and-dump schématy spojeno přibližně 98,6 % nových tokenů — drtivá většina.", "en": "Roughly 98.6% of new tokens were linked to rug pulls and pump-and-dump schemes — the vast majority."}}, {"q": {"cs": "Co umožňuje aktivní „mint authority“ u tokenu?", "en": "What does an active \"mint authority\" on a token allow?"}, "o": {"cs": ["Zmrazit peněženky držitelů", "Vytvářet nové mince podle libosti a naředit nabídku", "Zamknout likviditu", "Snížit poplatky sítě"], "en": ["Freeze holders’ wallets", "Create new coins at will and dilute supply", "Lock liquidity", "Lower network fees"]}, "a": 1, "e": {"cs": "Neomezená mint authority znamená, že tvůrce může kdykoli vyrazit další mince a zhroutit cenu.", "en": "Unlimited mint authority means the creator can mint more coins at any time and crash the price."}}], "m5": [{"q": {"cs": "Proč je důležité sledovat FDV, nejen market cap?", "en": "Why watch FDV and not just market cap?"}, "o": {"cs": ["FDV je vždy nižší", "FDV ukáže hodnotu při všech vydaných mincích a riziko budoucího prodejního tlaku", "FDV určuje poplatky sítě", "Je to totéž"], "en": ["FDV is always lower", "FDV shows the value with all coins issued and the risk of future selling pressure", "FDV determines network fees", "They are the same thing"]}, "a": 1, "e": {"cs": "Velký rozdíl mezi FDV a market cap znamená, že se teprve uvolní spousta tokenů.", "en": "A big gap between FDV and market cap means many tokens are still to be released."}}], "m6": [{"q": {"cs": "Co je u stakingu „slashing“?", "en": "What is \"slashing\" in staking?"}, "o": {"cs": ["Bonus za dlouhodobé stakování", "Penalizace (ztráta části prostředků) při výpadku nebo zneužití validátora", "Poplatek burzy za staking", "Jiný název pro unbonding"], "en": ["A bonus for staking long-term", "A penalty (loss of part of the funds) when a validator misbehaves or goes offline", "An exchange’s staking fee", "Another name for unbonding"]}, "a": 1, "e": {"cs": "Slashing penalizuje nespolehlivé nebo škodlivé validátory — a tuto ztrátu často nese i delegující.", "en": "Slashing penalizes unreliable or malicious validators — and the delegator often bears part of that loss too."}}], "tax-main": [{"q": {"cs": "Po jaké době držení je v ČR příjem z prodeje krypta (u nepodnikatele) osvobozen časovým testem?", "en": "After what holding period is income from selling crypto (for a non-business individual) exempt in the Czech Republic under the time test?"}, "o": {"cs": ["Po 6 měsících", "Po 1 roce", "Po více než 3 letech", "Nikdy"], "en": ["After 6 months", "After 1 year", "After more than 3 years", "Never"]}, "a": 2, "e": {"cs": "Časový test je 3 roky. Alternativně je osvobozen úhrn příjmů do 100 000 Kč za rok. Vždy si to ověřte u poradce.", "en": "The time test is 3 years. Alternatively, total income up to CZK 100,000 per year is exempt. Always verify with an adviser."}}, {"q": {"cs": "Směníte BTC za ETH (krypto-za-krypto). Co se stane s časovým testem pro nově získané ETH?", "en": "You swap BTC for ETH (crypto-to-crypto). What happens to the time test for the newly received ETH?"}, "o": {"cs": ["Nic, pokračuje od data nabytí BTC", "Restartuje se — počítá se znovu od data směny", "Časový test na swapy neplatí", "Zdvojnásobí se na 6 let"], "en": ["Nothing, it continues from when the BTC was acquired", "It resets — it starts counting again from the swap date", "The time test does not apply to swaps", "It doubles to 6 years"]}, "a": 1, "e": {"cs": "Směna krypto-za-krypto je úplatný převod. Časový test pro nově získané aktivum začíná běžet znovu od data směny — na toto lidé v ČR často doplácejí.", "en": "A crypto-to-crypto swap is a taxable transfer. The time test for the newly received asset restarts from the swap date — this is a common costly surprise for Czech users."}}], "m1": [{"q": {"cs": "Jaký typ stablecoinu je historicky nejrizikovější, jak ukázal pád UST/Luna v roce 2022?", "en": "Which type of stablecoin is historically the riskiest, as the 2022 UST/Luna collapse showed?"}, "o": {"cs": ["Fiat-backed (např. USDC)", "Crypto-backed (např. DAI)", "Algoritmický, bez plného krytí aktivy", "Všechny jsou stejně rizikové"], "en": ["Fiat-backed (e.g. USDC)", "Crypto-backed (e.g. DAI)", "Algorithmic, without full asset backing", "They are all equally risky"]}, "a": 2, "e": {"cs": "Algoritmický stablecoin UST ztratil kolík a spadl k nule během pár dní, protože jeho hodnotu nekryla žádná rezerva aktiv.", "en": "The algorithmic stablecoin UST lost its peg and collapsed to near zero within days because no asset reserve backed its value."}}]};
  const CH_META = {"m1": {"cs": "Základy", "en": "Basics", "num": "1", "c1": "#3b82f6", "c2": "#06b6d4"}, "penezenky": {"cs": "Peněženky", "en": "Wallets", "num": "2", "c1": "#06b6d4", "c2": "#3b82f6"}, "burzy": {"cs": "Burzy & DEX", "en": "Exchanges & DEX", "num": "3", "c1": "#a855f7", "c2": "#6366f1"}, "scam-checker": {"cs": "Anti-scam", "en": "Anti-scam", "num": "4", "c1": "#f43f5e", "c2": "#ec4899"}, "m5": {"cs": "Analýza", "en": "Analysis", "num": "5", "c1": "#1fd98b", "c2": "#0ea5e9"}, "m6": {"cs": "Strategie", "en": "Strategy", "num": "6", "c1": "#f59e0b", "c2": "#f97316"}, "tax-main": {"cs": "Daně v ČR", "en": "Czech taxes", "num": "7", "c1": "#fb923c", "c2": "#f59e0b"}};
  const RISK_QUIZ = [{"q": {"cs": "Jak by ses zachoval(a), kdyby tvé krypto portfolio kleslo o 30 % za týden?", "en": "What would you do if your crypto portfolio dropped 30% in a week?"}, "o": {"cs": ["Prodal(a) bych vše, abych omezil(a) ztráty", "Část bych prodal(a)", "Nedělal(a) bych nic a čekal(a)", "Dokoupil(a) bych za nižší cenu"], "en": ["I would sell everything to limit losses", "I would sell some of it", "I'd do nothing and wait", "I would buy more at the lower price"]}}, {"q": {"cs": "Jak velkou část svých celkových úspor jsi ochoten/ochotna mít v kryptu?", "en": "How much of your total savings are you willing to hold in crypto?"}, "o": {"cs": ["Méně než 5 %", "5–15 %", "15–30 %", "Více než 30 %"], "en": ["Less than 5%", "5-15%", "15-30%", "More than 30%"]}}, {"q": {"cs": "Jaký je tvůj investiční horizont?", "en": "What is your investment horizon?"}, "o": {"cs": ["Chci výsledky do pár měsíců", "1–2 roky", "3–5 let", "5+ let, nevadí mi čekat"], "en": ["I want results within a few months", "1-2 years", "3-5 years", "5+ years, I don't mind waiting"]}}, {"q": {"cs": "Jak hodnotíš své zkušenosti s kryptem?", "en": "How would you rate your crypto experience?"}, "o": {"cs": ["Úplný začátečník", "Rozumím základům", "Aktivně sleduji trh a obchoduji", "Zkouším i pokročilé strategie (DeFi, staking, trading)"], "en": ["Complete beginner", "I understand the basics", "I actively follow the market and trade", "I try advanced strategies (DeFi, staking, trading)"]}}, {"q": {"cs": "Co je pro tebe důležitější?", "en": "What matters more to you?"}, "o": {"cs": ["Ochrana kapitálu, raději méně, ale jistě", "Rozumná rovnováha rizika a výnosu", "Vyšší výnos, i za cenu větších výkyvů", "Maximální růst, i s rizikem větší ztráty"], "en": ["Capital protection, less but safer", "A reasonable risk/return balance", "Higher return, even with bigger swings", "Maximum growth, even at the risk of bigger losses"]}}];
  const RISK_PROFILES = {"conservative": {"title": {"cs": "Konzervativní", "en": "Conservative"}, "tag": {"cs": "Ochrana kapitálu na prvním místě", "en": "Capital protection comes first"}, "desc": {"cs": "Dáváš přednost jistotě před vzrušením. To je naprosto v pořádku — v kryptu je spousta prostoru i pro opatrný přístup, hlavně přes zavedené mince, pravidelné malé nákupy (DCA) a bezpečné úschovné (cold storage).", "en": "You prefer safety over excitement. That's perfectly fine — crypto has plenty of room for a cautious approach too, mainly through established coins, small regular purchases (DCA), and safe cold storage."}, "chapters": [{"href": "penezenky.html", "cs": "Peněženky a bezpečná úschova", "en": "Wallets and safe custody"}, {"href": "anti-scam.html", "cs": "Jak poznat podvod", "en": "How to spot a scam"}, {"href": "dane.html", "cs": "Daně v ČR", "en": "Czech taxes"}], "c1": "#2563eb", "c2": "#60a5fa", "emoji": "🛡"}, "balanced": {"title": {"cs": "Vyvážený", "en": "Balanced"}, "tag": {"cs": "Rozumná rovnováha rizika a výnosu", "en": "A sensible risk/return balance"}, "desc": {"cs": "Hledáš zdravou rovnováhu mezi růstem a bezpečím. Pravděpodobně ti sedne diverzifikace napříč pár projekty, pravidelné investování a sledování základní analýzy, než se rozhodneš přikoupit nebo prodat.", "en": "You're looking for a healthy balance between growth and safety. You'll likely do well diversifying across a few projects, investing regularly, and following basic analysis before buying or selling more."}, "chapters": [{"href": "analyza.html", "cs": "Analýza trhu", "en": "Market analysis"}, {"href": "strategie.html", "cs": "Strategie a řízení rizika", "en": "Strategy and risk management"}, {"href": "burzy.html", "cs": "Burzy & DEX", "en": "Exchanges & DEX"}], "c1": "#1fd98b", "c2": "#0ea5e9", "emoji": "⚖"}, "aggressive": {"title": {"cs": "Růstově zaměřený", "en": "Growth-seeking"}, "tag": {"cs": "Vyšší potenciál růstu, vyšší kolísavost", "en": "Higher growth potential, higher volatility"}, "desc": {"cs": "Jsi ochoten/ochotna přijmout větší výkyvy výměnou za vyšší potenciální výnos. I tak se vyplatí mít pevná pravidla řízení rizika a nikdy neinvestovat víc, než si můžeš dovolit ztratit — a obzvlášť pozorně sledovat kapitolu o podvodech.", "en": "You're willing to accept bigger swings for higher potential returns. Even so, solid risk-management rules pay off — never invest more than you can afford to lose, and pay extra attention to the anti-scam chapter."}, "chapters": [{"href": "strategie.html", "cs": "Strategie a řízení rizika", "en": "Strategy and risk management"}, {"href": "anti-scam.html", "cs": "Jak poznat podvod", "en": "How to spot a scam"}, {"href": "analyza.html", "cs": "Pokročilá analýza", "en": "Advanced analysis"}], "c1": "#db2777", "c2": "#f97316", "emoji": "🚀"}};

  /* ================= Supabase (komunita: komentáře, lajky, chat) ================= */
  const KP_SB_URL = 'https://lhiodwgtwouvjlpvmqcm.supabase.co';
  const KP_SB_KEY = 'sb_publishable_7se7f4t5EDVAyVHU726tsQ_myQqn-iH';
  function kpSbHeaders(extra) {
    return Object.assign({
      'apikey': KP_SB_KEY,
      'Authorization': 'Bearer ' + KP_SB_KEY,
      'Content-Type': 'application/json',
    }, extra || {});
  }
  async function kpSbSelect(table, query) {
    const res = await fetch(KP_SB_URL + '/rest/v1/' + table + (query ? '?' + query : ''), { headers: kpSbHeaders() });
    if (!res.ok) throw new Error('Supabase select failed: ' + res.status);
    return res.json();
  }
  async function kpSbInsert(table, row, minimal) {
    const res = await fetch(KP_SB_URL + '/rest/v1/' + table, {
      method: 'POST',
      headers: kpSbHeaders({ 'Prefer': minimal ? 'return=minimal' : 'return=representation' }),
      body: JSON.stringify(row),
    });
    if (!res.ok) throw new Error('Supabase insert failed: ' + res.status);
    if (minimal) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }
  async function kpSbDelete(table, query) {
    const res = await fetch(KP_SB_URL + '/rest/v1/' + table + '?' + query, { method: 'DELETE', headers: kpSbHeaders() });
    return res.ok;
  }
  function kpVisitorId() {
    try {
      let id = localStorage.getItem('kp_visitor_id');
      if (!id) {
        id = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem('kp_visitor_id', id);
      }
      return id;
    } catch (e) { return 'v_anon_' + Date.now(); }
  }
  function kpEscapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  /* Escapes first, then turns http(s):// links in the (already-escaped) text into
     clickable, safe anchors. Never run on raw unescaped input. */
  function kpLinkify(rawText) {
    const escaped = kpEscapeHtml(rawText);
    return escaped.replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])/gi, function (url) {
      return '<a href="' + url + '" target="_blank" rel="noopener noreferrer nofollow" class="underline text-brand-accent hover:text-white break-all">' + url + '</a>';
    });
  }

  /* ================= Shared: draw a QR code onto any 2D canvas context ================= */
  function kpDrawQr(ctx, x, y, size, text) {
    try {
      if (typeof qrcode === 'undefined') return false;
      const qr = qrcode(0, 'M');
      qr.addData(text);
      qr.make();
      const n = qr.getModuleCount();
      const cell = size / n;
      ctx.fillStyle = '#fff';
      ctx.fillRect(x, y, size, size);
      ctx.fillStyle = '#07090e';
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (qr.isDark(r, c)) ctx.fillRect(x + c * cell, y + r * cell, Math.ceil(cell), Math.ceil(cell));
        }
      }
      return true;
    } catch (e) { return false; }
  }
  const CURRENT_PAGE = document.documentElement.getAttribute('data-page') || 'index';
  function renderGlobalResults(q) {
    const box = document.getElementById('globalResults');
    if (!box) return;
    if (!q) { box.innerHTML = ''; box.classList.add('hidden'); return; }
    const isEn = document.documentElement.lang === 'en';
    const matches = SITE_INDEX.filter(e => e.page !== CURRENT_PAGE &&
      ((isEn ? e.en : e.cs).toLowerCase().includes(q) || e.chap.toLowerCase().includes(q)));
    if (!matches.length) { box.innerHTML = ''; box.classList.add('hidden'); return; }
    const label = isEn ? 'Also found on other pages:' : 'Nalezeno i na jiných stránkách:';
    box.innerHTML = '<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">' +
      '<p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">' + label + '</p>' +
      '<div class="flex flex-wrap gap-2">' + matches.slice(0, 12).map(e =>
        '<a href="' + e.page + '.html#' + e.id + '" class="px-3 py-1.5 rounded-full bg-brand-card border border-brand-border hover:border-brand-accent text-xs font-semibold text-slate-200 transition">' +
        kpHighlight(isEn ? e.en : e.cs, q) + ' <span class="text-slate-500">&middot; ' + kpEscapeHtml(e.chap) + '</span></a>').join('') + '</div></div>';
    box.classList.remove('hidden');
  }
  window.__kpRenderGlobalResults = renderGlobalResults;
  new MutationObserver(() => { const si2 = document.getElementById('searchInput'); if (si2 && si2.value) renderGlobalResults(si2.value.toLowerCase().trim()); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  /* ================= Search result highlighting ================= */
  function kpEscapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function kpEscapeRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function kpHighlight(text, q) {
    const safe = kpEscapeHtml(text);
    if (!q) return safe;
    try {
      return safe.replace(new RegExp('(' + kpEscapeRe(kpEscapeHtml(q)) + ')', 'ig'), '<mark class="bg-brand-accent/30 text-inherit rounded px-0.5">$1</mark>');
    } catch (e) { return safe; }
  }
  window.__kpHighlight = kpHighlight;
  function kpHighlightSearchTitles(q) {
    document.querySelectorAll('.searchable h3').forEach(h3 => {
      if (h3.dataset.kpOrig === undefined) h3.dataset.kpOrig = h3.innerHTML;
      const orig = h3.dataset.kpOrig;
      if (!q || /<[a-z]/i.test(orig)) { h3.innerHTML = orig; return; }
      h3.innerHTML = kpHighlight(orig, q);
    });
  }
  window.__kpHighlightSearchTitles = kpHighlightSearchTitles;

  /* ================= "/" keyboard shortcut to jump to search ================= */
  document.addEventListener('keydown', e => {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;
    const si = document.getElementById('searchInput');
    if (!si) return;
    e.preventDefault();
    si.focus();
    si.select();
  });
  (function searchShortcutHint() {
    const si = document.getElementById('searchInput');
    if (!si || !si.parentElement) return;
    const hint = document.createElement('kbd');
    hint.textContent = '/';
    hint.className = 'absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-slate-800 border border-brand-border text-[10px] text-slate-400 font-mono pointer-events-none';
    si.parentElement.appendChild(hint);
    si.addEventListener('focus', () => { hint.style.display = 'none'; });
    si.addEventListener('blur', () => { if (!si.value) hint.style.display = ''; });
  })();

  /* ================= Cookie consent + (opt-in) analytics ================= */
  (function cookieConsent() {
    const KEY = 'kp_cookie_consent';
    const GA_ID = 'G-EF0SMSE5ER';
    function loadGA() {
      if (window.__kpGaLoaded || !GA_ID || GA_ID.indexOf('XXXX') !== -1) return;
      window.__kpGaLoaded = true;
      const s = document.createElement('script');
      s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', GA_ID, { anonymize_ip: true });
    }
    let saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved === 'accepted') { loadGA(); return; }
    if (saved === 'rejected') return;
    const bar = document.createElement('div');
    bar.id = 'cookieBar';
    bar.className = 'fixed bottom-0 inset-x-0 z-[80] bg-brand-card border-t border-brand-border p-4 sm:p-5 no-print';
    const isEn = document.documentElement.lang === 'en';
    const msg = isEn
      ? 'We use cookies only for basic, anonymous visit statistics. No ads, no personal data sold.'
      : 'Používáme cookies jen pro základní, anonymní statistiku návštěvnosti. Žádné reklamy, žádný prodej osobních dat.';
    const moreInfoHref = (CURRENT_PAGE === 'soukromi' ? '#soukromi' : 'soukromi.html');
    const moreInfo = isEn ? 'More info' : 'Více info';
    const accept = isEn ? 'Accept' : 'Přijmout';
    const reject = isEn ? 'Reject' : 'Odmítnout';
    bar.innerHTML = '<div class="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-3 sm:gap-6">' +
      '<p class="text-xs sm:text-sm text-slate-300 flex-1">🍪 ' + msg +
      ' <a href="' + moreInfoHref + '" class="underline hover:text-white">' + moreInfo + '</a></p>' +
      '<div class="flex gap-2 shrink-0 w-full sm:w-auto">' +
      '<button id="cookieReject" type="button" class="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition">' + reject + '</button>' +
      '<button id="cookieAccept" type="button" class="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-brand-accent hover:opacity-90 text-xs font-bold text-white transition">' + accept + '</button>' +
      '</div></div>';
    document.body.appendChild(bar);
    document.getElementById('cookieAccept').addEventListener('click', () => {
      try { localStorage.setItem(KEY, 'accepted'); } catch (e) {}
      loadGA(); bar.remove();
    });
    document.getElementById('cookieReject').addEventListener('click', () => {
      try { localStorage.setItem(KEY, 'rejected'); } catch (e) {}
      bar.remove();
    });
  })();

  /* ================= Per-page share buttons ================= */
  (function shareButtons() {
    const mount = document.getElementById('shareBtns');
    if (!mount) return;
    const url = encodeURIComponent(location.href);
    const title = encodeURIComponent(document.title);
    const items = [
      { icon: 'fa-brands fa-facebook', href: 'https://www.facebook.com/sharer/sharer.php?u=' + url, label: 'Facebook' },
      { icon: 'fa-brands fa-twitter', href: 'https://twitter.com/intent/tweet?url=' + url + '&text=' + title, label: 'X' },
      { icon: 'fa-brands fa-whatsapp', href: 'https://wa.me/?text=' + title + '%20' + url, label: 'WhatsApp' },
    ];
    mount.innerHTML = items.map(it =>
      '<a href="' + it.href + '" target="_blank" rel="noopener noreferrer" aria-label="' + it.label + '" ' +
      'class="w-9 h-9 rounded-xl bg-slate-800 hover:bg-brand-accent flex items-center justify-center text-slate-300 hover:text-white transition"><i class="' + it.icon + '"></i></a>'
    ).join('') +
      '<button id="shareCopy" type="button" aria-label="Copy link" class="w-9 h-9 rounded-xl bg-slate-800 hover:bg-brand-accent flex items-center justify-center text-slate-300 hover:text-white transition"><i class="fa-solid fa-link"></i></button>';
    const copyBtn = document.getElementById('shareCopy');
    copyBtn.addEventListener('click', () => {
      const done = () => { copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>'; setTimeout(() => { copyBtn.innerHTML = '<i class="fa-solid fa-link"></i>'; }, 1500); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(location.href).then(done).catch(() => {});
      else {
        const t = document.createElement('textarea'); t.value = location.href; t.style.position = 'fixed'; t.style.opacity = '0';
        document.body.appendChild(t); t.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(t); done();
      }
    });
  })();

  /* ================= PWA: service worker registration ================= */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }

  /* ================= Continue reading tracker (index.html banner) ================= */
  (function continueReading() {
    const KEY = 'kp_last_seen';
    const container = document.getElementById('modulesContainer');
    if (container && 'IntersectionObserver' in window) {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (!en.isIntersecting) return;
          const id = en.target.id;
          if (!id) return;
          try { localStorage.setItem(KEY, JSON.stringify({ id: id, page: CURRENT_PAGE })); } catch (e) {}
        });
      }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });
      Array.from(container.children).forEach(a => { if (a.id) obs.observe(a); });
    }

    const banner = document.getElementById('continueBanner');
    if (!banner) return;
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    if (!saved || !saved.id) return;
    const entry = SITE_INDEX.find(x => x.id === saved.id);
    const targetPage = entry ? entry.page : saved.page;
    if (!targetPage) return;
    const isEn = document.documentElement.lang === 'en';
    const title = entry ? (isEn ? entry.en : entry.cs) : saved.id;
    const label = isEn ? 'Continue reading:' : 'Pokračovat v lekci:';
    banner.innerHTML = '<a href="' + targetPage + '.html#' + saved.id + '" class="flex items-center gap-3 px-5 py-4 rounded-2xl bg-brand-card border border-brand-accent/40 hover:border-brand-accent transition group">' +
      '<i class="fa-solid fa-arrow-rotate-right text-brand-accent shrink-0"></i>' +
      '<span class="text-sm text-slate-300 min-w-0"><b class="text-white">' + label + '</b> ' + title + '</span>' +
      '<i class="fa-solid fa-arrow-right ml-auto text-slate-500 group-hover:text-brand-accent transition shrink-0"></i></a>';
    banner.classList.remove('hidden');
  })();

  /* ================= Module feedback (thumbs up/down) ================= */
  (function moduleFeedback() {
    const KEY = 'kp_feedback';
    let voted = {};
    try { voted = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
    const upCls = ['bg-emerald-500/20', 'text-emerald-400'];
    const downCls = ['bg-rose-500/20', 'text-rose-400'];
    document.querySelectorAll('.kp-fb-btn').forEach(btn => {
      const mod = btn.dataset.mod;
      if (voted[mod] && voted[mod] === btn.dataset.fb) {
        btn.classList.add(...(btn.dataset.fb === 'up' ? upCls : downCls));
      }
      if (voted[mod]) btn.disabled = true;
    });
    document.addEventListener('click', e => {
      const btn = e.target.closest('.kp-fb-btn');
      if (!btn) return;
      const mod = btn.dataset.mod, vote = btn.dataset.fb;
      if (!mod || voted[mod]) return;
      voted[mod] = vote;
      try { localStorage.setItem(KEY, JSON.stringify(voted)); } catch (e2) {}
      if (window.gtag) window.gtag('event', 'module_feedback', { module_id: mod, vote: vote });
      const wrap = btn.parentElement;
      if (!wrap) return;
      wrap.querySelectorAll('.kp-fb-btn').forEach(b => { b.disabled = true; });
      btn.classList.add(...(vote === 'up' ? upCls : downCls));
      const label = wrap.querySelector('.kp-fb-label');
      if (label) {
        const isEn = document.documentElement.lang === 'en';
        label.textContent = isEn ? 'Thanks for the feedback!' : 'Díky za zpětnou vazbu!';
      }
    });
  })();

  /* ================= Completion certificate / gamification ================= */
  (function completionCertificate() {
    const VKEY = 'kp_visited_v1';
    const SKEY = 'kp_cert_seen_v1';
    function getVisited() { try { return JSON.parse(localStorage.getItem(VKEY) || '[]'); } catch (e) { return []; } }
    function setVisited(arr) { try { localStorage.setItem(VKEY, JSON.stringify(arr)); } catch (e) {} }
    const visited = new Set(getVisited().filter(id => ALL_MODULE_IDS.indexOf(id) !== -1));

    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function drawCertificate(name) {
      const canvas = document.createElement('canvas');
      canvas.width = 1200; canvas.height = 850;
      const ctx = canvas.getContext('2d');
      const isEn = document.documentElement.lang === 'en';
      const grad = ctx.createLinearGradient(0, 0, 1200, 850);
      grad.addColorStop(0, '#07090e'); grad.addColorStop(1, '#111827');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 1200, 850);
      ctx.strokeStyle = '#1fd98b'; ctx.lineWidth = 6; ctx.strokeRect(30, 30, 1140, 790);
      ctx.strokeStyle = 'rgba(31,217,139,0.35)'; ctx.lineWidth = 2; ctx.strokeRect(46, 46, 1108, 758);
      const lg = ctx.createLinearGradient(90, 90, 200, 200);
      lg.addColorStop(0, '#1fd98b'); lg.addColorStop(1, '#0ea5e9');
      ctx.fillStyle = lg; roundRect(ctx, 90, 90, 110, 110, 24); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 60px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('K', 145, 150);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 22px sans-serif';
      ctx.fillText(isEn ? 'CERTIFICATE OF COMPLETION' : 'CERTIFIKÁT O DOKONČENÍ', 230, 120);
      ctx.fillStyle = '#fff'; ctx.font = '900 44px sans-serif';
      ctx.fillText('KryptoProfík Masterclass', 230, 172);
      ctx.fillStyle = '#cbd5e1'; ctx.font = '22px sans-serif';
      ctx.fillText(isEn ? 'This certifies that' : 'Tímto se potvrzuje, že', 90, 320);
      ctx.fillStyle = '#1fd98b'; ctx.font = '900 54px sans-serif';
      ctx.fillText(name || (isEn ? 'KryptoProfík Student' : 'Student KryptoProfík'), 90, 390);
      ctx.fillStyle = '#cbd5e1'; ctx.font = '22px sans-serif';
      const line2 = isEn
        ? 'has completed all 31 lessons of the KryptoProfík crypto masterclass'
        : 'dokončil(a) všech 31 lekcí krypto masterclass KryptoProfík';
      const line3 = isEn
        ? '— wallets, exchanges, anti-scam, analysis, strategy and Czech taxes.'
        : '— peněženky, burzy, anti-scam, analýzu, strategii a daně v ČR.';
      ctx.fillText(line2, 90, 440);
      ctx.fillText(line3, 90, 475);
      const today = new Date().toLocaleDateString(isEn ? 'en-US' : 'cs-CZ');
      ctx.fillStyle = '#64748b'; ctx.font = '18px sans-serif';
      ctx.fillText((isEn ? 'Date: ' : 'Datum: ') + today, 90, 750);
      ctx.fillText('kryptoprofik.fun', 90, 775);
      kpDrawQr(ctx, 1040, 650, 110, 'https://kryptoprofik.fun');
      return canvas;
    }

    function openModal() {
      const isEn = document.documentElement.lang === 'en';
      let modal = document.getElementById('certModal');
      if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); return; }
      modal = document.createElement('div');
      modal.id = 'certModal';
      modal.className = 'fixed inset-0 z-[90] bg-black/80 flex items-center justify-center p-4 no-print';
      modal.innerHTML =
        '<div class="bg-brand-card border border-brand-border rounded-3xl p-6 max-w-lg w-full text-center max-h-[90vh] overflow-y-auto">' +
        '<div class="text-5xl mb-3">\u{1F393}</div>' +
        '<h2 class="text-2xl font-black text-white mb-2">' + (isEn ? 'Congratulations, you finished the masterclass!' : 'Gratulujeme, dokončili jste masterclass!') + '</h2>' +
        '<p class="text-slate-400 text-sm mb-4">' + (isEn ? 'You went through all 31 lessons. Grab your certificate below.' : 'Prošli jste si všech 31 lekcí. Níže si můžete stáhnout certifikát.') + '</p>' +
        '<input id="certName" type="text" placeholder="' + (isEn ? 'Your name (optional)' : 'Vaše jméno (nepovinné)') + '" class="w-full mb-4 px-4 py-2 rounded-xl bg-slate-900 border border-brand-border text-white text-sm" />' +
        '<canvas id="certCanvas" class="w-full rounded-xl border border-brand-border mb-4"></canvas>' +
        '<div class="flex gap-2">' +
        '<button id="certDownload" type="button" class="flex-1 px-4 py-2.5 rounded-xl bg-brand-accent hover:opacity-90 text-white font-bold text-sm transition">' + (isEn ? 'Download certificate' : 'Stáhnout certifikát') + '</button>' +
        '<button id="certClose" type="button" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition">' + (isEn ? 'Close' : 'Zavřít') + '</button>' +
        '</div></div>';
      document.body.appendChild(modal);
      const nameInput = document.getElementById('certName');
      const canvasBox = document.getElementById('certCanvas');
      function refresh() {
        const c = drawCertificate(nameInput.value.trim());
        canvasBox.width = c.width; canvasBox.height = c.height;
        canvasBox.getContext('2d').drawImage(c, 0, 0);
      }
      refresh();
      nameInput.addEventListener('input', refresh);
      document.getElementById('certClose').addEventListener('click', () => { modal.classList.add('hidden'); modal.classList.remove('flex'); });
      document.getElementById('certDownload').addEventListener('click', () => {
        const c = drawCertificate(nameInput.value.trim());
        const a = document.createElement('a');
        a.download = 'kryptoprofik-certifikat.png';
        a.href = c.toDataURL('image/png');
        a.click();
        if (window.gtag) window.gtag('event', 'certificate_download');
      });
    }

    function showTrophyBadge() {
      if (document.getElementById('certTrophyBtn')) return;
      const btn = document.createElement('button');
      btn.id = 'certTrophyBtn';
      btn.type = 'button';
      btn.title = document.documentElement.lang === 'en' ? 'View your certificate' : 'Zobrazit certifikát';
      btn.className = 'fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-[70] w-12 h-12 rounded-full bg-gradient-to-br from-brand-accent to-brand-blue shadow-lg flex items-center justify-center text-xl no-print';
      btn.innerHTML = '\u{1F3C6}';
      btn.addEventListener('click', openModal);
      document.body.appendChild(btn);
    }

    function maybeShowCertificate() {
      if (visited.size < ALL_MODULE_IDS.length) return;
      showTrophyBadge();
      let seen = null;
      try { seen = localStorage.getItem(SKEY); } catch (e) {}
      if (seen) return;
      try { localStorage.setItem(SKEY, '1'); } catch (e) {}
      openModal();
      if (window.gtag) window.gtag('event', 'masterclass_completed');
    }

    const container = document.getElementById('modulesContainer');
    if (container && 'IntersectionObserver' in window) {
      const obs2 = new IntersectionObserver(entries => {
        let changed = false;
        entries.forEach(en => {
          if (!en.isIntersecting) return;
          const id = en.target.id;
          if (id && ALL_MODULE_IDS.indexOf(id) !== -1 && !visited.has(id)) { visited.add(id); changed = true; }
        });
        if (changed) { setVisited(Array.from(visited)); maybeShowCertificate(); }
      }, { rootMargin: '-10% 0px -60% 0px', threshold: 0 });
      Array.from(container.children).forEach(a => { if (a.id) obs2.observe(a); });
    }

    if (visited.size >= ALL_MODULE_IDS.length) showTrophyBadge();
  })();

  /* ================= Czech crypto tax calculator (estimate) ================= */
  (function taxCalculator() {
    const buy = document.getElementById('taxBuy');
    const sell = document.getElementById('taxSell');
    const other = document.getElementById('taxOther');
    const held3y = document.getElementById('taxHeld3y');
    if (!buy || !sell) return;
    const BRACKET = 1582812;
    function fmtCzk(n) {
      const isEn = document.documentElement.lang === 'en';
      const num = Math.round(n).toLocaleString(isEn ? 'en-US' : 'cs-CZ');
      return num + ' ' + (isEn ? 'CZK' : 'Kč');
    }
    function calc() {
      const b = parseFloat(buy.value) || 0;
      const s = parseFloat(sell.value) || 0;
      const o = Math.max(0, parseFloat(other.value) || 0);
      const profit = Math.max(0, s - b);
      const exempt = !!(held3y && held3y.checked);
      const deminimis = !exempt && (profit + o) <= 100000;
      let tax = 0;
      if (!exempt && !deminimis) {
        const base = profit + o;
        if (base <= BRACKET) {
          tax = profit * 0.15;
        } else {
          const overBase = Math.max(0, base - BRACKET);
          const overProfit = Math.min(profit, overBase);
          const normalProfit = profit - overProfit;
          tax = normalProfit * 0.15 + overProfit * 0.23;
        }
      }
      const pEl = document.getElementById('taxProfit');
      const tEl = document.getElementById('taxOwed');
      const nEl = document.getElementById('taxNet');
      if (pEl) pEl.textContent = fmtCzk(profit);
      if (tEl) tEl.textContent = fmtCzk(tax);
      if (nEl) nEl.textContent = fmtCzk(profit - tax);
      const exemptNote = document.getElementById('taxExemptNote');
      const deminimisNote = document.getElementById('taxDeminimisNote');
      if (exemptNote) exemptNote.classList.toggle('hidden', !exempt);
      if (deminimisNote) deminimisNote.classList.toggle('hidden', !deminimis);
    }
    [buy, sell, other].forEach(el => el && el.addEventListener('input', calc));
    if (held3y) held3y.addEventListener('change', calc);
    calc();
  })();

  /* ================= Homepage chapter progress bars ================= */
  (function chapterProgressWidget() {
    const boxes = document.querySelectorAll('[data-kp-progress]');
    const badges = document.querySelectorAll('[data-kp-badge]');
    if (!boxes.length && !badges.length) return;
    let visited = [];
    try { visited = JSON.parse(localStorage.getItem('kp_visited_v1') || '[]'); } catch (e) {}
    const visitedSet = new Set(visited);
    const isEn = document.documentElement.lang === 'en';

    function showBadgeToast(chip) {
      const names = { 'm1': ['Základy', 'Basics'], 'penezenky': ['Peněženky', 'Wallets'], 'burzy': ['Burzy & DEX', 'Exchanges & DEX'], 'scam-checker': ['Anti-scam', 'Anti-scam'], 'm5': ['Analýza', 'Analysis'], 'm6': ['Strategie', 'Strategy'], 'tax-main': ['Daně v ČR', 'Czech taxes'] };
      const pair = names[chip] || [chip, chip];
      const label = isEn ? pair[1] : pair[0];
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[70] px-4 py-3 rounded-2xl bg-slate-900 border border-emerald-500/50 shadow-2xl flex items-center gap-3 text-sm max-w-[92vw]';
      toast.innerHTML = '<span class="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0"><i class="fa-solid fa-award"></i></span>' +
        '<span class="text-slate-200"><b class="text-white">' + (isEn ? 'Badge earned: ' : 'Odznak získán: ') + '</b>' + label + '</span>' +
        '<button type="button" class="kpBadgeShareBtn shrink-0 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold transition" style="min-height:1.75rem" title="' + (isEn ? 'Download image' : 'Stáhnout obrázek') + '"><i class="fa-solid fa-download"></i> ' + (isEn ? 'Save' : 'Uložit') + '</button>';
      document.body.appendChild(toast);
      // the cookie-consent bar (z-[80], full-width, bottom-0) can sit above and
      // cover this toast for first-time visitors -- lift above it when present
      const cookieBar = document.getElementById('cookieBar');
      if (cookieBar) {
        const h = cookieBar.getBoundingClientRect().height;
        toast.style.bottom = (h + 16) + 'px';
      }
      toast.style.zIndex = '85';
      const shareBtn = toast.querySelector('.kpBadgeShareBtn');
      if (shareBtn) shareBtn.addEventListener('click', () => { if (window.kpDownloadChapterBadge) window.kpDownloadChapterBadge(chip); });
      setTimeout(() => { toast.style.transition = 'opacity .4s'; toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 5000);
    }

    if (visited.length) {
      boxes.forEach(box => {
        const chip = box.getAttribute('data-kp-progress');
        const ids = CHAPTER_MODULES[chip] || [];
        if (!ids.length) return;
        const done = ids.filter(id => visitedSet.has(id)).length;
        if (done === 0) return;
        const pct = Math.round((done / ids.length) * 100);
        const fill = box.querySelector('div > div');
        if (fill) fill.style.width = pct + '%';
        const label = box.querySelector('[data-kp-progress-label]');
        if (label) label.textContent = (isEn ? `${done}/${ids.length} done` : `${done}/${ids.length} hotovo`) + (pct >= 100 ? ' \u2713' : '');
        box.classList.remove('hidden');
      });
    }

    if (badges.length) {
      let seen = {};
      try { seen = JSON.parse(localStorage.getItem('kp_badges_seen_v1') || '{}'); } catch (e) {}
      let seenChanged = false;
      badges.forEach(badge => {
        const chip = badge.getAttribute('data-kp-badge');
        const ids = CHAPTER_MODULES[chip] || [];
        if (!ids.length) return;
        const done = ids.filter(id => visitedSet.has(id)).length;
        if (done < ids.length) return;
        badge.classList.remove('hidden');
        badge.classList.add('flex');
        if (!badge.parentElement.querySelector('.kpBadgeDl')) {
          const dl = document.createElement('button');
          dl.type = 'button';
          dl.className = 'kpBadgeDl';
          dl.title = isEn ? 'Download image' : 'Stáhnout obrázek';
          dl.innerHTML = '<i class="fa-solid fa-download"></i>';
          dl.setAttribute('style', 'position:absolute;top:.5rem;right:3rem;width:2rem;height:2rem;border-radius:9999px;background:rgba(7,9,14,.85);border:1px solid rgba(16,185,129,.5);color:#34d399;display:flex;align-items:center;justify-content:center;font-size:.7rem;box-shadow:0 2px 8px rgba(0,0,0,.4);z-index:5');
          dl.addEventListener('click', e => {
            e.preventDefault(); e.stopPropagation();
            if (window.kpDownloadChapterBadge) window.kpDownloadChapterBadge(chip);
          });
          badge.parentElement.appendChild(dl);
        }
        if (!seen[chip]) { seen[chip] = true; seenChanged = true; showBadgeToast(chip); }
      });
      if (seenChanged) { try { localStorage.setItem('kp_badges_seen_v1', JSON.stringify(seen)); } catch (e) {} }
    }
  })();

  /* ================= Visual learning roadmap (homepage) ================= */
  (function roadmapMap() {
    const nodes = document.querySelectorAll('[data-road-id]');
    if (!nodes.length) return;
    let visited = [];
    try { visited = JSON.parse(localStorage.getItem('kp_visited_v1') || '[]'); } catch (e) {}
    const visitedSet = new Set(visited);
    let currentNode = null;
    nodes.forEach(node => {
      const id = node.getAttribute('data-road-id');
      const done = visitedSet.has(id);
      const numEl = node.querySelector('[data-road-num]');
      const checkEl = node.querySelector('[data-road-check]');
      if (done) {
        node.classList.add('kp-done');
        if (numEl) numEl.classList.add('hidden');
        if (checkEl) checkEl.classList.remove('hidden');
      } else if (!currentNode) {
        currentNode = node;
      }
    });
    if (currentNode) {
      currentNode.classList.add('kp-current');
      const badge = document.createElement('span');
      const isEn = document.documentElement.lang === 'en';
      badge.textContent = isEn ? 'you are here' : 'jste tady';
      badge.className = 'kp-road-here';
      currentNode.appendChild(badge);
    }
  })();

  /* ================= Smart "where to start" homepage quiz ================= */
  (function smartStartQuiz() {
    const wrap = document.getElementById('smartStartWrap');
    if (!wrap) return;
    try {
      const visited = JSON.parse(localStorage.getItem('kp_visited_v1') || '[]');
      if (visited.length) { wrap.classList.add('hidden'); return; }
    } catch (e) {}
    const answers = {};
    const resultEl = document.getElementById('ssqResult');
    function evaluate() {
      if (Object.keys(answers).length < 3) return;
      const isEn = document.documentElement.lang === 'en';
      const q1 = answers.q1, q2 = answers.q2, q3 = answers.q3;
      let slug, label;
      if (!q1 && !q2 && !q3) { slug = 'zaklady'; label = isEn ? 'Chapter 1: Basics' : 'Kapitola 1: Základy'; }
      else if (q1 && !q2) { slug = 'burzy'; label = isEn ? 'Chapter 3: Exchanges & DEX' : 'Kapitola 3: Burzy & DEX'; }
      else if (q1 && q2 && !q3) { slug = 'penezenky'; label = isEn ? 'Chapter 2: Wallets' : 'Kapitola 2: Peněženky'; }
      else { slug = 'analyza'; label = isEn ? 'Chapter 5: Analysis' : 'Kapitola 5: Analýza'; }
      const introText = isEn ? 'Based on your answers, start here:' : 'Podle vašich odpovědí začněte tady:';
      resultEl.innerHTML =
        '<p class="text-xs text-slate-400 mb-2">' + introText + '</p>' +
        '<a href="' + slug + '.html" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-accent text-white font-bold text-sm hover:opacity-90 transition">' +
        '<span>' + label + '</span><i class="fa-solid fa-arrow-right"></i></a>';
      resultEl.classList.remove('hidden');
    }
    document.querySelectorAll('[data-quiz-q]').forEach(row => {
      const qid = row.getAttribute('data-quiz-q');
      row.querySelectorAll('.ssq-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          answers[qid] = btn.getAttribute('data-val') === '1';
          row.querySelectorAll('.ssq-opt').forEach(b => {
            b.classList.remove('bg-emerald-500/20', 'text-emerald-400', 'bg-rose-500/20', 'text-rose-400');
          });
          const isYes = btn.getAttribute('data-val') === '1';
          btn.classList.add(isYes ? 'bg-emerald-500/20' : 'bg-rose-500/20', isYes ? 'text-emerald-400' : 'text-rose-400');
          evaluate();
        });
      });
    });
  })();

  /* ================= Portfolio tracker ================= */
  (function portfolioTracker() {
    const wrap = document.getElementById('portfolioTracker');
    if (!wrap) return;
    const KEY = 'kp_portfolio_v1';
    const COIN_NAMES = { bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL', binancecoin: 'BNB', ripple: 'XRP', cardano: 'ADA' };
    const rowsEl = document.getElementById('pfRows');
    const emptyEl = document.getElementById('pfEmpty');
    const totalsEl = document.getElementById('pfTotals');
    const totalValueEl = document.getElementById('pfTotalValue');
    const totalPlEl = document.getElementById('pfTotalPl');
    const chartEl = document.getElementById('pfChart');
    const pieEl = chartEl ? chartEl.querySelector('.pfPie') : null;
    const legendEl = chartEl ? chartEl.querySelector('.pfLegend') : null;
    const PIE_COLORS = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];
    let prices = {};

    function renderChart(items) {
      if (!chartEl || !pieEl || !legendEl) return;
      const byCoin = {};
      items.forEach(it => {
        const price = prices[it.id];
        if (!price) return;
        byCoin[it.id] = (byCoin[it.id] || 0) + it.amount * price;
      });
      const entries = Object.entries(byCoin).filter(e => e[1] > 0).sort((a, b) => b[1] - a[1]);
      const total = entries.reduce((s, e) => s + e[1], 0);
      if (!entries.length || total <= 0) { chartEl.classList.add('hidden'); return; }
      chartEl.classList.remove('hidden');
      let acc = 0;
      const stops = entries.map((e, i) => {
        const pct = (e[1] / total) * 100;
        const start = acc; acc += pct;
        return PIE_COLORS[i % PIE_COLORS.length] + ' ' + start.toFixed(2) + '% ' + acc.toFixed(2) + '%';
      }).join(', ');
      pieEl.style.background = 'conic-gradient(' + stops + ')';
      legendEl.innerHTML = entries.map((e, i) => {
        const pct = ((e[1] / total) * 100).toFixed(1);
        return '<div class="flex items-center gap-2 text-xs"><span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:' + PIE_COLORS[i % PIE_COLORS.length] + '"></span><span class="font-bold text-white">' + (COIN_NAMES[e[0]] || e[0]) + '</span><span class="text-slate-400 ml-auto">' + pct + '%</span></div>';
      }).join('');
    }

    function load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
    function save(items) { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} }
    function fmt(n) {
      const isEn = document.documentElement.lang === 'en';
      return Math.round(n).toLocaleString(isEn ? 'en-US' : 'cs-CZ') + ' ' + (isEn ? 'CZK' : 'Kč');
    }

    async function fetchJsonLocal(url) {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      try {
        const r = await fetch(url, { signal: ctrl.signal });
        if (!r.ok) throw new Error(String(r.status));
        return await r.json();
      } finally { clearTimeout(t); }
    }

    function renderRebalance(items) {
      const wrap = document.getElementById('pfRebalanceWrap');
      const list = document.getElementById('pfRebalanceList');
      const hint = document.getElementById('pfRebalanceHint');
      if (!wrap || !list) return;
      const isEn = document.documentElement.lang === 'en';
      const byCoin = {};
      items.forEach(it => {
        const price = prices[it.id];
        const value = price ? it.amount * price : 0;
        if (!byCoin[it.id]) byCoin[it.id] = { value: 0, target: null };
        byCoin[it.id].value += value;
        if (typeof it.target === 'number' && !isNaN(it.target)) byCoin[it.id].target = it.target;
      });
      const entries = Object.entries(byCoin).filter(e => e[1].target !== null);
      if (!entries.length) { wrap.classList.add('hidden'); list.innerHTML = ''; if (hint) hint.classList.remove('hidden'); return; }
      const totalValue = Object.values(byCoin).reduce((s, v) => s + v.value, 0);
      wrap.classList.remove('hidden');
      if (hint) hint.classList.add('hidden');
      if (!totalValue) { list.innerHTML = ''; return; }
      list.innerHTML = entries.map(([id, info]) => {
        const currentPct = (info.value / totalValue) * 100;
        const targetPct = info.target;
        const diffPct = targetPct - currentPct;
        const diffValue = (diffPct / 100) * totalValue;
        const onTarget = Math.abs(diffPct) < 1;
        const action = onTarget ? null : (diffValue > 0 ? 'buy' : 'sell');
        const label = COIN_NAMES[id] || id;
        const color = action === 'buy' ? 'text-emerald-400' : action === 'sell' ? 'text-rose-400' : 'text-slate-500';
        const actionLabel = onTarget ? (isEn ? 'On target' : 'Na cíli') : (action === 'buy' ? (isEn ? 'Buy' : 'Dokoupit') : (isEn ? 'Sell' : 'Prodat'));
        return '<div class="flex items-center justify-between py-1 gap-2 flex-wrap">' +
          '<span class="text-slate-300 font-bold w-14 shrink-0">' + label + '</span>' +
          '<span class="text-slate-500 font-mono">' + currentPct.toFixed(1) + '% → ' + targetPct.toFixed(0) + '%</span>' +
          '<span class="font-mono font-bold ' + color + '">' + actionLabel + (action ? ' ' + fmt(Math.abs(diffValue)) : '') + '</span>' +
          '</div>';
      }).join('');
    }

    function render() {
      const items = load();
      rowsEl.innerHTML = '';
      if (!items.length) {
        emptyEl.classList.remove('hidden');
        totalsEl.classList.add('hidden');
        if (chartEl) chartEl.classList.add('hidden');
        const rbWrap = document.getElementById('pfRebalanceWrap');
        if (rbWrap) rbWrap.classList.add('hidden');
        return;
      }
      emptyEl.classList.add('hidden');
      renderChart(items);
      let totalValue = 0, totalCost = 0, haveAnyPrice = false;
      items.forEach((it, idx) => {
        const price = prices[it.id];
        const value = price ? it.amount * price : null;
        if (value !== null) { totalValue += value; haveAnyPrice = true; }
        totalCost += it.buyCzk;
        const pl = value !== null ? value - it.buyCzk : null;
        const plPct = (value !== null && it.buyCzk > 0) ? (pl / it.buyCzk) * 100 : null;
        const row = document.createElement('div');
        row.className = 'flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-brand-border flex-wrap';
        const plColor = pl === null ? 'text-slate-400' : (pl >= 0 ? 'text-emerald-400' : 'text-rose-400');
        row.innerHTML =
          '<span class="font-bold text-white w-14 shrink-0">' + (COIN_NAMES[it.id] || it.id) + '</span>' +
          '<span class="text-slate-400 text-xs font-mono flex-1 min-w-[80px]">' + it.amount + '</span>' +
          '<span class="font-mono text-xs text-slate-300 w-24 text-right">' + (value !== null ? fmt(value) : '…') + '</span>' +
          '<span class="font-mono text-xs font-bold w-28 text-right ' + plColor + '">' + (pl !== null ? (pl >= 0 ? '+' : '') + fmt(pl) + (plPct !== null ? ' (' + plPct.toFixed(1) + '%)' : '') : '…') + '</span>' +
          '<button type="button" class="pf-remove shrink-0 w-7 h-7 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 text-xs" aria-label="Odebrat" title="Odebrat"><i class="fa-solid fa-xmark"></i></button>';
        row.querySelector('.pf-remove').addEventListener('click', () => {
          const all = load();
          all.splice(idx, 1);
          save(all);
          render();
        });
        rowsEl.appendChild(row);
      });
      if (haveAnyPrice) {
        totalsEl.classList.remove('hidden');
        totalValueEl.textContent = fmt(totalValue);
        const totalPl = totalValue - totalCost;
        totalPlEl.textContent = (totalPl >= 0 ? '+' : '') + fmt(totalPl);
        totalPlEl.className = 'font-mono font-bold block sm:text-xl sm:mt-1 ' + (totalPl >= 0 ? 'text-emerald-400' : 'text-rose-400');
      } else {
        totalsEl.classList.add('hidden');
      }
      renderRebalance(items);
    }

    async function refreshPrices() {
      const items = load();
      if (!items.length) return;
      const ids = Array.from(new Set(items.map(it => it.id))).join(',');
      try {
        const data = await fetchJsonLocal('https://api.coingecko.com/api/v3/simple/price?ids=' + ids + '&vs_currencies=czk');
        prices = {};
        Object.keys(data).forEach(id => { prices[id] = data[id].czk; });
        render();
      } catch (e) { /* offline or blocked: keep showing last-known values */ }
    }

    document.getElementById('pfAdd').addEventListener('click', () => {
      const coin = document.getElementById('pfCoin').value;
      const amount = parseFloat(document.getElementById('pfAmount').value);
      const buyCzk = parseFloat(document.getElementById('pfBuyCzk').value);
      const targetRaw = document.getElementById('pfTarget').value;
      const target = targetRaw === '' ? null : parseFloat(targetRaw);
      if (!coin || !amount || amount <= 0 || isNaN(buyCzk) || buyCzk < 0) return;
      const entry = { id: coin, amount: amount, buyCzk: buyCzk };
      if (target !== null && !isNaN(target) && target >= 0) entry.target = target;
      const items = load();
      items.push(entry);
      save(items);
      document.getElementById('pfAmount').value = '';
      document.getElementById('pfBuyCzk').value = '';
      document.getElementById('pfTarget').value = '';
      render();
      refreshPrices();
    });
    document.getElementById('pfRefresh').addEventListener('click', refreshPrices);

    const exportBtn = document.getElementById('pfExportCsv');
    if (exportBtn) exportBtn.addEventListener('click', () => {
      const items = load();
      if (!items.length) return;
      const isEn = document.documentElement.lang === 'en';
      const header = isEn
        ? ['Coin', 'Amount', 'Purchase price (CZK)', 'Current price (CZK)', 'Current value (CZK)', 'Profit/Loss (CZK)', 'Target allocation %']
        : ['Mince', 'Množství', 'Nákupní cena (Kč)', 'Aktuální cena (Kč)', 'Aktuální hodnota (Kč)', 'Zisk/ztráta (Kč)', 'Cílová alokace %'];
      const rows = items.map(it => {
        const price = prices[it.id];
        const value = price ? it.amount * price : '';
        const pl = price ? (value - it.buyCzk) : '';
        return [COIN_NAMES[it.id] || it.id, it.amount, it.buyCzk, price || '', value, pl, (typeof it.target === 'number' ? it.target : '')];
      });
      const csvLines = [header].concat(rows).map(r => r.map(v => {
        const s = String(v);
        return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(';'));
      const csv = '\uFEFF' + csvLines.join('\r\n');
      try {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'kryptoprofik-portfolio.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (e) {}
    });

    render();
    if (load().length) refreshPrices();
  })();

  /* ================= "Co kdybych investoval" historical what-if simulator ================= */
  (function whatifSimulator() {
    const wrap = document.getElementById('whatifSim');
    if (!wrap) return;
    const COIN_NAMES = { bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL', binancecoin: 'BNB', ripple: 'XRP', cardano: 'ADA' };
    const dateInput = document.getElementById('wiDate');
    if (dateInput) { dateInput.max = new Date().toISOString().slice(0, 10); dateInput.min = '2013-04-28'; }

    async function fetchJsonLocal(url) {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 10000);
      try {
        const r = await fetch(url, { signal: ctrl.signal });
        if (!r.ok) throw new Error(String(r.status));
        return await r.json();
      } finally { clearTimeout(t); }
    }
    function fmt(n) {
      const isEn = document.documentElement.lang === 'en';
      return Math.round(n).toLocaleString(isEn ? 'en-US' : 'cs-CZ') + ' ' + (isEn ? 'CZK' : 'Kč');
    }

    document.getElementById('wiCalc').addEventListener('click', async () => {
      const isEn = document.documentElement.lang === 'en';
      const amount = parseFloat(document.getElementById('wiAmount').value);
      const coin = document.getElementById('wiCoin').value;
      const dateVal = document.getElementById('wiDate').value;
      const resultEl = document.getElementById('wiResult');
      const errorEl = document.getElementById('wiError');
      resultEl.classList.add('hidden');
      errorEl.classList.add('hidden');
      if (!amount || amount <= 0 || !dateVal) return;
      const d = new Date(dateVal + 'T00:00:00Z');
      if (isNaN(d.getTime()) || d > new Date()) return;
      const dd = String(d.getUTCDate()).padStart(2, '0');
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const yyyy = d.getUTCFullYear();
      const histDate = dd + '-' + mm + '-' + yyyy;
      const btn = document.getElementById('wiCalc');
      const origHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5"></i>' + (isEn ? 'Calculating…' : 'Počítám…');
      try {
        const [hist, now] = await Promise.all([
          fetchJsonLocal('https://api.coingecko.com/api/v3/coins/' + coin + '/history?date=' + histDate + '&localization=false'),
          fetchJsonLocal('https://api.coingecko.com/api/v3/simple/price?ids=' + coin + '&vs_currencies=czk'),
        ]);
        const pastPrice = hist && hist.market_data && hist.market_data.current_price && hist.market_data.current_price.czk;
        const nowPrice = now && now[coin] && now[coin].czk;
        if (!pastPrice || !nowPrice) throw new Error('no-data');
        const units = amount / pastPrice;
        const valueNow = units * nowPrice;
        const diff = valueNow - amount;
        const diffPct = (diff / amount) * 100;
        const sym = COIN_NAMES[coin] || coin;
        const diffColor = diff >= 0 ? 'text-emerald-400' : 'text-rose-400';
        resultEl.innerHTML =
          '<div class="flex justify-between text-xs text-slate-400 mb-2"><span>' + (isEn ? 'Bought' : 'Koupeno') + '</span><span class="font-mono">' + units.toFixed(6) + ' ' + sym + '</span></div>' +
          '<div class="flex justify-between text-xs text-slate-400 mb-3"><span>' + (isEn ? 'Price then' : 'Cena tehdy') + '</span><span class="font-mono">' + fmt(pastPrice) + '</span></div>' +
          '<div class="flex justify-between items-end pt-3 border-t border-brand-border"><span class="font-semibold text-slate-200">' + (isEn ? 'Value today' : 'Hodnota dnes') + '</span><span class="font-mono text-2xl font-black text-white">' + fmt(valueNow) + '</span></div>' +
          '<div class="text-right font-mono text-sm font-bold ' + diffColor + ' mt-1">' + (diff >= 0 ? '+' : '') + fmt(diff) + ' (' + (diffPct >= 0 ? '+' : '') + diffPct.toFixed(1) + '%)</div>';
        resultEl.classList.remove('hidden');
      } catch (e) {
        errorEl.textContent = isEn ? 'Could not load historical data. Try again later or pick a different date.' : 'Nepodařilo se načíst historická data. Zkuste to později nebo zvolte jiné datum.';
        errorEl.classList.remove('hidden');
      } finally {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
    });
  })();

  /* ================= Staking yield calculator ================= */
  (function stakingCalculator() {
    const wrap = document.getElementById('stakingCalc');
    if (!wrap) return;
    const amountEl = document.getElementById('stkAmount');
    const apyEl = document.getElementById('stkApy');
    const monthsEl = document.getElementById('stkMonths');
    const freqEl = document.getElementById('stkFreq');
    const valueOut = document.getElementById('stkTotalValue');
    const yieldOut = document.getElementById('stkTotalYield');

    function fmt(n) {
      const isEn = document.documentElement.lang === 'en';
      return Math.round(n).toLocaleString(isEn ? 'en-US' : 'cs-CZ') + ' ' + (isEn ? 'CZK' : 'Kč');
    }

    function calc() {
      const amount = parseFloat(amountEl.value);
      const apy = parseFloat(apyEl.value);
      const months = parseFloat(monthsEl.value);
      const n = parseFloat(freqEl.value);
      if (!(amount > 0) || !(apy >= 0) || !(months > 0) || !(n > 0)) {
        valueOut.textContent = '–';
        yieldOut.textContent = '–';
        return;
      }
      const years = months / 12;
      const r = apy / 100;
      const futureValue = amount * Math.pow(1 + r / n, n * years);
      const yieldAmount = futureValue - amount;
      valueOut.textContent = fmt(futureValue);
      yieldOut.textContent = (yieldAmount >= 0 ? '+' : '') + fmt(yieldAmount);
    }

    const btn = document.getElementById('stkCalc');
    if (btn) btn.addEventListener('click', calc);
    [amountEl, apyEl, monthsEl, freqEl].forEach(el => {
      if (el) el.addEventListener('change', calc);
    });
    window.kpRerenderStaking = calc;
    calc();
  })();

  /* ================= Shareable chapter badge image (IG story format) ================= */
  (function chapterBadgeShare() {
    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    function drawChapterBadge(chip) {
      const meta = CH_META[chip]; if (!meta) return null;
      const isEn = document.documentElement.lang === 'en';
      let visited = [];
      try { visited = JSON.parse(localStorage.getItem('kp_visited_v1') || '[]'); } catch (e) {}
      const visitedSet = new Set(visited);
      const total = ALL_MODULE_IDS.length;
      const done = ALL_MODULE_IDS.filter(id => visitedSet.has(id)).length;
      const W = 1080, H = 1920;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#07090e'); bg.addColorStop(1, '#0f172a');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = meta.c1; ctx.lineWidth = 8; ctx.strokeRect(36, 36, W - 72, H - 72);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2; ctx.strokeRect(58, 58, W - 116, H - 116);
      // wordmark
      const lg = ctx.createLinearGradient(W / 2 - 54, 140, W / 2 + 54, 248);
      lg.addColorStop(0, '#1fd98b'); lg.addColorStop(1, '#0ea5e9');
      ctx.fillStyle = lg; roundRect(ctx, W / 2 - 54, 140, 108, 108, 26); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '900 58px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('K', W / 2, 198);
      ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 30px sans-serif'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('KRYPTOPROFÍK', W / 2, 300);
      // big chapter circle
      const cy = 620, r = 220;
      const grad = ctx.createLinearGradient(W / 2 - r, cy - r, W / 2 + r, cy + r);
      grad.addColorStop(0, meta.c1); grad.addColorStop(1, meta.c2);
      ctx.beginPath(); ctx.arc(W / 2, cy, r, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 6; ctx.stroke();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(W / 2 - 95, cy + 5); ctx.lineTo(W / 2 - 25, cy + 80); ctx.lineTo(W / 2 + 105, cy - 90); ctx.stroke();
      // labels
      ctx.fillStyle = meta.c1; ctx.font = '900 32px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText((isEn ? 'CHAPTER COMPLETE' : 'KAPITOLA DOKONČENA'), W / 2, cy + r + 90);
      ctx.fillStyle = '#fff'; ctx.font = '900 64px sans-serif';
      const title = (isEn ? meta.en : meta.cs);
      ctx.fillText(title, W / 2, cy + r + 170);
      ctx.fillStyle = '#cbd5e1'; ctx.font = '30px sans-serif';
      ctx.fillText('KryptoProfík masterclass', W / 2, cy + r + 225);
      // overall progress bar
      const barW = 760, barX = W / 2 - barW / 2, barY = cy + r + 300, barH = 20;
      ctx.fillStyle = 'rgba(255,255,255,.1)'; roundRect(ctx, barX, barY, barW, barH, barH / 2); ctx.fill();
      const pct = total ? Math.max(0.02, done / total) : 0;
      const pg = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      pg.addColorStop(0, '#1fd98b'); pg.addColorStop(1, '#0ea5e9');
      ctx.fillStyle = pg; roundRect(ctx, barX, barY, barW * pct, barH, barH / 2); ctx.fill();
      ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 26px sans-serif';
      ctx.fillText((isEn ? `${done}/${total} lessons done overall` : `Celkem hotovo ${done}/${total} lekcí`), W / 2, barY + 64);
      // QR code -> real traffic from shared Instagram stories
      const qrSize = 220;
      kpDrawQr(ctx, W / 2 - qrSize / 2, barY + 160, qrSize, 'https://kryptoprofik.fun');
      ctx.fillStyle = '#64748b'; ctx.font = 'bold 24px sans-serif';
      ctx.fillText(isEn ? 'Scan to start learning' : 'Naskenuj a začni se učit', W / 2, barY + 160 + qrSize + 50);
      // footer
      ctx.fillStyle = '#64748b'; ctx.font = '26px sans-serif';
      ctx.fillText('kryptoprofik.fun', W / 2, H - 90);
      return canvas;
    }
    window.kpDownloadChapterBadge = function (chip) {
      const c = drawChapterBadge(chip);
      if (!c) return;
      const a = document.createElement('a');
      a.download = 'kryptoprofik-' + chip + '.png';
      a.href = c.toDataURL('image/png');
      a.click();
      if (window.gtag) window.gtag('event', 'chapter_badge_download', { chip });
    };
  })();

  /* ================= Chapter mini-quiz ("Otestujte se") ================= */
  (function chapterMiniQuiz() {
    const wraps = document.querySelectorAll('[data-ch-quiz]');
    if (!wraps.length) return;
    let isEn = document.documentElement.lang === 'en';
    const PKEY = 'kp_quiz_passed_v1';
    function getPassed() { try { return JSON.parse(localStorage.getItem(PKEY) || '{}'); } catch (e) { return {}; } }
    function setPassed(obj) { try { localStorage.setItem(PKEY, JSON.stringify(obj)); } catch (e) {} }
    const rerenders = [];
    window.kpRerenderChQuiz = function () { rerenders.forEach(fn => { try { fn(); } catch (e) {} }); };

    wraps.forEach(wrap => {
      const chip = wrap.getAttribute('data-ch-quiz');
      const qs = (CH_QUIZ[chip] || []);
      if (!qs.length) { wrap.closest('section') && wrap.closest('section').remove(); return; }
      let qi = 0, score = 0, answered = false;
      const passedMap = getPassed();
      const already = !!passedMap[chip];

      function pct(o) { return isEn ? o.en : o.cs; }

      function render() {
        isEn = document.documentElement.lang === 'en';
        if (qi >= qs.length) {
          const passed = score === qs.length;
          if (passed && !passedMap[chip]) { passedMap[chip] = true; setPassed(passedMap); }
          wrap.innerHTML =
            '<div class="text-center">' +
            '<div class="text-4xl mb-3">' + (passed ? '\u{1F3C5}' : '\u{1F504}') + '</div>' +
            '<h3 class="text-xl font-black text-white mb-2">' + (passed
              ? (isEn ? 'Great, you know this chapter!' : 'Skvěle, tuhle kapitolu umíte!')
              : (isEn ? 'Almost — give it another try' : 'Skoro — zkuste to ještě jednou')) + '</h3>' +
            '<p class="text-slate-400 text-sm mb-5">' + (isEn ? 'Score: ' : 'Skóre: ') + score + ' / ' + qs.length + '</p>' +
            '<div class="flex gap-2 justify-center flex-wrap">' +
            '<button type="button" class="chQuizRetry px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition">' + (isEn ? 'Try again' : 'Zkusit znovu') + '</button>' +
            (passed ? '<button type="button" class="chQuizShare px-4 py-2.5 rounded-xl bg-brand-accent hover:opacity-90 text-white font-bold text-sm transition"><i class="fa-solid fa-download mr-1.5"></i>' + (isEn ? 'Download badge' : 'Stáhnout odznak') + '</button>' : '') +
            '</div></div>';
          wrap.querySelector('.chQuizRetry').addEventListener('click', () => { qi = 0; score = 0; render(); });
          const shareBtn = wrap.querySelector('.chQuizShare');
          if (shareBtn) shareBtn.addEventListener('click', () => { if (window.kpDownloadChapterBadge) window.kpDownloadChapterBadge(chip); });
          return;
        }
        const it = qs[qi];
        answered = false;
        let optsHtml = '';
        pct(it.o).forEach((opt, i) => {
          optsHtml += '<button type="button" class="chQuizOpt w-full text-left px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition text-sm font-bold text-slate-200 mb-2" data-i="' + i + '">' + opt + '</button>';
        });
        wrap.innerHTML =
          '<div class="flex justify-between text-xs font-bold text-slate-400 mb-3"><span>' + (isEn ? 'Question ' : 'Otázka ') + (qi + 1) + ' / ' + qs.length + '</span><span>' + (isEn ? 'Score: ' : 'Skóre: ') + score + '</span></div>' +
          '<h3 class="text-base sm:text-lg font-bold text-white mb-4">' + pct(it.q) + '</h3>' +
          '<div id="chQuizOpts">' + optsHtml + '</div>' +
          '<p class="hidden mt-3 text-xs text-slate-300 bg-slate-900 border border-brand-border rounded-xl p-3" id="chQuizExplain"></p>' +
          '<div class="mt-4 flex justify-end"><button type="button" class="hidden chQuizNext px-5 py-2 rounded-xl bg-brand-accent text-white text-sm font-bold hover:opacity-90 transition">' + (isEn ? 'Next' : 'Další') + '</button></div>';
        wrap.querySelectorAll('.chQuizOpt').forEach(btn => {
          btn.addEventListener('click', () => {
            if (answered) return;
            answered = true;
            const i = parseInt(btn.getAttribute('data-i'), 10);
            const correct = i === it.a;
            if (correct) score++;
            wrap.querySelectorAll('.chQuizOpt').forEach(b2 => {
              const i2 = parseInt(b2.getAttribute('data-i'), 10);
              if (i2 === it.a) { b2.style.background = 'rgba(16,185,129,.25)'; b2.style.color = '#34d399'; }
              else if (i2 === i) { b2.style.background = 'rgba(244,63,94,.2)'; b2.style.color = '#fb7185'; }
            });
            const ex = wrap.querySelector('#chQuizExplain');
            ex.textContent = pct(it.e); ex.classList.remove('hidden');
            const nx = wrap.querySelector('.chQuizNext');
            nx.textContent = qi === qs.length - 1 ? (isEn ? 'See result' : 'Zobrazit výsledek') : (isEn ? 'Next' : 'Další');
            nx.classList.remove('hidden');
            nx.addEventListener('click', () => { qi++; render(); }, { once: true });
          });
        });
      }

      function renderAlready() {
        isEn = document.documentElement.lang === 'en';
        wrap.innerHTML =
          '<div class="text-center">' +
          '<div class="text-4xl mb-3">\u{2705}</div>' +
          '<h3 class="text-lg font-black text-white mb-2">' + (isEn ? 'You already passed this quiz' : 'Tenhle kvíz už máte splněný') + '</h3>' +
          '<div class="flex gap-2 justify-center flex-wrap">' +
          '<button type="button" class="chQuizRetry px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition">' + (isEn ? 'Try again' : 'Zkusit znovu') + '</button>' +
          '<button type="button" class="chQuizShare px-4 py-2.5 rounded-xl bg-brand-accent hover:opacity-90 text-white font-bold text-sm transition"><i class="fa-solid fa-download mr-1.5"></i>' + (isEn ? 'Download badge' : 'Stáhnout odznak') + '</button>' +
          '</div></div>';
        wrap.querySelector('.chQuizRetry').addEventListener('click', () => { qi = 0; score = 0; stillAlready = false; render(); });
        wrap.querySelector('.chQuizShare').addEventListener('click', () => { if (window.kpDownloadChapterBadge) window.kpDownloadChapterBadge(chip); });
      }

      let stillAlready = already;
      rerenders.push(() => { if (stillAlready) renderAlready(); else render(); });
      if (already) { renderAlready(); } else { render(); }
    });
  })();

  /* ================= Investor risk-profile quiz + shareable result ================= */
  (function riskProfileQuiz() {
    const wrap = document.querySelector('[data-risk-quiz]');
    if (!wrap) return;
    let isEn = document.documentElement.lang === 'en';
    let qi = 0, score = 0;

    function band(s) { return s <= 4 ? 'conservative' : (s <= 10 ? 'balanced' : 'aggressive'); }
    function t(o) { return isEn ? o.en : o.cs; }

    function drawRiskCard(key) {
      const p = RISK_PROFILES[key]; if (!p) return null;
      const W = 1080, H = 1920;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#07090e'); bg.addColorStop(1, '#0f172a');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = p.c1; ctx.lineWidth = 8; ctx.strokeRect(36, 36, W - 72, H - 72);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2; ctx.strokeRect(58, 58, W - 116, H - 116);
      const lg = ctx.createLinearGradient(W / 2 - 54, 140, W / 2 + 54, 248);
      lg.addColorStop(0, '#1fd98b'); lg.addColorStop(1, '#0ea5e9');
      ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(W / 2 - 54 + 26, 140); ctx.lineTo(W / 2 + 54 - 26, 140);
      ctx.arcTo(W / 2 + 54, 140, W / 2 + 54, 140 + 26, 26); ctx.lineTo(W / 2 + 54, 140 + 108 - 26);
      ctx.arcTo(W / 2 + 54, 140 + 108, W / 2 + 54 - 26, 140 + 108, 26); ctx.lineTo(W / 2 - 54 + 26, 140 + 108);
      ctx.arcTo(W / 2 - 54, 140 + 108, W / 2 - 54, 140 + 108 - 26, 26); ctx.lineTo(W / 2 - 54, 140 + 26);
      ctx.arcTo(W / 2 - 54, 140, W / 2 - 54 + 26, 140, 26); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '900 58px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('K', W / 2, 198);
      ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 30px sans-serif'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('KRYPTOPROFÍK', W / 2, 300);
      ctx.font = '160px sans-serif';
      ctx.fillText(p.emoji, W / 2, 560);
      ctx.fillStyle = p.c1; ctx.font = '900 32px sans-serif';
      ctx.fillText((isEn ? 'YOUR INVESTOR PROFILE' : 'TVŮJ INVESTIČNÍ PROFIL'), W / 2, 660);
      ctx.fillStyle = '#fff'; ctx.font = '900 70px sans-serif';
      ctx.fillText(t(p.title), W / 2, 745);
      ctx.fillStyle = '#cbd5e1'; ctx.font = '30px sans-serif';
      wrapText(ctx, t(p.tag), W / 2, 805, 820, 40);
      ctx.fillStyle = '#64748b'; ctx.font = '24px sans-serif';
      wrapText(ctx, (isEn ? 'Educational result, not financial advice.' : 'Vzdělávací výsledek, ne finanční poradenství.'), W / 2, 920, 760, 32);
      const qrSize = 230;
      kpDrawQr(ctx, W / 2 - qrSize / 2, 1020, qrSize, 'https://kryptoprofik.fun');
      ctx.fillStyle = '#64748b'; ctx.font = 'bold 24px sans-serif';
      ctx.fillText(isEn ? 'Take the test yourself' : 'Udělej si test sám/sama', W / 2, 1020 + qrSize + 50);
      ctx.fillStyle = '#64748b'; ctx.font = '26px sans-serif';
      ctx.fillText('kryptoprofik.fun', W / 2, H - 90);
      return canvas;
    }
    function wrapText(ctx, text, cx, y, maxWidth, lineHeight) {
      const words = text.split(' ');
      let line = '', lines = [];
      words.forEach(w => {
        const test = line ? line + ' ' + w : w;
        if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; }
        else line = test;
      });
      if (line) lines.push(line);
      lines.forEach((l, i) => ctx.fillText(l, cx, y + i * lineHeight));
    }
    window.kpDownloadRiskProfile = function (key) {
      const c = drawRiskCard(key);
      if (!c) return;
      const a = document.createElement('a');
      a.download = 'kryptoprofik-profil-' + key + '.png';
      a.href = c.toDataURL('image/png');
      a.click();
      if (window.gtag) window.gtag('event', 'risk_profile_download', { profile: key });
    };

    function renderResult() {
      isEn = document.documentElement.lang === 'en';
      const key = band(score);
      const p = RISK_PROFILES[key];
      let chaptersHtml = '';
      p.chapters.forEach(c => {
        chaptersHtml += '<a href="' + c.href + '" class="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition text-xs font-bold text-slate-200 mb-2"><i class="fa-solid fa-arrow-right text-brand-accent"></i>' + t({ cs: c.cs, en: c.en }) + '</a>';
      });
      wrap.innerHTML =
        '<div class="text-center">' +
        '<div class="text-5xl mb-2">' + p.emoji + '</div>' +
        '<span class="text-brand-accent text-xs font-bold uppercase tracking-widest">' + (isEn ? 'Your investor profile' : 'Tvůj investiční profil') + '</span>' +
        '<h3 class="text-2xl font-black text-white mt-1 mb-2">' + t(p.title) + '</h3>' +
        '<p class="text-slate-400 text-sm mb-4 max-w-md mx-auto">' + t(p.desc) + '</p>' +
        '<p class="text-slate-500 text-[11px] mb-5">' + (isEn ? 'This is an educational self-assessment, not financial advice.' : 'Jde o vzdělávací sebehodnocení, ne finanční poradenství.') + '</p>' +
        '<p class="text-slate-300 text-xs font-bold mb-2">' + (isEn ? 'Recommended for you:' : 'Doporučujeme ti:') + '</p>' +
        '<div class="flex flex-col max-w-xs mx-auto mb-5">' + chaptersHtml + '</div>' +
        '<div class="flex gap-2 justify-center flex-wrap">' +
        '<button type="button" class="riskRetry px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition">' + (isEn ? 'Try again' : 'Zkusit znovu') + '</button>' +
        '<button type="button" class="riskShare px-4 py-2.5 rounded-xl bg-brand-accent hover:opacity-90 text-white font-bold text-sm transition"><i class="fa-solid fa-download mr-1.5"></i>' + (isEn ? 'Download result' : 'Stáhnout výsledek') + '</button>' +
        '</div></div>';
      wrap.querySelector('.riskRetry').addEventListener('click', () => { qi = 0; score = 0; renderQuestion(); });
      wrap.querySelector('.riskShare').addEventListener('click', () => window.kpDownloadRiskProfile(key));
      if (window.gtag) window.gtag('event', 'risk_profile_complete', { profile: key });
      try { localStorage.setItem('kp_risk_profile_v1', JSON.stringify({ key: key, ts: Date.now() })); } catch (e) {}
      if (window.kpRerenderMyProgress) window.kpRerenderMyProgress();
    }

    window.kpRerenderRiskQuiz = function () { if (qi >= RISK_QUIZ.length) renderResult(); else renderQuestion(); };

    function renderQuestion() {
      isEn = document.documentElement.lang === 'en';
      if (qi >= RISK_QUIZ.length) { renderResult(); return; }
      const it = RISK_QUIZ[qi];
      let optsHtml = '';
      t(it.o).forEach((opt, i) => {
        optsHtml += '<button type="button" class="riskOpt w-full text-left px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition text-sm font-bold text-slate-200 mb-2" data-i="' + i + '">' + opt + '</button>';
      });
      wrap.innerHTML =
        '<div class="flex justify-between text-xs font-bold text-slate-400 mb-3"><span>' + (isEn ? 'Question ' : 'Otázka ') + (qi + 1) + ' / ' + RISK_QUIZ.length + '</span></div>' +
        '<h3 class="text-base sm:text-lg font-bold text-white mb-4">' + t(it.q) + '</h3>' +
        '<div>' + optsHtml + '</div>';
      wrap.querySelectorAll('.riskOpt').forEach(btn => {
        btn.addEventListener('click', () => {
          score += parseInt(btn.getAttribute('data-i'), 10);
          qi++;
          renderQuestion();
        });
      });
    }

    renderQuestion();
  })();

  /* ================= Personal notes under each lesson ================= */
  (function lessonNotes() {
    const boxes = document.querySelectorAll('[data-mod-notes]');
    if (!boxes.length) return;
    const KEY = 'kp_notes_v1';
    function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
    function save(all) { try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) {} }
    const all = load();

    boxes.forEach(box => {
      const mid = box.getAttribute('data-mod-notes');
      const toggle = box.querySelector('.kp-notes-toggle');
      const chevron = box.querySelector('.kp-notes-chevron');
      const body = box.querySelector('.kp-notes-body');
      const textarea = box.querySelector('.kp-notes-text');
      const savedTag = box.querySelector('.kp-notes-saved');
      if (!toggle || !body || !textarea) return;

      const existing = all[mid] || '';
      textarea.value = existing;
      if (existing) {
        body.classList.remove('hidden');
        if (chevron) chevron.classList.add('rotate-180');
        toggle.classList.add('text-brand-accent');
      }

      function setOpen(open) {
        body.classList.toggle('hidden', !open);
        if (chevron) chevron.classList.toggle('rotate-180', open);
      }
      toggle.addEventListener('click', () => {
        setOpen(body.classList.contains('hidden'));
      });

      let saveTimer = null;
      textarea.addEventListener('input', () => {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
          const data = load();
          const val = textarea.value;
          if (val.trim()) { data[mid] = val; toggle.classList.add('text-brand-accent'); }
          else { delete data[mid]; toggle.classList.remove('text-brand-accent'); }
          save(data);
          if (savedTag) {
            savedTag.classList.remove('hidden');
            clearTimeout(savedTag._hideTimer);
            savedTag._hideTimer = setTimeout(() => savedTag.classList.add('hidden'), 1500);
          }
        }, 500);
      });
    });
  })();

  /* ================= Daily visit streak (sitewide, runs on every page) ================= */
  (function dailyStreak() {
    const KEY = 'kp_streak_v1';
    function todayStr() {
      const d = new Date();
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    function dayBefore(dateStr) {
      const d = new Date(dateStr + 'T00:00:00');
      d.setDate(d.getDate() - 1);
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    try {
      const today = todayStr();
      let data;
      try { data = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { data = null; }
      if (!data || typeof data.count !== 'number') data = { count: 0, best: 0, lastVisitDate: null };
      if (data.lastVisitDate !== today) {
        if (data.lastVisitDate === dayBefore(today)) data.count += 1;
        else data.count = 1;
        data.lastVisitDate = today;
        data.best = Math.max(data.best || 0, data.count);
        localStorage.setItem(KEY, JSON.stringify(data));
      }
    } catch (e) {}
  })();

  /* ================= Komentáře + lajky u lekcí (Supabase) ================= */
  (function commentsAndLikes() {
    const likeBtns = document.querySelectorAll('.kp-like-btn');
    const commentBoxes = document.querySelectorAll('[data-mod-comments]');
    if (!likeBtns.length && !commentBoxes.length) return;
    const isEn = document.documentElement.lang === 'en';
    const visitorId = kpVisitorId();

    function myLikedSet() {
      try { return new Set(JSON.parse(localStorage.getItem('kp_my_likes_v1') || '[]')); } catch (e) { return new Set(); }
    }
    function saveMyLiked(set) {
      try { localStorage.setItem('kp_my_likes_v1', JSON.stringify(Array.from(set))); } catch (e) {}
    }

    async function loadLikeCount(btn, targetType, targetId) {
      try {
        const rows = await kpSbSelect('likes', 'target_type=eq.' + targetType + '&target_id=eq.' + encodeURIComponent(targetId) + '&select=id');
        const countEl = btn.querySelector('.kp-like-count');
        if (countEl) countEl.textContent = String(rows.length);
      } catch (e) {}
    }

    async function toggleLike(btn, targetType, targetId) {
      const liked = myLikedSet();
      const key = targetType + ':' + targetId;
      const countEl = btn.querySelector('.kp-like-count');
      btn.disabled = true;
      try {
        if (liked.has(key)) {
          await kpSbDelete('likes', 'target_type=eq.' + targetType + '&target_id=eq.' + encodeURIComponent(targetId) + '&visitor_id=eq.' + visitorId);
          liked.delete(key);
          btn.classList.remove('text-rose-400');
          if (countEl) countEl.textContent = String(Math.max(0, parseInt(countEl.textContent || '0', 10) - 1));
        } else {
          await kpSbInsert('likes', { target_type: targetType, target_id: targetId, visitor_id: visitorId });
          liked.add(key);
          btn.classList.add('text-rose-400');
          if (countEl) countEl.textContent = String(parseInt(countEl.textContent || '0', 10) + 1);
        }
        saveMyLiked(liked);
      } catch (e) {}
      btn.disabled = false;
    }

    likeBtns.forEach(btn => {
      const targetType = btn.getAttribute('data-like-target');
      const targetId = btn.getAttribute('data-like-id');
      if (!targetType || !targetId) return;
      const liked = myLikedSet();
      if (liked.has(targetType + ':' + targetId)) btn.classList.add('text-rose-400');
      loadLikeCount(btn, targetType, targetId);
      btn.addEventListener('click', () => toggleLike(btn, targetType, targetId));
    });

    function fmtTime(iso) {
      try {
        const d = new Date(iso);
        return d.toLocaleDateString(isEn ? 'en-GB' : 'cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' });
      } catch (e) { return ''; }
    }

    function renderComments(listEl, countWrap, rows) {
      if (countWrap) countWrap.textContent = rows.length ? ' (' + rows.length + ')' : '';
      if (!rows.length) {
        const emptyText = isEn ? 'No comments yet. Be the first!' : 'Zatím žádné komentáře. Buď první!';
        listEl.innerHTML = '<div class="text-xs text-slate-500 italic">' + kpEscapeHtml(emptyText) + '</div>';
        return;
      }
      listEl.innerHTML = rows.map(c => (
        '<div class="rounded-xl bg-slate-900 border border-brand-border px-3 py-2">' +
        '<div class="flex items-center justify-between mb-1">' +
        '<span class="text-xs font-bold text-slate-200">' + kpEscapeHtml(c.name) + '</span>' +
        '<span class="text-[10px] text-slate-500">' + fmtTime(c.created_at) + '</span>' +
        '</div>' +
        '<div class="text-sm text-slate-300 whitespace-pre-wrap">' + kpEscapeHtml(c.body) + '</div>' +
        '</div>'
      )).join('');
    }

    commentBoxes.forEach(box => {
      const mid = box.getAttribute('data-mod-comments');
      const listEl = box.querySelector('.kp-comments-list');
      const countWrap = box.querySelector('.kp-comments-count');
      const form = box.querySelector('.kp-comments-form');
      const statusEl = box.querySelector('.kp-comment-status');
      if (!listEl) return;

      async function refresh() {
        try {
          const rows = await kpSbSelect('comments', 'module_id=eq.' + encodeURIComponent(mid) + '&approved=eq.true&select=name,body,created_at&order=created_at.asc');
          renderComments(listEl, countWrap, rows);
        } catch (e) {
          listEl.innerHTML = '<div class="text-xs text-slate-500 italic">' + (isEn ? 'Comments could not be loaded.' : 'Komentáře se nepodařilo načíst.') + '</div>';
        }
      }
      refresh();

      if (form) {
        form.addEventListener('submit', function (ev) {
          ev.preventDefault();
          const nameEl = form.querySelector('.kp-comment-name');
          const bodyEl = form.querySelector('.kp-comment-body');
          const name = (nameEl.value || '').trim();
          const body = (bodyEl.value || '').trim();
          if (!name || !body) return;
          const btn = form.querySelector('button[type="submit"]');
          if (btn) btn.disabled = true;
          kpSbInsert('comments', { module_id: mid, name: name.slice(0, 50), body: body.slice(0, 1000) }, true).then(function () {
            bodyEl.value = '';
            if (statusEl) {
              statusEl.textContent = isEn ? 'Thanks! Your comment is awaiting moderator approval.' : 'Díky! Komentář čeká na schválení moderátorem.';
              statusEl.classList.remove('hidden');
            }
          }).catch(function () {
            if (statusEl) {
              statusEl.textContent = isEn ? 'Something went wrong, please try again later.' : 'Něco se nepovedlo, zkus to prosím později.';
              statusEl.classList.remove('hidden');
            }
          }).finally(function () {
            if (btn) btn.disabled = false;
          });
        });
      }
    });
  })();

  /* ================= Veřejný chat (jedna místnost, Supabase) ================= */
  (function chatRoom() {
    const wrap = document.getElementById('chatMessages');
    const form = document.getElementById('chatForm');
    if (!wrap || !form) return;
    const isEn = document.documentElement.lang === 'en';
    const nameInput = document.getElementById('chatName');
    const bodyInput = document.getElementById('chatBody');
    let lastSeenId = null;
    let polling = null;

    try {
      const savedName = localStorage.getItem('kp_chat_name');
      if (savedName && nameInput) nameInput.value = savedName;
    } catch (e) {}

    function fmtTime(iso) {
      try {
        const d = new Date(iso);
        return d.toLocaleTimeString(isEn ? 'en-GB' : 'cs-CZ', { hour: '2-digit', minute: '2-digit' });
      } catch (e) { return ''; }
    }

    function renderMessages(rows) {
      if (!rows.length) {
        const emptyText = isEn ? 'No one has posted yet. Be the first!' : 'Zatím tu nikdo nepsal. Buď první!';
        wrap.innerHTML = '<div class="text-xs text-slate-500 italic">' + kpEscapeHtml(emptyText) + '</div>';
        return;
      }
      const atBottom = wrap.scrollTop + wrap.clientHeight >= wrap.scrollHeight - 20;
      /* IRC/shoutbox style: "[HH:MM] <jméno> zpráva" on one compact line, wraps if too long */
      wrap.innerHTML = rows.map(m => (
        '<div class="leading-snug break-words"><span class="text-slate-600">[' + fmtTime(m.created_at) + ']</span> ' +
        '<span class="font-bold text-brand-accent">&lt;' + kpEscapeHtml(m.name) + '&gt;</span> ' +
        '<span class="text-slate-300 whitespace-pre-wrap">' + kpLinkify(m.body) + '</span></div>'
      )).join('');
      if (atBottom) wrap.scrollTop = wrap.scrollHeight;
    }

    async function loadMessages() {
      try {
        const rows = await kpSbSelect('chat_messages', 'select=id,name,body,created_at&order=created_at.desc&limit=50');
        rows.reverse();
        renderMessages(rows);
        if (rows.length) lastSeenId = rows[rows.length - 1].id;
        wrap.scrollTop = wrap.scrollHeight;
      } catch (e) {
        wrap.innerHTML = '<div class="text-xs text-slate-500 italic">' + (isEn ? 'Chat could not be loaded.' : 'Chat se nepodařilo načíst.') + '</div>';
      }
    }

    async function pollNew() {
      try {
        const rows = await kpSbSelect('chat_messages', 'select=id,name,body,created_at&order=created_at.desc&limit=50');
        rows.reverse();
        if (rows.length && rows[rows.length - 1].id !== lastSeenId) {
          renderMessages(rows);
          lastSeenId = rows[rows.length - 1].id;
        }
      } catch (e) {}
    }

    loadMessages();
    polling = setInterval(pollNew, 5000);
    window.addEventListener('beforeunload', () => { if (polling) clearInterval(polling); });

    const emojiBar = document.getElementById('chatEmojiBar');
    if (emojiBar && bodyInput) {
      emojiBar.addEventListener('click', e => {
        const btn = e.target.closest('.kp-emoji-btn');
        if (!btn) return;
        const emoji = btn.getAttribute('data-emoji') || '';
        const start = bodyInput.selectionStart != null ? bodyInput.selectionStart : bodyInput.value.length;
        const end = bodyInput.selectionEnd != null ? bodyInput.selectionEnd : bodyInput.value.length;
        bodyInput.value = bodyInput.value.slice(0, start) + emoji + bodyInput.value.slice(end);
        bodyInput.focus();
        const pos = start + emoji.length;
        try { bodyInput.setSelectionRange(pos, pos); } catch (e2) {}
      });
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const name = (nameInput.value || '').trim();
      const body = (bodyInput.value || '').trim();
      if (!name || !body) return;
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      try { localStorage.setItem('kp_chat_name', name.slice(0, 40)); } catch (e) {}
      kpSbInsert('chat_messages', { name: name.slice(0, 40), body: body.slice(0, 500) }).then(function () {
        bodyInput.value = '';
        loadMessages();
      }).finally(function () {
        if (btn) btn.disabled = false;
      });
    });
  })();

  /* ================= Moderace (admin: komentáře + chat) ================= */
  (function moderation() {
    const loginBox = document.getElementById('modLogin');
    const dash = document.getElementById('modDash');
    if (!loginBox || !dash) return;

    let activeTab = 'pending';

    function getToken() {
      try { return sessionStorage.getItem('kp_admin_token'); } catch (e) { return null; }
    }
    function setToken(t) {
      try {
        if (t) sessionStorage.setItem('kp_admin_token', t);
        else sessionStorage.removeItem('kp_admin_token');
      } catch (e) {}
    }
    function authHeaders(extra) {
      const token = getToken();
      return Object.assign({
        'apikey': KP_SB_KEY,
        'Authorization': 'Bearer ' + (token || KP_SB_KEY),
        'Content-Type': 'application/json',
      }, extra || {});
    }
    async function authSelect(table, query) {
      const res = await fetch(KP_SB_URL + '/rest/v1/' + table + (query ? '?' + query : ''), { headers: authHeaders() });
      if (!res.ok) throw new Error('select failed: ' + res.status);
      return res.json();
    }
    async function authPatch(table, query, data) {
      const res = await fetch(KP_SB_URL + '/rest/v1/' + table + '?' + query, {
        method: 'PATCH',
        headers: authHeaders({ 'Prefer': 'return=minimal' }),
        body: JSON.stringify(data),
      });
      return res.ok;
    }
    async function authDelete(table, query) {
      const res = await fetch(KP_SB_URL + '/rest/v1/' + table + '?' + query, { method: 'DELETE', headers: authHeaders() });
      return res.ok;
    }

    function showDash() { loginBox.classList.add('hidden'); dash.classList.remove('hidden'); }
    function showLogin() { loginBox.classList.remove('hidden'); dash.classList.add('hidden'); }

    function fmtDateTime(iso) {
      try {
        const d = new Date(iso);
        return d.toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      } catch (e) { return ''; }
    }

    function renderComments(rows, approved) {
      const list = document.getElementById('modList');
      if (!rows.length) { list.innerHTML = '<div class="text-xs text-slate-500 italic">Žádné položky.</div>'; return; }
      list.innerHTML = rows.map(c => (
        '<div class="p-4 rounded-2xl bg-brand-card border border-brand-border">' +
        '<div class="flex items-center justify-between mb-1 gap-2 flex-wrap">' +
        '<span class="font-bold text-white text-sm">' + kpEscapeHtml(c.name) + '</span>' +
        '<span class="text-[10px] text-slate-500">' + kpEscapeHtml(c.module_id) + ' &middot; ' + fmtDateTime(c.created_at) + '</span>' +
        '</div>' +
        '<div class="text-sm text-slate-300 mb-3 whitespace-pre-wrap">' + kpEscapeHtml(c.body) + '</div>' +
        '<div class="flex gap-2">' +
        (approved ? '' : '<button type="button" class="mod-approve px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:opacity-90 transition" data-id="' + c.id + '">Schválit</button>') +
        '<button type="button" class="mod-delete px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold hover:opacity-90 transition" data-table="comments" data-id="' + c.id + '">Smazat</button>' +
        '</div></div>'
      )).join('');
    }

    function renderChat(rows) {
      const list = document.getElementById('modList');
      if (!rows.length) { list.innerHTML = '<div class="text-xs text-slate-500 italic">Žádné zprávy.</div>'; return; }
      list.innerHTML = rows.map(m => (
        '<div class="p-4 rounded-2xl bg-brand-card border border-brand-border">' +
        '<div class="flex items-center justify-between mb-1 gap-2 flex-wrap">' +
        '<span class="font-bold text-white text-sm">' + kpEscapeHtml(m.name) + '</span>' +
        '<span class="text-[10px] text-slate-500">' + fmtDateTime(m.created_at) + '</span>' +
        '</div>' +
        '<div class="text-sm text-slate-300 mb-3 whitespace-pre-wrap">' + kpEscapeHtml(m.body) + '</div>' +
        '<button type="button" class="mod-delete px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold hover:opacity-90 transition" data-table="chat_messages" data-id="' + m.id + '">Smazat</button>' +
        '</div>'
      )).join('');
    }

    async function refreshPendingCount() {
      try {
        const rows = await authSelect('comments', 'approved=eq.false&select=id');
        const el = document.getElementById('modPendingCount');
        if (el) el.textContent = rows.length ? '(' + rows.length + ')' : '';
      } catch (e) {}
    }

    async function loadTab(tab) {
      const list = document.getElementById('modList');
      list.innerHTML = '<div class="text-xs text-slate-500 italic">Načítám…</div>';
      try {
        if (tab === 'pending' || tab === 'approved') {
          const approved = tab === 'approved';
          const rows = await authSelect('comments', 'approved=eq.' + approved + '&select=id,module_id,name,body,created_at&order=created_at.desc');
          renderComments(rows, approved);
          refreshPendingCount();
        } else if (tab === 'chat') {
          const rows = await authSelect('chat_messages', 'select=id,name,body,created_at&order=created_at.desc&limit=100');
          renderChat(rows);
        }
      } catch (e) {
        list.innerHTML = '<div class="text-xs text-rose-400">Nepodařilo se načíst data. Zkus se prosím znovu přihlásit.</div>';
      }
    }

    document.querySelectorAll('.mod-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.getAttribute('data-tab');
        document.querySelectorAll('.mod-tab').forEach(b => {
          b.className = 'mod-tab px-4 py-2 rounded-xl text-sm font-bold transition ' +
            (b === btn ? 'bg-brand-accent text-white' : 'bg-slate-900 border border-brand-border text-slate-300 hover:text-white');
        });
        loadTab(activeTab);
      });
    });

    const loginForm = document.getElementById('modLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', function (ev) {
        ev.preventDefault();
        const email = document.getElementById('modEmail').value.trim();
        const password = document.getElementById('modPassword').value;
        const errEl = document.getElementById('modLoginError');
        errEl.classList.add('hidden');
        const btn = loginForm.querySelector('button[type="submit"]');
        if (btn) btn.disabled = true;
        fetch(KP_SB_URL + '/auth/v1/token?grant_type=password', {
          method: 'POST',
          headers: { 'apikey': KP_SB_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, password: password }),
        }).then(function (res) {
          if (!res.ok) throw new Error('login failed');
          return res.json();
        }).then(function (data) {
          setToken(data.access_token);
          showDash();
          activeTab = 'pending';
          loadTab('pending');
        }).catch(function () {
          errEl.textContent = 'Přihlášení se nepovedlo. Zkontroluj e-mail a heslo.';
          errEl.classList.remove('hidden');
        }).finally(function () {
          if (btn) btn.disabled = false;
        });
      });
    }

    const logoutBtn = document.getElementById('modLogout');
    if (logoutBtn) logoutBtn.addEventListener('click', function () { setToken(null); showLogin(); });

    const listWrap = document.getElementById('modList');
    if (listWrap) {
      listWrap.addEventListener('click', function (ev) {
        const approveBtn = ev.target.closest('.mod-approve');
        const deleteBtn = ev.target.closest('.mod-delete');
        if (approveBtn) {
          approveBtn.disabled = true;
          authPatch('comments', 'id=eq.' + approveBtn.getAttribute('data-id'), { approved: true }).then(function (ok) {
            if (ok) loadTab(activeTab); else approveBtn.disabled = false;
          });
        } else if (deleteBtn) {
          if (!window.confirm('Opravdu smazat?')) return;
          deleteBtn.disabled = true;
          authDelete(deleteBtn.getAttribute('data-table'), 'id=eq.' + deleteBtn.getAttribute('data-id')).then(function (ok) {
            if (ok) loadTab(activeTab); else deleteBtn.disabled = false;
          });
        }
      });
    }

    if (getToken()) { showDash(); loadTab('pending'); }
  })();

  /* ================= "Můj postup" (progress) page ================= */
  (function myProgressPage() {
    const wrap = document.querySelector('[data-my-progress]');
    if (!wrap) return;
    function getJSON(k, d) { try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch (e) { return d; } }
    function render() {
      const isEn = document.documentElement.lang === 'en';
      const visited = new Set(getJSON('kp_visited_v1', []));
      const quizPassed = getJSON('kp_quiz_passed_v1', {});
      const checklist = getJSON('kp_roadmap_v2', []);
      const risk = getJSON('kp_risk_profile_v1', null);
      const chips = Object.keys(CHAPTER_MODULES);

      let doneChapters = 0, totalIds = 0, doneIds = 0;
      chips.forEach(chip => {
        const ids = CHAPTER_MODULES[chip] || [];
        totalIds += ids.length;
        const d = ids.filter(id => visited.has(id)).length;
        doneIds += d;
        if (ids.length && d === ids.length) doneChapters++;
      });
      const chaptersEl = document.getElementById('mpChapters');
      if (chaptersEl) chaptersEl.textContent = doneChapters + ' / ' + chips.length;

      const quizCount = Object.values(quizPassed).filter(Boolean).length;
      const quizzesEl = document.getElementById('mpQuizzes');
      if (quizzesEl) quizzesEl.textContent = quizCount + ' / ' + chips.length;

      const checklistEl = document.getElementById('mpChecklist');
      if (checklistEl) checklistEl.textContent = (Array.isArray(checklist) ? checklist.length : 0) + ' / 7';

      const streak = getJSON('kp_streak_v1', null);
      const streakEl = document.getElementById('mpStreak');
      if (streakEl) streakEl.textContent = String((streak && streak.count) || 0);

      const pct = totalIds ? Math.round((doneIds / totalIds) * 100) : 0;
      const bar = document.getElementById('mpOverallBar'); if (bar) bar.style.width = pct + '%';
      const pctEl = document.getElementById('mpOverallPct'); if (pctEl) pctEl.textContent = pct + '%';

      const riskWrap = document.getElementById('mpRiskWrap'), riskEmpty = document.getElementById('mpRiskEmpty');
      if (risk && RISK_PROFILES[risk.key]) {
        const p = RISK_PROFILES[risk.key];
        if (riskWrap) {
          riskWrap.classList.remove('hidden');
          riskWrap.innerHTML = '<div class="text-5xl mb-2">' + p.emoji + '</div>' +
            '<h3 class="text-xl font-black text-white mb-1">' + (isEn ? p.title.en : p.title.cs) + '</h3>' +
            '<p class="text-slate-400 text-sm max-w-md mx-auto mb-4">' + (isEn ? p.tag.en : p.tag.cs) + '</p>' +
            '<a href="index.html#riskProfileWrap" class="inline-block px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition">' + (isEn ? 'Retake' : 'Udělat znovu') + '</a>';
        }
        if (riskEmpty) riskEmpty.classList.add('hidden');
      } else {
        if (riskWrap) riskWrap.classList.add('hidden');
        if (riskEmpty) riskEmpty.classList.remove('hidden');
      }
    }
    window.kpRerenderMyProgress = render;
    render();
  })();

  /* ================= Chapter listen (text-to-speech) ================= */
  (function textToSpeech() {
    const btn = document.getElementById('ttsToggle');
    const container = document.getElementById('modulesContainer');
    if (!btn || !container || !('speechSynthesis' in window)) return;
    btn.classList.remove('hidden');
    let utterances = [], idx = 0, playing = false;
    const icon = document.getElementById('ttsIcon');

    function buildUtterances() {
      const voiceLang = document.documentElement.lang === 'en' ? 'en-US' : 'cs-CZ';
      const text = (container.innerText || '').replace(/\s+/g, ' ').trim();
      const chunks = text.match(/[^.!?]+[.!?]*/g) || [text];
      const merged = [];
      let buf = '';
      chunks.forEach(c => {
        if ((buf + c).length > 220) { if (buf) merged.push(buf); buf = c; }
        else buf += c;
      });
      if (buf) merged.push(buf);
      return merged.map(s => {
        const u = new SpeechSynthesisUtterance(s.trim());
        u.lang = voiceLang;
        u.rate = 1;
        return u;
      });
    }

    function setIcon(name) { if (icon) icon.className = 'fa-solid fa-' + name; }

    function speakNext() {
      if (idx >= utterances.length) { playing = false; setIcon('volume-high'); idx = 0; return; }
      const u = utterances[idx];
      u.onend = () => { idx++; speakNext(); };
      u.onerror = () => { playing = false; setIcon('volume-high'); };
      window.speechSynthesis.speak(u);
    }

    btn.addEventListener('click', () => {
      if (playing) {
        window.speechSynthesis.cancel();
        playing = false; idx = 0; setIcon('volume-high');
        return;
      }
      utterances = buildUtterances();
      if (!utterances.length) return;
      idx = 0; playing = true; setIcon('pause');
      speakNext();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && playing) { window.speechSynthesis.cancel(); playing = false; idx = 0; setIcon('volume-high'); }
    });
  })();

})();

  
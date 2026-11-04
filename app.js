
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
      fng: { 'Extreme Fear': 'Extrémní strach', 'Fear': 'Strach', 'Neutral': 'Neutrální', 'Greed': 'Chamtivost', 'Extreme Greed': 'Extrémní chamtivost' }
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
      fng: {}
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
  let lastUpdate = null, fngState = null, domState = null, pricesFailed = false;
  const cards = $('#heroPriceCards');
  if (cards) cards.innerHTML = COINS.map(c => `
    <div class="p-3 rounded-2xl bg-brand-card border border-brand-border">
      <div class="flex justify-between items-start mb-1">
        <span class="font-extrabold text-xs text-white">${c.icon} ${c.name}</span>
        <span class="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">${c.sym}</span>
      </div>
      <div id="${c.sym}-usd" class="text-base font-black text-white font-mono skeleton">$00000</div>
      <div id="${c.sym}-czk" class="text-[11px] text-slate-400 font-mono mt-1">&nbsp;</div>
      <div id="${c.sym}-chg" class="text-[11px] font-bold mt-1">&nbsp;</div>
    </div>`).join('');

  const cvCoin = $('#cvCoin');
  if (cvCoin) cvCoin.innerHTML = COINS.map(c => `<option value="${c.id}">${c.sym}</option>`).join('');

  const fmtUsd = n => '$' + (n >= 100 ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : n.toLocaleString('en-US', { maximumFractionDigits: 4 }));

  function paintPrices() {
    if (!cards) return;
    COINS.forEach(c => {
      const d = prices[c.id]; if (!d) return;
      const u = $('#' + c.sym + '-usd'); u.classList.remove('skeleton'); u.textContent = fmtUsd(d.usd);
      $('#' + c.sym + '-czk').textContent = (d.czk >= 100 ? fmtNum(d.czk) : d.czk.toLocaleString(U().locale, { maximumFractionDigits: 3 })) + ' ' + U().czk;
      const ch = d.usd_24hr_change, ce = $('#' + c.sym + '-chg');
      if (typeof ch === 'number') {
        ce.textContent = (ch >= 0 ? '▲ +' : '▼ ') + ch.toFixed(2).replace('.', lang === 'cs' ? ',' : '.') + ' %';
        ce.className = 'text-[11px] font-bold mt-1 ' + (ch >= 0 ? 'text-emerald-400' : 'text-rose-400');
      }
    });
    if (lastUpdate) $('#lastUpdate').textContent = lastUpdate.toLocaleTimeString(U().locale, { hour: '2-digit', minute: '2-digit' });
    $('#priceError').classList.toggle('hidden', !pricesFailed);
  }

  function paintPulse() {
    const domEl = $('#btcDom'), fngEl = $('#fngValue');
    if (domEl && domState != null) domEl.textContent = domState === 'n/a' ? 'n/a' : domState.toFixed(1).replace('.', lang === 'cs' ? ',' : '.') + ' %';
    if (fngEl && fngState) {
      if (fngState === 'n/a') fngEl.textContent = 'n/a';
      else fngEl.textContent = fngState.value + ' – ' + (U().fng[fngState.cls] || fngState.cls);
    }
  }

  async function fetchJson(url) {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 8000);
    try { const r = await fetch(url, { signal: ctrl.signal }); if (!r.ok) throw new Error(r.status); return await r.json(); }
    finally { clearTimeout(t); }
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
    } catch (e) { domState = 'n/a'; }
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
  fetchPrices(); fetchPulse();
  setInterval(() => { if (!document.hidden) fetchPrices(); }, 60000);
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
        (isEn ? e.en : e.cs) + ' <span class="text-slate-500">&middot; ' + e.chap + '</span></a>').join('') + '</div></div>';
    box.classList.remove('hidden');
  }
  window.__kpRenderGlobalResults = renderGlobalResults;
  new MutationObserver(() => { const si2 = document.getElementById('searchInput'); if (si2 && si2.value) renderGlobalResults(si2.value.toLowerCase().trim()); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

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

})();

  
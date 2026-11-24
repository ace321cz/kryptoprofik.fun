const CACHE = 'kryptoprofik-v3';
const ASSETS = [
  'index.html', 'zaklady.html', 'penezenky.html', 'burzy.html', 'anti-scam.html',
  'analyza.html', 'strategie.html', 'dane.html', 'nastroje.html', 'glosar.html',
  'postup.html', 'clenove.html', 'ucet.html', 'zpravy.html', 'forum.html',
  'moderace.html', 'soukromi.html', 'podminky.html', '404.html', 'offline.html',
  'style.css', 'app.js', 'i18n-data.js', 'qrcode.min.js',
  'manifest.json', 'icon-192.png', 'icon-512.png', 'favicon-32.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // Supabase API apod. jde vždy jen na síť

  const isNavigation = e.request.mode === 'navigate';

  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() =>
      caches.match(e.request).then(r => {
        if (r) return r;
        if (isNavigation) {
          // Zkus aspoň domovskou stránku (zůstane vidět menu/nabídka), jinak
          // samostatnou "jsi offline" stránku.
          return caches.match('index.html').then(idx => idx || caches.match('offline.html'));
        }
        return undefined;
      })
    )
  );
});

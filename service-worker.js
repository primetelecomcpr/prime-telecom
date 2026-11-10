const CACHE = 'prime-telecom-v1';
const FILES = [
  '/prime-telecom/',
  '/prime-telecom/index.html',
  '/prime-telecom/manifest.json',
  '/prime-telecom/icon-192.png',
  '/prime-telecom/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Firebase aur dusre external requests ko touch mat karo (live data ke liye)
  if (url.origin !== location.origin || e.request.method !== 'GET') return;

  // Network first: pehle nayi file, internet na ho toh cache
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('/prime-telecom/index.html')))
  );
});

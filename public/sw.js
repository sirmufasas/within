const CACHE_NAME = 'within-v1';
const OFFLINE_URL = '/';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([
      '/manifest.webmanifest',
      '/icon-192.png',
      '/icon-512.png',
    ]).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for navigations (so users always get fresh app data when
// online), falling back to a cached shell only when truly offline. We
// deliberately do NOT cache API/data requests — this app's data is live
// business data (orders, stock, etc.) and must never be served stale.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL).then((r) => r || Response.error()))
    );
    return;
  }

  const url = new URL(request.url);
  const isStaticAsset = /\.(png|jpg|jpeg|svg|ico|webmanifest|woff2?)$/.test(url.pathname);
  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
  }
});

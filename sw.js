const CACHE_NAME = 'chor-sipahi-v3';

// Assets relative to repository directory
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// 1. Install & Cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (e) {
          console.warn('Failed to cache asset:', asset, e);
        }
      }
    })
  );
  self.skipWaiting();
});

// 2. Activate & Claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. Intercept requests (Cache First, Network Fallback)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // If user refreshes the page or navigates while offline
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html') || caches.match('./');
      }

      return fetch(event.request);
    }).catch(() => {
      // Offline fallback
      return caches.match('./index.html') || caches.match('./');
    })
  );
});

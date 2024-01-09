// service-worker.js

const CACHE_VERSION = 'v1';
const CACHE_NAME = `my-static-site-cache-${CACHE_VERSION}`;

const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css', // Add all your static files here
  '/script.js',
  'manifest.json',
  // Add other files you want to cache
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );

  clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_FOR_UPDATES') {
    self.skipWaiting();
  }
});
// service-worker.js

const CACHE_NAME = 'umami-v5';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/scripts.js',
  '/umami.jpg',
  // Add other static assets you want to cache
];

self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(urlsToCache))
        .then(() => self.skipWaiting())
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
  
    return self.clients.claim();
  });
  
  self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/index.html')) {
      event.respondWith(
        caches.match(event.request, { ignoreSearch: true })
          .then((response) => {
            return response || fetch(event.request);
          })
      );
    } else {
      event.respondWith(
        caches.match(event.request)
          .then((response) => {
            return response || fetch(event.request);
          })
      );
    }
  });
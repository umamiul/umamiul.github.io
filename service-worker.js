// service-worker.js
var cacheName = 'umami';
var currentCache = cacheName + '-v2';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(currentCache).then(function(cache) {
      return cache.addAll([
        '/',
        '/path/to/your/assets',
        // Add other assets you want to cache
      ]);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cache) {
          if (cache !== currentCache) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('message', function(event) {
  if (event.data.action === 'reload') {
    self.skipWaiting();
    self.clients.claim();
    self.clients.matchAll().then(function(clients) {
      clients.forEach(function(client) {
        client.postMessage({ action: 'reload' });
      });
    });
  }
});

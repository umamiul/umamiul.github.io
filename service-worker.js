// service-worker.js
self.addEventListener('install', function(event) {
  event.waitUntil(
    fetch('/path/to/manifest.json') // Fetch the manifest file
      .then(response => response.json())
      .then(data => {
        var cacheName = 'umami';
        var currentCache = cacheName + '-v' + data.version; // Use version from manifest
        console.log('Installing service worker. Current cache version:', currentCache);
        return caches.open(currentCache).then(function(cache) {
          return cache.addAll([
            '/',
            'index.html',
            'styles.css',
            'scripts.js'
            // Add other assets you want to cache
          ]);
        });
      })
      .catch(error => {
        console.error('Error fetching or parsing manifest:', error);
      })
  );
});

self.addEventListener('activate', function(event) {
  console.log('Service worker activated.');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cache) {
          if (cache !== currentCache) {
            console.log('Deleting old cache:', cache);
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
      if (response) {
        console.log('Cache hit for:', event.request.url);
        return response;
      }

      console.log('Cache miss. Fetching:', event.request.url);
      return fetch(event.request);
    }).catch(function(error) {
      console.error('Error fetching:', error);
    })
  );
});

self.addEventListener('message', function(event) {
  if (event.data.action === 'reload') {
    console.log('Received reload message. Skipping waiting and claiming clients.');
    self.skipWaiting();
    self.clients.claim();
    self.clients.matchAll().then(function(clients) {
      clients.forEach(function(client) {
        client.postMessage({ action: 'reload' });
      });
    });
  }
});
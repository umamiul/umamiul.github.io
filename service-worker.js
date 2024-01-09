// service-worker.js
var cacheName = 'your-cache-name';
var currentCache = cacheName + '-v' + manifest.version;

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

// Inside the service-worker.js file
self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/path/to/service-worker.js')
    .then(function(registration) {
      registration.addEventListener('updatefound', function() {
        var installingWorker = registration.installing;
        installingWorker.onstatechange = function() {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // A new version is available
              // Prompt the user to reload the page
              // This can be a custom prompt or a simple page refresh
              // For example:
              window.location.reload(true);
            }
          }
        };
      });
    })
    .catch(function(error) {
      console.error('Service Worker registration failed:', error);
    });
}
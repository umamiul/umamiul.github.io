// sw.js

const cacheVersion = 2;  // Increment this version number
const cacheName = `umami-v${cacheVersion}`;
const filesToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/menu.html',
  '/scripts.js',
  '/manifest.json',
  '/pages/predjelo.html',
  '/predjela.css',
  '/menu.html',
  // Add more files to cache as needed
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  // Fetch each file and cache it
  event.waitUntil(
    Promise.all(
      filesToCache.map((relativePath) => {
        const url = new URL(relativePath, location.origin);
        const cacheBustedUrl = `${url}?t=${new Date().getTime()}`;
        return fetch(url)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Failed to fetch ${url}`);
            }
            return response;
          })
          .then((response) => caches.open(cacheName).then((cache) => cache.put(cacheBustedUrl, response)))
          .catch((error) => console.error(error));
      })
    )
    .then(() => {
      console.log('Service Worker: Installation complete. Skipping waiting.');
      self.skipWaiting(); // Activate new service worker immediately
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((existingCacheName) => {
          if (existingCacheName.startsWith('umami-v') && existingCacheName !== cacheName) {
            console.log(`Service Worker: Deleting old cache ${existingCacheName}`);
            return caches.delete(existingCacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  console.log(`Service Worker: Fetching ${event.request.url}`);
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Check for updates on user navigation
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(cacheName).then((cache) => {
      return fetch(event.request).then((response) => {
        cache.put(event.request, response.clone());
        return response;
      });
    })
  );
});

// Check for updates in the background
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Check for updates on page load
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.keys().then((keys) => {
        keys.forEach((key) => {
          if (!filesToCache.includes(key.url)) {
            cache.delete(key);
          }
        });
      });
    })
  );
});

// Notify the user about a new version
self.addEventListener('message', (event) => {
  if (event.data.action === 'newVersionAvailable') {
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ action: 'showUpdateNotification' });
      });
    });
  }
});
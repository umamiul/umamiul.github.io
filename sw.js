// sw.js
const CACHE_NAME_PREFIX = 'umami';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/scripts.js',
  '/manifest.json',
  // Add other static files here
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(getCacheName())
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (!name.startsWith(CACHE_NAME_PREFIX)) {
            return caches.delete(name);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_FOR_UPDATES') {
    self.checkForUpdates();
  }
});

self.checkForUpdates = () => {
  fetch('/manifest.json')
    .then((response) => response.json())
    .then((manifest) => {
      const currentVersion = manifest.version;
      if (currentVersion > getCacheName()) {
        self.registration.showNotification('Update Available', {
          body: 'A new version of the app is available. Click to refresh.',
          icon: '/umami.jpg',
        });

        self.addEventListener('notificationclick', (event) => {
          event.notification.close();
          self.clients.matchAll({ type: 'window' }).then((clients) => {
            for (const client of clients) {
              if ('navigate' in client) {
                client.navigate(client.url);
              }
            }
          });
        });
      }
    })
    .catch((error) => {
      console.error('Error checking for updates:', error);
    });
};

const getCacheName = () => {
  return `${CACHE_NAME_PREFIX}${self.manifest ? self.manifest.version : 'v1'}`;
};
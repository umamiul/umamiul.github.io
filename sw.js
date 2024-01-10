const dynamicCacheName = 'umami-dynamic-v2';

self.addEventListener('install', evt => {
  // No need to cache static assets during installation
});

self.addEventListener('activate', evt => {
    evt.waitUntil(
      caches.keys().then(keys => {
        return Promise.all(keys
          .filter(key => key !== dynamicCacheName)
          .map(key => caches.delete(key))
        );
      })
      .then(() => self.clients.matchAll())
      .then(clients => {
        return Promise.all(
          clients.map(client => {
            if (client.url && 'navigate' in client) {
              return client.navigate(client.url);
            }
          })
        );
      })
      .then(() => self.clients.claim())
    );
  });

self.addEventListener('fetch', evt => {
  const request = evt.request;

  // Fetch and update dynamic content
  evt.respondWith(fetchAndUpdate(request));
});

function fetchAndUpdate(request) {
  return fetch(request).then(res => {
    if (!res || res.status !== 200 || res.type !== 'basic') {
      return res;
    }

    const clonedResponse = res.clone();

    // Update dynamic cache with the latest response
    caches.open(dynamicCacheName).then(cache => {
      cache.put(request, clonedResponse);
    });

    return res;
  }).catch(err => {
    console.error('Fetch error:', err);
  });
}
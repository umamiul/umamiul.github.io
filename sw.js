const staticCacheName = 'umami-v1';
const dynamicCacheName = 'umami-dynamic-v1';

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      console.log('Caching shell assets');
      cache.addAll(assets);
    })
  );
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== staticCacheName && key !== dynamicCacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      return cacheRes || fetchAndUpdate(evt.request);
    })
  );
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
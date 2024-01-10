const staticCacheName = 'umami-v1';
const dynamicCacheName = 'umami-dynamic-v1';
const assets = [
  './',
  './index.html',
  './styles.css',
  './scripts.js',
  './app.js',
  './manifest.json',
  './umami.jpg',
  './umamipng.png',
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(staticCacheName).then(cache => {
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
      .then(() => self.clients.claim()) // Claim clients immediately
    );
  });

self.addEventListener('fetch', evt => {
  const request = evt.request;

  // Serve static assets from cache
  if (assets.includes(request.url)) {
    evt.respondWith(caches.match(request));
  } else {
    // Fetch and update dynamic content
    evt.respondWith(fetchAndUpdate(request));
  }
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
const staticCacheName = 'umami-v4';
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
      // Check if the response is valid
      if (!res || res.status !== 200 || res.type !== 'basic') {
        return res;
      }
  
      // Clone the response to avoid consuming it
      const clonedResponse = res.clone();
  
      // Update dynamic cache with the latest response
      caches.open(dynamicCacheName).then(cache => {
        cache.put(request, clonedResponse);
      });
  
      return res;
    }).catch(err => {
      // Handle fetch errors (e.g., no network connection)
      console.error('Fetch error:', err);
    });
  }
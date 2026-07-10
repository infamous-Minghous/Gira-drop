const CACHE_NAME = 'fastdrop-v1';
const ASSETS = [
  'index.html',
  'script.js',
  'style.css',
  'manifest.json'
];

// Initialize and install background storage assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Intercept network requests to guarantee application speed
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

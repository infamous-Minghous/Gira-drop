const CACHE_NAME = 'fastdrop-v3.0_production'; // Incremented version to force device cache replacement

const ASSETS = [
  '/',
  'index.html',
  'script.js',
  'style.css',
  'manifest.json'
];

// 1. Lifecycle Installation: Populate static files straight to device disk cache spaces
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("🟩 Service Worker: Static app shells safely compressed into storage cache containers.");
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Lifecycle Activation: Safely purge outdated database cache versions to prevent code lock blocks
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log(`🧹 Service Worker: Purging deprecated cache layout trace: ${cache}`);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Intelligent Interception Engine: Accelerates loading while protecting communications channels
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 🛡️ SECURITY SHIELD FIX: Instantly ignore external phone dialers, messaging links, and database pipeline traffic!
  if (
    event.request.url.startsWith('tel:') || 
    event.request.url.startsWith('sms:') ||
    requestUrl.hostname.includes('wa.me') ||
    requestUrl.hostname.includes('whatsapp.com') ||
    requestUrl.hostname.includes('supabase.co') || 
    event.request.method !== 'GET'
  ) {
    return; // Pass through straight to the mobile hardware system naturally without intercepting
  }

  // Handle local application web files caching paths efficiently
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => console.log("📡 Offline Mode: Serving asset out of static fallback buckets safely."));

        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});

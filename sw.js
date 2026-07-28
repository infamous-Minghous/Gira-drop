const CACHE_NAME = 'fastdrop-v2.0_production'; // Increment version tags whenever code updates go live

// Comprehensive asset tracking list including fallback UI images
const ASSETS = [
  '/',
  'index.html',
  'script.js',
  'style.css',
  'manifest.json'
];

// 1. Lifecycle Installation: Populate static files straight to device disk cache spaces
self.addEventListener('install', (event) => {
  // Forces the waiting service worker to become the active service worker immediately
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
    }).then(() => self.clients.claim()) // Instantly take control of all open browser tabs
  );
});

// 3. Intelligent Interception Engine: Accelerates loading while protecting database API calls
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // SECURITY FIX: Never intercept or cache incoming or outgoing Supabase database traffic pipelines!
  if (requestUrl.hostname.includes('supabase.co') || event.request.method !== 'GET') {
    return; // Pass through straight to the web network hardware naturally
  }

  // Handle local application web files caching paths efficiently
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Performance Optimization: Fetch asset fresh from network in background to silently update cache for next load
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => console.log("📡 Offline Mode: Serving asset out of static fallback buckets safely."));

        return cachedResponse; // Return the fast cached version instantly to the device screen
      }
      
      return fetch(event.request); // Fallback to normal network loading if file isn't cached yet
    })
  );
});

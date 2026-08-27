// ==========================================================================
// PWA SERVICE WORKER DAEMON - PART 1: PATH-AGNOSTIC STATIC MANAGER
// ==========================================================================

// INCREMENTED PRODUCTION BUILD STRING TAG: Forces mobile web engines to clear old layouts instantly
// Locate this line right at the absolute top of your sw.js file and increment it exactly:
const CACHE_NAME = 'fastdrop-v3.4_live_release'; // 🟩 FORCE-UPDATES ALL COURIER PHONES ON RELOAD!


// Static core application shell structures compressed directly onto device storage disk
const ASSETS = [
  'index.html',
  'script.js',
  'style.css',
  'manifest.json',

];

// 1. LIFECYCLE INSTALLATION: Populate static app files into local device storage space safely
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the system worker to take active control of the application ports instantly
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("🟩 Service Worker: Static app shells safely compressed into storage cache containers.");
      
      // 🟩 PATH-AGNOSTIC ROOT CACHING FIX: Cache your active local index root context dynamically
      cache.add(new Request('index.html', { cache: 'reload' }));
      return cache.addAll(ASSETS);
    })
  );
});

// 2. LIFECYCLE ACTIVATION: Purge outdated data layers to clear workspace memory blocks
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && !cache.includes('offline-queue')) {
            console.log(`🧹 Service Worker: Purging deprecated cache layout trace: ${cache}`);
            return caches.delete(cache); // Clear historical asset footprints cleanly out of storage space
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. INTELLIGENT NAVIGATION NETWORK INTERCEPTOR
self.addEventListener('fetch', (event) => {
  // HARDENED COMMUNICATIONS SHIELD: Passes hardware telephony protocols straight to mobile OS routing channels
  if (
    event.request.url.startsWith('tel:') || 
    event.request.url.startsWith('sms:') ||
    event.request.url.includes('wa.me') ||
    event.request.url.includes('whatsapp.com')
  ) {
    console.log("🚀 Service Worker Shield: Passing native protocol request directly to mobile OS.");
    return; // Stop intercept loops: lets system dialer apps capture hooks without network check timeouts
  }

  const requestUrlInstance = new URL(event.request.url);
  
  // Forward database writes and background synchronization tasks over to Part 2 handlers
  if (requestUrlInstance.hostname.includes('supabase.co')) {
    handleCloudDatabaseNetworkRequestTraffic(event, requestUrlInstance);
    return;
  }

  // Handle local application asset cache hits seamlessly
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Silent Network Cache Refresher (Stale-While-Revalidate pattern)
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
  }
});


// ==========================================================================
// PWA SERVICE WORKER DAEMON - PART 2: DUAL-SYNC DATABASE FLOW ENGINE
// ==========================================================================

const QUEUE_CACHE_NAME = 'offline-mutations-queue-v1';

/**
 * DATABASE NETWORK ROUTER & INTERCEPTOR
 * Safely processes cloud requests and queues writes locally when connection signal drops.
 */
async function handleCloudDatabaseNetworkRequestTraffic(event, urlInstance) {
    // SECURITY BLOCK: Only intercept POST writes; let read queries (SELECT) pass straight to network handlers
    if (event.request.method !== 'POST') return;

    // 🟩 EXPLICIT RPC PATH PROTECTION FILTER: Ignore caching for specialized administrative RPC calls
    if (urlInstance.pathname.includes('/rpc/')) return;

    event.respondWith(
        fetch(event.request.clone()).catch(async (fetchException) => {
            console.warn("⚠️ Offline Mode Triggered: Queueing transaction data payload locally on device memory.");
            
            try {
                const storageCacheContainerInstance = await caches.open(QUEUE_CACHE_NAME);
                const capturedRequestClone = event.request.clone();
                const jsonTextPayloadString = await capturedRequestClone.text();
                
                // Construct a standardized fallback server response text packet
                const simulatedNetworkResponseObject = new Response(JSON.stringify({ 
                    offline: true, 
                    status: "queued",
                    message: "Transaction logged securely inside device cache layout grids."
                }), {
                    status: 202,
                    headers: { 'Content-Type': 'application/json' }
                });

                // Generate unique timestamp keys to block row overwrite loops inside device storage
                const uniqueStorageQueueTrackingUrlPathKey = `${event.request.url}?timestamp=${Date.now()}&amt_fallback=${Math.random()}`;

                // Package the transaction parameters securely into an offline cache box
                const packagedOfflineResponseFrame = new Response(jsonTextPayloadString, {
                    status: 200,
                    headers: {
                        'X-Original-URL': event.request.url,
                        'X-Original-Headers': JSON.stringify([...event.request.headers.entries()])
                    }
                });

                await storageCacheContainerInstance.put(uniqueStorageQueueTrackingUrlPathKey, packagedOfflineResponseFrame);
                console.log("🟩 Success: Delivery transaction row securely archived inside offline fallback hardware sheets.");
                
                return simulatedNetworkResponseObject;

            } catch (err) {
                console.error("🟥 Fatal Exception: Offline storage queue layout dropped writing operations:", err);
                return new Response(JSON.stringify({ error: "StorageFailure" }), { status: 500 });
            }
        })
    );
}

// 4. AUTOMATED NETWORK RECONNECT SYNCHRONIZER HOOK
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-database-records' || event.tag === 'fastdrop-ledger-sync') {
    event.waitUntil(flushOfflineQueueToServer());
  }
});

// 🟩 HYBRID SAFARI CROSS-COMPATIBILITY TRIGGER: Flush queues on every page fetch navigation to unblock iOS
self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'FLUSH_OFFLINE_QUEUES') {
        event.waitUntil(flushOfflineQueueToServer());
    }
});

/**
 * MASTER OFFLINE DISPATCH DAEMON
 * Processes cached data arrays sequentially and uploads rows with perfect relational integrity.
 */
async function flushOfflineQueueToServer() {
  if (!navigator.onLine) return; // Operational exit: halt processing loops if device is still offline

  const storageCacheContainerInstance = await caches.open(QUEUE_CACHE_NAME);
  const queuedStorageRequestKeysList = await storageCacheContainerInstance.keys();
  
  if (queuedStorageRequestKeysList.length === 0) return;
  console.log(`📡 Background Sync Active: Processing ${queuedStorageRequestKeysList.length} cached transactions...`);

  for (const storedKeyRecord of queuedStorageRequestKeysList) {
    try {
      const savedResponseObject = await storageCacheContainerInstance.match(storedKeyRecord);
      if (!savedResponseObject) continue;

      const targetEndpointUrlRoute = savedResponseObject.headers.get('X-Original-URL');
      const rawTextPayloadBody = await savedResponseObject.text();
      const parsedHeaderEntriesArray = JSON.parse(savedResponseObject.headers.get('X-Original-Headers') || '[]');

      // Re-compile original authorization metadata headers seamlessly
      const compiledHeadersMap = new Headers();
      parsedHeaderEntriesArray.forEach(([key, val]) => compiledHeadersMap.append(key, val));
      compiledHeadersMap.set('Content-Type', 'application/json');

      // Dispatch the cloned transaction row natively straight to your live database table
      const networkSynchronizationResponse = await fetch(targetEndpointUrlRoute, {
        method: 'POST',
        headers: compiledHeadersMap,
        body: rawTextPayloadBody
      });
      
      if (networkSynchronizationResponse.ok || networkSynchronizationResponse.status === 409) {
        await storageCacheContainerInstance.delete(storedKeyRecord); // Purge successfully synced queues from disk
        console.log("🟩 Background Sync Success: Cached offline transactions successfully synchronized with cloud ledger!");
      }
    } catch (syncErr) {
      console.error("❌ Sync attempt failed, holding file in device disk layout:", syncErr);
      break; // Halt loop executions to preserve row sequence configurations
    }
  }
}

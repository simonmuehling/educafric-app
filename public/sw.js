// Educafric Service Worker - Offline Premium Mode
// Two-tier caching: Regular schools (1 week) | Offline-enabled schools (1 year)

const CACHE_VERSION = 'educafric-v2.0.0';
const CACHE_NAME = `educafric-cache-${CACHE_VERSION}`;

// Cache expiration times (milliseconds)
const CACHE_EXPIRATION = {
  REGULAR: 7 * 24 * 60 * 60 * 1000,           // 1 week
  OFFLINE_ENABLED: 365 * 24 * 60 * 60 * 1000  // 1 year
};

// Assets to precache
const PRECACHE_ASSETS = [
  '/offline.html',
  '/sandbox',
  '/assets/logo.png',
  '/assets/school-logo.png'
];

// API endpoints cacheable for offline access
const CACHEABLE_API_PATTERNS = [
  '/api/profile',
  '/api/director/settings',
  '/api/director/classes',
  '/api/director/students',
  '/api/director/teachers',
  '/api/director/timetables',
  '/api/director/rooms',
  '/api/director/grades',
  '/api/director/bulletins'
];

// ============================================================================
// INSTALL EVENT - Cache essential assets
// ============================================================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v2.0.0');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching essential assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .catch(error => {
        console.error('[SW] Failed to cache assets:', error);
      })
  );
  
  self.skipWaiting();
});

// ============================================================================
// ACTIVATE EVENT - Clean old caches and purge expired entries
// ============================================================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v2.0.0');
  
  event.waitUntil(
    Promise.all([
      // Delete old cache versions
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      }),
      // Purge expired entries from current cache
      purgeExpiredEntries()
    ])
  );
  
  self.clients.claim();
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Open IndexedDB connection
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('educafric-offline-db', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get value from IndexedDB
function getFromIndexedDB(db, storeName, key) {
  return new Promise((resolve) => {
    try {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch (error) {
      resolve(null);
    }
  });
}

// Get offline status from IndexedDB
async function getOfflineStatus() {
  try {
    const db = await openIndexedDB();
    const metadata = await getFromIndexedDB(db, 'metadata', 'offlineEnabled');
    return metadata?.value || false;
  } catch (error) {
    return false;
  }
}

// Add cache date header to response
function addCacheDate(response) {
  const headers = new Headers(response.headers);
  headers.set('sw-cache-date', new Date().toISOString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}

// Check if cached response is still valid
async function isCacheValid(cachedResponse) {
  if (!cachedResponse) return false;
  
  const cachedDate = new Date(cachedResponse.headers.get('sw-cache-date'));
  if (!cachedDate || isNaN(cachedDate.getTime())) {
    return true; // No date header = treat as valid
  }
  
  const isOfflineEnabled = await getOfflineStatus();
  const maxAge = isOfflineEnabled ? CACHE_EXPIRATION.OFFLINE_ENABLED : CACHE_EXPIRATION.REGULAR;
  const age = Date.now() - cachedDate.getTime();
  
  return age < maxAge;
}

// Purge expired cache entries
async function purgeExpiredEntries() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    let purgedCount = 0;
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const isValid = await isCacheValid(response);
        if (!isValid) {
          await cache.delete(request);
          purgedCount++;
          console.log('[SW] Purged expired:', request.url);
        }
      }
    }
    
    if (purgedCount > 0) {
      console.log(`[SW] ✅ Purged ${purgedCount} expired entries`);
    }
  } catch (error) {
    console.error('[SW] Error purging expired entries:', error);
  }
}

// Get offline API data from IndexedDB (last-resort fallback)
async function getOfflineAPIData(request) {
  try {
    const url = new URL(request.url);
    const db = await openIndexedDB();
    let storeName = null;
    
    // Map API endpoints to IndexedDB stores
    if (url.pathname.includes('/api/director/classes')) storeName = 'classes';
    else if (url.pathname.includes('/api/director/students')) storeName = 'students';
    else if (url.pathname.includes('/api/director/teachers')) storeName = 'teachers';
    else if (url.pathname.includes('/api/director/timetables')) storeName = 'timetables';
    else if (url.pathname.includes('/api/director/rooms')) storeName = 'rooms';
    else if (url.pathname.includes('/api/director/grades')) storeName = 'grades';
    else if (url.pathname.includes('/api/director/bulletins')) storeName = 'bulletins';
    else if (url.pathname.includes('/api/director/settings')) {
      const tx = db.transaction(['settings'], 'readonly');
      const store = tx.objectStore('settings');
      const data = await new Promise((resolve) => {
        const req = store.get('school');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });
      return data;
    }
    
    if (storeName) {
      const tx = db.transaction([storeName], 'readonly');
      const store = tx.objectStore(storeName);
      const data = await new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });
      return data;
    }
  } catch (error) {
    console.error('[SW] Error fetching from IndexedDB:', error);
  }
  
  return null;
}

// ============================================================================
// CACHE STRATEGIES
// ============================================================================

// Network first with cache fallback and TTL enforcement
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Store with cache date
      const responseWithDate = addCacheDate(networkResponse.clone());
      await cache.put(request, responseWithDate);
    }
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      const isValid = await isCacheValid(cachedResponse);
      
      if (isValid) {
        console.log('[SW] Serving valid cache (offline):', request.url);
        return cachedResponse;
      } else {
        // Cache expired, delete it
        await cache.delete(request);
        console.log('[SW] Deleted expired cache:', request.url);
      }
    }
    
    // Last resort: try IndexedDB for API data
    if (request.url.includes('/api/')) {
      const offlineData = await getOfflineAPIData(request);
      if (offlineData) {
        console.log('[SW] Serving from IndexedDB:', request.url);
        return new Response(JSON.stringify(offlineData), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    throw error;
  }
}

// Cache first with TTL enforcement
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    const isValid = await isCacheValid(cachedResponse);
    
    if (isValid) {
      return cachedResponse;
    } else {
      // Cache expired, delete it
      await cache.delete(request);
      console.log('[SW] Deleted expired cache:', request.url);
    }
  }
  
  // Try network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseWithDate = addCacheDate(networkResponse.clone());
      await cache.put(request, responseWithDate);
    }
    return networkResponse;
  } catch (error) {
    // Network failed and cache expired - return offline fallback
    const url = new URL(request.url);
    if (url.pathname.endsWith('.html') || url.pathname === '/') {
      const offlinePage = await cache.match('/offline.html');
      if (offlinePage) {
        console.log('[SW] Serving offline.html fallback');
        return offlinePage;
      }
    }
    
    // Return synthetic offline response for assets
    console.log('[SW] ❌ Cache expired and network unavailable:', request.url);
    return new Response('Offline - Content Expired', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Stale while revalidate with TTL
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Check if cache is valid
  if (cachedResponse) {
    const isValid = await isCacheValid(cachedResponse);
    
    if (isValid) {
      // Serve valid cache and revalidate in background
      const networkFetch = fetch(request)
        .then(async (networkResponse) => {
          if (networkResponse.ok) {
            const responseWithDate = addCacheDate(networkResponse.clone());
            await cache.put(request, responseWithDate);
          }
        })
        .catch(() => {});
      
      return cachedResponse;
    } else {
      // Cache expired, delete it
      await cache.delete(request);
      console.log('[SW] Deleted expired cache:', request.url);
    }
  }
  
  // Try network (no valid cache)
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseWithDate = addCacheDate(networkResponse.clone());
      await cache.put(request, responseWithDate);
    }
    return networkResponse;
  } catch (error) {
    // Network failed and cache expired - return offline fallback
    const url = new URL(request.url);
    if (url.pathname.endsWith('.html') || url.pathname === '/') {
      const offlinePage = await cache.match('/offline.html');
      if (offlinePage) {
        console.log('[SW] Serving offline.html fallback');
        return offlinePage;
      }
    }
    
    console.log('[SW] ❌ Cache expired and network unavailable:', request.url);
    return new Response('Offline - Content Expired', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// ============================================================================
// FETCH EVENT - Route requests to appropriate strategy
// ============================================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) return;
  
  let strategy;
  
  // API requests - Network first
  if (url.pathname.startsWith('/api/')) {
    const shouldCache = CACHEABLE_API_PATTERNS.some(pattern => 
      url.pathname.includes(pattern)
    );
    
    if (shouldCache) {
      strategy = networkFirst;
    } else {
      return; // Don't cache this API
    }
  }
  // Static assets - Cache first
  else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot|ico)$/)) {
    strategy = cacheFirst;
  }
  // HTML pages - Stale while revalidate
  else if (
    url.pathname.endsWith('.html') || 
    url.pathname === '/' ||
    url.pathname.startsWith('/sandbox') ||
    url.pathname.startsWith('/director') ||
    url.pathname.startsWith('/teacher') ||
    url.pathname.startsWith('/student') ||
    url.pathname.startsWith('/parent') ||
    url.pathname.startsWith('/freelancer') ||
    url.pathname.startsWith('/siteadmin')
  ) {
    strategy = staleWhileRevalidate;
  }
  else {
    strategy = networkFirst;
  }
  
  event.respondWith(strategy(request));
});

// ============================================================================
// BACKGROUND SYNC - Drain sync queue when online
// ============================================================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'educafric-sync-queue') {
    console.log('[SW] Background sync triggered - draining queue');
    event.waitUntil(drainSyncQueue());
  }
});

async function drainSyncQueue() {
  try {
    const db = await openIndexedDB();
    const queue = await getSyncQueueFromDB(db);
    
    if (queue.length === 0) {
      console.log('[SW] Sync queue is empty');
      return;
    }
    
    console.log(`[SW] Processing ${queue.length} queued items`);
    let syncedCount = 0;
    
    for (const item of queue) {
      try {
        const response = await fetch(item.endpoint, {
          method: item.method,
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(item.data)
        });
        
        if (response.ok) {
          await markSyncItemComplete(db, item.id);
          syncedCount++;
          console.log(`[SW] ✅ Synced: ${item.endpoint}`);
        } else {
          await markSyncItemFailed(db, item.id);
          console.error(`[SW] ❌ Failed: ${item.endpoint}`, response.status);
        }
      } catch (error) {
        await markSyncItemFailed(db, item.id);
        console.error(`[SW] Error syncing: ${item.endpoint}`, error);
      }
    }
    
    console.log(`[SW] ✅ Sync complete: ${syncedCount}/${queue.length} succeeded`);
  } catch (error) {
    console.error('[SW] Failed to drain sync queue:', error);
  }
}

// Get sync queue from IndexedDB
async function getSyncQueueFromDB(db) {
  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(['sync_queue'], 'readonly');
      const store = transaction.objectStore('sync_queue');
      const index = store.index('status');
      const request = index.getAll('pending');
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    } catch (error) {
      resolve([]);
    }
  });
}

// Mark sync item as complete
async function markSyncItemComplete(db, id) {
  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.status = 'completed';
          item.completedAt = Date.now();
          store.put(item);
        }
      };
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    } catch (error) {
      resolve();
    }
  });
}

// Mark sync item as failed
async function markSyncItemFailed(db, id) {
  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.status = 'failed';
          item.retries = (item.retries || 0) + 1;
          item.lastAttempt = Date.now();
          store.put(item);
        }
      };
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    } catch (error) {
      resolve();
    }
  });
}

// ============================================================================
// MESSAGE EVENT - Handle commands from client
// ============================================================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'PURGE_EXPIRED') {
    event.waitUntil(purgeExpiredEntries());
  }
  
  if (event.data && event.data.type === 'PROCESS_SYNC_QUEUE') {
    // Fallback for browsers without Background Sync API
    event.waitUntil(drainSyncQueue());
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      })
    );
  }
});

console.log('[SW] Service Worker v2.0.0 loaded - Offline Premium Mode ready');

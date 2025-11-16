// Educafric Service Worker - Offline Premium Mode with Two-Tier Caching
// Regular schools: 1 week cache | Offline-enabled schools: Full academic year cache

const CACHE_VERSION = 'educafric-v1.4.0';
const CACHE_NAME = `educafric-cache-${CACHE_VERSION}`;

// Cache expiration times (in milliseconds)
const CACHE_EXPIRATION = {
  REGULAR: 7 * 24 * 60 * 60 * 1000,      // 1 week for regular schools
  OFFLINE_ENABLED: 365 * 24 * 60 * 60 * 1000  // 1 year for offline-enabled schools
};

// Assets to cache immediately for offline demo mode
const PRECACHE_ASSETS = [
  '/',
  '/sandbox',
  '/offline.html',
  
  // Core app files (will be added by build process)
  '/index.html',
  
  // Sandbox login
  '/sandbox-login',
  
  // Common UI assets
  '/assets/logo.png',
  '/assets/school-logo.png',
  
  // Fonts (if any)
  // Add font paths here
];

// API endpoints to cache for offline access
const CACHEABLE_API_PATTERNS = [
  '/api/profile',
  '/api/settings',
  '/api/dashboard',
  '/api/notifications',
  '/api/classes',
  '/api/students',
  '/api/grades',
  '/api/attendance',
  '/api/homework',
  '/api/timetable',
  '/api/school'
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Network first, fallback to cache (for dynamic data)
  networkFirst: async (request) => {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        console.log('[SW] Serving from cache (offline):', request.url);
        return cachedResponse;
      }
      throw error;
    }
  },

  // Cache first, fallback to network (for static assets)
  cacheFirst: async (request) => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      console.error('[SW] Failed to fetch:', request.url, error);
      throw error;
    }
  },

  // Stale while revalidate (for semi-dynamic content)
  staleWhileRevalidate: async (request) => {
    const cachedResponse = await caches.match(request);
    
    const networkFetch = fetch(request).then(async (networkResponse) => {
      if (networkResponse.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    });
    
    return cachedResponse || networkFetch;
  }
};

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching essential assets');
      return cache.addAll(PRECACHE_ASSETS.filter(url => url !== '/'));
    }).catch(error => {
      console.error('[SW] Failed to cache assets:', error);
    })
  );
  
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  
  self.clients.claim();
});

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

// Open IndexedDB connection
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('educafric-offline-db', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get data from IndexedDB
function getFromIndexedDB(db, storeName, key) {
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } catch (error) {
      resolve(null);
    }
  });
}

// Check if cached response is still valid based on offline mode
async function isCacheValid(cachedResponse) {
  if (!cachedResponse) return false;
  
  const cachedDate = new Date(cachedResponse.headers.get('sw-cache-date'));
  if (!cachedDate || isNaN(cachedDate.getTime())) return true;
  
  const isOfflineEnabled = await getOfflineStatus();
  const maxAge = isOfflineEnabled ? CACHE_EXPIRATION.OFFLINE_ENABLED : CACHE_EXPIRATION.REGULAR;
  const age = Date.now() - cachedDate.getTime();
  
  return age < maxAge;
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

// Fetch event - handle requests with appropriate caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and cross-origin requests (except same origin)
  if (url.origin !== location.origin) {
    return;
  }

  // Determine caching strategy based on request type
  let strategy;
  
  // API requests - Network first for fresh data
  if (url.pathname.startsWith('/api/')) {
    // Check if this API should be cached
    const shouldCache = CACHEABLE_API_PATTERNS.some(pattern => 
      url.pathname.includes(pattern)
    );
    
    if (shouldCache) {
      strategy = CACHE_STRATEGIES.networkFirst;
    } else {
      // Don't cache this API, just fetch
      return;
    }
  }
  // Static assets - Cache first
  else if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot|ico)$/)
  ) {
    strategy = CACHE_STRATEGIES.cacheFirst;
  }
  // HTML pages - Stale while revalidate
  else if (
    url.pathname.endsWith('.html') || 
    url.pathname === '/' ||
    url.pathname.startsWith('/sandbox') ||
    url.pathname.startsWith('/teacher') ||
    url.pathname.startsWith('/student') ||
    url.pathname.startsWith('/parent') ||
    url.pathname.startsWith('/director') ||
    url.pathname.startsWith('/freelancer')
  ) {
    strategy = CACHE_STRATEGIES.staleWhileRevalidate;
  }
  // Default - Network first
  else {
    strategy = CACHE_STRATEGIES.networkFirst;
  }
  
  event.respondWith(strategy(request));
});

// Message event - handle commands from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(urls);
      })
    );
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );
      })
    );
  }
});

// Background sync - sync offline actions when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-actions') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(syncOfflineActions());
  }
});

async function syncOfflineActions() {
  try {
    // Get all pending actions from IndexedDB
    const db = await openOfflineDB();
    const actions = await getAllPendingActions(db);
    
    console.log('[SW] Syncing', actions.length, 'offline actions');
    
    for (const action of actions) {
      try {
        const response = await fetch('/api/offline/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action)
        });
        
        if (response.ok) {
          await markActionSynced(db, action.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync action:', action.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('educafric-offline', 2);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllPendingActions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineQueue'], 'readonly');
    const store = transaction.objectStore('offlineQueue');
    const index = store.index('synced');
    const request = index.getAll(IDBKeyRange.only(false));
    
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

function markActionSynced(db, actionId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineQueue'], 'readwrite');
    const store = transaction.objectStore('offlineQueue');
    const request = store.get(actionId);
    
    request.onsuccess = () => {
      const action = request.result;
      if (action) {
        action.synced = true;
        const updateRequest = store.put(action);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        resolve();
      }
    };
    
    request.onerror = () => reject(request.error);
  });
}

console.log('[SW] Service Worker loaded successfully');

// Service Worker for Educafric PWA with Enhanced Notifications
const CACHE_NAME = 'educafric-v2.6-robust-sw';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/educafric-logo-128.png',
  '/educafric-logo-512.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/favicon.ico'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache opened');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        self.skipWaiting();
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim();
    })
  );
});

// Robust fetch event that NEVER returns 5xx status codes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-HTTP protocols (chrome-extension, etc.)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    console.log('[SW] Ignoring non-web protocol:', url.protocol);
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Robust response handler that never generates 503
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    // API endpoints: network-first, no custom error responses
    if (url.pathname.startsWith('/api/')) {
      try {
        const netRes = await fetch(request);
        // Only cache successful responses
        if (netRes.ok) {
          await cache.put(request, netRes.clone());
        }
        return netRes; // Return whatever the server says (even if !ok)
      } catch (err) {
        // Network error - try cache, otherwise let browser handle
        const cached = await cache.match(request);
        if (cached) return cached;
        // Don't generate custom 503 - let the browser show network error
        throw err;
      }
    }

    // Static assets: cache-first with robust fallback
    const isStaticAsset = url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i) ||
                         url.pathname.includes('/assets/') ||
                         url.pathname.includes('/static/');

    if (isStaticAsset) {
      const cached = await cache.match(request);
      if (cached) return cached;
      
      try {
        const netRes = await fetch(request);
        if (netRes.ok) {
          await cache.put(request, netRes.clone());
        }
        return netRes;
      } catch (err) {
        // No cached version and network failed - let browser handle
        throw err;
      }
    }

    // Navigation/document requests: network-first with offline fallback
    try {
      const netRes = await fetch(request);
      if (netRes.ok) {
        await cache.put(request, netRes.clone());
      }
      return netRes;
    } catch (err) {
      // Network failed - try cache or offline page for navigation
      if (request.mode === 'navigate') {
        const cached = await cache.match(request);
        if (cached) return cached;
        
        const offlinePage = await cache.match('/offline.html');
        if (offlinePage) return offlinePage;
      } else {
        const cached = await cache.match(request);
        if (cached) return cached;
      }
      
      // No fallback available - let browser handle the error
      throw err;
    }
  })());
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event.data);
  
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Nouvelle notification Educafric',
    icon: data.icon || '/educafric-logo-128.png',
    badge: data.badge || '/educafric-logo-128.png',
    tag: data.tag || 'educafric-notification',
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
    vibrate: data.vibrate || [200, 100, 200],
    timestamp: Date.now()
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Educafric', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.data);
  
  event.notification.close();

  // Handle action clicks
  if (event.action) {
    console.log('[SW] Action clicked:', event.action);
    
    if (event.action === 'view_location') {
      event.waitUntil(
        clients.openWindow(event.notification.data.url || '/geolocation')
      );
    } else if (event.action === 'dismiss') {
      // Just close the notification
      return;
    }
  } else {
    // Handle notification body click
    const url = event.notification.data.url || '/';
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientsArr) => {
        const client = clientsArr.find(c => c.url === url && 'focus' in c);
        
        if (client) {
          return client.focus();
        } else {
          return clients.openWindow(url);
        }
      })
    );
  }

  // Send message to client about notification click
  event.waitUntil(
    clients.matchAll().then((clientsArr) => {
      clientsArr.forEach(client => {
        client.postMessage({
          type: 'NOTIFICATION_CLICKED',
          data: event.notification.data
        });
      });
    })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.data);
  
  // Send message to client about notification close
  self.clients.matchAll().then((clientsArr) => {
    clientsArr.forEach(client => {
      client.postMessage({
        type: 'NOTIFICATION_CLOSED',
        data: event.notification.data
      });
    });
  });
});

// Handle messages from the main app
self.addEventListener('message', (event) => {
  const { type, title, options } = event.data;
  
  if (type === 'SHOW_NOTIFICATION') {
    console.log('[SW] Showing notification via message:', title);
    
    const notificationOptions = {
      body: options?.body || 'Notification Educafric',
      icon: options?.icon || '/educafric-logo-128.png',
      badge: options?.badge || '/educafric-logo-128.png',
      tag: options?.tag || 'app-notification',
      data: options?.data || {},
      actions: options?.actions || [],
      requireInteraction: options?.requireInteraction || false,
      vibrate: options?.vibrate || [200, 100, 200],
      timestamp: Date.now()
    };

    self.registration.showNotification(title, notificationOptions);
  }
});

// Background sync event (for offline actions)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-notifications') {
    event.waitUntil(
      // Handle background notification sync
      fetch('/api/notifications/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(err => {
        console.log('[SW] Background sync failed:', err);
      })
    );
  }
});
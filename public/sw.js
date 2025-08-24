// Service Worker for Educafric PWA with Enhanced Notifications
const CACHE_NAME = 'educafric-v2.5-cache-fix';
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

// Fetch event with improved caching strategy to fix authentication issues
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // 🚫 CRITICAL: Filter non-web protocols to prevent cache errors
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    console.log('[SW] Ignoring non-web protocol:', url.protocol);
    return;
  }
  
  // 🚫 NEVER cache authentication and API endpoints
  const isAuthEndpoint = url.pathname.includes('/api/auth') || 
                         url.pathname.includes('/auth') ||
                         url.pathname.includes('/api/') ||
                         url.pathname.includes('/login') ||
                         url.pathname.includes('/logout');
  
  if (isAuthEndpoint) {
    // For auth/API endpoints: ALWAYS use network, never cache
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Special handling for PWA icons to avoid cache issues
  const isImageRequest = event.request.url.match(/\.(png|jpg|jpeg|ico|svg)$/i);
  const isPWAIcon = event.request.url.includes('android-chrome') || 
                   event.request.url.includes('educafric-logo') ||
                   event.request.url.includes('favicon');
  
  if (isImageRequest && isPWAIcon) {
    // For PWA icons, try network first, then cache
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            // Cache the fresh response
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
            return response;
          }
          throw new Error('Network response not ok');
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For static assets (CSS, JS, images): cache first strategy
  const isStaticAsset = event.request.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i) ||
                       url.pathname.includes('/assets/') ||
                       url.pathname.includes('/static/');
  
  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then((fetchResponse) => {
            if (fetchResponse.ok) {
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return fetchResponse;
          });
        })
    );
    return;
  }
  
  // For navigation and dynamic content: network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses for non-auth content
        if (response.ok && !isAuthEndpoint) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache only for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match('/offline.html');
          });
        }
        return caches.match(event.request);
      })
  );
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
// Lightweight Service Worker for Educafric PWA - Memory Optimized with FCM Support
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const CACHE_NAME = 'educafric-v3-optimized';

// Firebase configuration for FCM
const firebaseConfig = {
  apiKey: "AIzaSyBl5dHJJdQU_PcHUOKjpIQpKX5I3WlSjDU",
  authDomain: "smartwatch-tracker-e061f.firebaseapp.com", 
  projectId: "smartwatch-tracker-e061f",
  storageBucket: "smartwatch-tracker-e061f.appspot.com",
  messagingSenderId: "1044457806644",
  appId: "1:1044457806644:web:cfcc1b5d1bd9aa8a8c2a8b"
};

// Initialize Firebase in service worker
let messaging = null;
if (firebase) {
  firebase.initializeApp(firebaseConfig);
  messaging = firebase.messaging();
  
  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log('[SW] 📱 Received background FCM message:', payload);
    
    const notificationTitle = payload.notification?.title || 'EDUCAFRIC';
    const notificationOptions = {
      body: payload.notification?.body || 'Nouvelle notification',
      icon: '/educafric-logo-128.png',
      badge: '/educafric-logo-128.png',
      tag: payload.data?.tag || 'educafric-notification',
      data: {
        ...payload.data,
        timestamp: Date.now(),
        fcm: true
      },
      requireInteraction: payload.data?.priority === 'high',
      actions: payload.data?.actionUrl ? [{
        action: 'open',
        title: payload.data?.actionText || 'Ouvrir',
        icon: '/educafric-logo-128.png'
      }] : undefined
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Minimal cache to reduce memory usage
const urlsToCache = [
  '/',
  '/manifest.json',
  '/educafric-logo-128.png'
];

// Simple device check (cached result to avoid repeated calculations)
let isLowEnd = null;
const checkDeviceOnce = () => {
  if (isLowEnd === null) {
    const memory = navigator.deviceMemory || 1;
    isLowEnd = memory <= 2;
  }
  return isLowEnd;
};

// Alias for backward compatibility
const isLowEndDevice = checkDeviceOnce;

// Lightweight install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
      .catch(() => {
        // Minimal fallback cache on error
        return caches.open(CACHE_NAME).then(cache => cache.addAll(['/']));
      })
  );
});

// Lightweight activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event with improved caching strategy to fix authentication issues
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // 🚫 CRITICAL: Filter non-web protocols to prevent cache errors
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    // Silently ignore non-web protocols (chrome-extension, etc.) without logging
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
  
  // Stratégie adaptative pour les ressources statiques
  const isStaticAsset = event.request.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i) ||
                       url.pathname.includes('/assets/') ||
                       url.pathname.includes('/static/');
  
  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request)
        .then(async (response) => {
          if (response) {
            return response;
          }
          
          try {
            const fetchResponse = await fetch(event.request);
            
            if (fetchResponse.ok) {
              const responseClone = fetchResponse.clone();
              
              // Cache intelligent selon l'appareil
              const cache = await caches.open(CACHE_NAME);
              
              if (isLowEndDevice()) {
                // Vérifier la taille avant mise en cache
                const cachedRequests = await cache.keys();
                if (cachedRequests.length >= 15) {
                  // Supprimer les plus anciens pour faire de la place
                  await cache.delete(cachedRequests[0]);
                }
              }
              
              await cache.put(event.request, responseClone);
            }
            
            return fetchResponse;
          } catch (error) {
            // Fallback silencieux pour erreurs réseau
            return new Response('Ressource non disponible', { status: 404 });
          }
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
    } else if (event.action === 'view') {
      event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
      );
    } else if (event.action === 'dismiss') {
      // Just close the notification
      return;
    }
  } else {
    // Handle notification body click - improved URL handling
    const targetUrl = event.notification.data?.url || '/';
    
    event.waitUntil(
      clients.matchAll({ 
        type: 'window',
        includeUncontrolled: true 
      }).then((clientsArr) => {
        // Try to find existing window with target URL
        const targetClient = clientsArr.find(client => {
          try {
            const clientUrl = new URL(client.url);
            const target = new URL(targetUrl, clientUrl.origin);
            return clientUrl.pathname === target.pathname;
          } catch {
            return false;
          }
        });
        
        if (targetClient) {
          return targetClient.focus();
        } else {
          // Open new window with target URL
          const fullUrl = targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`;
          return clients.openWindow(fullUrl);
        }
      })
    );
  }

  // Send message to client about notification click
  event.waitUntil(
    clients.matchAll({ includeUncontrolled: true }).then((clientsArr) => {
      clientsArr.forEach(client => {
        client.postMessage({
          type: 'NOTIFICATION_CLICKED',
          data: event.notification.data,
          action: event.action || 'body_click',
          timestamp: Date.now()
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

    // Show notification and send confirmation back to client
    self.registration.showNotification(title, notificationOptions)
      .then(() => {
        console.log('[SW] ✅ Notification displayed successfully');
        
        // Auto-open notification if configured
        if (notificationOptions.data?.autoOpen && notificationOptions.data?.url) {
          console.log('[SW] 🚀 Auto-opening notification:', notificationOptions.data.url);
          
          // Small delay to let user see the notification
          setTimeout(() => {
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
              if (clientList.length > 0) {
                // Focus existing window and navigate
                const client = clientList[0];
                client.focus();
                client.postMessage({
                  type: 'AUTO_OPEN_NOTIFICATION',
                  url: notificationOptions.data.url,
                  timestamp: Date.now()
                });
              } else {
                // Open new window
                clients.openWindow(notificationOptions.data.url);
              }
            });
          }, 1500); // 1.5 second delay
        }
        
        // Send confirmation back to client
        if (event.source) {
          event.source.postMessage({
            type: 'NOTIFICATION_SHOWN',
            success: true,
            tag: notificationOptions.tag,
            timestamp: Date.now()
          });
        } else {
          // Fallback: broadcast to all clients
          clients.matchAll().then(clientList => {
            clientList.forEach(client => {
              client.postMessage({
                type: 'NOTIFICATION_SHOWN',
                success: true,
                tag: notificationOptions.tag,
                timestamp: Date.now()
              });
            });
          });
        }
      })
      .catch(error => {
        console.error('[SW] ❌ Failed to show notification:', error);
        
        // Send error back to client
        if (event.source) {
          event.source.postMessage({
            type: 'NOTIFICATION_ERROR',
            success: false,
            error: error.message,
            tag: notificationOptions.tag,
            timestamp: Date.now()
          });
        }
      });
  }
});

// Handle notification click events (FCM + standard notifications)
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 📱 Notification clicked:', event.notification.data);
  
  event.notification.close();

  // Handle FCM or standard notification data
  const data = event.notification.data || {};
  let targetUrl = data.actionUrl || data.url || '/';
  
  // For FCM notifications, check click_action
  if (data.fcm && data.click_action) {
    targetUrl = data.click_action;
  }
  
  // Handle action button clicks
  if (event.action === 'open' && data.actionUrl) {
    targetUrl = data.actionUrl;
  }

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // Check if there's already a window open
      for (let client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // If no existing window, open a new one
      if (clients.openWindow) {
        console.log('[SW] 🚀 Opening new window for FCM notification:', targetUrl);
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Background sync optimisé pour appareils bas de gamme
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  // Désactiver background sync pour appareils très limités
  if (isLowEndDevice()) {
    const memory = navigator.deviceMemory || 0;
    if (memory < 1) {
      console.log('[SW] Background sync désactivé - Mémoire insuffisante');
      return;
    }
  }
  
  if (event.tag === 'background-notifications') {
    event.waitUntil(
      fetch('/api/notifications/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(err => {
        console.log('[SW] Background sync failed:', err);
      })
    );
  }
  
  // Nettoyage périodique du cache
  if (event.tag === 'cache-cleanup' && isLowEndDevice()) {
    event.waitUntil(cleanupCache());
  }
});

// Nettoyage périodique pour éviter l'accumulation
if (isLowEndDevice()) {
  // Nettoyer le cache toutes les heures
  setInterval(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        if ('sync' in registration) {
          return registration.sync.register('cache-cleanup');
        }
      });
    }
  }, 3600000); // 1 heure
}
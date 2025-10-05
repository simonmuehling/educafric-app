// Ultra-lightweight Service Worker for Educafric - Performance Optimized
const CACHE_NAME = 'educafric-minimal-v1';
const CRITICAL_RESOURCES = [
  '/',
  '/manifest.json'
];

// Minimal install - cache only critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CRITICAL_RESOURCES))
      .then(() => self.skipWaiting())
      .catch(() => {}) // Silent fail to prevent errors
  );
});

// Minimal activate - just claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Ultra-fast fetch strategy - network first for everything
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for same origin
  if (event.request.method !== 'GET' || 
      !event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Never cache auth/API endpoints
  const url = new URL(event.request.url);
  if (url.pathname.includes('/api/') || 
      url.pathname.includes('/auth')) {
    return;
  }
  
  // Simple network-first strategy for static assets only
  if (url.pathname.match(/\.(css|js|png|jpg|ico)$/)) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});
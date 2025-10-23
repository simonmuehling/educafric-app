// Service Worker Registration for Educafric Offline Mode

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      console.log('[SW_REGISTRATION] Registering service worker...');
      
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });

      console.log('[SW_REGISTRATION] ✅ Service worker registered successfully:', registration.scope);

      // Handle updates - Silent update without reload
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW_REGISTRATION] ✅ New service worker installed - will activate on next page load');
              
              // Tell the new worker to skip waiting and take over
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              
              // Don't auto-reload - let it activate naturally on next navigation
            }
          });
        }
      });

      // Listen for controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[SW_REGISTRATION] 🔄 Service worker controller changed');
      });

      return registration;
    } catch (error) {
      console.error('[SW_REGISTRATION] ❌ Service worker registration failed:', error);
      return null;
    }
  } else {
    console.warn('[SW_REGISTRATION] ⚠️ Service workers not supported');
    return null;
  }
}

// Unregister service worker
export async function unregisterServiceWorker(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const success = await registration.unregister();
      console.log('[SW_REGISTRATION] Service worker unregistered:', success);
      return success;
    } catch (error) {
      console.error('[SW_REGISTRATION] Failed to unregister service worker:', error);
      return false;
    }
  }
  return false;
}

// Cache specific URLs
export async function cacheUrls(urls: string[]): Promise<void> {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_URLS',
      urls
    });
  }
}

// Clear all caches
export async function clearCache(): Promise<void> {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CLEAR_CACHE'
    });
  }
}

// Check if service worker is active
export function isServiceWorkerActive(): boolean {
  return 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;
}

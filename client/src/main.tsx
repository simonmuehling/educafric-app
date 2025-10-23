import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// setupConsoleFilter now loaded dynamically in App.tsx to prevent import conflicts
import { fastModuleLoader } from "./utils/fastModuleLoader";
import "./utils/pwaCleanup"; // Initialize PWA cleanup to prevent crashes

// Register Service Worker for PWA functionality - PRODUCTION ONLY
// Disable SW in development to prevent caching issues
const isDevelopment = import.meta.env.DEV || window.location.hostname.includes('repl.co');
const enableSW = !isDevelopment;

if (isDevelopment) {
  console.log('Service Worker registration disabled for development');
  
  // Unregister any existing service workers in development
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
        console.log('[DEV] Unregistered service worker');
      });
    });
  }
} else if ('serviceWorker' in navigator && enableSW) {
  console.log('[PWA] 🔧 Service Worker enabled for production');
  
  window.addEventListener('load', async () => {
    try {
      // Try multiple SW paths for compatibility
      const swPaths = ['/sw.js', '/service-worker.js'];
      let registered = false;
      
      for (const swPath of swPaths) {
        try {
          const registration = await navigator.serviceWorker.register(swPath, {
            scope: '/',
            updateViaCache: 'none' // Always check for updates
          });
          
          console.log('[PWA] ✅ Service Worker registered:', swPath);
          localStorage.setItem('pwa-sw-registered', 'true');
          registered = true;
          
          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('[PWA] 🔄 Service Worker update found');
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available - auto-reload after 2 seconds
                  console.log('[PWA] ✅ New version installed - reloading...');
                  setTimeout(() => {
                    window.location.reload();
                  }, 2000);
                }
              });
            }
          });
          
          // Check for updates every 5 minutes in production
          setInterval(() => {
            registration.update();
          }, 5 * 60 * 1000);
          
          break; // Success, stop trying other paths
        } catch (err) {
          console.log(`[PWA] Failed to register ${swPath}, trying next...`);
        }
      }
      
      if (!registered) {
        console.log('[PWA] ⚠️ No service worker file found');
      }
      
    } catch (error: any) {
      console.log('[PWA] Service Worker registration failed:', error?.message || 'Unknown error');
    }
  });
} else {
  console.log('[PWA] ❌ Service Worker not supported by this browser');
}

// Setup console filtering moved to App.tsx (dynamic import) to prevent import conflicts

// Initialize fast module loading for instant performance (startup optimization only)
// Moved critical module preloading to App.tsx useGlobalModulePreloader hook
// fastModuleLoader.preloadCriticalModules();

// 🚫 CRITICAL: React hooks error fix - Render App properly  
createRoot(document.getElementById("root")!).render(<App />);

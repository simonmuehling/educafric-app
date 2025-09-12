import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// setupConsoleFilter now loaded dynamically in App.tsx to prevent import conflicts
import { fastModuleLoader } from "./utils/fastModuleLoader";
import "./utils/pwaCleanup"; // Initialize PWA cleanup to prevent crashes

// Register Service Worker for PWA functionality - ENABLED FOR DEVELOPMENT
// Enable in development for PWA notifications testing
const enableSW = import.meta.env.VITE_ENABLE_SW !== 'false'; // Default to enabled

if ('serviceWorker' in navigator && enableSW) {
  window.addEventListener('load', async () => {
    try {
      // Check if service worker file exists and has correct MIME type
      const response = await fetch('/sw.js', { 
        method: 'HEAD',
        headers: { 'Accept': 'application/javascript' }
      });
      
      if (response.ok && response.headers.get('content-type')?.includes('javascript')) {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        console.log('[PWA] Service Worker registered:', registration);
        localStorage.setItem('pwa-sw-registered', 'true');
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('[PWA] Service Worker update found');
        });
      } else {
        console.log('[PWA] Service Worker file not found or wrong MIME type, skipping registration');
      }
      
    } catch (error: any) {
      console.log('[PWA] Service Worker registration skipped:', error?.message || 'Unknown error');
    }
  });
} else {
  console.log('[PWA] Service Worker registration disabled via VITE_ENABLE_SW=false');
}

// Setup console filtering moved to App.tsx (dynamic import) to prevent import conflicts

// Initialize fast module loading for instant performance (startup optimization only)
// Moved critical module preloading to App.tsx useGlobalModulePreloader hook
// fastModuleLoader.preloadCriticalModules();

// 🚫 CRITICAL: React hooks error fix - Render App properly  
createRoot(document.getElementById("root")!).render(<App />);

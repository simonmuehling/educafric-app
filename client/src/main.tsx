import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setupConsoleFilter } from "./utils/consoleFilter";
import { fastModuleLoader } from "./utils/fastModuleLoader";

// Register Service Worker for PWA functionality - Only in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
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
  console.log('[PWA] Service Worker registration disabled for development');
  // Prevent any residual SW loading attempts
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(reg => reg.unregister());
    }).catch(() => {});
  }
}

// Setup console filtering to reduce spam in development
setupConsoleFilter();

// Initialize fast module loading for instant performance
fastModuleLoader.preloadCriticalModules();

createRoot(document.getElementById("root")!).render(<App />);

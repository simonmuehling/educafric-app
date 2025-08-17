import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register Service Worker for PWA functionality - Only in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      // Only register if service worker file exists
      const response = await fetch('/sw.js', { method: 'HEAD' });
      if (response.ok) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('[PWA] Service Worker registered:', registration);
        localStorage.setItem('pwa-sw-registered', 'true');
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('[PWA] Service Worker update found');
        });
      } else {
        console.log('[PWA] Service Worker file not found, skipping registration');
      }
      
    } catch (error: any) {
      console.log('[PWA] Service Worker registration skipped:', error?.message || 'Unknown error');
    }
  });
} else {
  console.log('[PWA] Service Worker registration disabled for development');
}

createRoot(document.getElementById("root")!).render(<App />);

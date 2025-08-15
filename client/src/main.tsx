import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Register service worker in both development and production for PWA installation
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[PWA] Service Worker registered:', registration);
      
      // Store registration availability for PWA installation
      localStorage.setItem('pwa-sw-registered', 'true');
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        console.log('[PWA] Service Worker update found');
      });
      
      // Check if waiting for activation
      if (registration.waiting) {
        console.log('[PWA] Service Worker waiting');
      }
      
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('[PWA] Message from Service Worker:', event.data);
      });
      
      // Enable notification permission request for testing
      if ('Notification' in window && Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
          console.log('[PWA] Notification permission requested');
        } catch (error) {
          console.warn('[PWA] Could not request notification permission:', error);
        }
      }
      
    } catch (error) {
      console.warn('[PWA] Service Worker setup failed:', error);
    }
  });
} else {
  console.warn('[PWA] Service Worker not supported in this browser');
}

createRoot(document.getElementById("root")!).render(<App />);

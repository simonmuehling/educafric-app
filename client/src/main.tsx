import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // In production, use the actual service worker
      if (import.meta.env.PROD) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('[PWA] Service Worker registered:', registration);
        
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
      } else {
        // In development, provide minimal PWA support without full service worker
        console.log('Service Worker registration disabled for development');
        
        // Enable basic notification permission request for development testing
        if ('Notification' in window && Notification.permission === 'default') {
          try {
            await Notification.requestPermission();
            console.log('[PWA] Notification permission requested for development');
          } catch (error) {
            console.warn('[PWA] Could not request notification permission:', error);
          }
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

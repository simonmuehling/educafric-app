import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
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
      
    } catch (error) {
      console.warn('[PWA] Service Worker registration failed:', error);
    }
  });

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('[PWA] Message from Service Worker:', event.data);
  });
} else if ('serviceWorker' in navigator && import.meta.env.DEV) {
  // Development mode - still enable PWA notifications but with fallback
  console.log('[PWA] Development mode - PWA notifications available through browser API');
}

createRoot(document.getElementById("root")!).render(<App />);

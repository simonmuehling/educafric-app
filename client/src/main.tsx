import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setupConsoleFilter } from "./utils/consoleFilter";
import { fastModuleLoader } from "./utils/fastModuleLoader";
import "./utils/pwaCleanup"; // Initialize PWA cleanup to prevent crashes

// TEMPORARILY DISABLE ALL SERVICE WORKERS FOR DEBUGGING
if ('serviceWorker' in navigator) {
  // Unregister any existing service workers
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister().then(() => {
        console.log('[DEBUG] Unregistered service worker:', registration.scope);
      });
    }
  });
  console.log('[DEBUG] Service Workers completely disabled for debugging');
}

// Setup console filtering to reduce spam in development
setupConsoleFilter();

// Initialize fast module loading for instant performance
fastModuleLoader.preloadCriticalModules();

// 🚫 CRITICAL: React hooks error fix - Render App properly  
createRoot(document.getElementById("root")!).render(<App />);

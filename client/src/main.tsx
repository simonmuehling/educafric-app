import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./utils/pwaCleanup"; // Initialize PWA cleanup to prevent crashes

// INITIALIZE CSS OPTIMIZATION for faster loading
import { initializeCSSOptimization } from "./utils/cssOptimizer";
initializeCSSOptimization();

// Setup console filtering asynchronously to not block startup
import("./utils/consoleFilter").then(({ setupConsoleFilter }) => {
  setupConsoleFilter();
});

// ULTRA-FAST startup with consolidated module loading
createRoot(document.getElementById("root")!).render(<App />);

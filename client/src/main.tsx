import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./utils/pwaCleanup"; // Initialize PWA cleanup to prevent crashes

// Setup console filtering asynchronously to not block startup
import("./utils/consoleFilter").then(({ setupConsoleFilter }) => {
  setupConsoleFilter();
});

// Fast startup - Let App.tsx handle all module preloading to avoid duplications
createRoot(document.getElementById("root")!).render(<App />);

import express, { type Request, Response, NextFunction } from "express";
import { exec } from "child_process";
import { registerRoutes } from "./routes";
import { criticalAlertingService } from "./services/criticalAlertingService";
import { systemReportService } from "./services/systemReportService";
import { validateEnvironment } from "./middleware/validation";
import { errorHandler } from "./middleware/errorHandler";
import { setupVite, serveStatic, log } from "./vite";
import { setupAutoFixMiddleware } from "./autofix-system";
import {
  compressionMiddleware,
  timeoutMiddleware,
  performanceMiddleware,
  cacheControlMiddleware,
  memoryCleanupMiddleware
} from "./middleware/performance";
import {
  assetOptimizationMiddleware,
  cssOptimizationMiddleware,
  jsOptimizationMiddleware,
  imageOptimizationMiddleware,
  bundleOptimizationMiddleware
} from "./middleware/assetOptimization";

// Load environment variables
process.env.VONAGE_API_KEY = '81c4973f';
process.env.VONAGE_API_SECRET = '1tqJuvQPttXyGpKL';
process.env.VONAGE_FROM_NUMBER = '+237657004011';
// Stripe keys will be automatically loaded from Replit Secrets

const app = express();

// Performance optimizations
app.use(compressionMiddleware);
app.use(timeoutMiddleware(15000)); // 15 second timeout
app.use(performanceMiddleware);
app.use(cacheControlMiddleware);
app.use(memoryCleanupMiddleware);

// Asset optimizations
app.use(assetOptimizationMiddleware);
app.use(cssOptimizationMiddleware);
app.use(jsOptimizationMiddleware);
app.use(imageOptimizationMiddleware);
app.use(bundleOptimizationMiddleware);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Validate environment variables first
  try {
    validateEnvironment();
    console.log('[SECURITY] Environment validation passed');
  } catch (error) {
    console.error('[SECURITY] Environment validation failed:', error);
    process.exit(1);
  }
  
  // Setup automatic error fixing system
  setupAutoFixMiddleware(app);

  const server = await registerRoutes(app);

  // Initialize automated system reporting service
  console.log('[SYSTEM_REPORTS] Initializing automated reporting service...');
  // systemReportService automatically initializes itself

  // Enhanced error handler middleware with critical alerting
  app.use(async (err: any, req: Request, res: Response, next: NextFunction) => {
    // Send critical alert for server errors
    try {
      await criticalAlertingService.sendServerErrorAlert(err, req);
    } catch (alertError) {
      console.error('Failed to send critical alert:', alertError);
    }
    
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  // Enhanced error handling and auto-recovery
  process.on('uncaughtException', (error) => {
    console.error('[AUTOFIX] Uncaught exception detected:', error.message);
    
    if (error.message.includes('EADDRINUSE')) {
      console.log('[AUTOFIX] Fixing port conflict...');
      exec('pkill -f "port 5000" || true', (err: any) => {
        if (err) {
          console.error('[AUTOFIX] Port fix failed:', err);
          console.log('[AUTOFIX] Could not auto-fix error, manual intervention required');
        } else {
          console.log('[AUTOFIX] Port cleared, restarting...');
          setTimeout(() => {
            process.exit(0); // Exit to allow restart
          }, 1000);
        }
      });
    } else {
      console.error('[AUTOFIX] Could not auto-fix error, manual intervention required');
    }
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('[AUTOFIX] Unhandled rejection at:', promise, 'reason:', reason);
  });

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  }).on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.log('[AUTOFIX] Port in use, attempting to clear and restart...');
      exec('lsof -ti:5000 | xargs kill -9 && sleep 2', () => {
        setTimeout(() => {
          server.listen({ port, host: "0.0.0.0", reusePort: true });
        }, 3000);
      });
    } else {
      console.error('[SERVER_ERROR]', err);
    }
  });
})();

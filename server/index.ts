import express, { type Request, Response, NextFunction } from "express";
import { exec } from "child_process";
import path from "node:path";
import fs from "node:fs";
import { registerRoutes } from "./routes";
import { criticalAlertingService } from "./services/criticalAlertingService";
import { systemReportService } from "./services/systemReportService";
import { ConnectionTrackingService } from "./services/connectionTrackingService";
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
import { realTimeService } from "./services/realTimeService";
import { realTimeTrackingMiddleware } from "./middleware/realTimeIntegration";
import {
  assetOptimizationMiddleware,
  cssOptimizationMiddleware,
  jsOptimizationMiddleware,
  imageOptimizationMiddleware,
  bundleOptimizationMiddleware
} from "./middleware/assetOptimization";
import { requestIdMiddleware } from "./middleware/requestId";
import { healthz, readyz, markAsReady } from "./middleware/healthChecks";
import { logJson } from "./utils/logger";

// Load environment variables
// Stripe keys will be automatically loaded from Replit Secrets

const app = express();

// Request ID tracking - MUST be first
app.use(requestIdMiddleware);

// Performance optimizations
app.use(compressionMiddleware);
app.use(timeoutMiddleware(30000)); // 30 seconds timeout - prevents memory buildup and hangs
app.use(performanceMiddleware);
app.use(cacheControlMiddleware);
app.use(memoryCleanupMiddleware);

// Memory optimization for service worker
app.get('/sw.js', (req, res) => {
  // Set aggressive no-cache headers to prevent memory buildup
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Service-Worker-Allowed', '/');
  
  try {
    // In development, serve the lightweight minimal service worker for performance
    const swPath = app.get("env") === "development" 
      ? path.resolve('public/sw-minimal.js')
      : path.resolve('public/sw.js');
    
    if (fs.existsSync(swPath)) {
      console.log(`[SW_OPTIMIZATION] Serving ${app.get("env") === "development" ? 'minimal' : 'full'} service worker for performance`);
      res.sendFile(swPath);
    } else {
      // Minimal memory-efficient service worker
      const minimalSW = `
        const CACHE_NAME = 'educafric-minimal';
        self.addEventListener('install', () => self.skipWaiting());
        self.addEventListener('activate', () => self.clients.claim());
        self.addEventListener('fetch', (e) => {
          if (e.request.method === 'GET' && e.request.url.includes('.html')) {
            e.respondWith(fetch(e.request).catch(() => caches.match('/')));
          }
        });
      `;
      res.send(minimalSW);
    }
  } catch (error) {
    res.status(500).send('// SW Error');
  }
});

// PWA CRITICAL ROUTES - Service worker route defined above for memory optimization

// Fix manifest MIME type
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile('manifest.json', { root: 'public' });
});

// Fix critical PWA icons MIME types
const pwaIcons = [
  'android-chrome-192x192.png',
  'android-chrome-512x512.png', 
  'educafric-logo-128.png',
  'educafric-logo-512.png',
  'android-icon-192x192.png',
  'apple-touch-icon.png',
  'favicon.png'
];

pwaIcons.forEach(iconName => {
  app.get(`/${iconName}`, (req, res) => {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(iconName, { root: 'public' });
  });
});

// Fix favicon.ico specifically
app.get('/favicon.ico', (req, res) => {
  res.setHeader('Content-Type', 'image/x-icon');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile('favicon.ico', { root: 'public' });
});

// 🚫 CRITICAL: JS middleware MUST be first to set correct MIME types before Vite
app.use(jsOptimizationMiddleware);
app.use(assetOptimizationMiddleware);
app.use(cssOptimizationMiddleware);
app.use(imageOptimizationMiddleware);
app.use(bundleOptimizationMiddleware);

// Domain redirection middleware - redirect educafric.com to www.educafric.com
app.use((req, res, next) => {
  const host = req.get('host');
  const protocol = req.header('x-forwarded-proto') || 'https';
  
  // Redirect non-www to www
  if (host === 'educafric.com' || host === 'educafric.com:443') {
    return res.redirect(301, `${protocol}://www.educafric.com${req.url}`);
  }
  
  // Also handle HTTP to HTTPS redirect for www
  if (host === 'www.educafric.com' && protocol === 'http') {
    return res.redirect(301, `https://www.educafric.com${req.url}`);
  }
  
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Health check endpoints - MUST be before authentication
app.get('/healthz', healthz);
app.get('/readyz', readyz);

// Real-time tracking middleware for API operations
app.use('/api', realTimeTrackingMiddleware);

// 🚫 CRITICAL: Optimized static asset serving for production performance
app.use('/assets', express.static('dist/public/assets', {
  maxAge: '1y', // 1 year cache for hashed assets
  immutable: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }
    res.setHeader('X-Asset-Optimized', 'true');
  }
}));

// 🚀 MEMORY-OPTIMIZED: PWA Notifications Fix - Specific route handler to prevent 265MB memory leak
app.get('/pwa-notifications-fix.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours cache
  res.setHeader('X-Memory-Optimized', 'true');
  res.sendFile('pwa-notifications-fix.js', { root: 'public' });
});

// Configure correct MIME types for public assets (consolidated to prevent memory leaks)
app.use('/public', express.static('public', {
  maxAge: '1d', // 1 day cache for public assets
  setHeaders: (res, path) => {
    if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.ico')) {
      res.setHeader('Content-Type', 'image/x-icon');
    } else if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    } else if (path.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    } else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
    res.setHeader('X-Asset-Source', 'public-prefixed');
  }
}));

// Serve PWA assets from root with memory optimization
app.use(express.static('public', {
  maxAge: '1d', // 1 day cache
  setHeaders: (res, path) => {
    // Skip serving pwa-notifications-fix.js here to prevent duplicate processing
    if (path.endsWith('pwa-notifications-fix.js')) {
      return; // Already handled by specific route above
    }
    
    if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.ico')) {
      res.setHeader('Content-Type', 'image/x-icon');
    } else if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    } else if (path.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    } else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
    res.setHeader('X-Asset-Source', 'public-root');
  }
}));



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

  // Mark app as ready for health checks
  markAsReady();
  logJson('info', 'app_ready', { message: 'Application is ready to handle requests' });

  // Initialize real-time WebSocket service
  console.log('[REALTIME] Initializing WebSocket service...');
  realTimeService.initialize(server);
  console.log('[REALTIME] ✅ Real-time service initialized');

  // Initialize automated system reporting service
  console.log('[SYSTEM_REPORTS] Initializing automated reporting service...');
  // systemReportService automatically initializes itself

  // Initialize daily connection reporting service with cron job
  const { default: cron } = await import('node-cron');
  
  // Send daily connection report at 8:00 AM Africa/Douala timezone
  cron.schedule('0 8 * * *', async () => {
    try {
      console.log('[DAILY_CONNECTIONS] Sending scheduled daily report...');
      await ConnectionTrackingService.sendDailyReport();
      console.log('[DAILY_CONNECTIONS] ✅ Daily report sent successfully to simonpmuehling@gmail.com');
    } catch (error) {
      console.error('[DAILY_CONNECTIONS] ❌ Failed to send daily report:', error);
    }
  }, {
    timezone: 'Africa/Douala'
  });
  
  console.log('[DAILY_CONNECTIONS] ✅ Daily connection reports scheduled at 8:00 AM (Africa/Douala) → simonpmuehling@gmail.com');

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
    logJson('info', 'server_started', { port, host: '0.0.0.0' });
  }).on('error', (err: any) => {
    console.error('[SERVER_ERROR]', err);
    if (err.code === 'EADDRINUSE') {
      console.log('[AUTOFIX] Port already in use - server may already be running');
    }
  });

  // Graceful shutdown handling
  function gracefulShutdown(signal: string) {
    logJson('info', 'shutdown_initiated', { signal });
    console.log(`\n[SHUTDOWN] ${signal} received, closing server gracefully...`);
    
    server.close(() => {
      logJson('info', 'shutdown_complete', { signal });
      console.log('[SHUTDOWN] ✅ HTTP server closed');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logJson('error', 'shutdown_forced', { signal, reason: 'timeout' });
      console.error('[SHUTDOWN] ❌ Forced shutdown after timeout');
      process.exit(1);
    }, 10000).unref();
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
})();

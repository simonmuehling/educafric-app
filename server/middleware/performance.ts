import compression from 'compression';
import type { Request, Response, NextFunction } from 'express';

// Response compression middleware
export const compressionMiddleware = compression({
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Good balance between compression ratio and speed
  threshold: 1024, // Only compress responses > 1KB
});

// Request timeout middleware
export const timeoutMiddleware = (timeoutMs: number = 15000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        console.error(`[TIMEOUT] Request ${req.method} ${req.url} timed out after ${timeoutMs}ms`);
        res.status(408).json({
          error: 'Request timeout',
          message: 'The request took too long to process'
        });
      }
    }, timeoutMs);

    // Clear timeout when response is finished
    res.on('finish', () => {
      clearTimeout(timeout);
    });

    // Clear timeout when connection is closed
    req.on('close', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

// Performance monitoring middleware - optimized for memory efficiency
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage().rss; // Only track RSS memory

  // Store original res.end to restore it properly
  const originalEnd = res.end;
  
  // Override res.end to capture metrics safely
  res.end = function(chunk?: any, encoding?: any) {
    try {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const endMemory = process.memoryUsage().rss;
      const memoryDiff = endMemory - startMemory;

      // Ultra-minimal logging for 3500+ user scale
      if (duration > 10000) { // Only log extremely slow requests (>10s)
        console.error(`[CRITICAL] TIMEOUT: ${req.method} ${req.url} took ${duration}ms`);
      }

      // Much higher threshold for memory leak detection to reduce noise (200MB+)
      // Only log truly problematic memory usage, not normal Vite dev server usage
      if (memoryDiff > 200 * 1024 * 1024 && !req.url.includes('/src/') && !req.url.includes('@vite')) {
        console.error(`[CRITICAL_MEMORY] ${req.method} ${req.url} used ${(memoryDiff / 1024 / 1024).toFixed(2)}MB`);
        
        // Force garbage collection if available, but less aggressively
        if (global.gc && Math.random() < 0.1) { // Only 10% of the time
          try {
            setImmediate(() => global.gc?.());
          } catch (gcError) {
            // Ignore GC errors
          }
        }
      }

      // Only add performance headers for API routes to reduce overhead
      if (!res.headersSent && req.url.startsWith('/api/')) {
        try {
          res.setHeader('X-Response-Time', `${duration}ms`);
        } catch (error) {
          // Ignore header setting errors
        }
      }
    } catch (performanceError) {
      // Ensure original functionality is preserved even if monitoring fails
    } finally {
      // Always call original end method
      return originalEnd.call(this, chunk, encoding);
    }
  };

  next();
};

// Cache control middleware for static assets
export const cacheControlMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Set cache headers for static assets
    if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
      res.setHeader('ETag', `"${Date.now()}"`);
    } else if (req.url.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  } catch (error) {
    // Ignore header setting errors
  }

  next();
};

// Memory cleanup middleware - active memory management
export const memoryCleanupMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Trigger garbage collection every 100 requests for large static files
  if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/) && Math.random() < 0.01) {
    // 1% chance to trigger GC for static assets
    if (global.gc) {
      try {
        setImmediate(() => global.gc?.());
      } catch (error) {
        // Ignore GC errors
      }
    }
  }
  
  // Clean up request data after response
  res.on('finish', () => {
    // Clear any request-specific data that might cause memory leaks
    try {
      if (req.body) {
        delete req.body;
      }
      if (req.files) {
        delete req.files;
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });
  
  next();
};

// Health check optimization
export const healthCheck = (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    system: {
      uptime: Math.floor(uptime),
      memory: {
        used: Math.round(memoryUsage.rss / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024)
      },
      cpu: {
        load: process.cpuUsage(),
        platform: process.platform,
        arch: process.arch
      }
    },
    security: {
      total_events_24h: 0,
      total_events_1h: 0,
      critical_events_24h: 0,
      blocked_ips: 0,
      high_risk_ips: 0,
      event_types_24h: {},
      top_threat_ips: []
    }
  });
};

export default {
  compressionMiddleware,
  timeoutMiddleware,
  performanceMiddleware,
  cacheControlMiddleware,
  memoryCleanupMiddleware,
  healthCheck
};
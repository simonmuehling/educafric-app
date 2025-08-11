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
export const timeoutMiddleware = (timeoutMs: number = 30000) => {
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

// Performance monitoring middleware
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  // Override res.end to capture metrics safely
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const endMemory = process.memoryUsage();
    const memoryDiff = endMemory.rss - startMemory.rss;

    // Log performance metrics
    if (duration > 1000) { // Log slow requests (>1s)
      console.warn(`[PERFORMANCE] SLOW_REQUEST: ${req.method} ${req.url} took ${duration.toFixed(2)}ms`);
    }

    if (memoryDiff > 10 * 1024 * 1024) { // Log memory-intensive requests (>10MB)
      console.warn(`[PERFORMANCE] MEMORY_INTENSIVE: ${req.method} ${req.url} used ${(memoryDiff / 1024 / 1024).toFixed(2)}MB`);
    }

    // Add performance headers only if headers haven't been sent
    if (!res.headersSent) {
      try {
        res.setHeader('X-Response-Time', `${duration}ms`);
        res.setHeader('X-Memory-Usage', `${(memoryDiff / 1024).toFixed(0)}KB`);
      } catch (error) {
        // Ignore header setting errors
      }
    }

    return originalEnd.call(this, chunk, encoding);
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

// Memory cleanup middleware (disabled to reduce log noise)
export const memoryCleanupMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Disabled memory monitoring to focus on other issues
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
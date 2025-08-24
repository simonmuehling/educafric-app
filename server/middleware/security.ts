import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Express } from 'express';

export function configureSecurityMiddleware(app: Express) {
  // Trust proxy for rate limiting in cloud environments
  app.set('trust proxy', 1);
  
  // Helmet.js with CSP DISABLED for debugging and X-Frame-Options disabled for Replit iframe
  app.use(helmet({
    contentSecurityPolicy: false, // Completely disable CSP to test cookie functionality
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    frameguard: false, // Disable X-Frame-Options to allow iframe display in Replit
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    hsts: false // Disable HSTS for development
  }));

  // Simplified CORS configuration to fix authentication errors
  app.use(cors({
    origin: true, // Allow all origins to prevent auth blocking
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
    credentials: true,
    optionsSuccessStatus: 200
  }));

  // Rate limiting DISABLED for 1000+ concurrent users support
  const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10000, // Very high limit - essentially disabled
    message: {
      error: 'Too many authentication attempts, please try again later',
      retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute  
    max: 50000, // Very high limit for 1000+ concurrent users
    message: {
      error: 'Too many requests, please try again later',
      retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Rate limiting COMPLETELY DISABLED for production scalability
  // No rate limiting applied - supporting 1000+ concurrent users
  console.log('[RATE_LIMITING] DISABLED - Supporting 1000+ concurrent users');
  
  // Simplified middleware to prevent errors
  app.use((req, res, next) => {
    // Basic timeout without complex logic
    try {
      if (req.path.includes('/upload')) {
        req.setTimeout(60000);
      } else {
        req.setTimeout(30000);
      }
      next();
    } catch (error) {
      console.error('[SECURITY_ERROR]', error);
      next(); // Continue even if timeout setting fails
    }
  });
}

// Security event logging middleware
export function securityLogger(req: any, res: any, next: any) {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id || null,
      userRole: req.user?.role || null
    };

    // Log security-relevant events
    if (req.url.includes('/auth/') || res.statusCode >= 400) {
      console.log(`[SECURITY] ${JSON.stringify(logData)}`);
    }
  });
  
  next();
}

// Production session configuration - Fixed for Replit cross-origin with inactivity timeout
export const productionSessionConfig = {
  secret: process.env.SESSION_SECRET || 'educafric-session-secret-change-in-production',
  resave: true, // Force save sessions to ensure persistence
  saveUninitialized: true, // Save all sessions
  rolling: false, // Don't reset expiration on each request - important for inactivity timeout
  cookie: {
    secure: false, // Must be false for development HTTP
    httpOnly: false, // Allow JavaScript access for debugging
    maxAge: 30 * 60 * 1000, // 30 minutes - matches frontend timeout
    sameSite: 'lax' as const, // More permissive for cross-origin
    path: '/', // Ensure cookie is sent for all paths
    domain: undefined, // Let browser handle domain
  },
  name: 'educafric.sid',
  proxy: true,
};
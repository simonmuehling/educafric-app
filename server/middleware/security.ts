import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Express } from 'express';

export function configureSecurityMiddleware(app: Express) {
  // Trust proxy for rate limiting in cloud environments
  app.set('trust proxy', 1);
  
  // Helmet.js with environment-aware SECURE headers
  const isProduction = process.env.NODE_ENV === 'production';
  
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: isProduction 
          ? ["'self'", "https://js.stripe.com"]
          : ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com", "*.replit.dev", "*.replit.app", "*.educafric.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "*.googleapis.com", "*.gstatic.com"],
        imgSrc: isProduction
          ? ["'self'", "data:", "https://q.stripe.com", "https://www.educafric.com"]
          : ["'self'", "data:", "https://q.stripe.com", "*.educafric.com", "*.replit.app", "*.replit.dev"],
        connectSrc: isProduction
          ? ["'self'", "https://api.stripe.com", "https://m.stripe.network"]
          : ["'self'", "*.replit.dev", "*.replit.app", "*.educafric.com", "https://api.stripe.com", "https://m.stripe.network", "wss://localhost:*", "ws://localhost:*"],
        fontSrc: ["'self'", "*.googleapis.com", "*.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"]
      }
    },
    crossOriginEmbedderPolicy: false, // Keep disabled for compatibility
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    hsts: isProduction ? {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    } : false, // Disable HSTS in development
    frameguard: { action: 'deny' }, // Prevent clickjacking
    noSniff: true, // Prevent MIME type sniffing
    // Remove xssFilter - ineffective and confusing (Helmet sets X-XSS-Protection: 0)
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
  }));

  // CORS configuration - Environment-aware for security
  const allowedOrigins = isProduction ? [
    // Production: Only specific trusted domains
    'https://educafric.com',
    'https://www.educafric.com'
  ] : [
    // Development: Include localhost and development domains
    'http://localhost:3000',
    'http://localhost:5000',
    'https://localhost:3000',
    'https://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
    'https://127.0.0.1:3000', 
    'https://127.0.0.1:5000',
    /^https:\/\/.*\.replit\.dev$/,
    /^https:\/\/.*\.replit\.app$/,
    'https://educafric.com',
    'https://www.educafric.com',
    /^https:\/\/.*\.educafric\.com$/
  ];

  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, server-to-server)
      if (!origin) return callback(null, true);
      
      // Check against allowed origins list
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (typeof allowedOrigin === 'string') {
          return origin === allowedOrigin;
        } else if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return false;
      });
      
      if (isAllowed) {
        return callback(null, true);
      }
      
      // Reject unauthorized origins with specific error
      console.warn(`[SECURITY] CORS blocked origin: ${origin}`);
      return callback(new Error(`CORS: Origin ${origin} not allowed`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
  }));

  // Production-grade rate limiting - Fixed stacked limiters and static asset exclusion
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts per 15 minutes per IP
    message: {
      error: 'Too many authentication attempts, please try again later',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
  });

  const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute  
    max: 300, // 300 requests per minute per IP (5 per second average)
    message: {
      error: 'Too many requests, please try again later',
      retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for static assets, WebSocket, and development routes
      const path = req.path;
      return path.startsWith('/public/') ||
             path.startsWith('/assets/') ||
             path.startsWith('/@vite/') ||
             path.startsWith('/@react-refresh') ||
             path.startsWith('/@fs/') ||
             path.startsWith('/ws') ||
             path.includes('.js') ||
             path.includes('.css') ||
             path.includes('.png') ||
             path.includes('.jpg') ||
             path.includes('.svg') ||
             path.includes('.ico');
    }
  });

  // Apply rate limiting to specific endpoints only (no stacking)
  app.use('/api/auth/', authLimiter);
  app.use('/api/', apiLimiter);
  // Remove general limiter to avoid double-counting and blocking static assets
  
  console.log('[RATE_LIMITING] ENABLED - Production security configured (no stacking)');
  
  // Minimal auth logging for performance
  app.use((req, res, next) => {
    // Remove auth logging to improve login speed
    next();
  });

  // Request size limits for African mobile networks
  app.use((req, res, next) => {
    if (req.path.includes('/upload')) {
      // Higher limit for file uploads
      req.setTimeout(60000); // 60 seconds for uploads
    } else {
      // Timeout étendu pour les API requests - augmenté pour éviter déconnexions
      req.setTimeout(300000); // 5 minutes (au lieu de 30 secondes)
    }
    next();
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

// Production session configuration - PWA-optimized for persistent login experience
export const productionSessionConfig = {
  secret: process.env.SESSION_SECRET || 'educafric-session-secret-change-in-production',
  resave: false, // Changed from true - can cause session race conditions
  saveUninitialized: false, // Don't create session until something stored
  rolling: true, // Reset expiration on each request - keeps active users logged in
  name: 'educafric.sid', // Explicit session name for consistency
  proxy: true,
  cookie: {
    // 🔧 CRITICAL FIX: Environment-aware cookie security
    secure: process.env.NODE_ENV === 'production', // Only secure in production (HTTPS), allow HTTP in development
    httpOnly: true, // Standard session cookie security
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 JOURS (au lieu de 24h) - Durée largement augmentée
    sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const, // 'none' for production iframe, 'lax' for development
    path: '/', // Available for all paths
  }
  // genid: removed - using express-session's secure default crypto-based generator
};
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import type { Express } from 'express';
import type { SessionOptions } from 'express-session';
import csurf from 'csurf';

/**
 * Centralized security middleware for Educafric
 * - Helmet with CSP
 * - CORS with credentials
 * - Rate limits
 * - CSRF protection with WhatsApp exemptions
 */

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
          ? ["'self'", "https://js.stripe.com", "https://8x8.vc", "https://meet.jit.si"]
          : ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com", "https://8x8.vc", "https://meet.jit.si", "*.replit.dev", "*.replit.app", "*.educafric.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "*.googleapis.com", "*.gstatic.com"],
        imgSrc: isProduction
          ? ["'self'", "data:", "blob:", "https://q.stripe.com", "https://www.educafric.com"]
          : ["'self'", "data:", "blob:", "https://q.stripe.com", "*.educafric.com", "*.replit.app", "*.replit.dev"],
        connectSrc: isProduction
          ? ["'self'", "https://api.stripe.com", "https://m.stripe.network", "https://8x8.vc", "https://meet.educafric.com", "wss://meet.educafric.com"]
          : ["'self'", "*.replit.dev", "*.replit.app", "*.educafric.com", "https://api.stripe.com", "https://m.stripe.network", "https://8x8.vc", "wss://meet.educafric.com", "wss://localhost:*", "ws://localhost:*"],
        fontSrc: ["'self'", "*.googleapis.com", "*.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "blob:"],
        frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com", "https://8x8.vc", "https://meet.jit.si", "https://meet.educafric.com"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    hsts: isProduction ? {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    } : false,
    frameguard: { action: 'deny' },
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
  }));

  // CORS configuration - Environment-aware with credentials
  const allowedOrigins = isProduction ? [
    'https://educafric.com',
    'https://www.educafric.com'
  ] : [
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
      if (!origin) return callback(null, true);
      
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
      
      console.warn(`[SECURITY] CORS blocked origin: ${origin}`);
      return callback(new Error(`CORS: Origin ${origin} not allowed`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-csrf-token'],
    credentials: true,
    optionsSuccessStatus: 200
  }));

  // Production-grade rate limiting
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
      error: 'Too many authentication attempts, please try again later',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
  });

  const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 300,
    message: {
      error: 'Too many requests, please try again later',
      retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
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

  app.use('/api/auth/', authLimiter);
  app.use('/api/', apiLimiter);
  
  console.log('[RATE_LIMITING] ENABLED - Production security configured');
  
  // Request size limits and timeouts
  app.use((req, res, next) => {
    if (req.path.includes('/upload')) {
      req.setTimeout(60000);
    } else {
      req.setTimeout(300000); // 5 minutes
    }
    next();
  });
}

// ====== CSRF with WhatsApp allowlist ======
const csrf = csurf({ cookie: false });

const CSRF_ALLOWLIST: Array<(p: string, m: string) => boolean> = [
  // WhatsApp Click-to-Chat routes
  (p) => p === '/api/wa/mint',
  (p) => p.startsWith('/wa/'),
  
  // Webhook routes (external calls)
  (p, m) => p.startsWith('/webhooks/whatsapp') && (m === 'GET' || m === 'POST'),
  (p, m) => p.startsWith('/api/facebook/webhook') && (m === 'GET' || m === 'POST'),
  
  // Public authentication routes (no session yet)
  (p) => p === '/api/auth/login',
  (p) => p === '/api/auth/register',
  (p) => p === '/api/auth/forgot-password',
  (p) => p === '/api/auth/reset-password',
  (p) => p === '/api/auth/sandbox-login',
  
  // Health check
  (p) => p === '/api/health',
];

export function csrfWithAllowlist(req: any, res: any, next: any) {
  const p = req.path as string;
  const m = req.method as string;
  
  // Debug: log path to see what's being checked
  if (p.includes('sandbox-login')) {
    console.log('[CSRF_DEBUG] Path:', p, 'Method:', m);
    console.log('[CSRF_DEBUG] Checking allowlist...');
  }
  
  const isAllowed = CSRF_ALLOWLIST.some((fn) => {
    const result = fn(p, m);
    if (p.includes('sandbox-login') && result) {
      console.log('[CSRF_DEBUG] ✅ Path allowed by allowlist');
    }
    return result;
  });
  
  if (isAllowed) {
    if (p.includes('sandbox-login')) {
      console.log('[CSRF_DEBUG] ✅ Bypassing CSRF for:', p);
    }
    return next();
  }
  
  if (p.includes('sandbox-login')) {
    console.log('[CSRF_DEBUG] ❌ Path NOT in allowlist, applying CSRF');
  }
  
  return csrf(req, res, next);
}

export function attachCsrfTokenRoute(app: Express) {
  app.get('/api/csrf-token', (req: any, res) => {
    const token = typeof req.csrfToken === 'function' ? req.csrfToken() : null;
    res.json({ csrfToken: token });
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

    if (req.url.includes('/auth/') || res.statusCode >= 400) {
      console.log(`[SECURITY] ${JSON.stringify(logData)}`);
    }
  });
  
  next();
}

// Production session configuration
export const productionSessionConfig: SessionOptions = {
  secret: process.env.SESSION_SECRET || 'educafric-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  name: 'educafric.sid',
  proxy: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'lax' | 'strict' | 'none',
    path: '/',
  }
};

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
          ? ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com", "https://8x8.vc", "https://meet.jit.si", "https://www.googletagmanager.com", "https://replit.com"]
          : ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com", "https://8x8.vc", "https://meet.jit.si", "https://www.googletagmanager.com", "https://replit.com", "*.replit.dev", "*.replit.app", "*.educafric.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "*.googleapis.com", "*.gstatic.com"],
        imgSrc: isProduction
          ? ["'self'", "data:", "blob:", "https://q.stripe.com", "https://www.educafric.com", "https://www.google-analytics.com", "https://stats.g.doubleclick.net", "https://images.unsplash.com", "https://storage.googleapis.com", "https://*.googleapis.com"]
          : ["'self'", "data:", "blob:", "https://q.stripe.com", "*.educafric.com", "*.replit.app", "*.replit.dev", "https://www.google-analytics.com", "https://stats.g.doubleclick.net", "https://images.unsplash.com", "https://storage.googleapis.com", "https://*.googleapis.com"],
        connectSrc: isProduction
          ? ["'self'", "https://api.stripe.com", "https://m.stripe.network", "https://8x8.vc", "https://meet.educafric.com", "wss://meet.educafric.com", "https://www.google-analytics.com", "https://stats.g.doubleclick.net", "wss://*.educafric.com", "https://storage.googleapis.com", "https://*.googleapis.com"]
          : ["'self'", "*.replit.dev", "*.replit.app", "*.educafric.com", "https://api.stripe.com", "https://m.stripe.network", "https://8x8.vc", "wss://meet.educafric.com", "wss://localhost:*", "ws://localhost:*", "wss://*.replit.dev", "wss://*.replit.app", "wss://*.educafric.com", "https://www.google-analytics.com", "https://stats.g.doubleclick.net", "https://storage.googleapis.com", "https://*.googleapis.com"],
        fontSrc: ["'self'", "data:", "*.googleapis.com", "*.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "blob:", "https://8x8.vc", "https://meet.jit.si"],
        frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com", "https://8x8.vc", "https://meet.jit.si", "https://meet.educafric.com"],
        workerSrc: ["'self'", "blob:"]
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
    /^https:\/\/.*\.repl\.co$/,
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
  (p, m) => p.startsWith('/api/whatsapp/webhook') && (m === 'GET' || m === 'POST'),
  
  // Orange Money payment routes (USSD flow - specific endpoints only)
  (p) => p === '/api/online-class-payments/create-orange-payment',
  (p) => p === '/api/online-class-payments/orange-callback',
  (p) => p === '/api/teacher-payments/orange-money/initiate',
  (p) => p === '/api/teacher-payments/orange-money/callback',
  
  // Public authentication routes (no session yet)
  (p) => p === '/api/auth/login',
  (p) => p === '/api/auth/register',
  (p) => p === '/api/auth/forgot-password',
  (p) => p === '/api/auth/reset-password',
  (p) => p === '/api/auth/sandbox-login',
  (p) => p === '/api/auth/check-duplicate',
  
  // Multi-role detection (pre-auth check)
  (p) => p === '/api/multirole/detect-roles',
  
  // PWA Notification routes (fetch API without CSRF token)
  (p) => p.startsWith('/api/notifications/'),
  (p) => p.startsWith('/pwa/notifications/'),
  
  // Test notifications API (for testing automatic notifications)
  (p) => p.startsWith('/api/test-notifications/'),
  
  // SiteAdmin routes (already protected by requireSiteAdminAccess role check)
  (p) => p.startsWith('/api/site-admin/'),
  (p) => p.startsWith('/api/siteadmin/'),
  
  // Bulk import routes (FormData uploads can't easily include CSRF token in headers)
  (p) => p.startsWith('/api/bulk-import/'),
  
  // File upload routes (FormData/Uppy uploads can't easily include CSRF token)
  (p) => p.startsWith('/api/school/logo/'),
  (p) => p.includes('/upload-url'),
  (p) => p.includes('/upload'),
  
  // Settings routes (already protected by authentication middleware)
  (p) => p.endsWith('/settings'),
  
  // Online Classes routes (already protected by requireAuth and subscription middleware)
  (p) => p.startsWith('/api/online-classes/'),
  (p) => p.startsWith('/api/online-class-activations/'),
  (p) => p.startsWith('/api/online-class-payments/'),
  
  // Health check
  (p) => p === '/api/health',
  
  // Smartwatch webhook (external device callbacks - no auth)
  (p) => p.startsWith('/api/smartwatch/webhook/'),
];

export function csrfWithAllowlist(req: any, res: any, next: any) {
  const p = req.path as string;
  const m = req.method as string;
  
  // Skip CSRF for authenticated users (they already have secure session cookies)
  // This prevents token expiry issues while maintaining security
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }
  
  // Debug log for SiteAdmin routes
  if (p.includes('site-admin') || p.includes('siteadmin')) {
    console.log(`[CSRF_DEBUG] Path: "${p}", Method: "${m}"`);
    console.log(`[CSRF_DEBUG] Checking allowlist...`);
  }
  
  if (CSRF_ALLOWLIST.some((fn) => fn(p, m))) {
    if (p.includes('site-admin') || p.includes('siteadmin')) {
      console.log(`[CSRF_DEBUG] ✅ Path "${p}" is ALLOWED, bypassing CSRF`);
    }
    return next();
  }
  
  if (p.includes('site-admin') || p.includes('siteadmin')) {
    console.log(`[CSRF_DEBUG] ❌ Path "${p}" is NOT in allowlist, enforcing CSRF`);
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

// Environment-aware session configuration
// CRITICAL FIX: Replit uses HTTPS even in development, so we need secure cookies
const isReplit = process.env.REPL_ID !== undefined;
const useSecureCookies = process.env.NODE_ENV === 'production' || isReplit;

export const productionSessionConfig: SessionOptions = {
  secret: process.env.SESSION_SECRET || 'educafric-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  name: 'educafric.sid',
  proxy: true,
  cookie: {
    secure: useSecureCookies, // FIXED: Use secure cookies on Replit (HTTPS)
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'none' as 'lax' | 'strict' | 'none', // CRITICAL: 'none' required for Android Capacitor WebView
    path: '/',
    // Remove domain restriction to allow cookies in Capacitor WebView
    // domain: process.env.NODE_ENV === 'production' ? '.educafric.com' : undefined,
  }
};

console.log('[SESSION_CONFIG] Initialized with:', {
  environment: process.env.NODE_ENV || 'development',
  isReplit,
  secure: useSecureCookies,
  sameSite: 'none', // Required for Android Capacitor WebView
  domain: 'none (removed for Capacitor compatibility)'
});

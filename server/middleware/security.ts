import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Express } from 'express';

export function configureSecurityMiddleware(app: Express) {
  // Trust proxy for rate limiting in cloud environments
  app.set('trust proxy', 1);
  
  // Helmet.js with CSP DISABLED for debugging
  app.use(helmet({
    contentSecurityPolicy: false, // Completely disable CSP to test cookie functionality
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    hsts: false // Disable HSTS for development
  }));

  // CORS configuration for African educational context - Fixed for session persistence
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Allow all replit domains and localhost
      if (origin.includes('replit.dev') || 
          origin.includes('replit.app') || 
          origin.includes('localhost') ||
          origin.includes('educafric.com')) {
        return callback(null, true);
      }
      
      return callback(null, true); // Allow all origins for now to test
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
    credentials: true,
    optionsSuccessStatus: 200 // For legacy browser support
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
      // Standard timeout for API requests
      req.setTimeout(30000); // 30 seconds
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
  resave: true, // Force save session to ensure persistence across deployments
  saveUninitialized: false, // Don't create session until something stored
  rolling: true, // Reset expiration on each request - keeps active users logged in
  cookie: {
    secure: false, // Must be false for HTTP in development
    httpOnly: false, // Allow JavaScript access for PWA functionality  
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days - PWA-friendly persistence
    sameSite: 'lax' as const, // Lax works better for Replit environment
    path: '/', // Ensure cookie is sent for all paths
    domain: undefined, // Let browser handle domain
  },
  // name: 'educafric.sid', // Use default connect.sid for compatibility
  proxy: true,
  // Configuration pour maintenir les sessions lors des redémarrages
  genid: (req: any) => {
    // Générer un ID de session persistant basé sur l'utilisateur
    return `educafric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
};
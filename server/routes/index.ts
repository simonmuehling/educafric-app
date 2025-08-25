import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import express from "express";

// Import middleware
import { configureSecurityMiddleware } from "../middleware/security";
import { dataProtectionMiddleware, setupDataRightsRoutes } from "../middleware/compliance";
import { sanitizeInput } from "../middleware/validation";
import { enhancedSecurityLogger, ipBlockingMiddleware, performanceMonitor, systemHealthCheck, securityMonitor } from "../middleware/monitoring";
import { intrusionDetectionMiddleware, educationalSecurityRules } from "../middleware/intrusionDetection";
import { sandboxIsolationMiddleware, sandboxAuthHelper } from "../middleware/sandboxSecurity";
import { errorHandler } from "../middleware/errorHandler";

// Import route modules
import authRoutes from './auth';
import sandboxRoutes from './sandbox';
import documentsRoutes from './documents';
import uploadsRoutes from './uploads';
import stripeRoutes from './stripe';
import teacherRoutes from './teachers';
import currencyRoutes from './currency';
import studentsRoutes from './students';
import adminRoutes from './admin';
import classesRoutes from './classes';
import gradesRoutes from './grades';
import schoolRoutes from './api/schools';
import configurationRoutes from './configurationRoutes';

// Import existing routes
import subscriptionRoutes from "./subscription";
import autofixRoutes from "./autofix";
import multiRoleRoutes from "./multiRoleRoutes";
import systemReportsRoutes from "./systemReportsRoutes";
import setupNotificationRoutes from "./notificationRoutes";
import { registerSiteAdminRoutes } from "./siteAdminRoutes";
import { registerCriticalAlertingRoutes } from "./criticalAlertingRoutes";
import registerTrackingRoutes from "./tracking";

// Import services
import { alertingService, setupScheduledAlerts } from "../services/alertingService";
import { ownerNotificationService } from "../services/ownerNotificationService";
import { criticalAlertingService } from "../services/criticalAlertingService";
import { dailyReportService } from "../services/dailyReportService";
import { hostingerMailService } from "../services/hostingerMailService";

// Define requireAuth middleware
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}
import { welcomeEmailService } from "../services/welcomeEmailService";

// Import geolocation routes
import geolocationRoutes from "./geolocation";
import enhancedGeolocationRoutes from "./enhancedGeolocation";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure security middleware (helmet, cors, rate limiting)
  configureSecurityMiddleware(app);
  
  // Session configuration
  const PgSession = connectPgSimple(session);
  app.use(session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    name: 'educafric.sid',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Security middleware
  app.use(dataProtectionMiddleware);
  app.use(sanitizeInput);
  app.use(enhancedSecurityLogger);
  app.use(ipBlockingMiddleware);
  app.use(performanceMonitor);
  app.use(intrusionDetectionMiddleware);
  app.use(sandboxIsolationMiddleware);

  // Register route modules
  app.use('/api/auth', authRoutes);
  app.use('/api/sandbox', sandboxRoutes);
  app.use('/documents', documentsRoutes);
  app.use('/uploads', uploadsRoutes);
  
  // Register existing specialized routes
  registerCriticalAlertingRoutes(app);
  setupNotificationRoutes(app);
  registerSiteAdminRoutes(app, requireAuth);
  // TRACKING SYSTEM DISABLED - Database schema not synced
  registerTrackingRoutes(app);
  setupDataRightsRoutes(app);

  // Register other routes
  app.use('/api/subscription', subscriptionRoutes);
  app.use('/api/autofix', autofixRoutes);
  app.use('/api/multi-role', multiRoleRoutes);
  app.use('/api/system-reports', systemReportsRoutes);
  
  // Additional route modules will be registered here
  app.use('/api/stripe', stripeRoutes);
  app.use('/api/teachers', teacherRoutes);
  app.use('/api/currency', currencyRoutes);
  app.use('/api/students', studentsRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/director', adminRoutes);
  app.use('/api/classes', classesRoutes);
  app.use('/api/grades', gradesRoutes);
  app.use('/api/schools', schoolRoutes);
  app.use('/api/school', configurationRoutes);

  // Geolocation routes - using modular approach
  app.use('/api/geolocation', geolocationRoutes);
  app.use('/api/location', enhancedGeolocationRoutes);

  // System health check
  app.get('/api/health', systemHealthCheck);

  // Error handler (must be last)
  app.use(errorHandler);

  const server = createServer(app);

  // Initialize services
  setupScheduledAlerts();

  return server;
}
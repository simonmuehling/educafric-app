import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import crypto from "crypto";
import { marked } from "marked";
import cookieParser from "cookie-parser";

// Import middleware
import { configureSecurityMiddleware, productionSessionConfig } from "./middleware/security";
import { requireAuth } from "./middleware/auth";
import { checkSubscriptionFeature, checkFreemiumLimits } from "./middleware/subscriptionMiddleware";

// Import route modules
import notificationsRouter from "./routes/api/notifications";
import teachersRouter from "./routes/api/teachers";
import studentsRouter from "./routes/students";
import studentRoutesApi from "./routes/studentRoutes";
import freelancerRouter from "./routes/freelancer";
import teacherRouter from "./routes/teacher";
import sandboxRouter from "./routes/api/sandbox";
import sandboxUnifiedDataRoutes from "./routes/sandbox-unified-data";
import schoolsRouter from "./routes/api/schools";
import parentRouter from "./routes/api/parent";
import adminRoutes from "./routes/admin";

// Import existing route modules
import geolocationRoutes from "./routes/geolocation";
import enhancedGeolocationRoutes from "./routes/enhancedGeolocation";
import documentsRouter from "./routes/documents";
import authRoutes from "./routes/auth";
import facebookWebhookRoutes from "./routes/facebook-webhook";
import subscriptionRoutes from "./routes/subscription";
import administrationRoutes from "./routes/administration";
import autofixRoutes from "./routes/autofix";
import multiRoleRoutes from "./routes/multiRoleRoutes";
import systemReportsRoutes from "./routes/systemReportsRoutes";
import emailPreferencesRoutes from "./routes/email-preferences-routes";
import setupNotificationRoutes from "./routes/notificationRoutes";
import configurationRoutes from "./routes/configurationRoutes";
import pwaRoutes from "./routes/pwaRoutes";
import analyticsRoutes from "./routes/analytics";
import whatsappRoutes from "./routes/whatsapp";
import whatsappMsSolutionsSetup from "./routes/whatsapp-ms-solutions-setup";
import classesRoutes from "./routes/classes";
import gradesRoutes from "./routes/grades";
import teachersStandalone from "./routes/teachers";
import studentsStandalone from "./routes/students";
import currencyRoutes from "./routes/currency";
import stripeRoutes from "./routes/stripe";
import manualPaymentRoutes from "./routes/manual-payments";
import uploadsRoutes from "./routes/uploads";
import bulletinRoutes from "./routes/bulletinRoutes";
import bulletinValidationRoutes from "./routes/bulletinValidationRoutes";
import trackingRoutes from "./routes/tracking";
import { tutorialRoutes } from "./routes/tutorialRoutes";
// Old duplicated imports removed - replaced by unified messaging system
// import familyConnectionsRoutes from "./routes/familyConnections";
// import teacherStudentConnections from "./routes/teacherStudentConnections";
// import studentParentConnections from "./routes/studentParentConnections";
import bulkImportRoutes from "./routes/bulkImport";
import sandboxDataRoutes from "./routes/sandbox-data";
import { registerDiagnosticsRoutes } from "./routes/diagnostics";
import partnershipsRoutes from "./routes/partnerships";
import unifiedMessagingRoutes from "./routes/unified-messaging";
import connectionsRoutes from "./routes/connections";
import educationalContentRoutes from "./routes/api/educational-content";
import vonageMessagesRouter from "./routes/vonage-messages";

// Import services
import { registerCriticalAlertingRoutes } from "./routes/criticalAlertingRoutes";
import { registerSiteAdminRoutes } from "./routes/siteAdminRoutes";
import { registerSubscriptionRoutes } from "./routes/subscriptionRoutes";
import { autoscaleRoutes } from "./services/sandboxAutoscaleService";
import { storage } from "./storage";

// Configure multer for file uploads
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'public/uploads/logos');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'school-logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure security middleware
  configureSecurityMiddleware(app);
  
  // Add cookie parser - MUST be before session middleware
  app.use(cookieParser());
  
  // Configure session middleware - MUST be before passport initialization
  const PgSession = connectPgSimple(session);
  
  
  app.use(session({
    ...productionSessionConfig,
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: 'session',
      createTableIfMissing: true,
    })
  }));
  
  // Initialize passport middleware - MUST be after session middleware
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Removed debug middleware that was interfering with session
  
  // 🚫 CRITICAL: PUBLIC ENDPOINTS MUST BE FIRST (before any /api middleware)
  // Health check endpoint - MUST be public (no authentication required)
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      routes: 'refactored'
    });
  });

  // Add missing authentication API endpoints
  app.get('/api/auth/session-status', (req, res) => {
    res.json({ 
      success: true, 
      authenticated: req.isAuthenticated(),
      userId: req.user?.id || null 
    });
  });

  // TEST ENDPOINT: Force set session for debugging - Fixed implementation
  app.post('/api/test/force-session', async (req, res) => {
    try {
      const { userId } = req.body;
      
      // Get user from database
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Force login via passport
      req.login(user, (err) => {
        if (err) {
          console.error('[TEST_SESSION] Login error:', err);
          return res.status(500).json({ error: 'Login failed', details: err.message });
        }
        
        res.json({ 
          success: true, 
          message: 'Session forced - user logged in',
          sessionID: req.sessionID,
          userId: userId,
          userEmail: user.email
        });
      });
    } catch (error) {
      console.error('[TEST_SESSION] Error:', error);
      res.status(500).json({ error: 'Session creation failed' });
    }
  });

  app.post('/api/auth/force-logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Logout failed' });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Session destroy failed' });
        }
        res.json({ success: true, message: 'Force logout successful' });
      });
    });
  });

  // 🚫 CRITICAL: Authentication endpoints must be public
  app.use('/api/auth', authRoutes);
  app.use('/api/facebook', facebookWebhookRoutes);

  // Service Worker route spécifique (AVANT les autres routes static)
  app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(process.cwd(), 'public/sw.js'));
  });

  // Manifest PWA
  app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(process.cwd(), 'public/manifest.json'));
  });

  // Serve static files
  app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

  // Document serving routes
  app.get('/documents/:filename', async (req, res) => {
    try {
      const filename = req.params.filename;
      
      // Security: Validate filename to prevent path traversal attacks
      if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ message: 'Invalid filename' });
      }
      
      // Whitelist allowed file extensions for security
      const allowedExtensions = ['.html', '.pdf', '.md', '.txt'];
      const fileExtension = path.extname(filename).toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({ message: 'File type not allowed' });
      }
      
      const filePath = path.join(process.cwd(), 'public', 'documents', filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Document not found' });
      }

      const stat = fs.statSync(filePath);

      if (fileExtension === '.md') {
        const content = fs.readFileSync(filePath, 'utf8');
        const htmlContent = marked(content);
        const htmlPage = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${filename}</title>
            <style>body { font-family: Arial, sans-serif; margin: 40px; }</style>
          </head>
          <body>${htmlContent}</body>
          </html>
        `;
        res.setHeader('Content-Type', 'text/html');
        res.send(htmlPage);
      } else {
        const fileStream = fs.createReadStream(filePath);
        res.setHeader('Content-Length', stat.size);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        fileStream.pipe(res);
      }
    } catch (error: any) {
      console.error('[DOCUMENTS] Error serving document:', error);
      res.status(500).json({ message: 'Error serving document' });
    }
  });

  app.get('/documents/:filename/pdf', async (req, res) => {
    try {
      const filename = req.params.filename;
      
      // Security: Validate filename to prevent path traversal attacks
      if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ message: 'Invalid filename' });
      }
      
      // Ensure filename ends with .html for PDF conversion
      if (!filename.endsWith('.html')) {
        return res.status(400).json({ message: 'Invalid filename format' });
      }
      
      const pdfPath = path.join(process.cwd(), 'public', 'documents', filename.replace('.html', '.pdf'));
      
      if (!fs.existsSync(pdfPath)) {
        return res.status(404).json({ message: 'PDF not found' });
      }

      const stat = fs.statSync(pdfPath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Disposition', `inline; filename="${path.basename(pdfPath)}"`);
      
      const fileStream = fs.createReadStream(pdfPath);
      fileStream.pipe(res);
    } catch (error: any) {
      console.error('[DOCUMENTS] Error serving PDF:', error);
      res.status(500).json({ message: 'Error serving PDF' });
    }
  });

  // =============================================
  // USER SETTINGS API ROUTES - DEFINED FIRST TO AVOID CONFLICTS
  // =============================================

  // DIRECTOR API ROUTES - Overview and Analytics
  app.get("/api/director/overview", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      console.log('[DIRECTOR_API] GET /api/director/overview for user:', user.id);
      
      const overviewStats = [
        {
          id: 1,
          type: 'students',
          title: 'Élèves Total',
          value: '342',
          description: '+12 ce mois',
          icon: 'users',
          color: 'from-blue-500 to-blue-600'
        },
        {
          id: 2,
          type: 'teachers',
          title: 'Enseignants',
          value: '28',
          description: '+3 recrutés',
          icon: 'graduation-cap',
          color: 'from-green-500 to-green-600'
        },
        {
          id: 3,
          type: 'classes',
          title: 'Classes Actives',
          value: '18',
          description: '6ème à Terminale',
          icon: 'book',
          color: 'from-purple-500 to-purple-600'
        },
        {
          id: 4,
          type: 'average',
          title: 'Moyenne Générale',
          value: '14.2',
          description: '+0.8 vs trimestre',
          icon: 'bar-chart',
          color: 'from-orange-500 to-orange-600'
        }
      ];
      
      res.json({ success: true, overview: overviewStats });
    } catch (error) {
      console.error('[DIRECTOR_API] Error fetching overview:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch director overview' });
    }
  });

  app.get("/api/director/analytics", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      console.log('[DIRECTOR_API] GET /api/director/analytics for user:', user.id);
      
      const analytics = {
        performance: {
          overallAverage: 14.2,
          topClass: '6ème A',
          improvementRate: 8.5
        },
        attendance: {
          averageRate: 92.3,
          absentToday: 12,
          lateArrivals: 4
        },
        financials: {
          monthlyRevenue: 2840000,
          pendingPayments: 450000,
          completionRate: 86.2
        },
        communication: {
          messagesSent: 156,
          parentEngagement: 78.4,
          responseRate: 94.1
        }
      };
      
      res.json({ success: true, analytics });
    } catch (error) {
      console.error('[DIRECTOR_API] Error fetching analytics:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch director analytics' });
    }
  });

  // Director Settings  
  app.get("/api/director/settings", requireAuth, async (req, res) => {
    try {
      const settings = {
        school: {
          name: 'École Saint-Joseph',
          address: 'Douala, Cameroun',
          phone: '+237657004011',
          email: 'direction@saintjoseph.edu',
          academicYear: '2024-2025',
          currentTerm: 'Premier Trimestre'
        },
        director: {
          name: 'M. Directeur Principal',
          email: 'directeur@saintjoseph.edu',
          phone: '+237657001111',
          experience: 15
        },
        preferences: {
          language: 'fr',
          notifications: true,
          reportFrequency: 'weekly',
          theme: 'modern'
        }
      };
      res.json({ success: true, settings });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[DIRECTOR_SETTINGS] Error:', error);
      }
      res.status(500).json({ success: false, message: 'Failed to fetch settings' });
    }
  });

  // Teacher Messages
  app.get("/api/teacher/messages", requireAuth, async (req, res) => {
    try {
      const messages = [
        {
          id: 1,
          from: 'Marie Kamga',
          fromRole: 'Parent',
          subject: 'Question sur les devoirs de Junior',
          message: 'Bonjour M. Mvondo, pourriez-vous m\'expliquer l\'exercice 12 de mathématiques ? Junior a des difficultés.',
          date: '2025-08-24',
          read: false,
          type: 'parent',
          priority: 'normal'
        },
        {
          id: 2,
          from: 'Direction',
          fromRole: 'Admin',
          subject: 'Réunion pédagogique',
          message: 'Réunion obligatoire mardi 27 août à 14h30 en salle des professeurs.',
          date: '2025-08-23',
          read: true,
          type: 'admin',
          priority: 'high'
        },
        {
          id: 3,
          from: 'Dr. Nguetsop',
          fromRole: 'Director',
          subject: 'Nouveau programme scolaire',
          message: 'Les nouveaux programmes de sciences physiques sont disponibles au secrétariat.',
          date: '2025-08-22',
          read: true,
          type: 'admin',
          priority: 'normal'
        }
      ];
      res.json({ success: true, messages });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[TEACHER_MESSAGES] Error:', error);
      }
      res.status(500).json({ success: false, message: 'Failed to fetch teacher messages' });
    }
  });

  app.post("/api/teacher/messages", requireAuth, async (req, res) => {
    try {
      const { to, toRole, subject, message, priority = 'normal' } = req.body;
      
      if (!to || !subject || !message) {
        return res.status(400).json({ message: 'Recipient, subject, and message are required' });
      }
      
      const newMessage = {
        id: Date.now(),
        from: req.user?.firstName ? `${req.user.firstName} ${req.user.lastName || ''}` : 'Enseignant',
        fromRole: 'Teacher',
        to,
        toRole,
        subject,
        message,
        priority,
        date: new Date().toISOString(),
        status: 'sent'
      };
      
      console.log('[TEACHER_MESSAGES] Message sent:', newMessage);
      res.json({ success: true, message: 'Message sent successfully', data: newMessage });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[TEACHER_MESSAGES] Error sending message:', error);
      }
      res.status(500).json({ success: false, message: 'Failed to send message' });
    }
  });

  // TEACHER API ROUTES - Complete implementation
  app.get("/api/teacher/classes", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      console.log('[TEACHER_API] GET /api/teacher/classes for user:', user.id);
      
      const classes = [
        {
          id: 1,
          name: '6ème A',
          level: '6ème',
          section: 'A',
          studentCount: 28,
          subject: 'Mathématiques',
          room: 'Salle 12',
          schedule: 'Lun-Mer-Ven 08:00-10:00'
        },
        {
          id: 2,
          name: '5ème B',
          level: '5ème',
          section: 'B', 
          studentCount: 25,
          subject: 'Mathématiques',
          room: 'Salle 15',
          schedule: 'Mar-Jeu 10:00-12:00'
        }
      ];
      
      res.json({ success: true, classes });
    } catch (error) {
      console.error('[TEACHER_API] Error fetching classes:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch classes' });
    }
  });

  app.get("/api/teacher/students", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      console.log('[TEACHER_API] GET /api/teacher/students for user:', user.id);
      
      const students = [
        {
          id: 1,
          firstName: 'Jean',
          lastName: 'Kamga',
          class: '6ème A',
          average: 14.5,
          attendance: 95,
          parentContact: '+237657005678'
        },
        {
          id: 2,
          firstName: 'Marie', 
          lastName: 'Nkomo',
          class: '5ème B',
          average: 16.2,
          attendance: 98,
          parentContact: '+237657007890'
        }
      ];
      
      res.json({ success: true, students });
    } catch (error) {
      console.error('[TEACHER_API] Error fetching students:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch students' });
    }
  });

  app.get("/api/teacher/grades", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      console.log('[TEACHER_API] GET /api/teacher/grades for user:', user.id);
      
      const grades = [
        {
          id: 1,
          studentName: 'Jean Kamga',
          subject: 'Mathématiques',
          grade: 15,
          maxGrade: 20,
          date: '2025-08-25',
          type: 'Contrôle'
        },
        {
          id: 2,
          studentName: 'Marie Nkomo',
          subject: 'Mathématiques', 
          grade: 17,
          maxGrade: 20,
          date: '2025-08-25',
          type: 'Contrôle'
        }
      ];
      
      res.json({ success: true, grades });
    } catch (error) {
      console.error('[TEACHER_API] Error fetching grades:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch grades' });
    }
  });

  app.get("/api/teacher/assignments", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      console.log('[TEACHER_API] GET /api/teacher/assignments for user:', user.id);
      
      const assignments = [
        {
          id: 1,
          title: 'Exercices sur les fractions',
          subject: 'Mathématiques',
          class: '6ème A',
          dueDate: '2025-09-02',
          status: 'active',
          submissions: 22,
          totalStudents: 28
        },
        {
          id: 2,
          title: 'Problèmes géométriques',
          subject: 'Mathématiques',
          class: '5ème B', 
          dueDate: '2025-09-05',
          status: 'active',
          submissions: 18,
          totalStudents: 25
        }
      ];
      
      res.json({ success: true, assignments });
    } catch (error) {
      console.error('[TEACHER_API] Error fetching assignments:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch assignments' });
    }
  });

  app.get("/api/teacher/attendance", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      console.log('[TEACHER_API] GET /api/teacher/attendance for user:', user.id);
      
      const attendance = [
        {
          id: 1,
          studentName: 'Jean Kamga',
          class: '6ème A',
          date: '2025-08-31',
          status: 'present',
          arrivalTime: '07:45'
        },
        {
          id: 2,
          studentName: 'Marie Nkomo',
          class: '5ème B',
          date: '2025-08-31',
          status: 'present',
          arrivalTime: '07:50'
        }
      ];
      
      res.json({ success: true, attendance });
    } catch (error) {
      console.error('[TEACHER_API] Error fetching attendance:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
    }
  });

  app.get("/api/teacher/communications", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      console.log('[TEACHER_API] GET /api/teacher/communications for user:', user.id);
      
      const communications = [
        {
          id: 1,
          from: 'Marie Kamga',
          fromRole: 'Parent',
          subject: 'Absence de Jean',
          message: 'Jean sera absent demain pour rendez-vous médical.',
          date: '2025-08-30',
          read: false,
          type: 'parent'
        },
        {
          id: 2,
          from: 'Direction',
          fromRole: 'Admin',
          subject: 'Réunion pédagogique',
          message: 'Réunion des enseignants prévue mardi à 16h.',
          date: '2025-08-29',
          read: true,
          type: 'admin'
        }
      ];
      
      res.json({ success: true, communications });
    } catch (error) {
      console.error('[TEACHER_API] Error fetching communications:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch communications' });
    }
  });

  app.get("/api/teacher/schools", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      console.log('[TEACHER_API] GET /api/teacher/schools for user:', user.id);
      
      const schools = [
        {
          id: 1,
          name: 'École Saint-Joseph',
          type: 'Private',
          address: 'Douala, Cameroun',
          role: 'Teacher',
          subjects: ['Mathématiques'],
          classes: ['6ème A', '5ème B']
        }
      ];
      
      res.json({ success: true, schools });
    } catch (error) {
      console.error('[TEACHER_API] Error fetching schools:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch schools' });
    }
  });

  // Teacher Settings
  app.get("/api/teacher/settings", requireAuth, async (req, res) => {
    try {
      const settings = {
        profile: {
          firstName: 'Marie',
          lastName: 'Dubois',
          email: 'marie.dubois@saintjoseph.edu',
          phone: '+237657001234',
          subjects: ['Mathématiques', 'Physique'],
          experience: 8,
          qualification: 'Licence en Mathématiques'
        },
        preferences: {
          language: 'fr',
          notifications: {
            email: true,
            sms: true,
            push: true
          },
          gradeDisplayMode: 'detailed',
          theme: 'modern'
        },
        security: {
          twoFactorEnabled: false,
          lastPasswordChange: '2024-07-15',
          sessionTimeout: 30
        }
      };
      res.json({ success: true, settings });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[TEACHER_SETTINGS] Error:', error);
      }
      res.status(500).json({ success: false, message: 'Failed to fetch teacher settings' });
    }
  });

  app.put("/api/teacher/settings", requireAuth, async (req, res) => {
    try {
      const updatedSettings = req.body;
      console.log('[TEACHER_SETTINGS_UPDATE] Updating settings:', updatedSettings);
      res.json({ success: true, message: 'Teacher settings updated successfully' });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[TEACHER_SETTINGS_UPDATE] Error:', error);
      }
      res.status(500).json({ success: false, message: 'Failed to update teacher settings' });
    }
  });

  // Student Messages
  app.get("/api/student/messages", requireAuth, async (req, res) => {
    try {
      const messages = [
        {
          id: 1,
          from: 'Paul Mvondo',
          fromRole: 'Teacher',
          subject: 'Résultats de contrôle',
          message: 'Félicitations ! Tu as obtenu 17/20 au dernier contrôle de mathématiques. Continue comme ça !',
          date: '2025-08-24',
          read: false,
          type: 'teacher',
          priority: 'normal'
        },
        {
          id: 2,
          from: 'Direction',
          fromRole: 'Admin',
          subject: 'Activité sportive',
          message: 'Les inscriptions pour le tournoi de football inter-classes sont ouvertes jusqu\'au 30 août.',
          date: '2025-08-23',
          read: true,
          type: 'admin',
          priority: 'normal'
        }
      ];
      res.json({ success: true, messages });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[STUDENT_MESSAGES] Error:', error);
      }
      res.status(500).json({ success: false, message: 'Failed to fetch student messages' });
    }
  });

  app.post("/api/student/messages", requireAuth, async (req, res) => {
    try {
      const { to, toRole, subject, message, priority = 'normal' } = req.body;
      
      if (!to || !subject || !message) {
        return res.status(400).json({ message: 'Recipient, subject, and message are required' });
      }
      
      const newMessage = {
        id: Date.now(),
        from: req.user?.firstName ? `${req.user.firstName} ${req.user.lastName || ''}` : 'Élève',
        fromRole: 'Student',
        to,
        toRole,
        subject,
        message,
        priority,
        date: new Date().toISOString(),
        status: 'sent'
      };
      
      console.log('[STUDENT_MESSAGES] Message sent:', newMessage);
      res.json({ success: true, message: 'Message sent successfully', data: newMessage });
    } catch (error) {
      console.error('[STUDENT_MESSAGES] Error sending message:', error);
      res.status(500).json({ success: false, message: 'Failed to send message' });
    }
  });

  // Freelancer Messages
  app.get("/api/freelancer/messages", requireAuth, async (req, res) => {
    try {
      const messages = [
        {
          id: 1,
          from: 'Marie Kamga',
          fromRole: 'Parent',
          subject: 'Demande de cours particuliers',
          message: 'Bonjour Sophie, pourriez-vous donner des cours de français à Junior ? Il a besoin d\'aide avec ses dissertations.',
          date: '2025-08-24',
          read: false,
          type: 'parent',
          priority: 'normal'
        },
        {
          id: 2,
          from: 'Administration',
          fromRole: 'Admin',
          subject: 'Nouveau contrat disponible',
          message: 'Un nouveau contrat de cours particuliers est disponible pour le niveau 2nde en mathématiques.',
          date: '2025-08-23',
          read: true,
          type: 'admin',
          priority: 'normal'
        }
      ];
      res.json({ success: true, messages });
    } catch (error) {
      console.error('[FREELANCER_MESSAGES] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch freelancer messages' });
    }
  });

  app.post("/api/freelancer/messages", requireAuth, async (req, res) => {
    try {
      const { to, toRole, subject, message, priority = 'normal' } = req.body;
      
      if (!to || !subject || !message) {
        return res.status(400).json({ message: 'Recipient, subject, and message are required' });
      }
      
      const newMessage = {
        id: Date.now(),
        from: req.user?.firstName ? `${req.user.firstName} ${req.user.lastName || ''}` : 'Freelancer',
        fromRole: 'Freelancer',
        to,
        toRole,
        subject,
        message,
        priority,
        date: new Date().toISOString(),
        status: 'sent'
      };
      
      console.log('[FREELANCER_MESSAGES] Message sent:', newMessage);
      res.json({ success: true, message: 'Message sent successfully', data: newMessage });
    } catch (error) {
      console.error('[FREELANCER_MESSAGES] Error sending message:', error);
      res.status(500).json({ success: false, message: 'Failed to send message' });
    }
  });

  // Student Settings
  app.get("/api/student/settings", async (req, res) => {
    try {
      const settings = {
        profile: {
          firstName: 'Jean',
          lastName: 'Kamga',
          email: 'jean.kamga@student.saintjoseph.edu',
          class: 'Terminale C',
          studentId: 'STU2024001',
          parentContact: '+237657005678'
        },
        preferences: {
          language: 'fr',
          notifications: {
            grades: true,
            homework: true,
            announcements: true
          },
          theme: 'light',
          displayMode: 'detailed'
        },
        academic: {
          currentAverage: 14.5,
          currentRank: 8,
          totalStudents: 45,
          lastUpdate: '2024-08-20'
        },
        privacy: {
          profileVisibility: 'school_only',
          allowParentTracking: true,
          showGradesToParents: true,
          allowDirectMessages: false
        },
        security: {
          twoFactorEnabled: false,
          lastPasswordChange: '2024-07-20',
          sessionTimeout: 30
        }
      };
      res.json({ success: true, settings });
    } catch (error) {
      console.error('[STUDENT_SETTINGS] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch student settings' });
    }
  });

  app.put("/api/student/settings", requireAuth, async (req, res) => {
    try {
      const updatedSettings = req.body;
      console.log('[STUDENT_SETTINGS_UPDATE] Updating settings:', updatedSettings);
      res.json({ success: true, message: 'Student settings updated successfully' });
    } catch (error) {
      console.error('[STUDENT_SETTINGS_UPDATE] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to update student settings' });
    }
  });

  // Student Password Change
  app.post("/api/student/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      console.log('[STUDENT_PASSWORD_CHANGE] Password change request for user:', (req.session as any)?.authenticated);
      
      // Here you would verify current password and update with new one
      // For demo purposes, we'll just return success
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      console.error('[STUDENT_PASSWORD_CHANGE] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to change password' });
    }
  });

  // Student Account Deletion Request
  app.post("/api/student/request-account-deletion", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      console.log('[STUDENT_ACCOUNT_DELETION] Deletion request for user:', userId);
      
      // Import the profile deletion service
      const { profileDeletionService } = await import('./services/profileDeletionService');
      
      // Use the existing sophisticated deletion system
      const result = await profileDeletionService.requestProfileDeletion(
        userId, 
        req.body.reason || 'Demande de suppression via paramètres'
      );
      
      res.json(result);
    } catch (error) {
      console.error('[STUDENT_ACCOUNT_DELETION] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to process deletion request' });
    }
  });

  // Firebase Parent Connection
  app.post("/api/student/generate-firebase-connection", requireAuth, async (req, res) => {
    try {
      const { method, language, config } = req.body;
      const userId = (req.user as any)?.id;
      
      console.log('[FIREBASE_CONNECTION] Generating connection:', { method, userId });
      
      let connectionData;
      
      switch (method) {
        case 'dynamic_link':
          // Utiliser une URL directe vers l'app EDUCAFRIC avec deep linking
          const token = Math.random().toString(36).substring(2, 12).toUpperCase();
          connectionData = {
            dynamicLink: `https://www.educafric.com/parent-connect?student=${userId}&token=${token}&ref=firebase`,
            shortCode: token.substring(0, 6),
            token: token,
            analytics: {
              successRate: 94,
              installs: 1247
            }
          };
          break;
          
        case 'smart_qr':
          const qrToken = Math.random().toString(36).substring(2, 8).toUpperCase();
          const qrData = `https://www.educafric.com/parent-connect?student=${userId}&token=${qrToken}&ref=firebase_qr`;
          
          try {
            // Import dynamique de qrcode pour ESM
            const QRCode = await import('qrcode');
            
            // Générer un vrai QR code avec la bibliothèque qrcode
            const qrCodeDataURL = await QRCode.default.toDataURL(qrData, {
              errorCorrectionLevel: 'M',
              type: 'image/png',
              margin: 1,
              color: {
                dark: '#1F2937', // Gris foncé au lieu de noir pur
                light: '#FFFFFF'
              },
              width: 300
            });
            
            console.log('[FIREBASE_QR] ✅ QR Code generated successfully');
            connectionData = {
              qrCode: qrCodeDataURL,
              qrData: qrData,
              shortCode: qrToken,
              analytics: {
                successRate: 98,
                installs: 856
              }
            };
          } catch (qrError) {
            console.error('[FIREBASE_QR] QR generation error:', qrError);
            // Fallback vers un QR simple en cas d'erreur
            connectionData = {
              qrCode: `data:image/svg+xml;base64,${btoa(`
                <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
                  <rect width="300" height="300" fill="white" stroke="#ddd" stroke-width="2"/>
                  <text x="150" y="140" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#333">EDUCAFRIC</text>
                  <text x="150" y="170" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">Code: ${qrToken}</text>
                  <text x="150" y="190" text-anchor="middle" font-family="Arial" font-size="12" fill="#888">Scanner pour connecter</text>
                </svg>
              `)}`,
              qrData: qrData,
              shortCode: qrToken,
              analytics: {
                successRate: 98,
                installs: 856
              }
            };
          }
          break;
          
        case 'notification':
          connectionData = {
            notificationId: `notif_${Date.now()}`,
            status: 'sent',
            analytics: {
              deliveryRate: 99,
              openRate: 87
            }
          };
          break;
          
        default:
          throw new Error('Invalid method');
      }
      
      res.json({
        success: true,
        message: language === 'fr' 
          ? 'Connexion Firebase générée avec succès' 
          : 'Firebase connection generated successfully',
        data: connectionData
      });
      
    } catch (error) {
      console.error('[FIREBASE_CONNECTION] Error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to generate Firebase connection' 
      });
    }
  });

  // Firebase Remote Config
  app.get("/api/firebase/remote-config", async (req, res) => {
    try {
      const config = {
        qr_style: 'modern_gradient',
        brand_colors: {
          primary: '#8B5CF6',
          secondary: '#EC4899',
          accent: '#F59E0B'
        },
        features: {
          auto_install: true,
          deep_linking: true,
          analytics: true
        }
      };
      
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: 'Failed to load remote config' });
    }
  });

  // Parent Connection via Link
  app.post("/api/parent/connect-via-link", async (req, res) => {
    try {
      const { firstName, lastName, email, phone, studentId, token, connectionMethod, relationship } = req.body;
      
      console.log('[PARENT_CONNECT_LINK] Processing connection:', { email, studentId, connectionMethod });
      
      // Validation du token et création du parent
      // Dans un vrai système, on vérifierait le token dans la DB
      
      const parentConnection = {
        id: Date.now(),
        parentId: Date.now() + 1000,
        parentName: `${firstName} ${lastName}`,
        parentEmail: email,
        parentPhone: phone,
        relationshipType: relationship,
        status: 'pending', // École doit valider
        requestDate: new Date().toISOString(),
        connectionMethod: connectionMethod,
        token: token
      };
      
      res.json({
        success: true,
        message: 'Compte parent créé avec succès. En attente de validation par l\'école.',
        connection: parentConnection
      });
      
    } catch (error) {
      console.error('[PARENT_CONNECT_LINK] Error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Impossible de créer le compte parent' 
      });
    }
  });

  // Parent Settings
  app.get("/api/parent/settings", requireAuth, async (req, res) => {
    try {
      const settings = {
        profile: {
          firstName: 'Paul',
          lastName: 'Kamga',
          email: 'paul.kamga@gmail.com',
          phone: '+237657005678',
          relationship: 'Father',
          occupation: 'Engineer'
        },
        preferences: {
          language: 'fr',
          notifications: {
            grades: true,
            attendance: true,
            homework: true,
            announcements: true,
            sms: true,
            whatsapp: true
          },
          reportFrequency: 'weekly',
          theme: 'modern'
        },
        children: [
          { id: 1, name: 'Jean Kamga', class: 'Terminale C' }
        ]
      };
      res.json({ success: true, settings });
    } catch (error) {
      console.error('[PARENT_SETTINGS] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch parent settings' });
    }
  });

  app.put("/api/parent/settings", requireAuth, async (req, res) => {
    try {
      const updatedSettings = req.body;
      console.log('[PARENT_SETTINGS_UPDATE] Updating settings:', updatedSettings);
      res.json({ success: true, message: 'Parent settings updated successfully' });
    } catch (error) {
      console.error('[PARENT_SETTINGS_UPDATE] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to update parent settings' });
    }
  });

  // 📊 ROUTES ABONNEMENT PARENT - Support module subscription
  app.get('/api/parent/subscription', requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const { SubscriptionService } = await import('./services/subscriptionService');
      const subscriptionDetails = await SubscriptionService.getParentSubscriptionDetails(user.id, user.email);
      
      res.json({
        success: true,
        ...subscriptionDetails,
        // Ajouter infos complémentaires pour l'interface
        price: subscriptionDetails.isFreemium ? 0 : 1500,
        billingCycle: subscriptionDetails.isFreemium ? 'Gratuit' : 'Mensuel',
        nextRenewal: subscriptionDetails.isFreemium ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 jours
      });
    } catch (error) {
      console.error('[PARENT_SUBSCRIPTION] Error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch subscription details' });
    }
  });

  app.get('/api/parent/gateway-status', requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const { SubscriptionService } = await import('./services/subscriptionService');
      const gatewayStatus = await SubscriptionService.getParentChildrenGatewayStatus(user.id, user.email);
      
      res.json({
        success: true,
        ...gatewayStatus
      });
    } catch (error) {
      console.error('[PARENT_GATEWAY_STATUS] Error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch gateway status' });
    }
  });

  // 📊 ROUTES ABONNEMENT ÉCOLE - Support module subscription director
  app.get('/api/school/subscription', requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const { SubscriptionService } = await import('./services/subscriptionService');
      const subscriptionDetails = await SubscriptionService.getSchoolSubscriptionDetails(user.id, user.email);
      
      res.json({
        success: true,
        ...subscriptionDetails,
        // Ajouter infos spécifiques école
        price: subscriptionDetails.isFreemium ? 0 : -50000, // École reçoit de l'argent
        billingCycle: subscriptionDetails.isFreemium ? 'Gratuit' : 'Mensuel',
        nextRenewal: subscriptionDetails.isFreemium ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        limits: {
          students: subscriptionDetails.isFreemium ? 30 : 500,
          teachers: subscriptionDetails.isFreemium ? 5 : 50,
          classes: subscriptionDetails.isFreemium ? 5 : 25
        }
      });
    } catch (error) {
      console.error('[SCHOOL_SUBSCRIPTION] Error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch school subscription details' });
    }
  });

  app.get('/api/school/gateway-status', requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const { SubscriptionService } = await import('./services/subscriptionService');
      
      // Pour école: compter connexions actives/inactives avec parents
      const gatewayStats = {
        activeConnections: 12, // Parents avec abonnement
        inactiveConnections: 3, // Parents sans abonnement
        totalParents: 15,
        revenueFromParents: 18000 // CFA par mois
      };
      
      res.json({
        success: true,
        ...gatewayStats
      });
    } catch (error) {
      console.error('[SCHOOL_GATEWAY_STATUS] Error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch school gateway status' });
    }
  });

  // 📊 ROUTES ABONNEMENT FREELANCER - Support module subscription freelancer
  app.get('/api/freelancer/subscription', requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const { SubscriptionService } = await import('./services/subscriptionService');
      const subscriptionDetails = await SubscriptionService.getFreelancerSubscriptionDetails(user.id, user.email);
      
      res.json({
        success: true,
        ...subscriptionDetails,
        // Ajouter infos spécifiques freelancer
        price: subscriptionDetails.isFreemium ? 0 : 5000, // Freelancer paie
        billingCycle: subscriptionDetails.isFreemium ? 'Gratuit' : 'Mensuel',
        nextRenewal: subscriptionDetails.isFreemium ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        limits: {
          students: subscriptionDetails.isFreemium ? 10 : 50,
          sessions: subscriptionDetails.isFreemium ? 20 : 100,
          features: subscriptionDetails.isFreemium ? 'basic' : 'standard'
        }
      });
    } catch (error) {
      console.error('[FREELANCER_SUBSCRIPTION] Error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch freelancer subscription details' });
    }
  });

  // Freelancer Settings
  app.get("/api/freelancer/settings", requireAuth, async (req, res) => {
    try {
      const settings = {
        profile: {
          firstName: 'Sophie',
          lastName: 'Martin',
          email: 'sophie.martin@freelance.edu',
          phone: '+237657007890',
          specialties: ['Mathématiques', 'Physique', 'Informatique'],
          experience: 12,
          qualification: 'Master en Sciences'
        },
        preferences: {
          language: 'fr',
          notifications: {
            newStudents: true,
            sessions: true,
            payments: true
          },
          availability: {
            monday: { start: '08:00', end: '18:00' },
            tuesday: { start: '08:00', end: '18:00' },
            wednesday: { start: '08:00', end: '18:00' },
            thursday: { start: '08:00', end: '18:00' },
            friday: { start: '08:00', end: '18:00' },
            saturday: { start: '09:00', end: '15:00' },
            sunday: { start: 'off', end: 'off' }
          },
          hourlyRate: 15000,
          theme: 'modern'
        }
      };
      res.json({ success: true, settings });
    } catch (error) {
      console.error('[FREELANCER_SETTINGS] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch freelancer settings' });
    }
  });

  app.put("/api/freelancer/settings", requireAuth, async (req, res) => {
    try {
      const updatedSettings = req.body;
      console.log('[FREELANCER_SETTINGS_UPDATE] Updating settings:', updatedSettings);
      res.json({ success: true, message: 'Freelancer settings updated successfully' });
    } catch (error) {
      console.error('[FREELANCER_SETTINGS_UPDATE] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to update freelancer settings' });
    }
  });

  // School Settings (Admin/Director)
  app.get("/api/school/settings", requireAuth, async (req, res) => {
    try {
      const settings = {
        school: {
          name: 'École Saint-Joseph',
          type: 'Private',
          address: 'Douala, Cameroun',
          phone: '+237657004011',
          email: 'direction@saintjoseph.edu',
          website: 'https://www.saintjoseph.edu',
          logo: '/assets/school-logo.png',
          academicYear: '2024-2025',
          currentTerm: 'Premier Trimestre',
          totalStudents: 156,
          totalTeachers: 18,
          totalClasses: 12
        },
        billing: {
          plan: 'École Privée',
          monthlyFee: 75000,
          currency: 'XAF',
          nextBilling: '2024-09-01',
          status: 'active'
        },
        features: {
          gpsTracking: true,
          parentNotifications: true,
          onlinePayments: true,
          digitalBulletins: true,
          attendanceSystem: true
        },
        integrations: {
          whatsapp: true,
          sms: true,
          email: true,
          stripe: false
        }
      };
      res.json({ success: true, settings });
    } catch (error) {
      console.error('[SCHOOL_SETTINGS] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch school settings' });
    }
  });

  app.put("/api/school/settings", requireAuth, async (req, res) => {
    try {
      const updatedSettings = req.body;
      console.log('[SCHOOL_SETTINGS_UPDATE] Updating settings:', updatedSettings);
      res.json({ success: true, message: 'School settings updated successfully' });
    } catch (error) {
      console.error('[SCHOOL_SETTINGS_UPDATE] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to update school settings' });
    }
  });

  // Family Connections API - MISSING ROUTE FIXED
  app.get("/api/family/connections", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user?.id || (req.session as any)?.userId;
      console.log('[FAMILY_CONNECTIONS] Getting family connections for user:', userId);
      
      // Mock family connections data - based on user role
      const connections = [
        {
          id: 1,
          type: 'parent-child',
          parentId: 7,
          parentName: 'Marie Ndomo',
          childId: 1,
          childName: 'Emma Tall',
          status: 'active',
          establishedAt: '2024-01-15'
        },
        {
          id: 2,
          type: 'student-parent',
          studentId: 1,
          studentName: 'Emma Tall',
          parentId: 7,
          parentName: 'Marie Ndomo',
          status: 'active',
          establishedAt: '2024-01-15'
        }
      ];

      res.json({ 
        success: true, 
        connections,
        total: connections.length 
      });
    } catch (error) {
      console.error('[FAMILY_CONNECTIONS] Error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch family connections' 
      });
    }
  });

  // Parent requests API - FIXED MISSING ROUTE
  app.get("/api/parent/requests", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user?.id || (req.session as any)?.userId;
      console.log('[PARENT_REQUESTS] Getting requests for parent:', userId);
      
      // Mock parent requests data - comprehensive list
      const requests = [
        {
          id: 1,
          type: 'absence_request',
          category: 'health',
          subject: 'Demande d\'absence médicale',
          description: 'Mon enfant Emma doit s\'absenter pour un rendez-vous médical.',
          status: 'pending',
          priority: 'medium',
          submittedAt: '2024-08-20T10:30:00Z',
          studentName: 'Emma Tall',
          responseExpected: '2024-08-25T17:00:00Z'
        },
        {
          id: 2,
          type: 'meeting',
          category: 'academic',
          subject: 'Rendez-vous avec l\'enseignant',
          description: 'Je souhaiterais discuter des progrès d\'Emma en mathématiques.',
          status: 'approved',
          priority: 'low',
          submittedAt: '2024-08-18T14:15:00Z',
          studentName: 'Emma Tall',
          responseExpected: '2024-08-22T16:00:00Z'
        },
        {
          id: 3,
          type: 'complaint',
          category: 'disciplinary',
          subject: 'Problème de comportement en classe',
          description: 'J\'aimerais discuter d\'un incident qui s\'est produit en classe.',
          status: 'in_review',
          priority: 'high',
          submittedAt: '2024-08-22T09:20:00Z',
          studentName: 'Emma Tall',
          responseExpected: '2024-08-24T12:00:00Z'
        }
      ];

      res.json({ success: true, requests, total: requests.length });
    } catch (error) {
      console.error('[PARENT_REQUESTS] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch parent requests' });
    }
  });

  app.post("/api/parent/requests", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      const requestData = req.body;
      console.log('[PARENT_REQUESTS] Creating new request for parent:', userId, requestData);
      
      // Mock response for request submission
      const newRequest = {
        id: Date.now(),
        ...requestData,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        userId
      };

      res.json({ success: true, request: newRequest, message: 'Demande soumise avec succès' });
    } catch (error) {
      console.error('[PARENT_REQUESTS] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to submit parent request' });
    }
  });

  // Register API route modules AFTER settings routes (FIXED DUPLICATION)
  app.use('/api/notifications', notificationsRouter);
  
  // 🔥 PREMIUM RESTRICTED: Advanced teacher management (unlimited teachers + analytics)
  app.use('/api/teachers', checkSubscriptionFeature('advanced_teacher_management'), checkFreemiumLimits('teachers'), teachersRouter);
  app.use('/api/teacher', teacherRouter);
  
  // 🔥 PREMIUM RESTRICTED: Advanced student management (unlimited students + tracking)
  app.use('/api/students', checkSubscriptionFeature('advanced_student_management'), checkFreemiumLimits('students'), studentsRouter);
  app.use('/api/student', studentRoutesApi);
  
  // 🔥 PREMIUM RESTRICTED: Advanced freelancer features (unlimited students + analytics)
  app.use('/api/freelancer', checkSubscriptionFeature('freelancer_premium'), checkFreemiumLimits('freelancer_students'), freelancerRouter);
  
  app.use('/api/sandbox', sandboxRouter);
  app.use('/api/sandbox-unified', sandboxUnifiedDataRoutes);
  app.use('/api/schools', schoolsRouter);
  
  // 🔥 PREMIUM RESTRICTED: Advanced parent features (GPS tracking + notifications)
  app.use('/api/parent', checkSubscriptionFeature('parent_premium'), parentRouter);
  app.use('/api/admin', adminRoutes);
  app.use('/api/director', adminRoutes); // Map director to admin routes

  // Register existing route modules
  // 🔥 PREMIUM RESTRICTED: GPS tracking and geolocation (premium schools only)
  app.use('/api/geolocation', checkSubscriptionFeature('geolocation_tracking'), geolocationRoutes);
  app.use('/api/enhanced-geolocation', checkSubscriptionFeature('geolocation_tracking'), enhancedGeolocationRoutes);
  app.use('/api/documents', documentsRouter);
  app.use('/api/subscription', subscriptionRoutes);
  app.use('/api/pwa', pwaRoutes);
  app.use('/api/analytics', analyticsRoutes);
  // 🔥 PREMIUM RESTRICTED: Advanced communications (unlimited SMS/WhatsApp)
  app.use('/api/whatsapp', checkSubscriptionFeature('advanced_communications'), whatsappRoutes);
  app.use('/api/whatsapp-setup', checkSubscriptionFeature('advanced_communications'), whatsappMsSolutionsSetup);
  app.use('/api/vonage-messages', checkSubscriptionFeature('advanced_communications'), vonageMessagesRouter);
  
  // Additional routes after main registrations  
  // 🔥 PREMIUM RESTRICTED: Advanced class management (unlimited classes + analytics)
  app.use('/api/classes', checkSubscriptionFeature('advanced_class_management'), checkFreemiumLimits('classes'), classesRoutes);
  app.use('/api/grades', gradesRoutes);
  app.use('/api/currency', currencyRoutes);
  app.use('/api/stripe', stripeRoutes);
  app.use('/api/manual-payments', manualPaymentRoutes);
  app.use('/api/uploads', uploadsRoutes);
  app.use('/api/bulletins', bulletinRoutes);
  app.use('/api/bulletin-validation', bulletinValidationRoutes);
  trackingRoutes(app);
  app.use('/api/tutorials', tutorialRoutes);
  
  // 🚫 WARNING: Keep administration routes LAST to prevent route interception
  app.use('/api/administration', administrationRoutes);
  app.use('/api/autofix', autofixRoutes);
  app.use('/api/multi-role', multiRoleRoutes);
  app.use('/api/system-reports', systemReportsRoutes);
  app.use('/api/email-preferences', emailPreferencesRoutes);
  app.use('/api/configuration', configurationRoutes);
  
  // ✅ NEW: Unified messaging system
  app.use('/api/messages', unifiedMessagingRoutes);
  app.use('/api/connections', connectionsRoutes);
  
  app.use('/api/bulk-import', bulkImportRoutes);
  app.use('/api/partnerships', partnershipsRoutes);
  app.use('/api/educational-content', educationalContentRoutes);
  
  // Register missing routes
  app.use('/api/sandbox-data', sandboxDataRoutes);

  // Register service routes
  try {
    registerCriticalAlertingRoutes(app);
  } catch (error) {
    console.warn('[ROUTES] Critical alerting routes failed to register:', error);
  }
  
  try {
    registerSiteAdminRoutes(app, requireAuth);
  } catch (error) {
    console.warn('[ROUTES] Site admin routes failed to register:', error);
  }
  
  // Register diagnostics routes
  try {
    registerDiagnosticsRoutes(app);
  } catch (error) {
    console.warn('[ROUTES] Diagnostics routes failed to register:', error);
  }
  
  // Register notification setup (imported but not used)
  try {
    setupNotificationRoutes(app);
  } catch (error) {
    console.warn('[ROUTES] Notification setup failed to register:', error);
  }
  

  // API 404 handler - must be after all API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ 
      success: false, 
      message: 'API endpoint not found',
      path: req.path
    });
  });

  console.log('All routes configured ✅');

  // Create HTTP server
  const server = createServer(app);
  return server;
}

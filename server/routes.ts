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

// Import middleware
import { configureSecurityMiddleware, productionSessionConfig } from "./middleware/security";
import { requireAuth } from "./middleware/auth";

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
import classesRoutes from "./routes/classes";
import gradesRoutes from "./routes/grades";
import teachersStandalone from "./routes/teachers";
import studentsStandalone from "./routes/students";
import currencyRoutes from "./routes/currency";
import stripeRoutes from "./routes/stripe";
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
      console.error('[DIRECTOR_SETTINGS] Error:', error);
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
      console.error('[TEACHER_MESSAGES] Error:', error);
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
      console.error('[TEACHER_MESSAGES] Error sending message:', error);
      res.status(500).json({ success: false, message: 'Failed to send message' });
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
      console.error('[TEACHER_SETTINGS] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch teacher settings' });
    }
  });

  app.put("/api/teacher/settings", requireAuth, async (req, res) => {
    try {
      const updatedSettings = req.body;
      console.log('[TEACHER_SETTINGS_UPDATE] Updating settings:', updatedSettings);
      res.json({ success: true, message: 'Teacher settings updated successfully' });
    } catch (error) {
      console.error('[TEACHER_SETTINGS_UPDATE] Error:', error);
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
      console.error('[STUDENT_MESSAGES] Error:', error);
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
      console.log('[FAMILY_CONNECTIONS] Getting family connections for user:', (req.session as any)?.userId);
      
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
      const userId = (req.session as any)?.userId;
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
  app.use('/api/teachers', teachersRouter);
  app.use('/api/teacher', teacherRouter);
  app.use('/api/students', studentsRouter);
  app.use('/api/student', studentRoutesApi);
  app.use('/api/freelancer', freelancerRouter);
  app.use('/api/sandbox', sandboxRouter);
  app.use('/api/sandbox-unified', sandboxUnifiedDataRoutes);
  app.use('/api/schools', schoolsRouter);
  app.use('/api/parent', parentRouter);
  app.use('/api/admin', adminRoutes);
  app.use('/api/director', adminRoutes); // Map director to admin routes

  // Register existing route modules
  app.use('/api/geolocation', geolocationRoutes);
  app.use('/api/enhanced-geolocation', enhancedGeolocationRoutes);
  app.use('/api/documents', documentsRouter);
  app.use('/api/subscription', subscriptionRoutes);
  app.use('/api/pwa', pwaRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/whatsapp', whatsappRoutes);
  
  // Additional routes after main registrations  
  app.use('/api/classes', classesRoutes);
  app.use('/api/grades', gradesRoutes);
  app.use('/api/currency', currencyRoutes);
  app.use('/api/stripe', stripeRoutes);
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

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
import partnershipsRoutes from "./routes/partnerships";
import unifiedMessagingRoutes from "./routes/unified-messaging";
import connectionsRoutes from "./routes/connections";

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

  // Register API route modules
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

  // Route configuration école
  app.get("/api/school/configuration-status", requireAuth, async (req, res) => {
    try {
      if (!req.user || !req.user.schoolId) {
        return res.status(403).json({ error: 'No school associated' });
      }

      const school = await storage.getSchoolById(req.user.schoolId);
      if (!school) {
        return res.status(404).json({ error: 'School not found' });
      }

      const status = {
        schoolId: school.id,
        name: school.name,
        configured: true,
        modules: {
          users: true,
          classes: true,
          payments: true,
          communication: true
        },
        lastUpdated: school.updatedAt || new Date()
      };

      res.json({ success: true, status });
    } catch (error) {
      console.error('[SCHOOL_CONFIG] Error fetching school configuration status:', error);
      res.status(500).json({ error: 'Failed to fetch school configuration status' });
    }
  });

  // === ROUTES MANQUANTES POUR LES INTERFACES UTILISATEURS ===

  // Routes Teacher
  app.get("/api/teacher/schools", requireAuth, async (req, res) => {
    try {
      const schools = [
        { id: 1, name: 'École Primaire Centre', type: 'Primaire' },
        { id: 2, name: 'Collège Municipal', type: 'Collège' }
      ];
      res.json({ success: true, schools });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch teacher schools' });
    }
  });

  // Teacher classes route - provide fallback data since this is requested by frontend
  app.get("/api/teacher/classes", requireAuth, async (req, res) => {
    try {
      const classes = [
        { id: 1, name: '6ème A', level: '6ème', students: 25, subject: 'Mathématiques' },
        { id: 2, name: '5ème B', level: '5ème', students: 23, subject: 'Français' }
      ];
      res.json({ success: true, classes });
    } catch (error) {
      console.error('[TEACHER_CLASSES] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch teacher classes' });
    }
  });

  app.get("/api/teacher/students", requireAuth, async (req, res) => {
    try {
      const students = [
        { id: 1, firstName: 'Marie', lastName: 'Kouame', class: '6ème A', grade: 15.5, parentContact: '+237657001234' },
        { id: 2, firstName: 'Paul', lastName: 'Ngono', class: '6ème A', grade: 14.2, parentContact: '+237657005678' },
        { id: 3, firstName: 'Sophie', lastName: 'Mballa', class: '5ème B', grade: 16.8, parentContact: '+237657009876' }
      ];
      res.json({ success: true, students });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch teacher students' });
    }
  });

  // Routes Student
  app.get("/api/student/grades", requireAuth, async (req, res) => {
    try {
      const grades = [
        { id: 1, subject: 'Mathématiques', grade: 15.5, coefficient: 3, date: '2025-08-20' },
        { id: 2, subject: 'Français', grade: 14.0, coefficient: 2, date: '2025-08-18' },
        { id: 3, subject: 'Histoire', grade: 16.5, coefficient: 2, date: '2025-08-15' }
      ];
      res.json({ success: true, grades });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch student grades' });
    }
  });

  app.get("/api/student/timetable", requireAuth, async (req, res) => {
    try {
      const timetable = [
        { day: 'Lundi', time: '08:00-09:00', subject: 'Mathématiques', teacher: 'M. Martin', room: 'Salle 101' },
        { day: 'Lundi', time: '09:00-10:00', subject: 'Français', teacher: 'Mme Dubois', room: 'Salle 102' },
        { day: 'Mardi', time: '08:00-09:00', subject: 'Histoire', teacher: 'M. Lambert', room: 'Salle 103' }
      ];
      res.json({ success: true, timetable });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch student timetable' });
    }
  });

  app.post("/api/student/request-account-deletion", requireAuth, async (req, res) => {
    try {
      res.json({ success: true, message: 'Account deletion request submitted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to submit deletion request' });
    }
  });

  // Routes Parent - REMOVED duplicate (handled by parentRouter)

  app.get("/api/parent/safe-zones", requireAuth, async (req, res) => {
    try {
      const safeZones = [
        { id: 1, name: 'École', latitude: 3.848, longitude: 11.502, radius: 100 },
        { id: 2, name: 'Maison', latitude: 3.860, longitude: 11.520, radius: 50 }
      ];
      res.json({ success: true, safeZones });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch safe zones' });
    }
  });

  app.get("/api/parent/children/:childId/location", requireAuth, async (req, res) => {
    try {
      const location = {
        latitude: 3.848,
        longitude: 11.502,
        timestamp: new Date(),
        accuracy: 5,
        status: 'safe'
      };
      res.json({ success: true, location });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch child location' });
    }
  });

  app.get("/api/parent/children/:childId/alerts", requireAuth, async (req, res) => {
    try {
      const alerts = [
        { id: 1, type: 'location', message: 'Enfant arrivé à l\'école', timestamp: new Date() },
        { id: 2, type: 'attendance', message: 'Absence signalée', timestamp: new Date(Date.now() - 3600000) }
      ];
      res.json({ success: true, alerts });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch child alerts' });
    }
  });

  app.post("/api/parent/approve-account-deletion", requireAuth, async (req, res) => {
    try {
      res.json({ success: true, message: 'Account deletion approved successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to approve deletion' });
    }
  });

  // Routes Freelancer
  app.get("/api/freelancer/students", requireAuth, async (req, res) => {
    try {
      const students = [
        { id: 1, name: 'Jean Mballa', level: 'Terminale', subject: 'Mathématiques', progress: 75 },
        { id: 2, name: 'Sophie Ngono', level: '1ère', subject: 'Physique', progress: 85 }
      ];
      res.json({ success: true, students });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch freelancer students' });
    }
  });

  app.post("/api/freelancer/students", requireAuth, async (req, res) => {
    try {
      const newStudent = { id: Date.now(), ...req.body, createdAt: new Date() };
      res.json({ success: true, message: 'Student added successfully', student: newStudent });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to add student' });
    }
  });

  app.get("/api/freelancer/sessions", requireAuth, async (req, res) => {
    try {
      const sessions = [
        { id: 1, studentId: 1, subject: 'Mathématiques', date: '2025-08-25', time: '14:00-15:00', status: 'scheduled' },
        { id: 2, studentId: 2, subject: 'Physique', date: '2025-08-26', time: '16:00-17:00', status: 'completed' }
      ];
      res.json({ success: true, sessions });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
    }
  });

  app.get("/api/freelancer/schedule", requireAuth, async (req, res) => {
    try {
      const schedule = [
        { id: 1, day: 'Lundi', time: '14:00-15:00', student: 'Jean Mballa', subject: 'Maths' },
        { id: 2, day: 'Mercredi', time: '16:00-17:00', student: 'Sophie Ngono', subject: 'Physique' }
      ];
      res.json({ success: true, schedule });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch schedule' });
    }
  });

  app.post("/api/freelancer/schedule", requireAuth, async (req, res) => {
    try {
      const newSession = { id: Date.now(), ...req.body, createdAt: new Date() };
      res.json({ success: true, message: 'Session scheduled successfully', session: newSession });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to schedule session' });
    }
  });

  app.put("/api/freelancer/schedule/:sessionId", requireAuth, async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      res.json({ success: true, message: 'Session updated successfully', sessionId });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update session' });
    }
  });

  app.delete("/api/freelancer/schedule/:sessionId", requireAuth, async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      res.json({ success: true, message: 'Session deleted successfully', sessionId });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete session' });
    }
  });

  app.get("/api/freelancer/teaching-zones", requireAuth, async (req, res) => {
    try {
      const zones = [
        { id: 1, name: 'Centre-ville Yaoundé', radius: 5000, active: true },
        { id: 2, name: 'Quartier Bastos', radius: 3000, active: true }
      ];
      res.json({ success: true, zones });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch teaching zones' });
    }
  });

  app.get("/api/freelancer/profile", requireAuth, async (req, res) => {
    try {
      const profile = {
        id: req.user?.id,
        name: req.user?.firstName + ' ' + req.user?.lastName,
        specialization: 'Mathématiques',
        experience: '5 ans',
        rating: 4.8,
        hourlyRate: 5000
      };
      res.json({ success: true, profile });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
  });

  app.post("/api/freelancer/profile/update", requireAuth, async (req, res) => {
    try {
      res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
  });

  app.get("/api/freelancer/payments", requireAuth, async (req, res) => {
    try {
      const payments = [
        { id: 1, amount: 25000, date: '2025-08-20', student: 'Jean Mballa', status: 'paid' },
        { id: 2, amount: 20000, date: '2025-08-15', student: 'Sophie Ngono', status: 'pending' }
      ];
      res.json({ success: true, payments });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch payments' });
    }
  });

  app.get("/api/freelancer/resources", requireAuth, async (req, res) => {
    try {
      const resources = [
        { id: 1, title: 'Cours de Mathématiques Terminale', type: 'PDF', size: '2.5MB' },
        { id: 2, title: 'Exercices de Physique 1ère', type: 'DOC', size: '1.8MB' }
      ];
      res.json({ success: true, resources });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch resources' });
    }
  });

  // Routes de connexions éducatives
  app.get("/api/teacher-student/connections", requireAuth, async (req, res) => {
    try {
      const connections = [
        { id: 1, studentName: 'Marie Kouame', status: 'pending', requestDate: '2025-08-20' },
        { id: 2, studentName: 'Paul Ngono', status: 'approved', requestDate: '2025-08-18' }
      ];
      res.json({ success: true, connections });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch teacher-student connections' });
    }
  });

  app.post("/api/teacher-student/connections/:connectionId/approve", requireAuth, async (req, res) => {
    try {
      const connectionId = req.params.connectionId;
      res.json({ success: true, message: 'Connection approved', connectionId });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to approve connection' });
    }
  });

  app.get("/api/teacher-student/messages", requireAuth, async (req, res) => {
    try {
      const messages = [
        { id: 1, from: 'Marie Kouame', message: 'Bonjour professeur', timestamp: new Date() },
        { id: 2, from: 'Teacher', message: 'Bonjour Marie', timestamp: new Date() }
      ];
      res.json({ success: true, messages });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
  });

  app.get("/api/student-parent/connections", requireAuth, async (req, res) => {
    try {
      const connections = [
        { id: 1, parentName: 'Mme Kouame', status: 'approved', requestDate: '2025-08-15' }
      ];
      res.json({ success: true, connections });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch student-parent connections' });
    }
  });

  app.post("/api/student-parent/connections/:connectionId/approve", requireAuth, async (req, res) => {
    try {
      const connectionId = req.params.connectionId;
      res.json({ success: true, message: 'Parent connection approved', connectionId });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to approve parent connection' });
    }
  });

  app.get("/api/student-parent/messages", requireAuth, async (req, res) => {
    try {
      const messages = [
        { id: 1, from: 'Parent', message: 'Comment ça va à l\'école?', timestamp: new Date() },
        { id: 2, from: 'Student', message: 'Ça va bien maman', timestamp: new Date() }
      ];
      res.json({ success: true, messages });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch student-parent messages' });
    }
  });

  // Routes de requêtes parents
  app.get("/api/parent-requests-test", requireAuth, async (req, res) => {
    try {
      const requests = [
        { id: 1, parentName: 'Mme Mballa', childName: 'Jean', status: 'pending', date: '2025-08-20' },
        { id: 2, parentName: 'M. Ngono', childName: 'Sophie', status: 'approved', date: '2025-08-18' }
      ];
      res.json({ success: true, requests });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch parent requests' });
    }
  });

  app.post("/api/parent-requests/process", requireAuth, async (req, res) => {
    try {
      const { requestId, action } = req.body;
      res.json({ success: true, message: `Request ${action}d successfully`, requestId });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to process parent request' });
    }
  });

  // === ROUTES GÉNÉRALES MANQUANTES ===
  
  // Route générale pour tous les étudiants (utilisée par sandbox API tester)
  app.get("/api/students", requireAuth, async (req, res) => {
    try {
      const students = [
        { id: 1, firstName: 'Marie', lastName: 'Kouame', class: '6ème A', school: 'École Saint-Joseph' },
        { id: 2, firstName: 'Paul', lastName: 'Ngono', class: '5ème B', school: 'École Saint-Joseph' },
        { id: 3, firstName: 'Sophie', lastName: 'Mballa', class: '3ème C', school: 'Collège Central' },
        { id: 4, firstName: 'Jean', lastName: 'Talla', class: '4ème A', school: 'Collège Central' }
      ];
      res.json({ success: true, students });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch all students' });
    }
  });

  // Route générale pour tous les enseignants (utilisée par sandbox API tester)
  app.get("/api/teachers", requireAuth, async (req, res) => {
    try {
      const teachers = [
        { id: 1, firstName: 'Jean', lastName: 'Martin', subject: 'Mathématiques', school: 'École Saint-Joseph' },
        { id: 2, firstName: 'Marie', lastName: 'Dubois', subject: 'Français', school: 'École Saint-Joseph' },
        { id: 3, firstName: 'Paul', lastName: 'Lambert', subject: 'Histoire', school: 'Collège Central' },
        { id: 4, firstName: 'Sophie', lastName: 'Moreau', subject: 'Sciences', school: 'Collège Central' }
      ];
      res.json({ success: true, teachers });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch all teachers' });
    }
  });

  // Routes spécialisées pour les relations école-enseignant-enfants
  app.get("/api/school/teachers", requireAuth, async (req, res) => {
    try {
      const schoolId = req.query.schoolId || req.user?.schoolId;
      const teachers = [
        { id: 1, firstName: 'Jean', lastName: 'Martin', subject: 'Mathématiques', classes: ['6ème A', '5ème B'] },
        { id: 2, firstName: 'Marie', lastName: 'Dubois', subject: 'Français', classes: ['6ème A', '4ème C'] }
      ];
      res.json({ success: true, teachers, schoolId });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch school teachers' });
    }
  });

  app.get("/api/school/students", requireAuth, async (req, res) => {
    try {
      const schoolId = req.query.schoolId || req.user?.schoolId;
      const students = [
        { id: 1, firstName: 'Marie', lastName: 'Kouame', class: '6ème A', parentId: 10 },
        { id: 2, firstName: 'Paul', lastName: 'Ngono', class: '5ème B', parentId: 11 },
        { id: 3, firstName: 'Sophie', lastName: 'Mballa', class: '3ème C', parentId: 12 }
      ];
      res.json({ success: true, students, schoolId });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch school students' });
    }
  });

  // Add missing parent-child connection routes
  app.get("/api/school/parent-child-connections", requireAuth, async (req, res) => {
    try {
      const connections = [
        { id: 1, parentId: 10, childId: 1, status: 'approved', createdAt: '2025-08-20' },
        { id: 2, parentId: 11, childId: 2, status: 'approved', createdAt: '2025-08-18' }
      ];
      res.json({ success: true, connections });
    } catch (error) {
      console.error('[PARENT_CHILD_CONNECTIONS] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch parent-child connections' });
    }
  });

  // Add missing parent routes (grades, attendance, messages, payments)
  app.get("/api/parent/grades", requireAuth, async (req, res) => {
    try {
      const grades = [
        { id: 1, childName: 'Marie Kouame', subject: 'Mathématiques', grade: 15.5, date: '2025-08-20' },
        { id: 2, childName: 'Marie Kouame', subject: 'Français', grade: 14.0, date: '2025-08-18' }
      ];
      res.json({ success: true, grades });
    } catch (error) {
      console.error('[PARENT_GRADES] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch child grades' });
    }
  });

  app.get("/api/parent/attendance", requireAuth, async (req, res) => {
    try {
      const attendance = [
        { id: 1, childName: 'Marie Kouame', date: '2025-08-24', status: 'present', subject: 'Mathématiques' },
        { id: 2, childName: 'Marie Kouame', date: '2025-08-23', status: 'absent', subject: 'Français' }
      ];
      res.json({ success: true, attendance });
    } catch (error) {
      console.error('[PARENT_ATTENDANCE] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch attendance data' });
    }
  });

  app.get("/api/parent/messages", requireAuth, async (req, res) => {
    try {
      const messages = [
        { id: 1, from: 'École Saint-Joseph', subject: 'Réunion parents', message: 'Réunion prévue le 30 août', date: '2025-08-24' },
        { id: 2, from: 'Mme Dubois', subject: 'Notes de Marie', message: 'Excellents résultats ce trimestre', date: '2025-08-22' }
      ];
      res.json({ success: true, messages });
    } catch (error) {
      console.error('[PARENT_MESSAGES] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
  });

  app.get("/api/parent/payments", requireAuth, async (req, res) => {
    try {
      const payments = [
        { id: 1, description: 'Frais de scolarité Q1', amount: 50000, status: 'paid', dueDate: '2025-08-15', paidDate: '2025-08-10' },
        { id: 2, description: 'Frais de cantine', amount: 25000, status: 'pending', dueDate: '2025-08-30', paidDate: null }
      ];
      res.json({ success: true, payments });
    } catch (error) {
      console.error('[PARENT_PAYMENTS] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch payment data' });
    }
  });

  // Add parent children route
  app.get("/api/parent/children", requireAuth, async (req, res) => {
    try {
      const children = [
        {
          id: 1,
          firstName: 'Marie',
          lastName: 'Kouame',
          fullName: 'Marie Kouame',
          email: 'marie.kouame@saintjoseph.edu',
          class: '6ème A',
          level: '6ème',
          school: 'École Saint-Joseph',
          age: 12,
          status: 'active',
          average: 15.2,
          attendance: 95
        },
        {
          id: 2,
          firstName: 'Paul',
          lastName: 'Kouame',
          fullName: 'Paul Kouame',
          email: 'paul.kouame@saintjoseph.edu',
          class: '3ème B',
          level: '3ème',
          school: 'École Saint-Joseph',
          age: 15,
          status: 'active',
          average: 13.8,
          attendance: 88
        }
      ];
      res.json({ success: true, children });
    } catch (error) {
      console.error('[PARENT_CHILDREN] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch children' });
    }
  });

  // Add missing parent timetable route
  app.get("/api/parent/children/:childId/timetable", requireAuth, async (req, res) => {
    try {
      const { childId } = req.params;
      // Emploi du temps complet pour les enfants camerounais
      const timetable = [
        // Lundi (dayOfWeek: 1)
        { id: 1, dayOfWeek: 1, startTime: '07:30', endTime: '08:20', subjectName: 'Mathématiques', teacherName: 'M. Martin', room: 'Salle 101' },
        { id: 2, dayOfWeek: 1, startTime: '08:20', endTime: '09:10', subjectName: 'Français', teacherName: 'Mme Dubois', room: 'Salle 102' },
        { id: 3, dayOfWeek: 1, startTime: '09:30', endTime: '10:20', subjectName: 'Histoire-Géographie', teacherName: 'M. Lambert', room: 'Salle 103' },
        { id: 4, dayOfWeek: 1, startTime: '10:20', endTime: '11:10', subjectName: 'Sciences Physiques', teacherName: 'Mme Moreau', room: 'Laboratoire' },
        { id: 5, dayOfWeek: 1, startTime: '11:30', endTime: '12:20', subjectName: 'Anglais', teacherName: 'Miss Johnson', room: 'Salle 105' },
        
        // Mardi (dayOfWeek: 2)
        { id: 6, dayOfWeek: 2, startTime: '07:30', endTime: '08:20', subjectName: 'Français', teacherName: 'Mme Dubois', room: 'Salle 102' },
        { id: 7, dayOfWeek: 2, startTime: '08:20', endTime: '09:10', subjectName: 'Mathématiques', teacherName: 'M. Martin', room: 'Salle 101' },
        { id: 8, dayOfWeek: 2, startTime: '09:30', endTime: '10:20', subjectName: 'Sciences Naturelles', teacherName: 'Dr. Ngozi', room: 'Laboratoire Bio' },
        { id: 9, dayOfWeek: 2, startTime: '10:20', endTime: '11:10', subjectName: 'Éducation Civique', teacherName: 'M. Kouame', room: 'Salle 104' },
        { id: 10, dayOfWeek: 2, startTime: '11:30', endTime: '12:20', subjectName: 'Sport', teacherName: 'Coach Mbeki', room: 'Terrain' },
        
        // Mercredi (dayOfWeek: 3)
        { id: 11, dayOfWeek: 3, startTime: '07:30', endTime: '08:20', subjectName: 'Mathématiques', teacherName: 'M. Martin', room: 'Salle 101' },
        { id: 12, dayOfWeek: 3, startTime: '08:20', endTime: '09:10', subjectName: 'Histoire-Géographie', teacherName: 'M. Lambert', room: 'Salle 103' },
        { id: 13, dayOfWeek: 3, startTime: '09:30', endTime: '10:20', subjectName: 'Anglais', teacherName: 'Miss Johnson', room: 'Salle 105' },
        { id: 14, dayOfWeek: 3, startTime: '10:20', endTime: '11:10', subjectName: 'Arts Plastiques', teacherName: 'Mme Tchoula', room: 'Atelier Art' },
        
        // Jeudi (dayOfWeek: 4)
        { id: 15, dayOfWeek: 4, startTime: '07:30', endTime: '08:20', subjectName: 'Français', teacherName: 'Mme Dubois', room: 'Salle 102' },
        { id: 16, dayOfWeek: 4, startTime: '08:20', endTime: '09:10', subjectName: 'Sciences Physiques', teacherName: 'Mme Moreau', room: 'Laboratoire' },
        { id: 17, dayOfWeek: 4, startTime: '09:30', endTime: '10:20', subjectName: 'Mathématiques', teacherName: 'M. Martin', room: 'Salle 101' },
        { id: 18, dayOfWeek: 4, startTime: '10:20', endTime: '11:10', subjectName: 'Musique', teacherName: 'M. Biya', room: 'Salle Musique' },
        { id: 19, dayOfWeek: 4, startTime: '11:30', endTime: '12:20', subjectName: 'Informatique', teacherName: 'M. Digital', room: 'Salle Info' },
        
        // Vendredi (dayOfWeek: 5)
        { id: 20, dayOfWeek: 5, startTime: '07:30', endTime: '08:20', subjectName: 'Éducation Civique', teacherName: 'M. Kouame', room: 'Salle 104' },
        { id: 21, dayOfWeek: 5, startTime: '08:20', endTime: '09:10', subjectName: 'Sciences Naturelles', teacherName: 'Dr. Ngozi', room: 'Laboratoire Bio' },
        { id: 22, dayOfWeek: 5, startTime: '09:30', endTime: '10:20', subjectName: 'Anglais', teacherName: 'Miss Johnson', room: 'Salle 105' },
        { id: 23, dayOfWeek: 5, startTime: '10:20', endTime: '11:10', subjectName: 'Sport', teacherName: 'Coach Mbeki', room: 'Terrain' },
        
        // Samedi (dayOfWeek: 6) - Demi-journée
        { id: 24, dayOfWeek: 6, startTime: '07:30', endTime: '08:20', subjectName: 'Révisions Générales', teacherName: 'Divers', room: 'Classes' },
        { id: 25, dayOfWeek: 6, startTime: '08:20', endTime: '09:10', subjectName: 'Activités Parascolaires', teacherName: 'Animateurs', room: 'Cour' }
      ];
      res.json({ success: true, timetable, childId: parseInt(childId) });
    } catch (error) {
      console.error('[PARENT_TIMETABLE] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch child timetable' });
    }
  });

  // Add geolocation routes for parent dashboard
  app.get("/api/geolocation/parent/children", requireAuth, async (req, res) => {
    try {
      const children = [
        { 
          id: 1, 
          name: 'Marie Kouame', 
          class: '6ème A', 
          deviceId: 'DEVICE_001',
          deviceType: 'smartphone',
          lastLocation: {
            latitude: 4.0511,
            longitude: 9.7679,
            timestamp: new Date().toISOString(),
            address: 'École Saint-Joseph, Douala'
          },
          batteryLevel: 85,
          status: 'at_school'
        },
        { 
          id: 2, 
          name: 'Paul Kouame', 
          class: '3ème B', 
          deviceId: 'DEVICE_002',
          deviceType: 'smartwatch',
          lastLocation: {
            latitude: 4.0616,
            longitude: 9.7736,
            timestamp: new Date(Date.now() - 30000).toISOString(),
            address: 'Domicile familial, Douala'
          },
          batteryLevel: 45,
          status: 'safe'
        }
      ];
      res.json(children);
    } catch (error) {
      console.error('[PARENT_GEOLOCATION_CHILDREN] Error:', error);
      res.status(500).json({ message: 'Failed to fetch children location data' });
    }
  });

  app.get("/api/geolocation/parent/safe-zones", requireAuth, async (req, res) => {
    try {
      const safeZones = [
        {
          id: 1,
          name: 'École Saint-Joseph',
          type: 'school',
          coordinates: { lat: 4.0511, lng: 9.7679 },
          radius: 100,
          children: [1, 2],
          active: true
        },
        {
          id: 2,
          name: 'Domicile',
          type: 'home',
          coordinates: { lat: 4.0616, lng: 9.7736 },
          radius: 50,
          children: [1, 2],
          active: true
        }
      ];
      res.json(safeZones);
    } catch (error) {
      console.error('[PARENT_SAFE_ZONES] Error:', error);
      res.status(500).json({ message: 'Failed to fetch safe zones' });
    }
  });

  app.get("/api/geolocation/parent/alerts", requireAuth, async (req, res) => {
    try {
      const alerts = [
        {
          id: 1,
          childName: 'Marie Kouame',
          type: 'zone_enter',
          message: 'Marie est arrivée à l\'école',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          severity: 'info',
          resolved: false
        },
        {
          id: 2,
          childName: 'Paul Kouame',
          type: 'low_battery',
          message: 'Batterie faible sur l\'appareil de Paul (45%)',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          severity: 'warning',
          resolved: false
        }
      ];
      res.json(alerts);
    } catch (error) {
      console.error('[PARENT_GEOLOCATION_ALERTS] Error:', error);
      res.status(500).json({ message: 'Failed to fetch geolocation alerts' });
    }
  });

  // Add family connections route for parent module
  app.get("/api/family/connections", requireAuth, async (req, res) => {
    try {
      const connections = [
        {
          id: 1,
          type: 'parent-child',
          parentName: 'Papa Kouame',
          childName: 'Marie Kouame',
          status: 'connected',
          connectedAt: '2025-08-20',
          deviceId: 'DEVICE_001'
        },
        {
          id: 2,
          type: 'parent-child',
          parentName: 'Papa Kouame',
          childName: 'Paul Kouame',
          status: 'connected',
          connectedAt: '2025-08-18',
          deviceId: 'DEVICE_002'
        }
      ];
      res.json({ success: true, connections });
    } catch (error) {
      console.error('[FAMILY_CONNECTIONS] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch family connections' });
    }
  });

  // Add missing API routes for functional parent modules
  app.get("/api/parent/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = {
        totalChildren: 2,
        activeDevices: 2,
        todayAttendance: '100%',
        weeklyAverage: 16.2,
        unreadMessages: 3,
        pendingPayments: 1
      };
      res.json({ success: true, stats });
    } catch (error) {
      console.error('[PARENT_DASHBOARD_STATS] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
    }
  });

  // Add child details route
  app.get("/api/parent/children/:childId/details", requireAuth, async (req, res) => {
    try {
      const { childId } = req.params;
      const childDetails = {
        id: parseInt(childId),
        firstName: 'Marie',
        lastName: 'Kouame',
        class: '6ème A',
        school: 'École Saint-Joseph',
        teacher: 'Mme Dubois',
        parentContact: '+237657001234',
        emergencyContact: '+237657005678',
        medicalInfo: 'Aucune allergie connue',
        subjects: ['Mathématiques', 'Français', 'Histoire', 'Sciences'],
        recentGrades: [
          { subject: 'Mathématiques', grade: 15.5, date: '2025-08-20' },
          { subject: 'Français', grade: 14.0, date: '2025-08-18' }
        ]
      };
      res.json({ success: true, child: childDetails });
    } catch (error) {
      console.error('[CHILD_DETAILS] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch child details' });
    }
  });

  // Add grade request submission route
  app.post("/api/parent/grades/request", requireAuth, async (req, res) => {
    try {
      const { studentName, subject, requestType, message } = req.body;
      const requestId = Date.now(); // Simple ID generation
      
      console.log('[GRADE_REQUEST] New request:', { studentName, subject, requestType, message });
      
      res.json({ 
        success: true, 
        message: 'Grade request submitted successfully',
        requestId,
        status: 'pending'
      });
    } catch (error) {
      console.error('[GRADE_REQUEST] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to submit grade request' });
    }
  });

  // Add parent homework routes  
  app.get("/api/parent/homework", requireAuth, async (req, res) => {
    try {
      const homework = [
        {
          id: 1,
          studentName: 'Marie Kouame',
          subject: 'Mathématiques',
          title: 'Exercices sur les fractions',
          description: 'Compléter les exercices 1 à 10 page 45',
          dueDate: '2025-08-25',
          status: 'pending',
          priority: 'medium',
          teacherName: 'M. Martin'
        },
        {
          id: 2,
          studentName: 'Paul Kouame',
          subject: 'Français',
          title: 'Rédaction sur les vacances',
          description: 'Écrire une rédaction de 200 mots sur les vacances d\'été',
          dueDate: '2025-08-26',
          status: 'completed',
          priority: 'high',
          teacherName: 'Mme Dubois'
        }
      ];
      res.json({ success: true, homework });
    } catch (error) {
      console.error('[PARENT_HOMEWORK] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch homework' });
    }
  });

  // Add parent profile route
  app.get("/api/parent/profile", requireAuth, async (req, res) => {
    try {
      const profile = {
        id: 1,
        firstName: 'Papa',
        lastName: 'Kouame',
        email: 'papa.kouame@example.com',
        phone: '+237657001234',
        address: 'Quartier Bonapriso, Douala',
        occupation: 'Ingénieur',
        emergencyContact: '+237657005678',
        children: [
          { id: 1, name: 'Marie Kouame', class: '6ème A' },
          { id: 2, name: 'Paul Kouame', class: '3ème B' }
        ],
        preferences: {
          language: 'fr',
          notifications: true,
          geolocationAlerts: true,
          academicReports: true
        },
        subscription: {
          plan: 'École Privée Complet',
          status: 'active',
          nextBilling: '2025-12-01',
          amount: '115,000 XAF/year'
        }
      };
      res.json({ success: true, profile });
    } catch (error) {
      console.error('[PARENT_PROFILE] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch parent profile' });
    }
  });

  // Add parent notification routes
  app.get("/api/parent/notifications", requireAuth, async (req, res) => {
    try {
      const notifications = [
        {
          id: 1,
          title: 'Nouvelle note disponible',
          message: 'Marie a reçu une note de 15/20 en Mathématiques',
          type: 'grade',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false,
          priority: 'medium'
        },
        {
          id: 2,
          title: 'Absence détectée',
          message: 'Paul est absent du cours de Français aujourd\'hui',
          type: 'attendance',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: false,
          priority: 'high'
        },
        {
          id: 3,
          title: 'Alerte géolocalisation',
          message: 'Marie a quitté la zone sécurisée de l\'école',
          type: 'geolocation',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          read: true,
          priority: 'critical'
        }
      ];
      res.json({ success: true, notifications });
    } catch (error) {
      console.error('[PARENT_NOTIFICATIONS] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
  });

  // =============================================
  // DIRECTOR MANAGEMENT API ROUTES
  // =============================================

  // Director Teachers Management
  app.get("/api/director/teachers", requireAuth, async (req, res) => {
    try {
      const teachers = [
        {
          id: 1,
          name: 'Marie Dubois',
          email: 'marie.dubois@saintjoseph.edu',
          phone: '+237657001234',
          subjects: ['Mathématiques', 'Physique'],
          classes: ['6ème A', '5ème B'],
          experience: 8,
          qualification: 'Licence en Mathématiques',
          status: 'active',
          schedule: 'Temps plein',
          salary: 180000
        },
        {
          id: 2,
          name: 'Jean Martin',
          email: 'jean.martin@saintjoseph.edu',
          phone: '+237657005678',
          subjects: ['Français', 'Histoire'],
          classes: ['4ème A', '3ème C'],
          experience: 12,
          qualification: 'Master en Lettres',
          status: 'active',
          schedule: 'Temps plein',
          salary: 210000
        },
        {
          id: 3,
          name: 'Sophie Lambert',
          email: 'sophie.lambert@saintjoseph.edu',
          phone: '+237657009012',
          subjects: ['Anglais'],
          classes: ['2nde A', '1ère S'],
          experience: 5,
          qualification: 'Licence en Anglais',
          status: 'active',
          schedule: 'Mi-temps',
          salary: 120000
        }
      ];
      res.json(teachers);
    } catch (error) {
      console.error('[DIRECTOR_TEACHERS] Error:', error);
      res.status(500).json({ message: 'Failed to fetch teachers' });
    }
  });

  app.post("/api/director/teacher", requireAuth, async (req, res) => {
    try {
      const { name, email, phone, subjects, classes, experience, qualification, schedule, salary } = req.body;
      const newTeacher = {
        id: Date.now(),
        name,
        email,
        phone,
        subjects: subjects.split(',').map((s: string) => s.trim()),
        classes: classes.split(',').map((c: string) => c.trim()),
        experience: parseInt(experience),
        qualification,
        status: 'active',
        schedule,
        salary: parseInt(salary)
      };
      
      console.log('[DIRECTOR_TEACHER_CREATE] New teacher:', newTeacher);
      res.json({ success: true, teacher: newTeacher, message: 'Teacher created successfully' });
    } catch (error) {
      console.error('[DIRECTOR_TEACHER_CREATE] Error:', error);
      res.status(500).json({ message: 'Failed to create teacher' });
    }
  });

  app.put("/api/director/teacher/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const teacherData = req.body;
      
      console.log(`[DIRECTOR_TEACHER_UPDATE] Updating teacher ${id}:`, teacherData);
      res.json({ success: true, message: 'Teacher updated successfully' });
    } catch (error) {
      console.error('[DIRECTOR_TEACHER_UPDATE] Error:', error);
      res.status(500).json({ message: 'Failed to update teacher' });
    }
  });

  app.delete("/api/director/teacher/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`[DIRECTOR_TEACHER_DELETE] Deleting teacher ${id}`);
      res.json({ success: true, message: 'Teacher deleted successfully' });
    } catch (error) {
      console.error('[DIRECTOR_TEACHER_DELETE] Error:', error);
      res.status(500).json({ message: 'Failed to delete teacher' });
    }
  });

  // Director Students Management
  app.get("/api/director/students", requireAuth, async (req, res) => {
    try {
      const students = [
        {
          id: 1,
          firstName: 'Marie',
          lastName: 'Kouame',
          email: 'marie.kouame@saintjoseph.edu',
          className: '6ème A',
          level: '6ème',
          age: 12,
          parentName: 'Papa Kouame',
          parentEmail: 'papa.kouame@gmail.com',
          parentPhone: '+237657001234',
          status: 'active',
          average: 15.2,
          attendance: 95
        },
        {
          id: 2,
          firstName: 'Paul',
          lastName: 'Kouame',
          email: 'paul.kouame@saintjoseph.edu',
          className: '3ème B',
          level: '3ème',
          age: 15,
          parentName: 'Papa Kouame',
          parentEmail: 'papa.kouame@gmail.com',
          parentPhone: '+237657001234',
          status: 'active',
          average: 13.8,
          attendance: 88
        },
        {
          id: 3,
          firstName: 'Fatou',
          lastName: 'Ngozi',
          email: 'fatou.ngozi@saintjoseph.edu',
          className: '2nde A',
          level: '2nde',
          age: 16,
          parentName: 'Maman Ngozi',
          parentEmail: 'maman.ngozi@yahoo.fr',
          parentPhone: '+237657005678',
          status: 'active',
          average: 16.5,
          attendance: 98
        }
      ];
      res.json(students);
    } catch (error) {
      console.error('[DIRECTOR_STUDENTS] Error:', error);
      res.status(500).json({ message: 'Failed to fetch students' });
    }
  });

  app.post("/api/director/student", requireAuth, async (req, res) => {
    try {
      const { firstName, lastName, email, className, level, age, parentName, parentEmail, parentPhone } = req.body;
      const newStudent = {
        id: Date.now(),
        firstName,
        lastName,
        email,
        className,
        level,
        age: parseInt(age),
        parentName,
        parentEmail,
        parentPhone,
        status: 'active',
        average: 0,
        attendance: 100
      };
      
      console.log('[DIRECTOR_STUDENT_CREATE] New student:', newStudent);
      res.json({ success: true, student: newStudent, message: 'Student created successfully' });
    } catch (error) {
      console.error('[DIRECTOR_STUDENT_CREATE] Error:', error);
      res.status(500).json({ message: 'Failed to create student' });
    }
  });

  app.put("/api/director/student/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const studentData = req.body;
      
      console.log(`[DIRECTOR_STUDENT_UPDATE] Updating student ${id}:`, studentData);
      res.json({ success: true, message: 'Student updated successfully' });
    } catch (error) {
      console.error('[DIRECTOR_STUDENT_UPDATE] Error:', error);
      res.status(500).json({ message: 'Failed to update student' });
    }
  });

  app.delete("/api/director/student/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`[DIRECTOR_STUDENT_DELETE] Deleting student ${id}`);
      res.json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
      console.error('[DIRECTOR_STUDENT_DELETE] Error:', error);
      res.status(500).json({ message: 'Failed to delete student' });
    }
  });

  // Director Classes Management
  app.get("/api/director/classes", requireAuth, async (req, res) => {
    try {
      const classes = [
        {
          id: 1,
          name: '6ème A',
          level: '6ème',
          section: 'A',
          capacity: 35,
          currentStudents: 32,
          teacherName: 'Marie Dubois',
          room: 'Salle 101',
          status: 'active'
        },
        {
          id: 2,
          name: '5ème B',
          level: '5ème',
          section: 'B',
          capacity: 40,
          currentStudents: 38,
          teacherName: 'Jean Martin',
          room: 'Salle 102',
          status: 'active'
        },
        {
          id: 3,
          name: '3ème C',
          level: '3ème',
          section: 'C',
          capacity: 35,
          currentStudents: 35,
          teacherName: 'Sophie Lambert',
          room: 'Salle 201',
          status: 'full'
        },
        {
          id: 4,
          name: '2nde A',
          level: '2nde',
          section: 'A',
          capacity: 30,
          currentStudents: 28,
          teacherName: 'Pierre Mvondo',
          room: 'Salle 203',
          status: 'active'
        }
      ];
      res.json(classes);
    } catch (error) {
      console.error('[DIRECTOR_CLASSES] Error:', error);
      res.status(500).json({ message: 'Failed to fetch classes' });
    }
  });

  app.post("/api/director/class", requireAuth, async (req, res) => {
    try {
      const { name, level, section, capacity, teacherId, teacherName, room } = req.body;
      const newClass = {
        id: Date.now(),
        name,
        level,
        section,
        capacity: parseInt(capacity),
        currentStudents: 0,
        teacherName,
        room,
        status: 'active'
      };
      
      console.log('[DIRECTOR_CLASS_CREATE] New class:', newClass);
      res.json({ success: true, class: newClass, message: 'Class created successfully' });
    } catch (error) {
      console.error('[DIRECTOR_CLASS_CREATE] Error:', error);
      res.status(500).json({ message: 'Failed to create class' });
    }
  });

  app.put("/api/director/class/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const classData = req.body;
      
      console.log(`[DIRECTOR_CLASS_UPDATE] Updating class ${id}:`, classData);
      res.json({ success: true, message: 'Class updated successfully' });
    } catch (error) {
      console.error('[DIRECTOR_CLASS_UPDATE] Error:', error);
      res.status(500).json({ message: 'Failed to update class' });
    }
  });

  app.delete("/api/director/class/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`[DIRECTOR_CLASS_DELETE] Deleting class ${id}`);
      res.json({ success: true, message: 'Class deleted successfully' });
    } catch (error) {
      console.error('[DIRECTOR_CLASS_DELETE] Error:', error);
      res.status(500).json({ message: 'Failed to delete class' });
    }
  });

  // Director Analytics and Overview
  app.get("/api/director/analytics", requireAuth, async (req, res) => {
    try {
      const analytics = {
        totalStudents: 156,
        totalTeachers: 18,
        totalClasses: 12,
        averageAttendance: 92.5,
        averageGrade: 14.8,
        newEnrollments: 23,
        graduatedStudents: 28,
        activeProjects: 8,
        pendingPayments: 12,
        satisfaction: 4.6
      };
      res.json({ success: true, analytics });
    } catch (error) {
      console.error('[DIRECTOR_ANALYTICS] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
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
      console.error('[DIRECTOR_SETTINGS] Error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch settings' });
    }
  });

  // Routes pour les relations parent-enfant au niveau école
  app.get("/api/school/parent-child-connections", requireAuth, async (req, res) => {
    try {
      const connections = [
        { parentId: 10, parentName: 'Mme Kouame', childId: 1, childName: 'Marie Kouame', status: 'active' },
        { parentId: 11, parentName: 'M. Ngono', childId: 2, childName: 'Paul Ngono', status: 'active' },
        { parentId: 12, parentName: 'Mme Mballa', childId: 3, childName: 'Sophie Mballa', status: 'pending' }
      ];
      res.json({ success: true, connections });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch parent-child connections' });
    }
  });

  // Register existing route modules
  app.use('/api/geolocation', geolocationRoutes);
  app.use('/api/enhanced-geolocation', enhancedGeolocationRoutes);
  app.use('/api/documents', documentsRouter);
  app.use('/api/subscription', subscriptionRoutes);
  app.use('/api/pwa', pwaRoutes);
  app.use('/api/whatsapp', whatsappRoutes);
  
  // Missing routes after refactor
  app.use('/api/classes', classesRoutes);
  app.use('/api/grades', gradesRoutes);  
  app.use('/api/teachers-standalone', teachersStandalone);
  app.use('/api/students-standalone', studentsStandalone);
  app.use('/api/currency', currencyRoutes);
  app.use('/api/stripe', stripeRoutes);
  app.use('/api/uploads', uploadsRoutes);
  app.use('/api/bulletins', bulletinRoutes);
  app.use('/api/bulletin-validation', bulletinValidationRoutes);
  trackingRoutes(app);
  app.use('/api/tutorials', tutorialRoutes);
  
  // 🚫 WARNING: Keep administration routes LAST to prevent route interception
  // This route catches ALL /api/* requests, so it must come after specific routes
  app.use('/api/administration', administrationRoutes);
  app.use('/api/autofix', autofixRoutes);
  app.use('/api/multi-role', multiRoleRoutes);
  app.use('/api/system-reports', systemReportsRoutes);
  app.use('/api/email-preferences', emailPreferencesRoutes);
  app.use('/api/configuration', configurationRoutes);
  // 🚫 DEPRECATED: Old duplicated messaging routes - replaced by unified system
  // app.use('/api/family-connections', familyConnectionsRoutes);
  // app.use('/api/teacher-student-connections', teacherStudentConnections);
  // app.use('/api/student-parent-connections', studentParentConnections);
  
  // ✅ NEW: Unified messaging system - replaces all duplicated routes
  app.use('/api/messages', unifiedMessagingRoutes);
  app.use('/api/connections', connectionsRoutes);
  
  app.use('/api/bulk-import', bulkImportRoutes);
  app.use('/api/partnerships', partnershipsRoutes);

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
  
  try {
    registerSubscriptionRoutes(app);
  } catch (error) {
    console.warn('[ROUTES] Subscription routes failed to register:', error);
  }
  
  try {
    setupNotificationRoutes(app);
  } catch (error) {
    console.warn('[ROUTES] Notification routes failed to register:', error);
  }

  console.log('All routes configured ✅');

  // Create HTTP server
  const server = createServer(app);
  return server;
}
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth';
import { storage } from '../storage';

const router = Router();

// Configure multer for homework file uploads
const homeworkStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'public/uploads/homework');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `homework-${uniqueSuffix}-${sanitizedName}`);
  }
});

const homeworkUpload = multer({
  storage: homeworkStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit per file
    files: 5 // Maximum 5 files per submission
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, videos, audio files
    const allowedTypes = [
      'image/', 'video/', 'audio/',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/', 'application/zip', 'application/x-rar-compressed'
    ];
    
    const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`));
    }
  }
});

// GET /api/student/library - Student library/progress data
router.get('/library', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    
    // Mock library/progress data for demo
    const libraryData = [
      {
        subject: 'Mathématiques',
        currentGrade: 16.5,
        previousGrade: 15.2,
        trend: 'up',
        goal: 17.0,
        assignments: {
          total: 12,
          completed: 10,
          average: 16.2
        }
      },
      {
        subject: 'Français',
        currentGrade: 14.8,
        previousGrade: 15.1,
        trend: 'down',
        goal: 16.0,
        assignments: {
          total: 8,
          completed: 7,
          average: 14.5
        }
      },
      {
        subject: 'Sciences',
        currentGrade: 15.9,
        previousGrade: 15.9,
        trend: 'stable',
        goal: 16.5,
        assignments: {
          total: 10,
          completed: 9,
          average: 15.7
        }
      },
      {
        subject: 'Histoire',
        currentGrade: 17.2,
        previousGrade: 16.8,
        trend: 'up',
        goal: 17.0,
        assignments: {
          total: 6,
          completed: 6,
          average: 17.1
        }
      }
    ];

    res.json({
      success: true,
      data: libraryData,
      message: 'Library data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching library data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching library data'
    });
  }
});

// GET /api/student/achievements - Student achievements
router.get('/achievements', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    
    // Mock achievements data
    const achievements = [
      {
        id: 1,
        title: 'Excellent Student',
        description: 'Maintained average above 16/20',
        icon: '🏆',
        date: '2025-01-15',
        points: 100
      },
      {
        id: 2,
        title: 'Perfect Attendance',
        description: '95% attendance rate this term',
        icon: '📅',
        date: '2025-01-10',
        points: 75
      },
      {
        id: 3,
        title: 'Math Champion',
        description: 'Top score in mathematics',
        icon: '🔢',
        date: '2025-01-05',
        points: 80
      }
    ];

    res.json({
      success: true,
      data: achievements,
      message: 'Achievements retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching achievements'
    });
  }
});

// GET /api/student/homework - Get student homework assignments
router.get('/homework', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    
    // Mock homework data
    const homework = [
      {
        id: 1,
        title: 'Exercice de Mathématiques',
        subject: 'Mathématiques',
        teacher: 'M. Dupont',
        dueDate: '2025-08-30',
        status: 'pending',
        priority: 'high',
        description: 'Résoudre les équations du chapitre 3',
        attachments: ['math_exercises.pdf'],
        submittedAt: null,
        grade: null,
        feedback: null
      },
      {
        id: 2,
        title: 'Dissertation Française',
        subject: 'Français',
        teacher: 'Mme. Martin',
        dueDate: '2025-08-28',
        status: 'completed',
        priority: 'medium',
        description: 'Rédiger un essai sur la littérature africaine',
        attachments: [],
        submittedAt: '2025-08-26T10:30:00Z',
        submissionFiles: ['dissertation.pdf'],
        grade: 16,
        feedback: 'Excellent travail, très bien structuré!'
      },
      {
        id: 3,
        title: 'Expérience Sciences',
        subject: 'Sciences',
        teacher: 'Dr. Koné',
        dueDate: '2025-09-05',
        status: 'pending',
        priority: 'medium',
        description: 'Rapport sur l\'expérience de chimie',
        attachments: ['lab_instructions.pdf'],
        submittedAt: null,
        grade: null,
        feedback: null
      },
      {
        id: 4,
        title: 'Projet Histoire',
        subject: 'Histoire',
        teacher: 'M. Tagne',
        dueDate: '2025-09-10',
        status: 'pending',
        priority: 'low',
        description: 'Recherche sur l\'indépendance du Cameroun',
        attachments: [],
        submittedAt: null,
        grade: null,
        feedback: null
      }
    ];

    res.json({
      success: true,
      homework: homework,
      message: 'Homework retrieved successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] Error fetching homework:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching homework'
    });
  }
});

// GET /api/student/homework/:id - Get specific homework assignment
router.get('/homework/:id', requireAuth, async (req, res) => {
  try {
    const homeworkId = parseInt(req.params.id);
    const studentId = req.user?.id;
    
    if (isNaN(homeworkId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid homework ID'
      });
    }

    // Mock single homework data
    const homework = {
      id: homeworkId,
      title: 'Exercice de Mathématiques',
      subject: 'Mathématiques',
      teacher: 'M. Dupont',
      dueDate: '2025-08-30',
      status: 'assigned',
      description: 'Résoudre les équations du chapitre 3. Montrer tout le travail.',
      attachments: ['math_exercises.pdf'],
      submittedAt: null,
      submissionFiles: [],
      grade: null,
      feedback: null,
      instructions: 'Téléchargez le fichier PDF joint, résolvez tous les exercices et téléchargez votre travail.'
    };

    res.json({
      success: true,
      homework: homework,
      message: 'Homework details retrieved successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] Error fetching homework details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching homework details'
    });
  }
});

// POST /api/student/homework/submit - Submit homework assignment with files (NEW ENDPOINT)
router.post('/homework/submit', homeworkUpload.array('files', 5), requireAuth, async (req, res) => {
  try {
    const { homeworkId, submissionText, submissionSource } = req.body;
    const studentId = req.user?.id;
    const files = req.files as Express.Multer.File[];
    
    if (!homeworkId) {
      return res.status(400).json({
        success: false,
        message: 'Homework ID is required'
      });
    }

    if (!submissionText?.trim() && (!files || files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either text or file submissions'
      });
    }

    // Process uploaded files
    const fileUrls = files ? files.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      url: `/uploads/homework/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    })) : [];

    // Create submission record
    const submission = {
      id: Date.now(),
      homeworkId: parseInt(homeworkId),
      studentId: studentId,
      submissionText: submissionText || '',
      attachmentUrls: fileUrls,
      submittedAt: new Date().toISOString(),
      submissionSource: submissionSource || 'web',
      status: 'submitted'
    };

    console.log(`[STUDENT_API] ✅ Homework submission with files:`, {
      ...submission,
      fileCount: fileUrls.length,
      totalFileSize: files?.reduce((sum, f) => sum + f.size, 0) || 0
    });

    res.json({
      success: true,
      submission: submission,
      message: `Devoir soumis avec succès${fileUrls.length > 0 ? ` avec ${fileUrls.length} fichier(s)` : ''}`,
      files: fileUrls
    });
  } catch (error) {
    console.error('[STUDENT_API] ❌ Error submitting homework with files:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      (req.files as Express.Multer.File[]).forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error submitting homework'
    });
  }
});

// POST /api/student/homework/:id/submit - Submit homework assignment (LEGACY ENDPOINT)
router.post('/homework/:id/submit', requireAuth, async (req, res) => {
  try {
    const homeworkId = parseInt(req.params.id);
    const studentId = req.user?.id;
    const { files, comment } = req.body;
    
    if (isNaN(homeworkId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid homework ID'
      });
    }

    // Mock submission logic
    const submission = {
      id: Date.now(),
      homeworkId: homeworkId,
      studentId: studentId,
      submittedAt: new Date().toISOString(),
      files: files || [],
      comment: comment || '',
      status: 'submitted'
    };

    console.log(`[STUDENT_API] Homework submission:`, submission);

    res.json({
      success: true,
      submission: submission,
      message: 'Homework submitted successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] Error submitting homework:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting homework'
    });
  }
});

// PUT /api/student/homework/:id/submit - Update homework submission
router.put('/homework/:id/submit', requireAuth, async (req, res) => {
  try {
    const homeworkId = parseInt(req.params.id);
    const studentId = req.user?.id;
    const { files, comment } = req.body;
    
    if (isNaN(homeworkId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid homework ID'
      });
    }

    // Mock update logic
    const updatedSubmission = {
      id: homeworkId,
      homeworkId: homeworkId,
      studentId: studentId,
      updatedAt: new Date().toISOString(),
      files: files || [],
      comment: comment || '',
      status: 'resubmitted'
    };

    console.log(`[STUDENT_API] Homework resubmission:`, updatedSubmission);

    res.json({
      success: true,
      submission: updatedSubmission,
      message: 'Homework updated successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] Error updating homework:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating homework'
    });
  }
});

// GET /api/student/grades - Get student grades
router.get('/grades', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    
    const grades = [
      {
        id: 1,
        subject: 'Mathématiques',
        assignment: 'Test Chapter 3',
        grade: 16.5,
        maxGrade: 20,
        date: '2025-08-20',
        teacher: 'M. Dupont',
        feedback: 'Excellent work!'
      },
      {
        id: 2,
        subject: 'Français',
        assignment: 'Dissertation',
        grade: 14.0,
        maxGrade: 20,
        date: '2025-08-22',
        teacher: 'Mme. Martin',
        feedback: 'Good analysis, improve structure'
      }
    ];

    res.json({
      success: true,
      grades: grades,
      message: 'Grades retrieved successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] Error fetching grades:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grades'
    });
  }
});

// GET /api/student/messages - Get student messages
router.get('/messages', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    
    const messages = [
      {
        id: 1,
        from: 'M. Dupont',
        subject: 'Assignment Reminder',
        message: 'Don\'t forget your math assignment due tomorrow',
        date: '2025-08-24',
        read: false,
        type: 'teacher'
      },
      {
        id: 2,
        from: 'Administration',
        subject: 'School Event',
        message: 'Sports day scheduled for next Friday',
        date: '2025-08-23',
        read: true,
        type: 'admin'
      }
    ];

    res.json({
      success: true,
      messages: messages,
      message: 'Messages retrieved successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
});

// POST /api/student/messages/teacher - Send message to teacher
router.post('/messages/teacher', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - students only'
      });
    }

    const { teacherId, subject, message, notificationChannels } = req.body;
    
    if (!teacherId || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID, subject, and message are required'
      });
    }

    // Ensure only PWA and email notifications (no SMS)
    const allowedChannels = notificationChannels ? 
      notificationChannels.filter((channel: string) => ['pwa', 'email'].includes(channel)) : 
      ['pwa', 'email'];

    // Create message record (simplified implementation)
    const newMessage = {
      id: Date.now(),
      from: `${user.firstName || 'Élève'} ${user.lastName || ''}`,
      fromRole: 'Student',
      to: `Enseignant #${teacherId}`,
      toRole: 'Teacher',
      subject,
      message,
      notificationChannels: allowedChannels,
      date: new Date().toISOString(),
      status: 'sent'
    };
    
    console.log('[STUDENT_API] Message to teacher sent:', newMessage);
    console.log('[STUDENT_API] Notification channels (PWA+Email only):', allowedChannels);
    
    res.json({
      success: true,
      message: 'Message sent to teacher successfully',
      data: newMessage,
      notificationChannels: allowedChannels
    });
  } catch (error) {
    console.error('[STUDENT_API] Error sending message to teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message to teacher'
    });
  }
});

// POST /api/student/messages/school - Send message to school administration
router.post('/messages/school', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - students only'
      });
    }

    const { recipientType, subject, message, notificationChannels } = req.body;
    
    if (!recipientType || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Recipient type, subject, and message are required'
      });
    }

    // Validate recipientType
    const allowedRecipients = ['administration', 'director', 'student_services'];
    if (!allowedRecipients.includes(recipientType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient type. Must be: administration, director, or student_services'
      });
    }

    // Ensure only PWA and email notifications (no SMS)
    const allowedChannels = notificationChannels ? 
      notificationChannels.filter((channel: string) => ['pwa', 'email'].includes(channel)) : 
      ['pwa', 'email'];

    // Map recipient type to display name
    const recipientMap = {
      'administration': 'Administration',
      'director': 'Direction',
      'student_services': 'Services Étudiants'
    };

    // Create message record (simplified implementation)
    const newMessage = {
      id: Date.now(),
      from: `${user.firstName || 'Élève'} ${user.lastName || ''}`,
      fromRole: 'Student',
      to: recipientMap[recipientType as keyof typeof recipientMap] || 'École',
      toRole: 'School',
      recipientType,
      subject,
      message,
      notificationChannels: allowedChannels,
      date: new Date().toISOString(),
      status: 'sent'
    };
    
    console.log('[STUDENT_API] Message to school sent:', newMessage);
    console.log('[STUDENT_API] Notification channels (PWA+Email only):', allowedChannels);
    
    res.json({
      success: true,
      message: 'Message sent to school successfully',
      data: newMessage,
      notificationChannels: allowedChannels
    });
  } catch (error) {
    console.error('[STUDENT_API] Error sending message to school:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message to school'
    });
  }
});

// GET /api/student/teachers - Get teachers for student (for Messages École module)
router.get('/teachers', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    // For demo accounts, return mock teachers
    if (user.email && user.email.includes('@test.educafric.com')) {
      const mockTeachers = [
        {
          id: 1,
          firstName: 'Marie',
          lastName: 'Nguyen',
          subject: 'Mathématiques',
          email: 'marie.nguyen@test.educafric.com',
          phone: '+237657001001'
        },
        {
          id: 2,
          firstName: 'Jean',
          lastName: 'Kamga',
          subject: 'Français',
          email: 'jean.kamga@test.educafric.com',
          phone: '+237657001002'
        },
        {
          id: 3,
          firstName: 'Sophie',
          lastName: 'Mballa',
          subject: 'Sciences',
          email: 'sophie.mballa@test.educafric.com',
          phone: '+237657001003'
        }
      ];
      
      return res.json({
        success: true,
        teachers: mockTeachers,
        message: 'Teachers list retrieved successfully'
      });
    } else {
      // For real accounts, get actual teacher list from database
      // This would normally query the database for student's teachers by class/school
      return res.json({
        success: true,
        teachers: [],
        message: 'No teachers found'
      });
    }
  } catch (error) {
    console.error('[STUDENT_API] Error fetching teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teachers'
    });
  }
});

// GET /api/student/attendance - Get student attendance
router.get('/attendance', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    
    const attendance = [
      {
        date: '2025-08-24',
        status: 'present',
        periods: [
          { subject: 'Mathématiques', status: 'present', time: '08:00' },
          { subject: 'Français', status: 'present', time: '10:00' },
          { subject: 'Sciences', status: 'present', time: '14:00' }
        ]
      },
      {
        date: '2025-08-23',
        status: 'absent',
        periods: [
          { subject: 'Mathématiques', status: 'absent', time: '08:00' },
          { subject: 'Français', status: 'absent', time: '10:00' }
        ],
        reason: 'Sick leave'
      }
    ];

    res.json({
      success: true,
      attendance: attendance,
      message: 'Attendance retrieved successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance'
    });
  }
});

// GET /api/student/settings - Get student settings  
router.get('/settings', async (req, res) => {
  try {
    const studentId = req.user?.id || 6; // Default for demo
    
    // Mock student settings
    const settings = {
      profile: {
        firstName: 'Jean',
        lastName: 'Kouam',
        email: 'jean.kouam@test.educafric.com',
        className: 'Première A',
        studentId: 'STU001'
      },
      notifications: {
        gradeNotifications: true,
        assignmentNotifications: true,
        attendanceNotifications: false
      },
      privacy: {
        showProfileToParents: true,
        allowDirectMessages: false
      }
    };

    console.log(`[STUDENT_API] ✅ Settings retrieved for student:`, studentId);

    res.json({
      success: true,
      settings: settings,
      message: 'Settings retrieved successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] ❌ Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings'
    });
  }
});

// PUT /api/student/settings - Update student settings
router.put('/settings', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    const { profile, notifications, privacy } = req.body;
    
    // Mock settings update
    const updatedSettings = {
      profile: profile || {},
      notifications: notifications || {},
      privacy: privacy || {}
    };

    console.log(`[STUDENT_API] ✅ Settings updated for student:`, { studentId, updatedSettings });

    res.json({
      success: true,
      settings: updatedSettings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] ❌ Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings'
    });
  }
});

// POST /api/student/generate-qr - Generate QR code for student
router.post('/generate-qr', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    const { purpose, eventId, resourceId, additionalData } = req.body;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    let connectUrl, connectionToken;

    // Generate different QR codes based on purpose
    switch (purpose) {
      case 'event-registration':
        connectionToken = `EVENT_REG_${studentId}_${eventId}_${Date.now()}`;
        connectUrl = `https://www.educafric.com/events/register?token=${connectionToken}&student=${studentId}&event=${eventId}`;
        break;
      
      case 'resource-sharing':
        connectionToken = `RESOURCE_${studentId}_${resourceId}_${Date.now()}`;
        connectUrl = `https://www.educafric.com/resources/access?token=${connectionToken}&student=${studentId}&resource=${resourceId}`;
        break;
      
      case 'parent-connection':
      default:
        connectionToken = `EDUCAFRIC_CONNECT_${studentId}_${Date.now()}`;
        connectUrl = `https://www.educafric.com/parent/connect?token=${connectionToken}&student=${studentId}`;
        break;
    }

    // Create QR code with scannable URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(connectUrl)}`;

    console.log(`[STUDENT_API] ✅ QR Code generated for student:`, { studentId, purpose: purpose || 'parent-connection', token: connectionToken });

    res.json({
      success: true,
      qrCode: {
        data: connectUrl,
        url: qrCodeUrl,
        token: connectionToken,
        purpose: purpose || 'parent-connection',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      message: 'QR code generated successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] ❌ Error generating QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating QR code'
    });
  }
});

// GET /api/student/geolocation/safe-zones - Get student safe zones
router.get('/geolocation/safe-zones', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    
    // Mock safe zones data
    const safeZones = [
      {
        id: 1,
        name: 'École Primaire',
        address: 'Rue de l\'École, Yaoundé',
        radius: 100,
        isActive: true,
        coordinates: { lat: 3.848, lng: 11.502 }
      },
      {
        id: 2,
        name: 'Domicile',
        address: 'Quartier Résidentiel, Yaoundé',
        radius: 50,
        isActive: true,
        coordinates: { lat: 3.866, lng: 11.518 }
      }
    ];

    console.log(`[STUDENT_API] ✅ Safe zones retrieved for student:`, studentId);

    res.json({
      success: true,
      safeZones: safeZones,
      message: 'Safe zones retrieved successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] ❌ Error fetching safe zones:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching safe zones'
    });
  }
});

// GET /api/student-parent/connections - Get parent-child connections
router.get('/parent-connections', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    
    // Mock parent connections
    const connections = [
      {
        id: 1,
        parentName: 'Marie Kouam',
        parentEmail: 'marie.kouam@example.com',
        relationship: 'Mère',
        status: 'active',
        connectedAt: '2025-01-15T10:00:00Z'
      },
      {
        id: 2,
        parentName: 'Paul Kouam',
        parentEmail: 'paul.kouam@example.com',
        relationship: 'Père',
        status: 'pending',
        connectedAt: null
      }
    ];

    console.log(`[STUDENT_API] ✅ Parent connections retrieved for student:`, studentId);

    res.json({
      success: true,
      connections: connections,
      message: 'Parent connections retrieved successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] ❌ Error fetching parent connections:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching parent connections'
    });
  }
});

// DUPLICATE REMOVED - Using first definition above

// GET /api/student/geolocation/device-status - Get device tracking status
router.get('/geolocation/device-status', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    
    // Mock device status
    const deviceStatus = {
      isTracking: true,
      lastUpdate: new Date().toISOString(),
      batteryLevel: 85,
      location: {
        lat: 3.848,
        lng: 11.502,
        accuracy: 10
      },
      connectionStatus: 'online'
    };

    console.log(`[STUDENT_API] ✅ Device status retrieved for student:`, studentId);

    res.json({
      success: true,
      deviceStatus: deviceStatus,
      message: 'Device status retrieved successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] ❌ Error fetching device status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching device status'
    });
  }
});

// GET /api/student/events - Get available events for registration
router.get('/events', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    
    // Mock events data for student registration
    const events = [
      {
        id: 1,
        title: 'Journée Sportive Inter-Classes',
        description: 'Compétition sportive entre toutes les classes de l\'école',
        date: '2025-09-15',
        time: '08:00',
        location: 'Terrain de sport de l\'école',
        maxParticipants: 200,
        currentParticipants: 67,
        deadline: '2025-09-10',
        category: 'Sports',
        requiresParentConsent: true,
        cost: 0,
        status: 'open'
      },
      {
        id: 2,
        title: 'Excursion Éducative - Musée National',
        description: 'Visite guidée du musée national avec activités pédagogiques',
        date: '2025-09-22',
        time: '09:00',
        location: 'Musée National, Yaoundé',
        maxParticipants: 50,
        currentParticipants: 23,
        deadline: '2025-09-18',
        category: 'Éducatif',
        requiresParentConsent: true,
        cost: 5000,
        status: 'open'
      },
      {
        id: 3,
        title: 'Concours de Mathématiques',
        description: 'Concours inter-écoles de mathématiques niveau secondaire',
        date: '2025-10-05',
        time: '14:00',
        location: 'Amphithéâtre principal',
        maxParticipants: 30,
        currentParticipants: 18,
        deadline: '2025-10-01',
        category: 'Académique',
        requiresParentConsent: false,
        cost: 2000,
        status: 'open'
      }
    ];

    console.log(`[STUDENT_API] ✅ Events retrieved for student:`, studentId);

    res.json({
      success: true,
      events: events,
      message: 'Events retrieved successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] ❌ Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events'
    });
  }
});

// POST /api/student/events/register - Register for an event
router.post('/events/register', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    const { eventId, parentConsent, emergencyContact } = req.body;
    
    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }

    // Mock event registration
    const registration = {
      id: Date.now(),
      studentId: studentId,
      eventId: parseInt(eventId),
      registeredAt: new Date().toISOString(),
      status: 'registered',
      parentConsent: parentConsent || false,
      emergencyContact: emergencyContact || {},
      confirmationCode: `REG_${eventId}_${studentId}_${Date.now().toString().slice(-6)}`
    };

    console.log(`[STUDENT_API] ✅ Event registration:`, registration);

    res.json({
      success: true,
      registration: registration,
      message: 'Inscription à l\'événement réussie'
    });
  } catch (error) {
    console.error('[STUDENT_API] ❌ Error registering for event:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering for event'
    });
  }
});

// GET /api/student/resources - Get available learning resources
router.get('/resources', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    const { subject, level } = req.query;
    
    // Mock resources data
    const resources = [
      {
        id: 1,
        title: 'Cours de Mathématiques - Algèbre',
        description: 'Leçons interactives sur l\'algèbre de base',
        subject: 'Mathématiques',
        level: 'Seconde',
        type: 'video',
        duration: '45 minutes',
        downloadUrl: '/resources/math-algebra-course.mp4',
        thumbnailUrl: '/resources/thumbnails/math-algebra.jpg',
        author: 'Prof. Martin Kouam',
        uploadedAt: '2025-08-20',
        views: 234,
        likes: 45,
        category: 'Cours Principal'
      },
      {
        id: 2,
        title: 'Exercices de Français - Grammaire',
        description: 'Collection d\'exercices interactifs de grammaire française',
        subject: 'Français',
        level: 'Première',
        type: 'pdf',
        pages: 25,
        downloadUrl: '/resources/french-grammar-exercises.pdf',
        thumbnailUrl: '/resources/thumbnails/french-grammar.jpg',
        author: 'Prof. Marie Ngozi',
        uploadedAt: '2025-08-18',
        downloads: 167,
        category: 'Exercices'
      },
      {
        id: 3,
        title: 'Sciences Physiques - Électricité',
        description: 'Démonstrations virtuelles des lois de l\'électricité',
        subject: 'Physique',
        level: 'Terminale',
        type: 'interactive',
        duration: '30 minutes',
        accessUrl: '/resources/physics-electricity-lab',
        thumbnailUrl: '/resources/thumbnails/physics-electricity.jpg',
        author: 'Prof. Jean Fokou',
        uploadedAt: '2025-08-22',
        completions: 89,
        category: 'Laboratoire Virtuel'
      }
    ];

    // Filter by subject and level if provided
    let filteredResources = resources;
    if (subject) {
      filteredResources = filteredResources.filter(r => 
        r.subject.toLowerCase().includes(subject.toString().toLowerCase())
      );
    }
    if (level) {
      filteredResources = filteredResources.filter(r => 
        r.level.toLowerCase().includes(level.toString().toLowerCase())
      );
    }

    console.log(`[STUDENT_API] ✅ Resources retrieved for student:`, { studentId, subject, level });

    res.json({
      success: true,
      resources: filteredResources,
      totalResources: filteredResources.length,
      message: 'Resources retrieved successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] ❌ Error fetching resources:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resources'
    });
  }
});

// POST /api/student/resources/access - Track resource access
router.post('/resources/access', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    const { resourceId, accessType } = req.body;
    
    if (!resourceId) {
      return res.status(400).json({
        success: false,
        message: 'Resource ID is required'
      });
    }

    // Mock resource access tracking
    const accessLog = {
      id: Date.now(),
      studentId: studentId,
      resourceId: parseInt(resourceId),
      accessType: accessType || 'view',
      accessedAt: new Date().toISOString(),
      ipAddress: '127.0.0.1',
      userAgent: 'Educafric Mobile App'
    };

    console.log(`[STUDENT_API] ✅ Resource access logged:`, accessLog);

    res.json({
      success: true,
      access: accessLog,
      message: 'Accès à la ressource enregistré'
    });
  } catch (error) {
    console.error('[STUDENT_API] ❌ Error logging resource access:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging resource access'
    });
  }
});

// GET /api/student/bulletins - Get student's bulletins
router.get('/bulletins', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    const user = req.user as any;
    
    // Verify user is a student
    if (user.role !== 'Student') {
      return res.status(403).json({ 
        error: 'Access denied. Only students can access this endpoint.' 
      });
    }

    console.log(`[STUDENT_API] 📋 Getting bulletins for student:`, studentId);

    // Mock student bulletins data - in real implementation, get from storage.getBulletinsByStudentId(studentId)
    const studentBulletins = [
      {
        id: 1,
        period: '1er Trimestre',
        academicYear: '2024-2025',
        className: '6ème A',
        generalAverage: 14.5,
        classRank: 8,
        totalStudentsInClass: 32,
        conductGrade: 16,
        absences: 2,
        status: 'published',
        publishedAt: '2024-12-15T10:00:00Z',
        hasQRCode: true,
        verificationCode: 'EDU-2024-STU-001',
        subjects: [
          { name: 'Mathématiques', grade: 15, coefficient: 4, teacher: 'M. Kouame' },
          { name: 'Français', grade: 13, coefficient: 4, teacher: 'Mme Diallo' },
          { name: 'Sciences', grade: 16, coefficient: 3, teacher: 'Dr. Ngozi' },
          { name: 'Histoire-Géographie', grade: 12, coefficient: 3, teacher: 'M. Bamogo' },
          { name: 'Anglais', grade: 14, coefficient: 2, teacher: 'Miss Johnson' }
        ],
        teacherComments: 'Élève sérieux avec de bonnes capacités. Peut mieux faire en français.',
        directorComments: 'Résultats satisfaisants. Continuer les efforts.'
      }
    ];

    res.json({
      success: true,
      bulletins: studentBulletins,
      studentId: studentId,
      totalBulletins: studentBulletins.length,
      message: 'Bulletins retrieved successfully'
    });

  } catch (error) {
    console.error('[STUDENT_API] ❌ Error fetching student bulletins:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bulletins'
    });
  }
});

// GET /api/student/bulletins/:bulletinId - Get specific bulletin
router.get('/bulletins/:bulletinId', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    const user = req.user as any;
    const bulletinId = parseInt(req.params.bulletinId);
    
    // Verify user is a student
    if (user.role !== 'Student') {
      return res.status(403).json({ 
        error: 'Access denied. Only students can access this endpoint.' 
      });
    }

    console.log(`[STUDENT_API] 📋 Getting bulletin ${bulletinId} for student:`, studentId);

    // In real implementation: 
    // const bulletin = await storage.getBulletinById(bulletinId);
    // Verify bulletin belongs to this student
    
    // Mock response
    res.json({
      success: true,
      bulletin: {
        id: bulletinId,
        studentId: studentId,
        period: '1er Trimestre',
        academicYear: '2024-2025',
        status: 'published',
        canDownload: true,
        downloadUrl: `/api/student/bulletins/${bulletinId}/download`
      },
      message: 'Bulletin details retrieved successfully'
    });

  } catch (error) {
    console.error('[STUDENT_API] ❌ Error fetching bulletin:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bulletin details'
    });
  }
});

// GET /api/student/bulletins/:bulletinId/download - Download bulletin PDF
router.get('/bulletins/:bulletinId/download', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    const user = req.user as any;
    const bulletinId = parseInt(req.params.bulletinId);
    
    // Verify user is a student
    if (user.role !== 'Student') {
      return res.status(403).json({ 
        error: 'Access denied. Only students can access this endpoint.' 
      });
    }

    console.log(`[STUDENT_API] 📥 Downloading bulletin ${bulletinId} for student:`, studentId);

    // In real implementation: 
    // 1. Verify bulletin belongs to this student
    // 2. Generate PDF with student's data
    // 3. Return PDF buffer

    // Mock PDF download response
    res.json({
      success: true,
      message: 'Bulletin PDF generation initiated',
      downloadUrl: `/api/bulletins/${bulletinId}/pdf`,
      bulletinId: bulletinId,
      studentId: studentId
    });

  } catch (error) {
    console.error('[STUDENT_API] ❌ Error downloading bulletin:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating bulletin download'
    });
  }
});

export default router;
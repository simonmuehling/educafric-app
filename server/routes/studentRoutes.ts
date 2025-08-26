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
router.get('/settings', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    
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
    const { purpose } = req.body;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    // Generate QR code data
    const qrData = {
      studentId: studentId,
      purpose: purpose || 'parent-connection',
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    // For demo purposes, create a simple QR code representation
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(qrData))}`;

    console.log(`[STUDENT_API] ✅ QR Code generated for student:`, { studentId, purpose: qrData.purpose });

    res.json({
      success: true,
      qrCode: {
        data: qrData,
        url: qrCodeUrl,
        expires: qrData.expiresAt
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

// GET /api/student/settings - Get student settings
router.get('/settings', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    
    // Mock student settings
    const settings = {
      profile: {
        firstName: 'Jean',
        lastName: 'Kouam',
        email: 'student.demo@test.educafric.com',
        className: '6ème A',
        studentId: 'STU-2025-001'
      },
      notifications: {
        gradeNotifications: true,
        assignmentNotifications: true,
        attendanceNotifications: false
      },
      privacy: {
        profileVisibility: 'school_only',
        allowParentTracking: true
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

export default router;
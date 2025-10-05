import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const router = Router();

// Configuration multer pour upload de fichiers
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'educational-content');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Allow common educational file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 'text/html',
      'video/mp4', 'audio/mpeg', 'audio/wav'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`));
    }
  }
});

// Create educational content
router.post('/', requireAuth, upload.array('files', 10), async (req, res) => {
  try {
    const { content } = req.body;
    const files = req.files as Express.Multer.File[];
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content data is required'
      });
    }

    const contentData = JSON.parse(content);
    const user = (req as any).user;

    // Validate required fields
    if (!contentData.title || !contentData.description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    // Process uploaded files
    const fileUrls = files ? files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/educational-content/${file.filename}`
    })) : [];

    // Create educational content record
    const educationalContent = {
      id: Date.now(), // Temporary ID generation
      title: contentData.title,
      description: contentData.description,
      type: contentData.type || 'lesson',
      subject: contentData.subject,
      level: contentData.level,
      duration: contentData.duration || 60,
      objectives: contentData.objectives || '',
      prerequisites: contentData.prerequisites || '',
      teacherId: user.id,
      teacherName: user.firstName + ' ' + user.lastName,
      schoolId: user.schoolId,
      files: fileUrls,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      visibility: 'school', // school, public, private
      downloadCount: 0,
      rating: 0,
      tags: contentData.tags || []
    };

    // In a real implementation, save to database
    console.log('[EDUCATIONAL_CONTENT] Content created:', {
      id: educationalContent.id,
      title: educationalContent.title,
      teacher: educationalContent.teacherName,
      school: educationalContent.schoolId,
      filesCount: fileUrls.length
    });

    res.json({
      success: true,
      message: 'Educational content created successfully',
      content: educationalContent
    });

  } catch (error) {
    console.error('[EDUCATIONAL_CONTENT] Creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create educational content',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get educational content
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { type, subject, level, teacherId } = req.query;

    // Mock data for demonstration
    const mockContent = [
      {
        id: 1,
        title: "Introduction aux Fractions",
        description: "Cours complet sur les fractions pour les élèves de 6ème",
        type: "lesson",
        subject: "mathematiques",
        level: "6eme",
        duration: 45,
        objectives: "Comprendre le concept de fraction, savoir lire et écrire des fractions simples",
        prerequisites: "Connaissance des nombres entiers",
        teacherId: user.id,
        teacherName: user.firstName + ' ' + user.lastName,
        schoolId: user.schoolId,
        files: [
          { filename: "fractions-intro.pdf", originalName: "Introduction aux fractions.pdf", url: "/uploads/educational-content/fractions-intro.pdf" }
        ],
        status: "published",
        createdAt: "2025-08-20T10:00:00Z",
        updatedAt: "2025-08-20T10:00:00Z",
        visibility: "school",
        downloadCount: 15,
        rating: 4.5,
        tags: ["mathematiques", "fractions", "6eme"]
      },
      {
        id: 2,
        title: "Exercices sur les Verbes",
        description: "Série d'exercices sur la conjugaison des verbes du 1er groupe",
        type: "exercise",
        subject: "francais",
        level: "5eme",
        duration: 30,
        objectives: "Maîtriser la conjugaison des verbes du 1er groupe au présent",
        prerequisites: "Connaissance des pronoms personnels",
        teacherId: user.id,
        teacherName: user.firstName + ' ' + user.lastName,
        schoolId: user.schoolId,
        files: [],
        status: "draft",
        createdAt: "2025-08-22T14:30:00Z",
        updatedAt: "2025-08-22T14:30:00Z",
        visibility: "school",
        downloadCount: 3,
        rating: 0,
        tags: ["francais", "conjugaison", "verbes"]
      }
    ];

    // Filter content based on query parameters
    let filteredContent = mockContent;
    
    if (type) filteredContent = filteredContent.filter(c => c.type === type);
    if (subject) filteredContent = filteredContent.filter(c => c.subject === subject);
    if (level) filteredContent = filteredContent.filter(c => c.level === level);
    if (teacherId) filteredContent = filteredContent.filter(c => c.teacherId.toString() === teacherId);

    res.json({
      success: true,
      content: filteredContent,
      total: filteredContent.length
    });

  } catch (error) {
    console.error('[EDUCATIONAL_CONTENT] Fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch educational content'
    });
  }
});

// Get specific educational content
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    // Mock response for specific content
    const mockContent = {
      id: parseInt(id),
      title: "Introduction aux Fractions",
      description: "Cours complet sur les fractions pour les élèves de 6ème",
      type: "lesson",
      subject: "mathematiques",
      level: "6eme",
      duration: 45,
      objectives: "Comprendre le concept de fraction, savoir lire et écrire des fractions simples",
      prerequisites: "Connaissance des nombres entiers",
      teacherId: user.id,
      teacherName: user.firstName + ' ' + user.lastName,
      schoolId: user.schoolId,
      files: [
        { filename: "fractions-intro.pdf", originalName: "Introduction aux fractions.pdf", url: "/uploads/educational-content/fractions-intro.pdf" }
      ],
      status: "published",
      createdAt: "2025-08-20T10:00:00Z",
      updatedAt: "2025-08-20T10:00:00Z",
      visibility: "school",
      downloadCount: 15,
      rating: 4.5,
      tags: ["mathematiques", "fractions", "6eme"]
    };

    res.json({
      success: true,
      content: mockContent
    });

  } catch (error) {
    console.error('[EDUCATIONAL_CONTENT] Fetch specific error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch educational content'
    });
  }
});

// Share educational content with other teachers
router.post('/:id/share', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { targetTeachers, shareWithSchool } = req.body;
    const user = (req as any).user;

    // Verify user owns this content or has permission to share
    if (user.role !== 'Teacher' && user.role !== 'Director') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers and directors can share content'
      });
    }

    console.log(`[EDUCATIONAL_CONTENT] Sharing content ${id} by ${user.firstName} ${user.lastName}`);

    // Mock sharing logic - in production, update database sharing permissions
    const sharingRecord = {
      contentId: parseInt(id),
      sharedBy: user.id,
      sharedByName: `${user.firstName} ${user.lastName}`,
      targetTeachers: targetTeachers || [],
      shareWithSchool: shareWithSchool || false,
      sharedAt: new Date().toISOString(),
      schoolId: user.schoolId
    };

    res.json({
      success: true,
      message: 'Content shared successfully',
      sharing: sharingRecord
    });

  } catch (error) {
    console.error('[EDUCATIONAL_CONTENT] Share error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share educational content'
    });
  }
});

// Get shared content for a teacher
router.get('/shared', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;

    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can access shared content'
      });
    }

    // Mock shared content - in production, query database for content shared with this teacher
    const sharedContent = [
      {
        id: 3,
        title: "Equations du Premier Degré",
        description: "Cours complet sur la résolution d'équations simples",
        type: "lesson",
        subject: "mathematiques",
        level: "4eme",
        duration: 50,
        objectives: "Résoudre des équations du premier degré à une inconnue",
        teacherId: 999,
        teacherName: "Marie Dubois",
        schoolId: user.schoolId,
        files: [
          { filename: "equations.pdf", originalName: "Equations.pdf", url: "/uploads/educational-content/equations.pdf" }
        ],
        status: "published",
        sharedAt: "2025-09-01T09:00:00Z",
        sharedBy: "Marie Dubois",
        visibility: "school",
        downloadCount: 8,
        rating: 4.8,
        tags: ["mathematiques", "equations", "4eme"]
      },
      {
        id: 4,
        title: "Analyse de Texte Littéraire",
        description: "Méthode d'analyse pour les textes de Maupassant",
        type: "exercise",
        subject: "francais",
        level: "3eme",
        duration: 45,
        objectives: "Analyser un texte littéraire en identifiant les procédés stylistiques",
        teacherId: 998,
        teacherName: "Jean Martin",
        schoolId: user.schoolId,
        files: [],
        status: "published", 
        sharedAt: "2025-09-02T14:30:00Z",
        sharedBy: "Jean Martin",
        visibility: "school",
        downloadCount: 12,
        rating: 4.3,
        tags: ["francais", "litterature", "analyse"]
      }
    ];

    res.json({
      success: true,
      sharedContent,
      total: sharedContent.length
    });

  } catch (error) {
    console.error('[EDUCATIONAL_CONTENT] Fetch shared error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shared content'
    });
  }
});

// Submit content for director approval
router.post('/:id/submit-for-approval', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can submit content for approval'
      });
    }

    console.log(`[EDUCATIONAL_CONTENT] Teacher ${user.id} submitting content ${id} for approval`);

    // Mock approval submission - in production, update content status and notify directors
    const submissionRecord = {
      contentId: parseInt(id),
      teacherId: user.id,
      teacherName: `${user.firstName} ${user.lastName}`,
      submittedAt: new Date().toISOString(),
      status: 'pending_approval',
      schoolId: user.schoolId
    };

    res.json({
      success: true,
      message: 'Content submitted for director approval',
      submission: submissionRecord
    });

  } catch (error) {
    console.error('[EDUCATIONAL_CONTENT] Submit approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit content for approval'
    });
  }
});

// Director: Get content pending approval
router.get('/pending-approval', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;

    if (user.role !== 'Director' && user.role !== 'SiteAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Only directors can view pending content'
      });
    }

    // Mock pending content - in production, query database for content awaiting approval
    const pendingContent = [
      {
        id: 5,
        title: "Introduction à la Chimie",
        description: "Premiers concepts de chimie pour élèves de seconde",
        type: "lesson",
        subject: "physique",
        level: "2nde",
        duration: 60,
        objectives: "Comprendre les concepts de base de la chimie",
        teacherId: 123,
        teacherName: "Sophie Bernard",
        schoolId: user.schoolId,
        files: [
          { filename: "chimie-intro.pdf", originalName: "Introduction Chimie.pdf" }
        ],
        status: "pending_approval",
        submittedAt: "2025-09-04T10:15:00Z",
        visibility: "school",
        tags: ["chimie", "sciences", "2nde"]
      },
      {
        id: 6,
        title: "Exercices de Géométrie",
        description: "Série d'exercices sur les triangles et parallélogrammes",
        type: "exercise",
        subject: "mathematiques",
        level: "5eme",
        duration: 40,
        objectives: "Maîtriser les propriétés des figures géométriques",
        teacherId: 124,
        teacherName: "Paul Legrand",
        schoolId: user.schoolId,
        files: [],
        status: "pending_approval",
        submittedAt: "2025-09-04T15:30:00Z",
        visibility: "school",
        tags: ["geometrie", "mathematiques", "5eme"]
      }
    ];

    res.json({
      success: true,
      pendingContent,
      total: pendingContent.length
    });

  } catch (error) {
    console.error('[EDUCATIONAL_CONTENT] Fetch pending error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending content'
    });
  }
});

// Director: Approve/reject content
router.post('/:id/approve', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, comment } = req.body;
    const user = (req as any).user;

    if (user.role !== 'Director' && user.role !== 'SiteAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Only directors can approve content'
      });
    }

    console.log(`[EDUCATIONAL_CONTENT] Director ${user.id} ${approved ? 'approving' : 'rejecting'} content ${id}`);

    // Mock approval logic - in production, update content status and notify teacher
    const approvalRecord = {
      contentId: parseInt(id),
      directorId: user.id,
      directorName: `${user.firstName} ${user.lastName}`,
      approved: approved,
      comment: comment || '',
      reviewedAt: new Date().toISOString(),
      newStatus: approved ? 'approved' : 'rejected',
      schoolId: user.schoolId
    };

    res.json({
      success: true,
      message: `Content ${approved ? 'approved' : 'rejected'} successfully`,
      approval: approvalRecord
    });

  } catch (error) {
    console.error('[EDUCATIONAL_CONTENT] Approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process content approval'
    });
  }
});

// Get content statistics for school
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;

    // Mock statistics - in production, aggregate from database
    const stats = {
      totalContent: 47,
      pendingApproval: 3,
      approved: 38,
      rejected: 2,
      shared: 24,
      bySubject: {
        mathematiques: 12,
        francais: 10,
        anglais: 8,
        sciences: 7,
        histoire: 5,
        autres: 5
      },
      byType: {
        lesson: 22,
        exercise: 15,
        assessment: 6,
        project: 4
      },
      topContributors: [
        { teacherId: 123, teacherName: "Marie Dubois", contentCount: 8 },
        { teacherId: 124, teacherName: "Jean Martin", contentCount: 6 },
        { teacherId: 125, teacherName: "Sophie Bernard", contentCount: 5 }
      ]
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('[EDUCATIONAL_CONTENT] Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content statistics'
    });
  }
});

export default router;
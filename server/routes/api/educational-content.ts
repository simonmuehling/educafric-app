import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { db } from '../../db';
import { educationalContent, users, subjects } from '@shared/schema';
import { eq, and, desc, or, sql } from 'drizzle-orm';

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

    // Insert into database
    const insertData: typeof educationalContent.$inferInsert = {
      title: contentData.title,
      description: contentData.description || null,
      type: contentData.type || 'lesson',
      subjectId: contentData.subjectId || null,
      level: contentData.level || null,
      duration: contentData.duration || 60,
      objectives: contentData.objectives || null,
      prerequisites: contentData.prerequisites || null,
      teacherId: user.id,
      schoolId: user.schoolId,
      files: fileUrls,
      status: 'draft',
      visibility: 'school',
      downloadCount: 0,
      tags: contentData.tags || []
    };

    const [newContent] = await db.insert(educationalContent).values(insertData).returning();

    console.log('[EDUCATIONAL_CONTENT] ✅ Content created in database:', {
      id: newContent.id,
      title: newContent.title,
      teacherId: newContent.teacherId,
      schoolId: newContent.schoolId,
      filesCount: fileUrls.length
    });

    res.json({
      success: true,
      message: 'Educational content created successfully',
      content: {
        ...newContent,
        teacherName: user.firstName + ' ' + user.lastName
      }
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
    const { type, subject, level, teacherId: queryTeacherId } = req.query;

    console.log('[EDUCATIONAL_CONTENT] Fetching content for user:', user.id, 'school:', user.schoolId);

    // Build query conditions - show content from teacher's school OR shared with their school
    const conditions = [
      eq(educationalContent.schoolId, user.schoolId)
    ];

    // Query database with optional filters
    let query = db
      .select({
        id: educationalContent.id,
        title: educationalContent.title,
        description: educationalContent.description,
        type: educationalContent.type,
        subjectId: educationalContent.subjectId,
        level: educationalContent.level,
        duration: educationalContent.duration,
        objectives: educationalContent.objectives,
        prerequisites: educationalContent.prerequisites,
        teacherId: educationalContent.teacherId,
        schoolId: educationalContent.schoolId,
        files: educationalContent.files,
        status: educationalContent.status,
        visibility: educationalContent.visibility,
        downloadCount: educationalContent.downloadCount,
        rating: educationalContent.rating,
        tags: educationalContent.tags,
        createdAt: educationalContent.createdAt,
        updatedAt: educationalContent.updatedAt,
        teacherFirstName: users.firstName,
        teacherLastName: users.lastName,
        subjectName: subjects.nameFr
      })
      .from(educationalContent)
      .leftJoin(users, eq(educationalContent.teacherId, users.id))
      .leftJoin(subjects, eq(educationalContent.subjectId, subjects.id))
      .where(eq(educationalContent.schoolId, user.schoolId))
      .orderBy(desc(educationalContent.createdAt));

    const content = await query;

    // Apply filters in JavaScript for more flexibility
    let filteredContent = content;
    
    if (type) {
      filteredContent = filteredContent.filter(c => c.type === type);
    }
    if (level) {
      filteredContent = filteredContent.filter(c => c.level === level);
    }
    if (queryTeacherId) {
      filteredContent = filteredContent.filter(c => c.teacherId?.toString() === queryTeacherId);
    }

    // Format response
    const formattedContent = filteredContent.map(c => ({
      ...c,
      teacherName: c.teacherFirstName && c.teacherLastName 
        ? `${c.teacherFirstName} ${c.teacherLastName}` 
        : 'Unknown Teacher',
      subject: c.subjectName || 'General'
    }));

    console.log('[EDUCATIONAL_CONTENT] ✅ Found', formattedContent.length, 'content items');

    res.json({
      success: true,
      content: formattedContent,
      total: formattedContent.length
    });

  } catch (error) {
    console.error('[EDUCATIONAL_CONTENT] Fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch educational content'
    });
  }
});

// Get shared educational content from colleagues
router.get('/shared', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;

    console.log('[EDUCATIONAL_CONTENT] Fetching shared content for school:', user.schoolId);

    // Query database for content shared within the school (not by current user)
    const sharedContentQuery = await db
      .select({
        id: educationalContent.id,
        title: educationalContent.title,
        description: educationalContent.description,
        type: educationalContent.type,
        subjectId: educationalContent.subjectId,
        level: educationalContent.level,
        duration: educationalContent.duration,
        objectives: educationalContent.objectives,
        teacherId: educationalContent.teacherId,
        schoolId: educationalContent.schoolId,
        files: educationalContent.files,
        status: educationalContent.status,
        visibility: educationalContent.visibility,
        downloadCount: educationalContent.downloadCount,
        rating: educationalContent.rating,
        createdAt: educationalContent.createdAt,
        teacherFirstName: users.firstName,
        teacherLastName: users.lastName,
        subjectName: subjects.nameFr
      })
      .from(educationalContent)
      .leftJoin(users, eq(educationalContent.teacherId, users.id))
      .leftJoin(subjects, eq(educationalContent.subjectId, subjects.id))
      .where(
        and(
          eq(educationalContent.schoolId, user.schoolId),
          sql`${educationalContent.teacherId} != ${user.id}`,
          or(
            eq(educationalContent.visibility, 'school'),
            eq(educationalContent.visibility, 'public')
          )
        )
      )
      .orderBy(desc(educationalContent.createdAt));

    const formattedContent = sharedContentQuery.map(c => ({
      ...c,
      teacherName: c.teacherFirstName && c.teacherLastName 
        ? `${c.teacherFirstName} ${c.teacherLastName}` 
        : 'Enseignant',
      subject: c.subjectName || 'Général'
    }));

    console.log('[EDUCATIONAL_CONTENT] ✅ Found', formattedContent.length, 'shared content items');

    res.json({
      success: true,
      content: formattedContent,
      total: formattedContent.length
    });

  } catch (error) {
    console.error('[EDUCATIONAL_CONTENT] Shared content fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shared content',
      content: []
    });
  }
});

// Get templates
router.get('/templates', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;

    console.log('[EDUCATIONAL_CONTENT] Fetching templates');

    // Query for content marked as templates (high download count or marked as template)
    const templatesQuery = await db
      .select({
        id: educationalContent.id,
        title: educationalContent.title,
        description: educationalContent.description,
        type: educationalContent.type,
        downloadCount: educationalContent.downloadCount,
        rating: educationalContent.rating
      })
      .from(educationalContent)
      .where(
        or(
          eq(educationalContent.visibility, 'public'),
          sql`${educationalContent.downloadCount} >= 10`
        )
      )
      .orderBy(desc(educationalContent.downloadCount))
      .limit(10);

    console.log('[EDUCATIONAL_CONTENT] ✅ Found', templatesQuery.length, 'templates');

    res.json({
      success: true,
      templates: templatesQuery
    });

  } catch (error) {
    console.error('[EDUCATIONAL_CONTENT] Templates fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      templates: []
    });
  }
});

// Get specific educational content
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const contentId = parseInt(id);

    if (isNaN(contentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content ID'
      });
    }

    // Query database for specific content
    const [content] = await db
      .select({
        id: educationalContent.id,
        title: educationalContent.title,
        description: educationalContent.description,
        type: educationalContent.type,
        subjectId: educationalContent.subjectId,
        level: educationalContent.level,
        duration: educationalContent.duration,
        objectives: educationalContent.objectives,
        prerequisites: educationalContent.prerequisites,
        teacherId: educationalContent.teacherId,
        schoolId: educationalContent.schoolId,
        files: educationalContent.files,
        status: educationalContent.status,
        visibility: educationalContent.visibility,
        downloadCount: educationalContent.downloadCount,
        rating: educationalContent.rating,
        tags: educationalContent.tags,
        createdAt: educationalContent.createdAt,
        updatedAt: educationalContent.updatedAt,
        teacherFirstName: users.firstName,
        teacherLastName: users.lastName,
        subjectName: subjects.nameFr
      })
      .from(educationalContent)
      .leftJoin(users, eq(educationalContent.teacherId, users.id))
      .leftJoin(subjects, eq(educationalContent.subjectId, subjects.id))
      .where(eq(educationalContent.id, contentId))
      .limit(1);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Check access: user must be from same school or content is public
    if (content.schoolId !== user.schoolId && content.visibility !== 'public') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      content: {
        ...content,
        teacherName: content.teacherFirstName && content.teacherLastName 
          ? `${content.teacherFirstName} ${content.teacherLastName}` 
          : 'Unknown Teacher',
        subject: content.subjectName || 'General'
      }
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

// ===== DIRECTOR VIEW: Get all educational content from school's teachers =====
// TODO: This module requires an educational_content table in the database schema
// Currently returns empty array for real schools, demo data only for sandbox
router.get('/school/all', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Only directors and admins can view all school content
    if (!['Director', 'Admin', 'SiteAdmin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only directors can view all school content'
      });
    }

    const schoolId = user.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School ID required'
      });
    }

    const { teacherId, subject, level, type, status } = req.query;

    console.log(`[EDUCATIONAL_CONTENT] Director viewing school content:`, {
      schoolId,
      filters: { teacherId, subject, level, type, status }
    });

    // Check if sandbox user (demo data only for sandbox accounts)
    const isSandboxUser = user.email?.includes('@test.educafric.com') ||
                          user.email?.includes('sandbox@') ||
                          user.email?.includes('.sandbox@') ||
                          user.email?.includes('demo@');

    // TODO: Replace with real database queries when educational_content table is created
    // For now, return empty array for real schools (no mock data in production)
    if (!isSandboxUser) {
      console.log(`[EDUCATIONAL_CONTENT] Real school ${schoolId} - returning empty (no DB table yet)`);
      return res.json({
        success: true,
        content: [],
        total: 0,
        filters: { teacherId, subject, level, type, status },
        message: 'Educational content database table not yet implemented. Content uploaded via files only.'
      });
    }

    // Demo data for sandbox schools only
    const schoolContent = [
      {
        id: 1,
        title: "Introduction aux Fractions",
        description: "Cours complet sur les fractions pour les élèves de 6ème",
        type: "lesson",
        subject: "Mathématiques",
        subjectId: 1,
        level: "6ème",
        duration: 45,
        teacherId: 1,
        teacherName: "Marie Dubois",
        schoolId: schoolId,
        status: "published",
        visibility: "school",
        createdAt: "2025-08-20T10:00:00Z",
        submittedForApproval: true,
        approvalStatus: "approved"
      },
      {
        id: 2,
        title: "Exercices sur les Verbes",
        description: "Conjugaison des verbes du 1er groupe",
        type: "exercise",
        subject: "Français",
        subjectId: 2,
        level: "5ème",
        duration: 30,
        teacherId: 2,
        teacherName: "Jean Martin",
        schoolId: schoolId,
        status: "pending",
        visibility: "school",
        createdAt: "2025-08-25T14:00:00Z",
        submittedForApproval: true,
        approvalStatus: "pending"
      },
      {
        id: 3,
        title: "Présentation: La Révolution française",
        description: "Les causes et conséquences de la Révolution",
        type: "presentation",
        subject: "Histoire-Géographie",
        subjectId: 3,
        level: "4ème",
        duration: 60,
        teacherId: 3,
        teacherName: "Sophie Bernard",
        schoolId: schoolId,
        status: "published",
        visibility: "school",
        createdAt: "2025-08-18T09:00:00Z",
        submittedForApproval: true,
        approvalStatus: "approved"
      }
    ];

    // Filter by query params
    let filteredContent = schoolContent;

    if (teacherId) {
      filteredContent = filteredContent.filter(c => c.teacherId === parseInt(teacherId as string));
    }
    if (subject) {
      filteredContent = filteredContent.filter(c => 
        c.subject.toLowerCase().includes((subject as string).toLowerCase())
      );
    }
    if (level) {
      filteredContent = filteredContent.filter(c => 
        c.level.toLowerCase().includes((level as string).toLowerCase())
      );
    }
    if (type) {
      filteredContent = filteredContent.filter(c => c.type === type);
    }
    if (status) {
      filteredContent = filteredContent.filter(c => c.approvalStatus === status);
    }

    res.json({
      success: true,
      content: filteredContent,
      total: filteredContent.length,
      filters: { teacherId, subject, level, type, status },
      isSandboxDemo: true
    });

  } catch (error) {
    console.error('[EDUCATIONAL_CONTENT] Director view error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch school content'
    });
  }
});

// ===== DIRECTOR: Approve or reject educational content =====
// TODO: Implement persistence when educational_content table is created
router.post('/:id/review', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, feedback } = req.body; // action: 'approve' | 'reject' | 'request_changes'
    const user = (req as any).user;
    
    // Only directors can review content
    if (!['Director', 'Admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only directors can review content'
      });
    }

    // Verify schoolId is present for tenant isolation
    const schoolId = user.schoolId;
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School ID required for content review'
      });
    }

    // Validate action
    if (!['approve', 'reject', 'request_changes'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be approve, reject, or request_changes'
      });
    }

    console.log(`[EDUCATIONAL_CONTENT] Director reviewing content ${id}:`, {
      action,
      feedback,
      reviewerId: user.id,
      schoolId
    });

    // TODO: Update database when educational_content table exists
    // For now, log the action and return success
    const reviewRecord = {
      contentId: parseInt(id),
      action,
      feedback: feedback || '',
      reviewedBy: user.id,
      reviewerName: `${user.firstName} ${user.lastName}`,
      reviewedAt: new Date().toISOString(),
      schoolId,
      note: 'Review recorded - database persistence pending table creation'
    };

    res.json({
      success: true,
      message: `Content ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'returned for changes'}`,
      review: reviewRecord
    });

  } catch (error) {
    console.error('[EDUCATIONAL_CONTENT] Review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review content'
    });
  }
});

export default router;
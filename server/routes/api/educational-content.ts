import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { db } from '../../db';
import { educationalContent, users, subjects, notifications } from '@shared/schema';
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

    // Insert into database - ensure tags is properly formatted for PostgreSQL
    const tagsArray = Array.isArray(contentData.tags) && contentData.tags.length > 0 
      ? contentData.tags 
      : null;
    
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
      files: fileUrls.length > 0 ? fileUrls : null,
      status: 'draft',
      visibility: 'school',
      downloadCount: 0,
      tags: tagsArray
    };

    const [newContent] = await db.insert(educationalContent).values(insertData).returning();

    console.log('[EDUCATIONAL_CONTENT] ✅ Content created in database:', {
      id: newContent.id,
      title: newContent.title,
      teacherId: newContent.teacherId,
      schoolId: newContent.schoolId,
      filesCount: fileUrls.length
    });

    // Send notification to school director
    try {
      // Find directors of the school
      const directors = await db
        .select({ id: users.id, firstName: users.firstName, lastName: users.lastName })
        .from(users)
        .where(and(
          eq(users.schoolId, user.schoolId),
          eq(users.role, 'Director')
        ));

      const teacherName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Un enseignant';
      const contentTypeFr = contentData.type === 'lesson' ? 'une leçon' : 
                            contentData.type === 'exercise' ? 'un exercice' : 
                            contentData.type === 'assessment' ? 'une évaluation' : 'un contenu';

      // Create notification for each director
      for (const director of directors) {
        await db.insert(notifications).values({
          userId: director.id,
          title: 'Nouveau contenu pédagogique créé',
          message: `${teacherName} a créé ${contentTypeFr}: "${contentData.title}"`,
          type: 'educational_content',
          priority: 'medium',
          metadata: {
            contentId: newContent.id,
            contentType: contentData.type,
            teacherId: user.id,
            teacherName: teacherName
          },
          isRead: false
        } as any);
      }

      console.log('[EDUCATIONAL_CONTENT] 🔔 Notification sent to', directors.length, 'director(s)');
    } catch (notifError) {
      console.error('[EDUCATIONAL_CONTENT] ⚠️ Failed to send notification:', notifError);
      // Don't fail the request if notification fails
    }

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

// Update educational content
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const contentId = parseInt(id);
    const updateData = req.body;

    if (isNaN(contentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content ID'
      });
    }

    console.log('[EDUCATIONAL_CONTENT] Updating content:', contentId, 'by user:', user.id);

    // Verify user owns this content
    const [existingContent] = await db
      .select({ teacherId: educationalContent.teacherId, schoolId: educationalContent.schoolId })
      .from(educationalContent)
      .where(eq(educationalContent.id, contentId))
      .limit(1);

    if (!existingContent) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Only owner or director can update
    if (existingContent.teacherId !== user.id && user.role !== 'Director') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this content'
      });
    }

    // Update the content
    const [updatedContent] = await db
      .update(educationalContent)
      .set({
        title: updateData.title,
        description: updateData.description,
        type: updateData.type,
        level: updateData.level,
        duration: updateData.duration,
        objectives: updateData.objectives,
        prerequisites: updateData.prerequisites,
        updatedAt: new Date()
      })
      .where(eq(educationalContent.id, contentId))
      .returning();

    console.log('[EDUCATIONAL_CONTENT] ✅ Content updated successfully:', contentId);

    res.json({
      success: true,
      message: 'Content updated successfully',
      content: updatedContent
    });

  } catch (error) {
    console.error('[EDUCATIONAL_CONTENT] Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update educational content'
    });
  }
});

// Download educational content as PDF
router.get('/:id/download', requireAuth, async (req, res) => {
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

    console.log('[EDUCATIONAL_CONTENT] Downloading content:', contentId);

    // Get the content
    const [content] = await db
      .select({
        id: educationalContent.id,
        title: educationalContent.title,
        description: educationalContent.description,
        type: educationalContent.type,
        level: educationalContent.level,
        duration: educationalContent.duration,
        objectives: educationalContent.objectives,
        prerequisites: educationalContent.prerequisites,
        files: educationalContent.files,
        schoolId: educationalContent.schoolId,
        downloadCount: educationalContent.downloadCount,
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

    // Increment download count
    await db
      .update(educationalContent)
      .set({ downloadCount: (content.downloadCount || 0) + 1 })
      .where(eq(educationalContent.id, contentId));

    // Generate simple HTML content for download
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${content.title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #374151; margin-top: 30px; }
    .meta { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .meta p { margin: 5px 0; }
    .content { margin-top: 30px; }
    .footer { margin-top: 50px; border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <h1>${content.title}</h1>
  
  <div class="meta">
    <p><strong>Type:</strong> ${content.type === 'lesson' ? 'Leçon' : content.type === 'exercise' ? 'Exercice' : 'Évaluation'}</p>
    <p><strong>Matière:</strong> ${content.subjectName || 'Général'}</p>
    <p><strong>Niveau:</strong> ${content.level || 'Non spécifié'}</p>
    <p><strong>Durée:</strong> ${content.duration || 60} minutes</p>
    <p><strong>Auteur:</strong> ${content.teacherFirstName} ${content.teacherLastName}</p>
  </div>

  <div class="content">
    <h2>Description</h2>
    <p>${content.description || 'Aucune description'}</p>

    ${content.objectives ? `<h2>Objectifs Pédagogiques</h2><p>${content.objectives}</p>` : ''}
    ${content.prerequisites ? `<h2>Prérequis</h2><p>${content.prerequisites}</p>` : ''}
  </div>

  <div class="footer">
    <p>Document généré par Educafric - ${new Date().toLocaleDateString('fr-FR')}</p>
  </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${content.title.replace(/[^a-zA-Z0-9]/g, '_')}.html"`);
    res.send(htmlContent);

  } catch (error) {
    console.error('[EDUCATIONAL_CONTENT] Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download educational content'
    });
  }
});

// Copy shared content to own library
router.post('/:id/copy', requireAuth, async (req, res) => {
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

    console.log('[EDUCATIONAL_CONTENT] Copying content:', contentId, 'for user:', user.id);

    // Get the original content
    const [originalContent] = await db
      .select()
      .from(educationalContent)
      .where(eq(educationalContent.id, contentId))
      .limit(1);

    if (!originalContent) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Create a copy for the user
    const [newContent] = await db.insert(educationalContent).values({
      title: `${originalContent.title} (Copie)`,
      description: originalContent.description,
      type: originalContent.type,
      subjectId: originalContent.subjectId,
      level: originalContent.level,
      duration: originalContent.duration,
      objectives: originalContent.objectives,
      prerequisites: originalContent.prerequisites,
      teacherId: user.id,
      schoolId: user.schoolId,
      files: originalContent.files,
      status: 'draft',
      visibility: 'private',
      downloadCount: 0,
      tags: originalContent.tags
    }).returning();

    // Increment original download count
    await db
      .update(educationalContent)
      .set({ downloadCount: (originalContent.downloadCount || 0) + 1 })
      .where(eq(educationalContent.id, contentId));

    console.log('[EDUCATIONAL_CONTENT] ✅ Content copied successfully:', newContent.id);

    res.json({
      success: true,
      message: 'Content copied to your library',
      content: newContent
    });

  } catch (error) {
    console.error('[EDUCATIONAL_CONTENT] Copy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to copy educational content'
    });
  }
});

// Share educational content with other teachers
router.post('/:id/share', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { shareWithSchool } = req.body;
    const user = (req as any).user;

    // Verify user owns this content or has permission to share
    if (user.role !== 'Teacher' && user.role !== 'Director') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers and directors can share content'
      });
    }

    const contentId = parseInt(id);

    // Verify content belongs to user
    const [existingContent] = await db
      .select()
      .from(educationalContent)
      .where(and(
        eq(educationalContent.id, contentId),
        eq(educationalContent.teacherId, user.id)
      ))
      .limit(1);

    if (!existingContent) {
      return res.status(404).json({
        success: false,
        message: 'Content not found or you do not have permission to share it'
      });
    }

    console.log(`[EDUCATIONAL_CONTENT] Sharing content ${id} by ${user.firstName} ${user.lastName}`);

    // Update visibility to 'school' to share with colleagues
    await db
      .update(educationalContent)
      .set({ 
        visibility: 'school',
        updatedAt: new Date()
      })
      .where(eq(educationalContent.id, contentId));

    res.json({
      success: true,
      message: 'Content shared successfully with your school'
    });

  } catch (error) {
    console.error('[EDUCATIONAL_CONTENT] Share error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share educational content'
    });
  }
});

// Unshare educational content - stop sharing with colleagues
router.post('/:id/unshare', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    // Verify user owns this content
    if (user.role !== 'Teacher' && user.role !== 'Director') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers and directors can modify content sharing'
      });
    }

    const contentId = parseInt(id);

    // Verify content belongs to user
    const [existingContent] = await db
      .select()
      .from(educationalContent)
      .where(and(
        eq(educationalContent.id, contentId),
        eq(educationalContent.teacherId, user.id)
      ))
      .limit(1);

    if (!existingContent) {
      return res.status(404).json({
        success: false,
        message: 'Content not found or you do not have permission to modify it'
      });
    }

    console.log(`[EDUCATIONAL_CONTENT] Unsharing content ${id} by ${user.firstName} ${user.lastName}`);

    // Update visibility to 'private' to stop sharing
    await db
      .update(educationalContent)
      .set({ 
        visibility: 'private',
        updatedAt: new Date()
      })
      .where(eq(educationalContent.id, contentId));

    res.json({
      success: true,
      message: 'Content is no longer shared with your school'
    });

  } catch (error) {
    console.error('[EDUCATIONAL_CONTENT] Unshare error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop sharing educational content'
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

    // Update content status to pending_approval in database
    const [updatedContent] = await db.update(educationalContent)
      .set({ 
        status: 'pending_approval',
        updatedAt: new Date()
      })
      .where(
        and(
          eq(educationalContent.id, parseInt(id)),
          eq(educationalContent.teacherId, user.id)
        )
      )
      .returning();
    
    if (!updatedContent) {
      return res.status(404).json({
        success: false,
        message: 'Content not found or you do not have permission to submit it'
      });
    }

    // Notify directors about the submission
    const directors = await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName })
      .from(users)
      .where(
        and(
          eq(users.schoolId, user.schoolId),
          eq(users.role, 'Director')
        )
      );
    
    for (const director of directors) {
      await db.insert(notifications).values({
        userId: director.id,
        title: '📚 Nouveau contenu à approuver',
        message: `${user.firstName} ${user.lastName} a soumis "${updatedContent.title}" pour approbation`,
        type: 'educational_content',
        priority: 'normal',
        isRead: false,
        metadata: {
          contentId: updatedContent.id,
          teacherId: user.id,
          teacherName: `${user.firstName} ${user.lastName}`,
          contentTitle: updatedContent.title
        }
      } as any);
    }
    
    console.log(`[EDUCATIONAL_CONTENT] ✅ Content ${id} submitted for approval, notified ${directors.length} director(s)`);

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

    console.log(`[EDUCATIONAL_CONTENT] Director ${user.id} fetching pending content for school ${user.schoolId}`);

    // Query database for content awaiting approval from school's teachers
    const pendingContentQuery = await db
      .select({
        id: educationalContent.id,
        title: educationalContent.title,
        description: educationalContent.description,
        type: educationalContent.type,
        level: educationalContent.level,
        duration: educationalContent.duration,
        objectives: educationalContent.objectives,
        teacherId: educationalContent.teacherId,
        schoolId: educationalContent.schoolId,
        files: educationalContent.files,
        status: educationalContent.status,
        visibility: educationalContent.visibility,
        tags: educationalContent.tags,
        createdAt: educationalContent.createdAt,
        updatedAt: educationalContent.updatedAt,
        teacherFirstName: users.firstName,
        teacherLastName: users.lastName,
        subjectId: educationalContent.subjectId
      })
      .from(educationalContent)
      .leftJoin(users, eq(educationalContent.teacherId, users.id))
      .where(
        and(
          eq(educationalContent.schoolId, user.schoolId),
          eq(educationalContent.status, 'pending_approval')
        )
      )
      .orderBy(desc(educationalContent.updatedAt));

    // Get subject names
    const subjectIds = pendingContentQuery.filter(c => c.subjectId).map(c => c.subjectId as number);
    let subjectsMap = new Map<number, string>();
    
    if (subjectIds.length > 0) {
      const subjectList = await db
        .select({ id: subjects.id, name: subjects.name })
        .from(subjects)
        .where(sql`${subjects.id} IN ${subjectIds}`);
      
      for (const s of subjectList) {
        subjectsMap.set(s.id, s.name);
      }
    }

    const pendingContent = pendingContentQuery.map(content => ({
      ...content,
      teacherName: `${content.teacherFirstName || ''} ${content.teacherLastName || ''}`.trim() || 'Enseignant',
      subject: content.subjectId ? subjectsMap.get(content.subjectId) || 'General' : 'General',
      submittedAt: content.updatedAt?.toISOString() || content.createdAt?.toISOString()
    }));

    console.log(`[EDUCATIONAL_CONTENT] ✅ Found ${pendingContent.length} pending content items for school ${user.schoolId}`);

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

    const newStatus = approved ? 'approved' : 'rejected';
    
    // Update content status in database
    const [updatedContent] = await db.update(educationalContent)
      .set({ 
        status: newStatus,
        approvedBy: user.id,
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(
        and(
          eq(educationalContent.id, parseInt(id)),
          eq(educationalContent.schoolId, user.schoolId)
        )
      )
      .returning();
    
    if (!updatedContent) {
      return res.status(404).json({
        success: false,
        message: 'Content not found or you do not have permission to review it'
      });
    }

    // Notify the teacher about the decision
    await db.insert(notifications).values({
      userId: updatedContent.teacherId,
      title: approved ? '✅ Contenu approuvé' : '❌ Contenu non approuvé',
      message: approved 
        ? `Votre contenu "${updatedContent.title}" a été approuvé par le directeur${comment ? `. Commentaire: ${comment}` : ''}`
        : `Votre contenu "${updatedContent.title}" n'a pas été approuvé${comment ? `. Raison: ${comment}` : ''}`,
      type: 'educational_content',
      priority: 'normal',
      isRead: false,
      metadata: {
        contentId: updatedContent.id,
        approved,
        comment: comment || '',
        directorId: user.id,
        directorName: `${user.firstName} ${user.lastName}`
      }
    } as any);

    console.log(`[EDUCATIONAL_CONTENT] ✅ Content ${id} ${newStatus} by director ${user.id}`);

    const approvalRecord = {
      contentId: parseInt(id),
      directorId: user.id,
      directorName: `${user.firstName} ${user.lastName}`,
      approved: approved,
      comment: comment || '',
      reviewedAt: new Date().toISOString(),
      newStatus: newStatus,
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

// ===== DELETE: Delete educational content (teacher can only delete their own) =====
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const contentId = parseInt(id);

    if (isNaN(contentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content ID / ID de contenu invalide'
      });
    }

    console.log(`[EDUCATIONAL_CONTENT] DELETE request for content ${contentId} by user ${user.id}`);

    // First, verify the content exists and belongs to this teacher
    const [existingContent] = await db
      .select({
        id: educationalContent.id,
        teacherId: educationalContent.teacherId,
        schoolId: educationalContent.schoolId,
        title: educationalContent.title,
        files: educationalContent.files
      })
      .from(educationalContent)
      .where(eq(educationalContent.id, contentId))
      .limit(1);

    if (!existingContent) {
      return res.status(404).json({
        success: false,
        message: 'Content not found / Contenu introuvable'
      });
    }

    // Check ownership - teacher can only delete their own content
    // Directors/Admins can delete any content in their school
    const isOwner = existingContent.teacherId === user.id;
    const isDirectorOrAdmin = ['Director', 'Admin'].includes(user.role) && existingContent.schoolId === user.schoolId;

    if (!isOwner && !isDirectorOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own content / Vous ne pouvez supprimer que vos propres contenus'
      });
    }

    // Delete associated files from disk
    if (existingContent.files && Array.isArray(existingContent.files)) {
      for (const file of existingContent.files as any[]) {
        if (file.filename) {
          try {
            const filePath = path.join(process.cwd(), 'uploads', 'educational-content', file.filename);
            await fs.unlink(filePath);
            console.log(`[EDUCATIONAL_CONTENT] Deleted file: ${file.filename}`);
          } catch (fileError) {
            console.warn(`[EDUCATIONAL_CONTENT] Could not delete file ${file.filename}:`, fileError);
          }
        }
      }
    }

    // Delete from database
    await db.delete(educationalContent).where(eq(educationalContent.id, contentId));

    console.log(`[EDUCATIONAL_CONTENT] ✅ Content ${contentId} deleted successfully`);

    res.json({
      success: true,
      message: 'Content deleted successfully / Contenu supprimé avec succès',
      deletedId: contentId
    });

  } catch (error) {
    console.error('[EDUCATIONAL_CONTENT] Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete content / Échec de la suppression'
    });
  }
});

export default router;
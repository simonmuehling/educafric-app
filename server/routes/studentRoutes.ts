import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth';
import { storage } from '../storage';
import { db } from '../db';
import { homework, homeworkSubmissions, subjects, users, grades, userAchievements, classes, enrollments, parentStudentRelations, attendance, schools, teacherSubjectAssignments } from '../../shared/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { safeZones } from '../../shared/geolocationSchema';

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

// GET /api/student/library - Student progress/grades by subject from DATABASE
router.get('/library', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const studentId = user?.id;
    const schoolId = user?.schoolId;
    
    console.log('[STUDENT_LIBRARY] 📡 Fetching progress data from DATABASE for student:', studentId);
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required'
      });
    }
    
    // Fetch grades by subject from database
    const dbGrades = await db
      .select({
        subjectId: grades.subjectId,
        grade: grades.grade,
        subjectName: subjects.nameFr
      })
      .from(grades)
      .leftJoin(subjects, eq(grades.subjectId, subjects.id))
      .where(and(
        eq(grades.studentId, studentId),
        eq(grades.schoolId, schoolId)
      ))
      .orderBy(grades.subjectId);
    
    // Group grades by subject
    const subjectGradesMap = new Map<number, { name: string, grades: number[] }>();
    for (const g of dbGrades) {
      if (g.subjectId) {
        const existing = subjectGradesMap.get(g.subjectId);
        const gradeValue = g.grade ? parseFloat(g.grade.toString()) : 0;
        if (existing) {
          existing.grades.push(gradeValue);
        } else {
          subjectGradesMap.set(g.subjectId, {
            name: g.subjectName || 'Unknown',
            grades: [gradeValue]
          });
        }
      }
    }
    
    // Calculate averages and trends
    const libraryData = Array.from(subjectGradesMap.entries()).map(([subjectId, data]) => {
      const grades = data.grades;
      const currentGrade = grades.length > 0 ? grades[grades.length - 1] : 0;
      const previousGrade = grades.length > 1 ? grades[grades.length - 2] : currentGrade;
      const average = grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;
      
      let trend = 'stable';
      if (currentGrade > previousGrade) trend = 'up';
      else if (currentGrade < previousGrade) trend = 'down';
      
      return {
        subject: data.name,
        subjectId,
        currentGrade: parseFloat(currentGrade.toFixed(2)),
        previousGrade: parseFloat(previousGrade.toFixed(2)),
        trend,
        goal: Math.min(20, parseFloat((average + 2).toFixed(1))),
        assignments: {
          total: grades.length,
          completed: grades.length,
          average: parseFloat(average.toFixed(2))
        }
      };
    });
    
    console.log(`[STUDENT_LIBRARY] ✅ Fetched progress for ${libraryData.length} subjects from database`);

    res.json(libraryData);
  } catch (error) {
    console.error('Error fetching library data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching library data'
    });
  }
});

// GET /api/student/achievements - Student achievements from DATABASE
router.get('/achievements', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const studentId = user?.id;
    const schoolId = user?.schoolId;
    
    console.log('[STUDENT_ACHIEVEMENTS] 📡 Fetching achievements from DATABASE for student:', studentId);
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required'
      });
    }
    
    // Fetch achievements from database
    const dbAchievements = await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, studentId))
      .orderBy(desc(userAchievements.unlockedAt));
    
    // Process achievements for frontend
    const achievements = dbAchievements.map(a => ({
      id: a.id,
      title: a.achievementType || 'Achievement',
      description: a.description || 'Earned achievement',
      icon: a.badgeIcon || '🏆',
      date: a.unlockedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      points: a.pointsEarned || 0,
      category: a.category || 'general',
      isNew: a.unlockedAt && (Date.now() - new Date(a.unlockedAt).getTime()) < 7 * 24 * 60 * 60 * 1000
    }));
    
    console.log(`[STUDENT_ACHIEVEMENTS] ✅ Fetched ${achievements.length} achievements from database`);

    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching achievements'
    });
  }
});

// GET /api/student/homework - Get student homework assignments from DATABASE
router.get('/homework', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const studentId = user?.id;
    const schoolId = user?.schoolId;
    
    console.log('[STUDENT_HOMEWORK] 📡 Fetching homework from DATABASE for student:', studentId);
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required'
      });
    }
    
    // Get student's classId from enrollments (join with classes to verify schoolId)
    const studentRecord = await db
      .select({ classId: enrollments.classId })
      .from(enrollments)
      .leftJoin(classes, eq(enrollments.classId, classes.id))
      .where(and(
        eq(enrollments.studentId, studentId),
        eq(enrollments.status, 'active'),
        eq(classes.schoolId, schoolId)
      ))
      .limit(1);
    
    const studentClassId = studentRecord.length > 0 ? studentRecord[0].classId : null;
    
    // Build conditions for homework query
    const conditions = [eq(homework.schoolId, schoolId)];
    if (studentClassId) {
      conditions.push(eq(homework.classId, studentClassId));
    }
    
    // Fetch homework from database with teacher and subject info
    const dbHomework = await db
      .select({
        id: homework.id,
        title: homework.title,
        description: homework.description,
        dueDate: homework.dueDate,
        subjectId: homework.subjectId,
        teacherId: homework.teacherId,
        classId: homework.classId,
        attachments: homework.attachments,
        priority: homework.priority,
        createdAt: homework.createdAt,
        subjectName: subjects.nameFr,
        teacherFirstName: users.firstName,
        teacherLastName: users.lastName
      })
      .from(homework)
      .leftJoin(subjects, eq(homework.subjectId, subjects.id))
      .leftJoin(users, eq(homework.teacherId, users.id))
      .where(and(...conditions))
      .orderBy(desc(homework.dueDate))
      .limit(50);
    
    // Get student's submissions for these homework assignments
    const homeworkIds = dbHomework.map(h => h.id);
    let submissions: any[] = [];
    if (homeworkIds.length > 0) {
      submissions = await db
        .select()
        .from(homeworkSubmissions)
        .where(and(
          eq(homeworkSubmissions.studentId, studentId),
          eq(homeworkSubmissions.homeworkId, homeworkIds[0]) // TODO: Use inArray when needed
        ));
    }
    
    const submissionMap = new Map(submissions.map(s => [s.homeworkId, s]));
    
    // Process homework for frontend
    const processedHomework = dbHomework.map(h => {
      const submission = submissionMap.get(h.id);
      const teacherName = h.teacherFirstName && h.teacherLastName
        ? `${h.teacherFirstName} ${h.teacherLastName}`
        : 'Unknown Teacher';
      
      let status = 'pending';
      if (submission) {
        status = submission.grade ? 'graded' : 'submitted';
      } else if (h.dueDate && new Date(h.dueDate) < new Date()) {
        status = 'overdue';
      }
      
      return {
        id: h.id,
        title: h.title || 'Untitled',
        subject: h.subjectName || 'Unknown',
        teacher: teacherName,
        dueDate: h.dueDate?.toISOString().split('T')[0] || null,
        status: status,
        priority: h.priority || 'medium',
        description: h.description || '',
        attachments: h.attachments || [],
        submittedAt: submission?.submittedAt?.toISOString() || null,
        submissionFiles: submission?.files || [],
        grade: submission?.grade || null,
        feedback: submission?.feedback || null
      };
    });
    
    console.log(`[STUDENT_HOMEWORK] ✅ Fetched ${processedHomework.length} homework assignments from database`);

    res.json(processedHomework);
  } catch (error) {
    console.error('[STUDENT_API] Error fetching homework:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching homework'
    });
  }
});

// GET /api/student/homework/:id - Get specific homework assignment from DATABASE
router.get('/homework/:id', requireAuth, async (req, res) => {
  try {
    const homeworkId = parseInt(req.params.id);
    const user = req.user as any;
    const studentId = user?.id;
    const schoolId = user?.schoolId;
    
    if (isNaN(homeworkId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid homework ID'
      });
    }

    console.log('[STUDENT_HOMEWORK] 📡 Fetching homework details from DATABASE:', homeworkId);

    // Fetch homework from database
    const dbHomework = await db
      .select({
        id: homework.id,
        title: homework.title,
        description: homework.description,
        dueDate: homework.dueDate,
        subjectId: homework.subjectId,
        teacherId: homework.teacherId,
        classId: homework.classId,
        attachments: homework.attachments,
        priority: homework.priority,
        instructions: homework.instructions,
        createdAt: homework.createdAt,
        subjectName: subjects.nameFr,
        teacherFirstName: users.firstName,
        teacherLastName: users.lastName
      })
      .from(homework)
      .leftJoin(subjects, eq(homework.subjectId, subjects.id))
      .leftJoin(users, eq(homework.teacherId, users.id))
      .where(and(
        eq(homework.id, homeworkId),
        eq(homework.schoolId, schoolId)
      ))
      .limit(1);

    if (dbHomework.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Homework not found'
      });
    }

    const h = dbHomework[0];
    
    // Get student's submission if exists
    const submission = await db
      .select()
      .from(homeworkSubmissions)
      .where(and(
        eq(homeworkSubmissions.homeworkId, homeworkId),
        eq(homeworkSubmissions.studentId, studentId)
      ))
      .limit(1);

    const sub = submission.length > 0 ? submission[0] : null;
    const teacherName = h.teacherFirstName && h.teacherLastName
      ? `${h.teacherFirstName} ${h.teacherLastName}`
      : 'Unknown Teacher';
    
    let status = 'assigned';
    if (sub) {
      status = sub.grade ? 'graded' : 'submitted';
    } else if (h.dueDate && new Date(h.dueDate) < new Date()) {
      status = 'overdue';
    }

    const homeworkData = {
      id: h.id,
      title: h.title || 'Untitled',
      subject: h.subjectName || 'Unknown',
      teacher: teacherName,
      dueDate: h.dueDate?.toISOString().split('T')[0] || null,
      status: status,
      description: h.description || '',
      attachments: h.attachments || [],
      instructions: h.instructions || '',
      submittedAt: sub?.submittedAt?.toISOString() || null,
      submissionFiles: sub?.files || [],
      grade: sub?.grade || null,
      feedback: sub?.feedback || null
    };

    res.json(homeworkData);
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

// GET /api/student/parents - Get student's parents - REAL DATABASE
// BUSINESS RULE: Students can ONLY communicate with their parents
router.get('/parents', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const studentId = user?.id;
    
    if (user.role !== 'Student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - students only'
      });
    }
    
    console.log('[STUDENT_API] Fetching parents for student:', studentId);
    
    // Get parents linked to this student via parent_student_relations
    const parentRelations = await db.select({
      parentId: parentStudentRelations.parentId,
      relationship: parentStudentRelations.relationship,
      parentFirstName: users.firstName,
      parentLastName: users.lastName,
      parentEmail: users.email,
      parentPhone: users.phone
    })
      .from(parentStudentRelations)
      .innerJoin(users, eq(users.id, parentStudentRelations.parentId))
      .where(eq(parentStudentRelations.studentId, studentId));
    
    const parents = parentRelations.map(rel => ({
      id: rel.parentId,
      firstName: rel.parentFirstName || '',
      lastName: rel.parentLastName || '',
      email: rel.parentEmail || '',
      phone: rel.parentPhone || '',
      relationship: rel.relationship || 'Parent',
      displayName: `${rel.parentFirstName || ''} ${rel.parentLastName || ''}`.trim() || 'Parent'
    }));
    
    console.log('[STUDENT_API] Found', parents.length, 'parents for student', studentId);
    res.json(parents);
  } catch (error) {
    console.error('[STUDENT_API] Error fetching parents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching parents'
    });
  }
});

// REMOVED: GET /api/student/messages - DUPLICATE of server/routes.ts line ~9919
// The active implementation is in server/routes.ts, registered BEFORE this router
// This route was never executed because Express uses first matching route
// See: server/routes.ts app.get("/api/student/messages", ...) for the active implementation

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

// REMOVED: POST /api/student/messages/parent - DUPLICATE of server/routes.ts line ~10021
// The active implementation is in server/routes.ts, registered BEFORE this router
// This route was never executed because Express uses first matching route
// See: server/routes.ts app.post("/api/student/messages/parent", ...) for the active implementation

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

// GET /api/student/teachers - Get teachers for student (for Messages École module) - REAL DATABASE
router.get('/teachers', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const studentId = user?.id;
    const schoolId = user?.schoolId;
    
    console.log('[STUDENT_API] Fetching teachers for student:', studentId, 'school:', schoolId);
    
    if (!schoolId) {
      return res.json({ success: true, teachers: [], message: 'No school assigned' });
    }
    
    // Get student's class enrollment
    const [enrollment] = await db.select({ classId: enrollments.classId })
      .from(enrollments)
      .where(eq(enrollments.studentId, studentId))
      .limit(1);
    
    let teacherIds: number[] = [];
    
    if (enrollment?.classId) {
      // Get teachers assigned to this class via teacherSubjectAssignments
      const assignments = await db.select({ teacherId: teacherSubjectAssignments.teacherId })
        .from(teacherSubjectAssignments)
        .where(eq(teacherSubjectAssignments.classId, enrollment.classId));
      teacherIds = [...new Set(assignments.map(a => a.teacherId))];
    }
    
    // If no class-specific teachers, get all teachers from the school
    if (teacherIds.length === 0) {
      const schoolTeachers = await db.select({ id: users.id })
        .from(users)
        .where(and(
          eq(users.schoolId, schoolId),
          eq(users.role, 'Teacher')
        ))
        .limit(20);
      teacherIds = schoolTeachers.map(t => t.id);
    }
    
    if (teacherIds.length === 0) {
      return res.json({ success: true, teachers: [], message: 'No teachers found' });
    }
    
    // Get teacher details
    const teachersList = await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      phone: users.phone
    })
    .from(users)
    .where(inArray(users.id, teacherIds));
    
    const teachers = teachersList.map(t => ({
      id: t.id,
      firstName: t.firstName || '',
      lastName: t.lastName || '',
      subject: 'Enseignant',
      email: t.email || '',
      phone: t.phone || ''
    }));
    
    console.log('[STUDENT_API] Found', teachers.length, 'teachers');
    
    return res.json({
      success: true,
      teachers,
      message: 'Teachers list retrieved successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] Error fetching teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teachers'
    });
  }
});

// GET /api/student/attendance - Get student attendance - REAL DATABASE
router.get('/attendance', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const studentId = user?.id;
    
    console.log('[STUDENT_API] Fetching attendance for student:', studentId);
    
    // Get attendance records from database
    const attendanceRecords = await db.select()
      .from(attendance)
      .where(eq(attendance.studentId, studentId))
      .orderBy(desc(attendance.date))
      .limit(30);
    
    // Format attendance data
    const formattedAttendance = attendanceRecords.map(record => ({
      id: record.id,
      date: record.date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      status: record.status,
      reason: record.reason || '',
      notes: record.notes || '',
      timeIn: record.timeIn?.toISOString().split('T')[1]?.substring(0, 5) || null,
      timeOut: record.timeOut?.toISOString().split('T')[1]?.substring(0, 5) || null
    }));

    console.log('[STUDENT_API] Found', formattedAttendance.length, 'attendance records');

    res.json({
      success: true,
      attendance: formattedAttendance,
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

// GET /api/student/settings - Get student settings - REAL DATABASE
router.get('/settings', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const studentId = user?.id;
    
    console.log('[STUDENT_API] Fetching settings for student:', studentId);
    
    // Get student profile from database
    const [student] = await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      phone: users.phone,
      schoolId: users.schoolId
    })
    .from(users)
    .where(eq(users.id, studentId));
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Get class name if enrolled
    let className = 'Non assigné';
    const [enrollment] = await db.select({ classId: enrollments.classId })
      .from(enrollments)
      .where(eq(enrollments.studentId, studentId))
      .limit(1);
    
    if (enrollment?.classId) {
      const [classData] = await db.select({ name: classes.name })
        .from(classes)
        .where(eq(classes.id, enrollment.classId));
      if (classData) className = classData.name;
    }
    
    const settings = {
      profile: {
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        email: student.email || '',
        phone: student.phone || '',
        className,
        studentId: `STU${String(student.id).padStart(4, '0')}`
      },
      notifications: {
        gradeNotifications: true,
        assignmentNotifications: true,
        attendanceNotifications: true
      },
      privacy: {
        showProfileToParents: true,
        allowDirectMessages: true
      }
    };

    console.log('[STUDENT_API] Settings retrieved for student:', studentId);

    res.json({
      success: true,
      settings,
      message: 'Settings retrieved successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] Error fetching settings:', error);
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

// GET /api/student/geolocation/safe-zones - Get student safe zones - REAL DATABASE
router.get('/geolocation/safe-zones', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const studentId = user?.id;
    const schoolId = user?.schoolId;
    
    console.log('[STUDENT_API] Fetching safe zones for student:', studentId, 'school:', schoolId);
    
    if (!schoolId) {
      return res.json({ success: true, safeZones: [], message: 'No school assigned' });
    }
    
    // Get all active safe zones from the student's school
    const zones = await db.select()
      .from(safeZones)
      .where(and(
        eq(safeZones.schoolId, schoolId),
        eq(safeZones.isActive, true)
      ));
    
    // Filter zones that include this student in children_ids
    console.log('[STUDENT_API] Total zones found for school:', zones.length);
    
    const studentZones = zones.filter(zone => {
      if (!zone.childrenIds) {
        console.log('[STUDENT_API] Zone', zone.id, 'has no childrenIds');
        return false;
      }
      try {
        const childrenIds = typeof zone.childrenIds === 'string' 
          ? JSON.parse(zone.childrenIds) 
          : zone.childrenIds;
        
        console.log('[STUDENT_API] Zone', zone.id, 'childrenIds:', childrenIds, 'looking for studentId:', studentId, 'type:', typeof studentId);
        
        // Compare with type coercion (number or string comparison)
        const found = Array.isArray(childrenIds) && childrenIds.some((id: any) => 
          Number(id) === Number(studentId) || String(id) === String(studentId)
        );
        
        console.log('[STUDENT_API] Zone', zone.id, 'match:', found);
        return found;
      } catch (err) {
        console.error('[STUDENT_API] Error parsing childrenIds for zone', zone.id, ':', err);
        return false;
      }
    });
    
    const formattedZones = studentZones.map(zone => ({
      id: zone.id,
      name: zone.name,
      type: zone.type || 'custom',
      address: zone.description || '',
      radius: zone.radius,
      active: zone.isActive,
      createdBy: zone.parentId,
      updatedAt: zone.updatedAt || zone.createdAt,
      coordinates: {
        lat: parseFloat(zone.latitude as string),
        lng: parseFloat(zone.longitude as string)
      }
    }));

    console.log('[STUDENT_API] Found', formattedZones.length, 'safe zones for student', studentId);

    res.json({
      success: true,
      safeZones: formattedZones,
      message: 'Safe zones retrieved successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] Error fetching safe zones:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching safe zones'
    });
  }
});

// GET /api/student-parent/connections - Get parent-child connections - REAL DATABASE
router.get('/parent-connections', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Student not authenticated'
      });
    }
    
    // Real database query - get parents from parent_student_relations
    const relations = await db.select({
      id: parentStudentRelations.id,
      parentId: parentStudentRelations.parentId,
      studentId: parentStudentRelations.studentId,
      relationship: parentStudentRelations.relationship,
      createdAt: parentStudentRelations.createdAt,
      parentFirstName: users.firstName,
      parentLastName: users.lastName,
      parentEmail: users.email,
      parentPhone: users.phone
    })
    .from(parentStudentRelations)
    .innerJoin(users, eq(users.id, parentStudentRelations.parentId))
    .where(eq(parentStudentRelations.studentId, studentId));
    
    const connections = relations.map(rel => ({
      id: rel.id,
      parentId: rel.parentId,
      parentName: `${rel.parentFirstName || ''} ${rel.parentLastName || ''}`.trim() || 'Nom inconnu',
      parentEmail: rel.parentEmail,
      parentPhone: rel.parentPhone,
      relationship: rel.relationship || 'Parent',
      status: 'active',
      connectedAt: rel.createdAt?.toISOString() || null
    }));

    console.log(`[STUDENT_API] ✅ Parent connections retrieved from DB for student:`, studentId, 'count:', connections.length);

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

// GET /api/student/geolocation/device-status - Get device tracking status (DATABASE-ONLY)
router.get('/geolocation/device-status', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    
    // No device tracking table exists yet - return null
    // The frontend handles this with "No device registered" message
    // When device tracking is implemented, this will query the database
    console.log(`[STUDENT_API] Device status requested for student:`, studentId, '- No device tracking configured');

    res.json({
      success: true,
      deviceStatus: null,
      message: 'No device tracking configured'
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
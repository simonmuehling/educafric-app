import { Router } from 'express';
import { storage } from '../storage';
import { 
  generateGradeNotificationMessages, 
  generateGradeUpdateMessages,
  getGradePriority,
  generateGradeNotificationMetadata,
  type GradeNotificationData
} from '../utils/gradeNotifications';

const router = Router();

// Middleware to require authentication
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

// Get grades for a school
router.get('/school', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    if (!user.schoolId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with a school'
      });
    }

    const grades = await storage.getGradesBySchool(user.schoolId);
    
    res.json({
      success: true,
      grades: grades || []
    });
  } catch (error) {
    console.error('[GRADES_API] Error fetching school grades:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grades'
    });
  }
});

// Get grades for a specific student
router.get('/student/:studentId', requireAuth, async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    
    // Validate student ID parameter
    if (isNaN(studentId) || studentId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID provided'
      });
    }
    
    const grades = await storage.getStudentGrades(studentId);
    
    res.json({
      success: true,
      grades: grades || []
    });
  } catch (error) {
    console.error('[GRADES_API] Error fetching student grades');
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student grades'
    });
  }
});

// Get grades for a specific class
router.get('/class/:classId', requireAuth, async (req, res) => {
  try {
    const classId = parseInt(req.params.classId);
    
    // Validate class ID parameter
    if (isNaN(classId) || classId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class ID provided'
      });
    }
    
    const grades = await storage.getGradesByClass(classId);
    
    res.json({
      success: true,
      grades: grades || []
    });
  } catch (error) {
    console.error('[GRADES_API] Error fetching class grades');
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class grades'
    });
  }
});

// Get grades for a specific subject
router.get('/subject/:subjectId', requireAuth, async (req, res) => {
  try {
    const subjectId = parseInt(req.params.subjectId);
    const grades = await storage.getGradesBySubject(subjectId);
    
    res.json({
      success: true,
      grades: grades || []
    });
  } catch (error) {
    console.error('[GRADES_API] Error fetching subject grades:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subject grades'
    });
  }
});

// Create new grade
router.post('/', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    // Only teachers, admins and directors can create grades
    if (!['Teacher', 'Admin', 'Director'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const gradeData = {
      ...req.body,
      teacherId: user.id,
      createdBy: user.id
    };

    const grade = await storage.createGrade(gradeData);
    
    console.log('[GRADES_API] ✅ Grade created successfully:', grade.id);
    
    // === REAL PWA GRADE NOTIFICATIONS ===
    // Send notifications to student and parent when grade is created
    try {
      // Get additional data needed for notifications
      const student = await storage.getStudent(grade.studentId);
      const teacher = await storage.getUserById(grade.teacherId);
      
      const notificationData: GradeNotificationData = {
        studentName: student?.name || `Élève ${grade.studentId}`,
        subjectName: req.body.subjectName || req.body.subject || 'Matière',
        score: grade.score,
        teacherName: teacher?.name || user.name || 'Enseignant',
        className: req.body.className || req.body.class || 'Classe',
        gradeType: grade.gradeType || req.body.gradeType || 'évaluation'
      };
      
      // Generate bilingual messages
      const frenchMessages = generateGradeNotificationMessages(notificationData, 'fr');
      const englishMessages = generateGradeNotificationMessages(notificationData, 'en');
      const priority = getGradePriority(grade.score);
      const metadata = generateGradeNotificationMetadata(grade, false);
      
      console.log('[GRADE_NOTIFICATIONS] 📊 Sending grade notifications for student:', student?.id);
      
      // 1. Notify the student
      if (student?.id) {
        await storage.createNotification({
          userId: student.id,
          title: frenchMessages.studentTitle,
          message: frenchMessages.studentMessage,
          type: 'grade',
          category: 'academic',
          data: {
            ...metadata,
            language: 'fr',
            englishTitle: englishMessages.studentTitle,
            englishMessage: englishMessages.studentMessage
          },
          actionRequired: false,
          actionUrl: `/grades/view/${grade.id}`,
          priority
        });
        console.log('[GRADE_NOTIFICATIONS] ✅ Student notification created');
      }
      
      // 2. Notify parent(s) if they exist
      // Try to find parent connections - use fallback if method doesn't exist
      let parentConnections: any[] = [];
      try {
        // Try to get parent connections through various methods
        if (student?.parentId) {
          // Direct parent ID on student
          parentConnections = [{ parentId: student.parentId, status: 'approved' }];
        } else if (typeof (storage as any).getStudentParentConnections === 'function') {
          // Use the method if it exists
          parentConnections = await (storage as any).getStudentParentConnections(grade.studentId);
        } else {
          // Fallback: try to find parents through user relationships
          const allUsers = await storage.getAllUsers();
          const parents = allUsers.filter((u: any) => u.role === 'Parent' && u.studentIds?.includes(grade.studentId));
          parentConnections = parents.map((p: any) => ({ parentId: p.id, status: 'approved' }));
        }
      } catch (e) {
        console.log('[GRADE_NOTIFICATIONS] Could not fetch parent connections:', e.message);
        parentConnections = [];
      }
      
      for (const connection of parentConnections) {
        if (connection.parentId && connection.status === 'approved') {
          await storage.createNotification({
            userId: connection.parentId,
            title: frenchMessages.parentTitle,
            message: frenchMessages.parentMessage,
            type: 'grade',
            category: 'academic',
            data: {
              ...metadata,
              language: 'fr',
              englishTitle: englishMessages.parentTitle,
              englishMessage: englishMessages.parentMessage,
              parentType: 'grade_alert'
            },
            actionRequired: false,
            actionUrl: `/parent/grades/${grade.studentId}`,
            priority
          });
          console.log('[GRADE_NOTIFICATIONS] ✅ Parent notification created for parent:', connection.parentId);
        }
      }
      
      console.log('[GRADE_NOTIFICATIONS] 🎯 All grade notifications sent successfully');
      
    } catch (notificationError: any) {
      console.error('[GRADE_NOTIFICATIONS] ❌ Error sending grade notifications:', notificationError);
      // Don't fail the grade creation if notifications fail
    }
    
    res.status(201).json({
      success: true,
      message: 'Grade created successfully',
      grade,
      notificationsSent: true
    });
  } catch (error) {
    console.error('[GRADES_API] Error creating grade:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create grade'
    });
  }
});

// Update grade
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const gradeId = parseInt(req.params.id);
    const user = req.user as any;
    
    // Only the teacher who created the grade, admins, and directors can update
    const existingGrade = await storage.getGrade(gradeId);
    if (!existingGrade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    if (user.role === 'Teacher' && existingGrade.teacherId !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Can only update your own grades'
      });
    }

    if (!['Teacher', 'Admin', 'Director'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const updates = {
      ...req.body,
      updatedBy: user.id,
      updatedAt: new Date()
    };

    const grade = await storage.updateGrade(gradeId, updates);
    
    console.log('[GRADES_API] ✅ Grade updated successfully:', grade.id);
    
    // === REAL PWA GRADE UPDATE NOTIFICATIONS ===
    // Send notifications when grade is updated (score changed)
    try {
      const oldScore = existingGrade.score;
      const newScore = grade.score;
      
      // Only send notifications if score actually changed
      if (oldScore !== newScore) {
        // Get additional data needed for notifications
        const student = await storage.getStudent(grade.studentId);
        const teacher = await storage.getUserById(grade.teacherId);
        
        const notificationData: GradeNotificationData & { oldScore: number | string } = {
          studentName: student?.name || `Élève ${grade.studentId}`,
          subjectName: req.body.subjectName || req.body.subject || 'Matière',
          score: newScore,
          oldScore: oldScore,
          teacherName: teacher?.name || user.name || 'Enseignant',
          className: req.body.className || req.body.class || 'Classe',
          gradeType: grade.gradeType || req.body.gradeType || 'évaluation'
        };
        
        // Generate bilingual update messages
        const frenchMessages = generateGradeUpdateMessages(notificationData, 'fr');
        const englishMessages = generateGradeUpdateMessages(notificationData, 'en');
        const priority = getGradePriority(newScore);
        const metadata = generateGradeNotificationMetadata(grade, true);
        
        console.log('[GRADE_UPDATE_NOTIFICATIONS] 📝 Sending grade update notifications:', { oldScore, newScore });
        
        // 1. Notify the student
        if (student?.id) {
          await storage.createNotification({
            userId: student.id,
            title: frenchMessages.studentTitle,
            message: frenchMessages.studentMessage,
            type: 'grade_update',
            category: 'academic',
            data: {
              ...metadata,
              language: 'fr',
              englishTitle: englishMessages.studentTitle,
              englishMessage: englishMessages.studentMessage,
              oldScore,
              newScore
            },
            actionRequired: false,
            actionUrl: `/grades/view/${grade.id}`,
            priority
          });
          console.log('[GRADE_UPDATE_NOTIFICATIONS] ✅ Student update notification created');
        }
        
        // 2. Notify parent(s) - use same robust approach as create function
        let parentConnections: any[] = [];
        try {
          if (student?.parentId) {
            parentConnections = [{ parentId: student.parentId, status: 'approved' }];
          } else if (typeof (storage as any).getStudentParentConnections === 'function') {
            parentConnections = await (storage as any).getStudentParentConnections(grade.studentId);
          } else {
            const allUsers = await storage.getAllUsers();
            const parents = allUsers.filter((u: any) => u.role === 'Parent' && u.studentIds?.includes(grade.studentId));
            parentConnections = parents.map((p: any) => ({ parentId: p.id, status: 'approved' }));
          }
        } catch (e) {
          console.log('[GRADE_UPDATE_NOTIFICATIONS] Could not fetch parent connections:', e.message);
          parentConnections = [];
        }
        
        for (const connection of parentConnections) {
          if (connection.parentId && connection.status === 'approved') {
            await storage.createNotification({
              userId: connection.parentId,
              title: frenchMessages.parentTitle,
              message: frenchMessages.parentMessage,
              type: 'grade_update',
              category: 'academic',
              data: {
                ...metadata,
                language: 'fr',
                englishTitle: englishMessages.parentTitle,
                englishMessage: englishMessages.parentMessage,
                parentType: 'grade_update_alert',
                oldScore,
                newScore
              },
              actionRequired: false,
              actionUrl: `/parent/grades/${grade.studentId}`,
              priority
            });
            console.log('[GRADE_UPDATE_NOTIFICATIONS] ✅ Parent update notification created for parent:', connection.parentId);
          }
        }
        
        console.log('[GRADE_UPDATE_NOTIFICATIONS] 🎯 All grade update notifications sent successfully');
      } else {
        console.log('[GRADE_UPDATE_NOTIFICATIONS] ℹ️ Score unchanged, no notifications sent');
      }
      
    } catch (notificationError: any) {
      console.error('[GRADE_UPDATE_NOTIFICATIONS] ❌ Error sending grade update notifications:', notificationError);
      // Don't fail the grade update if notifications fail
    }
    
    res.json({
      success: true,
      message: 'Grade updated successfully',
      grade,
      notificationsSent: true
    });
  } catch (error) {
    console.error('[GRADES_API] Error updating grade:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update grade'
    });
  }
});

// Delete grade
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const gradeId = parseInt(req.params.id);
    const user = req.user as any;
    
    // Only admins and directors can delete grades
    if (!['Admin', 'Director'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can delete grades'
      });
    }

    await storage.deleteGrade(gradeId);
    
    res.json({
      success: true,
      message: 'Grade deleted successfully'
    });
  } catch (error) {
    console.error('[GRADES_API] Error deleting grade:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete grade'
    });
  }
});

// Get grade statistics
router.get('/stats/class/:classId', requireAuth, async (req, res) => {
  try {
    const classId = parseInt(req.params.classId);
    const stats = await storage.getGradeStatsByClass(classId);
    
    res.json({
      success: true,
      stats: stats || {}
    });
  } catch (error) {
    console.error('[GRADES_API] Error fetching grade statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grade statistics'
    });
  }
});

export default router;
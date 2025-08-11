import { Router } from 'express';
import { storage } from '../storage';

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
    const grades = await storage.getStudentGrades(studentId);
    
    res.json({
      success: true,
      grades: grades || []
    });
  } catch (error) {
    console.error('[GRADES_API] Error fetching student grades:', error);
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
    const grades = await storage.getGradesByClass(classId);
    
    res.json({
      success: true,
      grades: grades || []
    });
  } catch (error) {
    console.error('[GRADES_API] Error fetching class grades:', error);
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
    
    res.status(201).json({
      success: true,
      message: 'Grade created successfully',
      grade
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
    
    res.json({
      success: true,
      message: 'Grade updated successfully',
      grade
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
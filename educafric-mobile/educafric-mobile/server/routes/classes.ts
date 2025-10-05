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

// GET /api/classes - Basic endpoint to list all classes (with proper auth)
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    // Return classes based on user role and school
    if (user.schoolId) {
      const classes = await storage.getClassesBySchool(user.schoolId);
      res.json({
        success: true,
        classes: classes || [],
        message: `Found ${classes?.length || 0} classes`
      });
    } else {
      res.json({
        success: true,
        classes: [],
        message: 'No school associated with user'
      });
    }
  } catch (error) {
    console.error('[CLASSES_API] Error fetching classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classes'
    });
  }
});

// Get classes for a school
router.get('/school', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    if (!user.schoolId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with a school'
      });
    }

    const classes = await storage.getClassesBySchool(user.schoolId);
    
    res.json({
      success: true,
      classes: classes || []
    });
  } catch (error) {
    console.error('[CLASSES_API] Error fetching school classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classes'
    });
  }
});

// Get class by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    const classData = await storage.getClass(classId);
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      class: classData
    });
  } catch (error) {
    console.error('[CLASSES_API] Error fetching class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class'
    });
  }
});

// Create new class
router.post('/', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    // Only admins and directors can create classes
    if (!['Admin', 'Director'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const classData = {
      ...req.body,
      schoolId: user.schoolId,
      createdBy: user.id
    };

    const newClass = await storage.createClass(classData);
    
    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      class: newClass
    });
  } catch (error) {
    console.error('[CLASSES_API] Error creating class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create class'
    });
  }
});

// Update class
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    const user = req.user as any;
    
    // Only admins and directors can update classes
    if (!['Admin', 'Director'].includes(user.role)) {
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

    const updatedClass = await storage.updateClass(classId, updates);
    
    res.json({
      success: true,
      message: 'Class updated successfully',
      class: updatedClass
    });
  } catch (error) {
    console.error('[CLASSES_API] Error updating class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update class'
    });
  }
});

// Delete class
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    const user = req.user as any;
    
    // Only admins and directors can delete classes
    if (!['Admin', 'Director'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    await storage.deleteClass(classId);
    
    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('[CLASSES_API] Error deleting class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete class'
    });
  }
});

// Get class students
router.get('/:id/students', requireAuth, async (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    const students = await storage.getStudentsByClass(classId);
    
    res.json({
      success: true,
      students: students || []
    });
  } catch (error) {
    console.error('[CLASSES_API] Error fetching class students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class students'
    });
  }
});

// Get class subjects
router.get('/:id/subjects', requireAuth, async (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    const subjects = await storage.getSubjectsByClass(classId);
    
    res.json({
      success: true,
      subjects: subjects || []
    });
  } catch (error) {
    console.error('[CLASSES_API] Error fetching class subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class subjects'
    });
  }
});

export default router;
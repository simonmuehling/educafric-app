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

// Helper to check user role including activeRole for multirole support
function hasDirectorAccess(user: any): boolean {
  const effectiveRole = user.activeRole || user.role;
  return ['Admin', 'Director', 'SiteAdmin'].includes(effectiveRole);
}

// Get teachers for a school
router.get('/school', requireAuth, async (req, res) => {
  try {
    console.log('[TEACHERS_API] GET /api/teachers/school');
    
    const user = req.user as any;
    if (!user.schoolId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with a school'
      });
    }

    const teachers = await storage.getTeachersBySchool(user.schoolId);
    
    res.json({
      success: true,
      teachers: teachers || []
    });
  } catch (error) {
    console.error('[TEACHERS_API] Error fetching school teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teachers'
    });
  }
});

// Get teacher by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const teacherId = parseInt(req.params.id);
    const teacher = await storage.getTeacher(teacherId);
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    res.json({
      success: true,
      teacher
    });
  } catch (error) {
    console.error('[TEACHERS_API] Error fetching teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher'
    });
  }
});

// Create new teacher
router.post('/', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    // Only admins and directors can create teachers (supports multirole activeRole)
    if (!hasDirectorAccess(user)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const teacherData = {
      ...req.body,
      schoolId: user.schoolId,
      createdBy: user.id
    };

    const teacher = await storage.createTeacher(teacherData);
    
    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      teacher
    });
  } catch (error) {
    console.error('[TEACHERS_API] Error creating teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create teacher'
    });
  }
});

// Update teacher
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const teacherId = parseInt(req.params.id);
    const user = req.user as any;
    
    // Only admins and directors can update teachers (supports multirole activeRole)
    if (!hasDirectorAccess(user)) {
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

    const teacher = await storage.updateTeacher(teacherId, updates);
    
    res.json({
      success: true,
      message: 'Teacher updated successfully',
      teacher
    });
  } catch (error) {
    console.error('[TEACHERS_API] Error updating teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update teacher'
    });
  }
});

// Remove teacher from school (unassigns school, preserves account)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const teacherId = parseInt(req.params.id);
    const user = req.user as any;
    
    // Only admins and directors can remove teachers from school (supports multirole activeRole)
    if (!hasDirectorAccess(user)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    // Use removeTeacherFromSchool to just unassign the school, not delete the account
    await storage.removeTeacherFromSchool(teacherId);
    
    res.json({
      success: true,
      message: 'Teacher removed from school successfully'
    });
  } catch (error) {
    console.error('[TEACHERS_API] Error removing teacher from school:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove teacher from school'
    });
  }
});

// Get teacher's classes
router.get('/:id/classes', requireAuth, async (req, res) => {
  try {
    const teacherId = parseInt(req.params.id);
    const classes = await storage.getTeacherClasses(teacherId);
    
    res.json({
      success: true,
      classes: classes || []
    });
  } catch (error) {
    console.error('[TEACHERS_API] Error fetching teacher classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher classes'
    });
  }
});

// Get teacher's students
router.get('/:id/students', requireAuth, async (req, res) => {
  try {
    const teacherId = parseInt(req.params.id);
    const students = await storage.getTeacherStudents(teacherId);
    
    res.json({
      success: true,
      students: students || []
    });
  } catch (error) {
    console.error('[TEACHERS_API] Error fetching teacher students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher students'
    });
  }
});

export default router;
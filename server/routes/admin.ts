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

// Middleware to require admin privileges
function requireAdmin(req: any, res: any, next: any) {
  const user = req.user as any;
  if (!['Admin', 'Director'].includes(user.role)) {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  next();
}

// Get delegate administrators
router.get('/delegates', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const delegates = await storage.getDelegateAdministrators(user.schoolId);
    
    res.json({
      success: true,
      delegates: delegates || []
    });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching delegate administrators:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delegate administrators'
    });
  }
});

// Add delegate administrator
router.post('/delegates', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const { teacherId, adminLevel, permissions } = req.body;

    const delegate = await storage.addDelegateAdministrator({
      teacherId,
      schoolId: user.schoolId,
      adminLevel,
      assignedBy: user.id
    });

    // Update permissions if provided
    if (permissions && permissions.length > 0) {
      await storage.updateDelegateAdministratorPermissions(delegate.id, permissions, user.schoolId);
    }
    
    res.status(201).json({
      success: true,
      message: 'Delegate administrator added successfully',
      delegate
    });
  } catch (error) {
    console.error('[ADMIN_API] Error adding delegate administrator:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add delegate administrator'
    });
  }
});

// === DIRECTOR STUDENT MANAGEMENT ROUTES ===

// Get students for director dashboard
router.get('/students', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    if (!user.schoolId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with a school'
      });
    }

    const students = await storage.getStudentsBySchool(user.schoolId);
    
    res.json({
      success: true,
      students: students || []
    });
  } catch (error) {
    console.error('[DIRECTOR_STUDENTS] Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students'
    });
  }
});

// Get students analytics for director
router.get('/students/analytics', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const students = await storage.getStudentsBySchool(user.schoolId);
    
    const analytics = {
      totalStudents: students.length,
      activeStudents: students.filter(s => s.status === 'active').length,
      averageAge: students.length > 0 ? students.reduce((sum, s) => sum + (s.age || 16), 0) / students.length : 16,
      averageGrade: students.length > 0 ? students.reduce((sum, s) => sum + (s.average || 12), 0) / students.length : 12,
      attendanceRate: students.length > 0 ? students.reduce((sum, s) => sum + (s.attendance || 85), 0) / students.length : 85
    };
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('[DIRECTOR_STUDENTS_ANALYTICS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student analytics'
    });
  }
});

// Add new student (director)
router.post('/students', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const studentData = {
      ...req.body,
      schoolId: user.schoolId,
      role: 'Student',
      createdBy: user.id
    };

    const student = await storage.createStudent(studentData);
    
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student
    });
  } catch (error) {
    console.error('[DIRECTOR_CREATE_STUDENT] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create student'
    });
  }
});

// Update student (director)
router.put('/students/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    if (isNaN(studentId) || studentId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid student ID' });
    }
    
    const updates = req.body;

    const updatedStudent = await storage.updateStudent(studentId, updates);
    
    res.json({
      success: true,
      message: 'Student updated successfully',
      student: updatedStudent
    });
  } catch (error) {
    console.error('[DIRECTOR_UPDATE_STUDENT] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student'
    });
  }
});

// === DIRECTOR TEACHER MANAGEMENT ROUTES ===

// Get teachers for director dashboard
router.get('/teachers', requireAuth, requireAdmin, async (req, res) => {
  try {
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
    console.error('[DIRECTOR_TEACHERS] Error fetching teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teachers'
    });
  }
});

// Add new teacher (director)
router.post('/teachers', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const teacherData = {
      ...req.body,
      schoolId: user.schoolId,
      role: 'Teacher',
      createdBy: user.id
    };

    const teacher = await storage.createTeacher(teacherData);
    
    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      teacher
    });
  } catch (error) {
    console.error('[DIRECTOR_CREATE_TEACHER] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create teacher'
    });
  }
});

// Update teacher (director)
router.put('/teachers/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const teacherId = parseInt(req.params.id);
    if (isNaN(teacherId) || teacherId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid teacher ID' });
    }
    
    const updates = req.body;

    const updatedTeacher = await storage.updateTeacher(teacherId, updates);
    
    res.json({
      success: true,
      message: 'Teacher updated successfully',
      teacher: updatedTeacher
    });
  } catch (error) {
    console.error('[DIRECTOR_UPDATE_TEACHER] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update teacher'
    });
  }
});

// Delete teacher (director)
router.delete('/teachers/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const teacherId = parseInt(req.params.id);
    if (isNaN(teacherId) || teacherId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid teacher ID' });
    }

    await storage.deleteTeacher(teacherId);
    
    res.json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    console.error('[DIRECTOR_DELETE_TEACHER] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete teacher'
    });
  }
});

// === DIRECTOR CLASS MANAGEMENT ROUTES ===

// Get classes for director dashboard
router.get('/classes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    if (!user.schoolId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with a school'
      });
    }

    const classes = await storage.getSchoolClasses(user.schoolId);
    
    res.json({
      success: true,
      classes: classes || []
    });
  } catch (error) {
    console.error('[DIRECTOR_CLASSES] Error fetching classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classes'
    });
  }
});

// Add new class (director)
router.post('/classes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
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
    console.error('[DIRECTOR_CREATE_CLASS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create class'
    });
  }
});

// Update class (director)
router.put('/classes/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    if (isNaN(classId) || classId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid class ID' });
    }
    
    const updates = req.body;

    const updatedClass = await storage.updateClass(classId, updates);
    
    res.json({
      success: true,
      message: 'Class updated successfully',
      class: updatedClass
    });
  } catch (error) {
    console.error('[DIRECTOR_UPDATE_CLASS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update class'
    });
  }
});

// Delete class (director)
router.delete('/classes/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    if (isNaN(classId) || classId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid class ID' });
    }

    await storage.deleteClass(classId);
    
    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('[DIRECTOR_DELETE_CLASS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete class'
    });
  }
});

// Get director analytics
router.get('/analytics', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    
    const [students, teachers, classes] = await Promise.all([
      storage.getStudentsBySchool(user.schoolId),
      storage.getTeachersBySchool(user.schoolId),
      storage.getSchoolClasses(user.schoolId)
    ]);
    
    const analytics = {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalClasses: classes.length,
      studentsPerClass: classes.length > 0 ? Math.round(students.length / classes.length) : 0,
      teachersPerClass: classes.length > 0 ? Math.round(teachers.length / classes.length) : 0
    };
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('[DIRECTOR_ANALYTICS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics'
    });
  }
});

// Delete student (director)
router.delete('/students/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    if (isNaN(studentId) || studentId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid student ID' });
    }

    await storage.deleteStudent(studentId);
    
    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('[DIRECTOR_DELETE_STUDENT] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student'
    });
  }
});

// Remove delegate administrator
router.delete('/delegates/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const adminId = parseInt(req.params.id);
    if (isNaN(adminId) || adminId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid admin ID' });
    }

    await storage.removeDelegateAdministrator(adminId);
    
    res.json({
      success: true,
      message: 'Delegate administrator removed successfully'
    });
  } catch (error) {
    console.error('[ADMIN_API] Error removing delegate administrator:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove delegate administrator'
    });
  }
});

// Update delegate administrator permissions
router.put('/delegates/:id/permissions', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const adminId = parseInt(req.params.id);
    if (isNaN(adminId) || adminId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid admin ID' });
    }
    
    const { permissions } = req.body;

    await storage.updateDelegateAdministratorPermissions(adminId, permissions, user.schoolId);
    
    res.json({
      success: true,
      message: 'Delegate administrator permissions updated successfully'
    });
  } catch (error) {
    console.error('[ADMIN_API] Error updating delegate permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update delegate permissions'
    });
  }
});

// Get available teachers for admin roles
router.get('/available-teachers', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const teachers = await storage.getAvailableTeachersForAdmin(user.schoolId);
    
    res.json({
      success: true,
      teachers: teachers || []
    });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching available teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available teachers'
    });
  }
});

// Get administration statistics
router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const stats = await storage.getAdministrationStats(user.schoolId);
    
    res.json({
      success: true,
      stats: stats || {}
    });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching administration stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch administration statistics'
    });
  }
});

// Get administration settings
router.get('/settings', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const settings = await storage.getSchoolSettings(user.schoolId);
    
    res.json({
      success: true,
      settings: settings || {}
    });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching administration settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
});

// Get administration parents
router.get('/parents', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const parents = await storage.getAdministrationParents(user.schoolId);
    
    res.json({
      success: true,
      parents: parents || []
    });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching administration parents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch parents'
    });
  }
});

// Get available teachers for admin promotion
router.get('/available-teachers', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const teachers = await storage.getAvailableTeachersForAdmin(user.schoolId);
    
    res.json({
      success: true,
      teachers: teachers || []
    });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching available teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available teachers'
    });
  }
});

// Block user access
router.post('/block-user/:userId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    
    const { reason } = req.body;

    const result = await storage.blockUserAccess(userId, reason);
    
    res.json({
      success: true,
      message: 'User access blocked successfully',
      result
    });
  } catch (error) {
    console.error('[ADMIN_API] Error blocking user access:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block user access'
    });
  }
});

// Unblock user access
router.post('/unblock-user/:userId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const result = await storage.unblockUserAccess(userId);
    
    res.json({
      success: true,
      message: 'User access unblocked successfully',
      result
    });
  } catch (error) {
    console.error('[ADMIN_API] Error unblocking user access:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock user access'
    });
  }
});

export default router;
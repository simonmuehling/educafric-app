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

// Get students for a school
router.get('/school', requireAuth, async (req, res) => {
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
    console.error('[STUDENTS_API] Error fetching school students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students'
    });
  }
});

// Get students for a class
router.get('/class/:classId', requireAuth, async (req, res) => {
  try {
    const classId = parseInt(req.params.classId);
    const students = await storage.getStudentsByClass(classId);
    
    res.json({
      success: true,
      students: students || []
    });
  } catch (error) {
    console.error('[STUDENTS_API] Error fetching class students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students'
    });
  }
});

// Get student by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const student = await storage.getStudent(studentId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      student
    });
  } catch (error) {
    console.error('[STUDENTS_API] Error fetching student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student'
    });
  }
});

// Create new student
router.post('/', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    // Only admins and directors can create students
    if (!['Admin', 'Director'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const studentData = {
      ...req.body,
      schoolId: user.schoolId,
      createdBy: user.id
    };

    const student = await storage.createStudent(studentData);
    
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student
    });
  } catch (error) {
    console.error('[STUDENTS_API] Error creating student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create student'
    });
  }
});

// Update student
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const user = req.user as any;
    
    // Only admins and directors can update students
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

    const student = await storage.updateStudent(studentId, updates);
    
    res.json({
      success: true,
      message: 'Student updated successfully',
      student
    });
  } catch (error) {
    console.error('[STUDENTS_API] Error updating student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student'
    });
  }
});

// Delete student
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const user = req.user as any;
    
    // Only admins and directors can delete students
    if (!['Admin', 'Director'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    await storage.deleteStudent(studentId);
    
    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('[STUDENTS_API] Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student'
    });
  }
});

// Get student's grades
router.get('/:id/grades', requireAuth, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const grades = await storage.getStudentGrades(studentId);
    
    res.json({
      success: true,
      grades: grades || []
    });
  } catch (error) {
    console.error('[STUDENTS_API] Error fetching student grades:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student grades'
    });
  }
});

// Get student's attendance
router.get('/:id/attendance', requireAuth, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const attendance = await storage.getStudentAttendance(studentId);
    
    res.json({
      success: true,
      attendance: attendance || []
    });
  } catch (error) {
    console.error('[STUDENTS_API] Error fetching student attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student attendance'
    });
  }
});

export default router;
import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Get students for a specific class
router.get('/students', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const { classId } = req.query;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    // Mock students data based on class
    const allStudents = [
      { id: 1, fullName: 'Marie Kouam', classId: 1, className: '6ème A', matricule: 'ESJ-2024-001' },
      { id: 2, fullName: 'Paul Mballa', classId: 1, className: '6ème A', matricule: 'ESJ-2024-002' },
      { id: 3, fullName: 'Sophie Ngoyi', classId: 1, className: '6ème A', matricule: 'ESJ-2024-003' },
      { id: 4, fullName: 'Jean Fotso', classId: 2, className: '6ème B', matricule: 'ESJ-2024-004' },
      { id: 5, fullName: 'Alice Menye', classId: 2, className: '6ème B', matricule: 'ESJ-2024-005' },
      { id: 6, fullName: 'David Tchuente', classId: 3, className: '5ème A', matricule: 'ESJ-2024-006' }
    ];
    
    const classStudents = classId ? 
      allStudents.filter(student => student.classId.toString() === classId.toString()) :
      allStudents;
    
    res.json({
      success: true,
      students: classStudents
    });
  } catch (error) {
    console.error('[TEACHER_API] Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class students'
    });
  }
});

// Get student attendance data
router.get('/student-attendance', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const { studentId, period } = req.query;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    // Mock attendance calculation based on student and period
    const attendanceData = {
      studentId: parseInt(studentId as string),
      period: period as string,
      totalDays: 60, // Total school days in period
      presentDays: Math.floor(Math.random() * 10 + 50), // 50-59 days present
      absentDays: Math.floor(Math.random() * 5 + 1), // 1-5 days absent
      lateDays: Math.floor(Math.random() * 3), // 0-2 late arrivals
      attendanceRate: null // Will be calculated
    };
    
    // Calculate attendance rate
    attendanceData.attendanceRate = Math.round((attendanceData.presentDays / attendanceData.totalDays) * 100);
    
    res.json({
      success: true,
      data: attendanceData
    });
  } catch (error) {
    console.error('[TEACHER_API] Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student attendance'
    });
  }
});

// Middleware to require authentication
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

// Get teacher classes
router.get('/classes', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    // Mock teacher classes with school-based data
    const classes = [
      { id: 1, name: '6ème A', school: 'École Primaire Educafric', studentCount: 32 },
      { id: 2, name: '6ème B', school: 'École Primaire Educafric', studentCount: 28 },
      { id: 3, name: '5ème A', school: 'École Primaire Educafric', studentCount: 30 },
      { id: 4, name: '5ème B', school: 'École Primaire Educafric', studentCount: 25 }
    ];
    
    res.json({
      success: true,
      classes: classes
    });
  } catch (error) {
    console.error('[TEACHER_API] Error fetching classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher classes'
    });
  }
});

// Get teacher assignments
router.get('/assignments', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    // Mock assignments data
    const assignments = [
      { id: 1, title: 'Mathematics Exercise', class: '6ème A', dueDate: '2025-08-30', status: 'active' },
      { id: 2, title: 'Physics Lab Report', class: '5ème B', dueDate: '2025-09-02', status: 'pending' }
    ];
    
    res.json({
      success: true,
      assignments: assignments || []
    });
  } catch (error) {
    console.error('[TEACHER_API] Error fetching assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher assignments'
    });
  }
});

// Get teacher grades
router.get('/grades', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    // Mock grades data
    const grades = [
      { id: 1, studentName: 'Alice Martin', subject: 'Mathematics', grade: 16, class: '6ème A', date: '2025-08-20' },
      { id: 2, studentName: 'Bob Dupont', subject: 'Physics', grade: 14, class: '5ème B', date: '2025-08-22' }
    ];
    
    res.json({
      success: true,
      grades: grades || []
    });
  } catch (error) {
    console.error('[TEACHER_API] Error fetching grades:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher grades'
    });
  }
});

// Get teacher attendance records
router.get('/attendance', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    // Mock attendance data
    const attendance = [
      { id: 1, studentName: 'Alice Martin', class: '6ème A', date: '2025-08-24', status: 'present' },
      { id: 2, studentName: 'Bob Dupont', class: '5ème B', date: '2025-08-24', status: 'absent' }
    ];
    
    res.json({
      success: true,
      attendance: attendance || []
    });
  } catch (error) {
    console.error('[TEACHER_API] Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher attendance'
    });
  }
});

// Get teacher communications
router.get('/communications', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    // Mock communications data
    const communications = [
      { id: 1, type: 'message', recipient: 'Parent Alice', subject: 'Student Progress', date: '2025-08-24', status: 'sent' },
      { id: 2, type: 'notification', recipient: 'All Parents', subject: 'Class Meeting', date: '2025-08-23', status: 'delivered' }
    ];
    
    res.json({
      success: true,
      communications: communications || []
    });
  } catch (error) {
    console.error('[TEACHER_API] Error fetching communications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher communications'
    });
  }
});

// Get teacher schools (for multi-school teachers)
router.get('/schools', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    // Mock schools data
    const schools = [
      { id: 1, name: 'École Primaire Test', type: 'Primary', city: 'Yaoundé' }
    ];
    
    res.json({
      success: true,
      schools: schools || []
    });
  } catch (error) {
    console.error('[TEACHER_API] Error fetching schools:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher schools'
    });
  }
});

export default router;
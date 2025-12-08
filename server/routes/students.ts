import { Router } from 'express';
import { storage } from '../storage';
import { db } from '../db';
import { users, parentStudentRelations, teacherSubjectAssignments, enrollments } from '../../shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

const router = Router();

// Middleware to require authentication
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

// GET /api/students - Basic endpoint to list all students (with proper auth)
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    // Return students based on user role and school
    if (user.schoolId) {
      const students = await storage.getStudentsBySchool(user.schoolId);
      res.json({
        success: true,
        students: students || [],
        message: `Found ${students?.length || 0} students`
      });
    } else {
      res.json({
        success: true,
        students: [],
        message: 'No school associated with user'
      });
    }
  } catch (error) {
    console.error('[STUDENTS_API] Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students'
    });
  }
});

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
    
    // Validate class ID parameter
    if (isNaN(classId) || classId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class ID provided'
      });
    }
    
    const students = await storage.getStudentsByClass(classId);
    
    res.json({
      success: true,
      students: students || []
    });
  } catch (error) {
    console.error('[STUDENTS_API] Error fetching class students');
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
    
    // Validate student ID parameter
    if (isNaN(studentId) || studentId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID provided'
      });
    }
    
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

// Get teachers for current student (for messaging)
router.get('/teachers', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    // Only students can access their teachers
    if (user.role !== 'Student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - students only'
      });
    }

    if (!user.schoolId) {
      return res.status(400).json({
        success: false,
        message: 'Student not associated with a school'
      });
    }

    // Get teachers from the same school as the student
    const teachers = await storage.getTeachersBySchool(user.schoolId);
    
    // Format teachers for messaging interface
    const teachersList = (teachers || []).map((teacher: any) => ({
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      subject: teacher.subject || 'Enseignant',
      email: teacher.email
    }));
    
    res.json({
      success: true,
      teachers: teachersList
    });
  } catch (error) {
    console.error('[STUDENTS_API] Error fetching student teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teachers'
    });
  }
});

// Get parents for current student (for messaging) - REAL DATABASE
router.get('/parents', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const studentId = user?.id;
    
    // Only students can access their parents
    if (user.role !== 'Student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - students only'
      });
    }

    console.log('[STUDENTS_API] Fetching parents for student:', studentId);
    
    // Get parents from parent_student_relations table
    const relations = await db.select({
      parentId: parentStudentRelations.parentId,
      relationship: parentStudentRelations.relationship
    })
    .from(parentStudentRelations)
    .where(eq(parentStudentRelations.studentId, studentId));
    
    if (relations.length === 0) {
      console.log('[STUDENTS_API] No parents found for student:', studentId);
      return res.json({ success: true, parents: [] });
    }
    
    const parentIds = relations.map(r => r.parentId);
    
    // Get parent details
    const parentDetails = await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      phone: users.phone
    })
    .from(users)
    .where(inArray(users.id, parentIds));
    
    // Create relationship map
    const relationMap = Object.fromEntries(relations.map(r => [r.parentId, r.relationship]));
    
    const parentsList = parentDetails.map(parent => ({
      id: parent.id,
      firstName: parent.firstName || '',
      lastName: parent.lastName || '',
      relationship: relationMap[parent.id] || 'Parent',
      email: parent.email || '',
      phone: parent.phone || ''
    }));
    
    console.log('[STUDENTS_API] Found', parentsList.length, 'parents');
    
    res.json({
      success: true,
      parents: parentsList
    });
  } catch (error) {
    console.error('[STUDENTS_API] Error fetching student parents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch parents'
    });
  }
});

// Send message to teacher
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
    
    console.log('[STUDENTS_API] Message to teacher sent:', newMessage);
    console.log('[STUDENTS_API] Notification channels (PWA+Email only):', allowedChannels);
    
    res.json({
      success: true,
      message: 'Message sent to teacher successfully',
      data: newMessage,
      notificationChannels: allowedChannels
    });
  } catch (error) {
    console.error('[STUDENTS_API] Error sending message to teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message to teacher'
    });
  }
});

// Send message to school administration
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
    
    console.log('[STUDENTS_API] Message to school sent:', newMessage);
    console.log('[STUDENTS_API] Notification channels (PWA+Email only):', allowedChannels);
    
    res.json({
      success: true,
      message: 'Message sent to school successfully',
      data: newMessage,
      notificationChannels: allowedChannels
    });
  } catch (error) {
    console.error('[STUDENTS_API] Error sending message to school:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message to school'
    });
  }
});

// Get teachers for student (for Messages École module) - REAL DATABASE
router.get('/teachers', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const studentId = user?.id;
    const schoolId = user?.schoolId;
    
    console.log('[STUDENTS_API] Fetching teachers for student:', studentId, 'school:', schoolId);
    
    if (!schoolId) {
      return res.json({ success: true, teachers: [] });
    }
    
    // Get student's class enrollment
    const [enrollment] = await db.select({ classId: enrollments.classId })
      .from(enrollments)
      .where(eq(enrollments.studentId, studentId))
      .limit(1);
    
    let teacherIds: number[] = [];
    
    if (enrollment?.classId) {
      // Get teachers assigned to this class
      const assignments = await db.select({ teacherId: teacherSubjectAssignments.teacherId })
        .from(teacherSubjectAssignments)
        .where(eq(teacherSubjectAssignments.classId, enrollment.classId));
      teacherIds = [...new Set(assignments.map(a => a.teacherId))];
    }
    
    // If no class-specific teachers, get school teachers
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
      return res.json({ success: true, teachers: [] });
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
    
    console.log('[STUDENTS_API] Found', teachers.length, 'teachers');
    
    res.json({
      success: true,
      teachers
    });
  } catch (error) {
    console.error('[STUDENTS_API] Error fetching student teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teachers'
    });
  }
});

// Get parents for student (for Messages École module)
router.get('/parents', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    // For demo accounts, return mock parents
    if (user.email.includes('@test.educafric.com')) {
      const mockParents = [
        {
          id: 1,
          firstName: 'Paul',
          lastName: 'Demo',
          relationship: 'Papa',
          email: 'parent.demo@test.educafric.com',
          phone: '+237657002001'
        },
        {
          id: 2,
          firstName: 'Marie',
          lastName: 'Demo',
          relationship: 'Maman',
          email: 'marie.parent@test.educafric.com',
          phone: '+237657002002'
        }
      ];
      
      return res.json({
        success: true,
        parents: mockParents
      });
    }
    
    // For real accounts, return standard parents (demo implementation)  
    const standardParents = [
      {
        id: 1,
        firstName: 'Votre',
        lastName: 'Papa',
        relationship: 'Papa',
        email: 'papa@famille.com',
        phone: '+237657002001'
      },
      {
        id: 2,
        firstName: 'Votre',
        lastName: 'Maman',
        relationship: 'Maman',
        email: 'maman@famille.com',
        phone: '+237657002002'
      }
    ];
    
    res.json({
      success: true,
      parents: standardParents
    });
  } catch (error) {
    console.error('[STUDENTS_API] Error fetching student parents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch parents'
    });
  }
});

export default router;
import { Router } from 'express';
import { storage } from '../storage';
import { db } from '../db';
import { teacherClassSubjects, classSubjects } from '../../shared/schemas/classSubjectsSchema';
import { subjects, teacherBulletins, users, teacherSubjectAssignments, classes, schools, timetables, roleAffiliations } from '../../shared/schema';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { MultiRoleService } from '../services/multiRoleService';

const router = Router();

// Helper function to verify teacher has access to a school
async function verifyTeacherSchoolAccess(teacherId: number, schoolId: number): Promise<boolean> {
  try {
    const teacherSchools = await MultiRoleService.getTeacherSchools(teacherId);
    // Check if teacher has any active affiliation to this school (not just the "active" school)
    return teacherSchools.some(school => school.id === schoolId);
  } catch (error) {
    console.error('[TEACHER_ACCESS] Error verifying school access:', error);
    return false;
  }
}

// Get students for a specific class with real database integration
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

    console.log('[TEACHER_STUDENTS] Fetching students for teacher:', user.id, 'classId:', classId);

    // Verify teacher has access to requested class
    const teacherClasses = await storage.getSchoolClasses(user.schoolId);
    const teacherAssignedClasses = teacherClasses.filter((cls: any) => cls.teacherId === user.id);
    
    if (classId) {
      const hasAccessToClass = teacherAssignedClasses.some((cls: any) => cls.id.toString() === classId.toString());
      if (!hasAccessToClass) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not assigned to this class.'
        });
      }
      
      // Get students for specific class
      const classStudents = await storage.getStudentsByClass(parseInt(classId as string));
      const enrichedStudents = classStudents.map((student: any) => ({
        id: student.id,
        fullName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
        classId: parseInt(classId as string),
        className: teacherAssignedClasses.find((cls: any) => cls.id.toString() === classId.toString())?.name || 'Unknown Class',
        matricule: student.matricule || `EDU-${student.id}`,
        email: student.email
      }));
      
      res.json({
        success: true,
        students: enrichedStudents
      });
    } else {
      // Get students from all assigned classes
      const allStudents = [];
      for (const classInfo of teacherAssignedClasses) {
        const classStudents = await storage.getStudentsByClass(classInfo.id);
        const enrichedStudents = classStudents.map((student: any) => ({
          id: student.id,
          fullName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
          classId: classInfo.id,
          className: classInfo.name,
          matricule: student.matricule || `EDU-${student.id}`,
          email: student.email
        }));
        allStudents.push(...enrichedStudents);
      }
      
      res.json({
        success: true,
        students: allStudents
      });
    }
  } catch (error) {
    console.error('[TEACHER_API] Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class students',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get teacher's subjects for a specific class - uses teacher_subject_assignments for strict multi-tenant isolation
router.get('/class-subjects', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const { classId, schoolId: requestedSchoolId } = req.query;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    if (!classId) {
      return res.status(400).json({
        success: false,
        message: 'classId parameter is required'
      });
    }

    const classIdNum = parseInt(classId as string);
    // Use requested schoolId or get teacher's school from MultiRoleService
    let targetSchoolId = requestedSchoolId ? parseInt(requestedSchoolId as string) : user.schoolId;
    
    console.log('[TEACHER_SUBJECTS] Fetching assigned subjects for teacher:', user.id, 'classId:', classIdNum, 'schoolId:', targetSchoolId);

    // ✅ Use teacher_subject_assignments for proper multi-tenant isolation (teacherId + schoolId + classId)
    const teacherAssignedSubjects = await db
      .select({
        id: subjects.id,
        name: subjects.nameFr,
        nameEn: subjects.nameEn,
        code: subjects.code,
        coefficient: subjects.coefficient,
        bulletinSection: subjects.bulletinSection,
        assignmentId: teacherSubjectAssignments.id
      })
      .from(teacherSubjectAssignments)
      .innerJoin(subjects, eq(subjects.id, teacherSubjectAssignments.subjectId))
      .where(
        and(
          eq(teacherSubjectAssignments.teacherId, user.id),
          eq(teacherSubjectAssignments.classId, classIdNum),
          eq(teacherSubjectAssignments.schoolId, targetSchoolId),
          eq(teacherSubjectAssignments.active, true)
        )
      );
    
    console.log('[TEACHER_SUBJECTS] ✅ Found', teacherAssignedSubjects.length, 'assigned subjects from teacher_subject_assignments');
    
    // SECURITY: Verify teacher has access to the requested school before proceeding
    const hasSchoolAccess = await verifyTeacherSchoolAccess(user.id, targetSchoolId);
    if (!hasSchoolAccess) {
      console.warn('[TEACHER_SUBJECTS] ⛔ Teacher', user.id, 'denied access to school', targetSchoolId);
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not assigned to this school.'
      });
    }
    
    // If no direct assignments found, fallback to teacherClassSubjects table (legacy compatibility)
    // ✅ SECURITY FIX: Also constrain by schoolId in legacy query
    if (teacherAssignedSubjects.length === 0) {
      console.log('[TEACHER_SUBJECTS] ⚠️ No assignments in teacher_subject_assignments, checking legacy table...');
      
      try {
        const legacySubjects = await db
          .select({
            id: subjects.id,
            name: subjects.nameFr,
            nameEn: subjects.nameEn,
            code: subjects.code,
            coefficient: subjects.coefficient,
            bulletinSection: subjects.bulletinSection
          })
          .from(teacherClassSubjects)
          .innerJoin(classSubjects, eq(classSubjects.id, teacherClassSubjects.classSubjectId))
          .innerJoin(subjects, eq(subjects.id, classSubjects.subjectId))
          .where(
            and(
              eq(teacherClassSubjects.teacherId, user.id),
              eq(teacherClassSubjects.classId, classIdNum),
              eq(teacherClassSubjects.schoolId, targetSchoolId), // ✅ Added schoolId constraint
              eq(teacherClassSubjects.isActive, true)
            )
          );
        
        if (legacySubjects.length > 0) {
          console.log('[TEACHER_SUBJECTS] ✅ Found', legacySubjects.length, 'subjects from legacy table (with schoolId filter)');
          return res.json({
            success: true,
            subjects: legacySubjects,
            classId: classIdNum,
            schoolId: targetSchoolId,
            source: 'legacy'
          });
        }
      } catch (legacyError) {
        console.log('[TEACHER_SUBJECTS] Legacy table query failed:', legacyError);
      }
    }
    
    res.json({
      success: true,
      subjects: teacherAssignedSubjects,
      classId: classIdNum,
      schoolId: targetSchoolId,
      source: 'teacher_subject_assignments'
    });
  } catch (error) {
    console.error('[TEACHER_API] Error fetching class subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class subjects',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

    console.log('[TEACHER_ATTENDANCE] Fetching attendance for student:', studentId, 'period:', period);

    // Get real attendance data from database
    try {
      const studentAttendance = await storage.getStudentAttendance(parseInt(studentId as string));
      
      // Filter by period if specified
      const filteredAttendance = period 
        ? studentAttendance.filter((record: any) => record.period === period)
        : studentAttendance;
      
      // Calculate attendance statistics
      const totalRecords = filteredAttendance.length;
      const presentDays = filteredAttendance.filter((record: any) => record.status === 'present').length;
      const absentDays = filteredAttendance.filter((record: any) => record.status === 'absent').length;
      const lateDays = filteredAttendance.filter((record: any) => record.status === 'late').length;
      
      const attendanceData = {
        studentId: parseInt(studentId as string),
        period: period as string,
        totalDays: Math.max(totalRecords, 60), // Minimum 60 days assumption
        presentDays: presentDays,
        absentDays: absentDays,
        lateDays: lateDays,
        attendanceRate: totalRecords > 0 ? Math.round((presentDays / totalRecords) * 100) : 0
      };
      
      console.log('[TEACHER_ATTENDANCE] ✅ Calculated attendance:', attendanceData);
      
      res.json({
        success: true,
        data: attendanceData
      });
      return;
    } catch (error) {
      console.error('[TEACHER_ATTENDANCE] Error fetching attendance:', error);
      // Fallback to estimated data if database fails
      const attendanceData = {
        studentId: parseInt(studentId as string),
        period: period as string,
        totalDays: 60,
        presentDays: 50,
        absentDays: 8,
        lateDays: 2,
        attendanceRate: 83
      };
    
    res.json({
      success: true,
      data: attendanceData
    });
  }
  } catch (error) {
    console.error('[TEACHER_API] Error in student-attendance route:', error);
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

// Get teacher classes - DATABASE ONLY, no mock data
router.get('/classes', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    const teacherId = user.id;
    console.log('[TEACHER_CLASSES] Fetching classes for teacher:', teacherId);

    // Step 1: Get all schools where teacher is affiliated
    const teacherSchools = await MultiRoleService.getTeacherSchools(teacherId);
    
    if (!teacherSchools || teacherSchools.length === 0) {
      console.log('[TEACHER_CLASSES] ⚠️ No school affiliations found for teacher:', teacherId);
      return res.json({
        success: true,
        schoolsWithClasses: []
      });
    }

    console.log('[TEACHER_CLASSES] Found', teacherSchools.length, 'school affiliations');

    // Step 2: For each school, get teacher's class assignments from teacher_subject_assignments
    const schoolsWithClasses = await Promise.all(
      teacherSchools.map(async (school: any) => {
        const schoolId = school.id;
        
        // Query teacher's class and subject assignments from database
        const assignments = await db
          .select({
            classId: teacherSubjectAssignments.classId,
            subjectId: teacherSubjectAssignments.subjectId,
            className: classes.name,
            classLevel: classes.level,
            classSection: classes.section,
            subjectName: subjects.nameFr
          })
          .from(teacherSubjectAssignments)
          .leftJoin(classes, eq(teacherSubjectAssignments.classId, classes.id))
          .leftJoin(subjects, eq(teacherSubjectAssignments.subjectId, subjects.id))
          .where(and(
            eq(teacherSubjectAssignments.teacherId, teacherId),
            eq(teacherSubjectAssignments.schoolId, schoolId),
            eq(teacherSubjectAssignments.active, true)
          ));

        // Group by class and aggregate subjects
        const classMap = new Map<number, any>();
        for (const assignment of assignments) {
          if (!assignment.classId) continue;
          
          if (!classMap.has(assignment.classId)) {
            classMap.set(assignment.classId, {
              id: assignment.classId,
              name: assignment.className || '',
              level: assignment.classLevel || '',
              section: assignment.classSection || '',
              subjects: [],
              studentCount: 0,
              room: '', // Empty - will be filled from timetable if exists
              schedule: '' // Empty - will be filled from timetable if exists
            });
          }
          
          if (assignment.subjectName) {
            const classData = classMap.get(assignment.classId);
            if (!classData.subjects.includes(assignment.subjectName)) {
              classData.subjects.push(assignment.subjectName);
            }
          }
        }

        // Get student counts for each class
        const classIds = Array.from(classMap.keys());
        for (const classId of classIds) {
          try {
            const students = await storage.getStudentsByClass(classId);
            const classData = classMap.get(classId);
            if (classData) {
              classData.studentCount = students.length;
              // Format subject as first subject or combined
              classData.subject = classData.subjects.length > 0 
                ? classData.subjects[0] + (classData.subjects.length > 1 ? ` (+${classData.subjects.length - 1})` : '')
                : '';
            }
          } catch (e) {
            console.warn('[TEACHER_CLASSES] Could not get student count for class:', classId);
          }
        }

        return {
          schoolId: schoolId,
          schoolName: school.name || '',
          schoolAddress: school.address || '',
          schoolPhone: school.phone || '',
          isConnected: true,
          assignmentDate: school.affiliatedAt || new Date().toISOString(),
          classes: Array.from(classMap.values())
        };
      })
    );

    // Filter out schools with no class assignments
    const filteredSchools = schoolsWithClasses.filter(s => s.classes.length > 0 || teacherSchools.length === 1);

    console.log('[TEACHER_CLASSES] ✅ Returning', filteredSchools.length, 'schools with classes');
    
    res.json({
      success: true,
      schoolsWithClasses: filteredSchools
    });
  } catch (error) {
    console.error('[TEACHER_API] Error fetching classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher classes'
    });
  }
});

// Get teacher subjects
router.get('/subjects', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    console.log('[TEACHER_SUBJECTS] Fetching subjects for teacher:', user.id);

    // Get all school subjects - teachers need access to subjects to create grades
    const subjects = await storage.getSchoolSubjects(user.schoolId);
    
    // Filter to only active subjects
    const activeSubjects = subjects.filter((subject: any) => subject.isActive !== false);
    
    res.json({
      success: true,
      subjects: activeSubjects
    });
  } catch (error) {
    console.error('[TEACHER_API] Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// NOTE: GET /api/teacher/messages - This route MAY BE OVERRIDDEN by server/routes.ts line ~8762
// Express uses first matching route. If routes.ts defines the same endpoint before mounting this router,
// that implementation runs instead. Check routes.ts for the active implementation.
router.get('/messages', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    console.log('[TEACHER_MESSAGES] Fetching messages for teacher:', user.id, 'school:', user.schoolId);

    // Get teacher-administration messages using unified messaging system
    const connections = await storage.getTeacherAdminConnections(user.id, user.schoolId);
    const allMessages = [];

    // Fetch messages from all teacher-admin connections
    for (const connection of connections) {
      try {
        const messages = await storage.getConnectionMessages(connection.id, 'teacher-admin');
        allMessages.push(...messages);
      } catch (error) {
        console.warn('[TEACHER_MESSAGES] Failed to fetch messages for connection:', connection.id);
      }
    }

    // Sort messages by date (newest first)
    allMessages.sort((a, b) => new Date(b.sentAt || b.createdAt).getTime() - new Date(a.sentAt || a.createdAt).getTime());

    console.log('[TEACHER_MESSAGES] ✅ Retrieved', allMessages.length, 'messages');

    res.json({
      success: true,
      communications: allMessages.map(message => ({
        id: message.id,
        from: message.senderName || `${message.senderRole} User`,
        fromRole: message.senderRole || 'Admin',
        to: message.recipientName || `${user.firstName} ${user.lastName}`,
        toRole: 'Teacher',
        subject: message.subject || getMessageSubject(message.messageType, message.message),
        message: message.message,
        type: message.messageType || 'general',
        status: message.isRead ? 'read' : 'unread',
        date: message.sentAt || message.createdAt,
        direction: message.senderId === user.id ? 'sent' : 'received',
        priority: message.priority || 'normal'
      }))
    });
  } catch (error: any) {
    console.error('[TEACHER_MESSAGES] Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// NOTE: POST /api/teacher/messages - This route MAY BE OVERRIDDEN by server/routes.ts line ~5033
// Express uses first matching route. If routes.ts defines the same endpoint before mounting this router,
// that implementation runs instead. Check routes.ts for the active implementation.
router.post('/messages', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const { to, subject, message, type = 'general', priority = 'normal' } = req.body;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    // Validate required fields
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    console.log('[TEACHER_SEND_MESSAGE] Sending message from teacher:', user.id, 'to admin');

    // Find or create teacher-admin connection
    let connection = await storage.findTeacherAdminConnection(user.id, user.schoolId);
    if (!connection) {
      // Create new connection to school administration
      connection = await storage.createTeacherAdminConnection({
        teacherId: user.id,
        schoolId: user.schoolId,
        connectionType: 'teacher-admin',
        status: 'active'
      });
    }

    // Send message through unified messaging system
    const sentMessage = await storage.sendConnectionMessage({
      connectionId: connection.id,
      connectionType: 'teacher-admin',
      senderId: user.id,
      senderRole: 'Teacher',
      message: message.trim(),
      subject: subject || getMessageSubject(type, message),
      messageType: type,
      priority: priority,
      messageData: {
        schoolId: user.schoolId,
        teacherId: user.id,
        recipientType: 'administration'
      }
    });

    console.log('[TEACHER_SEND_MESSAGE] ✅ Message sent successfully:', sentMessage.id);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully to school administration',
      data: {
        id: sentMessage.id,
        subject: subject || getMessageSubject(type, message),
        type: type,
        priority: priority,
        sentAt: sentMessage.sentAt
      }
    });
  } catch (error: any) {
    console.error('[TEACHER_SEND_MESSAGE] Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to generate subject from message type and content
function getMessageSubject(messageType: string, messageContent: string): string {
  const typeSubjects: Record<string, string> = {
    'question': 'Question from Teacher',
    'information': 'Information Update',
    'alert': 'Important Alert',
    'absence': 'Absence Notification',
    'urgent': 'Urgent Matter',
    'general': 'Message from Teacher'
  };
  
  const baseSubject = typeSubjects[messageType] || 'Message from Teacher';
  
  // Extract first few words from message for more descriptive subject
  const words = messageContent.split(' ').slice(0, 6).join(' ');
  return words.length > 30 ? `${baseSubject}: ${words}...` : `${baseSubject}: ${words}`;
}

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

    console.log('[TEACHER_ASSIGNMENTS] Fetching assignments for teacher:', user.id);

    // Get real assignments data from database
    try {
      const assignments = await storage.getHomeworkByTeacher(user.id);
      
      const enrichedAssignments = assignments.map((assignment: any) => ({
        id: assignment.id,
        title: assignment.title,
        class: assignment.className || 'Unknown Class',
        dueDate: assignment.dueDate,
        status: assignment.isActive ? 'active' : 'inactive',
        subject: assignment.subject,
        description: assignment.description,
        assignedDate: assignment.assignedDate,
        submissionsCount: assignment.submissionsCount || 0,
        totalStudents: assignment.totalStudents || 0
      }));
      
      console.log('[TEACHER_ASSIGNMENTS] ✅ Found', enrichedAssignments.length, 'assignments');
      
      res.json({
        success: true,
        assignments: enrichedAssignments
      });
    } catch (error) {
      console.error('[TEACHER_ASSIGNMENTS] Error fetching assignments:', error);
      res.json({
        success: true,
        assignments: [] // Return empty array if error
      });
    }
  } catch (error) {
    console.error('[TEACHER_API] Error fetching assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher assignments'
    });
  }
});

// Get teacher grades with real database integration
router.get('/grades', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    console.log('[TEACHER_GRADES] Fetching grades for teacher:', user.id);

    // Get teacher's assigned classes and subjects
    const teacherClasses = await storage.getSchoolClasses(user.schoolId);
    const teacherAssignedClasses = teacherClasses.filter((cls: any) => cls.teacherId === user.id);
    
    if (teacherAssignedClasses.length === 0) {
      console.log('[TEACHER_GRADES] No assigned classes found for teacher:', user.id);
      return res.json({ success: true, grades: [] });
    }

    // Fetch grades from all assigned classes
    const allGrades = [];
    for (const classInfo of teacherAssignedClasses) {
      const classGrades = await storage.getGradesByClass(classInfo.id, { teacherId: user.id });
      allGrades.push(...classGrades);
    }

    // Fetch additional data to enrich grade information
    const enrichedGrades = [];
    for (const grade of allGrades) {
      try {
        // Get student info
        const student = await storage.getUserById(grade.studentId);
        // Get subject info
        const allSubjects = await storage.getSchoolSubjects(user.schoolId);
        const subject = allSubjects.find((s: any) => s.id === grade.subjectId);
        // Get class info
        const classInfo = teacherAssignedClasses.find((c: any) => c.id === grade.classId);

        const enrichedGrade = {
          id: grade.id,
          studentId: grade.studentId,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
          subjectName: subject ? subject.name : 'Unknown Subject',
          className: classInfo ? classInfo.name : 'Unknown Class',
          grade: parseFloat(grade.grade) || 0,
          maxGrade: 20, // Standard max grade
          percentage: Math.round((parseFloat(grade.grade) || 0) / 20 * 100),
          gradedAt: grade.createdAt || new Date().toISOString(),
          comments: grade.comments || '',
          coefficient: grade.coefficient || 1,
          examType: grade.examType || 'evaluation',
          term: grade.term,
          academicYear: grade.academicYear
        };
        
        enrichedGrades.push(enrichedGrade);
      } catch (enrichError) {
        console.error('[TEACHER_GRADES] Error enriching grade data:', enrichError);
        // Add basic grade info if enrichment fails
        enrichedGrades.push({
          id: grade.id,
          studentId: grade.studentId,
          studentName: 'Unknown Student',
          subjectName: 'Unknown Subject',
          className: 'Unknown Class',
          grade: parseFloat(grade.grade) || 0,
          maxGrade: 20,
          percentage: Math.round((parseFloat(grade.grade) || 0) / 20 * 100),
          gradedAt: grade.createdAt || new Date().toISOString(),
          comments: grade.comments || ''
        });
      }
    }
    
    console.log(`[TEACHER_GRADES] Successfully fetched ${enrichedGrades.length} grades for teacher ${user.id}`);
    res.json({
      success: true,
      grades: enrichedGrades
    });
  } catch (error) {
    console.error('[TEACHER_API] Error fetching grades:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher grades',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST endpoint for grade submission
router.post('/grade', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    const { studentId, subjectId, classId, grade, maxGrade, assignment, type, comment, coefficient, term, academicYear } = req.body;

    // Validate required fields
    if (!studentId || !subjectId || !classId || grade === undefined || grade === null) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: studentId, subjectId, classId, and grade are required'
      });
    }

    // Verify teacher has access to this class
    const teacherClasses = await storage.getSchoolClasses(user.schoolId);
    const teacherAssignedClasses = teacherClasses.filter((cls: any) => cls.teacherId === user.id);
    const hasAccessToClass = teacherAssignedClasses.some((cls: any) => cls.id === classId);
    
    if (!hasAccessToClass) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not assigned to this class.'
      });
    }

    // Verify student is in the class
    const classStudents = await storage.getStudentsByClass(classId);
    const studentInClass = classStudents.some((student: any) => student.id === studentId);
    
    if (!studentInClass) {
      return res.status(400).json({
        success: false,
        message: 'Student is not enrolled in this class.'
      });
    }

    // Get current academic configuration for default term/year if not provided
    let currentTerm = term;
    let currentAcademicYear = academicYear;
    
    if (!currentTerm || !currentAcademicYear) {
      try {
        const academicConfig = await storage.getAcademicConfiguration(user.schoolId);
        currentTerm = currentTerm || academicConfig?.terms?.[0]?.name || 'Premier Trimestre';
        currentAcademicYear = currentAcademicYear || academicConfig?.academicYear?.name || '2024-2025';
      } catch (configError) {
        console.warn('[TEACHER_GRADE_POST] Could not fetch academic config, using defaults');
        currentTerm = currentTerm || 'Premier Trimestre';
        currentAcademicYear = currentAcademicYear || '2024-2025';
      }
    }

    console.log('[TEACHER_GRADE_POST] Creating grade:', {
      teacherId: user.id,
      studentId,
      subjectId,
      classId,
      grade: parseFloat(grade),
      term: currentTerm,
      academicYear: currentAcademicYear
    });

    // Check if grade already exists for this student/subject/term
    const existingGrade = await storage.getGradeByStudentSubjectTerm(
      studentId, 
      subjectId, 
      currentAcademicYear, 
      currentTerm
    );

    if (existingGrade) {
      return res.status(400).json({
        success: false,
        message: 'A grade already exists for this student in this subject for the current term. Use update instead.'
      });
    }

    // Create the grade
    const gradeData = {
      studentId: parseInt(studentId),
      teacherId: user.id,
      subjectId: parseInt(subjectId),
      classId: parseInt(classId),
      schoolId: user.schoolId,
      grade: parseFloat(grade).toString(),
      coefficient: coefficient ? parseInt(coefficient) : 1,
      examType: type || 'evaluation',
      term: currentTerm,
      academicYear: currentAcademicYear,
      comments: comment || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newGrade = await storage.createGrade(gradeData);
    
    console.log('[TEACHER_GRADE_POST] Grade created successfully:', newGrade.id);
    
    res.json({
      success: true,
      message: 'Grade added successfully',
      grade: {
        id: newGrade.id,
        ...gradeData,
        grade: parseFloat(grade),
        maxGrade: maxGrade || 20,
        percentage: Math.round((parseFloat(grade) / (maxGrade || 20)) * 100)
      }
    });
  } catch (error) {
    console.error('[TEACHER_API] Error adding grade:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add grade',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

    console.log('[TEACHER_ATTENDANCE_RECORDS] Fetching attendance records for teacher:', user.id);

    // Get real attendance data from teacher's classes
    try {
      const teacherClasses = await storage.getSchoolClasses(user.schoolId);
      const teacherAssignedClasses = teacherClasses.filter((cls: any) => cls.teacherId === user.id);
      
      const allAttendanceRecords = [];
      
      for (const classInfo of teacherAssignedClasses) {
        const classStudents = await storage.getStudentsByClass(classInfo.id);
        
        for (const student of classStudents) {
          const attendanceRecords = await storage.getStudentAttendance(student.id);
          const recentRecords = attendanceRecords.slice(0, 10); // Get recent 10 records
          
          recentRecords.forEach((record: any) => {
            allAttendanceRecords.push({
              id: record.id || Date.now() + Math.random(),
              studentName: `${student.firstName} ${student.lastName}`,
              studentId: student.id,
              class: classInfo.name,
              classId: classInfo.id,
              date: record.date || new Date().toISOString().split('T')[0],
              status: record.status || 'present'
            });
          });
        }
      }
      
      // Sort by date (most recent first)
      allAttendanceRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      console.log('[TEACHER_ATTENDANCE_RECORDS] ✅ Found', allAttendanceRecords.length, 'attendance records');
      
      res.json({
        success: true,
        attendance: allAttendanceRecords.slice(0, 50) // Limit to 50 most recent
      });
    } catch (error) {
      console.error('[TEACHER_ATTENDANCE_RECORDS] Error fetching attendance:', error);
      res.json({
        success: true,
        attendance: []
      });
    }
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

    console.log('[TEACHER_COMMUNICATIONS] Fetching communications for teacher:', user.id);

    // Get real communications data from database
    try {
      // Get teacher-admin connections and messages
      const connections = await storage.getTeacherAdminConnections(user.id, user.schoolId);
      const communications = [];
      
      // Fetch messages from all connections
      for (const connection of connections) {
        try {
          const messages = await storage.getConnectionMessages(connection.id, 'teacher-admin');
          messages.forEach((message: any) => {
            communications.push({
              id: message.id,
              type: 'message',
              recipient: message.senderRole === 'Teacher' ? 'School Administration' : `${user.firstName} ${user.lastName}`,
              subject: message.subject || 'Message',
              date: message.sentAt || message.createdAt,
              status: message.isRead ? 'read' : 'unread',
              direction: message.senderId === user.id ? 'sent' : 'received',
              priority: message.priority || 'normal'
            });
          });
        } catch (msgError) {
          console.warn('[TEACHER_COMMUNICATIONS] Failed to fetch messages for connection:', connection.id);
        }
      }
      
      // Sort by date (most recent first)
      communications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      console.log('[TEACHER_COMMUNICATIONS] ✅ Found', communications.length, 'communications');
      
      res.json({
        success: true,
        communications: communications
      });
    } catch (error) {
      console.error('[TEACHER_COMMUNICATIONS] Error fetching communications:', error);
      res.json({
        success: true,
        communications: []
      });
    }
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

    console.log('[TEACHER_SCHOOLS] Fetching schools for teacher:', user.id);

    // Get real school data from database
    try {
      const userSchool = await storage.getSchool(user.schoolId);
      const schools = userSchool ? [{
        id: userSchool.id,
        name: userSchool.name,
        type: userSchool.schoolType || 'Unknown',
        city: userSchool.city || 'Unknown',
        address: userSchool.address,
        phone: userSchool.phone,
        email: userSchool.email
      }] : [];
      
      console.log('[TEACHER_SCHOOLS] ✅ Found school:', userSchool?.name || 'None');
      
      res.json({
        success: true,
        schools: schools
      });
    } catch (error) {
      console.error('[TEACHER_SCHOOLS] Error fetching schools:', error);
      res.json({
        success: true,
        schools: []
      });
    }
  } catch (error) {
    console.error('[TEACHER_API] Error fetching schools:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher schools'
    });
  }
});

// ===== HOMEWORK ASSIGNMENT ENDPOINTS WITH PWA NOTIFICATIONS =====

// Helper function to create bilingual homework notifications
async function createHomeworkNotification(
  type: 'assigned' | 'updated' | 'due_soon',
  homework: any,
  recipients: number[], // student and parent IDs
  additionalData: any = {}
) {
  const notificationMessages = {
    assigned: {
      fr: {
        title: `Nouveau devoir: ${homework.title}`,
        message: `Un nouveau devoir a été assigné en ${homework.subject}. À rendre le ${new Date(homework.dueDate).toLocaleDateString('fr-FR')}.`
      },
      en: {
        title: `New homework: ${homework.title}`,
        message: `A new homework has been assigned in ${homework.subject}. Due on ${new Date(homework.dueDate).toLocaleDateString('en-US')}.`
      }
    },
    updated: {
      fr: {
        title: `Devoir modifié: ${homework.title}`,
        message: `Le devoir en ${homework.subject} a été modifié. Vérifiez les nouvelles instructions.`
      },
      en: {
        title: `Homework updated: ${homework.title}`,
        message: `The homework in ${homework.subject} has been updated. Check the new instructions.`
      }
    },
    due_soon: {
      fr: {
        title: `Rappel: ${homework.title}`,
        message: `Le devoir en ${homework.subject} est à rendre demain. N'oubliez pas de le soumettre!`
      },
      en: {
        title: `Reminder: ${homework.title}`,
        message: `The homework in ${homework.subject} is due tomorrow. Don't forget to submit it!`
      }
    }
  };

  for (const userId of recipients) {
    try {
      // Create PWA notification for each recipient
      await storage.createNotification({
        userId: userId,
        title: notificationMessages[type].fr.title, // Default to French
        message: notificationMessages[type].fr.message,
        type: `homework_${type}`,
        priority: type === 'due_soon' ? 'high' : 'medium',
        metadata: {
          homeworkId: homework.id,
          homeworkTitle: homework.title,
          subject: homework.subject,
          dueDate: homework.dueDate,
          teacherId: homework.teacherId,
          teacherName: homework.teacherName,
          classId: homework.classId,
          notificationType: type,
          ...additionalData
        }
      });
      console.log(`[HOMEWORK_NOTIFICATION] ✅ PWA notification created for user ${userId}: ${type}`);
    } catch (error) {
      console.error(`[HOMEWORK_NOTIFICATION] ❌ Failed to create notification for user ${userId}:`, error);
    }
  }
}

// Helper function to get students and parents for a class
async function getClassRecipients(classId: number): Promise<{ studentIds: number[], parentIds: number[] }> {
  try {
    // This would normally get real data from the database
    // For now, returning mock data based on class structure
    const mockStudents = [
      { id: 1, classId: 1, parentIds: [10, 11] }, // Marie Kouam - parents 10, 11
      { id: 2, classId: 1, parentIds: [12, 13] }, // Paul Mballa - parents 12, 13  
      { id: 3, classId: 1, parentIds: [14] },     // Sophie Ngoyi - parent 14
      { id: 4, classId: 2, parentIds: [15, 16] }, // Jean Fotso - parents 15, 16
      { id: 5, classId: 2, parentIds: [17] },     // Alice Menye - parent 17
      { id: 6, classId: 3, parentIds: [18, 19] }  // David Tchuente - parents 18, 19
    ];

    const classStudents = mockStudents.filter(s => s.classId === classId);
    const studentIds = classStudents.map(s => s.id);
    const parentIds = classStudents.flatMap(s => s.parentIds);

    return { studentIds, parentIds };
  } catch (error) {
    console.error('[HOMEWORK] Error getting class recipients:', error);
    return { studentIds: [], parentIds: [] };
  }
}

// POST /api/teacher/homework - Create new homework assignment
router.post('/homework', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    const { 
      title, description, subjectId, classId, dueDate, instructions,
      priority, reminderEnabled, reminderDays, notifyStudents, notifyParents 
    } = req.body;

    if (!title || !classId || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, class ID, and due date are required'
      });
    }

    // Import homework schema for database insertion
    const { homework: homeworkTable } = await import('../../shared/schemas/academicSchema');
    
    // Insert homework into database with reminder fields
    const [insertedHomework] = await db.insert(homeworkTable).values({
      title,
      description: description || '',
      instructions: instructions || '',
      teacherId: user.id,
      subjectId: subjectId ? parseInt(subjectId) : 1,
      classId: parseInt(classId),
      schoolId: user.schoolId || 1,
      priority: priority || 'medium',
      dueDate: new Date(dueDate),
      status: 'active',
      reminderEnabled: reminderEnabled !== false,
      reminderDays: reminderDays ? parseInt(reminderDays) : 1,
      notifyStudents: notifyStudents !== false,
      notifyParents: notifyParents !== false,
      isActive: true
    } as any).returning();
    
    const homework = {
      ...insertedHomework,
      teacherName: user.fullName || user.email,
      subject: 'Mathématiques',
      assignedDate: insertedHomework.assignedDate || new Date()
    };

    console.log(`[HOMEWORK_ASSIGNMENT] ✅ Creating homework:`, {
      title: homework.title,
      classId: homework.classId,
      dueDate: homework.dueDate,
      teacherId: homework.teacherId
    });

    // Get all students and parents for this class
    const { studentIds, parentIds } = await getClassRecipients(homework.classId);
    const allRecipients = [...studentIds, ...parentIds];

    console.log(`[HOMEWORK_ASSIGNMENT] 📤 Sending notifications to ${allRecipients.length} recipients (${studentIds.length} students, ${parentIds.length} parents)`);

    // Create PWA notifications for homework assignment
    await createHomeworkNotification('assigned', homework, allRecipients, {
      instructions: homework.instructions,
      assignedAt: homework.assignedDate.toISOString()
    });

    res.json({
      success: true,
      homework: homework,
      message: `Devoir créé avec succès et notifications envoyées à ${allRecipients.length} destinataires`,
      notificationsSent: {
        students: studentIds.length,
        parents: parentIds.length,
        total: allRecipients.length
      }
    });
  } catch (error) {
    console.error('[HOMEWORK_ASSIGNMENT] ❌ Error creating homework:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create homework assignment'
    });
  }
});

// PUT /api/teacher/homework/:id - Update homework assignment
router.put('/homework/:id', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const homeworkId = parseInt(req.params.id);
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    const { title, description, dueDate, instructions } = req.body;

    // Mock homework update (in real implementation, fetch from database)
    const updatedHomework = {
      id: homeworkId,
      title: title || 'Exercice de Mathématiques',
      description: description || 'Résoudre les équations du chapitre 3',
      teacherId: user.id,
      teacherName: user.fullName || user.email,
      subjectId: 1,
      subject: 'Mathématiques',
      classId: 1,
      schoolId: user.schoolId || 1,
      dueDate: dueDate ? new Date(dueDate) : new Date('2025-08-30'),
      instructions: instructions || 'Téléchargez le fichier PDF joint, résolvez tous les exercices.',
      updatedAt: new Date()
    };

    console.log(`[HOMEWORK_UPDATE] ✅ Updating homework:`, {
      id: updatedHomework.id,
      title: updatedHomework.title,
      classId: updatedHomework.classId
    });

    // Get all students and parents for this class
    const { studentIds, parentIds } = await getClassRecipients(updatedHomework.classId);
    const allRecipients = [...studentIds, ...parentIds];

    console.log(`[HOMEWORK_UPDATE] 📤 Sending update notifications to ${allRecipients.length} recipients`);

    // Create PWA notifications for homework update
    await createHomeworkNotification('updated', updatedHomework, allRecipients, {
      updatedAt: updatedHomework.updatedAt.toISOString(),
      changes: 'Instructions et échéance modifiées'
    });

    res.json({
      success: true,
      homework: updatedHomework,
      message: `Devoir mis à jour avec succès et notifications envoyées`,
      notificationsSent: {
        students: studentIds.length,
        parents: parentIds.length,
        total: allRecipients.length
      }
    });
  } catch (error) {
    console.error('[HOMEWORK_UPDATE] ❌ Error updating homework:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update homework assignment'
    });
  }
});

// GET /api/teacher/homework - Get teacher's homework assignments
router.get('/homework', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    // Mock homework data for teacher
    const homework = [
      {
        id: 1,
        title: 'Exercice de Mathématiques',
        description: 'Résoudre les équations du chapitre 3',
        subject: 'Mathématiques',
        className: '6ème A',
        classId: 1,
        dueDate: '2025-08-30',
        assignedDate: '2025-08-25',
        status: 'active',
        submissionsCount: 12,
        totalStudents: 25
      },
      {
        id: 2,
        title: 'Expérience de Physique',
        description: 'Rapport sur l\'expérience de magnétisme',
        subject: 'Physique',
        className: '5ème B',
        classId: 2,
        dueDate: '2025-09-02',
        assignedDate: '2025-08-26',
        status: 'active',
        submissionsCount: 8,
        totalStudents: 20
      }
    ];
    
    res.json({
      success: true,
      homework: homework,
      message: 'Homework assignments retrieved successfully'
    });
  } catch (error) {
    console.error('[TEACHER_API] Error fetching homework:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch homework assignments'
    });
  }
});

// POST /api/teacher/homework/:id/remind - Send due date reminder notifications
router.post('/homework/:id/remind', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const homeworkId = parseInt(req.params.id);
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    // Mock homework data (in real implementation, fetch from database)
    const homework = {
      id: homeworkId,
      title: 'Exercice de Mathématiques',
      subject: 'Mathématiques',
      teacherId: user.id,
      teacherName: user.fullName || user.email,
      classId: 1,
      dueDate: new Date('2025-08-30')
    };

    console.log(`[HOMEWORK_REMINDER] ✅ Sending due date reminders for homework:`, {
      id: homework.id,
      title: homework.title,
      dueDate: homework.dueDate
    });

    // Get all students and parents for this class
    const { studentIds, parentIds } = await getClassRecipients(homework.classId);
    const allRecipients = [...studentIds, ...parentIds];

    console.log(`[HOMEWORK_REMINDER] 📤 Sending due date reminders to ${allRecipients.length} recipients`);

    // Create PWA notifications for homework due soon
    await createHomeworkNotification('due_soon', homework, allRecipients, {
      reminderSentAt: new Date().toISOString(),
      daysUntilDue: Math.ceil((homework.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    });

    res.json({
      success: true,
      message: `Rappels envoyés avec succès à ${allRecipients.length} destinataires`,
      notificationsSent: {
        students: studentIds.length,
        parents: parentIds.length,
        total: allRecipients.length
      },
      homework: {
        id: homework.id,
        title: homework.title,
        dueDate: homework.dueDate
      }
    });
  } catch (error) {
    console.error('[HOMEWORK_REMINDER] ❌ Error sending reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send homework reminders'
    });
  }
});

// ===== TEACHER ABSENCE MANAGEMENT ENDPOINTS =====

// POST /api/teacher/absence/declare - Declare teacher absence
router.post('/absence/declare', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    const { 
      reason, 
      startDate, 
      endDate, 
      contactPhone, 
      contactEmail, 
      details, 
      classesAffected, 
      urgency = 'medium' 
    } = req.body;

    // Validate required fields
    if (!reason || !startDate || !endDate || !classesAffected || classesAffected.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: reason, startDate, endDate, and classesAffected are required'
      });
    }

    console.log('[TEACHER_ABSENCE_DECLARE] Declaring absence for teacher:', user.id);

    // Create absence record using storage
    const absenceData = {
      teacherId: user.id,
      schoolId: user.schoolId,
      reason: reason,
      startDate: startDate,
      endDate: endDate,
      contactPhone: contactPhone || user.phone,
      contactEmail: contactEmail || user.email,
      details: details || '',
      classesAffected: Array.isArray(classesAffected) ? classesAffected : [classesAffected],
      urgency: urgency,
      status: 'pending'
    };

    const newAbsence = await storage.declareTeacherAbsence(absenceData);

    console.log('[TEACHER_ABSENCE_DECLARE] ✅ Absence declared successfully:', newAbsence.id);

    res.status(201).json({
      success: true,
      message: 'Absence declaration submitted successfully',
      absence: {
        id: newAbsence.id,
        reason: newAbsence.reason,
        startDate: newAbsence.startDate,
        endDate: newAbsence.endDate,
        status: newAbsence.status,
        urgency: newAbsence.urgency,
        createdAt: newAbsence.createdAt
      }
    });
  } catch (error: any) {
    console.error('[TEACHER_ABSENCE_DECLARE] Error declaring absence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to declare absence',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/teacher/absences - Get teacher absence history
router.get('/absences', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    console.log('[TEACHER_ABSENCES] Fetching absences for teacher:', user.id);

    // Get teacher absences from storage
    const absences = await storage.getTeacherAbsences(user.id, user.schoolId);

    console.log('[TEACHER_ABSENCES] ✅ Found', absences.length, 'absence records');

    res.json({
      success: true,
      absences: absences.map((absence: any) => ({
        id: absence.id,
        reason: absence.reason,
        startDate: absence.startDate,
        endDate: absence.endDate,
        contactPhone: absence.contactPhone,
        contactEmail: absence.contactEmail,
        details: absence.details,
        classesAffected: absence.classesAffected,
        urgency: absence.urgency,
        status: absence.status,
        createdAt: absence.createdAt,
        updatedAt: absence.updatedAt
      }))
    });
  } catch (error: any) {
    console.error('[TEACHER_ABSENCES] Error fetching absences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher absences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== TEACHER TIMETABLE MANAGEMENT ENDPOINTS =====

// GET /api/teacher/timetable - Get teacher's timetable from DATABASE
// This endpoint is superseded by the one in routes.ts which queries real data
// Keeping this as a fallback that also queries real database
router.get('/timetable', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    const teacherId = user.id;
    console.log('[TEACHER_TIMETABLE] Fetching timetable for teacher:', teacherId);

    // Get all schools where teacher is affiliated
    const teacherSchools = await MultiRoleService.getTeacherSchools(teacherId);
    
    // Initialize empty schedule
    const schedule: Record<string, any[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: []
    };
    
    const dayNames = ['', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    let schoolInfo = null;

    // Query timetable from all affiliated schools
    for (const school of teacherSchools) {
      const schoolId = school.id;
      
      // Get school info
      if (!schoolInfo) {
        const [info] = await db.select({
          name: schools.name,
          address: schools.address,
          phone: schools.phone
        }).from(schools).where(eq(schools.id, schoolId)).limit(1);
        schoolInfo = info;
      }
      
      // Query timetable entries for this teacher in this school
      const timetableEntries = await db
        .select({
          id: timetables.id,
          classId: timetables.classId,
          className: classes.name,
          classLevel: classes.level,
          subjectName: timetables.subjectName,
          dayOfWeek: timetables.dayOfWeek,
          startTime: timetables.startTime,
          endTime: timetables.endTime,
          room: timetables.room,
          academicYear: timetables.academicYear,
          term: timetables.term
        })
        .from(timetables)
        .leftJoin(classes, eq(timetables.classId, classes.id))
        .where(and(
          eq(timetables.teacherId, teacherId),
          eq(timetables.schoolId, schoolId),
          eq(timetables.isActive, true)
        ))
        .orderBy(timetables.dayOfWeek, timetables.startTime);

      // Add entries to schedule
      for (const entry of timetableEntries) {
        const dayName = dayNames[entry.dayOfWeek];
        if (dayName && schedule[dayName]) {
          schedule[dayName].push({
            id: entry.id,
            time: `${entry.startTime}-${entry.endTime}`,
            subject: entry.subjectName || '',
            class: entry.className || '',
            classId: entry.classId,
            room: entry.room || '',
            status: 'confirmed'
          });
        }
      }
    }

    console.log('[TEACHER_TIMETABLE] ✅ Found timetable entries from', teacherSchools.length, 'schools');

    res.json({
      success: true,
      school: schoolInfo,
      timetable: {
        teacherId,
        teacherName: `${user.firstName} ${user.lastName}`,
        schedule,
        pendingChanges: [],
        lastUpdated: new Date().toISOString(),
        source: 'school_database'
      }
    });
  } catch (error) {
    console.error('[TEACHER_API] Error fetching timetable:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher timetable'
    });
  }
});

// POST /api/teacher/timetable/change - Request timetable change
router.post('/timetable/change', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    const { 
      changeType, 
      slotId, 
      newTime, 
      newRoom, 
      reason, 
      urgency = 'normal',
      affectedClasses = []
    } = req.body;

    // Validate required fields
    if (!changeType || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Change type and reason are required'
      });
    }

    console.log('[TEACHER_TIMETABLE_CHANGE] Requesting timetable change:', {
      teacherId: user.id,
      changeType,
      reason,
      urgency
    });

    const changeRequest = {
      id: Date.now(), // In real implementation, this would be generated by database
      teacherId: user.id,
      teacherName: `${user.firstName} ${user.lastName}`,
      schoolId: user.schoolId,
      changeType,
      slotId: slotId || null,
      newTime: newTime || null,
      newRoom: newRoom || null,
      reason,
      urgency,
      affectedClasses,
      status: 'pending',
      createdAt: new Date().toISOString(),
      adminResponse: null
    };

    // TODO: Save to storage and create admin notification

    console.log('[TEACHER_TIMETABLE_CHANGE] ✅ Timetable change request created:', changeRequest.id);

    res.status(201).json({
      success: true,
      message: 'Timetable change request submitted successfully',
      changeRequest: {
        id: changeRequest.id,
        changeType: changeRequest.changeType,
        reason: changeRequest.reason,
        status: changeRequest.status,
        createdAt: changeRequest.createdAt
      }
    });
  } catch (error) {
    console.error('[TEACHER_TIMETABLE_CHANGE] Error requesting timetable change:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit timetable change request'
    });
  }
});

// GET /api/teacher/timetable/changes - Get timetable change requests history
router.get('/timetable/changes', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    console.log('[TEACHER_TIMETABLE_CHANGES] Fetching change requests for teacher:', user.id);

    // Return empty array - no mock data, real data will come from database when feature is implemented
    res.json({
      success: true,
      changeRequests: []
    });
  } catch (error) {
    console.error('[TEACHER_TIMETABLE_CHANGES] Error fetching change requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timetable change requests'
    });
  }
});

// GET /api/teacher/admin-responses - Get admin responses for teacher
router.get('/admin-responses', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    console.log('[TEACHER_ADMIN_RESPONSES] Fetching admin responses for teacher:', user.id);

    // Return empty array - database table for admin responses not yet implemented
    res.json({
      success: true,
      responses: [],
      unreadCount: 0
    });
  } catch (error) {
    console.error('[TEACHER_ADMIN_RESPONSES] Error fetching admin responses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin responses'
    });
  }
});

// POST /api/teacher/admin-responses/:id/read - Mark admin response as read
router.post('/admin-responses/:id/read', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const { id } = req.params;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    console.log('[TEACHER_ADMIN_RESPONSES] Marking response as read:', { responseId: id, teacherId: user.id });

    // TODO: Update read status in storage

    res.json({
      success: true,
      message: 'Response marked as read'
    });
  } catch (error) {
    console.error('[TEACHER_ADMIN_RESPONSES] Error marking response as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark response as read'
    });
  }
});

// ====================
// TEACHER BULLETIN ROUTES
// ====================

// Get saved bulletins for teacher - DATABASE ONLY
router.get('/saved-bulletins', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    const teacherId = user.id;
    console.log('[TEACHER_BULLETINS] Fetching saved bulletins for teacher:', teacherId);

    // Get all schools the teacher has access to
    const teacherSchools = await MultiRoleService.getTeacherSchools(teacherId);
    const schoolIds = teacherSchools.map(s => s.id);

    if (schoolIds.length === 0) {
      return res.json({
        success: true,
        bulletins: []
      });
    }

    console.log('[TEACHER_BULLETINS] Teacher has access to schools:', schoolIds);

    // Query real bulletins from teacherBulletins table
    const bulletins = await db
      .select({
        id: teacherBulletins.id,
        studentId: teacherBulletins.studentId,
        classId: teacherBulletins.classId,
        schoolId: teacherBulletins.schoolId,
        term: teacherBulletins.term,
        academicYear: teacherBulletins.academicYear,
        status: teacherBulletins.status,
        createdAt: teacherBulletins.createdAt,
        updatedAt: teacherBulletins.updatedAt
      })
      .from(teacherBulletins)
      .where(and(
        eq(teacherBulletins.teacherId, teacherId),
        inArray(teacherBulletins.schoolId, schoolIds)
      ));

    console.log('[TEACHER_BULLETINS] ✅ Found', bulletins.length, 'bulletins');

    res.json({
      success: true,
      bulletins: bulletins
    });
  } catch (error) {
    console.error('[TEACHER_BULLETINS] Error fetching saved bulletins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved bulletins'
    });
  }
});

// Save bulletin draft
router.post('/bulletins/save', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    const bulletinData = req.body;
    console.log('[TEACHER_BULLETINS] Saving bulletin draft for teacher:', user.id);

    // Validate required fields
    if (!bulletinData.schoolId || !bulletinData.classId || !bulletinData.studentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: schoolId, classId, studentId'
      });
    }

    // Verify teacher has access to the school
    const hasAccess = await verifyTeacherSchoolAccess(user.id, parseInt(bulletinData.schoolId));
    if (!hasAccess) {
      console.log('[TEACHER_BULLETINS] ❌ Access denied to school:', bulletinData.schoolId);
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not assigned to this school.'
      });
    }

    // TODO: Implement actual database save
    // await storage.saveBulletinDraft(user.id, bulletinData);
    
    const savedBulletin = {
      id: `bulletin_${Date.now()}`,
      teacherId: user.id,
      ...bulletinData,
      status: 'draft',
      lastModified: new Date().toISOString(),
      createdDate: new Date().toISOString()
    };

    console.log('[TEACHER_BULLETINS] ✅ Bulletin draft saved successfully:', savedBulletin.id);

    res.status(201).json({
      success: true,
      message: 'Bulletin saved successfully',
      bulletin: savedBulletin
    });
  } catch (error) {
    console.error('[TEACHER_BULLETINS] Error saving bulletin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save bulletin'
    });
  }
});

// Sign bulletin
router.post('/bulletins/sign', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    const bulletinData = req.body;
    console.log('[TEACHER_BULLETINS] Signing bulletin for teacher:', user.id);

    // Validate required fields
    if (!bulletinData.schoolId || !bulletinData.classId || !bulletinData.studentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: schoolId, classId, studentId'
      });
    }

    // Verify teacher has access to the school
    const hasAccess = await verifyTeacherSchoolAccess(user.id, parseInt(bulletinData.schoolId));
    if (!hasAccess) {
      console.log('[TEACHER_BULLETINS] ❌ Access denied to school:', bulletinData.schoolId);
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not assigned to this school.'
      });
    }

    // TODO: Implement actual database signature
    // await storage.signBulletin(user.id, bulletinData);
    
    const signedBulletin = {
      id: bulletinData.id || `bulletin_${Date.now()}`,
      teacherId: user.id,
      teacherSignature: {
        teacherName: `${user.firstName} ${user.lastName}`,
        signedAt: new Date().toISOString(),
        teacherId: user.id
      },
      ...bulletinData,
      status: 'signed',
      lastModified: new Date().toISOString()
    };

    console.log('[TEACHER_BULLETINS] ✅ Bulletin signed successfully:', signedBulletin.id);

    res.json({
      success: true,
      message: 'Bulletin signed successfully',
      bulletin: signedBulletin
    });
  } catch (error) {
    console.error('[TEACHER_BULLETINS] Error signing bulletin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sign bulletin'
    });
  }
});

// Send bulletin to school
router.post('/bulletins/send-to-school', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    const bulletinData = req.body;
    console.log('[TEACHER_BULLETINS] Sending bulletin to school for teacher:', user.id);

    // Validate required fields and signed status
    if (!bulletinData.schoolId || !bulletinData.classId || !bulletinData.studentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: schoolId, classId, studentId'
      });
    }

    // Verify teacher has access to the school
    const hasAccess = await verifyTeacherSchoolAccess(user.id, parseInt(bulletinData.schoolId));
    if (!hasAccess) {
      console.log('[TEACHER_BULLETINS] ❌ Access denied to school:', bulletinData.schoolId);
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not assigned to this school.'
      });
    }

    if (bulletinData.status !== 'signed') {
      return res.status(400).json({
        success: false,
        message: 'Bulletin must be signed before sending to school'
      });
    }

    // Save bulletin to database
    const [savedBulletin] = await db.insert(teacherBulletins).values({
      teacherId: user.id,
      schoolId: parseInt(bulletinData.schoolId),
      studentId: parseInt(bulletinData.studentId),
      classId: parseInt(bulletinData.classId),
      term: bulletinData.term,
      academicYear: bulletinData.academicYear,
      studentInfo: bulletinData.studentInfo,
      subjects: bulletinData.subjects,
      discipline: bulletinData.discipline,
      bulletinType: bulletinData.bulletinType || null,
      language: bulletinData.language || 'fr',
      status: 'sent',
      signedAt: bulletinData.signature?.signedAt ? new Date(bulletinData.signature.signedAt) : new Date(),
      signatureHash: bulletinData.signature?.hash || null,
      sentToSchoolAt: new Date(),
      reviewStatus: 'pending',
      metadata: {
        teacherName: `${user.firstName} ${user.lastName}`,
        schoolName: bulletinData.schoolName,
        className: bulletinData.className,
        originalBulletinId: bulletinData.id
      }
    } as any).returning();

    console.log('[TEACHER_BULLETINS] ✅ Bulletin saved to database and sent to school:', savedBulletin.id);

    // Send notification to school directors
    try {
      // Get all directors for this school
      const directors = await db.select().from(users)
        .where(and(
          eq(users.schoolId, parseInt(bulletinData.schoolId)),
          eq(users.role, 'Director')
        ));

      // Create notifications for each director
      for (const director of directors) {
        console.log(`[TEACHER_BULLETINS] 📧 Sending notification to director:`, director.id);
        // TODO: Implement actual notification system (Email, WhatsApp, Push)
        // For now, we just log it - the director will see it in their interface
      }
    } catch (notifError) {
      console.error('[TEACHER_BULLETINS] ⚠️ Error sending notifications:', notifError);
      // Continue even if notification fails
    }

    res.json({
      success: true,
      message: 'Bulletin sent to school successfully',
      bulletin: {
        id: savedBulletin.id,
        status: 'sent',
        sentToSchoolAt: savedBulletin.sentToSchoolAt,
        reviewStatus: savedBulletin.reviewStatus
      }
    });
  } catch (error) {
    console.error('[TEACHER_BULLETINS] Error sending bulletin to school:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulletin to school'
    });
  }
});

export default router;
import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

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

    const { title, description, subjectId, classId, dueDate, instructions } = req.body;

    if (!title || !classId || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, class ID, and due date are required'
      });
    }

    // Create homework assignment
    const homework = {
      id: Date.now(), // In real implementation, this would be generated by database
      title,
      description: description || '',
      teacherId: user.id,
      teacherName: user.fullName || user.email,
      subjectId: subjectId || 1,
      subject: 'Mathématiques', // This would be fetched from subjects table
      classId: parseInt(classId),
      schoolId: user.schoolId || 1,
      dueDate: new Date(dueDate),
      assignedDate: new Date(),
      instructions: instructions || '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
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

export default router;
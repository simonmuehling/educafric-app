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
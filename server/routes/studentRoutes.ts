import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { storage } from '../storage';

const router = Router();

// GET /api/student/library - Student library/progress data
router.get('/library', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    
    // Mock library/progress data for demo
    const libraryData = [
      {
        subject: 'Mathématiques',
        currentGrade: 16.5,
        previousGrade: 15.2,
        trend: 'up',
        goal: 17.0,
        assignments: {
          total: 12,
          completed: 10,
          average: 16.2
        }
      },
      {
        subject: 'Français',
        currentGrade: 14.8,
        previousGrade: 15.1,
        trend: 'down',
        goal: 16.0,
        assignments: {
          total: 8,
          completed: 7,
          average: 14.5
        }
      },
      {
        subject: 'Sciences',
        currentGrade: 15.9,
        previousGrade: 15.9,
        trend: 'stable',
        goal: 16.5,
        assignments: {
          total: 10,
          completed: 9,
          average: 15.7
        }
      },
      {
        subject: 'Histoire',
        currentGrade: 17.2,
        previousGrade: 16.8,
        trend: 'up',
        goal: 17.0,
        assignments: {
          total: 6,
          completed: 6,
          average: 17.1
        }
      }
    ];

    res.json({
      success: true,
      data: libraryData,
      message: 'Library data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching library data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching library data'
    });
  }
});

// GET /api/student/achievements - Student achievements
router.get('/achievements', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    
    // Mock achievements data
    const achievements = [
      {
        id: 1,
        title: 'Excellent Student',
        description: 'Maintained average above 16/20',
        icon: '🏆',
        date: '2025-01-15',
        points: 100
      },
      {
        id: 2,
        title: 'Perfect Attendance',
        description: '95% attendance rate this term',
        icon: '📅',
        date: '2025-01-10',
        points: 75
      },
      {
        id: 3,
        title: 'Math Champion',
        description: 'Top score in mathematics',
        icon: '🔢',
        date: '2025-01-05',
        points: 80
      }
    ];

    res.json({
      success: true,
      data: achievements,
      message: 'Achievements retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching achievements'
    });
  }
});

// GET /api/student/homework - Get student homework assignments
router.get('/homework', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    
    // Mock homework data
    const homework = [
      {
        id: 1,
        title: 'Exercice de Mathématiques',
        subject: 'Mathématiques',
        teacher: 'M. Dupont',
        dueDate: '2025-08-30',
        status: 'assigned',
        description: 'Résoudre les équations du chapitre 3',
        attachments: ['math_exercises.pdf'],
        submittedAt: null,
        grade: null,
        feedback: null
      },
      {
        id: 2,
        title: 'Dissertation Française',
        subject: 'Français',
        teacher: 'Mme. Martin',
        dueDate: '2025-08-28',
        status: 'submitted',
        description: 'Rédiger un essai sur la littérature africaine',
        attachments: [],
        submittedAt: '2025-08-26T10:30:00Z',
        submissionFiles: ['dissertation.pdf'],
        grade: 16,
        feedback: 'Excellent travail, très bien structuré!'
      },
      {
        id: 3,
        title: 'Expérience Sciences',
        subject: 'Sciences',
        teacher: 'Dr. Koné',
        dueDate: '2025-09-05',
        status: 'in_progress',
        description: 'Rapport sur l\'expérience de chimie',
        attachments: ['lab_instructions.pdf'],
        submittedAt: null,
        grade: null,
        feedback: null
      }
    ];

    res.json({
      success: true,
      homework: homework,
      message: 'Homework retrieved successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] Error fetching homework:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching homework'
    });
  }
});

// GET /api/student/homework/:id - Get specific homework assignment
router.get('/homework/:id', requireAuth, async (req, res) => {
  try {
    const homeworkId = parseInt(req.params.id);
    const studentId = req.user?.id;
    
    if (isNaN(homeworkId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid homework ID'
      });
    }

    // Mock single homework data
    const homework = {
      id: homeworkId,
      title: 'Exercice de Mathématiques',
      subject: 'Mathématiques',
      teacher: 'M. Dupont',
      dueDate: '2025-08-30',
      status: 'assigned',
      description: 'Résoudre les équations du chapitre 3. Montrer tout le travail.',
      attachments: ['math_exercises.pdf'],
      submittedAt: null,
      submissionFiles: [],
      grade: null,
      feedback: null,
      instructions: 'Téléchargez le fichier PDF joint, résolvez tous les exercices et téléchargez votre travail.'
    };

    res.json({
      success: true,
      homework: homework,
      message: 'Homework details retrieved successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] Error fetching homework details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching homework details'
    });
  }
});

// POST /api/student/homework/:id/submit - Submit homework assignment
router.post('/homework/:id/submit', requireAuth, async (req, res) => {
  try {
    const homeworkId = parseInt(req.params.id);
    const studentId = req.user?.id;
    const { files, comment } = req.body;
    
    if (isNaN(homeworkId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid homework ID'
      });
    }

    // Mock submission logic
    const submission = {
      id: Date.now(),
      homeworkId: homeworkId,
      studentId: studentId,
      submittedAt: new Date().toISOString(),
      files: files || [],
      comment: comment || '',
      status: 'submitted'
    };

    console.log(`[STUDENT_API] Homework submission:`, submission);

    res.json({
      success: true,
      submission: submission,
      message: 'Homework submitted successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] Error submitting homework:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting homework'
    });
  }
});

// PUT /api/student/homework/:id/submit - Update homework submission
router.put('/homework/:id/submit', requireAuth, async (req, res) => {
  try {
    const homeworkId = parseInt(req.params.id);
    const studentId = req.user?.id;
    const { files, comment } = req.body;
    
    if (isNaN(homeworkId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid homework ID'
      });
    }

    // Mock update logic
    const updatedSubmission = {
      id: homeworkId,
      homeworkId: homeworkId,
      studentId: studentId,
      updatedAt: new Date().toISOString(),
      files: files || [],
      comment: comment || '',
      status: 'resubmitted'
    };

    console.log(`[STUDENT_API] Homework resubmission:`, updatedSubmission);

    res.json({
      success: true,
      submission: updatedSubmission,
      message: 'Homework updated successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] Error updating homework:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating homework'
    });
  }
});

// GET /api/student/grades - Get student grades
router.get('/grades', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    
    const grades = [
      {
        id: 1,
        subject: 'Mathématiques',
        assignment: 'Test Chapter 3',
        grade: 16.5,
        maxGrade: 20,
        date: '2025-08-20',
        teacher: 'M. Dupont',
        feedback: 'Excellent work!'
      },
      {
        id: 2,
        subject: 'Français',
        assignment: 'Dissertation',
        grade: 14.0,
        maxGrade: 20,
        date: '2025-08-22',
        teacher: 'Mme. Martin',
        feedback: 'Good analysis, improve structure'
      }
    ];

    res.json({
      success: true,
      grades: grades,
      message: 'Grades retrieved successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] Error fetching grades:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching grades'
    });
  }
});

// GET /api/student/messages - Get student messages
router.get('/messages', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    
    const messages = [
      {
        id: 1,
        from: 'M. Dupont',
        subject: 'Assignment Reminder',
        message: 'Don\'t forget your math assignment due tomorrow',
        date: '2025-08-24',
        read: false,
        type: 'teacher'
      },
      {
        id: 2,
        from: 'Administration',
        subject: 'School Event',
        message: 'Sports day scheduled for next Friday',
        date: '2025-08-23',
        read: true,
        type: 'admin'
      }
    ];

    res.json({
      success: true,
      messages: messages,
      message: 'Messages retrieved successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
});

// GET /api/student/attendance - Get student attendance
router.get('/attendance', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.id;
    
    const attendance = [
      {
        date: '2025-08-24',
        status: 'present',
        periods: [
          { subject: 'Mathématiques', status: 'present', time: '08:00' },
          { subject: 'Français', status: 'present', time: '10:00' },
          { subject: 'Sciences', status: 'present', time: '14:00' }
        ]
      },
      {
        date: '2025-08-23',
        status: 'absent',
        periods: [
          { subject: 'Mathématiques', status: 'absent', time: '08:00' },
          { subject: 'Français', status: 'absent', time: '10:00' }
        ],
        reason: 'Sick leave'
      }
    ];

    res.json({
      success: true,
      attendance: attendance,
      message: 'Attendance retrieved successfully'
    });
  } catch (error) {
    console.error('[STUDENT_API] Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance'
    });
  }
});

export default router;
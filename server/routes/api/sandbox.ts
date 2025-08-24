import { Router, Request, Response } from 'express';
import { storage } from '../../storage';
import { autoscaleRoutes } from '../../services/sandboxAutoscaleService';
import { requireAuth } from '../../middleware/auth';

// Extended request interface for authenticated routes
interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = Router();

// Sandbox students data
router.get('/students', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sandboxStudents = [
      {
        id: 1, firstName: 'Marie', lastName: 'Durand', email: 'marie.durand@test.com',
        classId: 1, className: '6ème A', gender: 'F', phone: '+237655123456'
      },
      {
        id: 2, firstName: 'Paul', lastName: 'Martin', email: 'paul.martin@test.com',
        classId: 1, className: '6ème A', gender: 'M', phone: '+237655123457'
      },
      {
        id: 3, firstName: 'Sophie', lastName: 'Bernard', email: 'sophie.bernard@test.com',
        classId: 2, className: '5ème B', gender: 'F', phone: '+237655123458'
      }
    ];
    res.json(sandboxStudents);
  } catch (error: any) {
    console.error('[SANDBOX_API] Error fetching students:', error);
    res.status(500).json({ message: 'Failed to fetch sandbox students' });
  }
});

// Sandbox classes data
router.get('/classes', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sandboxClasses = [
      { id: 1, name: '6ème A', level: '6ème', studentsCount: 25, teacherId: 1 },
      { id: 2, name: '5ème B', level: '5ème', studentsCount: 28, teacherId: 2 },
      { id: 3, name: '4ème C', level: '4ème', studentsCount: 22, teacherId: 3 }
    ];
    res.json(sandboxClasses);
  } catch (error: any) {
    console.error('[SANDBOX_API] Error fetching classes:', error);
    res.status(500).json({ message: 'Failed to fetch sandbox classes' });
  }
});

// Sandbox grades data
router.get('/grades', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sandboxGrades = [
      {
        id: 1, studentId: 1, subjectId: 1, subjectName: 'Mathématiques',
        value: 15.5, maxValue: 20, date: '2024-03-15', type: 'Contrôle'
      },
      {
        id: 2, studentId: 1, subjectId: 2, subjectName: 'Français',
        value: 17, maxValue: 20, date: '2024-03-18', type: 'Composition'
      },
      {
        id: 3, studentId: 2, subjectId: 1, subjectName: 'Mathématiques',
        value: 12, maxValue: 20, date: '2024-03-15', type: 'Contrôle'
      }
    ];
    res.json(sandboxGrades);
  } catch (error: any) {
    console.error('[SANDBOX_API] Error fetching grades:', error);
    res.status(500).json({ message: 'Failed to fetch sandbox grades' });
  }
});

// Sandbox homework data
router.get('/homework', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sandboxHomework = [
      {
        id: 1, title: 'Exercices de mathématiques', description: 'Résoudre les exercices 1 à 10',
        subjectId: 1, subjectName: 'Mathématiques', classId: 1, className: '6ème A',
        dueDate: '2024-03-25', assignedDate: '2024-03-20', teacherId: 1
      },
      {
        id: 2, title: 'Rédaction - Description', description: 'Rédiger une description de 200 mots',
        subjectId: 2, subjectName: 'Français', classId: 1, className: '6ème A',
        dueDate: '2024-03-27', assignedDate: '2024-03-22', teacherId: 2
      }
    ];
    res.json(sandboxHomework);
  } catch (error: any) {
    console.error('[SANDBOX_API] Error fetching homework:', error);
    res.status(500).json({ message: 'Failed to fetch sandbox homework' });
  }
});

// Sandbox communications data
router.get('/communications', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sandboxCommunications = [
      {
        id: 1, title: 'Réunion parents-enseignants', content: 'La réunion aura lieu le 30 mars',
        type: 'Annonce', priority: 'high', date: '2024-03-22', authorId: 1
      },
      {
        id: 2, title: 'Sortie éducative', content: 'Visite du musée national le 5 avril',
        type: 'Information', priority: 'medium', date: '2024-03-23', authorId: 2
      }
    ];
    res.json(sandboxCommunications);
  } catch (error: any) {
    console.error('[SANDBOX_API] Error fetching communications:', error);
    res.status(500).json({ message: 'Failed to fetch sandbox communications' });
  }
});

// Sandbox attendance data
router.get('/attendance', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sandboxAttendance = [
      {
        id: 1, studentId: 1, studentName: 'Marie Durand', classId: 1,
        date: '2024-03-22', status: 'present', period: 'morning'
      },
      {
        id: 2, studentId: 2, studentName: 'Paul Martin', classId: 1,
        date: '2024-03-22', status: 'absent', period: 'morning', reason: 'Maladie'
      },
      {
        id: 3, studentId: 3, studentName: 'Sophie Bernard', classId: 2,
        date: '2024-03-22', status: 'present', period: 'morning'
      }
    ];
    res.json(sandboxAttendance);
  } catch (error: any) {
    console.error('[SANDBOX_API] Error fetching attendance:', error);
    res.status(500).json({ message: 'Failed to fetch sandbox attendance' });
  }
});

// Mirror routes for additional sandbox data
router.get('/mirror/subjects', (req, res) => {
  const subjects = [
    { id: 1, name: 'Mathématiques', code: 'MATH' },
    { id: 2, name: 'Français', code: 'FR' },
    { id: 3, name: 'Sciences', code: 'SCI' }
  ];
  res.json(subjects);
});

router.get('/mirror/students', (req, res) => {
  const students = [
    { id: 1, name: 'Marie Durand', class: '6ème A' },
    { id: 2, name: 'Paul Martin', class: '6ème A' },
    { id: 3, name: 'Sophie Bernard', class: '5ème B' }
  ];
  res.json(students);
});

router.get('/mirror/teachers', (req, res) => {
  const teachers = [
    { id: 1, name: 'Dr. Kouame', subject: 'Mathématiques' },
    { id: 2, name: 'Mme. Fanta', subject: 'Français' },
    { id: 3, name: 'M. Bello', subject: 'Sciences' }
  ];
  res.json(teachers);
});

// Test routes
router.post('/test-communication', (req, res) => {
  res.json({
    success: true,
    message: 'Message de test envoyé avec succès',
    timestamp: new Date().toISOString()
  });
});

router.post('/test-notification', (req, res) => {
  res.json({
    success: true,
    message: 'Notification de test créée',
    notification: {
      id: Date.now(),
      title: 'Test de notification',
      content: req.body.message || 'Ceci est un test',
      type: 'info',
      timestamp: new Date().toISOString()
    }
  });
});

// Autoscale routes
router.get('/autoscale/metrics', requireAuth, autoscaleRoutes.getMetrics);
router.post('/autoscale/refresh', requireAuth, autoscaleRoutes.forceRefresh);
router.get('/autoscale/status', requireAuth, autoscaleRoutes.getStatus);

export default router;
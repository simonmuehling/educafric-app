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

// Enhanced sandbox metrics endpoint
router.get('/metrics', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const metrics = {
      apiCalls: 1247 + Math.floor(Math.random() * 100),
      errors: 3 + Math.floor(Math.random() * 3),
      responseTime: 85 + Math.floor(Math.random() * 50),
      uptime: 99.8 + (Math.random() * 0.2),
      memoryUsage: 67 + Math.floor(Math.random() * 15),
      activeUsers: 12 + Math.floor(Math.random() * 8),
      dbConnections: 8 + Math.floor(Math.random() * 4),
      lastUpdate: new Date().toISOString(),
      systemHealth: 'excellent',
      databaseStatus: 'connected'
    };
    res.json(metrics);
  } catch (error: any) {
    console.error('[SANDBOX_API] Error fetching metrics:', error);
    res.status(500).json({ message: 'Failed to fetch sandbox metrics' });
  }
});

// Real-time metrics for advanced monitoring
router.get('/real-time-metrics', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const realTimeMetrics = {
      apiCalls: 1500 + Math.floor(Math.random() * 200),
      successRate: 98.5 + (Math.random() * 1.5),
      responseTime: 75 + Math.floor(Math.random() * 40),
      activeUsers: 15 + Math.floor(Math.random() * 10),
      systemHealth: Math.random() > 0.9 ? 'good' : 'excellent',
      lastUpdate: new Date().toISOString(),
      databaseStatus: Math.random() > 0.95 ? 'degraded' : 'connected',
      memoryUsage: 65 + Math.floor(Math.random() * 20),
      cpuUsage: 45 + Math.floor(Math.random() * 25)
    };
    res.json(realTimeMetrics);
  } catch (error: any) {
    console.error('[SANDBOX_API] Error fetching real-time metrics:', error);
    res.status(500).json({ message: 'Failed to fetch real-time metrics' });
  }
});

// Run sandbox tests
router.post('/run-tests', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { testSuite, includeIntegration } = req.body;
    
    // Simulate test execution
    const testResults = {
      totalTests: 25,
      passedTests: 22 + Math.floor(Math.random() * 3),
      failedTests: Math.floor(Math.random() * 3),
      duration: 3500 + Math.floor(Math.random() * 1000),
      testSuite: testSuite || 'standard',
      includeIntegration: includeIntegration || false,
      timestamp: new Date().toISOString(),
      details: [
        { name: 'Authentication Tests', status: 'passed', duration: 450 },
        { name: 'API Endpoints', status: 'passed', duration: 780 },
        { name: 'Database Connectivity', status: 'passed', duration: 320 },
        { name: 'Performance Tests', status: 'passed', duration: 890 },
        { name: 'Security Checks', status: 'passed', duration: 560 }
      ]
    };
    
    res.json({
      success: true,
      message: 'Tests executed successfully',
      ...testResults
    });
  } catch (error: any) {
    console.error('[SANDBOX_API] Error running tests:', error);
    res.status(500).json({ message: 'Failed to run sandbox tests' });
  }
});

// Comprehensive test runner
router.post('/run-comprehensive-tests', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { modules, environment, includeRealTimeData } = req.body;
    
    const comprehensiveResults = {
      totalModules: modules?.length || 5,
      passedModules: (modules?.length || 5) - Math.floor(Math.random() * 2),
      failedModules: Math.floor(Math.random() * 2),
      totalTests: 45,
      passedTests: 42 + Math.floor(Math.random() * 3),
      duration: 8500 + Math.floor(Math.random() * 2000),
      environment: environment || 'sandbox',
      includeRealTimeData: includeRealTimeData || false,
      timestamp: new Date().toISOString(),
      moduleResults: modules?.map((module: string) => ({
        name: module,
        status: Math.random() > 0.15 ? 'passed' : 'failed',
        testsCount: 8 + Math.floor(Math.random() * 5),
        duration: 1200 + Math.floor(Math.random() * 800)
      })) || []
    };
    
    res.json({
      success: true,
      message: 'Comprehensive tests completed',
      ...comprehensiveResults
    });
  } catch (error: any) {
    console.error('[SANDBOX_API] Error running comprehensive tests:', error);
    res.status(500).json({ message: 'Failed to run comprehensive tests' });
  }
});

// Export sandbox logs
router.post('/export-logs', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { format, includeMetrics, dateRange } = req.body;
    
    const logContent = `
[SANDBOX LOGS - ${new Date().toISOString()}]
=================================================

Période: ${dateRange || '7 derniers jours'}
Format: ${format || 'txt'}
Métriques incluses: ${includeMetrics ? 'Oui' : 'Non'}

--- ACTIVITÉS SYSTÈME ---
[${new Date().toISOString()}] API: Appel réussi - /api/sandbox/students
[${new Date().toISOString()}] API: Appel réussi - /api/sandbox/grades  
[${new Date().toISOString()}] API: Appel réussi - /api/sandbox/metrics
[${new Date().toISOString()}] TEST: Exécution test suite - 25 tests passés
[${new Date().toISOString()}] SYSTEM: Mise à jour métriques temps réel

--- MÉTRIQUES SYSTÈME ---
${includeMetrics ? `
Appels API: 1247
Temps de réponse moyen: 85ms
Uptime: 99.8%
Utilisateurs actifs: 12
Erreurs: 3
Connexions DB: 8
Utilisation mémoire: 67%
` : 'Métriques exclues'}

--- TESTS RÉCENTS ---
[${new Date().toISOString()}] Tests d'authentification: RÉUSSI
[${new Date().toISOString()}] Tests de base de données: RÉUSSI
[${new Date().toISOString()}] Tests de performance: RÉUSSI
[${new Date().toISOString()}] Tests de sécurité: RÉUSSI

=================================================
Fin des logs - ${new Date().toISOString()}
`;
    
    res.json({
      success: true,
      message: 'Logs exported successfully',
      content: logContent,
      filename: `sandbox-logs-${new Date().toISOString().split('T')[0]}.${format || 'txt'}`,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[SANDBOX_API] Error exporting logs:', error);
    res.status(500).json({ message: 'Failed to export logs' });
  }
});

// Timetable creation test route 
router.post('/timetable/create', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const timetableData = req.body;
    
    const createdTimetable = {
      id: Date.now(),
      ...timetableData,
      createdAt: new Date().toISOString(),
      status: 'active',
      periods: timetableData.periods || [],
      classes: timetableData.classes || []
    };
    
    res.json({
      success: true,
      message: 'Emploi du temps créé avec succès',
      timetable: createdTimetable
    });
  } catch (error: any) {
    console.error('[SANDBOX_API] Error creating timetable:', error);
    res.status(500).json({ message: 'Failed to create timetable' });
  }
});

// Autoscale routes
router.get('/autoscale/metrics', requireAuth, autoscaleRoutes.getMetrics);
router.post('/autoscale/refresh', requireAuth, autoscaleRoutes.forceRefresh);
router.get('/autoscale/status', requireAuth, autoscaleRoutes.getStatus);

export default router;
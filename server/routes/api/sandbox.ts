import { Router, Request, Response } from 'express';
import { storage } from '../../storage';
import { autoscaleRoutes } from '../../services/sandboxAutoscaleService';
import { requireAuth } from '../../middleware/auth';

// Extended request interface for authenticated routes
interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = Router();

// Endpoint de statut du sandbox (nouveau)
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = {
      active: true,
      lastUpdated: '2025-09-07',
      version: '3.0',
      features: [
        'Signatures numériques bulletins',
        'Données bilingues FR/EN',
        'Géolocalisation temps réel', 
        'Notifications SMS/WhatsApp',
        'Rapports avancés'
      ],
      students: 45,
      teachers: 12,
      classes: 8,
      environment: 'Sandbox EDUCAFRIC 2025 ✨'
    };
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur statut sandbox', error: error.message });
  }
});

// Sandbox students data - ACTUALISÉES SEPTEMBRE 2025
router.get('/students', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sandboxStudents = [
      {
        id: 1, firstName: 'Marie', lastName: 'Nkomo', email: 'marie.nkomo@test.educafric.com',
        classId: 1, className: '6ème A', gender: 'F', phone: '+237655123456',
        grades: { math: 16.5, french: 15.2, english: 17.0 }, lastActivity: '2025-09-07',
        status: 'Actif', parentPhone: '+237677234567'
      },
      {
        id: 2, firstName: 'Paul', lastName: 'Atangana', email: 'paul.atangana@test.educafric.com',
        classId: 1, className: '6ème A', gender: 'M', phone: '+237655123457',
        grades: { math: 14.0, french: 16.8, english: 15.5 }, lastActivity: '2025-09-07',
        status: 'Actif', parentPhone: '+237677234568'
      },
      {
        id: 3, firstName: 'Sophie', lastName: 'Mbida', email: 'sophie.mbida@test.educafric.com',
        classId: 2, className: '5ème B', gender: 'F', phone: '+237655123458',
        grades: { math: 18.0, french: 17.5, english: 16.2 }, lastActivity: '2025-09-07',
        status: 'Actif', parentPhone: '+237677234569'
      },
      {
        id: 4, firstName: 'Jean', lastName: 'Kamga', email: 'jean.kamga@test.educafric.com',
        classId: 3, className: '4ème C', gender: 'M', phone: '+237655123459',
        grades: { math: 15.8, french: 14.5, english: 16.8 }, lastActivity: '2025-09-07',
        status: 'Actif', parentPhone: '+237677234570'
      },
      {
        id: 5, firstName: 'Grace', lastName: 'Fouda', email: 'grace.fouda@test.educafric.com',
        classId: 4, className: '3ème D', gender: 'F', phone: '+237655123460',
        grades: { math: 17.2, french: 18.0, english: 17.8 }, lastActivity: '2025-09-07',
        status: 'Actif', parentPhone: '+237677234571'
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
      { 
        id: 1, name: '6ème A', level: '6ème', studentsCount: 28, teacherId: 1,
        teacherName: 'Mme. Essola Catherine', room: 'Salle 105',
        schedule: 'Lun-Mar-Jeu 08:00-12:00', lastUpdated: '2025-09-07'
      },
      { 
        id: 2, name: '5ème B', level: '5ème', studentsCount: 32, teacherId: 2,
        teacherName: 'M. Biya François', room: 'Salle 203',
        schedule: 'Mar-Mer-Ven 09:00-13:00', lastUpdated: '2025-09-07'
      },
      { 
        id: 3, name: '4ème C', level: '4ème', studentsCount: 26, teacherId: 3,
        teacherName: 'M. Ondoa Vincent', room: 'Salle 301',
        schedule: 'Lun-Mer-Ven 10:00-14:00', lastUpdated: '2025-09-07'
      },
      { 
        id: 4, name: '3ème D', level: '3ème', studentsCount: 24, teacherId: 4,
        teacherName: 'Mme. Nguesso Marie', room: 'Salle 102',
        schedule: 'Mar-Jeu-Ven 08:00-12:00', lastUpdated: '2025-09-07'
      }
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
        value: 16.5, maxValue: 20, date: '2025-09-05', type: 'Devoir Surveillé',
        teacherId: 1, teacherName: 'Mme. Essola Catherine', term: 'Trimestre 1'
      },
      {
        id: 2, studentId: 1, subjectId: 2, subjectName: 'Français',
        value: 15.2, maxValue: 20, date: '2025-09-06', type: 'Composition',
        teacherId: 2, teacherName: 'M. Biya François', term: 'Trimestre 1'
      },
      {
        id: 3, studentId: 2, subjectId: 1, subjectName: 'Mathématiques',
        value: 14.0, maxValue: 20, date: '2025-09-05', type: 'Devoir Surveillé',
        teacherId: 1, teacherName: 'Mme. Essola Catherine', term: 'Trimestre 1'
      },
      {
        id: 4, studentId: 3, subjectId: 1, subjectName: 'Mathématiques',
        value: 18.0, maxValue: 20, date: '2025-09-05', type: 'Devoir Surveillé',
        teacherId: 3, teacherName: 'M. Ondoa Vincent', term: 'Trimestre 1'
      },
      {
        id: 5, studentId: 4, subjectId: 3, subjectName: 'Anglais',
        value: 16.8, maxValue: 20, date: '2025-09-04', type: 'Expression Orale',
        teacherId: 4, teacherName: 'Mrs. Smith Jennifer', term: 'Trimestre 1'
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
        id: 1, title: 'Équations du premier degré', 
        description: 'Résoudre les exercices 15 à 25 du manuel de mathématiques',
        subjectId: 1, subjectName: 'Mathématiques', classId: 1, className: '6ème A',
        dueDate: '2025-09-10', assignedDate: '2025-09-07', teacherId: 1,
        teacherName: 'Mme. Essola Catherine', status: 'En cours'
      },
      {
        id: 2, title: 'Analyse de texte - Le petit prince', 
        description: 'Analyser le chapitre 5 et répondre aux questions 1-8',
        subjectId: 2, subjectName: 'Français', classId: 2, className: '5ème B',
        dueDate: '2025-09-12', assignedDate: '2025-09-07', teacherId: 2,
        teacherName: 'M. Biya François', status: 'En cours'
      },
      {
        id: 3, title: 'English Grammar - Present Perfect',
        description: 'Complete exercises on page 45-47, focus on present perfect tense',
        subjectId: 3, subjectName: 'Anglais', classId: 3, className: '4ème C',
        dueDate: '2025-09-11', assignedDate: '2025-09-07', teacherId: 4,
        teacherName: 'Mrs. Smith Jennifer', status: 'En cours'
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
        id: 1, title: 'Nouvelle année scolaire 2025-2026', 
        content: 'Bienvenue dans notre environnement sandbox EDUCAFRIC 2025! Nouvelles fonctionnalités: signatures numériques, géolocalisation et rapports avancés.',
        type: 'Annonce', priority: 'high', date: '2025-09-07', authorId: 1,
        authorName: 'Direction EDUCAFRIC', sent: true, recipients: 'Tous'
      },
      {
        id: 2, title: 'Formation signatures numériques bulletins',
        content: 'Les professeurs principaux peuvent maintenant signer numériquement les bulletins. Formation programmée le 15 septembre 2025.',
        type: 'Information', priority: 'medium', date: '2025-09-07', authorId: 2,
        authorName: 'Service Informatique', sent: true, recipients: 'Enseignants'
      },
      {
        id: 3, title: 'Test notifications SMS/WhatsApp',
        content: 'Le système de notifications multicanalvias SMS et WhatsApp est maintenant opérationnel. Test en cours sur tous les comptes sandbox.',
        type: 'Test', priority: 'medium', date: '2025-09-07', authorId: 3,
        authorName: 'Équipe Technique', sent: true, recipients: 'Parents'
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
        id: 1, studentId: 1, studentName: 'Marie Nkomo', classId: 1, className: '6ème A',
        date: '2025-09-07', status: 'présent', period: 'matin',
        arrivalTime: '07:45', teacherId: 1, teacherName: 'Mme. Essola Catherine'
      },
      {
        id: 2, studentId: 2, studentName: 'Paul Atangana', classId: 1, className: '6ème A',
        date: '2025-09-07', status: 'présent', period: 'matin',
        arrivalTime: '08:02', teacherId: 1, teacherName: 'Mme. Essola Catherine'
      },
      {
        id: 3, studentId: 3, studentName: 'Sophie Mbida', classId: 2, className: '5ème B',
        date: '2025-09-07', status: 'présent', period: 'matin',
        arrivalTime: '07:58', teacherId: 2, teacherName: 'M. Biya François'
      },
      {
        id: 4, studentId: 4, studentName: 'Jean Kamga', classId: 3, className: '4ème C',
        date: '2025-09-07', status: 'retard', period: 'matin',
        arrivalTime: '08:25', teacherId: 3, teacherName: 'M. Ondoa Vincent', reason: 'Transport'
      },
      {
        id: 5, studentId: 5, studentName: 'Grace Fouda', classId: 4, className: '3ème D',
        date: '2025-09-07', status: 'présent', period: 'matin',
        arrivalTime: '07:40', teacherId: 4, teacherName: 'Mme. Nguesso Marie'
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

// Nouvel endpoint: Enseignants du sandbox actualisés 2025
router.get('/teachers', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sandboxTeachers = [
      {
        id: 1, firstName: 'Catherine', lastName: 'Essola', 
        email: 'catherine.essola@test.educafric.com',
        subject: 'Mathématiques', phone: '+237677123456',
        canSignBulletins: true, digitalSignatureActive: true,
        classes: ['6ème A', '5ème A'], status: 'Actif',
        lastActivity: '2025-09-07'
      },
      {
        id: 2, firstName: 'François', lastName: 'Biya',
        email: 'francois.biya@test.educafric.com', 
        subject: 'Français', phone: '+237677123457',
        canSignBulletins: true, digitalSignatureActive: true,
        classes: ['5ème B', '4ème B'], status: 'Actif',
        lastActivity: '2025-09-07'
      },
      {
        id: 3, firstName: 'Vincent', lastName: 'Ondoa',
        email: 'vincent.ondoa@test.educafric.com',
        subject: 'Histoire-Géographie', phone: '+237677123458',
        canSignBulletins: false, digitalSignatureActive: false,
        classes: ['4ème C', '3ème C'], status: 'Actif',
        lastActivity: '2025-09-07'
      },
      {
        id: 4, firstName: 'Jennifer', lastName: 'Smith',
        email: 'jennifer.smith@test.educafric.com',
        subject: 'Anglais', phone: '+237677123459',
        canSignBulletins: true, digitalSignatureActive: true,
        classes: ['3ème D', '2nde A'], status: 'Actif',
        lastActivity: '2025-09-07'
      }
    ];
    res.json(sandboxTeachers);
  } catch (error: any) {
    console.error('[SANDBOX_API] Error fetching teachers:', error);
    res.status(500).json({ message: 'Failed to fetch sandbox teachers' });
  }
});

// Endpoint parents sandbox 2025
router.get('/parents', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sandboxParents = [
      {
        id: 1, firstName: 'Albertine', lastName: 'Nkomo',
        email: 'albertine.nkomo@test.educafric.com',
        phone: '+237677234567', childrenIds: [1],
        children: ['Marie Nkomo'], status: 'Actif',
        notifications: { sms: true, whatsapp: true, email: true },
        lastActivity: '2025-09-07'
      },
      {
        id: 2, firstName: 'Maurice', lastName: 'Atangana', 
        email: 'maurice.atangana@test.educafric.com',
        phone: '+237677234568', childrenIds: [2],
        children: ['Paul Atangana'], status: 'Actif',
        notifications: { sms: true, whatsapp: false, email: true },
        lastActivity: '2025-09-07'
      },
      {
        id: 3, firstName: 'Pascaline', lastName: 'Mbida',
        email: 'pascaline.mbida@test.educafric.com',
        phone: '+237677234569', childrenIds: [3],
        children: ['Sophie Mbida'], status: 'Actif',
        notifications: { sms: true, whatsapp: true, email: true },
        lastActivity: '2025-09-07'
      }
    ];
    res.json(sandboxParents);
  } catch (error: any) {
    console.error('[SANDBOX_API] Error fetching parents:', error);
    res.status(500).json({ message: 'Failed to fetch sandbox parents' });
  }
});

export default router;
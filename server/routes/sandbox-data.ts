/**
 * EDUCAFRIC - Routes de données sandbox complètes
 * Fournit des données réalistes pour tous les tests environnementaux
 */

import { Router } from 'express';

const router = Router();

// ✅ SANDBOX 2025: Middleware d'authentification sécurisé amélioré
const requireSandboxAuth = (req: any, res: any, next: any) => {
  // Vérifications de sécurité renforcées
  const isSandboxUser = req.user?.sandboxMode ||
                       req.user?.email?.includes('@test.educafric.com') ||
                       req.user?.email?.includes('@educafric.demo') ||
                       req.user?.email?.includes('sandbox.') ||
                       req.headers.authorization?.includes('sandbox');
  
  if (isSandboxUser) {
    // Assurer que l'utilisateur sandbox a les bonnes permissions
    req.user = req.user || { 
      id: Math.floor(Math.random() * 9000) + 1000, 
      role: 'Admin', 
      email: 'sandbox@test.educafric.com',
      sandboxMode: true,
      premiumFeatures: true,
      lastActivity: new Date().toISOString()
    };
    return next();
  }
  
  res.status(401).json({ 
    message: 'Accès sandbox requis', 
    hint: 'Utilisez un compte test se terminant par @test.educafric.com',
    timestamp: new Date().toISOString()
  });
};

// ===== DONNÉES ÉCOLE =====
router.get('/school/profile', requireSandboxAuth, (req, res) => {
  const schoolProfile = {
    id: 1,
    name: 'École Internationale de Yaoundé - Sandbox EDUCAFRIC 2025',
    type: 'Privé Bilingue Premium',
    address: 'Quartier Bastos, Avenue Kennedy, Yaoundé, Cameroun',
    phone: '+237 222 123 456',
    email: 'contact@eiy-sandbox.educafric.com',
    website: 'www.eiy-sandbox.educafric.com',
    director: 'Dr. Marie NKOMO',
    vicePrincipal: 'Prof. Paul ATANGANA',
    studentsCount: 542,
    teachersCount: 38,
    classesCount: 22,
    established: 2010,
    lastUpdate: '2025-01-15',
    accreditation: 'Ministère de l\'Éducation du Cameroun - Accréditation Premium 2025',
    curriculum: 'Programme Bilingue Franco-Anglais avec IA & Numérique',
    levels: ['Maternelle', 'Primaire', 'Collège', 'Lycée'],
    specializations: ['Sciences & Technologies', 'Langues & Littératures', 'Arts & Communication'],
    facilities: ['Laboratoires numériques', 'Bibliothèque multimédia', 'Centre sportif', 'Auditorium']
  };
  
  res.json(schoolProfile);
});

// ===== DONNÉES ENSEIGNANTS =====
router.post('/teachers/create', requireSandboxAuth, (req, res) => {
  const { firstName, lastName, email, subject, phone, specialization } = req.body;
  
  const newTeacher = {
    id: Math.floor(Math.random() * 1000) + 100,
    firstName: firstName || 'Marie',
    lastName: lastName || 'Nguesso',
    email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@test.educafric.com`,
    role: 'Teacher',
    subject: subject || 'Mathématiques',
    phone: phone || '+237 677 889 900',
    specialization: specialization || 'Algèbre et Géométrie',
    classes: ['3ème A', '2nde B'],
    experience: '5 ans',
    qualification: 'Master en Mathématiques',
    status: 'Actif',
    joinDate: new Date().toISOString().split('T')[0],
    schedule: {
      monday: ['08:00-09:00 3ème A', '10:00-11:00 2nde B'],
      tuesday: ['09:00-10:00 3ème A', '14:00-15:00 2nde B'],
      wednesday: ['08:00-09:00 3ème A'],
      thursday: ['10:00-11:00 2nde B', '15:00-16:00 3ème A'],
      friday: ['08:00-09:00 3ème A', '09:00-10:00 2nde B']
    }
  };
  
  console.log(`👩‍🏫 Nouvel enseignant créé: ${newTeacher.firstName} ${newTeacher.lastName} - ${newTeacher.subject}`);
  res.json(newTeacher);
});

router.get('/teachers/classes/:teacherId', requireSandboxAuth, (req, res) => {
  const classes = [
    {
      id: 1,
      name: '3ème A',
      level: 'Troisième',
      studentsCount: 28,
      subject: 'Mathématiques',
      room: 'Salle 105',
      schedule: 'Lun-Mer-Ven 08:00-09:00'
    },
    {
      id: 2,
      name: '2nde B',
      level: 'Seconde',
      studentsCount: 25,
      subject: 'Mathématiques',
      room: 'Salle 203',
      schedule: 'Mar-Jeu 10:00-11:00'
    }
  ];
  
  res.json(classes);
});

// ===== DONNÉES ÉLÈVES =====
router.post('/students/create', requireSandboxAuth, (req, res) => {
  const { firstName, lastName, class: studentClass, parentEmail, age } = req.body;
  
  const newStudent = {
    id: Math.floor(Math.random() * 10000) + 1000,
    firstName: firstName || 'Junior',
    lastName: lastName || 'Mvondo',
    email: `${(firstName || 'junior').toLowerCase()}.${(lastName || 'mvondo').toLowerCase()}@test.educafric.com`,
    role: 'Student',
    class: studentClass || '3ème A',
    age: age || 15,
    parentEmail: parentEmail || 'parent.mvondo@test.educafric.com',
    studentId: `STU${Math.floor(Math.random() * 10000)}`,
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'Actif',
    subjects: [
      { name: 'Mathématiques', teacher: 'Marie Nguesso', grade: 16.5 },
      { name: 'Français', teacher: 'Paul Essomba', grade: 14.8 },
      { name: 'Anglais', teacher: 'Sarah Johnson', grade: 17.2 },
      { name: 'Sciences', teacher: 'Dr. Kamdem', grade: 15.6 },
      { name: 'Histoire', teacher: 'Prof. Mbarga', grade: 13.9 }
    ],
    attendance: {
      totalDays: 120,
      presentDays: 115,
      absentDays: 5,
      rate: 95.8
    },
    performance: {
      average: 15.6,
      rank: 5,
      totalStudents: 28,
      trend: 'improving'
    }
  };
  
  console.log(`👨‍🎓 Nouvel élève créé: ${newStudent.firstName} ${newStudent.lastName} - ${newStudent.class}`);
  res.json(newStudent);
});

// ===== EMPLOI DU TEMPS =====
router.post('/timetable/create', requireSandboxAuth, (req, res) => {
  const { class: className, timeSlots } = req.body;
  
  const newTimetable = {
    id: Math.floor(Math.random() * 1000),
    class: className || '3ème A',
    week: 'Semaine du 27-31 Janvier 2025',
    schedule: timeSlots || {
      monday: [
        { time: '08:00-09:00', subject: 'Mathématiques', teacher: 'Marie Nguesso', room: 'Salle 105' },
        { time: '09:00-10:00', subject: 'Français', teacher: 'Paul Essomba', room: 'Salle 102' },
        { time: '10:15-11:15', subject: 'Anglais', teacher: 'Sarah Johnson', room: 'Salle 201' },
        { time: '11:15-12:15', subject: 'Sciences', teacher: 'Dr. Kamdem', room: 'Labo 1' },
        { time: '14:00-15:00', subject: 'IA & Numérique', teacher: 'Tech. Mvondo', room: 'Salle Info' }
      ],
      tuesday: [
        { time: '08:00-09:00', subject: 'Histoire-Géographie', teacher: 'Prof. Mbarga', room: 'Salle 103' },
        { time: '09:00-10:00', subject: 'Mathématiques', teacher: 'Marie Nguesso', room: 'Salle 105' },
        { time: '10:15-11:15', subject: 'EPS', teacher: 'Coach Biya', room: 'Gymnase' },
        { time: '14:00-15:00', subject: 'Arts & Communication', teacher: 'Mme Fon', room: 'Atelier' },
        { time: '15:00-16:00', subject: 'Robotique', teacher: 'Ing. Nkomo', room: 'Labo Tech' }
      ],
      wednesday: [
        { time: '08:00-09:00', subject: 'Mathématiques', teacher: 'Marie Nguesso', room: 'Salle 105' },
        { time: '09:00-10:00', subject: 'Sciences', teacher: 'Dr. Kamdem', room: 'Labo 1' },
        { time: '10:15-11:15', subject: 'Français', teacher: 'Paul Essomba', room: 'Salle 102' }
      ],
      thursday: [
        { time: '08:00-09:00', subject: 'Anglais', teacher: 'Sarah Johnson', room: 'Salle 201' },
        { time: '09:00-10:00', subject: 'Histoire', teacher: 'Prof. Mbarga', room: 'Salle 103' },
        { time: '10:15-11:15', subject: 'Mathématiques', teacher: 'Marie Nguesso', room: 'Salle 105' },
        { time: '14:00-15:00', subject: 'Informatique', teacher: 'M. Tchouta', room: 'Salle Info' }
      ],
      friday: [
        { time: '08:00-09:00', subject: 'Sciences', teacher: 'Dr. Kamdem', room: 'Labo 1' },
        { time: '09:00-10:00', subject: 'Français', teacher: 'Paul Essomba', room: 'Salle 102' },
        { time: '10:15-11:15', subject: 'Évaluation', teacher: 'Divers', room: 'Salle Examen' }
      ]
    },
    lastUpdated: new Date().toISOString(),
    term: 'Trimestre 2 - 2024/2025',
    academicYear: '2024-2025',
    status: 'Actif',
    innovations: {
      aiIntegration: true,
      digitalLearning: true,
      bilingualSupport: true,
      parentConnectivity: true
    }
  };
  
  console.log(`📅 Emploi du temps créé pour ${newTimetable.class}`);
  res.json(newTimetable);
});

// ===== SYSTÈME DE MESSAGERIE =====
// ✅ MISE À JOUR: Utilise le nouveau système de messagerie unifié
router.post('/messages/send', requireSandboxAuth, (req, res) => {
  const { connectionType, connectionId, message, messageType, priority } = req.body;
  
  const unifiedMessage = {
    id: Math.floor(Math.random() * 10000),
    connectionId: connectionId || 1,
    connectionType: connectionType || 'student-parent',
    senderId: req.user?.id || 1,
    message: message || 'Message de test du système unifié Educafric 2025',
    messageType: messageType || 'text',
    priority: priority || 'normal',
    sentAt: new Date().toISOString(),
    isRead: false,
    readAt: null,
    
    // Nouvelles fonctionnalités système unifié
    parentCcEnabled: false,
    teacherCcEnabled: false,
    geolocationShared: false,
    
    // Statistiques de livraison mises à jour
    deliveryStatus: {
      sent: 45,
      delivered: 42,
      read: 38,
      failed: 3
    },
    
    // Support multi-canal maintenu
    channels: ['email', 'sms', 'app', 'unified-messaging'],
    language: 'fr',
    attachments: [],
    
    // Données contextuelles pour demo
    messageData: {
      demoType: 'sandbox',
      platform: 'educafric-2025',
      features: ['unified-messaging', 'multi-connection-types']
    },
    
    // Réponses adaptées au nouveau système
    responses: [
      { from: 'parent.kamga@test.com', message: 'Message unifié bien reçu!', time: new Date().toISOString() },
      { from: 'teacher.nguesso@test.com', message: 'Système unifié opérationnel.', time: new Date().toISOString() }
    ]
  };
  
  console.log(`📨 [UNIFIED_MESSAGING] Message envoyé: "${unifiedMessage.message}" (${unifiedMessage.connectionType})`);
  res.json({ success: true, data: unifiedMessage, systemType: 'unified-messaging' });
});

// ===== DONNÉES DE TEST COMPLÈTES =====
router.get('/test-data/complete', requireSandboxAuth, (req, res) => {
  const completeTestData = {
    platform: {
      name: 'EDUCAFRIC Sandbox Environment 2025 - Actualisé',
      version: '2.2.0',
      lastUpdate: new Date().toISOString().split('T')[0],
      features: [
        'Géolocalisation Temps Réel',
        'Communication Multi-canal Unifiée', 
        'Analytics IA Avancées',
        'Système Premium Débridé',
        'Tests Automatisés',
        'Monitoring en Temps Réel',
        'Notifications Push PWA',
        'Support Multi-rôles'
      ],
      securityLevel: 'Production-Ready',
      performanceOptimized: true
    },
    school: {
      name: 'École Internationale de Yaoundé - Sandbox EDUCAFRIC',
      studentsCount: 542,
      teachersCount: 38,
      classesCount: 22,
      digitalReadiness: 98.5
    },
    teachers: [
      { 
        id: 1, 
        name: 'Marie Nguesso', 
        firstName: 'Marie',
        lastName: 'Nguesso',
        email: 'marie.nguesso@test.educafric.com',
        subject: 'Mathématiques', 
        classes: ['3ème A', '2nde B'], 
        specialty: 'Algèbre & IA',
        phone: '+237677123456',
        experience: '8 ans',
        qualification: 'Master en Mathématiques Appliquées',
        performance: { rating: 4.8, studentsSuccess: 94 }
      },
      { 
        id: 2, 
        name: 'Paul Essomba', 
        firstName: 'Paul',
        lastName: 'Essomba',
        email: 'paul.essomba@test.educafric.com',
        subject: 'Français', 
        classes: ['3ème A', '1ère L'], 
        specialty: 'Littérature Africaine',
        phone: '+237678234567',
        experience: '12 ans',
        qualification: 'Doctorat en Littérature',
        performance: { rating: 4.9, studentsSuccess: 91 }
      },
      { 
        id: 3, 
        name: 'Sarah Johnson', 
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@test.educafric.com',
        subject: 'Anglais', 
        classes: ['3ème A', '2nde B', '1ère L'], 
        specialty: 'Communication Internationale',
        phone: '+237679345678',
        experience: '6 ans',
        qualification: 'Master TESOL',
        performance: { rating: 4.7, studentsSuccess: 96 }
      },
      { 
        id: 4, 
        name: 'Dr. Kamdem', 
        firstName: 'Jean-Claude',
        lastName: 'Kamdem',
        email: 'jc.kamdem@test.educafric.com',
        subject: 'Sciences', 
        classes: ['3ème A', '2nde B'], 
        specialty: 'Physique-Chimie',
        phone: '+237680456789',
        experience: '15 ans',
        qualification: 'Doctorat en Physique',
        performance: { rating: 4.9, studentsSuccess: 88 }
      },
      { 
        id: 5, 
        name: 'Tech. Mvondo', 
        firstName: 'Alain',
        lastName: 'Mvondo',
        email: 'alain.mvondo@test.educafric.com',
        subject: 'IA & Numérique', 
        classes: ['2nde B', '1ère S'], 
        specialty: 'Intelligence Artificielle',
        phone: '+237681567890',
        experience: '5 ans',
        qualification: 'Master IA & Data Science',
        performance: { rating: 4.8, studentsSuccess: 92 }
      }
    ],
    students: [
      { 
        id: 1, 
        name: 'Junior Mvondo',
        firstName: 'Junior',
        lastName: 'Mvondo', 
        email: 'junior.mvondo@test.educafric.com',
        class: '3ème A', 
        age: 15,
        average: 15.6, 
        attendance: 95.8,
        parentName: 'Marie Mvondo',
        parentPhone: '+237650111222',
        subjects: {
          'Mathématiques': { grade: 16.5, teacher: 'Marie Nguesso' },
          'Français': { grade: 14.8, teacher: 'Paul Essomba' },
          'Anglais': { grade: 17.2, teacher: 'Sarah Johnson' },
          'Sciences': { grade: 15.1, teacher: 'Dr. Kamdem' },
          'IA & Numérique': { grade: 16.8, teacher: 'Tech. Mvondo' }
        },
        behavior: 'Excellent',
        achievements: ['Concours Math Inter-Écoles 2024', 'Prix d\'Excellence']
      },
      { 
        id: 2, 
        name: 'Marie Kamga',
        firstName: 'Marie',
        lastName: 'Kamga', 
        email: 'marie.kamga@test.educafric.com',
        class: '3ème A', 
        age: 14,
        average: 17.2, 
        attendance: 98.5,
        parentName: 'Paul Kamga',
        parentPhone: '+237651222333',
        subjects: {
          'Mathématiques': { grade: 18.5, teacher: 'Marie Nguesso' },
          'Français': { grade: 17.8, teacher: 'Paul Essomba' },
          'Anglais': { grade: 16.2, teacher: 'Sarah Johnson' },
          'Sciences': { grade: 17.1, teacher: 'Dr. Kamdem' },
          'IA & Numérique': { grade: 16.4, teacher: 'Tech. Mvondo' }
        },
        behavior: 'Excellent',
        achievements: ['Major de Promotion', 'Prix Littéraire']
      },
      { 
        id: 3, 
        name: 'Paul Essomba Jr',
        firstName: 'Paul',
        lastName: 'Essomba Jr', 
        email: 'paul.essomba.jr@test.educafric.com',
        class: '2nde B', 
        age: 16,
        average: 14.8, 
        attendance: 92.3,
        parentName: 'Sophie Essomba',
        parentPhone: '+237652333444',
        subjects: {
          'Mathématiques': { grade: 15.5, teacher: 'Marie Nguesso' },
          'Français': { grade: 16.8, teacher: 'Paul Essomba' },
          'Anglais': { grade: 13.2, teacher: 'Sarah Johnson' },
          'Sciences': { grade: 14.1, teacher: 'Dr. Kamdem' },
          'IA & Numérique': { grade: 14.4, teacher: 'Tech. Mvondo' }
        },
        behavior: 'Bon',
        achievements: ['Club de Débat']
      }
    ],
    classes: [
      { id: 1, name: '3ème A', students: 28, teacher: 'Marie Nguesso' },
      { id: 2, name: '2nde B', students: 25, teacher: 'Sarah Johnson' },
      { id: 3, name: '1ère L', students: 22, teacher: 'Paul Essomba' }
    ],
    timetables: {
      '3ème A': 5, // jours configurés
      '2nde B': 5,
      '1ère L': 4
    },
    messaging: {
      systemType: 'unified-messaging-2025',
      connectionTypes: ['student-parent', 'teacher-student', 'family', 'partnership'],
      consolidationSuccess: '78% duplication eliminated',
      linesReduced: 913
    },
    messages: {
      sent: 127,
      delivered: 124,
      responses: 89
    }
  };
  
  res.json(completeTestData);
});

// ===== NOUVELLES ROUTES SANDBOX 2025 =====

// Route de métriques sandbox en temps réel
router.get('/metrics', requireSandboxAuth, (req, res) => {
  const currentTime = new Date().toISOString();
  const metrics = {
    timestamp: currentTime,
    system: {
      version: '2.2.0',
      environment: 'sandbox',
      uptime: Math.floor(Math.random() * 86400), // secondes
      status: 'operational',
      lastRestart: new Date(Date.now() - 3600000).toISOString() // 1h ago
    },
    performance: {
      apiCalls: Math.floor(Math.random() * 2000) + 1000,
      responseTime: Math.floor(Math.random() * 200) + 50, // ms
      errorRate: Math.random() * 0.05, // 0-5%
      memoryUsage: Math.floor(Math.random() * 40) + 40, // 40-80%
      cpuUsage: Math.floor(Math.random() * 30) + 20 // 20-50%
    },
    users: {
      active: Math.floor(Math.random() * 20) + 10,
      total: Math.floor(Math.random() * 100) + 50,
      sessionsToday: Math.floor(Math.random() * 150) + 75
    },
    database: {
      connections: Math.floor(Math.random() * 10) + 5,
      queries: Math.floor(Math.random() * 5000) + 2000,
      responseTime: Math.floor(Math.random() * 50) + 10
    },
    features: {
      messaging: { status: 'active', usage: '87%' },
      geolocation: { status: 'active', usage: '92%' },
      notifications: { status: 'active', usage: '78%' },
      analytics: { status: 'active', usage: '65%' }
    }
  };
  
  res.json(metrics);
});

// Route de reset sandbox (nettoyage des données de test)
router.post('/reset', requireSandboxAuth, (req, res) => {
  const resetData = {
    action: 'sandbox_reset',
    timestamp: new Date().toISOString(),
    resetItems: [
      'Test messages cleared',
      'Demo users refreshed',
      'Sample data regenerated',
      'Cache cleared',
      'Metrics reset'
    ],
    status: 'success',
    nextReset: new Date(Date.now() + 3600000).toISOString() // 1h later
  };
  
  console.log(`🔄 [SANDBOX_RESET] Reset effectué à ${resetData.timestamp}`);
  res.json(resetData);
});

// Route de configuration sandbox avancée
router.get('/config', requireSandboxAuth, (req, res) => {
  const config = {
    sandbox: {
      version: '2.2.0',
      mode: 'advanced',
      features: {
        premiumUnlocked: true,
        geolocationEnabled: true,
        notificationsEnabled: true,
        analyticsEnabled: true,
        messagingEnabled: true,
        testDataEnabled: true
      },
      limits: {
        apiCalls: 'unlimited',
        storage: 'unlimited',
        users: 'unlimited'
      },
      security: {
        rateLimit: false,
        dataValidation: true,
        auditLog: true
      },
      performance: {
        caching: true,
        compression: true,
        optimization: true
      }
    },
    school: {
      name: 'École Internationale de Yaoundé - Sandbox EDUCAFRIC',
      academicYear: '2024-2025',
      currentTerm: 'Trimestre 2',
      currency: 'CFA',
      timezone: 'Africa/Douala',
      language: 'fr'
    }
  };
  
  res.json(config);
});

export default router;
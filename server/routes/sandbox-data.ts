/**
 * EDUCAFRIC - Routes de données sandbox complètes
 * Fournit des données réalistes pour tous les tests environnementaux
 */

import { Router } from 'express';

const router = Router();

// Middleware d'authentification sandbox
const requireSandboxAuth = (req: any, res: any, next: any) => {
  // Accepter tous les utilisateurs demo/test
  if (req.headers.authorization?.includes('sandbox') || 
      req.headers.authorization?.includes('demo') ||
      req.user?.email?.includes('test.educafric.com')) {
    req.user = req.user || { id: 1, role: 'Admin', email: 'sandbox@test.educafric.com' };
    return next();
  }
  res.status(401).json({ message: 'Sandbox access required' });
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
      name: 'EDUCAFRIC Sandbox Environment 2025',
      version: '2.1.0',
      lastUpdate: '2025-01-15',
      features: ['Géolocalisation', 'Communication Multi-canal', 'Analytics Avancées', 'IA Éducative']
    },
    school: {
      name: 'École Internationale de Yaoundé - Sandbox EDUCAFRIC',
      studentsCount: 542,
      teachersCount: 38,
      classesCount: 22,
      digitalReadiness: 98.5
    },
    teachers: [
      { id: 1, name: 'Marie Nguesso', subject: 'Mathématiques', classes: ['3ème A', '2nde B'], specialty: 'Algèbre & IA' },
      { id: 2, name: 'Paul Essomba', subject: 'Français', classes: ['3ème A', '1ère L'], specialty: 'Littérature Africaine' },
      { id: 3, name: 'Sarah Johnson', subject: 'Anglais', classes: ['3ème A', '2nde B', '1ère L'], specialty: 'Communication Internationale' },
      { id: 4, name: 'Dr. Kamdem', subject: 'Sciences', classes: ['3ème A', '2nde B'], specialty: 'Physique-Chimie' },
      { id: 5, name: 'Tech. Mvondo', subject: 'IA & Numérique', classes: ['2nde B', '1ère S'], specialty: 'Intelligence Artificielle' }
    ],
    students: [
      { id: 1, name: 'Junior Mvondo', class: '3ème A', average: 15.6, attendance: 95.8 },
      { id: 2, name: 'Marie Kamga', class: '3ème A', average: 17.2, attendance: 98.5 },
      { id: 3, name: 'Paul Essomba Jr', class: '2nde B', average: 14.8, attendance: 92.3 }
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

export default router;
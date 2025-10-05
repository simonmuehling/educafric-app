import { Router } from 'express';

const router = Router();

// Middleware to require authentication
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

// Sandbox data routes
router.get('/students', requireAuth, async (req, res) => {
  const sandboxStudents = [
    { id: 9004, name: 'Junior Kamga', age: 14, class: '3ème A', parentName: 'Marie Kamga', subjects: ['Mathématiques', 'Français', 'Sciences', 'Histoire', 'Anglais'] },
    { id: 9005, name: 'Stephanie Mbarga', age: 15, class: '3ème A', parentName: 'Paul Mbarga', subjects: ['Mathématiques', 'Français', 'Sciences', 'Anglais', 'Géographie'] },
    { id: 9006, name: 'Carlos Essono', age: 13, class: '2nde B', parentName: 'Maria Essono', subjects: ['Mathématiques', 'Physique', 'Chimie', 'Anglais', 'Histoire'] }
  ];
  
  res.json({
    success: true,
    students: sandboxStudents
  });
});

router.get('/classes', requireAuth, async (req, res) => {
  const sandboxClasses = [
    { id: 301, name: '3ème A', level: '3ème', students: 25, teacher: 'Paul Mvondo' },
    { id: 302, name: '2nde B', level: '2nde', students: 22, teacher: 'Paul Mvondo' }
  ];
  
  res.json({
    success: true,
    classes: sandboxClasses
  });
});

router.get('/grades', requireAuth, async (req, res) => {
  const sandboxGrades = [
    { id: 1, studentId: 9004, studentName: 'Junior Kamga', subject: 'Mathématiques', grade: 16.5, date: '2025-01-15', teacher: 'Paul Mvondo' },
    { id: 2, studentId: 9004, studentName: 'Junior Kamga', subject: 'Français', grade: 14.8, date: '2025-01-14', teacher: 'Sophie Biya' },
    { id: 3, studentId: 9004, studentName: 'Junior Kamga', subject: 'Sciences', grade: 17.2, date: '2025-01-13', teacher: 'Paul Mvondo' },
    { id: 4, studentId: 9004, studentName: 'Junior Kamga', subject: 'Anglais', grade: 15.9, date: '2025-01-12', teacher: 'Sarah Johnson' },
    { id: 5, studentId: 9005, studentName: 'Stephanie Mbarga', subject: 'Mathématiques', grade: 18.5, date: '2025-01-15', teacher: 'Paul Mvondo' },
    { id: 6, studentId: 9005, studentName: 'Stephanie Mbarga', subject: 'Français', grade: 16.3, date: '2025-01-14', teacher: 'Sophie Biya' }
  ];
  
  res.json({
    success: true,
    grades: sandboxGrades
  });
});

router.get('/homework', requireAuth, async (req, res) => {
  const sandboxHomework = [
    { id: 1, subject: 'Mathématiques', title: 'Exercices sur les fonctions', dueDate: '2025-01-20', status: 'pending', teacher: 'Paul Mvondo' },
    { id: 2, subject: 'Français', title: 'Dissertation: L\'importance de l\'éducation en Afrique', dueDate: '2025-01-22', status: 'submitted', teacher: 'Sophie Biya' },
    { id: 3, subject: 'Sciences', title: 'Projet: Les énergies renouvelables au Cameroun', dueDate: '2025-01-25', status: 'pending', teacher: 'Paul Mvondo' },
    { id: 4, subject: 'Anglais', title: 'Essay: African Literature', dueDate: '2025-01-23', status: 'pending', teacher: 'Sarah Johnson' },
    { id: 5, subject: 'Histoire', title: 'Recherche: L\'indépendance du Cameroun', dueDate: '2025-01-28', status: 'not_started', teacher: 'Dr. Atangana' }
  ];
  
  res.json({
    success: true,
    homework: sandboxHomework
  });
});

router.get('/communications', requireAuth, async (req, res) => {
  const sandboxCommunications = [
    { id: 1, from: 'Paul Mvondo', message: 'Réunion parents d\'élèves pour la rentrée 2025 - 25 janvier à 14h', date: '2025-01-15', type: 'announcement' },
    { id: 2, from: 'Dr. Nguetsop Carine', message: 'Félicitations pour l\'excellent travail de Junior ce trimestre', date: '2025-01-14', type: 'personal' },
    { id: 3, from: 'Sophie Biya', message: 'Rappel: Concours de dissertation en français - inscription avant le 20 janvier', date: '2025-01-16', type: 'announcement' },
    { id: 4, from: 'Administration', message: 'Nouvelle plateforme EDUCAFRIC disponible - Guide d\'utilisation en pièce jointe', date: '2025-01-15', type: 'system' }
  ];
  
  res.json({
    success: true,
    communications: sandboxCommunications
  });
});

router.get('/attendance', requireAuth, async (req, res) => {
  const sandboxAttendance = [
    { id: 1, studentId: 9004, studentName: 'Junior Kamga', date: '2025-01-16', status: 'present', arrivalTime: '07:30' },
    { id: 2, studentId: 9004, studentName: 'Junior Kamga', date: '2025-01-15', status: 'present', arrivalTime: '07:25' },
    { id: 3, studentId: 9004, studentName: 'Junior Kamga', date: '2025-01-14', status: 'late', arrivalTime: '08:15' },
    { id: 4, studentId: 9005, studentName: 'Stephanie Mbarga', date: '2025-01-16', status: 'present', arrivalTime: '07:20' },
    { id: 5, studentId: 9005, studentName: 'Stephanie Mbarga', date: '2025-01-15', status: 'present', arrivalTime: '07:35' },
    { id: 6, studentId: 9006, studentName: 'Carlos Essono', date: '2025-01-16', status: 'absent', arrivalTime: null, reason: 'Maladie' }
  ];
  
  res.json({
    success: true,
    attendance: sandboxAttendance
  });
});

// Sandbox login route
router.post('/login', (req, res) => {
  const { email, password, role } = req.body;
  
  if (password !== 'sandbox123') {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const profiles = {
    'sandbox.parent@educafric.demo': { id: 9001, role: 'Parent', name: 'Marie Kamga' },
    'sandbox.teacher@educafric.demo': { id: 9002, role: 'Teacher', name: 'Paul Mvondo' },
    'sandbox.freelancer@educafric.demo': { id: 9003, role: 'Freelancer', name: 'Sophie Biya' },
    'sandbox.student@educafric.demo': { id: 9004, role: 'Student', name: 'Junior Kamga' },
    'sandbox.admin@educafric.demo': { id: 9005, role: 'Admin', name: 'Dr. Nguetsop Carine' },
    'sandbox.director@educafric.demo': { id: 9006, role: 'Director', name: 'Prof. Atangana Michel' }
  };

  const profile = profiles[email as keyof typeof profiles];
  if (profile) {
    const sandboxUser = {
      ...profile,
      email,
      sandboxMode: true,
      schoolId: 999
    };
    (req.session as any).sandboxUser = sandboxUser;
    
    res.json({
      success: true,
      user: sandboxUser
    });
  } else {
    res.status(401).json({ message: 'Invalid sandbox credentials' });
  }
});

// Mirror routes for compatibility
router.get('/mirror/grades', (req, res) => {
  res.json({ success: true, data: [] });
});

router.get('/mirror/homework', (req, res) => {
  res.json({ success: true, data: [] });
});

router.get('/mirror/subjects', (req, res) => {
  res.json({ success: true, data: ['Mathématiques', 'Français', 'Sciences', 'Histoire'] });
});

router.get('/mirror/students', (req, res) => {
  res.json({ success: true, data: [{ id: 9004, name: 'Junior Kamga' }] });
});

router.get('/mirror/teachers', (req, res) => {
  res.json({ success: true, data: [{ id: 9002, name: 'Paul Mvondo' }] });
});

// Test communication route
router.post('/test-communication', (req, res) => {
  const { recipientType, message, priority } = req.body;
  
  res.json({
    success: true,
    message: 'Test communication sent successfully',
    data: {
      recipient: recipientType,
      messageContent: message,
      priority: priority,
      sentAt: new Date().toISOString(),
      deliveryStatus: 'delivered'
    }
  });
});

// Test notification route
router.post('/test-notification', (req, res) => {
  const { type, title, message, targetAudience } = req.body;
  
  res.json({
    success: true,
    message: 'Test notification sent successfully',
    data: {
      notificationId: Date.now(),
      type,
      title,
      message,
      targetAudience,
      sentAt: new Date().toISOString(),
      deliveryStatus: 'sent',
      recipients: targetAudience === 'all' ? ['Parents', 'Teachers', 'Students'] : [targetAudience]
    }
  });
});

// Timetable creation route 
router.post('/timetable/create', requireAuth, (req, res) => {
  const { subject, time, day, classId, teacherId } = req.body;
  
  res.json({
    success: true,
    message: 'Timetable entry created successfully',
    data: {
      id: Date.now(),
      subject,
      time,
      day,
      classId,
      teacherId,
      createdAt: new Date().toISOString(),
      status: 'active'
    }
  });
});

export default router;
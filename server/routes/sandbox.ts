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
    { id: 9004, name: 'Junior Kamga', age: 14, class: '3ème A', parentName: 'Marie Kamga', subjects: ['Math', 'French', 'Science', 'History'] }
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
    { id: 1, studentId: 9004, studentName: 'Junior Kamga', subject: 'Mathématiques', grade: 15.5, date: '2024-12-01', teacher: 'Paul Mvondo' },
    { id: 2, studentId: 9004, studentName: 'Junior Kamga', subject: 'Français', grade: 13.8, date: '2024-12-02', teacher: 'Sophie Biya' },
    { id: 3, studentId: 9004, studentName: 'Junior Kamga', subject: 'Sciences', grade: 16.2, date: '2024-12-03', teacher: 'Paul Mvondo' }
  ];
  
  res.json({
    success: true,
    grades: sandboxGrades
  });
});

router.get('/homework', requireAuth, async (req, res) => {
  const sandboxHomework = [
    { id: 1, subject: 'Mathématiques', title: 'Exercices sur les équations', dueDate: '2024-12-15', status: 'pending', teacher: 'Paul Mvondo' },
    { id: 2, subject: 'Français', title: 'Rédaction: Mon Cameroun', dueDate: '2024-12-18', status: 'submitted', teacher: 'Sophie Biya' },
    { id: 3, subject: 'Sciences', title: 'Rapport d\'expérience - La photosynthèse', dueDate: '2024-12-20', status: 'pending', teacher: 'Paul Mvondo' }
  ];
  
  res.json({
    success: true,
    homework: sandboxHomework
  });
});

router.get('/communications', requireAuth, async (req, res) => {
  const sandboxCommunications = [
    { id: 1, from: 'Paul Mvondo', message: 'Réunion parents d\'élèves le 20 décembre', date: '2024-12-08', type: 'announcement' },
    { id: 2, from: 'Dr. Nguetsop Carine', message: 'Félicitations pour les excellents résultats de Junior', date: '2024-12-07', type: 'personal' }
  ];
  
  res.json({
    success: true,
    communications: sandboxCommunications
  });
});

router.get('/attendance', requireAuth, async (req, res) => {
  const sandboxAttendance = [
    { id: 1, studentId: 9004, studentName: 'Junior Kamga', date: '2024-12-08', status: 'present', arrivalTime: '07:30' },
    { id: 2, studentId: 9004, studentName: 'Junior Kamga', date: '2024-12-07', status: 'present', arrivalTime: '07:25' },
    { id: 3, studentId: 9004, studentName: 'Junior Kamga', date: '2024-12-06', status: 'late', arrivalTime: '08:15' }
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
    req.session.sandboxUser = {
      ...profile,
      email,
      sandboxMode: true,
      schoolId: 999
    };
    
    res.json({
      success: true,
      user: req.session.sandboxUser
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

export default router;
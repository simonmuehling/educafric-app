// Educafric Offline Sandbox Data
// Pre-bundled demo data for complete offline functionality

export const SANDBOX_OFFLINE_DATA = {
  // School data
  school: {
    id: 1,
    name: 'École Secondaire Excellence Yaoundé',
    address: 'BP 12345, Yaoundé, Cameroun',
    phone: '+237 222 123 456',
    email: 'contact@excellence-yaounde.cm',
    academicYear: '2024-2025',
    currentTerm: 2,
    motto: 'Excellence, Discipline, Réussite',
    logo: '/assets/school-logo.png'
  },

  // Users - All sandbox profiles
  users: [
    {
      id: 1,
      email: 'sandbox.director@educafric.demo',
      name: 'Dr. Christiane Fouda',
      role: 'Director',
      schoolId: 1,
      sandboxMode: true,
      avatar: '/assets/avatars/director.png',
      phone: '+237 677 111 111',
      profileComplete: true
    },
    {
      id: 2,
      email: 'sandbox.teacher@educafric.demo',
      name: 'Paul Mvondo',
      role: 'Teacher',
      schoolId: 1,
      sandboxMode: true,
      avatar: '/assets/avatars/teacher.png',
      phone: '+237 677 222 222',
      subjects: ['Mathématiques', 'Physique'],
      experience: '8 ans'
    },
    {
      id: 3,
      email: 'sandbox.student@educafric.demo',
      name: 'Junior Kamga',
      role: 'Student',
      schoolId: 1,
      sandboxMode: true,
      avatar: '/assets/avatars/student.png',
      classId: 1,
      parentId: 4,
      dateOfBirth: '2010-05-15',
      age: 14
    },
    {
      id: 4,
      email: 'sandbox.parent@educafric.demo',
      name: 'Marie Kamga',
      role: 'Parent',
      schoolId: 1,
      sandboxMode: true,
      avatar: '/assets/avatars/parent.png',
      phone: '+237 677 333 333',
      profession: 'Infirmière',
      children: [3]
    }
  ],

  // Classes
  classes: [
    {
      id: 1,
      name: '3ème A',
      level: '3ème',
      section: 'A',
      teacherId: 2,
      academicYear: '2024-2025',
      studentCount: 35,
      capacity: 40
    },
    {
      id: 2,
      name: '2nde C',
      level: '2nde',
      section: 'C',
      teacherId: 2,
      academicYear: '2024-2025',
      studentCount: 32,
      capacity: 40
    }
  ],

  // Students (extended list)
  students: [
    {
      id: 3,
      name: 'Junior Kamga',
      classId: 1,
      parentId: 4,
      averageGrade: 14.5,
      attendance: 95,
      status: 'active'
    },
    {
      id: 10,
      name: 'Amina Diallo',
      classId: 1,
      parentId: null,
      averageGrade: 16.2,
      attendance: 98,
      status: 'active'
    },
    {
      id: 11,
      name: 'Kofi Mensah',
      classId: 1,
      parentId: null,
      averageGrade: 13.8,
      attendance: 92,
      status: 'active'
    }
  ],

  // Grades for Term 2
  grades: [
    {
      id: 1,
      studentId: 3,
      studentName: 'Junior Kamga',
      classId: 1,
      term: 2,
      academicYear: '2024-2025',
      subjects: {
        'Mathématiques': { grade: 15.5, coefficient: 4 },
        'Français': { grade: 14.0, coefficient: 6 },
        'Anglais': { grade: 13.5, coefficient: 3 },
        'Physique': { grade: 16.0, coefficient: 3 },
        'Histoire': { grade: 14.5, coefficient: 2 },
        'Géographie': { grade: 15.0, coefficient: 2 },
        'SVT': { grade: 14.0, coefficient: 2 },
        'EPS': { grade: 16.5, coefficient: 2 }
      },
      average: 14.5,
      rank: 8,
      totalStudents: 35,
      appreciation: 'Bon trimestre, continue tes efforts!'
    }
  ],

  // Attendance records (last 30 days)
  attendance: [
    {
      id: 1,
      studentId: 3,
      date: '2025-10-22',
      status: 'present',
      classId: 1,
      markedBy: 2
    },
    {
      id: 2,
      studentId: 3,
      date: '2025-10-21',
      status: 'present',
      classId: 1,
      markedBy: 2
    },
    {
      id: 3,
      studentId: 3,
      date: '2025-10-18',
      status: 'absent',
      reason: 'Maladie',
      classId: 1,
      markedBy: 2
    }
  ],

  // Homework/Assignments
  homework: [
    {
      id: 1,
      title: 'Exercices sur les équations du second degré',
      subject: 'Mathématiques',
      classId: 1,
      teacherId: 2,
      dueDate: '2025-10-25',
      description: 'Résoudre les exercices 1 à 10 de la page 45',
      status: 'pending',
      attachments: []
    },
    {
      id: 2,
      title: 'Dissertation: L\'impact du colonialisme en Afrique',
      subject: 'Histoire',
      classId: 1,
      teacherId: 2,
      dueDate: '2025-10-28',
      description: 'Rédiger une dissertation de 500 mots',
      status: 'pending',
      attachments: []
    }
  ],

  // Timetable for 3ème A
  timetable: [
    {
      id: 1,
      classId: 1,
      day: 'Lundi',
      periods: [
        { time: '07:30-09:00', subject: 'Mathématiques', teacher: 'Paul Mvondo', room: 'Salle 12' },
        { time: '09:00-10:30', subject: 'Français', teacher: 'Marie Essono', room: 'Salle 8' },
        { time: '10:30-11:00', subject: 'Pause', teacher: '', room: '' },
        { time: '11:00-12:30', subject: 'Anglais', teacher: 'John Njie', room: 'Salle 15' },
        { time: '12:30-14:00', subject: 'Déjeuner', teacher: '', room: '' },
        { time: '14:00-15:30', subject: 'Physique', teacher: 'Paul Mvondo', room: 'Lab 2' }
      ]
    }
  ],

  // Notifications
  notifications: [
    {
      id: 1,
      userId: 3,
      title: 'Nouveau devoir de Mathématiques',
      message: 'Un nouveau devoir a été assigné pour le 25 octobre',
      type: 'homework',
      read: false,
      createdAt: '2025-10-22T08:00:00Z'
    },
    {
      id: 2,
      userId: 4,
      title: 'Absence signalée',
      message: 'Junior était absent le 18 octobre',
      type: 'attendance',
      read: false,
      createdAt: '2025-10-18T09:00:00Z'
    }
  ],

  // Settings for each role
  settings: {
    director: {
      language: 'fr',
      theme: 'light',
      notifications: {
        email: true,
        whatsapp: true,
        push: true
      },
      preferences: {
        defaultView: 'dashboard',
        autoApproval: false
      }
    },
    teacher: {
      language: 'fr',
      theme: 'light',
      notifications: {
        email: true,
        whatsapp: false,
        push: true
      }
    },
    student: {
      language: 'fr',
      theme: 'light',
      notifications: {
        email: false,
        whatsapp: false,
        push: true
      }
    },
    parent: {
      language: 'fr',
      theme: 'light',
      notifications: {
        email: true,
        whatsapp: true,
        push: true
      }
    }
  },

  // Dashboard stats
  dashboardStats: {
    director: {
      totalStudents: 450,
      totalTeachers: 35,
      totalClasses: 18,
      attendanceRate: 94.5,
      averageGrade: 13.2,
      pendingApprovals: 5
    },
    teacher: {
      totalClasses: 4,
      totalStudents: 128,
      pendingHomework: 45,
      upcomingClasses: 8
    },
    student: {
      currentAverage: 14.5,
      attendance: 95,
      pendingHomework: 3,
      upcomingExams: 2
    },
    parent: {
      children: 1,
      averageGrade: 14.5,
      attendance: 95,
      unreadNotifications: 2
    }
  }
};

// Session data for offline authentication
export const SANDBOX_SESSIONS = {
  'sandbox.director@educafric.demo': {
    userId: 1,
    role: 'Director',
    token: 'offline-sandbox-token-director',
    expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000) // 1 year
  },
  'sandbox.teacher@educafric.demo': {
    userId: 2,
    role: 'Teacher',
    token: 'offline-sandbox-token-teacher',
    expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000)
  },
  'sandbox.student@educafric.demo': {
    userId: 3,
    role: 'Student',
    token: 'offline-sandbox-token-student',
    expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000)
  },
  'sandbox.parent@educafric.demo': {
    userId: 4,
    role: 'Parent',
    token: 'offline-sandbox-token-parent',
    expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000)
  }
};

// NOTE: These credentials are ONLY for offline demo mode when no server is available
// They do NOT grant access to production data or real user accounts
// Server-side sandbox authentication uses environment variables and is disabled in production
// For offline demo purposes only - works completely client-side without server
export const SANDBOX_CREDENTIALS = {
  'sandbox.director@educafric.demo': 'sandbox123',
  'sandbox.teacher@educafric.demo': 'sandbox123',
  'sandbox.student@educafric.demo': 'sandbox123',
  'sandbox.parent@educafric.demo': 'sandbox123'
};

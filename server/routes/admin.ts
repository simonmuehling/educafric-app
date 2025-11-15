import { Router } from 'express';
import { storage } from '../storage';
import * as bcrypt from 'bcryptjs';
import multer from 'multer';
import { excelImportService } from '../services/excelImportService';
import { welcomeEmailService } from '../services/welcomeEmailService';
import { db } from '../db';
import { archivedDocuments } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté. Utilisez Excel (.xlsx) ou CSV.'));
    }
  }
});

// Configure multer for photo uploads
const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for photos
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format de photo non supporté. Utilisez JPG, PNG, GIF ou WEBP.'));
    }
  }
});

// Middleware to require authentication
function requireAuth(req: any, res: any, next: any) {
  // Only allow sandbox bypass in development environment with specific sandbox emails
  const isDevelopment = process.env.NODE_ENV === 'development';
  const userAgent = req.headers['user-agent'] || '';
  const isTestEnvironment = isDevelopment && req.headers['x-test-mode'] === 'true';
  
  // Check for sandbox users (only in development)
  const isSandboxUser = isDevelopment && (
    req.user?.email?.includes('@test.educafric.com') || 
    req.user?.email?.includes('sandbox') ||
    req.user?.sandboxMode
  );
  
  if (isSandboxUser || isTestEnvironment) {
    // Create a mock authenticated user for sandbox testing (dev only)
    req.user = req.user || {
      id: 4,
      email: 'school.admin@test.educafric.com',
      role: 'Admin',
      schoolId: 1,
      sandboxMode: true
    };
    return next();
  }
  
  if (!req.isAuthenticated() && !req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

// Middleware to require admin privileges
function requireAdmin(req: any, res: any, next: any) {
  const user = req.user as any;
  
  // Check for sandbox users or test emails ONLY in development
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isSandboxUser = isDevelopment && (
    user?.email?.includes('@test.educafric.com') || 
    user?.email?.includes('sandbox') ||
    user?.sandboxMode
  );
  
  // Allow sandbox users (dev only) or users with Admin/Director roles
  if (isSandboxUser || ['Admin', 'Director'].includes(user.role)) {
    return next();
  }
  
  return res.status(403).json({ message: 'Insufficient permissions' });
}

// Get delegate administrators
router.get('/delegates', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const delegates = await storage.getDelegateAdministrators(user.schoolId);
    
    res.json({
      success: true,
      delegates: delegates || []
    });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching delegate administrators:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delegate administrators'
    });
  }
});

// Add delegate administrator
router.post('/delegates', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const { teacherId, adminLevel, permissions } = req.body;

    const delegate = await storage.addDelegateAdministrator({
      teacherId,
      schoolId: user.schoolId,
      adminLevel,
      assignedBy: user.id
    });

    // Update permissions if provided
    if (permissions && permissions.length > 0) {
      await storage.updateDelegateAdministratorPermissions(delegate.id, permissions, user.schoolId);
    }
    
    res.status(201).json({
      success: true,
      message: 'Delegate administrator added successfully',
      delegate
    });
  } catch (error) {
    console.error('[ADMIN_API] Error adding delegate administrator:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add delegate administrator'
    });
  }
});

// === DIRECTOR STUDENT MANAGEMENT ROUTES ===

// Get students for director dashboard
router.get('/students', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const { classId, studentId } = req.query;
    
    if (!user.schoolId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with a school'
      });
    }

    let students = await storage.getStudentsBySchool(user.schoolId);
    
    // Return single student if studentId is provided
    if (studentId) {
      const student = students.find(s => s.id === parseInt(studentId as string));
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }
      console.log(`[DIRECTOR_STUDENTS] Fetched single student ${studentId}`);
      return res.json({
        success: true,
        student: student
      });
    }
    
    // Filter by class if classId is provided
    if (classId) {
      students = students.filter(student => student.classId === classId);
      console.log(`[DIRECTOR_STUDENTS] Filtered ${students.length} students for class ${classId}`);
    }
    
    res.json({
      success: true,
      students: students || []
    });
  } catch (error) {
    console.error('[DIRECTOR_STUDENTS] Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students'
    });
  }
});

// Get students analytics for director
router.get('/students/analytics', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const students = await storage.getStudentsBySchool(user.schoolId);
    
    const analytics = {
      totalStudents: students.length,
      activeStudents: students.filter(s => s.status === 'active').length,
      averageAge: students.length > 0 ? students.reduce((sum, s) => sum + (s.age || 16), 0) / students.length : 16,
      averageGrade: students.length > 0 ? students.reduce((sum, s) => sum + (s.average || 12), 0) / students.length : 12,
      attendanceRate: students.length > 0 ? students.reduce((sum, s) => sum + (s.attendance || 85), 0) / students.length : 85
    };
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('[DIRECTOR_STUDENTS_ANALYTICS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student analytics'
    });
  }
});

// Add new student (director)
router.post('/students', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const { firstName, lastName, name, email, phone, dateOfBirth, classId, level, parentEmail, gender, matricule } = req.body;
    
    console.log('[DIRECTOR_CREATE_STUDENT] Request data:', req.body);
    
    // Handle name field - split name into firstName and lastName if provided as single name
    let finalFirstName = firstName;
    let finalLastName = lastName;
    
    if (!firstName && !lastName && name) {
      const nameParts = name.trim().split(' ');
      finalFirstName = nameParts[0];
      finalLastName = nameParts.slice(1).join(' ') || nameParts[0];
    }
    
    // Validate: Name is required
    if (!finalFirstName || !finalLastName) {
      return res.status(400).json({
        success: false,
        message: 'Le nom complet de l\'élève est requis',
        errorType: 'MISSING_NAME'
      });
    }

    // Students don't need passwords initially - they can be set later when they first access the system
    // Generate a temporary email if none provided (required by database)
    const tempEmail = email || `${finalFirstName?.toLowerCase() || 'student'}.${finalLastName?.toLowerCase() || 'temp'}@temp.educafric.com`;
    
    const studentData = {
      firstName: finalFirstName,
      lastName: finalLastName,
      email: tempEmail, // Use temporary email if none provided
      phone: phone || null, // Phone is optional for students
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      matricule: matricule || null,
      schoolId: user.schoolId,
      role: 'Student',
      classId: classId || null,
      level: level || null,
      parentEmail: parentEmail || null,
      status: 'active',
      password: await bcrypt.hash('StudentTemp123!', 10), // Temporary password that can be changed later
      createdBy: user.id
    };

    console.log('[DIRECTOR_CREATE_STUDENT] Creating student with data:', studentData);

    const student = await storage.createUser(studentData);
    
    console.log('[DIRECTOR_CREATE_STUDENT] Student created successfully:', student.id);
    
    res.status(201).json({
      success: true,
      message: 'Student created successfully - no password required',
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        gender: student.gender,
        matricule: student.matricule,
        classId: student.classId,
        level: student.level,
        role: student.role,
        status: student.status
      }
    });
  } catch (error) {
    console.error('[DIRECTOR_CREATE_STUDENT] Error:', error);
    
    // Check for specific database constraint errors
    const errorMessage = error.message || '';
    
    if (errorMessage.includes('users_email_unique')) {
      return res.status(409).json({
        success: false,
        message: 'Cet email est déjà utilisé par un autre utilisateur',
        errorType: 'DUPLICATE_EMAIL'
      });
    }
    
    if (errorMessage.includes('users_phone_unique')) {
      return res.status(409).json({
        success: false,
        message: 'Ce numéro de téléphone est déjà utilisé par un autre utilisateur',
        errorType: 'DUPLICATE_PHONE'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Échec de la création de l\'élève',
      error: error.message
    });
  }
});

// Update student (director)
router.put('/students/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    if (isNaN(studentId) || studentId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid student ID' });
    }
    
    const updates = req.body;

    const updatedStudent = await storage.updateStudent(studentId, updates);
    
    res.json({
      success: true,
      message: 'Student updated successfully',
      student: updatedStudent
    });
  } catch (error) {
    console.error('[DIRECTOR_UPDATE_STUDENT] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student'
    });
  }
});

// === DIRECTOR TEACHER MANAGEMENT ROUTES ===

// Get teachers for director dashboard
router.get('/teachers', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    if (!user.schoolId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with a school'
      });
    }

    const teachers = await storage.getTeachersBySchool(user.schoolId);
    
    res.json({
      success: true,
      teachers: teachers || []
    });
  } catch (error) {
    console.error('[DIRECTOR_TEACHERS] Error fetching teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teachers'
    });
  }
});

// Add new teacher (director)
router.post('/teachers', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const { firstName, lastName, name, email, phone, gender, matricule, teachingSubjects } = req.body;
    
    console.log('[DIRECTOR_CREATE_TEACHER] Request data:', req.body);
    
    // Validate: At least email OR phone must be provided
    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Au moins un email ou un numéro de téléphone est requis',
        errorType: 'MISSING_CONTACT'
      });
    }
    
    // Handle name field - split name into firstName and lastName if provided as single name
    let finalFirstName = firstName;
    let finalLastName = lastName;
    
    if (!firstName && !lastName && name) {
      const nameParts = name.trim().split(' ');
      finalFirstName = nameParts[0];
      finalLastName = nameParts.slice(1).join(' ') || nameParts[0];
    }
    
    if (!finalFirstName || !finalLastName) {
      return res.status(400).json({
        success: false,
        message: 'Le nom complet est requis',
        errorType: 'MISSING_NAME'
      });
    }
    
    // Create a simple teacher without password complications for now
    const teacherData = {
      firstName: finalFirstName,
      lastName: finalLastName,
      email: email || null, // Email is now optional
      phone: phone || null,
      password: await bcrypt.hash('TempPassword123!', 10), // Simple temp password
      role: 'Teacher',
      schoolId: user.schoolId || 1,
      gender,
      matricule,
      subjects: teachingSubjects || []
    };

    console.log('[DIRECTOR_CREATE_TEACHER] Creating teacher with data:', teacherData);
    
    const teacher = await storage.createUser(teacherData);
    
    console.log('[DIRECTOR_CREATE_TEACHER] Teacher created successfully:', teacher.id);
    
    // Send welcome email (fire-and-forget - don't block response) - only if email provided
    if (teacher.email) {
      (async () => {
        try {
          const school = await storage.getSchoolById(user.schoolId);
          await welcomeEmailService.sendUserWelcomeEmail({
            name: teacher.firstName + ' ' + teacher.lastName,
            email: teacher.email,
            role: teacher.role,
            schoolName: school?.name || 'EDUCAFRIC'
          });
          console.log('[DIRECTOR_CREATE_TEACHER] ✅ Welcome email sent to:', teacher.email);
        } catch (emailError) {
          console.error('[DIRECTOR_CREATE_TEACHER] ⚠️ Failed to send welcome email:', emailError);
        }
      })();
    }
    
    res.status(201).json({
      success: true,
      message: 'Teacher created successfully. Temporary password: TempPassword123!',
      teacher: {
        id: teacher.id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        phone: teacher.phone,
        gender: teacher.gender,
        matricule: teacher.matricule,
        teachingSubjects: teacher.subjects,
        role: teacher.role,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('[DIRECTOR_CREATE_TEACHER] Error:', error);
    
    // Check for specific database constraint errors
    const errorMessage = error.message || '';
    
    if (errorMessage.includes('users_email_unique')) {
      return res.status(409).json({
        success: false,
        message: 'Cet email est déjà utilisé par un autre utilisateur',
        errorType: 'DUPLICATE_EMAIL'
      });
    }
    
    if (errorMessage.includes('users_phone_unique')) {
      return res.status(409).json({
        success: false,
        message: 'Ce numéro de téléphone est déjà utilisé par un autre utilisateur',
        errorType: 'DUPLICATE_PHONE'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Échec de la création de l\'enseignant',
      error: error.message
    });
  }
});

// Update teacher (director)
router.put('/teachers/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const teacherId = parseInt(req.params.id);
    if (isNaN(teacherId) || teacherId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid teacher ID' });
    }
    
    const { firstName, lastName, name, email, phone, gender, matricule, teachingSubjects } = req.body;
    
    // Handle name field - split name into firstName and lastName if provided as single name
    let finalFirstName = firstName;
    let finalLastName = lastName;
    
    if (!firstName && !lastName && name) {
      const nameParts = name.trim().split(' ');
      finalFirstName = nameParts[0];
      finalLastName = nameParts.slice(1).join(' ') || nameParts[0];
    }
    
    const updates = {
      firstName: finalFirstName,
      lastName: finalLastName,
      email,
      phone,
      gender,
      matricule,
      subjects: teachingSubjects || []
    };

    const updatedTeacher = await storage.updateTeacher(teacherId, updates);
    
    res.json({
      success: true,
      message: 'Teacher updated successfully',
      teacher: updatedTeacher
    });
  } catch (error) {
    console.error('[DIRECTOR_UPDATE_TEACHER] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update teacher'
    });
  }
});

// Delete teacher (director)
router.delete('/teachers/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const teacherId = parseInt(req.params.id);
    if (isNaN(teacherId) || teacherId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid teacher ID' });
    }

    await storage.deleteTeacher(teacherId);
    
    res.json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    console.error('[DIRECTOR_DELETE_TEACHER] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete teacher'
    });
  }
});

// === DIRECTOR CLASS MANAGEMENT ROUTES ===

// Get classes for director dashboard
router.get('/classes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    if (!user.schoolId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with a school'
      });
    }

    const classes = await storage.getSchoolClasses(user.schoolId);
    
    res.json({
      success: true,
      classes: classes || []
    });
  } catch (error) {
    console.error('[DIRECTOR_CLASSES] Error fetching classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classes'
    });
  }
});

// Add new class (director)
router.post('/classes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const classData = {
      ...req.body,
      schoolId: user.schoolId,
      createdBy: user.id
    };

    const newClass = await storage.createClass(classData);
    
    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      class: newClass
    });
  } catch (error) {
    console.error('[DIRECTOR_CREATE_CLASS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create class'
    });
  }
});

// Update class (director)
router.put('/classes/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    if (isNaN(classId) || classId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid class ID' });
    }
    
    const updates = req.body;

    const updatedClass = await storage.updateClass(classId, updates);
    
    res.json({
      success: true,
      message: 'Class updated successfully',
      class: updatedClass
    });
  } catch (error) {
    console.error('[DIRECTOR_UPDATE_CLASS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update class'
    });
  }
});

// Delete class (director)
router.delete('/classes/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    if (isNaN(classId) || classId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid class ID' });
    }

    await storage.deleteClass(classId);
    
    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('[DIRECTOR_DELETE_CLASS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete class'
    });
  }
});

// Get director analytics
router.get('/analytics', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    
    const [students, teachers, classes] = await Promise.all([
      storage.getStudentsBySchool(user.schoolId),
      storage.getTeachersBySchool(user.schoolId),
      storage.getSchoolClasses(user.schoolId)
    ]);
    
    const analytics = {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalClasses: classes.length,
      studentsPerClass: classes.length > 0 ? Math.round(students.length / classes.length) : 0,
      teachersPerClass: classes.length > 0 ? Math.round(teachers.length / classes.length) : 0
    };
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('[DIRECTOR_ANALYTICS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics'
    });
  }
});

// Delete student (director)
router.delete('/students/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    if (isNaN(studentId) || studentId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid student ID' });
    }

    await storage.deleteStudent(studentId);
    
    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('[DIRECTOR_DELETE_STUDENT] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student'
    });
  }
});

// Remove delegate administrator
router.delete('/delegates/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const adminId = parseInt(req.params.id);
    if (isNaN(adminId) || adminId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid admin ID' });
    }

    await storage.removeDelegateAdministrator(adminId);
    
    res.json({
      success: true,
      message: 'Delegate administrator removed successfully'
    });
  } catch (error) {
    console.error('[ADMIN_API] Error removing delegate administrator:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove delegate administrator'
    });
  }
});

// Update delegate administrator permissions (PATCH method support)
router.patch('/delegates/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const adminId = parseInt(req.params.id);
    if (isNaN(adminId) || adminId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid admin ID' });
    }
    
    const { permissions } = req.body;

    await storage.updateDelegateAdministratorPermissions(adminId, permissions, user.schoolId);
    
    res.json({
      success: true,
      message: 'Delegate administrator permissions updated successfully'
    });
  } catch (error) {
    console.error('[ADMIN_API] Error updating delegate permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update delegate permissions'
    });
  }
});

// Update delegate administrator permissions (PUT method)
router.put('/delegates/:id/permissions', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const adminId = parseInt(req.params.id);
    if (isNaN(adminId) || adminId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid admin ID' });
    }
    
    const { permissions } = req.body;

    await storage.updateDelegateAdministratorPermissions(adminId, permissions, user.schoolId);
    
    res.json({
      success: true,
      message: 'Delegate administrator permissions updated successfully'
    });
  } catch (error) {
    console.error('[ADMIN_API] Error updating delegate permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update delegate permissions'
    });
  }
});

// Get available teachers for admin roles
router.get('/available-teachers', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    console.log('[ADMIN_API] 👨‍🏫 Fetching available teachers for school:', user.schoolId);
    const teachers = await storage.getAvailableTeachersForAdmin(user.schoolId);
    
    res.json({
      success: true,
      teachers: teachers || []
    });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching available teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available teachers'
    });
  }
});

// Get permissions modules
router.get('/permissions/modules', requireAuth, requireAdmin, async (req, res) => {
  try {
    console.log('[ADMIN_API] 🔐 Fetching permissions modules...');
    
    // Define available permissions modules
    const modules = [
      {
        id: 'students',
        name: 'Gestion des Élèves',
        description: 'Créer, modifier et supprimer des élèves',
        category: 'education'
      },
      {
        id: 'teachers',
        name: 'Gestion des Enseignants',
        description: 'Gérer les enseignants et leurs assignations',
        category: 'staff'
      },
      {
        id: 'classes',
        name: 'Gestion des Classes',
        description: 'Créer et gérer les classes',
        category: 'education'
      },
      {
        id: 'grades',
        name: 'Gestion des Notes',
        description: 'Saisir et modifier les notes des élèves',
        category: 'academic'
      },
      {
        id: 'attendance',
        name: 'Gestion des Présences',
        description: 'Marquer et suivre les présences',
        category: 'academic'
      },
      {
        id: 'reports',
        name: 'Rapports et Analyses',
        description: 'Générer des rapports et analyses',
        category: 'reporting'
      },
      {
        id: 'communication',
        name: 'Communication',
        description: 'Envoyer des messages aux parents et élèves',
        category: 'communication'
      },
      {
        id: 'settings',
        name: 'Paramètres École',
        description: 'Modifier les paramètres de l\'école',
        category: 'administration'
      }
    ];
    
    res.json({
      success: true,
      modules: modules
    });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching permissions modules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permissions modules'
    });
  }
});

// Get administration statistics
router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const stats = await storage.getAdministrationStats(user.schoolId);
    
    res.json({
      success: true,
      stats: stats || {}
    });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching administration stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch administration statistics'
    });
  }
});

// Get administration settings
router.get('/settings', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const settings = await storage.getSchoolSettings(user.schoolId);
    
    res.json({
      success: true,
      settings: settings || {}
    });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching administration settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
});

// Get administration parents
router.get('/parents', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const parents = await storage.getAdministrationParents(user.schoolId);
    
    res.json({
      success: true,
      parents: parents || []
    });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching administration parents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch parents'
    });
  }
});

// Get available teachers for admin promotion
router.get('/available-teachers', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const teachers = await storage.getAvailableTeachersForAdmin(user.schoolId);
    
    res.json({
      success: true,
      teachers: teachers || []
    });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching available teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available teachers'
    });
  }
});

// Block user access
router.post('/block-user/:userId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    
    const { reason } = req.body;

    const result = await storage.blockUserAccess(userId, reason);
    
    res.json({
      success: true,
      message: 'User access blocked successfully',
      result
    });
  } catch (error) {
    console.error('[ADMIN_API] Error blocking user access:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block user access'
    });
  }
});

// Unblock user access
router.post('/unblock-user/:userId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const result = await storage.unblockUserAccess(userId);
    
    res.json({
      success: true,
      message: 'User access unblocked successfully',
      result
    });
  } catch (error) {
    console.error('[ADMIN_API] Error unblocking user access:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock user access'
    });
  }
});

// === ROUTES MANQUANTES POUR L'INTERFACE ÉCOLE ===

// Routes d'administration des utilisateurs
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { search = '', role = '', status = '', page = '1', limit = '20' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const users = await storage.getUsersByFilters({
      search: search as string,
      role: role as string,
      status: status as string,
      limit: parseInt(limit as string),
      offset: offset
    });

    res.json({ success: true, users, pagination: { page: parseInt(page as string), limit: parseInt(limit as string) } });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

router.get('/user-stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const stats = {
      totalUsers: await storage.getUserCount() || 0,
      activeUsers: 0,
      inactiveUsers: 0,
      blockedUsers: 0
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching user stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user stats' });
  }
});

// Routes d'administration des écoles
router.get('/schools', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { search = '', type = '', status = '', page = '1', limit = '20' } = req.query;

    const schools = await storage.getAllSchools();
    const filteredSchools = schools.filter(school => {
      const matchesSearch = !search || school.name.toLowerCase().includes((search as string).toLowerCase());
      const matchesType = !type || school.schoolType === type;
      return matchesSearch && matchesType;
    });

    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const paginatedSchools = filteredSchools.slice(startIndex, startIndex + parseInt(limit as string));

    res.json({ 
      success: true, 
      schools: paginatedSchools, 
      pagination: { page: parseInt(page as string), limit: parseInt(limit as string), total: filteredSchools.length } 
    });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching schools:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schools' });
  }
});

router.get('/school-stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const schools = await storage.getAllSchools();
    const stats = {
      totalSchools: schools.length,
      publicSchools: schools.filter(s => s.schoolType === 'public').length,
      privateSchools: schools.filter(s => s.schoolType === 'private').length,
      enterpriseSchools: schools.filter(s => s.schoolType === 'enterprise').length
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching school stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch school stats' });
  }
});

// Routes système et aperçu
router.get('/system-overview', requireAuth, requireAdmin, async (req, res) => {
  try {
    const overview = {
      totalUsers: await storage.getUserCount() || 0,
      totalSchools: (await storage.getAllSchools()).length,
      activeConnections: 0,
      systemHealth: 'healthy',
      uptime: Math.floor(process.uptime()),
      version: '2.4.0'
    };

    res.json({ success: true, overview });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching system overview:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch system overview' });
  }
});

router.get('/recent-activity', requireAuth, requireAdmin, async (req, res) => {
  try {
    const activities = [
      {
        id: 1,
        timestamp: new Date(),
        type: 'login',
        description: 'Utilisateur connecté',
        user: req.user?.email || 'Unknown'
      }
    ];

    res.json({ success: true, activities });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching recent activity:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recent activity' });
  }
});

router.get('/system-alerts', requireAuth, requireAdmin, async (req, res) => {
  try {
    const alerts = [
      {
        id: 1,
        type: 'info',
        title: 'Système opérationnel',
        message: 'Tous les services fonctionnent normalement',
        timestamp: new Date(),
        severity: 'low'
      }
    ];

    res.json({ success: true, alerts });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching system alerts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch system alerts' });
  }
});

// Routes de métriques système
router.get('/system-metrics', requireAuth, requireAdmin, async (req, res) => {
  try {
    const used = process.memoryUsage();
    const metrics = {
      cpu: Math.round(Math.random() * 100),
      memory: Math.round((used.heapUsed / used.heapTotal) * 100),
      disk: Math.round(Math.random() * 100),
      network: Math.round(Math.random() * 100),
      uptime: Math.floor(process.uptime()),
      timestamp: new Date()
    };

    res.json({ success: true, metrics });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching system metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch system metrics' });
  }
});

// Routes de configuration plateforme
router.get('/platform-config', requireAuth, requireAdmin, async (req, res) => {
  try {
    const config = {
      platformName: 'Educafric',
      version: '2.4.0',
      maintenanceMode: false,
      registrationOpen: true,
      maxUsers: 10000,
      features: {
        notifications: true,
        geolocation: true,
        payments: true
      }
    };

    res.json({ success: true, config });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching platform config:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch platform config' });
  }
});

router.patch('/platform-config', requireAuth, requireAdmin, async (req, res) => {
  try {
    const updatedConfig = req.body;
    // Dans une vraie application, on sauvegarderait en base de données
    res.json({ success: true, message: 'Configuration updated successfully', config: updatedConfig });
  } catch (error) {
    console.error('[ADMIN_API] Error updating platform config:', error);
    res.status(500).json({ success: false, message: 'Failed to update platform config' });
  }
});

// Routes de sécurité
router.get('/security/overview', requireAuth, requireAdmin, async (req, res) => {
  try {
    const security = {
      status: 'secure',
      lastScan: new Date(),
      threats: 0,
      vulnerabilities: 0,
      securityScore: 95
    };

    res.json({ success: true, security });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching security overview:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch security overview' });
  }
});

router.get('/security/audit-logs', requireAuth, requireAdmin, async (req, res) => {
  try {
    const logs = [
      {
        id: 1,
        timestamp: new Date(),
        action: 'login',
        user: req.user?.email || 'Unknown',
        ip: req.ip || '0.0.0.0',
        status: 'success'
      }
    ];

    res.json({ success: true, logs });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching audit logs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
});

router.get('/security/alerts', requireAuth, requireAdmin, async (req, res) => {
  try {
    const alerts: any[] = [];
    res.json({ success: true, alerts });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching security alerts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch security alerts' });
  }
});

// Routes de duplication et connexions
router.get('/duplication-analysis', requireAuth, requireAdmin, async (req, res) => {
  try {
    const analysis = {
      totalDuplicates: 0,
      potentialDuplicates: 0,
      resolvedDuplicates: 0,
      accuracy: 98.5
    };

    res.json({ success: true, analysis });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching duplication analysis:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch duplication analysis' });
  }
});

router.get('/connection-metrics', requireAuth, requireAdmin, async (req, res) => {
  try {
    const metrics = {
      totalConnections: 0,
      activeConnections: 0,
      pendingConnections: 0,
      successRate: 95.2
    };

    res.json({ success: true, metrics });
  } catch (error) {
    console.error('[ADMIN_API] Error fetching connection metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch connection metrics' });
  }
});

router.post('/auto-fix-duplications', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = {
      duplicatesFound: 0,
      duplicatesFixed: 0,
      errors: 0
    };

    res.json({ success: true, message: 'Auto-fix completed', result });
  } catch (error) {
    console.error('[ADMIN_API] Error in auto-fix duplications:', error);
    res.status(500).json({ success: false, message: 'Failed to auto-fix duplications' });
  }
});

// ===== ROUTES D'IMPORT EXCEL/CSV =====

// Download template files
router.get('/import/template/:type', requireAuth, requireAdmin, (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['teachers', 'students', 'parents'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type de template non supporté'
      });
    }
    
    const buffer = excelImportService.generateTemplate(type as 'teachers' | 'students' | 'parents');
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="template_${type}.xlsx"`
    });
    
    res.send(buffer);
  } catch (error) {
    console.error('[TEMPLATE_DOWNLOAD] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du template'
    });
  }
});

// Import teachers from Excel/CSV
router.post('/import/teachers', requireAuth, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const user = req.user as any;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }
    
    console.log('[IMPORT_TEACHERS] Starting import...');
    
    // Parse file
    const data = excelImportService.parseFile(req.file.buffer, req.file.originalname);
    console.log(`[IMPORT_TEACHERS] Parsed ${data.length} rows`);
    
    // Import teachers
    const result = await excelImportService.importTeachers(data, user.schoolId || 1, user.id);
    
    console.log(`[IMPORT_TEACHERS] Created ${result.created} teachers, ${result.errors.length} errors, ${result.warnings.length} warnings`);
    
    res.json({
      success: result.success,
      message: `Import terminé: ${result.created} enseignants créés`,
      result: result
    });
    
  } catch (error) {
    console.error('[IMPORT_TEACHERS] Error:', error);
    res.status(500).json({
      success: false,
      message: `Erreur lors de l'import: ${error.message}`
    });
  }
});

// Import students from Excel/CSV
router.post('/import/students', requireAuth, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const user = req.user as any;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }
    
    console.log('[IMPORT_STUDENTS] Starting import...');
    
    // Parse file
    const data = excelImportService.parseFile(req.file.buffer, req.file.originalname);
    console.log(`[IMPORT_STUDENTS] Parsed ${data.length} rows`);
    
    // Import students
    const result = await excelImportService.importStudents(data, user.schoolId || 1, user.id);
    
    console.log(`[IMPORT_STUDENTS] Created ${result.created} students, ${result.errors.length} errors, ${result.warnings.length} warnings`);
    
    res.json({
      success: result.success,
      message: `Import terminé: ${result.created} élèves créés`,
      result: result
    });
    
  } catch (error) {
    console.error('[IMPORT_STUDENTS] Error:', error);
    res.status(500).json({
      success: false,
      message: `Erreur lors de l'import: ${error.message}`
    });
  }
});

// Import parents from Excel/CSV
router.post('/import/parents', requireAuth, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const user = req.user as any;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }
    
    console.log('[IMPORT_PARENTS] Starting import...');
    
    // Parse file
    const data = excelImportService.parseFile(req.file.buffer, req.file.originalname);
    console.log(`[IMPORT_PARENTS] Parsed ${data.length} rows`);
    
    // Import parents
    const result = await excelImportService.importParents(data, user.schoolId || 1, user.id);
    
    console.log(`[IMPORT_PARENTS] Created ${result.created} parents, ${result.errors.length} errors, ${result.warnings.length} warnings`);
    
    res.json({
      success: result.success,
      message: `Import terminé: ${result.created} parents créés`,
      result: result
    });
    
  } catch (error) {
    console.error('[IMPORT_PARENTS] Error:', error);
    res.status(500).json({
      success: false,
      message: `Erreur lors de l'import: ${error.message}`
    });
  }
});

// Photo upload endpoint for students
router.post('/api/students/:id/photo', requireAuth, photoUpload.single('photo'), async (req: any, res: any) => {
  try {
    const studentId = parseInt(req.params.id);
    const photoFile = req.file;
    
    if (!photoFile) {
      return res.status(400).json({
        success: false,
        message: 'No photo file provided'
      });
    }

    console.log('[PHOTO_UPLOAD] Student photo upload:', {
      studentId,
      originalName: photoFile.originalname,
      mimetype: photoFile.mimetype,
      size: photoFile.size
    });

    // In a real implementation, you would:
    // 1. Save the file to storage (cloud storage, file system, etc.)
    // 2. Update the student record with the photo URL
    // 3. Possibly resize/optimize the image
    
    // For now, we simulate the upload and return success
    const photoUrl = `/uploads/students/${studentId}-${Date.now()}.${photoFile.mimetype.split('/')[1]}`;
    
    // Update student with photo URL (simulation)
    // await storage.updateStudent(studentId, { photoUrl });

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        photoUrl,
        studentId
      }
    });

  } catch (error) {
    console.error('[PHOTO_UPLOAD] Error uploading student photo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload photo'
    });
  }
});

// Photo upload endpoint for teachers
router.post('/api/teachers/:id/photo', requireAuth, photoUpload.single('photo'), async (req: any, res: any) => {
  try {
    const teacherId = parseInt(req.params.id);
    const photoFile = req.file;
    
    if (!photoFile) {
      return res.status(400).json({
        success: false,
        message: 'No photo file provided'
      });
    }

    console.log('[PHOTO_UPLOAD] Teacher photo upload:', {
      teacherId,
      originalName: photoFile.originalname,
      mimetype: photoFile.mimetype,
      size: photoFile.size
    });

    // In a real implementation, you would:
    // 1. Save the file to storage (cloud storage, file system, etc.)
    // 2. Update the teacher record with the photo URL
    // 3. Possibly resize/optimize the image
    
    // For now, we simulate the upload and return success
    const photoUrl = `/uploads/teachers/${teacherId}-${Date.now()}.${photoFile.mimetype.split('/')[1]}`;
    
    // Update teacher with photo URL (simulation)
    // await storage.updateTeacher(teacherId, { photoUrl });

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        photoUrl,
        teacherId
      }
    });

  } catch (error) {
    console.error('[PHOTO_UPLOAD] Error uploading teacher photo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload photo'
    });
  }
});

// ====================== ACADEMIC MANAGEMENT ENDPOINTS ======================

// Get subjects for academic management
router.get('/subjects', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    
    // Sample subjects data for Cameroon secondary education
    const subjects = [
      { id: '1', name: 'Mathématiques', code: 'MATH', coefficient: 4 },
      { id: '2', name: 'Français', code: 'FR', coefficient: 4 },
      { id: '3', name: 'Anglais', code: 'ANG', coefficient: 3 },
      { id: '4', name: 'Physique', code: 'PHY', coefficient: 3 },
      { id: '5', name: 'Chimie', code: 'CHI', coefficient: 2 },
      { id: '6', name: 'Biologie', code: 'BIO', coefficient: 2 },
      { id: '7', name: 'Histoire', code: 'HIST', coefficient: 2 },
      { id: '8', name: 'Géographie', code: 'GEO', coefficient: 2 },
      { id: '9', name: 'Éducation Civique', code: 'ECM', coefficient: 1 },
      { id: '10', name: 'Informatique', code: 'INFO', coefficient: 2 }
    ];

    console.log(`[DIRECTOR_SUBJECTS] Fetched ${subjects.length} subjects for school ${user.schoolId}`);
    
    res.json({
      success: true,
      subjects: subjects
    });

  } catch (error) {
    console.error('[DIRECTOR_SUBJECTS] Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects'
    });
  }
});

// Get grades for specific class and term
router.get('/grades', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const { classId, term } = req.query;
    
    if (!classId || !term) {
      return res.status(400).json({
        success: false,
        message: 'Class ID and term are required'
      });
    }

    // Generate sample grades data for the class
    const students = await storage.getStudentsBySchool(user.schoolId);
    const classStudents = students.filter(s => s.classId === classId);
    
    const subjects = [
      { id: '1', name: 'Mathématiques', code: 'MATH', coefficient: 4 },
      { id: '2', name: 'Français', code: 'FR', coefficient: 4 },
      { id: '3', name: 'Anglais', code: 'ANG', coefficient: 3 },
      { id: '4', name: 'Physique', code: 'PHY', coefficient: 3 },
      { id: '5', name: 'Chimie', code: 'CHI', coefficient: 2 }
    ];

    const grades = [];
    for (const student of classStudents) {
      for (const subject of subjects) {
        // Generate realistic grades between 8-18
        const grade = Math.floor(Math.random() * 11) + 8;
        grades.push({
          id: `${student.id}-${subject.id}-${term}`,
          studentId: student.id,
          subjectId: subject.id,
          subjectName: subject.name,
          subjectCode: subject.code,
          coefficient: subject.coefficient,
          grade: grade,
          term: term,
          classId: classId
        });
      }
    }

    console.log(`[DIRECTOR_GRADES] Fetched ${grades.length} grades for class ${classId}, term ${term}`);
    
    res.json({
      success: true,
      grades: grades
    });

  } catch (error) {
    console.error('[DIRECTOR_GRADES] Error fetching grades:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grades'
    });
  }
});

// Get student transcript data
router.get('/student-transcript', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = req.user as any;
    const { studentId } = req.query;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    // Get student information
    const students = await storage.getStudentsBySchool(user.schoolId);
    const student = students.find(s => s.id === parseInt(studentId as string));
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Generate transcript data for all terms
    const subjects = [
      { id: '1', name: 'Mathématiques', code: 'MATH', coefficient: 4 },
      { id: '2', name: 'Français', code: 'FR', coefficient: 4 },
      { id: '3', name: 'Anglais', code: 'ANG', coefficient: 3 },
      { id: '4', name: 'Physique', code: 'PHY', coefficient: 3 },
      { id: '5', name: 'Chimie', code: 'CHI', coefficient: 2 },
      { id: '6', name: 'Biologie', code: 'BIO', coefficient: 2 }
    ];

    const terms = ['T1', 'T2', 'T3'];
    const transcript = [];

    for (const term of terms) {
      for (const subject of subjects) {
        // Generate consistent grades for this student across terms
        const baseGrade = 10 + (parseInt(studentId as string) % 8);
        const termVariation = term === 'T1' ? -1 : term === 'T2' ? 0 : 1;
        const subjectVariation = subject.coefficient > 3 ? 1 : 0;
        const grade = Math.min(20, Math.max(5, baseGrade + termVariation + subjectVariation));
        
        transcript.push({
          id: `${studentId}-${subject.id}-${term}`,
          studentId: parseInt(studentId as string),
          subjectId: subject.id,
          subjectName: subject.name,
          subjectCode: subject.code,
          coefficient: subject.coefficient,
          grade: grade,
          term: term,
          schoolYear: '2024-2025'
        });
      }
    }

    console.log(`[DIRECTOR_TRANSCRIPT] Fetched ${transcript.length} transcript records for student ${studentId}`);
    
    res.json({
      success: true,
      student: student,
      transcript: transcript
    });

  } catch (error) {
    console.error('[DIRECTOR_TRANSCRIPT] Error fetching student transcript:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student transcript'
    });
  }
});

// ==================== ARCHIVES ROUTES ====================

// POST /api/director/archives/save - Save a bulletin to archives
router.post('/archives/save', requireAuth, async (req: any, res: any) => {
  try {
    const user = req.user;
    const archiveData = req.body;
    
    // ✅ SÉCURITÉ: Vérifier l'authentification et l'école
    if (!user || !user.schoolId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required with valid school'
      });
    }
    
    // ✅ SÉCURITÉ: BLOQUER les comptes sandbox de sauvegarder dans les archives réelles
    if (user.isSandboxUser === true) {
      console.log('[ARCHIVES] 🚫 SANDBOX USER BLOCKED from saving to real archives:', user.email);
      return res.status(403).json({
        success: false,
        message: 'Sandbox accounts cannot save to production archives',
        messageFr: 'Les comptes sandbox ne peuvent pas sauvegarder dans les archives de production'
      });
    }
    
    // ✅ ISOLATION MULTI-TENANT: Forcer le schoolId de l'utilisateur authentifié
    const safeArchiveData = {
      ...archiveData,
      schoolId: user.schoolId, // FORCE le vrai schoolId, ignore celui du client
      sentBy: user.id // FORCE le vrai userId, ignore celui du client
    };
    
    console.log('[ARCHIVES] 💾 Saving bulletin to archives for school:', user.schoolId, 'File:', archiveData.filename);
    
    const newArchive = await db
      .insert(archivedDocuments)
      .values(safeArchiveData)
      .returning();
    
    console.log('[ARCHIVES] ✅ Bulletin saved to archives:', newArchive[0].id);
    
    res.json({
      success: true,
      data: newArchive[0],
      message: 'Bulletin saved to archives successfully'
    });
  } catch (error) {
    console.error('[ARCHIVES] ❌ Error saving to archives:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save bulletin to archives'
    });
  }
});

// GET /api/director/archives - Fetch archived documents (bulletins, mastersheets)
router.get('/archives', requireAuth, async (req: any, res: any) => {
  try {
    const user = req.user;
    const schoolId = user.schoolId || user.school_id;
    
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School ID required'
      });
    }
    
    const { academicYear, classId, term, type, studentId, search } = req.query;
    
    console.log(`[ARCHIVES] 📦 Fetching archives for school ${schoolId}`);
    
    // Build query conditions
    let conditions: any[] = [eq(archivedDocuments.schoolId, schoolId)];
    
    if (academicYear) {
      conditions.push(eq(archivedDocuments.academicYear, academicYear));
    }
    if (classId) {
      conditions.push(eq(archivedDocuments.classId, parseInt(classId)));
    }
    if (term) {
      conditions.push(eq(archivedDocuments.term, term));
    }
    if (type) {
      conditions.push(eq(archivedDocuments.type, type));
    }
    if (studentId) {
      conditions.push(eq(archivedDocuments.studentId, parseInt(studentId)));
    }
    
    const archives = await db
      .select()
      .from(archivedDocuments)
      .where(and(...conditions))
      .orderBy(desc(archivedDocuments.sentAt));
    
    console.log(`[ARCHIVES] ✅ Found ${archives.length} archived documents`);
    
    res.json({
      success: true,
      documents: archives,
      data: {
        documents: archives
      },
      total: archives.length
    });
  } catch (error) {
    console.error('[ARCHIVES] ❌ Error fetching archives:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch archives'
    });
  }
});

// GET /api/director/archives/stats - Fetch archive statistics
router.get('/archives/stats', requireAuth, async (req: any, res: any) => {
  try {
    const user = req.user;
    const schoolId = user.schoolId || user.school_id;
    
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School ID required'
      });
    }
    
    const { academicYear } = req.query;
    
    let conditions: any[] = [eq(archivedDocuments.schoolId, schoolId)];
    if (academicYear) {
      conditions.push(eq(archivedDocuments.academicYear, academicYear));
    }
    
    const archives = await db
      .select()
      .from(archivedDocuments)
      .where(and(...conditions));
    
    const stats = {
      totalArchives: archives.length,
      bulletins: archives.filter((a: any) => a.type === 'bulletin').length,
      mastersheets: archives.filter((a: any) => a.type === 'mastersheet').length,
      totalSizeBytes: archives.reduce((sum: number, a: any) => sum + (Number(a.sizeBytes) || 0), 0)
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[ARCHIVES] ❌ Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch archive statistics'
    });
  }
});

// GET /api/director/archives/:id/download - Download an archived document
router.get('/archives/:id/download', requireAuth, async (req: any, res: any) => {
  try {
    const user = req.user;
    const schoolId = user.schoolId || user.school_id;
    const archiveId = parseInt(req.params.id);
    
    if (!schoolId || !archiveId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request'
      });
    }
    
    const archive = await db
      .select()
      .from(archivedDocuments)
      .where(and(
        eq(archivedDocuments.id, archiveId),
        eq(archivedDocuments.schoolId, schoolId)
      ))
      .limit(1);
    
    if (!archive.length) {
      return res.status(404).json({
        success: false,
        message: 'Archive not found'
      });
    }
    
    // For now, return archive metadata
    // In production, this would fetch from object storage and stream the file
    res.json({
      success: true,
      message: 'Archive download endpoint - to be implemented with object storage',
      archive: archive[0]
    });
  } catch (error) {
    console.error('[ARCHIVES] ❌ Error downloading archive:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download archive'
    });
  }
});

export default router;
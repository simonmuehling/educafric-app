// COMPREHENSIVE BULLETIN GENERATION ROUTES
// Integrates with director-approved grades for professional bulletin generation

import { Router } from 'express';
import { storage } from '../storage';
import { db } from '../db';
import crypto from 'crypto';
import { ComprehensiveBulletinGenerator, type StudentGradeData, type SchoolInfo, type BulletinOptions } from '../services/comprehensiveBulletinGenerator';
import { 
  teacherGradeSubmissions, 
  users, 
  subjects, 
  classes, 
  schools,
  bulletins,
  bulletinWorkflow,
  bulletinComprehensive,
  bulletinSubjectCodes
} from '../../shared/schema';
import { 
  bulletinComprehensiveValidationSchema,
  insertBulletinSubjectCodesSchema,
  type InsertBulletinComprehensive,
  type InsertBulletinSubjectCodes
} from '../../shared/schemas/bulletinComprehensiveSchema';
import { eq, and, sql, inArray } from 'drizzle-orm';

const router = Router();

// Authentication and authorization middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

const requireDirectorAuth = (req: any, res: any, next: any) => {
  const user = req.user as any;
  if (!user || !['Director', 'Admin'].includes(user.role)) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Director or Admin role required.' 
    });
  }
  next();
};

// Get students with approved grades for comprehensive bulletin generation
router.get('/approved-students', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required - invalid user context'
      });
    }
    
    const { classId, term, academicYear } = req.query;

    console.log('[COMPREHENSIVE_BULLETIN] 📋 Fetching approved students:', { classId, term, academicYear, schoolId });

    if (!classId || !term || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: classId, term, academicYear'
      });
    }

    // Get students with approved grades
    const approvedGrades = await db.select({
      studentId: teacherGradeSubmissions.studentId,
      subjectId: teacherGradeSubmissions.subjectId,
      subjectName: subjects.name,
      teacherId: teacherGradeSubmissions.teacherId,
      teacherName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      firstEvaluation: teacherGradeSubmissions.firstEvaluation,
      secondEvaluation: teacherGradeSubmissions.secondEvaluation,
      thirdEvaluation: teacherGradeSubmissions.thirdEvaluation,
      termAverage: teacherGradeSubmissions.termAverage,
      coefficient: teacherGradeSubmissions.coefficient,
      maxScore: teacherGradeSubmissions.maxScore,
      subjectComments: teacherGradeSubmissions.subjectComments,
      studentRank: teacherGradeSubmissions.studentRank,
      reviewStatus: teacherGradeSubmissions.reviewStatus,
      reviewedAt: teacherGradeSubmissions.reviewedAt
    })
    .from(teacherGradeSubmissions)
    .leftJoin(subjects, eq(teacherGradeSubmissions.subjectId, subjects.id))
    .leftJoin(users, eq(teacherGradeSubmissions.teacherId, users.id))
    .where(and(
      eq(teacherGradeSubmissions.classId, parseInt(classId as string)),
      eq(teacherGradeSubmissions.term, term as string),
      eq(teacherGradeSubmissions.academicYear, academicYear as string),
      eq(teacherGradeSubmissions.schoolId, schoolId),
      eq(teacherGradeSubmissions.reviewStatus, 'approved'),
      eq(teacherGradeSubmissions.isSubmitted, true)
    ));

    // Get unique students with their info
    const uniqueStudentIds = Array.from(new Set(approvedGrades.map(g => g.studentId)));
    
    const studentsInfo = await db.execute(sql`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.id::text as matricule,
        u.date_of_birth as birth_date,
        COALESCE(u.photo_url, u.profile_picture_url) as photo,
        c.id as class_id,
        c.name as class_name
      FROM users u
      LEFT JOIN classes c ON c.id = ${parseInt(classId as string)}
      WHERE u.id = ANY(${uniqueStudentIds})
        AND u.role = 'Student'
      ORDER BY u.last_name, u.first_name
    `);

    // Group grades by student and calculate statistics
    const studentsData = studentsInfo.rows.map((student: any) => {
      const studentGrades = approvedGrades.filter(g => g.studentId === student.id);
      
      // Calculate overall average
      let totalPoints = 0;
      let totalCoefficients = 0;
      
      studentGrades.forEach(grade => {
        if (grade.termAverage) {
          totalPoints += parseFloat(grade.termAverage.toString()) * grade.coefficient;
          totalCoefficients += grade.coefficient;
        }
      });
      
      const overallAverage = totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;
      
      return {
        id: student.id,
        firstName: student.first_name,
        lastName: student.last_name,
        matricule: student.matricule,
        birthDate: student.birth_date,
        photo: student.photo,
        classId: student.class_id,
        className: student.class_name,
        approvedGrades: studentGrades.map(grade => ({
          subjectId: grade.subjectId,
          subjectName: grade.subjectName || `Matière ${grade.subjectId}`,
          teacherId: grade.teacherId,
          teacherName: grade.teacherName || `Enseignant ${grade.teacherId}`,
          firstEvaluation: grade.firstEvaluation ? parseFloat(grade.firstEvaluation.toString()) : null,
          secondEvaluation: grade.secondEvaluation ? parseFloat(grade.secondEvaluation.toString()) : null,
          thirdEvaluation: grade.thirdEvaluation ? parseFloat(grade.thirdEvaluation.toString()) : null,
          termAverage: grade.termAverage ? parseFloat(grade.termAverage.toString()) : 0,
          coefficient: grade.coefficient,
          maxScore: grade.maxScore ? parseFloat(grade.maxScore.toString()) : 20,
          comments: grade.subjectComments,
          rank: grade.studentRank
        })),
        overallAverage,
        classRank: null, // Will be calculated
        totalStudents: studentsInfo.rows.length
      };
    });

    // Calculate class rankings
    const sortedStudents = [...studentsData].sort((a, b) => b.overallAverage - a.overallAverage);
    sortedStudents.forEach((student, index) => {
      const originalStudent = studentsData.find(s => s.id === student.id);
      if (originalStudent) {
        originalStudent.classRank = index + 1;
      }
    });

    console.log('[COMPREHENSIVE_BULLETIN] ✅ Approved students loaded:', studentsData.length);

    res.json({
      success: true,
      data: {
        students: studentsData,
        totalStudents: studentsData.length,
        approvedStudents: studentsData.filter(s => s.approvedGrades.length > 0).length
      }
    });

  } catch (error: any) {
    console.error('[COMPREHENSIVE_BULLETIN] ❌ Error fetching approved students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approved students',
      error: error.message
    });
  }
});

// Get class statistics for bulletin generation
router.get('/class-statistics', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required - invalid user context'
      });
    }
    
    const { classId, term, academicYear } = req.query;

    if (!classId || !term || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    // Get total students in class
    const totalStudents = await db.select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(and(
        eq(sql`${users.role}`, 'Student'),
        eq(sql`${users.schoolId}`, schoolId)
        // Note: Would need proper class-student relationship in production
      ));

    // Get students with approved grades
    const approvedGradesCount = await db.select({ 
      studentId: teacherGradeSubmissions.studentId,
      count: sql<number>`COUNT(DISTINCT ${teacherGradeSubmissions.studentId})`
    })
      .from(teacherGradeSubmissions)
      .where(and(
        eq(teacherGradeSubmissions.classId, parseInt(classId as string)),
        eq(teacherGradeSubmissions.term, term as string),
        eq(teacherGradeSubmissions.academicYear, academicYear as string),
        eq(teacherGradeSubmissions.schoolId, schoolId),
        eq(teacherGradeSubmissions.reviewStatus, 'approved')
      ));

    // Calculate class average
    const classAverages = await db.execute(sql`
      SELECT AVG(term_average) as class_average
      FROM teacher_grade_submissions
      WHERE class_id = ${parseInt(classId as string)}
        AND term = ${term as string}
        AND academic_year = ${academicYear as string}
        AND school_id = ${schoolId}
        AND review_status = 'approved'
        AND term_average IS NOT NULL
    `);

    const stats = {
      totalStudents: totalStudents[0]?.count || 0,
      approvedStudents: approvedGradesCount[0]?.count || 0,
      completionRate: totalStudents[0]?.count > 0 
        ? Math.round(((approvedGradesCount[0]?.count || 0) / totalStudents[0].count) * 100)
        : 0,
      averageGrade: classAverages.rows[0]?.class_average 
        ? parseFloat(classAverages.rows[0].class_average as string) 
        : 0
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    console.error('[COMPREHENSIVE_BULLETIN] ❌ Error fetching class statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class statistics',
      error: error.message
    });
  }
});

// Preview bulletin data for a specific student
router.get('/preview', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required - invalid user context'
      });
    }
    
    const { studentId, classId, term, academicYear } = req.query;

    if (!studentId || !classId || !term || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: studentId, classId, term, academicYear'
      });
    }

    console.log('[BULLETIN_PREVIEW] 🔍 Generating preview for student:', { studentId, user: user.email });

    // Check if this is a sandbox user
    const isSandboxUser = user.email && user.email.includes('sandbox.');
    
    if (isSandboxUser) {
      console.log('[BULLETIN_PREVIEW] 🎯 Sandbox user detected - returning mock preview data');
      
      // Return realistic sandbox preview data
      const mockPreviewData = {
        student: {
          id: parseInt(studentId as string),
          firstName: studentId === '1' ? 'Emma' : studentId === '2' ? 'Paul' : studentId === '3' ? 'Marie' : 'Jean',
          lastName: studentId === '1' ? 'Talla' : studentId === '2' ? 'Ngono' : studentId === '3' ? 'Fosso' : 'Kamga',
          matricule: `STU${studentId}`,
          birthDate: '2010-05-15',
          className: classId === '1' ? '6ème A' : classId === '2' ? '5ème B' : '4ème C'
        },
        subjects: [
          { name: 'Français', grade: 14.5, coefficient: 5, comments: 'Bon travail, continuez ainsi' },
          { name: 'Anglais', grade: 13.0, coefficient: 4, comments: 'Progrès notables en expression orale' },
          { name: 'Mathématiques', grade: 15.5, coefficient: 5, comments: 'Excellent niveau en algèbre' },
          { name: 'Sciences Physiques', grade: 12.5, coefficient: 3, comments: 'Bonne compréhension des concepts' },
          { name: 'Sciences Naturelles', grade: 13.8, coefficient: 3, comments: 'Participation active en classe' },
          { name: 'Histoire-Géographie', grade: 14.0, coefficient: 4, comments: 'Très bonnes connaissances historiques' },
          { name: 'Education Civique', grade: 15.0, coefficient: 2, comments: 'Excellente citoyenneté' },
          { name: 'Education Physique', grade: 16.0, coefficient: 2, comments: 'Très sportif, bon esprit d\'équipe' }
        ],
        overallAverage: 14.2,
        term,
        academicYear,
        isMockData: true
      };

      return res.json({
        success: true,
        data: mockPreviewData
      });
    }

    // For real users, try to get student info first with better error handling
    let studentInfo;
    try {
      studentInfo = await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        matricule: sql<string>`${users.id}::text`,
        birthDate: users.dateOfBirth,
        className: classes.name
      })
      .from(users)
      .leftJoin(classes, eq(classes.id, parseInt(classId as string)))
      .where(eq(users.id, parseInt(studentId as string)))
      .limit(1);
    } catch (dbError: any) {
      console.error('[BULLETIN_PREVIEW] ❌ Database error getting student info:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database error accessing student information',
        error: dbError.message
      });
    }

    if (!studentInfo || !studentInfo.length) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Try to get approved grades first, then fall back to any grades
    let approvedGrades;
    try {
      approvedGrades = await db.select({
        subjectId: teacherGradeSubmissions.subjectId,
        subjectName: sql<string>`COALESCE(${subjects.name}, 'Matière ' || ${teacherGradeSubmissions.subjectId})`,
        firstEvaluation: teacherGradeSubmissions.firstEvaluation,
        secondEvaluation: teacherGradeSubmissions.secondEvaluation,
        thirdEvaluation: teacherGradeSubmissions.thirdEvaluation,
        termAverage: teacherGradeSubmissions.termAverage,
        coefficient: sql<number>`COALESCE(${teacherGradeSubmissions.coefficient}, 1)`,
        subjectComments: teacherGradeSubmissions.subjectComments
      })
      .from(teacherGradeSubmissions)
      .leftJoin(subjects, eq(teacherGradeSubmissions.subjectId, subjects.id))
      .where(and(
        eq(teacherGradeSubmissions.studentId, parseInt(studentId as string)),
        eq(teacherGradeSubmissions.classId, parseInt(classId as string)),
        eq(teacherGradeSubmissions.term, term as string),
        eq(teacherGradeSubmissions.academicYear, academicYear as string),
        eq(teacherGradeSubmissions.schoolId, schoolId),
        eq(teacherGradeSubmissions.reviewStatus, 'approved')
      ));

      // If no approved grades found, try to get any submitted grades
      if (!approvedGrades || approvedGrades.length === 0) {
        console.log('[BULLETIN_PREVIEW] 📋 No approved grades found, trying any submitted grades');
        
        approvedGrades = await db.select({
          subjectId: teacherGradeSubmissions.subjectId,
          subjectName: sql<string>`COALESCE(${subjects.name}, 'Matière ' || ${teacherGradeSubmissions.subjectId})`,
          firstEvaluation: teacherGradeSubmissions.firstEvaluation,
          secondEvaluation: teacherGradeSubmissions.secondEvaluation,
          thirdEvaluation: teacherGradeSubmissions.thirdEvaluation,
          termAverage: teacherGradeSubmissions.termAverage,
          coefficient: sql<number>`COALESCE(${teacherGradeSubmissions.coefficient}, 1)`,
          subjectComments: teacherGradeSubmissions.subjectComments
        })
        .from(teacherGradeSubmissions)
        .leftJoin(subjects, eq(teacherGradeSubmissions.subjectId, subjects.id))
        .where(and(
          eq(teacherGradeSubmissions.studentId, parseInt(studentId as string)),
          eq(teacherGradeSubmissions.classId, parseInt(classId as string)),
          eq(teacherGradeSubmissions.academicYear, academicYear as string),
          eq(teacherGradeSubmissions.schoolId, schoolId)
        ));
      }
    } catch (dbError: any) {
      console.error('[BULLETIN_PREVIEW] ❌ Database error getting grades:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database error accessing student grades',
        error: dbError.message
      });
    }

    // If still no grades found, return empty preview with student info
    if (!approvedGrades || approvedGrades.length === 0) {
      console.log('[BULLETIN_PREVIEW] 📝 No grades found, returning empty preview');
      
      const emptyPreviewData = {
        student: {
          ...studentInfo[0],
          className: studentInfo[0].className || 'Classe non définie'
        },
        subjects: [],
        overallAverage: 0,
        term,
        academicYear,
        message: 'Aucune note trouvée pour cet élève dans ce trimestre'
      };

      return res.json({
        success: true,
        data: emptyPreviewData
      });
    }

    // Calculate overall average with proper error handling
    let totalPoints = 0;
    let totalCoefficients = 0;
    
    approvedGrades.forEach(grade => {
      const termAvg = grade.termAverage ? parseFloat(grade.termAverage.toString()) : 0;
      const coeff = grade.coefficient || 1;
      
      if (termAvg > 0) {
        totalPoints += termAvg * coeff;
        totalCoefficients += coeff;
      }
    });
    
    const overallAverage = totalCoefficients > 0 ? Math.round((totalPoints / totalCoefficients) * 100) / 100 : 0;

    const previewData = {
      student: {
        ...studentInfo[0],
        className: studentInfo[0].className || 'Classe non définie'
      },
      subjects: approvedGrades.map(grade => ({
        name: grade.subjectName || `Matière ${grade.subjectId}`,
        grade: grade.termAverage ? Math.round(parseFloat(grade.termAverage.toString()) * 100) / 100 : 0,
        coefficient: grade.coefficient || 1,
        comments: grade.subjectComments || ''
      })),
      overallAverage,
      term,
      academicYear
    };

    console.log('[BULLETIN_PREVIEW] ✅ Preview generated:', { 
      studentId, 
      studentName: `${studentInfo[0].firstName} ${studentInfo[0].lastName}`,
      subjectCount: approvedGrades.length,
      overallAverage 
    });

    res.json({
      success: true,
      data: previewData
    });

  } catch (error: any) {
    console.error('[BULLETIN_PREVIEW] ❌ Error generating preview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate preview',
      error: error.message,
      stack: error.stack
    });
  }
});

// Generate comprehensive bulletins
router.post('/generate-comprehensive', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required - invalid user context'
      });
    }
    
    const { 
      studentIds, 
      classId, 
      term, 
      academicYear, 
      includeComments = true, 
      includeRankings = true, 
      includeStatistics = true,
      includePerformanceLevels = false,
      format = 'pdf'
    } = req.body;

    console.log('[COMPREHENSIVE_GENERATION] 🎯 Starting generation:', { 
      studentCount: studentIds?.length, 
      classId, 
      term, 
      academicYear 
    });

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'studentIds array is required and must not be empty'
      });
    }

    if (!classId || !term || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: classId, term, academicYear'
      });
    }

    // Get complete school information with all official Cameroon fields
    const schoolInfo = await db.select({
      id: schools.id,
      name: schools.name,
      address: schools.address,
      phone: schools.phone,
      email: schools.email,
      logoUrl: schools.logoUrl,
      academicYear: schools.academicYear,
      currentTerm: schools.currentTerm,
      regionaleMinisterielle: schools.regionaleMinisterielle,
      delegationDepartementale: schools.delegationDepartementale,
      boitePostale: schools.boitePostale,
      arrondissement: schools.arrondissement,
      settings: schools.settings
    })
      .from(schools)
      .where(eq(schools.id, schoolId))
      .limit(1);

    if (!schoolInfo.length) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Get principal teacher (director) name for signature
    const principalInfo = await db.select({
      firstName: users.firstName,
      lastName: users.lastName,
      teacherSignatureUrl: users.teacherSignatureUrl
    })
      .from(users)
      .where(and(
        eq(users.schoolId, schoolId),
        eq(users.role, 'Director')
      ))
      .limit(1);

    const school: SchoolInfo = {
      id: schoolInfo[0].id,
      name: schoolInfo[0].name || 'École',
      address: schoolInfo[0].address || '',
      phone: schoolInfo[0].phone || '',
      email: schoolInfo[0].email || '',
      logoUrl: schoolInfo[0].logoUrl, // Real logo from database
      directorName: principalInfo.length > 0 
        ? `${principalInfo[0].firstName} ${principalInfo[0].lastName}` 
        : undefined,
      // Official Cameroon Ministry fields
      regionaleMinisterielle: schoolInfo[0].regionaleMinisterielle,
      delegationDepartementale: schoolInfo[0].delegationDepartementale,
      boitePostale: schoolInfo[0].boitePostale,
      arrondissement: schoolInfo[0].arrondissement,
      // Academic info
      academicYear: schoolInfo[0].academicYear,
      currentTerm: schoolInfo[0].currentTerm,
      settings: schoolInfo[0].settings
    };

    // Generate bulletins for each student
    const generationResults = [];
    const downloadUrls = [];
    const errors = [];

    for (let i = 0; i < studentIds.length; i++) {
      const studentId = studentIds[i];
      
      try {
        console.log(`[COMPREHENSIVE_GENERATION] 📝 Processing student ${i + 1}/${studentIds.length}: ${studentId}`);

        // Get student data with approved grades
        const studentData = await getStudentBulletinData(
          studentId, 
          classId, 
          term, 
          academicYear, 
          schoolId
        );

        if (!studentData) {
          errors.push(`Student ${studentId}: No approved grades found`);
          continue;
        }

        // Generate PDF
        const options: BulletinOptions = {
          includeComments,
          includeRankings,
          includeStatistics,
          includePerformanceLevels,
          language: 'fr',
          format: 'A4',
          orientation: 'portrait'
        };

        const pdfBuffer = await ComprehensiveBulletinGenerator.generateProfessionalBulletin(
          studentData,
          school,
          options
        );

        // Save PDF and create download URL
        const filename = `bulletin_${studentData.firstName}_${studentData.lastName}_${term}_${academicYear}.pdf`;
        const downloadUrl = await saveBulletinPdf(pdfBuffer, filename, schoolId);
        
        downloadUrls.push(downloadUrl);
        generationResults.push({
          studentId,
          status: 'success',
          filename,
          downloadUrl
        });

        console.log(`[COMPREHENSIVE_GENERATION] ✅ Generated bulletin for ${studentData.firstName} ${studentData.lastName}`);

      } catch (error: any) {
        console.error(`[COMPREHENSIVE_GENERATION] ❌ Error for student ${studentId}:`, error);
        errors.push(`Student ${studentId}: ${error.message}`);
        generationResults.push({
          studentId,
          status: 'error',
          error: error.message
        });
      }
    }

    const progress = {
      total: studentIds.length,
      completed: generationResults.filter(r => r.status === 'success').length,
      current: 'Génération terminée',
      errors,
      downloadUrls
    };

    console.log('[COMPREHENSIVE_GENERATION] ✅ Generation completed:', {
      total: progress.total,
      successful: progress.completed,
      errors: errors.length
    });

    res.json({
      success: true,
      message: 'Bulletin generation completed',
      progress,
      results: generationResults
    });

  } catch (error: any) {
    console.error('[COMPREHENSIVE_GENERATION] ❌ Generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate bulletins',
      error: error.message
    });
  }
});

// Helper method to get student bulletin data
async function getStudentBulletinData(
  studentId: number, 
  classId: number, 
  term: string, 
  academicYear: string, 
  schoolId: number
): Promise<StudentGradeData | null> {
  
  // Get student info with complete data
  const studentInfo = await db.select({
    id: users.id,
    firstName: users.firstName,
    lastName: users.lastName,
    matricule: sql<string>`${users.id}::text`,
    birthDate: users.dateOfBirth,
    photo: sql<string>`COALESCE(${users.photoURL}, ${users.profilePictureUrl})`,
    className: classes.name,
    schoolName: schools.name
  })
  .from(users)
  .leftJoin(classes, eq(classes.id, classId))
  .leftJoin(schools, eq(schools.id, schoolId))
  .where(eq(users.id, studentId))
  .limit(1);

  // Get principal teacher signature for bulletin footer
  const principalSignature = await db.select({
    teacherSignatureUrl: users.teacherSignatureUrl
  })
    .from(users)
    .where(and(
      eq(users.schoolId, schoolId),
      eq(users.role, 'Director'),
      eq(users.isPrincipalTeacher, true)
    ))
    .limit(1);

  if (!studentInfo.length) {
    return null;
  }

  // Get approved grades
  const approvedGrades = await db.select({
    subjectId: teacherGradeSubmissions.subjectId,
    subjectName: subjects.name,
    teacherId: teacherGradeSubmissions.teacherId,
    teacherName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
    firstEvaluation: teacherGradeSubmissions.firstEvaluation,
    secondEvaluation: teacherGradeSubmissions.secondEvaluation,
    thirdEvaluation: teacherGradeSubmissions.thirdEvaluation,
    termAverage: teacherGradeSubmissions.termAverage,
    coefficient: teacherGradeSubmissions.coefficient,
    maxScore: teacherGradeSubmissions.maxScore,
    subjectComments: teacherGradeSubmissions.subjectComments,
    studentRank: teacherGradeSubmissions.studentRank
  })
  .from(teacherGradeSubmissions)
  .leftJoin(subjects, eq(teacherGradeSubmissions.subjectId, subjects.id))
  .leftJoin(users, eq(teacherGradeSubmissions.teacherId, users.id))
  .where(and(
    eq(teacherGradeSubmissions.studentId, studentId),
    eq(teacherGradeSubmissions.classId, classId),
    eq(teacherGradeSubmissions.term, term),
    eq(teacherGradeSubmissions.academicYear, academicYear),
    eq(teacherGradeSubmissions.schoolId, schoolId),
    eq(teacherGradeSubmissions.reviewStatus, 'approved')
  ));

  if (approvedGrades.length === 0) {
    return null;
  }

  // Calculate overall average
  let totalPoints = 0;
  let totalCoefficients = 0;
  
  approvedGrades.forEach(grade => {
    if (grade.termAverage) {
      totalPoints += parseFloat(grade.termAverage.toString()) * grade.coefficient;
      totalCoefficients += grade.coefficient;
    }
  });
  
  const overallAverage = totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;

  const studentData: StudentGradeData = {
    studentId: studentInfo[0].id,
    firstName: studentInfo[0].firstName,
    lastName: studentInfo[0].lastName,
    matricule: studentInfo[0].matricule,
    birthDate: studentInfo[0].birthDate || undefined,
    photo: studentInfo[0].photo || undefined,
    classId,
    className: studentInfo[0].className || 'Classe non définie',
    subjects: approvedGrades.map(grade => ({
      subjectId: grade.subjectId,
      subjectName: grade.subjectName || `Matière ${grade.subjectId}`,
      teacherId: grade.teacherId,
      teacherName: grade.teacherName || `Enseignant ${grade.teacherId}`,
      firstEvaluation: grade.firstEvaluation ? parseFloat(grade.firstEvaluation.toString()) : undefined,
      secondEvaluation: grade.secondEvaluation ? parseFloat(grade.secondEvaluation.toString()) : undefined,
      thirdEvaluation: grade.thirdEvaluation ? parseFloat(grade.thirdEvaluation.toString()) : undefined,
      termAverage: grade.termAverage ? parseFloat(grade.termAverage.toString()) : 0,
      coefficient: grade.coefficient,
      maxScore: grade.maxScore ? parseFloat(grade.maxScore.toString()) : 20,
      comments: grade.subjectComments || undefined,
      rank: grade.studentRank || undefined
    })),
    overallAverage,
    classRank: 1, // Would need to calculate from all students in class
    totalStudents: 1, // Would need to count all students in class
    term,
    academicYear,
    // Additional real database fields
    schoolName: studentInfo[0].schoolName || undefined,
    principalSignature: principalSignature.length > 0 ? principalSignature[0].teacherSignatureUrl : undefined
  };

  return studentData;
}

// Helper method to save PDF and create download URL
async function saveBulletinPdf(pdfBuffer: Buffer, filename: string, schoolId: number): Promise<string> {
  // In a real implementation, you would save to object storage or file system
  // For now, return a mock URL
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  return `${baseUrl}/api/bulletins/download/${filename}`;
}

// Generate comprehensive bulletin samples with realistic African student data
// PUBLIC ENDPOINT - No authentication required for sample generation
router.post('/generate-sample', async (req, res) => {
  try {
    console.log('[COMPREHENSIVE_SAMPLE] 🎯 Generating comprehensive bulletin samples');

    const { term = 'T1', language = 'fr' } = req.body;

    // Create realistic African school data
    const school: SchoolInfo = {
      id: 1,
      name: 'Collège Excellence Africaine',
      address: 'Quartier Bastos, Yaoundé',
      phone: '+237 222 345 678',
      email: 'info@college-excellence.cm',
      logoUrl: null, // Will use default logo
      directorName: 'Dr. Amina TCHOFFO',
      motto: 'Excellence, Discipline, Réussite',
      // Official Cameroon Ministry fields
      regionaleMinisterielle: 'DÉLÉGATION RÉGIONALE DU CENTRE',
      delegationDepartementale: 'DÉLÉGATION DÉPARTEMENTALE DU MFOUNDI',
      boitePostale: 'B.P. 15234 Yaoundé',
      arrondissement: 'Yaoundé 1er',
      // Academic info
      academicYear: '2024-2025',
      currentTerm: term,
    };

    // Create realistic student data with African names and comprehensive grades
    const studentData: StudentGradeData = {
      studentId: 1,
      firstName: 'Marie-Claire',
      lastName: 'NKOMO MBALLA',
      matricule: 'CEA-2024-0157',
      birthDate: '2010-03-15',
      photo: null,
      classId: 1,
      className: '6ème A Sciences',
      term,
      academicYear: '2024-2025',
      schoolName: school.name,
      
      // Comprehensive subject grades with realistic African curriculum
      subjects: [
        {
          subjectId: 1,
          subjectName: 'Mathématiques',
          teacherId: 1,
          teacherName: 'M. KONÉ Joseph',
          firstEvaluation: 16.5,
          secondEvaluation: term === 'T1' ? undefined : 15.0,
          thirdEvaluation: term === 'T3' ? 17.5 : undefined,
          termAverage: term === 'T1' ? 16.5 : term === 'T2' ? 15.75 : 16.33,
          coefficient: 4,
          maxScore: 20,
          comments: 'Excellents résultats. Élève méthodique et rigoureuse. Continue ainsi.',
          rank: 2
        },
        {
          subjectId: 2,
          subjectName: 'Français',
          teacherId: 2,
          teacherName: 'Mme DIALLO Fatoumata',
          firstEvaluation: 14.0,
          secondEvaluation: term === 'T1' ? undefined : 14.5,
          thirdEvaluation: term === 'T3' ? 15.0 : undefined,
          termAverage: term === 'T1' ? 14.0 : term === 'T2' ? 14.25 : 14.5,
          coefficient: 4,
          maxScore: 20,
          comments: 'Bonne maîtrise de la langue. Améliorer l\'expression écrite.',
          rank: 8
        },
        {
          subjectId: 3,
          subjectName: 'Anglais',
          teacherId: 3,
          teacherName: 'M. SMITH John',
          firstEvaluation: 15.5,
          secondEvaluation: term === 'T1' ? undefined : 16.0,
          thirdEvaluation: term === 'T3' ? 16.5 : undefined,
          termAverage: term === 'T1' ? 15.5 : term === 'T2' ? 15.75 : 16.0,
          coefficient: 3,
          maxScore: 20,
          comments: 'Excellent accent et bonne participation orale. Keep it up!',
          rank: 3
        },
        {
          subjectId: 4,
          subjectName: 'Histoire-Géographie',
          teacherId: 4,
          teacherName: 'M. OUÉDRAOGO Paul',
          firstEvaluation: 13.5,
          secondEvaluation: term === 'T1' ? undefined : 14.0,
          thirdEvaluation: term === 'T3' ? 14.5 : undefined,
          termAverage: term === 'T1' ? 13.5 : term === 'T2' ? 13.75 : 14.0,
          coefficient: 3,
          maxScore: 20,
          comments: 'Bonne connaissance de l\'Histoire africaine. Approfondir la géographie.',
          rank: 12
        },
        {
          subjectId: 5,
          subjectName: 'Sciences Physiques',
          teacherId: 5,
          teacherName: 'Mme CAMARA Aïcha',
          firstEvaluation: 17.0,
          secondEvaluation: term === 'T1' ? undefined : 16.5,
          thirdEvaluation: term === 'T3' ? 18.0 : undefined,
          termAverage: term === 'T1' ? 17.0 : term === 'T2' ? 16.75 : 17.17,
          coefficient: 3,
          maxScore: 20,
          comments: 'Excellente compréhension des phénomènes physiques. Élève douée.',
          rank: 1
        },
        {
          subjectId: 6,
          subjectName: 'Sciences Naturelles (SVT)',
          teacherId: 6,
          teacherName: 'M. TRAORÉ Ibrahim',
          firstEvaluation: 16.0,
          secondEvaluation: term === 'T1' ? undefined : 15.5,
          thirdEvaluation: term === 'T3' ? 16.5 : undefined,
          termAverage: term === 'T1' ? 16.0 : term === 'T2' ? 15.75 : 16.0,
          coefficient: 3,
          maxScore: 20,
          comments: 'Très bonne observation scientifique. Développer l\'esprit de synthèse.',
          rank: 4
        },
        {
          subjectId: 7,
          subjectName: 'Éducation Physique et Sportive',
          teacherId: 7,
          teacherName: 'M. BAMBA Sekou',
          firstEvaluation: 18.0,
          secondEvaluation: term === 'T1' ? undefined : 17.5,
          thirdEvaluation: term === 'T3' ? 18.5 : undefined,
          termAverage: term === 'T1' ? 18.0 : term === 'T2' ? 17.75 : 18.0,
          coefficient: 1,
          maxScore: 20,
          comments: 'Excellente sportive. Leadership naturel dans les équipes.',
          rank: 1
        },
        {
          subjectId: 8,
          subjectName: 'Arts Plastiques',
          teacherId: 8,
          teacherName: 'Mme NDOUMBE Célestine',
          firstEvaluation: 15.0,
          secondEvaluation: term === 'T1' ? undefined : 15.5,
          thirdEvaluation: term === 'T3' ? 16.0 : undefined,
          termAverage: term === 'T1' ? 15.0 : term === 'T2' ? 15.25 : 15.5,
          coefficient: 1,
          maxScore: 20,
          comments: 'Créativité remarquable. Sens artistique développé.',
          rank: 5
        },
        {
          subjectId: 9,
          subjectName: 'Éducation Civique et Morale',
          teacherId: 9,
          teacherName: 'M. ESSOMBA Laurent',
          firstEvaluation: 16.5,
          secondEvaluation: term === 'T1' ? undefined : 17.0,
          thirdEvaluation: term === 'T3' ? 17.5 : undefined,
          termAverage: term === 'T1' ? 16.5 : term === 'T2' ? 16.75 : 17.0,
          coefficient: 1,
          maxScore: 20,
          comments: 'Excellente citoyenne. Valeurs morales exemplaires.',
          rank: 2
        },
        {
          subjectId: 10,
          subjectName: 'Informatique',
          teacherId: 10,
          teacherName: 'M. MVOGO Christian',
          firstEvaluation: 17.5,
          secondEvaluation: term === 'T1' ? undefined : 18.0,
          thirdEvaluation: term === 'T3' ? 18.5 : undefined,
          termAverage: term === 'T1' ? 17.5 : term === 'T2' ? 17.75 : 18.0,
          coefficient: 2,
          maxScore: 20,
          comments: 'Maîtrise excellente des outils informatiques. Très à l\'aise.',
          rank: 1
        }
      ],
      
      // Calculate comprehensive statistics
      overallAverage: 0, // Will be calculated
      classRank: 3,
      totalStudents: 35,
      conductGrade: 17,
      absences: 2,
      principalSignature: 'Dr. Amina TCHOFFO - Directrice'
    };

    // Calculate overall average
    let totalPoints = 0;
    let totalCoefficients = 0;
    
    studentData.subjects.forEach(subject => {
      totalPoints += subject.termAverage * subject.coefficient;
      totalCoefficients += subject.coefficient;
    });
    
    studentData.overallAverage = totalPoints / totalCoefficients;

    // Comprehensive bulletin options with ALL features enabled
    const options: BulletinOptions = {
      includeComments: true,
      includeRankings: true,
      includeStatistics: true,
      includePerformanceLevels: true,
      language: language as 'fr' | 'en',
      format: 'A4',
      orientation: 'portrait',
      includeQRCode: true,
      qrCodeSize: 60,
      logoMaxWidth: 80,
      logoMaxHeight: 80,
      photoMaxWidth: 60,
      photoMaxHeight: 80
    };

    console.log('[COMPREHENSIVE_SAMPLE] 📊 Generating with comprehensive options:', {
      term,
      language,
      studentName: `${studentData.firstName} ${studentData.lastName}`,
      subjectCount: studentData.subjects.length,
      overallAverage: studentData.overallAverage.toFixed(2)
    });

    // Generate comprehensive PDF
    const pdfBuffer = await ComprehensiveBulletinGenerator.generateProfessionalBulletin(
      studentData,
      school,
      options
    );

    // Save the sample with appropriate naming
    const filename = `comprehensive-bulletin-${term.toLowerCase()}-${language}.pdf`;
    const samplePath = `public/samples/${filename}`;
    
    // Ensure samples directory exists
    const fs = require('fs');
    const path = require('path');
    const samplesDir = path.join(process.cwd(), 'public/samples');
    if (!fs.existsSync(samplesDir)) {
      fs.mkdirSync(samplesDir, { recursive: true });
    }
    
    // Save PDF
    fs.writeFileSync(path.join(process.cwd(), samplePath), pdfBuffer);

    console.log('[COMPREHENSIVE_SAMPLE] ✅ Generated comprehensive sample:', filename);

    res.json({
      success: true,
      message: `Comprehensive bulletin sample generated successfully`,
      data: {
        filename,
        path: samplePath,
        url: `/samples/${filename}`,
        term,
        language,
        student: {
          name: `${studentData.firstName} ${studentData.lastName}`,
          class: studentData.className,
          average: studentData.overallAverage.toFixed(2),
          rank: `${studentData.classRank}/${studentData.totalStudents}`
        },
        features: {
          totalSubjects: studentData.subjects.length,
          includeComments: options.includeComments,
          includeRankings: options.includeRankings,
          includeStatistics: options.includeStatistics,
          includePerformanceLevels: options.includePerformanceLevels,
          qrCodeIncluded: options.includeQRCode
        }
      }
    });

  } catch (error: any) {
    console.error('[COMPREHENSIVE_SAMPLE] ❌ Error generating sample:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate comprehensive bulletin sample',
      error: error.message
    });
  }
});

// Save comprehensive bulletin manual data
router.post('/save', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required - invalid user context'
      });
    }

    const validationResult = bulletinComprehensiveValidationSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors
      });
    }

    const validatedData = validationResult.data;
    const { subjectCoefficients, parentVisaName, parentVisaDate, teacherVisaName, teacherVisaDate, headmasterVisaName, headmasterVisaDate, totalGeneral, successRate, ...bulletinData } = validatedData;

    // Prepare data for database
    const comprehensiveData = {
      ...bulletinData,
      // Include required fields
      studentId: validatedData.studentId,
      classId: validatedData.classId,
      term: validatedData.term,
      academicYear: validatedData.academicYear,
      // Metadata
      schoolId,
      enteredBy: user.id,
      lastModifiedBy: user.id,
      // Convert string numbers to proper decimal format
      unjustifiedAbsenceHours: bulletinData.unjustifiedAbsenceHours ? parseFloat(bulletinData.unjustifiedAbsenceHours).toString() : "0.00",
      justifiedAbsenceHours: bulletinData.justifiedAbsenceHours ? parseFloat(bulletinData.justifiedAbsenceHours).toString() : "0.00",
      detentionHours: bulletinData.detentionHours ? parseFloat(bulletinData.detentionHours).toString() : "0.00",
      totalGeneral: totalGeneral ? parseFloat(totalGeneral).toString() : null,
      successRate: successRate ? parseFloat(successRate).toString() : null,
      // Convert signature data to JSON format
      parentVisa: parentVisaName || parentVisaDate ? {
        name: parentVisaName || '',
        date: parentVisaDate || ''
      } : null,
      teacherVisa: teacherVisaName || teacherVisaDate ? {
        name: teacherVisaName || '',
        date: teacherVisaDate || ''
      } : null,
      headmasterVisa: headmasterVisaName || headmasterVisaDate ? {
        name: headmasterVisaName || '',
        date: headmasterVisaDate || ''
      } : null
    };

    console.log('[COMPREHENSIVE_SAVE] 💾 Saving bulletin data:', {
      studentId: validatedData.studentId,
      classId: validatedData.classId,
      term: validatedData.term,
      academicYear: validatedData.academicYear,
      subjectCoefficientsCount: subjectCoefficients ? Object.keys(subjectCoefficients).length : 0
    });

    // Check if record already exists
    const existingRecord = await db.select()
      .from(bulletinComprehensive)
      .where(and(
        eq(bulletinComprehensive.studentId, validatedData.studentId),
        eq(bulletinComprehensive.classId, validatedData.classId),
        eq(bulletinComprehensive.term, validatedData.term),
        eq(bulletinComprehensive.academicYear, validatedData.academicYear),
        eq(bulletinComprehensive.schoolId, schoolId)
      ))
      .limit(1);

    let bulletinComprehensiveId: number;

    if (existingRecord.length > 0) {
      // Update existing record
      await db.update(bulletinComprehensive)
        .set(comprehensiveData)
        .where(eq(bulletinComprehensive.id, existingRecord[0].id));
      
      bulletinComprehensiveId = existingRecord[0].id;
      console.log('[COMPREHENSIVE_SAVE] ✅ Updated existing record:', bulletinComprehensiveId);
    } else {
      // Insert new record
      const insertResult = await db.insert(bulletinComprehensive)
        .values([comprehensiveData])
        .returning({ id: bulletinComprehensive.id });
      
      bulletinComprehensiveId = insertResult[0].id;
      console.log('[COMPREHENSIVE_SAVE] ✅ Created new record:', bulletinComprehensiveId);
    }

    // Handle subject coefficients if provided
    if (subjectCoefficients && typeof subjectCoefficients === 'object') {
      // First, delete existing subject codes for this bulletin
      await db.delete(bulletinSubjectCodes)
        .where(eq(bulletinSubjectCodes.bulletinComprehensiveId, bulletinComprehensiveId));

      // Insert new subject codes
      const subjectCodesData = [];
      for (const [subjectId, coefficients] of Object.entries(subjectCoefficients)) {
        if (coefficients && typeof coefficients === 'object') {
          const subjectCodeData = {
            bulletinComprehensiveId,
            studentId: validatedData.studentId,
            subjectId: parseInt(subjectId),
            subjectName: `Subject ${subjectId}`, // This should be fetched from subjects table in production
            CTBA: coefficients.CTBA ? parseFloat(coefficients.CTBA).toString() : null,
            CBA: coefficients.CBA ? parseFloat(coefficients.CBA).toString() : null,
            CA: coefficients.CA ? parseFloat(coefficients.CA).toString() : null,
            CMA: coefficients.CMA ? parseFloat(coefficients.CMA).toString() : null,
            COTE: coefficients.COTE || null,
            CNA: coefficients.CNA || null,
            minGrade: coefficients.minGrade ? parseFloat(coefficients.minGrade).toString() : null,
            maxGrade: coefficients.maxGrade ? parseFloat(coefficients.maxGrade).toString() : null
          };
          
          subjectCodesData.push(subjectCodeData);
        }
      }

      if (subjectCodesData.length > 0) {
        await db.insert(bulletinSubjectCodes).values(subjectCodesData);
        console.log('[COMPREHENSIVE_SAVE] ✅ Saved subject coefficients:', subjectCodesData.length);
      }
    }

    res.json({
      success: true,
      message: 'Comprehensive bulletin data saved successfully',
      data: { bulletinComprehensiveId }
    });

  } catch (error: any) {
    console.error('[COMPREHENSIVE_SAVE] ❌ Save error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save comprehensive bulletin data',
      error: error.message
    });
  }
});

// Load comprehensive bulletin manual data
router.get('/load/:studentId/:classId/:term/:academicYear', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required - invalid user context'
      });
    }

    const { studentId, classId, term, academicYear } = req.params;

    console.log('[COMPREHENSIVE_LOAD] 📥 Loading bulletin data:', {
      studentId, classId, term, academicYear, schoolId
    });

    // Load main bulletin data
    const bulletinData = await db.select()
      .from(bulletinComprehensive)
      .where(and(
        eq(bulletinComprehensive.studentId, parseInt(studentId)),
        eq(bulletinComprehensive.classId, parseInt(classId)),
        eq(bulletinComprehensive.term, term),
        eq(bulletinComprehensive.academicYear, academicYear),
        eq(bulletinComprehensive.schoolId, schoolId)
      ))
      .limit(1);

    if (!bulletinData.length) {
      return res.json({
        success: true,
        message: 'No saved data found',
        data: null
      });
    }

    const bulletin = bulletinData[0];

    // Load subject coefficients
    const subjectCodesData = await db.select()
      .from(bulletinSubjectCodes)
      .where(eq(bulletinSubjectCodes.bulletinComprehensiveId, bulletin.id));

    // Transform subject codes to expected format
    const subjectCoefficients: Record<string, any> = {};
    subjectCodesData.forEach(code => {
      subjectCoefficients[code.subjectId] = {
        CTBA: code.CTBA || '',
        CBA: code.CBA || '',
        CA: code.CA || '',
        CMA: code.CMA || '',
        COTE: code.COTE || '',
        CNA: code.CNA || '',
        minGrade: code.minGrade || '',
        maxGrade: code.maxGrade || ''
      };
    });

    // Transform data for frontend
    const responseData = {
      ...bulletin,
      // Transform JSON visa data to separate fields for form
      parentVisaName: (bulletin.parentVisa as any)?.name || '',
      parentVisaDate: (bulletin.parentVisa as any)?.date || '',
      teacherVisaName: (bulletin.teacherVisa as any)?.name || '',
      teacherVisaDate: (bulletin.teacherVisa as any)?.date || '',
      headmasterVisaName: (bulletin.headmasterVisa as any)?.name || '',
      headmasterVisaDate: (bulletin.headmasterVisa as any)?.date || '',
      // Add subject coefficients
      subjectCoefficients
    };

    console.log('[COMPREHENSIVE_LOAD] ✅ Loaded data:', {
      bulletinId: bulletin.id,
      subjectCoefficientsCount: Object.keys(subjectCoefficients).length
    });

    res.json({
      success: true,
      message: 'Comprehensive bulletin data loaded successfully',
      data: responseData
    });

  } catch (error: any) {
    console.error('[COMPREHENSIVE_LOAD] ❌ Load error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load comprehensive bulletin data',
      error: error.message
    });
  }
});

export default router;
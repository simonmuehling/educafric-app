// COMPREHENSIVE BULLETIN GENERATION ROUTES
// Integrates with director-approved grades for professional bulletin generation

import { Router } from 'express';
import { storage } from '../storage.js';
import { db } from '../db.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { ComprehensiveBulletinGenerator, type StudentGradeData, type SchoolInfo, type BulletinOptions } from '../services/comprehensiveBulletinGenerator.js';
import { hostingerMailService } from '../services/hostingerMailService.js';
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
} from '../../shared/schema.js';
import { 
  bulletinComprehensiveValidationSchema,
  insertBulletinSubjectCodesSchema,
  type InsertBulletinComprehensive,
  type InsertBulletinSubjectCodes
} from '../../shared/schemas/bulletinComprehensiveSchema.ts';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { requireAuth, requireAnyRole } from '../middleware/auth';

const router = Router();

// Validation schema for teacher submissions
const teacherSubmissionSchema = z.object({
  studentId: z.number(),
  classId: z.number(),
  term: z.enum(['T1', 'T2', 'T3']),
  academicYear: z.string(),
  manualData: z.object({
    // ✅ NOTES PAR MATIÈRE - CONNEXION TEACHER → DIRECTOR
    subjectGrades: z.array(z.object({
      subjectId: z.number(),
      subjectName: z.string(),
      grade: z.union([z.number(), z.string()]),
      maxGrade: z.number().default(20),
      coefficient: z.number().default(1),
      comment: z.string().optional()
    })).optional(),
    
    unjustifiedAbsenceHours: z.string().optional(),
    justifiedAbsenceHours: z.string().optional(),
    latenessMinutes: z.string().optional(),
    detentionHours: z.string().optional(),
    termGeneral: z.string().optional(),
    termClass: z.string().optional(),
    termCoeff: z.string().optional(),
    termRank: z.string().optional(),
    termStudents: z.string().optional(),
    classGeneral: z.string().optional(),
    appreciation: z.string().optional(),
    conductAppreciation: z.string().optional(),
    workAppreciation: z.string().optional(),
    councilDecision: z.string().optional(),
    councilComment: z.string().optional()
  }),
  generationOptions: z.object({
    // Options générales
    includeComments: z.boolean().optional(),
    includeRankings: z.boolean().optional(),
    includeStatistics: z.boolean().optional(),
    includePerformanceLevels: z.boolean().optional(),
    includeFirstTrimester: z.boolean().optional(),
    includeDiscipline: z.boolean().optional(),
    includeStudentWork: z.boolean().optional(),
    includeClassProfile: z.boolean().optional(),
    
    // Absences & Retards
    includeUnjustifiedAbsences: z.boolean().optional(),
    includeJustifiedAbsences: z.boolean().optional(),
    includeLateness: z.boolean().optional(),
    includeDetentions: z.boolean().optional(),
    
    // 🎯 SECTIONS MANQUANTES - HARMONISATION COMPLÈTE
    // Sanctions Disciplinaires
    includeConductWarning: z.boolean().optional(),
    includeConductBlame: z.boolean().optional(),
    includeExclusions: z.boolean().optional(),
    includePermanentExclusion: z.boolean().optional(),
    
    // Moyennes & Totaux
    includeTotalGeneral: z.boolean().optional(),
    includeAppreciations: z.boolean().optional(),
    includeGeneralAverage: z.boolean().optional(),
    includeTrimesterAverage: z.boolean().optional(),
    includeNumberOfAverages: z.boolean().optional(),
    includeSuccessRate: z.boolean().optional(),
    
    // Coefficients & Codes
    includeCoef: z.boolean().optional(),
    includeCTBA: z.boolean().optional(),
    includeMinMax: z.boolean().optional(),
    includeCBA: z.boolean().optional(),
    includeCA: z.boolean().optional(),
    includeCMA: z.boolean().optional(),
    includeCOTE: z.boolean().optional(),
    includeCNA: z.boolean().optional(),
    
    // Appréciations & Signatures
    includeWorkAppreciation: z.boolean().optional(),
    includeParentVisa: z.boolean().optional(),
    includeTeacherVisa: z.boolean().optional(),
    includeHeadmasterVisa: z.boolean().optional(),
    
    // Conseil de Classe
    includeClassCouncilDecisions: z.boolean().optional(),
    includeClassCouncilMentions: z.boolean().optional(),
    includeOrientationRecommendations: z.boolean().optional(),
    includeCouncilDate: z.boolean().optional(),
    
    generationFormat: z.enum(['pdf', 'batch_pdf']).optional()
  }).optional()
});

// Authorization middleware for Director/Admin access
const requireDirectorAuth = (req: any, res: any, next: any) => {
  const user = req.user as any;
  if (!user || !['Director', 'Admin'].includes(user.role)) {
    console.log('[AUTH] 🚫 Access denied for user:', { 
      userId: user?.id, 
      role: user?.role, 
      email: user?.email,
      path: req.path 
    });
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Director or Admin role required.' 
    });
  }
  next();
};

// Authorization middleware for Teacher access
const requireTeacherAuth = (req: any, res: any, next: any) => {
  const user = req.user as any;
  if (!user || !['Teacher', 'Director', 'Admin'].includes(user.role)) {
    console.log('[AUTH] 🚫 Teacher access denied for user:', { 
      userId: user?.id, 
      role: user?.role, 
      email: user?.email,
      path: req.path 
    });
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Teacher, Director or Admin role required.' 
    });
  }
  next();
};

// ===== TEACHER SUBMISSION ENDPOINT =====
// Route: POST /api/comprehensive-bulletins/teacher-submission
// Purpose: Accept manual data submissions from teachers for comprehensive bulletin generation
router.post('/teacher-submission', requireAuth, requireTeacherAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required - invalid user context'
      });
    }

    console.log('[TEACHER_SUBMISSION] 📝 Processing teacher data submission:', {
      userId: user.id,
      teacherName: `${user.firstName} ${user.lastName}`,
      schoolId,
      requestData: JSON.stringify(req.body, null, 2)
    });

    // Validate request data
    const validationResult = teacherSubmissionSchema.safeParse(req.body);
    if (!validationResult.success) {
      console.error('[TEACHER_SUBMISSION] ❌ Validation failed:', validationResult.error.issues);
      return res.status(400).json({
        success: false,
        message: 'Invalid submission data',
        errors: validationResult.error.issues
      });
    }

    const { studentId, classId, term, academicYear, manualData, generationOptions } = validationResult.data;

    // 🔒 AUTORISATION RENFORCÉE - Vérifier étudiant ET teacher assigné à cette classe  
    const studentClassAccess = await db.select({
      studentId: users.id,
      studentName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      classId: classes.id,
      className: classes.name
    })
    .from(users)
    .innerJoin(classes, and(
      eq(users.id, studentId),
      eq(users.role, 'Student'),
      eq(users.schoolId, schoolId),
      eq(classes.id, classId),
      eq(classes.schoolId, schoolId)
    ))
    .limit(1);

    if (studentClassAccess.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Student not found in specified class or access denied'
      });
    }

    // 🔒 VÉRIFICATION CRITIQUE: Teacher doit être assigné à cette classe
    // Pour l'instant, on vérifie que teacher et étudiant sont dans la même école
    // TODO: Implémenter table teacher_class_assignments pour contrôle plus strict
    const teacherAccess = await db.select({
      teacherId: users.id,
      teacherName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      schoolId: users.schoolId
    })
    .from(users)
    .where(and(
      eq(users.id, user.id),
      eq(users.role, 'Teacher'),
      eq(users.schoolId, schoolId)
    ))
    .limit(1);

    if (teacherAccess.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Teacher not authorized for this school'
      });
    }

    console.log('[TEACHER_SUBMISSION] ✅ Access verified:', {
      teacherId: user.id,
      teacherName: teacherAccess[0].teacherName,
      studentId,
      studentName: studentClassAccess[0].studentName,
      classId,
      className: studentClassAccess[0].className,
      schoolId
    });

    // 🎯 STOCKER LES NOTES PAR MATIÈRE d'abord
    if (manualData.subjectGrades && manualData.subjectGrades.length > 0) {
      console.log('[TEACHER_SUBMISSION] 📊 Processing subject grades:', manualData.subjectGrades.length);
      
      // Stocker chaque note individuelle dans teacherGradeSubmissions
      for (const gradeData of manualData.subjectGrades) {
        const gradeValue = typeof gradeData.grade === 'string' ? 
          parseFloat(gradeData.grade) : gradeData.grade;
          
        if (!isNaN(gradeValue) && gradeValue > 0) {
          await db.insert(teacherGradeSubmissions).values({
            studentId,
            teacherId: user.id,
            subjectId: gradeData.subjectId,
            classId,
            schoolId,
            academicYear,
            term: term as 'T1' | 'T2' | 'T3',
            
            // Notes - utiliser la même note pour toutes les évaluations pour simplifier
            firstEvaluation: gradeValue.toString(),
            secondEvaluation: gradeValue.toString(),
            thirdEvaluation: gradeValue.toString(),
            termAverage: gradeValue.toString(),
            
            coefficient: gradeData.coefficient || 1,
            maxScore: gradeData.maxGrade || 20,
            subjectComments: gradeData.comment || '',
            
            isSubmitted: true,
            submittedAt: new Date(),
            reviewStatus: 'pending', // Director doit approuver
            
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          console.log('[TEACHER_SUBMISSION] ✅ Subject grade stored:', {
            subject: gradeData.subjectName,
            grade: gradeValue,
            coefficient: gradeData.coefficient
          });
        }
      }
    }

    // 🎯 STOCKER TOUTES LES PRÉFÉRENCES D'OPTIONS (8 SECTIONS COMPLÈTES)
    if (generationOptions) {
      // 🔧 CORRECTION CRITIQUE: Utiliser db.execute au lieu de db.query pour SQL brut
      try {
        // 🔧 CORRECTION DRIZZLE: Utiliser SQL template au lieu de .bind()
        await db.execute(sql`
          INSERT INTO teacher_bulletin_preferences (
            teacher_id, student_id, class_id, school_id, term, academic_year,
            include_comments, include_rankings, include_statistics, include_performance_levels,
            include_first_trimester, include_discipline, include_student_work, include_class_profile,
            include_unjustified_absences, include_justified_absences, include_lateness, include_detentions,
            include_conduct_warning, include_conduct_blame, include_exclusions, include_permanent_exclusion,
            include_total_general, include_appreciations, include_general_average, include_trimester_average,
            include_number_of_averages, include_success_rate,
            include_coef, include_ctba, include_min_max, include_cba, include_ca, include_cma, include_cote, include_cna,
            include_work_appreciation, include_parent_visa, include_teacher_visa, include_headmaster_visa,
            include_class_council_decisions, include_class_council_mentions, include_orientation_recommendations, include_council_date,
            generation_format, updated_at
          ) VALUES (
            ${user.id}, ${studentId}, ${classId}, ${schoolId}, ${term}, ${academicYear},
            ${generationOptions.includeComments || false},
            ${generationOptions.includeRankings || false},
            ${generationOptions.includeStatistics || false},
            ${generationOptions.includePerformanceLevels || false},
            ${generationOptions.includeFirstTrimester || false},
            ${generationOptions.includeDiscipline || false},
            ${generationOptions.includeStudentWork || false},
            ${generationOptions.includeClassProfile || false},
            ${generationOptions.includeUnjustifiedAbsences || false},
            ${generationOptions.includeJustifiedAbsences || false},
            ${generationOptions.includeLateness || false},
            ${generationOptions.includeDetentions || false},
            ${generationOptions.includeConductWarning || false},
            ${generationOptions.includeConductBlame || false},
            ${generationOptions.includeExclusions || false},
            ${generationOptions.includePermanentExclusion || false},
            ${generationOptions.includeTotalGeneral || false},
            ${generationOptions.includeAppreciations || false},
            ${generationOptions.includeGeneralAverage || false},
            ${generationOptions.includeTrimesterAverage || false},
            ${generationOptions.includeNumberOfAverages || false},
            ${generationOptions.includeSuccessRate || false},
            ${generationOptions.includeCoef || false},
            ${generationOptions.includeCTBA || false},
            ${generationOptions.includeMinMax || false},
            ${generationOptions.includeCBA || false},
            ${generationOptions.includeCA || false},
            ${generationOptions.includeCMA || false},
            ${generationOptions.includeCOTE || false},
            ${generationOptions.includeCNA || false},
            ${generationOptions.includeWorkAppreciation || false},
            ${generationOptions.includeParentVisa || false},
            ${generationOptions.includeTeacherVisa || false},
            ${generationOptions.includeHeadmasterVisa || false},
            ${generationOptions.includeClassCouncilDecisions || false},
            ${generationOptions.includeClassCouncilMentions || false},
            ${generationOptions.includeOrientationRecommendations || false},
            ${generationOptions.includeCouncilDate || false},
            ${generationOptions.generationFormat || 'pdf'}, NOW()
          ) 
          ON CONFLICT (teacher_id, student_id, class_id, term, academic_year) 
          DO UPDATE SET
            include_comments = EXCLUDED.include_comments,
            include_rankings = EXCLUDED.include_rankings,
            include_statistics = EXCLUDED.include_statistics,
            include_performance_levels = EXCLUDED.include_performance_levels,
            include_first_trimester = EXCLUDED.include_first_trimester,
            include_discipline = EXCLUDED.include_discipline,
            include_student_work = EXCLUDED.include_student_work,
            include_class_profile = EXCLUDED.include_class_profile,
            include_unjustified_absences = EXCLUDED.include_unjustified_absences,
            include_justified_absences = EXCLUDED.include_justified_absences,
            include_lateness = EXCLUDED.include_lateness,
            include_detentions = EXCLUDED.include_detentions,
            include_conduct_warning = EXCLUDED.include_conduct_warning,
            include_conduct_blame = EXCLUDED.include_conduct_blame,
            include_exclusions = EXCLUDED.include_exclusions,
            include_permanent_exclusion = EXCLUDED.include_permanent_exclusion,
            include_total_general = EXCLUDED.include_total_general,
            include_appreciations = EXCLUDED.include_appreciations,
            include_general_average = EXCLUDED.include_general_average,
            include_trimester_average = EXCLUDED.include_trimester_average,
            include_number_of_averages = EXCLUDED.include_number_of_averages,
            include_success_rate = EXCLUDED.include_success_rate,
            include_coef = EXCLUDED.include_coef,
            include_ctba = EXCLUDED.include_ctba,
            include_min_max = EXCLUDED.include_min_max,
            include_cba = EXCLUDED.include_cba,
            include_ca = EXCLUDED.include_ca,
            include_cma = EXCLUDED.include_cma,
            include_cote = EXCLUDED.include_cote,
            include_cna = EXCLUDED.include_cna,
            include_work_appreciation = EXCLUDED.include_work_appreciation,
            include_parent_visa = EXCLUDED.include_parent_visa,
            include_teacher_visa = EXCLUDED.include_teacher_visa,
            include_headmaster_visa = EXCLUDED.include_headmaster_visa,
            include_class_council_decisions = EXCLUDED.include_class_council_decisions,
            include_class_council_mentions = EXCLUDED.include_class_council_mentions,
            include_orientation_recommendations = EXCLUDED.include_orientation_recommendations,
            include_council_date = EXCLUDED.include_council_date,
            generation_format = EXCLUDED.generation_format,
            updated_at = NOW()
        `);
        
        console.log('[TEACHER_SUBMISSION] ✅ All 8 sections preferences stored:', {
          teacherId: user.id,
          studentId,
          optionsCount: Object.keys(generationOptions).length
        });
      } catch (prefsError) {
        console.error('[TEACHER_SUBMISSION] ❌ Failed to store preferences:', prefsError);
        // Continue sans bloquer - les préférences sont optionnelles
      }
    }

    // Store teacher submission in bulletinComprehensive table for later processing by directors
    await db.insert(bulletinComprehensive).values({
      studentId,
      classId,
      term,
      academicYear,
      schoolId,
      status: 'teacher_submitted',
      
      // Manual data from teacher - using decimal strings for precision
      unjustifiedAbsenceHours: manualData.unjustifiedAbsenceHours || '0.00',
      justifiedAbsenceHours: manualData.justifiedAbsenceHours || '0.00',
      detentionHours: manualData.detentionHours || '0.00',
      
      // Text fields
      appreciation: manualData.appreciation || '',
      conductAppreciation: manualData.conductAppreciation || '',
      workAppreciation: manualData.workAppreciation || '',
      councilDecision: manualData.councilDecision || '',
      
      // Initialize with defaults
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    });

    console.log('[TEACHER_SUBMISSION] ✅ Teacher submission stored successfully:', {
      studentId,
      teacherId: user.id,
      classId,
      term,
      academicYear,
      status: 'teacher_submitted'
    });

    // Return success response
    res.json({
      success: true,
      message: 'Teacher submission received and stored for director processing',
      data: {
        studentId,
        classId,
        term,
        academicYear,
        status: 'teacher_submitted',
        submittedAt: new Date().toISOString(),
        teacherName: `${user.firstName} ${user.lastName}`
      }
    });

  } catch (error) {
    console.error('[TEACHER_SUBMISSION] 💥 Error processing teacher submission:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while processing submission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 🎯 ROUTE POUR RÉCUPÉRER LES PRÉFÉRENCES TEACHER (Director Access)
router.get('/teacher-preferences/:studentId/:classId/:term/:academicYear', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    const { studentId, classId, term, academicYear } = req.params;
    
    console.log('[TEACHER_PREFERENCES] 📋 Director requesting teacher preferences:', {
      schoolId,
      studentId,
      classId,
      term,
      academicYear
    });

    // Récupérer toutes les préférences des enseignants pour cet étudiant
    const teacherPreferences = await db.execute(sql`
      SELECT 
        teacher_id,
        include_comments, include_rankings, include_statistics, include_performance_levels,
        include_first_trimester, include_discipline, include_student_work, include_class_profile,
        include_unjustified_absences, include_justified_absences, include_lateness, include_detentions,
        include_conduct_warning, include_conduct_blame, include_exclusions, include_permanent_exclusion,
        include_total_general, include_appreciations, include_general_average, include_trimester_average,
        include_number_of_averages, include_success_rate,
        include_coef, include_ctba, include_min_max, include_cba, include_ca, include_cma, include_cote, include_cna,
        include_work_appreciation, include_parent_visa, include_teacher_visa, include_headmaster_visa,
        include_class_council_decisions, include_class_council_mentions, include_orientation_recommendations, include_council_date,
        generation_format, created_at, updated_at
      FROM teacher_bulletin_preferences 
      WHERE student_id = ${studentId} AND class_id = ${classId} AND term = ${term} AND academic_year = ${academicYear} AND school_id = ${schoolId}
      ORDER BY updated_at DESC
    `);

    // Récupérer les infos des enseignants
    const teacherIds = teacherPreferences.rows.map((pref: any) => pref.teacher_id);
    let teacherNames: any[] = [];
    
    if (teacherIds.length > 0) {
      teacherNames = await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email
      })
      .from(users)
      .where(sql`${users.id} = ANY(${teacherIds}::int[])`);
    }

    // Fusionner les préférences avec les noms
    const enrichedPreferences = teacherPreferences.rows.map((pref: any) => {
      const teacher = teacherNames.find(t => t.id === pref.teacher_id);
      return {
        ...pref,
        teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Enseignant inconnu',
        teacherEmail: teacher?.email || ''
      };
    });

    console.log('[TEACHER_PREFERENCES] ✅ Found preferences from', enrichedPreferences.length, 'teachers');

    return res.json({
      success: true,
      teacherPreferences: enrichedPreferences,
      summary: {
        totalTeachers: enrichedPreferences.length,
        studentId: parseInt(studentId),
        classId: parseInt(classId),
        term,
        academicYear
      }
    });

  } catch (error) {
    console.error('[TEACHER_PREFERENCES] ❌ Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher preferences'
    });
  }
});

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
      subjectName: sql<string>`COALESCE(${subjects.nameFr}, ${subjects.nameEn}, 'Unknown Subject')`,
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
      isSubmitted: teacherGradeSubmissions.isSubmitted,
      submittedAt: teacherGradeSubmissions.submittedAt
    })
    .from(teacherGradeSubmissions)
    .leftJoin(subjects, eq(teacherGradeSubmissions.subjectId, subjects.id))
    .leftJoin(users, eq(teacherGradeSubmissions.teacherId, users.id))
    .where(and(
      eq(teacherGradeSubmissions.classId, parseInt(classId as string)),
      eq(teacherGradeSubmissions.term, term as string),
      eq(teacherGradeSubmissions.academicYear, academicYear as string),
      eq(teacherGradeSubmissions.schoolId, schoolId),
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
      count: sql<number>`COUNT(DISTINCT ${teacherGradeSubmissions.studentId})`
    })
      .from(teacherGradeSubmissions)
      .where(and(
        eq(teacherGradeSubmissions.classId, parseInt(classId as string)),
        eq(teacherGradeSubmissions.term, term as string),
        eq(teacherGradeSubmissions.academicYear, academicYear as string),
        eq(teacherGradeSubmissions.schoolId, schoolId),
        eq(teacherGradeSubmissions.isSubmitted, true)
      ));

    // Calculate class average
    const classAverages = await db.execute(sql`
      SELECT AVG(term_average) as class_average
      FROM teacher_grade_submissions
      WHERE class_id = ${parseInt(classId as string)}
        AND term = ${term as string}
        AND academic_year = ${academicYear as string}
        AND school_id = ${schoolId}
        AND is_submitted = true
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
        eq(teacherGradeSubmissions.isSubmitted, true)
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
      format = 'pdf',
      
      // Section Évaluation & Trimestre
      includeFirstTrimester = false,
      includeDiscipline = false,
      includeStudentWork = false,
      includeClassProfile = false,
      
      // Section Absences & Retards
      includeUnjustifiedAbsences = false,
      includeJustifiedAbsences = false,
      includeLateness = false,
      includeDetentions = false,
      
      // Section Sanctions Disciplinaires
      includeConductWarning = false,
      includeConductBlame = false,
      includeExclusions = false,
      includePermanentExclusion = false,
      
      // Section Moyennes & Totaux
      includeTotalGeneral = false,
      includeAppreciations = false,
      includeGeneralAverage = false,
      includeTrimesterAverage = false,
      includeNumberOfAverages = false,
      includeSuccessRate = false,
      
      // Section Coefficients & Codes
      includeCoef = false,
      includeCTBA = false,
      includeMinMax = false,
      includeCBA = false,
      includeCA = false,
      includeCMA = false,
      includeCOTE = false,
      includeCNA = false,
      
      // Section Appréciations & Signatures
      includeWorkAppreciation = false,
      includeParentVisa = false,
      includeTeacherVisa = false,
      includeHeadmasterVisa = false,
      
      // Section Conseil de Classe
      includeClassCouncilDecisions = false,
      includeClassCouncilMentions = false,
      includeOrientationRecommendations = false,
      includeCouncilDate = false,
      
      // Manual data entry
      manualData = {}
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

        // Generate PDF with comprehensive options
        const options: BulletinOptions = {
          includeComments,
          includeRankings,
          includeStatistics,
          includePerformanceLevels,
          language: 'fr',
          format: 'A4',
          orientation: 'portrait',
          
          // Section flags for Class Council integration
          includeClassCouncilDecisions,
          includeClassCouncilMentions,
          includeOrientationRecommendations,
          includeCouncilDate,
          
          // All comprehensive section flags
          includeFirstTrimester,
          includeDiscipline,
          includeStudentWork,
          includeClassProfile,
          includeUnjustifiedAbsences,
          includeJustifiedAbsences,
          includeLateness,
          includeDetentions,
          includeConductWarning,
          includeConductBlame,
          includeExclusions,
          includePermanentExclusion,
          includeTotalGeneral,
          includeAppreciations,
          includeGeneralAverage,
          includeTrimesterAverage,
          includeNumberOfAverages,
          includeSuccessRate,
          includeCoef,
          includeCTBA,
          includeMinMax,
          includeCBA,
          includeCA,
          includeCMA,
          includeCOTE,
          includeCNA,
          includeWorkAppreciation,
          includeParentVisa,
          includeTeacherVisa,
          includeHeadmasterVisa,
          
          // Manual data for custom entries
          manualData
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
    // Enhanced error logging with detailed context
    console.error('[COMPREHENSIVE_SAVE] ❌ Comprehensive save error occurred:');
    console.error('[COMPREHENSIVE_SAVE] Error name:', error.name);
    console.error('[COMPREHENSIVE_SAVE] Error message:', error.message);
    console.error('[COMPREHENSIVE_SAVE] Error stack:', error.stack);
    
    // Log the validation data that caused the error
    const currentUser = req.user as any;
    console.error('[COMPREHENSIVE_SAVE] Request data context:', {
      hasRequestBody: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : [],
      userSchoolId: currentUser?.schoolId,
      userId: currentUser?.id,
      userRole: currentUser?.role
    });

    // Check for specific database errors
    const isDatabaseError = error.code || error.constraint || error.table;
    if (isDatabaseError) {
      console.error('[COMPREHENSIVE_SAVE] Database error details:', {
        code: error.code,
        constraint: error.constraint,
        table: error.table,
        column: error.column,
        detail: error.detail,
        hint: error.hint
      });
    }

    // Check for validation schema errors
    if (error.name === 'ZodError') {
      console.error('[COMPREHENSIVE_SAVE] Zod validation error:', error.errors);
      return res.status(400).json({
        success: false,
        message: 'Validation error in bulletin data',
        errors: error.errors,
        errorType: 'validation'
      });
    }

    // Check for database constraint errors
    if (error.constraint) {
      console.error('[COMPREHENSIVE_SAVE] Database constraint violation:', error.constraint);
      return res.status(400).json({
        success: false,
        message: 'Database constraint violation - please check your data',
        constraint: error.constraint,
        errorType: 'database_constraint'
      });
    }

    // Check for missing table/column errors
    if (error.code === '42P01') { // undefined_table
      console.error('[COMPREHENSIVE_SAVE] Database table not found:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Database table not found - please contact administrator',
        errorType: 'missing_table'
      });
    }

    if (error.code === '42703') { // undefined_column
      console.error('[COMPREHENSIVE_SAVE] Database column not found:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Database column not found - please contact administrator',
        errorType: 'missing_column'
      });
    }

    // Generic database connection errors
    if (error.code && error.code.startsWith('28')) { // Connection errors (28xxx)
      console.error('[COMPREHENSIVE_SAVE] Database connection error:', error.code);
      return res.status(503).json({
        success: false,
        message: 'Database connection temporarily unavailable',
        errorType: 'database_connection'
      });
    }

    // Generic server error for unhandled cases
    res.status(500).json({
      success: false,
      message: 'Failed to save comprehensive bulletin data',
      error: error.message,
      errorType: 'server_error'
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

// ===== WORKFLOW ROUTES FOR BULLETIN STATUS MANAGEMENT =====

// Get bulletins with status='submitted' (pending approval)
router.get('/pending', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required - invalid user context'
      });
    }

    console.log('[COMPREHENSIVE_WORKFLOW] 📋 Fetching pending bulletins for school:', schoolId);

    // Get bulletins with status='submitted' including student and class info
    const pendingBulletins = await db.select({
      id: bulletinComprehensive.id,
      studentId: bulletinComprehensive.studentId,
      studentName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      classId: bulletinComprehensive.classId,
      className: classes.name,
      term: bulletinComprehensive.term,
      academicYear: bulletinComprehensive.academicYear,
      status: bulletinComprehensive.status,
      submittedAt: bulletinComprehensive.submittedAt,
      generalAverage: bulletinComprehensive.generalAverage,
      workAppreciation: bulletinComprehensive.workAppreciation,
      createdAt: bulletinComprehensive.createdAt,
      updatedAt: bulletinComprehensive.updatedAt
    })
    .from(bulletinComprehensive)
    .leftJoin(users, eq(bulletinComprehensive.studentId, users.id))
    .leftJoin(classes, eq(bulletinComprehensive.classId, classes.id))
    .where(and(
      eq(bulletinComprehensive.schoolId, schoolId),
      eq(bulletinComprehensive.status, 'submitted')
    ))
    .orderBy(sql`${bulletinComprehensive.submittedAt} DESC`);

    console.log('[COMPREHENSIVE_WORKFLOW] ✅ Found pending bulletins:', pendingBulletins.length);

    res.json({
      success: true,
      data: pendingBulletins.map(bulletin => ({
        ...bulletin,
        studentName: bulletin.studentName || `Élève ${bulletin.studentId}`,
        className: bulletin.className || `Classe ${bulletin.classId}`,
        generalAverage: bulletin.generalAverage ? parseFloat(bulletin.generalAverage.toString()) : null
      }))
    });

  } catch (error: any) {
    console.error('[COMPREHENSIVE_WORKFLOW] ❌ Error fetching pending bulletins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending bulletins',
      error: error.message
    });
  }
});

// Get bulletins with status='approved' (approved by director)
router.get('/approved', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required - invalid user context'
      });
    }

    console.log('[COMPREHENSIVE_WORKFLOW] 📋 Fetching approved bulletins for school:', schoolId);

    // Get bulletins with status='approved' including student, class, and approver info
    const approvedBulletins = await db.select({
      id: bulletinComprehensive.id,
      studentId: bulletinComprehensive.studentId,
      studentName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      classId: bulletinComprehensive.classId,
      className: classes.name,
      term: bulletinComprehensive.term,
      academicYear: bulletinComprehensive.academicYear,
      status: bulletinComprehensive.status,
      submittedAt: bulletinComprehensive.submittedAt,
      approvedAt: bulletinComprehensive.approvedAt,
      approvedBy: bulletinComprehensive.approvedBy,
      approverName: sql<string>`CONCAT(approver.first_name, ' ', approver.last_name)`,
      generalAverage: bulletinComprehensive.generalAverage,
      workAppreciation: bulletinComprehensive.workAppreciation,
      createdAt: bulletinComprehensive.createdAt,
      updatedAt: bulletinComprehensive.updatedAt
    })
    .from(bulletinComprehensive)
    .leftJoin(users, eq(bulletinComprehensive.studentId, users.id))
    .leftJoin(classes, eq(bulletinComprehensive.classId, classes.id))
    .leftJoin(sql`users AS approver`, sql`approver.id = ${bulletinComprehensive.approvedBy}`)
    .where(and(
      eq(bulletinComprehensive.schoolId, schoolId),
      eq(bulletinComprehensive.status, 'approved')
    ))
    .orderBy(sql`${bulletinComprehensive.approvedAt} DESC`);

    console.log('[COMPREHENSIVE_WORKFLOW] ✅ Found approved bulletins:', approvedBulletins.length);

    res.json({
      success: true,
      data: approvedBulletins.map(bulletin => ({
        ...bulletin,
        studentName: bulletin.studentName || `Élève ${bulletin.studentId}`,
        className: bulletin.className || `Classe ${bulletin.classId}`,
        approverName: bulletin.approverName || `Directeur ${bulletin.approvedBy}`,
        generalAverage: bulletin.generalAverage ? parseFloat(bulletin.generalAverage.toString()) : null
      }))
    });

  } catch (error: any) {
    console.error('[COMPREHENSIVE_WORKFLOW] ❌ Error fetching approved bulletins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approved bulletins',
      error: error.message
    });
  }
});

// Get bulletins with status='sent' (sent to parents)
router.get('/sent', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required - invalid user context'
      });
    }

    console.log('[COMPREHENSIVE_WORKFLOW] 📋 Fetching sent bulletins for school:', schoolId);

    // Get bulletins with status='sent' including student, class, and notification info
    const sentBulletins = await db.select({
      id: bulletinComprehensive.id,
      studentId: bulletinComprehensive.studentId,
      studentName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      classId: bulletinComprehensive.classId,
      className: classes.name,
      term: bulletinComprehensive.term,
      academicYear: bulletinComprehensive.academicYear,
      status: bulletinComprehensive.status,
      submittedAt: bulletinComprehensive.submittedAt,
      approvedAt: bulletinComprehensive.approvedAt,
      sentAt: bulletinComprehensive.sentAt,
      approvedBy: bulletinComprehensive.approvedBy,
      approverName: sql<string>`CONCAT(approver.first_name, ' ', approver.last_name)`,
      generalAverage: bulletinComprehensive.generalAverage,
      notificationsSent: bulletinComprehensive.notificationsSent,
      createdAt: bulletinComprehensive.createdAt,
      updatedAt: bulletinComprehensive.updatedAt
    })
    .from(bulletinComprehensive)
    .leftJoin(users, eq(bulletinComprehensive.studentId, users.id))
    .leftJoin(classes, eq(bulletinComprehensive.classId, classes.id))
    .leftJoin(sql`users AS approver`, sql`approver.id = ${bulletinComprehensive.approvedBy}`)
    .where(and(
      eq(bulletinComprehensive.schoolId, schoolId),
      eq(bulletinComprehensive.status, 'sent')
    ))
    .orderBy(sql`${bulletinComprehensive.sentAt} DESC`);

    console.log('[COMPREHENSIVE_WORKFLOW] ✅ Found sent bulletins:', sentBulletins.length);

    res.json({
      success: true,
      data: sentBulletins.map(bulletin => ({
        ...bulletin,
        studentName: bulletin.studentName || `Élève ${bulletin.studentId}`,
        className: bulletin.className || `Classe ${bulletin.classId}`,
        approverName: bulletin.approverName || `Directeur ${bulletin.approvedBy}`,
        generalAverage: bulletin.generalAverage ? parseFloat(bulletin.generalAverage.toString()) : null,
        notificationsSent: bulletin.notificationsSent || { sms: false, email: false, whatsapp: false }
      }))
    });

  } catch (error: any) {
    console.error('[COMPREHENSIVE_WORKFLOW] ❌ Error fetching sent bulletins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sent bulletins',
      error: error.message
    });
  }
});

// Bulk approve multiple bulletins
router.post('/bulk-approve', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    const userId = user.id;
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required - invalid user context'
      });
    }

    const { bulletinIds } = req.body;

    if (!bulletinIds || !Array.isArray(bulletinIds) || bulletinIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'bulletinIds array is required and must not be empty'
      });
    }

    console.log('[COMPREHENSIVE_WORKFLOW] 🎯 Bulk approving bulletins:', { 
      count: bulletinIds.length, 
      approvedBy: userId,
      schoolId
    });

    // Validate that all bulletins exist, belong to this school, and have 'submitted' status
    const validBulletins = await db.select({
      id: bulletinComprehensive.id,
      studentId: bulletinComprehensive.studentId,
      status: bulletinComprehensive.status,
      studentName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`
    })
    .from(bulletinComprehensive)
    .leftJoin(users, eq(bulletinComprehensive.studentId, users.id))
    .where(and(
      inArray(bulletinComprehensive.id, bulletinIds.map(id => parseInt(id.toString()))),
      eq(bulletinComprehensive.schoolId, schoolId)
    ));

    if (validBulletins.length !== bulletinIds.length) {
      return res.status(400).json({
        success: false,
        message: `Found ${validBulletins.length} valid bulletins out of ${bulletinIds.length} requested`
      });
    }

    // Check that all bulletins are in 'submitted' status
    const nonSubmittedBulletins = validBulletins.filter(b => b.status !== 'submitted');
    if (nonSubmittedBulletins.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${nonSubmittedBulletins.length} bulletins are not in 'submitted' status and cannot be approved`
      });
    }

    // Perform bulk approval - update status, approvedBy, and approvedAt
    const approvedAt = new Date();
    
    // Perform bulk approval with proper tenant security - using raw SQL to avoid TypeScript issues
    const bulletinIdsArray = bulletinIds.map(id => parseInt(id.toString()));
    
    await db.execute(sql`
      UPDATE bulletin_comprehensive 
      SET status = 'approved', 
          approved_by = ${userId},
          approved_at = ${approvedAt},
          updated_at = ${new Date()}
      WHERE id = ANY(${bulletinIdsArray})
        AND school_id = ${schoolId}
        AND status = 'submitted'
    `);

    console.log('[COMPREHENSIVE_WORKFLOW] ✅ Bulk approval completed:', {
      approvedCount: validBulletins.length,
      approvedBy: userId,
      approvedAt: approvedAt.toISOString()
    });

    // Return success with details of approved bulletins including updatedCount and updatedIds
    const updatedIds = validBulletins.map(bulletin => bulletin.id);
    
    res.json({
      success: true,
      message: `Successfully approved ${validBulletins.length} bulletins`,
      data: {
        updatedCount: validBulletins.length,
        updatedIds: updatedIds,
        approvedBy: userId,
        approvedAt: approvedAt.toISOString(),
        approvedBulletins: validBulletins.map(bulletin => ({
          id: bulletin.id,
          studentId: bulletin.studentId,
          studentName: bulletin.studentName || `Élève ${bulletin.studentId}`,
          status: 'approved'
        }))
      }
    });

  } catch (error: any) {
    console.error('[COMPREHENSIVE_WORKFLOW] ❌ Error in bulk approval:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve bulletins',
      error: error.message
    });
  }
});

// Send approved bulletins to parents via notifications (Email with PDF attachment + SMS/WhatsApp with download link)
router.post('/send-to-parents', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    const userId = user.id;
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required - invalid user context'
      });
    }

    const { bulletinIds } = req.body;

    if (!bulletinIds || !Array.isArray(bulletinIds) || bulletinIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'bulletinIds array is required and must not be empty'
      });
    }

    console.log('[BULLETIN_DISTRIBUTION] 📮 Starting bulletin distribution to parents:', { 
      count: bulletinIds.length, 
      requestedBy: userId,
      schoolId
    });

    // Import consolidated notification service and helpers
    const { BulletinNotificationService } = await import('../services/bulletinNotificationService');
    const fs = await import('fs');
    const path = await import('path');

    // Initialize bulletin notification service
    const bulletinNotificationService = new BulletinNotificationService();

    // Validate that all bulletins exist, belong to this school, and have 'approved' status
    const validBulletins = await db.select({
      id: bulletinComprehensive.id,
      studentId: bulletinComprehensive.studentId,
      status: bulletinComprehensive.status,
      classId: bulletinComprehensive.classId,
      term: bulletinComprehensive.term,
      academicYear: bulletinComprehensive.academicYear,
      studentName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      studentEmail: users.email
    })
    .from(bulletinComprehensive)
    .leftJoin(users, eq(bulletinComprehensive.studentId, users.id))
    .where(and(
      inArray(bulletinComprehensive.id, bulletinIds.map(id => parseInt(id.toString()))),
      eq(bulletinComprehensive.schoolId, schoolId)
    ));

    if (validBulletins.length !== bulletinIds.length) {
      return res.status(400).json({
        success: false,
        message: `Found ${validBulletins.length} valid bulletins out of ${bulletinIds.length} requested`
      });
    }

    // Check that all bulletins are in 'approved' status
    const nonApprovedBulletins = validBulletins.filter(b => b.status !== 'approved');
    if (nonApprovedBulletins.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${nonApprovedBulletins.length} bulletins are not in 'approved' status and cannot be sent`
      });
    }

    // Get school information for language preferences and contact details
    const schoolInfo = await db.select()
      .from(schools)
      .where(eq(schools.id, schoolId))
      .limit(1);

    const school = schoolInfo[0] || { 
      name: 'École', 
      email: null, 
      phone: null, 
      settings: null 
    };

    // Get parent relationships and contact information for all students
    const studentIds = validBulletins.map(b => b.studentId);
    
    const parentRelations = await db.execute(sql`
      SELECT 
        psr.student_id,
        psr.parent_id,
        psr.relationship,
        u.first_name as parent_first_name,
        u.last_name as parent_last_name,
        u.email as parent_email,
        u.phone as parent_phone,
        u.whatsapp_number as parent_whatsapp,
        u.preferred_language as parent_language
      FROM parent_student_relations psr
      JOIN users u ON psr.parent_id = u.id
      WHERE psr.student_id = ANY(${studentIds})
        AND u.role = 'Parent'
        AND (u.email IS NOT NULL OR u.phone IS NOT NULL OR u.whatsapp_number IS NOT NULL)
      ORDER BY psr.student_id, psr.relationship
    `);

    // FIXED: Process bulletins with atomic transaction and consolidated notification service
    const distributionResults = [];
    const sentAt = new Date();
    let totalSentEmails = 0;
    let totalSentSMS = 0;
    let totalSentWhatsApp = 0;
    let totalErrors = 0;

    // Use transaction for atomicity
    await db.transaction(async (tx) => {
      for (const bulletin of validBulletins) {
        try {
          console.log(`[BULLETIN_DISTRIBUTION] 📄 Processing bulletin ${bulletin.id} for ${bulletin.studentName}`);

          // Get parents for this student
          const studentParents = parentRelations.rows.filter(r => r.student_id === bulletin.studentId);
          
          if (studentParents.length === 0) {
            console.log(`[BULLETIN_DISTRIBUTION] ⚠️ No parents found for student ${bulletin.studentId}`);
            distributionResults.push({
              bulletinId: bulletin.id,
              studentId: bulletin.studentId,
              studentName: bulletin.studentName,
              success: false,
              message: 'No parent contacts found',
              parents: []
            });
            totalErrors++;
            continue;
          }

          // Prepare bulletin data for notification service
          const bulletinData = {
            studentId: bulletin.studentId,
            studentName: bulletin.studentName || `Élève ${bulletin.studentId}`,
            className: 'Classe', // Will be retrieved if needed
            period: `${bulletin.term} ${bulletin.academicYear}`,
            academicYear: bulletin.academicYear,
            generalAverage: 14.5, // Mock average, should be calculated from grades
            classRank: 1, // Mock rank, should be calculated
            totalStudentsInClass: 25, // Mock total, should be retrieved
            subjects: [], // Would be populated from grades
            teacherComments: '',
            directorComments: '',
            qrCode: `https://verify.educafric.com/bulletin/${bulletin.id}`,
            downloadUrl: `https://www.educafric.com/bulletins/download/${bulletin.id}`,
            verificationUrl: `https://verify.educafric.com/bulletin/${bulletin.id}`
          };

          // Get school default language for fallback
          let schoolDefaultLanguage: 'en' | 'fr' = 'fr';
          if (school.settings && typeof school.settings === 'object') {
            const settings = school.settings as any;
            schoolDefaultLanguage = (settings.defaultLanguage as 'en' | 'fr') || 'fr';
          }
          
          // Prepare recipients for notification service with proper language selection
          const recipients = studentParents.map(parent => ({
            id: parent.parent_id.toString(),
            name: `${parent.parent_first_name} ${parent.parent_last_name}`,
            email: parent.parent_email as string,
            phone: parent.parent_phone as string,
            whatsapp: parent.parent_whatsapp as string,
            role: 'Parent' as const,
            // Use parent's preferred language, fall back to school default, then 'fr'
            preferredLanguage: (
              parent.parent_preferred_language || 
              parent.parent_language || 
              schoolDefaultLanguage
            ) as 'en' | 'fr',
            relationToStudent: parent.relationship as string,
            schoolName: school.name,
            schoolContact: school.email || school.phone || 'info@educafric.com'
          }));

          // Use dynamic language selection - determine primary language from recipients
          const primaryLanguage = recipients.length > 0 
            ? recipients[0].preferredLanguage 
            : schoolDefaultLanguage;

          // FIXED: Use consolidated BulletinNotificationService with proper language selection
          const notificationResult = await bulletinNotificationService.sendBulletinNotifications(
            bulletinData,
            recipients,
            ['sms', 'email', 'whatsapp'], // All notification types
            primaryLanguage // Dynamic language selection from parent profiles
          );

          // Update counters
          totalSentEmails += notificationResult.summary.successfulEmails;
          totalSentSMS += notificationResult.summary.successfulSMS;
          totalSentWhatsApp += notificationResult.summary.successfulWhatsApp;
          totalErrors += notificationResult.summary.failed;

          // FIXED: Update bulletin status to 'sent' with atomic transaction
          const hasSuccessfulNotification = 
            notificationResult.summary.successfulEmails > 0 ||
            notificationResult.summary.successfulSMS > 0 ||
            notificationResult.summary.successfulWhatsApp > 0;

          if (hasSuccessfulNotification) {
            await tx.execute(sql`
              UPDATE bulletin_comprehensive 
              SET status = 'sent',
                  sent_at = ${sentAt},
                  notifications_sent = ${JSON.stringify({
                    totalParents: studentParents.length,
                    emailsSent: notificationResult.summary.successfulEmails,
                    smsSent: notificationResult.summary.successfulSMS,
                    whatsappSent: notificationResult.summary.successfulWhatsApp,
                    sentAt: sentAt.toISOString(),
                    notificationResults: notificationResult.results
                  })},
                  updated_at = ${new Date()}
              WHERE id = ${bulletin.id}
                AND school_id = ${schoolId}
            `);
          }

          distributionResults.push({
            bulletinId: bulletin.id,
            studentId: bulletin.studentId,
            studentName: bulletin.studentName,
            success: hasSuccessfulNotification,
            notificationSummary: notificationResult.summary,
            statusUpdated: hasSuccessfulNotification
          });

          console.log(`[BULLETIN_DISTRIBUTION] ✅ Completed bulletin ${bulletin.id} - Success: ${hasSuccessfulNotification}`);

        } catch (bulletinError: any) {
          console.error(`[BULLETIN_DISTRIBUTION] ❌ Error processing bulletin ${bulletin.id}:`, bulletinError);
          distributionResults.push({
            bulletinId: bulletin.id,
            studentId: bulletin.studentId,
            studentName: bulletin.studentName,
            success: false,
            message: bulletinError.message,
            parents: []
          });
          totalErrors++;
          // Don't throw here to continue processing other bulletins
        }
      }
    });

    const summary = {
      totalBulletins: validBulletins.length,
      successfulBulletins: distributionResults.filter(r => r.success).length,
      failedBulletins: distributionResults.filter(r => !r.success).length,
      totalEmailsSent: totalSentEmails,
      totalSmsSent: totalSentSMS,
      totalWhatsAppSent: totalSentWhatsApp,
      totalErrors: totalErrors,
      sentAt: sentAt.toISOString()
    };

    console.log('[BULLETIN_DISTRIBUTION] 📊 Distribution Summary:', summary);

    res.json({
      success: true,
      message: `Bulletin distribution completed: ${summary.successfulBulletins}/${summary.totalBulletins} bulletins sent successfully`,
      data: {
        summary,
        results: distributionResults
      }
    });

  } catch (error: any) {
    console.error('[BULLETIN_DISTRIBUTION] ❌ Error in bulletin distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to distribute bulletins to parents',
      error: error.message
    });
  }
});

// ===== ROUTE API DE TRACKING DES NOTIFICATIONS =====
// GET /api/comprehensive-bulletins/:bulletinId/distribution-status
// Retourner statut détaillé des envois pour un bulletin spécifique
router.get('/:bulletinId/distribution-status', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    const bulletinId = parseInt(req.params.bulletinId);
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required - invalid user context'
      });
    }

    if (!bulletinId || isNaN(bulletinId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid bulletinId is required'
      });
    }

    console.log('[BULLETIN_DISTRIBUTION_STATUS] 📊 Fetching distribution status for bulletin:', bulletinId);

    // Récupérer le bulletin avec les données de tracking
    const bulletin = await db.select({
      id: bulletinComprehensive.id,
      studentId: bulletinComprehensive.studentId,
      studentName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      classId: bulletinComprehensive.classId,
      className: classes.name,
      term: bulletinComprehensive.term,
      academicYear: bulletinComprehensive.academicYear,
      status: bulletinComprehensive.status,
      sentAt: bulletinComprehensive.sentAt,
      notificationsSent: bulletinComprehensive.notificationsSent,
      generalAverage: bulletinComprehensive.generalAverage,
      createdAt: bulletinComprehensive.createdAt,
      updatedAt: bulletinComprehensive.updatedAt
    })
    .from(bulletinComprehensive)
    .leftJoin(users, eq(bulletinComprehensive.studentId, users.id))
    .leftJoin(classes, eq(bulletinComprehensive.classId, classes.id))
    .where(and(
      eq(bulletinComprehensive.id, bulletinId),
      eq(bulletinComprehensive.schoolId, schoolId)
    ))
    .limit(1);

    if (bulletin.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bulletin not found or access denied'
      });
    }

    const bulletinData = bulletin[0];

    // CORRECTION CRITIQUE : Analyser les données de tracking avec nouveau format par destinataire
    const notificationsTracking = bulletinData.notificationsSent as any;
    console.log('[BULLETIN_DISTRIBUTION_STATUS] Analyzing tracking data:', JSON.stringify(notificationsTracking, null, 2));
    
    // Supporter les deux formats : nouveau (perRecipient) et legacy
    const isNewFormat = notificationsTracking?.perRecipient && notificationsTracking?.summary;
    console.log('[BULLETIN_DISTRIBUTION_STATUS] Using format:', isNewFormat ? 'new (perRecipient)' : 'legacy');
    
    // Calculer les agrégats précis par canal et par destinataire
    let aggregatedChannels = {
      email: {
        configured: false,
        totalRecipients: 0,
        successCount: 0,
        failedCount: 0,
        pendingCount: 0,
        successRate: 0,
        recipients: [] as any[]
      },
      sms: {
        configured: false,
        totalRecipients: 0,
        successCount: 0,
        failedCount: 0,
        pendingCount: 0,
        successRate: 0,
        recipients: [] as any[]
      },
      whatsapp: {
        configured: false,
        totalRecipients: 0,
        successCount: 0,
        failedCount: 0,
        pendingCount: 0,
        successRate: 0,
        recipients: [] as any[]
      }
    };
    
    if (isNewFormat) {
      // NOUVEAU FORMAT : Utiliser les données par destinataire
      const perRecipient = notificationsTracking.perRecipient || {};
      
      // Parcourir chaque destinataire et agréger les résultats
      Object.entries(perRecipient).forEach(([recipientId, recipientData]: [string, any]) => {
        // Analyser email pour ce destinataire
        if (recipientData.email) {
          aggregatedChannels.email.configured = true;
          aggregatedChannels.email.totalRecipients++;
          
          if (recipientData.email.sent && recipientData.email.status === 'sent') {
            aggregatedChannels.email.successCount++;
          } else if (recipientData.email.error || recipientData.email.status === 'failed') {
            aggregatedChannels.email.failedCount++;
          } else {
            aggregatedChannels.email.pendingCount++;
          }
          
          aggregatedChannels.email.recipients.push({
            recipientId,
            sent: recipientData.email.sent,
            status: recipientData.email.status,
            sentAt: recipientData.email.sentAt,
            error: recipientData.email.error,
            attempts: recipientData.email.attempts || 0,
            canRetry: (recipientData.email.retryCount || 0) < (recipientData.email.maxRetries || 3)
          });
        }
        
        // Analyser SMS pour ce destinataire
        if (recipientData.sms) {
          aggregatedChannels.sms.configured = true;
          aggregatedChannels.sms.totalRecipients++;
          
          if (recipientData.sms.sent && recipientData.sms.status === 'sent') {
            aggregatedChannels.sms.successCount++;
          } else if (recipientData.sms.error || recipientData.sms.status === 'failed') {
            aggregatedChannels.sms.failedCount++;
          } else {
            aggregatedChannels.sms.pendingCount++;
          }
          
          aggregatedChannels.sms.recipients.push({
            recipientId,
            sent: recipientData.sms.sent,
            status: recipientData.sms.status,
            sentAt: recipientData.sms.sentAt,
            error: recipientData.sms.error,
            attempts: recipientData.sms.attempts || 0,
            canRetry: (recipientData.sms.retryCount || 0) < (recipientData.sms.maxRetries || 3)
          });
        }
        
        // Analyser WhatsApp pour ce destinataire
        if (recipientData.whatsapp) {
          aggregatedChannels.whatsapp.configured = true;
          aggregatedChannels.whatsapp.totalRecipients++;
          
          if (recipientData.whatsapp.sent && recipientData.whatsapp.status === 'sent') {
            aggregatedChannels.whatsapp.successCount++;
          } else if (recipientData.whatsapp.error || recipientData.whatsapp.status === 'failed') {
            aggregatedChannels.whatsapp.failedCount++;
          } else {
            aggregatedChannels.whatsapp.pendingCount++;
          }
          
          aggregatedChannels.whatsapp.recipients.push({
            recipientId,
            sent: recipientData.whatsapp.sent,
            status: recipientData.whatsapp.status,
            sentAt: recipientData.whatsapp.sentAt,
            error: recipientData.whatsapp.error,
            attempts: recipientData.whatsapp.attempts || 0,
            canRetry: (recipientData.whatsapp.retryCount || 0) < (recipientData.whatsapp.maxRetries || 3)
          });
        }
      });
    } else if (notificationsTracking) {
      // FORMAT LEGACY : Compatibilité descendante
      console.log('[BULLETIN_DISTRIBUTION_STATUS] Using legacy format compatibility mode');
      
      if (notificationsTracking.email) {
        aggregatedChannels.email.configured = true;
        aggregatedChannels.email.totalRecipients = 1;
        if (notificationsTracking.email.sent) {
          aggregatedChannels.email.successCount = 1;
        } else {
          aggregatedChannels.email.failedCount = 1;
        }
      }
      
      if (notificationsTracking.sms) {
        aggregatedChannels.sms.configured = true;
        aggregatedChannels.sms.totalRecipients = 1;
        if (notificationsTracking.sms.sent) {
          aggregatedChannels.sms.successCount = 1;
        } else {
          aggregatedChannels.sms.failedCount = 1;
        }
      }
      
      if (notificationsTracking.whatsapp) {
        aggregatedChannels.whatsapp.configured = true;
        aggregatedChannels.whatsapp.totalRecipients = 1;
        if (notificationsTracking.whatsapp.sent) {
          aggregatedChannels.whatsapp.successCount = 1;
        } else {
          aggregatedChannels.whatsapp.failedCount = 1;
        }
      }
    }
    
    // Calculer les taux de succès pour chaque canal
    Object.keys(aggregatedChannels).forEach(channel => {
      const channelData = aggregatedChannels[channel as keyof typeof aggregatedChannels];
      const totalAttempts = channelData.successCount + channelData.failedCount;
      channelData.successRate = totalAttempts > 0 
        ? Math.round((channelData.successCount / totalAttempts) * 100)
        : 0;
    });
    
    // Créer un statut détaillé avec agrégats précis
    const distributionStatus = {
      bulletinInfo: {
        id: bulletinData.id,
        studentId: bulletinData.studentId,
        studentName: bulletinData.studentName,
        className: bulletinData.className,
        term: bulletinData.term,
        academicYear: bulletinData.academicYear,
        generalAverage: bulletinData.generalAverage,
        status: bulletinData.status,
        sentAt: bulletinData.sentAt
      },
      distributionTracking: {
        format: isNewFormat ? 'perRecipient' : 'legacy',
        hasNotifications: !!notificationsTracking,
        lastUpdated: isNewFormat 
          ? notificationsTracking.summary?.lastUpdated 
          : notificationsTracking?.lastUpdated || null,
        
        // Agrégats précis par canal
        channels: aggregatedChannels,
        
        // Summary global du nouveau format si disponible
        globalSummary: isNewFormat ? {
          totalRecipients: notificationsTracking.summary?.totalRecipients || 0,
          totalNotificationsSent: notificationsTracking.summary?.totalNotificationsSent || 0,
          totalNotificationsFailed: notificationsTracking.summary?.totalNotificationsFailed || 0,
          overallSuccessRate: notificationsTracking.summary?.overallSuccessRate || 0,
          failedRecipients: notificationsTracking.summary?.failedRecipients || []
        } : null,
        
        // Détails par destinataire (nouveau format uniquement)
        recipientDetails: isNewFormat ? notificationsTracking.perRecipient : null
      }
    };

    console.log('[BULLETIN_DISTRIBUTION_STATUS] ✅ Distribution status retrieved for bulletin:', bulletinId);
    console.log('[BULLETIN_DISTRIBUTION_STATUS] Aggregated channels:', Object.keys(aggregatedChannels)
      .map(channel => `${channel}: ${aggregatedChannels[channel as keyof typeof aggregatedChannels].successCount}/${aggregatedChannels[channel as keyof typeof aggregatedChannels].totalRecipients} (${aggregatedChannels[channel as keyof typeof aggregatedChannels].successRate}%)`)
      .join(', '));

    res.json({
      success: true,
      message: 'Distribution status retrieved successfully',
      data: distributionStatus
    });

  } catch (error: any) {
    console.error('[BULLETIN_DISTRIBUTION_STATUS] ❌ Error fetching distribution status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch distribution status',
      error: error.message
    });
  }
});

// ===== ROUTE STATISTIQUES DE DISTRIBUTION =====
// GET /api/comprehensive-bulletins/distribution-statistics
// Retourner les statistiques globales de distribution par école/classe/trimestre
router.get('/distribution-statistics', requireAuth, requireDirectorAuth, async (req, res) => {
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

    console.log('[BULLETIN_DISTRIBUTION_STATS] 📊 Fetching distribution statistics for school:', schoolId);

    // Construire les conditions WHERE
    let whereConditions = [eq(bulletinComprehensive.schoolId, schoolId)];
    
    if (classId) {
      whereConditions.push(eq(bulletinComprehensive.classId, parseInt(classId as string)));
    }
    if (term) {
      whereConditions.push(eq(bulletinComprehensive.term, term as string));
    }
    if (academicYear) {
      whereConditions.push(eq(bulletinComprehensive.academicYear, academicYear as string));
    }

    // Récupérer tous les bulletins avec données de tracking
    const bulletins = await db.select({
      id: bulletinComprehensive.id,
      studentId: bulletinComprehensive.studentId,
      classId: bulletinComprehensive.classId,
      className: classes.name,
      term: bulletinComprehensive.term,
      academicYear: bulletinComprehensive.academicYear,
      status: bulletinComprehensive.status,
      notificationsSent: bulletinComprehensive.notificationsSent,
      sentAt: bulletinComprehensive.sentAt,
      createdAt: bulletinComprehensive.createdAt
    })
    .from(bulletinComprehensive)
    .leftJoin(classes, eq(bulletinComprehensive.classId, classes.id))
    .where(and(...whereConditions));

    // Analyser les statistiques de distribution
    const totalBulletins = bulletins.length;
    let distributionStats = {
      totalBulletins,
      bulletinsWithNotifications: 0,
      emailStats: {
        totalSent: 0,
        totalFailed: 0,
        totalPending: 0,
        successRate: 0
      },
      smsStats: {
        totalSent: 0,
        totalFailed: 0,
        totalPending: 0,
        successRate: 0
      },
      whatsappStats: {
        totalSent: 0,
        totalFailed: 0,
        totalPending: 0,
        successRate: 0
      },
      overallStats: {
        totalNotificationsSent: 0,
        totalNotificationsFailed: 0,
        overallSuccessRate: 0
      }
    };

    // Analyser chaque bulletin
    bulletins.forEach(bulletin => {
      const tracking = bulletin.notificationsSent as any;
      
      if (tracking) {
        distributionStats.bulletinsWithNotifications++;
        
        // Analyser email
        if (tracking.email) {
          if (tracking.email.sent) {
            distributionStats.emailStats.totalSent++;
            distributionStats.overallStats.totalNotificationsSent++;
          } else if (tracking.email.error) {
            distributionStats.emailStats.totalFailed++;
            distributionStats.overallStats.totalNotificationsFailed++;
          } else {
            distributionStats.emailStats.totalPending++;
          }
        }
        
        // Analyser SMS
        if (tracking.sms) {
          if (tracking.sms.sent) {
            distributionStats.smsStats.totalSent++;
            distributionStats.overallStats.totalNotificationsSent++;
          } else if (tracking.sms.error) {
            distributionStats.smsStats.totalFailed++;
            distributionStats.overallStats.totalNotificationsFailed++;
          } else {
            distributionStats.smsStats.totalPending++;
          }
        }
        
        // Analyser WhatsApp
        if (tracking.whatsapp) {
          if (tracking.whatsapp.sent) {
            distributionStats.whatsappStats.totalSent++;
            distributionStats.overallStats.totalNotificationsSent++;
          } else if (tracking.whatsapp.error) {
            distributionStats.whatsappStats.totalFailed++;
            distributionStats.overallStats.totalNotificationsFailed++;
          } else {
            distributionStats.whatsappStats.totalPending++;
          }
        }
      }
    });

    // Calculer les taux de réussite
    const totalEmailAttempts = distributionStats.emailStats.totalSent + distributionStats.emailStats.totalFailed;
    const totalSmsAttempts = distributionStats.smsStats.totalSent + distributionStats.smsStats.totalFailed;
    const totalWhatsappAttempts = distributionStats.whatsappStats.totalSent + distributionStats.whatsappStats.totalFailed;
    const totalOverallAttempts = distributionStats.overallStats.totalNotificationsSent + distributionStats.overallStats.totalNotificationsFailed;

    distributionStats.emailStats.successRate = totalEmailAttempts > 0 ? 
      Math.round((distributionStats.emailStats.totalSent / totalEmailAttempts) * 100) : 0;
    distributionStats.smsStats.successRate = totalSmsAttempts > 0 ? 
      Math.round((distributionStats.smsStats.totalSent / totalSmsAttempts) * 100) : 0;
    distributionStats.whatsappStats.successRate = totalWhatsappAttempts > 0 ? 
      Math.round((distributionStats.whatsappStats.totalSent / totalWhatsappAttempts) * 100) : 0;
    distributionStats.overallStats.overallSuccessRate = totalOverallAttempts > 0 ? 
      Math.round((distributionStats.overallStats.totalNotificationsSent / totalOverallAttempts) * 100) : 0;

    console.log('[BULLETIN_DISTRIBUTION_STATS] ✅ Distribution statistics calculated:', distributionStats);

    res.json({
      success: true,
      message: 'Distribution statistics retrieved successfully',
      data: {
        filters: {
          schoolId,
          classId: classId ? parseInt(classId as string) : null,
          term: term || null,
          academicYear: academicYear || null
        },
        statistics: distributionStats
      }
    });

  } catch (error: any) {
    console.error('[BULLETIN_DISTRIBUTION_STATS] ❌ Error fetching distribution statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch distribution statistics',
      error: error.message
    });
  }
});

// ===== BULK DIGITAL SIGNATURE ROUTE =====
// Route: POST /api/comprehensive-bulletins/bulk-sign
// Purpose: Allow directors to digitally sign multiple approved bulletins at once
// Input: array of bulletin IDs + signature data (base64 or URL)
// Output: Updates headmasterVisa field with signature and timestamp
router.post('/bulk-sign', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required - invalid user context'
      });
    }

    const { bulletinIds, signature, signerName } = req.body;

    console.log('[BULK_SIGNATURE] 🖊️ Processing bulk signature request:', { 
      bulletinCount: bulletinIds?.length, 
      signerId: user.id, 
      signerName: signerName || user.email,
      school: schoolId 
    });

    // Validation
    if (!bulletinIds || !Array.isArray(bulletinIds) || bulletinIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Bulletin IDs array is required and cannot be empty'
      });
    }

    if (!signature || typeof signature !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Signature data is required (base64 string or URL)'
      });
    }

    // Verify all bulletins exist and belong to the school
    const existingBulletins = await db.select({
      id: bulletinComprehensive.id,
      studentId: bulletinComprehensive.studentId,
      status: bulletinComprehensive.status,
      headmasterVisa: bulletinComprehensive.headmasterVisa
    })
      .from(bulletinComprehensive)
      .where(and(
        inArray(bulletinComprehensive.id, bulletinIds.map(id => parseInt(id))),
        eq(bulletinComprehensive.schoolId, schoolId),
        eq(bulletinComprehensive.status, 'approved') // Only sign approved bulletins
      ));

    console.log('[BULK_SIGNATURE] 📋 Found bulletins to sign:', existingBulletins.length);

    if (existingBulletins.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No approved bulletins found for signing'
      });
    }

    // Prepare signature data
    const signatureData = {
      name: signerName || `${user.firstName} ${user.lastName}` || user.email,
      date: new Date().toISOString(),
      signatureUrl: signature,
      signedAt: new Date().toISOString(),
      signedBy: user.id
    };

    console.log('[BULK_SIGNATURE] ✍️ Signature data prepared:', {
      signerName: signatureData.name,
      signatureLength: signature.length,
      bulletinsToSign: existingBulletins.length
    });

    // Update all bulletins with signature
    const updateResults = [];
    const errors = [];

    for (const bulletin of existingBulletins) {
      try {
        // Update headmasterVisa field with signature
        const result = await db.update(bulletinComprehensive)
          .set({
            headmaster_visa: signatureData,
            lastModifiedBy: user.id,
            updatedAt: new Date()
          } as any)
          .where(eq(bulletinComprehensive.id, bulletin.id))
          .returning({
            id: bulletinComprehensive.id,
            studentId: bulletinComprehensive.studentId,
            headmasterVisa: bulletinComprehensive.headmasterVisa
          });

        if (result.length > 0) {
          updateResults.push({
            bulletinId: bulletin.id,
            studentId: bulletin.studentId,
            status: 'signed',
            signedAt: signatureData.signedAt
          });
          
          console.log(`[BULK_SIGNATURE] ✅ Signed bulletin ${bulletin.id} for student ${bulletin.studentId}`);
        } else {
          errors.push(`Failed to sign bulletin ${bulletin.id}`);
        }

      } catch (error: any) {
        console.error(`[BULK_SIGNATURE] ❌ Error signing bulletin ${bulletin.id}:`, error);
        errors.push(`Bulletin ${bulletin.id}: ${error.message}`);
      }
    }

    // Calculate success statistics
    const successCount = updateResults.length;
    const totalRequested = bulletinIds.length;
    const foundCount = existingBulletins.length;
    const successRate = foundCount > 0 ? Math.round((successCount / foundCount) * 100) : 0;

    console.log('[BULK_SIGNATURE] 📊 Bulk signature completed:', {
      requested: totalRequested,
      found: foundCount,
      signed: successCount,
      errors: errors.length,
      successRate: `${successRate}%`
    });

    // Return comprehensive response
    res.json({
      success: true,
      message: `Successfully signed ${successCount} bulletins`,
      data: {
        summary: {
          totalRequested,
          bulletsFound: foundCount,
          successfullySigned: successCount,
          errorCount: errors.length,
          successRate
        },
        signedBulletins: updateResults,
        signature: {
          signerName: signatureData.name,
          signedAt: signatureData.signedAt,
          signaturePreview: signature.substring(0, 50) + '...' // Preview only
        },
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error: any) {
    console.error('[BULK_SIGNATURE] ❌ Critical error in bulk signature:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk signature',
      error: error.message
    });
  }
});

// Get signed bulletins for a director (with signature status)
router.get('/signed-bulletins', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required - invalid user context'
      });
    }

    const { classId, term, academicYear, page = 1, limit = 50 } = req.query;

    console.log('[SIGNED_BULLETINS] 📋 Fetching signed bulletins:', { 
      classId, 
      term, 
      academicYear, 
      schoolId,
      pagination: { page, limit }
    });

    // Build query conditions
    const whereConditions = [
      eq(bulletinComprehensive.schoolId, schoolId),
      eq(bulletinComprehensive.status, 'approved'),
      sql`${bulletinComprehensive.headmasterVisa} IS NOT NULL` // Only bulletins with signature
    ];

    if (classId) {
      whereConditions.push(eq(bulletinComprehensive.classId, parseInt(classId as string)));
    }
    if (term) {
      whereConditions.push(eq(bulletinComprehensive.term, term as string));
    }
    if (academicYear) {
      whereConditions.push(eq(bulletinComprehensive.academicYear, academicYear as string));
    }

    // Get signed bulletins with student info
    const signedBulletins = await db.select({
      id: bulletinComprehensive.id,
      studentId: bulletinComprehensive.studentId,
      classId: bulletinComprehensive.classId,
      term: bulletinComprehensive.term,
      academicYear: bulletinComprehensive.academicYear,
      status: bulletinComprehensive.status,
      headmasterVisa: bulletinComprehensive.headmasterVisa,
      createdAt: bulletinComprehensive.createdAt,
      updatedAt: bulletinComprehensive.updatedAt,
      // Student info
      studentFirstName: users.firstName,
      studentLastName: users.lastName,
      // Class info
      className: classes.name
    })
      .from(bulletinComprehensive)
      .leftJoin(users, eq(bulletinComprehensive.studentId, users.id))
      .leftJoin(classes, eq(bulletinComprehensive.classId, classes.id))
      .where(and(...whereConditions))
      .orderBy(sql`${bulletinComprehensive.updatedAt} DESC`)
      .limit(parseInt(limit as string))
      .offset((parseInt(page as string) - 1) * parseInt(limit as string));

    // Get total count for pagination
    const totalCount = await db.select({ count: sql<number>`COUNT(*)` })
      .from(bulletinComprehensive)
      .where(and(...whereConditions));

    // Format response data
    const formattedBulletins = signedBulletins.map(bulletin => ({
      id: bulletin.id,
      studentId: bulletin.studentId,
      studentName: `${bulletin.studentFirstName || ''} ${bulletin.studentLastName || ''}`.trim(),
      classId: bulletin.classId,
      className: bulletin.className,
      term: bulletin.term,
      academicYear: bulletin.academicYear,
      status: bulletin.status,
      signature: bulletin.headmasterVisa,
      signedAt: bulletin.headmasterVisa ? (bulletin.headmasterVisa as any).signedAt : bulletin.updatedAt,
      createdAt: bulletin.createdAt,
      updatedAt: bulletin.updatedAt
    }));

    console.log('[SIGNED_BULLETINS] ✅ Retrieved signed bulletins:', formattedBulletins.length);

    res.json({
      success: true,
      data: {
        bulletins: formattedBulletins,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalCount[0]?.count || 0,
          totalPages: Math.ceil((totalCount[0]?.count || 0) / parseInt(limit as string))
        },
        filters: {
          classId: classId ? parseInt(classId as string) : null,
          term: term || null,
          academicYear: academicYear || null
        }
      }
    });

  } catch (error: any) {
    console.error('[SIGNED_BULLETINS] ❌ Error fetching signed bulletins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch signed bulletins',
      error: error.message
    });
  }
});

// ===== BULK SIGNATURE ENDPOINT WITH COMPLETE SECURITY VALIDATION =====

// Zod schema for bulk signature validation
const bulkSignatureSchema = z.object({
  bulletinIds: z.array(z.number().int().positive("Bulletin ID must be a positive integer"))
    .min(1, "At least one bulletin ID is required")
    .max(100, "Maximum 100 bulletins can be signed at once"),
  signature: z.string()
    .min(1, "Signature data is required")
    .refine((val) => {
      // Validate base64 format
      const base64Regex = /^data:image\/(png|jpg|jpeg|gif);base64,([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
      return base64Regex.test(val);
    }, "Invalid base64 image format"),
  signerName: z.string()
    .min(1, "Signer name is required")
    .max(100, "Signer name must be less than 100 characters")
    .refine((val) => {
      // Sanitize signer name - only allow letters, numbers, spaces, and common punctuation
      const allowedChars = /^[a-zA-Z0-9\s\-.'àáâäåèéêëìíîïòóôöùúûü]+$/;
      return allowedChars.test(val);
    }, "Signer name contains invalid characters")
});

// Helper function to validate and decode base64 signature
const validateAndDecodeSignature = (signatureBase64: string): { buffer: Buffer; mimeType: string; size: number } => {
  try {
    // Extract MIME type and data
    const matches = signatureBase64.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid base64 image format');
    }

    const mimeType = `image/${matches[1].toLowerCase()}`;
    const base64Data = matches[2];
    
    // Validate MIME type
    const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new Error(`Unsupported image type. Allowed: ${allowedMimeTypes.join(', ')}`);
    }

    // Decode base64
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Validate size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (buffer.length > maxSize) {
      throw new Error(`Signature file too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
    }

    // Validate minimum size (prevent empty files)
    if (buffer.length < 100) {
      throw new Error('Signature file too small or corrupted');
    }

    return { buffer, mimeType, size: buffer.length };

  } catch (error: any) {
    throw new Error(`Signature validation failed: ${error.message}`);
  }
};

// Helper function to sanitize and generate secure file path
const generateSecureSignaturePath = (userId: number, schoolId: number): string => {
  const timestamp = Date.now();
  const randomHash = crypto.randomBytes(16).toString('hex');
  
  // Sanitize IDs
  const cleanUserId = Math.abs(parseInt(userId.toString()));
  const cleanSchoolId = Math.abs(parseInt(schoolId.toString()));
  
  // Create secure filename with timestamp and hash
  const filename = `signature_${cleanSchoolId}_${cleanUserId}_${timestamp}_${randomHash}.png`;
  
  // Create directory structure
  const signatureDir = path.join('public', 'uploads', 'signatures');
  const fullPath = path.join(signatureDir, filename);
  
  // Ensure directory exists
  if (!fs.existsSync(signatureDir)) {
    fs.mkdirSync(signatureDir, { recursive: true });
  }
  
  return fullPath;
};

// Helper function to save signature file securely
const saveSignatureFile = async (signatureBuffer: Buffer, userId: number, schoolId: number): Promise<string> => {
  try {
    const filePath = generateSecureSignaturePath(userId, schoolId);
    
    // Write file with proper permissions
    fs.writeFileSync(filePath, signatureBuffer);
    fs.chmodSync(filePath, 0o644); // Read-write for owner, read for others
    
    // Return URL path (relative to public directory)
    const urlPath = filePath.replace(/^public\//, '/');
    
    console.log('[SIGNATURE_FILE] ✅ Signature saved:', { 
      path: filePath, 
      url: urlPath, 
      size: signatureBuffer.length,
      userId,
      schoolId 
    });
    
    return urlPath;
    
  } catch (error: any) {
    console.error('[SIGNATURE_FILE] ❌ Error saving signature file:', error);
    throw new Error(`Failed to save signature file: ${error.message}`);
  }
};

// Bulk signature endpoint with complete security validation
router.post('/bulk-sign', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const userId = user.id;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required - invalid user context'
      });
    }

    console.log('[BULK_SIGN] 🖊️  Processing bulk signature request:', {
      userId,
      schoolId,
      requestSize: JSON.stringify(req.body).length
    });

    // Validate request body with Zod
    const validationResult = bulkSignatureSchema.safeParse(req.body);
    if (!validationResult.success) {
      console.log('[BULK_SIGN] ❌ Validation failed:', validationResult.error.errors);
      return res.status(400).json({
        success: false,
        message: 'Request validation failed',
        errors: validationResult.error.errors
      });
    }

    const { bulletinIds, signature, signerName } = validationResult.data;

    // Validate and decode signature
    let signatureData: { buffer: Buffer; mimeType: string; size: number };
    try {
      signatureData = validateAndDecodeSignature(signature);
    } catch (error: any) {
      console.log('[BULK_SIGN] ❌ Signature validation failed:', error.message);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Verify bulletins exist and belong to the user's school (CRITICAL SECURITY CHECK)
    const bulletinsToSign = await db.select({
      id: bulletinComprehensive.id,
      studentId: bulletinComprehensive.studentId,
      classId: bulletinComprehensive.classId,
      schoolId: bulletinComprehensive.schoolId,
      status: bulletinComprehensive.status,
      headmasterVisa: bulletinComprehensive.headmasterVisa
    })
      .from(bulletinComprehensive)
      .where(and(
        inArray(bulletinComprehensive.id, bulletinIds),
        eq(bulletinComprehensive.schoolId, schoolId), // CRITICAL: Scope by school
        eq(bulletinComprehensive.status, 'approved') // Only approved bulletins can be signed
      ));

    // Security check: Ensure all requested bulletins exist and belong to school
    if (bulletinsToSign.length !== bulletinIds.length) {
      const foundIds = bulletinsToSign.map(b => b.id);
      const missingIds = bulletinIds.filter(id => !foundIds.includes(id));
      
      console.log('[BULK_SIGN] 🚫 Security violation - invalid bulletin IDs:', {
        requestedIds: bulletinIds,
        foundIds,
        missingIds,
        schoolId,
        userId
      });
      
      return res.status(403).json({
        success: false,
        message: 'Access denied: Some bulletins do not exist or do not belong to your school',
        invalidIds: missingIds
      });
    }

    // Check if any bulletins are already signed
    const alreadySigned = bulletinsToSign.filter(b => b.headmasterVisa !== null);
    if (alreadySigned.length > 0) {
      console.log('[BULK_SIGN] ⚠️  Some bulletins already signed:', alreadySigned.map(b => b.id));
    }

    // Save signature file
    let signatureUrl: string;
    try {
      signatureUrl = await saveSignatureFile(signatureData.buffer, userId, schoolId);
    } catch (error: any) {
      console.error('[BULK_SIGN] ❌ Error saving signature file:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save signature file',
        error: error.message
      });
    }

    // Prepare signature visa data (using 'date' to match existing schema)
    const signatureVisa = {
      name: signerName,
      date: new Date().toISOString(),
      signatureUrl: signatureUrl
    };

    // Update all bulletins with signature
    const updateResult = await db.update(bulletinComprehensive)
      .set({
        headmaster_visa: signatureVisa,
        status: 'signed', // Update status to signed
        updatedAt: new Date()
      } as any)
      .where(inArray(bulletinComprehensive.id, bulletinIds))
      .returning({ id: bulletinComprehensive.id });

    const signedCount = updateResult.length;

    console.log('[BULK_SIGN] ✅ Bulk signature completed:', {
      totalRequested: bulletinIds.length,
      signedCount,
      alreadySignedCount: alreadySigned.length,
      signatureUrl,
      signerName,
      userId,
      schoolId
    });

    res.json({
      success: true,
      message: `Successfully signed ${signedCount} bulletins`,
      data: {
        signedBulletinIds: updateResult.map(r => r.id),
        totalSigned: signedCount,
        alreadySigned: alreadySigned.length,
        signature: {
          signerName,
          signedAt: signatureVisa.date,
          signatureUrl
        },
        summary: {
          requested: bulletinIds.length,
          newlySigned: signedCount - alreadySigned.length,
          previouslySigned: alreadySigned.length,
          failed: bulletinIds.length - signedCount
        }
      }
    });

  } catch (error: any) {
    console.error('[BULK_SIGN] ❌ Bulk signature error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk signature',
      error: error.message
    });
  }
});

// ===== REPORTING ROUTES =====
// Comprehensive reporting system for bulletin distribution and history tracking

// Get comprehensive overview of bulletin system
router.get('/reports/overview', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required - invalid user context'
      });
    }

    const { term, academicYear, classId, startDate, endDate } = req.query;

    console.log('[REPORTS_OVERVIEW] 📊 Generating overview report:', { 
      schoolId, 
      filters: { term, academicYear, classId, startDate, endDate } 
    });

    // Base query conditions
    let whereConditions = [eq(bulletinComprehensive.schoolId, schoolId)];
    
    if (term) whereConditions.push(eq(bulletinComprehensive.term, term as string));
    if (academicYear) whereConditions.push(eq(bulletinComprehensive.academicYear, academicYear as string));
    if (classId) whereConditions.push(eq(bulletinComprehensive.classId, parseInt(classId as string)));
    if (startDate && endDate) {
      whereConditions.push(
        sql`${bulletinComprehensive.createdAt} >= ${startDate}::timestamp`,
        sql`${bulletinComprehensive.createdAt} <= ${endDate}::timestamp`
      );
    }

    // Get bulletin status counts
    const statusCounts = await db.select({
      status: bulletinComprehensive.status,
      count: sql<number>`COUNT(*)`
    })
    .from(bulletinComprehensive)
    .where(and(...whereConditions))
    .groupBy(bulletinComprehensive.status);

    // Get distribution success rates
    const distributionStats = await db.select({
      bulletinId: bulletinComprehensive.id,
      status: bulletinComprehensive.status,
      notificationsSent: bulletinComprehensive.notificationsSent,
      sentAt: bulletinComprehensive.sentAt,
      createdAt: bulletinComprehensive.createdAt,
      approvedAt: bulletinComprehensive.approvedAt
    })
    .from(bulletinComprehensive)
    .where(and(...whereConditions));

    // Calculate metrics
    const totalBulletins = distributionStats.length;
    const statusBreakdown = {
      draft: statusCounts.find(s => s.status === 'draft')?.count || 0,
      submitted: statusCounts.find(s => s.status === 'submitted')?.count || 0,
      approved: statusCounts.find(s => s.status === 'approved')?.count || 0,
      signed: statusCounts.find(s => s.status === 'signed')?.count || 0,
      sent: statusCounts.find(s => s.status === 'sent')?.count || 0,
    };

    // Calculate distribution success rates
    let emailSuccess = 0, smsSuccess = 0, whatsappSuccess = 0;
    let totalEmailAttempts = 0, totalSmsAttempts = 0, totalWhatsappAttempts = 0;
    let totalProcessingTime = 0;
    let processedBulletins = 0;

    distributionStats.forEach(bulletin => {
      // Parse notification data
      const notifications = bulletin.notificationsSent as any;
      
      if (notifications?.summary) {
        emailSuccess += notifications.summary.emailSuccessCount || 0;
        smsSuccess += notifications.summary.smsSuccessCount || 0;
        whatsappSuccess += notifications.summary.whatsappSuccessCount || 0;
        totalEmailAttempts += (notifications.summary.emailSuccessCount || 0) + (notifications.summary.emailFailedCount || 0);
        totalSmsAttempts += (notifications.summary.smsSuccessCount || 0) + (notifications.summary.smsFailedCount || 0);
        totalWhatsappAttempts += (notifications.summary.whatsappSuccessCount || 0) + (notifications.summary.whatsappFailedCount || 0);
      }

      // Calculate processing time (approved to sent)
      if (bulletin.approvedAt && bulletin.sentAt) {
        const processingTime = new Date(bulletin.sentAt).getTime() - new Date(bulletin.approvedAt).getTime();
        totalProcessingTime += processingTime;
        processedBulletins++;
      }
    });

    const averageProcessingTime = processedBulletins > 0 ? totalProcessingTime / processedBulletins : 0;

    // Get class performance data
    const classTerm = term as string || 'T1';
    const classYear = academicYear as string || '2024-2025';
    
    const classPerformance = await db.execute(sql`
      SELECT 
        bc.class_id,
        c.name as class_name,
        COUNT(*) as total_bulletins,
        COUNT(CASE WHEN bc.status = 'sent' THEN 1 END) as sent_bulletins,
        AVG(bc.general_average) as average_grade,
        COUNT(CASE WHEN bc.status = 'draft' THEN 1 END) as draft_count,
        COUNT(CASE WHEN bc.status = 'approved' THEN 1 END) as pending_count
      FROM bulletin_comprehensive bc
      LEFT JOIN classes c ON c.id = bc.class_id
      WHERE bc.school_id = ${schoolId}
        ${term ? sql`AND bc.term = ${classTerm}` : sql``}
        ${academicYear ? sql`AND bc.academic_year = ${classYear}` : sql``}
      GROUP BY bc.class_id, c.name
      ORDER BY total_bulletins DESC
    `);

    // Recent activity (last 7 days)
    const recentActivity = await db.select({
      id: bulletinComprehensive.id,
      studentId: bulletinComprehensive.studentId,
      classId: bulletinComprehensive.classId,
      status: bulletinComprehensive.status,
      createdAt: bulletinComprehensive.createdAt,
      approvedAt: bulletinComprehensive.approvedAt,
      sentAt: bulletinComprehensive.sentAt,
      lastModifiedBy: bulletinComprehensive.lastModifiedBy
    })
    .from(bulletinComprehensive)
    .where(and(
      eq(bulletinComprehensive.schoolId, schoolId),
      sql`${bulletinComprehensive.updatedAt} >= NOW() - INTERVAL '7 days'`
    ))
    .orderBy(sql`${bulletinComprehensive.updatedAt} DESC`)
    .limit(20);

    const overviewData = {
      totalBulletins,
      statusBreakdown,
      distributionRates: {
        email: totalEmailAttempts > 0 ? Math.round((emailSuccess / totalEmailAttempts) * 100) : 0,
        sms: totalSmsAttempts > 0 ? Math.round((smsSuccess / totalSmsAttempts) * 100) : 0,
        whatsapp: totalWhatsappAttempts > 0 ? Math.round((whatsappSuccess / totalWhatsappAttempts) * 100) : 0,
        overall: (totalEmailAttempts + totalSmsAttempts + totalWhatsappAttempts) > 0 
          ? Math.round(((emailSuccess + smsSuccess + whatsappSuccess) / (totalEmailAttempts + totalSmsAttempts + totalWhatsappAttempts)) * 100)
          : 0
      },
      averageProcessingTime: Math.round(averageProcessingTime / (1000 * 60 * 60)), // Hours
      classPerformance: classPerformance.rows,
      recentActivity,
      generatedAt: new Date().toISOString()
    };

    console.log('[REPORTS_OVERVIEW] ✅ Overview report generated:', {
      totalBulletins,
      classCount: classPerformance.rows.length,
      recentActivityCount: recentActivity.length
    });

    res.json({
      success: true,
      data: overviewData
    });

  } catch (error: any) {
    console.error('[REPORTS_OVERVIEW] ❌ Error generating overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate overview report',
      error: error.message
    });
  }
});

// Get detailed distribution statistics
router.get('/reports/distribution-stats', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required - invalid user context'
      });
    }

    const { term, academicYear, classId, channel } = req.query;

    console.log('[DISTRIBUTION_STATS] 📈 Generating distribution statistics:', { 
      schoolId, 
      filters: { term, academicYear, classId, channel } 
    });

    // Base query conditions
    let whereConditions = [
      eq(bulletinComprehensive.schoolId, schoolId),
      sql`${bulletinComprehensive.status} IN ('approved', 'signed', 'sent')`
    ];
    
    if (term) whereConditions.push(eq(bulletinComprehensive.term, term as string));
    if (academicYear) whereConditions.push(eq(bulletinComprehensive.academicYear, academicYear as string));
    if (classId) whereConditions.push(eq(bulletinComprehensive.classId, parseInt(classId as string)));

    // Get detailed distribution data
    const distributionData = await db.select({
      id: bulletinComprehensive.id,
      studentId: bulletinComprehensive.studentId,
      classId: bulletinComprehensive.classId,
      status: bulletinComprehensive.status,
      notificationsSent: bulletinComprehensive.notificationsSent,
      sentAt: bulletinComprehensive.sentAt,
      approvedAt: bulletinComprehensive.approvedAt,
      createdAt: bulletinComprehensive.createdAt,
      term: bulletinComprehensive.term,
      academicYear: bulletinComprehensive.academicYear
    })
    .from(bulletinComprehensive)
    .where(and(...whereConditions));

    // Analyze distribution patterns
    const channelStats = {
      email: { sent: 0, failed: 0, pending: 0, totalAttempts: 0 },
      sms: { sent: 0, failed: 0, pending: 0, totalAttempts: 0 },
      whatsapp: { sent: 0, failed: 0, pending: 0, totalAttempts: 0 }
    };

    const dailyDistribution: { [key: string]: { sent: number; failed: number } } = {};
    const classDistribution: { [key: string]: { sent: number; failed: number; total: number } } = {};
    const errorAnalysis: { [key: string]: number } = {};

    distributionData.forEach(bulletin => {
      const notifications = bulletin.notificationsSent as any;
      const day = bulletin.sentAt ? new Date(bulletin.sentAt).toISOString().split('T')[0] : 'pending';

      // Initialize daily stats
      if (!dailyDistribution[day]) {
        dailyDistribution[day] = { sent: 0, failed: 0 };
      }

      // Initialize class stats
      const classKey = `Class ${bulletin.classId}`;
      if (!classDistribution[classKey]) {
        classDistribution[classKey] = { sent: 0, failed: 0, total: 0 };
      }
      classDistribution[classKey].total++;

      if (notifications?.summary) {
        // Email stats
        channelStats.email.sent += notifications.summary.emailSuccessCount || 0;
        channelStats.email.failed += notifications.summary.emailFailedCount || 0;
        channelStats.email.totalAttempts += (notifications.summary.emailSuccessCount || 0) + (notifications.summary.emailFailedCount || 0);

        // SMS stats
        channelStats.sms.sent += notifications.summary.smsSuccessCount || 0;
        channelStats.sms.failed += notifications.summary.smsFailedCount || 0;
        channelStats.sms.totalAttempts += (notifications.summary.smsSuccessCount || 0) + (notifications.summary.smsFailedCount || 0);

        // WhatsApp stats
        channelStats.whatsapp.sent += notifications.summary.whatsappSuccessCount || 0;
        channelStats.whatsapp.failed += notifications.summary.whatsappFailedCount || 0;
        channelStats.whatsapp.totalAttempts += (notifications.summary.whatsappSuccessCount || 0) + (notifications.summary.whatsappFailedCount || 0);

        // Daily distribution
        const totalSuccess = (notifications.summary.emailSuccessCount || 0) + (notifications.summary.smsSuccessCount || 0) + (notifications.summary.whatsappSuccessCount || 0);
        const totalFailed = (notifications.summary.emailFailedCount || 0) + (notifications.summary.smsFailedCount || 0) + (notifications.summary.whatsappFailedCount || 0);
        
        if (bulletin.sentAt) {
          dailyDistribution[day].sent += totalSuccess;
          dailyDistribution[day].failed += totalFailed;
          classDistribution[classKey].sent += totalSuccess > 0 ? 1 : 0;
          classDistribution[classKey].failed += totalFailed > 0 ? 1 : 0;
        }

        // Error analysis
        if (notifications.summary.failedRecipients) {
          notifications.summary.failedRecipients.forEach((recipient: string) => {
            errorAnalysis[`Failed recipient: ${recipient}`] = (errorAnalysis[`Failed recipient: ${recipient}`] || 0) + 1;
          });
        }

        // Parse detailed recipient errors
        if (notifications.perRecipient) {
          Object.entries(notifications.perRecipient).forEach(([recipient, data]: [string, any]) => {
            ['email', 'sms', 'whatsapp'].forEach(channel => {
              if (data[channel]?.error) {
                const errorKey = `${channel.toUpperCase()}: ${data[channel].error}`;
                errorAnalysis[errorKey] = (errorAnalysis[errorKey] || 0) + 1;
              }
            });
          });
        }
      } else if (bulletin.status === 'approved' || bulletin.status === 'signed') {
        // Pending distribution
        channelStats.email.pending++;
        channelStats.sms.pending++;
        channelStats.whatsapp.pending++;
      }
    });

    // Calculate success rates
    const successRates = {
      email: channelStats.email.totalAttempts > 0 
        ? Math.round((channelStats.email.sent / channelStats.email.totalAttempts) * 100) 
        : 0,
      sms: channelStats.sms.totalAttempts > 0 
        ? Math.round((channelStats.sms.sent / channelStats.sms.totalAttempts) * 100) 
        : 0,
      whatsapp: channelStats.whatsapp.totalAttempts > 0 
        ? Math.round((channelStats.whatsapp.sent / channelStats.whatsapp.totalAttempts) * 100) 
        : 0
    };

    const distributionStatsData = {
      channelStats,
      successRates,
      dailyDistribution: Object.entries(dailyDistribution)
        .map(([date, stats]) => ({ date, ...stats }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      classDistribution: Object.entries(classDistribution)
        .map(([className, stats]) => ({ className, ...stats }))
        .sort((a, b) => b.total - a.total),
      errorAnalysis: Object.entries(errorAnalysis)
        .map(([error, count]) => ({ error, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10), // Top 10 errors
      summary: {
        totalBulletins: distributionData.length,
        totalSent: distributionData.filter(b => b.status === 'sent').length,
        totalPending: distributionData.filter(b => ['approved', 'signed'].includes(b.status || '')).length,
        overallSuccessRate: distributionData.length > 0 
          ? Math.round((distributionData.filter(b => b.status === 'sent').length / distributionData.length) * 100)
          : 0
      },
      generatedAt: new Date().toISOString()
    };

    console.log('[DISTRIBUTION_STATS] ✅ Distribution statistics generated:', {
      totalBulletins: distributionData.length,
      channelsAnalyzed: Object.keys(channelStats).length,
      errorTypesFound: Object.keys(errorAnalysis).length
    });

    res.json({
      success: true,
      data: distributionStatsData
    });

  } catch (error: any) {
    console.error('[DISTRIBUTION_STATS] ❌ Error generating distribution stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate distribution statistics',
      error: error.message
    });
  }
});

// Get timeline of actions for bulletins
router.get('/reports/timeline', requireAuth, requireDirectorAuth, async (req, res) => {
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
      bulletinId, 
      studentId, 
      classId, 
      term, 
      academicYear, 
      startDate, 
      endDate,
      limit = '50',
      offset = '0'
    } = req.query;

    console.log('[TIMELINE_REPORT] 📅 Generating timeline report:', { 
      schoolId, 
      filters: { bulletinId, studentId, classId, term, academicYear, startDate, endDate }
    });

    // Base query conditions
    let whereConditions = [eq(bulletinComprehensive.schoolId, schoolId)];
    
    if (bulletinId) whereConditions.push(eq(bulletinComprehensive.id, parseInt(bulletinId as string)));
    if (studentId) whereConditions.push(eq(bulletinComprehensive.studentId, parseInt(studentId as string)));
    if (classId) whereConditions.push(eq(bulletinComprehensive.classId, parseInt(classId as string)));
    if (term) whereConditions.push(eq(bulletinComprehensive.term, term as string));
    if (academicYear) whereConditions.push(eq(bulletinComprehensive.academicYear, academicYear as string));
    
    if (startDate && endDate) {
      whereConditions.push(
        sql`${bulletinComprehensive.createdAt} >= ${startDate}::timestamp`,
        sql`${bulletinComprehensive.createdAt} <= ${endDate}::timestamp`
      );
    }

    // Get bulletin data with user information for timeline
    const timelineData = await db.select({
      id: bulletinComprehensive.id,
      studentId: bulletinComprehensive.studentId,
      classId: bulletinComprehensive.classId,
      term: bulletinComprehensive.term,
      academicYear: bulletinComprehensive.academicYear,
      status: bulletinComprehensive.status,
      createdAt: bulletinComprehensive.createdAt,
      submittedAt: bulletinComprehensive.submittedAt,
      approvedAt: bulletinComprehensive.approvedAt,
      sentAt: bulletinComprehensive.sentAt,
      updatedAt: bulletinComprehensive.updatedAt,
      approvedBy: bulletinComprehensive.approvedBy,
      enteredBy: bulletinComprehensive.enteredBy,
      lastModifiedBy: bulletinComprehensive.lastModifiedBy,
      headmasterVisa: bulletinComprehensive.headmasterVisa,
      notificationsSent: bulletinComprehensive.notificationsSent
    })
    .from(bulletinComprehensive)
    .where(and(...whereConditions))
    .orderBy(sql`${bulletinComprehensive.updatedAt} DESC`)
    .limit(parseInt(limit as string))
    .offset(parseInt(offset as string));

    // Get user names for timeline events
    const userIds = Array.from(new Set([
      ...timelineData.map(b => b.enteredBy).filter(id => id),
      ...timelineData.map(b => b.approvedBy).filter(id => id),
      ...timelineData.map(b => b.lastModifiedBy).filter(id => id)
    ]));

    const usersInfo = userIds.length > 0 ? await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      role: users.role
    })
    .from(users)
    .where(inArray(users.id, userIds)) : [];

    const userMap = usersInfo.reduce((map, user) => {
      map[user.id] = `${user.firstName} ${user.lastName} (${user.role})`;
      return map;
    }, {} as { [key: number]: string });

    // Transform data into timeline events
    const timeline = [];

    for (const bulletin of timelineData) {
      const events = [];

      // Creation event
      events.push({
        bulletinId: bulletin.id,
        studentId: bulletin.studentId,
        classId: bulletin.classId,
        term: bulletin.term,
        action: 'created',
        status: 'draft',
        timestamp: bulletin.createdAt,
        userId: bulletin.enteredBy,
        userName: bulletin.enteredBy ? userMap[bulletin.enteredBy] : 'System',
        description: 'Bulletin créé'
      });

      // Submission event
      if (bulletin.submittedAt) {
        events.push({
          bulletinId: bulletin.id,
          studentId: bulletin.studentId,
          classId: bulletin.classId,
          term: bulletin.term,
          action: 'submitted',
          status: 'submitted',
          timestamp: bulletin.submittedAt,
          userId: bulletin.lastModifiedBy,
          userName: bulletin.lastModifiedBy ? userMap[bulletin.lastModifiedBy] : 'System',
          description: 'Bulletin soumis pour approbation'
        });
      }

      // Approval event
      if (bulletin.approvedAt) {
        events.push({
          bulletinId: bulletin.id,
          studentId: bulletin.studentId,
          classId: bulletin.classId,
          term: bulletin.term,
          action: 'approved',
          status: 'approved',
          timestamp: bulletin.approvedAt,
          userId: bulletin.approvedBy,
          userName: bulletin.approvedBy ? userMap[bulletin.approvedBy] : 'System',
          description: 'Bulletin approuvé par le directeur'
        });
      }

      // Signature event
      if (bulletin.headmasterVisa) {
        const visa = bulletin.headmasterVisa as any;
        events.push({
          bulletinId: bulletin.id,
          studentId: bulletin.studentId,
          classId: bulletin.classId,
          term: bulletin.term,
          action: 'signed',
          status: 'signed',
          timestamp: visa.date || bulletin.updatedAt,
          userId: null,
          userName: visa.name || 'Chef d\'établissement',
          description: `Bulletin signé par ${visa.name || 'le chef d\'établissement'}`
        });
      }

      // Distribution events
      if (bulletin.sentAt && bulletin.notificationsSent) {
        const notifications = bulletin.notificationsSent as any;
        
        if (notifications.summary) {
          const successCount = (notifications.summary.emailSuccessCount || 0) + 
                             (notifications.summary.smsSuccessCount || 0) + 
                             (notifications.summary.whatsappSuccessCount || 0);
          const failedCount = (notifications.summary.emailFailedCount || 0) + 
                            (notifications.summary.smsFailedCount || 0) + 
                            (notifications.summary.whatsappFailedCount || 0);

          events.push({
            bulletinId: bulletin.id,
            studentId: bulletin.studentId,
            classId: bulletin.classId,
            term: bulletin.term,
            action: 'distributed',
            status: 'sent',
            timestamp: bulletin.sentAt,
            userId: null,
            userName: 'Système de notification',
            description: `Bulletin envoyé - Réussies: ${successCount}, Échecs: ${failedCount}`,
            metadata: {
              successCount,
              failedCount,
              channels: {
                email: {
                  success: notifications.summary.emailSuccessCount || 0,
                  failed: notifications.summary.emailFailedCount || 0
                },
                sms: {
                  success: notifications.summary.smsSuccessCount || 0,
                  failed: notifications.summary.smsFailedCount || 0
                },
                whatsapp: {
                  success: notifications.summary.whatsappSuccessCount || 0,
                  failed: notifications.summary.whatsappFailedCount || 0
                }
              }
            }
          });
        }
      }

      timeline.push(...events);
    }

    // Sort all events by timestamp
    timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Get total count for pagination
    const totalCount = await db.select({ count: sql<number>`COUNT(*)` })
      .from(bulletinComprehensive)
      .where(and(...whereConditions));

    const timelineReport = {
      timeline,
      pagination: {
        total: totalCount[0]?.count || 0,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: (parseInt(offset as string) + parseInt(limit as string)) < (totalCount[0]?.count || 0)
      },
      summary: {
        totalEvents: timeline.length,
        bulletinsAnalyzed: timelineData.length,
        actionTypes: Array.from(new Set(timeline.map(t => t.action))),
        dateRange: {
          earliest: timeline.length > 0 ? timeline[timeline.length - 1].timestamp : null,
          latest: timeline.length > 0 ? timeline[0].timestamp : null
        }
      },
      generatedAt: new Date().toISOString()
    };

    console.log('[TIMELINE_REPORT] ✅ Timeline report generated:', {
      totalEvents: timeline.length,
      bulletinsAnalyzed: timelineData.length,
      usersInvolved: usersInfo.length
    });

    res.json({
      success: true,
      data: timelineReport
    });

  } catch (error: any) {
    console.error('[TIMELINE_REPORT] ❌ Error generating timeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate timeline report',
      error: error.message
    });
  }
});

// Export reports in CSV or PDF format
router.get('/reports/export', requireAuth, requireDirectorAuth, async (req, res) => {
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
      format = 'csv', 
      reportType = 'overview',
      term,
      academicYear,
      classId,
      startDate,
      endDate
    } = req.query;

    console.log('[EXPORT_REPORT] 📤 Exporting report:', { 
      schoolId, 
      format, 
      reportType,
      filters: { term, academicYear, classId, startDate, endDate }
    });

    if (!['csv', 'pdf'].includes(format as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid export format. Must be csv or pdf'
      });
    }

    if (!['overview', 'distribution', 'timeline'].includes(reportType as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report type. Must be overview, distribution, or timeline'
      });
    }

    // Base query conditions
    let whereConditions = [eq(bulletinComprehensive.schoolId, schoolId)];
    
    if (term) whereConditions.push(eq(bulletinComprehensive.term, term as string));
    if (academicYear) whereConditions.push(eq(bulletinComprehensive.academicYear, academicYear as string));
    if (classId) whereConditions.push(eq(bulletinComprehensive.classId, parseInt(classId as string)));
    if (startDate && endDate) {
      whereConditions.push(
        sql`${bulletinComprehensive.createdAt} >= ${startDate}::timestamp`,
        sql`${bulletinComprehensive.createdAt} <= ${endDate}::timestamp`
      );
    }

    // Get data based on report type
    let reportData: any[] = [];
    let headers: string[] = [];
    let filename = '';

    if (reportType === 'overview') {
      const data = await db.select({
        id: bulletinComprehensive.id,
        studentId: bulletinComprehensive.studentId,
        classId: bulletinComprehensive.classId,
        term: bulletinComprehensive.term,
        academicYear: bulletinComprehensive.academicYear,
        status: bulletinComprehensive.status,
        generalAverage: bulletinComprehensive.generalAverage,
        createdAt: bulletinComprehensive.createdAt,
        approvedAt: bulletinComprehensive.approvedAt,
        sentAt: bulletinComprehensive.sentAt,
        notificationsSent: bulletinComprehensive.notificationsSent
      })
      .from(bulletinComprehensive)
      .where(and(...whereConditions))
      .orderBy(bulletinComprehensive.createdAt);

      headers = [
        'ID Bulletin', 'ID Étudiant', 'Classe', 'Trimestre', 'Année Scolaire',
        'Statut', 'Moyenne Générale', 'Date Création', 'Date Approbation', 'Date Envoi',
        'Email Réussi', 'SMS Réussi', 'WhatsApp Réussi'
      ];

      reportData = data.map(bulletin => {
        const notifications = bulletin.notificationsSent as any;
        const emailSuccess = notifications?.summary?.emailSuccessCount || 0;
        const smsSuccess = notifications?.summary?.smsSuccessCount || 0;
        const whatsappSuccess = notifications?.summary?.whatsappSuccessCount || 0;

        return [
          bulletin.id,
          bulletin.studentId,
          bulletin.classId,
          bulletin.term,
          bulletin.academicYear,
          bulletin.status,
          bulletin.generalAverage || '',
          bulletin.createdAt?.toISOString().split('T')[0] || '',
          bulletin.approvedAt?.toISOString().split('T')[0] || '',
          bulletin.sentAt?.toISOString().split('T')[0] || '',
          emailSuccess,
          smsSuccess,
          whatsappSuccess
        ];
      });

      filename = `bulletin_overview_${new Date().toISOString().split('T')[0]}`;

    } else if (reportType === 'distribution') {
      const data = await db.select({
        id: bulletinComprehensive.id,
        studentId: bulletinComprehensive.studentId,
        classId: bulletinComprehensive.classId,
        status: bulletinComprehensive.status,
        sentAt: bulletinComprehensive.sentAt,
        notificationsSent: bulletinComprehensive.notificationsSent
      })
      .from(bulletinComprehensive)
      .where(and(...whereConditions, sql`${bulletinComprehensive.status} IN ('approved', 'signed', 'sent')`))
      .orderBy(bulletinComprehensive.sentAt);

      headers = [
        'ID Bulletin', 'ID Étudiant', 'Classe', 'Statut', 'Date Envoi',
        'Email Tentatives', 'Email Réussies', 'SMS Tentatives', 'SMS Réussies',
        'WhatsApp Tentatives', 'WhatsApp Réussies', 'Destinataires Échoués'
      ];

      reportData = data.map(bulletin => {
        const notifications = bulletin.notificationsSent as any;
        const emailSuccess = notifications?.summary?.emailSuccessCount || 0;
        const emailFailed = notifications?.summary?.emailFailedCount || 0;
        const smsSuccess = notifications?.summary?.smsSuccessCount || 0;
        const smsFailed = notifications?.summary?.smsFailedCount || 0;
        const whatsappSuccess = notifications?.summary?.whatsappSuccessCount || 0;
        const whatsappFailed = notifications?.summary?.whatsappFailedCount || 0;
        const failedRecipients = notifications?.summary?.failedRecipients?.length || 0;

        return [
          bulletin.id,
          bulletin.studentId,
          bulletin.classId,
          bulletin.status,
          bulletin.sentAt?.toISOString().split('T')[0] || '',
          emailSuccess + emailFailed,
          emailSuccess,
          smsSuccess + smsFailed,
          smsSuccess,
          whatsappSuccess + whatsappFailed,
          whatsappSuccess,
          failedRecipients
        ];
      });

      filename = `distribution_stats_${new Date().toISOString().split('T')[0]}`;

    } else if (reportType === 'timeline') {
      // Get timeline data similar to timeline endpoint
      const data = await db.select({
        id: bulletinComprehensive.id,
        studentId: bulletinComprehensive.studentId,
        classId: bulletinComprehensive.classId,
        term: bulletinComprehensive.term,
        status: bulletinComprehensive.status,
        createdAt: bulletinComprehensive.createdAt,
        submittedAt: bulletinComprehensive.submittedAt,
        approvedAt: bulletinComprehensive.approvedAt,
        sentAt: bulletinComprehensive.sentAt,
        enteredBy: bulletinComprehensive.enteredBy,
        approvedBy: bulletinComprehensive.approvedBy
      })
      .from(bulletinComprehensive)
      .where(and(...whereConditions))
      .orderBy(bulletinComprehensive.createdAt);

      headers = [
        'ID Bulletin', 'ID Étudiant', 'Classe', 'Trimestre', 'Action',
        'Statut', 'Date Action', 'Utilisateur'
      ];

      reportData = [];
      data.forEach(bulletin => {
        // Creation event
        reportData.push([
          bulletin.id,
          bulletin.studentId,
          bulletin.classId,
          bulletin.term,
          'Création',
          'draft',
          bulletin.createdAt?.toISOString().split('T')[0] || '',
          bulletin.enteredBy || 'System'
        ]);

        // Submission event
        if (bulletin.submittedAt) {
          reportData.push([
            bulletin.id,
            bulletin.studentId,
            bulletin.classId,
            bulletin.term,
            'Soumission',
            'submitted',
            bulletin.submittedAt?.toISOString().split('T')[0] || '',
            'Enseignant'
          ]);
        }

        // Approval event
        if (bulletin.approvedAt) {
          reportData.push([
            bulletin.id,
            bulletin.studentId,
            bulletin.classId,
            bulletin.term,
            'Approbation',
            'approved',
            bulletin.approvedAt?.toISOString().split('T')[0] || '',
            bulletin.approvedBy || 'Directeur'
          ]);
        }

        // Distribution event
        if (bulletin.sentAt) {
          reportData.push([
            bulletin.id,
            bulletin.studentId,
            bulletin.classId,
            bulletin.term,
            'Distribution',
            'sent',
            bulletin.sentAt?.toISOString().split('T')[0] || '',
            'Système'
          ]);
        }
      });

      filename = `timeline_report_${new Date().toISOString().split('T')[0]}`;
    }

    if (format === 'csv') {
      // Generate CSV
      const csvContent = [
        headers.join(','),
        ...reportData.map(row => 
          row.map((cell: any) => 
            typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
          ).join(',')
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csvContent);

    } else if (format === 'pdf') {
      // For PDF, we would need a PDF library like jsPDF or puppeteer
      // For now, return a simple response indicating PDF generation would be implemented
      res.json({
        success: false,
        message: 'PDF export not yet implemented. Use CSV format for now.',
        suggestedFormat: 'csv'
      });
    }

    console.log('[EXPORT_REPORT] ✅ Report exported:', {
      format,
      reportType,
      recordCount: reportData.length,
      filename: `${filename}.${format}`
    });

  } catch (error: any) {
    console.error('[EXPORT_REPORT] ❌ Error exporting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
      error: error.message
    });
  }
});

// ===== REPORTING ROUTES =====
// Routes pour les rapports et statistiques du système de bulletins

// Route pour les statistiques overview (vue d'ensemble)
router.get('/reports/overview', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required - invalid user context'
      });
    }
    
    const { term, academicYear, classId, startDate, endDate } = req.query;

    console.log('[COMPREHENSIVE_REPORTS] 📊 Fetching overview report:', { 
      term, academicYear, classId, schoolId 
    });

    // Récupérer le total des bulletins générés
    const totalBulletinsQuery = await db.execute(sql`
      SELECT COUNT(*) as total
      FROM bulletin_comprehensive
      WHERE school_id = ${schoolId}
      ${term ? sql`AND term = ${term as string}` : sql``}
      ${academicYear ? sql`AND academic_year = ${academicYear as string}` : sql``}
      ${classId ? sql`AND class_id = ${parseInt(classId as string)}` : sql``}
      ${startDate ? sql`AND created_at >= ${startDate as string}` : sql``}
      ${endDate ? sql`AND created_at <= ${endDate as string}` : sql``}
    `);

    // Répartition par statut
    const statusBreakdownQuery = await db.execute(sql`
      SELECT 
        COALESCE(status, 'draft') as status,
        COUNT(*) as count
      FROM bulletin_comprehensive
      WHERE school_id = ${schoolId}
      ${term ? sql`AND term = ${term as string}` : sql``}
      ${academicYear ? sql`AND academic_year = ${academicYear as string}` : sql``}
      ${classId ? sql`AND class_id = ${parseInt(classId as string)}` : sql``}
      GROUP BY status
    `);

    // Calcul des taux de distribution par canal
    const distributionRatesQuery = await db.execute(sql`
      SELECT 
        COALESCE(distribution_channel, 'none') as channel,
        COUNT(*) as sent,
        AVG(CASE WHEN distribution_status = 'delivered' THEN 1 ELSE 0 END) * 100 as delivery_rate
      FROM bulletin_comprehensive
      WHERE school_id = ${schoolId} 
        AND distribution_status IS NOT NULL
      ${term ? sql`AND term = ${term as string}` : sql``}
      ${academicYear ? sql`AND academic_year = ${academicYear as string}` : sql``}
      GROUP BY distribution_channel
    `);

    // Performance par classe
    const classPerformanceQuery = await db.execute(sql`
      SELECT 
        c.name as class_name,
        c.id as class_id,
        COUNT(bc.id) as bulletins_generated,
        COALESCE(AVG(bc.overall_average), 0) as avg_grade,
        COUNT(CASE WHEN bc.distribution_status = 'delivered' THEN 1 END) as distributed
      FROM classes c
      LEFT JOIN bulletin_comprehensive bc ON c.id = bc.class_id 
        AND bc.school_id = ${schoolId}
        ${term ? sql`AND bc.term = ${term as string}` : sql``}
        ${academicYear ? sql`AND bc.academic_year = ${academicYear as string}` : sql``}
      WHERE c.school_id = ${schoolId}
      GROUP BY c.id, c.name
      HAVING COUNT(bc.id) > 0
      ORDER BY bulletins_generated DESC
      LIMIT 10
    `);

    // Temps moyen de traitement
    const processingTimeQuery = await db.execute(sql`
      SELECT COALESCE(AVG(
        EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600
      ), 0) as avg_processing_hours
      FROM bulletin_comprehensive
      WHERE school_id = ${schoolId} 
        AND status IN ('completed', 'distributed')
        AND updated_at > created_at
      ${term ? sql`AND term = ${term as string}` : sql``}
      ${academicYear ? sql`AND academic_year = ${academicYear as string}` : sql``}
    `);

    const totalBulletins = parseInt((totalBulletinsQuery.rows[0]?.total as string) || '0');
    
    const statusBreakdown = statusBreakdownQuery.rows.reduce((acc: any, row: any) => {
      acc[row.status || 'draft'] = parseInt(row.count);
      return acc;
    }, {});

    // Assurer des valeurs par défaut pour statusBreakdown
    statusBreakdown.draft = statusBreakdown.draft || 0;
    statusBreakdown.completed = statusBreakdown.completed || 0;
    statusBreakdown.sent = statusBreakdown.sent || 0;
    statusBreakdown.distributed = statusBreakdown.distributed || 0;

    const distributionRates = {
      overall: distributionRatesQuery.rows.length > 0 
        ? Math.round(distributionRatesQuery.rows.reduce((acc: number, row: any) => 
            acc + parseFloat(row.delivery_rate || '0'), 0) / distributionRatesQuery.rows.length)
        : 0,
      email: Math.round(parseFloat((distributionRatesQuery.rows.find(r => r.channel === 'email')?.delivery_rate as string) || '0')),
      sms: Math.round(parseFloat((distributionRatesQuery.rows.find(r => r.channel === 'sms')?.delivery_rate as string) || '0')),
      whatsapp: Math.round(parseFloat((distributionRatesQuery.rows.find(r => r.channel === 'whatsapp')?.delivery_rate as string) || '0'))
    };

    const averageProcessingTime = Math.round(
      parseFloat((processingTimeQuery.rows[0]?.avg_processing_hours as string) || '0') * 10) / 10;

    const classPerformance = classPerformanceQuery.rows.map((row: any) => ({
      className: row.class_name,
      classId: row.class_id,
      bulletinsGenerated: parseInt(row.bulletins_generated || '0'),
      averageGrade: Math.round(parseFloat(row.avg_grade || '0') * 100) / 100,
      distributed: parseInt(row.distributed || '0')
    }));

    const overviewData = {
      totalBulletins,
      statusBreakdown,
      distributionRates,
      averageProcessingTime,
      classPerformance
    };

    console.log('[COMPREHENSIVE_REPORTS] ✅ Overview report generated:', {
      totalBulletins,
      statusCount: Object.keys(statusBreakdown).length,
      classCount: classPerformance.length
    });

    res.json({
      success: true,
      data: overviewData
    });

  } catch (error: any) {
    console.error('[COMPREHENSIVE_REPORTS] ❌ Error generating overview report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate overview report',
      error: error.message
    });
  }
});

// Route pour les statistiques de distribution
router.get('/reports/distribution-stats', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required - invalid user context'
      });
    }
    
    const { term, academicYear, classId, channel } = req.query;

    console.log('[COMPREHENSIVE_REPORTS] 📨 Fetching distribution stats:', { 
      term, academicYear, classId, channel, schoolId 
    });

    // Distribution par canal
    const channelStatsQuery = await db.execute(sql`
      SELECT 
        COALESCE(distribution_channel, 'none') as channel,
        COUNT(*) as total_sent,
        COUNT(CASE WHEN distribution_status = 'delivered' THEN 1 END) as delivered,
        COUNT(CASE WHEN distribution_status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN distribution_status = 'pending' THEN 1 END) as pending
      FROM bulletin_comprehensive
      WHERE school_id = ${schoolId}
        AND distribution_channel IS NOT NULL
      ${term ? sql`AND term = ${term as string}` : sql``}
      ${academicYear ? sql`AND academic_year = ${academicYear as string}` : sql``}
      ${classId ? sql`AND class_id = ${parseInt(classId as string)}` : sql``}
      ${channel ? sql`AND distribution_channel = ${channel as string}` : sql``}
      GROUP BY distribution_channel
    `);

    // Distribution quotidienne (7 derniers jours)
    const dailyDistributionQuery = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as bulletins_sent,
        COUNT(CASE WHEN distribution_status = 'delivered' THEN 1 END) as delivered
      FROM bulletin_comprehensive
      WHERE school_id = ${schoolId}
        AND created_at >= CURRENT_DATE - INTERVAL '7 days'
        AND distribution_channel IS NOT NULL
      ${term ? sql`AND term = ${term as string}` : sql``}
      ${academicYear ? sql`AND academic_year = ${academicYear as string}` : sql``}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Temps de distribution par canal
    const distributionTimeQuery = await db.execute(sql`
      SELECT 
        COALESCE(distribution_channel, 'none') as channel,
        AVG(EXTRACT(EPOCH FROM (distribution_sent_at - created_at)) / 60) as avg_time_minutes
      FROM bulletin_comprehensive
      WHERE school_id = ${schoolId}
        AND distribution_sent_at IS NOT NULL
        AND distribution_status = 'delivered'
        AND distribution_sent_at > created_at
      ${term ? sql`AND term = ${term as string}` : sql``}
      ${academicYear ? sql`AND academic_year = ${academicYear as string}` : sql``}
      GROUP BY distribution_channel
    `);

    const channelStats = channelStatsQuery.rows.map((row: any) => ({
      channel: row.channel,
      totalSent: parseInt(row.total_sent),
      delivered: parseInt(row.delivered || '0'),
      failed: parseInt(row.failed || '0'),
      pending: parseInt(row.pending || '0'),
      successRate: row.total_sent > 0 
        ? Math.round((parseInt(row.delivered || '0') / parseInt(row.total_sent)) * 100)
        : 0
    }));

    const dailyDistribution = dailyDistributionQuery.rows.map((row: any) => ({
      date: row.date,
      bulletinsSent: parseInt(row.bulletins_sent),
      delivered: parseInt(row.delivered || '0')
    }));

    const distributionTimes = distributionTimeQuery.rows.reduce((acc: any, row: any) => {
      acc[row.channel] = Math.round(parseFloat(row.avg_time_minutes || '0') * 10) / 10;
      return acc;
    }, {});

    const distributionStatsData = {
      channelStats,
      dailyDistribution,
      distributionTimes
    };

    console.log('[COMPREHENSIVE_REPORTS] ✅ Distribution stats generated:', {
      channels: channelStats.length,
      dailyData: dailyDistribution.length
    });

    res.json({
      success: true,
      data: distributionStatsData
    });

  } catch (error: any) {
    console.error('[COMPREHENSIVE_REPORTS] ❌ Error generating distribution stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate distribution stats',
      error: error.message
    });
  }
});

// Route pour la timeline des événements
router.get('/reports/timeline', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required - invalid user context'
      });
    }
    
    const { term, academicYear, limit = '50', offset = '0' } = req.query;

    console.log('[COMPREHENSIVE_REPORTS] 🕐 Fetching timeline:', { 
      term, academicYear, limit, offset, schoolId 
    });

    // Timeline des événements récents
    const timelineQuery = await db.execute(sql`
      SELECT 
        bc.id,
        COALESCE(bc.student_name, 'Élève inconnu') as student_name,
        COALESCE(bc.class_name, 'Classe inconnue') as class_name,
        COALESCE(bc.status, 'draft') as status,
        bc.distribution_channel,
        bc.distribution_status,
        bc.created_at,
        bc.updated_at,
        bc.distribution_sent_at,
        COALESCE(u.first_name, '') as created_by_first_name,
        COALESCE(u.last_name, '') as created_by_last_name
      FROM bulletin_comprehensive bc
      LEFT JOIN users u ON bc.created_by = u.id
      WHERE bc.school_id = ${schoolId}
      ${term ? sql`AND bc.term = ${term as string}` : sql``}
      ${academicYear ? sql`AND bc.academic_year = ${academicYear as string}` : sql``}
      ORDER BY bc.created_at DESC
      LIMIT ${parseInt(limit as string)}
      OFFSET ${parseInt(offset as string)}
    `);

    // Compter le total pour la pagination
    const totalCountQuery = await db.execute(sql`
      SELECT COUNT(*) as total
      FROM bulletin_comprehensive
      WHERE school_id = ${schoolId}
      ${term ? sql`AND term = ${term as string}` : sql``}
      ${academicYear ? sql`AND academic_year = ${academicYear as string}` : sql``}
    `);

    const totalEvents = parseInt((totalCountQuery.rows[0]?.total as string) || '0');
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    
    const timeline = timelineQuery.rows.map((row: any) => {
      const events = [];
      
      // Événement de création
      events.push({
        type: 'created',
        timestamp: row.created_at,
        description: `Bulletin créé pour ${row.student_name} (${row.class_name})`,
        actor: `${row.created_by_first_name || ''} ${row.created_by_last_name || ''}`.trim() || 'Système'
      });
      
      // Événement de finalisation
      if (row.status === 'completed' && row.updated_at && row.updated_at !== row.created_at) {
        events.push({
          type: 'completed',
          timestamp: row.updated_at,
          description: `Bulletin finalisé pour ${row.student_name}`,
          actor: 'Système'
        });
      }
      
      // Événement de distribution
      if (row.distribution_sent_at) {
        events.push({
          type: 'distributed',
          timestamp: row.distribution_sent_at,
          description: `Bulletin distribué via ${row.distribution_channel || 'canal inconnu'} (${row.distribution_status || 'statut inconnu'})`,
          actor: 'Système de distribution'
        });
      }
      
      return {
        bulletinId: row.id,
        studentName: row.student_name,
        className: row.class_name,
        status: row.status,
        events: events.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
      };
    });

    const timelineData = {
      timeline,
      pagination: {
        total: totalEvents,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < totalEvents
      }
    };

    console.log('[COMPREHENSIVE_REPORTS] ✅ Timeline generated:', {
      items: timeline.length,
      total: totalEvents
    });

    res.json({
      success: true,
      data: timelineData
    });

  } catch (error: any) {
    console.error('[COMPREHENSIVE_REPORTS] ❌ Error generating timeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate timeline',
      error: error.message
    });
  }
});

// Route pour l'export des données
router.get('/reports/export', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required - invalid user context'
      });
    }
    
    const { format = 'csv', reportType = 'overview', term, academicYear, classId } = req.query;

    console.log('[COMPREHENSIVE_REPORTS] 📤 Exporting report:', { 
      format, reportType, term, academicYear, classId, schoolId 
    });

    if (format !== 'csv') {
      return res.status(400).json({
        success: false,
        message: 'Seul le format CSV est actuellement supporté'
      });
    }

    // Récupérer les données selon le type de rapport
    let exportData: any[] = [];
    let filename = `rapport-bulletins-${new Date().toISOString().split('T')[0]}.csv`;
    let headers: string[] = [];

    if (reportType === 'overview') {
      const dataQuery = await db.execute(sql`
        SELECT 
          bc.id,
          COALESCE(bc.student_name, 'Élève inconnu') as student_name,
          COALESCE(bc.class_name, 'Classe inconnue') as class_name,
          COALESCE(bc.term, '') as term,
          COALESCE(bc.academic_year, '') as academic_year,
          COALESCE(bc.overall_average, 0) as overall_average,
          COALESCE(bc.class_rank, 0) as class_rank,
          COALESCE(bc.status, 'draft') as status,
          COALESCE(bc.distribution_channel, '') as distribution_channel,
          COALESCE(bc.distribution_status, '') as distribution_status,
          bc.created_at,
          bc.distribution_sent_at
        FROM bulletin_comprehensive bc
        WHERE bc.school_id = ${schoolId}
        ${term ? sql`AND bc.term = ${term as string}` : sql``}
        ${academicYear ? sql`AND bc.academic_year = ${academicYear as string}` : sql``}
        ${classId ? sql`AND bc.class_id = ${parseInt(classId as string)}` : sql``}
        ORDER BY bc.created_at DESC
      `);

      headers = [
        'ID', 'Élève', 'Classe', 'Trimestre', 'Année Scolaire', 
        'Moyenne Générale', 'Rang', 'Statut', 'Canal Distribution', 
        'Statut Distribution', 'Date Création', 'Date Distribution'
      ];
      
      exportData = dataQuery.rows.map((row: any) => [
        row.id,
        row.student_name,
        row.class_name,
        row.term,
        row.academic_year,
        row.overall_average || '',
        row.class_rank || '',
        row.status,
        row.distribution_channel || '',
        row.distribution_status || '',
        row.created_at || '',
        row.distribution_sent_at || ''
      ]);
      
      filename = `rapport-vue-ensemble-${new Date().toISOString().split('T')[0]}.csv`;
      
    } else if (reportType === 'distribution') {
      const dataQuery = await db.execute(sql`
        SELECT 
          bc.id,
          COALESCE(bc.student_name, 'Élève inconnu') as student_name,
          COALESCE(bc.class_name, 'Classe inconnue') as class_name,
          COALESCE(bc.distribution_channel, 'none') as distribution_channel,
          COALESCE(bc.distribution_status, 'none') as distribution_status,
          bc.distribution_sent_at,
          COALESCE(EXTRACT(EPOCH FROM (bc.distribution_sent_at - bc.created_at)) / 60, 0) as processing_time_minutes
        FROM bulletin_comprehensive bc
        WHERE bc.school_id = ${schoolId}
          AND bc.distribution_channel IS NOT NULL
        ${term ? sql`AND bc.term = ${term as string}` : sql``}
        ${academicYear ? sql`AND bc.academic_year = ${academicYear as string}` : sql``}
        ORDER BY bc.distribution_sent_at DESC NULLS LAST
      `);

      headers = [
        'ID Bulletin', 'Élève', 'Classe', 'Canal', 'Statut', 
        'Date Distribution', 'Temps Traitement (min)'
      ];
      
      exportData = dataQuery.rows.map((row: any) => [
        row.id,
        row.student_name,
        row.class_name,
        row.distribution_channel,
        row.distribution_status,
        row.distribution_sent_at || '',
        Math.round(parseFloat(row.processing_time_minutes || '0'))
      ]);
      
      filename = `rapport-distribution-${new Date().toISOString().split('T')[0]}.csv`;
    
    } else if (reportType === 'timeline') {
      const dataQuery = await db.execute(sql`
        SELECT 
          bc.id,
          COALESCE(bc.student_name, 'Élève inconnu') as student_name,
          COALESCE(bc.class_name, 'Classe inconnue') as class_name,
          COALESCE(bc.status, 'draft') as status,
          bc.created_at,
          bc.updated_at,
          bc.distribution_sent_at,
          COALESCE(u.first_name, '') as created_by_first_name,
          COALESCE(u.last_name, '') as created_by_last_name
        FROM bulletin_comprehensive bc
        LEFT JOIN users u ON bc.created_by = u.id
        WHERE bc.school_id = ${schoolId}
        ${term ? sql`AND bc.term = ${term as string}` : sql``}
        ${academicYear ? sql`AND bc.academic_year = ${academicYear as string}` : sql``}
        ORDER BY bc.created_at DESC
      `);

      headers = [
        'ID Bulletin', 'Élève', 'Classe', 'Statut', 'Date Création', 
        'Date Mise à Jour', 'Date Distribution', 'Créé Par'
      ];
      
      exportData = dataQuery.rows.map((row: any) => [
        row.id,
        row.student_name,
        row.class_name,
        row.status,
        row.created_at || '',
        row.updated_at || '',
        row.distribution_sent_at || '',
        `${row.created_by_first_name} ${row.created_by_last_name}`.trim() || 'Système'
      ]);
      
      filename = `rapport-timeline-${new Date().toISOString().split('T')[0]}.csv`;
    }

    // Générer le CSV avec BOM pour l'encoding UTF-8
    const BOM = '\uFEFF';
    const csvHeader = headers.join(',') + '\n';
    const csvRows = exportData.map(row => 
      row.map((cell: any) => {
        const cellStr = String(cell || '');
        // Échapper les guillemets et encapsuler si nécessaire
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ).join('\n');
    
    const csvContent = BOM + csvHeader + csvRows;

    // Définir les headers pour le téléchargement
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8'));

    console.log('[COMPREHENSIVE_REPORTS] ✅ CSV export generated:', {
      reportType,
      rows: exportData.length,
      filename
    });

    res.send(csvContent);

  } catch (error: any) {
    console.error('[COMPREHENSIVE_REPORTS] ❌ Error exporting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
      error: error.message
    });
  }
});

// ============= BULLETIN EMAIL SHARING ROUTES =============

// Send individual bulletin via email
router.post('/send-email', requireAuth, requireDirectorAuth, async (req, res) => {
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
      bulletinId, 
      studentName, 
      studentClass, 
      term, 
      academicYear, 
      schoolName, 
      parentEmail,
      bulletinPdfUrl,
      schoolLogo,
      teacherName,
      directorName,
      grades,
      generalAppreciation,
      rank,
      totalStudents,
      average,
      classAverage
    } = req.body;

    console.log('[BULLETIN_EMAIL] 📧 Sending individual bulletin:', { 
      bulletinId, 
      studentName, 
      parentEmail, 
      schoolId 
    });

    // Validation
    if (!studentName || !parentEmail || !term || !academicYear || !schoolName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: studentName, parentEmail, term, academicYear, schoolName'
      });
    }

    // Send email using Hostinger service
    const emailSent = await hostingerMailService.sendBulletin({
      studentName,
      studentClass: studentClass || 'Non spécifiée',
      term,
      academicYear,
      schoolName,
      parentEmail,
      bulletinPdfUrl,
      schoolLogo,
      teacherName,
      directorName,
      grades,
      generalAppreciation,
      rank,
      totalStudents,
      average,
      classAverage
    });

    if (emailSent) {
      console.log('[BULLETIN_EMAIL] ✅ Individual bulletin email sent successfully:', { 
        studentName, 
        parentEmail 
      });
      
      res.json({
        success: true,
        message: `Bulletin envoyé avec succès à ${parentEmail}`,
        data: {
          studentName,
          parentEmail,
          sentAt: new Date().toISOString()
        }
      });
    } else {
      console.error('[BULLETIN_EMAIL] ❌ Failed to send individual bulletin email:', { 
        studentName, 
        parentEmail 
      });
      
      res.status(500).json({
        success: false,
        message: 'Échec de l\'envoi de l\'email. Veuillez réessayer.'
      });
    }

  } catch (error: any) {
    console.error('[BULLETIN_EMAIL] ❌ Error sending individual bulletin email:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de l\'email',
      error: error.message
    });
  }
});

// Send bulk bulletins via email
router.post('/send-bulk-email', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId;
    
    if (!schoolId) {
      return res.status(403).json({
        success: false,
        message: 'School access required - invalid user context'
      });
    }

    const { bulletins } = req.body;

    console.log('[BULLETIN_EMAIL] 📧 Sending bulk bulletins:', { 
      count: bulletins?.length, 
      schoolId 
    });

    // Validation
    if (!bulletins || !Array.isArray(bulletins) || bulletins.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Bulletins array is required and cannot be empty'
      });
    }

    // Validate each bulletin has required fields
    const invalidBulletins = bulletins.filter(bulletin => 
      !bulletin.studentName || !bulletin.parentEmail || !bulletin.term || !bulletin.academicYear || !bulletin.schoolName
    );

    if (invalidBulletins.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${invalidBulletins.length} bulletin(s) have missing required fields`,
        invalidBulletins: invalidBulletins.map((b, index) => ({ index, studentName: b.studentName }))
      });
    }

    // Send bulk emails using Hostinger service
    const result = await hostingerMailService.sendBulkBulletins(bulletins.map(bulletin => ({
      studentName: bulletin.studentName,
      studentClass: bulletin.studentClass || 'Non spécifiée',
      term: bulletin.term,
      academicYear: bulletin.academicYear,
      schoolName: bulletin.schoolName,
      parentEmail: bulletin.parentEmail,
      bulletinPdfUrl: bulletin.bulletinPdfUrl,
      schoolLogo: bulletin.schoolLogo,
      teacherName: bulletin.teacherName,
      directorName: bulletin.directorName,
      grades: bulletin.grades,
      generalAppreciation: bulletin.generalAppreciation,
      rank: bulletin.rank,
      totalStudents: bulletin.totalStudents,
      average: bulletin.average,
      classAverage: bulletin.classAverage
    })));

    console.log('[BULLETIN_EMAIL] ✅ Bulk bulletin emails processed:', { 
      total: bulletins.length,
      successful: result.success,
      failed: result.failed
    });

    res.json({
      success: true,
      message: `Envoi terminé: ${result.success} réussis, ${result.failed} échecs`,
      data: {
        total: bulletins.length,
        successful: result.success,
        failed: result.failed,
        results: result.results,
        sentAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('[BULLETIN_EMAIL] ❌ Error sending bulk bulletin emails:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi des emails en masse',
      error: error.message
    });
  }
});

// Get email sending status/history (optional - for future implementation)
router.get('/email-status/:bulletinId', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const { bulletinId } = req.params;
    
    // For now, return a placeholder response
    // In future, this could track email sending history in database
    res.json({
      success: true,
      message: 'Email status retrieved',
      data: {
        bulletinId,
        emailsSent: 0,
        lastSentAt: null,
        status: 'ready_to_send'
      }
    });

  } catch (error: any) {
    console.error('[BULLETIN_EMAIL] ❌ Error getting email status:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du statut email',
      error: error.message
    });
  }
});

export default router;
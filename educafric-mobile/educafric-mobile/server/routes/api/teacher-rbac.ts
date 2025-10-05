import { Router, Request, Response } from 'express';
import { db } from '../../db';
import { requireAuth, requireRole } from '../../middleware/auth';
// Import tables directly from specific schema modules (NOT barrel export)
import { classes, subjects } from '../../../shared/schemas/schoolSchema';
import { users } from '../../../shared/schemas/userSchema';
import { grades } from '../../../shared/schemas/academicSchema';
import { teacherClassSubjects, classSubjects } from '../../../shared/schemas/classSubjectsSchema';
import { classEnrollments } from '../../../shared/schemas/classEnrollmentSchema';

// Import teacher grade submissions table for bulletin workflow
import { teacherGradeSubmissions } from '../../../shared/schemas/bulletinSchema';

// Map table references to actual available tables  
// teacherSubjectAssignments -> teacherClassSubjects (existing teacher assignment table)
const teacherSubjectAssignments = teacherClassSubjects;
import { eq, and, or, inArray } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// RBAC Helper: Verify teacher has permission for classId + subjectId
async function verifyTeacherPermission(teacherId: number, schoolId: number, classId: number, subjectId: number) {
  try {
    // Need to join teacherClassSubjects with classSubjects to get subjectId
    const [assignment] = await db
      .select()
      .from(teacherSubjectAssignments)
      .innerJoin(classSubjects, eq(classSubjects.id, teacherSubjectAssignments.classSubjectId))
      .where(
        and(
          eq(teacherSubjectAssignments.teacherId, teacherId),
          eq(teacherSubjectAssignments.schoolId, schoolId),
          eq(teacherSubjectAssignments.classId, classId),
          eq(classSubjects.subjectId, subjectId),
          eq(teacherSubjectAssignments.isActive, true)
        )
      )
      .limit(1);
    
    return !!assignment;
  } catch (error) {
    console.error('[TEACHER_RBAC] Error verifying permission:', error);
    return false;
  }
}

// Validation schemas
const gradeEntrySchema = z.object({
  studentId: z.number().positive(),
  classId: z.number().positive(),
  subjectId: z.number().positive(),
  term: z.string().min(1), // Fixed: termId -> term (string)
  grade: z.number().min(0).max(20), // Fixed: score -> grade  
  coefficient: z.number().min(0.1).max(5.0).default(1.0),
  comments: z.string().optional() // Fixed: comment -> comments
});

const bulkGradeEntriesSchema = z.object({
  grades: z.array(gradeEntrySchema)
});

const submissionSchema = z.object({
  classId: z.number().positive(),
  subjectId: z.number().positive(),
  term: z.string().min(1) // Fixed: termId -> term (string)
});

// ===== TEACHER DATA ACCESS ENDPOINTS =====

// GET /api/teacher/classes - Get classes assigned to authenticated teacher
router.get('/classes', requireAuth, requireRole('Teacher'), async (req: any, res: Response) => {
  try {
    const teacherId = req.user.id;
    const schoolId = req.user.schoolId;

    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: 'No school associated with teacher account' 
      });
    }

    // Get classes the teacher is assigned to teach
    const assignedClasses = await db
      .select({
        classId: teacherSubjectAssignments.classId,
        className: classes.name,
        classLevel: classes.level,
        maxStudents: classes.maxStudents
      })
      .from(teacherSubjectAssignments)
      .innerJoin(classes, eq(classes.id, teacherSubjectAssignments.classId))
      .where(
        and(
          eq(teacherSubjectAssignments.teacherId, teacherId),
          eq(teacherSubjectAssignments.schoolId, schoolId),
          eq(teacherSubjectAssignments.isActive, true)
        )
      )
      .groupBy(classes.id, classes.name, classes.level, classes.maxStudents);

    const uniqueClasses = assignedClasses.reduce((acc, curr) => {
      if (!acc.find(c => c.classId === curr.classId)) {
        acc.push({
          id: curr.classId,
          name: curr.className,
          level: curr.classLevel,
          maxStudents: curr.maxStudents
        });
      }
      return acc;
    }, [] as any[]);

    res.json({
      success: true,
      classes: uniqueClasses,
      message: `Found ${uniqueClasses.length} assigned classes`
    });

  } catch (error) {
    console.error('[TEACHER_API] Error fetching teacher classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher classes'
    });
  }
});

// GET /api/teacher/subjects?classId=X - Get subjects teacher can grade for specific class
router.get('/subjects', requireAuth, requireRole('Teacher'), async (req: any, res: Response) => {
  try {
    const teacherId = req.user.id;
    const schoolId = req.user.schoolId;
    const { classId } = req.query;

    if (!classId) {
      return res.status(400).json({
        success: false,
        message: 'classId parameter is required'
      });
    }

    const classIdNum = parseInt(classId as string);

    // Get subjects the teacher is assigned to teach for this class
    const assignedSubjects = await db
      .select({
        subjectId: classSubjects.subjectId,
        subjectName: subjects.nameFr,
        subjectCode: subjects.code,
        subjectNameEn: subjects.nameEn
      })
      .from(teacherSubjectAssignments)
      .innerJoin(classSubjects, eq(classSubjects.id, teacherSubjectAssignments.classSubjectId))
      .innerJoin(subjects, eq(subjects.id, classSubjects.subjectId))
      .where(
        and(
          eq(teacherSubjectAssignments.teacherId, teacherId),
          eq(teacherSubjectAssignments.schoolId, schoolId),
          eq(teacherSubjectAssignments.classId, classIdNum),
          eq(teacherSubjectAssignments.isActive, true)
        )
      );

    const subjectsData = assignedSubjects.map(s => ({
      id: s.subjectId,
      name: s.subjectName,
      code: s.subjectCode,
      description: s.description
    }));

    res.json({
      success: true,
      subjects: subjectsData,
      classId: classIdNum,
      message: `Found ${subjectsData.length} assigned subjects for class ${classIdNum}`
    });

  } catch (error) {
    console.error('[TEACHER_API] Error fetching teacher subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher subjects'
    });
  }
});

// GET /api/teacher/students?classId=X - Get students in classes teacher teaches
router.get('/students', requireAuth, requireRole('Teacher'), async (req: any, res: Response) => {
  try {
    const teacherId = req.user.id;
    const schoolId = req.user.schoolId;
    const { classId } = req.query;

    if (!classId) {
      return res.status(400).json({
        success: false,
        message: 'classId parameter is required'
      });
    }

    const classIdNum = parseInt(classId as string);

    // Verify teacher is assigned to this class
    const hasPermission = await db
      .select()
      .from(teacherSubjectAssignments)
      .where(
        and(
          eq(teacherSubjectAssignments.teacherId, teacherId),
          eq(teacherSubjectAssignments.schoolId, schoolId),
          eq(teacherSubjectAssignments.classId, classIdNum),
          eq(teacherSubjectAssignments.isActive, true)
        )
      )
      .limit(1);

    if (!hasPermission.length) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher not assigned to this class.'
      });
    }

    // SECURITY FIX: Get ONLY students enrolled in the specific class
    const students = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        matricule: users.phone, // Using phone as matricule placeholder
        dateOfBirth: users.dateOfBirth
      })
      .from(users)
      .innerJoin(classEnrollments, eq(classEnrollments.studentId, users.id))
      .where(
        and(
          eq(users.role, 'Student'),
          eq(users.schoolId, schoolId),
          eq(classEnrollments.classId, classIdNum),
          eq(classEnrollments.status, 'active')
        )
      );

    res.json({
      success: true,
      students: students,
      classId: classIdNum,
      message: `Found ${students.length} students in class ${classIdNum}`
    });

  } catch (error) {
    console.error('[TEACHER_API] Error fetching class students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class students'
    });
  }
});

// ===== GRADE MANAGEMENT ENDPOINTS =====

// GET /api/teacher/grade-entries?classId=X&subjectId=Y&termId=Z - Get existing grade entries
router.get('/grade-entries', requireAuth, requireRole('Teacher'), async (req: any, res: Response) => {
  try {
    const teacherId = req.user.id;
    const schoolId = req.user.schoolId;
    const { classId, subjectId, termId } = req.query;

    if (!classId || !subjectId || !termId) {
      return res.status(400).json({
        success: false,
        message: 'classId, subjectId, and termId parameters are required'
      });
    }

    const classIdNum = parseInt(classId as string);
    const subjectIdNum = parseInt(subjectId as string);
    const termString = termId as string; // Fixed: term is string, not number

    // Verify teacher has permission for this class and subject
    const hasPermission = await verifyTeacherPermission(teacherId, schoolId, classIdNum, subjectIdNum);
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher not assigned to this class and subject combination.'
      });
    }

    // Get teacher grade submissions for this class, subject, and term
    const gradeEntriesData = await db
      .select({
        id: teacherGradeSubmissions.id,
        studentId: teacherGradeSubmissions.studentId,
        score: teacherGradeSubmissions.termAverage, // Map termAverage to score
        coefficient: teacherGradeSubmissions.coefficient,
        examType: teacherGradeSubmissions.reviewStatus, // Map reviewStatus to examType
        term: teacherGradeSubmissions.term,
        comments: teacherGradeSubmissions.subjectComments, // Map subjectComments to comments
        createdAt: teacherGradeSubmissions.createdAt,
        updatedAt: teacherGradeSubmissions.updatedAt,
        studentFirstName: users.firstName,
        studentLastName: users.lastName
      })
      .from(teacherGradeSubmissions)
      .leftJoin(users, eq(users.id, teacherGradeSubmissions.studentId))
      .where(
        and(
          eq(teacherGradeSubmissions.teacherId, teacherId),
          eq(teacherGradeSubmissions.schoolId, schoolId),
          eq(teacherGradeSubmissions.classId, classIdNum),
          eq(teacherGradeSubmissions.subjectId, subjectIdNum),
          eq(teacherGradeSubmissions.term, termString)
        )
      );

    res.json({
      success: true,
      gradeEntries: gradeEntriesData,
      filters: { classId: classIdNum, subjectId: subjectIdNum, termId: termString }, // Fixed: termIdNum -> termString
      message: `Found ${gradeEntriesData.length} grade entries`
    });

  } catch (error) {
    console.error('[TEACHER_API] Error fetching grade entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grade entries'
    });
  }
});

// POST /api/teacher/grade-entries - Create/update grade entries (bulk upsert)
router.post('/grade-entries', requireAuth, requireRole('Teacher'), async (req: any, res: Response) => {
  try {
    const teacherId = req.user.id;
    const schoolId = req.user.schoolId;

    // Validate request body
    const validation = bulkGradeEntriesSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.errors
      });
    }

    const { grades } = validation.data;
    const results = [];
    const errors = [];

    for (const gradeData of grades) {
      try {
        // Verify teacher has permission for each class and subject
        const hasPermission = await verifyTeacherPermission(
          teacherId, 
          schoolId, 
          gradeData.classId, 
          gradeData.subjectId
        );

        if (!hasPermission) {
          errors.push({
            studentId: gradeData.studentId,
            error: 'Access denied for this class and subject combination'
          });
          continue;
        }

        // Check if teacher grade submission already exists
        const [existingEntry] = await db
          .select()
          .from(teacherGradeSubmissions)
          .where(
            and(
              eq(teacherGradeSubmissions.studentId, gradeData.studentId),
              eq(teacherGradeSubmissions.classId, gradeData.classId),
              eq(teacherGradeSubmissions.subjectId, gradeData.subjectId),
              eq(teacherGradeSubmissions.term, gradeData.term),
              eq(teacherGradeSubmissions.teacherId, teacherId),
              eq(teacherGradeSubmissions.schoolId, schoolId)
            )
          )
          .limit(1);

        if (existingEntry) {
          // Update existing teacher grade submission
          const [updatedEntry] = await db
            .update(teacherGradeSubmissions)
            .set({
              firstEvaluation: gradeData.grade.toString(), // Map grade to firstEvaluation
              termAverage: gradeData.grade.toString(), // Also set termAverage to same value
              coefficient: gradeData.coefficient || 1,
              subjectComments: gradeData.comments, // Map comments to subjectComments
              updatedAt: new Date(),
              isSubmitted: false, // Reset submission status when grades are updated
              reviewStatus: 'draft' // Reset to draft when updated
            })
            .where(eq(teacherGradeSubmissions.id, existingEntry.id))
            .returning();

          results.push({ action: 'updated', gradeEntry: updatedEntry });
        } else {
          // Create new teacher grade submission
          const [newEntry] = await db
            .insert(teacherGradeSubmissions)
            .values({
              schoolId,
              studentId: gradeData.studentId,
              classId: gradeData.classId,
              subjectId: gradeData.subjectId,
              term: gradeData.term,
              teacherId,
              academicYear: '2024-2025', // TODO: Get from context
              firstEvaluation: gradeData.grade.toString(), // Map grade to firstEvaluation
              termAverage: gradeData.grade.toString(), // Set termAverage to same value
              coefficient: gradeData.coefficient || 1,
              subjectComments: gradeData.comments, // Map comments to subjectComments
              isSubmitted: false, // Default to not submitted
              reviewStatus: 'draft' // Default to draft status
            })
            .returning();

          results.push({ action: 'created', gradeEntry: newEntry });
        }

      } catch (error) {
        console.error('[TEACHER_API] Error processing grade entry:', error);
        errors.push({
          studentId: gradeData.studentId,
          error: 'Failed to process grade entry'
        });
      }
    }

    res.status(results.length > 0 ? 201 : 400).json({
      success: results.length > 0,
      results,
      errors,
      message: `Processed ${results.length} grade entries, ${errors.length} errors`
    });

  } catch (error) {
    console.error('[TEACHER_API] Error creating grade entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create grade entries'
    });
  }
});

// PATCH /api/teacher/grade-entries/:id - Update individual grade entry with version control
router.patch('/grade-entries/:id', requireAuth, requireRole('Teacher'), async (req: any, res: Response) => {
  try {
    const teacherId = req.user.id;
    const schoolId = req.user.schoolId;
    const gradeEntryId = parseInt(req.params.id);

    // Validate request body
    const updateSchema = z.object({
      grade: z.number().min(0).max(20).optional(), // FIXED: score -> grade
      coefficient: z.number().min(0.1).max(5.0).optional(),
      comments: z.string().optional(), // FIXED: comment -> comments
      examType: z.string().optional()
    }); // FIXED: Removed non-existent version field

    const validation = updateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.errors
      });
    }

    const updates = validation.data;

    // Get existing teacher grade submission
    const [existingEntry] = await db
      .select()
      .from(teacherGradeSubmissions)
      .where(
        and(
          eq(teacherGradeSubmissions.id, gradeEntryId),
          eq(teacherGradeSubmissions.teacherId, teacherId),
          eq(teacherGradeSubmissions.schoolId, schoolId)
        )
      )
      .limit(1);

    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: 'Teacher grade submission not found or access denied'
      });
    }

    // FIXED: Removed version control as version field doesn't exist in schema

    // Verify teacher still has permission
    const hasPermission = await verifyTeacherPermission(
      teacherId, 
      schoolId, 
      existingEntry.classId, 
      existingEntry.subjectId
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher permission revoked.'
      });
    }

    // Update teacher grade submission with proper field mapping
    const updateData: any = {
      updatedAt: new Date(),
      isSubmitted: false, // Reset submission status when updated
      reviewStatus: 'draft' // Reset to draft when updated
    };

    if (updates.grade !== undefined) {
      updateData.firstEvaluation = updates.grade.toString(); // Map grade to firstEvaluation
      updateData.termAverage = updates.grade.toString(); // Also update termAverage
    }
    if (updates.coefficient !== undefined) updateData.coefficient = updates.coefficient;
    if (updates.comments !== undefined) updateData.subjectComments = updates.comments; // Map comments to subjectComments
    // examType is not supported in teacherGradeSubmissions - skip it

    const [updatedEntry] = await db
      .update(teacherGradeSubmissions)
      .set(updateData)
      .where(eq(teacherGradeSubmissions.id, gradeEntryId))
      .returning();

    res.json({
      success: true,
      gradeEntry: updatedEntry,
      message: 'Grade entry updated successfully'
    });

  } catch (error) {
    console.error('[TEACHER_API] Error updating grade entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update grade entry'
    });
  }
});

// ===== SUBMISSION WORKFLOW ENDPOINTS =====

// POST /api/teacher/submissions - Submit grades for review
router.post('/submissions', requireAuth, requireRole('Teacher'), async (req: any, res: Response) => {
  try {
    const teacherId = req.user.id;
    const schoolId = req.user.schoolId;

    // Validate request body
    const validation = submissionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.errors
      });
    }

    const { classId, subjectId, term } = validation.data; // FIXED: termId -> term

    // Verify teacher has permission
    const hasPermission = await verifyTeacherPermission(teacherId, schoolId, classId, subjectId);
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher not assigned to this class and subject combination.'
      });
    }

    // Get all draft teacher grade submissions for this submission
    const draftEntries = await db
      .select()
      .from(teacherGradeSubmissions)
      .where(
        and(
          eq(teacherGradeSubmissions.teacherId, teacherId),
          eq(teacherGradeSubmissions.schoolId, schoolId),
          eq(teacherGradeSubmissions.classId, classId),
          eq(teacherGradeSubmissions.subjectId, subjectId),
          eq(teacherGradeSubmissions.term, term),
          eq(teacherGradeSubmissions.reviewStatus, 'draft') // Use reviewStatus instead of examType
        )
      );

    if (draftEntries.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No draft grade submissions found to submit'
      });
    }

    // Update all draft submissions to submitted status
    await db
      .update(teacherGradeSubmissions)
      .set({
        isSubmitted: true,
        submittedAt: new Date(),
        reviewStatus: 'pending', // Set to pending review
        lastStatusChange: new Date()
      })
      .where(
        and(
          eq(teacherGradeSubmissions.teacherId, teacherId),
          eq(teacherGradeSubmissions.schoolId, schoolId),
          eq(teacherGradeSubmissions.classId, classId),
          eq(teacherGradeSubmissions.subjectId, subjectId),
          eq(teacherGradeSubmissions.term, term),
          eq(teacherGradeSubmissions.reviewStatus, 'draft')
        )
      );

    res.json({
      success: true,
      submissionDetails: {
        classId,
        subjectId,
        term, // FIXED: termId -> term
        gradeEntriesCount: draftEntries.length,
        status: 'submitted'
      },
      message: `Successfully submitted ${draftEntries.length} grade entries for review`
    });

  } catch (error) {
    console.error('[TEACHER_API] Error submitting grades:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit grades for review'
    });
  }
});

// GET /api/teacher/submissions/status?termId=X - Get submission status for term
router.get('/submissions/status', requireAuth, requireRole('Teacher'), async (req: any, res: Response) => {
  try {
    const teacherId = req.user.id;
    const schoolId = req.user.schoolId;
    const { term } = req.query; // FIXED: termId -> term

    if (!term) {
      return res.status(400).json({
        success: false,
        message: 'term parameter is required'
      });
    }

    const termString = term as string; // FIXED: term is string, not number

    // Get submission status for all class-subject combinations for this teacher and term
    const submissionStatus = await db
      .select({
        classId: teacherGradeSubmissions.classId,
        subjectId: teacherGradeSubmissions.subjectId,
        reviewStatus: teacherGradeSubmissions.reviewStatus, // Use reviewStatus instead of examType
        count: teacherGradeSubmissions.id
      })
      .from(teacherGradeSubmissions)
      .where(
        and(
          eq(teacherGradeSubmissions.teacherId, teacherId),
          eq(teacherGradeSubmissions.schoolId, schoolId),
          eq(teacherGradeSubmissions.term, termString)
        )
      );

    // Group by class and subject
    const statusSummary = submissionStatus.reduce((acc, entry) => {
      const key = `${entry.classId}-${entry.subjectId}`;
      if (!acc[key]) {
        acc[key] = {
          classId: entry.classId,
          subjectId: entry.subjectId,
          draft: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          returned: 0
        };
      }
      acc[key][entry.reviewStatus as keyof typeof acc[typeof key]]++; // Use reviewStatus instead of examType
      return acc;
    }, {} as Record<string, any>);

    const statusArray = Object.values(statusSummary);

    res.json({
      success: true,
      term: termString, // FIXED: termId -> term
      submissionStatus: statusArray,
      totalCombinations: statusArray.length,
      message: `Found submission status for ${statusArray.length} class-subject combinations`
    });

  } catch (error) {
    console.error('[TEACHER_API] Error fetching submission status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission status'
    });
  }
});

// ===== TEACHER ARCHIVE ENDPOINTS =====

// GET /api/teacher/archive - Get teacher's saved work organized by class and student
router.get('/archive', requireAuth, requireRole('Teacher'), async (req: any, res: Response) => {
  try {
    const teacherId = req.user.id;
    const schoolId = req.user.schoolId;
    const { classId, studentId, term, status } = req.query;

    let whereConditions = and(
      eq(teacherGradeSubmissions.teacherId, teacherId),
      eq(teacherGradeSubmissions.schoolId, schoolId)
    );

    // Add optional filters
    if (classId) {
      whereConditions = and(whereConditions, eq(teacherGradeSubmissions.classId, parseInt(classId as string)));
    }
    if (studentId) {
      whereConditions = and(whereConditions, eq(teacherGradeSubmissions.studentId, parseInt(studentId as string)));
    }
    if (term) {
      whereConditions = and(whereConditions, eq(teacherGradeSubmissions.term, term as string));
    }
    if (status) {
      whereConditions = and(whereConditions, eq(teacherGradeSubmissions.reviewStatus, status as string));
    }

    // Get archived teacher submissions with student and subject details
    const archiveData = await db
      .select({
        id: teacherGradeSubmissions.id,
        studentId: teacherGradeSubmissions.studentId,
        classId: teacherGradeSubmissions.classId,
        subjectId: teacherGradeSubmissions.subjectId,
        term: teacherGradeSubmissions.term,
        academicYear: teacherGradeSubmissions.academicYear,
        firstEvaluation: teacherGradeSubmissions.firstEvaluation,
        termAverage: teacherGradeSubmissions.termAverage,
        coefficient: teacherGradeSubmissions.coefficient,
        subjectComments: teacherGradeSubmissions.subjectComments,
        reviewStatus: teacherGradeSubmissions.reviewStatus,
        isSubmitted: teacherGradeSubmissions.isSubmitted,
        submittedAt: teacherGradeSubmissions.submittedAt,
        reviewedAt: teacherGradeSubmissions.reviewedAt,
        createdAt: teacherGradeSubmissions.createdAt,
        updatedAt: teacherGradeSubmissions.updatedAt,
        // Student info
        studentFirstName: users.firstName,
        studentLastName: users.lastName,
        studentEmail: users.email,
        // Subject info  
        subjectName: subjects.nameFr,
        subjectNameEn: subjects.nameEn,
        subjectCode: subjects.code,
        // Class info
        className: classes.name
      })
      .from(teacherGradeSubmissions)
      .leftJoin(users, eq(users.id, teacherGradeSubmissions.studentId))
      .leftJoin(subjects, eq(subjects.id, teacherGradeSubmissions.subjectId))
      .leftJoin(classes, eq(classes.id, teacherGradeSubmissions.classId))
      .where(whereConditions)
      .orderBy(teacherGradeSubmissions.updatedAt);

    // Group by class and student for organized archive view
    const organizedArchive = archiveData.reduce((acc, item) => {
      const classKey = `${item.classId}-${item.className}`;
      const studentKey = `${item.studentId}-${item.studentFirstName} ${item.studentLastName}`;
      
      if (!acc[classKey]) {
        acc[classKey] = {
          classId: item.classId,
          className: item.className,
          students: {}
        };
      }
      
      if (!acc[classKey].students[studentKey]) {
        acc[classKey].students[studentKey] = {
          studentId: item.studentId,
          studentName: `${item.studentFirstName} ${item.studentLastName}`,
          studentEmail: item.studentEmail,
          submissions: []
        };
      }
      
      acc[classKey].students[studentKey].submissions.push(item);
      
      return acc;
    }, {} as any);

    res.json({
      success: true,
      archive: organizedArchive,
      totalItems: archiveData.length,
      filters: { classId, studentId, term, status },
      message: `Found ${archiveData.length} archived submissions`
    });

  } catch (error) {
    console.error('[TEACHER_ARCHIVE] Error fetching archive:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher archive'
    });
  }
});

// POST /api/teacher/save-draft - Save grade work as draft without submitting
router.post('/save-draft', requireAuth, requireRole('Teacher'), async (req: any, res: Response) => {
  try {
    const teacherId = req.user.id;
    const schoolId = req.user.schoolId;

    // Validate request body (same as grade-entries but explicitly for drafts)
    const validation = bulkGradeEntriesSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.errors
      });
    }

    const { grades } = validation.data;
    const results = [];
    const errors = [];

    for (const gradeData of grades) {
      try {
        // Verify teacher has permission for each class and subject
        const hasPermission = await verifyTeacherPermission(
          teacherId, 
          schoolId, 
          gradeData.classId, 
          gradeData.subjectId
        );

        if (!hasPermission) {
          errors.push({
            studentId: gradeData.studentId,
            error: 'Access denied for this class and subject combination'
          });
          continue;
        }

        // Check if draft already exists
        const [existingDraft] = await db
          .select()
          .from(teacherGradeSubmissions)
          .where(
            and(
              eq(teacherGradeSubmissions.studentId, gradeData.studentId),
              eq(teacherGradeSubmissions.classId, gradeData.classId),
              eq(teacherGradeSubmissions.subjectId, gradeData.subjectId),
              eq(teacherGradeSubmissions.term, gradeData.term),
              eq(teacherGradeSubmissions.teacherId, teacherId),
              eq(teacherGradeSubmissions.schoolId, schoolId)
            )
          )
          .limit(1);

        if (existingDraft) {
          // Update existing draft
          const [updatedDraft] = await db
            .update(teacherGradeSubmissions)
            .set({
              firstEvaluation: gradeData.grade.toString(),
              termAverage: gradeData.grade.toString(),
              coefficient: gradeData.coefficient || 1,
              subjectComments: gradeData.comments,
              updatedAt: new Date(),
              isSubmitted: false, // Always false for drafts
              reviewStatus: 'draft' // Explicitly set as draft
            })
            .where(eq(teacherGradeSubmissions.id, existingDraft.id))
            .returning();

          results.push({ action: 'draft_updated', gradeEntry: updatedDraft });
        } else {
          // Create new draft
          const [newDraft] = await db
            .insert(teacherGradeSubmissions)
            .values({
              schoolId,
              studentId: gradeData.studentId,
              classId: gradeData.classId,
              subjectId: gradeData.subjectId,
              term: gradeData.term,
              teacherId,
              academicYear: '2024-2025', // TODO: Get from context
              firstEvaluation: gradeData.grade.toString(),
              termAverage: gradeData.grade.toString(),
              coefficient: gradeData.coefficient || 1,
              subjectComments: gradeData.comments,
              isSubmitted: false, // Always false for drafts
              reviewStatus: 'draft' // Explicitly set as draft
            })
            .returning();

          results.push({ action: 'draft_created', gradeEntry: newDraft });
        }

      } catch (itemError) {
        console.error('[TEACHER_SAVE_DRAFT] Error processing item:', itemError);
        errors.push({
          studentId: gradeData.studentId,
          error: 'Failed to save draft for this student'
        });
      }
    }

    res.json({
      success: true,
      results,
      errors,
      message: `Saved ${results.length} draft(s), ${errors.length} error(s)`
    });

  } catch (error) {
    console.error('[TEACHER_SAVE_DRAFT] Error saving drafts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save drafts'
    });
  }
});

export default router;
import { Router } from 'express';
import { storage } from '../storage';
import { db } from '../db';
import { 
  teacherGradeSubmissions, 
  gradeReviewHistory, 
  users, 
  subjects, 
  classes,
  reviewGradeSubmissionSchema,
  bulkReviewSchema,
  type ReviewGradeSubmissionInput,
  type BulkReviewInput
} from '../../shared/schema';
import { eq, and, sql, desc, asc, inArray, isNotNull } from 'drizzle-orm';
import { triggerGradeUpdate, triggerReviewQueueUpdate } from '../middleware/realTimeIntegration';

const router = Router();

// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// Authorization middleware - only directors and admins can review grades
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

// ===== GRADE SUBMISSION REVIEW QUEUE API =====

// Get review queue - all pending submissions for director review
router.get('/queue', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId || 1;
    
    const {
      status = 'pending',
      teacherId,
      classId,
      subjectId,
      priority,
      page = 1,
      limit = 50,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    console.log('[GRADE_REVIEW] 📋 Fetching review queue:', { status, schoolId, page, limit });

    // Build dynamic WHERE conditions
    let whereConditions = [
      eq(teacherGradeSubmissions.schoolId, schoolId),
      eq(teacherGradeSubmissions.isSubmitted, true)
    ];

    if (status !== 'all') {
      whereConditions.push(eq(teacherGradeSubmissions.reviewStatus, status as string));
    }
    if (teacherId) {
      whereConditions.push(eq(teacherGradeSubmissions.teacherId, parseInt(teacherId as string)));
    }
    if (classId) {
      whereConditions.push(eq(teacherGradeSubmissions.classId, parseInt(classId as string)));
    }
    if (subjectId) {
      whereConditions.push(eq(teacherGradeSubmissions.subjectId, parseInt(subjectId as string)));
    }
    if (priority && priority !== 'all') {
      whereConditions.push(eq(teacherGradeSubmissions.reviewPriority, priority as string));
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const sortColumn = sortBy === 'submittedAt' ? teacherGradeSubmissions.submittedAt :
                      sortBy === 'lastStatusChange' ? teacherGradeSubmissions.lastStatusChange :
                      teacherGradeSubmissions.submittedAt;

    // Get submissions with related data
    const submissions = await db.select({
      id: teacherGradeSubmissions.id,
      teacherId: teacherGradeSubmissions.teacherId,
      studentId: teacherGradeSubmissions.studentId,
      subjectId: teacherGradeSubmissions.subjectId,
      classId: teacherGradeSubmissions.classId,
      term: teacherGradeSubmissions.term,
      academicYear: teacherGradeSubmissions.academicYear,
      
      // Grade data
      firstEvaluation: teacherGradeSubmissions.firstEvaluation,
      secondEvaluation: teacherGradeSubmissions.secondEvaluation,
      thirdEvaluation: teacherGradeSubmissions.thirdEvaluation,
      termAverage: teacherGradeSubmissions.termAverage,
      coefficient: teacherGradeSubmissions.coefficient,
      subjectComments: teacherGradeSubmissions.subjectComments,
      
      // Review fields
      reviewStatus: teacherGradeSubmissions.reviewStatus,
      reviewPriority: teacherGradeSubmissions.reviewPriority,
      requiresAttention: teacherGradeSubmissions.requiresAttention,
      reviewFeedback: teacherGradeSubmissions.reviewFeedback,
      returnReason: teacherGradeSubmissions.returnReason,
      
      // Timestamps
      submittedAt: teacherGradeSubmissions.submittedAt,
      reviewedAt: teacherGradeSubmissions.reviewedAt,
      lastStatusChange: teacherGradeSubmissions.lastStatusChange,
      
      // Related data
      teacherName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`.as('teacherName'),
      teacherEmail: users.email,
      subjectName: subjects.nameFr,
      className: classes.name
    })
    .from(teacherGradeSubmissions)
    .leftJoin(users, eq(teacherGradeSubmissions.teacherId, users.id))
    .leftJoin(subjects, eq(teacherGradeSubmissions.subjectId, subjects.id))
    .leftJoin(classes, eq(teacherGradeSubmissions.classId, classes.id))
    .where(and(...whereConditions))
    .orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn))
    .limit(parseInt(limit as string))
    .offset(offset);

    // Get total count for pagination
    const totalCount = await db.select({ count: sql<number>`COUNT(*)` })
      .from(teacherGradeSubmissions)
      .where(and(...whereConditions));

    // Get summary statistics
    const summaryStats = await db.select({
      status: teacherGradeSubmissions.reviewStatus,
      count: sql<number>`COUNT(*)`
    })
    .from(teacherGradeSubmissions)
    .where(and(
      eq(teacherGradeSubmissions.schoolId, schoolId),
      eq(teacherGradeSubmissions.isSubmitted, true)
    ))
    .groupBy(teacherGradeSubmissions.reviewStatus);

    const stats = summaryStats.reduce((acc: any, stat: any) => {
      acc[stat.status] = stat.count;
      return acc;
    }, {
      pending: 0,
      under_review: 0,
      approved: 0,
      returned: 0,
      changes_requested: 0
    });

    console.log('[GRADE_REVIEW] ✅ Queue fetched:', { 
      submissionCount: submissions.length, 
      totalCount: totalCount[0]?.count || 0 
    });

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalCount[0]?.count || 0,
          totalPages: Math.ceil((totalCount[0]?.count || 0) / parseInt(limit as string))
        },
        statistics: stats
      }
    });

  } catch (error: any) {
    console.error('[GRADE_REVIEW] ❌ Error fetching queue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review queue',
      error: error.message
    });
  }
});

// Get detailed submission data for review interface
router.get('/submission/:id', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const submissionId = parseInt(req.params.id);
    const user = req.user as any;
    const schoolId = user.schoolId || 1;

    console.log('[GRADE_REVIEW] 🔍 Fetching submission details:', { submissionId, schoolId });

    // Get submission with all related data
    const submission = await db.select({
      // Submission data
      id: teacherGradeSubmissions.id,
      teacherId: teacherGradeSubmissions.teacherId,
      studentId: teacherGradeSubmissions.studentId,
      subjectId: teacherGradeSubmissions.subjectId,
      classId: teacherGradeSubmissions.classId,
      schoolId: teacherGradeSubmissions.schoolId,
      term: teacherGradeSubmissions.term,
      academicYear: teacherGradeSubmissions.academicYear,
      
      // Grade data
      firstEvaluation: teacherGradeSubmissions.firstEvaluation,
      secondEvaluation: teacherGradeSubmissions.secondEvaluation,
      thirdEvaluation: teacherGradeSubmissions.thirdEvaluation,
      termAverage: teacherGradeSubmissions.termAverage,
      coefficient: teacherGradeSubmissions.coefficient,
      maxScore: teacherGradeSubmissions.maxScore,
      subjectComments: teacherGradeSubmissions.subjectComments,
      studentRank: teacherGradeSubmissions.studentRank,
      
      // Review data
      reviewStatus: teacherGradeSubmissions.reviewStatus,
      reviewedBy: teacherGradeSubmissions.reviewedBy,
      reviewedAt: teacherGradeSubmissions.reviewedAt,
      reviewFeedback: teacherGradeSubmissions.reviewFeedback,
      returnReason: teacherGradeSubmissions.returnReason,
      reviewPriority: teacherGradeSubmissions.reviewPriority,
      requiresAttention: teacherGradeSubmissions.requiresAttention,
      
      // Timestamps
      submittedAt: teacherGradeSubmissions.submittedAt,
      lastStatusChange: teacherGradeSubmissions.lastStatusChange,
      createdAt: teacherGradeSubmissions.createdAt,
      updatedAt: teacherGradeSubmissions.updatedAt,
      
      // Related data
      teacherName: sql<string>`CONCAT(teacher.first_name, ' ', teacher.last_name)`.as('teacherName'),
      teacherEmail: sql<string>`teacher.email`.as('teacherEmail'),
      subjectName: subjects.nameFr,
      subjectCode: subjects.code,
      className: classes.name,
      reviewerName: sql<string>`CONCAT(reviewer.first_name, ' ', reviewer.last_name)`.as('reviewerName')
    })
    .from(teacherGradeSubmissions)
    .leftJoin(users.as('teacher'), eq(teacherGradeSubmissions.teacherId, sql`teacher.id`))
    .leftJoin(users.as('reviewer'), eq(teacherGradeSubmissions.reviewedBy, sql`reviewer.id`))
    .leftJoin(subjects, eq(teacherGradeSubmissions.subjectId, subjects.id))
    .leftJoin(classes, eq(teacherGradeSubmissions.classId, classes.id))
    .where(and(
      eq(teacherGradeSubmissions.id, submissionId),
      eq(teacherGradeSubmissions.schoolId, schoolId)
    ))
    .limit(1);

    if (!submission.length) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Get review history for this submission
    const reviewHistory = await db.select()
      .from(gradeReviewHistory)
      .leftJoin(users, eq(gradeReviewHistory.reviewerId, users.id))
      .where(eq(gradeReviewHistory.gradeSubmissionId, submissionId))
      .orderBy(desc(gradeReviewHistory.createdAt));

    console.log('[GRADE_REVIEW] ✅ Submission details fetched:', { 
      submissionId,
      historyCount: reviewHistory.length 
    });

    res.json({
      success: true,
      data: {
        submission: submission[0],
        reviewHistory: reviewHistory.map(h => ({
          ...h.grade_review_history,
          reviewerName: h.users ? `${h.users.firstName} ${h.users.lastName}` : 'Unknown Reviewer'
        }))
      }
    });

  } catch (error: any) {
    console.error('[GRADE_REVIEW] ❌ Error fetching submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission details',
      error: error.message
    });
  }
});

// Review single submission (approve, return, request changes)
router.post('/review', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId || 1;
    
    // Validate request body
    const validationResult = reviewGradeSubmissionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validationResult.error.errors
      });
    }

    const { submissionId, reviewAction, feedback, returnReason, reviewPriority } = validationResult.data;
    
    console.log('[GRADE_REVIEW] 🔄 Processing review action:', { 
      submissionId, 
      reviewAction, 
      reviewerId: user.id 
    });

    // Get current submission for audit trail
    const currentSubmission = await db.select()
      .from(teacherGradeSubmissions)
      .where(and(
        eq(teacherGradeSubmissions.id, submissionId),
        eq(teacherGradeSubmissions.schoolId, schoolId)
      ))
      .limit(1);

    if (!currentSubmission.length) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    const submission = currentSubmission[0];
    const previousStatus = submission.reviewStatus;
    
    // Start transaction for atomic updates
    const result = await db.transaction(async (tx) => {
      // Update submission status
      const updatedSubmission = await tx.update(teacherGradeSubmissions)
        .set({
          reviewStatus: reviewAction,
          reviewedBy: user.id,
          reviewedAt: new Date(),
          reviewFeedback: feedback || null,
          returnReason: returnReason || null,
          reviewPriority: reviewPriority || submission.reviewPriority,
          requiresAttention: reviewAction === 'returned' || reviewAction === 'changes_requested',
          lastStatusChange: new Date(),
          updatedAt: new Date()
        })
        .where(eq(teacherGradeSubmissions.id, submissionId))
        .returning();

      // Create review history entry
      await tx.insert(gradeReviewHistory).values({
        gradeSubmissionId: submissionId,
        reviewerId: user.id,
        reviewAction,
        previousStatus,
        newStatus: reviewAction,
        feedback: feedback || null,
        returnReason: returnReason || null,
        reviewPriority: reviewPriority || 'normal',
        previousGradeData: {
          firstEvaluation: submission.firstEvaluation,
          secondEvaluation: submission.secondEvaluation,
          thirdEvaluation: submission.thirdEvaluation,
          termAverage: submission.termAverage,
          subjectComments: submission.subjectComments
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || null
      });

      return updatedSubmission[0];
    });

    // Trigger real-time updates
    triggerGradeUpdate(submissionId, previousStatus, reviewAction, user.id, feedback);
    
    // Update review queue
    if (reviewAction === 'approved' || reviewAction === 'returned') {
      triggerReviewQueueUpdate('REMOVE', submissionId);
    } else {
      triggerReviewQueueUpdate('UPDATE', submissionId);
    }

    console.log('[GRADE_REVIEW] ✅ Review completed:', { 
      submissionId, 
      action: reviewAction,
      previousStatus,
      newStatus: reviewAction
    });

    res.json({
      success: true,
      message: `Submission ${reviewAction} successfully`,
      data: {
        submissionId,
        reviewAction,
        previousStatus,
        newStatus: reviewAction,
        reviewedBy: user.id,
        reviewedAt: new Date()
      }
    });

  } catch (error: any) {
    console.error('[GRADE_REVIEW] ❌ Error processing review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process review',
      error: error.message
    });
  }
});

// Bulk review operations
router.post('/bulk-review', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId || 1;
    
    // Validate request body
    const validationResult = bulkReviewSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validationResult.error.errors
      });
    }

    const { submissionIds, reviewAction, feedback, returnReason } = validationResult.data;
    
    console.log('[GRADE_REVIEW] 📦 Processing bulk review:', { 
      count: submissionIds.length, 
      reviewAction,
      reviewerId: user.id 
    });

    // Get current submissions for audit trail
    const currentSubmissions = await db.select()
      .from(teacherGradeSubmissions)
      .where(and(
        inArray(teacherGradeSubmissions.id, submissionIds),
        eq(teacherGradeSubmissions.schoolId, schoolId)
      ));

    if (currentSubmissions.length !== submissionIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some submissions not found or access denied'
      });
    }

    // Process bulk update in transaction
    const results = await db.transaction(async (tx) => {
      const updates = [];
      const historyEntries = [];

      for (const submission of currentSubmissions) {
        // Update submission
        const updated = await tx.update(teacherGradeSubmissions)
          .set({
            reviewStatus: reviewAction,
            reviewedBy: user.id,
            reviewedAt: new Date(),
            reviewFeedback: feedback || null,
            returnReason: returnReason || null,
            requiresAttention: reviewAction === 'returned' || reviewAction === 'changes_requested',
            lastStatusChange: new Date(),
            updatedAt: new Date()
          })
          .where(eq(teacherGradeSubmissions.id, submission.id))
          .returning();

        updates.push(updated[0]);

        // Prepare history entry
        historyEntries.push({
          gradeSubmissionId: submission.id,
          reviewerId: user.id,
          reviewAction,
          previousStatus: submission.reviewStatus,
          newStatus: reviewAction,
          feedback: feedback || null,
          returnReason: returnReason || null,
          reviewPriority: 'normal',
          previousGradeData: {
            firstEvaluation: submission.firstEvaluation,
            secondEvaluation: submission.secondEvaluation,
            thirdEvaluation: submission.thirdEvaluation,
            termAverage: submission.termAverage,
            subjectComments: submission.subjectComments
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent') || null
        });
      }

      // Insert all history entries
      await tx.insert(gradeReviewHistory).values(historyEntries);

      return updates;
    });

    // Trigger real-time updates for bulk operations
    submissionIds.forEach(id => {
      const submission = currentSubmissions.find(s => s.id === id);
      if (submission) {
        triggerGradeUpdate(id, submission.reviewStatus, reviewAction, user.id, feedback);
        
        if (reviewAction === 'approved' || reviewAction === 'returned') {
          triggerReviewQueueUpdate('REMOVE', id);
        } else {
          triggerReviewQueueUpdate('UPDATE', id);
        }
      }
    });

    console.log('[GRADE_REVIEW] ✅ Bulk review completed:', { 
      processed: results.length, 
      action: reviewAction
    });

    res.json({
      success: true,
      message: `${results.length} submissions ${reviewAction} successfully`,
      data: {
        processed: results.length,
        reviewAction,
        submissionIds,
        reviewedBy: user.id,
        reviewedAt: new Date()
      }
    });

  } catch (error: any) {
    console.error('[GRADE_REVIEW] ❌ Error processing bulk review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk review',
      error: error.message
    });
  }
});

// Get review statistics for dashboard
router.get('/statistics', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId || 1;
    
    console.log('[GRADE_REVIEW] 📊 Fetching review statistics for school:', schoolId);

    // Get overall statistics
    const overallStats = await db.select({
      reviewStatus: teacherGradeSubmissions.reviewStatus,
      reviewPriority: teacherGradeSubmissions.reviewPriority,
      count: sql<number>`COUNT(*)`
    })
    .from(teacherGradeSubmissions)
    .where(and(
      eq(teacherGradeSubmissions.schoolId, schoolId),
      eq(teacherGradeSubmissions.isSubmitted, true)
    ))
    .groupBy(teacherGradeSubmissions.reviewStatus, teacherGradeSubmissions.reviewPriority);

    // Get submissions by teacher
    const teacherStats = await db.select({
      teacherId: teacherGradeSubmissions.teacherId,
      teacherName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      pending: sql<number>`SUM(CASE WHEN ${teacherGradeSubmissions.reviewStatus} = 'pending' THEN 1 ELSE 0 END)`,
      approved: sql<number>`SUM(CASE WHEN ${teacherGradeSubmissions.reviewStatus} = 'approved' THEN 1 ELSE 0 END)`,
      returned: sql<number>`SUM(CASE WHEN ${teacherGradeSubmissions.reviewStatus} = 'returned' THEN 1 ELSE 0 END)`,
      total: sql<number>`COUNT(*)`
    })
    .from(teacherGradeSubmissions)
    .leftJoin(users, eq(teacherGradeSubmissions.teacherId, users.id))
    .where(and(
      eq(teacherGradeSubmissions.schoolId, schoolId),
      eq(teacherGradeSubmissions.isSubmitted, true)
    ))
    .groupBy(teacherGradeSubmissions.teacherId, sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`);

    // Get recent activity
    const recentActivity = await db.select({
      id: gradeReviewHistory.id,
      reviewAction: gradeReviewHistory.reviewAction,
      createdAt: gradeReviewHistory.createdAt,
      reviewerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      subjectName: subjects.nameFr
    })
    .from(gradeReviewHistory)
    .leftJoin(users, eq(gradeReviewHistory.reviewerId, users.id))
    .leftJoin(teacherGradeSubmissions, eq(gradeReviewHistory.gradeSubmissionId, teacherGradeSubmissions.id))
    .leftJoin(subjects, eq(teacherGradeSubmissions.subjectId, subjects.id))
    .where(eq(teacherGradeSubmissions.schoolId, schoolId))
    .orderBy(desc(gradeReviewHistory.createdAt))
    .limit(10);

    // Process statistics
    const statusSummary = overallStats.reduce((acc: any, stat: any) => {
      if (!acc[stat.reviewStatus]) acc[stat.reviewStatus] = 0;
      acc[stat.reviewStatus] += stat.count;
      return acc;
    }, {});

    const prioritySummary = overallStats.reduce((acc: any, stat: any) => {
      if (!acc[stat.reviewPriority]) acc[stat.reviewPriority] = 0;
      acc[stat.reviewPriority] += stat.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        statusSummary,
        prioritySummary,
        teacherStats,
        recentActivity,
        totalSubmissions: Object.values(statusSummary).reduce((sum: number, count: any) => sum + count, 0)
      }
    });

  } catch (error: any) {
    console.error('[GRADE_REVIEW] ❌ Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// Mark submission as urgent/priority
router.patch('/priority/:id', requireAuth, requireDirectorAuth, async (req, res) => {
  try {
    const submissionId = parseInt(req.params.id);
    const { priority } = req.body;
    const user = req.user as any;
    const schoolId = user.schoolId || 1;

    if (!['urgent', 'normal', 'low'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority. Must be urgent, normal, or low'
      });
    }

    const updated = await db.update(teacherGradeSubmissions)
      .set({
        reviewPriority: priority,
        requiresAttention: priority === 'urgent',
        lastStatusChange: new Date(),
        updatedAt: new Date()
      })
      .where(and(
        eq(teacherGradeSubmissions.id, submissionId),
        eq(teacherGradeSubmissions.schoolId, schoolId)
      ))
      .returning();

    if (!updated.length) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    console.log('[GRADE_REVIEW] ⚡ Priority updated:', { submissionId, priority });

    res.json({
      success: true,
      message: `Priority updated to ${priority}`,
      data: { submissionId, priority }
    });

  } catch (error: any) {
    console.error('[GRADE_REVIEW] ❌ Error updating priority:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update priority',
      error: error.message
    });
  }
});

export default router;
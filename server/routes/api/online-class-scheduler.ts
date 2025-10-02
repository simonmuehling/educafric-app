import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { onlineClassSchedulerService } from "../../services/onlineClassSchedulerService";
import { onlineClassNotificationService } from "../../services/onlineClassNotificationService";
import { z } from "zod";

const router = Router();

/**
 * Check if user is a sandbox/test user (exempt from activation checks)
 */
const isSandboxOrTestUser = (email: string): boolean => {
  if (!email) return false;
  
  const emailLower = email.toLowerCase();
  const exemptPatterns = [
    '@test.educafric.com',
    '@educafric.demo',
    '@educafric.test',
    'sandbox@',
    'sandbox.',
    'demo@',
    'demo.',
    'test@',
    'test.',
    '.sandbox@',
    '.demo@',
    '.test@'
  ];
  
  return exemptPatterns.some(pattern => emailLower.includes(pattern));
};

/**
 * GET /api/online-class-scheduler/courses
 * Get all online courses for a school
 * Requires: Director role
 */
router.get(
  "/courses",
  requireAuth,
  async (req, res) => {
    try {
      if (!req.user || req.user.role !== "Director") {
        return res.status(403).json({
          success: false,
          message: "Accès refusé - rôle Director requis"
        });
      }

      if (!req.user.schoolId) {
        return res.status(403).json({
          success: false,
          message: "Utilisateur n'est pas associé à une école"
        });
      }

      try {
        const courses = await onlineClassSchedulerService.getSchoolCourses(req.user.schoolId);
        res.json({
          success: true,
          courses
        });
      } catch (serviceError: any) {
        // If tables don't exist yet, return empty array instead of 500 error
        if (serviceError.message?.includes('does not exist') || serviceError.message?.includes('undefined or null')) {
          console.log("[SCHEDULER_API] ⚠️ Tables not yet created - returning empty courses array");
          return res.json({
            success: true,
            courses: []
          });
        }
        throw serviceError;
      }
    } catch (error) {
      console.error("[SCHEDULER_API] ❌ Error fetching courses:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des cours"
      });
    }
  }
);

/**
 * GET /api/online-class-scheduler/sessions
 * Get all scheduled sessions for a school
 * Requires: Director role
 */
router.get(
  "/sessions",
  requireAuth,
  async (req, res) => {
    try {
      if (!req.user || req.user.role !== "Director") {
        return res.status(403).json({
          success: false,
          message: "Accès refusé - rôle Director requis"
        });
      }

      if (!req.user.schoolId) {
        return res.status(403).json({
          success: false,
          message: "Utilisateur n'est pas associé à une école"
        });
      }

      try {
        const sessions = await onlineClassSchedulerService.getSchoolSessions(req.user.schoolId);
        res.json({
          success: true,
          sessions
        });
      } catch (serviceError: any) {
        // If tables don't exist yet, return empty array instead of 500 error
        if (serviceError.message?.includes('does not exist') || serviceError.message?.includes('undefined or null')) {
          console.log("[SCHEDULER_API] ⚠️ Tables not yet created - returning empty sessions array");
          return res.json({
            success: true,
            sessions: []
          });
        }
        throw serviceError;
      }
    } catch (error) {
      console.error("[SCHEDULER_API] ❌ Error fetching sessions:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des sessions"
      });
    }
  }
);

// Schema validation for creating a single session
const createSessionSchema = z.object({
  courseId: z.number().optional(),
  teacherId: z.number(),
  classId: z.number(),
  subjectId: z.number().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  scheduledStart: z.string().refine((str) => {
    const date = new Date(str);
    return !isNaN(date.getTime());
  }, { message: "Date invalide" }).transform(str => new Date(str)),
  durationMinutes: z.number().min(15).max(240),
  autoNotify: z.boolean().optional().default(true)
});

// Schema validation for creating a recurrence rule
const createRecurrenceSchema = z.object({
  courseId: z.number().optional(),
  teacherId: z.number(),
  classId: z.number(),
  subjectId: z.number().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  ruleType: z.enum(["daily", "weekly", "biweekly", "custom"]),
  interval: z.number().min(1).optional().default(1),
  byDay: z.array(z.string()).optional(), // ["monday", "wednesday", "friday"]
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
  durationMinutes: z.number().min(15).max(240),
  startDate: z.string().refine((str) => {
    const date = new Date(str);
    return !isNaN(date.getTime());
  }, { message: "Date invalide" }).transform(str => new Date(str)),
  endDate: z.string().refine((str) => {
    const date = new Date(str);
    return !isNaN(date.getTime());
  }, { message: "Date invalide" }).transform(str => new Date(str)).optional(),
  autoNotify: z.boolean().optional().default(true)
});

// Schema for updating recurrence
const updateRecurrenceSchema = z.object({
  isActive: z.boolean().optional(),
  pausedAt: z.string().refine((str) => {
    const date = new Date(str);
    return !isNaN(date.getTime());
  }, { message: "Date invalide" }).transform(str => new Date(str)).optional(),
  pausedBy: z.number().optional(),
  pauseReason: z.string().optional(),
  endDate: z.string().refine((str) => {
    const date = new Date(str);
    return !isNaN(date.getTime());
  }, { message: "Date invalide" }).transform(str => new Date(str)).optional()
});

/**
 * POST /api/online-class-scheduler/sessions
 * Create a single scheduled session (school-created)
 * Requires: Director or SchoolAdmin role
 */
router.post(
  "/sessions",
  requireAuth,
  async (req, res) => {
    // Check if user has Director role
    if (!req.user || req.user.role !== "Director") {
      return res.status(403).json({
        success: false,
        message: "Accès refusé - rôle Director requis"
      });
    }
    try {
      const parsed = createSessionSchema.parse(req.body);
      
      if (!req.user.schoolId) {
        return res.status(403).json({
          success: false,
          message: "Utilisateur n'est pas associé à une école"
        });
      }

      const session = await onlineClassSchedulerService.createScheduledSession({
        schoolId: req.user.schoolId,
        courseId: parsed.courseId,
        teacherId: parsed.teacherId,
        classId: parsed.classId,
        subjectId: parsed.subjectId,
        title: parsed.title,
        description: parsed.description,
        scheduledStart: parsed.scheduledStart,
        durationMinutes: parsed.durationMinutes,
        autoNotify: parsed.autoNotify,
        createdBy: req.user.id,
        skipActivationCheck: isSandboxOrTestUser(req.user.email)
      });

      console.log(`[SCHEDULER_API] ✅ Single session created by ${req.user.email} for school ${req.user.schoolId}`);

      // Send notifications (fire-and-forget pattern to avoid blocking response)
      if (parsed.autoNotify && req.user.schoolId) {
        setImmediate(async () => {
          try {
            const teacherName = await onlineClassNotificationService.getTeacherName(parsed.teacherId);
            await onlineClassNotificationService.notifySessionScheduled(session.id, teacherName, req.user.schoolId!);
            console.log(`[SCHEDULER_API] 📧 Notifications sent for session ${session.id}`);
          } catch (notifError) {
            console.error(`[SCHEDULER_API] ⚠️ Notification failed for session ${session.id}:`, notifError);
          }
        });
      }

      res.json({
        success: true,
        session
      });
    } catch (error) {
      console.error("[SCHEDULER_API] ❌ Error creating session:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur lors de la création de la session"
      });
    }
  }
);

/**
 * POST /api/online-class-scheduler/recurrences
 * Create a recurrence rule for scheduled sessions
 * Requires: Director or SchoolAdmin role
 */
router.post(
  "/recurrences",
  requireAuth,
  async (req, res) => {
    // Check if user has Director role
    if (!req.user || req.user.role !== "Director") {
      return res.status(403).json({
        success: false,
        message: "Accès refusé - rôle Director requis"
      });
    }
    try {
      const parsed = createRecurrenceSchema.parse(req.body);
      
      if (!req.user.schoolId) {
        return res.status(403).json({
          success: false,
          message: "Utilisateur n'est pas associé à une école"
        });
      }

      const recurrence = await onlineClassSchedulerService.createRecurrence({
        schoolId: req.user.schoolId,
        courseId: parsed.courseId,
        teacherId: parsed.teacherId,
        classId: parsed.classId,
        subjectId: parsed.subjectId,
        title: parsed.title,
        description: parsed.description,
        ruleType: parsed.ruleType,
        interval: parsed.interval,
        byDay: parsed.byDay,
        startTime: parsed.startTime,
        durationMinutes: parsed.durationMinutes,
        startDate: parsed.startDate,
        endDate: parsed.endDate,
        autoNotify: parsed.autoNotify,
        createdBy: req.user.id,
        skipActivationCheck: isSandboxOrTestUser(req.user.email)
      });

      console.log(`[SCHEDULER_API] ✅ Recurrence created by ${req.user.email} for school ${req.user.schoolId}`);

      res.json({
        success: true,
        recurrence
      });
    } catch (error) {
      console.error("[SCHEDULER_API] ❌ Error creating recurrence:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur lors de la création de la récurrence"
      });
    }
  }
);

/**
 * GET /api/online-class-scheduler/recurrences
 * Get all recurrences for a school
 * Requires: Director or SchoolAdmin role
 */
router.get(
  "/recurrences",
  requireAuth,
  async (req, res) => {
    // Check if user has Director role
    if (!req.user || req.user.role !== "Director") {
      return res.status(403).json({
        success: false,
        message: "Accès refusé - rôle Director requis"
      });
    }
    try {
      if (!req.user.schoolId) {
        return res.status(403).json({
          success: false,
          message: "Utilisateur n'est pas associé à une école"
        });
      }

      try {
        const recurrences = await onlineClassSchedulerService.getSchoolRecurrences(req.user.schoolId);
        res.json({
          success: true,
          recurrences
        });
      } catch (serviceError: any) {
        // If tables don't exist yet, return empty array instead of 500 error
        if (serviceError.message?.includes('does not exist') || serviceError.message?.includes('undefined or null')) {
          console.log("[SCHEDULER_API] ⚠️ Tables not yet created - returning empty recurrences array");
          return res.json({
            success: true,
            recurrences: []
          });
        }
        throw serviceError;
      }
    } catch (error) {
      console.error("[SCHEDULER_API] ❌ Error fetching recurrences:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des récurrences"
      });
    }
  }
);

/**
 * PATCH /api/online-class-scheduler/recurrences/:id
 * Update a recurrence rule (pause, resume, end)
 * Requires: Director or SchoolAdmin role
 */
router.patch(
  "/recurrences/:id",
  requireAuth,
  async (req, res) => {
    // Check if user has Director role
    if (!req.user || req.user.role !== "Director") {
      return res.status(403).json({
        success: false,
        message: "Accès refusé - rôle Director requis"
      });
    }
    try {
      const recurrenceId = parseInt(req.params.id);
      const parsed = updateRecurrenceSchema.parse(req.body);
      
      if (!req.user.schoolId) {
        return res.status(403).json({
          success: false,
          message: "Utilisateur n'est pas associé à une école"
        });
      }

      // Verify recurrence belongs to school
      const recurrence = await onlineClassSchedulerService.getRecurrenceById(recurrenceId);
      if (!recurrence || recurrence.schoolId !== req.user.schoolId) {
        return res.status(404).json({
          success: false,
          message: "Récurrence non trouvée"
        });
      }

      const updated = await onlineClassSchedulerService.updateRecurrence(recurrenceId, parsed);

      console.log(`[SCHEDULER_API] ✅ Recurrence ${recurrenceId} updated by ${req.user.email}`);

      res.json({
        success: true,
        recurrence: updated
      });
    } catch (error) {
      console.error("[SCHEDULER_API] ❌ Error updating recurrence:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur lors de la mise à jour de la récurrence"
      });
    }
  }
);

/**
 * POST /api/online-class-scheduler/recurrences/:id/generate
 * Manually trigger session generation for a recurrence
 * Requires: Director or SchoolAdmin role
 */
router.post(
  "/recurrences/:id/generate",
  requireAuth,
  async (req, res) => {
    // Check if user has Director role
    if (!req.user || req.user.role !== "Director") {
      return res.status(403).json({
        success: false,
        message: "Accès refusé - rôle Director requis"
      });
    }
    try {
      const recurrenceId = parseInt(req.params.id);
      const weeksAhead = parseInt(req.body.weeksAhead) || 4;
      
      if (!req.user.schoolId) {
        return res.status(403).json({
          success: false,
          message: "Utilisateur n'est pas associé à une école"
        });
      }

      // Verify recurrence belongs to school
      const recurrence = await onlineClassSchedulerService.getRecurrenceById(recurrenceId);
      if (!recurrence || recurrence.schoolId !== req.user.schoolId) {
        return res.status(404).json({
          success: false,
          message: "Récurrence non trouvée"
        });
      }

      const sessions = await onlineClassSchedulerService.generateSessionsFromRecurrence(
        recurrenceId,
        weeksAhead
      );

      console.log(`[SCHEDULER_API] ✅ Generated ${sessions.length} sessions for recurrence ${recurrenceId}`);

      res.json({
        success: true,
        generatedCount: sessions.length,
        sessions
      });
    } catch (error) {
      console.error("[SCHEDULER_API] ❌ Error generating sessions:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur lors de la génération des sessions"
      });
    }
  }
);

/**
 * PATCH /api/online-class-scheduler/sessions/:id
 * Update a scheduled session
 * Requires: Director role
 */
router.patch(
  "/sessions/:id",
  requireAuth,
  async (req, res) => {
    if (!req.user || req.user.role !== "Director") {
      return res.status(403).json({
        success: false,
        message: "Accès refusé - rôle Director requis"
      });
    }
    
    try {
      const sessionId = parseInt(req.params.id);
      
      if (!req.user.schoolId) {
        return res.status(403).json({
          success: false,
          message: "Utilisateur n'est pas associé à une école"
        });
      }

      const updateSessionSchema = z.object({
        teacherId: z.string().optional(),
        classId: z.string().optional(),
        subjectId: z.string().optional(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        scheduledStart: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, 'Invalid datetime format').optional(),
        durationMinutes: z.coerce.number().min(15).max(240).optional()
      });

      const validatedData = updateSessionSchema.parse(req.body);

      // Verify session belongs to school - SECURITY: Prevent cross-school access
      const session = await onlineClassSchedulerService.getSessionById(sessionId);
      if (!session || session.creatorType !== "school") {
        return res.status(404).json({
          success: false,
          message: "Session non trouvée"
        });
      }

      // SECURITY: Verify session belongs to user's school
      const { onlineCourses, classes } = await import("@shared/schema");
      const { db } = await import("../../db");
      const { eq } = await import("drizzle-orm");
      
      let belongsToSchool = false;

      if (session.courseId) {
        const [course] = await db
          .select()
          .from(onlineCourses)
          .where(eq(onlineCourses.id, session.courseId))
          .limit(1);
        
        belongsToSchool = course && course.schoolId === req.user.schoolId;
      } else if (session.classId) {
        const [classInfo] = await db
          .select()
          .from(classes)
          .where(eq(classes.id, session.classId))
          .limit(1);
        
        belongsToSchool = classInfo && classInfo.schoolId === req.user.schoolId;
      }

      if (!belongsToSchool) {
        return res.status(403).json({
          success: false,
          message: "Accès refusé - cette session n'appartient pas à votre école"
        });
      }

      // Update the session
      await onlineClassSchedulerService.updateClassSession(sessionId, validatedData);

      console.log(`[SCHEDULER_API] ✅ Session ${sessionId} updated by ${req.user.email}`);

      res.json({
        success: true,
        message: "Session mise à jour avec succès"
      });
    } catch (error) {
      console.error("[SCHEDULER_API] ❌ Error updating session:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour de la session"
      });
    }
  }
);

/**
 * DELETE /api/online-class-scheduler/sessions/:id
 * Cancel a scheduled session
 * Requires: Director or SchoolAdmin role
 */
router.delete(
  "/sessions/:id",
  requireAuth,
  async (req, res) => {
    // Check if user has Director role
    if (!req.user || req.user.role !== "Director") {
      return res.status(403).json({
        success: false,
        message: "Accès refusé - rôle Director requis"
      });
    }
    try {
      const sessionId = parseInt(req.params.id);
      
      if (!req.user.schoolId) {
        return res.status(403).json({
          success: false,
          message: "Utilisateur n'est pas associé à une école"
        });
      }

      // Verify session belongs to school (through course) - SECURITY: Prevent cross-school access
      const session = await onlineClassSchedulerService.getSessionById(sessionId);
      if (!session || session.creatorType !== "school") {
        return res.status(404).json({
          success: false,
          message: "Session non trouvée"
        });
      }

      // SECURITY: Verify session belongs to user's school by checking course's school
      const { onlineCourses } = await import("@shared/schema");
      const { db } = await import("../../db");
      const { eq } = await import("drizzle-orm");
      
      const [course] = await db
        .select()
        .from(onlineCourses)
        .where(eq(onlineCourses.id, session.courseId))
        .limit(1);

      if (!course || course.schoolId !== req.user.schoolId) {
        return res.status(403).json({
          success: false,
          message: "Accès refusé - cette session n'appartient pas à votre école"
        });
      }

      await onlineClassSchedulerService.cancelSession(sessionId);

      console.log(`[SCHEDULER_API] ✅ Session ${sessionId} cancelled by ${req.user.email}`);

      res.json({
        success: true,
        message: "Session annulée avec succès"
      });
    } catch (error) {
      console.error("[SCHEDULER_API] ❌ Error cancelling session:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'annulation de la session"
      });
    }
  }
);

/**
 * GET /api/online-class-scheduler/teacher/:teacherId/sessions
 * Get scheduled sessions for a specific teacher (for school view)
 * Requires: Director or SchoolAdmin role
 */
router.get(
  "/teacher/:teacherId/sessions",
  requireAuth,
  async (req, res) => {
    // Check if user has Director role
    if (!req.user || req.user.role !== "Director") {
      return res.status(403).json({
        success: false,
        message: "Accès refusé - rôle Director requis"
      });
    }
    try {
      const teacherId = parseInt(req.params.teacherId);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      if (!req.user.schoolId) {
        return res.status(403).json({
          success: false,
          message: "Utilisateur n'est pas associé à une école"
        });
      }

      // SECURITY: Verify teacher belongs to user's school
      const { users } = await import("@shared/schema");
      const { db } = await import("../../db");
      const { eq } = await import("drizzle-orm");
      
      const [teacher] = await db
        .select()
        .from(users)
        .where(eq(users.id, teacherId))
        .limit(1);

      if (!teacher || teacher.schoolId !== req.user.schoolId) {
        return res.status(403).json({
          success: false,
          message: "Accès refusé - cet enseignant n'appartient pas à votre école"
        });
      }

      const sessions = await onlineClassSchedulerService.getTeacherScheduledSessions(
        teacherId,
        startDate,
        endDate
      );

      res.json({
        success: true,
        sessions
      });
    } catch (error) {
      console.error("[SCHEDULER_API] ❌ Error fetching teacher sessions:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des sessions"
      });
    }
  }
);

export default router;

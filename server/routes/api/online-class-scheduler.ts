import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { onlineClassSchedulerService } from "../../services/onlineClassSchedulerService";
import { z } from "zod";

const router = Router();

// Schema validation for creating a single session
const createSessionSchema = z.object({
  courseId: z.number(),
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
  courseId: z.number(),
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
 * POST /api/school-scheduler/sessions
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
        createdBy: req.user.id
      });

      console.log(`[SCHEDULER_API] ✅ Single session created by ${req.user.email} for school ${req.user.schoolId}`);

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
 * POST /api/school-scheduler/recurrences
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
        createdBy: req.user.id
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
 * GET /api/school-scheduler/recurrences
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

      const recurrences = await onlineClassSchedulerService.getSchoolRecurrences(req.user.schoolId);

      res.json({
        success: true,
        recurrences
      });
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
 * PATCH /api/school-scheduler/recurrences/:id
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
 * POST /api/school-scheduler/recurrences/:id/generate
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
 * DELETE /api/school-scheduler/sessions/:id
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
 * GET /api/school-scheduler/teacher/:teacherId/sessions
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

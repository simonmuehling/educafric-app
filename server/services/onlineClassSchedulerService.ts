import { db } from "../db";
import { 
  classSessions, 
  onlineClassRecurrences, 
  onlineCourses,
  users,
  classes,
  onlineClassActivations
} from "@shared/schema";
import { eq, and, gte, lte, isNull, or, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

interface CreateSessionInput {
  schoolId: number;
  courseId?: number;
  teacherId: number;
  classId: number;
  subjectId?: number;
  title: string;
  description?: string;
  scheduledStart: Date;
  durationMinutes: number;
  createdBy: number;
  autoNotify?: boolean;
  skipActivationCheck?: boolean;
}

interface CreateRecurrenceInput {
  schoolId: number;
  courseId?: number;
  teacherId: number;
  classId: number;
  subjectId?: number;
  title: string;
  description?: string;
  ruleType: "daily" | "weekly" | "biweekly" | "custom";
  interval?: number;
  byDay?: string[]; // ["monday", "wednesday", "friday"]
  startTime: string; // "14:00"
  durationMinutes: number;
  startDate: Date;
  endDate?: Date;
  createdBy: number;
  autoNotify?: boolean;
  skipActivationCheck?: boolean;
}

interface RecurrenceUpdate {
  isActive?: boolean;
  pausedAt?: Date;
  pausedBy?: number;
  pauseReason?: string;
  endDate?: Date;
}

export class OnlineClassSchedulerService {
  
  /**
   * Create a single scheduled session (school-created)
   */
  async createScheduledSession(input: CreateSessionInput) {
    // Verify school has active online class module (skip for sandbox users)
    if (!input.skipActivationCheck) {
      const activation = await db
        .select()
        .from(onlineClassActivations)
        .where(
          and(
            eq(onlineClassActivations.activatorType, "school"),
            eq(onlineClassActivations.activatorId, input.schoolId),
            eq(onlineClassActivations.status, "active")
          )
        )
        .limit(1);

      if (activation.length === 0) {
        throw new Error("École n'a pas de module Classes en Ligne activé");
      }
    } else {
      console.log(`[SCHEDULER_SERVICE] ✅ Sandbox user - skipping activation check for school ${input.schoolId}`);
    }

    // Generate unique room name
    const roomName = `school-${input.schoolId}-${nanoid(10)}`;

    // Calculate scheduled end time
    const scheduledEnd = new Date(input.scheduledStart);
    scheduledEnd.setMinutes(scheduledEnd.getMinutes() + input.durationMinutes);

    // Create session
    const [session] = await db
      .insert(classSessions)
      .values({
        courseId: input.courseId ?? null,
        teacherId: input.teacherId,
        classId: input.classId,
        subjectId: input.subjectId ?? null,
        title: input.title,
        description: input.description ?? null,
        scheduledStart: input.scheduledStart,
        scheduledEnd,
        roomName,
        status: "scheduled",
        maxDuration: input.durationMinutes,
        createdBy: input.createdBy,
        creatorType: "school",
        notificationsSent: false,
        lobbyEnabled: true,
        chatEnabled: true,
        screenShareEnabled: true
      } as any)
      .returning();

    // Send notifications if auto-notify enabled
    if (input.autoNotify !== false) {
      await this.notifyStudentsAndParents(session.id, input.classId);
    }

    return session;
  }

  /**
   * Create a recurrence rule for scheduled sessions
   */
  async createRecurrence(input: CreateRecurrenceInput) {
    // Verify school has active online class module (skip for sandbox users)
    if (!input.skipActivationCheck) {
      const activation = await db
        .select()
        .from(onlineClassActivations)
        .where(
          and(
            eq(onlineClassActivations.activatorType, "school"),
            eq(onlineClassActivations.activatorId, input.schoolId),
            eq(onlineClassActivations.status, "active")
          )
        )
        .limit(1);

      if (activation.length === 0) {
        throw new Error("École n'a pas de module Classes en Ligne activé");
      }
    } else {
      console.log(`[SCHEDULER_SERVICE] ✅ Sandbox user - skipping activation check for recurrence in school ${input.schoolId}`);
    }

    // Create recurrence rule
    const [recurrence] = await db
      .insert(onlineClassRecurrences)
      .values({
        schoolId: input.schoolId,
        courseId: input.courseId ?? null,
        teacherId: input.teacherId,
        classId: input.classId,
        subjectId: input.subjectId ?? null,
        title: input.title,
        description: input.description ?? null,
        ruleType: input.ruleType,
        interval: input.interval ?? 1,
        byDay: input.byDay ? JSON.stringify(input.byDay) : null,
        startTime: input.startTime,
        durationMinutes: input.durationMinutes,
        startDate: input.startDate,
        endDate: input.endDate ?? null,
        maxDuration: input.durationMinutes,
        autoNotify: input.autoNotify ?? true,
        createdBy: input.createdBy,
        isActive: true,
        occurrencesGenerated: 0
      } as any)
      .returning();

    // Generate initial batch of sessions (next 4 weeks)
    await this.generateSessionsFromRecurrence(recurrence.id);

    return recurrence;
  }

  /**
   * Generate sessions from a recurrence rule
   * Generates sessions for the next 4 weeks by default
   * Checks for existing sessions to avoid duplicates
   */
  async generateSessionsFromRecurrence(recurrenceId: number, weeksAhead: number = 4) {
    const [recurrence] = await db
      .select()
      .from(onlineClassRecurrences)
      .where(eq(onlineClassRecurrences.id, recurrenceId));

    if (!recurrence || !recurrence.isActive) {
      return [];
    }

    const now = new Date();
    const generationStart = recurrence.startDate > now ? recurrence.startDate : now;
    const generationEnd = new Date(generationStart);
    generationEnd.setDate(generationEnd.getDate() + (weeksAhead * 7));

    // Respect endDate if set
    if (recurrence.endDate && generationEnd > recurrence.endDate) {
      generationEnd.setTime(recurrence.endDate.getTime());
    }

    // Get existing sessions for this recurrence to avoid duplicates
    const existingSessions = await db
      .select()
      .from(classSessions)
      .where(
        and(
          eq(classSessions.recurrenceId, recurrenceId),
          gte(classSessions.scheduledStart, generationStart),
          lte(classSessions.scheduledStart, generationEnd)
        )
      );

    const existingDates = new Set(
      existingSessions.map(s => s.scheduledStart.toISOString().split('T')[0])
    );

    const sessions = [];
    const dayMapping: { [key: string]: number } = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 0
    };

    let currentDate = new Date(recurrence.startDate);
    currentDate.setHours(0, 0, 0, 0);
    
    const interval = recurrence.interval || 1;
    let weekCounter = 0;

    while (currentDate <= generationEnd) {
      let shouldGenerate = false;

      if (recurrence.ruleType === "daily") {
        // Generate every N days
        const daysSinceStart = Math.floor((currentDate.getTime() - recurrence.startDate.getTime()) / (1000 * 60 * 60 * 24));
        shouldGenerate = daysSinceStart % interval === 0;
      } else if (recurrence.ruleType === "weekly") {
        // Generate on specific days every N weeks
        const dayOfWeek = currentDate.getDay();
        const byDay = recurrence.byDay ? JSON.parse(recurrence.byDay) : [];
        const isCorrectDay = byDay.length > 0 ? byDay.some((day: string) => dayMapping[day.toLowerCase()] === dayOfWeek) : false;
        const weeksSinceStart = Math.floor((currentDate.getTime() - recurrence.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
        shouldGenerate = isCorrectDay && (weeksSinceStart % interval === 0);
      } else if (recurrence.ruleType === "biweekly") {
        // Biweekly = every 2 weeks on specific days
        const dayOfWeek = currentDate.getDay();
        const byDay = recurrence.byDay ? JSON.parse(recurrence.byDay) : [];
        const isCorrectDay = byDay.length > 0 ? byDay.some((day: string) => dayMapping[day.toLowerCase()] === dayOfWeek) : false;
        const weeksSinceStart = Math.floor((currentDate.getTime() - recurrence.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
        shouldGenerate = isCorrectDay && (weeksSinceStart % 2 === 0);
      }

      if (shouldGenerate && currentDate >= generationStart) {
        const dateKey = currentDate.toISOString().split('T')[0];
        
        // Skip if session already exists for this date
        if (!existingDates.has(dateKey)) {
          // Parse start time
          const [hours, minutes] = recurrence.startTime.split(':').map(Number);
          const scheduledStart = new Date(currentDate);
          scheduledStart.setHours(hours, minutes, 0, 0);

          // Skip if in the past
          if (scheduledStart > now) {
            const scheduledEnd = new Date(scheduledStart);
            scheduledEnd.setMinutes(scheduledEnd.getMinutes() + recurrence.durationMinutes);

            // Generate unique room name
            const roomName = `school-${recurrence.schoolId}-recur-${recurrenceId}-${nanoid(8)}`;

            const [session] = await db
              .insert(classSessions)
              .values({
                courseId: recurrence.courseId,
                teacherId: recurrence.teacherId,
                classId: recurrence.classId,
                subjectId: recurrence.subjectId,
                title: recurrence.title,
                description: recurrence.description,
                scheduledStart,
                scheduledEnd,
                roomName,
                status: "scheduled",
                maxDuration: recurrence.durationMinutes,
                createdBy: recurrence.createdBy,
                creatorType: "school",
                recurrenceId: recurrence.id,
                notificationsSent: false,
                lobbyEnabled: true,
                chatEnabled: true,
                screenShareEnabled: true
              } as any)
              .returning();

            sessions.push(session);

            // Send notifications if auto-notify enabled
            if (recurrence.autoNotify) {
              await this.notifyStudentsAndParents(session.id, recurrence.classId);
            }
          }
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Update recurrence tracking only if we generated new sessions
    if (sessions.length > 0) {
      await db
        .update(onlineClassRecurrences)
        .set({
          occurrencesGenerated: (recurrence.occurrencesGenerated || 0) + sessions.length,
          lastGenerated: new Date(),
          nextGeneration: generationEnd
        } as any)
        .where(eq(onlineClassRecurrences.id, recurrenceId));
    }

    return sessions;
  }

  /**
   * Update recurrence rule (pause, resume, end)
   */
  async updateRecurrence(recurrenceId: number, updates: RecurrenceUpdate) {
    await db
      .update(onlineClassRecurrences)
      .set(updates as any)
      .where(eq(onlineClassRecurrences.id, recurrenceId));

    return this.getRecurrenceById(recurrenceId);
  }

  /**
   * Get recurrence by ID
   */
  async getRecurrenceById(recurrenceId: number) {
    const [recurrence] = await db
      .select()
      .from(onlineClassRecurrences)
      .where(eq(onlineClassRecurrences.id, recurrenceId));

    return recurrence;
  }

  /**
   * Delete a recurrence rule
   */
  async deleteRecurrence(recurrenceId: number) {
    await db
      .delete(onlineClassRecurrences)
      .where(eq(onlineClassRecurrences.id, recurrenceId));
    return { deleted: true };
  }

  /**
   * Get all recurrences for a school
   */
  async getSchoolRecurrences(schoolId: number) {
    return db
      .select()
      .from(onlineClassRecurrences)
      .where(eq(onlineClassRecurrences.schoolId, schoolId))
      .orderBy(onlineClassRecurrences.createdAt);
  }

  /**
   * Get all online courses for a school with teacher and class info
   */
  async getSchoolCourses(schoolId: number) {
    const courses = await db
      .select({
        id: onlineCourses.id,
        title: onlineCourses.title,
        description: onlineCourses.description,
        teacherId: onlineCourses.teacherId,
        teacherName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        classId: onlineCourses.classId,
        className: classes.name,
        subjectId: onlineCourses.subjectId,
        createdAt: onlineCourses.createdAt
      })
      .from(onlineCourses)
      .leftJoin(users, eq(onlineCourses.teacherId, users.id))
      .leftJoin(classes, eq(onlineCourses.classId, classes.id))
      .where(eq(onlineCourses.schoolId, schoolId))
      .orderBy(onlineCourses.createdAt);

    return courses;
  }

  /**
   * Get all scheduled sessions for a school
   * Now supports sessions with or without pre-existing courses (LEFT JOIN)
   */
  async getSchoolSessions(schoolId: number) {
    // First, we need to get the teacher's school ID to filter sessions
    // For sessions with courses, use course.schoolId
    // For sessions without courses, use teacher.schoolId
    const sessions = await db
      .select({
        id: classSessions.id,
        courseId: classSessions.courseId,
        courseName: onlineCourses.title,
        teacherId: classSessions.teacherId,
        teacherName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        classId: classSessions.classId,
        className: classes.name,
        title: classSessions.title,
        description: classSessions.description,
        scheduledStart: classSessions.scheduledStart,
        scheduledEnd: classSessions.scheduledEnd,
        status: classSessions.status,
        roomName: classSessions.roomName,
        createdAt: classSessions.createdAt
      })
      .from(classSessions)
      .leftJoin(onlineCourses, eq(classSessions.courseId, onlineCourses.id))
      .leftJoin(users, eq(classSessions.teacherId, users.id))
      .leftJoin(classes, eq(classSessions.classId, classes.id))
      .where(
        or(
          eq(onlineCourses.schoolId, schoolId),
          and(
            isNull(classSessions.courseId),
            eq(users.schoolId, schoolId)
          )
        )
      )
      .orderBy(classSessions.scheduledStart);

    return sessions;
  }

  /**
   * Get scheduled sessions for a teacher (school-created only)
   * Now directly filters by teacherId field in class_sessions table
   */
  async getTeacherScheduledSessions(teacherId: number, startDate?: Date, endDate?: Date) {
    const conditions = [
      eq(classSessions.creatorType, "school"),
      eq(classSessions.teacherId, teacherId)
    ];

    if (startDate) {
      conditions.push(gte(classSessions.scheduledStart, startDate));
    }

    if (endDate) {
      conditions.push(lte(classSessions.scheduledStart, endDate));
    }

    console.log(`[SCHEDULER_SERVICE] Fetching sessions for teacherId: ${teacherId}`);

    const sessions = await db
      .select()
      .from(classSessions)
      .where(and(...conditions))
      .orderBy(classSessions.scheduledStart);

    console.log(`[SCHEDULER_SERVICE] Found ${sessions.length} sessions for teacher ${teacherId}`);

    return sessions;
  }

  /**
   * Send notifications to teacher, students and parents
   */
  private async notifyStudentsAndParents(sessionId: number, classId: number) {
    const { OnlineClassNotificationService } = await import('./onlineClassNotificationService');
    const notificationService = OnlineClassNotificationService.getInstance();
    
    // Get session details to pass schoolId and teacher name
    const [session] = await db
      .select()
      .from(classSessions)
      .where(eq(classSessions.id, sessionId))
      .limit(1);
    
    if (!session) {
      console.error(`[SCHEDULER_SERVICE] Session ${sessionId} not found for notifications`);
      return;
    }
    
    // Get teacher details
    const [teacher] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        schoolId: users.schoolId
      })
      .from(users)
      .where(eq(users.id, session.teacherId))
      .limit(1);
    
    if (!teacher?.schoolId) {
      console.error(`[SCHEDULER_SERVICE] No schoolId found for teacher ${session.teacherId}`);
      return;
    }
    
    const teacherName = `${teacher.firstName} ${teacher.lastName}`;
    
    // Send notifications to teacher, students, and parents
    await notificationService.notifySessionScheduled(sessionId, teacherName, teacher.schoolId);
    
    // Mark notifications as sent
    await db
      .update(classSessions)
      .set({ notificationsSent: true } as any)
      .where(eq(classSessions.id, sessionId));

    console.log(`[SCHEDULER_SERVICE] Notifications sent for session ${sessionId} in class ${classId} to teacher, students, and parents`);
  }

  /**
   * Cancel a scheduled session
   */
  async cancelSession(sessionId: number) {
    await db
      .update(classSessions)
      .set({ status: "canceled" } as any)
      .where(eq(classSessions.id, sessionId));
  }

  /**
   * Update a scheduled session
   */
  async updateClassSession(sessionId: number, updateData: any) {
    const updateFields: any = {};
    
    if (updateData.teacherId) updateFields.teacherId = parseInt(updateData.teacherId);
    if (updateData.classId) updateFields.classId = parseInt(updateData.classId);
    if (updateData.subjectId) updateFields.subjectId = parseInt(updateData.subjectId);
    if (updateData.title) updateFields.title = updateData.title;
    if (updateData.description !== undefined) updateFields.description = updateData.description;
    
    let scheduledStart = updateData.scheduledStart ? new Date(updateData.scheduledStart) : null;
    let maxDuration = updateData.durationMinutes ? parseInt(updateData.durationMinutes) : null;
    
    if (scheduledStart) updateFields.scheduledStart = scheduledStart;
    if (maxDuration) updateFields.maxDuration = maxDuration;
    
    if (scheduledStart || maxDuration) {
      const session = await this.getSessionById(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }
      
      const finalStart = scheduledStart || session.scheduledStart;
      const finalDuration = maxDuration || session.maxDuration;
      
      const scheduledEnd = new Date(finalStart);
      scheduledEnd.setMinutes(scheduledEnd.getMinutes() + finalDuration);
      updateFields.scheduledEnd = scheduledEnd;
    }
    
    await db
      .update(classSessions)
      .set(updateFields)
      .where(eq(classSessions.id, sessionId));
      
    console.log(`[SCHEDULER_SERVICE] ✅ Session ${sessionId} updated`);
  }

  /**
   * Get session by ID
   */
  async getSessionById(sessionId: number) {
    const [session] = await db
      .select()
      .from(classSessions)
      .where(eq(classSessions.id, sessionId));

    return session;
  }
}

export const onlineClassSchedulerService = new OnlineClassSchedulerService();

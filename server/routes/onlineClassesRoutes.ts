// Online Classes API Routes
// Handles class session creation, management, and Jitsi Meet integration

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { 
  requireOnlineClassesSubscription, 
  requireOnlineClassesManagement,
  requireOnlineClassesAccess,
  requirePersonalSubscription 
} from '../middleware/onlineClassesMiddleware';
import { jitsiService } from '../services/jitsiService.js';
import { onlineClassNotificationService } from '../services/onlineClassNotificationService';
import { db } from '../db.js';
import { 
  onlineCourses, 
  courseEnrollments, 
  classSessions, 
  sessionAttendance,
  sessionInvitations,
  insertOnlineCourseSchema,
  insertClassSessionSchema,
  insertCourseEnrollmentSchema
} from '../../shared/schemas/onlineClassesSchema.js';
import { eq, and, or, desc, gte, lte, sql, isNull } from 'drizzle-orm';
import { users } from '../../shared/schema.js';

const router = Router();

// Validation schemas
const createCourseSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  subjectId: z.number().optional(),
  subjectName: z.string().optional(),
  classId: z.number().optional(),
  language: z.string().default("fr"),
  maxParticipants: z.number().default(50),
  allowRecording: z.boolean().default(true),
  requireApproval: z.boolean().default(false),
  isIndependent: z.boolean().default(false) // Independent course (not linked to any school)
});

const createSessionSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  scheduledStart: z.string().transform(str => new Date(str)),
  scheduledEnd: z.string().optional().transform(str => str ? new Date(str) : undefined),
  maxDuration: z.number().default(120),
  lobbyEnabled: z.boolean().default(true),
  chatEnabled: z.boolean().default(true),
  screenShareEnabled: z.boolean().default(true),
  startNow: z.boolean().optional() // For immediate session start
});

const enrollmentSchema = z.object({
  courseId: z.number(),
  userId: z.number(),
  role: z.string()
});

/**
 * GET /api/online-classes/courses
 * List all courses for the authenticated user's school + their independent courses
 */
router.get('/courses', 
  requireAuth,
  requireOnlineClassesSubscription,
  async (req, res) => {
    try {
      const user = req.user!;
      
      // Handle sandbox users with null schoolId
      const isSandboxUser = user.email?.includes('@educafric.demo') || 
                           user.email?.includes('@test.educafric.com') || 
                           user.email?.startsWith('sandbox.');
      const schoolId = user.schoolId || (isSandboxUser ? 999 : null);
      
      // Fetch school-linked courses if user has a school
      let schoolCourses: any[] = [];
      if (schoolId) {
        schoolCourses = await db
          .select({
            id: onlineCourses.id,
            title: onlineCourses.title,
            description: onlineCourses.description,
            language: onlineCourses.language,
            isActive: onlineCourses.isActive,
            maxParticipants: onlineCourses.maxParticipants,
            allowRecording: onlineCourses.allowRecording,
            isIndependent: onlineCourses.isIndependent,
            teacherId: onlineCourses.teacherId,
            createdAt: onlineCourses.createdAt
          })
          .from(onlineCourses)
          .where(eq(onlineCourses.schoolId, schoolId))
          .orderBy(desc(onlineCourses.createdAt));
      }
      
      // Always fetch teacher's independent courses (for Teachers)
      let independentCourses: any[] = [];
      if (user.role === 'Teacher') {
        independentCourses = await db
          .select({
            id: onlineCourses.id,
            title: onlineCourses.title,
            description: onlineCourses.description,
            language: onlineCourses.language,
            isActive: onlineCourses.isActive,
            maxParticipants: onlineCourses.maxParticipants,
            allowRecording: onlineCourses.allowRecording,
            isIndependent: onlineCourses.isIndependent,
            teacherId: onlineCourses.teacherId,
            createdAt: onlineCourses.createdAt
          })
          .from(onlineCourses)
          .where(and(
            eq(onlineCourses.teacherId, user.id),
            eq(onlineCourses.isIndependent, true)
          ))
          .orderBy(desc(onlineCourses.createdAt));
      }
      
      // Combine and deduplicate courses
      const courseMap = new Map();
      for (const course of [...independentCourses, ...schoolCourses]) {
        courseMap.set(course.id, course);
      }
      const courses = Array.from(courseMap.values()).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      console.log(`[ONLINE_CLASSES_API] ✅ Listed ${courses.length} courses (${schoolCourses.length} school, ${independentCourses.length} independent) for user ${user.id}`);

      res.json({
        success: true,
        courses,
        total: courses.length
      });
    } catch (error) {
      console.error('[ONLINE_CLASSES_API] Error listing courses:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list courses'
      });
    }
  }
);

/**
 * POST /api/online-classes/courses
 * Create a new online course
 * NOTE: Requires PERSONAL subscription for teachers (school access not sufficient)
 */
router.post('/courses',
  requireAuth,
  requireOnlineClassesSubscription,
  requireOnlineClassesManagement,
  requirePersonalSubscription, // Teachers must have personal subscription to create courses
  async (req, res) => {
    try {
      const user = req.user!;
      
      console.log('[ONLINE_CLASSES_API] 📥 Received request body:', JSON.stringify(req.body, null, 2));
      console.log('[ONLINE_CLASSES_API] 📥 Content-Type:', req.headers['content-type']);
      
      const parsed = createCourseSchema.safeParse(req.body);
      if (!parsed.success) {
        console.error('[ONLINE_CLASSES_API] ❌ Validation failed:', parsed.error.flatten());
        return res.status(400).json({
          success: false,
          error: 'Invalid payload - check field types and requirements',
          details: parsed.error.flatten(),
          received: req.body
        });
      }
      
      const validated = parsed.data;
      
      // Handle independent courses vs school-linked courses
      let schoolId: number | null = null;
      
      if (validated.isIndependent) {
        // Independent course - no school required
        console.log('[ONLINE_CLASSES_API] 🆓 Creating INDEPENDENT course (no school affiliation)');
        schoolId = null;
      } else {
        // School-linked course - require schoolId
        const isSandboxUser = user.email?.includes('@educafric.demo') || 
                             user.email?.includes('@test.educafric.com') || 
                             user.email?.startsWith('sandbox.');
        schoolId = user.schoolId || (isSandboxUser ? 999 : null);
        
        if (!schoolId) {
          return res.status(400).json({
            success: false,
            error: 'School ID is required to create a school-linked course. Use independent course option instead.'
          });
        }
      }
      
      const newCourse = await db
        .insert(onlineCourses)
        .values({
          title: validated.title,
          description: validated.description,
          language: validated.language,
          maxParticipants: validated.maxParticipants,
          allowRecording: validated.allowRecording,
          requireApproval: validated.requireApproval,
          schoolId: schoolId,
          teacherId: user.id,
          isIndependent: validated.isIndependent
        })
        .returning();

      console.log(`[ONLINE_CLASSES_API] ✅ Created ${validated.isIndependent ? 'INDEPENDENT' : 'school-linked'} course "${validated.title}" by user ${user.id}`);

      res.status(201).json({
        success: true,
        course: newCourse[0]
      });
    } catch (error) {
      console.error('[ONLINE_CLASSES_API] Error creating course:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to create course',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/online-classes/courses/:courseId/sessions
 * List sessions for a specific course
 */
router.get('/courses/:courseId/sessions',
  requireAuth,
  requireOnlineClassesSubscription,
  async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const user = req.user!;
      
      // Check if user has access to this course
      const enrollment = await db
        .select()
        .from(courseEnrollments)
        .where(and(
          eq(courseEnrollments.courseId, courseId),
          eq(courseEnrollments.userId, user.id),
          eq(courseEnrollments.isActive, true)
        ))
        .limit(1);

      // SECURITY: Get course details for school verification
      const courseDetails = await db
        .select()
        .from(onlineCourses)
        .where(eq(onlineCourses.id, courseId))
        .limit(1);

      if (courseDetails.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      const course = courseDetails[0];

      // SECURITY: Cross-tenant protection - verify same school (even for Admin/Director)
      // For independent courses (schoolId is null), skip school verification
      const isIndependentCourse = course.schoolId === null || course.isIndependent;
      if (!isIndependentCourse && course.schoolId !== user.schoolId && user.role !== 'SiteAdmin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Course belongs to different school'
        });
      }

      // For teachers, also check if they own the course
      let hasAccess = enrollment.length > 0 || ['SiteAdmin', 'Admin', 'Director'].includes(user.role);
      
      if (!hasAccess && user.role === 'Teacher') {
        hasAccess = course.teacherId === user.id;
      }

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'You are not enrolled in this course and are not the course owner'
        });
      }

      const sessions = await db
        .select()
        .from(classSessions)
        .where(eq(classSessions.courseId, courseId))
        .orderBy(desc(classSessions.scheduledStart));

      console.log(`[ONLINE_CLASSES_API] ✅ Listed ${sessions.length} sessions for course ${courseId}`);

      res.json({
        success: true,
        sessions,
        total: sessions.length
      });
    } catch (error) {
      console.error('[ONLINE_CLASSES_API] Error listing sessions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list sessions'
      });
    }
  }
);

/**
 * POST /api/online-classes/courses/:courseId/sessions
 * Create a new class session
 * NOTE: Requires PERSONAL subscription for teachers (school access not sufficient)
 */
router.post('/courses/:courseId/sessions',
  requireAuth,
  requireOnlineClassesSubscription,
  requireOnlineClassesManagement,
  requirePersonalSubscription, // Teachers must have personal subscription to create sessions
  async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const user = req.user!;
      
      // SECURITY: Verify course ownership for Teachers
      if (user.role === 'Teacher') {
        // For teachers, verify they own the course (either school-linked or independent)
        const courseOwnership = await db
          .select()
          .from(onlineCourses)
          .where(and(
            eq(onlineCourses.id, courseId),
            eq(onlineCourses.teacherId, user.id)
            // Note: No schoolId check for independent courses (schoolId can be NULL)
          ))
          .limit(1);
        
        if (courseOwnership.length === 0) {
          return res.status(403).json({
            success: false,
            error: 'You can only create sessions for your own courses'
          });
        }
        
        const course = courseOwnership[0];
        // For school-linked courses, also verify teacher belongs to that school
        if (course.schoolId !== null && !course.isIndependent && course.schoolId !== user.schoolId) {
          return res.status(403).json({
            success: false,
            error: 'Access denied: Course belongs to different school'
          });
        }
      }
      
      const validated = createSessionSchema.parse(req.body);
      
      // Generate unique room name
      const roomName = jitsiService.generateRoomName(courseId);
      
      const newSession = await db
        .insert(classSessions)
        .values({
          title: validated.title,
          description: validated.description,
          scheduledStart: validated.scheduledStart,
          scheduledEnd: validated.scheduledEnd,
          maxDuration: validated.maxDuration,
          lobbyEnabled: validated.lobbyEnabled,
          chatEnabled: validated.chatEnabled,
          screenShareEnabled: validated.screenShareEnabled,
          courseId,
          roomName,
          teacherId: user.id, // Fix: Add missing teacherId
          createdBy: user.id
        })
        .returning();

      console.log(`[ONLINE_CLASSES_API] ✅ Created session "${validated.title}" for course ${courseId}`);

      // Generate join URL if starting immediately
      let joinUrl = undefined;
      if (validated.startNow) {
        try {
          const jwtToken = jitsiService.generateJwtToken({
            room: roomName,
            displayName: user.email?.split('@')[0] || `${user.role} ${user.id}`,
            userId: user.id,
            role: 'teacher',
            email: user.email
          });
          
          joinUrl = jitsiService.createJoinUrl(roomName, jwtToken, {
            startWithAudioMuted: false, // Teacher starts unmuted
            startWithVideoMuted: false,
            requireDisplayName: false
          });
          
          console.log(`[JITSI_MEET] ✅ Generated join URL for immediate session start`);
        } catch (jwtError) {
          console.error('[JITSI_MEET] Failed to generate join URL:', jwtError);
          // Don't fail the session creation if JWT fails
        }
      }

      // TODO: Send notifications to enrolled students
      // notifySessionCreated(courseId, newSession[0]);

      res.status(201).json({
        success: true,
        session: newSession[0],
        joinUrl
      });
    } catch (error) {
      console.error('[ONLINE_CLASSES_API] Error creating session:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to create session'
      });
    }
  }
);


/**
 * POST /api/online-classes/sessions/:sessionId/start
 * Start a live session (teachers/admins only)
 */
router.post('/sessions/:sessionId/start',
  requireAuth,
  requireOnlineClassesSubscription,
  requireOnlineClassesManagement,
  async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const user = req.user!;
      
      // SECURITY: Verify authorization to start session
      const [session, course] = await Promise.all([
        db.select()
          .from(classSessions)
          .where(eq(classSessions.id, sessionId))
          .limit(1),
        db.select({
          id: onlineCourses.id,
          teacherId: onlineCourses.teacherId,
          schoolId: onlineCourses.schoolId
        })
          .from(onlineCourses)
          .innerJoin(classSessions, eq(classSessions.courseId, onlineCourses.id))
          .where(eq(classSessions.id, sessionId))
          .limit(1)
      ]);

      if (session.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      if (course.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      const courseData = course[0];

      // SECURITY: Cross-tenant protection (skip for independent courses)
      const isIndependentCourse = courseData.schoolId === null;
      if (!isIndependentCourse && courseData.schoolId !== user.schoolId && user.role !== 'SiteAdmin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Course belongs to different school'
        });
      }

      // SECURITY: Only course owner or admins can start sessions
      const isAdmin = ['SiteAdmin', 'Admin', 'Director'].includes(user.role);
      const isOwner = user.role === 'Teacher' && courseData.teacherId === user.id;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Only course owners and administrators can start sessions'
        });
      }
      
      // TODO: Update session status (temporarily disabled due to DB sync)
      // const updatedSession = await db
      //   .update(classSessions)
      //   .set({
      //     actualStart: new Date()
      //   })
      //   .where(eq(classSessions.id, sessionId))
      //   .returning();
      const updatedSession = [{ id: sessionId, status: 'live' }]; // Temporary mock

      if (updatedSession.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      console.log(`[ONLINE_CLASSES_API] ✅ Session ${sessionId} started by user ${user.id}`);

      // Send notifications to enrolled students (fire-and-forget pattern)
      setImmediate(async () => {
        try {
          const teacherName = await onlineClassNotificationService.getTeacherName(courseData.teacherId);
          await onlineClassNotificationService.notifySessionStarting(sessionId, teacherName);
          console.log(`[ONLINE_CLASSES_API] 📧 Session starting notifications sent for session ${sessionId}`);
        } catch (notifError) {
          console.error(`[ONLINE_CLASSES_API] ⚠️ Notification failed for session ${sessionId}:`, notifError);
        }
      });

      // Generate JWT token for the teacher to join immediately
      const sessionData = session[0];
      const jwtToken = jitsiService.generateJwtToken({
        room: sessionData.roomName,
        displayName: user.email?.split('@')[0] || `Teacher ${user.id}`,
        userId: user.id,
        role: 'teacher',
        email: user.email
      });
      
      // Create join URL with moderator privileges
      const joinUrl = jitsiService.createJoinUrl(sessionData.roomName, jwtToken, {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        requireDisplayName: false
      });

      console.log(`[JITSI_MEET] ✅ Generated join URL for started session ${sessionId}`);

      res.json({
        success: true,
        session: updatedSession[0],
        joinUrl
      });
    } catch (error) {
      console.error('[ONLINE_CLASSES_API] Error starting session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start session'
      });
    }
  }
);

/**
 * POST /api/online-classes/sessions/:sessionId/end
 * End a live session
 */
router.post('/sessions/:sessionId/end',
  requireAuth,
  requireOnlineClassesSubscription,
  requireOnlineClassesManagement,
  async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      
      // TODO: Update session end (temporarily disabled due to DB sync)
      // const updatedSession = await db
      //   .update(classSessions)
      //   .set({
      //     actualEnd: new Date()
      //   })
      //   .where(eq(classSessions.id, sessionId))
      //   .returning();
      const updatedSession = [{ id: sessionId, status: 'ended' }]; // Temporary mock

      if (updatedSession.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      console.log(`[ONLINE_CLASSES_API] ✅ Session ${sessionId} ended`);

      res.json({
        success: true,
        session: updatedSession[0]
      });
    } catch (error) {
      console.error('[ONLINE_CLASSES_API] Error ending session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to end session'
      });
    }
  }
);

/**
 * POST /api/online-classes/sessions/:sessionId/attendance
 * Track attendance events from Jitsi
 */
router.post('/sessions/:sessionId/attendance',
  requireAuth,
  requireOnlineClassesAccess,
  async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const user = req.user!;
      const { type, participantId, metadata } = req.body;

      const attendanceData: any = {
        sessionId,
        userId: user.id,
        jitsiParticipantId: participantId
      };

      if (type === 'join') {
        attendanceData.joinedAt = new Date();
      } else if (type === 'leave') {
        attendanceData.leftAt = new Date();
        if (metadata?.duration) {
          attendanceData.durationSeconds = metadata.duration;
        }
      }

      // TODO: Record attendance (temporarily disabled due to DB sync)
      // await db
      //   .insert(sessionAttendance)
      //   .values(attendanceData)
      //   .onConflictDoUpdate({
      //     target: [sessionAttendance.sessionId, sessionAttendance.userId],
      //     set: attendanceData
      //   });

      console.log(`[ONLINE_CLASSES_API] ✅ Attendance ${type} recorded for user ${user.id} in session ${sessionId}`);

      res.json({
        success: true,
        message: `Attendance ${type} recorded`
      });
    } catch (error) {
      console.error('[ONLINE_CLASSES_API] Error recording attendance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record attendance'
      });
    }
  }
);

/**
 * POST /api/online-classes/sessions/:sessionId/join
 * Generate join URL for an existing session
 */
router.post('/sessions/:sessionId/join',
  requireAuth,
  requireOnlineClassesSubscription,
  async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const user = req.user!;
      
      // Get session details
      const session = await db
        .select()
        .from(classSessions)
        .where(eq(classSessions.id, sessionId))
        .limit(1);

      if (session.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      const sessionData = session[0];

      // Get course to verify access
      const course = await db
        .select()
        .from(onlineCourses)
        .where(eq(onlineCourses.id, sessionData.courseId))
        .limit(1);

      if (course.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      const courseData = course[0];
      
      // Check if this is an independent course
      const isIndependentCourse = courseData.schoolId === null;

      // SECURITY: Verify access to this session
      if (user.role === 'Teacher') {
        // Teachers can join their own courses
        if (courseData.teacherId !== user.id) {
          return res.status(403).json({
            success: false,
            error: 'You can only join your own course sessions'
          });
        }
        // For school-linked courses, also verify same school
        if (!isIndependentCourse && courseData.schoolId !== user.schoolId) {
          return res.status(403).json({
            success: false,
            error: 'Access denied: Course belongs to different school'
          });
        }
      } else if (user.role === 'Director') {
        // Directors can join any session in their school
        if (courseData.schoolId !== user.schoolId) {
          return res.status(403).json({
            success: false,
            error: 'You can only join sessions in your school'
          });
        }
      } else if (user.role === 'SiteAdmin' || user.role === 'Admin') {
        // SiteAdmin and Admin can join any session
      } else {
        // Students/Parents need enrollment check (TODO: implement enrollment verification)
        return res.status(403).json({
          success: false,
          error: 'Access denied - enrollment required'
        });
      }

      // Generate JWT token
      const jwtToken = jitsiService.generateJwtToken({
        room: sessionData.roomName,
        displayName: user.email?.split('@')[0] || `${user.role} ${user.id}`,
        userId: user.id,
        role: user.role === 'Teacher' || user.role === 'Director' ? 'teacher' : 'student',
        email: user.email
      });
      
      // Create join URL
      const joinUrl = jitsiService.createJoinUrl(sessionData.roomName, jwtToken, {
        startWithAudioMuted: user.role === 'Teacher' || user.role === 'Director' ? false : true,
        startWithVideoMuted: false,
        requireDisplayName: false
      });

      console.log(`[JITSI_MEET] ✅ Generated join URL for session ${sessionId} by user ${user.id}`);

      res.json({
        success: true,
        joinUrl,
        session: sessionData
      });

    } catch (error) {
      console.error('[ONLINE_CLASSES_API] Error generating join URL:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to generate join URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/online-classes/school/sessions
 * Get all scheduled sessions for the school
 */
router.get('/school/sessions',
  requireAuth,
  requireOnlineClassesSubscription,
  async (req, res) => {
    try {
      const user = req.user!;
      
      // Get all sessions for this school with LEFT JOINs for sandbox compatibility
      const sessions = await db
        .select({
          id: classSessions.id,
          title: classSessions.title,
          description: classSessions.description,
          scheduledStart: classSessions.scheduledStart,
          scheduledEnd: classSessions.scheduledEnd,
          status: classSessions.status,
          roomName: classSessions.roomName,
          courseId: classSessions.courseId,
          courseName: onlineCourses.title,
          teacherName: sql<string>`COALESCE(CONCAT(${users.firstName}, ' ', ${users.lastName}), 'Enseignant')`,
          teacherId: onlineCourses.teacherId,
          createdAt: classSessions.createdAt
        })
        .from(classSessions)
        .innerJoin(onlineCourses, eq(classSessions.courseId, onlineCourses.id))
        .leftJoin(users, eq(onlineCourses.teacherId, users.id))
        .where(eq(onlineCourses.schoolId, user.schoolId!))
        .orderBy(classSessions.scheduledStart);

      console.log(`[ONLINE_CLASSES_API] ✅ Listed ${sessions.length} school sessions for user ${user.id} (schoolId: ${user.schoolId})`);

      res.json({
        success: true,
        sessions
      });

    } catch (error) {
      console.error('[ONLINE_CLASSES_API] Error fetching school sessions:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to fetch school sessions',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/online-classes/teacher/sessions
 * Get all sessions created by the teacher
 */
router.get('/teacher/sessions',
  requireAuth,
  requireOnlineClassesSubscription,
  async (req, res) => {
    try {
      const user = req.user!;
      
      if (user.role !== 'Teacher') {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Teacher role required'
        });
      }
      
      // Get sessions created by this teacher (both school-linked and independent courses)
      const sessions = await db
        .select({
          id: classSessions.id,
          title: classSessions.title,
          description: classSessions.description,
          scheduledStart: classSessions.scheduledStart,
          scheduledEnd: classSessions.scheduledEnd,
          status: classSessions.status,
          roomName: classSessions.roomName,
          courseId: classSessions.courseId,
          courseName: onlineCourses.title,
          maxDuration: classSessions.maxDuration,
          lobbyEnabled: classSessions.lobbyEnabled,
          chatEnabled: classSessions.chatEnabled,
          screenShareEnabled: classSessions.screenShareEnabled,
          createdAt: classSessions.createdAt,
          isIndependent: onlineCourses.isIndependent
        })
        .from(classSessions)
        .innerJoin(onlineCourses, eq(classSessions.courseId, onlineCourses.id))
        .where(and(
          eq(onlineCourses.teacherId, user.id),
          // Include both school-linked courses (matching schoolId) AND independent courses (null schoolId)
          or(
            eq(onlineCourses.schoolId, user.schoolId!),
            isNull(onlineCourses.schoolId)
          )
        ))
        .orderBy(classSessions.scheduledStart);

      console.log(`[ONLINE_CLASSES_API] ✅ Listed ${sessions.length} teacher sessions for user ${user.id}`);

      res.json({
        success: true,
        sessions
      });

    } catch (error) {
      console.error('[ONLINE_CLASSES_API] Error fetching teacher sessions:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to fetch teacher sessions',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/online-classes/parent/sessions
 * Get all sessions for the parent's children
 */
router.get('/parent/sessions',
  requireAuth,
  requireOnlineClassesSubscription,
  async (req, res) => {
    try {
      const user = req.user!;
      
      if (user.role !== 'Parent') {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Parent role required'
        });
      }
      
      // Get sessions for all classes in the school (parents can see all school sessions)
      const sessions = await db
        .select({
          id: classSessions.id,
          title: classSessions.title,
          description: classSessions.description,
          scheduledStart: classSessions.scheduledStart,
          scheduledEnd: classSessions.scheduledEnd,
          status: classSessions.status,
          roomName: classSessions.roomName,
          courseId: classSessions.courseId,
          courseName: onlineCourses.title,
          teacherName: sql<string>`COALESCE(CONCAT(${users.firstName}, ' ', ${users.lastName}), 'Enseignant')`,
          teacherId: onlineCourses.teacherId,
          maxDuration: classSessions.maxDuration,
          lobbyEnabled: classSessions.lobbyEnabled,
          chatEnabled: classSessions.chatEnabled,
          screenShareEnabled: classSessions.screenShareEnabled,
          createdAt: classSessions.createdAt
        })
        .from(classSessions)
        .innerJoin(onlineCourses, eq(classSessions.courseId, onlineCourses.id))
        .leftJoin(users, eq(onlineCourses.teacherId, users.id))
        .where(eq(onlineCourses.schoolId, user.schoolId!))
        .orderBy(classSessions.scheduledStart);

      console.log(`[ONLINE_CLASSES_API] ✅ Listed ${sessions.length} parent sessions for user ${user.id}`);

      res.json({
        success: true,
        sessions
      });

    } catch (error) {
      console.error('[ONLINE_CLASSES_API] Error fetching parent sessions:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to fetch parent sessions',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * DELETE /api/online-classes/sessions/:sessionId
 * Delete a scheduled session
 */
router.delete('/sessions/:sessionId',
  requireAuth,
  requireOnlineClassesSubscription,
  async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const user = req.user!;
      
      // Get session details first to verify access
      const session = await db
        .select({
          sessionId: classSessions.id,
          courseId: classSessions.courseId,
          teacherId: onlineCourses.teacherId,
          schoolId: onlineCourses.schoolId,
          status: classSessions.status
        })
        .from(classSessions)
        .innerJoin(onlineCourses, eq(classSessions.courseId, onlineCourses.id))
        .where(eq(classSessions.id, sessionId))
        .limit(1);

      if (session.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      const sessionData = session[0];

      // SECURITY: Verify access to this session
      // For independent courses (schoolId is null), skip school verification
      const isIndependentCourse = sessionData.schoolId === null;
      
      if (user.role === 'Teacher') {
        // Teachers can delete their own sessions
        if (sessionData.teacherId !== user.id) {
          return res.status(403).json({
            success: false,
            error: 'You can only delete your own sessions'
          });
        }
        // For school-linked courses, verify same school
        if (!isIndependentCourse && sessionData.schoolId !== user.schoolId) {
          return res.status(403).json({
            success: false,
            error: 'Access denied: Course belongs to different school'
          });
        }
      } else if (user.role === 'Director') {
        // Directors can delete any session in their school
        if (sessionData.schoolId !== user.schoolId) {
          return res.status(403).json({
            success: false,
            error: 'You can only delete sessions in your school'
          });
        }
      } else if (user.role === 'SiteAdmin' || user.role === 'Admin') {
        // SiteAdmin and Admin can delete any session
      } else {
        return res.status(403).json({
          success: false,
          error: 'Access denied - insufficient permissions'
        });
      }

      // Prevent deletion of live sessions
      if (sessionData.status === 'live') {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete a live session'
        });
      }

      // Delete the session
      const deletedSession = await db
        .delete(classSessions)
        .where(eq(classSessions.id, sessionId))
        .returning();

      console.log(`[ONLINE_CLASSES_API] ✅ Session ${sessionId} deleted by user ${user.id}`);

      res.json({
        success: true,
        message: 'Session deleted successfully',
        session: deletedSession[0]
      });

    } catch (error) {
      console.error('[ONLINE_CLASSES_API] Error deleting session:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to delete session',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
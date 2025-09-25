// Online Classes API Routes
// Handles class session creation, management, and Jitsi Meet integration

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { 
  requireOnlineClassesSubscription, 
  requireOnlineClassesManagement,
  requireOnlineClassesAccess 
} from '../middleware/onlineClassesMiddleware';
import { jitsiService } from '../services/jitsiService.js';
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
import { eq, and, desc, gte, lte } from 'drizzle-orm';

const router = Router();

// Validation schemas
const createCourseSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  subjectId: z.number().optional(),
  classId: z.number().optional(),
  language: z.string().default("fr"),
  maxParticipants: z.number().default(50),
  allowRecording: z.boolean().default(true),
  requireApproval: z.boolean().default(false)
});

const createSessionSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  scheduledStart: z.string().transform(str => new Date(str)),
  scheduledEnd: z.string().transform(str => new Date(str)).optional(),
  maxDuration: z.number().default(120),
  lobbyEnabled: z.boolean().default(true),
  chatEnabled: z.boolean().default(true),
  screenShareEnabled: z.boolean().default(true)
});

const enrollmentSchema = z.object({
  courseId: z.number(),
  userId: z.number(),
  role: z.string()
});

/**
 * GET /api/online-classes/courses
 * List all courses for the authenticated user's school
 */
router.get('/courses', 
  requireAuth,
  requireOnlineClassesSubscription,
  async (req, res) => {
    try {
      const user = req.user!;
      const schoolId = user.schoolId!;

      const courses = await db
        .select({
          id: onlineCourses.id,
          title: onlineCourses.title,
          description: onlineCourses.description,
          language: onlineCourses.language,
          isActive: onlineCourses.isActive,
          maxParticipants: onlineCourses.maxParticipants,
          allowRecording: onlineCourses.allowRecording,
          createdAt: onlineCourses.createdAt
        })
        .from(onlineCourses)
        .where(eq(onlineCourses.schoolId, schoolId))
        .orderBy(desc(onlineCourses.createdAt));

      console.log(`[ONLINE_CLASSES_API] ✅ Listed ${courses.length} courses for school ${schoolId}`);

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
 * POST /api/online-classes/courses/echo
 * Debug route to verify request body parsing
 */
router.post('/courses/echo', requireAuth, (req, res) => {
  console.log('[DEBUG_ECHO] Headers:', req.headers);
  console.log('[DEBUG_ECHO] Body:', req.body);
  res.status(200).json({ 
    got: req.body, 
    headers: req.headers['content-type'],
    userAgent: req.headers['user-agent'],
    message: 'Echo endpoint working'
  });
});

/**
 * POST /api/online-classes/courses
 * Create a new online course
 */
router.post('/courses',
  requireAuth,
  requireOnlineClassesSubscription,
  requireOnlineClassesManagement,
  async (req, res) => {
    try {
      const user = req.user!;
      const schoolId = user.schoolId!;
      
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
      
      const newCourse = await db
        .insert(onlineCourses)
        .values({
          title: validated.title,
          description: validated.description,
          language: validated.language,
          maxParticipants: validated.maxParticipants,
          allowRecording: validated.allowRecording,
          requireApproval: validated.requireApproval,
          schoolId,
          teacherId: user.id
        })
        .returning();

      console.log(`[ONLINE_CLASSES_API] ✅ Created course "${validated.title}" by user ${user.id}`);

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
      if (course.schoolId !== user.schoolId && user.role !== 'SiteAdmin') {
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
 */
router.post('/courses/:courseId/sessions',
  requireAuth,
  requireOnlineClassesSubscription,
  requireOnlineClassesManagement,
  async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const user = req.user!;
      
      // SECURITY: Verify course ownership for Teachers
      if (user.role === 'Teacher') {
        const courseOwnership = await db
          .select()
          .from(onlineCourses)
          .where(and(
            eq(onlineCourses.id, courseId),
            eq(onlineCourses.teacherId, user.id),
            eq(onlineCourses.schoolId, user.schoolId!)
          ))
          .limit(1);
        
        if (courseOwnership.length === 0) {
          return res.status(403).json({
            success: false,
            error: 'You can only create sessions for your own courses'
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
          createdBy: user.id
        })
        .returning();

      console.log(`[ONLINE_CLASSES_API] ✅ Created session "${validated.title}" for course ${courseId}`);

      // TODO: Send notifications to enrolled students
      // notifySessionCreated(courseId, newSession[0]);

      res.status(201).json({
        success: true,
        session: newSession[0]
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
 * POST /api/online-classes/sessions/:sessionId/join
 * Generate join credentials for a session
 */
router.post('/sessions/:sessionId/join',
  requireAuth,
  requireOnlineClassesSubscription, // SECURITY: Premium subscription required
  requireOnlineClassesAccess,
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
      
      // Check if session is joinable
      if (sessionData.status === 'canceled') {
        return res.status(400).json({
          success: false,
          error: 'This session has been canceled'
        });
      }

      if (sessionData.status === 'ended') {
        return res.status(400).json({
          success: false,
          error: 'This session has already ended'
        });
      }

      // SECURITY: Strict access control with school boundary check
      const [enrollment, course] = await Promise.all([
        db.select()
          .from(courseEnrollments)
          .where(and(
            eq(courseEnrollments.courseId, sessionData.courseId),
            eq(courseEnrollments.userId, user.id),
            eq(courseEnrollments.isActive, true)
          ))
          .limit(1),
        db.select()
          .from(onlineCourses)
          .where(eq(onlineCourses.id, sessionData.courseId))
          .limit(1)
      ]);

      if (course.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      const courseData = course[0];

      // SECURITY: Cross-tenant protection - verify same school
      if (courseData.schoolId !== user.schoolId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Course belongs to different school'
        });
      }

      // SECURITY: Verify authorization before token generation
      const hasEnrollment = enrollment.length > 0;
      const isAdmin = ['SiteAdmin', 'Admin', 'Director'].includes(user.role);
      const isOwner = user.role === 'Teacher' && courseData.teacherId === user.id;

      if (!hasEnrollment && !isAdmin && !isOwner) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: You are not enrolled in this course and are not authorized to join'
        });
      }

      // Determine user role for Jitsi
      let userRole: 'teacher' | 'student' | 'observer' | 'parent' = 'observer';
      
      if (hasEnrollment) {
        userRole = enrollment[0].role as any;
      } else if (isAdmin || isOwner) {
        userRole = 'teacher'; // Admins and owners join as teachers
      }

      // Generate JWT token
      const displayName = `${user.firstName} ${user.lastName}`;
      const jwtToken = jitsiService.generateJwtToken({
        room: sessionData.roomName,
        displayName,
        userId: user.id,
        role: userRole,
        email: user.email
      });

      // Generate Jitsi configuration
      const jitsiConfig = jitsiService.generateJitsiConfig(
        sessionData.roomName,
        jwtToken,
        {
          prejoinPageEnabled: userRole !== 'teacher',
          startWithAudioMuted: userRole !== 'teacher',
          startWithVideoMuted: userRole === 'parent'
        }
      );

      // Log attendance attempt
      await db
        .insert(sessionAttendance)
        .values({
          sessionId,
          userId: user.id
        })
        .onConflictDoNothing();

      console.log(`[ONLINE_CLASSES_API] ✅ Generated join credentials for user ${user.id} (${userRole}) in session ${sessionId}`);

      res.json({
        success: true,
        session: {
          id: sessionData.id,
          title: sessionData.title,
          roomName: sessionData.roomName,
          status: sessionData.status,
          scheduledStart: sessionData.scheduledStart,
          scheduledEnd: sessionData.scheduledEnd
        },
        joinData: {
          domain: jitsiConfig.domain,
          roomName: jitsiConfig.roomName,
          jwt: jwtToken,
          userRole,
          displayName
        },
        config: jitsiConfig
      });
    } catch (error) {
      console.error('[ONLINE_CLASSES_API] Error generating join credentials:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate join credentials'
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

      // SECURITY: Cross-tenant protection
      if (courseData.schoolId !== user.schoolId) {
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
      
      // Update session status
      const updatedSession = await db
        .update(classSessions)
        .set({
          actualStart: new Date()
        })
        .where(eq(classSessions.id, sessionId))
        .returning();

      if (updatedSession.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      console.log(`[ONLINE_CLASSES_API] ✅ Session ${sessionId} started by user ${user.id}`);

      // TODO: Send notifications to enrolled students
      // notifySessionStarted(sessionId);

      res.json({
        success: true,
        session: updatedSession[0]
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
      
      const updatedSession = await db
        .update(classSessions)
        .set({
          actualEnd: new Date()
        })
        .where(eq(classSessions.id, sessionId))
        .returning();

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

      await db
        .insert(sessionAttendance)
        .values(attendanceData)
        .onConflictDoUpdate({
          target: [sessionAttendance.sessionId, sessionAttendance.userId],
          set: attendanceData
        });

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

export default router;
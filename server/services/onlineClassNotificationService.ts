/**
 * Online Class Notification Service
 * Handles automatic notifications for online class events
 */

import { db } from '../db';
import { classSessions, users, onlineCourses, courseEnrollments, enrollments, parentStudentRelations } from '../../shared/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { RefactoredNotificationService, NotificationRecipient } from './refactoredNotificationService';

export class OnlineClassNotificationService {
  private static instance: OnlineClassNotificationService;
  private notificationService: RefactoredNotificationService;

  private constructor() {
    this.notificationService = RefactoredNotificationService.getInstance();
  }

  static getInstance(): OnlineClassNotificationService {
    if (!OnlineClassNotificationService.instance) {
      OnlineClassNotificationService.instance = new OnlineClassNotificationService();
    }
    return OnlineClassNotificationService.instance;
  }

  /**
   * Notify teacher, students and parents when a new session is scheduled
   */
  async notifySessionScheduled(sessionId: number, teacherName: string, schoolId: number): Promise<void> {
    try {
      console.log(`[ONLINE_CLASS_NOTIFICATIONS] Sending scheduled notifications for session ${sessionId}`);

      // Get session details
      const [session] = await db
        .select()
        .from(classSessions)
        .where(eq(classSessions.id, sessionId))
        .limit(1);

      if (!session) {
        console.error(`[ONLINE_CLASS_NOTIFICATIONS] Session ${sessionId} not found`);
        return;
      }

      // Get course details (optional - school-scheduled sessions may not have a course)
      let course = null;
      if (session.courseId) {
        const [courseResult] = await db
          .select()
          .from(onlineCourses)
          .where(eq(onlineCourses.id, session.courseId))
          .limit(1);
        course = courseResult;
      }

      // Get recipients (students and parents)
      // Use session's classId (required for school-scheduled sessions)
      const recipients = await this.getSessionRecipients(session.classId, schoolId, session.courseId || null);

      if (recipients.length === 0) {
        console.log(`[ONLINE_CLASS_NOTIFICATIONS] No recipients found for session ${sessionId}`);
        return;
      }

      // Format date/time for notification
      const scheduledDate = new Date(session.scheduledStart);
      const dateTimeStr = scheduledDate.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Send email notifications to students and parents
      await this.notificationService.sendNotification({
        type: 'email',
        template: 'ONLINE_CLASS_SCHEDULED',
        recipients,
        data: {
          childName: recipients[0].name, // Will be replaced per recipient
          title: session.title,
          dateTime: dateTimeStr,
          teacher: teacherName
        },
        priority: 'medium',
        schoolId: schoolId,
        metadata: {
          sessionId: session.id,
          courseId: session.courseId,
          eventType: 'session_scheduled'
        }
      });

      // Send push notifications to students and parents
      await this.notificationService.sendNotification({
        type: 'push',
        template: 'ONLINE_CLASS_SCHEDULED',
        recipients,
        data: {
          childName: recipients[0].name,
          title: session.title,
          dateTime: dateTimeStr,
          teacher: teacherName
        },
        priority: 'medium',
        schoolId: schoolId,
        metadata: {
          sessionId: session.id,
          courseId: session.courseId,
          eventType: 'session_scheduled'
        }
      });

      // Notify the teacher about their assigned session
      const [teacher] = await db
        .select({
          id: users.id,
          name: users.name,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          preferredLanguage: users.preferredLanguage
        })
        .from(users)
        .where(eq(users.id, session.teacherId))
        .limit(1);

      if (teacher) {
        // Email notification to teacher
        await this.notificationService.sendNotification({
          type: 'email',
          template: 'ONLINE_CLASS_TEACHER_ASSIGNED',
          recipients: [{
            id: teacher.id,
            name: teacher.name || `${teacher.firstName} ${teacher.lastName}`,
            email: teacher.email,
            phone: teacher.phone,
            language: teacher.preferredLanguage || 'fr',
            role: 'Teacher'
          }],
          data: {
            title: session.title,
            dateTime: dateTimeStr,
            className: recipients[0]?.name || 'Class'
          },
          priority: 'medium',
          schoolId: schoolId,
          metadata: {
            sessionId: session.id,
            eventType: 'teacher_session_assigned'
          }
        });

        // Push notification to teacher
        await this.notificationService.sendNotification({
          type: 'push',
          template: 'ONLINE_CLASS_TEACHER_ASSIGNED',
          recipients: [{
            id: teacher.id,
            name: teacher.name || `${teacher.firstName} ${teacher.lastName}`,
            email: teacher.email,
            phone: teacher.phone,
            language: teacher.preferredLanguage || 'fr',
            role: 'Teacher'
          }],
          data: {
            title: session.title,
            dateTime: dateTimeStr,
            className: recipients[0]?.name || 'Class'
          },
          priority: 'medium',
          schoolId: schoolId,
          metadata: {
            sessionId: session.id,
            eventType: 'teacher_session_assigned'
          }
        });
        console.log(`[ONLINE_CLASS_NOTIFICATIONS] Teacher notifications (email + push) sent to ${teacher.name}`);
      }

      console.log(`[ONLINE_CLASS_NOTIFICATIONS] Scheduled notifications sent to ${recipients.length} recipients + teacher`);
    } catch (error) {
      console.error('[ONLINE_CLASS_NOTIFICATIONS] Error sending scheduled notifications:', error);
    }
  }

  /**
   * Notify students and parents when a session is starting
   * Supports both course-linked sessions and school-created sessions
   */
  async notifySessionStarting(sessionId: number, teacherName: string): Promise<void> {
    try {
      console.log(`[ONLINE_CLASS_NOTIFICATIONS] Sending starting notifications for session ${sessionId}`);

      // Get session details
      const [session] = await db
        .select()
        .from(classSessions)
        .where(eq(classSessions.id, sessionId))
        .limit(1);

      if (!session) {
        console.error(`[ONLINE_CLASS_NOTIFICATIONS] Session ${sessionId} not found`);
        return;
      }

      // Handle both course-linked and school-created sessions
      let classIdToUse: number | null = session.classId;
      let schoolId: number | null = null;
      let courseId: number | null = session.courseId;

      if (session.courseId) {
        // Course-linked session
        const [course] = await db
          .select()
          .from(onlineCourses)
          .where(eq(onlineCourses.id, session.courseId))
          .limit(1);

        if (course) {
          classIdToUse = session.classId || course.classId;
          schoolId = course.schoolId;
        }
      } else if (session.classId) {
        // School-created session (scheduler) - get schoolId from class
        const { classes } = await import('../../shared/schema');
        const [classData] = await db
          .select({ schoolId: classes.schoolId })
          .from(classes)
          .where(eq(classes.id, session.classId))
          .limit(1);
        
        if (classData) {
          schoolId = classData.schoolId;
        }
      }

      if (!classIdToUse || !schoolId) {
        console.error(`[ONLINE_CLASS_NOTIFICATIONS] Cannot determine class or school for session ${sessionId}`);
        return;
      }

      // Get recipients
      const recipients = await this.getSessionRecipients(classIdToUse, schoolId, courseId);

      if (recipients.length === 0) {
        console.log(`[ONLINE_CLASS_NOTIFICATIONS] No recipients found for session ${sessionId}`);
        return;
      }

      // Send notifications
      await this.notificationService.sendNotification({
        type: 'sms',
        template: 'ONLINE_CLASS_STARTING',
        recipients,
        data: {
          childName: recipients[0].name,
          title: session.title,
          teacher: teacherName
        },
        priority: 'high',
        schoolId: schoolId,
        metadata: {
          sessionId: session.id,
          courseId: courseId,
          eventType: 'session_starting'
        }
      });

      // Mark notifications as sent
      await db
        .update(classSessions)
        .set({ notificationsSent: true })
        .where(eq(classSessions.id, sessionId));

      console.log(`[ONLINE_CLASS_NOTIFICATIONS] Starting notifications sent to ${recipients.length} recipients`);
    } catch (error) {
      console.error('[ONLINE_CLASS_NOTIFICATIONS] Error sending starting notifications:', error);
    }
  }

  /**
   * Notify students and parents X minutes before session starts
   */
  async notifySessionStartingSoon(sessionId: number, minutesBefore: number, teacherName: string): Promise<void> {
    try {
      console.log(`[ONLINE_CLASS_NOTIFICATIONS] Sending reminder (${minutesBefore} min) for session ${sessionId}`);

      // Get session details
      const [session] = await db
        .select()
        .from(classSessions)
        .where(eq(classSessions.id, sessionId))
        .limit(1);

      if (!session) {
        console.error(`[ONLINE_CLASS_NOTIFICATIONS] Session ${sessionId} not found`);
        return;
      }

      // Get course details
      const [course] = await db
        .select()
        .from(onlineCourses)
        .where(eq(onlineCourses.id, session.courseId))
        .limit(1);

      if (!course) {
        console.error(`[ONLINE_CLASS_NOTIFICATIONS] Course ${session.courseId} not found`);
        return;
      }

      // Get recipients
      // Use session's classId if provided, otherwise use course's classId
      const classIdToUse = session.classId || course.classId;
      const recipients = await this.getSessionRecipients(classIdToUse, course.schoolId, course.id);

      if (recipients.length === 0) {
        console.log(`[ONLINE_CLASS_NOTIFICATIONS] No recipients found for session ${sessionId}`);
        return;
      }

      // Send notifications
      await this.notificationService.sendNotification({
        type: 'sms',
        template: 'ONLINE_CLASS_STARTING_SOON',
        recipients,
        data: {
          childName: recipients[0].name,
          title: session.title,
          minutes: minutesBefore.toString(),
          teacher: teacherName
        },
        priority: 'high',
        schoolId: course.schoolId,
        metadata: {
          sessionId: session.id,
          courseId: course.id,
          eventType: 'session_reminder',
          minutesBefore
        }
      });

      console.log(`[ONLINE_CLASS_NOTIFICATIONS] Reminder notifications sent to ${recipients.length} recipients`);
    } catch (error) {
      console.error('[ONLINE_CLASS_NOTIFICATIONS] Error sending reminder notifications:', error);
    }
  }

  /**
   * Get recipients (students and parents) for a session
   * Prioritizes classId if provided, with fallback to course enrollments
   */
  private async getSessionRecipients(classId: number | null, schoolId: number, courseId: number | null): Promise<NotificationRecipient[]> {
    const recipients: NotificationRecipient[] = [];

    try {
      let studentIds: number[] = [];

      if (classId) {
        // Get students from class enrollment if classId is provided
        console.log(`[ONLINE_CLASS_NOTIFICATIONS] Using class-based recipients for classId: ${classId}`);
        
        const classStudents = await db
          .select({
            studentId: enrollments.studentId
          })
          .from(enrollments)
          .where(
            and(
              eq(enrollments.classId, classId),
              eq(enrollments.status, 'active')
            )
          );

        if (classStudents.length > 0) {
          studentIds = classStudents.map(s => s.studentId);
          console.log(`[ONLINE_CLASS_NOTIFICATIONS] Found ${studentIds.length} students in class ${classId}`);
        } else {
          console.log(`[ONLINE_CLASS_NOTIFICATIONS] No students in class ${classId}, falling back to course enrollments if available`);
        }
      }
      
      // Fallback to course enrollments if courseId is provided AND (no classId provided OR no students found in class)
      if (studentIds.length === 0 && courseId) {
        console.log(`[ONLINE_CLASS_NOTIFICATIONS] Using course-based recipients for courseId: ${courseId}`);
        
        const enrolledStudents = await db
          .select({
            userId: courseEnrollments.userId
          })
          .from(courseEnrollments)
          .where(
            and(
              eq(courseEnrollments.courseId, courseId),
              eq(courseEnrollments.role, 'student'),
              eq(courseEnrollments.isActive, true)
            )
          );

        if (enrolledStudents.length === 0) {
          console.log(`[ONLINE_CLASS_NOTIFICATIONS] No students enrolled in course ${courseId}`);
          return recipients;
        }

        studentIds = enrolledStudents.map(s => s.userId);
        console.log(`[ONLINE_CLASS_NOTIFICATIONS] Found ${studentIds.length} students enrolled in course ${courseId}`);
      }
      
      if (studentIds.length === 0) {
        console.log(`[ONLINE_CLASS_NOTIFICATIONS] No students found for class ${classId}, course ${courseId}`);
        return recipients;
      }

      // Get student details
      const students = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          preferredLanguage: users.preferredLanguage
        })
        .from(users)
        .where(inArray(users.id, studentIds));

      // Add students as recipients
      for (const student of students) {
        recipients.push({
          id: student.id.toString(),
          name: `${student.firstName} ${student.lastName}`,
          email: student.email || undefined,
          phone: student.phone || undefined,
          preferredLanguage: (student.preferredLanguage as 'en' | 'fr') || 'fr',
          role: 'Student'
        });
      }

      // Get parents connected to these students
      const parentLinks = await db
        .select({
          parentId: parentStudentRelations.parentId,
          studentId: parentStudentRelations.studentId
        })
        .from(parentStudentRelations)
        .where(
          inArray(parentStudentRelations.studentId, studentIds)
        );

      if (parentLinks.length > 0) {
        const parentIds = Array.from(new Set(parentLinks.map(p => p.parentId)));

        // Get parent details
        const parents = await db
          .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            phone: users.phone,
            preferredLanguage: users.preferredLanguage
          })
          .from(users)
          .where(inArray(users.id, parentIds));

        // Add parents as recipients
        for (const parent of parents) {
          recipients.push({
            id: parent.id.toString(),
            name: `${parent.firstName} ${parent.lastName}`,
            email: parent.email || undefined,
            phone: parent.phone || undefined,
            preferredLanguage: (parent.preferredLanguage as 'en' | 'fr') || 'fr',
            role: 'Parent'
          });
        }
      }

      console.log(`[ONLINE_CLASS_NOTIFICATIONS] Found ${recipients.length} recipients (${students.length} students, ${parentLinks.length} parent links)`);
    } catch (error) {
      console.error('[ONLINE_CLASS_NOTIFICATIONS] Error getting recipients:', error);
    }

    return recipients;
  }

  /**
   * Get teacher name from user ID
   */
  async getTeacherName(teacherId: number): Promise<string> {
    try {
      const [teacher] = await db
        .select({ 
          firstName: users.firstName,
          lastName: users.lastName
        })
        .from(users)
        .where(eq(users.id, teacherId))
        .limit(1);

      return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Teacher';
    } catch (error) {
      console.error('[ONLINE_CLASS_NOTIFICATIONS] Error getting teacher name:', error);
      return 'Teacher';
    }
  }
}

export const onlineClassNotificationService = OnlineClassNotificationService.getInstance();

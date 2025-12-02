import cron from 'node-cron';
import { db } from '../db';
import { homework } from '../../shared/schemas/academicSchema';
import { enrollments } from '../../shared/schemas/classEnrollmentSchema';
import { users, notifications } from '../../shared/schema';
import { eq, and, gte, lte, isNull } from 'drizzle-orm';

interface HomeworkWithDue {
  id: number;
  title: string;
  description: string | null;
  classId: number;
  teacherId: number;
  dueDate: Date;
  reminderDays: number | null;
  notifyStudents: boolean | null;
  notifyParents: boolean | null;
}

async function getClassRecipients(classId: number, schoolId: number): Promise<{ studentIds: number[], parentIds: number[] }> {
  try {
    const studentEnrollments = await db
      .select({
        studentId: enrollments.studentId
      })
      .from(enrollments)
      .where(eq(enrollments.classId, classId));

    const studentUserIds = studentEnrollments.map(e => e.studentId);

    const parentUsers = await db
      .select({
        id: users.id
      })
      .from(users)
      .where(
        and(
          eq(users.role, 'Parent'),
          eq(users.schoolId, schoolId),
          eq(users.isActive, true)
        )
      );

    const parentIds = parentUsers.map(p => p.id);

    return { studentIds: studentUserIds, parentIds };
  } catch (error) {
    console.error('[HOMEWORK_REMINDER] Error fetching class recipients:', error);
    return { studentIds: [], parentIds: [] };
  }
}

async function sendHomeworkReminder(hw: HomeworkWithDue) {
  try {
    const [teacher] = await db
      .select({ schoolId: users.schoolId })
      .from(users)
      .where(eq(users.id, hw.teacherId))
      .limit(1);
    
    const schoolId = teacher?.schoolId || 1;
    const { studentIds, parentIds } = await getClassRecipients(hw.classId, schoolId);
    
    const recipients: number[] = [];
    if (hw.notifyStudents !== false) recipients.push(...studentIds);
    if (hw.notifyParents !== false) recipients.push(...parentIds);

    if (recipients.length === 0) {
      console.log(`[HOMEWORK_REMINDER] No recipients found for homework ${hw.id}`);
      return;
    }

    const daysUntilDue = Math.ceil((hw.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    console.log(`[HOMEWORK_REMINDER] 📤 Sending reminders for homework "${hw.title}" to ${recipients.length} recipients (${daysUntilDue} days until due)`);

    for (const userId of recipients) {
      try {
        await db.insert(notifications).values({
          userId,
          title: `🔔 Rappel: Devoir à rendre bientôt`,
          message: `Le devoir "${hw.title}" est à rendre dans ${daysUntilDue} jour(s). N'oubliez pas de le soumettre à temps!`,
          type: 'homework_due_soon',
          priority: daysUntilDue <= 1 ? 'high' : 'normal',
          isRead: false,
          metadata: {
            homeworkId: hw.id,
            homeworkTitle: hw.title,
            dueDate: hw.dueDate.toISOString(),
            daysUntilDue,
            classId: hw.classId,
            schoolId,
            notificationType: 'homework_reminder'
          }
        } as any);
      } catch (error) {
        console.error(`[HOMEWORK_REMINDER] ❌ Failed to create notification for user ${userId}:`, error);
      }
    }

    await db
      .update(homework)
      .set({ 
        reminderSentAt: new Date(),
        updatedAt: new Date()
      } as any)
      .where(eq(homework.id, hw.id));

    console.log(`[HOMEWORK_REMINDER] ✅ Reminders sent for homework ${hw.id}`);
  } catch (error) {
    console.error(`[HOMEWORK_REMINDER] ❌ Error sending reminders for homework ${hw.id}:`, error);
  }
}

async function processHomeworkReminders() {
  console.log('[HOMEWORK_REMINDER] 🔄 Checking for homework due soon...');

  try {
    const now = new Date();
    const maxDaysAhead = 7;
    const maxDate = new Date(now.getTime() + maxDaysAhead * 24 * 60 * 60 * 1000);

    const homeworkDueSoon = await db
      .select({
        id: homework.id,
        title: homework.title,
        description: homework.description,
        classId: homework.classId,
        teacherId: homework.teacherId,
        dueDate: homework.dueDate,
        reminderDays: homework.reminderDays,
        notifyStudents: homework.notifyStudents,
        notifyParents: homework.notifyParents
      })
      .from(homework)
      .where(
        and(
          eq(homework.reminderEnabled, true),
          isNull(homework.reminderSentAt),
          gte(homework.dueDate, now),
          lte(homework.dueDate, maxDate)
        )
      );

    console.log(`[HOMEWORK_REMINDER] Found ${homeworkDueSoon.length} homework items to check`);

    for (const hw of homeworkDueSoon) {
      if (!hw.dueDate) continue;

      const reminderDays = hw.reminderDays || 1;
      const reminderDate = new Date(hw.dueDate.getTime() - reminderDays * 24 * 60 * 60 * 1000);

      if (now >= reminderDate) {
        await sendHomeworkReminder(hw as HomeworkWithDue);
      }
    }

    console.log('[HOMEWORK_REMINDER] ✅ Reminder check completed');
  } catch (error) {
    console.error('[HOMEWORK_REMINDER] ❌ Error processing reminders:', error);
  }
}

export function initHomeworkReminderService() {
  console.log('[HOMEWORK_REMINDER] 🚀 Initializing homework reminder service...');

  cron.schedule('0 7,12,18 * * *', () => {
    console.log('[HOMEWORK_REMINDER] ⏰ Running scheduled reminder check (7am/12pm/6pm)');
    processHomeworkReminders();
  }, {
    timezone: 'Africa/Douala'
  });

  setTimeout(() => {
    console.log('[HOMEWORK_REMINDER] 🔄 Running initial reminder check...');
    processHomeworkReminders();
  }, 10000);

  console.log('[HOMEWORK_REMINDER] ✅ Service initialized - reminders at 7am, 12pm, 6pm (Africa/Douala)');
}

export { processHomeworkReminders };

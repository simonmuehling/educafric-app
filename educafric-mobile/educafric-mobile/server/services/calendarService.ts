import { storage } from '../storage';
import { db } from '../db';
import { timetables, classes, classSessions, onlineCourses, users } from '../../shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

interface CalendarEvent {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  recurrence?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    until?: Date;
    byDay?: string[];
  };
}

export class CalendarService {
  private formatDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  private escapeText(text: string): string {
    return text.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
  }

  private generateICalEvent(event: CalendarEvent): string {
    let icalEvent = [
      'BEGIN:VEVENT',
      `UID:${event.uid}@educafric.com`,
      `DTSTAMP:${this.formatDate(new Date())}`,
      `DTSTART:${this.formatDate(event.startDate)}`,
      `DTEND:${this.formatDate(event.endDate)}`,
      `SUMMARY:${this.escapeText(event.summary)}`,
    ];

    if (event.description) {
      icalEvent.push(`DESCRIPTION:${this.escapeText(event.description)}`);
    }

    if (event.location) {
      icalEvent.push(`LOCATION:${this.escapeText(event.location)}`);
    }

    if (event.recurrence) {
      let rrule = `RRULE:FREQ=${event.recurrence.frequency}`;
      
      if (event.recurrence.until) {
        rrule += `;UNTIL=${this.formatDate(event.recurrence.until)}`;
      }
      
      if (event.recurrence.byDay && event.recurrence.byDay.length > 0) {
        rrule += `;BYDAY=${event.recurrence.byDay.join(',')}`;
      }
      
      icalEvent.push(rrule);
    }

    icalEvent.push('END:VEVENT');
    
    return icalEvent.join('\r\n');
  }

  async generateSchoolCalendar(schoolId: number, academicYear: string, term: string): Promise<string> {
    const events: CalendarEvent[] = [];
    
    const timetableData = await db.select()
      .from(timetables)
      .where(
        and(
          eq(timetables.schoolId, schoolId),
          eq(timetables.academicYear, academicYear),
          eq(timetables.term, term),
          eq(timetables.isActive, true)
        )
      );
    
    const dayMap: { [key: number]: string } = {
      1: 'MO',
      2: 'TU',
      3: 'WE',
      4: 'TH',
      5: 'FR',
      6: 'SA',
      7: 'SU'
    };

    for (const timetable of timetableData) {
      const teacher = await storage.getUserById(timetable.teacherId);
      const [classInfo] = await db.select().from(classes).where(eq(classes.id, timetable.classId));
      
      const [startHour, startMinute] = timetable.startTime.split(':').map(Number);
      const [endHour, endMinute] = timetable.endTime.split(':').map(Number);
      
      const baseDate = new Date();
      baseDate.setHours(startHour, startMinute, 0, 0);
      
      const endDate = new Date();
      endDate.setHours(endHour, endMinute, 0, 0);
      
      const termEnd = new Date();
      termEnd.setMonth(termEnd.getMonth() + 3);

      events.push({
        uid: `timetable-${timetable.id}`,
        summary: `${timetable.subjectName} - ${classInfo?.name || 'Class'}`,
        description: `Teacher: ${teacher?.firstName} ${teacher?.lastName}\nRoom: ${timetable.room || 'TBA'}`,
        location: timetable.room || 'To Be Announced',
        startDate: baseDate,
        endDate: endDate,
        recurrence: {
          frequency: 'WEEKLY',
          until: termEnd,
          byDay: [dayMap[timetable.dayOfWeek]]
        }
      });
    }

    // Add online class sessions for this school
    const now = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    const sessions = await db.select({
      session: classSessions,
      course: onlineCourses,
      teacher: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName
      }
    })
      .from(classSessions)
      .innerJoin(onlineCourses, eq(classSessions.courseId, onlineCourses.id))
      .innerJoin(users, eq(onlineCourses.teacherId, users.id))
      .where(
        and(
          eq(onlineCourses.schoolId, schoolId),
          eq(onlineCourses.isActive, true),
          gte(classSessions.scheduledStart, now),
          lte(classSessions.scheduledStart, threeMonthsLater)
        )
      );

    for (const { session, course, teacher } of sessions) {
      if (!session.scheduledStart) continue;
      
      // Only include scheduled or live sessions (filtering in loop due to Drizzle typing)
      if (session.status !== 'scheduled' && session.status !== 'live') continue;
      
      const jitsiUrl = `https://meet.educafric.com/${session.roomName}`;
      const passwordNote = session.roomPassword ? '\nMot de passe requis (voir notification)' : '';
      
      events.push({
        uid: `online-session-${session.id}`,
        summary: `📹 ${session.title} (Classe en ligne)`,
        description: `${session.description || ''}\n\nEnseignant: ${teacher.firstName} ${teacher.lastName}\nLien Jitsi: ${jitsiUrl}${passwordNote}`,
        location: jitsiUrl,
        startDate: new Date(session.scheduledStart),
        endDate: session.scheduledEnd ? new Date(session.scheduledEnd) : new Date(new Date(session.scheduledStart).getTime() + 60 * 60 * 1000)
      });
    }

    return this.generateICalendar(events, `EDUCAFRIC - School Calendar (${academicYear} - ${term})`);
  }

  async generateTeacherCalendar(teacherId: number, academicYear: string, term: string): Promise<string> {
    const events: CalendarEvent[] = [];
    
    const timetableData = await db.select()
      .from(timetables)
      .where(
        and(
          eq(timetables.teacherId, teacherId),
          eq(timetables.academicYear, academicYear),
          eq(timetables.term, term),
          eq(timetables.isActive, true)
        )
      );
    
    const dayMap: { [key: number]: string } = {
      1: 'MO',
      2: 'TU',
      3: 'WE',
      4: 'TH',
      5: 'FR',
      6: 'SA',
      7: 'SU'
    };

    for (const timetable of timetableData) {
      const [classInfo] = await db.select().from(classes).where(eq(classes.id, timetable.classId));
      
      const [startHour, startMinute] = timetable.startTime.split(':').map(Number);
      const [endHour, endMinute] = timetable.endTime.split(':').map(Number);
      
      const baseDate = new Date();
      baseDate.setHours(startHour, startMinute, 0, 0);
      
      const endDate = new Date();
      endDate.setHours(endHour, endMinute, 0, 0);
      
      const termEnd = new Date();
      termEnd.setMonth(termEnd.getMonth() + 3);

      events.push({
        uid: `teacher-timetable-${timetable.id}`,
        summary: `${timetable.subjectName} - ${classInfo?.name || 'Class'}`,
        description: `Room: ${timetable.room || 'TBA'}\nNotes: ${timetable.notes || 'No additional notes'}`,
        location: timetable.room || 'To Be Announced',
        startDate: baseDate,
        endDate: endDate,
        recurrence: {
          frequency: 'WEEKLY',
          until: termEnd,
          byDay: [dayMap[timetable.dayOfWeek]]
        }
      });
    }

    // Add online class sessions for this teacher
    const now = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    const sessions = await db.select({
      session: classSessions,
      course: onlineCourses,
      class: classes
    })
      .from(classSessions)
      .innerJoin(onlineCourses, eq(classSessions.courseId, onlineCourses.id))
      .leftJoin(classes, eq(onlineCourses.classId, classes.id))
      .where(
        and(
          eq(onlineCourses.teacherId, teacherId),
          eq(onlineCourses.isActive, true),
          gte(classSessions.scheduledStart, now),
          lte(classSessions.scheduledStart, threeMonthsLater)
        )
      );

    for (const { session, course, class: classInfo } of sessions) {
      if (!session.scheduledStart) continue;
      
      // Only include scheduled or live sessions (filtering in loop due to Drizzle typing)
      if (session.status !== 'scheduled' && session.status !== 'live') continue;
      
      const jitsiUrl = `https://meet.educafric.com/${session.roomName}`;
      const passwordNote = session.roomPassword ? '\nMot de passe requis (voir notification)' : '';
      
      events.push({
        uid: `teacher-online-session-${session.id}`,
        summary: `📹 ${session.title} (Classe en ligne)`,
        description: `${session.description || ''}\n\n${classInfo ? `Classe: ${classInfo.name}\n` : ''}Lien Jitsi: ${jitsiUrl}${passwordNote}\nStatut: ${session.status}`,
        location: jitsiUrl,
        startDate: new Date(session.scheduledStart),
        endDate: session.scheduledEnd ? new Date(session.scheduledEnd) : new Date(new Date(session.scheduledStart).getTime() + 60 * 60 * 1000)
      });
    }

    return this.generateICalendar(events, `EDUCAFRIC - My Teaching Schedule (${academicYear} - ${term})`);
  }

  private generateICalendar(events: CalendarEvent[], calendarName: string): string {
    const header = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EDUCAFRIC//Academic Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${this.escapeText(calendarName)}`,
      'X-WR-TIMEZONE:Africa/Douala',
      'X-WR-CALDESC:Academic calendar for EDUCAFRIC platform'
    ].join('\r\n');

    const footer = 'END:VCALENDAR';

    const eventStrings = events.map(event => this.generateICalEvent(event)).join('\r\n');

    return `${header}\r\n${eventStrings}\r\n${footer}`;
  }

  async generateCalendarFeedUrl(userId: number, userRole: 'Director' | 'Teacher'): Promise<string> {
    const token = Buffer.from(`${userId}-${userRole}-${Date.now()}`).toString('base64');
    return `/api/calendar/feed/${token}`;
  }
}

export const calendarService = new CalendarService();

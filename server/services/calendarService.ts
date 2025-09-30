import { storage } from '../storage';
import { db } from '../db';
import { timetables, classes } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

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

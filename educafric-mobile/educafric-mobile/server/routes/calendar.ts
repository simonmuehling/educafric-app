import express from 'express';
import { calendarService } from '../services/calendarService';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

router.get('/export/school/:schoolId', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = parseInt(req.params.schoolId);
    const { academicYear, term } = req.query;

    if (user.role !== 'Director' && user.role !== 'Admin' && user.role !== 'SiteAdmin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only school administrators can export school calendars' 
      });
    }

    if (user.role === 'Director' && user.schoolId !== schoolId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only export calendar for your own school' 
      });
    }

    if (!academicYear || !term) {
      return res.status(400).json({ 
        success: false, 
        message: 'Academic year and term are required' 
      });
    }

    const icalContent = await calendarService.generateSchoolCalendar(
      schoolId,
      academicYear as string,
      term as string
    );

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="educafric-school-${schoolId}-${academicYear}-${term}.ics"`);
    res.send(icalContent);

    console.log(`[CALENDAR] School calendar exported for school ${schoolId} by user ${user.id}`);
  } catch (error) {
    console.error('[CALENDAR] Error exporting school calendar:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export school calendar' 
    });
  }
});

router.get('/export/teacher/:teacherId', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const teacherId = parseInt(req.params.teacherId);
    const { academicYear, term } = req.query;

    if (user.role !== 'Teacher' && user.role !== 'Director' && user.role !== 'Admin' && user.role !== 'SiteAdmin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only teachers and administrators can export teacher calendars' 
      });
    }

    if (user.role === 'Teacher' && user.id !== teacherId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only export your own calendar' 
      });
    }

    if (!academicYear || !term) {
      return res.status(400).json({ 
        success: false, 
        message: 'Academic year and term are required' 
      });
    }

    const icalContent = await calendarService.generateTeacherCalendar(
      teacherId,
      academicYear as string,
      term as string
    );

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="educafric-teacher-${teacherId}-${academicYear}-${term}.ics"`);
    res.send(icalContent);

    console.log(`[CALENDAR] Teacher calendar exported for teacher ${teacherId} by user ${user.id}`);
  } catch (error) {
    console.error('[CALENDAR] Error exporting teacher calendar:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export teacher calendar' 
    });
  }
});

router.get('/subscription-url/school', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;

    if (user.role !== 'Director' && user.role !== 'Admin' && user.role !== 'SiteAdmin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only school administrators can get calendar subscription URLs' 
      });
    }

    const feedUrl = await calendarService.generateCalendarFeedUrl(user.id, 'Director');
    const fullUrl = `${req.protocol}://${req.get('host')}${feedUrl}`;

    res.json({ 
      success: true, 
      subscriptionUrl: fullUrl,
      instructions: {
        googleCalendar: 'In Google Calendar, click "+" next to "Other calendars" → "From URL" → Paste the URL',
        outlookCalendar: 'In Outlook Calendar, click "Add calendar" → "Subscribe from web" → Paste the URL',
        appleCalendar: 'In Apple Calendar, File → New Calendar Subscription → Paste the URL'
      }
    });
  } catch (error) {
    console.error('[CALENDAR] Error generating subscription URL:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate subscription URL' 
    });
  }
});

router.get('/subscription-url/teacher', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;

    if (user.role !== 'Teacher') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only teachers can get calendar subscription URLs' 
      });
    }

    const feedUrl = await calendarService.generateCalendarFeedUrl(user.id, 'Teacher');
    const fullUrl = `${req.protocol}://${req.get('host')}${feedUrl}`;

    res.json({ 
      success: true, 
      subscriptionUrl: fullUrl,
      instructions: {
        googleCalendar: 'In Google Calendar, click "+" next to "Other calendars" → "From URL" → Paste the URL',
        outlookCalendar: 'In Outlook Calendar, click "Add calendar" → "Subscribe from web" → Paste the URL',
        appleCalendar: 'In Apple Calendar, File → New Calendar Subscription → Paste the URL'
      }
    });
  } catch (error) {
    console.error('[CALENDAR] Error generating subscription URL:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate subscription URL' 
    });
  }
});

export default router;

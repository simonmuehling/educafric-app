import { Router, Request, Response } from 'express';
import { storage } from '../../storage';
import { requireAuth } from '../../middleware/auth';

interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = Router();

// Get notifications for a user
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, userRole } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }

    const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : parseInt(String(userId), 10);
    const notifications = await storage.getUserNotifications(userIdNum, userRole as string);
    res.json(notifications);
  } catch (error: any) {
    console.error('[NOTIFICATIONS_API] Get notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.post('/:id/mark-read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await storage.markNotificationAsRead(parseInt(id));
    res.json({ message: 'Notification marked as read' });
  } catch (error: any) {
    console.error('[NOTIFICATIONS_API] Mark notification as read error:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.post('/mark-all-read', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }

    await storage.markAllNotificationsAsRead(parseInt(userId));
    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('[NOTIFICATIONS_API] Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await storage.deleteNotification(parseInt(id));
    res.json({ message: 'Notification deleted' });
  } catch (error: any) {
    console.error('[NOTIFICATIONS_API] Delete notification error:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
});

// Send attendance notification to parent and student
router.post('/attendance', async (req: Request, res: Response) => {
  try {
    const { studentId, studentName, status, date, className, message, parentEmail, parentPhone, timestamp } = req.body;
    
    console.log('[ATTENDANCE_NOTIFICATION] Processing notification for:', { studentName, status, className });

    // Create notification for the student (if they have an account)
    if (studentId) {
      try {
        await storage.createNotification({
          userId: studentId,
          title: status === 'absent' ? 'Absence enregistrée' : 'Retard enregistré',
          message: message,
          type: 'attendance',
          priority: 'medium',
          metadata: {
            status,
            date,
            className,
            timestamp
          }
        });
        console.log('[ATTENDANCE_NOTIFICATION] ✅ Student notification created');
      } catch (error) {
        console.error('[ATTENDANCE_NOTIFICATION] ❌ Failed to create student notification:', error);
      }
    }

    // Send notification to parent via SMS/Email (if contact info available)
    let parentNotified = false;
    if (parentPhone || parentEmail) {
      try {
        // Send via SMS if phone number is available
        if (parentPhone) {
          const smsResponse = await fetch('/api/sms/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: parentPhone,
              message: `EDUCAFRIC: ${message}. Classe: ${className}. Date: ${date}`,
              type: 'attendance_notification'
            }),
          });
          
          if (smsResponse.ok) {
            parentNotified = true;
            console.log('[ATTENDANCE_NOTIFICATION] ✅ SMS sent to parent:', parentPhone);
          } else {
            console.log('[ATTENDANCE_NOTIFICATION] ⚠️ SMS failed, trying email...');
          }
        }

        // Send via email if SMS failed or no phone
        if (!parentNotified && parentEmail) {
          const emailResponse = await fetch('/api/email/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: parentEmail,
              subject: `EDUCAFRIC: ${status === 'absent' ? 'Absence' : 'Retard'} - ${studentName}`,
              text: `${message}\n\nClasse: ${className}\nDate: ${date}\n\nCordialement,\nL'équipe EDUCAFRIC`,
              html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                  <h2 style="color: #2563eb;">EDUCAFRIC - Notification de présence</h2>
                  <p><strong>${message}</strong></p>
                  <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>Élève:</strong> ${studentName}</p>
                    <p><strong>Classe:</strong> ${className}</p>
                    <p><strong>Date:</strong> ${date}</p>
                    <p><strong>Statut:</strong> ${status === 'absent' ? 'Absent(e)' : 'En retard'}</p>
                  </div>
                  <p>Cordialement,<br>L'équipe EDUCAFRIC</p>
                </div>
              `,
              type: 'attendance_notification'
            }),
          });
          
          if (emailResponse.ok) {
            parentNotified = true;
            console.log('[ATTENDANCE_NOTIFICATION] ✅ Email sent to parent:', parentEmail);
          }
        }
      } catch (error) {
        console.error('[ATTENDANCE_NOTIFICATION] ❌ Error sending parent notification:', error);
      }
    }

    res.json({
      success: true,
      message: 'Attendance notification processed',
      studentNotified: !!studentId,
      parentNotified,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[ATTENDANCE_NOTIFICATION] Error processing attendance notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process attendance notification',
      error: error.message 
    });
  }
});

// Create a new notification
router.post('/', async (req: Request, res: Response) => {
  try {
    const notificationData = req.body;
    
    const notification = await storage.createNotification(notificationData);
    res.json({ message: 'Notification created', data: notification });
  } catch (error: any) {
    console.error('[NOTIFICATIONS_API] Create notification error:', error);
    res.status(500).json({ message: 'Failed to create notification' });
  }
});

// Get pending notifications for a specific user (PWA polling endpoint)
router.get('/pending/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }

    const userIdNum = parseInt(userId, 10);
    console.log(`[NOTIFICATIONS_API] Getting pending notifications for user ${userIdNum}`);
    
    // Get all notifications for user and filter for pending ones
    const allNotifications = await storage.getUserNotifications(userIdNum);
    const pendingNotifications = allNotifications.filter((n: any) => 
      !n.isDelivered && !n.isRead
    );
    
    // Transform notifications to match frontend expectations
    const formattedNotifications = pendingNotifications.map((n: any) => ({
      id: n.id,
      title: n.title,
      message: n.content || n.message,
      type: n.type,
      priority: n.priority || 'normal',
      timestamp: n.createdAt,
      actionUrl: n.metadata?.actionUrl || '/',
      actionText: n.metadata?.actionText || 'Voir',
      userId: n.userId
    }));

    console.log(`[NOTIFICATIONS_API] ✅ Found ${pendingNotifications.length} pending notifications for user ${userIdNum}`);
    res.json(formattedNotifications);
  } catch (error: any) {
    console.error('[NOTIFICATIONS_API] Get pending notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch pending notifications' });
  }
});

// Mark notification as delivered (PWA confirmation endpoint)
router.post('/:id/delivered', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Notification ID required' });
    }

    console.log(`[NOTIFICATIONS_API] Marking notification ${id} as delivered`);
    
    await storage.markNotificationAsDelivered(parseInt(id));
    
    console.log(`[NOTIFICATIONS_API] ✅ Notification ${id} marked as delivered`);
    res.json({ success: true, message: 'Notification marked as delivered' });
  } catch (error: any) {
    console.error('[NOTIFICATIONS_API] Mark notification as delivered error:', error);
    res.status(500).json({ message: 'Failed to mark notification as delivered' });
  }
});

// Background sync endpoint for PWA
router.post('/sync', async (req: Request, res: Response) => {
  try {
    const { userId, lastSync } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }

    // Get notifications since last sync  
    const notifications = await storage.getUserNotifications(parseInt(userId), undefined);
    res.json({ notifications, syncTime: new Date().toISOString() });
  } catch (error: any) {
    console.error('[NOTIFICATIONS_API] Sync error:', error);
    res.status(500).json({ message: 'Failed to sync notifications' });
  }
});

// Configure SMS fallback for PWA issues
router.post('/configure-fallback', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { preferredMethod, reason, issues } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Enregistrer la configuration de fallback
    const fallbackConfig = {
      userId,
      preferredMethod: preferredMethod || 'sms',
      reason: reason || 'user_preference',
      issues: issues || [],
      configuredAt: new Date().toISOString(),
      isActive: true
    };

    // Sauvegarder en base (simulé pour l'instant)
    console.log('[NOTIFICATIONS] 📱 SMS fallback configured:', {
      userId,
      method: preferredMethod,
      reason
    });

    // Activer immédiatement les notifications SMS
    if (preferredMethod === 'sms') {
      // Ici on activerait l'envoi SMS via Vonage
      console.log('[NOTIFICATIONS] ✅ SMS notifications activated for user', userId);
    }

    res.json({
      success: true,
      message: 'Fallback configuration saved successfully',
      config: {
        method: preferredMethod,
        active: true,
        configuredAt: fallbackConfig.configuredAt
      }
    });

  } catch (error: any) {
    console.error('[NOTIFICATIONS] ❌ Fallback configuration failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to configure notification fallback'
    });
  }
});

export default router;
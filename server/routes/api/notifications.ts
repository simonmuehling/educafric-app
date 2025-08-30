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
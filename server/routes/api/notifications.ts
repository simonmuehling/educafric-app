import { Router, Request, Response } from 'express';
import { storage } from '../../storage';

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

export default router;
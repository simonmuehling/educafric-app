import express from 'express';
import { storage } from '../storage';

const router = express.Router();

// Get notifications for a user
router.get('/api/notifications', async (req, res) => {
  try {
    const { userId, userRole } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }

    // Get notifications from storage (this would typically query the database)
    const notifications = await storage.getUserNotifications(Number(userId), userRole as string);
    
    res.json(notifications);
  } catch (error) {
    console.error('[API] Get notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.post('/api/notifications/:id/mark-read', async (req, res) => {
  try {
    const { id } = req.params;
    
    await storage.markNotificationAsRead(Number(id));
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('[API] Mark notification as read error:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.post('/api/notifications/mark-all-read', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }

    await storage.markAllNotificationsAsRead(Number(userId));
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('[API] Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/api/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await storage.deleteNotification(Number(id));
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('[API] Delete notification error:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
});

// Create a new notification
router.post('/api/notifications', async (req, res) => {
  try {
    const notificationData = req.body;
    
    const notification = await storage.createNotification(notificationData);
    
    res.json({ message: 'Notification created', data: notification });
  } catch (error) {
    console.error('[API] Create notification error:', error);
    res.status(500).json({ message: 'Failed to create notification' });
  }
});

// Background sync endpoint for PWA
router.post('/api/notifications/sync', async (req, res) => {
  try {
    // Handle background sync for notifications
    console.log('[API] Background sync requested');
    
    // In a real implementation, this would:
    // 1. Check for pending notifications
    // 2. Send any unsent PWA notifications
    // 3. Update notification status
    
    res.json({ message: 'Sync completed' });
  } catch (error) {
    console.error('[API] Background sync error:', error);
    res.status(500).json({ message: 'Sync failed' });
  }
});

export default router;
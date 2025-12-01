import type { Express } from "express";
import { db } from "../db";
import { notifications, users } from "@shared/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { InsertNotification } from "@shared/schema";

export function setupNotificationRoutes(app: Express) {
  
  // Get notifications for a user based on their role
  app.get('/api/notifications', async (req, res) => {
    try {
      // Check multiple authentication sources for compatibility
      const user = req.user || (req.session as any)?.userId;
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const userId = req.user?.id || (req.session as any)?.userId;
      const userRole = req.user.role;
      const category = req.query.category as string;
      const unreadOnly = req.query.unreadOnly === 'true';
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      let whereConditions = [
        eq(notifications.userId, userId)
      ];

      if (category && category !== 'all') {
        whereConditions.push(eq(notifications.type, category));
      }

      if (unreadOnly) {
        whereConditions.push(eq(notifications.isRead, false));
      }

      const userNotifications = await db
        .select()
        .from(notifications)
        .where(and(...whereConditions))
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset);

      res.json(userNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  // Mark a notification as read
  app.post('/api/notifications/:id/mark-read', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const notificationId = parseInt(req.params.id);
      const userId = req.user.id;

      await db
        .update(notifications)
        .set({ 
          isRead: true
        })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, userId)
          )
        );

      res.json({ success: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  });

  // Mark all notifications as read for a user
  app.post('/api/notifications/mark-all-read', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const userRole = req.user.role;

      await db
        .update(notifications)
        .set({ 
          isRead: true
        })
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false)
          )
        );

      res.json({ success: true });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  });

  // Delete a notification
  app.delete('/api/notifications/:id', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const notificationId = parseInt(req.params.id);
      const userId = req.user.id;

      await db
        .delete(notifications)
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, userId)
          )
        );

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  });

  // Get unread notification count
  app.get('/api/notifications/unread-count', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const userId = req.user.id;
      const userRole = req.user.role;

      const result = await db
        .select({ count: count() })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false)
          )
        );

      res.json({ count: result[0]?.count || 0 });
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({ error: 'Failed to get unread count' });
    }
  });

  // Create a new notification (for system use)
  app.post('/api/notifications', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Only allow admins, directors, or system to create notifications
      if (!['SiteAdmin', 'Admin', 'Director'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const notificationData = req.body;
      
      // Basic notification data - use message field (not content)
      const basicNotificationData = {
        userId: notificationData.userId,
        title: notificationData.title,
        message: notificationData.message || notificationData.content || '',
        type: notificationData.type || 'general'
      };

      const newNotification = await db
        .insert(notifications)
        .values(basicNotificationData)
        .returning();

      res.json(newNotification[0]);
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({ error: 'Failed to create notification' });
    }
  });

  // Create bulk notifications (for system use)
  app.post('/api/notifications/bulk', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Only allow admins, directors, or system to create bulk notifications
      if (!['SiteAdmin', 'Admin', 'Director'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const notificationsData = req.body;
      
      // Process notifications to basic format - use message field (not content)
      const processedNotifications = notificationsData.map((notification: any) => ({
        userId: notification.userId,
        title: notification.title,
        message: notification.message || notification.content || '',
        type: notification.type || 'general'
      }));

      await db.insert(notifications).values(processedNotifications);

      res.json({ 
        success: true, 
        count: processedNotifications.length,
        message: `Created ${processedNotifications.length} notifications` 
      });
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      res.status(500).json({ error: 'Failed to create bulk notifications' });
    }
  });

  console.log('[NOTIFICATIONS] ✅ Notification routes registered successfully');
}

export default setupNotificationRoutes;
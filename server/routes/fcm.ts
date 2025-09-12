import { Router, Request, Response } from 'express';
import { db } from '../db';
import { fcmTokens, users } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Validation schemas
const registerTokenSchema = z.object({
  userId: z.number(),
  token: z.string().min(1, 'FCM token is required'),
  deviceType: z.string().optional().default('web'),
  userAgent: z.string().optional()
});

const sendNotificationSchema = z.object({
  userId: z.number(),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  priority: z.enum(['normal', 'high']).optional().default('normal'),
  actionUrl: z.string().optional().default('/'),
  actionText: z.string().optional().default('Ouvrir')
});

// Extended Request interface for authentication
interface AuthenticatedRequest extends Request {
  user?: any;
}

// POST /api/fcm/register - Register FCM token for user
router.post('/register', async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('[FCM_ROUTES] 📝 Registering FCM token:', req.body);
    
    // Validate request body
    const validatedData = registerTokenSchema.parse(req.body);
    const { userId, token, deviceType, userAgent } = validatedData;

    // Get user's IP address
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    // Check if user exists
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if token already exists for this user
    const existingToken = await db
      .select()
      .from(fcmTokens)
      .where(and(eq(fcmTokens.userId, userId), eq(fcmTokens.token, token)))
      .limit(1);

    if (existingToken.length > 0) {
      // Update existing token
      await db
        .update(fcmTokens)
        .set({
          isActive: true,
          lastUsedAt: new Date(),
          userAgent,
          ipAddress,
          updatedAt: new Date()
        })
        .where(eq(fcmTokens.id, existingToken[0].id));

      console.log('[FCM_ROUTES] ✅ FCM token updated for user:', userId);
    } else {
      // Insert new token
      await db
        .insert(fcmTokens)
        .values({
          userId,
          token,
          deviceType,
          userAgent,
          ipAddress,
          isActive: true,
          lastUsedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });

      console.log('[FCM_ROUTES] ✅ FCM token registered for user:', userId);
    }

    // Deactivate other tokens for this user (keep only the latest)
    await db
      .update(fcmTokens)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(
        eq(fcmTokens.userId, userId),
        eq(fcmTokens.isActive, true)
      ));

    // Reactivate current token
    await db
      .update(fcmTokens)
      .set({ isActive: true, updatedAt: new Date() })
      .where(and(
        eq(fcmTokens.userId, userId),
        eq(fcmTokens.token, token)
      ));

    res.json({
      success: true,
      message: 'FCM token registered successfully',
      userId,
      deviceType
    });

  } catch (error: any) {
    console.error('[FCM_ROUTES] ❌ Error registering FCM token:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to register FCM token'
    });
  }
});

// POST /api/fcm/send - Send FCM notification
router.post('/send', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('[FCM_ROUTES] 📤 Sending FCM notification:', req.body);
    
    // Validate request body
    const validatedData = sendNotificationSchema.parse(req.body);
    const { userId, title, message, priority, actionUrl, actionText } = validatedData;

    // Get active FCM tokens for the user
    const userTokens = await db
      .select()
      .from(fcmTokens)
      .where(and(
        eq(fcmTokens.userId, userId),
        eq(fcmTokens.isActive, true)
      ))
      .orderBy(desc(fcmTokens.lastUsedAt))
      .limit(5); // Limit to 5 most recent tokens

    if (userTokens.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active FCM tokens found for user'
      });
    }

    console.log(`[FCM_ROUTES] 📱 Found ${userTokens.length} active tokens for user ${userId}`);

    // For now, we'll simulate sending FCM notifications
    // In production, you would use Firebase Admin SDK to send real notifications
    const mockNotificationResults = userTokens.map(token => {
      console.log(`[FCM_ROUTES] 📲 Simulating FCM send to token: ${token.token.substring(0, 20)}...`);
      
      // Update last used timestamp
      db.update(fcmTokens)
        .set({ lastUsedAt: new Date(), updatedAt: new Date() })
        .where(eq(fcmTokens.id, token.id))
        .then(() => {
          console.log(`[FCM_ROUTES] ⏰ Updated last used timestamp for token ${token.id}`);
        })
        .catch(error => {
          console.error(`[FCM_ROUTES] ❌ Failed to update timestamp for token ${token.id}:`, error);
        });

      return {
        tokenId: token.id,
        token: token.token.substring(0, 20) + '...',
        status: 'sent_simulated',
        messageId: `fcm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    });

    // TODO: Replace with real Firebase Admin SDK implementation
    /*
    const admin = require('firebase-admin');
    const messaging = admin.messaging();
    
    const notifications = userTokens.map(token => ({
      token: token.token,
      notification: {
        title,
        body: message,
        icon: '/educafric-logo-128.png'
      },
      data: {
        actionUrl,
        actionText,
        priority,
        userId: userId.toString(),
        timestamp: Date.now().toString()
      },
      webpush: {
        fcmOptions: {
          link: actionUrl
        }
      }
    }));
    
    const results = await messaging.sendAll(notifications);
    console.log('[FCM_ROUTES] ✅ FCM notifications sent:', results);
    */

    console.log('[FCM_ROUTES] ✅ FCM notification simulated successfully');

    res.json({
      success: true,
      message: 'FCM notification sent successfully',
      userId,
      tokensCount: userTokens.length,
      results: mockNotificationResults,
      simulationMode: true // Remove this when implementing real FCM
    });

  } catch (error: any) {
    console.error('[FCM_ROUTES] ❌ Error sending FCM notification:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to send FCM notification'
    });
  }
});

// GET /api/fcm/status/:userId - Get FCM status for user
router.get('/status/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    console.log('[FCM_ROUTES] 📊 Getting FCM status for user:', userId);

    // Get active tokens count
    const activeTokens = await db
      .select()
      .from(fcmTokens)
      .where(and(
        eq(fcmTokens.userId, userId),
        eq(fcmTokens.isActive, true)
      ));

    // Get total tokens count
    const totalTokens = await db
      .select()
      .from(fcmTokens)
      .where(eq(fcmTokens.userId, userId));

    const status = {
      enabled: activeTokens.length > 0,
      hasToken: totalTokens.length > 0,
      activeTokensCount: activeTokens.length,
      totalTokensCount: totalTokens.length,
      lastActiveToken: activeTokens.length > 0 ? {
        deviceType: activeTokens[0].deviceType,
        lastUsed: activeTokens[0].lastUsedAt,
        created: activeTokens[0].createdAt
      } : null
    };

    console.log('[FCM_ROUTES] ✅ FCM status retrieved:', status);

    res.json(status);

  } catch (error: any) {
    console.error('[FCM_ROUTES] ❌ Error getting FCM status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get FCM status'
    });
  }
});

// POST /api/fcm/unregister - Unregister FCM tokens for user
router.post('/unregister', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    console.log('[FCM_ROUTES] ⏹️ Unregistering FCM tokens for user:', userId);

    // Deactivate all tokens for the user
    await db
      .update(fcmTokens)
      .set({ 
        isActive: false, 
        updatedAt: new Date() 
      })
      .where(eq(fcmTokens.userId, parseInt(userId)));

    console.log('[FCM_ROUTES] ✅ FCM tokens unregistered successfully');

    res.json({
      success: true,
      message: 'FCM tokens unregistered successfully',
      userId: parseInt(userId)
    });

  } catch (error: any) {
    console.error('[FCM_ROUTES] ❌ Error unregistering FCM tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unregister FCM tokens'
    });
  }
});

// GET /api/fcm/debug/:userId - Debug endpoint to view all tokens for user
router.get('/debug/:userId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Only allow admins or the user themselves to view debug info
    if (req.user?.role !== 'SiteAdmin' && req.user?.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    console.log('[FCM_ROUTES] 🐛 Getting debug info for user:', userId);

    const allTokens = await db
      .select()
      .from(fcmTokens)
      .where(eq(fcmTokens.userId, userId))
      .orderBy(desc(fcmTokens.createdAt));

    const debugInfo = allTokens.map(token => ({
      id: token.id,
      tokenPreview: token.token.substring(0, 20) + '...',
      deviceType: token.deviceType,
      isActive: token.isActive,
      userAgent: token.userAgent?.substring(0, 50) + '...',
      ipAddress: token.ipAddress,
      lastUsedAt: token.lastUsedAt,
      createdAt: token.createdAt
    }));

    res.json({
      success: true,
      userId,
      totalTokens: allTokens.length,
      activeTokens: allTokens.filter(t => t.isActive).length,
      tokens: debugInfo
    });

  } catch (error: any) {
    console.error('[FCM_ROUTES] ❌ Error getting debug info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get debug info'
    });
  }
});

export default router;
import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { storage } from '../storage';

// Extended request interface for authenticated routes
interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = Router();

// PWA Analytics Routes

// Track PWA session data
router.post('/pwa/session', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      userId,
      sessionId,
      accessMethod,
      deviceType,
      userAgent,
      isStandalone,
      isPwaInstalled,
      pushPermissionGranted
    } = req.body;

    // Validate required fields
    if (!sessionId || !accessMethod) {
      return res.status(400).json({
        success: false,
        message: 'sessionId and accessMethod are required'
      });
    }

    // Create analytics entry
    const analyticsData = {
      sessionId,
      userId: userId || (req.user ? req.user.id : null),
      accessMethod, // 'web', 'pwa', 'mobile_app'
      deviceType: deviceType || 'unknown',
      userAgent: userAgent || req.get('User-Agent') || 'unknown',
      isStandalone: isStandalone || false,
      isPwaInstalled: isPwaInstalled || false,
      pushPermissionGranted: pushPermissionGranted || false,
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress
    };

    // Log analytics data for now (could be stored in database later)
    console.log('[PWA_ANALYTICS] Session tracked:', {
      sessionId: analyticsData.sessionId,
      accessMethod: analyticsData.accessMethod,
      deviceType: analyticsData.deviceType,
      isStandalone: analyticsData.isStandalone
    });

    res.json({
      success: true,
      message: 'Session tracked successfully',
      sessionId: analyticsData.sessionId
    });

  } catch (error: any) {
    console.error('[PWA_ANALYTICS] Error tracking session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track session'
    });
  }
});

// Track PWA installation
router.post('/pwa/install', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      deviceType,
      userAgent
    } = req.body;

    const installData = {
      userId: req.user ? req.user.id : null,
      deviceType: deviceType || 'unknown',
      userAgent: userAgent || req.get('User-Agent') || 'unknown',
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress
    };

    // Store installation data (would be saved to database in production)
    await storage.createUserAnalytics({
      userId: installData.userId,
      type: 'pwa_install',
      data: installData
    });

    // Log installation data
    console.log('[PWA_ANALYTICS] Installation tracked:', {
      deviceType: installData.deviceType,
      userId: installData.userId
    });

    res.json({
      success: true,
      message: 'Installation tracked successfully'
    });

  } catch (error: any) {
    console.error('[PWA_ANALYTICS] Error tracking installation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track installation'
    });
  }
});

// Track PWA notification subscription
router.post('/pwa/subscription', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      subscription,
      deviceInfo,
      notificationSettings
    } = req.body;

    const subscriptionData = {
      userId: req.user ? req.user.id : null,
      subscription: subscription,
      deviceInfo: deviceInfo || {},
      notificationSettings: notificationSettings || {},
      subscribedAt: new Date().toISOString(),
      isActive: true
    };

    // Store subscription data for user settings display
    await storage.createPWASubscription(subscriptionData);

    console.log('[PWA_ANALYTICS] Subscription tracked for user:', subscriptionData.userId);

    res.json({
      success: true,
      message: 'PWA subscription tracked successfully',
      subscriptionId: `pwa_sub_${Date.now()}`
    });

  } catch (error: any) {
    console.error('[PWA_ANALYTICS] Error tracking subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track subscription'
    });
  }
});

// Get user's PWA subscription info for settings display
router.get('/pwa/user-subscription', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const subscriptionInfo = await storage.getUserPWASubscription(userId);
    
    res.json({
      success: true,
      subscription: subscriptionInfo || null
    });

  } catch (error: any) {
    console.error('[PWA_ANALYTICS] Error getting user subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription info'
    });
  }
});

// Get analytics summary (protected route)
router.get('/pwa/summary', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Return mock analytics summary for now
    const summary = {
      totalSessions: 0,
      pwaInstalls: 0,
      webSessions: 0,
      pwaSessions: 0,
      mobileAppSessions: 0,
      deviceBreakdown: {
        mobile: 0,
        desktop: 0,
        tablet: 0
      },
      pushNotificationOptIns: 0
    };

    res.json({
      success: true,
      summary
    });

  } catch (error: any) {
    console.error('[PWA_ANALYTICS] Error getting summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics summary'
    });
  }
});

export default router;
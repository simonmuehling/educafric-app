/**
 * Test Notifications API Routes
 * Allows testing the automatic notification system
 */

import { Router, type Request, type Response } from 'express';
import { autoNotificationService } from '../services/autoNotificationService';
import { PLATFORM_CONFIG } from '../config/platformConfig';

const router = Router();

/**
 * GET /api/test-notifications/config
 * Get notification configuration and status
 */
router.get('/config', (req: Request, res: Response) => {
  try {
    const stats = autoNotificationService.getStats();
    
    res.json({
      success: true,
      config: {
        supportPhone: PLATFORM_CONFIG.contacts.supportPhoneAfrican,
        supportEmail: PLATFORM_CONFIG.contacts.supportEmail,
        whatsappDisplay: PLATFORM_CONFIG.whatsapp.displayNumber,
        autoNotify: PLATFORM_CONFIG.notifications.autoNotify,
        channels: PLATFORM_CONFIG.notifications.channels
      },
      stats
    });
  } catch (error) {
    console.error('[TEST_NOTIFICATIONS] Error getting config:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/test-notifications/test-attendance
 * Test sending an attendance notification
 */
router.post('/test-attendance', async (req: Request, res: Response) => {
  try {
    console.log('[TEST_NOTIFICATIONS] Testing attendance notification...');
    
    const result = await autoNotificationService.sendTestNotification('attendance', req.body);
    
    res.json({
      success: true,
      message: 'Test attendance notification processed',
      result
    });
  } catch (error) {
    console.error('[TEST_NOTIFICATIONS] Error sending test attendance:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/test-notifications/test-grades
 * Test sending a grades notification
 */
router.post('/test-grades', async (req: Request, res: Response) => {
  try {
    console.log('[TEST_NOTIFICATIONS] Testing grades notification...');
    
    const result = await autoNotificationService.sendTestNotification('grades', req.body);
    
    res.json({
      success: true,
      message: 'Test grades notification processed',
      result
    });
  } catch (error) {
    console.error('[TEST_NOTIFICATIONS] Error sending test grades:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/test-notifications/test-payments
 * Test sending a payment notification
 */
router.post('/test-payments', async (req: Request, res: Response) => {
  try {
    console.log('[TEST_NOTIFICATIONS] Testing payment notification...');
    
    const result = await autoNotificationService.sendTestNotification('payments', req.body);
    
    res.json({
      success: true,
      message: 'Test payment notification processed',
      result
    });
  } catch (error) {
    console.error('[TEST_NOTIFICATIONS] Error sending test payment:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/test-notifications/stats
 * Get notification statistics
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = autoNotificationService.getStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('[TEST_NOTIFICATIONS] Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

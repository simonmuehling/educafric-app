/**
 * Test Notifications API Routes
 * Allows testing the automatic notification system
 */

import { Router, type Request, type Response } from 'express';
import { autoNotificationService } from '../services/autoNotificationService';
import { whatsappDirectService } from '../services/whatsappDirectNotificationService';
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
    const whatsappStats = whatsappDirectService.getStats();
    
    res.json({
      success: true,
      stats,
      whatsappStats
    });
  } catch (error) {
    console.error('[TEST_NOTIFICATIONS] Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/test-notifications/test-geolocation
 * Test sending a geolocation alert
 */
router.post('/test-geolocation', async (req: Request, res: Response) => {
  try {
    console.log('[TEST_NOTIFICATIONS] Testing geolocation alert...');
    
    const result = await whatsappDirectService.sendGeolocationAlert({
      recipientPhone: '+41768017000', // Test number
      studentName: 'Test Student',
      alertType: 'Zone Exit',
      location: 'Yaoundé, Cameroun',
      timestamp: new Date().toLocaleString('fr-FR'),
      zoneName: 'École',
      language: 'fr'
    });
    
    res.json({
      success: true,
      message: 'Test geolocation alert sent',
      result
    });
  } catch (error) {
    console.error('[TEST_NOTIFICATIONS] Error sending test geolocation:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/test-notifications/test-online-class
 * Test sending an online class notification
 */
router.post('/test-online-class', async (req: Request, res: Response) => {
  try {
    console.log('[TEST_NOTIFICATIONS] Testing online class notification...');
    
    const result = await whatsappDirectService.sendOnlineClassNotification({
      recipientPhone: '+41768017000', // Test number
      studentName: 'Test Student',
      courseName: 'Mathématiques',
      teacherName: 'Prof. Kamdem',
      startTime: new Date(Date.now() + 3600000).toLocaleString('fr-FR'),
      duration: '1 heure',
      joinLink: 'https://meet.educafric.com/join/test123',
      language: 'fr'
    });
    
    res.json({
      success: true,
      message: 'Test online class notification sent',
      result
    });
  } catch (error) {
    console.error('[TEST_NOTIFICATIONS] Error sending test online class:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/test-notifications/test-timetable
 * Test sending a timetable change notification
 */
router.post('/test-timetable', async (req: Request, res: Response) => {
  try {
    console.log('[TEST_NOTIFICATIONS] Testing timetable notification...');
    
    const result = await whatsappDirectService.sendTimetableNotification({
      recipientPhone: '+41768017000', // Test number
      studentName: 'Test Student',
      changeType: 'Modification',
      subject: 'Physique',
      oldTime: 'Lundi 08:00',
      newTime: 'Lundi 10:00',
      className: 'Terminale A',
      teacherName: 'Prof. Ngo',
      language: 'fr'
    });
    
    res.json({
      success: true,
      message: 'Test timetable notification sent',
      result
    });
  } catch (error) {
    console.error('[TEST_NOTIFICATIONS] Error sending test timetable:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/test-notifications/test-message
 * Test sending a direct message notification
 */
router.post('/test-message', async (req: Request, res: Response) => {
  try {
    console.log('[TEST_NOTIFICATIONS] Testing direct message notification...');
    
    const result = await whatsappDirectService.sendDirectMessage({
      recipientPhone: '+41768017000', // Test number
      senderName: 'Prof. Kamdem',
      senderRole: 'Enseignant',
      messagePreview: 'Bonjour, merci de consulter les devoirs de cette semaine...',
      language: 'fr'
    });
    
    res.json({
      success: true,
      message: 'Test direct message notification sent',
      result
    });
  } catch (error) {
    console.error('[TEST_NOTIFICATIONS] Error sending test message:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

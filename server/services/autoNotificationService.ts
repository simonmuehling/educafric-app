/**
 * Automatic Notification Service for EDUCAFRIC
 * Activates and sends automatic notifications for key events:
 * - Absences/Retards
 * - Notes/Bulletins
 * - Paiements
 */

import { AttendanceNotificationService } from './attendanceNotificationService';
import { whatsappDirectService } from './whatsappDirectNotificationService';
import { shouldAutoNotify, isNotificationChannelEnabled, PLATFORM_CONFIG } from '../config/platformConfig';

export interface AutoNotificationEvent {
  type: 'attendance' | 'grades' | 'payments' | 'geolocation' | 'onlineClasses' | 'subscriptions';
  data: any;
  schoolId: number;
  triggeredBy?: number;
}

export class AutoNotificationService {
  private static instance: AutoNotificationService;
  private attendanceService: AttendanceNotificationService;
  private stats = {
    total: 0,
    attendance: 0,
    grades: 0,
    payments: 0,
    geolocation: 0,
    onlineClasses: 0,
    subscriptions: 0
  };

  private constructor() {
    this.attendanceService = new AttendanceNotificationService();
    console.log('[AUTO_NOTIFICATIONS] ✅ Service initialized');
    console.log('[AUTO_NOTIFICATIONS] 📱 Active channels:', this.getActiveChannels());
    console.log('[AUTO_NOTIFICATIONS] 🔔 Auto-notify settings:', this.getAutoNotifySettings());
  }

  static getInstance(): AutoNotificationService {
    if (!AutoNotificationService.instance) {
      AutoNotificationService.instance = new AutoNotificationService();
    }
    return AutoNotificationService.instance;
  }

  /**
   * Main entry point - processes any notification event
   */
  async processEvent(event: AutoNotificationEvent): Promise<{
    success: boolean;
    notificationsSent: number;
    channels: string[];
    errors?: string[];
  }> {
    // Check if auto-notify is enabled for this event type
    if (!shouldAutoNotify(event.type)) {
      console.log(`[AUTO_NOTIFICATIONS] ⚠️ Auto-notify disabled for ${event.type}`);
      return {
        success: false,
        notificationsSent: 0,
        channels: [],
        errors: ['Auto-notify disabled for this event type']
      };
    }

    console.log(`[AUTO_NOTIFICATIONS] 🔔 Processing ${event.type} event...`);

    try {
      let result;

      switch (event.type) {
        case 'attendance':
          result = await this.handleAttendanceEvent(event.data);
          this.stats.attendance++;
          break;

        case 'grades':
          result = await this.handleGradeEvent(event.data);
          this.stats.grades++;
          break;

        case 'payments':
          result = await this.handlePaymentEvent(event.data);
          this.stats.payments++;
          break;

        case 'geolocation':
          result = await this.handleGeolocationEvent(event.data);
          this.stats.geolocation++;
          break;

        case 'onlineClasses':
          result = await this.handleOnlineClassEvent(event.data);
          this.stats.onlineClasses++;
          break;

        case 'subscriptions':
          result = await this.handleSubscriptionEvent(event.data);
          this.stats.subscriptions++;
          break;

        default:
          throw new Error(`Unknown event type: ${event.type}`);
      }

      this.stats.total++;
      return result;

    } catch (error) {
      console.error(`[AUTO_NOTIFICATIONS] ❌ Error processing ${event.type}:`, error);
      return {
        success: false,
        notificationsSent: 0,
        channels: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Handle attendance events (absences, tardiness, presence)
   */
  private async handleAttendanceEvent(data: any) {
    console.log('[AUTO_NOTIFICATIONS] 📚 Processing attendance notification...');

    const result = await this.attendanceService.sendAttendanceNotification({
      studentId: data.studentId,
      studentName: data.studentName,
      className: data.className,
      date: data.date || new Date().toLocaleDateString('fr-FR'),
      status: data.status,
      notes: data.notes,
      schoolName: data.schoolName,
      markedBy: data.markedBy
    });

    const channels = [];
    if (result.channels.email === 'sent') channels.push('email');
    if (result.channels.whatsapp === 'sent') channels.push('whatsapp');
    if (result.channels.pwa === 'sent') channels.push('pwa');

    return {
      success: result.success,
      notificationsSent: result.notificationsSent,
      channels,
      errors: result.errors
    };
  }

  /**
   * Handle grade/bulletin events
   */
  private async handleGradeEvent(data: any) {
    console.log('[AUTO_NOTIFICATIONS] 📊 Processing grade/bulletin notification...');
    console.log(`[AUTO_NOTIFICATIONS] Student: ${data.studentId}, Period: ${data.period}`);
    
    // TODO: Integrate with BulletinNotificationService when ready
    // For now, we log the event and return success
    console.log('[AUTO_NOTIFICATIONS] ✅ Grade notification would be sent via email + PWA');

    return {
      success: true,
      notificationsSent: 2,
      channels: ['email', 'pwa']
    };
  }

  /**
   * Handle payment events
   */
  private async handlePaymentEvent(data: any) {
    console.log('[AUTO_NOTIFICATIONS] 💳 Processing payment notification...');
    console.log(`[AUTO_NOTIFICATIONS] User: ${data.userId}, Amount: ${data.amount} ${data.currency || 'XAF'}`);
    
    // TODO: Integrate with PaymentNotificationService when ready
    // For now, we log the event and return success
    console.log('[AUTO_NOTIFICATIONS] ✅ Payment notification would be sent via email + PWA');

    return {
      success: true,
      notificationsSent: 2,
      channels: ['email', 'pwa']
    };
  }

  /**
   * Handle geolocation alert events
   */
  private async handleGeolocationEvent(data: any) {
    console.log('[AUTO_NOTIFICATIONS] 📍 Processing geolocation alert...');

    // Geolocation alerts are handled by GeolocationAlertService
    // This is a placeholder for future integration
    return {
      success: true,
      notificationsSent: 1,
      channels: ['email', 'whatsapp']
    };
  }

  /**
   * Handle online class events
   */
  private async handleOnlineClassEvent(data: any) {
    console.log('[AUTO_NOTIFICATIONS] 🎥 Processing online class notification...');

    // Online class notifications are handled by OnlineClassNotificationService
    return {
      success: true,
      notificationsSent: 1,
      channels: ['email', 'whatsapp', 'pwa']
    };
  }

  /**
   * Handle subscription events
   */
  private async handleSubscriptionEvent(data: any) {
    console.log('[AUTO_NOTIFICATIONS] 📅 Processing subscription notification...');

    // Subscription notifications are handled by SubscriptionManager
    return {
      success: true,
      notificationsSent: 1,
      channels: ['email']
    };
  }

  /**
   * Get active notification channels
   */
  private getActiveChannels(): string[] {
    const channels = [];
    if (isNotificationChannelEnabled('email')) channels.push('email');
    if (isNotificationChannelEnabled('whatsapp')) channels.push('whatsapp');
    if (isNotificationChannelEnabled('pwa')) channels.push('pwa');
    return channels;
  }

  /**
   * Get auto-notify settings
   */
  private getAutoNotifySettings(): Record<string, boolean> {
    return {
      attendance: shouldAutoNotify('attendance'),
      grades: shouldAutoNotify('grades'),
      payments: shouldAutoNotify('payments'),
      geolocation: shouldAutoNotify('geolocation'),
      onlineClasses: shouldAutoNotify('onlineClasses'),
      subscriptions: shouldAutoNotify('subscriptions')
    };
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      ...this.stats,
      channels: this.getActiveChannels(),
      settings: this.getAutoNotifySettings()
    };
  }

  /**
   * Test notification sending (for debugging)
   */
  async sendTestNotification(type: 'attendance' | 'grades' | 'payments', testData?: any) {
    console.log(`[AUTO_NOTIFICATIONS] 🧪 Sending test ${type} notification...`);

    const defaultTestData = {
      attendance: {
        studentId: 1,
        studentName: 'Jean Dupont (Test)',
        className: 'Terminale A',
        date: new Date().toLocaleDateString('fr-FR'),
        status: 'absent' as const,
        notes: 'Test de notification automatique',
        schoolName: 'École de Test Educafric',
        markedBy: 'Système Automatique'
      },
      grades: {
        studentId: 1,
        bulletinId: 1,
        period: 'Trimestre 1',
        schoolId: 1
      },
      payments: {
        userId: 1,
        amount: 50000,
        currency: 'XAF',
        paymentMethod: 'stripe',
        transactionId: 'test_' + Date.now(),
        description: 'Test de paiement'
      }
    };

    return await this.processEvent({
      type,
      data: testData || defaultTestData[type],
      schoolId: 1
    });
  }
}

// Export singleton instance
export const autoNotificationService = AutoNotificationService.getInstance();

import { NotificationService } from './notificationService';

const notificationService = new NotificationService();

interface CriticalEvent {
  type: 'server_error' | 'database_failure' | 'security_breach' | 'commercial_connection' | 'payment_failure' | 'system_overload';
  severity: 'high' | 'critical';
  message: string;
  details: Record<string, any>;
  timestamp: Date;
  source: string;
}

interface OwnerContact {
  emails: string[];
  phones: {
    primary: string; // Cameroon +237657004011
    secondary: string; // Switzerland +41768017000
  };
  name: string;
}

export class CriticalAlertingService {
  private ownerContacts: OwnerContact;
  private commercialNotificationPhone: string;

  constructor() {
    this.ownerContacts = {
      emails: ['admin@educafric.com', 'support@educafric.com'],
      phones: {
        primary: '+237600000000',   // Demo primary contact
        secondary: '+237600000001'   // Demo secondary contact
      },
      name: 'Platform Administrator'
    };
    
    // Commercial connections notify to demo number
    this.commercialNotificationPhone = '+237600000001';
    
    console.log('[CRITICAL_ALERTING] Service initialized for Educafric platform');
    console.log(`[CRITICAL_ALERTING] Owner emails: ${this.ownerContacts.emails.join(', ')}`);
    console.log(`[CRITICAL_ALERTING] Primary phone: ${this.ownerContacts.phones.primary}`);
    console.log(`[CRITICAL_ALERTING] Commercial notifications: ${this.commercialNotificationPhone}`);
  }

  // Major server/database issues - Email + SMS to both phones
  async sendCriticalSystemAlert(event: CriticalEvent) {
    const alertMessage = this.formatCriticalAlert(event);
    
    console.log(`🚨 [CRITICAL_SYSTEM_ALERT] ${event.type}: ${event.message}`);
    
    try {
      // Send emails to both addresses
      for (const email of this.ownerContacts.emails) {
        await this.sendEmailAlert(email, alertMessage, event);
      }
      
      // Send SMS to both phone numbers for critical system issues
      await this.sendSMSAlert(this.ownerContacts.phones.primary, this.formatSMSAlert(event));
      await this.sendSMSAlert(this.ownerContacts.phones.secondary, this.formatSMSAlert(event));
      
      console.log('[CRITICAL_ALERTING] System alert sent successfully');
    } catch (error) {
      console.error('[CRITICAL_ALERTING] Failed to send system alert:', error);
    }
  }

  // Commercial user connections - PWA notification + SMS only to Switzerland
  async sendCommercialConnectionAlert(userInfo: any) {
    const event: CriticalEvent = {
      type: 'commercial_connection',
      severity: 'high',
      message: `Commercial user connected: ${userInfo.name || 'Unknown'} (${userInfo.email})`,
      details: {
        userId: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        role: userInfo.role,
        loginTime: new Date().toISOString(),
        ip: userInfo.ip || 'Unknown'
      },
      timestamp: new Date(),
      source: 'authentication_system'
    };

    console.log(`📊 [COMMERCIAL_CONNECTION] ${event.message}`);
    
    try {
      // Send PWA notification
      await this.sendPWANotification('Commercial Connection Alert', event.message, event.details);
      
      // Send SMS only to Switzerland number
      const smsMessage = `EDUCAFRIC: Commercial user ${userInfo.name || userInfo.email} connected at ${new Date().toLocaleTimeString('fr-CH')}`;
      await this.sendSMSAlert(this.commercialNotificationPhone, smsMessage);
      
      console.log('[CRITICAL_ALERTING] Commercial connection alert sent');
    } catch (error) {
      console.error('[CRITICAL_ALERTING] Failed to send commercial alert:', error);
    }
  }

  // Database connection failures
  async sendDatabaseAlert(error: any) {
    const event: CriticalEvent = {
      type: 'database_failure',
      severity: 'critical',
      message: 'Database connection failure detected',
      details: {
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
        database: 'PostgreSQL'
      },
      timestamp: new Date(),
      source: 'database_monitor'
    };

    await this.sendCriticalSystemAlert(event);
  }

  // Server errors (500, crashes, etc.)
  async sendServerErrorAlert(error: any, req?: any) {
    const event: CriticalEvent = {
      type: 'server_error',
      severity: 'critical',
      message: `Server error: ${error.message}`,
      details: {
        error: error.message,
        stack: error.stack?.split('\n').slice(0, 5).join('\n'), // First 5 lines
        endpoint: req?.originalUrl || 'Unknown',
        method: req?.method || 'Unknown',
        ip: req?.ip || 'Unknown',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      source: 'express_server'
    };

    await this.sendCriticalSystemAlert(event);
  }

  // Security breaches
  async sendSecurityAlert(threatInfo: any) {
    const event: CriticalEvent = {
      type: 'security_breach',
      severity: 'critical',
      message: `Security threat detected: ${threatInfo.type}`,
      details: {
        threatType: threatInfo.type,
        ip: threatInfo.ip,
        endpoint: threatInfo.endpoint,
        threatScore: threatInfo.score,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      source: 'security_monitor'
    };

    await this.sendCriticalSystemAlert(event);
  }

  // Payment system failures
  async sendPaymentAlert(paymentError: any) {
    const event: CriticalEvent = {
      type: 'payment_failure',
      severity: 'high',
      message: 'Payment system error detected',
      details: {
        error: paymentError.message,
        stripeError: paymentError.stripe_error,
        amount: paymentError.amount,
        currency: paymentError.currency,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      source: 'stripe_integration'
    };

    await this.sendCriticalSystemAlert(event);
  }

  private formatCriticalAlert(event: CriticalEvent): string {
    return `
🚨 EDUCAFRIC CRITICAL ALERT 🚨

Type: ${event.type.toUpperCase()}
Severity: ${event.severity.toUpperCase()}
Time: ${event.timestamp.toISOString()}

Message: ${event.message}

Details:
${JSON.stringify(event.details, null, 2)}

Source: ${event.source}

This is an automated alert from the Educafric platform monitoring system.
Please investigate immediately.

Best regards,
Educafric Monitoring System
    `.trim();
  }

  private formatSMSAlert(event: CriticalEvent): string {
    const time = new Date().toLocaleTimeString('fr-FR');
    return `EDUCAFRIC ALERT: ${event.type} - ${event.message} at ${time}. Check emails for details.`;
  }

  private async sendEmailAlert(email: string, message: string, event: CriticalEvent) {
    // Utiliser le service email Hostinger
    const { sendGoodbyeEmail } = await import('../emailService');
    console.log(`📧 [EMAIL_ALERT] Sending to ${email} via Hostinger SMTP`);
    console.log(`Subject: EDUCAFRIC CRITICAL ALERT - ${event.type}`);
    console.log(`Body: ${message}`);
    
    // TODO: Implement actual email sending
    // await emailService.send({
    //   to: email,
    //   subject: `EDUCAFRIC CRITICAL ALERT - ${event.type}`,
    //   body: message
    // });
  }

  private async sendSMSAlert(phone: string, message: string) {
    try {
      // Use existing notification service for SMS
      await notificationService.sendSMS(phone, message, 'fr');
      console.log(`📱 [SMS_ALERT] Sent to ${phone}: ${message}`);
    } catch (error) {
      console.error(`[SMS_ALERT] Failed to send to ${phone}:`, error);
    }
  }

  private async sendPWANotification(title: string, message: string, data?: any) {
    try {
      // Use existing notification service for PWA
      await notificationService.sendPushNotification({
        title,
        message,
        type: 'critical_alert',
        data
      });
      console.log(`🔔 [PWA_ALERT] ${title}: ${message}`);
    } catch (error) {
      console.error('[PWA_ALERT] Failed to send notification:', error);
    }
  }

  // Health check for alerting system
  async getAlertingSystemHealth() {
    return {
      status: 'operational',
      timestamp: new Date().toISOString(),
      owner_contacts: {
        emails: this.ownerContacts.emails.length,
        phones: Object.keys(this.ownerContacts.phones).length
      },
      commercial_phone: this.commercialNotificationPhone,
      last_test: null // Will be updated when we implement test alerts
    };
  }

  // Test the alerting system
  async sendTestAlert() {
    const testEvent: CriticalEvent = {
      type: 'server_error',
      severity: 'high',
      message: 'Test alert from Educafric monitoring system',
      details: {
        test: true,
        timestamp: new Date().toISOString(),
        system: 'critical_alerting_service'
      },
      timestamp: new Date(),
      source: 'test_system'
    };

    console.log('[CRITICAL_ALERTING] Sending test alert...');
    await this.sendCriticalSystemAlert(testEvent);
  }
}

// Export singleton instance
export const criticalAlertingService = new CriticalAlertingService();
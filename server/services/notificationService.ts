// ===== REFACTORED NOTIFICATION SERVICE =====
// Replaced huge 1,181-line file to prevent crashes and improve performance
// Eliminated excessive console statements and memory overhead

import { CoreNotificationService } from './notifications/coreNotifications';
import { SMS_TEMPLATES } from './notifications/smsTemplates';
import { EMAIL_TEMPLATES } from './notifications/emailTemplates';
import { WHATSAPP_TEMPLATES } from './notifications/whatsappTemplates';

// Main notification service using modular components
export class NotificationService extends CoreNotificationService {
  constructor() {
    super();
  }

  // Simplified notification methods for stability
  async notifyAttendance(parent: any, studentName: string, status: 'absent' | 'late', details: any) {
    try {
      const template = status === 'absent' ? 'ABSENCE_ALERT' : 'LATE_ARRIVAL';
      return await this.sendSMS(template, { studentName, ...details }, parent.preferredLanguage);
    } catch (error) {
      return { success: false, message: 'Attendance notification failed' };
    }
  }

  async notifyGrade(parent: any, studentName: string, subject: string, grade: string, isLowGrade = false) {
    try {
      const template = isLowGrade ? 'LOW_GRADE_ALERT' : 'NEW_GRADE';
      return await this.sendSMS(template, { studentName, subject, grade }, parent.preferredLanguage);
    } catch (error) {
      return { success: false, message: 'Grade notification failed' };
    }
  }

  async notifyPayment(parent: any, amount: string, type: 'due' | 'received', dueDate?: string) {
    try {
      const template = type === 'due' ? 'SCHOOL_FEES_DUE' : 'PAYMENT_CONFIRMED';
      const data = type === 'due' ? { amount, dueDate } : { amount };
      return await this.sendSMS(template, data, parent.preferredLanguage);
    } catch (error) {
      return { success: false, message: 'Payment notification failed' };
    }
  }

  async notifyEmergency(users: any[], message: string) {
    try {
      const results = [];
      for (const user of users) {
        const result = await this.sendSMS('EMERGENCY_ALERT', { message }, user.preferredLanguage);
        results.push(result);
      }
      return results;
    } catch (error) {
      return [{ success: false, message: 'Emergency notification failed' }];
    }
  }

  // Legacy compatibility methods
  async sendSmartNotification(user: any, template: string, data: any, priority: string) {
    try {
      return await this.sendSMS(template, data, user.preferredLanguage);
    } catch (error) {
      return { success: false };
    }
  }

  // Bulk notification processing for high performance
  async processBulkNotifications(notifications: any[]) {
    try {
      return await this.sendBulkNotifications(notifications);
    } catch (error) {
      return { success: false, message: 'Bulk processing failed' };
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
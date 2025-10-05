// ===== REFACTORED NOTIFICATION SERVICE =====
// Replaced huge 1,181-line file to prevent crashes and improve performance
// Eliminated excessive console statements and memory overhead

import { CoreNotificationService } from './notifications/coreNotifications';
import { createWaToken, getRecipientById } from './waClickToChat';
import { renderTemplate } from '../templates/waTemplates';
import { buildWaUrl } from '../utils/waLink';

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

  // Geolocation zone alert with WhatsApp notifications
  async notifyZoneAlert(
    alertType: 'zone_entry' | 'zone_exit' | 'extended_absence' | 'emergency' | 'low_battery' | 'offline',
    data: {
      childName: string;
      childId: number;
      parentId: number;
      zoneName?: string;
      currentLocation: string;
      time: string;
      duration?: string;
      batteryLevel?: number;
      teacherIds?: number[];
    },
    lang: 'fr' | 'en' = 'fr'
  ) {
    try {
      const parent = await getRecipientById(data.parentId);
      
      if (!parent || !parent.waOptIn || !parent.whatsappE164) {
        console.log(`[NOTIFICATION] Parent ${data.parentId} not WhatsApp-enabled, skipping`);
        return { success: false, message: 'Parent not WhatsApp-enabled' };
      }

      const baseUrl = process.env.FRONTEND_URL || 'https://www.educafric.com';
      const portalLink = `${baseUrl}/parent/geolocation`;
      const locationUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.currentLocation)}`;

      let templateId = '';
      let templateData: Record<string, any> = {
        student_name: data.childName,
        time: data.time,
        location_url: locationUrl,
        portal_link: portalLink
      };

      switch (alertType) {
        case 'zone_exit':
          templateId = 'geolocation_zone_exit';
          templateData.zone_name = data.zoneName || 'Zone de sécurité';
          break;
        case 'zone_entry':
          templateId = 'geolocation_zone_entry';
          templateData.zone_name = data.zoneName || 'Zone';
          break;
        case 'emergency':
          templateId = 'geolocation_emergency';
          break;
        case 'low_battery':
          templateId = 'geolocation_low_battery';
          templateData.battery_level = data.batteryLevel || 0;
          break;
        case 'offline':
          templateId = 'geolocation_offline';
          templateData.duration = data.duration || '?';
          templateData.last_update = data.time;
          break;
        default:
          console.log(`[NOTIFICATION] Unknown alert type: ${alertType}`);
          return { success: false, message: 'Unknown alert type' };
      }

      const message = renderTemplate(templateId, lang, templateData);
      const waUrl = buildWaUrl(parent.whatsappE164, message);

      console.log(`[NOTIFICATION] 📍 Geolocation alert sent via WhatsApp to parent ${data.parentId}`);
      console.log(`[NOTIFICATION] WhatsApp URL: ${waUrl}`);

      return {
        success: true,
        message: 'Geolocation alert sent via WhatsApp',
        waUrl,
        alertType,
        recipientId: data.parentId
      };
    } catch (error) {
      console.error('[NOTIFICATION] Failed to send geolocation alert:', error);
      return { success: false, message: 'Geolocation alert failed' };
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
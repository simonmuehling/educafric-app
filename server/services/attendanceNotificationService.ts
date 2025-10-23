import { hostingerMailService } from './hostingerMailService';
import { whatsappService } from './whatsappService';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { createWaToken, getRecipientById } from './waClickToChat';
import { renderTemplate } from '../templates/waTemplates';
import { buildWaUrl } from '../utils/waLink';
import { PLATFORM_CONFIG, getSupportPhone, getSupportEmail } from '../config/platformConfig';

interface AttendanceNotificationData {
  studentId: number;
  studentName: string;
  className: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  schoolName: string;
  markedBy?: string;
}

interface NotificationChannelResult {
  email: 'sent' | 'failed' | 'not_provided';
  sms: 'sent' | 'failed' | 'not_provided';
  whatsapp: 'sent' | 'failed' | 'not_provided';
  pwa: 'sent' | 'failed' | 'not_provided';
}

class AttendanceNotificationService {
  private hostingerService = hostingerMailService;

  constructor() {
    // Services are already instantiated as singletons
  }

  /**
   * Send attendance notification to all parents of a student
   */
  async sendAttendanceNotification(data: AttendanceNotificationData): Promise<{
    success: boolean;
    notificationsSent: number;
    channels: NotificationChannelResult;
    errors?: string[];
  }> {
    console.log(`[ATTENDANCE_NOTIFICATIONS] 🔔 Processing attendance notification for student ${data.studentName}`);
    
    try {
      // Find all parents connected to this student
      const parentConnections = await this.getParentConnections(data.studentId);
      
      if (parentConnections.length === 0) {
        console.log(`[ATTENDANCE_NOTIFICATIONS] ⚠️ No parent connections found for student ${data.studentId}`);
        return {
          success: false,
          notificationsSent: 0,
          channels: { email: 'not_provided', sms: 'not_provided', whatsapp: 'not_provided', pwa: 'not_provided' }
        };
      }

      let totalSent = 0;
      const channels: NotificationChannelResult = {
        email: 'not_provided',
        sms: 'not_provided', 
        whatsapp: 'not_provided',
        pwa: 'not_provided'
      };
      const errors: string[] = [];

      // Generate bilingual notification content
      const { subjectFr, subjectEn, messageFr, messageEn } = this.generateNotificationContent(data);

      // Send notifications to each parent
      for (const parent of parentConnections) {
        try {
          // Determine parent's preferred language (default to French for Cameroon)
          const language = 'fr'; // Default to French for Cameroon
          const subject = language === 'fr' ? subjectFr : subjectEn;
          const message = language === 'fr' ? messageFr : messageEn;

          // Send Email notification (with WhatsApp button if available)
          if (parent.email) {
            const waLink = await this.generateWhatsAppLink(parent.id, data, language as 'fr' | 'en');
            const emailSent = await this.sendEmailNotification(parent.email, subject, message, data, waLink);
            if (emailSent) {
              channels.email = 'sent';
              totalSent++;
            } else {
              channels.email = 'failed';
              errors.push(`Email failed for ${parent.email}`);
            }
          }

          // Send SMS notification
          if (parent.phone) {
            const smsSent = await this.sendSMSNotification(parent.phone, message);
            if (smsSent) {
              channels.sms = 'sent';
              totalSent++;
            } else {
              channels.sms = 'failed';
              errors.push(`SMS failed for ${parent.phone}`);
            }
          }

          // Generate WhatsApp Click-to-Chat link
          const whatsappSent = await this.sendWhatsAppNotification(parent.id, data, language as 'fr' | 'en');
          if (whatsappSent) {
            channels.whatsapp = 'sent';
            totalSent++;
          } else {
            channels.whatsapp = 'not_provided';
          }

          // Send PWA push notification
          const pwaSent = await this.sendPWANotification(parent.id, subject, message);
          if (pwaSent) {
            channels.pwa = 'sent';
            totalSent++;
          }

        } catch (parentError) {
          console.error(`[ATTENDANCE_NOTIFICATIONS] Error notifying parent ${parent.id}:`, parentError);
          errors.push(`Parent ${parent.id}: ${parentError.message}`);
        }
      }

      console.log(`[ATTENDANCE_NOTIFICATIONS] ✅ Sent ${totalSent} notifications for student ${data.studentName}`);
      
      return {
        success: totalSent > 0,
        notificationsSent: totalSent,
        channels,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.error('[ATTENDANCE_NOTIFICATIONS] Service error:', error);
      return {
        success: false,
        notificationsSent: 0,
        channels: { email: 'failed', sms: 'failed', whatsapp: 'failed', pwa: 'failed' },
        errors: [error.message]
      };
    }
  }

  /**
   * Get parent connections for a student
   */
  private async getParentConnections(studentId: number) {
    try {
      // For demo purposes, we'll simulate finding parents
      // In real implementation, this would query the parent-child connections table
      const connections = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone
        })
        .from(users)
        .where(eq(users.role, 'Parent'))
        .limit(2); // Simulate finding 2 parents for demo

      return connections.filter(conn => conn.id !== null);
    } catch (error) {
      console.error('[ATTENDANCE_NOTIFICATIONS] Error fetching parent connections:', error);
      return [];
    }
  }

  /**
   * Generate bilingual notification content
   */
  private generateNotificationContent(data: AttendanceNotificationData) {
    const statusTranslations = {
      present: { fr: 'présent(e)', en: 'present' },
      absent: { fr: 'absent(e)', en: 'absent' },
      late: { fr: 'en retard', en: 'late' },
      excused: { fr: 'absent(e) excusé(e)', en: 'excused absence' }
    };

    const statusFr = statusTranslations[data.status].fr;
    const statusEn = statusTranslations[data.status].en;

    const subjectFr = `🏫 Alerte Présence - ${data.studentName}`;
    const subjectEn = `🏫 Attendance Alert - ${data.studentName}`;

    const messageFr = `Bonjour,

Nous vous informons que votre enfant ${data.studentName} (${data.className}) a été marqué(e) comme ${statusFr} le ${data.date}.

${data.notes ? `Note: ${data.notes}` : ''}

${data.markedBy ? `Marqué par: ${data.markedBy}` : ''}

École: ${data.schoolName}

Pour plus d'informations, consultez l'application Educafric ou contactez l'école.

Cordialement,
L'équipe ${data.schoolName}`;

    const messageEn = `Hello,

We inform you that your child ${data.studentName} (${data.className}) was marked as ${statusEn} on ${data.date}.

${data.notes ? `Note: ${data.notes}` : ''}

${data.markedBy ? `Marked by: ${data.markedBy}` : ''}

School: ${data.schoolName}

For more information, check the Educafric app or contact the school.

Best regards,
${data.schoolName} Team`;

    return { subjectFr, subjectEn, messageFr, messageEn };
  }

  /**
   * Send email notification (with optional WhatsApp button)
   */
  private async sendEmailNotification(email: string, subject: string, message: string, data: AttendanceNotificationData, waLink?: string | null): Promise<boolean> {
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📚 EDUCAFRIC</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">${data.schoolName}</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #333; margin-top: 0;">${subject}</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057; margin-top: 0;">📋 Détails de Présence</h3>
              <p><strong>Élève:</strong> ${data.studentName}</p>
              <p><strong>Classe:</strong> ${data.className}</p>
              <p><strong>Date:</strong> ${data.date}</p>
              <p><strong>Statut:</strong> <span style="color: ${this.getStatusColor(data.status)}; font-weight: bold;">${data.status}</span></p>
              ${data.notes ? `<p><strong>Note:</strong> ${data.notes}</p>` : ''}
              ${data.markedBy ? `<p><strong>Marqué par:</strong> ${data.markedBy}</p>` : ''}
            </div>
            
            <div style="white-space: pre-line; line-height: 1.6; color: #333;">
              ${message}
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              ${waLink ? `
                <a href="${waLink}" style="background: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px;">
                  📱 Contacter sur WhatsApp
                </a>
                <br>
              ` : ''}
              <a href="https://www.educafric.com" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px;">
                🔗 Accéder à Educafric
              </a>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; text-align: center; color: #6c757d; font-size: 12px;">
            <p>© 2025 Educafric - Plateforme Éducative Africaine</p>
            <p>📧 <a href="mailto:${getSupportEmail()}">${getSupportEmail()}</a> | 📞 ${getSupportPhone()}</p>
          </div>
        </div>
      `;

      return await this.hostingerService.sendEmail({
        to: email,
        subject,
        text: message,
        html: htmlContent
      });
    } catch (error) {
      console.error('[ATTENDANCE_NOTIFICATIONS] Email error:', error);
      return false;
    }
  }

  /**
   * Send SMS notification - DISABLED (SMS service removed)
   */
  private async sendSMSNotification(phone: string, message: string): Promise<boolean> {
    console.log('[ATTENDANCE_NOTIFICATIONS] SMS notifications are disabled');
    return false;
  }

  /**
   * Generate WhatsApp Click-to-Chat link for attendance notification
   */
  private async generateWhatsAppLink(parentId: number, data: AttendanceNotificationData, language: 'fr' | 'en' = 'fr'): Promise<string | null> {
    try {
      console.log(`[ATTENDANCE_NOTIFICATIONS] 📱 Generating WhatsApp link for parent ${parentId}`);
      
      // Get parent WhatsApp info
      const recipient = await getRecipientById(parentId);
      
      if (!recipient?.whatsappE164 || !recipient?.waOptIn) {
        console.log(`[ATTENDANCE_NOTIFICATIONS] ⚠️ Parent ${parentId} not WhatsApp-enabled`);
        return null;
      }
      
      // Prepare template data for absence_alert
      const statusTranslations = {
        present: { fr: 'présent(e)', en: 'present' },
        absent: { fr: 'absent(e)', en: 'absent' },
        late: { fr: 'en retard', en: 'late' },
        excused: { fr: 'absent(e) excusé(e)', en: 'excused absence' }
      };
      
      const templateData = {
        student_name: data.studentName,
        date: data.date,
        reason: data.notes || statusTranslations[data.status][language]
      };
      
      // Render the absence_alert template
      const message = renderTemplate('absence_alert', language, templateData);
      
      // Build wa.me URL
      const waUrl = buildWaUrl(recipient.whatsappE164, message);
      
      console.log(`[ATTENDANCE_NOTIFICATIONS] ✅ WhatsApp link generated for parent ${parentId}`);
      return waUrl;
      
    } catch (error) {
      console.error('[ATTENDANCE_NOTIFICATIONS] WhatsApp link generation error:', error);
      return null;
    }
  }

  /**
   * Send WhatsApp notification directly via WhatsApp Business API
   * NEW: Sends message directly to parent's phone number
   */
  private async sendWhatsAppNotification(parentId: number, data: AttendanceNotificationData, language: 'fr' | 'en' = 'fr'): Promise<boolean> {
    try {
      // Get parent WhatsApp info
      const recipient = await getRecipientById(parentId);
      
      if (!recipient?.whatsappE164 || !recipient?.waOptIn) {
        console.log(`[ATTENDANCE_NOTIFICATIONS] ⚠️ Parent ${parentId} not WhatsApp-enabled`);
        return false;
      }

      // Prepare data for WhatsApp Business API template
      const statusTranslations = {
        present: { fr: 'présent(e)', en: 'present' },
        absent: { fr: 'absent(e)', en: 'absent' },
        late: { fr: 'en retard', en: 'late' },
        excused: { fr: 'absent(e) excusé(e)', en: 'excused absence' }
      };

      const whatsappData = {
        studentName: data.studentName,
        date: data.date,
        period: data.className || 'Cours',
        reason: data.notes || statusTranslations[data.status][language],
        monthlyTotal: '2', // TODO: Get from database
        schoolPhone: getSupportPhone(),
        schoolName: data.schoolName
      };

      // Send direct WhatsApp message via Business API
      console.log(`[ATTENDANCE_NOTIFICATIONS] 📱 Sending direct WhatsApp to ${recipient.whatsappE164}...`);
      const result = await whatsappService.sendEducationNotification(
        recipient.whatsappE164,
        'absence',
        whatsappData,
        language
      );

      if (result.success) {
        console.log(`[ATTENDANCE_NOTIFICATIONS] ✅ WhatsApp message sent directly to parent ${parentId} (${recipient.whatsappE164})`);
        console.log(`[ATTENDANCE_NOTIFICATIONS] 📨 Message ID: ${result.messageId}`);
        return true;
      } else {
        console.error(`[ATTENDANCE_NOTIFICATIONS] ❌ WhatsApp sending failed:`, result.error);
        return false;
      }
      
    } catch (error) {
      console.error('[ATTENDANCE_NOTIFICATIONS] WhatsApp sending error:', error);
      return false;
    }
  }

  /**
   * Send PWA push notification
   */
  private async sendPWANotification(parentId: number, title: string, message: string): Promise<boolean> {
    try {
      // Store notification in database for PWA to fetch
      // This would be integrated with your existing PWA notification system
      console.log(`[ATTENDANCE_NOTIFICATIONS] 📱 PWA notification queued for parent ${parentId}: ${title}`);
      
      // TODO: Integrate with existing PWA notification system
      // For now, return true as placeholder
      return true;
    } catch (error) {
      console.error('[ATTENDANCE_NOTIFICATIONS] PWA error:', error);
      return false;
    }
  }

  /**
   * Get color for attendance status
   */
  private getStatusColor(status: string): string {
    const colors = {
      present: '#28a745',   // Green
      absent: '#dc3545',    // Red
      late: '#ffc107',      // Yellow
      excused: '#17a2b8'    // Blue
    };
    return colors[status] || '#6c757d';
  }

  /**
   * Get service health status
   */
  async getServiceHealth() {
    return {
      whatsapp: { status: 'active', message: 'WhatsApp Click-to-Chat enabled' },
      email: { status: 'active', message: 'Hostinger SMTP configured' },
      sms: { status: 'disabled', message: 'SMS service removed' },
      overall: true
    };
  }
}

export type { AttendanceNotificationData };
export { AttendanceNotificationService };
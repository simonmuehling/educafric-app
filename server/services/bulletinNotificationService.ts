import { RefactoredNotificationService, NotificationRecipient, NotificationPayload } from './refactoredNotificationService';
import { hostingerMailService } from './hostingerMailService';
import { SMS_TEMPLATES } from './notifications/smsTemplates';
import { EMAIL_TEMPLATES } from './notifications/emailTemplates';

export interface BulletinNotificationData {
  studentId: number;
  studentName: string;
  className: string;
  period: string;
  academicYear: string;
  generalAverage: number;
  classRank: number;
  totalStudentsInClass: number;
  subjects: Array<{
    name: string;
    grade: number;
    coefficient: number;
    teacher: string;
  }>;
  teacherComments?: string;
  directorComments?: string;
  qrCode: string;
  downloadUrl: string;
  verificationUrl: string;
}

export interface BulletinRecipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  role: 'Parent' | 'Student';
  preferredLanguage: 'en' | 'fr';
  relationToStudent?: string; // 'mother', 'father', 'guardian', etc.
}

export class BulletinNotificationService {
  private notificationService: RefactoredNotificationService;

  constructor() {
    this.notificationService = RefactoredNotificationService.getInstance();
  }

  /**
   * Send bulletin notifications to students and parents
   * Supports SMS, Email, WhatsApp, and Push notifications
   */
  async sendBulletinNotifications(
    bulletinData: BulletinNotificationData,
    recipients: BulletinRecipient[],
    notificationTypes: string[] = ['sms', 'email', 'whatsapp'],
    language: 'en' | 'fr' = 'fr'
  ): Promise<{
    success: boolean;
    results: Record<string, any>;
    summary: {
      totalRecipients: number;
      successfulSMS: number;
      successfulEmails: number;
      successfulWhatsApp: number;
      failed: number;
    };
  }> {
    try {
      console.log('[BULLETIN_NOTIFICATIONS] 📋 Starting bulletin notifications...');
      console.log('[BULLETIN_NOTIFICATIONS] Student:', bulletinData.studentName);
      console.log('[BULLETIN_NOTIFICATIONS] Recipients:', recipients.length);
      console.log('[BULLETIN_NOTIFICATIONS] Channels:', notificationTypes);

      const results: Record<string, any> = {};
      const summary = {
        totalRecipients: recipients.length,
        successfulSMS: 0,
        successfulEmails: 0,
        successfulWhatsApp: 0,
        failed: 0
      };

      // Determine notification template based on average
      let smsTemplate = 'BULLETIN_AVAILABLE';
      if (bulletinData.generalAverage >= 16) {
        smsTemplate = 'BULLETIN_EXCELLENT';
      } else if (bulletinData.generalAverage < 10) {
        smsTemplate = 'BULLETIN_NEEDS_IMPROVEMENT';
      }

      // Process each recipient
      for (const recipient of recipients) {
        const recipientResults: any[] = [];
        const recipientLanguage = recipient.preferredLanguage || language;

        // Send SMS notification
        if (notificationTypes.includes('sms') && recipient.phone) {
          try {
            const smsResult = await this.sendBulletinSMS(
              bulletinData,
              recipient,
              smsTemplate,
              recipientLanguage
            );
            recipientResults.push(smsResult);
            if (smsResult.success) summary.successfulSMS++;
          } catch (error) {
            console.error('[BULLETIN_NOTIFICATIONS] SMS failed for:', recipient.name, error);
            summary.failed++;
          }
        }

        // Send Email notification
        if (notificationTypes.includes('email') && recipient.email) {
          try {
            const emailResult = await this.sendBulletinEmail(
              bulletinData,
              recipient,
              recipientLanguage
            );
            recipientResults.push(emailResult);
            if (emailResult.success) summary.successfulEmails++;
          } catch (error) {
            console.error('[BULLETIN_NOTIFICATIONS] Email failed for:', recipient.name, error);
            summary.failed++;
          }
        }

        // Send WhatsApp notification
        if (notificationTypes.includes('whatsapp') && recipient.whatsapp) {
          try {
            const whatsappResult = await this.sendBulletinWhatsApp(
              bulletinData,
              recipient,
              recipientLanguage
            );
            recipientResults.push(whatsappResult);
            if (whatsappResult.success) summary.successfulWhatsApp++;
          } catch (error) {
            console.error('[BULLETIN_NOTIFICATIONS] WhatsApp failed for:', recipient.name, error);
            summary.failed++;
          }
        }

        results[recipient.id] = recipientResults;
      }

      console.log('[BULLETIN_NOTIFICATIONS] ✅ Completed bulletin notifications');
      console.log('[BULLETIN_NOTIFICATIONS] Summary:', summary);

      return {
        success: true,
        results,
        summary
      };

    } catch (error) {
      console.error('[BULLETIN_NOTIFICATIONS] ❌ Error in bulletin notifications:', error);
      return {
        success: false,
        results: {},
        summary: {
          totalRecipients: recipients.length,
          successfulSMS: 0,
          successfulEmails: 0,
          successfulWhatsApp: 0,
          failed: recipients.length
        }
      };
    }
  }

  /**
   * Send SMS bulletin notification
   */
  private async sendBulletinSMS(
    bulletinData: BulletinNotificationData,
    recipient: BulletinRecipient,
    template: string,
    language: 'en' | 'fr'
  ): Promise<any> {
    try {
      const smsTemplate = (SMS_TEMPLATES as any)[template][language];
      let message = '';

      switch (template) {
        case 'BULLETIN_EXCELLENT':
          message = smsTemplate(
            bulletinData.studentName,
            bulletinData.period,
            bulletinData.generalAverage.toString(),
            bulletinData.classRank.toString()
          );
          break;
        case 'BULLETIN_NEEDS_IMPROVEMENT':
          message = smsTemplate(
            bulletinData.studentName,
            bulletinData.period,
            bulletinData.generalAverage.toString()
          );
          break;
        default: // BULLETIN_AVAILABLE
          message = smsTemplate(
            bulletinData.studentName,
            bulletinData.period,
            bulletinData.generalAverage.toString()
          );
      }

      // Mock SMS sending - replace with actual SMS service
      console.log(`[BULLETIN_SMS] 📱 Sending to ${recipient.phone}: ${message}`);
      
      return {
        success: true,
        type: 'sms',
        recipientId: recipient.id,
        recipientName: recipient.name,
        message,
        sentAt: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        type: 'sms',
        recipientId: recipient.id,
        error: error instanceof Error ? error.message : 'SMS sending failed'
      };
    }
  }

  /**
   * Send Email bulletin notification
   */
  private async sendBulletinEmail(
    bulletinData: BulletinNotificationData,
    recipient: BulletinRecipient,
    language: 'en' | 'fr'
  ): Promise<any> {
    try {
      const emailTemplate = EMAIL_TEMPLATES.BULLETIN_AVAILABLE[language];
      const subject = emailTemplate.subject(bulletinData.studentName, bulletinData.period);
      const body = emailTemplate.body(
        bulletinData.studentName,
        bulletinData.period,
        bulletinData.generalAverage,
        bulletinData.classRank,
        bulletinData.totalStudentsInClass,
        bulletinData.subjects,
        bulletinData.qrCode
      );

      const emailResult = await hostingerMailService.sendEmail({
        to: recipient.email!,
        subject,
        html: body
      });

      console.log(`[BULLETIN_EMAIL] 📧 Email sent to ${recipient.email}: ${subject}`);

      return {
        success: emailResult,
        type: 'email',
        recipientId: recipient.id,
        recipientName: recipient.name,
        subject,
        sentAt: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        type: 'email',
        recipientId: recipient.id,
        error: error instanceof Error ? error.message : 'Email sending failed'
      };
    }
  }

  /**
   * Send WhatsApp bulletin notification
   */
  private async sendBulletinWhatsApp(
    bulletinData: BulletinNotificationData,
    recipient: BulletinRecipient,
    language: 'en' | 'fr'
  ): Promise<any> {
    try {
      // Create WhatsApp message with bulletin summary
      const emoji = bulletinData.generalAverage >= 16 ? '🏆' : bulletinData.generalAverage >= 12 ? '📋' : '📚';
      const message = language === 'en' 
        ? `${emoji} *${bulletinData.studentName}* - ${bulletinData.period} Report Card Ready!\n\n` +
          `📊 *Average:* ${bulletinData.generalAverage}/20\n` +
          `🎯 *Class Rank:* ${bulletinData.classRank}/${bulletinData.totalStudentsInClass}\n` +
          `📱 *Download:* Open EDUCAFRIC app\n` +
          `🔍 *Verify with QR:* ${bulletinData.qrCode}\n\n` +
          `_This bulletin is digitally signed and secured with QR code verification._`
        : `${emoji} *${bulletinData.studentName}* - Bulletin ${bulletinData.period} Disponible!\n\n` +
          `📊 *Moyenne:* ${bulletinData.generalAverage}/20\n` +
          `🎯 *Rang:* ${bulletinData.classRank}/${bulletinData.totalStudentsInClass}\n` +
          `📱 *Télécharger:* Ouvrez l'app EDUCAFRIC\n` +
          `🔍 *Vérification QR:* ${bulletinData.qrCode}\n\n` +
          `_Ce bulletin est signé numériquement et sécurisé avec code QR._`;

      // Mock WhatsApp sending - replace with actual WhatsApp service
      console.log(`[BULLETIN_WHATSAPP] 💬 Sending to ${recipient.whatsapp}:`, message);

      return {
        success: true,
        type: 'whatsapp',
        recipientId: recipient.id,
        recipientName: recipient.name,
        message,
        sentAt: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        type: 'whatsapp',
        recipientId: recipient.id,
        error: error instanceof Error ? error.message : 'WhatsApp sending failed'
      };
    }
  }

  /**
   * Send notifications for multiple students (bulk)
   */
  async sendBulkBulletinNotifications(
    bulletins: BulletinNotificationData[],
    notificationTypes: string[] = ['sms', 'email', 'whatsapp'],
    language: 'en' | 'fr' = 'fr'
  ): Promise<any> {
    console.log('[BULLETIN_NOTIFICATIONS] 📋 Starting bulk bulletin notifications...');
    console.log('[BULLETIN_NOTIFICATIONS] Processing', bulletins.length, 'bulletins');

    const results = [];
    let totalSuccess = 0;
    let totalFailed = 0;

    for (const bulletin of bulletins) {
      try {
        // Mock recipients - in real implementation, get from database
        const recipients: BulletinRecipient[] = [
          {
            id: `student_${bulletin.studentId}`,
            name: bulletin.studentName,
            email: `student${bulletin.studentId}@test.educafric.com`,
            phone: `+237650000${String(bulletin.studentId).padStart(3, '0')}`,
            whatsapp: `+237650000${String(bulletin.studentId).padStart(3, '0')}`,
            role: 'Student',
            preferredLanguage: language
          },
          {
            id: `parent_${bulletin.studentId}`,
            name: `Parent of ${bulletin.studentName}`,
            email: `parent${bulletin.studentId}@test.educafric.com`,
            phone: `+237651000${String(bulletin.studentId).padStart(3, '0')}`,
            whatsapp: `+237651000${String(bulletin.studentId).padStart(3, '0')}`,
            role: 'Parent',
            preferredLanguage: language,
            relationToStudent: 'parent'
          }
        ];

        const result = await this.sendBulletinNotifications(
          bulletin,
          recipients,
          notificationTypes,
          language
        );

        results.push({
          studentId: bulletin.studentId,
          studentName: bulletin.studentName,
          success: result.success,
          summary: result.summary
        });

        if (result.success) totalSuccess++;
        else totalFailed++;

      } catch (error) {
        console.error('[BULLETIN_NOTIFICATIONS] ❌ Error processing bulletin for student:', bulletin.studentId, error);
        totalFailed++;
      }
    }

    console.log('[BULLETIN_NOTIFICATIONS] ✅ Bulk notifications complete');
    console.log('[BULLETIN_NOTIFICATIONS] Success:', totalSuccess, 'Failed:', totalFailed);

    return {
      success: true,
      processed: bulletins.length,
      successful: totalSuccess,
      failed: totalFailed,
      results
    };
  }
}

export const bulletinNotificationService = new BulletinNotificationService();
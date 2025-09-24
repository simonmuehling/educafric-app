import { RefactoredNotificationService } from './refactoredNotificationService';
import { BulletinTemplateGenerator } from './notificationTemplates';
import { db } from '../db';
import { bulletinComprehensive } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export interface BulletinNotificationData {
  studentId: number;
  studentName: string;
  className: string;
  period: string;
  academicYear: string;
  generalAverage: number;
  classRank: number;
  totalStudentsInClass: number;
  qrCode: string;
  downloadUrl: string;
  verificationUrl: string;
}

export interface BulletinRecipient {
  id: string;
  name: string;
  email?: string;
  role: 'Parent' | 'Student';
  preferredLanguage: 'en' | 'fr';
  relationToStudent?: string;
}

export interface NotificationResult {
  success: boolean;
  recipientId: string;
  recipientName: string;
  channels: {
    email: { success: boolean; error?: string };
    pwa: { success: boolean; error?: string };
  };
  timestamp: string;
}

/**
 * Service spécialisé pour les notifications de bulletins aux élèves et parents
 * UNIQUEMENT Email et PWA/in-app (PAS DE SMS selon les exigences)
 */
export class StudentParentBulletinNotifications {
  private notificationService: RefactoredNotificationService;
  private templateGenerator: BulletinTemplateGenerator;

  constructor() {
    this.notificationService = RefactoredNotificationService.getInstance();
    this.templateGenerator = new BulletinTemplateGenerator();
  }

  /**
   * Envoie une notification email de bulletin
   */
  private async sendBulletinEmail(
    bulletinData: BulletinNotificationData,
    recipient: BulletinRecipient,
    language: 'en' | 'fr'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!recipient.email) {
        throw new Error('No email address provided');
      }

      const templateType = bulletinData.generalAverage >= 16 ? 'BULLETIN_EXCELLENT' : 
                          bulletinData.generalAverage < 10 ? 'BULLETIN_NEEDS_IMPROVEMENT' : 
                          'BULLETIN_AVAILABLE';

      const variables = {
        recipientName: recipient.name,
        studentName: bulletinData.studentName,
        className: bulletinData.className,
        period: bulletinData.period,
        academicYear: bulletinData.academicYear,
        generalAverage: bulletinData.generalAverage.toString(),
        classRank: bulletinData.classRank.toString(),
        totalStudents: bulletinData.totalStudentsInClass.toString(),
        downloadUrl: bulletinData.downloadUrl,
        verificationUrl: bulletinData.verificationUrl,
        qrCode: bulletinData.qrCode,
        schoolName: 'École Educafric',
        schoolContact: '+237657004011'
      };

      const emailTemplate = this.templateGenerator.generateEmailTemplate(
        templateType,
        variables,
        language
      );

      const result = await this.notificationService.sendEmail({
        to: recipient.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text || ''
      });

      console.log(`[BULLETIN_EMAIL] ✅ Email sent to ${recipient.name} (${recipient.email})`);
      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown email error';
      console.error(`[BULLETIN_EMAIL] ❌ Failed to send email to ${recipient.name}:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Envoie une notification PWA/in-app de bulletin
   */
  private async sendBulletinPWANotification(
    bulletinData: BulletinNotificationData,
    recipient: BulletinRecipient,
    language: 'en' | 'fr'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const title = language === 'fr' 
        ? `Nouveau bulletin disponible - ${bulletinData.studentName}`
        : `New report card available - ${bulletinData.studentName}`;

      const body = language === 'fr'
        ? `Moyenne: ${bulletinData.generalAverage}/20 - ${bulletinData.period} ${bulletinData.academicYear}`
        : `Average: ${bulletinData.generalAverage}/20 - ${bulletinData.period} ${bulletinData.academicYear}`;

      const notificationPayload = {
        title,
        body,
        icon: '/icons/bulletin-icon.png',
        badge: '/icons/badge.png',
        data: {
          type: 'bulletin',
          studentId: bulletinData.studentId,
          studentName: bulletinData.studentName,
          period: bulletinData.period,
          academicYear: bulletinData.academicYear,
          downloadUrl: bulletinData.downloadUrl,
          verificationUrl: bulletinData.verificationUrl,
          recipientRole: recipient.role,
          timestamp: new Date().toISOString()
        },
        actions: [
          {
            action: 'view',
            title: language === 'fr' ? 'Voir le bulletin' : 'View report card'
          },
          {
            action: 'download',
            title: language === 'fr' ? 'Télécharger' : 'Download'
          }
        ],
        requireInteraction: true,
        tag: `bulletin-${bulletinData.studentId}-${bulletinData.period}`,
        renotify: true
      };

      // Envoi de la notification PWA via le service de notifications
      const result = await this.notificationService.sendPWANotification({
        userId: recipient.id,
        title: notificationPayload.title,
        body: notificationPayload.body,
        data: notificationPayload.data,
        icon: notificationPayload.icon,
        badge: notificationPayload.badge,
        actions: notificationPayload.actions,
        requireInteraction: notificationPayload.requireInteraction,
        tag: notificationPayload.tag
      });

      console.log(`[BULLETIN_PWA] ✅ PWA notification sent to ${recipient.name} (${recipient.role})`);
      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown PWA error';
      console.error(`[BULLETIN_PWA] ❌ Failed to send PWA notification to ${recipient.name}:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Envoie les notifications de bulletin (Email + PWA uniquement)
   * Respecte les exigences : PWA/in-app et email seulement
   */
  async sendBulletinNotifications(
    bulletinData: BulletinNotificationData,
    recipients: BulletinRecipient[],
    language: 'en' | 'fr' = 'fr'
  ): Promise<{
    success: boolean;
    results: NotificationResult[];
    summary: {
      totalRecipients: number;
      successfulEmails: number;
      successfulPWA: number;
      failed: number;
    };
  }> {
    try {
      console.log('[STUDENT_PARENT_NOTIFICATIONS] 📋 Starting bulletin notifications...');
      console.log('[STUDENT_PARENT_NOTIFICATIONS] Student:', bulletinData.studentName);
      console.log('[STUDENT_PARENT_NOTIFICATIONS] Recipients:', recipients.length);
      console.log('[STUDENT_PARENT_NOTIFICATIONS] Channels: Email + PWA only (no SMS)');

      const results: NotificationResult[] = [];
      const summary = {
        totalRecipients: recipients.length,
        successfulEmails: 0,
        successfulPWA: 0,
        failed: 0
      };

      // Traiter chaque destinataire
      for (const recipient of recipients) {
        const recipientLanguage = recipient.preferredLanguage || language;
        const timestamp = new Date().toISOString();

        // Initialiser le résultat pour ce destinataire
        const notificationResult: NotificationResult = {
          success: false,
          recipientId: recipient.id,
          recipientName: recipient.name,
          channels: {
            email: { success: false },
            pwa: { success: false }
          },
          timestamp
        };

        // Envoi notification Email
        if (recipient.email) {
          const emailResult = await this.sendBulletinEmail(
            bulletinData,
            recipient,
            recipientLanguage
          );
          
          notificationResult.channels.email = emailResult;
          if (emailResult.success) {
            summary.successfulEmails++;
          }
        }

        // Envoi notification PWA
        const pwaResult = await this.sendBulletinPWANotification(
          bulletinData,
          recipient,
          recipientLanguage
        );
        
        notificationResult.channels.pwa = pwaResult;
        if (pwaResult.success) {
          summary.successfulPWA++;
        }

        // Déterminer le succès global pour ce destinataire
        notificationResult.success = notificationResult.channels.email.success || 
                                   notificationResult.channels.pwa.success;

        if (!notificationResult.success) {
          summary.failed++;
        }

        results.push(notificationResult);
      }

      console.log('[STUDENT_PARENT_NOTIFICATIONS] ✅ Notifications completed');
      console.log('[STUDENT_PARENT_NOTIFICATIONS] Summary:', summary);

      return {
        success: true,
        results,
        summary
      };

    } catch (error) {
      console.error('[STUDENT_PARENT_NOTIFICATIONS] ❌ Error sending notifications:', error);
      
      return {
        success: false,
        results: [],
        summary: {
          totalRecipients: recipients.length,
          successfulEmails: 0,
          successfulPWA: 0,
          failed: recipients.length
        }
      };
    }
  }

  /**
   * Persiste les notifications dans la base de données pour suivi
   */
  async persistBulletinNotificationLog(
    bulletinId: number,
    results: NotificationResult[]
  ): Promise<void> {
    try {
      const notificationLog = {
        timestamp: new Date().toISOString(),
        totalRecipients: results.length,
        emailSuccessCount: results.filter(r => r.channels.email.success).length,
        pwaSuccessCount: results.filter(r => r.channels.pwa.success).length,
        failedCount: results.filter(r => !r.success).length,
        recipients: results.map(r => ({
          id: r.recipientId,
          name: r.recipientName,
          email: r.channels.email.success,
          pwa: r.channels.pwa.success,
          success: r.success
        }))
      };

      await db.update(bulletinComprehensive)
        .set({ 
          notificationsSent: notificationLog,
          updatedAt: new Date()
        })
        .where(eq(bulletinComprehensive.id, bulletinId));

      console.log('[STUDENT_PARENT_NOTIFICATIONS] 💾 Notification log persisted for bulletin:', bulletinId);

    } catch (error) {
      console.error('[STUDENT_PARENT_NOTIFICATIONS] ❌ Error persisting notification log:', error);
    }
  }
}

export default StudentParentBulletinNotifications;
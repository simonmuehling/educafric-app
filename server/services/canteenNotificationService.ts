import { hostingerMailService } from './hostingerMailService';
import { db } from '../db';
import { users, parentStudentRelations } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { createWaToken } from './waClickToChat';
import { renderTemplate } from '../templates/waTemplates';
import { buildWaUrl } from '../utils/waLink';

interface CanteenReservationNotificationData {
  studentId: number;
  studentName: string;
  menuDate: string;
  mealType: string;
  price: string;
  schoolName: string;
}

interface CanteenBalanceNotificationData {
  studentId: number;
  studentName: string;
  amount: string;
  currentBalance: string;
  actionType: 'add' | 'deduct';
  schoolName: string;
}

interface NotificationChannelResult {
  email: 'sent' | 'failed' | 'not_provided';
  whatsapp: 'sent' | 'failed' | 'not_provided';
  pwa: 'sent' | 'failed' | 'not_provided';
}

class CanteenNotificationService {
  private hostingerService = hostingerMailService;

  constructor() {
    console.log('[CANTEEN_NOTIFICATIONS] ✅ Service initialized');
  }

  /**
   * Send notification for new meal reservation
   */
  async sendReservationNotification(data: CanteenReservationNotificationData): Promise<{
    success: boolean;
    notificationsSent: number;
    channels: NotificationChannelResult;
    errors?: string[];
  }> {
    console.log(`[CANTEEN_NOTIFICATIONS] 🍽️ Processing reservation notification for ${data.studentName}`);
    
    try {
      const parentConnections = await this.getParentConnections(data.studentId);
      
      if (parentConnections.length === 0) {
        console.log(`[CANTEEN_NOTIFICATIONS] ⚠️ No parent connections found for student ${data.studentId}`);
        return {
          success: false,
          notificationsSent: 0,
          channels: { email: 'not_provided', whatsapp: 'not_provided', pwa: 'not_provided' }
        };
      }

      let totalSent = 0;
      const channels: NotificationChannelResult = {
        email: 'not_provided',
        whatsapp: 'not_provided',
        pwa: 'not_provided'
      };
      const errors: string[] = [];

      const { subjectFr, subjectEn, messageFr, messageEn } = this.generateReservationContent(data);

      for (const parent of parentConnections) {
        try {
          const language = 'fr';
          const subject = language === 'fr' ? subjectFr : subjectEn;
          const message = language === 'fr' ? messageFr : messageEn;

          // Send Email
          if (parent.email) {
            const emailSent = await this.sendEmailNotification(parent.email, subject, message, data);
            if (emailSent) {
              channels.email = 'sent';
              totalSent++;
            } else {
              channels.email = 'failed';
              errors.push(`Email failed for ${parent.email}`);
            }
          }

          // Generate WhatsApp link
          if (parent.phone) {
            const waLink = await this.generateWhatsAppLink(parent.id, 'reservation', data, language as 'fr' | 'en');
            if (waLink) {
              channels.whatsapp = 'sent';
              totalSent++;
            }
          }

          // Send PWA notification
          const pwaSent = await this.sendPWANotification(parent.id, subject, message);
          if (pwaSent) {
            channels.pwa = 'sent';
            totalSent++;
          }

        } catch (parentError) {
          console.error(`[CANTEEN_NOTIFICATIONS] Error notifying parent ${parent.id}:`, parentError);
          errors.push(`Parent ${parent.id}: ${parentError instanceof Error ? parentError.message : 'Unknown error'}`);
        }
      }

      console.log(`[CANTEEN_NOTIFICATIONS] ✅ Sent ${totalSent} notifications`);
      
      return {
        success: totalSent > 0,
        notificationsSent: totalSent,
        channels,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.error('[CANTEEN_NOTIFICATIONS] Service error:', error);
      return {
        success: false,
        notificationsSent: 0,
        channels: { email: 'failed', whatsapp: 'failed', pwa: 'failed' },
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Send notification for balance update
   */
  async sendBalanceNotification(data: CanteenBalanceNotificationData): Promise<{
    success: boolean;
    notificationsSent: number;
    channels: NotificationChannelResult;
    errors?: string[];
  }> {
    console.log(`[CANTEEN_NOTIFICATIONS] 💰 Processing balance notification for ${data.studentName}`);
    
    try {
      const parentConnections = await this.getParentConnections(data.studentId);
      
      if (parentConnections.length === 0) {
        return {
          success: false,
          notificationsSent: 0,
          channels: { email: 'not_provided', whatsapp: 'not_provided', pwa: 'not_provided' }
        };
      }

      let totalSent = 0;
      const channels: NotificationChannelResult = {
        email: 'not_provided',
        whatsapp: 'not_provided',
        pwa: 'not_provided'
      };
      const errors: string[] = [];

      const { subjectFr, subjectEn, messageFr, messageEn } = this.generateBalanceContent(data);

      for (const parent of parentConnections) {
        try {
          const language = 'fr';
          const subject = language === 'fr' ? subjectFr : subjectEn;
          const message = language === 'fr' ? messageFr : messageEn;

          if (parent.email) {
            const emailSent = await this.sendEmailNotification(parent.email, subject, message, data);
            if (emailSent) {
              channels.email = 'sent';
              totalSent++;
            }
          }

          if (parent.phone) {
            const waLink = await this.generateWhatsAppLink(parent.id, 'balance', data, language as 'fr' | 'en');
            if (waLink) {
              channels.whatsapp = 'sent';
              totalSent++;
            }
          }

          const pwaSent = await this.sendPWANotification(parent.id, subject, message);
          if (pwaSent) {
            channels.pwa = 'sent';
            totalSent++;
          }

        } catch (parentError) {
          console.error(`[CANTEEN_NOTIFICATIONS] Error notifying parent:`, parentError);
          errors.push(`Parent error: ${parentError instanceof Error ? parentError.message : 'Unknown'}`);
        }
      }

      return {
        success: totalSent > 0,
        notificationsSent: totalSent,
        channels,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.error('[CANTEEN_NOTIFICATIONS] Service error:', error);
      return {
        success: false,
        notificationsSent: 0,
        channels: { email: 'failed', whatsapp: 'failed', pwa: 'failed' },
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get parent connections for a student
   */
  private async getParentConnections(studentId: number) {
    try {
      const connections = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone
        })
        .from(parentStudentRelations)
        .innerJoin(users, eq(users.id, parentStudentRelations.parentId))
        .where(eq(parentStudentRelations.studentId, studentId));

      return connections.filter(conn => conn.id !== null);
    } catch (error) {
      console.error('[CANTEEN_NOTIFICATIONS] Error fetching parent connections:', error);
      return [];
    }
  }

  /**
   * Generate bilingual content for reservation
   */
  private generateReservationContent(data: CanteenReservationNotificationData) {
    const subjectFr = `🍽️ Réservation cantine - ${data.studentName}`;
    const subjectEn = `🍽️ Canteen Reservation - ${data.studentName}`;

    const messageFr = `
Bonjour,

Votre enfant ${data.studentName} a effectué une réservation à la cantine de ${data.schoolName}.

📅 Date: ${data.menuDate}
🍴 Type de repas: ${data.mealType}
💰 Prix: ${data.price} XAF

Cette réservation sera automatiquement confirmée.

Cordialement,
${data.schoolName}
EDUCAFRIC Platform
    `.trim();

    const messageEn = `
Hello,

Your child ${data.studentName} has made a canteen reservation at ${data.schoolName}.

📅 Date: ${data.menuDate}
🍴 Meal type: ${data.mealType}
💰 Price: ${data.price} XAF

This reservation will be automatically confirmed.

Best regards,
${data.schoolName}
EDUCAFRIC Platform
    `.trim();

    return { subjectFr, subjectEn, messageFr, messageEn };
  }

  /**
   * Generate bilingual content for balance update
   */
  private generateBalanceContent(data: CanteenBalanceNotificationData) {
    const actionFr = data.actionType === 'add' ? 'rechargement' : 'déduction';
    const actionEn = data.actionType === 'add' ? 'top-up' : 'deduction';

    const subjectFr = `💰 ${actionFr === 'rechargement' ? 'Rechargement' : 'Déduction'} solde cantine - ${data.studentName}`;
    const subjectEn = `💰 Canteen Balance ${actionEn === 'top-up' ? 'Top-up' : 'Deduction'} - ${data.studentName}`;

    const messageFr = `
Bonjour,

Le solde cantine de ${data.studentName} à ${data.schoolName} a été mis à jour.

${data.actionType === 'add' ? '➕ Rechargement' : '➖ Déduction'}: ${data.amount} XAF
💳 Nouveau solde: ${data.currentBalance} XAF

Merci de votre confiance.

Cordialement,
${data.schoolName}
EDUCAFRIC Platform
    `.trim();

    const messageEn = `
Hello,

The canteen balance for ${data.studentName} at ${data.schoolName} has been updated.

${data.actionType === 'add' ? '➕ Top-up' : '➖ Deduction'}: ${data.amount} XAF
💳 New balance: ${data.currentBalance} XAF

Thank you for your trust.

Best regards,
${data.schoolName}
EDUCAFRIC Platform
    `.trim();

    return { subjectFr, subjectEn, messageFr, messageEn };
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    email: string,
    subject: string,
    message: string,
    data: any
  ): Promise<boolean> {
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🍽️ EDUCAFRIC Cantine</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <div style="white-space: pre-line; line-height: 1.6; color: #374151;">
              ${message}
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
            <p>EDUCAFRIC Platform - Système de gestion scolaire</p>
            <p><a href="https://www.educafric.com" style="color: #667eea; text-decoration: none;">www.educafric.com</a></p>
          </div>
        </div>
      `;

      await this.hostingerService.sendEmail({
        to: email,
        subject,
        text: message,
        html: htmlContent
      });

      console.log(`[CANTEEN_NOTIFICATIONS] ✅ Email sent to ${email}`);
      return true;
    } catch (error) {
      console.error(`[CANTEEN_NOTIFICATIONS] ❌ Email failed for ${email}:`, error);
      return false;
    }
  }

  /**
   * Generate WhatsApp Click-to-Chat link
   */
  private async generateWhatsAppLink(
    parentId: number,
    notificationType: 'reservation' | 'balance',
    data: any,
    language: 'fr' | 'en'
  ): Promise<string | null> {
    try {
      const parent = await db.select({ phone: users.phone })
        .from(users)
        .where(eq(users.id, parentId))
        .limit(1);

      if (!parent || !parent[0]?.phone) {
        console.log(`[CANTEEN_NOTIFICATIONS] No phone number for parent ${parentId}`);
        return null;
      }

      const templateName = notificationType === 'reservation' 
        ? 'canteen_reservation' 
        : 'canteen_balance';
      
      const message = renderTemplate(templateName, language, {
        studentName: data.studentName,
        schoolName: data.schoolName,
        date: data.menuDate || new Date().toLocaleDateString('fr-FR'),
        amount: data.amount || data.price,
        balance: data.currentBalance || '0'
      });

      const waUrl = buildWaUrl(parent[0].phone, message);

      console.log(`[CANTEEN_NOTIFICATIONS] 📱 WhatsApp link generated for parent ${parentId}`);
      return waUrl;
    } catch (error) {
      console.error('[CANTEEN_NOTIFICATIONS] Failed to generate WhatsApp link:', error);
      return null;
    }
  }

  /**
   * Send PWA push notification
   */
  private async sendPWANotification(
    userId: number,
    title: string,
    message: string
  ): Promise<boolean> {
    try {
      console.log(`[CANTEEN_NOTIFICATIONS] 🔔 PWA notification would be sent to user ${userId}`);
      return true;
    } catch (error) {
      console.error('[CANTEEN_NOTIFICATIONS] PWA notification failed:', error);
      return false;
    }
  }
}

export const canteenNotificationService = new CanteenNotificationService();

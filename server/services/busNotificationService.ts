import { hostingerMailService } from './hostingerMailService';
import { db } from '../db';
import { users, parentStudentRelations } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { createWaToken } from './waClickToChat';
import { renderTemplate } from '../templates/waTemplates';
import { buildWaUrl } from '../utils/waLink';

interface BusEnrollmentNotificationData {
  studentId: number;
  studentName: string;
  routeName: string;
  stationName?: string;
  pickupTime?: string;
  schoolName: string;
  actionType: 'enrollment' | 'unenrollment' | 'route_change';
}

interface NotificationChannelResult {
  email: 'sent' | 'failed' | 'not_provided';
  whatsapp: 'sent' | 'failed' | 'not_provided';
  pwa: 'sent' | 'failed' | 'not_provided';
}

class BusNotificationService {
  private hostingerService = hostingerMailService;

  constructor() {
    console.log('[BUS_NOTIFICATIONS] ✅ Service initialized');
  }

  /**
   * Send notification for bus enrollment/unenrollment/route change
   */
  async sendEnrollmentNotification(data: BusEnrollmentNotificationData): Promise<{
    success: boolean;
    notificationsSent: number;
    channels: NotificationChannelResult;
    errors?: string[];
  }> {
    console.log(`[BUS_NOTIFICATIONS] 🚌 Processing ${data.actionType} notification for ${data.studentName}`);
    
    try {
      const parentConnections = await this.getParentConnections(data.studentId);
      
      if (parentConnections.length === 0) {
        console.log(`[BUS_NOTIFICATIONS] ⚠️ No parent connections found for student ${data.studentId}`);
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

      const { subjectFr, subjectEn, messageFr, messageEn } = this.generateEnrollmentContent(data);

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
            const waLink = await this.generateWhatsAppLink(parent.id, data, language as 'fr' | 'en');
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
          console.error(`[BUS_NOTIFICATIONS] Error notifying parent ${parent.id}:`, parentError);
          errors.push(`Parent ${parent.id}: ${parentError instanceof Error ? parentError.message : 'Unknown error'}`);
        }
      }

      console.log(`[BUS_NOTIFICATIONS] ✅ Sent ${totalSent} notifications`);
      
      return {
        success: totalSent > 0,
        notificationsSent: totalSent,
        channels,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.error('[BUS_NOTIFICATIONS] Service error:', error);
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
      console.error('[BUS_NOTIFICATIONS] Error fetching parent connections:', error);
      return [];
    }
  }

  /**
   * Generate bilingual content for enrollment notification
   */
  private generateEnrollmentContent(data: BusEnrollmentNotificationData) {
    let subjectFr = '';
    let subjectEn = '';
    let messageFr = '';
    let messageEn = '';

    switch (data.actionType) {
      case 'enrollment':
        subjectFr = `🚌 Inscription au bus scolaire - ${data.studentName}`;
        subjectEn = `🚌 School Bus Enrollment - ${data.studentName}`;
        
        messageFr = `
Bonjour,

Votre enfant ${data.studentName} a été inscrit au service de bus scolaire de ${data.schoolName}.

🚌 Itinéraire: ${data.routeName}
${data.stationName ? `📍 Station: ${data.stationName}` : ''}
${data.pickupTime ? `⏰ Heure de ramassage: ${data.pickupTime}` : ''}

Vous pouvez suivre le bus en temps réel depuis l'application EDUCAFRIC.

Cordialement,
${data.schoolName}
EDUCAFRIC Platform
        `.trim();

        messageEn = `
Hello,

Your child ${data.studentName} has been enrolled in the school bus service at ${data.schoolName}.

🚌 Route: ${data.routeName}
${data.stationName ? `📍 Station: ${data.stationName}` : ''}
${data.pickupTime ? `⏰ Pickup time: ${data.pickupTime}` : ''}

You can track the bus in real-time from the EDUCAFRIC app.

Best regards,
${data.schoolName}
EDUCAFRIC Platform
        `.trim();
        break;

      case 'unenrollment':
        subjectFr = `🚌 Désinscription du bus scolaire - ${data.studentName}`;
        subjectEn = `🚌 School Bus Unenrollment - ${data.studentName}`;
        
        messageFr = `
Bonjour,

Votre enfant ${data.studentName} a été désinscrit du service de bus scolaire de ${data.schoolName}.

🚌 Itinéraire: ${data.routeName}

Le service de bus ne sera plus disponible à partir de maintenant.

Cordialement,
${data.schoolName}
EDUCAFRIC Platform
        `.trim();

        messageEn = `
Hello,

Your child ${data.studentName} has been unenrolled from the school bus service at ${data.schoolName}.

🚌 Route: ${data.routeName}

The bus service will no longer be available from now on.

Best regards,
${data.schoolName}
EDUCAFRIC Platform
        `.trim();
        break;

      case 'route_change':
        subjectFr = `🚌 Changement d'itinéraire de bus - ${data.studentName}`;
        subjectEn = `🚌 Bus Route Change - ${data.studentName}`;
        
        messageFr = `
Bonjour,

L'itinéraire de bus de votre enfant ${data.studentName} à ${data.schoolName} a été modifié.

🚌 Nouvel itinéraire: ${data.routeName}
${data.stationName ? `📍 Nouvelle station: ${data.stationName}` : ''}
${data.pickupTime ? `⏰ Nouvelle heure: ${data.pickupTime}` : ''}

Merci de prendre note de ces changements.

Cordialement,
${data.schoolName}
EDUCAFRIC Platform
        `.trim();

        messageEn = `
Hello,

The bus route for your child ${data.studentName} at ${data.schoolName} has been changed.

🚌 New route: ${data.routeName}
${data.stationName ? `📍 New station: ${data.stationName}` : ''}
${data.pickupTime ? `⏰ New time: ${data.pickupTime}` : ''}

Please take note of these changes.

Best regards,
${data.schoolName}
EDUCAFRIC Platform
        `.trim();
        break;
    }

    return { subjectFr, subjectEn, messageFr, messageEn };
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    email: string,
    subject: string,
    message: string,
    data: BusEnrollmentNotificationData
  ): Promise<boolean> {
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🚌 EDUCAFRIC Bus Scolaire</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <div style="white-space: pre-line; line-height: 1.6; color: #374151;">
              ${message}
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
            <p>EDUCAFRIC Platform - Système de gestion scolaire</p>
            <p><a href="https://www.educafric.com" style="color: #f59e0b; text-decoration: none;">www.educafric.com</a></p>
          </div>
        </div>
      `;

      await this.hostingerService.sendEmail({
        to: email,
        subject,
        text: message,
        html: htmlContent
      });

      console.log(`[BUS_NOTIFICATIONS] ✅ Email sent to ${email}`);
      return true;
    } catch (error) {
      console.error(`[BUS_NOTIFICATIONS] ❌ Email failed for ${email}:`, error);
      return false;
    }
  }

  /**
   * Generate WhatsApp Click-to-Chat link
   */
  private async generateWhatsAppLink(
    parentId: number,
    data: BusEnrollmentNotificationData,
    language: 'fr' | 'en'
  ): Promise<string | null> {
    try {
      const parent = await db.select({ phone: users.phone })
        .from(users)
        .where(eq(users.id, parentId))
        .limit(1);

      if (!parent || !parent[0]?.phone) {
        console.log(`[BUS_NOTIFICATIONS] No phone number for parent ${parentId}`);
        return null;
      }

      const message = renderTemplate('bus_enrollment', language, {
        studentName: data.studentName,
        schoolName: data.schoolName,
        routeName: data.routeName,
        stationName: data.stationName || 'N/A',
        pickupTime: data.pickupTime || 'N/A'
      });

      const waUrl = buildWaUrl(parent[0].phone, message);

      console.log(`[BUS_NOTIFICATIONS] 📱 WhatsApp link generated for parent ${parentId}`);
      return waUrl;
    } catch (error) {
      console.error('[BUS_NOTIFICATIONS] Failed to generate WhatsApp link:', error);
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
      console.log(`[BUS_NOTIFICATIONS] 🔔 PWA notification would be sent to user ${userId}`);
      return true;
    } catch (error) {
      console.error('[BUS_NOTIFICATIONS] PWA notification failed:', error);
      return false;
    }
  }
}

export const busNotificationService = new BusNotificationService();

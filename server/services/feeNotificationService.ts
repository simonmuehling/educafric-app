import { db } from '../db';
import { 
  assignedFees, 
  feeStructures, 
  feeNotificationQueue,
  users,
  notifications
} from '@shared/schema';
import { eq, and, lte, gte, sql, inArray, or } from 'drizzle-orm';
import { hostingerMailService } from './hostingerMailService';
import { whatsappDirectService } from './whatsappDirectNotificationService';

class FeeNotificationService {
  private isInitialized = false;
  private checkInterval: NodeJS.Timeout | null = null;

  initialize() {
    if (this.isInitialized) return;
    
    console.log('[FEE_NOTIFICATIONS] Initializing service...');
    
    this.checkInterval = setInterval(() => {
      this.processReminderQueue();
      this.checkOverdueFees();
    }, 60 * 60 * 1000);
    
    setTimeout(() => {
      this.processReminderQueue();
      this.checkOverdueFees();
    }, 30000);
    
    this.isInitialized = true;
    console.log('[FEE_NOTIFICATIONS] ✅ Service initialized - checking every hour');
  }

  async processReminderQueue() {
    try {
      console.log('[FEE_NOTIFICATIONS] Processing notification queue...');
      
      const pendingNotifications = await db
        .select()
        .from(feeNotificationQueue)
        .where(and(
          eq(feeNotificationQueue.status, 'pending'),
          or(
            lte(feeNotificationQueue.scheduledFor, new Date()),
            sql`scheduled_for IS NULL`
          )
        ))
        .limit(50);
      
      for (const notification of pendingNotifications) {
        await this.sendNotification(notification);
      }
      
      console.log(`[FEE_NOTIFICATIONS] Processed ${pendingNotifications.length} notifications`);
    } catch (error) {
      console.error('[FEE_NOTIFICATIONS] Error processing queue:', error);
    }
  }

  async checkOverdueFees() {
    try {
      console.log('[FEE_NOTIFICATIONS] Checking for overdue fees...');
      
      const now = new Date();
      
      const overdueFees = await db
        .select({
          id: assignedFees.id,
          studentId: assignedFees.studentId,
          schoolId: assignedFees.schoolId,
          balanceAmount: assignedFees.balanceAmount,
          dueDate: assignedFees.dueDate,
          overdueNoticeSent: assignedFees.overdueNoticeSent,
          structureName: feeStructures.name
        })
        .from(assignedFees)
        .leftJoin(feeStructures, eq(assignedFees.feeStructureId, feeStructures.id))
        .where(and(
          lte(assignedFees.dueDate, now),
          or(eq(assignedFees.status, 'pending'), eq(assignedFees.status, 'partial')),
          eq(assignedFees.overdueNoticeSent, false)
        ))
        .limit(100);
      
      for (const fee of overdueFees) {
        await db.update(assignedFees)
          .set({ status: 'overdue', updatedAt: new Date() })
          .where(eq(assignedFees.id, fee.id));
        
        if (!fee.overdueNoticeSent) {
          await this.queueOverdueNotification(fee);
        }
      }
      
      console.log(`[FEE_NOTIFICATIONS] Found ${overdueFees.length} overdue fees`);
    } catch (error) {
      console.error('[FEE_NOTIFICATIONS] Error checking overdue fees:', error);
    }
  }

  async checkUpcomingDues() {
    try {
      console.log('[FEE_NOTIFICATIONS] Checking for upcoming due dates...');
      
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      
      const upcomingFees = await db
        .select({
          id: assignedFees.id,
          studentId: assignedFees.studentId,
          schoolId: assignedFees.schoolId,
          balanceAmount: assignedFees.balanceAmount,
          dueDate: assignedFees.dueDate,
          reminderSent: assignedFees.reminderSent,
          structureName: feeStructures.name
        })
        .from(assignedFees)
        .leftJoin(feeStructures, eq(assignedFees.feeStructureId, feeStructures.id))
        .where(and(
          gte(assignedFees.dueDate, now),
          lte(assignedFees.dueDate, threeDaysFromNow),
          eq(assignedFees.status, 'pending'),
          eq(assignedFees.reminderSent, false)
        ))
        .limit(100);
      
      for (const fee of upcomingFees) {
        await this.queueReminderNotification(fee);
      }
      
      console.log(`[FEE_NOTIFICATIONS] Queued ${upcomingFees.length} reminder notifications`);
    } catch (error) {
      console.error('[FEE_NOTIFICATIONS] Error checking upcoming dues:', error);
    }
  }

  private async queueReminderNotification(fee: any) {
    const student = await this.getStudentInfo(fee.studentId);
    if (!student) return;
    
    const dueDate = new Date(fee.dueDate).toLocaleDateString('fr-FR');
    const amount = fee.balanceAmount.toLocaleString();
    
    const titleFr = `Rappel: Frais de scolarité à échéance`;
    const titleEn = `Reminder: School Fees Due Soon`;
    const messageFr = `Cher(e) ${student.firstName}, le paiement de ${amount} XAF pour "${fee.structureName}" est dû le ${dueDate}. Veuillez effectuer le paiement à temps pour éviter les pénalités.`;
    const messageEn = `Dear ${student.firstName}, the payment of ${amount} XAF for "${fee.structureName}" is due on ${dueDate}. Please make the payment on time to avoid penalties.`;
    
    await db.insert(feeNotificationQueue).values({
      schoolId: fee.schoolId,
      assignedFeeId: fee.id,
      studentId: fee.studentId,
      notificationType: 'reminder',
      title: `${titleFr} / ${titleEn}`,
      message: `${messageFr}\n\n${messageEn}`,
      channels: ['email', 'whatsapp', 'pwa'],
      status: 'pending'
    });
    
    await db.update(assignedFees)
      .set({ reminderSent: true, reminderSentAt: new Date() })
      .where(eq(assignedFees.id, fee.id));
  }

  private async queueOverdueNotification(fee: any) {
    const student = await this.getStudentInfo(fee.studentId);
    if (!student) return;
    
    const dueDate = new Date(fee.dueDate).toLocaleDateString('fr-FR');
    const amount = fee.balanceAmount.toLocaleString();
    
    const titleFr = `URGENT: Frais de scolarité en retard`;
    const titleEn = `URGENT: School Fees Overdue`;
    const messageFr = `Cher(e) ${student.firstName}, le paiement de ${amount} XAF pour "${fee.structureName}" était dû le ${dueDate} et n'a pas été effectué. Veuillez régulariser votre situation dans les plus brefs délais.`;
    const messageEn = `Dear ${student.firstName}, the payment of ${amount} XAF for "${fee.structureName}" was due on ${dueDate} and has not been paid. Please settle your account as soon as possible.`;
    
    await db.insert(feeNotificationQueue).values({
      schoolId: fee.schoolId,
      assignedFeeId: fee.id,
      studentId: fee.studentId,
      notificationType: 'overdue',
      title: `${titleFr} / ${titleEn}`,
      message: `${messageFr}\n\n${messageEn}`,
      channels: ['email', 'whatsapp', 'pwa'],
      status: 'pending'
    });
    
    await db.update(assignedFees)
      .set({ overdueNoticeSent: true, overdueNoticeSentAt: new Date() })
      .where(eq(assignedFees.id, fee.id));
  }

  async sendReceiptNotification(studentId: number, schoolId: number, receiptNumber: string, amount: number, paymentMethod: string) {
    const student = await this.getStudentInfo(studentId);
    if (!student) return;
    
    const titleFr = `Reçu de paiement - ${receiptNumber}`;
    const titleEn = `Payment Receipt - ${receiptNumber}`;
    const messageFr = `Cher(e) ${student.firstName}, nous confirmons la réception de votre paiement de ${amount.toLocaleString()} XAF via ${this.translatePaymentMethod(paymentMethod)}. Numéro de reçu: ${receiptNumber}. Merci!`;
    const messageEn = `Dear ${student.firstName}, we confirm receipt of your payment of ${amount.toLocaleString()} XAF via ${this.translatePaymentMethod(paymentMethod, 'en')}. Receipt number: ${receiptNumber}. Thank you!`;
    
    await db.insert(feeNotificationQueue).values({
      schoolId,
      studentId,
      notificationType: 'receipt',
      title: `${titleFr} / ${titleEn}`,
      message: `${messageFr}\n\n${messageEn}`,
      channels: ['email', 'whatsapp', 'pwa'],
      status: 'pending'
    });
  }

  private async sendNotification(notification: any) {
    try {
      const student = await this.getStudentInfo(notification.studentId);
      if (!student) {
        await this.markNotificationFailed(notification.id, 'Student not found');
        return;
      }
      
      const channels = notification.channels || ['email', 'whatsapp', 'pwa'];
      let emailSent = false;
      let whatsappSent = false;
      let pwaSent = false;
      
      if (channels.includes('email') && student.email) {
        try {
          await hostingerMailService.sendEmail({
            to: student.email,
            subject: notification.title,
            html: this.formatEmailHtml(notification),
            text: notification.message
          });
          emailSent = true;
          console.log(`[FEE_NOTIFICATIONS] Email sent to ${student.email}`);
        } catch (error) {
          console.error('[FEE_NOTIFICATIONS] Email failed:', error);
        }
      }
      
      if (channels.includes('whatsapp') && student.phone) {
        try {
          await whatsappDirectService.sendPaymentNotification({
            recipientPhone: student.phone,
            studentName: `${student.firstName} ${student.lastName}`,
            amount: 0,
            currency: 'XAF',
            description: notification.message,
            receiptNumber: '',
            language: 'fr'
          });
          whatsappSent = true;
          console.log(`[FEE_NOTIFICATIONS] WhatsApp sent to ${student.phone}`);
        } catch (error) {
          console.error('[FEE_NOTIFICATIONS] WhatsApp failed:', error);
        }
      }
      
      if (channels.includes('pwa')) {
        try {
          await db.insert(notifications).values({
            userId: notification.studentId,
            title: notification.title,
            message: notification.message,
            type: notification.notificationType === 'overdue' ? 'warning' : 'info',
            priority: notification.notificationType === 'overdue' ? 'high' : 'normal',
            metadata: { feeNotificationId: notification.id }
          });
          pwaSent = true;
          console.log(`[FEE_NOTIFICATIONS] PWA notification created for user ${notification.studentId}`);
        } catch (error) {
          console.error('[FEE_NOTIFICATIONS] PWA failed:', error);
        }
      }
      
      await db.update(feeNotificationQueue)
        .set({
          emailSent,
          whatsappSent,
          pwaSent,
          sentAt: new Date(),
          status: (emailSent || whatsappSent || pwaSent) ? 'sent' : 'failed',
          errorMessage: (!emailSent && !whatsappSent && !pwaSent) ? 'All channels failed' : null
        })
        .where(eq(feeNotificationQueue.id, notification.id));
        
    } catch (error) {
      console.error('[FEE_NOTIFICATIONS] Error sending notification:', error);
      await this.markNotificationFailed(notification.id, (error as Error).message);
    }
  }

  private async getStudentInfo(studentId: number) {
    const [student] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone
      })
      .from(users)
      .where(eq(users.id, studentId));
    
    return student;
  }

  private async markNotificationFailed(notificationId: number, errorMessage: string) {
    await db.update(feeNotificationQueue)
      .set({ status: 'failed', errorMessage })
      .where(eq(feeNotificationQueue.id, notificationId));
  }

  private formatEmailHtml(notification: any): string {
    const isUrgent = notification.notificationType === 'overdue';
    const bgColor = isUrgent ? '#fee2e2' : '#f0fdf4';
    const borderColor = isUrgent ? '#ef4444' : '#22c55e';
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${notification.title}</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #1e40af, #7c3aed); padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">EDUCAFRIC</h1>
      <p style="color: #e0e7ff; margin: 5px 0 0;">Plateforme Éducative Digitale</p>
    </div>
    
    <div style="padding: 30px;">
      <div style="background: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
        <h2 style="margin: 0 0 10px; color: #1f2937; font-size: 18px;">${notification.title}</h2>
      </div>
      
      <div style="color: #374151; line-height: 1.6;">
        ${notification.message.split('\n\n').map((p: string) => `<p>${p}</p>`).join('')}
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #6b7280; font-size: 12px;">
          Cet email a été envoyé automatiquement par Educafric.<br>
          This email was sent automatically by Educafric.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  private translatePaymentMethod(method: string, lang: string = 'fr'): string {
    const translations: Record<string, { fr: string; en: string }> = {
      'cash': { fr: 'Espèces', en: 'Cash' },
      'bank': { fr: 'Virement bancaire', en: 'Bank transfer' },
      'mtn_momo': { fr: 'MTN Mobile Money', en: 'MTN Mobile Money' },
      'orange_money': { fr: 'Orange Money', en: 'Orange Money' },
      'stripe': { fr: 'Carte bancaire', en: 'Credit card' },
      'other': { fr: 'Autre', en: 'Other' }
    };
    
    return translations[method]?.[lang as 'fr' | 'en'] || method;
  }

  shutdown() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isInitialized = false;
    console.log('[FEE_NOTIFICATIONS] Service shut down');
  }
}

export const feeNotificationService = new FeeNotificationService();

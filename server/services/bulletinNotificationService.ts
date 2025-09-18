import crypto from 'crypto';
import { RefactoredNotificationService, NotificationRecipient, NotificationPayload } from './refactoredNotificationService';
import { 
  BulletinTemplateGenerator, 
  TemplateVariables
} from './notificationTemplates';
import { db } from '../db';
import { bulletinComprehensive } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

// Interface pour le tracking détaillé des notifications
export interface NotificationTrackingStatus {
  sent: boolean;
  sentAt?: string;
  status?: 'delivered' | 'sent' | 'pending' | 'failed' | 'retrying';
  attempts?: number;
  lastAttemptAt?: string;
  error?: string;
  deliveredAt?: string;
  retryCount?: number;
  maxRetries?: number;
}

export interface DetailedNotificationTracking {
  email?: NotificationTrackingStatus;
  sms?: NotificationTrackingStatus;
  whatsapp?: NotificationTrackingStatus;
  lastUpdated?: string;
  totalAttempts?: number;
}

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
  schoolName?: string;
  schoolContact?: string;
}

export interface BulletinTrackingContext {
  bulletinComprehensiveId: number;
  studentId: number;
  classId: number;
  term: string;
  academicYear: string;
  schoolId: number;
}

export class BulletinNotificationService {
  private notificationService: RefactoredNotificationService;

  constructor() {
    this.notificationService = RefactoredNotificationService.getInstance();
  }

  /**
   * Persiste les résultats de notification dans la base de données
   */
  private async persistNotificationTracking(
    trackingContext: BulletinTrackingContext,
    notificationTracking: DetailedNotificationTracking
  ): Promise<void> {
    try {
      console.log('[BULLETIN_TRACKING] 💾 Persisting notification tracking for bulletin:', trackingContext.bulletinComprehensiveId);

      // Mettre à jour le champ notificationsSent avec le timestamp
      const trackingData = {
        ...notificationTracking,
        lastUpdated: new Date().toISOString()
      };

      await db.update(bulletinComprehensive)
        .set({ 
          notificationsSent: trackingData,
          updatedAt: new Date()
        })
        .where(eq(bulletinComprehensive.id, trackingContext.bulletinComprehensiveId));

      console.log('[BULLETIN_TRACKING] ✅ Notification tracking persisted successfully');
    } catch (error) {
      console.error('[BULLETIN_TRACKING] ❌ Error persisting notification tracking:', error);
      throw error;
    }
  }

  /**
   * Récupère le contexte de tracking d'un bulletin
   */
  async getBulletinTrackingContext(
    studentId: number,
    classId: number,
    term: string,
    academicYear: string,
    schoolId: number
  ): Promise<BulletinTrackingContext | null> {
    try {
      const bulletin = await db.select({
        id: bulletinComprehensive.id,
        studentId: bulletinComprehensive.studentId,
        classId: bulletinComprehensive.classId,
        term: bulletinComprehensive.term,
        academicYear: bulletinComprehensive.academicYear,
        schoolId: bulletinComprehensive.schoolId,
        notificationsSent: bulletinComprehensive.notificationsSent
      })
      .from(bulletinComprehensive)
      .where(and(
        eq(bulletinComprehensive.studentId, studentId),
        eq(bulletinComprehensive.classId, classId),
        eq(bulletinComprehensive.term, term),
        eq(bulletinComprehensive.academicYear, academicYear),
        eq(bulletinComprehensive.schoolId, schoolId)
      ))
      .limit(1);

      if (bulletin.length === 0) {
        console.warn('[BULLETIN_TRACKING] Bulletin not found for context:', { studentId, classId, term, academicYear });
        return null;
      }

      return {
        bulletinComprehensiveId: bulletin[0].id,
        studentId: bulletin[0].studentId,
        classId: bulletin[0].classId,
        term: bulletin[0].term,
        academicYear: bulletin[0].academicYear,
        schoolId: bulletin[0].schoolId
      };
    } catch (error) {
      console.error('[BULLETIN_TRACKING] ❌ Error getting tracking context:', error);
      throw error;
    }
  }

  /**
   * Gère les retry automatiques en cas d'échec temporaire
   */
  private async handleNotificationRetry(
    trackingContext: BulletinTrackingContext,
    notificationType: 'email' | 'sms' | 'whatsapp',
    currentTracking: DetailedNotificationTracking,
    maxRetries: number = 3
  ): Promise<boolean> {
    try {
      const typeTracking = currentTracking[notificationType];
      
      if (!typeTracking || !typeTracking.error) {
        return false; // Pas d'erreur à traiter
      }

      const retryCount = typeTracking.retryCount || 0;
      if (retryCount >= maxRetries) {
        console.log(`[BULLETIN_RETRY] Max retries reached for ${notificationType}`);
        return false;
      }

      // Attendre avant le retry (exponential backoff)
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s, 8s...
      await new Promise(resolve => setTimeout(resolve, delay));

      console.log(`[BULLETIN_RETRY] Attempting retry ${retryCount + 1}/${maxRetries} for ${notificationType}`);

      // Mettre à jour le tracking avec la tentative de retry
      const updatedTracking: DetailedNotificationTracking = {
        ...currentTracking,
        [notificationType]: {
          ...typeTracking,
          status: 'retrying',
          attempts: (typeTracking.attempts || 0) + 1,
          retryCount: retryCount + 1,
          lastAttemptAt: new Date().toISOString()
        }
      };

      await this.persistNotificationTracking(trackingContext, updatedTracking);
      return true;
    } catch (error) {
      console.error('[BULLETIN_RETRY] ❌ Error handling retry:', error);
      return false;
    }
  }

  /**
   * Crée un statut de tracking initial pour une notification
   */
  private createNotificationStatus(
    success: boolean,
    status: 'delivered' | 'sent' | 'pending' | 'failed',
    error?: string,
    attempts: number = 1
  ): NotificationTrackingStatus {
    return {
      sent: success,
      sentAt: new Date().toISOString(),
      status,
      attempts,
      lastAttemptAt: new Date().toISOString(),
      error,
      retryCount: 0,
      maxRetries: 3
    };
  }

  /**
   * Send bulletin notifications with detailed tracking
   * NOUVELLE VERSION AVEC TRACKING COMPLET
   */
  async sendBulletinNotificationsWithTracking(
    bulletinData: BulletinNotificationData,
    recipients: BulletinRecipient[],
    trackingContext: BulletinTrackingContext,
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
    detailedTracking: DetailedNotificationTracking;
  }> {
    try {
      console.log('[BULLETIN_NOTIFICATIONS_TRACKING] 📋 Starting bulletin notifications with tracking...');
      console.log('[BULLETIN_NOTIFICATIONS_TRACKING] Student:', bulletinData.studentName);
      console.log('[BULLETIN_NOTIFICATIONS_TRACKING] Recipients:', recipients.length);
      console.log('[BULLETIN_NOTIFICATIONS_TRACKING] Channels:', notificationTypes);

      const results: Record<string, any> = {};
      const summary = {
        totalRecipients: recipients.length,
        successfulSMS: 0,
        successfulEmails: 0,
        successfulWhatsApp: 0,
        failed: 0
      };

      // Initialiser le tracking détaillé
      const detailedTracking: DetailedNotificationTracking = {
        lastUpdated: new Date().toISOString(),
        totalAttempts: 0
      };

      // Determine notification template based on average
      let smsTemplate = 'BULLETIN_AVAILABLE';
      if (bulletinData.generalAverage >= 16) {
        smsTemplate = 'BULLETIN_EXCELLENT';
      } else if (bulletinData.generalAverage < 10) {
        smsTemplate = 'BULLETIN_NEEDS_IMPROVEMENT';
      }

      // Process each recipient with tracking
      for (const recipient of recipients) {
        const recipientResults: any[] = [];
        const recipientLanguage = recipient.preferredLanguage || language;

        // Send SMS notification avec tracking
        if (notificationTypes.includes('sms') && recipient.phone) {
          try {
            console.log('[BULLETIN_TRACKING] 📱 Sending SMS to:', recipient.phone);
            const smsResult = await this.sendBulletinSMSWithTracking(
              bulletinData,
              recipient,
              smsTemplate,
              recipientLanguage,
              trackingContext
            );
            
            recipientResults.push(smsResult);
            if (smsResult.success) {
              summary.successfulSMS++;
              detailedTracking.sms = this.createNotificationStatus(true, 'sent');
            } else {
              summary.failed++;
              detailedTracking.sms = this.createNotificationStatus(false, 'failed', smsResult.error);
            }
            detailedTracking.totalAttempts = (detailedTracking.totalAttempts || 0) + 1;
          } catch (error) {
            console.error('[BULLETIN_NOTIFICATIONS_TRACKING] SMS failed for:', recipient.name, error);
            summary.failed++;
            detailedTracking.sms = this.createNotificationStatus(false, 'failed', error instanceof Error ? error.message : 'Unknown error');
          }
        }

        // Send Email notification avec tracking
        if (notificationTypes.includes('email') && recipient.email) {
          try {
            console.log('[BULLETIN_TRACKING] 📧 Sending Email to:', recipient.email);
            const emailResult = await this.sendBulletinEmailWithTracking(
              bulletinData,
              recipient,
              recipientLanguage,
              trackingContext
            );
            
            recipientResults.push(emailResult);
            if (emailResult.success) {
              summary.successfulEmails++;
              detailedTracking.email = this.createNotificationStatus(true, 'sent');
            } else {
              summary.failed++;
              detailedTracking.email = this.createNotificationStatus(false, 'failed', emailResult.error);
            }
            detailedTracking.totalAttempts = (detailedTracking.totalAttempts || 0) + 1;
          } catch (error) {
            console.error('[BULLETIN_NOTIFICATIONS_TRACKING] Email failed for:', recipient.name, error);
            summary.failed++;
            detailedTracking.email = this.createNotificationStatus(false, 'failed', error instanceof Error ? error.message : 'Unknown error');
          }
        }

        // Send WhatsApp notification avec tracking
        if (notificationTypes.includes('whatsapp') && recipient.whatsapp) {
          try {
            console.log('[BULLETIN_TRACKING] 📱 Sending WhatsApp to:', recipient.whatsapp);
            const whatsappResult = await this.sendBulletinWhatsAppWithTracking(
              bulletinData,
              recipient,
              recipientLanguage,
              trackingContext
            );
            
            recipientResults.push(whatsappResult);
            if (whatsappResult.success) {
              summary.successfulWhatsApp++;
              detailedTracking.whatsapp = this.createNotificationStatus(true, 'sent');
            } else {
              summary.failed++;
              detailedTracking.whatsapp = this.createNotificationStatus(false, 'failed', whatsappResult.error);
            }
            detailedTracking.totalAttempts = (detailedTracking.totalAttempts || 0) + 1;
          } catch (error) {
            console.error('[BULLETIN_NOTIFICATIONS_TRACKING] WhatsApp failed for:', recipient.name, error);
            summary.failed++;
            detailedTracking.whatsapp = this.createNotificationStatus(false, 'failed', error instanceof Error ? error.message : 'Unknown error');
          }
        }

        results[recipient.id] = recipientResults;
      }

      // Persister le tracking complet
      try {
        await this.persistNotificationTracking(trackingContext, detailedTracking);
      } catch (trackingError) {
        console.error('[BULLETIN_NOTIFICATIONS_TRACKING] Failed to persist tracking:', trackingError);
      }

      console.log('[BULLETIN_NOTIFICATIONS_TRACKING] ✅ Completed bulletin notifications with tracking');
      console.log('[BULLETIN_NOTIFICATIONS_TRACKING] Summary:', summary);
      console.log('[BULLETIN_NOTIFICATIONS_TRACKING] Detailed tracking:', detailedTracking);

      return {
        success: true,
        results,
        summary,
        detailedTracking
      };

    } catch (error) {
      console.error('[BULLETIN_NOTIFICATIONS_TRACKING] ❌ Error in bulletin notifications with tracking:', error);
      return {
        success: false,
        results: {},
        summary: {
          totalRecipients: recipients.length,
          successfulSMS: 0,
          successfulEmails: 0,
          successfulWhatsApp: 0,
          failed: recipients.length
        },
        detailedTracking: {
          lastUpdated: new Date().toISOString(),
          totalAttempts: 0
        }
      };
    }
  }

  /**
   * Send bulletin notifications to students and parents
   * LEGACY VERSION - maintenue pour compatibilité
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
   * Convert bulletin data to template variables
   */
  private createTemplateVariables(
    bulletinData: BulletinNotificationData,
    recipient: BulletinRecipient
  ): TemplateVariables {
    return {
      studentName: bulletinData.studentName,
      className: bulletinData.className,
      term: bulletinData.period,
      academicYear: bulletinData.academicYear,
      schoolName: recipient.schoolName || 'École EDUCAFRIC',
      parentName: recipient.name,
      schoolContact: recipient.schoolContact || 'info@educafric.com',
      downloadLink: bulletinData.downloadUrl,
      generalAverage: bulletinData.generalAverage,
      classRank: bulletinData.classRank,
      totalStudentsInClass: bulletinData.totalStudentsInClass,
      teacherComments: bulletinData.teacherComments,
      directorComments: bulletinData.directorComments,
      qrCode: bulletinData.qrCode
    };
  }

  /**
   * Send SMS bulletin notification using new template system
   */
  private async sendBulletinSMS(
    bulletinData: BulletinNotificationData,
    recipient: BulletinRecipient,
    template: string,
    language: 'en' | 'fr'
  ): Promise<any> {
    try {
      // Create template variables
      const templateVars = this.createTemplateVariables(bulletinData, recipient);
      
      // Validate template variables
      const validation = BulletinTemplateGenerator.validateVariables(templateVars);
      if (!validation.valid) {
        console.warn('[BULLETIN_SMS] Missing template variables:', validation.missing);
      }
      
      // Auto-select template type based on average
      const templateType = BulletinTemplateGenerator.selectSMSTemplateType(bulletinData.generalAverage);
      
      // Generate SMS message using new template system
      const message = BulletinTemplateGenerator.generateSMSTemplate(
        templateVars,
        templateType,
        language
      );

      // Use the refactored notification service for SMS sending
      const notificationPayload: NotificationPayload = {
        id: crypto.randomUUID(),
        type: 'bulletin_sms',
        recipientId: recipient.id,
        data: {
          to: recipient.phone!,
          message,
          bulletinData,
          language,
          templateType
        },
        priority: 'high',
        scheduledFor: new Date()
      };

      const smsResult = await this.notificationService.sendNotification(notificationPayload);
      
      return {
        success: smsResult.success,
        type: 'sms',
        recipientId: recipient.id,
        recipientName: recipient.name,
        message,
        templateType,
        sentAt: new Date().toISOString(),
        details: smsResult
      };

    } catch (error) {
      console.error('[BULLETIN_SMS] Error generating SMS:', error);
      return {
        success: false,
        type: 'sms',
        recipientId: recipient.id,
        error: error instanceof Error ? error.message : 'SMS sending failed'
      };
    }
  }

  /**
   * Send Email bulletin notification using new template system
   */
  private async sendBulletinEmail(
    bulletinData: BulletinNotificationData,
    recipient: BulletinRecipient,
    language: 'en' | 'fr'
  ): Promise<any> {
    try {
      // Create template variables
      const templateVars = this.createTemplateVariables(bulletinData, recipient);
      
      // Validate template variables
      const validation = BulletinTemplateGenerator.validateVariables(templateVars);
      if (!validation.valid) {
        console.warn('[BULLETIN_EMAIL] Missing template variables:', validation.missing);
      }
      
      // Generate email using new comprehensive template system
      const { subject, body } = BulletinTemplateGenerator.generateEmailTemplate(
        templateVars,
        language
      );

      // Use the refactored notification service for email sending
      const notificationPayload: NotificationPayload = {
        id: crypto.randomUUID(),
        type: 'bulletin_email',
        recipientId: recipient.id,
        data: {
          to: recipient.email!,
          subject,
          html: body,
          bulletinData,
          language
        },
        priority: 'high',
        scheduledFor: new Date()
      };

      const emailResult = await this.notificationService.sendNotification(notificationPayload);

      console.log(`[BULLETIN_EMAIL] 📧 Email sent to ${recipient.email}: ${subject}`);

      return {
        success: emailResult.success,
        type: 'email',
        recipientId: recipient.id,
        recipientName: recipient.name,
        subject,
        templateUsed: 'BULLETIN_NOTIFICATION',
        sentAt: new Date().toISOString(),
        details: emailResult
      };

    } catch (error) {
      console.error('[BULLETIN_EMAIL] Error generating email:', error);
      return {
        success: false,
        type: 'email',
        recipientId: recipient.id,
        error: error instanceof Error ? error.message : 'Email sending failed'
      };
    }
  }

  /**
   * Send WhatsApp bulletin notification using new template system
   */
  private async sendBulletinWhatsApp(
    bulletinData: BulletinNotificationData,
    recipient: BulletinRecipient,
    language: 'en' | 'fr'
  ): Promise<any> {
    try {
      // Create template variables
      const templateVars = this.createTemplateVariables(bulletinData, recipient);
      
      // Validate template variables
      const validation = BulletinTemplateGenerator.validateVariables(templateVars);
      if (!validation.valid) {
        console.warn('[BULLETIN_WHATSAPP] Missing template variables:', validation.missing);
      }
      
      // Generate WhatsApp message using new comprehensive template system
      const message = BulletinTemplateGenerator.generateWhatsAppTemplate(
        templateVars,
        language
      );

      // Use the refactored notification service for WhatsApp sending
      const notificationPayload: NotificationPayload = {
        id: crypto.randomUUID(),
        type: 'bulletin_whatsapp',
        recipientId: recipient.id,
        data: {
          to: recipient.whatsapp!,
          message,
          bulletinData,
          language
        },
        priority: 'high',
        scheduledFor: new Date()
      };

      const whatsappResult = await this.notificationService.sendNotification(notificationPayload);

      return {
        success: whatsappResult.success,
        type: 'whatsapp',
        recipientId: recipient.id,
        recipientName: recipient.name,
        message,
        templateUsed: 'BULLETIN_NOTIFICATION',
        sentAt: new Date().toISOString(),
        details: whatsappResult
      };

    } catch (error) {
      console.error('[BULLETIN_WHATSAPP] Error generating WhatsApp message:', error);
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
        // Get real recipients from database - parents and student
        const recipients = await this.getRealBulletinRecipients(bulletin.studentId, language);

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

  /**
   * Get real bulletin recipients (parents and student) from database
   */
  private async getRealBulletinRecipients(
    studentId: number, 
    defaultLanguage: 'en' | 'fr' = 'fr'
  ): Promise<BulletinRecipient[]> {
    try {
      const { db } = await import('../db');
      const { users, parentStudentRelations, schools } = await import('../../shared/schema');
      const { eq, and, sql } = await import('drizzle-orm');
      
      const recipients: BulletinRecipient[] = [];
      
      // Get student info
      const student = await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone,
        whatsappNumber: users.whatsappNumber,
        preferredLanguage: sql<string>`COALESCE(${users.preferredLanguage}, '${defaultLanguage}')`,
        schoolId: users.schoolId
      })
      .from(users)
      .where(eq(users.id, studentId))
      .limit(1);
      
      if (student.length > 0) {
        const studentData = student[0];
        
        // Add student as recipient if has contact info
        if (studentData.email || studentData.phone) {
          recipients.push({
            id: `student_${studentData.id}`,
            name: `${studentData.firstName} ${studentData.lastName}`,
            email: studentData.email,
            phone: studentData.phone,
            whatsapp: studentData.whatsappNumber,
            role: 'Student',
            preferredLanguage: (studentData.preferredLanguage as 'en' | 'fr') || defaultLanguage
          });
        }
        
        // Get school default language as fallback
        let schoolDefaultLanguage = defaultLanguage;
        if (studentData.schoolId) {
          const schoolInfo = await db.select({
            defaultLanguage: sql<string>`COALESCE(${schools.defaultLanguage}, '${defaultLanguage}')`
          })
          .from(schools)
          .where(eq(schools.id, studentData.schoolId))
          .limit(1);
          
          if (schoolInfo.length > 0) {
            schoolDefaultLanguage = (schoolInfo[0].defaultLanguage as 'en' | 'fr') || defaultLanguage;
          }
        }
        
        // Get parent relationships and parent info
        const parentsData = await db.select({
          parentId: parentStudentRelations.parentId,
          relationshipType: parentStudentRelations.relationshipType,
          parentFirstName: sql<string>`parent_users.first_name`,
          parentLastName: sql<string>`parent_users.last_name`,
          parentEmail: sql<string>`parent_users.email`,
          parentPhone: sql<string>`parent_users.phone`,
          parentWhatsapp: sql<string>`parent_users.whatsapp_number`,
          parentPreferredLanguage: sql<string>`COALESCE(parent_users.preferred_language, '${schoolDefaultLanguage}')`
        })
        .from(parentStudentRelations)
        .leftJoin(sql`users AS parent_users`, sql`parent_users.id = ${parentStudentRelations.parentId}`)
        .where(eq(parentStudentRelations.studentId, studentId));
        
        // Add parents as recipients
        parentsData.forEach(parent => {
          if (parent.parentEmail || parent.parentPhone) {
            recipients.push({
              id: `parent_${parent.parentId}`,
              name: `${parent.parentFirstName} ${parent.parentLastName}`,
              email: parent.parentEmail,
              phone: parent.parentPhone,
              whatsapp: parent.parentWhatsapp,
              role: 'Parent',
              preferredLanguage: (parent.parentPreferredLanguage as 'en' | 'fr') || schoolDefaultLanguage,
              relationToStudent: parent.relationshipType
            });
          }
        });
      }
      
      console.log(`[BULLETIN_RECIPIENTS] 👥 Found ${recipients.length} recipients for student ${studentId}`);
      return recipients;
      
    } catch (error) {
      console.error('[BULLETIN_RECIPIENTS] ❌ Error getting real recipients:', error);
      // Fallback to basic recipient info
      return [{
        id: `student_${studentId}`,
        name: `Student ${studentId}`,
        email: `student${studentId}@educafric.com`,
        phone: '+237600000000',
        role: 'Student',
        preferredLanguage: defaultLanguage
      }];
    }
  }
}

export const bulletinNotificationService = new BulletinNotificationService();
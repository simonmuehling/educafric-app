/**
 * EDUCAFRIC - Invitation Notification Service
 * 
 * Handles email and WhatsApp Click-to-Chat notifications for teacher independent course invitations
 * Supports bilingual (FR/EN) notifications with automatic language detection
 * 
 * Created: October 2025
 */

import { sendEmail } from './hostingerMailService';
import { createWaToken, getRecipientById } from './waClickToChat';
import { 
  InvitationTemplateGenerator, 
  InvitationTemplateVariables 
} from './notificationTemplates';

interface InvitationNotificationData {
  teacherId: number;
  teacherName: string;
  teacherEmail: string;
  recipientId: number;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  studentId?: number;
  studentName?: string;
  subjects: string[];
  level?: string;
  message?: string;
  pricePerHour?: number;
  pricePerSession?: number;
  currency?: string;
  responseMessage?: string;
  language?: 'fr' | 'en';
}

export class InvitationNotificationService {
  /**
   * Send invitation received notification to parent/student
   */
  static async sendInvitationReceived(data: InvitationNotificationData): Promise<{ 
    emailSent: boolean; 
    whatsappSent: boolean; 
    error?: string;
  }> {
    try {
      const language = data.language || 'fr';
      const platformUrl = process.env.FRONTEND_URL || 'https://www.educafric.com';
      
      const templateVars: InvitationTemplateVariables = {
        teacherName: data.teacherName,
        teacherEmail: data.teacherEmail,
        recipientName: data.recipientName,
        studentName: data.studentName,
        subjects: data.subjects.join(', '),
        level: data.level,
        message: data.message,
        pricePerHour: data.pricePerHour,
        pricePerSession: data.pricePerSession,
        currency: data.currency || 'XAF',
        platformUrl
      };

      // Send email notification
      const emailTemplate = InvitationTemplateGenerator.generateEmail(
        'INVITATION_RECEIVED',
        templateVars,
        language
      );

      let emailSent = false;
      try {
        await sendEmail(
          data.recipientEmail,
          emailTemplate.subject,
          emailTemplate.body
        );
        emailSent = true;
        console.log(`[INVITATION_NOTIFICATION] Email sent to ${data.recipientEmail}`);
      } catch (emailError) {
        console.error(`[INVITATION_NOTIFICATION] Email failed:`, emailError);
      }

      // Send WhatsApp Click-to-Chat notification
      let whatsappSent = false;
      try {
        const recipient = await getRecipientById(data.recipientId);
        
        if (recipient && recipient.waOptIn && recipient.whatsappE164) {
          const waMessage = InvitationTemplateGenerator.generateWhatsApp(
            'INVITATION_RECEIVED',
            templateVars,
            language
          );

          const waToken = await createWaToken({
            recipientId: data.recipientId,
            phoneNumber: recipient.whatsappE164,
            language,
            message: waMessage,
            type: 'teacher_invitation'
          });

          whatsappSent = true;
          console.log(`[INVITATION_NOTIFICATION] WhatsApp token created: ${waToken.token}`);
        } else {
          console.log(`[INVITATION_NOTIFICATION] Recipient ${data.recipientId} not WhatsApp-enabled`);
        }
      } catch (waError) {
        console.error(`[INVITATION_NOTIFICATION] WhatsApp failed:`, waError);
      }

      return { emailSent, whatsappSent };
    } catch (error) {
      console.error(`[INVITATION_NOTIFICATION] Error in sendInvitationReceived:`, error);
      return { 
        emailSent: false, 
        whatsappSent: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Send invitation accepted notification to teacher
   */
  static async sendInvitationAccepted(data: InvitationNotificationData): Promise<{ 
    emailSent: boolean; 
    whatsappSent: boolean; 
    error?: string;
  }> {
    try {
      const language = data.language || 'fr';
      const platformUrl = process.env.FRONTEND_URL || 'https://www.educafric.com';
      
      const templateVars: InvitationTemplateVariables = {
        teacherName: data.teacherName,
        teacherEmail: data.teacherEmail,
        recipientName: data.recipientName,
        responseMessage: data.responseMessage,
        subjects: data.subjects.join(', '),
        platformUrl
      };

      // Send email notification
      const emailTemplate = InvitationTemplateGenerator.generateEmail(
        'INVITATION_ACCEPTED',
        templateVars,
        language
      );

      let emailSent = false;
      try {
        await sendEmail(
          data.teacherEmail,
          emailTemplate.subject,
          emailTemplate.body
        );
        emailSent = true;
        console.log(`[INVITATION_NOTIFICATION] Acceptance email sent to ${data.teacherEmail}`);
      } catch (emailError) {
        console.error(`[INVITATION_NOTIFICATION] Acceptance email failed:`, emailError);
      }

      // Send WhatsApp Click-to-Chat notification
      let whatsappSent = false;
      try {
        const teacher = await getRecipientById(data.teacherId);
        
        if (teacher && teacher.waOptIn && teacher.whatsappE164) {
          const waMessage = InvitationTemplateGenerator.generateWhatsApp(
            'INVITATION_ACCEPTED',
            templateVars,
            language
          );

          const waToken = await createWaToken({
            recipientId: data.teacherId,
            phoneNumber: teacher.whatsappE164,
            language,
            message: waMessage,
            type: 'invitation_accepted'
          });

          whatsappSent = true;
          console.log(`[INVITATION_NOTIFICATION] Acceptance WhatsApp token created: ${waToken.token}`);
        } else {
          console.log(`[INVITATION_NOTIFICATION] Teacher ${data.teacherId} not WhatsApp-enabled`);
        }
      } catch (waError) {
        console.error(`[INVITATION_NOTIFICATION] Acceptance WhatsApp failed:`, waError);
      }

      return { emailSent, whatsappSent };
    } catch (error) {
      console.error(`[INVITATION_NOTIFICATION] Error in sendInvitationAccepted:`, error);
      return { 
        emailSent: false, 
        whatsappSent: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Send invitation rejected notification to teacher
   */
  static async sendInvitationRejected(data: InvitationNotificationData): Promise<{ 
    emailSent: boolean; 
    whatsappSent: boolean; 
    error?: string;
  }> {
    try {
      const language = data.language || 'fr';
      const platformUrl = process.env.FRONTEND_URL || 'https://www.educafric.com';
      
      const templateVars: InvitationTemplateVariables = {
        teacherName: data.teacherName,
        teacherEmail: data.teacherEmail,
        recipientName: data.recipientName,
        responseMessage: data.responseMessage,
        subjects: data.subjects.join(', '),
        platformUrl
      };

      // Send email notification
      const emailTemplate = InvitationTemplateGenerator.generateEmail(
        'INVITATION_REJECTED',
        templateVars,
        language
      );

      let emailSent = false;
      try {
        await sendEmail(
          data.teacherEmail,
          emailTemplate.subject,
          emailTemplate.body
        );
        emailSent = true;
        console.log(`[INVITATION_NOTIFICATION] Rejection email sent to ${data.teacherEmail}`);
      } catch (emailError) {
        console.error(`[INVITATION_NOTIFICATION] Rejection email failed:`, emailError);
      }

      // Send WhatsApp Click-to-Chat notification
      let whatsappSent = false;
      try {
        const teacher = await getRecipientById(data.teacherId);
        
        if (teacher && teacher.waOptIn && teacher.whatsappE164) {
          const waMessage = InvitationTemplateGenerator.generateWhatsApp(
            'INVITATION_REJECTED',
            templateVars,
            language
          );

          const waToken = await createWaToken({
            recipientId: data.teacherId,
            phoneNumber: teacher.whatsappE164,
            language,
            message: waMessage,
            type: 'invitation_rejected'
          });

          whatsappSent = true;
          console.log(`[INVITATION_NOTIFICATION] Rejection WhatsApp token created: ${waToken.token}`);
        } else {
          console.log(`[INVITATION_NOTIFICATION] Teacher ${data.teacherId} not WhatsApp-enabled`);
        }
      } catch (waError) {
        console.error(`[INVITATION_NOTIFICATION] Rejection WhatsApp failed:`, waError);
      }

      return { emailSent, whatsappSent };
    } catch (error) {
      console.error(`[INVITATION_NOTIFICATION] Error in sendInvitationRejected:`, error);
      return { 
        emailSent: false, 
        whatsappSent: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export default InvitationNotificationService;

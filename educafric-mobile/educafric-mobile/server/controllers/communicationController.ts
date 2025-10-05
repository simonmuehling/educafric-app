/**
 * Refactored Communication Controller for EDUCAFRIC
 * Centralized communication management between school and parents
 */

import { Request, Response } from 'express';
import { RefactoredNotificationService, NotificationPayload } from '../services/refactoredNotificationService';
import { storage } from '../storage';

export class CommunicationController {
  private notificationService = RefactoredNotificationService.getInstance();

  /**
   * Send communication from school to parents
   */
  async sendSchoolToParentCommunication(req: Request, res: Response): Promise<void> {
    try {
      const { recipientIds, type, subject, message, template, urgent = false } = req.body;
      const senderId = (req.user as any)?.id;
      const schoolId = (req.user as any)?.schoolId;

      if (!senderId || !schoolId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      // Validate recipients
      if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
        res.status(400).json({ message: 'Recipients required' });
        return;
      }

      // Get recipient details
      const recipients = await Promise.all(
        recipientIds.map(async (id: number) => {
          const user = await storage.getUserById(id);
          if (!user) return null;
          
          return {
            id: user.id.toString(),
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone,
            preferredLanguage: (user.preferredLanguage || 'fr') as 'en' | 'fr',
            role: user.role as any
          };
        })
      );

      const validRecipients = recipients.filter(r => r !== null);

      if (validRecipients.length === 0) {
        res.status(404).json({ message: 'No valid recipients found' });
        return;
      }

      // Create notification payload
      const payload: NotificationPayload = {
        type: type || 'sms',
        template: template || 'SCHOOL_ANNOUNCEMENT',
        recipients: validRecipients,
        data: {
          schoolName: 'École Primaire de Yaoundé', // Should come from school data
          announcement: message,
          subject: subject,
          date: new Date().toLocaleDateString('fr-FR')
        },
        priority: urgent ? 'urgent' : 'medium',
        schoolId,
        senderId,
        metadata: {
          subject,
          originalMessage: message,
          communicationType: 'school_to_parent'
        }
      };

      // Send notifications
      const results = await this.notificationService.sendNotification(payload);

      // Log communication in database
      const communicationLog = await storage.createCommunicationLog({
        senderId,
        recipientId: recipientIds[0], // Primary recipient
        type: 'school_announcement',
        subject,
        message,
        status: 'sent',
        sentAt: new Date(),
        metadata: { recipientCount: validRecipients.length, results }
      });

      // Return results
      res.status(201).json({
        id: communicationLog.id,
        subject,
        message,
        recipientCount: validRecipients.length,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length,
        results,
        sentAt: new Date()
      });

    } catch (error) {
      console.error('Communication sending error:', error);
      res.status(500).json({ 
        message: 'Failed to send communication',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Send grade notification to parents
   */
  async sendGradeNotification(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, subject, grade, comment } = req.body;
      const teacherId = (req.user as any)?.id;

      // Get student and parent information
      const student = await storage.getStudentById(studentId);
      if (!student) {
        res.status(404).json({ message: 'Student not found' });
        return;
      }

      // Get parent
      const parent = await storage.getUserById(student.parentId);
      if (!parent) {
        res.status(404).json({ message: 'Parent not found' });
        return;
      }

      const recipient = {
        id: parent.id.toString(),
        name: `${parent.firstName} ${parent.lastName}`,
        email: parent.email,
        phone: parent.phone,
        preferredLanguage: (parent.preferredLanguage || 'fr') as 'en' | 'fr',
        role: 'Parent' as const
      };

      // Create notification payload
      const payload: NotificationPayload = {
        type: 'sms',
        template: grade >= 12 ? 'NEW_GRADE' : 'LOW_GRADE_ALERT',
        recipients: [recipient],
        data: {
          childName: `${student.firstName} ${student.lastName}`,
          subject,
          grade: `${grade}/20`,
          teacher: `${(req.user as any).firstName} ${(req.user as any).lastName}`,
          comment: comment || ''
        },
        priority: grade < 10 ? 'high' : 'medium',
        senderId: teacherId,
        metadata: {
          studentId,
          subject,
          grade,
          communicationType: 'grade_notification'
        }
      };

      // Send notification
      const results = await this.notificationService.sendNotification(payload);

      res.status(201).json({
        studentName: `${student.firstName} ${student.lastName}`,
        parentName: `${parent.firstName} ${parent.lastName}`,
        subject,
        grade,
        notificationSent: results[0]?.success || false,
        result: results[0]
      });

    } catch (error) {
      console.error('Grade notification error:', error);
      res.status(500).json({ 
        message: 'Failed to send grade notification',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Send attendance alert to parents
   */
  async sendAttendanceAlert(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, type, details } = req.body; // type: 'absent', 'late', 'early_departure'
      const senderId = (req.user as any)?.id;

      const student = await storage.getStudentById(studentId);
      if (!student) {
        res.status(404).json({ message: 'Student not found' });
        return;
      }

      const parent = await storage.getUserById(student.parentId);
      if (!parent) {
        res.status(404).json({ message: 'Parent not found' });
        return;
      }

      const recipient = {
        id: parent.id.toString(),
        name: `${parent.firstName} ${parent.lastName}`,
        email: parent.email,
        phone: parent.phone,
        preferredLanguage: (parent.preferredLanguage || 'fr') as 'en' | 'fr',
        role: 'Parent' as const
      };

      // Choose appropriate template
      let template: keyof typeof import('../templates/smsTemplates').SMS_TEMPLATES;
      switch (type) {
        case 'absent':
          template = 'ABSENCE_ALERT';
          break;
        case 'late':
          template = 'LATE_ARRIVAL';
          break;
        default:
          template = 'SCHOOL_ANNOUNCEMENT';
      }

      const payload: NotificationPayload = {
        type: 'sms',
        template,
        recipients: [recipient],
        data: {
          childName: `${student.firstName} ${student.lastName}`,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          details: details || '',
          schoolName: 'École Primaire de Yaoundé'
        },
        priority: 'high',
        senderId,
        metadata: {
          studentId,
          attendanceType: type,
          communicationType: 'attendance_alert'
        }
      };

      const results = await this.notificationService.sendNotification(payload);

      res.status(201).json({
        studentName: `${student.firstName} ${student.lastName}`,
        parentName: `${parent.firstName} ${parent.lastName}`,
        alertType: type,
        notificationSent: results[0]?.success || false,
        result: results[0]
      });

    } catch (error) {
      console.error('Attendance alert error:', error);
      res.status(500).json({ 
        message: 'Failed to send attendance alert',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get communication statistics
   */
  async getCommunicationStats(req: Request, res: Response): Promise<void> {
    try {
      const { schoolId } = req.params;
      const userSchoolId = (req.user as any)?.schoolId;

      // Verify user has access to this school
      if (parseInt(schoolId) !== userSchoolId) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }

      // Get delivery statistics from notification service
      const deliveryStats = this.notificationService.getDeliveryStats();

      // Get communication logs from database
      const recentCommunications = await storage.getRecentCommunications(userSchoolId, 30);

      res.json({
        deliveryStats,
        recentCommunications: recentCommunications.slice(0, 10), // Latest 10
        totalSent: recentCommunications.length,
        period: '30 days'
      });

    } catch (error) {
      console.error('Communication stats error:', error);
      res.status(500).json({ 
        message: 'Failed to get communication statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get parent communications (received messages)
   */
  async getParentCommunications(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as any)?.id;
      const role = (req.user as any)?.role;

      if (role !== 'Parent') {
        res.status(403).json({ message: 'Parent access required' });
        return;
      }

      // Get communications for this parent
      const communications = await storage.getCommunicationsForUser(userId);

      res.json(communications);

    } catch (error) {
      console.error('Parent communications error:', error);
      res.status(500).json({ 
        message: 'Failed to get parent communications',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const communicationController = new CommunicationController();
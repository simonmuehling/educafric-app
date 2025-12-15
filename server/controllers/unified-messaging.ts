/**
 * UNIFIED MESSAGING CONTROLLER
 * Consolidates all duplicated messaging functionality into one clean system
 * Handles: Student-Parent, Teacher-Student, Family, Partnership messages
 */

import { Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { getRecipientById } from '../services/waClickToChat';
import { renderTemplate } from '../templates/waTemplates';
import { buildWaUrl } from '../utils/waLink';
import { db } from '../db';
import { connections, notifications } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Unified connection types
export type ConnectionType = 'student-parent' | 'teacher-student' | 'teacher-school' | 'family' | 'partnership';

// Unified message schema - replaces all duplicated schemas
export const unifiedMessageSchema = z.object({
  connectionId: z.number(),
  message: z.string().min(1, 'Message cannot be empty'),
  messageType: z.enum(['text', 'homework', 'grade', 'attendance', 'emergency', 'general']).default('text'),
  connectionType: z.enum(['student-parent', 'teacher-student', 'teacher-school', 'family', 'partnership']),
  
  // Optional features for different connection types
  parentCcEnabled: z.boolean().optional(),
  teacherCcEnabled: z.boolean().optional(),
  geolocationShared: z.boolean().optional(),
  emergencyLevel: z.enum(['low', 'medium', 'high']).optional(),
  
  // Context-specific data
  homeworkDetails: z.object({
    subject: z.string(),
    dueDate: z.string(),
    instructions: z.string()
  }).optional(),
  
  gradeDetails: z.object({
    subject: z.string(),
    grade: z.number(),
    maxGrade: z.number(),
    comment: z.string()
  }).optional(),
  
  permissionDetails: z.object({
    type: z.string(),
    details: z.string(),
    dateNeeded: z.string()
  }).optional()
});

export const markMessageReadSchema = z.object({
  messageId: z.number(),
  connectionType: z.enum(['student-parent', 'teacher-student', 'teacher-school', 'family', 'partnership'])
});

export class UnifiedMessagingController {
  
  /**
   * Get messages for any connection type
   * GET /api/messages/:connectionType/:connectionId
   */
  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const connectionType = req.params.connectionType as ConnectionType;
      const connectionId = parseInt(req.params.connectionId);
      const userId = (req.user as any)?.id;
      
      if (!connectionId || isNaN(connectionId)) {
        res.status(400).json({ error: 'Invalid connection ID' });
        return;
      }

      // Verify user has access to this connection
      const hasAccess = await this.verifyConnectionAccess(userId, connectionType, connectionId);
      if (!hasAccess) {
        res.status(403).json({ error: 'Access denied to this conversation' });
        return;
      }

      // Get messages using unified storage method
      const messages = await storage.getMessages(connectionType, connectionId);

      res.json({ 
        success: true, 
        data: messages,
        connectionType,
        connectionId
      });
    } catch (error) {
      console.error('[UNIFIED_MESSAGING] Error getting messages:', error);
      res.status(500).json({ error: 'Failed to retrieve messages' });
    }
  }

  /**
   * Send message for any connection type
   * POST /api/messages/:connectionType
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const connectionType = req.params.connectionType as ConnectionType;
      const userId = (req.user as any)?.id;
      const userRole = (req.user as any)?.role;
      
      // Validate request data
      const validationData = { ...req.body, connectionType };
      const validationResult = unifiedMessageSchema.safeParse(validationData);
      
      if (!validationResult.success) {
        res.status(400).json({ 
          error: 'Invalid message data', 
          details: validationResult.error.errors 
        });
        return;
      }

      const messageData = validationResult.data;

      // Verify user can send messages on this connection type
      const canSend = await this.verifyUserCanSend(userId, userRole, connectionType, messageData.connectionId);
      if (!canSend) {
        res.status(403).json({ error: 'Not authorized to send messages on this connection' });
        return;
      }

      // Send message using unified storage method
      const sentMessage = await storage.sendMessage({
        ...messageData,
        senderId: userId,
        connectionType,
        sentAt: new Date()
      });

      // Send WhatsApp notification to recipient (async, don't block response)
      this.sendWhatsAppNotification(messageData, userId, userRole, connectionType).catch(error => {
        console.error('[UNIFIED_MESSAGING] WhatsApp notification failed:', error);
      });

      // Send in-app notification to recipient (async, don't block response)
      this.createInAppNotification(messageData, userId, userRole, connectionType).catch(error => {
        console.error('[UNIFIED_MESSAGING] In-app notification failed:', error);
      });

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: sentMessage
      });
    } catch (error) {
      console.error('[UNIFIED_MESSAGING] Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }

  /**
   * Mark message as read
   * PUT /api/messages/:connectionType/:messageId/read
   */
  async markMessageRead(req: Request, res: Response): Promise<void> {
    try {
      const connectionType = req.params.connectionType as ConnectionType;
      const messageId = parseInt(req.params.messageId);
      const userId = (req.user as any)?.id;
      
      if (!messageId || isNaN(messageId)) {
        res.status(400).json({ error: 'Invalid message ID' });
        return;
      }

      // Mark as read using unified storage method
      await storage.markMessageRead(connectionType, messageId, userId);

      res.json({
        success: true,
        message: 'Message marked as read'
      });
    } catch (error) {
      console.error('[UNIFIED_MESSAGING] Error marking message as read:', error);
      res.status(500).json({ error: 'Failed to mark message as read' });
    }
  }

  /**
   * Get all connections for a user
   * GET /api/connections/:connectionType
   */
  async getConnections(req: Request, res: Response): Promise<void> {
    try {
      const connectionType = req.params.connectionType as ConnectionType;
      const userId = (req.user as any)?.id;
      const userRole = (req.user as any)?.role;
      
      // Get connections using unified storage method
      const connections = await storage.getConnectionsForUser(connectionType, userId, userRole);

      res.json({ 
        success: true, 
        data: connections,
        connectionType
      });
    } catch (error) {
      console.error('[UNIFIED_MESSAGING] Error getting connections:', error);
      res.status(500).json({ error: 'Failed to retrieve connections' });
    }
  }

  /**
   * Verify user has access to a specific connection
   */
  private async verifyConnectionAccess(userId: number, connectionType: ConnectionType, connectionId: number): Promise<boolean> {
    try {
      return await storage.verifyConnectionAccess(userId, connectionType, connectionId);
    } catch (error) {
      console.error('[UNIFIED_MESSAGING] Access verification failed:', error);
      return false;
    }
  }

  /**
   * Verify user can send messages on connection type
   */
  private async verifyUserCanSend(userId: number, userRole: string, connectionType: ConnectionType, connectionId: number): Promise<boolean> {
    try {
      // Check role permissions for each connection type
      const rolePermissions = {
        'student-parent': ['Student', 'Parent'],
        'teacher-student': ['Teacher', 'Freelancer', 'Student'],
        'family': ['Student', 'Parent'],
        'partnership': ['Commercial', 'Director', 'SiteAdmin']
      };

      if (!rolePermissions[connectionType]?.includes(userRole)) {
        return false;
      }

      // Verify user is part of this specific connection
      return await this.verifyConnectionAccess(userId, connectionType, connectionId);
    } catch (error) {
      console.error('[UNIFIED_MESSAGING] Send permission verification failed:', error);
      return false;
    }
  }

  /**
   * Send WhatsApp notification about new message
   */
  private async sendWhatsAppNotification(
    messageData: any,
    senderId: number,
    senderRole: string,
    connectionType: ConnectionType
  ): Promise<void> {
    try {
      // Get recipient ID from connection using database query
      const [connection] = await db
        .select()
        .from(connections)
        .where(eq(connections.id, messageData.connectionId))
        .limit(1);

      if (!connection) {
        console.log('[UNIFIED_MESSAGING] Connection not found, skipping WhatsApp notification');
        return;
      }

      // Determine recipient ID (the person who didn't send the message)
      const recipientId = connection.initiatorId === senderId ? connection.targetId : connection.initiatorId;
      
      // Get recipient info
      const recipient = await getRecipientById(recipientId);
      if (!recipient || !recipient.waOptIn || !recipient.whatsappE164) {
        console.log(`[UNIFIED_MESSAGING] Recipient ${recipientId} not WhatsApp-enabled, skipping notification`);
        return;
      }

      // Get sender info
      const sender = await getRecipientById(senderId);
      if (!sender) {
        console.log(`[UNIFIED_MESSAGING] Sender ${senderId} not found, skipping notification`);
        return;
      }

      const baseUrl = process.env.FRONTEND_URL || 'https://www.educafric.com';
      const portalLink = `${baseUrl}/${recipient.role.toLowerCase()}/messages`;
      
      // Truncate message preview to 50 chars
      const messagePreview = messageData.message.length > 50 
        ? messageData.message.substring(0, 50) 
        : messageData.message;

      const senderName = `${sender.firstName} ${sender.lastName}`;
      const lang = recipient.waLanguage || 'fr';

      let templateId = 'new_message';
      let templateData: Record<string, any> = {
        sender_name: senderName,
        sender_role: this.translateRole(senderRole, lang),
        message_preview: messagePreview,
        portal_link: portalLink
      };

      // Select template based on message type
      if (messageData.messageType === 'homework' && messageData.homeworkDetails) {
        templateId = 'message_homework';
        templateData.teacher_name = senderName;
        templateData.subject = messageData.homeworkDetails.subject;
        templateData.due_date = new Date(messageData.homeworkDetails.dueDate).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US');
      } else if (messageData.messageType === 'emergency' || messageData.emergencyLevel === 'high') {
        templateId = 'urgent_message';
      }

      const message = renderTemplate(templateId, lang, templateData);
      const waUrl = buildWaUrl(recipient.whatsappE164, message);

      console.log(`[UNIFIED_MESSAGING] 💬 Message notification sent via WhatsApp to ${recipientId}`);
      console.log(`[UNIFIED_MESSAGING] WhatsApp URL: ${waUrl}`);

    } catch (error) {
      console.error('[UNIFIED_MESSAGING] WhatsApp notification error:', error);
    }
  }

  /**
   * Translate role to French/English
   */
  private translateRole(role: string, lang: 'fr' | 'en'): string {
    const translations: Record<string, Record<string, string>> = {
      'Parent': { fr: 'Parent', en: 'Parent' },
      'Student': { fr: 'Élève', en: 'Student' },
      'Teacher': { fr: 'Enseignant', en: 'Teacher' },
      'Freelancer': { fr: 'Freelance', en: 'Freelancer' },
      'Director': { fr: 'Directeur', en: 'Director' },
      'Commercial': { fr: 'Commercial', en: 'Sales' }
    };
    return translations[role]?.[lang] || role;
  }

  /**
   * Create in-app notification for message recipient
   */
  private async createInAppNotification(
    messageData: any,
    senderId: number,
    senderRole: string,
    connectionType: ConnectionType
  ): Promise<void> {
    try {
      // Get connection to find recipient
      const [connection] = await db
        .select()
        .from(connections)
        .where(eq(connections.id, messageData.connectionId))
        .limit(1);

      if (!connection) {
        console.log('[UNIFIED_MESSAGING] Connection not found, skipping in-app notification');
        return;
      }

      // Determine recipient ID (the person who didn't send the message)
      const recipientId = connection.initiatorId === senderId ? connection.targetId : connection.initiatorId;
      
      // Get sender info
      const sender = await getRecipientById(senderId);
      if (!sender) {
        console.log(`[UNIFIED_MESSAGING] Sender ${senderId} not found, skipping notification`);
        return;
      }

      const senderName = `${sender.firstName} ${sender.lastName}`;
      
      // Truncate message preview
      const messagePreview = messageData.message.length > 100 
        ? messageData.message.substring(0, 100) + '...'
        : messageData.message;

      // Create bilingual notification content
      const titleFr = `Nouveau message de ${senderName}`;
      const titleEn = `New message from ${senderName}`;
      const messageFr = `${this.translateRole(senderRole, 'fr')}: ${messagePreview}`;
      const messageEn = `${this.translateRole(senderRole, 'en')}: ${messagePreview}`;

      // Insert notification into database
      await db.insert(notifications).values({
        userId: recipientId,
        title: titleFr,
        titleFr: titleFr,
        titleEn: titleEn,
        message: messageFr,
        messageFr: messageFr,
        messageEn: messageEn,
        type: 'message',
        priority: messageData.emergencyLevel === 'high' ? 'high' : 'medium',
        isRead: false,
        metadata: {
          senderId: senderId,
          senderName: senderName,
          senderRole: senderRole,
          connectionType: connectionType,
          connectionId: messageData.connectionId,
          messageType: messageData.messageType,
          category: 'communication',
          actionUrl: `/messages`,
          actionText: 'Voir'
        }
      });

      console.log(`[UNIFIED_MESSAGING] 🔔 In-app notification created for user ${recipientId}`);

    } catch (error) {
      console.error('[UNIFIED_MESSAGING] In-app notification error:', error);
    }
  }
}

export const unifiedMessagingController = new UnifiedMessagingController();
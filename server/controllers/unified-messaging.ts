/**
 * UNIFIED MESSAGING CONTROLLER
 * Consolidates all duplicated messaging functionality into one clean system
 * Handles: Student-Parent, Teacher-Student, Family, Partnership messages
 */

import { Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

// Unified connection types
export type ConnectionType = 'student-parent' | 'teacher-student' | 'family' | 'partnership';

// Unified message schema - replaces all duplicated schemas
export const unifiedMessageSchema = z.object({
  connectionId: z.number(),
  message: z.string().min(1, 'Message cannot be empty'),
  messageType: z.enum(['text', 'homework', 'grade', 'attendance', 'emergency', 'general']).default('text'),
  connectionType: z.enum(['student-parent', 'teacher-student', 'family', 'partnership']),
  
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
  connectionType: z.enum(['student-parent', 'teacher-student', 'family', 'partnership'])
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
}

export const unifiedMessagingController = new UnifiedMessagingController();
/**
 * Refactored Notification Service for EDUCAFRIC
 * Improved organization, error handling, and African optimization
 */

import { SMS_TEMPLATES } from './notifications/smsTemplates';

export interface NotificationRecipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  preferredLanguage: 'en' | 'fr';
  role: 'Parent' | 'Student' | 'Teacher' | 'Director' | 'Admin';
}

export interface NotificationPayload {
  type: 'sms' | 'email' | 'whatsapp' | 'push';
  template: keyof typeof SMS_TEMPLATES;
  recipients: NotificationRecipient[];
  data: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  schoolId?: number;
  senderId?: number;
  metadata?: Record<string, any>;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  recipientId: string;
  deliveredAt?: Date;
  error?: string;
  cost?: number; // For African networks cost tracking
}

export class RefactoredNotificationService {
  private static instance: RefactoredNotificationService;
  private deliveryStats: Map<string, NotificationResult[]> = new Map();

  static getInstance(): RefactoredNotificationService {
    if (!RefactoredNotificationService.instance) {
      RefactoredNotificationService.instance = new RefactoredNotificationService();
    }
    return RefactoredNotificationService.instance;
  }

  /**
   * Send notification with enhanced African network optimization
   */
  async sendNotification(payload: NotificationPayload): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    
    for (const recipient of payload.recipients) {
      try {
        let result: NotificationResult;
        
        switch (payload.type) {
          case 'sms':
            result = await this.sendSMS(payload, recipient);
            break;
          case 'email':
            result = await this.sendEmail(payload, recipient);
            break;
          case 'whatsapp':
            result = await this.sendWhatsApp(payload, recipient);
            break;
          case 'push':
            result = await this.sendPush(payload, recipient);
            break;
          default:
            throw new Error(`Unsupported notification type: ${payload.type}`);
        }
        
        results.push(result);
        this.trackDelivery(payload.template, result);
        
      } catch (error) {
        const failureResult: NotificationResult = {
          success: false,
          recipientId: recipient.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        results.push(failureResult);
      }
    }
    
    return results;
  }

  /**
   * Send SMS with African network optimization
   */
  private async sendSMS(payload: NotificationPayload, recipient: NotificationRecipient): Promise<NotificationResult> {
    if (!recipient.phone) {
      throw new Error('Phone number required for SMS');
    }

    // Get template
    const template = SMS_TEMPLATES[payload.template];
    if (!template) {
      throw new Error(`SMS template not found: ${payload.template}`);
    }

    const templateFn = template[recipient.preferredLanguage];
    if (!templateFn) {
      throw new Error(`Template not available in ${recipient.preferredLanguage}`);
    }

    // Build message
    const dataValues = Object.values(payload.data);
    const message = templateFn(...dataValues as any);

    // African network optimization
    const optimizedMessage = this.optimizeForAfricanNetworks(message);
    
    // In development mode, simulate sending
    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 SMS [${payload.priority.toUpperCase()}]: ${optimizedMessage.slice(0, 50)}...`);
      console.log(`📍 To: ${recipient.phone} (${recipient.name})`);
      
      return {
        success: true,
        messageId: `dev_${Date.now()}`,
        recipientId: recipient.id,
        deliveredAt: new Date(),
        cost: this.calculateSMSCost(optimizedMessage, recipient.phone)
      };
    }

    // Production SMS sending would happen here
    // Implementation depends on configured SMS provider (Vonage, etc.)
    
    return {
      success: false,
      recipientId: recipient.id,
      error: 'SMS provider not configured'
    };
  }

  /**
   * Send email notification
   */
  private async sendEmail(payload: NotificationPayload, recipient: NotificationRecipient): Promise<NotificationResult> {
    if (!recipient.email) {
      throw new Error('Email address required');
    }

    // Email implementation would go here
    console.log(`📧 Email to ${recipient.email}: ${payload.template}`);
    
    return {
      success: true,
      messageId: `email_${Date.now()}`,
      recipientId: recipient.id,
      deliveredAt: new Date()
    };
  }

  /**
   * Send WhatsApp message
   */
  private async sendWhatsApp(payload: NotificationPayload, recipient: NotificationRecipient): Promise<NotificationResult> {
    if (!recipient.phone) {
      throw new Error('Phone number required for WhatsApp');
    }

    // WhatsApp implementation would go here
    console.log(`💬 WhatsApp to ${recipient.phone}: ${payload.template}`);
    
    return {
      success: true,
      messageId: `whatsapp_${Date.now()}`,
      recipientId: recipient.id,
      deliveredAt: new Date()
    };
  }

  /**
   * Send push notification
   */
  private async sendPush(payload: NotificationPayload, recipient: NotificationRecipient): Promise<NotificationResult> {
    // Push notification implementation would go here
    console.log(`🔔 Push to ${recipient.id}: ${payload.template}`);
    
    return {
      success: true,
      messageId: `push_${Date.now()}`,
      recipientId: recipient.id,
      deliveredAt: new Date()
    };
  }

  /**
   * Optimize message for African mobile networks
   */
  private optimizeForAfricanNetworks(message: string): string {
    // Ensure message stays under 160 characters for single SMS
    if (message.length <= 160) {
      return message;
    }

    // Truncate and add ellipsis
    return message.substring(0, 157) + '...';
  }

  /**
   * Calculate SMS cost for African networks
   */
  private calculateSMSCost(message: string, phoneNumber: string): number {
    const messageLength = message.length;
    const segmentCount = Math.ceil(messageLength / 160);
    
    // Estimate costs per segment based on African carriers
    const costPerSegment = phoneNumber.startsWith('+237') ? 0.03 : 0.05; // CFA equivalent
    
    return segmentCount * costPerSegment;
  }

  /**
   * Track delivery statistics
   */
  private trackDelivery(template: string, result: NotificationResult): void {
    const templateStats = this.deliveryStats.get(template) || [];
    templateStats.push(result);
    this.deliveryStats.set(template, templateStats);
  }

  /**
   * Get delivery statistics
   */
  getDeliveryStats(template?: string): Record<string, any> {
    if (template) {
      const stats = this.deliveryStats.get(template) || [];
      return this.calculateStats(stats);
    }

    const allStats: Record<string, any> = {};
    for (const [tmpl, results] of this.deliveryStats) {
      allStats[tmpl] = this.calculateStats(results);
    }
    
    return allStats;
  }

  /**
   * Calculate statistics for results
   */
  private calculateStats(results: NotificationResult[]): any {
    const total = results.length;
    const successful = results.filter(r => r.success).length;
    const failed = total - successful;
    const totalCost = results.reduce((sum, r) => sum + (r.cost || 0), 0);

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total * 100).toFixed(2) + '%' : '0%',
      totalCost: totalCost.toFixed(2),
      averageCost: total > 0 ? (totalCost / total).toFixed(3) : '0'
    };
  }

  /**
   * Bulk send notifications
   */
  async sendBulkNotifications(payloads: NotificationPayload[]): Promise<NotificationResult[][]> {
    const results: NotificationResult[][] = [];
    
    // Process in batches to avoid overwhelming African networks
    const batchSize = 10;
    
    for (let i = 0; i < payloads.length; i += batchSize) {
      const batch = payloads.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(payload => this.sendNotification(payload))
      );
      results.push(...batchResults);
      
      // Add small delay between batches for African network stability
      if (i + batchSize < payloads.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}

export default RefactoredNotificationService;
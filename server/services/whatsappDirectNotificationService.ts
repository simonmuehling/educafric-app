/**
 * WhatsApp Direct Notification Service
 * Centralized service for sending direct WhatsApp messages via Business API
 * Handles ALL notification types: absences, grades, payments, geolocation, online classes, timetable, messages
 */

import { whatsappService } from './whatsappService';
import { getSupportPhone } from '../config/platformConfig';

export interface WhatsAppDirectMessage {
  recipientPhone: string; // E.164 format (e.g., +237656200472)
  notificationType: 'absence' | 'grade' | 'payment' | 'message' | 'geolocation' | 'online_class' | 'timetable';
  data: Record<string, any>;
  language?: 'fr' | 'en';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  recipientPhone: string;
  timestamp: string;
}

class WhatsAppDirectNotificationService {
  private static instance: WhatsAppDirectNotificationService;
  private stats = {
    totalSent: 0,
    successful: 0,
    failed: 0,
    byType: {
      absence: 0,
      grade: 0,
      payment: 0,
      message: 0,
      geolocation: 0,
      online_class: 0,
      timetable: 0,
      emergency: 0
    }
  };

  private constructor() {
    console.log('[WHATSAPP_DIRECT] ✅ WhatsApp Direct Notification Service initialized');
  }

  static getInstance(): WhatsAppDirectNotificationService {
    if (!WhatsAppDirectNotificationService.instance) {
      WhatsAppDirectNotificationService.instance = new WhatsAppDirectNotificationService();
    }
    return WhatsAppDirectNotificationService.instance;
  }

  /**
   * Send notification for ABSENCE/RETARD
   */
  async sendAbsenceNotification(params: {
    recipientPhone: string;
    studentName: string;
    date: string;
    period: string;
    reason: string;
    schoolName: string;
    language?: 'fr' | 'en';
  }): Promise<WhatsAppSendResult> {
    console.log(`[WHATSAPP_DIRECT] 📚 Sending absence notification to ${params.recipientPhone}`);
    
    const data = {
      studentName: params.studentName,
      date: params.date,
      period: params.period,
      reason: params.reason,
      monthlyTotal: '2', // TODO: Get from database
      schoolPhone: getSupportPhone(),
      schoolName: params.schoolName
    };

    return await this.sendEducationNotification(params.recipientPhone, 'absence', data, params.language);
  }

  /**
   * Send notification for GRADES/NOTES
   */
  async sendGradeNotification(params: {
    recipientPhone: string;
    studentName: string;
    subjectName: string;
    grade: string;
    teacherName: string;
    classAverage?: string;
    trend?: string;
    comment?: string;
    schoolName: string;
    language?: 'fr' | 'en';
  }): Promise<WhatsAppSendResult> {
    console.log(`[WHATSAPP_DIRECT] 📊 Sending grade notification to ${params.recipientPhone}`);
    
    const data = {
      studentName: params.studentName,
      subjectName: params.subjectName,
      grade: params.grade,
      teacherName: params.teacherName,
      classAverage: params.classAverage || 'N/A',
      trend: params.trend || '→',
      comment: params.comment || '',
      schoolName: params.schoolName
    };

    return await this.sendEducationNotification(params.recipientPhone, 'grade', data, params.language);
  }

  /**
   * Send notification for PAYMENTS/PAIEMENTS
   */
  async sendPaymentNotification(params: {
    recipientPhone: string;
    studentName: string;
    amount: string;
    dueDate: string;
    paymentType: string;
    schoolPhone: string;
    schoolName: string;
    language?: 'fr' | 'en';
  }): Promise<WhatsAppSendResult> {
    console.log(`[WHATSAPP_DIRECT] 💳 Sending payment notification to ${params.recipientPhone}`);
    
    const data = {
      studentName: params.studentName,
      amount: params.amount,
      dueDate: params.dueDate,
      paymentType: params.paymentType,
      schoolPhone: params.schoolPhone,
      schoolName: params.schoolName
    };

    return await this.sendEducationNotification(params.recipientPhone, 'payment', data, params.language);
  }

  /**
   * Send notification for GEOLOCATION ALERTS
   */
  async sendGeolocationAlert(params: {
    recipientPhone: string;
    studentName: string;
    alertType: string;
    location: string;
    timestamp: string;
    zoneName?: string;
    language?: 'fr' | 'en';
  }): Promise<WhatsAppSendResult> {
    console.log(`[WHATSAPP_DIRECT] 📍 Sending geolocation alert to ${params.recipientPhone}`);
    
    // Build custom message for geolocation (not in standard templates)
    const messageFr = `🚨 Alerte GPS - ${params.studentName}

Type: ${params.alertType}
${params.zoneName ? `Zone: ${params.zoneName}` : ''}
Position: ${params.location}
Heure: ${params.timestamp}

Pour plus de détails, consultez l'app Educafric.

Support: ${getSupportPhone()}`;

    const messageEn = `🚨 GPS Alert - ${params.studentName}

Type: ${params.alertType}
${params.zoneName ? `Zone: ${params.zoneName}` : ''}
Location: ${params.location}
Time: ${params.timestamp}

For more details, check the Educafric app.

Support: ${getSupportPhone()}`;

    const message = params.language === 'en' ? messageEn : messageFr;

    return await this.sendCustomMessage(params.recipientPhone, message);
  }

  /**
   * Send notification for ONLINE CLASSES
   */
  async sendOnlineClassNotification(params: {
    recipientPhone: string;
    studentName: string;
    courseName: string;
    teacherName: string;
    startTime: string;
    duration: string;
    joinLink: string;
    language?: 'fr' | 'en';
  }): Promise<WhatsAppSendResult> {
    console.log(`[WHATSAPP_DIRECT] 🎥 Sending online class notification to ${params.recipientPhone}`);
    
    const messageFr = `🎥 Cours en Ligne - ${params.studentName}

📚 Cours: ${params.courseName}
👨‍🏫 Professeur: ${params.teacherName}
⏰ Début: ${params.startTime}
⏱️ Durée: ${params.duration}

🔗 Rejoindre le cours:
${params.joinLink}

Support: ${getSupportPhone()}`;

    const messageEn = `🎥 Online Class - ${params.studentName}

📚 Course: ${params.courseName}
👨‍🏫 Teacher: ${params.teacherName}
⏰ Start: ${params.startTime}
⏱️ Duration: ${params.duration}

🔗 Join class:
${params.joinLink}

Support: ${getSupportPhone()}`;

    const message = params.language === 'en' ? messageEn : messageFr;

    return await this.sendCustomMessage(params.recipientPhone, message);
  }

  /**
   * Send notification for TIMETABLE CHANGES
   */
  async sendTimetableNotification(params: {
    recipientPhone: string;
    studentName: string;
    changeType: string;
    subject: string;
    oldTime?: string;
    newTime?: string;
    className: string;
    teacherName: string;
    language?: 'fr' | 'en';
  }): Promise<WhatsAppSendResult> {
    console.log(`[WHATSAPP_DIRECT] 📅 Sending timetable notification to ${params.recipientPhone}`);
    
    const messageFr = `📅 Modification Emploi du Temps - ${params.studentName}

Type: ${params.changeType}
Matière: ${params.subject}
Classe: ${params.className}
Professeur: ${params.teacherName}
${params.oldTime ? `Ancien horaire: ${params.oldTime}` : ''}
${params.newTime ? `Nouvel horaire: ${params.newTime}` : ''}

Consultez l'app Educafric pour voir l'emploi du temps complet.

Support: ${getSupportPhone()}`;

    const messageEn = `📅 Timetable Change - ${params.studentName}

Type: ${params.changeType}
Subject: ${params.subject}
Class: ${params.className}
Teacher: ${params.teacherName}
${params.oldTime ? `Old time: ${params.oldTime}` : ''}
${params.newTime ? `New time: ${params.newTime}` : ''}

Check the Educafric app for the complete schedule.

Support: ${getSupportPhone()}`;

    const message = params.language === 'en' ? messageEn : messageFr;

    return await this.sendCustomMessage(params.recipientPhone, message);
  }

  /**
   * Send EMERGENCY ALERT to parents
   */
  async sendEmergencyAlert(params: {
    recipientPhone: string;
    studentName: string;
    alertType: 'evacuation' | 'lockdown' | 'medical' | 'weather' | 'security' | 'general';
    alertMessage: string;
    schoolName: string;
    instructions?: string;
    language?: 'fr' | 'en';
  }): Promise<WhatsAppSendResult> {
    console.log(`[WHATSAPP_DIRECT] 🚨 Sending EMERGENCY alert to ${params.recipientPhone}`);
    
    const alertTypesFr: Record<string, string> = {
      evacuation: '🚨 ÉVACUATION',
      lockdown: '🔒 CONFINEMENT',
      medical: '🏥 URGENCE MÉDICALE',
      weather: '⛈️ ALERTE MÉTÉO',
      security: '🛡️ ALERTE SÉCURITÉ',
      general: '⚠️ ALERTE GÉNÉRALE'
    };
    
    const alertTypesEn: Record<string, string> = {
      evacuation: '🚨 EVACUATION',
      lockdown: '🔒 LOCKDOWN',
      medical: '🏥 MEDICAL EMERGENCY',
      weather: '⛈️ WEATHER ALERT',
      security: '🛡️ SECURITY ALERT',
      general: '⚠️ GENERAL ALERT'
    };

    const alertLabel = params.language === 'en' ? alertTypesEn[params.alertType] : alertTypesFr[params.alertType];

    const messageFr = `${alertLabel}

🏫 ${params.schoolName}
👤 Concernant: ${params.studentName}

📢 ${params.alertMessage}
${params.instructions ? `\n📋 Instructions: ${params.instructions}` : ''}

⏰ ${new Date().toLocaleString('fr-FR')}

❗ Ceci est une alerte officielle de l'école.
📞 Contact: ${getSupportPhone()}`;

    const messageEn = `${alertLabel}

🏫 ${params.schoolName}
👤 Regarding: ${params.studentName}

📢 ${params.alertMessage}
${params.instructions ? `\n📋 Instructions: ${params.instructions}` : ''}

⏰ ${new Date().toLocaleString('en-US')}

❗ This is an official school alert.
📞 Contact: ${getSupportPhone()}`;

    const message = params.language === 'en' ? messageEn : messageFr;

    return await this.sendCustomMessage(params.recipientPhone, message);
  }

  /**
   * Send BULK emergency alerts to multiple parents
   */
  async sendBulkEmergencyAlerts(params: {
    recipients: Array<{ phone: string; studentName: string }>;
    alertType: 'evacuation' | 'lockdown' | 'medical' | 'weather' | 'security' | 'general';
    alertMessage: string;
    schoolName: string;
    instructions?: string;
    language?: 'fr' | 'en';
  }): Promise<{ sent: number; failed: number; results: WhatsAppSendResult[] }> {
    console.log(`[WHATSAPP_DIRECT] 🚨 Sending BULK emergency alert to ${params.recipients.length} parents`);
    
    const results: WhatsAppSendResult[] = [];
    let sent = 0;
    let failed = 0;

    // Process in batches of 10 to avoid overwhelming network
    const batchSize = 10;
    for (let i = 0; i < params.recipients.length; i += batchSize) {
      const batch = params.recipients.slice(i, i + batchSize);
      
      const batchPromises = batch.map(recipient => 
        this.sendEmergencyAlert({
          recipientPhone: recipient.phone,
          studentName: recipient.studentName,
          alertType: params.alertType,
          alertMessage: params.alertMessage,
          schoolName: params.schoolName,
          instructions: params.instructions,
          language: params.language
        })
      );

      const batchResults = await Promise.all(batchPromises);
      
      for (const result of batchResults) {
        results.push(result);
        if (result.success) {
          sent++;
        } else {
          failed++;
        }
      }

      // Small delay between batches for African network stability
      if (i + batchSize < params.recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`[WHATSAPP_DIRECT] 🚨 Bulk emergency complete: ${sent} sent, ${failed} failed`);
    return { sent, failed, results };
  }

  /**
   * Send notification for MESSAGES BETWEEN PROFILES
   */
  async sendDirectMessage(params: {
    recipientPhone: string;
    senderName: string;
    senderRole: string;
    messagePreview: string;
    language?: 'fr' | 'en';
  }): Promise<WhatsAppSendResult> {
    console.log(`[WHATSAPP_DIRECT] 💬 Sending direct message notification to ${params.recipientPhone}`);
    
    const messageFr = `💬 Nouveau Message - Educafric

De: ${params.senderName} (${params.senderRole})

"${params.messagePreview}"

Répondez via l'app Educafric.

Support: ${getSupportPhone()}`;

    const messageEn = `💬 New Message - Educafric

From: ${params.senderName} (${params.senderRole})

"${params.messagePreview}"

Reply via the Educafric app.

Support: ${getSupportPhone()}`;

    const message = params.language === 'en' ? messageEn : messageFr;

    return await this.sendCustomMessage(params.recipientPhone, message);
  }

  /**
   * Core method: Send education notification via WhatsApp Business API
   */
  private async sendEducationNotification(
    recipientPhone: string,
    type: string,
    data: Record<string, any>,
    language: 'fr' | 'en' = 'fr'
  ): Promise<WhatsAppSendResult> {
    try {
      const result = await whatsappService.sendEducationNotification(recipientPhone, type, data, language);
      
      this.stats.totalSent++;
      if (result.success) {
        this.stats.successful++;
        this.stats.byType[type as keyof typeof this.stats.byType]++;
      } else {
        this.stats.failed++;
      }

      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        recipientPhone,
        timestamp: result.timestamp || new Date().toISOString()
      };
    } catch (error) {
      this.stats.totalSent++;
      this.stats.failed++;
      
      console.error(`[WHATSAPP_DIRECT] ❌ Error sending to ${recipientPhone}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        recipientPhone,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Core method: Send custom message via WhatsApp Business API
   */
  private async sendCustomMessage(
    recipientPhone: string,
    message: string
  ): Promise<WhatsAppSendResult> {
    try {
      const result = await whatsappService['sendMessage'](recipientPhone, message);
      
      this.stats.totalSent++;
      if (result.success) {
        this.stats.successful++;
      } else {
        this.stats.failed++;
      }

      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        recipientPhone,
        timestamp: result.timestamp || new Date().toISOString()
      };
    } catch (error) {
      this.stats.totalSent++;
      this.stats.failed++;
      
      console.error(`[WHATSAPP_DIRECT] ❌ Error sending custom message to ${recipientPhone}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        recipientPhone,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalSent > 0 
        ? ((this.stats.successful / this.stats.totalSent) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalSent: 0,
      successful: 0,
      failed: 0,
      byType: {
        absence: 0,
        grade: 0,
        payment: 0,
        message: 0,
        geolocation: 0,
        online_class: 0,
        timetable: 0,
        emergency: 0
      }
    };
  }
}

export const whatsappDirectService = WhatsAppDirectNotificationService.getInstance();
export default WhatsAppDirectNotificationService;

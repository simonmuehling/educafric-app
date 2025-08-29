import { Vonage } from '@vonage/server-sdk';
import { Auth } from '@vonage/auth';

interface VonageConfig {
  apiKey: string;
  apiSecret: string;
  applicationId?: string;
  privateKey?: string;
}

interface WhatsAppMessageRequest {
  from: string;
  to: string;
  text: string;
  messageType?: 'text' | 'template';
  channel?: 'whatsapp';
}

interface MessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}

class VonageMessagesService {
  private vonage?: Vonage;
  private config: VonageConfig;
  private defaultFrom: string = '14157386102'; // Default from number from your cURL example
  
  // Your registered WhatsApp Business accounts with Vonage
  private whatsappAccounts = {
    account1: '41783009720', // Findusthere
    account2: '41783044077'  // Findusthere (with application linked)
  };

  constructor() {
    this.config = {
      apiKey: process.env.VONAGE_API_KEY || '',
      apiSecret: process.env.VONAGE_API_SECRET || '',
      applicationId: process.env.VONAGE_APPLICATION_ID || '',
      privateKey: process.env.VONAGE_PRIVATE_KEY || ''
    };

    if (!this.config.apiKey || !this.config.apiSecret) {
      console.warn('[VONAGE] API credentials not configured');
      return;
    }

    try {
      this.vonage = new Vonage(new Auth({
        apiKey: this.config.apiKey,
        apiSecret: this.config.apiSecret
      }));
      console.log('[VONAGE] Messages service initialized successfully');
    } catch (error) {
      console.error('[VONAGE] Failed to initialize service:', error);
    }
  }

  // Check if Vonage service is properly configured
  async getServiceHealth() {
    const configured = !!(this.config.apiKey && this.config.apiSecret);

    if (!configured) {
      return {
        configured: false,
        message: 'Vonage Messages API not configured. Please add VONAGE_API_KEY and VONAGE_API_SECRET.',
        missingVars: [
          !this.config.apiKey && 'VONAGE_API_KEY',
          !this.config.apiSecret && 'VONAGE_API_SECRET'
        ].filter(Boolean)
      };
    }

    try {
      // Test API connection by checking account balance
      const response = await this.vonage!.accounts.getBalance();
      return {
        configured: true,
        connected: true,
        balance: response.value,
        autoReload: response.autoReload,
        message: 'Vonage Messages API connected successfully'
      };
    } catch (error) {
      return {
        configured: true,
        connected: false,
        message: 'API credentials configured but connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send WhatsApp message using Vonage Messages API
  async sendWhatsAppMessage(request: WhatsAppMessageRequest): Promise<MessageResponse> {
    if (!this.vonage) {
      throw new Error('Vonage service not initialized. Please check API credentials.');
    }

    try {
      // Clean phone numbers - remove any + or spaces, ensure proper format
      const cleanTo = request.to.replace(/[\s+\-()]/g, '');
      const fromNumber = request.from || this.whatsappAccounts.account2 || this.defaultFrom;
      
      const messageRequest = {
        from: fromNumber,
        to: cleanTo,
        message_type: 'text',
        text: request.text,
        channel: 'whatsapp'
      } as any;

      console.log('[VONAGE] Sending WhatsApp message:', {
        from: messageRequest.from,
        to: messageRequest.to,
        channel: messageRequest.channel,
        message_type: messageRequest.message_type
      });

      const response = await this.vonage!.messages.send(messageRequest);
      
      return {
        success: true,
        messageId: response.messageUUID,
        details: {
          from: messageRequest.from,
          to: messageRequest.to,
          channel: messageRequest.channel,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('[VONAGE] WhatsApp message failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending message',
        details: {
          from: request.from,
          to: request.to,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Send simple text message (like your cURL example)
  async sendSimpleMessage(to: string, text: string, from?: string): Promise<MessageResponse> {
    // Use your registered WhatsApp account by default
    const fromNumber = from || this.whatsappAccounts.account2 || this.defaultFrom;
    
    return this.sendWhatsAppMessage({
      from: fromNumber,
      to: to,
      text: text,
      messageType: 'text',
      channel: 'whatsapp'
    });
  }

  // Send SMS direct (not WhatsApp)
  async sendDirectSMS(to: string, text: string, from?: string): Promise<MessageResponse> {
    if (!this.vonage) {
      throw new Error('Vonage service not initialized. Please check API credentials.');
    }

    try {
      // Clean phone numbers - remove any + or spaces, ensure proper format
      const cleanTo = to.replace(/[\s+\-()]/g, '');
      const fromNumber = from || 'Educafric'; // Use text sender ID for SMS
      
      console.log('[VONAGE] Sending SMS message:', {
        from: fromNumber,
        to: cleanTo,
        type: 'SMS'
      });

      const response = await this.vonage!.sms.send({
        to: cleanTo,
        from: fromNumber,
        text: text
      });
      
      if (response.messages[0].status === '0') {
        return {
          success: true,
          messageId: response.messages[0]['message-id'],
          details: {
            from: fromNumber,
            to: cleanTo,
            channel: 'sms',
            cost: response.messages[0]['message-price'],
            timestamp: new Date().toISOString()
          }
        };
      } else {
        return {
          success: false,
          error: response.messages[0]['error-text'] || 'SMS sending failed',
          details: {
            from: fromNumber,
            to: cleanTo,
            channel: 'sms',
            errorCode: response.messages[0].status,
            timestamp: new Date().toISOString()
          }
        };
      }
    } catch (error) {
      console.error('[VONAGE] SMS sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending SMS',
        details: {
          from: from || 'Educafric',
          to: to,
          channel: 'sms',
          timestamp: new Date().toISOString()
        }
      };
    }
  }
  
  // Get available WhatsApp accounts
  getWhatsAppAccounts() {
    return {
      accounts: this.whatsappAccounts,
      default: this.whatsappAccounts.account2,
      recommended: 'account2 (has application linked)'
    };
  }

  // Send educational notification via Vonage
  async sendEducationNotification(phoneNumber: string, type: string, data: any, language: 'fr' | 'en' = 'fr'): Promise<MessageResponse> {
    const templates = this.getEducationTemplates(language);
    const template = templates[type as keyof typeof templates];
    
    if (!template) {
      throw new Error(`Unknown education notification type: ${type}`);
    }

    const message = this.interpolateTemplate(template, data);
    return this.sendSimpleMessage(phoneNumber, message);
  }

  // Send commercial message via Vonage
  async sendCommercialMessage(phoneNumber: string, type: string, data: any, language: 'fr' | 'en' = 'fr'): Promise<MessageResponse> {
    const templates = this.getCommercialTemplates(language);
    const template = templates[type as keyof typeof templates];
    
    if (!template) {
      throw new Error(`Unknown commercial message type: ${type}`);
    }

    const message = this.interpolateTemplate(template, data);
    return this.sendSimpleMessage(phoneNumber, message);
  }

  // Message templates for educational notifications (French)
  private getEducationTemplates(language: 'fr' | 'en') {
    if (language === 'en') {
      return {
        grade: `📚 New Grade - {{studentName}}

{{subjectName}}: {{grade}}/20
Teacher: {{teacherName}}

📊 Class Average: {{classAverage}}/20
📈 Progress: {{trend}}

💬 Comment: "{{comment}}"

View details on Educafric:
https://www.educafric.com/grades

{{schoolName}}`,

        absence: `⚠️ Absence Alert - {{studentName}}

Date: {{date}}
Period: {{period}}
Reason: {{reason}}

Monthly Total: {{monthlyTotal}} absences

{{schoolName}}
Contact: {{schoolPhone}}`,

        payment: `💳 Payment Reminder

Student: {{studentName}}
Amount: {{amount}} CFA
Due Date: {{dueDate}}
Type: {{paymentType}}

Pay online: https://www.educafric.com/payments

{{schoolName}}`
      };
    }

    return {
      grade: `📚 Nouvelle Note - {{studentName}}

{{subjectName}}: {{grade}}/20
Professeur: {{teacherName}}

📊 Moyenne classe: {{classAverage}}/20
📈 Évolution: {{trend}}

💬 Commentaire: "{{comment}}"

Consultez les détails sur Educafric:
https://www.educafric.com/grades

{{schoolName}}`,

      absence: `⚠️ Alerte Absence - {{studentName}}

Date: {{date}}
Période: {{period}}
Motif: {{reason}}

Total mensuel: {{monthlyTotal}} absences

{{schoolName}}
Contact: {{schoolPhone}}`,

      payment: `💳 Rappel de Paiement

Élève: {{studentName}}
Montant: {{amount}} CFA
Échéance: {{dueDate}}
Type: {{paymentType}}

Payer en ligne: https://www.educafric.com/payments

{{schoolName}}`
    };
  }

  // Commercial message templates
  private getCommercialTemplates(language: 'fr' | 'en') {
    if (language === 'en') {
      return {
        welcome: `🎓 Welcome to Educafric!

Hello {{contactName}},

Thank you for your interest in the African educational platform Educafric. We're excited to support {{companyName}} in your digital transformation.

🌟 Our solutions include:
• Complete school management
• Smart academic tracking  
• Parent-school communication
• Secure geolocation
• Multilingual support (French/English)

📱 Personal demo: {{demoLink}}
💬 Questions? Reply to this message

Best regards,
The Educafric Team
+237 656 200 472`,

        demo: `📱 Your Educafric Demo Access

Hello {{contactName}},

Your personalized demo for {{companyName}} is ready:

🔗 Demo link: {{demoLink}}
👤 Login: demo@{{companyName}}.com
🔑 Password: educafric2025

This demo includes all premium features. Valid for 30 days.

Questions? Contact us:
+237 656 200 472

The Educafric Team`
      };
    }

    return {
      welcome: `🎓 Bienvenue chez Educafric!

Bonjour {{contactName}},

Merci de votre intérêt pour la plateforme éducative africaine Educafric. Nous sommes ravis d'accompagner {{companyName}} dans votre transformation numérique.

🌟 Nos solutions incluent:
• Gestion complète d'école
• Suivi académique intelligent
• Communication parents-école
• Géolocalisation sécurisée
• Support multilingue (Français/Anglais)

📱 Démo personnalisée: {{demoLink}}
💬 Questions? Répondez à ce message

Cordialement,
L'équipe Educafric
+237 656 200 472`,

      demo: `📱 Votre Accès Démo Educafric

Bonjour {{contactName}},

Votre démo personnalisée pour {{companyName}} est prête:

🔗 Lien démo: {{demoLink}}
👤 Identifiant: demo@{{companyName}}.com
🔑 Mot de passe: educafric2025

Cette démo inclut toutes les fonctionnalités premium. Valide 30 jours.

Questions? Contactez-nous:
+237 656 200 472

L'équipe Educafric`
    };
  }

  // Template interpolation helper
  private interpolateTemplate(template: string, data: any): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }
}

export const vonageMessagesService = new VonageMessagesService();
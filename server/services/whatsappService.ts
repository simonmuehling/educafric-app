interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookToken: string;
}

interface WhatsAppMessage {
  from: string;
  text?: { body: string };
  type: string;
  timestamp: string;
}

interface MessageData {
  [key: string]: any;
}

interface MessageStats {
  totalSent: number;
  delivered: number;
  read: number;
  failed: number;
  period: string;
}

class WhatsAppService {
  private config: WhatsAppConfig;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor() {
    this.config = {
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
      webhookToken: process.env.WHATSAPP_WEBHOOK_TOKEN || 'educafric_whatsapp_webhook_2025'
    };
  }

  // Check if WhatsApp service is properly configured
  async getServiceHealth() {
    const configured = !!(
      this.config.accessToken && 
      this.config.phoneNumberId && 
      this.config.businessAccountId
    );

    if (!configured) {
      return {
        configured: false,
        message: 'WhatsApp Business API not configured. Please add environment variables.',
        missingVars: [
          !this.config.accessToken && 'WHATSAPP_ACCESS_TOKEN',
          !this.config.phoneNumberId && 'WHATSAPP_PHONE_NUMBER_ID',
          !this.config.businessAccountId && 'WHATSAPP_BUSINESS_ACCOUNT_ID'
        ].filter(Boolean)
      };
    }

    try {
      // Test API connection by getting phone number info
      const response = await fetch(`${this.baseUrl}/${this.config.phoneNumberId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const phoneInfo = await response.json();
        return {
          configured: true,
          connected: true,
          phoneNumber: phoneInfo.display_phone_number,
          status: phoneInfo.status,
          message: 'WhatsApp Business API connected successfully'
        };
      } else {
        return {
          configured: true,
          connected: false,
          message: 'API credentials configured but connection failed',
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        configured: true,
        connected: false,
        message: 'API connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send commercial message (welcome, demo, pricing, etc.)
  async sendCommercialMessage(phoneNumber: string, type: string, data: MessageData, language: 'fr' | 'en' = 'fr') {
    if (!this.config.accessToken || !this.config.phoneNumberId) {
      throw new Error('WhatsApp service not configured. Please check environment variables.');
    }

    const templates = this.getCommercialTemplates(language);
    const template = templates[type as keyof typeof templates];
    
    if (!template) {
      throw new Error(`Unknown commercial message type: ${type}`);
    }

    const message = this.interpolateTemplate(template, data);
    
    return await this.sendMessage(phoneNumber, message);
  }

  // Send educational notification (grades, attendance, payments, etc.)
  async sendEducationNotification(phoneNumber: string, type: string, data: MessageData, language: 'fr' | 'en' = 'fr') {
    if (!this.config.accessToken || !this.config.phoneNumberId) {
      throw new Error('WhatsApp service not configured. Please check environment variables.');
    }

    const templates = this.getEducationTemplates(language);
    const template = templates[type as keyof typeof templates];
    
    if (!template) {
      throw new Error(`Unknown education notification type: ${type}`);
    }

    const message = this.interpolateTemplate(template, data);
    
    return await this.sendMessage(phoneNumber, message);
  }

  // Core message sending function
  private async sendMessage(phoneNumber: string, message: string) {
    try {
      const response = await fetch(`${this.baseUrl}/${this.config.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: {
            body: message
          }
        })
      });

      const result = await response.json();

      if (response.ok) {
        console.log(`[WhatsApp] Message sent successfully to ${phoneNumber}`);
        return {
          success: true,
          messageId: result.messages?.[0]?.id,
          phoneNumber,
          timestamp: new Date().toISOString()
        };
      } else {
        console.error(`[WhatsApp] Failed to send message:`, result);
        return {
          success: false,
          error: result.error?.message || 'Failed to send message',
          errorCode: result.error?.code,
          phoneNumber
        };
      }
    } catch (error) {
      console.error(`[WhatsApp] Message sending error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        phoneNumber
      };
    }
  }

  // Handle incoming messages from webhook
  async handleIncomingMessage(message: any) {
    console.log('[WhatsApp] Incoming message:', {
      from: message.from,
      type: message.type,
      timestamp: message.timestamp
    });

    // Auto-reply logic
    if (message.type === 'text') {
      const text = message.text.body.toLowerCase();
      
      if (text.includes('demo') || text.includes('démo')) {
        await this.sendMessage(message.from, 
          'Merci pour votre intérêt! Accédez à votre démo Educafric ici: https://www.educafric.com/demo\n\nThank you for your interest! Access your Educafric demo here: https://www.educafric.com/demo'
        );
      } else if (text.includes('prix') || text.includes('price') || text.includes('tarif')) {
        await this.sendMessage(message.from,
          '💰 Tarifs Educafric:\n• Parents: 1.000-1.500 CFA/mois\n• Écoles: 50.000 CFA/an\n• Enseignants: 12.500-25.000 CFA\n\nDemandez un devis personnalisé: +237 656 200 472'
        );
      } else {
        await this.sendMessage(message.from,
          'Bonjour! Merci de nous contacter. Un membre de notre équipe Educafric vous répondra bientôt.\n\nHello! Thank you for contacting us. An Educafric team member will respond to you soon.'
        );
      }
    }
  }

  // Handle message status updates (delivered, read, failed)
  async handleMessageStatus(status: any) {
    console.log('[WhatsApp] Message status update:', {
      messageId: status.id,
      status: status.status,
      timestamp: status.timestamp
    });

    // Update message status in database (implement based on your storage)
    // This is where you would update your message tracking database
  }

  // Get message statistics
  async getMessageStats(startDate?: string, endDate?: string): Promise<MessageStats> {
    // In a real implementation, this would query your database
    // For now, return mock stats
    return {
      totalSent: 47,
      delivered: 43,
      read: 31,
      failed: 4,
      period: `${startDate || '2025-01-01'} to ${endDate || '2025-01-24'}`
    };
  }

  // Get conversation history
  async getConversationHistory(phoneNumber: string, limit: number = 50) {
    // In a real implementation, this would query your database
    // For now, return mock conversation data
    return [
      {
        id: '1',
        from: phoneNumber,
        to: this.config.phoneNumberId,
        message: 'Bonjour, je suis intéressé par Educafric',
        timestamp: '2025-01-24T10:30:00Z',
        direction: 'inbound'
      },
      {
        id: '2',
        from: this.config.phoneNumberId,
        to: phoneNumber,
        message: 'Bonjour! Merci pour votre interest. Voici votre lien de démo...',
        timestamp: '2025-01-24T10:35:00Z',
        direction: 'outbound'
      }
    ];
  }

  // Commercial message templates
  private getCommercialTemplates(language: 'fr' | 'en') {
    if (language === 'fr') {
      return {
        welcome: `🎓 Bienvenue chez Educafric!

Bonjour {{contactName}},

Merci de votre intérêt pour la plateforme éducative africaine Educafric. Nous sommes ravis de vous accompagner dans la transformation numérique de {{companyName}}.

🌟 Nos solutions incluent:
• Gestion complète d'école
• Suivi académique intelligent
• Communication parents-école
• Géolocalisation sécurisée
• Support multilingue (Français/Anglais)

📱 Démo personnalisée: https://www.educafric.com/demo
💬 Questions? Répondez à ce message

Cordialement,
L'équipe Educafric
+237 656 200 472`,

        demo: `🎯 Votre Démo Educafric est Prête!

Bonjour {{contactName}},

Votre démo personnalisée Educafric est maintenant accessible. Découvrez comment notre plateforme peut transformer l'éducation de {{companyName}}.

🔗 Accédez à votre démo: {{demoLink}}

✨ Ce que vous pourrez tester:
• Interface d'administration
• Dashboards étudiants/parents
• Système de communication
• Suivi GPS des élèves
• Gestion des paiements

⏰ Durée: 30 minutes
🆓 Accès: Gratuit pendant 7 jours

Besoin d'aide? Répondez à ce message!

L'équipe Educafric`,

        pricing: `💰 Tarifs Educafric - Offre Spéciale Cameroun

Bonjour {{contactName}},

Voici nos tarifs préférentiels pour le marché camerounais:

🏫 ÉCOLES:
• Plan Complet: 50.000 CFA/an
• Formation équipe incluse
• Support technique professionnel

👨‍👩‍👧‍👦 PARENTS:
• École Publique: 1.000 CFA/mois
• École Privée: 1.500 CFA/mois
• Réductions famille: -20% (2 enfants), -40% (3+)

👨‍🏫 ENSEIGNANTS:
• Semestre: 12.500 CFA
• Année: 25.000 CFA (2 mois gratuits)

💬 Devis personnalisé: +237 656 200 472
📧 Email: commercial@educafric.com

Valable jusqu'au 31 décembre 2025!`,

        follow_up: `🔔 Suivi - Votre projet éducatif avec Educafric

Bonjour {{contactName}},

Cela fait {{daysSince}} jours depuis notre dernière conversation concernant l'intégration d'Educafric à {{companyName}}.

📊 Où en êtes-vous dans votre réflexion?
• Avez-vous pu tester notre démo?
• Des questions sur les fonctionnalités?
• Besoin d'une présentation équipe?

🤝 Nous restons disponibles pour:
• Démonstration personnalisée
• Devis adapté à vos besoins
• Support technique gratuit

Répondez à ce message ou appelez-nous: +237 656 200 472

Cordialement,
L'équipe commerciale Educafric`,

        support: `🛠️ Support Technique Educafric

Bonjour {{contactName}},

Nous avons bien reçu votre demande concernant: {{issueType}}

Notre équipe technique vous contactera dans les 2 heures ouvrables pour résoudre votre problème.

📧 Référence: #EDU{{ticketId}}
⏰ Délai de résolution: 24h maximum

En cas d'urgence:
📞 +237 656 200 472
📧 support@educafric.com

Merci de votre confiance!
Support Technique Educafric`
      };
    } else {
      return {
        welcome: `🎓 Welcome to Educafric!

Hello {{contactName}},

Thank you for your interest in Educafric, the African educational platform. We're excited to help transform {{companyName}}'s digital education experience.

🌟 Our solutions include:
• Complete school management
• Intelligent academic tracking
• Parent-school communication
• Secure geolocation
• Multilingual support (French/English)

📱 Personalized demo: https://www.educafric.com/demo
💬 Questions? Reply to this message

Best regards,
The Educafric Team
+237 656 200 472`,

        demo: `🎯 Your Educafric Demo is Ready!

Hello {{contactName}},

Your personalized Educafric demo is now accessible. Discover how our platform can transform education at {{companyName}}.

🔗 Access your demo: {{demoLink}}

✨ What you can test:
• Administration interface
• Student/parent dashboards
• Communication system
• Student GPS tracking
• Payment management

⏰ Duration: 30 minutes
🆓 Access: Free for 7 days

Need help? Reply to this message!

The Educafric Team`,

        pricing: `💰 Educafric Pricing - Special Cameroon Offer

Hello {{contactName}},

Here are our preferential rates for the Cameroonian market:

🏫 SCHOOLS:
• Complete Plan: 50,000 CFA/year
• 1 month free trial
• Team training included

👨‍👩‍👧‍👦 PARENTS:
• Public School: 1,000 CFA/month
• Private School: 1,500 CFA/month
• Family discounts: -20% (2 children), -40% (3+)

👨‍🏫 TEACHERS:
• Semester: 12,500 CFA
• Year: 25,000 CFA (2 months free)

💬 Custom quote: +237 656 200 472
📧 Email: commercial@educafric.com

Valid until December 31, 2025!`,

        follow_up: `🔔 Follow-up - Your educational project with Educafric

Hello {{contactName}},

It's been {{daysSince}} days since our last conversation about integrating Educafric at {{companyName}}.

📊 Where are you in your thinking process?
• Were you able to test our demo?
• Any questions about features?
• Need a team presentation?

🤝 We remain available for:
• Personalized demonstration
• Quote adapted to your needs
• Free technical support

Reply to this message or call us: +237 656 200 472

Best regards,
Educafric Sales Team`,

        support: `🛠️ Educafric Technical Support

Hello {{contactName}},

We have received your request regarding: {{issueType}}

Our technical team will contact you within 2 business hours to resolve your issue.

📧 Reference: #EDU{{ticketId}}
⏰ Resolution time: 24h maximum

In case of emergency:
📞 +237 656 200 472
📧 support@educafric.com

Thank you for your trust!
Educafric Technical Support`
      };
    }
  }

  // Educational notification templates
  private getEducationTemplates(language: 'fr' | 'en') {
    if (language === 'fr') {
      return {
        grade: `📚 Nouvelle Note - {{studentName}}

{{subjectName}}: {{grade}}/20
Professeur: {{teacherName}}

📊 Moyenne classe: {{classAverage}}/20
📈 Évolution: {{trend}}

💬 Commentaire: "{{comment}}"

Consultez tous les détails sur Educafric:
https://www.educafric.com/grades

École {{schoolName}}`,

        absence: `⚠️ Absence Signalée - {{studentName}}

Date: {{date}}
Période: {{period}}
Motif: {{reason}}

Total absences ce mois: {{monthlyTotal}}

Merci de justifier cette absence via:
📱 App Educafric
📞 {{schoolPhone}}

École {{schoolName}}`,

        payment: `💳 Rappel Paiement - {{studentName}}

Montant dû: {{amount}} CFA
Échéance: {{dueDate}}
Catégorie: {{paymentType}}

💳 Paiement sécurisé: https://educafric.com/payments
🏪 Ou en espèces à l'école

Questions? Contactez l'administration:
📞 {{schoolPhone}}

École {{schoolName}}`,

        announcement: `📢 {{title}}

{{message}}

Date: {{date}}
Concerne: {{audience}}

Plus d'infos: https://educafric.com/announcements

École {{schoolName}}
📞 {{schoolPhone}}`,

        meeting: `🤝 Convocation Réunion - {{studentName}}

Objet: {{meetingSubject}}
Date: {{meetingDate}}
Heure: {{meetingTime}}
Lieu: {{location}}

Participants requis:
{{participants}}

Confirmez votre présence:
📱 App Educafric
📞 {{schoolPhone}}

École {{schoolName}}`,

        emergency: `🚨 ALERTE URGENTE - {{studentName}}

{{emergencyMessage}}

Action requise: {{actionRequired}}
Contact immédiat: {{emergencyContact}}

École {{schoolName}}
📞 {{schoolPhone}}`
      };
    } else {
      return {
        grade: `📚 New Grade - {{studentName}}

{{subjectName}}: {{grade}}/20
Teacher: {{teacherName}}

📊 Class average: {{classAverage}}/20
📈 Trend: {{trend}}

💬 Comment: "{{comment}}"

View all details on Educafric:
https://educafric.com/grades

{{schoolName}} School`,

        absence: `⚠️ Absence Reported - {{studentName}}

Date: {{date}}
Period: {{period}}
Reason: {{reason}}

Total absences this month: {{monthlyTotal}}

Please justify this absence via:
📱 Educafric App
📞 {{schoolPhone}}

{{schoolName}} School`,

        payment: `💳 Payment Reminder - {{studentName}}

Amount due: {{amount}} CFA
Due date: {{dueDate}}
Category: {{paymentType}}

💳 Secure payment: https://www.educafric.com/payments
🏪 Or cash at school

Questions? Contact administration:
📞 {{schoolPhone}}

{{schoolName}} School`,

        announcement: `📢 {{title}}

{{message}}

Date: {{date}}
Concerns: {{audience}}

More info: https://www.educafric.com/announcements

{{schoolName}} School
📞 {{schoolPhone}}`,

        meeting: `🤝 Meeting Request - {{studentName}}

Subject: {{meetingSubject}}
Date: {{meetingDate}}
Time: {{meetingTime}}
Location: {{location}}

Required participants:
{{participants}}

Confirm your attendance:
📱 Educafric App
📞 {{schoolPhone}}

{{schoolName}} School`,

        emergency: `🚨 URGENT ALERT - {{studentName}}

{{emergencyMessage}}

Action required: {{actionRequired}}
Immediate contact: {{emergencyContact}}

{{schoolName}} School
📞 {{schoolPhone}}`
      };
    }
  }

  // Template interpolation helper
  private interpolateTemplate(template: string, data: MessageData): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }
}

export const whatsappService = new WhatsAppService();
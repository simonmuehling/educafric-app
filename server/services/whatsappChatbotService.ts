// ===== WHATSAPP CHATBOT SERVICE =====
// Service intelligent pour gérer les conversations WhatsApp automatiques

import { db } from '../db';
import {
  whatsappConversations,
  whatsappMessages,
  whatsappFaqKnowledge,
  whatsappQuickReplies
} from '@shared/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { whatsappService } from './whatsappService';

interface ChatbotResponse {
  message: string;
  confidence: number;
  intent: string;
}

class WhatsAppChatbotService {
  private static instance: WhatsAppChatbotService;
  
  private constructor() {
    console.log('[CHATBOT] ✅ WhatsApp Chatbot Service initialized');
    this.initializeDefaultFAQs();
  }

  static getInstance(): WhatsAppChatbotService {
    if (!WhatsAppChatbotService.instance) {
      WhatsAppChatbotService.instance = new WhatsAppChatbotService();
    }
    return WhatsAppChatbotService.instance;
  }

  // ===== PROCESS INCOMING MESSAGE =====
  async processIncomingMessage(fromNumber: string, messageText: string): Promise<void> {
    try {
      // Get or create conversation
      const conversation = await this.getOrCreateConversation(fromNumber);
      
      // Save incoming message
      await this.saveMessage({
        conversationId: conversation.id,
        direction: 'inbound',
        fromNumber,
        toNumber: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
        content: messageText,
        messageType: 'text',
        isBot: false
      });

      // Detect intent and generate response
      const response = await this.generateResponse(messageText);
      
      // Send response
      await whatsappService.sendMessage(fromNumber, response.message);
      
      // Save outbound message
      await this.saveMessage({
        conversationId: conversation.id,
        direction: 'outbound',
        fromNumber: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
        toNumber: fromNumber,
        content: response.message,
        messageType: 'text',
        isBot: true,
        intent: response.intent,
        intentConfidence: response.confidence
      });

      // Update conversation
      await this.updateConversation(conversation.id);

    } catch (error) {
      console.error('[CHATBOT] Error processing message:', error);
    }
  }

  // ===== GENERATE INTELLIGENT RESPONSE =====
  private async generateResponse(messageText: string): Promise<ChatbotResponse> {
    const text = messageText.toLowerCase().trim();
    
    // Check for quick replies first (highest priority)
    const quickReply = await this.findQuickReply(text);
    if (quickReply) {
      return {
        message: quickReply.responseText,
        confidence: 100,
        intent: quickReply.category
      };
    }

    // Check FAQ knowledge base
    const faqResponse = await this.searchFAQ(text);
    if (faqResponse) {
      return faqResponse;
    }

    // Default response for unknown queries
    return {
      message: this.getDefaultResponse(text),
      confidence: 0,
      intent: 'unknown'
    };
  }

  // ===== FIND QUICK REPLY =====
  private async findQuickReply(text: string) {
    try {
      const replies = await db.select()
        .from(whatsappQuickReplies)
        .where(eq(whatsappQuickReplies.isActive, true));

      for (const reply of replies) {
        if (text.includes(reply.trigger.toLowerCase())) {
          return reply;
        }
      }

      return null;
    } catch (error) {
      console.error('[CHATBOT] Error finding quick reply:', error);
      return null;
    }
  }

  // ===== SEARCH FAQ =====
  private async searchFAQ(text: string): Promise<ChatbotResponse | null> {
    try {
      const faqs = await db.select()
        .from(whatsappFaqKnowledge)
        .where(eq(whatsappFaqKnowledge.isActive, true))
        .orderBy(desc(whatsappFaqKnowledge.priority));

      for (const faq of faqs) {
        const keywords = faq.keywords || [];
        let matchCount = 0;

        // Check if question matches
        if (text.includes(faq.question.toLowerCase())) {
          return {
            message: faq.answer,
            confidence: 95,
            intent: faq.category
          };
        }

        // Check keywords
        for (const keyword of keywords) {
          if (text.includes(keyword.toLowerCase())) {
            matchCount++;
          }
        }

        // If at least 2 keywords match, consider it a match
        if (matchCount >= 2) {
          // Update usage count
          await db.update(whatsappFaqKnowledge)
            .set({ usageCount: faq.usageCount + 1 })
            .where(eq(whatsappFaqKnowledge.id, faq.id));

          return {
            message: faq.answer,
            confidence: Math.min(90, matchCount * 30),
            intent: faq.category
          };
        }
      }

      return null;
    } catch (error) {
      console.error('[CHATBOT] Error searching FAQ:', error);
      return null;
    }
  }

  // ===== DEFAULT RESPONSES =====
  private getDefaultResponse(text: string): string {
    // Greeting
    if (text.includes('bonjour') || text.includes('salut') || text.includes('hello') || text.includes('hi')) {
      return `👋 Bonjour! Bienvenue chez Educafric!\n\nComment puis-je vous aider aujourd'hui?\n\n` +
        `💡 Vous pouvez me demander:\n` +
        `• Tarifs et abonnements\n` +
        `• Fonctionnalités de la plateforme\n` +
        `• Démo gratuite\n` +
        `• Support technique\n\n` +
        `📞 Support: +237 656 200 472`;
    }

    // Generic help
    return `Merci de nous contacter! 📱\n\n` +
      `Un membre de notre équipe Educafric vous répondra bientôt.\n\n` +
      `🔹 Pour une réponse rapide, essayez:\n` +
      `"prix", "demo", "fonctionnalités", "aide"\n\n` +
      `📞 Support: +237 656 200 472\n` +
      `📧 contact@educafric.com`;
  }

  // ===== CONVERSATION MANAGEMENT =====

  private async getOrCreateConversation(phoneNumber: string) {
    try {
      const [existing] = await db.select()
        .from(whatsappConversations)
        .where(eq(whatsappConversations.phoneNumber, phoneNumber))
        .limit(1);

      if (existing) {
        return existing;
      }

      const [newConv] = await db.insert(whatsappConversations)
        .values({
          phoneNumber,
          conversationStatus: 'active',
          lastMessageAt: new Date(),
          messageCount: 0,
          isBot: true
        })
        .returning();

      return newConv;
    } catch (error) {
      console.error('[CHATBOT] Error getting/creating conversation:', error);
      throw error;
    }
  }

  private async saveMessage(data: any) {
    try {
      await db.insert(whatsappMessages).values(data);
    } catch (error) {
      console.error('[CHATBOT] Error saving message:', error);
    }
  }

  private async updateConversation(conversationId: number) {
    try {
      await db.update(whatsappConversations)
        .set({
          lastMessageAt: new Date(),
          messageCount: sql`${whatsappConversations.messageCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(whatsappConversations.id, conversationId));
    } catch (error) {
      console.error('[CHATBOT] Error updating conversation:', error);
    }
  }

  // ===== INITIALIZE DEFAULT FAQs =====
  private async initializeDefaultFAQs() {
    try {
      const defaultFAQs = [
        {
          question: "Quels sont les tarifs d'Educafric?",
          answer: `💰 **Tarifs Educafric**\n\n` +
            `👨‍👩‍👧 **Parents:**\n` +
            `• Bronze: 3.000 CFA/an\n` +
            `• Bronze Plus: 4.000 CFA/an\n` +
            `• GPS Tracking: 5.000 CFA/an\n\n` +
            `🏫 **Écoles:**\n` +
            `• École Publique: 50.000 CFA/an\n` +
            `• École Privée: 75.000 CFA/an\n\n` +
            `👨‍🏫 **Enseignants Indépendants:**\n` +
            `• Basic: 12.500 CFA/trimestre\n` +
            `• Pro: 25.000 CFA/trimestre\n\n` +
            `📞 Devis personnalisé: +237 656 200 472`,
          category: 'pricing',
          keywords: ['prix', 'tarif', 'combien', 'coût', 'price', 'cost'],
          language: 'fr',
          priority: 10
        },
        {
          question: "Comment obtenir une démo d'Educafric?",
          answer: `🎯 **Démo Gratuite Educafric**\n\n` +
            `Accédez à notre démo en ligne:\n` +
            `🌐 https://educafric.com/sandbox\n\n` +
            `✅ Fonctionnalités complètes\n` +
            `✅ Données de démonstration\n` +
            `✅ Aucune installation requise\n\n` +
            `Ou contactez-nous pour une démo personnalisée:\n` +
            `📞 +237 656 200 472\n` +
            `📧 contact@educafric.com`,
          category: 'demo',
          keywords: ['demo', 'démo', 'essai', 'test', 'gratuit', 'trial'],
          language: 'fr',
          priority: 9
        },
        {
          question: "Quelles sont les fonctionnalités principales?",
          answer: `🚀 **Fonctionnalités Educafric**\n\n` +
            `📚 **Gestion Académique:**\n` +
            `• Notes & Bulletins digitaux\n` +
            `• Assiduité en temps réel\n` +
            `• Devoirs & Évaluations\n\n` +
            `💬 **Communication:**\n` +
            `• Notifications WhatsApp\n` +
            `• Emails automatiques\n` +
            `• Messagerie interne\n\n` +
            `💳 **Paiements:**\n` +
            `• Stripe, MTN, Orange Money\n` +
            `• Factures automatiques\n\n` +
            `📍 **Sécurité:**\n` +
            `• Géolocalisation GPS\n` +
            `• Zones de sécurité\n` +
            `• Alertes en temps réel\n\n` +
            `📞 En savoir plus: +237 656 200 472`,
          category: 'features',
          keywords: ['fonction', 'fonctionnalité', 'feature', 'possibilité', 'service'],
          language: 'fr',
          priority: 8
        },
        {
          question: "Comment contacter le support?",
          answer: `📞 **Support Educafric**\n\n` +
            `Nous sommes là pour vous aider!\n\n` +
            `📱 WhatsApp: +237 656 200 472\n` +
            `📧 Email: contact@educafric.com\n` +
            `🌐 Site: https://educafric.com\n\n` +
            `⏰ Disponible 7j/7\n` +
            `🇨🇲 Douala & Yaoundé, Cameroun`,
          category: 'support',
          keywords: ['contact', 'aide', 'help', 'support', 'assistance', 'problème'],
          language: 'fr',
          priority: 7
        },
        {
          question: "Comment m'inscrire?",
          answer: `📝 **Inscription Educafric**\n\n` +
            `**Option 1 - En ligne:**\n` +
            `1. Visitez https://educafric.com\n` +
            `2. Cliquez sur "S'inscrire"\n` +
            `3. Choisissez votre profil (Parent, École, Enseignant)\n` +
            `4. Remplissez le formulaire\n\n` +
            `**Option 2 - Par WhatsApp:**\n` +
            `Envoyez "INSCRIPTION" au +237 656 200 472\n\n` +
            `**Option 3 - Par téléphone:**\n` +
            `Appelez le +237 656 200 472\n\n` +
            `✨ Première année à tarif réduit!`,
          category: 'account',
          keywords: ['inscription', 'inscrire', 's\\'inscrire', 'register', 'signup', 'créer compte'],
          language: 'fr',
          priority: 6
        }
      ];

      for (const faq of defaultFAQs) {
        try {
          // Check if FAQ already exists (deduplicate by question + language)
          const existing = await db.select()
            .from(whatsappFaqKnowledge)
            .where(
              and(
                eq(whatsappFaqKnowledge.question, faq.question),
                eq(whatsappFaqKnowledge.language, faq.language)
              )
            )
            .limit(1);
          
          if (existing.length === 0) {
            await db.insert(whatsappFaqKnowledge).values(faq);
          }
        } catch (e) {
          // Silently fail if tables don't exist yet
        }
      }
    } catch (error) {
      // Silently fail if tables don't exist yet
    }
  }

  // ===== GET CONVERSATION HISTORY =====
  async getConversationHistory(conversationId: number) {
    try {
      const messages = await db.select()
        .from(whatsappMessages)
        .where(eq(whatsappMessages.conversationId, conversationId))
        .orderBy(whatsappMessages.createdAt);

      return messages;
    } catch (error) {
      console.error('[CHATBOT] Error getting conversation history:', error);
      return [];
    }
  }

  // ===== GET ALL CONVERSATIONS =====
  async getAllConversations(filters?: { status?: string; limit?: number }) {
    try {
      let query = db.select().from(whatsappConversations);

      if (filters?.status) {
        query = query.where(eq(whatsappConversations.conversationStatus, filters.status as any));
      }

      const conversations = await query
        .orderBy(desc(whatsappConversations.lastMessageAt))
        .limit(filters?.limit || 50);

      return conversations;
    } catch (error) {
      console.error('[CHATBOT] Error getting conversations:', error);
      return [];
    }
  }
}

export const whatsappChatbot = WhatsAppChatbotService.getInstance();
export default WhatsAppChatbotService;

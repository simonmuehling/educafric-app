/**
 * WhatsApp Click-to-Chat Service
 * Handles token generation, message rendering, and tracking
 */

import { db } from '../db';
import { users, waClicks } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { signPayload, buildWaUrl } from '../utils/waLink';
import { renderTemplate } from '../templates/waTemplates';

const WA_TOKEN_SECRET = process.env.WA_TOKEN_SECRET || 'educafric-wa-secret-2025';

export interface CreateTokenInput {
  recipientId: number;
  templateId: string;
  templateData?: Record<string, any>;
  lang?: 'fr' | 'en';
  campaign?: string;
  ttlSeconds?: number; // Default 30 minutes
}

export async function getRecipientById(recipientId: number) {
  // Check sandbox users first (IDs 9001-9006)
  if (recipientId >= 9001 && recipientId <= 9006) {
    const sandboxUsers: Record<number, any> = {
      9001: { id: 9001, firstName: 'Marie', lastName: 'Kamga', role: 'Parent', email: 'sandbox.parent@educafric.demo', schoolId: 999, whatsappE164: null, waOptIn: false, waLanguage: 'fr' },
      9002: { id: 9002, firstName: 'Paul', lastName: 'Mvondo', role: 'Teacher', email: 'sandbox.teacher@educafric.demo', schoolId: 999, whatsappE164: null, waOptIn: false, waLanguage: 'fr' },
      9003: { id: 9003, firstName: 'Sophie', lastName: 'Biya', role: 'Freelancer', email: 'sandbox.freelancer@educafric.demo', schoolId: 999, whatsappE164: null, waOptIn: false, waLanguage: 'fr' },
      9004: { id: 9004, firstName: 'Junior', lastName: 'Kamga', role: 'Student', email: 'sandbox.student@educafric.demo', schoolId: 999, whatsappE164: null, waOptIn: false, waLanguage: 'fr' },
      9005: { id: 9005, firstName: 'Carine', lastName: 'Nguetsop', role: 'Admin', email: 'sandbox.admin@educafric.demo', schoolId: 999, whatsappE164: null, waOptIn: false, waLanguage: 'fr' },
      9006: { id: 9006, firstName: 'Michel', lastName: 'Atangana', role: 'Director', email: 'sandbox.director@educafric.demo', schoolId: 999, whatsappE164: null, waOptIn: false, waLanguage: 'fr' }
    };
    
    const sandboxUser = sandboxUsers[recipientId];
    if (sandboxUser) {
      // Check if WhatsApp config exists in database for this sandbox user
      try {
        const [waConfig] = await db
          .select({
            whatsappE164: users.whatsappE164,
            waOptIn: users.waOptIn,
            waLanguage: users.waLanguage
          })
          .from(users)
          .where(eq(users.id, recipientId))
          .limit(1);
        
        if (waConfig) {
          // Merge sandbox user data with WhatsApp config from database
          return {
            ...sandboxUser,
            whatsappE164: waConfig.whatsappE164,
            waOptIn: waConfig.waOptIn,
            waLanguage: waConfig.waLanguage || 'fr'
          };
        }
      } catch (error) {
        console.log('[WA_SERVICE] No database config for sandbox user', recipientId);
      }
      
      // Return sandbox user with default WhatsApp settings
      return sandboxUser;
    }
  }
  
  // Regular database users
  const [recipient] = await db
    .select({
      whatsappE164: users.whatsappE164,
      waOptIn: users.waOptIn,
      waLanguage: users.waLanguage,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      role: users.role,
      schoolId: users.schoolId
    })
    .from(users)
    .where(eq(users.id, recipientId))
    .limit(1);
  
  return recipient || null;
}

export async function createWaToken(input: CreateTokenInput): Promise<string> {
  const { 
    recipientId, 
    templateId, 
    templateData = {}, 
    lang = 'fr',
    campaign,
    ttlSeconds = 1800 // 30 minutes default
  } = input;
  
  const exp = Date.now() + ttlSeconds * 1000;
  
  const payload = {
    recipientId,
    templateId,
    templateData,
    lang,
    campaign,
    exp
  };
  
  return signPayload(payload, WA_TOKEN_SECRET);
}

export async function logWaClick(params: {
  recipientId: number;
  templateId: string;
  campaign?: string;
  ip?: string;
  userAgent?: string;
  metadata?: any;
}): Promise<void> {
  try {
    await db.insert(waClicks).values({
      recipientId: params.recipientId,
      templateId: params.templateId,
      campaign: params.campaign,
      ip: params.ip,
      userAgent: params.userAgent,
      metadata: params.metadata
    });
    
    console.log('[WA_CLICK_TO_CHAT] Click logged:', {
      recipientId: params.recipientId,
      templateId: params.templateId,
      campaign: params.campaign
    });
  } catch (error) {
    console.error('[WA_CLICK_TO_CHAT] Failed to log click:', error);
  }
}

export async function computeWaRedirect(
  recipientId: number,
  templateId: string,
  lang: 'fr' | 'en',
  templateData: Record<string, any>
): Promise<string> {
  const recipient = await getRecipientById(recipientId);
  
  if (!recipient?.waOptIn || !recipient?.whatsappE164) {
    throw new Error('Recipient not WhatsApp-enabled');
  }
  
  const message = renderTemplate(templateId, lang, templateData);
  return buildWaUrl(recipient.whatsappE164, message);
}

export { renderTemplate, WA_TOKEN_SECRET };

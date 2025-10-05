/**
 * WhatsApp Click-to-Chat Service
 * Handles token generation, message rendering, and tracking
 */

import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { signPayload } from '../utils/waLink';
import { renderTemplate } from '../templates/waTemplates';

const WA_TOKEN_SECRET = process.env.WA_TOKEN_SECRET || 'educafric-wa-secret-2025';

export interface WaClickLog {
  recipientId: number;
  templateId: string;
  ts: number;
  ip?: string;
  userAgent?: string;
}

// In-memory click tracking (can be moved to DB later)
const clickLogs: WaClickLog[] = [];

export async function getRecipientById(recipientId: number) {
  const [recipient] = await db
    .select({
      whatsappE164: users.whatsappE164,
      waOptIn: users.waOptIn,
      waLanguage: users.waLanguage,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email
    })
    .from(users)
    .where(eq(users.id, recipientId))
    .limit(1);
  
  return recipient || null;
}

export async function createWaToken(params: {
  recipientId: number;
  templateId: string;
  templateData: Record<string, any>;
  lang?: 'fr' | 'en';
}): Promise<string> {
  const { recipientId, templateId, templateData, lang = 'fr' } = params;
  
  // Optional: add expiration (30 minutes)
  const exp = Date.now() + 1000 * 60 * 30;
  
  const payload = {
    recipientId,
    templateId,
    templateData,
    lang,
    exp
  };
  
  return signPayload(payload, WA_TOKEN_SECRET);
}

export async function logWaClick(log: WaClickLog): Promise<void> {
  clickLogs.push(log);
  
  // Keep only last 1000 logs in memory
  if (clickLogs.length > 1000) {
    clickLogs.shift();
  }
  
  console.log('[WA_CLICK_TO_CHAT] Click tracked:', {
    recipientId: log.recipientId,
    templateId: log.templateId,
    timestamp: new Date(log.ts).toISOString()
  });
}

export function getClickLogs(recipientId?: number): WaClickLog[] {
  if (recipientId) {
    return clickLogs.filter(log => log.recipientId === recipientId);
  }
  return clickLogs;
}

export { renderTemplate, WA_TOKEN_SECRET };

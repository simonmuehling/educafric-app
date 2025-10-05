/**
 * WhatsApp Click-to-Chat Link Builder (Option A)
 * Generates wa.me links with prefilled messages - no Meta Cloud API needed
 */

import crypto from 'crypto';

export function encodeText(text: string): string {
  return encodeURIComponent(text);
}

export function formatE164(e164: string): string {
  // Keep only digits and leading +
  const cleaned = e164.trim().replace(/[^+\d]/g, '');
  if (!/^\+\d{7,15}$/.test(cleaned)) {
    throw new Error('Invalid E.164 phone number format');
  }
  return cleaned;
}

export function buildWaUrl(e164: string, message: string): string {
  const phone = formatE164(e164).replace('+', '');
  return `https://wa.me/${phone}?text=${encodeText(message)}`;
}

export function signPayload(payload: any, secret: string): string {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(b64).digest('base64url');
  return `${b64}.${sig}`;
}

export function verifyToken(token: string, secret: string): any | null {
  try {
    const [b64, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', secret).update(b64).digest('base64url');
    if (sig !== expected) return null;
    return JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

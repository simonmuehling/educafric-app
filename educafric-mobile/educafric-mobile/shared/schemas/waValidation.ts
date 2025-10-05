/**
 * WhatsApp Click-to-Chat Validation Schemas
 */

import { z } from "zod";

// E.164 phone number validation
export const E164Schema = z.string().regex(/^\+\d{7,15}$/, "Invalid E.164 phone number format");

// WhatsApp token mint request
export const WaMintRequestSchema = z.object({
  recipientId: z.number().int().positive(),
  templateId: z.string().min(1),
  lang: z.enum(["en", "fr"]).optional(),
  templateData: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
  campaign: z.string().optional(), // Optional campaign identifier
  ttlSeconds: z.number().int().positive().max(3600).optional() // Max 1 hour
});

export type WaMintRequest = z.infer<typeof WaMintRequestSchema>;

// WhatsApp opt-in update
export const WaOptInUpdateSchema = z.object({
  waOptIn: z.boolean(),
  whatsappE164: E164Schema.optional(),
  waLanguage: z.enum(["en", "fr"]).optional()
});

export type WaOptInUpdate = z.infer<typeof WaOptInUpdateSchema>;

/**
 * WhatsApp Click-to-Chat Clicks Schema
 * Tracks WhatsApp link clicks for analytics and audit
 */

import { pgTable, serial, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const waClicks = pgTable("wa_clicks", {
  id: serial("id").primaryKey(),
  recipientId: integer("recipient_id").notNull(),
  templateId: text("template_id").notNull(),
  campaign: text("campaign"), // Optional campaign identifier for tracking
  ip: text("ip"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"), // Store additional context (role, school, etc.)
  createdAt: timestamp("created_at").defaultNow()
});

// Zod schemas
export const insertWaClickSchema = createInsertSchema(waClicks).omit({
  id: true,
  createdAt: true
});

export type InsertWaClick = z.infer<typeof insertWaClickSchema>;
export type WaClick = typeof waClicks.$inferSelect;

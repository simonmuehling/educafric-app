/**
 * UNIFIED MESSAGING SCHEMA
 * Consolidates all messaging functionality into one clean schema
 * Replaces duplicate tables: student_parent_messages, teacher_student_messages, family_messages, etc.
 */

import { pgTable, serial, integer, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Unified connections table - replaces all separate connection tables
export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  connectionType: text("connection_type").notNull(), // 'student-parent', 'teacher-student', 'family', 'partnership'
  initiatorId: integer("initiator_id").notNull(),
  targetId: integer("target_id").notNull(),
  status: text("status").default("pending"), // 'pending', 'approved', 'rejected'
  
  // Connection-specific data
  connectionData: jsonb("connection_data"), // Store specific data for different connection types
  
  createdAt: timestamp("created_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  approvedBy: integer("approved_by")
});

// Unified messages table - replaces all separate message tables
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  connectionId: integer("connection_id").notNull(),
  connectionType: text("connection_type").notNull(), // For faster queries
  senderId: integer("sender_id").notNull(),
  
  // Message content
  message: text("message").notNull(),
  messageType: text("message_type").default("text"), // 'text', 'homework', 'grade', 'attendance', 'emergency'
  
  // Message features
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  priority: text("priority").default("normal"), // 'low', 'normal', 'high', 'urgent'
  
  // Context-specific data stored as JSON
  messageData: jsonb("message_data"), // homework details, grade info, etc.
  
  // Notification settings
  parentCcEnabled: boolean("parent_cc_enabled").default(false),
  teacherCcEnabled: boolean("teacher_cc_enabled").default(false),
  geolocationShared: boolean("geolocation_shared").default(false),
  
  sentAt: timestamp("sent_at").defaultNow()
});

// Unified message attachments (for files, images, etc.)
export const messageAttachments = pgTable("message_attachments", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull(),
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size"),
  filePath: text("file_path").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow()
});

// Zod schemas for validation
export const createConnectionSchema = createInsertSchema(connections).omit({
  id: true,
  createdAt: true,
  approvedAt: true,
  approvedBy: true
});

export const createMessageSchema = createInsertSchema(messages).omit({
  id: true,
  sentAt: true,
  isRead: true,
  readAt: true
});

export const unifiedConnectionSchema = z.object({
  connectionType: z.enum(['student-parent', 'teacher-student', 'family', 'partnership']),
  targetId: z.number(),
  connectionData: z.record(z.any()).optional()
});

export const unifiedMessageSchema = z.object({
  connectionId: z.number(),
  connectionType: z.enum(['student-parent', 'teacher-student', 'family', 'partnership']),
  message: z.string().min(1, 'Message cannot be empty'),
  messageType: z.enum(['text', 'homework', 'grade', 'attendance', 'emergency', 'general']).default('text'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  
  // Optional features
  parentCcEnabled: z.boolean().optional(),
  teacherCcEnabled: z.boolean().optional(),
  geolocationShared: z.boolean().optional(),
  
  // Context-specific data
  messageData: z.record(z.any()).optional()
});

// Type exports
export type Connection = typeof connections.$inferSelect;
export type NewConnection = z.infer<typeof createConnectionSchema>;
export type Message = typeof messages.$inferSelect;
export type NewMessage = z.infer<typeof createMessageSchema>;
export type MessageAttachment = typeof messageAttachments.$inferSelect;
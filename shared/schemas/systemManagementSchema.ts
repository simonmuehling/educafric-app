// ===== SYSTEM MANAGEMENT SCHEMA =====
// Teacher replacements, Audit logs, WhatsApp chatbot

import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ===== TEACHER ABSENCE & REPLACEMENT MANAGEMENT =====

// Enhanced teacher absences with better tracking
export const teacherAbsencesEnhanced = pgTable("teacher_absences_enhanced", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  schoolId: integer("school_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  reason: text("reason").notNull(),
  absenceType: text("absence_type").notNull(), // sick, personal, emergency, vacation, training
  status: text("status").default("pending"), // pending, approved, rejected, cancelled
  approvedBy: integer("approved_by"), // Director/Admin who approved
  approvedAt: timestamp("approved_at"),
  affectedClasses: jsonb("affected_classes"), // [{classId: 1, className: "Terminale A", subjectId: 2, subjectName: "Maths"}]
  notificationsSent: boolean("notifications_sent").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Replacement assignments for absent teachers
export const teacherReplacements = pgTable("teacher_replacements", {
  id: serial("id").primaryKey(),
  absenceId: integer("absence_id").notNull(), // FK to teacherAbsencesEnhanced
  schoolId: integer("school_id").notNull(),
  originalTeacherId: integer("original_teacher_id").notNull(),
  replacementTeacherId: integer("replacement_teacher_id"), // NULL if not yet assigned
  classId: integer("class_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  sessionDate: timestamp("session_date").notNull(),
  sessionTime: text("session_time"), // "08:00-10:00"
  status: text("status").default("pending"), // pending, assigned, confirmed, completed, cancelled
  assignedBy: integer("assigned_by"), // Director/Admin who assigned
  assignedAt: timestamp("assigned_at"),
  confirmedBy: integer("confirmed_by"), // Replacement teacher confirmation
  confirmedAt: timestamp("confirmed_at"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  notificationsSent: boolean("notifications_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ===== AUDIT LOG SYSTEM =====

// System-wide audit log for all important actions
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // NULL for system actions
  userRole: text("user_role"), // director, teacher, parent, student, etc.
  userEmail: text("user_email"),
  action: text("action").notNull(), // login, logout, create_grade, update_bulletin, delete_user, etc.
  actionCategory: text("action_category").notNull(), // auth, academic, financial, administrative, security
  entityType: text("entity_type"), // user, grade, bulletin, payment, class, etc.
  entityId: text("entity_id"), // ID of affected entity
  description: text("description").notNull(),
  metadata: jsonb("metadata"), // Additional context data
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  schoolId: integer("school_id"), // NULL for system-level actions
  severity: text("severity").default("info"), // info, warning, error, critical
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow()
});

// Audit log access tracking (who views the audit logs)
export const auditLogAccessTracking = pgTable("audit_log_access_tracking", {
  id: serial("id").primaryKey(),
  accessedBy: integer("accessed_by").notNull(), // SiteAdmin user ID
  filters: jsonb("filters"), // Search filters used
  resultsCount: integer("results_count"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow()
});

// ===== WHATSAPP CHATBOT SYSTEM =====

// WhatsApp conversation tracking
export const whatsappConversations = pgTable("whatsapp_conversations", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull(), // User's WhatsApp number
  userId: integer("user_id"), // Linked user if known (NULL for unknown contacts)
  userRole: text("user_role"), // parent, teacher, student, prospect, etc.
  conversationStatus: text("conversation_status").default("active"), // active, closed, archived
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  messageCount: integer("message_count").default(0),
  isBot: boolean("is_bot").default(true), // Bot handling vs human takeover
  assignedTo: integer("assigned_to"), // Human agent if escalated
  tags: jsonb("tags"), // ["support", "billing", "demo", etc.]
  metadata: jsonb("metadata"), // Additional context
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Individual WhatsApp messages in conversations
export const whatsappMessages = pgTable("whatsapp_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  messageId: text("message_id"), // WhatsApp message ID
  direction: text("direction").notNull(), // inbound, outbound
  fromNumber: text("from_number").notNull(),
  toNumber: text("to_number").notNull(),
  messageType: text("message_type").default("text"), // text, image, document, location, etc.
  content: text("content"), // Message text content
  mediaUrl: text("media_url"), // URL for media messages
  status: text("status").default("sent"), // sent, delivered, read, failed
  isBot: boolean("is_bot").default(true), // Bot response vs human
  intent: text("intent"), // Detected intent: faq, pricing, demo, support, etc.
  intentConfidence: integer("intent_confidence"), // 0-100
  responseTime: integer("response_time"), // Milliseconds to respond
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow()
});

// FAQ knowledge base for chatbot
export const whatsappFaqKnowledge = pgTable("whatsapp_faq_knowledge", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(), // pricing, features, technical, account, general
  keywords: text("keywords").array(), // Keywords for matching
  language: text("language").default("fr"), // fr, en
  priority: integer("priority").default(0), // Higher priority = shown first
  usageCount: integer("usage_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Chatbot quick replies and templates
export const whatsappQuickReplies = pgTable("whatsapp_quick_replies", {
  id: serial("id").primaryKey(),
  trigger: text("trigger").notNull(), // Keyword or pattern to trigger
  responseText: text("response_text").notNull(),
  category: text("category").notNull(),
  language: text("language").default("fr"),
  includeActions: jsonb("include_actions"), // [{type: "link", text: "Visit demo", url: "..."}]
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// ===== INSERT SCHEMAS & TYPES =====

export const insertTeacherAbsenceEnhancedSchema = createInsertSchema(teacherAbsencesEnhanced);
export const insertTeacherReplacementSchema = createInsertSchema(teacherReplacements);
export const insertAuditLogSchema = createInsertSchema(auditLogs);
export const insertWhatsappConversationSchema = createInsertSchema(whatsappConversations);
export const insertWhatsappMessageSchema = createInsertSchema(whatsappMessages);
export const insertWhatsappFaqKnowledgeSchema = createInsertSchema(whatsappFaqKnowledge);
export const insertWhatsappQuickReplySchema = createInsertSchema(whatsappQuickReplies);

// ===== TYPES =====

export type TeacherAbsenceEnhanced = typeof teacherAbsencesEnhanced.$inferSelect;
export type InsertTeacherAbsenceEnhanced = z.infer<typeof insertTeacherAbsenceEnhancedSchema>;

export type TeacherReplacement = typeof teacherReplacements.$inferSelect;
export type InsertTeacherReplacement = z.infer<typeof insertTeacherReplacementSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

export type WhatsappConversation = typeof whatsappConversations.$inferSelect;
export type InsertWhatsappConversation = z.infer<typeof insertWhatsappConversationSchema>;

export type WhatsappMessage = typeof whatsappMessages.$inferSelect;
export type InsertWhatsappMessage = z.infer<typeof insertWhatsappMessageSchema>;

export type WhatsappFaqKnowledge = typeof whatsappFaqKnowledge.$inferSelect;
export type InsertWhatsappFaqKnowledge = z.infer<typeof insertWhatsappFaqKnowledgeSchema>;

export type WhatsappQuickReply = typeof whatsappQuickReplies.$inferSelect;
export type InsertWhatsappQuickReply = z.infer<typeof insertWhatsappQuickReplySchema>;

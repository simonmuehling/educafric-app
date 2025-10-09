/**
 * UNIFIED BILINGUAL NOTIFICATION SCHEMA
 * Consolidates all notification functionality across all user profiles
 * Supports French and English content with structured action routing
 */

import { pgTable, serial, integer, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Action types for safe routing (prevents 404 errors)
export const notificationActionTypes = {
  // Academic actions
  VIEW_GRADE: 'view_grade',
  VIEW_BULLETIN: 'view_bulletin',
  VIEW_HOMEWORK: 'view_homework',
  VIEW_ATTENDANCE: 'view_attendance',
  
  // Financial actions
  VIEW_PAYMENT: 'view_payment',
  PAY_INVOICE: 'pay_invoice',
  VIEW_SUBSCRIPTION: 'view_subscription',
  
  // Communication actions
  VIEW_MESSAGE: 'view_message',
  REPLY_MESSAGE: 'reply_message',
  
  // Geolocation actions
  VIEW_LOCATION: 'view_location',
  VIEW_SAFE_ZONE: 'view_safe_zone',
  
  // System actions
  VIEW_SETTINGS: 'view_settings',
  VERIFY_EMAIL: 'verify_email',
  
  // Generic actions
  VIEW_DETAILS: 'view_details',
  EXTERNAL_LINK: 'external_link'
} as const;

export type NotificationActionType = typeof notificationActionTypes[keyof typeof notificationActionTypes];

// Notification priorities
export const notificationPriorities = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export type NotificationPriority = typeof notificationPriorities[keyof typeof notificationPriorities];

// Notification categories
export const notificationCategories = {
  ACADEMIC: 'academic',
  ADMINISTRATIVE: 'administrative',
  FINANCIAL: 'financial',
  SECURITY: 'security',
  COMMUNICATION: 'communication',
  SYSTEM: 'system'
} as const;

export type NotificationCategory = typeof notificationCategories[keyof typeof notificationCategories];

// Unified notifications table with bilingual support
export const unifiedNotifications = pgTable("unified_notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  userRole: text("user_role").notNull(), // 'Director', 'Teacher', 'Parent', 'Student', etc.
  
  // Bilingual content
  titleFr: text("title_fr").notNull(),
  titleEn: text("title_en").notNull(),
  messageFr: text("message_fr").notNull(),
  messageEn: text("message_en").notNull(),
  
  // Classification
  type: text("type").notNull(), // Specific type: 'grade', 'payment', 'attendance', etc.
  priority: text("priority").notNull().$type<NotificationPriority>(),
  category: text("category").notNull().$type<NotificationCategory>(),
  
  // Status tracking
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  
  // Structured action metadata (prevents 404s)
  actionRequired: boolean("action_required").default(false).notNull(),
  actionType: text("action_type").$type<NotificationActionType>(), // Structured action type
  actionEntityId: integer("action_entity_id"), // ID of related entity (grade, payment, etc.)
  actionTargetRole: text("action_target_role"), // Target role for the action
  actionIsExternal: boolean("action_is_external").default(false), // Is it an external link?
  actionExternalUrl: text("action_external_url"), // For external links only
  
  // Legacy support (deprecated, use structured actions instead)
  actionUrl: text("action_url"), // DEPRECATED: Use actionType + actionEntityId
  actionText: text("action_text"), // DEPRECATED: Use bilingual titles
  
  // Additional metadata
  metadata: jsonb("metadata"), // Any additional context-specific data
  senderRole: text("sender_role"), // Who sent this notification
  senderId: integer("sender_id"), // ID of sender
  relatedEntityType: text("related_entity_type"), // 'grade', 'bulletin', 'payment', etc.
  relatedEntityId: integer("related_entity_id"), // ID of related entity
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Auto-cleanup old notifications
  
  // Delivery tracking
  deliveredVia: text("delivered_via").array(), // ['push', 'email', 'sms']
  deliveryStatus: jsonb("delivery_status") // Status per channel
});

// Zod validation schemas
export const insertUnifiedNotificationSchema = z.object({
  userId: z.number(),
  userRole: z.string(),
  titleFr: z.string(),
  titleEn: z.string(),
  messageFr: z.string(),
  messageEn: z.string(),
  type: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.enum(['academic', 'administrative', 'financial', 'security', 'communication', 'system']),
  isRead: z.boolean().optional().default(false),
  readAt: z.date().optional(),
  actionRequired: z.boolean().optional().default(false),
  actionType: z.enum([
    'view_grade', 'view_bulletin', 'view_homework', 'view_attendance',
    'view_payment', 'pay_invoice', 'view_subscription',
    'view_message', 'reply_message',
    'view_location', 'view_safe_zone',
    'view_settings', 'verify_email',
    'view_details', 'external_link'
  ]).optional(),
  actionEntityId: z.number().optional(),
  actionTargetRole: z.string().optional(),
  actionIsExternal: z.boolean().optional().default(false),
  actionExternalUrl: z.string().optional(),
  actionUrl: z.string().optional(),
  actionText: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  senderRole: z.string().optional(),
  senderId: z.number().optional(),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.number().optional(),
  expiresAt: z.date().optional(),
  deliveredVia: z.array(z.string()).optional(),
  deliveryStatus: z.record(z.any()).optional()
});

// Type exports
export type UnifiedNotification = typeof unifiedNotifications.$inferSelect;
export type InsertUnifiedNotification = z.infer<typeof insertUnifiedNotificationSchema>;

// Helper type for bilingual content
export interface BilingualNotificationContent {
  titleFr: string;
  titleEn: string;
  messageFr: string;
  messageEn: string;
}

// Helper type for structured action
export interface NotificationAction {
  actionType: NotificationActionType;
  entityId?: number;
  targetRole?: string;
  isExternal?: boolean;
  externalUrl?: string;
}

// Default bilingual text translations
export const notificationTypeTranslations = {
  grade: { fr: 'Note', en: 'Grade' },
  attendance: { fr: 'Présence', en: 'Attendance' },
  homework: { fr: 'Devoir', en: 'Homework' },
  payment: { fr: 'Paiement', en: 'Payment' },
  announcement: { fr: 'Annonce', en: 'Announcement' },
  meeting: { fr: 'Réunion', en: 'Meeting' },
  emergency: { fr: 'Urgence', en: 'Emergency' },
  system: { fr: 'Système', en: 'System' },
  geolocation: { fr: 'Géolocalisation', en: 'Geolocation' },
  safe_zone_created: { fr: 'Zone créée', en: 'Zone Created' },
  safe_zone_updated: { fr: 'Zone modifiée', en: 'Zone Updated' },
  safe_zone_deleted: { fr: 'Zone supprimée', en: 'Zone Deleted' },
  zone_entry: { fr: 'Entrée zone', en: 'Zone Entry' },
  zone_exit: { fr: 'Sortie zone', en: 'Zone Exit' },
  location_alert: { fr: 'Alerte position', en: 'Location Alert' },
  device_status: { fr: 'Statut appareil', en: 'Device Status' }
} as const;

export const priorityTranslations = {
  low: { fr: 'Faible', en: 'Low' },
  medium: { fr: 'Moyenne', en: 'Medium' },
  high: { fr: 'Élevée', en: 'High' },
  urgent: { fr: 'Urgent', en: 'Urgent' }
} as const;

export const categoryTranslations = {
  academic: { fr: 'Académique', en: 'Academic' },
  administrative: { fr: 'Administratif', en: 'Administrative' },
  financial: { fr: 'Financier', en: 'Financial' },
  security: { fr: 'Sécurité', en: 'Security' },
  communication: { fr: 'Communication', en: 'Communication' },
  system: { fr: 'Système', en: 'System' }
} as const;

export const actionTypeTranslations = {
  view_grade: { fr: 'Voir la note', en: 'View Grade' },
  view_bulletin: { fr: 'Voir le bulletin', en: 'View Bulletin' },
  view_homework: { fr: 'Voir le devoir', en: 'View Homework' },
  view_attendance: { fr: 'Voir présence', en: 'View Attendance' },
  view_payment: { fr: 'Voir paiement', en: 'View Payment' },
  pay_invoice: { fr: 'Payer facture', en: 'Pay Invoice' },
  view_subscription: { fr: 'Voir abonnement', en: 'View Subscription' },
  view_message: { fr: 'Voir message', en: 'View Message' },
  reply_message: { fr: 'Répondre', en: 'Reply' },
  view_location: { fr: 'Voir position', en: 'View Location' },
  view_safe_zone: { fr: 'Voir zone', en: 'View Zone' },
  view_settings: { fr: 'Voir paramètres', en: 'View Settings' },
  verify_email: { fr: 'Vérifier email', en: 'Verify Email' },
  view_details: { fr: 'Voir détails', en: 'View Details' },
  external_link: { fr: 'Lien externe', en: 'External Link' }
} as const;

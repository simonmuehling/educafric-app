// ===== USER SCHEMA MODULE =====
// Extracted from huge schema.ts to prevent crashes

import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique(), // Email is now OPTIONAL - phone is primary identifier
  password: text("password"), // Password can be null for teachers created by admin
  role: text("role").notNull(), // Primary role: SiteAdmin, Admin, Director, Teacher, Parent, Student, Freelancer, Commercial
  secondaryRoles: text("secondary_roles").array(),
  activeRole: text("active_role"), // Currently selected role for session
  roleHistory: jsonb("role_history"), // Track role switches and affiliations
  workMode: text("work_mode").default("school"), // "school" (assigned classes) | "independent" (private tutoring) | "hybrid" (both)
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  gender: text("gender"),
  dateOfBirth: text("date_of_birth"), // Date de naissance au format YYYY-MM-DD
  placeOfBirth: text("place_of_birth"), // Lieu de naissance (ville, pays)
  phone: text("phone").unique(),
  
  // Parent/Guardian information (for students)
  guardian: text("guardian"), // Nom complet du parent/tuteur
  parentEmail: text("parent_email"), // Email du parent/tuteur
  parentPhone: text("parent_phone"), // Téléphone du parent/tuteur
  isRepeater: boolean("is_repeater").default(false), // Redoublant (pour élèves)
  
  schoolId: integer("school_id"),
  
  // Subscription and payment fields
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  subscriptionPlan: text("subscription_plan"),
  subscriptionStatus: text("subscription_status").default("inactive"), // inactive, active, cancelled, expired
  subscriptionStart: text("subscription_start"),
  subscriptionEnd: text("subscription_end"),
  
  // Administrative delegation fields
  delegatedPermissions: text("delegated_permissions").array(), // List of delegated permissions
  delegatedByUserId: integer("delegated_by_user_id"), // Who delegated these permissions
  delegationLevel: text("delegation_level"), // full, limited, specific
  delegationExpiry: timestamp("delegation_expiry"), // When delegation expires
  canDelegate: boolean("can_delegate").default(false), // Can this user delegate to others
  
  // Security fields
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorBackupCodes: text("two_factor_backup_codes").array(),
  twoFactorVerifiedAt: timestamp("two_factor_verified_at"),
  isActive: boolean("is_active").default(true),
  isTestAccount: boolean("is_test_account").default(false),
  preferredLanguage: varchar("preferred_language", { length: 2 }).default("en"),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }).unique(),
  
  // WhatsApp Click-to-Chat fields (Option A - wa.me links)
  whatsappE164: varchar("whatsapp_e164", { length: 20 }), // E.164 format: +237612345678
  waOptIn: boolean("wa_opt_in").default(false), // User consent for WhatsApp notifications
  waLanguage: varchar("wa_language", { length: 2 }).default("fr"), // 'fr' | 'en'
  preferredChannel: text("preferred_channel").default("email"), // 'whatsapp' | 'sms' | 'email'
  
  passwordResetToken: text("password_reset_token"),
  passwordResetExpiry: timestamp("password_reset_expiry"),
  deletionRequested: boolean("deletion_requested").default(false),
  deletionRequestedAt: timestamp("deletion_requested_at"),
  deletionApprovedBy: integer("deletion_approved_by"), // Parent ID who approved deletion
  deletionApprovedAt: timestamp("deletion_approved_at"),
  firebaseUid: text("firebase_uid").unique(),
  facebookId: text("facebook_id").unique(),
  photoURL: text("photo_url"),
  lastLoginAt: timestamp("last_login_at"),
  profilePictureUrl: text("profile_picture_url"),
  isPwaUser: boolean("is_pwa_user").default(false),
  lastPwaAccess: timestamp("last_pwa_access"),
  pwaInstallDate: timestamp("pwa_install_date"),
  accessMethod: text("access_method").default("web"), // web, pwa, mobile
  
  // Teacher signature for bulletins (mandatory for principal teachers)
  teacherSignatureUrl: text("teacher_signature_url"),
  signatureUploadedAt: timestamp("signature_uploaded_at"),
  isPrincipalTeacher: boolean("is_principal_teacher").default(false),
  
  // EDUCAFRIC number for internal tracking (format: EDU-CM-XX-###)
  // TE=Teacher, ST=Student, PA=Parent - auto-generated
  educafricNumber: text("educafric_number").unique(),
  
  // Profile fields for Director/Teacher/Staff
  bio: text("bio"),
  position: text("position"),
  experience: integer("experience"),
  yearsInPosition: integer("years_in_position"),
  qualifications: text("qualifications"), // JSON string array
  languages: text("languages"), // JSON string array
  profileImage: text("profile_image"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// User achievements table
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(), // Format: YYYY-MM-DD
  type: text("type").notNull(), // 'Award', 'Certification', 'Infrastructure', 'Distinction', etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// FCM Tokens table for Firebase Cloud Messaging
export const fcmTokens = pgTable("fcm_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  token: text("token").notNull().unique(),
  deviceType: text("device_type"), // web, android, ios
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  isActive: boolean("is_active").default(true),
  lastUsedAt: timestamp("last_used_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Role Affiliations table for multirole support
// Allows users to have multiple roles (e.g., Director + Teacher, Parent + Teacher)
export const roleAffiliations = pgTable("role_affiliations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // User with multiple roles
  role: text("role").notNull(), // Secondary role: Teacher, Parent, Student, etc.
  schoolId: integer("school_id"), // School context for the role (if applicable)
  description: text("description"), // Descriptive text for the role
  status: text("status").default("active"), // active, inactive, pending
  metadata: jsonb("metadata"), // Additional role-specific data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
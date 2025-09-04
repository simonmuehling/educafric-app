// ===== USER SCHEMA MODULE =====
// Extracted from huge schema.ts to prevent crashes

import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password"), // Password can be null for teachers created by admin
  role: text("role").notNull(), // Primary role: SiteAdmin, Admin, Director, Teacher, Parent, Student, Freelancer, Commercial
  secondaryRoles: text("secondary_roles").array(),
  activeRole: text("active_role"), // Currently selected role for session
  roleHistory: jsonb("role_history"), // Track role switches and affiliations
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  gender: text("gender"),
  dateOfBirth: text("date_of_birth"), // Date de naissance au format YYYY-MM-DD
  placeOfBirth: text("place_of_birth"), // Lieu de naissance (ville, pays)
  phone: text("phone").unique(),
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
  isTestAccount: boolean("is_test_account").default(false),
  preferredLanguage: varchar("preferred_language", { length: 2 }).default("en"),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }).unique(),
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
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
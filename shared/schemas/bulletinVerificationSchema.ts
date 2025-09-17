// ===== BULLETIN VERIFICATION SCHEMA =====
// Professional bulletin verification system with QR code support

import { pgTable, text, serial, integer, boolean, timestamp, jsonb, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Bulletin verification records - secure tracking of issued bulletins
export const bulletinVerifications = pgTable("bulletin_verifications", {
  id: serial("id").primaryKey(),
  
  // Unique verification identifier
  verificationCode: text("verification_code").notNull().unique(), // UUID for QR code
  shortCode: text("short_code").notNull().unique(), // Human-readable code (8 chars)
  
  // Bulletin reference
  bulletinId: integer("bulletin_id").notNull(), // References bulletins table
  studentId: integer("student_id").notNull(),
  schoolId: integer("school_id").notNull(),
  
  // Academic context
  classId: integer("class_id").notNull(),
  term: text("term").notNull(),
  academicYear: text("academic_year").notNull(),
  
  // Verification metadata - embedded in QR code
  studentName: text("student_name").notNull(),
  studentMatricule: text("student_matricule").notNull(),
  className: text("class_name").notNull(),
  schoolName: text("school_name").notNull(),
  generalAverage: text("general_average"), // Stored as string for display
  classRank: integer("class_rank"),
  totalStudents: integer("total_students"),
  
  // Digital signature and security
  verificationHash: text("verification_hash").notNull(), // SHA-256 hash of key data
  digitalSignature: text("digital_signature"), // Optional digital signature
  
  // QR code data
  qrCodeData: text("qr_code_data").notNull(), // Full QR code content (URL)
  qrCodeImage: text("qr_code_image"), // Base64 encoded QR code image
  
  // Verification tracking
  isActive: boolean("is_active").default(true), // Can be deactivated
  verificationCount: integer("verification_count").default(0), // Times verified
  lastVerifiedAt: timestamp("last_verified_at"),
  lastVerifiedIP: text("last_verified_ip"),
  
  // Issue tracking
  issuedBy: integer("issued_by").notNull(), // User who generated the bulletin
  issuedAt: timestamp("issued_at").defaultNow(),
  approvedBy: integer("approved_by"), // Director/Admin who approved
  approvedAt: timestamp("approved_at"),
  
  // Expiration (bulletins can expire)
  expiresAt: timestamp("expires_at"), // Optional expiration date
  
  // Additional metadata
  issueMetadata: jsonb("issue_metadata"), // Additional issue info
  securityLevel: text("security_level").default("standard"), // standard, enhanced, maximum
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => {
  return {
    // Ensure one verification record per bulletin
    uniqueBulletinVerification: unique().on(table.bulletinId)
  };
});

// Verification access log - audit trail of who accessed/verified bulletins
export const bulletinVerificationLogs = pgTable("bulletin_verification_logs", {
  id: serial("id").primaryKey(),
  verificationId: integer("verification_id").notNull(), // References bulletinVerifications
  
  // Access details
  accessType: text("access_type").notNull(), // qr_scan, manual_lookup, api_access
  accessResult: text("access_result").notNull(), // success, invalid_code, expired, deactivated
  
  // User and session tracking
  accessedBy: integer("accessed_by"), // User ID if authenticated access
  sessionId: text("session_id"), // Session identifier
  userRole: text("user_role"), // Role of user accessing (parent, teacher, admin, public)
  
  // Technical details
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  geolocation: jsonb("geolocation"), // Optional location data
  
  // Verification context
  verificationMethod: text("verification_method"), // qr_code, search, direct_url
  referrer: text("referrer"), // Where the verification link came from
  
  // Additional metadata
  accessMetadata: jsonb("access_metadata"), // Additional access context
  
  createdAt: timestamp("created_at").defaultNow()
});

// Bulletin verification settings - school-level configuration
export const bulletinVerificationSettings = pgTable("bulletin_verification_settings", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull().unique(),
  
  // QR code configuration
  enableQRCodes: boolean("enable_qr_codes").default(true),
  qrCodeSize: integer("qr_code_size").default(100), // Pixels
  qrCodePosition: text("qr_code_position").default("bottom_right"), // bottom_left, bottom_right, bottom_center
  
  // Verification settings
  enablePublicVerification: boolean("enable_public_verification").default(true), // Anyone can verify
  requireAuthentication: boolean("require_authentication").default(false), // Require login to verify
  enableVerificationExpiry: boolean("enable_verification_expiry").default(false),
  defaultExpiryDays: integer("default_expiry_days").default(365), // Days until expiration
  
  // Security settings
  maxVerificationsPerHour: integer("max_verifications_per_hour").default(10), // Rate limiting
  enableGeolocation: boolean("enable_geolocation").default(false),
  enableAuditLog: boolean("enable_audit_log").default(true),
  securityLevel: text("security_level").default("standard"),
  
  // Display settings
  showStudentPhoto: boolean("show_student_photo").default(true),
  showSchoolLogo: boolean("show_school_logo").default(true),
  showDetailedGrades: boolean("show_detailed_grades").default(false), // Show subject breakdown
  
  // Custom verification page
  customVerificationMessage: text("custom_verification_message"),
  customVerificationMessageEn: text("custom_verification_message_en"),
  verificationPageBranding: jsonb("verification_page_branding"), // Colors, fonts, etc.
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Relations
export const bulletinVerificationRelations = relations(bulletinVerifications, ({ many }) => ({
  verificationLogs: many(bulletinVerificationLogs)
}));

export const verificationLogRelations = relations(bulletinVerificationLogs, ({ one }) => ({
  verification: one(bulletinVerifications, {
    fields: [bulletinVerificationLogs.verificationId],
    references: [bulletinVerifications.id]
  })
}));

// Zod schemas for validation
export const insertBulletinVerificationSchema = createInsertSchema(bulletinVerifications);
export const insertBulletinVerificationLogSchema = createInsertSchema(bulletinVerificationLogs);
export const insertBulletinVerificationSettingsSchema = createInsertSchema(bulletinVerificationSettings);

// Verification lookup schema
export const verifyBulletinSchema = z.object({
  verificationCode: z.string().min(1, "Verification code is required"),
  language: z.enum(['fr', 'en']).default('fr')
});

// QR code data schema
export const qrCodeDataSchema = z.object({
  v: z.string(), // Verification code
  s: z.string(), // School code
  t: z.string(), // Term
  y: z.string(), // Academic year
  h: z.string()  // Hash for integrity check
});

// Type exports
export type BulletinVerification = typeof bulletinVerifications.$inferSelect;
export type InsertBulletinVerification = z.infer<typeof insertBulletinVerificationSchema>;
export type BulletinVerificationLog = typeof bulletinVerificationLogs.$inferSelect;
export type InsertBulletinVerificationLog = z.infer<typeof insertBulletinVerificationLogSchema>;
export type BulletinVerificationSettings = typeof bulletinVerificationSettings.$inferSelect;
export type InsertBulletinVerificationSettings = z.infer<typeof insertBulletinVerificationSettingsSchema>;
export type VerifyBulletinInput = z.infer<typeof verifyBulletinSchema>;
export type QRCodeData = z.infer<typeof qrCodeDataSchema>;

// Utility functions for verification code generation
export const generateVerificationCode = () => {
  return crypto.randomUUID();
};

export const generateShortCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateVerificationHash = (data: {
  studentId: number;
  schoolId: number;
  term: string;
  academicYear: string;
  generalAverage?: string;
}) => {
  const crypto = require('crypto');
  const hashString = `${data.studentId}-${data.schoolId}-${data.term}-${data.academicYear}-${data.generalAverage || ''}`;
  return crypto.createHash('sha256').update(hashString).digest('hex');
};

// Verification URL generation
export const generateVerificationURL = (verificationCode: string, baseURL: string = '') => {
  return `${baseURL}/verify?code=${verificationCode}`;
};
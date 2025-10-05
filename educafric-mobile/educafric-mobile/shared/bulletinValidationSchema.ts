import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Bulletin validation records with QR codes and digital stamps
export const bulletinValidations = pgTable("bulletin_validations", {
  id: serial("id").primaryKey(),
  bulletinId: integer("bulletin_id").notNull(),
  studentId: integer("student_id").notNull(),
  schoolId: integer("school_id").notNull(),
  
  // QR Code validation
  qrCode: text("qr_code").notNull().unique(), // Generated QR code data
  qrCodeImageUrl: text("qr_code_image_url"), // QR code image URL
  validationHash: text("validation_hash").notNull(), // Cryptographic hash for verification
  
  // Digital signatures
  teacherSignatureHash: text("teacher_signature_hash"),
  directorSignatureHash: text("director_signature_hash"),
  schoolStampHash: text("school_stamp_hash"),
  
  // Validation metadata
  validationType: text("validation_type").notNull(), // 'qr_code', 'digital_signature', 'combined'
  validationLevel: text("validation_level").notNull(), // 'basic', 'enhanced', 'maximum'
  isValid: boolean("is_valid").default(true),
  validatedAt: timestamp("validated_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // Optional expiry for validation
  
  // Verification tracking
  verificationCount: integer("verification_count").default(0),
  lastVerifiedAt: timestamp("last_verified_at"),
  verificationHistory: jsonb("verification_history"), // Log of verification attempts
  
  // Anti-tampering
  originalBulletinHash: text("original_bulletin_hash").notNull(),
  currentBulletinHash: text("current_bulletin_hash").notNull(),
  integrityStatus: text("integrity_status").default("intact"), // intact, modified, corrupted
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// QR Code verification attempts
export const qrVerifications = pgTable("qr_verifications", {
  id: serial("id").primaryKey(),
  bulletinValidationId: integer("bulletin_validation_id").notNull(),
  verifierIp: text("verifier_ip"),
  verifierLocation: text("verifier_location"),
  verificationMethod: text("verification_method"), // 'scan', 'manual', 'api'
  verificationResult: text("verification_result"), // 'valid', 'invalid', 'expired', 'tampered'
  verificationData: jsonb("verification_data"), // Additional verification context
  timestamp: timestamp("timestamp").defaultNow(),
});

// School validation templates
export const schoolValidationTemplates = pgTable("school_validation_templates", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull(),
  templateName: text("template_name").notNull(),
  validationType: text("validation_type").notNull(),
  qrCodeStyle: jsonb("qr_code_style"), // QR code appearance settings
  stampPosition: jsonb("stamp_position"), // Where to place digital stamp
  signatureLayout: jsonb("signature_layout"), // Signature placement configuration
  validationRules: jsonb("validation_rules"), // Custom validation rules
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations will be defined in the main schema after all tables are imported

// Zod schemas
export const insertBulletinValidationSchema = createInsertSchema(bulletinValidations);
export const insertQrVerificationSchema = createInsertSchema(qrVerifications);
export const insertSchoolValidationTemplateSchema = createInsertSchema(schoolValidationTemplates);

export type BulletinValidation = typeof bulletinValidations.$inferSelect;
export type InsertBulletinValidation = z.infer<typeof insertBulletinValidationSchema>;
export type QrVerification = typeof qrVerifications.$inferSelect;
export type InsertQrVerification = z.infer<typeof insertQrVerificationSchema>;
export type SchoolValidationTemplate = typeof schoolValidationTemplates.$inferSelect;
export type InsertSchoolValidationTemplate = z.infer<typeof insertSchoolValidationTemplateSchema>;

// Validation configuration
export const VALIDATION_CONFIG = {
  qrCode: {
    size: 200, // QR code size in pixels
    errorCorrectionLevel: 'M' as const, // L, M, Q, H
    margin: 4,
    colorDark: '#000000',
    colorLight: '#FFFFFF',
  },
  security: {
    hashAlgorithm: 'SHA-256',
    keyRotationDays: 30,
    maxVerificationAttempts: 100,
    validityPeriod: '1 year',
  },
  stamps: {
    maxSize: '5MB',
    allowedFormats: ['PNG', 'JPG', 'SVG'],
    transparencyRequired: true,
    recommendedDPI: 300,
  }
} as const;

// Note: Relations will be defined in main schema.ts after all table imports
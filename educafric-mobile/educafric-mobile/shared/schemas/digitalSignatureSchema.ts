// ===== DIGITAL SIGNATURE SCHEMA MODULE =====
// For bulletin digital signatures by school administration

import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const digitalSignatures = pgTable("digital_signatures", {
  id: serial("id").primaryKey(),
  documentType: text("document_type").notNull(), // 'bulletin', 'transcript', 'certificate'
  documentId: text("document_id").notNull(), // Reference to the document being signed
  
  // Signatory information
  signatoryId: integer("signatory_id").notNull(), // User ID of the person signing
  signatoryName: text("signatory_name").notNull(),
  signatoryTitle: text("signatory_title").notNull(), // 'Chef d'Établissement', 'Directeur', etc.
  signatoryRole: text("signatory_role").notNull(), // 'Director', 'Principal', etc.
  
  // School information
  schoolId: integer("school_id").notNull(),
  
  // Signature details
  signatureType: text("signature_type").notNull().default("digital"), // 'digital', 'electronic'
  signatureHash: text("signature_hash").notNull(), // Cryptographic hash for verification
  signatureTimestamp: timestamp("signature_timestamp").defaultNow(),
  signatureDevice: text("signature_device"), // Device used for signing
  signatureIP: text("signature_ip"), // IP address of signing device
  
  // Document verification
  documentHash: text("document_hash").notNull(), // Hash of the document at time of signing
  verificationCode: text("verification_code").notNull(), // QR code data for verification
  
  // Status and metadata
  isValid: boolean("is_valid").default(true),
  revokedAt: timestamp("revoked_at"),
  revokedBy: integer("revoked_by"),
  revokedReason: text("revoked_reason"),
  
  // Audit trail
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Bulletin signatures tracking
export const bulletinSignatures = pgTable("bulletin_signatures", {
  id: serial("id").primaryKey(),
  bulletinId: text("bulletin_id").notNull(),
  studentId: integer("student_id").notNull(),
  schoolId: integer("school_id").notNull(),
  
  // Signature requirements
  requiredSignatures: jsonb("required_signatures"), // Array of required signature roles
  completedSignatures: jsonb("completed_signatures"), // Array of completed signatures
  
  // Status tracking
  status: text("status").notNull().default("draft"), // 'draft', 'pending_signature', 'signed', 'sent'
  signedAt: timestamp("signed_at"),
  sentAt: timestamp("sent_at"),
  
  // Delivery tracking
  sentToStudents: boolean("sent_to_students").default(false),
  sentToParents: boolean("sent_to_parents").default(false),
  deliveryTracking: jsonb("delivery_tracking"), // Track email/SMS delivery status
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Zod schemas for validation
export const insertDigitalSignatureSchema = createInsertSchema(digitalSignatures).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertBulletinSignatureSchema = createInsertSchema(bulletinSignatures).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertDigitalSignature = z.infer<typeof insertDigitalSignatureSchema>;
export type InsertBulletinSignature = z.infer<typeof insertBulletinSignatureSchema>;
export type SelectDigitalSignature = typeof digitalSignatures.$inferSelect;
export type SelectBulletinSignature = typeof bulletinSignatures.$inferSelect;
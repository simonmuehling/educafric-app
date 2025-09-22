// ARCHIVE SCHEMA - BULLETIN AND MASTERSHEET ARCHIVING SYSTEM
// Immutable archive storage for sent bulletins and mastersheets with full metadata

import { pgTable, serial, integer, text, timestamp, jsonb, boolean, varchar, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ===== ARCHIVED DOCUMENTS TABLE =====
// Stores immutable copies of sent bulletins and mastersheets
export const archivedDocuments = pgTable("archived_documents", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull(),
  type: text("type").notNull(), // 'bulletin' | 'mastersheet'
  bulletinId: integer("bulletin_id"), // Reference to original bulletin if type=bulletin
  classId: integer("class_id").notNull(),
  academicYear: text("academic_year").notNull(),
  term: text("term").notNull(), // 'Premier', 'Deuxième', 'Troisième'
  studentId: integer("student_id"), // Only for bulletins, null for mastersheets
  language: text("language").notNull(), // 'fr' | 'en'
  filename: text("filename").notNull(), // Original filename
  storageKey: text("storage_key").notNull(), // Object storage key or filesystem path
  checksumSha256: text("checksum_sha256").notNull(), // File integrity verification
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(), // File size
  
  // Recipients and delivery status
  recipients: jsonb("recipients"), // [{type: 'email'|'sms', value: string, status: 'sent'|'delivered'|'failed'|'pending'}]
  
  // Snapshot of essential data at time of archiving (immutable)
  snapshot: jsonb("snapshot"), // Essential bulletin/mastersheet data
  
  // Metadata
  meta: jsonb("meta"), // Additional metadata (generation options, versions, etc.)
  version: text("version").default("1.0"), // Archive format version
  
  // Audit fields
  sentAt: timestamp("sent_at").notNull(), // When document was sent
  sentBy: integer("sent_by").notNull(), // User ID who sent the document
  createdAt: timestamp("created_at").defaultNow(), // When archived
});

// ===== ARCHIVE ACCESS LOGS TABLE =====
// Audit trail for archive access and downloads
export const archiveAccessLogs = pgTable("archive_access_logs", {
  id: serial("id").primaryKey(),
  archiveId: integer("archive_id").notNull(),
  schoolId: integer("school_id").notNull(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(), // 'view' | 'download' | 'export'
  ip: text("ip"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ===== ZOD SCHEMAS =====

// Recipient schema for validation (define first)
export const recipientSchema = z.object({
  type: z.enum(['email', 'sms', 'whatsapp']),
  value: z.string(),
  status: z.enum(['sent', 'delivered', 'failed', 'pending']),
  sentAt: z.string().optional(),
  error: z.string().optional(),
});

export const recipientsArraySchema = z.array(recipientSchema);

// Manual Zod schemas for better compatibility
export const insertArchivedDocumentSchema = z.object({
  schoolId: z.number(),
  type: z.enum(['bulletin', 'mastersheet']),
  bulletinId: z.number().optional(),
  classId: z.number(),
  academicYear: z.string(),
  term: z.string(),
  studentId: z.number().optional(),
  language: z.enum(['fr', 'en']),
  filename: z.string(),
  storageKey: z.string(),
  checksumSha256: z.string(),
  sizeBytes: z.number(),
  recipients: z.array(recipientSchema).optional(),
  snapshot: z.any().optional(),
  meta: z.any().optional(),
  version: z.string().default("1.0"),
  sentAt: z.date(),
  sentBy: z.number(),
});

export const insertArchiveAccessLogSchema = z.object({
  archiveId: z.number(),
  schoolId: z.number(),
  userId: z.number(),
  action: z.enum(['view', 'download', 'export']),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
});

// Select schemas using drizzle inference
export const selectArchivedDocumentSchema = createSelectSchema(archivedDocuments);
export const selectArchiveAccessLogSchema = createSelectSchema(archiveAccessLogs);

// Derived types
export type ArchivedDocument = typeof archivedDocuments.$inferSelect;
export type NewArchivedDocument = z.infer<typeof insertArchivedDocumentSchema>;
export type ArchiveAccessLog = typeof archiveAccessLogs.$inferSelect;
export type NewArchiveAccessLog = z.infer<typeof insertArchiveAccessLogSchema>;

// ===== VALIDATION SCHEMAS =====

// Archive filter schema
export const archiveFilterSchema = z.object({
  academicYear: z.string().optional(),
  classId: z.number().optional(),
  term: z.string().optional(),
  type: z.enum(['bulletin', 'mastersheet']).optional(),
  studentId: z.number().optional(),
  search: z.string().optional(), // Search in filename, student name, etc.
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export type ArchiveFilter = z.infer<typeof archiveFilterSchema>;

// Archive response schema
export const archiveResponseSchema = z.object({
  documents: z.array(selectArchivedDocumentSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type ArchiveResponse = z.infer<typeof archiveResponseSchema>;
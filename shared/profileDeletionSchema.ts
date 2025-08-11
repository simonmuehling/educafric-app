import { pgTable, serial, integer, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Profile deletion requests table
export const profileDeletionRequests = pgTable("profile_deletion_requests", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  parentId: integer("parent_id").notNull(), // Parent who needs to approve
  reason: text("reason"), // Optional reason for deletion
  requestedAt: timestamp("requested_at").defaultNow(),
  status: text("status").default("pending"), // pending, approved, rejected, completed
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  completedAt: timestamp("completed_at"),
  notificationsSent: boolean("notifications_sent").default(false),
  emailsSent: boolean("emails_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema for inserting deletion requests
export const insertProfileDeletionRequestSchema = createInsertSchema(profileDeletionRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type ProfileDeletionRequest = typeof profileDeletionRequests.$inferSelect;
export type InsertProfileDeletionRequest = z.infer<typeof insertProfileDeletionRequestSchema>;

// Deletion confirmation emails log
export const deletionEmailsLog = pgTable("deletion_emails_log", {
  id: serial("id").primaryKey(),
  deletionRequestId: integer("deletion_request_id").notNull(),
  recipientId: integer("recipient_id").notNull(),
  recipientType: text("recipient_type").notNull(), // 'student' or 'parent'
  emailType: text("email_type").notNull(), // 'request', 'approval', 'goodbye'
  emailSent: boolean("email_sent").default(false),
  sentAt: timestamp("sent_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type DeletionEmailLog = typeof deletionEmailsLog.$inferSelect;
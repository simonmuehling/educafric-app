// ===== BULLETIN MANAGEMENT SCHEMA =====
// Complete bulletin system with workflow management

import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Main bulletins table
export const bulletins = pgTable("bulletins", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  teacherId: integer("teacher_id"), // Teacher who created it
  classId: integer("class_id").notNull(),
  schoolId: integer("school_id").notNull(),
  
  // Academic information
  term: text("term").notNull(), // "Premier Trimestre", "Deuxième Trimestre", etc.
  academicYear: text("academic_year").notNull(), // "2024-2025"
  
  // Simplified workflow status - SINGLE SIGNATURE ONLY
  status: text("status").notNull().default("draft"), // draft, approved, sent
  approvedAt: timestamp("approved_at"),
  sentAt: timestamp("sent_at"),
  
  // Who performed actions - SINGLE APPROVER
  approvedBy: integer("approved_by"), // Single approver (Teacher or Director)
  sentBy: integer("sent_by"), // Who sent the bulletin
  
  // Calculated grades
  generalAverage: decimal("general_average", { precision: 5, scale: 2 }),
  classRank: integer("class_rank"),
  totalStudentsInClass: integer("total_students_in_class"),
  
  // Comments and appreciations
  teacherComments: text("teacher_comments"),
  directorComments: text("director_comments"),
  workAppreciation: text("work_appreciation"), // "Satisfaisant", "Bien", etc.
  conductAppreciation: text("conduct_appreciation"),
  
  // PDF and digital signature
  pdfUrl: text("pdf_url"),
  digitalSignatureHash: text("digital_signature_hash"),
  qrCode: text("qr_code"),
  
  // Metadata
  metadata: jsonb("metadata"), // Additional data like school info, student photo, etc.
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Teacher grade submissions - individual marks submitted by teachers
export const teacherGradeSubmissions = pgTable("teacher_grade_submissions", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  studentId: integer("student_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  classId: integer("class_id").notNull(),
  schoolId: integer("school_id").notNull(),
  
  // Term and year
  term: text("term").notNull(),
  academicYear: text("academic_year").notNull(),
  
  // Grades by evaluation period
  firstEvaluation: decimal("first_evaluation", { precision: 5, scale: 2 }), // T1
  secondEvaluation: decimal("second_evaluation", { precision: 5, scale: 2 }), // T2  
  thirdEvaluation: decimal("third_evaluation", { precision: 5, scale: 2 }), // T3
  
  // Additional grade info
  coefficient: integer("coefficient").notNull().default(1),
  maxScore: decimal("max_score", { precision: 5, scale: 2 }).default("20"),
  
  // Calculated fields
  termAverage: decimal("term_average", { precision: 5, scale: 2 }),
  weighted_score: decimal("weighted_score", { precision: 5, scale: 2 }),
  
  // Teacher feedback
  subjectComments: text("subject_comments"),
  studentRank: integer("student_rank"), // Rank in this subject for the class
  
  // Submission status
  isSubmitted: boolean("is_submitted").default(false),
  submittedAt: timestamp("submitted_at"),
  
  // Director Review Status - NEW FIELDS
  reviewStatus: text("review_status").notNull().default("pending"), // pending, under_review, approved, returned, changes_requested
  reviewedBy: integer("reviewed_by"), // Director or Admin who reviewed
  reviewedAt: timestamp("reviewed_at"),
  reviewFeedback: text("review_feedback"), // Comments from director
  returnReason: text("return_reason"), // Specific reason if returned
  
  // Review workflow tracking
  reviewPriority: text("review_priority").default("normal"), // urgent, normal, low
  requiresAttention: boolean("requires_attention").default(false),
  lastStatusChange: timestamp("last_status_change").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Saved bulletins from BulletinCreationInterface - Simple, flexible storage
export const savedBulletins = pgTable("saved_bulletins", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull(),
  studentId: integer("student_id").notNull(),
  studentName: text("student_name").notNull(),
  classLabel: text("class_label").notNull(),
  trimester: text("trimester").notNull(),
  academicYear: text("academic_year").notNull(),
  
  // Subjects as JSON for flexibility (supports all bulletin types)
  subjects: jsonb("subjects").notNull(), // Array of subject objects with all CBA fields
  
  // Discipline data
  discipline: jsonb("discipline").notNull(), // {absJ, absNJ, late, sanctions}
  
  // General remarks and appreciations
  generalRemark: text("general_remark"),
  
  // Bulletin type and language
  bulletinType: text("bulletin_type"), // 'general-fr', 'general-en', 'technical-fr', 'technical-en'
  language: text("language").default("fr"), // 'fr' | 'en'
  
  // Status tracking
  status: text("status").notNull().default("draft"), // 'draft' | 'finalized' | 'archived'
  
  // Audit fields
  createdBy: integer("created_by").notNull(), // User ID who created
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  archivedAt: timestamp("archived_at"), // When it was archived
  archiveId: integer("archive_id"), // Reference to archivedDocuments if archived
});

// Bulletin workflow tracking - manages the complete process
export const bulletinWorkflow = pgTable("bulletin_workflow", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  classId: integer("class_id").notNull(),
  schoolId: integer("school_id").notNull(),
  term: text("term").notNull(),
  academicYear: text("academic_year").notNull(),
  
  // Simplified workflow status - SINGLE SIGNATURE ONLY
  currentStatus: text("current_status").notNull().default("awaiting_teacher_submissions"), 
  // awaiting_teacher_submissions, incomplete, ready_for_approval, approved, sent
  
  // Progress tracking
  totalSubjects: integer("total_subjects").notNull(),
  completedSubjects: integer("completed_subjects").default(0),
  missingSubjects: jsonb("missing_subjects"), // Array of missing subject IDs
  
  // Generated bulletin reference
  bulletinId: integer("bulletin_id"), // References bulletins table when created
  
  // Automation flags
  autoGenerateBulletin: boolean("auto_generate_bulletin").default(true),
  notifyOnComplete: boolean("notify_on_complete").default(true),
  
  // Timeline
  gradesDeadline: timestamp("grades_deadline"),
  reviewDeadline: timestamp("review_deadline"),
  
  // Notifications sent
  remindersSent: integer("reminders_sent").default(0),
  lastReminderSent: timestamp("last_reminder_sent"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Bulletin notifications - track who was notified about bulletins
export const bulletinNotifications = pgTable("bulletin_notifications", {
  id: serial("id").primaryKey(),
  bulletinId: integer("bulletin_id").notNull(),
  recipientType: text("recipient_type").notNull(), // "parent", "student"
  recipientId: integer("recipient_id").notNull(),
  
  // Contact methods
  recipientEmail: text("recipient_email"),
  recipientPhone: text("recipient_phone"),
  
  // Notification channels
  emailSent: boolean("email_sent").default(false),
  smsSent: boolean("sms_sent").default(false),
  whatsappSent: boolean("whatsapp_sent").default(false),
  pushNotificationSent: boolean("push_notification_sent").default(false),
  
  // Delivery status
  emailDelivered: boolean("email_delivered").default(false),
  smsDelivered: boolean("sms_delivered").default(false),
  whatsappDelivered: boolean("whatsapp_delivered").default(false),
  
  // Engagement tracking
  emailOpened: boolean("email_opened").default(false),
  emailOpenedAt: timestamp("email_opened_at"),
  bulletinDownloaded: boolean("bulletin_downloaded").default(false),
  bulletinDownloadedAt: timestamp("bulletin_downloaded_at"),
  bulletinViewed: boolean("bulletin_viewed").default(false),
  bulletinViewedAt: timestamp("bulletin_viewed_at"),
  
  // Metadata
  notificationLanguage: text("notification_language").default("fr"),
  deliveryMetadata: jsonb("delivery_metadata"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Grade Review History - tracks all review actions for audit trail
export const gradeReviewHistory = pgTable("grade_review_history", {
  id: serial("id").primaryKey(),
  gradeSubmissionId: integer("grade_submission_id").notNull(), // FK to teacherGradeSubmissions
  reviewerId: integer("reviewer_id").notNull(), // Director/Admin who performed the action
  reviewAction: text("review_action").notNull(), // approved, returned, changes_requested, under_review
  
  // Review details
  previousStatus: text("previous_status"), // Status before this action
  newStatus: text("new_status").notNull(), // Status after this action
  feedback: text("feedback"), // Director's comments/feedback
  returnReason: text("return_reason"), // Specific reason if returned/changes requested
  
  // Grade comparison (if grades were changed)
  previousGradeData: jsonb("previous_grade_data"), // Snapshot of grades before review
  newGradeData: jsonb("new_grade_data"), // Snapshot of grades after review
  
  // Review metadata
  reviewPriority: text("review_priority"), // urgent, normal, low
  timeSpentReviewing: integer("time_spent_reviewing"), // Minutes spent on review
  ipAddress: text("ip_address"), // For audit purposes
  userAgent: text("user_agent"), // Browser/device info
  
  createdAt: timestamp("created_at").defaultNow()
});

// Relations
export const bulletinRelations = relations(bulletins, ({ one, many }) => ({
  // Links to other tables
  workflow: one(bulletinWorkflow, {
    fields: [bulletins.id],
    references: [bulletinWorkflow.bulletinId]
  }),
  gradeSubmissions: many(teacherGradeSubmissions),
  notifications: many(bulletinNotifications)
}));

export const workflowRelations = relations(bulletinWorkflow, ({ one }) => ({
  bulletin: one(bulletins, {
    fields: [bulletinWorkflow.bulletinId],
    references: [bulletins.id]
  })
}));

export const gradeSubmissionRelations = relations(teacherGradeSubmissions, ({ many }) => ({
  reviewHistory: many(gradeReviewHistory)
}));

export const reviewHistoryRelations = relations(gradeReviewHistory, ({ one }) => ({
  gradeSubmission: one(teacherGradeSubmissions, {
    fields: [gradeReviewHistory.gradeSubmissionId],
    references: [teacherGradeSubmissions.id]
  })
}));

// Zod schemas for validation
export const insertBulletinSchema = createInsertSchema(bulletins);
export const insertTeacherGradeSubmissionSchema = createInsertSchema(teacherGradeSubmissions);
export const insertBulletinWorkflowSchema = createInsertSchema(bulletinWorkflow);
export const insertBulletinNotificationSchema = createInsertSchema(bulletinNotifications);
export const insertGradeReviewHistorySchema = createInsertSchema(gradeReviewHistory);
export const insertSavedBulletinSchema = createInsertSchema(savedBulletins).omit({ id: true, createdAt: true, updatedAt: true, archivedAt: true, archiveId: true });

// Specific schemas for review actions
export const reviewGradeSubmissionSchema = z.object({
  submissionId: z.number(),
  reviewAction: z.enum(['approved', 'returned', 'changes_requested', 'under_review']),
  feedback: z.string().optional(),
  returnReason: z.string().optional(),
  reviewPriority: z.enum(['urgent', 'normal', 'low']).default('normal')
});

export const bulkReviewSchema = z.object({
  submissionIds: z.array(z.number()),
  reviewAction: z.enum(['approved', 'returned', 'changes_requested']),
  feedback: z.string().optional(),
  returnReason: z.string().optional()
});

// Type exports
export type Bulletin = typeof bulletins.$inferSelect;
export type InsertBulletin = z.infer<typeof insertBulletinSchema>;
export type TeacherGradeSubmission = typeof teacherGradeSubmissions.$inferSelect;
export type InsertTeacherGradeSubmission = z.infer<typeof insertTeacherGradeSubmissionSchema>;
export type BulletinWorkflow = typeof bulletinWorkflow.$inferSelect;
export type InsertBulletinWorkflow = z.infer<typeof insertBulletinWorkflowSchema>;
export type BulletinNotification = typeof bulletinNotifications.$inferSelect;
export type InsertBulletinNotification = z.infer<typeof insertBulletinNotificationSchema>;
export type GradeReviewHistory = typeof gradeReviewHistory.$inferSelect;
export type InsertGradeReviewHistory = z.infer<typeof insertGradeReviewHistorySchema>;
export type ReviewGradeSubmissionInput = z.infer<typeof reviewGradeSubmissionSchema>;
export type BulkReviewInput = z.infer<typeof bulkReviewSchema>;
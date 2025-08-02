import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Core user system with multi-role support
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // Primary role: SiteAdmin, Admin, Director, Teacher, Parent, Student, Freelancer, Commercial
  secondaryRoles: text("secondary_roles").array(),
  activeRole: text("active_role"), // Currently selected role for session
  roleHistory: jsonb("role_history"), // Track role switches and affiliations
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  gender: text("gender"),
  phone: text("phone"),
  schoolId: integer("school_id"),
  // Subscription and payment fields
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  subscriptionPlan: text("subscription_plan"),
  subscriptionStatus: text("subscription_status").default("inactive"), // inactive, active, cancelled, expired
  subscriptionStart: text("subscription_start"),
  subscriptionEnd: text("subscription_end"),
  
  // Security fields
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorBackupCodes: text("two_factor_backup_codes").array(),
  twoFactorVerifiedAt: timestamp("two_factor_verified_at"),
  isTestAccount: boolean("is_test_account").default(false),
  preferredLanguage: varchar("preferred_language", { length: 2 }).default("en"),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpiry: timestamp("password_reset_expiry"),
  firebaseUid: text("firebase_uid").unique(),
  photoURL: text("photo_url"),
  lastLoginAt: timestamp("last_login_at"),
  profilePictureUrl: text("profile_picture_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notification preferences for each user
export const notificationSettings = pgTable("notification_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  notificationType: text("notification_type").notNull(), // 'grade', 'absence', 'payment', 'announcement', 'meeting', 'emergency'
  enabled: boolean("enabled").default(true),
  emailEnabled: boolean("email_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(false),
  pushEnabled: boolean("push_enabled").default(true),
  whatsappEnabled: boolean("whatsapp_enabled").default(false),
  priority: text("priority").default("medium"), // 'low', 'medium', 'high', 'urgent'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Multi-role affiliations table for complex relationships
export const userRoleAffiliations = pgTable("user_role_affiliations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull(), // Teacher, Parent, Commercial, Freelancer, Director, Admin
  schoolId: integer("school_id"), // For school-based roles
  description: text("description"), // "Enseignant de Mathématiques", "Parent de Marie Kamga"
  status: text("status").default("active"), // active, inactive, pending
  metadata: jsonb("metadata"), // Additional role-specific data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schools management
export const schools = pgTable("schools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // Public, Private
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  logoUrl: text("logo_url"),
  subscriptionStatus: text("subscription_status").default("inactive"),
  subscriptionPlan: text("subscription_plan"),
  primaryAdminId: integer("primary_admin_id"), // Directeur principal
  additionalAdmins: text("additional_admins").array(), // IDs des administrateurs supplémentaires
  adminSettings: jsonb("admin_settings"), // Configuration des permissions par admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Academic year and terms
export const academicYears = pgTable("academic_years", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  schoolId: integer("school_id").notNull(),
  isActive: boolean("is_active").default(false),
});

export const terms = pgTable("terms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  academicYearId: integer("academic_year_id").notNull(),
  isActive: boolean("is_active").default(false),
});

// Classes and subjects
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  level: text("level").notNull(),
  section: text("section"),
  schoolId: integer("school_id").notNull(),
  teacherId: integer("teacher_id"),
  academicYearId: integer("academic_year_id").notNull(),
  maxStudents: integer("max_students").default(30),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  nameFr: text("name_fr").notNull(),
  nameEn: text("name_en").notNull(),
  code: text("code").notNull().unique(),
  coefficient: decimal("coefficient", { precision: 3, scale: 2 }).default("1.00"),
  schoolId: integer("school_id").notNull(),
});

// Student enrollment
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  classId: integer("class_id").notNull(),
  academicYearId: integer("academic_year_id").notNull(),
  enrollmentDate: timestamp("enrollment_date").defaultNow(),
  status: text("status").default("active"), // active, inactive, transferred
});

// Enhanced Bulletin System - Core bulletin table with QR/3D verification
export const bulletins = pgTable("bulletins", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  termId: integer("term_id").notNull(),
  academicYearId: integer("academic_year_id").notNull(),
  classId: integer("class_id").notNull(),
  schoolId: integer("school_id").notNull(),
  
  // Workflow status - Enhanced validation system
  status: text("status").default("draft"), // draft, pending, approved, rejected, sent
  submittedBy: integer("submitted_by"), // Teacher who created initial bulletin
  approvedBy: integer("approved_by"), // Director who approved
  rejectedBy: integer("rejected_by"), // Director who rejected
  sentBy: integer("sent_by"), // Director who sent to parents
  
  // Workflow comments and tracking
  submissionComment: text("submission_comment"), // Teacher's comment when submitting
  approvalComment: text("approval_comment"), // Director's comment when approving
  rejectionComment: text("rejection_comment"), // Director's comment when rejecting
  trackingNumber: text("tracking_number").unique(), // Unique tracking number for bulletin
  
  // Timestamps
  submittedAt: timestamp("submitted_at"), // When teacher submitted for approval
  approvedAt: timestamp("approved_at"), // When director approved
  rejectedAt: timestamp("rejected_at"), // When director rejected
  sentAt: timestamp("sent_at"), // When sent to parents
  
  // Academic calculations
  totalPoints: decimal("total_points", { precision: 6, scale: 2 }),
  totalCoefficients: decimal("total_coefficients", { precision: 6, scale: 2 }),
  generalAverage: decimal("general_average", { precision: 5, scale: 2 }),
  classRank: integer("class_rank"),
  totalStudentsInClass: integer("total_students_in_class"),
  
  // Authentication & Verification System
  qrCode: text("qr_code").unique(), // QR code for verification
  verificationCode: text("verification_code").unique(), // 3D verification code
  securityHash: text("security_hash"), // Hash for document integrity
  parentVerified: boolean("parent_verified").default(false),
  parentVerifiedAt: timestamp("parent_verified_at"),
  parentVerificationIP: text("parent_verification_ip"),
  
  // Comments and notes
  teacherComments: text("teacher_comments"),
  directorComments: text("director_comments"),
  disciplinaryNotes: text("disciplinary_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual grades for each subject in a bulletin with enhanced verification
export const bulletinGrades = pgTable("bulletin_grades", {
  id: serial("id").primaryKey(),
  bulletinId: integer("bulletin_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  
  // Grade components
  grade: decimal("grade", { precision: 4, scale: 2 }).notNull(), // 0-20 scale
  coefficient: decimal("coefficient", { precision: 3, scale: 2 }).notNull(),
  points: decimal("points", { precision: 6, scale: 2 }), // grade * coefficient
  
  // Grade breakdown (optional detailed components)
  assignments: jsonb("assignments"), // Individual assignment grades
  participation: decimal("participation", { precision: 4, scale: 2 }),
  homework: decimal("homework", { precision: 4, scale: 2 }),
  tests: decimal("tests", { precision: 4, scale: 2 }),
  
  // Status and workflow
  status: text("status").default("pending"), // pending, submitted, approved
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  
  // Comments
  teacherComment: text("teacher_comment"),
  internalNotes: text("internal_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bulletin approval workflow and history
export const bulletinApprovals = pgTable("bulletin_approvals", {
  id: serial("id").primaryKey(),
  bulletinId: integer("bulletin_id").notNull(),
  userId: integer("user_id").notNull(), // Who performed the action
  action: text("action").notNull(), // submitted, approved, rejected, published
  previousStatus: text("previous_status"),
  newStatus: text("new_status"),
  comments: text("comments"),
  metadata: jsonb("metadata"), // Additional approval data
  timestamp: timestamp("timestamp").defaultNow(),
});

// Templates for bulletin generation
export const bulletinTemplates = pgTable("bulletin_templates", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull(),
  name: text("name").notNull(),
  type: text("type").default("standard"), // standard, detailed, summary
  template: jsonb("template"), // Template configuration
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Parent verification logs for QR/3D code scanning
export const bulletinVerifications = pgTable("bulletin_verifications", {
  id: serial("id").primaryKey(),
  bulletinId: integer("bulletin_id").notNull(),
  parentId: integer("parent_id").notNull(),
  verificationType: text("verification_type").notNull(), // qr_scan, code_entry, manual_check
  verificationCode: text("verification_code"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  location: jsonb("location"), // GPS coordinates if available
  success: boolean("success").notNull(),
  errorMessage: text("error_message"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Digital signatures for bulletins (Director, Principal Teacher)
export const bulletinSignatures = pgTable("bulletin_signatures", {
  id: serial("id").primaryKey(),
  bulletinId: integer("bulletin_id"),
  batchSignatureId: text("batch_signature_id"), // For bulk signing multiple bulletins
  classId: integer("class_id"), // For class-wide signatures
  schoolId: integer("school_id").notNull(),
  
  // Signer information
  signerId: integer("signer_id").notNull(),
  signerRole: text("signer_role").notNull(), // director, principal_teacher, admin
  signerName: text("signer_name").notNull(),
  
  // Signature details
  signatureType: text("signature_type").notNull(), // individual, batch_class, batch_school
  signatureImageUrl: text("signature_image_url"), // URL to signature image
  digitalSignatureHash: text("digital_signature_hash").notNull(),
  
  // Metadata
  signedAt: timestamp("signed_at").defaultNow(),
  bulletinCount: integer("bulletin_count").default(1), // For batch signatures
  classesAffected: jsonb("classes_affected"), // Array of class IDs for batch
  
  // Verification
  verificationCode: text("verification_code"),
  isValid: boolean("is_valid").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// School logos and branding assets
export const schoolBranding = pgTable("school_branding", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull().unique(),
  schoolName: text("school_name").notNull(),
  
  // Logo assets
  logoUrl: text("logo_url"),
  letterheadUrl: text("letterhead_url"),
  stampUrl: text("stamp_url"),
  
  // Signature templates
  directorSignatureUrl: text("director_signature_url"),
  principalSignatureUrl: text("principal_signature_url"),
  adminSignatureUrl: text("admin_signature_url"),
  
  // Branding settings
  primaryColor: text("primary_color").default("#1a365d"),
  secondaryColor: text("secondary_color").default("#2d3748"),
  fontFamily: text("font_family").default("Arial"),
  
  // Document settings
  useWatermark: boolean("use_watermark").default(false),
  watermarkText: text("watermark_text"),
  footerText: text("footer_text"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for API validation 
export const insertBulletinSchema = createInsertSchema(bulletins).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertBulletinGradeSchema = createInsertSchema(bulletinGrades).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertBulletinApprovalSchema = createInsertSchema(bulletinApprovals).omit({
  id: true,
  timestamp: true
}).partial();

// Type definitions
export type Bulletin = typeof bulletins.$inferSelect;
export type BulletinGrade = typeof bulletinGrades.$inferSelect;
export type BulletinApproval = typeof bulletinApprovals.$inferSelect;
export type BulletinTemplate = typeof bulletinTemplates.$inferSelect;
export type BulletinVerification = typeof bulletinVerifications.$inferSelect;
export type BulletinSignature = typeof bulletinSignatures.$inferSelect;
export type SchoolBranding = typeof schoolBranding.$inferSelect;

export type InsertBulletin = z.infer<typeof insertBulletinSchema>;
export type InsertBulletinGrade = z.infer<typeof insertBulletinGradeSchema>;
export type InsertBulletinApproval = z.infer<typeof insertBulletinApprovalSchema>;

// Enhanced Bulletin System Zod Schemas for new QR/3D verification system
export const enhancedBulletinSchema = createInsertSchema(bulletins, {
  generalAverage: z.number().min(0).max(20),
  classRank: z.number().min(1),
  totalStudentsInClass: z.number().min(1),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const enhancedBulletinGradeSchema = createInsertSchema(bulletinGrades, {
  grade: z.number().min(0).max(20),
  coefficient: z.number().min(0.1).max(10),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const enhancedBulletinVerificationSchema = createInsertSchema(bulletinVerifications, {
  verificationType: z.enum(['qr_scan', 'code_entry', 'manual_check']),
  success: z.boolean(),
}).omit({
  id: true,
  timestamp: true,
});

// Type exports for enhanced bulletin system
export type EnhancedBulletin = typeof bulletins.$inferSelect;
export type EnhancedBulletinGrade = typeof bulletinGrades.$inferSelect;
export type EnhancedBulletinVerification = typeof bulletinVerifications.$inferSelect;

// Grades management
export const grades = pgTable("grades", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  classId: integer("class_id").notNull(),
  termId: integer("term_id").notNull(),
  value: decimal("value", { precision: 5, scale: 2 }).notNull(),
  maxValue: decimal("max_value", { precision: 5, scale: 2 }).default("20.00"),
  gradeType: text("grade_type").notNull(), // exam, test, homework, project
  description: text("description"),
  dateRecorded: timestamp("date_recorded").defaultNow(),
  publishedToParents: boolean("published_to_parents").default(false),
});

// Attendance tracking
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  classId: integer("class_id").notNull(),
  date: timestamp("date").notNull(),
  status: text("status").notNull(), // present, absent, late, excused
  teacherId: integer("teacher_id").notNull(),
  parentNotified: boolean("parent_notified").default(false),
  notificationSentAt: timestamp("notification_sent_at"),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Homework system
export const homework = pgTable("homework", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  subjectId: integer("subject_id").notNull(),
  classId: integer("class_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  dueDate: timestamp("due_date").notNull(),
  assignedDate: timestamp("assigned_date").defaultNow(),
  maxPoints: decimal("max_points", { precision: 5, scale: 2 }),
  isPublished: boolean("is_published").default(false),
});

export const homeworkSubmissions = pgTable("homework_submissions", {
  id: serial("id").primaryKey(),
  homeworkId: integer("homework_id").notNull(),
  studentId: integer("student_id").notNull(),
  submissionText: text("submission_text"),
  
  // Enhanced attachment system for files and photos
  attachments: jsonb("attachments"), // Array of {type, url, name, size, uploadedAt}
  attachmentUrls: text("attachment_urls").array(), // Legacy support - array of URLs
  
  // File upload metadata
  totalFileSize: integer("total_file_size").default(0), // Total size in bytes
  fileCount: integer("file_count").default(0),
  
  // Submission status and workflow  
  status: text("status").default("submitted"), // submitted, reviewed, graded, returned
  submittedAt: timestamp("submitted_at").defaultNow(),
  lastModifiedAt: timestamp("last_modified_at").defaultNow(),
  
  // Grading
  grade: decimal("grade", { precision: 5, scale: 2 }),
  feedback: text("feedback"),
  teacherGradedAt: timestamp("teacher_graded_at"),
  teacherId: integer("teacher_id"), // Who graded it
  
  // Additional metadata
  submissionSource: text("submission_source").default("web"), // web, mobile, camera
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

// Timetable management - Enhanced African Educational System
export const timetables = pgTable("timetables", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  schoolId: integer("school_id").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 1=Monday, 7=Sunday (including Saturday for African schools)
  startTime: text("start_time").notNull(), // HH:MM format (5-minute precision)
  endTime: text("end_time").notNull(),
  classroom: text("classroom"), // Room/Classroom designation
  academicYear: text("academic_year").notNull(), // "2024-2025" format
  
  // African-specific features
  validityPeriod: text("validity_period").default("weekly"), // weekly, monthly, quarterly, yearly
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  isClimateBreak: boolean("is_climate_break").default(false), // 12h-14h climate pause
  isAfricanSchedule: boolean("is_african_schedule").default(true), // Optimized for African context
  
  // Template and bulk management
  templateId: integer("template_id"), // Reference to reusable templates
  isTemplate: boolean("is_template").default(false),
  templateName: text("template_name"),
  batchId: text("batch_id"), // For bulk operations
  
  // Temporary and replacement features
  isTemporary: boolean("is_temporary").default(false),
  replacementFor: integer("replacement_for"), // Original slot being replaced
  replacementReason: text("replacement_reason"),
  
  // Metadata and notes
  notes: text("notes"),
  conflictResolution: text("conflict_resolution"), // How conflicts were resolved
  notificationsSent: boolean("notifications_sent").default(false),
  
  // Audit trail
  createdBy: integer("created_by").notNull(),
  lastModifiedBy: integer("last_modified_by"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Legacy support - keeping old table structure for backwards compatibility
export const timetableSlots = pgTable("timetable_slots", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 1=Monday, 7=Sunday
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(),
  room: text("room"),
  academicYearId: integer("academic_year_id").notNull(),
  isActive: boolean("is_active").default(true),
});


// Timetable templates for reusability
export const timetableTemplates = pgTable("timetable_templates", {
  id: serial("id").primaryKey(),
  templateName: text("template_name").notNull(),
  schoolId: integer("school_id").notNull(),
  createdBy: integer("created_by").notNull(),
  description: text("description"),
  templateData: jsonb("template_data"), // Serialized timetable structure
  validityPeriod: text("validity_period").default("weekly"),
  isAfricanOptimized: boolean("is_african_optimized").default(true),
  includesClimateBreaks: boolean("includes_climate_breaks").default(true),
  includesSaturday: boolean("includes_saturday").default(true),
  usageCount: integer("usage_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Parent-student relationships
export const parentStudentRelations = pgTable("parent_student_relations", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull(),
  studentId: integer("student_id").notNull(),
  relationship: text("relationship").notNull(), // father, mother, guardian
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Communication logs
export const communicationLogs = pgTable("communication_logs", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  recipientId: integer("recipient_id").notNull(),
  type: text("type").notNull(), // sms, whatsapp, email, push
  subject: text("subject"),
  message: text("message").notNull(),
  status: text("status").default("pending"), // pending, sent, delivered, failed
  sentAt: timestamp("sent_at").defaultNow(),
  deliveredAt: timestamp("delivered_at"),
  metadata: jsonb("metadata"), // Additional data like phone numbers, email addresses
});

// Advanced messaging system
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  senderName: text("sender_name").notNull(),
  senderRole: text("sender_role").notNull(),
  recipientType: text("recipient_type").notNull(), // individual, class, all_teachers, all_parents, all_students, all
  recipientIds: text("recipient_ids").array(), // Array of recipient IDs
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // academic, administrative, urgent, general
  channels: text("channels").array(), // email, sms, app
  priority: text("priority").default("medium"), // low, medium, high, urgent
  attachments: text("attachments").array(),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  schoolId: integer("school_id"),
  parentMessageId: integer("parent_message_id"), // For replies
  threadId: text("thread_id"), // To group related messages
  sentAt: timestamp("sent_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Message recipients table for individual tracking
export const messageRecipients = pgTable("message_recipients", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull(),
  recipientId: integer("recipient_id").notNull(),
  recipientName: text("recipient_name").notNull(),
  recipientRole: text("recipient_role").notNull(),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  deliveredVia: text("delivered_via").array(), // email, sms, app
  deliveryStatus: jsonb("delivery_status"), // Status per channel
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment and subscription management
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  schoolId: integer("school_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  type: text("type").notNull(), // subscription, tuition, fees
  status: text("status").notNull(), // pending, completed, failed, refunded
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  description: text("description"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// System settings and configurations
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id"),
  key: text("key").notNull(),
  value: text("value"),
  type: text("type").default("string"), // string, number, boolean, json
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  school: one(schools, {
    fields: [users.schoolId],
    references: [schools.id],
  }),
  grades: many(grades),
  attendance: many(attendance),
  homework: many(homework),
  communications: many(communicationLogs),
  payments: many(payments),
  parentRelations: many(parentStudentRelations, { relationName: "parent" }),
  studentRelations: many(parentStudentRelations, { relationName: "student" }),
}));

export const schoolsRelations = relations(schools, ({ many }) => ({
  users: many(users),
  classes: many(classes),
  subjects: many(subjects),
  academicYears: many(academicYears),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  school: one(schools, {
    fields: [classes.schoolId],
    references: [schools.id],
  }),
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
  academicYear: one(academicYears, {
    fields: [classes.academicYearId],
    references: [academicYears.id],
  }),
  enrollments: many(enrollments),
  grades: many(grades),
  attendance: many(attendance),
  homework: many(homework),
  timetableSlots: many(timetableSlots),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  school: one(schools, {
    fields: [subjects.schoolId],
    references: [schools.id],
  }),
  grades: many(grades),
  homework: many(homework),
  timetableSlots: many(timetableSlots),
  timetables: many(timetables),
}));

export const timetablesRelations = relations(timetables, ({ one }) => ({
  class: one(classes, {
    fields: [timetables.classId],
    references: [classes.id],
  }),
  subject: one(subjects, {
    fields: [timetables.subjectId],
    references: [subjects.id],
  }),
  teacher: one(users, {
    fields: [timetables.teacherId],
    references: [users.id],
  }),
  school: one(schools, {
    fields: [timetables.schoolId],
    references: [schools.id],
  }),
  creator: one(users, {
    fields: [timetables.createdBy],
    references: [users.id],
  }),
  template: one(timetableTemplates, {
    fields: [timetables.templateId],
    references: [timetableTemplates.id],
  }),
}));

export const timetableTemplatesRelations = relations(timetableTemplates, ({ one, many }) => ({
  school: one(schools, {
    fields: [timetableTemplates.schoolId],
    references: [schools.id],
  }),
  creator: one(users, {
    fields: [timetableTemplates.createdBy],
    references: [users.id],
  }),
  timetables: many(timetables),
}));

export const gradesRelations = relations(grades, ({ one }) => ({
  student: one(users, {
    fields: [grades.studentId],
    references: [users.id],
  }),
  subject: one(subjects, {
    fields: [grades.subjectId],
    references: [subjects.id],
  }),
  teacher: one(users, {
    fields: [grades.teacherId],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [grades.classId],
    references: [classes.id],
  }),
  term: one(terms, {
    fields: [grades.termId],
    references: [terms.id],
  }),
}));

// Export types (schemas moved to shared/schemas.ts)
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type School = typeof schools.$inferSelect;
export type InsertSchool = typeof schools.$inferInsert;
export type Class = typeof classes.$inferSelect;
export type InsertClass = typeof classes.$inferInsert;
export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = typeof subjects.$inferInsert;
export type Grade = typeof grades.$inferSelect;
export type InsertGrade = typeof grades.$inferInsert;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof attendance.$inferInsert;
export type Homework = typeof homework.$inferSelect;
export type InsertHomework = typeof homework.$inferInsert;
export type HomeworkSubmission = typeof homeworkSubmissions.$inferSelect;
export type InsertHomeworkSubmission = typeof homeworkSubmissions.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export type CommunicationLog = typeof communicationLogs.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type MessageRecipient = typeof messageRecipients.$inferSelect;
export type InsertMessageRecipient = typeof messageRecipients.$inferInsert;
export type TimetableSlot = typeof timetableSlots.$inferSelect;
export type ParentStudentRelation = typeof parentStudentRelations.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;
export type AcademicYear = typeof academicYears.$inferSelect;
export type InsertAcademicYear = typeof academicYears.$inferInsert;
export type Term = typeof terms.$inferSelect;
export type InsertTerm = typeof terms.$inferInsert;

// Notification settings types
export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type InsertNotificationSettings = typeof notificationSettings.$inferInsert;

// Enhanced Timetable System Types
export type Timetable = typeof timetables.$inferSelect;
export type InsertTimetable = typeof timetables.$inferInsert;
export type TimetableTemplate = typeof timetableTemplates.$inferSelect;
export type InsertTimetableTemplate = typeof timetableTemplates.$inferInsert;

// Timetable Zod Schemas for Enhanced African Educational System
export const timetableSlotSchema = z.object({
  dayOfWeek: z.number().min(1).max(7, "Jour de la semaine doit être entre 1 (Lundi) et 7 (Dimanche)"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:MM)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:MM)"),
  subjectId: z.number().positive("ID matière requis"),
  teacherId: z.number().positive("ID enseignant requis"),
  classId: z.number().positive("ID classe requis"),
  schoolId: z.number().positive("ID école requis"),
  classroom: z.string().min(1, "Salle de classe requise").optional(),
  academicYear: z.string().min(1, "Année scolaire requise"),
  
  // African-specific features
  validityPeriod: z.enum(["weekly", "monthly", "quarterly", "yearly"]).default("weekly"),
  validFrom: z.date().optional(),
  validUntil: z.date().optional(),
  isClimateBreak: z.boolean().default(false),
  isAfricanSchedule: z.boolean().default(true),
  
  // Template and bulk management
  templateId: z.number().optional(),
  isTemplate: z.boolean().default(false),
  templateName: z.string().optional(),
  batchId: z.string().optional(),
  
  // Temporary and replacement features
  isTemporary: z.boolean().default(false),
  replacementFor: z.number().optional(),
  replacementReason: z.string().optional(),
  
  // Metadata
  notes: z.string().optional(),
  conflictResolution: z.string().optional(),
  notificationsSent: z.boolean().default(false),
  
  createdBy: z.number().positive("ID créateur requis"),
  lastModifiedBy: z.number().optional(),
  isActive: z.boolean().default(true)
});

export const timetableTemplateSchema = z.object({
  templateName: z.string().min(1, "Nom du template requis"),
  schoolId: z.number().positive("ID école requis"),
  createdBy: z.number().positive("ID créateur requis"),
  description: z.string().optional(),
  templateData: z.record(z.any()).optional(),
  validityPeriod: z.enum(["weekly", "monthly", "quarterly", "yearly"]).default("weekly"),
  isAfricanOptimized: z.boolean().default(true),
  includesClimateBreaks: z.boolean().default(true),
  includesSaturday: z.boolean().default(true),
  isActive: z.boolean().default(true)
});

// Bulk operations schema
export const bulkTimetableOperationSchema = z.object({
  operation: z.enum(["create", "update", "delete", "copy", "template"]),
  slotIds: z.array(z.number()).optional(),
  templateId: z.number().optional(),
  batchId: z.string().optional(),
  validityPeriod: z.enum(["weekly", "monthly", "quarterly", "yearly"]).optional(),
  targetClassIds: z.array(z.number()).optional(),
  modifications: z.record(z.any()).optional(),
  preserveConflicts: z.boolean().default(false),
  sendNotifications: z.boolean().default(true)
});

// African schedule configuration schema
export const africanScheduleConfigSchema = z.object({
  schoolId: z.number().positive(),
  includesSaturday: z.boolean().default(true),
  climateBreakStart: z.string().default("12:00"),
  climateBreakEnd: z.string().default("14:00"),
  schoolYearStart: z.string().default("October"),
  schoolYearEnd: z.string().default("July"),
  maxDailyHours: z.number().min(4).max(10).default(8),
  minBreakBetweenClasses: z.number().min(5).max(30).default(10), // minutes
  enableGeolocationTracking: z.boolean().default(true),
  automaticAttendanceMarking: z.boolean().default(true),
  parentNotifications: z.boolean().default(true)
});

// Insert schemas for API validation
export const insertTimetableSchema = createInsertSchema(timetables).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertTimetableTemplateSchema = createInsertSchema(timetableTemplates).omit({
  id: true,
  usageCount: true,
  createdAt: true,
  updatedAt: true
});

// Homework Submission Schema with File Upload Support
export const insertHomeworkSubmissionSchema = createInsertSchema(homeworkSubmissions).omit({
  id: true,
  submittedAt: true,
  lastModifiedAt: true,
  teacherGradedAt: true
});

export const homeworkSubmissionFileSchema = z.object({
  type: z.enum(['image', 'document', 'video', 'audio', 'other']),
  url: z.string().url('URL de fichier invalide'),
  name: z.string().min(1, 'Nom de fichier requis'),
  size: z.number().min(1, 'Taille de fichier requise'),
  mimeType: z.string().min(1, 'Type MIME requis'),
  uploadedAt: z.string().optional()
});

export const homeworkSubmissionSchema = z.object({
  homeworkId: z.number().positive('ID devoir requis'),
  submissionText: z.string().max(5000, 'Texte de soumission trop long').optional(),
  attachments: z.array(homeworkSubmissionFileSchema).max(5, 'Maximum 5 fichiers autorisés').optional(),
  submissionSource: z.enum(['web', 'mobile', 'camera']).default('web')
});

export type InsertTimetableData = z.infer<typeof insertTimetableSchema>;
export type InsertTimetableTemplateData = z.infer<typeof insertTimetableTemplateSchema>;
export type TimetableSlotData = z.infer<typeof timetableSlotSchema>;
export type TimetableTemplateData = z.infer<typeof timetableTemplateSchema>;

// Bulletin Workflow Types
export type BulletinWorkflow = z.infer<typeof bulletinWorkflowSchema>;
export type BulletinApprovalAction = z.infer<typeof bulletinApprovalActionSchema>;
export type BulletinSubmission = z.infer<typeof bulletinSubmissionSchema>;
export type BulletinSearch = z.infer<typeof bulletinSearchSchema>;

// Additional Bulletin types for enhanced system
export type EnhancedBulletinType = typeof bulletins.$inferSelect;
export type EnhancedInsertBulletin = typeof bulletins.$inferInsert;
export type EnhancedBulletinGradeType = typeof bulletinGrades.$inferSelect;
export type EnhancedInsertBulletinGrade = typeof bulletinGrades.$inferInsert;
export type EnhancedBulletinApprovalType = typeof bulletinApprovals.$inferSelect;
export type EnhancedInsertBulletinApproval = typeof bulletinApprovals.$inferInsert;
export type BulkTimetableOperation = z.infer<typeof bulkTimetableOperationSchema>;
export type AfricanScheduleConfig = z.infer<typeof africanScheduleConfigSchema>;

// Enhanced Bulletin Validation Schemas with Workflow Support
export const bulletinWorkflowSchema = z.object({
  status: z.enum(["draft", "pending", "approved", "rejected", "sent"], {
    required_error: "Statut du bulletin requis",
    invalid_type_error: "Statut de bulletin invalide"
  }),
  submissionComment: z.string().min(1, "Commentaire de soumission requis").max(500).optional(),
  approvalComment: z.string().min(1, "Commentaire d'approbation requis").max(500).optional(),
  rejectionComment: z.string().min(1, "Commentaire de rejet requis").max(500).optional(),
  trackingNumber: z.string().min(1, "Numéro de suivi requis").optional(),
});

export const bulletinApprovalActionSchema = z.object({
  bulletinId: z.number().positive("ID bulletin requis"),
  action: z.enum(["approve", "reject", "send"], {
    required_error: "Action requise",
    invalid_type_error: "Action invalide"
  }),
  comment: z.string().min(1, "Commentaire requis").max(500),
  notifyParents: z.boolean().default(true).optional(),
});

export const bulletinSubmissionSchema = z.object({
  bulletinId: z.number().positive("ID bulletin requis"),
  submissionComment: z.string().min(1, "Commentaire de soumission requis").max(500),
  requestUrgentReview: z.boolean().default(false).optional(),
});

export const bulletinSearchSchema = z.object({
  status: z.enum(["draft", "pending", "approved", "rejected", "sent"]).optional(),
  classId: z.number().positive().optional(),
  termId: z.number().positive().optional(),
  academicYearId: z.number().positive().optional(),
  teacherId: z.number().positive().optional(),
  studentId: z.number().positive().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(["submittedAt", "approvedAt", "rejectedAt", "sentAt", "studentName", "generalAverage"]).default("submittedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Device tracking system for tablets, smartwatches, and phones
export const trackedDevices = pgTable("tracked_devices", {
  id: text("id").primaryKey(), // UUID
  studentId: integer("student_id").notNull(),
  deviceType: text("device_type").notNull(), // tablet, smartwatch, phone
  deviceName: text("device_name").notNull(),
  macAddress: text("mac_address"),
  imei: text("imei"),
  batteryLevel: integer("battery_level"),
  isActive: boolean("is_active").default(true),
  lastSeen: timestamp("last_seen").defaultNow(),
  currentLatitude: decimal("current_latitude", { precision: 10, scale: 8 }),
  currentLongitude: decimal("current_longitude", { precision: 11, scale: 8 }),
  currentAddress: text("current_address"),
  locationAccuracy: decimal("location_accuracy", { precision: 8, scale: 2 }),
  trackingSettings: jsonb("tracking_settings"),
  emergencyContacts: jsonb("emergency_contacts"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const safeZones = pgTable("safe_zones", {
  id: text("id").primaryKey(),
  deviceId: text("device_id").notNull(),
  name: text("name").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  radius: integer("radius").notNull(),
  type: text("type").notNull(),
  isActive: boolean("is_active").default(true),
  entryNotification: boolean("entry_notification").default(true),
  exitNotification: boolean("exit_notification").default(true),
  timeRestrictions: jsonb("time_restrictions"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const locationAlerts = pgTable("location_alerts", {
  id: text("id").primaryKey(),
  deviceId: text("device_id").notNull(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  severity: text("severity").notNull(),
  isRead: boolean("is_read").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const deviceLocationHistory = pgTable("device_location_history", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  accuracy: decimal("accuracy", { precision: 8, scale: 2 }),
  address: text("address"),
  batteryLevel: integer("battery_level"),
  speed: decimal("speed", { precision: 6, scale: 2 }),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const zoneStatus = pgTable("zone_status", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull(),
  zoneId: text("zone_id").notNull(),
  isInZone: boolean("is_in_zone").notNull(),
  enteredAt: timestamp("entered_at"),
  exitedAt: timestamp("exited_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Table pour gérer les rôles multiples et permissions administratives
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  schoolId: integer("school_id").notNull(),
  role: text("role").notNull(), // Admin, Director, Teacher, etc.
  permissions: jsonb("permissions"), // Permissions spécifiques pour ce rôle dans cette école
  assignedBy: integer("assigned_by"), // ID de l'utilisateur qui a assigné ce rôle
  assignedAt: timestamp("assigned_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  validUntil: timestamp("valid_until"), // Pour les rôles temporaires
});

// Table pour gérer les permissions spécifiques par module
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull(),
  module: text("module").notNull(), // 'teacher-management', 'student-management', etc.
  permissions: jsonb("permissions"), // { read: true, write: false, delete: false }
  schoolId: integer("school_id").notNull(),
});

// Relations pour les rôles multiples
export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  school: one(schools, { fields: [userRoles.schoolId], references: [schools.id] }),
  assignedByUser: one(users, { fields: [userRoles.assignedBy], references: [users.id] })
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(userRoles, { fields: [rolePermissions.roleId], references: [userRoles.id] }),
  school: one(schools, { fields: [rolePermissions.schoolId], references: [schools.id] })
}));

// Export des nouveaux types
export type UserRole = typeof userRoles.$inferSelect;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertUserRole = typeof userRoles.$inferInsert;
export type InsertRolePermission = typeof rolePermissions.$inferInsert;

// Commercial Documents Management
export const commercialDocuments = pgTable("commercial_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Reference to users table
  originalTemplateId: varchar("original_template_id", { length: 255 }), // Reference template original
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'contract', 'proposal', 'quote', 'brochure'
  status: varchar("status", { length: 50 }).default("draft"), // 'draft', 'finalized', 'sent', 'signed'
  language: varchar("language", { length: 10 }).default("fr"),
  clientInfo: jsonb("client_info"), // {name, email, phone, institution, address}
  metadata: jsonb("metadata"), // signatures, timestamps, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Commercial Document relations
export const commercialDocumentsRelations = relations(commercialDocuments, ({ one }) => ({
  user: one(users, {
    fields: [commercialDocuments.userId],
    references: [users.id],
  }),
}));

// Commercial Document types
export type CommercialDocument = typeof commercialDocuments.$inferSelect;
export type InsertCommercialDocument = typeof commercialDocuments.$inferInsert;

// Commercial Document validation schema
export const insertCommercialDocumentSchema = createInsertSchema(commercialDocuments).extend({
  clientInfo: z.object({
    name: z.string().min(1, "Nom du client requis"),
    email: z.string().email("Email valide requis"),
    phone: z.string().optional(),
    institution: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
  metadata: z.object({
    signatures: z.array(z.object({
      signerId: z.number(),
      signerName: z.string(),
      timestamp: z.string(),
      hash: z.string().optional(),
    })).optional(),
    timestamps: z.object({
      draft: z.string().optional(),
      finalized: z.string().optional(),
      sent: z.string().optional(),
      signed: z.string().optional(),
    }).optional(),
  }).optional(),
});


// Teacher Absences Management - Enhanced Version
export const teacherAbsences = pgTable("teacher_absences", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  schoolId: integer("school_id").notNull(),
  classId: integer("class_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  absenceDate: text("absence_date").notNull(), // YYYY-MM-DD format
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  reason: text("reason").notNull(), // 'sick', 'personal', 'emergency', 'training', 'other'
  reasonCategory: text("reason_category").default("personal"), // medical, personal, emergency, official, other
  isPlanned: boolean("is_planned").default(false),
  
  // Enhanced absence management
  affectedClasses: jsonb("affected_classes"), // Array of {classId, className, subjectId, subjectName, period}
  totalAffectedStudents: integer("total_affected_students").default(0),
  priority: text("priority").default("medium"), // low, medium, high, urgent
  
  // Status workflow - enhanced
  status: text("status").default("reported"), // reported, notified, substitute_assigned, resolved, archived
  replacementTeacherId: integer("replacement_teacher_id"),
  substituteAssignedAt: timestamp("substitute_assigned_at"),
  substituteAssignedBy: integer("substitute_assigned_by"),
  substituteInstructions: text("substitute_instructions"),
  substituteConfirmed: boolean("substitute_confirmed").default(false),
  
  // Enhanced notification tracking
  parentsNotified: boolean("parents_notified").default(false),
  studentsNotified: boolean("students_notified").default(false),
  adminNotified: boolean("admin_notified").default(false),
  notificationsSent: boolean("notifications_sent").default(false),
  notificationsSentAt: timestamp("notifications_sent_at"),
  notificationMethod: text("notification_method"), // sms, email, whatsapp, push
  
  // Resolution and reporting
  isResolved: boolean("is_resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: integer("resolved_by"),
  resolutionNotes: text("resolution_notes"),
  impactAssessment: text("impact_assessment"), // low, medium, high impact on education
  
  // Documentation
  documentation: jsonb("documentation"), // Medical certificates, official letters, etc.
  attachmentUrls: text("attachment_urls").array(),
  notes: text("notes"),
  
  // Academic tracking
  academicYear: text("academic_year").default("2024-2025"),
  term: text("term").default("Trimestre 2"),
  
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teacherAbsenceNotifications = pgTable("teacher_absence_notifications", {
  id: serial("id").primaryKey(),
  absenceId: integer("absence_id").notNull(),
  recipientId: integer("recipient_id").notNull(),
  recipientType: text("recipient_type").notNull(), // 'parent', 'student', 'admin', 'teacher'
  channel: text("channel").notNull(), // 'app', 'email', 'sms'
  status: text("status").default("pending"), // 'pending', 'sent', 'delivered', 'failed'
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quick actions performed on teacher absences
export const teacherAbsenceActions = pgTable("teacher_absence_actions", {
  id: serial("id").primaryKey(),
  absenceId: integer("absence_id").notNull(),
  actionType: text("action_type").notNull(), // notify_parents, notify_students, assign_substitute, mark_resolved, generate_report
  performedBy: integer("performed_by").notNull(),
  actionDetails: jsonb("action_details"), // Specific data for each action type
  
  // Notification specifics
  targetAudience: text("target_audience"), // parents, students, admin, all
  notificationMethod: text("notification_method"), // sms, email, whatsapp, push
  messageTemplate: text("message_template"),
  recipientCount: integer("recipient_count").default(0),
  successfulDeliveries: integer("successful_deliveries").default(0),
  failedDeliveries: integer("failed_deliveries").default(0),
  
  // Status tracking
  status: text("status").default("pending"), // pending, in_progress, completed, failed
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Monthly absence reports
export const monthlyAbsenceReports = pgTable("monthly_absence_reports", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull(),
  generatedBy: integer("generated_by").notNull(),
  
  // Report period
  reportMonth: integer("report_month").notNull(), // 1-12
  reportYear: integer("report_year").notNull(),
  academicYear: text("academic_year").notNull(),
  
  // Statistics
  totalAbsences: integer("total_absences").default(0),
  resolvedAbsences: integer("resolved_absences").default(0),
  unresolvedAbsences: integer("unresolved_absences").default(0),
  averageResolutionTime: decimal("average_resolution_time", { precision: 5, scale: 2 }), // Hours
  mostAbsentTeacher: integer("most_absent_teacher"),
  mostCommonReason: text("most_common_reason"),
  
  // Impact analysis
  totalAffectedStudents: integer("total_affected_students").default(0),
  totalAffectedClasses: integer("total_affected_classes").default(0),
  totalNotificationsSent: integer("total_notifications_sent").default(0),
  substituteSuccessRate: decimal("substitute_success_rate", { precision: 5, scale: 2 }),
  
  // Report data
  reportData: jsonb("report_data"), // Detailed breakdown and charts data
  reportFileUrl: text("report_file_url"), // Generated PDF report
  
  // Status
  status: text("status").default("draft"), // draft, finalized, archived
  finalizedAt: timestamp("finalized_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Teacher Absence Relations
export const teacherAbsencesRelations = relations(teacherAbsences, ({ one, many }) => ({
  teacher: one(users, {
    fields: [teacherAbsences.teacherId],
    references: [users.id],
  }),
  school: one(schools, {
    fields: [teacherAbsences.schoolId],
    references: [schools.id],
  }),
  class: one(classes, {
    fields: [teacherAbsences.classId],
    references: [classes.id],
  }),
  subject: one(subjects, {
    fields: [teacherAbsences.subjectId],
    references: [subjects.id],
  }),
  replacementTeacher: one(users, {
    fields: [teacherAbsences.replacementTeacherId],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [teacherAbsences.createdBy],
    references: [users.id],
  }),
  notifications: many(teacherAbsenceNotifications),
}));

export const teacherAbsenceNotificationsRelations = relations(teacherAbsenceNotifications, ({ one }) => ({
  absence: one(teacherAbsences, {
    fields: [teacherAbsenceNotifications.absenceId],
    references: [teacherAbsences.id],
  }),
  recipient: one(users, {
    fields: [teacherAbsenceNotifications.recipientId],
    references: [users.id],
  }),
}));



// Parent Requests Management
export const parentRequests = pgTable("parent_requests", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull(),
  studentId: integer("student_id").notNull(),
  schoolId: integer("school_id").notNull(),
  type: text("type").notNull(), // 'absence_request', 'permission', 'complaint', 'information', 'meeting', 'document', 'other'
  category: text("category").notNull(), // 'academic', 'administrative', 'health', 'disciplinary', 'transportation', 'other'
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  priority: text("priority").default("medium"), // 'low', 'medium', 'high', 'urgent'
  status: text("status").default("pending"), // 'pending', 'in_progress', 'approved', 'rejected', 'resolved'
  requestedDate: text("requested_date"), // When the request should take effect (for absence requests, etc.)
  attachments: text("attachments").array(), // File URLs or references
  adminResponse: text("admin_response"),
  responseDate: timestamp("response_date"),
  processedBy: integer("processed_by"), // Admin/Director who processed the request
  notes: text("notes"), // Internal admin notes
  isUrgent: boolean("is_urgent").default(false),
  requiresApproval: boolean("requires_approval").default(true),
  notificationsSent: boolean("notifications_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const parentRequestResponses = pgTable("parent_request_responses", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull(),
  responderId: integer("responder_id").notNull(),
  response: text("response").notNull(),
  responseType: text("response_type").notNull(), // 'approval', 'rejection', 'clarification', 'information'
  isPublic: boolean("is_public").default(false), // Whether parents can see this response
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const parentRequestNotifications = pgTable("parent_request_notifications", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull(),
  recipientId: integer("recipient_id").notNull(),
  recipientType: text("recipient_type").notNull(), // 'parent', 'admin', 'teacher'
  channel: text("channel").notNull(), // 'app', 'email', 'sms'
  message: text("message").notNull(),
  status: text("status").default("pending"), // 'pending', 'sent', 'delivered', 'failed'
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Parent Request Relations
export const parentRequestsRelations = relations(parentRequests, ({ one, many }) => ({
  parent: one(users, {
    fields: [parentRequests.parentId],
    references: [users.id],
  }),
  student: one(users, {
    fields: [parentRequests.studentId],
    references: [users.id],
  }),
  school: one(schools, {
    fields: [parentRequests.schoolId],
    references: [schools.id],
  }),
  processor: one(users, {
    fields: [parentRequests.processedBy],
    references: [users.id],
  }),
  responses: many(parentRequestResponses),
  notifications: many(parentRequestNotifications),
}));

export const parentRequestResponsesRelations = relations(parentRequestResponses, ({ one }) => ({
  request: one(parentRequests, {
    fields: [parentRequestResponses.requestId],
    references: [parentRequests.id],
  }),
  responder: one(users, {
    fields: [parentRequestResponses.responderId],
    references: [users.id],
  }),
}));

export const parentRequestNotificationsRelations = relations(parentRequestNotifications, ({ one }) => ({
  request: one(parentRequests, {
    fields: [parentRequestNotifications.requestId],
    references: [parentRequests.id],
  }),
  recipient: one(users, {
    fields: [parentRequestNotifications.recipientId],
    references: [users.id],
  }),
}));

// Parent Request Types
export type ParentRequest = typeof parentRequests.$inferSelect;
export type InsertParentRequest = typeof parentRequests.$inferInsert;
export type ParentRequestResponse = typeof parentRequestResponses.$inferSelect;
export type InsertParentRequestResponse = typeof parentRequestResponses.$inferInsert;
export type ParentRequestNotification = typeof parentRequestNotifications.$inferSelect;
export type InsertParentRequestNotification = typeof parentRequestNotifications.$inferInsert;

// Parent Request Validation Schemas
export const insertParentRequestSchema = createInsertSchema(parentRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  type: z.enum(["absence_request", "permission", "complaint", "information", "meeting", "document", "other"]),
  category: z.enum(["academic", "administrative", "health", "disciplinary", "transportation", "other"]),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z.enum(["pending", "in_progress", "approved", "rejected", "resolved"]).default("pending"),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export const insertParentRequestResponseSchema = createInsertSchema(parentRequestResponses).omit({
  id: true,
  createdAt: true,
}).extend({
  responseType: z.enum(["approval", "rejection", "clarification", "information"]),
  response: z.string().min(1, "Response is required"),
});

export type InsertParentRequestData = z.infer<typeof insertParentRequestSchema>;
export type InsertParentRequestResponseData = z.infer<typeof insertParentRequestResponseSchema>;

// ===== TEACHER ABSENCE SYSTEM TYPES =====
export type TeacherAbsence = typeof teacherAbsences.$inferSelect;
export type InsertTeacherAbsence = typeof teacherAbsences.$inferInsert;
export type TeacherAbsenceAction = typeof teacherAbsenceActions.$inferSelect;
export type InsertTeacherAbsenceAction = typeof teacherAbsenceActions.$inferInsert;
export type MonthlyAbsenceReport = typeof monthlyAbsenceReports.$inferSelect;
export type InsertMonthlyAbsenceReport = typeof monthlyAbsenceReports.$inferInsert;

// Teacher Absence Validation Schemas
export const insertTeacherAbsenceSchema = createInsertSchema(teacherAbsences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  reason: z.string().min(1, "Reason is required"),
  reasonCategory: z.enum(["medical", "personal", "emergency", "official", "other"]),
  status: z.enum(["reported", "notified", "substitute_assigned", "resolved", "archived"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  absenceDate: z.string().min(1, "Date is required"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
});

export const insertTeacherAbsenceActionSchema = createInsertSchema(teacherAbsenceActions).omit({
  id: true,
  createdAt: true,
}).extend({
  actionType: z.enum(["notify_parents", "notify_students", "assign_substitute", "mark_resolved", "generate_report"]),
  targetAudience: z.enum(["parents", "students", "admin", "all"]).optional(),
  notificationMethod: z.enum(["sms", "email", "whatsapp", "push"]).optional(),
  status: z.enum(["pending", "in_progress", "completed", "failed"]),
});

export type InsertTeacherAbsenceData = z.infer<typeof insertTeacherAbsenceSchema>;
export type InsertTeacherAbsenceActionData = z.infer<typeof insertTeacherAbsenceActionSchema>;

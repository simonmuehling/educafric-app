// Online Classes Schema for Jitsi Meet Integration
// Premium module for real-time video classes

import { pgTable, text, serial, integer, boolean, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { schools, subjects, classes, users } from "../schema";

// Online courses table (enhanced from existing structure if any)
export const onlineCourses = pgTable("online_courses", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull().references(() => schools.id),
  title: text("title").notNull(),
  description: text("description"),
  subjectId: integer("subject_id").references(() => subjects.id),
  classId: integer("class_id").references(() => classes.id),
  teacherId: integer("teacher_id").notNull().references(() => users.id),
  language: text("language").default("fr"), // fr or en
  isActive: boolean("is_active").default(true),
  maxParticipants: integer("max_participants").default(50),
  allowRecording: boolean("allow_recording").default(true),
  requireApproval: boolean("require_approval").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Course enrollments (who can access what course)
export const courseEnrollments = pgTable("course_enrollments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => onlineCourses.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").notNull(), // 'teacher', 'student', 'observer', 'parent'
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  isActive: boolean("is_active").default(true)
});

// Individual class sessions (Jitsi rooms)
// Supports both flows: teacher-created (manual) and school-scheduled
export const classSessions = pgTable("class_sessions", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => onlineCourses.id),
  title: text("title").notNull(),
  description: text("description"),
  scheduledStart: timestamp("scheduled_start").notNull(),
  scheduledEnd: timestamp("scheduled_end"),
  actualStart: timestamp("actual_start"),
  actualEnd: timestamp("actual_end"),
  roomName: text("room_name").notNull().unique(), // Unique Jitsi room identifier
  roomPassword: text("room_password"), // Optional room password
  status: text("status").notNull().default("scheduled"), // scheduled, live, ended, canceled, recorded
  recordingUrl: text("recording_url"),
  recordingSize: integer("recording_size"), // bytes
  maxDuration: integer("max_duration").default(120), // minutes
  lobbyEnabled: boolean("lobby_enabled").default(true),
  waitingRoomEnabled: boolean("waiting_room_enabled").default(false),
  chatEnabled: boolean("chat_enabled").default(true),
  screenShareEnabled: boolean("screen_share_enabled").default(true),
  createdBy: integer("created_by").notNull().references(() => users.id),
  creatorType: text("creator_type").default("teacher"), // "teacher" (manual) or "school" (scheduled)
  recurrenceId: integer("recurrence_id").references(() => onlineClassRecurrences.id, { onDelete: "set null" }), // Link to recurrence rule if part of series
  notificationsSent: boolean("notifications_sent").default(false), // Track if students/parents notified
  metadata: text("metadata"), // JSON string for additional settings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Recurrence rules for scheduled sessions (school-created recurring events)
export const onlineClassRecurrences = pgTable("online_class_recurrences", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull().references(() => schools.id),
  courseId: integer("course_id").notNull().references(() => onlineCourses.id),
  teacherId: integer("teacher_id").notNull().references(() => users.id),
  classId: integer("class_id").notNull().references(() => classes.id),
  subjectId: integer("subject_id").references(() => subjects.id),
  title: text("title").notNull(),
  description: text("description"),
  
  // Recurrence pattern
  ruleType: text("rule_type").notNull(), // "daily", "weekly", "biweekly", "custom"
  interval: integer("interval").default(1), // Every N days/weeks
  byDay: text("by_day"), // For weekly: JSON array ["monday", "wednesday", "friday"]
  startTime: text("start_time").notNull(), // "14:00" format
  durationMinutes: integer("duration_minutes").notNull().default(60),
  
  // Date range
  startDate: timestamp("start_date").notNull(), // When recurrence starts
  endDate: timestamp("end_date"), // When recurrence ends (null = indefinite)
  
  // Generation tracking
  occurrencesGenerated: integer("occurrences_generated").default(0), // How many sessions created
  lastGenerated: timestamp("last_generated"), // Last time sessions were generated
  nextGeneration: timestamp("next_generation"), // Next scheduled generation
  
  // Status
  isActive: boolean("is_active").default(true),
  pausedAt: timestamp("paused_at"),
  pausedBy: integer("paused_by").references(() => users.id),
  pauseReason: text("pause_reason"),
  
  // Metadata
  maxDuration: integer("max_duration").default(120), // Max duration in minutes
  autoNotify: boolean("auto_notify").default(true), // Auto-send notifications to students/parents
  createdBy: integer("created_by").notNull().references(() => users.id),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Session attendance tracking
export const sessionAttendance = pgTable("session_attendance", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => classSessions.id),
  userId: integer("user_id").notNull().references(() => users.id),
  jitsiParticipantId: text("jitsi_participant_id"), // From Jitsi events
  joinedAt: timestamp("joined_at"),
  leftAt: timestamp("left_at"),
  durationSeconds: integer("duration_seconds").default(0),
  deviceType: text("device_type"), // mobile, desktop, tablet
  connectionQuality: text("connection_quality"), // good, fair, poor
  audioEnabled: boolean("audio_enabled").default(false),
  videoEnabled: boolean("video_enabled").default(false),
  screenShared: boolean("screen_shared").default(false),
  chatMessages: integer("chat_messages").default(0),
  wasRemoved: boolean("was_removed").default(false),
  leftReason: text("left_reason"), // voluntary, kicked, connection_lost, etc.
  createdAt: timestamp("created_at").defaultNow()
});

// Session recordings (for premium features)
export const sessionRecordings = pgTable("session_recordings", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => classSessions.id),
  filename: text("filename").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"), // bytes
  duration: integer("duration"), // seconds
  format: text("format").default("mp4"),
  quality: text("quality").default("720p"),
  processingStatus: text("processing_status").default("pending"), // pending, processing, ready, failed
  downloadCount: integer("download_count").default(0),
  expiresAt: timestamp("expires_at"), // Auto-deletion date
  createdAt: timestamp("created_at").defaultNow()
});

// Session invitations (for tracking who was invited)
export const sessionInvitations = pgTable("session_invitations", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => classSessions.id),
  userId: integer("user_id").notNull().references(() => users.id),
  invitedBy: integer("invited_by").notNull().references(() => users.id),
  invitationMethod: text("invitation_method").notNull(), // email, sms, whatsapp, push
  invitedAt: timestamp("invited_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
  response: text("response"), // accepted, declined, maybe
  notificationsSent: integer("notifications_sent").default(0),
  lastReminderSent: timestamp("last_reminder_sent")
});

// School online classes subscription (premium feature)
export const onlineClassesSubscriptions = pgTable("online_classes_subscriptions", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull().references(() => schools.id),
  isActive: boolean("is_active").default(false),
  plan: text("plan").default("premium"), // premium, enterprise
  monthlyPrice: integer("monthly_price").default(250000), // 250,000 CFA
  currency: text("currency").default("XAF"),
  activatedAt: timestamp("activated_at"),
  expiresAt: timestamp("expires_at"),
  autoRenew: boolean("auto_renew").default(true),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  lastPaymentAt: timestamp("last_payment_at"),
  nextPaymentAt: timestamp("next_payment_at"),
  gracePeriodEnds: timestamp("grace_period_ends"),
  canceledAt: timestamp("canceled_at"),
  cancelReason: text("cancel_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// NEW: Online class activations (manual by admin for schools OR direct purchase for teachers)
export const onlineClassActivations = pgTable("online_class_activations", {
  id: serial("id").primaryKey(),
  activatorType: text("activator_type").notNull(), // "school" or "teacher"
  activatorId: integer("activator_id").notNull(), // schoolId or teacherId (references users.id)
  durationType: text("duration_type").notNull(), // "daily", "weekly", "monthly", "quarterly", "semestral", "yearly"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default("active"), // "active", "expired", "cancelled"
  activatedBy: text("activated_by").notNull(), // "admin_manual" or "self_purchase"
  adminUserId: integer("admin_user_id"), // Admin who activated (if manual)
  paymentId: text("payment_id"), // Stripe/MTN payment reference (if purchase)
  paymentMethod: text("payment_method"), // "stripe", "mtn", "manual"
  amountPaid: integer("amount_paid"), // Amount in CFA (150,000 for teachers)
  notes: text("notes"), // Admin notes for manual activations
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// NEW: Usage logs for tracking online class usage by schools/teachers
export const onlineClassUsageLogs = pgTable("online_class_usage_logs", {
  id: serial("id").primaryKey(),
  activationId: integer("activation_id").notNull().references(() => onlineClassActivations.id),
  sessionId: integer("session_id").notNull().references(() => classSessions.id),
  teacherId: integer("teacher_id").notNull().references(() => users.id),
  schoolId: integer("school_id"), // Null if independent teacher
  sessionDuration: integer("session_duration"), // In minutes
  participantCount: integer("participant_count"),
  wasWithinAllowedWindow: boolean("was_within_allowed_window").default(true), // For schools with time restrictions
  createdAt: timestamp("created_at").defaultNow()
});

// Zod schemas for validation
export const insertOnlineCourseSchema = createInsertSchema(onlineCourses);

export const insertCourseEnrollmentSchema = createInsertSchema(courseEnrollments);

export const insertClassSessionSchema = createInsertSchema(classSessions);

export const insertSessionAttendanceSchema = createInsertSchema(sessionAttendance);

export const insertOnlineClassesSubscriptionSchema = createInsertSchema(onlineClassesSubscriptions);

export const insertOnlineClassActivationSchema = createInsertSchema(onlineClassActivations);

export const insertOnlineClassUsageLogSchema = createInsertSchema(onlineClassUsageLogs);

export const insertOnlineClassRecurrenceSchema = createInsertSchema(onlineClassRecurrences);

// TypeScript types
export type OnlineCourse = typeof onlineCourses.$inferSelect;
export type InsertOnlineCourse = z.infer<typeof insertOnlineCourseSchema>;

export type CourseEnrollment = typeof courseEnrollments.$inferSelect;
export type InsertCourseEnrollment = z.infer<typeof insertCourseEnrollmentSchema>;

export type ClassSession = typeof classSessions.$inferSelect;
export type InsertClassSession = z.infer<typeof insertClassSessionSchema>;

export type SessionAttendance = typeof sessionAttendance.$inferSelect;
export type InsertSessionAttendance = z.infer<typeof insertSessionAttendanceSchema>;

export type SessionRecording = typeof sessionRecordings.$inferSelect;

export type SessionInvitation = typeof sessionInvitations.$inferSelect;

export type OnlineClassesSubscription = typeof onlineClassesSubscriptions.$inferSelect;
export type InsertOnlineClassesSubscription = z.infer<typeof insertOnlineClassesSubscriptionSchema>;

export type OnlineClassActivation = typeof onlineClassActivations.$inferSelect;
export type InsertOnlineClassActivation = z.infer<typeof insertOnlineClassActivationSchema>;

export type OnlineClassUsageLog = typeof onlineClassUsageLogs.$inferSelect;
export type InsertOnlineClassUsageLog = z.infer<typeof insertOnlineClassUsageLogSchema>;

export type OnlineClassRecurrence = typeof onlineClassRecurrences.$inferSelect;
export type InsertOnlineClassRecurrence = z.infer<typeof insertOnlineClassRecurrenceSchema>;

// Extended schemas with relationships for API responses
export const classSessionWithDetailsSchema = insertClassSessionSchema.extend({
  courseName: z.string(),
  teacherName: z.string(),
  enrolledCount: z.number(),
  attendeeCount: z.number().optional()
});

export type ClassSessionWithDetails = z.infer<typeof classSessionWithDetailsSchema>;

// No additional imports needed - tables imported at top
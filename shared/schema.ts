// ===== REFACTORED SCHEMA SYSTEM =====
// Replaced huge 2,175-line file to prevent crashes and improve performance
// Now uses modular components for better memory management

// Import modular schemas
export * from "./schemas/userSchema";
export * from "./schemas/schoolSchema";
export * from "./schemas/academicSchema";
export * from "./schemas/messagingSchema";

// Import existing schema modules
export * from "./tutorialSchema";
export * from "./geolocationSchema";
export * from "./profileDeletionSchema";
export * from "./emailPreferencesSchema";
export * from "./delegationSchema";
export * from "./bulletinValidationSchema";

// Re-export for backward compatibility
import { users } from "./schemas/userSchema";
import { schools, classes, subjects } from "./schemas/schoolSchema";
import { grades, attendance, homework, homeworkSubmissions } from "./schemas/academicSchema";

export { users, schools, classes, subjects, grades, attendance, homework, homeworkSubmissions };

// Additional simplified tables for compatibility
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

// Missing exports for compatibility - prevent crashes
export const attendanceAutomation = pgTable("attendance_automation", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull(),
  isEnabled: boolean("is_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

export const teacherAbsences = pgTable("teacher_absences", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow()
});

export const parentRequests = pgTable("parent_requests", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull(),
  studentId: integer("student_id").notNull(),
  requestType: text("request_type").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow()
});

export const emailPreferences = pgTable("email_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  enableEmails: boolean("enable_emails").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

export const pwaAnalytics = pgTable("pwa_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  sessionId: text("session_id").notNull(),
  accessMethod: text("access_method").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const businessPartners = pgTable("business_partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow()
});

export const schoolPartnershipAgreements = pgTable("school_partnership_agreements", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull(),
  partnerId: integer("partner_id").notNull(),
  agreementType: text("agreement_type"),
  createdAt: timestamp("created_at").defaultNow()
});

export const internships = pgTable("internships", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  companyName: text("company_name").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow()
});

export const partnershipCommunications = pgTable("partnership_communications", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull(),
  message: text("message").notNull(),
  sentAt: timestamp("sent_at").defaultNow()
});

// Additional missing exports for geolocation services
export const routeOptimization = pgTable("route_optimization", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull(),
  optimizedRoute: jsonb("optimized_route"),
  createdAt: timestamp("created_at").defaultNow()
});

export const geofenceViolations = pgTable("geofence_violations", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull(),
  violationType: text("violation_type"),
  location: jsonb("location"),
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

export const emergencyAlerts = pgTable("emergency_alerts", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull(),
  alertType: text("alert_type"),
  location: jsonb("location"),
  isResolved: boolean("is_resolved").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

export const trackingDevices = pgTable("tracking_devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  deviceName: text("device_name"),
  deviceType: text("device_type"),
  isActive: boolean("is_active").default(true),
  lastLocation: jsonb("last_location"),
  batteryLevel: integer("battery_level"),
  lastUpdate: timestamp("last_update"),
  createdAt: timestamp("created_at").defaultNow()
});

// Communication related tables
export const communicationLogs = pgTable("communication_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  communicationType: text("communication_type"),
  content: text("content"),
  status: text("status").default("sent"),
  createdAt: timestamp("created_at").defaultNow()
});

export const timetableSlots = pgTable("timetable_slots", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull(),
  classId: integer("class_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  dayOfWeek: text("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  room: text("room"),
  createdAt: timestamp("created_at").defaultNow()
});

export const parentStudentRelations = pgTable("parent_student_relations", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull(),
  studentId: integer("student_id").notNull(),
  relationship: text("relationship"),
  createdAt: timestamp("created_at").defaultNow()
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  amount: text("amount").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow()
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  recipientId: integer("recipient_id").notNull(),
  content: text("content").notNull(),
  status: text("status").default("sent"),
  createdAt: timestamp("created_at").defaultNow()
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").default("info"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Missing geolocation table
export const locationTracking = pgTable("location_tracking", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

// Import Zod for schemas
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Insert schemas for validation
export const insertBusinessPartnerSchema = createInsertSchema(businessPartners);
export const insertSchoolPartnershipAgreementSchema = createInsertSchema(schoolPartnershipAgreements);
export const insertInternshipSchema = createInsertSchema(internships);
export const insertPartnershipCommunicationSchema = createInsertSchema(partnershipCommunications);
export const insertUserSchema = createInsertSchema(users);
export const insertSchoolSchema = createInsertSchema(schools);
export const insertClassSchema = createInsertSchema(classes);
export const insertSubjectSchema = createInsertSchema(subjects);
export const insertGradeSchema = createInsertSchema(grades);
export const insertAttendanceSchema = createInsertSchema(attendance);
export const insertHomeworkSchema = createInsertSchema(homework);
export const insertPaymentSchema = createInsertSchema(payments);
export const insertMessageSchema = createInsertSchema(messages);
export const insertNotificationSchema = createInsertSchema(notifications);
export const insertTeacherAbsenceSchema = createInsertSchema(teacherAbsences);
export const insertParentRequestSchema = createInsertSchema(parentRequests);
export const insertEmailPreferencesSchema = createInsertSchema(emailPreferences);

// Insert types
export type InsertBusinessPartner = z.infer<typeof insertBusinessPartnerSchema>;
export type InsertSchoolPartnershipAgreement = z.infer<typeof insertSchoolPartnershipAgreementSchema>;
export type InsertInternship = z.infer<typeof insertInternshipSchema>;
export type InsertPartnershipCommunication = z.infer<typeof insertPartnershipCommunicationSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type InsertGrade = z.infer<typeof insertGradeSchema>;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type InsertHomework = z.infer<typeof insertHomeworkSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertTeacherAbsence = z.infer<typeof insertTeacherAbsenceSchema>;
export type InsertParentRequest = z.infer<typeof insertParentRequestSchema>;
export type InsertEmailPreferences = z.infer<typeof insertEmailPreferencesSchema>;

// Basic types for compatibility
export type User = typeof users.$inferSelect;
export type School = typeof schools.$inferSelect;
export type Class = typeof classes.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type Grade = typeof grades.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type Homework = typeof homework.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type BusinessPartner = typeof businessPartners.$inferSelect;
export type SchoolPartnershipAgreement = typeof schoolPartnershipAgreements.$inferSelect;
export type Internship = typeof internships.$inferSelect;
export type PartnershipCommunication = typeof partnershipCommunications.$inferSelect;
export type TeacherAbsence = typeof teacherAbsences.$inferSelect;
export type ParentRequest = typeof parentRequests.$inferSelect;
export type EmailPreferences = typeof emailPreferences.$inferSelect;
export type CommunicationLog = typeof communicationLogs.$inferSelect;
export type TimetableSlot = typeof timetableSlots.$inferSelect;
export type ParentStudentRelation = typeof parentStudentRelations.$inferSelect;
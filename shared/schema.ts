// ===== REFACTORED SCHEMA SYSTEM =====
// Replaced huge 2,175-line file to prevent crashes and improve performance
// Now uses modular components for better memory management

// Import modular schemas
export * from "./schemas/userSchema";
export * from "./schemas/digitalSignatureSchema";
export * from "./schemas/schoolSchema";
export * from "./schemas/academicSchema";
export * from "./schemas/messagingSchema";
export * from "./schemas/bulletinSchema";
export * from "./schemas/bulletinExtensionsSchema";
export * from "./schemas/bulletinComprehensiveSchema"; // NEW: Comprehensive bulletin data (absences, sanctions, appreciations)
export * from "./schemas/bulletinVerificationSchema"; // NEW: Bulletin verification system
export * from "./schemas/classEnrollmentSchema"; // CRITICAL: Class enrollment for RBAC security
export * from "./schemas/sanctionsSchema"; // NEW: Disciplinary sanctions management
export * from "./schemas/librarySchema"; // NEW: Library books and recommendations management
export * from "./schemas/predefinedAppreciationsSchema"; // NEW: Predefined appreciations and competency templates
export * from "./schemas/archiveSchema"; // NEW: Archive system for bulletins and mastersheets
export * from "./schemas/annualReportSchema"; // NEW: Annual report system with signature, workflow, and archiving
export * from "./schemas/onlineClassesSchema"; // NEW: Online classes with Jitsi Meet integration (Premium feature)
export * from "./schemas/educafricNumberSchema"; // NEW: EDUCAFRIC number management system

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
import { bulletins, teacherGradeSubmissions, bulletinWorkflow, bulletinNotifications } from "./schemas/bulletinSchema";
import { studentAcademicInfo, studentDiscipline, studentFees, termPerformance, subjectPerformanceDetails, bulletinSettings } from "./schemas/bulletinExtensionsSchema";
import { bulletinComprehensive, bulletinSubjectCodes } from "./schemas/bulletinComprehensiveSchema";
import { sanctions } from "./schemas/sanctionsSchema";
import { 
  libraryBooks, 
  libraryRecommendations, 
  libraryRecommendationAudience, 
  libraryRecommendationDispatch, 
  webpushSubscriptions 
} from "./schemas/librarySchema";
import {
  competencyEvaluationSystems,
  predefinedAppreciations,
  competencyTemplates
} from "./schemas/predefinedAppreciationsSchema";
import {
  archivedDocuments,
  archiveAccessLogs
} from "./schemas/archiveSchema";
import {
  annualReportComprehensive
} from "./schemas/annualReportSchema";
import {
  educafricNumbers,
  educafricNumberCounters
} from "./schemas/educafricNumberSchema";

export { users, schools, classes, subjects, grades, attendance, homework, homeworkSubmissions, bulletins, teacherGradeSubmissions, bulletinWorkflow, bulletinNotifications, studentAcademicInfo, studentDiscipline, studentFees, termPerformance, subjectPerformanceDetails, bulletinSettings, bulletinComprehensive, bulletinSubjectCodes, sanctions, libraryBooks, libraryRecommendations, libraryRecommendationAudience, libraryRecommendationDispatch, webpushSubscriptions, competencyEvaluationSystems, predefinedAppreciations, competencyTemplates, archivedDocuments, archiveAccessLogs, annualReportComprehensive, educafricNumbers, educafricNumberCounters };

// Additional simplified tables for compatibility
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, numeric, date, unique, foreignKey } from "drizzle-orm/pg-core";

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

export const commercialActivities = pgTable("commercial_activities", {
  id: serial("id").primaryKey(),
  commercialId: integer("commercial_id").notNull(),
  activityType: text("activity_type").notNull(), // login, profile_update, lead_creation, document_access
  description: text("description"),
  metadata: jsonb("metadata"), // Additional activity data
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  schoolId: integer("school_id"),
  createdAt: timestamp("created_at").defaultNow()
});

export const businessPartners = pgTable("business_partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow()
});

// Timetables table for unified schedule management (Director ↔ Teacher synchronization)
export const timetables = pgTable("timetables", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  classId: integer("class_id").notNull(),
  subjectName: text("subject_name").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 1=Monday, 2=Tuesday, etc.
  startTime: text("start_time").notNull(), // Format: "08:00"
  endTime: text("end_time").notNull(), // Format: "09:00"
  room: text("room"),
  academicYear: text("academic_year").notNull(),
  term: text("term").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").notNull(), // Director/Admin who created it
  lastModifiedBy: integer("last_modified_by"), // Who last modified it
  notes: text("notes"), // Additional notes
}, (table) => ({
  // Prevent conflicts: same teacher can't have overlapping time slots on same day
  uniqueTeacherTimeSlot: unique("unique_teacher_time_slot").on(
    table.teacherId,
    table.dayOfWeek,
    table.startTime,
    table.endTime,
    table.academicYear,
    table.term
  ),
  // Prevent room conflicts: same room can't be used at same time
  uniqueRoomTimeSlot: unique("unique_room_time_slot").on(
    table.room,
    table.dayOfWeek,
    table.startTime,
    table.endTime,
    table.academicYear,
    table.term
  )
}));

// Timetable change notifications for real-time sync
export const timetableNotifications = pgTable("timetable_notifications", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  timetableId: integer("timetable_id").notNull(),
  changeType: text("change_type").notNull(), // 'created', 'updated', 'deleted'
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").notNull() // Director/Admin who made the change
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

// Table for room management
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  schoolId: integer("school_id").notNull(),
  type: text("type").default("classroom"),
  capacity: integer("capacity").default(30),
  building: text("building"),
  floor: text("floor"),
  equipment: text("equipment"),
  isOccupied: boolean("is_occupied").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
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
  type: text("type"),
  alertType: text("alert_type"),
  message: text("message"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  location: jsonb("location"),
  severity: text("severity"),
  isRead: boolean("is_read").default(false),
  isResolved: boolean("is_resolved").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

export const trackingDevices = pgTable("tracking_devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  studentId: integer("student_id"),
  deviceName: text("device_name"),
  deviceType: text("device_type"),
  isActive: boolean("is_active").default(true),
  currentLatitude: text("current_latitude"),
  currentLongitude: text("current_longitude"),
  locationAccuracy: text("location_accuracy"),
  currentAddress: text("current_address"),
  lastLocation: jsonb("last_location"),
  batteryLevel: integer("battery_level"),
  lastSeen: timestamp("last_seen"),
  trackingSettings: jsonb("tracking_settings"),
  lastUpdate: timestamp("last_update"),
  updatedAt: timestamp("updated_at"),
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

// 🔄 TABLE PASSERELLE PARENT-ENFANT : Support pour abonnements par enfant
export const parentChildSubscriptions = pgTable("parent_child_subscriptions", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull(),
  childId: integer("child_id").notNull(), // studentId
  planType: text("plan_type").notNull(), // 'parent_premium', 'parent_gps', etc.
  status: text("status").notNull().default("inactive"), // 'active', 'inactive', 'expired'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"), // null = abonnement sans fin
  paymentMethod: text("payment_method"), // 'stripe', 'orange_money', 'bank_transfer'
  lastPaymentDate: timestamp("last_payment_date"),
  nextPaymentDate: timestamp("next_payment_date"),
  autoRenew: boolean("auto_renew").default(false),
  // Règles de passerelle
  schoolPremiumRequired: boolean("school_premium_required").default(true),
  gatewayActive: boolean("gateway_active").default(false),
  // Métadonnées
  metadata: jsonb("metadata"), // Infos supplémentaires spécifiques
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// 🏫 TABLE ABONNEMENTS ÉCOLE : Support pour plans école
export const schoolSubscriptions = pgTable("school_subscriptions", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull(),
  planId: text("plan_id").notNull(), // 'ecole_500_plus', 'ecole_500_moins', etc.
  status: text("status").notNull().default("freemium"), // 'freemium', 'premium', 'trial', 'expired'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"), // null = plan permanent
  paymentMethod: text("payment_method"), // 'stripe', 'orange_money', 'bank_transfer'
  lastPaymentDate: timestamp("last_payment_date"),
  nextPaymentDate: timestamp("next_payment_date"),
  autoRenew: boolean("auto_renew").default(false),
  // NOUVEAU MODÈLE : EDUCAFRIC PAIE LES ÉCOLES
  educafricPayment: boolean("educafric_payment").default(true), // true = Educafric paie l'école
  quarterlyAmount: integer("quarterly_amount").default(0), // Montant trimestriel versé
  // Métadonnées
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// 🎓 TABLE ABONNEMENTS FREELANCER : Support pour répétiteurs
export const freelancerSubscriptions = pgTable("freelancer_subscriptions", {
  id: serial("id").primaryKey(),
  freelancerId: integer("freelancer_id").notNull(),
  planId: text("plan_id").notNull(), // 'repetiteur_professionnel_semestriel', etc.
  status: text("status").notNull().default("freemium"), // 'freemium', 'premium', 'trial', 'expired'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  paymentMethod: text("payment_method"), // 'stripe', 'orange_money', 'bank_transfer'
  lastPaymentDate: timestamp("last_payment_date"),
  nextPaymentDate: timestamp("next_payment_date"),
  autoRenew: boolean("auto_renew").default(false),
  // Limites freemium
  maxStudents: integer("max_students").default(10),
  // Métadonnées
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
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

// Device Location History Table
export const deviceLocationHistory = pgTable("device_location_history", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  accuracy: text("accuracy"),
  address: text("address"),
  batteryLevel: integer("battery_level"),
  speed: text("speed"),
  timestamp: timestamp("timestamp").defaultNow()
});

// Zone Status Table
export const zoneStatus = pgTable("zone_status", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull(),
  zoneId: text("zone_id").notNull(),
  isInZone: boolean("is_in_zone").default(false),
  enteredAt: timestamp("entered_at"),
  exitedAt: timestamp("exited_at"),
  updatedAt: timestamp("updated_at").defaultNow()
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

// Notification Preferences Table - PWA notification settings per user
export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(), // One preference set per user
  pushNotifications: boolean("push_notifications").default(true),
  emailNotifications: boolean("email_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(false),
  phone: text("phone"), // Optional phone number for SMS notifications
  autoOpen: boolean("auto_open").default(true), // PWA auto-opening preference
  soundEnabled: boolean("sound_enabled").default(true),
  vibrationEnabled: boolean("vibration_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ===== ENHANCED GRADE ENTRY STATUS ENUMS =====
export const GRADE_ENTRY_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  RETURNED: 'returned',
  APPROVED: 'approved',
  PUBLISHED: 'published'
} as const;

export type GradeEntryStatus = typeof GRADE_ENTRY_STATUS[keyof typeof GRADE_ENTRY_STATUS];

// Import Zod for schemas
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
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
export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences);

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
export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;

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
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type CommunicationLog = typeof communicationLogs.$inferSelect;
export type TimetableSlot = typeof timetableSlots.$inferSelect;
export type ParentStudentRelation = typeof parentStudentRelations.$inferSelect;

// Daily connection tracking for analytics and reporting
export const dailyConnections = pgTable("daily_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  userEmail: text("user_email").notNull(),
  userRole: text("user_role").notNull(),
  userName: text("user_name").notNull(),
  ipAddress: text("ip_address").notNull(),
  location: jsonb("location"), // {country, city, region}
  userAgent: text("user_agent"),
  connectionDate: timestamp("connection_date").defaultNow(),
  sessionId: text("session_id"),
  accessMethod: text("access_method").default("web"), // web, mobile, pwa
  createdAt: timestamp("created_at").defaultNow()
});

// Page/module visit tracking for detailed analytics
export const pageVisits = pgTable("page_visits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  userEmail: text("user_email").notNull(),
  userRole: text("user_role").notNull(),
  pagePath: text("page_path").notNull(), // /dashboard, /overview, etc.
  moduleName: text("module_name"), // Vue d'ensemble, Gestion Étudiants, etc.
  dashboardType: text("dashboard_type"), // Director, Teacher, Parent, etc.
  timeSpent: integer("time_spent"), // seconds
  ipAddress: text("ip_address").notNull(),
  sessionId: text("session_id"),
  visitDate: timestamp("visit_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertDailyConnectionSchema = createInsertSchema(dailyConnections);
export const insertPageVisitSchema = createInsertSchema(pageVisits);
export type InsertDailyConnection = z.infer<typeof insertDailyConnectionSchema>;
export type InsertPageVisit = z.infer<typeof insertPageVisitSchema>;
export type DailyConnection = typeof dailyConnections.$inferSelect;
export type PageVisit = typeof pageVisits.$inferSelect;

// Digital Signatures Table
export const signatures = pgTable("signatures", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  userRole: text("user_role").notNull(), // 'director', 'principal_teacher'
  signatureData: text("signature_data").notNull(), // Base64 image data
  signatureType: text("signature_type").notNull(), // 'drawn', 'uploaded'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export type InsertSignature = typeof signatures.$inferInsert;
export type Signature = typeof signatures.$inferSelect;

// Offer Letter Templates Table
export const offerLetterTemplates = pgTable("offer_letter_templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  templateName: text("template_name").notNull(),
  commercialPhone: text("commercial_phone").notNull(),
  recipientTitle: text("recipient_title").notNull(),
  schoolName: text("school_name").notNull(),
  schoolAddress: text("school_address").notNull(),
  salutation: text("salutation").notNull(),
  signatureName: text("signature_name").notNull(),
  signatureFunction: text("signature_function").notNull(),
  customFields: jsonb("custom_fields"), // For email, secondaryPhone, department
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertOfferLetterTemplateSchema = createInsertSchema(offerLetterTemplates);
export type InsertOfferLetterTemplate = z.infer<typeof insertOfferLetterTemplateSchema>;
export type OfferLetterTemplate = typeof offerLetterTemplates.$inferSelect;

// ===== COMPREHENSIVE MULTI-USER BULLETIN SYSTEM TABLES =====

// 1. Teacher Subject Assignments - Track which teachers can input grades for which subjects/classes
export const teacherSubjectAssignments = pgTable("teacher_subject_assignments", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  classId: integer("class_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  // Composite unique constraint to prevent duplicate teacher-subject-class assignments
  teacherSubjectClassUnique: unique().on(table.schoolId, table.teacherId, table.classId, table.subjectId)
}));

// 2. Grade Entries - Versioned grade inputs from teachers (separate from final bulletins)
export const gradeEntries = pgTable("grade_entries", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull(),
  studentId: integer("student_id").notNull(),
  classId: integer("class_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  termId: integer("term_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  score: numeric("score", { precision: 5, scale: 2 }).notNull(), // e.g., 15.75
  coefficient: numeric("coefficient", { precision: 3, scale: 1 }).default("1.0"), // e.g., 2.0
  status: text("status").notNull().default("draft"), // 'draft','submitted','returned','approved','published'
  version: integer("version").default(1),
  comment: text("comment"),
  // Enhanced audit trail fields
  approvedBy: integer("approved_by"), // User ID who approved the grade
  approvedAt: timestamp("approved_at"), // When the grade was approved
  returnedBy: integer("returned_by"), // User ID who returned the grade for revision
  returnedReason: text("returned_reason"), // Reason for returning the grade
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  // Composite unique constraint to prevent duplicate grade entries per version
  gradeEntryVersionUnique: unique().on(table.schoolId, table.studentId, table.classId, table.subjectId, table.termId, table.teacherId, table.version)
}));

// 3. Grading Scales - Configurable grading scales for schools
export const gradingScales = pgTable("grading_scales", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull(),
  name: text("name").notNull(), // e.g., "Excellent", "Good", "Average"
  min: numeric("min", { precision: 5, scale: 2 }).notNull(), // e.g., 18.00
  max: numeric("max", { precision: 5, scale: 2 }).notNull(), // e.g., 20.00
  label: text("label").notNull(), // Display label
  color: text("color").notNull(), // Hex color code
  order: integer("order").default(0), // For sorting
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// 4. Term Configuration - Academic term configuration
export const termConfig = pgTable("term_config", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull(),
  academicYearId: integer("academic_year_id").notNull(),
  name: text("name").notNull(), // e.g., "Premier Trimestre", "Deuxième Trimestre"
  shortName: text("short_name"), // e.g., "T1", "T2"
  order: integer("order").notNull(), // 1, 2, 3, etc.
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  active: boolean("active").default(true),
  isCurrent: boolean("is_current").default(false), // Only one can be current per school
  gradeSubmissionDeadline: date("grade_submission_deadline"),
  bulletinPublicationDate: date("bulletin_publication_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// 5. Bulletin Signatories - School signature configuration
export const bulletinSignatories = pgTable("bulletin_signatories", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull().unique(), // One record per school
  principalName: text("principal_name").notNull(),
  principalTitle: text("principal_title").notNull(), // e.g., "Directeur", "Principal"
  principalSignatureUrl: text("principal_signature_url"), // URL to signature image
  
  // Secondary signatory (optional)
  secondaryName: text("secondary_name"),
  secondaryTitle: text("secondary_title"), // e.g., "Directeur des Études"
  secondarySignatureUrl: text("secondary_signature_url"),
  
  // School seal/stamp
  schoolSealUrl: text("school_seal_url"),
  
  // Configuration
  showPrincipalSignature: boolean("show_principal_signature").default(true),
  showSecondarySignature: boolean("show_secondary_signature").default(false),
  showSchoolSeal: boolean("show_school_seal").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ===== ZOD SCHEMAS FOR NEW BULLETIN SYSTEM TABLES =====

// Insert schemas for validation
export const insertTeacherSubjectAssignmentSchema = createInsertSchema(teacherSubjectAssignments);
export const insertGradeEntrySchema = createInsertSchema(gradeEntries).extend({
  status: z.nativeEnum(GRADE_ENTRY_STATUS).default(GRADE_ENTRY_STATUS.DRAFT)
});
export const insertGradingScaleSchema = createInsertSchema(gradingScales).refine(
  (data: any) => Number(data.min) <= Number(data.max),
  {
    message: "Minimum score must be less than or equal to maximum score",
    path: ["min"]
  }
);

// Enhanced validation schema for grading scales with non-overlap check
export const validatedGradingScaleSchema = insertGradingScaleSchema.refine(
  async (data) => {
    // Note: This validation would need database access in real implementation
    // For now, we provide the structure for non-overlapping scales per school
    return true;
  },
  {
    message: "Grading scale ranges cannot overlap within the same school",
    path: ["max"]
  }
);
export const insertTermConfigSchema = createInsertSchema(termConfig);
export const insertBulletinSignatorySchema = createInsertSchema(bulletinSignatories);

// Select schemas for queries
export const selectTeacherSubjectAssignmentSchema = createSelectSchema(teacherSubjectAssignments);
export const selectGradeEntrySchema = createSelectSchema(gradeEntries);
export const selectGradingScaleSchema = createSelectSchema(gradingScales);
export const selectTermConfigSchema = createSelectSchema(termConfig);
export const selectBulletinSignatorySchema = createSelectSchema(bulletinSignatories);

// ===== TYPESCRIPT TYPES FOR NEW BULLETIN SYSTEM TABLES =====

// Insert types
export type InsertTeacherSubjectAssignment = z.infer<typeof insertTeacherSubjectAssignmentSchema>;
export type InsertGradeEntry = z.infer<typeof insertGradeEntrySchema>;
export type InsertGradingScale = z.infer<typeof insertGradingScaleSchema>;
export type InsertTermConfig = z.infer<typeof insertTermConfigSchema>;
export type InsertBulletinSignatory = z.infer<typeof insertBulletinSignatorySchema>;

// Select types
export type TeacherSubjectAssignment = typeof teacherSubjectAssignments.$inferSelect;
export type GradeEntry = typeof gradeEntries.$inferSelect;
export type GradingScale = typeof gradingScales.$inferSelect;
export type TermConfig = typeof termConfig.$inferSelect;
export type BulletinSignatory = typeof bulletinSignatories.$inferSelect;


// ===== UTILITY SCHEMAS FOR COMPLEX OPERATIONS =====

// Schema for bulk grade entry creation
export const bulkGradeEntrySchema = z.object({
  schoolId: z.number(),
  classId: z.number(),
  subjectId: z.number(),
  termId: z.number(),
  teacherId: z.number(),
  entries: z.array(z.object({
    studentId: z.number(),
    score: z.number().min(0).max(20),
    coefficient: z.number().min(0.1).max(10).default(1),
    comment: z.string().optional()
  }))
});

export type BulkGradeEntry = z.infer<typeof bulkGradeEntrySchema>;

// Schema for grade validation rules
export const gradeValidationSchema = z.object({
  minScore: z.number().min(0),
  maxScore: z.number().max(20),
  requireComment: z.boolean().default(false),
  allowDecimals: z.boolean().default(true),
  coefficientRequired: z.boolean().default(true)
});

export type GradeValidation = z.infer<typeof gradeValidationSchema>;
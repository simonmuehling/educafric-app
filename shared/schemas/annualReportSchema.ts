// ===== ANNUAL REPORT SCHEMA =====
// Complete data model for annual reports including:
// - Trimester averages and progression
// - Disciplinary summary across all trimesters
// - Annual performance and final decisions
// - Signatures, archiving, and notification tracking
// Mirrors the bulletin system structure for consistency

import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ===== ANNUAL REPORT COMPREHENSIVE DATA =====
// Main table for annual reports with complete workflow support
export const annualReportComprehensive = pgTable("annual_report_comprehensive", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  classId: integer("class_id").notNull(),
  schoolId: integer("school_id").notNull(),
  academicYear: text("academic_year").notNull(), // "2024-2025"
  
  // ===== STUDENT IDENTITY (matching bulletin structure) =====
  studentMatricule: text("student_matricule"),
  studentFirstName: text("student_first_name"),
  studentLastName: text("student_last_name"),
  studentGender: text("student_gender"), // "M" or "F"
  studentDateOfBirth: text("student_date_of_birth"),
  studentPlaceOfBirth: text("student_place_of_birth"),
  studentNationality: text("student_nationality"),
  guardianName: text("guardian_name"),
  guardianPhone: text("guardian_phone"),
  studentPhoto: text("student_photo"), // URL for photo
  
  // ===== CLASS CONTEXT =====
  className: text("class_name"), // "6ème A"
  homeroomTeacherName: text("homeroom_teacher_name"),
  classSize: integer("class_size"),
  schoolRegistrationNumber: text("school_registration_number"),
  
  // ===== SCHOOL INFORMATION =====
  schoolName: text("school_name"),
  schoolRegion: text("school_region"),
  schoolDepartment: text("school_department"),
  schoolLogo: text("school_logo"), // URL for school logo
  
  // ===== TEMPLATE AND LANGUAGE SETTINGS =====
  templateType: text("template_type").default("ministry_standard"),
  language: text("language").default("fr"), // "fr", "en", or "bilingual"
  
  // ===== TRIMESTER PERFORMANCE DATA =====
  // First Trimester
  trimester1Average: decimal("trimester1_average", { precision: 5, scale: 2 }),
  trimester1Rank: text("trimester1_rank"), // "5ème/35"
  trimester1TotalStudents: integer("trimester1_total_students"),
  trimester1SubjectCount: integer("trimester1_subject_count"),
  trimester1PassedSubjects: integer("trimester1_passed_subjects"),
  trimester1TeacherObservations: text("trimester1_teacher_observations"),
  
  // Second Trimester
  trimester2Average: decimal("trimester2_average", { precision: 5, scale: 2 }),
  trimester2Rank: text("trimester2_rank"),
  trimester2TotalStudents: integer("trimester2_total_students"),
  trimester2SubjectCount: integer("trimester2_subject_count"),
  trimester2PassedSubjects: integer("trimester2_passed_subjects"),
  trimester2TeacherObservations: text("trimester2_teacher_observations"),
  
  // Third Trimester
  trimester3Average: decimal("trimester3_average", { precision: 5, scale: 2 }),
  trimester3Rank: text("trimester3_rank"),
  trimester3TotalStudents: integer("trimester3_total_students"),
  trimester3SubjectCount: integer("trimester3_subject_count"),
  trimester3PassedSubjects: integer("trimester3_passed_subjects"),
  trimester3TeacherObservations: text("trimester3_teacher_observations"),
  
  // ===== ANNUAL SUMMARY =====
  annualAverage: decimal("annual_average", { precision: 5, scale: 2 }).notNull(),
  annualRank: text("annual_rank").notNull(), // "3ème/35"
  finalDecision: text("final_decision").notNull(), // "PASSE", "REDOUBLE", "RENVOYE"
  principalObservations: text("principal_observations"),
  parentObservations: text("parent_observations"),
  holidayRecommendations: text("holiday_recommendations"),
  
  // ===== DISCIPLINE SUMMARY (aggregated across trimesters) =====
  // First Trimester Discipline
  trimester1JustifiedAbsences: integer("trimester1_justified_absences").default(0),
  trimester1UnjustifiedAbsences: integer("trimester1_unjustified_absences").default(0),
  trimester1Lates: integer("trimester1_lates").default(0),
  trimester1Sanctions: integer("trimester1_sanctions").default(0),
  
  // Second Trimester Discipline
  trimester2JustifiedAbsences: integer("trimester2_justified_absences").default(0),
  trimester2UnjustifiedAbsences: integer("trimester2_unjustified_absences").default(0),
  trimester2Lates: integer("trimester2_lates").default(0),
  trimester2Sanctions: integer("trimester2_sanctions").default(0),
  
  // Third Trimester Discipline
  trimester3JustifiedAbsences: integer("trimester3_justified_absences").default(0),
  trimester3UnjustifiedAbsences: integer("trimester3_unjustified_absences").default(0),
  trimester3Lates: integer("trimester3_lates").default(0),
  trimester3Sanctions: integer("trimester3_sanctions").default(0),
  
  // ===== SIGNATURES & WORKFLOW (matching bulletin structure) =====
  parentVisa: jsonb("parent_visa"), // {name: string, date: string, signatureUrl?: string}
  teacherVisa: jsonb("teacher_visa"), // {name: string, date: string, signatureUrl?: string}  
  headmasterVisa: jsonb("headmaster_visa"), // {name: string, date: string, signatureUrl?: string}
  
  // ===== WORKFLOW STATUS (matching bulletin workflow) =====
  status: text("status").default("draft"), // 'draft', 'submitted', 'approved', 'signed', 'sent', 'archived'
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  signedAt: timestamp("signed_at"),
  sentAt: timestamp("sent_at"),
  archivedAt: timestamp("archived_at"),
  approvedBy: integer("approved_by"), // User ID who approved
  sentBy: integer("sent_by"), // User ID who sent
  
  // ===== DOCUMENT METADATA =====
  verificationCode: text("verification_code"), // QR code verification
  pdfUrl: text("pdf_url"), // Generated PDF storage URL
  pdfSizeBytes: integer("pdf_size_bytes"),
  pdfChecksumSha256: text("pdf_checksum_sha256"),
  
  // ===== NOTIFICATIONS TRACKING (matching bulletin notifications) =====
  notificationsSent: jsonb("notifications_sent"), // Same structure as bulletins
  
  // ===== METADATA & TRACKING =====
  enteredBy: integer("entered_by"),
  lastModifiedBy: integer("last_modified_by"),
  dataSource: text("data_source").default("manual"), // "manual", "imported", "generated"
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== ZOD SCHEMAS FOR VALIDATION =====

// Signature schema (reusing from bulletin structure)
const signatureSchema = z.object({
  name: z.string().min(1, "Name is required"),
  date: z.string().min(1, "Date is required"),
  signatureUrl: z.string().url().optional()
}).optional();

// Trimester data validation schema
const trimesterDataSchema = z.object({
  average: z.number().min(0).max(20),
  rank: z.string(),
  totalStudents: z.number().int().positive(),
  subjectCount: z.number().int().positive(),
  passedSubjects: z.number().int().min(0),
  teacherObservations: z.string().max(500).optional(),
  // Discipline data
  justifiedAbsences: z.number().int().min(0),
  unjustifiedAbsences: z.number().int().min(0),
  lates: z.number().int().min(0),
  sanctions: z.number().int().min(0)
});

// Notification schema (matching bulletin comprehensive)
const notificationChannelStatusSchema = z.object({
  sent: z.boolean(),
  sentAt: z.string().datetime().optional(),
  status: z.enum(['delivered', 'sent', 'pending', 'failed', 'retrying']).optional(),
  attempts: z.number().min(0).optional(),
  lastAttemptAt: z.string().datetime().optional(),
  error: z.string().optional(),
  deliveredAt: z.string().datetime().optional(),
  retryCount: z.number().min(0).optional(),
  maxRetries: z.number().min(0).optional()
});

const recipientNotificationStatusSchema = z.object({
  email: notificationChannelStatusSchema.optional(),
  sms: notificationChannelStatusSchema.optional(),
  whatsapp: notificationChannelStatusSchema.optional(),
  lastUpdated: z.string().datetime().optional(),
  totalAttempts: z.number().min(0).optional()
});

const annualReportNotificationsSchema = z.object({
  perRecipient: z.record(z.string(), recipientNotificationStatusSchema).optional(),
  summary: z.object({
    totalRecipients: z.number().min(0),
    emailSuccessCount: z.number().min(0),
    smsSuccessCount: z.number().min(0),
    whatsappSuccessCount: z.number().min(0),
    emailFailedCount: z.number().min(0),
    smsFailedCount: z.number().min(0),
    whatsappFailedCount: z.number().min(0),
    failedRecipients: z.array(z.string()),
    lastUpdated: z.string().datetime(),
    totalNotificationsSent: z.number().min(0),
    totalNotificationsFailed: z.number().min(0),
    overallSuccessRate: z.number().min(0).max(100)
  }).optional(),
  // Backward compatibility
  legacy: z.object({
    sms: z.boolean().optional(),
    email: z.boolean().optional(),
    whatsapp: z.boolean().optional()
  }).optional()
}).optional();

// Annual report validation schema
export const annualReportValidationSchema = z.object({
  // Required fields
  studentId: z.number().int().positive("Student ID is required"),
  classId: z.number().int().positive("Class ID is required"),
  schoolId: z.number().int().positive("School ID is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  
  // Student identity (optional for updates)
  studentMatricule: z.string().optional(),
  studentFirstName: z.string().min(1).optional(),
  studentLastName: z.string().min(1).optional(),
  studentGender: z.enum(["M", "F"]).optional(),
  studentDateOfBirth: z.string().optional(),
  studentPlaceOfBirth: z.string().optional(),
  studentNationality: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  studentPhoto: z.string().url().optional(),
  
  // Class context
  className: z.string().optional(),
  homeroomTeacherName: z.string().optional(),
  classSize: z.number().int().positive().optional(),
  schoolRegistrationNumber: z.string().optional(),
  
  // School information
  schoolName: z.string().optional(),
  schoolRegion: z.string().optional(),
  schoolDepartment: z.string().optional(),
  schoolLogo: z.string().url().optional(),
  
  // Template settings
  templateType: z.enum(["ministry_standard", "custom"]).optional(),
  language: z.enum(["fr", "en", "bilingual"]).optional(),
  
  // Annual summary (required)
  annualAverage: z.string(), // Decimal as string
  annualRank: z.string().min(1, "Annual rank is required"),
  finalDecision: z.enum(["PASSE", "REDOUBLE", "RENVOYE"]),
  principalObservations: z.string().max(1000).optional(),
  parentObservations: z.string().max(500).optional(),
  holidayRecommendations: z.string().max(500).optional(),
  
  // Trimester data (optional - can be populated later)
  trimester1Average: z.string().optional(),
  trimester1Rank: z.string().optional(),
  trimester1TotalStudents: z.number().int().positive().optional(),
  trimester1SubjectCount: z.number().int().positive().optional(),
  trimester1PassedSubjects: z.number().int().min(0).optional(),
  trimester1TeacherObservations: z.string().max(500).optional(),
  
  trimester2Average: z.string().optional(),
  trimester2Rank: z.string().optional(),
  trimester2TotalStudents: z.number().int().positive().optional(),
  trimester2SubjectCount: z.number().int().positive().optional(),
  trimester2PassedSubjects: z.number().int().min(0).optional(),
  trimester2TeacherObservations: z.string().max(500).optional(),
  
  trimester3Average: z.string().optional(),
  trimester3Rank: z.string().optional(),
  trimester3TotalStudents: z.number().int().positive().optional(),
  trimester3SubjectCount: z.number().int().positive().optional(),
  trimester3PassedSubjects: z.number().int().min(0).optional(),
  trimester3TeacherObservations: z.string().max(500).optional(),
  
  // Discipline data (optional)
  trimester1JustifiedAbsences: z.number().int().min(0).optional(),
  trimester1UnjustifiedAbsences: z.number().int().min(0).optional(),
  trimester1Lates: z.number().int().min(0).optional(),
  trimester1Sanctions: z.number().int().min(0).optional(),
  
  trimester2JustifiedAbsences: z.number().int().min(0).optional(),
  trimester2UnjustifiedAbsences: z.number().int().min(0).optional(),
  trimester2Lates: z.number().int().min(0).optional(),
  trimester2Sanctions: z.number().int().min(0).optional(),
  
  trimester3JustifiedAbsences: z.number().int().min(0).optional(),
  trimester3UnjustifiedAbsences: z.number().int().min(0).optional(),
  trimester3Lates: z.number().int().min(0).optional(),
  trimester3Sanctions: z.number().int().min(0).optional(),
  
  // Workflow fields
  status: z.enum(["draft", "submitted", "approved", "signed", "sent", "archived"]).optional(),
  approvedBy: z.number().int().positive().optional(),
  sentBy: z.number().int().positive().optional(),
  
  // Document metadata
  verificationCode: z.string().optional(),
  pdfUrl: z.string().url().optional(),
  pdfSizeBytes: z.number().int().positive().optional(),
  pdfChecksumSha256: z.string().optional(),
  
  // Signatures
  parentVisa: signatureSchema,
  teacherVisa: signatureSchema,
  headmasterVisa: signatureSchema,
  
  // Notifications
  notificationsSent: annualReportNotificationsSchema,
  
  // Metadata
  enteredBy: z.number().int().positive().optional(),
  lastModifiedBy: z.number().int().positive().optional(),
  dataSource: z.enum(["manual", "imported", "generated"]).optional()
});

// Insert schema
export const insertAnnualReportSchema = createInsertSchema(annualReportComprehensive);

// ===== TYPE EXPORTS =====
export type AnnualReportComprehensive = typeof annualReportComprehensive.$inferSelect;
export type InsertAnnualReport = z.infer<typeof insertAnnualReportSchema>;

// ===== HELPER FUNCTIONS =====

// Generate sample annual report data for testing
export function generateSampleAnnualReportData(studentId: number, classId: number, schoolId: number): InsertAnnualReport {
  const trimester1Avg = 12 + Math.random() * 6; // 12-18
  const trimester2Avg = 11 + Math.random() * 7; // 11-18
  const trimester3Avg = 13 + Math.random() * 5; // 13-18
  const annualAvg = (trimester1Avg + trimester2Avg + trimester3Avg) / 3;
  
  return {
    studentId,
    classId,
    schoolId,
    academicYear: "2024-2025",
    
    // Annual summary
    annualAverage: annualAvg.toFixed(2),
    annualRank: `${Math.floor(Math.random() * 30) + 1}e/35`,
    finalDecision: annualAvg >= 12 ? "PASSE" : "REDOUBLE",
    principalObservations: annualAvg >= 15 ? 
      "Excellente année scolaire. L'élève démontre une progression constante et une maîtrise des compétences." :
      annualAvg >= 12 ?
      "Année scolaire satisfaisante. L'élève progresse bien mais doit maintenir ses efforts." :
      "L'élève doit redoubler d'efforts. Un accompagnement renforcé est recommandé.",
    holidayRecommendations: "Bonnes vacances. Continuez la lecture et les révisions.",
    
    // Trimester data
    trimester1Average: trimester1Avg.toFixed(2),
    trimester1Rank: `${Math.floor(Math.random() * 35) + 1}e/35`,
    trimester1TotalStudents: 35,
    trimester1SubjectCount: 9,
    trimester1PassedSubjects: Math.floor(trimester1Avg >= 10 ? 7 + Math.random() * 2 : 4 + Math.random() * 3),
    trimester1TeacherObservations: "Bon démarrage d'année. Encourageant.",
    
    trimester2Average: trimester2Avg.toFixed(2),
    trimester2Rank: `${Math.floor(Math.random() * 35) + 1}e/35`,
    trimester2TotalStudents: 35,
    trimester2SubjectCount: 9,
    trimester2PassedSubjects: Math.floor(trimester2Avg >= 10 ? 6 + Math.random() * 3 : 3 + Math.random() * 4),
    trimester2TeacherObservations: "Progression constante. Continuez.",
    
    trimester3Average: trimester3Avg.toFixed(2),
    trimester3Rank: `${Math.floor(Math.random() * 35) + 1}e/35`,
    trimester3TotalStudents: 35,
    trimester3SubjectCount: 9,
    trimester3PassedSubjects: Math.floor(trimester3Avg >= 10 ? 7 + Math.random() * 2 : 4 + Math.random() * 3),
    trimester3TeacherObservations: "Fin d'année satisfaisante. Bonnes vacances.",
    
    // Discipline (minimal for good students)
    trimester1JustifiedAbsences: Math.floor(Math.random() * 3),
    trimester1UnjustifiedAbsences: Math.floor(Math.random() * 2),
    trimester1Lates: Math.floor(Math.random() * 3),
    trimester1Sanctions: Math.floor(Math.random() * 2),
    
    trimester2JustifiedAbsences: Math.floor(Math.random() * 2),
    trimester2UnjustifiedAbsences: Math.floor(Math.random() * 2),
    trimester2Lates: Math.floor(Math.random() * 2),
    trimester2Sanctions: Math.floor(Math.random() * 1),
    
    trimester3JustifiedAbsences: Math.floor(Math.random() * 2),
    trimester3UnjustifiedAbsences: Math.floor(Math.random() * 1),
    trimester3Lates: Math.floor(Math.random() * 2),
    trimester3Sanctions: 0,
    
    // Workflow
    status: "draft" as const,
    
    // Notifications (initialized empty)
    notificationsSent: {
      perRecipient: {},
      summary: {
        totalRecipients: 0,
        emailSuccessCount: 0,
        smsSuccessCount: 0,
        whatsappSuccessCount: 0,
        emailFailedCount: 0,
        smsFailedCount: 0,
        whatsappFailedCount: 0,
        failedRecipients: [],
        lastUpdated: new Date().toISOString(),
        totalNotificationsSent: 0,
        totalNotificationsFailed: 0,
        overallSuccessRate: 0
      },
      legacy: {
        sms: false,
        email: false,
        whatsapp: false
      }
    },
    
    dataSource: "generated"
  };
}

// Export notification schemas for external use
export const annualReportNotificationSchemas = {
  channelStatus: notificationChannelStatusSchema,
  recipientStatus: recipientNotificationStatusSchema,
  comprehensive: annualReportNotificationsSchema
};
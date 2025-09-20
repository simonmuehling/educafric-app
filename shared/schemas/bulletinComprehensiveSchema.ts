// ===== COMPREHENSIVE BULLETIN DATA SCHEMA =====
// Complete data model for advanced bulletin generation including:
// - Absences & Retards (justified/unjustified hours, lateness count, detentions)
// - Disciplinary Sanctions (warnings, blame, exclusions)
// - Appreciations & Signatures (work appreciation, parent/teacher/headmaster visas)
// - Coefficient Codes (CTBA, CBA, CA, CMA, COTE, CNA, Min-Max per subject)
// - Totals & Statistics (general total, success rates, averages)

import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ===== COMPREHENSIVE BULLETIN DATA =====
// Main table for all advanced bulletin fields per student/class/term
export const bulletinComprehensive = pgTable("bulletin_comprehensive", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  classId: integer("class_id").notNull(),
  schoolId: integer("school_id").notNull(),
  term: text("term").notNull(), // "T1", "T2", "T3"
  academicYear: text("academic_year").notNull(),
  
  // ===== STUDENT IDENTITY (for Cameroon Official Template) =====
  // Student identification and personal information
  studentMatricule: text("student_matricule"), // Student registration number (e.g., "STU-6E-00045")
  studentFirstName: text("student_first_name"),
  studentLastName: text("student_last_name"),
  studentGender: text("student_gender"), // "M" or "F"
  studentDateOfBirth: text("student_date_of_birth"), // YYYY-MM-DD format
  studentPlaceOfBirth: text("student_place_of_birth"),
  isRepeater: boolean("is_repeater").default(false),
  guardianName: text("guardian_name"), // Parent/Guardian full name
  guardianPhone: text("guardian_phone"), // Contact phone number
  
  // ===== CLASS CONTEXT (for Cameroon Official Template) =====
  // Class and school context information
  className: text("class_name"), // e.g., "6ème A"
  homeroomTeacherName: text("homeroom_teacher_name"), // "Mme NGONO"
  classSize: integer("class_size"), // Total number of students in class
  schoolRegistrationNumber: text("school_registration_number"), // "LDM-2025-001"
  
  // ===== TEMPLATE AND LANGUAGE SETTINGS =====
  // Bulletin generation preferences
  templateType: text("template_type").default("standard"), // "standard", "cameroon_official_compact"
  language: text("language").default("fr"), // "fr", "en", or "bilingual"
  
  // ===== ACADEMIC PERFORMANCE SUMMARY =====
  // Overall academic performance for the term (consolidated fields)
  totalCoefficient: integer("total_coefficient"), // Sum of all subject coefficients
  classRank: integer("class_rank"), // Student's rank in the class (1 = best)
  overallGrade: text("overall_grade"), // Letter grade (A, B+, B, C+, C, D, E, F)
  
  // ===== CLASS STATISTICS (for Cameroon Official Template) =====
  // Class performance statistics
  classAverage: decimal("class_average", { precision: 5, scale: 2 }), // Class average grade
  classHighestScore: decimal("class_highest_score", { precision: 5, scale: 2 }), // Best score in class
  classLowestScore: decimal("class_lowest_score", { precision: 5, scale: 2 }), // Lowest score in class
  
  // ===== DISCIPLINE & CONDUCT =====
  // Conduct grade (often shown as /20 in official templates)
  conductGradeOutOf20: decimal("conduct_grade_out_of_20", { precision: 5, scale: 2 }), // Conduct/Discipline grade /20
  
  // ===== ATTENDANCE DETAILS (enhanced for official template) =====
  // Attendance counts in addition to hours
  unjustifiedAbsenceCount: integer("unjustified_absence_count").default(0), // Number of unjustified absence days
  justifiedAbsenceCount: integer("justified_absence_count").default(0), // Number of justified absence days
  
  // ===== SECTION ABSENCES & RETARDS =====
  // Absence tracking (hours)
  unjustifiedAbsenceHours: decimal("unjustified_absence_hours", { precision: 5, scale: 2 }).default("0.00"),
  justifiedAbsenceHours: decimal("justified_absence_hours", { precision: 5, scale: 2 }).default("0.00"),
  
  // Lateness and detentions (count/hours)
  latenessCount: integer("lateness_count").default(0), // Number of times late
  detentionHours: decimal("detention_hours", { precision: 5, scale: 2 }).default("0.00"), // Consignes (heures)
  
  // ===== SECTION SANCTIONS DISCIPLINAIRES =====
  // Disciplinary warnings and sanctions
  conductWarning: boolean("conduct_warning").default(false), // Avertissement de conduite
  conductBlame: boolean("conduct_blame").default(false), // Blâme de conduite
  exclusionDays: integer("exclusion_days").default(0), // Exclusions (jours)
  permanentExclusion: boolean("permanent_exclusion").default(false), // Exclusion définitive
  
  // ===== SECTION MOYENNES & TOTAUX =====
  // Academic totals and statistics (consolidated - using totalGeneral and generalAverage)
  totalGeneral: decimal("total_general", { precision: 8, scale: 2 }), // TOTAL GÉNÉRAL (sum of weighted marks)
  generalAverage: decimal("general_average", { precision: 5, scale: 2 }), // Moyenne Générale (canonical average field)
  numberOfAverages: integer("number_of_averages"), // Nombre de moyennes
  successRate: decimal("success_rate", { precision: 5, scale: 2 }), // Taux de réussite (0-100%)
  
  // Class profile and comparison data
  classProfile: jsonb("class_profile"), // Class statistics and distribution
  
  // ===== SECTION APPRÉCIATIONS =====
  // Work appreciation and comments
  workAppreciation: text("work_appreciation"), // Appréciation du travail de l'élève (points forts et points à améliorer)
  generalComment: text("general_comment"), // General term comment
  
  // ===== SECTION SIGNATURES =====
  // Signature tracking with names and dates
  parentVisa: jsonb("parent_visa"), // {name: string, date: string, signatureUrl?: string}
  teacherVisa: jsonb("teacher_visa"), // {name: string, date: string, signatureUrl?: string}  
  headmasterVisa: jsonb("headmaster_visa"), // {name: string, date: string, signatureUrl?: string}
  
  // ===== SECTION CONSEIL DE CLASSE =====
  // Class Council decisions and recommendations
  classCouncilDecisions: text("class_council_decisions"), // Décisions du conseil de classe
  classCouncilMentions: text("class_council_mentions"), // Mentions: "Félicitations", "Encouragements", "Satisfaisant", "Mise en garde", "Blâme"
  orientationRecommendations: text("orientation_recommendations"), // Recommandations d'orientation
  councilDate: text("council_date"), // Date du conseil de classe
  councilParticipants: text("council_participants"), // Participants du conseil de classe
  
  // ===== METADATA & TRACKING =====
  // Data entry and modification tracking
  enteredBy: integer("entered_by"), // User ID who entered the data
  lastModifiedBy: integer("last_modified_by"), // User ID who last modified
  dataSource: text("data_source").default("manual"), // "manual", "imported", "generated"
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  
  // ===== SECTION WORKFLOW & VALIDATION =====
  // Bulletin workflow status and validation tracking
  status: text("status").default("draft"), // 'draft', 'submitted', 'approved', 'sent' - État du workflow du bulletin
  submittedAt: timestamp("submitted_at"), // Date et heure de soumission par l'enseignant
  approvedAt: timestamp("approved_at"), // Date et heure d'approbation par le directeur
  sentAt: timestamp("sent_at"), // Date et heure d'envoi aux parents
  approvedBy: integer("approved_by"), // ID de l'utilisateur (directeur) qui a approuvé le bulletin
  notificationsSent: jsonb("notifications_sent") // Statut des notifications envoyées {sms: boolean, email: boolean, whatsapp: boolean}
});

// ===== SUBJECT-SPECIFIC COEFFICIENTS & CODES =====
// Per-subject coefficient codes and performance indicators
export const bulletinSubjectCodes = pgTable("bulletin_subject_codes", {
  id: serial("id").primaryKey(),
  bulletinComprehensiveId: integer("bulletin_comprehensive_id").notNull(),
  studentId: integer("student_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  subjectName: text("subject_name").notNull(),
  teacherName: text("teacher_name"), // Teacher name for this subject (e.g., "Mr/Mrs ...")
  
  // ===== ACADEMIC PERFORMANCE (for Cameroon Official Template) =====
  // Individual subject performance data
  competencies: text("competencies"), // Subject competencies description
  markOutOf20: decimal("mark_out_of_20", { precision: 5, scale: 2 }), // Individual subject mark /20
  coefficient: integer("coefficient").default(1), // Subject coefficient
  weightedMark: decimal("weighted_mark", { precision: 8, scale: 2 }), // mark * coefficient
  letterGrade: text("letter_grade"), // A, B+, B, C+, C, D, E, F (unified from COTE)
  teacherRemarks: text("teacher_remarks"), // Teacher comments/remarks for this subject (unified field)
  
  // ===== SUBJECT-LEVEL STATISTICS (for class comparison) =====
  // Per-subject class statistics for comparison
  subjectClassAverage: decimal("subject_class_average", { precision: 5, scale: 2 }), // Class average for this subject
  subjectRank: integer("subject_rank"), // Student's rank in this specific subject within the class
  
  // ===== COEFFICIENT CODES (Section Coefficients & Codes) =====
  CTBA: decimal("ctba", { precision: 5, scale: 2 }), // Contrôle Total des Bases Acquises
  CBA: decimal("cba", { precision: 5, scale: 2 }), // Contrôle des Bases Acquises
  CA: decimal("ca", { precision: 5, scale: 2 }), // Contrôle d'Approfondissement
  CMA: decimal("cma", { precision: 5, scale: 2 }), // Contrôle de Maîtrise Approfondie
  CNA: text("cna"), // Compétence Non Acquise indicator
  
  // ===== MIN-MAX RANGE =====
  minGrade: decimal("min_grade", { precision: 5, scale: 2 }), // [Min value
  maxGrade: decimal("max_grade", { precision: 5, scale: 2 }), // Max] value
  
  // Subject-specific performance indicators
  competencyLevel: text("competency_level"), // "Acquired", "In Progress", "Not Acquired"
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ===== ZOD SCHEMAS FOR VALIDATION =====

// Signature schema for JSON validation
const signatureSchema = z.object({
  name: z.string().min(1, "Name is required"),
  date: z.string().min(1, "Date is required"),
  signatureUrl: z.string().url().optional()
}).optional();

// Class profile schema for JSON validation
const classProfileSchema = z.object({
  totalStudents: z.number().min(1),
  averageGrade: z.number().min(0).max(20),
  passRate: z.number().min(0).max(100),
  topScore: z.number().min(0).max(20),
  lowestScore: z.number().min(0).max(20)
}).optional();

// Comprehensive bulletin insert schema - simplified  
export const insertBulletinComprehensiveSchema = createInsertSchema(bulletinComprehensive);

// ===== NOUVEAU FORMAT TRACKING DÉTAILLÉ PAR DESTINATAIRE =====
// Schema pour le statut de notification par canal et par destinataire
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

// Schema pour les détails par destinataire  
const recipientNotificationStatusSchema = z.object({
  email: notificationChannelStatusSchema.optional(),
  sms: notificationChannelStatusSchema.optional(),
  whatsapp: notificationChannelStatusSchema.optional(),
  lastUpdated: z.string().datetime().optional(),
  totalAttempts: z.number().min(0).optional()
});

// Schema complet pour le nouveau format notificationsSent
const comprehensiveNotificationsSchema = z.object({
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
  // Compatibilité descendante avec l'ancien format
  legacy: z.object({
    sms: z.boolean().optional(),
    email: z.boolean().optional(),
    whatsapp: z.boolean().optional()
  }).optional()
}).optional();

// Additional validation schema
export const bulletinComprehensiveValidationSchema = z.object({
  // Required fields
  studentId: z.number().int().positive("Student ID is required"),
  classId: z.number().int().positive("Class ID is required"),
  term: z.string().min(1, "Term is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  
  // Student identity validations (for Cameroon Official Template)
  studentMatricule: z.string().optional(),
  studentFirstName: z.string().min(1, "First name is required").optional(),
  studentLastName: z.string().min(1, "Last name is required").optional(),
  studentGender: z.enum(["M", "F"]).optional(),
  studentDateOfBirth: z.string().optional(),
  studentPlaceOfBirth: z.string().optional(),
  isRepeater: z.boolean().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  
  // Class context validations
  className: z.string().optional(),
  homeroomTeacherName: z.string().optional(),
  classSize: z.number().int().positive().optional(),
  schoolRegistrationNumber: z.string().optional(),
  
  // Template and language settings
  templateType: z.enum(["standard", "cameroon_official_compact"]).optional(),
  language: z.enum(["fr", "en", "bilingual"]).optional(),
  
  // Academic performance validations (consolidated)
  totalCoefficient: z.number().int().positive().optional(),
  classRank: z.number().int().positive().optional(),
  overallGrade: z.enum(["A", "B+", "B", "C+", "C", "D", "E", "F"]).optional(),
  
  // Class statistics validations
  classAverage: z.string().optional(),
  classHighestScore: z.string().optional(),
  classLowestScore: z.string().optional(),
  
  // Discipline and conduct validations
  conductGradeOutOf20: z.string().optional(),
  unjustifiedAbsenceCount: z.number().int().min(0).optional(),
  justifiedAbsenceCount: z.number().int().min(0).optional(),
  
  // Attendance validations
  unjustifiedAbsenceHours: z.string().optional(),
  justifiedAbsenceHours: z.string().optional(),
  latenessCount: z.number().min(0, "Must be >= 0").optional(),
  detentionHours: z.string().optional(),
  
  // Disciplinary sanctions
  conductWarning: z.boolean().optional(),
  conductBlame: z.boolean().optional(),
  exclusionDays: z.number().min(0, "Must be >= 0").optional(),
  permanentExclusion: z.boolean().optional(),
  
  // Academic validations  
  totalGeneral: z.string().optional(),
  numberOfAverages: z.number().min(0, "Must be >= 0").optional(),
  successRate: z.string().optional(),
  
  // Text validations
  workAppreciation: z.string().max(500, "Maximum 500 characters").optional(),
  generalComment: z.string().max(300, "Maximum 300 characters").optional(),
  
  // Workflow validations
  status: z.enum(["draft", "submitted", "approved", "sent"]).optional(),
  approvedBy: z.number().int().positive().optional(),
  
  // NOUVEAU: Schema de tracking détaillé par destinataire
  notificationsSent: comprehensiveNotificationsSchema,
  
  // Signature fields (JSON validation aligned with database columns)
  parentVisa: signatureSchema,
  teacherVisa: signatureSchema,
  headmasterVisa: signatureSchema,
  
  // Include missing academic fields (consolidated - using generalAverage as canonical field)
  generalAverage: z.string().optional(),
  
  // Class profile JSON validation (wired in)
  classProfile: classProfileSchema,
  
  // ===== CONSEIL DE CLASSE VALIDATION =====
  // Class Council fields validation
  classCouncilDecisions: z.string().max(1000, "Maximum 1000 characters").optional(),
  classCouncilMentions: z.enum(["Félicitations", "Encouragements", "Satisfaisant", "Mise en garde", "Blâme", ""]).optional(),
  orientationRecommendations: z.string().max(1000, "Maximum 1000 characters").optional(),
  councilDate: z.string().optional(),
  councilParticipants: z.string().max(500, "Maximum 500 characters").optional()
});

// Exporter les schemas de tracking pour utilisation externe
export const notificationTrackingSchemas = {
  channelStatus: notificationChannelStatusSchema,
  recipientStatus: recipientNotificationStatusSchema,
  comprehensive: comprehensiveNotificationsSchema
};

// Subject codes validation schema (extended for Cameroon Official Template)
export const bulletinSubjectCodesValidationSchema = z.object({
  // Required fields
  bulletinComprehensiveId: z.number().int().positive("Bulletin ID is required"),
  studentId: z.number().int().positive("Student ID is required"),
  subjectId: z.number().int().positive("Subject ID is required"),
  subjectName: z.string().min(1, "Subject name is required"),
  
  // Teacher and performance data
  teacherName: z.string().optional(),
  competencies: z.string().max(200, "Maximum 200 characters").optional(),
  markOutOf20: z.string().optional(),
  coefficient: z.number().int().positive().optional(),
  weightedMark: z.string().optional(),
  letterGrade: z.enum(["A", "B+", "B", "C+", "C", "D", "E", "F", ""]).optional(),
  teacherRemarks: z.string().max(100, "Maximum 100 characters").optional(),
  
  // Subject-level statistics
  subjectClassAverage: z.string().optional(),
  subjectRank: z.number().int().positive().optional(),
  
  // Existing coefficient codes (removed COTE as it's consolidated with letterGrade)
  CTBA: z.string().optional(),
  CBA: z.string().optional(),
  CA: z.string().optional(),
  CMA: z.string().optional(),
  CNA: z.string().max(50).optional(),
  minGrade: z.string().optional(),
  maxGrade: z.string().optional(),
  competencyLevel: z.enum(["Acquired", "In Progress", "Not Acquired", ""]).optional()
});

// Subject codes insert schema - simplified
export const insertBulletinSubjectCodesSchema = createInsertSchema(bulletinSubjectCodes);

// ===== TYPE EXPORTS =====
export type BulletinComprehensive = typeof bulletinComprehensive.$inferSelect;
export type InsertBulletinComprehensive = z.infer<typeof insertBulletinComprehensiveSchema>;

export type BulletinSubjectCodes = typeof bulletinSubjectCodes.$inferSelect;
export type InsertBulletinSubjectCodes = z.infer<typeof insertBulletinSubjectCodesSchema>;

// ===== HELPER FUNCTIONS =====

// Generate realistic sample data for testing
export function generateSampleComprehensiveData(studentId: number, classId: number, schoolId: number, term: string): InsertBulletinComprehensive {
  const baseAverage = 12 + Math.random() * 6; // 12-18 average
  
  return {
    studentId,
    classId,
    schoolId,
    term,
    academicYear: "2024-2025",
    
    // Realistic attendance data
    unjustifiedAbsenceHours: (Math.random() * 8).toFixed(2), // 0-8 hours
    justifiedAbsenceHours: (Math.random() * 4).toFixed(2), // 0-4 hours  
    latenessCount: Math.floor(Math.random() * 6), // 0-5 times
    detentionHours: (Math.random() * 3).toFixed(2), // 0-3 hours
    
    // Minimal disciplinary issues for good students
    conductWarning: Math.random() < 0.1, // 10% chance
    conductBlame: Math.random() < 0.05, // 5% chance
    exclusionDays: Math.random() < 0.02 ? Math.floor(Math.random() * 3) : 0, // Rare
    permanentExclusion: false, // Very rare
    
    // Academic performance
    totalGeneral: (baseAverage * 9 * 2).toFixed(2), // Approximate total
    generalAverage: baseAverage.toFixed(2),
    trimesterAverage: baseAverage.toFixed(2),
    numberOfAverages: 9, // Standard subject count
    successRate: (Math.min(95, 60 + baseAverage * 2)).toFixed(2), // Correlated with average
    
    // Work appreciation based on performance
    workAppreciation: baseAverage >= 16 ? 
      "Excellent travail. L'élève démontre une maîtrise remarquable des compétences. Continue ainsi !" :
      baseAverage >= 14 ?
      "Bon travail. L'élève progresse bien. Quelques efforts supplémentaires pour exceller." :
      baseAverage >= 12 ?
      "Travail correct. L'élève doit fournir plus d'efforts dans certaines matières." :
      "L'élève doit redoubler d'efforts. Un accompagnement personnalisé est recommandé.",
    
    generalComment: `Trimestre ${term} - Performance ${baseAverage >= 14 ? 'satisfaisante' : 'à améliorer'}`,
    
    // Sample signatures
    parentVisa: {
      name: "Parent/Tuteur",
      date: new Date().toLocaleDateString('fr-FR')
    },
    teacherVisa: {
      name: "Professeur Principal",
      date: new Date().toLocaleDateString('fr-FR')
    },
    headmasterVisa: {
      name: "Chef d'Établissement",
      date: new Date().toLocaleDateString('fr-FR')
    },
    
    // Class profile sample
    classProfile: {
      totalStudents: 35,
      averageGrade: 13.5,
      passRate: 78.5,
      topScore: 19.2,
      lowestScore: 8.1
    },
    
    // Workflow fields - initialized with default values
    status: "draft" as const,
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
      // Compatibilité descendante
      legacy: {
        sms: false,
        email: false,
        whatsapp: false
      }
    },
    
    dataSource: "generated"
  };
}
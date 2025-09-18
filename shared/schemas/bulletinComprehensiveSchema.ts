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
  // Academic totals and statistics
  totalGeneral: decimal("total_general", { precision: 8, scale: 2 }), // TOTAL GÉNÉRAL
  generalAverage: decimal("general_average", { precision: 5, scale: 2 }), // Moyenne Générale
  trimesterAverage: decimal("trimester_average", { precision: 5, scale: 2 }), // MOYENNE TRIM
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
  
  // ===== COEFFICIENT CODES (Section Coefficients & Codes) =====
  CTBA: decimal("ctba", { precision: 5, scale: 2 }), // Contrôle Total des Bases Acquises
  CBA: decimal("cba", { precision: 5, scale: 2 }), // Contrôle des Bases Acquises
  CA: decimal("ca", { precision: 5, scale: 2 }), // Contrôle d'Approfondissement
  CMA: decimal("cma", { precision: 5, scale: 2 }), // Contrôle de Maîtrise Approfondie
  COTE: text("cote"), // Grade/Rating (A, B, C, D, E, F)
  CNA: text("cna"), // Compétence Non Acquise indicator
  
  // ===== MIN-MAX RANGE =====
  minGrade: decimal("min_grade", { precision: 5, scale: 2 }), // [Min value
  maxGrade: decimal("max_grade", { precision: 5, scale: 2 }), // Max] value
  
  // Subject-specific performance indicators
  competencyLevel: text("competency_level"), // "Acquired", "In Progress", "Not Acquired"
  teacherComment: text("teacher_comment"), // Subject-specific teacher comment
  
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
export const insertBulletinComprehensiveSchema = createInsertSchema(bulletinComprehensive).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true
});

// Additional validation schema
export const bulletinComprehensiveValidationSchema = z.object({
  // Required fields
  studentId: z.number().int().positive("Student ID is required"),
  classId: z.number().int().positive("Class ID is required"),
  term: z.string().min(1, "Term is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  
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
  notificationsSent: z.object({
    sms: z.boolean().optional(),
    email: z.boolean().optional(),
    whatsapp: z.boolean().optional()
  }).optional(),
  
  // Signature fields
  parentVisaName: z.string().optional(),
  parentVisaDate: z.string().optional(),
  teacherVisaName: z.string().optional(),
  teacherVisaDate: z.string().optional(),
  headmasterVisaName: z.string().optional(),
  headmasterVisaDate: z.string().optional(),
  
  // Subject coefficients
  subjectCoefficients: z.record(z.object({
    CTBA: z.string().optional(),
    CBA: z.string().optional(),
    CA: z.string().optional(),
    CMA: z.string().optional(),
    COTE: z.enum(["A", "B", "C", "D", "E", "F", ""]).optional(),
    CNA: z.string().max(50).optional(),
    minGrade: z.string().optional(),
    maxGrade: z.string().optional()
  })).optional()
});

// Subject codes insert schema - simplified
export const insertBulletinSubjectCodesSchema = createInsertSchema(bulletinSubjectCodes).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

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
      sms: false,
      email: false,
      whatsapp: false
    },
    
    dataSource: "generated"
  };
}
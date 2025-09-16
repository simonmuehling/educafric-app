// ===== BULLETIN EXTENSIONS SCHEMA =====
// Additional tables needed for complete T1/T2/T3 bulletin system matching PDF format

import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ===== STUDENT ACADEMIC EXTENSIONS =====
// Additional student fields needed for bulletin format
export const studentAcademicInfo = pgTable("student_academic_info", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().unique(), // References users table
  classId: integer("class_id").notNull(),
  schoolId: integer("school_id").notNull(),
  
  // Academic identification (from PDF format)
  registrationNumber: text("registration_number"), // Matricule (e.g., "GTHS-NKWEN0225913")
  enrollmentNumber: integer("enrollment_number"), // ENROLMENT (e.g., 80)
  isRepeater: boolean("is_repeater").default(false), // Repeater: Yes/No
  
  // Academic year tracking
  academicYear: text("academic_year").notNull(),
  
  // Annual performance tracking
  annualAverage: decimal("annual_average", { precision: 5, scale: 2 }),
  annualPosition: integer("annual_position"),
  annualAppreciation: text("annual_appreciation"), // "Good", "Satisfaisant", etc.
  
  // Council decision tracking
  councilDecision: text("council_decision"), // "Promoted", "Repeat", etc.
  promotionStatus: text("promotion_status"), // "Promoted", "Repeat", "Conditional"
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ===== DISCIPLINE TRACKING =====
// Track student discipline as shown in bulletin PDF
export const studentDiscipline = pgTable("student_discipline", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  classId: integer("class_id").notNull(),
  schoolId: integer("school_id").notNull(),
  term: text("term").notNull(), // "T1", "T2", "T3"
  academicYear: text("academic_year").notNull(),
  
  // Discipline fields from PDF
  sanctions: text("sanctions"), // "Dismissed", "Warning", etc.
  warnings: text("warnings"), // "serious W", etc.  
  absences: integer("absences").default(0),
  conductAppreciation: text("conduct_appreciation"), // Overall conduct rating
  finalRemark: text("final_remark"), // Final conduct remarks
  
  // Tracking
  recordedBy: integer("recorded_by"), // Teacher/Admin who recorded
  recordedAt: timestamp("recorded_at").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ===== STUDENT FEES TRACKING =====
// Track student fees as shown in bulletin PDF
export const studentFees = pgTable("student_fees", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  classId: integer("class_id").notNull(),
  schoolId: integer("school_id").notNull(),
  academicYear: text("academic_year").notNull(),
  
  // Fee information
  totalFees: decimal("total_fees", { precision: 10, scale: 2 }),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0.00"),
  outstandingAmount: decimal("outstanding_amount", { precision: 10, scale: 2 }),
  currency: text("currency").default("CFA"), // Currency code
  
  // Payment tracking
  lastPaymentDate: timestamp("last_payment_date"),
  paymentMethod: text("payment_method"), // Cash, transfer, etc.
  
  // Display on bulletin
  feesOwing: text("fees_owing"), // "FEES STILL OWING:" field from PDF
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ===== TERM PERFORMANCE SUMMARY =====
// Track performance by term as shown in bulletin
export const termPerformance = pgTable("term_performance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  classId: integer("class_id").notNull(),
  schoolId: integer("school_id").notNull(),
  term: text("term").notNull(), // "T1", "T2", "T3"
  academicYear: text("academic_year").notNull(),
  
  // Term averages and positions
  termAverage: decimal("term_average", { precision: 5, scale: 2 }),
  termPosition: integer("term_position"),
  totalStudents: integer("total_students"),
  
  // Performance appreciations (from PDF)
  workAppreciation: text("work_appreciation"), // "Distinction", "Credit", "Honour roll", etc.
  academicDecision: text("academic_decision"), // Final decision for term
  
  // Class statistics
  classAverage: decimal("class_average", { precision: 5, scale: 2 }),
  highestAverage: decimal("highest_average", { precision: 5, scale: 2 }),
  lowestAverage: decimal("lowest_average", { precision: 5, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ===== SUBJECT PERFORMANCE ENHANCEMENTS =====
// Enhanced subject-specific performance tracking
export const subjectPerformanceDetails = pgTable("subject_performance_details", {
  id: serial("id").primaryKey(),
  gradeSubmissionId: integer("grade_submission_id").notNull(), // References teacherGradeSubmissions
  studentId: integer("student_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  classId: integer("class_id").notNull(),
  term: text("term").notNull(),
  academicYear: text("academic_year").notNull(),
  
  // Position and performance in subject
  subjectPosition: integer("subject_position"), // Position in class for this subject
  subjectAverage: decimal("subject_average", { precision: 5, scale: 2 }),
  
  // Competence level (from PDF format)
  competenceLevel: text("competence_level"), // "CVWA", "CWA", "CAA", "CNA"
  competenceDescription: text("competence_description"), // Full description
  
  // Teacher information
  teacherName: text("teacher_name"), // Teacher name for display
  teacherId: integer("teacher_id"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ===== BULLETIN SETTINGS =====
// School-specific bulletin configuration
export const bulletinSettings = pgTable("bulletin_settings", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull().unique(),
  
  // Bulletin format preferences
  language: text("language").default("fr"), // "fr", "en", or "bilingual"
  showPhotos: boolean("show_photos").default(true),
  showQRCode: boolean("show_qr_code").default(true),
  
  // Subject categorization for bulletin display
  generalSubjects: jsonb("general_subjects"), // Array of subject IDs
  professionalSubjects: jsonb("professional_subjects"), // Array of subject IDs
  otherSubjects: jsonb("other_subjects"), // Array of subject IDs
  
  // Performance thresholds
  excellentThreshold: decimal("excellent_threshold").default("16.00"), // 16-20
  goodThreshold: decimal("good_threshold").default("12.00"), // 12-15.99
  averageThreshold: decimal("average_threshold").default("10.00"), // 10-11.99
  // Below 10 = Not Acquired
  
  // School identity for bulletin header
  schoolMotto: text("school_motto"),
  principalName: text("principal_name"),
  principalSignature: text("principal_signature_url"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ===== ZOD SCHEMAS =====
export const insertStudentAcademicInfoSchema = createInsertSchema(studentAcademicInfo);
export const insertStudentDisciplineSchema = createInsertSchema(studentDiscipline);
export const insertStudentFeesSchema = createInsertSchema(studentFees);
export const insertTermPerformanceSchema = createInsertSchema(termPerformance);
export const insertSubjectPerformanceDetailsSchema = createInsertSchema(subjectPerformanceDetails);
export const insertBulletinSettingsSchema = createInsertSchema(bulletinSettings);

// ===== TYPE EXPORTS =====
export type StudentAcademicInfo = typeof studentAcademicInfo.$inferSelect;
export type InsertStudentAcademicInfo = z.infer<typeof insertStudentAcademicInfoSchema>;
export type StudentDiscipline = typeof studentDiscipline.$inferSelect;
export type InsertStudentDiscipline = z.infer<typeof insertStudentDisciplineSchema>;
export type StudentFees = typeof studentFees.$inferSelect;
export type InsertStudentFees = z.infer<typeof insertStudentFeesSchema>;
export type TermPerformance = typeof termPerformance.$inferSelect;
export type InsertTermPerformance = z.infer<typeof insertTermPerformanceSchema>;
export type SubjectPerformanceDetails = typeof subjectPerformanceDetails.$inferSelect;
export type InsertSubjectPerformanceDetails = z.infer<typeof insertSubjectPerformanceDetailsSchema>;
export type BulletinSettings = typeof bulletinSettings.$inferSelect;
export type InsertBulletinSettings = z.infer<typeof insertBulletinSettingsSchema>;

// ===== PERFORMANCE CALCULATION CONSTANTS =====
export const COMPETENCE_LEVELS = {
  CVWA: { 
    code: "CVWA", 
    description: "Competence Very Well Acquired",
    descriptionFr: "Compétence Très Bien Acquise",
    range: [16, 20] 
  },
  CWA: { 
    code: "CWA", 
    description: "Competence Well Acquired", 
    descriptionFr: "Compétence Bien Acquise",
    range: [12, 15.99] 
  },
  CAA: { 
    code: "CAA", 
    description: "Competence Averagely Acquired", 
    descriptionFr: "Compétence Moyennement Acquise",
    range: [10, 11.99] 
  },
  CNA: { 
    code: "CNA", 
    description: "Competence Not Acquired", 
    descriptionFr: "Compétence Non Acquise",
    range: [0, 9.99] 
  }
} as const;

export const ANNUAL_PERFORMANCE = {
  DISTINCTION: { code: "Distinction", threshold: 16 },
  CREDIT: { code: "Credit", threshold: 14 },
  HONOR_ROLL: { code: "Honour roll", threshold: 12 },
  PROMOTED: { code: "Promoted", threshold: 10 },
  REPEAT: { code: "Repeat", threshold: 0 }
} as const;

export const SUBJECT_CATEGORIES = {
  GENERAL: "General Subjects",
  PROFESSIONAL: "Professional Subjects", 
  OTHERS: "Others/Divers"
} as const;
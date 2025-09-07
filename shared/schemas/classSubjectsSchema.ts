// ===== CLASS SUBJECTS SCHEMA =====
// Relation classe-matières-coefficients pour architecture optimisée

import { pgTable, serial, integer, text, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

// Table de liaison classe-matières avec coefficients spécifiques
export const classSubjects = pgTable("class_subjects", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  subjectName: text("subject_name").notNull(),
  coefficient: integer("coefficient").notNull().default(1),
  maxGrade: decimal("max_grade", { precision: 5, scale: 2 }).default("20.00"),
  minGrade: decimal("min_grade", { precision: 5, scale: 2 }).default("0.00"),
  isRequired: boolean("is_required").default(true),
  examType: text("exam_type").default("continuous"), // continuous, oral, practical, written
  hoursPerWeek: integer("hours_per_week").default(2),
  
  // Métadonnées pour l'organisation pédagogique
  subjectCategory: text("subject_category").default("general"), // general, professional, arts, sports
  teachingMethods: jsonb("teaching_methods"), // méthodes d'enseignement spécifiques
  evaluationCriteria: jsonb("evaluation_criteria"), // critères d'évaluation
  
  // Conformité curriculum camerounais
  curriculumCode: text("curriculum_code"), // Code officiel MINEDUB
  isOfficialSubject: boolean("is_official_subject").default(true),
  
  schoolId: integer("school_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isActive: boolean("is_active").default(true)
});

// Templates de matières par niveau (pour faciliter la création)
export const subjectTemplates = pgTable("subject_templates", {
  id: serial("id").primaryKey(),
  level: text("level").notNull(), // CP, CE1, 6ème, Terminale, etc.
  subjectName: text("subject_name").notNull(),
  defaultCoefficient: integer("default_coefficient").notNull(),
  category: text("category").notNull(), // general, professional, arts, sports
  isRequired: boolean("is_required").default(true),
  hoursPerWeek: integer("hours_per_week").default(2),
  curriculumCompliant: boolean("curriculum_compliant").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Affectation enseignants aux matières de classe
export const teacherClassSubjects = pgTable("teacher_class_subjects", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  classId: integer("class_id").notNull(), 
  classSubjectId: integer("class_subject_id").notNull(),
  schoolId: integer("school_id").notNull(),
  academicYear: text("academic_year").notNull(),
  isMainTeacher: boolean("is_main_teacher").default(false), // Professeur principal
  assignedAt: timestamp("assigned_at").defaultNow(),
  isActive: boolean("is_active").default(true)
});

export type ClassSubject = typeof classSubjects.$inferSelect;
export type InsertClassSubject = typeof classSubjects.$inferInsert;
export type SubjectTemplate = typeof subjectTemplates.$inferSelect;
export type TeacherClassSubject = typeof teacherClassSubjects.$inferSelect;
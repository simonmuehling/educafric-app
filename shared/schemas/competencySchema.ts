// ===== COMPETENCY-BASED APPROACH (CBA) SCHEMA =====
// Reusable competency library for CBA-compliant bulletins
// Supports Cameroon Ministry of Secondary Education CBA format

import { pgTable, serial, integer, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ===== COMPETENCIES TABLE =====
// Stores reusable competency descriptions that can be linked to subjects
// Example: "Utiliser les compétences langagières pour parler de la vie familiale..."
export const competencies = pgTable("competencies", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull(), // School-specific competencies
  
  // Subject and form level targeting
  subjectId: integer("subject_id"), // Link to subjects table (null = general competency)
  subjectName: text("subject_name"), // Cached subject name for quick reference
  formLevel: text("form_level"), // "Form 1", "Form 2", "Form 3", "Form 4", "Form 5", "6ème", "5ème", etc.
  
  // Competency descriptions (bilingual)
  competencyTextFr: text("competency_text_fr").notNull(), // French version
  competencyTextEn: text("competency_text_en"), // English version (optional)
  
  // Categorization
  category: text("category").default("general"), // "general", "professional", "optional"
  domainArea: text("domain_area"), // "Language", "Mathematics", "Sciences", "Arts", "Technical", etc.
  
  // Ordering and status
  displayOrder: integer("display_order").default(1), // Order of appearance in bulletin
  isActive: boolean("is_active").default(true), // Can be disabled without deletion
  
  // Metadata
  createdBy: integer("created_by"), // Director/Admin who created
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ===== SUBJECT-COMPETENCY ASSIGNMENTS TABLE =====
// Links multiple competencies to a subject for a specific form level
export const subjectCompetencyAssignments = pgTable("subject_competency_assignments", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull(),
  competencyId: integer("competency_id").notNull(),
  formLevel: text("form_level").notNull(), // "Form 4", "6ème", etc.
  displayOrder: integer("display_order").default(1), // Order within subject (1-4 typically)
  isRequired: boolean("is_required").default(true), // Must be evaluated
  createdAt: timestamp("created_at").defaultNow()
});

// ===== ZOD SCHEMAS =====

// Manual insert schemas for better compatibility
export const insertCompetencySchema = z.object({
  schoolId: z.number(),
  subjectId: z.number().optional(),
  subjectName: z.string().optional(),
  formLevel: z.string().optional(),
  competencyTextFr: z.string().min(10, "Competency description must be at least 10 characters"),
  competencyTextEn: z.string().min(10, "Competency description must be at least 10 characters").optional(),
  category: z.enum(["general", "professional", "optional"]).default("general"),
  domainArea: z.string().optional(),
  displayOrder: z.number().min(1).default(1),
  isActive: z.boolean().default(true),
  createdBy: z.number().optional()
});

export const insertSubjectCompetencyAssignmentSchema = z.object({
  subjectId: z.number().min(1, "Subject ID is required"),
  competencyId: z.number().min(1, "Competency ID is required"),
  formLevel: z.string().min(1, "Form level is required"),
  displayOrder: z.number().min(1).default(1),
  isRequired: z.boolean().default(true)
});

// Select schemas
export const selectCompetencySchema = createSelectSchema(competencies);
export const selectSubjectCompetencyAssignmentSchema = createSelectSchema(subjectCompetencyAssignments);

// Derived types
export type Competency = typeof competencies.$inferSelect;
export type NewCompetency = z.infer<typeof insertCompetencySchema>;
export type SubjectCompetencyAssignment = typeof subjectCompetencyAssignments.$inferSelect;
export type NewSubjectCompetencyAssignment = z.infer<typeof insertSubjectCompetencyAssignmentSchema>;

// ===== VALIDATION SCHEMAS =====

// Competency with assignments (for display)
export const competencyWithAssignmentsSchema = selectCompetencySchema.extend({
  assignments: z.array(selectSubjectCompetencyAssignmentSchema).optional()
});

export type CompetencyWithAssignments = z.infer<typeof competencyWithAssignmentsSchema>;

// Bulk competency creation
export const bulkCompetencyCreateSchema = z.object({
  subjectId: z.number(),
  subjectName: z.string(),
  formLevel: z.string(),
  competencies: z.array(z.object({
    competencyTextFr: z.string().min(10),
    competencyTextEn: z.string().optional(),
    category: z.enum(["general", "professional", "optional"]).optional(),
    displayOrder: z.number().optional()
  })).min(1, "At least one competency is required").max(6, "Maximum 6 competencies per subject")
});

export type BulkCompetencyCreate = z.infer<typeof bulkCompetencyCreateSchema>;

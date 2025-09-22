// ===== PREDEFINED APPRECIATIONS & COMPETENCY TEMPLATES SCHEMA =====
// System for managing predefined appreciations and competency evaluation templates
// Supports both French (APPRECIATION) and English (REMARKS) evaluation systems

import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ===== COMPETENCY EVALUATION SYSTEMS =====
// Table storing the different competency evaluation systems (APPRECIATION/REMARKS)
export const competencyEvaluationSystems = pgTable("competency_evaluation_systems", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "APPRECIATION" or "REMARKS_2"
  language: text("language").notNull(), // "fr" or "en"
  description: text("description"), // Description of the system
  isActive: boolean("is_active").default(true),
  
  // System configuration
  levels: jsonb("levels").notNull(), // Array of evaluation levels with codes, labels, and descriptions
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ===== PREDEFINED APPRECIATIONS =====
// Table storing predefined appreciation templates for schools and teachers
export const predefinedAppreciations = pgTable("predefined_appreciations", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id"), // Null for global templates, specific school ID for custom templates
  createdBy: integer("created_by").notNull(), // User ID who created the template
  
  // Template identification
  name: text("name").notNull(), // Template name (e.g., "Excellent performance", "Needs improvement")
  category: text("category").notNull(), // "general", "subject_specific", "conduct", "council_decision"
  targetRole: text("target_role").notNull(), // "teacher", "director", "council"
  
  // Bilingual content
  appreciationFr: text("appreciation_fr").notNull(), // French appreciation text
  appreciationEn: text("appreciation_en").notNull(), // English appreciation text
  
  // Context and usage
  subjectContext: text("subject_context"), // Subject name if subject-specific (e.g., "MATHÉMATIQUES")
  competencyLevel: text("competency_level"), // Associated competency level (CTBA, CBA, CA, CMA, CNA)
  gradeRange: jsonb("grade_range"), // {min: number, max: number} grade range this applies to
  
  // Usage settings
  isActive: boolean("is_active").default(true),
  isGlobal: boolean("is_global").default(false), // True for system-wide templates
  usageCount: integer("usage_count").default(0), // Track how often this template is used
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ===== COMPETENCY TEMPLATES =====
// Table storing competency templates by subject and term
export const competencyTemplates = pgTable("competency_templates", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id"), // Null for global templates
  createdBy: integer("created_by").notNull(),
  
  // Template identification
  subjectName: text("subject_name").notNull(), // Subject name (e.g., "MATHÉMATIQUES")
  term: text("term").notNull(), // "Premier", "Deuxième", "Troisième"
  classLevel: text("class_level"), // Grade level (e.g., "6ème", "5ème")
  
  // Competency content
  competenciesFr: text("competencies_fr").notNull(), // French competencies description
  competenciesEn: text("competencies_en").notNull(), // English competencies description
  
  // Additional context
  learningObjectives: jsonb("learning_objectives"), // Detailed learning objectives
  evaluationCriteria: jsonb("evaluation_criteria"), // How to evaluate these competencies
  
  // Usage settings
  isActive: boolean("is_active").default(true),
  isGlobal: boolean("is_global").default(false),
  usageCount: integer("usage_count").default(0),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ===== ZOD SCHEMAS FOR VALIDATION =====

// Competency level schema
const competencyLevelSchema = z.object({
  code: z.string(), // "CTBA", "CBA", etc.
  label: z.string(), // "Compétences très bien acquises"
  description: z.string(), // Detailed description
  gradeRange: z.object({
    min: z.number(),
    max: z.number()
  }),
  color: z.string().optional() // Color for UI display
});

// Competency evaluation system validation
export const competencyEvaluationSystemValidationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  language: z.enum(["fr", "en"], { errorMap: () => ({ message: "Language must be 'fr' or 'en'" }) }),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  levels: z.array(competencyLevelSchema).min(1, "At least one competency level is required")
});

// Predefined appreciation validation
export const predefinedAppreciationValidationSchema = z.object({
  schoolId: z.number().int().positive().optional(),
  createdBy: z.number().int().positive("Creator ID is required"),
  name: z.string().min(1, "Template name is required"),
  category: z.enum(["general", "subject_specific", "conduct", "council_decision"]),
  targetRole: z.enum(["teacher", "director", "council"]),
  appreciationFr: z.string().min(1, "French appreciation is required"),
  appreciationEn: z.string().min(1, "English appreciation is required"),
  subjectContext: z.string().optional(),
  competencyLevel: z.enum(["CTBA", "CBA", "CA", "CMA", "CNA", "CVWA", "CWA", "CAA"]).optional(),
  gradeRange: z.object({
    min: z.number().min(0).max(20),
    max: z.number().min(0).max(20)
  }).optional(),
  isActive: z.boolean().optional(),
  isGlobal: z.boolean().optional()
});

// Competency template validation
export const competencyTemplateValidationSchema = z.object({
  schoolId: z.number().int().positive().optional(),
  createdBy: z.number().int().positive("Creator ID is required"),
  subjectName: z.string().min(1, "Subject name is required"),
  term: z.enum(["Premier", "Deuxième", "Troisième"]),
  classLevel: z.string().optional(),
  competenciesFr: z.string().min(1, "French competencies are required"),
  competenciesEn: z.string().min(1, "English competencies are required"),
  learningObjectives: z.array(z.string()).optional(),
  evaluationCriteria: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isGlobal: z.boolean().optional()
});

// Insert schemas
export const insertCompetencyEvaluationSystemSchema = createInsertSchema(competencyEvaluationSystems);
export const insertPredefinedAppreciationSchema = createInsertSchema(predefinedAppreciations);
export const insertCompetencyTemplateSchema = createInsertSchema(competencyTemplates);

// ===== TYPE EXPORTS =====
export type CompetencyEvaluationSystem = typeof competencyEvaluationSystems.$inferSelect;
export type InsertCompetencyEvaluationSystem = z.infer<typeof insertCompetencyEvaluationSystemSchema>;

export type PredefinedAppreciation = typeof predefinedAppreciations.$inferSelect;
export type InsertPredefinedAppreciation = z.infer<typeof insertPredefinedAppreciationSchema>;

export type CompetencyTemplate = typeof competencyTemplates.$inferSelect;
export type InsertCompetencyTemplate = z.infer<typeof insertCompetencyTemplateSchema>;

// ===== DEFAULT DATA CONSTANTS =====

// Default competency evaluation systems
export const DEFAULT_COMPETENCY_SYSTEMS = {
  APPRECIATION: {
    name: "APPRECIATION",
    language: "fr",
    description: "Système d'évaluation français avec compétences très bien acquises à non acquises",
    levels: [
      {
        code: "CTBA",
        label: "Compétences très bien acquises",
        description: "Excellent niveau de maîtrise des compétences",
        gradeRange: { min: 16, max: 20 },
        color: "#10b981"
      },
      {
        code: "CBA",
        label: "Compétences bien acquises",
        description: "Bon niveau de maîtrise des compétences",
        gradeRange: { min: 14, max: 16 },
        color: "#3b82f6"
      },
      {
        code: "CA",
        label: "Compétences acquises",
        description: "Niveau satisfaisant de maîtrise des compétences",
        gradeRange: { min: 12, max: 14 },
        color: "#f59e0b"
      },
      {
        code: "CMA",
        label: "Compétences moyennement acquises",
        description: "Niveau moyen de maîtrise des compétences",
        gradeRange: { min: 10, max: 12 },
        color: "#f97316"
      },
      {
        code: "CNA",
        label: "Compétences non acquises",
        description: "Compétences non maîtrisées, nécessite un accompagnement",
        gradeRange: { min: 0, max: 10 },
        color: "#ef4444"
      }
    ]
  },
  REMARKS_2: {
    name: "REMARKS_2",
    language: "en",
    description: "English evaluation system with competences very well acquired to not acquired",
    levels: [
      {
        code: "CVWA",
        label: "Competences Very Well Acquired",
        description: "Excellent level of competency mastery",
        gradeRange: { min: 16, max: 20 },
        color: "#10b981"
      },
      {
        code: "CWA",
        label: "Competences Well Acquired",
        description: "Good level of competency mastery",
        gradeRange: { min: 14, max: 16 },
        color: "#3b82f6"
      },
      {
        code: "CA",
        label: "Competences Acquired",
        description: "Satisfactory level of competency mastery",
        gradeRange: { min: 12, max: 14 },
        color: "#f59e0b"
      },
      {
        code: "CAA",
        label: "Competences Averagely Acquired",
        description: "Average level of competency mastery",
        gradeRange: { min: 10, max: 12 },
        color: "#f97316"
      },
      {
        code: "CNA",
        label: "Competences Not Acquired",
        description: "Competencies not mastered, requires support",
        gradeRange: { min: 0, max: 10 },
        color: "#ef4444"
      }
    ]
  }
};

// Default appreciation templates
export const DEFAULT_APPRECIATION_TEMPLATES = [
  // General appreciations for excellent performance
  {
    name: "Excellent travail",
    category: "general",
    targetRole: "teacher",
    appreciationFr: "Excellent travail. L'élève démontre une maîtrise remarquable des compétences. Continue ainsi !",
    appreciationEn: "Excellent work. The student demonstrates remarkable mastery of competencies. Keep it up!",
    competencyLevel: "CTBA",
    gradeRange: { min: 16, max: 20 },
    isGlobal: true
  },
  {
    name: "Bon travail",
    category: "general",
    targetRole: "teacher",
    appreciationFr: "Bon travail. L'élève progresse bien. Quelques efforts supplémentaires pour exceller.",
    appreciationEn: "Good work. The student is progressing well. A few more efforts to excel.",
    competencyLevel: "CBA",
    gradeRange: { min: 14, max: 16 },
    isGlobal: true
  },
  {
    name: "Travail correct",
    category: "general",
    targetRole: "teacher",
    appreciationFr: "Travail correct. L'élève doit fournir plus d'efforts dans certaines matières.",
    appreciationEn: "Fair work. The student needs to put in more effort in some subjects.",
    competencyLevel: "CA",
    gradeRange: { min: 12, max: 14 },
    isGlobal: true
  },
  {
    name: "Efforts à fournir",
    category: "general",
    targetRole: "teacher",
    appreciationFr: "L'élève doit redoubler d'efforts. Un accompagnement personnalisé est recommandé.",
    appreciationEn: "The student needs to make more effort. Personalized support is recommended.",
    competencyLevel: "CMA",
    gradeRange: { min: 8, max: 12 },
    isGlobal: true
  },
  {
    name: "Difficultés importantes",
    category: "general",
    targetRole: "teacher",
    appreciationFr: "Difficultés importantes constatées. Un suivi renforcé et un soutien sont nécessaires.",
    appreciationEn: "Significant difficulties observed. Enhanced monitoring and support are necessary.",
    competencyLevel: "CNA",
    gradeRange: { min: 0, max: 8 },
    isGlobal: true
  },
  // Council decisions
  {
    name: "Félicitations",
    category: "council_decision",
    targetRole: "council",
    appreciationFr: "Félicitations du conseil de classe pour d'excellents résultats.",
    appreciationEn: "Congratulations from the class council for excellent results.",
    competencyLevel: "CTBA",
    gradeRange: { min: 16, max: 20 },
    isGlobal: true
  },
  {
    name: "Encouragements",
    category: "council_decision",
    targetRole: "council",
    appreciationFr: "Encouragements du conseil de classe. Continue tes efforts.",
    appreciationEn: "Encouragement from the class council. Keep up your efforts.",
    competencyLevel: "CBA",
    gradeRange: { min: 14, max: 16 },
    isGlobal: true
  },
  {
    name: "Mise en garde",
    category: "council_decision",
    targetRole: "council",
    appreciationFr: "Mise en garde du conseil de classe. Des améliorations sont attendues.",
    appreciationEn: "Warning from the class council. Improvements are expected.",
    competencyLevel: "CMA",
    gradeRange: { min: 8, max: 12 },
    isGlobal: true
  }
];
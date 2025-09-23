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

// ===== COMPREHENSIVE MINISTRY TEACHER COMMENTS LIST =====
// Liste officielle des commentaires pour l'enseignant (Ministère des Enseignements Secondaires)
export const DEFAULT_APPRECIATION_TEMPLATES = [
  // ===== EXCELLENTE PERFORMANCE (CTBA - 16-20/20) =====
  {
    name: "Excellence remarquable",
    category: "general",
    targetRole: "teacher",
    appreciationFr: "Travail excellent. L'élève fait preuve d'une maîtrise exceptionnelle des compétences. Félicitations !",
    appreciationEn: "Excellent work. The student demonstrates exceptional mastery of skills. Congratulations!",
    competencyLevel: "CTBA",
    gradeRange: { min: 18, max: 20 },
    isGlobal: true
  },
  {
    name: "Très bon élève",
    category: "general", 
    targetRole: "teacher",
    appreciationFr: "Très bon élève. Résultats remarquables. Continue sur cette excellente voie.",
    appreciationEn: "Very good student. Remarkable results. Continue on this excellent path.",
    competencyLevel: "CTBA",
    gradeRange: { min: 16, max: 18 },
    isGlobal: true
  },
  {
    name: "Compétences maîtrisées",
    category: "general",
    targetRole: "teacher", 
    appreciationFr: "Toutes les compétences sont parfaitement maîtrisées. Élève modèle à suivre.",
    appreciationEn: "All competencies are perfectly mastered. Model student to follow.",
    competencyLevel: "CTBA",
    gradeRange: { min: 16, max: 20 },
    isGlobal: true
  },

  // ===== BONNE PERFORMANCE (CBA - 14-16/20) =====
  {
    name: "Bon travail général",
    category: "general",
    targetRole: "teacher",
    appreciationFr: "Bon travail dans l'ensemble. L'élève progresse de façon satisfaisante.",
    appreciationEn: "Good overall work. The student is progressing satisfactorily.",
    competencyLevel: "CBA",
    gradeRange: { min: 14, max: 16 },
    isGlobal: true
  },
  {
    name: "Résultats encourageants",
    category: "general",
    targetRole: "teacher",
    appreciationFr: "Résultats encourageants. Quelques efforts supplémentaires pour atteindre l'excellence.",
    appreciationEn: "Encouraging results. A few more efforts to reach excellence.",
    competencyLevel: "CBA", 
    gradeRange: { min: 14, max: 16 },
    isGlobal: true
  },
  {
    name: "Élève sérieux",
    category: "general",
    targetRole: "teacher",
    appreciationFr: "Élève sérieux et appliqué. Maintenir cette régularité dans le travail.",
    appreciationEn: "Serious and dedicated student. Maintain this consistency in work.",
    competencyLevel: "CBA",
    gradeRange: { min: 14, max: 16 },
    isGlobal: true
  },

  // ===== PERFORMANCE SATISFAISANTE (CA - 12-14/20) =====
  {
    name: "Travail acceptable",
    category: "general",
    targetRole: "teacher",
    appreciationFr: "Travail acceptable mais peut mieux faire. Plus de rigueur nécessaire.",
    appreciationEn: "Acceptable work but can do better. More rigor needed.",
    competencyLevel: "CA",
    gradeRange: { min: 12, max: 14 },
    isGlobal: true
  },
  {
    name: "Progrès à consolider", 
    category: "general",
    targetRole: "teacher",
    appreciationFr: "Des progrès sont notés mais restent à consolider par un travail plus soutenu.",
    appreciationEn: "Progress is noted but needs to be consolidated through more sustained work.",
    competencyLevel: "CA",
    gradeRange: { min: 12, max: 14 },
    isGlobal: true
  },
  {
    name: "Résultats moyens",
    category: "general",
    targetRole: "teacher",
    appreciationFr: "Résultats moyens. L'élève doit redoubler d'efforts pour progresser.",
    appreciationEn: "Average results. The student must work harder to progress.",
    competencyLevel: "CA",
    gradeRange: { min: 12, max: 14 },
    isGlobal: true
  },

  // ===== PERFORMANCE INSUFFISANTE (CMA - 10-12/20) =====
  {
    name: "Travail insuffisant",
    category: "general",
    targetRole: "teacher",
    appreciationFr: "Travail insuffisant. Doit fournir plus d'efforts et être plus attentif en classe.",
    appreciationEn: "Insufficient work. Must make more effort and be more attentive in class.",
    competencyLevel: "CMA",
    gradeRange: { min: 10, max: 12 },
    isGlobal: true
  },
  {
    name: "Résultats décevants",
    category: "general",
    targetRole: "teacher",
    appreciationFr: "Résultats décevants compte tenu des capacités de l'élève. Plus de sérieux demandé.",
    appreciationEn: "Disappointing results given the student's abilities. More seriousness required.",
    competencyLevel: "CMA",
    gradeRange: { min: 10, max: 12 },
    isGlobal: true
  },
  {
    name: "Manque de régularité",
    category: "general",
    targetRole: "teacher",
    appreciationFr: "Manque de régularité dans le travail. L'élève doit être plus constant dans ses efforts.",
    appreciationEn: "Lack of consistency in work. The student must be more constant in their efforts.",
    competencyLevel: "CMA",
    gradeRange: { min: 10, max: 12 },
    isGlobal: true
  },

  // ===== PERFORMANCE FAIBLE (CNA - 0-10/20) =====
  {
    name: "Grandes difficultés",
    category: "general",
    targetRole: "teacher",
    appreciationFr: "L'élève éprouve de grandes difficultés. Un soutien pédagogique s'impose.",
    appreciationEn: "The student experiences great difficulties. Pedagogical support is essential.",
    competencyLevel: "CNA",
    gradeRange: { min: 0, max: 10 },
    isGlobal: true
  },
  {
    name: "Travail très insuffisant",
    category: "general",
    targetRole: "teacher",
    appreciationFr: "Travail très insuffisant. L'élève doit absolument se ressaisir et travailler davantage.",
    appreciationEn: "Very insufficient work. The student must absolutely pull themselves together and work more.",
    competencyLevel: "CNA",
    gradeRange: { min: 0, max: 10 },
    isGlobal: true
  },
  {
    name: "Bases non acquises",
    category: "general", 
    targetRole: "teacher",
    appreciationFr: "Les bases fondamentales ne sont pas acquises. Recommande un accompagnement renforcé.",
    appreciationEn: "Fundamental basics are not acquired. Recommend reinforced support.",
    competencyLevel: "CNA",
    gradeRange: { min: 0, max: 8 },
    isGlobal: true
  },

  // ===== COMMENTAIRES SPÉCIFIQUES PAR MATIÈRE =====
  
  // MATHÉMATIQUES
  {
    name: "Excellent en calcul",
    category: "subject_specific",
    targetRole: "teacher",
    appreciationFr: "Excellent en calcul mental et écrit. Raisonnement mathématique très développé.",
    appreciationEn: "Excellent in mental and written calculation. Very developed mathematical reasoning.",
    subjectContext: "MATHÉMATIQUES",
    competencyLevel: "CTBA",
    gradeRange: { min: 16, max: 20 },
    isGlobal: true
  },
  {
    name: "Bonne logique mathématique",
    category: "subject_specific",
    targetRole: "teacher",
    appreciationFr: "Bonne capacité de raisonnement logique. Maîtrise correcte des opérations de base.",
    appreciationEn: "Good logical reasoning ability. Correct mastery of basic operations.",
    subjectContext: "MATHÉMATIQUES",
    competencyLevel: "CBA",
    gradeRange: { min: 14, max: 16 },
    isGlobal: true
  },
  {
    name: "Difficultés en géométrie",
    category: "subject_specific",
    targetRole: "teacher",
    appreciationFr: "Quelques difficultés en géométrie. Réviser les propriétés des figures planes.",
    appreciationEn: "Some difficulties in geometry. Review properties of plane figures.",
    subjectContext: "MATHÉMATIQUES",
    competencyLevel: "CA",
    gradeRange: { min: 10, max: 14 },
    isGlobal: true
  },

  // FRANÇAIS
  {
    name: "Excellente maîtrise du français",
    category: "subject_specific",
    targetRole: "teacher",
    appreciationFr: "Excellente maîtrise de la langue française. Expression écrite et orale remarquables.",
    appreciationEn: "Excellent mastery of French language. Remarkable written and oral expression.",
    subjectContext: "FRANÇAIS",
    competencyLevel: "CTBA",
    gradeRange: { min: 16, max: 20 },
    isGlobal: true
  },
  {
    name: "Bonne expression écrite",
    category: "subject_specific",
    targetRole: "teacher",
    appreciationFr: "Bonne expression écrite. Continuer à enrichir le vocabulaire et la syntaxe.",
    appreciationEn: "Good written expression. Continue to enrich vocabulary and syntax.",
    subjectContext: "FRANÇAIS",
    competencyLevel: "CBA",
    gradeRange: { min: 14, max: 16 },
    isGlobal: true
  },
  {
    name: "Fautes d'orthographe",
    category: "subject_specific",
    targetRole: "teacher",
    appreciationFr: "Trop de fautes d'orthographe et de grammaire. Réviser les règles de base.",
    appreciationEn: "Too many spelling and grammar mistakes. Review basic rules.",
    subjectContext: "FRANÇAIS",
    competencyLevel: "CMA",
    gradeRange: { min: 8, max: 12 },
    isGlobal: true
  },

  // ANGLAIS
  {
    name: "Excellent niveau d'anglais",
    category: "subject_specific",
    targetRole: "teacher",
    appreciationFr: "Excellent niveau d'anglais. Compréhension et expression parfaitement maîtrisées.",
    appreciationEn: "Excellent level of English. Comprehension and expression perfectly mastered.",
    subjectContext: "ANGLAIS",
    competencyLevel: "CTBA",
    gradeRange: { min: 16, max: 20 },
    isGlobal: true
  },
  {
    name: "Bon vocabulaire anglais",
    category: "subject_specific",
    targetRole: "teacher",
    appreciationFr: "Bon vocabulaire de base. Travailler davantage la grammaire anglaise.",
    appreciationEn: "Good basic vocabulary. Work more on English grammar.",
    subjectContext: "ANGLAIS",
    competencyLevel: "CBA",
    gradeRange: { min: 14, max: 16 },
    isGlobal: true
  },
  {
    name: "Difficultés de prononciation",
    category: "subject_specific",
    targetRole: "teacher",
    appreciationFr: "Difficultés de prononciation. Pratiquer davantage l'expression orale en anglais.",
    appreciationEn: "Pronunciation difficulties. Practice more oral expression in English.",
    subjectContext: "ANGLAIS",
    competencyLevel: "CA",
    gradeRange: { min: 10, max: 14 },
    isGlobal: true
  },

  // SCIENCES
  {
    name: "Esprit scientifique développé",
    category: "subject_specific",
    targetRole: "teacher",
    appreciationFr: "Esprit scientifique très développé. Excellent sens de l'observation et de l'analyse.",
    appreciationEn: "Very developed scientific mind. Excellent sense of observation and analysis.",
    subjectContext: "SCIENCES",
    competencyLevel: "CTBA",
    gradeRange: { min: 16, max: 20 },
    isGlobal: true
  },
  {
    name: "Bon raisonnement scientifique",
    category: "subject_specific",
    targetRole: "teacher",
    appreciationFr: "Bon raisonnement scientifique. Comprend bien les phénomènes étudiés.",
    appreciationEn: "Good scientific reasoning. Understands well the phenomena studied.",
    subjectContext: "SCIENCES",
    competencyLevel: "CBA",
    gradeRange: { min: 14, max: 16 },
    isGlobal: true
  },
  {
    name: "Manque de méthode",
    category: "subject_specific",
    targetRole: "teacher",
    appreciationFr: "Manque de méthode dans la démarche scientifique. Améliorer l'organisation du travail.",
    appreciationEn: "Lack of method in scientific approach. Improve work organization.",
    subjectContext: "SCIENCES",
    competencyLevel: "CA",
    gradeRange: { min: 10, max: 14 },
    isGlobal: true
  },

  // ===== COMMENTAIRES COMPORTEMENTAUX =====
  {
    name: "Élève discipliné",
    category: "conduct",
    targetRole: "teacher",
    appreciationFr: "Élève discipliné et respectueux. Comportement exemplaire en classe.",
    appreciationEn: "Disciplined and respectful student. Exemplary behavior in class.",
    competencyLevel: "CTBA",
    isGlobal: true
  },
  {
    name: "Participation active",
    category: "conduct",
    targetRole: "teacher",
    appreciationFr: "Participe activement aux cours. Attitude positive face aux apprentissages.",
    appreciationEn: "Actively participates in lessons. Positive attitude towards learning.",
    competencyLevel: "CBA",
    isGlobal: true
  },
  {
    name: "Manque d'attention",
    category: "conduct",
    targetRole: "teacher",
    appreciationFr: "Manque d'attention en classe. Doit être plus concentré pendant les leçons.",
    appreciationEn: "Lack of attention in class. Must be more focused during lessons.",
    competencyLevel: "CMA",
    isGlobal: true
  },
  {
    name: "Bavardages excessifs",
    category: "conduct",
    targetRole: "teacher",
    appreciationFr: "Bavardages excessifs qui perturbent la classe. Doit améliorer son comportement.",
    appreciationEn: "Excessive talking that disrupts the class. Must improve behavior.",
    competencyLevel: "CMA",
    isGlobal: true
  },

  // ===== DÉCISIONS DU CONSEIL DE CLASSE =====
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
  },
  {
    name: "Blâme",
    category: "council_decision",
    targetRole: "council", 
    appreciationFr: "Blâme du conseil de classe. Redressement impératif demandé.",
    appreciationEn: "Blame from the class council. Imperative improvement required.",
    competencyLevel: "CNA",
    gradeRange: { min: 0, max: 10 },
    isGlobal: true
  }
];
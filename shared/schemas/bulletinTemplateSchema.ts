import { pgTable, text, serial, integer, boolean, timestamp, jsonb, numeric, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Table principale pour les modèles de bulletins
export const bulletinTemplates = pgTable("bulletin_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  schoolId: integer("school_id").notNull(),
  createdBy: integer("created_by").notNull(), // User ID of creator
  
  // Métadonnées du template
  templateType: text("template_type").notNull().default("custom"), // custom, default, shared
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  version: integer("version").default(1),
  
  // Configuration du template
  pageFormat: text("page_format").default("A4"), // A4, A3, Letter
  orientation: text("orientation").default("portrait"), // portrait, landscape
  margins: jsonb("margins").$type<{
    top: number;
    right: number;
    bottom: number;
    left: number;
  }>().default({ top: 20, right: 20, bottom: 20, left: 20 }),
  
  // Structure du template (JSON des éléments placés)
  elements: jsonb("elements").$type<TemplateElement[]>().notNull().default([]),
  
  // Paramètres de style global
  globalStyles: jsonb("global_styles").$type<{
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    colors: {
      primary: string;
      secondary: string;
      text: string;
      background: string;
    };
  }>().default({
    fontFamily: "Arial",
    fontSize: 12,
    lineHeight: 1.4,
    colors: {
      primary: "#1f2937",
      secondary: "#6b7280",
      text: "#374151",
      background: "#ffffff"
    }
  }),
  
  // Métadonnées d'utilisation
  usageCount: integer("usage_count").default(0),
  lastUsedAt: timestamp("last_used_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Table pour l'historique des versions des templates
export const bulletinTemplateVersions = pgTable("bulletin_template_versions", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull(),
  version: integer("version").notNull(),
  name: text("name").notNull(),
  elements: jsonb("elements").$type<TemplateElement[]>().notNull(),
  globalStyles: jsonb("global_styles"),
  changeDescription: text("change_description"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Table pour les éléments prédéfinis disponibles
export const templateElementTypes = pgTable("template_element_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // student_info, grades, attendance, sanctions, signatures, etc.
  description: text("description"),
  icon: text("icon"), // Nom de l'icône Lucide
  defaultProperties: jsonb("default_properties").$type<ElementProperties>(),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  
  // Contraintes d'utilisation
  maxInstances: integer("max_instances").default(1), // -1 pour illimité
  requiredDataFields: text("required_data_fields").array(), // Champs de données requis
  
  createdAt: timestamp("created_at").defaultNow()
});

// Types TypeScript pour les éléments du template
export interface TemplateElement {
  id: string;
  type: string; // Type d'élément (student_name, subject_grades, etc.)
  category: string; // Catégorie (student_info, grades, etc.)
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  properties: ElementProperties;
  zIndex: number;
}

export interface ElementProperties {
  // Propriétés de style étendues
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: "solid" | "dashed" | "dotted" | "double" | "none";
  borderRadius?: number;
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
  margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
  textAlign?: "left" | "center" | "right" | "justify";
  verticalAlign?: "top" | "middle" | "bottom";
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  textDecoration?: "none" | "underline" | "overline" | "line-through";
  
  // Propriétés spécifiques au contenu
  label?: string;
  placeholder?: string;
  format?: string; // Format d'affichage (ex: pour les dates, nombres)
  showBorder?: boolean;
  showHeader?: boolean;
  headerText?: string;
  footerText?: string;
  
  // Propriétés de validation et contraintes
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  decimalPlaces?: number; // Pour les notes et moyennes
  required?: boolean;
  
  // Propriétés conditionnelles
  visible?: boolean;
  conditional?: {
    field: string;
    operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "exists" | "is_empty";
    value: any;
  };
  
  // Propriétés pour les tableaux
  columns?: Array<{
    field: string;
    label: string;
    width: number;
    align: "left" | "center" | "right";
    format?: string;
    showTotal?: boolean;
  }>;
  showRowNumbers?: boolean;
  alternateRowColors?: boolean;
  maxRows?: number;
  
  // Propriétés pour les images
  imageUrl?: string;
  imageScale?: "fit" | "fill" | "stretch" | "contain";
  imageWidth?: number;
  imageHeight?: number;
  imageBorder?: boolean;
  
  // Propriétés pour les signatures
  signatureType?: "text" | "image" | "both";
  signatureWidth?: number;
  signatureHeight?: number;
  showSignatureLine?: boolean;
  signaturePlaceholder?: string;
  
  // Propriétés pour les notes et coefficients
  gradeFormat?: "decimal" | "fraction" | "percentage" | "letter";
  showCoefficient?: boolean;
  coefficientLabel?: string;
  gradeScale?: string; // ex: "0-20", "A-F"
  
  // Propriétés de langue et localisation
  language?: "fr" | "en" | "both";
  dateFormat?: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  numberFormat?: "french" | "english"; // 15,5 vs 15.5
  
  // Propriétés d'interaction
  clickable?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  editable?: boolean;
}

// Schémas Zod pour la validation
export const templateElementSchema = z.object({
  id: z.string(),
  type: z.string(),
  category: z.string(),
  position: z.object({
    x: z.number().min(0),
    y: z.number().min(0),
    width: z.number().min(1),
    height: z.number().min(1)
  }),
  properties: z.object({
    // Propriétés de style étendues
    fontSize: z.number().optional(),
    fontFamily: z.string().optional(),
    fontWeight: z.union([z.string(), z.number()]).optional(),
    color: z.string().optional(),
    backgroundColor: z.string().optional(),
    borderColor: z.string().optional(),
    borderWidth: z.number().optional(),
    borderStyle: z.enum(["solid", "dashed", "dotted", "double", "none"]).optional(),
    borderRadius: z.number().optional(),
    padding: z.union([z.number(), z.object({
      top: z.number().optional(),
      right: z.number().optional(),
      bottom: z.number().optional(),
      left: z.number().optional()
    })]).optional(),
    margin: z.union([z.number(), z.object({
      top: z.number().optional(),
      right: z.number().optional(),
      bottom: z.number().optional(),
      left: z.number().optional()
    })]).optional(),
    textAlign: z.enum(["left", "center", "right", "justify"]).optional(),
    verticalAlign: z.enum(["top", "middle", "bottom"]).optional(),
    lineHeight: z.number().optional(),
    letterSpacing: z.number().optional(),
    textTransform: z.enum(["none", "uppercase", "lowercase", "capitalize"]).optional(),
    textDecoration: z.enum(["none", "underline", "overline", "line-through"]).optional(),
    
    // Propriétés spécifiques au contenu
    label: z.string().optional(),
    headerText: z.string().optional(),
    footerText: z.string().optional(),
    placeholder: z.string().optional(),
    format: z.string().optional(),
    showBorder: z.boolean().optional(),
    showHeader: z.boolean().optional(),
    visible: z.boolean().optional(),
    conditional: z.object({
      field: z.string(),
      operator: z.enum(["equals", "not_equals", "greater_than", "less_than", "contains", "exists", "is_empty"]),
      value: z.any()
    }).optional(),
    
    // Propriétés de validation et contraintes
    minValue: z.number().optional(),
    maxValue: z.number().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    decimalPlaces: z.number().optional(),
    required: z.boolean().optional(),
    // Propriétés pour les tableaux
    columns: z.array(z.object({
      field: z.string(),
      label: z.string(),
      width: z.number(),
      align: z.enum(["left", "center", "right"]),
      format: z.string().optional(),
      showTotal: z.boolean().optional()
    })).optional(),
    showRowNumbers: z.boolean().optional(),
    alternateRowColors: z.boolean().optional(),
    maxRows: z.number().optional(),
    // Propriétés pour les images
    imageUrl: z.string().optional(),
    imageScale: z.enum(["fit", "fill", "stretch", "contain"]).optional(),
    imageWidth: z.number().optional(),
    imageHeight: z.number().optional(),
    imageBorder: z.boolean().optional(),
    
    // Propriétés pour les signatures
    signatureType: z.enum(["text", "image", "both"]).optional(),
    signatureWidth: z.number().optional(),
    signatureHeight: z.number().optional(),
    showSignatureLine: z.boolean().optional(),
    signaturePlaceholder: z.string().optional(),
    
    // Propriétés pour les notes et coefficients
    gradeFormat: z.enum(["decimal", "fraction", "percentage", "letter"]).optional(),
    showCoefficient: z.boolean().optional(),
    coefficientLabel: z.string().optional(),
    gradeScale: z.string().optional(),
    
    // Propriétés de langue et localisation
    language: z.enum(["fr", "en", "both"]).optional(),
    dateFormat: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]).optional(),
    numberFormat: z.enum(["french", "english"]).optional(),
    
    // Propriétés d'interaction
    clickable: z.boolean().optional(),
    draggable: z.boolean().optional(),
    resizable: z.boolean().optional(),
    editable: z.boolean().optional()
  }).passthrough(), // Évite le stripping des clés inconnues
  zIndex: z.number()
});

export const bulletinTemplateInsertSchema = createInsertSchema(bulletinTemplates, {
  name: z.string().min(1, "Le nom est requis").max(255),
  description: z.string().max(1000).optional(),
  elements: z.array(templateElementSchema),
  pageFormat: z.enum(["A4", "A3", "Letter"]),
  orientation: z.enum(["portrait", "landscape"])
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usageCount: true,
  lastUsedAt: true
});

export const bulletinTemplateSelectSchema = createSelectSchema(bulletinTemplates);

export const templateElementTypeInsertSchema = createInsertSchema(templateElementTypes, {
  name: z.string().min(1, "Le nom est requis").max(255),
  category: z.string().min(1, "La catégorie est requise"),
  description: z.string().max(500).optional(),
  maxInstances: z.number().int().min(-1),
  requiredDataFields: z.array(z.string()).optional()
}).omit({
  id: true,
  createdAt: true
});

export const templateElementTypeSelectSchema = createSelectSchema(templateElementTypes);

// Types d'inférence
export type BulletinTemplate = typeof bulletinTemplates.$inferSelect;
export type InsertBulletinTemplate = z.infer<typeof bulletinTemplateInsertSchema>;
export type BulletinTemplateVersion = typeof bulletinTemplateVersions.$inferSelect;
export type TemplateElementType = typeof templateElementTypes.$inferSelect;
export type InsertTemplateElementType = z.infer<typeof templateElementTypeInsertSchema>;

// Constantes pour les catégories d'éléments - Organisées par ordre logique de création d'un bulletin
export const ELEMENT_CATEGORIES = {
  // 1. Identification et en-tête
  HEADER: "header",
  STUDENT_INFO: "student_info",
  ACADEMIC_INFO: "academic_info",
  
  // 2. Données académiques principales
  GRADES: "grades",
  COEFFICIENTS: "coefficients",
  AVERAGES: "averages", 
  STATISTICS: "statistics",
  
  // 3. Comportement et assiduité
  ATTENDANCE: "attendance",
  SANCTIONS: "sanctions",
  
  // 4. Évaluations et appréciations
  APPRECIATIONS: "appreciations",
  CLASS_COUNCIL: "class_council",
  
  // 5. Validation et signatures
  SIGNATURES: "signatures",
  
  // 6. Éléments de présentation
  LOGOS_STAMPS: "logos_stamps",
  TEXT: "text",
  IMAGES: "images",
  LAYOUT: "layout"
} as const;

// Types d'éléments prédéfinis - Bibliothèque complète pour bulletin scolaire africain
export const ELEMENT_TYPES = {
  // === CATEGORY: HEADER (En-tête du bulletin) ===
  BULLETIN_TITLE: "bulletin_title", // Titre du bulletin
  SCHOOL_NAME: "school_name", // Nom de l'établissement
  SCHOOL_ADDRESS: "school_address", // Adresse de l'école
  SCHOOL_PHONE: "school_phone", // Téléphone de l'école
  PERFORMANCE_LEVELS_TEXT: "performance_levels_text", // Texte explicatif des niveaux
  
  // === CATEGORY: STUDENT_INFO (Informations élève) ===
  STUDENT_NAME: "student_name",
  STUDENT_MATRICULE: "student_matricule",
  STUDENT_CLASS: "student_class",
  STUDENT_PHOTO: "student_photo",
  STUDENT_BIRTH_DATE: "student_birth_date",
  STUDENT_GENDER: "student_gender",
  STUDENT_AGE: "student_age",
  
  // === CATEGORY: ACADEMIC_INFO (Informations académiques) ===
  ACADEMIC_YEAR: "academic_year",
  TERM_SEMESTER: "term_semester", // Trimestre/Semestre
  CLASS_LEVEL: "class_level", // Niveau de la classe
  TOTAL_STUDENTS: "total_students", // Effectif de la classe
  
  // === CATEGORY: GRADES (Notes et évaluations) ===
  SUBJECT_GRADES: "subject_grades", // Tableau des notes par matière
  SUBJECT_GRADES_DETAILED: "subject_grades_detailed", // Notes détaillées (1ère, 2ème, 3ème éval)
  INDIVIDUAL_SUBJECT_GRADE: "individual_subject_grade", // Note d'une matière spécifique
  SUBJECT_COMMENT: "subject_comment", // Commentaire par matière
  
  // === CATEGORY: COEFFICIENTS (Coefficients et codes CTBA/CBA/CA/CMA) ===
  CTBA_VALUE: "ctba_value", // Contrôle Total des Bases Acquises
  CBA_VALUE: "cba_value", // Contrôle des Bases Acquises
  CA_VALUE: "ca_value", // Contrôle d'Approfondissement
  CMA_VALUE: "cma_value", // Contrôle de Maîtrise Approfondie
  COTE_VALUE: "cote_value", // Cote (A, B, C, D, E, F)
  CNA_VALUE: "cna_value", // Compétence Non Acquise
  MIN_MAX_GRADES: "min_max_grades", // Valeurs [Min-Max] par matière
  COEFFICIENT_TABLE: "coefficient_table", // Tableau des coefficients par matière
  
  // === CATEGORY: AVERAGES (Moyennes et totaux) ===
  GENERAL_AVERAGE: "general_average",
  TRIMESTER_AVERAGE: "trimester_average",
  SUBJECT_AVERAGE: "subject_average", // Moyenne par matière
  TOTAL_GENERAL: "total_general", // TOTAL GÉNÉRAL
  NUMBER_OF_AVERAGES: "number_of_averages", // Nombre de moyennes
  CLASS_AVERAGE: "class_average", // Moyenne de la classe
  
  // === CATEGORY: STATISTICS (Statistiques et classements) ===
  CLASS_RANK: "class_rank",
  SUCCESS_RATE: "success_rate", // Taux de réussite en %
  PERFORMANCE_LEVEL: "performance_level",
  CLASS_PROFILE: "class_profile", // Profil de la classe
  GRADE_DISTRIBUTION: "grade_distribution", // Répartition des notes
  
  // === CATEGORY: ATTENDANCE (Absences et retards) ===
  UNJUSTIFIED_ABSENCES: "unjustified_absences",
  JUSTIFIED_ABSENCES: "justified_absences",
  LATENESS_COUNT: "lateness_count",
  DETENTION_HOURS: "detention_hours",
  TOTAL_ABSENCE_HOURS: "total_absence_hours", // Total heures d'absence
  ATTENDANCE_RATE: "attendance_rate", // Taux d'assiduité
  
  // === CATEGORY: SANCTIONS (Sanctions disciplinaires) ===
  CONDUCT_WARNING: "conduct_warning",
  CONDUCT_BLAME: "conduct_blame",
  EXCLUSION_DAYS: "exclusion_days",
  PERMANENT_EXCLUSION: "permanent_exclusion",
  DISCIPLINARY_RECORD: "disciplinary_record", // Dossier disciplinaire complet
  
  // === CATEGORY: APPRECIATIONS (Appréciations et commentaires) ===
  WORK_APPRECIATION: "work_appreciation", // Appréciation du travail
  GENERAL_COMMENT: "general_comment", // Commentaire général
  TEACHER_APPRECIATION: "teacher_appreciation", // Appréciation du professeur principal
  PROGRESS_COMMENT: "progress_comment", // Commentaire sur les progrès
  IMPROVEMENT_AREAS: "improvement_areas", // Points à améliorer
  STRENGTHS: "strengths", // Points forts
  
  // === CATEGORY: CLASS_COUNCIL (Conseil de classe) ===
  CLASS_COUNCIL_DECISIONS: "class_council_decisions",
  CLASS_COUNCIL_MENTIONS: "class_council_mentions",
  ORIENTATION_RECOMMENDATIONS: "orientation_recommendations",
  COUNCIL_DATE: "council_date", // Date du conseil de classe
  COUNCIL_PARTICIPANTS: "council_participants", // Participants du conseil
  COUNCIL_PRESIDENT: "council_president", // Président du conseil
  
  // === CATEGORY: SIGNATURES (Signatures et visas) ===
  PARENT_SIGNATURE: "parent_signature",
  TEACHER_SIGNATURE: "teacher_signature",
  HEADMASTER_SIGNATURE: "headmaster_signature",
  PARENT_VISA_DATE: "parent_visa_date", // Date visa parent
  TEACHER_VISA_DATE: "teacher_visa_date", // Date visa enseignant
  HEADMASTER_VISA_DATE: "headmaster_visa_date", // Date visa directeur
  SIGNATURE_BLOCK: "signature_block", // Bloc de signatures groupées
  
  // === CATEGORY: LOGOS_STAMPS (Logos et tampons officiels) ===
  SCHOOL_LOGO: "school_logo",
  CAMEROON_REPUBLIC_LOGO: "cameroon_republic_logo", // Logo République du Cameroun
  MINISTERIAL_LOGO: "ministerial_logo", // Logo Ministère de l'Éducation
  SCHOOL_OFFICIAL_STAMP: "school_official_stamp", // Tampon officiel de l'école
  DIRECTOR_STAMP: "director_stamp", // Tampon du directeur
  
  // === CATEGORY: TEXT (Zones de texte) ===
  FREE_TEXT: "free_text",
  TEXT_LABEL: "text_label",
  BULLETIN_HEADER: "bulletin_header", // En-tête personnalisé
  BULLETIN_FOOTER: "bulletin_footer", // Pied de page
  GRADE_SCALE_LEGEND: "grade_scale_legend", // Légende de l'échelle de notes
  INSTRUCTIONS_TEXT: "instructions_text", // Instructions ou consignes
  
  // === CATEGORY: IMAGES (Images et éléments visuels) ===
  BACKGROUND_IMAGE: "background_image",
  DECORATIVE_IMAGE: "decorative_image", // Image décorative
  QR_CODE: "qr_code", // QR Code pour vérification
  BARCODE: "barcode", // Code-barres
  
  // === CATEGORY: LAYOUT (Éléments de mise en page) ===
  DIVIDER: "divider",
  SPACER: "spacer",
  BORDER: "border",
  TABLE_CONTAINER: "table_container", // Conteneur de tableau
  SECTION_HEADER: "section_header", // En-tête de section
  PAGE_BREAK: "page_break", // Saut de page
  GRID_CONTAINER: "grid_container" // Container en grille
} as const;

export type ElementCategory = typeof ELEMENT_CATEGORIES[keyof typeof ELEMENT_CATEGORIES];
export type ElementType = typeof ELEMENT_TYPES[keyof typeof ELEMENT_TYPES];
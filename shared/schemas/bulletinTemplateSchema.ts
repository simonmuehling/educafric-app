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
  // Propriétés de style
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  padding?: number;
  margin?: number;
  textAlign?: "left" | "center" | "right" | "justify";
  
  // Propriétés spécifiques au contenu
  label?: string;
  placeholder?: string;
  format?: string; // Format d'affichage (ex: pour les dates, nombres)
  showBorder?: boolean;
  showHeader?: boolean;
  
  // Propriétés conditionnelles
  visible?: boolean;
  conditional?: {
    field: string;
    operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains";
    value: any;
  };
  
  // Propriétés pour les tableaux
  columns?: Array<{
    field: string;
    label: string;
    width: number;
    align: "left" | "center" | "right";
  }>;
  
  // Propriétés pour les images
  imageUrl?: string;
  imageScale?: "fit" | "fill" | "stretch";
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
    fontSize: z.number().optional(),
    fontFamily: z.string().optional(),
    fontWeight: z.string().optional(),
    color: z.string().optional(),
    backgroundColor: z.string().optional(),
    borderColor: z.string().optional(),
    borderWidth: z.number().optional(),
    borderStyle: z.string().optional(),
    padding: z.number().optional(),
    margin: z.number().optional(),
    textAlign: z.enum(["left", "center", "right", "justify"]).optional(),
    label: z.string().optional(),
    placeholder: z.string().optional(),
    format: z.string().optional(),
    showBorder: z.boolean().optional(),
    showHeader: z.boolean().optional(),
    visible: z.boolean().optional(),
    conditional: z.object({
      field: z.string(),
      operator: z.enum(["equals", "not_equals", "greater_than", "less_than", "contains"]),
      value: z.any()
    }).optional(),
    columns: z.array(z.object({
      field: z.string(),
      label: z.string(),
      width: z.number(),
      align: z.enum(["left", "center", "right"])
    })).optional(),
    imageUrl: z.string().optional(),
    imageScale: z.enum(["fit", "fill", "stretch"]).optional()
  }),
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

// Constantes pour les catégories d'éléments
export const ELEMENT_CATEGORIES = {
  STUDENT_INFO: "student_info",
  GRADES: "grades", 
  ATTENDANCE: "attendance",
  SANCTIONS: "sanctions",
  CLASS_COUNCIL: "class_council",
  SIGNATURES: "signatures",
  TEXT: "text",
  IMAGES: "images",
  LAYOUT: "layout"
} as const;

// Types d'éléments prédéfinis
export const ELEMENT_TYPES = {
  // Informations élève
  STUDENT_NAME: "student_name",
  STUDENT_MATRICULE: "student_matricule",
  STUDENT_CLASS: "student_class",
  STUDENT_PHOTO: "student_photo",
  STUDENT_BIRTH_DATE: "student_birth_date",
  
  // Notes et moyennes
  SUBJECT_GRADES: "subject_grades",
  GENERAL_AVERAGE: "general_average",
  CLASS_RANK: "class_rank",
  PERFORMANCE_LEVEL: "performance_level",
  
  // Absences et retards
  UNJUSTIFIED_ABSENCES: "unjustified_absences",
  JUSTIFIED_ABSENCES: "justified_absences",
  LATENESS_COUNT: "lateness_count",
  DETENTION_HOURS: "detention_hours",
  
  // Sanctions disciplinaires
  CONDUCT_WARNING: "conduct_warning",
  CONDUCT_BLAME: "conduct_blame",
  EXCLUSION_DAYS: "exclusion_days",
  PERMANENT_EXCLUSION: "permanent_exclusion",
  
  // Conseil de classe
  CLASS_COUNCIL_DECISIONS: "class_council_decisions",
  CLASS_COUNCIL_MENTIONS: "class_council_mentions",
  ORIENTATION_RECOMMENDATIONS: "orientation_recommendations",
  
  // Signatures
  PARENT_SIGNATURE: "parent_signature",
  TEACHER_SIGNATURE: "teacher_signature",
  HEADMASTER_SIGNATURE: "headmaster_signature",
  
  // Zones de texte libre
  FREE_TEXT: "free_text",
  TEXT_LABEL: "text_label",
  
  // Images et logos
  SCHOOL_LOGO: "school_logo",
  BACKGROUND_IMAGE: "background_image",
  
  // Éléments de mise en page
  DIVIDER: "divider",
  SPACER: "spacer",
  BORDER: "border"
} as const;

export type ElementCategory = typeof ELEMENT_CATEGORIES[keyof typeof ELEMENT_CATEGORIES];
export type ElementType = typeof ELEMENT_TYPES[keyof typeof ELEMENT_TYPES];
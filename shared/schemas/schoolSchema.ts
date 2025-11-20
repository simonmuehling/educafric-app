// ===== SCHOOL SCHEMA MODULE =====
// Extracted from huge schema.ts to prevent crashes

import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb } from "drizzle-orm/pg-core";

export const schools = pgTable("schools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // public, private
  educationalType: text("educational_type").notNull().default('general'), // general, technical
  useCBAFormat: boolean("use_cba_format").default(false), // Enable CBA (Competency-Based Approach) bulletin format
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  logoUrl: text("logo_url"),
  academicYear: text("academic_year"),
  currentTerm: text("current_term"),
  termStartDate: timestamp("term_start_date"),
  termEndDate: timestamp("term_end_date"),
  settings: jsonb("settings"),
  
  // Additional school information
  website: text("website"),
  description: text("description"),
  establishedYear: integer("established_year"),
  principalName: text("principal_name"),
  studentCapacity: integer("student_capacity"),
  
  // Champs officiels du gouvernement camerounais pour documents
  regionaleMinisterielle: text("regionale_ministerielle"), // Ex: "Délégation Régionale du Centre"
  delegationDepartementale: text("delegation_departementale"), // Ex: "Délégation Départementale du Mfoundi"
  boitePostale: text("boite_postale"), // Ex: "B.P. 1234 Yaoundé"
  arrondissement: text("arrondissement"), // Ex: "Yaoundé 1er"
  
  geolocationEnabled: boolean("geolocation_enabled").default(false),
  pwaEnabled: boolean("pwa_enabled").default(true),
  whatsappEnabled: boolean("whatsapp_enabled").default(false),
  smsEnabled: boolean("sms_enabled").default(false),
  emailEnabled: boolean("email_enabled").default(true),
  
  // EDUCAFRIC number for school registration (format: EDU-CM-SC-###)
  // SC=School - Required for signup, managed by admin
  educafricNumber: text("educafric_number").unique(),
  
  // CRITICAL: Sandbox isolation flag - separates demo/test schools from production
  // TRUE = Sandbox/demo school with test data (IDs 1-6, 15)
  // FALSE/NULL = Real production school
  // ALL queries MUST filter by this flag to prevent data leakage
  isSandbox: boolean("is_sandbox").default(false).notNull(),
  
  // Offline Premium feature toggle (free for all schools, managed by Site Admin)
  // TRUE = School has unlimited offline access for all 12 modules
  // FALSE/NULL = School has standard online-only access
  offlinePremiumEnabled: boolean("offline_premium_enabled").default(false).notNull(),
  
  // Module visibility toggles (managed by Site Admin)
  // These control which modules appear in the Director Dashboard
  communicationsEnabled: boolean("communications_enabled").default(true).notNull(),
  educationalContentEnabled: boolean("educational_content_enabled").default(true).notNull(),
  delegateAdminsEnabled: boolean("delegate_admins_enabled").default(true).notNull(),
  canteenEnabled: boolean("canteen_enabled").default(true).notNull(),
  schoolBusEnabled: boolean("school_bus_enabled").default(true).notNull(),
  onlineClassesEnabled: boolean("online_classes_enabled").default(true).notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const schoolLevels = pgTable("school_levels", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull(),
  name: text("name").notNull(), // e.g., "Form 1", "6ème", "Year 7"
  nameFr: text("name_fr"), // French version
  nameEn: text("name_en"), // English version
  order: integer("order").notNull(), // Display order (1, 2, 3...)
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  level: text("level"), // Made nullable - schools can use custom naming schemes
  section: text("section"),
  maxStudents: integer("max_students"), // Alignement avec la vraie structure DB
  schoolId: integer("school_id").notNull(),
  teacherId: integer("teacher_id"),
  academicYearId: integer("academic_year_id").notNull(), // Alignement avec DB réelle
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  nameFr: text("name_fr").notNull(),
  nameEn: text("name_en").notNull(),
  code: text("code"),
  coefficient: decimal("coefficient"),
  schoolId: integer("school_id").notNull(),
  classId: integer("class_id"),
  subjectType: text("subject_type").default('general'), // 'general', 'scientific', 'literary', 'professional', or 'other' for technical schools (5 sections for bulletin)
  bulletinSection: text("bulletin_section") // For technical schools: manual mapping to 3 bulletin sections ('general', 'scientific', 'professional') - overrides subjectType for bulletin grouping
});
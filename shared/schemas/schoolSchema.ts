// ===== SCHOOL SCHEMA MODULE =====
// Extracted from huge schema.ts to prevent crashes

import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb } from "drizzle-orm/pg-core";

export const schools = pgTable("schools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // public, private, enterprise
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  logoUrl: text("logo_url"),
  subscriptionStatus: text("subscription_status").default("inactive"),
  subscriptionPlan: text("subscription_plan"),
  maxStudents: integer("max_students"),
  maxTeachers: integer("max_teachers"),
  academicYear: text("academic_year"),
  currentTerm: text("current_term"),
  termStartDate: timestamp("term_start_date"),
  termEndDate: timestamp("term_end_date"),
  settings: jsonb("settings"),
  
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
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  level: text("level").notNull(),
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
  schoolId: integer("school_id").notNull()
});
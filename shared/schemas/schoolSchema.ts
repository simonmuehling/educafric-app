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
  geolocationEnabled: boolean("geolocation_enabled").default(false),
  pwaEnabled: boolean("pwa_enabled").default(true),
  whatsappEnabled: boolean("whatsapp_enabled").default(false),
  smsEnabled: boolean("sms_enabled").default(false),
  emailEnabled: boolean("email_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  level: text("level").notNull(),
  section: text("section"),
  capacity: integer("capacity"),
  schoolId: integer("school_id").notNull(),
  teacherId: integer("teacher_id"),
  academicYear: text("academic_year"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code"),
  description: text("description"),
  schoolId: integer("school_id").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
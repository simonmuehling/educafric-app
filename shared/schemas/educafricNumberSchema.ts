// ===== EDUCAFRIC NUMBER SCHEMA MODULE =====
// Manages EDUCAFRIC number generation and tracking for all user types

import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";

// EDUCAFRIC Numbers management table
// Tracks generated numbers and manages auto-increment counters
export const educafricNumbers = pgTable("educafric_numbers", {
  id: serial("id").primaryKey(),
  educafricNumber: text("educafric_number").notNull().unique(), // Format: EDU-CM-XX-###
  type: text("type").notNull(), // SC=School, TE=Teacher, ST=Student, PA=Parent
  entityType: text("entity_type").notNull(), // school, user
  entityId: integer("entity_id"), // ID of school or user this number is assigned to
  status: text("status").notNull().default("active"), // active, inactive, revoked
  issuedBy: integer("issued_by"), // Admin user ID who issued (for schools)
  notes: text("notes"), // Additional notes about the number
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Counter table to track the next available number for each type
export const educafricNumberCounters = pgTable("educafric_number_counters", {
  id: serial("id").primaryKey(),
  type: text("type").notNull().unique(), // SC, TE, ST, PA
  currentCounter: integer("current_counter").notNull().default(0), // Current counter value
  lastGenerated: text("last_generated"), // Last generated number (EDU-CM-XX-###)
  updatedAt: timestamp("updated_at").defaultNow()
});

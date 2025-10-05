// ===== SANCTIONS SCHEMA MODULE =====
// Schema for disciplinary sanctions management

import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const sanctions = pgTable("sanctions", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  schoolId: integer("school_id").notNull(),
  classId: integer("class_id").notNull(),
  sanctionType: text("sanction_type").notNull(), // 'conduct_warning', 'conduct_blame', 'exclusion_temporary', 'exclusion_permanent'
  date: date("date").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull().default('medium'), // 'low', 'medium', 'high', 'critical'
  duration: integer("duration"), // Duration in days for exclusions, null for warnings/blames
  startDate: date("start_date"), // Start date for exclusions
  endDate: date("end_date"), // End date for exclusions
  isActive: boolean("is_active").default(true),
  issueBy: integer("issued_by").notNull(), // Teacher/Director who issued the sanction
  reviewedBy: integer("reviewed_by"), // Person who reviewed/approved the sanction
  status: text("status").notNull().default('active'), // 'active', 'appealed', 'revoked', 'expired'
  appealReason: text("appeal_reason"), // Reason for appeal if status is 'appealed'
  appealDate: timestamp("appeal_date"), // Date of appeal
  revokedDate: timestamp("revoked_date"), // Date when sanction was revoked
  revokedBy: integer("revoked_by"), // Person who revoked the sanction
  revokedReason: text("revoked_reason"), // Reason for revoking
  academicYear: text("academic_year").notNull(),
  term: text("term").notNull(),
  metadata: jsonb("metadata"), // Additional data specific to sanction type
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Create insert schema with validation
export const insertSanctionSchema = createInsertSchema(sanctions, {
  studentId: z.number().min(1, "Student ID is required"),
  schoolId: z.number().min(1, "School ID is required"), 
  classId: z.number().min(1, "Class ID is required"),
  sanctionType: z.enum(['conduct_warning', 'conduct_blame', 'exclusion_temporary', 'exclusion_permanent'], {
    errorMap: () => ({ message: "Invalid sanction type" })
  }),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format"
  }),
  description: z.string().min(1, "Description is required").max(500, "Description too long"),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  duration: z.number().min(1).max(365).optional().nullable(),
  startDate: z.string().refine((date) => !date || !isNaN(Date.parse(date)), {
    message: "Invalid start date format"
  }).optional().nullable(),
  endDate: z.string().refine((date) => !date || !isNaN(Date.parse(date)), {
    message: "Invalid end date format"
  }).optional().nullable(),
  issueBy: z.number().min(1, "Issuer is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  term: z.string().min(1, "Term is required"),
  status: z.enum(['active', 'appealed', 'revoked', 'expired']).default('active')
}).omit({ id: true, createdAt: true, updatedAt: true });

// Create select schema
export const selectSanctionSchema = createSelectSchema(sanctions);

// Create form schema for frontend validation with extended rules
export const sanctionFormSchema = insertSanctionSchema.extend({
  // Additional frontend validation rules
  date: z.string().refine((date) => {
    const sanctionDate = new Date(date);
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    return sanctionDate <= today && sanctionDate >= oneYearAgo;
  }, {
    message: "Sanction date must be within the last year and not in the future"
  }),
  
  // Conditional validation for exclusions
  duration: z.number().optional().refine((duration, ctx) => {
    const sanctionType = ctx.parent.sanctionType;
    if ((sanctionType === 'exclusion_temporary') && (!duration || duration < 1)) {
      return false;
    }
    return true;
  }, {
    message: "Duration is required for temporary exclusions and must be at least 1 day"
  }),
  
  // Ensure start and end dates are provided for exclusions
  startDate: z.string().optional().refine((startDate, ctx) => {
    const sanctionType = ctx.parent.sanctionType;
    if ((sanctionType === 'exclusion_temporary' || sanctionType === 'exclusion_permanent') && !startDate) {
      return false;
    }
    return true;
  }, {
    message: "Start date is required for exclusions"
  })
});

// Type definitions
export type InsertSanction = z.infer<typeof insertSanctionSchema>;
export type SelectSanction = typeof sanctions.$inferSelect;
export type SanctionForm = z.infer<typeof sanctionFormSchema>;

// Enum for sanction types for TypeScript
export const SANCTION_TYPES = {
  CONDUCT_WARNING: 'conduct_warning',
  CONDUCT_BLAME: 'conduct_blame', 
  EXCLUSION_TEMPORARY: 'exclusion_temporary',
  EXCLUSION_PERMANENT: 'exclusion_permanent'
} as const;

export const SANCTION_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high', 
  CRITICAL: 'critical'
} as const;

export const SANCTION_STATUS = {
  ACTIVE: 'active',
  APPEALED: 'appealed',
  REVOKED: 'revoked',
  EXPIRED: 'expired'
} as const;
import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tutorial progress tracking table
export const tutorialProgress = pgTable("tutorial_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tutorialVersion: text("tutorial_version").notNull().default("1.0"),
  isCompleted: boolean("is_completed").default(false),
  currentStep: integer("current_step").default(0),
  totalSteps: integer("total_steps").default(0),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  skippedAt: timestamp("skipped_at"),
  userRole: text("user_role").notNull(),
  deviceType: text("device_type"), // mobile, desktop, tablet
  completionMethod: text("completion_method"), // completed, skipped, timeout
  sessionData: text("session_data"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tutorial step completion tracking
export const tutorialSteps = pgTable("tutorial_steps", {
  id: serial("id").primaryKey(),
  progressId: integer("progress_id").notNull(),
  stepNumber: integer("step_number").notNull(),
  stepId: text("step_id").notNull(), // welcome, navigation, features, etc.
  isCompleted: boolean("is_completed").default(false),
  timeSpent: integer("time_spent_seconds"), // Time spent on this step
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for validation
export const insertTutorialProgressSchema = createInsertSchema(tutorialProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTutorialStepSchema = createInsertSchema(tutorialSteps).omit({
  id: true,
  createdAt: true,
});

// Types
export type TutorialProgress = typeof tutorialProgress.$inferSelect;
export type InsertTutorialProgress = z.infer<typeof insertTutorialProgressSchema>;
export type TutorialStep = typeof tutorialSteps.$inferSelect;
export type InsertTutorialStep = z.infer<typeof insertTutorialStepSchema>;

// API request/response types
export interface TutorialStatusRequest {
  userId: number;
  userRole: string;
  tutorialVersion?: string;
}

export interface TutorialStatusResponse {
  hasCompleted: boolean;
  currentStep: number;
  totalSteps: number;
  lastAccessed: string | null;
  canRestart: boolean;
}

export interface UpdateTutorialProgressRequest {
  userId: number;
  currentStep: number;
  totalSteps: number;
  userRole: string;
  deviceType?: string;
  sessionData?: object;
}

export interface CompleteTutorialRequest {
  userId: number;
  userRole: string;
  completionMethod: 'completed' | 'skipped' | 'timeout';
  finalStep: number;
  totalSteps: number;
  deviceType?: string;
  sessionData?: object;
}
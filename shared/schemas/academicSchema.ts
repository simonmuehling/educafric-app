// ===== ACADEMIC SCHEMA MODULE =====
// Extracted from huge schema.ts to prevent crashes

import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb } from "drizzle-orm/pg-core";

export const grades = pgTable("grades", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  classId: integer("class_id").notNull(),
  schoolId: integer("school_id").notNull(),
  score: decimal("score", { precision: 5, scale: 2 }),
  maxScore: decimal("max_score", { precision: 5, scale: 2 }),
  gradeType: text("grade_type"), // assignment, test, exam, project
  term: text("term"),
  academicYear: text("academic_year"),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  classId: integer("class_id").notNull(),
  schoolId: integer("school_id").notNull(),
  date: timestamp("date").notNull(),
  status: text("status").notNull(), // present, absent, late, excused
  timeIn: timestamp("time_in"),
  timeOut: timestamp("time_out"),
  notes: text("notes"),
  markedBy: integer("marked_by"), // Teacher who marked attendance
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const homework = pgTable("homework", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  teacherId: integer("teacher_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  classId: integer("class_id").notNull(),
  schoolId: integer("school_id").notNull(),
  dueDate: timestamp("due_date"),
  assignedDate: timestamp("assigned_date").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const homeworkSubmissions = pgTable("homework_submissions", {
  id: serial("id").primaryKey(),
  homeworkId: integer("homework_id").notNull(),
  studentId: integer("student_id").notNull(),
  submissionText: text("submission_text"),
  attachmentUrl: text("attachment_url"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  score: decimal("score", { precision: 5, scale: 2 }),
  feedback: text("feedback"),
  gradeBy: integer("grade_by"), // Teacher who graded
  gradedAt: timestamp("graded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
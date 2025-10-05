// ===== ACADEMIC SCHEMA MODULE =====
// Extracted from huge schema.ts to prevent crashes

import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb, unique } from "drizzle-orm/pg-core";

export const grades = pgTable("grades", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  classId: integer("class_id").notNull(),
  schoolId: integer("school_id").notNull(),
  grade: decimal("grade", { precision: 5, scale: 2 }), // FIXED: Rename score to grade
  coefficient: integer("coefficient").default(1),
  examType: text("exam_type").default("evaluation"), // FIXED: Rename gradeType to examType
  term: text("term").notNull(), // Made required for bulletins
  academicYear: text("academic_year").notNull(), // Made required for bulletins
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  // FIXED: Unique constraint WITHOUT examType to match validation logic
  uniqueGradePerStudentSubjectTerm: unique("unique_grade_student_subject_term_core").on(
    table.studentId, 
    table.subjectId, 
    table.term, 
    table.academicYear
  )
}));

// Academic Configuration table for school settings
export const academicConfiguration = pgTable("academic_configuration", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull(),
  academicYear: jsonb("academic_year").notNull(), // {startYear: 2024, endYear: 2025, name: "2024-2025"}
  terms: jsonb("terms").notNull(), // [{id: 1, name: "Premier Trimestre", startDate: "...", endDate: "..."}]
  gradingScale: jsonb("grading_scale"), // {minGrade: 0, maxGrade: 20, passingGrade: 10}
  schoolCalendar: jsonb("school_calendar"), // {vacationDays: [], holidays: []}
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: integer("updated_by") // User who last updated
}, (table) => ({
  uniqueConfigPerSchool: unique("unique_config_per_school").on(table.schoolId)
}));

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
  instructions: text("instructions"), // Detailed instructions for students
  teacherId: integer("teacher_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  classId: integer("class_id").notNull(),
  schoolId: integer("school_id").notNull(),
  priority: text("priority").default("medium"), // low, medium, high
  dueDate: timestamp("due_date"),
  assignedDate: timestamp("assigned_date").defaultNow(),
  status: text("status").default("active"), // active, archived, draft
  archivedAt: timestamp("archived_at"), // When archived
  archivedBy: integer("archived_by"), // Who archived
  notifyChannels: jsonb("notify_channels"), // {email: true, sms: false, whatsapp: true}
  isActive: boolean("is_active").default(true), // Keep for compatibility
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const homeworkSubmissions = pgTable("homework_submissions", {
  id: serial("id").primaryKey(),
  homeworkId: integer("homework_id").notNull(),
  studentId: integer("student_id").notNull(),
  submissionText: text("submission_text"),
  attachmentUrl: text("attachment_url"), // Legacy single file support
  attachmentUrls: jsonb("attachment_urls"), // New multiple files support
  submissionSource: text("submission_source").default("web"), // web, mobile, etc.
  status: text("status").default("pending"), // pending, submitted, graded, returned
  submittedAt: timestamp("submitted_at").defaultNow(),
  score: decimal("score", { precision: 5, scale: 2 }),
  feedback: text("feedback"),
  gradeBy: integer("grade_by"), // Teacher who graded
  gradedAt: timestamp("graded_at"),
  parentNotified: boolean("parent_notified").default(false), // Track parent notification
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
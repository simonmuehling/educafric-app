// ===== CLASS ENROLLMENT SCHEMA =====
// Critical security infrastructure for proper RBAC student-class assignment

import { pgTable, serial, integer, text, boolean, timestamp, unique } from "drizzle-orm/pg-core";

// Class enrollment table - tracks which students are enrolled in which classes
export const classEnrollments = pgTable("class_enrollments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  classId: integer("class_id").notNull(),
  schoolId: integer("school_id").notNull(),
  academicYear: text("academic_year").notNull(),
  enrollmentDate: timestamp("enrollment_date").defaultNow(),
  status: text("status").notNull().default("active"), // active, transferred, graduated, withdrawn
  
  // Administrative metadata
  enrolledBy: integer("enrolled_by"), // User who enrolled the student
  transferredFrom: integer("transferred_from"), // Previous class if transferred
  transferredTo: integer("transferred_to"), // New class if transferred
  withdrawalReason: text("withdrawal_reason"), // Reason if withdrawn
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  // Ensure each student can only be enrolled in one class per academic year
  uniqueStudentClassYear: unique("unique_student_class_year").on(
    table.studentId, 
    table.academicYear,
    table.status
  )
}));

export type ClassEnrollment = typeof classEnrollments.$inferSelect;
export type InsertClassEnrollment = typeof classEnrollments.$inferInsert;
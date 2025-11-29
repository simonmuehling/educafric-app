// ===== STUDENT STORAGE MODULE =====
// Extracted from huge storage.ts to prevent crashes

import { db } from "../db";
import { users, grades, attendance, classes, homework, homeworkSubmissions, enrollments } from "../../shared/schema";
import { eq, desc, and, asc } from "drizzle-orm";
import type { IStudentStorage } from "./interfaces";

export class StudentStorage implements IStudentStorage {
  async createStudentRecord(student: any): Promise<any> {
    try {
      const [newStudent] = await db.insert(users).values(student).returning();
      return newStudent;
    } catch (error) {
      throw new Error(`Failed to create student: ${error}`);
    }
  }

  async getStudent(id: number): Promise<any | null> {
    try {
      const [student] = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return student || null;
    } catch (error) {
      return null;
    }
  }

  async updateStudentRecord(id: number, updates: any): Promise<any> {
    try {
      const [updatedStudent] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
      return updatedStudent;
    } catch (error) {
      throw new Error(`Failed to update student: ${error}`);
    }
  }

  async getStudentGrades(studentId: number): Promise<any[]> {
    try {
      return await db.select().from(grades).where(eq(grades.studentId, studentId));
    } catch (error) {
      return [];
    }
  }

  async getStudentAttendance(studentId: number): Promise<any[]> {
    try {
      return await db.select().from(attendance).where(eq(attendance.studentId, studentId));
    } catch (error) {
      return [];
    }
  }

  async getStudentClasses(studentId: number): Promise<any[]> {
    try {
      const studentClasses = await db
        .select({
          id: classes.id,
          name: classes.name,
          level: classes.level,
          section: classes.section
        })
        .from(classes)
        .innerJoin(users, eq(users.schoolId, classes.schoolId))
        .where(eq(users.id, studentId));
      return studentClasses;
    } catch (error) {
      return [];
    }
  }

  async getStudentAssignments(studentId: number): Promise<any[]> {
    try {
      const assignments = await db
        .select()
        .from(homework)
        .innerJoin(homeworkSubmissions, eq(homework.id, homeworkSubmissions.homeworkId))
        .where(eq(homeworkSubmissions.studentId, studentId))
        .orderBy(desc(homework.dueDate));
      return assignments;
    } catch (error) {
      return [];
    }
  }

  // Missing methods needed by student routes
  async getStudentsBySchool(schoolId: number): Promise<any[]> {
    try {
      console.log('[STUDENT_STORAGE] Getting students for school:', schoolId);
      
      // Get all students (users with role Student) for this school
      const students = await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone,
        schoolId: users.schoolId,
        role: users.role,
        createdAt: users.createdAt
      })
      .from(users)
      .where(
        and(
          eq(users.schoolId, schoolId),
          eq(users.role, 'Student')
        )
      );
      
      console.log(`[STUDENT_STORAGE] ✅ Found ${students.length} students for school ${schoolId}`);
      
      // Format student data with full name
      return students.map(student => ({
        ...student,
        name: `${student.firstName} ${student.lastName}`
      }));
    } catch (error) {
      console.error('[STUDENT_STORAGE] ❌ Error getting students by school:', schoolId, error);
      throw error;
    }
  }

  async getStudentsByClass(classId: number): Promise<any[]> {
    try {
      console.log('[STUDENT_STORAGE] Getting students for class:', classId);
      
      // Use enrollments table to find all students enrolled in this class
      const enrolledStudents = await db.select({
        studentId: enrollments.studentId,
        enrollmentDate: enrollments.enrollmentDate,
        status: enrollments.status,
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone,
        role: users.role
      })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.studentId, users.id))
      .where(
        and(
          eq(enrollments.classId, classId),
          eq(enrollments.status, 'active')
        )
      )
      .orderBy(asc(users.lastName), asc(users.firstName));
      
      console.log(`[STUDENT_STORAGE] ✅ Found ${enrolledStudents.length} students in class ${classId}`);
      
      // Format student data with proper ordering
      return enrolledStudents.map(enrollment => ({
        id: enrollment.id,
        firstName: enrollment.firstName,
        lastName: enrollment.lastName,
        name: `${enrollment.firstName} ${enrollment.lastName}`,
        email: enrollment.email,
        phone: enrollment.phone,
        role: enrollment.role,
        enrollmentDate: enrollment.enrollmentDate,
        status: enrollment.status
      }));
    } catch (error) {
      console.error('[STUDENT_STORAGE] Error getting students by class:', error);
      throw error;
    }
  }
}
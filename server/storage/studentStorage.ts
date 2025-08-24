// ===== STUDENT STORAGE MODULE =====
// Extracted from huge storage.ts to prevent crashes

import { db } from "../db";
import { users, grades, attendance, classes, homework, homeworkSubmissions } from "../../shared/schema";
import { eq, desc } from "drizzle-orm";
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
}
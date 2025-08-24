// ===== GRADE STORAGE MODULE =====
// Extracted from huge storage.ts to prevent crashes

import { db } from "../db";
import { grades, attendance, homework, homeworkSubmissions } from "../../shared/schema";
import { eq, desc } from "drizzle-orm";
import type { IGradeStorage } from "./interfaces";

export class GradeStorage implements IGradeStorage {
  async getGradesBySchool(schoolId: number): Promise<any[]> {
    try {
      return await db.select().from(grades);
    } catch (error) {
      return [];
    }
  }

  async getGradesByClass(classId: number): Promise<any[]> {
    try {
      return await db.select().from(grades).where(eq(grades.classId, classId));
    } catch (error) {
      return [];
    }
  }

  async getGradesBySubject(subjectId: number): Promise<any[]> {
    try {
      return await db.select().from(grades).where(eq(grades.subjectId, subjectId));
    } catch (error) {
      return [];
    }
  }

  async getGrade(gradeId: number): Promise<any | null> {
    try {
      const [grade] = await db.select().from(grades).where(eq(grades.id, gradeId)).limit(1);
      return grade || null;
    } catch (error) {
      return null;
    }
  }

  async createGrade(gradeData: any): Promise<any> {
    try {
      const [grade] = await db.insert(grades).values(gradeData).returning();
      return grade;
    } catch (error) {
      throw new Error(`Failed to create grade: ${error}`);
    }
  }

  async updateGrade(gradeId: number, updates: any): Promise<any> {
    try {
      const [updatedGrade] = await db.update(grades).set(updates).where(eq(grades.id, gradeId)).returning();
      return updatedGrade;
    } catch (error) {
      throw new Error(`Failed to update grade: ${error}`);
    }
  }

  async deleteGrade(gradeId: number): Promise<void> {
    try {
      await db.delete(grades).where(eq(grades.id, gradeId));
    } catch (error) {
      throw new Error(`Failed to delete grade: ${error}`);
    }
  }

  async recordGrade(data: any): Promise<any> {
    try {
      const [grade] = await db.insert(grades).values(data).returning();
      return grade;
    } catch (error) {
      throw new Error(`Failed to record grade: ${error}`);
    }
  }
}
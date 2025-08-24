// ===== SCHOOL STORAGE MODULE =====
// Extracted from huge storage.ts to prevent crashes

import { db } from "../db";
import { schools, classes, users } from "../../shared/schema";
import { eq } from "drizzle-orm";
import type { ISchoolStorage } from "./interfaces";

export class SchoolStorage implements ISchoolStorage {
  async createSchool(school: any): Promise<any> {
    try {
      const [newSchool] = await db.insert(schools).values(school).returning();
      return newSchool;
    } catch (error) {
      throw new Error(`Failed to create school: ${error}`);
    }
  }

  async getSchool(id: number): Promise<any | null> {
    try {
      const [school] = await db.select().from(schools).where(eq(schools.id, id)).limit(1);
      return school || null;
    } catch (error) {
      return null;
    }
  }

  async updateSchool(id: number, updates: any): Promise<any> {
    try {
      const [updatedSchool] = await db.update(schools).set(updates).where(eq(schools.id, id)).returning();
      return updatedSchool;
    } catch (error) {
      throw new Error(`Failed to update school: ${error}`);
    }
  }

  async getUserSchools(userId: number): Promise<any[]> {
    try {
      const userSchools = await db.select({
        id: schools.id,
        name: schools.name,
        type: schools.type,
        address: schools.address
      }).from(schools)
        .innerJoin(users, eq(users.schoolId, schools.id))
        .where(eq(users.id, userId));
      return userSchools;
    } catch (error) {
      return [];
    }
  }

  async getSchoolClasses(schoolId: number): Promise<any[]> {
    try {
      return await db.select().from(classes).where(eq(classes.schoolId, schoolId));
    } catch (error) {
      return [];
    }
  }

  async getSchoolTeachers(schoolId: number): Promise<any[]> {
    try {
      return await db.select().from(users).where(eq(users.schoolId, schoolId));
    } catch (error) {
      return [];
    }
  }
}
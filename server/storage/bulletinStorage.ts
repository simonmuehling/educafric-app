import { db } from "../db";
import { bulletins, users, classes } from "../../shared/schema";
import { eq, and } from "drizzle-orm";
import { IBulletinStorage } from './interfaces';

export class BulletinStorage implements IBulletinStorage {
  
  async getBulletin(id: number): Promise<any | null> {
    try {
      console.log(`[BULLETIN_STORAGE] Getting bulletin with ID: ${id}`);
      
      const [bulletin] = await db.select()
        .from(bulletins)
        .where(eq(bulletins.id, id))
        .limit(1);
      
      if (!bulletin) {
        console.log(`[BULLETIN_STORAGE] Bulletin ${id} not found`);
        return null;
      }
      
      console.log(`[BULLETIN_STORAGE] ✅ Bulletin ${id} retrieved successfully`);
      return bulletin;
    } catch (error) {
      console.error('[BULLETIN_STORAGE] Error getting bulletin:', error);
      throw error;
    }
  }

  async createBulletin(bulletin: any): Promise<any> {
    try {
      console.log(`[BULLETIN_STORAGE] Creating new bulletin for student:`, bulletin.studentId);
      
      const [newBulletin] = await db.insert(bulletins)
        .values(bulletin)
        .returning();
      
      console.log(`[BULLETIN_STORAGE] ✅ Bulletin created successfully:`, newBulletin.id);
      return newBulletin;
    } catch (error) {
      console.error('[BULLETIN_STORAGE] Error creating bulletin:', error);
      throw error;
    }
  }

  async updateBulletin(id: number, updates: any): Promise<any> {
    try {
      console.log(`[BULLETIN_STORAGE] Updating bulletin ${id}`);
      
      const [updatedBulletin] = await db.update(bulletins)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(bulletins.id, id))
        .returning();
      
      if (!updatedBulletin) {
        throw new Error(`Bulletin with ID ${id} not found`);
      }
      
      console.log(`[BULLETIN_STORAGE] ✅ Bulletin ${id} updated successfully`);
      return updatedBulletin;
    } catch (error) {
      console.error('[BULLETIN_STORAGE] Error updating bulletin:', error);
      throw error;
    }
  }

  async getBulletinsByStudent(studentId: number): Promise<any[]> {
    try {
      console.log(`[BULLETIN_STORAGE] Getting bulletins for student:`, studentId);
      
      const studentBulletins = await db.select()
        .from(bulletins)
        .where(eq(bulletins.studentId, studentId));
      
      console.log(`[BULLETIN_STORAGE] ✅ Found ${studentBulletins.length} bulletins for student ${studentId}`);
      return studentBulletins;
    } catch (error) {
      console.error('[BULLETIN_STORAGE] Error getting bulletins by student:', error);
      throw error;
    }
  }

  async getBulletinsByClass(classId: number): Promise<any[]> {
    try {
      console.log(`[BULLETIN_STORAGE] Getting bulletins for class:`, classId);
      
      const classBulletins = await db.select({
        id: bulletins.id,
        studentId: bulletins.studentId,
        classId: bulletins.classId,
        term: bulletins.term,
        academicYear: bulletins.academicYear,
        generalAverage: bulletins.generalAverage,
        status: bulletins.status,
        studentFirstName: users.firstName,
        studentLastName: users.lastName
      })
      .from(bulletins)
      .leftJoin(users, eq(bulletins.studentId, users.id))
      .where(eq(bulletins.classId, classId));
      
      // Format response with student name
      const formatted = classBulletins.map(b => ({
        id: b.id,
        classId: b.classId,
        studentId: b.studentId,
        studentName: b.studentFirstName && b.studentLastName 
          ? `${b.studentFirstName} ${b.studentLastName}` 
          : 'Unknown',
        term: b.term,
        academicYear: b.academicYear,
        generalAverage: b.generalAverage,
        status: b.status
      }));
      
      console.log(`[BULLETIN_STORAGE] ✅ Found ${formatted.length} bulletins for class ${classId}`);
      return formatted;
    } catch (error) {
      console.error('[BULLETIN_STORAGE] Error getting bulletins by class:', error);
      throw error;
    }
  }

  async getBulletinsBySchool(schoolId: number): Promise<any[]> {
    try {
      console.log(`[BULLETIN_STORAGE] Getting bulletins for school:`, schoolId);
      
      const schoolBulletins = await db.select({
        bulletinId: bulletins.id,
        studentId: bulletins.studentId,
        classId: bulletins.classId,
        term: bulletins.term,
        academicYear: bulletins.academicYear,
        generalAverage: bulletins.generalAverage,
        status: bulletins.status,
        studentFirstName: users.firstName,
        studentLastName: users.lastName,
        className: classes.name,
        schoolId: bulletins.schoolId
      })
      .from(bulletins)
      .leftJoin(users, eq(bulletins.studentId, users.id))
      .leftJoin(classes, eq(bulletins.classId, classes.id))
      .where(eq(bulletins.schoolId, schoolId));
      
      // Format response
      const formatted = schoolBulletins.map(b => ({
        id: b.bulletinId,
        schoolId: b.schoolId,
        classId: b.classId,
        className: b.className || 'Unknown',
        studentId: b.studentId,
        studentName: b.studentFirstName && b.studentLastName 
          ? `${b.studentFirstName} ${b.studentLastName}` 
          : 'Unknown',
        term: b.term,
        academicYear: b.academicYear,
        generalAverage: b.generalAverage,
        status: b.status
      }));
      
      console.log(`[BULLETIN_STORAGE] ✅ Found ${formatted.length} bulletins for school ${schoolId}`);
      return formatted;
    } catch (error) {
      console.error('[BULLETIN_STORAGE] Error getting bulletins by school:', error);
      throw error;
    }
  }
}

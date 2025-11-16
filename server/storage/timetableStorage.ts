import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { parentStudentRelations, timetables, users, classes, classEnrollments } from "../../shared/schema";

export class TimetableStorage {
  
  // Verify parent-child relationship before accessing timetable
  async verifyParentChildRelation(parentId: number, studentId: number): Promise<boolean> {
    try {
      console.log(`[TIMETABLE_SECURITY] Verifying parent ${parentId} access to student ${studentId}`);
      
      // Query the database for parent-student relationship
      const relation = await db.select()
        .from(parentStudentRelations)
        .where(
          and(
            eq(parentStudentRelations.parentId, parentId),
            eq(parentStudentRelations.studentId, studentId)
          )
        )
        .limit(1);
      
      if (relation && relation.length > 0) {
        console.log(`[TIMETABLE_SECURITY] ✅ Access granted for parent ${parentId} to their child ${studentId}`);
        return true;
      }
      
      console.log(`[TIMETABLE_SECURITY] ❌ Access denied for parent ${parentId} to student ${studentId}`);
      return false;
    } catch (error) {
      console.error('[TIMETABLE_SECURITY] Error verifying parent-child relation:', error);
      return false;
    }
  }
  
  // Get timetable for a specific student (with parent verification)
  async getStudentTimetableForParent(parentId: number, studentId: number) {
    try {
      // First verify the parent has access to this child
      const hasAccess = await this.verifyParentChildRelation(parentId, studentId);
      if (!hasAccess) {
        console.log(`[TIMETABLE_SECURITY] ❌ Parent ${parentId} denied access to student ${studentId} timetable`);
        return null;
      }
      
      console.log(`[TIMETABLE_SECURITY] ✅ Parent ${parentId} granted access to student ${studentId} timetable`);
      return this.getStudentTimetable(studentId);
    } catch (error) {
      console.error('[TIMETABLE_STORAGE] Error getting student timetable for parent:', error);
      return null;
    }
  }

  // Get timetable for a specific student
  async getStudentTimetable(studentId: number) {
    try {
      console.log('[TIMETABLE_STORAGE] Getting timetable for student:', studentId);
      
      // First, find the student's current class enrollment
      const enrollment = await db.select()
        .from(classEnrollments)
        .where(
          and(
            eq(classEnrollments.studentId, studentId),
            eq(classEnrollments.status, 'active')
          )
        )
        .limit(1);
      
      if (!enrollment || enrollment.length === 0) {
        console.log('[TIMETABLE_STORAGE] Student has no active class enrollment:', studentId);
        return [];
      }
      
      const studentClassId = enrollment[0].classId;
      if (!studentClassId) {
        console.log('[TIMETABLE_STORAGE] Student enrollment missing classId:', studentId);
        return [];
      }
      
      // Get timetable entries for the student's class
      const timetableEntries = await db.select({
        id: timetables.id,
        dayOfWeek: timetables.dayOfWeek,
        startTime: timetables.startTime,
        endTime: timetables.endTime,
        subjectName: timetables.subjectName,
        room: timetables.room,
        classId: timetables.classId,
        teacherId: timetables.teacherId,
        teacherFirstName: users.firstName,
        teacherLastName: users.lastName
      })
      .from(timetables)
      .leftJoin(users, eq(timetables.teacherId, users.id))
      .where(
        and(
          eq(timetables.classId, studentClassId),
          eq(timetables.isActive, true)
        )
      );
      
      // Format the response
      const formattedTimetable = timetableEntries.map(entry => ({
        id: entry.id,
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
        subjectName: entry.subjectName,
        teacherName: entry.teacherFirstName && entry.teacherLastName 
          ? `${entry.teacherFirstName} ${entry.teacherLastName}` 
          : 'TBA',
        room: entry.room || 'TBA',
        studentId: studentId,
        classId: entry.classId
      }));
      
      console.log(`[TIMETABLE_STORAGE] ✅ Found ${formattedTimetable.length} timetable entries for student ${studentId}`);
      return formattedTimetable;
    } catch (error) {
      console.error('[TIMETABLE_STORAGE] Error getting student timetable:', error);
      return [];
    }
  }

  // Get timetable for a specific class
  async getClassTimetable(classId: number) {
    try {
      console.log('[TIMETABLE_STORAGE] Getting timetable for class:', classId);
      
      // Get timetable entries for the class
      const timetableEntries = await db.select({
        id: timetables.id,
        dayOfWeek: timetables.dayOfWeek,
        startTime: timetables.startTime,
        endTime: timetables.endTime,
        subjectName: timetables.subjectName,
        room: timetables.room,
        classId: timetables.classId,
        teacherId: timetables.teacherId,
        teacherFirstName: users.firstName,
        teacherLastName: users.lastName
      })
      .from(timetables)
      .leftJoin(users, eq(timetables.teacherId, users.id))
      .where(
        and(
          eq(timetables.classId, classId),
          eq(timetables.isActive, true)
        )
      );
      
      // Format the response
      const formattedTimetable = timetableEntries.map(entry => ({
        id: entry.id,
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
        subjectName: entry.subjectName,
        teacherName: entry.teacherFirstName && entry.teacherLastName 
          ? `${entry.teacherFirstName} ${entry.teacherLastName}` 
          : 'TBA',
        room: entry.room || 'TBA',
        classId: entry.classId
      }));
      
      console.log(`[TIMETABLE_STORAGE] ✅ Found ${formattedTimetable.length} timetable entries for class ${classId}`);
      return formattedTimetable;
    } catch (error) {
      console.error('[TIMETABLE_STORAGE] Error getting class timetable:', error);
      return [];
    }
  }

  // Get timetable for a specific day
  async getDayTimetable(studentId: number, dayOfWeek: number) {
    try {
      const fullTimetable = await this.getStudentTimetable(studentId);
      return fullTimetable.filter(slot => slot.dayOfWeek === dayOfWeek);
    } catch (error) {
      console.error('[TIMETABLE_STORAGE] Error getting day timetable:', error);
      return [];
    }
  }

  // Get current/next class for a student
  async getCurrentClass(studentId: number) {
    try {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

      const dayTimetable = await this.getDayTimetable(studentId, currentDay);
      
      // Find current or next class
      const currentClass = dayTimetable.find(slot => 
        currentTime >= slot.startTime && currentTime <= slot.endTime
      );

      if (currentClass) {
        return { type: 'current', class: currentClass };
      }

      // Find next class
      const nextClass = dayTimetable.find(slot => currentTime < slot.startTime);
      if (nextClass) {
        return { type: 'next', class: nextClass };
      }

      return null;
    } catch (error) {
      console.error('[TIMETABLE_STORAGE] Error getting current class:', error);
      return null;
    }
  }

  // Create or update timetable slot
  async createTimetableSlot(slotData: any) {
    try {
      console.log('[TIMETABLE_STORAGE] Creating timetable slot:', slotData);
      
      const [newSlot] = await db.insert(timetables)
        .values(slotData)
        .returning();
      
      console.log('[TIMETABLE_STORAGE] ✅ Timetable slot created successfully:', newSlot.id);
      return newSlot;
    } catch (error) {
      console.error('[TIMETABLE_STORAGE] Error creating timetable slot:', error);
      throw error;
    }
  }

  // Update timetable slot
  async updateTimetableSlot(slotId: number, updates: any) {
    try {
      console.log('[TIMETABLE_STORAGE] Updating timetable slot:', slotId, updates);
      
      const [updatedSlot] = await db.update(timetables)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(timetables.id, slotId))
        .returning();
      
      console.log('[TIMETABLE_STORAGE] ✅ Timetable slot updated successfully');
      return updatedSlot;
    } catch (error) {
      console.error('[TIMETABLE_STORAGE] Error updating timetable slot:', error);
      throw error;
    }
  }

  // Delete timetable slot
  async deleteTimetableSlot(slotId: number) {
    try {
      console.log('[TIMETABLE_STORAGE] Deleting timetable slot:', slotId);
      
      await db.delete(timetables)
        .where(eq(timetables.id, slotId));
      
      console.log('[TIMETABLE_STORAGE] ✅ Timetable slot deleted successfully');
      return true;
    } catch (error) {
      console.error('[TIMETABLE_STORAGE] Error deleting timetable slot:', error);
      throw error;
    }
  }
}
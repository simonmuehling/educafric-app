import { db } from "../db";
import { classes, subjects } from "../../shared/schema";
import { eq, and } from "drizzle-orm";

export class ClassStorage {
  
  async createClass(classData: any) {
    try {
      console.log('[CLASS_STORAGE] Creating class:', classData.name);
      
      // Use transaction to ensure atomicity - either both class and subjects are created or neither
      const result = await db.transaction(async (tx) => {
        // Prepare class data for insert
        const classInsertData = {
          name: classData.name,
          level: classData.level || null,
          section: classData.section || null,
          maxStudents: classData.maxStudents || null,
          schoolId: classData.schoolId,
          teacherId: classData.teacherId || null,
          academicYearId: classData.academicYearId || 1,
          isActive: classData.isActive !== undefined ? classData.isActive : true
        };
        
        // Insert class and get the created record
        const [newClass] = await tx.insert(classes)
          .values(classInsertData)
          .returning();
        
        console.log('[CLASS_STORAGE] ✅ Class created successfully:', newClass.id);
        
        // If subjects are provided, create them linked to this class
        if (classData.subjects && Array.isArray(classData.subjects) && classData.subjects.length > 0) {
          console.log('[CLASS_STORAGE] Creating', classData.subjects.length, 'subjects for class');
          
          const subjectsToInsert = classData.subjects.map((subject: any) => {
            // Validate that subject has at least a name or nameFr or nameEn
            const providedName = subject.nameFr || subject.name || subject.nameEn;
            if (!providedName || !providedName.trim()) {
              throw new Error('Subject must have a name (nameFr, nameEn, or name field required)');
            }
            
            // Ensure both French and English names are populated (default to same value if one is missing)
            const nameFr = subject.nameFr || subject.name || subject.nameEn;
            const nameEn = subject.nameEn || subject.name || subject.nameFr;
            
            return {
              nameFr,
              nameEn,
              code: subject.code || null,
              coefficient: subject.coefficient?.toString() || '1',
              schoolId: classData.schoolId,
              classId: newClass.id,
              subjectType: subject.category || subject.subjectType || 'general',
              bulletinSection: subject.bulletinSection || null
            };
          });
          
          await tx.insert(subjects).values(subjectsToInsert);
          console.log('[CLASS_STORAGE] ✅ Subjects created successfully');
        }
        
        return newClass;
      });
      
      return result;
    } catch (error) {
      console.error('[CLASS_STORAGE] ❌ Error creating class:', error);
      throw error;
    }
  }
  
  async getClass(classId: number) {
    try {
      const [classRecord] = await db.select()
        .from(classes)
        .where(eq(classes.id, classId))
        .limit(1);
      
      return classRecord || null;
    } catch (error) {
      console.error('[CLASS_STORAGE] ❌ Error fetching class:', error);
      throw error;
    }
  }
  
  async getClassesBySchool(schoolId: number) {
    try {
      console.log('[CLASS_STORAGE] Fetching classes for school:', schoolId);
      
      const classRecords = await db.select()
        .from(classes)
        .where(eq(classes.schoolId, schoolId));
      
      console.log('[CLASS_STORAGE] ✅ Found', classRecords.length, 'classes');
      return classRecords;
    } catch (error) {
      console.error('[CLASS_STORAGE] ❌ Error fetching classes:', error);
      throw error;
    }
  }
  
  async updateClass(classId: number, updates: any) {
    try {
      console.log('[CLASS_STORAGE] Updating class:', classId, 'with data:', updates);
      
      // Prepare update data (remove undefined values, but allow null for clearing fields)
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.level !== undefined) updateData.level = updates.level;
      if (updates.section !== undefined) updateData.section = updates.section;
      if (updates.maxStudents !== undefined) updateData.maxStudents = updates.maxStudents;
      if (updates.teacherId !== undefined) updateData.teacherId = updates.teacherId;
      if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
      if (updates.room !== undefined) updateData.room = updates.room;
      if (updates.schedule !== undefined) updateData.schedule = updates.schedule;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.academicYearId !== undefined) updateData.academicYearId = updates.academicYearId;
      
      console.log('[CLASS_STORAGE] Prepared update data:', updateData);
      
      const [updatedClass] = await db.update(classes)
        .set(updateData)
        .where(eq(classes.id, classId))
        .returning();
      
      console.log('[CLASS_STORAGE] ✅ Class updated successfully:', updatedClass);
      return updatedClass;
    } catch (error) {
      console.error('[CLASS_STORAGE] ❌ Error updating class:', error);
      throw error;
    }
  }
  
  async deleteClass(classId: number) {
    try {
      console.log('[CLASS_STORAGE] Deleting class:', classId);
      
      // Use transaction to ensure atomicity - either both class and subjects are deleted or neither
      await db.transaction(async (tx) => {
        // First delete associated subjects
        await tx.delete(subjects)
          .where(eq(subjects.classId, classId));
        
        // Then delete the class
        await tx.delete(classes)
          .where(eq(classes.id, classId));
      });
      
      console.log('[CLASS_STORAGE] ✅ Class and associated subjects deleted successfully');
      return { success: true, deletedAt: new Date() };
    } catch (error) {
      console.error('[CLASS_STORAGE] ❌ Error deleting class:', error);
      throw error;
    }
  }
  
  async getSubjectsByClass(classId: number) {
    try {
      const subjectRecords = await db.select()
        .from(subjects)
        .where(eq(subjects.classId, classId));
      
      return subjectRecords;
    } catch (error) {
      console.error('[CLASS_STORAGE] ❌ Error fetching subjects:', error);
      throw error;
    }
  }
}

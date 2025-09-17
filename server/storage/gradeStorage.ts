// ===== GRADE STORAGE MODULE =====
// Extracted from huge storage.ts to prevent crashes

import { db } from "../db";
import { grades, attendance, homework, homeworkSubmissions } from "../../shared/schema";
import { eq, desc, and } from "drizzle-orm";
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

  // FIXED: Real implementation for duplicate prevention
  async getGradeByStudentSubjectTerm(studentId: number, subjectId: number, academicYear: string, term: string): Promise<any | null> {
    try {
      console.log('[GRADE_STORAGE] 🔍 Recherche note existante:', { studentId, subjectId, academicYear, term });
      
      const [existingGrade] = await db.select().from(grades)
        .where(
          and(
            eq(grades.studentId, studentId),
            eq(grades.subjectId, subjectId),
            eq(grades.academicYear, academicYear),
            eq(grades.term, term)
          )
        )
        .limit(1);
        
      if (existingGrade) {
        console.log('[GRADE_STORAGE] ⚠️ Note existante trouvée:', existingGrade.id);
        return existingGrade;
      }
      
      console.log('[GRADE_STORAGE] ✅ Aucune note existante');
      return null;
    } catch (error) {
      console.error('[GRADE_STORAGE] ❌ Erreur recherche note:', error);
      return null;
    }
  }

  async getStudentGradesWithFilters(studentId: number, filters?: any): Promise<any[]> {
    try {
      console.log('[GRADE_STORAGE] 📊 Récupération notes étudiant avec filtres:', { studentId, filters });
      
      let whereConditions = [eq(grades.studentId, studentId)];
      
      // Apply filters if provided
      if (filters?.academicYear) {
        whereConditions.push(eq(grades.academicYear, filters.academicYear));
      }
      
      if (filters?.term) {
        whereConditions.push(eq(grades.term, filters.term));
      }
      
      if (filters?.subjectId) {
        whereConditions.push(eq(grades.subjectId, filters.subjectId));
      }
      
      if (filters?.classId) {
        whereConditions.push(eq(grades.classId, filters.classId));
      }
      
      const query = db.select().from(grades).where(and(...whereConditions)).orderBy(desc(grades.createdAt));
      
      const results = await query;
      console.log(`[GRADE_STORAGE] ✅ ${results.length} notes trouvées`);
      return results;
    } catch (error) {
      console.error('[GRADE_STORAGE] ❌ Erreur récupération notes étudiant:', error);
      return [];
    }
  }

  // FIXED: Real implementation with filters
  async getGradesByClass(classId: number, filters?: any): Promise<any[]> {
    try {
      console.log('[GRADE_STORAGE] 📊 Récupération notes classe avec filtres:', { classId, filters });
      
      let whereConditions = [eq(grades.classId, classId)];
      
      // Apply filters if provided
      if (filters?.academicYear) {
        whereConditions.push(eq(grades.academicYear, filters.academicYear));
      }
      
      if (filters?.term) {
        whereConditions.push(eq(grades.term, filters.term));
      }
      
      if (filters?.subjectId) {
        whereConditions.push(eq(grades.subjectId, filters.subjectId));
      }
      
      if (filters?.studentId) {
        whereConditions.push(eq(grades.studentId, filters.studentId));
      }
      
      if (filters?.teacherId) {
        whereConditions.push(eq(grades.teacherId, filters.teacherId));
      }
      
      const query = db.select().from(grades).where(and(...whereConditions)).orderBy(desc(grades.createdAt));
      
      const results = await query;
      console.log(`[GRADE_STORAGE] ✅ ${results.length} notes trouvées pour classe ${classId}`);
      return results;
    } catch (error) {
      console.error('[GRADE_STORAGE] ❌ Erreur récupération notes classe:', error);
      return [];
    }
  }

  // FIXED: Complete batch insert with conflict handling (upsert)
  async createGradesBatch(gradesData: any[]): Promise<any[]> {
    try {
      console.log(`[GRADE_STORAGE] 📥 Import batch de ${gradesData.length} notes`);
      
      if (gradesData.length === 0) {
        console.log('[GRADE_STORAGE] ⚠️ Aucune donnée à importer');
        return [];
      }
      
      // UPSERT: Insert with conflict resolution on unique constraint
      const results = await db.insert(grades)
        .values(gradesData)
        .onConflictDoUpdate({
          target: [grades.studentId, grades.subjectId, grades.term, grades.academicYear],
          set: {
            grade: grades.grade, // Update existing grade
            coefficient: grades.coefficient,
            examType: grades.examType,
            comments: grades.comments,
            teacherId: grades.teacherId,
            updatedAt: new Date()
          }
        })
        .returning();
        
      console.log(`[GRADE_STORAGE] ✅ ${results.length} notes importées/mises à jour avec succès`);
      return results;
    } catch (error) {
      console.error('[GRADE_STORAGE] ❌ Erreur import batch:', error);
      
      // Fallback: Try individual inserts if batch fails
      console.log('[GRADE_STORAGE] 🔄 Tentative import individuel...');
      const successfulInserts: any[] = [];
      const failedInserts: any[] = [];
      
      for (const gradeData of gradesData) {
        try {
          const [result] = await db.insert(grades)
            .values(gradeData)
            .onConflictDoUpdate({
              target: [grades.studentId, grades.subjectId, grades.term, grades.academicYear],
              set: {
                grade: gradeData.grade,
                coefficient: gradeData.coefficient,
                examType: gradeData.examType,
                comments: gradeData.comments,
                teacherId: gradeData.teacherId,
                updatedAt: new Date()
              }
            })
            .returning();
          successfulInserts.push(result);
        } catch (individualError) {
          console.error(`[GRADE_STORAGE] ❌ Échec insert individuel:`, individualError);
          failedInserts.push({ gradeData, error: individualError });
        }
      }
      
      if (failedInserts.length > 0) {
        console.error(`[GRADE_STORAGE] ❌ ${failedInserts.length} notes ont échoué`);
        throw new Error(`Batch insert partially failed: ${successfulInserts.length} success, ${failedInserts.length} failed`);
      }
      
      return successfulInserts;
    }
  }

  // NEW: Get grades statistics for a class/term
  async getGradeStatistics(classId: number, academicYear: string, term?: string): Promise<any> {
    try {
      console.log('[GRADE_STORAGE] 📊 Calcul statistiques notes:', { classId, academicYear, term });
      
      let whereConditions = [eq(grades.classId, classId), eq(grades.academicYear, academicYear)];
      
      if (term) {
        whereConditions.push(eq(grades.term, term));
      }
      
      const allGrades = await db.select().from(grades).where(and(...whereConditions));
      
      const statistics = {
        totalGrades: allGrades.length,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 20,
        subjectStats: {} as any
      };
      
      if (allGrades.length > 0) {
        const numericScores = allGrades.map(g => parseFloat(g.grade || '0')).filter(s => !isNaN(s)); // FIXED: score -> grade
        
        if (numericScores.length > 0) {
          statistics.averageScore = numericScores.reduce((a, b) => a + b, 0) / numericScores.length;
          statistics.highestScore = Math.max(...numericScores);
          statistics.lowestScore = Math.min(...numericScores);
        }
        
        // Group by subject
        const subjectGroups = allGrades.reduce((acc, grade) => {
          const subjectId = grade.subjectId;
          if (!acc[subjectId]) acc[subjectId] = [];
          acc[subjectId].push(parseFloat(grade.grade || '0')); // FIXED: score -> grade
          return acc;
        }, {} as any);
        
        for (const [subjectId, scores] of Object.entries(subjectGroups)) {
          const validScores = (scores as number[]).filter(s => !isNaN(s));
          if (validScores.length > 0) {
            statistics.subjectStats[subjectId] = {
              count: validScores.length,
              average: validScores.reduce((a, b) => a + b, 0) / validScores.length,
              highest: Math.max(...validScores),
              lowest: Math.min(...validScores)
            };
          }
        }
      }
      
      console.log('[GRADE_STORAGE] ✅ Statistiques calculées:', statistics.totalGrades, 'notes');
      return statistics;
    } catch (error) {
      console.error('[GRADE_STORAGE] ❌ Erreur calcul statistiques:', error);
      throw new Error(`Failed to calculate grade statistics: ${error}`);
    }
  }
}
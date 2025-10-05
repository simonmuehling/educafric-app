// ===== ACADEMIC STORAGE MODULE =====
// New module for academic configuration (terms, years, etc.)

import { db } from "../db";
import { academicConfiguration } from "../../shared/schema";
import { homework, homeworkSubmissions } from "../../shared/schemas/academicSchema";
import { classes, subjects } from "../../shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IAcademicStorage {
  getAcademicConfiguration(schoolId: number): Promise<any | null>;
  setAcademicConfiguration(schoolId: number, config: any): Promise<any>;
  updateAcademicTerms(schoolId: number, terms: any[], userId: number): Promise<any>;
  updateAcademicYear(schoolId: number, year: any, userId: number): Promise<any>;
  initializeNewAcademicYear(schoolId: number, year: any, promotionSettings: any, userId: number): Promise<any>;
  getHomeworkByTeacher(teacherId: number): Promise<any[]>;
}

export class AcademicStorage implements IAcademicStorage {
  async getAcademicConfiguration(schoolId: number): Promise<any | null> {
    try {
      console.log('[ACADEMIC_STORAGE] 📅 Récupération configuration école:', schoolId);
      
      const [config] = await db.select().from(academicConfiguration)
        .where(eq(academicConfiguration.schoolId, schoolId))
        .limit(1);
      
      if (config) {
        console.log('[ACADEMIC_STORAGE] ✅ Configuration trouvée');
        // Parse JSON fields
        return {
          ...config,
          academicYear: typeof config.academicYear === 'string' ? JSON.parse(config.academicYear) : config.academicYear,
          terms: typeof config.terms === 'string' ? JSON.parse(config.terms) : config.terms,
          gradingScale: typeof config.gradingScale === 'string' ? JSON.parse(config.gradingScale) : config.gradingScale,
          schoolCalendar: typeof config.schoolCalendar === 'string' ? JSON.parse(config.schoolCalendar) : config.schoolCalendar
        };
      }
      
      // Return default configuration if no database config found
      return null;
    } catch (error) {
      console.error('[ACADEMIC_STORAGE] ❌ Erreur récupération configuration:', error);
      return null;
    }
  }

  async setAcademicConfiguration(schoolId: number, config: any): Promise<any> {
    try {
      console.log('[ACADEMIC_STORAGE] 💾 Sauvegarde configuration école:', schoolId);
      
      const configData = {
        schoolId,
        academicYear: JSON.stringify(config.academicYear),
        terms: JSON.stringify(config.terms),
        gradingScale: JSON.stringify(config.gradingScale || {}),
        schoolCalendar: JSON.stringify(config.schoolCalendar || {}),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Try to update existing configuration
      const [existingConfig] = await db.select().from(academicConfiguration)
        .where(eq(academicConfiguration.schoolId, schoolId))
        .limit(1);

      if (existingConfig) {
        const [updatedConfig] = await db.update(academicConfiguration)
          .set(configData)
          .where(eq(academicConfiguration.schoolId, schoolId))
          .returning();
        console.log('[ACADEMIC_STORAGE] ✅ Configuration mise à jour');
        return updatedConfig;
      } else {
        const [newConfig] = await db.insert(academicConfiguration)
          .values(configData)
          .returning();
        console.log('[ACADEMIC_STORAGE] ✅ Nouvelle configuration créée');
        return newConfig;
      }
    } catch (error) {
      console.error('[ACADEMIC_STORAGE] ❌ Erreur sauvegarde configuration:', error);
      throw new Error(`Failed to save academic configuration: ${error}`);
    }
  }

  async updateAcademicTerms(schoolId: number, terms: any[], userId: number): Promise<any> {
    try {
      console.log('[ACADEMIC_STORAGE] 📝 Mise à jour trimestres école:', schoolId);
      
      // Get current configuration
      const currentConfig = await this.getAcademicConfiguration(schoolId);
      
      if (!currentConfig) {
        throw new Error('Configuration académique non trouvée');
      }

      // Update terms
      const updatedConfig = {
        ...currentConfig,
        terms: JSON.stringify(terms),
        updatedAt: new Date(),
        updatedBy: userId
      };

      const [updated] = await db.update(academicConfiguration)
        .set(updatedConfig)
        .where(eq(academicConfiguration.schoolId, schoolId))
        .returning();
      
      console.log('[ACADEMIC_STORAGE] ✅ Trimestres mis à jour');
      return updated;
    } catch (error) {
      console.error('[ACADEMIC_STORAGE] ❌ Erreur mise à jour trimestres:', error);
      throw new Error(`Failed to update academic terms: ${error}`);
    }
  }

  async updateAcademicYear(schoolId: number, year: any, userId: number): Promise<any> {
    try {
      console.log('[ACADEMIC_STORAGE] 📅 Mise à jour année scolaire école:', schoolId);
      
      // Get current configuration
      const currentConfig = await this.getAcademicConfiguration(schoolId);
      
      if (!currentConfig) {
        // Create new configuration if none exists
        return this.setAcademicConfiguration(schoolId, {
          academicYear: year,
          terms: [],
          gradingScale: { minGrade: 0, maxGrade: 20, passingGrade: 10 },
          schoolCalendar: { vacationDays: [], holidays: [] }
        });
      }

      // Update academic year
      const updatedConfig = {
        ...currentConfig,
        academicYear: JSON.stringify(year),
        updatedAt: new Date(),
        updatedBy: userId
      };

      const [updated] = await db.update(academicConfiguration)
        .set(updatedConfig)
        .where(eq(academicConfiguration.schoolId, schoolId))
        .returning();
      
      console.log('[ACADEMIC_STORAGE] ✅ Année scolaire mise à jour');
      return updated;
    } catch (error) {
      console.error('[ACADEMIC_STORAGE] ❌ Erreur mise à jour année:', error);
      throw new Error(`Failed to update academic year: ${error}`);
    }
  }

  async initializeNewAcademicYear(schoolId: number, year: any, promotionSettings: any, userId: number): Promise<any> {
    try {
      console.log('[ACADEMIC_STORAGE] 🎓 Initialisation nouvelle année scolaire:', year.year);
      
      // Create new academic year configuration
      const newYearConfig = {
        academicYear: year,
        terms: [
          {
            termNumber: 1,
            termName: 'Premier Trimestre',
            startDate: year.startDate,
            endDate: this.calculateTermEndDate(year.startDate, 1),
            isActive: true
          },
          {
            termNumber: 2,
            termName: 'Deuxième Trimestre',
            startDate: this.calculateTermStartDate(year.startDate, 2),
            endDate: this.calculateTermEndDate(year.startDate, 2),
            isActive: false
          },
          {
            termNumber: 3,
            termName: 'Troisième Trimestre',
            startDate: this.calculateTermStartDate(year.startDate, 3),
            endDate: year.endDate,
            isActive: false
          }
        ],
        gradingScale: { minGrade: 0, maxGrade: 20, passingGrade: 10 },
        schoolCalendar: { vacationDays: [], holidays: [] }
      };

      // Save new configuration
      const savedConfig = await this.setAcademicConfiguration(schoolId, newYearConfig);
      
      // TODO: Implement student promotion logic based on promotionSettings
      console.log('[ACADEMIC_STORAGE] 🎓 Promotion des étudiants à implémenter');
      
      console.log('[ACADEMIC_STORAGE] ✅ Nouvelle année scolaire initialisée');
      return {
        configuration: savedConfig,
        promotions: { processed: 0, promoted: 0, repeated: 0 },
        message: 'Nouvelle année scolaire initialisée avec succès'
      };
    } catch (error) {
      console.error('[ACADEMIC_STORAGE] ❌ Erreur initialisation année:', error);
      throw new Error(`Failed to initialize new academic year: ${error}`);
    }
  }

  // Helper methods for term date calculations
  private calculateTermEndDate(startDate: string, termNumber: number): string {
    const start = new Date(startDate);
    switch (termNumber) {
      case 1:
        start.setMonth(11, 15); // December 15
        break;
      case 2:
        start.setMonth(3, 5); // April 5
        break;
      case 3:
        start.setMonth(6, 15); // July 15
        break;
    }
    return start.toISOString().split('T')[0];
  }

  private calculateTermStartDate(startDate: string, termNumber: number): string {
    const start = new Date(startDate);
    switch (termNumber) {
      case 2:
        start.setFullYear(start.getFullYear() + 1, 0, 2); // January 2 of next year
        break;
      case 3:
        start.setFullYear(start.getFullYear() + 1, 3, 15); // April 15 of next year
        break;
      default:
        return startDate;
    }
    return start.toISOString().split('T')[0];
  }

  async getHomeworkByTeacher(teacherId: number): Promise<any[]> {
    try {
      console.log('[ACADEMIC_STORAGE] 📚 Fetching homework assignments for teacher:', teacherId);
      
      const assignments = await db
        .select({
          id: homework.id,
          title: homework.title,
          description: homework.description,
          dueDate: homework.dueDate,
          assignedDate: homework.assignedDate,
          classId: homework.classId,
          className: classes.name,
          subjectId: homework.subjectId,
          subjectName: subjects.nameFr,
          isActive: homework.isActive,
          submissionsCount: sql<number>`count(${homeworkSubmissions.id})`,
          totalStudents: sql<number>`count(distinct case when ${homeworkSubmissions.id} is not null then ${homeworkSubmissions.studentId} end)`
        })
        .from(homework)
        .leftJoin(homeworkSubmissions, eq(homeworkSubmissions.homeworkId, homework.id))
        .leftJoin(classes, eq(classes.id, homework.classId))
        .leftJoin(subjects, eq(subjects.id, homework.subjectId))
        .where(eq(homework.teacherId, teacherId))
        .groupBy(
          homework.id, 
          homework.title, 
          homework.description, 
          homework.dueDate, 
          homework.assignedDate, 
          homework.classId, 
          homework.subjectId, 
          homework.isActive, 
          classes.name, 
          subjects.nameFr
        )
        .orderBy(desc(homework.dueDate));

      console.log('[ACADEMIC_STORAGE] ✅ Found', assignments.length, 'homework assignments for teacher:', teacherId);
      return assignments;
    } catch (error) {
      console.error('[ACADEMIC_STORAGE] ❌ Error fetching teacher homework:', error);
      return [];
    }
  }
}
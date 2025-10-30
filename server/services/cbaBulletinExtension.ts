/**
 * CBA BULLETIN EXTENSION SERVICE
 * Extends existing bulletin generation with CBA (Competency-Based Approach) features
 * - Competency descriptions per subject
 * - Letter grades and performance bands
 * - Enhanced discipline tracking
 * - Min-max ranges and teacher remarks
 */

import { db } from "../db";
import { competencies, bulletinSubjectCodes, schools } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import CBAGradingService from "./cbaGradingService";
import CompetencyService from "./competencyService";

export interface CompetenciesBySubject {
  [subjectId: number]: string[];
}

export interface LetterGrades {
  [subjectId: number]: string;
}

export interface SubjectMinMax {
  [subjectId: number]: { min: number; max: number };
}

export interface PerformanceBands {
  code: string;
  label: string;
  labelFr: string;
  min: number;
  max: number;
  count: number;
}

export interface ClassStatistics {
  totalStudents: number;
  classAverage: number;
  classMin: number;
  classMax: number;
  passedCount: number;
  failedCount: number;
  successRate: number;
  performanceBands: PerformanceBands[];
}

export interface CBABulletinData {
  useCBAFormat: boolean;
  competenciesBySubject: CompetenciesBySubject; // 🔒 Plain object for JSON serialization
  letterGrades: LetterGrades; // 🔒 Plain object for JSON serialization
  subjectMinMax: SubjectMinMax; // 🔒 Plain object for JSON serialization
  performanceBands: PerformanceBands[];
  classStatistics: ClassStatistics;
}

export class CBBulletinExtensionService {
  
  /**
   * Check if school uses CBA format
   */
  static async schoolUsesCBA(schoolId: number): Promise<boolean> {
    try {
      const [school] = await db
        .select({ useCBAFormat: schools.useCBAFormat })
        .from(schools)
        .where(eq(schools.id, schoolId));
      
      return school?.useCBAFormat === true;
    } catch (error) {
      console.error('[CBA_EXTENSION] Error checking CBA status:', error);
      return false;
    }
  }
  
  /**
   * Get competencies for bulletin subjects
   * Returns plain object for JSON serialization
   */
  static async getCompetenciesForBulletin(
    schoolId: number,
    subjectIds: number[],
    formLevel: string,
    language: 'fr' | 'en' = 'fr'
  ): Promise<CompetenciesBySubject> {
    try {
      const competenciesBySubject: CompetenciesBySubject = {};
      
      for (const subjectId of subjectIds) {
        const subjectCompetencies = await db
          .select()
          .from(competencies)
          .where(and(
            eq(competencies.schoolId, schoolId),
            eq(competencies.subjectId, subjectId),
            eq(competencies.formLevel, formLevel),
            eq(competencies.isActive, true)
          ))
          .orderBy(competencies.displayOrder);
        
        const texts = subjectCompetencies.map(c => 
          language === 'fr' ? c.competencyTextFr : (c.competencyTextEn || c.competencyTextFr)
        );
        
        if (texts.length > 0) {
          competenciesBySubject[subjectId] = texts;
        }
      }
      
      console.log(`[CBA_EXTENSION] ✅ Loaded competencies for ${Object.keys(competenciesBySubject).length} subjects`);
      return competenciesBySubject;
    } catch (error) {
      console.error('[CBA_EXTENSION] Error loading competencies:', error);
      return {};
    }
  }
  
  /**
   * Calculate letter grades for all subjects
   * Returns plain object for JSON serialization
   */
  static calculateLetterGrades(subjectGrades: Array<{ subjectId: number; grade: number }>): LetterGrades {
    const letterGrades: LetterGrades = {};
    
    subjectGrades.forEach(({ subjectId, grade }) => {
      const letterGrade = CBAGradingService.calculateLetterGrade(grade);
      letterGrades[subjectId] = letterGrade;
    });
    
    return letterGrades;
  }
  
  /**
   * Calculate min/max ranges for subjects
   * Returns plain object for JSON serialization
   */
  static calculateSubjectMinMax(
    classGradesBySubject: { [subjectId: number]: number[] }
  ): SubjectMinMax {
    const minMaxMap: SubjectMinMax = {};
    
    Object.entries(classGradesBySubject).forEach(([subjectIdStr, grades]) => {
      const subjectId = Number(subjectIdStr);
      const stats = CBAGradingService.calculateSubjectStatistics(grades);
      minMaxMap[subjectId] = { min: stats.min, max: stats.max };
    });
    
    return minMaxMap;
  }
  
  /**
   * Prepare complete CBA data for bulletin
   * All data structures use plain objects for JSON serialization
   */
  static async prepareCBAData(
    schoolId: number,
    subjectIds: number[],
    formLevel: string,
    subjectGrades: Array<{ subjectId: number; grade: number }>,
    classGradesBySubject: { [subjectId: number]: number[] },
    allClassGrades: number[],
    language: 'fr' | 'en' = 'fr'
  ): Promise<CBABulletinData> {
    try {
      // Check if school uses CBA
      const useCBA = await this.schoolUsesCBA(schoolId);
      
      if (!useCBA) {
        return {
          useCBAFormat: false,
          competenciesBySubject: {},
          letterGrades: {},
          subjectMinMax: {},
          performanceBands: [],
          classStatistics: {
            totalStudents: 0,
            classAverage: 0,
            classMin: 0,
            classMax: 0,
            passedCount: 0,
            failedCount: 0,
            successRate: 0,
            performanceBands: []
          }
        };
      }
      
      console.log('[CBA_EXTENSION] 🎯 Preparing CBA bulletin data');
      
      // Load competencies
      const competenciesBySubject = await this.getCompetenciesForBulletin(
        schoolId,
        subjectIds,
        formLevel,
        language
      );
      
      // Calculate letter grades
      const letterGrades = this.calculateLetterGrades(subjectGrades);
      
      // Calculate min/max ranges
      const subjectMinMax = this.calculateSubjectMinMax(classGradesBySubject);
      
      // Calculate performance bands
      const classStatistics = CBAGradingService.calculateClassStatistics(allClassGrades);
      
      console.log('[CBA_EXTENSION] ✅ CBA data prepared successfully');
      console.log(`[CBA_EXTENSION] 📊 Competencies: ${Object.keys(competenciesBySubject).length} subjects`);
      console.log(`[CBA_EXTENSION] 📈 Letter grades: ${Object.keys(letterGrades).length} subjects`);
      console.log(`[CBA_EXTENSION] 📉 Performance bands: ${classStatistics.performanceBands.length}`);
      
      return {
        useCBAFormat: true,
        competenciesBySubject,
        letterGrades,
        subjectMinMax,
        performanceBands: classStatistics.performanceBands,
        classStatistics
      };
    } catch (error) {
      console.error('[CBA_EXTENSION] ❌ Error preparing CBA data:', error);
      return {
        useCBAFormat: false,
        competenciesBySubject: {},
        letterGrades: {},
        subjectMinMax: {},
        performanceBands: [],
        classStatistics: {
          totalStudents: 0,
          classAverage: 0,
          classMin: 0,
          classMax: 0,
          passedCount: 0,
          failedCount: 0,
          successRate: 0,
          performanceBands: []
        }
      };
    }
  }
  
  /**
   * Format competencies for PDF display
   */
  static formatCompetenciesForPDF(competencies: string[], maxLength: number = 200): string[] {
    return competencies.map(comp => {
      if (comp.length > maxLength) {
        return comp.substring(0, maxLength - 3) + '...';
      }
      return comp;
    });
  }
  
  /**
   * Get teacher remarks from bulletin subject codes
   */
  static async getTeacherRemarks(
    bulletinId: number,
    subjectId: number
  ): Promise<string | null> {
    try {
      const [subjectCode] = await db
        .select({ teacherRemarks: bulletinSubjectCodes.teacherRemarks })
        .from(bulletinSubjectCodes)
        .where(and(
          eq(bulletinSubjectCodes.bulletinComprehensiveId, bulletinId),
          eq(bulletinSubjectCodes.subjectId, subjectId)
        ));
      
      return subjectCode?.teacherRemarks || null;
    } catch (error) {
      console.error('[CBA_EXTENSION] Error getting teacher remarks:', error);
      return null;
    }
  }
}

export default CBBulletinExtensionService;

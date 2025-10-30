/**
 * CBA GRADING SERVICE
 * Handles Cameroon CBA (Competency-Based Approach) grading calculations
 * - Letter grades (A, B, C, D, E, F)
 * - Performance bands (CVWA, CWA, CA, CAA, CNA)
 * - Class statistics and comparisons
 */

export interface LetterGrade {
  grade: string;
  min: number;
  max: number;
  label: string;
  labelFr: string;
}

export interface PerformanceBand {
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
  performanceBands: PerformanceBand[];
}

export class CBAGradingService {
  
  /**
   * Letter grade scale (Cameroon standard)
   */
  private static readonly LETTER_GRADES: LetterGrade[] = [
    { grade: 'A', min: 18, max: 20, label: 'Excellent', labelFr: 'Excellent' },
    { grade: 'B', min: 16, max: 17.99, label: 'Very Good', labelFr: 'Très Bien' },
    { grade: 'C', min: 14, max: 15.99, label: 'Good', labelFr: 'Bien' },
    { grade: 'D', min: 12, max: 13.99, label: 'Fairly Good', labelFr: 'Assez Bien' },
    { grade: 'E', min: 10, max: 11.99, label: 'Fair', labelFr: 'Passable' },
    { grade: 'F', min: 0, max: 9.99, label: 'Fail', labelFr: 'Échec' }
  ];
  
  /**
   * Convert numeric grade to letter grade
   */
  static calculateLetterGrade(numericGrade: number): string {
    if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 20) {
      return 'N/A';
    }
    
    for (const scale of this.LETTER_GRADES) {
      if (numericGrade >= scale.min && numericGrade <= scale.max) {
        return scale.grade;
      }
    }
    
    return 'F'; // Default to F if not in range
  }
  
  /**
   * Get letter grade with label
   */
  static getLetterGradeInfo(numericGrade: number, language: 'fr' | 'en' = 'fr'): {
    grade: string;
    label: string;
  } {
    const grade = this.calculateLetterGrade(numericGrade);
    const gradeInfo = this.LETTER_GRADES.find(g => g.grade === grade);
    
    return {
      grade,
      label: gradeInfo ? (language === 'fr' ? gradeInfo.labelFr : gradeInfo.label) : 'N/A'
    };
  }
  
  /**
   * Calculate performance bands (CVWA, CWA, CA, CAA, CNA)
   * Based on class grade distribution
   */
  static calculatePerformanceBands(classGrades: number[]): PerformanceBand[] {
    const bands: PerformanceBand[] = [
      {
        code: 'CNA',
        label: 'Class Next/Advanced',
        labelFr: 'Classe Niveau Avancé',
        min: 16,
        max: 20,
        count: 0
      },
      {
        code: 'CAA',
        label: 'Class Above Average',
        labelFr: 'Classe Au-Dessus de la Moyenne',
        min: 14,
        max: 15.99,
        count: 0
      },
      {
        code: 'CA',
        label: 'Class Average',
        labelFr: 'Classe Moyenne',
        min: 12,
        max: 13.99,
        count: 0
      },
      {
        code: 'CWA',
        label: 'Class Weak Average',
        labelFr: 'Classe Moyenne Faible',
        min: 10,
        max: 11.99,
        count: 0
      },
      {
        code: 'CVWA',
        label: 'Class Very Weak Average',
        labelFr: 'Classe Très Faible',
        min: 0,
        max: 9.99,
        count: 0
      }
    ];
    
    // Count students in each band
    classGrades.forEach(grade => {
      if (isNaN(grade) || grade < 0) return;
      
      for (const band of bands) {
        if (grade >= band.min && grade <= band.max) {
          band.count++;
          break;
        }
      }
    });
    
    return bands;
  }
  
  /**
   * Calculate comprehensive class statistics
   */
  static calculateClassStatistics(classGrades: number[]): ClassStatistics {
    const validGrades = classGrades.filter(g => !isNaN(g) && g >= 0 && g <= 20);
    
    if (validGrades.length === 0) {
      return {
        totalStudents: 0,
        classAverage: 0,
        classMin: 0,
        classMax: 0,
        passedCount: 0,
        failedCount: 0,
        successRate: 0,
        performanceBands: this.calculatePerformanceBands([])
      };
    }
    
    const sum = validGrades.reduce((acc, grade) => acc + grade, 0);
    const average = sum / validGrades.length;
    const min = Math.min(...validGrades);
    const max = Math.max(...validGrades);
    const passedCount = validGrades.filter(g => g >= 10).length;
    const failedCount = validGrades.length - passedCount;
    const successRate = (passedCount / validGrades.length) * 100;
    
    return {
      totalStudents: validGrades.length,
      classAverage: Number(average.toFixed(2)),
      classMin: Number(min.toFixed(2)),
      classMax: Number(max.toFixed(2)),
      passedCount,
      failedCount,
      successRate: Number(successRate.toFixed(2)),
      performanceBands: this.calculatePerformanceBands(validGrades)
    };
  }
  
  /**
   * Calculate subject-level statistics (min, max, average)
   */
  static calculateSubjectStatistics(subjectGrades: number[]): {
    min: number;
    max: number;
    average: number;
  } {
    const validGrades = subjectGrades.filter(g => !isNaN(g) && g >= 0 && g <= 20);
    
    if (validGrades.length === 0) {
      return { min: 0, max: 0, average: 0 };
    }
    
    const sum = validGrades.reduce((acc, grade) => acc + grade, 0);
    const average = sum / validGrades.length;
    const min = Math.min(...validGrades);
    const max = Math.max(...validGrades);
    
    return {
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      average: Number(average.toFixed(2))
    };
  }
  
  /**
   * Determine student's performance band
   */
  static getStudentPerformanceBand(studentAverage: number, language: 'fr' | 'en' = 'fr'): {
    code: string;
    label: string;
  } {
    const bands = this.calculatePerformanceBands([studentAverage]);
    const studentBand = bands.find(b => b.count > 0);
    
    if (!studentBand) {
      return { code: 'N/A', label: 'Not Available' };
    }
    
    return {
      code: studentBand.code,
      label: language === 'fr' ? studentBand.labelFr : studentBand.label
    };
  }
  
  /**
   * Format performance bands for bulletin display
   */
  static formatPerformanceBandsForBulletin(
    bands: PerformanceBand[],
    totalStudents: number,
    language: 'fr' | 'en' = 'fr'
  ): string {
    const lines: string[] = [];
    
    bands.forEach(band => {
      const percentage = totalStudents > 0 
        ? ((band.count / totalStudents) * 100).toFixed(1) 
        : '0.0';
      
      const label = language === 'fr' ? band.labelFr : band.label;
      lines.push(`${band.code}: ${band.count} (${percentage}%) - ${label}`);
    });
    
    return lines.join('\n');
  }
}

export default CBAGradingService;

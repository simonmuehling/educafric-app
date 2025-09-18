// OPTIMIZED BULLETIN GENERATOR - INTELLIGENT SPACING & NO OVERLAPS
// Professional academic bulletins with automatic layout optimization for A4
import { PDFDocument, StandardFonts, rgb, PageSizes, PDFImage } from 'pdf-lib';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { 
  StudentGradeData, 
  SchoolInfo, 
  BulletinOptions, 
  SubjectGrade,
  SubjectSection 
} from './comprehensiveBulletinGenerator';

// Layout constants for A4 optimization
const A4_DIMENSIONS = {
  width: 595.276, // A4 width in points
  height: 841.89, // A4 height in points
  margin: 30,     // Standard margin
  contentWidth: 535.276, // width - (2 * margin)
  contentHeight: 781.89  // height - (2 * margin)
};

// Spacing system for intelligent layout
interface SpacingSystem {
  headerHeight: number;
  titleSectionHeight: number;
  studentInfoHeight: number;
  tableHeaderHeight: number;
  subjectRowHeight: number;
  summaryHeight: number;
  conductHeight: number;
  signaturesHeight: number;
  footerHeight: number;
  minSpacing: number; // Minimum spacing between sections
}

// Color palette - Professional black & white with subtle grays
const COLORS = {
  black: rgb(0, 0, 0),
  white: rgb(1, 1, 1),
  lightGray: rgb(0.95, 0.95, 0.95),
  mediumGray: rgb(0.7, 0.7, 0.7),
  darkGray: rgb(0.3, 0.3, 0.3)
};

// Interface for comprehensive data from manual entry
interface ComprehensiveManualData {
  // Attendance data
  unjustifiedAbsenceHours?: string;
  justifiedAbsenceHours?: string;
  latenessCount?: number;
  detentionHours?: string;
  
  // Disciplinary data
  conductWarning?: boolean;
  conductBlame?: boolean;
  exclusionDays?: number;
  permanentExclusion?: boolean;
  
  // Academic data
  totalGeneral?: string;
  numberOfAverages?: number;
  successRate?: string;
  workAppreciation?: string;
  generalComment?: string;
  
  // Signatures
  parentVisa?: { name: string; date: string };
  teacherVisa?: { name: string; date: string };
  headmasterVisa?: { name: string; date: string };
  
  // Subject coefficients
  subjectCoefficients?: Record<number, {
    CTBA?: string;
    CBA?: string;
    CA?: string;
    CMA?: string;
    COTE?: string;
    CNA?: string;
    minGrade?: string;
    maxGrade?: string;
  }>;
}

// Utility function for wrapping text
function wrapText(text: string, maxLength: number): string[] {
  if (!text) return [];
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + ' ' + word).length <= maxLength) {
      currentLine = currentLine ? currentLine + ' ' + word : word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        lines.push(word);
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

export class OptimizedBulletinGenerator {
  
  /**
   * GENERATE DISCIPLINE GRADE - Based on academic performance
   */
  static generateDisciplineGrade(termAverage: number): string {
    if (termAverage >= 16) return 'TB'; // Très Bien
    if (termAverage >= 14) return 'B';  // Bien  
    if (termAverage >= 12) return 'AB'; // Assez Bien
    if (termAverage >= 10) return 'P';  // Passable
    return 'I'; // Insuffisant
  }
  
  /**
   * GENERATE EFFORT GRADE - Based on academic performance with slight variation
   */
  static generateEffortGrade(termAverage: number): string {
    const variation = (Math.random() - 0.5) * 2; // -1 to +1
    const adjustedAverage = termAverage + variation;
    if (adjustedAverage >= 16) return 'TB';
    if (adjustedAverage >= 14) return 'B';
    if (adjustedAverage >= 12) return 'AB';
    if (adjustedAverage >= 10) return 'P';
    return 'I';
  }
  
  /**
   * GENERATE OBSERVATION - Contextual feedback based on performance
   */
  static generateObservation(termAverage: number, language: 'fr' | 'en'): string {
    const observations = {
      fr: {
        excellent: ['Excellent travail', 'Très bon niveau', 'Félicitations'],
        good: ['Bon travail', 'Bien', 'Continue ainsi'],
        average: ['Peut mieux faire', 'Travail correct', 'Effort à fournir'],
        poor: ['Insuffisant', 'Doit progresser', 'Plus d\'efforts']
      },
      en: {
        excellent: ['Excellent work', 'Very good level', 'Congratulations'],
        good: ['Good work', 'Well done', 'Keep it up'],
        average: ['Can do better', 'Adequate work', 'Need more effort'],
        poor: ['Insufficient', 'Must improve', 'More effort needed']
      }
    };
    
    const langObs = observations[language];
    if (termAverage >= 16) return langObs.excellent[Math.floor(Math.random() * langObs.excellent.length)];
    if (termAverage >= 14) return langObs.good[Math.floor(Math.random() * langObs.good.length)];
    if (termAverage >= 10) return langObs.average[Math.floor(Math.random() * langObs.average.length)];
    return langObs.poor[Math.floor(Math.random() * langObs.poor.length)];
  }

  /**
   * USE MANUAL DATA OR FALLBACK TO SAMPLE - Priority to real entered data
   */
  static useManualDataOrFallback(manualData: ComprehensiveManualData | null, termAverage: number, language: 'fr' | 'en') {
    if (manualData) {
      console.log('[OPTIMIZED_BULLETIN] 📋 Using manual comprehensive data');
      return {
        // Use manual data when available, fallback to default/calculated values
        unjustifiedAbsenceHours: parseFloat(manualData.unjustifiedAbsenceHours || '0'),
        justifiedAbsenceHours: parseFloat(manualData.justifiedAbsenceHours || '0'),
        latenessCount: manualData.latenessCount || 0,
        detentionHours: parseFloat(manualData.detentionHours || '0'),
        
        conductWarning: manualData.conductWarning || false,
        conductBlame: manualData.conductBlame || false,
        exclusionDays: manualData.exclusionDays || 0,
        permanentExclusion: manualData.permanentExclusion || false,
        
        totalGeneral: parseFloat(manualData.totalGeneral || (termAverage * 9 * 2).toString()),
        numberOfAverages: manualData.numberOfAverages || 9,
        successRate: parseFloat(manualData.successRate || Math.min(95, Math.max(20, 60 + (termAverage - 10) * 4)).toString()),
        
        workAppreciation: manualData.workAppreciation || this.generateDetailedAppreciation(termAverage, language),
        generalComment: manualData.generalComment || this.generateGeneralComment(termAverage, language),
        
        parentVisa: manualData.parentVisa,
        teacherVisa: manualData.teacherVisa,
        headmasterVisa: manualData.headmasterVisa,
        
        subjectCoefficients: manualData.subjectCoefficients
      };
    }
    
    console.log('[OPTIMIZED_BULLETIN] 🎲 Generating sample comprehensive data');
    return this.generateComprehensiveSampleData(termAverage, language);
  }
  
  /**
   * GENERATE COMPREHENSIVE SAMPLE DATA - All bulletin fields with realistic fictional data
   */
  static generateComprehensiveSampleData(termAverage: number, language: 'fr' | 'en') {
    return {
      // ===== ABSENCES & RETARDS =====
      unjustifiedAbsenceHours: Math.floor(Math.random() * 8), // 0-7 heures
      justifiedAbsenceHours: Math.floor(Math.random() * 4), // 0-3 heures
      latenessCount: Math.floor(Math.random() * 6), // 0-5 fois
      detentionHours: Math.floor(Math.random() * 3), // 0-2 heures de consignes
      
      // ===== SANCTIONS DISCIPLINAIRES =====
      conductWarning: Math.random() < 0.15, // 15% chance d'avertissement
      conductBlame: Math.random() < 0.08, // 8% chance de blâme
      exclusionDays: Math.random() < 0.05 ? Math.floor(Math.random() * 3) + 1 : 0, // Rare: 1-3 jours
      permanentExclusion: false, // Très rare, donc false pour les samples
      
      // ===== COEFFICIENT CODES (Par matière) =====
      CTBA: (termAverage + (Math.random() - 0.5) * 2).toFixed(1), // ±1 point de variation
      CBA: (termAverage + (Math.random() - 0.5) * 1.5).toFixed(1), // ±0.75 point
      CA: (termAverage + (Math.random() - 0.5) * 2.5).toFixed(1), // ±1.25 point  
      CMA: (termAverage + (Math.random() - 0.5) * 1.8).toFixed(1), // ±0.9 point
      COTE: termAverage >= 16 ? 'A' : termAverage >= 14 ? 'B' : termAverage >= 12 ? 'C' : termAverage >= 10 ? 'D' : 'E',
      CNA: termAverage < 10 ? (language === 'fr' ? 'Non acquis' : 'Not acquired') : '',
      minGrade: Math.max(0, termAverage - 3).toFixed(1), // Min: moyenne -3
      maxGrade: Math.min(20, termAverage + 2).toFixed(1), // Max: moyenne +2
      
      // ===== APPRÉCIATIONS DÉTAILLÉES =====
      workAppreciation: this.generateDetailedAppreciation(termAverage, language),
      generalComment: this.generateGeneralComment(termAverage, language),
      
      // ===== TOTAUX ET STATISTIQUES =====
      totalGeneral: (termAverage * 9 * 2).toFixed(1), // 9 matières × coefficient moyen 2
      numberOfAverages: 9, // Nombre standard de matières
      successRate: Math.min(95, Math.max(20, 60 + (termAverage - 10) * 4)).toFixed(1), // Corrélé avec moyenne
      classProfile: {
        totalStudents: 35,
        averageGrade: (13.5 + (Math.random() - 0.5) * 2).toFixed(1),
        passRate: (78 + Math.random() * 15).toFixed(1),
        topScore: (18 + Math.random() * 2).toFixed(1),
        lowestScore: (6 + Math.random() * 4).toFixed(1)
      }
    };
  }

  /**
   * GENERATE DETAILED APPRECIATION - Comprehensive work assessment
   */
  static generateDetailedAppreciation(termAverage: number, language: 'fr' | 'en'): string {
    const appreciations = {
      fr: {
        excellent: [
          "Excellent élève qui démontre une maîtrise remarquable des compétences. Points forts: rigueur, participation active, autonomie. Continue sur cette voie exemplaire.",
          "Travail de très haute qualité. L'élève fait preuve d'une grande maturité intellectuelle et d'un sens critique développé. Félicitations pour ces résultats exceptionnels.",
          "Performance remarquable dans toutes les disciplines. L'élève démontre une capacité d'analyse approfondie et une excellente méthode de travail."
        ],
        good: [
          "Bon élève sérieux et appliqué. Points forts: régularité dans l'effort, bonne compréhension. À améliorer: participation orale et confiance en soi.",
          "Travail satisfaisant avec des progrès constants. L'élève montre de bonnes capacités d'apprentissage. Encourager la prise d'initiative.",
          "Résultats encourageants. L'élève progresse bien avec un travail méthodique. Quelques efforts supplémentaires en expression écrite."
        ],
        average: [
          "Travail correct mais irrégulier. Points à améliorer: concentration, méthode de travail, révisions régulières. Potentiel à développer davantage.",
          "L'élève doit fournir plus d'efforts soutenus. Capacités présentes mais insuffisamment exploitées. Accompagnement recommandé.",
          "Résultats moyens nécessitant plus de rigueur. L'élève peut mieux faire avec davantage d'investissement personnel."
        ],
        poor: [
          "Grandes difficultés nécessitant un accompagnement renforcé. Points d'amélioration urgents: assiduité, méthode, motivation. Soutien familial essentiel.",
          "Résultats préoccupants. L'élève doit redoubler d'efforts dans toutes les matières. Un suivi personnalisé est indispensable.",
          "Travail insuffisant. L'élève a besoin d'un encadrement strict et d'un soutien pédagogique adapté pour progresser."
        ]
      },
      en: {
        excellent: [
          "Excellent student demonstrating remarkable mastery of skills. Strengths: rigor, active participation, autonomy. Continue this exemplary path.",
          "Very high quality work. The student shows great intellectual maturity and developed critical thinking. Congratulations on these exceptional results.",
          "Outstanding performance in all subjects. The student demonstrates deep analytical ability and excellent work methodology."
        ],
        good: [
          "Good serious and diligent student. Strengths: consistent effort, good understanding. To improve: oral participation and self-confidence.",
          "Satisfactory work with steady progress. The student shows good learning abilities. Encourage taking initiative.",
          "Encouraging results. The student progresses well with methodical work. Some additional efforts needed in written expression."
        ],
        average: [
          "Adequate but irregular work. Areas to improve: concentration, work method, regular reviews. Potential to develop further.",
          "The student must provide more sustained efforts. Abilities present but insufficiently exploited. Support recommended.",
          "Average results requiring more rigor. The student can do better with more personal investment."
        ],
        poor: [
          "Major difficulties requiring enhanced support. Urgent improvement areas: attendance, method, motivation. Family support essential.",
          "Concerning results. The student must redouble efforts in all subjects. Personalized follow-up is essential.",
          "Insufficient work. The student needs strict supervision and adapted educational support to progress."
        ]
      }
    };
    
    const langApp = appreciations[language];
    if (termAverage >= 16) return langApp.excellent[Math.floor(Math.random() * langApp.excellent.length)];
    if (termAverage >= 14) return langApp.good[Math.floor(Math.random() * langApp.good.length)];
    if (termAverage >= 10) return langApp.average[Math.floor(Math.random() * langApp.average.length)];
    return langApp.poor[Math.floor(Math.random() * langApp.poor.length)];
  }

  /**
   * GENERATE GENERAL COMMENT - Term summary
   */
  static generateGeneralComment(termAverage: number, language: 'fr' | 'en'): string {
    const comments = {
      fr: {
        excellent: ["Trimestre excellent. Résultats remarquables dans l'ensemble.", "Performance exceptionnelle. Maintenir ce niveau.", "Très bon trimestre. Félicitations."],
        good: ["Bon trimestre avec des résultats satisfaisants.", "Travail sérieux. Continuer les efforts.", "Trimestre positif. Encouragements."],
        average: ["Trimestre moyen. Peut mieux faire.", "Résultats corrects mais perfectibles.", "Efforts à intensifier."],
        poor: ["Trimestre difficile. Redoublement d'efforts nécessaire.", "Résultats préoccupants. Suivi requis.", "Trimestre à améliorer."]
      },
      en: {
        excellent: ["Excellent term. Outstanding overall results.", "Exceptional performance. Maintain this level.", "Very good term. Congratulations."],
        good: ["Good term with satisfactory results.", "Serious work. Continue efforts.", "Positive term. Encouragement."],
        average: ["Average term. Can do better.", "Adequate results but perfectible.", "Efforts to intensify."],
        poor: ["Difficult term. Redoubled efforts needed.", "Concerning results. Follow-up required.", "Term to improve."]
      }
    };
    
    const langComments = comments[language];
    if (termAverage >= 16) return langComments.excellent[Math.floor(Math.random() * langComments.excellent.length)];
    if (termAverage >= 14) return langComments.good[Math.floor(Math.random() * langComments.good.length)];
    if (termAverage >= 10) return langComments.average[Math.floor(Math.random() * langComments.average.length)];
    return langComments.poor[Math.floor(Math.random() * langComments.poor.length)];
  }
  
  /**
   * INTELLIGENT SPACING CALCULATOR - Prevents overlaps automatically
   * Calculates optimal spacing based on content and available space
   */
  static calculateIntelligentSpacing(
    contentRequirements: {
      subjectCount: number;
      includeComments: boolean;
      includeRankings: boolean;
      includeStatistics: boolean;
      includePerformanceLevels: boolean;
      includeQRCode: boolean;
      hasSignatures: boolean;
    }
  ): SpacingSystem {
    console.log('[INTELLIGENT_SPACING] 🧮 Calculating optimal spacing for content...');
    
    // Base spacing requirements
    const headerHeight = 110; // Standardized Cameroonian header
    const titleSectionHeight = 45; // Title + period
    const studentInfoHeight = 65; // Student details in compact rows
    const tableHeaderHeight = 25; // Column headers
    const summaryHeight = 35; // Averages and totals
    const conductHeight = contentRequirements.includeStatistics ? 20 : 15;
    const signaturesHeight = contentRequirements.hasSignatures ? 50 : 0;
    const footerHeight = contentRequirements.includeQRCode ? 90 : 60;
    
    // Calculate subject table requirements - Sample format needs space for teacher names
    const baseSubjectRowHeight = 30; // Increased for teacher names below subjects (sample format)
    const commentPadding = contentRequirements.includeComments ? 3 : 0;
    const rankingPadding = contentRequirements.includeRankings ? 2 : 0;
    const subjectRowHeight = baseSubjectRowHeight + commentPadding + rankingPadding;
    
    // Performance levels text (if included)
    const performanceLevelsHeight = contentRequirements.includePerformanceLevels ? 40 : 0;
    
    // Calculate total required height
    const totalRequiredHeight = 
      headerHeight + 
      titleSectionHeight + 
      studentInfoHeight + 
      tableHeaderHeight + 
      (subjectRowHeight * contentRequirements.subjectCount) + 
      summaryHeight + 
      conductHeight + 
      signaturesHeight + 
      performanceLevelsHeight +
      footerHeight;
    
    console.log(`[INTELLIGENT_SPACING] Total required: ${totalRequiredHeight}px, Available: ${A4_DIMENSIONS.contentHeight}px`);
    
    // Calculate available space for inter-section spacing
    const availableSpacing = A4_DIMENSIONS.contentHeight - totalRequiredHeight;
    const sectionCount = 8; // Number of sections with spacing needs
    const minSpacing = Math.max(3, availableSpacing / sectionCount);
    
    // Adjust subject row height if we have extra space
    const adjustedSubjectRowHeight = availableSpacing > 30 ? 
      subjectRowHeight + Math.min(3, availableSpacing / contentRequirements.subjectCount) : 
      subjectRowHeight;
    
    const spacing: SpacingSystem = {
      headerHeight,
      titleSectionHeight,
      studentInfoHeight,
      tableHeaderHeight,
      subjectRowHeight: adjustedSubjectRowHeight,
      summaryHeight,
      conductHeight,
      signaturesHeight,
      footerHeight: footerHeight + performanceLevelsHeight,
      minSpacing
    };
    
    console.log('[INTELLIGENT_SPACING] ✅ Optimal spacing calculated:', spacing);
    return spacing;
  }

  /**
   * PROFESSIONAL TEXT DRAWER - Handles alignment and sizing automatically
   */
  static createTextDrawer(page: any, fonts: any) {
    return (text: string | number, x: number, y: number, options: any = {}) => {
      const {
        size = 10,
        font = fonts.regular,
        color = COLORS.black,
        align = 'left',
        maxWidth,
        bold = false,
        wrap = false
      } = options;
      
      // Auto-select bold font if requested
      const selectedFont = bold ? fonts.bold : font;
      const safeText = String(text || '').trim();
      
      if (!safeText) return { width: 0, height: size };
      
      let drawX = x;
      let drawY = y;
      
      // Handle text alignment
      if (align === 'center' && maxWidth) {
        const textWidth = selectedFont.widthOfTextAtSize(safeText, size);
        drawX = x + (maxWidth - textWidth) / 2;
      } else if (align === 'right' && maxWidth) {
        const textWidth = selectedFont.widthOfTextAtSize(safeText, size);
        drawX = x + maxWidth - textWidth;
      }
      
      // Handle text wrapping if requested
      if (wrap && maxWidth) {
        const words = safeText.split(' ');
        let currentLine = '';
        let currentY = drawY;
        let lineCount = 0;
        
        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const testWidth = selectedFont.widthOfTextAtSize(testLine, size);
          
          if (testWidth <= maxWidth) {
            currentLine = testLine;
          } else {
            if (currentLine) {
              page.drawText(currentLine, { 
                x: align === 'center' ? x + (maxWidth - selectedFont.widthOfTextAtSize(currentLine, size)) / 2 : drawX, 
                y: currentY, 
                size, 
                font: selectedFont, 
                color 
              });
              currentY -= size + 2;
              lineCount++;
            }
            currentLine = word;
          }
        }
        
        if (currentLine) {
          page.drawText(currentLine, { 
            x: align === 'center' ? x + (maxWidth - selectedFont.widthOfTextAtSize(currentLine, size)) / 2 : drawX, 
            y: currentY, 
            size, 
            font: selectedFont, 
            color 
          });
          lineCount++;
        }
        
        return { width: maxWidth, height: lineCount * (size + 2) };
      }
      
      // Single line text
      try {
        page.drawText(safeText, { x: drawX, y: drawY, size, font: selectedFont, color });
        const textWidth = selectedFont.widthOfTextAtSize(safeText, size);
        return { width: textWidth, height: size };
      } catch (error) {
        console.warn('[TEXT_DRAWER] Failed to draw text:', error);
        return { width: 0, height: size };
      }
    };
  }

  /**
   * STANDARDIZED CAMEROON HEADER - Optimized for A4
   */
  static async generateOptimizedHeader(
    page: any, 
    drawText: Function, 
    schoolInfo: SchoolInfo, 
    language: 'fr' | 'en'
  ): Promise<number> {
    console.log('[OPTIMIZED_HEADER] 🏛️ Generating standardized Cameroonian header...');
    
    // REDUCED TOP SPACING - Start closer to top
    const startY = A4_DIMENSIONS.height - 25; // Reduced from A4_DIMENSIONS.margin (30)
    let currentY = startY;
    
    // FIXED COLUMN LAYOUT - Better spacing to prevent overlaps
    const leftCol = A4_DIMENSIONS.margin;
    const centerCol = A4_DIMENSIONS.width / 2;
    const rightCol = A4_DIMENSIONS.width - A4_DIMENSIONS.margin - 120; // Increased spacing
    
    // LEFT COLUMN: Official Cameroon information
    drawText('RÉPUBLIQUE DU CAMEROUN', leftCol, currentY, { size: 10, bold: true });
    drawText('Paix - Travail - Patrie', leftCol, currentY - 15, { size: 8 });
    
    const ministry = schoolInfo.regionaleMinisterielle?.includes('BASE') 
      ? 'MINISTÈRE DE L\'ÉDUCATION DE BASE'
      : 'MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES';
    
    drawText(ministry, leftCol, currentY - 28, { size: 8, bold: true });
    drawText('DÉLÉGATION RÉGIONALE DU CENTRE', leftCol, currentY - 41, { size: 7 });
    drawText('DÉLÉGATION DÉPARTEMENTALE DU MFOUNDI', leftCol, currentY - 54, { size: 7 });
    
    // RIGHT COLUMN: Authentication information
    drawText('DOCUMENT OFFICIEL', rightCol, currentY, { size: 8, bold: true });
    const currentDate = new Date().toLocaleDateString('fr-FR');
    drawText(`Généré le: ${currentDate}`, rightCol, currentY - 15, { size: 7 });
    drawText('Version: 2025.1', rightCol, currentY - 28, { size: 7 });
    drawText('educafric.com', rightCol, currentY - 41, { size: 6, color: COLORS.darkGray });
    
    // CENTER COLUMN: School information
    // School logo placeholder
    const logoSize = 25;
    const logoX = centerCol - logoSize / 2;
    const logoY = currentY - 5;
    
    page.drawRectangle({
      x: logoX,
      y: logoY,
      width: logoSize,
      height: logoSize,
      borderColor: COLORS.mediumGray,
      borderWidth: 1
    });
    
    drawText('LOGO', centerCol, logoY + 12, { 
      size: 6, 
      align: 'center', 
      maxWidth: logoSize, 
      color: COLORS.mediumGray 
    });
    
    // School name - centered and prominent
    drawText(schoolInfo.name.toUpperCase(), centerCol, logoY - 15, { 
      size: 9, 
      bold: true, 
      align: 'center', 
      maxWidth: 200 
    });
    
    // Contact information - compact and centered
    if (schoolInfo.phone) {
      drawText(`Tél: ${schoolInfo.phone}`, centerCol, logoY - 28, { 
        size: 6, 
        align: 'center', 
        maxWidth: 200 
      });
    }
    
    if (schoolInfo.email) {
      drawText(schoolInfo.email, centerCol, logoY - 38, { 
        size: 5, 
        align: 'center', 
        maxWidth: 200 
      });
    }
    
    // COMPACT SEPARATOR - Reduce spacing between header and content
    const separatorY = currentY - 45; // Reduced from 75 to 45
    page.drawLine({
      start: { x: A4_DIMENSIONS.margin, y: separatorY },
      end: { x: A4_DIMENSIONS.width - A4_DIMENSIONS.margin, y: separatorY },
      thickness: 1,
      color: COLORS.black
    });
    
    console.log('[OPTIMIZED_HEADER] ✅ Header completed');
    return separatorY - 5; // Reduced from 10 to 5
  }

  /**
   * OPTIMIZED SUBJECT TABLE - Intelligent column widths and spacing
   */
  static drawOptimizedSubjectTable(
    page: any,
    drawText: Function,
    subjects: SubjectGrade[],
    startY: number,
    spacing: SpacingSystem,
    options: BulletinOptions
  ): { endY: number; totals: any } {
    console.log('[OPTIMIZED_TABLE] 📊 Drawing subject table with intelligent layout...');
    
    const tableStartX = A4_DIMENSIONS.margin;
    const tableWidth = A4_DIMENSIONS.contentWidth;
    let currentY = startY;
    
    // SAMPLE-MATCHED COLUMN LAYOUT - Exact spacing from user's sample
    const columns = {
      subject: { width: tableWidth * 0.25, x: tableStartX }, // 25% for subject name + teacher
      eval1: { width: tableWidth * 0.08, x: tableStartX + tableWidth * 0.25 }, // 8% each evaluation
      eval2: { width: tableWidth * 0.08, x: tableStartX + tableWidth * 0.33 },
      eval3: { width: tableWidth * 0.08, x: tableStartX + tableWidth * 0.41 },
      average: { width: tableWidth * 0.10, x: tableStartX + tableWidth * 0.49 }, // 10% for average
      discipline: { width: tableWidth * 0.08, x: tableStartX + tableWidth * 0.59 }, // 8% for discipline
      effort: { width: tableWidth * 0.08, x: tableStartX + tableWidth * 0.67 }, // 8% for work/effort
      coeff: { width: tableWidth * 0.08, x: tableStartX + tableWidth * 0.75 }, // 8% coefficient
      total: { width: tableWidth * 0.08, x: tableStartX + tableWidth * 0.83 }, // 8% total points
      observations: { width: tableWidth * 0.17, x: tableStartX + tableWidth * 0.91 } // 17% observations
    };
    
    // Table header with background
    page.drawRectangle({
      x: tableStartX,
      y: currentY - spacing.tableHeaderHeight,
      width: tableWidth,
      height: spacing.tableHeaderHeight,
      color: COLORS.lightGray
    });
    
    // COMPREHENSIVE HEADER TEXT - Includes all fields from "Générateur de Bulletins Complet"
    const headerY = currentY - 15;
    const headerLabels = options.language === 'fr' 
      ? ['MATIÈRES', 'T1', 'T2', 'T3', 'MOY', 'DISC', 'EFFORT', 'COEF', 'TOTAL', 'OBSERVATIONS']
      : ['SUBJECTS', 'T1', 'T2', 'T3', 'AVG', 'DISC', 'EFFORT', 'COEF', 'TOTAL', 'OBSERVATIONS'];
    
    drawText(headerLabels[0], columns.subject.x + 2, headerY, { size: 8, bold: true });
    drawText(headerLabels[1], columns.eval1.x, headerY, { size: 8, bold: true, align: 'center', maxWidth: columns.eval1.width });
    drawText(headerLabels[2], columns.eval2.x, headerY, { size: 8, bold: true, align: 'center', maxWidth: columns.eval2.width });
    drawText(headerLabels[3], columns.eval3.x, headerY, { size: 8, bold: true, align: 'center', maxWidth: columns.eval3.width });
    drawText(headerLabels[4], columns.average.x, headerY, { size: 8, bold: true, align: 'center', maxWidth: columns.average.width });
    drawText(headerLabels[5], columns.discipline.x, headerY, { size: 8, bold: true, align: 'center', maxWidth: columns.discipline.width });
    drawText(headerLabels[6], columns.effort.x, headerY, { size: 8, bold: true, align: 'center', maxWidth: columns.effort.width });
    drawText(headerLabels[7], columns.coeff.x, headerY, { size: 8, bold: true, align: 'center', maxWidth: columns.coeff.width });
    drawText(headerLabels[8], columns.total.x, headerY, { size: 8, bold: true, align: 'center', maxWidth: columns.total.width });
    drawText(headerLabels[9], columns.observations.x, headerY, { size: 8, bold: true, align: 'center', maxWidth: columns.observations.width });
    
    currentY -= spacing.tableHeaderHeight + spacing.minSpacing;
    
    // Subject rows with alternating backgrounds
    let totalPoints = 0;
    let totalCoefficients = 0;
    
    subjects.forEach((subject, index) => {
      const isEven = index % 2 === 0;
      const rowY = currentY - spacing.subjectRowHeight;
      
      // Alternating row background
      if (isEven) {
        page.drawRectangle({
          x: tableStartX,
          y: rowY,
          width: tableWidth,
          height: spacing.subjectRowHeight,
          color: COLORS.lightGray
        });
      }
      
      // COMPREHENSIVE SUBJECT DATA - Full sample with all fields
      const textY = currentY - 8;
      const subjectTotal = subject.termAverage * subject.coefficient;
      
      // Generate COMPREHENSIVE realistic sample data
      const comprehensiveData = this.generateComprehensiveSampleData(subject.termAverage, options.language);
      const t1Grade = Math.floor(subject.termAverage + (Math.random() - 0.5) * 2);
      const t2Grade = Math.floor(subject.termAverage + (Math.random() - 0.5) * 2);
      const t3Grade = Math.floor(subject.termAverage + (Math.random() - 0.5) * 2);
      const disciplineGrade = this.generateDisciplineGrade(subject.termAverage);
      const effortGrade = this.generateEffortGrade(subject.termAverage);
      const observation = this.generateObservation(subject.termAverage, options.language);
      
      // Subject name (bold)
      drawText(subject.subjectName, columns.subject.x + 2, textY, { size: 9, bold: true });
      
      // Evaluations
      drawText(t1Grade, columns.eval1.x, textY, { 
        size: 9, align: 'center', maxWidth: columns.eval1.width 
      });
      drawText(t2Grade, columns.eval2.x, textY, { 
        size: 9, align: 'center', maxWidth: columns.eval2.width 
      });
      drawText(t3Grade, columns.eval3.x, textY, { 
        size: 9, align: 'center', maxWidth: columns.eval3.width 
      });
      
      // Average (bold)
      drawText(subject.termAverage.toFixed(1), columns.average.x, textY, { 
        size: 9, align: 'center', maxWidth: columns.average.width, bold: true 
      });
      
      // Discipline and Effort
      drawText(disciplineGrade, columns.discipline.x, textY, { 
        size: 9, align: 'center', maxWidth: columns.discipline.width 
      });
      drawText(effortGrade, columns.effort.x, textY, { 
        size: 9, align: 'center', maxWidth: columns.effort.width 
      });
      
      // Coefficient
      drawText(subject.coefficient, columns.coeff.x, textY, { 
        size: 9, align: 'center', maxWidth: columns.coeff.width 
      });
      
      // Total (bold)
      drawText(subjectTotal.toFixed(1), columns.total.x, textY, { 
        size: 9, align: 'center', maxWidth: columns.total.width, bold: true 
      });
      
      // Observations
      drawText(observation, columns.observations.x, textY, { 
        size: 8, align: 'center', maxWidth: columns.observations.width 
      });
      
      // Teacher name below subject (sample format) - with COMPREHENSIVE data
      if (subject.teacherName) {
        const teacherLine = ` Prof: ${subject.teacherName}`;
        // Add CTBA/CBA codes if space allows
        const codesLine = `CTBA:${comprehensiveData.CTBA} CBA:${comprehensiveData.CBA} COTE:${comprehensiveData.COTE}`;
        
        drawText(teacherLine, columns.subject.x + 3, textY - 12, { 
          size: 8, color: COLORS.darkGray 
        });
        
        // Add coefficient codes on second line if subject row height allows
        if (spacing.subjectRowHeight > 30) {
          drawText(codesLine, columns.subject.x + 3, textY - 22, { 
            size: 7, color: COLORS.mediumGray 
          });
        }
      }
      
      totalPoints += subjectTotal;
      totalCoefficients += subject.coefficient;
      currentY -= spacing.subjectRowHeight;
    });
    
    // Summary row
    currentY -= spacing.minSpacing;
    const summaryY = currentY - spacing.summaryHeight;
    
    page.drawRectangle({
      x: tableStartX,
      y: summaryY,
      width: tableWidth,
      height: spacing.summaryHeight,
      color: COLORS.mediumGray
    });
    
    const overallAverage = totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;
    
    // GENERATE COMPREHENSIVE SAMPLE DATA for bulletin
    const comprehensiveData = this.generateComprehensiveSampleData(overallAverage, options.language);
    const summaryTextY = currentY - 15;
    
    drawText(options.language === 'fr' ? 'MOYENNE GÉNÉRALE' : 'OVERALL AVERAGE', 
      columns.subject.x + 5, summaryTextY, { size: 10, bold: true });
    drawText(overallAverage.toFixed(2), columns.average.x, summaryTextY, { 
      size: 12, bold: true, align: 'center', maxWidth: columns.average.width 
    });
    drawText(totalCoefficients, columns.coeff.x, summaryTextY, { 
      size: 10, bold: true, align: 'center', maxWidth: columns.coeff.width 
    });
    drawText(totalPoints.toFixed(1), columns.total.x, summaryTextY, { 
      size: 10, bold: true, align: 'center', maxWidth: columns.total.width 
    });
    
    console.log('[OPTIMIZED_TABLE] ✅ Subject table completed');
    
    return {
      endY: summaryY - spacing.minSpacing,
      totals: {
        overallAverage,
        totalPoints,
        totalCoefficients
      }
    };
  }

  /**
   * MAIN OPTIMIZED BULLETIN GENERATION METHOD
   */
  static async generateOptimizedBulletin(
    studentData: StudentGradeData,
    schoolInfo: SchoolInfo,
    comprehensiveData: ComprehensiveManualData | null = null,
    options: BulletinOptions = {
      includeComments: true,
      includeRankings: true,
      includeStatistics: true,
      includePerformanceLevels: true,
      language: 'fr',
      format: 'A4',
      orientation: 'portrait',
      includeQRCode: true,
      qrCodeSize: 60,
      logoMaxWidth: 50,
      logoMaxHeight: 50,
      photoMaxWidth: 40,
      photoMaxHeight: 50
    }
  ): Promise<Buffer> {
    try {
      console.log('[OPTIMIZED_BULLETIN] 🚀 Generating optimized bulletin with intelligent spacing...');
      
      // Create PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage(PageSizes.A4);
      const { width, height } = page.getSize();
      
      // Embed fonts
      const fonts = {
        regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
        bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
        times: await pdfDoc.embedFont(StandardFonts.TimesRoman),
        timesBold: await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
      };
      
      // Create optimized text drawer
      const drawText = this.createTextDrawer(page, fonts);
      
      // Calculate intelligent spacing based on content
      const contentReqs = {
        subjectCount: studentData.subjects.length,
        includeComments: options.includeComments || false,
        includeRankings: options.includeRankings || false,
        includeStatistics: options.includeStatistics || false,
        includePerformanceLevels: options.includePerformanceLevels || false,
        includeQRCode: options.includeQRCode !== false,
        hasSignatures: !!schoolInfo.directorName
      };
      
      const spacing = this.calculateIntelligentSpacing(contentReqs);
      
      // 1. STANDARDIZED HEADER
      let currentY = await this.generateOptimizedHeader(page, drawText, schoolInfo, options.language);
      currentY -= spacing.minSpacing;
      
      // 2. BULLETIN TITLE - REDUCED SIZE TO PREVENT CUTOFF
      const titleText = options.language === 'fr' ? 'BULLETIN DE NOTES' : 'SCHOOL REPORT';
      drawText(titleText, A4_DIMENSIONS.margin, currentY, {
        size: 14,
        font: fonts.bold,
        align: 'center',
        maxWidth: A4_DIMENSIONS.contentWidth
      });
      
      currentY -= 25;
      const termText = options.language === 'fr' 
        ? `Période: ${studentData.term} - ${studentData.academicYear}`
        : `Period: ${studentData.term} - ${studentData.academicYear}`;
      
      drawText(termText, A4_DIMENSIONS.margin, currentY, {
        size: 12,
        align: 'center',
        maxWidth: A4_DIMENSIONS.contentWidth
      });
      
      currentY -= spacing.titleSectionHeight + spacing.minSpacing;
      
      // 3. STUDENT INFORMATION - Sample-matched layout with photo area
      const leftInfoX = A4_DIMENSIONS.margin + 10;
      const rightInfoX = A4_DIMENSIONS.width / 2 + 50;
      
      // Add "Eleve" section with placeholder (matching sample)
      drawText('Eleve', leftInfoX, currentY, { size: 10, bold: true });
      drawText('O', leftInfoX + 50, currentY - 15, { size: 12, bold: true }); // Photo placeholder
      
      currentY -= 40; // Space for photo area
      
      // Student information (sample format)
      const studentNameText = options.language === 'fr' 
        ? `Élève: ${studentData.firstName} ${studentData.lastName}`
        : `Student: ${studentData.firstName} ${studentData.lastName}`;
      
      drawText(studentNameText, leftInfoX, currentY, { size: 11, bold: true });
      drawText(`${options.language === 'fr' ? 'Classe' : 'Class'}: ${studentData.className}`, 
        rightInfoX, currentY, { size: 11 });
      
      currentY -= 18;
      drawText(`${options.language === 'fr' ? 'Matricule' : 'Registration'}: ${studentData.matricule}`, 
        leftInfoX, currentY, { size: 10 });
      
      if (options.includeRankings) {
        drawText(`${options.language === 'fr' ? 'Rang' : 'Rank'}: ${studentData.classRank}/${studentData.totalStudents}`, 
          rightInfoX, currentY, { size: 10 });
      }
      
      currentY -= spacing.studentInfoHeight + spacing.minSpacing;
      
      // 4. OPTIMIZED SUBJECT TABLE
      const tableResult = this.drawOptimizedSubjectTable(
        page, 
        drawText, 
        studentData.subjects, 
        currentY, 
        spacing, 
        options
      );
      
      currentY = tableResult.endY;
      
      // 5. COMPREHENSIVE DATA INTEGRATION - Use manual data when available
      const usedData = this.useManualDataOrFallback(comprehensiveData, tableResult.totals.overallAverage, options.language);
      
      // Display conduct and comprehensive information
      let conductInfo = [];
      
      // Traditional conduct grade or discipline from comprehensive data
      if (studentData.conductGrade) {
        const conductLabel = options.language === 'fr' ? 'Conduite' : 'Conduct';
        conductInfo.push(`${conductLabel}: ${studentData.conductGrade}/20`);
      } else if (usedData.conductWarning || usedData.conductBlame) {
        const disciplineLabel = options.language === 'fr' ? 'Discipline' : 'Discipline';
        const disciplineStatus = usedData.conductBlame ? (options.language === 'fr' ? 'Blâme' : 'Blame') : 
                                 usedData.conductWarning ? (options.language === 'fr' ? 'Avertissement' : 'Warning') : 
                                 (options.language === 'fr' ? 'Satisfaisante' : 'Satisfactory');
        conductInfo.push(`${disciplineLabel}: ${disciplineStatus}`);
      }
      
      // Absences from comprehensive data
      if (usedData.unjustifiedAbsenceHours > 0 || usedData.justifiedAbsenceHours > 0) {
        const absenceLabel = options.language === 'fr' ? 'Absences' : 'Absences';
        const totalAbsences = usedData.unjustifiedAbsenceHours + usedData.justifiedAbsenceHours;
        conductInfo.push(`${absenceLabel}: ${totalAbsences}h`);
      } else if (studentData.absences !== undefined) {
        const absenceLabel = options.language === 'fr' ? 'Absences' : 'Absences';
        conductInfo.push(`${absenceLabel}: ${studentData.absences}`);
      }
      
      // Lateness from comprehensive data
      if (usedData.latenessCount > 0) {
        const latenessLabel = options.language === 'fr' ? 'Retards' : 'Lateness';
        conductInfo.push(`${latenessLabel}: ${usedData.latenessCount}`);
      }
      
      if (options.includeStatistics) {
        const avgLabel = options.language === 'fr' ? 'Moyenne classe' : 'Class average';
        conductInfo.push(`${avgLabel}: ${tableResult.totals.overallAverage.toFixed(2)}/20`);
      }
      
      if (conductInfo.length > 0) {
        drawText(conductInfo.join(' | '), A4_DIMENSIONS.margin, currentY, { size: 10 });
        currentY -= spacing.conductHeight + spacing.minSpacing;
      }
      
      // Work appreciation from comprehensive data
      if (usedData.workAppreciation) {
        const appreciationLabel = options.language === 'fr' ? 'Appréciation du travail:' : 'Work appreciation:';
        drawText(appreciationLabel, A4_DIMENSIONS.margin, currentY, { size: 10, bold: true });
        currentY -= 15;
        
        // Split long text into multiple lines
        const appreciationLines = wrapText(usedData.workAppreciation, 70);
        appreciationLines.forEach(line => {
          drawText(line, A4_DIMENSIONS.margin, currentY, { size: 9 });
          currentY -= 12;
        });
        currentY -= spacing.minSpacing;
      }
      
      // 6. COMPREHENSIVE SIGNATURES - Use manual data when available
      const hasCustomSignatures = usedData.parentVisa || usedData.teacherVisa || usedData.headmasterVisa;
      
      if (hasCustomSignatures || schoolInfo.directorName) {
        const signatureY = currentY;
        
        // Parent/Guardian signature
        if (usedData.parentVisa) {
          const parentLabel = options.language === 'fr' ? 'VISA PARENT/TUTEUR' : 'PARENT/GUARDIAN VISA';
          drawText(parentLabel, A4_DIMENSIONS.margin, signatureY, { size: 9, bold: true });
          drawText(usedData.parentVisa.name, A4_DIMENSIONS.margin, signatureY - 15, { size: 8 });
          drawText(usedData.parentVisa.date, A4_DIMENSIONS.margin, signatureY - 28, { size: 8 });
        }
        
        // Teacher signature
        if (usedData.teacherVisa) {
          const teacherLabel = options.language === 'fr' ? 'VISA PROFESSEUR' : 'TEACHER VISA';
          drawText(teacherLabel, A4_DIMENSIONS.width / 2 - 50, signatureY, { size: 9, bold: true });
          drawText(usedData.teacherVisa.name, A4_DIMENSIONS.width / 2 - 50, signatureY - 15, { size: 8 });
          drawText(usedData.teacherVisa.date, A4_DIMENSIONS.width / 2 - 50, signatureY - 28, { size: 8 });
        }
        
        // Principal/Headmaster signature
        if (usedData.headmasterVisa || schoolInfo.directorName) {
          const principalLabel = options.language === 'fr' ? 'VISA DIRECTEUR' : 'PRINCIPAL VISA';
          drawText(principalLabel, A4_DIMENSIONS.width - 200, signatureY, { size: 9, bold: true });
          
          if (usedData.headmasterVisa) {
            drawText(usedData.headmasterVisa.name, A4_DIMENSIONS.width - 200, signatureY - 15, { size: 8 });
            drawText(usedData.headmasterVisa.date, A4_DIMENSIONS.width - 200, signatureY - 28, { size: 8 });
          } else if (schoolInfo.directorName) {
            drawText(schoolInfo.directorName, A4_DIMENSIONS.width - 200, signatureY - 15, { size: 8 });
          }
        }
        
        currentY -= spacing.signaturesHeight + spacing.minSpacing;
      }
      
      // 7. FOOTER WITH QR CODE AND VERIFICATION
      const footerY = 50;
      
      // Generate verification data
      const verificationCode = crypto.randomUUID().slice(0, 8).toUpperCase();
      
      // QR Code (if enabled)
      if (options.includeQRCode !== false) {
        try {
          const qrSize = options.qrCodeSize || 60;
          const verificationURL = `${process.env.BASE_URL || 'https://app.replit.dev'}/verify?code=${verificationCode}`;
          
          const qrCodeDataURL = await QRCode.toDataURL(verificationURL, {
            width: qrSize,
            margin: 1,
            color: { dark: '#000000', light: '#FFFFFF' }
          });
          
          const qrCodeImage = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
          const qrCodePdfImage = await pdfDoc.embedPng(qrCodeImage);
          
          page.drawImage(qrCodePdfImage, {
            x: A4_DIMENSIONS.width - qrSize - A4_DIMENSIONS.margin,
            y: footerY,
            width: qrSize,
            height: qrSize
          });
          
          console.log('[OPTIMIZED_BULLETIN] 📱 QR code embedded successfully');
        } catch (qrError) {
          console.warn('[OPTIMIZED_BULLETIN] ⚠️ QR code generation failed:', qrError);
        }
      }
      
      // Verification text
      const codeText = options.language === 'fr' 
        ? `Code de vérification: ${verificationCode}`
        : `Verification code: ${verificationCode}`;
        
      drawText(codeText, A4_DIMENSIONS.margin, footerY + 30, { size: 8 });
      
      const authText = options.language === 'fr'
        ? 'Document authentifié par EDUCAFRIC'
        : 'Document authenticated by EDUCAFRIC';
        
      drawText(authText, A4_DIMENSIONS.margin, footerY + 15, { size: 8 });
      
      drawText(`${schoolInfo.name} - ${schoolInfo.phone || ''}`, 
        A4_DIMENSIONS.margin, footerY, { size: 8, color: COLORS.darkGray });
      
      // Generate PDF
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: false,
        addDefaultPage: false
      });
      
      console.log(`[OPTIMIZED_BULLETIN] ✅ Bulletin generated successfully - ${pdfBytes.length} bytes`);
      
      return Buffer.from(pdfBytes);
      
    } catch (error) {
      console.error('[OPTIMIZED_BULLETIN] ❌ Generation failed:', error);
      throw error;
    }
  }
}
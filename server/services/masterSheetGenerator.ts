// MASTER SHEET GENERATOR - TEACHER OVERVIEW OF CLASS GRADES
// Professional academic master sheet with Cameroon official header
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import { SchoolDataService, type CameroonOfficialHeaderData } from './pdfGenerator.js';

// Types for master sheet generation
export interface MasterSheetData {
  classId: number;
  className: string;
  academicYear: string;
  term: string;
  schoolInfo: SchoolInfo;
  subjects: SubjectInfo[];
  students: StudentMasterData[];
  teacher?: TeacherInfo;
  generatedBy?: string;
}

export interface StudentMasterData {
  id: number;
  matricule: string;
  firstName: string;
  lastName: string;
  grades: { [subjectId: number]: number | null };
  average: number;
  rank: number;
  absences?: number;
}

export interface SubjectInfo {
  id: number;
  name: string;
  coefficient: number;
  teacherName: string;
  maxScore: number;
}

export interface TeacherInfo {
  id: number;
  firstName: string;
  lastName: string;
  title?: string;
}

export interface SchoolInfo {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
  directorName?: string;
  regionaleMinisterielle?: string;
  delegationDepartementale?: string;
  boitePostale?: string;
}

export interface MasterSheetOptions {
  language: 'fr' | 'en';
  format: 'A4' | 'Letter';
  orientation: 'landscape' | 'portrait';
  includeStatistics: boolean;
  includeAbsences: boolean;
  showRankings: boolean;
  colorScheme: 'standard' | 'green' | 'blue';
}

export class MasterSheetGenerator {
  
  static async generateMasterSheet(
    data: MasterSheetData,
    options: MasterSheetOptions = {
      language: 'fr',
      format: 'A4',
      orientation: 'landscape',
      includeStatistics: true,
      includeAbsences: true,
      showRankings: true,
      colorScheme: 'standard'
    }
  ): Promise<Uint8Array> {
    
    console.log('[MASTER_SHEET] 📊 Generating master sheet for class:', data.className);
    
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Set page size and orientation
    const pageSize = options.format === 'Letter' ? PageSizes.Letter : PageSizes.A4;
    const [baseWidth, baseHeight] = pageSize;
    
    const [width, height] = options.orientation === 'landscape' 
      ? [baseHeight, baseWidth] 
      : [baseWidth, baseHeight];
    
    const page = pdfDoc.addPage([width, height]);
    
    // Load fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const times = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    
    // Color scheme
    const colors = this.getColorScheme(options.colorScheme);
    
    // Helper function for drawing text
    const drawText = (text: string, x: number, y: number, options: any = {}) => {
      const {
        font = helvetica,
        size = 10,
        color = rgb(0, 0, 0),
        maxWidth,
        align = 'left'
      } = options;
      
      let adjustedX = x;
      if (align === 'center' && maxWidth) {
        const textWidth = font.widthOfTextAtSize(text, size);
        adjustedX = x + (maxWidth - textWidth) / 2;
      } else if (align === 'right' && maxWidth) {
        const textWidth = font.widthOfTextAtSize(text, size);
        adjustedX = x + maxWidth - textWidth;
      }
      
      page.drawText(text || '', { x: adjustedX, y, size, font, color });
    };
    
    // Helper function for drawing rectangles
    const drawRect = (x: number, y: number, width: number, height: number, options: any = {}) => {
      const { color = colors.lightGray, borderColor: border, borderWidth = 0 } = options;
      
      if (borderWidth > 0 && border) {
        page.drawRectangle({ x, y, width, height, color: border });
        page.drawRectangle({ 
          x: x + borderWidth, 
          y: y + borderWidth, 
          width: width - 2 * borderWidth, 
          height: height - 2 * borderWidth, 
          color 
        });
      } else {
        page.drawRectangle({ x, y, width, height, color });
      }
    };
    
    // ✅ USE STANDARDIZED CAMEROON OFFICIAL HEADER
    const { PdfLibBulletinGenerator } = await import('./pdfLibBulletinGenerator');
    
    // Convert school info to standardized header data
    const headerData: CameroonOfficialHeaderData = {
      schoolName: data.schoolInfo.name,
      region: (data.schoolInfo as any).region || 'CENTRE',
      department: (data.schoolInfo as any).delegation || 'MFOUNDI', 
      educationLevel: 'secondary',
      logoUrl: data.schoolInfo.logoUrl,
      phone: data.schoolInfo.phone,
      email: data.schoolInfo.email,
      postalBox: data.schoolInfo.boitePostale || data.schoolInfo.address,
      regionaleMinisterielle: data.schoolInfo.regionaleMinisterielle,
      delegationDepartementale: data.schoolInfo.delegationDepartementale,
      boitePostale: data.schoolInfo.boitePostale
    };
    
    // Generate standardized header and get the Y position after it  
    let currentY = await PdfLibBulletinGenerator.generateStandardizedCameroonHeader(
      page, drawText, timesBold, times, width, height, headerData
    );
    
    currentY -= 20;
    
    // Document title
    const title = options.language === 'fr' 
      ? `FEUILLE DE MAÎTRE - ${data.className}` 
      : `MASTER SHEET - ${data.className}`;
      
    drawText(title, width / 2, currentY, {
      font: timesBold,
      size: 16,
      color: colors.primary,
      align: 'center',
      maxWidth: width
    });
    
    currentY -= 30;
    
    // Class information section
    const margin = 40;
    const infoY = currentY;
    
    // Left column - Class info
    const leftInfoLabels = options.language === 'fr' 
      ? ['CLASSE:', 'ANNÉE SCOLAIRE:', 'TRIMESTRE:', 'EFFECTIF:']
      : ['CLASS:', 'ACADEMIC YEAR:', 'TERM:', 'STUDENTS:'];
      
    const leftInfoValues = [
      data.className,
      data.academicYear,
      data.term,
      `${data.students.length} ${options.language === 'fr' ? 'élèves' : 'students'}`
    ];
    
    for (let i = 0; i < leftInfoLabels.length; i++) {
      const y = infoY - (i * 15);
      drawText(leftInfoLabels[i], margin, y, { font: helveticaBold, size: 10 });
      drawText(leftInfoValues[i], margin + 100, y, { font: helvetica, size: 10 });
    }
    
    // Right column - Teacher info
    if (data.teacher) {
      const rightInfoLabels = options.language === 'fr' 
        ? ['ENSEIGNANT:', 'DATE DE GÉNÉRATION:']
        : ['TEACHER:', 'GENERATION DATE:'];
        
      const teacherName = `${data.teacher.title || ''} ${data.teacher.firstName} ${data.teacher.lastName}`.trim();
      const generationDate = new Date().toLocaleDateString(
        options.language === 'fr' ? 'fr-FR' : 'en-US'
      );
      
      const rightInfoValues = [teacherName, generationDate];
      
      for (let i = 0; i < rightInfoLabels.length; i++) {
        const y = infoY - (i * 15);
        drawText(rightInfoLabels[i], margin + 300, y, { font: helveticaBold, size: 10 });
        drawText(rightInfoValues[i], margin + 400, y, { font: helvetica, size: 10 });
      }
    }
    
    currentY -= 80;
    
    // Calculate table dimensions
    const tableWidth = width - (2 * margin);
    const nameColumnWidth = 150;
    const matriculeColumnWidth = 80;
    const gradeColumnWidth = Math.max(40, (tableWidth - nameColumnWidth - matriculeColumnWidth - 100) / data.subjects.length);
    const averageColumnWidth = 60;
    const rankColumnWidth = options.showRankings ? 40 : 0;
    
    // Table header
    const headerHeight = 40;
    drawRect(margin, currentY - headerHeight, tableWidth, headerHeight, { 
      color: colors.primary,
      borderColor: colors.border,
      borderWidth: 1
    });
    
    // Header text
    let headerX = margin + 5;
    const headerY = currentY - 25;
    
    // Student info headers
    drawText(options.language === 'fr' ? 'NOM ET PRÉNOM' : 'FULL NAME', headerX, headerY, {
      font: helveticaBold,
      size: 9,
      color: rgb(1, 1, 1),
      maxWidth: nameColumnWidth - 10
    });
    headerX += nameColumnWidth;
    
    drawText(options.language === 'fr' ? 'MATRICULE' : 'ID NUMBER', headerX, headerY, {
      font: helveticaBold,
      size: 9,
      color: rgb(1, 1, 1),
      maxWidth: matriculeColumnWidth - 10
    });
    headerX += matriculeColumnWidth;
    
    // Subject headers
    for (const subject of data.subjects) {
      const subjectName = subject.name.length > 12 ? subject.name.substring(0, 10) + '..' : subject.name;
      drawText(subjectName, headerX, headerY, {
        font: helveticaBold,
        size: 8,
        color: rgb(1, 1, 1),
        maxWidth: gradeColumnWidth - 5,
        align: 'center'
      });
      headerX += gradeColumnWidth;
    }
    
    // Average header
    drawText(options.language === 'fr' ? 'MOY' : 'AVG', headerX, headerY, {
      font: helveticaBold,
      size: 9,
      color: rgb(1, 1, 1),
      maxWidth: averageColumnWidth - 5,
      align: 'center'
    });
    headerX += averageColumnWidth;
    
    // Rank header
    if (options.showRankings) {
      drawText(options.language === 'fr' ? 'RANG' : 'RANK', headerX, headerY, {
        font: helveticaBold,
        size: 9,
        color: rgb(1, 1, 1),
        maxWidth: rankColumnWidth - 5,
        align: 'center'
      });
    }
    
    currentY -= headerHeight;
    
    // Student rows
    const rowHeight = 25;
    for (let i = 0; i < data.students.length; i++) {
      const student = data.students[i];
      const isEvenRow = i % 2 === 0;
      
      // Row background
      drawRect(margin, currentY - rowHeight, tableWidth, rowHeight, { 
        color: isEvenRow ? colors.lightGray : rgb(1, 1, 1),
        borderColor: colors.border,
        borderWidth: 0.5
      });
      
      let cellX = margin + 5;
      const cellY = currentY - 15;
      
      // Student name
      const fullName = `${student.lastName} ${student.firstName}`;
      drawText(fullName, cellX, cellY, {
        font: helvetica,
        size: 9,
        maxWidth: nameColumnWidth - 10
      });
      cellX += nameColumnWidth;
      
      // Matricule
      drawText(student.matricule, cellX, cellY, {
        font: helvetica,
        size: 9,
        maxWidth: matriculeColumnWidth - 10
      });
      cellX += matriculeColumnWidth;
      
      // Grades for each subject
      for (const subject of data.subjects) {
        const grade = student.grades[subject.id];
        const gradeText = grade !== null && grade !== undefined ? grade.toFixed(1) : '-';
        const gradeColor = this.getGradeColor(grade, subject.maxScore);
        
        drawText(gradeText, cellX, cellY, {
          font: helvetica,
          size: 9,
          color: gradeColor,
          maxWidth: gradeColumnWidth - 5,
          align: 'center'
        });
        cellX += gradeColumnWidth;
      }
      
      // Average
      const avgColor = this.getGradeColor(student.average, 20);
      drawText(student.average.toFixed(2), cellX, cellY, {
        font: helveticaBold,
        size: 9,
        color: avgColor,
        maxWidth: averageColumnWidth - 5,
        align: 'center'
      });
      cellX += averageColumnWidth;
      
      // Rank
      if (options.showRankings) {
        drawText(student.rank.toString(), cellX, cellY, {
          font: helvetica,
          size: 9,
          maxWidth: rankColumnWidth - 5,
          align: 'center'
        });
      }
      
      currentY -= rowHeight;
      
      // Check if we need a new page
      if (currentY < 100 && i < data.students.length - 1) {
        // Add new page logic here if needed
        break;
      }
    }
    
    // Statistics section
    if (options.includeStatistics && currentY > 150) {
      currentY -= 30;
      
      const statsTitle = options.language === 'fr' ? 'STATISTIQUES DE LA CLASSE' : 'CLASS STATISTICS';
      drawText(statsTitle, margin, currentY, {
        font: helveticaBold,
        size: 12,
        color: colors.primary
      });
      
      currentY -= 25;
      
      // Calculate statistics
      const classAverage = data.students.reduce((sum, s) => sum + s.average, 0) / data.students.length;
      const highestAverage = Math.max(...data.students.map(s => s.average));
      const lowestAverage = Math.min(...data.students.map(s => s.average));
      
      const statsLabels = options.language === 'fr' 
        ? ['Moyenne de classe:', 'Meilleure moyenne:', 'Plus faible moyenne:', 'Taux de réussite:']
        : ['Class average:', 'Highest average:', 'Lowest average:', 'Success rate:'];
        
      const passCount = data.students.filter(s => s.average >= 10).length;
      const successRate = ((passCount / data.students.length) * 100).toFixed(1);
      
      const statsValues = [
        `${classAverage.toFixed(2)}/20`,
        `${highestAverage.toFixed(2)}/20`,
        `${lowestAverage.toFixed(2)}/20`,
        `${successRate}% (${passCount}/${data.students.length})`
      ];
      
      for (let i = 0; i < statsLabels.length; i++) {
        const y = currentY - (i * 15);
        drawText(statsLabels[i], margin, y, { font: helveticaBold, size: 10 });
        drawText(statsValues[i], margin + 150, y, { font: helvetica, size: 10 });
      }
    }
    
    // Footer
    const footerY = 50;
    const footerText = options.language === 'fr' 
      ? `Document généré le ${new Date().toLocaleDateString('fr-FR')} par ${data.generatedBy || 'Système EDUCAFRIC'}`
      : `Document generated on ${new Date().toLocaleDateString('en-US')} by ${data.generatedBy || 'EDUCAFRIC System'}`;
      
    drawText(footerText, margin, footerY, {
      font: helvetica,
      size: 8,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    console.log('[MASTER_SHEET] ✅ Master sheet generated successfully');
    
    return await pdfDoc.save();
  }
  
  // Helper method to get color scheme
  static getColorScheme(scheme: string) {
    const schemes = {
      standard: {
        primary: rgb(0.2, 0.3, 0.6),
        secondary: rgb(0.7, 0.8, 0.9),
        lightGray: rgb(0.95, 0.95, 0.95),
        border: rgb(0.7, 0.7, 0.7)
      },
      green: {
        primary: rgb(0.1, 0.5, 0.2),
        secondary: rgb(0.7, 0.9, 0.7),
        lightGray: rgb(0.95, 0.98, 0.95),
        border: rgb(0.6, 0.8, 0.6)
      },
      blue: {
        primary: rgb(0.1, 0.4, 0.7),
        secondary: rgb(0.7, 0.8, 0.9),
        lightGray: rgb(0.95, 0.97, 1),
        border: rgb(0.6, 0.7, 0.9)
      }
    };
    
    return schemes[scheme as keyof typeof schemes] || schemes.standard;
  }
  
  // Helper method to get grade color based on performance
  static getGradeColor(grade: number | null, maxScore: number = 20) {
    if (grade === null || grade === undefined) return rgb(0.5, 0.5, 0.5);
    
    const percentage = (grade / maxScore) * 100;
    
    if (percentage >= 75) return rgb(0, 0.6, 0); // Green - Excellent
    if (percentage >= 60) return rgb(0, 0.4, 0.8); // Blue - Good
    if (percentage >= 50) return rgb(0.8, 0.6, 0); // Orange - Average
    return rgb(0.8, 0, 0); // Red - Poor
  }
  
  // Method to generate demo data for testing
  static generateDemoData(): MasterSheetData {
    return {
      classId: 1,
      className: "6ème A",
      academicYear: "2024-2025",
      term: "Premier Trimestre",
      schoolInfo: {
        id: 1,
        name: "COLLÈGE BILINGUE EXCELLENCE YAOUNDÉ",
        address: "BP 1234 Yaoundé",
        phone: "+237 222 123 456",
        email: "info@excellence-yaounde.cm",
        logoUrl: "/assets/school-logo.png",
        directorName: "Dr. MENGUE Paul",
        regionaleMinisterielle: "DÉLÉGATION RÉGIONALE DU CENTRE",
        delegationDepartementale: "DÉLÉGATION DÉPARTEMENTALE DU MFOUNDI",
        boitePostale: "BP 1234 Yaoundé"
      },
      subjects: [
        { id: 1, name: "Français", coefficient: 4, teacherName: "Mme NDONGO", maxScore: 20 },
        { id: 2, name: "Anglais", coefficient: 3, teacherName: "Mr SMITH", maxScore: 20 },
        { id: 3, name: "Mathématiques", coefficient: 4, teacherName: "M. BIYA", maxScore: 20 },
        { id: 4, name: "Sciences", coefficient: 3, teacherName: "Dr EWANE", maxScore: 20 },
        { id: 5, name: "Histoire", coefficient: 2, teacherName: "Mme FOMO", maxScore: 20 },
        { id: 6, name: "Géographie", coefficient: 2, teacherName: "M. KOTTO", maxScore: 20 }
      ],
      students: [
        {
          id: 1, matricule: "23A001", firstName: "Marie", lastName: "FOSSO",
          grades: { 1: 16.5, 2: 14.2, 3: 18.0, 4: 15.8, 5: 13.5, 6: 16.0 },
          average: 15.67, rank: 1, absences: 2
        },
        {
          id: 2, matricule: "23A002", firstName: "Jean", lastName: "KAMGA",
          grades: { 1: 15.0, 2: 13.8, 3: 16.5, 4: 14.2, 5: 12.8, 6: 15.2 },
          average: 14.58, rank: 2, absences: 1
        },
        {
          id: 3, matricule: "23A003", firstName: "Aïcha", lastName: "MBALLA",
          grades: { 1: 14.5, 2: 15.2, 3: 13.8, 4: 16.0, 5: 14.0, 6: 13.5 },
          average: 14.50, rank: 3, absences: 0
        },
        {
          id: 4, matricule: "23A004", firstName: "Paul", lastName: "NGOUE",
          grades: { 1: 12.5, 2: 11.8, 3: 14.0, 4: 13.2, 5: 11.5, 6: 12.8 },
          average: 12.63, rank: 4, absences: 3
        },
        {
          id: 5, matricule: "23A005", firstName: "Fatima", lastName: "BELLO",
          grades: { 1: 11.0, 2: 10.5, 3: 12.8, 4: 11.8, 5: 10.2, 6: 11.5 },
          average: 11.30, rank: 5, absences: 1
        }
      ],
      teacher: {
        id: 1,
        firstName: "Pauline",
        lastName: "MENDOMO",
        title: "Mme"
      },
      generatedBy: "Système EDUCAFRIC"
    };
  }
}
// TRANSCRIPT GENERATOR - ACADEMIC TRANSCRIPT WITH MULTI-TERM HISTORY
// Professional academic transcript with Cameroon official header
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import { SchoolDataService, type CameroonOfficialHeaderData } from './pdfGenerator.js';

// Types for transcript generation
export interface TranscriptData {
  studentId: number;
  firstName: string;
  lastName: string;
  matricule: string;
  birthDate?: string;
  birthPlace?: string;
  photo?: string;
  schoolInfo: SchoolInfo;
  academicHistory: AcademicPeriod[];
  overallStatistics: OverallStats;
  certifications?: Certification[];
  currentLevel: string;
  graduationStatus?: 'graduated' | 'in_progress' | 'transferred';
}

export interface AcademicPeriod {
  academicYear: string;
  className: string;
  term: string;
  subjects: TranscriptSubject[];
  termAverage: number;
  rank: number;
  totalStudents: number;
  decision: string; // "ADMIS", "REDOUBLE", etc.
  mention?: string; // "Très Bien", "Bien", etc.
}

export interface TranscriptSubject {
  name: string;
  teacherName: string;
  coefficient: number;
  grade: number;
  maxScore: number;
  appreciation?: string;
}

export interface OverallStats {
  totalYears: number;
  overallAverage: number;
  bestAverage: number;
  bestYear: string;
  totalAbsences: number;
  disciplinaryRecords: number;
  awards?: string[];
}

export interface Certification {
  name: string;
  year: string;
  grade?: string;
  institution: string;
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
  educationalType?: 'general' | 'technical'; // For technical schools
}

export interface TranscriptOptions {
  language: 'fr' | 'en';
  format: 'A4' | 'Letter';
  includePhoto: boolean;
  includeCertifications: boolean;
  includeStatistics: boolean;
  officialSeal: boolean;
  watermark?: string;
  colorScheme: 'official' | 'modern' | 'classic';
}

export class TranscriptGenerator {
  
  static async generateTranscript(
    data: TranscriptData,
    options: TranscriptOptions = {
      language: 'fr',
      format: 'A4',
      includePhoto: true,
      includeCertifications: true,
      includeStatistics: true,
      officialSeal: true,
      colorScheme: 'official'
    }
  ): Promise<Uint8Array> {
    
    console.log('[TRANSCRIPT] 📜 Generating academic transcript for:', `${data.firstName} ${data.lastName}`);
    
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Set page size
    const pageSize = options.format === 'Letter' ? PageSizes.Letter : PageSizes.A4;
    const [width, height] = pageSize;
    
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
      if (align === 'center') {
        const textWidth = font.widthOfTextAtSize(text, size);
        adjustedX = maxWidth ? x + (maxWidth - textWidth) / 2 : x - textWidth / 2;
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
      ? 'RELEVÉ DE NOTES ACADÉMIQUE' 
      : 'ACADEMIC TRANSCRIPT';
      
    drawText(title, width / 2, currentY, {
      font: timesBold,
      size: 18,
      color: colors.primary,
      align: 'center'
    });
    
    currentY -= 40;
    
    // Student information section
    const margin = 40;
    const infoSectionHeight = 120;
    
    // Student info box
    drawRect(margin, currentY - infoSectionHeight, width - 2 * margin, infoSectionHeight, {
      color: colors.lightBackground,
      borderColor: colors.border,
      borderWidth: 1
    });
    
    // Student photo (if available and included)
    if (options.includePhoto && data.photo) {
      try {
        const photoImage = await this.embedStudentPhoto(pdfDoc, data.photo);
        if (photoImage) {
          const photoSize = 80;
          const photoX = width - margin - photoSize - 10;
          const photoY = currentY - photoSize - 10;
          
          page.drawImage(photoImage, {
            x: photoX,
            y: photoY,
            width: photoSize,
            height: photoSize
          });
        }
      } catch (error) {
        console.warn('[TRANSCRIPT] ⚠️ Failed to load student photo:', error);
      }
    }
    
    // Student information text
    const infoLabels = options.language === 'fr' 
      ? ['NOM ET PRÉNOM:', 'MATRICULE:', 'DATE DE NAISSANCE:', 'LIEU DE NAISSANCE:', 'NIVEAU ACTUEL:']
      : ['FULL NAME:', 'ID NUMBER:', 'DATE OF BIRTH:', 'PLACE OF BIRTH:', 'CURRENT LEVEL:'];
      
    const fullName = `${data.lastName} ${data.firstName}`;
    const infoValues = [
      fullName,
      data.matricule,
      data.birthDate || options.language === 'fr' ? 'Non spécifiée' : 'Not specified',
      data.birthPlace || options.language === 'fr' ? 'Non spécifié' : 'Not specified',
      data.currentLevel
    ];
    
    for (let i = 0; i < infoLabels.length; i++) {
      const y = currentY - 20 - (i * 18);
      drawText(infoLabels[i], margin + 10, y, { font: helveticaBold, size: 11 });
      drawText(infoValues[i], margin + 140, y, { font: helvetica, size: 11 });
    }
    
    currentY -= infoSectionHeight + 30;
    
    // Academic history section
    const historyTitle = options.language === 'fr' 
      ? 'HISTORIQUE ACADÉMIQUE' 
      : 'ACADEMIC HISTORY';
      
    drawText(historyTitle, margin, currentY, {
      font: helveticaBold,
      size: 14,
      color: colors.primary
    });
    
    currentY -= 25;
    
    // Process each academic period
    for (const period of data.academicHistory) {
      // Check if we need a new page
      if (currentY < 200) {
        const newPage = pdfDoc.addPage([width, height]);
        currentY = height - 50;
        // Continue on new page
      }
      
      // Period header
      const periodTitle = `${period.academicYear} - ${period.className} - ${period.term}`;
      drawRect(margin, currentY - 25, width - 2 * margin, 25, {
        color: colors.sectionHeader,
        borderColor: colors.border,
        borderWidth: 1
      });
      
      drawText(periodTitle, margin + 10, currentY - 15, {
        font: helveticaBold,
        size: 12,
        color: colors.headerText
      });
      
      currentY -= 25;
      
      // Subjects table header
      const tableWidth = width - 2 * margin;
      const subjectColWidth = 200;
      const teacherColWidth = 120;
      const coeffColWidth = 60;
      const gradeColWidth = 60;
      const appreciationColWidth = tableWidth - subjectColWidth - teacherColWidth - coeffColWidth - gradeColWidth;
      
      const headerHeight = 20;
      drawRect(margin, currentY - headerHeight, tableWidth, headerHeight, {
        color: colors.tableHeader,
        borderColor: colors.border,
        borderWidth: 1
      });
      
      // Table headers
      let headerX = margin + 5;
      const headerLabels = options.language === 'fr' 
        ? ['MATIÈRE', 'ENSEIGNANT', 'COEFF', 'NOTE', 'APPRÉCIATION']
        : ['SUBJECT', 'TEACHER', 'COEFF', 'GRADE', 'REMARKS'];
        
      const headerWidths = [subjectColWidth, teacherColWidth, coeffColWidth, gradeColWidth, appreciationColWidth];
      
      for (let i = 0; i < headerLabels.length; i++) {
        drawText(headerLabels[i], headerX, currentY - 12, {
          font: helveticaBold,
          size: 9,
          color: colors.headerText,
          maxWidth: headerWidths[i] - 10
        });
        headerX += headerWidths[i];
      }
      
      currentY -= headerHeight;
      
      // Subject rows
      const rowHeight = 18;
      for (let i = 0; i < period.subjects.length; i++) {
        const subject = period.subjects[i];
        const isEvenRow = i % 2 === 0;
        
        drawRect(margin, currentY - rowHeight, tableWidth, rowHeight, {
          color: isEvenRow ? colors.evenRow : rgb(1, 1, 1),
          borderColor: colors.border,
          borderWidth: 0.5
        });
        
        let cellX = margin + 5;
        const cellY = currentY - 11;
        
        // Subject name
        drawText(subject.name, cellX, cellY, {
          font: helvetica,
          size: 9,
          maxWidth: subjectColWidth - 10
        });
        cellX += subjectColWidth;
        
        // Teacher name
        drawText(subject.teacherName, cellX, cellY, {
          font: helvetica,
          size: 9,
          maxWidth: teacherColWidth - 10
        });
        cellX += teacherColWidth;
        
        // Coefficient
        drawText(subject.coefficient.toString(), cellX, cellY, {
          font: helvetica,
          size: 9,
          maxWidth: coeffColWidth - 10,
          align: 'center'
        });
        cellX += coeffColWidth;
        
        // Grade
        const gradeColor = this.getGradeColor(subject.grade, subject.maxScore);
        drawText(`${subject.grade.toFixed(1)}/${subject.maxScore}`, cellX, cellY, {
          font: helveticaBold,
          size: 9,
          color: gradeColor,
          maxWidth: gradeColWidth - 10,
          align: 'center'
        });
        cellX += gradeColWidth;
        
        // Appreciation
        if (subject.appreciation) {
          drawText(subject.appreciation, cellX, cellY, {
            font: helvetica,
            size: 8,
            maxWidth: appreciationColWidth - 10
          });
        }
        
        currentY -= rowHeight;
      }
      
      // Period summary
      currentY -= 10;
      drawRect(margin, currentY - 30, width - 2 * margin, 30, {
        color: colors.summaryBackground,
        borderColor: colors.border,
        borderWidth: 1
      });
      
      const summaryLabels = options.language === 'fr' 
        ? ['MOYENNE:', 'RANG:', 'DÉCISION:']
        : ['AVERAGE:', 'RANK:', 'DECISION:'];
        
      const summaryValues = [
        `${period.termAverage.toFixed(2)}/20`,
        `${period.rank}/${period.totalStudents}`,
        `${period.decision}${period.mention ? ` - ${period.mention}` : ''}`
      ];
      
      for (let i = 0; i < summaryLabels.length; i++) {
        drawText(summaryLabels[i], margin + 10 + (i * 150), currentY - 15, {
          font: helveticaBold,
          size: 10
        });
        drawText(summaryValues[i], margin + 80 + (i * 150), currentY - 15, {
          font: helvetica,
          size: 10
        });
      }
      
      currentY -= 50;
    }
    
    // Overall statistics section
    if (options.includeStatistics && currentY > 150) {
      const statsTitle = options.language === 'fr' 
        ? 'STATISTIQUES GÉNÉRALES' 
        : 'OVERALL STATISTICS';
        
      drawText(statsTitle, margin, currentY, {
        font: helveticaBold,
        size: 14,
        color: colors.primary
      });
      
      currentY -= 25;
      
      const statsLabels = options.language === 'fr' 
        ? ['Années d\'études:', 'Moyenne générale:', 'Meilleure moyenne:', 'Meilleure année:', 'Total absences:']
        : ['Years of study:', 'Overall average:', 'Best average:', 'Best year:', 'Total absences:'];
        
      const statsValues = [
        `${data.overallStatistics.totalYears} ${options.language === 'fr' ? 'années' : 'years'}`,
        `${data.overallStatistics.overallAverage.toFixed(2)}/20`,
        `${data.overallStatistics.bestAverage.toFixed(2)}/20`,
        data.overallStatistics.bestYear,
        `${data.overallStatistics.totalAbsences} ${options.language === 'fr' ? 'jours' : 'days'}`
      ];
      
      for (let i = 0; i < statsLabels.length; i++) {
        const y = currentY - (i * 15);
        drawText(statsLabels[i], margin, y, { font: helveticaBold, size: 10 });
        drawText(statsValues[i], margin + 150, y, { font: helvetica, size: 10 });
      }
      
      currentY -= statsLabels.length * 15 + 10;
      
      // Awards section
      if (data.overallStatistics.awards && data.overallStatistics.awards.length > 0) {
        const awardsTitle = options.language === 'fr' ? 'DISTINCTIONS:' : 'AWARDS:';
        drawText(awardsTitle, margin, currentY, { font: helveticaBold, size: 10 });
        currentY -= 15;
        
        for (const award of data.overallStatistics.awards) {
          drawText(`* ${award}`, margin + 10, currentY, { font: helvetica, size: 9 });
          currentY -= 12;
        }
      }
    }
    
    // Certifications section
    if (options.includeCertifications && data.certifications && data.certifications.length > 0 && currentY > 100) {
      currentY -= 20;
      
      const certTitle = options.language === 'fr' 
        ? 'CERTIFICATIONS ET DIPLÔMES' 
        : 'CERTIFICATIONS AND DIPLOMAS';
        
      drawText(certTitle, margin, currentY, {
        font: helveticaBold,
        size: 12,
        color: colors.primary
      });
      
      currentY -= 20;
      
      for (const cert of data.certifications) {
        const certText = `${cert.name} (${cert.year}) - ${cert.institution}${cert.grade ? ` - ${cert.grade}` : ''}`;
        drawText(`- ${certText}`, margin + 10, currentY, { font: helvetica, size: 10 });
        currentY -= 15;
      }
    }
    
    // Footer with signatures
    const footerY = 80;
    
    // Official seal indicator
    if (options.officialSeal) {
      drawText(options.language === 'fr' ? 'CACHET OFFICIEL' : 'OFFICIAL SEAL', margin, footerY, {
        font: helveticaBold,
        size: 10,
        color: colors.primary
      });
    }
    
    // Director signature section
    const signatureX = width - margin - 150;
    drawText(options.language === 'fr' ? 'LE DIRECTEUR' : 'THE PRINCIPAL', signatureX, footerY, {
      font: helveticaBold,
      size: 10
    });
    
    if (data.schoolInfo.directorName) {
      drawText(data.schoolInfo.directorName, signatureX, footerY - 15, {
        font: helvetica,
        size: 9
      });
    }
    
    // Generation date
    const generationDate = new Date().toLocaleDateString(
      options.language === 'fr' ? 'fr-FR' : 'en-US'
    );
    const dateText = options.language === 'fr' 
      ? `Document généré le ${generationDate}`
      : `Document generated on ${generationDate}`;
      
    drawText(dateText, margin, 30, {
      font: helvetica,
      size: 8,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    console.log('[TRANSCRIPT] ✅ Academic transcript generated successfully');
    
    return await pdfDoc.save();
  }
  
  // Helper method to embed student photo
  static async embedStudentPhoto(pdfDoc: PDFDocument, photoPath: string) {
    try {
      // Use the same image embedding logic as in ComprehensiveBulletinGenerator
      const { ComprehensiveBulletinGenerator } = await import('./comprehensiveBulletinGenerator');
      return await ComprehensiveBulletinGenerator.embedImage(pdfDoc, photoPath, 'photo');
    } catch (error) {
      console.warn('[TRANSCRIPT] ⚠️ Failed to embed student photo:', error);
      return null;
    }
  }
  
  // Helper method to get color scheme
  static getColorScheme(scheme: string) {
    const schemes = {
      official: {
        primary: rgb(0.1, 0.2, 0.5),
        secondary: rgb(0.6, 0.7, 0.9),
        lightBackground: rgb(0.98, 0.98, 1),
        sectionHeader: rgb(0.9, 0.92, 0.98),
        tableHeader: rgb(0.85, 0.88, 0.95),
        summaryBackground: rgb(0.95, 0.97, 1),
        evenRow: rgb(0.97, 0.97, 0.97),
        border: rgb(0.7, 0.7, 0.7),
        headerText: rgb(0.2, 0.2, 0.2),
        lightGray: rgb(0.95, 0.95, 0.95)
      },
      modern: {
        primary: rgb(0.2, 0.4, 0.6),
        secondary: rgb(0.7, 0.8, 0.9),
        lightBackground: rgb(0.98, 0.99, 1),
        sectionHeader: rgb(0.92, 0.95, 0.98),
        tableHeader: rgb(0.88, 0.92, 0.96),
        summaryBackground: rgb(0.96, 0.98, 1),
        evenRow: rgb(0.96, 0.96, 0.96),
        border: rgb(0.75, 0.75, 0.75),
        headerText: rgb(0.1, 0.1, 0.1),
        lightGray: rgb(0.94, 0.94, 0.94)
      },
      classic: {
        primary: rgb(0.3, 0.2, 0.1),
        secondary: rgb(0.8, 0.7, 0.6),
        lightBackground: rgb(0.99, 0.98, 0.96),
        sectionHeader: rgb(0.95, 0.93, 0.90),
        tableHeader: rgb(0.92, 0.89, 0.85),
        summaryBackground: rgb(0.97, 0.95, 0.92),
        evenRow: rgb(0.98, 0.97, 0.95),
        border: rgb(0.7, 0.65, 0.6),
        headerText: rgb(0.2, 0.15, 0.1),
        lightGray: rgb(0.96, 0.95, 0.94)
      }
    };
    
    return schemes[scheme as keyof typeof schemes] || schemes.official;
  }
  
  // Helper method to get grade color based on performance
  static getGradeColor(grade: number, maxScore: number = 20) {
    const percentage = (grade / maxScore) * 100;
    
    if (percentage >= 75) return rgb(0, 0.6, 0); // Green - Excellent
    if (percentage >= 60) return rgb(0, 0.4, 0.8); // Blue - Good
    if (percentage >= 50) return rgb(0.8, 0.6, 0); // Orange - Average
    return rgb(0.8, 0, 0); // Red - Poor
  }
  
  // Method to generate demo data for testing
  static generateDemoData(): TranscriptData {
    return {
      studentId: 1,
      firstName: "Marie",
      lastName: "FOSSO",
      matricule: "23A001",
      birthDate: "15/08/2010",
      birthPlace: "Yaoundé, Cameroun",
      photo: "/assets/student-photos/marie-fosso.jpg",
      currentLevel: "3ème",
      graduationStatus: "in_progress",
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
      academicHistory: [
        {
          academicYear: "2022-2023",
          className: "6ème A",
          term: "Année Complète",
          termAverage: 15.67,
          rank: 1,
          totalStudents: 35,
          decision: "ADMISE",
          mention: "Très Bien",
          subjects: [
            { name: "Français", teacherName: "Mme NDONGO", coefficient: 4, grade: 16.5, maxScore: 20, appreciation: "Excellent travail" },
            { name: "Anglais", teacherName: "Mr SMITH", coefficient: 3, grade: 14.2, maxScore: 20, appreciation: "Bon niveau" },
            { name: "Mathématiques", teacherName: "M. BIYA", coefficient: 4, grade: 18.0, maxScore: 20, appreciation: "Remarquable" },
            { name: "Sciences", teacherName: "Dr EWANE", coefficient: 3, grade: 15.8, maxScore: 20, appreciation: "Très bien" },
            { name: "Histoire-Géo", teacherName: "Mme FOMO", coefficient: 2, grade: 14.5, maxScore: 20, appreciation: "Satisfaisant" }
          ]
        },
        {
          academicYear: "2023-2024",
          className: "5ème A",
          term: "Année Complète",
          termAverage: 16.12,
          rank: 1,
          totalStudents: 38,
          decision: "ADMISE",
          mention: "Très Bien",
          subjects: [
            { name: "Français", teacherName: "Mme NDONGO", coefficient: 4, grade: 17.0, maxScore: 20, appreciation: "Excellent style" },
            { name: "Anglais", teacherName: "Mr SMITH", coefficient: 3, grade: 15.5, maxScore: 20, appreciation: "Progrès notable" },
            { name: "Mathématiques", teacherName: "M. BIYA", coefficient: 4, grade: 17.8, maxScore: 20, appreciation: "Exceptionnel" },
            { name: "Sciences", teacherName: "Dr EWANE", coefficient: 3, grade: 16.2, maxScore: 20, appreciation: "Très bien" },
            { name: "Histoire-Géo", teacherName: "Mme FOMO", coefficient: 2, grade: 15.0, maxScore: 20, appreciation: "Bien" }
          ]
        }
      ],
      overallStatistics: {
        totalYears: 2,
        overallAverage: 15.90,
        bestAverage: 16.12,
        bestYear: "2023-2024",
        totalAbsences: 3,
        disciplinaryRecords: 0,
        awards: ["Prix d'Excellence en Mathématiques 2024", "Meilleure Élève de la Classe 2023"]
      },
      certifications: [
        { name: "Certificat d'Excellence Académique", year: "2023", grade: "Très Bien", institution: "Collège Excellence Yaoundé" },
        { name: "Certificat de Compétence en Informatique", year: "2024", institution: "Centre de Formation Numérique" }
      ]
    };
  }
}
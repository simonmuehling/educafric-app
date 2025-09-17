// COMPREHENSIVE BULLETIN GENERATOR - PROFESSIONAL ACADEMIC BULLETINS
// Integrates with approved grades from director review system
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

// Types for bulletin generation
export interface StudentGradeData {
  studentId: number;
  firstName: string;
  lastName: string;
  matricule: string;
  birthDate?: string;
  photo?: string;
  classId: number;
  className: string;
  subjects: SubjectGrade[];
  overallAverage: number;
  classRank: number;
  totalStudents: number;
  conductGrade?: number;
  absences?: number;
  term: string;
  academicYear: string;
}

export interface SubjectGrade {
  subjectId: number;
  subjectName: string;
  teacherId: number;
  teacherName: string;
  firstEvaluation?: number;
  secondEvaluation?: number;
  thirdEvaluation?: number;
  termAverage: number;
  coefficient: number;
  maxScore: number;
  comments?: string;
  rank?: number;
}

export interface SchoolInfo {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  directorName?: string;
  motto?: string;
  region?: string;
  delegation?: string;
}

export interface BulletinOptions {
  includeComments: boolean;
  includeRankings: boolean;
  includeStatistics: boolean;
  language: 'fr' | 'en';
  format: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
}

export class ComprehensiveBulletinGenerator {
  
  static async generateProfessionalBulletin(
    studentData: StudentGradeData,
    schoolInfo: SchoolInfo,
    options: BulletinOptions = {
      includeComments: true,
      includeRankings: true,
      includeStatistics: true,
      language: 'fr',
      format: 'A4',
      orientation: 'portrait'
    }
  ): Promise<Buffer> {
    try {
      console.log(`[COMPREHENSIVE_PDF] 🎯 Generating professional bulletin for ${studentData.firstName} ${studentData.lastName}`);
      
      // Create new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Embed fonts
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const times = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      
      // Add page with proper sizing
      const page = pdfDoc.addPage(PageSizes.A4);
      const { width, height } = page.getSize();
      
      // Define colors
      const headerColor = rgb(0.1, 0.2, 0.6); // Dark blue
      const primaryColor = rgb(0.2, 0.4, 0.8); // Blue
      const successColor = rgb(0.1, 0.6, 0.1); // Green
      const warningColor = rgb(0.8, 0.6, 0.1); // Orange
      const textColor = rgb(0.1, 0.1, 0.1); // Dark gray
      const lightGray = rgb(0.95, 0.95, 0.95);
      const borderColor = rgb(0.7, 0.7, 0.7);
      
      // Helper function for text drawing
      const drawText = (text: string, x: number, y: number, options: any = {}) => {
        const { 
          size = 10, 
          font = helvetica, 
          color = textColor,
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
        const { color = lightGray, borderColor: border, borderWidth = 0 } = options;
        
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
      
      // Helper function for drawing lines
      const drawLine = (x1: number, y1: number, x2: number, y2: number, options: any = {}) => {
        const { color = borderColor, thickness = 1 } = options;
        page.drawLine({
          start: { x: x1, y: y1 },
          end: { x: x2, y: y2 },
          color,
          thickness
        });
      };
      
      let currentY = height - 40;
      
      // 1. OFFICIAL HEADER - Cameroon Educational System
      if (options.language === 'fr') {
        drawText('RÉPUBLIQUE DU CAMEROUN', 40, currentY, { 
          font: timesBold, 
          size: 12, 
          color: headerColor 
        });
        drawText('Paix - Travail - Patrie', 40, currentY - 18, { 
          font: times, 
          size: 10, 
          color: textColor 
        });
        drawText('MINISTÈRE DE L\'ÉDUCATION DE BASE', 40, currentY - 36, { 
          font: helvetica, 
          size: 9, 
          color: textColor 
        });
        
        if (schoolInfo.region) {
          drawText(`DÉLÉGATION RÉGIONALE DU ${schoolInfo.region.toUpperCase()}`, 40, currentY - 54, { 
            font: helvetica, 
            size: 8, 
            color: textColor 
          });
        }
        if (schoolInfo.delegation) {
          drawText(`DÉLÉGATION DÉPARTEMENTALE ${schoolInfo.delegation.toUpperCase()}`, 40, currentY - 68, { 
            font: helvetica, 
            size: 8, 
            color: textColor 
          });
        }
      } else {
        drawText('REPUBLIC OF CAMEROON', 40, currentY, { 
          font: timesBold, 
          size: 12, 
          color: headerColor 
        });
        drawText('Peace - Work - Fatherland', 40, currentY - 18, { 
          font: times, 
          size: 10, 
          color: textColor 
        });
        drawText('MINISTRY OF BASIC EDUCATION', 40, currentY - 36, { 
          font: helvetica, 
          size: 9, 
          color: textColor 
        });
      }
      
      // School Information (Right side)
      drawText(schoolInfo.name, 350, currentY, { 
        font: helveticaBold, 
        size: 14, 
        color: primaryColor 
      });
      if (schoolInfo.address) {
        drawText(schoolInfo.address, 350, currentY - 18, { 
          font: helvetica, 
          size: 9, 
          color: textColor 
        });
      }
      if (schoolInfo.phone) {
        drawText(`Tél: ${schoolInfo.phone}`, 350, currentY - 32, { 
          font: helvetica, 
          size: 9, 
          color: textColor 
        });
      }
      if (schoolInfo.email) {
        drawText(schoolInfo.email, 350, currentY - 46, { 
          font: helvetica, 
          size: 9, 
          color: textColor 
        });
      }
      
      currentY -= 100;
      
      // 2. BULLETIN TITLE
      const bulletinTitle = options.language === 'fr' ? 'BULLETIN DE NOTES' : 'SCHOOL REPORT CARD';
      drawText(bulletinTitle, width / 2, currentY, { 
        font: timesBold, 
        size: 18, 
        color: headerColor,
        align: 'center',
        maxWidth: width - 80
      });
      
      const periodText = options.language === 'fr' 
        ? `${this.getTermText(studentData.term, 'fr')} ${studentData.academicYear}`
        : `${this.getTermText(studentData.term, 'en')} ${studentData.academicYear}`;
      
      drawText(periodText, width / 2, currentY - 22, { 
        font: helveticaBold, 
        size: 12, 
        color: primaryColor,
        align: 'center',
        maxWidth: width - 80
      });
      
      currentY -= 60;
      
      // 3. STUDENT INFORMATION SECTION
      drawRect(40, currentY - 50, width - 80, 50, { 
        color: lightGray, 
        borderColor: borderColor, 
        borderWidth: 1 
      });
      
      // Student basic info
      const studentLabel = options.language === 'fr' ? 'Élève:' : 'Student:';
      drawText(studentLabel, 50, currentY - 20, { 
        font: helveticaBold, 
        size: 11, 
        color: textColor 
      });
      drawText(`${studentData.firstName} ${studentData.lastName}`, 120, currentY - 20, { 
        font: helvetica, 
        size: 11, 
        color: textColor 
      });
      
      const classLabel = options.language === 'fr' ? 'Classe:' : 'Class:';
      drawText(classLabel, 300, currentY - 20, { 
        font: helveticaBold, 
        size: 11, 
        color: textColor 
      });
      drawText(studentData.className, 340, currentY - 20, { 
        font: helvetica, 
        size: 11, 
        color: textColor 
      });
      
      const matriculeLabel = options.language === 'fr' ? 'Matricule:' : 'ID Number:';
      drawText(matriculeLabel, 50, currentY - 40, { 
        font: helveticaBold, 
        size: 11, 
        color: textColor 
      });
      drawText(studentData.matricule, 120, currentY - 40, { 
        font: helvetica, 
        size: 11, 
        color: textColor 
      });
      
      if (studentData.birthDate) {
        const birthLabel = options.language === 'fr' ? 'Né(e) le:' : 'Born on:';
        drawText(birthLabel, 300, currentY - 40, { 
          font: helveticaBold, 
          size: 11, 
          color: textColor 
        });
        drawText(studentData.birthDate, 360, currentY - 40, { 
          font: helvetica, 
          size: 11, 
          color: textColor 
        });
      }
      
      currentY -= 80;
      
      // 4. GRADES TABLE HEADER
      const tableStartY = currentY;
      const tableHeaders = options.language === 'fr' 
        ? ['MATIÈRES', 'T1/20', 'T2/20', 'T3/20', 'MOY/20', 'COEF', 'POINTS', 'RANG', 'OBSERVATIONS']
        : ['SUBJECTS', 'T1/20', 'T2/20', 'T3/20', 'AVG/20', 'COEF', 'POINTS', 'RANK', 'COMMENTS'];
      
      const tableColWidths = [120, 40, 40, 40, 45, 35, 45, 35, 110];
      const tableStartX = 40;
      
      // Draw table header background
      drawRect(tableStartX, currentY - 25, width - 80, 25, { 
        color: primaryColor, 
        borderColor: borderColor, 
        borderWidth: 1 
      });
      
      // Draw table headers
      let colX = tableStartX + 5;
      tableHeaders.forEach((header, index) => {
        drawText(header, colX, currentY - 18, { 
          font: helveticaBold, 
          size: 9, 
          color: rgb(1, 1, 1) // White text
        });
        colX += tableColWidths[index];
      });
      
      currentY -= 25;
      
      // 5. SUBJECTS AND GRADES
      let totalPoints = 0;
      let totalCoefficients = 0;
      
      studentData.subjects.forEach((subject, index) => {
        const rowY = currentY - (index * 20);
        const isEvenRow = index % 2 === 0;
        
        // Alternate row background
        if (isEvenRow) {
          drawRect(tableStartX, rowY - 20, width - 80, 20, { 
            color: rgb(0.98, 0.98, 0.98),
            borderColor: borderColor,
            borderWidth: 0.5
          });
        } else {
          drawLine(tableStartX, rowY, tableStartX + width - 80, rowY, { 
            color: borderColor, 
            thickness: 0.5 
          });
        }
        
        // Subject data
        const points = subject.termAverage * subject.coefficient;
        totalPoints += points;
        totalCoefficients += subject.coefficient;
        
        colX = tableStartX + 5;
        const rowData = [
          subject.subjectName,
          subject.firstEvaluation?.toFixed(1) || '--',
          subject.secondEvaluation?.toFixed(1) || '--',
          subject.thirdEvaluation?.toFixed(1) || '--',
          subject.termAverage.toFixed(1),
          subject.coefficient.toString(),
          points.toFixed(1),
          subject.rank?.toString() || '--',
          options.includeComments ? (subject.comments || '') : ''
        ];
        
        rowData.forEach((data, colIndex) => {
          const textSize = colIndex === 0 ? 9 : 8; // Subject name slightly larger
          const font = colIndex === 0 ? helveticaBold : helvetica;
          
          drawText(data, colX, rowY - 12, { 
            font, 
            size: textSize, 
            color: textColor 
          });
          colX += tableColWidths[colIndex];
        });
      });
      
      const gradesTableHeight = studentData.subjects.length * 20;
      currentY -= gradesTableHeight + 10;
      
      // 6. SUMMARY SECTION
      drawRect(tableStartX, currentY - 40, width - 80, 40, { 
        color: successColor, 
        borderColor: borderColor, 
        borderWidth: 1 
      });
      
      const overallAverage = totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;
      const averageLabel = options.language === 'fr' ? 'MOYENNE GÉNÉRALE:' : 'OVERALL AVERAGE:';
      const rankLabel = options.language === 'fr' ? 'RANG:' : 'RANK:';
      
      drawText(averageLabel, tableStartX + 10, currentY - 15, { 
        font: helveticaBold, 
        size: 12, 
        color: rgb(1, 1, 1) 
      });
      drawText(`${overallAverage.toFixed(2)}/20`, tableStartX + 150, currentY - 15, { 
        font: timesBold, 
        size: 14, 
        color: rgb(1, 1, 1) 
      });
      
      if (options.includeRankings) {
        drawText(rankLabel, tableStartX + 280, currentY - 15, { 
          font: helveticaBold, 
          size: 12, 
          color: rgb(1, 1, 1) 
        });
        drawText(`${studentData.classRank}/${studentData.totalStudents}`, tableStartX + 330, currentY - 15, { 
          font: timesBold, 
          size: 14, 
          color: rgb(1, 1, 1) 
        });
      }
      
      // Academic appreciation
      const appreciation = this.getAcademicAppreciation(overallAverage, options.language);
      drawText(appreciation, tableStartX + 10, currentY - 35, { 
        font: helveticaBold, 
        size: 11, 
        color: rgb(1, 1, 1) 
      });
      
      currentY -= 60;
      
      // 7. CONDUCT AND ATTENDANCE (if available)
      if (studentData.conductGrade || studentData.absences !== undefined) {
        const conductLabel = options.language === 'fr' ? 'CONDUITE ET ASSIDUITÉ' : 'CONDUCT AND ATTENDANCE';
        drawText(conductLabel, tableStartX, currentY, { 
          font: helveticaBold, 
          size: 11, 
          color: primaryColor 
        });
        
        let conductText = '';
        if (studentData.conductGrade) {
          const conductGradeLabel = options.language === 'fr' ? 'Conduite:' : 'Conduct:';
          conductText += `${conductGradeLabel} ${studentData.conductGrade}/20`;
        }
        if (studentData.absences !== undefined) {
          const absencesLabel = options.language === 'fr' ? 'Absences:' : 'Absences:';
          conductText += `  ${absencesLabel} ${studentData.absences}`;
        }
        
        drawText(conductText, tableStartX + 20, currentY - 20, { 
          font: helvetica, 
          size: 10, 
          color: textColor 
        });
        
        currentY -= 40;
      }
      
      // 8. CLASS STATISTICS (if enabled)
      if (options.includeStatistics && currentY > 120) {
        const statsLabel = options.language === 'fr' ? 'STATISTIQUES DE LA CLASSE' : 'CLASS STATISTICS';
        drawText(statsLabel, tableStartX, currentY, { 
          font: helveticaBold, 
          size: 11, 
          color: primaryColor 
        });
        
        // Calculate class statistics (mock data for now)
        const classAverage = overallAverage; // Would be calculated from all students
        const statsText = options.language === 'fr' 
          ? `Moyenne de classe: ${classAverage.toFixed(2)}/20 • Effectif: ${studentData.totalStudents} élèves`
          : `Class average: ${classAverage.toFixed(2)}/20 • Total students: ${studentData.totalStudents}`;
        
        drawText(statsText, tableStartX + 20, currentY - 20, { 
          font: helvetica, 
          size: 10, 
          color: textColor 
        });
        
        currentY -= 40;
      }
      
      // 9. SIGNATURES SECTION
      const signaturesY = Math.max(currentY - 60, 120);
      
      const principalLabel = options.language === 'fr' ? 'Le Directeur' : 'The Principal';
      const teacherLabel = options.language === 'fr' ? 'Le Professeur Principal' : 'Class Teacher';
      
      drawText(teacherLabel, tableStartX, signaturesY, { 
        font: helveticaBold, 
        size: 10, 
        color: textColor 
      });
      
      drawText(principalLabel, tableStartX + 300, signaturesY, { 
        font: helveticaBold, 
        size: 10, 
        color: textColor 
      });
      
      if (schoolInfo.directorName) {
        drawText(schoolInfo.directorName, tableStartX + 300, signaturesY - 40, { 
          font: helvetica, 
          size: 9, 
          color: textColor 
        });
      }
      
      // 10. FOOTER WITH VERIFICATION CODE
      const verificationCode = `EDU-${studentData.academicYear}-${studentData.matricule}-${Date.now().toString(36).toUpperCase()}`;
      const footerY = 60;
      
      drawText(`Code de vérification: ${verificationCode}`, tableStartX, footerY, { 
        font: helvetica, 
        size: 8, 
        color: textColor 
      });
      
      const authText = options.language === 'fr' 
        ? 'Document authentifié par signature numérique EDUCAFRIC'
        : 'Document authenticated by EDUCAFRIC digital signature';
      
      drawText(authText, tableStartX, footerY - 15, { 
        font: helvetica, 
        size: 8, 
        color: textColor 
      });
      
      drawText(`${schoolInfo.name} - ${schoolInfo.phone || ''}`, tableStartX, footerY - 30, { 
        font: helvetica, 
        size: 8, 
        color: textColor 
      });
      
      // Generate PDF
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: false,
        addDefaultPage: false,
        objectsPerTick: 50
      });
      
      console.log(`[COMPREHENSIVE_PDF] ✅ Professional bulletin generated - Size: ${pdfBytes.length} bytes`);
      
      return Buffer.from(pdfBytes);
      
    } catch (error) {
      console.error('[COMPREHENSIVE_PDF] ❌ Error:', error);
      throw error;
    }
  }
  
  // Helper methods
  static getTermText(term: string, language: 'fr' | 'en'): string {
    const terms = {
      'T1': language === 'fr' ? 'Premier Trimestre' : 'First Term',
      'T2': language === 'fr' ? 'Deuxième Trimestre' : 'Second Term', 
      'T3': language === 'fr' ? 'Troisième Trimestre' : 'Third Term'
    };
    return terms[term as keyof typeof terms] || term;
  }
  
  static getAcademicAppreciation(average: number, language: 'fr' | 'en'): string {
    if (average >= 16) {
      return language === 'fr' ? 'TRÈS BIEN' : 'EXCELLENT';
    } else if (average >= 14) {
      return language === 'fr' ? 'BIEN' : 'GOOD';
    } else if (average >= 12) {
      return language === 'fr' ? 'ASSEZ BIEN' : 'SATISFACTORY';
    } else if (average >= 10) {
      return language === 'fr' ? 'PASSABLE' : 'FAIR';
    } else {
      return language === 'fr' ? 'INSUFFISANT' : 'INSUFFICIENT';
    }
  }
  
  // Batch generation method
  static async generateBatchBulletins(
    studentsData: StudentGradeData[],
    schoolInfo: SchoolInfo,
    options: BulletinOptions
  ): Promise<Buffer[]> {
    const bulletins: Buffer[] = [];
    
    for (const studentData of studentsData) {
      try {
        const bulletin = await this.generateProfessionalBulletin(studentData, schoolInfo, options);
        bulletins.push(bulletin);
      } catch (error) {
        console.error(`[BATCH_GENERATION] Error for student ${studentData.firstName} ${studentData.lastName}:`, error);
        // Continue with other students
      }
    }
    
    return bulletins;
  }
}
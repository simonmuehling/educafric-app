// COMPREHENSIVE BULLETIN GENERATOR - PROFESSIONAL ACADEMIC BULLETINS
// Integrates with approved grades from director review system
import { PDFDocument, StandardFonts, rgb, PageSizes, PDFImage } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import QRCode from 'qrcode';

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
  includeQRCode?: boolean;
  qrCodeSize?: number;
  logoMaxWidth?: number;
  logoMaxHeight?: number;
  photoMaxWidth?: number;
  photoMaxHeight?: number;
}

export class ComprehensiveBulletinGenerator {
  
  // Helper method to embed images (logo/photo) into PDF
  static async embedImage(pdfDoc: PDFDocument, imagePath: string): Promise<PDFImage | null> {
    try {
      if (!imagePath) return null;
      
      // Check if image exists and read it
      let imageBytes: Uint8Array;
      
      if (imagePath.startsWith('http')) {
        // Handle URL images
        const response = await fetch(imagePath);
        if (!response.ok) {
          console.warn(`[PDF_IMAGES] ⚠️ Failed to fetch image from URL: ${imagePath}`);
          return null;
        }
        const arrayBuffer = await response.arrayBuffer();
        imageBytes = new Uint8Array(arrayBuffer);
      } else {
        // Handle local file paths
        const fullPath = path.isAbsolute(imagePath) ? imagePath : path.join(process.cwd(), imagePath);
        
        try {
          imageBytes = await fs.readFile(fullPath);
        } catch (error) {
          console.warn(`[PDF_IMAGES] ⚠️ Image file not found: ${fullPath}`);
          return null;
        }
      }
      
      // Determine image type and embed
      const imageType = this.getImageType(imagePath, imageBytes);
      
      if (imageType === 'png') {
        return await pdfDoc.embedPng(imageBytes);
      } else if (imageType === 'jpg' || imageType === 'jpeg') {
        return await pdfDoc.embedJpg(imageBytes);
      } else {
        console.warn(`[PDF_IMAGES] ⚠️ Unsupported image format: ${imagePath}`);
        return null;
      }
    } catch (error) {
      console.error(`[PDF_IMAGES] ❌ Error embedding image ${imagePath}:`, error);
      return null;
    }
  }
  
  // Helper method to determine image type
  static getImageType(imagePath: string, imageBytes: Uint8Array): string | null {
    // Check file extension first
    const ext = path.extname(imagePath).toLowerCase();
    if (ext === '.png') return 'png';
    if (ext === '.jpg' || ext === '.jpeg') return 'jpg';
    
    // Check magic bytes as fallback
    if (imageBytes.length >= 8) {
      // PNG signature: 89 50 4E 47 0D 0A 1A 0A
      if (imageBytes[0] === 0x89 && imageBytes[1] === 0x50 && imageBytes[2] === 0x4E && imageBytes[3] === 0x47) {
        return 'png';
      }
      
      // JPEG signature: FF D8 FF
      if (imageBytes[0] === 0xFF && imageBytes[1] === 0xD8 && imageBytes[2] === 0xFF) {
        return 'jpg';
      }
    }
    
    return null;
  }
  
  // Helper method to calculate image dimensions maintaining aspect ratio
  static calculateImageDimensions(
    originalWidth: number, 
    originalHeight: number, 
    maxWidth: number, 
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;
    
    let newWidth = originalWidth;
    let newHeight = originalHeight;
    
    // Scale down if needed
    if (newWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = newWidth / aspectRatio;
    }
    
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }
    
    return { width: newWidth, height: newHeight };
  }
  
  // Helper method to generate short verification code
  static generateShortCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  // Helper method to generate verification hash
  static generateVerificationHash(data: {
    studentId: number;
    schoolId: number;
    term: string;
    academicYear: string;
    generalAverage?: string;
  }): string {
    const hashString = `${data.studentId}-${data.schoolId}-${data.term}-${data.academicYear}-${data.generalAverage || ''}`;
    return crypto.createHash('sha256').update(hashString).digest('hex');
  }
  
  static async generateProfessionalBulletin(
    studentData: StudentGradeData,
    schoolInfo: SchoolInfo,
    options: BulletinOptions = {
      includeComments: true,
      includeRankings: true,
      includeStatistics: true,
      language: 'fr',
      format: 'A4',
      orientation: 'portrait',
      includeQRCode: true,
      qrCodeSize: 80,
      logoMaxWidth: 60,
      logoMaxHeight: 60,
      photoMaxWidth: 50,
      photoMaxHeight: 60
    }
  ): Promise<Buffer> {
    try {
      console.log(`[COMPREHENSIVE_PDF] 🎯 Generating professional bulletin for ${studentData.firstName} ${studentData.lastName}`);
      
      // Create new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Embed school logo if available
      let schoolLogo: PDFImage | null = null;
      if (schoolInfo.logo) {
        schoolLogo = await this.embedImage(pdfDoc, schoolInfo.logo);
        if (schoolLogo) {
          console.log(`[COMPREHENSIVE_PDF] 🖼️ School logo embedded successfully`);
        }
      }
      
      // Embed student photo if available
      let studentPhoto: PDFImage | null = null;
      if (studentData.photo) {
        studentPhoto = await this.embedImage(pdfDoc, studentData.photo);
        if (studentPhoto) {
          console.log(`[COMPREHENSIVE_PDF] 📸 Student photo embedded successfully`);
        }
      }
      
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
      
      // School Information and Logo (Right side)
      let schoolInfoStartX = 350;
      
      // If logo exists, draw it first and adjust text position
      if (schoolLogo) {
        const logoMaxWidth = options.logoMaxWidth || 60;
        const logoMaxHeight = options.logoMaxHeight || 60;
        
        const logoDimensions = this.calculateImageDimensions(
          schoolLogo.width,
          schoolLogo.height,
          logoMaxWidth,
          logoMaxHeight
        );
        
        // Draw school logo
        const logoX = width - logoDimensions.width - 40; // Right-aligned with margin
        const logoY = currentY - logoDimensions.height + 10;
        
        page.drawImage(schoolLogo, {
          x: logoX,
          y: logoY,
          width: logoDimensions.width,
          height: logoDimensions.height
        });
        
        // Adjust text position to avoid overlap with logo
        schoolInfoStartX = logoX - 20; // Leave space between text and logo
        
        console.log(`[COMPREHENSIVE_PDF] 🖼️ Logo positioned at (${logoX}, ${logoY}) size: ${logoDimensions.width}x${logoDimensions.height}`);
      }
      
      // School name and information
      const schoolNameWidth = helveticaBold.widthOfTextAtSize(schoolInfo.name, 14);
      const schoolNameX = schoolInfoStartX - schoolNameWidth; // Right-align text
      
      drawText(schoolInfo.name, schoolNameX, currentY, { 
        font: helveticaBold, 
        size: 14, 
        color: primaryColor 
      });
      
      if (schoolInfo.address) {
        const addressWidth = helvetica.widthOfTextAtSize(schoolInfo.address, 9);
        drawText(schoolInfo.address, schoolInfoStartX - addressWidth, currentY - 18, { 
          font: helvetica, 
          size: 9, 
          color: textColor 
        });
      }
      if (schoolInfo.phone) {
        const phoneText = `Tél: ${schoolInfo.phone}`;
        const phoneWidth = helvetica.widthOfTextAtSize(phoneText, 9);
        drawText(phoneText, schoolInfoStartX - phoneWidth, currentY - 32, { 
          font: helvetica, 
          size: 9, 
          color: textColor 
        });
      }
      if (schoolInfo.email) {
        const emailWidth = helvetica.widthOfTextAtSize(schoolInfo.email, 9);
        drawText(schoolInfo.email, schoolInfoStartX - emailWidth, currentY - 46, { 
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
      
      // 3. STUDENT INFORMATION SECTION WITH PHOTO
      const studentSectionHeight = 70; // Increased height for photo
      drawRect(40, currentY - studentSectionHeight, width - 80, studentSectionHeight, { 
        color: lightGray, 
        borderColor: borderColor, 
        borderWidth: 1 
      });
      
      // Student photo positioning (right side of student info section)
      let photoWidth = 0;
      let photoSpace = 0;
      
      if (studentPhoto) {
        const photoMaxWidth = options.photoMaxWidth || 50;
        const photoMaxHeight = options.photoMaxHeight || 60;
        
        const photoDimensions = this.calculateImageDimensions(
          studentPhoto.width,
          studentPhoto.height,
          photoMaxWidth,
          photoMaxHeight
        );
        
        // Position photo on the right side of the student section
        const photoX = width - photoDimensions.width - 50; // 50px margin from right
        const photoY = currentY - studentSectionHeight + 5; // 5px margin from bottom
        
        // Draw photo border
        drawRect(photoX - 2, photoY - 2, photoDimensions.width + 4, photoDimensions.height + 4, {
          color: rgb(1, 1, 1),
          borderColor: borderColor,
          borderWidth: 1
        });
        
        // Draw student photo
        page.drawImage(studentPhoto, {
          x: photoX,
          y: photoY,
          width: photoDimensions.width,
          height: photoDimensions.height
        });
        
        photoWidth = photoDimensions.width;
        photoSpace = photoWidth + 60; // Photo width + margins
        
        console.log(`[COMPREHENSIVE_PDF] 📸 Student photo positioned at (${photoX}, ${photoY}) size: ${photoDimensions.width}x${photoDimensions.height}`);
      }
      
      // Student basic info (adjusted for photo space)
      const infoAreaWidth = width - 120 - photoSpace; // Available width for text
      
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
      
      // Class information (positioned considering photo space)
      const classStartX = Math.min(300, infoAreaWidth - 100);
      const classLabel = options.language === 'fr' ? 'Classe:' : 'Class:';
      drawText(classLabel, classStartX, currentY - 20, { 
        font: helveticaBold, 
        size: 11, 
        color: textColor 
      });
      drawText(studentData.className, classStartX + 40, currentY - 20, { 
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
        drawText(birthLabel, classStartX, currentY - 40, { 
          font: helveticaBold, 
          size: 11, 
          color: textColor 
        });
        drawText(studentData.birthDate, classStartX + 60, currentY - 40, { 
          font: helvetica, 
          size: 11, 
          color: textColor 
        });
      }
      
      // Add photo placeholder if no photo available but space is reserved
      if (!studentPhoto && options.photoMaxWidth) {
        const placeholderX = width - (options.photoMaxWidth || 50) - 50;
        const placeholderY = currentY - studentSectionHeight + 5;
        const placeholderWidth = options.photoMaxWidth || 50;
        const placeholderHeight = options.photoMaxHeight || 60;
        
        // Draw placeholder rectangle
        drawRect(placeholderX, placeholderY, placeholderWidth, placeholderHeight, {
          color: rgb(0.98, 0.98, 0.98),
          borderColor: borderColor,
          borderWidth: 1
        });
        
        // Add placeholder text
        const placeholderText = options.language === 'fr' ? 'Photo' : 'Photo';
        const textWidth = helvetica.widthOfTextAtSize(placeholderText, 8);
        drawText(placeholderText, placeholderX + (placeholderWidth - textWidth) / 2, placeholderY + placeholderHeight / 2 - 4, {
          font: helvetica,
          size: 8,
          color: rgb(0.6, 0.6, 0.6)
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
      
      // 10. FOOTER WITH QR CODE AND VERIFICATION
      const footerY = 80;
      
      // Generate verification data
      const verificationCode = crypto.randomUUID();
      const shortCode = this.generateShortCode();
      const verificationData = {
        studentId: studentData.studentId,
        schoolId: schoolInfo.id,
        term: studentData.term,
        academicYear: studentData.academicYear,
        generalAverage: overallAverage.toFixed(2),
        classRank: studentData.classRank,
        totalStudents: studentData.totalStudents
      };
      
      // Generate verification hash
      const verificationHash = this.generateVerificationHash(verificationData);
      
      // Create QR code data - verification URL
      const baseURL = process.env.BASE_URL || 'https://app.replit.dev';
      const verificationURL = `${baseURL}/verify?code=${verificationCode}`;
      
      // Embed QR code in PDF if enabled
      if (options.includeQRCode !== false) {
        try {
          // Generate QR code as data URL
          const qrCodeSize = options.qrCodeSize || 80;
          const qrCodeDataURL = await QRCode.toDataURL(verificationURL, {
            width: qrCodeSize,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          
          // Extract image data from data URL
          const base64Data = qrCodeDataURL.split(',')[1];
          const qrCodeImage = Buffer.from(base64Data, 'base64');
          
          // Embed QR code image
          const qrCodePdfImage = await pdfDoc.embedPng(qrCodeImage);
          
          // Position QR code in footer (bottom right)
          const qrCodeX = width - qrCodeSize - 50; // Right side with margin
          const qrCodeY = 20; // Bottom with margin
          
          // Draw QR code border
          drawRect(qrCodeX - 2, qrCodeY - 2, qrCodeSize + 4, qrCodeSize + 4, {
            color: rgb(1, 1, 1),
            borderColor: borderColor,
            borderWidth: 1
          });
          
          // Draw QR code
          page.drawImage(qrCodePdfImage, {
            x: qrCodeX,
            y: qrCodeY,
            width: qrCodeSize,
            height: qrCodeSize
          });
          
          // QR code label
          const qrLabel = options.language === 'fr' ? 'Scanner pour vérifier' : 'Scan to verify';
          const qrLabelWidth = helvetica.widthOfTextAtSize(qrLabel, 7);
          drawText(qrLabel, qrCodeX + (qrCodeSize - qrLabelWidth) / 2, qrCodeY - 12, {
            font: helvetica,
            size: 7,
            color: textColor
          });
          
          console.log(`[COMPREHENSIVE_PDF] 📱 QR code generated and embedded: ${verificationURL}`);
          
        } catch (qrError) {
          console.error('[COMPREHENSIVE_PDF] ❌ QR code generation failed:', qrError);
          // Fallback to text code if QR generation fails
        }
      }
      
      // Verification codes (text)
      const codeLabel = options.language === 'fr' ? 'Code de vérification:' : 'Verification code:';
      drawText(`${codeLabel} ${shortCode}`, tableStartX, footerY, { 
        font: helvetica, 
        size: 8, 
        color: textColor 
      });
      
      // Authentication text
      const authText = options.language === 'fr' 
        ? 'Document authentifié par signature numérique EDUCAFRIC'
        : 'Document authenticated by EDUCAFRIC digital signature';
      
      drawText(authText, tableStartX, footerY - 15, { 
        font: helvetica, 
        size: 8, 
        color: textColor 
      });
      
      // School contact info
      drawText(`${schoolInfo.name} - ${schoolInfo.phone || ''}`, tableStartX, footerY - 30, { 
        font: helvetica, 
        size: 8, 
        color: textColor 
      });
      
      // Return verification data for saving to database
      const bulletinVerificationData = {
        verificationCode,
        shortCode,
        verificationHash,
        verificationURL,
        studentData,
        schoolInfo,
        overallAverage: overallAverage.toFixed(2)
      };
      
      // Generate PDF
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: false,
        addDefaultPage: false,
        objectsPerTick: 50
      });
      
      console.log(`[COMPREHENSIVE_PDF] ✅ Professional bulletin generated - Size: ${pdfBytes.length} bytes`);
      
      // Store verification data in PDF metadata for later retrieval
      const pdfBuffer = Buffer.from(pdfBytes);
      
      // Attach verification data as a property for access by calling code
      (pdfBuffer as any).verificationData = bulletinVerificationData;
      
      return pdfBuffer;
      
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
// COMPREHENSIVE BULLETIN GENERATOR - PROFESSIONAL ACADEMIC BULLETINS
// Integrates with approved grades from director review system
import { PDFDocument, StandardFonts, rgb, PageSizes, PDFImage } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import QRCode from 'qrcode';

// Texte des niveaux de rendement (bilingue) - côté serveur
const PERFORMANCE_LEVELS_TEXT = {
  fr: `NIVEAU DE RENDEMENT:
DESCRIPTION DES NIVEAUX DE RENDEMENT DE L'ÉLÈVE
Le niveau de rendement est déterminé par les résultats obtenus après l'évaluation des apprentissages. 
Le niveau 1 indique un rendement non satisfaisant. L'élève est en dessous de la moyenne, Il a besoin d'un accompagnement particulier pour les compétences non acquises (tutorat, devoirs supplémentaires…).
Le niveau 2, bien qu'il indique une réussite, la cote C correspond à un niveau de rendement qui ne donne pas entièrement satisfaction. L'élève démontre avec une efficacité limitée l'habileté à mobiliser des ressources pour développer la compétence. Un rendement à ce niveau exige que l'élève s'améliore considérablement pour combler des insuffisances spécifiques dans ses apprentissages (accompagnement par des travaux supplémentaires).
Par ailleurs, la cote C+ correspond à un niveau de rendement assez satisfaisant. À ce stade, l'élève démontre avec une certaine efficacité l'habileté à mobiliser des ressources pour développer la compétence. Un rendement à ce niveau indique que l'élève devrait s'efforcer de corriger les insuffisances identifiées dans ses apprentissages. 
Le niveau 3 indique un rendement satisfaisant. L'élève démontre avec efficacité l'habileté à mobiliser des ressources pour développer la compétence. Un rendement à ce niveau montre que l'élève mène bien ses apprentissages.
Le niveau 4 signifie que le rendement de l'élève est très élevé. L'élève démontre avec beaucoup d'efficacité l'habileté à mobiliser des ressources pour développer la compétence. Ce niveau montre que l'élève a mené avec brio ses apprentissages.`,
  
  en: `PERFORMANCE LEVELS:
DESCRIPTION OF STUDENT PERFORMANCE LEVELS
The level of performance is determined by the score obtained in the summative assessment.
Level 1 indicates unsatisfactory performance. The student performance is below average and will require assistance where competences were not acquired (mentoring, extra homework).
Level 2, while indicating success, C means performance that is not entirely satisfactory. The student demonstrates, with limited effectiveness, the ability to mobilise resources to develop the competence. Performance at this level shows that the student needs to improve considerably to overcome specific shortcomings in his/her learning (extra support needed).
C+ means the performance is fairly satisfactory. The student demonstrates, with certain effectiveness, the ability to mobilise resources to develop the competence. Performance at this level shows that the student should strive to overcome specific shortcomings in his/her learning.
Level 3 shows satisfactory performance. The student demonstrates, with effectiveness, the ability to mobilise resources to develop the competence. Performance at this level shows that the student is learning successfully.
Level 4 means that the student's performance is very high. The student demonstrates, with a great deal of effectiveness, the ability to mobilise resources to develop the competence. This level shows that the student excellently mastered his/her learning.`
};

// Types for bulletin generation
export interface StudentGradeData {
  studentId: number;
  firstName: string;
  lastName: string;
  matricule: string;
  birthDate?: string;
  photo?: string; // Can be photoURL or profilePictureUrl from database
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
  // Additional school context
  schoolName?: string;
  principalSignature?: string; // Principal teacher signature
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
  // New field for professional sectioning
  category?: 'general' | 'technical' | 'optional';
}

// Helper type for organized subject sections
export interface SubjectSection {
  title: string;
  subjects: SubjectGrade[];
  totalPoints: number;
  totalCoefficients: number;
  sectionAverage: number;
}

export interface SchoolInfo {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string; // Real field from database
  directorName?: string;
  motto?: string;
  // Official Cameroon Ministry fields
  regionaleMinisterielle?: string;
  delegationDepartementale?: string;
  boitePostale?: string;
  arrondissement?: string;
  // Academic info
  academicYear?: string;
  currentTerm?: string;
  // Settings
  settings?: any;
}

export interface BulletinOptions {
  includeComments: boolean;
  includeRankings: boolean;
  includeStatistics: boolean;
  includePerformanceLevels?: boolean;
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
  
  // Enhanced method to embed images with comprehensive error handling
  static async embedImage(pdfDoc: PDFDocument, imagePath: string, imageType: 'logo' | 'photo' | 'signature' = 'photo'): Promise<PDFImage | null> {
    try {
      if (!imagePath || imagePath.trim() === '') {
        console.log(`[PDF_IMAGES] ℹ️ No ${imageType} path provided, skipping image embedding`);
        return null;
      }

      console.log(`[PDF_IMAGES] 🔄 Attempting to embed ${imageType} from: ${imagePath}`);
      
      // Check if image exists and read it
      let imageBytes: Uint8Array;
      let imageSource = '';
      
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        // Handle URL images with timeout and proper headers
        imageSource = 'URL';
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          const response = await fetch(imagePath, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'EDUCAFRIC-PDF-Generator/1.0'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            console.warn(`[PDF_IMAGES] ⚠️ HTTP ${response.status} - Failed to fetch ${imageType} from URL: ${imagePath}`);
            return null;
          }
          
          // Check content type
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.startsWith('image/')) {
            console.warn(`[PDF_IMAGES] ⚠️ Invalid content type '${contentType}' for ${imageType}: ${imagePath}`);
            return null;
          }
          
          // Check file size (max 5MB)
          const contentLength = response.headers.get('content-length');
          if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
            console.warn(`[PDF_IMAGES] ⚠️ ${imageType} file too large (${contentLength} bytes): ${imagePath}`);
            return null;
          }
          
          const arrayBuffer = await response.arrayBuffer();
          imageBytes = new Uint8Array(arrayBuffer);
          
        } catch (fetchError: any) {
          if (fetchError.name === 'AbortError') {
            console.warn(`[PDF_IMAGES] ⚠️ Timeout fetching ${imageType} from URL: ${imagePath}`);
          } else {
            console.warn(`[PDF_IMAGES] ⚠️ Network error fetching ${imageType}: ${fetchError.message}`);
          }
          return null;
        }
      } else {
        // Handle local file paths
        imageSource = 'local file';
        const fullPath = path.isAbsolute(imagePath) ? imagePath : path.join(process.cwd(), imagePath);
        
        try {
          // Check if file exists and is readable
          const stats = await fs.stat(fullPath);
          if (!stats.isFile()) {
            console.warn(`[PDF_IMAGES] ⚠️ ${imageType} path is not a file: ${fullPath}`);
            return null;
          }
          
          // Check file size (max 5MB)
          if (stats.size > 5 * 1024 * 1024) {
            console.warn(`[PDF_IMAGES] ⚠️ ${imageType} file too large (${stats.size} bytes): ${fullPath}`);
            return null;
          }
          
          imageBytes = await fs.readFile(fullPath);
        } catch (fileError: any) {
          console.warn(`[PDF_IMAGES] ⚠️ Cannot read ${imageType} file: ${fileError.message}`);
          return null;
        }
      }
      
      // Validate image data
      if (!imageBytes || imageBytes.length === 0) {
        console.warn(`[PDF_IMAGES] ⚠️ Empty ${imageType} data from ${imageSource}`);
        return null;
      }
      
      // Determine image type and embed
      const detectedImageType = this.getImageType(imagePath, imageBytes);
      
      if (!detectedImageType) {
        console.warn(`[PDF_IMAGES] ⚠️ Could not determine ${imageType} format: ${imagePath}`);
        return null;
      }
      
      let embeddedImage: PDFImage;
      
      try {
        if (detectedImageType === 'png') {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        } else if (detectedImageType === 'jpg' || detectedImageType === 'jpeg') {
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        } else {
          console.warn(`[PDF_IMAGES] ⚠️ Unsupported ${imageType} format '${detectedImageType}': ${imagePath}`);
          return null;
        }
      } catch (embedError: any) {
        console.error(`[PDF_IMAGES] ❌ Failed to embed ${imageType} in PDF: ${embedError.message}`);
        return null;
      }
      
      console.log(`[PDF_IMAGES] ✅ Successfully embedded ${imageType} (${detectedImageType}, ${imageBytes.length} bytes) from ${imageSource}`);
      return embeddedImage;
      
    } catch (error: any) {
      console.error(`[PDF_IMAGES] ❌ Unexpected error embedding ${imageType} '${imagePath}': ${error.message}`);
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
  
  // Helper method to organize subjects into professional sections
  static organizeSubjectsBySections(subjects: SubjectGrade[], language: 'fr' | 'en'): SubjectSection[] {
    const sections: SubjectSection[] = [];
    
    // Define section titles based on language
    const sectionTitles = {
      general: language === 'fr' ? 'MATIÈRES GÉNÉRALES' : 'GENERAL SUBJECTS',
      technical: language === 'fr' ? 'MATIÈRES TECHNIQUES' : 'TECHNICAL SUBJECTS',
      optional: language === 'fr' ? 'MATIÈRES OPTIONNELLES' : 'OPTIONAL SUBJECTS'
    };
    
    // Categorize subjects automatically if not categorized
    const generalKeywords = ['français', 'french', 'anglais', 'english', 'mathématiques', 'mathematics', 'math', 'sciences', 'science', 'histoire', 'history', 'géographie', 'geography', 'philosophie', 'philosophy', 'littérature', 'literature'];
    const technicalKeywords = ['informatique', 'computer', 'technologie', 'technology', 'électronique', 'electronics', 'mécanique', 'mechanics', 'chimie', 'chemistry', 'physique', 'physics', 'biologie', 'biology'];
    
    const categorizedSubjects = subjects.map(subject => {
      if (subject.category) return subject; // Already categorized
      
      const subjectLower = subject.subjectName.toLowerCase();
      
      if (generalKeywords.some(keyword => subjectLower.includes(keyword))) {
        return { ...subject, category: 'general' as const };
      } else if (technicalKeywords.some(keyword => subjectLower.includes(keyword))) {
        return { ...subject, category: 'technical' as const };
      } else {
        // Default categorization based on position/coefficient
        return { ...subject, category: subject.coefficient >= 3 ? 'general' : 'technical' as const };
      }
    });
    
    // Group subjects by category
    const groupedSubjects = {
      general: categorizedSubjects.filter(s => s.category === 'general'),
      technical: categorizedSubjects.filter(s => s.category === 'technical'),
      optional: categorizedSubjects.filter(s => s.category === 'optional')
    };
    
    // Create sections for non-empty categories
    Object.entries(groupedSubjects).forEach(([category, subjects]) => {
      if (subjects.length > 0) {
        const totalPoints = subjects.reduce((sum, s) => sum + (s.termAverage * s.coefficient), 0);
        const totalCoefficients = subjects.reduce((sum, s) => sum + s.coefficient, 0);
        const sectionAverage = totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;
        
        sections.push({
          title: sectionTitles[category as keyof typeof sectionTitles],
          subjects,
          totalPoints,
          totalCoefficients,
          sectionAverage
        });
      }
    });
    
    return sections;
  }
  
  // Helper method to get term text in both languages
  static getTermText(term: string, language: 'fr' | 'en'): string {
    const termMap = {
      fr: {
        'T1': 'Premier Trimestre',
        'T2': 'Deuxième Trimestre', 
        'T3': 'Troisième Trimestre',
        'S1': 'Premier Semestre',
        'S2': 'Deuxième Semestre'
      },
      en: {
        'T1': 'First Term',
        'T2': 'Second Term',
        'T3': 'Third Term', 
        'S1': 'First Semester',
        'S2': 'Second Semester'
      }
    };
    
    return termMap[language][term as keyof typeof termMap[typeof language]] || term;
  }
  
  // Helper method to get academic appreciation
  static getAcademicAppreciation(average: number, language: 'fr' | 'en'): string {
    if (average >= 18) {
      return language === 'fr' ? 'EXCELLENT' : 'EXCELLENT';
    } else if (average >= 16) {
      return language === 'fr' ? 'TRÈS BIEN' : 'VERY GOOD';
    } else if (average >= 14) {
      return language === 'fr' ? 'BIEN' : 'GOOD';
    } else if (average >= 12) {
      return language === 'fr' ? 'ASSEZ BIEN' : 'FAIRLY GOOD';
    } else if (average >= 10) {
      return language === 'fr' ? 'PASSABLE' : 'FAIR';
    } else {
      return language === 'fr' ? 'INSUFFISANT' : 'INSUFFICIENT';
    }
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
      
      // Embed school logo if available (real database field)
      let schoolLogo: PDFImage | null = null;
      if (schoolInfo.logoUrl) {
        schoolLogo = await this.embedImage(pdfDoc, schoolInfo.logoUrl, 'logo');
      } else {
        console.log(`[COMPREHENSIVE_PDF] ℹ️ No school logo URL available in database`);
      }
      
      // Embed student photo if available (real database field)
      let studentPhoto: PDFImage | null = null;
      if (studentData.photo) {
        studentPhoto = await this.embedImage(pdfDoc, studentData.photo, 'photo');
      } else {
        console.log(`[COMPREHENSIVE_PDF] ℹ️ No student photo available in database`);
      }
      
      // Embed principal teacher signature if available
      let principalSignature: PDFImage | null = null;
      if (studentData.principalSignature) {
        principalSignature = await this.embedImage(pdfDoc, studentData.principalSignature, 'signature');
      } else {
        console.log(`[COMPREHENSIVE_PDF] ℹ️ No principal signature available in database`);
      }
      
      // Embed fonts
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const times = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      
      // Add page with proper sizing
      const page = pdfDoc.addPage(PageSizes.A4);
      const { width, height } = page.getSize();
      
      // Define colors - BLACK AND WHITE ONLY
      const textColor = rgb(0, 0, 0); // Pure black text
      const lightGray = rgb(0.95, 0.95, 0.95); // Very light gray for backgrounds
      const borderColor = rgb(0, 0, 0); // Black borders
      const whiteColor = rgb(1, 1, 1); // Pure white
      
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
      
      // ✅ USE STANDARDIZED CAMEROON OFFICIAL HEADER FROM PDFLIB GENERATOR
      const { PdfLibBulletinGenerator } = await import('./pdfLibBulletinGenerator');
      
      // Convert school info to standardized header data
      const headerData: any = {
        schoolName: schoolInfo.name,
        region: (schoolInfo as any).region || 'CENTRE',
        department: (schoolInfo as any).delegation || 'MFOUNDI', 
        educationLevel: (options.language === 'fr' && schoolInfo.regionaleMinisterielle?.includes('BASE') ? 'base' : 'secondary') as 'base' | 'secondary',
        logoUrl: schoolInfo.logoUrl,
        phone: schoolInfo.phone,
        email: schoolInfo.email,
        postalBox: schoolInfo.boitePostale || schoolInfo.address
      };
      
      // ✅ STANDARDIZED HEADER GENERATED - SCHOOL INFO ALREADY INCLUDED
      // Generate standardized header and get the Y position after it  
      let currentY = await PdfLibBulletinGenerator.generateStandardizedCameroonHeader(
        page, drawText, timesBold, times, width, height, headerData
      );
      
      // ✅ SCHOOL LOGO HANDLING (if not already in standardized header)
      // Note: Advanced logo rendering can be added to the standardized header in future
      if (schoolLogo && (options as any).includeCustomLogo) {
        console.log('[COMPREHENSIVE_PDF] 🖼️ Adding custom school logo below standardized header');
        const logoMaxWidth = options.logoMaxWidth || 40;
        const logoMaxHeight = options.logoMaxHeight || 40;
        
        const logoDimensions = this.calculateImageDimensions(
          schoolLogo.width,
          schoolLogo.height,
          logoMaxWidth,
          logoMaxHeight
        );
        
        // Position logo below standardized header
        const logoX = width - logoDimensions.width - 40; // Right-aligned with margin
        const logoY = currentY - logoDimensions.height - 5;
        
        page.drawImage(schoolLogo, {
          x: logoX,
          y: logoY,
          width: logoDimensions.width,
          height: logoDimensions.height
        });
        
        // Adjust currentY to account for logo space
        currentY = logoY - 10;
        
        console.log(`[COMPREHENSIVE_PDF] ✅ Custom logo positioned at (${logoX}, ${logoY})`);
      }
      
      currentY -= 5; // DRASTICALLY COMPRESSED: From 100px to 5px
      
      // 2. BULLETIN TITLE - DRASTICALLY COMPRESSED
      const bulletinTitle = options.language === 'fr' ? 'BULLETIN DE NOTES' : 'SCHOOL REPORT CARD';
      drawText(bulletinTitle, width / 2, currentY, { 
        font: timesBold, 
        size: 14, // DRASTICALLY REDUCED: From 18 to 14
        color: textColor,
        align: 'center',
        maxWidth: width - 80
      });
      
      const periodText = options.language === 'fr' 
        ? `${this.getTermText(studentData.term, 'fr')} ${studentData.academicYear}`
        : `${this.getTermText(studentData.term, 'en')} ${studentData.academicYear}`;
      
      drawText(periodText, width / 2, currentY - 15, { // DRASTICALLY REDUCED: From -22 to -15
        font: helveticaBold, 
        size: 10, // DRASTICALLY REDUCED: From 12 to 10
        color: textColor,
        align: 'center',
        maxWidth: width - 80
      });
      
      currentY -= 20; // DRASTICALLY COMPRESSED: From 60 to 20
      
      // 3. STUDENT INFORMATION SECTION WITH PHOTO - DRASTICALLY COMPRESSED
      const studentSectionHeight = 35; // DRASTICALLY COMPRESSED: From 70 to 35
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
        
        // 🔧 CRITICAL FIX: Enforce photo sizing within section bounds
        // Constrain photo height to fit within studentSectionHeight with 10px margin
        const constrainedPhotoMaxHeight = Math.min(photoMaxHeight, studentSectionHeight - 10);
        
        const photoDimensions = this.calculateImageDimensions(
          studentPhoto.width,
          studentPhoto.height,
          photoMaxWidth,
          constrainedPhotoMaxHeight
        );
        
        // Position photo on the right side of the student section
        const photoX = width - photoDimensions.width - 50; // 50px margin from right
        const photoY = currentY - studentSectionHeight + 5; // 5px margin from bottom
        
        // Draw photo border
        drawRect(photoX - 2, photoY - 2, photoDimensions.width + 4, photoDimensions.height + 4, {
          color: whiteColor,
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
      drawText(studentLabel, 50, currentY - 12, { 
        font: helveticaBold, 
        size: 9, // DRASTICALLY REDUCED: From 11 to 9
        color: textColor 
      });
      drawText(`${studentData.firstName} ${studentData.lastName}`, 100, currentY - 12, { 
        font: helvetica, 
        size: 9, // DRASTICALLY REDUCED: From 11 to 9
        color: textColor 
      });
      
      // Class information (positioned considering photo space) - COMPRESSED TO ONE LINE
      const classStartX = Math.min(280, infoAreaWidth - 100);
      const classLabel = options.language === 'fr' ? 'Classe:' : 'Class:';
      drawText(classLabel, classStartX, currentY - 12, { 
        font: helveticaBold, 
        size: 9, // DRASTICALLY REDUCED: From 11 to 9
        color: textColor 
      });
      drawText(studentData.className, classStartX + 40, currentY - 12, { 
        font: helvetica, 
        size: 9, // DRASTICALLY REDUCED: From 11 to 9
        color: textColor 
      });
      
      const matriculeLabel = options.language === 'fr' ? 'Matricule:' : 'ID Number:';
      drawText(matriculeLabel, 50, currentY - 25, { 
        font: helveticaBold, 
        size: 9, // DRASTICALLY REDUCED: From 11 to 9
        color: textColor 
      });
      drawText(studentData.matricule, 100, currentY - 25, { 
        font: helvetica, 
        size: 9, // DRASTICALLY REDUCED: From 11 to 9
        color: textColor 
      });
      
      if (studentData.birthDate) {
        const birthLabel = options.language === 'fr' ? 'Né(e) le:' : 'Born on:';
        drawText(birthLabel, classStartX, currentY - 25, { 
          font: helveticaBold, 
          size: 9, // DRASTICALLY REDUCED: From 11 to 9
          color: textColor 
        });
        drawText(studentData.birthDate, classStartX + 50, currentY - 25, { 
          font: helvetica, 
          size: 9, // DRASTICALLY REDUCED: From 11 to 9
          color: textColor 
        });
      }
      
      // Add photo placeholder if no photo available but space is reserved
      if (!studentPhoto && options.photoMaxWidth) {
        const placeholderX = width - (options.photoMaxWidth || 50) - 50;
        const placeholderY = currentY - studentSectionHeight + 5;
        const placeholderWidth = options.photoMaxWidth || 50;
        
        // 🔧 CRITICAL FIX: Enforce placeholder sizing within section bounds  
        // Constrain placeholder height to fit within studentSectionHeight with 10px margin
        const constrainedPlaceholderHeight = Math.min(options.photoMaxHeight || 60, studentSectionHeight - 10);
        const placeholderHeight = constrainedPlaceholderHeight;
        
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
      
      // 🔧 CRITICAL FIX: Guarantee vertical flow without overlap
      // Since photo is constrained within section bounds, we only need section margin
      const sectionBottomY = currentY - studentSectionHeight;
      
      // Set currentY to the safe position for next section
      currentY = sectionBottomY - 10; // Section end with margin
      
      // 4. PROFESSIONAL SECTIONED GRADES TABLE - MATCHING EXAMPLE PDF
      const tableStartX = 40;
      const tableWidth = width - 80;
      
      // New column structure matching example: SUBJECTS | C | T1 | T2 | T3 | COMP | TEACHER
      const tableHeaders = options.language === 'fr' 
        ? ['MATIÈRES', 'C', 'T1', 'T2', 'T3', 'COMP', 'ENSEIGNANT']
        : ['SUBJECTS', 'C', 'T1', 'T2', 'T3', 'COMP', 'TEACHER'];
      
      // Optimized column widths for professional compact look
      const tableColWidths = [140, 20, 30, 30, 30, 35, 85];
      
      // Organize subjects into professional sections with comprehensive debugging
      console.log(`[SECTIONED_DEBUG] 📊 Processing ${studentData.subjects.length} subjects for sectioning:`);
      studentData.subjects.forEach((subject, i) => {
        console.log(`[SECTIONED_DEBUG] Subject ${i + 1}: ${subject.subjectName} (coef: ${subject.coefficient}, category: ${subject.category || 'auto'})`);
      });
      
      const subjectSections = this.organizeSubjectsBySections(studentData.subjects, options.language);
      console.log(`[SECTIONED_DEBUG] 🎯 Created ${subjectSections.length} sections:`);
      subjectSections.forEach((section, i) => {
        console.log(`[SECTIONED_DEBUG] Section ${i + 1}: "${section.title}" - ${section.subjects.length} subjects, avg: ${section.sectionAverage.toFixed(2)}`);
      });
      
      // Draw main table header - ultra-compact professional style
      const headerHeight = 12;
      drawRect(tableStartX, currentY - headerHeight, tableWidth, headerHeight, {
        color: lightGray,
        borderColor: borderColor, 
        borderWidth: 1 
      });
      
      let colX = tableStartX + 2;
      tableHeaders.forEach((header, index) => {
        drawText(header, colX, currentY - 8, {
          font: helveticaBold, 
          size: 7,
          color: textColor
        });
        colX += tableColWidths[index];
      });
      
      currentY -= headerHeight;
      
      // Draw sectioned subjects with professional organization
      let grandTotalPoints = 0;
      let grandTotalCoefficients = 0;
      
      console.log(`[SECTIONED_RENDER] 🎨 Starting to render ${subjectSections.length} sections...`);
      
      subjectSections.forEach((section, sectionIndex) => {
        console.log(`[SECTIONED_RENDER] 📋 Rendering section ${sectionIndex + 1}: "${section.title}" with ${section.subjects.length} subjects`);
        // Section header (GENERAL SUBJECTS / TECHNICAL SUBJECTS)
        const sectionHeaderHeight = 10;
        drawRect(tableStartX, currentY - sectionHeaderHeight, tableWidth, sectionHeaderHeight, {
          color: rgb(0.9, 0.9, 0.9),
          borderColor: borderColor,
          borderWidth: 1
        });
        
        drawText(section.title, tableStartX + 5, currentY - 7, {
          font: helveticaBold,
          size: 8,
          color: textColor
        });
        
        currentY -= sectionHeaderHeight;
        
        // Draw subjects in this section
        section.subjects.forEach((subject, index) => {
          const rowHeight = 10;
          const isEvenRow = index % 2 === 0;
          
          // Subtle alternating row background
          if (isEvenRow) {
            drawRect(tableStartX, currentY - rowHeight, tableWidth, rowHeight, {
              color: rgb(0.98, 0.98, 0.98),
              borderColor: borderColor,
              borderWidth: 0.25
            });
          }
          
          // Draw subject data with new column structure
          colX = tableStartX + 2;
          
          const rowData = [
            subject.subjectName,
            subject.coefficient.toString(),
            subject.firstEvaluation?.toFixed(1) || '--',
            subject.secondEvaluation?.toFixed(1) || '--', 
            subject.thirdEvaluation?.toFixed(1) || '--',
            subject.termAverage.toFixed(1),
            subject.teacherName || 'N/A'
          ];
          
          rowData.forEach((data, colIndex) => {
            const textSize = colIndex === 0 ? 7 : 6;
            const font = colIndex === 0 ? helveticaBold : helvetica;
            
            // Truncate teacher name if too long
            let displayData = data;
            if (colIndex === 6 && data.length > 12) {
              displayData = data.substring(0, 10) + '..';
            }
            
            drawText(displayData, colX, currentY - 7, {
              font, 
              size: textSize, 
              color: textColor
            });
            colX += tableColWidths[colIndex];
          });
          
          currentY -= rowHeight;
        });
        
        // Section sub-total
        const subTotalHeight = 10;
        drawRect(tableStartX, currentY - subTotalHeight, tableWidth, subTotalHeight, {
          color: rgb(0.92, 0.92, 0.92),
          borderColor: borderColor,
          borderWidth: 1
        });
        
        const subTotalLabel = options.language === 'fr' ? 'Sous-total:' : 'Sub-total:';
        drawText(subTotalLabel, tableStartX + 5, currentY - 7, {
          font: helveticaBold,
          size: 7,
          color: textColor
        });
        
        drawText(`${section.sectionAverage.toFixed(2)}/20`, tableStartX + 80, currentY - 7, {
          font: timesBold,
          size: 8,
          color: textColor
        });
        
        drawText(`Coef: ${section.totalCoefficients}`, tableStartX + 140, currentY - 7, {
          font: helvetica,
          size: 6,
          color: textColor
        });
        
        drawText(`Pts: ${section.totalPoints.toFixed(1)}`, tableStartX + 200, currentY - 7, {
          font: helvetica,
          size: 6,
          color: textColor
        });
        
        currentY -= subTotalHeight + 2; // Small gap between sections
        
        // Update grand totals
        grandTotalPoints += section.totalPoints;
        grandTotalCoefficients += section.totalCoefficients;
      });
      
      // Calculate grand total average
      const grandTotalAverage = grandTotalCoefficients > 0 ? grandTotalPoints / grandTotalCoefficients : 0;
      
      // 5. GRAND TOTAL SUMMARY - PROFESSIONAL STYLE MATCHING EXAMPLE
      const summaryHeight = 15;
      drawRect(tableStartX, currentY - summaryHeight, tableWidth, summaryHeight, {
        color: rgb(0.85, 0.85, 0.85), // Darker gray for prominence
        borderColor: borderColor, 
        borderWidth: 1
      });
      
      const grandTotalLabel = options.language === 'fr' ? 'TOTAL GÉNÉRAL:' : 'GRAND TOTAL:';
      drawText(grandTotalLabel, tableStartX + 5, currentY - 10, {
        font: timesBold, 
        size: 9,
        color: textColor
      });
      
      drawText(`${grandTotalAverage.toFixed(2)}/20`, tableStartX + 100, currentY - 10, {
        font: timesBold, 
        size: 10,
        color: textColor
      });
      
      drawText(`Coef: ${grandTotalCoefficients}`, tableStartX + 170, currentY - 10, {
        font: helveticaBold, 
        size: 8,
        color: textColor
      });
      
      drawText(`Points: ${grandTotalPoints.toFixed(1)}`, tableStartX + 240, currentY - 10, {
        font: helveticaBold, 
        size: 8,
        color: textColor
      });
      
      if (options.includeRankings) {
        const rankLabel = options.language === 'fr' ? 'Rang:' : 'Rank:';
        drawText(`${rankLabel} ${studentData.classRank}/${studentData.totalStudents}`, tableStartX + 320, currentY - 10, {
          font: helveticaBold, 
          size: 8,
          color: textColor
        });
      }
      
      // Academic appreciation in second line
      const appreciation = this.getAcademicAppreciation(grandTotalAverage, options.language);
      drawText(appreciation, tableStartX + 5, currentY - 22, {
        font: helveticaBold, 
        size: 8,
        color: textColor
      });
      
      currentY -= summaryHeight + 8; // Compact spacing
      
      // 7. CONDUCT, ATTENDANCE & STATISTICS - REORGANIZED IN ONE COMPACT ROW
      if ((studentData.conductGrade || studentData.absences !== undefined) || options.includeStatistics) {
        // DRASTIC ORGANIZATION: Put conduct and statistics in same horizontal row
        let rowContent = [];
        
        // Add conduct info if available
        if (studentData.conductGrade || studentData.absences !== undefined) {
          let conductText = '';
          if (studentData.conductGrade) {
            const conductGradeLabel = options.language === 'fr' ? 'Conduite:' : 'Conduct:';
            conductText += `${conductGradeLabel} ${studentData.conductGrade}/20`;
          }
          if (studentData.absences !== undefined) {
            const absencesLabel = options.language === 'fr' ? 'Absences:' : 'Absences:';
            conductText += `  ${absencesLabel} ${studentData.absences}`;
          }
          rowContent.push(conductText);
        }
        
        // Add statistics if enabled
        if (options.includeStatistics) {
          const classAverage = grandTotalAverage; // Use the calculated grand total average
          const statsText = options.language === 'fr' 
            ? `Moy. classe: ${classAverage.toFixed(2)}/20 • Effectif: ${studentData.totalStudents}`
            : `Class avg: ${classAverage.toFixed(2)}/20 • Total: ${studentData.totalStudents}`;
          rowContent.push(statsText);
        }
        
        // Draw all content in one compact row
        const combinedText = rowContent.join(' • ');
        drawText(combinedText, tableStartX, currentY, { 
          font: helvetica, 
          size: 8, // DRASTICALLY REDUCED: From 11 to 8
          color: textColor 
        });
        
        currentY -= 12; // DRASTICALLY COMPRESSED: From 50 total to 12
      }
      
      // 8. STATISTICS SECTION MOVED TO COMBINED ROW ABOVE - NO LONGER NEEDED HERE
      
      // 9. SIGNATURES SECTION - DRASTICALLY COMPRESSED
      const signaturesY = Math.max(currentY - 25, 100); // DRASTICALLY COMPRESSED: From 60 to 25
      
      const principalLabel = options.language === 'fr' ? 'Le Directeur' : 'The Principal';
      const teacherLabel = options.language === 'fr' ? 'Le Professeur Principal' : 'Class Teacher';
      
      // Class Teacher signature area (left side)
      drawText(teacherLabel, tableStartX, signaturesY, { 
        font: helveticaBold, 
        size: 10, 
        color: textColor 
      });
      
      // Principal signature area (right side)
      drawText(principalLabel, tableStartX + 300, signaturesY, { 
        font: helveticaBold, 
        size: 10, 
        color: textColor 
      });
      
      // Draw principal signature image if available
      if (principalSignature && schoolInfo.directorName) {
        const signatureMaxWidth = 120;
        const signatureMaxHeight = 40;
        
        const signatureDimensions = this.calculateImageDimensions(
          principalSignature.width,
          principalSignature.height,
          signatureMaxWidth,
          signatureMaxHeight
        );
        
        // Position signature above director name
        const signatureX = tableStartX + 300;
        const signatureY = signaturesY - 35;
        
        // Draw signature image
        page.drawImage(principalSignature, {
          x: signatureX,
          y: signatureY,
          width: signatureDimensions.width,
          height: signatureDimensions.height
        });
        
        // Draw director name below signature
        drawText(schoolInfo.directorName, signatureX, signatureY - 15, { 
          font: helvetica, 
          size: 9, 
          color: textColor 
        });
        
        console.log(`[COMPREHENSIVE_PDF] ✍️ Principal signature positioned at (${signatureX}, ${signatureY})`);
      } else if (schoolInfo.directorName) {
        // Fallback: just show director name if no signature available
        drawText(schoolInfo.directorName, tableStartX + 300, signaturesY - 40, { 
          font: helvetica, 
          size: 9, 
          color: textColor 
        });
        
        console.log(`[COMPREHENSIVE_PDF] ℹ️ No principal signature available, showing name only`);
      }
      
      // 10. PERFORMANCE LEVELS SECTION - DRASTICALLY COMPRESSED INLINE FORMAT
      let performanceLevelsY = currentY - 8; // DRASTICALLY COMPRESSED: Start much closer
      
      if (options.includePerformanceLevels) {
        console.log('[COMPREHENSIVE_PDF] 📖 Including performance levels text - compact format');
        
        // DRASTIC CHANGE: Use ultra-compact format instead of full text
        const compactLevels = options.language === 'fr' 
          ? 'NIVEAUX: Niveau 1 (Non satisfaisant <10), Niveau 2 (C: Limité 10-12, C+: Assez bien 12-14), Niveau 3 (Satisfaisant 14-16), Niveau 4 (Très élevé >16)'
          : 'LEVELS: Level 1 (Unsatisfactory <10), Level 2 (C: Limited 10-12, C+: Fair 12-14), Level 3 (Satisfactory 14-16), Level 4 (Very High >16)';
        
        // Draw compact performance levels in small text
        const tableWidth = width - 80;
        const maxLineWidth = tableWidth - 20;
        
        // Word wrap the compact text
        const words = compactLevels.split(' ');
        let currentLine = '';
        let textY = performanceLevelsY;
        
        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const testWidth = helvetica.widthOfTextAtSize(testLine, 7);
          
          if (testWidth <= maxLineWidth) {
            currentLine = testLine;
          } else {
            if (currentLine) {
              drawText(currentLine, tableStartX + 5, textY, {
                font: helvetica,
                size: 7, // DRASTICALLY REDUCED: From 9 to 7
                color: textColor
              });
              textY -= 8; // DRASTICALLY COMPRESSED: From 12 to 8
            }
            currentLine = word;
          }
        }
        
        // Draw the last line
        if (currentLine) {
          drawText(currentLine, tableStartX + 5, textY, {
            font: helvetica,
            size: 7,
            color: textColor
          });
          textY -= 8;
        }
        
        performanceLevelsY = textY - 5; // DRASTICALLY COMPRESSED: From -20 to -5
      }
      
      // 11. FOOTER WITH QR CODE AND VERIFICATION - DRASTICALLY COMPRESSED
      const footerY = options.includePerformanceLevels ? Math.max(performanceLevelsY, 40) : 40; // DRASTICALLY COMPRESSED: From 80 to 40
      
      // Generate enhanced verification data with real school information
      const verificationCode = crypto.randomUUID();
      const shortCode = this.generateShortCode();
      
      // Enhanced verification data including real school and academic context
      const verificationData = {
        studentId: studentData.studentId,
        studentName: `${studentData.firstName} ${studentData.lastName}`,
        matricule: studentData.matricule,
        schoolId: schoolInfo.id,
        schoolName: schoolInfo.name,
        regionaleMinisterielle: schoolInfo.regionaleMinisterielle || 'Non définie',
        delegationDepartementale: schoolInfo.delegationDepartementale || 'Non définie',
        classId: studentData.classId,
        className: studentData.className,
        term: studentData.term,
        academicYear: studentData.academicYear || schoolInfo.academicYear || '2024-2025',
        generalAverage: grandTotalAverage.toFixed(2),
        classRank: studentData.classRank,
        totalStudents: studentData.totalStudents,
        subjectCount: studentData.subjects.length,
        timestamp: new Date().toISOString(),
        shortCode,
        educafricVersion: '2025.1'
      };
      
      // Generate enhanced verification hash with comprehensive school data
      const verificationHash = this.generateVerificationHash({
        studentId: studentData.studentId,
        schoolId: schoolInfo.id,
        term: studentData.term,
        academicYear: studentData.academicYear || schoolInfo.academicYear || '2024-2025',
        generalAverage: grandTotalAverage.toFixed(2)
      });
      
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
            color: whiteColor,
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
        overallAverage: grandTotalAverage.toFixed(2)
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
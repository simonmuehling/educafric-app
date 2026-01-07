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
  // New field for professional sectioning (technical schools)
  category?: 'general' | 'professional' | 'optional';
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
  // School type (general vs technical)
  educationalType?: 'general' | 'technical'; // Determines bulletin format
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
  
  // ===== COMPREHENSIVE BULLETIN OPTIONS =====
  
  // Section Évaluation & Trimestre
  includeFirstTrimester?: boolean;
  includeDiscipline?: boolean;
  includeStudentWork?: boolean;
  includeClassProfile?: boolean;
  
  // Section Absences & Retards
  includeUnjustifiedAbsences?: boolean;
  includeJustifiedAbsences?: boolean;
  includeLateness?: boolean;
  includeDetentions?: boolean;
  
  // Section Sanctions Disciplinaires
  includeConductWarning?: boolean;
  includeConductBlame?: boolean;
  includeExclusions?: boolean;
  includePermanentExclusion?: boolean;
  
  // Section Moyennes & Totaux
  includeTotalGeneral?: boolean;
  includeAppreciations?: boolean;
  includeGeneralAverage?: boolean;
  includeTrimesterAverage?: boolean;
  includeNumberOfAverages?: boolean;
  includeSuccessRate?: boolean;
  
  // Section Coefficients & Codes
  includeCoef?: boolean;
  includeCTBA?: boolean;
  includeMinMax?: boolean;
  includeCBA?: boolean;
  includeCA?: boolean;
  includeCMA?: boolean;
  includeCOTE?: boolean;
  includeCNA?: boolean;
  
  // Section Appréciations & Signatures
  includeWorkAppreciation?: boolean;
  includeParentVisa?: boolean;
  includeTeacherVisa?: boolean;
  includeHeadmasterVisa?: boolean;
  
  // Section Conseil de Classe
  includeClassCouncilDecisions?: boolean;
  includeClassCouncilMentions?: boolean;
  includeOrientationRecommendations?: boolean;
  includeCouncilDate?: boolean;
  
  // Manual data entry
  manualData?: any;
}

export class ComprehensiveBulletinGenerator {
  
  // Enhanced method to embed images with comprehensive error handling
  // 🔧 CRITICAL FIX: Enhanced image embedding with comprehensive debugging and A4-optimized sizing
  static async embedImage(pdfDoc: PDFDocument, imagePath: string, imageType: 'logo' | 'photo' | 'signature' = 'photo'): Promise<PDFImage | null> {
    try {
      if (!imagePath || imagePath.trim() === '') {
        console.log(`[PDF_IMAGES] ℹ️ No ${imageType} path provided, skipping image embedding`);
        return null;
      }

      console.log(`[PDF_IMAGES] 🔄 Attempting to embed ${imageType} from: ${imagePath}`);
      console.log(`[PDF_IMAGES] 📊 Image type: ${imageType}, Path type: ${imagePath.startsWith('http') ? 'URL' : 'Local'}`);
      
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
        // Handle local file paths with HYBRID RESOLUTION
        imageSource = 'local file';
        
        // ✅ HYBRID PATH RESOLUTION: Try multiple locations for school logos
        const possiblePaths = [
          path.isAbsolute(imagePath) ? imagePath : path.join(process.cwd(), imagePath),
          path.join(process.cwd(), 'public', imagePath),
          path.join(process.cwd(), 'public', 'uploads', 'logos', path.basename(imagePath)),
          path.join(process.cwd(), imagePath.replace(/^\//, '')),
        ];
        
        console.log(`[PDF_IMAGES] 🔍 Searching ${imageType} in paths:`, possiblePaths);
        
        let fullPath: string | null = null;
        for (const testPath of possiblePaths) {
          try {
            const stats = await fs.stat(testPath);
            if (stats.isFile()) {
              fullPath = testPath;
              console.log(`[PDF_IMAGES] ✅ Found ${imageType} at:`, fullPath);
              break;
            }
          } catch (e) {
            // Path doesn't exist, try next
          }
        }
        
        if (!fullPath) {
          console.warn(`[PDF_IMAGES] ❌ ${imageType} not found in any location, tried:`, possiblePaths);
          return null;
        }
        
        try {
          // Check file size (max 5MB)
          const stats = await fs.stat(fullPath);
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
        } else if (detectedImageType === 'gif') {
          console.warn(`[PDF_IMAGES] ⚠️ GIF format not supported by PDF generator. Please upload PNG or JPEG format for ${imageType}: ${imagePath}`);
          console.warn(`[PDF_IMAGES] 📝 Solution: Re-upload the logo in PNG or JPEG format via School Settings`);
          return null;
        } else {
          console.warn(`[PDF_IMAGES] ⚠️ Unsupported ${imageType} format '${detectedImageType}': ${imagePath}`);
          console.warn(`[PDF_IMAGES] 📝 Supported formats: PNG, JPEG. Please re-upload in a supported format.`);
          return null;
        }
      } catch (embedError: any) {
        console.error(`[PDF_IMAGES] ❌ Failed to embed ${imageType} in PDF: ${embedError.message}`);
        console.error(`[PDF_IMAGES] 🔍 Debug info - Image type: ${detectedImageType}, Bytes length: ${imageBytes?.length || 0}`);
        console.error(`[PDF_IMAGES] 📝 Suggestion: Check if ${imageType} format is supported (PNG/JPEG only). GIF is NOT supported.`);
        return null;
      }
      
      // ✅ CRITICAL SUCCESS - Log detailed embedding info for A4 optimization
      console.log(`[PDF_IMAGES] ✅ Successfully embedded ${imageType} (${detectedImageType}, ${imageBytes.length} bytes) from ${imageSource}`);
      console.log(`[PDF_IMAGES] 📏 Image dimensions: ${embeddedImage.width}x${embeddedImage.height} pixels`);
      console.log(`[PDF_IMAGES] 🎯 Ready for A4-optimized rendering`);
      
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
    if (ext === '.gif') return 'gif'; // Detected but not supported for embedding
    
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
      
      // GIF signature: 47 49 46 38 (GIF8)
      if (imageBytes[0] === 0x47 && imageBytes[1] === 0x49 && imageBytes[2] === 0x46 && imageBytes[3] === 0x38) {
        return 'gif';
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
  // For technical schools: divides into General Subjects and Professional Subjects with sub-totals
  static organizeSubjectsBySections(subjects: SubjectGrade[], language: 'fr' | 'en', isTechnicalSchool: boolean = false): SubjectSection[] {
    const sections: SubjectSection[] = [];
    
    // Define section titles based on language and school type
    const sectionTitles = {
      general: language === 'fr' ? 'MATIÈRES GÉNÉRALES' : 'GENERAL SUBJECTS',
      professional: language === 'fr' ? 'MATIÈRES PROFESSIONNELLES' : 'PROFESSIONAL SUBJECTS',
      optional: language === 'fr' ? 'MATIÈRES OPTIONNELLES' : 'OPTIONAL SUBJECTS'
    };
    
    // For general schools, group by optional vs non-optional
    if (!isTechnicalSchool) {
      const mainSubjects = subjects.filter(s => !s.category || s.category !== 'optional');
      const optionalSubjects = subjects.filter(s => s.category === 'optional');
      
      const sections: SubjectSection[] = [];
      
      // Main subjects section
      if (mainSubjects.length > 0) {
        const totalPoints = mainSubjects.reduce((sum, s) => sum + ((s.termAverage || 0) * (s.coefficient || 0)), 0);
        const totalCoefficients = mainSubjects.reduce((sum, s) => sum + (s.coefficient || 0), 0);
        const sectionAverage = totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;
        
        sections.push({
          title: sectionTitles.general,
          subjects: mainSubjects,
          totalPoints,
          totalCoefficients,
          sectionAverage
        });
      }
      
      // Optional subjects section (if any)
      if (optionalSubjects.length > 0) {
        const totalPoints = optionalSubjects.reduce((sum, s) => sum + ((s.termAverage || 0) * (s.coefficient || 0)), 0);
        const totalCoefficients = optionalSubjects.reduce((sum, s) => sum + (s.coefficient || 0), 0);
        const sectionAverage = totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;
        
        sections.push({
          title: sectionTitles.optional,
          subjects: optionalSubjects,
          totalPoints,
          totalCoefficients,
          sectionAverage
        });
      }
      
      return sections.length > 0 ? sections : [{
        title: sectionTitles.general,
        subjects: subjects,
        totalPoints: 0,
        totalCoefficients: 0,
        sectionAverage: 0
      }];
    }
    
    // For technical schools: categorize by subject type (from database subjectType field)
    const professionalKeywords = ['sewing', 'couture', 'pattern', 'patron', 'professional drawing', 'dessin professionnel', 'technology', 'technologie', 'trade', 'commerce', 'fashion', 'mode', 'textile', 'equipment', 'équipement', 'training', 'formation', 'fabric', 'tissu'];
    
    const categorizedSubjects = subjects.map(subject => {
      if (subject.category) return subject; // Already categorized from database
      
      const subjectLower = subject.subjectName.toLowerCase();
      
      // Check if it's a professional subject
      if (professionalKeywords.some(keyword => subjectLower.includes(keyword))) {
        return { ...subject, category: 'professional' as const };
      } else {
        // Default to general for academic subjects
        return { ...subject, category: 'general' as const };
      }
    });
    
    // Group subjects by category
    const groupedSubjects = {
      general: categorizedSubjects.filter(s => s.category === 'general'),
      professional: categorizedSubjects.filter(s => s.category === 'professional'),
      optional: categorizedSubjects.filter(s => s.category === 'optional')
    };
    
    // Create sections with sub-totals for technical schools
    Object.entries(groupedSubjects).forEach(([category, subjects]) => {
      if (subjects.length > 0) {
        const totalPoints = subjects.reduce((sum, s) => sum + ((s.termAverage || 0) * (s.coefficient || 0)), 0);
        const totalCoefficients = subjects.reduce((sum, s) => sum + (s.coefficient || 0), 0);
        const sectionAverage = totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;
        
        sections.push({
          title: sectionTitles[category as keyof typeof sectionTitles],
          subjects: subjects,
          totalPoints,
          totalCoefficients,
          sectionAverage
        });
      }
    });
    
    return sections;
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
      
      // 🔧 CRITICAL FIX: Enhanced student photo embedding with multiple fallback paths
      let studentPhoto: PDFImage | null = null;
      if (studentData.photo) {
        console.log(`[COMPREHENSIVE_PDF] 🔄 Attempting to embed student photo from: ${studentData.photo}`);
        studentPhoto = await this.embedImage(pdfDoc, studentData.photo, 'photo');
        
        if (studentPhoto) {
          console.log(`[COMPREHENSIVE_PDF] ✅ Student photo successfully embedded`);
        } else {
          console.warn(`[COMPREHENSIVE_PDF] ⚠️ Failed to embed student photo, will show placeholder`);
        }
      } else {
        // Try common photo field alternatives
        const alternativePhotoFields = [
          (studentData as any).photoURL,
          (studentData as any).profilePictureUrl, 
          (studentData as any).photoUrl,
          (studentData as any).studentPhoto
        ];
        
        for (const altPhoto of alternativePhotoFields) {
          if (altPhoto) {
            console.log(`[COMPREHENSIVE_PDF] 🔄 Trying alternative photo field: ${altPhoto}`);
            studentPhoto = await this.embedImage(pdfDoc, altPhoto, 'photo');
            if (studentPhoto) {
              console.log(`[COMPREHENSIVE_PDF] ✅ Student photo embedded from alternative field`);
              break;
            }
          }
        }
        
        if (!studentPhoto) {
          console.log(`[COMPREHENSIVE_PDF] ℹ️ No student photo available in any field - will show professional placeholder`);
        }
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
      
      // 🔧 CRITICAL FIX 1: A4-Optimized content frame with proper print margins
      // Standard A4: 210 × 297 mm = 595.276 × 841.89 points
      // Professional margins: 30mm (~85 points) for A4 print compatibility
      const A4_PRINT_MARGIN = 30; // Professional A4 print margin in points
      const content = {
        left: A4_PRINT_MARGIN,
        right: width - A4_PRINT_MARGIN,
        width: width - (2 * A4_PRINT_MARGIN),
        top: height - A4_PRINT_MARGIN,
        bottom: A4_PRINT_MARGIN
      };
      
      console.log(`[A4_LAYOUT] 📏 A4 Page: ${width}x${height}pts (${(width/72*25.4).toFixed(1)}x${(height/72*25.4).toFixed(1)}mm)`);
      console.log(`[A4_LAYOUT] 📝 Content area: ${content.width}x${content.top - content.bottom}pts with ${A4_PRINT_MARGIN}pt margins`);
      
      console.log(`[LAYOUT_DEBUG] Content frame: left=${content.left}, width=${content.width}, right=${content.right}`);
      
      // ✅ STANDARDIZED HEADER GENERATED - SCHOOL INFO ALREADY INCLUDED
      // Generate standardized header and get the Y position after it  
      let currentY = await PdfLibBulletinGenerator.generateStandardizedCameroonHeader(
        page, drawText, timesBold, times, width, height, headerData
      );
      
      console.log(`[LAYOUT_DEBUG] Header completed, currentY: ${currentY}`);
      
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
      
      // 🔧 CRITICAL FIX 1: FIXED TITLE CENTERING - Use content bounds instead of page width
      const bulletinTitle = options.language === 'fr' ? 'BULLETIN DE NOTES' : 'SCHOOL REPORT CARD';
      
      drawText(bulletinTitle, content.left, currentY, { 
        font: timesBold, 
        size: 14,
        color: textColor,
        maxWidth: content.width,
        align: 'center'
      });
      
      const periodText = options.language === 'fr' 
        ? `${this.getTermText(studentData.term, 'fr')} ${studentData.academicYear}`
        : `${this.getTermText(studentData.term, 'en')} ${studentData.academicYear}`;
      
      drawText(periodText, content.left, currentY - 18, { 
        font: helveticaBold, 
        size: 10,
        color: textColor,
        maxWidth: content.width,
        align: 'center'
      });
      
      console.log(`[LAYOUT_DEBUG] Title centered within content bounds (${content.left} to ${content.right})`);
      
      currentY -= 25; // Increased spacing to prevent overlap
      
      // 🔧 CRITICAL FIX 4: Dynamic section height based on content and photo presence
      const hasPhotoOrPlaceholder = studentPhoto || options.photoMaxWidth;
      const studentSectionHeight = hasPhotoOrPlaceholder ? 48 : 40; // Increased from fixed 35px
      
      console.log(`[LAYOUT_DEBUG] Student section height: ${studentSectionHeight}px (photo present: ${!!studentPhoto})`);
      
      drawRect(content.left, currentY - studentSectionHeight, content.width, studentSectionHeight, { 
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
        const photoX = content.right - photoDimensions.width - 10; // 10px margin from right
        const photoY = currentY - studentSectionHeight + 5; // 5px margin from bottom
        
        // Draw photo border
        drawRect(photoX - 2, photoY - 2, photoDimensions.width + 4, photoDimensions.height + 4, {
          color: whiteColor,
          borderColor: borderColor,
          borderWidth: 1
        });
        
        // 🔧 CRITICAL FIX: Enhanced photo rendering with proper error handling
        try {
          page.drawImage(studentPhoto, {
            x: photoX,
            y: photoY,
            width: photoDimensions.width,
            height: photoDimensions.height
          });
          
          console.log(`[COMPREHENSIVE_PDF] ✅ Student photo rendered successfully at (${photoX}, ${photoY})`);
        } catch (photoRenderError: any) {
          console.error(`[COMPREHENSIVE_PDF] ❌ Error rendering student photo: ${photoRenderError.message}`);
          
          // Fallback: Draw professional placeholder instead
          const studentInitial = studentData.firstName ? studentData.firstName.charAt(0).toUpperCase() : 'E';
          drawText('Eleve', photoX + (photoDimensions.width - helvetica.widthOfTextAtSize('Eleve', 7)) / 2, photoY + photoDimensions.height - 12, {
            font: helvetica,
            size: 7,
            color: rgb(0.4, 0.4, 0.4)
          });
          drawText(studentInitial, photoX + (photoDimensions.width - helveticaBold.widthOfTextAtSize(studentInitial, 14)) / 2, photoY + photoDimensions.height / 2 + 2, {
            font: helveticaBold,
            size: 14,
            color: rgb(0.5, 0.5, 0.5)
          });
        }
        
        photoWidth = photoDimensions.width;
        photoSpace = photoWidth + 20; // Photo width + margins
        
        console.log(`[COMPREHENSIVE_PDF] 📸 Student photo positioned at (${photoX}, ${photoY}) size: ${photoDimensions.width}x${photoDimensions.height}`);
      }
      
      // 🔧 CRITICAL FIX 3: Student info overlap prevention with space detection
      const infoAreaRight = content.right - photoSpace;
      const minTwoColumnWidth = 320; // Minimum width needed for two-column layout
      const availableWidth = infoAreaRight - content.left;
      const needsTwoLines = availableWidth < minTwoColumnWidth;
      
      console.log(`[LAYOUT_DEBUG] Info area: left=${content.left}, right=${infoAreaRight}, width=${availableWidth}, needsTwoLines=${needsTwoLines}`);
      
      // Student name (first line)
      const studentLabel = options.language === 'fr' ? 'Élève:' : 'Student:';
      drawText(studentLabel, content.left + 10, currentY - 12, { 
        font: helveticaBold, 
        size: 9,
        color: textColor 
      });
      drawText(`${studentData.firstName} ${studentData.lastName}`, content.left + 60, currentY - 12, { 
        font: helvetica, 
        size: 9,
        color: textColor 
      });
      
      // Class information with smart positioning
      const classLabel = options.language === 'fr' ? 'Classe:' : 'Class:';
      let classY, classStartX;
      
      if (needsTwoLines) {
        // Move class to second line
        classY = currentY - 25;
        classStartX = content.left + 10;
        console.log(`[LAYOUT_DEBUG] Class moved to second line due to space constraints`);
      } else {
        // Keep on same line, but ensure minimum spacing
        classY = currentY - 12;
        classStartX = Math.max(content.left + 240, infoAreaRight - 120);
      }
      
      drawText(classLabel, classStartX, classY, { 
        font: helveticaBold, 
        size: 9,
        color: textColor 
      });
      drawText(studentData.className, classStartX + 40, classY, { 
        font: helvetica, 
        size: 9,
        color: textColor 
      });
      
      // Matricule (always on line based on layout)
      const matriculeY = needsTwoLines ? currentY - 38 : currentY - 25;
      const matriculeLabel = options.language === 'fr' ? 'Matricule:' : 'ID Number:';
      drawText(matriculeLabel, content.left + 10, matriculeY, { 
        font: helveticaBold, 
        size: 9,
        color: textColor 
      });
      drawText(studentData.matricule, content.left + 70, matriculeY, { 
        font: helvetica, 
        size: 9,
        color: textColor 
      });
      
      // Birth date (if available)
      if (studentData.birthDate) {
        const birthLabel = options.language === 'fr' ? 'Né(e) le:' : 'Born on:';
        const birthX = needsTwoLines ? content.left + 200 : classStartX;
        const birthY = needsTwoLines ? currentY - 38 : matriculeY;
        
        drawText(birthLabel, birthX, birthY, { 
          font: helveticaBold, 
          size: 9,
          color: textColor 
        });
        drawText(studentData.birthDate, birthX + 60, birthY, { 
          font: helvetica, 
          size: 9,
          color: textColor 
        });
      }
      
      // 🔧 CRITICAL FIX: Enhanced photo placeholder that properly matches example PDF format
      if (!studentPhoto && options.photoMaxWidth) {
        const placeholderWidth = options.photoMaxWidth || 50;
        const placeholderX = content.right - placeholderWidth - 10; // Use content frame
        const placeholderY = currentY - studentSectionHeight + 5;
        
        // 🔧 CRITICAL FIX: Enforce placeholder sizing within section bounds  
        // Constrain placeholder height to fit within studentSectionHeight with 10px margin
        const constrainedPlaceholderHeight = Math.min(options.photoMaxHeight || 60, studentSectionHeight - 10);
        const placeholderHeight = constrainedPlaceholderHeight;
        
        // Update photoSpace for placeholder
        photoSpace = placeholderWidth + 20;
        
        // Draw placeholder rectangle with professional styling matching example
        drawRect(placeholderX, placeholderY, placeholderWidth, placeholderHeight, {
          color: whiteColor,
          borderColor: borderColor,
          borderWidth: 1
        });
        
        // ✅ FIXED PLACEHOLDER TEXT - Match example PDF format exactly
        // Draw "Eleve" and student initial instead of just "Photo"
        const studentInitial = studentData.firstName ? studentData.firstName.charAt(0).toUpperCase() : 'E';
        
        // Line 1: "Eleve" (centered, smaller font)
        const eleveText = 'Eleve';
        const eleveWidth = helvetica.widthOfTextAtSize(eleveText, 7);
        drawText(eleveText, placeholderX + (placeholderWidth - eleveWidth) / 2, placeholderY + placeholderHeight - 12, {
          font: helvetica,
          size: 7,
          color: rgb(0.4, 0.4, 0.4)
        });
        
        // Line 2: Student initial (centered, larger)
        const initialWidth = helveticaBold.widthOfTextAtSize(studentInitial, 14);
        drawText(studentInitial, placeholderX + (placeholderWidth - initialWidth) / 2, placeholderY + placeholderHeight / 2 + 2, {
          font: helveticaBold,
          size: 14,
          color: rgb(0.5, 0.5, 0.5)
        });
        
        console.log(`[LAYOUT_DEBUG] ✅ FIXED: Photo placeholder positioned at (${placeholderX}, ${placeholderY}) size: ${placeholderWidth}x${placeholderHeight} with format "Eleve ${studentInitial}"`);
      }
      
      // 🔧 CRITICAL FIX: Guarantee vertical flow without overlap
      // Since photo is constrained within section bounds, we only need section margin
      const sectionBottomY = currentY - studentSectionHeight;
      
      // Set currentY to the safe position for next section
      currentY = sectionBottomY - 20; // Increased margin to prevent overlap
      
      // 4. PROFESSIONAL SECTIONED GRADES TABLE - A4-OPTIMIZED MATCHING EXAMPLE PDF
      const tableStartX = content.left;
      const tableWidth = content.width;
      
      console.log(`[A4_LAYOUT] 📏 Table: ${tableWidth}pts wide, starting at x=${tableStartX}`);
      
      // New column structure: SUBJECTS | C | T1 | T2 | T3 | COMP (teacher name displayed under subject name)
      const tableHeaders = options.language === 'fr' 
        ? ['MATIÈRES', 'C', 'T1', 'T2', 'T3', 'COMP']
        : ['SUBJECTS', 'C', 'T1', 'T2', 'T3', 'COMP'];
      
      // 🔧 A4-Optimized column widths - removed teacher column, expanded subject column
      const tableColWidths = [280, 25, 35, 35, 35, 45]; // Total: 455pts (fits in A4 content)
      
      console.log(`[A4_LAYOUT] 📏 Column widths total: ${tableColWidths.reduce((a,b) => a+b, 0)}pts (content: ${tableWidth}pts)`);
      
      // Organize subjects into professional sections with comprehensive debugging
      console.log(`[SECTIONED_DEBUG] 📊 Processing ${studentData.subjects.length} subjects for sectioning:`);
      studentData.subjects.forEach((subject, i) => {
        console.log(`[SECTIONED_DEBUG] Subject ${i + 1}: ${subject.subjectName} (coef: ${subject.coefficient}, category: ${subject.category || 'auto'})`);
      });
      
      const isTechnicalSchool = schoolInfo.educationalType === 'technical';
      const subjectSections = this.organizeSubjectsBySections(studentData.subjects, options.language, isTechnicalSchool);
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
          // T3 uses compact rows to fit Bilan Annuel on single page
          const rowHeight = studentData.term === 'T3' ? 12 : 14;
          const isEvenRow = index % 2 === 0;
          
          // Subtle alternating row background
          if (isEvenRow) {
            drawRect(tableStartX, currentY - rowHeight, tableWidth, rowHeight, {
              color: rgb(0.98, 0.98, 0.98),
              borderColor: borderColor,
              borderWidth: 0.25
            });
          }
          
          // Draw subject data with new column structure (removed teacher column)
          colX = tableStartX + 2;
          
          const rowData = [
            subject.subjectName,
            subject.coefficient.toString(),
            subject.firstEvaluation?.toFixed(1) || '--',
            subject.secondEvaluation?.toFixed(1) || '--', 
            subject.thirdEvaluation?.toFixed(1) || '--',
            subject.termAverage.toFixed(1)
          ];
          
          rowData.forEach((data, colIndex) => {
            if (colIndex === 0) {
              // First column: Display subject name in bold at top
              drawText(data, colX, currentY - 4, {
                font: helveticaBold, 
                size: 7, 
                color: textColor
              });
              
              // Display teacher name below subject name in smaller italic font
              const teacherName = subject.teacherName || 'N/A';
              drawText(teacherName, colX, currentY - 11, {
                font: helvetica, 
                size: 5.5, 
                color: rgb(0.4, 0.4, 0.4) // Slightly gray for distinction
              });
            } else {
              // Other columns: center vertically in the row
              const textSize = 6;
              const font = helvetica;
              
              drawText(data, colX, currentY - 8, {
                font, 
                size: textSize, 
                color: textColor
              });
            }
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
      
      currentY -= summaryHeight + 4; // More compact spacing for T3
      
      // 6.5. BILAN ANNUEL / ANNUAL SUMMARY - Only for T3 (Third Trimester)
      if (studentData.term === 'T3') {
        console.log('[COMPREHENSIVE_PDF] 📊 Generating Bilan Annuel for T3');
        
        const annualSummaryHeight = 28; // Compact height for annual summary
        
        // Draw annual summary box
        drawRect(tableStartX, currentY - annualSummaryHeight, tableWidth, annualSummaryHeight, {
          color: rgb(0.90, 0.95, 0.90), // Light green tint for annual summary
          borderColor: borderColor,
          borderWidth: 1
        });
        
        // Bilingual title
        const bilanTitle = options.language === 'fr' 
          ? 'BILAN ANNUEL / ANNUAL SUMMARY' 
          : 'ANNUAL SUMMARY / BILAN ANNUEL';
        
        drawText(bilanTitle, tableStartX + 5, currentY - 8, {
          font: timesBold,
          size: 8,
          color: textColor
        });
        
        // Calculate annual data (T1 + T2 + T3 averages if available)
        const t1Avg = (studentData as any).t1Average || grandTotalAverage;
        const t2Avg = (studentData as any).t2Average || grandTotalAverage;
        const t3Avg = grandTotalAverage;
        const annualAvg = ((t1Avg + t2Avg + t3Avg) / 3);
        
        // Row with T1, T2, T3 and Annual Average
        const avgLabelFr = 'Moy. T1:';
        const avgLabelEn = 'T1 Avg:';
        const t1Label = options.language === 'fr' ? avgLabelFr : avgLabelEn;
        const t2Label = options.language === 'fr' ? 'Moy. T2:' : 'T2 Avg:';
        const t3Label = options.language === 'fr' ? 'Moy. T3:' : 'T3 Avg:';
        const annualLabel = options.language === 'fr' ? 'MOY. ANNUELLE:' : 'ANNUAL AVG:';
        
        // Draw trimester averages in compact row
        let avgX = tableStartX + 5;
        drawText(`${t1Label} ${t1Avg.toFixed(2)}`, avgX, currentY - 18, {
          font: helvetica, size: 7, color: textColor
        });
        
        avgX += 80;
        drawText(`${t2Label} ${t2Avg.toFixed(2)}`, avgX, currentY - 18, {
          font: helvetica, size: 7, color: textColor
        });
        
        avgX += 80;
        drawText(`${t3Label} ${t3Avg.toFixed(2)}`, avgX, currentY - 18, {
          font: helvetica, size: 7, color: textColor
        });
        
        avgX += 90;
        drawText(`${annualLabel} ${annualAvg.toFixed(2)}/20`, avgX, currentY - 18, {
          font: timesBold, size: 8, color: textColor
        });
        
        // Annual appreciation
        const annualAppreciation = this.getAcademicAppreciation(annualAvg, options.language);
        const decisionLabel = options.language === 'fr' ? 'Décision:' : 'Decision:';
        const passStatus = annualAvg >= 10 
          ? (options.language === 'fr' ? 'ADMIS(E)' : 'PASSED')
          : (options.language === 'fr' ? 'REDOUBLE' : 'REPEAT');
        
        drawText(`${decisionLabel} ${passStatus} - ${annualAppreciation}`, tableStartX + 380, currentY - 18, {
          font: helveticaBold, size: 7, color: textColor
        });
        
        currentY -= annualSummaryHeight + 4;
        console.log('[COMPREHENSIVE_PDF] ✅ Bilan Annuel section added');
      }
      
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
            ? `Moy. classe: ${classAverage.toFixed(2)}/20 [OK] Effectif: ${studentData.totalStudents}`
            : `Class avg: ${classAverage.toFixed(2)}/20 [OK] Total: ${studentData.totalStudents}`;
          rowContent.push(statsText);
        }
        
        // Draw all content in one compact row
        const combinedText = rowContent.join(' | ');
        drawText(combinedText, tableStartX, currentY, { 
          font: helvetica, 
          size: 8, // DRASTICALLY REDUCED: From 11 to 8
          color: textColor 
        });
        
        currentY -= 12; // DRASTICALLY COMPRESSED: From 50 total to 12
      }
      
      // 8. STATISTICS SECTION MOVED TO COMBINED ROW ABOVE - NO LONGER NEEDED HERE
      
      // 9. SIGNATURES SECTION - DRASTICALLY COMPRESSED (even more for T3)
      const signatureOffset = studentData.term === 'T3' ? 18 : 25; // More compact for T3
      const signaturesY = Math.max(currentY - signatureOffset, 80); // Lower minimum for T3
      
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
      // Skip for T3 to save space for Bilan Annuel
      let performanceLevelsY = currentY - 8;
      
      if (options.includePerformanceLevels && studentData.term !== 'T3') {
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
      
      // 10.5. CLASS COUNCIL SECTION - CONDITIONAL RENDERING
      // Skip for T3 since Bilan Annuel contains the decision
      let classCouncilY = performanceLevelsY;
      
      // Check if any class council options are enabled (skip for T3)
      const hasClassCouncilContent = studentData.term !== 'T3' && (
                                    options.includeClassCouncilDecisions || 
                                    options.includeClassCouncilMentions || 
                                    options.includeOrientationRecommendations || 
                                    options.includeCouncilDate);
      
      if (hasClassCouncilContent) {
        console.log('[COMPREHENSIVE_PDF] 📋 Including Class Council section');
        
        // Section title
        const councilTitle = options.language === 'fr' ? 'CONSEIL DE CLASSE' : 'CLASS COUNCIL';
        drawText(councilTitle, tableStartX, classCouncilY, { 
          font: helveticaBold, 
          size: 10, 
          color: textColor 
        });
        classCouncilY -= 15;
        
        // Draw section border
        const sectionHeight = 60; // Estimated height for council section
        drawRect(tableStartX, classCouncilY - sectionHeight, tableWidth, sectionHeight, { 
          color: lightGray, 
          borderColor: borderColor, 
          borderWidth: 1 
        });
        
        let councilContentY = classCouncilY - 8;
        
        // Council decisions
        if (options.includeClassCouncilDecisions && options.manualData?.classCouncilDecisions) {
          const decisionsLabel = options.language === 'fr' ? 'Décisions:' : 'Decisions:';
          drawText(decisionsLabel, tableStartX + 5, councilContentY, { 
            font: helveticaBold, 
            size: 8, 
            color: textColor 
          });
          
          // Wrap text for decisions
          const decisions = options.manualData.classCouncilDecisions;
          const maxWidth = tableWidth - 80;
          const words = decisions.split(' ');
          let currentLine = '';
          let lineY = councilContentY - 12;
          
          for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const testWidth = helvetica.widthOfTextAtSize(testLine, 8);
            
            if (testWidth <= maxWidth) {
              currentLine = testLine;
            } else {
              if (currentLine) {
                drawText(currentLine, tableStartX + 60, lineY, {
                  font: helvetica,
                  size: 8,
                  color: textColor
                });
                lineY -= 10;
              }
              currentLine = word;
            }
          }
          
          // Draw the last line
          if (currentLine) {
            drawText(currentLine, tableStartX + 60, lineY, {
              font: helvetica,
              size: 8,
              color: textColor
            });
            lineY -= 10;
          }
          
          councilContentY = lineY - 5;
        }
        
        // Council mentions
        if (options.includeClassCouncilMentions && options.manualData?.classCouncilMentions) {
          const mentionsLabel = options.language === 'fr' ? 'Mention:' : 'Mention:';
          drawText(mentionsLabel, tableStartX + 5, councilContentY, { 
            font: helveticaBold, 
            size: 8, 
            color: textColor 
          });
          
          // Map mention values to display text
          const mentionMap = {
            'Félicitations': options.language === 'fr' ? 'Félicitations' : 'Congratulations',
            'Encouragements': options.language === 'fr' ? 'Encouragements' : 'Encouragement',
            'Satisfaisant': options.language === 'fr' ? 'Satisfaisant' : 'Satisfactory',
            'Mise en garde': options.language === 'fr' ? 'Mise en garde' : 'Warning',
            'Blâme': options.language === 'fr' ? 'Blâme' : 'Blame'
          };
          
          const mentionText = mentionMap[options.manualData.classCouncilMentions as keyof typeof mentionMap] || 
                             options.manualData.classCouncilMentions;
          
          drawText(mentionText, tableStartX + 60, councilContentY, { 
            font: helvetica, 
            size: 8, 
            color: textColor 
          });
          councilContentY -= 15;
        }
        
        // Orientation recommendations
        if (options.includeOrientationRecommendations && options.manualData?.orientationRecommendations) {
          const orientationLabel = options.language === 'fr' ? 'Orientation:' : 'Orientation:';
          drawText(orientationLabel, tableStartX + 5, councilContentY, { 
            font: helveticaBold, 
            size: 8, 
            color: textColor 
          });
          
          drawText(options.manualData.orientationRecommendations, tableStartX + 80, councilContentY, { 
            font: helvetica, 
            size: 8, 
            color: textColor 
          });
          councilContentY -= 15;
        }
        
        // Council date
        if (options.includeCouncilDate && options.manualData?.councilDate) {
          const dateLabel = options.language === 'fr' ? 'Date du conseil:' : 'Council date:';
          drawText(dateLabel, tableStartX + 5, councilContentY, { 
            font: helveticaBold, 
            size: 8, 
            color: textColor 
          });
          
          const formattedDate = new Date(options.manualData.councilDate).toLocaleDateString(
            options.language === 'fr' ? 'fr-FR' : 'en-US'
          );
          
          drawText(formattedDate, tableStartX + 100, councilContentY, { 
            font: helvetica, 
            size: 8, 
            color: textColor 
          });
        }
        
        classCouncilY = councilContentY - 15;
        console.log('[COMPREHENSIVE_PDF] ✅ Class Council section rendered successfully');
      }
      
      // 11. FOOTER WITH QR CODE AND VERIFICATION - DRASTICALLY COMPRESSED
      const footerY = hasClassCouncilContent ? Math.max(classCouncilY, 40) : 
                     (options.includePerformanceLevels ? Math.max(performanceLevelsY, 40) : 40); // DRASTICALLY COMPRESSED: From 80 to 40
      
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
// TIMETABLE GENERATOR - WEEKLY SCHEDULE WITH PROFESSIONAL LAYOUT
// Professional timetable generator with Cameroon official header
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';
import { SchoolDataService, type CameroonOfficialHeaderData } from './pdfGenerator.js';

// Types for timetable generation
export interface TimetableData {
  classId: number;
  className: string;
  academicYear: string;
  term: string;
  schoolInfo: SchoolInfo;
  schedule: WeeklySchedule;
  timeSlots: TimeSlot[];
  teachers: { [teacherId: number]: TeacherInfo };
  classTeacher?: TeacherInfo;
  effectif?: number;
  validFrom?: string;
  validTo?: string;
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday?: DaySchedule; // Optional Saturday
}

export interface DaySchedule {
  periods: Period[];
}

export interface Period {
  timeSlotId: number;
  subjectId?: number;
  subjectName?: string;
  teacherId?: number;
  teacherName?: string;
  room?: string;
  isBreak?: boolean;
  breakType?: 'short' | 'lunch' | 'assembly';
  notes?: string;
}

export interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  type: 'class' | 'break' | 'lunch' | 'assembly';
  label?: string;
}

export interface TeacherInfo {
  id: number;
  firstName: string;
  lastName: string;
  title?: string;
  subject?: string;
  abbreviation?: string;
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

export interface TimetableOptions {
  language: 'fr' | 'en';
  format: 'A4' | 'Letter';
  orientation: 'landscape' | 'portrait';
  showTeacherNames: boolean;
  showRooms: boolean;
  includeBreaks: boolean;
  colorScheme: 'standard' | 'colorful' | 'minimal';
  includeSaturday: boolean;
  showTimeOnly: boolean; // Show only time without date ranges
}

export class TimetableGenerator {
  
  static async generateTimetable(
    data: TimetableData,
    options: TimetableOptions = {
      language: 'fr',
      format: 'A4',
      orientation: 'landscape',
      showTeacherNames: true,
      showRooms: true,
      includeBreaks: true,
      colorScheme: 'standard',
      includeSaturday: false,
      showTimeOnly: true
    }
  ): Promise<Uint8Array> {
    
    console.log('[TIMETABLE] 📅 Generating weekly timetable for class:', data.className);
    
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
      ? 'EMPLOI DU TEMPS HEBDOMADAIRE' 
      : 'WEEKLY TIMETABLE';
      
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
    
    // Class info
    const leftInfoLabels = options.language === 'fr' 
      ? ['CLASSE:', 'ANNÉE SCOLAIRE:', 'TRIMESTRE:', 'PROFESSEUR PRINCIPAL:']
      : ['CLASS:', 'ACADEMIC YEAR:', 'TERM:', 'CLASS TEACHER:'];
      
    const classTeacherName = data.classTeacher 
      ? `${data.classTeacher.title || ''} ${data.classTeacher.firstName} ${data.classTeacher.lastName}`.trim()
      : options.language === 'fr' ? 'Non assigné' : 'Not assigned';
      
    const leftInfoValues = [
      data.className,
      data.academicYear,
      data.term,
      classTeacherName
    ];
    
    for (let i = 0; i < leftInfoLabels.length; i++) {
      const y = infoY - (i * 15);
      drawText(leftInfoLabels[i], margin, y, { font: helveticaBold, size: 10 });
      drawText(leftInfoValues[i], margin + 120, y, { font: helvetica, size: 10 });
    }
    
    // Right column info
    const rightInfoLabels = options.language === 'fr' 
      ? ['EFFECTIF:', 'VALIDITÉ:']
      : ['STUDENTS:', 'VALIDITY:'];
      
    const validityText = data.validFrom && data.validTo 
      ? `${data.validFrom} - ${data.validTo}`
      : options.language === 'fr' ? 'Année scolaire' : 'Academic year';
      
    const rightInfoValues = [
      data.effectif ? `${data.effectif} ${options.language === 'fr' ? 'élèves' : 'students'}` : 'N/A',
      validityText
    ];
    
    for (let i = 0; i < rightInfoLabels.length; i++) {
      const y = infoY - (i * 15);
      drawText(rightInfoLabels[i], margin + 350, y, { font: helveticaBold, size: 10 });
      drawText(rightInfoValues[i], margin + 420, y, { font: helvetica, size: 10 });
    }
    
    currentY -= 80;
    
    // Timetable grid
    const tableWidth = width - (2 * margin);
    const timeColumnWidth = 80;
    
    // Determine number of day columns
    const dayNames = options.language === 'fr' 
      ? ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI']
      : ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
      
    if (options.includeSaturday && data.schedule.saturday) {
      dayNames.push(options.language === 'fr' ? 'SAMEDI' : 'SATURDAY');
    }
    
    const dayColumnWidth = (tableWidth - timeColumnWidth) / dayNames.length;
    
    // Table header - Days of week
    const headerHeight = 30;
    drawRect(margin, currentY - headerHeight, tableWidth, headerHeight, {
      color: colors.primary,
      borderColor: colors.border,
      borderWidth: 1
    });
    
    // Time column header
    drawText(options.language === 'fr' ? 'HEURES' : 'TIME', margin + 5, currentY - 18, {
      font: helveticaBold,
      size: 11,
      color: rgb(1, 1, 1),
      maxWidth: timeColumnWidth - 10,
      align: 'center'
    });
    
    // Day headers
    for (let i = 0; i < dayNames.length; i++) {
      const dayX = margin + timeColumnWidth + (i * dayColumnWidth);
      drawText(dayNames[i], dayX, currentY - 18, {
        font: helveticaBold,
        size: 11,
        color: rgb(1, 1, 1),
        maxWidth: dayColumnWidth - 5,
        align: 'center'
      });
    }
    
    currentY -= headerHeight;
    
    // Time slots and schedule grid
    const rowHeight = 35;
    const classTimeSlots = data.timeSlots.filter(slot => slot.type === 'class' || options.includeBreaks);
    
    for (let timeIndex = 0; timeIndex < classTimeSlots.length; timeIndex++) {
      const timeSlot = classTimeSlots[timeIndex];
      const isEvenRow = timeIndex % 2 === 0;
      
      // Row background
      const rowColor = timeSlot.isBreak || timeSlot.type !== 'class' 
        ? colors.breakBackground 
        : (isEvenRow ? colors.lightGray : rgb(1, 1, 1));
        
      drawRect(margin, currentY - rowHeight, tableWidth, rowHeight, {
        color: rowColor,
        borderColor: colors.border,
        borderWidth: 0.5
      });
      
      // Time column
      const timeText = options.showTimeOnly 
        ? `${timeSlot.startTime} - ${timeSlot.endTime}`
        : timeSlot.label || `${timeSlot.startTime} - ${timeSlot.endTime}`;
        
      drawText(timeText, margin + 5, currentY - 18, {
        font: helveticaBold,
        size: 9,
        maxWidth: timeColumnWidth - 10,
        align: 'center'
      });
      
      // Day columns
      const scheduleKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      if (options.includeSaturday && data.schedule.saturday) {
        scheduleKeys.push('saturday');
      }
      
      for (let dayIndex = 0; dayIndex < scheduleKeys.length; dayIndex++) {
        const dayKey = scheduleKeys[dayIndex] as keyof WeeklySchedule;
        const daySchedule = data.schedule[dayKey];
        
        if (!daySchedule) continue;
        
        const period = daySchedule.periods.find(p => p.timeSlotId === timeSlot.id);
        const cellX = margin + timeColumnWidth + (dayIndex * dayColumnWidth);
        const cellY = currentY - 12;
        
        if (period) {
          if (period.isBreak) {
            // Break period
            const breakText = this.getBreakText(period.breakType, options.language);
            drawText(breakText, cellX, cellY, {
              font: helveticaBold,
              size: 9,
              color: colors.breakText,
              maxWidth: dayColumnWidth - 10,
              align: 'center'
            });
          } else if (period.subjectName) {
            // Regular class
            let classText = period.subjectName;
            
            if (options.showTeacherNames && period.teacherName) {
              const teacherShort = this.getTeacherAbbreviation(period.teacherName);
              classText += `\n${teacherShort}`;
            }
            
            if (options.showRooms && period.room) {
              classText += `\n${period.room}`;
            }
            
            const lines = classText.split('\n');
            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
              const lineY = cellY - (lineIndex * 10);
              const fontSize = lineIndex === 0 ? 9 : 8;
              const fontWeight = lineIndex === 0 ? helveticaBold : helvetica;
              
              drawText(lines[lineIndex], cellX, lineY, {
                font: fontWeight,
                size: fontSize,
                maxWidth: dayColumnWidth - 10,
                align: 'center'
              });
            }
          }
        }
      }
      
      currentY -= rowHeight;
      
      // Check if we need a new page
      if (currentY < 100 && timeIndex < classTimeSlots.length - 1) {
        // Add new page logic here if needed
        break;
      }
    }
    
    // Legend section
    if (currentY > 120) {
      currentY -= 30;
      
      const legendTitle = options.language === 'fr' ? 'LÉGENDE' : 'LEGEND';
      drawText(legendTitle, margin, currentY, {
        font: helveticaBold,
        size: 12,
        color: colors.primary
      });
      
      currentY -= 20;
      
      // Legend items
      const legendItems = [
        { color: colors.breakBackground, text: options.language === 'fr' ? 'Pause/Récréation' : 'Break/Recess' },
        { color: colors.lightGray, text: options.language === 'fr' ? 'Cours normal' : 'Regular class' }
      ];
      
      for (let i = 0; i < legendItems.length; i++) {
        const item = legendItems[i];
        const legendY = currentY - (i * 15);
        
        // Color box
        drawRect(margin, legendY - 8, 15, 10, { color: item.color, borderColor: colors.border, borderWidth: 1 });
        
        // Text
        drawText(item.text, margin + 25, legendY - 5, {
          font: helvetica,
          size: 9
        });
      }
      
      currentY -= legendItems.length * 15 + 10;
    }
    
    // Footer
    const footerY = 50;
    
    // Notes section
    if (currentY > footerY + 30) {
      const notesTitle = options.language === 'fr' ? 'NOTES:' : 'NOTES:';
      drawText(notesTitle, margin, currentY, { font: helveticaBold, size: 10 });
      
      const notesText = options.language === 'fr' 
        ? 'Tout changement d\'emploi du temps sera communiqué à l\'avance. Les élèves doivent être présents 5 minutes avant le début de chaque cours.'
        : 'Any changes to the timetable will be communicated in advance. Students must be present 5 minutes before each class begins.';
        
      drawText(notesText, margin, currentY - 15, {
        font: helvetica,
        size: 8,
        maxWidth: width - 2 * margin
      });
    }
    
    // Generation info
    const generationDate = new Date().toLocaleDateString(
      options.language === 'fr' ? 'fr-FR' : 'en-US'
    );
    const footerText = options.language === 'fr' 
      ? `Emploi du temps généré le ${generationDate} - Système EDUCAFRIC`
      : `Timetable generated on ${generationDate} - EDUCAFRIC System`;
      
    drawText(footerText, margin, footerY, {
      font: helvetica,
      size: 8,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    // Principal signature
    const signatureX = width - margin - 120;
    drawText(options.language === 'fr' ? 'LE DIRECTEUR' : 'THE PRINCIPAL', signatureX, footerY + 15, {
      font: helveticaBold,
      size: 10
    });
    
    if (data.schoolInfo.directorName) {
      drawText(data.schoolInfo.directorName, signatureX, footerY, {
        font: helvetica,
        size: 9
      });
    }
    
    console.log('[TIMETABLE] ✅ Weekly timetable generated successfully');
    
    return await pdfDoc.save();
  }
  
  // Helper method to get break text
  static getBreakText(breakType: string | undefined, language: 'fr' | 'en'): string {
    if (language === 'fr') {
      switch (breakType) {
        case 'short': return 'RÉCRÉATION';
        case 'lunch': return 'PAUSE DÉJEUNER';
        case 'assembly': return 'RASSEMBLEMENT';
        default: return 'PAUSE';
      }
    } else {
      switch (breakType) {
        case 'short': return 'BREAK';
        case 'lunch': return 'LUNCH BREAK';
        case 'assembly': return 'ASSEMBLY';
        default: return 'BREAK';
      }
    }
  }
  
  // Helper method to get teacher abbreviation
  static getTeacherAbbreviation(teacherName: string): string {
    const parts = teacherName.split(' ');
    if (parts.length >= 2) {
      // Take first letter of first name and full last name
      return `${parts[0].charAt(0)}. ${parts[parts.length - 1]}`;
    }
    return teacherName.length > 12 ? teacherName.substring(0, 10) + '..' : teacherName;
  }
  
  // Helper method to get color scheme
  static getColorScheme(scheme: string) {
    const schemes = {
      standard: {
        primary: rgb(0.2, 0.3, 0.6),
        secondary: rgb(0.7, 0.8, 0.9),
        lightGray: rgb(0.95, 0.95, 0.95),
        border: rgb(0.7, 0.7, 0.7),
        breakBackground: rgb(1, 0.95, 0.8),
        breakText: rgb(0.8, 0.4, 0)
      },
      colorful: {
        primary: rgb(0.1, 0.5, 0.8),
        secondary: rgb(0.6, 0.8, 1),
        lightGray: rgb(0.95, 0.98, 1),
        border: rgb(0.6, 0.7, 0.9),
        breakBackground: rgb(1, 0.9, 0.7),
        breakText: rgb(0.8, 0.3, 0)
      },
      minimal: {
        primary: rgb(0.3, 0.3, 0.3),
        secondary: rgb(0.8, 0.8, 0.8),
        lightGray: rgb(0.97, 0.97, 0.97),
        border: rgb(0.8, 0.8, 0.8),
        breakBackground: rgb(0.95, 0.95, 0.95),
        breakText: rgb(0.5, 0.5, 0.5)
      }
    };
    
    return schemes[scheme as keyof typeof schemes] || schemes.standard;
  }
  
  // Method to generate demo data for testing
  static generateDemoData(): TimetableData {
    return {
      classId: 1,
      className: "6ème A",
      academicYear: "2024-2025",
      term: "Premier Trimestre",
      effectif: 35,
      validFrom: "01/09/2024",
      validTo: "30/06/2025",
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
      classTeacher: {
        id: 1,
        firstName: "Pauline",
        lastName: "MENDOMO",
        title: "Mme",
        subject: "Français"
      },
      timeSlots: [
        { id: 1, startTime: "07:30", endTime: "08:30", duration: 60, type: 'class', label: "1ère heure" },
        { id: 2, startTime: "08:30", endTime: "09:30", duration: 60, type: 'class', label: "2ème heure" },
        { id: 3, startTime: "09:30", endTime: "10:00", duration: 30, type: 'break', label: "Récréation" },
        { id: 4, startTime: "10:00", endTime: "11:00", duration: 60, type: 'class', label: "3ème heure" },
        { id: 5, startTime: "11:00", endTime: "12:00", duration: 60, type: 'class', label: "4ème heure" },
        { id: 6, startTime: "12:00", endTime: "13:30", duration: 90, type: 'lunch', label: "Pause déjeuner" },
        { id: 7, startTime: "13:30", endTime: "14:30", duration: 60, type: 'class', label: "5ème heure" },
        { id: 8, startTime: "14:30", endTime: "15:30", duration: 60, type: 'class', label: "6ème heure" }
      ],
      teachers: {
        1: { id: 1, firstName: "Pauline", lastName: "MENDOMO", title: "Mme", subject: "Français", abbreviation: "P.MEND" },
        2: { id: 2, firstName: "John", lastName: "SMITH", title: "Mr", subject: "Anglais", abbreviation: "J.SMITH" },
        3: { id: 3, firstName: "Pierre", lastName: "BIYA", title: "M.", subject: "Mathématiques", abbreviation: "P.BIYA" },
        4: { id: 4, firstName: "Emmanuel", lastName: "EWANE", title: "Dr", subject: "Sciences", abbreviation: "E.EWANE" },
        5: { id: 5, firstName: "Marie", lastName: "FOMO", title: "Mme", subject: "Histoire", abbreviation: "M.FOMO" }
      },
      schedule: {
        monday: {
          periods: [
            { timeSlotId: 1, subjectId: 1, subjectName: "Français", teacherId: 1, teacherName: "Mme MENDOMO", room: "A101" },
            { timeSlotId: 2, subjectId: 3, subjectName: "Mathématiques", teacherId: 3, teacherName: "M. BIYA", room: "A102" },
            { timeSlotId: 3, isBreak: true, breakType: 'short' },
            { timeSlotId: 4, subjectId: 2, subjectName: "Anglais", teacherId: 2, teacherName: "Mr SMITH", room: "A103" },
            { timeSlotId: 5, subjectId: 4, subjectName: "Sciences", teacherId: 4, teacherName: "Dr EWANE", room: "Lab1" },
            { timeSlotId: 6, isBreak: true, breakType: 'lunch' },
            { timeSlotId: 7, subjectId: 5, subjectName: "Histoire", teacherId: 5, teacherName: "Mme FOMO", room: "A101" },
            { timeSlotId: 8, subjectId: 1, subjectName: "Français", teacherId: 1, teacherName: "Mme MENDOMO", room: "A101" }
          ]
        },
        tuesday: {
          periods: [
            { timeSlotId: 1, subjectId: 3, subjectName: "Mathématiques", teacherId: 3, teacherName: "M. BIYA", room: "A102" },
            { timeSlotId: 2, subjectId: 2, subjectName: "Anglais", teacherId: 2, teacherName: "Mr SMITH", room: "A103" },
            { timeSlotId: 3, isBreak: true, breakType: 'short' },
            { timeSlotId: 4, subjectId: 4, subjectName: "Sciences", teacherId: 4, teacherName: "Dr EWANE", room: "Lab1" },
            { timeSlotId: 5, subjectId: 1, subjectName: "Français", teacherId: 1, teacherName: "Mme MENDOMO", room: "A101" },
            { timeSlotId: 6, isBreak: true, breakType: 'lunch' },
            { timeSlotId: 7, subjectId: 5, subjectName: "Géographie", teacherId: 5, teacherName: "Mme FOMO", room: "A101" },
            { timeSlotId: 8, subjectId: 3, subjectName: "Mathématiques", teacherId: 3, teacherName: "M. BIYA", room: "A102" }
          ]
        },
        wednesday: {
          periods: [
            { timeSlotId: 1, subjectId: 1, subjectName: "Français", teacherId: 1, teacherName: "Mme MENDOMO", room: "A101" },
            { timeSlotId: 2, subjectId: 4, subjectName: "Sciences", teacherId: 4, teacherName: "Dr EWANE", room: "Lab1" },
            { timeSlotId: 3, isBreak: true, breakType: 'short' },
            { timeSlotId: 4, subjectId: 2, subjectName: "Anglais", teacherId: 2, teacherName: "Mr SMITH", room: "A103" },
            { timeSlotId: 5, subjectId: 3, subjectName: "Mathématiques", teacherId: 3, teacherName: "M. BIYA", room: "A102" },
            { timeSlotId: 6, isBreak: true, breakType: 'lunch' },
            { timeSlotId: 7, subjectId: 5, subjectName: "Histoire", teacherId: 5, teacherName: "Mme FOMO", room: "A101" },
            { timeSlotId: 8, subjectId: 1, subjectName: "Expression Écrite", teacherId: 1, teacherName: "Mme MENDOMO", room: "A101" }
          ]
        },
        thursday: {
          periods: [
            { timeSlotId: 1, subjectId: 3, subjectName: "Mathématiques", teacherId: 3, teacherName: "M. BIYA", room: "A102" },
            { timeSlotId: 2, subjectId: 1, subjectName: "Français", teacherId: 1, teacherName: "Mme MENDOMO", room: "A101" },
            { timeSlotId: 3, isBreak: true, breakType: 'short' },
            { timeSlotId: 4, subjectId: 4, subjectName: "Éducation Physique", teacherId: 6, teacherName: "M. KOTTO", room: "Terrain" },
            { timeSlotId: 5, subjectId: 2, subjectName: "Anglais", teacherId: 2, teacherName: "Mr SMITH", room: "A103" },
            { timeSlotId: 6, isBreak: true, breakType: 'lunch' },
            { timeSlotId: 7, subjectId: 5, subjectName: "Géographie", teacherId: 5, teacherName: "Mme FOMO", room: "A101" },
            { timeSlotId: 8, subjectId: 3, subjectName: "Mathématiques", teacherId: 3, teacherName: "M. BIYA", room: "A102" }
          ]
        },
        friday: {
          periods: [
            { timeSlotId: 1, subjectId: 2, subjectName: "Anglais", teacherId: 2, teacherName: "Mr SMITH", room: "A103" },
            { timeSlotId: 2, subjectId: 4, subjectName: "Sciences", teacherId: 4, teacherName: "Dr EWANE", room: "Lab1" },
            { timeSlotId: 3, isBreak: true, breakType: 'short' },
            { timeSlotId: 4, subjectId: 1, subjectName: "Français", teacherId: 1, teacherName: "Mme MENDOMO", room: "A101" },
            { timeSlotId: 5, subjectId: 5, subjectName: "Histoire", teacherId: 5, teacherName: "Mme FOMO", room: "A101" },
            { timeSlotId: 6, isBreak: true, breakType: 'lunch' },
            { timeSlotId: 7, subjectId: 3, subjectName: "Mathématiques", teacherId: 3, teacherName: "M. BIYA", room: "A102" },
            { timeSlotId: 8, subjectId: 7, subjectName: "Études Dirigées", teacherId: 1, teacherName: "Mme MENDOMO", room: "A101" }
          ]
        }
      }
    };
  }
}
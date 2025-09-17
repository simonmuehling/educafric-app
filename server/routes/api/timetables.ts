// API routes for Timetable PDF generation
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth, requireAnyRole } from '../../middleware/auth.js';
import { TimetableGenerator, type TimetableData, type TimetableOptions } from '../../services/timetableGenerator.js';
import { SchoolDataService } from '../../services/pdfGenerator.js';

const router = Router();

// Validation schemas
const timetableGenerationSchema = z.object({
  classId: z.number().int().positive(),
  academicYear: z.string().min(1),
  term: z.string().min(1),
  weekStartDate: z.string().optional(),
  options: z.object({
    language: z.enum(['fr', 'en']).default('fr'),
    format: z.enum(['A4', 'Letter']).default('A4'),
    orientation: z.enum(['landscape', 'portrait']).default('landscape'),
    showTeacherNames: z.boolean().default(true),
    showRooms: z.boolean().default(true),
    includeBreaks: z.boolean().default(true),
    colorScheme: z.enum(['standard', 'colorful', 'minimal']).default('standard'),
    includeSaturday: z.boolean().default(false),
    showTimeOnly: z.boolean().default(true)
  }).default({})
});

const timetableDemoSchema = z.object({
  language: z.enum(['fr', 'en']).default('fr'),
  colorScheme: z.enum(['standard', 'colorful', 'minimal']).default('standard'),
  includeSaturday: z.boolean().default(false)
});

/**
 * Generate Timetable PDF for a specific class
 * POST /api/timetables/generate
 */
router.post('/generate', requireAuth, requireAnyRole(['director', 'teacher', 'site-admin']), async (req: Request, res: Response) => {
  try {
    console.log('[TIMETABLE_API] 📅 Generating timetable PDF...');
    
    // Validate request body
    const validatedData = timetableGenerationSchema.parse(req.body);
    const { classId, academicYear, term, weekStartDate, options } = validatedData;
    
    // TODO: Fetch real timetable data from database
    // For now, use demo data with provided class information
    const timetableData: TimetableData = {
      ...TimetableGenerator.generateDemoData(),
      classId,
      academicYear,
      term,
      validFrom: weekStartDate || '01/09/2024'
    };
    
    // Generate PDF
    const pdfBytes = await TimetableGenerator.generateTimetable(timetableData, options);
    
    // Set response headers
    const filename = `timetable-${timetableData.className}-${academicYear}-${term}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBytes.length);
    
    // Send PDF
    res.send(Buffer.from(pdfBytes));
    
    console.log('[TIMETABLE_API] ✅ Timetable PDF generated successfully');
    
  } catch (error: any) {
    console.error('[TIMETABLE_API] ❌ Error generating timetable:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate timetable PDF',
      error: error.message
    });
  }
});

/**
 * Generate demo Timetable PDF with sample data
 * POST /api/timetables/demo
 */
router.post('/demo', async (req: Request, res: Response) => {
  try {
    console.log('[TIMETABLE_API] 🎭 Generating demo timetable...');
    
    // Validate request body
    const { language, colorScheme, includeSaturday } = timetableDemoSchema.parse(req.body);
    
    // Generate demo data
    const demoData = TimetableGenerator.generateDemoData();
    
    // Demo options
    const demoOptions: TimetableOptions = {
      language,
      format: 'A4',
      orientation: 'landscape',
      showTeacherNames: true,
      showRooms: true,
      includeBreaks: true,
      colorScheme,
      includeSaturday,
      showTimeOnly: true
    };
    
    // Generate PDF
    const pdfBytes = await TimetableGenerator.generateTimetable(demoData, demoOptions);
    
    // Set response headers
    const filename = `timetable-demo-${language}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBytes.length);
    
    // Send PDF
    res.send(Buffer.from(pdfBytes));
    
    console.log('[TIMETABLE_API] ✅ Demo timetable generated successfully');
    
  } catch (error: any) {
    console.error('[TIMETABLE_API] ❌ Error generating demo timetable:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate demo timetable',
      error: error.message
    });
  }
});

/**
 * Generate Teacher's Personal Timetable
 * POST /api/timetables/teacher/:teacherId
 */
router.post('/teacher/:teacherId', requireAuth, requireAnyRole(['director', 'teacher', 'site-admin']), async (req: Request, res: Response) => {
  try {
    const teacherId = parseInt(req.params.teacherId);
    
    if (isNaN(teacherId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher ID'
      });
    }
    
    console.log('[TIMETABLE_API] 👩‍🏫 Generating teacher timetable for ID:', teacherId);
    
    // Validate request body
    const validatedData = timetableGenerationSchema.omit({ classId: true }).parse(req.body);
    const { academicYear, term, options } = validatedData;
    
    // TODO: Fetch real teacher timetable data from database
    // For now, use demo data adapted for teacher view
    const teacherTimetableData: TimetableData = {
      ...TimetableGenerator.generateDemoData(),
      className: `Emploi du Temps - Enseignant ${teacherId}`,
      classTeacher: {
        id: teacherId,
        firstName: "Marie",
        lastName: "MENDOMO",
        title: "Mme",
        subject: "Français"
      },
      academicYear,
      term
    };
    
    // Generate PDF
    const pdfBytes = await TimetableGenerator.generateTimetable(teacherTimetableData, options);
    
    // Set response headers
    const filename = `teacher-timetable-${teacherId}-${academicYear}-${term}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBytes.length);
    
    // Send PDF
    res.send(Buffer.from(pdfBytes));
    
    console.log('[TIMETABLE_API] ✅ Teacher timetable PDF generated successfully');
    
  } catch (error: any) {
    console.error('[TIMETABLE_API] ❌ Error generating teacher timetable:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate teacher timetable PDF',
      error: error.message
    });
  }
});

/**
 * Get timetable templates and options
 * GET /api/timetables/templates
 */
router.get('/templates', requireAuth, async (req: Request, res: Response) => {
  try {
    const templates = {
      colorSchemes: [
        { value: 'standard', label: 'Standard', description: 'Professional blue academic colors' },
        { value: 'colorful', label: 'Colorful', description: 'Vibrant colors for better visibility' },
        { value: 'minimal', label: 'Minimal', description: 'Clean black and white design' }
      ],
      formats: [
        { value: 'A4', label: 'A4 (210×297mm)', description: 'Standard international format' },
        { value: 'Letter', label: 'Letter (8.5×11in)', description: 'US standard format' }
      ],
      orientations: [
        { value: 'landscape', label: 'Landscape', description: 'Horizontal layout (recommended)' },
        { value: 'portrait', label: 'Portrait', description: 'Vertical layout' }
      ],
      languages: [
        { value: 'fr', label: 'Français', description: 'French language' },
        { value: 'en', label: 'English', description: 'English language' }
      ],
      options: {
        showTeacherNames: { label: 'Show Teacher Names', description: 'Display teacher names in schedule cells' },
        showRooms: { label: 'Show Room Numbers', description: 'Display classroom/room assignments' },
        includeBreaks: { label: 'Include Breaks', description: 'Show break periods in the schedule' },
        includeSaturday: { label: 'Include Saturday', description: 'Add Saturday column to the timetable' },
        showTimeOnly: { label: 'Show Time Only', description: 'Display only time without date ranges' }
      }
    };
    
    res.json({
      success: true,
      templates
    });
    
  } catch (error: any) {
    console.error('[TIMETABLE_API] ❌ Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timetable templates',
      error: error.message
    });
  }
});

/**
 * Get class schedule summary
 * GET /api/timetables/class/:classId/summary
 */
router.get('/class/:classId/summary', requireAuth, requireAnyRole(['director', 'teacher', 'site-admin']), async (req: Request, res: Response) => {
  try {
    const classId = parseInt(req.params.classId);
    
    if (isNaN(classId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class ID'
      });
    }
    
    // TODO: Fetch real class schedule summary from database
    // For now, return demo summary
    const summary = {
      classId,
      className: "6ème A",
      classTeacher: "Mme MENDOMO Pauline",
      totalStudents: 35,
      weeklyHours: 32,
      subjects: [
        { name: "Français", weeklyHours: 6, teacher: "Mme MENDOMO" },
        { name: "Mathématiques", weeklyHours: 6, teacher: "M. BIYA" },
        { name: "Anglais", weeklyHours: 4, teacher: "Mr SMITH" },
        { name: "Sciences", weeklyHours: 4, teacher: "Dr EWANE" },
        { name: "Histoire-Géo", weeklyHours: 4, teacher: "Mme FOMO" },
        { name: "Éducation Physique", weeklyHours: 2, teacher: "M. KOTTO" }
      ],
      timeSlots: {
        start: "07:30",
        end: "15:30",
        totalPeriods: 8,
        breakPeriods: 2
      }
    };
    
    res.json({
      success: true,
      summary
    });
    
  } catch (error: any) {
    console.error('[TIMETABLE_API] ❌ Error fetching class summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class summary',
      error: error.message
    });
  }
});

export default router;
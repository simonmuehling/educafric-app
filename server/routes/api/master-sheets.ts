// API routes for Master Sheet PDF generation
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth, requireAnyRole } from '../../middleware/auth.js';
import { MasterSheetGenerator, type MasterSheetData, type MasterSheetOptions } from '../../services/masterSheetGenerator.js';
import { SchoolDataService } from '../../services/pdfGenerator.js';

const router = Router();

// Validation schemas
const masterSheetGenerationSchema = z.object({
  classId: z.number().int().positive(),
  academicYear: z.string().min(1),
  term: z.string().min(1),
  teacherId: z.number().int().positive().optional(),
  options: z.object({
    language: z.enum(['fr', 'en']).default('fr'),
    format: z.enum(['A4', 'Letter']).default('A4'),
    orientation: z.enum(['landscape', 'portrait']).default('landscape'),
    includeStatistics: z.boolean().default(true),
    includeAbsences: z.boolean().default(true),
    showRankings: z.boolean().default(true),
    colorScheme: z.enum(['standard', 'green', 'blue']).default('standard')
  }).default({})
});

const masterSheetDemoSchema = z.object({
  language: z.enum(['fr', 'en']).default('fr'),
  colorScheme: z.enum(['standard', 'green', 'blue']).default('standard')
});

/**
 * Generate Master Sheet PDF for a specific class
 * POST /api/master-sheets/generate
 */
router.post('/generate', requireAuth, requireAnyRole(['director', 'teacher', 'site-admin']), async (req: Request, res: Response) => {
  try {
    console.log('[MASTER_SHEET_API] 📊 Generating master sheet PDF...');
    
    // Validate request body
    const validatedData = masterSheetGenerationSchema.parse(req.body);
    const { classId, academicYear, term, teacherId, options } = validatedData;
    
    // TODO: Fetch real data from database
    // For now, use demo data with provided class information
    const masterSheetData: MasterSheetData = {
      ...MasterSheetGenerator.generateDemoData(),
      classId,
      academicYear,
      term,
      teacher: teacherId ? {
        id: teacherId,
        firstName: "Enseignant",
        lastName: "EDUCAFRIC",
        title: "M./Mme"
      } : undefined
    };
    
    // Generate PDF
    const pdfBytes = await MasterSheetGenerator.generateMasterSheet(masterSheetData, options);
    
    // Set response headers
    const filename = `master-sheet-${masterSheetData.className}-${academicYear}-${term}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBytes.length);
    
    // Send PDF
    res.send(Buffer.from(pdfBytes));
    
    console.log('[MASTER_SHEET_API] ✅ Master sheet PDF generated successfully');
    
  } catch (error: any) {
    console.error('[MASTER_SHEET_API] ❌ Error generating master sheet:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate master sheet PDF',
      error: error.message
    });
  }
});

/**
 * Generate demo Master Sheet PDF with sample data
 * POST /api/master-sheets/demo
 */
router.post('/demo', async (req: Request, res: Response) => {
  try {
    console.log('[MASTER_SHEET_API] 🎭 Generating demo master sheet...');
    
    // Validate request body
    const { language, colorScheme } = masterSheetDemoSchema.parse(req.body);
    
    // Generate demo data
    const demoData = MasterSheetGenerator.generateDemoData();
    
    // Demo options
    const demoOptions: MasterSheetOptions = {
      language,
      format: 'A4',
      orientation: 'landscape',
      includeStatistics: true,
      includeAbsences: true,
      showRankings: true,
      colorScheme
    };
    
    // Generate PDF
    const pdfBytes = await MasterSheetGenerator.generateMasterSheet(demoData, demoOptions);
    
    // Set response headers
    const filename = `master-sheet-demo-${language}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBytes.length);
    
    // Send PDF
    res.send(Buffer.from(pdfBytes));
    
    console.log('[MASTER_SHEET_API] ✅ Demo master sheet generated successfully');
    
  } catch (error: any) {
    console.error('[MASTER_SHEET_API] ❌ Error generating demo master sheet:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate demo master sheet',
      error: error.message
    });
  }
});

/**
 * Get master sheet templates and options
 * GET /api/master-sheets/templates
 */
router.get('/templates', requireAuth, async (req: Request, res: Response) => {
  try {
    const templates = {
      colorSchemes: [
        { value: 'standard', label: 'Standard', description: 'Classic blue academic colors' },
        { value: 'green', label: 'Green', description: 'Nature-inspired green theme' },
        { value: 'blue', label: 'Blue', description: 'Professional blue theme' }
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
      ]
    };
    
    res.json({
      success: true,
      templates
    });
    
  } catch (error: any) {
    console.error('[MASTER_SHEET_API] ❌ Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch master sheet templates',
      error: error.message
    });
  }
});

export default router;
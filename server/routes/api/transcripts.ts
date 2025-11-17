// API routes for Academic Transcript PDF generation
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth, requireAnyRole } from '../../middleware/auth.js';
import { TranscriptGenerator, type TranscriptData, type TranscriptOptions } from '../../services/transcriptGenerator.js';
import { SchoolDataService } from '../../services/pdfGenerator.js';

const router = Router();

// Validation schemas
const transcriptGenerationSchema = z.object({
  studentId: z.number().int().positive(),
  includeAllYears: z.boolean().default(true),
  specificYears: z.array(z.string()).optional(),
  options: z.object({
    language: z.enum(['fr', 'en']).default('fr'),
    format: z.enum(['A4', 'Letter']).default('A4'),
    includePhoto: z.boolean().default(true),
    includeCertifications: z.boolean().default(true),
    includeStatistics: z.boolean().default(true),
    officialSeal: z.boolean().default(true),
    watermark: z.string().optional(),
    colorScheme: z.enum(['official', 'modern', 'classic']).default('official')
  }).default({})
});

const transcriptDemoSchema = z.object({
  language: z.enum(['fr', 'en']).default('fr'),
  colorScheme: z.enum(['official', 'modern', 'classic']).default('official')
});

/**
 * Generate Academic Transcript PDF for a specific student
 * POST /api/transcripts/generate
 */
router.post('/generate', requireAuth, requireAnyRole(['director', 'teacher', 'student', 'parent', 'site-admin']), async (req: Request, res: Response) => {
  try {
    console.log('[TRANSCRIPT_API] 📜 Generating academic transcript PDF...');
    
    // Validate request body
    const validatedData = transcriptGenerationSchema.parse(req.body);
    const { studentId, includeAllYears, specificYears, options } = validatedData;
    
    // Fetch school data including logo
    const user = req.user as any;
    const schoolData = user?.schoolId 
      ? await SchoolDataService.getSchoolData(user.schoolId)
      : null;
    
    // TODO: Fetch real student data from database
    // For now, use demo data with provided student ID
    const demoData = TranscriptGenerator.generateDemoData();
    const transcriptData: TranscriptData = {
      ...demoData,
      studentId,
      // Merge real school data including logo with proper field mapping
      schoolInfo: schoolData ? {
        id: demoData.schoolInfo.id, // CameroonOfficialHeaderData doesn't have id
        name: schoolData.schoolName || demoData.schoolInfo.name,
        address: schoolData.address || demoData.schoolInfo.address,
        phone: schoolData.phone || demoData.schoolInfo.phone,
        email: schoolData.email || demoData.schoolInfo.email,
        logoUrl: schoolData.logoUrl || demoData.schoolInfo.logoUrl,
        directorName: demoData.schoolInfo.directorName, // CameroonOfficialHeaderData doesn't have directorName
        regionaleMinisterielle: schoolData.regionaleMinisterielle || demoData.schoolInfo.regionaleMinisterielle,
        delegationDepartementale: schoolData.delegationDepartementale || demoData.schoolInfo.delegationDepartementale,
        boitePostale: schoolData.boitePostale || demoData.schoolInfo.boitePostale,
        educationalType: schoolData.educationalType || demoData.schoolInfo.educationalType
      } : demoData.schoolInfo
    };
    
    // Filter academic history if specific years requested
    if (!includeAllYears && specificYears && specificYears.length > 0) {
      transcriptData.academicHistory = transcriptData.academicHistory.filter(
        period => specificYears.includes(period.academicYear)
      );
    }
    
    // Ensure all required options have default values
    const transcriptOptions: TranscriptOptions = {
      language: options.language || 'fr',
      format: options.format || 'A4',
      includePhoto: options.includePhoto !== undefined ? options.includePhoto : true,
      includeCertifications: options.includeCertifications !== undefined ? options.includeCertifications : true,
      includeStatistics: options.includeStatistics !== undefined ? options.includeStatistics : true,
      officialSeal: options.officialSeal !== undefined ? options.officialSeal : true,
      watermark: options.watermark,
      colorScheme: options.colorScheme || 'official'
    };

    // Generate PDF
    const pdfBytes = await TranscriptGenerator.generateTranscript(transcriptData, transcriptOptions);
    
    // Set response headers
    const filename = `transcript-${transcriptData.firstName}-${transcriptData.lastName}-${new Date().getFullYear()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBytes.length);
    
    // Send PDF
    res.send(Buffer.from(pdfBytes));
    
    console.log('[TRANSCRIPT_API] ✅ Academic transcript PDF generated successfully');
    
  } catch (error: any) {
    console.error('[TRANSCRIPT_API] ❌ Error generating transcript:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate academic transcript PDF',
      error: error.message
    });
  }
});

/**
 * Generate demo Academic Transcript PDF with sample data
 * POST /api/transcripts/demo
 */
router.post('/demo', async (req: Request, res: Response) => {
  try {
    console.log('[TRANSCRIPT_API] 🎭 Generating demo academic transcript...');
    
    // Validate request body
    const { language, colorScheme } = transcriptDemoSchema.parse(req.body);
    
    // Fetch school data including logo if user is authenticated
    const user = req.user as any;
    const schoolData = user?.schoolId 
      ? await SchoolDataService.getSchoolData(user.schoolId)
      : null;
    
    // Generate demo data
    const baseDemoData = TranscriptGenerator.generateDemoData();
    const demoData = {
      ...baseDemoData,
      // Merge real school data including logo with proper field mapping
      schoolInfo: schoolData ? {
        id: baseDemoData.schoolInfo.id, // CameroonOfficialHeaderData doesn't have id
        name: schoolData.schoolName || baseDemoData.schoolInfo.name,
        address: schoolData.address || baseDemoData.schoolInfo.address,
        phone: schoolData.phone || baseDemoData.schoolInfo.phone,
        email: schoolData.email || baseDemoData.schoolInfo.email,
        logoUrl: schoolData.logoUrl || baseDemoData.schoolInfo.logoUrl,
        directorName: baseDemoData.schoolInfo.directorName, // CameroonOfficialHeaderData doesn't have directorName
        regionaleMinisterielle: schoolData.regionaleMinisterielle || baseDemoData.schoolInfo.regionaleMinisterielle,
        delegationDepartementale: schoolData.delegationDepartementale || baseDemoData.schoolInfo.delegationDepartementale,
        boitePostale: schoolData.boitePostale || baseDemoData.schoolInfo.boitePostale,
        educationalType: schoolData.educationalType || baseDemoData.schoolInfo.educationalType
      } : baseDemoData.schoolInfo
    };
    
    // Demo options
    const demoOptions: TranscriptOptions = {
      language,
      format: 'A4',
      includePhoto: true,
      includeCertifications: true,
      includeStatistics: true,
      officialSeal: true,
      colorScheme
    };
    
    // Generate PDF
    const pdfBytes = await TranscriptGenerator.generateTranscript(demoData, demoOptions);
    
    // Set response headers
    const filename = `transcript-demo-${language}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBytes.length);
    
    // Send PDF
    res.send(Buffer.from(pdfBytes));
    
    console.log('[TRANSCRIPT_API] ✅ Demo academic transcript generated successfully');
    
  } catch (error: any) {
    console.error('[TRANSCRIPT_API] ❌ Error generating demo transcript:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate demo academic transcript',
      error: error.message
    });
  }
});

/**
 * Get transcript templates and options
 * GET /api/transcripts/templates
 */
router.get('/templates', requireAuth, async (req: Request, res: Response) => {
  try {
    const templates = {
      colorSchemes: [
        { value: 'official', label: 'Official', description: 'Government-style official colors' },
        { value: 'modern', label: 'Modern', description: 'Contemporary clean design' },
        { value: 'classic', label: 'Classic', description: 'Traditional academic styling' }
      ],
      formats: [
        { value: 'A4', label: 'A4 (210×297mm)', description: 'Standard international format' },
        { value: 'Letter', label: 'Letter (8.5×11in)', description: 'US standard format' }
      ],
      languages: [
        { value: 'fr', label: 'Français', description: 'French language' },
        { value: 'en', label: 'English', description: 'English language' }
      ],
      options: {
        includePhoto: { label: 'Include Student Photo', description: 'Add student photograph to transcript' },
        includeCertifications: { label: 'Include Certifications', description: 'Add certificates and diplomas section' },
        includeStatistics: { label: 'Include Statistics', description: 'Add overall academic statistics' },
        officialSeal: { label: 'Official Seal', description: 'Include official school seal indication' }
      }
    };
    
    res.json({
      success: true,
      templates
    });
    
  } catch (error: any) {
    console.error('[TRANSCRIPT_API] ❌ Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transcript templates',
      error: error.message
    });
  }
});

/**
 * Get student academic history summary
 * GET /api/transcripts/student/:studentId/summary
 */
router.get('/student/:studentId/summary', requireAuth, requireAnyRole(['director', 'teacher', 'student', 'parent', 'site-admin']), async (req: Request, res: Response) => {
  try {
    const studentId = parseInt(req.params.studentId);
    
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID'
      });
    }
    
    // TODO: Fetch real student academic history from database
    // For now, return demo summary
    const summary = {
      studentId,
      firstName: "Marie",
      lastName: "FOSSO",
      matricule: "23A001",
      currentLevel: "3ème",
      totalYears: 2,
      overallAverage: 15.90,
      academicYears: ["2022-2023", "2023-2024"],
      availablePeriods: [
        { year: "2022-2023", terms: ["Premier Trimestre", "Deuxième Trimestre", "Troisième Trimestre"] },
        { year: "2023-2024", terms: ["Premier Trimestre", "Deuxième Trimestre", "Troisième Trimestre"] }
      ]
    };
    
    res.json({
      success: true,
      summary
    });
    
  } catch (error: any) {
    console.error('[TRANSCRIPT_API] ❌ Error fetching student summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student summary',
      error: error.message
    });
  }
});

export default router;
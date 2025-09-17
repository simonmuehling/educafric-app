import { Router } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté. Utilisez Excel (.xlsx, .xls) ou CSV (.csv)'));
    }
  }
});

// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user || !['Director', 'Admin', 'SiteAdmin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès administrateur école requis' });
  }
  next();
};

// Validation schemas
const academicTermSchema = z.object({
  termNumber: z.number().min(1).max(3),
  termName: z.string().min(1, 'Le nom du trimestre est requis'),
  startDate: z.string().refine((date) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
  }, 'Format de date invalide (YYYY-MM-DD)'),
  endDate: z.string().refine((date) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
  }, 'Format de date invalide (YYYY-MM-DD)'),
  isActive: z.boolean().default(true),
});

const academicYearSchema = z.object({
  year: z.string().regex(/^\d{4}-\d{4}$/, 'Format année invalide (YYYY-YYYY)'),
  startDate: z.string().refine((date) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
  }, 'Format de date invalide (YYYY-MM-DD)'),
  endDate: z.string().refine((date) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
  }, 'Format de date invalide (YYYY-MM-DD)'),
  isActive: z.boolean().default(false),
});

const academicConfigSchema = z.object({
  academicYear: academicYearSchema,
  terms: z.array(academicTermSchema).min(1).max(3),
  gradingScale: z.object({
    minGrade: z.number().min(0).max(20).default(0),
    maxGrade: z.number().min(0).max(20).default(20),
    passingGrade: z.number().min(0).max(20).default(10),
  }).optional(),
  schoolCalendar: z.object({
    vacationDays: z.array(z.string()).optional(),
    holidays: z.array(z.object({
      name: z.string(),
      date: z.string(),
    })).optional(),
  }).optional(),
});

// Helper function to parse file data
function parseFileData(file: Express.Multer.File): any[] {
  try {
    if (file.mimetype.includes('spreadsheet') || file.mimetype.includes('excel')) {
      // Parse Excel file
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      return XLSX.utils.sheet_to_json(worksheet);
    } else if (file.mimetype === 'text/csv') {
      // Parse CSV file
      const csvString = file.buffer.toString('utf8');
      return parse(csvString, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    }
    throw new Error('Format de fichier non supporté');
  } catch (error) {
    throw new Error('Impossible de lire le fichier. Vérifiez le format et réessayez.');
  }
}

// GET /api/academic/config - Configuration académique actuelle
router.get('/config', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    console.log('[ACADEMIC_CONFIG] 📅 Récupération configuration, school:', user.schoolId);

    const config = await storage.getAcademicConfiguration(user.schoolId);
    
    // Fallback to default configuration if none exists
    if (!config) {
      const defaultConfig = {
        schoolId: user.schoolId,
        academicYear: {
          year: '2024-2025',
          startDate: '2024-09-01',
          endDate: '2025-07-15',
          isActive: true
        },
        terms: [
          {
            termNumber: 1,
            termName: 'Premier Trimestre',
            startDate: '2024-09-01',
            endDate: '2024-12-15',
            isActive: true
          },
          {
            termNumber: 2,
            termName: 'Deuxième Trimestre',
            startDate: '2025-01-02',
            endDate: '2025-04-05',
            isActive: false
          },
          {
            termNumber: 3,
            termName: 'Troisième Trimestre',
            startDate: '2025-04-15',
            endDate: '2025-07-15',
            isActive: false
          }
        ],
        gradingScale: {
          minGrade: 0,
          maxGrade: 20,
          passingGrade: 10
        },
        schoolCalendar: {
          vacationDays: ['2024-12-16', '2024-12-31', '2025-04-06', '2025-04-14'],
          holidays: [
            { name: 'Noël', date: '2024-12-25' },
            { name: 'Nouvel An', date: '2025-01-01' },
            { name: 'Pâques', date: '2025-04-13' }
          ]
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return res.json({
        success: true,
        data: defaultConfig,
        message: 'Configuration par défaut retournée'
      });
    }

    res.json({
      success: true,
      data: config,
      message: 'Configuration académique récupérée'
    });

  } catch (error: any) {
    console.error('[ACADEMIC_CONFIG] ❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la configuration',
      error: error.message
    });
  }
});

// POST /api/academic/import - Import configuration académique CSV/Excel
router.post('/import', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const user = req.user as any;
    const file = req.file;

    console.log('[ACADEMIC_IMPORT] 📥 Début import configuration, school:', user.schoolId);

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    // Parse file data
    const rawData = parseFileData(file);
    console.log('[ACADEMIC_IMPORT] 📊 Données extraites:', rawData.length, 'lignes');

    if (rawData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Le fichier est vide ou ne contient pas de données valides'
      });
    }

    // Process academic year and terms from raw data
    const configData = {
      academicYear: {
        year: rawData[0]['Année scolaire'] || rawData[0]['year'] || '2024-2025',
        startDate: rawData[0]['Date début année'] || rawData[0]['yearStartDate'] || '2024-09-01',
        endDate: rawData[0]['Date fin année'] || rawData[0]['yearEndDate'] || '2025-07-15',
        isActive: (rawData[0]['Année active'] !== 'false' && rawData[0]['yearActive'] !== 'false')
      },
      terms: rawData.filter(row => row['Trimestre'] || row['termNumber']).map((row, index) => ({
        termNumber: parseInt(row['Trimestre'] || row['termNumber'] || (index + 1)),
        termName: row['Nom trimestre'] || row['termName'] || `Trimestre ${index + 1}`,
        startDate: row['Date début'] || row['startDate'] || '2024-09-01',
        endDate: row['Date fin'] || row['endDate'] || '2024-12-15',
        isActive: (row['Actif'] !== 'false' && row['isActive'] !== 'false')
      })),
      gradingScale: {
        minGrade: parseInt(rawData[0]['Note min'] || rawData[0]['minGrade'] || '0'),
        maxGrade: parseInt(rawData[0]['Note max'] || rawData[0]['maxGrade'] || '20'),
        passingGrade: parseInt(rawData[0]['Note passage'] || rawData[0]['passingGrade'] || '10')
      }
    };

    // Validate configuration
    const validationResult = academicConfigSchema.safeParse(configData);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Configuration invalide',
        errors: validationResult.error.issues
      });
    }

    // Save configuration
    const savedConfig = await storage.setAcademicConfiguration(user.schoolId, {
      ...validationResult.data,
      schoolId: user.schoolId,
      updatedBy: user.id,
      updatedAt: new Date()
    });

    console.log('[ACADEMIC_IMPORT] ✅ Configuration sauvegardée');

    res.json({
      success: true,
      message: 'Configuration académique importée avec succès',
      data: savedConfig
    });

  } catch (error: any) {
    console.error('[ACADEMIC_IMPORT] ❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'import de la configuration',
      error: error.message
    });
  }
});

// PUT /api/academic/terms - Mise à jour des trimestres
router.put('/terms', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const { terms } = req.body;

    console.log('[ACADEMIC_TERMS] ✏️ Mise à jour trimestres, school:', user.schoolId);

    // Validate terms
    const validationResult = z.array(academicTermSchema).safeParse(terms);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Données trimestres invalides',
        errors: validationResult.error.issues
      });
    }

    // Update terms
    const updatedConfig = await storage.updateAcademicTerms(user.schoolId, validationResult.data, user.id);

    res.json({
      success: true,
      message: 'Trimestres mis à jour avec succès',
      data: updatedConfig
    });

  } catch (error: any) {
    console.error('[ACADEMIC_TERMS] ❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des trimestres',
      error: error.message
    });
  }
});

// PUT /api/academic/year - Changement d'année scolaire
router.put('/year', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const yearData = req.body;

    console.log('[ACADEMIC_YEAR] 📅 Changement année scolaire, school:', user.schoolId);

    // Validate year data
    const validationResult = academicYearSchema.safeParse(yearData);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Données année scolaire invalides',
        errors: validationResult.error.issues
      });
    }

    // Update academic year
    const updatedConfig = await storage.updateAcademicYear(user.schoolId, validationResult.data, user.id);

    res.json({
      success: true,
      message: 'Année scolaire mise à jour avec succès',
      data: updatedConfig
    });

  } catch (error: any) {
    console.error('[ACADEMIC_YEAR] ❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'année scolaire',
      error: error.message
    });
  }
});

// POST /api/academic/new-year - Initialisation nouvelle année scolaire
router.post('/new-year', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const { newYear, promotionSettings } = req.body;

    console.log('[ACADEMIC_NEW_YEAR] 🎓 Initialisation nouvelle année:', newYear);

    // Validate new year
    const validationResult = academicYearSchema.safeParse(newYear);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Données nouvelle année invalides',
        errors: validationResult.error.issues
      });
    }

    // Process new academic year setup
    const result = await storage.initializeNewAcademicYear(
      user.schoolId, 
      validationResult.data, 
      promotionSettings,
      user.id
    );

    res.json({
      success: true,
      message: 'Nouvelle année scolaire initialisée avec succès',
      data: result
    });

  } catch (error: any) {
    console.error('[ACADEMIC_NEW_YEAR] ❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'initialisation de la nouvelle année',
      error: error.message
    });
  }
});

// GET /api/academic/template - Télécharger template de configuration
router.get('/template', requireAuth, async (req, res) => {
  try {
    const templateData = [
      {
        'Année scolaire': '2024-2025',
        'Date début année': '2024-09-01',
        'Date fin année': '2025-07-15',
        'Année active': true,
        'Trimestre': 1,
        'Nom trimestre': 'Premier Trimestre',
        'Date début': '2024-09-01',
        'Date fin': '2024-12-15',
        'Actif': true,
        'Note min': 0,
        'Note max': 20,
        'Note passage': 10
      },
      {
        'Année scolaire': '2024-2025',
        'Date début année': '2024-09-01',
        'Date fin année': '2025-07-15',
        'Année active': true,
        'Trimestre': 2,
        'Nom trimestre': 'Deuxième Trimestre',
        'Date début': '2025-01-02',
        'Date fin': '2025-04-05',
        'Actif': false,
        'Note min': 0,
        'Note max': 20,
        'Note passage': 10
      },
      {
        'Année scolaire': '2024-2025',
        'Date début année': '2024-09-01',
        'Date fin année': '2025-07-15',
        'Année active': true,
        'Trimestre': 3,
        'Nom trimestre': 'Troisième Trimestre',
        'Date début': '2025-04-15',
        'Date fin': '2025-07-15',
        'Actif': false,
        'Note min': 0,
        'Note max': 20,
        'Note passage': 10
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Configuration Académique');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename=template-configuration-academique.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error: any) {
    console.error('[ACADEMIC_TEMPLATE] ❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du template'
    });
  }
});

export default router;
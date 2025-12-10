import { Router } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import { storage } from '../storage';
import { z } from 'zod';
import path from 'path';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
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

// Validation schema for subjects
const subjectSchema = z.object({
  name: z.string().min(2, 'Le nom de la matière doit contenir au moins 2 caractères'),
  nameFr: z.string().min(2, 'Le nom français est requis'),
  nameEn: z.string().min(2, 'Le nom anglais est requis'),
  coefficient: z.union([z.number(), z.string()]).transform((val) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? 1 : Math.max(1, Math.min(10, num));
  }),
  hoursPerWeek: z.union([z.number(), z.string()]).transform((val) => {
    const num = typeof val === 'string' ? parseInt(val) : val;
    return isNaN(num) ? 2 : Math.max(1, num);
  }).optional().default(2),
  classLevel: z.string().min(1, 'Le niveau de classe est requis').optional(),
  classId: z.number().optional(),
  department: z.string().optional(),
  category: z.string().optional(),
  subjectType: z.string().optional(),
  bulletinSection: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  isRequired: z.boolean().default(true),
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

// Helper function to normalize subject data
function normalizeSubjectData(rawData: any[]): any[] {
  return rawData.map((row) => ({
    name: row['Nom'] || row['name'] || row['Name'] || '',
    nameFr: row['Nom français'] || row['nameFr'] || row['Nom'] || row['name'] || '',
    nameEn: row['Nom anglais'] || row['nameEn'] || row['Name'] || row['name'] || '',
    coefficient: parseFloat(row['Coefficient'] || row['coefficient'] || row['Coef'] || '1') || 1,
    hoursPerWeek: parseInt(row['Heures'] || row['hoursPerWeek'] || row['Hours'] || row['H/sem'] || row['hours_per_week'] || '2') || 2,
    classLevel: row['Niveau'] || row['classLevel'] || row['Class Level'] || row['Class'] || '',
    department: row['Département'] || row['department'] || row['Department'] || 'Général',
    category: row['Catégorie'] || row['category'] || row['Category'] || 'general',
    description: row['Description'] || row['description'] || '',
    isActive: row['Actif'] !== 'false' && row['isActive'] !== 'false',
    isRequired: row['Obligatoire'] !== 'false' && row['isRequired'] !== 'false'
  }));
}

// Helper function to validate subject data
async function validateSubjectData(data: any[], schoolId: number) {
  const validData: any[] = [];
  const errors: string[] = [];
  let duplicateCount = 0;

  // Get existing subjects
  const existingSubjects = await storage.getSchoolSubjects(schoolId);
  const existingNames = new Set(existingSubjects.map((s: any) => s.name?.toLowerCase()));

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 2; // Excel row number (accounting for header)

    try {
      // Validate schema
      const validatedRow = subjectSchema.parse(row);
      
      // Check for duplicates
      const nameLower = validatedRow.name.toLowerCase();
      if (existingNames.has(nameLower)) {
        errors.push(`Ligne ${rowNumber}: Matière "${validatedRow.name}" existe déjà`);
        duplicateCount++;
        continue;
      }

      // Add to tracking set
      existingNames.add(nameLower);

      // Add school context
      validData.push({
        ...validatedRow,
        schoolId,
        rowNumber,
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
        errors.push(`Ligne ${rowNumber}: ${issues}`);
      } else {
        errors.push(`Ligne ${rowNumber}: Erreur de validation`);
      }
    }
  }

  return {
    validData,
    errors,
    duplicateCount,
    stats: {
      totalRows: data.length,
      validRows: validData.length,
      errorRows: errors.length,
      duplicateRows: duplicateCount
    }
  };
}

// GET /api/subjects - Liste des matières avec filtres
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const { classLevel, department, active } = req.query;
    
    console.log('[SUBJECTS_API] 📚 Récupération matières, filtres:', { classLevel, department, active });

    const subjects = await storage.getSchoolSubjects(user.schoolId);
    
    // Apply filters
    let filteredSubjects = subjects;
    
    if (classLevel) {
      filteredSubjects = filteredSubjects.filter((s: any) => s.classLevel === classLevel);
    }
    
    if (department) {
      filteredSubjects = filteredSubjects.filter((s: any) => s.department === department);
    }
    
    if (active !== undefined) {
      const isActive = active === 'true';
      filteredSubjects = filteredSubjects.filter((s: any) => s.isActive === isActive);
    }

    res.json({
      success: true,
      data: filteredSubjects,
      message: `${filteredSubjects.length} matières trouvées`
    });

  } catch (error: any) {
    console.error('[SUBJECTS_API] ❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des matières',
      error: error.message
    });
  }
});

// POST /api/subjects/import - Import CSV/Excel de matières en masse
router.post('/import', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const user = req.user as any;
    const file = req.file;

    console.log('[SUBJECTS_IMPORT] 📥 Début import matières, school:', user.schoolId);

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    // Parse file data
    const rawData = parseFileData(file);
    console.log('[SUBJECTS_IMPORT] 📊 Données extraites:', rawData.length, 'lignes');

    if (rawData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Le fichier est vide ou ne contient pas de données valides'
      });
    }

    // Normalize and validate data
    const normalizedData = normalizeSubjectData(rawData);
    const validation = await validateSubjectData(normalizedData, user.schoolId);

    console.log('[SUBJECTS_IMPORT] ✅ Validation terminée:', validation.stats);

    // If too many errors, return validation results
    if (validation.errors.length > 0 && validation.validData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune donnée valide trouvée',
        errors: validation.errors,
        stats: validation.stats
      });
    }

    // Import valid data
    const importedSubjects: any[] = [];
    const importErrors: string[] = [];

    for (const subjectData of validation.validData) {
      try {
        const newSubject = await storage.createSubject({
          ...subjectData,
          schoolId: user.schoolId,
          createdBy: user.id,
          createdAt: new Date()
        });
        importedSubjects.push(newSubject);
        console.log('[SUBJECTS_IMPORT] ✅ Matière créée:', newSubject.name);
      } catch (error: any) {
        const errorMsg = `Ligne ${subjectData.rowNumber}: Erreur création - ${error.message}`;
        importErrors.push(errorMsg);
        console.error('[SUBJECTS_IMPORT] ❌ Erreur création:', errorMsg);
      }
    }

    const finalStats = {
      ...validation.stats,
      importedCount: importedSubjects.length,
      importErrors: importErrors.length
    };

    console.log('[SUBJECTS_IMPORT] 🎉 Import terminé:', finalStats);

    res.json({
      success: true,
      message: `Import terminé: ${importedSubjects.length} matières créées`,
      data: {
        importedSubjects,
        stats: finalStats,
        validationErrors: validation.errors,
        importErrors
      }
    });

  } catch (error: any) {
    console.error('[SUBJECTS_IMPORT] ❌ Erreur critique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'import des matières',
      error: error.message
    });
  }
});

// PUT /api/subjects/:id - Modification de matière
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const subjectId = parseInt(req.params.id);
    const user = req.user as any;
    const updates = req.body;

    console.log('[SUBJECTS_API] ✏️ Modification matière:', subjectId);

    // Validate updates
    const validationResult = subjectSchema.partial().safeParse(updates);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: validationResult.error.issues
      });
    }

    const updatedSubject = await storage.updateSubject(subjectId, {
      ...validationResult.data,
      updatedBy: user.id,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Matière mise à jour avec succès',
      data: updatedSubject
    });

  } catch (error: any) {
    console.error('[SUBJECTS_API] ❌ Erreur modification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de la matière',
      error: error.message
    });
  }
});

// DELETE /api/subjects/:id - Suppression de matière
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const subjectId = parseInt(req.params.id);
    const user = req.user as any;

    console.log('[SUBJECTS_API] 🗑️ Suppression matière:', subjectId);

    // Check if subject has associated grades before deletion
    const grades = await storage.getGradesBySubject(subjectId);
    if (grades.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer: ${grades.length} notes associées à cette matière`
      });
    }

    await storage.deleteSubject(subjectId);

    res.json({
      success: true,
      message: 'Matière supprimée avec succès'
    });

  } catch (error: any) {
    console.error('[SUBJECTS_API] ❌ Erreur suppression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la matière',
      error: error.message
    });
  }
});

// GET /api/subjects/template - Télécharger template d'import
router.get('/template', requireAuth, async (req, res) => {
  try {
    const templateData = [
      {
        'Nom': 'Mathématiques',
        'Nom français': 'Mathématiques',
        'Nom anglais': 'Mathematics',
        'Coefficient': 4,
        'Niveau': '6ème',
        'Département': 'Sciences',
        'Description': 'Mathématiques générales',
        'Actif': true
      },
      {
        'Nom': 'Français',
        'Nom français': 'Français',
        'Nom anglais': 'French',
        'Coefficient': 3,
        'Niveau': '6ème',
        'Département': 'Langues',
        'Description': 'Langue française',
        'Actif': true
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Matières');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename=template-matieres.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error: any) {
    console.error('[SUBJECTS_API] ❌ Erreur template:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du template'
    });
  }
});

export default router;
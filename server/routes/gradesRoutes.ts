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
    fileSize: 15 * 1024 * 1024, // 15MB limit for large grade files
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
  if (!req.user || !['Director', 'Admin', 'Teacher', 'SiteAdmin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès requis: Enseignant, Administrateur école ou Directeur' });
  }
  next();
};

// Validation schemas
const gradeImportSchema = z.object({
  studentId: z.number().positive('ID étudiant invalide'),
  studentName: z.string().min(2, 'Nom étudiant requis'),
  subjectId: z.number().positive('ID matière invalide'),
  subjectName: z.string().min(2, 'Nom matière requis'),
  classId: z.number().positive('ID classe invalide'),
  className: z.string().min(1, 'Nom classe requis'),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Format année invalide (YYYY-YYYY)'),
  term: z.enum(['T1', 'T2', 'T3'], { message: 'Trimestre doit être T1, T2 ou T3' }),
  grade: z.number().min(0).max(20, 'Note doit être entre 0 et 20'),
  coefficient: z.number().min(1).max(10).default(1),
  examType: z.enum(['evaluation', 'devoir', 'examen']).default('evaluation'),
  comments: z.string().optional(),
});

const bulkGradeSchema = z.object({
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Format année invalide'),
  term: z.enum(['T1', 'T2', 'T3']),
  classIds: z.array(z.number()).min(1, 'Au moins une classe requise'),
  subjectId: z.number().positive().optional(),
  grades: z.array(gradeImportSchema).min(1, 'Au moins une note requise')
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

// Helper function to normalize grade data
function normalizeGradeData(rawData: any[]): any[] {
  return rawData.map((row) => ({
    studentId: parseInt(row['ID Étudiant'] || row['studentId'] || row['Student ID'] || '0') || 0,
    studentName: row['Nom Étudiant'] || row['studentName'] || row['Student Name'] || '',
    subjectId: parseInt(row['ID Matière'] || row['subjectId'] || row['Subject ID'] || '0') || 0,
    subjectName: row['Matière'] || row['subjectName'] || row['Subject'] || '',
    classId: parseInt(row['ID Classe'] || row['classId'] || row['Class ID'] || '0') || 0,
    className: row['Classe'] || row['className'] || row['Class'] || '',
    academicYear: row['Année'] || row['academicYear'] || row['Academic Year'] || '2024-2025',
    term: (row['Trimestre'] || row['term'] || row['Term'] || 'T1').toUpperCase(),
    grade: parseFloat(row['Note'] || row['grade'] || row['Grade'] || '0') || 0,
    coefficient: parseInt(row['Coefficient'] || row['coefficient'] || row['Coef'] || '1') || 1,
    examType: (row['Type'] || row['examType'] || row['Exam Type'] || 'evaluation').toLowerCase(),
    comments: row['Commentaires'] || row['comments'] || row['Comments'] || ''
  }));
}

// Helper function to validate grade data
async function validateGradeData(data: any[], schoolId: number) {
  const validData: any[] = [];
  const errors: string[] = [];
  let duplicateCount = 0;

  // Get existing data for validation
  const schoolClasses = await storage.getSchoolClasses(schoolId);
  const schoolSubjects = await storage.getSchoolSubjects(schoolId);
  const schoolStudents = await storage.getStudentsBySchool(schoolId);

  const validClassIds = new Set(schoolClasses.map((c: any) => c.id));
  const validSubjectIds = new Set(schoolSubjects.map((s: any) => s.id));
  const validStudentIds = new Set(schoolStudents.map((s: any) => s.id));

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 2; // Excel row number (accounting for header)

    // FIXED: Use safeParse to avoid ReferenceError
    const validation = gradeImportSchema.safeParse(row);
    
    if (!validation.success) {
      // Schema validation failed
      const issues = validation.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      errors.push(`Ligne ${rowNumber}: ${issues}`);
      continue;
    }
    
    const validatedRow = validation.data;
    
    // Check data integrity
    if (!validStudentIds.has(validatedRow.studentId)) {
      errors.push(`Ligne ${rowNumber}: Étudiant ID ${validatedRow.studentId} introuvable`);
      continue;
    }

    if (!validClassIds.has(validatedRow.classId)) {
      errors.push(`Ligne ${rowNumber}: Classe ID ${validatedRow.classId} introuvable`);
      continue;
    }

    if (!validSubjectIds.has(validatedRow.subjectId)) {
      errors.push(`Ligne ${rowNumber}: Matière ID ${validatedRow.subjectId} introuvable`);
      continue;
    }

    // Check for existing grade (duplicate)
    try {
      const existingGrade = await storage.getGradeByStudentSubjectTerm(
        validatedRow.studentId,
        validatedRow.subjectId,
        validatedRow.academicYear,
        validatedRow.term
      );

      if (existingGrade) {
        errors.push(`Ligne ${rowNumber}: Note déjà existante pour cet étudiant/matière/trimestre`);
        duplicateCount++;
        continue;
      }
    } catch (dbError) {
      console.error('[GRADES_VALIDATION] ❌ Erreur vérification doublons:', dbError);
      errors.push(`Ligne ${rowNumber}: Erreur vérification base de données`);
      continue;
    }

    // Add school context
    validData.push({
      ...validatedRow,
      schoolId,
      rowNumber,
    });
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

// POST /api/grades/import-multi-class - Import notes pour plusieurs classes
router.post('/import-multi-class', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const user = req.user as any;
    const file = req.file;
    const { academicYear, term } = req.body;

    console.log('[GRADES_MULTI_IMPORT] 📥 Début import multi-classes, school:', user.schoolId);

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    if (!academicYear || !term) {
      return res.status(400).json({
        success: false,
        message: 'Année scolaire et trimestre requis'
      });
    }

    // Parse file data
    const rawData = parseFileData(file);
    console.log('[GRADES_MULTI_IMPORT] 📊 Données extraites:', rawData.length, 'lignes');

    if (rawData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Le fichier est vide ou ne contient pas de données valides'
      });
    }

    // Normalize and validate data
    const normalizedData = normalizeGradeData(rawData);
    
    // Add provided academic year and term to all rows
    normalizedData.forEach(row => {
      row.academicYear = academicYear;
      row.term = term;
    });

    const validation = await validateGradeData(normalizedData, user.schoolId);

    console.log('[GRADES_MULTI_IMPORT] ✅ Validation terminée:', validation.stats);

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
    const importedGrades: any[] = [];
    const importErrors: string[] = [];

    for (const gradeData of validation.validData) {
      try {
        const newGrade = await storage.createGrade({
          studentId: gradeData.studentId,
          subjectId: gradeData.subjectId,
          classId: gradeData.classId,
          grade: gradeData.grade,
          coefficient: gradeData.coefficient,
          academicYear: gradeData.academicYear,
          term: gradeData.term,
          examType: gradeData.examType,
          comments: gradeData.comments,
          schoolId: user.schoolId,
          teacherId: user.id,
          createdAt: new Date()
        });
        importedGrades.push(newGrade);
        console.log('[GRADES_MULTI_IMPORT] ✅ Note créée:', `${gradeData.studentName} - ${gradeData.subjectName}: ${gradeData.grade}`);
      } catch (error: any) {
        const errorMsg = `Ligne ${gradeData.rowNumber}: Erreur création - ${error.message}`;
        importErrors.push(errorMsg);
        console.error('[GRADES_MULTI_IMPORT] ❌ Erreur création:', errorMsg);
      }
    }

    const finalStats = {
      ...validation.stats,
      importedCount: importedGrades.length,
      importErrors: importErrors.length
    };

    console.log('[GRADES_MULTI_IMPORT] 🎉 Import terminé:', finalStats);

    res.json({
      success: true,
      message: `Import terminé: ${importedGrades.length} notes créées`,
      data: {
        importedGrades,
        stats: finalStats,
        validationErrors: validation.errors,
        importErrors
      }
    });

  } catch (error: any) {
    console.error('[GRADES_MULTI_IMPORT] ❌ Erreur critique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'import des notes multi-classes',
      error: error.message
    });
  }
});

// POST /api/grades/import-by-subject - Import notes par matière
router.post('/import-by-subject', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const user = req.user as any;
    const file = req.file;
    const { subjectId, academicYear, term } = req.body;

    console.log('[GRADES_SUBJECT_IMPORT] 📥 Début import par matière:', subjectId);

    if (!file || !subjectId || !academicYear || !term) {
      return res.status(400).json({
        success: false,
        message: 'Fichier, matière, année scolaire et trimestre requis'
      });
    }

    // Parse file data
    const rawData = parseFileData(file);
    console.log('[GRADES_SUBJECT_IMPORT] 📊 Données extraites:', rawData.length, 'lignes');

    // Simplified format for single subject import
    const normalizedData = rawData.map((row) => ({
      studentId: parseInt(row['ID Étudiant'] || row['studentId'] || '0') || 0,
      studentName: row['Nom Étudiant'] || row['studentName'] || '',
      classId: parseInt(row['ID Classe'] || row['classId'] || '0') || 0,
      className: row['Classe'] || row['className'] || '',
      grade: parseFloat(row['Note'] || row['grade'] || '0') || 0,
      coefficient: parseInt(row['Coefficient'] || row['coefficient'] || '1') || 1,
      examType: (row['Type'] || row['examType'] || 'evaluation').toLowerCase(),
      comments: row['Commentaires'] || row['comments'] || '',
      // Fixed values for subject import
      subjectId: parseInt(subjectId),
      subjectName: 'Matière importée',
      academicYear,
      term
    }));

    const validation = await validateGradeData(normalizedData, user.schoolId);

    console.log('[GRADES_SUBJECT_IMPORT] ✅ Validation terminée:', validation.stats);

    // Import valid data
    const importedGrades: any[] = [];
    const importErrors: string[] = [];

    for (const gradeData of validation.validData) {
      try {
        const newGrade = await storage.createGrade({
          studentId: gradeData.studentId,
          subjectId: gradeData.subjectId,
          classId: gradeData.classId,
          grade: gradeData.grade,
          coefficient: gradeData.coefficient,
          academicYear: gradeData.academicYear,
          term: gradeData.term,
          examType: gradeData.examType,
          comments: gradeData.comments,
          schoolId: user.schoolId,
          teacherId: user.id,
          createdAt: new Date()
        });
        importedGrades.push(newGrade);
      } catch (error: any) {
        const errorMsg = `Ligne ${gradeData.rowNumber}: Erreur création - ${error.message}`;
        importErrors.push(errorMsg);
      }
    }

    res.json({
      success: true,
      message: `Import par matière terminé: ${importedGrades.length} notes créées`,
      data: {
        importedGrades,
        stats: {
          ...validation.stats,
          importedCount: importedGrades.length,
          importErrors: importErrors.length
        },
        errors: validation.errors.concat(importErrors)
      }
    });

  } catch (error: any) {
    console.error('[GRADES_SUBJECT_IMPORT] ❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'import par matière',
      error: error.message
    });
  }
});

// GET /api/grades/export-template - Template Excel pour import
router.get('/export-template', requireAuth, async (req, res) => {
  try {
    const { type = 'multi-class' } = req.query;

    let templateData: any[] = [];

    if (type === 'multi-class') {
      templateData = [
        {
          'ID Étudiant': 1,
          'Nom Étudiant': 'Marie Dupont',
          'ID Matière': 1,
          'Matière': 'Mathématiques',
          'ID Classe': 1,
          'Classe': '6ème A',
          'Année': '2024-2025',
          'Trimestre': 'T1',
          'Note': 15.5,
          'Coefficient': 4,
          'Type': 'evaluation',
          'Commentaires': 'Bon travail'
        },
        {
          'ID Étudiant': 2,
          'Nom Étudiant': 'Jean Martin',
          'ID Matière': 1,
          'Matière': 'Mathématiques',
          'ID Classe': 1,
          'Classe': '6ème A',
          'Année': '2024-2025',
          'Trimestre': 'T1',
          'Note': 12.0,
          'Coefficient': 4,
          'Type': 'evaluation',
          'Commentaires': 'À améliorer'
        }
      ];
    } else if (type === 'subject') {
      templateData = [
        {
          'ID Étudiant': 1,
          'Nom Étudiant': 'Marie Dupont',
          'ID Classe': 1,
          'Classe': '6ème A',
          'Note': 15.5,
          'Coefficient': 4,
          'Type': 'evaluation',
          'Commentaires': 'Bon travail'
        },
        {
          'ID Étudiant': 2,
          'Nom Étudiant': 'Jean Martin',
          'ID Classe': 1,
          'Classe': '6ème A',
          'Note': 12.0,
          'Coefficient': 4,
          'Type': 'evaluation',
          'Commentaires': 'À améliorer'
        }
      ];
    }

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Import Notes');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    const filename = type === 'multi-class' ? 'template-import-notes-multi-classes.xlsx' : 'template-import-notes-par-matiere.xlsx';
    
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error: any) {
    console.error('[GRADES_TEMPLATE] ❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du template'
    });
  }
});

// GET /api/grades/class/:classId - Notes par classe
router.get('/class/:classId', requireAuth, async (req, res) => {
  try {
    const classId = parseInt(req.params.classId);
    const { academicYear, term, subjectId } = req.query;

    console.log('[GRADES_CLASS] 📊 Récupération notes classe:', classId);

    const grades = await storage.getGradesByClass(classId, {
      academicYear,
      term,
      subjectId: subjectId ? parseInt(subjectId as string) : undefined
    });

    res.json({
      success: true,
      data: grades,
      message: `${grades.length} notes trouvées pour la classe`
    });

  } catch (error: any) {
    console.error('[GRADES_CLASS] ❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notes',
      error: error.message
    });
  }
});

// GET /api/grades/student/:studentId - Notes par étudiant
router.get('/student/:studentId', requireAuth, async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const { academicYear, term } = req.query;

    console.log('[GRADES_STUDENT] 📊 Récupération notes étudiant:', studentId);

    const grades = await storage.getStudentGrades(studentId, {
      academicYear,
      term
    });

    res.json({
      success: true,
      data: grades,
      message: `${grades.length} notes trouvées pour l'étudiant`
    });

  } catch (error: any) {
    console.error('[GRADES_STUDENT] ❌ Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notes de l\'étudiant',
      error: error.message
    });
  }
});

export default router;
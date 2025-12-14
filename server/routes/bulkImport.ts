import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import { storage } from '../storage';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { excelImportService } from '../services/excelImportService';
import { bulkPhotoUploadService } from '../services/bulkPhotoUploadService';

const router = Router();

// Configure multer for file uploads (Excel/CSV)
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

// Configure multer for ZIP uploads (photos)
const uploadZip = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for ZIP files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'application/x-zip'
    ];
    
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté. Utilisez un fichier ZIP (.zip)'));
    }
  }
});

// Authentication middleware for bulk operations
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !['Director', 'Admin', 'SiteAdmin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès administrateur école requis' });
  }
  next();
};

// Authentication middleware for template downloads (allows commercial access)
const requireTemplateAuth = (req: Request, res: Response, next: NextFunction) => {
  // SECURITY: Only log safe, non-sensitive information
  console.log('[TEMPLATE_AUTH] Request:', {
    path: req.path,
    method: req.method,
    hasUser: !!req.user,
    hasSession: !!req.session,
    isAuthenticated: req.isAuthenticated?.(),
    isSecure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  });

  if (!req.user) {
    console.log('[TEMPLATE_AUTH] ❌ REJECTED - No authenticated user (session may have expired or cookie not sent)');
    return res.status(401).json({ 
      message: 'Votre session a expiré. Veuillez vous reconnecter pour télécharger les modèles Excel.',
      messageEn: 'Your session has expired. Please log in again to download Excel templates.',
      action: 'REFRESH_AND_LOGIN',
      troubleshooting: {
        fr: 'Solutions: 1) Actualisez la page (F5) et reconnectez-vous. 2) Videz le cache de votre navigateur. 3) Essayez depuis un autre navigateur.',
        en: 'Solutions: 1) Refresh the page (F5) and log in again. 2) Clear your browser cache. 3) Try from another browser.'
      }
    });
  }
  if (!['Director', 'Admin', 'SiteAdmin', 'Commercial'].includes(req.user.role)) {
    console.log('[TEMPLATE_AUTH] ❌ REJECTED - Invalid role (not Director/Admin/SiteAdmin/Commercial)');
    return res.status(403).json({ message: 'Accès autorisé: Administrateurs et Commercial uniquement' });
  }
  console.log('[TEMPLATE_AUTH] ✅ AUTHORIZED - User ID:', req.user.id, 'Role:', req.user.role);
  next();
};

// Validation schemas
const teacherSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Format email invalide'),
  phone: z.string().min(8, 'Le numéro de téléphone doit contenir au moins 8 chiffres'),
  subjects: z.array(z.string()).min(1, 'Au moins une matière est requise'),
  classes: z.array(z.string()).min(1, 'Au moins une classe est requise'),
  experience: z.number().min(0, 'L\'expérience ne peut pas être négative'),
  qualification: z.string().min(2, 'La qualification est requise'),
  department: z.string().optional(),
});

const studentSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Format email invalide'),
  phone: z.string().min(8, 'Le numéro de téléphone doit contenir au moins 8 chiffres'),
  class: z.string().min(1, 'La classe est requise'),
  birthDate: z.string().refine((date) => {
    return /^\d{2}\/\d{2}\/\d{4}$/.test(date);
  }, 'Format de date invalide (JJ/MM/AAAA)'),
  address: z.string().optional(),
  parentContact1: z.string().min(5, 'Contact parent 1 requis'),
  parentContact2: z.string().optional(),
  emergencyContact: z.string().min(5, 'Contact d\'urgence requis'),
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

// Helper function to normalize data
function normalizeData(rawData: any[], userType: 'teachers' | 'students'): any[] {
  return rawData.map((row) => {
    if (userType === 'teachers') {
      return {
        name: row['Nom complet'] || row['nom'] || row['Name'] || '',
        email: row['Email'] || row['email'] || '',
        phone: row['Téléphone'] || row['telephone'] || row['Phone'] || '',
        subjects: typeof row['Matières'] === 'string' 
          ? row['Matières'].split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
        classes: typeof row['Classes'] === 'string'
          ? row['Classes'].split(',').map((c: string) => c.trim()).filter(Boolean)
          : [],
        experience: parseInt(row['Expérience'] || row['experience'] || '0') || 0,
        qualification: row['Diplôme'] || row['qualification'] || row['Qualification'] || '',
        department: row['Département'] || row['department'] || 'Général',
      };
    } else {
      return {
        name: row['Nom complet'] || row['nom'] || row['Name'] || '',
        email: row['Email'] || row['email'] || '',
        phone: row['Téléphone'] || row['telephone'] || row['Phone'] || '',
        class: row['Classe'] || row['class'] || row['Class'] || '',
        birthDate: row['Date de naissance'] || row['birthDate'] || row['Birth Date'] || '',
        address: row['Adresse'] || row['address'] || row['Address'] || '',
        parentContact1: row['Contact parent 1'] || row['parentContact1'] || '',
        parentContact2: row['Contact parent 2'] || row['parentContact2'] || '',
        emergencyContact: row['Contact urgence'] || row['emergencyContact'] || '',
      };
    }
  });
}

// Helper function to validate data
async function validateData(data: any[], userType: 'teachers' | 'students', schoolId: number) {
  const validData: any[] = [];
  const errors: string[] = [];
  let duplicateCount = 0;

  const schema = userType === 'teachers' ? teacherSchema : studentSchema;
  const existingEmails = new Set();
  const existingPhones = new Set();

  // Get existing users to check for duplicates
  try {
    const existingUsers = userType === 'teachers' 
      ? await storage.getAdministrationTeachers(schoolId)
      : await storage.getAdministrationStudents(schoolId);
    
    existingUsers.forEach((user: any) => {
      existingEmails.add(user.email?.toLowerCase());
      existingPhones.add(user.phone);
    });
  } catch (error) {
    console.error('Error fetching existing users:', error);
  }

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 2; // Excel row number (accounting for header)

    try {
      // Validate schema
      const validatedRow = schema.parse(row);
      
      // Check for duplicates
      const emailLower = validatedRow.email.toLowerCase();
      if (existingEmails.has(emailLower)) {
        errors.push(`Ligne ${rowNumber}: Email "${validatedRow.email}" existe déjà`);
        duplicateCount++;
        continue;
      }
      
      if (existingPhones.has(validatedRow.phone)) {
        errors.push(`Ligne ${rowNumber}: Téléphone "${validatedRow.phone}" existe déjà`);
        duplicateCount++;
        continue;
      }

      // Add to tracking sets
      existingEmails.add(emailLower);
      existingPhones.add(validatedRow.phone);

      // Add school context
      validData.push({
        ...validatedRow,
        schoolId,
        rowNumber,
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        errors.push(`Ligne ${rowNumber}: ${fieldErrors}`);
      } else {
        errors.push(`Ligne ${rowNumber}: Erreur de validation`);
      }
    }
  }

  return {
    validData,
    errors,
    validCount: validData.length,
    errorCount: errors.length,
    duplicateCount,
    totalCount: data.length,
  };
}

// Download template endpoint - PUBLIC (no auth required - templates contain no sensitive data)
router.get('/template/:userType', async (req, res) => {
  try {
    const { userType } = req.params;
    const lang = (req.query.lang as 'fr' | 'en') || 'fr';
    
    // Check if it's one of the new import types handled by excelImportService
    if (['classes', 'timetables', 'teachers', 'students', 'rooms', 'settings'].includes(userType)) {
      const buffer = excelImportService.generateTemplate(userType as any, lang);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=template_${userType}_${lang}_${Date.now()}.xlsx`);
      return res.send(buffer);
    }
    
    if (!['teachers', 'students'].includes(userType)) {
      return res.status(400).json({ message: 'Type d\'utilisateur invalide' });
    }

    // Create workbook with template
    const workbook = XLSX.utils.book_new();
    
    let headers: string[];
    let sampleData: any[];

    if (userType === 'teachers') {
      headers = [
        'Nom complet',
        'Email', 
        'Téléphone',
        'Matières',
        'Classes',
        'Expérience',
        'Diplôme',
        'Département'
      ];
      
      sampleData = [
        [
          'Jean Paul Mbarga',
          'jean.mbarga@exemple.com',
          '+237650123456',
          'Mathématiques, Physique',
          '6ème A, 5ème B',
          '5',
          'Licence en Mathématiques',
          'Sciences'
        ],
        [
          'Marie Claire Fotso',
          'marie.fotso@exemple.com', 
          '+237651234567',
          'Français, Littérature',
          '4ème C, 3ème A',
          '8',
          'Master en Lettres Modernes',
          'Lettres'
        ]
      ];
    } else {
      headers = [
        'Nom complet',
        'Email',
        'Téléphone', 
        'Classe',
        'Date de naissance',
        'Adresse',
        'Contact parent 1',
        'Contact parent 2',
        'Contact urgence'
      ];
      
      sampleData = [
        [
          'Emma Talla',
          'emma.talla@exemple.com',
          '+237652123456',
          '6ème A',
          '15/03/2012',
          'Quartier Bastos, Yaoundé',
          'Pierre Talla - +237653234567',
          'Marie Talla - +237654345678',
          'Grand-mère - +237655456789'
        ],
        [
          'Kevin Nkomo',
          'kevin.nkomo@exemple.com',
          '+237653234567', 
          '5ème B',
          '22/08/2011',
          'Bonapriso, Douala',
          'Joseph Nkomo - +237654345678',
          '',
          'Oncle Paul - +237655456789'
        ]
      ];
    }

    // Create worksheet
    const wsData = [headers, ...sampleData];
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    const colWidths = headers.map(() => ({ wch: 20 }));
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, `Template ${userType}`);

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=template_${userType}_${Date.now()}.xlsx`);
    
    res.send(buffer);

  } catch (error) {
    console.error('Template download error:', error);
    res.status(500).json({ message: 'Erreur lors de la génération du modèle' });
  }
});

// Validate file endpoint
router.post('/validate', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const { userType, schoolId, lang } = req.body;
    const language = (lang as 'fr' | 'en') || 'fr';
    
    if (!req.file) {
      return res.status(400).json({ 
        message: language === 'fr' ? 'Aucun fichier fourni' : 'No file provided' 
      });
    }
    
    if (!['teachers', 'students', 'classes', 'timetables', 'rooms'].includes(userType)) {
      return res.status(400).json({ 
        message: language === 'fr' ? 'Type d\'utilisateur invalide' : 'Invalid user type' 
      });
    }

    if (!schoolId) {
      return res.status(400).json({ 
        message: language === 'fr' ? 'ID école requis' : 'School ID required' 
      });
    }

    // Parse file using excelImportService (bilingual support)
    const parsedData = excelImportService.parseFile(req.file.buffer, req.file.originalname, language);
    
    if (parsedData.length === 0) {
      return res.status(400).json({ 
        message: language === 'fr' 
          ? 'Le fichier est vide ou ne contient pas de données valides' 
          : 'File is empty or contains no valid data' 
      });
    }

    // Return parsed data for import step
    res.json(parsedData);

  } catch (error) {
    const language = (req.body.lang as 'fr' | 'en') || 'fr';
    console.error('File validation error:', error);
    res.status(500).json({ 
      message: error instanceof Error 
        ? error.message 
        : (language === 'fr' ? 'Erreur lors de la validation du fichier' : 'File validation error')
    });
  }
});

// Import validated data endpoint
router.post('/import', requireAuth, async (req, res) => {
  try {
    const { userType, schoolId, data, lang } = req.body;
    const language = (lang as 'fr' | 'en') || 'fr';

    if (!['teachers', 'students', 'classes', 'timetables', 'rooms', 'settings'].includes(userType)) {
      return res.status(400).json({ 
        message: language === 'fr' ? 'Type d\'utilisateur invalide' : 'Invalid user type' 
      });
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ 
        message: language === 'fr' ? 'Données d\'import invalides' : 'Invalid import data' 
      });
    }
    
    // Handle new import types using excelImportService
    if (userType === 'classes') {
      const result = await excelImportService.importClasses(data, schoolId, req.user?.id, language);
      return res.json({
        success: result.success,
        message: language === 'fr' ? `${result.created} classes créées avec succès` : `${result.created} classes created successfully`,
        created: result.created,
        errors: result.errors,
        warnings: result.warnings
      });
    }
    
    if (userType === 'timetables') {
      const result = await excelImportService.importTimetables(data, schoolId, req.user?.id, language);
      return res.json({
        success: result.success,
        message: language === 'fr' ? `${result.created} entrées d'emploi du temps créées avec succès` : `${result.created} timetable entries created successfully`,
        created: result.created,
        errors: result.errors,
        warnings: result.warnings
      });
    }
    
    if (userType === 'teachers') {
      const result = await excelImportService.importTeachers(data, schoolId, req.user?.id, language);
      return res.json({
        success: result.success,
        message: language === 'fr' ? `${result.created} enseignants créés avec succès` : `${result.created} teachers created successfully`,
        created: result.created,
        errors: result.errors,
        warnings: result.warnings
      });
    }
    
    if (userType === 'students') {
      const result = await excelImportService.importStudents(data, schoolId, req.user?.id, language);
      return res.json({
        success: result.success,
        message: language === 'fr' ? `${result.created} élèves créés avec succès` : `${result.created} students created successfully`,
        created: result.created,
        errors: result.errors,
        warnings: result.warnings
      });
    }
    
    if (userType === 'rooms') {
      const result = await excelImportService.importRooms(data, schoolId, req.user?.id, language);
      return res.json({
        success: result.success,
        message: language === 'fr' ? `${result.created} salles créées avec succès` : `${result.created} rooms created successfully`,
        created: result.created,
        errors: result.errors,
        warnings: result.warnings
      });
    }
    
    if (userType === 'settings') {
      const result = await excelImportService.importSchoolSettings(data, schoolId, language);
      return res.json({
        success: result.success,
        message: language === 'fr' ? `Paramètres de l'école mis à jour avec succès` : `School settings updated successfully`,
        created: result.created,
        errors: result.errors,
        warnings: result.warnings
      });
    }

    const results = {
      successCount: 0,
      errorCount: 0,
      errors: [] as string[],
      createdUsers: [] as any[],
    };

    for (const item of data) {
      try {
        if (userType === 'teachers') {
          // Generate secure random password for each user
          const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
          const hashedPassword = await bcrypt.hash(randomPassword, 12);
          
          const teacherData = {
            id: Date.now() + Math.random(),
            name: item.name,
            email: item.email,
            password: hashedPassword,
            phone: item.phone,
            role: 'Teacher',
            firstName: item.name.split(' ')[0],
            lastName: item.name.split(' ').slice(1).join(' '),
            subjects: item.subjects,
            classes: item.classes,
            experience: `${item.experience} ans d'expérience`,
            qualification: item.qualification,
            department: item.department || 'Général',
            status: 'active',
            schoolId: parseInt(schoolId),
            createdAt: new Date().toISOString(),
          };

          const createdTeacher = await storage.createTeacher(teacherData);
          results.createdUsers.push(createdTeacher);
          results.successCount++;

        } else {
          // Generate secure random password for each user
          const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
          const hashedPassword = await bcrypt.hash(randomPassword, 12);
          
          const studentData = {
            id: Date.now() + Math.random(),
            name: item.name,
            email: item.email,
            password: hashedPassword,
            phone: item.phone,
            role: 'Student',
            firstName: item.name.split(' ')[0],
            lastName: item.name.split(' ').slice(1).join(' '),
            class: item.class,
            birthDate: item.birthDate,
            address: item.address,
            parentContact1: item.parentContact1,
            parentContact2: item.parentContact2,
            emergencyContact: item.emergencyContact,
            schoolId: parseInt(schoolId),
            createdAt: new Date().toISOString(),
          };

          const createdStudent = await storage.createStudent(studentData);
          results.createdUsers.push(createdStudent);
          results.successCount++;
        }

      } catch (error) {
        console.error(`Error creating ${userType}:`, error);
        results.errorCount++;
        results.errors.push(`Erreur lors de la création de ${item.name}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }

    console.log(`[BULK_IMPORT] Successfully imported ${results.successCount} ${userType} for school ${schoolId}`);

    res.json({
      success: true,
      message: `Import terminé: ${results.successCount} ${userType} créés avec succès`,
      ...results,
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Erreur lors de l\'import en masse'
    });
  }
});

// Generic auto-fix Excel file endpoint for all import types
router.post('/:importType/fix', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const { importType } = req.params;
    const lang = (req.query.lang as 'fr' | 'en') || 'fr';
    
    if (!req.file) {
      return res.status(400).json({ 
        message: lang === 'fr' ? 'Aucun fichier fourni' : 'No file provided' 
      });
    }
    
    const validTypes = ['classes', 'timetables', 'teachers', 'students', 'parents', 'rooms', 'settings'];
    if (!validTypes.includes(importType)) {
      return res.status(400).json({
        message: lang === 'fr' ? 'Type d\'import invalide' : 'Invalid import type'
      });
    }
    
    console.log(`[EXCEL_AUTOFIX_API] Received ${importType} file for auto-fix:`, req.file.originalname);
    
    let correctedBuffer: Buffer;
    
    // Apply type-specific auto-fixes
    switch (importType) {
      case 'classes':
        correctedBuffer = excelImportService.normalizeClassSubjects(
          req.file.buffer, 
          req.file.originalname, 
          lang
        );
        break;
      
      case 'teachers':
        correctedBuffer = excelImportService.normalizeTeacherImport(
          req.file.buffer, 
          req.file.originalname, 
          lang
        );
        break;
      
      case 'students':
        correctedBuffer = excelImportService.normalizeStudentImport(
          req.file.buffer, 
          req.file.originalname, 
          lang
        );
        break;
      
      case 'timetables':
        correctedBuffer = excelImportService.normalizeTimetableImport(
          req.file.buffer, 
          req.file.originalname, 
          lang
        );
        break;
      
      case 'rooms':
        correctedBuffer = excelImportService.normalizeRoomImport(
          req.file.buffer, 
          req.file.originalname, 
          lang
        );
        break;
      
      default:
        // Other types: Return file as-is
        correctedBuffer = req.file.buffer;
        console.log(`[EXCEL_AUTOFIX_API] No specific fixes for ${importType}, returning original file`);
    }
    
    // Generate corrected filename
    const originalName = req.file.originalname.replace(/\.xlsx?$/i, '');
    const correctedFilename = `${originalName}_FIXED_${Date.now()}.xlsx`;
    
    // Send corrected file back to user
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${correctedFilename}"`);
    
    console.log('[EXCEL_AUTOFIX_API] Sending corrected file:', correctedFilename);
    
    res.send(correctedBuffer);
    
  } catch (error) {
    const lang = (req.query.lang as 'fr' | 'en') || 'fr';
    console.error('[EXCEL_AUTOFIX_API] Error auto-fixing file:', error);
    res.status(500).json({ 
      message: error instanceof Error 
        ? error.message 
        : (lang === 'fr' ? 'Erreur lors de la correction automatique du fichier' : 'Error auto-fixing file')
    });
  }
});

// Bulk photo upload via ZIP file
router.post('/photos/upload-zip', requireAuth, uploadZip.single('file'), async (req, res) => {
  try {
    const lang = (req.query.lang as 'fr' | 'en') || 'fr';
    const userType = (req.query.userType as 'students' | 'teachers') || 'students';
    const schoolId = req.user?.schoolId;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: lang === 'fr' ? 'Aucun fichier fourni' : 'No file provided'
      });
    }
    
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: lang === 'fr' ? 'ID école requis' : 'School ID required'
      });
    }
    
    // Validate it's a ZIP file
    if (!req.file.mimetype.includes('zip') && !req.file.originalname.endsWith('.zip')) {
      return res.status(400).json({
        success: false,
        message: lang === 'fr' 
          ? 'Format invalide. Veuillez téléverser un fichier ZIP (.zip)'
          : 'Invalid format. Please upload a ZIP file (.zip)'
      });
    }
    
    console.log(`[BULK_PHOTO_API] Processing ZIP upload for school ${schoolId}, userType: ${userType}, size: ${req.file.size} bytes`);
    
    const result = await bulkPhotoUploadService.processZipUpload(
      req.file.buffer,
      schoolId,
      lang,
      userType
    );
    
    const userLabel = userType === 'teachers' 
      ? (lang === 'fr' ? 'enseignants' : 'teachers')
      : (lang === 'fr' ? 'élèves' : 'students');
    
    res.json({
      success: result.success,
      message: lang === 'fr'
        ? `${result.matched} photos associées aux ${userLabel}, ${result.notMatched} non correspondues`
        : `${result.matched} photos matched to ${userLabel}, ${result.notMatched} not matched`,
      ...result
    });
    
  } catch (error) {
    const lang = (req.query.lang as 'fr' | 'en') || 'fr';
    console.error('[BULK_PHOTO_API] Error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error
        ? error.message
        : (lang === 'fr' ? 'Erreur lors du traitement du fichier ZIP' : 'Error processing ZIP file')
    });
  }
});

export default router;
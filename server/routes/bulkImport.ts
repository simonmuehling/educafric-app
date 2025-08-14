import { Router } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import { storage } from '../storage';
import bcrypt from 'bcrypt';
import { z } from 'zod';

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

// Authentication middleware for bulk operations
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user || !['Director', 'Admin', 'SiteAdmin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès administrateur école requis' });
  }
  next();
};

// Authentication middleware for template downloads (allows commercial access)
const requireTemplateAuth = (req: any, res: any, next: any) => {
  if (!req.user || !['Director', 'Admin', 'SiteAdmin', 'Commercial'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès autorisé: Administrateurs et Commercial' });
  }
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

// Download template endpoint - Accessible by Commercial and Admins
router.get('/template/:userType', requireTemplateAuth, async (req, res) => {
  try {
    const { userType } = req.params;
    
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
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const { userType, schoolId } = req.body;
    
    if (!['teachers', 'students'].includes(userType)) {
      return res.status(400).json({ message: 'Type d\'utilisateur invalide' });
    }

    if (!schoolId) {
      return res.status(400).json({ message: 'ID école requis' });
    }

    // Parse file data
    const rawData = parseFileData(req.file);
    
    if (rawData.length === 0) {
      return res.status(400).json({ message: 'Le fichier est vide ou ne contient pas de données valides' });
    }

    // Normalize data
    const normalizedData = normalizeData(rawData, userType);

    // Validate data
    const validationResults = await validateData(normalizedData, userType, parseInt(schoolId));

    res.json(validationResults);

  } catch (error) {
    console.error('File validation error:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Erreur lors de la validation du fichier'
    });
  }
});

// Import validated data endpoint
router.post('/import', requireAuth, async (req, res) => {
  try {
    const { userType, schoolId, data } = req.body;

    if (!['teachers', 'students'].includes(userType)) {
      return res.status(400).json({ message: 'Type d\'utilisateur invalide' });
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: 'Données d\'import invalides' });
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
          // Create teacher
          const hashedPassword = await bcrypt.hash('educafric2024', 12);
          
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
          // Create student
          const hashedPassword = await bcrypt.hash('educafric2024', 12);
          
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

export default router;
import * as XLSX from 'xlsx';
import * as bcrypt from 'bcryptjs';
import { storage } from '../storage';
import { nanoid } from 'nanoid';
import { db } from '../db';
import { eq, and, or } from 'drizzle-orm';
import { users, classes, subjects, timetables, rooms, schools, teacherSubjectAssignments, classEnrollments, schoolLevels } from '../../shared/schema';

interface TeacherImportData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subjects: string; // Comma or semicolon separated
  experience?: string;
  classes?: string;
  qualification?: string;
}

interface StudentImportData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender: string;
  dateOfBirth: string;
  placeOfBirth?: string;
  matricule: string;
  className: string;
  guardian?: string; // Nom du parent/tuteur (parentName in Excel, guardian in DB)
  parentEmail?: string;
  parentPhone?: string;
  isRepeater?: string; // Redoublant: Oui/Non (isRepeating in Excel, isRepeater in DB)
}

interface ParentImportData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  relation: string;
  profession?: string;
  address?: string;
  childrenMatricules: string; // Semicolon separated
}

interface RoomImportData {
  name: string;
  type: string;
  capacity: number;
  building?: string;
  floor?: string;
  equipment?: string;
}

interface SchoolSettingsImportData {
  name: string;
  type: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  description: string;
  establishedYear: number;
  principalName: string;
  studentCapacity: number;
  regionaleMinisterielle?: string;
  delegationDepartementale?: string;
  boitePostale?: string;
  arrondissement?: string;
}

interface ImportResult {
  success: boolean;
  created: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    data?: any;
  }>;
  warnings: Array<{
    row: number;
    message: string;
  }>;
}

// Bilingual translations
const translations = {
  fr: {
    errors: {
      parseFile: 'Erreur lors de la lecture du fichier',
      minRows: 'Le fichier doit contenir au moins une ligne de données en plus de l\'en-tête',
      creation: 'Erreur lors de la création',
      required: 'requis',
      invalid: 'invalide',
      duplicate: 'doublon détecté',
      notFound: 'introuvable'
    },
    fields: {
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      gender: 'Genre',
      matricule: 'Matricule',
      subjects: 'Matières',
      dateOfBirth: 'DateNaissance',
      placeOfBirth: 'LieuNaissance',
      className: 'Classe',
      parentName: 'NomParent',
      parentEmail: 'EmailParent',
      parentPhone: 'TéléphoneParent',
      isRepeating: 'Redoublant',
      relation: 'Relation',
      profession: 'Profession',
      address: 'Adresse',
      childrenMatricules: 'MatriculesEnfants',
      name: 'Nom',
      section: 'Section',
      maxStudents: 'MaxÉlèves',
      teacherEmail: 'EmailEnseignant',
      academicYear: 'AnnéeAcadémique',
      subject: 'Matière',
      day: 'Jour',
      startTime: 'HeureDébut',
      endTime: 'HeureFin',
      room: 'Salle',
      term: 'Trimestre',
      type: 'Type',
      capacity: 'Capacité',
      building: 'Bâtiment',
      floor: 'Étage',
      equipment: 'Équipement',
      experience: 'Expérience',
      classes: 'Classes',
      qualification: 'Qualification',
      // School Settings fields
      schoolName: 'NomÉcole',
      schoolType: 'TypeÉtablissement',
      website: 'SiteWeb',
      description: 'Description',
      establishedYear: 'AnnéeCréation',
      principalName: 'NomDirecteur',
      studentCapacity: 'CapacitéÉlèves',
      regionaleMinisterielle: 'DélégationRégionale',
      delegationDepartementale: 'DélégationDépartementale',
      boitePostale: 'BoîtePostale',
      arrondissement: 'Arrondissement'
    },
    genders: {
      male: 'Masculin',
      female: 'Féminin'
    }
  },
  en: {
    errors: {
      parseFile: 'Error reading file',
      minRows: 'File must contain at least one data row in addition to the header',
      creation: 'Error during creation',
      required: 'required',
      invalid: 'invalid',
      duplicate: 'duplicate detected',
      notFound: 'not found'
    },
    fields: {
      firstName: 'FirstName',
      lastName: 'LastName',
      email: 'Email',
      phone: 'Phone',
      gender: 'Gender',
      matricule: 'ID',
      subjects: 'Subjects',
      dateOfBirth: 'DateOfBirth',
      placeOfBirth: 'PlaceOfBirth',
      className: 'Class',
      parentName: 'ParentName',
      parentEmail: 'ParentEmail',
      parentPhone: 'ParentPhone',
      isRepeating: 'IsRepeating',
      relation: 'Relation',
      profession: 'Profession',
      address: 'Address',
      childrenMatricules: 'ChildrenIDs',
      name: 'Name',
      section: 'Section',
      maxStudents: 'MaxStudents',
      teacherEmail: 'TeacherEmail',
      academicYear: 'AcademicYear',
      subject: 'Subject',
      day: 'Day',
      startTime: 'StartTime',
      endTime: 'EndTime',
      room: 'Room',
      term: 'Term',
      type: 'Type',
      capacity: 'Capacity',
      building: 'Building',
      floor: 'Floor',
      equipment: 'Equipment',
      experience: 'Experience',
      classes: 'Classes',
      qualification: 'Qualification',
      // School Settings fields
      schoolName: 'SchoolName',
      schoolType: 'InstitutionType',
      website: 'Website',
      description: 'Description',
      establishedYear: 'EstablishedYear',
      principalName: 'PrincipalName',
      studentCapacity: 'StudentCapacity',
      regionaleMinisterielle: 'RegionalDelegation',
      delegationDepartementale: 'DepartmentalDelegation',
      boitePostale: 'POBox',
      arrondissement: 'District'
    },
    genders: {
      male: 'Male',
      female: 'Female'
    }
  }
};

export class ExcelImportService {
  
  /**
   * Parse Excel/CSV file buffer and return JSON data
   */
  parseFile(buffer: Buffer, filename: string, lang: 'fr' | 'en' = 'fr'): any[] {
    const t = translations[lang];
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      // Select the correct data sheet - skip Instructions sheet
      // Look for: "Template", "Modèle", "Données", "Data" (in order of preference)
      let sheetName: string = workbook.SheetNames.find(name => 
        name === 'Modèle' || name === 'Template' || name === 'Données' || name === 'Data'
      ) || '';
      
      // If no matching sheet found, use the first non-Instructions sheet
      if (!sheetName) {
        sheetName = workbook.SheetNames.find((name: string) => 
          name !== 'Instructions'
        ) || workbook.SheetNames[0];
      }
      
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with header row as keys
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        blankrows: false 
      });
      
      // Allow empty files (only headers) for testing/validation purposes
      if (jsonData.length < 1) {
        return []; // Empty file, no headers even
      }
      
      if (jsonData.length < 2) {
        // Only headers, no data rows - this is valid for testing
        return [];
      }
      
      // Convert array format to object format using first row as keys
      const headers = jsonData[0] as string[];
      const mappedData = jsonData.slice(1)
        .map((row: any[], index: number) => {
          const obj: any = { _row: index + 2 }; // Track original row number
          headers.forEach((header, i) => {
            obj[header] = row[i] || '';
          });
          return obj;
        });
      
      console.log(`[EXCEL_PARSE] Mapped ${mappedData.length} rows before filtering`);
      
      const data = mappedData.filter((row: any) => {
        // Filter out completely empty rows (all fields are empty strings)
        const hasAnyData = Object.keys(row).some(key => {
          if (key === '_row') return false; // Ignore the _row tracking field
          const value = row[key];
          return value !== '' && value !== null && value !== undefined;
        });
        if (!hasAnyData) {
          console.log(`[EXCEL_PARSE] Filtering out empty row ${row._row}`);
        }
        return hasAnyData;
      });
      
      console.log(`[EXCEL_PARSE] Returning ${data.length} rows after filtering (removed ${mappedData.length - data.length} empty rows)`);
      if (data.length > 0) {
        console.log(`[EXCEL_PARSE] First row sample:`, Object.keys(data[0]).slice(0, 5));
      }
      
      return data;
    } catch (error) {
      throw new Error(`${t.errors.parseFile}: ${error.message}`);
    }
  }
  
  /**
   * Import teachers from parsed data
   */
  async importTeachers(data: any[], schoolId: number, createdBy: number, lang: 'fr' | 'en' = 'fr'): Promise<ImportResult> {
    const t = translations[lang];
    const result: ImportResult = {
      success: true,
      created: 0,
      errors: [],
      warnings: []
    };
    
    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      try {
        // Support both French and English headers
        const teacherData: TeacherImportData = {
          firstName: row[t.fields.firstName] || row['Prénom'] || row['FirstName'] || '',
          lastName: row[t.fields.lastName] || row['Nom'] || row['LastName'] || '',
          email: row[t.fields.email] || row['Email'] || '',
          phone: row[t.fields.phone] || row['Téléphone'] || row['Phone'] || '',
          subjects: row[t.fields.subjects] || row['Matières'] || row['Subjects'] || '',
          experience: row[t.fields.experience] || row['Expérience'] || row['Experience'] || '',
          classes: row[t.fields.classes] || row['Classes'] || '',
          qualification: row[t.fields.qualification] || row['Qualification'] || ''
        };
        
        // Validate required fields
        if (!teacherData.firstName) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.firstName,
            message: `${t.fields.firstName} ${t.errors.required}`
          });
          continue;
        }
        
        if (!teacherData.lastName) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.lastName,
            message: `${t.fields.lastName} ${t.errors.required}`
          });
          continue;
        }
        
        if (!teacherData.email) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.email,
            message: `${t.fields.email} ${t.errors.required}`
          });
          continue;
        }
        
        // Check for duplicate email
        const [existingTeacher] = await db.select().from(users).where(eq(users.email, teacherData.email)).limit(1);
        if (existingTeacher) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.email,
            message: `${t.fields.email} ${t.errors.duplicate}: ${teacherData.email}`
          });
          continue;
        }
        
        // Parse subjects (will be used to create teacher-subject associations)
        const subjectsArray = teacherData.subjects
          .split(/[;,]/)
          .map(s => s.trim())
          .filter(Boolean);
        
        // Parse qualifications as array
        const qualificationsArray = teacherData.qualification
          ? teacherData.qualification.split(/[;,]/).map(q => q.trim()).filter(Boolean)
          : [];
        
        // Create teacher user with Drizzle - using type assertion for schema compatibility
        const hashedPassword = await bcrypt.hash('eduPass@2024', 10);
        const [newUser] = await db.insert(users).values({
          email: teacherData.email,
          password: hashedPassword,
          firstName: teacherData.firstName,
          lastName: teacherData.lastName,
          phone: teacherData.phone || null,
          role: 'Teacher',
          schoolId: schoolId,
          isActive: true,
          educafricNumber: `EDU-CM-TE-${nanoid(6)}`,
          qualifications: qualificationsArray.length > 0 ? JSON.stringify(qualificationsArray) : null,
          experience: teacherData.experience ? parseInt(teacherData.experience) || 0 : 0,
          position: teacherData.classes || null
        } as any).returning();
        
        result.created++;
        
      } catch (error) {
        result.errors.push({
          row: row._row || index + 2,
          field: 'general',
          message: `${t.errors.creation}: ${error.message}`,
          data: row
        });
      }
    }
    
    result.success = result.errors.length === 0;
    return result;
  }
  
  /**
   * Import students from parsed data
   */
  async importStudents(data: any[], schoolId: number, createdBy: number, lang: 'fr' | 'en' = 'fr'): Promise<ImportResult> {
    const t = translations[lang];
    const result: ImportResult = {
      success: true,
      created: 0,
      errors: [],
      warnings: []
    };
    
    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      try {
        const studentData: StudentImportData = {
          firstName: row[t.fields.firstName] || row['Prénom'] || row['FirstName'] || '',
          lastName: row[t.fields.lastName] || row['Nom'] || row['LastName'] || '',
          email: row[t.fields.email] || row['Email'] || '',
          phone: row[t.fields.phone] || row['Téléphone'] || row['Phone'] || '',
          gender: row[t.fields.gender] || row['Genre'] || row['Gender'] || '',
          dateOfBirth: row[t.fields.dateOfBirth] || row['DateNaissance'] || row['DateOfBirth'] || '',
          placeOfBirth: row[t.fields.placeOfBirth] || row['LieuNaissance'] || row['PlaceOfBirth'] || '',
          matricule: row[t.fields.matricule] || row['Matricule'] || row['ID'] || '',
          className: row[t.fields.className] || row['Classe'] || row['Class'] || '',
          guardian: row[t.fields.parentName] || row['NomParent'] || row['ParentName'] || '',
          parentEmail: row[t.fields.parentEmail] || row['EmailParent'] || row['ParentEmail'] || '',
          parentPhone: row[t.fields.parentPhone] || row['TéléphoneParent'] || row['ParentPhone'] || '',
          isRepeater: row[t.fields.isRepeating] || row['Redoublant'] || row['IsRepeating'] || ''
        };
        
        // Validate required fields
        if (!studentData.firstName) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.firstName,
            message: lang === 'fr' 
              ? 'Ce champ est obligatoire. Veuillez saisir le prénom de l\'élève.'
              : 'This field is required. Please enter the student\'s first name.'
          });
          continue;
        }
        
        if (!studentData.lastName) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.lastName,
            message: lang === 'fr'
              ? 'Ce champ est obligatoire. Veuillez saisir le nom de l\'élève.'
              : 'This field is required. Please enter the student\'s last name.'
          });
          continue;
        }
        
        // Find class by name using Drizzle
        let classId = null;
        if (studentData.className) {
          const [existingClass] = await db.select().from(classes).where(
            and(
              eq(classes.schoolId, schoolId),
              eq(classes.name, studentData.className)
            )
          ).limit(1);
          
          if (existingClass) {
            classId = existingClass.id;
          } else {
            result.warnings.push({
              row: row._row || index + 2,
              message: `${t.fields.className} "${studentData.className}" ${t.errors.notFound}`
            });
          }
        }
        
        // Generate unique EDUCAFRIC number (which will serve as matricule)
        const educafricNumber = studentData.matricule ? `EDU-CM-${studentData.matricule}` : `EDU-CM-ST-${nanoid(6)}`;
        
        // Create student user with Drizzle - using type assertion for schema compatibility
        const hashedPassword = await bcrypt.hash('eduPass@' + (studentData.matricule || '2024'), 10);
        const [newStudent] = await db.insert(users).values({
          email: studentData.email || null,
          password: hashedPassword,
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          phone: studentData.phone || `+237${Date.now()}${nanoid(4)}`,
          role: 'Student',
          schoolId: schoolId,
          classId: classId,
          isActive: true,
          gender: studentData.gender || null,
          dateOfBirth: studentData.dateOfBirth || null,
          placeOfBirth: studentData.placeOfBirth || null,
          educafricNumber: educafricNumber,
          guardian: studentData.guardian || null,
          parentEmail: studentData.parentEmail || null,
          parentPhone: studentData.parentPhone || null,
          isRepeater: studentData.isRepeater === 'Oui' || studentData.isRepeater === 'Yes' ? true : false
        } as any).returning();
        
        result.created++;
        
      } catch (error) {
        result.errors.push({
          row: row._row || index + 2,
          field: 'general',
          message: `${t.errors.creation}: ${error.message}`,
          data: row
        });
      }
    }
    
    result.success = result.errors.length === 0;
    return result;
  }
  
  /**
   * Import parents from parsed data
   */
  async importParents(data: any[], schoolId: number, createdBy: number, lang: 'fr' | 'en' = 'fr'): Promise<ImportResult> {
    const t = translations[lang];
    const result: ImportResult = {
      success: true,
      created: 0,
      errors: [],
      warnings: []
    };
    
    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      try {
        const parentData: ParentImportData = {
          firstName: row[t.fields.firstName] || row['Prénom'] || row['FirstName'] || '',
          lastName: row[t.fields.lastName] || row['Nom'] || row['LastName'] || '',
          email: row[t.fields.email] || row['Email'] || '',
          phone: row[t.fields.phone] || row['Téléphone'] || row['Phone'] || '',
          gender: row[t.fields.gender] || row['Genre'] || row['Gender'] || '',
          relation: row[t.fields.relation] || row['Relation'] || '',
          profession: row[t.fields.profession] || row['Profession'] || '',
          address: row[t.fields.address] || row['Adresse'] || row['Address'] || '',
          childrenMatricules: row[t.fields.childrenMatricules] || row['MatriculesEnfants'] || row['ChildrenIDs'] || ''
        };
        
        // Validate required fields
        if (!parentData.firstName) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.firstName,
            message: `${t.fields.firstName} ${t.errors.required}`
          });
          continue;
        }
        
        if (!parentData.lastName) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.lastName,
            message: `${t.fields.lastName} ${t.errors.required}`
          });
          continue;
        }
        
        if (!parentData.email) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.email,
            message: `${t.fields.email} ${t.errors.required}`
          });
          continue;
        }
        
        // Check for duplicate email
        const [existingParent] = await db.select().from(users).where(eq(users.email, parentData.email)).limit(1);
        if (existingParent) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.email,
            message: `${t.fields.email} ${t.errors.duplicate}: ${parentData.email}`
          });
          continue;
        }
        
        // Create parent user - using type assertion for schema compatibility
        const hashedPassword = await bcrypt.hash('eduPass@2024', 10);
        const [newParent] = await db.insert(users).values({
          email: parentData.email,
          password: hashedPassword,
          firstName: parentData.firstName,
          lastName: parentData.lastName,
          phone: parentData.phone || null,
          role: 'Parent',
          schoolId: schoolId,
          isActive: true,
          educafricNumber: `EDU-CM-PA-${nanoid(6)}`,
          gender: parentData.gender || null,
          address: parentData.address || null,
          profession: parentData.profession || null
        } as any).returning();
        
        result.created++;
        result.warnings.push({
          row: row._row || index + 2,
          message: `Parent créé avec succès. Note: Les liaisons parent-enfant doivent être créées manuellement.`
        });
        
      } catch (error) {
        result.errors.push({
          row: row._row || index + 2,
          field: 'general',
          message: `${t.errors.creation}: ${error.message}`,
          data: row
        });
      }
    }
    
    result.success = result.errors.length === 0;
    return result;
  }
  
  /**
   * Import classes from parsed data
   */
  async importClasses(data: any[], schoolId: number, createdBy: number, lang: 'fr' | 'en' = 'fr'): Promise<ImportResult> {
    const t = translations[lang];
    const result: ImportResult = {
      success: true,
      created: 0,
      errors: [],
      warnings: []
    };
    
    console.log(`[IMPORT_CLASSES] Starting import of ${data.length} classes for school ${schoolId}`);
    
    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      try {
        const subjectsColumn = lang === 'fr' 
          ? 'Matières (nom;coeff;heures;catégorie | séparées par |)'
          : 'Subjects (name;coeff;hours;category | separated by |)';
        
        const classData = {
          name: row[t.fields.name] || row['Nom'] || row['Name'] || '',
          maxStudents: parseInt(row[t.fields.maxStudents] || row['MaxÉlèves'] || row['MaxStudents'] || '30'),
          teacherEmail: row[t.fields.teacherEmail] || row['EmailEnseignant'] || row['TeacherEmail'] || '',
          room: row[t.fields.room] || row['Salle'] || row['Room'] || '',
          subjectsRaw: row[subjectsColumn] || row['Matières'] || row['Subjects'] || ''
        };
        
        // Parse subjects from format: "Maths;4;6;general | Français;4;6;general"
        const subjectsToCreate: any[] = [];
        let hasSubjectValidationError = false;
        if (classData.subjectsRaw) {
          const subjectParts = classData.subjectsRaw.split('|').map((s: string) => s.trim());
          for (const subjectStr of subjectParts) {
            const [name, coeff, hours, category] = subjectStr.split(';').map((s: string) => s.trim());
            if (name) {
              // Validate subject category - Support all 5 types
              const validCategories = ['general', 'scientific', 'literary', 'professional', 'other'];
              const normalizedCategory = category?.toLowerCase();
              if (category && !validCategories.includes(normalizedCategory)) {
                result.errors.push({
                  row: row._row || index + 2,
                  field: lang === 'fr' ? 'Catégorie Matière' : 'Subject Category',
                  message: `${lang === 'fr' ? 'Catégorie matière invalide' : 'Invalid subject category'}: "${category}". ${lang === 'fr' ? 'Valeurs valides' : 'Valid values'}: general, scientific, literary, professional, other`
                });
                hasSubjectValidationError = true;
                break;
              }
              
              subjectsToCreate.push({
                name,
                coefficient: parseInt(coeff) || 1,
                hoursPerWeek: parseInt(hours) || 1,
                category: normalizedCategory || 'general', // Support all 5 types: general, scientific, literary, professional, other
                isRequired: true
              });
            }
          }
        }
        
        // Skip this row if subject validation failed
        if (hasSubjectValidationError) {
          continue;
        }
        
        // Validate required fields
        if (!classData.name) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.name,
            message: lang === 'fr'
              ? 'Ce champ est obligatoire. Veuillez saisir le nom de la classe (ex: 6ème A).'
              : 'This field is required. Please enter the class name (e.g., Form 1A).'
          });
          continue;
        }
        
        // Check for duplicate class name using Drizzle
        const [existingClass] = await db.select().from(classes).where(
          and(
            eq(classes.schoolId, schoolId),
            eq(classes.name, classData.name)
          )
        ).limit(1);
        
        if (existingClass) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.name,
            message: lang === 'fr'
              ? `Une classe avec ce nom existe déjà: "${classData.name}". Veuillez utiliser un nom différent.`
              : `A class with this name already exists: "${classData.name}". Please use a different name.`
          });
          continue;
        }
        
        // Find teacher by email if provided using Drizzle
        let teacherId = null;
        if (classData.teacherEmail) {
          const [teacher] = await db.select().from(users).where(
            and(
              eq(users.email, classData.teacherEmail),
              eq(users.role, 'Teacher')
            )
          ).limit(1);
          
          if (teacher) {
            teacherId = teacher.id;
          }
        }
        
        // Get or create default academic year for the school
        // First try to find an existing active academic year
        let academicYearId = 1; // Default fallback
        
        try {
          // Try to get the school's current academic year
          const [school] = await db.select().from(schools).where(eq(schools.id, schoolId)).limit(1);
          if (school && school.academicYear) {
            // Academic year exists in school settings, use academicYearId = 1 as default
            academicYearId = 1;
          }
        } catch (err) {
          // If academic year lookup fails, use default
          academicYearId = 1;
        }
        
        // Create class with Drizzle - using type assertion for schema compatibility
        const [newClass] = await db.insert(classes).values({
          schoolId,
          name: classData.name,
          maxStudents: classData.maxStudents,
          teacherId,
          academicYearId,
          isActive: true
        } as any).returning();
        
        // Create subjects for the class if provided with complete metadata
        if (subjectsToCreate.length > 0) {
          for (const subjectData of subjectsToCreate) {
            try {
              // Generate unique subject code with timestamp to avoid duplicates
              const baseCode = `${subjectData.name.substring(0, 3).toUpperCase()}-${newClass.name}`;
              const uniqueCode = `${baseCode}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
              
              await db.insert(subjects).values({
                nameFr: subjectData.name,
                nameEn: subjectData.name,
                coefficient: subjectData.coefficient.toString(),
                schoolId,
                classId: newClass.id,
                subjectType: subjectData.category || 'general',
                code: uniqueCode
              } as any);
            } catch (subjectError: any) {
              // If subject creation fails (duplicate code), log and continue
              console.log(`[IMPORT_CLASSES] ⚠️ Subject creation failed for ${subjectData.name} in ${newClass.name}: ${subjectError.message}`);
              // Don't fail the entire class import if one subject fails
            }
          }
        }
        
        result.created++;
        console.log(`[IMPORT_CLASSES] ✅ Successfully created class: ${classData.name} (row ${row._row})`);
        
      } catch (error) {
        console.log(`[IMPORT_CLASSES] ❌ Error creating class at row ${row._row || index + 2}: ${error.message}`);
        result.errors.push({
          row: row._row || index + 2,
          field: 'general',
          message: `${t.errors.creation}: ${error.message}`,
          data: row
        });
      }
    }
    
    console.log(`[IMPORT_CLASSES] Import complete. Created: ${result.created}, Errors: ${result.errors.length}`);
    result.success = result.errors.length === 0;
    return result;
  }
  
  /**
   * Import timetables from parsed data
   */
  async importTimetables(data: any[], schoolId: number, createdBy: number, lang: 'fr' | 'en' = 'fr'): Promise<ImportResult> {
    const t = translations[lang];
    const result: ImportResult = {
      success: true,
      created: 0,
      errors: [],
      warnings: []
    };
    
    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      try {
        const timetableData = {
          className: row[t.fields.className] || row['Classe'] || row['Class'] || '',
          teacherEmail: row[t.fields.teacherEmail] || row['EmailEnseignant'] || row['TeacherEmail'] || '',
          subjectName: row[t.fields.subject] || row['Matière'] || row['Subject'] || '',
          dayOfWeek: parseInt(row[t.fields.day] || row['Jour'] || row['Day'] || '1'),
          startTime: row[t.fields.startTime] || row['HeureDébut'] || row['StartTime'] || '',
          endTime: row[t.fields.endTime] || row['HeureFin'] || row['EndTime'] || '',
          room: row[t.fields.room] || row['Salle'] || row['Room'] || '',
          academicYear: row[t.fields.academicYear] || row['AnnéeAcadémique'] || row['AcademicYear'] || '',
          term: row[t.fields.term] || row['Trimestre'] || row['Term'] || 'Term 1'
        };
        
        // Validate required fields
        if (!timetableData.className) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.className,
            message: `${t.fields.className} ${t.errors.required}`
          });
          continue;
        }
        
        if (!timetableData.teacherEmail) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.teacherEmail,
            message: `${t.fields.teacherEmail} ${t.errors.required}`
          });
          continue;
        }
        
        // Find class using Drizzle
        const [foundClass] = await db.select().from(classes).where(
          and(
            eq(classes.schoolId, schoolId),
            eq(classes.name, timetableData.className)
          )
        ).limit(1);
        
        if (!foundClass) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.className,
            message: `${t.fields.className} ${t.errors.notFound}: ${timetableData.className}`
          });
          continue;
        }
        
        // Find teacher using Drizzle
        const [teacher] = await db.select().from(users).where(
          and(
            eq(users.email, timetableData.teacherEmail),
            eq(users.role, 'Teacher')
          )
        ).limit(1);
        
        if (!teacher) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.teacherEmail,
            message: `${t.fields.teacherEmail} ${t.errors.notFound}: ${timetableData.teacherEmail}`
          });
          continue;
        }
        
        // Find or create subject - try both French and English names
        const [foundSubject] = await db.select().from(subjects).where(
          and(
            eq(subjects.schoolId, schoolId),
            eq(subjects.classId, foundClass.id),
            or(
              eq(subjects.nameFr, timetableData.subjectName),
              eq(subjects.nameEn, timetableData.subjectName)
            )
          )
        ).limit(1);
        
        let subjectId = foundSubject?.id;
        if (!foundSubject) {
          // Create subject if it doesn't exist with minimal required fields - using type assertion for schema compatibility
          const [newSubject] = await db.insert(subjects).values({
            nameFr: timetableData.subjectName,
            nameEn: timetableData.subjectName,
            schoolId,
            classId: foundClass.id,
            coefficient: '1',
            subjectType: 'general',
            code: `${timetableData.subjectName.substring(0, 3).toUpperCase()}-${foundClass.name}`
          } as any).returning();
          subjectId = newSubject.id;
        }
        
        // Check for duplicate timetable slot (same class, day, time)
        const [existingSlot] = await db.select().from(timetables).where(
          and(
            eq(timetables.classId, foundClass.id),
            eq(timetables.dayOfWeek, timetableData.dayOfWeek),
            eq(timetables.startTime, timetableData.startTime)
          )
        ).limit(1);
        
        if (existingSlot) {
          result.warnings.push({
            row: row._row || index + 2,
            message: `${t.fields.className} "${timetableData.className}" already has a timetable entry for day ${timetableData.dayOfWeek} at ${timetableData.startTime}`
          });
          continue; // Skip duplicate slot
        }
        
        // Create timetable entry with Drizzle - using type assertion for schema compatibility
        await db.insert(timetables).values({
          schoolId,
          classId: foundClass.id,
          teacherId: teacher.id,
          subjectId: subjectId,
          dayOfWeek: timetableData.dayOfWeek,
          startTime: timetableData.startTime,
          endTime: timetableData.endTime,
          room: timetableData.room || null,
          academicYear: timetableData.academicYear || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
          term: timetableData.term || 'Term 1',
          subjectName: timetableData.subjectName,
          createdBy: createdBy
        } as any);
        
        result.created++;
        
      } catch (error) {
        result.errors.push({
          row: row._row || index + 2,
          field: 'general',
          message: `${t.errors.creation}: ${error.message}`,
          data: row
        });
      }
    }
    
    result.success = result.errors.length === 0;
    return result;
  }
  
  /**
   * Import rooms from parsed data
   */
  async importRooms(data: any[], schoolId: number, createdBy: number, lang: 'fr' | 'en' = 'fr'): Promise<ImportResult> {
    const t = translations[lang];
    const result: ImportResult = {
      success: true,
      created: 0,
      errors: [],
      warnings: []
    };
    
    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      try {
        const roomData: RoomImportData = {
          name: row[t.fields.name] || row['Nom'] || row['Name'] || '',
          type: row[t.fields.type] || row['Type'] || 'classroom',
          capacity: parseInt(row[t.fields.capacity] || row['Capacité'] || row['Capacity'] || '30'),
          building: row[t.fields.building] || row['Bâtiment'] || row['Building'] || '',
          floor: row[t.fields.floor] || row['Étage'] || row['Floor'] || '',
          equipment: row[t.fields.equipment] || row['Équipement'] || row['Equipment'] || ''
        };
        
        // Validate required fields
        if (!roomData.name) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.name,
            message: `${t.fields.name} ${t.errors.required}`
          });
          continue;
        }
        
        // Validate room type
        const validRoomTypes = ['classroom', 'laboratory', 'computer_lab', 'library', 'sports_hall', 'workshop'];
        if (roomData.type && !validRoomTypes.includes(roomData.type.toLowerCase())) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.type,
            message: `${t.fields.type} ${t.errors.invalid}: "${roomData.type}". ${lang === 'fr' ? 'Valeurs valides' : 'Valid values'}: classroom, laboratory, computer_lab, library, sports_hall, workshop`
          });
          continue;
        }
        
        // Create room in database - using type assertion for schema compatibility
        await db.insert(rooms).values({
          name: roomData.name,
          type: (roomData.type || 'classroom').toLowerCase(),
          capacity: roomData.capacity || 30,
          building: roomData.building,
          floor: roomData.floor,
          equipment: roomData.equipment,
          schoolId,
          isOccupied: false
        } as any);
        
        result.created++;
        
      } catch (error) {
        result.errors.push({
          row: row._row || index + 2,
          field: 'general',
          message: `${t.errors.creation}: ${error.message}`,
          data: row
        });
      }
    }
    
    result.success = result.errors.length === 0;
    return result;
  }
  
  /**
   * Import school settings from parsed data
   */
  async importSchoolSettings(data: any[], schoolId: number, lang: 'fr' | 'en' = 'fr'): Promise<ImportResult> {
    const t = translations[lang];
    const result: ImportResult = {
      success: true,
      created: 0,
      errors: [],
      warnings: []
    };
    
    // School settings should have only one row
    if (data.length === 0) {
      result.errors.push({
        row: 0,
        field: 'general',
        message: lang === 'fr' ? 'Aucune donnée trouvée' : 'No data found'
      });
      result.success = false;
      return result;
    }
    
    const row = data[0]; // Get first row only
    
    try {
      const settingsData: SchoolSettingsImportData = {
        name: row[t.fields.schoolName] || row['NomÉcole'] || row['SchoolName'] || '',
        type: row[t.fields.schoolType] || row['TypeÉtablissement'] || row['InstitutionType'] || '',
        address: row[t.fields.address] || row['Adresse'] || row['Address'] || '',
        phone: row[t.fields.phone] || row['Téléphone'] || row['Phone'] || '',
        email: row[t.fields.email] || row['Email'] || '',
        website: row[t.fields.website] || row['SiteWeb'] || row['Website'] || '',
        description: row[t.fields.description] || row['Description'] || '',
        establishedYear: parseInt(row[t.fields.establishedYear] || row['AnnéeCréation'] || row['EstablishedYear'] || '2020'),
        principalName: row[t.fields.principalName] || row['NomDirecteur'] || row['PrincipalName'] || '',
        studentCapacity: parseInt(row[t.fields.studentCapacity] || row['CapacitéÉlèves'] || row['StudentCapacity'] || '500'),
        regionaleMinisterielle: row[t.fields.regionaleMinisterielle] || row['DélégationRégionale'] || row['RegionalDelegation'] || '',
        delegationDepartementale: row[t.fields.delegationDepartementale] || row['DélégationDépartementale'] || row['DepartmentalDelegation'] || '',
        boitePostale: row[t.fields.boitePostale] || row['BoîtePostale'] || row['POBox'] || '',
        arrondissement: row[t.fields.arrondissement] || row['Arrondissement'] || row['District'] || ''
      };
      
      // Validate required fields
      if (!settingsData.name) {
        result.errors.push({
          row: row._row || 2,
          field: t.fields.schoolName,
          message: `${t.fields.schoolName} ${t.errors.required}`
        });
      }
      
      if (!settingsData.address) {
        result.errors.push({
          row: row._row || 2,
          field: t.fields.address,
          message: `${t.fields.address} ${t.errors.required}`
        });
      }
      
      if (!settingsData.phone) {
        result.errors.push({
          row: row._row || 2,
          field: t.fields.phone,
          message: `${t.fields.phone} ${t.errors.required}`
        });
      }
      
      if (!settingsData.email) {
        result.errors.push({
          row: row._row || 2,
          field: t.fields.email,
          message: `${t.fields.email} ${t.errors.required}`
        });
      }
      
      // If validation errors, don't proceed
      if (result.errors.length > 0) {
        result.success = false;
        return result;
      }
      
      // Validate school type
      const validSchoolTypes = ['public', 'private', 'enterprise'];
      if (settingsData.type && !validSchoolTypes.includes(settingsData.type.toLowerCase())) {
        result.errors.push({
          row: row._row || 2,
          field: t.fields.schoolType,
          message: `${t.fields.schoolType} ${t.errors.invalid}: "${settingsData.type}". ${lang === 'fr' ? 'Valeurs valides' : 'Valid values'}: public, private, enterprise`
        });
        result.success = false;
        return result;
      }
      
      // Update school in database
      const school = await storage.getSchoolById(schoolId);
      if (!school) {
        result.errors.push({
          row: row._row || 2,
          field: 'general',
          message: lang === 'fr' ? 'École introuvable' : 'School not found'
        });
        result.success = false;
        return result;
      }
      
      await storage.updateSchool(schoolId, {
        name: settingsData.name,
        type: (settingsData.type || 'private').toLowerCase(),
        address: settingsData.address,
        phone: settingsData.phone,
        email: settingsData.email,
        website: settingsData.website,
        description: settingsData.description,
        establishedYear: settingsData.establishedYear,
        principalName: settingsData.principalName,
        studentCapacity: settingsData.studentCapacity,
        regionaleMinisterielle: settingsData.regionaleMinisterielle,
        delegationDepartementale: settingsData.delegationDepartementale,
        boitePostale: settingsData.boitePostale,
        arrondissement: settingsData.arrondissement
      });
      
      result.created = 1;
      result.success = true;
      
    } catch (error) {
      result.errors.push({
        row: row._row || 2,
        field: 'general',
        message: `${t.errors.creation}: ${error.message}`,
        data: row
      });
      result.success = false;
    }
    
    return result;
  }
  
  /**
   * Generate template Excel file for download (BILINGUAL)
   */
  generateTemplate(type: 'teachers' | 'students' | 'parents' | 'classes' | 'timetables' | 'rooms' | 'settings', lang: 'fr' | 'en' = 'fr'): Buffer {
    const t = translations[lang];
    let headers: string[];
    let sampleData: any[];
    
    switch (type) {
      case 'teachers':
        headers = [
          t.fields.firstName, 
          t.fields.lastName, 
          t.fields.email, 
          t.fields.phone, 
          t.fields.experience, 
          t.fields.subjects, 
          t.fields.classes, 
          t.fields.qualification
        ];
        sampleData = lang === 'fr' ? [
          ['Paul', 'Mbarga', 'paul.mbarga@educafric.cm', '+237677123456', '8', 'Mathématiques;Physique', '6ème A, 5ème B', 'Master en Mathématiques - Université de Yaoundé I;Licence en Physique'],
          ['Marie', 'Fotso', 'marie.fotso@educafric.cm', '+237655789012', '12', 'Français;Littérature', 'Terminale A, Première A', 'Doctorat en Lettres Modernes - Université de Douala'],
          ['Jean', 'Talla', 'jean.talla@educafric.cm', '+237699345678', '5', 'Histoire;Géographie', '3ème, 4ème', 'Licence en Histoire-Géo - ENS Yaoundé'],
          ['Élise', 'Nkomo', 'elise.nkomo@educafric.cm', '+237678901234', '15', 'Anglais', 'CM1, CM2, 6ème', 'Master TEFL - University of Buea;Licence Anglais']
        ] : [
          ['Paul', 'Mbarga', 'paul.mbarga@educafric.cm', '+237677123456', '8', 'Mathematics;Physics', 'Form 1A, Form 2B', 'Master in Mathematics - University of Yaounde I;Bachelor in Physics'],
          ['Marie', 'Fotso', 'marie.fotso@educafric.cm', '+237655789012', '12', 'French;Literature', 'Upper 6, Lower 6', 'PhD in Modern Literature - University of Douala'],
          ['Jean', 'Talla', 'jean.talla@educafric.cm', '+237699345678', '5', 'History;Geography', 'Form 3, Form 4', 'Bachelor in History-Geography - ENS Yaounde'],
          ['Elise', 'Nkomo', 'elise.nkomo@educafric.cm', '+237678901234', '15', 'English', 'Class 4, Class 5, Form 1', 'Master TEFL - University of Buea;Bachelor English']
        ];
        break;
        
      case 'students':
        headers = [
          t.fields.firstName, 
          t.fields.lastName, 
          t.fields.email, 
          t.fields.phone, 
          t.fields.gender, 
          t.fields.dateOfBirth, 
          t.fields.placeOfBirth,
          t.fields.matricule, 
          t.fields.className, 
          t.fields.parentName,
          t.fields.parentEmail, 
          t.fields.parentPhone,
          t.fields.isRepeating
        ];
        sampleData = lang === 'fr' ? [
          ['Amina', 'Bello', 'amina.bello@educafric.cm', '+237690123456', 'Féminin', '2012-05-15', 'Yaoundé, Cameroun', 'STU-2025-001', '6ème A', 'Ibrahim Bello', 'ibrahim.bello@gmail.com', '+237677234567', 'Non'],
          ['Kevin', 'Ndi', '', '', 'Masculin', '2011-08-22', 'Douala, Cameroun', 'STU-2025-002', '5ème B', 'Grace Ndi', 'grace.ndi@yahoo.fr', '+237655345678', 'Oui'],
          ['Sophie', 'Kamga', 'sophie.kamga@educafric.cm', '+237699456789', 'Féminin', '2013-03-10', 'Bamenda, Cameroun', 'STU-2025-003', 'CM2', 'Joseph Kamga', 'joseph.kamga@outlook.com', '+237678456789', 'Non'],
          ['Lucas', 'Njoya', '', '', 'Masculin', '2012-11-05', 'Bafoussam, Cameroun', 'STU-2025-004', '6ème A', '', '', '', 'Non']
        ] : [
          ['Amina', 'Bello', 'amina.bello@educafric.cm', '+237690123456', 'Female', '2012-05-15', 'Yaounde, Cameroon', 'STU-2025-001', 'Form 1A', 'Ibrahim Bello', 'ibrahim.bello@gmail.com', '+237677234567', 'No'],
          ['Kevin', 'Ndi', '', '', 'Male', '2011-08-22', 'Douala, Cameroon', 'STU-2025-002', 'Form 2B', 'Grace Ndi', 'grace.ndi@yahoo.fr', '+237655345678', 'Yes'],
          ['Sophie', 'Kamga', 'sophie.kamga@educafric.cm', '+237699456789', 'Female', '2013-03-10', 'Bamenda, Cameroon', 'STU-2025-003', 'Class 6', 'Joseph Kamga', 'joseph.kamga@outlook.com', '+237678456789', 'No'],
          ['Lucas', 'Njoya', '', '', 'Male', '2012-11-05', 'Bafoussam, Cameroon', 'STU-2025-004', 'Form 1A', '', '', '', 'No']
        ];
        break;
        
      case 'parents':
        headers = [t.fields.firstName, t.fields.lastName, t.fields.email, t.fields.phone, t.fields.gender, t.fields.relation, t.fields.profession, t.fields.address, t.fields.childrenMatricules];
        sampleData = [];
        break;
        
      case 'classes':
        headers = [
          t.fields.name, 
          t.fields.maxStudents, 
          t.fields.teacherEmail, 
          t.fields.room,
          lang === 'fr' ? 'Matières (nom;coeff;heures;catégorie | séparées par |)' : 'Subjects (name;coeff;hours;category | separated by |)'
        ];
        sampleData = lang === 'fr' ? [
          ['6ème A', '40', 'paul.mbarga@educafric.cm', 'Salle A1', 'Mathématiques;4;6;general | Français;4;6;literary | Anglais;3;4;general | Histoire;2;3;literary | SVT;3;4;scientific'],
          ['Terminale D', '35', 'marie.fotso@educafric.cm', 'Labo Sciences', 'Mathématiques;5;7;scientific | Physique;5;6;scientific | Chimie;4;5;scientific | Philosophie;3;4;literary'],
          ['CM2', '30', 'elise.nkomo@educafric.cm', 'Salle B2', 'Lecture;4;6;general | Calcul;4;6;general | Éveil;3;4;other | Dessin;2;2;other'],
          ['1ère Technique', '25', 'jean.talla@educafric.cm', 'Atelier', 'Électricité;5;8;professional | Mécanique;5;8;professional | Maths Appliquées;4;6;professional | Dessin Professionnel;4;5;professional']
        ] : [
          ['Form 1A', '40', 'paul.mbarga@educafric.cm', 'Room A1', 'Mathematics;4;6;general | French;4;6;literary | English;3;4;general | History;2;3;literary | Biology;3;4;scientific'],
          ['Upper 6 Science', '35', 'marie.fotso@educafric.cm', 'Science Lab', 'Mathematics;5;7;scientific | Physics;5;6;scientific | Chemistry;4;5;scientific | Philosophy;3;4;literary'],
          ['Class 6', '30', 'elise.nkomo@educafric.cm', 'Room B2', 'Reading;4;6;general | Arithmetic;4;6;general | Discovery;3;4;other | Arts;2;2;other'],
          ['Technical Form 5', '25', 'jean.talla@educafric.cm', 'Workshop', 'Electricity;5;8;professional | Mechanics;5;8;professional | Applied Math;4;6;professional | Professional Drawing;4;5;professional']
        ];
        break;
        
      case 'timetables':
        headers = [t.fields.className, t.fields.teacherEmail, t.fields.subject, t.fields.day, t.fields.startTime, t.fields.endTime, t.fields.room, t.fields.academicYear, t.fields.term];
        sampleData = lang === 'fr' ? [
          ['6ème A', 'paul.mbarga@educafric.cm', 'Mathématiques', '1', '08:00', '09:00', 'Salle A1', '2024-2025', 'Trimestre 1'],
          ['6ème A', 'marie.fotso@educafric.cm', 'Français', '1', '09:00', '10:00', 'Salle A1', '2024-2025', 'Trimestre 1'],
          ['6ème A', 'elise.nkomo@educafric.cm', 'Anglais', '1', '10:30', '11:30', 'Salle A1', '2024-2025', 'Trimestre 1'],
          ['5ème B', 'paul.mbarga@educafric.cm', 'Physique', '2', '14:00', '15:00', 'Labo Sciences', '2024-2025', 'Trimestre 1'],
          ['5ème B', 'jean.talla@educafric.cm', 'Histoire', '2', '15:00', '16:00', 'Salle B3', '2024-2025', 'Trimestre 1'],
          ['CM2', 'elise.nkomo@educafric.cm', 'Lecture', '3', '08:00', '09:00', 'Salle B2', '2024-2025', 'Trimestre 1'],
          ['Terminale D', 'marie.fotso@educafric.cm', 'Philosophie', '4', '10:30', '12:00', 'Salle C1', '2024-2025', 'Trimestre 1'],
          ['Terminale D', 'paul.mbarga@educafric.cm', 'Mathématiques', '5', '08:00', '09:30', 'Salle C1', '2024-2025', 'Trimestre 1']
        ] : [
          ['Form 1A', 'paul.mbarga@educafric.cm', 'Mathematics', '1', '08:00', '09:00', 'Room A1', '2024-2025', 'Term 1'],
          ['Form 1A', 'marie.fotso@educafric.cm', 'French', '1', '09:00', '10:00', 'Room A1', '2024-2025', 'Term 1'],
          ['Form 1A', 'elise.nkomo@educafric.cm', 'English', '1', '10:30', '11:30', 'Room A1', '2024-2025', 'Term 1'],
          ['Form 2B', 'paul.mbarga@educafric.cm', 'Physics', '2', '14:00', '15:00', 'Science Lab', '2024-2025', 'Term 1'],
          ['Form 2B', 'jean.talla@educafric.cm', 'History', '2', '15:00', '16:00', 'Room B3', '2024-2025', 'Term 1'],
          ['Class 6', 'elise.nkomo@educafric.cm', 'Reading', '3', '08:00', '09:00', 'Room B2', '2024-2025', 'Term 1'],
          ['Upper 6 Science', 'marie.fotso@educafric.cm', 'Philosophy', '4', '10:30', '12:00', 'Room C1', '2024-2025', 'Term 1'],
          ['Upper 6 Science', 'paul.mbarga@educafric.cm', 'Mathematics', '5', '08:00', '09:30', 'Room C1', '2024-2025', 'Term 1']
        ];
        break;
        
      case 'rooms':
        headers = [t.fields.name, t.fields.type, t.fields.capacity, t.fields.building, t.fields.floor, t.fields.equipment];
        sampleData = lang === 'fr' ? [
          ['Salle A1', 'classroom', '40', 'Bâtiment Principal', 'Rez-de-chaussée', 'Tableau blanc;Projecteur;30 bureaux'],
          ['Labo Sciences', 'laboratory', '30', 'Bâtiment Scientifique', '1er étage', 'Paillasses;Microscopes;Réactifs;Hottes'],
          ['Salle Informatique', 'computer_lab', '35', 'Bâtiment Principal', '2ème étage', '35 ordinateurs;Imprimante;Scanner;Vidéoprojecteur'],
          ['Bibliothèque', 'library', '50', 'Bâtiment Administratif', 'Rez-de-chaussée', '500 livres;Tables de lecture;Ordinateurs consultation'],
          ['Gymnase', 'sports_hall', '100', 'Bâtiment Sportif', 'Rez-de-chaussée', 'Terrain basket;Filets volley;Vestiaires'],
          ['Atelier Technique', 'workshop', '25', 'Bâtiment Technique', 'Rez-de-chaussée', 'Établis;Outils mécaniques;Équipement électrique']
        ] : [
          ['Room A1', 'classroom', '40', 'Main Building', 'Ground Floor', 'Whiteboard;Projector;30 desks'],
          ['Science Lab', 'laboratory', '30', 'Science Building', '1st Floor', 'Lab benches;Microscopes;Reagents;Fume hoods'],
          ['Computer Room', 'computer_lab', '35', 'Main Building', '2nd Floor', '35 computers;Printer;Scanner;Video projector'],
          ['Library', 'library', '50', 'Admin Building', 'Ground Floor', '500 books;Reading tables;Reference computers'],
          ['Sports Hall', 'sports_hall', '100', 'Sports Building', 'Ground Floor', 'Basketball court;Volleyball nets;Changing rooms'],
          ['Technical Workshop', 'workshop', '25', 'Technical Building', 'Ground Floor', 'Workbenches;Mechanical tools;Electrical equipment']
        ];
        break;
        
      case 'settings':
        headers = [
          t.fields.schoolName,
          t.fields.schoolType,
          t.fields.address,
          t.fields.phone,
          t.fields.email,
          t.fields.website,
          t.fields.description,
          t.fields.establishedYear,
          t.fields.principalName,
          t.fields.studentCapacity,
          t.fields.regionaleMinisterielle,
          t.fields.delegationDepartementale,
          t.fields.boitePostale,
          t.fields.arrondissement
        ];
        sampleData = lang === 'fr' ? [
          ['Collège Bilingue Excellence Yaoundé', 'Secondaire', 'Quartier Bastos, Avenue Kennedy, Yaoundé', '+237222201234', 'contact@excellence-yaounde.cm', 'www.excellence-yaounde.cm', 'Établissement d\'excellence offrant un enseignement bilingue de qualité du CM1 à la Terminale', '2010', 'Dr. Emmanuel Fouda', '600', 'Délégation Régionale du Centre', 'Délégation Départementale du Mfoundi', 'BP 12345', 'Yaoundé 3ème']
        ] : [
          ['Bilingual College of Excellence Yaounde', 'Secondary', 'Bastos Quarter, Kennedy Avenue, Yaounde', '+237222201234', 'contact@excellence-yaounde.cm', 'www.excellence-yaounde.cm', 'Excellence institution offering quality bilingual education from Class 4 to Upper Sixth', '2010', 'Dr. Emmanuel Fouda', '600', 'Centre Regional Delegation', 'Mfoundi Divisional Delegation', 'P.O. Box 12345', 'Yaounde 3rd']
        ];
        break;
        
      default:
        throw new Error(lang === 'fr' ? 'Type de template non supporté' : 'Template type not supported');
    }
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const wsData = [headers, ...sampleData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    ws['!cols'] = headers.map(() => ({ width: 20 }));
    
    XLSX.utils.book_append_sheet(wb, ws, lang === 'fr' ? 'Modèle' : 'Template');
    
    // Add instructions sheet for all import templates
    if (['teachers', 'students', 'classes', 'timetables', 'rooms', 'settings'].includes(type)) {
      let instructionsHeaders: string[];
      let instructionsData: string[][];
      
      if (type === 'teachers') {
        instructionsHeaders = [lang === 'fr' ? 'INSTRUCTIONS - IMPORT EN MASSE DES ENSEIGNANTS' : 'INSTRUCTIONS - BULK TEACHER IMPORT'];
        instructionsData = lang === 'fr' ? [
          instructionsHeaders,
          [''],
          ['📋 OBJECTIF'],
          ['Cet outil d\'import Excel facilite l\'ajout de plusieurs enseignants en une seule fois,'],
          ['SANS avoir besoin de créer chaque enseignant individuellement dans l\'interface.'],
          [''],
          ['✅ AVANTAGES'],
          ['• Gain de temps: ajoutez des dizaines d\'enseignants en quelques minutes'],
          ['• Moins d\'erreurs: les données sont validées automatiquement'],
          ['• Comptes créés automatiquement avec mot de passe par défaut: eduPass@2024'],
          [''],
          ['📝 FORMAT DES COLONNES'],
          ['1. Prénom: Prénom de l\'enseignant (obligatoire)'],
          ['2. Nom: Nom de famille de l\'enseignant (obligatoire)'],
          ['3. Email: Adresse email (obligatoire, doit être unique)'],
          ['4. Téléphone: Numéro de téléphone (format: +237XXXXXXXXX)'],
          ['5. Expérience: Années d\'expérience (ex: 5 ans, 8 ans)'],
          ['6. Matières: Matières enseignées, séparées par des points-virgules (ex: Mathématiques;Physique)'],
          ['7. Classes: Classes assignées (ex: 6ème A, 5ème B)'],
          ['8. Qualification: Diplômes et qualifications (ex: Master en Mathématiques - Université de Yaoundé I)'],
          [''],
          ['⚠️ IMPORTANT'],
          ['• L\'email doit être unique pour chaque enseignant'],
          ['• Le mot de passe par défaut sera: eduPass@2024'],
          ['• Les enseignants devront changer leur mot de passe lors de la première connexion'],
          [''],
          ['🚀 COMMENT UTILISER CE FICHIER'],
          ['1. Remplissez les données dans l\'onglet "Données" (gardez les exemples ou remplacez-les)'],
          ['2. Sauvegardez le fichier Excel'],
          ['3. Dans l\'interface EDUCAFRIC, allez dans "Gestion des Enseignants"'],
          ['4. Cliquez sur "Import Excel en Masse"'],
          ['5. Sélectionnez ce fichier et importez'],
          ['6. Vos enseignants seront créés automatiquement avec leurs comptes!'],
          [''],
          ['✨ Les enseignants recevront leurs identifiants par email'],
          [''],
          ['❓ BESOIN D\'AIDE?'],
          ['Contactez le support EDUCAFRIC: support@educafric.cm']
        ] : [
          instructionsHeaders,
          [''],
          ['📋 PURPOSE'],
          ['This Excel import tool allows you to add multiple teachers at once,'],
          ['WITHOUT needing to create each teacher individually in the interface.'],
          [''],
          ['✅ BENEFITS'],
          ['• Time-saving: add dozens of teachers in minutes'],
          ['• Fewer errors: data is validated automatically'],
          ['• Accounts created automatically with default password: eduPass@2024'],
          [''],
          ['📝 COLUMN FORMAT'],
          ['1. FirstName: Teacher\'s first name (required)'],
          ['2. LastName: Teacher\'s last name (required)'],
          ['3. Email: Email address (required, must be unique)'],
          ['4. Phone: Phone number (format: +237XXXXXXXXX)'],
          ['5. Experience: Years of experience (e.g., 5 years, 8 years)'],
          ['6. Subjects: Subjects taught, separated by semicolons (e.g., Mathematics;Physics)'],
          ['7. Classes: Assigned classes (e.g., Form 1A, Grade 5B)'],
          ['8. Qualification: Degrees and qualifications (e.g., Master in Mathematics - University of Yaoundé I)'],
          [''],
          ['⚠️ IMPORTANT'],
          ['• Email must be unique for each teacher'],
          ['• Default password will be: eduPass@2024'],
          ['• Teachers must change their password upon first login'],
          [''],
          ['🚀 HOW TO USE THIS FILE'],
          ['1. Fill in the data in the "Data" tab (keep the examples or replace them)'],
          ['2. Save the Excel file'],
          ['3. In the EDUCAFRIC interface, go to "Teacher Management"'],
          ['4. Click on "Bulk Excel Import"'],
          ['5. Select this file and import'],
          ['6. Your teachers will be created automatically with their accounts!'],
          [''],
          ['✨ Teachers will receive their credentials by email'],
          [''],
          ['❓ NEED HELP?'],
          ['Contact EDUCAFRIC support: support@educafric.cm']
        ];
      } else if (type === 'students') {
        instructionsHeaders = [lang === 'fr' ? 'INSTRUCTIONS - IMPORT EN MASSE DES ÉLÈVES' : 'INSTRUCTIONS - BULK STUDENT IMPORT'];
        instructionsData = lang === 'fr' ? [
          instructionsHeaders,
          [''],
          ['📋 OBJECTIF'],
          ['Cet outil d\'import Excel facilite l\'inscription de plusieurs élèves en une seule fois,'],
          ['SANS avoir besoin d\'inscrire chaque élève individuellement dans l\'interface.'],
          [''],
          ['✅ AVANTAGES'],
          ['• Gain de temps: inscrivez des centaines d\'élèves en quelques minutes'],
          ['• Moins d\'erreurs: les données sont validées automatiquement'],
          ['• Comptes créés automatiquement avec numéro EDUCAFRIC unique'],
          ['• Informations parents incluses pour communication automatique'],
          [''],
          ['📝 FORMAT DES COLONNES'],
          ['1. Prénom: Prénom de l\'élève (obligatoire)'],
          ['2. Nom: Nom de famille de l\'élève (obligatoire)'],
          ['3. Email: Adresse email de l\'élève (optionnel)'],
          ['4. Téléphone: Numéro de téléphone de l\'élève (optionnel)'],
          ['5. Genre: Masculin ou Féminin (obligatoire)'],
          ['6. DateNaissance: Date de naissance au format AAAA-MM-JJ (ex: 2010-03-15)'],
          ['7. LieuNaissance: Lieu de naissance (ex: Yaoundé, Cameroun)'],
          ['8. Matricule: Matricule de l\'élève (ex: STU-2025-001) - sera converti en numéro EDUCAFRIC'],
          ['9. Classe: Nom de la classe (ex: 6ème A, CM2 B) - doit exister dans le système'],
          ['10. NomParent: Nom complet du parent/tuteur'],
          ['11. EmailParent: Email du parent pour les communications'],
          ['12. TéléphoneParent: Téléphone du parent (format: +237XXXXXXXXX)'],
          ['13. Redoublant: Oui ou Non - indique si l\'élève redouble'],
          [''],
          ['⚠️ IMPORTANT'],
          ['• La classe doit exister dans le système avant l\'import'],
          ['• Chaque élève recevra un numéro EDUCAFRIC unique (format: EDU-CM-ST-XXXXXX)'],
          ['• Le mot de passe par défaut sera basé sur le matricule'],
          ['• L\'email est optionnel pour les élèves'],
          [''],
          ['🚀 COMMENT UTILISER CE FICHIER'],
          ['1. Assurez-vous que les classes existent déjà dans le système'],
          ['2. Remplissez les données dans l\'onglet "Données"'],
          ['3. Vérifiez que les noms de classes correspondent exactement'],
          ['4. Sauvegardez le fichier Excel'],
          ['5. Dans l\'interface EDUCAFRIC, allez dans "Gestion des Élèves"'],
          ['6. Cliquez sur "Import Excel en Masse"'],
          ['7. Sélectionnez ce fichier et importez'],
          ['8. Vos élèves seront inscrits automatiquement!'],
          [''],
          ['✨ Les parents recevront une notification avec les identifiants de leurs enfants'],
          [''],
          ['❓ BESOIN D\'AIDE?'],
          ['Contactez le support EDUCAFRIC: support@educafric.cm']
        ] : [
          instructionsHeaders,
          [''],
          ['📋 PURPOSE'],
          ['This Excel import tool allows you to enroll multiple students at once,'],
          ['WITHOUT needing to enroll each student individually in the interface.'],
          [''],
          ['✅ BENEFITS'],
          ['• Time-saving: enroll hundreds of students in minutes'],
          ['• Fewer errors: data is validated automatically'],
          ['• Accounts created automatically with unique EDUCAFRIC number'],
          ['• Parent information included for automatic communication'],
          [''],
          ['📝 COLUMN FORMAT'],
          ['1. FirstName: Student\'s first name (required)'],
          ['2. LastName: Student\'s last name (required)'],
          ['3. Email: Student\'s email address (optional)'],
          ['4. Phone: Student\'s phone number (optional)'],
          ['5. Gender: Male or Female (required)'],
          ['6. DateOfBirth: Date of birth in YYYY-MM-DD format (e.g., 2010-03-15)'],
          ['7. PlaceOfBirth: Place of birth (e.g., Yaounde, Cameroon)'],
          ['8. ID: Student ID (e.g., STU-2025-001) - will be converted to EDUCAFRIC number'],
          ['9. Class: Class name (e.g., Form 1A, Grade 6B) - must exist in the system'],
          ['10. ParentName: Full name of parent/guardian'],
          ['11. ParentEmail: Parent\'s email for communications'],
          ['12. ParentPhone: Parent\'s phone (format: +237XXXXXXXXX)'],
          ['13. IsRepeating: Yes or No - indicates if the student is repeating'],
          [''],
          ['⚠️ IMPORTANT'],
          ['• The class must exist in the system before import'],
          ['• Each student will receive a unique EDUCAFRIC number (format: EDU-CM-ST-XXXXXX)'],
          ['• Default password will be based on the student ID'],
          ['• Email is optional for students'],
          [''],
          ['🚀 HOW TO USE THIS FILE'],
          ['1. Make sure the classes already exist in the system'],
          ['2. Fill in the data in the "Data" tab'],
          ['3. Verify that class names match exactly'],
          ['4. Save the Excel file'],
          ['5. In the EDUCAFRIC interface, go to "Student Management"'],
          ['6. Click on "Bulk Excel Import"'],
          ['7. Select this file and import'],
          ['8. Your students will be enrolled automatically!'],
          [''],
          ['✨ Parents will receive a notification with their children\'s credentials'],
          [''],
          ['❓ NEED HELP?'],
          ['Contact EDUCAFRIC support: support@educafric.cm']
        ];
      } else if (type === 'timetables') {
        instructionsHeaders = [lang === 'fr' ? 'INSTRUCTIONS - IMPORT EN MASSE DES EMPLOIS DU TEMPS' : 'INSTRUCTIONS - BULK TIMETABLE IMPORT'];
        instructionsData = lang === 'fr' ? [
          instructionsHeaders,
          [''],
          ['📋 OBJECTIF'],
          ['Cet outil d\'import Excel facilite la création des emplois du temps pour toutes vos classes,'],
          ['SANS avoir besoin de saisir chaque cours individuellement dans l\'interface.'],
          [''],
          ['✅ AVANTAGES'],
          ['• Gain de temps: créez l\'emploi du temps de toute l\'école en quelques minutes'],
          ['• Moins d\'erreurs: évite les conflits d\'horaires et les doublons'],
          ['• Vision globale: importez tous les cours d\'un coup'],
          ['• Validation automatique: détection des chevauchements'],
          [''],
          ['📝 FORMAT DES COLONNES'],
          ['1. Classe: Nom de la classe (ex: 6ème A) - doit exister dans le système'],
          ['2. EmailEnseignant: Email de l\'enseignant - doit exister dans le système'],
          ['3. Matière: Nom de la matière (ex: Mathématiques, Français)'],
          ['4. Jour: Jour de la semaine (1=Lundi, 2=Mardi, 3=Mercredi, 4=Jeudi, 5=Vendredi, 6=Samedi)'],
          ['5. HeureDébut: Heure de début au format HH:MM (ex: 08:00, 14:30)'],
          ['6. HeureFin: Heure de fin au format HH:MM (ex: 09:00, 15:30)'],
          ['7. Salle: Nom de la salle (optionnel, ex: Salle A1, Labo 1)'],
          ['8. AnnéeAcadémique: Année académique (ex: 2024-2025)'],
          ['9. Trimestre: Trimestre (ex: Term 1, Term 2, Term 3)'],
          [''],
          ['⚠️ IMPORTANT - JOURS DE LA SEMAINE'],
          ['Utilisez les numéros pour les jours:'],
          ['• 1 = Lundi (Monday)'],
          ['• 2 = Mardi (Tuesday)'],
          ['• 3 = Mercredi (Wednesday)'],
          ['• 4 = Jeudi (Thursday)'],
          ['• 5 = Vendredi (Friday)'],
          ['• 6 = Samedi (Saturday)'],
          [''],
          ['⚠️ VÉRIFICATIONS AVANT IMPORT'],
          ['• La classe doit exister dans le système'],
          ['• L\'enseignant doit avoir un compte actif'],
          ['• Pas de chevauchement d\'horaires pour la même classe'],
          ['• Format d\'heure valide (HH:MM en 24h)'],
          [''],
          ['💡 EXEMPLES PRATIQUES'],
          ['Cours du matin: Classe=6ème A, EmailEnseignant=prof.math@educafric.com, Matière=Mathématiques, Jour=1, HeureDébut=08:00, HeureFin=09:00'],
          ['Cours après-midi: Classe=5ème B, EmailEnseignant=prof.francais@educafric.com, Matière=Français, Jour=2, HeureDébut=14:00, HeureFin=15:00'],
          [''],
          ['🚀 COMMENT UTILISER CE FICHIER'],
          ['1. Assurez-vous que toutes les classes et enseignants existent'],
          ['2. Remplissez les données dans l\'onglet "Données"'],
          ['3. Vérifiez qu\'il n\'y a pas de conflits d\'horaires'],
          ['4. Sauvegardez le fichier Excel'],
          ['5. Dans l\'interface EDUCAFRIC, allez dans "Emplois du Temps"'],
          ['6. Cliquez sur "Import Excel en Masse"'],
          ['7. Sélectionnez ce fichier et importez'],
          ['8. Vos emplois du temps seront créés automatiquement!'],
          [''],
          ['✨ Le système détecte automatiquement les conflits et vous avertira'],
          [''],
          ['❓ BESOIN D\'AIDE?'],
          ['Contactez le support EDUCAFRIC: support@educafric.cm']
        ] : [
          instructionsHeaders,
          [''],
          ['📋 PURPOSE'],
          ['This Excel import tool allows you to create timetables for all your classes,'],
          ['WITHOUT needing to enter each lesson individually in the interface.'],
          [''],
          ['✅ BENEFITS'],
          ['• Time-saving: create the entire school timetable in minutes'],
          ['• Fewer errors: avoids schedule conflicts and duplicates'],
          ['• Global view: import all lessons at once'],
          ['• Automatic validation: detects overlaps'],
          [''],
          ['📝 COLUMN FORMAT'],
          ['1. Class: Class name (e.g., Form 1A) - must exist in the system'],
          ['2. TeacherEmail: Teacher\'s email - must exist in the system'],
          ['3. Subject: Subject name (e.g., Mathematics, French)'],
          ['4. Day: Day of the week (1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday)'],
          ['5. StartTime: Start time in HH:MM format (e.g., 08:00, 14:30)'],
          ['6. EndTime: End time in HH:MM format (e.g., 09:00, 15:30)'],
          ['7. Room: Room name (optional, e.g., Room A1, Lab 1)'],
          ['8. AcademicYear: Academic year (e.g., 2024-2025)'],
          ['9. Term: Term (e.g., Term 1, Term 2, Term 3)'],
          [''],
          ['⚠️ IMPORTANT - DAYS OF THE WEEK'],
          ['Use numbers for days:'],
          ['• 1 = Monday'],
          ['• 2 = Tuesday'],
          ['• 3 = Wednesday'],
          ['• 4 = Thursday'],
          ['• 5 = Friday'],
          ['• 6 = Saturday'],
          [''],
          ['⚠️ CHECKS BEFORE IMPORT'],
          ['• Class must exist in the system'],
          ['• Teacher must have an active account'],
          ['• No time overlap for the same class'],
          ['• Valid time format (HH:MM in 24h)'],
          [''],
          ['💡 PRACTICAL EXAMPLES'],
          ['Morning class: Class=Form 1A, TeacherEmail=prof.math@educafric.com, Subject=Mathematics, Day=1, StartTime=08:00, EndTime=09:00'],
          ['Afternoon class: Class=Form 2B, TeacherEmail=prof.french@educafric.com, Subject=French, Day=2, StartTime=14:00, EndTime=15:00'],
          [''],
          ['🚀 HOW TO USE THIS FILE'],
          ['1. Make sure all classes and teachers exist'],
          ['2. Fill in the data in the "Data" tab'],
          ['3. Verify there are no schedule conflicts'],
          ['4. Save the Excel file'],
          ['5. In the EDUCAFRIC interface, go to "Timetables"'],
          ['6. Click on "Bulk Excel Import"'],
          ['7. Select this file and import'],
          ['8. Your timetables will be created automatically!'],
          [''],
          ['✨ The system automatically detects conflicts and will warn you'],
          [''],
          ['❓ NEED HELP?'],
          ['Contact EDUCAFRIC support: support@educafric.cm']
        ];
      } else if (type === 'classes') {
        instructionsHeaders = [lang === 'fr' ? 'INSTRUCTIONS - IMPORT EN MASSE DES CLASSES' : 'INSTRUCTIONS - BULK CLASS IMPORT'];
        instructionsData = lang === 'fr' ? [
        instructionsHeaders,
        [''],
        ['📋 OBJECTIF'],
        ['Cet outil d\'import Excel facilite la création de plusieurs classes en une seule fois,'],
        ['SANS avoir besoin d\'utiliser le bouton "Créer Classe" pour chaque classe individuellement.'],
        [''],
        ['✅ AVANTAGES'],
        ['• Gain de temps: créez des dizaines de classes en quelques minutes'],
        ['• Moins d\'erreurs: les données sont validées automatiquement'],
        ['• Matières incluses: chaque classe est créée avec ses matières (coefficients, heures, types)'],
        [''],
        ['📝 FORMAT DES COLONNES'],
        ['1. Nom: Nom de la classe (ex: 6ème A, Terminale D, CM2)'],
        ['2. MaxÉlèves: Nombre maximum d\'élèves (ex: 40)'],
        ['3. EmailEnseignant: Email du professeur principal (optionnel)'],
        ['4. Salle: Nom de la salle de classe (optionnel)'],
        ['5. Matières: Liste des matières avec leurs détails (voir format ci-dessous)'],
        [''],
        ['🎯 FORMAT DES MATIÈRES (Colonne 5)'],
        ['Format: nom;coefficient;heures;catégorie | nom;coefficient;heures;catégorie | ...'],
        [''],
        ['Exemple: Mathématiques;4;6;general | Français;4;6;literary | Physique;5;6;scientific'],
        [''],
        ['⚠️ IMPORTANT: Séparez chaque matière par le symbole |'],
        [''],
        ['📚 CATÉGORIES DE MATIÈRES (5 types disponibles)'],
        ['• general     → Matières générales (Maths, Géographie, EPS, etc.)'],
        ['• scientific  → Matières scientifiques (Physique, Chimie, Biologie, SVT)'],
        ['• literary      → Matières littéraires (Français, Philosophie, Littérature, Histoire)'],
        ['• professional → Matières professionnelles (Électricité, Mécanique, Dessin Professionnel)'],
        ['• other       → Autres matières (Éveil, Arts, Musique, activités spéciales)'],
        [''],
        ['💡 EXEMPLES PRATIQUES'],
        ['Classe générale: Mathématiques;4;6;general | Français;4;6;literary'],
        ['Classe scientifique: Maths;5;7;scientific | Physique;5;6;scientific | Chimie;4;5;scientific'],
        ['Classe technique: Électricité;5;8;professional | Mécanique;5;8;professional'],
        ['Classe maternelle: Éveil;3;5;other | Lecture;4;6;other | Arts;2;3;other'],
        [''],
        ['🚀 COMMENT UTILISER CE FICHIER'],
        ['1. Remplissez les données dans l\'onglet "Données" (gardez les exemples ou remplacez-les)'],
        ['2. Sauvegardez le fichier Excel'],
        ['3. Dans l\'interface EDUCAFRIC, allez dans "Gestion des Classes"'],
        ['4. Cliquez sur "Import Excel en Masse"'],
        ['5. Sélectionnez ce fichier et importez'],
        ['6. Vos classes seront créées automatiquement avec toutes leurs matières!'],
        [''],
        ['✨ IMPORTANT: Vous n\'avez PAS besoin d\'utiliser le bouton "Créer Classe" individuellement.'],
        ['L\'import crée tout automatiquement pour vous!'],
        [''],
        ['❓ BESOIN D\'AIDE?'],
        ['Contactez le support EDUCAFRIC: support@educafric.cm']
      ] : [
        instructionsHeaders,
        [''],
        ['📋 PURPOSE'],
        ['This Excel import tool allows you to create multiple classes at once,'],
        ['WITHOUT needing to use the "Create Class" button for each class individually.'],
        [''],
        ['✅ BENEFITS'],
        ['• Time-saving: create dozens of classes in minutes'],
        ['• Fewer errors: data is validated automatically'],
        ['• Subjects included: each class is created with its subjects (coefficients, hours, types)'],
        [''],
        ['📝 COLUMN FORMAT'],
        ['1. Name: Class name (e.g., Form 1A, Grade 6, CM2)'],
        ['2. MaxStudents: Maximum number of students (e.g., 40)'],
        ['3. TeacherEmail: Main teacher\'s email (optional)'],
        ['4. Room: Classroom name (optional)'],
        ['5. Subjects: List of subjects with their details (see format below)'],
        [''],
        ['🎯 SUBJECTS FORMAT (Column 5)'],
        ['Format: name;coefficient;hours;category | name;coefficient;hours;category | ...'],
        [''],
        ['Example: Mathematics;4;6;general | French;4;6;literary | Physics;5;6;scientific'],
        [''],
        ['⚠️ IMPORTANT: Separate each subject with the | symbol'],
        [''],
        ['📚 SUBJECT CATEGORIES (5 types available)'],
        ['• general     → General subjects (Math, Geography, PE, etc.)'],
        ['• scientific  → Scientific subjects (Physics, Chemistry, Biology, Life Sciences)'],
        ['• literary      → Literary subjects (French, Philosophy, Literature, History)'],
        ['• professional → Professional subjects (Electricity, Mechanics, Professional Drawing)'],
        ['• other       → Other subjects (Discovery, Arts, Music, special activities)'],
        [''],
        ['💡 PRACTICAL EXAMPLES'],
        ['General class: Mathematics;4;6;general | French;4;6;literary'],
        ['Science class: Math;5;7;scientific | Physics;5;6;scientific | Chemistry;4;5;scientific'],
        ['Technical class: Electricity;5;8;professional | Mechanics;5;8;professional'],
        ['Kindergarten: Discovery;3;5;other | Reading;4;6;other | Arts;2;3;other'],
        [''],
        ['🚀 HOW TO USE THIS FILE'],
        ['1. Fill in the data in the "Data" tab (keep the examples or replace them)'],
        ['2. Save the Excel file'],
        ['3. In the EDUCAFRIC interface, go to "Class Management"'],
        ['4. Click on "Bulk Excel Import"'],
        ['5. Select this file and import'],
        ['6. Your classes will be created automatically with all their subjects!'],
        [''],
        ['✨ IMPORTANT: You do NOT need to use the "Create Class" button individually.'],
        ['The import creates everything automatically for you!'],
        [''],
        ['❓ NEED HELP?'],
        ['Contact EDUCAFRIC support: support@educafric.cm']
      ];
      } else if (type === 'rooms') {
        instructionsHeaders = [lang === 'fr' ? 'INSTRUCTIONS - IMPORT EN MASSE DES SALLES' : 'INSTRUCTIONS - BULK ROOM IMPORT'];
        instructionsData = lang === 'fr' ? [
          instructionsHeaders,
          [''],
          ['📋 OBJECTIF'],
          ['Cet outil d\'import Excel facilite l\'enregistrement de toutes vos salles de classe, laboratoires et espaces,'],
          ['SANS avoir besoin de créer chaque salle individuellement dans l\'interface.'],
          [''],
          ['✅ AVANTAGES'],
          ['• Gain de temps: créez toutes vos salles en quelques minutes'],
          ['• Organisation complète: bibliothèques, laboratoires, ateliers, salles de classe'],
          ['• Gestion d\'équipements: suivi de tout le matériel par salle'],
          ['• Planning facilité: associez facilement les salles aux emplois du temps'],
          [''],
          ['📝 FORMAT DES COLONNES'],
          ['1. Nom: Nom de la salle (ex: Salle A1, Labo Sciences, Bibliothèque)'],
          ['2. Type: Type de salle (voir liste ci-dessous)'],
          ['3. Capacité: Nombre maximum de personnes (ex: 40, 30, 50)'],
          ['4. Bâtiment: Nom du bâtiment (ex: Bâtiment Principal, Bâtiment Scientifique)'],
          ['5. Étage: Niveau de l\'étage (ex: Rez-de-chaussée, 1er étage, 2ème étage)'],
          ['6. Équipement: Liste des équipements séparés par des points-virgules (ex: Tableau blanc;Projecteur)'],
          [''],
          ['🏫 TYPES DE SALLES DISPONIBLES (6 types)'],
          ['• classroom     → Salle de classe standard'],
          ['• laboratory    → Laboratoire (Sciences, Chimie, Physique, SVT)'],
          ['• computer_lab  → Salle informatique avec ordinateurs'],
          ['• library       → Bibliothèque, centre de documentation'],
          ['• sports_hall   → Gymnase, salle de sport, terrain couvert'],
          ['• workshop      → Atelier technique (Électricité, Mécanique, Menuiserie)'],
          [''],
          ['💡 EXEMPLES PRATIQUES'],
          ['Salle de classe: Salle A1 | classroom | 40 | Bâtiment Principal | 1er étage | Tableau blanc;Projecteur;30 bureaux'],
          ['Laboratoire: Labo Chimie | laboratory | 30 | Bâtiment Sciences | 2ème étage | Paillasses;Microscopes;Réactifs;Hottes'],
          ['Informatique: Salle Info 1 | computer_lab | 35 | Bâtiment Principal | Rez-de-chaussée | 35 ordinateurs;Imprimante;Scanner'],
          ['Bibliothèque: Bibliothèque Centrale | library | 60 | Bâtiment Administratif | Rez-de-chaussée | 800 livres;Tables lecture;5 ordinateurs'],
          [''],
          ['⚠️ IMPORTANT - FORMAT ÉQUIPEMENT'],
          ['Listez tous les équipements séparés par des points-virgules (;)'],
          ['Exemples: Tableau blanc;Projecteur;Tables;Chaises'],
          ['         Ordinateurs;Imprimante;Scanner;Tableau interactif'],
          ['         Paillasses;Microscopes;Éprouvettes;Blouses'],
          [''],
          ['🚀 COMMENT UTILISER CE FICHIER'],
          ['1. Remplissez les données dans l\'onglet "Modèle" (utilisez les exemples comme guide)'],
          ['2. Vérifiez que les types de salles sont corrects (classroom, laboratory, etc.)'],
          ['3. Sauvegardez le fichier Excel'],
          ['4. Dans l\'interface EDUCAFRIC, allez dans "Gestion des Salles"'],
          ['5. Cliquez sur "Import Excel en Masse"'],
          ['6. Sélectionnez ce fichier et importez'],
          ['7. Toutes vos salles seront créées avec leurs équipements!'],
          [''],
          ['✨ Les salles seront automatiquement disponibles pour les emplois du temps'],
          [''],
          ['❓ BESOIN D\'AIDE?'],
          ['Contactez le support EDUCAFRIC: support@educafric.cm']
        ] : [
          instructionsHeaders,
          [''],
          ['📋 PURPOSE'],
          ['This Excel import tool allows you to register all your classrooms, laboratories and spaces,'],
          ['WITHOUT needing to create each room individually in the interface.'],
          [''],
          ['✅ BENEFITS'],
          ['• Time-saving: create all your rooms in minutes'],
          ['• Complete organization: libraries, laboratories, workshops, classrooms'],
          ['• Equipment management: track all materials by room'],
          ['• Easy scheduling: easily assign rooms to timetables'],
          [''],
          ['📝 COLUMN FORMAT'],
          ['1. Name: Room name (e.g., Room A1, Science Lab, Library)'],
          ['2. Type: Room type (see list below)'],
          ['3. Capacity: Maximum number of people (e.g., 40, 30, 50)'],
          ['4. Building: Building name (e.g., Main Building, Science Building)'],
          ['5. Floor: Floor level (e.g., Ground Floor, 1st Floor, 2nd Floor)'],
          ['6. Equipment: List of equipment separated by semicolons (e.g., Whiteboard;Projector)'],
          [''],
          ['🏫 AVAILABLE ROOM TYPES (6 types)'],
          ['• classroom     → Standard classroom'],
          ['• laboratory    → Laboratory (Science, Chemistry, Physics, Biology)'],
          ['• computer_lab  → Computer room with computers'],
          ['• library       → Library, documentation center'],
          ['• sports_hall   → Gymnasium, sports hall, indoor court'],
          ['• workshop      → Technical workshop (Electricity, Mechanics, Carpentry)'],
          [''],
          ['💡 PRACTICAL EXAMPLES'],
          ['Classroom: Room A1 | classroom | 40 | Main Building | 1st Floor | Whiteboard;Projector;30 desks'],
          ['Laboratory: Chemistry Lab | laboratory | 30 | Science Building | 2nd Floor | Lab benches;Microscopes;Reagents;Fume hoods'],
          ['Computer Lab: Computer Room 1 | computer_lab | 35 | Main Building | Ground Floor | 35 computers;Printer;Scanner'],
          ['Library: Central Library | library | 60 | Admin Building | Ground Floor | 800 books;Reading tables;5 computers'],
          [''],
          ['⚠️ IMPORTANT - EQUIPMENT FORMAT'],
          ['List all equipment separated by semicolons (;)'],
          ['Examples: Whiteboard;Projector;Tables;Chairs'],
          ['         Computers;Printer;Scanner;Interactive board'],
          ['         Lab benches;Microscopes;Test tubes;Lab coats'],
          [''],
          ['🚀 HOW TO USE THIS FILE'],
          ['1. Fill in the data in the "Template" tab (use examples as a guide)'],
          ['2. Verify that room types are correct (classroom, laboratory, etc.)'],
          ['3. Save the Excel file'],
          ['4. In the EDUCAFRIC interface, go to "Room Management"'],
          ['5. Click on "Bulk Excel Import"'],
          ['6. Select this file and import'],
          ['7. All your rooms will be created with their equipment!'],
          [''],
          ['✨ Rooms will be automatically available for timetables'],
          [''],
          ['❓ NEED HELP?'],
          ['Contact EDUCAFRIC support: support@educafric.cm']
        ];
      } else if (type === 'settings') {
        instructionsHeaders = [lang === 'fr' ? 'INSTRUCTIONS - CONFIGURATION DE L\'ÉCOLE' : 'INSTRUCTIONS - SCHOOL CONFIGURATION'];
        instructionsData = lang === 'fr' ? [
          instructionsHeaders,
          [''],
          ['📋 OBJECTIF'],
          ['Cet outil permet de configurer toutes les informations administratives de votre école en une seule fois,'],
          ['incluant les coordonnées, l\'historique et les détails officiels pour le Ministère.'],
          [''],
          ['✅ AVANTAGES'],
          ['• Configuration complète: toutes les informations administratives en un seul fichier'],
          ['• Conforme MINEDUB: champs requis pour les rapports officiels camerounais'],
          ['• Gain de temps: évite la saisie manuelle de nombreux champs'],
          [''],
          ['📝 FORMAT DES COLONNES'],
          ['CHAMPS OBLIGATOIRES:'],
          ['1. NomÉcole: Nom complet de l\'établissement (ex: Collège Bilingue Excellence Yaoundé)'],
          ['2. TypeÉtablissement: Type (Primaire, Secondaire, Maternelle, Technique)'],
          ['3. Adresse: Adresse complète avec quartier et ville (ex: Quartier Bastos, Avenue Kennedy, Yaoundé)'],
          ['4. Téléphone: Téléphone principal (format: +237XXXXXXXXX)'],
          ['5. Email: Adresse email officielle de l\'école'],
          ['6. Description: Présentation de l\'établissement (mission, valeurs, spécialités)'],
          ['7. AnnéeCréation: Année de création (ex: 2010, 1995)'],
          ['8. NomDirecteur: Nom complet du directeur/proviseur'],
          ['9. CapacitéÉlèves: Nombre maximum d\'élèves acceptés (ex: 500, 800)'],
          [''],
          ['CHAMPS OPTIONNELS:'],
          ['10. SiteWeb: Site internet de l\'école (ex: www.excellence-yaounde.cm)'],
          ['11. DélégationRégionale: Délégation régionale MINEDUB (ex: Délégation Régionale du Centre)'],
          ['12. DélégationDépartementale: Délégation départementale (ex: Délégation Départementale du Mfoundi)'],
          ['13. BoîtePostale: Boîte postale (ex: BP 12345)'],
          ['14. Arrondissement: Arrondissement de localisation (ex: Yaoundé 3ème, Douala 5ème)'],
          [''],
          ['🎯 TYPES D\'ÉTABLISSEMENT DISPONIBLES'],
          ['• Primaire      → École primaire (CP à CM2)'],
          ['• Secondaire    → Collège et Lycée (6ème à Terminale)'],
          ['• Maternelle    → École maternelle (Petite, Moyenne, Grande Section)'],
          ['• Technique     → Lycée technique ou professionnel'],
          ['• Mixte         → Établissement combinant plusieurs niveaux'],
          [''],
          ['💡 EXEMPLES PRATIQUES'],
          ['Secondaire francophone: Collège Bilingue Excellence Yaoundé | Secondaire | Quartier Bastos, Yaoundé | +237222201234 | contact@excellence.cm'],
          ['Primaire anglophone: Glory International School | Primaire | Molyko, Buea | +237233445566 | info@gloryschool.cm'],
          [''],
          ['⚠️ IMPORTANT - CONFORMITÉ MINEDUB'],
          ['Les champs DélégationRégionale, DélégationDépartementale et Arrondissement sont'],
          ['requis pour les rapports officiels au Ministère de l\'Éducation de Base (MINEDUB)'],
          ['et au Ministère des Enseignements Secondaires (MINESEC).'],
          [''],
          ['📍 EXEMPLES DE DÉLÉGATIONS PAR RÉGION'],
          ['Centre: Délégation Régionale du Centre → Mfoundi, Mefou, Nyong-et-Kellé'],
          ['Littoral: Délégation Régionale du Littoral → Wouri, Nkam, Sanaga-Maritime'],
          ['Ouest: Délégation Régionale de l\'Ouest → Bamboutos, Menoua, Mifi'],
          ['Nord-Ouest: North West Regional Delegation → Mezam, Boyo, Bui'],
          ['Sud-Ouest: South West Regional Delegation → Fako, Manyu, Meme'],
          [''],
          ['🚀 COMMENT UTILISER CE FICHIER'],
          ['1. Remplissez UNE SEULE LIGNE de données dans l\'onglet "Modèle"'],
          ['2. Assurez-vous que tous les champs obligatoires sont remplis'],
          ['3. Vérifiez la conformité des informations avec vos documents officiels'],
          ['4. Sauvegardez le fichier Excel'],
          ['5. Dans l\'interface EDUCAFRIC, allez dans "Paramètres de l\'École"'],
          ['6. Cliquez sur "Import Configuration"'],
          ['7. Sélectionnez ce fichier et importez'],
          ['8. Vos paramètres seront enregistrés!'],
          [''],
          ['✨ Ces informations apparaîtront sur tous les documents officiels (bulletins, attestations)'],
          [''],
          ['❓ BESOIN D\'AIDE?'],
          ['Contactez le support EDUCAFRIC: support@educafric.cm']
        ] : [
          instructionsHeaders,
          [''],
          ['📋 PURPOSE'],
          ['This tool allows you to configure all administrative information of your school at once,'],
          ['including contact details, history and official details for the Ministry.'],
          [''],
          ['✅ BENEFITS'],
          ['• Complete configuration: all administrative information in one file'],
          ['• MINEDUB compliant: required fields for official Cameroonian reports'],
          ['• Time-saving: avoids manual entry of many fields'],
          [''],
          ['📝 COLUMN FORMAT'],
          ['REQUIRED FIELDS:'],
          ['1. SchoolName: Full name of institution (e.g., Bilingual College of Excellence Yaounde)'],
          ['2. InstitutionType: Type (Primary, Secondary, Nursery, Technical)'],
          ['3. Address: Complete address with quarter and city (e.g., Bastos Quarter, Kennedy Avenue, Yaounde)'],
          ['4. Phone: Main phone number (format: +237XXXXXXXXX)'],
          ['5. Email: Official school email address'],
          ['6. Description: School presentation (mission, values, specialties)'],
          ['7. EstablishedYear: Year of establishment (e.g., 2010, 1995)'],
          ['8. PrincipalName: Full name of principal/headmaster'],
          ['9. StudentCapacity: Maximum number of students accepted (e.g., 500, 800)'],
          [''],
          ['OPTIONAL FIELDS:'],
          ['10. Website: School website (e.g., www.excellence-yaounde.cm)'],
          ['11. RegionalDelegation: MINEDUB regional delegation (e.g., Centre Regional Delegation)'],
          ['12. DivisionalDelegation: Divisional delegation (e.g., Mfoundi Divisional Delegation)'],
          ['13. POBox: Post office box (e.g., P.O. Box 12345)'],
          ['14. District: Location district (e.g., Yaounde 3rd, Douala 5th)'],
          [''],
          ['🎯 AVAILABLE INSTITUTION TYPES'],
          ['• Primary      → Primary school (Class 1 to Class 6)'],
          ['• Secondary    → College and High School (Form 1 to Upper 6)'],
          ['• Nursery      → Nursery school (Toddler, Nursery 1, Nursery 2)'],
          ['• Technical    → Technical or vocational high school'],
          ['• Mixed        → Institution combining multiple levels'],
          [''],
          ['💡 PRACTICAL EXAMPLES'],
          ['Francophone secondary: Bilingual College of Excellence Yaounde | Secondary | Bastos Quarter, Yaounde | +237222201234 | contact@excellence.cm'],
          ['Anglophone primary: Glory International School | Primary | Molyko, Buea | +237233445566 | info@gloryschool.cm'],
          [''],
          ['⚠️ IMPORTANT - MINEDUB COMPLIANCE'],
          ['The RegionalDelegation, DivisionalDelegation and District fields are'],
          ['required for official reports to the Ministry of Basic Education (MINEDUB)'],
          ['and the Ministry of Secondary Education (MINESEC).'],
          [''],
          ['📍 DELEGATION EXAMPLES BY REGION'],
          ['Centre: Centre Regional Delegation → Mfoundi, Mefou, Nyong-et-Kellé'],
          ['Littoral: Littoral Regional Delegation → Wouri, Nkam, Sanaga-Maritime'],
          ['West: West Regional Delegation → Bamboutos, Menoua, Mifi'],
          ['North West: North West Regional Delegation → Mezam, Boyo, Bui'],
          ['South West: South West Regional Delegation → Fako, Manyu, Meme'],
          [''],
          ['🚀 HOW TO USE THIS FILE'],
          ['1. Fill in ONLY ONE LINE of data in the "Template" tab'],
          ['2. Ensure all required fields are completed'],
          ['3. Verify information matches your official documents'],
          ['4. Save the Excel file'],
          ['5. In the EDUCAFRIC interface, go to "School Settings"'],
          ['6. Click on "Import Configuration"'],
          ['7. Select this file and import'],
          ['8. Your settings will be saved!'],
          [''],
          ['✨ This information will appear on all official documents (report cards, certificates)'],
          [''],
          ['❓ NEED HELP?'],
          ['Contact EDUCAFRIC support: support@educafric.cm']
        ];
      }
      
      const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
      wsInstructions['!cols'] = [{ width: 100 }];
      XLSX.utils.book_append_sheet(wb, wsInstructions, lang === 'fr' ? 'Instructions' : 'Instructions');
    }
    
    // Generate buffer
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
  
  /**
   * Auto-fix common errors in class import Excel files
   * Fixes: lowercase 'l' separators → pipe '|', validates categories
   */
  normalizeClassSubjects(buffer: Buffer, filename: string, lang: 'fr' | 'en' = 'fr'): Buffer {
    console.log('[EXCEL_AUTOFIX] Starting auto-fix for classes import file');
    
    const validCategories = ['general', 'scientific', 'literary', 'technical', 'other'];
    
    // Parse the workbook
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    // Find the data sheet (skip Instructions sheet)
    let sheetName: string = workbook.SheetNames.find(name => 
      name === 'Modèle' || name === 'Template' || name === 'Données' || name === 'Data'
    ) || '';
    
    if (!sheetName) {
      sheetName = workbook.SheetNames.find((name: string) => 
        name !== 'Instructions'
      ) || workbook.SheetNames[0];
    }
    
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON to work with data
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      blankrows: false 
    });
    
    if (jsonData.length < 2) {
      console.log('[EXCEL_AUTOFIX] File has no data rows to fix');
      return buffer; // Return original if no data
    }
    
    // Headers in first row
    const headers = jsonData[0] as string[];
    
    // Find the subjects column - support both French and English
    const subjectsColumnPatterns = [
      'Matières (nom;coeff;heures;catégorie | séparées par |)',
      'Subjects (name;coeff;hours;category | separated by |)',
      'Matières',
      'Subjects'
    ];
    
    let subjectsColIndex = -1;
    for (const pattern of subjectsColumnPatterns) {
      subjectsColIndex = headers.findIndex(h => h && h.includes(pattern.split('(')[0].trim()));
      if (subjectsColIndex !== -1) break;
    }
    
    if (subjectsColIndex === -1) {
      console.log('[EXCEL_AUTOFIX] Could not find subjects column');
      return buffer; // Return original if subjects column not found
    }
    
    console.log(`[EXCEL_AUTOFIX] Found subjects column at index ${subjectsColIndex}: "${headers[subjectsColIndex]}"`);
    
    let fixCount = 0;
    
    // Process each data row (skip header row 0)
    for (let rowIndex = 1; rowIndex < jsonData.length; rowIndex++) {
      const row = jsonData[rowIndex] as any[];
      const subjectsValue = row[subjectsColIndex];
      
      if (!subjectsValue || typeof subjectsValue !== 'string') continue;
      
      // Fix 1: Replace lowercase 'l' with pipe '|' (with surrounding spaces)
      let fixedValue = subjectsValue
        .replace(/ l /g, ' | ')  // " l " → " | "
        .replace(/\|l /g, '| ')  // "|l " → "| "
        .replace(/ l\|/g, ' |'); // " l|" → " |"
      
      // Fix 2: Validate and normalize categories
      const subjectParts = fixedValue.split('|').map(s => s.trim());
      const normalizedParts: string[] = [];
      
      for (const part of subjectParts) {
        if (!part) continue;
        
        const segments = part.split(';').map(s => s.trim());
        
        // Expected format: name;coeff;hours;category
        if (segments.length >= 4) {
          const [name, coeff, hours, category] = segments;
          const normalizedCategory = category.toLowerCase().trim();
          
          // Validate category
          if (validCategories.includes(normalizedCategory)) {
            normalizedParts.push(`${name};${coeff};${hours};${normalizedCategory}`);
          } else {
            // Try to extract valid category if it's embedded in text
            const foundCategory = validCategories.find(cat => normalizedCategory.includes(cat));
            if (foundCategory) {
              normalizedParts.push(`${name};${coeff};${hours};${foundCategory}`);
              console.log(`[EXCEL_AUTOFIX] Row ${rowIndex + 1}: Extracted category '${foundCategory}' from '${category}'`);
            } else {
              // Default to 'general' if no valid category found
              normalizedParts.push(`${name};${coeff};${hours};general`);
              console.log(`[EXCEL_AUTOFIX] Row ${rowIndex + 1}: Invalid category '${category}', defaulting to 'general'`);
            }
          }
        } else {
          // Keep incomplete entries as-is
          normalizedParts.push(part);
        }
      }
      
      const finalValue = normalizedParts.join(' | ');
      
      if (finalValue !== subjectsValue) {
        row[subjectsColIndex] = finalValue;
        fixCount++;
        console.log(`[EXCEL_AUTOFIX] Row ${rowIndex + 1}: Fixed subjects`);
        console.log(`  Before: ${subjectsValue.substring(0, 100)}...`);
        console.log(`  After:  ${finalValue.substring(0, 100)}...`);
      }
    }
    
    console.log(`[EXCEL_AUTOFIX] Fixed ${fixCount} rows`);
    
    // Convert back to worksheet
    const newWorksheet = XLSX.utils.aoa_to_sheet(jsonData);
    
    // Preserve column widths
    newWorksheet['!cols'] = worksheet['!cols'] || headers.map(() => ({ width: 20 }));
    
    // Replace the worksheet in the workbook
    workbook.Sheets[sheetName] = newWorksheet;
    
    // Generate corrected buffer
    const correctedBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    console.log('[EXCEL_AUTOFIX] Auto-fix complete');
    return correctedBuffer;
  }

  /**
   * Shared normalization helpers
   */
  private normalizeDelimiters(value: string): string {
    // Accept commas, semicolons, or pipes - standardize to semicolon
    return value.replace(/[,|]/g, ';').replace(/\s*;\s*/g, ';').trim();
  }

  private normalizePhone(phone: string): string {
    if (!phone) return '';
    // Remove spaces, dashes, parentheses
    let normalized = phone.replace(/[\s\-()]/g, '');
    // Add +237 if missing country code for Cameroon
    if (normalized.length === 9 && !normalized.startsWith('+')) {
      normalized = '+237' + normalized;
    }
    return normalized;
  }

  private normalizeDate(dateValue: any): string {
    if (!dateValue) return '';
    
    // Handle Excel serial dates
    if (typeof dateValue === 'number') {
      const excelEpoch = new Date(1900, 0, 1);
      const days = dateValue - 2; // Excel bug: 1900 is wrongly treated as leap year
      const date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
      return date.toISOString().split('T')[0];
    }
    
    const str = String(dateValue).trim();
    
    // Try DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmyMatch) {
      const [, day, month, year] = dmyMatch;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }
    
    return str; // Return as-is if unparseable
  }

  private normalizeBoolean(value: any): string {
    // Preserve blank/empty values
    if (value === null || value === undefined || value === '') return '';
    
    const str = String(value).toLowerCase().trim();
    
    // If already normalized, return as-is
    if (str === 'oui' || str === 'non') return str.charAt(0).toUpperCase() + str.slice(1);
    
    // Map yes values to "Oui"
    const yesValues = ['yes', 'y', 'o', '1', 'true', 'vrai'];
    if (yesValues.includes(str)) return 'Oui';
    
    // Map no values to "Non"
    const noValues = ['no', 'n', '0', 'false', 'faux'];
    if (noValues.includes(str)) return 'Non';
    
    // Keep unknown values as-is to avoid data loss
    return String(value);
  }

  private normalizeGender(value: any): string {
    if (!value) return 'M';
    const str = String(value).toLowerCase().trim();
    const femaleValues = ['f', 'female', 'féminin', 'feminin', 'femme', 'fille', '0'];
    return femaleValues.includes(str) ? 'F' : 'M';
  }

  /**
   * Auto-fix Teachers import
   * Fixes: delimiter drift, phone numbers, experience parsing, subject/class deduplication
   */
  normalizeTeacherImport(buffer: Buffer, filename: string, lang: 'fr' | 'en' = 'fr'): Buffer {
    console.log('[EXCEL_AUTOFIX] Starting auto-fix for teachers import');
    
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames.find(n => n !== 'Instructions') || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', blankrows: false });
    
    if (jsonData.length < 2) return buffer;
    
    const headers = jsonData[0] as string[];
    let fixCount = 0;
    
    // Find column indices
    const subjectsCol = headers.findIndex(h => h && (h.includes('Matières') || h.includes('Subjects')));
    const classesCol = headers.findIndex(h => h && (h.includes('Classes') || h.includes('Classe')));
    const phoneCol = headers.findIndex(h => h && (h.includes('Téléphone') || h.includes('Phone')));
    const experienceCol = headers.findIndex(h => h && (h.includes('Expérience') || h.includes('Experience')));
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      
      // Fix subjects delimiters and dedupe
      if (subjectsCol !== -1 && row[subjectsCol]) {
        const original = String(row[subjectsCol]);
        const normalized = this.normalizeDelimiters(original);
        const unique = [...new Set(normalized.split(';').map(s => s.trim()).filter(Boolean))].join(';');
        if (unique !== original) {
          row[subjectsCol] = unique;
          fixCount++;
        }
      }
      
      // Fix classes delimiters and dedupe
      if (classesCol !== -1 && row[classesCol]) {
        const original = String(row[classesCol]);
        const normalized = this.normalizeDelimiters(original);
        const unique = [...new Set(normalized.split(';').map(s => s.trim()).filter(Boolean))].join(';');
        if (unique !== original) {
          row[classesCol] = unique;
          fixCount++;
        }
      }
      
      // Fix phone number
      if (phoneCol !== -1 && row[phoneCol]) {
        const original = String(row[phoneCol]);
        const normalized = this.normalizePhone(original);
        if (normalized !== original) {
          row[phoneCol] = normalized;
          fixCount++;
        }
      }
      
      // Fix experience (extract number - supports multi-digit)
      if (experienceCol !== -1 && row[experienceCol]) {
        const original = String(row[experienceCol]);
        // Extract all consecutive digits (handles "10 ans", "5 years", etc.)
        const match = original.match(/(\d+)/);
        if (match) {
          const numericValue = parseInt(match[1], 10);
          // Only update if it was non-numeric originally
          if (original !== String(numericValue)) {
            row[experienceCol] = numericValue;
            fixCount++;
          }
        }
      }
    }
    
    console.log(`[EXCEL_AUTOFIX] Teachers: Fixed ${fixCount} cells`);
    
    const newWorksheet = XLSX.utils.aoa_to_sheet(jsonData);
    newWorksheet['!cols'] = worksheet['!cols'] || headers.map(() => ({ width: 20 }));
    workbook.Sheets[sheetName] = newWorksheet;
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Auto-fix Students import
   * Fixes: gender variations, date formats, matricule padding, isRepeater boolean
   */
  normalizeStudentImport(buffer: Buffer, filename: string, lang: 'fr' | 'en' = 'fr'): Buffer {
    console.log('[EXCEL_AUTOFIX] Starting auto-fix for students import');
    
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames.find(n => n !== 'Instructions') || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', blankrows: false });
    
    if (jsonData.length < 2) return buffer;
    
    const headers = jsonData[0] as string[];
    let fixCount = 0;
    
    // Find column indices
    const genderCol = headers.findIndex(h => h && (h.includes('Genre') || h.includes('Gender') || h.includes('Sexe')));
    const dobCol = headers.findIndex(h => h && (h.includes('DateNaissance') || h.includes('Date') || h.includes('Birth')));
    const matriculeCol = headers.findIndex(h => h && (h.includes('Matricule') || h.includes('Student ID')));
    const isRepeaterCol = headers.findIndex(h => h && (h.includes('Redoublant') || h.includes('Repeater')));
    const phoneCol = headers.findIndex(h => h && h.includes('Téléphone') && !h.includes('Parent'));
    const parentPhoneCol = headers.findIndex(h => h && (h.includes('TéléphoneParent') || h.includes('ParentPhone')));
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      
      // Fix gender
      if (genderCol !== -1 && row[genderCol]) {
        const original = row[genderCol];
        const normalized = this.normalizeGender(original);
        if (normalized !== original) {
          row[genderCol] = normalized;
          fixCount++;
        }
      }
      
      // Fix date of birth
      if (dobCol !== -1 && row[dobCol]) {
        const original = row[dobCol];
        const normalized = this.normalizeDate(original);
        if (normalized !== String(original)) {
          row[dobCol] = normalized;
          fixCount++;
        }
      }
      
      // Fix matricule padding (ensure 6 digits)
      if (matriculeCol !== -1 && row[matriculeCol]) {
        const original = String(row[matriculeCol]);
        if (/^\d+$/.test(original) && original.length < 6) {
          row[matriculeCol] = original.padStart(6, '0');
          fixCount++;
        }
      }
      
      // Fix isRepeater boolean (only normalize if value exists and needs fixing)
      if (isRepeaterCol !== -1 && row[isRepeaterCol] !== undefined && row[isRepeaterCol] !== '') {
        const original = row[isRepeaterCol];
        const normalized = this.normalizeBoolean(original);
        // Only update if actually changed (not already "Oui" or "Non")
        const origStr = String(original).toLowerCase();
        if (origStr !== 'oui' && origStr !== 'non' && normalized !== original) {
          row[isRepeaterCol] = normalized;
          fixCount++;
        }
      }
      
      // Fix phone numbers
      if (phoneCol !== -1 && row[phoneCol]) {
        const original = String(row[phoneCol]);
        const normalized = this.normalizePhone(original);
        if (normalized !== original) {
          row[phoneCol] = normalized;
          fixCount++;
        }
      }
      
      if (parentPhoneCol !== -1 && row[parentPhoneCol]) {
        const original = String(row[parentPhoneCol]);
        const normalized = this.normalizePhone(original);
        if (normalized !== original) {
          row[parentPhoneCol] = normalized;
          fixCount++;
        }
      }
    }
    
    console.log(`[EXCEL_AUTOFIX] Students: Fixed ${fixCount} cells`);
    
    const newWorksheet = XLSX.utils.aoa_to_sheet(jsonData);
    newWorksheet['!cols'] = worksheet['!cols'] || headers.map(() => ({ width: 20 }));
    workbook.Sheets[sheetName] = newWorksheet;
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Auto-fix Timetable import
   * Fixes: day aliases, time formats, time ranges, deduplication
   */
  normalizeTimetableImport(buffer: Buffer, filename: string, lang: 'fr' | 'en' = 'fr'): Buffer {
    console.log('[EXCEL_AUTOFIX] Starting auto-fix for timetable import');
    
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames.find(n => n !== 'Instructions') || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', blankrows: false });
    
    if (jsonData.length < 2) return buffer;
    
    const headers = jsonData[0] as string[];
    let fixCount = 0;
    
    // Day name mappings
    const dayMappings: Record<string, string> = {
      'mon': 'Monday', 'lun': 'Monday', 'lundi': 'Monday',
      'tue': 'Tuesday', 'mar': 'Tuesday', 'mardi': 'Tuesday',
      'wed': 'Wednesday', 'mer': 'Wednesday', 'mercredi': 'Wednesday',
      'thu': 'Thursday', 'jeu': 'Thursday', 'jeudi': 'Thursday',
      'fri': 'Friday', 'ven': 'Friday', 'vendredi': 'Friday',
      'sat': 'Saturday', 'sam': 'Saturday', 'samedi': 'Saturday',
      'sun': 'Sunday', 'dim': 'Sunday', 'dimanche': 'Sunday'
    };
    
    const dayCol = headers.findIndex(h => h && (h.includes('Jour') || h.includes('Day')));
    const startCol = headers.findIndex(h => h && (h.includes('Début') || h.includes('Start') || h.includes('Heure')));
    const endCol = headers.findIndex(h => h && (h.includes('Fin') || h.includes('End')));
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      
      // Fix day aliases
      if (dayCol !== -1 && row[dayCol]) {
        const original = String(row[dayCol]).toLowerCase().trim();
        const mapped = dayMappings[original];
        if (mapped && mapped !== row[dayCol]) {
          row[dayCol] = mapped;
          fixCount++;
        }
      }
      
      // Fix time formats (convert to HH:MM)
      const normalizeTime = (timeValue: any): string => {
        if (!timeValue) return '';
        let str = String(timeValue).trim();
        
        // Handle "08h30" format
        str = str.replace(/h/gi, ':');
        
        // Handle "0830" format
        if (/^\d{4}$/.test(str)) {
          str = str.substring(0, 2) + ':' + str.substring(2);
        }
        
        // Handle "8.30" format
        str = str.replace(/\./, ':');
        
        // Ensure HH:MM format
        const match = str.match(/(\d{1,2}):?(\d{2})/);
        if (match) {
          return `${match[1].padStart(2, '0')}:${match[2]}`;
        }
        
        return str;
      };
      
      if (startCol !== -1 && row[startCol]) {
        const original = row[startCol];
        const normalized = normalizeTime(original);
        if (normalized !== String(original)) {
          row[startCol] = normalized;
          fixCount++;
        }
      }
      
      if (endCol !== -1 && row[endCol]) {
        const original = row[endCol];
        const normalized = normalizeTime(original);
        if (normalized !== String(original)) {
          row[endCol] = normalized;
          fixCount++;
        }
      }
    }
    
    console.log(`[EXCEL_AUTOFIX] Timetable: Fixed ${fixCount} cells`);
    
    const newWorksheet = XLSX.utils.aoa_to_sheet(jsonData);
    newWorksheet['!cols'] = worksheet['!cols'] || headers.map(() => ({ width: 20 }));
    workbook.Sheets[sheetName] = newWorksheet;
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Auto-fix Rooms import
   * Fixes: capacity parsing, room type synonyms, name casing, equipment lists
   */
  normalizeRoomImport(buffer: Buffer, filename: string, lang: 'fr' | 'en' = 'fr'): Buffer {
    console.log('[EXCEL_AUTOFIX] Starting auto-fix for rooms import');
    
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames.find(n => n !== 'Instructions') || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', blankrows: false });
    
    if (jsonData.length < 2) return buffer;
    
    const headers = jsonData[0] as string[];
    let fixCount = 0;
    
    // Room type mappings
    const typeMappings: Record<string, string> = {
      'lab': 'laboratory', 'labo': 'laboratory', 'laboratoire': 'laboratory',
      'class': 'classroom', 'classe': 'classroom', 'salle de classe': 'classroom',
      'conf': 'conference', 'conférence': 'conference',
      'gym': 'gymnasium', 'gymnase': 'gymnasium',
      'lib': 'library', 'bibliothèque': 'library',
      'office': 'office', 'bureau': 'office'
    };
    
    const capacityCol = headers.findIndex(h => h && (h.includes('Capacité') || h.includes('Capacity')));
    const typeCol = headers.findIndex(h => h && (h.includes('Type')));
    const nameCol = headers.findIndex(h => h && (h.includes('Nom') || h.includes('Name')));
    const equipmentCol = headers.findIndex(h => h && (h.includes('Équipement') || h.includes('Equipment')));
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      
      // Fix capacity (extract number - supports multi-digit)
      if (capacityCol !== -1 && row[capacityCol]) {
        const original = String(row[capacityCol]);
        // Extract all consecutive digits (handles "30 élèves", "50 students", etc.)
        const match = original.match(/(\d+)/);
        if (match) {
          const numericValue = parseInt(match[1], 10);
          // Only update if it was non-numeric originally
          if (original !== String(numericValue)) {
            row[capacityCol] = numericValue;
            fixCount++;
          }
        }
      }
      
      // Fix room type synonyms
      if (typeCol !== -1 && row[typeCol]) {
        const original = String(row[typeCol]).toLowerCase().trim();
        const mapped = typeMappings[original];
        if (mapped && mapped !== row[typeCol]) {
          row[typeCol] = mapped;
          fixCount++;
        }
      }
      
      // Fix name casing (Title Case)
      if (nameCol !== -1 && row[nameCol]) {
        const original = String(row[nameCol]);
        const titleCase = original.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
        if (titleCase !== original) {
          row[nameCol] = titleCase;
          fixCount++;
        }
      }
      
      // Fix equipment list delimiters
      if (equipmentCol !== -1 && row[equipmentCol]) {
        const original = String(row[equipmentCol]);
        const normalized = this.normalizeDelimiters(original);
        if (normalized !== original) {
          row[equipmentCol] = normalized;
          fixCount++;
        }
      }
    }
    
    console.log(`[EXCEL_AUTOFIX] Rooms: Fixed ${fixCount} cells`);
    
    const newWorksheet = XLSX.utils.aoa_to_sheet(jsonData);
    newWorksheet['!cols'] = worksheet['!cols'] || headers.map(() => ({ width: 20 }));
    workbook.Sheets[sheetName] = newWorksheet;
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}

export const excelImportService = new ExcelImportService();
export default excelImportService;

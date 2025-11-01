import * as XLSX from 'xlsx';
import * as bcrypt from 'bcryptjs';
import { storage } from '../storage';
import { nanoid } from 'nanoid';
import { db } from '../db';
import { eq, and, or } from 'drizzle-orm';
import { users, classes, subjects, timetables, rooms, schools, teacherSubjectAssignments, classEnrollments } from '../../shared/schema';

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
  level: string;
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
      level: 'Niveau',
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
      level: 'Level',
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
      const sheetName = workbook.SheetNames[0];
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
        
        // Create teacher user with Drizzle
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
        }).returning();
        
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
          level: row[t.fields.level] || row['Niveau'] || row['Level'] || '',
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
        
        // Create student user with Drizzle
        const hashedPassword = await bcrypt.hash('eduPass@' + (studentData.matricule || '2024'), 10);
        const [newStudent] = await db.insert(users).values({
          email: studentData.email || null, // Email is now optional
          password: hashedPassword,
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          phone: studentData.phone || `+237${Date.now()}${nanoid(4)}`, // Generate unique phone if not provided
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
        }).returning();
        
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
          level: row[t.fields.level] || row['Niveau'] || row['Level'] || '',
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
              const validCategories = ['general', 'scientific', 'literary', 'technical', 'other'];
              const normalizedCategory = category?.toLowerCase();
              if (category && !validCategories.includes(normalizedCategory)) {
                result.errors.push({
                  row: row._row || index + 2,
                  field: lang === 'fr' ? 'Catégorie Matière' : 'Subject Category',
                  message: `${lang === 'fr' ? 'Catégorie matière invalide' : 'Invalid subject category'}: "${category}". ${lang === 'fr' ? 'Valeurs valides' : 'Valid values'}: general, scientific, literary, technical, other`
                });
                hasSubjectValidationError = true;
                break;
              }
              
              subjectsToCreate.push({
                name,
                coefficient: parseInt(coeff) || 1,
                hoursPerWeek: parseInt(hours) || 1,
                category: normalizedCategory || 'general', // Support all 5 types: general, scientific, literary, technical, other
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
        
        if (!classData.level) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.level,
            message: lang === 'fr'
              ? 'Ce champ est obligatoire. Veuillez saisir le niveau (ex: Form 1, Form 2, etc.).'
              : 'This field is required. Please enter the level (e.g., Form 1, Form 2, etc.).'
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
        
        // Create class with Drizzle
        const [newClass] = await db.insert(classes).values({
          schoolId,
          name: classData.name,
          level: classData.level,
          maxStudents: classData.maxStudents,
          teacherId,
          academicYearId,
          isActive: true
        }).returning();
        
        // Create subjects for the class if provided with complete metadata
        if (subjectsToCreate.length > 0) {
          for (const subjectData of subjectsToCreate) {
            await db.insert(subjects).values({
              nameFr: subjectData.name,
              nameEn: subjectData.name,
              coefficient: subjectData.coefficient.toString(),
              schoolId,
              classId: newClass.id,
              subjectType: subjectData.category || 'general',
              code: `${subjectData.name.substring(0, 3).toUpperCase()}-${newClass.level}`
            });
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
          // Create subject if it doesn't exist with minimal required fields
          const [newSubject] = await db.insert(subjects).values({
            nameFr: timetableData.subjectName,
            nameEn: timetableData.subjectName,
            schoolId,
            classId: foundClass.id,
            coefficient: '1', // Default coefficient
            subjectType: 'general', // Default type
            code: `${timetableData.subjectName.substring(0, 3).toUpperCase()}-${foundClass.level}`
          }).returning();
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
        
        // Create timetable entry with Drizzle
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
          term: timetableData.term || 'Term 1'
        });
        
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
        
        // Create room in database
        await db.insert(rooms).values({
          name: roomData.name,
          type: (roomData.type || 'classroom').toLowerCase(),
          capacity: roomData.capacity || 30,
          building: roomData.building,
          floor: roomData.floor,
          equipment: roomData.equipment,
          schoolId,
          isOccupied: false
        });
        
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
        sampleData = [];
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
          t.fields.level, 
          t.fields.parentName,
          t.fields.parentEmail, 
          t.fields.parentPhone,
          t.fields.isRepeating
        ];
        sampleData = [];
        break;
        
      case 'parents':
        headers = [t.fields.firstName, t.fields.lastName, t.fields.email, t.fields.phone, t.fields.gender, t.fields.relation, t.fields.profession, t.fields.address, t.fields.childrenMatricules];
        sampleData = [];
        break;
        
      case 'classes':
        headers = [
          t.fields.name, 
          t.fields.level, 
          t.fields.maxStudents, 
          t.fields.teacherEmail, 
          t.fields.room,
          lang === 'fr' ? 'Matières (nom;coeff;heures;catégorie | séparées par |)' : 'Subjects (name;coeff;hours;category | separated by |)'
        ];
        sampleData = [];
        break;
        
      case 'timetables':
        headers = [t.fields.className, t.fields.teacherEmail, t.fields.subject, t.fields.day, t.fields.startTime, t.fields.endTime, t.fields.room, t.fields.academicYear, t.fields.term];
        sampleData = [];
        break;
        
      case 'rooms':
        headers = [t.fields.name, t.fields.type, t.fields.capacity, t.fields.building, t.fields.floor, t.fields.equipment];
        sampleData = [];
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
        sampleData = [];
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
    
    XLSX.utils.book_append_sheet(wb, ws, lang === 'fr' ? 'Données' : 'Data');
    
    // Add instructions sheet for all import templates
    if (['teachers', 'students', 'classes', 'timetables'].includes(type)) {
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
          ['10. Niveau: Niveau scolaire (ex: Collège, Primary School, Lycée)'],
          ['11. NomParent: Nom complet du parent/tuteur'],
          ['12. EmailParent: Email du parent pour les communications'],
          ['13. TéléphoneParent: Téléphone du parent (format: +237XXXXXXXXX)'],
          ['14. Redoublant: Oui ou Non - indique si l\'élève redouble'],
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
          ['10. Level: School level (e.g., Middle School, Primary School, High School)'],
          ['11. ParentName: Full name of parent/guardian'],
          ['12. ParentEmail: Parent\'s email for communications'],
          ['13. ParentPhone: Parent\'s phone (format: +237XXXXXXXXX)'],
          ['14. IsRepeating: Yes or No - indicates if the student is repeating'],
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
        ['2. Niveau: Niveau scolaire (ex: 6ème, Form 1, Primary 5)'],
        ['3. MaxÉlèves: Nombre maximum d\'élèves (ex: 40)'],
        ['4. EmailEnseignant: Email du professeur principal (optionnel)'],
        ['5. Salle: Nom de la salle de classe (optionnel)'],
        ['6. Matières: Liste des matières avec leurs détails (voir format ci-dessous)'],
        [''],
        ['🎯 FORMAT DES MATIÈRES (Colonne 6)'],
        ['Format: nom;coefficient;heures;catégorie | nom;coefficient;heures;catégorie | ...'],
        [''],
        ['Exemple: Mathématiques;4;6;general | Français;4;6;literary | Physique;5;6;scientific'],
        [''],
        ['⚠️ IMPORTANT: Séparez chaque matière par le symbole |'],
        [''],
        ['📚 CATÉGORIES DE MATIÈRES (5 types disponibles)'],
        ['• general     → Matières générales (Maths, Géographie, EPS, etc.)'],
        ['• scientific  → Matières scientifiques (Physique, Chimie, Biologie, SVT)'],
        ['• literary    → Matières littéraires (Français, Philosophie, Littérature, Histoire)'],
        ['• technical   → Matières techniques (Électricité, Mécanique, Dessin Technique)'],
        ['• other       → Autres matières (Éveil, Arts, Musique, activités spéciales)'],
        [''],
        ['💡 EXEMPLES PRATIQUES'],
        ['Classe générale: Mathématiques;4;6;general | Français;4;6;literary'],
        ['Classe scientifique: Maths;5;7;scientific | Physique;5;6;scientific | Chimie;4;5;scientific'],
        ['Classe technique: Électricité;5;8;technical | Mécanique;5;8;technical'],
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
        ['2. Level: School level (e.g., Form 1, Grade 6, Primary 5)'],
        ['3. MaxStudents: Maximum number of students (e.g., 40)'],
        ['4. TeacherEmail: Main teacher\'s email (optional)'],
        ['5. Room: Classroom name (optional)'],
        ['6. Subjects: List of subjects with their details (see format below)'],
        [''],
        ['🎯 SUBJECTS FORMAT (Column 6)'],
        ['Format: name;coefficient;hours;category | name;coefficient;hours;category | ...'],
        [''],
        ['Example: Mathematics;4;6;general | French;4;6;literary | Physics;5;6;scientific'],
        [''],
        ['⚠️ IMPORTANT: Separate each subject with the | symbol'],
        [''],
        ['📚 SUBJECT CATEGORIES (5 types available)'],
        ['• general     → General subjects (Math, Geography, PE, etc.)'],
        ['• scientific  → Scientific subjects (Physics, Chemistry, Biology, Life Sciences)'],
        ['• literary    → Literary subjects (French, Philosophy, Literature, History)'],
        ['• technical   → Technical subjects (Electricity, Mechanics, Technical Drawing)'],
        ['• other       → Other subjects (Discovery, Arts, Music, special activities)'],
        [''],
        ['💡 PRACTICAL EXAMPLES'],
        ['General class: Mathematics;4;6;general | French;4;6;literary'],
        ['Science class: Math;5;7;scientific | Physics;5;6;scientific | Chemistry;4;5;scientific'],
        ['Technical class: Electricity;5;8;technical | Mechanics;5;8;technical'],
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
      }
      
      const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
      wsInstructions['!cols'] = [{ width: 100 }];
      XLSX.utils.book_append_sheet(wb, wsInstructions, lang === 'fr' ? 'Instructions' : 'Instructions');
    }
    
    // Generate buffer
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}

export const excelImportService = new ExcelImportService();
export default excelImportService;

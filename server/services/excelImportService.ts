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
      const data = jsonData.slice(1).map((row: any[], index: number) => {
        const obj: any = { _row: index + 2 }; // Track original row number
        headers.forEach((header, i) => {
          obj[header] = row[i] || '';
        });
        return obj;
      });
      
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
        sampleData = [
          [
            'Marie', 
            'Nguyen', 
            'marie.nguyen@educafric.com', 
            '+237677123456', 
            lang === 'fr' ? '5 ans' : '5 years',
            lang === 'fr' ? 'Mathématiques;Physique' : 'Mathematics;Physics',
            '6ème A, 5ème B',
            lang === 'fr' ? 'Master en Mathématiques - Université de Yaoundé I' : 'Master in Mathematics - University of Yaoundé I'
          ],
          [
            'Paul', 
            'Ateba', 
            'paul.ateba@educafric.com', 
            '+237698765432', 
            lang === 'fr' ? '8 ans' : '8 years',
            lang === 'fr' ? 'Français;Histoire' : 'French;History',
            '4ème C, 3ème A',
            lang === 'fr' ? 'Doctorat en Lettres - Université de Douala' : 'PhD in Literature - University of Douala'
          ]
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
          t.fields.level, 
          t.fields.parentName,
          t.fields.parentEmail, 
          t.fields.parentPhone,
          t.fields.isRepeating
        ];
        sampleData = [
          [
            'Amina', 
            'Kouakou', 
            'amina.kouakou@educafric.com', 
            '+237677111222', 
            t.genders.female, 
            '2010-03-15',
            lang === 'fr' ? 'Yaoundé, Cameroun' : 'Yaounde, Cameroon',
            'STU-2025-001', 
            '6ème A', 
            lang === 'fr' ? 'Collège' : 'Middle School', 
            lang === 'fr' ? 'Jean Kouakou' : 'Jean Kouakou',
            'parent.kouakou@gmail.com', 
            '+237677888999',
            lang === 'fr' ? 'Non' : 'No'
          ],
          [
            'Pierre', 
            'Mballa', 
            '', 
            '', 
            t.genders.male, 
            '2008-08-22',
            lang === 'fr' ? 'Douala, Cameroun' : 'Douala, Cameroon',
            'STU-2025-002', 
            '4ème B', 
            lang === 'fr' ? 'Collège' : 'Middle School',
            lang === 'fr' ? 'Marie Mballa' : 'Marie Mballa', 
            'mballa.parent@yahoo.fr', 
            '+237698555444',
            lang === 'fr' ? 'Oui' : 'Yes'
          ]
        ];
        break;
        
      case 'parents':
        headers = [t.fields.firstName, t.fields.lastName, t.fields.email, t.fields.phone, t.fields.gender, t.fields.relation, t.fields.profession, t.fields.address, t.fields.childrenMatricules];
        sampleData = [
          ['Marie', 'Kouakou', 'parent.kouakou@gmail.com', '+237677888999', t.genders.female, lang === 'fr' ? 'Mère' : 'Mother', lang === 'fr' ? 'Infirmière' : 'Nurse', lang === 'fr' ? 'Yaoundé, Bastos' : 'Yaounde, Bastos', 'STU-2025-001'],
          ['Jean', 'Mballa', 'mballa.parent@yahoo.fr', '+237698555444', t.genders.male, lang === 'fr' ? 'Père' : 'Father', lang === 'fr' ? 'Ingénieur' : 'Engineer', 'Douala, Bonanjo', 'STU-2025-002;STU-2025-003']
        ];
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
        sampleData = [
          [
            '6ème A', 
            '6ème', 
            '40', 
            'prof.math@educafric.com', 
            lang === 'fr' ? 'Salle A1' : 'Room A1',
            lang === 'fr' 
              ? 'Mathématiques;4;6;general | Français;4;6;literary | Histoire;2;4;literary | Géographie;2;4;general'
              : 'Mathematics;4;6;general | French;4;6;literary | History;2;4;literary | Geography;2;4;general'
          ],
          [
            '3ème Scientifique', 
            '3ème', 
            '35', 
            'prof.sciences@educafric.com', 
            lang === 'fr' ? 'Labo B2' : 'Lab B2',
            lang === 'fr'
              ? 'Mathématiques;5;7;scientific | Physique;5;6;scientific | Chimie;4;5;scientific | Biologie;4;5;scientific'
              : 'Mathematics;5;7;scientific | Physics;5;6;scientific | Chemistry;4;5;scientific | Biology;4;5;scientific'
          ],
          [
            'Terminale Technique', 
            'Terminale', 
            '30', 
            'prof.tech@educafric.com',
            lang === 'fr' ? 'Atelier A' : 'Workshop A',
            lang === 'fr'
              ? 'Mathématiques;3;4;general | Électricité;5;8;technical | Mécanique;5;8;technical | Dessin Technique;4;6;technical'
              : 'Mathematics;3;4;general | Electricity;5;8;technical | Mechanics;5;8;technical | Technical Drawing;4;6;technical'
          ],
          [
            '1ère Littéraire', 
            '1ère', 
            '38', 
            'prof.lettres@educafric.com',
            lang === 'fr' ? 'Salle C3' : 'Room C3',
            lang === 'fr'
              ? 'Français;6;8;literary | Philosophie;5;6;literary | Littérature;4;5;literary | Anglais;3;4;general'
              : 'French;6;8;literary | Philosophy;5;6;literary | Literature;4;5;literary | English;3;4;general'
          ],
          [
            'CP Maternelle', 
            'Maternelle', 
            '25', 
            'prof.maternelle@educafric.com',
            lang === 'fr' ? 'Salle Maternelle' : 'Kindergarten Room',
            lang === 'fr'
              ? 'Éveil;3;5;other | Lecture;4;6;other | Calcul;3;4;other | Arts;2;3;other'
              : 'Discovery;3;5;other | Reading;4;6;other | Math;3;4;other | Arts;2;3;other'
          ]
        ];
        break;
        
      case 'timetables':
        headers = [t.fields.className, t.fields.teacherEmail, t.fields.subject, t.fields.day, t.fields.startTime, t.fields.endTime, t.fields.room, t.fields.academicYear, t.fields.term];
        sampleData = [
          ['6ème A', 'prof.math@educafric.com', lang === 'fr' ? 'Mathématiques' : 'Mathematics', '1', '08:00', '09:00', lang === 'fr' ? 'Salle A1' : 'Room A1', '2024-2025', 'Term 1'],
          ['6ème A', 'prof.francais@educafric.com', lang === 'fr' ? 'Français' : 'French', '2', '09:00', '10:00', lang === 'fr' ? 'Salle A1' : 'Room A1', '2024-2025', 'Term 1'],
          ['6ème B', 'prof.sciences@educafric.com', lang === 'fr' ? 'Sciences' : 'Sciences', '3', '10:00', '11:00', lang === 'fr' ? 'Labo 1' : 'Lab 1', '2024-2025', 'Term 1']
        ];
        break;
        
      case 'rooms':
        headers = [t.fields.name, t.fields.type, t.fields.capacity, t.fields.building, t.fields.floor, t.fields.equipment];
        sampleData = [
          [lang === 'fr' ? 'Salle A1' : 'Room A1', 'classroom', '40', lang === 'fr' ? 'Bâtiment A' : 'Building A', lang === 'fr' ? 'Rez-de-chaussée' : 'Ground Floor', lang === 'fr' ? 'Projecteur, Tableau blanc' : 'Projector, Whiteboard'],
          [lang === 'fr' ? 'Labo Sciences' : 'Science Lab', 'laboratory', '30', lang === 'fr' ? 'Bâtiment B' : 'Building B', lang === 'fr' ? '1er étage' : '1st Floor', lang === 'fr' ? 'Microscopes, Matériel chimie' : 'Microscopes, Chemistry equipment'],
          [lang === 'fr' ? 'Salle Informatique' : 'Computer Room', 'computer_lab', '35', lang === 'fr' ? 'Bâtiment A' : 'Building A', lang === 'fr' ? '2ème étage' : '2nd Floor', lang === 'fr' ? '35 ordinateurs, Vidéoprojecteur' : '35 computers, Video projector']
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
        sampleData = [
          [
            lang === 'fr' ? 'Collège Bilingue de Yaoundé' : 'Bilingual College of Yaoundé',
            'private',
            lang === 'fr' ? 'Avenue Kennedy, Quartier Bastos, Yaoundé' : 'Kennedy Avenue, Bastos District, Yaoundé',
            '+237677123456',
            'contact@college-yaounde.cm',
            'https://www.college-yaounde.cm',
            lang === 'fr' ? 'Établissement bilingue d\'excellence offrant une éducation de qualité' : 'Bilingual institution of excellence offering quality education',
            '1985',
            lang === 'fr' ? 'Dr. Marie NGUESSO' : 'Dr. Marie NGUESSO',
            '850',
            lang === 'fr' ? 'Délégation Régionale du Centre' : 'Centre Regional Delegation',
            lang === 'fr' ? 'Délégation Départementale du Mfoundi' : 'Mfoundi Departmental Delegation',
            'B.P. 8524 Yaoundé',
            lang === 'fr' ? 'Yaoundé 1er' : 'Yaoundé 1st'
          ]
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
    
    XLSX.utils.book_append_sheet(wb, ws, lang === 'fr' ? 'Données' : 'Data');
    
    // Add instructions sheet for classes template
    if (type === 'classes') {
      const instructionsHeaders = [lang === 'fr' ? 'INSTRUCTIONS - IMPORT EN MASSE DES CLASSES' : 'INSTRUCTIONS - BULK CLASS IMPORT'];
      const instructionsData = lang === 'fr' ? [
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

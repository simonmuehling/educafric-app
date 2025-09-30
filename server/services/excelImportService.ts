import * as XLSX from 'xlsx';
import * as bcrypt from 'bcryptjs';
import { storage } from '../storage';
import { nanoid } from 'nanoid';
import { db } from '../db';
import { rooms } from '../../shared/schema';

interface TeacherImportData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender: string;
  matricule: string;
  subjects: string; // Comma or semicolon separated
}

interface StudentImportData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender: string;
  dateOfBirth: string;
  matricule: string;
  className: string;
  level: string;
  parentEmail?: string;
  parentPhone?: string;
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
      className: 'Classe',
      level: 'Niveau',
      parentEmail: 'EmailParent',
      parentPhone: 'TéléphoneParent',
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
      equipment: 'Équipement'
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
      className: 'Class',
      level: 'Level',
      parentEmail: 'ParentEmail',
      parentPhone: 'ParentPhone',
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
      equipment: 'Equipment'
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
      
      if (jsonData.length < 2) {
        throw new Error(t.errors.minRows);
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
          gender: row[t.fields.gender] || row['Genre'] || row['Gender'] || '',
          matricule: row[t.fields.matricule] || row['Matricule'] || row['ID'] || '',
          subjects: row[t.fields.subjects] || row['Matières'] || row['Subjects'] || ''
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
        const existingTeacher = await storage.getUserByEmail(teacherData.email);
        if (existingTeacher) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.email,
            message: `${t.fields.email} ${t.errors.duplicate}: ${teacherData.email}`
          });
          continue;
        }
        
        // Create teacher user
        const hashedPassword = await bcrypt.hash('eduPass@' + teacherData.matricule || '2024', 10);
        const newUser = await storage.createUser({
          email: teacherData.email,
          password: hashedPassword,
          firstName: teacherData.firstName,
          lastName: teacherData.lastName,
          phone: teacherData.phone,
          userType: 'teacher',
          schoolId: schoolId,
          isActive: true,
          gender: teacherData.gender,
          matricule: teacherData.matricule || nanoid(10)
        });
        
        // Parse subjects (stored as comma-separated string in user profile for now)
        const subjects = teacherData.subjects
          .split(/[;,]/)
          .map(s => s.trim())
          .filter(Boolean);
        
        // Note: Subject assignment can be done through a separate admin interface
        // For bulk import, subjects are stored in the teacher's profile
        
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
          matricule: row[t.fields.matricule] || row['Matricule'] || row['ID'] || '',
          className: row[t.fields.className] || row['Classe'] || row['Class'] || '',
          level: row[t.fields.level] || row['Niveau'] || row['Level'] || '',
          parentEmail: row[t.fields.parentEmail] || row['EmailParent'] || row['ParentEmail'] || '',
          parentPhone: row[t.fields.parentPhone] || row['TéléphoneParent'] || row['ParentPhone'] || ''
        };
        
        // Validate required fields
        if (!studentData.firstName) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.firstName,
            message: `${t.fields.firstName} ${t.errors.required}`
          });
          continue;
        }
        
        if (!studentData.lastName) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.lastName,
            message: `${t.fields.lastName} ${t.errors.required}`
          });
          continue;
        }
        
        // Find class by name (query all classes and filter)
        let classId = null;
        if (studentData.className) {
          const classes = await storage.getSchoolClasses(schoolId);
          const existingClass = classes.find((c: any) => c.name === studentData.className);
          if (existingClass) {
            classId = existingClass.id;
          } else {
            result.warnings.push({
              row: row._row || index + 2,
              message: `${t.fields.className} "${studentData.className}" ${t.errors.notFound}`
            });
          }
        }
        
        // Create student user
        const hashedPassword = await bcrypt.hash('eduPass@' + (studentData.matricule || '2024'), 10);
        await storage.createUser({
          email: studentData.email || `student.${nanoid(6)}@educafric.temp`,
          password: hashedPassword,
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          phone: studentData.phone,
          userType: 'student',
          schoolId: schoolId,
          classId: classId,
          isActive: true,
          gender: studentData.gender,
          dateOfBirth: studentData.dateOfBirth,
          matricule: studentData.matricule || nanoid(10)
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
        const subjects: any[] = [];
        let hasSubjectValidationError = false;
        if (classData.subjectsRaw) {
          const subjectParts = classData.subjectsRaw.split('|').map((s: string) => s.trim());
          for (const subjectStr of subjectParts) {
            const [name, coeff, hours, category] = subjectStr.split(';').map((s: string) => s.trim());
            if (name) {
              // Validate subject category
              const validCategories = ['general', 'professional'];
              const normalizedCategory = category?.toLowerCase();
              if (category && !validCategories.includes(normalizedCategory)) {
                result.errors.push({
                  row: row._row || index + 2,
                  field: lang === 'fr' ? 'Catégorie Matière' : 'Subject Category',
                  message: `${lang === 'fr' ? 'Catégorie matière invalide' : 'Invalid subject category'}: "${category}". ${lang === 'fr' ? 'Valeurs valides' : 'Valid values'}: general, professional`
                });
                hasSubjectValidationError = true;
                break;
              }
              
              subjects.push({
                name,
                coefficient: parseInt(coeff) || 1,
                hoursPerWeek: parseInt(hours) || 1,
                category: normalizedCategory === 'professional' ? 'professional' : 'general',
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
            message: `${t.fields.name} ${t.errors.required}`
          });
          continue;
        }
        
        if (!classData.level) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.level,
            message: `${t.fields.level} ${t.errors.required}`
          });
          continue;
        }
        
        // Check for duplicate class name (query all classes and filter)
        const classes = await storage.getSchoolClasses(schoolId);
        const existingClass = classes.find((c: any) => c.name === classData.name);
        if (existingClass) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.name,
            message: `${t.fields.name} ${t.errors.duplicate}: ${classData.name}`
          });
          continue;
        }
        
        // Find teacher by email if provided
        let teacherId = null;
        if (classData.teacherEmail) {
          const teacher = await storage.getUserByEmail(classData.teacherEmail);
          if (teacher && teacher.userType === 'teacher') {
            teacherId = teacher.id;
          }
        }
        
        // Determine academic year ID from school context
        // Note: Academic year can be set later through admin interface
        let academicYearId = null;
        
        // Create class with subjects
        await storage.createClass({
          schoolId,
          name: classData.name,
          level: classData.level,
          capacity: classData.maxStudents,
          teacherId,
          room: classData.room || null,
          subjects: subjects.length > 0 ? subjects : undefined,
          academicYearId,
          isActive: true
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
        
        // Find class (query all classes and filter)
        const classes = await storage.getSchoolClasses(schoolId);
        const foundClass = classes.find((c: any) => c.name === timetableData.className);
        if (!foundClass) {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.className,
            message: `${t.fields.className} ${t.errors.notFound}: ${timetableData.className}`
          });
          continue;
        }
        
        // Find teacher
        const teacher = await storage.getUserByEmail(timetableData.teacherEmail);
        if (!teacher || teacher.userType !== 'teacher') {
          result.errors.push({
            row: row._row || index + 2,
            field: t.fields.teacherEmail,
            message: `${t.fields.teacherEmail} ${t.errors.notFound}: ${timetableData.teacherEmail}`
          });
          continue;
        }
        
        // Create timetable entry
        await storage.createTimetableEntry({
          schoolId,
          classId: foundClass.id,
          teacherId: teacher.id,
          subjectName: timetableData.subjectName,
          dayOfWeek: timetableData.dayOfWeek,
          startTime: timetableData.startTime,
          endTime: timetableData.endTime,
          room: timetableData.room,
          academicYear: timetableData.academicYear || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
          term: timetableData.term || 'Term 1',
          isActive: true
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
   * Generate template Excel file for download (BILINGUAL)
   */
  generateTemplate(type: 'teachers' | 'students' | 'parents' | 'classes' | 'timetables' | 'rooms', lang: 'fr' | 'en' = 'fr'): Buffer {
    const t = translations[lang];
    let headers: string[];
    let sampleData: any[];
    
    switch (type) {
      case 'teachers':
        headers = [t.fields.firstName, t.fields.lastName, t.fields.email, t.fields.phone, t.fields.gender, t.fields.matricule, t.fields.subjects];
        sampleData = [
          ['Marie', 'Nguyen', 'marie.nguyen@educafric.com', '+237677123456', t.genders.female, 'EDU-2025-002', lang === 'fr' ? 'Mathématiques;Physique' : 'Mathematics;Physics'],
          ['Paul', 'Ateba', 'paul.ateba@educafric.com', '+237698765432', t.genders.male, 'EDU-2025-003', lang === 'fr' ? 'Français;Histoire' : 'French;History']
        ];
        break;
        
      case 'students':
        headers = [t.fields.firstName, t.fields.lastName, t.fields.email, t.fields.phone, t.fields.gender, t.fields.dateOfBirth, t.fields.matricule, t.fields.className, t.fields.level, t.fields.parentEmail, t.fields.parentPhone];
        sampleData = [
          ['Amina', 'Kouakou', 'amina.kouakou@educafric.com', '+237677111222', t.genders.female, '15/03/2010', 'STU-2025-001', '6ème A', lang === 'fr' ? 'Collège' : 'Middle School', 'parent.kouakou@gmail.com', '+237677888999'],
          ['Pierre', 'Mballa', '', '', t.genders.male, '22/08/2008', 'STU-2025-002', '4ème B', lang === 'fr' ? 'Collège' : 'Middle School', 'mballa.parent@yahoo.fr', '+237698555444']
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
              ? 'Mathématiques;4;6;general | Français;4;6;general | Histoire;2;4;general | Sciences;3;5;general'
              : 'Mathematics;4;6;general | French;4;6;general | History;2;4;general | Sciences;3;5;general'
          ],
          [
            '5ème B', 
            '5ème', 
            '35', 
            'prof.francais@educafric.com', 
            lang === 'fr' ? 'Salle B2' : 'Room B2',
            lang === 'fr'
              ? 'Mathématiques;4;6;general | Français;4;6;general | Anglais;3;4;general'
              : 'Mathematics;4;6;general | French;4;6;general | English;3;4;general'
          ],
          [
            'Terminale Technique', 
            'Terminale', 
            '30', 
            'prof.tech@educafric.com',
            lang === 'fr' ? 'Atelier A' : 'Workshop A',
            lang === 'fr'
              ? 'Mathématiques;3;4;general | Électricité;5;8;professional | Mécanique;5;8;professional'
              : 'Mathematics;3;4;general | Electricity;5;8;professional | Mechanics;5;8;professional'
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
        
      default:
        throw new Error(lang === 'fr' ? 'Type de template non supporté' : 'Template type not supported');
    }
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const wsData = [headers, ...sampleData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    ws['!cols'] = headers.map(() => ({ width: 20 }));
    
    XLSX.utils.book_append_sheet(wb, ws, lang === 'fr' ? 'Importer' : 'Import');
    
    // Generate buffer
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}

export const excelImportService = new ExcelImportService();
export default excelImportService;

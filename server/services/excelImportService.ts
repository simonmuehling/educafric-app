import * as XLSX from 'xlsx';
import * as bcrypt from 'bcryptjs';
import { storage } from '../storage';
import { nanoid } from 'nanoid';

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

export class ExcelImportService {
  
  /**
   * Parse Excel/CSV file buffer and return JSON data
   */
  parseFile(buffer: Buffer, filename: string): any[] {
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
        throw new Error('Le fichier doit contenir au moins une ligne de données en plus de l\'en-tête');
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
      throw new Error(`Erreur lors de la lecture du fichier: ${error.message}`);
    }
  }
  
  /**
   * Import teachers from parsed data
   */
  async importTeachers(data: any[], schoolId: number, createdBy: number): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      created: 0,
      errors: [],
      warnings: []
    };
    
    const expectedHeaders = ['Prénom', 'Nom', 'Email', 'Téléphone', 'Genre', 'Matricule', 'Matières'];
    
    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      try {
        // Validate required fields
        const teacherData: TeacherImportData = {
          firstName: row['Prénom'] || row['firstName'],
          lastName: row['Nom'] || row['lastName'],
          email: row['Email'] || row['email'],
          phone: row['Téléphone'] || row['phone'],
          gender: row['Genre'] || row['gender'],
          matricule: row['Matricule'] || row['matricule'],
          subjects: row['Matières'] || row['subjects'] || ''
        };
        
        // Validate required fields
        if (!teacherData.firstName) {
          result.errors.push({
            row: row._row || index + 2,
            field: 'firstName',
            message: 'Le prénom est obligatoire',
            data: row
          });
          continue;
        }
        
        if (!teacherData.lastName) {
          result.errors.push({
            row: row._row || index + 2,
            field: 'lastName', 
            message: 'Le nom est obligatoire',
            data: row
          });
          continue;
        }
        
        if (!teacherData.email || !teacherData.email.includes('@')) {
          result.errors.push({
            row: row._row || index + 2,
            field: 'email',
            message: 'Un email valide est obligatoire',
            data: row
          });
          continue;
        }
        
        // Check if user already exists
        const existingUser = await storage.getUserByEmail(teacherData.email);
        if (existingUser) {
          result.warnings.push({
            row: row._row || index + 2,
            message: `L'enseignant avec l'email ${teacherData.email} existe déjà`
          });
          continue;
        }
        
        // Parse subjects
        const subjectsArray = teacherData.subjects 
          ? teacherData.subjects.split(/[;,]/).map(s => s.trim()).filter(s => s)
          : [];
        
        // Create teacher
        const hashedPassword = await bcrypt.hash('TempPassword123!', 10);
        
        const newTeacher = await storage.createUser({
          firstName: teacherData.firstName,
          lastName: teacherData.lastName,
          email: teacherData.email,
          phone: teacherData.phone,
          password: hashedPassword,
          role: 'Teacher',
          schoolId: schoolId,
          gender: teacherData.gender,
          matricule: teacherData.matricule,
          subjects: subjectsArray,
          createdBy: createdBy
        });
        
        result.created++;
        
      } catch (error) {
        result.errors.push({
          row: row._row || index + 2,
          field: 'general',
          message: `Erreur lors de la création: ${error.message}`,
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
  async importStudents(data: any[], schoolId: number, createdBy: number): Promise<ImportResult> {
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
          firstName: row['Prénom'] || row['firstName'],
          lastName: row['Nom'] || row['lastName'],
          email: row['Email'] || row['email'],
          phone: row['Téléphone'] || row['phone'],
          gender: row['Genre'] || row['gender'],
          dateOfBirth: row['DateNaissance'] || row['dateOfBirth'],
          matricule: row['Matricule'] || row['matricule'],
          className: row['Classe'] || row['className'],
          level: row['Niveau'] || row['level'],
          parentEmail: row['EmailParent'] || row['parentEmail'],
          parentPhone: row['TéléphoneParent'] || row['parentPhone']
        };
        
        // Validate required fields
        if (!studentData.firstName) {
          result.errors.push({
            row: row._row || index + 2,
            field: 'firstName',
            message: 'Le prénom est obligatoire',
            data: row
          });
          continue;
        }
        
        if (!studentData.lastName) {
          result.errors.push({
            row: row._row || index + 2,
            field: 'lastName',
            message: 'Le nom est obligatoire', 
            data: row
          });
          continue;
        }
        
        if (!studentData.matricule) {
          result.errors.push({
            row: row._row || index + 2,
            field: 'matricule',
            message: 'Le matricule est obligatoire',
            data: row
          });
          continue;
        }
        
        // Check if student already exists by email (matricule check not implemented yet)
        const existingStudentByEmail = studentData.email ? await storage.getUserByEmail(studentData.email) : null;
        if (existingStudentByEmail) {
          result.warnings.push({
            row: row._row || index + 2,
            message: `L'élève avec l'email ${studentData.email} existe déjà`
          });
          continue;
        }
        
        // Create student
        const hashedPassword = await bcrypt.hash('TempPassword123!', 10);
        
        const newStudent = await storage.createUser({
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          email: studentData.email || `${studentData.matricule}@educafric.com`,
          phone: studentData.phone,
          password: hashedPassword,
          role: 'Student',
          schoolId: schoolId,
          gender: studentData.gender,
          matricule: studentData.matricule,
          dateOfBirth: studentData.dateOfBirth,
          className: studentData.className,
          level: studentData.level,
          createdBy: createdBy
        });
        
        // Try to connect with parent if parent email provided (connection logic to be implemented)
        if (studentData.parentEmail) {
          result.warnings.push({
            row: row._row || index + 2,
            message: `Connexion parent-enfant à implémenter pour ${studentData.parentEmail}`
          });
        }
        
        result.created++;
        
      } catch (error) {
        result.errors.push({
          row: row._row || index + 2,
          field: 'general',
          message: `Erreur lors de la création: ${error.message}`,
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
  async importParents(data: any[], schoolId: number, createdBy: number): Promise<ImportResult> {
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
          firstName: row['Prénom'] || row['firstName'],
          lastName: row['Nom'] || row['lastName'],
          email: row['Email'] || row['email'],
          phone: row['Téléphone'] || row['phone'],
          gender: row['Genre'] || row['gender'],
          relation: row['Relation'] || row['relation'],
          profession: row['Profession'] || row['profession'],
          address: row['Adresse'] || row['address'],
          childrenMatricules: row['MatriculesEnfants'] || row['childrenMatricules'] || ''
        };
        
        // Validate required fields
        if (!parentData.firstName) {
          result.errors.push({
            row: row._row || index + 2,
            field: 'firstName',
            message: 'Le prénom est obligatoire',
            data: row
          });
          continue;
        }
        
        if (!parentData.lastName) {
          result.errors.push({
            row: row._row || index + 2,
            field: 'lastName',
            message: 'Le nom est obligatoire',
            data: row
          });
          continue;
        }
        
        if (!parentData.email || !parentData.email.includes('@')) {
          result.errors.push({
            row: row._row || index + 2,
            field: 'email',
            message: 'Un email valide est obligatoire',
            data: row
          });
          continue;
        }
        
        // Check if parent already exists
        const existingParent = await storage.getUserByEmail(parentData.email);
        if (existingParent) {
          result.warnings.push({
            row: row._row || index + 2,
            message: `Le parent avec l'email ${parentData.email} existe déjà`
          });
          continue;
        }
        
        // Create parent
        const hashedPassword = await bcrypt.hash('TempPassword123!', 10);
        
        const newParent = await storage.createUser({
          firstName: parentData.firstName,
          lastName: parentData.lastName,
          email: parentData.email,
          phone: parentData.phone,
          password: hashedPassword,
          role: 'Parent',
          schoolId: schoolId,
          gender: parentData.gender,
          relation: parentData.relation,
          profession: parentData.profession,
          address: parentData.address,
          createdBy: createdBy
        });
        
        // Connect with children if matricules provided (connection logic to be implemented)
        if (parentData.childrenMatricules) {
          result.warnings.push({
            row: row._row || index + 2,
            message: `Connexions parent-enfants à implémenter pour les matricules: ${parentData.childrenMatricules}`
          });
        }
        
        result.created++;
        
      } catch (error) {
        result.errors.push({
          row: row._row || index + 2,
          field: 'general',
          message: `Erreur lors de la création: ${error.message}`,
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
  async importClasses(data: any[], schoolId: number, createdBy: number): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      created: 0,
      errors: [],
      warnings: []
    };
    
    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      try {
        const classData = {
          name: row['Nom'] || row['name'],
          level: row['Niveau'] || row['level'],
          section: row['Section'] || row['section'] || '',
          maxStudents: row['MaxÉlèves'] || row['maxStudents'] || null,
          teacherEmail: row['EmailEnseignant'] || row['teacherEmail'],
          academicYear: row['AnnéeAcadémique'] || row['academicYear']
        };
        
        // Validate required fields
        if (!classData.name || !classData.level) {
          result.errors.push({
            row: row._row || index + 2,
            field: 'name/level',
            message: 'Le nom et le niveau de la classe sont obligatoires',
            data: row
          });
          continue;
        }
        
        // Find teacher if provided
        let teacherId = null;
        if (classData.teacherEmail) {
          const teacher = await storage.getUserByEmail(classData.teacherEmail);
          if (teacher && teacher.role === 'Teacher') {
            teacherId = teacher.id;
          } else {
            result.warnings.push({
              row: row._row || index + 2,
              message: `Enseignant non trouvé: ${classData.teacherEmail}`
            });
          }
        }
        
        // Get the school's current academic year
        const school = await storage.getSchoolById(schoolId);
        if (!school) {
          result.errors.push({
            row: row._row || index + 2,
            field: 'schoolId',
            message: 'École non trouvée',
            data: row
          });
          continue;
        }
        
        // Use academicYear from classData if provided, otherwise use school's current year
        const academicYearName = classData.academicYear || school.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
        
        // For simplicity, use academic year ID 1 as default - schools should have this configured
        // In production, this should fetch or create the academic year properly
        const academicYearId = 1;
        
        // Create class
        await storage.createClass({
          name: classData.name,
          level: classData.level,
          section: classData.section,
          maxStudents: classData.maxStudents ? parseInt(classData.maxStudents) : null,
          schoolId,
          teacherId,
          academicYearId
        });
        
        result.created++;
        
      } catch (error) {
        result.errors.push({
          row: row._row || index + 2,
          field: 'general',
          message: `Erreur lors de la création: ${error.message}`,
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
  async importTimetables(data: any[], schoolId: number, createdBy: number): Promise<ImportResult> {
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
          className: row['Classe'] || row['className'],
          teacherEmail: row['EmailEnseignant'] || row['teacherEmail'],
          subjectName: row['Matière'] || row['subjectName'],
          dayOfWeek: parseInt(row['Jour'] || row['dayOfWeek']),
          startTime: row['HeureDébut'] || row['startTime'],
          endTime: row['HeureFin'] || row['endTime'],
          room: row['Salle'] || row['room'] || '',
          academicYear: row['AnnéeAcadémique'] || row['academicYear'],
          term: row['Trimestre'] || row['term']
        };
        
        // Validation
        if (!timetableData.className || !timetableData.teacherEmail || !timetableData.subjectName ||
            !timetableData.dayOfWeek || !timetableData.startTime || !timetableData.endTime) {
          result.errors.push({
            row: row._row || index + 2,
            field: 'required',
            message: 'Champs obligatoires manquants',
            data: row
          });
          continue;
        }
        
        // Find class
        const classes = await storage.getClassesBySchool(schoolId);
        const foundClass = classes.find(c => c.name === timetableData.className);
        if (!foundClass) {
          result.errors.push({
            row: row._row || index + 2,
            field: 'className',
            message: `Classe non trouvée: ${timetableData.className}`,
            data: row
          });
          continue;
        }
        
        // Find teacher
        const teacher = await storage.getUserByEmail(timetableData.teacherEmail);
        if (!teacher || teacher.role !== 'Teacher') {
          result.errors.push({
            row: row._row || index + 2,
            field: 'teacherEmail',
            message: `Enseignant non trouvé: ${timetableData.teacherEmail}`,
            data: row
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
          message: `Erreur lors de la création: ${error.message}`,
          data: row
        });
      }
    }
    
    result.success = result.errors.length === 0;
    return result;
  }
  
  /**
   * Generate template Excel file for download
   */
  generateTemplate(type: 'teachers' | 'students' | 'parents' | 'classes' | 'timetables'): Buffer {
    let headers: string[];
    let sampleData: any[];
    
    switch (type) {
      case 'teachers':
        headers = ['Prénom', 'Nom', 'Email', 'Téléphone', 'Genre', 'Matricule', 'Matières'];
        sampleData = [
          ['Marie', 'Nguyen', 'marie.nguyen@educafric.com', '+237677123456', 'Féminin', 'EDU-2025-002', 'Mathématiques;Physique'],
          ['Paul', 'Ateba', 'paul.ateba@educafric.com', '+237698765432', 'Masculin', 'EDU-2025-003', 'Français;Histoire']
        ];
        break;
        
      case 'students':
        headers = ['Prénom', 'Nom', 'Email', 'Téléphone', 'Genre', 'DateNaissance', 'Matricule', 'Classe', 'Niveau', 'EmailParent', 'TéléphoneParent'];
        sampleData = [
          ['Amina', 'Kouakou', 'amina.kouakou@educafric.com', '+237677111222', 'Féminin', '15/03/2010', 'STU-2025-001', '6ème A', 'Collège', 'parent.kouakou@gmail.com', '+237677888999'],
          ['Pierre', 'Mballa', '', '', 'Masculin', '22/08/2008', 'STU-2025-002', '4ème B', 'Collège', 'mballa.parent@yahoo.fr', '+237698555444']
        ];
        break;
        
      case 'parents':
        headers = ['Prénom', 'Nom', 'Email', 'Téléphone', 'Genre', 'Relation', 'Profession', 'Adresse', 'MatriculesEnfants'];
        sampleData = [
          ['Marie', 'Kouakou', 'parent.kouakou@gmail.com', '+237677888999', 'Féminin', 'Mère', 'Infirmière', 'Yaoundé, Bastos', 'STU-2025-001'],
          ['Jean', 'Mballa', 'mballa.parent@yahoo.fr', '+237698555444', 'Masculin', 'Père', 'Ingénieur', 'Douala, Bonanjo', 'STU-2025-002;STU-2025-003']
        ];
        break;
        
      case 'classes':
        headers = ['Nom', 'Niveau', 'Section', 'MaxÉlèves', 'EmailEnseignant', 'AnnéeAcadémique'];
        sampleData = [
          ['6ème A', '6ème', 'A', '40', 'prof.math@educafric.com', '2024-2025'],
          ['5ème B', '5ème', 'B', '35', 'prof.francais@educafric.com', '2024-2025'],
          ['CE1 Rouge', 'CE1', 'Rouge', '30', '', '2024-2025']
        ];
        break;
        
      case 'timetables':
        headers = ['Classe', 'EmailEnseignant', 'Matière', 'Jour', 'HeureDébut', 'HeureFin', 'Salle', 'AnnéeAcadémique', 'Trimestre'];
        sampleData = [
          ['6ème A', 'prof.math@educafric.com', 'Mathématiques', '1', '08:00', '09:00', 'Salle A1', '2024-2025', 'Term 1'],
          ['6ème A', 'prof.francais@educafric.com', 'Français', '2', '09:00', '10:00', 'Salle A1', '2024-2025', 'Term 1'],
          ['6ème B', 'prof.sciences@educafric.com', 'Sciences', '3', '10:00', '11:00', 'Labo 1', '2024-2025', 'Term 1']
        ];
        break;
        
      default:
        throw new Error('Type de template non supporté');
    }
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const wsData = [headers, ...sampleData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    ws['!cols'] = headers.map(() => ({ width: 20 }));
    
    XLSX.utils.book_append_sheet(wb, ws, 'Import');
    
    // Generate buffer
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}

export const excelImportService = new ExcelImportService();
export default excelImportService;
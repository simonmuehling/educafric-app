/**
 * Realistic African Educational Data for Sandbox Environment
 * Comprehensive dataset representing authentic African school systems
 */

export interface AfricanSchoolData {
  id: string;
  name: string;
  country: string;
  city: string;
  type: 'public' | 'private' | 'religious' | 'international';
  curriculum: string[];
  languages: string[];
  levels: string[];
  studentCount: number;
  teacherCount: number;
  coordinates: { lat: number; lng: number };
  academicYear: string;
  terms: string[];
  fees: {
    registration: number;
    tuition: number;
    uniform: number;
    books: number;
    transport: number;
    meals: number;
  };
  paymentMethods: string[];
}

export interface AfricanStudentData {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  age: number;
  grade: string;
  class: string;
  gender: 'M' | 'F';
  nationality: string;
  languages: string[];
  parentNames: string[];
  guardianPhone: string;
  address: string;
  subjects: string[];
  averageGrade: number;
  attendance: number;
  behaviorScore: number;
  specialNeeds?: string;
  scholarshipStatus?: string;
}

export interface AfricanTeacherData {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  age: number;
  gender: 'M' | 'F';
  subjects: string[];
  grades: string[];
  qualification: string;
  experience: number;
  languages: string[];
  phone: string;
  email: string;
  specializations: string[];
  classesAssigned: string[];
}

export interface AfricanSubjectData {
  id: string;
  name: string;
  nameFr: string;
  category: 'core' | 'elective' | 'technical' | 'arts' | 'sports';
  grades: string[];
  curriculum: string;
  hours: number;
  coefficient: number;
  examType: 'continuous' | 'terminal' | 'practical' | 'oral';
}

export interface AfricanGradeData {
  id: string;
  studentId: string;
  subjectId: string;
  term: string;
  evaluationType: string;
  score: number;
  maxScore: number;
  coefficient: number;
  teacher: string;
  date: string;
  comments: string;
}

// Realistic African School Names
export const AFRICAN_SCHOOLS: AfricanSchoolData[] = [
  {
    id: 'school-1',
    name: 'École Primaire Publique de Biyem-Assi',
    country: 'Cameroon',
    city: 'Yaoundé',
    type: 'public',
    curriculum: ['Cameroon National Curriculum'],
    languages: ['French', 'English'],
    levels: ['Classe Préparatoire', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'],
    studentCount: 450,
    teacherCount: 18,
    coordinates: { lat: 3.8480, lng: 11.5021 },
    academicYear: '2024-2025',
    terms: ['1er Trimestre', '2ème Trimestre', '3ème Trimestre'],
    fees: {
      registration: 15000,
      tuition: 45000,
      uniform: 25000,
      books: 35000,
      transport: 60000,
      meals: 80000
    },
    paymentMethods: ['Orange Money', 'Express Union', 'Afriland First Bank']
  },
  {
    id: 'school-2',
    name: 'Collège Privé Bilingue Excellence',
    country: 'Cameroon',
    city: 'Douala',
    type: 'private',
    curriculum: ['Cameroon National Curriculum', 'Cambridge IGCSE'],
    languages: ['French', 'English'],
    levels: ['6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'],
    studentCount: 280,
    teacherCount: 25,
    coordinates: { lat: 4.0511, lng: 9.7679 },
    academicYear: '2024-2025',
    terms: ['1er Trimestre', '2ème Trimestre', '3ème Trimestre'],
    fees: {
      registration: 85000,
      tuition: 450000,
      uniform: 45000,
      books: 85000,
      transport: 120000,
      meals: 180000
    },
    paymentMethods: ['Orange Money', 'Express Union', 'Afriland First Bank', 'Stripe']
  },
  {
    id: 'school-3',
    name: 'Government Secondary School Bamenda',
    country: 'Cameroon',
    city: 'Bamenda',
    type: 'public',
    curriculum: ['GCE O-Level', 'GCE A-Level'],
    languages: ['English', 'French'],
    levels: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth', 'Upper Sixth'],
    studentCount: 1200,
    teacherCount: 45,
    coordinates: { lat: 5.9631, lng: 10.1591 },
    academicYear: '2024-2025',
    terms: ['First Term', 'Second Term', 'Third Term'],
    fees: {
      registration: 25000,
      tuition: 75000,
      uniform: 30000,
      books: 50000,
      transport: 45000,
      meals: 0
    },
    paymentMethods: ['Orange Money', 'Express Union']
  },
  {
    id: 'school-4',
    name: 'École Internationale Française de Lagos',
    country: 'Nigeria',
    city: 'Lagos',
    type: 'international',
    curriculum: ['French National Curriculum', 'International Baccalaureate'],
    languages: ['French', 'English'],
    levels: ['Maternelle', 'CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', '5ème', '4ème', '3ème'],
    studentCount: 380,
    teacherCount: 32,
    coordinates: { lat: 6.5244, lng: 3.3792 },
    academicYear: '2024-2025',
    terms: ['1er Trimestre', '2ème Trimestre', '3ème Trimestre'],
    fees: {
      registration: 500000,
      tuition: 3500000,
      uniform: 150000,
      books: 250000,
      transport: 400000,
      meals: 600000
    },
    paymentMethods: ['Stripe', 'Bank Transfer']
  },
  {
    id: 'school-5',
    name: 'École Primaire Catholique Sainte-Marie',
    country: 'Senegal',
    city: 'Dakar',
    type: 'religious',
    curriculum: ['Senegal National Curriculum'],
    languages: ['French', 'Wolof'],
    levels: ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'],
    studentCount: 320,
    teacherCount: 16,
    coordinates: { lat: 14.6937, lng: -17.4441 },
    academicYear: '2024-2025',
    terms: ['1er Trimestre', '2ème Trimestre', '3ème Trimestre'],
    fees: {
      registration: 45000,
      tuition: 180000,
      uniform: 35000,
      books: 55000,
      transport: 80000,
      meals: 120000
    },
    paymentMethods: ['Orange Money', 'Wave', 'Bank Transfer']
  }
];

// Realistic African Student Names with Cultural Diversity
export const AFRICAN_STUDENTS: AfricanStudentData[] = [
  {
    id: 'student-1',
    firstName: 'Aminata',
    lastName: 'Diop',
    fullName: 'Aminata Diop',
    age: 12,
    grade: 'CM1',
    class: 'CM1-A',
    gender: 'F',
    nationality: 'Senegalese',
    languages: ['French', 'Wolof'],
    parentNames: ['Moussa Diop', 'Fatou Diop'],
    guardianPhone: '+221701234567',
    address: 'Médina, Dakar',
    subjects: ['Français', 'Mathématiques', 'Sciences', 'Histoire-Géographie', 'Wolof'],
    averageGrade: 15.5,
    attendance: 94,
    behaviorScore: 18,
    scholarshipStatus: 'Merit Scholarship'
  },
  {
    id: 'student-2',
    firstName: 'Kwame',
    lastName: 'Asante',
    fullName: 'Kwame Asante',
    age: 16,
    grade: 'Form 4',
    class: 'Science 4A',
    gender: 'M',
    nationality: 'Ghanaian',
    languages: ['English', 'Twi'],
    parentNames: ['Kofi Asante', 'Akosua Asante'],
    guardianPhone: '+233241234567',
    address: 'East Legon, Accra',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'],
    averageGrade: 82.5,
    attendance: 96,
    behaviorScore: 16,
    specialNeeds: 'Hearing Aid Required'
  },
  {
    id: 'student-3',
    firstName: 'Fatoumata',
    lastName: 'Traoré',
    fullName: 'Fatoumata Traoré',
    age: 14,
    grade: '3ème',
    class: '3ème-B',
    gender: 'F',
    nationality: 'Malian',
    languages: ['French', 'Bambara'],
    parentNames: ['Ibrahim Traoré', 'Mariam Traoré'],
    guardianPhone: '+22370123456',
    address: 'Bamako Coura, Bamako',
    subjects: ['Français', 'Mathématiques', 'Sciences Physiques', 'SVT', 'Histoire'],
    averageGrade: 14.2,
    attendance: 88,
    behaviorScore: 17
  },
  {
    id: 'student-4',
    firstName: 'Emmanuel',
    lastName: 'Mbeki',
    fullName: 'Emmanuel Mbeki',
    age: 17,
    grade: 'Terminale',
    class: 'Terminale-S',
    gender: 'M',
    nationality: 'Cameroonian',
    languages: ['French', 'English', 'Ewondo'],
    parentNames: ['Paul Mbeki', 'Marie Mbeki'],
    guardianPhone: '+237677123456',
    address: 'Bastos, Yaoundé',
    subjects: ['Mathématiques', 'Physique', 'Chimie', 'SVT', 'Français', 'Anglais'],
    averageGrade: 16.8,
    attendance: 98,
    behaviorScore: 19
  },
  {
    id: 'student-5',
    firstName: 'Aisha',
    lastName: 'Okafor',
    fullName: 'Aisha Okafor',
    age: 13,
    grade: 'JSS 2',
    class: 'JSS 2B',
    gender: 'F',
    nationality: 'Nigerian',
    languages: ['English', 'Igbo'],
    parentNames: ['Chidi Okafor', 'Ngozi Okafor'],
    guardianPhone: '+2348012345678',
    address: 'Victoria Island, Lagos',
    subjects: ['Mathematics', 'English', 'Science', 'Social Studies', 'Igbo'],
    averageGrade: 78.9,
    attendance: 92,
    behaviorScore: 16
  },
  {
    id: 'student-6',
    firstName: 'Manuella',
    lastName: 'Ateba',
    fullName: 'Manuella Ateba',
    age: 10,
    grade: 'CE2',
    class: 'CE2-A',
    gender: 'F',
    nationality: 'Cameroonian',
    languages: ['French', 'Beti'],
    parentNames: ['Jean Ateba', 'Claudine Ateba'],
    guardianPhone: '+237655123456',
    address: 'Mvog-Mbi, Yaoundé',
    subjects: ['Français', 'Mathématiques', 'Sciences d\'Observation', 'Dessin'],
    averageGrade: 17.2,
    attendance: 96,
    behaviorScore: 18
  }
];

// Realistic African Teachers
export const AFRICAN_TEACHERS: AfricanTeacherData[] = [
  {
    id: 'teacher-1',
    firstName: 'Marie-Claire',
    lastName: 'Nkomo',
    fullName: 'Marie-Claire Nkomo',
    age: 34,
    gender: 'F',
    subjects: ['Français', 'Littérature'],
    grades: ['6ème', '5ème', '4ème', '3ème'],
    qualification: 'DIPES II - Lettres Modernes Françaises',
    experience: 8,
    languages: ['French', 'English', 'Duala'],
    phone: '+237699876543',
    email: 'mc.nkomo@college-excellence.cm',
    specializations: ['Grammar', 'Creative Writing', 'African Literature'],
    classesAssigned: ['6ème-A', '5ème-B', '4ème-A']
  },
  {
    id: 'teacher-2',
    firstName: 'Abdoulaye',
    lastName: 'Diallo',
    fullName: 'Abdoulaye Diallo',
    age: 41,
    gender: 'M',
    subjects: ['Mathématiques', 'Physique'],
    grades: ['Seconde', 'Première', 'Terminale'],
    qualification: 'DIPES II - Mathématiques-Physique',
    experience: 15,
    languages: ['French', 'Arabic', 'Fulfulde'],
    phone: '+237677234567',
    email: 'a.diallo@lycee-douala.cm',
    specializations: ['Advanced Mathematics', 'Mechanics', 'Thermodynamics'],
    classesAssigned: ['Terminale-S', 'Première-S']
  },
  {
    id: 'teacher-3',
    firstName: 'Grace',
    lastName: 'Adebayo',
    fullName: 'Grace Adebayo',
    age: 29,
    gender: 'F',
    subjects: ['English Language', 'Literature'],
    grades: ['Form 1', 'Form 2', 'Form 3'],
    qualification: 'B.Ed. English Education',
    experience: 5,
    languages: ['English', 'Yoruba'],
    phone: '+2348023456789',
    email: 'g.adebayo@gss-bamenda.edu.ng',
    specializations: ['Grammar', 'Poetry', 'Drama'],
    classesAssigned: ['Form 2A', 'Form 3B']
  },
  {
    id: 'teacher-4',
    firstName: 'Samuel',
    lastName: 'Kouassi',
    fullName: 'Samuel Kouassi',
    age: 38,
    gender: 'M',
    subjects: ['Sciences de la Vie et de la Terre', 'Chimie'],
    grades: ['4ème', '3ème', 'Seconde'],
    qualification: 'DIPES II - Sciences Naturelles',
    experience: 12,
    languages: ['French', 'Baoulé'],
    phone: '+22507123456',
    email: 's.kouassi@college-abidjan.ci',
    specializations: ['Biology', 'Organic Chemistry', 'Environmental Science'],
    classesAssigned: ['3ème-A', 'Seconde-C']
  }
];

// African Educational Subjects
export const AFRICAN_SUBJECTS: AfricanSubjectData[] = [
  {
    id: 'subject-1',
    name: 'Mathematics',
    nameFr: 'Mathématiques',
    category: 'core',
    grades: ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', '5ème', '4ème', '3ème'],
    curriculum: 'Cameroon National',
    hours: 6,
    coefficient: 4,
    examType: 'continuous'
  },
  {
    id: 'subject-2',
    name: 'French Language',
    nameFr: 'Français',
    category: 'core',
    grades: ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', '5ème', '4ème', '3ème'],
    curriculum: 'Cameroon National',
    hours: 8,
    coefficient: 5,
    examType: 'continuous'
  },
  {
    id: 'subject-3',
    name: 'Science and Technology',
    nameFr: 'Sciences et Technologie',
    category: 'core',
    grades: ['CE1', 'CE2', 'CM1', 'CM2'],
    curriculum: 'Cameroon National',
    hours: 4,
    coefficient: 3,
    examType: 'practical'
  },
  {
    id: 'subject-4',
    name: 'History and Geography',
    nameFr: 'Histoire-Géographie',
    category: 'core',
    grades: ['CE2', 'CM1', 'CM2', '6ème', '5ème', '4ème', '3ème'],
    curriculum: 'Cameroon National',
    hours: 3,
    coefficient: 2,
    examType: 'continuous'
  },
  {
    id: 'subject-5',
    name: 'English Language',
    nameFr: 'Anglais',
    category: 'core',
    grades: ['6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'],
    curriculum: 'Cameroon National',
    hours: 4,
    coefficient: 3,
    examType: 'oral'
  },
  {
    id: 'subject-6',
    name: 'National Languages',
    nameFr: 'Langues Nationales',
    category: 'elective',
    grades: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
    curriculum: 'African Cultural',
    hours: 2,
    coefficient: 1,
    examType: 'oral'
  },
  {
    id: 'subject-7',
    name: 'Physical Education',
    nameFr: 'Éducation Physique et Sportive',
    category: 'sports',
    grades: ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', '5ème', '4ème', '3ème'],
    curriculum: 'Universal',
    hours: 3,
    coefficient: 2,
    examType: 'practical'
  },
  {
    id: 'subject-8',
    name: 'Art and Crafts',
    nameFr: 'Arts Plastiques',
    category: 'arts',
    grades: ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', '5ème'],
    curriculum: 'African Cultural',
    hours: 2,
    coefficient: 1,
    examType: 'practical'
  }
];

// Realistic Grade Records
export const AFRICAN_GRADES: AfricanGradeData[] = [
  {
    id: 'grade-1',
    studentId: 'student-1',
    subjectId: 'subject-2',
    term: '1er Trimestre',
    evaluationType: 'Devoir Surveillé',
    score: 16,
    maxScore: 20,
    coefficient: 5,
    teacher: 'Mme. Nkomo',
    date: '2024-11-15',
    comments: 'Excellent travail en expression écrite. Continue ainsi!'
  },
  {
    id: 'grade-2',
    studentId: 'student-1',
    subjectId: 'subject-1',
    term: '1er Trimestre',
    evaluationType: 'Composition',
    score: 14,
    maxScore: 20,
    coefficient: 4,
    teacher: 'M. Diallo',
    date: '2024-11-20',
    comments: 'Bonne maîtrise des opérations. Attention aux calculs géométriques.'
  },
  {
    id: 'grade-3',
    studentId: 'student-2',
    subjectId: 'subject-5',
    term: 'First Term',
    evaluationType: 'Test',
    score: 18,
    maxScore: 20,
    coefficient: 3,
    teacher: 'Ms. Adebayo',
    date: '2024-11-18',
    comments: 'Outstanding performance in creative writing. Keep up the excellent work!'
  },
  {
    id: 'grade-4',
    studentId: 'student-4',
    subjectId: 'subject-1',
    term: '1er Trimestre',
    evaluationType: 'Devoir Maison',
    score: 17,
    maxScore: 20,
    coefficient: 4,
    teacher: 'M. Diallo',
    date: '2024-11-22',
    comments: 'Très bon niveau en analyse. Élève prometteur pour les concours.'
  }
];

// African Educational System Constants
export const AFRICAN_EDUCATION_CONSTANTS = {
  GRADING_SYSTEMS: {
    cameroon: {
      scale: '0-20',
      passing: 10,
      excellent: 16,
      mentions: {
        'Très Bien': { min: 16, max: 20 },
        'Bien': { min: 14, max: 15.99 },
        'Assez Bien': { min: 12, max: 13.99 },
        'Passable': { min: 10, max: 11.99 },
        'Échec': { min: 0, max: 9.99 }
      }
    },
    nigeria: {
      scale: '0-100',
      passing: 50,
      excellent: 80,
      grades: {
        'A': { min: 80, max: 100 },
        'B': { min: 70, max: 79 },
        'C': { min: 60, max: 69 },
        'D': { min: 50, max: 59 },
        'F': { min: 0, max: 49 }
      }
    }
  },
  ACADEMIC_CALENDAR: {
    cameroon: {
      startDate: '2024-09-02',
      endDate: '2025-06-30',
      terms: [
        { name: '1er Trimestre', start: '2024-09-02', end: '2024-12-15' },
        { name: '2ème Trimestre', start: '2025-01-06', end: '2025-04-04' },
        { name: '3ème Trimestre', start: '2025-04-14', end: '2025-06-30' }
      ]
    },
    nigeria: {
      startDate: '2024-09-16',
      endDate: '2025-07-15',
      terms: [
        { name: 'First Term', start: '2024-09-16', end: '2024-12-20' },
        { name: 'Second Term', start: '2025-01-13', end: '2025-04-11' },
        { name: 'Third Term', start: '2025-04-28', end: '2025-07-15' }
      ]
    }
  },
  LANGUAGES: {
    official: ['French', 'English', 'Arabic', 'Portuguese'],
    national: ['Wolof', 'Hausa', 'Yoruba', 'Igbo', 'Swahili', 'Amharic', 'Duala', 'Beti', 'Bamoun'],
    foreign: ['Spanish', 'German', 'Chinese', 'Italian']
  },
  CURRENCIES: {
    'XAF': { name: 'Central African CFA Franc', countries: ['Cameroon', 'Chad', 'CAR', 'Equatorial Guinea', 'Gabon', 'Congo'] },
    'XOF': { name: 'West African CFA Franc', countries: ['Senegal', 'Mali', 'Burkina Faso', 'Niger', 'Ivory Coast', 'Guinea-Bissau', 'Togo', 'Benin'] },
    'NGN': { name: 'Nigerian Naira', countries: ['Nigeria'] },
    'GHS': { name: 'Ghanaian Cedi', countries: ['Ghana'] },
    'KES': { name: 'Kenyan Shilling', countries: ['Kenya'] }
  }
};

export default {
  schools: AFRICAN_SCHOOLS,
  students: AFRICAN_STUDENTS,
  teachers: AFRICAN_TEACHERS,
  subjects: AFRICAN_SUBJECTS,
  grades: AFRICAN_GRADES,
  constants: AFRICAN_EDUCATION_CONSTANTS
};
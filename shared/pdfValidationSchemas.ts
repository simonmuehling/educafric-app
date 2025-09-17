import { z } from 'zod';

// School data validation schema for PDF generation
export const PdfSchoolDataSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1, 'School name is required'),
  address: z.string().min(1, 'School address is required'),
  phone: z.string().optional(),
  email: z.string().email('Valid email is required').optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  regionalDelegation: z.string().optional(),
  departmentalDelegation: z.string().optional(),
  postalBox: z.string().optional(),
  district: z.string().optional(),
  academicYear: z.string().min(1, 'Academic year is required'),
  currentTerm: z.enum(['T1', 'T2', 'T3']).optional(),
  director: z.string().optional(),
  city: z.string().optional(),
});

// Student data validation schema for PDF generation
export const PdfStudentDataSchema = z.object({
  id: z.number().int().positive().or(z.string()),
  firstName: z.string().min(1, 'Student first name is required'),
  lastName: z.string().min(1, 'Student last name is required'),
  birthDate: z.string().min(1, 'Birth date is required'),
  birthPlace: z.string().min(1, 'Birth place is required'),
  gender: z.enum(['M', 'F', 'Masculin', 'Féminin']).optional(),
  className: z.string().min(1, 'Class name is required'),
  matricule: z.string().min(1, 'Student number/matricule is required'),
  studentNumber: z.string().optional(),
  photo: z.string().url().optional().or(z.literal('')),
});

// Grade/subject data validation schema for PDF generation
export const PdfGradeSchema = z.object({
  id: z.number().int().positive().optional(),
  subjectId: z.number().int().positive().optional(),
  name: z.string().min(1, 'Subject name is required'),
  subjectName: z.string().optional(),
  grade: z.number().min(0).max(20, 'Grade must be between 0 and 20'),
  note: z.number().min(0).max(20).optional(),
  maxGrade: z.number().positive().default(20),
  coefficient: z.number().int().positive().min(1, 'Coefficient must be positive'),
  coef: z.number().int().positive().optional(),
  points: z.number().optional(),
  comments: z.string().optional(),
  teacherComments: z.string().optional(),
  appreciation: z.string().optional(),
  teacherName: z.string().min(1, 'Teacher name is required'),
});

// Bulletin metadata validation schema for PDF generation
export const PdfBulletinMetadataSchema = z.object({
  id: z.number().int().positive(),
  studentId: z.number().int().positive(),
  classId: z.number().int().positive(),
  schoolId: z.number().int().positive().optional(),
  term: z.enum(['T1', 'T2', 'T3', 'Premier Trimestre', 'Deuxième Trimestre', 'Troisième Trimestre']),
  academicYear: z.string().min(1, 'Academic year is required'),
  generalAverage: z.number().min(0).max(20).default(0),
  classRank: z.number().int().positive().default(1),
  totalStudentsInClass: z.number().int().positive().default(30),
  teacherComments: z.string().optional(),
  directorComments: z.string().optional(),
  status: z.enum(['draft', 'approved', 'published']).default('draft'),
  metadata: z.object({
    schoolData: PdfSchoolDataSchema.optional(),
    studentData: PdfStudentDataSchema.optional(),
    academicData: z.object({
      className: z.string().optional(),
    }).optional(),
    grades: z.array(PdfGradeSchema).optional(),
  }).optional(),
});

// Complete bulletin template data for PDF generation
export const PdfBulletinTemplateDataSchema = z.object({
  schoolInfo: PdfSchoolDataSchema,
  student: PdfStudentDataSchema,
  period: z.string().min(1, 'Period is required'),
  subjects: z.array(PdfGradeSchema).min(1, 'At least one subject is required'),
  generalAverage: z.number().min(0).max(20),
  classRank: z.number().int().positive(),
  totalStudents: z.number().int().positive(),
  conduct: z.string().optional(),
  conductGrade: z.number().min(0).max(20).optional(),
  absences: z.number().int().min(0).optional(),
  teacherComments: z.string().optional(),
  directorComments: z.string().optional(),
  verificationCode: z.string().optional(),
});

// Document data validation schema for PDF generation
export const PdfDocumentDataSchema = z.object({
  id: z.string().min(1, 'Document ID is required'),
  title: z.string().min(1, 'Document title is required'),
  type: z.enum(['system', 'commercial', 'proposal', 'report']),
  content: z.string().optional(),
  user: z.object({
    id: z.number().int().positive().or(z.string()).optional(),
    email: z.string().email('Valid email is required').optional(),
    name: z.string().optional(),
  }).optional(),
});

// PDF generation request validation schemas
export const GenerateBulletinPdfRequestSchema = z.object({
  bulletinId: z.number().int().positive(),
  language: z.enum(['fr', 'en']).default('fr'),
  format: z.enum(['A4', 'Letter']).default('A4'),
});

export const GenerateDocumentPdfRequestSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  language: z.enum(['fr', 'en']).default('fr'),
  format: z.enum(['A4', 'Letter']).default('A4'),
});

// Types derived from schemas
export type PdfSchoolData = z.infer<typeof PdfSchoolDataSchema>;
export type PdfStudentData = z.infer<typeof PdfStudentDataSchema>;
export type PdfGradeData = z.infer<typeof PdfGradeSchema>;
export type PdfBulletinMetadata = z.infer<typeof PdfBulletinMetadataSchema>;
export type PdfBulletinTemplateData = z.infer<typeof PdfBulletinTemplateDataSchema>;
export type PdfDocumentData = z.infer<typeof PdfDocumentDataSchema>;
export type GenerateBulletinPdfRequest = z.infer<typeof GenerateBulletinPdfRequestSchema>;
export type GenerateDocumentPdfRequest = z.infer<typeof GenerateDocumentPdfRequestSchema>;

// Helper function to validate PDF generation data
export function validatePdfData<T>(schema: z.ZodSchema<T>, data: unknown, context: string = 'PDF data'): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`${context} validation failed: ${errorMessages}`);
    }
    throw error;
  }
}

// Safe data extraction with defaults
export function extractSafeSchoolData(rawData: any): PdfSchoolData {
  return {
    name: rawData?.name || rawData?.schoolName || 'École non spécifiée',
    address: rawData?.address || 'Adresse non spécifiée',
    phone: rawData?.phone || rawData?.phoneNumber || undefined,
    email: rawData?.email || undefined,
    logoUrl: rawData?.logoUrl || rawData?.logo_url || undefined,
    regionalDelegation: rawData?.regionalDelegation || rawData?.regionale_ministerielle || 'Délégation Régionale',
    departmentalDelegation: rawData?.departmentalDelegation || rawData?.delegation_departementale || 'Délégation Départementale',
    postalBox: rawData?.postalBox || rawData?.boite_postale || undefined,
    district: rawData?.district || rawData?.arrondissement || undefined,
    academicYear: rawData?.academicYear || rawData?.academic_year || '2024-2025',
    currentTerm: rawData?.currentTerm || rawData?.current_term || undefined,
    director: rawData?.director || rawData?.directorName || undefined,
    city: rawData?.city || undefined,
  };
}

export function extractSafeStudentData(rawData: any, studentId?: number | string): PdfStudentData {
  return {
    id: rawData?.id || rawData?.studentId || studentId || 'N/A',
    firstName: rawData?.firstName || rawData?.first_name || 'Prénom',
    lastName: rawData?.lastName || rawData?.last_name || 'Nom',
    birthDate: rawData?.birthDate || rawData?.birth_date || 'Date non renseignée',
    birthPlace: rawData?.birthPlace || rawData?.birth_place || 'Lieu non renseigné',
    gender: rawData?.gender || undefined,
    className: rawData?.className || rawData?.class_name || 'Classe',
    matricule: rawData?.matricule || rawData?.studentNumber || `MAT${studentId || '000'}`,
    studentNumber: rawData?.studentNumber || rawData?.matricule || undefined,
    photo: rawData?.photo || rawData?.photoUrl || undefined,
  };
}
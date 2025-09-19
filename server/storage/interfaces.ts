// ===== STORAGE INTERFACES =====
// Extracted from huge storage.ts file to prevent crashes

export interface IUserStorage {
  createUser(user: any): Promise<any>;
  getUserById(id: number): Promise<any | null>;
  getUserByEmail(email: string): Promise<any | null>;
  getUserByPasswordResetToken(token: string): Promise<any | null>;
  getAllUsers(): Promise<any[]>;
  updateUser(id: number, updates: any): Promise<any>;
  deleteUser(id: number): Promise<void>;
  verifyPassword(user: any, password: string): Promise<boolean>;
  // Email preferences
  getEmailPreferences(userId: number): Promise<any | null>;
  createEmailPreferences(data: any): Promise<any>;
  updateEmailPreferences(userId: number, updates: any): Promise<any>;
  // Storage helper
  getUser(userId: number): Promise<any | null>;
}

export interface ISchoolStorage {
  createSchool(school: any): Promise<any>;
  getSchool(id: number): Promise<any | null>;
  updateSchool(id: number, updates: any): Promise<any>;
  getUserSchools(userId: number): Promise<any[]>;
  getSchoolClasses(schoolId: number): Promise<any[]>;
  getSchoolTeachers(schoolId: number): Promise<any[]>;
}

export interface IStudentStorage {
  createStudentRecord(student: any): Promise<any>;
  getStudent(id: number): Promise<any | null>;
  updateStudentRecord(id: number, updates: any): Promise<any>;
  getStudentGrades(studentId: number): Promise<any[]>;
  getStudentAttendance(studentId: number): Promise<any[]>;
  getStudentClasses(studentId: number): Promise<any[]>;
  getStudentAssignments(studentId: number): Promise<any[]>;
}

export interface IGradeStorage {
  getGradesBySchool(schoolId: number): Promise<any[]>;
  getGradesByClass(classId: number, filters?: any): Promise<any[]>;
  getGradesBySubject(subjectId: number): Promise<any[]>;
  getGrade(gradeId: number): Promise<any | null>;
  createGrade(gradeData: any): Promise<any>;
  updateGrade(gradeId: number, updates: any): Promise<any>;
  deleteGrade(gradeId: number): Promise<void>;
  recordGrade(data: any): Promise<any>;
  // New methods for import functionality
  getGradeByStudentSubjectTerm(studentId: number, subjectId: number, academicYear: string, term: string): Promise<any | null>;
  getStudentGradesWithFilters(studentId: number, filters?: any): Promise<any[]>;
}

export interface IPWAStorage {
  trackPwaSession(data: any): Promise<any>;
  getPwaUserStatistics(): Promise<any>;
  updateUserAccessMethod(userId: number, accessMethod: string, isPwaInstalled: boolean): Promise<void>;
}

export interface IBulletinStorage {
  getBulletin(id: number): Promise<any | null>;
  createBulletin(bulletin: any): Promise<any>;
  updateBulletin(id: number, updates: any): Promise<any>;
  getBulletinsByStudent(studentId: number): Promise<any[]>;
  getBulletinsByClass(classId: number): Promise<any[]>;
  getBulletinsBySchool(schoolId: number): Promise<any[]>;
}

export interface ISubjectStorage {
  getSchoolSubjects(schoolId: number): Promise<any[]>;
  getSubject(id: number): Promise<any | null>;
  createSubject(subjectData: any): Promise<any>;
  updateSubject(id: number, updates: any): Promise<any>;
  deleteSubject(id: number): Promise<void>;
  getSubjectsByClass(classId: number): Promise<any[]>;
}

export interface IAcademicStorage {
  getAcademicConfiguration(schoolId: number): Promise<any | null>;
  setAcademicConfiguration(schoolId: number, config: any): Promise<any>;
  updateAcademicTerms(schoolId: number, terms: any[], userId: number): Promise<any>;
  updateAcademicYear(schoolId: number, year: any, userId: number): Promise<any>;
  initializeNewAcademicYear(schoolId: number, year: any, promotionSettings: any, userId: number): Promise<any>;
}

export interface ISanctionStorage {
  createSanction(sanction: any): Promise<any>;
  getSanction(id: number): Promise<any | null>;
  updateSanction(id: number, updates: any): Promise<any>;
  deleteSanction(id: number): Promise<void>;
  getStudentSanctions(studentId: number, filters?: any): Promise<any[]>;
  getClassSanctions(classId: number, filters?: any): Promise<any[]>;
  getSchoolSanctions(schoolId: number, filters?: any): Promise<any[]>;
  getSanctionsByType(schoolId: number, sanctionType: string): Promise<any[]>;
  revokeSanction(id: number, revokedBy: number, reason: string): Promise<any>;
  appealSanction(id: number, appealReason: string): Promise<any>;
  expireSanctions(): Promise<void>; // For batch processing of expired sanctions
}

export interface IBulletinTemplateStorage {
  // Template CRUD operations
  createTemplate(template: any): Promise<any>;
  getTemplate(id: number): Promise<any | null>;
  updateTemplate(id: number, updates: any): Promise<any>;
  deleteTemplate(id: number): Promise<boolean>;
  listTemplates(schoolId: number, filters?: any): Promise<{ templates: any[]; total: number }>;

  // Template version management
  createTemplateVersion(templateId: number, version: any): Promise<any>;
  getTemplateVersions(templateId: number): Promise<any[]>;
  getTemplateVersion(templateId: number, version: number): Promise<any | null>;

  // Template element types
  getElementTypes(): Promise<any[]>;
  getElementTypesByCategory(category: string): Promise<any[]>;

  // Template usage tracking
  incrementUsageCount(templateId: number): Promise<void>;
  getTemplateUsageStats(schoolId: number): Promise<any[]>;

  // Default templates
  getDefaultTemplates(): Promise<any[]>;
  createDefaultTemplate(template: any): Promise<any>;

  // Template duplication
  duplicateTemplate(templateId: number, newName: string, schoolId: number, createdBy: number): Promise<any>;

  // Template export/import
  exportTemplate(templateId: number): Promise<any>;
  importTemplate(templateData: any, schoolId: number, createdBy: number): Promise<any>;
}
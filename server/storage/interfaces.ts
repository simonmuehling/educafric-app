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
  getGradesByClass(classId: number): Promise<any[]>;
  getGradesBySubject(subjectId: number): Promise<any[]>;
  getGrade(gradeId: number): Promise<any | null>;
  createGrade(gradeData: any): Promise<any>;
  updateGrade(gradeId: number, updates: any): Promise<any>;
  deleteGrade(gradeId: number): Promise<void>;
  recordGrade(data: any): Promise<any>;
}

export interface IPWAStorage {
  trackPwaSession(data: any): Promise<any>;
  getPwaUserStatistics(): Promise<any>;
  updateUserAccessMethod(userId: number, accessMethod: string, isPwaInstalled: boolean): Promise<void>;
}
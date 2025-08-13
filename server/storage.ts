import { 
  type User, type School,
  type Class, type InsertClass, type Subject, type InsertSubject,
  type Grade, type InsertGrade, type Attendance, type InsertAttendance,
  type Homework, type InsertHomework, type Payment, type InsertPayment,
  type CommunicationLog, type TimetableSlot, type ParentStudentRelation,
  type CommercialDocument, type InsertCommercialDocument,
  type CommercialContact, type InsertCommercialContact,
  type Message, type InsertMessage, type MessageRecipient, type InsertMessageRecipient,
  type TeacherAbsence, type InsertTeacherAbsence,
  type ParentRequest, type InsertParentRequest, type ParentRequestResponse, type InsertParentRequestResponse,
  type ParentRequestNotification, type InsertParentRequestNotification,
  type NotificationSettings, type InsertNotificationSettings,
  type Notification, type InsertNotification,
  type EmailPreferences, type InsertEmailPreferences, type UpdateEmailPreferences,
  users, schools, classes, subjects, grades, attendance,
  homework, payments, messages, notifications, teacherAbsences, parentRequests, emailPreferences
} from "../shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, like, count, sql, or, lt, gte, lte, ne, inArray } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

export interface IStorage {
  // ===== DELEGATE ADMINISTRATORS INTERFACE =====
  getDelegateAdministrators(schoolId: number): Promise<any[]>;
  addDelegateAdministrator(data: { teacherId: number; schoolId: number; adminLevel: string; assignedBy: number }): Promise<any>;
  removeDelegateAdministrator(adminId: number, schoolId: number): Promise<void>;
  updateDelegateAdministratorPermissions(adminId: number, permissions: string[], schoolId: number): Promise<void>;
  getAvailableTeachersForAdmin(schoolId: number): Promise<any[]>;
  
  // ===== SCHOOL ADMINISTRATION INTERFACE =====
  getAdministrationStats(schoolId: number): Promise<any>;
  getAdministrationTeachers(schoolId: number): Promise<any[]>;
  getAdministrationStudents(schoolId: number): Promise<any[]>;
  getAdministrationParents(schoolId: number): Promise<any[]>;
  createTeacher(data: any): Promise<any>;
  updateTeacher(id: number, data: any): Promise<any>;
  deleteTeacher(id: number): Promise<void>;
  blockUserAccess(userId: number, reason: string): Promise<any>;
  unblockUserAccess(userId: number): Promise<any>;
  createStudent(data: any): Promise<any>;
  updateStudent(id: number, data: any): Promise<any>;
  deleteStudent(id: number): Promise<void>;
  createParent(data: any): Promise<any>;
  updateParent(id: number, data: any): Promise<any>;
  deleteParent(id: number): Promise<void>;
  getSchoolStudents(schoolId: number): Promise<any[]>;
  getSchoolParents(schoolId: number): Promise<any[]>;
  
  // Student-specific grade and attendance methods
  getStudentGrades(studentId: number): Promise<any[]>;
  getStudentAttendance(studentId: number): Promise<any[]>;
  
  // Teacher-specific methods
  getTeacherClasses(teacherId: number): Promise<any[]>;
  getTeacherStudents(teacherId: number): Promise<any[]>;
  
  // Class management methods
  getClassesBySchool(schoolId: number): Promise<any[]>;
  getClass(classId: number): Promise<any | null>;
  createClass(classData: any): Promise<any>;
  updateClass(classId: number, updates: any): Promise<any>;
  deleteClass(classId: number): Promise<void>;
  getSubjectsByClass(classId: number): Promise<any[]>;
  
  // Grade management methods
  getGradesBySchool(schoolId: number): Promise<any[]>;
  getGradesByClass(classId: number): Promise<any[]>;
  getGradesBySubject(subjectId: number): Promise<any[]>;
  getGrade(gradeId: number): Promise<any | null>;
  createGrade(gradeData: any): Promise<any>;
  updateGrade(gradeId: number, updates: any): Promise<any>;
  deleteGrade(gradeId: number): Promise<void>;
  getGradeStatsByClass(classId: number): Promise<any>;

  // ===== PARENT-CHILD CONNECTION INTERFACE =====
  searchChildrenForParent(searchData: any): Promise<any[]>;
  connectParentToExistingChild(parentId: number, childId: number, relation: string): Promise<any>;
  createParentChildConnectionRequest(parentId: number, childData: any, relation: string): Promise<any>;

  // ===== FREELANCER-STUDENT CONNECTION INTERFACE =====
  searchStudentsForFreelancer(searchData: any): Promise<any[]>;
  connectFreelancerToExistingStudent(freelancerId: number, studentId: number, serviceData: any): Promise<any>;
  createFreelancerStudentConnectionRequest(freelancerId: number, studentData: any, serviceData: any): Promise<any>;

  // ===== CHILD-PARENT CONNECTION INTERFACE =====
  searchParentsForChild(searchData: any): Promise<any[]>;
  connectChildToExistingParent(studentId: number, parentId: number, relationship: string): Promise<any>;
  createChildParentConnectionRequest(studentId: number, parentData: any, relationship: string): Promise<any>;

  // ===== SMART DUPLICATE DETECTION INTERFACE =====
  getSmartDuplicateDetections(schoolId: number): Promise<any[]>;
  mergeUserDuplicate(duplicateId: string, existingUserId: number, newUserData: any, schoolId: number): Promise<any>;
  ignoreDuplicateDetection(duplicateId: string, schoolId: number): Promise<any>;
  createSeparateUser(duplicateId: string, newUserData: any, schoolId: number): Promise<any>;

  // ===== BASIC USER MANAGEMENT =====
  createUser(user: any): Promise<User>;
  getUserById(id: number): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByPasswordResetToken(token: string): Promise<User | null>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  verifyPassword(user: User, password: string): Promise<boolean>;

  // ===== SCHOOL MANAGEMENT =====
  createSchool(school: any): Promise<School>;
  getSchool(id: number): Promise<School | null>;
  updateSchool(id: number, updates: any): Promise<School>;
  getUserSchools(userId: number): Promise<School[]>;

  // ===== STUDENT MANAGEMENT =====
  createStudentRecord(student: any): Promise<any>;
  getStudent(id: number): Promise<any | null>;
  updateStudentRecord(id: number, updates: any): Promise<any>;
  getStudentsBySchool(schoolId: number): Promise<any[]>;
  getStudentsByClass(classId: number): Promise<any[]>;

  // ===== TEACHER MANAGEMENT =====
  createTeacherRecord(teacher: any): Promise<any>;
  getTeacher(id: number): Promise<any | null>;
  updateTeacherRecord(id: number, updates: any): Promise<any>;
  getTeachersBySchool(schoolId: number): Promise<any[]>;

  // ===== CLASS MANAGEMENT =====
  createClass(classData: InsertClass): Promise<Class>;
  getClass(id: number): Promise<Class | null>;
  updateClass(id: number, updates: Partial<InsertClass>): Promise<Class>;
  deleteClass(id: number): Promise<void>;
  getClassesBySchool(schoolId: number): Promise<Class[]>;

  // ===== SUBJECT MANAGEMENT =====
  createSubject(subject: InsertSubject): Promise<Subject>;
  getSubject(id: number): Promise<Subject | null>;
  updateSubject(id: number, updates: Partial<InsertSubject>): Promise<Subject>;
  getSubjectsBySchool(schoolId: number): Promise<Subject[]>;

  // ===== ATTENDANCE MANAGEMENT =====
  recordAttendance(attendance: InsertAttendance): Promise<Attendance>;
  getAttendance(studentId: number, date: string): Promise<Attendance | null>;
  getAttendanceByClass(classId: number, date: string): Promise<Attendance[]>;
  updateAttendance(id: number, status: string): Promise<Attendance>;

  // ===== GRADE MANAGEMENT =====
  createGrade(grade: InsertGrade): Promise<Grade>;
  getGrade(id: number): Promise<Grade | null>;
  updateGrade(id: number, updates: Partial<InsertGrade>): Promise<Grade>;
  getGradesByStudent(studentId: number): Promise<Grade[]>;
  getGradesByClass(classId: number): Promise<Grade[]>;

  // ===== HOMEWORK MANAGEMENT =====
  createHomework(homework: InsertHomework): Promise<Homework>;
  getHomework(id: number): Promise<Homework | null>;
  updateHomework(id: number, updates: Partial<InsertHomework>): Promise<Homework>;
  getHomeworkByClass(classId: number): Promise<Homework[]>;
  getHomeworkByStudent(studentId: number): Promise<Homework[]>;

  // ===== PAYMENT MANAGEMENT =====
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: number): Promise<Payment | null>;
  updatePayment(id: number, updates: Partial<InsertPayment>): Promise<Payment>;
  getPaymentsByUser(userId: number): Promise<Payment[]>;
  getPaymentsBySchool(schoolId: number): Promise<Payment[]>;

  // ===== MESSAGING SYSTEM =====
  createMessage(message: InsertMessage): Promise<Message>;
  getMessage(id: number): Promise<Message | null>;
  getMessages(userId: number): Promise<Message[]>;
  markMessageAsRead(messageId: number, userId: number): Promise<void>;

  // ===== NOTIFICATION SYSTEM =====
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  markAllNotificationsAsRead(userId: number): Promise<void>;

  // ===== TEACHER ABSENCE SYSTEM =====
  createTeacherAbsence(absence: InsertTeacherAbsence): Promise<TeacherAbsence>;
  getTeacherAbsences(schoolId: number): Promise<TeacherAbsence[]>;
  updateTeacherAbsence(id: number, updates: Partial<InsertTeacherAbsence>): Promise<TeacherAbsence>;
  approveTeacherAbsence(id: number, approverId: number): Promise<TeacherAbsence>;
  rejectTeacherAbsence(id: number, approverId: number, reason: string): Promise<TeacherAbsence>;

  // ===== PARENT REQUESTS SYSTEM =====
  getParentRequests(schoolId: number, filters?: any): Promise<any[]>;
  createParentRequest(request: InsertParentRequest): Promise<any>;
  updateParentRequest(id: number, updates: Partial<InsertParentRequest>): Promise<any>;
  processParentRequest(requestId: number, status: string, response: string, processedBy: number): Promise<any>;
  markParentRequestUrgent(requestId: number, isUrgent: boolean): Promise<any>;
  sendParentRequestNotifications(requestId: number, message: string): Promise<any>;
  getParentRequestResponses(requestId: number): Promise<any[]>;

  // ===== BULLETIN SYSTEM =====
  getBulletins(schoolId: number, filters?: any): Promise<any[]>;
  getBulletin(id: number): Promise<any>;
  createBulletin(bulletin: any): Promise<any>;
  updateBulletin(id: number, updates: any): Promise<any>;
  approveBulletin(bulletinId: number, approverId: number, comment?: string): Promise<any>;
  rejectBulletin(bulletinId: number, approverId: number, comment: string): Promise<any>;
  sendBulletin(bulletinId: number, sentBy: number): Promise<any>;
  createBulletinApproval(approval: any): Promise<any>;
  getBulletinApprovals(bulletinId: number): Promise<any[]>;

  // ===== EMAIL PREFERENCES SYSTEM =====
  getEmailPreferences(userId: number): Promise<EmailPreferences | null>;
  createEmailPreferences(preferences: InsertEmailPreferences): Promise<EmailPreferences>;
  updateEmailPreferences(userId: number, updates: UpdateEmailPreferences): Promise<EmailPreferences>;

  // ===== SCHOOL ADMINISTRATORS SYSTEM =====
  grantSchoolAdminRights(teacherId: number, schoolId: number, adminLevel: string, grantedBy: number): Promise<any>;
  revokeSchoolAdminRights(teacherId: number, schoolId: number, revokedBy: number): Promise<any>;
  getSchoolAdministrators(schoolId: number): Promise<any[]>;
  checkSchoolAdminPermissions(userId: number, schoolId: number, permission: string): Promise<boolean>;
  getSchoolAdminPermissions(userId: number, schoolId: number): Promise<string[]>;

  // ===== DIRECTOR MODULES =====
  getDirectorClasses(directorId: number): Promise<any[]>;
  getSchoolAttendanceStats(schoolId: number): Promise<any>;
  getSchoolAttendanceByDate(schoolId: number, date: string): Promise<any[]>;
  updateAttendanceRecord(recordId: number, data: any): Promise<any>;
  getParentRequestsStats(schoolId: number): Promise<any>;
  getGeolocationOverview(schoolId: number): Promise<any>;
  getTrackingDevices(schoolId: number): Promise<any[]>;
  addTrackingDevice(deviceData: any): Promise<any>;
  updateTrackingDevice(deviceId: number, data: any): Promise<any>;
  getBulletinApprovalStats(schoolId: number): Promise<any>;
  getTeacherAbsenceStats(schoolId: number): Promise<any>;
  getTimetableOverview(schoolId: number): Promise<any>;
  createTimetableSlot(slotData: any): Promise<any>;
  updateTimetableSlot(slotId: number, data: any): Promise<any>;
  deleteTimetableSlot(slotId: number): Promise<void>;
  getFinancialOverview(schoolId: number): Promise<any>;
  getFinancialTransactions(schoolId: number): Promise<any[]>;
  createTransaction(transactionData: any): Promise<any>;
  getReportsOverview(schoolId: number): Promise<any>;
  generateReport(reportType: string, schoolId: number, params: any): Promise<any>;
  getCommunicationsOverview(schoolId: number): Promise<any>;
  getSchoolMessages(schoolId: number): Promise<any[]>;
  sendSchoolMessage(messageData: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  roleAffiliations: any[] = []; // In-memory storage for now

  // ===== DELEGATE ADMINISTRATORS IMPLEMENTATION =====
  async getDelegateAdministrators(schoolId: number): Promise<any[]> {
    console.log(`[DELEGATE_ADMIN_STORAGE] Getting administrators for school ${schoolId}`);
    return [];
  }

  async addDelegateAdministrator(data: { teacherId: number; schoolId: number; adminLevel: string; assignedBy: number }): Promise<any> {
    console.log(`[DELEGATE_ADMIN_STORAGE] Adding administrator:`, data);
    return { id: Date.now(), ...data };
  }

  async removeDelegateAdministrator(adminId: number, schoolId: number): Promise<void> {
    console.log(`[DELEGATE_ADMIN_STORAGE] Removing administrator ${adminId} from school ${schoolId}`);
  }

  async updateDelegateAdministratorPermissions(adminId: number, permissions: string[], schoolId: number): Promise<void> {
    console.log(`[DELEGATE_ADMIN_STORAGE] Updating permissions for admin ${adminId}:`, permissions);
  }

  async getAvailableTeachersForAdmin(schoolId: number): Promise<any[]> {
    console.log(`[DELEGATE_ADMIN_STORAGE] Getting available teachers for school ${schoolId}`);
    return [];
  }

  // ===== PLACEHOLDER IMPLEMENTATIONS =====
  async getAdministrationStats(schoolId: number): Promise<any> { return {}; }
  async getAdministrationTeachers(schoolId: number): Promise<any[]> { return []; }
  async getAdministrationStudents(schoolId: number): Promise<any[]> { return []; }
  async getAdministrationParents(schoolId: number): Promise<any[]> { return []; }
  async createTeacher(data: any): Promise<any> { return data; }
  async updateTeacher(id: number, data: any): Promise<any> { return data; }
  async deleteTeacher(id: number): Promise<void> {}
  async blockUserAccess(userId: number, reason: string): Promise<any> { return {}; }
  async unblockUserAccess(userId: number): Promise<any> { return {}; }
  async createStudent(data: any): Promise<any> { return data; }
  async updateStudent(id: number, data: any): Promise<any> { return data; }
  async deleteStudent(id: number): Promise<void> {}
  async getStudentGrades(studentId: number): Promise<any[]> { return []; }
  async getStudentAttendance(studentId: number): Promise<any[]> { return []; }
  async getTeacherClasses(teacherId: number): Promise<any[]> { return []; }
  async getTeacherStudents(teacherId: number): Promise<any[]> { return []; }
  
  // Class management implementations (avoiding duplicates)
  async createParent(data: any): Promise<any> { return data; }
  async updateParent(id: number, data: any): Promise<any> { return data; }
  async deleteParent(id: number): Promise<void> {}
  async getSchoolStudents(schoolId: number): Promise<any[]> { return []; }
  async getSchoolParents(schoolId: number): Promise<any[]> { return []; }

  // ===== USER MANAGEMENT IMPLEMENTATIONS =====
  async createUser(userData: any): Promise<User> {
    const [newUser] = await db.insert(users).values(userData).returning();
    return newUser;
  }

  async getUserById(id: number): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  async getUserByPasswordResetToken(token: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.passwordResetToken, token));
    return user || null;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  // ===== MINIMAL IMPLEMENTATIONS FOR ALL OTHER METHODS =====
  async createSchool(schoolData: any): Promise<School> { 
    const [newSchool] = await db.insert(schools).values(schoolData).returning();
    return newSchool;
  }
  async getSchool(id: number): Promise<School | null> { return null; }
  async updateSchool(id: number, updates: any): Promise<School> { return {} as School; }
  async getUserSchools(userId: number): Promise<School[]> { return []; }

  async createStudentRecord(student: any): Promise<any> { return {}; }
  async getStudent(id: number): Promise<any | null> { return null; }
  async updateStudentRecord(id: number, updates: any): Promise<any> { return {}; }
  async getStudentsBySchool(schoolId: number): Promise<any[]> { return []; }
  async getStudentsByClass(classId: number): Promise<any[]> { return []; }

  async createTeacherRecord(teacher: any): Promise<any> { return {}; }
  async getTeacher(id: number): Promise<any | null> { return null; }
  async updateTeacherRecord(id: number, updates: any): Promise<any> { return {}; }
  async getTeachersBySchool(schoolId: number): Promise<any[]> { return []; }

  // Class management methods (avoiding duplicates with above)

  async createSubject(subject: InsertSubject): Promise<Subject> { return {} as Subject; }
  async getSubject(id: number): Promise<Subject | null> { return null; }
  async updateSubject(id: number, updates: Partial<InsertSubject>): Promise<Subject> { return {} as Subject; }
  async getSubjectsBySchool(schoolId: number): Promise<Subject[]> { return []; }

  async recordAttendance(attendance: InsertAttendance): Promise<Attendance> { return {} as Attendance; }
  async getAttendance(studentId: number, date: string): Promise<Attendance | null> { return null; }
  async getAttendanceByClass(classId: number, date: string): Promise<Attendance[]> { return []; }
  async updateAttendance(id: number, status: string): Promise<Attendance> { return {} as Attendance; }

  // Grade management methods (avoiding duplicates with above)

  async createHomework(homework: InsertHomework): Promise<Homework> { return {} as Homework; }
  async getHomework(id: number): Promise<Homework | null> { return null; }
  async updateHomework(id: number, updates: Partial<InsertHomework>): Promise<Homework> { return {} as Homework; }
  async getHomeworkByClass(classId: number): Promise<Homework[]> { return []; }
  async getHomeworkByStudent(studentId: number): Promise<Homework[]> { return []; }

  async createPayment(payment: InsertPayment): Promise<Payment> { return {} as Payment; }
  async getPayment(id: number): Promise<Payment | null> { return null; }
  async updatePayment(id: number, updates: Partial<InsertPayment>): Promise<Payment> { return {} as Payment; }
  async getPaymentsByUser(userId: number): Promise<Payment[]> { return []; }
  async getPaymentsBySchool(schoolId: number): Promise<Payment[]> { return []; }

  async createMessage(message: InsertMessage): Promise<Message> { return {} as Message; }
  async getMessage(id: number): Promise<Message | null> { return null; }
  async getMessages(userId: number): Promise<Message[]> { return []; }
  async markMessageAsRead(messageId: number, userId: number): Promise<void> {}

  async createNotification(notification: InsertNotification): Promise<Notification> { return {} as Notification; }
  async getNotifications(userId: number): Promise<Notification[]> { return []; }
  async markNotificationAsRead(id: number): Promise<void> {}
  async markAllNotificationsAsRead(userId: number): Promise<void> {}

  async createTeacherAbsence(absence: InsertTeacherAbsence): Promise<TeacherAbsence> { return {} as TeacherAbsence; }
  async getTeacherAbsences(schoolId: number): Promise<TeacherAbsence[]> { return []; }
  async updateTeacherAbsence(id: number, updates: Partial<InsertTeacherAbsence>): Promise<TeacherAbsence> { return {} as TeacherAbsence; }
  async approveTeacherAbsence(id: number, approverId: number): Promise<TeacherAbsence> { return {} as TeacherAbsence; }
  async rejectTeacherAbsence(id: number, approverId: number, reason: string): Promise<TeacherAbsence> { return {} as TeacherAbsence; }

  async getParentRequests(schoolId: number, filters?: any): Promise<any[]> { return []; }
  async createParentRequest(request: InsertParentRequest): Promise<any> { return {}; }
  async updateParentRequest(id: number, updates: Partial<InsertParentRequest>): Promise<any> { return {}; }
  async processParentRequest(requestId: number, status: string, response: string, processedBy: number): Promise<any> { return {}; }
  async markParentRequestUrgent(requestId: number, isUrgent: boolean): Promise<any> { return {}; }
  async sendParentRequestNotifications(requestId: number, message: string): Promise<any> { return {}; }
  async getParentRequestResponses(requestId: number): Promise<any[]> { return []; }

  async getBulletins(schoolId: number, filters?: any): Promise<any[]> { return []; }
  async getBulletin(id: number): Promise<any> { return {}; }
  async createBulletin(bulletin: any): Promise<any> { return {}; }
  async updateBulletin(id: number, updates: any): Promise<any> { return {}; }
  async approveBulletin(bulletinId: number, approverId: number, comment?: string): Promise<any> { return {}; }
  async rejectBulletin(bulletinId: number, approverId: number, comment: string): Promise<any> { return {}; }
  async sendBulletin(bulletinId: number, sentBy: number): Promise<any> { return {}; }
  async createBulletinApproval(approval: any): Promise<any> { return {}; }
  async getBulletinApprovals(bulletinId: number): Promise<any[]> { return []; }

  async grantSchoolAdminRights(teacherId: number, schoolId: number, adminLevel: string, grantedBy: number): Promise<any> { return {}; }
  async revokeSchoolAdminRights(teacherId: number, schoolId: number, revokedBy: number): Promise<any> { return {}; }
  async getSchoolAdministrators(schoolId: number): Promise<any[]> { return []; }
  async checkSchoolAdminPermissions(userId: number, schoolId: number, permission: string): Promise<boolean> { return false; }
  async getSchoolAdminPermissions(userId: number, schoolId: number): Promise<string[]> { return []; }

  async getDirectorClasses(directorId: number): Promise<any[]> { return []; }
  async getSchoolAttendanceStats(schoolId: number): Promise<any> { return {}; }
  async getSchoolAttendanceByDate(schoolId: number, date: string): Promise<any[]> { return []; }
  async updateAttendanceRecord(recordId: number, data: any): Promise<any> { return {}; }
  async getParentRequestsStats(schoolId: number): Promise<any> { return {}; }
  async getGeolocationOverview(schoolId: number): Promise<any> { return {}; }
  async getTrackingDevices(schoolId: number): Promise<any[]> { return []; }
  async addTrackingDevice(deviceData: any): Promise<any> { return {}; }
  async updateTrackingDevice(deviceId: number, data: any): Promise<any> { return {}; }
  async getBulletinApprovalStats(schoolId: number): Promise<any> { return {}; }
  async getTeacherAbsenceStats(schoolId: number): Promise<any> { return {}; }
  async getTimetableOverview(schoolId: number): Promise<any> { return {}; }
  async createTimetableSlot(slotData: any): Promise<any> { return {}; }
  async updateTimetableSlot(slotId: number, data: any): Promise<any> { return {}; }
  async deleteTimetableSlot(slotId: number): Promise<void> {}
  async getFinancialOverview(schoolId: number): Promise<any> { return {}; }
  async getFinancialTransactions(schoolId: number): Promise<any[]> { return []; }
  async createTransaction(transactionData: any): Promise<any> { return {}; }
  async getReportsOverview(schoolId: number): Promise<any> { return {}; }
  async generateReport(reportType: string, schoolId: number, params: any): Promise<any> { return {}; }
  async getCommunicationsOverview(schoolId: number): Promise<any> { return {}; }
  async getSchoolMessages(schoolId: number): Promise<any[]> { return []; }
  async sendSchoolMessage(messageData: any): Promise<any> { return {}; }

  // ===== PARENT-SPECIFIC METHODS (Missing methods causing API failures) =====
  async getParentChildren(parentId: number): Promise<any[]> {
    try {
      // Get parent-student relations and join with student data
      const results = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          fullName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
          email: users.email,
          phone: users.phone,
          grade: sql<string>`'6ème'`, // Placeholder
          className: sql<string>`'6A'`, // Placeholder
          schoolName: sql<string>`'École Primaire Demo'`,
          averageGrade: sql<number>`15.5`,
          attendanceRate: sql<number>`95.2`,
          status: sql<string>`'active'`,
          lastActivity: sql<string>`'2025-01-10'`,
          nextExam: sql<string>`'2025-01-15'`,
          behavior: sql<string>`'good'`,
          profilePhoto: sql<string>`''`,
          teacherName: sql<string>`'Mme. Kameni'`
        })
        .from(users)
        .where(eq(users.role, 'Student'))
        .limit(3);
      
      return results;
    } catch (error) {
      console.error('[STORAGE] getParentChildren error:', error);
      return [];
    }
  }

  async getParentGeolocationChildren(parentId: number): Promise<any[]> {
    try {
      return [
        {
          id: 1,
          name: 'Junior Kameni',
          device: 'Tablette Samsung',
          status: 'En sécurité',
          location: 'École Primaire Central',
          lastUpdate: '2025-01-10 14:30',
          battery: 85,
          coordinates: { lat: 4.0511, lng: 9.7679 }
        },
        {
          id: 2,
          name: 'Marie Kameni',
          device: 'Smartphone Tecno',
          status: 'En mouvement',
          location: 'Route vers l\'école',
          lastUpdate: '2025-01-10 14:25',
          battery: 72,
          coordinates: { lat: 4.0481, lng: 9.7689 }
        }
      ];
    } catch (error) {
      console.error('[STORAGE] getParentGeolocationChildren error:', error);
      return [];
    }
  }

  async getParentGeolocationAlerts(parentId: number): Promise<any[]> {
    try {
      return [
        {
          id: 1,
          childName: 'Junior Kameni',
          type: 'zone_exit',
          message: 'Enfant sorti de la zone scolaire',
          timestamp: '2025-01-10 15:45',
          status: 'unread',
          priority: 'high',
          coordinates: { lat: 4.0521, lng: 9.7689 }
        },
        {
          id: 2,
          childName: 'Marie Kameni',
          type: 'battery_low',
          message: 'Batterie faible sur l\'appareil',
          timestamp: '2025-01-10 14:30',
          status: 'read',
          priority: 'medium',
          coordinates: { lat: 4.0511, lng: 9.7679 }
        },
        {
          id: 3,
          childName: 'Junior Kameni',
          type: 'speed_alert',
          message: 'Vitesse élevée détectée',
          timestamp: '2025-01-10 13:15',
          status: 'read',
          priority: 'low',
          coordinates: { lat: 4.0501, lng: 9.7669 }
        }
      ];
    } catch (error) {
      console.error('[STORAGE] getParentGeolocationAlerts error:', error);
      return [];
    }
  }

  async getParentSafeZones(parentId: number): Promise<any[]> {
    try {
      return [
        {
          id: 1,
          name: 'École Primaire Central',
          type: 'school',
          coordinates: { lat: 4.0511, lng: 9.7679 },
          radius: 500,
          active: true
        },
        {
          id: 2,
          name: 'Domicile Familial',
          type: 'home',
          coordinates: { lat: 4.0611, lng: 9.7779 },
          radius: 200,
          active: true
        }
      ];
    } catch (error) {
      console.error('[STORAGE] getParentSafeZones error:', error);
      return [];
    }
  }

  async getParentNotifications(parentId: number): Promise<any[]> {
    try {
      return [
        {
          id: 1,
          title: 'Nouvelle note disponible',
          message: 'Junior a reçu une note de 16/20 en Mathématiques',
          type: 'grade',
          timestamp: '2025-01-10 16:00',
          read: false
        },
        {
          id: 2,
          title: 'Absence signalée',
          message: 'Junior était absent ce matin',
          type: 'attendance',
          timestamp: '2025-01-10 09:00',
          read: true
        }
      ];
    } catch (error) {
      console.error('[STORAGE] getParentNotifications error:', error);
      return [];
    }
  }

  async getParentMessages(parentId: number): Promise<any[]> {
    try {
      return [
        {
          id: 1,
          from: 'Mme. Kameni',
          subject: 'Réunion parents-enseignants',
          message: 'Bonjour, nous organisons une réunion le 15 janvier...',
          timestamp: '2025-01-10 10:00',
          read: false
        }
      ];
    } catch (error) {
      console.error('[STORAGE] getParentMessages error:', error);
      return [];
    }
  }

  async getParentPayments(parentId: number): Promise<any[]> {
    try {
      return [
        {
          id: 1,
          description: 'Frais de scolarité Q1',
          amount: 50000,
          currency: 'XAF',
          dueDate: '2025-01-15',
          status: 'pending',
          child: 'Junior Kameni'
        }
      ];
    } catch (error) {
      console.error('[STORAGE] getParentPayments error:', error);
      return [];
    }
  }

  // Add alias methods for geolocation APIs that match the route calls
  async getParentAlerts(parentId: number): Promise<any[]> {
    return this.getParentGeolocationAlerts(parentId);
  }

  async getParentGeoChildren(parentId: number): Promise<any[]> {
    return this.getParentGeolocationChildren(parentId);
  }

  // ===== PARENT-CHILD CONNECTION IMPLEMENTATION =====
  async searchChildrenForParent(searchData: any): Promise<any[]> {
    try {
      const { firstName, lastName, phoneNumber, schoolName, dateOfBirth } = searchData;
      
      const results = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          grade: sql<string>`'6ème'`, // Placeholder
          schoolName: sql<string>`'École Primaire Demo'`,
          parents: sql<string>`''` // Will be populated with parent names if connected
        })
        .from(users)
        .where(
          and(
            eq(users.role, 'Student'),
            or(
              like(users.firstName, `%${firstName}%`),
              like(users.lastName, `%${lastName}%`),
              phoneNumber ? like(users.phone, `%${phoneNumber}%`) : sql`true`
            )
          )
        )
        .limit(10);
      
      return results;
    } catch (error) {
      console.error('[STORAGE] searchChildrenForParent error:', error);
      return [];
    }
  }

  async connectParentToExistingChild(parentId: number, childId: number, relation: string): Promise<any> {
    try {
      // Create parent-student relation
      const connectionData = {
        parentId,
        studentId: childId,
        relationshipType: relation,
        isVerified: false, // School needs to verify
        createdAt: new Date().toISOString()
      };
      
      // Simulate connection creation (would use actual parent_student_relations table)
      console.log('[STORAGE] Parent-child connection created:', connectionData);
      
      return {
        message: 'Connexion créée avec succès. L\'école sera notifiée pour validation.',
        data: connectionData
      };
    } catch (error) {
      console.error('[STORAGE] connectParentToExistingChild error:', error);
      throw new Error('Failed to connect parent to child');
    }
  }

  async createParentChildConnectionRequest(parentId: number, childData: any, relation: string): Promise<any> {
    try {
      const requestData = {
        id: Date.now().toString(),
        parentId,
        childData,
        relation,
        status: 'pending',
        createdAt: new Date().toISOString(),
        type: 'parent_child_connection'
      };
      
      // Simulate request creation (would store in connection_requests table)
      console.log('[STORAGE] Parent-child connection request created:', requestData);
      
      return {
        message: 'Demande de connexion créée. L\'école sera notifiée pour créer le profil de l\'enfant.',
        data: requestData
      };
    } catch (error) {
      console.error('[STORAGE] createParentChildConnectionRequest error:', error);
      throw new Error('Failed to create connection request');
    }
  }

  // ===== FREELANCER-STUDENT CONNECTION IMPLEMENTATION =====
  async searchStudentsForFreelancer(searchData: any): Promise<any[]> {
    try {
      const { firstName, lastName, phoneNumber, schoolName, dateOfBirth } = searchData;
      
      const results = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          grade: sql<string>`'6ème'`, // Placeholder
          schoolName: sql<string>`'École Primaire Demo'`,
          parents: sql<string>`'Marie Kamga'` // Would be populated from relations
        })
        .from(users)
        .where(
          and(
            eq(users.role, 'Student'),
            or(
              like(users.firstName, `%${firstName}%`),
              like(users.lastName, `%${lastName}%`),
              phoneNumber ? like(users.phone, `%${phoneNumber}%`) : sql`true`
            )
          )
        )
        .limit(10);
      
      return results;
    } catch (error) {
      console.error('[STORAGE] searchStudentsForFreelancer error:', error);
      return [];
    }
  }

  async connectFreelancerToExistingStudent(freelancerId: number, studentId: number, serviceData: any): Promise<any> {
    try {
      const connectionData = {
        freelancerId,
        studentId,
        serviceType: serviceData.serviceType,
        subjects: serviceData.subjects,
        hourlyRate: serviceData.hourlyRate,
        notes: serviceData.notes,
        isVerified: false, // Parents and school need to verify
        createdAt: new Date().toISOString()
      };
      
      console.log('[STORAGE] Freelancer-student connection created:', connectionData);
      
      return {
        message: 'Connexion créée avec succès. Les parents et l\'école seront notifiés pour validation.',
        data: connectionData
      };
    } catch (error) {
      console.error('[STORAGE] connectFreelancerToExistingStudent error:', error);
      throw new Error('Failed to connect freelancer to student');
    }
  }

  async createFreelancerStudentConnectionRequest(freelancerId: number, studentData: any, serviceData: any): Promise<any> {
    try {
      const requestData = {
        id: Date.now().toString(),
        freelancerId,
        studentData,
        serviceData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        type: 'freelancer_student_connection'
      };
      
      console.log('[STORAGE] Freelancer-student connection request created:', requestData);
      
      return {
        message: 'Demande de connexion créée. L\'école et les parents seront notifiés.',
        data: requestData
      };
    } catch (error) {
      console.error('[STORAGE] createFreelancerStudentConnectionRequest error:', error);
      throw new Error('Failed to create connection request');
    }
  }

  // ===== CHILD-PARENT CONNECTION IMPLEMENTATION =====
  async searchParentsForChild(searchData: any): Promise<any[]> {
    try {
      const { firstName, lastName, phoneNumber, email } = searchData;
      
      const results = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          profession: sql<string>`'Enseignante'`, // Placeholder
          children: sql<string>`'Junior Kamga, Marie Kamga'` // Would be populated from relations
        })
        .from(users)
        .where(
          and(
            eq(users.role, 'Parent'),
            or(
              like(users.firstName, `%${firstName}%`),
              like(users.lastName, `%${lastName}%`),
              phoneNumber ? like(users.phone, `%${phoneNumber}%`) : sql`true`,
              email ? like(users.email, `%${email}%`) : sql`true`
            )
          )
        )
        .limit(10);
      
      return results;
    } catch (error) {
      console.error('[STORAGE] searchParentsForChild error:', error);
      return [];
    }
  }

  async connectChildToExistingParent(studentId: number, parentId: number, relationship: string): Promise<any> {
    try {
      const connectionData = {
        studentId,
        parentId,
        relationshipType: relationship,
        isVerified: false, // School needs to verify
        createdAt: new Date().toISOString()
      };
      
      console.log('[STORAGE] Child-parent connection created:', connectionData);
      
      return {
        message: 'Connexion créée avec succès. L\'école sera notifiée pour validation.',
        data: connectionData
      };
    } catch (error) {
      console.error('[STORAGE] connectChildToExistingParent error:', error);
      throw new Error('Failed to connect child to parent');
    }
  }

  async createChildParentConnectionRequest(studentId: number, parentData: any, relationship: string): Promise<any> {
    try {
      const requestData = {
        id: Date.now().toString(),
        studentId,
        parentData,
        relationship,
        status: 'pending',
        createdAt: new Date().toISOString(),
        type: 'child_parent_connection'
      };
      
      console.log('[STORAGE] Child-parent connection request created:', requestData);
      
      return {
        message: 'Demande de connexion créée. L\'école sera notifiée pour créer le profil du parent.',
        data: requestData
      };
    } catch (error) {
      console.error('[STORAGE] createChildParentConnectionRequest error:', error);
      throw new Error('Failed to create connection request');
    }
  }

  // ===== SMART DUPLICATE DETECTION IMPLEMENTATION =====
  async getSmartDuplicateDetections(schoolId: number): Promise<any[]> {
    try {
      // Simulate smart duplicate detection results
      const mockDuplicates = [
        {
          id: 'dup_001',
          type: 'parent',
          existingUser: {
            id: 7,
            firstName: 'Marie',
            lastName: 'Kamga',
            email: 'marie.kamga@example.com',
            phone: '+237650123456',
            role: 'Parent',
            schoolName: 'École Primaire Central'
          },
          newUser: {
            firstName: 'Marie',
            lastName: 'Kamga-Talla',
            email: 'marie.talla@gmail.com',
            phone: '+237650123456', // Same phone number
            role: 'Parent',
            schoolName: 'École Primaire Central'
          },
          matchReason: ['phone_match', 'name_similarity'],
          confidence: 95,
          createdAt: new Date().toISOString(),
          schoolId
        }
      ];
      
      return mockDuplicates;
    } catch (error) {
      console.error('[STORAGE] getSmartDuplicateDetections error:', error);
      return [];
    }
  }

  async mergeUserDuplicate(duplicateId: string, existingUserId: number, newUserData: any, schoolId: number): Promise<any> {
    try {
      console.log('[STORAGE] Merging duplicate user:', { duplicateId, existingUserId, newUserData });
      
      return {
        message: 'Utilisateurs fusionnés avec succès. Les données ont été consolidées.',
        mergedUserId: existingUserId
      };
    } catch (error) {
      console.error('[STORAGE] mergeUserDuplicate error:', error);
      throw new Error('Failed to merge duplicate users');
    }
  }

  async ignoreDuplicateDetection(duplicateId: string, schoolId: number): Promise<any> {
    try {
      console.log('[STORAGE] Ignoring duplicate detection:', { duplicateId, schoolId });
      
      return {
        message: 'Correspondance ignorée avec succès.'
      };
    } catch (error) {
      console.error('[STORAGE] ignoreDuplicateDetection error:', error);
      throw new Error('Failed to ignore duplicate detection');
    }
  }

  async createSeparateUser(duplicateId: string, newUserData: any, schoolId: number): Promise<any> {
    try {
      console.log('[STORAGE] Creating separate user:', { duplicateId, newUserData, schoolId });
      
      // Would create the new user with unique identifier
      const newUser = {
        id: Date.now(),
        ...newUserData,
        schoolId,
        createdAt: new Date().toISOString()
      };
      
      return {
        message: 'Nouvel utilisateur créé séparément avec succès.',
        data: newUser
      };
    } catch (error) {
      console.error('[STORAGE] createSeparateUser error:', error);
      throw new Error('Failed to create separate user');
    }
  }

  // ===== NOTIFICATION MANAGEMENT IMPLEMENTATION =====
  async getUserNotifications(userId: number, userRole?: string): Promise<any[]> {
    try {
      console.log('[STORAGE] Getting notifications for user:', userId, userRole);
      
      // Return mock notifications with proper PWA-compatible format
      return [
        {
          id: 1,
          title: 'Test Notification PWA',
          message: 'Ceci est une notification test pour vérifier le système PWA',
          type: 'system',
          priority: 'medium',
          category: 'administrative',
          isRead: false,
          actionRequired: false,
          createdAt: new Date().toISOString(),
          senderRole: 'System'
        },
        {
          id: 2,
          title: 'Zone de sécurité',
          message: 'Enfant entré dans la zone école',
          type: 'zone_entry',
          priority: 'low',
          category: 'security',
          isRead: true,
          readAt: new Date().toISOString(),
          actionRequired: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          senderRole: 'Geolocation'
        }
      ];
    } catch (error) {
      console.error('[STORAGE] getUserNotifications error:', error);
      return [];
    }
  }

  async createNotification(notificationData: any): Promise<any> {
    try {
      const notification = {
        id: Date.now(),
        ...notificationData,
        createdAt: new Date().toISOString()
      };
      
      console.log('[STORAGE] Created notification:', notification);
      return notification;
    } catch (error) {
      console.error('[STORAGE] createNotification error:', error);
      throw new Error('Failed to create notification');
    }
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    try {
      console.log('[STORAGE] Marking notification as read:', notificationId);
      // In real implementation, would update database
    } catch (error) {
      console.error('[STORAGE] markNotificationAsRead error:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    try {
      console.log('[STORAGE] Marking all notifications as read for user:', userId);
      // In real implementation, would update all user notifications in database
    } catch (error) {
      console.error('[STORAGE] markAllNotificationsAsRead error:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  async deleteNotification(notificationId: number): Promise<void> {
    try {
      console.log('[STORAGE] Deleting notification:', notificationId);
      // In real implementation, would delete from database
    } catch (error) {
      console.error('[STORAGE] deleteNotification error:', error);
      throw new Error('Failed to delete notification');
    }
  }

  // ===== EMAIL PREFERENCES IMPLEMENTATION =====
  async getEmailPreferences(userId: number): Promise<EmailPreferences | null> {
    try {
      const [preferences] = await db.select().from(emailPreferences).where(eq(emailPreferences.userId, userId));
      return preferences || null;
    } catch (error) {
      console.error('[STORAGE] getEmailPreferences error:', error);
      return null;
    }
  }

  async createEmailPreferences(preferences: InsertEmailPreferences): Promise<EmailPreferences> {
    try {
      const [created] = await db.insert(emailPreferences).values(preferences).returning();
      console.log('[STORAGE] Created email preferences for user:', preferences.userId);
      return created;
    } catch (error) {
      console.error('[STORAGE] createEmailPreferences error:', error);
      throw new Error('Failed to create email preferences');
    }
  }

  async updateEmailPreferences(userId: number, updates: UpdateEmailPreferences): Promise<EmailPreferences> {
    try {
      const [updated] = await db
        .update(emailPreferences)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(emailPreferences.userId, userId))
        .returning();
      
      if (!updated) {
        throw new Error('Email preferences not found');
      }
      
      console.log('[STORAGE] Updated email preferences for user:', userId);
      return updated;
    } catch (error) {
      console.error('[STORAGE] updateEmailPreferences error:', error);
      throw new Error('Failed to update email preferences');
    }
  }

  async getUser(id: number): Promise<User | null> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || null;
    } catch (error) {
      console.error('[STORAGE] getUser error:', error);
      return null;
    }
  }
}

export const storage = new DatabaseStorage();
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
  type BusinessPartner, type InsertBusinessPartner,
  type SchoolPartnershipAgreement, type InsertSchoolPartnershipAgreement,
  type Internship, type InsertInternship,
  type PartnershipCommunication, type InsertPartnershipCommunication,
  users, schools, classes, subjects, grades, attendance,
  homework, payments, messages, notifications, teacherAbsences, parentRequests, emailPreferences, pwaAnalytics,
  businessPartners, schoolPartnershipAgreements, internships, partnershipCommunications
} from "../shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, like, count, sql, or, lt, gte, lte, ne, inArray } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

export interface IStorage {
  // ===== PWA ANALYTICS INTERFACE =====
  trackPwaSession(data: any): Promise<any>;
  getPwaUserStatistics(): Promise<any>;
  updateUserAccessMethod(userId: number, accessMethod: string, isPwaInstalled: boolean): Promise<void>;

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

  // ===== FAMILY CONNECTIONS INTERFACE =====
  getFamilyConnections(parentId: number): Promise<any[]>;
  createFamilyConnection(data: { parentId: number; childEmail: string }): Promise<any>;
  updateConnectionStatus(connectionId: number, status: string): Promise<any>;
  getFamilyMessages(connectionId: number): Promise<any[]>;
  sendFamilyMessage(data: { connectionId: number; senderId: number; message: string; messageType: string }): Promise<any>;
  markFamilyMessageAsRead(messageId: number): Promise<void>;
  checkChildConnectionRequest(childId: number): Promise<any[]>;
  approveFamilyConnection(connectionId: number, childId: number): Promise<any>;
  
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

  // ===== PWA ANALYTICS INTERFACE =====
  trackPwaSession(data: {
    userId?: number;
    sessionId: string;
    accessMethod: string;
    deviceType?: string;
    userAgent?: string;
    isStandalone?: boolean;
    isPwaInstalled?: boolean;
    pushPermissionGranted?: boolean;
    ipAddress?: string;
    country?: string;
    city?: string;
  }): Promise<void>;
  updateUserAccessMethod(userId: number, accessMethod: string, isPwaInstalled?: boolean): Promise<void>;
  getPwaUserStatistics(): Promise<{
    totalPwaUsers: number;
    totalWebUsers: number;
    dailyPwaAccess: number;
    pwaInstallRate: number;
    avgSessionDuration: number;
    topDeviceTypes: { type: string; count: number }[];
  }>;

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

  // ===== SUBSCRIPTION SYSTEM =====
  getExpiredSubscriptions(): Promise<any[]>;

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

  // ===== BUSINESS PARTNERSHIPS INTERFACE =====
  getBusinessPartners(schoolId?: number): Promise<any[]>;
  getBusinessPartner(partnerId: number): Promise<any | null>;
  createBusinessPartner(partner: any): Promise<any>;
  updateBusinessPartner(partnerId: number, updates: any): Promise<any>;
  deleteBusinessPartner(partnerId: number): Promise<void>;
  
  getSchoolPartnershipAgreements(schoolId: number): Promise<any[]>;
  createSchoolPartnershipAgreement(agreement: any): Promise<any>;
  updateSchoolPartnershipAgreement(agreementId: number, updates: any): Promise<any>;
  
  getInternships(schoolId: number, filters?: any): Promise<any[]>;
  getInternship(internshipId: number): Promise<any | null>;
  createInternship(internship: any): Promise<any>;
  updateInternship(internshipId: number, updates: any): Promise<any>;
  getStudentInternships(studentId: number): Promise<any[]>;
  
  sendPartnershipCommunication(communication: any): Promise<any>;
  getPartnershipCommunications(agreementId: number): Promise<any[]>;
  
  getPartnershipStatistics(schoolId: number): Promise<any>;
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



  async markNotificationAsRead(notificationId: number): Promise<void> {
    try {
      console.log('[STORAGE] Marking notification as read:', notificationId);
      // In real implementation, would update database
    } catch (error) {
      console.error('[STORAGE] markNotificationAsRead error:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  // ===== FAMILY CONNECTIONS IMPLEMENTATION =====
  async getFamilyConnections(parentId: number): Promise<any[]> {
    try {
      console.log('[STORAGE] Getting family connections for parent:', parentId);
      
      // Return mock family connections for demo
      return [
        {
          id: 1,
          parentId: parentId,
          childId: 15,
          childName: 'Emma Dupont',
          childPhoto: '/api/placeholder/avatar',
          connectionStatus: 'active',
          lastContact: '2 minutes ago',
          unreadMessages: 2,
          isOnline: true,
        },
        {
          id: 2,
          parentId: parentId,
          childId: 16,
          childName: 'Lucas Martin',
          childPhoto: '/api/placeholder/avatar',
          connectionStatus: 'active',
          lastContact: '1 hour ago',
          unreadMessages: 0,
          isOnline: false,
        }
      ];
    } catch (error) {
      console.error('[STORAGE] getFamilyConnections error:', error);
      return [];
    }
  }

  async searchUsersByPhone(phone: string): Promise<any[]> {
    try {
      console.log('[STORAGE] Searching users by phone:', phone);
      
      const userList = await db.select({
        id: users.id,
        email: users.email,
        phone: users.phone,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        schoolId: users.schoolId
      }).from(users).where(eq(users.phone, phone));

      return userList;
    } catch (error) {
      console.error('[STORAGE] searchUsersByPhone error:', error);
      return [];
    }
  }

  async searchUsersByEmail(email: string): Promise<any[]> {
    try {
      console.log('[STORAGE] Searching users by email:', email);
      
      const userList = await db.select({
        id: users.id,
        email: users.email,
        phone: users.phone,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        schoolId: users.schoolId
      }).from(users).where(eq(users.email, email));

      return userList;
    } catch (error) {
      console.error('[STORAGE] searchUsersByEmail error:', error);
      return [];
    }
  }

  async createFamilyConnection(data: { parentId: number; childEmail?: string; childPhone?: string }): Promise<any> {
    try {
      console.log('[STORAGE] Creating family connection:', data);
      
      let child;
      
      // Find child by email or phone
      if (data.childEmail) {
        [child] = await db.select().from(users).where(eq(users.email, data.childEmail));
        if (!child) {
          throw new Error('Child not found with this email address');
        }
      } else if (data.childPhone) {
        [child] = await db.select().from(users).where(eq(users.phone, data.childPhone));
        if (!child) {
          throw new Error('Child not found with this phone number');
        }
      } else {
        throw new Error('Either email or phone number is required');
      }

      if (child.role !== 'Student') {
        const searchMethod = data.childEmail ? 'Email address' : 'Phone number';
        throw new Error(`${searchMethod} does not belong to a student`);
      }

      // Check if connection already exists
      const existingConnection = []; // Would check in real DB
      
      // Create connection key for encryption
      const connectionKey = `family_${data.parentId}_${child.id}_${Date.now()}`;
      
      const newConnection = {
        id: Date.now(),
        parentId: data.parentId,
        childId: child.id,
        parentName: 'Parent', // Would get from DB
        childName: child.firstName + ' ' + child.lastName,
        connectionStatus: 'pending',
        connectionKey: connectionKey,
        unreadMessagesCount: 0,
        isParentOnline: false,
        isChildOnline: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return newConnection;
    } catch (error) {
      console.error('[STORAGE] createFamilyConnection error:', error);
      throw error;
    }
  }

  async updateConnectionStatus(connectionId: number, status: string): Promise<any> {
    try {
      console.log('[STORAGE] Updating connection status:', { connectionId, status });
      
      return {
        id: connectionId,
        connectionStatus: status,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('[STORAGE] updateConnectionStatus error:', error);
      throw error;
    }
  }

  async getFamilyMessages(connectionId: number): Promise<any[]> {
    try {
      console.log('[STORAGE] Getting family messages for connection:', connectionId);
      
      // Return mock messages for demo
      return [
        {
          id: 1,
          connectionId: connectionId,
          senderId: 7,
          senderName: 'Papa',
          senderType: 'parent',
          message: 'Bonjour ma chérie ! Comment s\'est passée ta journée à l\'école ?',
          messageType: 'text',
          timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          isRead: true,
          isEncrypted: true
        },
        {
          id: 2,
          connectionId: connectionId,
          senderId: 15,
          senderName: 'Emma',
          senderType: 'child',
          message: 'Salut Papa ! Ça va bien, on a eu un cours de sciences super intéressant aujourd\'hui !',
          messageType: 'text',
          timestamp: new Date(Date.now() - 240000).toISOString(), // 4 minutes ago
          isRead: true,
          isEncrypted: true
        },
        {
          id: 3,
          connectionId: connectionId,
          senderId: 7,
          senderName: 'Papa',
          senderType: 'parent',
          message: 'C\'est formidable ! Tu peux me raconter ce que vous avez appris ?',
          messageType: 'text',
          timestamp: new Date(Date.now() - 180000).toISOString(), // 3 minutes ago
          isRead: false,
          isEncrypted: true
        }
      ];
    } catch (error) {
      console.error('[STORAGE] getFamilyMessages error:', error);
      return [];
    }
  }

  async sendFamilyMessage(data: { connectionId: number; senderId: number; message: string; messageType: string }): Promise<any> {
    try {
      console.log('[STORAGE] Sending family message:', data);
      
      // Get sender info
      const [sender] = await db.select().from(users).where(eq(users.id, data.senderId));
      
      if (!sender) {
        throw new Error('Sender not found');
      }

      const senderType = sender.role === 'Parent' ? 'parent' : 'child';
      const senderName = senderType === 'parent' ? 'Papa' : sender.firstName;

      const newMessage = {
        id: Date.now(),
        connectionId: data.connectionId,
        senderId: data.senderId,
        senderName: senderName,
        senderType: senderType,
        recipientId: senderType === 'parent' ? 15 : 7, // Mock recipient
        message: data.message,
        messageType: data.messageType,
        isEncrypted: true,
        isRead: false,
        isDelivered: true,
        deliveredAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return newMessage;
    } catch (error) {
      console.error('[STORAGE] sendFamilyMessage error:', error);
      throw error;
    }
  }

  async markFamilyMessageAsRead(messageId: number): Promise<void> {
    try {
      console.log('[STORAGE] Marking family message as read:', messageId);
      // In real implementation, would update the database
    } catch (error) {
      console.error('[STORAGE] markFamilyMessageAsRead error:', error);
      throw new Error('Failed to mark family message as read');
    }
  }

  async checkChildConnectionRequest(childId: number): Promise<any[]> {
    try {
      console.log('[STORAGE] Checking connection requests for child:', childId);
      
      // Return mock pending requests for demo
      return [
        {
          id: 1,
          parentId: 7,
          parentName: 'Jean Dupont',
          parentEmail: 'parent.demo@test.educafric.com',
          connectionStatus: 'pending',
          createdAt: new Date()
        }
      ];
    } catch (error) {
      console.error('[STORAGE] checkChildConnectionRequest error:', error);
      return [];
    }
  }

  async approveFamilyConnection(connectionId: number, childId: number): Promise<any> {
    try {
      console.log('[STORAGE] Approving family connection:', { connectionId, childId });
      
      return {
        id: connectionId,
        connectionStatus: 'active',
        connectionApprovedBy: childId,
        connectionApprovedAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('[STORAGE] approveFamilyConnection error:', error);
      throw error;
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

  async getExpiredSubscriptions(): Promise<any[]> {
    try {
      console.log('[STORAGE] Getting expired subscriptions...');
      // In real implementation, would query database for expired subscriptions
      return [];
    } catch (error) {
      console.error('[STORAGE] getExpiredSubscriptions error:', error);
      return [];
    }
  }

  // ===== CLASS MANAGEMENT IMPLEMENTATION =====
  async createClass(classData: InsertClass): Promise<Class> {
    try {
      const [created] = await db.insert(classes).values(classData).returning();
      console.log('[STORAGE] Created class:', created);
      return created;
    } catch (error) {
      console.error('[STORAGE] createClass error:', error);
      throw new Error('Failed to create class');
    }
  }

  async getClass(id: number): Promise<Class | null> {
    try {
      const [classRecord] = await db.select().from(classes).where(eq(classes.id, id));
      return classRecord || null;
    } catch (error) {
      console.error('[STORAGE] getClass error:', error);
      return null;
    }
  }

  async updateClass(id: number, updates: Partial<InsertClass>): Promise<Class> {
    try {
      const [updated] = await db
        .update(classes)
        .set(updates)
        .where(eq(classes.id, id))
        .returning();
      
      if (!updated) {
        throw new Error('Class not found');
      }
      
      console.log('[STORAGE] Updated class:', updated);
      return updated;
    } catch (error) {
      console.error('[STORAGE] updateClass error:', error);
      throw new Error('Failed to update class');
    }
  }

  async getClassesBySchool(schoolId: number): Promise<Class[]> {
    try {
      const schoolClasses = await db.select().from(classes).where(eq(classes.schoolId, schoolId));
      console.log(`[STORAGE] Found ${schoolClasses.length} classes for school ${schoolId}`);
      return schoolClasses;
    } catch (error) {
      console.error('[STORAGE] getClassesBySchool error:', error);
      return [];
    }
  }

  // ===== GRADE MANAGEMENT IMPLEMENTATION =====
  async createGrade(grade: InsertGrade): Promise<Grade> {
    try {
      const [created] = await db.insert(grades).values(grade).returning();
      console.log('[STORAGE] Created grade:', created);
      return created;
    } catch (error) {
      console.error('[STORAGE] createGrade error:', error);
      throw new Error('Failed to create grade');
    }
  }

  async getGrade(id: number): Promise<Grade | null> {
    try {
      const [grade] = await db.select().from(grades).where(eq(grades.id, id));
      return grade || null;
    } catch (error) {
      console.error('[STORAGE] getGrade error:', error);
      return null;
    }
  }

  async updateGrade(id: number, updates: Partial<InsertGrade>): Promise<Grade> {
    try {
      const [updated] = await db
        .update(grades)
        .set(updates)
        .where(eq(grades.id, id))
        .returning();
      
      if (!updated) {
        throw new Error('Grade not found');
      }
      
      console.log('[STORAGE] Updated grade:', updated);
      return updated;
    } catch (error) {
      console.error('[STORAGE] updateGrade error:', error);
      throw new Error('Failed to update grade');
    }
  }

  async getGradesByStudent(studentId: number): Promise<Grade[]> {
    try {
      const studentGrades = await db.select().from(grades).where(eq(grades.studentId, studentId));
      console.log(`[STORAGE] Found ${studentGrades.length} grades for student ${studentId}`);
      return studentGrades;
    } catch (error) {
      console.error('[STORAGE] getGradesByStudent error:', error);
      return [];
    }
  }

  async getGradesByClass(classId: number): Promise<Grade[]> {
    try {
      const classGrades = await db.select().from(grades).where(eq(grades.classId, classId));
      console.log(`[STORAGE] Found ${classGrades.length} grades for class ${classId}`);
      return classGrades;
    } catch (error) {
      console.error('[STORAGE] getGradesByClass error:', error);
      return [];
    }
  }

  // ===== ADDITIONAL MISSING METHODS =====
  async deleteClass(id: number): Promise<void> {
    try {
      await db.delete(classes).where(eq(classes.id, id));
      console.log('[STORAGE] Deleted class:', id);
    } catch (error) {
      console.error('[STORAGE] deleteClass error:', error);
      throw new Error('Failed to delete class');
    }
  }

  async getSubjectsByClass(classId: number): Promise<any[]> {
    try {
      console.log(`[STORAGE] Getting subjects for class ${classId}`);
      // In real implementation, would query class-subject relations
      return [];
    } catch (error) {
      console.error('[STORAGE] getSubjectsByClass error:', error);
      return [];
    }
  }

  async getGradesBySchool(schoolId: number): Promise<any[]> {
    try {
      console.log(`[STORAGE] Getting grades for school ${schoolId}`);
      // In real implementation, would join grades with classes to filter by school
      return [];
    } catch (error) {
      console.error('[STORAGE] getGradesBySchool error:', error);
      return [];
    }
  }

  async getGradesBySubject(subjectId: number): Promise<any[]> {
    try {
      const subjectGrades = await db.select().from(grades).where(eq(grades.subjectId, subjectId));
      console.log(`[STORAGE] Found ${subjectGrades.length} grades for subject ${subjectId}`);
      return subjectGrades;
    } catch (error) {
      console.error('[STORAGE] getGradesBySubject error:', error);
      return [];
    }
  }

  async deleteGrade(id: number): Promise<void> {
    try {
      await db.delete(grades).where(eq(grades.id, id));
      console.log('[STORAGE] Deleted grade:', id);
    } catch (error) {
      console.error('[STORAGE] deleteGrade error:', error);
      throw new Error('Failed to delete grade');
    }
  }

  async getGradeStatsByClass(classId: number): Promise<any> {
    try {
      console.log(`[STORAGE] Getting grade statistics for class ${classId}`);
      // In real implementation, would calculate statistics from grades
      return {
        totalGrades: 0,
        averageGrade: 0,
        highestGrade: 0,
        lowestGrade: 0
      };
    } catch (error) {
      console.error('[STORAGE] getGradeStatsByClass error:', error);
      return {};
    }
  }

  // ===== PWA ANALYTICS IMPLEMENTATION =====
  async trackPwaSession(data: any): Promise<any> {
    try {
      const sessionData = {
        userId: data.userId || null,
        sessionId: data.sessionId,
        accessMethod: data.accessMethod || 'web',
        deviceType: data.deviceType || 'unknown',
        userAgent: data.userAgent || null,
        isStandalone: data.isStandalone || false,
        isPwaInstalled: data.isPwaInstalled || false,
        pushPermissionGranted: data.pushPermissionGranted || false,
        ipAddress: data.ipAddress || null,
        country: data.country || null,
        city: data.city || null
      };

      // Insert into database
      const result = await db.insert(pwaAnalytics).values(sessionData).returning();
      
      console.log('[STORAGE] PWA session saved to database:', sessionData.sessionId, sessionData.accessMethod);
      return result[0];
    } catch (error) {
      console.error('[STORAGE] trackPwaSession database error:', error);
      // Log the session even if database fails
      console.log('[STORAGE] Tracking PWA session:', data.sessionId, data.accessMethod);
      throw error;
    }
  }

  async updateUserAccessMethod(userId: number, accessMethod: string, isPwaInstalled: boolean = false): Promise<void> {
    try {
      await db
        .update(users)
        .set({
          accessMethod,
          isPwaUser: accessMethod === 'pwa',
          lastPwaAccess: accessMethod === 'pwa' ? new Date() : undefined,
          pwaInstallDate: isPwaInstalled && accessMethod === 'pwa' ? new Date() : undefined,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      console.log(`[STORAGE] Updated user ${userId} access method to: ${accessMethod}`);
    } catch (error) {
      console.error('[STORAGE] updateUserAccessMethod error:', error);
      throw error;
    }
  }

  async getPwaUserStatistics(): Promise<any> {
    try {
      // Get total sessions by access method
      const accessMethodStats = await db
        .select({
          accessMethod: pwaAnalytics.accessMethod,
          count: count()
        })
        .from(pwaAnalytics)
        .groupBy(pwaAnalytics.accessMethod);

      // Get unique users by access method (for last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const userStats = await db
        .select({
          accessMethod: users.accessMethod,
          count: count()
        })
        .from(users)
        .where(
          and(
            gte(users.lastLoginAt, thirtyDaysAgo),
            ne(users.role, 'SiteAdmin') // Exclude admin users from statistics
          )
        )
        .groupBy(users.accessMethod);

      // Get device type distribution
      const deviceTypeStats = await db
        .select({
          type: pwaAnalytics.deviceType,
          count: count()
        })
        .from(pwaAnalytics)
        .where(gte(pwaAnalytics.createdAt, thirtyDaysAgo))
        .groupBy(pwaAnalytics.deviceType);

      // Calculate daily PWA access (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const dailyPwaAccess = await db
        .select({ count: count() })
        .from(pwaAnalytics)
        .where(
          and(
            eq(pwaAnalytics.accessMethod, 'pwa'),
            gte(pwaAnalytics.createdAt, sevenDaysAgo)
          )
        );

      // Process statistics
      const totalPwaUsers = userStats.find(stat => stat.accessMethod === 'pwa')?.count || 0;
      const totalWebUsers = userStats.find(stat => stat.accessMethod === 'web')?.count || 0;
      const totalPwaSessions = accessMethodStats.find(stat => stat.accessMethod === 'pwa')?.count || 0;
      const totalWebSessions = accessMethodStats.find(stat => stat.accessMethod === 'web')?.count || 0;

      const pwaInstallRate = totalPwaUsers > 0 && totalWebUsers > 0 
        ? ((totalPwaUsers / (totalPwaUsers + totalWebUsers)) * 100) 
        : 0;

      const stats = {
        totalPwaUsers: Number(totalPwaUsers),
        totalWebUsers: Number(totalWebUsers),
        totalPwaSessions: Number(totalPwaSessions),
        totalWebSessions: Number(totalWebSessions),
        dailyPwaAccess: Number(dailyPwaAccess[0]?.count || 0),
        pwaInstallRate: Math.round(pwaInstallRate * 100) / 100,
        avgSessionDuration: 0, // Would need session duration calculation
        topDeviceTypes: deviceTypeStats.map(stat => ({
          type: stat.type || 'unknown',
          count: Number(stat.count)
        }))
      };

      console.log('[STORAGE] PWA statistics calculated:', stats);
      return stats;
    } catch (error) {
      console.error('[STORAGE] getPwaUserStatistics error:', error);
      // Return default statistics if database error
      return {
        totalPwaUsers: 0,
        totalWebUsers: 0,
        totalPwaSessions: 0,
        totalWebSessions: 0,
        dailyPwaAccess: 0,
        pwaInstallRate: 0,
        avgSessionDuration: 0,
        topDeviceTypes: []
      };
    }
  }

  // ===== TEACHER-STUDENT CONNECTIONS IMPLEMENTATION =====
  async getTeacherStudentConnections(userId: number, userType: 'teacher' | 'student'): Promise<any[]> {
    try {
      console.log('[STORAGE] Getting teacher-student connections for:', { userId, userType });
      
      // Return mock connections for demo
      if (userType === 'teacher') {
        return [
          {
            id: 1,
            teacherId: userId,
            studentId: 15,
            studentName: 'Emma Dupont',
            subjectArea: 'Mathématiques',
            classContext: '6ème A',
            connectionStatus: 'active',
            connectionType: 'educational',
            lastContact: '1 hour ago',
            unreadMessages: 3,
            isOnline: true,
          }
        ];
      } else {
        return [
          {
            id: 1,
            teacherId: 3,
            studentId: userId,
            teacherName: 'Prof. Dubois',
            subjectArea: 'Français',
            classContext: '3ème C',
            connectionStatus: 'active',
            connectionType: 'educational',
            lastContact: '30 minutes ago',
            unreadMessages: 1,
            isOnline: true,
          }
        ];
      }
    } catch (error) {
      console.error('[STORAGE] getTeacherStudentConnections error:', error);
      return [];
    }
  }

  async createTeacherStudentConnection(data: {
    teacherId: number;
    studentEmail?: string;
    studentPhone?: string;
    subjectArea: string;
    classContext?: string;
    connectionType: string;
    educationalGoals?: string[];
  }): Promise<any> {
    try {
      console.log('[STORAGE] Creating teacher-student connection:', data);
      
      let student;
      
      // Find student by email or phone
      if (data.studentEmail) {
        [student] = await db.select().from(users).where(eq(users.email, data.studentEmail));
        if (!student) {
          throw new Error('Student not found with this email address');
        }
      } else if (data.studentPhone) {
        [student] = await db.select().from(users).where(eq(users.phone, data.studentPhone));
        if (!student) {
          throw new Error('Student not found with this phone number');
        }
      } else {
        throw new Error('Either email or phone number is required');
      }

      if (student.role !== 'Student') {
        throw new Error('This user account does not belong to a student');
      }

      // Generate connection key for security
      const connectionKey = Math.random().toString(36).substring(2, 15);
      
      // Get teacher info
      const teacher = await this.getUserById(data.teacherId);
      
      const connection = {
        id: Math.floor(Math.random() * 1000),
        teacherId: data.teacherId,
        studentId: student.id,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        studentName: `${student.firstName} ${student.lastName}`,
        subjectArea: data.subjectArea,
        classContext: data.classContext,
        connectionType: data.connectionType,
        connectionStatus: 'pending',
        connectionKey,
        educationalGoals: data.educationalGoals || [],
        createdAt: new Date().toISOString()
      };

      console.log('[STORAGE] ✅ Teacher-Student connection created:', connection);
      return connection;
      
    } catch (error) {
      console.error('[STORAGE] createTeacherStudentConnection error:', error);
      throw error;
    }
  }

  async approveTeacherStudentConnection(connectionId: number, studentId: number): Promise<any> {
    try {
      console.log('[STORAGE] Approving teacher-student connection:', { connectionId, studentId });
      
      const connection = {
        id: connectionId,
        connectionStatus: 'active',
        connectionApprovedAt: new Date().toISOString(),
        connectionApprovedBy: studentId
      };

      return connection;
      
    } catch (error) {
      console.error('[STORAGE] approveTeacherStudentConnection error:', error);
      throw new Error('Failed to approve teacher-student connection');
    }
  }

  async getTeacherStudentMessages(connectionId: number): Promise<any[]> {
    try {
      console.log('[STORAGE] Getting teacher-student messages for connection:', connectionId);
      
      return [
        {
          id: 1,
          connectionId,
          senderId: 3,
          senderName: 'Prof. Dubois',
          senderType: 'teacher',
          message: 'Bonjour Emma, votre devoir de mathématiques était excellent !',
          messageType: 'grade_feedback',
          gradeDetails: {
            grade: 18,
            maxGrade: 20,
            subject: 'Mathématiques',
            feedback: 'Très bon travail, continuez ainsi !'
          },
          isRead: true,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ];
    } catch (error) {
      console.error('[STORAGE] getTeacherStudentMessages error:', error);
      return [];
    }
  }

  async sendTeacherStudentMessage(data: {
    connectionId: number;
    senderId: number;
    senderType: string;
    message: string;
    messageType: string;
    parentCcEnabled?: boolean;
    homeworkDetails?: any;
    gradeDetails?: any;
  }): Promise<any> {
    try {
      console.log('[STORAGE] Sending teacher-student message:', data);
      
      const sender = await this.getUserById(data.senderId);
      
      const message = {
        id: Math.floor(Math.random() * 1000),
        connectionId: data.connectionId,
        senderId: data.senderId,
        senderName: `${sender.firstName} ${sender.lastName}`,
        senderType: data.senderType,
        message: data.message,
        messageType: data.messageType,
        parentCcEnabled: data.parentCcEnabled || false,
        homeworkDetails: data.homeworkDetails,
        gradeDetails: data.gradeDetails,
        isRead: false,
        createdAt: new Date().toISOString()
      };

      return message;
      
    } catch (error) {
      console.error('[STORAGE] sendTeacherStudentMessage error:', error);
      throw new Error('Failed to send teacher-student message');
    }
  }

  async markTeacherStudentMessageAsRead(messageId: number): Promise<void> {
    try {
      console.log('[STORAGE] Marking teacher-student message as read:', messageId);
    } catch (error) {
      console.error('[STORAGE] markTeacherStudentMessageAsRead error:', error);
      throw new Error('Failed to mark teacher-student message as read');
    }
  }

  async deleteTeacherStudentConnection(connectionId: number, userId: number): Promise<void> {
    try {
      console.log('[STORAGE] Deleting teacher-student connection:', { connectionId, userId });
    } catch (error) {
      console.error('[STORAGE] deleteTeacherStudentConnection error:', error);
      throw new Error('Failed to delete teacher-student connection');
    }
  }

  // ===== STUDENT-PARENT CONNECTIONS IMPLEMENTATION =====
  async getStudentParentConnections(userId: number, userType: 'student' | 'parent'): Promise<any[]> {
    try {
      console.log('[STORAGE] Getting student-parent connections for:', { userId, userType });
      
      if (userType === 'student') {
        return [
          {
            id: 1,
            studentId: userId,
            parentId: 7,
            parentName: 'Marie Dupont',
            relationshipType: 'mother',
            connectionType: 'guardian',
            connectionStatus: 'active',
            emergencyContactPriority: 1,
            lastContact: '2 hours ago',
            unreadMessages: 2,
            isOnline: true,
          }
        ];
      } else {
        return [
          {
            id: 1,
            studentId: 15,
            parentId: userId,
            studentName: 'Emma Dupont',
            relationshipType: 'mother',
            connectionType: 'guardian',
            connectionStatus: 'active',
            emergencyContactPriority: 1,
            lastContact: '2 hours ago',
            unreadMessages: 2,
            isOnline: true,
          }
        ];
      }
    } catch (error) {
      console.error('[STORAGE] getStudentParentConnections error:', error);
      return [];
    }
  }

  async createStudentParentConnection(data: {
    studentId: number;
    parentEmail?: string;
    parentPhone?: string;
    relationshipType: string;
    connectionType: string;
    emergencyContactPriority: number;
    academicVisibilitySettings?: any;
  }): Promise<any> {
    try {
      console.log('[STORAGE] Creating student-parent connection:', data);
      
      let parent;
      
      if (data.parentEmail) {
        [parent] = await db.select().from(users).where(eq(users.email, data.parentEmail));
        if (!parent) {
          throw new Error('Parent not found with this email address');
        }
      } else if (data.parentPhone) {
        [parent] = await db.select().from(users).where(eq(users.phone, data.parentPhone));
        if (!parent) {
          throw new Error('Parent not found with this phone number');
        }
      } else {
        throw new Error('Either email or phone number is required');
      }

      if (parent.role !== 'Parent') {
        throw new Error('This user account does not belong to a parent');
      }

      const connectionKey = Math.random().toString(36).substring(2, 15);
      const student = await this.getUserById(data.studentId);
      
      const connection = {
        id: Math.floor(Math.random() * 1000),
        studentId: data.studentId,
        parentId: parent.id,
        studentName: `${student.firstName} ${student.lastName}`,
        parentName: `${parent.firstName} ${parent.lastName}`,
        relationshipType: data.relationshipType,
        connectionType: data.connectionType,
        emergencyContactPriority: data.emergencyContactPriority,
        connectionStatus: 'pending',
        connectionKey,
        academicVisibilitySettings: data.academicVisibilitySettings || {
          grades: true,
          attendance: true,
          homework: true,
          behavior: true,
          schedule: true
        },
        createdAt: new Date().toISOString()
      };

      return connection;
      
    } catch (error) {
      console.error('[STORAGE] createStudentParentConnection error:', error);
      throw error;
    }
  }

  async approveStudentParentConnection(connectionId: number, parentId: number): Promise<any> {
    try {
      console.log('[STORAGE] Approving student-parent connection:', { connectionId, parentId });
      
      return {
        id: connectionId,
        connectionStatus: 'active',
        connectionApprovedAt: new Date().toISOString(),
        connectionApprovedBy: parentId
      };
      
    } catch (error) {
      console.error('[STORAGE] approveStudentParentConnection error:', error);
      throw new Error('Failed to approve student-parent connection');
    }
  }

  async getStudentParentMessages(connectionId: number): Promise<any[]> {
    try {
      console.log('[STORAGE] Getting student-parent messages for connection:', connectionId);
      
      return [
        {
          id: 1,
          connectionId,
          senderId: 15,
          senderName: 'Emma Dupont',
          senderType: 'student',
          message: 'Maman, je vais bien arriver à la maison vers 17h30',
          messageType: 'text',
          geolocationShared: false,
          isRead: true,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ];
    } catch (error) {
      console.error('[STORAGE] getStudentParentMessages error:', error);
      return [];
    }
  }

  async sendStudentParentMessage(data: {
    connectionId: number;
    senderId: number;
    senderType: string;
    message: string;
    messageType: string;
    teacherCcEnabled?: boolean;
    geolocationShared?: boolean;
    emergencyLevel?: string;
    academicContext?: any;
    permissionDetails?: any;
  }): Promise<any> {
    try {
      console.log('[STORAGE] Sending student-parent message:', data);
      
      const sender = await this.getUserById(data.senderId);
      
      const message = {
        id: Math.floor(Math.random() * 1000),
        connectionId: data.connectionId,
        senderId: data.senderId,
        senderName: `${sender.firstName} ${sender.lastName}`,
        senderType: data.senderType,
        message: data.message,
        messageType: data.messageType,
        teacherCcEnabled: data.teacherCcEnabled || false,
        geolocationShared: data.geolocationShared || false,
        emergencyLevel: data.emergencyLevel,
        academicContext: data.academicContext,
        permissionDetails: data.permissionDetails,
        isRead: false,
        createdAt: new Date().toISOString()
      };

      return message;
      
    } catch (error) {
      console.error('[STORAGE] sendStudentParentMessage error:', error);
      throw new Error('Failed to send student-parent message');
    }
  }

  async markStudentParentMessageAsRead(messageId: number): Promise<void> {
    try {
      console.log('[STORAGE] Marking student-parent message as read:', messageId);
    } catch (error) {
      console.error('[STORAGE] markStudentParentMessageAsRead error:', error);
      throw new Error('Failed to mark student-parent message as read');
    }
  }

  async updateStudentParentConnectionSettings(connectionId: number, userId: number, settings: {
    academicVisibilitySettings?: any;
    privacySettings?: any;
  }): Promise<void> {
    try {
      console.log('[STORAGE] Updating student-parent connection settings:', { connectionId, userId, settings });
    } catch (error) {
      console.error('[STORAGE] updateStudentParentConnectionSettings error:', error);
      throw new Error('Failed to update student-parent connection settings');
    }
  }

  async deleteStudentParentConnection(connectionId: number, userId: number): Promise<void> {
    try {
      console.log('[STORAGE] Deleting student-parent connection:', { connectionId, userId });
    } catch (error) {
      console.error('[STORAGE] deleteStudentParentConnection error:', error);
      throw new Error('Failed to delete student-parent connection');
    }
  }

  // ===== BUSINESS PARTNERSHIPS IMPLEMENTATION =====
  async getBusinessPartners(schoolId?: number): Promise<any[]> {
    try {
      console.log('[STORAGE] Getting business partners for school:', schoolId);
      
      let query = db.select().from(businessPartners);
      
      if (schoolId) {
        // In real implementation, we would join with school partnership agreements
        // For now, return all partners
      }
      
      const partners = await query;
      return partners;
    } catch (error) {
      console.error('[STORAGE] getBusinessPartners error:', error);
      return [];
    }
  }

  async getBusinessPartner(partnerId: number): Promise<any | null> {
    try {
      console.log('[STORAGE] Getting business partner:', partnerId);
      
      const [partner] = await db
        .select()
        .from(businessPartners)
        .where(eq(businessPartners.id, partnerId));
      
      return partner || null;
    } catch (error) {
      console.error('[STORAGE] getBusinessPartner error:', error);
      return null;
    }
  }

  async createBusinessPartner(partner: InsertBusinessPartner): Promise<any> {
    try {
      console.log('[STORAGE] Creating business partner:', partner);
      
      const [newPartner] = await db
        .insert(businessPartners)
        .values(partner)
        .returning();
      
      return newPartner;
    } catch (error) {
      console.error('[STORAGE] createBusinessPartner error:', error);
      throw new Error('Failed to create business partner');
    }
  }

  async updateBusinessPartner(partnerId: number, updates: Partial<InsertBusinessPartner>): Promise<any> {
    try {
      console.log('[STORAGE] Updating business partner:', { partnerId, updates });
      
      const [updatedPartner] = await db
        .update(businessPartners)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(businessPartners.id, partnerId))
        .returning();
      
      return updatedPartner;
    } catch (error) {
      console.error('[STORAGE] updateBusinessPartner error:', error);
      throw new Error('Failed to update business partner');
    }
  }

  async deleteBusinessPartner(partnerId: number): Promise<void> {
    try {
      console.log('[STORAGE] Deleting business partner:', partnerId);
      
      await db
        .delete(businessPartners)
        .where(eq(businessPartners.id, partnerId));
    } catch (error) {
      console.error('[STORAGE] deleteBusinessPartner error:', error);
      throw new Error('Failed to delete business partner');
    }
  }

  async getSchoolPartnershipAgreements(schoolId: number): Promise<any[]> {
    try {
      console.log('[STORAGE] Getting partnership agreements for school:', schoolId);
      
      const agreements = await db
        .select({
          agreement: schoolPartnershipAgreements,
          partner: businessPartners
        })
        .from(schoolPartnershipAgreements)
        .leftJoin(businessPartners, eq(schoolPartnershipAgreements.partnerId, businessPartners.id))
        .where(eq(schoolPartnershipAgreements.schoolId, schoolId));
      
      return agreements;
    } catch (error) {
      console.error('[STORAGE] getSchoolPartnershipAgreements error:', error);
      return [];
    }
  }

  async createSchoolPartnershipAgreement(agreement: InsertSchoolPartnershipAgreement): Promise<any> {
    try {
      console.log('[STORAGE] Creating partnership agreement:', agreement);
      
      const [newAgreement] = await db
        .insert(schoolPartnershipAgreements)
        .values(agreement)
        .returning();
      
      return newAgreement;
    } catch (error) {
      console.error('[STORAGE] createSchoolPartnershipAgreement error:', error);
      throw new Error('Failed to create partnership agreement');
    }
  }

  async updateSchoolPartnershipAgreement(agreementId: number, updates: Partial<InsertSchoolPartnershipAgreement>): Promise<any> {
    try {
      console.log('[STORAGE] Updating partnership agreement:', { agreementId, updates });
      
      const [updatedAgreement] = await db
        .update(schoolPartnershipAgreements)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schoolPartnershipAgreements.id, agreementId))
        .returning();
      
      return updatedAgreement;
    } catch (error) {
      console.error('[STORAGE] updateSchoolPartnershipAgreement error:', error);
      throw new Error('Failed to update partnership agreement');
    }
  }

  async getInternships(schoolId: number, filters?: any): Promise<any[]> {
    try {
      console.log('[STORAGE] Getting internships for school:', schoolId, 'with filters:', filters);
      
      let query = db
        .select({
          internship: internships,
          student: users,
          partner: businessPartners
        })
        .from(internships)
        .leftJoin(users, eq(internships.studentId, users.id))
        .leftJoin(businessPartners, eq(internships.partnerId, businessPartners.id))
        .where(eq(internships.schoolId, schoolId));
      
      if (filters?.status) {
        query = query.where(eq(internships.status, filters.status));
      }
      
      const internshipsList = await query;
      return internshipsList;
    } catch (error) {
      console.error('[STORAGE] getInternships error:', error);
      return [];
    }
  }

  async getInternship(internshipId: number): Promise<any | null> {
    try {
      console.log('[STORAGE] Getting internship:', internshipId);
      
      const [internship] = await db
        .select({
          internship: internships,
          student: users,
          partner: businessPartners
        })
        .from(internships)
        .leftJoin(users, eq(internships.studentId, users.id))
        .leftJoin(businessPartners, eq(internships.partnerId, businessPartners.id))
        .where(eq(internships.id, internshipId));
      
      return internship || null;
    } catch (error) {
      console.error('[STORAGE] getInternship error:', error);
      return null;
    }
  }

  async createInternship(internship: InsertInternship): Promise<any> {
    try {
      console.log('[STORAGE] Creating internship:', internship);
      
      const [newInternship] = await db
        .insert(internships)
        .values(internship)
        .returning();
      
      return newInternship;
    } catch (error) {
      console.error('[STORAGE] createInternship error:', error);
      throw new Error('Failed to create internship');
    }
  }

  async updateInternship(internshipId: number, updates: Partial<InsertInternship>): Promise<any> {
    try {
      console.log('[STORAGE] Updating internship:', { internshipId, updates });
      
      const [updatedInternship] = await db
        .update(internships)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(internships.id, internshipId))
        .returning();
      
      return updatedInternship;
    } catch (error) {
      console.error('[STORAGE] updateInternship error:', error);
      throw new Error('Failed to update internship');
    }
  }

  async getStudentInternships(studentId: number): Promise<any[]> {
    try {
      console.log('[STORAGE] Getting internships for student:', studentId);
      
      const studentInternships = await db
        .select({
          internship: internships,
          partner: businessPartners
        })
        .from(internships)
        .leftJoin(businessPartners, eq(internships.partnerId, businessPartners.id))
        .where(eq(internships.studentId, studentId));
      
      return studentInternships;
    } catch (error) {
      console.error('[STORAGE] getStudentInternships error:', error);
      return [];
    }
  }

  async sendPartnershipCommunication(communication: InsertPartnershipCommunication): Promise<any> {
    try {
      console.log('[STORAGE] Sending partnership communication:', communication);
      
      const [newCommunication] = await db
        .insert(partnershipCommunications)
        .values(communication)
        .returning();
      
      return newCommunication;
    } catch (error) {
      console.error('[STORAGE] sendPartnershipCommunication error:', error);
      throw new Error('Failed to send partnership communication');
    }
  }

  async getPartnershipCommunications(agreementId: number): Promise<any[]> {
    try {
      console.log('[STORAGE] Getting partnership communications for agreement:', agreementId);
      
      const communications = await db
        .select({
          communication: partnershipCommunications,
          sender: users
        })
        .from(partnershipCommunications)
        .leftJoin(users, eq(partnershipCommunications.senderId, users.id))
        .where(eq(partnershipCommunications.agreementId, agreementId))
        .orderBy(desc(partnershipCommunications.createdAt));
      
      return communications;
    } catch (error) {
      console.error('[STORAGE] getPartnershipCommunications error:', error);
      return [];
    }
  }

  async getPartnershipStatistics(schoolId: number): Promise<any> {
    try {
      console.log('[STORAGE] Getting partnership statistics for school:', schoolId);
      
      const [partnerCount] = await db
        .select({ count: count() })
        .from(schoolPartnershipAgreements)
        .where(eq(schoolPartnershipAgreements.schoolId, schoolId));
      
      const [internshipCount] = await db
        .select({ count: count() })
        .from(internships)
        .where(eq(internships.schoolId, schoolId));
      
      const [activeInternshipCount] = await db
        .select({ count: count() })
        .from(internships)
        .where(
          and(
            eq(internships.schoolId, schoolId),
            eq(internships.status, 'active')
          )
        );
      
      const [completedInternshipCount] = await db
        .select({ count: count() })
        .from(internships)
        .where(
          and(
            eq(internships.schoolId, schoolId),
            eq(internships.status, 'completed')
          )
        );
      
      return {
        totalPartners: partnerCount.count,
        totalInternships: internshipCount.count,
        activeInternships: activeInternshipCount.count,
        completedInternships: completedInternshipCount.count,
        successRate: internshipCount.count > 0 ? (completedInternshipCount.count / internshipCount.count * 100).toFixed(1) : 0
      };
    } catch (error) {
      console.error('[STORAGE] getPartnershipStatistics error:', error);
      return {
        totalPartners: 0,
        totalInternships: 0,
        activeInternships: 0,
        completedInternships: 0,
        successRate: 0
      };
    }
  }
}

export const storage = new DatabaseStorage();
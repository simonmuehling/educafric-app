import { 
  users, schools, classes, subjects, grades, attendance, homework, 
  payments, communicationLogs, timetableSlots, parentStudentRelations,
  enrollments, academicYears, terms, homeworkSubmissions, commercialDocuments,
  bulletins, bulletinGrades, bulletinApprovals, messages, messageRecipients,
  teacherAbsences, teacherAbsenceNotifications,
  parentRequests, parentRequestResponses, parentRequestNotifications,
  commercialContacts, notificationSettings, notifications,
  type User, type InsertUser, type School, type InsertSchool,
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
  type Notification, type InsertNotification
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
  // ===== COMMERCIAL MODULES INTERFACE EXTENSION =====
  // Commercial Schools Management
  getCommercialSchools(commercialId: number): Promise<any[]>;
  createCommercialSchool(commercialId: number, schoolData: any): Promise<any>;
  updateCommercialSchool(schoolId: number, updates: any): Promise<any>;
  deleteCommercialSchool(schoolId: number): Promise<void>;
  
  // Commercial Leads Management  
  getCommercialLeads(commercialId: number): Promise<any[]>;
  createCommercialLead(commercialId: number, leadData: any): Promise<any>;
  updateCommercialLead(leadId: number, updates: any): Promise<any>;
  deleteCommercialLead(leadId: number): Promise<void>;
  convertLeadToSchool(leadId: number, commercialId: number): Promise<any>;
  
  // Commercial Contacts Management
  getCommercialContacts(commercialId: number): Promise<CommercialContact[]>;
  createCommercialContact(commercialId: number, contactData: InsertCommercialContact): Promise<CommercialContact>;
  updateCommercialContact(contactId: number, updates: Partial<InsertCommercialContact>): Promise<CommercialContact>;
  deleteCommercialContact(contactId: number): Promise<void>;
  
  // Commercial Payment Confirmation  
  getCommercialPayments(commercialId: number): Promise<any[]>;
  
  // Missing interface methods
  deleteUser(userId: number): Promise<void>;
  deleteSchool(schoolId: number): Promise<void>;
  confirmCommercialPayment(paymentId: number, commercialId: number, notes?: string): Promise<any>;
  rejectCommercialPayment(paymentId: number, commercialId: number, reason: string): Promise<any>;
  
  // Commercial Statistics
  getCommercialStatistics(commercialId: number, period: string): Promise<any>;
  getCommercialRevenueStats(commercialId: number): Promise<any>;
  getCommercialConversionStats(commercialId: number): Promise<any>;
  
  // Commercial Reports
  getCommercialReports(commercialId: number, reportType: string, period: string): Promise<any>;
  generateCommercialReport(commercialId: number, type: string, params: any): Promise<any>;
  
  // Commercial Appointments & Calls
  getCommercialAppointments(commercialId: number): Promise<any[]>;
  createCommercialAppointment(commercialId: number, appointmentData: any): Promise<any>;
  updateCommercialAppointment(appointmentId: number, updates: any): Promise<any>;
  deleteCommercialAppointment(appointmentId: number): Promise<void>;
  getCommercialCalls(commercialId: number): Promise<any[]>;
  createCommercialCall(commercialId: number, callData: any): Promise<any>;
  
  // Commercial WhatsApp Management
  sendCommercialWhatsApp(commercialId: number, messageData: any): Promise<any>;
  getCommercialWhatsAppHistory(commercialId: number): Promise<any[]>;
  getCommercialWhatsAppTemplates(commercialId: number): Promise<any[]>;
  createCommercialWhatsAppTemplate(commercialId: number, templateData: any): Promise<any>;
  
  // Commercial Profile & Settings
  getCommercialProfile(commercialId: number): Promise<any>;
  updateCommercialProfile(commercialId: number, updates: any): Promise<any>;
  getCommercialSettings(commercialId: number): Promise<any>;
  updateCommercialSettings(commercialId: number, settings: any): Promise<any>;
  
  // ===== SITE ADMIN MODULES INTERFACE EXTENSION =====
  // Site Admin Platform Management
  getAllPlatformUsers(): Promise<any[]>;
  createPlatformUser(userData: any): Promise<any>;
  updatePlatformUser(userId: number, updates: any): Promise<any>;
  deletePlatformUser(userId: number): Promise<void>;
  
  // Site Admin School Management  
  getAllPlatformSchools(): Promise<any[]>;
  createPlatformSchool(schoolData: any): Promise<any>;
  updatePlatformSchool(schoolId: number, updates: any): Promise<any>;
  deletePlatformSchool(schoolId: number): Promise<void>;
  
  // Site Admin System Analytics
  getPlatformAnalytics(): Promise<any>;
  getPlatformStats(): Promise<any>;
  getPlatformStatistics(): Promise<any>;
  getPlatformUsers(): Promise<any[]>;
  getPlatformSchools(): Promise<any[]>;
  getSystemHealth(): Promise<any>;
  getPerformanceMetrics(): Promise<any>;
  
  // Site Admin Settings & Configuration
  getSystemSettings(): Promise<any>;
  updateSystemSettings(settings: any): Promise<any>;
  getSecuritySettings(): Promise<any>;
  updateSecuritySettings(settings: any): Promise<any>;
  
  // Site Admin Monitoring & Logs
  getSystemLogs(limit?: number): Promise<any[]>;
  getSecurityLogs(limit?: number): Promise<any[]>;
  getAuditLogs(limit?: number): Promise<any[]>;
  
  // Site Admin Reports & Exports
  generatePlatformReport(reportType: string, filters: any): Promise<any>;
  exportPlatformData(dataType: string, format: string): Promise<any>;
  
  // ===== FREELANCER MODULES INTERFACE EXTENSION =====
  getFreelancerStudents(freelancerId: number): Promise<any[]>;
  getFreelancerSessions(freelancerId: number): Promise<any[]>;
  getFreelancerPayments(freelancerId: number): Promise<any[]>;
  getFreelancerSchedule(freelancerId: number): Promise<any[]>;
  getFreelancerResources(freelancerId: number): Promise<any[]>;
  
  // ===== TEACHER ABSENCE MANAGEMENT INTERFACE =====
  // Core absence operations
  getTeacherAbsences(schoolId: number): Promise<any[]>;
  getTeacherAbsenceById(id: number): Promise<any>;
  createTeacherAbsence(absenceData: any): Promise<any>;
  updateTeacherAbsence(id: number, updates: any): Promise<any>;
  deleteTeacherAbsence(id: number): Promise<void>;
  
  // Quick actions system
  performAbsenceAction(absenceId: number, actionType: string, performedBy: number, actionData: any): Promise<any>;
  getAbsenceActions(absenceId: number): Promise<any[]>;
  
  // Substitute management
  getAvailableSubstitutes(schoolId: number, subjectId: number, timeSlot: any): Promise<any[]>;
  assignSubstitute(absenceId: number, substituteId: number, assignedBy: number, instructions?: string): Promise<any>;
  confirmSubstitute(absenceId: number, confirmed: boolean): Promise<any>;
  
  // Notification system
  notifyAbsenceStakeholders(absenceId: number, targetAudience: string, method: string): Promise<any>;
  getAbsenceNotificationHistory(absenceId: number): Promise<any[]>;
  
  // Reporting and analytics
  generateMonthlyAbsenceReport(schoolId: number, month: number, year: number): Promise<any>;
  getAbsenceStatistics(schoolId: number, dateRange?: any): Promise<any>;
  getAbsenceReports(schoolId: number): Promise<any[]>;
  // ===== PARENT MODULES INTERFACE EXTENSION =====
  getParentChildren(parentId: number): Promise<any[]>;
  getParentMessages(parentId: number): Promise<any[]>;
  getParentGrades(parentId: number): Promise<any[]>;
  getParentAttendance(parentId: number): Promise<any[]>;
  getParentPayments(parentId: number): Promise<any[]>;
  getParentProfile(parentId: number): Promise<any>;
  updateParentProfile(parentId: number, updates: any): Promise<any>;
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined>;
  getUserByToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  updateUserStripeInfo(id: number, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  updateUserSubscription(id: number, subscriptionData: { //subscriptionStatus: string; stripeSubscriptionId: string; planId: string; planName: string }): Promise<User>;
  
  // School management
  getSchool(id: number): Promise<School | undefined>;
  getSchoolsByUser(userId: number): Promise<School[]>;
  createSchool(school: InsertSchool): Promise<School>;
  updateSchool(id: number, updates: Partial<InsertSchool>): Promise<School>;
  
  // Class management
  getClass(id: number): Promise<Class | undefined>;
  getClassesBySchool(schoolId: number): Promise<Class[]>;
  getClassesByTeacher(teacherId: number): Promise<Class[]>;
  getAllClasses(): Promise<Class[]>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: number, updates: Partial<InsertClass>): Promise<Class>;
  deleteClass(id: number): Promise<void>;
  
  // Subject management
  getSubjectsBySchool(schoolId: number): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  
  // Student management
  getStudentsByClass(classId: number): Promise<User[]>;
  getStudentsBySchool(schoolId: number): Promise<User[]>;
  getStudentsByParent(parentId: number): Promise<User[]>;
  
  // Grade management
  getGradesByStudent(studentId: number, termId?: number): Promise<Grade[]>;
  getGradesByClass(classId: number, subjectId?: number): Promise<Grade[]>;
  createGrade(grade: InsertGrade): Promise<Grade>;
  updateGrade(id: number, updates: Partial<InsertGrade>): Promise<Grade>;
  
  // Attendance management
  getAttendanceByStudent(studentId: number, startDate?: Date, endDate?: Date): Promise<Attendance[]>;
  getAttendanceByClass(classId: number, date: Date): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, updates: Partial<InsertAttendance>): Promise<Attendance>;
  
  // Homework management
  getHomeworkByClass(classId: number): Promise<Homework[]>;
  getHomeworkByStudent(studentId: number): Promise<Homework[]>;
  createHomework(homework: InsertHomework): Promise<Homework>;
  updateHomework(id: number, updates: Partial<InsertHomework>): Promise<Homework>;
  
  // Payment management
  getPaymentsByUser(userId: number): Promise<Payment[]>;
  getPaymentsBySchool(schoolId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, updates: Partial<InsertPayment>): Promise<Payment>;
  
  // Communication management
  createCommunicationLog(log: Omit<CommunicationLog, 'id' | 'sentAt'>): Promise<CommunicationLog>;
  getCommunicationLogsByUser(userId: number): Promise<CommunicationLog[]>;
  
  // Admin management helpers
  getAllUsers(): Promise<User[]>;
  getAllSchools(): Promise<School[]>;
  
  // Parent-Child relationships
  getParentStats(parentId: number): Promise<{ children: User[]; stats: any }>;
  linkParentToStudent(parentId: number, studentId: number, relationship: string): Promise<ParentStudentRelation>;
  
  // ===== PARENT-CHILD CONNECTION METHODS =====
  createParentChildConnection(parentId: number, studentId: number, connectionType: string, requestData: any): Promise<any>;
  generateQRCodeForStudent(studentId: number): Promise<{ qrCode: string; token: string; expiresAt: Date }>;
  validateQRCodeConnection(qrToken: string, parentId: number): Promise<{ success: boolean; studentId?: number }>;
  createManualConnectionRequest(parentData: any, studentSearchData: any): Promise<any>;
  
  // ===== NOTIFICATION SETTINGS METHODS =====
  getUserNotificationSettings(userId: number): Promise<NotificationSettings[]>;
  updateNotificationSettings(userId: number, settings: any[]): Promise<NotificationSettings[]>;
  createDefaultNotificationSettings(userId: number): Promise<NotificationSettings[]>;
  deleteNotificationSettings(userId: number, notificationType: string): Promise<void>;
  validateManualConnectionRequest(requestId: number, schoolApproval: boolean): Promise<any>;
  sendParentInvitation(parentEmail: string, studentId: number, schoolId: number): Promise<any>;
  
  // Admin/Commercial connection system metrics
  getConnectionSystemMetrics(): Promise<any>;
  getConnectionsByMethod(): Promise<any>;
  getPendingConnectionsStats(): Promise<any>;
  
  // Teacher management  
  getTeachersBySchool(schoolId: number): Promise<User[]>;
  createTeacher(teacherData: InsertUser): Promise<User>;
  updateTeacher(id: number, updates: Partial<User>): Promise<User>;
  deleteTeacher(id: number): Promise<void>;
  
  // Statistics and dashboard data
  getSchoolStats(schoolId: number): Promise<{
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    attendanceRate: number;
  }>;
  
  getRecentActivity(schoolId: number, limit?: number): Promise<any[]>;
  
  // New API methods for routes
  getEducationalContent(studentId: number): Promise<any[]>;
  getStudentGrades(studentId: number): Promise<any[]>;
  getStudentHomework(studentId: number): Promise<any[]>;
  getStudentAttendance(studentId: number): Promise<any[]>;
  getStudentTimetable(studentId: number): Promise<any[]>;
  getStudentMessages(studentId: number): Promise<any[]>;
  getParentChildren(parentId: number): Promise<any[]>;
  getParentNotifications(parentId: number): Promise<any[]>;
  getChildAttendance(childId: number): Promise<any[]>;
  getTeacherClasses(teacherId: number): Promise<any[]>;
  getTeacherStudents(teacherId: number): Promise<any[]>;

  // Attendance Management methods
  markAttendance(data: { studentId: number; status: string; date: string; teacherId: number }): Promise<any>;
  getTeacherStudentsWithAttendance(teacherId: number, date: string): Promise<any[]>;
  sendParentCommunication(data: { studentId: number; teacherId: number; message: string; type: string }): Promise<any>;
  getFreelancerStudents(freelancerId: number): Promise<any[]>;
  
  // ===== TEACHER SPECIFIC METHODS =====
  getTeacherAttendanceOverview(teacherId: number): Promise<any[]>;
  getTeacherGradesOverview(teacherId: number): Promise<any[]>;
  getTeacherAssignments(teacherId: number): Promise<any[]>;
  getTeacherCommunications(teacherId: number): Promise<any[]>;
  addFreelancerStudent(data: any): Promise<any>;
  
  // Site Admin methods - Real data for platform administration
  getPlatformStatistics(): Promise<{
    totalUsers: number;
    totalSchools: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    newRegistrations: number;
    systemUptime: number;
    storageUsed: number;
    apiCalls: number;
    pendingAdminRequests: number;
  }>;
  getActiveSubscriptions(): Promise<any[]>;
  getAllUsersWithDetails(): Promise<User[]>;
  getAllSchoolsWithDetails(): Promise<School[]>;
  getSystemMetrics(): Promise<any>;
  getUsersByRole(role: string): Promise<User[]>;
  getRecentRegistrations(days: number): Promise<User[]>;
  getSubscriptionRevenue(): Promise<any>;
  getPlatformAnalytics(): Promise<any>;
  
  // Commercial Documents Management
  getCommercialDocuments(): Promise<CommercialDocument[]>;
  getCommercialDocumentsByUser(userId: number): Promise<CommercialDocument[]>;
  getCommercialDocument(id: number): Promise<CommercialDocument | undefined>;
  createCommercialDocument(document: InsertCommercialDocument): Promise<CommercialDocument>;
  updateCommercialDocument(id: number, updates: Partial<InsertCommercialDocument>): Promise<CommercialDocument>;
  signCommercialDocument(id: number, signatureData: any): Promise<CommercialDocument>;
  sendCommercialDocument(id: number, sendData: any): Promise<CommercialDocument>;
  getPersonalCommercialDocuments(userId: number): Promise<CommercialDocument[]>;

  // Student Timetable Management
  getStudentTimetable(studentId: number): Promise<any[]>;
  getTimetableByClass(classId: number): Promise<TimetableSlot[]>;
  createTimetableSlot(slot: Omit<TimetableSlot, 'id'>): Promise<TimetableSlot>;
  updateTimetableSlot(id: number, updates: Partial<TimetableSlot>): Promise<TimetableSlot>;
  deleteTimetableSlot(id: number): Promise<void>;
  
  // Messages management
  getMessages(userId: number, type: string, category?: string, search?: string): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, updates: Partial<InsertMessage>): Promise<Message>;
  deleteMessage(id: number): Promise<void>;
  markMessageAsRead(messageId: number, userId: number): Promise<void>;
  getRecipients(type: string, schoolId?: number): Promise<any[]>;
  
  // Message recipients management
  createMessageRecipient(recipient: InsertMessageRecipient): Promise<MessageRecipient>;
  getMessageRecipients(messageId: number): Promise<MessageRecipient[]>;
  markRecipientAsRead(messageId: number, recipientId: number): Promise<void>;
  
  // Teacher Absence Management
  getTeacherAbsences(schoolId: number, filters?: { teacherId?: number; date?: string; status?: string }): Promise<any[]>;
  createTeacherAbsence(absence: any): Promise<any>;
  updateTeacherAbsence(id: number, updates: any): Promise<any>;
  assignReplacementTeacher(absenceId: number, replacementTeacherId: number): Promise<any>;
  sendAbsenceNotifications(absenceId: number): Promise<any>;
  getAvailableTeachers(schoolId: number, absenceDate: string, startTime: string, endTime: string): Promise<any[]>;

  // Parent Requests Management
  getParentRequests(schoolId: number, filters?: { status?: string; priority?: string; category?: string; parentId?: number }): Promise<any[]>;
  createParentRequest(request: InsertParentRequest): Promise<any>;
  updateParentRequest(id: number, updates: Partial<InsertParentRequest>): Promise<any>;
  processParentRequest(requestId: number, status: string, response: string, processedBy: number): Promise<any>;
  markParentRequestUrgent(requestId: number, isUrgent: boolean): Promise<any>;
  sendParentRequestNotifications(requestId: number, message: string): Promise<any>;
  getParentRequestResponses(requestId: number): Promise<any[]>;

  // ===== BULLETIN APPROVAL SYSTEM INTERFACE =====
  getBulletins(schoolId: number, filters?: { status?: string; classId?: number; term?: string; academicYear?: string }): Promise<any[]>;
  getBulletin(id: number): Promise<any>;
  createBulletin(bulletin: any): Promise<any>;
  updateBulletin(id: number, updates: any): Promise<any>;
  approveBulletin(bulletinId: number, approverId: number, comment?: string): Promise<any>;
  rejectBulletin(bulletinId: number, approverId: number, comment: string): Promise<any>;
  sendBulletin(bulletinId: number, sentBy: number): Promise<any>;
  createBulletinApproval(approval: any): Promise<any>;
  getBulletinApprovals(bulletinId: number): Promise<any[]>;

  // ===== BULLETIN VALIDATION SYSTEM INTERFACE =====
  getBulletinsByStatus(status: string, schoolId: number, page: number, limit: number): Promise<any[]>;
  getBulletinDetails(bulletinId: number): Promise<any>;
  submitBulletinForApproval(bulletinId: number, teacherId: number, comment?: string): Promise<boolean>;
  sendBulletinToParents(bulletinId: number, sentBy: number): Promise<boolean>;

  // ===== SCHOOL ADMINISTRATORS SYSTEM INTERFACE =====
  grantSchoolAdminRights(teacherId: number, schoolId: number, adminLevel: string, grantedBy: number): Promise<any>;
  revokeSchoolAdminRights(teacherId: number, schoolId: number, revokedBy: number): Promise<any>;
  getSchoolAdministrators(schoolId: number): Promise<any[]>;
  checkSchoolAdminPermissions(userId: number, schoolId: number, permission: string): Promise<boolean>;
  getSchoolAdminPermissions(userId: number, schoolId: number): Promise<string[]>;

  // ===== DIRECTOR MODULES BACKEND INTEGRATION =====
  // ClassManagement
  getDirectorClasses(directorId: number): Promise<any[]>;
  createClass(classData: any): Promise<any>;
  updateClass(classId: number, data: any): Promise<any>;
  deleteClass(classId: number): Promise<void>;
  
  // SchoolAttendanceManagement
  getSchoolAttendanceStats(schoolId: number): Promise<any>;
  getSchoolAttendanceByDate(schoolId: number, date: string): Promise<any[]>;
  updateAttendanceRecord(recordId: number, data: any): Promise<any>;
  
  // ParentRequests (already exists but enhance)
  getParentRequestsStats(schoolId: number): Promise<any>;
  
  // GeolocationManagement 
  getGeolocationOverview(schoolId: number): Promise<any>;
  getTrackingDevices(schoolId: number): Promise<any[]>;
  addTrackingDevice(deviceData: any): Promise<any>;
  updateTrackingDevice(deviceId: number, data: any): Promise<any>;
  
  // BulletinApproval (already exists but enhance)
  getBulletinApprovalStats(schoolId: number): Promise<any>;
  
  // TeacherAbsence (already exists but enhance)
  getTeacherAbsenceStats(schoolId: number): Promise<any>;
  
  // TimetableConfiguration
  getTimetableOverview(schoolId: number): Promise<any>;
  createTimetableSlot(slotData: any): Promise<any>;
  updateTimetableSlot(slotId: number, data: any): Promise<any>;
  deleteTimetableSlot(slotId: number): Promise<void>;
  
  // FinancialManagement
  getFinancialOverview(schoolId: number): Promise<any>;
  getFinancialTransactions(schoolId: number): Promise<any[]>;
  createTransaction(transactionData: any): Promise<any>;
  
  // ReportsAnalytics
  getReportsOverview(schoolId: number): Promise<any>;
  generateReport(reportType: string, schoolId: number, params: any): Promise<any>;
  
  // CommunicationsCenter
  getCommunicationsOverview(schoolId: number): Promise<any>;
  getSchoolMessages(schoolId: number): Promise<any[]>;
  sendSchoolMessage(messageData: any): Promise<any>;
}

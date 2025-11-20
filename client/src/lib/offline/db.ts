import Dexie, { Table } from 'dexie';

// ===========================
// 📦 OFFLINE DATABASE SCHEMA
// ===========================
// IndexedDB schema for offline storage
// Full CRUD: Classes, Students, Attendance, Teachers, Messages
// Read-only: Timetable, School Attendance, Delegated Admins, Reports, Academic Mgmt, Canteen, Bus

export interface OfflineClass {
  id: number;
  name: string;
  level?: string;
  section?: string;
  maxStudents?: number;
  teacherId?: number;
  teacherName?: string;
  room?: string;
  schoolId: number;
  isActive: boolean;
  subjects?: any[];
  // Offline metadata
  lastModified: number;
  syncStatus: 'synced' | 'pending' | 'conflict';
  localOnly?: boolean;
}

export interface OfflineStudent {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  classId?: number;
  className?: string;
  schoolId: number;
  parentPhone?: string;
  parentEmail?: string;
  photoUrl?: string;
  // Offline metadata
  lastModified: number;
  syncStatus: 'synced' | 'pending' | 'conflict';
  localOnly?: boolean;
}

export interface OfflineAttendance {
  id?: number;
  studentId: number;
  studentName: string;
  classId: number;
  className: string;
  date: string; // ISO date
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  markedBy: number;
  schoolId: number;
  // Offline metadata
  lastModified: number;
  syncStatus: 'synced' | 'pending' | 'conflict';
  localOnly?: boolean;
}

export interface OfflineTeacher {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  subject?: string;
  classIds?: number[];
  schoolId: number;
  qualifications?: string;
  photoUrl?: string;
  // Offline metadata
  lastModified: number;
  syncStatus: 'synced' | 'pending' | 'conflict';
  localOnly?: boolean;
}

export interface OfflineMessage {
  id: number;
  subject: string;
  content: string;
  from: number;
  to: number[];
  recipientType: 'parent' | 'teacher' | 'student' | 'all';
  status: 'draft' | 'sent' | 'delivered' | 'read';
  sentAt?: number;
  schoolId: number;
  classId?: number;
  // Offline metadata
  lastModified: number;
  syncStatus: 'synced' | 'pending' | 'conflict';
  localOnly?: boolean;
}

// Read-only modules (cache only, no offline modifications)
export interface OfflineTimetable {
  id: number;
  classId: number;
  teacherId: number;
  subject: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
  schoolId: number;
  isActive: boolean;
  lastCached: number;
}

export interface OfflineSchoolAttendance {
  id: number;
  date: string;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  classBreakdown: any;
  schoolId: number;
  lastCached: number;
}

export interface OfflineDelegatedAdmin {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  permissions: string[];
  schoolId: number;
  isActive: boolean;
  lastCached: number;
}

export interface OfflineReport {
  id: number;
  type: string;
  title: string;
  generatedAt: number;
  data: any;
  schoolId: number;
  lastCached: number;
}

export interface OfflineAcademicData {
  id: number;
  type: 'bulletin' | 'grade' | 'exam';
  studentId?: number;
  classId?: number;
  term?: string;
  data: any;
  schoolId: number;
  // Offline metadata for CRUD operations
  lastModified: number;
  syncStatus: 'synced' | 'pending' | 'conflict';
  localOnly?: boolean;
}

export interface OfflineCanteen {
  id: number;
  menuDate: string;
  menu: any;
  studentIds: number[];
  schoolId: number;
  lastCached: number;
}

export interface OfflineBus {
  id: number;
  routeName: string;
  driverName?: string;
  studentIds: number[];
  stops: any[];
  schoolId: number;
  isActive: boolean;
  lastCached: number;
}

export interface SyncQueueItem {
  id?: number;
  module: 'classes' | 'students' | 'attendance' | 'teachers' | 'messages' | 'academicData';
  action: 'create' | 'update' | 'delete';
  entityId?: number;
  tempId?: number; // Temporary ID for offline-created entities
  payload: any;
  timestamp: number;
  retryCount: number;
  lastError?: string;
  synced: boolean;
}

export interface OfflineMetadata {
  key: string;
  value: any;
  lastUpdated: number;
}

export interface TempIdMapping {
  tempId: number;
  realId: number;
  module: 'classes' | 'students' | 'attendance' | 'teachers' | 'messages' | 'academicData';
  timestamp: number;
}

// ===========================
// 🗄️ DEXIE DATABASE CLASS
// ===========================
class OfflineDatabase extends Dexie {
  // Full CRUD modules
  classes!: Table<OfflineClass, number>;
  students!: Table<OfflineStudent, number>;
  attendance!: Table<OfflineAttendance, number>;
  teachers!: Table<OfflineTeacher, number>;
  messages!: Table<OfflineMessage, number>;
  academicData!: Table<OfflineAcademicData, number>;
  
  // Read-only modules
  timetable!: Table<OfflineTimetable, number>;
  schoolAttendance!: Table<OfflineSchoolAttendance, number>;
  delegatedAdmins!: Table<OfflineDelegatedAdmin, number>;
  reports!: Table<OfflineReport, number>;
  canteen!: Table<OfflineCanteen, number>;
  bus!: Table<OfflineBus, number>;
  
  // System tables
  syncQueue!: Table<SyncQueueItem, number>;
  metadata!: Table<OfflineMetadata, string>;

  constructor() {
    super('EducafricOfflineDB');
    
    // Version 1: Original schema (deployed in production)
    // Contains: 3 CRUD modules (Classes, Students, Attendance) + 2 system tables
    this.version(1).stores({
      classes: 'id, schoolId, syncStatus, lastModified',
      students: 'id, schoolId, classId, syncStatus, lastModified, [schoolId+classId]',
      attendance: '++id, studentId, classId, date, schoolId, syncStatus, lastModified, [studentId+date], [schoolId+date]',
      syncQueue: '++id, module, synced, timestamp, tempId, entityId, [module+synced]',
      metadata: 'key, lastUpdated'
    });

    // Version 2: Extended schema (upgrade from v1)
    // Adds: 2 new CRUD modules (Teachers, Messages) + 7 read-only modules
    this.version(2).stores({
      // New CRUD modules
      teachers: 'id, schoolId, syncStatus, lastModified, phone',
      messages: 'id, schoolId, from, syncStatus, lastModified, [schoolId+from]',
      
      // Read-only modules (cache only)
      timetable: 'id, classId, teacherId, schoolId, lastCached, [schoolId+classId]',
      schoolAttendance: 'id, date, schoolId, lastCached, [schoolId+date]',
      delegatedAdmins: 'id, userId, schoolId, lastCached',
      reports: 'id, type, schoolId, lastCached',
      academicData: 'id, type, studentId, classId, schoolId, lastCached',
      canteen: 'id, menuDate, schoolId, lastCached, [schoolId+menuDate]',
      bus: 'id, schoolId, lastCached'
    });

    // Version 3: Academic Data becomes CRUD (upgrade from v2)
    // Upgrades academicData from read-only to full CRUD for offline bulletin creation
    this.version(3).stores({
      // Upgrade academicData to CRUD module
      academicData: 'id, type, studentId, classId, schoolId, syncStatus, lastModified, term, [schoolId+classId], [schoolId+studentId], [schoolId+term]'
    });
  }
}

export const offlineDb = new OfflineDatabase();

// ===========================
// 🔧 HELPER FUNCTIONS
// ===========================

export async function getOfflineMetadata(key: string): Promise<any> {
  const item = await offlineDb.metadata.get(key);
  return item?.value;
}

export async function setOfflineMetadata(key: string, value: any): Promise<void> {
  await offlineDb.metadata.put({
    key,
    value,
    lastUpdated: Date.now()
  });
}

// Get last server sync timestamp
export async function getLastServerSync(): Promise<number | null> {
  return await getOfflineMetadata('lastServerSync');
}

// Set last server sync timestamp
export async function setLastServerSync(timestamp: number): Promise<void> {
  await setOfflineMetadata('lastServerSync', timestamp);
}

// Get offline mode status
export async function getOfflineMode(): Promise<'unlimited' | 'limited'> {
  return await getOfflineMetadata('offlineMode') || 'limited';
}

// Set offline mode
export async function setOfflineMode(mode: 'unlimited' | 'limited'): Promise<void> {
  await setOfflineMetadata('offlineMode', mode);
}

// Calculate days offline
export function calculateDaysOffline(lastSync: number | null): number {
  if (!lastSync) return 0;
  const now = Date.now();
  const diffMs = now - lastSync;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

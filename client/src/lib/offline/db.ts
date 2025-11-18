import Dexie, { Table } from 'dexie';

// ===========================
// 📦 OFFLINE DATABASE SCHEMA
// ===========================
// IndexedDB schema for offline storage of critical modules
// Supports: Classes, Students, Attendance

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

export interface SyncQueueItem {
  id?: number;
  module: 'classes' | 'students' | 'attendance';
  action: 'create' | 'update' | 'delete';
  entityId?: number;
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

// ===========================
// 🗄️ DEXIE DATABASE CLASS
// ===========================
class OfflineDatabase extends Dexie {
  classes!: Table<OfflineClass, number>;
  students!: Table<OfflineStudent, number>;
  attendance!: Table<OfflineAttendance, number>;
  syncQueue!: Table<SyncQueueItem, number>;
  metadata!: Table<OfflineMetadata, string>;

  constructor() {
    super('EducafricOfflineDB');
    
    this.version(1).stores({
      classes: 'id, schoolId, syncStatus, lastModified',
      students: 'id, schoolId, classId, syncStatus, lastModified',
      attendance: '++id, studentId, classId, date, schoolId, syncStatus, lastModified',
      syncQueue: '++id, module, synced, timestamp',
      metadata: 'key, lastUpdated'
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

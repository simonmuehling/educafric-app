import { useState, useEffect } from 'react';
import { offlineDb, OfflineAttendance } from '@/lib/offline/db';
import { SyncQueueManager } from '@/lib/offline/syncQueue';
import { useOfflinePremium } from '@/contexts/offline/OfflinePremiumContext';
import { useAuth } from '@/contexts/AuthContext';

// ===========================
// ✅ OFFLINE ATTENDANCE HOOK
// ===========================
// Manages offline storage and sync for attendance

export function useOfflineAttendance(date?: string) {
  const { user } = useAuth();
  const { isOnline, hasOfflineAccess } = useOfflinePremium();
  const [attendance, setAttendance] = useState<OfflineAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const targetDate = date || new Date().toISOString().split('T')[0];

  // Load attendance from IndexedDB
  const loadFromLocal = async () => {
    if (!user?.schoolId) return [];
    
    const localAttendance = await offlineDb.attendance
      .where('[schoolId+date]')
      .equals([user.schoolId, targetDate])
      .toArray();
    
    return localAttendance;
  };

  // Fetch attendance from server and cache locally
  const fetchAndCache = async () => {
    if (!user?.schoolId) return;
    
    try {
      const response = await fetch(`/api/director/attendance?date=${targetDate}`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch attendance');
      
      const data = await response.json();
      const serverAttendance = data.attendance || [];
      
      // Clear old attendance for this date
      await offlineDb.attendance
        .where('[schoolId+date]')
        .equals([user.schoolId, targetDate])
        .delete();
      
      // Cache new data
      const attendanceToCache = serverAttendance.map((record: any) => ({
        id: record.id,
        studentId: record.studentId,
        studentName: record.studentName || `${record.firstName} ${record.lastName}`,
        classId: record.classId,
        className: record.className,
        date: targetDate,
        status: record.status,
        notes: record.notes,
        markedBy: record.markedBy || user.id,
        schoolId: user.schoolId,
        lastModified: Date.now(),
        syncStatus: 'synced' as const,
        localOnly: false
      }));
      
      if (attendanceToCache.length > 0) {
        await offlineDb.attendance.bulkAdd(attendanceToCache);
      }
      
      return attendanceToCache;
    } catch (error) {
      console.error('[OFFLINE_ATTENDANCE] Error fetching from server:', error);
      throw error;
    }
  };

  // Load attendance on mount
  useEffect(() => {
    async function loadAttendance() {
      setLoading(true);
      
      if (!hasOfflineAccess) {
        setAttendance([]);
        setLoading(false);
        return;
      }
      
      try {
        if (isOnline) {
          const fetched = await fetchAndCache();
          setAttendance(fetched || []);
        } else {
          const local = await loadFromLocal();
          setAttendance(local);
        }
      } catch (error) {
        console.error('[OFFLINE_ATTENDANCE] Error loading attendance:', error);
        const local = await loadFromLocal();
        setAttendance(local);
      } finally {
        setLoading(false);
      }
    }
    
    loadAttendance();
  }, [user?.schoolId, targetDate, isOnline, hasOfflineAccess]);

  // Mark attendance (offline-first)
  const markAttendance = async (
    studentId: number,
    studentName: string,
    classId: number,
    className: string,
    status: 'present' | 'absent' | 'late' | 'excused',
    notes?: string
  ): Promise<OfflineAttendance> => {
    if (!user?.schoolId) throw new Error('No school ID');
    
    const record: OfflineAttendance = {
      studentId,
      studentName,
      classId,
      className,
      date: targetDate,
      status,
      notes,
      markedBy: user.id,
      schoolId: user.schoolId,
      lastModified: Date.now(),
      syncStatus: isOnline ? 'synced' : 'pending',
      localOnly: !isOnline
    };
    
    // Check if attendance already exists for this student/date
    const existing = await offlineDb.attendance
      .where('[studentId+date]')
      .equals([studentId, targetDate])
      .first();
    
    if (existing) {
      // Update existing record
      await offlineDb.attendance.update(existing.id!, {
        status,
        notes,
        lastModified: Date.now(),
        syncStatus: isOnline ? 'synced' : 'pending'
      });
      
      await SyncQueueManager.enqueue('attendance', 'update', {
        studentId,
        date: targetDate,
        status,
        notes
      }, existing.id);
      
      setAttendance(prev => prev.map(att => 
        att.id === existing.id ? { ...att, status, notes } : att
      ));
      
      return { ...existing, status, notes };
    } else {
      // Create new record
      const id = await offlineDb.attendance.add(record);
      record.id = id as number;
      
      await SyncQueueManager.enqueue('attendance', 'create', {
        studentId,
        date: targetDate,
        status,
        notes,
        markedBy: user.id
      });
      
      setAttendance(prev => [...prev, record]);
      
      return record;
    }
  };

  // Get attendance for a specific student
  const getStudentAttendance = (studentId: number): OfflineAttendance | undefined => {
    return attendance.find(att => att.studentId === studentId);
  };

  // Get attendance stats for the day
  const getStats = () => {
    const present = attendance.filter(att => att.status === 'present').length;
    const absent = attendance.filter(att => att.status === 'absent').length;
    const late = attendance.filter(att => att.status === 'late').length;
    const excused = attendance.filter(att => att.status === 'excused').length;
    const total = attendance.length;
    
    return { present, absent, late, excused, total };
  };

  return {
    attendance,
    loading,
    markAttendance,
    getStudentAttendance,
    getStats,
    refreshAttendance: fetchAndCache
  };
}

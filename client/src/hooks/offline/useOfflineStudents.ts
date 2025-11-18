import { useState, useEffect } from 'react';
import { offlineDb, OfflineStudent } from '@/lib/offline/db';
import { SyncQueueManager } from '@/lib/offline/syncQueue';
import { useOfflinePremium } from '@/contexts/offline/OfflinePremiumContext';
import { useAuth } from '@/contexts/AuthContext';

// ===========================
// 👨‍🎓 OFFLINE STUDENTS HOOK
// ===========================
// Manages offline storage and sync for students

export function useOfflineStudents() {
  const { user } = useAuth();
  const { isOnline, hasOfflineAccess } = useOfflinePremium();
  const [students, setStudents] = useState<OfflineStudent[]>([]);
  const [loading, setLoading] = useState(true);

  // Load students from IndexedDB
  const loadFromLocal = async () => {
    if (!user?.schoolId) return [];
    
    const localStudents = await offlineDb.students
      .where('schoolId')
      .equals(user.schoolId)
      .toArray();
    
    return localStudents;
  };

  // Fetch students from server and cache locally
  const fetchAndCache = async () => {
    if (!user?.schoolId) return;
    
    try {
      const response = await fetch('/api/director/students', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch students');
      
      const data = await response.json();
      const serverStudents = data.students || [];
      
      // Get local students with pending sync
      const pendingStudents = await offlineDb.students
        .where('schoolId')
        .equals(user.schoolId)
        .and(student => student.syncStatus === 'pending')
        .toArray();
      
      // Only delete synced students (preserve pending changes)
      await offlineDb.students
        .where('schoolId')
        .equals(user.schoolId)
        .and(student => student.syncStatus === 'synced')
        .delete();
      
      // Cache new data
      const studentsToCache = serverStudents.map((student: any) => ({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        classId: student.classId,
        className: student.className,
        schoolId: user.schoolId,
        parentPhone: student.parentPhone,
        parentEmail: student.parentEmail,
        photoUrl: student.photoUrl,
        lastModified: Date.now(),
        syncStatus: 'synced' as const,
        localOnly: false
      }));
      
      await offlineDb.students.bulkPut(studentsToCache);
      
      // Merge with pending changes
      const allStudents = [...studentsToCache, ...pendingStudents];
      
      return allStudents;
    } catch (error) {
      console.error('[OFFLINE_STUDENTS] Error fetching from server:', error);
      throw error;
    }
  };

  // Load students on mount
  useEffect(() => {
    async function loadStudents() {
      setLoading(true);
      
      if (!hasOfflineAccess) {
        setStudents([]);
        setLoading(false);
        return;
      }
      
      try {
        if (isOnline) {
          const fetched = await fetchAndCache();
          setStudents(fetched || []);
        } else {
          const local = await loadFromLocal();
          setStudents(local);
        }
      } catch (error) {
        console.error('[OFFLINE_STUDENTS] Error loading students:', error);
        const local = await loadFromLocal();
        setStudents(local);
      } finally {
        setLoading(false);
      }
    }
    
    loadStudents();
  }, [user?.schoolId, isOnline, hasOfflineAccess]);

  // Create student (offline-first)
  const createStudent = async (studentData: Partial<OfflineStudent>): Promise<OfflineStudent> => {
    if (!user?.schoolId) throw new Error('No school ID');
    
    const tempId = Date.now();
    
    const newStudent: OfflineStudent = {
      id: tempId,
      firstName: studentData.firstName!,
      lastName: studentData.lastName!,
      email: studentData.email,
      phone: studentData.phone,
      classId: studentData.classId,
      className: studentData.className,
      schoolId: user.schoolId,
      parentPhone: studentData.parentPhone,
      parentEmail: studentData.parentEmail,
      photoUrl: studentData.photoUrl,
      lastModified: Date.now(),
      syncStatus: isOnline ? 'synced' : 'pending',
      localOnly: !isOnline
    };
    
    await offlineDb.students.add(newStudent);
    
    await SyncQueueManager.enqueue('students', 'create', {
      firstName: newStudent.firstName,
      lastName: newStudent.lastName,
      email: newStudent.email,
      phone: newStudent.phone,
      classId: newStudent.classId,
      parentPhone: newStudent.parentPhone,
      parentEmail: newStudent.parentEmail
    }, undefined, tempId);
    
    setStudents(prev => [...prev, newStudent]);
    
    return newStudent;
  };

  // Update student (offline-first)
  const updateStudent = async (id: number, updates: Partial<OfflineStudent>): Promise<void> => {
    await offlineDb.students.update(id, {
      ...updates,
      lastModified: Date.now(),
      syncStatus: isOnline ? 'synced' : 'pending'
    });
    
    await SyncQueueManager.enqueue('students', 'update', updates, id);
    
    setStudents(prev => prev.map(student => 
      student.id === id ? { ...student, ...updates } : student
    ));
  };

  // Delete student (offline-first)
  const deleteStudent = async (id: number): Promise<void> => {
    await offlineDb.students.delete(id);
    await SyncQueueManager.enqueue('students', 'delete', {}, id);
    setStudents(prev => prev.filter(student => student.id !== id));
  };

  // Get students by class
  const getStudentsByClass = (classId: number): OfflineStudent[] => {
    return students.filter(student => student.classId === classId);
  };

  return {
    students,
    loading,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentsByClass,
    refreshStudents: fetchAndCache
  };
}

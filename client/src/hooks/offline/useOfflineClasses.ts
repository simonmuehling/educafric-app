import { useState, useEffect } from 'react';
import { offlineDb, OfflineClass } from '@/lib/offline/db';
import { SyncQueueManager } from '@/lib/offline/syncQueue';
import { useOfflinePremium } from '@/contexts/offline/OfflinePremiumContext';
import { useAuth } from '@/contexts/AuthContext';

// ===========================
// 🏫 OFFLINE CLASSES HOOK
// ===========================
// Manages offline storage and sync for classes

export function useOfflineClasses() {
  const { user } = useAuth();
  const { isOnline, hasOfflineAccess } = useOfflinePremium();
  const [classes, setClasses] = useState<OfflineClass[]>([]);
  const [loading, setLoading] = useState(true);

  // Load classes from IndexedDB
  const loadFromLocal = async () => {
    if (!user?.schoolId) return [];
    
    const localClasses = await offlineDb.classes
      .where('schoolId')
      .equals(user.schoolId)
      .toArray();
    
    return localClasses;
  };

  // Fetch classes from server and cache locally
  const fetchAndCache = async () => {
    if (!user?.schoolId) return;
    
    try {
      const response = await fetch('/api/director/classes', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch classes');
      
      const data = await response.json();
      const serverClasses = data.classes || [];
      
      // Get local classes with pending sync
      const pendingClasses = await offlineDb.classes
        .where('schoolId')
        .equals(user.schoolId)
        .and(cls => cls.syncStatus === 'pending')
        .toArray();
      
      // Only delete synced classes (preserve pending changes)
      await offlineDb.classes
        .where('schoolId')
        .equals(user.schoolId)
        .and(cls => cls.syncStatus === 'synced')
        .delete();
      
      // Cache new server data
      const classesToCache = serverClasses.map((cls: any) => ({
        id: cls.id,
        name: cls.name,
        level: cls.level,
        section: cls.section,
        maxStudents: cls.maxStudents || cls.capacity,
        teacherId: cls.teacherId,
        teacherName: cls.teacherName,
        room: cls.room,
        schoolId: user.schoolId,
        isActive: cls.isActive !== false,
        subjects: cls.subjects || [],
        lastModified: Date.now(),
        syncStatus: 'synced' as const,
        localOnly: false
      }));
      
      await offlineDb.classes.bulkPut(classesToCache);
      
      // Merge with pending changes
      const allClasses = [...classesToCache, ...pendingClasses];
      
      return allClasses;
    } catch (error) {
      console.error('[OFFLINE_CLASSES] Error fetching from server:', error);
      throw error;
    }
  };

  // Load classes on mount
  useEffect(() => {
    async function loadClasses() {
      setLoading(true);
      
      if (!hasOfflineAccess) {
        setClasses([]);
        setLoading(false);
        return;
      }
      
      try {
        if (isOnline) {
          // Online: fetch from server and cache
          const fetched = await fetchAndCache();
          setClasses(fetched || []);
        } else {
          // Offline: load from local cache
          const local = await loadFromLocal();
          setClasses(local);
        }
      } catch (error) {
        console.error('[OFFLINE_CLASSES] Error loading classes:', error);
        // Fallback to local data
        const local = await loadFromLocal();
        setClasses(local);
      } finally {
        setLoading(false);
      }
    }
    
    loadClasses();
  }, [user?.schoolId, isOnline, hasOfflineAccess]);

  // Create class (offline-first)
  const createClass = async (classData: Partial<OfflineClass>): Promise<OfflineClass> => {
    if (!user?.schoolId) throw new Error('No school ID');
    
    // Generate temporary ID for offline creation
    const tempId = Date.now();
    
    const newClass: OfflineClass = {
      id: tempId,
      name: classData.name!,
      level: classData.level,
      section: classData.section,
      maxStudents: classData.maxStudents,
      teacherId: classData.teacherId,
      teacherName: classData.teacherName,
      room: classData.room,
      schoolId: user.schoolId,
      isActive: true,
      subjects: classData.subjects || [],
      lastModified: Date.now(),
      syncStatus: isOnline ? 'synced' : 'pending',
      localOnly: !isOnline
    };
    
    // Save locally
    await offlineDb.classes.add(newClass);
    
    // Queue for sync
    await SyncQueueManager.enqueue('classes', 'create', {
      name: newClass.name,
      level: newClass.level,
      section: newClass.section,
      maxStudents: newClass.maxStudents,
      teacherId: newClass.teacherId,
      room: newClass.room,
      subjects: newClass.subjects
    }, undefined, tempId);
    
    // Update state
    setClasses(prev => [...prev, newClass]);
    
    return newClass;
  };

  // Update class (offline-first)
  const updateClass = async (id: number, updates: Partial<OfflineClass>): Promise<void> => {
    // Update locally
    await offlineDb.classes.update(id, {
      ...updates,
      lastModified: Date.now(),
      syncStatus: isOnline ? 'synced' : 'pending'
    });
    
    // Queue for sync
    await SyncQueueManager.enqueue('classes', 'update', updates, id);
    
    // Update state
    setClasses(prev => prev.map(cls => 
      cls.id === id ? { ...cls, ...updates } : cls
    ));
  };

  // Delete class (offline-first)
  const deleteClass = async (id: number): Promise<void> => {
    // Delete locally
    await offlineDb.classes.delete(id);
    
    // Queue for sync
    await SyncQueueManager.enqueue('classes', 'delete', {}, id);
    
    // Update state
    setClasses(prev => prev.filter(cls => cls.id !== id));
  };

  return {
    classes,
    loading,
    createClass,
    updateClass,
    deleteClass,
    refreshClasses: fetchAndCache
  };
}

import { useState, useEffect, useCallback, useContext } from 'react';
import { offlineDb, OfflineTeacher } from '@/lib/offline/db';
import { SyncQueueManager } from '@/lib/offline/syncQueue';
import { OfflinePremiumContext } from '@/contexts/offline/OfflinePremiumContext';
import { useToast } from '@/hooks/use-toast';

// ===========================
// 🧑‍🏫 OFFLINE TEACHERS HOOK
// ===========================
// Full CRUD offline support for Teachers module
// Supports: Create, Read, Update, Delete with sync queue

export function useOfflineTeachers(schoolId: number) {
  const [teachers, setTeachers] = useState<OfflineTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOnline, canAccessPremium } = useContext(OfflinePremiumContext);
  const { toast } = useToast();

  // ===========================
  // 📥 FETCH & CACHE FROM SERVER
  // ===========================
  const fetchAndCache = useCallback(async () => {
    if (!isOnline) {
      console.log('[OFFLINE_TEACHERS] Offline mode - loading from cache');
      return;
    }

    try {
      console.log('[OFFLINE_TEACHERS] Fetching teachers from server...');
      const response = await fetch('/api/director/teachers');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch teachers: ${response.status}`);
      }

      const data = await response.json();
      console.log('[OFFLINE_TEACHERS] Received teachers:', data.length);

      // Clear only synced records to preserve pending changes
      await offlineDb.teachers
        .where('schoolId').equals(schoolId)
        .and(t => t.syncStatus === 'synced')
        .delete();

      // Cache server data
      const teachersToCache: OfflineTeacher[] = data.map((teacher: any) => ({
        id: teacher.id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        phone: teacher.phone,
        subject: teacher.subject,
        classIds: teacher.classIds || [],
        schoolId: teacher.schoolId,
        qualifications: teacher.qualifications,
        photoUrl: teacher.photoUrl,
        lastModified: Date.now(),
        syncStatus: 'synced' as const,
        localOnly: false
      }));

      if (teachersToCache.length > 0) {
        await offlineDb.teachers.bulkPut(teachersToCache);
        console.log('[OFFLINE_TEACHERS] ✅ Cached', teachersToCache.length, 'teachers');
      }
    } catch (err) {
      console.error('[OFFLINE_TEACHERS] ❌ Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch teachers');
    }
  }, [isOnline, schoolId]);

  // ===========================
  // 📖 LOAD FROM INDEXEDDB
  // ===========================
  const loadFromCache = useCallback(async () => {
    try {
      setIsLoading(true);
      const cached = await offlineDb.teachers
        .where('schoolId').equals(schoolId)
        .sortBy('lastName');
      
      console.log('[OFFLINE_TEACHERS] 📦 Loaded', cached.length, 'teachers from cache');
      setTeachers(cached);
      setError(null);
    } catch (err) {
      console.error('[OFFLINE_TEACHERS] ❌ Load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load teachers');
    } finally {
      setIsLoading(false);
    }
  }, [schoolId]);

  // ===========================
  // 🔄 INITIAL LOAD & SYNC
  // ===========================
  useEffect(() => {
    const initialize = async () => {
      await loadFromCache();
      if (isOnline) {
        await fetchAndCache();
        await loadFromCache(); // Reload after fetch
      }
    };

    initialize();
  }, [loadFromCache, fetchAndCache, isOnline]);

  // ===========================
  // ➕ CREATE TEACHER
  // ===========================
  const createTeacher = useCallback(async (teacherData: Omit<OfflineTeacher, 'id' | 'lastModified' | 'syncStatus' | 'localOnly'>) => {
    if (!canAccessPremium) {
      toast({
        title: 'Accès Premium requis',
        description: 'Veuillez vous reconnecter pour continuer.',
        variant: 'destructive'
      });
      return null;
    }

    const tempId = Date.now();
    const newTeacher: OfflineTeacher = {
      ...teacherData,
      id: tempId,
      lastModified: Date.now(),
      syncStatus: 'pending',
      localOnly: !isOnline
    };

    try {
      // Save to IndexedDB
      await offlineDb.teachers.put(newTeacher);
      console.log('[OFFLINE_TEACHERS] ✅ Created teacher with tempId:', tempId);

      // Add to sync queue
      await SyncQueueManager.addToQueue({
        module: 'teachers',
        action: 'create',
        tempId,
        payload: teacherData,
        timestamp: Date.now(),
        retryCount: 0,
        synced: false
      });

      // Reload
      await loadFromCache();

      toast({
        title: 'Enseignant créé',
        description: isOnline ? 'Synchronisation en cours...' : 'Sera synchronisé lors de la reconnexion'
      });

      // Sync if online
      if (isOnline) {
        await SyncQueueManager.processQueue();
        await loadFromCache();
      }

      return newTeacher;
    } catch (err) {
      console.error('[OFFLINE_TEACHERS] ❌ Create error:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'enseignant',
        variant: 'destructive'
      });
      return null;
    }
  }, [canAccessPremium, isOnline, loadFromCache, toast]);

  // ===========================
  // ✏️ UPDATE TEACHER
  // ===========================
  const updateTeacher = useCallback(async (id: number, updates: Partial<OfflineTeacher>) => {
    if (!canAccessPremium) {
      toast({
        title: 'Accès Premium requis',
        description: 'Veuillez vous reconnecter pour continuer.',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const existing = await offlineDb.teachers.get(id);
      if (!existing) {
        throw new Error('Teacher not found');
      }

      const updated: OfflineTeacher = {
        ...existing,
        ...updates,
        lastModified: Date.now(),
        syncStatus: 'pending'
      };

      await offlineDb.teachers.put(updated);
      console.log('[OFFLINE_TEACHERS] ✅ Updated teacher:', id);

      // Add to sync queue
      await SyncQueueManager.addToQueue({
        module: 'teachers',
        action: 'update',
        entityId: id,
        payload: updates,
        timestamp: Date.now(),
        retryCount: 0,
        synced: false
      });

      await loadFromCache();

      toast({
        title: 'Enseignant modifié',
        description: isOnline ? 'Synchronisation en cours...' : 'Sera synchronisé lors de la reconnexion'
      });

      if (isOnline) {
        await SyncQueueManager.processQueue();
        await loadFromCache();
      }

      return true;
    } catch (err) {
      console.error('[OFFLINE_TEACHERS] ❌ Update error:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier l\'enseignant',
        variant: 'destructive'
      });
      return false;
    }
  }, [canAccessPremium, isOnline, loadFromCache, toast]);

  // ===========================
  // 🗑️ DELETE TEACHER
  // ===========================
  const deleteTeacher = useCallback(async (id: number) => {
    if (!canAccessPremium) {
      toast({
        title: 'Accès Premium requis',
        description: 'Veuillez vous reconnecter pour continuer.',
        variant: 'destructive'
      });
      return false;
    }

    try {
      await offlineDb.teachers.delete(id);
      console.log('[OFFLINE_TEACHERS] ✅ Deleted teacher:', id);

      // Add to sync queue
      await SyncQueueManager.addToQueue({
        module: 'teachers',
        action: 'delete',
        entityId: id,
        payload: { id },
        timestamp: Date.now(),
        retryCount: 0,
        synced: false
      });

      await loadFromCache();

      toast({
        title: 'Enseignant supprimé',
        description: isOnline ? 'Synchronisation en cours...' : 'Sera synchronisé lors de la reconnexion'
      });

      if (isOnline) {
        await SyncQueueManager.processQueue();
        await loadFromCache();
      }

      return true;
    } catch (err) {
      console.error('[OFFLINE_TEACHERS] ❌ Delete error:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'enseignant',
        variant: 'destructive'
      });
      return false;
    }
  }, [canAccessPremium, isOnline, loadFromCache, toast]);

  return {
    teachers,
    isLoading,
    error,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    refresh: loadFromCache
  };
}

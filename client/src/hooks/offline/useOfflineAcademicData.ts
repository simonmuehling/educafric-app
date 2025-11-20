import { useState, useEffect, useCallback } from 'react';
import { offlineDb, OfflineAcademicData } from '@/lib/offline/db';
import { SyncQueueManager } from '@/lib/offline/syncQueue';
import { useOfflinePremium } from '@/contexts/offline/OfflinePremiumContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useOfflineAcademicData() {
  const { user } = useAuth();
  const { isOnline, hasOfflineAccess } = useOfflinePremium();
  const { toast } = useToast();
  const [academicData, setAcademicData] = useState<OfflineAcademicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFromLocal = async () => {
    if (!user?.schoolId) return [];
    
    const localData = await offlineDb.academicData
      .where('schoolId')
      .equals(user.schoolId)
      .reverse()
      .sortBy('lastModified');
    
    return localData;
  };

  const fetchAndCache = async () => {
    if (!user?.schoolId) return;
    
    try {
      const response = await fetch('/api/academic-bulletins/bulletins', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch academic data');
      
      const result = await response.json();
      const serverData = result.data || [];
      
      const pendingData = await offlineDb.academicData
        .where('schoolId')
        .equals(user.schoolId)
        .and(item => item.syncStatus === 'pending')
        .toArray();
      
      await offlineDb.academicData
        .where('schoolId')
        .equals(user.schoolId)
        .and(item => item.syncStatus === 'synced')
        .delete();
      
      const dataToCache: OfflineAcademicData[] = serverData.map((item: any) => ({
        id: item.id,
        type: 'bulletin' as const,
        studentId: item.studentId,
        classId: item.classId,
        term: item.term || item.trimester,
        data: item,
        schoolId: user.schoolId,
        lastModified: Date.now(),
        syncStatus: 'synced' as const,
        localOnly: false
      }));
      
      if (dataToCache.length > 0) {
        await offlineDb.academicData.bulkPut(dataToCache);
      }
      
      const allData = [...dataToCache, ...pendingData];
      return allData;
    } catch (error) {
      console.error('[OFFLINE_ACADEMIC_DATA] Error fetching from server:', error);
      throw error;
    }
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      if (!hasOfflineAccess) {
        setAcademicData([]);
        setLoading(false);
        return;
      }
      
      try {
        if (isOnline) {
          const fetched = await fetchAndCache();
          setAcademicData(fetched || []);
        } else {
          const local = await loadFromLocal();
          setAcademicData(local);
        }
      } catch (error) {
        console.error('[OFFLINE_ACADEMIC_DATA] Error loading data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load data');
        const local = await loadFromLocal();
        setAcademicData(local);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [user?.schoolId, isOnline, hasOfflineAccess]);

  const createBulletin = useCallback(async (bulletinData: Partial<OfflineAcademicData>): Promise<OfflineAcademicData | null> => {
    if (!user?.schoolId) {
      toast({
        title: 'Erreur',
        description: 'ID école manquant',
        variant: 'destructive'
      });
      return null;
    }

    if (!hasOfflineAccess) {
      toast({
        title: 'Accès Premium requis',
        description: 'Veuillez vous reconnecter pour continuer.',
        variant: 'destructive'
      });
      return null;
    }
    
    const tempId = Date.now();
    
    const newBulletin: OfflineAcademicData = {
      id: tempId,
      type: bulletinData.type || 'bulletin',
      studentId: bulletinData.studentId,
      classId: bulletinData.classId,
      term: bulletinData.term,
      data: bulletinData.data || {},
      schoolId: user.schoolId,
      lastModified: Date.now(),
      syncStatus: 'pending',
      localOnly: !isOnline
    };
    
    try {
      await offlineDb.academicData.add(newBulletin);
      
      try {
        const payload = {
          ...bulletinData.data,
          studentId: bulletinData.studentId,
          studentName: bulletinData.data?.studentName,
          classLabel: bulletinData.data?.classLabel,
          trimester: bulletinData.term,
          academicYear: bulletinData.data?.academicYear,
          subjects: bulletinData.data?.subjects || [],
          discipline: bulletinData.data?.discipline
        };
        await SyncQueueManager.enqueue('academicData', 'create', payload, undefined, tempId);
      } catch (queueError) {
        console.error('[OFFLINE_ACADEMIC_DATA] Queue error, rolling back:', queueError);
        await offlineDb.academicData.delete(tempId);
        throw queueError;
      }
      
      const updated = await loadFromLocal();
      setAcademicData(updated);
      
      toast({
        title: 'Bulletin créé',
        description: isOnline ? 'Enregistré avec succès' : 'Sera synchronisé lors de la reconnexion'
      });
      
      if (isOnline) {
        await SyncQueueManager.processQueue();
        const refreshed = await loadFromLocal();
        setAcademicData(refreshed);
      }
      
      return newBulletin;
    } catch (error) {
      console.error('[OFFLINE_ACADEMIC_DATA] Create error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le bulletin',
        variant: 'destructive'
      });
      return null;
    }
  }, [user?.schoolId, isOnline, hasOfflineAccess, toast]);

  const updateBulletin = useCallback(async (id: number, updates: Partial<OfflineAcademicData>): Promise<boolean> => {
    if (!hasOfflineAccess) {
      toast({
        title: 'Accès Premium requis',
        description: 'Veuillez vous reconnecter pour continuer.',
        variant: 'destructive'
      });
      return false;
    }

    const original = await offlineDb.academicData.get(id);
    if (!original) {
      toast({
        title: 'Erreur',
        description: 'Bulletin introuvable',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const updateData = {
        ...updates,
        lastModified: Date.now(),
        syncStatus: 'pending' as const
      };
      
      await offlineDb.academicData.update(id, updateData);
      
      try {
        const payload = {
          ...original.data,
          ...updates.data,
          id,
          studentId: updates.studentId ?? original.studentId,
          classLabel: updates.data?.classLabel ?? original.data?.classLabel,
          trimester: updates.term ?? original.term,
          academicYear: updates.data?.academicYear ?? original.data?.academicYear,
          subjects: updates.data?.subjects ?? original.data?.subjects,
          discipline: updates.data?.discipline ?? original.data?.discipline
        };
        await SyncQueueManager.enqueue('academicData', 'update', payload, id);
      } catch (queueError) {
        console.error('[OFFLINE_ACADEMIC_DATA] Queue error, rolling back update:', queueError);
        await offlineDb.academicData.put(original);
        const rolled = await loadFromLocal();
        setAcademicData(rolled);
        throw queueError;
      }
      
      const updated = await loadFromLocal();
      setAcademicData(updated);

      toast({
        title: 'Bulletin modifié',
        description: isOnline ? 'Enregistré avec succès' : 'Sera synchronisé lors de la reconnexion'
      });
      
      if (isOnline) {
        await SyncQueueManager.processQueue();
        const refreshed = await loadFromLocal();
        setAcademicData(refreshed);
      }
      
      return true;
    } catch (error) {
      console.error('[OFFLINE_ACADEMIC_DATA] Update error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le bulletin',
        variant: 'destructive'
      });
      return false;
    }
  }, [isOnline, hasOfflineAccess, toast]);

  const deleteBulletin = useCallback(async (id: number): Promise<boolean> => {
    if (!hasOfflineAccess) {
      toast({
        title: 'Accès Premium requis',
        description: 'Veuillez vous reconnecter pour continuer.',
        variant: 'destructive'
      });
      return false;
    }

    const original = await offlineDb.academicData.get(id);
    if (!original) {
      toast({
        title: 'Erreur',
        description: 'Bulletin introuvable',
        variant: 'destructive'
      });
      return false;
    }

    try {
      await offlineDb.academicData.delete(id);
      
      try {
        await SyncQueueManager.enqueue('academicData', 'delete', { id }, id);
      } catch (queueError) {
        console.error('[OFFLINE_ACADEMIC_DATA] Queue error, restoring deleted item:', queueError);
        await offlineDb.academicData.put(original);
        const rolled = await loadFromLocal();
        setAcademicData(rolled);
        throw queueError;
      }
      
      const updated = await loadFromLocal();
      setAcademicData(updated);

      toast({
        title: 'Bulletin supprimé',
        description: isOnline ? 'Supprimé avec succès' : 'Sera synchronisé lors de la reconnexion'
      });
      
      if (isOnline) {
        await SyncQueueManager.processQueue();
        const refreshed = await loadFromLocal();
        setAcademicData(refreshed);
      }
      
      return true;
    } catch (error) {
      console.error('[OFFLINE_ACADEMIC_DATA] Delete error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le bulletin',
        variant: 'destructive'
      });
      return false;
    }
  }, [isOnline, hasOfflineAccess, toast]);

  const getBulletinsByClass = useCallback((classId: number): OfflineAcademicData[] => {
    return academicData.filter(item => item.classId === classId);
  }, [academicData]);

  const getBulletinsByStudent = useCallback((studentId: number): OfflineAcademicData[] => {
    return academicData.filter(item => item.studentId === studentId);
  }, [academicData]);

  const getBulletinsByTerm = useCallback((term: string): OfflineAcademicData[] => {
    return academicData.filter(item => item.term === term);
  }, [academicData]);

  return {
    academicData,
    loading,
    error,
    createBulletin,
    updateBulletin,
    deleteBulletin,
    getBulletinsByClass,
    getBulletinsByStudent,
    getBulletinsByTerm,
    refreshAcademicData: fetchAndCache
  };
}

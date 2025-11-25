import { useState, useEffect, useCallback } from 'react';
import { useOfflinePremium } from '@/contexts/offline/OfflinePremiumContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { offlineDb } from '@/lib/offline/db';
import { SyncQueueManager } from '@/lib/offline/syncQueue';

export interface OfflineFirstOptions<T> {
  module: 'classes' | 'students' | 'teachers' | 'academicData';
  apiEndpoint: string;
  responseKey: string;
  mapToOffline: (item: any, schoolId: number) => T;
  mapToPayload: (item: T) => any;
}

export function useOfflineFirstData<T extends { id: number; syncStatus?: string }>(
  options: OfflineFirstOptions<T>
) {
  const { user } = useAuth();
  const { isOnline, hasOfflineAccess, pendingSyncCount } = useOfflinePremium();
  const { toast } = useToast();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const schoolId = user?.schoolId;

  const loadFromLocal = useCallback(async (): Promise<T[]> => {
    if (!schoolId) return [];
    
    const table = offlineDb[options.module] as any;
    const localData = await table
      .where('schoolId')
      .equals(schoolId)
      .toArray();
    
    console.log(`[OFFLINE_FIRST_${options.module.toUpperCase()}] 📦 Loaded ${localData.length} from cache`);
    return localData;
  }, [schoolId, options.module]);

  const fetchAndCache = useCallback(async (): Promise<T[]> => {
    if (!schoolId) return [];
    
    try {
      console.log(`[OFFLINE_FIRST_${options.module.toUpperCase()}] 🔄 Fetching from server...`);
      const response = await fetch(options.apiEndpoint, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error(`Failed to fetch ${options.module}`);
      
      const result = await response.json();
      const serverData = result[options.responseKey] || result.data || [];
      
      const table = offlineDb[options.module] as any;
      
      const pendingData = await table
        .where('schoolId')
        .equals(schoolId)
        .and((item: any) => item.syncStatus === 'pending')
        .toArray();
      
      await table
        .where('schoolId')
        .equals(schoolId)
        .and((item: any) => item.syncStatus === 'synced')
        .delete();
      
      const dataToCache = serverData.map((item: any) => options.mapToOffline(item, schoolId));
      
      if (dataToCache.length > 0) {
        await table.bulkPut(dataToCache);
      }
      
      console.log(`[OFFLINE_FIRST_${options.module.toUpperCase()}] ✅ Cached ${dataToCache.length} items`);
      return [...dataToCache, ...pendingData];
    } catch (error) {
      console.error(`[OFFLINE_FIRST_${options.module.toUpperCase()}] ❌ Fetch error:`, error);
      throw error;
    }
  }, [schoolId, options]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (isOnline) {
        const fetched = await fetchAndCache();
        setData(fetched);
      } else {
        const local = await loadFromLocal();
        setData(local);
      }
      setError(null);
    } catch (err) {
      console.error(`[OFFLINE_FIRST_${options.module.toUpperCase()}] Error:`, err);
      const local = await loadFromLocal();
      setData(local);
      if (local.length === 0) {
        setError(err instanceof Error ? err.message : 'Error loading data');
      }
    } finally {
      setLoading(false);
    }
  }, [isOnline, fetchAndCache, loadFromLocal, options.module]);

  useEffect(() => {
    if (hasOfflineAccess) {
      refresh();
    } else {
      setData([]);
      setLoading(false);
    }
  }, [schoolId, isOnline, hasOfflineAccess]);

  const create = useCallback(async (itemData: Partial<T>): Promise<T | null> => {
    if (!schoolId) {
      toast({
        title: 'Erreur',
        description: 'ID école manquant',
        variant: 'destructive'
      });
      return null;
    }

    const tempId = Date.now();
    const newItem = {
      ...itemData,
      id: tempId,
      schoolId,
      lastModified: Date.now(),
      syncStatus: 'pending',
      localOnly: !isOnline
    } as unknown as T;

    try {
      const table = offlineDb[options.module] as any;
      await table.add(newItem);
      
      const payload = options.mapToPayload(newItem);
      await SyncQueueManager.enqueue(options.module, 'create', payload, undefined, tempId);
      
      setData(prev => [...prev, newItem]);
      
      toast({
        title: isOnline ? '✅ Créé avec succès' : '📴 Créé localement',
        description: isOnline 
          ? 'Synchronisé avec le serveur' 
          : 'Sera synchronisé à la reconnexion'
      });

      if (isOnline) {
        await SyncQueueManager.processQueue();
        await refresh();
      }

      return newItem;
    } catch (err) {
      console.error(`[OFFLINE_FIRST_${options.module.toUpperCase()}] Create error:`, err);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer',
        variant: 'destructive'
      });
      return null;
    }
  }, [schoolId, isOnline, options, toast, refresh]);

  const update = useCallback(async (id: number, updates: Partial<T>): Promise<boolean> => {
    try {
      const table = offlineDb[options.module] as any;
      await table.update(id, {
        ...updates,
        lastModified: Date.now(),
        syncStatus: 'pending'
      });

      const updatedItem = await table.get(id);
      if (updatedItem) {
        const payload = options.mapToPayload(updatedItem);
        await SyncQueueManager.enqueue(options.module, 'update', payload, id);
      }

      setData(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));

      toast({
        title: isOnline ? '✅ Modifié avec succès' : '📴 Modifié localement',
        description: isOnline 
          ? 'Synchronisé avec le serveur' 
          : 'Sera synchronisé à la reconnexion'
      });

      if (isOnline) {
        await SyncQueueManager.processQueue();
      }

      return true;
    } catch (err) {
      console.error(`[OFFLINE_FIRST_${options.module.toUpperCase()}] Update error:`, err);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier',
        variant: 'destructive'
      });
      return false;
    }
  }, [isOnline, options, toast]);

  const remove = useCallback(async (id: number): Promise<boolean> => {
    try {
      const table = offlineDb[options.module] as any;
      await table.delete(id);
      
      await SyncQueueManager.enqueue(options.module, 'delete', { id }, id);

      setData(prev => prev.filter(item => item.id !== id));

      toast({
        title: isOnline ? '✅ Supprimé avec succès' : '📴 Supprimé localement',
        description: isOnline 
          ? 'Synchronisé avec le serveur' 
          : 'Sera synchronisé à la reconnexion'
      });

      if (isOnline) {
        await SyncQueueManager.processQueue();
      }

      return true;
    } catch (err) {
      console.error(`[OFFLINE_FIRST_${options.module.toUpperCase()}] Delete error:`, err);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer',
        variant: 'destructive'
      });
      return false;
    }
  }, [isOnline, options, toast]);

  return {
    data,
    loading,
    error,
    isOnline,
    pendingSyncCount,
    create,
    update,
    remove,
    refresh
  };
}

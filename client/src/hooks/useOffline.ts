// Custom hook for offline functionality
import { useState, useEffect, useCallback } from 'react';
import { offlineStorage } from '@/services/offlineStorage';
import { offlineSync, SyncStatus } from '@/services/offlineSync';

export interface OfflineState {
  isOnline: boolean;
  isOfflineMode: boolean;
  queueSize: number;
  isSyncing: boolean;
  lastSyncTime: number | null;
}

export function useOffline() {
  const [state, setState] = useState<OfflineState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isOfflineMode: false,
    queueSize: 0,
    isSyncing: false,
    lastSyncTime: null
  });

  // Update online status
  const handleOnlineStatus = useCallback(() => {
    setState(prev => ({ ...prev, isOnline: navigator.onLine }));
  }, []);

  // Update sync status
  const handleSyncStatus = useCallback((syncStatus: SyncStatus) => {
    setState(prev => ({
      ...prev,
      queueSize: syncStatus.queueSize,
      isSyncing: syncStatus.isSyncing,
      lastSyncTime: syncStatus.lastSyncTime
    }));
  }, []);

  useEffect(() => {
    // Listen for online/offline events
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Listen for sync status updates
    offlineSync.addListener(handleSyncStatus);

    // Initial status fetch
    offlineSync.getStatus().then(handleSyncStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      offlineSync.removeListener(handleSyncStatus);
    };
  }, [handleOnlineStatus, handleSyncStatus]);

  // Queue an action for offline sync
  const queueAction = useCallback(async (
    type: 'attendance' | 'grade' | 'homework' | 'message' | 'assignment',
    action: 'create' | 'update' | 'delete',
    data: any,
    userId: number
  ) => {
    try {
      await offlineStorage.queueAction({
        type,
        action,
        data,
        userId,
        synced: false
      });
      
      // Update queue size
      const status = await offlineSync.getStatus();
      handleSyncStatus(status);
      
      console.log('[OFFLINE] Action queued successfully');
      return true;
    } catch (error) {
      console.error('[OFFLINE] Failed to queue action:', error);
      return false;
    }
  }, [handleSyncStatus]);

  // Manually trigger sync
  const triggerSync = useCallback(async () => {
    const success = await offlineSync.triggerSync();
    const status = await offlineSync.getStatus();
    handleSyncStatus(status);
    return success;
  }, [handleSyncStatus]);

  // Cache data for offline access
  const cacheData = useCallback(async (type: string, data: any, ttlMinutes: number = 60) => {
    try {
      await offlineStorage.cacheData(type, data, ttlMinutes);
      return true;
    } catch (error) {
      console.error('[OFFLINE] Failed to cache data:', error);
      return false;
    }
  }, []);

  // Get cached data
  const getCachedData = useCallback(async (type: string) => {
    try {
      return await offlineStorage.getCachedData(type);
    } catch (error) {
      console.error('[OFFLINE] Failed to get cached data:', error);
      return null;
    }
  }, []);

  return {
    ...state,
    queueAction,
    triggerSync,
    cacheData,
    getCachedData
  };
}

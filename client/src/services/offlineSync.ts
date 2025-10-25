// Educafric Offline Sync Service
// Handles synchronization of offline actions when connection is restored

import { offlineStorage, OfflineQueueItem } from './offlineStorage';
import { apiRequest } from '@/lib/queryClient';

export interface SyncStatus {
  isSyncing: boolean;
  queueSize: number;
  lastSyncTime: number | null;
  syncErrors: number;
}

class OfflineSyncService {
  private isSyncing = false;
  private syncInterval: number | null = null;
  private listeners: Set<(status: SyncStatus) => void> = new Set();
  private lastSyncTime: number | null = null;
  private syncErrors = 0;
  private maxRetries = 3;

  constructor() {
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
      
      // Auto-sync on initialization if online
      if (navigator.onLine) {
        this.handleOnline();
      }
    }
  }

  private async handleOnline() {
    if (import.meta.env.DEV) {
      console.log('[SYNC] Connection restored, starting sync...');
    }
    try {
      // Ensure database is initialized before syncing
      await offlineStorage.init();
      await this.syncAll();
      this.startPeriodicSync();
    } catch (error) {
      // Better error logging
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[SYNC] Failed to initialize sync:', errorMessage);
      if (import.meta.env.DEV && error instanceof Error && error.stack) {
        console.error('[SYNC] Stack trace:', error.stack);
      }
    }
  }

  private handleOffline() {
    console.log('[SYNC] Connection lost');
    this.stopPeriodicSync();
  }

  // Start periodic sync (every 5 minutes when online)
  startPeriodicSync() {
    if (this.syncInterval) return;
    
    this.syncInterval = window.setInterval(() => {
      if (navigator.onLine) {
        this.syncAll();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Sync all pending actions
  async syncAll(): Promise<boolean> {
    if (this.isSyncing) {
      if (import.meta.env.DEV) {
        console.log('[SYNC] Sync already in progress');
      }
      return false;
    }

    if (!navigator.onLine) {
      if (import.meta.env.DEV) {
        console.log('[SYNC] Cannot sync while offline');
      }
      return false;
    }

    this.isSyncing = true;
    this.notifyListeners();

    try {
      // Ensure database is initialized before attempting sync
      await offlineStorage.init();
      
      const pendingActions = await offlineStorage.getPendingActions();
      if (import.meta.env.DEV && pendingActions.length > 0) {
        console.log('[SYNC] Found', pendingActions.length, 'pending actions');
      }

      if (pendingActions.length === 0) {
        this.lastSyncTime = Date.now();
        this.isSyncing = false;
        this.notifyListeners();
        return true;
      }

      let successCount = 0;
      let failCount = 0;

      for (const action of pendingActions) {
        try {
          const success = await this.syncAction(action);
          if (success) {
            await offlineStorage.deleteAction(action.id);
            successCount++;
          } else {
            await offlineStorage.incrementRetryCount(action.id);
            failCount++;
            
            // Delete if max retries exceeded
            if (action.retries >= this.maxRetries) {
              console.warn('[SYNC] Max retries exceeded for action', action.id, '- removing from queue');
              await offlineStorage.deleteAction(action.id);
              this.syncErrors++;
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error('[SYNC] Error syncing action:', errorMessage);
          await offlineStorage.incrementRetryCount(action.id);
          failCount++;
        }
      }

      if (import.meta.env.DEV) {
        console.log(`[SYNC] Sync complete: ${successCount} succeeded, ${failCount} failed`);
      }
      
      this.lastSyncTime = Date.now();
      this.isSyncing = false;
      this.notifyListeners();

      return failCount === 0;
    } catch (error) {
      // Better error logging with actual error message
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[SYNC] Sync failed:', errorMessage);
      if (import.meta.env.DEV && error instanceof Error && error.stack) {
        console.error('[SYNC] Stack trace:', error.stack);
      }
      this.isSyncing = false;
      this.syncErrors++;
      this.notifyListeners();
      return false;
    }
  }

  // Sync a single action
  private async syncAction(action: OfflineQueueItem): Promise<boolean> {
    try {
      const endpoint = this.getEndpointForAction(action);
      const method = this.getMethodForAction(action.action);

      if (import.meta.env.DEV) {
        console.log('[SYNC] Syncing', action.type, action.action, 'to', endpoint);
      }

      const response = await apiRequest(method, endpoint, action.data);

      if (response.ok) {
        if (import.meta.env.DEV) {
          console.log('[SYNC] ✓ Action synced successfully:', action.type);
        }
        return true;
      } else {
        console.error('[SYNC] ✗ Action sync failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[SYNC] ✗ Action sync error:', errorMessage);
      return false;
    }
  }

  // Get API endpoint for action type
  private getEndpointForAction(action: OfflineQueueItem): string {
    const baseEndpoints: Record<string, string> = {
      'attendance': '/api/attendance',
      'grade': '/api/grades',
      'homework': '/api/homework',
      'message': '/api/messages',
      'assignment': '/api/homework'
    };

    const base = baseEndpoints[action.type] || '/api/sync';
    
    if (action.action === 'update' || action.action === 'delete') {
      return `${base}/${action.data.id}`;
    }
    
    return base;
  }

  // Get HTTP method for action
  private getMethodForAction(action: 'create' | 'update' | 'delete'): string {
    const methods = {
      'create': 'POST',
      'update': 'PUT',
      'delete': 'DELETE'
    };
    return methods[action];
  }

  // Get current sync status
  async getStatus(): Promise<SyncStatus> {
    const queueSize = await offlineStorage.getQueueSize();
    return {
      isSyncing: this.isSyncing,
      queueSize,
      lastSyncTime: this.lastSyncTime,
      syncErrors: this.syncErrors
    };
  }

  // Add status listener
  addListener(callback: (status: SyncStatus) => void) {
    this.listeners.add(callback);
  }

  // Remove status listener
  removeListener(callback: (status: SyncStatus) => void) {
    this.listeners.delete(callback);
  }

  // Notify all listeners of status change
  private async notifyListeners() {
    const status = await this.getStatus();
    this.listeners.forEach(listener => listener(status));
  }

  // Manual trigger for sync
  async triggerSync(): Promise<boolean> {
    return this.syncAll();
  }

  // Clear sync errors
  clearErrors() {
    this.syncErrors = 0;
    this.notifyListeners();
  }
}

// Export singleton instance
export const offlineSync = new OfflineSyncService();

// Note: Auto-sync and periodic sync are now handled in constructor

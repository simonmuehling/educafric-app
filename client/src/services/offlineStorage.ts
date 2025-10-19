// Educafric Offline Storage Manager
// IndexedDB-based storage for offline-first functionality in poor connectivity areas

interface OfflineStorageDB extends IDBDatabase {
  // TypeScript type for the database
}

export interface OfflineQueueItem {
  id: string;
  type: 'attendance' | 'grade' | 'homework' | 'message' | 'assignment';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  synced: boolean;
  userId: number;
  retries: number;
}

export interface CachedData {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  expiresAt: number;
}

class OfflineStorageManager {
  private dbName = 'educafric-offline';
  private dbVersion = 2;
  private db: IDBDatabase | null = null;

  // Initialize IndexedDB
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('[OFFLINE] Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[OFFLINE] Database initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        console.log('[OFFLINE] Upgrading database...');

        // Create object stores
        if (!db.objectStoreNames.contains('offlineQueue')) {
          const queueStore = db.createObjectStore('offlineQueue', { keyPath: 'id' });
          queueStore.createIndex('synced', 'synced', { unique: false });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('cachedData')) {
          const cacheStore = db.createObjectStore('cachedData', { keyPath: 'id' });
          cacheStore.createIndex('type', 'type', { unique: false });
          cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('userPreferences')) {
          db.createObjectStore('userPreferences', { keyPath: 'userId' });
        }

        console.log('[OFFLINE] Database upgraded successfully');
      };
    });
  }

  // Queue an action for offline sync
  async queueAction(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    if (!this.db) await this.init();

    const queueItem: OfflineQueueItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineQueue'], 'readwrite');
      const store = transaction.objectStore('offlineQueue');
      const request = store.add(queueItem);

      request.onsuccess = () => {
        console.log('[OFFLINE] Action queued:', queueItem.type, queueItem.action);
        resolve();
      };

      request.onerror = () => {
        console.error('[OFFLINE] Failed to queue action:', request.error);
        reject(request.error);
      };
    });
  }

  // Get all pending offline actions
  async getPendingActions(): Promise<OfflineQueueItem[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineQueue'], 'readonly');
      const store = transaction.objectStore('offlineQueue');
      const index = store.index('synced');
      const request = index.getAll(IDBKeyRange.only(false));

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('[OFFLINE] Failed to get pending actions:', request.error);
        reject(request.error);
      };
    });
  }

  // Mark action as synced
  async markActionSynced(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineQueue'], 'readwrite');
      const store = transaction.objectStore('offlineQueue');
      const request = store.get(id);

      request.onsuccess = () => {
        const item = request.result;
        if (item) {
          item.synced = true;
          const updateRequest = store.put(item);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Delete synced action
  async deleteAction(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineQueue'], 'readwrite');
      const store = transaction.objectStore('offlineQueue');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Cache data for offline access
  async cacheData(type: string, data: any, ttlMinutes: number = 60): Promise<void> {
    if (!this.db) await this.init();

    const cachedItem: CachedData = {
      id: `${type}-${Date.now()}`,
      type,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (ttlMinutes * 60 * 1000)
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readwrite');
      const store = transaction.objectStore('cachedData');
      const request = store.put(cachedItem);

      request.onsuccess = () => {
        console.log('[OFFLINE] Data cached:', type);
        resolve();
      };

      request.onerror = () => {
        console.error('[OFFLINE] Failed to cache data:', request.error);
        reject(request.error);
      };
    });
  }

  // Get cached data by type
  async getCachedData(type: string): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readonly');
      const store = transaction.objectStore('cachedData');
      const index = store.index('type');
      const request = index.getAll(type);

      request.onsuccess = () => {
        const items = request.result || [];
        // Get most recent non-expired item
        const now = Date.now();
        const validItems = items.filter((item: CachedData) => item.expiresAt > now);
        
        if (validItems.length > 0) {
          // Sort by timestamp descending and get the latest
          validItems.sort((a: CachedData, b: CachedData) => b.timestamp - a.timestamp);
          resolve(validItems[0].data);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('[OFFLINE] Failed to get cached data:', request.error);
        reject(request.error);
      };
    });
  }

  // Clean up expired cache
  async cleanExpiredCache(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readwrite');
      const store = transaction.objectStore('cachedData');
      const index = store.index('expiresAt');
      const now = Date.now();
      const range = IDBKeyRange.upperBound(now);
      const request = index.openCursor(range);

      let deletedCount = 0;

      request.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          if (deletedCount > 0) {
            console.log('[OFFLINE] Cleaned up', deletedCount, 'expired cache entries');
          }
          resolve();
        }
      };

      request.onerror = () => {
        console.error('[OFFLINE] Failed to clean cache:', request.error);
        reject(request.error);
      };
    });
  }

  // Get queue size
  async getQueueSize(): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineQueue'], 'readonly');
      const store = transaction.objectStore('offlineQueue');
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all offline data
  async clearAll(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineQueue', 'cachedData'], 'readwrite');
      
      const queueStore = transaction.objectStore('offlineQueue');
      const cacheStore = transaction.objectStore('cachedData');

      const clearQueue = queueStore.clear();
      const clearCache = cacheStore.clear();

      transaction.oncomplete = () => {
        console.log('[OFFLINE] All offline data cleared');
        resolve();
      };

      transaction.onerror = () => {
        console.error('[OFFLINE] Failed to clear data:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  // Increment retry count
  async incrementRetryCount(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineQueue'], 'readwrite');
      const store = transaction.objectStore('offlineQueue');
      const request = store.get(id);

      request.onsuccess = () => {
        const item = request.result;
        if (item) {
          item.retries = (item.retries || 0) + 1;
          const updateRequest = store.put(item);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageManager();

// Initialize on import (non-blocking)
offlineStorage.init().catch(err => {
  console.error('[OFFLINE] Failed to initialize offline storage:', err);
});

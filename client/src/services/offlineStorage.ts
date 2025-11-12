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

// Note: Profile/settings/preferences are cached for viewing offline but not queued for editing
// Users can view their data offline, but edits require internet connection

export interface CachedData {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  expiresAt: number;
}

class OfflineStorageManager {
  private dbName = 'educafric-offline';
  private dbVersion = 3;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  // Initialize IndexedDB - idempotent with shared pending promise
  async init(): Promise<void> {
    // If already initialized, return immediately
    if (this.db) {
      return Promise.resolve();
    }

    // If initialization is in progress, wait for it
    if (this.initPromise) {
      return this.initPromise;
    }

    // Start new initialization
    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('[OFFLINE] Failed to open database:', request.error);
        this.initPromise = null; // Allow retry on failure
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[OFFLINE] Database initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        const transaction = event.target.transaction;
        console.log('[OFFLINE] Upgrading database...');

        // Create or upgrade offlineQueue object store
        let queueStore;
        if (!db.objectStoreNames.contains('offlineQueue')) {
          queueStore = db.createObjectStore('offlineQueue', { keyPath: 'id' });
          queueStore.createIndex('synced', 'synced', { unique: false });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        } else {
          // Object store exists, check if indexes need to be created
          queueStore = transaction.objectStore('offlineQueue');
          if (!queueStore.indexNames.contains('synced')) {
            queueStore.createIndex('synced', 'synced', { unique: false });
          }
          if (!queueStore.indexNames.contains('timestamp')) {
            queueStore.createIndex('timestamp', 'timestamp', { unique: false });
          }
        }

        // Create or upgrade cachedData object store
        let cacheStore;
        if (!db.objectStoreNames.contains('cachedData')) {
          cacheStore = db.createObjectStore('cachedData', { keyPath: 'id' });
          cacheStore.createIndex('type', 'type', { unique: false });
          cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        } else {
          cacheStore = transaction.objectStore('cachedData');
          if (!cacheStore.indexNames.contains('type')) {
            cacheStore.createIndex('type', 'type', { unique: false });
          }
          if (!cacheStore.indexNames.contains('expiresAt')) {
            cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
          }
        }

        // Create userPreferences object store if needed
        if (!db.objectStoreNames.contains('userPreferences')) {
          db.createObjectStore('userPreferences', { keyPath: 'userId' });
        }

        console.log('[OFFLINE] Database upgraded successfully');
      };
    });

    return this.initPromise;
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
      
      // Check if index exists before trying to use it
      if (store.indexNames.contains('synced')) {
        const index = store.index('synced');
        const request = index.getAll(IDBKeyRange.only(false));

        request.onsuccess = () => {
          resolve(request.result || []);
        };

        request.onerror = (event) => {
          // Prevent transaction from auto-aborting so fallback can proceed
          event.preventDefault();
          
          if (import.meta.env.DEV) {
            console.warn('[OFFLINE] Index query failed, falling back to full scan:', request.error);
          }
          // Fallback: get all items and filter manually
          const fallbackRequest = store.getAll();
          fallbackRequest.onsuccess = () => {
            const allItems = fallbackRequest.result || [];
            const pendingItems = allItems.filter((item: OfflineQueueItem) => item.synced === false);
            resolve(pendingItems);
          };
          fallbackRequest.onerror = () => {
            console.error('[OFFLINE] Failed to get pending actions (fallback also failed):', fallbackRequest.error);
            reject(fallbackRequest.error);
          };
        };
      } else {
        // Index doesn't exist yet (during migration), use fallback
        const fallbackRequest = store.getAll();
        fallbackRequest.onsuccess = () => {
          const allItems = fallbackRequest.result || [];
          const pendingItems = allItems.filter((item: OfflineQueueItem) => item.synced === false);
          resolve(pendingItems);
        };
        fallbackRequest.onerror = () => {
          console.error('[OFFLINE] Failed to get pending actions:', fallbackRequest.error);
          reject(fallbackRequest.error);
        };
      }
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

  // ========== USER DATA CACHING METHODS ==========
  
  // Cache user profile data
  async cacheUserProfile(userId: number, profileData: any): Promise<void> {
    return this.cacheData(`profile-${userId}`, profileData, 120); // 2 hour TTL
  }

  // Get cached user profile
  async getCachedUserProfile(userId: number): Promise<any | null> {
    return this.getCachedData(`profile-${userId}`);
  }

  // Cache user settings
  async cacheUserSettings(userId: number, settings: any): Promise<void> {
    return this.cacheData(`settings-${userId}`, settings, 240); // 4 hour TTL
  }

  // Get cached user settings
  async getCachedUserSettings(userId: number): Promise<any | null> {
    return this.getCachedData(`settings-${userId}`);
  }

  // Cache user preferences (language, theme, etc.)
  async cacheUserPreferences(userId: number, preferences: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userPreferences'], 'readwrite');
      const store = transaction.objectStore('userPreferences');
      const request = store.put({ userId, ...preferences, updatedAt: Date.now() });

      request.onsuccess = () => {
        console.log('[OFFLINE] User preferences cached');
        resolve();
      };

      request.onerror = () => {
        console.error('[OFFLINE] Failed to cache preferences:', request.error);
        reject(request.error);
      };
    });
  }

  // Get cached user preferences
  async getCachedUserPreferences(userId: number): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userPreferences'], 'readonly');
      const store = transaction.objectStore('userPreferences');
      const request = store.get(userId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('[OFFLINE] Failed to get preferences:', request.error);
        reject(request.error);
      };
    });
  }

  // Cache notifications
  async cacheNotifications(userId: number, notifications: any[]): Promise<void> {
    return this.cacheData(`notifications-${userId}`, notifications, 60); // 1 hour TTL
  }

  // Get cached notifications
  async getCachedNotifications(userId: number): Promise<any[] | null> {
    return this.getCachedData(`notifications-${userId}`);
  }

  // Cache dashboard data (role-specific)
  async cacheDashboardData(userId: number, role: string, data: any): Promise<void> {
    return this.cacheData(`dashboard-${role}-${userId}`, data, 30); // 30 min TTL
  }

  // Get cached dashboard data
  async getCachedDashboardData(userId: number, role: string): Promise<any | null> {
    return this.getCachedData(`dashboard-${role}-${userId}`);
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageManager();

// Initialize on import (non-blocking)
offlineStorage.init().catch(err => {
  console.error('[OFFLINE] Failed to initialize offline storage:', err);
});

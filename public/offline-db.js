// Educafric Offline Database - IndexedDB Service for Offline Premium Mode
// Stores academic data locally for offline access

const DB_NAME = 'educafric-offline-db';
const DB_VERSION = 1;

// Store names for different data types
const STORES = {
  SETTINGS: 'settings',
  CLASSES: 'classes',
  ROOMS: 'rooms',
  TEACHERS: 'teachers',
  STUDENTS: 'students',
  TIMETABLES: 'timetables',
  GRADES: 'grades',
  BULLETINS: 'bulletins',
  SYNC_QUEUE: 'sync_queue',
  METADATA: 'metadata'
};

class OfflineDBService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized && this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[OFFLINE_DB] Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('[OFFLINE_DB] Database opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('[OFFLINE_DB] Upgrading database schema...');

        // Settings store (school configuration)
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          const settingsStore = db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
          settingsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Classes store
        if (!db.objectStoreNames.contains(STORES.CLASSES)) {
          const classesStore = db.createObjectStore(STORES.CLASSES, { keyPath: 'id' });
          classesStore.createIndex('schoolId', 'schoolId', { unique: false });
          classesStore.createIndex('term', 'term', { unique: false });
        }

        // Rooms store
        if (!db.objectStoreNames.contains(STORES.ROOMS)) {
          const roomsStore = db.createObjectStore(STORES.ROOMS, { keyPath: 'id' });
          roomsStore.createIndex('schoolId', 'schoolId', { unique: false });
        }

        // Teachers store
        if (!db.objectStoreNames.contains(STORES.TEACHERS)) {
          const teachersStore = db.createObjectStore(STORES.TEACHERS, { keyPath: 'id' });
          teachersStore.createIndex('schoolId', 'schoolId', { unique: false });
        }

        // Students store
        if (!db.objectStoreNames.contains(STORES.STUDENTS)) {
          const studentsStore = db.createObjectStore(STORES.STUDENTS, { keyPath: 'id' });
          studentsStore.createIndex('schoolId', 'schoolId', { unique: false });
          studentsStore.createIndex('classId', 'classId', { unique: false });
        }

        // Timetables store
        if (!db.objectStoreNames.contains(STORES.TIMETABLES)) {
          const timetablesStore = db.createObjectStore(STORES.TIMETABLES, { keyPath: 'id' });
          timetablesStore.createIndex('schoolId', 'schoolId', { unique: false });
          timetablesStore.createIndex('classId', 'classId', { unique: false });
          timetablesStore.createIndex('teacherId', 'teacherId', { unique: false });
        }

        // Grades store
        if (!db.objectStoreNames.contains(STORES.GRADES)) {
          const gradesStore = db.createObjectStore(STORES.GRADES, { keyPath: 'id' });
          gradesStore.createIndex('schoolId', 'schoolId', { unique: false });
          gradesStore.createIndex('studentId', 'studentId', { unique: false });
          gradesStore.createIndex('term', 'term', { unique: false });
        }

        // Bulletins store
        if (!db.objectStoreNames.contains(STORES.BULLETINS)) {
          const bulletinsStore = db.createObjectStore(STORES.BULLETINS, { keyPath: 'id' });
          bulletinsStore.createIndex('schoolId', 'schoolId', { unique: false });
          bulletinsStore.createIndex('studentId', 'studentId', { unique: false });
          bulletinsStore.createIndex('term', 'term', { unique: false });
        }

        // Sync queue store (for offline changes)
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('endpoint', 'endpoint', { unique: false });
          syncStore.createIndex('status', 'status', { unique: false });
        }

        // Metadata store (cache info, last sync, etc)
        if (!db.objectStoreNames.contains(STORES.METADATA)) {
          const metadataStore = db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
        }

        console.log('[OFFLINE_DB] Database schema created successfully');
      };
    });
  }

  async saveData(storeName, data) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const items = Array.isArray(data) ? data : [data];
      const requests = items.map(item => store.put(item));

      transaction.oncomplete = () => {
        console.log(`[OFFLINE_DB] Saved ${items.length} items to ${storeName}`);
        resolve();
      };

      transaction.onerror = () => {
        console.error(`[OFFLINE_DB] Error saving to ${storeName}:`, transaction.error);
        reject(transaction.error);
      };
    });
  }

  async getData(storeName, key = null) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      if (key) {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } else {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }
    });
  }

  async getDataByIndex(storeName, indexName, indexValue) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(indexValue);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteData(storeName, key = null) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      if (key) {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } else {
        const request = store.clear();
        request.onsuccess = () => {
          console.log(`[OFFLINE_DB] Cleared all data from ${storeName}`);
          resolve();
        };
        request.onerror = () => reject(request.error);
      }
    });
  }

  async clearAllData() {
    await this.init();
    const storeNames = Object.values(STORES);
    
    return Promise.all(
      storeNames.map(storeName => this.deleteData(storeName))
    ).then(() => {
      console.log('[OFFLINE_DB] All data cleared');
    });
  }

  async getMetadata(key) {
    return this.getData(STORES.METADATA, key);
  }

  async setMetadata(key, value) {
    return this.saveData(STORES.METADATA, { key, value, timestamp: Date.now() });
  }

  async queueSyncItem(endpoint, method, data) {
    const syncItem = {
      endpoint,
      method,
      data,
      timestamp: Date.now(),
      status: 'pending',
      retries: 0
    };
    
    return this.saveData(STORES.SYNC_QUEUE, syncItem);
  }

  async getSyncQueue() {
    return this.getDataByIndex(STORES.SYNC_QUEUE, 'status', 'pending');
  }

  async markSyncItemComplete(id) {
    const item = await this.getData(STORES.SYNC_QUEUE, id);
    if (item) {
      item.status = 'completed';
      item.completedAt = Date.now();
      return this.saveData(STORES.SYNC_QUEUE, item);
    }
  }

  async markSyncItemFailed(id) {
    const item = await this.getData(STORES.SYNC_QUEUE, id);
    if (item) {
      item.status = 'failed';
      item.retries = (item.retries || 0) + 1;
      item.lastAttempt = Date.now();
      return this.saveData(STORES.SYNC_QUEUE, item);
    }
  }
}

// Export singleton instance
const offlineDB = new OfflineDBService();
window.offlineDB = offlineDB;

console.log('[OFFLINE_DB] Service initialized');

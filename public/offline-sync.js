// Educafric Offline Sync Service
// Manages data synchronization for Offline Premium Mode

class OfflineSyncService {
  constructor() {
    this.isSyncing = false;
    this.lastSyncTime = null;
    this.syncProgress = 0;
    this.isOfflineEnabled = false;
  }

  async init() {
    // Check if school has offline mode enabled
    await this.checkOfflineStatus();
    
    // Set up event listeners
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Check sync status on load
    const metadata = await window.offlineDB.getMetadata('lastSync');
    if (metadata) {
      this.lastSyncTime = metadata.value;
    }

    console.log('[OFFLINE_SYNC] Service initialized');
  }

  async checkOfflineStatus() {
    try {
      const response = await fetch('/api/profile', { credentials: 'include' });
      if (response.ok) {
        const profile = await response.json();
        this.isOfflineEnabled = profile.school?.offlineEnabled || false;
        
        console.log(`[OFFLINE_SYNC] Offline mode ${this.isOfflineEnabled ? 'ENABLED' : 'disabled'}`);
        
        // Store in metadata
        await window.offlineDB.setMetadata('offlineEnabled', this.isOfflineEnabled);
        
        return this.isOfflineEnabled;
      }
    } catch (error) {
      console.error('[OFFLINE_SYNC] Failed to check offline status:', error);
      
      // Fallback to stored metadata
      const metadata = await window.offlineDB.getMetadata('offlineEnabled');
      this.isOfflineEnabled = metadata?.value || false;
    }
    
    return this.isOfflineEnabled;
  }

  async syncAllData(forceRefresh = false) {
    if (this.isSyncing) {
      console.log('[OFFLINE_SYNC] Sync already in progress');
      return;
    }

    if (!navigator.onLine) {
      console.log('[OFFLINE_SYNC] Cannot sync - device is offline');
      return;
    }

    this.isSyncing = true;
    this.syncProgress = 0;
    
    try {
      console.log('[OFFLINE_SYNC] Starting full data sync...');
      
      // Emit sync start event
      window.dispatchEvent(new CustomEvent('offline-sync-start'));

      // Sync school settings
      await this.syncSettings();
      this.updateProgress(10);

      // Sync classes
      await this.syncClasses();
      this.updateProgress(25);

      // Sync rooms
      await this.syncRooms();
      this.updateProgress(35);

      // Sync teachers
      await this.syncTeachers();
      this.updateProgress(50);

      // Sync students
      await this.syncStudents();
      this.updateProgress(65);

      // Sync timetables
      await this.syncTimetables();
      this.updateProgress(75);

      // Sync grades (if offline-enabled)
      if (this.isOfflineEnabled) {
        await this.syncGrades();
        this.updateProgress(85);

        // Sync bulletins
        await this.syncBulletins();
        this.updateProgress(95);
      }

      // Update last sync time
      this.lastSyncTime = Date.now();
      await window.offlineDB.setMetadata('lastSync', this.lastSyncTime);
      
      this.updateProgress(100);
      console.log('[OFFLINE_SYNC] ✅ Full data sync complete');
      
      // Emit sync complete event
      window.dispatchEvent(new CustomEvent('offline-sync-complete', {
        detail: { success: true, timestamp: this.lastSyncTime }
      }));

    } catch (error) {
      console.error('[OFFLINE_SYNC] Sync failed:', error);
      
      // Emit sync error event
      window.dispatchEvent(new CustomEvent('offline-sync-error', {
        detail: { error: error.message }
      }));
    } finally {
      this.isSyncing = false;
      this.syncProgress = 0;
    }
  }

  async syncSettings() {
    try {
      const response = await fetch('/api/director/settings', { credentials: 'include' });
      if (response.ok) {
        const settings = await response.json();
        await window.offlineDB.saveData('settings', { key: 'school', ...settings });
        console.log('[OFFLINE_SYNC] Settings synced');
      }
    } catch (error) {
      console.error('[OFFLINE_SYNC] Failed to sync settings:', error);
    }
  }

  async syncClasses() {
    try {
      const response = await fetch('/api/director/classes', { credentials: 'include' });
      if (response.ok) {
        const classes = await response.json();
        await window.offlineDB.saveData('classes', classes);
        console.log(`[OFFLINE_SYNC] ${classes.length} classes synced`);
      }
    } catch (error) {
      console.error('[OFFLINE_SYNC] Failed to sync classes:', error);
    }
  }

  async syncRooms() {
    try {
      const response = await fetch('/api/director/rooms', { credentials: 'include' });
      if (response.ok) {
        const rooms = await response.json();
        await window.offlineDB.saveData('rooms', rooms);
        console.log(`[OFFLINE_SYNC] ${rooms.length} rooms synced`);
      }
    } catch (error) {
      console.error('[OFFLINE_SYNC] Failed to sync rooms:', error);
    }
  }

  async syncTeachers() {
    try {
      const response = await fetch('/api/director/teachers', { credentials: 'include' });
      if (response.ok) {
        const teachers = await response.json();
        await window.offlineDB.saveData('teachers', teachers);
        console.log(`[OFFLINE_SYNC] ${teachers.length} teachers synced`);
      }
    } catch (error) {
      console.error('[OFFLINE_SYNC] Failed to sync teachers:', error);
    }
  }

  async syncStudents() {
    try {
      const response = await fetch('/api/director/students', { credentials: 'include' });
      if (response.ok) {
        const students = await response.json();
        await window.offlineDB.saveData('students', students);
        console.log(`[OFFLINE_SYNC] ${students.length} students synced`);
      }
    } catch (error) {
      console.error('[OFFLINE_SYNC] Failed to sync students:', error);
    }
  }

  async syncTimetables() {
    try {
      const response = await fetch('/api/director/timetables', { credentials: 'include' });
      if (response.ok) {
        const timetables = await response.json();
        await window.offlineDB.saveData('timetables', timetables);
        console.log(`[OFFLINE_SYNC] ${timetables.length} timetables synced`);
      }
    } catch (error) {
      console.error('[OFFLINE_SYNC] Failed to sync timetables:', error);
    }
  }

  async syncGrades() {
    try {
      // Sync all terms for offline-enabled schools
      const terms = ['trimestre1', 'trimestre2', 'trimestre3'];
      let totalGrades = 0;

      for (const term of terms) {
        const response = await fetch(`/api/director/grades?term=${term}`, { credentials: 'include' });
        if (response.ok) {
          const grades = await response.json();
          await window.offlineDB.saveData('grades', grades);
          totalGrades += grades.length;
        }
      }
      
      console.log(`[OFFLINE_SYNC] ${totalGrades} grades synced (all terms)`);
    } catch (error) {
      console.error('[OFFLINE_SYNC] Failed to sync grades:', error);
    }
  }

  async syncBulletins() {
    try {
      // Sync all terms for offline-enabled schools
      const terms = ['trimestre1', 'trimestre2', 'trimestre3'];
      let totalBulletins = 0;

      for (const term of terms) {
        const response = await fetch(`/api/director/bulletins/list?term=${term}`, { credentials: 'include' });
        if (response.ok) {
          const bulletins = await response.json();
          await window.offlineDB.saveData('bulletins', bulletins);
          totalBulletins += bulletins.length;
        }
      }
      
      console.log(`[OFFLINE_SYNC] ${totalBulletins} bulletins synced (all terms)`);
    } catch (error) {
      console.error('[OFFLINE_SYNC] Failed to sync bulletins:', error);
    }
  }

  updateProgress(percent) {
    this.syncProgress = percent;
    window.dispatchEvent(new CustomEvent('offline-sync-progress', {
      detail: { progress: percent }
    }));
  }

  async processSyncQueue() {
    if (!navigator.onLine) {
      console.log('[OFFLINE_SYNC] Cannot process queue - device is offline');
      return;
    }

    const queue = await window.offlineDB.getSyncQueue();
    
    if (queue.length === 0) {
      console.log('[OFFLINE_SYNC] Sync queue is empty');
      return;
    }

    console.log(`[OFFLINE_SYNC] Processing ${queue.length} queued items...`);
    let syncedCount = 0;

    for (const item of queue) {
      try {
        const response = await fetch(item.endpoint, {
          method: item.method,
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(item.data)
        });

        if (response.ok) {
          await window.offlineDB.markSyncItemComplete(item.id);
          syncedCount++;
          console.log(`[OFFLINE_SYNC] ✅ Synced: ${item.endpoint}`);
        } else {
          await window.offlineDB.markSyncItemFailed(item.id);
          console.error(`[OFFLINE_SYNC] ❌ Failed: ${item.endpoint}`, response.status);
        }
      } catch (error) {
        await window.offlineDB.markSyncItemFailed(item.id);
        console.error(`[OFFLINE_SYNC] Error syncing: ${item.endpoint}`, error);
      }
    }

    console.log(`[OFFLINE_SYNC] ✅ Queue complete: ${syncedCount}/${queue.length} succeeded`);
    
    // Emit sync queue complete event
    window.dispatchEvent(new CustomEvent('sync-queue-complete', {
      detail: { total: queue.length, synced: syncedCount }
    }));
  }

  handleOnline() {
    console.log('[OFFLINE_SYNC] Device is online');
    
    // Register background sync if supported
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('educafric-sync-queue');
      }).then(() => {
        console.log('[OFFLINE_SYNC] Background sync registered');
      }).catch(err => {
        console.error('[OFFLINE_SYNC] Background sync registration failed:', err);
        // Fallback to manual sync
        this.processSyncQueueFallback();
      });
    } else {
      // Browser doesn't support Background Sync, use fallback
      console.log('[OFFLINE_SYNC] Background Sync not supported, using fallback');
      this.processSyncQueueFallback();
    }
    
    // Emit online event
    window.dispatchEvent(new CustomEvent('connection-status-change', {
      detail: { online: true }
    }));
  }

  async processSyncQueueFallback() {
    // Message Service Worker to process queue manually
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'PROCESS_SYNC_QUEUE'
      });
    } else {
      // Direct processing if SW not available
      await this.processSyncQueue();
    }
  }

  handleOffline() {
    console.log('[OFFLINE_SYNC] Device is offline');
    
    // Emit offline event
    window.dispatchEvent(new CustomEvent('connection-status-change', {
      detail: { online: false }
    }));
  }

  async getDataAge() {
    const metadata = await window.offlineDB.getMetadata('lastSync');
    if (!metadata) return null;
    
    const ageInMs = Date.now() - metadata.value;
    const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
    
    return {
      lastSync: metadata.value,
      ageInMs,
      ageInDays,
      isStale: ageInDays > 7 // Data older than 7 days is considered stale
    };
  }
}

// Initialize service
const offlineSync = new OfflineSyncService();
window.offlineSync = offlineSync;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => offlineSync.init());
} else {
  offlineSync.init();
}

console.log('[OFFLINE_SYNC] Service loaded');

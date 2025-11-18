import { offlineDb, SyncQueueItem } from './db';

// ===========================
// 🔄 SYNC QUEUE MANAGER
// ===========================
// Manages offline actions queue and synchronization

export class SyncQueueManager {
  // Add item to sync queue
  static async enqueue(
    module: 'classes' | 'students' | 'attendance',
    action: 'create' | 'update' | 'delete',
    payload: any,
    entityId?: number,
    tempId?: number
  ): Promise<void> {
    await offlineDb.syncQueue.add({
      module,
      action,
      entityId,
      tempId,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      synced: false
    });
    
    console.log(`[SYNC_QUEUE] ✅ Enqueued ${action} on ${module}`, { entityId, tempId, payload });
  }

  // Get all pending items
  static async getPending(): Promise<SyncQueueItem[]> {
    return await offlineDb.syncQueue
      .where('synced')
      .equals(0)
      .sortBy('timestamp');
  }

  // Get pending count
  static async getPendingCount(): Promise<number> {
    return await offlineDb.syncQueue
      .where('synced')
      .equals(0)
      .count();
  }

  // Mark item as synced
  static async markSynced(id: number): Promise<void> {
    await offlineDb.syncQueue.update(id, { synced: true });
  }

  // Mark item as failed
  static async markFailed(id: number, error: string): Promise<void> {
    const item = await offlineDb.syncQueue.get(id);
    if (item) {
      await offlineDb.syncQueue.update(id, {
        retryCount: (item.retryCount || 0) + 1,
        lastError: error
      });
    }
  }

  // Process sync queue
  static async processQueue(onlineCheck: () => boolean = () => navigator.onLine): Promise<{
    success: number;
    failed: number;
    total: number;
  }> {
    if (!onlineCheck()) {
      console.log('[SYNC_QUEUE] ⚠️ Offline - skipping sync');
      return { success: 0, failed: 0, total: 0 };
    }

    const pending = await this.getPending();
    let success = 0;
    let failed = 0;

    console.log(`[SYNC_QUEUE] 🔄 Processing ${pending.length} pending items`);

    for (const item of pending) {
      try {
        await this.syncItem(item);
        await this.markSynced(item.id!);
        success++;
      } catch (error: any) {
        console.error(`[SYNC_QUEUE] ❌ Failed to sync item ${item.id}:`, error);
        await this.markFailed(item.id!, error.message);
        failed++;
      }
    }

    console.log(`[SYNC_QUEUE] ✅ Sync complete: ${success} success, ${failed} failed`);
    return { success, failed, total: pending.length };
  }

  // Sync individual item
  private static async syncItem(item: SyncQueueItem): Promise<void> {
    const endpoint = this.getEndpoint(item.module, item.action, item.entityId);
    const method = this.getMethod(item.action);

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(item.payload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Sync failed: ${error}`);
    }

    // For CREATE actions, get real ID from server response and update local record
    if (item.action === 'create' && item.tempId) {
      const responseData = await response.json();
      
      // Extract real ID from response based on module
      let realId: number | undefined;
      switch (item.module) {
        case 'classes':
          realId = responseData.class?.id;
          break;
        case 'students':
          realId = responseData.student?.id;
          break;
        case 'attendance':
          realId = responseData.attendance?.id || responseData.id;
          break;
      }
      
      if (realId) {
        // Update local record with real ID
        await this.updateLocalRecordId(item.module, item.tempId, realId);
        
        // Update all pending queue entries that reference this temp ID
        await this.updateQueueEntityIds(item.module, item.tempId, realId);
        
        console.log(`[SYNC_QUEUE] 🔄 Mapped temp ID ${item.tempId} to real ID ${realId} for ${item.module}`);
      } else {
        console.warn(`[SYNC_QUEUE] ⚠️ Could not extract real ID from response for ${item.module}`, responseData);
      }
    }

    console.log(`[SYNC_QUEUE] ✅ Synced ${item.action} on ${item.module}`, item.entityId);
  }

  // Update local record with real ID after server sync
  private static async updateLocalRecordId(
    module: 'classes' | 'students' | 'attendance',
    tempId: number,
    realId: number
  ): Promise<void> {
    switch (module) {
      case 'classes':
        const classRecord = await offlineDb.classes.get(tempId);
        if (classRecord) {
          await offlineDb.classes.delete(tempId);
          await offlineDb.classes.put({ ...classRecord, id: realId, syncStatus: 'synced' });
        }
        break;
      case 'students':
        const studentRecord = await offlineDb.students.get(tempId);
        if (studentRecord) {
          await offlineDb.students.delete(tempId);
          await offlineDb.students.put({ ...studentRecord, id: realId, syncStatus: 'synced' });
        }
        break;
      case 'attendance':
        const attendanceRecord = await offlineDb.attendance.get(tempId);
        if (attendanceRecord) {
          await offlineDb.attendance.delete(tempId);
          await offlineDb.attendance.put({ ...attendanceRecord, id: realId, syncStatus: 'synced' });
        }
        break;
    }
  }

  // Update pending queue entries with real ID after CREATE sync
  private static async updateQueueEntityIds(
    module: 'classes' | 'students' | 'attendance',
    tempId: number,
    realId: number
  ): Promise<void> {
    // Find all pending queue items for this module with this temp ID
    const pendingItems = await offlineDb.syncQueue
      .where('[module+synced]')
      .equals([module, 0])
      .and(item => item.entityId === tempId || item.tempId === tempId)
      .toArray();

    // Update each item with the real ID
    for (const item of pendingItems) {
      await offlineDb.syncQueue.update(item.id!, {
        entityId: realId,
        tempId: realId
      });
      console.log(`[SYNC_QUEUE] 🔄 Updated queue item ${item.id} with real ID ${realId}`);
    }
  }

  // Get API endpoint for sync
  private static getEndpoint(
    module: string,
    action: string,
    entityId?: number
  ): string {
    const baseEndpoints = {
      classes: '/api/classes',
      students: '/api/director/students',
      attendance: '/api/director/attendance'
    };

    const base = baseEndpoints[module as keyof typeof baseEndpoints];
    
    if (action === 'create') {
      return base;
    }
    
    if (action === 'update' || action === 'delete') {
      return `${base}/${entityId}`;
    }

    return base;
  }

  // Get HTTP method for action
  private static getMethod(action: string): string {
    switch (action) {
      case 'create': return 'POST';
      case 'update': return 'PATCH';
      case 'delete': return 'DELETE';
      default: return 'POST';
    }
  }

  // Clear synced items older than 7 days
  static async clearOldSyncedItems(): Promise<void> {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    await offlineDb.syncQueue
      .where('synced')
      .equals(1)
      .and(item => item.timestamp < sevenDaysAgo)
      .delete();
  }
}

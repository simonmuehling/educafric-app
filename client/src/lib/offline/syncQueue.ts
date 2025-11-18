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
    entityId?: number
  ): Promise<void> {
    await offlineDb.syncQueue.add({
      module,
      action,
      entityId,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      synced: false
    });
    
    console.log(`[SYNC_QUEUE] ✅ Enqueued ${action} on ${module}`, { entityId, payload });
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

    console.log(`[SYNC_QUEUE] ✅ Synced ${item.action} on ${item.module}`, item.entityId);
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

import { useState, useEffect, useCallback, useContext } from 'react';
import { offlineDb, OfflineMessage } from '@/lib/offline/db';
import { SyncQueueManager } from '@/lib/offline/syncQueue';
import { OfflinePremiumContext } from '@/contexts/offline/OfflinePremiumContext';
import { useToast } from '@/hooks/use-toast';

// ===========================
// 💬 OFFLINE MESSAGES HOOK
// ===========================
// Full CRUD offline support for Messages & Communications module
// Supports: Create, Read, Update, Delete with sync queue

export function useOfflineMessages(schoolId: number, userId: number) {
  const [messages, setMessages] = useState<OfflineMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOnline, canAccessPremium } = useContext(OfflinePremiumContext);
  const { toast } = useToast();

  // ===========================
  // 📥 FETCH & CACHE FROM SERVER
  // ===========================
  const fetchAndCache = useCallback(async () => {
    if (!isOnline) {
      console.log('[OFFLINE_MESSAGES] Offline mode - loading from cache');
      return;
    }

    try {
      console.log('[OFFLINE_MESSAGES] Fetching messages from server...');
      const response = await fetch('/api/director/messages');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      const data = await response.json();
      console.log('[OFFLINE_MESSAGES] Received messages:', data.length);

      // Clear only synced records to preserve pending changes
      await offlineDb.messages
        .where('schoolId').equals(schoolId)
        .and(m => m.syncStatus === 'synced')
        .delete();

      // Cache server data
      const messagesToCache: OfflineMessage[] = data.map((msg: any) => ({
        id: msg.id,
        subject: msg.subject,
        content: msg.content,
        from: msg.from,
        to: msg.to || [],
        recipientType: msg.recipientType || 'all',
        status: msg.status || 'sent',
        sentAt: msg.sentAt,
        schoolId: msg.schoolId,
        classId: msg.classId,
        lastModified: Date.now(),
        syncStatus: 'synced' as const,
        localOnly: false
      }));

      if (messagesToCache.length > 0) {
        await offlineDb.messages.bulkPut(messagesToCache);
        console.log('[OFFLINE_MESSAGES] ✅ Cached', messagesToCache.length, 'messages');
      }
    } catch (err) {
      console.error('[OFFLINE_MESSAGES] ❌ Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    }
  }, [isOnline, schoolId]);

  // ===========================
  // 📖 LOAD FROM INDEXEDDB
  // ===========================
  const loadFromCache = useCallback(async () => {
    try {
      setIsLoading(true);
      const cached = await offlineDb.messages
        .where('schoolId').equals(schoolId)
        .reverse()
        .sortBy('lastModified');
      
      console.log('[OFFLINE_MESSAGES] 📦 Loaded', cached.length, 'messages from cache');
      setMessages(cached);
      setError(null);
    } catch (err) {
      console.error('[OFFLINE_MESSAGES] ❌ Load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [schoolId]);

  // ===========================
  // 🔄 INITIAL LOAD & SYNC
  // ===========================
  useEffect(() => {
    const initialize = async () => {
      await loadFromCache();
      if (isOnline) {
        await fetchAndCache();
        await loadFromCache(); // Reload after fetch
      }
    };

    initialize();
  }, [loadFromCache, fetchAndCache, isOnline]);

  // ===========================
  // ➕ CREATE MESSAGE
  // ===========================
  const createMessage = useCallback(async (messageData: Omit<OfflineMessage, 'id' | 'lastModified' | 'syncStatus' | 'localOnly'>) => {
    if (!canAccessPremium) {
      toast({
        title: 'Accès Premium requis',
        description: 'Veuillez vous reconnecter pour continuer.',
        variant: 'destructive'
      });
      return null;
    }

    const tempId = Date.now();
    const newMessage: OfflineMessage = {
      ...messageData,
      id: tempId,
      lastModified: Date.now(),
      syncStatus: 'pending',
      localOnly: !isOnline
    };

    try {
      // Save to IndexedDB
      await offlineDb.messages.put(newMessage);
      console.log('[OFFLINE_MESSAGES] ✅ Created message with tempId:', tempId);

      // Add to sync queue
      await SyncQueueManager.addToQueue({
        module: 'messages',
        action: 'create',
        tempId,
        payload: messageData,
        timestamp: Date.now(),
        retryCount: 0,
        synced: false
      });

      // Reload
      await loadFromCache();

      toast({
        title: 'Message créé',
        description: isOnline ? 'Envoi en cours...' : 'Sera envoyé lors de la reconnexion'
      });

      // Sync if online
      if (isOnline) {
        await SyncQueueManager.processQueue();
        await loadFromCache();
      }

      return newMessage;
    } catch (err) {
      console.error('[OFFLINE_MESSAGES] ❌ Create error:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le message',
        variant: 'destructive'
      });
      return null;
    }
  }, [canAccessPremium, isOnline, loadFromCache, toast]);

  // ===========================
  // ✏️ UPDATE MESSAGE
  // ===========================
  const updateMessage = useCallback(async (id: number, updates: Partial<OfflineMessage>) => {
    if (!canAccessPremium) {
      toast({
        title: 'Accès Premium requis',
        description: 'Veuillez vous reconnecter pour continuer.',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const existing = await offlineDb.messages.get(id);
      if (!existing) {
        throw new Error('Message not found');
      }

      const updated: OfflineMessage = {
        ...existing,
        ...updates,
        lastModified: Date.now(),
        syncStatus: 'pending'
      };

      await offlineDb.messages.put(updated);
      console.log('[OFFLINE_MESSAGES] ✅ Updated message:', id);

      // Add to sync queue
      await SyncQueueManager.addToQueue({
        module: 'messages',
        action: 'update',
        entityId: id,
        payload: updates,
        timestamp: Date.now(),
        retryCount: 0,
        synced: false
      });

      await loadFromCache();

      toast({
        title: 'Message modifié',
        description: isOnline ? 'Synchronisation en cours...' : 'Sera synchronisé lors de la reconnexion'
      });

      if (isOnline) {
        await SyncQueueManager.processQueue();
        await loadFromCache();
      }

      return true;
    } catch (err) {
      console.error('[OFFLINE_MESSAGES] ❌ Update error:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le message',
        variant: 'destructive'
      });
      return false;
    }
  }, [canAccessPremium, isOnline, loadFromCache, toast]);

  // ===========================
  // 🗑️ DELETE MESSAGE
  // ===========================
  const deleteMessage = useCallback(async (id: number) => {
    if (!canAccessPremium) {
      toast({
        title: 'Accès Premium requis',
        description: 'Veuillez vous reconnecter pour continuer.',
        variant: 'destructive'
      });
      return false;
    }

    try {
      await offlineDb.messages.delete(id);
      console.log('[OFFLINE_MESSAGES] ✅ Deleted message:', id);

      // Add to sync queue
      await SyncQueueManager.addToQueue({
        module: 'messages',
        action: 'delete',
        entityId: id,
        payload: { id },
        timestamp: Date.now(),
        retryCount: 0,
        synced: false
      });

      await loadFromCache();

      toast({
        title: 'Message supprimé',
        description: isOnline ? 'Synchronisation en cours...' : 'Sera synchronisé lors de la reconnexion'
      });

      if (isOnline) {
        await SyncQueueManager.processQueue();
        await loadFromCache();
      }

      return true;
    } catch (err) {
      console.error('[OFFLINE_MESSAGES] ❌ Delete error:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le message',
        variant: 'destructive'
      });
      return false;
    }
  }, [canAccessPremium, isOnline, loadFromCache, toast]);

  return {
    messages,
    isLoading,
    error,
    createMessage,
    updateMessage,
    deleteMessage,
    refresh: loadFromCache
  };
}

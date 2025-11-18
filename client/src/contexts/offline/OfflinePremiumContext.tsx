import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getLastServerSync,
  setLastServerSync,
  getOfflineMode,
  setOfflineMode,
  calculateDaysOffline
} from '@/lib/offline/db';
import { SyncQueueManager } from '@/lib/offline/syncQueue';

// ===========================
// 🔐 OFFLINE PREMIUM CONTEXT
// ===========================
// Manages offline state, warnings, and role-based access

export type OfflineWarningLevel = 'none' | 'light' | 'urgent' | 'blocked';
export type OfflineMode = 'unlimited' | 'limited';

interface OfflinePremiumContextType {
  // Connection state
  isOnline: boolean;
  
  // Offline mode
  offlineMode: OfflineMode;
  daysOffline: number;
  lastSync: number | null;
  
  // Warning level (0-3, 3-7, 7-14, 14+ days)
  warningLevel: OfflineWarningLevel;
  
  // Access control
  hasOfflineAccess: boolean;
  canAccessPremium: boolean;
  
  // Sync state
  isSyncing: boolean;
  pendingSyncCount: number;
  
  // Actions
  triggerSync: () => Promise<void>;
  updateLastSync: () => Promise<void>;
}

const OfflinePremiumContext = createContext<OfflinePremiumContextType | undefined>(undefined);

export function OfflinePremiumProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineMode, setOfflineModeState] = useState<OfflineMode>('limited');
  const [lastSync, setLastSyncState] = useState<number | null>(null);
  const [daysOffline, setDaysOffline] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  // ===========================
  // 🌐 ONLINE/OFFLINE DETECTION
  // ===========================
  useEffect(() => {
    const handleOnline = () => {
      console.log('[OFFLINE_PREMIUM] 🌐 Connection restored');
      setIsOnline(true);
      triggerSync(); // Auto-sync when back online
    };

    const handleOffline = () => {
      console.log('[OFFLINE_PREMIUM] 📴 Connection lost');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ===========================
  // 📊 LOAD OFFLINE METADATA
  // ===========================
  useEffect(() => {
    async function loadMetadata() {
      const mode = await getOfflineMode();
      const sync = await getLastServerSync();
      
      setOfflineModeState(mode);
      setLastSyncState(sync);
      setDaysOffline(calculateDaysOffline(sync));
      
      // Update pending count
      const count = await SyncQueueManager.getPendingCount();
      setPendingSyncCount(count);
      
      console.log('[OFFLINE_PREMIUM] 📊 Metadata loaded:', {
        mode,
        lastSync: sync,
        daysOffline: calculateDaysOffline(sync),
        pendingSync: count
      });
    }

    loadMetadata();
  }, []);

  // ===========================
  // ⏰ PERIODIC SYNC CHECK
  // ===========================
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isOnline && !isSyncing) {
        const count = await SyncQueueManager.getPendingCount();
        if (count > 0) {
          console.log('[OFFLINE_PREMIUM] ⏰ Auto-sync triggered - pending items:', count);
          await triggerSync();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isOnline, isSyncing]);

  // ===========================
  // 🎯 ROLE-BASED ACCESS CONTROL
  // ===========================
  // Teachers & Students: Always unlimited offline
  // Directors & Parents: 14 days limit (unless school has unlimited mode)
  // Sandbox accounts: Always unlimited
  
  const hasOfflineAccess = (): boolean => {
    if (!user) return false;

    // Unlimited roles (from PDF guide)
    const unlimitedRoles = ['Teacher', 'Student'];
    if (unlimitedRoles.includes(user.role)) {
      return true;
    }

    // Sandbox accounts (from PDF guide)
    const isSandbox = user.email?.includes('@test.educafric.com') ||
                     user.email?.includes('sandbox@') ||
                     user.email?.includes('demo@');
    if (isSandbox) {
      return true;
    }

    // School unlimited mode
    if (offlineMode === 'unlimited') {
      return true;
    }

    // Premium roles with 14-day limit
    const premiumRoles = ['Director', 'Parent', 'Admin'];
    if (premiumRoles.includes(user.role)) {
      return daysOffline <= 14;
    }

    return false;
  };

  const canAccessPremium = (): boolean => {
    return hasOfflineAccess();
  };

  // ===========================
  // ⚠️ WARNING LEVEL CALCULATION
  // ===========================
  const getWarningLevel = (): OfflineWarningLevel => {
    // No warnings for unlimited access
    if (offlineMode === 'unlimited') {
      return 'none';
    }

    // No warnings for free unlimited roles
    if (user && ['Teacher', 'Student'].includes(user.role)) {
      return 'none';
    }

    // 3-tier system from PDF guide
    if (daysOffline >= 14) {
      return 'blocked'; // 🚫 14+ days
    }
    if (daysOffline >= 7) {
      return 'urgent'; // ⚠️ 7-14 days - Red banner with countdown
    }
    if (daysOffline >= 3) {
      return 'light'; // ⚠️ 3-7 days - Yellow banner
    }
    
    return 'none'; // ✅ 0-3 days - Full access
  };

  // ===========================
  // 🔄 SYNC OPERATIONS
  // ===========================
  const triggerSync = async (): Promise<void> => {
    if (!isOnline || isSyncing) {
      console.log('[OFFLINE_PREMIUM] ⚠️ Sync skipped - offline or already syncing');
      return;
    }

    setIsSyncing(true);
    console.log('[OFFLINE_PREMIUM] 🔄 Starting sync...');

    try {
      const result = await SyncQueueManager.processQueue();
      console.log('[OFFLINE_PREMIUM] ✅ Sync complete:', result);
      
      // Update last sync timestamp
      await updateLastSync();
      
      // Update pending count
      const count = await SyncQueueManager.getPendingCount();
      setPendingSyncCount(count);
    } catch (error) {
      console.error('[OFFLINE_PREMIUM] ❌ Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const updateLastSync = async (): Promise<void> => {
    const now = Date.now();
    await setLastServerSync(now);
    setLastSyncState(now);
    setDaysOffline(0);
    console.log('[OFFLINE_PREMIUM] ✅ Last sync updated');
  };

  const value: OfflinePremiumContextType = {
    isOnline,
    offlineMode,
    daysOffline,
    lastSync,
    warningLevel: getWarningLevel(),
    hasOfflineAccess: hasOfflineAccess(),
    canAccessPremium: canAccessPremium(),
    isSyncing,
    pendingSyncCount,
    triggerSync,
    updateLastSync
  };

  return (
    <OfflinePremiumContext.Provider value={value}>
      {children}
    </OfflinePremiumContext.Provider>
  );
}

export function useOfflinePremium() {
  const context = useContext(OfflinePremiumContext);
  if (!context) {
    throw new Error('useOfflinePremium must be used within OfflinePremiumProvider');
  }
  return context;
}

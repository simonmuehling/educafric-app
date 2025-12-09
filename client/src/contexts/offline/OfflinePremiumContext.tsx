import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getLastServerSync,
  setLastServerSync,
  getOfflineMode,
  setOfflineMode,
  calculateDaysOffline,
  checkOfflineDataStatus,
  setLastOfflinePrepare,
  offlineDb,
  OfflineDataStatus
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
  
  // Offline data readiness
  offlineDataReady: boolean;
  offlineDataStatus: OfflineDataStatus | null;
  isPreparing: boolean;
  
  // Sync state
  isSyncing: boolean;
  pendingSyncCount: number;
  
  // Actions
  triggerSync: () => Promise<void>;
  updateLastSync: () => Promise<void>;
  prepareOfflineData: () => Promise<boolean>;
  refreshDataStatus: () => Promise<void>;
}

export const OfflinePremiumContext = createContext<OfflinePremiumContextType | undefined>(undefined);

export function OfflinePremiumProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineMode, setOfflineModeState] = useState<OfflineMode>('limited');
  const [lastSync, setLastSyncState] = useState<number | null>(null);
  const [daysOffline, setDaysOffline] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  
  // Offline data readiness state
  const [offlineDataReady, setOfflineDataReady] = useState(false);
  const [offlineDataStatus, setOfflineDataStatus] = useState<OfflineDataStatus | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);

  // ===========================
  // 🔄 SYNC FUNCTION (defined early for event listeners)
  // ===========================
  const triggerSyncRef = useRef<() => Promise<void>>();
  
  const triggerSync = useCallback(async (): Promise<void> => {
    if (!navigator.onLine || isSyncing) {
      console.log('[OFFLINE_PREMIUM] ⚠️ Sync skipped - offline or already syncing');
      return;
    }

    setIsSyncing(true);
    console.log('[OFFLINE_PREMIUM] 🔄 Starting sync...');

    try {
      const result = await SyncQueueManager.processQueue();
      console.log('[OFFLINE_PREMIUM] ✅ Sync complete:', result);
      
      // Update last sync timestamp
      const now = Date.now();
      await setLastServerSync(now);
      setLastSyncState(now);
      setDaysOffline(0);
      
      // Update pending count
      const count = await SyncQueueManager.getPendingCount();
      setPendingSyncCount(count);
    } catch (error) {
      console.error('[OFFLINE_PREMIUM] ❌ Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);
  
  // Keep ref updated
  triggerSyncRef.current = triggerSync;

  // ===========================
  // 🌐 ONLINE/OFFLINE DETECTION
  // ===========================
  useEffect(() => {
    const handleOnline = async () => {
      console.log('[OFFLINE_PREMIUM] 🌐 Connection restored - triggering immediate sync');
      setIsOnline(true);
      
      // Small delay to ensure network is stable
      setTimeout(async () => {
        if (triggerSyncRef.current) {
          await triggerSyncRef.current();
        }
      }, 1000);
    };

    const handleOffline = () => {
      console.log('[OFFLINE_PREMIUM] 📴 Connection lost');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Also trigger sync on initial load if online and there are pending items
    if (navigator.onLine) {
      SyncQueueManager.getPendingCount().then(count => {
        if (count > 0) {
          console.log('[OFFLINE_PREMIUM] 📊 Found', count, 'pending items on startup - syncing...');
          setTimeout(() => triggerSyncRef.current?.(), 2000);
        }
      });
    }

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
  // 📦 CHECK OFFLINE DATA READINESS
  // ===========================
  const refreshDataStatus = useCallback(async (): Promise<void> => {
    if (!user?.schoolId) {
      setOfflineDataReady(false);
      setOfflineDataStatus(null);
      return;
    }

    try {
      const status = await checkOfflineDataStatus(user.schoolId);
      setOfflineDataStatus(status);
      setOfflineDataReady(status.isReady);
      console.log('[OFFLINE_PREMIUM] 📦 Data status checked:', status);
    } catch (error) {
      console.error('[OFFLINE_PREMIUM] ❌ Error checking data status:', error);
      setOfflineDataReady(false);
    }
  }, [user?.schoolId]);

  // Check data status on mount and when school changes
  useEffect(() => {
    refreshDataStatus();
  }, [refreshDataStatus]);

  // ===========================
  // 📥 PREPARE OFFLINE DATA
  // ===========================
  const prepareOfflineData = useCallback(async (): Promise<boolean> => {
    if (!user?.schoolId || !isOnline) {
      console.log('[OFFLINE_PREMIUM] ⚠️ Cannot prepare - offline or no school');
      return false;
    }

    setIsPreparing(true);
    console.log('[OFFLINE_PREMIUM] 📥 Starting offline data preparation...');

    try {
      // 1. Fetch and cache classes
      const classesRes = await fetch('/api/offline-sync/classes', { credentials: 'include' });
      if (classesRes.ok) {
        const classesData = await classesRes.json();
        const classes = classesData.classes || [];
        await offlineDb.classes.bulkPut(classes.map((c: any) => ({
          ...c,
          schoolId: user.schoolId,
          lastModified: Date.now(),
          syncStatus: 'synced' as const,
          localOnly: false
        })));
        console.log('[OFFLINE_PREMIUM] ✅ Classes cached:', classes.length);
      }

      // 2. Fetch and cache students
      const studentsRes = await fetch('/api/offline-sync/students', { credentials: 'include' });
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        const students = studentsData.students || [];
        await offlineDb.students.bulkPut(students.map((s: any) => ({
          ...s,
          schoolId: user.schoolId,
          lastModified: Date.now(),
          syncStatus: 'synced' as const,
          localOnly: false
        })));
        console.log('[OFFLINE_PREMIUM] ✅ Students cached:', students.length);
      }

      // 3. Fetch and cache teachers
      const teachersRes = await fetch('/api/offline-sync/teachers', { credentials: 'include' });
      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        const teachers = teachersData.teachers || [];
        await offlineDb.teachers.bulkPut(teachers.map((t: any) => ({
          ...t,
          schoolId: user.schoolId,
          lastModified: Date.now(),
          syncStatus: 'synced' as const,
          localOnly: false
        })));
        console.log('[OFFLINE_PREMIUM] ✅ Teachers cached:', teachers.length);
      }

      // 4. Update preparation timestamp
      await setLastOfflinePrepare();
      
      // 5. Refresh status
      await refreshDataStatus();
      
      console.log('[OFFLINE_PREMIUM] 🎉 Offline data preparation complete!');
      return true;
    } catch (error) {
      console.error('[OFFLINE_PREMIUM] ❌ Error preparing offline data:', error);
      return false;
    } finally {
      setIsPreparing(false);
    }
  }, [user?.schoolId, isOnline, refreshDataStatus]);

  // ===========================
  // ⏰ RECALCULATE DAYS OFFLINE PERIODICALLY
  // ===========================
  useEffect(() => {
    const recalculateDays = () => {
      if (lastSync) {
        const days = calculateDaysOffline(lastSync);
        setDaysOffline(days);
        console.log('[OFFLINE_PREMIUM] 🔄 Recalculated days offline:', days);
      }
    };

    // Recalculate every 5 minutes
    const interval = setInterval(recalculateDays, 5 * 60 * 1000);
    
    // Also recalculate when window gains focus
    window.addEventListener('focus', recalculateDays);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', recalculateDays);
    };
  }, [lastSync]);

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

    // Premium roles with 14-day limit
    const premiumRoles = ['Director', 'Parent', 'Admin'];
    if (premiumRoles.includes(user.role)) {
      // School unlimited mode bypasses 14-day limit for premium roles
      if (offlineMode === 'unlimited') {
        return true;
      }
      // Otherwise enforce 14-day limit
      return daysOffline < 14;
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
    if (!user) return 'none';

    // No warnings for unlimited roles (Teachers, Students)
    const unlimitedRoles = ['Teacher', 'Student'];
    if (unlimitedRoles.includes(user.role)) {
      return 'none';
    }

    // No warnings for sandbox accounts
    const isSandbox = user.email?.includes('@test.educafric.com') ||
                     user.email?.includes('sandbox@') ||
                     user.email?.includes('demo@');
    if (isSandbox) {
      return 'none';
    }

    // No warnings if school has unlimited mode
    if (offlineMode === 'unlimited') {
      return 'none';
    }

    // Premium roles (Directors, Parents) - enforce 3-tier system
    const premiumRoles = ['Director', 'Parent', 'Admin'];
    if (premiumRoles.includes(user.role)) {
      if (daysOffline >= 14) {
        return 'blocked'; // 🚫 14+ days - Access locked
      }
      if (daysOffline >= 7) {
        return 'urgent'; // ⚠️ 7-14 days - Red banner with countdown
      }
      if (daysOffline >= 3) {
        return 'light'; // ⚠️ 3-7 days - Yellow banner
      }
    }
    
    return 'none'; // ✅ 0-3 days - Full access
  };

  // updateLastSync wrapper for external use
  const updateLastSync = useCallback(async (): Promise<void> => {
    const now = Date.now();
    await setLastServerSync(now);
    setLastSyncState(now);
    setDaysOffline(0);
    console.log('[OFFLINE_PREMIUM] ✅ Last sync updated');
  }, []);

  const value: OfflinePremiumContextType = {
    isOnline,
    offlineMode,
    daysOffline,
    lastSync,
    warningLevel: getWarningLevel(),
    hasOfflineAccess: hasOfflineAccess(),
    canAccessPremium: canAccessPremium(),
    offlineDataReady,
    offlineDataStatus,
    isPreparing,
    isSyncing,
    pendingSyncCount,
    triggerSync,
    updateLastSync,
    prepareOfflineData,
    refreshDataStatus
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

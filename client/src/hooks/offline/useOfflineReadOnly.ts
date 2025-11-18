import { useState, useEffect, useCallback, useContext } from 'react';
import { offlineDb } from '@/lib/offline/db';
import { OfflinePremiumContext } from '@/contexts/offline/OfflinePremiumContext';
import { Table } from 'dexie';

// ===========================
// 👁️ GENERIC READ-ONLY HOOK
// ===========================
// Generic hook for read-only offline modules
// Modules: Timetable, School Attendance, Delegated Admins, Reports, Academic Mgmt, Canteen, Bus
// Pattern: Cache-and-display (no offline modifications)

type ReadOnlyModule = 
  | 'timetable'
  | 'schoolAttendance'
  | 'delegatedAdmins'
  | 'reports'
  | 'academicData'
  | 'canteen'
  | 'bus';

interface UseOfflineReadOnlyOptions {
  module: ReadOnlyModule;
  apiEndpoint: string;
  schoolId: number;
  filterFn?: (item: any) => boolean; // Optional filter for cached data
}

export function useOfflineReadOnly<T extends { id: number; schoolId: number; lastCached: number }>({
  module,
  apiEndpoint,
  schoolId,
  filterFn
}: UseOfflineReadOnlyOptions) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOnline } = useContext(OfflinePremiumContext);

  // Get the appropriate table from offlineDb
  const getTable = useCallback((): Table<T, number> => {
    return offlineDb[module] as any as Table<T, number>;
  }, [module]);

  // ===========================
  // 📥 FETCH & CACHE FROM SERVER
  // ===========================
  const fetchAndCache = useCallback(async () => {
    if (!isOnline) {
      console.log(`[OFFLINE_${module.toUpperCase()}] Offline mode - loading from cache`);
      return;
    }

    try {
      console.log(`[OFFLINE_${module.toUpperCase()}] Fetching from server...`);
      const response = await fetch(apiEndpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${module}: ${response.status}`);
      }

      const serverData = await response.json();
      console.log(`[OFFLINE_${module.toUpperCase()}] Received items:`, serverData.length);

      const table = getTable();

      // Clear old cache for this school
      await table.where('schoolId').equals(schoolId).delete();

      // Cache server data with timestamp
      const dataToCache: T[] = serverData.map((item: any) => ({
        ...item,
        lastCached: Date.now()
      }));

      if (dataToCache.length > 0) {
        await table.bulkPut(dataToCache);
        console.log(`[OFFLINE_${module.toUpperCase()}] ✅ Cached`, dataToCache.length, 'items');
      }
    } catch (err) {
      console.error(`[OFFLINE_${module.toUpperCase()}] ❌ Fetch error:`, err);
      setError(err instanceof Error ? err.message : `Failed to fetch ${module}`);
    }
  }, [isOnline, module, apiEndpoint, schoolId, getTable]);

  // ===========================
  // 📖 LOAD FROM INDEXEDDB
  // ===========================
  const loadFromCache = useCallback(async () => {
    try {
      setIsLoading(true);
      const table = getTable();
      let cached = await table.where('schoolId').equals(schoolId).toArray();
      
      // Apply optional filter
      if (filterFn) {
        cached = cached.filter(filterFn);
      }

      console.log(`[OFFLINE_${module.toUpperCase()}] 📦 Loaded`, cached.length, 'items from cache');
      setData(cached);
      setError(null);
    } catch (err) {
      console.error(`[OFFLINE_${module.toUpperCase()}] ❌ Load error:`, err);
      setError(err instanceof Error ? err.message : `Failed to load ${module}`);
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, module, getTable, filterFn]);

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
  // 📊 CACHE STATUS
  // ===========================
  const getCacheAge = useCallback(() => {
    if (data.length === 0) return null;
    const oldestCache = Math.min(...data.map(item => item.lastCached));
    const ageMs = Date.now() - oldestCache;
    const ageMinutes = Math.floor(ageMs / (1000 * 60));
    return ageMinutes;
  }, [data]);

  return {
    data,
    isLoading,
    error,
    refresh: loadFromCache,
    cacheAgeMinutes: getCacheAge(),
    isStale: !isOnline && data.length > 0 // Data exists but may be outdated
  };
}

// ===========================
// 🎯 SPECIFIC MODULE HOOKS
// ===========================

export function useOfflineTimetable(schoolId: number, classId?: number) {
  return useOfflineReadOnly({
    module: 'timetable',
    apiEndpoint: '/api/director/timetable',
    schoolId,
    filterFn: classId ? (item: any) => item.classId === classId : undefined
  });
}

export function useOfflineSchoolAttendance(schoolId: number, dateRange?: { start: string; end: string }) {
  return useOfflineReadOnly({
    module: 'schoolAttendance',
    apiEndpoint: '/api/director/school-attendance',
    schoolId,
    filterFn: dateRange 
      ? (item: any) => item.date >= dateRange.start && item.date <= dateRange.end
      : undefined
  });
}

export function useOfflineDelegatedAdmins(schoolId: number) {
  return useOfflineReadOnly({
    module: 'delegatedAdmins',
    apiEndpoint: '/api/director/delegated-admins',
    schoolId
  });
}

export function useOfflineReports(schoolId: number, reportType?: string) {
  return useOfflineReadOnly({
    module: 'reports',
    apiEndpoint: '/api/director/reports',
    schoolId,
    filterFn: reportType ? (item: any) => item.type === reportType : undefined
  });
}

export function useOfflineAcademicData(schoolId: number, type?: 'bulletin' | 'grade' | 'exam') {
  return useOfflineReadOnly({
    module: 'academicData',
    apiEndpoint: '/api/director/academic-data',
    schoolId,
    filterFn: type ? (item: any) => item.type === type : undefined
  });
}

export function useOfflineCanteen(schoolId: number) {
  return useOfflineReadOnly({
    module: 'canteen',
    apiEndpoint: '/api/director/canteen',
    schoolId
  });
}

export function useOfflineBus(schoolId: number) {
  return useOfflineReadOnly({
    module: 'bus',
    apiEndpoint: '/api/director/bus',
    schoolId
  });
}

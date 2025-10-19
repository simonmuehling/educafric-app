# Educafric Offline System - Complete Guide

## Overview
The Educafric offline system enables the platform to work in areas with poor or intermittent internet connectivity, which is common in Africa. Users can continue working offline, and their actions are automatically synchronized when connection is restored.

## Architecture

### 1. Service Worker (`public/sw.js`)
- **Purpose**: Handles offline caching and background sync
- **Caching Strategies**:
  - **Cache-first**: Static assets (JS, CSS, images, fonts) load instantly from cache
  - **Network-first with timeout**: API calls try network first, fall back to cache
  - **Network-first with cache fallback**: HTML pages try network, use cache if offline
- **Background Sync**: Automatically syncs offline actions when connection returns

### 2. IndexedDB Storage (`client/src/services/offlineStorage.ts`)
- **Database**: `educafric-offline` (version 2)
- **Object Stores**:
  - `offlineQueue`: Stores actions to sync (attendance, grades, homework, messages)
  - `cachedData`: Stores cached data for offline access
  - `userPreferences`: Stores user-specific offline settings
- **Features**:
  - Queue actions for later sync
  - Cache data with TTL (time to live)
  - Automatic cleanup of expired cache
  - Retry mechanism with max retries (3)

### 3. Offline Sync Service (`client/src/services/offlineSync.ts`)
- **Purpose**: Synchronizes offline actions with the server
- **Features**:
  - Automatic sync when connection is restored
  - Periodic sync every 5 minutes (when online)
  - Manual sync trigger available
  - Batch sync for multiple actions
  - Retry logic with exponential backoff
  - Conflict resolution using timestamps

### 4. Custom Hook (`client/src/hooks/useOffline.ts`)
- **Purpose**: Provides offline state and functions to components
- **API**:
  ```typescript
  const {
    isOnline,          // Current online status
    isOfflineMode,     // Whether app is in offline mode
    queueSize,         // Number of pending sync actions
    isSyncing,         // Whether sync is in progress
    lastSyncTime,      // Timestamp of last successful sync
    queueAction,       // Queue an action for sync
    triggerSync,       // Manually trigger sync
    cacheData,         // Cache data for offline access
    getCachedData      // Retrieve cached data
  } = useOffline();
  ```

### 5. UI Components
- **OfflineBanner** (`client/src/components/offline/OfflineBanner.tsx`):
  - Shows when user is offline or has pending sync actions
  - Displays queue size and last sync time
  - Provides manual sync button
  - Bilingual support (French/English)
  
- **Offline Page** (`public/offline.html`):
  - Fallback page when app is completely offline
  - Auto-detects when connection is restored
  - Provides retry button
  - Optimized for African users

### 6. Backend Sync Endpoints (`server/routes/sync.ts`)
- **`POST /api/sync/attendance`**: Sync attendance records
- **`PUT /api/sync/attendance/:id`**: Update attendance record
- **`POST /api/sync/grades`**: Sync grade records
- **`PUT /api/sync/grades/:id`**: Update grade record
- **`POST /api/sync/homework`**: Sync homework records
- **`POST /api/sync/batch`**: Batch sync multiple actions
- **`GET /api/sync/status`**: Get sync status

## Usage Examples

### For Teachers: Mark Attendance Offline
```typescript
import { useOffline } from '@/hooks/useOffline';

function AttendancePage() {
  const { queueAction, isOnline } = useOffline();
  
  const markAttendance = async (studentId, status) => {
    if (!isOnline) {
      // Queue for later sync
      await queueAction('attendance', 'create', {
        studentId,
        classId: currentClassId,
        date: new Date(),
        status
      }, userId);
      
      toast.success('Attendance marked offline - will sync when online');
    } else {
      // Save directly
      await apiRequest('/api/attendance', { method: 'POST', body: { studentId, status } });
    }
  };
}
```

### For Students: Access Grades Offline
```typescript
import { useOffline } from '@/hooks/useOffline';

function GradesPage() {
  const { getCachedData, cacheData, isOnline } = useOffline();
  
  const fetchGrades = async () => {
    if (!isOnline) {
      // Get from cache
      const cachedGrades = await getCachedData('student-grades');
      if (cachedGrades) {
        return cachedGrades;
      }
      toast.info('No cached grades available offline');
      return [];
    } else {
      // Fetch from API and cache
      const response = await fetch('/api/grades');
      const grades = await response.json();
      await cacheData('student-grades', grades, 60); // Cache for 60 minutes
      return grades;
    }
  };
}
```

### For Parents: View Reports Offline
```typescript
function ParentDashboard() {
  const { isOnline, cacheData, getCachedData } = useOffline();
  
  useEffect(() => {
    const loadReports = async () => {
      if (isOnline) {
        const reports = await fetchReports();
        // Cache for offline access
        await cacheData('student-reports', reports, 120); // 2 hours
        setReports(reports);
      } else {
        const cached = await getCachedData('student-reports');
        if (cached) {
          setReports(cached);
        }
      }
    };
    
    loadReports();
  }, [isOnline]);
}
```

## Offline Strategies

### 1. Smart Detection
The system automatically detects network quality and adjusts behavior:
- **Excellent**: Full functionality, instant responses
- **Good**: Normal functionality with slight delays
- **Poor**: Activates offline optimizations
- **Offline**: Full offline mode with queuing

### 2. Data Priority
Data is prioritized for offline caching:
1. **Critical**: User profile, current classes, active students
2. **Important**: Recent grades, attendance records, homework
3. **Nice-to-have**: Historical data, reports, analytics

### 3. Conflict Resolution
When syncing offline changes:
- **Timestamps**: Later timestamps win
- **Versions**: Version numbers prevent overwrites
- **Manual**: User prompted for critical conflicts

## Best Practices

### For Developers
1. Always use `useOffline` hook for network-aware features
2. Cache critical data with appropriate TTL
3. Provide clear offline feedback to users
4. Test offline functionality regularly
5. Handle sync errors gracefully

### For Users
1. The app works offline automatically
2. Offline actions are queued and synced when online
3. Check the offline banner for sync status
4. Manually trigger sync if needed
5. Cached data has expiration - refresh when online

## Performance Optimizations

### For 2G/3G Networks
- **Lite Mode**: Automatically activated on slow connections
- **Compressed Assets**: All static assets are gzipped
- **Lazy Loading**: Images and components load on demand
- **Minimal Graphics**: Reduced animations on slow networks

### For Low-End Devices
- **Memory Management**: Automatic cache cleanup
- **Throttled Sync**: Sync in batches to avoid overwhelming device
- **Progressive Loading**: Content loads progressively

## Monitoring

### Client-Side
- Check queue size: `useOffline().queueSize`
- Monitor sync status: `useOffline().isSyncing`
- View last sync: `useOffline().lastSyncTime`

### Server-Side
- Sync endpoint logs: `[SYNC]` prefix in logs
- Failed syncs tracked in error metrics
- Queue statistics available via `/api/sync/status`

## Future Enhancements
1. **Pre-loading**: Download content for offline use (weekly lessons)
2. **USB Distribution**: Schools can distribute content via USB
3. **Peer Sync**: Sync via Bluetooth/WiFi Direct
4. **Smart Prefetch**: ML-based prediction of needed data
5. **Compressed Sync**: Delta sync for bandwidth savings

## Troubleshooting

### Issue: Actions not syncing
**Solution**:
1. Check online status
2. Verify queue size > 0
3. Manually trigger sync
4. Check browser console for errors

### Issue: Cached data not loading
**Solution**:
1. Check if data is expired (TTL)
2. Clear cache and reload
3. Verify IndexedDB is enabled

### Issue: Offline page not showing
**Solution**:
1. Ensure service worker is registered
2. Check `offline.html` exists in public folder
3. Verify service worker is active

## Security Considerations
1. **Authentication**: Offline actions require valid user session
2. **Validation**: Server validates all synced actions
3. **Encryption**: Sensitive offline data is encrypted
4. **Permissions**: Role-based checks on sync endpoints

## Conclusion
The Educafric offline system provides a robust solution for users in areas with poor connectivity. It seamlessly handles offline/online transitions, ensures data integrity, and provides clear user feedback throughout the process.

// Educafric Offline Sandbox Service
// Enables complete offline functionality for sandbox demo mode

import { offlineStorage } from './offlineStorage';
import { SANDBOX_OFFLINE_DATA, SANDBOX_SESSIONS, SANDBOX_CREDENTIALS } from '../data/sandboxOfflineData';

class OfflineSandboxService {
  private isInitialized = false;
  private offlineMode = false;

  // Initialize offline sandbox mode
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[OFFLINE_SANDBOX] Already initialized');
      return;
    }

    try {
      console.log('[OFFLINE_SANDBOX] 🚀 Initializing offline sandbox mode...');
      
      // Initialize offline storage
      await offlineStorage.init();

      // CRITICAL FIX: Only enable offline sandbox mode if explicitly in sandbox environment
      // Don't trigger for regular users who just lose connectivity
      const isExplicitSandbox = this.isSandboxEnvironment() || 
                                localStorage.getItem('educafric_sandbox_mode') === 'true';
      
      if (isExplicitSandbox) {
        console.log('[OFFLINE_SANDBOX] ✅ Explicit sandbox environment detected, pre-loading demo data...');
        this.offlineMode = true;
        await this.preloadAllSandboxData();
      } else {
        console.log('[OFFLINE_SANDBOX] Regular user detected, skipping sandbox data pre-load');
        this.offlineMode = false;
      }

      this.isInitialized = true;
      console.log('[OFFLINE_SANDBOX] ✅ Initialization complete (Sandbox mode:', this.offlineMode, ')');
    } catch (error) {
      console.error('[OFFLINE_SANDBOX] ❌ Initialization failed:', error);
      throw error;
    }
  }

  // Check if we're in sandbox environment
  private isSandboxEnvironment(): boolean {
    if (typeof window === 'undefined') return false;
    
    const path = window.location.pathname;
    const hostname = window.location.hostname;
    
    return (
      path.includes('/sandbox') ||
      path.includes('/enhanced-sandbox') ||
      hostname.includes('sandbox') ||
      hostname.includes('demo')
    );
  }

  // Pre-load all sandbox data into IndexedDB
  private async preloadAllSandboxData(): Promise<void> {
    console.log('[OFFLINE_SANDBOX] 📦 Pre-loading sandbox data...');

    try {
      // Cache users
      for (const user of SANDBOX_OFFLINE_DATA.users) {
        await offlineStorage.cacheUserProfile(user.id, user);
        await offlineStorage.cacheUserSettings(user.id, 
          SANDBOX_OFFLINE_DATA.settings[user.role.toLowerCase() as keyof typeof SANDBOX_OFFLINE_DATA.settings] || {}
        );
      }

      // Cache school data
      await offlineStorage.cacheData('school', SANDBOX_OFFLINE_DATA.school, 1440); // 24 hours

      // Cache classes
      await offlineStorage.cacheData('classes', SANDBOX_OFFLINE_DATA.classes, 1440);

      // Cache students
      await offlineStorage.cacheData('students', SANDBOX_OFFLINE_DATA.students, 720); // 12 hours

      // Cache grades
      await offlineStorage.cacheData('grades', SANDBOX_OFFLINE_DATA.grades, 240); // 4 hours

      // Cache attendance
      await offlineStorage.cacheData('attendance', SANDBOX_OFFLINE_DATA.attendance, 120); // 2 hours

      // Cache homework
      await offlineStorage.cacheData('homework', SANDBOX_OFFLINE_DATA.homework, 120);

      // Cache timetable
      await offlineStorage.cacheData('timetable', SANDBOX_OFFLINE_DATA.timetable, 1440);

      // Cache notifications for each user
      for (const notification of SANDBOX_OFFLINE_DATA.notifications) {
        const userNotifications = SANDBOX_OFFLINE_DATA.notifications.filter(n => n.userId === notification.userId);
        await offlineStorage.cacheNotifications(notification.userId, userNotifications);
      }

      // Cache dashboard stats for each role
      for (const [role, stats] of Object.entries(SANDBOX_OFFLINE_DATA.dashboardStats)) {
        const user = SANDBOX_OFFLINE_DATA.users.find(u => u.role.toLowerCase() === role);
        if (user) {
          await offlineStorage.cacheDashboardData(user.id, role, stats);
        }
      }

      // Cache sessions for offline authentication
      await offlineStorage.cacheData('sandbox-sessions', SANDBOX_SESSIONS, 525600); // 1 year

      console.log('[OFFLINE_SANDBOX] ✅ All sandbox data pre-loaded successfully');
    } catch (error) {
      console.error('[OFFLINE_SANDBOX] ❌ Failed to pre-load sandbox data:', error);
      throw error;
    }
  }

  // Offline authentication for sandbox
  async authenticateOffline(email: string, password: string): Promise<any> {
    console.log('[OFFLINE_SANDBOX] 🔐 Attempting offline authentication for:', email);

    // Validate credentials
    const expectedPassword = SANDBOX_CREDENTIALS[email as keyof typeof SANDBOX_CREDENTIALS];
    if (!expectedPassword || expectedPassword !== password) {
      throw new Error('Invalid credentials');
    }

    // Get session data
    const session = SANDBOX_SESSIONS[email as keyof typeof SANDBOX_SESSIONS];
    if (!session) {
      throw new Error('Session not found');
    }

    // Get user data
    const user = SANDBOX_OFFLINE_DATA.users.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }

    console.log('[OFFLINE_SANDBOX] ✅ Offline authentication successful');

    return {
      success: true,
      user: {
        ...user,
        sandboxMode: true,
        offlineMode: true
      },
      token: session.token,
      offlineMode: true
    };
  }

  // Check if offline mode is active
  isOfflineMode(): boolean {
    return this.offlineMode || !navigator.onLine;
  }

  // Enable offline mode manually
  enableOfflineMode(): void {
    this.offlineMode = true;
    console.log('[OFFLINE_SANDBOX] ✅ Offline mode enabled manually');
  }

  // Disable offline mode
  disableOfflineMode(): void {
    this.offlineMode = false;
    console.log('[OFFLINE_SANDBOX] ✅ Offline mode disabled');
  }

  // Get offline data for a specific endpoint
  async getOfflineData(endpoint: string, userId?: number): Promise<any> {
    console.log('[OFFLINE_SANDBOX] 📡 Fetching offline data for:', endpoint);

    try {
      // Parse endpoint and return appropriate cached data
      if (endpoint.includes('/api/profile') && userId) {
        return await offlineStorage.getCachedUserProfile(userId);
      }

      if (endpoint.includes('/api/settings') && userId) {
        return await offlineStorage.getCachedUserSettings(userId);
      }

      if (endpoint.includes('/api/notifications') && userId) {
        return await offlineStorage.getCachedNotifications(userId);
      }

      if (endpoint.includes('/api/dashboard') && userId) {
        const user = SANDBOX_OFFLINE_DATA.users.find(u => u.id === userId);
        if (user) {
          return await offlineStorage.getCachedDashboardData(userId, user.role.toLowerCase());
        }
      }

      if (endpoint.includes('/api/classes')) {
        return await offlineStorage.getCachedData('classes');
      }

      if (endpoint.includes('/api/students')) {
        return await offlineStorage.getCachedData('students');
      }

      if (endpoint.includes('/api/grades')) {
        return await offlineStorage.getCachedData('grades');
      }

      if (endpoint.includes('/api/attendance')) {
        return await offlineStorage.getCachedData('attendance');
      }

      if (endpoint.includes('/api/homework')) {
        return await offlineStorage.getCachedData('homework');
      }

      if (endpoint.includes('/api/timetable')) {
        return await offlineStorage.getCachedData('timetable');
      }

      if (endpoint.includes('/api/school')) {
        return await offlineStorage.getCachedData('school');
      }

      console.warn('[OFFLINE_SANDBOX] ⚠️ No offline data available for endpoint:', endpoint);
      return null;
    } catch (error) {
      console.error('[OFFLINE_SANDBOX] ❌ Error fetching offline data:', error);
      throw error;
    }
  }

  // Re-sync data when coming back online
  async syncWhenOnline(): Promise<void> {
    if (!navigator.onLine) {
      console.log('[OFFLINE_SANDBOX] ⚠️ Still offline, skipping sync');
      return;
    }

    console.log('[OFFLINE_SANDBOX] 🔄 Coming back online, syncing data...');

    try {
      // Get pending offline actions
      const pendingActions = await offlineStorage.getPendingActions();
      
      if (pendingActions.length === 0) {
        console.log('[OFFLINE_SANDBOX] ✅ No pending actions to sync');
        return;
      }

      console.log('[OFFLINE_SANDBOX] 📤 Syncing', pendingActions.length, 'pending actions...');

      // Sync each action
      for (const action of pendingActions) {
        try {
          // Attempt to sync action with backend
          const response = await fetch(`/api/offline/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action)
          });

          if (response.ok) {
            await offlineStorage.markActionSynced(action.id);
            await offlineStorage.deleteAction(action.id);
            console.log('[OFFLINE_SANDBOX] ✅ Synced action:', action.id);
          } else {
            await offlineStorage.incrementRetryCount(action.id);
            console.warn('[OFFLINE_SANDBOX] ⚠️ Failed to sync action:', action.id);
          }
        } catch (error) {
          await offlineStorage.incrementRetryCount(action.id);
          console.error('[OFFLINE_SANDBOX] ❌ Error syncing action:', action.id, error);
        }
      }

      console.log('[OFFLINE_SANDBOX] ✅ Sync complete');
    } catch (error) {
      console.error('[OFFLINE_SANDBOX] ❌ Sync failed:', error);
    }
  }

  // Get offline status info
  getOfflineStatus(): {
    isOffline: boolean;
    isSandbox: boolean;
    dataAvailable: boolean;
    pendingActions: number;
  } {
    return {
      isOffline: this.isOfflineMode(),
      isSandbox: this.isSandboxEnvironment(),
      dataAvailable: this.isInitialized,
      pendingActions: 0 // Will be populated async
    };
  }
}

// Export singleton instance
export const offlineSandboxService = new OfflineSandboxService();

// Initialize on import (non-blocking)
if (typeof window !== 'undefined') {
  offlineSandboxService.initialize().catch(err => {
    console.error('[OFFLINE_SANDBOX] Failed to initialize:', err);
  });

  // Listen for online/offline events
  window.addEventListener('online', () => {
    console.log('[OFFLINE_SANDBOX] 🌐 Connection restored');
    offlineSandboxService.disableOfflineMode();
    offlineSandboxService.syncWhenOnline();
  });

  window.addEventListener('offline', () => {
    console.log('[OFFLINE_SANDBOX] 📡 Connection lost, enabling offline mode');
    offlineSandboxService.enableOfflineMode();
  });
}

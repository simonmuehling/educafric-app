/**
 * PWA Cleanup Utility - Prevents session crashes by managing resources
 */

export class PWACleanupManager {
  private static instance: PWACleanupManager;
  private cleanupInterval: number | null = null;

  private constructor() {
    this.startCleanupProcess();
  }

  public static getInstance(): PWACleanupManager {
    if (!PWACleanupManager.instance) {
      PWACleanupManager.instance = new PWACleanupManager();
    }
    return PWACleanupManager.instance;
  }

  private startCleanupProcess() {
    // Clean up session storage every 5 minutes to prevent memory issues
    this.cleanupInterval = window.setInterval(() => {
      this.cleanupSessionStorage();
      this.cleanupConsole();
    }, 300000); // 5 minutes

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  private cleanupSessionStorage() {
    try {
      // Clean old PWA tracking sessions
      const keysToClean = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith('pwa_') && key.includes('_tracked')) {
          keysToClean.push(key);
        }
      }
      
      keysToClean.forEach(key => {
        sessionStorage.removeItem(key);
      });

      if (keysToClean.length > 0) {
        console.log(`[PWA_CLEANUP] Cleaned ${keysToClean.length} old session storage entries`);
      }
    } catch (error) {
      console.warn('[PWA_CLEANUP] Session storage cleanup failed:', error);
    }
  }

  private cleanupConsole() {
    // Clear excessive console logs to prevent memory buildup in development
    if (console.clear && typeof console.clear === 'function') {
      const logCount = (window as any).__console_log_count || 0;
      if (logCount > 1000) {
        console.log('[PWA_CLEANUP] Clearing console to prevent memory overflow');
        console.clear();
        (window as any).__console_log_count = 0;
      }
    }
  }

  public cleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Initialize cleanup on import
if (typeof window !== 'undefined') {
  PWACleanupManager.getInstance();
}

export default PWACleanupManager;
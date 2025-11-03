import { useEffect, useState } from 'react';

interface VersionInfo {
  version: string;
  buildTime: string;
  buildHash: string;
  cacheVersion: string;
  timestamp: number;
}

interface PWAUpdateStatus {
  hasUpdate: boolean;
  currentVersion: string | null;
  newVersion: string | null;
  isChecking: boolean;
  lastChecked: Date | null;
}

const CHECK_INTERVAL = 5 * 60 * 1000;
const STORAGE_KEY = 'pwa_current_version';

export function usePWAUpdate() {
  const [status, setStatus] = useState<PWAUpdateStatus>({
    hasUpdate: false,
    currentVersion: null,
    newVersion: null,
    isChecking: false,
    lastChecked: null
  });

  const getCurrentVersion = (): string | null => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const setCurrentVersion = (version: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, version);
    } catch (error) {
      console.error('[PWA_UPDATE] Failed to save version:', error);
    }
  };

  const checkForUpdates = async (): Promise<boolean> => {
    if (status.isChecking) {
      return false;
    }

    setStatus(prev => ({ ...prev, isChecking: true }));

    try {
      const response = await fetch('/version.json?nocache=' + Date.now(), {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch version');
      }

      const versionInfo: VersionInfo = await response.json();
      const currentVersion = getCurrentVersion();
      const newCacheVersion = versionInfo.cacheVersion;

      console.log('[PWA_UPDATE] Version check:', {
        current: currentVersion,
        new: newCacheVersion,
        hasUpdate: currentVersion !== null && currentVersion !== newCacheVersion
      });

      if (currentVersion === null) {
        setCurrentVersion(newCacheVersion);
        setStatus({
          hasUpdate: false,
          currentVersion: newCacheVersion,
          newVersion: null,
          isChecking: false,
          lastChecked: new Date()
        });
        return false;
      }

      const hasUpdate = currentVersion !== newCacheVersion;

      setStatus({
        hasUpdate,
        currentVersion,
        newVersion: hasUpdate ? newCacheVersion : null,
        isChecking: false,
        lastChecked: new Date()
      });

      return hasUpdate;
    } catch (error) {
      console.error('[PWA_UPDATE] Check failed:', error);
      setStatus(prev => ({
        ...prev,
        isChecking: false,
        lastChecked: new Date()
      }));
      return false;
    }
  };

  const applyUpdate = () => {
    console.log('[PWA_UPDATE] Applying update - reloading page');
    
    if (status.newVersion) {
      setCurrentVersion(status.newVersion);
      console.log('[PWA_UPDATE] Saved new version to localStorage:', status.newVersion);
    }
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.update().then(() => {
            if (registration.waiting) {
              registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            setTimeout(() => window.location.reload(), 100);
          });
        } else {
          setTimeout(() => window.location.reload(), 100);
        }
      });
    } else {
      setTimeout(() => window.location.reload(), 100);
    }
  };

  const dismissUpdate = () => {
    setStatus(prev => ({
      ...prev,
      hasUpdate: false,
      newVersion: null
    }));
  };

  useEffect(() => {
    checkForUpdates();

    const interval = setInterval(checkForUpdates, CHECK_INTERVAL);

    if ('serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'SW_ACTIVATED') {
          const newVersion = event.data.version;
          console.log('[PWA_UPDATE] New service worker activated:', newVersion);
          
          if (newVersion) {
            setCurrentVersion(newVersion);
            console.log('[PWA_UPDATE] Updated localStorage to new SW version:', newVersion);
          }
          
          checkForUpdates();
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);

      return () => {
        clearInterval(interval);
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }

    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
    ...status,
    checkForUpdates,
    applyUpdate,
    dismissUpdate
  };
}

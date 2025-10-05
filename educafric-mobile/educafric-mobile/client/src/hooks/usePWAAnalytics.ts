import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Global in-flight request deduplication map to prevent networking memory overflow
const inFlightRequests = new Map<string, Promise<any>>();

// Memory cleanup for in-flight requests
setInterval(() => {
  if (inFlightRequests.size > 50) {
    console.log('[PWA_ANALYTICS] Clearing old in-flight requests to prevent memory overflow');
    inFlightRequests.clear();
  }
}, 60000); // Clean every minute

// Request deduplication helper to prevent Chrome networking memory issues
async function fetchOnce<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key) as Promise<T>;
  }
  
  const promise = fetchFn().finally(() => {
    inFlightRequests.delete(key);
  });
  
  inFlightRequests.set(key, promise);
  return promise;
}

// PWA Analytics Hook for tracking and monitoring
export const usePWAAnalytics = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Skip analytics for sandbox users - Check multiple sandbox indicators
  const isSandboxUser = Boolean(
    user?.email?.includes('sandbox.') ||
    user?.email?.includes('.demo@') ||
    user?.email?.includes('@educafric.demo') ||
    user?.email?.includes('@test.educafric.com') ||
    (typeof window !== 'undefined' && window?.location?.pathname.includes('/sandbox'))
  );

  // Track PWA session
  const trackSession = useMutation({
    mutationFn: async (data: {
      userId?: number;
      sessionId: string;
      accessMethod: 'web' | 'pwa' | 'mobile_app';
      deviceType?: string;
      userAgent?: string;
      isStandalone?: boolean;
      isPwaInstalled?: boolean;
      pushPermissionGranted?: boolean;
    }) => {
      // Skip tracking for sandbox users
      if (isSandboxUser) {
        console.log('[PWA_ANALYTICS] Skipping tracking for sandbox user');
        return { success: true, message: 'Sandbox user - tracking disabled' };
      }

      // Use request deduplication to prevent networking memory overflow
      const requestKey = `pwa-session-${data.sessionId}-${data.accessMethod}`;
      
      return fetchOnce(requestKey, async () => {
        const controller = new AbortController();
        
        try {
          const response = await fetch('/api/analytics/pwa/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            signal: controller.signal,
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error(`PWA session tracking failed: ${response.status}`);
          }

          return response.json();
        } catch (error) {
          // Silent fail to prevent UI errors and networking memory overflow
          console.log('[PWA_ANALYTICS] Session tracking failed:', error);
          return { success: false, message: 'Session tracking failed', error: String(error) };
        }
      });


    },

  });

  // Track PWA installation
  const trackInstallation = useMutation({
    mutationFn: async (data: {
      deviceType?: string;
      userAgent?: string;
    }) => {
      // Skip tracking for sandbox users
      if (isSandboxUser) {
        console.log('[PWA_ANALYTICS] Skipping installation tracking for sandbox user');
        return { success: true, message: 'Sandbox user - tracking disabled' };
      }

      // Use request deduplication to prevent networking memory overflow
      const requestKey = `pwa-install-${data.deviceType}-${Date.now()}`;
      
      return fetchOnce(requestKey, async () => {
        const controller = new AbortController();
        
        try {
          const response = await fetch('/api/analytics/pwa/install', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            signal: controller.signal,
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error('Failed to track PWA installation');
          }

          return response.json();
        } catch (error) {
          console.log('[PWA_ANALYTICS] Installation tracking failed:', error);
          return { success: false, message: 'Installation tracking failed', error: String(error) };
        }
      });
    },

  });

  // Auto-detect and track PWA usage - with render loop prevention
  const autoTrackPWAUsage = useCallback((userId?: number) => {
    // Debounce to prevent multiple calls in rapid succession
    const debounceKey = `auto-track-debounce-${userId || 'anonymous'}`;
    if ((window as any)[debounceKey]) {
      return; // Already processing
    }
    (window as any)[debounceKey] = true;
    setTimeout(() => delete (window as any)[debounceKey], 5000);
    try {
      // Skip tracking for sandbox users
      if (isSandboxUser) {
        console.log('[PWA_ANALYTICS] Skipping auto-tracking for sandbox user');
        return;
      }

      // Prevent render loop - only track once per session
      const sessionKey = 'pwa_analytics_tracked';
      if (typeof window !== 'undefined' && window.sessionStorage?.getItem(sessionKey)) {
        return; // Already tracked this session
      }
      // Detect if running as PWA
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any)?.standalone ||
                          document.referrer.includes('android-app://');

      // Detect PWA installation capability
      const isPwaInstalled = isStandalone;

      // Detect device type
      const userAgent = navigator.userAgent;
      let deviceType = 'desktop';
      if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
        deviceType = /iPad/.test(userAgent) ? 'tablet' : 'mobile';
      }

      // Determine access method
      const accessMethod = isStandalone ? 'pwa' : 'web';

      // Check push notification permissions
      let pushPermissionGranted = false;
      if ('Notification' in window) {
        pushPermissionGranted = Notification.permission === 'granted';
      }

      // Generate unique session ID for analytics
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Mark this session as tracked to prevent loops
      if (typeof window !== 'undefined') {
        window.sessionStorage?.setItem(sessionKey, sessionId);
      }

      // Auto-track session data
      console.log('[PWA_ANALYTICS] Auto-tracking initialized:', {
        accessMethod,
        deviceType,
        isStandalone,
        isPwaInstalled
      });

      // Execute tracking with retry logic using deduplication
      const trackingKey = `auto-track-${sessionId}`;
      fetchOnce(trackingKey, async () => {
        return trackSession.mutateAsync({
          userId,
          sessionId,
          accessMethod,
          deviceType: deviceType,
          userAgent,
          isStandalone,
          isPwaInstalled,
          pushPermissionGranted
        });
      }).catch(error => {
        console.log('[PWA_ANALYTICS] Auto-tracking failed silently:', error);
      });

      // Listen for PWA installation (only once per session)
      if (!window.sessionStorage?.getItem('pwa_listeners_added')) {
        window.addEventListener('beforeinstallprompt', (e) => {
          console.log('[PWA_ANALYTICS] PWA installation prompt shown');
        });

        window.addEventListener('appinstalled', () => {
          console.log('[PWA_ANALYTICS] PWA installed by user');
          trackInstallation.mutate({
            deviceType,
            userAgent,
          });
        });

        window.sessionStorage?.setItem('pwa_listeners_added', 'true');
      }

    } catch (error) {
      console.error('[PWA_ANALYTICS] Auto-tracking failed:', error);
    }
  }, [trackSession, trackInstallation, isSandboxUser]);

  return {
    trackSession,
    trackInstallation,
    autoTrackPWAUsage,
    isTrackingSession: trackSession.isPending,
    isTrackingInstallation: trackInstallation.isPending,
  };
};

// PWA Detection utilities
export const getPWAInfo = () => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any)?.standalone ||
                      document.referrer.includes('android-app://');

  const isInstallable = 'serviceWorker' in navigator && 'PushManager' in window;

  const getDeviceType = () => {
    const userAgent = navigator.userAgent;
    if (/iPad/.test(userAgent)) return 'tablet';
    if (/Mobile|Android|iPhone/.test(userAgent)) return 'mobile';
    return 'desktop';
  };

  const getDisplayMode = () => {
    if (isStandalone) return 'standalone';
    if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
    if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui';
    return 'browser';
  };

  return {
    isStandalone,
    isInstallable,
    deviceType: getDeviceType(),
    displayMode: getDisplayMode(),
    hasNotificationSupport: 'Notification' in window,
    notificationPermission: 'Notification' in window ? Notification.permission : 'default',
    hasServiceWorkerSupport: 'serviceWorker' in navigator,
    hasPushSupport: 'PushManager' in window,
  };
};

export default usePWAAnalytics;
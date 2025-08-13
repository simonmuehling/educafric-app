import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

// PWA Analytics Hook for tracking and monitoring
export const usePWAAnalytics = () => {
  const queryClient = useQueryClient();

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
      const response = await fetch('/api/analytics/pwa/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to track PWA session');
      }

      return response.json();
    },
    onError: (error) => {
      console.error('PWA session tracking failed:', error);
      // Don't show toast for tracking failures to avoid disrupting user experience
    }
  });

  // Track PWA installation
  const trackInstallation = useMutation({
    mutationFn: async (data: {
      deviceType?: string;
      userAgent?: string;
    }) => {
      const response = await fetch('/api/analytics/pwa/install', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to track PWA installation');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Installation PWA enregistrée",
        description: "Votre installation PWA a été comptabilisée dans nos statistiques",
      });
    },
    onError: (error) => {
      console.error('PWA installation tracking failed:', error);
    }
  });

  // Auto-detect and track PWA usage
  const autoTrackPWAUsage = useCallback((userId?: number) => {
    try {
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

      // Generate session ID
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Track the session
      trackSession.mutate({
        userId,
        sessionId,
        accessMethod,
        deviceType,
        userAgent,
        isStandalone,
        isPwaInstalled,
        pushPermissionGranted,
      });

      // Listen for PWA installation
      window.addEventListener('beforeinstallprompt', (e) => {
        console.log('[PWA_ANALYTICS] PWA installation prompt shown');
        // This event fires when PWA is installable
      });

      // Listen for app installed event
      window.addEventListener('appinstalled', () => {
        console.log('[PWA_ANALYTICS] PWA installed by user');
        trackInstallation.mutate({
          deviceType,
          userAgent,
        });
      });

      console.log('[PWA_ANALYTICS] Auto-tracking initialized:', {
        accessMethod,
        deviceType,
        isStandalone,
        isPwaInstalled,
      });

    } catch (error) {
      console.error('[PWA_ANALYTICS] Auto-tracking failed:', error);
    }
  }, [trackSession, trackInstallation]);

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
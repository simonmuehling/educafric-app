import { useState, useEffect } from 'react';

interface NotificationPermissions {
  permission: NotificationPermission;
  supported: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  showNotification: (title: string, options?: NotificationOptions) => Promise<boolean>;
}

export const useNotificationPermissions = (): NotificationPermissions => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported] = useState<boolean>(() => {
    // Enhanced mobile support detection
    const hasNotificationAPI = 'Notification' in window;
    const hasServiceWorker = 'serviceWorker' in navigator;
    const isSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';
    
    console.log('[NOTIFICATION_PERMISSIONS] 🔍 Support check:', {
      hasNotificationAPI,
      hasServiceWorker,
      isSecureContext,
      userAgent: navigator.userAgent
    });
    
    return hasNotificationAPI && hasServiceWorker && isSecureContext;
  });

  useEffect(() => {
    if (supported) {
      setPermission(Notification.permission);
    }
  }, [supported]);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!supported) {
      console.error('[NOTIFICATION_PERMISSIONS] ❌ Notifications not supported');
      return 'denied';
    }

    try {
      console.log('[NOTIFICATION_PERMISSIONS] 🔔 Requesting permission...');
      
      // Check if permission is already granted
      if (Notification.permission === 'granted') {
        console.log('[NOTIFICATION_PERMISSIONS] ✅ Permission already granted');
        return 'granted';
      }
      
      // For mobile browsers, ensure we have user gesture
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        console.log('[NOTIFICATION_PERMISSIONS] 📱 Mobile device detected - requesting permission with user gesture');
      }
      
      const result = await Notification.requestPermission();
      console.log('[NOTIFICATION_PERMISSIONS] 📋 Permission result:', result);
      
      setPermission(result);
      
      // Show success/failure feedback
      if (result === 'granted') {
        console.log('[NOTIFICATION_PERMISSIONS] ✅ Permission granted successfully');
      } else if (result === 'denied') {
        console.log('[NOTIFICATION_PERMISSIONS] ❌ Permission denied by user');
      } else {
        console.log('[NOTIFICATION_PERMISSIONS] ⏳ Permission still pending');
      }
      
      return result;
    } catch (error) {
      console.error('[NOTIFICATION_PERMISSIONS] ❌ Failed to request permission:', error);
      return 'denied';
    }
  };

  const showNotification = async (title: string, options?: NotificationOptions): Promise<boolean> => {
    if (!supported || permission !== 'granted') {
      console.warn('Notifications not supported or permission not granted');
      return false;
    }

    try {
      // Try to use service worker first for better persistence
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          options: {
            ...options,
            icon: options?.icon || '/educafric-logo-128.png',
            badge: '/educafric-logo-128.png',
            tag: options?.tag || `notification-${Date.now()}`,
            requireInteraction: options?.requireInteraction !== undefined ? options.requireInteraction : false,
          }
        });
        return true;
      } else {
        // Fallback to browser notification
        new Notification(title, {
          ...options,
          icon: options?.icon || '/educafric-logo-128.png',
          tag: options?.tag || `notification-${Date.now()}`,
        });
        return true;
      }
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  };

  return {
    permission,
    supported,
    requestPermission,
    showNotification
  };
};
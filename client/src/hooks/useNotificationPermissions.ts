import { useState, useEffect } from 'react';

interface NotificationPermissions {
  permission: NotificationPermission;
  supported: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  showNotification: (title: string, options?: NotificationOptions) => Promise<boolean>;
}

export const useNotificationPermissions = (): NotificationPermissions => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported] = useState<boolean>('Notification' in window && 'serviceWorker' in navigator);

  useEffect(() => {
    if (supported) {
      setPermission(Notification.permission);
    }
  }, [supported]);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!supported) return 'denied';

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
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
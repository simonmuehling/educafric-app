import { useEffect } from 'react';
import realTimeNotifications from '@/services/realTimeNotifications';

export const usePWANotifications = (userId: number | null, isAuthenticated: boolean) => {
  useEffect(() => {
    if (isAuthenticated && userId) {
      // Connect to real-time notifications
      realTimeNotifications.connect(userId);
      
      return () => {
        realTimeNotifications.disconnect();
      };
    }
  }, [userId, isAuthenticated]);

  // Test function for manual notification testing
  const testNotification = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title: '🧪 Test de notification EDUCAFRIC',
        options: {
          body: 'Cette notification teste le système PWA. Si vous la voyez, tout fonctionne !',
          icon: '/educafric-logo-128.png',
          tag: 'test-notification',
          requireInteraction: false,
          actions: [
            {
              action: 'test_view',
              title: 'Voir',
              icon: '/icons/view.png'
            }
          ]
        }
      });
    }
  };

  return { testNotification };
};
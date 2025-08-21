// Real-time PWA notifications service
class RealTimeNotifications {
  private static instance: RealTimeNotifications;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private userId: number | null = null;

  private constructor() {}

  public static getInstance(): RealTimeNotifications {
    if (!RealTimeNotifications.instance) {
      RealTimeNotifications.instance = new RealTimeNotifications();
    }
    return RealTimeNotifications.instance;
  }

  public async connect(userId: number) {
    this.userId = userId;
    
    // Check for notifications every 10 seconds
    this.startPolling();
    
    // Request notification permission if not granted
    if ('Notification' in window && Notification.permission === 'default') {
      await this.requestPermission();
    }
  }

  private async requestPermission(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.showWelcomeNotification();
        return true;
      }
      return false;
    } catch (error) {
      console.error('[PWA_NOTIFICATIONS] Permission request failed:', error);
      return false;
    }
  }

  private showWelcomeNotification() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title: '🎉 Notifications EDUCAFRIC activées',
        options: {
          body: 'Vous recevrez maintenant les alertes importantes en temps réel.',
          icon: '/educafric-logo-128.png',
          tag: 'welcome-notification',
          requireInteraction: false
        }
      });
    }
  }

  private async startPolling() {
    if (!this.userId) return;

    try {
      const response = await fetch(`/api/notifications/pending/${this.userId}`);
      if (response.ok) {
        const pendingNotifications = await response.json();
        
        for (const notification of pendingNotifications) {
          this.showPWANotification(notification);
          // Mark as delivered
          await fetch(`/api/notifications/${notification.id}/delivered`, { method: 'POST' });
        }
      }
    } catch (error) {
      console.error('[PWA_NOTIFICATIONS] Polling failed:', error);
    }

    // Continue polling every 10 seconds
    setTimeout(() => this.startPolling(), 10000);
  }

  private showPWANotification(notification: any) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title: notification.title,
        options: {
          body: notification.message,
          icon: '/educafric-logo-128.png',
          badge: '/android-icon-192x192.png',
          tag: `notification-${notification.id}`,
          data: {
            url: notification.actionUrl || '/',
            userId: this.userId,
            type: notification.type,
            timestamp: Date.now()
          },
          actions: notification.actionText ? [
            {
              action: 'view',
              title: notification.actionText,
              icon: '/icons/view.png'
            },
            {
              action: 'dismiss',
              title: 'Fermer',
              icon: '/icons/close.png'
            }
          ] : undefined,
          requireInteraction: notification.priority === 'high' || notification.priority === 'urgent'
        }
      });
    }
  }

  public disconnect() {
    this.isConnected = false;
    this.userId = null;
  }
}

export default RealTimeNotifications.getInstance();
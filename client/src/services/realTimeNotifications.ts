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
    
    // Set up message listener for auto-open navigation
    this.setupAutoOpenListener();
    
    // Check for notifications every 10 seconds
    this.startPolling();
    
    // Request notification permission if not granted
    if ('Notification' in window && Notification.permission === 'default') {
      await this.requestPermission();
    }
  }

  // Set up listener for auto-open navigation messages from Service Worker
  private setupAutoOpenListener() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'AUTO_OPEN_NOTIFICATION' && event.data?.url) {
          console.log('[PWA_NOTIFICATIONS] 🚀 Auto-opening from Service Worker:', event.data.url);
          window.location.href = event.data.url;
        }
      });
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
      const response = await fetch(`/api/notifications/pending/${this.userId}`, {
        credentials: 'include', // Include authentication cookies
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const pendingNotifications = await response.json();
        console.log(`[PWA_NOTIFICATIONS] 📬 Found ${pendingNotifications.length} pending notifications`);
        
        for (const notification of pendingNotifications) {
          console.log(`[PWA_NOTIFICATIONS] 📱 Processing notification: ${notification.title}`);
          
          // Attempt to show notification
          const displaySuccess = await this.showPWANotification(notification);
          
          // Only mark as delivered if successfully displayed
          if (displaySuccess) {
            try {
              const deliveredResponse = await fetch(`/api/notifications/${notification.id}/delivered`, { 
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                }
              });
              
              if (deliveredResponse.ok) {
                console.log(`[PWA_NOTIFICATIONS] ✅ Notification ${notification.id} marked as delivered`);
              } else {
                console.error(`[PWA_NOTIFICATIONS] ❌ Failed to mark notification ${notification.id} as delivered`);
              }
            } catch (error) {
              console.error(`[PWA_NOTIFICATIONS] ❌ Error marking notification ${notification.id} as delivered:`, error);
            }
          } else {
            console.warn(`[PWA_NOTIFICATIONS] ⚠️ Notification ${notification.id} display failed, not marking as delivered`);
          }
        }
      } else {
        console.error(`[PWA_NOTIFICATIONS] ❌ Failed to fetch pending notifications: ${response.status}`);
      }
    } catch (error) {
      console.error('[PWA_NOTIFICATIONS] ❌ Polling failed:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log(`[PWA_NOTIFICATIONS] 🔄 Retrying in ${this.reconnectInterval}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      } else {
        console.error('[PWA_NOTIFICATIONS] ❌ Max reconnection attempts reached');
        return; // Stop polling
      }
    }

    // Continue polling every 10 seconds
    setTimeout(() => this.startPolling(), 10000);
  }

  private async showPWANotification(notification: any): Promise<boolean> {
    console.log('[PWA_NOTIFICATIONS] 📱 Attempting to show notification:', notification.title);
    
    // Check if notifications are supported and permissions granted
    if (!('Notification' in window)) {
      console.error('[PWA_NOTIFICATIONS] ❌ Notifications not supported');
      return false;
    }
    
    if (Notification.permission !== 'granted') {
      console.error('[PWA_NOTIFICATIONS] ❌ Notification permission not granted');
      return false;
    }

    const notificationData = {
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
          notificationId: notification.id,
          timestamp: Date.now(),
          autoOpen: this.shouldAutoOpen(notification) // Add auto-open flag
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
        requireInteraction: notification.priority === 'high' || notification.priority === 'urgent',
        vibrate: [200, 100, 200]
      }
    };

    try {
      // Method 1: Try Service Worker controller
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        console.log('[PWA_NOTIFICATIONS] 🔧 Using Service Worker controller');
        
        // Set up listener for SW confirmation
        const confirmationPromise = new Promise((resolve) => {
          const messageHandler = (event: MessageEvent) => {
            if (event.data?.type === 'NOTIFICATION_SHOWN' && event.data?.tag === notificationData.options.tag) {
              navigator.serviceWorker?.removeEventListener('message', messageHandler);
              resolve(true);
            } else if (event.data?.type === 'NOTIFICATION_ERROR' && event.data?.tag === notificationData.options.tag) {
              navigator.serviceWorker?.removeEventListener('message', messageHandler);
              resolve(false);
            }
          };
          
          navigator.serviceWorker.addEventListener('message', messageHandler);
          
          // Timeout after 3 seconds
          setTimeout(() => {
            navigator.serviceWorker?.removeEventListener('message', messageHandler);
            resolve(false);
          }, 3000);
        });
        
        navigator.serviceWorker.controller.postMessage(notificationData);
        
        const confirmed = await confirmationPromise;
        if (confirmed) {
          console.log('[PWA_NOTIFICATIONS] ✅ Service Worker notification confirmed');
          return true;
        }
      }
      
      // Method 2: Fallback to registration.showNotification
      if ('serviceWorker' in navigator) {
        console.log('[PWA_NOTIFICATIONS] 🔄 Trying Service Worker registration fallback');
        
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(notificationData.title, notificationData.options);
        
        console.log('[PWA_NOTIFICATIONS] ✅ Registration notification shown');
        return true;
      }
      
      // Method 3: Direct notification fallback
      console.log('[PWA_NOTIFICATIONS] 🔄 Using direct Notification API');
      
      const directNotification = new Notification(notificationData.title, {
        body: notificationData.options.body,
        icon: notificationData.options.icon,
        tag: notificationData.options.tag,
        data: notificationData.options.data,
        requireInteraction: notificationData.options.requireInteraction,
        vibrate: notificationData.options.vibrate
      });
      
      // Auto-open notification if configured
      if (notificationData.options.data?.autoOpen && notificationData.options.data?.url) {
        console.log('[PWA_NOTIFICATIONS] 🚀 Auto-opening notification:', notificationData.options.data.url);
        setTimeout(() => {
          window.location.href = notificationData.options.data.url;
        }, 1000); // Small delay to let user see the notification
      }
      
      directNotification.onclick = () => {
        console.log('[PWA_NOTIFICATIONS] ✅ Direct notification clicked');
        if (notificationData.options.data?.url) {
          window.open(notificationData.options.data.url, '_blank');
        }
        directNotification.close();
      };
      
      console.log('[PWA_NOTIFICATIONS] ✅ Direct notification shown');
      return true;
      
    } catch (error) {
      console.error('[PWA_NOTIFICATIONS] ❌ All notification methods failed:', error);
      return false;
    }
  }

  // Determine if notification should auto-open based on type and priority
  private shouldAutoOpen(notification: any): boolean {
    // Auto-open for high priority notifications or specific types
    const autoOpenTypes = ['emergency', 'security', 'urgent_grade', 'attendance_alert', 'geolocation'];
    const autoOpenPriority = ['high', 'urgent'];
    
    // Check settings from localStorage (user preference)
    const autoOpenEnabled = localStorage.getItem('educafric-auto-open-notifications') !== 'false'; // Default: true
    
    if (!autoOpenEnabled) {
      return false;
    }
    
    // Auto-open based on priority
    if (autoOpenPriority.includes(notification.priority)) {
      return true;
    }
    
    // Auto-open based on notification type
    if (autoOpenTypes.includes(notification.type)) {
      return true;
    }
    
    // Auto-open if it has an actionUrl (actionable notification)
    if (notification.actionUrl && notification.actionUrl !== '/') {
      return true;
    }
    
    return false;
  }

  // Enable/disable auto-open functionality
  public setAutoOpenEnabled(enabled: boolean) {
    localStorage.setItem('educafric-auto-open-notifications', enabled.toString());
    console.log(`[PWA_NOTIFICATIONS] 🔧 Auto-open ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Check if auto-open is enabled
  public isAutoOpenEnabled(): boolean {
    return localStorage.getItem('educafric-auto-open-notifications') !== 'false';
  }

  public disconnect() {
    this.isConnected = false;
    this.userId = null;
  }
}

export default RealTimeNotifications.getInstance();
import { enableFCMNotifications, testFCMNotification } from './fcmNotifications';

// Real-time PWA notifications service with FCM and polling fallback
class RealTimeNotifications {
  private static instance: RealTimeNotifications;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private userId: number | null = null;
  private fcmEnabled = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private useFallback = false;

  private constructor() {}

  public static getInstance(): RealTimeNotifications {
    if (!RealTimeNotifications.instance) {
      RealTimeNotifications.instance = new RealTimeNotifications();
    }
    return RealTimeNotifications.instance;
  }

  public async connect(userId: number) {
    this.userId = userId;
    
    console.log('[REAL_TIME_NOTIFICATIONS] 🚀 Connecting for user:', userId);
    
    // Set up message listener for auto-open navigation
    this.setupAutoOpenListener();
    
    // Step 1: Try to enable FCM first
    const fcmResult = await this.tryEnableFCM(userId);
    
    if (fcmResult.success) {
      console.log('[REAL_TIME_NOTIFICATIONS] ✅ FCM enabled successfully, using FCM for notifications');
      this.fcmEnabled = true;
      this.useFallback = false;
      
      // Test FCM with a welcome notification
      try {
        await testFCMNotification(userId, '🎉 Notifications FCM activées', 'Vous recevez maintenant les notifications en temps réel via FCM!');
      } catch (error) {
        console.warn('[REAL_TIME_NOTIFICATIONS] ⚠️ FCM test failed, will fallback to polling:', error);
        this.startPollingFallback();
      }
    } else {
      console.warn('[REAL_TIME_NOTIFICATIONS] ⚠️ FCM setup failed, using polling fallback:', fcmResult.error);
      this.startPollingFallback();
    }
    
    // Always request notification permission if not granted
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

  // Try to enable FCM first
  private async tryEnableFCM(userId: number): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[REAL_TIME_NOTIFICATIONS] 🔥 Attempting to enable FCM...');
      const result = await enableFCMNotifications(userId);
      
      if (result.success) {
        console.log('[REAL_TIME_NOTIFICATIONS] ✅ FCM enabled successfully');
        return { success: true };
      } else {
        console.warn('[REAL_TIME_NOTIFICATIONS] ⚠️ FCM setup failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error('[REAL_TIME_NOTIFICATIONS] ❌ FCM setup error:', error);
      return { success: false, error: error.message };
    }
  }

  // Fallback to polling when FCM is not available
  private startPollingFallback() {
    console.log('[REAL_TIME_NOTIFICATIONS] 📡 Starting polling fallback...');
    this.useFallback = true;
    this.fcmEnabled = false;
    
    // Clear any existing interval
    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval);
    }
    
    this.startPolling();
  }

  private async startPolling() {
    if (!this.userId) return;
    
    // Only poll if using fallback mode
    if (!this.useFallback) {
      console.log('[REAL_TIME_NOTIFICATIONS] 🚫 Skipping polling - FCM is enabled');
      return;
    }

    console.log('[REAL_TIME_NOTIFICATIONS] 📡 Polling for notifications (fallback mode)...');

    try {
      const response = await fetch(`/api/notifications/pending/${this.userId}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const pendingNotifications = await response.json();
        console.log(`[REAL_TIME_NOTIFICATIONS] 📬 Found ${pendingNotifications.length} pending notifications (polling)`);
        
        for (const notification of pendingNotifications) {
          console.log(`[REAL_TIME_NOTIFICATIONS] 📱 Processing notification: ${notification.title}`);
          
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
                console.log(`[REAL_TIME_NOTIFICATIONS] ✅ Notification ${notification.id} marked as delivered`);
              } else {
                console.error(`[REAL_TIME_NOTIFICATIONS] ❌ Failed to mark notification ${notification.id} as delivered`);
              }
            } catch (error) {
              console.error(`[REAL_TIME_NOTIFICATIONS] ❌ Error marking notification ${notification.id} as delivered:`, error);
            }
          } else {
            console.warn(`[REAL_TIME_NOTIFICATIONS] ⚠️ Notification ${notification.id} display failed, not marking as delivered`);
          }
        }
        
        // Reset reconnect attempts on success
        this.reconnectAttempts = 0;
      } else {
        console.error(`[REAL_TIME_NOTIFICATIONS] ❌ Failed to fetch pending notifications: ${response.status}`);
        this.reconnectAttempts++;
      }
    } catch (error) {
      console.error('[REAL_TIME_NOTIFICATIONS] ❌ Polling failed:', error);
      this.reconnectAttempts++;
    }
    
    // Handle reconnection logic
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[REAL_TIME_NOTIFICATIONS] ❌ Max reconnection attempts reached, stopping polling');
      return;
    }
    
    if (this.reconnectAttempts > 0) {
      console.log(`[REAL_TIME_NOTIFICATIONS] 🔄 Will retry polling in ${this.reconnectInterval}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    }

    // Continue polling every 10 seconds (or after reconnect delay)
    const delay = this.reconnectAttempts > 0 ? this.reconnectInterval : 10000;
    this.pollingInterval = setTimeout(() => this.startPolling(), delay);
  }

  // Public method to test FCM functionality
  public async testFCM(): Promise<boolean> {
    if (!this.userId) {
      console.error('[REAL_TIME_NOTIFICATIONS] ❌ No user ID for FCM test');
      return false;
    }
    
    try {
      console.log('[REAL_TIME_NOTIFICATIONS] 🧪 Testing FCM notification...');
      await testFCMNotification(this.userId);
      console.log('[REAL_TIME_NOTIFICATIONS] ✅ FCM test successful');
      return true;
    } catch (error) {
      console.error('[REAL_TIME_NOTIFICATIONS] ❌ FCM test failed:', error);
      return false;
    }
  }
  
  // Get current notification mode
  public getNotificationMode(): 'fcm' | 'polling' | 'disabled' {
    if (this.fcmEnabled && !this.useFallback) return 'fcm';
    if (this.useFallback) return 'polling';
    return 'disabled';
  }
  
  // Disconnect and cleanup
  public disconnect() {
    console.log('[REAL_TIME_NOTIFICATIONS] 🔌 Disconnecting...');
    
    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    this.isConnected = false;
    this.fcmEnabled = false;
    this.useFallback = false;
    this.userId = null;
    this.reconnectAttempts = 0;
  }

  private async showPWANotification(notification: any): Promise<boolean> {
    console.log('[REAL_TIME_NOTIFICATIONS] 📱 Attempting to show notification:', notification.title);
    
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
        console.log('[REAL_TIME_NOTIFICATIONS] 🔧 Using Service Worker controller');
        
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
      
      // Method 2: Fallback to registration.showNotification (with timeout)
      if ('serviceWorker' in navigator) {
        console.log('[PWA_NOTIFICATIONS] 🔄 Trying Service Worker registration fallback');
        
        try {
          // Add timeout to prevent indefinite wait when SW is disabled
          const registration = await Promise.race([
            navigator.serviceWorker.ready,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Service Worker not ready within 2 seconds')), 2000)
            )
          ]) as ServiceWorkerRegistration;
          
          await registration.showNotification(notificationData.title, notificationData.options);
          console.log('[PWA_NOTIFICATIONS] ✅ Registration notification shown');
          return true;
        } catch (error) {
          console.log('[PWA_NOTIFICATIONS] ⚠️ Service Worker not ready, falling back to direct notification');
        }
      }
      
      // Method 3: Direct notification fallback
      console.log('[PWA_NOTIFICATIONS] 🔄 Using direct Notification API');
      
      const directNotification = new Notification(notificationData.title, {
        body: notificationData.options.body,
        icon: notificationData.options.icon,
        tag: notificationData.options.tag,
        data: notificationData.options.data,
        requireInteraction: notificationData.options.requireInteraction
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

}

export default RealTimeNotifications.getInstance();
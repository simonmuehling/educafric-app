// Hybrid notification service - Works with or without Service Worker
class HybridNotificationService {
  private static instance: HybridNotificationService;
  private hasServiceWorker = false;
  private hasNotificationPermission = false;

  private constructor() {
    this.checkCapabilities();
  }

  public static getInstance(): HybridNotificationService {
    if (!HybridNotificationService.instance) {
      HybridNotificationService.instance = new HybridNotificationService();
    }
    return HybridNotificationService.instance;
  }

  private async checkCapabilities() {
    // Check notification support
    this.hasNotificationPermission = 'Notification' in window && Notification.permission === 'granted';
    
    // Check service worker support and registration
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        this.hasServiceWorker = !!registration;
        console.log('[HYBRID_NOTIFICATIONS] Service Worker available:', this.hasServiceWorker);
      } catch (error) {
        this.hasServiceWorker = false;
        console.log('[HYBRID_NOTIFICATIONS] Service Worker not available');
      }
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('[HYBRID_NOTIFICATIONS] Notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.hasNotificationPermission = permission === 'granted';
      
      if (this.hasNotificationPermission) {
        console.log('[HYBRID_NOTIFICATIONS] ✅ Permission granted');
        this.showWelcomeNotification();
      } else {
        console.log('[HYBRID_NOTIFICATIONS] ❌ Permission denied');
      }
      
      return this.hasNotificationPermission;
    } catch (error) {
      console.error('[HYBRID_NOTIFICATIONS] Permission request failed:', error);
      return false;
    }
  }

  private showWelcomeNotification() {
    this.showNotification({
      title: '🎉 Notifications EDUCAFRIC activées',
      body: 'Vous recevrez maintenant les alertes importantes en temps réel.',
      icon: '/educafric-logo-128.png',
      tag: 'welcome-notification'
    });
  }

  public showNotification(options: {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
    actions?: Array<{action: string, title: string, icon?: string}>;
    data?: any;
    vibrate?: number[];
  }) {
    if (!this.hasNotificationPermission) {
      console.log('[HYBRID_NOTIFICATIONS] No permission, showing console notification');
      this.showConsoleNotification(options);
      return;
    }

    // Try Service Worker first if available
    if (this.hasServiceWorker && navigator.serviceWorker.controller) {
      console.log('[HYBRID_NOTIFICATIONS] Using Service Worker');
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title: options.title,
        options: {
          body: options.body,
          icon: options.icon || '/educafric-logo-128.png',
          badge: '/android-icon-192x192.png',
          tag: options.tag || 'hybrid-notification',
          data: options.data || {},
          actions: options.actions || [],
          requireInteraction: options.requireInteraction || false,
          vibrate: options.vibrate || [200, 100, 200]
        }
      });
    } else {
      // Fallback to direct Notification API
      console.log('[HYBRID_NOTIFICATIONS] Using direct Notification API');
      this.showDirectNotification(options);
    }
  }

  private showDirectNotification(options: {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
    vibrate?: number[];
  }) {
    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/educafric-logo-128.png',
        tag: options.tag || 'direct-notification',
        requireInteraction: options.requireInteraction || false
      });

      // Vibrate separately if supported
      if (options.vibrate && 'vibrate' in navigator) {
        navigator.vibrate(options.vibrate);
      }

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      // Handle clicks
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      console.log('[HYBRID_NOTIFICATIONS] ✅ Direct notification shown');
    } catch (error) {
      console.error('[HYBRID_NOTIFICATIONS] Direct notification failed:', error);
      this.showConsoleNotification(options);
    }
  }

  private showConsoleNotification(options: {title: string, body: string}) {
    console.log(`🔔 NOTIFICATION: ${options.title}\n📝 ${options.body}`);
    
    // Show in-page notification as fallback
    this.showInPageNotification(options);
  }

  private showInPageNotification(options: {title: string, body: string}) {
    // Create a temporary in-page notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1e40af;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 300px;
      font-family: system-ui, -apple-system, sans-serif;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 4px;">${options.title}</div>
      <div style="font-size: 14px; opacity: 0.9;">${options.body}</div>
      <button onclick="this.parentElement.remove()" style="
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 16px;
      ">×</button>
    `;

    // Add CSS animation
    if (!document.querySelector('#notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  // Test methods for different notification types
  public testBasicNotification() {
    this.showNotification({
      title: '🧪 Test EDUCAFRIC',
      body: 'Cette notification teste le système hybride. Si vous la voyez, tout fonctionne !',
      tag: 'test-basic'
    });
  }

  public testSecurityAlert() {
    this.showNotification({
      title: '🚨 Alerte de sécurité EDUCAFRIC',
      body: 'Test d\'alerte de géolocalisation - Votre enfant a quitté une zone de sécurité.',
      tag: 'test-security',
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
      actions: [
        { action: 'view_location', title: 'Voir position' },
        { action: 'dismiss', title: 'Fermer' }
      ]
    });
  }

  public testGradeNotification() {
    this.showNotification({
      title: '📚 Nouvelle note EDUCAFRIC',
      body: 'Emma a reçu une nouvelle note en Mathématiques : 18/20 - Excellent travail !',
      tag: 'test-grade',
      actions: [
        { action: 'view_grades', title: 'Voir notes' }
      ]
    });
  }

  public testHomeworkReminder() {
    this.showNotification({
      title: '📝 Rappel devoir EDUCAFRIC',
      body: 'N\'oubliez pas : Devoir de Français à rendre demain - Analyse de texte',
      tag: 'test-homework'
    });
  }

  public getStatus() {
    return {
      hasServiceWorker: this.hasServiceWorker,
      hasNotificationPermission: this.hasNotificationPermission,
      notificationSupport: 'Notification' in window,
      serviceWorkerSupport: 'serviceWorker' in navigator
    };
  }
}

export default HybridNotificationService.getInstance();
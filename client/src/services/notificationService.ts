import { apiRequest } from '@/lib/queryClient';

export interface InAppNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  isRead: boolean;
  readAt?: string;
  actionRequired: boolean;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  senderRole?: string;
  relatedEntityType?: string;
}

export interface PWANotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{ action: string; title: string; icon?: string }>;
  data?: any;
}

class NotificationService {
  private static instance: NotificationService;
  private notificationListeners: ((notification: InAppNotification) => void)[] = [];

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize service worker and notifications
  async initialize(): Promise<boolean> {
    try {
      // Register service worker if not already registered
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      return false;
    }
  }

  // Request notification permissions
  async requestPermissions(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    return await Notification.requestPermission();
  }

  // Show PWA notification
  async showPWANotification(options: PWANotificationOptions): Promise<boolean> {
    const permission = await this.requestPermissions();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Send to service worker for persistent notifications
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          ...options,
          icon: options.icon || '/educafric-logo-128.png',
          badge: options.badge || '/educafric-logo-128.png',
        });
      } else {
        // Fallback to direct browser notification
        new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/educafric-logo-128.png',
          tag: options.tag || `notification-${Date.now()}`,
          requireInteraction: options.requireInteraction,
          data: options.data
        });
      }
      return true;
    } catch (error) {
      console.error('Failed to show PWA notification:', error);
      return false;
    }
  }

  // Create in-app notification that appears in Notification Center
  async createInAppNotification(notification: Omit<InAppNotification, 'id' | 'createdAt' | 'isRead'>): Promise<InAppNotification | null> {
    try {
      const response = await apiRequest('POST', '/api/notifications', {
        ...notification,
        isRead: false,
        createdAt: new Date().toISOString()
      });

      const newNotification = response.data as InAppNotification;
      
      // Notify listeners
      this.notificationListeners.forEach(listener => listener(newNotification));
      
      // Also show as PWA notification
      await this.showPWANotification({
        title: notification.title,
        body: notification.message,
        tag: `app-notification-${newNotification.id}`,
        data: { notificationId: newNotification.id, type: notification.type }
      });

      return newNotification;
    } catch (error) {
      console.error('Failed to create in-app notification:', error);
      return null;
    }
  }

  // Listen for new notifications
  onNotification(listener: (notification: InAppNotification) => void): () => void {
    this.notificationListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.notificationListeners.indexOf(listener);
      if (index > -1) {
        this.notificationListeners.splice(index, 1);
      }
    };
  }

  // Handle messages from service worker
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, data } = event.data;
    
    switch (type) {
      case 'NOTIFICATION_CLICKED':
        this.handleNotificationClick(data);
        break;
      case 'NOTIFICATION_CLOSED':
        this.handleNotificationClose(data);
        break;
    }
  }

  // Handle notification click
  private handleNotificationClick(data: any): void {
    console.log('Notification clicked:', data);
    
    // If there's an action URL, navigate to it
    if (data.actionUrl) {
      window.location.href = data.actionUrl;
    } else if (data.notificationId) {
      // Mark as read and focus the notification center
      this.markNotificationAsRead(data.notificationId);
    }
  }

  // Handle notification close
  private handleNotificationClose(data: any): void {
    console.log('Notification closed:', data);
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: number): Promise<void> {
    try {
      await apiRequest('PUT', `/api/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  // Test notifications (for development)
  async testNotification(): Promise<void> {
    await this.createInAppNotification({
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working properly.',
      type: 'system',
      priority: 'medium',
      category: 'administrative',
      actionRequired: false,
      senderRole: 'System'
    });
  }
}

export const notificationService = NotificationService.getInstance();
export default notificationService;
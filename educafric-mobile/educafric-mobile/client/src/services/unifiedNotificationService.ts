// Unified Notification Service - Consolidated PWA + In-App Notifications
export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'grade' | 'attendance' | 'homework' | 'emergency';

export interface UnifiedNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  category: 'system' | 'educational' | 'user-action';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

class UnifiedNotificationService {
  private static instance: UnifiedNotificationService;
  private registration: ServiceWorkerRegistration | null = null;
  private permission: NotificationPermission = 'default';
  private inAppCallbacks: ((notification: UnifiedNotification) => void)[] = [];

  private constructor() {
    this.init();
  }

  public static getInstance(): UnifiedNotificationService {
    if (!UnifiedNotificationService.instance) {
      UnifiedNotificationService.instance = new UnifiedNotificationService();
    }
    return UnifiedNotificationService.instance;
  }

  private async init() {
    if (!('Notification' in window)) return;
    
    this.permission = Notification.permission;
    
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator?.serviceWorker?.ready;
      } catch (error) {
        console.warn('Service Worker not available:', error);
      }
    }
  }

  // Register in-app notification callback
  public registerInAppCallback(callback: (notification: UnifiedNotification) => void) {
    this?.inAppCallbacks?.push(callback);
  }

  public unregisterInAppCallback(callback: (notification: UnifiedNotification) => void) {
    this.inAppCallbacks = (Array.isArray(this.inAppCallbacks) ? this.inAppCallbacks : []).filter(cb => cb !== callback);
  }

  // Request permission once for both systems
  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    if (this.permission === 'granted') return true;

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        this.sendWelcomeNotification();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  // Unified send method - handles both in-app and PWA
  public async send(config: Omit<UnifiedNotification, 'id'>): Promise<void> {
    const notification: UnifiedNotification = {
      ...config,
      id: `unified-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    // Always send in-app notification
    this.sendInApp(notification);

    // Send PWA notification for high priority or educational notifications
    if (config.priority === 'high' || config.priority === 'urgent' || config.category === 'educational') {
      await this.sendPWA(notification);
    }
  }

  private sendInApp(notification: UnifiedNotification) {
    this?.inAppCallbacks?.forEach(callback => callback(notification));
  }

  private async sendPWA(notification: UnifiedNotification) {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    try {
      const options: NotificationOptions = {
        body: notification.message,
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: notification.type,
        data: { 
          type: notification.type,
          category: notification.category,
          url: this.getUrlForType(notification.type)
        },
        requireInteraction: notification.priority === 'urgent',
        silent: notification.priority === 'low'
      };

      // Mobile vibration
      if ('vibrate' in navigator) {
        const vibrationPattern = this.getVibrationPattern(notification.priority);
        navigator.vibrate(vibrationPattern);
      }

      if (this.registration?.showNotification) {
        await this?.registration?.showNotification(notification.title, options);
      } else {
        new Notification(notification.title, options);
      }
    } catch (error) {
      console.error('PWA notification failed:', error);
    }
  }

  private getUrlForType(type: NotificationType): string {
    const routes: Record<NotificationType, string> = {
      'success': '/dashboard',
      'error': '/dashboard',
      'warning': '/dashboard',
      'info': '/dashboard',
      'grade': '/grades',
      'attendance': '/attendance',
      'homework': '/homework',
      'emergency': '/dashboard'
    };
    return routes[type] || '/';
  }

  private getVibrationPattern(priority: UnifiedNotification['priority']): number[] {
    const patterns: Record<typeof priority, number[]> = {
      'low': [100],
      'medium': [200, 100, 200],
      'high': [300, 100, 300, 100, 300],
      'urgent': [500, 200, 500, 200, 500, 200, 500]
    };
    return patterns[priority];
  }

  private async sendWelcomeNotification() {
    const language = navigator?.language?.startsWith('fr') ? 'fr' : 'en';
    const messages = {
      en: { title: '🎓 Welcome to Educafric!', message: 'Notifications are now active for instant updates.' },
      fr: { title: '🎓 Bienvenue sur Educafric!', message: 'Les notifications sont maintenant actives pour les mises à jour instantanées.' }
    };

    // Delay welcome notification to avoid permission request conflicts
    setTimeout(async () => {
      await this.send({
        type: 'success',
        title: messages[language].title,
        message: messages[language].message,
        category: 'system',
        priority: 'medium',
        duration: 4000
      });
    }, 1000);
  }

  // Convenience methods for common notification types
  public async success(title: string, message: string, duration = 5000) {
    await this.send({ type: 'success', title, message, category: 'user-action', priority: 'medium', duration });
  }

  public async error(title: string, message: string, duration = 7000) {
    await this.send({ type: 'error', title, message, category: 'system', priority: 'high', duration });
  }

  public async warning(title: string, message: string, duration = 6000) {
    await this.send({ type: 'warning', title, message, category: 'system', priority: 'medium', duration });
  }

  public async info(title: string, message: string, duration = 5000) {
    await this.send({ type: 'info', title, message, category: 'user-action', priority: 'low', duration });
  }

  // Educational notifications
  public async grade(studentName: string, subject: string, grade: string, language: 'en' | 'fr' = 'en') {
    const messages = {
      en: { title: `New Grade: ${studentName}`, message: `${subject}: ${grade} - Check your dashboard` },
      fr: { title: `Nouvelle Note: ${studentName}`, message: `${subject}: ${grade} - Consultez votre tableau de bord` }
    };

    await this.send({
      type: 'grade',
      title: messages[language].title,
      message: messages[language].message,
      category: 'educational',
      priority: 'high',
      persistent: true
    });
  }

  public async attendance(studentName: string, status: 'present' | 'absent', language: 'en' | 'fr' = 'en') {
    const messages = {
      en: {
        title: `Attendance: ${studentName}`,
        message: status === 'present' ? `${studentName} arrived safely` : `${studentName} is absent - please verify`
      },
      fr: {
        title: `Présence: ${studentName}`,
        message: status === 'present' ? `${studentName} est arrivé(e) en sécurité` : `${studentName} est absent(e) - veuillez vérifier`
      }
    };

    await this.send({
      type: 'attendance',
      title: messages[language].title,
      message: messages[language].message,
      category: 'educational',
      priority: status === 'absent' ? 'high' : 'medium',
      persistent: status === 'absent'
    });
  }

  public async homework(subject: string, dueDate: string, language: 'en' | 'fr' = 'en') {
    const messages = {
      en: { title: 'Homework Reminder', message: `${subject} assignment due ${dueDate}` },
      fr: { title: 'Rappel Devoirs', message: `Devoir ${subject} à rendre ${dueDate}` }
    };

    await this.send({
      type: 'homework',
      title: messages[language].title,
      message: messages[language].message,
      category: 'educational',
      priority: 'medium'
    });
  }

  public async emergency(message: string, language: 'en' | 'fr' = 'en') {
    const titles = {
      en: '🚨 Emergency Alert',
      fr: '🚨 Alerte Urgence'
    };

    await this.send({
      type: 'emergency',
      title: titles[language],
      message,
      category: 'educational',
      priority: 'urgent',
      persistent: true
    });
  }

  public async test(language: 'en' | 'fr' = 'en') {
    const messages = {
      en: { title: '✅ Test Notification', message: 'All notification systems working perfectly!' },
      fr: { title: '✅ Notification Test', message: 'Tous les systèmes de notification fonctionnent parfaitement!' }
    };

    await this.send({
      type: 'success',
      title: messages[language].title,
      message: messages[language].message,
      category: 'system',
      priority: 'medium'
    });
  }

  // Status methods
  public getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  public isSupported(): boolean {
    return 'Notification' in window;
  }
}

export const unifiedNotificationService = UnifiedNotificationService.getInstance();
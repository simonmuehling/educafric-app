/**
 * Service de gestion de connexion PWA pour EducAfric
 * Assure une connexion constante et la qualité des notifications
 */

interface ConnectionState {
  isOnline: boolean;
  isConnected: boolean;
  lastPingTime: number;
  retryCount: number;
  quality: 'excellent' | 'good' | 'poor' | 'offline';
}

interface NotificationQueue {
  id: string;
  timestamp: number;
  type: string;
  data: any;
  retryCount: number;
}

class PWAConnectionManager {
  private state: ConnectionState = {
    isOnline: navigator.onLine,
    isConnected: false,
    lastPingTime: 0,
    retryCount: 0,
    quality: 'offline'
  };

  private pingInterval: number | null = null;
  private reconnectTimeout: number | null = null;
  private notificationQueue: NotificationQueue[] = [];
  private maxRetries = 5;
  private pingIntervalMs = 300000; // 5 minutes (reduced frequency to prevent memory issues)
  private reconnectDelayMs = 10000; // 10 secondes

  private listeners: Array<(state: ConnectionState) => void> = [];

  constructor() {
    // Only initialize if not already initialized to prevent memory leaks
    if (typeof window !== 'undefined' && !(window as any).__pwa_connection_initialized) {
      this.initializeConnectionMonitoring();
      this.startPeriodicPing();
      this.setupServiceWorkerSync();
      (window as any).__pwa_connection_initialized = true;
    }
  }

  /**
   * Initialise la surveillance de la connexion
   */
  private initializeConnectionMonitoring() {
    // Surveillance du statut en ligne/hors ligne
    window.addEventListener('online', () => {
      console.log('[PWA_CONNECTION] 🌐 Connexion internet rétablie');
      this.state.isOnline = true;
      this.handleConnectionRestore();
    });

    window.addEventListener('offline', () => {
      console.log('[PWA_CONNECTION] 📶 Connexion internet perdue');
      this.state.isOnline = false;
      this.state.quality = 'offline';
      this.notifyListeners();
    });

    // Surveillance de la visibilité de la page
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('[PWA_CONNECTION] 👀 Application visible - vérification connexion');
        this.checkConnection();
      }
    });

    // Surveillance des erreurs de fetch
    this.interceptFetchErrors();
  }

  /**
   * Démarre le ping périodique pour maintenir la connexion
   */
  private startPeriodicPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = window.setInterval(() => {
      this.performHealthCheck();
    }, this.pingIntervalMs);

    // Premier ping immédiat
    this.performHealthCheck();
  }

  /**
   * Effectue un contrôle de santé de la connexion
   */
  private async performHealthCheck() {
    if (!this.state.isOnline) {
      return;
    }

    try {
      const startTime = Date.now();
      
      // Create AbortController for better browser compatibility
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-cache',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const endTime = Date.now();
      const latency = endTime - startTime;

      if (response.ok) {
        this.state.isConnected = true;
        this.state.lastPingTime = Date.now();
        this.state.retryCount = 0;
        this.state.quality = this.calculateQuality(latency);

        console.log(`[PWA_CONNECTION] ✅ Ping réussi (${latency}ms) - Qualité: ${this.state.quality}`);
        
        // Traiter les notifications en attente
        await this.processQueuedNotifications();
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      // Silently handle ping failures to reduce console noise
      this.state.quality = 'poor';
      this.handleConnectionError();
    }

    this.notifyListeners();
  }

  /**
   * Calcule la qualité de connexion basée sur la latence
   */
  private calculateQuality(latency: number): 'excellent' | 'good' | 'poor' | 'offline' {
    if (latency < 200) return 'excellent';
    if (latency < 500) return 'good';
    if (latency < 1000) return 'poor';
    return 'poor';
  }

  /**
   * Gère les erreurs de connexion
   */
  private handleConnectionError() {
    this.state.isConnected = false;
    this.state.retryCount++;

    if (this.state.retryCount < this.maxRetries) {
      const delay = Math.min(this.reconnectDelayMs * Math.pow(2, this.state.retryCount), 60000);
      console.log(`[PWA_CONNECTION] 🔄 Tentative de reconnexion dans ${delay}ms (${this.state.retryCount}/${this.maxRetries})`);
      
      this.reconnectTimeout = window.setTimeout(() => {
        this.performHealthCheck();
      }, delay);
    } else {
      // Handle connection failure gracefully
      this.state.quality = 'offline';
      this.state.isConnected = false;
    }
  }

  /**
   * Gère la restauration de connexion
   */
  private async handleConnectionRestore() {
    console.log('[PWA_CONNECTION] 🔄 Restauration de la connexion...');
    this.state.retryCount = 0;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    await this.performHealthCheck();
    await this.syncWithServer();
  }

  /**
   * Synchronise avec le serveur après reconnexion
   */
  private async syncWithServer() {
    try {
      console.log('[PWA_CONNECTION] 🔄 Synchronisation avec le serveur...');
      
      // Récupérer les notifications manquées
      const response = await fetch('/api/notifications/missed', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const missedNotifications = await response.json();
        console.log(`[PWA_CONNECTION] 📨 ${missedNotifications.length} notifications manquées récupérées`);
        
        // Traiter les notifications manquées
        for (const notification of missedNotifications) {
          await this.displayNotification(notification);
        }
      }
    } catch (error) {
      console.error('[PWA_CONNECTION] Erreur de synchronisation:', error);
    }
  }

  /**
   * Configure la synchronisation en arrière-plan via Service Worker
   */
  private setupServiceWorkerSync() {
    // Configuration du sync en arrière-plan corrigé pour éviter InvalidAccessError
    if ('serviceWorker' in navigator && 'serviceWorker' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        // Feature detect avant utilisation
        if ('sync' in registration) {
          try {
            // Tag court (max 64 chars) et descriptif
            const syncTag = 'pwa-sync';
            (registration as any).sync.register(syncTag);
            console.log('[PWA_CONNECTION] 🔄 Background sync enregistré');
          } catch (error: any) {
            // Silent fail - pas critique pour l'app
            console.log('[PWA_CONNECTION] Background sync non disponible');
          }
        }
      }).catch(() => {
        // Service worker pas disponible, ce n'est pas critique
        console.log('[PWA_CONNECTION] Service Worker non disponible');
      });
    }
  }

  /**
   * Intercepte les erreurs de fetch pour détecter les problèmes de connexion
   */
  private interceptFetchErrors() {
    // Only intercept if not already intercepted to prevent multiple wrappings
    if ((window as any).__pwa_fetch_intercepted) {
      return;
    }
    
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Only log connection issues for our API endpoints
        if (!response.ok && response.status >= 500 && args[0]?.toString().includes('/api/')) {
          this.handleConnectionError();
        }
        
        return response;
      } catch (error) {
        // Only log network errors for our API endpoints
        if (args[0]?.toString().includes('/api/')) {
          console.warn('[PWA_CONNECTION] Network error for API endpoint:', error);
          this.handleConnectionError();
        }
        throw error;
      }
    };
    
    (window as any).__pwa_fetch_intercepted = true;
  }

  /**
   * Ajoute une notification à la file d'attente
   */
  public queueNotification(notification: any) {
    const queueItem: NotificationQueue = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: notification.type,
      data: notification,
      retryCount: 0
    };

    this.notificationQueue.push(queueItem);
    console.log(`[PWA_CONNECTION] 📝 Notification ajoutée à la file (${this.notificationQueue.length} en attente)`);

    // Essayer de traiter immédiatement si connecté
    if (this.state.isConnected) {
      this.processQueuedNotifications();
    }
  }

  /**
   * Traite les notifications en file d'attente
   */
  private async processQueuedNotifications() {
    if (!this.state.isConnected || this.notificationQueue.length === 0) {
      return;
    }

    console.log(`[PWA_CONNECTION] 📤 Traitement de ${this.notificationQueue.length} notifications en file`);

    const processed: string[] = [];

    for (const item of this.notificationQueue) {
      try {
        await this.displayNotification(item.data);
        processed.push(item.id);
        console.log(`[PWA_CONNECTION] ✅ Notification ${item.id} traitée`);
      } catch (error) {
        console.error(`[PWA_CONNECTION] ❌ Erreur notification ${item.id}:`, error);
        item.retryCount++;
        
        if (item.retryCount >= 3) {
          processed.push(item.id);
          console.log(`[PWA_CONNECTION] 🗑️ Notification ${item.id} abandonnée après 3 tentatives`);
        }
      }
    }

    // Supprimer les notifications traitées
    this.notificationQueue = this.notificationQueue.filter(
      item => !processed.includes(item.id)
    );
  }

  /**
   * Affiche une notification
   */
  private async displayNotification(notificationData: any) {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      
      const notificationOptions: NotificationOptions = {
        body: notificationData.message,
        icon: '/educafric-logo-128.png',
        badge: '/android-icon-192x192.png',
        tag: `educafric-${notificationData.type}-${Date.now()}`,
        data: notificationData,
        requireInteraction: notificationData.priority === 'high'
      };

      // Ajouter les actions si supportées
      if (notificationData.actions && 'actions' in Notification.prototype) {
        (notificationOptions as any).actions = notificationData.actions;
      }
      
      await registration.showNotification(notificationData.title, notificationOptions);
    }
  }

  /**
   * Vérifie la connexion manuellement
   */
  public async checkConnection(): Promise<boolean> {
    await this.performHealthCheck();
    return this.state.isConnected;
  }

  /**
   * Obtient l'état actuel de la connexion
   */
  public getConnectionState(): ConnectionState {
    return { ...this.state };
  }

  /**
   * Ajoute un listener pour les changements d'état
   */
  public addStateListener(listener: (state: ConnectionState) => void) {
    this.listeners.push(listener);
  }

  /**
   * Supprime un listener
   */
  public removeStateListener(listener: (state: ConnectionState) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notifie tous les listeners
   */
  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        console.error('[PWA_CONNECTION] Erreur listener:', error);
      }
    });
  }

  /**
   * Nettoie les ressources
   */
  public destroy() {
    console.log('[PWA_CONNECTION] 🧹 Cleaning up resources...');
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.listeners = [];
    this.notificationQueue = [];
    
    // Clear global initialization flag
    if (typeof window !== 'undefined') {
      delete (window as any).__pwa_connection_initialized;
    }
  }
}

// Instance singleton
export const pwaConnectionManager = new PWAConnectionManager();
export default PWAConnectionManager;
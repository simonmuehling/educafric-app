/**
 * Service de gestion de connexion PWA pour EducAfric
 * Assure une connexion constante et la qualité des notifications
 * Optimisé pour les smartphones africains de basse gamme
 */
import { deviceDetector } from '../utils/deviceDetector';
import { connectionFallback } from '../utils/connectionFallback';

interface ConnectionState {
  isOnline: boolean;
  isConnected: boolean;
  lastPingTime: number;
  retryCount: number;
  quality: 'excellent' | 'good' | 'poor' | 'offline';
  deviceMode: 'basic' | 'standard' | 'advanced';
  batteryLevel?: number;
}

interface NotificationQueue {
  id: string;
  timestamp: number;
  type: string;
  data: any;
  retryCount: number;
}

// PRODUCTION SAFE: This service has been replaced by HealthMonitorMigration
// All functionality moved to centralized health monitoring (no fake responses)
class PWAConnectionManager {
  private state: ConnectionState = {
    isOnline: navigator.onLine,
    isConnected: false,
    lastPingTime: 0,
    retryCount: 0,
    quality: 'offline',
    deviceMode: 'standard'
  };

  private pingInterval: number | null = null;
  private reconnectTimeout: number | null = null;
  private batteryCheckInterval: number | null = null;
  private notificationQueue: NotificationQueue[] = [];
  private maxRetries = 5;
  private pingIntervalMs = 600000; // OPTIMIZED: Default 10 minutes minimum
  private reconnectDelayMs = 10000; // 10 secondes
  private maxQueueSize = 50; // Sera ajusté selon l'appareil
  private isPageVisible = true; // Track page visibility for idle detection
  private consecutiveFailures = 0; // Track failures for exponential backoff

  private listeners: Array<(state: ConnectionState) => void> = [];
  
  // Event handler references for proper cleanup
  private handleFallbackOffline = (event: any) => {
    console.log('[PWA_CONNECTION] 🔄 Mode fallback hors ligne activé');
    this.state.quality = 'offline';
    this.state.isConnected = false;
    this.notifyListeners();
  };
  
  private handleFallbackOnline = (event: any) => {
    console.log('[PWA_CONNECTION] ✅ Mode fallback en ligne restauré');
    this.state.isConnected = true;
    this.performHealthCheck();
  };
  
  private handleOnline = () => {
    console.log('[PWA_CONNECTION] 🌐 Connexion internet rétablie');
    this.state.isOnline = true;
    this.handleConnectionRestore();
  };
  
  private handleOffline = () => {
    console.log('[PWA_CONNECTION] 📶 Connexion internet perdue');
    this.state.isOnline = false;
    this.state.quality = 'offline';
    this.notifyListeners();
  };
  
  private handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      console.log('[PWA_CONNECTION] 👀 Application visible - vérification connexion');
      this.checkConnection();
    }
  };

  constructor() {
    console.log('[PWA_CONNECTION] 🚨 DISABLED: Use HealthMonitorMigration instead. This service no longer polls.');
    
    // PRODUCTION SAFE: Initialize with safe defaults but no polling
    this.state = {
      isOnline: navigator.onLine,
      isConnected: false,
      lastPingTime: 0,
      retryCount: 0,
      quality: 'offline',
      deviceMode: 'standard'
    };
    
    // Set global flag to prevent initialization
    if (typeof window !== 'undefined') {
      (window as any).__pwa_connection_initialized = true;
      (window as any).__pwa_connection_manager_instance = this;
    }
  }

  /**
   * Intègre les mécanismes de secours
   */
  private setupFallbackIntegration() {
    // Écouter les événements de fallback
    window.addEventListener('connection-fallback-offline', this.handleFallbackOffline);
    window.addEventListener('connection-fallback-online', this.handleFallbackOnline);
  }

  /**
   * Adapte les paramètres selon le type d'appareil détecté
   */
  private adaptToDevice() {
    const profile = deviceDetector.getOptimizationProfile();
    const capabilities = deviceDetector.getCapabilities();
    
    if (profile && capabilities) {
      // OPTIMIZED: Ensure minimum 10 minutes ping interval to prevent server overload
      this.pingIntervalMs = Math.max(profile.pingInterval, 600000); // Minimum 10 minutes
      this.maxRetries = profile.maxRetries;
      this.maxQueueSize = capabilities.isLowEnd ? 10 : 50;
      this.state.deviceMode = capabilities.supportLevel;

      console.log(`[PWA_CONNECTION] 📱 Mode adapté: ${capabilities.supportLevel}`, {
        pingInterval: `${this.pingIntervalMs / 1000}s (min 10min enforced)`,
        maxRetries: profile.maxRetries,
        isLowEnd: capabilities.isLowEnd
      });
    }
  }

  /**
   * NEW: Setup idle detection to pause pinging when page is not visible
   */
  private setupIdleDetection() {
    const handleVisibilityChange = () => {
      this.isPageVisible = !document.hidden;
      if (import.meta.env.DEV) {
        console.log('[PWA_CONNECTION] 👁️ Page visibility changed:', this.isPageVisible ? 'visible' : 'hidden');
      }
      
      if (this.isPageVisible) {
        // Resume normal pinging when page becomes visible
        this.restartPeriodicPing();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also listen for focus/blur events
    window.addEventListener('focus', () => {
      this.isPageVisible = true;
      this.restartPeriodicPing();
    });
    
    window.addEventListener('blur', () => {
      this.isPageVisible = false;
    });
  }
  
  /**
   * Initialise la surveillance de la connexion
   */
  private initializeConnectionMonitoring() {
    // Surveillance du statut en ligne/hors ligne
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Basic visibility change (kept for compatibility)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // Surveillance des erreurs de fetch
    this.interceptFetchErrors();
  }

  /**
   * OPTIMIZED: Démarre le ping périodique avec idle detection
   */
  private startPeriodicPing() {
    console.log('[PWA_CONNECTION] 🚫 startPeriodicPing DISABLED - using HealthCheckService instead');
    // PRODUCTION SAFE: All ping functionality moved to centralized HealthCheckService
    // No intervals, no polling, no HEAD requests
    return;
  }

  /**
   * OPTIMIZED: Effectue un contrôle de santé avec exponential backoff
   */
  private async performHealthCheck() {
    console.log('[PWA_CONNECTION] 🚫 performHealthCheck DISABLED - using HealthCheckService instead');
    // PRODUCTION SAFE: All health check functionality moved to centralized service
    return;
    
    /* OLD CODE - DISABLED TO PREVENT POLLING
    if (!this.state.isOnline || !this.isPageVisible) {
      return;
    }

    try {
      const startTime = Date.now();
      
      const timeoutMs = Math.min(5000 + (this.consecutiveFailures * 2000), 15000);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const response = await fetch('/api/health', {
        method: 'HEAD',
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
        this.consecutiveFailures = 0; // RESET: Clear failure count on success
        this.state.quality = this.calculateQuality(latency);

        // OPTIMIZATION: Only log in dev mode or on quality changes
        if (import.meta.env.DEV) {
          console.log(`[PWA_CONNECTION] ✅ Ping réussi (${latency}ms) - Qualité: ${this.state.quality}`);
        }
        
        // Traiter les notifications en attente
        await this.processQueuedNotifications();
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      this.consecutiveFailures++; // INCREMENT: Track consecutive failures
      
      // OPTIMIZATION: Only log errors in dev mode after multiple failures
      if (import.meta.env.DEV && this.consecutiveFailures > 2) {
        console.warn('[PWA_CONNECTION] ⚠️ Multiple ping failures:', this.consecutiveFailures);
      }
      
      this.state.quality = 'poor';
      this.handleConnectionError();
    }

    this.notifyListeners();
    */
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
   * OPTIMIZED: Gère les erreurs de connexion avec exponential backoff amélioré
   */
  private handleConnectionError() {
    this.state.isConnected = false;
    this.state.retryCount++;

    if (this.state.retryCount < this.maxRetries) {
      // OPTIMIZATION: Enhanced exponential backoff with jitter to prevent thundering herd
      const baseDelay = this.reconnectDelayMs * Math.pow(2, this.state.retryCount);
      const jitter = Math.random() * 5000; // Add random jitter (0-5s)
      const delay = Math.min(baseDelay + jitter, 120000); // Max 2 minutes
      
      if (import.meta.env.DEV) {
        console.log(`[PWA_CONNECTION] 🔄 Tentative de reconnexion dans ${Math.round(delay/1000)}s (${this.state.retryCount}/${this.maxRetries})`);
      }
      
      this.reconnectTimeout = window.setTimeout(() => {
        // Only retry if page is still visible
        if (this.isPageVisible) {
          this.performHealthCheck();
        }
      }, delay);
    } else {
      // Handle connection failure gracefully
      this.state.quality = 'offline';
      this.state.isConnected = false;
      
      if (import.meta.env.DEV) {
        console.log('[PWA_CONNECTION] 🔴 Max retries reached, marking as offline');
      }
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
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        console.log('[PWA_CONNECTION] 🔄 Service Worker sync configuré');
        
        // Vérifier si l'API sync est disponible
        if ('sync' in registration) {
          (registration as any).sync.register('background-sync').catch((error: any) => {
            console.warn('[PWA_CONNECTION] Erreur sync:', error);
          });
        } else {
          console.log('[PWA_CONNECTION] Background sync non supporté');
        }
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
   * Surveillance de la batterie pour adapter le comportement
   */
  private startBatteryMonitoring() {
    // Vérifier la batterie toutes les 5 minutes (ou plus selon l'appareil)
    const interval = deviceDetector.shouldUseLowEndMode() ? 600000 : 300000; // 10min vs 5min
    
    this.batteryCheckInterval = window.setInterval(async () => {
      const batteryInfo = await deviceDetector.getBatteryInfo();
      if (batteryInfo) {
        this.state.batteryLevel = batteryInfo.level;
        
        // Adapter le comportement selon la batterie
        if (deviceDetector.shouldReduceActivity(batteryInfo.level) && !batteryInfo.charging) {
          console.log(`[PWA_CONNECTION] 🔋 Batterie faible (${batteryInfo.level}%) - Réduction activité`);
          this.enablePowerSaveMode();
        } else if (this.state.batteryLevel && this.state.batteryLevel > 30) {
          this.disablePowerSaveMode();
        }
      }
    }, interval);
  }

  /**
   * Active le mode économie d'énergie
   */
  private enablePowerSaveMode() {
    // Doubler l'intervalle de ping
    this.pingIntervalMs = this.pingIntervalMs * 2;
    
    // Réduire la taille de la queue
    this.maxQueueSize = Math.max(5, this.maxQueueSize / 2);
    
    // Nettoyer la queue existante si trop pleine
    if (this.notificationQueue.length > this.maxQueueSize) {
      this.notificationQueue = this.notificationQueue.slice(-this.maxQueueSize);
    }
    
    console.log('[PWA_CONNECTION] 🔋 Mode économie d\'énergie activé');
    this.restartPeriodicPing();
  }

  /**
   * Désactive le mode économie d'énergie
   */
  private disablePowerSaveMode() {
    // Restaurer les paramètres optimaux
    this.adaptToDevice();
    console.log('[PWA_CONNECTION] 🔋 Mode économie d\'énergie désactivé');
    this.restartPeriodicPing();
  }

  /**
   * Redémarre le ping périodique avec les nouveaux paramètres
   */
  private restartPeriodicPing() {
    console.log('[PWA_CONNECTION] 🚫 restartPeriodicPing DISABLED - using HealthCheckService instead');
    // SECURITY: All ping functionality disabled to prevent server overload
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    return;
  }

  /**
   * Ajoute une notification à la file d'attente avec gestion intelligente
   */
  public queueNotification(notification: any) {
    // Vérifier la limite de queue selon l'appareil
    if (this.notificationQueue.length >= this.maxQueueSize) {
      // Supprimer les plus anciennes si queue pleine
      const removed = this.notificationQueue.shift();
      console.log(`[PWA_CONNECTION] 📝 Queue pleine - Ancienne notification supprimée: ${removed?.id}`);
    }

    const queueItem: NotificationQueue = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: notification.type,
      data: notification,
      retryCount: 0
    };

    this.notificationQueue.push(queueItem);
    
    // Log plus discret pour appareils bas de gamme
    if (!deviceDetector.shouldUseLowEndMode()) {
      console.log(`[PWA_CONNECTION] 📝 Notification ajoutée à la file (${this.notificationQueue.length} en attente)`);
    }

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
   * Nettoie les ressources - MEMORY LEAK FIX
   */
  public destroy() {
    console.log('[PWA_CONNECTION] 🧹 Cleaning up resources...');
    
    // Clean up intervals and timeouts
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.batteryCheckInterval) {
      clearInterval(this.batteryCheckInterval);
      this.batteryCheckInterval = null;
    }

    // CRITICAL: Remove all event listeners to prevent memory leaks
    if (typeof window !== 'undefined') {
      window.removeEventListener('connection-fallback-offline', this.handleFallbackOffline);
      window.removeEventListener('connection-fallback-online', this.handleFallbackOnline);
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
      
      // Clear global initialization flag
      delete (window as any).__pwa_connection_initialized;
    }
    
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }

    // Clean up arrays
    this.listeners = [];
    this.notificationQueue = [];
    
    console.log('[PWA_CONNECTION] ✅ All resources cleaned up successfully');
  }
}

// Instance singleton
export const pwaConnectionManager = new PWAConnectionManager();
export default PWAConnectionManager;
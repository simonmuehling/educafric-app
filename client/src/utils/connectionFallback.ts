/**
 * Mécanisme de secours pour maintenir la connexion PWA
 * Spécialement conçu pour les réseaux instables africains
 */
import { deviceDetector } from './deviceDetector';

interface FallbackConfig {
  enableWebSocket: boolean;
  enablePolling: boolean;
  enableLocalStorage: boolean;
  heartbeatInterval: number;
  maxOfflineTime: number;
}

interface OfflineData {
  notifications: any[];
  userActions: any[];
  lastSync: number;
}

class ConnectionFallback {
  private static instance: ConnectionFallback;
  private config: FallbackConfig;
  private offlineData: OfflineData = {
    notifications: [],
    userActions: [],
    lastSync: Date.now()
  };
  private heartbeatInterval: number | null = null;
  private isOffline = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  private constructor() {
    this.config = this.generateFallbackConfig();
    this.initializeFallbackMechanisms();
  }

  public static getInstance(): ConnectionFallback {
    if (!ConnectionFallback.instance) {
      ConnectionFallback.instance = new ConnectionFallback();
    }
    return ConnectionFallback.instance;
  }

  private generateFallbackConfig(): FallbackConfig {
    const capabilities = deviceDetector.getCapabilities();
    const isLowEnd = capabilities?.isLowEnd || false;

    return {
      enableWebSocket: !isLowEnd, // WebSocket trop lourd pour bas de gamme
      enablePolling: true, // Polling toujours disponible
      enableLocalStorage: true, // Local storage toujours utile
      heartbeatInterval: isLowEnd ? 30000 : 15000, // 30s vs 15s
      maxOfflineTime: isLowEnd ? 300000 : 60000 // 5min vs 1min
    };
  }

  private initializeFallbackMechanisms(): void {
    console.log('[CONNECTION_FALLBACK] 🛡️ Initialisation mécanismes de secours');

    // Surveillance des événements réseau
    this.setupNetworkMonitoring();

    // Système de heartbeat
    this.startHeartbeat();

    // Sauvegarde locale des données critiques
    this.setupLocalDataBackup();

    // Mécanisme de récupération automatique
    this.setupAutoRecovery();
  }

  private setupNetworkMonitoring(): void {
    window.addEventListener('online', () => {
      console.log('[CONNECTION_FALLBACK] 🌐 Connexion rétablie - Tentative de synchronisation');
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      console.log('[CONNECTION_FALLBACK] ⚠️ Mode hors ligne activé');
      this.handleOffline();
    });

    // Surveillance des erreurs fetch pour détecter les déconnexions
    this.interceptNetworkErrors();
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = window.setInterval(() => {
      this.performHeartbeat();
    }, this.config.heartbeatInterval);
  }

  private async performHeartbeat(): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/health', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        if (this.isOffline) {
          console.log('[CONNECTION_FALLBACK] ✅ Connexion rétablie via heartbeat');
          this.handleOnline();
        }
        this.reconnectAttempts = 0;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      this.handleHeartbeatFailure();
    }
  }

  private handleHeartbeatFailure(): void {
    this.reconnectAttempts++;

    if (!this.isOffline && this.reconnectAttempts >= 3) {
      console.log('[CONNECTION_FALLBACK] 💔 Heartbeat échoué - Mode hors ligne');
      this.handleOffline();
    }

    // Exponential backoff pour préserver la batterie
    if (this.reconnectAttempts > 5) {
      const delay = Math.min(60000, 5000 * Math.pow(2, this.reconnectAttempts - 5));
      setTimeout(() => {
        this.startHeartbeat();
      }, delay);
      
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
    }
  }

  private setupLocalDataBackup(): void {
    // Sauvegarder les données critiques localement
    const saveOfflineData = () => {
      try {
        localStorage.setItem('educafric_offline_data', JSON.stringify(this.offlineData));
      } catch (error) {
        console.warn('[CONNECTION_FALLBACK] Erreur sauvegarde locale:', error);
      }
    };

    // Restaurer les données au démarrage
    try {
      const saved = localStorage.getItem('educafric_offline_data');
      if (saved) {
        this.offlineData = { ...this.offlineData, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('[CONNECTION_FALLBACK] Erreur restauration données:', error);
    }

    // Sauvegarder périodiquement
    setInterval(saveOfflineData, 30000); // Toutes les 30 secondes
  }

  private setupAutoRecovery(): void {
    // Tentative de récupération automatique toutes les 2 minutes
    const recoveryInterval = deviceDetector.shouldUseLowEndMode() ? 180000 : 120000;

    setInterval(async () => {
      if (this.isOffline && this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log('[CONNECTION_FALLBACK] 🔄 Tentative de récupération automatique');
        await this.performHeartbeat();
      }
    }, recoveryInterval);
  }

  private interceptNetworkErrors(): void {
    // Intercepter les erreurs de fetch pour détecter les problèmes
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Si la requête réussit et qu'on était hors ligne, marquer comme en ligne
        if (response.ok && this.isOffline) {
          console.log('[CONNECTION_FALLBACK] 🔄 Connexion détectée via fetch');
          this.handleOnline();
        }
        
        return response;
      } catch (error) {
        // Erreur réseau détectée
        if (error instanceof TypeError && error.message.includes('fetch')) {
          if (!this.isOffline) {
            console.log('[CONNECTION_FALLBACK] ⚠️ Erreur réseau détectée via fetch');
            this.handleOffline();
          }
        }
        throw error;
      }
    };
  }

  private handleOffline(): void {
    if (this.isOffline) return; // Déjà en mode hors ligne

    this.isOffline = true;
    this.offlineData.lastSync = Date.now();

    // Notifier l'application du mode hors ligne
    window.dispatchEvent(new CustomEvent('connection-fallback-offline', {
      detail: { offlineTime: Date.now() }
    }));

    // Activer le mode économie d'énergie sur appareils bas de gamme
    if (deviceDetector.shouldUseLowEndMode()) {
      this.enableUltraLowPowerMode();
    }

    console.log('[CONNECTION_FALLBACK] 🔄 Mode hors ligne activé');
  }

  private handleOnline(): void {
    if (!this.isOffline) return; // Déjà en ligne

    this.isOffline = false;
    this.reconnectAttempts = 0;

    // Synchroniser les données hors ligne
    this.syncOfflineData();

    // Notifier l'application du retour en ligne
    window.dispatchEvent(new CustomEvent('connection-fallback-online', {
      detail: { 
        offlineTime: Date.now() - this.offlineData.lastSync,
        pendingActions: this.offlineData.userActions.length
      }
    }));

    console.log('[CONNECTION_FALLBACK] ✅ Mode en ligne restauré');
  }

  private enableUltraLowPowerMode(): void {
    // Réduire encore plus les intervalles pour préserver la batterie
    this.config.heartbeatInterval = Math.max(60000, this.config.heartbeatInterval * 2);
    
    // Redémarrer avec les nouveaux paramètres
    this.startHeartbeat();
    
    console.log('[CONNECTION_FALLBACK] 🔋 Mode ultra économie activé');
  }

  private async syncOfflineData(): Promise<void> {
    try {
      if (this.offlineData.userActions.length > 0) {
        // Synchroniser les actions utilisateur en attente
        const response = await fetch('/api/sync/offline-actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actions: this.offlineData.userActions,
            offlineTime: Date.now() - this.offlineData.lastSync
          })
        });

        if (response.ok) {
          this.offlineData.userActions = [];
          console.log('[CONNECTION_FALLBACK] ✅ Actions hors ligne synchronisées');
        }
      }

      // Récupérer les notifications manquées
      const notificationResponse = await fetch('/api/notifications/missed', {
        method: 'GET',
        headers: { 'Last-Sync': this.offlineData.lastSync.toString() }
      });

      if (notificationResponse.ok) {
        const missedNotifications = await notificationResponse.json();
        console.log(`[CONNECTION_FALLBACK] 📨 ${missedNotifications.length} notifications manquées récupérées`);
      }
    } catch (error) {
      console.error('[CONNECTION_FALLBACK] Erreur synchronisation:', error);
    }
  }

  // API publique
  public queueOfflineAction(action: any): void {
    this.offlineData.userActions.push({
      ...action,
      timestamp: Date.now(),
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    // Limiter la taille de la queue pour appareils bas de gamme
    const maxActions = deviceDetector.shouldUseLowEndMode() ? 20 : 100;
    if (this.offlineData.userActions.length > maxActions) {
      this.offlineData.userActions.shift(); // Supprimer la plus ancienne
    }
  }

  public isOfflineMode(): boolean {
    return this.isOffline;
  }

  public getOfflineStats(): { actionsCount: number; offlineTime: number } {
    return {
      actionsCount: this.offlineData.userActions.length,
      offlineTime: this.isOffline ? Date.now() - this.offlineData.lastSync : 0
    };
  }

  public forceReconnect(): void {
    console.log('[CONNECTION_FALLBACK] 🔄 Reconnexion forcée demandée');
    this.reconnectAttempts = 0;
    this.performHeartbeat();
  }

  public destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Instance singleton
export const connectionFallback = ConnectionFallback.getInstance();
export default ConnectionFallback;
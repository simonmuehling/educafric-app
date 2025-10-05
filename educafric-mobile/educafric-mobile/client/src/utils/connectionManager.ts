// Gestionnaire de connexion pour maintenir la session active
class ConnectionManager {
  private reconnectTimer: NodeJS.Timeout | null = null;
  private maxRetries = 5;
  private retryCount = 0;
  private baseDelay = 1000; // 1 seconde

  constructor() {
    this.setupHeartbeat();
    this.setupVisibilityListener();
  }

  // Ping périodique pour maintenir la session active
  private setupHeartbeat() {
    setInterval(async () => {
      try {
        const response = await fetch('/api/auth/session-status', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          this.retryCount = 0; // Reset retry count on success
        } else if (response.status === 401) {
          // Session expirée, tenter une reconnexion automatique
          this.attemptReconnection();
        }
      } catch (error) {
        // Erreur réseau, tenter une reconnexion
        this.attemptReconnection();
      }
    }, 5 * 60 * 1000); // Toutes les 5 minutes
  }

  // Réactiver la session quand l'utilisateur revient sur l'app
  private setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Page redevient visible, vérifier la session
        this.checkAndRefreshSession();
      }
    });
  }

  private async checkAndRefreshSession() {
    try {
      const response = await fetch('/api/auth/session-status', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok && response.status === 401) {
        this.attemptReconnection();
      }
    } catch (error) {
      console.warn('[CONNECTION_MANAGER] Failed to check session');
    }
  }

  private async attemptReconnection() {
    if (this.retryCount >= this.maxRetries) {
      console.warn('[CONNECTION_MANAGER] Max reconnection attempts reached');
      return;
    }

    this.retryCount++;
    const delay = this.baseDelay * Math.pow(2, this.retryCount - 1); // Backoff exponentiel

    console.log(`[CONNECTION_MANAGER] Attempting reconnection ${this.retryCount}/${this.maxRetries}`);

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(async () => {
      try {
        // Vérifier si nous avons des données utilisateur en cache
        const cachedUser = localStorage.getItem('educafric_user');
        if (cachedUser) {
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            console.log('[CONNECTION_MANAGER] Reconnection successful');
            this.retryCount = 0;
            // Déclencher un événement pour rafraîchir l'interface
            window.dispatchEvent(new CustomEvent('connection-restored'));
          } else {
            this.attemptReconnection();
          }
        }
      } catch (error) {
        console.warn('[CONNECTION_MANAGER] Reconnection attempt failed');
        this.attemptReconnection();
      }
    }, delay);
  }

  // Méthode pour forcer une vérification de connexion
  public forceConnectionCheck() {
    this.checkAndRefreshSession();
  }

  // Nettoyer les timers lors de la destruction
  public destroy() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
  }
}

// Instance singleton
export const connectionManager = new ConnectionManager();

// Hook pour utiliser le gestionnaire de connexion dans les composants React
export function useConnectionManager() {
  return connectionManager;
}
type NetworkCallback = (isOnline: boolean) => void;

class NetworkMonitor {
  private isOnline: boolean = true;
  private listeners: Set<NetworkCallback> = new Set();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 2000;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
      
      console.log('[NetworkMonitor] Initialized, online:', this.isOnline);
    }
  }

  private handleOnline = () => {
    console.log('[NetworkMonitor] Connection restored');
    this.isOnline = true;
    this.reconnectAttempts = 0;
    this.clearReconnectTimer();
    this.notifyListeners();
  };

  private handleOffline = () => {
    console.log('[NetworkMonitor] Connection lost');
    this.isOnline = false;
    this.notifyListeners();
    this.startReconnectCheck();
  };

  private notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.isOnline);
      } catch (error) {
        console.error('[NetworkMonitor] Listener error:', error);
      }
    });
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startReconnectCheck() {
    this.clearReconnectTimer();
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[NetworkMonitor] Max reconnect attempts reached');
      return;
    }

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectAttempts++;
      console.log(`[NetworkMonitor] Checking connection (attempt ${this.reconnectAttempts})`);
      
      const isConnected = await this.checkConnection();
      
      if (isConnected && !this.isOnline) {
        this.handleOnline();
      } else if (!isConnected) {
        this.startReconnectCheck();
      }
    }, this.reconnectDelay * Math.min(this.reconnectAttempts + 1, 5));
  }

  async checkConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return navigator.onLine;
    }
  }

  subscribe(callback: NetworkCallback): () => void {
    this.listeners.add(callback);
    callback(this.isOnline);
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  getStatus(): boolean {
    return this.isOnline;
  }

  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    this.clearReconnectTimer();
    this.listeners.clear();
  }
}

export const networkMonitor = new NetworkMonitor();

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('failed to fetch') ||
      message.includes('network') ||
      message.includes('net::err_') ||
      message.includes('timeout') ||
      message.includes('aborted') ||
      message.includes('connection') ||
      error.name === 'TypeError' && message.includes('fetch')
    );
  }
  return false;
}

export function isChunkLoadError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('Loading chunk') ||
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('ChunkLoadError') ||
      error.name === 'ChunkLoadError'
    );
  }
  return false;
}

export function shouldRetryRequest(error: unknown, attemptCount: number): boolean {
  if (attemptCount >= 3) return false;
  
  if (!networkMonitor.getStatus()) return false;
  
  if (error instanceof Error) {
    if (error.message.includes('401') || error.message.includes('403')) {
      return false;
    }
    
    if (error.message.includes('404') || error.message.includes('400')) {
      return false;
    }
  }
  
  return isNetworkError(error);
}

// Network Connection Optimizer - Fixes poor quality connections (613-620ms)
// Optimized for African networks and 3500+ concurrent users
import React from 'react';

interface NetworkConfig {
  timeout: number;
  retries: number;
  retryDelay: number;
  connectionPoolSize: number;
}

interface ConnectionQuality {
  ping: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  recommendation: string;
}

class NetworkOptimizer {
  private static instance: NetworkOptimizer;
  private config: NetworkConfig;
  private connectionHistory: number[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private lastQuality?: string;

  private constructor() {
    this.config = {
      timeout: 8000, // Increased from default for African networks
      retries: 3,
      retryDelay: 1000,
      connectionPoolSize: 10
    };
    this.initializeNetworkOptimizations();
  }

  public static getInstance(): NetworkOptimizer {
    if (!NetworkOptimizer.instance) {
      NetworkOptimizer.instance = new NetworkOptimizer();
    }
    return NetworkOptimizer.instance;
  }

  private initializeNetworkOptimizations() {
    console.log('[NETWORK_OPTIMIZER] 🚀 Initializing network optimizations');
    
    // Override default fetch with optimized version
    this.patchFetch();
    
    // Start connection monitoring
    this.startConnectionMonitoring();
    
    // Configure service worker for offline support
    this.configureOfflineSupport();
  }

  private patchFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const optimizedInit: RequestInit = {
        ...init,
        // Optimized headers for African networks
        headers: {
          'Connection': 'keep-alive',
          'Cache-Control': 'public, max-age=300', // 5min cache
          'Accept-Encoding': 'gzip, deflate, br',
          ...init?.headers
        },
        // Extended timeout for slow networks
        signal: AbortSignal.timeout(this.config.timeout)
      };

      let lastError: Error = new Error('Network request failed');
      
      // Retry mechanism for unstable connections
      for (let attempt = 1; attempt <= this.config.retries; attempt++) {
        try {
          // Only log on retries or in dev mode
          if (attempt > 1 || import.meta.env.DEV) {
            console.log(`[NETWORK_OPTIMIZER] 📡 Request attempt ${attempt}/${this.config.retries}`);
          }
          const response = await originalFetch(input, optimizedInit);
          
          // Log successful connection (silently record)
          this.recordConnectionSuccess();
          
          return response;
        } catch (error: any) {
          lastError = error;
          // Only warn on final failure
          if (attempt === this.config.retries) {
            console.warn(`[NETWORK_OPTIMIZER] ⚠️ Request failed after ${attempt} attempts:`, error.message);
          }
          
          if (attempt < this.config.retries) {
            await this.delay(this.config.retryDelay * attempt); // Exponential backoff
          }
        }
      }
      
      this.recordConnectionFailure();
      throw lastError;
    };
  }

  private async startConnectionMonitoring() {
    setInterval(async () => {
      try {
        const quality = await this.measureConnectionQuality();
        this.adaptToConnectionQuality(quality);
      } catch (error) {
        console.error('[NETWORK_OPTIMIZER] ❌ Connection monitoring failed:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  private async measureConnectionQuality(): Promise<ConnectionQuality> {
    const startTime = performance.now();
    
    try {
      // Test with small health check endpoint
      await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      const ping = performance.now() - startTime;
      this.connectionHistory.push(ping);
      
      // Keep only last 10 measurements
      if (this.connectionHistory.length > 10) {
        this.connectionHistory.shift();
      }
      
      const avgPing = this.connectionHistory.reduce((a, b) => a + b, 0) / this.connectionHistory.length;
      
      let quality: ConnectionQuality['quality'];
      let recommendation: string;
      
      if (avgPing < 200) {
        quality = 'excellent';
        recommendation = 'Network optimized for real-time features';
      } else if (avgPing < 400) {
        quality = 'good';
        recommendation = 'Stable connection, all features available';
      } else if (avgPing < 600) {
        quality = 'fair';
        recommendation = 'Reducing real-time updates frequency';
      } else if (avgPing < 1000) {
        quality = 'poor';
        recommendation = 'Enabling aggressive caching, disabling non-essential features';
      } else {
        quality = 'critical';
        recommendation = 'Emergency mode: offline-first, essential features only';
      }
      
      // Only log quality changes, not every check
      if (import.meta.env.DEV || this.lastQuality !== quality) {
        console.log(`[NETWORK_OPTIMIZER] 📊 Connection quality: ${quality} (${avgPing.toFixed(0)}ms avg)`);
        this.lastQuality = quality;
      }
      
      return { ping: avgPing, quality, recommendation };
    } catch (error) {
      console.error('[NETWORK_OPTIMIZER] ❌ Quality measurement failed:', error);
      return { 
        ping: 9999, 
        quality: 'critical', 
        recommendation: 'Network unreachable, enabling offline mode' 
      };
    }
  }

  private adaptToConnectionQuality(quality: ConnectionQuality) {
    switch (quality.quality) {
      case 'excellent':
      case 'good':
        this.config.timeout = 5000;
        this.config.retries = 2;
        break;
        
      case 'fair':
        this.config.timeout = 8000;
        this.config.retries = 3;
        // Reduce notification polling frequency
        this.adjustPollingFrequency(10000);
        break;
        
      case 'poor':
        this.config.timeout = 12000;
        this.config.retries = 4;
        this.adjustPollingFrequency(20000);
        // Enable aggressive caching
        this.enableAggressiveCaching();
        break;
        
      case 'critical':
        this.config.timeout = 20000;
        this.config.retries = 5;
        this.adjustPollingFrequency(60000);
        this.enableOfflineMode();
        break;
    }
  }

  private adjustPollingFrequency(interval: number) {
    // Communicate with PWA connection manager
    window.dispatchEvent(new CustomEvent('network-quality-changed', {
      detail: { pollingInterval: interval }
    }));
  }

  private enableAggressiveCaching() {
    // Enable extended caching for static resources
    if (import.meta.env.DEV) {
      console.log('[NETWORK_OPTIMIZER] 🗄️ Enabling aggressive caching for poor connection');
    }
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        command: 'ENABLE_AGGRESSIVE_CACHE'
      });
    }
  }

  private enableOfflineMode() {
    console.log('[NETWORK_OPTIMIZER] 🔄 Enabling offline mode for critical connection');
    
    // Notify application to switch to offline-first mode
    window.dispatchEvent(new CustomEvent('connection-critical', {
      detail: { enableOfflineMode: true }
    }));
  }

  private configureOfflineSupport() {
    // Register event listeners for online/offline
    window.addEventListener('online', () => {
      console.log('[NETWORK_OPTIMIZER] 🌐 Back online, resuming normal operations');
      this.reconnectAttempts = 0;
      this.resumeNormalOperations();
    });

    window.addEventListener('offline', () => {
      console.log('[NETWORK_OPTIMIZER] ⚠️ Gone offline, switching to cache-only mode');
      this.enableOfflineMode();
    });
  }

  private resumeNormalOperations() {
    this.config = {
      timeout: 8000,
      retries: 3,
      retryDelay: 1000,
      connectionPoolSize: 10
    };
    
    window.dispatchEvent(new CustomEvent('connection-restored'));
  }

  private recordConnectionSuccess() {
    this.reconnectAttempts = 0;
  }

  private recordConnectionFailure() {
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[NETWORK_OPTIMIZER] 🚫 Max reconnection attempts reached, enabling emergency mode');
      this.enableOfflineMode();
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API
  getConnectionStats() {
    const avgPing = this.connectionHistory.length > 0 
      ? this.connectionHistory.reduce((a, b) => a + b, 0) / this.connectionHistory.length 
      : 0;

    return {
      averagePing: Math.round(avgPing),
      reconnectAttempts: this.reconnectAttempts,
      samplesCollected: this.connectionHistory.length,
      currentConfig: this.config
    };
  }

  forceQualityTest(): Promise<ConnectionQuality> {
    return this.measureConnectionQuality();
  }
}

// Initialize global network optimizer
export const networkOptimizer = NetworkOptimizer.getInstance();

// React hook for connection quality monitoring
export function useNetworkQuality(): { quality: ConnectionQuality | null; stats: any } {
  const [quality, setQuality] = React.useState<ConnectionQuality | null>(null);
  const [stats, setStats] = React.useState(networkOptimizer.getConnectionStats());

  React.useEffect(() => {
    const checkQuality = async () => {
      try {
        const currentQuality = await networkOptimizer.forceQualityTest();
        setQuality(currentQuality);
        setStats(networkOptimizer.getConnectionStats());
      } catch (error) {
        console.error('Quality check failed:', error);
      }
    };

    // Initial check
    checkQuality();

    // Periodic updates
    const interval = setInterval(checkQuality, 30000);

    // Listen for network events
    const handleNetworkChange = () => {
      checkQuality();
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    window.addEventListener('connection-critical', handleNetworkChange);
    window.addEventListener('connection-restored', handleNetworkChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
      window.removeEventListener('connection-critical', handleNetworkChange);
      window.removeEventListener('connection-restored', handleNetworkChange);
    };
  }, []);

  return { quality, stats };
}

export default networkOptimizer;
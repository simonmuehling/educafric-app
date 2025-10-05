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
    console.log('[NETWORK_OPTIMIZER] 🚨 DISABLED: Replaced by HealthCheckService - no polling initialized');
    // PRODUCTION SAFE: All functionality moved to centralized HealthCheckService
    // No fetch patching, no connection monitoring, no intervals
    
    // Mark as fully disabled to prevent any activation
    (window as any).__network_optimizer_disabled = true;
  }

  private patchFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      // Skip optimization for home page critical resources to improve load time
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      const isHomepageCritical = url.includes('/sw.js') || url.includes('main.tsx') || url.includes('.css') || url.includes('favicon');
      
      if (isHomepageCritical) {
        // Fast path for critical home page resources
        return originalFetch(input, init);
      }
      
      const optimizedInit: RequestInit = {
        ...init,
        // Optimized headers for African networks
        headers: {
          'Connection': 'keep-alive',
          'Cache-Control': 'public, max-age=300', // 5min cache
          'Accept-Encoding': 'gzip, deflate, br',
          ...init?.headers
        },
        // Reduced timeout for faster homepage experience
        signal: AbortSignal.timeout(this.config.timeout / 2)
      };

      let lastError: Error = new Error('Network request failed');
      
      // Reduced retries for faster responses
      const maxRetries = url.includes('/api/') ? this.config.retries : 1;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await originalFetch(input, optimizedInit);
          this.recordConnectionSuccess();
          return response;
        } catch (error: any) {
          lastError = error;
          if (attempt < maxRetries) {
            await this.delay(500); // Shorter delay for faster recovery
          }
        }
      }
      
      this.recordConnectionFailure();
      throw lastError;
    };
  }

  private connectionMonitoringActive = false;
  
  private async startConnectionMonitoring() {
    // EMERGENCY FIX: Prevent multiple monitoring intervals
    if (this.connectionMonitoringActive || (window as any).__network_optimizer_monitoring_started) {
      console.log('[NETWORK_OPTIMIZER] ⚠️ Monitoring already started, skipping duplicate');
      return;
    }
    
    this.connectionMonitoringActive = true;
    (window as any).__network_optimizer_monitoring_started = true;
    
    console.log('[NETWORK_OPTIMIZER] 🚀 Starting singleton monitoring with 15-minute intervals');
    
    // DISABLED: No more intervals - HealthCheckService handles this
    console.log('[NETWORK_OPTIMIZER] 🚫 Interval monitoring disabled - using HealthCheckService');
    return;
    
    /* OLD CODE - DISABLED
    setInterval(async () => {
      if (document.hidden) {
        console.log('[NETWORK_OPTIMIZER] ⏸️ Skipping monitoring - page hidden');
        return;
      }
      
      try {
        const quality = await this.measureConnectionQuality();
        this.adaptToConnectionQuality(quality);
      } catch (error) {
        console.error('[NETWORK_OPTIMIZER] ❌ Connection monitoring failed:', error);
      }
    }, 900000); // OPTIMIZED: 15 minutes instead of 2 minutes to prevent server overload
  }

  private async measureConnectionQuality(): Promise<ConnectionQuality> {
    console.log('[NETWORK_OPTIMIZER] 🚫 measureConnectionQuality DISABLED - no more direct API calls');
    
    // PRODUCTION SAFE: Return default quality without making API calls
    // All network monitoring moved to HealthCheckService
    return {
      ping: 0,
      quality: 'good' as ConnectionQuality['quality'],
      recommendation: 'Network monitoring handled by HealthCheckService'
    };
    
    /* OLD CODE DISABLED TO PREVENT DIRECT API CALLS
    const startTime = performance.now();
    
    try {
      // Test with small health check endpoint
      await fetch('/api', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
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
        if (import.meta.env.DEV) {
          console.log(`[NETWORK_OPTIMIZER] 📊 Connection quality: ${quality} (${avgPing.toFixed(0)}ms avg)`);
        }
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
    */
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
    if (import.meta.env.DEV) {
      console.log('[NETWORK_OPTIMIZER] 🔄 Enabling offline mode for critical connection');
    }
    
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
    console.log('[NETWORK_OPTIMIZER] 🚫 forceQualityTest DISABLED - using HealthCheckService instead');
    
    // Return safe default without making API calls
    return Promise.resolve({
      ping: 0,
      quality: 'good' as ConnectionQuality['quality'],
      recommendation: 'Using centralized HealthCheckService monitoring'
    });
  }
}

// Initialize global network optimizer
export const networkOptimizer = NetworkOptimizer.getInstance();

// OPTIMIZED React hook with singleton monitoring and much longer intervals
export function useNetworkQuality(): { quality: ConnectionQuality | null; stats: any } {
  const [quality, setQuality] = React.useState<ConnectionQuality | null>(null);
  const [stats, setStats] = React.useState(networkOptimizer.getConnectionStats());

  React.useEffect(() => {
    // EMERGENCY FIX: Global singleton to prevent multiple hooks creating overlapping intervals
    if ((window as any).__useNetworkQuality_active) {
      console.log('[NETWORK_OPTIMIZER] ⚠️ useNetworkQuality already active, using shared state');
      
      // Subscribe to existing state updates
      const handleQualityUpdate = (event: CustomEvent) => {
        setQuality(event.detail.quality);
        setStats(event.detail.stats);
      };
      
      window.addEventListener('network-quality-update', handleQualityUpdate as EventListener);
      
      // Get current cached values
      if ((window as any).__networkQuality_cache) {
        setQuality((window as any).__networkQuality_cache.quality);
        setStats((window as any).__networkQuality_cache.stats);
      }
      
      return () => {
        window.removeEventListener('network-quality-update', handleQualityUpdate as EventListener);
      };
    }
    
    (window as any).__useNetworkQuality_active = true;
    console.log('[NETWORK_OPTIMIZER] 🎯 Starting singleton useNetworkQuality with 10-minute intervals');
    
    const checkQuality = async () => {
      // DISABLED: All network monitoring moved to HealthCheckService
      console.log('[NETWORK_OPTIMIZER] 🚫 checkQuality DISABLED - using HealthCheckService instead');
      return;
      
      /* OLD CODE DISABLED TO PREVENT DIRECT API CALLS
      // OPTIMIZATION: Skip if page is hidden or already checking
      if (document.hidden || (window as any).__quality_check_in_progress) {
        return;
      }
      
      (window as any).__quality_check_in_progress = true;
      
      try {
        const currentQuality = await networkOptimizer.forceQualityTest();
        setQuality(currentQuality);
        setStats(networkOptimizer.getConnectionStats());
        
        // Cache for other components
        (window as any).__networkQuality_cache = { quality: currentQuality, stats: networkOptimizer.getConnectionStats() };
        
        // Notify other components
        window.dispatchEvent(new CustomEvent('network-quality-update', {
          detail: { quality: currentQuality, stats: networkOptimizer.getConnectionStats() }
        }));
        
        console.log('[NETWORK_OPTIMIZER] ✅ Quality check completed:', currentQuality.quality);
      } catch (error) {
        console.error('[NETWORK_OPTIMIZER] ❌ Quality check failed:', error);
      } finally {
        (window as any).__quality_check_in_progress = false;
      }
      */
    };

    // DISABLED: No initial check - using HealthCheckService instead
    console.log('[NETWORK_OPTIMIZER] 🚫 Initial quality check DISABLED');
    
    // Set safe defaults without API calls
    setQuality({ quality: 'good', ping: 0, recommendation: 'Using centralized health monitoring' });
    setStats({ averagePing: 0, successRate: 1, totalRequests: 0 });

    // DISABLED: All intervals and network monitoring moved to HealthCheckService
    console.log('[NETWORK_OPTIMIZER] 🚫 checkQuality intervals DISABLED - using HealthCheckService instead');
    
    // No setInterval, no checkQuality calls, no network event listeners
    return;

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
      
      // Clean up singleton state when no more components using it
      (window as any).__useNetworkQuality_active = false;
    };
  }, []);

  return { quality, stats };
}

export default networkOptimizer;
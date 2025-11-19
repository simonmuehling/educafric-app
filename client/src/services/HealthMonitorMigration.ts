/**
 * PRODUCTION SAFE: Health Monitor Migration Service
 * 
 * Replaces ALL legacy polling mechanisms with centralized HealthCheckService
 * - Disables PWAConnectionManager polling
 * - Disables ConnectionFallback heartbeat
 * - Disables NetworkOptimizer monitoring
 * - Provides unified health status through HealthCheckService
 */

import { healthCheckService, type HealthCheckResult } from './HealthCheckService';

interface LegacyConnectionState {
  isOnline: boolean;
  isConnected: boolean;
  lastPingTime: number;
  retryCount: number;
  quality: 'excellent' | 'good' | 'poor' | 'offline';
  deviceMode: 'basic' | 'standard' | 'advanced';
  batteryLevel?: number;
}

interface NetworkQuality {
  ping: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  recommendation: string;
}

class HealthMonitorMigration {
  private static instance: HealthMonitorMigration;
  private static isInitialized = false;
  
  // Unified state that replaces all legacy states
  private connectionState: LegacyConnectionState = {
    isOnline: navigator.onLine,
    isConnected: false,
    lastPingTime: 0,
    retryCount: 0,
    quality: 'offline',
    deviceMode: 'standard'
  };
  
  // Legacy listeners for backward compatibility
  private connectionListeners: Array<(state: LegacyConnectionState) => void> = [];
  private networkQualityListeners: Array<(quality: NetworkQuality) => void> = [];
  
  private constructor() {
    if (HealthMonitorMigration.isInitialized) {
      throw new Error('HealthMonitorMigration already initialized');
    }
    HealthMonitorMigration.isInitialized = true;
    
    console.log('[HEALTH_MIGRATION] 🚀 Migrating to centralized health monitoring');
    
    this.disableLegacyServices();
    this.setupHealthCheckIntegration();
    this.setupNetworkEventListeners();
    
    console.log('[HEALTH_MIGRATION] ✅ Migration complete - all polling consolidated');
  }
  
  public static getInstance(): HealthMonitorMigration {
    if (!HealthMonitorMigration.instance) {
      HealthMonitorMigration.instance = new HealthMonitorMigration();
    }
    return HealthMonitorMigration.instance;
  }
  
  /**
   * Disable all legacy polling services to prevent multiple requests
   */
  private disableLegacyServices(): void {
    // Disable global singleton flags to prevent initialization
    if (typeof window !== 'undefined') {
      (window as any).__pwa_connection_initialized = true; // Prevent PWAConnectionManager
      (window as any).__network_optimizer_monitoring_started = true; // Prevent NetworkOptimizer
      (window as any).__connection_fallback_initialized = true; // Prevent ConnectionFallback
      (window as any).__useNetworkQuality_active = true; // Prevent useNetworkQuality hook
      
      console.log('[HEALTH_MIGRATION] 🛑 Legacy polling services disabled');
    }
  }
  
  /**
   * Setup integration with the new HealthCheckService
   */
  private setupHealthCheckIntegration(): void {
    // Listen to health check results and update connection state
    healthCheckService.addListener((result: HealthCheckResult) => {
      this.updateConnectionStateFromHealthCheck(result);
    });
    
    // Get initial state if available
    const initialResult = healthCheckService.getLatestResult();
    if (initialResult) {
      this.updateConnectionStateFromHealthCheck(initialResult);
    }
  }
  
  /**
   * Setup basic network event listeners (online/offline)
   */
  private setupNetworkEventListeners(): void {
    const handleOnline = () => {
      console.log('[HEALTH_MIGRATION] 🌐 Network online - triggering immediate health check');
      this.connectionState.isOnline = true;
      healthCheckService.checkHealthImmediate();
    };
    
    const handleOffline = () => {
      console.log('[HEALTH_MIGRATION] 📴 Network offline');
      this.connectionState.isOnline = false;
      this.connectionState.isConnected = false;
      this.connectionState.quality = 'offline';
      this.notifyConnectionListeners();
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Page visibility for immediate checks
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('[HEALTH_MIGRATION] 👀 Page visible - checking health');
        healthCheckService.checkHealthImmediate();
      }
    });
  }
  
  /**
   * Update connection state based on health check results
   */
  private updateConnectionStateFromHealthCheck(result: HealthCheckResult): void {
    const wasConnected = this.connectionState.isConnected;
    
    this.connectionState.isConnected = result.isHealthy;
    this.connectionState.lastPingTime = result.timestamp;
    this.connectionState.retryCount = result.isHealthy ? 0 : this.connectionState.retryCount + 1;
    
    // Map response time to quality
    if (!result.isHealthy) {
      this.connectionState.quality = 'offline';
    } else if (result.responseTime < 200) {
      this.connectionState.quality = 'excellent';
    } else if (result.responseTime < 500) {
      this.connectionState.quality = 'good';
    } else {
      this.connectionState.quality = 'poor';
    }
    
    // Log connection changes
    if (wasConnected !== this.connectionState.isConnected) {
      const status = this.connectionState.isConnected ? 'connected' : 'disconnected';
      console.log(`[HEALTH_MIGRATION] 📶 Connection ${status} (${Math.round(result.responseTime)}ms)`);
    }
    
    this.notifyConnectionListeners();
    this.notifyNetworkQualityListeners(result);
  }
  
  /**
   * Notify connection state listeners (backward compatibility)
   */
  private notifyConnectionListeners(): void {
    this.connectionListeners.forEach(listener => {
      try {
        listener({ ...this.connectionState });
      } catch (error) {
        console.error('[HEALTH_MIGRATION] Connection listener error:', error);
      }
    });
  }
  
  /**
   * Notify network quality listeners (backward compatibility)
   */
  private notifyNetworkQualityListeners(result: HealthCheckResult): void {
    const quality: NetworkQuality = {
      ping: result.responseTime,
      quality: this.mapHealthToQuality(result),
      recommendation: this.getRecommendation(result)
    };
    
    this.networkQualityListeners.forEach(listener => {
      try {
        listener(quality);
      } catch (error) {
        console.error('[HEALTH_MIGRATION] Network quality listener error:', error);
      }
    });
  }
  
  /**
   * Map health check result to network quality
   */
  private mapHealthToQuality(result: HealthCheckResult): NetworkQuality['quality'] {
    if (!result.isHealthy) return 'critical';
    if (result.responseTime < 200) return 'excellent';
    if (result.responseTime < 400) return 'good';
    if (result.responseTime < 800) return 'fair';
    return 'poor';
  }
  
  /**
   * Get recommendation based on health result
   */
  private getRecommendation(result: HealthCheckResult): string {
    if (!result.isHealthy) {
      return 'Connection unavailable - enabling offline mode';
    }
    
    if (result.responseTime < 200) {
      return 'Excellent connection - all features enabled';
    } else if (result.responseTime < 400) {
      return 'Good connection - normal operation';
    } else if (result.responseTime < 800) {
      return 'Fair connection - reducing update frequency';
    } else {
      return 'Poor connection - minimal features only';
    }
  }
  
  // --- LEGACY API COMPATIBILITY ---
  
  /**
   * Legacy PWAConnectionManager API
   */
  public addConnectionListener(listener: (state: LegacyConnectionState) => void): void {
    this.connectionListeners.push(listener);
    // Immediately notify with current state
    listener({ ...this.connectionState });
  }
  
  public removeConnectionListener(listener: (state: LegacyConnectionState) => void): void {
    const index = this.connectionListeners.indexOf(listener);
    if (index > -1) {
      this.connectionListeners.splice(index, 1);
    }
  }
  
  public getConnectionState(): LegacyConnectionState {
    return { ...this.connectionState };
  }
  
  public async checkConnection(): Promise<boolean> {
    const result = await healthCheckService.checkHealthImmediate();
    return result.isHealthy;
  }
  
  public async manualCheck(): Promise<void> {
    await healthCheckService.checkHealthImmediate();
  }
  
  /**
   * Legacy NetworkOptimizer API
   */
  public addNetworkQualityListener(listener: (quality: NetworkQuality) => void): void {
    this.networkQualityListeners.push(listener);
    
    // Immediately notify with current quality if available
    const lastResult = healthCheckService.getLatestResult();
    if (lastResult) {
      listener({
        ping: lastResult.responseTime,
        quality: this.mapHealthToQuality(lastResult),
        recommendation: this.getRecommendation(lastResult)
      });
    }
  }
  
  public removeNetworkQualityListener(listener: (quality: NetworkQuality) => void): void {
    const index = this.networkQualityListeners.indexOf(listener);
    if (index > -1) {
      this.networkQualityListeners.splice(index, 1);
    }
  }
  
  /**
   * Get current telemetry data
   */
  public getTelemetry() {
    const healthTelemetry = healthCheckService.getTelemetry();
    
    return {
      // Health service telemetry
      ...healthTelemetry,
      
      // Connection state
      connectionState: this.connectionState,
      
      // Listener counts for debugging
      connectionListeners: this.connectionListeners.length,
      networkQualityListeners: this.networkQualityListeners.length,
      
      // Migration info
      migration: {
        isActive: true,
        version: '1.0.0',
        legacyServicesDisabled: true
      }
    };
  }
  
  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.connectionListeners.length = 0;
    this.networkQualityListeners.length = 0;
    console.log('[HEALTH_MIGRATION] 🧹 Migration cleanup complete');
  }
}

// Export singleton instance
export const healthMonitorMigration = HealthMonitorMigration.getInstance();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    healthMonitorMigration.destroy();
  });
}

export default healthMonitorMigration;
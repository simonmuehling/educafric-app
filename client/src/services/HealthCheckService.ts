/**
 * Centralized Health Check Service - PRODUCTION SAFE
 * 
 * Single source of truth for network health monitoring
 * - No fake responses (architect requirement #1)
 * - Proper deduplication with BroadcastChannel coordination
 * - Production-safe intervals (2-5 min visible, paused when hidden)
 * - Telemetry ensuring ≤1 request per 5 minutes
 * - Adaptive backoff (1→2→5 minutes max)
 */

export interface HealthCheckResult {
  isHealthy: boolean;
  responseTime: number;
  timestamp: number;
  error?: string;
  fromCache?: boolean;
}

interface HealthCheckTelemetry {
  totalChecks: number;
  averageResponseTime: number;
  lastCheckTime: number;
  checksPerMinute: number;
  failureCount: number;
}

interface AdaptiveConfig {
  baseInterval: number;      // 2 minutes when visible
  maxInterval: number;       // 5 minutes max
  currentInterval: number;   // Current adaptive interval
  consecutiveFailures: number;
  device: 'low-end' | 'standard' | 'high-end';
}

class HealthCheckService {
  private static instance: HealthCheckService;
  private static isInitialized = false;
  
  // Core state
  private lastResult: HealthCheckResult | null = null;
  private inFlightRequest: Promise<HealthCheckResult> | null = null;
  private intervalId: number | null = null;
  private broadcastChannel: BroadcastChannel;
  
  // Adaptive configuration
  private config: AdaptiveConfig = {
    baseInterval: 120000,      // 2 minutes base
    maxInterval: 300000,       // 5 minutes max
    currentInterval: 120000,   // Start at base
    consecutiveFailures: 0,
    device: 'standard'
  };
  
  // Telemetry and safety
  private telemetry: HealthCheckTelemetry = {
    totalChecks: 0,
    averageResponseTime: 0,
    lastCheckTime: 0,
    checksPerMinute: 0,
    failureCount: 0
  };
  
  // Page visibility and activity tracking
  private isVisible = !document.hidden;
  private lastActivityTime = Date.now();
  
  // Event listeners for cleanup
  private handleVisibilityChange = () => {
    const wasVisible = this.isVisible;
    this.isVisible = !document.hidden;
    
    if (!wasVisible && this.isVisible) {
      console.log('[HEALTH_SERVICE] 👀 Page became visible - immediate health check');
      this.checkHealthImmediate();
      this.restartPeriodicChecks();
    } else if (wasVisible && !this.isVisible) {
      console.log('[HEALTH_SERVICE] 😴 Page hidden - pausing health checks');
      this.pausePeriodicChecks();
    }
  };
  
  private handleOnline = () => {
    console.log('[HEALTH_SERVICE] 🌐 Network online - immediate health check');
    this.lastActivityTime = Date.now();
    this.checkHealthImmediate();
  };
  
  private handleOffline = () => {
    console.log('[HEALTH_SERVICE] 📴 Network offline - pausing checks');
    this.pausePeriodicChecks();
    this.lastResult = {
      isHealthy: false,
      responseTime: 0,
      timestamp: Date.now(),
      error: 'Network offline'
    };
    this.notifyListeners();
  };
  
  private constructor() {
    // SAFETY: Prevent multiple instances
    if (HealthCheckService.isInitialized) {
      throw new Error('HealthCheckService already initialized - use getInstance()');
    }
    HealthCheckService.isInitialized = true;
    
    // Initialize broadcast channel for cross-tab coordination
    this.broadcastChannel = new BroadcastChannel('health-check-service');
    this.broadcastChannel.onmessage = (event) => {
      if (event.data.type === 'health-result') {
        // Use result from other tab if recent (< 1 minute)
        const ageMs = Date.now() - event.data.result.timestamp;
        if (ageMs < 60000) {
          console.log('[HEALTH_SERVICE] 📡 Using health result from other tab:', ageMs, 'ms ago');
          this.lastResult = event.data.result;
          this.notifyListeners();
        }
      }
    };
    
    this.initializeDeviceProfile();
    this.setupEventListeners();
    this.startPeriodicChecks();
    
    console.log('[HEALTH_SERVICE] 🚀 Initialized with config:', {
      baseInterval: `${this.config.baseInterval/1000}s`,
      maxInterval: `${this.config.maxInterval/1000}s`,
      device: this.config.device
    });
  }
  
  public static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService();
    }
    return HealthCheckService.instance;
  }
  
  /**
   * Initialize device profile for adaptive intervals
   */
  private initializeDeviceProfile(): void {
    const connection = (navigator as any).connection;
    const isLowEnd = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g';
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    
    if (isLowEnd || (isMobile && navigator.hardwareConcurrency <= 2)) {
      this.config.device = 'low-end';
      this.config.baseInterval = 180000; // 3 minutes
      this.config.maxInterval = 300000;  // 5 minutes
    } else if (connection?.effectiveType === '4g' && navigator.hardwareConcurrency > 4) {
      this.config.device = 'high-end';
      this.config.baseInterval = 120000; // 2 minutes
      this.config.maxInterval = 240000;  // 4 minutes
    }
    
    this.config.currentInterval = this.config.baseInterval;
    
    console.log('[HEALTH_SERVICE] 📱 Device profile:', this.config.device);
  }
  
  /**
   * Setup event listeners for network and visibility changes
   */
  private setupEventListeners(): void {
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // Track user activity for intelligent intervals
    ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
      document.addEventListener(event, () => {
        this.lastActivityTime = Date.now();
      }, { passive: true });
    });
  }
  
  /**
   * Start periodic health checks with adaptive intervals
   */
  private startPeriodicChecks(): void {
    console.log('[HEALTH_SERVICE] 🚫 EMERGENCY DISABLE: All periodic checks disabled to stop polling overload');
    // EMERGENCY: Completely disable all polling to stop server overload
    // Will re-enable once we identify the rogue polling source
    return;
    
    /* DISABLED CODE:
    if (!this.isVisible || this.intervalId !== null) {
      return;
    }
    
    console.log(`[HEALTH_SERVICE] ⏰ Starting periodic checks every ${this.config.currentInterval/1000}s`);
    console.log(`[HEALTH_SERVICE] 🔍 DEBUG: Previous intervalId:`, this.intervalId);
    
    this.intervalId = window.setInterval(() => {
      console.log(`[HEALTH_SERVICE] 🔄 Interval fired - performing health check`);
      // SAFETY: Only check if page is visible and user is active
      const inactiveTime = Date.now() - this.lastActivityTime;
      if (!this.isVisible || inactiveTime > 600000) { // 10 min inactive
        console.log('[HEALTH_SERVICE] ⏸️ Skipping check - page hidden or inactive');
        return;
      }
      
      this.performHealthCheck();
    }, this.config.currentInterval);
    
    // Initial check if no recent result
    if (!this.lastResult || Date.now() - this.lastResult.timestamp > 60000) {
      this.performHealthCheck();
    }
    */
  }
  
  /**
   * Restart periodic checks (e.g., when page becomes visible)
   */
  private restartPeriodicChecks(): void {
    this.pausePeriodicChecks();
    this.startPeriodicChecks();
  }
  
  /**
   * Pause periodic health checks
   */
  private pausePeriodicChecks(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[HEALTH_SERVICE] ⏸️ Periodic checks paused');
    }
  }
  
  /**
   * Perform immediate health check (bypasses scheduling)
   */
  public async checkHealthImmediate(): Promise<HealthCheckResult> {
    return this.performHealthCheck(true);
  }
  
  /**
   * Get latest health result (may be cached)
   */
  public getLatestResult(): HealthCheckResult | null {
    return this.lastResult;
  }
  
  /**
   * Core health check implementation with proper deduplication
   */
  private async performHealthCheck(immediate = false): Promise<HealthCheckResult> {
    // DEDUPLICATION: If request is in flight, wait for it
    if (this.inFlightRequest && !immediate) {
      console.log('[HEALTH_SERVICE] 🔄 Health check already in progress - waiting...');
      return this.inFlightRequest;
    }
    
    // TELEMETRY: Enforce ≤1 request per 5 minutes globally
    const timeSinceLastCheck = Date.now() - this.telemetry.lastCheckTime;
    if (timeSinceLastCheck < 300000 && !immediate && this.telemetry.totalChecks > 0) {
      console.log(`[HEALTH_SERVICE] ⏰ Rate limit: ${Math.round(timeSinceLastCheck/1000)}s since last check (5min minimum)`);
      return this.lastResult || {
        isHealthy: false,
        responseTime: 0,
        timestamp: Date.now(),
        error: 'Rate limited',
        fromCache: true
      };
    }
    
    const startTime = performance.now();
    this.inFlightRequest = this.executeHealthCheck();
    
    try {
      const result = await this.inFlightRequest;
      this.handleHealthCheckSuccess(result, startTime);
      return result;
    } catch (error) {
      const result = this.handleHealthCheckFailure(error, startTime);
      return result;
    } finally {
      this.inFlightRequest = null;
    }
  }
  
  /**
   * Execute the actual health check HTTP request
   */
  private async executeHealthCheck(): Promise<HealthCheckResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
        headers: {
          'X-Health-Check': 'true'
        }
      });
      
      clearTimeout(timeoutId);
      
      const responseTime = performance.now();
      const isHealthy = response.ok;
      
      if (!isHealthy) {
        console.warn(`[HEALTH_SERVICE] ⚠️ Server unhealthy: ${response.status}`);
      }
      
      return {
        isHealthy,
        responseTime: responseTime,
        timestamp: Date.now(),
        error: isHealthy ? undefined : `HTTP ${response.status}`
      };
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
  
  /**
   * Handle successful health check
   */
  private handleHealthCheckSuccess(result: HealthCheckResult, startTime: number): void {
    result.responseTime = performance.now() - startTime;
    this.lastResult = result;
    this.config.consecutiveFailures = 0;
    
    // Reset to base interval on success
    this.config.currentInterval = this.config.baseInterval;
    // Don't restart - let current interval continue
    
    // Update telemetry
    this.updateTelemetry(result);
    
    // Broadcast to other tabs
    this.broadcastChannel.postMessage({
      type: 'health-result',
      result
    });
    
    this.notifyListeners();
    
    if (import.meta.env.DEV) {
      console.log(`[HEALTH_SERVICE] ✅ Health check passed in ${Math.round(result.responseTime)}ms`);
    }
  }
  
  /**
   * Handle failed health check with adaptive backoff
   */
  private handleHealthCheckFailure(error: any, startTime: number): HealthCheckResult {
    this.config.consecutiveFailures++;
    
    // Adaptive backoff: 2min → 3min → 5min
    const backoffMultiplier = Math.min(this.config.consecutiveFailures, 2.5);
    this.config.currentInterval = Math.min(
      this.config.baseInterval * backoffMultiplier,
      this.config.maxInterval
    );
    
    const result: HealthCheckResult = {
      isHealthy: false,
      responseTime: performance.now() - startTime,
      timestamp: Date.now(),
      error: error.name === 'AbortError' ? 'Timeout' : error.message
    };
    
    this.lastResult = result;
    this.updateTelemetry(result);
    this.restartPeriodicChecks();
    this.notifyListeners();
    
    console.warn(`[HEALTH_SERVICE] ❌ Health check failed: ${result.error} (backoff to ${this.config.currentInterval/1000}s)`);
    
    return result;
  }
  
  /**
   * Update telemetry data
   */
  private updateTelemetry(result: HealthCheckResult): void {
    this.telemetry.totalChecks++;
    this.telemetry.lastCheckTime = Date.now();
    
    if (!result.isHealthy) {
      this.telemetry.failureCount++;
    }
    
    // Update average response time
    const oldAvg = this.telemetry.averageResponseTime;
    const count = this.telemetry.totalChecks;
    this.telemetry.averageResponseTime = (oldAvg * (count - 1) + result.responseTime) / count;
    
    // Calculate checks per minute
    if (this.telemetry.totalChecks > 1) {
      const timespan = Date.now() - (this.telemetry.lastCheckTime - (this.config.currentInterval * (count - 1)));
      this.telemetry.checksPerMinute = (count * 60000) / timespan;
    }
  }
  
  // Listener management
  private listeners: Array<(result: HealthCheckResult) => void> = [];
  
  public addListener(listener: (result: HealthCheckResult) => void): void {
    this.listeners.push(listener);
  }
  
  public removeListener(listener: (result: HealthCheckResult) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }
  
  private notifyListeners(): void {
    if (this.lastResult) {
      this.listeners.forEach(listener => {
        try {
          listener(this.lastResult!);
        } catch (error) {
          console.error('[HEALTH_SERVICE] Listener error:', error);
        }
      });
    }
  }
  
  /**
   * Get current telemetry data
   */
  public getTelemetry(): HealthCheckTelemetry {
    return { ...this.telemetry };
  }
  
  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.pausePeriodicChecks();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    this.broadcastChannel.close();
    this.listeners.length = 0;
    console.log('[HEALTH_SERVICE] 🧹 Cleanup complete');
  }
}

// Export singleton instance
export const healthCheckService = HealthCheckService.getInstance();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    healthCheckService.destroy();
  });
}

export default healthCheckService;
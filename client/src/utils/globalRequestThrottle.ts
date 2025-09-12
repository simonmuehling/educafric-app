/**
 * DEPRECATED: This file is being removed as part of the health check service refactoring
 * The dangerous fake 200 responses have been eliminated in favor of a centralized HealthCheckService
 * 
 * @deprecated Use HealthCheckService instead
 */

// This class is now a no-op to prevent breaking changes during transition
class GlobalRequestThrottle {
  private static instance: GlobalRequestThrottle;
  
  private constructor() {
    console.log('[GLOBAL_THROTTLE] 🚨 DEPRECATED: This throttle is disabled. Use HealthCheckService instead.');
  }
  
  public static getInstance(): GlobalRequestThrottle {
    if (!GlobalRequestThrottle.instance) {
      GlobalRequestThrottle.instance = new GlobalRequestThrottle();
    }
    return GlobalRequestThrottle.instance;
  }
  
  public getStats() {
    return {
      deprecation: 'This service is deprecated. Use HealthCheckService.getTelemetry() instead.'
    };
  }
}

export const globalRequestThrottle = GlobalRequestThrottle.getInstance();

// Clean up any dangerous global fetch interceptions from previous versions
if (typeof window !== 'undefined') {
  console.log('[GLOBAL_THROTTLE] 🧹 Cleaning up dangerous fetch interceptions...');
  
  // Reset dangerous global flags that created fake responses
  (window as any).__fetch_intercepted = false;
  (window as any).__pwa_connection_initialized = false;
  (window as any).__pwa_connection_manager_instance = null;
  (window as any).__network_optimizer_monitoring_started = false;
  (window as any).__useNetworkQuality_active = false;
  
  console.log('[GLOBAL_THROTTLE] ✅ Dangerous fetch interceptions removed - HealthCheckService will handle monitoring safely');
}

export default globalRequestThrottle;
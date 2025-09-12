/**
 * EMERGENCY POLLING STOP - Immediately terminate all health check polling
 * 
 * This utility forcefully stops all active polling intervals to prevent
 * server overload while the new centralized HealthCheckService takes over.
 */

console.log('[EMERGENCY_STOP] 🚨 Initiating emergency polling termination...');

// Record original setTimeout and setInterval references
const originalSetTimeout = window.setTimeout;
const originalSetInterval = window.setInterval;
const originalClearTimeout = window.clearTimeout;
const originalClearInterval = window.clearInterval;

// Track all active intervals and timeouts
const activeIntervals: Set<number> = new Set();
const activeTimeouts: Set<number> = new Set();

// Override setInterval to track all intervals
window.setInterval = function(handler: any, timeout?: number) {
  const intervalId = originalSetInterval(handler, timeout);
  activeIntervals.add(intervalId);
  return intervalId;
};

// Override setTimeout to track all timeouts
window.setTimeout = function(handler: any, timeout?: number) {
  const timeoutId = originalSetTimeout(handler, timeout);
  activeTimeouts.add(timeoutId);
  return timeoutId;
};

// Override clearInterval to remove from tracking
window.clearInterval = function(id?: number) {
  if (id) {
    activeIntervals.delete(id);
    originalClearInterval(id);
  }
};

// Override clearTimeout to remove from tracking
window.clearTimeout = function(id?: number) {
  if (id) {
    activeTimeouts.delete(id);
    originalClearTimeout(id);
  }
};

/**
 * Force clear all existing intervals and timeouts
 */
export function emergencyStopAllPolling(): void {
  console.log('[EMERGENCY_STOP] 🛑 Clearing all active intervals and timeouts...');
  
  let clearedCount = 0;
  
  // Clear all tracked intervals
  activeIntervals.forEach(id => {
    try {
      originalClearInterval(id);
      clearedCount++;
    } catch (e) {
      // Continue on error
    }
  });
  
  // Clear all tracked timeouts
  activeTimeouts.forEach(id => {
    try {
      originalClearTimeout(id);
      clearedCount++;
    } catch (e) {
      // Continue on error
    }
  });
  
  activeIntervals.clear();
  activeTimeouts.clear();
  
  // Also try to clear any intervals that might have been created before tracking
  for (let i = 1; i <= 10000; i++) {
    try {
      originalClearInterval(i);
      originalClearTimeout(i);
    } catch (e) {
      // Silently continue
    }
  }
  
  // Reset all known global polling flags
  if (typeof window !== 'undefined') {
    (window as any).__pwa_connection_initialized = true; // Prevent re-init
    (window as any).__pwa_connection_manager_instance = null;
    (window as any).__network_optimizer_monitoring_started = true; // Prevent re-init
    (window as any).__useNetworkQuality_active = true; // Prevent re-init
    (window as any).__connection_fallback_initialized = true; // Prevent re-init
    (window as any).__fetch_intercepted = false; // Allow clean fetch
  }
  
  console.log(`[EMERGENCY_STOP] ✅ Cleared ${clearedCount} tracked timers + force cleared legacy intervals`);
  console.log('[EMERGENCY_STOP] 🔄 All polling stopped - HealthCheckService will take over');
}

/**
 * Get current polling statistics
 */
export function getPollingStats() {
  return {
    activeIntervals: activeIntervals.size,
    activeTimeouts: activeTimeouts.size,
    intervalIds: Array.from(activeIntervals),
    timeoutIds: Array.from(activeTimeouts)
  };
}

// Initialize emergency stop immediately when this module loads
if (typeof window !== 'undefined') {
  // Immediate stop to prevent any polling from starting
  emergencyStopAllPolling();
  
  // Also stop after brief delay to catch delayed initializations
  originalSetTimeout(() => {
    emergencyStopAllPolling();
    console.log('[EMERGENCY_STOP] 🔄 Secondary cleanup completed');
  }, 1000); // 1 second delay
  
  // Final cleanup after more components may have loaded
  originalSetTimeout(() => {
    emergencyStopAllPolling();
    console.log('[EMERGENCY_STOP] 🔄 Final cleanup completed');
  }, 5000); // 5 seconds for complete initialization
}

export default { emergencyStopAllPolling, getPollingStats };
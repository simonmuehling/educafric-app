/**
 * EMERGENCY POLLING STOP - Manual termination utility for legacy polling
 * 
 * This utility provides manual control to stop legacy polling intervals
 * when needed, while allowing legitimate health monitoring to function.
 * 
 * AUTO-EXECUTION DISABLED: No longer automatically clears all timers to
 * prevent interference with HealthCheckService and other legitimate intervals.
 */

console.log('[EMERGENCY_STOP] 🛠️ Emergency polling stop utility loaded (manual mode)');

// Record original setTimeout and setInterval references
const originalSetTimeout = window.setTimeout;
const originalSetInterval = window.setInterval;
const originalClearTimeout = window.clearTimeout;
const originalClearInterval = window.clearInterval;

// Track all active intervals and timeouts
const activeIntervals: Set<number> = new Set();
const activeTimeouts: Set<number> = new Set();

// Override setInterval to track all intervals
const newSetInterval = function(handler: any, timeout?: number, ...args: any[]) {
  const intervalId = originalSetInterval(handler, timeout, ...args);
  activeIntervals.add(intervalId);
  return intervalId;
} as typeof window.setInterval;

// Copy over any additional properties from original function
Object.setPrototypeOf(newSetInterval, originalSetInterval);
Object.assign(newSetInterval, originalSetInterval);

window.setInterval = newSetInterval;

// Override setTimeout to track all timeouts
const newSetTimeout = function(handler: any, timeout?: number, ...args: any[]) {
  const timeoutId = originalSetTimeout(handler, timeout, ...args);
  activeTimeouts.add(timeoutId);
  return timeoutId;
} as typeof window.setTimeout;

// Copy over any additional properties from original function
Object.setPrototypeOf(newSetTimeout, originalSetTimeout);
Object.assign(newSetTimeout, originalSetTimeout);

window.setTimeout = newSetTimeout;

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
 * Force clear all existing intervals and timeouts (MANUAL USE ONLY)
 * WARNING: This will clear ALL timers including legitimate ones like HealthCheckService!
 * Only use when you specifically need to stop all polling due to emergencies.
 */
export function emergencyStopAllPolling(): void {
  console.log('[EMERGENCY_STOP] 🛑 MANUAL emergency stop activated - clearing all timers...');
  
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
  
  // DANGER ZONE: Clear all possible timer IDs - ONLY for true emergencies
  console.log('[EMERGENCY_STOP] ⚠️ DANGER: Clearing all possible timer IDs (1-10000)...');
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
  
  console.log(`[EMERGENCY_STOP] ✅ Manual emergency stop complete: ${clearedCount} tracked timers + 10000 possible timer IDs cleared`);
  console.log('[EMERGENCY_STOP] ⚠️  WARNING: This includes HealthCheckService and other legitimate timers!');
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

// AUTOMATIC EXECUTION DISABLED: No longer auto-clears timers on module load
// This prevents interference with HealthCheckService and other legitimate timers.
// 
// To manually trigger emergency stop, call emergencyStopAllPolling() from console:
// import('@/utils/emergencyPollingStop').then(m => m.emergencyStopAllPolling())
//
// Previous behavior (DISABLED):
// - Immediate stop on module load
// - Secondary cleanup after 1 second  
// - Final cleanup after 5 seconds
//
// if (typeof window !== 'undefined') {
//   emergencyStopAllPolling();
//   originalSetTimeout(() => {
//     emergencyStopAllPolling();
//     console.log('[EMERGENCY_STOP] 🔄 Secondary cleanup completed');
//   }, 1000);
//   originalSetTimeout(() => {
//     emergencyStopAllPolling();
//     console.log('[EMERGENCY_STOP] 🔄 Final cleanup completed');
//   }, 5000);
// }

console.log('[EMERGENCY_STOP] ✅ Module loaded in MANUAL mode - automatic execution disabled');
console.log('[EMERGENCY_STOP] 🔧 To trigger manually: emergencyStopAllPolling()');

export default { emergencyStopAllPolling, getPollingStats };
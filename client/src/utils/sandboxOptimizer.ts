// SANDBOX ULTRA-FAST LOADING OPTIMIZER
// Optimizes loading times specifically for client presentations

interface SandboxModuleCache {
  [key: string]: Promise<any> | any;
}

class SandboxOptimizer {
  private static instance: SandboxOptimizer;
  private moduleCache: SandboxModuleCache = {};
  private preloadedModules = new Set<string>();

  static getInstance(): SandboxOptimizer {
    if (!SandboxOptimizer.instance) {
      SandboxOptimizer.instance = new SandboxOptimizer();
    }
    return SandboxOptimizer.instance;
  }

  // ULTRA-FAST PRELOAD - For instant sandbox access
  async preloadCriticalModules() {
    console.log('🚀 [SANDBOX_OPTIMIZER] Starting ultra-fast preload...');
    
    const criticalModules = [
      {
        key: 'ParentDashboard',
        loader: () => import('@/components/parent/ParentDashboard')
      },
      {
        key: 'StudentDashboard', 
        loader: () => import('@/components/student/StudentDashboard')
      },
      {
        key: 'TeacherDashboard',
        loader: () => import('@/components/teacher/TeacherDashboard')
      },
      {
        key: 'FreelancerDashboard',
        loader: () => import('@/components/freelancer/FreelancerDashboard')
      },
      {
        key: 'DirectorDashboard',
        loader: () => import('@/components/director/DirectorDashboard')
      },
      {
        key: 'AdminDashboard',
        loader: () => import('@/components/admin/AdminDashboard')
      }
    ];

    // Preload all critical modules in parallel for maximum speed
    const preloadPromises = criticalModules.map(async (module) => {
      if (this.preloadedModules.has(module.key)) {
        return this.moduleCache[module.key];
      }

      try {
        console.log(`⚡ [SANDBOX_OPTIMIZER] Preloading ${module.key}...`);
        const startTime = performance.now();
        
        this.moduleCache[module.key] = module.loader();
        await this.moduleCache[module.key];
        
        const loadTime = performance.now() - startTime;
        console.log(`✅ [SANDBOX_OPTIMIZER] ${module.key} loaded in ${loadTime.toFixed(2)}ms`);
        
        this.preloadedModules.add(module.key);
      } catch (error) {
        console.error(`❌ [SANDBOX_OPTIMIZER] Failed to preload ${module.key}:`, error);
      }
    });

    await Promise.all(preloadPromises);
    console.log('🎯 [SANDBOX_OPTIMIZER] All critical modules preloaded for instant access!');
  }

  // Get module instantly from cache
  getModule(key: string): Promise<any> | any {
    if (this.moduleCache[key]) {
      console.log(`⚡ [SANDBOX_OPTIMIZER] Instant access to ${key} from cache`);
      return this.moduleCache[key];
    }
    
    console.warn(`⚠️ [SANDBOX_OPTIMIZER] Module ${key} not in cache, loading on demand`);
    return null;
  }

  // Check if module is ready for instant access
  isModuleReady(key: string): boolean {
    return this.preloadedModules.has(key);
  }

  // Clear cache if needed
  clearCache() {
    this.moduleCache = {};
    this.preloadedModules.clear();
    console.log('🔄 [SANDBOX_OPTIMIZER] Cache cleared');
  }
}

// Initialize optimizer immediately
const sandboxOptimizer = SandboxOptimizer.getInstance();

// Start preloading critical modules for instant sandbox access
if (typeof window !== 'undefined') {
  // Preload when browser is ready
  window.addEventListener('DOMContentLoaded', () => {
    sandboxOptimizer.preloadCriticalModules();
  });
  
  // Also preload on idle for better performance
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      sandboxOptimizer.preloadCriticalModules();
    });
  }
}

export { sandboxOptimizer, SandboxOptimizer };
export default sandboxOptimizer;
// Unified Module Loader Strategy - Eliminates Fast vs Lazy confusion
// For 3500+ users: SMART loading with instant preload for critical modules

import React from 'react';

interface ModuleCache {
  [key: string]: React.ComponentType<any>;
}

type LoadingStrategy = 'instant' | 'lazy' | 'preload';

interface ModuleConfig {
  component: () => Promise<any>;
  strategy: LoadingStrategy;
  priority: number; // 1=highest, 5=lowest
}

class UnifiedModuleLoader {
  private cache: ModuleCache = {};
  private loadingPromises: Map<string, Promise<React.ComponentType<any>>> = new Map();
  private preloadedModules: Set<string> = new Set();

  // CRITICAL MODULES - Load instantly at startup (no lazy loading)
  private criticalModules: ModuleConfig[] = [
    // School Dashboard - Highest priority
    { component: () => import('@/components/director/modules/FunctionalDirectorOverview'), strategy: 'instant', priority: 1 },
    { component: () => import('@/components/director/modules/FunctionalDirectorProfile'), strategy: 'instant', priority: 1 },
    { component: () => import('@/components/director/modules/FunctionalDirectorTeacherManagement'), strategy: 'instant', priority: 1 },
    { component: () => import('@/components/director/modules/AdministratorManagementFunctional'), strategy: 'instant', priority: 1 },
    { component: () => import('@/components/director/modules/TimetableConfiguration'), strategy: 'instant', priority: 1 },
    
    // Parent Dashboard - High priority
    { component: () => import('@/components/parent/modules/MyChildren'), strategy: 'instant', priority: 2 },
    { component: () => import('@/components/parent/modules/FunctionalParentMessages'), strategy: 'instant', priority: 2 },
    { component: () => import('@/components/parent/modules/ParentGeolocation'), strategy: 'instant', priority: 2 },
    
    // Commercial Dashboard - High priority
    { component: () => import('@/components/commercial/modules/DocumentsContracts'), strategy: 'instant', priority: 2 },
    { component: () => import('@/components/commercial/modules/CommercialStatistics'), strategy: 'instant', priority: 2 },
    
    // SiteAdmin Dashboard - High priority
    { component: () => import('@/components/siteadmin/modules/FunctionalSiteAdminUsers'), strategy: 'instant', priority: 2 },
    { component: () => import('@/components/siteadmin/modules/FunctionalSiteAdminSchools'), strategy: 'instant', priority: 2 },
    { component: () => import('@/components/siteadmin/modules/FunctionalSiteAdminDocuments'), strategy: 'instant', priority: 2 },
    
    // Shared Components - Medium priority
    { component: () => import('@/components/shared/NotificationCenter'), strategy: 'preload', priority: 3 },
    { component: () => import('@/components/director/modules/SchoolConfigurationGuide'), strategy: 'preload', priority: 3 },
  ];

  // SECONDARY MODULES - Load on demand (true lazy loading)
  private secondaryModules: ModuleConfig[] = [
    // Less frequently used components
    { component: () => import('@/components/director/modules/ReportsAnalytics'), strategy: 'lazy', priority: 4 },
    { component: () => import('@/components/director/modules/UnifiedSchoolSettings'), strategy: 'lazy', priority: 4 },
    { component: () => import('@/pages/BulletinValidationTest'), strategy: 'lazy', priority: 5 },
    { component: () => import('@/pages/UIShowcase'), strategy: 'lazy', priority: 5 },
    // Add missing modules that were causing warnings
    { component: () => import('@/components/shared/UnifiedProfileManager'), strategy: 'lazy', priority: 5 }, // for help
    { component: () => import('@/components/shared/UnifiedProfileManager'), strategy: 'lazy', priority: 5 }, // for settings
  ];

  private moduleMap: { [key: string]: ModuleConfig } = {};

  constructor() {
    this.buildModuleMap();
    this.initializeModuleLoading();
  }

  private buildModuleMap() {
    // Map module names to their configurations
    const allModules = [...this.criticalModules, ...this.secondaryModules];
    
    const moduleNames = [
      'overview', 'settings', 'teachers', 'students', 'classes', 'timetable',
      'attendance', 'communications', 'notifications', 'reports', 'help',
      'school-administrators', 'AdministratorManagement', 'director-timetable',
      'MyChildren', 'FunctionalParentMessages', 'ParentGeolocation',
      'DocumentsContracts', 'CommercialStatistics', 'siteadmin-users', 
      'siteadmin-schools', 'siteadmin-documents', 'ContactsManagement'
    ];

    moduleNames.forEach((name, index) => {
      if (allModules[index]) {
        this.moduleMap[name] = allModules[index];
      }
    });
  }

  private async initializeModuleLoading() {
    console.log('[UNIFIED_LOADER] 🚀 Starting unified module loading strategy');
    
    // Phase 1: Load CRITICAL modules instantly (blocking)
    const criticalPromises = this.criticalModules.map(async (config, index) => {
      try {
        const module = await config.component();
        const componentName = Object.keys(this.moduleMap).find(key => this.moduleMap[key] === config) || `critical_${index}`;
        this.cache[componentName] = module.default;
        console.log(`[UNIFIED_LOADER] ✅ Critical module ${componentName} loaded instantly`);
      } catch (error) {
        console.error(`[UNIFIED_LOADER] ❌ Failed to load critical module:`, error);
      }
    });

    await Promise.all(criticalPromises);
    console.log(`[UNIFIED_LOADER] 🎯 ${criticalPromises.length} critical modules loaded`);

    // Phase 2: Preload SECONDARY modules in background (non-blocking)
    this.preloadSecondaryModules();
  }

  private async preloadSecondaryModules() {
    const preloadModules = this.secondaryModules.filter(config => config.strategy === 'preload');
    
    preloadModules.forEach(async (config, index) => {
      try {
        const module = await config.component();
        const componentName = Object.keys(this.moduleMap).find(key => this.moduleMap[key] === config) || `preload_${index}`;
        this.cache[componentName] = module.default;
        this.preloadedModules.add(componentName);
        console.log(`[UNIFIED_LOADER] 📦 Preloaded module ${componentName}`);
      } catch (error) {
        console.warn(`[UNIFIED_LOADER] ⚠️ Failed to preload module:`, error);
      }
    });
  }

  // Public API: Load module with unified strategy
  async loadModule(moduleName: string): Promise<React.ComponentType<any>> {
    // 1. Check cache first (instant return)
    if (this.cache[moduleName]) {
      console.log(`[UNIFIED_LOADER] ⚡ Cache hit for ${moduleName}`);
      return this.cache[moduleName];
    }

    // 2. Check if already loading
    if (this.loadingPromises.has(moduleName)) {
      console.log(`[UNIFIED_LOADER] ⏳ Already loading ${moduleName}, waiting...`);
      return this.loadingPromises.get(moduleName)!;
    }

    // 3. Load module based on strategy
    const config = this.moduleMap[moduleName];
    if (!config) {
      throw new Error(`[UNIFIED_LOADER] ❌ Unknown module: ${moduleName}`);
    }

    const loadPromise = this.executeLoadStrategy(moduleName, config);
    this.loadingPromises.set(moduleName, loadPromise);

    try {
      const component = await loadPromise;
      this.cache[moduleName] = component;
      this.loadingPromises.delete(moduleName);
      return component;
    } catch (error) {
      this.loadingPromises.delete(moduleName);
      throw error;
    }
  }

  private async executeLoadStrategy(moduleName: string, config: ModuleConfig): Promise<React.ComponentType<any>> {
    console.log(`[UNIFIED_LOADER] 📡 Loading ${moduleName} with ${config.strategy} strategy`);
    
    const startTime = performance.now();
    const module = await config.component();
    const loadTime = performance.now() - startTime;
    
    console.log(`[UNIFIED_LOADER] ✅ ${moduleName} loaded in ${loadTime.toFixed(2)}ms`);
    return module.default;
  }

  // Performance monitoring
  getLoadingStats() {
    return {
      cachedModules: Object.keys(this.cache).length,
      preloadedModules: this.preloadedModules.size,
      activeLoading: this.loadingPromises.size,
      totalConfigured: Object.keys(this.moduleMap).length
    };
  }

  // Clear cache for memory management
  clearCache() {
    console.log('[UNIFIED_LOADER] 🧹 Clearing module cache');
    this.cache = {};
    this.preloadedModules.clear();
    this.loadingPromises.clear();
  }
}

// Export singleton instance
export const unifiedModuleLoader = new UnifiedModuleLoader();

// React Hook for easy module loading
export function useUnifiedModule(moduleName: string) {
  const [component, setComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);

    unifiedModuleLoader.loadModule(moduleName)
      .then(comp => {
        setComponent(() => comp);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [moduleName]);

  return { component, loading, error };
}

export default unifiedModuleLoader;
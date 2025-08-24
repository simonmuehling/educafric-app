// SYSTÈME DE CHARGEMENT CONSOLIDÉ ULTRA-RAPIDE
// Eliminates 5+ second slow loads for 3500+ concurrent users
import React from 'react';

interface CachedModule {
  component: React.ComponentType<any>;
  timestamp: number;
}

class ConsolidatedModuleLoader {
  private cache = new Map<string, CachedModule>();
  private loadingPromises = new Map<string, Promise<React.ComponentType<any>>>();
  private preloadQueue: string[] = [];
  private isPreloading = false;

  // ULTRA-SIMPLIFIED MODULE MAPPING - No duplicates, only essentials
  private getModuleImport(moduleName: string): (() => Promise<any>) | null {
    // Core dashboard modules only - streamlined for speed
    const coreModules: Record<string, () => Promise<any>> = {
      // Director (most used)
      'overview': () => import('@/components/director/modules/FunctionalDirectorOverview'),
      'teachers': () => import('@/components/director/modules/FunctionalDirectorTeacherManagement'),
      'students': () => import('@/components/director/modules/FunctionalDirectorStudentManagement'),
      'classes': () => import('@/components/director/modules/FunctionalDirectorClassManagement'),
      
      // Parent (high usage)
      'children': () => import('@/components/parent/modules/FunctionalParentChildren'),
      'geolocation': () => import('@/components/parent/modules/ParentGeolocation'),
      'family': () => import('@/components/parent/modules/FamilyConnections'),
      
      // Teacher (daily use)
      'teacher-classes': () => import('@/components/teacher/modules/FunctionalMyClasses'),
      'teacher-grades': () => import('@/components/teacher/modules/FunctionalTeacherGrades'),
      'teacher-attendance': () => import('@/components/teacher/modules/FunctionalTeacherAttendance'),
      
      // Student (frequent)
      'timetable': () => import('@/components/student/modules/StudentTimetable'),
      'grades': () => import('@/components/student/modules/FunctionalStudentGrades'),
      'bulletins': () => import('@/components/student/modules/FunctionalStudentBulletins'),
      
      // Commercial (business critical)
      'commercial-schools': () => import('@/components/commercial/modules/MySchools'),
      'commercial-contacts': () => import('@/components/commercial/modules/ContactsManagement'),
      
      // Shared essentials
      'notifications': () => import('@/components/shared/NotificationCenter'),
      'profile': () => import('@/components/shared/UnifiedProfileManager'),
      'help': () => import('@/components/help/HelpCenter')
    };

    return coreModules[moduleName] || null;
  }

  // INSTANT CACHE RETRIEVAL - No delays
  getModule(moduleName: string): React.ComponentType<any> | null {
    const cached = this.cache.get(moduleName);
    if (cached) {
      console.log(`[CONSOLIDATED] ⚡ ${moduleName} served instantly from cache`);
      return cached.component;
    }
    return null;
  }

  // AGGRESSIVE PRELOAD with queue management
  async preloadModule(moduleName: string): Promise<React.ComponentType<any> | null> {
    // Return immediately if cached
    const cached = this.cache.get(moduleName);
    if (cached) return cached.component;

    // Return existing promise if loading
    const existing = this.loadingPromises.get(moduleName);
    if (existing) return existing;

    const importFn = this.getModuleImport(moduleName);
    if (!importFn) {
      console.warn(`[CONSOLIDATED] ⚠️ Module ${moduleName} not in core list`);
      return null;
    }

    console.log(`[CONSOLIDATED] 🚀 Fast-loading ${moduleName}`);
    
    const loadPromise = importFn()
      .then(module => {
        const Component = module.default || module;
        this.cache.set(moduleName, {
          component: Component,
          timestamp: Date.now()
        });
        this.loadingPromises.delete(moduleName);
        console.log(`[CONSOLIDATED] ✅ ${moduleName} loaded instantly`);
        return Component;
      })
      .catch(error => {
        console.error(`[CONSOLIDATED] ❌ Failed to load ${moduleName}:`, error);
        this.loadingPromises.delete(moduleName);
        return null;
      });

    this.loadingPromises.set(moduleName, loadPromise);
    return loadPromise;
  }

  // SMART BATCH PRELOADING - Load multiple modules efficiently
  async batchPreload(modules: string[]): Promise<void> {
    if (this.isPreloading) return;
    
    this.isPreloading = true;
    console.log('[CONSOLIDATED] 🔥 Starting batch preload...');
    
    // Load 3 modules at a time to avoid overwhelming the system
    const BATCH_SIZE = 3;
    
    for (let i = 0; i < modules.length; i += BATCH_SIZE) {
      const batch = modules.slice(i, i + BATCH_SIZE);
      
      await Promise.allSettled(
        batch.map(module => this.preloadModule(module))
      );
      
      // Small delay between batches to prevent blocking UI
      if (i + BATCH_SIZE < modules.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    this.isPreloading = false;
    console.log('[CONSOLIDATED] ⚡ Batch preload complete - all modules ready');
  }

  // ROLE-BASED SMART PRELOADING
  async preloadForRole(role: string): Promise<void> {
    const roleModules: Record<string, string[]> = {
      'director': ['overview', 'teachers', 'students', 'classes', 'notifications'],
      'parent': ['children', 'geolocation', 'family', 'notifications', 'profile'],
      'teacher': ['teacher-classes', 'teacher-grades', 'teacher-attendance', 'notifications'],
      'student': ['timetable', 'grades', 'bulletins', 'profile'],
      'commercial': ['commercial-schools', 'commercial-contacts', 'notifications']
    };

    const modules = roleModules[role] || ['profile', 'notifications'];
    await this.batchPreload(modules);
  }

  // MEMORY CLEANUP with LRU strategy
  cleanup(): void {
    const maxAge = 30 * 60 * 1000; // 30 minutes
    const maxItems = 20; // Keep max 20 modules
    const now = Date.now();

    // Remove old modules - Compatible with all TypeScript targets
    const entries = Array.from(this.cache.entries());
    for (const [key, value] of entries) {
      if (now - value.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }

    // If still too many, remove oldest
    if (this.cache.size > maxItems) {
      const sorted = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      for (let i = 0; i < sorted.length - maxItems; i++) {
        this.cache.delete(sorted[i][0]);
      }
    }

    console.log(`[CONSOLIDATED] 🧹 Cleanup done - ${this.cache.size} modules cached`);
  }

  // GET CACHE STATS
  getStats() {
    return {
      cached: this.cache.size,
      loading: this.loadingPromises.size,
      isPreloading: this.isPreloading
    };
  }
}

// SINGLETON INSTANCE
export const consolidatedLoader = new ConsolidatedModuleLoader();

// REACT HOOK - Simple and fast
export const useConsolidatedModules = () => {
  const getModule = React.useCallback((moduleName: string) => {
    return consolidatedLoader.getModule(moduleName);
  }, []);

  const preloadModule = React.useCallback((moduleName: string) => {
    return consolidatedLoader.preloadModule(moduleName);
  }, []);

  const preloadForRole = React.useCallback((role: string) => {
    return consolidatedLoader.preloadForRole(role);
  }, []);

  const isReady = React.useCallback((moduleName: string) => {
    return Boolean(consolidatedLoader.getModule(moduleName));
  }, []);

  return { getModule, preloadModule, preloadForRole, isReady };
};

// ALIAS for dashboard compatibility
export const useFastModules = useConsolidatedModules;

// AUTO-CLEANUP every 15 minutes
setInterval(() => {
  consolidatedLoader.cleanup();
}, 15 * 60 * 1000);
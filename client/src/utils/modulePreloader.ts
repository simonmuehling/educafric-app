// Module preloader for instant module loading
import React, { useEffect, useRef } from 'react';

interface ModuleCache {
  [key: string]: {
    component: React.ComponentType<any>;
    isLoaded: boolean;
    lastAccess: number;
  };
}

class ModulePreloader {
  private cache: ModuleCache = {};
  private preloadQueue: string[] = [];
  private isPreloading = false;
  private maxCacheSize = 15; // Increased cache size for better performance
  private preloadBatch = 3; // Load only 3 modules at a time

  // Preload only essential modules immediately
  async preloadCriticalModules() {
    // Only preload the most essential modules on startup
    const criticalModules = [
      'MyChildren',
      'StudentManagement',
      'CommercialStatistics'
    ];

    // Load critical modules one by one to avoid overwhelming
    for (const moduleName of criticalModules) {
      await this.preloadModule(moduleName);
    }
  }

  // Preload module asynchronously with throttling
  async preloadModule(moduleName: string) {
    if (this.cache[moduleName]?.isLoaded) {
      this.cache[moduleName].lastAccess = Date.now();
      return this.cache[moduleName].component;
    }

    // Prevent too many concurrent loads
    if (this.isPreloading) {
      this.preloadQueue.push(moduleName);
      return null;
    }

    this.isPreloading = true;
    try {
      let componentImport;
      
      switch (moduleName) {
        // Commercial modules
        case 'DocumentsContracts':
          componentImport = await import('@/components/commercial/modules/DocumentsContracts');
          break;
        case 'CommercialStatistics':
          componentImport = await import('@/components/commercial/modules/CommercialStatistics');
          break;
        case 'ContactsManagement':
          componentImport = await import('@/components/commercial/modules/ContactsManagement');
          break;
        case 'MySchools':
          componentImport = await import('@/components/commercial/modules/MySchools');
          break;
        case 'WhatsAppManager':
          componentImport = await import('@/components/commercial/modules/WhatsAppManager');
          break;
        case 'CommercialCRM':
          componentImport = await import('@/components/commercial/modules/CommercialCRM');
          break;
        case 'CallsAppointments':
          componentImport = await import('@/components/commercial/modules/CallsAppointments');
          break;
          
        // Director/School modules
        case 'StudentManagement':
        case 'students':
          componentImport = await import('@/components/director/modules/StudentManagement');
          break;
        case 'TeacherManagement':
        case 'teachers':
          componentImport = await import('@/components/director/modules/TeacherManagement');
          break;
        case 'ClassManagement':
        case 'classes':
          componentImport = await import('@/components/director/modules/ClassManagement');
          break;
        case 'AdministratorManagement':
        case 'administrators':
          componentImport = await import('@/components/director/modules/AdministratorManagement');
          break;
        case 'BulletinValidation':
        case 'bulletin-validation':
          componentImport = await import('@/components/director/modules/BulletinValidation');
          break;
        case 'AttendanceManagement':
        case 'attendance':
          componentImport = await import('@/components/director/modules/AttendanceManagement');
          break;
        case 'Communications':
        case 'settings':
          componentImport = await import('@/components/director/modules/Communications');
          break;
          
        // Parent modules
        case 'MyChildren':
        case 'children':
          componentImport = await import('@/components/parent/modules/MyChildren');
          break;
        case 'FunctionalParentMessages':
        case 'messages':
          componentImport = await import('@/components/parent/modules/FunctionalParentMessages');
          break;
        case 'ParentAttendance':
        case 'attendance-parent':
          componentImport = await import('@/components/parent/modules/ParentAttendance');
          break;
        case 'BulletinVerification':
        case 'bulletins':
          componentImport = await import('@/components/parent/modules/BulletinVerification');
          break;
        case 'FamilyConnections':
        case 'family':
          componentImport = await import('@/components/parent/modules/FamilyConnections');
          break;
        case 'ParentGeolocation':
        case 'geolocation':
          componentImport = await import('@/components/parent/modules/ParentGeolocation');
          break;
        case 'FunctionalParentPayments':
        case 'payments':
          componentImport = await import('@/components/parent/modules/FunctionalParentPayments');
          break;
        case 'ParentSubscription':
        case 'subscription':
          componentImport = await import('@/components/parent/modules/ParentSubscription');
          break;
        case 'DeviceConfigurationGuide':
        case 'configuration':
          componentImport = await import('@/components/parent/modules/DeviceConfigurationGuide');
          break;
        case 'FunctionalParentGrades':
        case 'grades':
          componentImport = await import('@/components/parent/modules/FunctionalParentGrades');
          break;
          
        default:
          console.warn(`Module ${moduleName} not found in preloader`);
          return null;
      }

      const component = componentImport.default;
      
      this.cache[moduleName] = {
        component,
        isLoaded: true,
        lastAccess: Date.now()
      };

      this.cleanupCache();
      return component;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(`Failed to preload module ${moduleName}:`, error);
      }
      return null;
    } finally {
      this.isPreloading = false;
      
      // Process next item in queue
      if (this.preloadQueue.length > 0) {
        const nextModule = this.preloadQueue.shift();
        if (nextModule) {
          setTimeout(() => this.preloadModule(nextModule), 100);
        }
      }
    }
  }

  // Get preloaded module instantly
  getModule(moduleName: string): React.ComponentType<any> | null {
    const cached = this.cache[moduleName];
    if (cached?.isLoaded) {
      cached.lastAccess = Date.now();
      return cached.component;
    }
    
    // If not preloaded, start preloading for next time
    this.preloadModule(moduleName);
    return null;
  }

  // Clean up old cache entries
  private cleanupCache() {
    const entries = Object.entries(this.cache);
    if (entries.length <= this.maxCacheSize) return;

    // Sort by last access time, remove oldest
    entries.sort((a, b) => a[1].lastAccess - b[1].lastAccess);
    const toRemove = entries.slice(0, entries.length - this.maxCacheSize);
    
    toRemove.forEach(([key]) => {
      delete this.cache[key];
    });
  }

  // Preload based on usage patterns (optimized)
  predictivePreload(currentModule: string) {
    const patterns = {
      'MyChildren': ['FunctionalParentGrades', 'ParentAttendance'],
      'StudentManagement': ['TeacherManagement', 'ClassManagement'],
      'CommercialStatistics': ['DocumentsContracts', 'ContactsManagement'],
      'FunctionalParentGrades': ['BulletinVerification', 'ParentAttendance'],
      'TeacherManagement': ['StudentManagement', 'ClassManagement']
    };

    const nextModules = patterns[currentModule as keyof typeof patterns] || [];
    // Only preload 1 module at a time to avoid overload
    if (nextModules.length > 0 && !this.isPreloading) {
      const nextModule = nextModules[0];
      if (!this.cache[nextModule]?.isLoaded) {
        setTimeout(() => this.preloadModule(nextModule), 200);
      }
    }
  }

  // Get cache status for debugging
  getCacheStatus() {
    return Object.entries(this.cache).map(([name, data]) => ({
      name,
      isLoaded: data.isLoaded,
      lastAccess: new Date(data.lastAccess).toLocaleTimeString()
    }));
  }
}

// Singleton instance
export const modulePreloader = new ModulePreloader();

// React hook for module preloading
export const useModulePreloader = () => {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      // Start preloading critical modules immediately
      modulePreloader.preloadCriticalModules();
      initialized.current = true;
    }
  }, []);

  return {
    getModule: modulePreloader.getModule.bind(modulePreloader),
    preloadModule: modulePreloader.preloadModule.bind(modulePreloader),
    predictivePreload: modulePreloader.predictivePreload.bind(modulePreloader),
    getCacheStatus: modulePreloader.getCacheStatus.bind(modulePreloader)
  };
};

// Fast module loader component
export const FastModuleLoader: React.FC<{ 
  moduleName: string; 
  fallback?: React.ReactNode; 
}> = ({ moduleName, fallback = null }) => {
  const { getModule } = useModulePreloader();
  const PreloadedComponent = getModule(moduleName);
  
  if (PreloadedComponent) {
    return React.createElement(PreloadedComponent);
  }
  
  return fallback || React.createElement('div', 
    { className: "flex items-center justify-center p-8" },
    React.createElement('div', {
      className: "w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"
    })
  );
};
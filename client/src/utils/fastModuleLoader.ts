// Simplified fast module loader for EDUCAFRIC dashboards
import React from 'react';

interface ModuleCache {
  [key: string]: React.ComponentType<any>;
}

class FastModuleLoader {
  private cache: ModuleCache = {};
  private loadingPromises: Map<string, Promise<React.ComponentType<any>>> = new Map();

  // Fast module mapping for real modules that exist
  private getModuleImport(moduleName: string): Promise<any> | null {
    const moduleMap: { [key: string]: () => Promise<any> } = {
      // Commercial modules
      'DocumentsContracts': () => import('@/components/commercial/modules/DocumentsContracts'),
      'CommercialStatistics': () => import('@/components/commercial/modules/CommercialStatistics'),
      'ContactsManagement': () => import('@/components/commercial/modules/ContactsManagement'),
      'MySchools': () => import('@/components/commercial/modules/MySchools'),
      'WhatsAppManager': () => import('@/components/commercial/modules/WhatsAppManager'),
      
      // Director modules (real ones) - ALL modules for instant loading
      'overview': () => import('@/components/director/modules/FunctionalDirectorOverview'),
      'settings': () => import('@/components/director/modules/FunctionalDirectorProfile'),
      'teachers': () => import('@/components/director/modules/FunctionalDirectorTeacherManagement'),
      'students': () => import('@/components/director/modules/FunctionalDirectorStudentManagement'),
      'classes': () => import('@/components/director/modules/FunctionalDirectorClassManagement'),
      'timetable': () => import('@/components/director/modules/TimetableConfiguration'),
      'attendance': () => import('@/components/director/modules/SchoolAttendanceManagement'),
      'communications': () => import('@/components/director/modules/CommunicationsCenter'),
      'teacher-absence': () => import('@/components/director/modules/TeacherAbsenceManager'),
      'parent-requests': () => import('@/components/director/modules/ParentRequestsNew'),
      'bulletin-validation': () => import('@/components/director/modules/BulletinValidation'),
      'notifications': () => import('@/components/shared/NotificationCenter'),
      'school-administrators': () => import('@/components/director/modules/DelegateAdministrators'),
      'reports': () => import('@/components/director/modules/ReportsAnalytics'),
      'help': () => import('@/components/help/HelpCenter'),
      'config-guide': () => import('@/components/director/modules/MobileSchoolConfigurationGuide'),
      'school-settings': () => import('@/components/director/modules/SchoolSettings'),
      
      // Legacy module names for compatibility
      'ClassManagement': () => import('@/components/director/modules/ClassManagement'),
      'StudentManagement': () => import('@/components/director/modules/StudentManagement'),
      'TeacherManagement': () => import('@/components/director/modules/TeacherManagement'),
      'BulletinValidation': () => import('@/components/director/modules/BulletinValidation'),
      'AttendanceManagement': () => import('@/components/director/modules/AttendanceManagement'),
      'Communications': () => import('@/components/director/modules/Communications'),
      'SchoolSettings': () => import('@/components/director/modules/SchoolSettings'),
      'AdministratorManagement': () => import('@/components/director/modules/AdministratorManagement'),
      
      // Parent modules (real ones)
      'MyChildren': () => import('@/components/parent/modules/MyChildren'),
      'children': () => import('@/components/parent/modules/MyChildren'),
      'FunctionalParentMessages': () => import('@/components/parent/modules/FunctionalParentMessages'),
      'messages': () => import('@/components/parent/modules/FunctionalParentMessages'),
      'ParentGeolocation': () => import('@/components/parent/modules/ParentGeolocation'),
      'geolocation': () => import('@/components/parent/modules/ParentGeolocation'),
      'FunctionalParentPayments': () => import('@/components/parent/modules/FunctionalParentPayments'),
      'payments': () => import('@/components/parent/modules/FunctionalParentPayments'),
      'ParentSubscription': () => import('@/components/parent/modules/ParentSubscription'),
      'subscription': () => import('@/components/parent/modules/ParentSubscription'),
      'FunctionalParentGrades': () => import('@/components/parent/modules/FunctionalParentGrades'),
      'grades': () => import('@/components/parent/modules/FunctionalParentGrades'),
      'FamilyConnections': () => import('@/components/parent/modules/FamilyConnections'),
      'family': () => import('@/components/parent/modules/FamilyConnections')
    };

    const importFn = moduleMap[moduleName];
    return importFn ? importFn() : null;
  }

  // Preload a module
  async preloadModule(moduleName: string): Promise<React.ComponentType<any> | null> {
    // Return cached if available
    if (this.cache[moduleName]) {
      return this.cache[moduleName];
    }

    // Return loading promise if already loading
    if (this.loadingPromises.has(moduleName)) {
      return this.loadingPromises.get(moduleName)!;
    }

    // Start loading
    const importPromise = this.getModuleImport(moduleName);
    if (!importPromise) {
      console.warn(`[FAST_LOADER] Module ${moduleName} not found`);
      return null;
    }

    const loadingPromise = importPromise
      .then(module => {
        const Component = module.default || module;
        this.cache[moduleName] = Component;
        this.loadingPromises.delete(moduleName);
        console.log(`[FAST_LOADER] ✅ Module ${moduleName} preloaded`);
        return Component;
      })
      .catch(error => {
        console.error(`[FAST_LOADER] ❌ Failed to preload ${moduleName}:`, error);
        this.loadingPromises.delete(moduleName);
        return null;
      });

    this.loadingPromises.set(moduleName, loadingPromise);
    return loadingPromise;
  }

  // Get module instantly if preloaded
  getModule(moduleName: string): React.ComponentType<any> | null {
    return this.cache[moduleName] || null;
  }

  // Preload critical modules
  async preloadCriticalModules() {
    const criticalModules = [
      // Commercial modules
      'DocumentsContracts', 'CommercialStatistics', 'ContactsManagement',
      
      // Director modules - ALL for instant loading
      'overview', 'settings', 'teachers', 'students', 'classes', 'timetable',
      'attendance', 'communications', 'teacher-absence', 'parent-requests',
      'bulletin-validation', 'notifications', 'school-administrators', 'reports',
      'help', 'config-guide', 'school-settings',
      
      // Parent modules
      'MyChildren', 'FunctionalParentMessages', 'ParentGeolocation',
      'FunctionalParentPayments', 'FunctionalParentGrades'
    ];

    // Preload in parallel for speed
    const preloadPromises = criticalModules.map(module => this.preloadModule(module));
    await Promise.allSettled(preloadPromises);
    
    console.log(`[FAST_LOADER] 🚀 Preloaded ${Object.keys(this.cache).length} critical modules`);
  }

  // Clear cache to prevent memory leaks
  clearCache() {
    this.cache = {};
    this.loadingPromises.clear();
  }
}

// Singleton instance
export const fastModuleLoader = new FastModuleLoader();

// React hook for fast module loading
export const useFastModules = () => {
  const preloadModule = React.useCallback((moduleName: string) => {
    return fastModuleLoader.preloadModule(moduleName);
  }, []);

  const getModule = React.useCallback((moduleName: string) => {
    return fastModuleLoader.getModule(moduleName);
  }, []);

  const isReady = React.useCallback((moduleName: string) => {
    return Boolean(fastModuleLoader.getModule(moduleName));
  }, []);

  return { preloadModule, getModule, isReady };
};
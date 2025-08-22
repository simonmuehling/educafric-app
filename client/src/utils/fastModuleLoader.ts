// Optimized module loader for EDUCAFRIC dashboards - Bundle size optimized
// Pure dynamic imports only - no static imports to avoid bundle conflicts
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
      'director-settings': () => import('@/components/director/modules/FunctionalDirectorProfile'),
      'teachers': () => import('@/components/director/modules/FunctionalDirectorTeacherManagement'),
      'director-students': () => import('@/components/director/modules/FunctionalDirectorStudentManagement'),
      'classes': () => import('@/components/director/modules/FunctionalDirectorClassManagement'),
      'director-timetable': () => import('@/components/director/modules/TimetableConfiguration'),
      'director-attendance': () => import('@/components/director/modules/SchoolAttendanceManagement'),
      'director-communications': () => import('@/components/director/modules/CommunicationsCenter'),
      'teacher-absence': () => import('@/components/director/modules/TeacherAbsenceManager'),
      'director-parent-requests': () => import('@/components/director/modules/ParentRequestsNew'),
      'bulletin-validation': () => import('@/components/director/modules/BulletinValidation'),
      'notifications': () => import('@/components/shared/NotificationCenter'),
      'school-administrators': () => import('@/components/director/modules/DelegateAdministrators'),
      'reports': () => import('@/components/director/modules/ReportsAnalytics'),
      'help': () => import('@/components/help/HelpCenter'),
      'config-guide': () => import('@/components/director/modules/MobileSchoolConfigurationGuide'),
      'school-settings': () => import('@/components/director/modules/SchoolSettings'),
      
      // Additional specific mappings for problematic modules
      'FunctionalDirectorProfile': () => import('@/components/director/modules/FunctionalDirectorProfile'),
      'TeacherAbsenceManager': () => import('@/components/director/modules/TeacherAbsenceManager'),
      
      // Legacy module names for compatibility
      'ClassManagement': () => import('@/components/director/modules/ClassManagement'),
      'StudentManagement': () => import('@/components/director/modules/StudentManagement'),
      'TeacherManagement': () => import('@/components/director/modules/TeacherManagement'),
      'BulletinValidation': () => import('@/components/director/modules/BulletinValidation'),
      'AttendanceManagement': () => import('@/components/director/modules/AttendanceManagement'),
      'Communications': () => import('@/components/director/modules/Communications'),
      'SchoolSettings': () => import('@/components/director/modules/SchoolSettings'),
      'AdministratorManagement': () => import('@/components/director/modules/AdministratorManagement'),
      
      // Parent modules (matching dashboard IDs exactly)
      'subscription': () => import('@/components/shared/SubscriptionStatusCard'),
      'children': () => import('@/components/parent/modules/FunctionalParentChildren'),
      'geolocation': () => import('@/components/parent/modules/ParentGeolocation'),
      'payments': () => import('@/components/parent/modules/FunctionalParentPayments'),
      'family': () => import('@/components/parent/modules/FamilyConnections'),
      'requests': () => import('@/components/parent/modules/ParentRequestManager'),
      
      // Additional Parent module aliases  
      'MyChildren': () => import('@/components/parent/modules/MyChildren'),
      'FunctionalParentChildren': () => import('@/components/parent/modules/FunctionalParentChildren'),
      'FunctionalParentMessages': () => import('@/components/parent/modules/FunctionalParentMessages'),
      'ParentGeolocation': () => import('@/components/parent/modules/ParentGeolocation'),
      'FunctionalParentPayments': () => import('@/components/parent/modules/FunctionalParentPayments'),
      'ParentSubscription': () => import('@/components/parent/modules/ParentSubscription'),
      'FunctionalParentGrades': () => import('@/components/parent/modules/FunctionalParentGrades'),
      'FunctionalParentAttendance': () => import('@/components/parent/modules/FunctionalParentAttendance'),
      'FamilyConnections': () => import('@/components/parent/modules/FamilyConnections'),
      'ParentRequestManager': () => import('@/components/parent/modules/ParentRequestManager'),
      
      // Student modules (matching dashboard IDs exactly)
      'timetable': () => import('@/components/student/modules/FunctionalStudentClasses'),
      'grades': () => import('@/components/student/modules/StudentGrades'),
      'assignments': () => import('@/components/student/modules/StudentHomework'),
      'bulletins': () => import('@/components/student/modules/FunctionalStudentBulletins'),
      'attendance': () => import('@/components/student/modules/FunctionalStudentAttendance'),
      'progress': () => import('@/components/student/modules/StudentProgress'),
      'messages': () => import('@/components/student/modules/StudentCommunications'),
      'parentConnection': () => import('@/components/student/modules/FindParentsModule'),
      
      // Missing Student modules that were causing slow loading
      'achievements': () => import('@/components/student/modules/StudentAchievements'),
      'profile': () => import('@/components/student/modules/StudentProfile'),
      'student-geolocation': () => import('@/components/student/modules/StudentGeolocation'),
      'multirole': () => import('@/components/shared/UniversalMultiRoleSwitch'),
      
      // Additional Student module aliases
      'StudentTimetable': () => import('@/components/student/modules/StudentTimetable'),
      'StudentGrades': () => import('@/components/student/modules/StudentGrades'),
      'StudentHomework': () => import('@/components/student/modules/StudentHomework'),
      'StudentCommunications': () => import('@/components/student/modules/StudentCommunications'),
      'FunctionalStudentProfile': () => import('@/components/student/modules/FunctionalStudentProfile'),
      'FunctionalStudentBulletins': () => import('@/components/student/modules/FunctionalStudentBulletins'),
      'FunctionalStudentAttendance': () => import('@/components/student/modules/FunctionalStudentAttendance'),
      'FunctionalStudentClasses': () => import('@/components/student/modules/FunctionalStudentClasses'),
      'StudentProgress': () => import('@/components/student/modules/StudentProgress'),
      'FindParentsModule': () => import('@/components/student/modules/FindParentsModule'),
      
      // Freelancer modules (matching dashboard IDs exactly)
      'settings': () => import('@/components/shared/UnifiedProfileManager'),
      'students': () => import('@/components/freelancer/modules/FunctionalFreelancerStudents'),
      'sessions': () => import('@/components/freelancer/modules/FunctionalFreelancerSessions'),
      'schedule': () => import('@/components/freelancer/modules/FunctionalFreelancerSchedule'),
      'resources': () => import('@/components/freelancer/modules/FunctionalFreelancerResources'),
      'communications': () => import('@/components/freelancer/modules/FreelancerCommunications'),
      
      // Additional Freelancer module aliases
      'FunctionalFreelancerStudents': () => import('@/components/freelancer/modules/FunctionalFreelancerStudents'),
      'FunctionalFreelancerSessions': () => import('@/components/freelancer/modules/FunctionalFreelancerSessions'),
      'FunctionalFreelancerPayments': () => import('@/components/freelancer/modules/FunctionalFreelancerPayments'),
      'FunctionalFreelancerSchedule': () => import('@/components/freelancer/modules/FunctionalFreelancerSchedule'),
      'FunctionalFreelancerResources': () => import('@/components/freelancer/modules/FunctionalFreelancerResources'),
      'FreelancerCommunications': () => import('@/components/freelancer/modules/FreelancerCommunications'),
      'FreelancerGeolocation': () => import('@/components/freelancer/modules/FreelancerGeolocation')
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

  // Optimized: Preload critical modules instantly in parallel for ALL roles
  async preloadCriticalModules() {
    const criticalModules = [
      // Common modules
      'settings', 'overview', 'notifications', 'help',
      
      // Director modules (most commonly used)
      'teachers', 'students', 'classes',
      
      // Parent modules (essential - using actual dashboard IDs)
      'subscription', 'children', 'messages', 'grades', 'attendance', 'geolocation', 'payments', 'family',
      
      // Student modules (essential - using actual dashboard IDs) - ALL MODULES for instant loading
      'timetable', 'assignments', 'bulletins', 'progress', 'parentConnection', 'achievements', 'profile', 'student-geolocation', 'multirole',
      
      // Freelancer modules (essential - using actual dashboard IDs)  
      'settings', 'students', 'sessions', 'payments', 'schedule', 'resources', 'communications',
      
      // Commercial modules
      'DocumentsContracts', 'CommercialStatistics'
    ];

    // Preload ALL in parallel for maximum speed - no batching delays
    const allPromises = criticalModules.map(module => this.preloadModule(module));
    await Promise.allSettled(allPromises);
    
    console.log(`[FAST_LOADER] ⚡ Instant loaded ${Object.keys(this.cache).length} critical modules for ALL roles`);
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
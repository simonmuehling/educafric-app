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
      'settings': () => import('@/components/director/modules/FunctionalDirectorProfile'),
      'teachers': () => import('@/components/director/modules/FunctionalDirectorTeacherManagement'),
      'students': () => import('@/components/director/modules/FunctionalDirectorStudentManagement'),
      'classes': () => import('@/components/director/modules/FunctionalDirectorClassManagement'),
      'timetable': () => import('@/components/director/modules/TimetableConfiguration'),
      'attendance': () => import('@/components/director/modules/SchoolAttendanceManagement'),
      'communications': () => import('@/components/director/modules/CommunicationsCenter'),
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
      
      // Parent modules (real ones - ALL modules for instant loading)
      'MyChildren': () => import('@/components/parent/modules/MyChildren'),
      'parent-children': () => import('@/components/parent/modules/MyChildren'),
      'FunctionalParentChildren': () => import('@/components/parent/modules/FunctionalParentChildren'),
      'FunctionalParentMessages': () => import('@/components/parent/modules/FunctionalParentMessages'),
      'parent-messages': () => import('@/components/parent/modules/FunctionalParentMessages'),
      'ParentGeolocation': () => import('@/components/parent/modules/ParentGeolocation'),
      'parent-geolocation': () => import('@/components/parent/modules/ParentGeolocation'),
      'FunctionalParentPayments': () => import('@/components/parent/modules/FunctionalParentPayments'),
      'parent-payments': () => import('@/components/parent/modules/FunctionalParentPayments'),
      'ParentSubscription': () => import('@/components/parent/modules/ParentSubscription'),
      'parent-subscription': () => import('@/components/parent/modules/ParentSubscription'),
      'FunctionalParentGrades': () => import('@/components/parent/modules/FunctionalParentGrades'),
      'parent-grades': () => import('@/components/parent/modules/FunctionalParentGrades'),
      'FunctionalParentAttendance': () => import('@/components/parent/modules/FunctionalParentAttendance'),
      'parent-attendance': () => import('@/components/parent/modules/FunctionalParentAttendance'),
      'FamilyConnections': () => import('@/components/parent/modules/FamilyConnections'),
      'parent-family': () => import('@/components/parent/modules/FamilyConnections'),
      'ParentRequestManager': () => import('@/components/parent/modules/ParentRequestManager'),
      'parent-request-manager': () => import('@/components/parent/modules/ParentRequestManager'),
      
      // Student modules (ALL for instant loading)
      'StudentTimetable': () => import('@/components/student/modules/StudentTimetable'),
      'student-timetable': () => import('@/components/student/modules/StudentTimetable'),
      'StudentGrades': () => import('@/components/student/modules/StudentGrades'),
      'student-grades': () => import('@/components/student/modules/StudentGrades'),
      'StudentHomework': () => import('@/components/student/modules/StudentHomework'),
      'student-assignments': () => import('@/components/student/modules/StudentHomework'),
      'student-homework': () => import('@/components/student/modules/StudentHomework'),
      'StudentCommunications': () => import('@/components/student/modules/StudentCommunications'),
      'student-communications': () => import('@/components/student/modules/StudentCommunications'),
      'FunctionalStudentProfile': () => import('@/components/student/modules/FunctionalStudentProfile'),
      'student-profile': () => import('@/components/student/modules/FunctionalStudentProfile'),
      'FunctionalStudentBulletins': () => import('@/components/student/modules/FunctionalStudentBulletins'),
      'student-bulletins': () => import('@/components/student/modules/FunctionalStudentBulletins'),
      'FunctionalStudentAttendance': () => import('@/components/student/modules/FunctionalStudentAttendance'),
      'student-attendance': () => import('@/components/student/modules/FunctionalStudentAttendance'),
      'FunctionalStudentClasses': () => import('@/components/student/modules/FunctionalStudentClasses'),
      'student-classes': () => import('@/components/student/modules/FunctionalStudentClasses'),
      'StudentProgress': () => import('@/components/student/modules/StudentProgress'),
      'student-progress': () => import('@/components/student/modules/StudentProgress'),
      'FindParentsModule': () => import('@/components/student/modules/FindParentsModule'),
      'student-parentConnection': () => import('@/components/student/modules/FindParentsModule'),
      
      // Freelancer modules (ALL for instant loading)  
      'FunctionalFreelancerStudents': () => import('@/components/freelancer/modules/FunctionalFreelancerStudents'),
      'freelancer-students': () => import('@/components/freelancer/modules/FunctionalFreelancerStudents'),
      'FunctionalFreelancerSessions': () => import('@/components/freelancer/modules/FunctionalFreelancerSessions'),
      'freelancer-sessions': () => import('@/components/freelancer/modules/FunctionalFreelancerSessions'),
      'FunctionalFreelancerPayments': () => import('@/components/freelancer/modules/FunctionalFreelancerPayments'),
      'freelancer-payments': () => import('@/components/freelancer/modules/FunctionalFreelancerPayments'),
      'FunctionalFreelancerSchedule': () => import('@/components/freelancer/modules/FunctionalFreelancerSchedule'),
      'freelancer-schedule': () => import('@/components/freelancer/modules/FunctionalFreelancerSchedule'),
      'FunctionalFreelancerResources': () => import('@/components/freelancer/modules/FunctionalFreelancerResources'),
      'freelancer-resources': () => import('@/components/freelancer/modules/FunctionalFreelancerResources'),
      'FreelancerCommunications': () => import('@/components/freelancer/modules/FreelancerCommunications'),
      'freelancer-communications': () => import('@/components/freelancer/modules/FreelancerCommunications'),
      'FreelancerGeolocation': () => import('@/components/freelancer/modules/FreelancerGeolocation'),
      'freelancer-geolocation': () => import('@/components/freelancer/modules/FreelancerGeolocation')
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
      
      // Parent modules (essential)
      'MyChildren', 'FunctionalParentChildren', 'FunctionalParentMessages', 'FunctionalParentGrades',
      'FunctionalParentAttendance', 'FunctionalParentPayments', 'ParentGeolocation',
      
      // Student modules (essential)
      'StudentTimetable', 'StudentGrades', 'StudentHomework', 'FunctionalStudentAttendance',
      'FunctionalStudentBulletins', 'StudentProgress',
      
      // Freelancer modules (essential)
      'FunctionalFreelancerStudents', 'FunctionalFreelancerSessions', 'FunctionalFreelancerSchedule',
      'FunctionalFreelancerPayments', 'FreelancerCommunications',
      
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
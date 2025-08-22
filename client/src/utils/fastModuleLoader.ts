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
      
      // CRITICAL MISSING Parent modules that were causing slow loading!
      'parent-messages': () => import('@/components/parent/modules/FunctionalParentMessages'),
      'parent-grades': () => import('@/components/parent/modules/FunctionalParentGrades'), 
      'parent-attendance': () => import('@/components/parent/modules/FunctionalParentAttendance'),
      
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
      
      // Student modules (matching dashboard IDs exactly) - ULTRA-OPTIMIZED FOR SPEED
      'timetable': () => import('@/components/student/modules/StudentTimetable'),
      'grades': () => import('@/components/student/modules/FunctionalStudentGrades'),
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
      
      // Teacher modules (matching dashboard IDs exactly) - CRITICAL MISSING MAPPINGS!
      'teacher-classes': () => import('@/components/teacher/modules/FunctionalMyClasses'),
      'teacher-timetable': () => import('@/components/teacher/modules/TeacherTimetable'),
      'teacher-attendance': () => import('@/components/teacher/modules/FunctionalTeacherAttendance'),
      'teacher-grades': () => import('@/components/teacher/modules/FunctionalTeacherGrades'),
      'teacher-assignments': () => import('@/components/teacher/modules/FunctionalTeacherAssignments'),
      'teacher-content': () => import('@/components/teacher/modules/CreateEducationalContent'),
      'teacher-reports': () => import('@/components/teacher/modules/ReportCards'),
      'teacher-communications': () => import('@/components/teacher/modules/FunctionalTeacherCommunications'),
      
      // Additional Teacher module aliases
      'FunctionalMyClasses': () => import('@/components/teacher/modules/FunctionalMyClasses'),
      'TeacherTimetable': () => import('@/components/teacher/modules/TeacherTimetable'),
      'FunctionalTeacherAttendance': () => import('@/components/teacher/modules/FunctionalTeacherAttendance'),
      'FunctionalTeacherGrades': () => import('@/components/teacher/modules/FunctionalTeacherGrades'),
      'FunctionalTeacherAssignments': () => import('@/components/teacher/modules/FunctionalTeacherAssignments'),
      'CreateEducationalContent': () => import('@/components/teacher/modules/CreateEducationalContent'),
      'ReportCards': () => import('@/components/teacher/modules/ReportCards'),
      'FunctionalTeacherCommunications': () => import('@/components/teacher/modules/FunctionalTeacherCommunications'),
      'TeacherProfileSettings': () => import('@/components/teacher/modules/TeacherProfileSettings'),
      'ReportCardManagement': () => import('@/components/teacher/modules/ReportCardManagement'),
      
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

  // AGGRESSIVE preload with forced caching for critical modules
  async preloadModule(moduleName: string): Promise<React.ComponentType<any> | null> {
    // Return cached immediately if available
    if (this.cache[moduleName]) {
      console.log(`[FAST_LOADER] 🎯 ${moduleName} served from cache instantly`);
      return this.cache[moduleName];
    }

    // Return loading promise if already loading
    if (this.loadingPromises.has(moduleName)) {
      console.log(`[FAST_LOADER] ⏳ ${moduleName} already loading...`);
      return this.loadingPromises.get(moduleName)!;
    }

    // Start aggressive loading
    const importPromise = this.getModuleImport(moduleName);
    if (!importPromise) {
      console.warn(`[FAST_LOADER] ⚠️ Module ${moduleName} not found in mapping`);
      return null;
    }

    console.log(`[FAST_LOADER] 🚀 Starting aggressive load for ${moduleName}`);
    const loadingPromise = importPromise
      .then(module => {
        const Component = module.default || module;
        this.cache[moduleName] = Component;
        this.loadingPromises.delete(moduleName);
        console.log(`[FAST_LOADER] ⚡ ${moduleName} loaded and cached successfully`);
        return Component;
      })
      .catch(error => {
        console.error(`[FAST_LOADER] ❌ CRITICAL: Failed to preload ${moduleName}:`, error);
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

  // HYPER-OPTIMIZED: Force immediate preload with aggressive caching
  async preloadCriticalModules() {
    // CRITICAL STUDENT MODULES - Force preload immediately
    const criticalStudentModules = ['grades', 'assignments', 'attendance', 'messages'];
    
    console.log('[FAST_LOADER] ⚡ FORCING immediate preload of critical student modules...');
    
    // Load critical modules in parallel but wait for ALL to complete
    const criticalPromises = criticalStudentModules.map(async (module) => {
      try {
        console.log(`[FAST_LOADER] 🎯 Force loading ${module}...`);
        const component = await this.preloadModule(module);
        console.log(`[FAST_LOADER] ✅ ${module} loaded and cached`);
        return component;
      } catch (error) {
        console.error(`[FAST_LOADER] ❌ Failed to force load ${module}:`, error);
        return null;
      }
    });
    
    await Promise.all(criticalPromises);
    
    // Now load other modules in background
    const otherModules = [
      'timetable', 'settings', 'overview', 'notifications', 'help',
      'teachers', 'students', 'classes',
      'subscription', 'children', 'geolocation', 'payments', 'family',
      'bulletins', 'progress', 'parentConnection', 'achievements', 'profile', 'student-geolocation', 'multirole',
      'sessions', 'schedule', 'resources', 'communications',
      'DocumentsContracts', 'CommercialStatistics'
    ];
    
    // Background loading - don't block
    const backgroundPromises = otherModules.map(module => this.preloadModule(module));
    Promise.allSettled(backgroundPromises).then(() => {
      console.log(`[FAST_LOADER] 🚀 COMPLETED: ${Object.keys(this.cache).length} total modules cached`);
    });
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
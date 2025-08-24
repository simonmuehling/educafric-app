// FIXED: Active module loader with correct mappings
import React from 'react';

interface ModuleCache {
  [key: string]: React.ComponentType<any>;
}

class FastModuleLoader {
  private cache: ModuleCache = {};
  private loadingPromises: Map<string, Promise<React.ComponentType<any>>> = new Map();

  // Fast module mapping for real modules that exist - Consolidated without duplicates
  private getModuleImport(moduleName: string): Promise<any> | null {
    const moduleMap: { [key: string]: () => Promise<any> } = {
      // Commercial modules (single mappings to prevent duplicates)
      'commercial-schools': () => import('@/components/commercial/modules/MySchools'),
      'commercial-contacts': () => import('@/components/commercial/modules/ContactsManagement'),
      'commercial-documents': () => import('@/components/commercial/modules/DocumentsContracts'),
      'commercial-statistics': () => import('@/components/commercial/modules/CommercialStatistics'),
      'commercial-whatsapp': () => import('@/components/commercial/modules/WhatsAppManager'),
      
      // Director modules (core dashboard modules only)
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
      
      // Parent modules (essential only)
      'subscription': () => import('@/components/shared/SubscriptionStatusCard'),
      'children': () => import('@/components/parent/modules/FunctionalParentChildren'),
      'geolocation': () => import('@/components/parent/modules/ParentGeolocation'),
      'payments': () => import('@/components/parent/modules/FunctionalParentPayments'),
      'family': () => import('@/components/parent/modules/FamilyConnections'),
      'requests': () => import('@/components/parent/modules/ParentRequestManager'),
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
      'student-profile': () => import('@/components/student/modules/StudentProfile'),
      'teacher-profile': () => import('@/components/teacher/modules/FunctionalTeacherProfile'),
      'parent-profile': () => import('@/components/parent/modules/FunctionalParentProfile'),
      'profile': () => import('@/components/student/modules/StudentProfile'), // Legacy compatibility
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
      'student-settings': () => import('@/components/shared/UnifiedProfileManager'),
      'teacher-settings': () => import('@/components/shared/UnifiedProfileManager'),
      'parent-settings': () => import('@/components/shared/UnifiedProfileManager'),
      'settings': () => import('@/components/shared/UnifiedProfileManager'), // Legacy compatibility
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
      'FreelancerGeolocation': () => import('@/components/freelancer/modules/FreelancerGeolocation'),
      
      // SiteAdmin modules - Using shared components for now until specific modules are created
      'siteadmin-overview': () => import('@/components/shared/UnifiedProfileManager'),
      'siteadmin-settings': () => import('@/components/shared/UnifiedProfileManager')
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

  // Optimized: Preload only essential modules with error handling
  async preloadCriticalModules() {
    const criticalModules = [
      // Only the most frequently used modules - no huge lists
      'overview',
      'teachers', 
      'children',
      'commercial-schools',
      'notifications'
    ];
    
    if (import.meta.env.DEV) {
      console.log('[FAST_LOADER] Preloading essential modules...');
    }
    
    // Load with timeout and error handling
    const criticalPromises = criticalModules.map(async (module) => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        );
        
        await Promise.race([this.preloadModule(module), timeoutPromise]);
        
        if (import.meta.env.DEV) {
          console.log(`[FAST_LOADER] ✅ ${module} loaded`);
        }
      } catch (error) {
        // Silent failure in production to not slow startup
        if (import.meta.env.DEV) {
          console.warn(`[FAST_LOADER] Failed to preload ${module}`);
        }
      }
    });
    
    await Promise.allSettled(criticalPromises);
    
    if (import.meta.env.DEV) {
      console.log('[FAST_LOADER] Essential modules preload complete');
    }
  }

  // Enhanced memory management
  clearCache() {
    this.cache = {};
    this.loadingPromises.clear();
    
    if (import.meta.env.DEV) {
      console.log('[FAST_LOADER] Cache cleared - memory freed');
    }
  }

  // Cleanup unused modules periodically
  cleanupUnusedModules(keepModules: string[] = []) {
    const currentTime = Date.now();
    const CLEANUP_THRESHOLD = 10 * 60 * 1000; // 10 minutes
    
    Object.keys(this.cache).forEach(moduleName => {
      if (!keepModules.includes(moduleName)) {
        // In a real implementation, you'd track last access time
        // For now, just keep essential modules
        const isEssential = ['overview', 'notifications', 'teachers', 'children'].includes(moduleName);
        if (!isEssential) {
          delete this.cache[moduleName];
        }
      }
    });
    
    if (import.meta.env.DEV) {
      console.log(`[FAST_LOADER] Cleanup complete - ${Object.keys(this.cache).length} modules retained`);
    }
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
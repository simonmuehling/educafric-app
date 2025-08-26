// Optimized module loader for EDUCAFRIC dashboards - Bundle size optimized
// Pure dynamic imports only - no static imports to avoid bundle conflicts
import React from 'react';

interface ModuleCache {
  [key: string]: React.ComponentType<any>;
}

class FastModuleLoader {
  private cache: ModuleCache = {};
  private loadingPromises: Map<string, Promise<React.ComponentType<any>>> = new Map();

  // ⚠️ PROTECTED MODULE MAPPING - ORGANIZED BY DASHBOARD TYPE TO PREVENT CONFLICTS
  private getModuleImport(moduleName: string): Promise<any> | null {
    // STRICT SEPARATION BY DASHBOARD TYPE - DO NOT MIX!
    const moduleMap: { [key: string]: () => Promise<any> } = {
      
      // =============================================
      // 🏢 DIRECTOR/SCHOOL MODULES - DO NOT MODIFY WITHOUT TESTING
      // =============================================
      // CORE DIRECTOR MODULES (exact IDs from DirectorDashboard.tsx)
      'overview': () => import('@/components/director/modules/FunctionalDirectorOverview'),
      'director-settings': () => import('@/components/director/modules/FunctionalDirectorProfile'), // Director profile, not settings
      'teachers': () => import('@/components/director/modules/FunctionalDirectorTeacherManagement'),
      'students': () => import('@/components/director/modules/FunctionalDirectorStudentManagement'), // ⚠️ CRITICAL: Must point to Director module!
      'classes': () => import('@/components/director/modules/FunctionalDirectorClassManagement'),
      'director-timetable': () => import('@/components/director/modules/TimetableConfiguration'),
      'director-attendance': () => import('@/components/director/modules/SchoolAttendanceManagement'),
      'director-communications': () => import('@/components/director/modules/CommunicationsCenter'),
      'teacher-absence': () => import('@/components/director/modules/TeacherAbsenceManager'),
      'director-parent-requests': () => import('@/components/director/modules/ParentRequestsNew'),
      'bulletin-validation': () => import('@/components/director/modules/BulletinApprovalNew'),
      'notifications': () => import('@/components/shared/NotificationCenter'),
      'school-administrators': () => import('@/components/director/modules/AdministratorManagementFunctional'),
      'reports': () => import('@/components/director/modules/ReportsAnalytics'),
      'help': () => import('@/components/help/HelpCenter'),
      'config-guide': () => import('@/components/director/modules/SchoolConfigurationGuide'),
      
      // =============================================
      // 💼 COMMERCIAL MODULES - SEPARATE SECTION
      // =============================================
      'commercial-schools': () => import('@/components/commercial/modules/MySchools'),
      'commercial-contacts': () => import('@/components/commercial/modules/ContactsManagement'),
      'commercial-documents': () => import('@/components/commercial/modules/DocumentsContracts'),
      'commercial-statistics': () => import('@/components/commercial/modules/CommercialStatistics'),
      'commercial-whatsapp': () => import('@/components/commercial/modules/WhatsAppManager'),
      
      // COMMERCIAL DASHBOARD MODULE IDs
      'appointments': () => import('@/components/commercial/modules/FunctionalCommercialAppointments'),
      'whatsapp': () => import('@/components/commercial/modules/FunctionalCommercialWhatsApp'),
      'schools': () => import('@/components/commercial/modules/FunctionalCommercialSchools'),
      'leads': () => import('@/components/commercial/modules/FunctionalCommercialLeads'),
      'contacts': () => import('@/components/commercial/modules/ContactsManagement'),
      
      // MISSING COMMERCIAL MODULES - FIXING WARNINGS  
      'DocumentsContracts': () => import('@/components/commercial/modules/DocumentsContracts'),
      'CommercialStatistics': () => import('@/components/commercial/modules/CommercialStatistics'),
      'commercial-communications': () => import('@/components/shared/CommunicationsCenter'), // Using existing communications module
      
      // ⚠️ REMOVED DUPLICATE ALIASES TO PREVENT CONFLICTS
      // 'director-students' removed - use 'students' for Director context
      
      // Additional specific mappings for problematic modules  
      'TeacherAbsenceManager': () => import('@/components/director/modules/TeacherAbsenceManager'),
      
      // Legacy module names for compatibility
      'ClassManagement': () => import('@/components/director/modules/ClassManagement'),
      'StudentManagement': () => import('@/components/director/modules/FunctionalDirectorStudentManagement'),
      'TeacherManagement': () => import('@/components/director/modules/TeacherManagement'),
      'BulletinValidation': () => import('@/components/director/modules/BulletinApprovalNew'),
      'AttendanceManagement': () => import('@/components/director/modules/SchoolAttendanceManagement'),
      'Communications': () => import('@/components/director/modules/Communications'),
      'AdministratorManagement': () => import('@/components/director/modules/AdministratorManagementFunctional'),
      
      // Parent modules (matching dashboard IDs exactly)
      'subscription': () => import('@/components/shared/SubscriptionStatusCard'),
      'children': () => import('@/components/parent/modules/FunctionalParentChildren'),
      'geolocation': () => import('@/components/parent/modules/ParentGeolocation'),
      'payments': () => import('@/components/parent/modules/FunctionalParentPayments'),
      'family': () => import('@/components/parent/modules/FamilyConnections'),
      'requests': () => import('@/components/parent/modules/ParentRequestManager'),
      'parent-timetable': () => import('@/components/parent/modules/ParentChildrenTimetable'),
      
      // CRITICAL MISSING MAPPINGS CAUSING SLOW LOADING - FIXED!
      'parent-communications': () => import('@/components/parent/modules/FunctionalParentMessages'), // For "communication" module
      'communications': () => import('@/components/parent/modules/FunctionalParentMessages'), // Alias pour communications
      'communication': () => import('@/components/parent/modules/FunctionalParentMessages'), // Alias pour communication
      // 'messages': () => import('@/components/parent/modules/FunctionalParentMessages'), // REMOVED - causing conflicts with student messages
      'profile': () => import('@/components/parent/modules/FunctionalParentProfile'), // Alias pour profile
      
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
      'student-messages': () => import('@/components/student/modules/StudentCommunications'),
      'messages': () => import('@/components/student/modules/StudentCommunications'), // FOR STUDENTS: Messages École module
      'parentConnection': () => import('@/components/student/modules/FirebaseParentConnection'),
      
      // Missing Student modules that were causing slow loading
      'achievements': () => import('@/components/student/modules/StudentAchievements'),
      'student-profile': () => import('@/components/student/modules/StudentProfile'),
      'teacher-profile': () => import('@/components/teacher/modules/FunctionalTeacherProfile'),
      'parent-profile': () => import('@/components/parent/modules/FunctionalParentProfile'),
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
      'FindParentsModule': () => import('@/components/student/modules/FirebaseParentConnection'),
      
      // Teacher modules (matching dashboard IDs exactly) - CRITICAL MISSING MAPPINGS!
      'teacher-classes': () => import('@/components/teacher/modules/FunctionalMyClasses'),
      'teacher-timetable': () => import('@/components/teacher/modules/TeacherTimetable'),
      'teacher-attendance': () => import('@/components/teacher/modules/FunctionalTeacherAttendance'),
      'teacher-grades': () => import('@/components/teacher/modules/FunctionalTeacherGrades'),
      'teacher-assignments': () => import('@/components/teacher/modules/FunctionalTeacherAssignments'),
      'teacher-content': () => import('@/components/teacher/modules/CreateEducationalContent'),
      'teacher-reports': () => import('@/components/teacher/modules/ReportCardManagement'),
      'teacher-communications': () => import('@/components/teacher/modules/FunctionalTeacherCommunications'),
      
      // Additional Teacher module aliases
      'FunctionalMyClasses': () => import('@/components/teacher/modules/FunctionalMyClasses'),
      'TeacherTimetable': () => import('@/components/teacher/modules/TeacherTimetable'),
      'FunctionalTeacherAttendance': () => import('@/components/teacher/modules/FunctionalTeacherAttendance'),
      'FunctionalTeacherGrades': () => import('@/components/teacher/modules/FunctionalTeacherGrades'),
      'FunctionalTeacherAssignments': () => import('@/components/teacher/modules/FunctionalTeacherAssignments'),
      'CreateEducationalContent': () => import('@/components/teacher/modules/CreateEducationalContent'),
      'ReportCards': () => import('@/components/teacher/modules/ReportCardManagement'),
      'FunctionalTeacherCommunications': () => import('@/components/teacher/modules/FunctionalTeacherCommunications'),
      'ReportCardManagement': () => import('@/components/teacher/modules/ReportCardManagement'),
      
      // =============================================
      // 🎓 FREELANCER MODULES - SEPARATE SECTION
      // =============================================
      'freelancer-students': () => import('@/components/freelancer/modules/FunctionalFreelancerStudents'), // Note: renamed to avoid conflicts
      'sessions': () => import('@/components/freelancer/modules/FunctionalFreelancerSessions'),
      'schedule': () => import('@/components/freelancer/modules/FunctionalFreelancerSchedule'),
      'resources': () => import('@/components/freelancer/modules/FunctionalFreelancerResources'),
      'freelancer-communications': () => import('@/components/freelancer/modules/FreelancerCommunications'),
      
      // Additional Freelancer module aliases
      'FunctionalFreelancerStudents': () => import('@/components/freelancer/modules/FunctionalFreelancerStudents'),
      'FunctionalFreelancerSessions': () => import('@/components/freelancer/modules/FunctionalFreelancerSessions'),
      'FunctionalFreelancerPayments': () => import('@/components/freelancer/modules/FunctionalFreelancerPayments'),
      'FunctionalFreelancerSchedule': () => import('@/components/freelancer/modules/FunctionalFreelancerSchedule'),
      'FunctionalFreelancerResources': () => import('@/components/freelancer/modules/FunctionalFreelancerResources'),
      'FreelancerCommunications': () => import('@/components/freelancer/modules/FreelancerCommunications'),
      'FreelancerGeolocation': () => import('@/components/freelancer/modules/FreelancerGeolocation'),
      
      // =============================================
      // 🔧 SETTINGS MODULES - ROLE SPECIFIC  
      // =============================================
      // Legacy compatibility - some dashboards use these IDs
      'student-settings': () => import('@/components/student/modules/StudentSettings'),
      'teacher-settings': () => import('@/components/teacher/modules/TeacherSettingsSimple'),
      'parent-settings': () => import('@/components/parent/modules/ParentSettings'),
      'freelancer-settings': () => import('@/components/freelancer/modules/FreelancerSettings'),
      'school-settings': () => import('@/components/director/modules/UnifiedSchoolSettings'), // For school/admin settings - FIXED DUPLICATION
      
      // Settings module aliases for different naming conventions
      'StudentSettings': () => import('@/components/student/modules/StudentSettings'),
      'FreelancerSettings': () => import('@/components/freelancer/modules/FreelancerSettings'),
      
      // SiteAdmin modules - Using shared components for now until specific modules are created
      'siteadmin-overview': () => import('@/components/shared/UnifiedProfileManager'),
      'siteadmin-settings': () => import('@/components/shared/UnifiedProfileManager'),
      
      // Generic settings fallback (removed duplication)
      'settings': () => import('@/components/shared/UnifiedProfileManager') // Legacy compatibility for generic settings only
    };

    // VALIDATION: Check for duplicate keys to prevent conflicts
    this.validateModuleMappings(moduleMap);

    const importFn = moduleMap[moduleName];
    return importFn ? importFn() : null;
  }

  // ✅ PROTECTION: Validate module mappings to prevent conflicts
  private validateModuleMappings(moduleMap: { [key: string]: () => Promise<any> }) {
    const keys = Object.keys(moduleMap);
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
    
    if (duplicates.length > 0) {
      console.error(`[FAST_LOADER] 🚨 CRITICAL: Duplicate module mappings found:`, duplicates);
      console.error(`[FAST_LOADER] 🚨 This will cause module loading conflicts!`);
    }

    // Validate critical director modules
    const criticalDirectorModules = ['overview', 'students', 'teachers', 'classes'];
    const missingCritical = criticalDirectorModules.filter(module => !moduleMap[module]);
    
    if (missingCritical.length > 0) {
      console.error(`[FAST_LOADER] 🚨 CRITICAL: Missing director modules:`, missingCritical);
    }

    console.log(`[FAST_LOADER] ✅ Module validation complete: ${keys.length} modules mapped`);
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
      console.warn(`[FAST_LOADER] ⚠️ Module ${moduleName} not found in mapping - check fastModuleLoader.ts`);
      return null;
    }

    console.log(`[FAST_LOADER] 🚀 Starting aggressive load for ${moduleName}`);
    const loadingPromise = importPromise
      .then(module => {
        // Ensure we get the React component correctly
        let Component = module.default;
        if (!Component && module) {
          // Handle named exports or other export patterns
          Component = module;
        }
        
        // Validate it's a function (React component)
        if (typeof Component !== 'function') {
          console.error(`[FAST_LOADER] ❌ Invalid component for ${moduleName}: expected function, got ${typeof Component}`);
          console.error('Component object:', Component);
          throw new Error(`Module ${moduleName} does not export a valid React component`);
        }
        
        this.cache[moduleName] = Component;
        this.loadingPromises.delete(moduleName);
        console.log(`[FAST_LOADER] ⚡ ${moduleName} loaded and cached successfully`);
        return Component;
      })
      .catch(error => {
        console.error(`[FAST_LOADER] ❌ CRITICAL: Failed to preload ${moduleName}:`);
        console.error(error);
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
        console.error(`[FAST_LOADER] ❌ Failed to force load ${module}:`);
        console.error(error);
        return null;
      }
    });
    
    await Promise.all(criticalPromises);
    
    // Now load other modules in background
    const otherModules = [
      // Director modules
      'timetable', 'director-timetable', 'settings', 'overview', 'notifications', 'help',
      'teachers', 'students', 'classes', 'school-administrators', 'reports',
      
      // Student modules  
      'bulletins', 'progress', 'parentConnection', 'achievements', 'profile', 'student-geolocation', 'multirole',
      
      // Parent modules
      'subscription', 'children', 'geolocation', 'payments', 'family', 'parent-messages', 'parent-grades', 'parent-attendance',
      
      // Teacher modules
      'teacher-classes', 'teacher-timetable', 'teacher-attendance', 'teacher-grades', 'teacher-assignments', 'teacher-content', 'teacher-reports', 'teacher-communications',
      
      // Freelancer modules
      'freelancer-students', 'sessions', 'schedule', 'resources', 'freelancer-communications',
      
      // Commercial modules
      'DocumentsContracts', 'CommercialStatistics', 'communications'
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
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
      // 'overview' module removed as per user request
      'director-settings': () => import('@/components/director/modules/FunctionalDirectorProfile'), // Director profile, not settings
      'teachers': () => import('@/components/director/modules/FunctionalDirectorTeacherManagement'),
      'students': () => import('@/components/director/modules/FunctionalDirectorStudentManagement'), // ⚠️ CRITICAL: Must point to Director module!
      'classes': () => import('@/components/director/modules/ClassManagement'),
      'director-timetable': () => import('@/components/director/modules/TimetableConfiguration'),
      'director-attendance': () => import('@/components/director/modules/SchoolAttendanceManagement'),
      'director-communications': () => import('@/components/director/modules/CommunicationsCenter'),
      'teacher-absence': () => import('@/components/director/modules/TeacherAbsenceManager'),
      'director-parent-requests': () => import('@/components/director/modules/ParentRequestsNew'),
      'parent-requests': () => import('@/components/director/modules/ParentRequestsNew'), // Add missing mapping
      'notifications': () => import('@/components/shared/NotificationCenter'),
      'director.notifications': () => import('@/components/shared/NotificationCenter'), // Role-namespaced
      'student.notifications': () => import('@/components/shared/NotificationCenter'), // Role-namespaced
      'parent.notifications': () => import('@/components/shared/NotificationCenter'), // Role-namespaced
      'teacher.notifications': () => import('@/components/shared/NotificationCenter'), // Role-namespaced
      'school-administrators': () => import('@/components/director/modules/AdministratorManagementFunctional'),
      'delegated-administrators': () => import('@/components/director/modules/AdministratorManagementFunctional'),
      'reports': () => import('@/components/director/modules/ReportsAnalytics'),
      'config-guide': () => import('@/components/director/modules/SchoolConfigurationGuide'),
      'document-management': () => import('@/components/admin/modules/DocumentManagement'),
      // Removed comprehensive-bulletins module - now integrated in academic-management
      'content-approval': () => import('@/components/director/modules/EducationalContentApproval'),
      'academic-management': () => import('@/components/director/modules/AcademicManagementSuite'),
      'online-classes': () => import('@/components/director/modules/OnlineClassesManager'),
      
      
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
      'offer-letters': () => import('@/components/commercial/modules/OfferLetterCustomizer'),
      
      // MISSING COMMERCIAL MODULES - FIXING WARNINGS  
      'documents': () => import('@/components/commercial/modules/DocumentsContracts'), // ✅ FIXED: Add missing documents mapping
      'DocumentsContracts': () => import('@/components/commercial/modules/DocumentsContracts'),
      'CommercialStatistics': () => import('@/components/commercial/modules/CommercialStatistics'),
      'commercial-communications': () => import('@/components/shared/CommunicationsCenter'), // Using existing communications module
      'commercial-notifications': () => import('@/components/commercial/modules/FunctionalCommercialNotifications'), // New dedicated notification center
      
      // ⚠️ REMOVED DUPLICATE ALIASES TO PREVENT CONFLICTS
      // 'director-students' removed - use 'students' for Director context
      
      // Additional specific mappings for problematic modules  
      'TeacherAbsenceManager': () => import('@/components/director/modules/TeacherAbsenceManager'),
      
      // Legacy module names for compatibility
      'ClassManagement': () => import('@/components/director/modules/ClassManagement'),
      'StudentManagement': () => import('@/components/director/modules/FunctionalDirectorStudentManagement'),
      'TeacherManagement': () => import('@/components/director/modules/TeacherManagement'),
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
      
      // PARENT-SPECIFIC MAPPINGS - ROLE-NAMESPACED TO PREVENT CONFLICTS
      'parent-communications': () => import('@/components/parent/modules/FunctionalParentMessages'),
      'parent.communications': () => import('@/components/parent/modules/FunctionalParentMessages'), // Role-namespaced
      'parent.messages': () => import('@/components/parent/modules/FunctionalParentMessages'), // Role-namespaced
      'parent.profile': () => import('@/components/parent/modules/FunctionalParentProfile'), // Role-namespaced
      
      // CRITICAL MISSING Parent modules that were causing slow loading!
      'parent-messages': () => import('@/components/parent/modules/FunctionalParentMessages'),
      'parent-bulletins': () => import('@/components/director/modules/ComprehensiveBulletinGenerator'), // ✅ Parents access school bulletin system 
      'parent-attendance': () => import('@/components/parent/modules/FunctionalParentAttendance'),
      
      // Additional Parent module aliases  
      'MyChildren': () => import('@/components/parent/modules/MyChildren'),
      'FunctionalParentChildren': () => import('@/components/parent/modules/FunctionalParentChildren'),
      'FunctionalParentMessages': () => import('@/components/parent/modules/FunctionalParentMessages'),
      'ParentGeolocation': () => import('@/components/parent/modules/ParentGeolocation'),
      'FunctionalParentPayments': () => import('@/components/parent/modules/FunctionalParentPayments'),
      'ParentSubscription': () => import('@/components/parent/modules/ParentSubscription'),
      // 'FunctionalParentGrades' removed - parents use unified comprehensive bulletin system
      'FunctionalParentAttendance': () => import('@/components/parent/modules/FunctionalParentAttendance'),
      'FamilyConnections': () => import('@/components/parent/modules/FamilyConnections'),
      'ParentRequestManager': () => import('@/components/parent/modules/ParentRequestManager'),
      
      // Student modules (matching dashboard IDs exactly) - ULTRA-OPTIMIZED FOR SPEED
      'timetable': () => import('@/components/student/modules/StudentTimetable'),
      'grades': () => import('@/components/student/modules/FunctionalStudentGrades'),
      'assignments': () => import('@/components/student/modules/StudentHomework'),
      // 'bulletins' moved to teacher unified system - see teacher-bulletins mapping
      'attendance': () => import('@/components/student/modules/FunctionalStudentAttendance'),
      'progress': () => import('@/components/student/modules/StudentProgress'),
      'student-messages': () => import('@/components/student/modules/StudentCommunications'),
      'student.messages': () => import('@/components/student/modules/StudentCommunications'), // Role-namespaced
      'student.communications': () => import('@/components/student/modules/StudentCommunications'), // Role-namespaced
      'parentConnection': () => import('@/components/student/modules/FindParentsModule'),
      
      // Missing Student modules that were causing slow loading
      'achievements': () => import('@/components/student/modules/StudentAchievements'),
      'student-profile': () => import('@/components/student/modules/StudentProfile'),
      'teacher-profile': () => import('@/components/teacher/modules/FunctionalTeacherProfile'),
      'parent-profile': () => import('@/components/parent/modules/FunctionalParentProfile'),
      'student-geolocation': () => import('@/components/student/modules/StudentGeolocation'),
      'multirole': () => import('@/components/shared/UniversalMultiRoleSwitch'),
      'director.multirole': () => import('@/components/shared/UniversalMultiRoleSwitch'), // Role-namespaced
      'student.multirole': () => import('@/components/shared/UniversalMultiRoleSwitch'), // Role-namespaced
      'parent.multirole': () => import('@/components/shared/UniversalMultiRoleSwitch'), // Role-namespaced
      'teacher.multirole': () => import('@/components/shared/UniversalMultiRoleSwitch'), // Role-namespaced
      
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
      
      // Teacher modules (matching dashboard IDs exactly) - UPDATED FOR UNIFIED BULLETIN SYSTEM
      'teacher-classes': () => import('@/components/teacher/modules/FunctionalMyClasses'),
      'teacher-timetable': () => import('@/components/teacher/modules/TeacherTimetable'),
      'teacher-attendance': () => import('@/components/teacher/modules/FunctionalTeacherAttendance'),
      'teacher-assignments': () => import('@/components/teacher/modules/FunctionalTeacherAssignments'),
      'teacher-content': () => import('@/components/teacher/modules/CreateEducationalContent'),
      'teacher-bulletins': () => import('@/components/teacher/modules/ConsolidatedBulletinManagement'), // ✅ Système consolidé CBA 
      'teacher-reports': () => import('@/components/teacher/modules/ConsolidatedBulletinManagement'), // ✅ Rapports et bulletins unifiés
      'bulletins': () => import('@/components/teacher/modules/ConsolidatedBulletinManagement'), // ✅ Générateur de bulletins consolidé
      'teacher-communications': () => import('@/components/teacher/modules/FunctionalTeacherCommunications'),
      'teacher.communications': () => import('@/components/teacher/modules/FunctionalTeacherCommunications'), // Role-namespaced
      'teacher.messages': () => import('@/components/teacher/modules/FunctionalTeacherCommunications'), // Role-namespaced
      'teacher-absence-declaration': () => import('@/components/teacher/modules/TeacherAbsenceDeclaration'),
      'absence-declaration': () => import('@/components/teacher/modules/TeacherAbsenceDeclaration'),
      
      // Additional Teacher module aliases
      'FunctionalMyClasses': () => import('@/components/teacher/modules/FunctionalMyClasses'),
      'TeacherTimetable': () => import('@/components/teacher/modules/TeacherTimetable'),
      'FunctionalTeacherAttendance': () => import('@/components/teacher/modules/FunctionalTeacherAttendance'),
      'FunctionalTeacherAssignments': () => import('@/components/teacher/modules/FunctionalTeacherAssignments'),
      'CreateEducationalContent': () => import('@/components/teacher/modules/CreateEducationalContent'),
      'FunctionalTeacherCommunications': () => import('@/components/teacher/modules/FunctionalTeacherCommunications'),
      'ReportCardManagement': () => import('@/components/teacher/modules/ConsolidatedBulletinManagement'),
      
      // =============================================
      // 🎓 FREELANCER MODULES - SEPARATE SECTION
      // =============================================
      'freelancer-students': () => import('@/components/freelancer/modules/FunctionalFreelancerStudents'), // Note: renamed to avoid conflicts
      'sessions': () => import('@/components/freelancer/modules/FunctionalFreelancerSessions'),
      'schedule': () => import('@/components/freelancer/modules/FunctionalFreelancerSchedule'),
      'resources': () => import('@/components/freelancer/modules/FunctionalFreelancerResources'),
      'freelancer-communications': () => import('@/components/freelancer/modules/FreelancerCommunications'),
      'freelancer.communications': () => import('@/components/freelancer/modules/FreelancerCommunications'), // Role-namespaced
      'freelancer.messages': () => import('@/components/freelancer/modules/FreelancerCommunications'), // Role-namespaced
      
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
      'school-settings': () => import('@/components/director/modules/UnifiedSchoolSettings'), // For school/admin settings with official Cameroon info
      
      // Settings module aliases for different naming conventions
      'StudentSettings': () => import('@/components/student/modules/StudentSettings'),
      'FreelancerSettings': () => import('@/components/freelancer/modules/FreelancerSettings'),
      
      // SiteAdmin modules - Using shared components for now until specific modules are created
      'siteadmin-overview': () => import('@/components/shared/UnifiedProfileManager'),
      
      // SiteAdmin specific modules
      'school-mgmt': () => import('@/components/siteadmin/modules/SchoolManagement'),
      'siteadmin-users': () => import('@/components/siteadmin/modules/FunctionalSiteAdminUsers'),
      'user-mgmt': () => import('@/components/siteadmin/modules/UserManagement'),
      'siteadmin-schools': () => import('@/components/siteadmin/modules/FunctionalSiteAdminSchools'),
      'siteadmin-documents': () => import('@/components/siteadmin/modules/FunctionalSiteAdminDocuments'),
      'doc-permissions': () => import('@/components/siteadmin/DocumentPermissionsManager'),
      'siteadmin-content-mgmt': () => import('@/components/siteadmin/modules/ContentManagement'),
      'communication': () => import('@/components/siteadmin/modules/AdminCommunication'),
      'commercial': () => import('@/components/siteadmin/modules/UnifiedCommercialManagement'),
      'siteadmin-payments': () => import('@/components/siteadmin/modules/PaymentAdministration'),
      'analytics': () => import('@/components/siteadmin/modules/AnalyticsBusiness'),
      'multi-role': () => import('@/components/siteadmin/modules/MultiRoleManagement'),
      'security': () => import('@/components/siteadmin/modules/SecurityAudit'),
      'firebase': () => import('@/components/siteadmin/modules/FirebaseIntegration'),
      'platform': () => import('@/components/siteadmin/modules/PlatformManagement'),
      'preview': () => import('@/components/siteadmin/modules/PreviewModule'),
      'health': () => import('@/components/siteadmin/modules/FunctionalSiteAdminSystemHealth'),
      'siteadmin-config': () => import('@/components/siteadmin/modules/FunctionalSiteAdminSettings'),
      
      // ROLE-NAMESPACED SETTINGS - PREVENT CONFLICTS
      'director.settings': () => import('@/components/director/modules/UnifiedSchoolSettings'),
      'student.settings': () => import('@/components/student/modules/StudentSettings'),
      'parent.settings': () => import('@/components/parent/modules/ParentSettings'),
      'teacher.settings': () => import('@/components/teacher/modules/TeacherSettingsSimple'),
      'freelancer.settings': () => import('@/components/freelancer/modules/FreelancerSettings'),
      'commercial.settings': () => import('@/components/shared/UnifiedProfileManager'),
      // Generic settings fallback (removed duplication)
      'settings': () => import('@/components/shared/UnifiedProfileManager'), // Legacy compatibility for generic settings only
      
      // =============================================
      // 📚 LIBRARY MODULES - MISSING CRITICAL MAPPINGS  
      // =============================================
      // Library modules for Teacher, Student, and Parent dashboards
      'library': () => import('@/components/teacher/modules/LibraryRelatedBooks'), // Teacher library by default
      'teacher-library': () => import('@/components/teacher/modules/LibraryRelatedBooks'),
      'student-library': () => import('@/components/student/modules/LibraryRelatedBooks'),
      'parent-library': () => import('@/components/parent/modules/LibraryRelatedBooks'),
      
      // =============================================
      // 📹 ONLINE CLASSES MODULES - VIDEO CONFERENCING
      // =============================================
      'teacher-online-classes': () => import('@/components/teacher/modules/TeacherOnlineClasses'),
      'student-online-classes': () => import('@/components/student/modules/StudentOnlineClasses'),
      
      // Role-namespaced library modules
      'teacher.library': () => import('@/components/teacher/modules/LibraryRelatedBooks'),
      'student.library': () => import('@/components/student/modules/LibraryRelatedBooks'),
      'parent.library': () => import('@/components/parent/modules/LibraryRelatedBooks'),
      
      // Alternative library module names
      'LibraryRelatedBooks': () => import('@/components/teacher/modules/LibraryRelatedBooks'),
      'library-books': () => import('@/components/teacher/modules/LibraryRelatedBooks'),
      'book-library': () => import('@/components/teacher/modules/LibraryRelatedBooks'),
      'reading': () => import('@/components/student/modules/LibraryRelatedBooks'),
      'books': () => import('@/components/teacher/modules/LibraryRelatedBooks'),
      
      // Add missing content module mapping to fix warnings
      'content': () => import('@/components/teacher/modules/CreateEducationalContent'),
      
      // =============================================
      // 🔧 GENERIC MODULE FALLBACKS - MISSING MAPPINGS FIX
      // =============================================
      // These were causing "Module X not found in mapping" errors
      'profile': () => import('@/components/shared/UnifiedProfileManager'), // Generic profile fallback
      'messages': () => import('@/components/shared/InterProfileCommunications'), // Generic messages fallback  
      'communications': () => import('@/components/shared/CommunicationsCenter') // Generic communications fallback
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
    const criticalDirectorModules = ['students', 'teachers', 'classes'];
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
      // Only log cache hits in dev mode
      if (import.meta.env.DEV) {
        console.log(`[FAST_LOADER] 🎯 ${moduleName} served from cache instantly`);
      }
      return this.cache[moduleName];
    }

    // Return loading promise if already loading
    if (this.loadingPromises.has(moduleName)) {
      if (import.meta.env.DEV) {
        console.log(`[FAST_LOADER] ⏳ ${moduleName} already loading...`);
      }
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
        // Only log successful loads in dev mode
        if (import.meta.env.DEV) {
          console.log(`[FAST_LOADER] ⚡ ${moduleName} loaded and cached successfully`);
        }
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
    const criticalStudentModules = ['grades', 'assignments', 'attendance', 'messages', 'student-library'];
    
    if (import.meta.env.DEV) {
      console.log('[FAST_LOADER] ⚡ FORCING immediate preload of critical student modules...');
    }
    
    // Load critical modules in parallel but wait for ALL to complete
    const criticalPromises = criticalStudentModules.map(async (module) => {
      try {
        if (import.meta.env.DEV) {
          console.log(`[FAST_LOADER] 🎯 Force loading ${module}...`);
        }
        const component = await this.preloadModule(module);
        if (import.meta.env.DEV) {
          console.log(`[FAST_LOADER] ✅ ${module} loaded and cached`);
        }
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
      'timetable', 'director-timetable', 'settings', 'notifications', 'config-guide',
      'teachers', 'students', 'classes', 'school-administrators', 'reports',
      
      // Student modules  
      'bulletins', 'progress', 'parentConnection', 'achievements', 'profile', 'student-geolocation', 'multirole', 'library',
      
      // Parent modules
      'subscription', 'children', 'geolocation', 'payments', 'family', 'parent-messages', 'parent-bulletins', 'parent-attendance', 'parent-library',
      
      // Teacher modules - UPDATED FOR UNIFIED BULLETIN WORKFLOW
      'teacher-classes', 'teacher-timetable', 'teacher-attendance', 'teacher-assignments', 'teacher-content', 'teacher-bulletins', 'teacher-communications', 'teacher-absence-declaration', 'absence-declaration',
      
      // Freelancer modules
      'freelancer-students', 'sessions', 'schedule', 'resources', 'freelancer-communications',
      
      // Commercial modules
      'DocumentsContracts', 'CommercialStatistics', 'communications'
    ];
    
    // Background loading - don't block
    const backgroundPromises = otherModules.map(module => this.preloadModule(module));
    Promise.allSettled(backgroundPromises).then(() => {
      if (import.meta.env.DEV) {
        console.log(`[FAST_LOADER] 🚀 COMPLETED: ${Object.keys(this.cache).length} total modules cached`);
      }
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
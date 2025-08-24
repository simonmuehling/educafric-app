// Simple and reliable module optimization for sandbox
export class FastLoader {
  // Simple preload that just warms up the module bundler
  static async preloadSandboxModules(role: string) {
    // Use requestIdleCallback to preload modules during browser idle time
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.warmupModulesForRole(role);
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => this.warmupModulesForRole(role), 100);
    }
  }

  private static async warmupModulesForRole(role: string) {
    try {
      // Preload critical modules based on role to warm up Vite's module system
      switch (role) {
        case 'Parent':
          // These will be cached by Vite for instant loading
          import('@/components/parent/modules/MyChildren');
          import('@/components/parent/modules/FunctionalParentGrades');
          break;
        case 'Student':
          import('@/components/student/modules/FunctionalStudentGrades');
          import('@/components/student/modules/StudentHomework');
          break;
        case 'Teacher':
          import('@/components/teacher/modules/GradeManagement');
          break;
        case 'Director':
          import('@/components/director/modules/StudentManagement');
          import('@/components/director/modules/TeacherManagement');
          break;
      }
    } catch (error) {
      // Silently ignore preload errors - modules will load on demand
      if (import.meta.env.DEV) {
        console.log('Module preload info:', error);
      }
    }
  }

  // Clear any cached data (for compatibility)
  static clearCache() {
    // No-op for this simplified version
  }
}
import { lazy, Suspense, Component, ErrorInfo, ReactNode } from 'react';

// Ultra-fast loading component with minimal DOM impact
const OptimizedLoading = () => (
  <div className="h-12 flex items-center justify-center">
    <div className="w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Error boundary to prevent crashes during module loading
class LazyLoadErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[LAZY_LOAD] Module loading error handled:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center text-red-600">
          Module loading error. Refreshing page may help.
        </div>
      );
    }
    return this.props.children;
  }
}

// Optimized wrapper for lazy components
const createLazyComponent = (importFn: () => Promise<any>, displayName: string) => {
  const LazyComponent = lazy(importFn);
  // Set displayName safely without TypeScript error
  (LazyComponent as any).displayName = `Lazy${displayName}`;
  
  return (props: any) => (
    <LazyLoadErrorBoundary>
      <Suspense fallback={<OptimizedLoading />}>
        <LazyComponent {...props} />
      </Suspense>
    </LazyLoadErrorBoundary>
  );
};

// CONSOLIDATED MODULE DEFINITIONS - Only existing modules, no duplicates
const moduleDefinitions = {
  // Core pages
  Students: () => import('@/pages/Students'),
  Teachers: () => import('@/pages/Teachers'),
  Grades: () => import('@/pages/Grades'),
  Attendance: () => import('@/pages/Attendance'),
  Classes: () => import('@/pages/Classes'),
  Homework: () => import('@/pages/Homework'),
  Timetable: () => import('@/pages/Timetable'),
  Payments: () => import('@/pages/Payments'),
  Reports: () => import('@/pages/Reports'),
  Profile: () => import('@/pages/ModernProfile'),
  
  // Dashboard pages
  DirectorPage: () => import('@/pages/DirectorPage'),
  CommercialPage: () => import('@/pages/CommercialPage'),
  FreelancerPage: () => import('@/pages/FreelancerPage'),
  ParentsPage: () => import('@/pages/ParentsPage'),
  
  // System pages
  SecurityDashboard: () => import('@/pages/SecurityDashboard'),
  AdminPage: () => import('@/pages/AdminPage'),
  
  // Non-critical pages
  SandboxPage: () => import('@/pages/SandboxPage'),
  EnhancedSandbox: () => import('@/pages/EnhancedSandbox'),
  UIShowcase: () => import('@/pages/UIShowcase'),
} as const;

// Generate all exports using the optimized factory function - No manual duplications
export const LazyStudents = createLazyComponent(moduleDefinitions.Students, 'Students');
export const LazyTeachers = createLazyComponent(moduleDefinitions.Teachers, 'Teachers');
export const LazyGrades = createLazyComponent(moduleDefinitions.Grades, 'Grades');
export const LazyAttendance = createLazyComponent(moduleDefinitions.Attendance, 'Attendance');
export const LazyClasses = createLazyComponent(moduleDefinitions.Classes, 'Classes');
export const LazyHomework = createLazyComponent(moduleDefinitions.Homework, 'Homework');
export const LazyTimetable = createLazyComponent(moduleDefinitions.Timetable, 'Timetable');
export const LazyPayments = createLazyComponent(moduleDefinitions.Payments, 'Payments');
export const LazyReports = createLazyComponent(moduleDefinitions.Reports, 'Reports');
export const LazyProfile = createLazyComponent(moduleDefinitions.Profile, 'Profile');

export const LazyDirectorPage = createLazyComponent(moduleDefinitions.DirectorPage, 'DirectorPage');
export const LazyCommercialPage = createLazyComponent(moduleDefinitions.CommercialPage, 'CommercialPage');
export const LazyFreelancerPage = createLazyComponent(moduleDefinitions.FreelancerPage, 'FreelancerPage');
export const LazyParentsPage = createLazyComponent(moduleDefinitions.ParentsPage, 'ParentsPage');

export const LazySecurityDashboard = createLazyComponent(moduleDefinitions.SecurityDashboard, 'SecurityDashboard');
export const LazyAdminPage = createLazyComponent(moduleDefinitions.AdminPage, 'AdminPage');

export const LazySandboxPage = createLazyComponent(moduleDefinitions.SandboxPage, 'SandboxPage');
export const LazyEnhancedSandbox = createLazyComponent(moduleDefinitions.EnhancedSandbox, 'EnhancedSandbox');
export const LazyUIShowcase = createLazyComponent(moduleDefinitions.UIShowcase, 'UIShowcase');

// Stub exports for non-existent components to prevent App.tsx errors
export const LazySchoolGeolocation = () => (
  <div className="p-4 text-center text-gray-600">SchoolGeolocation module not available</div>
);
export const LazyRoleBasedGeolocation = () => (
  <div className="p-4 text-center text-gray-600">RoleBasedGeolocation module not available</div>
);
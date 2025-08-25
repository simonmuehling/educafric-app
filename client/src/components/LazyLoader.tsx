import { lazy, Suspense } from 'react';

// Ultra-fast loading component optimized for speed
const OptimizedLoading = () => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Pages critiques - Lazy loading pour production 3500+ users
const LazyStudentsComponent = lazy(() => import('@/pages/Students'));
const LazyTeachersComponent = lazy(() => import('@/pages/Teachers'));
const LazyGradesComponent = lazy(() => import('@/pages/Grades'));
const LazyAttendanceComponent = lazy(() => import('@/pages/Attendance'));
const LazyClassesComponent = lazy(() => import('@/pages/Classes'));
const LazyHomeworkComponent = lazy(() => import('@/pages/Homework'));
const LazyTimetableComponent = lazy(() => import('@/pages/Timetable'));
const LazyPaymentsComponent = lazy(() => import('@/pages/Payments'));
const LazyReportsComponent = lazy(() => import('@/pages/Reports'));
const LazyProfileComponent = lazy(() => import('@/pages/ModernProfile'));

// Dashboard pages - Gros composants
const LazyDirectorPageComponent = lazy(() => import('@/pages/DirectorPage'));
const LazyCommercialPageComponent = lazy(() => import('@/pages/CommercialPage'));
const LazyFreelancerPageComponent = lazy(() => import('@/pages/FreelancerPage'));
const LazyParentsPageComponent = lazy(() => import('@/pages/ParentsPage'));

// Security et admin
const LazySecurityDashboardComponent = lazy(() => import('@/pages/SecurityDashboard'));
const LazyAdminPageComponent = lazy(() => import('@/pages/AdminPage'));

// Sandbox et demo (non critiques)
const LazySandboxPageComponent = lazy(() => import('@/pages/SandboxPage'));
const LazyEnhancedSandboxComponent = lazy(() => import('@/pages/EnhancedSandbox'));
const LazyUIShowcaseComponent = lazy(() => import('@/pages/UIShowcase'));

// Exports with Suspense wrapper
export const LazyStudents = (props: any) => (
  <Suspense fallback={<OptimizedLoading />}>
    <LazyStudentsComponent {...props} />
  </Suspense>
);

export const LazyTeachers = (props: any) => (
  <Suspense fallback={<OptimizedLoading />}>
    <LazyTeachersComponent {...props} />
  </Suspense>
);

export const LazyProfile = (props: any) => (
  <Suspense fallback={<OptimizedLoading />}>
    <LazyProfileComponent {...props} />
  </Suspense>
);

export const LazyDirectorPage = (props: any) => (
  <Suspense fallback={<OptimizedLoading />}>
    <LazyDirectorPageComponent {...props} />
  </Suspense>
);

export const LazyCommercialPage = (props: any) => (
  <Suspense fallback={<OptimizedLoading />}>
    <LazyCommercialPageComponent {...props} />
  </Suspense>
);

export const LazyFreelancerPage = (props: any) => (
  <Suspense fallback={<OptimizedLoading />}>
    <LazyFreelancerPageComponent {...props} />
  </Suspense>
);

export const LazyParentsPage = (props: any) => (
  <Suspense fallback={<OptimizedLoading />}>
    <LazyParentsPageComponent {...props} />
  </Suspense>
);

export const LazySecurityDashboard = (props: any) => (
  <Suspense fallback={<OptimizedLoading />}>
    <LazySecurityDashboardComponent {...props} />
  </Suspense>
);

export const LazyAdminPage = (props: any) => (
  <Suspense fallback={<OptimizedLoading />}>
    <LazyAdminPageComponent {...props} />
  </Suspense>
);

export const LazySandboxPage = (props: any) => (
  <Suspense fallback={<OptimizedLoading />}>
    <LazySandboxPageComponent {...props} />
  </Suspense>
);

export const LazyEnhancedSandbox = (props: any) => (
  <Suspense fallback={<OptimizedLoading />}>
    <LazyEnhancedSandboxComponent {...props} />
  </Suspense>
);

export const LazyUIShowcase = (props: any) => (
  <Suspense fallback={<OptimizedLoading />}>
    <LazyUIShowcaseComponent {...props} />
  </Suspense>
);

// Geolocation components - Optimisés pour production 3500+ users
const LazySchoolGeolocationComponent = lazy(() => import('@/pages/SchoolGeolocationPage'));
const LazyRoleBasedGeolocationComponent = lazy(() => import('@/components/shared/RoleBasedGeolocationPage'));

export const LazySchoolGeolocation = (props: any) => (
  <Suspense fallback={<OptimizedLoading />}>
    <LazySchoolGeolocationComponent {...props} />
  </Suspense>
);

export const LazyRoleBasedGeolocation = (props: any) => (
  <Suspense fallback={<OptimizedLoading />}>
    <LazyRoleBasedGeolocationComponent {...props} />
  </Suspense>
);

export const LazyGrades = (props: any) => (
  <Suspense fallback={<OptimizedLoading />}>
    <LazyGradesComponent {...props} />
  </Suspense>
);

export const LazyAttendance = (props: any) => (
  <Suspense fallback={<OptimizedLoading />}>
    <LazyAttendanceComponent {...props} />
  </Suspense>
);

export const LazyClasses = (props: any) => (
  <Suspense fallback={<OptimizedLoading />}>
    <LazyClassesComponent {...props} />
  </Suspense>
);

export const LazyHomework = (props: any) => (
  <Suspense fallback={<OptimizedLoading />}>
    <LazyHomeworkComponent {...props} />
  </Suspense>
);

export const LazyTimetable = (props: any) => (
  <Suspense fallback={<OptimizedLoading />}>
    <LazyTimetableComponent {...props} />
  </Suspense>
);

export const LazyPayments = (props: any) => (
  <Suspense fallback={<OptimizedLoading />}>
    <LazyPaymentsComponent {...props} />
  </Suspense>
);

export const LazyReports = (props: any) => (
  <Suspense fallback={<OptimizedLoading />}>
    <LazyReportsComponent {...props} />
  </Suspense>
);

export default OptimizedLoading;
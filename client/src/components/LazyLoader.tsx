import { lazy, Suspense } from 'react';

// Loading component optimisé pour 3500+ users
const OptimizedLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center">
      <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-blue-600 font-medium">Chargement...</p>
    </div>
  </div>
);

// Pages critiques - Lazy loading pour production 3500+ users
const LazyStudentsComponent = lazy(() => import('@/pages/Students'));
const LazyTeachersComponent = lazy(() => import('@/pages/Teachers'));
const LazyProfileComponent = lazy(() => import('@/pages/ProfileSettings'));

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
const LazySchoolGeolocationComponent = lazy(() => import('@/components/shared/RoleBasedGeolocationPage'));
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

// Placeholders pour pages non critiques
export const LazyGrades = LazyStudents;
export const LazyAttendance = LazyStudents;

export default OptimizedLoading;
// Chargeur de composants lazy optimisé pour Educafric
import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Composant de chargement ultra-rapide
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
  </div>
);

// Composant d'erreur optimisé
const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <h3 className="text-red-800 font-medium">Erreur de chargement</h3>
    <p className="text-red-600 text-sm mt-1">{error.message}</p>
    <button 
      onClick={resetErrorBoundary}
      className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
    >
      Réessayer
    </button>
  </div>
);

// HOC pour créer des composants lazy optimisés
export const createLazyComponent = (importFn: () => Promise<any>, componentName: string) => {
  const LazyComponent = lazy(() => 
    importFn().then(module => {
      // Précharger le composant en arrière-plan
      if (import.meta.env.DEV) {
        console.log(`[LAZY_LOADER] ${componentName} chargé`);
      }
      return module;
    }).catch(error => {
      console.error(`[LAZY_LOADER] Erreur lors du chargement de ${componentName}:`, error);
      throw error;
    })
  );

  return (props: any) => (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error) => console.error(`[LAZY_ERROR] ${componentName}:`, error)}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

// Composants lazy optimisés pour les gros modules
export const LazyDirectorDashboard = createLazyComponent(
  () => import('@/pages/DirectorPage'),
  'DirectorDashboard'
);

export const LazyParentDashboard = createLazyComponent(
  () => import('@/pages/ParentsPage'),
  'ParentDashboard'
);

export const LazyTeacherDashboard = createLazyComponent(
  () => import('@/pages/Teachers'),
  'TeacherDashboard'
);

export const LazyStudentDashboard = createLazyComponent(
  () => import('@/pages/Students'),
  'StudentDashboard'
);

export const LazyCommercialDashboard = createLazyComponent(
  () => import('@/pages/CommercialPage'),
  'CommercialDashboard'
);

export const LazyFreelancerDashboard = createLazyComponent(
  () => import('@/pages/FreelancerPage'),
  'FreelancerDashboard'
);

export const LazyAdminDashboard = createLazyComponent(
  () => import('@/pages/AdminPage'),
  'AdminDashboard'
);

export const LazyGeolocationPage = createLazyComponent(
  () => import('@/pages/SchoolGeolocationPage'),
  'GeolocationPage'
);

export const LazySandboxPage = createLazyComponent(
  () => import('@/pages/EnhancedSandbox'),
  'SandboxPage'
);

// Préchargement intelligent des composants
export class ComponentPreloader {
  private static preloadedComponents = new Set<string>();
  private static preloadQueue: Array<() => Promise<any>> = [];
  private static isPreloading = false;

  // Précharger un composant spécifique
  static preload(componentName: string, importFn: () => Promise<any>) {
    if (this.preloadedComponents.has(componentName)) {
      return Promise.resolve();
    }

    this.preloadQueue.push(async () => {
      try {
        await importFn();
        this.preloadedComponents.add(componentName);
        if (import.meta.env.DEV) {
          console.log(`[PRELOADER] ${componentName} préchargé`);
        }
      } catch (error) {
        console.error(`[PRELOADER] Erreur préchargement ${componentName}:`, error);
      }
    });

    this.processQueue();
    return Promise.resolve();
  }

  // Traiter la queue de préchargement
  private static async processQueue() {
    if (this.isPreloading || this.preloadQueue.length === 0) {
      return;
    }

    this.isPreloading = true;
    
    while (this.preloadQueue.length > 0) {
      const preloadFn = this.preloadQueue.shift();
      if (preloadFn) {
        await preloadFn();
        // Pas de délai - chargement immédiat pour performance optimale
      }
    }

    this.isPreloading = false;
  }

  // Précharger les composants par rôle
  static preloadByRole(userRole: string) {
    const rolePreloadMap: Record<string, Array<() => Promise<any>>> = {
      'Director': [
        () => import('@/pages/DirectorPage'),
        () => import('@/components/director/modules/ClassManagement'),
        () => import('@/components/director/modules/FunctionalDirectorStudentManagement')
      ],
      'Teacher': [
        () => import('@/pages/Teachers'),
        () => import('@/components/teacher/TeacherDashboard')
      ],
      'Parent': [
        () => import('@/pages/ParentsPage'),
        () => import('@/components/parent/ParentDashboard')
      ],
      'Student': [
        () => import('@/pages/Students'),
        () => import('@/components/student/StudentDashboard')
      ]
    };

    const preloadFunctions = rolePreloadMap[userRole] || [];
    preloadFunctions.forEach((importFn, index) => {
      this.preload(`${userRole}_${index}`, importFn);
    });
  }

  // Nettoyer le cache de préchargement
  static clearCache() {
    this.preloadedComponents.clear();
    this.preloadQueue.length = 0;
    console.log('[PRELOADER] Cache nettoyé');
  }
}

export default createLazyComponent;
// WRAPPER CONSOLIDÉ pour tous les modules - Remplace l'ancien système
import React, { Suspense, useEffect } from 'react';
import { useConsolidatedModules } from '@/utils/consolidatedModuleLoader';

interface ConsolidatedModuleWrapperProps {
  moduleName: string;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
  children?: React.ReactNode;
  preload?: boolean;
}

const DefaultSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="loading-spinner" />
  </div>
);

export const ConsolidatedModuleWrapper: React.FC<ConsolidatedModuleWrapperProps> = ({
  moduleName,
  fallback = <DefaultSpinner />,
  onError,
  children,
  preload = true
}) => {
  const { getModule, preloadModule, isReady } = useConsolidatedModules();

  // Preload automatique du module au montage
  useEffect(() => {
    if (preload && !isReady(moduleName)) {
      preloadModule(moduleName).catch(error => {
        console.warn(`[CONSOLIDATED_WRAPPER] Failed to preload ${moduleName}:`, error);
        onError?.(error);
      });
    }
  }, [moduleName, preload, preloadModule, isReady, onError]);

  // Obtenir le module depuis le cache
  const Module = getModule(moduleName);

  if (!Module) {
    // Si le module n'est pas encore chargé, afficher le fallback
    return <>{fallback}</>;
  }

  // Wrapper avec error boundary intégré
  try {
    return (
      <Suspense fallback={fallback}>
        <Module>{children}</Module>
      </Suspense>
    );
  } catch (error) {
    console.error(`[CONSOLIDATED_WRAPPER] Error rendering ${moduleName}:`, error);
    onError?.(error as Error);
    return <div className="p-4 text-red-500">Erreur de chargement du module {moduleName}</div>;
  }
};

// Hook pour charger plusieurs modules en batch
export const useBatchModuleLoader = (modules: string[]) => {
  const { preloadModule, isReady } = useConsolidatedModules();
  const [loading, setLoading] = React.useState(false);
  const [loadedModules, setLoadedModules] = React.useState<string[]>([]);

  const loadBatch = React.useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    const promises = modules
      .filter(module => !isReady(module))
      .map(module => preloadModule(module));
    
    try {
      await Promise.allSettled(promises);
      setLoadedModules(modules.filter(isReady));
    } catch (error) {
      console.error('[BATCH_LOADER] Error loading modules:', error);
    } finally {
      setLoading(false);
    }
  }, [modules, loading, isReady, preloadModule]);

  const progress = (loadedModules.length / modules.length) * 100;

  return {
    loadBatch,
    loading,
    loadedModules,
    progress,
    allLoaded: loadedModules.length === modules.length
  };
};

export default ConsolidatedModuleWrapper;
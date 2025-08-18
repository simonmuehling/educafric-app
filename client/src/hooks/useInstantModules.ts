import { useCallback, useEffect, useRef } from 'react';
import { useModulePreloader } from '@/utils/modulePreloader';

// Hook for instant module switching with preloading
export const useInstantModules = () => {
  const { getModule, preloadModule, predictivePreload } = useModulePreloader();
  const loadedModules = useRef(new Set<string>());
  const loadingModules = useRef(new Set<string>());

  // Instantly switch to a module
  const switchToModule = useCallback(async (moduleName: string) => {
    // Check if already preloaded
    const component = getModule(moduleName);
    if (component) {
      predictivePreload(moduleName);
      return component;
    }

    // If not loading, start loading
    if (!loadingModules.current.has(moduleName)) {
      loadingModules.current.add(moduleName);
      await preloadModule(moduleName);
      loadingModules.current.delete(moduleName);
      loadedModules.current.add(moduleName);
    }

    return getModule(moduleName);
  }, [getModule, preloadModule, predictivePreload]);

  // Preload modules on hover or focus
  const preloadOnHover = useCallback((moduleName: string) => {
    if (!loadedModules.current.has(moduleName) && !loadingModules.current.has(moduleName)) {
      preloadModule(moduleName);
    }
  }, [preloadModule]);

  // Check if module is ready
  const isModuleReady = useCallback((moduleName: string) => {
    return Boolean(getModule(moduleName));
  }, [getModule]);

  return {
    switchToModule,
    preloadOnHover,
    isModuleReady,
    loadedModules: Array.from(loadedModules.current)
  };
};
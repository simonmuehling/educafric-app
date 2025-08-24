// 🚀 CONSOLIDATED FAST MODULE LOADER - Ultra-optimized instant loading
import React, { useState, useEffect } from 'react';

const moduleCache = new Map<string, React.ComponentType<any>>();
const preloadingPromises = new Map<string, Promise<React.ComponentType<any>>>();

class ConsolidatedFastLoader {
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    console.log('[CONSOLIDATED_FAST_LOADER] 🚀 Initializing...');
    this.initialized = true;
  }

  async preloadModule(moduleName: string): Promise<React.ComponentType<any>> {
    const cached = moduleCache.get(moduleName);
    if (cached) return cached;

    if (preloadingPromises.has(moduleName)) {
      return preloadingPromises.get(moduleName)!;
    }

    const promise = this.loadModuleComponent(moduleName);
    preloadingPromises.set(moduleName, promise);

    try {
      const component = await promise;
      moduleCache.set(moduleName, component);
      preloadingPromises.delete(moduleName);
      return component;
    } catch (error) {
      preloadingPromises.delete(moduleName);
      throw error;
    }
  }

  private async loadModuleComponent(moduleName: string): Promise<React.ComponentType<any>> {
    try {
      let component: React.ComponentType<any>;

      if (moduleName.startsWith('FunctionalParent')) {
        const { default: comp } = await import(`@/components/parent/modules/${moduleName}`);
        component = comp;
      } else if (moduleName.startsWith('FunctionalTeacher')) {
        const { default: comp } = await import(`@/components/teacher/modules/${moduleName}`);
        component = comp;
      } else if (moduleName.startsWith('FunctionalStudent')) {
        const { default: comp } = await import(`@/components/student/modules/${moduleName}`);
        component = comp;
      } else if (moduleName.startsWith('FunctionalDirector')) {
        const { default: comp } = await import(`@/components/director/modules/${moduleName}`);
        component = comp;
      } else if (moduleName.startsWith('FunctionalCommercial')) {
        const { default: comp } = await import(`@/components/commercial/modules/${moduleName}`);
        component = comp;
      } else {
        const { default: comp } = await import(`@/components/modules/${moduleName}`);
        component = comp;
      }

      console.log(`[FAST_LOADER] ⚡ ${moduleName} loaded instantly`);
      return component;
    } catch (error) {
      console.error(`[FAST_LOADER] ❌ Failed to load ${moduleName}:`, error);
      
      const FallbackComponent = () => React.createElement('div', {
        className: 'flex items-center justify-center p-8 text-gray-500'
      }, React.createElement('div', {
        className: 'text-center'
      }, [
        React.createElement('div', { key: 'title', className: 'text-lg mb-2' }, `Module: ${moduleName}`),
        React.createElement('div', { key: 'desc', className: 'text-sm' }, 'Component not found')
      ]));
      
      return FallbackComponent;
    }
  }

  getModule(moduleName: string): React.ComponentType<any> | null {
    return moduleCache.get(moduleName) || null;
  }

  isReady(): boolean {
    return this.initialized;
  }
}

export const consolidatedFastLoader = new ConsolidatedFastLoader();

export const useFastModule = (moduleName: string) => {
  const [component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!moduleName) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const cached = consolidatedFastLoader.getModule(moduleName);
    if (cached) {
      setComponent(() => cached);
      setLoading(false);
      return;
    }

    consolidatedFastLoader
      .preloadModule(moduleName)
      .then(comp => {
        if (isMounted) {
          setComponent(() => comp);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [moduleName]);

  return { component, loading, error };
};

export const OptimizedModuleWrapper: React.FC<{
  moduleName?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ moduleName, className = "", children }) => {
  return React.createElement('div', {
    className: `optimized-module-wrapper ${className}`
  }, children);
};

consolidatedFastLoader.initialize().catch(console.error);
export default consolidatedFastLoader;

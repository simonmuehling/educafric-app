import { createLazyComponent } from '../utils/consolidated.ts';
import React, { lazy, LazyExoticComponent, ComponentType, Suspense, useState, useEffect, useCallback } from 'react';

// Lazy loading utility with error boundary
export function withLazyLoading<P extends object>(
  Component: LazyExoticComponent<ComponentType<P>>,
  fallback?: React.ReactNode
) {
  return function LazyLoadedComponent(props: P) {
    return React.createElement(
      Suspense,
      { 
        fallback: fallback || React.createElement(
          'div',
          { className: 'flex items-center justify-center p-8' },
          React.createElement('div', { 
            className: 'animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full' 
          })
        )
      },
      React.createElement(Component, props as any)
    );
  };
}

// Custom hook for lazy loading data
export function useLazyData<T>(
  loader: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loader();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Loading failed');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
import { getHookSignature } from 'consolidated.ts';
// Consolidated utility functions

export 
export function getFunctionSignature(node) {
  const code = getNodeCode(node);
  return normalizeCode(code);
}


export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): LazyExoticComponent<T> {
  return lazy(importFn);
}

// HOC for lazy loading with suspense


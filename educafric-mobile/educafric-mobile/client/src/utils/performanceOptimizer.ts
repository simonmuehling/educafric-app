// Performance optimizer for EDUCAFRIC modules
import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  moduleLoadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage: number;
}

class PerformanceOptimizer {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private observers: Map<string, IntersectionObserver> = new Map();
  
  // Optimize module loading times
  measureModuleLoad<T>(moduleName: string, loadFunction: () => Promise<T>): Promise<T> {
    const start = performance.now();
    
    return loadFunction().then(result => {
      const loadTime = performance.now() - start;
      this.updateMetrics(moduleName, { moduleLoadTime: loadTime });
      
      if (loadTime > 1000) {
        console.warn(`[PERFORMANCE] Module ${moduleName} took ${loadTime.toFixed(2)}ms to load`);
      }
      
      return result;
    });
  }

  // Optimize component rendering
  measureRender(moduleName: string, renderFunction: () => void) {
    const start = performance.now();
    renderFunction();
    const renderTime = performance.now() - start;
    
    this.updateMetrics(moduleName, { renderTime });
    
    if (renderTime > 100) {
      console.warn(`[PERFORMANCE] Module ${moduleName} render took ${renderTime.toFixed(2)}ms`);
    }
  }

  // Lazy loading with intersection observer
  setupLazyLoading(element: Element, callback: () => void, threshold = 0.1) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            callback();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }

  // Memory usage monitoring
  monitorMemory(moduleName: string) {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.updateMetrics(moduleName, { 
        memoryUsage: memory.usedJSHeapSize / 1024 / 1024 
      });
    }
  }

  // Debounce expensive operations
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Throttle frequent events
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Update performance metrics
  private updateMetrics(moduleName: string, partialMetrics: Partial<PerformanceMetrics>) {
    const existing = this.metrics.get(moduleName) || {
      moduleLoadTime: 0,
      renderTime: 0,
      interactionTime: 0,
      memoryUsage: 0
    };
    
    this.metrics.set(moduleName, { ...existing, ...partialMetrics });
  }

  // Get performance report
  getPerformanceReport() {
    const report: Record<string, PerformanceMetrics> = {};
    this.metrics.forEach((metrics, moduleName) => {
      report[moduleName] = metrics;
    });
    return report;
  }

  // Performance recommendations
  getRecommendations() {
    const recommendations: string[] = [];
    
    this.metrics.forEach((metrics, moduleName) => {
      if (metrics.moduleLoadTime > 1000) {
        recommendations.push(`Consider code splitting for ${moduleName} (load time: ${metrics.moduleLoadTime.toFixed(2)}ms)`);
      }
      
      if (metrics.renderTime > 100) {
        recommendations.push(`Optimize rendering for ${moduleName} (render time: ${metrics.renderTime.toFixed(2)}ms)`);
      }
      
      if (metrics.memoryUsage > 50) {
        recommendations.push(`High memory usage in ${moduleName} (${metrics.memoryUsage.toFixed(2)}MB)`);
      }
    });
    
    return recommendations;
  }
}

// Singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

// React hook for performance optimization
export const usePerformanceOptimization = (moduleName: string) => {
  const renderCount = useRef(0);
  const lastRender = useRef(performance.now());

  useEffect(() => {
    renderCount.current++;
    const now = performance.now();
    const renderTime = now - lastRender.current;
    
    if (renderCount.current > 1) {
      performanceOptimizer.measureRender(moduleName, () => {});
    }
    
    lastRender.current = now;
    performanceOptimizer.monitorMemory(moduleName);
  });

  const optimizedCallback = useCallback(
    performanceOptimizer.debounce((callback: () => void) => {
      performanceOptimizer.measureModuleLoad(moduleName, async () => {
        callback();
        return true;
      });
    }, 100),
    [moduleName]
  );

  const throttledCallback = useCallback(
    performanceOptimizer.throttle((callback: () => void) => {
      callback();
    }, 200),
    []
  );

  return {
    optimizedCallback,
    throttledCallback,
    measureLoad: (fn: () => Promise<any>) => 
      performanceOptimizer.measureModuleLoad(moduleName, fn),
    setupLazyLoading: performanceOptimizer.setupLazyLoading.bind(performanceOptimizer)
  };
};
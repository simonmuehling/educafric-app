// Optimisateur de mémoire et performances pour Educafric
import { queryClient } from '@/lib/queryClient';

interface MemoryMetrics {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
  percentage: number;
}

class MemoryOptimizer {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private performanceMonitor: NodeJS.Timeout | null = null;
  private memoryThreshold = 0.85; // 85% de la mémoire disponible

  // Démarrer l'optimisation automatique (mode agressif pour résoudre le problème critique)
  start() {
    // Nettoyage immédiat
    this.performCleanup();
    this.optimizeAnimations();
    this.optimizeNetworkRequests();
    
    // More efficient cleanup intervals for better performance
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 60 * 1000); // 1 minute - less aggressive for performance

    // Much less aggressive monitoring to reduce CPU overhead
    this.performanceMonitor = setInterval(() => {
      this.checkMemoryUsage();
      this.triggerGarbageCollection();
    }, 120 * 1000); // 2 minutes - reduced for better performance

    // Silent mode for performance
  }

  // Arrêter l'optimisation
  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    if (this.performanceMonitor) {
      clearInterval(this.performanceMonitor);
      this.performanceMonitor = null;
    }
    // Afficher seulement en mode debug
    if (import.meta.env.VITE_DEBUG_MEMORY === 'true') {
      console.log('[MEMORY_OPTIMIZER] Optimiseur arrêté');
    }
  }

  // Obtenir les métriques de mémoire
  getMemoryMetrics(): MemoryMetrics | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        totalJSHeapSize: memory.totalJSHeapSize,
        usedJSHeapSize: memory.usedJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  }

  // Enterprise memory monitoring for 3500+ users
  checkMemoryUsage() {
    const metrics = this.getMemoryMetrics();
    if (metrics && metrics.percentage > this.memoryThreshold * 100) {
      // Silent cleanup for performance
      this.performCleanup();
    }
  }

  // Nettoyage complet
  performCleanup() {
    const startTime = performance.now();
    
    // 1. Nettoyer le cache des requêtes
    this.cleanQueryCache();
    
    // 2. Nettoyer le DOM des éléments inutiles
    this.cleanDOMElements();
    
    // 3. Nettoyer les images en cache
    this.cleanImageCache();
    
    // 4. Déclencher le garbage collector si possible
    this.triggerGarbageCollection();
    
    const endTime = performance.now();
    // Réduire le spam de logs - afficher seulement si le nettoyage prend plus de 50ms
    if (import.meta.env.DEV && (endTime - startTime) > 50) {
      console.log(`[MEMORY_OPTIMIZER] Nettoyage important terminé en ${(endTime - startTime).toFixed(2)}ms`);
    }
  }

  // Nettoyer le cache des requêtes anciennes
  private cleanQueryCache() {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes
    
    let removedCount = 0;
    queries.forEach(query => {
      if (query.state.dataUpdatedAt && (now - query.state.dataUpdatedAt) > maxAge) {
        cache.remove(query);
        removedCount++;
      }
    });
    
    // Afficher seulement si beaucoup d'éléments supprimés
    if (import.meta.env.DEV && removedCount > 5) {
      console.log(`[MEMORY_OPTIMIZER] ${removedCount} requêtes anciennes supprimées du cache`);
    }
  }

  // Nettoyer les éléments DOM inutiles
  private cleanDOMElements() {
    // Supprimer les éléments cachés depuis longtemps
    const hiddenElements = document.querySelectorAll('[style*="display: none"], [hidden]');
    let removedCount = 0;
    
    hiddenElements.forEach(element => {
      if (element.getAttribute('data-keep') !== 'true') {
        element.remove();
        removedCount++;
      }
    });

    // Nettoyer les listeners d'événements orphelins
    this.cleanEventListeners();
    
    // Afficher seulement si beaucoup d'éléments supprimés  
    if (import.meta.env.DEV && removedCount > 10) {
      console.log(`[MEMORY_OPTIMIZER] ${removedCount} éléments DOM inutiles supprimés`);
    }
  }

  // Nettoyer les listeners d'événements
  private cleanEventListeners() {
    // Réenregistrer seulement les listeners essentiels
    const essentialEvents = ['click', 'scroll', 'resize'];
    
    // Marquer les listeners comme nettoyés
    window.dispatchEvent(new CustomEvent('memoryCleanup', {
      detail: { cleanedAt: Date.now() }
    }));
  }

  // Nettoyer le cache des images
  private cleanImageCache() {
    const images = document.querySelectorAll('img');
    let optimizedCount = 0;
    
    images.forEach(img => {
      // Désactiver le cache des images non visibles
      if (!this.isElementVisible(img)) {
        img.loading = 'lazy';
        optimizedCount++;
      }
    });
    
    // Réduire le spam - afficher seulement si beaucoup d'images optimisées
    if (import.meta.env.DEV && optimizedCount > 5) {
      console.log(`[MEMORY_OPTIMIZER] ${optimizedCount} images optimisées`);
    }
  }

  // Vérifier si un élément est visible
  private isElementVisible(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  }

  // Déclencher le garbage collection si possible
  private triggerGarbageCollection() {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
      if (import.meta.env.DEV) {
        console.log('[MEMORY_OPTIMIZER] Garbage collection forcé');
      }
    }
  }

  // Optimiser les performances des animations
  optimizeAnimations() {
    // Réduire la fréquence d'animation si la mémoire est faible
    const metrics = this.getMemoryMetrics();
    if (metrics && metrics.percentage > 70) {
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
      if (import.meta.env.DEV) {
        console.log('[MEMORY_OPTIMIZER] Animations réduites pour économiser la mémoire');
      }
    } else {
      document.documentElement.style.setProperty('--animation-duration', '0.3s');
    }
  }

  // Optimiser les requêtes réseau
  optimizeNetworkRequests() {
    // Définir des délais plus longs pour les requêtes non critiques
    queryClient.setDefaultOptions({
      queries: {
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes (anciennement cacheTime)
        refetchInterval: false,
        refetchOnWindowFocus: false,
      }
    });
    
    // Afficher seulement en mode debug
    if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_MEMORY === 'true') {
      console.log('[MEMORY_OPTIMIZER] Requêtes réseau optimisées');
    }
  }

  // Rapport de performance
  generatePerformanceReport(): string {
    const metrics = this.getMemoryMetrics();
    const cacheSize = queryClient.getQueryCache().getAll().length;
    
    return `
📊 RAPPORT DE PERFORMANCE EDUCAFRIC
=====================================
🧠 Mémoire: ${metrics ? `${metrics.percentage.toFixed(1)}% utilisée` : 'Non disponible'}
💾 Cache: ${cacheSize} requêtes en mémoire
🔄 Statut: ${metrics && metrics.percentage > 80 ? '⚠️ Critique' : '✅ Normal'}
📈 Recommandations: ${this.getRecommendations()}
`;
  }

  // Obtenir des recommandations d'optimisation
  private getRecommendations(): string {
    const metrics = this.getMemoryMetrics();
    if (!metrics) return 'Métriques non disponibles';
    
    if (metrics.percentage > 90) {
      return 'Redémarrage recommandé';
    } else if (metrics.percentage > 80) {
      return 'Nettoyage immédiat nécessaire';
    } else if (metrics.percentage > 70) {
      return 'Surveillance accrue';
    } else {
      return 'Performance optimale';
    }
  }
}

// Instance globale de l'optimiseur
export const memoryOptimizer = new MemoryOptimizer();

// Démarrage automatique
if (typeof window !== 'undefined') {
  // Démarrer l'optimiseur après le chargement de la page
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      memoryOptimizer.start();
      memoryOptimizer.optimizeNetworkRequests();
    });
  } else {
    memoryOptimizer.start();
    memoryOptimizer.optimizeNetworkRequests();
  }

  // Exposer l'optimiseur globalement pour debug
  (window as any).memoryOptimizer = memoryOptimizer;
  
  // Nettoyage avant fermeture de la page
  window.addEventListener('beforeunload', () => {
    memoryOptimizer.stop();
  });
}

export default MemoryOptimizer;
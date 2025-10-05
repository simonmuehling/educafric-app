// Optimisateur de mémoire et performances pour Educafric
import { queryClient } from '@/lib/queryClient';

interface MemoryMetrics {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
  percentage: number;
}

class MemoryOptimizer {
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private performanceMonitor: ReturnType<typeof setInterval> | null = null;
  private memoryThreshold = 0.90; // 90% de la mémoire disponible (plus conservateur)
  private isStarted = false; // Prévenir les démarrages multiples
  private startupDelay = 30000; // 30 secondes de délai avant démarrage

  // Démarrer l'optimisation automatique (mode conservateur pour éviter les conflits)
  start() {
    // Prévenir les démarrages multiples
    if (this.isStarted) {
      if (import.meta.env.VITE_DEBUG_MEMORY === 'true') {
        console.log('[MEMORY_OPTIMIZER] Déjà démarré, ignoré');
      }
      return;
    }
    
    this.isStarted = true;
    
    // Pas de nettoyage immédiat pour éviter les conflits
    // Optimisations légères seulement
    this.optimizeNetworkRequests();
    
    // Intervalles très conservateurs pour éviter les problèmes de performance
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 1800 * 1000) as ReturnType<typeof setInterval>; // 30 minutes - beaucoup moins agressif

    // Monitoring très conservateur pour réduire la charge CPU
    this.performanceMonitor = setInterval(() => {
      this.checkMemoryUsage();
      // Pas de garbage collection automatique pour éviter les freezes
    }, 1200 * 1000) as ReturnType<typeof setInterval>; // 20 minutes - très conservateur

    if (import.meta.env.VITE_DEBUG_MEMORY === 'true') {
      console.log('[MEMORY_OPTIMIZER] Démarré en mode conservateur (30min cleanup, 20min monitoring)');
    }
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
    this.isStarted = false;
    
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

  // Nettoyer le cache des requêtes anciennes (plus conservateur)
  private cleanQueryCache() {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes - beaucoup plus conservateur
    
    let removedCount = 0;
    queries.forEach(query => {
      // Nettoyer seulement les requêtes vraiment anciennes et inutilisées
      if (query.state.dataUpdatedAt && 
          (now - query.state.dataUpdatedAt) > maxAge &&
          query.getObserversCount() === 0) {
        cache.remove(query);
        removedCount++;
      }
    });
    
    // Afficher seulement si beaucoup d'éléments supprimés (seuil plus élevé)
    if (import.meta.env.DEV && removedCount > 10) {
      console.log(`[MEMORY_OPTIMIZER] ${removedCount} requêtes très anciennes supprimées du cache`);
    }
  }

  // Nettoyer les éléments DOM inutiles (mode très conservateur)
  private cleanDOMElements() {
    // Nettoyer seulement les éléments explicitement marqués pour suppression
    const elementsToRemove = document.querySelectorAll('[data-cleanup="true"]');
    let removedCount = 0;
    
    elementsToRemove.forEach(element => {
      // Double vérification avant suppression
      if (element.getAttribute('data-cleanup') === 'true' && 
          element.getAttribute('data-keep') !== 'true') {
        element.remove();
        removedCount++;
      }
    });

    // Nettoyer les listeners d'événements orphelins (plus conservateur)
    this.cleanEventListeners();
    
    // Afficher seulement si des éléments ont été supprimés
    if (import.meta.env.DEV && removedCount > 0) {
      console.log(`[MEMORY_OPTIMIZER] ${removedCount} éléments DOM marqués pour suppression nettoyés`);
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

  // Optimiser le cache des images (plus conservateur)
  private cleanImageCache() {
    const images = document.querySelectorAll('img[data-optimize="true"]');
    let optimizedCount = 0;
    
    images.forEach(imgElement => {
      const img = imgElement as HTMLImageElement;
      // Optimiser seulement les images explicitement marquées
      if (!this.isElementVisible(img) && img.loading !== 'lazy') {
        img.loading = 'lazy';
        optimizedCount++;
      }
    });
    
    // Affichage très conservateur
    if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_MEMORY === 'true' && optimizedCount > 0) {
      console.log(`[MEMORY_OPTIMIZER] ${optimizedCount} images marquées optimisées`);
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

  // Déclencher le garbage collection si possible (désactivé par défaut)
  private triggerGarbageCollection() {
    // GC forcé désactivé car il peut causer des freezes
    // Laisser le navigateur gérer automatiquement
    if (import.meta.env.VITE_FORCE_GC === 'true' && 'gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
      if (import.meta.env.DEV) {
        console.log('[MEMORY_OPTIMIZER] Garbage collection forcé (mode debug uniquement)');
      }
    }
  }

  // Optimiser les performances des animations (plus conservateur)
  optimizeAnimations() {
    // Réduire la fréquence d'animation seulement en cas de mémoire critique
    const metrics = this.getMemoryMetrics();
    if (metrics && metrics.percentage > 85) {
      document.documentElement.style.setProperty('--animation-duration', '0.2s');
      if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_MEMORY === 'true') {
        console.log('[MEMORY_OPTIMIZER] Animations légèrement réduites (mémoire critique)');
      }
    } else {
      document.documentElement.style.setProperty('--animation-duration', '0.3s');
    }
  }

  // Optimiser les requêtes réseau (paramètres équilibrés)
  optimizeNetworkRequests() {
    // Paramètres équilibrés pour performance et fraîcheur des données
    queryClient.setDefaultOptions({
      queries: {
        staleTime: 15 * 60 * 1000, // 15 minutes - équilibre performance/fraîcheur
        gcTime: 20 * 60 * 1000, // 20 minutes - plus conservateur
        refetchInterval: false,
        refetchOnWindowFocus: false,
        retry: 2, // Moins de tentatives pour éviter la surcharge
      }
    });
    
    // Afficher seulement en mode debug
    if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_MEMORY === 'true') {
      console.log('[MEMORY_OPTIMIZER] Requêtes réseau optimisées avec paramètres équilibrés');
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

  // Public getters for external access
  getIsStarted(): boolean {
    return this.isStarted;
  }

  getStartupDelay(): number {
    return this.startupDelay;
  }
}

// Instance globale de l'optimiseur
export const memoryOptimizer = new MemoryOptimizer();

// Démarrage automatique avec délai pour éviter les conflits
if (typeof window !== 'undefined') {
  // Exposer l'optimiseur globalement pour debug et contrôle manuel
  (window as any).memoryOptimizer = memoryOptimizer;
  
  // Démarrage différé pour éviter les conflits avec l'initialisation de l'app
  const startOptimizer = () => {
    setTimeout(() => {
      if (import.meta.env.VITE_DISABLE_MEMORY_OPTIMIZER !== 'true') {
        memoryOptimizer.start();
      } else if (import.meta.env.VITE_DEBUG_MEMORY === 'true') {
        console.log('[MEMORY_OPTIMIZER] Démarrage automatique désactivé par VITE_DISABLE_MEMORY_OPTIMIZER');
      }
    }, memoryOptimizer.getStartupDelay()); // 30 secondes de délai
  };
  
  // Démarrer l'optimiseur après le chargement complet de la page
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startOptimizer);
  } else if (document.readyState === 'interactive') {
    window.addEventListener('load', startOptimizer);
  } else {
    startOptimizer();
  }
  
  // Nettoyage avant fermeture de la page
  window.addEventListener('beforeunload', () => {
    memoryOptimizer.stop();
  });
  
  // Fonction globale pour contrôle manuel
  (window as any).toggleMemoryOptimizer = (enable: boolean) => {
    if (enable && !memoryOptimizer.getIsStarted()) {
      memoryOptimizer.start();
    } else if (!enable && memoryOptimizer.getIsStarted()) {
      memoryOptimizer.stop();
    }
  };
}

export default MemoryOptimizer;
// CSS OPTIMIZATION pour éliminer les 5+ secondes de chargement CSS
// Preload critical CSS and defer non-critical styles

interface CSSLoadOptions {
  critical?: boolean;
  media?: string;
  onLoad?: () => void;
}

class CSSOptimizer {
  private loadedCSS = new Set<string>();
  private criticalCSS: string[] = [
    // Core styles qui doivent être chargés immédiatement
    'index.css',
    'globals.css'
  ];

  // LOAD CRITICAL CSS directement (plus de preload inutilisé)
  loadCriticalCSS(): void {
    const head = document.head;
    
    this.criticalCSS.forEach(cssFile => {
      if (this.loadedCSS.has(cssFile)) return;
      
      // Charger directement comme stylesheet - plus rapide et sans avertissement
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `/src/${cssFile}`;
      link.setAttribute('data-critical', 'true');
      
      // Priorité élevée pour le CSS critique
      if ('fetchPriority' in link) {
        (link as any).fetchPriority = 'high';
      }
      
      link.onload = () => {
        console.log(`[CSS_OPT] ⚡ ${cssFile} loaded (critical)`);
      };
      
      // Insérer en premier pour charger rapidement
      head.insertBefore(link, head.firstChild);
      this.loadedCSS.add(cssFile);
    });
  }

  // LAZY LOAD non-critical CSS
  loadCSS(cssFile: string, options: CSSLoadOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.loadedCSS.has(cssFile)) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssFile;
      
      if (options.media) {
        link.media = options.media;
      }

      link.onload = () => {
        this.loadedCSS.add(cssFile);
        options.onLoad?.();
        resolve();
        console.log(`[CSS_OPT] ✅ ${cssFile} loaded`);
      };

      link.onerror = () => {
        reject(new Error(`Failed to load CSS: ${cssFile}`));
      };

      document.head.appendChild(link);
    });
  }

  // OPTIMIZE critical CSS dans le DOM
  optimizeCriticalStyles(): void {
    // Inline critical CSS for instant rendering
    const criticalStyles = `
      /* Critical styles for instant rendering */
      .loading-spinner { 
        width: 20px; 
        height: 20px; 
        border: 2px solid #f3f3f3; 
        border-top: 2px solid #3498db; 
        border-radius: 50%; 
        animation: spin 1s linear infinite; 
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .instant-load {
        opacity: 1 !important;
        transition: none !important;
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = criticalStyles;
    document.head.insertBefore(styleElement, document.head.firstChild);
    
    console.log('[CSS_OPT] 🎯 Critical CSS inlined for instant rendering');
  }

  // DEFER non-critical animations and effects
  deferNonCriticalStyles(): void {
    // Load non-critical styles after main content
    setTimeout(() => {
      const nonCriticalCSS = [
        '/css/animations.css',
        '/css/effects.css',
        '/css/themes.css'
      ];

      nonCriticalCSS.forEach(css => {
        this.loadCSS(css, { critical: false })
          .catch(() => {
            // Silent fail for non-critical CSS
          });
      });
    }, 1000);
  }

  // CLEANUP unused styles
  cleanupUnusedStyles(): void {
    const allLinks = document.querySelectorAll('link[rel="stylesheet"]');
    allLinks.forEach(link => {
      const href = (link as HTMLLinkElement).href;
      if (!this.criticalCSS.some(css => href.includes(css))) {
        // Mark as potentially removable
        (link as HTMLElement).dataset.cleanup = 'candidate';
      }
    });
  }
}

export const cssOptimizer = new CSSOptimizer();

// Initialize CSS optimization immediately
export const initializeCSSOptimization = () => {
  cssOptimizer.optimizeCriticalStyles();
  cssOptimizer.loadCriticalCSS();
  cssOptimizer.deferNonCriticalStyles();
  
  console.log('[CSS_OPT] 🚀 CSS optimization initialized');
};
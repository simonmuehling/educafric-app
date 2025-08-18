// Console filter for removing spam messages in development
export const setupConsoleFilter = () => {
  if (import.meta.env.PROD) return; // Only filter in development

  // Original console methods
  const originalLog = console.log;
  const originalDebug = console.debug;
  const originalInfo = console.info;

  // Spam patterns to filter out
  const spamPatterns = [
    /MessageEvent/i,
    /PAGE_SCRIPT_LOADED/i,
    /ETHEREUM_READY/i,
    /gt-provider-bridge/i,
    /page_all\.js/i,
    /is not a valid JavaScript MIME type/i,
    /Service Worker registration/i,
    /Error while trying to use the following icon from the Manifest/i,
    /Download error or resource isn't a valid image/i,
    /Manifest: line \d+ column \d+/i,
    /MessageEvent.*stripe/i,
    /MessageEvent.*replit\.dev/i,
    /MessageEvent.*js\.stripe\.com/i,
    /MessageEvent.*m\.stripe\.network/i,
    /MessageEvent.*setImmediate/i,
    /page_all\.js.*init command/i,
    /page_all\.js.*MessageEvent/i,
    /\[MEMORY_OPTIMIZER\] Nettoyage terminé en \d+\.\d+ms$/,
    /\[MEMORY_OPTIMIZER\] \d+ images optimisées$/,
    /\[vite\] connecting\.\.\./,
    /\[vite\] connected\./,
    /yoroi.*dapp-connector/i,
    /TronLink initiated/i,
    /Provider initialised/i,
    /Disconnected from polkadot/i,
  ];

  // Filter function
  const shouldFilter = (message: string): boolean => {
    return spamPatterns.some(pattern => pattern.test(message));
  };

  // Override console methods with filtering
  console.log = (...args: any[]) => {
    const message = args.join(' ');
    if (!shouldFilter(message)) {
      originalLog.apply(console, args);
    }
  };

  console.debug = (...args: any[]) => {
    const message = args.join(' ');
    if (!shouldFilter(message)) {
      originalDebug.apply(console, args);
    }
  };

  console.info = (...args: any[]) => {
    const message = args.join(' ');
    if (!shouldFilter(message)) {
      originalInfo.apply(console, args);
    }
  };

  // Filter JavaScript errors as well
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    if (!shouldFilter(message)) {
      originalError.apply(console, args);
    }
  };

  // Bloquer les MessageEvent indésirables et erreurs MIME à la source
  if (window.console) {
    const blockNoiseFromPageAll = () => {
      try {
        // Bloquer les messages de page_all.js s'ils existent
        const scripts = document.querySelectorAll('script[src*="page_all"]');
        scripts.forEach(script => {
          script.remove();
        });
        
        // Bloquer les erreurs Service Worker en développement
        window.addEventListener('error', (event) => {
          const message = event.message || '';
          if (shouldFilter(message)) {
            event.preventDefault();
            event.stopPropagation();
            return false;
          }
        });
        
        // Bloquer les erreurs unhandledrejection liées aux MIME types
        window.addEventListener('unhandledrejection', (event) => {
          const message = event.reason?.message || event.reason || '';
          if (shouldFilter(String(message))) {
            event.preventDefault();
            return false;
          }
        });
        
      } catch (e) {
        // Silently ignore if we can't block these
      }
    };
    
    // Appliquer le blocage
    blockNoiseFromPageAll();
    
    // Aussi appliquer après le chargement complet
    document.addEventListener('DOMContentLoaded', blockNoiseFromPageAll);
  }
};
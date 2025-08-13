// Console filter for removing spam messages in development
export const setupConsoleFilter = () => {
  if (import.meta.env.PROD) return; // Only filter in development

  // Original console methods
  const originalLog = console.log;
  const originalDebug = console.debug;
  const originalInfo = console.info;

  // Spam patterns to filter out
  const spamPatterns = [
    /MessageEvent.*stripe/i,
    /MessageEvent.*replit\.dev/i,
    /MessageEvent.*js\.stripe\.com/i,
    /MessageEvent.*m\.stripe\.network/i,
    /MessageEvent.*setImmediate/i,
    /MessageEvent.*page_all\.js/i,
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

  // Bloquer les MessageEvent indésirables à la source
  if (window.console) {
    const blockNoiseFromPageAll = () => {
      try {
        // Bloquer les messages de page_all.js s'ils existent
        const scripts = document.querySelectorAll('script[src*="page_all"]');
        scripts.forEach(script => {
          script.remove();
        });
        
        // Simple filtrage sans override - plus sûr
        // Note: Nous laissons postMessage fonctionner normalement pour éviter des erreurs TypeScript complexes
        
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
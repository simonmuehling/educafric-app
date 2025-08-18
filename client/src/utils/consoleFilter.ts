// Console filter for removing spam messages
export const setupConsoleFilter = () => {
  // Apply filtering in both dev and production for cleaner console
  
  // Original console methods
  const originalLog = console.log;
  const originalDebug = console.debug;
  const originalInfo = console.info;
  const originalError = console.error;
  const originalWarn = console.warn;

  // Spam patterns to filter out
  const spamPatterns = [
    /MessageEvent/i,
    /PAGE_SCRIPT_LOADED/i,
    /ETHEREUM_READY/i,
    /gt-provider-bridge/i,
    /page_all\.js/i,
    /is not a valid JavaScript MIME type/i,
    /'text\/html' is not a valid JavaScript MIME type/i,
    /TypeError.*is not a valid JavaScript MIME type/i,
    /TypeError.*'text\/html'.*MIME type/i,
    /Service Worker registration/i,
    /Error while trying to use the following icon from the Manifest/i,
    /Download error or resource isn't a valid image/i,
    /Manifest: line \d+ column \d+/i,
    /Failed to load resource.*android-chrome.*png/i,
    /Failed to load resource.*educafric-logo.*png/i,
    /PWA manifest icons.*failed/i,
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
    /Manifest.*validation.*failed/i,
    /PWA.*installation.*blocked/i,
  ];

  // Filter function
  const shouldFilter = (message: string): boolean => {
    return spamPatterns.some(pattern => pattern.test(message));
  };

  // Override global error handlers for MIME type errors
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('is not a valid JavaScript MIME type')) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && typeof event.reason === 'string' && 
        event.reason.includes('is not a valid JavaScript MIME type')) {
      event.preventDefault();
      return false;
    }
  });

  // Override console methods with filtering
  console.log = (...args: any[]) => {
    const message = args.join(' ');
    if (!shouldFilter(message)) {
      originalLog.apply(console, args);
    }
  };
  
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    if (!shouldFilter(message)) {
      originalError.apply(console, args);
    }
  };
  
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    if (!shouldFilter(message)) {
      originalWarn.apply(console, args);
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
};
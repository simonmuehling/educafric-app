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
    /\[MEMORY_OPTIMIZER\] Nettoyage terminé en \d+\.\d+ms$/,
    /\[vite\] connecting\.\.\./,
    /\[vite\] connected\./,
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

  // Special filter for MessageEvent logs from page_all.js
  const originalWindowAddEventListener = window.addEventListener;
  window.addEventListener = function(type: string, listener: any, options?: any) {
    if (type === 'message' && typeof listener === 'function') {
      const filteredListener = (event: MessageEvent) => {
        // Filter out Stripe and other noisy message events
        const allowedOrigins = [window.location.origin];
        const isAllowed = allowedOrigins.some(origin => event.origin.startsWith(origin));
        
        // Only log our own app messages or important system messages
        if (isAllowed && event.data?.type && !event.data.type.includes('stripe')) {
          listener(event);
        } else {
          // Call original listener but don't log
          listener(event);
        }
      };
      
      return originalWindowAddEventListener.call(this, type, filteredListener, options);
    }
    
    return originalWindowAddEventListener.call(this, type, listener, options);
  };
};
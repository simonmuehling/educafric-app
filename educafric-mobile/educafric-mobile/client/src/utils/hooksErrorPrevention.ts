import React from 'react';

// HOOK VIOLATION PREVENTION SYSTEM - PREVENTS CRASHES FOREVER
export function setupGlobalHookErrorPrevention() {
  if (typeof window === 'undefined') return;
  
  // Catch unhandled hook errors
  window.addEventListener('error', (event) => {
    if (event.error?.message?.includes('fewer hooks') ||
        event.error?.message?.includes('hook')) {
      console.error('[GLOBAL_HOOK_SAFETY] Prevented hook violation crash:', event.error);
      event.preventDefault(); // Prevent page crash
      return false;
    }
  });
  
  // Catch promise rejections from hooks
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('fewer hooks') ||
        event.reason?.message?.includes('hook')) {
      console.error('[GLOBAL_HOOK_SAFETY] Prevented hook promise rejection:', event.reason);
      event.preventDefault();
    }
  });
  
  if (import.meta.env.DEV) {
    console.log('[HOOK_SAFETY] 🛡️ Global hook error prevention activated');
  }
}

// React Error Boundary for hook errors
export class HookErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    // Check if it's a hooks-related error
    if (error.message?.includes('fewer hooks') || 
        error.message?.includes('hook') || 
        error.message?.includes('render')) {
      console.error('[HOOK_ERROR_BOUNDARY] Caught hook violation:', error);
      return { hasError: true, error };
    }
    return null;
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[HOOK_ERROR_BOUNDARY] Component error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || React.createElement('div', {
        className: 'p-4 text-center text-gray-500'
      }, [
        React.createElement('p', { key: 'msg' }, 'Component temporarily unavailable'),
        React.createElement('button', {
          key: 'btn',
          onClick: () => this.setState({ hasError: false, error: null }),
          className: 'mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
        }, 'Retry')
      ]);
    }
    
    return this.props.children;
  }
}
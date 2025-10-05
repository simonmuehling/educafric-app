import { useCallback, useRef, useEffect } from 'react';

/**
 * Hook pour préserver les callbacks pendant les redémarrages de serveur
 * Prevents onClick functionality loss during server restarts and hot reloads
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef<T>(callback);
  
  // Update ref when callback changes but keep the same reference
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  // Return a stable callback that always calls the latest version
  return useCallback((...args: any[]) => {
    return callbackRef.current(...args);
  }, []) as T;
}

/**
 * Hook pour préserver les mutations avec callback stable
 * Preserves mutations with stable callbacks
 */
export function useStableMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
  }
) {
  const stableOnSuccess = useStableCallback(options?.onSuccess || (() => {}));
  const stableOnError = useStableCallback(options?.onError || (() => {}));
  const stableMutationFn = useStableCallback(mutationFn);
  
  return {
    mutate: stableMutationFn,
    onSuccess: stableOnSuccess,
    onError: stableOnError
  };
}

/**
 * Hook pour préserver les event handlers
 * Preserves event handlers across re-renders
 */
export function useStableEventHandler<T extends Event = Event>(
  handler: (event: T) => void,
  eventType: string,
  target: EventTarget | null = window
) {
  const stableHandler = useStableCallback(handler);
  
  useEffect(() => {
    if (!target) return;
    
    const wrappedHandler = (event: Event) => {
      stableHandler(event as T);
    };
    
    target.addEventListener(eventType, wrappedHandler);
    
    return () => {
      target.removeEventListener(eventType, wrappedHandler);
    };
  }, [stableHandler, eventType, target]);
}
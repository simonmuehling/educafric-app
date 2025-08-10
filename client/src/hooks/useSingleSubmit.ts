import { useRef, useState } from 'react';
import { nanoid } from 'nanoid';

interface SingleSubmitOptions {
  cooldownMs?: number;
  generateIdempotencyKey?: boolean;
}

export function useSingleSubmit(options: SingleSubmitOptions = {}) {
  const { cooldownMs = 2000, generateIdempotencyKey = true } = options;
  
  const [submitting, setSubmitting] = useState(false);
  const submitRef = useRef(false);
  const idempotencyKeyRef = useRef<string | null>(null);
  const lastSubmitTime = useRef<number>(0);
  
  const wrap = <T extends any[]>(fn: (...args: T) => Promise<any>) => {
    return async (...args: T) => {
      const now = Date.now();
      
      // Vérifier le cooldown
      if (now - lastSubmitTime.current < cooldownMs) {
        console.log('[SINGLE_SUBMIT] Cooldown active, ignoring submit');
        return;
      }
      
      // Vérifier si déjà en cours
      if (submitRef.current) {
        console.log('[SINGLE_SUBMIT] Already submitting, ignoring');
        return;
      }
      
      submitRef.current = true;
      setSubmitting(true);
      lastSubmitTime.current = now;
      
      // Générer une clé d'idempotence si nécessaire
      if (generateIdempotencyKey) {
        idempotencyKeyRef.current = `client:${nanoid(12)}:${now}`;
      }
      
      console.log('[SINGLE_SUBMIT] Starting submit with key:', idempotencyKeyRef.current);
      
      try {
        const result = await fn(...args);
        console.log('[SINGLE_SUBMIT] Submit completed successfully');
        return result;
      } catch (error) {
        console.error('[SINGLE_SUBMIT] Submit failed:', error);
        throw error;
      } finally {
        setSubmitting(false);
        
        // Délai de sécurité avant réactivation
        setTimeout(() => {
          submitRef.current = false;
          idempotencyKeyRef.current = null;
          console.log('[SINGLE_SUBMIT] Submit protection reset');
        }, cooldownMs);
      }
    };
  };
  
  const getIdempotencyKey = () => idempotencyKeyRef.current;
  
  const reset = () => {
    submitRef.current = false;
    setSubmitting(false);
    idempotencyKeyRef.current = null;
    lastSubmitTime.current = 0;
    console.log('[SINGLE_SUBMIT] Manual reset performed');
  };
  
  return { 
    wrap, 
    submitting, 
    getIdempotencyKey,
    reset,
    isInCooldown: () => Date.now() - lastSubmitTime.current < cooldownMs
  };
}

// Hook spécialisé pour les formulaires Educafric
export function useEducafricSubmit() {
  return useSingleSubmit({
    cooldownMs: 3000, // 3 secondes pour actions importantes
    generateIdempotencyKey: true
  });
}

// Hook pour actions rapides (like, follow, etc.)
export function useQuickSubmit() {
  return useSingleSubmit({
    cooldownMs: 1000, // 1 seconde pour actions rapides
    generateIdempotencyKey: true
  });
}

// Hook pour actions critiques (paiements, inscriptions)
export function useCriticalSubmit() {
  return useSingleSubmit({
    cooldownMs: 5000, // 5 secondes pour actions critiques
    generateIdempotencyKey: true
  });
}
import { Request, Response, NextFunction } from 'express';

// Stockage en mémoire pour les clés d'idempotence (remplace Redis en dev)
const idempotencyCache = new Map<string, {
  status: number;
  body: any;
  headers: Record<string, string>;
  timestamp: number;
}>();

// Nettoyage automatique du cache (toutes les 5 minutes)
setInterval(() => {
  const now = Date.now();
  const maxAge = 5 * 60 * 1000; // 5 minutes
  
  for (const [key, value] of Array.from(idempotencyCache.entries())) {
    if (now - value.timestamp > maxAge) {
      idempotencyCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function idempotency(windowSec = 120) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = req.get('Idempotency-Key');
    if (!key) return next();
    
    const cacheKey = `educafric:idem:${req.path}:${key}`;
    const cached = idempotencyCache.get(cacheKey);
    
    // Vérifier si la réponse est en cache et toujours valide
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < windowSec * 1000) {
        console.log(`[IDEMPOTENCY] Returning cached response for key: ${key}`);
        res.set(cached.headers);
        return res.status(cached.status).json(cached.body);
      } else {
        // Cache expiré, le supprimer
        idempotencyCache.delete(cacheKey);
      }
    }
    
    // Intercept la méthode json pour capturer la réponse
    const originalJson = res.json.bind(res);
    let responseCaptured = false;
    
    res.json = function(body: any) {
      if (!responseCaptured) {
        responseCaptured = true;
        
        // Stocker la réponse dans le cache
        const cacheEntry = {
          status: res.statusCode,
          body: body,
          headers: res.getHeaders() as Record<string, string>,
          timestamp: Date.now()
        };
        
        idempotencyCache.set(cacheKey, cacheEntry);
        console.log(`[IDEMPOTENCY] Cached response for key: ${key}, status: ${res.statusCode}`);
      }
      
      return originalJson(body);
    };
    
    next();
  };
}

// Middleware pour générer automatiquement des clés d'idempotence côté serveur
export function autoIdempotency() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.get('Idempotency-Key') && req.method === 'POST') {
      // Générer une clé basée sur l'utilisateur, la route et un hash du body
      const userId = (req as any).user?.id || 'anonymous';
      const bodyHash = req.body ? 
        require('crypto').createHash('md5').update(JSON.stringify(req.body)).digest('hex').substring(0, 8) : 
        'nobody';
      
      const autoKey = `auto:${userId}:${req.path}:${bodyHash}`;
      req.headers['idempotency-key'] = autoKey;
      console.log(`[AUTO_IDEMPOTENCY] Generated key: ${autoKey}`);
    }
    next();
  };
}

// Verrous en mémoire pour opérations critiques
const lockCache = new Map<string, number>();

export async function withLock<T>(
  lockKey: string, 
  ttlMs: number, 
  operation: () => Promise<T>
): Promise<T> {
  const fullKey = `educafric:lock:${lockKey}`;
  const now = Date.now();
  
  // Vérifier si le verrou existe et est toujours valide
  const existingLock = lockCache.get(fullKey);
  if (existingLock && now < existingLock) {
    throw new Error(`Operation already in progress for: ${lockKey}`);
  }
  
  // Acquérir le verrou
  lockCache.set(fullKey, now + ttlMs);
  console.log(`[LOCK] Acquired lock: ${lockKey} for ${ttlMs}ms`);
  
  try {
    const result = await operation();
    return result;
  } finally {
    // Libérer le verrou
    lockCache.delete(fullKey);
    console.log(`[LOCK] Released lock: ${lockKey}`);
  }
}

// Nettoyage automatique des verrous expirés
setInterval(() => {
  const now = Date.now();
  for (const [key, expiry] of Array.from(lockCache.entries())) {
    if (now >= expiry) {
      lockCache.delete(key);
    }
  }
}, 60 * 1000); // Nettoyage toutes les minutes
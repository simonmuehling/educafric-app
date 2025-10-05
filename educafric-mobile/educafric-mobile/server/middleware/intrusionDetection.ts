// Middleware de détection d'intrusion pour Educafric
// SYSTÈME COMPLÈTEMENT DÉSACTIVÉ - Aucun blocage d'utilisateurs légitimes

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Rate limiter COMPLÈTEMENT DÉSACTIVÉ pour la production
export const africanOptimizedRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100000, // Limite extrêmement élevée = pas de blocage
  message: {
    error: 'Système temporairement occupé',
    code: 'HIGH_TRAFFIC', 
    retryAfter: 10
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => true // Skip ALL rate limiting
});

// Middleware principal de détection d'intrusion - COMPLÈTEMENT DÉSACTIVÉ
export const intrusionDetectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Log uniquement pour surveillance sans aucun blocage
  const clientId = (req as any).user ? `user:${(req as any).user.id}` : `ip:${req.ip}`;
  console.log(`✅ [MONITORING_ONLY] Request from ${clientId}: ${req.method} ${req.url}`);
  
  // Passer directement au middleware suivant sans aucune vérification de sécurité
  next();
};

// Règles de sécurité éducatives - TOUTES DÉSACTIVÉES
export const educationalSecurityRules = {
  // Détection de manipulation des notes - DÉSACTIVÉE
  gradeManipulationDetection: (req: Request, res: Response, next: NextFunction) => {
    // Log uniquement, pas de blocage
    if (req.url.includes('/grades') && req.method === 'POST') {
      console.log(`📝 [MONITORING] Grade operation: ${req.method} ${req.url}`);
    }
    next();
  },
  
  // Protection données élèves - DÉSACTIVÉE
  studentDataProtection: (req: Request, res: Response, next: NextFunction) => {
    // Log uniquement, pas de vérification d'autorisation
    if (req.url.includes('/students')) {
      console.log(`👥 [MONITORING] Student data access: ${req.method} ${req.url}`);
    }
    next();
  },
  
  // Détection fraude assiduité - DÉSACTIVÉE
  attendanceFraudDetection: (req: Request, res: Response, next: NextFunction) => {
    // Log uniquement, pas de vérification
    if (req.url.includes('/attendance')) {
      console.log(`📊 [MONITORING] Attendance operation: ${req.method} ${req.url}`);
    }
    next();
  }
};
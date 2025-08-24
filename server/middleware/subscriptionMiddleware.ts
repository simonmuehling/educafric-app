import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/subscriptionService';
import { storage } from '../storage';

interface AuthenticatedRequest extends Request {
  user?: any;
  isAuthenticated?: () => boolean;
  subscription?: any;
  limits?: any;
}

/**
 * Vérifier si un utilisateur est exempt des restrictions premium
 * (comptes sandbox et @test.educafric.com)
 */
const isSandboxOrTestUser = (user: any): boolean => {
  if (!user || !user.email) return false;
  
  const email = user.email.toLowerCase();
  
  // Exemptions pour comptes sandbox et test
  const exemptPatterns = [
    '@test.educafric.com',
    'sandbox@',
    'demo@',
    'test@',
    '.sandbox@',
    '.demo@',
    '.test@'
  ];
  
  return exemptPatterns.some(pattern => email.includes(pattern));
};

/**
 * Middleware pour vérifier les permissions d'abonnement
 */
export const checkSubscriptionFeature = (requiredFeature: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Vérifier l'authentification
      if (!req.isAuthenticated?.() || !req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = req.user;
      
      // ✅ EXEMPTION PERMANENTE: Comptes sandbox et @test.educafric.com
      if (isSandboxOrTestUser(user)) {
        console.log(`[PREMIUM_EXEMPT] User ${user.email} is exempt from premium restrictions`);
        req.subscription = { isPremium: true, planName: 'Sandbox Unlimited', isExempt: true };
        return next();
      }

      const schoolId = user.schoolId;

      if (!schoolId) {
        return res.status(400).json({ error: 'School ID required' });
      }

      // Vérifier si l'utilisateur peut accéder à cette fonctionnalité
      const canAccess = await SubscriptionService.canAccessFeature(schoolId, requiredFeature, user.email);

      if (!canAccess) {
        // Obtenir les détails de l'abonnement pour la réponse
        const subscriptionDetails = await SubscriptionService.getAvailableFeatures(schoolId, user.email);
        
        return res.status(403).json({
          error: 'Premium subscription required',
          message: `Cette fonctionnalité nécessite un abonnement premium`,
          currentPlan: subscriptionDetails.planName,
          isFreemium: subscriptionDetails.isFreemium,
          upgradeUrl: `/subscription/upgrade?school=${schoolId}`,
          availableFeatures: subscriptionDetails.features,
          restrictions: subscriptionDetails.restrictions
        });
      }

      // Ajouter les informations d'abonnement à la requête
      req.subscription = await SubscriptionService.getSchoolSubscription(schoolId);
      next();
    } catch (error) {
      console.error('Subscription check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Middleware pour vérifier les limites freemium
 */
export const checkFreemiumLimits = (resourceType: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.isAuthenticated?.() || !req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = req.user;
      
      // ✅ EXEMPTION PERMANENTE: Comptes sandbox et @test.educafric.com
      if (isSandboxOrTestUser(user)) {
        console.log(`[LIMITS_EXEMPT] User ${user.email} is exempt from freemium limits`);
        req.limits = { canAdd: true, limit: 999999, remaining: 999999, message: 'Unlimited (Sandbox)' };
        return next();
      }

      const schoolId = user.schoolId;
      
      // Obtenir le nombre actuel de ressources
      let currentCount = 0;
      
      switch (resourceType) {
        case 'students':
          currentCount = (await storage.getSchoolStudents(schoolId)).length;
          break;
        case 'teachers':
          currentCount = (await storage.getAdministrationTeachers(schoolId)).length;
          break;
        case 'classes':
          currentCount = (await storage.getClassesBySchool(schoolId)).length;
          break;
        case 'parents':
          currentCount = (await storage.getSchoolParents(schoolId)).length;
          break;
        default:
          return next(); // Pas de limite définie pour ce type
      }

      // Vérifier les limites
      const limitCheck = await SubscriptionService.checkFreemiumLimits(schoolId, resourceType, currentCount, user.email);

      if (!limitCheck.canAdd) {
        return res.status(403).json({
          error: 'Freemium limit reached',
          message: limitCheck.message,
          currentCount,
          limit: limitCheck.limit,
          remaining: limitCheck.remaining,
          upgradeUrl: `/subscription/upgrade?school=${schoolId}&reason=limit_${resourceType}`
        });
      }

      // Ajouter les informations de limite à la requête
      req.limits = limitCheck;
      next();
    } catch (error) {
      console.error('Freemium limits check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Middleware pour filtrer les données selon le mode (sandbox vs production)
 */
export const filterDataByMode = () => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.isAuthenticated?.() || !req.user) {
        return next();
      }

      const schoolId = req.user.schoolId;
      
      // Ajouter une fonction helper à la réponse
      res.filterByMode = (data: any[]) => {
        return SubscriptionService.filterDataByMode(data, schoolId);
      };

      next();
    } catch (error) {
      console.error('Data filtering error:', error);
      next();
    }
  };
};

/**
 * Middleware pour injecter les informations d'abonnement dans les réponses
 */
export const injectSubscriptionInfo = () => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.isAuthenticated?.() || !req.user) {
        return next();
      }

      const schoolId = req.user.schoolId;
      const subscriptionInfo = await SubscriptionService.getAvailableFeatures(schoolId, req.user.email);
      
      // Ajouter les informations d'abonnement aux réponses
      res.subscriptionInfo = subscriptionInfo;
      
      next();
    } catch (error) {
      console.error('Subscription info injection error:', error);
      next();
    }
  };
};

// Types pour TypeScript
declare global {
  namespace Express {
    interface Response {
      filterByMode?: (data: any[]) => any[];
      subscriptionInfo?: {
        features: string[];
        restrictions: string[];
        planName: string;
        isFreemium: boolean;
      };
    }
    interface Request {
      subscription?: any;
      limits?: {
        canAdd: boolean;
        limit: number;
        remaining: number;
        message?: string;
      };
    }
  }
}
// Online Classes Premium Subscription Middleware
// Validates that schools have active online classes subscription

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedUser } from '@shared/types';

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// Subscription validation middleware
export const requireOnlineClassesSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        error: "Authentication required", 
        code: "AUTH_REQUIRED" 
      });
    }

    // Allow Students and Parents to access (they can view/join sessions)
    // Allow Admins, Directors, and Teachers to manage
    const allowedRoles = ['SiteAdmin', 'Admin', 'Director', 'Teacher', 'Student', 'Parent'];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        error: "Access denied. Only school members can access online classes.", 
        code: "ROLE_FORBIDDEN" 
      });
    }

    // EXEMPTION PREMIUM PERMANENTE pour comptes sandbox et test
    // Patterns d'exemption : @educafric.demo, @test.educafric.com, sandbox., demo., test.
    console.log(`[ONLINE_CLASSES_DEBUG] 🔍 Checking exemption for user: ${user.email} (${user.role})`);
    
    const exemptPatterns = [
      '@educafric.demo',     // Domaine sandbox/demo principal
      '@test.educafric.com', // Domaine test
      'sandbox.',            // Emails commençant par sandbox.
      'demo.',               // Emails commençant par demo.
      'test.',               // Emails commençant par test.
      '.sandbox@',           // Emails contenant .sandbox@
      '.demo@',              // Emails contenant .demo@
      '.test@'               // Emails contenant .test@
    ];
    
    console.log(`[ONLINE_CLASSES_DEBUG] 🔍 Exemption patterns: ${exemptPatterns.join(', ')}`);
    
    const isExempt = user.email && exemptPatterns.some(pattern => {
      const matches = user.email!.includes(pattern);
      console.log(`[ONLINE_CLASSES_DEBUG] 🔍 Pattern '${pattern}' in '${user.email}': ${matches}`);
      return matches;
    });
    
    console.log(`[ONLINE_CLASSES_DEBUG] 🔍 Final exemption result: ${isExempt}`);
    
    if (isExempt) {
      console.log(`[PREMIUM_EXEMPT] ✅ User ${user.email} (${user.role}) permanently exempt from online classes subscription`);
      console.log(`[LIMITS_EXEMPT] ✅ Online classes unlimited access granted`);
      return next();
    }

    // Students and Parents: Allow access regardless of subscription (they will see available sessions)
    // They can only join sessions, not create them
    if (['Student', 'Parent'].includes(user.role)) {
      console.log(`[ONLINE_CLASSES_ACCESS] ✅ ${user.role} ${user.email} granted view access to online classes`);
      return next();
    }

    // For Teachers, Directors, Admins: Check school subscription
    const schoolId = user.schoolId;
    if (!schoolId) {
      return res.status(400).json({ 
        error: "School ID not found for user", 
        code: "SCHOOL_NOT_FOUND" 
      });
    }

    // Import database connection (adjust path as needed)
    const { db } = await import('../db.js');
    const { onlineClassesSubscriptions } = await import('../../shared/schemas/onlineClassesSchema.js');
    const { eq } = await import('drizzle-orm');

    // Query subscription status
    const subscription = await db
      .select()
      .from(onlineClassesSubscriptions)
      .where(eq(onlineClassesSubscriptions.schoolId, schoolId))
      .limit(1);

    if (subscription.length === 0) {
      return res.status(402).json({ 
        error: "Online classes subscription required. Please activate the premium online classes module.", 
        code: "SUBSCRIPTION_NOT_FOUND",
        subscriptionRequired: true,
        monthlyPrice: 250000,
        currency: "XAF"
      });
    }

    const sub = subscription[0];
    const now = new Date();

    // Check if subscription is active and not expired
    if (!sub.isActive) {
      return res.status(402).json({ 
        error: "Online classes subscription is inactive. Please renew your subscription.", 
        code: "SUBSCRIPTION_INACTIVE",
        subscriptionRequired: true,
        monthlyPrice: 250000,
        currency: "XAF"
      });
    }

    if (sub.expiresAt && new Date(sub.expiresAt) < now) {
      // Check grace period
      if (sub.gracePeriodEnds && new Date(sub.gracePeriodEnds) < now) {
        return res.status(402).json({ 
          error: "Online classes subscription has expired. Please renew to continue using this feature.", 
          code: "SUBSCRIPTION_EXPIRED",
          subscriptionRequired: true,
          expiresAt: sub.expiresAt,
          gracePeriodEnds: sub.gracePeriodEnds,
          monthlyPrice: 250000,
          currency: "XAF"
        });
      } else {
        // In grace period - log warning but allow access
        console.log(`[ONLINE_CLASSES_GRACE] ⚠️ School ${schoolId} accessing online classes in grace period until ${sub.gracePeriodEnds}`);
      }
    }

    // Log successful access
    console.log(`[ONLINE_CLASSES_ACCESS] ✅ User ${user.email} from school ${schoolId} granted access to online classes`);
    
    // Attach subscription info to request for use in routes
    (req as any).subscription = sub;
    
    next();
  } catch (error) {
    console.error('[ONLINE_CLASSES_MIDDLEWARE] Error checking subscription:', error);
    return res.status(500).json({ 
      error: "Internal server error while checking subscription", 
      code: "INTERNAL_ERROR" 
    });
  }
};

// Middleware to check if user has permission to manage online classes
export const requireOnlineClassesManagement = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ 
      error: "Authentication required", 
      code: "AUTH_REQUIRED" 
    });
  }

  // Only school admins, directors, and teachers can manage classes
  if (!['SiteAdmin', 'Admin', 'Director', 'Teacher'].includes(user.role)) {
    return res.status(403).json({ 
      error: "Access denied. Only school administrators and teachers can manage online classes.", 
      code: "MANAGEMENT_FORBIDDEN" 
    });
  }

  // Teachers can only manage their own classes, admins can manage all
  if (user.role === 'Teacher') {
    // Add teacher-specific validation if needed
    (req as any).isTeacherRestricted = true;
  }

  next();
};

// Middleware to check if user can join/observe online classes
export const requireOnlineClassesAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ 
      error: "Authentication required", 
      code: "AUTH_REQUIRED" 
    });
  }

  // Students, parents, teachers, and admins can access classes
  const allowedRoles = ['SiteAdmin', 'Admin', 'Director', 'Teacher', 'Student', 'Parent'];
  
  if (!allowedRoles.includes(user.role)) {
    return res.status(403).json({ 
      error: "Access denied. Only school members can access online classes.", 
      code: "ACCESS_FORBIDDEN" 
    });
  }

  next();
};

// Middleware to require PERSONAL subscription for course creation
// Teachers with school-only access cannot create their own courses
export const requirePersonalSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ 
      error: "Authentication required", 
      code: "AUTH_REQUIRED" 
    });
  }

  // Site admins and directors bypass this check (they manage school courses)
  if (['SiteAdmin', 'Admin', 'Director'].includes(user.role)) {
    return next();
  }

  // Check for sandbox/test exemption
  const exemptPatterns = [
    '@educafric.demo',
    '@test.educafric.com',
    'sandbox.',
    'demo.',
    'test.',
    '.sandbox@',
    '.demo@',
    '.test@'
  ];
  
  const isExempt = user.email && exemptPatterns.some(pattern => user.email!.includes(pattern));
  
  if (isExempt) {
    console.log(`[PERSONAL_SUBSCRIPTION] ✅ User ${user.email} exempt from personal subscription check`);
    return next();
  }

  // For teachers, check if they have personal subscription (not just school access)
  if (user.role === 'Teacher') {
    const { onlineClassAccessService } = await import('../services/onlineClassAccessService.js');
    
    const accessCheck = await onlineClassAccessService.canTeacherAccessOnlineClass(
      user.id,
      new Date(),
      user.email || undefined
    );
    
    console.log(`[PERSONAL_SUBSCRIPTION] 🔍 Access check for teacher ${user.id}:`, accessCheck);
    
    // Allow only if they have PERSONAL subscription (activationType === 'teacher')
    // Deny if they only have school access (activationType === 'school')
    if (accessCheck.activationType === 'school') {
      console.log(`[PERSONAL_SUBSCRIPTION] ❌ Teacher ${user.id} has school access only - course creation denied`);
      return res.status(403).json({ 
        error: "Vous avez accès aux sessions assignées par votre école, mais pour créer vos propres cours, vous devez souscrire à un abonnement personnel (150,000 CFA/an).",
        code: "PERSONAL_SUBSCRIPTION_REQUIRED",
        requiresPersonalSubscription: true,
        yearlyPrice: 150000,
        currency: "XAF"
      });
    }
    
    if (!accessCheck.allowed || accessCheck.activationType !== 'teacher') {
      console.log(`[PERSONAL_SUBSCRIPTION] ❌ Teacher ${user.id} does not have personal subscription`);
      return res.status(403).json({ 
        error: "Abonnement personnel requis pour créer des cours. Souscrivez pour 150,000 CFA/an.",
        code: "PERSONAL_SUBSCRIPTION_REQUIRED",
        requiresPersonalSubscription: true,
        yearlyPrice: 150000,
        currency: "XAF"
      });
    }
    
    console.log(`[PERSONAL_SUBSCRIPTION] ✅ Teacher ${user.id} has valid personal subscription`);
  }

  next();
};
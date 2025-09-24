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

    // Only school admins and teachers can access online classes
    if (!['SiteAdmin', 'Admin', 'Director', 'Teacher'].includes(user.role)) {
      return res.status(403).json({ 
        error: "Access denied. Only school administrators and teachers can access online classes.", 
        code: "ROLE_FORBIDDEN" 
      });
    }

    // Premium exemption for sandbox/test users (DEVELOPMENT ONLY)
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const exemptPatterns = [
      '@test.educafric.com',
      'sandbox@educafric.demo', 
      'demo@educafric.demo'
    ];
    
    const isExempt = isDevelopment && exemptPatterns.some(pattern => 
      user.email === pattern || user.email?.endsWith(pattern)
    );
    
    if (isExempt) {
      console.log(`[ONLINE_CLASSES_EXEMPT] ✅ User ${user.email} (${user.role}) is exempt from online classes subscription requirements`);
      return next();
    }

    // Check school subscription status
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
import { Request, Response, NextFunction } from "express";
import { ConnectionTrackingService } from "../services/connectionTrackingService";

// Middleware to automatically track user connections
export const trackConnection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only track authenticated users with complete data
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      const user = req.user as any;
      
      // Ensure we have all required user data
      if (user.id && user.email && user.role) {
        const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';
        
        // Get basic location info from IP
        const location = await ConnectionTrackingService.getLocationFromIP(ipAddress);
        
        // Determine access method
        let accessMethod = 'web';
        if (userAgent.includes('Mobile')) accessMethod = 'mobile';
        if (req.get('X-Requested-With') === 'PWA') accessMethod = 'pwa';

        // Log the connection
        await ConnectionTrackingService.logConnection({
          userId: user.id,
          userEmail: user.email,
          userRole: user.role,
          userName: user.username || user.name || user.email.split('@')[0],
          ipAddress,
          location,
          userAgent,
          sessionId: req.sessionID,
          accessMethod
        });
      }
    }
  } catch (error) {
    // Don't block the request if tracking fails
    console.error(`[CONNECTION_TRACKING] ❌ Erreur tracking:`, error);
  }
  
  next();
};

// Middleware to track page visits
export const trackPageVisit = (moduleName?: string, dashboardType?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.isAuthenticated && req.isAuthenticated() && req.user) {
        const user = req.user as any;
        const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
        
        await ConnectionTrackingService.logPageVisit({
          userId: user.id,
          userEmail: user.email,
          userRole: user.role,
          pagePath: req.path,
          moduleName,
          dashboardType,
          ipAddress,
          sessionId: req.sessionID
        });
      }
    } catch (error) {
      console.error(`[PAGE_TRACKING] ❌ Erreur tracking page:`, error);
    }
    
    next();
  };
};
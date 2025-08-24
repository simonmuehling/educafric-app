import { Request, Response, NextFunction } from 'express';

// Middleware to require authentication
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

// Middleware to require specific role
export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    if (!user || user.role !== role) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}

// Middleware to require any of multiple roles
export function requireAnyRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}
import { Request, Response, NextFunction } from 'express';

// Sandbox isolation middleware - completely separate from main security system
export function sandboxIsolationMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only apply to sandbox routes
  if (!req.path.includes('/sandbox') && !req.path.includes('/api/sandbox')) {
    return next();
  }

  // Add sandbox headers to indicate isolated environment
  res.setHeader('X-Sandbox-Mode', 'true');
  res.setHeader('X-Security-Level', 'isolated');
  
  console.log(`🏖️ Sandbox request: ${req.method} ${req.path}`);
  
  next();
}

// Sandbox authentication helper - bypasses all security checks
export function sandboxAuthHelper(req: Request, res: Response, next: NextFunction) {
  // Only for sandbox auth routes
  if (!req.path.includes('/api/auth/sandbox')) {
    return next();
  }

  // Log sandbox activity without security monitoring
  console.log(`🏖️ Sandbox auth: ${req.body?.email || 'unknown'}`);
  
  next();
}
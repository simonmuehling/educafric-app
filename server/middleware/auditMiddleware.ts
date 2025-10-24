// ===== AUDIT MIDDLEWARE =====
// Middleware automatique pour tracer toutes les actions importantes

import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { auditLogs } from '@shared/schema';

// Actions à auditer automatiquement
const AUDITABLE_ACTIONS = {
  // Authentication
  'POST /api/auth/login': { category: 'auth', description: 'User login' },
  'POST /api/auth/logout': { category: 'auth', description: 'User logout' },
  'POST /api/auth/register': { category: 'auth', description: 'User registration' },
  'POST /api/auth/password-reset': { category: 'auth', description: 'Password reset requested' },
  
  // Academic
  'POST /api/grades': { category: 'academic', description: 'Grade created' },
  'PUT /api/grades/:id': { category: 'academic', description: 'Grade updated' },
  'DELETE /api/grades/:id': { category: 'academic', description: 'Grade deleted' },
  'POST /api/bulletins': { category: 'academic', description: 'Bulletin created' },
  'POST /api/attendance': { category: 'academic', description: 'Attendance marked' },
  
  // Financial
  'POST /api/payments': { category: 'financial', description: 'Payment created' },
  'POST /api/subscriptions': { category: 'financial', description: 'Subscription created' },
  'POST /api/stripe/webhook': { category: 'financial', description: 'Stripe webhook received' },
  
  // Administrative
  'POST /api/users': { category: 'administrative', description: 'User created' },
  'PUT /api/users/:id': { category: 'administrative', description: 'User updated' },
  'DELETE /api/users/:id': { category: 'administrative', description: 'User deleted' },
  'POST /api/schools': { category: 'administrative', description: 'School created' },
  'POST /api/classes': { category: 'administrative', description: 'Class created' },
  
  // Security
  'POST /api/auth/2fa/enable': { category: 'security', description: '2FA enabled' },
  'POST /api/auth/2fa/disable': { category: 'security', description: '2FA disabled' },
  'POST /api/profile/delete-request': { category: 'security', description: 'Account deletion requested' }
};

// Créer un log d'audit
async function createAuditLog(
  req: Request,
  action: string,
  category: string,
  description: string,
  success: boolean = true,
  errorMessage?: string
) {
  try {
    const user = (req as any).user;
    const routeKey = `${req.method} ${req.route?.path || req.path}`;
    
    await db.insert(auditLogs).values({
      userId: user?.id || null,
      userRole: user?.role || null,
      userEmail: user?.email || null,
      action,
      actionCategory: category,
      entityType: extractEntityType(req.path),
      entityId: extractEntityId(req),
      description,
      metadata: {
        method: req.method,
        path: req.path,
        body: sanitizeBody(req.body),
        query: req.query,
        params: req.params
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      schoolId: user?.schoolId || null,
      severity: errorMessage ? 'error' : 'info',
      success,
      errorMessage: errorMessage || null
    });
  } catch (error) {
    console.error('[AuditMiddleware] Error creating audit log:', error);
  }
}

// Extraire le type d'entité du path
function extractEntityType(path: string): string | null {
  const match = path.match(/\/api\/([^\/]+)/);
  return match ? match[1] : null;
}

// Extraire l'ID de l'entité
function extractEntityId(req: Request): string | null {
  return req.params.id || req.body.id || null;
}

// Sanitizer le body pour enlever les données sensibles
function sanitizeBody(body: any): any {
  if (!body) return null;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'stripeToken', 'twoFactorSecret'];
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

// Middleware principal
export function auditMiddleware(req: Request, res: Response, next: NextFunction) {
  // Fix: Build correct route key using baseUrl + route.path for mounted routers
  const fullPath = req.baseUrl + (req.route?.path || '');
  const routeKey = `${req.method} ${fullPath || req.originalUrl}`;
  const auditConfig = AUDITABLE_ACTIONS[routeKey as keyof typeof AUDITABLE_ACTIONS];
  
  if (!auditConfig) {
    return next();
  }
  
  // Intercepter la réponse pour logger le succès/échec
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  
  res.json = function(data: any) {
    const success = res.statusCode >= 200 && res.statusCode < 300;
    const errorMessage = !success && data?.message ? data.message : undefined;
    
    createAuditLog(
      req,
      routeKey,
      auditConfig.category,
      auditConfig.description,
      success,
      errorMessage
    );
    
    return originalJson(data);
  };
  
  res.send = function(data: any) {
    const success = res.statusCode >= 200 && res.statusCode < 300;
    
    createAuditLog(
      req,
      routeKey,
      auditConfig.category,
      auditConfig.description,
      success
    );
    
    return originalSend(data);
  };
  
  next();
}

// Fonction helper pour créer des logs manuellement
export async function logAudit(params: {
  userId?: number;
  userRole?: string;
  userEmail?: string;
  action: string;
  actionCategory: string;
  entityType?: string;
  entityId?: string;
  description: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  schoolId?: number;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  success?: boolean;
  errorMessage?: string;
}) {
  try {
    await db.insert(auditLogs).values({
      userId: params.userId || null,
      userRole: params.userRole || null,
      userEmail: params.userEmail || null,
      action: params.action,
      actionCategory: params.actionCategory,
      entityType: params.entityType || null,
      entityId: params.entityId || null,
      description: params.description,
      metadata: params.metadata || null,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
      schoolId: params.schoolId || null,
      severity: params.severity || 'info',
      success: params.success !== false,
      errorMessage: params.errorMessage || null
    });
  } catch (error) {
    console.error('[AuditMiddleware] Error logging audit:', error);
  }
}

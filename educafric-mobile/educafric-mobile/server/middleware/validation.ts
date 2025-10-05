import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '@shared/types';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        const errors = formatZodErrors(result.error);
        throw new ValidationError(errors);
      }
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);
      if (!result.success) {
        const errors = formatZodErrors(result.error);
        throw new ValidationError(errors);
      }
      req.query = result.data as any;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);
      if (!result.success) {
        const errors = formatZodErrors(result.error);
        throw new ValidationError(errors);
      }
      req.params = result.data as any;
      next();
    } catch (error) {
      next(error);
    }
  };
}

function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formattedErrors: Record<string, string[]> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!formattedErrors[path]) {
      formattedErrors[path] = [];
    }
    formattedErrors[path].push(err.message);
  });
  
  return formattedErrors;
}

// Input sanitization for African educational context
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    sanitizeObject(req.body);
  }
  if (req.query) {
    sanitizeObject(req.query);
  }
  next();
}

function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Remove potentially dangerous characters while preserving African names and French accents
      obj[key] = obj[key]
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

// Environment variable validation
export function validateEnvironment() {
  const required = [
    'DATABASE_URL',
    'SESSION_SECRET'
  ];
  
  const optional = [
    'STRIPE_SECRET_KEY',
    'VONAGE_API_KEY',
    'VONAGE_API_SECRET',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Warn about missing optional variables
  const missingOptional = optional.filter(key => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn(`[WARNING] Missing optional environment variables: ${missingOptional.join(', ')}`);
  }
  
  // Validate session secret strength
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
    console.warn('[WARNING] SESSION_SECRET should be at least 32 characters long for production');
  }
}
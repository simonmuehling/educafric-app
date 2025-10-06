import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  (req as any).id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-Id', (req as any).id);
  next();
};

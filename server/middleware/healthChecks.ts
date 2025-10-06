import { Request, Response } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

let isReady = false;

export function markAsReady() {
  isReady = true;
}

// Liveness probe - basic check that server is running
export async function healthz(_req: Request, res: Response) {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}

// Readiness probe - check if app can handle requests (DB connected, etc.)
export async function readyz(_req: Request, res: Response) {
  if (!isReady) {
    return res.status(503).json({
      status: 'starting',
      message: 'Application is still initializing'
    });
  }

  // Check database connectivity
  try {
    await db.execute(sql`SELECT 1`);
    
    return res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'ok'
      }
    });
  } catch (error) {
    return res.status(503).json({
      status: 'error',
      message: 'Database connection failed',
      checks: {
        database: 'failed'
      }
    });
  }
}

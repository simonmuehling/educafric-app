// ===== AUDIT LOGS API ROUTES =====

import express from 'express';
import { requireAuth, requireAnyRole } from '../../middleware/auth';
import { db } from '../../db';
import { auditLogs, auditLogAccessTracking } from '@shared/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

const router = express.Router();

// Get audit logs (SiteAdmin only)
router.get('/', requireAuth, requireAnyRole(['SiteAdmin']), async (req, res) => {
  try {
    const { category, severity, userId, startDate, endDate, limit = 50 } = req.query;
    
    let query = db.select().from(auditLogs);
    
    const conditions: any[] = [];
    
    if (category) {
      conditions.push(eq(auditLogs.actionCategory, category as string));
    }
    
    if (severity) {
      conditions.push(eq(auditLogs.severity, severity as string));
    }
    
    if (userId) {
      conditions.push(eq(auditLogs.userId, parseInt(userId as string)));
    }
    
    if (startDate) {
      conditions.push(gte(auditLogs.createdAt, new Date(startDate as string)));
    }
    
    if (endDate) {
      conditions.push(lte(auditLogs.createdAt, new Date(endDate as string)));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const logs = await query
      .orderBy(desc(auditLogs.createdAt))
      .limit(parseInt(limit as string));
    
    // Track access
    await db.insert(auditLogAccessTracking).values({
      accessedBy: (req.user as any).id,
      filters: req.query,
      resultsCount: logs.length,
      ipAddress: req.ip
    });
    
    res.json(logs);
  } catch (error) {
    console.error('[AuditLogs] Error getting logs:', error);
    res.status(500).json({ error: 'Failed to get audit logs' });
  }
});

// Get audit log statistics
router.get('/stats', requireAuth, requireAnyRole(['SiteAdmin']), async (req, res) => {
  try {
    const stats = await db.execute(sql`
      SELECT 
        action_category,
        COUNT(*) as count,
        COUNT(CASE WHEN success = true THEN 1 END) as successful,
        COUNT(CASE WHEN success = false THEN 1 END) as failed
      FROM audit_logs
      GROUP BY action_category
    `);
    
    res.json(stats.rows);
  } catch (error) {
    console.error('[AuditLogs] Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

export default router;

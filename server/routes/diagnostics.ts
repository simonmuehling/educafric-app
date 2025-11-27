import type { Express } from "express";
import { testDatabaseConnection, testUserQuery } from "../utils/databaseTest";
import { healthCheck } from "../middleware/performance";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export function registerDiagnosticsRoutes(app: Express) {
  // Teacher diagnostic endpoint - helps debug teacher display issues
  app.get('/api/diagnostics/teachers/:schoolId', async (req, res) => {
    try {
      const schoolId = parseInt(req.params.schoolId);
      const user = req.user as any;
      
      // Get teachers for this school directly from DB
      const teachersFromDB = await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone,
        role: users.role,
        schoolId: users.schoolId
      })
      .from(users)
      .where(and(eq(users.role, 'Teacher'), eq(users.schoolId, schoolId)));
      
      res.json({
        success: true,
        schoolIdRequested: schoolId,
        currentUser: user ? {
          id: user.id,
          role: user.role,
          schoolId: user.schoolId,
          school_id: user.school_id,
          email: user.email
        } : null,
        teachersCount: teachersFromDB.length,
        teachers: teachersFromDB.map(t => ({
          id: t.id,
          name: `${t.firstName} ${t.lastName}`,
          email: t.email,
          phone: t.phone,
          schoolId: t.schoolId
        }))
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // User session diagnostic - shows current user info
  app.get('/api/diagnostics/session', (req, res) => {
    const user = req.user as any;
    if (!user) {
      return res.json({
        authenticated: false,
        message: 'No user session found'
      });
    }
    
    res.json({
      authenticated: true,
      userId: user.id,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      schoolId: user.schoolId,
      school_id_raw: user.school_id, // Check if there's a difference
      isSandboxUser: user.sandboxMode || user.email?.includes('@test.educafric.com')
    });
  });

  // Enhanced health check with database testing
  app.get('/api/diagnostics/health', async (req, res) => {
    try {
      const dbTest = await testDatabaseConnection();
      const userTest = await testUserQuery();
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        system: {
          uptime: Math.floor(process.uptime()),
          memory: {
            used: Math.round(process.memoryUsage().rss / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            external: Math.round(process.memoryUsage().external / 1024 / 1024),
            rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
          },
          cpu: {
            load: process.cpuUsage(),
            platform: process.platform,
            arch: process.arch
          }
        },
        database: {
          connection: dbTest,
          users: userTest
        },
        security: {
          total_events_24h: 0,
          total_events_1h: 0,
          critical_events_24h: 0,
          blocked_ips: 0,
          high_risk_ips: 0,
          event_types_24h: {},
          top_threat_ips: []
        }
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Database connection test endpoint
  app.get('/api/diagnostics/database', async (req, res) => {
    try {
      const dbTest = await testDatabaseConnection();
      res.json(dbTest);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // User table test endpoint
  app.get('/api/diagnostics/users', async (req, res) => {
    try {
      const userTest = await testUserQuery();
      res.json(userTest);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Performance metrics endpoint
  app.get('/api/diagnostics/performance', (req, res) => {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    res.json({
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
        arrayBuffers: Math.round(memoryUsage.arrayBuffers / 1024 / 1024)
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      pid: process.pid,
      platform: process.platform,
      version: process.version,
      nodeVersion: process.versions.node
    });
  });

  console.log('[DIAGNOSTICS] ✅ Diagnostic routes registered successfully');
}
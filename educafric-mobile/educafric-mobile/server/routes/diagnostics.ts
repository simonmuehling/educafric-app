import type { Express } from "express";
import { testDatabaseConnection, testUserQuery } from "../utils/databaseTest";
import { healthCheck } from "../middleware/performance";

export function registerDiagnosticsRoutes(app: Express) {
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
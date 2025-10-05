import type { Express } from "express";
import { criticalAlertingService } from "../services/criticalAlertingService";

export function registerCriticalAlertingRoutes(app: Express) {
  // Test critical alerting system (Site Admin only)
  app.post("/api/admin/test-critical-alert", async (req, res) => {
    try {
      // Check if user is site admin
      if (!req.user || (req.user as any).role !== 'SiteAdmin') {
        return res.status(403).json({ message: 'Site Admin access required' });
      }

      await criticalAlertingService.sendTestAlert();
      
      res.json({
        success: true,
        message: 'Test critical alert sent successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Test alert failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send test alert',
        error: error.message
      });
    }
  });

  // Test commercial connection alert
  app.post("/api/admin/test-commercial-alert", async (req, res) => {
    try {
      if (!req.user || (req.user as any).role !== 'SiteAdmin') {
        return res.status(403).json({ message: 'Site Admin access required' });
      }

      const testCommercialUser = {
        id: 999,
        email: 'test.commercial@educafric.com',
        name: 'Test Commercial User',
        role: 'commercial',
        ip: req.ip
      };

      await criticalAlertingService.sendCommercialConnectionAlert(testCommercialUser);
      
      res.json({
        success: true,
        message: 'Test commercial alert sent successfully',
        timestamp: new Date().toISOString(),
        alertSentTo: '+41768017000'
      });
    } catch (error: any) {
      console.error('Commercial test alert failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send commercial test alert',
        error: error.message
      });
    }
  });

  // Get alerting system health
  app.get("/api/admin/alerting-health", async (req, res) => {
    try {
      if (!req.user || (req.user as any).role !== 'SiteAdmin') {
        return res.status(403).json({ message: 'Site Admin access required' });
      }

      const health = await criticalAlertingService.getAlertingSystemHealth();
      
      res.json({
        ...health,
        description: 'Critical alerting system for Educafric platform',
        alert_types: {
          server_errors: 'Email + SMS to both numbers',
          database_failures: 'Email + SMS to both numbers',
          security_breaches: 'Email + SMS to both numbers',
          commercial_connections: 'PWA notification + SMS to Switzerland only',
          payment_failures: 'Email + SMS to both numbers',
          system_overload: 'Email + SMS to both numbers'
        }
      });
    } catch (error: any) {
      console.error('Alerting health check failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get alerting system health',
        error: error.message
      });
    }
  });

  console.log('[CRITICAL_ALERTING] Routes registered successfully');
}
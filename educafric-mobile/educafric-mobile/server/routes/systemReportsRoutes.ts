import { Router } from 'express';
import { systemReportService } from '../services/systemReportService';
// Import requireAuth from main routes file
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

const router = Router();

// Get system report service status (Admin only)
router.get('/status', requireAuth, async (req, res) => {
  try {
    if (req.user?.role !== 'SiteAdmin') {
      return res.status(403).json({ message: 'Access denied - Admin only' });
    }

    const status = systemReportService.getStatus();
    res.json({
      service: 'System Reports',
      ...status,
      emailTarget: 'simonmhling@gmail.com',
      schedule: ['03:00 daily', '22:00 daily'],
      timezone: 'Africa/Douala'
    });
  } catch (error) {
    console.error('[SYSTEM_REPORTS] Error getting status:', error);
    res.status(500).json({ message: 'Failed to get system report status' });
  }
});

// Send manual test report (Admin only)
router.post('/test', requireAuth, async (req, res) => {
  try {
    if (req.user?.role !== 'SiteAdmin') {
      return res.status(403).json({ message: 'Access denied - Admin only' });
    }

    console.log(`[SYSTEM_REPORTS] Manual test report requested by ${req.user.email}`);
    const success = await systemReportService.sendTestReport();
    
    if (success) {
      res.json({ 
        message: 'Test report sent successfully',
        recipient: 'simonmhling@gmail.com',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({ message: 'Failed to send test report' });
    }
  } catch (error) {
    console.error('[SYSTEM_REPORTS] Error sending test report:', error);
    res.status(500).json({ message: 'Failed to send test report' });
  }
});

// Get current system metrics (Admin only)
router.get('/metrics', requireAuth, async (req, res) => {
  try {
    if (req.user?.role !== 'SiteAdmin') {
      return res.status(403).json({ message: 'Access denied - Admin only' });
    }

    const metrics = await systemReportService.getCurrentMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('[SYSTEM_REPORTS] Error getting metrics:', error);
    res.status(500).json({ message: 'Failed to get system metrics' });
  }
});

export default router;
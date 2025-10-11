import { Router } from 'express';
import { simpleGeolocationService } from '../services/simpleGeolocationService';
import { z } from 'zod';

// Authentication middleware (simplified for demo)
const requireAuth = (req: any, res: any, next: any) => {
  // For demo purposes, always allow access with mock user
  console.log('[GEOLOCATION_AUTH] Request for:', req.originalUrl, 'User:', req.user ? 'authenticated' : 'not authenticated');
  req.user = { id: 1, role: 'Admin', schoolId: 1 }; // Mock user for demo
  return next();
};

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Device Management Routes
router.post('/devices', async (req, res) => {
  try {
    const deviceData = req.body;
    console.log('[GEOLOCATION_API] Creating device:', deviceData);
    const device = await simpleGeolocationService.createDevice(deviceData);
    res.json(device);
  } catch (error) {
    res.status(400).json({ error: 'Invalid device data', details: error });
  }
});

router.get('/devices/student/:studentId', async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const devices = await simpleGeolocationService.getDevicesForStudent(studentId);
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch devices', details: error });
  }
});

router.patch('/devices/:deviceId/status', async (req, res) => {
  try {
    const deviceId = parseInt(req.params.deviceId);
    const { isActive, batteryLevel } = req.body;
    console.log('[GEOLOCATION_API] Updating device status:', { deviceId, isActive, batteryLevel });
    res.json({ success: true, deviceId, isActive, batteryLevel, updatedAt: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update device status', details: error });
  }
});

router.patch('/devices/:deviceId/emergency', async (req, res) => {
  try {
    const deviceId = parseInt(req.params.deviceId);
    const { emergencyMode } = req.body;
    console.log('[GEOLOCATION_API] Setting emergency mode:', { deviceId, emergencyMode });
    res.json({ success: true, deviceId, emergencyMode, updatedAt: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set emergency mode', details: error });
  }
});

// Safe Zone Management Routes
router.post('/safe-zones', async (req, res) => {
  try {
    const zoneData = req.body;
    console.log('[GEOLOCATION_API] Creating safe zone:', zoneData);
    const zone = await simpleGeolocationService.createSafeZone(zoneData);
    res.json(zone);
  } catch (error) {
    res.status(400).json({ error: 'Invalid safe zone data', details: error });
  }
});

router.get('/safe-zones/school/:schoolId', async (req, res) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    console.log('[GEOLOCATION_API] Getting safe zones for school:', schoolId);
    const zones = await simpleGeolocationService.getSafeZonesForParent(schoolId);
    res.json(zones);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch safe zones', details: error });
  }
});

router.patch('/safe-zones/:zoneId', async (req, res) => {
  try {
    const zoneId = parseInt(req.params.zoneId);
    const updates = req.body;
    console.log('[GEOLOCATION_API] Updating safe zone:', { zoneId, updates });
    const result = await simpleGeolocationService.updateSafeZone(zoneId, updates);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update safe zone', details: error });
  }
});

router.patch('/safe-zones/:zoneId/toggle', async (req, res) => {
  try {
    const zoneId = parseInt(req.params.zoneId);
    const { isActive } = req.body;
    console.log('[GEOLOCATION_API] Toggling safe zone:', { zoneId, isActive });
    const result = await simpleGeolocationService.updateSafeZone(zoneId, { isActive });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle safe zone', details: error });
  }
});

// Location Tracking Routes
router.post('/locations', async (req, res) => {
  try {
    const locationData = req.body;
    console.log('[GEOLOCATION_API] Recording location:', locationData);
    
    const mockResponse = {
      id: Date.now(),
      ...locationData,
      timestamp: new Date().toISOString(),
      recorded: true
    };
    
    res.json({ location: mockResponse, safeZones: [] });
  } catch (error) {
    res.status(400).json({ error: 'Failed to record location', details: error });
  }
});

router.get('/locations/device/:deviceId', async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const limit = parseInt(req.query.limit as string) || 50;
    console.log('[GEOLOCATION_API] Getting location history for device:', deviceId);
    const locations = await simpleGeolocationService.getLocationHistory(deviceId, limit);
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch locations', details: error });
  }
});

router.get('/locations/device/:deviceId/latest', async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    console.log('[GEOLOCATION_API] Getting latest location for device:', deviceId);
    const locations = await simpleGeolocationService.getLocationHistory(deviceId, 1);
    res.json(locations[0] || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch latest location', details: error });
  }
});

// Alert Management Routes
router.post('/alerts', async (req, res) => {
  try {
    const alertData = req.body;
    console.log('[GEOLOCATION_API] Creating alert:', alertData);
    const mockAlert = {
      id: Date.now(),
      ...alertData,
      timestamp: new Date().toISOString(),
      resolved: false
    };
    res.json(mockAlert);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create alert', details: error });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const schoolId = req.query.schoolId ? parseInt(req.query.schoolId as string) : undefined;
    console.log('[GEOLOCATION_API] Getting alerts for school:', schoolId);
    const alerts = await simpleGeolocationService.getAlertsForParent(schoolId || 1);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts', details: error });
  }
});

// Statistics Routes (Mock data for development)
router.get('/stats/school/:schoolId', async (req, res) => {
  try {
    const stats = {
      totalDevices: 12,
      activeDevices: 8,
      safeZonesCount: 3,
      activeAlerts: 2,
      studentsTracked: 8,
      emergencyContacts: 15,
      batteryLow: 1,
      lastUpdate: new Date().toISOString()
    };
    res.json(stats);
  } catch (error) {
    console.error('[GEOLOCATION_STATS] Error:', error);
    res.status(500).json({ error: 'Failed to fetch school statistics', details: error.message });
  }
});

// Emergency Contact Routes
router.post('/emergency-contacts', async (req, res) => {
  try {
    const contactData = req.body;
    console.log('[GEOLOCATION_API] Creating emergency contact:', contactData);
    const contact = await simpleGeolocationService.createEmergencyContact(contactData);
    res.json(contact);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create emergency contact', details: error });
  }
});

router.get('/emergency-contacts/student/:studentId', async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    console.log('[GEOLOCATION_API] Getting emergency contacts for student:', studentId);
    // Return mock data for demo
    const contacts = [
      {
        id: 1,
        studentId: studentId,
        name: 'Marie Dubois',
        relationship: 'parent',
        phone: '+237655123456',
        email: 'marie@email.com',
        priority: 1
      }
    ];
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch emergency contacts', details: error });
  }
});

router.patch('/alerts/:alertId/resolve', async (req, res) => {
  try {
    const alertId = parseInt(req.params.alertId);
    console.log('[GEOLOCATION_API] Resolving alert:', alertId);
    res.json({ success: true, alertId, resolvedAt: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve alert', details: error });
  }
});

// Parent-specific API endpoints
router.get('/parent/children', async (req, res) => {
  try {
    const parentId = (req.user as any)?.id || 1;
    console.log('[GEOLOCATION_API] Getting children for parent:', parentId);
    const children = await simpleGeolocationService.getChildrenForParent(parentId);
    res.json(children);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch children', details: error });
  }
});

router.get('/parent/safe-zones', async (req, res) => {
  try {
    const parentId = (req.user as any)?.id || 1;
    console.log('[GEOLOCATION_API] Getting safe zones for parent:', parentId);
    const safeZones = await simpleGeolocationService.getSafeZonesForParent(parentId);
    res.json(safeZones);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch safe zones', details: error });
  }
});

router.get('/parent/alerts', async (req, res) => {
  try {
    const parentId = (req.user as any)?.id || 1;
    console.log('[GEOLOCATION_API] Getting alerts for parent:', parentId);
    const alerts = await simpleGeolocationService.getAlertsForParent(parentId);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts', details: error });
  }
});

// Get location details for a specific child
router.get('/parent/children/:id/location', async (req, res) => {
  try {
    const childId = parseInt(req.params.id);
    console.log('[GEOLOCATION_API] Getting location for child:', childId);
    
    // Mock location data - in production this would come from the database
    const locationData = {
      location: {
        lat: 4.0511,
        lng: 9.7679,
        address: 'Douala, Cameroon',
        timestamp: new Date().toISOString(),
        accuracy: 10
      },
      childId,
      deviceStatus: 'active',
      batteryLevel: 85
    };
    
    res.json(locationData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch child location', details: error });
  }
});

// Get location details for a specific alert
router.get('/parent/alerts/:id/location', async (req, res) => {
  try {
    const alertId = parseInt(req.params.id);
    console.log('[GEOLOCATION_API] Getting location for alert:', alertId);
    
    // Mock alert location data - in production this would come from the database
    const alertLocationData = {
      location: {
        lat: 4.0511,
        lng: 9.7679,
        address: 'Douala, Cameroon',
        timestamp: new Date().toISOString()
      },
      alertId,
      alertType: 'zone_exit',
      severity: 'warning'
    };
    
    res.json(alertLocationData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alert location', details: error });
  }
});

// Acknowledge an alert
router.patch('/parent/alerts/:id/acknowledge', async (req, res) => {
  try {
    const alertId = parseInt(req.params.id);
    console.log('[GEOLOCATION_API] Acknowledging alert:', alertId);
    
    res.json({ 
      success: true, 
      alertId, 
      acknowledged: true,
      acknowledgedAt: new Date().toISOString() 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to acknowledge alert', details: error });
  }
});

// Resolve an alert (already exists but let's make sure the path is correct)
router.patch('/parent/alerts/:id/resolve', async (req, res) => {
  try {
    const alertId = parseInt(req.params.id);
    const { action, resolution, resolvedAt } = req.body;
    console.log('[GEOLOCATION_API] Resolving alert:', { alertId, action, resolution });
    
    res.json({ 
      success: true, 
      alertId, 
      resolved: true,
      resolvedAt: resolvedAt || new Date().toISOString() 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve alert', details: error });
  }
});

// Configure child tracking settings
router.post('/parent/children/:id/configure', async (req, res) => {
  try {
    const childId = parseInt(req.params.id);
    const configData = req.body;
    console.log('[GEOLOCATION_API] Configuring child tracking:', { childId, configData });
    
    res.json({ 
      success: true, 
      childId, 
      configuration: configData,
      updatedAt: new Date().toISOString() 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to configure child tracking', details: error });
  }
});

// Update safe zone (parent-specific endpoint)
router.patch('/parent/safe-zones/:id', async (req, res) => {
  try {
    const zoneId = parseInt(req.params.id);
    const { action, updates } = req.body;
    const parentId = (req.user as any)?.id || 1;
    
    console.log('[GEOLOCATION_API] Updating parent safe zone:', { zoneId, parentId, action, updates });
    
    // TODO: Add authorization check to verify zone belongs to this parent
    // For production: const zone = await simpleGeolocationService.getSafeZone(zoneId);
    // if (zone.parentId !== parentId) { return res.status(403).json({ error: 'Unauthorized' }); }
    
    // Use the existing service method
    const result = await simpleGeolocationService.updateSafeZone(zoneId, updates);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update safe zone', details: error });
  }
});

// Test zone exit endpoint
router.post('/test/zone-exit', async (req, res) => {
  try {
    const testData = req.body;
    console.log('[GEOLOCATION_API] Testing zone exit:', testData);
    const result = await simpleGeolocationService.testZoneExit(testData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to test zone exit', details: error });
  }
});

export default router;
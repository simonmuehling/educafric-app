import { Router } from 'express';
import { simpleGeolocationService } from '../services/simpleGeolocationService';
import { z } from 'zod';
// Authentication middleware (inline for now)
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};
import { z } from 'zod';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Device Management Routes
router.post('/devices', async (req, res) => {
  try {
    const deviceData = req.body;
    console.log('[GEOLOCATION_API] Creating device:', deviceData);
    const device = await simpleGeolocationService.createEmergencyContact(deviceData);
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
    const contactData = insertEmergencyContact.parse(req.body);
    const contact = await geolocationService.createEmergencyContact(contactData);
    res.json(contact);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create emergency contact', details: error });
  }
});

router.get('/emergency-contacts/student/:studentId', async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const contacts = await geolocationService.getEmergencyContacts(studentId);
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch emergency contacts', details: error });
  }
});

router.patch('/alerts/:alertId/resolve', async (req, res) => {
  try {
    const alertId = parseInt(req.params.alertId);
    const resolvedBy = req.user?.id || 1; // From authenticated user
    await geolocationService.resolveAlert(alertId, resolvedBy);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve alert', details: error });
  }
});

// Emergency Contacts Routes
router.post('/emergency-contacts', async (req, res) => {
  try {
    const contactData = insertEmergencyContact.parse(req.body);
    const contact = await geolocationService.createEmergencyContact(contactData);
    res.json(contact);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create emergency contact', details: error });
  }
});

router.get('/emergency-contacts/student/:studentId', async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const contacts = await geolocationService.getEmergencyContacts(studentId);
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch emergency contacts', details: error });
  }
});

// Analytics Routes
router.get('/stats/school/:schoolId', async (req, res) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    const stats = await geolocationService.getSchoolStats(schoolId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch school statistics', details: error });
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
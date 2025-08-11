import { Router } from 'express';
import { geolocationService } from '../services/geolocationService';
import { 
  insertGeolocationDevice, 
  insertSafeZone, 
  insertLocationTracking, 
  insertGeolocationAlert, 
  insertEmergencyContact 
} from '@shared/schema';
// Authentication middleware (inline for now)
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user) {
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
    const deviceData = insertGeolocationDevice.parse(req.body);
    const device = await geolocationService.createDevice(deviceData);
    res.json(device);
  } catch (error) {
    res.status(400).json({ error: 'Invalid device data', details: error });
  }
});

router.get('/devices/student/:studentId', async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const devices = await geolocationService.getDevicesByStudent(studentId);
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch devices', details: error });
  }
});

router.patch('/devices/:deviceId/status', async (req, res) => {
  try {
    const deviceId = parseInt(req.params.deviceId);
    const { isActive, batteryLevel } = req.body;
    await geolocationService.updateDeviceStatus(deviceId, isActive, batteryLevel);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update device status', details: error });
  }
});

router.patch('/devices/:deviceId/emergency', async (req, res) => {
  try {
    const deviceId = parseInt(req.params.deviceId);
    const { emergencyMode } = req.body;
    await geolocationService.setEmergencyMode(deviceId, emergencyMode);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set emergency mode', details: error });
  }
});

// Safe Zone Management Routes
router.post('/safe-zones', async (req, res) => {
  try {
    const zoneData = insertSafeZone.parse(req.body);
    const zone = await geolocationService.createSafeZone(zoneData);
    res.json(zone);
  } catch (error) {
    res.status(400).json({ error: 'Invalid safe zone data', details: error });
  }
});

router.get('/safe-zones/school/:schoolId', async (req, res) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    const zones = await geolocationService.getSafeZonesBySchool(schoolId);
    res.json(zones);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch safe zones', details: error });
  }
});

router.patch('/safe-zones/:zoneId', async (req, res) => {
  try {
    const zoneId = parseInt(req.params.zoneId);
    const updates = req.body;
    await geolocationService.updateSafeZone(zoneId, updates);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update safe zone', details: error });
  }
});

router.patch('/safe-zones/:zoneId/toggle', async (req, res) => {
  try {
    const zoneId = parseInt(req.params.zoneId);
    const { isActive } = req.body;
    await geolocationService.toggleSafeZone(zoneId, isActive);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle safe zone', details: error });
  }
});

// Location Tracking Routes
router.post('/locations', async (req, res) => {
  try {
    const locationData = insertLocationTracking.parse(req.body);
    const location = await geolocationService.recordLocation(locationData);
    
    // Check for safe zone violations
    const schoolId = req.body.schoolId || 1; // Should come from authenticated user context
    const safeZones = await geolocationService.checkSafeZone(
      parseFloat(locationData.latitude), 
      parseFloat(locationData.longitude), 
      schoolId
    );
    
    res.json({ location, safeZones });
  } catch (error) {
    res.status(400).json({ error: 'Failed to record location', details: error });
  }
});

router.get('/locations/device/:deviceId', async (req, res) => {
  try {
    const deviceId = parseInt(req.params.deviceId);
    const limit = parseInt(req.query.limit as string) || 50;
    const locations = await geolocationService.getRecentLocations(deviceId, limit);
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch locations', details: error });
  }
});

router.get('/locations/device/:deviceId/latest', async (req, res) => {
  try {
    const deviceId = parseInt(req.params.deviceId);
    const location = await geolocationService.getLastKnownLocation(deviceId);
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch latest location', details: error });
  }
});

// Alert Management Routes
router.post('/alerts', async (req, res) => {
  try {
    const alertData = insertGeolocationAlert.parse(req.body);
    const alert = await geolocationService.createAlert(alertData);
    res.json(alert);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create alert', details: error });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const schoolId = req.query.schoolId ? parseInt(req.query.schoolId as string) : undefined;
    const alerts = await geolocationService.getActiveAlerts(schoolId);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts', details: error });
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

// Demo Data Route
router.post('/seed-demo/:schoolId', async (req, res) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    await geolocationService.seedDemoData(schoolId);
    res.json({ success: true, message: 'Demo data seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to seed demo data', details: error });
  }
});

export default router;
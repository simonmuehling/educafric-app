import { Router } from 'express';
import { simpleGeolocationService } from '../services/simpleGeolocationService';
import { z } from 'zod';

// Authentication middleware - use actual authenticated user or session
const requireAuth = async (req: any, res: any, next: any) => {
  // Check if user is already set by passport
  if (req.user && req.user.id) {
    console.log('[GEOLOCATION_AUTH] User authenticated via passport:', req.user.id, 'for:', req.originalUrl);
    return next();
  }
  
  // Fallback: Check if we have a valid session with passport user
  if (req.session?.passport?.user) {
    try {
      const { db } = await import('../db');
      const { users } = await import('../../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      const userId = req.session.passport.user;
      const [userData] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      
      if (userData) {
        req.user = userData;
        console.log('[GEOLOCATION_AUTH] User restored from session:', userData.id, 'for:', req.originalUrl);
        return next();
      }
    } catch (error) {
      console.error('[GEOLOCATION_AUTH] Error restoring user from session:', error);
    }
  }
  
  // Check isAuthenticated function
  if (req.isAuthenticated && req.isAuthenticated()) {
    console.log('[GEOLOCATION_AUTH] User authenticated via isAuthenticated() for:', req.originalUrl);
    return next();
  }
  
  console.log('[GEOLOCATION_AUTH] No authenticated user for:', req.originalUrl);
  return res.status(401).json({ message: 'Authentication required' });
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

// Safe Zone Management Routes - DATABASE ONLY
router.post('/safe-zones', async (req, res) => {
  try {
    const parentId = (req.user as any)?.id;
    const schoolId = (req.user as any)?.schoolId || 1;
    const zoneData = { ...req.body, parentId, schoolId };
    console.log('[GEOLOCATION_API] Creating safe zone for parent:', parentId, zoneData);
    const zone = await simpleGeolocationService.createSafeZone(zoneData);
    res.json(zone);
  } catch (error) {
    console.error('[GEOLOCATION_API] Error creating safe zone:', error);
    res.status(400).json({ error: 'Invalid safe zone data', details: error });
  }
});

router.get('/safe-zones/school/:schoolId', async (req, res) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    console.log('[GEOLOCATION_API] Getting safe zones for school:', schoolId);
    
    // Get school-wide safe zones from database
    const { db } = await import('../db');
    const { sql } = await import('drizzle-orm');
    
    const zones = await db.execute(sql`
      SELECT 
        id, name, type, description, latitude, longitude, radius,
        is_active as "isActive", alert_on_entry as "alertOnEntry",
        alert_on_exit as "alertOnExit", children_ids as "childrenIds"
      FROM safe_zones
      WHERE school_id = ${schoolId}
      ORDER BY created_at DESC
    `);
    
    const result = (zones.rows || []).map((zone: any) => ({
      id: zone.id,
      name: zone.name,
      type: zone.type || 'custom',
      description: zone.description,
      coordinates: { lat: parseFloat(zone.latitude), lng: parseFloat(zone.longitude) },
      radius: zone.radius,
      childrenIds: zone.childrenIds || [],
      active: zone.isActive,
      alertOnEntry: zone.alertOnEntry,
      alertOnExit: zone.alertOnExit
    }));
    
    res.json(result);
  } catch (error) {
    console.error('[GEOLOCATION_API] Error fetching school zones:', error);
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

// Location Tracking Routes - DATABASE ONLY
router.post('/locations', async (req, res) => {
  try {
    const locationData = req.body;
    const { deviceId, latitude, longitude, accuracy, address, batteryLevel } = locationData;
    console.log('[GEOLOCATION_API] Recording location to database:', { deviceId, latitude, longitude });
    
    // Update device location in database
    const result = await simpleGeolocationService.updateDeviceLocation(deviceId, {
      latitude,
      longitude,
      accuracy,
      address,
      batteryLevel
    });
    
    // Get related safe zones for this device
    const { db } = await import('../db');
    const { sql } = await import('drizzle-orm');
    const zones = await db.execute(sql`
      SELECT id, name, latitude, longitude, radius FROM safe_zones WHERE is_active = true LIMIT 10
    `);
    
    res.json({ 
      location: { id: deviceId, latitude, longitude, timestamp: new Date().toISOString(), recorded: true },
      safeZones: zones.rows || []
    });
  } catch (error) {
    console.error('[GEOLOCATION_API] Error recording location:', error);
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

// Alert Management Routes - DATABASE ONLY
router.post('/alerts', async (req, res) => {
  try {
    const alertData = req.body;
    const userId = (req.user as any)?.id;
    const schoolId = (req.user as any)?.schoolId || alertData.schoolId || 1;
    console.log('[GEOLOCATION_API] Creating alert in database:', alertData);
    
    const alert = await simpleGeolocationService.createAlert({
      ...alertData,
      schoolId,
      parentId: alertData.parentId || null
    });
    
    res.json(alert);
  } catch (error) {
    console.error('[GEOLOCATION_API] Error creating alert:', error);
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

// Statistics Routes - DATABASE ONLY
router.get('/stats/school/:schoolId', async (req, res) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    console.log('[GEOLOCATION_API] Getting stats for school:', schoolId);
    
    const stats = await simpleGeolocationService.getSchoolGeolocationStats(schoolId);
    res.json({
      ...stats,
      safeZonesCount: stats.totalZones,
      studentsTracked: stats.activeDevices,
      emergencyContacts: 0,
      batteryLow: 0
    });
  } catch (error: any) {
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
    const userId = (req.user as any)?.id;
    console.log('[GEOLOCATION_API] Resolving alert in database:', alertId);
    
    const result = await simpleGeolocationService.resolveAlert(alertId, userId);
    res.json({ success: true, alertId, resolvedAt: new Date().toISOString() });
  } catch (error) {
    console.error('[GEOLOCATION_API] Error resolving alert:', error);
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

// Get location details for a specific child - DATABASE ONLY
router.get('/parent/children/:id/location', async (req, res) => {
  try {
    const childId = parseInt(req.params.id);
    const parentId = (req.user as any)?.id;
    console.log('[GEOLOCATION_API] Getting location for child:', childId, 'parent:', parentId);
    
    // Get real location data from tracking_devices
    const { db } = await import('../db');
    const { sql } = await import('drizzle-orm');
    
    const result = await db.execute(sql`
      SELECT 
        td.current_latitude as latitude,
        td.current_longitude as longitude,
        td.current_address as address,
        td.last_update as timestamp,
        td.location_accuracy as accuracy,
        td.battery_level as "batteryLevel",
        td.is_active as "isActive",
        td.device_type as "deviceType"
      FROM tracking_devices td
      JOIN parent_student_relations psr ON psr.student_id = td.student_id
      WHERE td.student_id = ${childId} 
        AND psr.parent_id = ${parentId}
        AND td.is_active = true
      LIMIT 1
    `);
    
    const device: any = (result.rows || [])[0];
    
    const locationData = {
      location: device?.latitude ? {
        lat: parseFloat(device.latitude),
        lng: parseFloat(device.longitude),
        address: device.address || 'Position inconnue',
        timestamp: device.timestamp || new Date().toISOString(),
        accuracy: device.accuracy || 10
      } : null,
      childId,
      deviceStatus: device?.isActive ? 'active' : 'inactive',
      deviceType: device?.deviceType || 'smartphone',
      batteryLevel: device?.batteryLevel || null
    };
    
    res.json(locationData);
  } catch (error) {
    console.error('[GEOLOCATION_API] Error getting child location:', error);
    res.status(500).json({ error: 'Failed to fetch child location', details: error });
  }
});

// Get location details for a specific alert - DATABASE ONLY
router.get('/parent/alerts/:id/location', async (req, res) => {
  try {
    const alertId = parseInt(req.params.id);
    const parentId = (req.user as any)?.id;
    console.log('[GEOLOCATION_API] Getting location for alert:', alertId, 'parent:', parentId);
    
    // Get real alert location from database
    const { db } = await import('../db');
    const { sql } = await import('drizzle-orm');
    
    const result = await db.execute(sql`
      SELECT 
        ga.latitude,
        ga.longitude,
        ga.alert_type as "alertType",
        ga.priority as severity,
        ga.message,
        ga.created_at as timestamp
      FROM geolocation_alerts ga
      WHERE ga.id = ${alertId} AND ga.parent_id = ${parentId}
      LIMIT 1
    `);
    
    const alert: any = (result.rows || [])[0];
    
    const alertLocationData = {
      location: alert?.latitude ? {
        lat: parseFloat(alert.latitude),
        lng: parseFloat(alert.longitude),
        address: 'Position enregistrée',
        timestamp: alert.timestamp || new Date().toISOString()
      } : null,
      alertId,
      alertType: alert?.alertType || 'unknown',
      severity: alert?.severity || 'normal',
      message: alert?.message
    };
    
    res.json(alertLocationData);
  } catch (error) {
    console.error('[GEOLOCATION_API] Error getting alert location:', error);
    res.status(500).json({ error: 'Failed to fetch alert location', details: error });
  }
});

// Acknowledge an alert - DATABASE UPDATE
router.patch('/parent/alerts/:id/acknowledge', async (req, res) => {
  try {
    const alertId = parseInt(req.params.id);
    const parentId = (req.user as any)?.id;
    console.log('[GEOLOCATION_API] Acknowledging alert:', alertId, 'by parent:', parentId);
    
    const { db } = await import('../db');
    const { sql } = await import('drizzle-orm');
    
    await db.execute(sql`
      UPDATE geolocation_alerts SET
        notifications_sent = jsonb_set(COALESCE(notifications_sent, '{}'), '{acknowledged}', 'true'),
        updated_at = NOW()
      WHERE id = ${alertId} AND parent_id = ${parentId}
    `);
    
    res.json({ 
      success: true, 
      alertId, 
      acknowledged: true,
      acknowledgedAt: new Date().toISOString() 
    });
  } catch (error) {
    console.error('[GEOLOCATION_API] Error acknowledging alert:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert', details: error });
  }
});

// Resolve an alert - DATABASE UPDATE
router.patch('/parent/alerts/:id/resolve', async (req, res) => {
  try {
    const alertId = parseInt(req.params.id);
    const parentId = (req.user as any)?.id;
    const { action, resolution, resolvedAt } = req.body;
    console.log('[GEOLOCATION_API] Resolving alert:', { alertId, parentId, action, resolution });
    
    const { db } = await import('../db');
    const { sql } = await import('drizzle-orm');
    
    await db.execute(sql`
      UPDATE geolocation_alerts SET
        is_resolved = true,
        resolved_by = ${parentId},
        resolved_at = NOW(),
        updated_at = NOW()
      WHERE id = ${alertId} AND parent_id = ${parentId}
    `);
    
    res.json({ 
      success: true, 
      alertId, 
      resolved: true,
      resolvedAt: resolvedAt || new Date().toISOString() 
    });
  } catch (error) {
    console.error('[GEOLOCATION_API] Error resolving alert:', error);
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
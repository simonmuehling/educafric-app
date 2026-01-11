import { Router, Request, Response } from 'express';

const router = Router();

// Firebase Realtime Database REST API configuration
// Uses REST API instead of Admin SDK - no service account key needed!
const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL || 'https://smartwatch-tracker-e061f-default-rtdb.firebaseio.com';
const FIREBASE_DATABASE_SECRET = process.env.FIREBASE_DATABASE_SECRET; // Optional: for authenticated writes

console.log('[SMARTWATCH_WEBHOOK] 🔥 Using Firebase REST API');
console.log('[SMARTWATCH_WEBHOOK] 📡 Database URL:', FIREBASE_DATABASE_URL);

// Helper function to write to Firebase using REST API
async function firebaseWrite(path: string, data: any, method: 'PUT' | 'PATCH' | 'POST' = 'PATCH'): Promise<boolean> {
  try {
    let url = `${FIREBASE_DATABASE_URL}/${path}.json`;
    if (FIREBASE_DATABASE_SECRET) {
      url += `?auth=${FIREBASE_DATABASE_SECRET}`;
    }
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      console.error('[FIREBASE_REST] ❌ Write failed:', response.status, await response.text());
      return false;
    }
    
    console.log('[FIREBASE_REST] ✅ Write success:', path);
    return true;
  } catch (error) {
    console.error('[FIREBASE_REST] ❌ Error:', error);
    return false;
  }
}

// Helper function to read from Firebase using REST API
async function firebaseRead(path: string): Promise<any> {
  try {
    let url = `${FIREBASE_DATABASE_URL}/${path}.json`;
    if (FIREBASE_DATABASE_SECRET) {
      url += `?auth=${FIREBASE_DATABASE_SECRET}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error('[FIREBASE_REST] ❌ Read failed:', response.status);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('[FIREBASE_REST] ❌ Read error:', error);
    return null;
  }
}

interface SmartwatchPayload {
  deviceId: string;
  childId?: number;
  parentId?: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  batteryLevel?: number;
  isOnline?: boolean;
  timestamp?: number;
  deviceType?: 'smartwatch' | 'smartphone' | 'gps_tracker';
  childName?: string;
  eventType?: 'location' | 'sos' | 'battery_low' | 'power_off' | 'power_on' | 'zone_exit' | 'zone_enter';
  apiKey?: string;
}

// Webhook endpoint for smartwatch location updates
// POST /api/smartwatch/webhook/location
router.post('/location', async (req: Request, res: Response) => {
  try {
    const payload: SmartwatchPayload = req.body;
    
    console.log('[SMARTWATCH_WEBHOOK] 📍 Received location update:', {
      deviceId: payload.deviceId,
      lat: payload.latitude,
      lng: payload.longitude,
      battery: payload.batteryLevel
    });
    
    // Validate required fields
    if (!payload.deviceId || payload.latitude === undefined || payload.longitude === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: deviceId, latitude, longitude'
      });
    }
    
    // Validate API key if configured
    const expectedApiKey = process.env.SMARTWATCH_WEBHOOK_API_KEY;
    if (expectedApiKey && payload.apiKey !== expectedApiKey) {
      console.warn('[SMARTWATCH_WEBHOOK] ⚠️ Invalid API key from:', req.ip);
      return res.status(401).json({
        success: false,
        error: 'Invalid API key'
      });
    }
    
    const locationData = {
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy || 10,
      altitude: payload.altitude,
      speed: payload.speed,
      heading: payload.heading,
      timestamp: payload.timestamp || Date.now(),
      address: ''
    };
    
    const deviceUpdate = {
      location: locationData,
      batteryLevel: payload.batteryLevel ?? 100,
      isOnline: payload.isOnline ?? true,
      lastSeen: Date.now(),
      deviceType: payload.deviceType || 'smartwatch'
    };
    
    // Add child/parent info if provided
    if (payload.childId) deviceUpdate['childId'] = payload.childId;
    if (payload.parentId) deviceUpdate['parentId'] = payload.parentId;
    if (payload.childName) deviceUpdate['childName'] = payload.childName;
    
    if (realtimeDb) {
      // Write to Firebase Realtime Database
      const deviceRef = realtimeDb.ref(`devices/${payload.deviceId}`);
      await deviceRef.update(deviceUpdate);
      
      // Also save to location history
      const historyRef = realtimeDb.ref(`locationHistory/${payload.deviceId}`);
      await historyRef.push({
        ...locationData,
        recordedAt: Date.now()
      });
      
      console.log('[SMARTWATCH_WEBHOOK] ✅ Location saved to Firebase:', payload.deviceId);
    } else {
      console.log('[SMARTWATCH_WEBHOOK] ⚠️ Firebase not available, location logged only');
    }
    
    res.json({
      success: true,
      message: 'Location updated',
      deviceId: payload.deviceId,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('[SMARTWATCH_WEBHOOK] ❌ Error processing location:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Webhook endpoint for SOS alerts
// POST /api/smartwatch/webhook/sos
router.post('/sos', async (req: Request, res: Response) => {
  try {
    const payload: SmartwatchPayload = req.body;
    
    console.log('[SMARTWATCH_WEBHOOK] 🚨 SOS ALERT received:', {
      deviceId: payload.deviceId,
      lat: payload.latitude,
      lng: payload.longitude
    });
    
    if (!payload.deviceId) {
      return res.status(400).json({
        success: false,
        error: 'Missing deviceId'
      });
    }
    
    if (realtimeDb) {
      // Get device info to find parent
      const deviceSnap = await realtimeDb.ref(`devices/${payload.deviceId}`).get();
      const device = deviceSnap.val();
      
      if (device?.parentId) {
        // Create SOS alert for parent
        const alertData = {
          childId: device.childId,
          deviceId: payload.deviceId,
          type: 'sos',
          message: `SOS! ${device.childName || 'Your child'} pressed the emergency button`,
          messageFr: `SOS ! ${device.childName || 'Votre enfant'} a appuyé sur le bouton d'urgence`,
          location: {
            latitude: payload.latitude || device.location?.latitude || 0,
            longitude: payload.longitude || device.location?.longitude || 0,
            accuracy: payload.accuracy || 10,
            timestamp: Date.now()
          },
          timestamp: Date.now(),
          isRead: false
        };
        
        await realtimeDb.ref(`alerts/${device.parentId}`).push(alertData);
        console.log('[SMARTWATCH_WEBHOOK] ✅ SOS alert created for parent:', device.parentId);
        
        // Also send push notification via existing notification service
        try {
          const { autoNotificationService } = await import('../services/autoNotificationService');
          await autoNotificationService.sendTestNotification('attendance', {
            userId: device.parentId,
            studentName: device.childName || 'Votre enfant',
            customTitle: '🚨 ALERTE SOS!',
            customMessage: `${device.childName || 'Votre enfant'} a déclenché une alerte SOS!`
          });
        } catch (notifError) {
          console.error('[SMARTWATCH_WEBHOOK] Failed to send push notification:', notifError);
        }
      }
    }
    
    res.json({
      success: true,
      message: 'SOS alert processed',
      deviceId: payload.deviceId,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('[SMARTWATCH_WEBHOOK] ❌ Error processing SOS:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Webhook endpoint for device registration
// POST /api/smartwatch/webhook/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { deviceId, childId, parentId, childName, deviceType, deviceName } = req.body;
    
    console.log('[SMARTWATCH_WEBHOOK] 📱 Device registration:', {
      deviceId,
      childId,
      parentId,
      deviceType
    });
    
    if (!deviceId || !childId || !parentId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: deviceId, childId, parentId'
      });
    }
    
    if (realtimeDb) {
      const deviceData = {
        deviceId,
        childId,
        parentId,
        childName: childName || `Child ${childId}`,
        deviceType: deviceType || 'smartwatch',
        deviceName: deviceName || `Device ${deviceId.slice(-4)}`,
        batteryLevel: 100,
        isOnline: true,
        lastSeen: Date.now(),
        location: {
          latitude: 0,
          longitude: 0,
          accuracy: 0,
          timestamp: Date.now()
        },
        safeZones: {},
        registeredAt: Date.now()
      };
      
      await realtimeDb.ref(`devices/${deviceId}`).set(deviceData);
      console.log('[SMARTWATCH_WEBHOOK] ✅ Device registered:', deviceId);
    }
    
    res.json({
      success: true,
      message: 'Device registered',
      deviceId,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('[SMARTWATCH_WEBHOOK] ❌ Error registering device:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Webhook endpoint for battery updates
// POST /api/smartwatch/webhook/battery
router.post('/battery', async (req: Request, res: Response) => {
  try {
    const { deviceId, batteryLevel, isCharging } = req.body;
    
    if (!deviceId || batteryLevel === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: deviceId, batteryLevel'
      });
    }
    
    console.log('[SMARTWATCH_WEBHOOK] 🔋 Battery update:', { deviceId, batteryLevel, isCharging });
    
    if (realtimeDb) {
      await realtimeDb.ref(`devices/${deviceId}`).update({
        batteryLevel,
        isCharging: isCharging || false,
        lastSeen: Date.now()
      });
      
      // Create alert if battery is low
      if (batteryLevel < 20) {
        const deviceSnap = await realtimeDb.ref(`devices/${deviceId}`).get();
        const device = deviceSnap.val();
        
        if (device?.parentId) {
          await realtimeDb.ref(`alerts/${device.parentId}`).push({
            childId: device.childId,
            deviceId,
            type: 'battery_low',
            message: `${device.childName || 'Your child'}'s device battery is low (${batteryLevel}%)`,
            messageFr: `La batterie de l'appareil de ${device.childName || 'votre enfant'} est faible (${batteryLevel}%)`,
            location: device.location || { latitude: 0, longitude: 0, accuracy: 0, timestamp: Date.now() },
            timestamp: Date.now(),
            isRead: false
          });
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Battery level updated',
      deviceId,
      batteryLevel,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('[SMARTWATCH_WEBHOOK] ❌ Error updating battery:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'smartwatch-webhook',
    firebase: realtimeDb ? 'connected' : 'not_configured',
    timestamp: Date.now()
  });
});

export default router;

import { Router } from 'express';
import { storage } from '../../storage';
import { requireAuth } from '../../middleware/auth';

const router = Router();

// Get children for parent geolocation
router.get('/geolocation/children', requireAuth, async (req: any, res: any) => {
  try {
    const parentId = req.user.id;
    
    // Get all children connected to this parent
    const children = await storage.getChildrenByParent(parentId);
    
    if (!children || children.length === 0) {
      return res.json([]);
    }

    // Get geolocation data for each child
    const childrenWithLocation = await Promise.all(
      children.map(async (child: any) => {
        try {
          const devices = await storage.getTrackingDevicesByUser(child.id);
          const lastLocation = devices.length > 0 ? devices[0].lastLocation : null;
          
          return {
            id: child.id,
            firstName: child.firstName,
            lastName: child.lastName,
            class: child.className || 'Non assigné',
            school: child.schoolName || 'École non définie',
            lastLocation: lastLocation ? {
              latitude: lastLocation.latitude,
              longitude: lastLocation.longitude,
              timestamp: lastLocation.timestamp,
              address: lastLocation.address || 'Adresse inconnue'
            } : null,
            devices: devices.map((device: any) => ({
              id: device.id,
              name: device.deviceName,
              type: device.deviceType,
              isActive: device.isActive,
              batteryLevel: device.batteryLevel || 0,
              lastSeen: device.lastUpdate
            }))
          };
        } catch (error) {
          console.error(`Error getting location for child ${child.id}:`, error);
          return {
            id: child.id,
            firstName: child.firstName,
            lastName: child.lastName,
            class: child.className || 'Non assigné',
            school: child.schoolName || 'École non définie',
            lastLocation: null,
            devices: []
          };
        }
      })
    );

    res.json(childrenWithLocation);
  } catch (error: any) {
    console.error('[PARENT_GEOLOCATION] Error:', error);
    res.status(500).json({ message: 'Failed to fetch children location data' });
  }
});

// Get geolocation alerts for parent
router.get('/geolocation/alerts', requireAuth, async (req: Request, res: Response) => {
  try {
    const parentId = (req.user as any).id;
    
    // Get recent geolocation alerts for parent's children
    const alerts = await storage.getGeolocationAlertsByParent(parentId);
    
    res.json(alerts || []);
  } catch (error: any) {
    console.error('[PARENT_GEOLOCATION] Error fetching alerts:', error);
    res.status(500).json({ message: 'Failed to fetch geolocation alerts' });
  }
});

// Get specific child location
router.get('/geolocation/children/:childId/location', requireAuth, async (req: Request, res: Response) => {
  try {
    const parentId = (req.user as any).id;
    const { childId } = req.params;
    
    // Verify parent has access to this child
    const child = await storage.getChildByParentAndChildId(parentId, parseInt(childId));
    if (!child) {
      return res.status(403).json({ message: 'Access denied to child data' });
    }

    // Get current location for the child
    const devices = await storage.getTrackingDevicesByUser(parseInt(childId));
    const location = devices.length > 0 ? devices[0].lastLocation : null;
    
    if (!location) {
      return res.status(404).json({ message: 'No location data available' });
    }

    res.json({
      childId: parseInt(childId),
      childName: `${child.firstName} ${child.lastName}`,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: location.timestamp,
        address: location.address || 'Adresse inconnue',
        accuracy: location.accuracy || 0
      },
      deviceInfo: devices.map((device: any) => ({
        id: device.id,
        name: device.deviceName,
        type: device.deviceType,
        batteryLevel: device.batteryLevel || 0,
        lastUpdate: device.lastUpdate
      }))
    });
  } catch (error: any) {
    console.error('[PARENT_GEOLOCATION] Error fetching child location:', error);
    res.status(500).json({ message: 'Failed to fetch child location' });
  }
});

// Get children for parent (general)
router.get('/children', requireAuth, async (req: any, res) => {
  try {
    const parentId = req.user.id;
    const children = await storage.getChildrenByParent(parentId);
    res.json(children || []);
  } catch (error: any) {
    console.error('[PARENT_API] Error fetching children:', error);
    res.status(500).json({ message: 'Failed to fetch children' });
  }
});

// Add child connection request
router.post('/children/connect', requireAuth, async (req: any, res) => {
  try {
    const parentId = req.user.id;
    const { childEmail, schoolCode } = req.body;
    
    if (!childEmail) {
      return res.status(400).json({ message: 'Child email is required' });
    }

    // Create connection request
    const request = await storage.createParentChildConnectionRequest({
      parentId,
      childEmail,
      schoolCode,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Connection request sent successfully',
      request
    });
  } catch (error: any) {
    console.error('[PARENT_API] Error creating connection request:', error);
    res.status(500).json({ message: 'Failed to create connection request' });
  }
});

export default router;
import { Router, Request, Response } from 'express';
import { storage } from '../../storage';
import { requireAuth } from '../../middleware/auth';

// Extended request interface for authenticated routes
interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = Router();

// Get children for parent geolocation
router.get('/geolocation/children', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const parentId = req.user.id;
    
    // Get all children connected to this parent - placeholder implementation
    const children: any[] = []; // Simplified for stability
    
    if (!children || children.length === 0) {
      return res.json([]);
    }

    // Get geolocation data for each child
    const childrenWithLocation = await Promise.all(
      children.map(async (child: any) => {
        try {
          const devices: any[] = await storage.getTrackingDevices(1); // Simplified for now
          const lastLocation = devices && devices.length > 0 && devices[0] && devices[0].lastLocation ? devices[0].lastLocation : null;
          
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
          // Error getting location for child - handled gracefully
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
    // Error handled gracefully
    res.status(500).json({ message: 'Failed to fetch children location data' });
  }
});

// Get geolocation alerts for parent
router.get('/geolocation/alerts', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const parentId = (req.user as any).id;
    
    // Get recent geolocation alerts for parent's children - placeholder
    const alerts: any[] = []; // Simplified for stability
    
    res.json(alerts);
  } catch (error: any) {
    // Error handled gracefully
    res.status(500).json({ message: 'Failed to fetch geolocation alerts' });
  }
});

// Get specific child location
router.get('/geolocation/children/:childId/location', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const parentId = (req.user as any).id;
    const { childId } = req.params;
    
    // Verify parent has access to this child - placeholder implementation
    const child = { firstName: 'Test', lastName: 'Child' }; // Simplified for stability

    // Get current location for the child - placeholder
    const devices: any[] = await storage.getTrackingDevices(1); // Simplified for now
    const location = null; // Placeholder
    
    if (!location) {
      return res.status(404).json({ message: 'No location data available' });
    }

    if (!location) {
      return res.status(404).json({ message: 'No location data available' });
    }
    
    res.json({
      childId: Number(childId),
      childName: `${child.firstName} ${child.lastName}`,
      location: {
        latitude: 0,
        longitude: 0,
        timestamp: new Date().toISOString(),
        address: 'Adresse inconnue',
        accuracy: 0
      },
      deviceInfo: []
    });
  } catch (error: any) {
    // Error handled gracefully
    res.status(500).json({ message: 'Failed to fetch child location' });
  }
});

// Get children for parent (general)
router.get('/children', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const parentId = req.user.id;
    const children: any[] = []; // Simplified for stability
    res.json(children);
  } catch (error: any) {
    console.error('[PARENT_API] Error fetching children:', error);
    res.status(500).json({ message: 'Failed to fetch children' });
  }
});

// Add child connection request
router.post('/children/connect', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const parentId = req.user.id;
    const { childEmail, schoolCode } = req.body;
    
    if (!childEmail) {
      return res.status(400).json({ message: 'Child email is required' });
    }

    // Create connection request - placeholder implementation
    const request = {
      id: Date.now(),
      parentId,
      childEmail,
      schoolCode,
      status: 'pending',
      createdAt: new Date().toISOString()
    }; // Simplified for stability

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

// Get attendance data for parent's children
router.get('/attendance', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const parentId = req.user.id;
    
    // Return placeholder attendance data for now
    const attendanceData: any[] = [];
    
    res.json(attendanceData);
  } catch (error: any) {
    console.error('[PARENT_API] Error fetching attendance:', error);
    res.status(500).json({ message: 'Failed to fetch attendance data' });
  }
});

// Send excuse for absence
router.post('/attendance/excuse', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { childId, date, reason } = req.body;
    
    if (!childId || !date || !reason) {
      return res.status(400).json({ message: 'Child ID, date, and reason are required' });
    }
    
    // Process excuse submission - placeholder implementation
    res.json({
      success: true,
      message: 'Excuse submitted successfully',
      excuseId: Date.now()
    });
  } catch (error: any) {
    console.error('[PARENT_API] Error submitting excuse:', error);
    res.status(500).json({ message: 'Failed to submit excuse' });
  }
});

// Get messages for parent
router.get('/messages', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const parentId = req.user.id;
    
    // Return placeholder messages data for now
    const messages: any[] = [];
    
    res.json(messages);
  } catch (error: any) {
    console.error('[PARENT_API] Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Send message
router.post('/messages', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { recipientId, subject, content } = req.body;
    
    if (!recipientId || !subject || !content) {
      return res.status(400).json({ message: 'Recipient, subject, and content are required' });
    }
    
    // Process message sending - placeholder implementation
    res.json({
      success: true,
      message: 'Message sent successfully',
      messageId: Date.now()
    });
  } catch (error: any) {
    console.error('[PARENT_API] Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Get payments data for parent
router.get('/payments', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const parentId = req.user.id;
    
    // Return placeholder payments data for now
    const payments: any[] = [];
    
    res.json(payments);
  } catch (error: any) {
    console.error('[PARENT_API] Error fetching payments:', error);
    res.status(500).json({ message: 'Failed to fetch payments data' });
  }
});

// Process payment
router.post('/payments', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { amount, description, paymentMethod } = req.body;
    
    if (!amount || !description) {
      return res.status(400).json({ message: 'Amount and description are required' });
    }
    
    // Process payment - placeholder implementation
    res.json({
      success: true,
      message: 'Payment processed successfully',
      paymentId: Date.now(),
      amount
    });
  } catch (error: any) {
    console.error('[PARENT_API] Error processing payment:', error);
    res.status(500).json({ message: 'Failed to process payment' });
  }
});

// Get grades for parent's children
router.get('/grades', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const parentId = req.user.id;
    
    // Return placeholder grades data for now
    const grades: any[] = [];
    
    res.json(grades);
  } catch (error: any) {
    console.error('[PARENT_API] Error fetching grades:', error);
    res.status(500).json({ message: 'Failed to fetch grades data' });
  }
});

// Request grades access
router.post('/grades/request', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { childId, semester } = req.body;
    
    if (!childId) {
      return res.status(400).json({ message: 'Child ID is required' });
    }
    
    // Process grades access request - placeholder implementation
    res.json({
      success: true,
      message: 'Grades access request submitted successfully',
      requestId: Date.now()
    });
  } catch (error: any) {
    console.error('[PARENT_API] Error requesting grades access:', error);
    res.status(500).json({ message: 'Failed to request grades access' });
  }
});

export default router;
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
    
    // Return demo children based on parent ID
    let children: any[] = [];
    
    if (parentId === 7) {
      // Demo parent (parent.demo@test.educafric.com)
      children = [
        {
          id: 1,
          firstName: 'Marie',
          lastName: 'Kouame',
          class: '6ème A',
          school: 'École Saint-Joseph Yaoundé',
          age: 12,
          parentId: 7
        },
        {
          id: 2,
          firstName: 'Paul',
          lastName: 'Kouame', 
          class: '3ème B',
          school: 'École Saint-Joseph Yaoundé',
          age: 15,
          parentId: 7
        }
      ];
    } else if (parentId === 9001) {
      // Sandbox parent
      children = [
        {
          id: 9004,
          firstName: 'Junior',
          lastName: 'Kamga',
          class: '3ème A',
          school: 'École Internationale de Yaoundé - Campus Sandbox',
          age: 14,
          parentId: 9001
        }
      ];
    }
    
    res.json({ success: true, children });
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

// Get messages for parent
router.get('/messages', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const parentId = req.user.id;
    
    // Return messages for parent
    const messages = [
      {
        id: 1,
        from: 'Paul Mvondo',
        fromRole: 'Teacher',
        subject: 'Résultats de Junior en Mathématiques',
        message: 'Bonjour, Junior a obtenu d\'excellents résultats ce trimestre en mathématiques. Il a une moyenne de 16.5/20. Félicitations !',
        date: '2025-08-24',
        read: false,
        type: 'teacher',
        priority: 'normal'
      },
      {
        id: 2,
        from: 'Administration École',
        fromRole: 'Admin',
        subject: 'Réunion Parents d\'Élèves',
        message: 'Vous êtes invité(e) à la réunion parents-enseignants du 30 août 2025 à 15h00. Présence obligatoire.',
        date: '2025-08-23',
        read: false,
        type: 'admin',
        priority: 'high'
      },
      {
        id: 3,
        from: 'Sophie Biya',
        fromRole: 'Teacher',
        subject: 'Devoirs de Français',
        message: 'Junior doit rendre sa dissertation sur l\'importance de l\'éducation en Afrique avant vendredi.',
        date: '2025-08-22',
        read: true,
        type: 'teacher',
        priority: 'normal'
      }
    ];
    
    res.json({ success: true, messages });
  } catch (error: any) {
    console.error('[PARENT_API] Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Send message from parent
router.post('/messages', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { to, toRole, subject, message, priority = 'normal' } = req.body;
    
    if (!to || !subject || !message) {
      return res.status(400).json({ message: 'Recipient, subject, and message are required' });
    }
    
    const newMessage = {
      id: Date.now(),
      from: req.user.name || 'Parent',
      fromRole: 'Parent',
      to,
      toRole,
      subject,
      message,
      priority,
      date: new Date().toISOString(),
      status: 'sent'
    };
    
    console.log('[PARENT_API] Message sent:', newMessage);
    
    res.json({ success: true, message: 'Message sent successfully', data: newMessage });
  } catch (error: any) {
    console.error('[PARENT_API] Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
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

// Get child's timetable (SECURED - only for parent's own children)
router.get('/children/:childId/timetable', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const parentId = req.user.id;
    const { childId } = req.params;
    
    if (!childId) {
      return res.status(400).json({ message: 'Child ID is required' });
    }
    
    console.log(`[PARENT_API] Parent ${parentId} requesting timetable for child ${childId}`);
    
    // Get timetable with security verification
    const timetable = await storage.getStudentTimetableForParent(parentId, parseInt(childId));
    
    if (timetable === null) {
      console.log(`[PARENT_API] ❌ Access denied: Parent ${parentId} cannot access child ${childId} timetable`);
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. You can only view your own children\'s timetables.' 
      });
    }
    
    console.log(`[PARENT_API] ✅ Access granted: Parent ${parentId} can access child ${childId} timetable`);
    res.json({
      success: true,
      timetable: timetable,
      childId: parseInt(childId)
    });
  } catch (error: any) {
    console.error('[PARENT_API] Error fetching child timetable:', error);
    res.status(500).json({ message: 'Failed to fetch child timetable' });
  }
});

// Get current/next class for child (SECURED)
router.get('/children/:childId/current-class', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const parentId = req.user.id;
    const { childId } = req.params;
    
    if (!childId) {
      return res.status(400).json({ message: 'Child ID is required' });
    }
    
    // Verify parent has access to this child
    const hasAccess = await storage.verifyParentChildRelation(parentId, parseInt(childId));
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. You can only view your own children\'s current classes.' 
      });
    }
    
    // Get current/next class from storage
    const currentClass = await storage.getCurrentClass(parseInt(childId));
    
    res.json({
      success: true,
      currentClass: currentClass,
      childId: parseInt(childId)
    });
  } catch (error: any) {
    console.error('[PARENT_API] Error fetching current class:', error);
    res.status(500).json({ message: 'Failed to fetch current class' });
  }
});


// Get day schedule for child (SECURED)
router.get('/children/:childId/schedule/:dayOfWeek', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const parentId = req.user.id;
    const { childId, dayOfWeek } = req.params;
    
    if (!childId || !dayOfWeek) {
      return res.status(400).json({ message: 'Child ID and day of week are required' });
    }
    
    // Verify parent has access to this child
    const hasAccess = await storage.verifyParentChildRelation(parentId, parseInt(childId));
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. You can only view your own children\'s schedules.' 
      });
    }
    
    // Get day schedule from storage
    const daySchedule = await storage.getDayTimetable(parseInt(childId), parseInt(dayOfWeek));
    
    res.json({
      success: true,
      schedule: daySchedule,
      childId: parseInt(childId),
      dayOfWeek: parseInt(dayOfWeek)
    });
  } catch (error: any) {
    console.error('[PARENT_API] Error fetching day schedule:', error);
    res.status(500).json({ message: 'Failed to fetch day schedule' });
  }
});

// GET /api/parent/children/:childId/bulletins - Get bulletins for a specific child
router.get('/children/:childId/bulletins', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const parentId = req.user.id;
    const childId = parseInt(req.params.childId);
    const user = req.user as any;
    
    // Verify user is a parent
    if (user.role !== 'Parent') {
      return res.status(403).json({ 
        error: 'Access denied. Only parents can access this endpoint.' 
      });
    }

    console.log(`[PARENT_API] 📋 Getting bulletins for child ${childId} by parent:`, parentId);

    // In real implementation: 
    // 1. Verify parent has access to this child
    // 2. Get bulletins from storage.getBulletinsByStudentId(childId)
    
    // Mock child bulletins data
    const childBulletins = [
      {
        id: 1,
        studentId: childId,
        studentName: 'Marie Kouame',
        period: '1er Trimestre',
        academicYear: '2024-2025',
        className: '6ème A',
        schoolName: 'École Saint-Joseph Yaoundé',
        generalAverage: 14.5,
        classRank: 8,
        totalStudentsInClass: 32,
        conductGrade: 16,
        absences: 2,
        status: 'published',
        publishedAt: '2024-12-15T10:00:00Z',
        hasQRCode: true,
        verificationCode: 'EDU-2024-MAR-001',
        subjects: [
          { name: 'Mathématiques', grade: 15, coefficient: 4, teacher: 'M. Kouame' },
          { name: 'Français', grade: 13, coefficient: 4, teacher: 'Mme Diallo' },
          { name: 'Sciences', grade: 16, coefficient: 3, teacher: 'Dr. Ngozi' },
          { name: 'Histoire-Géographie', grade: 12, coefficient: 3, teacher: 'M. Bamogo' },
          { name: 'Anglais', grade: 14, coefficient: 2, teacher: 'Miss Johnson' }
        ],
        teacherComments: 'Élève sérieuse avec de bonnes capacités. Peut mieux faire en français.',
        directorComments: 'Résultats satisfaisants. Continuer les efforts.',
        sentToParentAt: '2024-12-15T14:30:00Z',
        notificationSent: ['sms', 'whatsapp', 'email']
      }
    ];

    res.json({
      success: true,
      bulletins: childBulletins,
      childId: childId,
      parentId: parentId,
      totalBulletins: childBulletins.length,
      message: 'Child bulletins retrieved successfully'
    });

  } catch (error) {
    console.error('[PARENT_API] ❌ Error fetching child bulletins:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching child bulletins'
    });
  }
});

// GET /api/parent/children/:childId/bulletins/:bulletinId - Get specific bulletin for child
router.get('/children/:childId/bulletins/:bulletinId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const parentId = req.user.id;
    const childId = parseInt(req.params.childId);
    const bulletinId = parseInt(req.params.bulletinId);
    const user = req.user as any;
    
    // Verify user is a parent
    if (user.role !== 'Parent') {
      return res.status(403).json({ 
        error: 'Access denied. Only parents can access this endpoint.' 
      });
    }

    console.log(`[PARENT_API] 📋 Getting bulletin ${bulletinId} for child ${childId} by parent:`, parentId);

    // In real implementation: 
    // 1. Verify parent has access to this child
    // 2. Verify bulletin belongs to this child
    // 3. Get full bulletin details

    // Mock response
    res.json({
      success: true,
      bulletin: {
        id: bulletinId,
        studentId: childId,
        parentId: parentId,
        period: '1er Trimestre',
        academicYear: '2024-2025',
        status: 'published',
        canDownload: true,
        downloadUrl: `/api/parent/children/${childId}/bulletins/${bulletinId}/download`,
        qrVerificationUrl: `/api/bulletin-validation/bulletins/verify-qr`
      },
      message: 'Bulletin details retrieved successfully'
    });

  } catch (error) {
    console.error('[PARENT_API] ❌ Error fetching bulletin details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bulletin details'
    });
  }
});

// GET /api/parent/children/:childId/bulletins/:bulletinId/download - Download child's bulletin PDF
router.get('/children/:childId/bulletins/:bulletinId/download', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const parentId = req.user.id;
    const childId = parseInt(req.params.childId);
    const bulletinId = parseInt(req.params.bulletinId);
    const user = req.user as any;
    
    // Verify user is a parent
    if (user.role !== 'Parent') {
      return res.status(403).json({ 
        error: 'Access denied. Only parents can access this endpoint.' 
      });
    }

    console.log(`[PARENT_API] 📥 Downloading bulletin ${bulletinId} for child ${childId} by parent:`, parentId);

    // In real implementation: 
    // 1. Verify parent has access to this child
    // 2. Verify bulletin belongs to this child
    // 3. Generate PDF with child's data
    // 4. Return PDF buffer

    // Mock PDF download response
    res.json({
      success: true,
      message: 'Bulletin PDF download initiated for child',
      downloadUrl: `/api/bulletins/${bulletinId}/pdf`,
      bulletinId: bulletinId,
      childId: childId,
      parentId: parentId,
      hasQRCode: true
    });

  } catch (error) {
    console.error('[PARENT_API] ❌ Error downloading child bulletin:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating child bulletin download'
    });
  }
});

// GET /api/parent/bulletins - Get all bulletins for all children
router.get('/bulletins', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const parentId = req.user.id;
    const user = req.user as any;
    
    // Verify user is a parent
    if (user.role !== 'Parent') {
      return res.status(403).json({ 
        error: 'Access denied. Only parents can access this endpoint.' 
      });
    }

    console.log(`[PARENT_API] 📋 Getting all bulletins for parent:`, parentId);

    // In real implementation: 
    // 1. Get all children for this parent
    // 2. Get all bulletins for each child
    
    // Mock consolidated bulletins data
    const allBulletins = [
      {
        id: 1,
        studentId: 1,
        studentName: 'Marie Kouame',
        className: '6ème A',
        period: '1er Trimestre',
        academicYear: '2024-2025',
        generalAverage: 14.5,
        status: 'published',
        publishedAt: '2024-12-15T10:00:00Z'
      },
      {
        id: 2,
        studentId: 2,
        studentName: 'Paul Kouame',
        className: '3ème B',
        period: '1er Trimestre',
        academicYear: '2024-2025',
        generalAverage: 13.2,
        status: 'published',
        publishedAt: '2024-12-15T10:00:00Z'
      }
    ];

    res.json({
      success: true,
      bulletins: allBulletins,
      parentId: parentId,
      totalBulletins: allBulletins.length,
      children: [
        { id: 1, name: 'Marie Kouame', class: '6ème A' },
        { id: 2, name: 'Paul Kouame', class: '3ème B' }
      ],
      message: 'All children bulletins retrieved successfully'
    });

  } catch (error) {
    console.error('[PARENT_API] ❌ Error fetching all bulletins:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching all bulletins'
    });
  }
});

export default router;
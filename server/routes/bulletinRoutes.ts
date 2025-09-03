import { Router } from 'express';
import { storage } from '../storage';
import crypto from 'crypto';
import { PDFGenerator } from '../services/pdfGenerator';
import { bulletinNotificationService, BulletinNotificationData, BulletinRecipient } from '../services/bulletinNotificationService';

const router = Router();

// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// Create new bulletin
router.post('/bulletins', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const { 
      studentId, 
      schoolId, 
      term, 
      academicYear, 
      grades, 
      generalAppreciation, 
      conductGrade, 
      absences 
    } = req.body;

    // Verify user has permission to create bulletins
    if (!['Teacher', 'Director', 'Admin', 'SiteAdmin'].includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Calculate average
    const totalPoints = grades.reduce((sum: number, grade: any) => 
      sum + (grade.note * grade.coefficient), 0
    );
    const totalCoeff = grades.reduce((sum: number, grade: any) => 
      sum + grade.coefficient, 0
    );
    const average = totalCoeff > 0 ? (totalPoints / totalCoeff) : 0;

    // Create bulletin data
    const bulletinData = {
      studentId: parseInt(studentId),
      schoolId: parseInt(schoolId) || user.schoolId,
      term,
      academicYear,
      grades: JSON.stringify(grades),
      generalAppreciation,
      conductGrade: parseInt(conductGrade),
      absences: parseInt(absences),
      average: parseFloat(average.toFixed(2)),
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };

    // Save to storage (simplified for demo)
    const bulletinId = Date.now(); // Simple ID generation for demo
    
    // In real implementation, use storage.createBulletin(bulletinData)
    console.log('[BULLETIN_CREATION] Creating bulletin:', bulletinData);

    res.json({
      success: true,
      id: bulletinId,
      message: 'Bulletin created successfully',
      data: {
        ...bulletinData,
        id: bulletinId
      }
    });

  } catch (error) {
    console.error('[BULLETIN_CREATION] Error:', error);
    res.status(500).json({ error: 'Failed to create bulletin' });
  }
});

// Get bulletin by ID
router.get('/bulletins/:id', requireAuth, async (req, res) => {
  try {
    const bulletinId = parseInt(req.params.id);
    const user = req.user as any;

    // For demo purposes, return mock data
    const mockBulletin = {
      id: bulletinId,
      studentId: 1,
      studentName: 'Emma Talla',
      schoolId: user.schoolId || 1,
      term: 'Premier Trimestre',
      academicYear: '2024-2025',
      grades: JSON.stringify([
        { subjectId: 'math', subjectName: 'Mathématiques', note: 16, coefficient: 4, appreciation: 'Très bien' },
        { subjectId: 'french', subjectName: 'Français', note: 14, coefficient: 4, appreciation: 'Bien' }
      ]),
      generalAppreciation: 'Élève sérieux et appliqué.',
      conductGrade: 18,
      absences: 2,
      average: 15.0,
      status: 'validated',
      createdAt: new Date().toISOString()
    };

    res.json(mockBulletin);

  } catch (error) {
    console.error('[BULLETIN_GET] Error:', error);
    res.status(500).json({ error: 'Failed to get bulletin' });
  }
});

// List bulletins for a student
router.get('/students/:studentId/bulletins', requireAuth, async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const user = req.user as any;

    // For demo purposes, return mock data
    const mockBulletins = [
      {
        id: 1,
        studentId,
        term: 'Premier Trimestre',
        academicYear: '2024-2025',
        average: 15.2,
        status: 'validated',
        createdAt: '2024-09-15T10:00:00Z'
      },
      {
        id: 2,
        studentId,
        term: 'Deuxième Trimestre',
        academicYear: '2024-2025',
        average: 14.8,
        status: 'draft',
        createdAt: '2024-12-15T10:00:00Z'
      }
    ];

    res.json(mockBulletins);

  } catch (error) {
    console.error('[BULLETIN_LIST] Error:', error);
    res.status(500).json({ error: 'Failed to list bulletins' });
  }
});

// Update bulletin
router.put('/bulletins/:id', requireAuth, async (req, res) => {
  try {
    const bulletinId = parseInt(req.params.id);
    const user = req.user as any;
    const updateData = req.body;

    // Verify permissions
    if (!['Teacher', 'Director', 'Admin', 'SiteAdmin'].includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // In real implementation, use storage.updateBulletin(bulletinId, updateData)
    console.log('[BULLETIN_UPDATE] Updating bulletin:', bulletinId, updateData);

    res.json({
      success: true,
      message: 'Bulletin updated successfully',
      id: bulletinId
    });

  } catch (error) {
    console.error('[BULLETIN_UPDATE] Error:', error);
    res.status(500).json({ error: 'Failed to update bulletin' });
  }
});

// Delete bulletin
router.delete('/bulletins/:id', requireAuth, async (req, res) => {
  try {
    const bulletinId = parseInt(req.params.id);
    const user = req.user as any;

    // Verify permissions
    if (!['Director', 'Admin', 'SiteAdmin'].includes(user.role)) {
      return res.status(403).json({ error: 'Only directors and admins can delete bulletins' });
    }

    // In real implementation, use storage.deleteBulletin(bulletinId)
    console.log('[BULLETIN_DELETE] Deleting bulletin:', bulletinId);

    res.json({
      success: true,
      message: 'Bulletin deleted successfully'
    });

  } catch (error) {
    console.error('[BULLETIN_DELETE] Error:', error);
    res.status(500).json({ error: 'Failed to delete bulletin' });
  }
});

// Publish/finalize bulletin
router.post('/bulletins/:id/publish', requireAuth, async (req, res) => {
  try {
    const bulletinId = parseInt(req.params.id);
    const user = req.user as any;

    // Verify permissions
    if (!['Director', 'Admin', 'SiteAdmin'].includes(user.role)) {
      return res.status(403).json({ error: 'Only directors and admins can publish bulletins' });
    }

    // In real implementation, update bulletin status to 'published'
    console.log('[BULLETIN_PUBLISH] Publishing bulletin:', bulletinId);

    res.json({
      success: true,
      message: 'Bulletin published successfully',
      id: bulletinId,
      status: 'published'
    });

  } catch (error) {
    console.error('[BULLETIN_PUBLISH] Error:', error);
    res.status(500).json({ error: 'Failed to publish bulletin' });
  }
});

// Generate PDF bulletin
router.get('/bulletins/:id/pdf', requireAuth, async (req, res) => {
  try {
    const bulletinId = parseInt(req.params.id);
    
    // In real implementation, generate PDF using a PDF library
    console.log('[BULLETIN_PDF] Generating PDF for bulletin:', bulletinId);

    // Mock PDF response
    res.json({
      success: true,
      message: 'PDF generated successfully',
      downloadUrl: `/api/bulletins/${bulletinId}/download-pdf`,
      bulletinId
    });

  } catch (error) {
    console.error('[BULLETIN_PDF] Error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Generate test bulletin PDF with realistic African school data
router.get('/test-bulletin/pdf', async (req, res) => {
  try {
    console.log('[TEST_BULLETIN_PDF] Generating test bulletin PDF...');
    
    // Generate the PDF using the PDF generator service
    const pdfBuffer = await PDFGenerator.generateTestBulletinDocument();
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="test-bulletin-amina-kouakou-2024.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    
    console.log('[TEST_BULLETIN_PDF] ✅ Test bulletin PDF generated successfully');
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('[TEST_BULLETIN_PDF] ❌ Error generating test bulletin PDF:', error);
    res.status(500).json({ 
      error: 'Failed to generate test bulletin PDF',
      details: error.message 
    });
  }
});

// Bulk sign bulletins by class
router.post('/bulletins/bulk-sign', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const { className, signerName, signerPosition, hasStamp } = req.body;

    // Verify user has permission to bulk sign
    if (!['Director', 'Admin', 'SiteAdmin'].includes(user.role)) {
      return res.status(403).json({ error: 'Only school administrators can bulk sign bulletins' });
    }

    // Validate required fields
    if (!className || !signerName || !signerPosition) {
      return res.status(400).json({ error: 'Class name, signer name, and position are required' });
    }

    console.log('[BULK_SIGN] Processing bulk signature for class:', className);
    console.log('[BULK_SIGN] Signer:', { name: signerName, position: signerPosition, hasStamp });

    // In real implementation, find all bulletins for the class and sign them
    // const bulletins = await storage.getBulletinsByClass(className);
    // for (const bulletin of bulletins) {
    //   await storage.updateBulletinSignature(bulletin.id, {
    //     signerName,
    //     signerPosition,
    //     signedAt: new Date(),
    //     schoolStamp: hasStamp
    //   });
    // }

    // Mock successful response
    const mockBulletinCount = Math.floor(Math.random() * 25) + 15; // 15-40 bulletins

    res.json({
      success: true,
      message: `${mockBulletinCount} bulletins signed successfully for class ${className}`,
      signedCount: mockBulletinCount,
      className,
      signer: {
        name: signerName,
        position: signerPosition,
        hasStamp
      }
    });

  } catch (error) {
    console.error('[BULK_SIGN] Error:', error);
    res.status(500).json({ error: 'Failed to bulk sign bulletins' });
  }
});

// Send bulletins with notifications - ENHANCED WITH REAL NOTIFICATION SERVICE
router.post('/bulletins/send-with-notifications', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const { classNames, notificationTypes, language } = req.body;

    // Verify user has permission to send bulletins
    if (!['Director', 'Admin', 'SiteAdmin'].includes(user.role)) {
      return res.status(403).json({ error: 'Only school administrators can send bulletins with notifications' });
    }

    console.log('[BULLETIN_NOTIFICATIONS] 📋 Sending bulletins with notifications...');
    console.log('[BULLETIN_NOTIFICATIONS] Classes:', classNames);
    console.log('[BULLETIN_NOTIFICATIONS] Notification types:', notificationTypes);
    console.log('[BULLETIN_NOTIFICATIONS] Language:', language);

    // Mock bulletins data - in real implementation, fetch from database
    const mockBulletins: BulletinNotificationData[] = [
      {
        studentId: 1,
        studentName: 'Marie Kouame',
        className: '6ème A',
        period: '1er Trimestre',
        academicYear: '2024-2025',
        generalAverage: 14.5,
        classRank: 8,
        totalStudentsInClass: 32,
        subjects: [
          { name: 'Mathématiques', grade: 15, coefficient: 4, teacher: 'M. Kouame' },
          { name: 'Français', grade: 13, coefficient: 4, teacher: 'Mme Diallo' },
          { name: 'Sciences', grade: 16, coefficient: 3, teacher: 'Dr. Ngozi' },
          { name: 'Histoire-Géographie', grade: 12, coefficient: 3, teacher: 'M. Bamogo' },
          { name: 'Anglais', grade: 14, coefficient: 2, teacher: 'Miss Johnson' }
        ],
        teacherComments: 'Élève sérieuse avec de bonnes capacités.',
        directorComments: 'Résultats satisfaisants. Continuer les efforts.',
        qrCode: 'EDU-2024-MAR-001',
        downloadUrl: '/api/bulletins/1/pdf',
        verificationUrl: '/api/bulletin-validation/bulletins/verify-qr'
      },
      {
        studentId: 2,
        studentName: 'Paul Kouame',
        className: '3ème B',
        period: '1er Trimestre',
        academicYear: '2024-2025',
        generalAverage: 13.2,
        classRank: 15,
        totalStudentsInClass: 28,
        subjects: [
          { name: 'Mathématiques', grade: 12, coefficient: 4, teacher: 'M. Kouame' },
          { name: 'Français', grade: 14, coefficient: 4, teacher: 'Mme Diallo' },
          { name: 'Sciences', grade: 13, coefficient: 3, teacher: 'Dr. Ngozi' },
          { name: 'Histoire-Géographie', grade: 13, coefficient: 3, teacher: 'M. Bamogo' },
          { name: 'Anglais', grade: 15, coefficient: 2, teacher: 'Miss Johnson' }
        ],
        teacherComments: 'Bon élève, peut mieux faire en mathématiques.',
        directorComments: 'Résultats corrects. Encourager les efforts.',
        qrCode: 'EDU-2024-PAU-002',
        downloadUrl: '/api/bulletins/2/pdf',
        verificationUrl: '/api/bulletin-validation/bulletins/verify-qr'
      }
    ];

    // Send bulk notifications using the enhanced service
    const notificationResult = await bulletinNotificationService.sendBulkBulletinNotifications(
      mockBulletins,
      notificationTypes || ['sms', 'email', 'whatsapp'],
      language || 'fr'
    );

    console.log('[BULLETIN_NOTIFICATIONS] ✅ Bulk notifications completed');
    
    res.json({
      success: true,
      sent: notificationResult.successful,
      failed: notificationResult.failed,
      total: notificationResult.processed,
      message: `${notificationResult.successful} bulletins sent successfully with notifications`,
      notificationResults: notificationResult.results,
      channels: notificationTypes || ['sms', 'email', 'whatsapp'],
      language: language || 'fr',
      summary: {
        processed: notificationResult.processed,
        successful: notificationResult.successful,
        failed: notificationResult.failed
      }
    });

  } catch (error) {
    console.error('[BULLETIN_NOTIFICATIONS] ❌ Error:', error);
    res.status(500).json({ error: 'Failed to send bulletins with notifications' });
  }
});

// NEW: Send notification for specific bulletin
router.post('/bulletins/:id/notify', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const bulletinId = parseInt(req.params.id);
    const { notificationTypes, language, recipientTypes } = req.body;

    // Verify user has permission
    if (!['Director', 'Admin', 'SiteAdmin'].includes(user.role)) {
      return res.status(403).json({ error: 'Only school administrators can send bulletin notifications' });
    }

    console.log(`[BULLETIN_NOTIFICATIONS] 📋 Sending notification for bulletin ${bulletinId}`);

    // Mock bulletin data - in real implementation, fetch from database
    const mockBulletinData: BulletinNotificationData = {
      studentId: bulletinId,
      studentName: 'Marie Kouame',
      className: '6ème A',
      period: '1er Trimestre',
      academicYear: '2024-2025',
      generalAverage: 14.5,
      classRank: 8,
      totalStudentsInClass: 32,
      subjects: [
        { name: 'Mathématiques', grade: 15, coefficient: 4, teacher: 'M. Kouame' },
        { name: 'Français', grade: 13, coefficient: 4, teacher: 'Mme Diallo' },
        { name: 'Sciences', grade: 16, coefficient: 3, teacher: 'Dr. Ngozi' }
      ],
      teacherComments: 'Élève sérieuse avec de bonnes capacités.',
      directorComments: 'Résultats satisfaisants.',
      qrCode: `EDU-2024-${bulletinId.toString().padStart(3, '0')}`,
      downloadUrl: `/api/bulletins/${bulletinId}/pdf`,
      verificationUrl: '/api/bulletin-validation/bulletins/verify-qr'
    };

    // Mock recipients - in real implementation, fetch from database based on student
    const mockRecipients: BulletinRecipient[] = [];
    
    if (!recipientTypes || recipientTypes.includes('student')) {
      mockRecipients.push({
        id: `student_${bulletinId}`,
        name: mockBulletinData.studentName,
        email: `student${bulletinId}@test.educafric.com`,
        phone: `+237650000${bulletinId.toString().padStart(3, '0')}`,
        whatsapp: `+237650000${bulletinId.toString().padStart(3, '0')}`,
        role: 'Student',
        preferredLanguage: language || 'fr'
      });
    }

    if (!recipientTypes || recipientTypes.includes('parent')) {
      mockRecipients.push({
        id: `parent_${bulletinId}`,
        name: `Parent of ${mockBulletinData.studentName}`,
        email: `parent${bulletinId}@test.educafric.com`,
        phone: `+237651000${bulletinId.toString().padStart(3, '0')}`,
        whatsapp: `+237651000${bulletinId.toString().padStart(3, '0')}`,
        role: 'Parent',
        preferredLanguage: language || 'fr',
        relationToStudent: 'parent'
      });
    }

    // Send notifications
    const result = await bulletinNotificationService.sendBulletinNotifications(
      mockBulletinData,
      mockRecipients,
      notificationTypes || ['sms', 'email', 'whatsapp'],
      language || 'fr'
    );

    res.json({
      success: true,
      bulletinId,
      studentName: mockBulletinData.studentName,
      notificationsSent: result.success,
      summary: result.summary,
      channels: notificationTypes || ['sms', 'email', 'whatsapp'],
      language: language || 'fr',
      recipients: mockRecipients.length
    });

  } catch (error) {
    console.error('[BULLETIN_NOTIFICATIONS] ❌ Error sending individual bulletin notification:', error);
    res.status(500).json({ error: 'Failed to send bulletin notification' });
  }
});

export default router;
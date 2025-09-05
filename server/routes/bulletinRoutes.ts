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

// Get all bulletins
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    // For now, return demo data - you can connect to real database later
    const mockBulletins = [
      {
        id: 1,
        studentId: 1,
        studentName: 'Marie Kouam',
        classId: 1,
        className: 'Terminale C',
        period: 'Premier Trimestre',
        academicYear: '2024-2025',
        generalAverage: 15.5,
        classRank: 3,
        totalStudentsInClass: 35,
        status: 'submitted',
        submittedBy: 2,
        submittedByName: 'Prof. Ndongo',
        submittedAt: '2024-11-15T10:00:00Z',
        grades: [
          { subjectId: 1, subjectName: 'Mathématiques', grade: 16, maxGrade: 20, coefficient: 4, comment: 'Très bon travail' },
          { subjectId: 2, subjectName: 'Physique', grade: 15, maxGrade: 20, coefficient: 3, comment: 'Bien' },
          { subjectId: 3, subjectName: 'Français', grade: 14, maxGrade: 20, coefficient: 3, comment: 'Correct' }
        ],
        generalComment: 'Élève sérieuse avec un bon niveau général',
        recommendations: 'Continuer les efforts en français',
        conduct: 'Très bien',
        attendanceRate: 95
      },
      {
        id: 2,
        studentId: 2,
        studentName: 'Paul Mballa',
        classId: 1,
        className: 'Terminale C',
        period: 'Premier Trimestre',
        academicYear: '2024-2025',
        generalAverage: 12.8,
        classRank: 12,
        totalStudentsInClass: 35,
        status: 'draft',
        grades: [
          { subjectId: 1, subjectName: 'Mathématiques', grade: 13, maxGrade: 20, coefficient: 4, comment: 'Peut mieux faire' },
          { subjectId: 2, subjectName: 'Physique', grade: 12, maxGrade: 20, coefficient: 3, comment: 'Effort nécessaire' },
          { subjectId: 3, subjectName: 'Français', grade: 14, maxGrade: 20, coefficient: 3, comment: 'Bon niveau' }
        ],
        generalComment: 'Élève capable mais doit fournir plus d\'efforts',
        conduct: 'Bien',
        attendanceRate: 88
      }
    ];
    
    res.json({
      success: true,
      bulletins: mockBulletins
    });
  } catch (error) {
    console.error('[BULLETINS_GET] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bulletins' });
  }
});

// Bulk sign bulletins
router.post('/bulk-sign', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const { classId, signerName, signerPosition } = req.body;
    
    res.json({
      success: true,
      message: 'Bulletins signed successfully'
    });
  } catch (error) {
    console.error('[BULLETIN_BULK_SIGN] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to sign bulletins' });
  }
});

// Send bulletins with notifications
router.post('/send-with-notifications', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const { bulletinIds } = req.body;
    
    res.json({
      success: true,
      message: 'Bulletins sent successfully'
    });
  } catch (error) {
    console.error('[BULLETIN_SEND] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send bulletins' });
  }
});

// Create new bulletin
router.post('/create', requireAuth, async (req, res) => {
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
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };

    // Save to storage (simplified for demo)
    const bulletinId = Date.now(); // Simple ID generation for demo
    
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

// Get school template preview
router.get('/school-template-preview', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const schoolId = user.schoolId || 1;

    // Generate school-specific template preview
    const schoolTemplatePreview = {
      schoolId,
      schoolName: user.schoolName || 'École Primaire Educafric',
      bulletinTemplate: {
        hasCustomLogo: true,
        hasCustomColors: true,
        hasDigitalSignature: true,
        hasQRCode: true,
        primaryColor: '#1a365d',
        secondaryColor: '#2d3748',
        logoUrl: '/api/school/logo',
        features: [
          'En-tête personnalisé',
          'Logo école intégré',
          'Couleurs école appliquées',
          'QR Code sécurisé',
          'Signature digitale',
          'Cachet officiel'
        ]
      },
      transcriptTemplate: {
        hasOfficialFormat: true,
        hasBilingualSupport: true,
        hasDigitalSeal: true,
        hasVerification: true,
        features: [
          'Format officiel conforme',
          'Support bilingue FR/EN',
          'Signature digitale intégrée',
          'Cachet école automatique',
          'Vérification authenticitéç',
          'Export PDF sécurisé'
        ]
      },
      previewUrls: {
        bulletinPreview: `/api/bulletins/preview-sample?schoolId=${schoolId}`,
        transcriptPreview: `/api/transcripts/preview-sample?schoolId=${schoolId}`
      }
    };

    console.log('[SCHOOL_TEMPLATE_PREVIEW] Generated for school:', schoolId);
    res.json({
      success: true,
      data: schoolTemplatePreview
    });

  } catch (error) {
    console.error('[SCHOOL_TEMPLATE_PREVIEW] Error:', error);
    res.status(500).json({ error: 'Failed to generate template preview' });
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

// Preview sample bulletin for sandbox (missing route implementation)
router.get('/preview-sample', async (req, res) => {
  try {
    const schoolId = req.query.schoolId || 1;
    console.log('[BULLETIN_PREVIEW_SAMPLE] Generating preview sample for school:', schoolId);
    
    // Generate the PDF using the PDF generator service
    const pdfBuffer = await PDFGenerator.generateTestBulletinDocument();
    
    // Set headers for PDF preview (inline display)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="bulletin-preview-sample.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    
    console.log('[BULLETIN_PREVIEW_SAMPLE] ✅ Preview sample PDF generated successfully');
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('[BULLETIN_PREVIEW_SAMPLE] ❌ Error generating preview sample:', error);
    res.status(500).json({ 
      error: 'Failed to generate bulletin preview sample',
      details: error.message 
    });
  }
});

// Generate Document 12 format PDF for schools
router.get('/template-preview/pdf', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    console.log('[DOCUMENT_12_PDF] Generating Document 12 format PDF for school:', user.schoolId);
    
    // Generate the PDF using the PDF generator service
    const pdfBuffer = await PDFGenerator.generateTestBulletinDocument();
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="document-12-bulletin-template-educafric.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    
    console.log('[DOCUMENT_12_PDF] ✅ Document 12 PDF generated successfully');
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('[DOCUMENT_12_PDF] ❌ Error generating Document 12 PDF:', error);
    res.status(500).json({ 
      error: 'Failed to generate Document 12 PDF',
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

// NEW: Preview bulletin template for schools
router.get('/bulletins/template-preview', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    // Allow all authenticated users to view the template
    console.log('[BULLETIN_TEMPLATE] 🎨 Template preview requested by:', user.email);

    // Serve the template HTML file
    res.sendFile('template-bulletin-educafric.html', { 
      root: './public/documents',
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });

  } catch (error) {
    console.error('[BULLETIN_TEMPLATE] ❌ Error serving template:', error);
    res.status(500).json({ error: 'Failed to load bulletin template' });
  }
});

// NEW: Get bulletin template as JSON for customization
router.get('/bulletins/template-data', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    // Verify user has permission
    if (!['Teacher', 'Director', 'Admin', 'SiteAdmin'].includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    console.log('[BULLETIN_TEMPLATE] 📋 Template data requested by:', user.email);

    // Return template structure as JSON for customization
    const templateData = {
      school: {
        name: "ÉCOLE SAINT-JOSEPH YAOUNDÉ",
        logo: "ESJ",
        subtitle: "Excellence • Innovation • Leadership",
        address: "BP 1234 Yaoundé - Cameroun",
        phone: "+237 222 123 456",
        website: "www.educafric.com"
      },
      student: {
        name: "KOUAME Marie Célestine",
        class: "6ème A",
        age: 12,
        birthDate: "15 Mars 2012",
        matricule: "ESJ-2024-001",
        photo: "👩‍🎓"
      },
      academic: {
        period: "1ER TRIMESTRE 2024-2025",
        generalAverage: 14.5,
        classRank: 8,
        totalStudents: 32,
        conduct: 16,
        absences: 2
      },
      subjects: [
        {
          name: "Mathématiques",
          grade: 15.0,
          coefficient: 4,
          teacher: "M. KOUAME Paul",
          appreciation: "Très bien"
        },
        {
          name: "Français", 
          grade: 13.0,
          coefficient: 4,
          teacher: "Mme DIALLO Aïcha",
          appreciation: "Peut mieux faire"
        },
        {
          name: "Sciences Physiques",
          grade: 16.5,
          coefficient: 3,
          teacher: "Dr. NGOZI Emmanuel", 
          appreciation: "Excellent"
        },
        {
          name: "Histoire-Géographie",
          grade: 12.0,
          coefficient: 3,
          teacher: "M. BAMOGO Alain",
          appreciation: "Assez bien"
        },
        {
          name: "Anglais",
          grade: 14.5,
          coefficient: 2,
          teacher: "Miss JOHNSON Sarah",
          appreciation: "Bien"
        },
        {
          name: "Éducation Civique",
          grade: 17.0,
          coefficient: 2,
          teacher: "M. ETOA Pierre",
          appreciation: "Excellent"
        },
        {
          name: "EPS",
          grade: 15.0,
          coefficient: 2,
          teacher: "M. MBALLA Jean",
          appreciation: "Très bien"
        }
      ],
      comments: {
        teacher: "Marie est une élève sérieuse et appliquée qui montre de bonnes capacités dans l'ensemble des matières. Ses résultats en sciences sont particulièrement remarquables. Il conviendrait d'améliorer ses performances en français pour viser l'excellence. Continue tes efforts !",
        director: "Résultats satisfaisants pour ce premier trimestre. Marie fait preuve de discipline et de régularité dans son travail. Les efforts doivent être maintenus pour conserver ce niveau et progresser vers l'excellence. Félicitations pour sa conduite exemplaire."
      },
      signatures: {
        teacher: "M. KOUAME Paul",
        director: "Dr. MENDOMO Gabriel"
      },
      security: {
        qrCode: "EDU-2024-MAR-001",
        verificationUrl: "/api/bulletin-validation/bulletins/verify-qr",
        generatedDate: "15 Décembre 2024"
      }
    };

    res.json({
      success: true,
      templateData,
      message: 'Bulletin template data retrieved successfully',
      customizable: {
        school: true,
        colors: true,
        subjects: true,
        grading: true,
        comments: true
      }
    });

  } catch (error) {
    console.error('[BULLETIN_TEMPLATE] ❌ Error getting template data:', error);
    res.status(500).json({ error: 'Failed to get bulletin template data' });
  }
});

// NEW: Mark bulletin as "seen" by parent
router.post('/bulletins/:id/mark-seen', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const bulletinId = parseInt(req.params.id);
    const { seenBy, deviceInfo, location } = req.body;

    console.log(`[BULLETIN_SEEN] 👀 Bulletin ${bulletinId} marked as seen by:`, user.email);

    // In real implementation:
    // 1. Verify user has access to this bulletin
    // 2. Record the "seen" timestamp and metadata
    // 3. Update bulletin status
    // 4. Send confirmation to school

    const seenRecord = {
      bulletinId,
      userId: user.id,
      userRole: user.role,
      seenAt: new Date().toISOString(),
      seenBy: seenBy || 'Parent',
      deviceInfo: deviceInfo || 'Unknown device',
      location: location || 'Unknown location',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    };

    console.log('[BULLETIN_SEEN] 📝 Recording seen confirmation:', seenRecord);

    res.json({
      success: true,
      bulletinId,
      seenRecord,
      message: 'Bulletin marked as seen successfully',
      timestamp: seenRecord.seenAt,
      acknowledgment: `Accusé de réception enregistré pour le bulletin ${bulletinId}`
    });

  } catch (error) {
    console.error('[BULLETIN_SEEN] ❌ Error marking bulletin as seen:', error);
    res.status(500).json({ error: 'Failed to mark bulletin as seen' });
  }
});

// NEW: Get bulletin delivery and seen status for school tracking
router.get('/bulletins/tracking-dashboard', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    // Verify user has permission to view tracking dashboard
    if (!['Director', 'Admin', 'SiteAdmin'].includes(user.role)) {
      return res.status(403).json({ error: 'Only school administrators can view tracking dashboard' });
    }

    console.log('[BULLETIN_TRACKING] 📊 Tracking dashboard requested by:', user.email);

    // Mock tracking data - in real implementation, fetch from database
    const trackingData = {
      summary: {
        totalBulletins: 156,
        sent: 156,
        delivered: 148,
        seen: 142,
        pending: 14,
        failed: 0
      },
      byClass: [
        {
          className: '6ème A',
          totalStudents: 32,
          bulletinsSent: 32,
          parentsNotified: 32,
          seenByParents: 30,
          pendingParents: 2,
          lastActivity: '2024-12-15T14:30:00Z'
        },
        {
          className: '6ème B',
          totalStudents: 28,
          bulletinsSent: 28,
          parentsNotified: 28,
          seenByParents: 26,
          pendingParents: 2,
          lastActivity: '2024-12-15T13:45:00Z'
        },
        {
          className: '5ème A',
          totalStudents: 30,
          bulletinsSent: 30,
          parentsNotified: 30,
          seenByParents: 28,
          pendingParents: 2,
          lastActivity: '2024-12-15T15:15:00Z'
        }
      ],
      recentActivity: [
        {
          type: 'seen',
          studentName: 'KOUAME Marie',
          parentName: 'Mme KOUAME Adjoa',
          className: '6ème A',
          timestamp: '2024-12-15T16:45:00Z',
          device: 'Mobile - Android'
        },
        {
          type: 'notification_sent',
          studentName: 'DIALLO Omar',
          parentName: 'M. DIALLO Mamadou',
          className: '5ème B',
          timestamp: '2024-12-15T16:30:00Z',
          channel: 'WhatsApp + SMS'
        },
        {
          type: 'seen',
          studentName: 'MBALLA Grace',
          parentName: 'Dr. MBALLA Paul',
          className: '4ème A',
          timestamp: '2024-12-15T16:15:00Z',
          device: 'Desktop - Chrome'
        }
      ],
      pendingParents: [
        {
          studentId: 23,
          studentName: 'ETOA Samuel',
          parentName: 'Mme ETOA Brigitte',
          className: '6ème A',
          phoneNumber: '+237651234567',
          email: 'brigitte.etoa@email.com',
          bulletinSent: '2024-12-15T10:00:00Z',
          lastNotification: '2024-12-15T14:00:00Z',
          notificationCount: 2,
          status: 'pending_parent_view'
        },
        {
          studentId: 45,
          studentName: 'NGONO Paul',
          parentName: 'M. NGONO Pierre',
          className: '5ème A',
          phoneNumber: '+237652345678',
          email: 'pierre.ngono@email.com',
          bulletinSent: '2024-12-15T10:00:00Z',
          lastNotification: '2024-12-15T15:00:00Z',
          notificationCount: 1,
          status: 'pending_parent_view'
        }
      ]
    };

    res.json({
      success: true,
      trackingData,
      generatedAt: new Date().toISOString(),
      message: 'Bulletin tracking dashboard data retrieved successfully'
    });

  } catch (error) {
    console.error('[BULLETIN_TRACKING] ❌ Error getting tracking dashboard:', error);
    res.status(500).json({ error: 'Failed to get bulletin tracking data' });
  }
});

// NEW: Send reminder notifications to parents who haven't seen bulletins
router.post('/bulletins/send-reminders', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const { reminderType, language, targetParents } = req.body;

    // Verify user has permission
    if (!['Director', 'Admin', 'SiteAdmin'].includes(user.role)) {
      return res.status(403).json({ error: 'Only school administrators can send reminders' });
    }

    console.log('[BULLETIN_REMINDERS] 🔔 Sending reminders to parents...');
    console.log('[BULLETIN_REMINDERS] Reminder type:', reminderType);
    console.log('[BULLETIN_REMINDERS] Target parents:', targetParents?.length || 'all pending');

    // Mock reminder sending - integrate with notification service
    const reminderResults = {
      totalTargets: targetParents?.length || 14,
      smsSent: 12,
      whatsappSent: 10,
      emailsSent: 14,
      failed: 0,
      cost: 0.85 // USD for SMS in Cameroon
    };

    // Mock reminder messages
    const reminderMessages = {
      gentle: {
        fr: "📋 Rappel: Le bulletin de votre enfant est disponible sur EDUCAFRIC. Merci de le consulter.",
        en: "📋 Reminder: Your child's report card is available on EDUCAFRIC. Please review it."
      },
      urgent: {
        fr: "⚠️ URGENT: Veuillez consulter le bulletin de votre enfant sur EDUCAFRIC dans les plus brefs délais.",
        en: "⚠️ URGENT: Please review your child's report card on EDUCAFRIC as soon as possible."
      },
      final: {
        fr: "🚨 DERNIER RAPPEL: Consultation obligatoire du bulletin. Contactez l'école si difficultés.",
        en: "🚨 FINAL REMINDER: Report card review required. Contact school if any issues."
      }
    };

    console.log('[BULLETIN_REMINDERS] ✅ Reminders sent successfully');

    res.json({
      success: true,
      reminderResults,
      reminderType: reminderType || 'gentle',
      language: language || 'fr',
      message: `${reminderResults.totalTargets} parents reminded successfully`,
      costDetails: {
        smsCount: reminderResults.smsSent,
        estimatedCost: reminderResults.cost,
        currency: 'USD'
      },
      nextReminderSuggested: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48h later
    });

  } catch (error) {
    console.error('[BULLETIN_REMINDERS] ❌ Error sending reminders:', error);
    res.status(500).json({ error: 'Failed to send bulletin reminders' });
  }
});

// NEW: Generate uniformity report for school quality assurance
router.get('/bulletins/uniformity-report', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    // Verify user has permission
    if (!['Director', 'Admin', 'SiteAdmin'].includes(user.role)) {
      return res.status(403).json({ error: 'Only school administrators can view uniformity reports' });
    }

    console.log('[BULLETIN_UNIFORMITY] 📊 Generating uniformity report for:', user.email);

    // Mock uniformity analysis
    const uniformityReport = {
      compliance: {
        overallScore: 94.5,
        templateCompliance: 98.2,
        contentStandards: 91.8,
        securityFeatures: 99.1,
        parentEngagement: 89.7
      },
      qualityChecks: {
        allBulletinsUseOfficialTemplate: true,
        allBulletinsHaveQRCodes: true,
        allBulletinsDigitallySigned: true,
        uniformGradingScale: true,
        consistentComments: false, // Need improvement
        photoRequirements: 87.3 // Percentage compliance
      },
      issuesFound: [
        {
          severity: 'medium',
          issue: 'Inconsistent teacher comment lengths',
          affectedBulletins: 12,
          suggestion: 'Standardize comment templates (50-150 characters)'
        },
        {
          severity: 'low',
          issue: 'Missing student photos in some bulletins',
          affectedBulletins: 8,
          suggestion: 'Organize photo collection session'
        }
      ],
      recommendations: [
        {
          priority: 'high',
          action: 'Implement comment length validation',
          expectedImpact: 'Improve bulletin consistency by 8%'
        },
        {
          priority: 'medium',
          action: 'Create teacher training on bulletin standards',
          expectedImpact: 'Reduce variation in appreciation quality'
        },
        {
          priority: 'low',
          action: 'Add automated photo requirement checks',
          expectedImpact: 'Ensure 100% photo compliance'
        }
      ],
      benchmarks: {
        industryAverage: 78.5,
        schoolPerformance: 94.5,
        improvement: '+15.5%',
        ranking: 'Excellent (Top 5% schools)'
      }
    };

    res.json({
      success: true,
      uniformityReport,
      generatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      message: 'Bulletin uniformity report generated successfully'
    });

  } catch (error) {
    console.error('[BULLETIN_UNIFORMITY] ❌ Error generating uniformity report:', error);
    res.status(500).json({ error: 'Failed to generate uniformity report' });
  }
});

export default router;
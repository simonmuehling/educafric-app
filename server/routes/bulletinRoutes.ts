import { Router } from 'express';
import { storage } from '../storage';
import crypto from 'crypto';
import { PDFGenerator } from '../services/pdfGenerator';

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

export default router;
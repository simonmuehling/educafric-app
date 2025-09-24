// Simple PDF generation route - fixed to actually generate PDF
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Actual PDF generation that returns proper PDF file
router.post('/generate-pdf', requireAuth, async (req, res) => {
  try {
    console.log('[SIMPLE_PDF] 🎯 Generating bulletin PDF...');
    
    const { bulletinData, studentInfo, schoolInfo, language } = req.body;
    
    if (!bulletinData || !studentInfo) {
      return res.status(400).json({
        success: false,
        message: 'Missing bulletin data'
      });
    }

    console.log('[SIMPLE_PDF] ✅ Student:', studentInfo.name);
    
    // Import PDF generator
    const { PDFGenerator } = await import('../services/pdfGenerator.js');
    
    // Use the working Cameroon official bulletin generator
    const pdfBuffer = await PDFGenerator.renderCameroonOfficialReportCard({
      studentId: studentInfo.id,
      studentFirstName: studentInfo.name.split(' ')[0] || studentInfo.name,
      studentLastName: studentInfo.name.split(' ').slice(1).join(' ') || '',
      studentMatricule: studentInfo.matricule || studentInfo.id,
      studentBirthDate: studentInfo.birthDate || '',
      className: studentInfo.classLabel || bulletinData.classLabel,
      classId: studentInfo.classId || 1,
      term: bulletinData.term || 'Premier',
      academicYear: bulletinData.academicYear || '2025/2026',
      subjects: bulletinData.subjects || [],
      generalAverage: parseFloat(bulletinData.generalAverage) || 0,
      studentRank: '1er',
      totalStudents: 30,
      passDecision: 'PASSE'
    }, {
      id: schoolInfo?.id || 999,
      name: schoolInfo?.name || 'École',
      address: schoolInfo?.address || '',
      phone: schoolInfo?.phone || '',
      email: schoolInfo?.email || '',
      logoUrl: schoolInfo?.logoUrl || '', // This handles empty logo properly
      directorName: schoolInfo?.directorName || '',
      motto: schoolInfo?.motto || ''
    }, language || 'fr');
    
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('PDF generation returned empty buffer');
    }
    
    // Set proper PDF headers
    const filename = `bulletin_${studentInfo.name.replace(/[^a-zA-Z0-9]/g, '_')}_${bulletinData.term}_${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    console.log('[SIMPLE_PDF] ✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes');
    res.send(pdfBuffer);

  } catch (error: any) {
    console.error('[SIMPLE_PDF] ❌ Error:', error);
    console.error('[SIMPLE_PDF] ❌ Stack:', error.stack);
    console.error('[SIMPLE_PDF] ❌ Full error object:', JSON.stringify(error, null, 2));
    res.status(500).json({
      success: false,
      message: 'PDF generation failed',
      error: error.message,
      stack: error.stack
    });
  }
});

export default router;
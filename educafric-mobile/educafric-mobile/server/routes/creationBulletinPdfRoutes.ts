import express from 'express';
import { PDFGenerator } from '../services/pdfGenerator.js';

const router = express.Router();

/**
 * CREATION BULLETIN PDF ROUTE
 * Generates PDFs specifically for the BulletinCreationInterface
 * - No QR codes
 * - Uses creation interface data structure
 * - Handles 20+ subjects with auto-pagination
 * - Uses TRIMESTER_TITLES for headers
 */
router.post('/api/bulletins/creation/pdf', async (req, res) => {
  try {
    console.log('[CREATION_PDF] 🎯 Generating creation bulletin PDF...');
    
    const bulletinData = req.body;
    console.log('[CREATION_PDF] ✅ Data received:', {
      student: bulletinData.studentName,
      class: bulletinData.classLabel,
      term: bulletinData.term,
      subjects: bulletinData.subjects?.length || 0
    });

    // Generate PDF using new creation-specific method
    const pdfBuffer = await PDFGenerator.renderCreationReportCard(bulletinData, {
      includeQR: false, // No QR codes for creation interface
      autoPageBreak: true, // Handle 20+ subjects
      language: bulletinData.language || 'fr'
    });

    if (!pdfBuffer) {
      throw new Error('PDF buffer is empty');
    }

    console.log('[CREATION_PDF] ✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    // Set proper headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="bulletin-${bulletinData.studentName?.replace(/\s+/g, '_')}-${bulletinData.term}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length.toString());

    // Send the PDF buffer
    res.end(pdfBuffer);

  } catch (error: any) {
    console.error('[CREATION_PDF] ❌ Error:', error.message);
    console.error('[CREATION_PDF] ❌ Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate creation bulletin PDF',
      error: error.message
    });
  }
});

export default router;
import { Router } from 'express';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { 
  GenerateDocumentPdfRequestSchema,
  validatePdfData
} from '../../shared/pdfValidationSchemas';

const router = Router();

// Auto-generate document mapping by scanning the documents directory
function generateDocumentMapping(): { [key: number]: string } {
  const documentsPath = path.join(process.cwd(), 'public', 'documents');
  const mapping: { [key: number]: string } = {};
  
  if (!fs.existsSync(documentsPath)) {
    console.warn('[DOCUMENTS] Documents directory not found, creating it...');
    fs.mkdirSync(documentsPath, { recursive: true });
    return mapping;
  }
  
  try {
    const files = fs.readdirSync(documentsPath);
    const documentFiles = files
      .filter(file => 
        file.endsWith('.md') || 
        file.endsWith('.pdf') || 
        file.endsWith('.html') ||
        file.endsWith('.txt')
      )
      .map(file => ({
        name: file,
        stats: fs.statSync(path.join(documentsPath, file))
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })) // ALPHABETICAL - NOT DATE
      .map(item => item.name);
    
    documentFiles.forEach((file, index) => {
      mapping[index + 1] = file;
    });
    
    console.log(`[DOCUMENTS] Auto-generated mapping for ${documentFiles.length} documents`);
    return mapping;
  } catch (error) {
    console.error('[DOCUMENTS] Error scanning documents directory:', error);
    return mapping;
  }
}

// Generate the document mapping automatically
const documentMapping = generateDocumentMapping();

// Serve static files from uploads directory
router.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// API endpoint to view documents by ID
router.get('/:id/view', async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    const filename = documentMapping[documentId];
    
    if (!filename) {
      console.error(`[DOCUMENTS] Document ID ${documentId} not found in mapping`);
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const filePath = path.join(process.cwd(), 'public', 'documents', filename);
    
    if (!fs.existsSync(filePath)) {
      console.error(`[DOCUMENTS] File not found: ${filePath}`);
      return res.status(404).json({ error: 'Document file not found' });
    }

    // Handle different file types
    if (filename.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      return res.sendFile(filePath);
    }
    
    if (filename.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.sendFile(filePath);
    }
    
    if (filename.endsWith('.md')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const htmlContent = marked(content);
      
      const htmlPage = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename} - EDUCAFRIC</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        h1, h2, h3 { color: #2c5530; }
        .header { 
            border-bottom: 2px solid #2c5530; 
            padding-bottom: 10px; 
            margin-bottom: 20px; 
        }
        .footer { 
            border-top: 1px solid #ddd; 
            padding-top: 20px; 
            margin-top: 40px; 
            text-align: center; 
            font-size: 0.9em; 
            color: #666; 
        }
        pre { 
            background: #f5f5f5; 
            padding: 10px; 
            border-radius: 4px; 
            overflow-x: auto; 
        }
        blockquote { 
            border-left: 4px solid #2c5530; 
            margin: 0; 
            padding-left: 20px; 
            font-style: italic; 
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📄 ${filename}</h1>
        <p><strong>EDUCAFRIC Platform</strong> - Document officiel</p>
    </div>
    
    ${htmlContent}
    
    <div class="footer">
        <p>Document généré automatiquement par EDUCAFRIC</p>
        <p>Plateforme éducative pour l'Afrique - ${new Date().getFullYear()}</p>
    </div>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(htmlPage);
    }

    // Default: serve file directly
    res.sendFile(filePath);
    
  } catch (error) {
    console.error('[DOCUMENTS] View error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to download documents by ID
router.get('/:id/download', async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    const filename = documentMapping[documentId];
    
    if (!filename) {
      console.error(`[DOCUMENTS] Document ID ${documentId} not found in mapping`);
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const filePath = path.join(process.cwd(), 'public', 'documents', filename);
    
    if (!fs.existsSync(filePath)) {
      console.error(`[DOCUMENTS] File not found: ${filePath}`);
      return res.status(404).json({ error: 'Document file not found' });
    }

    // Set appropriate headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(filePath);
    
  } catch (error) {
    console.error('[DOCUMENTS] Download error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve documents with proper headers and MD to HTML conversion
router.get('/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'public', 'documents', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Handle MD files - convert to HTML for viewing
    if (filename.endsWith('.md')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const htmlContent = marked(content);
      
      const htmlPage = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename} - EDUCAFRIC</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        h1, h2, h3 { color: #2c5530; }
        .header { 
            border-bottom: 2px solid #2c5530; 
            padding-bottom: 10px; 
            margin-bottom: 20px; 
        }
        .footer { 
            border-top: 1px solid #ddd; 
            padding-top: 20px; 
            margin-top: 40px; 
            text-align: center; 
            font-size: 0.9em; 
            color: #666; 
        }
        pre { 
            background: #f5f5f5; 
            padding: 10px; 
            border-radius: 4px; 
            overflow-x: auto; 
        }
        blockquote { 
            border-left: 4px solid #2c5530; 
            margin: 0; 
            padding-left: 20px; 
            font-style: italic; 
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📄 ${filename}</h1>
        <p><strong>EDUCAFRIC Platform</strong> - Document officiel</p>
    </div>
    
    ${htmlContent}
    
    <div class="footer">
        <p>Document généré automatiquement par EDUCAFRIC</p>
        <p>Plateforme éducative pour l'Afrique - ${new Date().getFullYear()}</p>
    </div>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(htmlPage);
    }

    // For other file types, serve directly
    res.sendFile(filePath);
    
  } catch (error) {
    console.error('Document serving error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate PDF from MD files
router.get('/:filename/pdf', async (req, res) => {
  let browser = null;
  try {
    // ✅ VALIDATE FILENAME PARAMETER
    const filename = req.params.filename;
    if (!filename || typeof filename !== 'string' || filename.trim() === '') {
      return res.status(400).json({ 
        error: 'Invalid filename', 
        message: 'Filename parameter is required' 
      });
    }
    
    // ✅ VALIDATE FILE EXTENSION
    if (!filename.endsWith('.md')) {
      return res.status(400).json({ 
        error: 'Invalid file type', 
        message: 'PDF generation only available for .md files' 
      });
    }
    
    // ✅ VALIDATE REQUEST USING ZOD SCHEMA
    let validatedRequest;
    try {
      validatedRequest = validatePdfData(
        GenerateDocumentPdfRequestSchema,
        { filename, language: 'fr', format: 'A4' },
        'Document PDF request'
      );
    } catch (validationError: any) {
      console.error('[DOCUMENT_PDF] ❌ Validation error:', validationError.message);
      return res.status(400).json({ 
        error: 'Invalid request data', 
        message: validationError.message 
      });
    }
    
    // ✅ VALIDATE FILE PATH AND EXISTENCE
    const filePath = path.join(process.cwd(), 'public', 'documents', validatedRequest.filename);
    
    // Check if file path is safe (prevent directory traversal)
    if (!filePath.startsWith(path.join(process.cwd(), 'public', 'documents'))) {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: 'Invalid file path' 
      });
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        error: 'Document not found', 
        message: `Document '${validatedRequest.filename}' not found` 
      });
    }

    // ✅ READ AND VALIDATE FILE CONTENT
    let content;
    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch (readError: any) {
      console.error('[DOCUMENT_PDF] ❌ File read error:', readError);
      return res.status(500).json({ 
        error: 'File read failed', 
        message: 'Unable to read document file' 
      });
    }
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ 
        error: 'Empty document', 
        message: 'Document content is empty' 
      });
    }

    // ✅ GENERATE HTML WITH ERROR HANDLING
    let htmlContent;
    try {
      htmlContent = marked(content);
    } catch (markdownError: any) {
      console.error('[DOCUMENT_PDF] ❌ Markdown parsing error:', markdownError);
      return res.status(500).json({ 
        error: 'Markdown parsing failed', 
        message: 'Unable to parse document content' 
      });
    }
    
    // ✅ SAFE FILENAME FOR DISPLAY
    const safeFilename = validatedRequest.filename
      .replace(/[<>:"|\/\\*?]/g, '_')
      .substring(0, 100); // Limit length
    
    const htmlPage = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${safeFilename} - EDUCAFRIC</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        h1, h2, h3 { color: #2c5530; }
        .header { 
            border-bottom: 2px solid #2c5530; 
            padding-bottom: 10px; 
            margin-bottom: 20px; 
        }
        .footer { 
            border-top: 1px solid #ddd; 
            padding-top: 20px; 
            margin-top: 40px; 
            text-align: center; 
            font-size: 0.9em; 
            color: #666; 
        }
        pre { 
            background: #f5f5f5; 
            padding: 10px; 
            border-radius: 4px; 
        }
        blockquote { 
            border-left: 4px solid #2c5530; 
            margin: 0; 
            padding-left: 20px; 
            font-style: italic; 
        }
        @media print {
            body { margin: 0; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📄 ${safeFilename}</h1>
        <p><strong>EDUCAFRIC Platform</strong> - Document officiel</p>
    </div>
    
    ${htmlContent}
    
    <div class="footer">
        <p>Document généré automatiquement par EDUCAFRIC</p>
        <p>Plateforme éducative pour l'Afrique - ${new Date().getFullYear()}</p>
    </div>
</body>
</html>`;

    // ✅ GENERATE PDF WITH PROPER ERROR HANDLING
    let pdfBuffer;
    try {
      // Dynamic import for puppeteer with validation
      const puppeteer = await import('puppeteer');
      if (!puppeteer || !puppeteer.default) {
        throw new Error('Puppeteer is not available');
      }

      browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      
      const page = await browser.newPage();
      await page.setContent(htmlPage, { 
        waitUntil: 'networkidle0', 
        timeout: 30000 
      });
      
      pdfBuffer = await page.pdf({
        format: validatedRequest.format as any,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        printBackground: true,
        timeout: 30000
      });
      
      // ✅ VALIDATE PDF BUFFER
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('Generated PDF is empty or invalid');
      }
      
    } catch (pdfError: any) {
      console.error('[DOCUMENT_PDF] ❌ PDF generation error:', pdfError);
      return res.status(500).json({ 
        error: 'PDF generation failed', 
        message: 'Unable to generate PDF from document' 
      });
    } finally {
      // ✅ ENSURE BROWSER CLEANUP
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.error('[DOCUMENT_PDF] ❌ Error closing browser:', closeError);
        }
        browser = null;
      }
    }
    
    // ✅ GENERATE SAFE PDF FILENAME
    const pdfFilename = validatedRequest.filename
      .replace('.md', '.pdf')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .substring(0, 100); // Limit length
    
    // ✅ SET HEADERS ONLY AFTER SUCCESSFUL PDF GENERATION
    res.status(200);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdfFilename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'private, no-cache');
    
    console.log('[DOCUMENT_PDF] ✅ PDF generated successfully:', pdfFilename, `(${pdfBuffer.length} bytes)`);
    
    // ✅ SEND VALIDATED PDF BUFFER
    res.end(Buffer.from(pdfBuffer));
    
  } catch (error: any) {
    console.error('[DOCUMENT_PDF] ❌ Unexpected error:', error);
    
    // ✅ ENSURE BROWSER CLEANUP
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('[DOCUMENT_PDF] ❌ Error closing browser in catch:', closeError);
      }
    }
    
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Unable to generate PDF. Please try again later.' 
    });
  }
});

// API endpoint to list all available documents
router.get('/list', (req, res) => {
  try {
    const documents = Object.entries(documentMapping).map(([id, filename]) => {
      const filePath = path.join(process.cwd(), 'public', 'documents', filename);
      const exists = fs.existsSync(filePath);
      
      // Get file stats if exists
      let fileInfo = null;
      if (exists) {
        try {
          const stats = fs.statSync(filePath);
          fileInfo = {
            size: stats.size,
            modified: stats.mtime,
            created: stats.birthtime
          };
        } catch (error) {
          console.warn(`[DOCUMENTS] Error reading file stats for ${filename}:`, error);
        }
      }
      
      return {
        id: parseInt(id),
        filename,
        title: filename.replace(/\.(md|pdf|html|txt)$/, '').replace(/[-_]/g, ' '),
        type: filename.split('.').pop() || 'unknown',
        exists,
        fileInfo,
        downloadUrl: `/api/commercial/documents/${id}/download`,
        viewUrl: `/api/commercial/documents/${id}/view`
      };
    });
    
    res.json({
      success: true,
      documents: documents.filter(doc => doc.exists), // Only return existing documents
      total: documents.filter(doc => doc.exists).length
    });
  } catch (error) {
    console.error('[DOCUMENTS] List error:', error);
    res.status(500).json({ error: 'Failed to list documents' });
  }
});

// API endpoint to refresh document mapping (useful after adding new files)
router.post('/refresh', (req, res) => {
  try {
    const oldCount = Object.keys(documentMapping).length;
    
    // Re-generate the mapping
    const newMapping = generateDocumentMapping();
    
    // Update the mapping
    Object.keys(documentMapping).forEach(key => delete (documentMapping as any)[key]);
    Object.assign(documentMapping, newMapping);
    
    const newCount = Object.keys(documentMapping).length;
    
    console.log(`[DOCUMENTS] Refreshed mapping: ${oldCount} → ${newCount} documents`);
    
    res.json({
      success: true,
      message: `Document mapping refreshed successfully`,
      oldCount,
      newCount,
      added: newCount - oldCount
    });
  } catch (error) {
    console.error('[DOCUMENTS] Refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh document mapping' });
  }
});

export default router;
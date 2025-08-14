import { Router } from 'express';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

const router = Router();

// Document mapping for commercial documents
const documentMapping: { [key: number]: string } = {
  1: 'guide-notifications-educafric.md',
  2: 'tarifs-plans-francais.md',
  3: 'pricing-plans-english.md',
  4: 'politique-confidentialite.md',
  5: 'technical-architecture.md',
  6: 'EDUCAFRIC_COMMERCIAL_GUIDE_ENGLISH.md',
  7: 'Demande_Etablissement_1753390157502.pdf',
  8: 'Demande_ministre-8_1753390184314.pdf',
  9: 'Educafric_Plans_Abonnement_Complets_FR (1)_1753390205509.html',
  10: 'parents_1753390442002.pdf',
  11: 'EDUCAFRIC_COMPREHENSIVE_PAGE_INVENTORY.md',
  12: 'EDUCAFRIC_NOTIFICATION_CONTENT_REFERENCE.md',
  13: 'EDUCAFRIC_PLANS_ABONNEMENT_COMPLETS.md',
  14: 'EDUCAFRIC_INFORMATION_FREEMIUM_ECOLES_AFRICAINES.md',
  15: 'EDUCAFRIC_SERVICES_GEOLOCALISATION_COMPARISON.md',
  16: 'EDUCAFRIC_CONTRAT_PARTENARIAT_ETABLISSEMENTS_FREELANCERS_2025.md',
  17: 'EDUCAFRIC_ECONOMIES_FINANCIERES_ECOLES_AFRICAINES.md',
  18: 'EDUCAFRIC_BROCHURE_COMMERCIALE_PERSUASIVE.md',
  19: 'Educafric_Document_Commercial.pdf',
  20: 'Educafric_Presentation.pdf',
  21: 'CONTRAT_PARTENARIAT_ETABLISSEMENTS_FREELANCERS_2025_1753866001857.pdf',
  22: 'parents_1753390442002.pdf'
};

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
  try {
    const filename = req.params.filename;
    
    if (!filename.endsWith('.md')) {
      return res.status(400).json({ error: 'PDF generation only available for .md files' });
    }
    
    const filePath = path.join(process.cwd(), 'public', 'documents', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Dynamic import for puppeteer
    const puppeteer = await import('puppeteer');
    
    const content = fs.readFileSync(filePath, 'utf8');
    const htmlContent = marked(content);
    
    const htmlPage = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
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

    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlPage, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      printBackground: true
    });
    
    await browser.close();
    
    const pdfFilename = filename.replace('.md', '.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdfFilename}"`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

export default router;
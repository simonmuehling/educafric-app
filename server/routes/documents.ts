import { Router } from 'express';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

const router = Router();

// Serve static files from uploads directory
router.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

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
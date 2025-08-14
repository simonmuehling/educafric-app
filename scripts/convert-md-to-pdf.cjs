const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const puppeteer = require('puppeteer');

// Professional CSS styling for PDF documents
const pdfStyles = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #ffffff;
      font-size: 14px;
      max-width: 210mm;
      margin: 0 auto;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    
    .header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
    }
    
    .header .subtitle {
      font-size: 16px;
      opacity: 0.9;
      font-weight: 300;
    }
    
    .content {
      padding: 0 30px 30px 30px;
    }
    
    h1 {
      color: #667eea;
      font-size: 28px;
      font-weight: 600;
      margin: 30px 0 20px 0;
      border-bottom: 3px solid #667eea;
      padding-bottom: 10px;
      page-break-after: avoid;
    }
    
    h2 {
      color: #4a5568;
      font-size: 22px;
      font-weight: 600;
      margin: 25px 0 15px 0;
      page-break-after: avoid;
    }
    
    h3 {
      color: #2d3748;
      font-size: 18px;
      font-weight: 500;
      margin: 20px 0 12px 0;
      page-break-after: avoid;
    }
    
    p {
      margin-bottom: 15px;
      text-align: justify;
      line-height: 1.7;
    }
    
    ul, ol {
      margin: 15px 0;
      padding-left: 25px;
    }
    
    li {
      margin-bottom: 8px;
      line-height: 1.6;
    }
    
    .highlight-box {
      background: #f7fafc;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    
    .success-box {
      background: #f0fff4;
      border-left: 4px solid #38a169;
      padding: 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    
    .warning-box {
      background: #fffbf0;
      border-left: 4px solid #ed8936;
      padding: 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 13px;
    }
    
    th, td {
      border: 1px solid #e2e8f0;
      padding: 12px;
      text-align: left;
    }
    
    th {
      background: #667eea;
      color: white;
      font-weight: 600;
    }
    
    tr:nth-child(even) {
      background: #f8f9fa;
    }
    
    .footer {
      text-align: center;
      padding: 30px;
      border-top: 2px solid #e2e8f0;
      margin-top: 40px;
      color: #718096;
      font-size: 12px;
      page-break-inside: avoid;
    }
    
    .logo {
      font-weight: 700;
      color: #667eea;
      font-size: 24px;
      margin-bottom: 10px;
    }
    
    .contact-info {
      margin-top: 15px;
      font-size: 11px;
    }
    
    .page-break {
      page-break-before: always;
    }
    
    /* Print-specific styles */
    @media print {
      body {
        font-size: 12px;
      }
      
      .header h1 {
        font-size: 28px;
      }
      
      h1 {
        font-size: 24px;
      }
      
      h2 {
        font-size: 20px;
      }
      
      h3 {
        font-size: 16px;
      }
      
      .no-print {
        display: none;
      }
    }
    
    /* Code blocks */
    pre, code {
      font-family: 'Courier New', monospace;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 15px;
      margin: 15px 0;
      font-size: 12px;
      overflow-x: auto;
    }
    
    code {
      padding: 3px 6px;
      display: inline;
      background: #e2e8f0;
    }
    
    /* Links */
    a {
      color: #667eea;
      text-decoration: none;
      border-bottom: 1px dotted #667eea;
    }
    
    a:hover {
      color: #553c9a;
    }
    
    /* Blockquotes */
    blockquote {
      border-left: 4px solid #cbd5e0;
      padding-left: 20px;
      margin: 20px 0;
      font-style: italic;
      color: #4a5568;
    }
    
    .educafric-branding {
      color: #667eea;
      font-weight: 600;
    }
  </style>
`;

// Enhanced markdown processing with custom renderers
function setupMarkdown() {
  const renderer = new marked.Renderer();
  
  // Custom heading renderer
  renderer.heading = function(text, level) {
    const cleanText = text.replace(/<[^>]*>/g, '');
    return `<h${level}>${text}</h${level}>`;
  };
  
  // Custom list renderer
  renderer.list = function(body, ordered, start) {
    const type = ordered ? 'ol' : 'ul';
    const startatt = (ordered && start !== 1) ? ` start="${start}"` : '';
    return `<${type}${startatt}>\n${body}</${type}>\n`;
  };
  
  // Custom table renderer
  renderer.table = function(header, body) {
    return `<table>\n<thead>\n${header}</thead>\n<tbody>\n${body}</tbody>\n</table>\n`;
  };
  
  marked.setOptions({
    renderer: renderer,
    gfm: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false
  });
}

// Process markdown content with special handling
function processMarkdownContent(content, filename) {
  // Remove YAML frontmatter if present
  content = content.replace(/^---[\s\S]*?---\n/, '');
  
  // Convert special markdown elements to styled boxes
  content = content.replace(/^> \*\*(.*?)\*\*/gm, '<div class="highlight-box"><strong>$1</strong></div>');
  content = content.replace(/^✅(.*)/gm, '<div class="success-box">✅$1</div>');
  content = content.replace(/^⚠️(.*)/gm, '<div class="warning-box">⚠️$1</div>');
  content = content.replace(/^❌(.*)/gm, '<div class="warning-box">❌$1</div>');
  
  // Brand name highlighting
  content = content.replace(/EducAfric/g, '<span class="educafric-branding">EducAfric</span>');
  content = content.replace(/EDUCAFRIC/g, '<span class="educafric-branding">EDUCAFRIC</span>');
  
  return content;
}

// Generate document title and subtitle from filename and content
function generateDocumentInfo(filename, content) {
  const baseName = path.basename(filename, '.md');
  
  // Extract first heading as title if available
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : baseName.replace(/-/g, ' ').replace(/_/g, ' ');
  
  // Generate subtitle based on document type
  let subtitle = 'Document EducAfric';
  
  if (filename.includes('contrat') || filename.includes('contract')) {
    subtitle = 'Contrat de Partenariat - EducAfric Platform';
  } else if (filename.includes('commercial') || filename.includes('guide')) {
    subtitle = 'Guide Commercial - EducAfric Solutions';
  } else if (filename.includes('tarif') || filename.includes('pricing')) {
    subtitle = 'Tarification - Plans d\'Abonnement EducAfric';
  } else if (filename.includes('notification')) {
    subtitle = 'Système de Notifications - EducAfric';
  } else if (filename.includes('geolocation') || filename.includes('geolocalisation')) {
    subtitle = 'Géolocalisation - Services EducAfric';
  }
  
  return { title, subtitle };
}

// Main conversion function
async function convertMarkdownToPdf(inputPath, outputPath) {
  try {
    console.log(`Converting: ${inputPath} -> ${outputPath}`);
    
    // Read markdown file
    const markdownContent = fs.readFileSync(inputPath, 'utf-8');
    const processedContent = processMarkdownContent(markdownContent, inputPath);
    
    // Setup markdown parser
    setupMarkdown();
    
    // Convert to HTML
    const htmlContent = marked(processedContent);
    
    // Generate document info
    const { title, subtitle } = generateDocumentInfo(inputPath, processedContent);
    
    // Create complete HTML document
    const fullHtml = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        ${pdfStyles}
    </head>
    <body>
        <div class="header">
            <div class="logo">EducAfric</div>
            <h1>${title}</h1>
            <div class="subtitle">${subtitle}</div>
        </div>
        
        <div class="content">
            ${htmlContent}
        </div>
        
        <div class="footer">
            <div class="logo">EducAfric</div>
            <div class="contact-info">
                <div><strong>Contact:</strong> +237 657 004 011 | admin@educafric.com</div>
                <div><strong>Plateforme Éducative Africaine</strong> - Solutions Numériques pour l'Éducation</div>
                <div>Document généré le ${new Date().toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</div>
            </div>
        </div>
    </body>
    </html>
    `;
    
    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      printBackground: true,
      preferCSSPageSize: true
    });
    
    await browser.close();
    console.log(`✅ PDF generated: ${outputPath}`);
    
  } catch (error) {
    console.error(`❌ Error converting ${inputPath}:`, error);
    throw error;
  }
}

// Main execution function
async function main() {
  const documentsDir = path.join(__dirname, '..', 'public', 'documents');
  const files = fs.readdirSync(documentsDir);
  const markdownFiles = files.filter(file => file.endsWith('.md'));
  
  console.log(`Found ${markdownFiles.length} markdown files to convert`);
  
  // Convert all markdown files to PDF
  for (const file of markdownFiles) {
    const inputPath = path.join(documentsDir, file);
    const outputPath = path.join(documentsDir, file.replace('.md', '.pdf'));
    
    try {
      await convertMarkdownToPdf(inputPath, outputPath);
    } catch (error) {
      console.error(`Failed to convert ${file}:`, error.message);
    }
  }
  
  console.log('\n✅ PDF conversion complete!');
  
  // Remove markdown files after successful conversion
  console.log('\n🗑️ Removing original markdown files...');
  for (const file of markdownFiles) {
    const filePath = path.join(documentsDir, file);
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted: ${file}`);
    } catch (error) {
      console.error(`Failed to delete ${file}:`, error.message);
    }
  }
  
  console.log('\n🎉 All documents have been converted to professional PDFs!');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  convertMarkdownToPdf,
  main
};
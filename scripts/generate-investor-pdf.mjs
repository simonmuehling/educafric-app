import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateInvestorPitchPDF() {
  console.log('🚀 Starting PDF generation with preserved colors...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  
  const htmlPath = path.join(__dirname, '..', 'public/documents/investor-pitch-educafric.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  await page.setContent(htmlContent, { 
    waitUntil: 'networkidle0',
    timeout: 30000
  });
  
  await page.addStyleTag({
    content: `
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
    `
  });
  
  await page.emulateMediaType('screen');
  
  const pdfPath = path.join(__dirname, '..', 'public/documents/investor-pitch-educafric.pdf');
  
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '10mm',
      bottom: '10mm',
      left: '10mm',
      right: '10mm'
    },
    preferCSSPageSize: false
  });
  
  console.log('✅ PDF generated successfully at:', pdfPath);
  
  await browser.close();
  return pdfPath;
}

generateInvestorPitchPDF().catch(console.error);

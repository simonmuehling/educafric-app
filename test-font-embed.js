// Direct test of DejaVu Sans font embedding with jsPDF
const jsPDF = require('jspdf');
const fs = require('fs');
const path = require('path');

async function testFontEmbedding() {
  try {
    console.log('🔬 Testing DejaVu Sans font embedding directly...');
    
    // Create jsPDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm', 
      format: 'a4'
    });
    
    console.log('✅ PDF document created');
    
    // Load DejaVu Sans font
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'DejaVuSans.ttf');
    console.log('📁 Reading font from:', fontPath);
    
    if (!fs.existsSync(fontPath)) {
      throw new Error(`Font file not found: ${fontPath}`);
    }
    
    const fontBuffer = fs.readFileSync(fontPath);
    console.log('📊 Font loaded:', fontBuffer.length, 'bytes');
    console.log('🔍 Font header:', Array.from(fontBuffer.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' '));
    
    // Check if this is actually a TTF file (should start with 0x00010000 or 0x74727565)
    const header = fontBuffer.readUInt32BE(0);
    console.log('📝 Font header as int:', header.toString(16));
    
    const fontBase64 = fontBuffer.toString('base64');
    console.log('💾 Base64 length:', Math.ceil(fontBase64.length/1000), 'KB');
    
    // Try embedding the font
    console.log('🔧 Adding font to VFS...');
    doc.addFileToVFS('DejaVuSans.ttf', fontBase64);
    console.log('✅ Font added to VFS');
    
    console.log('🎯 Registering font...');  
    doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
    console.log('✅ Font registered');
    
    console.log('🎨 Setting font as active...');
    doc.setFont('DejaVuSans', 'normal');
    console.log('✅ Font set as active');
    
    // Test with problematic Unicode characters
    doc.text('Test ASCII: Hello World', 20, 30);
    doc.text('Test French: Ecole Camerounaise', 20, 40);  
    doc.text('Test Bullets: * - > instead of unicode', 20, 50);
    console.log('✅ Text added successfully');
    
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    fs.writeFileSync('/tmp/test-font.pdf', pdfBuffer);
    console.log('✅ Test PDF saved to /tmp/test-font.pdf with', pdfBuffer.length, 'bytes');
    
    return true;
    
  } catch (error) {
    console.error('❌ Font embedding test FAILED:', error.message);
    console.error('📋 Stack:', error.stack);
    return false;
  }
}

testFontEmbedding().then(success => {
  console.log('🏁 Test completed:', success ? 'SUCCESS' : 'FAILED');
  process.exit(success ? 0 : 1);
});
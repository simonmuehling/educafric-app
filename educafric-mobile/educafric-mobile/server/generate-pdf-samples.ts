// Script to generate PDF samples for demonstration
// Run this script to create sample PDFs in /public/samples/
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MasterSheetGenerator } from './services/masterSheetGenerator.js';
import { TranscriptGenerator } from './services/transcriptGenerator.js';
import { TimetableGenerator } from './services/timetableGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateAllSamples() {
  console.log('🎯 [PDF_SAMPLES] Starting generation of all PDF samples...');
  
  // Ensure samples directory exists
  const samplesDir = path.join(__dirname, '..', 'public', 'samples');
  try {
    await fs.access(samplesDir);
  } catch {
    await fs.mkdir(samplesDir, { recursive: true });
    console.log('📁 [PDF_SAMPLES] Created samples directory');
  }
  
  try {
    // Generate Master Sheet samples
    console.log('📊 [PDF_SAMPLES] Generating Master Sheet samples...');
    
    // French Master Sheet
    const masterSheetDataFr = MasterSheetGenerator.generateDemoData();
    const masterSheetOptionsFr = {
      language: 'fr' as const,
      format: 'A4' as const,
      orientation: 'landscape' as const,
      includeStatistics: true,
      includeAbsences: true,
      showRankings: true,
      colorScheme: 'standard' as const
    };
    const masterSheetPdfFr = await MasterSheetGenerator.generateMasterSheet(masterSheetDataFr, masterSheetOptionsFr);
    await fs.writeFile(path.join(samplesDir, 'master-sheet-sample-fr.pdf'), masterSheetPdfFr);
    console.log('✅ [PDF_SAMPLES] Generated master-sheet-sample-fr.pdf');
    
    // English Master Sheet
    const masterSheetOptionsEn = { ...masterSheetOptionsFr, language: 'en' as const };
    const masterSheetPdfEn = await MasterSheetGenerator.generateMasterSheet(masterSheetDataFr, masterSheetOptionsEn);
    await fs.writeFile(path.join(samplesDir, 'master-sheet-sample-en.pdf'), masterSheetPdfEn);
    console.log('✅ [PDF_SAMPLES] Generated master-sheet-sample-en.pdf');
    
    // Generate Transcript samples
    console.log('📜 [PDF_SAMPLES] Generating Transcript samples...');
    
    // French Transcript
    const transcriptDataFr = TranscriptGenerator.generateDemoData();
    const transcriptOptionsFr = {
      language: 'fr' as const,
      format: 'A4' as const,
      includePhoto: true,
      includeCertifications: true,
      includeStatistics: true,
      officialSeal: true,
      colorScheme: 'official' as const
    };
    const transcriptPdfFr = await TranscriptGenerator.generateTranscript(transcriptDataFr, transcriptOptionsFr);
    await fs.writeFile(path.join(samplesDir, 'transcript-sample-fr.pdf'), transcriptPdfFr);
    console.log('✅ [PDF_SAMPLES] Generated transcript-sample-fr.pdf');
    
    // English Transcript
    const transcriptOptionsEn = { ...transcriptOptionsFr, language: 'en' as const };
    const transcriptPdfEn = await TranscriptGenerator.generateTranscript(transcriptDataFr, transcriptOptionsEn);
    await fs.writeFile(path.join(samplesDir, 'transcript-sample-en.pdf'), transcriptPdfEn);
    console.log('✅ [PDF_SAMPLES] Generated transcript-sample-en.pdf');
    
    // Generate Timetable samples
    console.log('📅 [PDF_SAMPLES] Generating Timetable samples...');
    
    // French Timetable
    const timetableDataFr = TimetableGenerator.generateDemoData();
    const timetableOptionsFr = {
      language: 'fr' as const,
      format: 'A4' as const,
      orientation: 'landscape' as const,
      showTeacherNames: true,
      showRooms: true,
      includeBreaks: true,
      colorScheme: 'standard' as const,
      includeSaturday: false,
      showTimeOnly: true
    };
    const timetablePdfFr = await TimetableGenerator.generateTimetable(timetableDataFr, timetableOptionsFr);
    await fs.writeFile(path.join(samplesDir, 'timetable-sample-fr.pdf'), timetablePdfFr);
    console.log('✅ [PDF_SAMPLES] Generated timetable-sample-fr.pdf');
    
    // English Timetable
    const timetableOptionsEn = { ...timetableOptionsFr, language: 'en' as const };
    const timetablePdfEn = await TimetableGenerator.generateTimetable(timetableDataFr, timetableOptionsEn);
    await fs.writeFile(path.join(samplesDir, 'timetable-sample-en.pdf'), timetablePdfEn);
    console.log('✅ [PDF_SAMPLES] Generated timetable-sample-en.pdf');
    
    console.log('🎉 [PDF_SAMPLES] All 6 PDF samples generated successfully!');
    console.log('📁 [PDF_SAMPLES] Samples saved in:', samplesDir);
    
    // List generated files
    const files = await fs.readdir(samplesDir);
    const pdfFiles = files.filter(f => f.endsWith('.pdf') && f.includes('sample'));
    console.log('📋 [PDF_SAMPLES] Generated files:');
    pdfFiles.forEach(file => console.log(`   - ${file}`));
    
  } catch (error) {
    console.error('❌ [PDF_SAMPLES] Error generating samples:', error);
    throw error;
  }
}

// Export function for use in other modules
export { generateAllSamples };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllSamples()
    .then(() => {
      console.log('✅ [PDF_SAMPLES] Sample generation completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ [PDF_SAMPLES] Sample generation failed:', error);
      process.exit(1);
    });
}
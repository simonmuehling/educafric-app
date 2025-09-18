#!/usr/bin/env tsx
/**
 * PDF Preview Files Regeneration Script
 * 
 * This script regenerates all static PDF preview files in /public/samples/
 * using the current PDF generation system with updated headers and school information.
 * 
 * Usage: tsx scripts/regeneratePreviewFiles.ts
 */

import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

interface PreviewConfig {
  name: string;
  endpoint: string;
  languages: string[];
  colorSchemes?: string[];
  options?: Record<string, any>;
}

// Configuration for all preview files to regenerate
const PREVIEW_CONFIGS: PreviewConfig[] = [
  {
    name: 'master-sheet-sample',
    endpoint: 'http://localhost:5000/api/master-sheets/demo',
    languages: ['fr', 'en'],
    colorSchemes: ['standard', 'green', 'blue'],
    options: {
      format: 'A4',
      orientation: 'landscape',
      includeStatistics: true,
      includeAbsences: true,
      showRankings: true
    }
  },
  {
    name: 'transcript-sample',
    endpoint: 'http://localhost:5000/api/transcripts/demo',
    languages: ['fr', 'en'],
    colorSchemes: ['official', 'modern', 'classic'],
    options: {
      format: 'A4',
      includePhoto: true,
      includeCertifications: true,
      includeStatistics: true,
      officialSeal: true
    }
  },
  {
    name: 'timetable-sample',
    endpoint: 'http://localhost:5000/api/timetables/demo',
    languages: ['fr', 'en'],
    colorSchemes: ['standard', 'colorful', 'minimal'],
    options: {
      format: 'A4',
      orientation: 'landscape',
      showTeacherNames: true,
      showRooms: true,
      includeBreaks: true,
      includeSaturday: false,
      showTimeOnly: true
    }
  },
  {
    name: 'optimized-bulletin-t1',
    endpoint: 'http://localhost:5000/api/optimized-bulletins/sample',
    languages: ['fr', 'en'],
    options: {
      term: 'T1',
      format: 'A4',
      includeComments: true,
      includeRankings: true,
      includeStatistics: true
    }
  },
  {
    name: 'optimized-bulletin-t2',
    endpoint: 'http://localhost:5000/api/optimized-bulletins/sample',
    languages: ['fr', 'en'],
    options: {
      term: 'T2',
      format: 'A4',
      includeComments: true,
      includeRankings: true,
      includeStatistics: true
    }
  },
  {
    name: 'optimized-bulletin-t3',
    endpoint: 'http://localhost:5000/api/optimized-bulletins/sample',
    languages: ['fr', 'en'],
    options: {
      term: 'T3',
      format: 'A4',
      includeComments: true,
      includeRankings: true,
      includeStatistics: true
    }
  },
  {
    name: 'comprehensive-bulletin-t1',
    endpoint: 'http://localhost:5000/api/comprehensive-bulletins/public-sample',
    languages: ['fr', 'en'],
    options: {
      term: 'T1',
      format: 'A4',
      includeComments: true,
      includeRankings: true,
      includeStatistics: true,
      includeAbsences: true,
      includeSanctions: true
    }
  },
  {
    name: 'comprehensive-bulletin-t2',
    endpoint: 'http://localhost:5000/api/comprehensive-bulletins/public-sample',
    languages: ['fr', 'en'],
    options: {
      term: 'T2',
      format: 'A4',
      includeComments: true,
      includeRankings: true,
      includeStatistics: true,
      includeAbsences: true,
      includeSanctions: true
    }
  },
  {
    name: 'comprehensive-bulletin-t3',
    endpoint: 'http://localhost:5000/api/comprehensive-bulletins/public-sample',
    languages: ['fr', 'en'],
    options: {
      term: 'T3',
      format: 'A4',
      includeComments: true,
      includeRankings: true,
      includeStatistics: true,
      includeAbsences: true,
      includeSanctions: true
    }
  },
  {
    name: 'bulletin-sample-t1',
    endpoint: 'http://localhost:5000/api/optimized-bulletins/sample',
    languages: ['fr', 'en'],
    options: {
      term: 'T1',
      format: 'A4'
    }
  },
  {
    name: 'bulletin-sample-t2',
    endpoint: 'http://localhost:5000/api/optimized-bulletins/sample',
    languages: ['fr', 'en'],
    options: {
      term: 'T2',
      format: 'A4'
    }
  },
  {
    name: 'bulletin-sample-t3',
    endpoint: 'http://localhost:5000/api/optimized-bulletins/sample',
    languages: ['fr', 'en'],
    options: {
      term: 'T3',
      format: 'A4'
    }
  }
];

const PUBLIC_SAMPLES_DIR = path.join(process.cwd(), 'public', 'samples');

/**
 * Generate a single PDF from endpoint
 */
async function generatePDF(
  endpoint: string, 
  language: string, 
  colorScheme: string = 'standard', 
  options: Record<string, any> = {}
): Promise<Buffer> {
  console.log(`📄 Generating PDF: ${endpoint} (${language}, ${colorScheme})`);
  
  const payload = {
    language,
    colorScheme,
    ...options
  };
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/pdf')) {
    throw new Error(`Expected PDF response, got: ${contentType}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Save PDF buffer to file
 */
async function savePDF(buffer: Buffer, filename: string): Promise<void> {
  const filepath = path.join(PUBLIC_SAMPLES_DIR, filename);
  await fs.writeFile(filepath, buffer);
  console.log(`✅ Saved: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

/**
 * Ensure public/samples directory exists
 */
async function ensurePublicSamplesDir(): Promise<void> {
  try {
    await fs.access(PUBLIC_SAMPLES_DIR);
  } catch {
    console.log('📁 Creating public/samples directory...');
    await fs.mkdir(PUBLIC_SAMPLES_DIR, { recursive: true });
  }
}

/**
 * Backup existing files before regeneration
 */
async function backupExistingFiles(): Promise<void> {
  const backupDir = path.join(PUBLIC_SAMPLES_DIR, 'backup-' + Date.now());
  
  try {
    const files = await fs.readdir(PUBLIC_SAMPLES_DIR);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));
    
    if (pdfFiles.length > 0) {
      console.log(`🔄 Backing up ${pdfFiles.length} existing PDF files...`);
      await fs.mkdir(backupDir, { recursive: true });
      
      for (const file of pdfFiles) {
        const sourcePath = path.join(PUBLIC_SAMPLES_DIR, file);
        const backupPath = path.join(backupDir, file);
        await fs.copyFile(sourcePath, backupPath);
      }
      
      console.log(`✅ Backup created: ${backupDir}`);
    }
  } catch (error: any) {
    console.warn(`⚠️ Backup failed: ${error.message}`);
  }
}

/**
 * Wait for server to be ready
 */
async function waitForServer(maxAttempts: number = 10): Promise<boolean> {
  console.log('🔍 Checking if server is running...');
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch('http://localhost:5000/api/health', { 
        method: 'GET',
        timeout: 3000 
      });
      
      if (response.ok) {
        console.log('✅ Server is ready');
        return true;
      }
    } catch (error) {
      console.log(`⏳ Attempt ${attempt}/${maxAttempts} - Server not ready, waiting...`);
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  console.error('❌ Server is not responding after maximum attempts');
  return false;
}

/**
 * Main regeneration function
 */
async function regenerateAllPreviews(): Promise<void> {
  console.log('🚀 Starting PDF Preview Files Regeneration...\n');
  
  // Wait for server
  const serverReady = await waitForServer();
  if (!serverReady) {
    console.error('❌ Cannot proceed - server is not running');
    process.exit(1);
  }
  
  // Ensure directory exists
  await ensurePublicSamplesDir();
  
  // Backup existing files
  await backupExistingFiles();
  
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];
  
  console.log('\n📄 Generating updated PDF preview files...\n');
  
  // Process each preview configuration
  for (const config of PREVIEW_CONFIGS) {
    console.log(`🔄 Processing: ${config.name}`);
    
    // Generate for each language
    for (const language of config.languages) {
      try {
        const colorSchemes = config.colorSchemes || ['standard'];
        
        // Use the first color scheme for the main file
        const mainColorScheme = colorSchemes[0];
        const pdfBuffer = await generatePDF(
          config.endpoint, 
          language, 
          mainColorScheme, 
          config.options
        );
        
        const filename = `${config.name}-${language}.pdf`;
        await savePDF(pdfBuffer, filename);
        successCount++;
        
        // If there are multiple color schemes, generate additional variants
        if (colorSchemes.length > 1) {
          for (let i = 1; i < colorSchemes.length; i++) {
            const colorScheme = colorSchemes[i];
            const variantBuffer = await generatePDF(
              config.endpoint, 
              language, 
              colorScheme, 
              config.options
            );
            
            const variantFilename = `${config.name}-${colorScheme}-${language}.pdf`;
            await savePDF(variantBuffer, variantFilename);
            successCount++;
          }
        }
        
      } catch (error: any) {
        const errorMsg = `${config.name}-${language}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
        errorCount++;
      }
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Summary
  console.log('📊 Regeneration Summary:');
  console.log(`✅ Success: ${successCount} files`);
  console.log(`❌ Errors: ${errorCount} files`);
  
  if (errors.length > 0) {
    console.log('\n🚨 Error Details:');
    errors.forEach(error => console.log(`   • ${error}`));
  }
  
  if (successCount > 0) {
    console.log(`\n🎉 Preview files have been regenerated with updated headers!`);
    console.log(`📁 Files saved to: ${PUBLIC_SAMPLES_DIR}`);
  }
  
  process.exit(errorCount > 0 ? 1 : 0);
}

/**
 * Handle script execution
 */
// Check if this file is being run directly (not imported)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  regenerateAllPreviews().catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

export { regenerateAllPreviews };
// Routes pour servir les échantillons de bulletins PDF
import express from 'express';
import path from 'path';
import fs from 'fs';
import { 
  GenerateDocumentPdfRequestSchema,
  validatePdfData
} from '../../shared/pdfValidationSchemas';

const router = express.Router();

// Middleware d'authentification
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// ✅ ROUTE POUR SERVIR LES ÉCHANTILLONS PDF DE BULLETINS
router.get('/preview/:term/:language?', requireAuth, async (req, res) => {
  try {
    const { term, language = 'fr' } = req.params;
    
    // ✅ VALIDATE INPUT PARAMETERS STRICTLY
    if (!term || typeof term !== 'string' || term.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Term parameter is required',
        availableTerms: ['T1', 'T2', 'T3']
      });
    }
    
    if (!language || typeof language !== 'string' || language.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Language parameter is required',
        availableLanguages: ['fr', 'en']
      });
    }
    
    // ✅ VALIDATE TERM VALUE
    const validTerms = ['T1', 'T2', 'T3'];
    if (!validTerms.includes(term.toUpperCase())) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid term '${term}'. Must be one of: ${validTerms.join(', ')}`,
        availableTerms: validTerms
      });
    }

    // ✅ VALIDATE LANGUAGE VALUE
    const validLanguages = ['fr', 'en'];
    if (!validLanguages.includes(language.toLowerCase())) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid language '${language}'. Must be one of: ${validLanguages.join(', ')}`,
        availableLanguages: validLanguages
      });
    }

    const normalizedTerm = term.toLowerCase();
    const normalizedLang = language.toLowerCase();
    
    // ✅ BUILD SAFE FILE PATH
    const sampleFileName = `bulletin-sample-${normalizedTerm}-${normalizedLang}.pdf`;
    const samplesDir = path.join(process.cwd(), 'public', 'samples');
    const samplePath = path.join(samplesDir, sampleFileName);

    console.log('[BULLETIN_SAMPLES] 📂 Trying to serve sample:', sampleFileName);
    console.log('[BULLETIN_SAMPLES] 📂 Full path:', samplePath);
    
    // ✅ VALIDATE SAMPLES DIRECTORY EXISTS
    if (!fs.existsSync(samplesDir)) {
      console.error('[BULLETIN_SAMPLES] ❌ Samples directory not found:', samplesDir);
      return res.status(500).json({ 
        success: false, 
        message: 'Bulletin samples directory not found',
        error: 'Server configuration error'
      });
    }

    // ✅ VALIDATE FILE PATH SECURITY (prevent directory traversal)
    if (!samplePath.startsWith(samplesDir)) {
      console.error('[BULLETIN_SAMPLES] ❌ Security violation - path traversal attempt:', samplePath);
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied',
        error: 'Invalid file path'
      });
    }

    // ✅ CHECK FILE EXISTENCE
    if (!fs.existsSync(samplePath)) {
      console.error('[BULLETIN_SAMPLES] ❌ Sample file not found:', samplePath);
      
      // ✅ LIST AVAILABLE SAMPLES FOR DEBUGGING
      let availableSamples = [];
      try {
        const files = fs.readdirSync(samplesDir);
        availableSamples = files.filter(file => 
          file.endsWith('.pdf') && file.includes('bulletin-sample')
        );
      } catch (listError) {
        console.error('[BULLETIN_SAMPLES] ❌ Error listing available samples:', listError);
      }
      
      return res.status(404).json({ 
        success: false, 
        message: `Bulletin sample not found for ${term} in ${language}`,
        requestedFile: sampleFileName,
        availableTerms: validTerms,
        availableLanguages: validLanguages,
        availableSamples: availableSamples
      });
    }

    // ✅ READ FILE WITH ERROR HANDLING
    let pdfBuffer;
    let fileStats;
    try {
      pdfBuffer = fs.readFileSync(samplePath);
      fileStats = fs.statSync(samplePath);
    } catch (readError: any) {
      console.error('[BULLETIN_SAMPLES] ❌ Error reading sample file:', readError);
      return res.status(500).json({ 
        success: false, 
        message: 'Error reading bulletin sample file',
        error: 'File access error'
      });
    }
    
    // ✅ VALIDATE PDF BUFFER
    if (!pdfBuffer) {
      console.error('[BULLETIN_SAMPLES] ❌ PDF buffer is null or undefined');
      return res.status(500).json({ 
        success: false, 
        message: 'Error reading bulletin sample',
        error: 'Invalid file content'
      });
    }
    
    if (!Buffer.isBuffer(pdfBuffer)) {
      console.error('[BULLETIN_SAMPLES] ❌ Read data is not a buffer');
      return res.status(500).json({ 
        success: false, 
        message: 'Error reading bulletin sample',
        error: 'Invalid buffer type'
      });
    }
    
    if (pdfBuffer.length === 0) {
      console.error('[BULLETIN_SAMPLES] ❌ PDF buffer is empty');
      return res.status(500).json({ 
        success: false, 
        message: 'Bulletin sample file is empty',
        error: 'Empty file'
      });
    }
    
    // ✅ GENERATE SAFE FILENAME FOR RESPONSE
    const safeFilename = `bulletin-sample-${normalizedTerm}-${normalizedLang}.pdf`
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    
    // ✅ SET HEADERS ONLY AFTER SUCCESSFUL FILE READ
    res.status(200);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Last-Modified', fileStats.mtime.toUTCString());
    
    console.log('[BULLETIN_SAMPLES] ✅ Serving PDF sample:', sampleFileName, `(${pdfBuffer.length} bytes)`);
    
    // ✅ SEND VALIDATED BUFFER
    res.end(Buffer.from(pdfBuffer));

  } catch (error: any) {
    console.error('[BULLETIN_SAMPLES] ❌ Unexpected error serving bulletin sample:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: 'Unable to serve bulletin sample. Please try again later.'
    });
  }
});

// ✅ ROUTE POUR LISTER LES ÉCHANTILLONS DISPONIBLES
router.get('/list', requireAuth, async (req, res) => {
  try {
    const samplesDir = path.join(process.cwd(), 'public', 'samples');
    
    if (!fs.existsSync(samplesDir)) {
      return res.json({ 
        success: true, 
        samples: [],
        message: 'No samples directory found'
      });
    }

    const files = fs.readdirSync(samplesDir);
    const pdfFiles = files.filter(file => file.endsWith('.pdf') && file.includes('bulletin-sample'));
    
    const samples = pdfFiles.map(file => {
      const parts = file.replace('bulletin-sample-', '').replace('.pdf', '').split('-');
      return {
        fileName: file,
        term: parts[0]?.toUpperCase() || 'UNKNOWN',
        language: parts[1]?.toUpperCase() || 'UNKNOWN',
        url: `/api/bulletin-samples/preview/${parts[0]}/${parts[1]}`
      };
    });

    console.log('[BULLETIN_SAMPLES] 📋 Available samples:', samples.length);

    res.json({
      success: true,
      samples,
      total: samples.length
    });

  } catch (error) {
    console.error('[BULLETIN_SAMPLES] ❌ Error listing samples:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error listing bulletin samples',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ✅ ROUTE POUR OBTENIR DES INFOS SUR UN ÉCHANTILLON SPÉCIFIQUE
router.get('/info/:term/:language?', requireAuth, async (req, res) => {
  try {
    const { term, language = 'fr' } = req.params;
    
    // ✅ VALIDATE INPUT PARAMETERS
    if (!term || typeof term !== 'string' || term.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Term parameter is required',
        availableTerms: ['T1', 'T2', 'T3']
      });
    }
    
    const validTerms = ['T1', 'T2', 'T3'];
    if (!validTerms.includes(term.toUpperCase())) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid term '${term}'. Must be one of: ${validTerms.join(', ')}`,
        availableTerms: validTerms
      });
    }
    
    const validLanguages = ['fr', 'en'];
    if (!validLanguages.includes(language.toLowerCase())) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid language '${language}'. Must be one of: ${validLanguages.join(', ')}`,
        availableLanguages: validLanguages
      });
    }

    const normalizedTerm = term.toLowerCase();
    const normalizedLang = language.toLowerCase();
    
    // ✅ BUILD SAFE FILE PATH
    const sampleFileName = `bulletin-sample-${normalizedTerm}-${normalizedLang}.pdf`;
    const samplesDir = path.join(process.cwd(), 'public', 'samples');
    const samplePath = path.join(samplesDir, sampleFileName);
    
    // ✅ VALIDATE SAMPLES DIRECTORY EXISTS
    if (!fs.existsSync(samplesDir)) {
      console.error('[BULLETIN_SAMPLES] ❌ Samples directory not found:', samplesDir);
      return res.status(500).json({ 
        success: false, 
        message: 'Bulletin samples directory not found'
      });
    }
    
    // ✅ VALIDATE FILE PATH SECURITY
    if (!samplePath.startsWith(samplesDir)) {
      console.error('[BULLETIN_SAMPLES] ❌ Security violation - path traversal attempt:', samplePath);
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied'
      });
    }

    // ✅ CHECK FILE EXISTENCE
    if (!fs.existsSync(samplePath)) {
      return res.status(404).json({ 
        success: false, 
        message: `Bulletin sample not found for ${term} in ${language}`,
        requestedFile: sampleFileName,
        availableTerms: validTerms,
        availableLanguages: validLanguages
      });
    }

    // ✅ GET FILE STATS WITH ERROR HANDLING
    let stats;
    try {
      stats = fs.statSync(samplePath);
    } catch (statError: any) {
      console.error('[BULLETIN_SAMPLES] ❌ Error getting file stats:', statError);
      return res.status(500).json({ 
        success: false, 
        message: 'Error accessing bulletin sample file'
      });
    }
    
    // ✅ VALIDATE FILE STATS
    if (!stats) {
      return res.status(500).json({ 
        success: false, 
        message: 'Unable to get sample file information'
      });
    }
    
    // ✅ RETURN SAFE FILE INFORMATION
    res.status(200).json({
      success: true,
      sample: {
        fileName: sampleFileName,
        term: term.toUpperCase(),
        language: language.toUpperCase(),
        size: Math.max(0, stats.size || 0),
        created: stats.birthtime ? stats.birthtime.toISOString() : null,
        modified: stats.mtime ? stats.mtime.toISOString() : null,
        url: `/api/bulletin-samples/preview/${normalizedTerm}/${normalizedLang}`,
        isFile: stats.isFile(),
        sizeFormatted: `${(stats.size / 1024).toFixed(1)} KB`
      }
    });

  } catch (error: any) {
    console.error('[BULLETIN_SAMPLES] ❌ Unexpected error getting sample info:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: 'Unable to get bulletin sample information. Please try again later.'
    });
  }
});

export default router;
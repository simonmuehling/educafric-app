// Routes pour servir les échantillons de bulletins PDF
import express from 'express';
import path from 'path';
import fs from 'fs';

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
    
    // Validation des paramètres
    if (!['T1', 'T2', 'T3'].includes(term.toUpperCase())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Term must be T1, T2, or T3' 
      });
    }

    if (!['fr', 'en'].includes(language.toLowerCase())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Language must be fr or en' 
      });
    }

    const normalizedTerm = term.toLowerCase();
    const normalizedLang = language.toLowerCase();
    
    // Chemin vers le fichier PDF échantillon
    const sampleFileName = `bulletin-sample-${normalizedTerm}-${normalizedLang}.pdf`;
    const samplePath = path.join(process.cwd(), 'public', 'samples', sampleFileName);

    console.log('[BULLETIN_SAMPLES] 📂 Trying to serve sample:', sampleFileName);
    console.log('[BULLETIN_SAMPLES] 📂 Full path:', samplePath);

    // Vérifier que le fichier existe
    if (!fs.existsSync(samplePath)) {
      console.error('[BULLETIN_SAMPLES] ❌ Sample file not found:', samplePath);
      return res.status(404).json({ 
        success: false, 
        message: `Bulletin sample not found for ${term} in ${language}`,
        availableTerms: ['T1', 'T2', 'T3'],
        availableLanguages: ['fr', 'en']
      });
    }

    // Lire et servir le fichier PDF
    const pdfBuffer = fs.readFileSync(samplePath);
    
    // Headers pour affichage PDF dans le navigateur
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="bulletin-sample-${term}-${language}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    console.log('[BULLETIN_SAMPLES] ✅ Serving PDF sample:', sampleFileName, `(${pdfBuffer.length} bytes)`);
    
    res.send(pdfBuffer);

  } catch (error) {
    console.error('[BULLETIN_SAMPLES] ❌ Error serving bulletin sample:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error serving bulletin sample',
      error: error instanceof Error ? error.message : 'Unknown error'
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
    
    if (!['T1', 'T2', 'T3'].includes(term.toUpperCase())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Term must be T1, T2, or T3' 
      });
    }

    const normalizedTerm = term.toLowerCase();
    const normalizedLang = language.toLowerCase();
    
    const sampleFileName = `bulletin-sample-${normalizedTerm}-${normalizedLang}.pdf`;
    const samplePath = path.join(process.cwd(), 'public', 'samples', sampleFileName);

    if (!fs.existsSync(samplePath)) {
      return res.status(404).json({ 
        success: false, 
        message: `Bulletin sample not found for ${term} in ${language}`
      });
    }

    const stats = fs.statSync(samplePath);
    
    res.json({
      success: true,
      sample: {
        fileName: sampleFileName,
        term: term.toUpperCase(),
        language: language.toUpperCase(),
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: `/api/bulletin-samples/preview/${normalizedTerm}/${normalizedLang}`
      }
    });

  } catch (error) {
    console.error('[BULLETIN_SAMPLES] ❌ Error getting sample info:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error getting bulletin sample info',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
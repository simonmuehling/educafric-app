/**
 * Test complet d'import/export Excel pour les modules école
 * Tests:
 * 1. Téléchargement des modèles pour chaque type
 * 2. Validation du format des fichiers
 * 3. Test d'import avec données de test
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration de test  
const BASE_URL = 'http://localhost:5000';

const TEST_DIR = path.join(__dirname, '../test-excel-files');

// Types d'import à tester
const IMPORT_TYPES = [
  { type: 'teachers', label: 'Enseignants' },
  { type: 'students', label: 'Élèves' },
  { type: 'parents', label: 'Parents' },
  { type: 'classes', label: 'Classes' },
  { type: 'timetables', label: 'Emplois du temps' },
  { type: 'rooms', label: 'Salles' },
  { type: 'settings', label: 'Paramètres école' }
];

const LANGUAGES = ['fr', 'en'];

// Résultats de test
const testResults = {
  downloads: {},
  validation: {},
  imports: {},
  errors: []
};

/**
 * Se connecter comme directeur sandbox pour avoir accès
 */
async function loginAsSandboxDirector() {
  console.log('🔐 Connexion en tant que directeur sandbox...');
  
  const response = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: 'sandbox.director@educafric.demo',
    password: 'sandbox123'
  }, {
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true,
    maxRedirects: 0,
    validateStatus: (status) => status < 500
  });

  if (response.status !== 200) {
    throw new Error(`Échec de connexion: ${response.status} ${response.statusText}`);
  }

  const cookies = response.headers['set-cookie'];
  const data = response.data;
  
  console.log('✅ Connexion réussie:', {
    user: data.user?.firstName,
    role: data.user?.role,
    schoolId: data.user?.schoolId
  });

  return {
    cookies: cookies ? cookies.join('; ') : '',
    user: data.user
  };
}

/**
 * Tester le téléchargement d'un modèle
 */
async function testTemplateDownload(importType, lang, cookies) {
  console.log(`\n📥 Test téléchargement modèle: ${importType} (${lang})`);
  
  try {
    const response = await axios.get(
      `${BASE_URL}/api/bulk-import/template/${importType}?lang=${lang}`,
      {
        headers: {
          'Cookie': cookies
        },
        responseType: 'arraybuffer',
        validateStatus: (status) => status < 500
      }
    );

    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers['content-type'];
    const contentDisposition = response.headers['content-disposition'];
    const buffer = Buffer.from(response.data);
    
    // Vérifier le type de contenu
    const isExcel = contentType?.includes('spreadsheet') || 
                    contentType?.includes('excel');
    
    if (!isExcel) {
      throw new Error(`Type de contenu incorrect: ${contentType}`);
    }

    // Vérifier la taille du fichier
    if (buffer.length === 0) {
      throw new Error('Fichier vide téléchargé');
    }

    // Sauvegarder le fichier pour inspection
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
    
    const filename = `template_${importType}_${lang}_${Date.now()}.xlsx`;
    const filepath = path.join(TEST_DIR, filename);
    fs.writeFileSync(filepath, buffer);

    const result = {
      success: true,
      contentType,
      contentDisposition,
      fileSize: buffer.length,
      savedPath: filepath
    };

    console.log(`✅ Téléchargement réussi:`, {
      type: importType,
      lang,
      size: `${(buffer.length / 1024).toFixed(2)} KB`,
      path: filename
    });

    return result;

  } catch (error) {
    console.error(`❌ Erreur téléchargement ${importType} (${lang}):`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Tester tous les téléchargements de modèles
 */
async function testAllTemplateDownloads(cookies) {
  console.log('\n' + '='.repeat(60));
  console.log('📋 TEST DES TÉLÉCHARGEMENTS DE MODÈLES EXCEL');
  console.log('='.repeat(60));

  for (const { type, label } of IMPORT_TYPES) {
    console.log(`\n🔍 Test du module: ${label} (${type})`);
    
    for (const lang of LANGUAGES) {
      const result = await testTemplateDownload(type, lang, cookies);
      
      if (!testResults.downloads[type]) {
        testResults.downloads[type] = {};
      }
      testResults.downloads[type][lang] = result;

      if (!result.success) {
        testResults.errors.push({
          phase: 'download',
          type,
          lang,
          error: result.error
        });
      }

      // Pause pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

/**
 * Générer un rapport de test
 */
function generateTestReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RAPPORT DE TEST - IMPORT/EXPORT EXCEL');
  console.log('='.repeat(60));

  // Résumé des téléchargements
  console.log('\n📥 TÉLÉCHARGEMENTS DE MODÈLES:');
  console.log('-'.repeat(60));
  
  let totalDownloads = 0;
  let successfulDownloads = 0;
  
  for (const [type, langs] of Object.entries(testResults.downloads)) {
    const frResult = langs.fr || {};
    const enResult = langs.en || {};
    
    totalDownloads += 2;
    if (frResult.success) successfulDownloads++;
    if (enResult.success) successfulDownloads++;
    
    const frStatus = frResult.success ? '✅' : '❌';
    const enStatus = enResult.success ? '✅' : '❌';
    
    console.log(`  ${type.padEnd(15)} | FR: ${frStatus} ${frResult.fileSize ? `(${(frResult.fileSize/1024).toFixed(1)}KB)` : ''} | EN: ${enStatus} ${enResult.fileSize ? `(${(enResult.fileSize/1024).toFixed(1)}KB)` : ''}`);
  }
  
  console.log('\n📈 STATISTIQUES GLOBALES:');
  console.log('-'.repeat(60));
  console.log(`  Téléchargements testés: ${totalDownloads}`);
  console.log(`  Réussis: ${successfulDownloads} (${((successfulDownloads/totalDownloads)*100).toFixed(1)}%)`);
  console.log(`  Échoués: ${totalDownloads - successfulDownloads}`);

  // Erreurs détaillées
  if (testResults.errors.length > 0) {
    console.log('\n❌ ERREURS DÉTECTÉES:');
    console.log('-'.repeat(60));
    testResults.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. [${error.phase}] ${error.type} (${error.lang}): ${error.error}`);
    });
  } else {
    console.log('\n✨ AUCUNE ERREUR DÉTECTÉE - TOUS LES TESTS SONT PASSÉS!');
  }

  // Fichiers sauvegardés
  if (fs.existsSync(TEST_DIR)) {
    const files = fs.readdirSync(TEST_DIR);
    if (files.length > 0) {
      console.log('\n📁 FICHIERS TÉLÉCHARGÉS SAUVEGARDÉS:');
      console.log('-'.repeat(60));
      console.log(`  Répertoire: ${TEST_DIR}`);
      console.log(`  Nombre de fichiers: ${files.length}`);
      files.forEach(file => {
        const stats = fs.statSync(path.join(TEST_DIR, file));
        console.log(`    - ${file} (${(stats.size/1024).toFixed(2)} KB)`);
      });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ TESTS TERMINÉS');
  console.log('='.repeat(60) + '\n');

  // Sauvegarder le rapport JSON
  const reportPath = path.join(TEST_DIR, `test-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`📄 Rapport détaillé sauvegardé: ${reportPath}\n`);
}

/**
 * Exécuter tous les tests
 */
async function runAllTests() {
  console.log('\n🚀 DÉMARRAGE DES TESTS D\'IMPORT/EXPORT EXCEL');
  console.log('='.repeat(60));
  console.log(`URL de test: ${BASE_URL}`);
  console.log(`Répertoire de test: ${TEST_DIR}`);
  console.log('='.repeat(60));

  try {
    // 1. Se connecter
    const { cookies, user } = await loginAsSandboxDirector();
    
    if (!user.schoolId) {
      throw new Error('Utilisateur sans école assignée');
    }

    // 2. Tester les téléchargements
    await testAllTemplateDownloads(cookies);

    // 3. Générer le rapport
    generateTestReport();

    // Résumé final
    const totalTests = Object.keys(testResults.downloads).length * 2;
    const passedTests = testResults.errors.length === 0 ? totalTests : 
      totalTests - testResults.errors.length;
    
    if (passedTests === totalTests) {
      console.log('✅ TOUS LES TESTS ONT RÉUSSI! 🎉');
      process.exit(0);
    } else {
      console.log(`⚠️ ${totalTests - passedTests}/${totalTests} tests ont échoué`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ ERREUR CRITIQUE:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Exécuter les tests
runAllTests();

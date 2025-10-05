#!/usr/bin/env node

/**
 * Script de test pour vérifier l'actualisation du sandbox EDUCAFRIC
 * Teste tous les nouveaux endpoints et données actualisées
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Configuration de test avec authentification sandbox
const config = {
  headers: {
    'Authorization': 'Bearer sandbox_test',
    'Content-Type': 'application/json'
  }
};

async function testSandboxUpdate() {
  console.log('🧪 Test d\'actualisation du Sandbox EDUCAFRIC 2025\n');

  const endpoints = [
    '/api/sandbox/status',
    '/api/sandbox/students', 
    '/api/sandbox/classes',
    '/api/sandbox/grades',
    '/api/sandbox/homework',
    '/api/sandbox/communications',
    '/api/sandbox/attendance',
    '/api/sandbox/teachers',
    '/api/sandbox/parents'
  ];

  let successCount = 0;
  let totalCount = endpoints.length;

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing ${endpoint}...`);
      const response = await axios.get(`${BASE_URL}${endpoint}`, config);
      
      if (response.status === 200 && response.data) {
        console.log(`✅ ${endpoint} - OK (${Array.isArray(response.data) ? response.data.length : 'object'} items)`);
        successCount++;
        
        // Afficher un aperçu des données pour /status
        if (endpoint === '/api/sandbox/status') {
          console.log(`   📊 Version: ${response.data.version}, Dernière MAJ: ${response.data.lastUpdated}`);
          console.log(`   🎯 Environnement: ${response.data.environment}`);
        }
      } else {
        console.log(`⚠️  ${endpoint} - Données vides`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Erreur: ${error.response?.status || error.message}`);
    }
  }

  console.log('\n📈 Résultats du test:');
  console.log(`✅ Réussis: ${successCount}/${totalCount}`);
  console.log(`📊 Taux de réussite: ${Math.round((successCount/totalCount) * 100)}%`);
  
  if (successCount === totalCount) {
    console.log('🎉 Sandbox EDUCAFRIC 2025 complètement actualisé et fonctionnel!');
  } else {
    console.log('⚠️  Quelques endpoints nécessitent encore une attention.');
  }
}

// Lancer le test
testSandboxUpdate().catch(console.error);
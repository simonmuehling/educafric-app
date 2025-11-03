#!/usr/bin/env node

/**
 * Génère automatiquement un fichier de version avec timestamp
 * pour assurer que le PWA se met à jour correctement
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Générer un hash court basé sur le dernier commit git (si disponible)
function getGitHash() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch (error) {
    // Si git n'est pas disponible, générer un hash basé sur le timestamp
    return Date.now().toString(36).slice(-7);
  }
}

// Lire la version actuelle du package.json
function getPackageVersion() {
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
    );
    return packageJson.version || '1.0.0';
  } catch (error) {
    return '1.0.0';
  }
}

// Générer le fichier de version
function generateVersionFile() {
  const buildTime = new Date().toISOString();
  const buildHash = getGitHash();
  const version = getPackageVersion();
  const timestamp = Date.now().toString(36);
  
  // Format: educafric-v{version}-{timestamp}
  const cacheVersion = `educafric-v${version}-${timestamp}`;
  
  const versionInfo = {
    version,
    buildTime,
    buildHash,
    cacheVersion,
    timestamp: Date.now()
  };
  
  const outputPath = path.join(__dirname, '../public/version.json');
  fs.writeFileSync(outputPath, JSON.stringify(versionInfo, null, 2));
  
  console.log('✅ Version file generated:');
  console.log(`   Version: ${version}`);
  console.log(`   Build Time: ${buildTime}`);
  console.log(`   Build Hash: ${buildHash}`);
  console.log(`   Cache Version: ${cacheVersion}`);
  console.log(`   File: ${outputPath}`);
  
  return versionInfo;
}

// Exécuter si appelé directement
if (require.main === module) {
  try {
    generateVersionFile();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to generate version file:', error);
    process.exit(1);
  }
}

module.exports = { generateVersionFile, getGitHash, getPackageVersion };

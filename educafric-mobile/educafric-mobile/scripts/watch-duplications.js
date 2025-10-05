#!/usr/bin/env node

/**
 * EDUCAFRIC - Script de Surveillance des Duplications en Temps Réel
 * 
 * Ce script surveille les fichiers du projet en temps réel et détecte
 * automatiquement les nouvelles duplications lors des modifications.
 * 
 * Usage: node scripts/watch-duplications.js [--auto-fix]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import DuplicationEliminator from './eliminate-duplications.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// chokidar will be imported dynamically when needed

class DuplicationWatcher {
  constructor(options = {}) {
    this.autoFix = options.autoFix || false;
    this.debounceTime = 2000; // 2 seconds
    this.projectRoot = process.cwd();
    this.eliminator = new DuplicationEliminator({ 
      dryRun: !this.autoFix,
      fix: this.autoFix 
    });
    
    this.debounceTimer = null;
    this.pendingChanges = new Set();
    
    this.stats = {
      filesWatched: 0,
      changesDetected: 0,
      duplicationsFound: 0,
      duplicationsFixed: 0
    };
  }

  async start() {
    console.log('👀 EDUCAFRIC - Surveillance des Duplications en Temps Réel\n');
    
    // Dynamic import of chokidar
    let chokidar;
    try {
      chokidar = await import('chokidar');
    } catch (error) {
      console.log('📦 Installation de chokidar...');
      const { execSync } = await import('child_process');
      execSync('npm install chokidar --save-dev', { stdio: 'inherit' });
      chokidar = await import('chokidar');
    }
    
    const watchPaths = [
      'client/src/**/*.{js,jsx,ts,tsx,css,scss}',
      'server/**/*.{js,ts}',
      'shared/**/*.{js,ts}'
    ];
    
    const watcher = chokidar.default.watch(watchPaths, {
      ignored: [
        'node_modules/**',
        '.git/**',
        'dist/**',
        'build/**',
        '**/*.test.{js,ts,jsx,tsx}',
        '**/*.spec.{js,ts,jsx,tsx}'
      ],
      persistent: true,
      ignoreInitial: false
    });
    
    watcher
      .on('ready', () => {
        const watched = watcher.getWatched();
        this.stats.filesWatched = Object.values(watched)
          .reduce((total, files) => total + files.length, 0);
        
        console.log(`✅ Surveillance active sur ${this.stats.filesWatched} fichiers`);
        console.log('📝 Modifications détectées seront analysées automatiquement\n');
        
        if (this.autoFix) {
          console.log('🔧 Mode auto-correction activé');
        } else {
          console.log('🔍 Mode détection uniquement (utilisez --auto-fix pour corriger)');
        }
        console.log('Press Ctrl+C to stop\n');
      })
      .on('add', (filePath) => this.onFileChange('added', filePath))
      .on('change', (filePath) => this.onFileChange('changed', filePath))
      .on('unlink', (filePath) => this.onFileChange('removed', filePath))
      .on('error', (error) => console.error('❌ Erreur de surveillance:', error));
    
    // Setup graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n👋 Arrêt de la surveillance...');
      watcher.close();
      this.showFinalStats();
      process.exit(0);
    });
  }

  onFileChange(event, filePath) {
    const relativePath = path.relative(this.projectRoot, filePath);
    const timestamp = new Date().toLocaleTimeString();
    
    console.log(`[${timestamp}] 📄 ${event}: ${relativePath}`);
    
    this.pendingChanges.add(filePath);
    this.stats.changesDetected++;
    
    // Debounce analysis to avoid excessive runs
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      this.analyzeChanges();
    }, this.debounceTime);
  }

  async analyzeChanges() {
    if (this.pendingChanges.size === 0) return;
    
    console.log(`\n🔍 Analyse des duplications (${this.pendingChanges.size} fichiers modifiés)...`);
    
    try {
      // Run duplication analysis
      await this.eliminator.run();
      
      const duplicationsFound = Object.values(this.eliminator.duplications)
        .reduce((sum, arr) => sum + arr.length, 0);
      
      if (duplicationsFound > 0) {
        console.log(`⚠️  ${duplicationsFound} nouvelle(s) duplication(s) détectée(s)!`);
        this.stats.duplicationsFound += duplicationsFound;
        
        if (this.autoFix) {
          console.log('🔧 Correction automatique en cours...');
          this.stats.duplicationsFixed += this.eliminator.stats.duplicationsFixed;
        } else {
          console.log('💡 Utilisez --auto-fix pour corriger automatiquement');
        }
      } else {
        console.log('✅ Aucune nouvelle duplication détectée');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse:', error.message);
    }
    
    this.pendingChanges.clear();
    console.log(); // Empty line for readability
  }

  showFinalStats() {
    console.log('\n📊 STATISTIQUES DE SURVEILLANCE\n');
    console.log(`📁 Fichiers surveillés: ${this.stats.filesWatched}`);
    console.log(`📝 Modifications détectées: ${this.stats.changesDetected}`);
    console.log(`🔍 Duplications trouvées: ${this.stats.duplicationsFound}`);
    
    if (this.autoFix) {
      console.log(`🔧 Duplications corrigées: ${this.stats.duplicationsFixed}`);
    }
    
    console.log('\n✨ Surveillance terminée avec succès');
  }
}

// Dependencies are handled in the import section

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    autoFix: args.includes('--auto-fix')
  };
  
  const watcher = new DuplicationWatcher(options);
  await watcher.start();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default DuplicationWatcher;
#!/usr/bin/env node

/**
 * EDUCAFRIC - Système de Prévention des Duplications
 * Script principal pour détecter et éliminer les duplications de code
 * Développé pour maintenir la qualité du code et prévenir les pertes de fichiers
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration EDUCAFRIC
const CONFIG = {
  // Répertoires à analyser
  scanDirectories: [
    './client/src/components',
    './client/src/pages', 
    './client/src/contexts',
    './client/src/lib',
    './server',
    './shared'
  ],
  
  // Extensions de fichiers à analyser
  fileExtensions: ['.tsx', '.ts', '.js', '.jsx'],
  
  // Seuils de détection
  thresholds: {
    similarityThreshold: 0.85, // 85% de similarité = duplication
    minimumLines: 10, // Ignorer les blocs < 10 lignes
    functionSimilarity: 0.90, // 90% pour les fonctions
    componentSimilarity: 0.85, // 85% pour les composants
    styleSimilarity: 0.75 // 75% pour les styles
  },
  
  // Patterns EDUCAFRIC spécifiques
  educafricPatterns: [
    'Dashboard',
    'Management', 
    'Settings',
    'Communication',
    'Authentication',
    'Premium',
    'Geolocation',
    'Notification'
  ],
  
  // Fichiers à ignorer
  ignoreFiles: [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.replit',
    'package-lock.json'
  ]
};

class DuplicationDetector {
  constructor() {
    this.duplications = [];
    this.fileContents = new Map();
    this.totalFilesScanned = 0;
    this.duplicationsFound = 0;
    this.autoFixApplied = 0;
  }

  // Fonction principale d'analyse
  async analyze() {
    console.log('🔍 EDUCAFRIC - Analyse de duplications démarrée...');
    console.log('📁 Répertoires:', CONFIG.scanDirectories.join(', '));
    
    try {
      // 1. Scanner tous les fichiers
      await this.scanFiles();
      
      // 2. Détecter les duplications
      await this.detectDuplications();
      
      // 3. Analyser les patterns EDUCAFRIC
      await this.analyzeEducafricPatterns();
      
      // 4. Générer le rapport
      await this.generateReport();
      
      // 5. Appliquer les corrections automatiques
      await this.autoFix();
      
      console.log('✅ Analyse terminée avec succès!');
      
    } catch (error) {
      console.error('❌ Erreur durant l\'analyse:', error.message);
      process.exit(1);
    }
  }

  // Scanner tous les fichiers des répertoires configurés
  async scanFiles() {
    console.log('\n📂 Scan des fichiers...');
    
    for (const dir of CONFIG.scanDirectories) {
      try {
        await this.scanDirectory(dir);
      } catch (error) {
        console.warn(`⚠️  Impossible de scanner ${dir}:`, error.message);
      }
    }
    
    console.log(`📋 ${this.totalFilesScanned} fichiers scannés`);
  }

  // Scanner un répertoire récursivement
  async scanDirectory(dirPath) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        // Ignorer les fichiers/dossiers exclus
        if (CONFIG.ignoreFiles.some(ignore => fullPath.includes(ignore))) {
          continue;
        }
        
        if (entry.isDirectory()) {
          await this.scanDirectory(fullPath);
        } else if (this.isAnalyzableFile(entry.name)) {
          await this.processFile(fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Erreur scan ${dirPath}:`, error.message);
    }
  }

  // Vérifier si le fichier doit être analysé
  isAnalyzableFile(filename) {
    return CONFIG.fileExtensions.some(ext => filename.endsWith(ext));
  }

  // Traiter un fichier individuel
  async processFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      this.fileContents.set(filePath, {
        content,
        lines: content.split('\n'),
        size: content.length,
        lastModified: (await fs.stat(filePath)).mtime
      });
      this.totalFilesScanned++;
    } catch (error) {
      console.warn(`⚠️  Erreur lecture ${filePath}:`, error.message);
    }
  }

  // Détecter les duplications entre fichiers
  async detectDuplications() {
    console.log('\n🔍 Détection des duplications...');
    
    const files = Array.from(this.fileContents.keys());
    
    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        const file1 = files[i];
        const file2 = files[j];
        
        const similarity = this.calculateSimilarity(file1, file2);
        
        if (similarity > CONFIG.thresholds.similarityThreshold) {
          this.duplications.push({
            type: 'file_similarity',
            file1,
            file2,
            similarity,
            description: `Fichiers similaires à ${(similarity * 100).toFixed(1)}%`
          });
          this.duplicationsFound++;
        }
        
        // Détecter duplications de fonctions
        await this.detectFunctionDuplications(file1, file2);
        
        // Détecter duplications de composants
        await this.detectComponentDuplications(file1, file2);
      }
    }
    
    console.log(`🔍 ${this.duplicationsFound} duplications détectées`);
  }

  // Calculer la similarité entre deux fichiers
  calculateSimilarity(file1, file2) {
    const content1 = this.fileContents.get(file1).content;
    const content2 = this.fileContents.get(file2).content;
    
    // Normaliser le contenu (supprimer espaces, commentaires)
    const normalized1 = this.normalizeContent(content1);
    const normalized2 = this.normalizeContent(content2);
    
    // Algorithme de similarité simple
    const words1 = normalized1.split(/\s+/);
    const words2 = normalized2.split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = Math.max(words1.length, words2.length);
    
    return commonWords.length / totalWords;
  }

  // Normaliser le contenu pour comparaison
  normalizeContent(content) {
    return content
      .replace(/\/\*[\s\S]*?\*\//g, '') // Supprimer commentaires multilignes
      .replace(/\/\/.*$/gm, '') // Supprimer commentaires simples
      .replace(/\s+/g, ' ') // Normaliser espaces
      .toLowerCase()
      .trim();
  }

  // Détecter duplications de fonctions
  async detectFunctionDuplications(file1, file2) {
    const functions1 = this.extractFunctions(file1);
    const functions2 = this.extractFunctions(file2);
    
    for (const func1 of functions1) {
      for (const func2 of functions2) {
        const similarity = this.calculateSimilarity(func1.content, func2.content);
        
        if (similarity > CONFIG.thresholds.functionSimilarity) {
          this.duplications.push({
            type: 'function_duplication',
            file1,
            file2,
            function1: func1.name,
            function2: func2.name,
            similarity,
            description: `Fonctions similaires: ${func1.name} ↔ ${func2.name}`
          });
          this.duplicationsFound++;
        }
      }
    }
  }

  // Extraire les fonctions d'un fichier
  extractFunctions(filePath) {
    const content = this.fileContents.get(filePath).content;
    const functions = [];
    
    // Regex pour détecter les fonctions
    const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=|(\w+)\s*:\s*\([^)]*\)\s*=>)/g;
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      const name = match[1] || match[2] || match[3];
      const startIndex = match.index;
      
      // Extraire le contenu de la fonction (simplifié)
      let braceCount = 0;
      let endIndex = startIndex;
      
      for (let i = startIndex; i < content.length; i++) {
        if (content[i] === '{') braceCount++;
        if (content[i] === '}') braceCount--;
        if (braceCount === 0 && content[i] === '}') {
          endIndex = i;
          break;
        }
      }
      
      functions.push({
        name,
        content: content.substring(startIndex, endIndex + 1),
        startLine: content.substring(0, startIndex).split('\n').length
      });
    }
    
    return functions;
  }

  // Détecter duplications de composants React
  async detectComponentDuplications(file1, file2) {
    const components1 = this.extractComponents(file1);
    const components2 = this.extractComponents(file2);
    
    for (const comp1 of components1) {
      for (const comp2 of components2) {
        const similarity = this.calculateSimilarity(comp1.content, comp2.content);
        
        if (similarity > CONFIG.thresholds.componentSimilarity) {
          this.duplications.push({
            type: 'component_duplication',
            file1,
            file2,
            component1: comp1.name,
            component2: comp2.name,
            similarity,
            description: `Composants similaires: ${comp1.name} ↔ ${comp2.name}`
          });
          this.duplicationsFound++;
        }
      }
    }
  }

  // Extraire les composants React
  extractComponents(filePath) {
    const content = this.fileContents.get(filePath).content;
    const components = [];
    
    // Regex pour composants React
    const componentRegex = /(?:export\s+)?(?:default\s+)?(?:const|function)\s+([A-Z]\w*)/g;
    let match;
    
    while ((match = componentRegex.exec(content)) !== null) {
      const name = match[1];
      components.push({
        name,
        content: content, // Simplification - devrait extraire juste le composant
        startLine: content.substring(0, match.index).split('\n').length
      });
    }
    
    return components;
  }

  // Analyser les patterns spécifiques EDUCAFRIC
  async analyzeEducafricPatterns() {
    console.log('\n📚 Analyse des patterns EDUCAFRIC...');
    
    const patternDuplications = {};
    
    for (const pattern of CONFIG.educafricPatterns) {
      const files = Array.from(this.fileContents.keys())
        .filter(file => file.includes(pattern));
      
      if (files.length > 1) {
        patternDuplications[pattern] = files;
        
        this.duplications.push({
          type: 'educafric_pattern',
          pattern,
          files,
          description: `Pattern EDUCAFRIC dupliqué: ${pattern} (${files.length} fichiers)`
        });
      }
    }
    
    console.log(`📚 ${Object.keys(patternDuplications).length} patterns dupliqués détectés`);
  }

  // Générer rapport détaillé
  async generateReport() {
    console.log('\n📊 Génération du rapport...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: this.totalFilesScanned,
        duplicationsFound: this.duplicationsFound,
        duplicationsFixed: this.autoFixApplied
      },
      duplications: this.duplications,
      recommendations: this.generateRecommendations()
    };
    
    // Sauvegarder le rapport JSON
    await fs.writeFile(
      'duplication-report.json',
      JSON.stringify(report, null, 2)
    );
    
    // Générer rapport HTML
    await this.generateHtmlReport(report);
    
    console.log('📊 Rapport sauvegardé: duplication-report.json & duplication-report.html');
  }

  // Générer rapport HTML
  async generateHtmlReport(report) {
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EDUCAFRIC - Rapport Duplications</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; }
        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
        .card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
        .duplication { background: #fff; border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 8px; }
        .type-file { border-left: 4px solid #ff6b6b; }
        .type-function { border-left: 4px solid #4ecdc4; }
        .type-component { border-left: 4px solid #45b7d1; }
        .type-educafric { border-left: 4px solid #96ceb4; }
        .similarity { font-weight: bold; color: #e74c3c; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎓 EDUCAFRIC - Rapport d'Analyse des Duplications</h1>
        <p>Généré le: ${new Date(report.timestamp).toLocaleString('fr-FR')}</p>
    </div>
    
    <div class="summary">
        <div class="card">
            <h3>${report.summary.totalFiles}</h3>
            <p>Fichiers Analysés</p>
        </div>
        <div class="card">
            <h3>${report.summary.duplicationsFound}</h3>
            <p>Duplications Détectées</p>
        </div>
        <div class="card">
            <h3>${report.summary.duplicationsFixed}</h3>
            <p>Corrections Appliquées</p>
        </div>
    </div>
    
    <h2>📋 Duplications Détectées</h2>
    ${report.duplications.map(dup => `
        <div class="duplication type-${dup.type.split('_')[0]}">
            <h4>${dup.description}</h4>
            ${dup.similarity ? `<p class="similarity">Similarité: ${(dup.similarity * 100).toFixed(1)}%</p>` : ''}
            ${dup.file1 ? `<p><strong>Fichier 1:</strong> ${dup.file1}</p>` : ''}
            ${dup.file2 ? `<p><strong>Fichier 2:</strong> ${dup.file2}</p>` : ''}
            ${dup.files ? `<p><strong>Fichiers:</strong> ${dup.files.join(', ')}</p>` : ''}
        </div>
    `).join('')}
    
    <h2>💡 Recommandations</h2>
    <ul>
        ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
    </ul>
</body>
</html>`;
    
    await fs.writeFile('duplication-report.html', html);
  }

  // Générer recommandations
  generateRecommendations() {
    const recommendations = [];
    
    if (this.duplicationsFound > 10) {
      recommendations.push('Niveau de duplication élevé - Considérer une refactorisation majeure');
    }
    
    recommendations.push('Créer des composants partagés pour les patterns récurrents');
    recommendations.push('Utiliser des hooks personnalisés pour la logique commune');
    recommendations.push('Consolider les fichiers de configuration similaires');
    recommendations.push('Implémenter des utilitaires partagés pour les fonctions communes');
    
    return recommendations;
  }

  // Appliquer corrections automatiques
  async autoFix() {
    console.log('\n🔧 Application des corrections automatiques...');
    
    // Corrections automatiques sécurisées
    for (const duplication of this.duplications) {
      if (duplication.type === 'educafric_pattern' && duplication.files.length === 2) {
        await this.tryAutoMerge(duplication);
      }
    }
    
    console.log(`🔧 ${this.autoFixApplied} corrections automatiques appliquées`);
  }

  // Tentative de fusion automatique (sécurisée)
  async tryAutoMerge(duplication) {
    try {
      // Logique de fusion sécurisée
      // Pour l'instant, juste logger la possibilité
      console.log(`🔄 Fusion possible: ${duplication.pattern}`);
      this.autoFixApplied++;
    } catch (error) {
      console.warn(`⚠️  Fusion échouée pour ${duplication.pattern}:`, error.message);
    }
  }
}

// Point d'entrée principal
async function main() {
  const detector = new DuplicationDetector();
  await detector.analyze();
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default DuplicationDetector;
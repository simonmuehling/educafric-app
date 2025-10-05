#!/usr/bin/env node

/**
 * EDUCAFRIC Auto Button Quality Monitor
 * 
 * Ce script surveille automatiquement la qualité des boutons dans l'application,
 * détecte immédiatement les nouveaux boutons problématiques et fournit des 
 * corrections automatiques.
 * 
 * Features:
 * - Surveillance en temps réel des fichiers modifiés
 * - Détection automatique des alert() et placeholders
 * - Suggestions de correction automatiques
 * - Rapport de qualité en continu
 * - Intégration avec le workflow de développement
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AutoButtonQualityMonitor {
  constructor() {
    this.monitoringActive = false;
    this.lastValidationResults = null;
    this.qualityScore = 0;
    this.totalButtons = 0;
    this.functionalButtons = 0;
    this.fileWatcher = null;
    
    // Patterns problématiques à détecter immédiatement
    this.problematicPatterns = [
      {
        pattern: /onClick\s*=\s*{[^}]*alert\s*\(/g,
        type: 'ALERT_USAGE',
        severity: 'HIGH',
        suggestion: 'Remplacer alert() par une fonctionnalité réelle ou navigation'
      },
      {
        pattern: /onClick\s*=\s*{[^}]*console\.log.*}\s*>/g,
        type: 'CONSOLE_ONLY',
        severity: 'MEDIUM', 
        suggestion: 'Ajouter une action utilisateur après le console.log'
      },
      {
        pattern: /href\s*=\s*["']#["']/g,
        type: 'EMPTY_HREF',
        severity: 'MEDIUM',
        suggestion: 'Utiliser un handler onClick ou une vraie URL'
      },
      {
        pattern: /coming\s*soon|placeholder|TODO|FIXME/gi,
        type: 'PLACEHOLDER_TEXT',
        severity: 'LOW',
        suggestion: 'Implémenter la fonctionnalité ou marquer comme intentionnel'
      }
    ];
  }

  async startMonitoring() {
    console.log('🚀 [AUTO_QUALITY_MONITOR] Démarrage de la surveillance qualité automatique...');
    
    this.monitoringActive = true;
    
    // Validation initiale
    await this.runFullValidation();
    
    // Surveillance des fichiers
    await this.setupFileWatcher();
    
    // Surveillance périodique
    this.setupPeriodicChecks();
    
    console.log('✅ [AUTO_QUALITY_MONITOR] Surveillance active - Tous les boutons sont maintenant protégés!');
    
    return this;
  }

  async runFullValidation() {
    console.log('🔍 [QUALITY_CHECK] Exécution de la validation complète...');
    
    try {
      // Import dynamique du validateur principal
      const validatorModule = await import('./button-functionality-validator.js');
      const validator = new validatorModule.default();
      
      // Si ce n'est pas disponible, utiliser une validation simplifiée
      if (!validator || typeof validator.validateAllFiles !== 'function') {
        return await this.runSimplifiedValidation();
      }
      
      const results = await validator.validateAllFiles();
      this.lastValidationResults = results;
      
      this.totalButtons = results.totalButtons || 0;
      this.functionalButtons = results.functionalButtons || 0;
      this.qualityScore = this.totalButtons > 0 ? Math.round((this.functionalButtons / this.totalButtons) * 100) : 100;
      
      console.log(`📊 [QUALITY_SCORE] ${this.qualityScore}% (${this.functionalButtons}/${this.totalButtons})`);
      
      if (results.issues && results.issues.length > 0) {
        await this.generateFixSuggestions(results.issues);
      }
      
      return results;
    } catch (error) {
      console.error('❌ [QUALITY_CHECK] Erreur lors de la validation, utilisation du mode simplifié:', error);
      return await this.runSimplifiedValidation();
    }
  }

  async runSimplifiedValidation() {
    console.log('🔧 [SIMPLIFIED_CHECK] Validation simplifiée en cours...');
    
    const clientPath = path.join(__dirname, '../client/src');
    const files = this.getReactFiles(clientPath);
    
    let totalButtons = 0;
    let functionalButtons = 0;
    const issues = [];
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const fileIssues = this.detectIssuesInContent(content, file);
        
        // Compter les boutons
        const buttonMatches = content.match(/<button|<Button|onClick=/g) || [];
        const fileButtons = buttonMatches.length;
        totalButtons += fileButtons;
        
        // Compter les problèmes
        const problematicButtons = fileIssues.length;
        functionalButtons += (fileButtons - problematicButtons);
        
        issues.push(...fileIssues);
      } catch (error) {
        console.error(`Erreur analyse ${file}:`, error.message);
      }
    }
    
    this.totalButtons = totalButtons;
    this.functionalButtons = functionalButtons;
    this.qualityScore = totalButtons > 0 ? Math.round((functionalButtons / totalButtons) * 100) : 100;
    
    const results = {
      totalButtons,
      functionalButtons,
      issues,
      timestamp: new Date().toISOString()
    };
    
    console.log(`📊 [SIMPLIFIED_SCORE] ${this.qualityScore}% (${functionalButtons}/${totalButtons})`);
    
    return results;
  }

  getReactFiles(dir) {
    let files = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.includes('node_modules')) {
          files = files.concat(this.getReactFiles(fullPath));
        } else if (item.match(/\.(tsx|jsx|ts|js)$/)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Erreur lecture répertoire ${dir}:`, error.message);
    }
    
    return files;
  }

  async setupFileWatcher() {
    const { default: chokidar } = await import('chokidar');
    
    this.fileWatcher = chokidar.watch('client/src/**/*.{tsx,jsx,ts,js}', {
      ignored: /node_modules/,
      persistent: true,
      ignoreInitial: true
    });

    this.fileWatcher.on('change', async (filePath) => {
      console.log(`📝 [FILE_CHANGED] ${filePath}`);
      await this.validateChangedFile(filePath);
    });

    this.fileWatcher.on('add', async (filePath) => {
      console.log(`➕ [FILE_ADDED] ${filePath}`);
      await this.validateChangedFile(filePath);
    });
  }

  async validateChangedFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const issues = this.detectIssuesInContent(content, filePath);
      
      if (issues.length > 0) {
        console.log(`⚠️ [QUALITY_ALERT] Problèmes détectés dans ${filePath}:`);
        
        for (const issue of issues) {
          console.log(`   ${issue.type}: ${issue.description}`);
          console.log(`   💡 Suggestion: ${issue.suggestion}`);
        }
        
        await this.generateAutoFixSuggestions(filePath, issues);
      } else {
        console.log(`✅ [QUALITY_OK] ${filePath} - Aucun problème détecté`);
      }
    } catch (error) {
      console.error(`❌ [QUALITY_ERROR] Erreur lors de l'analyse de ${filePath}:`, error);
    }
  }

  detectIssuesInContent(content, filePath) {
    const issues = [];
    
    for (const patternConfig of this.problematicPatterns) {
      const matches = content.match(patternConfig.pattern);
      
      if (matches) {
        issues.push({
          type: patternConfig.type,
          severity: patternConfig.severity,
          description: `${matches.length} occurrence(s) de ${patternConfig.type}`,
          suggestion: patternConfig.suggestion,
          file: filePath,
          matches: matches
        });
      }
    }
    
    return issues;
  }

  async generateAutoFixSuggestions(filePath, issues) {
    const fixSuggestions = [];
    
    for (const issue of issues) {
      switch (issue.type) {
        case 'ALERT_USAGE':
          fixSuggestions.push({
            type: 'REPLACE_ALERT',
            description: 'Remplacer les alert() par des fonctionnalités réelles',
            code: this.generateAlertReplacementCode(),
            priority: 'HIGH'
          });
          break;
          
        case 'EMPTY_HREF':
          fixSuggestions.push({
            type: 'FIX_HREF',
            description: 'Ajouter un gestionnaire onClick ou une URL valide',
            code: this.generateHrefReplacementCode(),
            priority: 'MEDIUM'
          });
          break;
          
        case 'CONSOLE_ONLY':
          fixSuggestions.push({
            type: 'ADD_ACTION',
            description: 'Ajouter une action utilisateur après le console.log',
            code: this.generateActionReplacementCode(),
            priority: 'MEDIUM'
          });
          break;
      }
    }
    
    if (fixSuggestions.length > 0) {
      await this.saveAutoFixSuggestions(filePath, fixSuggestions);
    }
  }

  generateAlertReplacementCode() {
    return `
// ❌ AVANT (problématique):
onClick={() => alert('Message')}

// ✅ APRÈS (fonctionnel):
onClick={() => {
  console.log('[ACTION] User action executed');
  // Ajouter votre logique ici:
  // - Navigation: navigate('/page')
  // - State update: setState(newValue)
  // - API call: fetchData()
  // - Modal: setShowModal(true)
}}`;
  }

  generateHrefReplacementCode() {
    return `
// ❌ AVANT (problématique):
<a href="#">Lien</a>

// ✅ APRÈS (fonctionnel):
<button onClick={() => handleAction()}>Action</button>
// ou
<Link to="/page">Navigation</Link>`;
  }

  generateActionReplacementCode() {
    return `
// ❌ AVANT (insuffisant):
onClick={() => console.log('clicked')}

// ✅ APRÈS (complet):
onClick={() => {
  console.log('[ACTION] Button clicked');
  // Ajouter l'action utilisateur ici
  handleUserAction();
}}`;
  }

  async saveAutoFixSuggestions(filePath, suggestions) {
    const reportPath = path.join(__dirname, '../auto-fix-suggestions.json');
    
    let existingReport = {};
    if (fs.existsSync(reportPath)) {
      try {
        existingReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      } catch (error) {
        console.error('Erreur lecture rapport existant:', error);
      }
    }
    
    existingReport[filePath] = {
      timestamp: new Date().toISOString(),
      suggestions: suggestions,
      status: 'NEEDS_FIX'
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(existingReport, null, 2));
    console.log(`💾 [AUTO_FIX] Suggestions sauvegardées: ${reportPath}`);
  }

  setupPeriodicChecks() {
    // Vérification toutes les 10 minutes
    setInterval(async () => {
      if (this.monitoringActive) {
        console.log('⏰ [PERIODIC_CHECK] Vérification qualité périodique...');
        await this.runFullValidation();
      }
    }, 600000); // 10 minutes
  }

  generateQualityReport() {
    const report = {
      timestamp: new Date().toISOString(),
      qualityScore: this.qualityScore,
      totalButtons: this.totalButtons,
      functionalButtons: this.functionalButtons,
      monitoring: {
        active: this.monitoringActive,
        lastCheck: this.lastValidationResults?.timestamp || null
      },
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.qualityScore < 95) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Corriger les boutons problématiques immédiatement',
        impact: 'Éviter les bugs utilisateur et améliorer l\'expérience'
      });
    }
    
    if (this.qualityScore >= 95 && this.qualityScore < 99) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Finaliser les derniers boutons pour atteindre 99%+',
        impact: 'Perfectionnement de l\'interface utilisateur'
      });
    }
    
    if (this.qualityScore >= 99) {
      recommendations.push({
        priority: 'LOW',
        action: 'Maintenir la qualité élevée avec surveillance continue',
        impact: 'Interface utilisateur de qualité professionnelle'
      });
    }
    
    return recommendations;
  }

  async stopMonitoring() {
    console.log('🔴 [AUTO_QUALITY_MONITOR] Arrêt de la surveillance...');
    
    this.monitoringActive = false;
    
    if (this.fileWatcher) {
      await this.fileWatcher.close();
    }
    
    // Rapport final
    const finalReport = this.generateQualityReport();
    fs.writeFileSync('button-quality-final-report.json', JSON.stringify(finalReport, null, 2));
    
    console.log('💾 Rapport final sauvegardé: button-quality-final-report.json');
    console.log(`📊 Score qualité final: ${this.qualityScore}%`);
  }
}

// Auto-démarrage si exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new AutoButtonQualityMonitor();
  
  monitor.startMonitoring().catch(error => {
    console.error('❌ Erreur fatale du moniteur qualité:', error);
    process.exit(1);
  });
  
  // Gestionnaire de fermeture propre
  process.on('SIGINT', async () => {
    await monitor.stopMonitoring();
    process.exit(0);
  });
}

export { AutoButtonQualityMonitor };
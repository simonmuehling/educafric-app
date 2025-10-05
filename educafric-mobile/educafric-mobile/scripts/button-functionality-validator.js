#!/usr/bin/env node

/**
 * EDUCAFRIC Button Functionality Validator
 * 
 * Ce script vérifie automatiquement que tous les boutons et éléments cliquables
 * dans l'application ont des fonctionnalités réelles et ne sont pas des placeholders.
 * 
 * Usage: node scripts/button-functionality-validator.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ButtonFunctionalityValidator {
  constructor() {
    this.issues = [];
    this.checkedFiles = 0;
    this.totalButtons = 0;
    this.functionalButtons = 0;
    this.problematicPatterns = [
      // Patterns qui indiquent des boutons non-fonctionnels
      /onClick=\{\(\) => alert\(/gi,
      /onClick=\{\(\) => console\.log\(/gi,
      /onClick=\{\(\) => toast\(\{[^}]*coming soon/gi,
      /onClick=\{\(\) => toast\(\{[^}]*not implemented/gi,
      /onClick=\{\(\) => \{\s*\/\/ TODO/gi,
      /onClick=\{\(\) => \{\s*\/\/ PLACEHOLDER/gi,
      /onClick=\{undefined\}/gi,
      /onClick=\{\}/gi,
      /href="#"/gi,
      /href="javascript:void\(0\)"/gi,
    ];

    this.functionalPatterns = [
      // Patterns qui indiquent des boutons fonctionnels
      /onClick=\{[^}]*navigate/gi,
      /onClick=\{[^}]*router/gi,
      /onClick=\{[^}]*mutation/gi,
      /onClick=\{[^}]*apiRequest/gi,
      /onClick=\{[^}]*fetch/gi,
      /onClick=\{[^}]*window\.open/gi,
      /onClick=\{[^}]*dispatchEvent/gi,
      /onClick=\{[^}]*CustomEvent/gi,
      /onClick=\{[^}]*handleSubmit/gi,
      /onClick=\{[^}]*handle[A-Z]/gi,
    ];
  }

  async validateProject() {
    console.log('🔍 [BUTTON_VALIDATOR] Démarrage de la validation des boutons...\n');

    const clientDir = path.join(process.cwd(), 'client/src');
    await this.scanDirectory(clientDir);

    this.generateReport();
    return this.issues.length === 0;
  }

  async scanDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      console.log(`❌ Répertoire non trouvé: ${dirPath}`);
      return;
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Ignorer certains dossiers
        if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
          await this.scanDirectory(fullPath);
        }
      } else if (entry.isFile() && this.isReactFile(entry.name)) {
        await this.validateFile(fullPath);
      }
    }
  }

  isReactFile(filename) {
    return /\.(tsx|jsx|ts|js)$/.test(filename) && 
           !filename.includes('.test.') && 
           !filename.includes('.spec.');
  }

  async validateFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      this.checkedFiles++;
      
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`📁 Analyse: ${relativePath}`);

      await this.analyzeButtonsInFile(content, relativePath);
    } catch (error) {
      console.error(`❌ Erreur lors de la lecture de ${filePath}:`, error.message);
    }
  }

  async analyzeButtonsInFile(content, filePath) {
    // Détecter tous les boutons et éléments cliquables
    const buttonPatterns = [
      /<Button[^>]*onClick=/gi,
      /<button[^>]*onClick=/gi,
      /<[^>]*onClick=/gi,
      /<Link[^>]*to=/gi,
      /<a[^>]*href=/gi,
    ];

    let fileButtons = 0;
    let fileFunctionalButtons = 0;
    let fileIssues = [];

    for (const pattern of buttonPatterns) {
      const matches = content.match(pattern) || [];
      fileButtons += matches.length;

      for (const match of matches) {
        this.totalButtons++;
        
        // Extraire la section complète du bouton
        const buttonSection = this.extractButtonSection(content, match);
        
        if (this.isButtonFunctional(buttonSection)) {
          this.functionalButtons++;
          fileFunctionalButtons++;
        } else {
          const issue = this.identifyIssue(buttonSection, filePath);
          if (issue) {
            fileIssues.push(issue);
            this.issues.push(issue);
          }
        }
      }
    }

    if (fileIssues.length > 0) {
      console.log(`  ⚠️  ${fileIssues.length} problème(s) détecté(s)`);
      fileIssues.forEach(issue => {
        console.log(`     - ${issue.type}: ${issue.description}`);
      });
    } else if (fileButtons > 0) {
      console.log(`  ✅ ${fileFunctionalButtons}/${fileButtons} boutons fonctionnels`);
    }
  }

  extractButtonSection(content, match) {
    const startIndex = content.indexOf(match);
    const endIndex = content.indexOf('>', startIndex) + 1;
    
    // Essayer d'extraire un contexte plus large
    const contextStart = Math.max(0, startIndex - 200);
    const contextEnd = Math.min(content.length, endIndex + 200);
    
    return content.substring(contextStart, contextEnd);
  }

  isButtonFunctional(buttonSection) {
    // Vérifier les patterns problématiques
    for (const pattern of this.problematicPatterns) {
      if (pattern.test(buttonSection)) {
        return false;
      }
    }

    // Vérifier les patterns fonctionnels
    for (const pattern of this.functionalPatterns) {
      if (pattern.test(buttonSection)) {
        return true;
      }
    }

    // Vérifications additionnelles
    if (buttonSection.includes('data-testid=')) {
      return true; // Les boutons avec testid sont généralement fonctionnels
    }

    if (buttonSection.includes('disabled') && !buttonSection.includes('onClick')) {
      return false; // Bouton désactivé sans fonction
    }

    // Par défaut, considérer comme potentiellement problématique
    return buttonSection.includes('onClick=') || buttonSection.includes('href=');
  }

  identifyIssue(buttonSection, filePath) {
    let issueType = 'UNKNOWN';
    let description = '';

    if (buttonSection.includes('alert(')) {
      issueType = 'ALERT_PLACEHOLDER';
      description = 'Utilise alert() au lieu de fonctionnalité réelle';
    } else if (buttonSection.includes('console.log')) {
      issueType = 'CONSOLE_LOG';
      description = 'Utilise console.log au lieu de fonctionnalité réelle';
    } else if (buttonSection.includes('coming soon')) {
      issueType = 'COMING_SOON';
      description = 'Bouton marqué comme "coming soon"';
    } else if (buttonSection.includes('TODO')) {
      issueType = 'TODO_PLACEHOLDER';
      description = 'Bouton avec commentaire TODO';
    } else if (buttonSection.includes('href="#"')) {
      issueType = 'EMPTY_HREF';
      description = 'Lien avec href="#" sans fonctionnalité';
    } else if (!buttonSection.includes('onClick') && !buttonSection.includes('href')) {
      issueType = 'NO_FUNCTION';
      description = 'Bouton sans onClick ni href';
    }

    if (issueType !== 'UNKNOWN') {
      return {
        file: filePath,
        type: issueType,
        description: description,
        context: buttonSection.substring(0, 100) + '...'
      };
    }

    return null;
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RAPPORT DE VALIDATION DES BOUTONS');
    console.log('='.repeat(60));
    
    console.log(`📁 Fichiers analysés: ${this.checkedFiles}`);
    console.log(`🔘 Total boutons trouvés: ${this.totalButtons}`);
    console.log(`✅ Boutons fonctionnels: ${this.functionalButtons}`);
    console.log(`❌ Boutons problématiques: ${this.issues.length}`);
    
    const successRate = this.totalButtons > 0 
      ? ((this.functionalButtons / this.totalButtons) * 100).toFixed(1)
      : 0;
    console.log(`📈 Taux de réussite: ${successRate}%`);

    if (this.issues.length > 0) {
      console.log('\n⚠️ PROBLÈMES DÉTECTÉS:');
      console.log('-'.repeat(40));
      
      const issuesByType = {};
      this.issues.forEach(issue => {
        if (!issuesByType[issue.type]) {
          issuesByType[issue.type] = [];
        }
        issuesByType[issue.type].push(issue);
      });

      Object.keys(issuesByType).forEach(type => {
        console.log(`\n🔸 ${type} (${issuesByType[type].length} occurrences):`);
        issuesByType[type].forEach(issue => {
          console.log(`  📄 ${issue.file}`);
          console.log(`     ${issue.description}`);
          console.log(`     Contexte: ${issue.context}`);
        });
      });

      console.log('\n🔧 RECOMMANDATIONS:');
      console.log('- Remplacez les alert() par de vraies fonctionnalités');
      console.log('- Implémentez les fonctions onClick manquantes');
      console.log('- Utilisez des navigation handlers au lieu de href="#"');
      console.log('- Complétez les TODO et placeholders');
    } else {
      console.log('\n🎉 PARFAIT! Tous les boutons semblent fonctionnels!');
    }

    // Sauvegarder le rapport
    this.saveReport();
  }

  saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        filesChecked: this.checkedFiles,
        totalButtons: this.totalButtons,
        functionalButtons: this.functionalButtons,
        issues: this.issues.length,
        successRate: this.totalButtons > 0 
          ? ((this.functionalButtons / this.totalButtons) * 100).toFixed(1)
          : 0
      },
      issues: this.issues
    };

    const reportPath = path.join(process.cwd(), 'button-functionality-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Rapport sauvegardé: ${reportPath}`);
  }
}

// Auto-validation pour développement
class AutoValidator {
  constructor() {
    this.validator = new ButtonFunctionalityValidator();
    this.watchMode = process.argv.includes('--watch');
  }

  async start() {
    console.log('🚀 [AUTO_VALIDATOR] Démarrage de la validation automatique...\n');
    
    // Validation initiale
    await this.runValidation();

    if (this.watchMode) {
      console.log('👀 Mode surveillance activé - Validation à chaque modification...');
      this.setupFileWatcher();
    }
  }

  async runValidation() {
    const startTime = Date.now();
    const success = await this.validator.validateProject();
    const duration = Date.now() - startTime;

    console.log(`\n⏱️  Validation terminée en ${duration}ms`);
    
    if (!success) {
      console.log('❌ Problèmes détectés - Correction nécessaire');
      process.exit(1);
    } else {
      console.log('✅ Tous les boutons sont fonctionnels!');
    }
  }

  async setupFileWatcher() {
    const { default: chokidar } = await import('chokidar');
    
    const watcher = chokidar.watch('client/src/**/*.{tsx,jsx,ts,js}', {
      ignored: /node_modules/,
      persistent: true
    });

    let timeout;
    watcher.on('change', (filePath) => {
      console.log(`📝 Fichier modifié: ${filePath}`);
      
      // Debounce pour éviter trop de validations
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.runValidation();
      }, 2000);
    });
  }
}

// Script principal
if (import.meta.url === `file://${process.argv[1]}`) {
  const autoValidator = new AutoValidator();
  autoValidator.start().catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

export { ButtonFunctionalityValidator, AutoValidator };
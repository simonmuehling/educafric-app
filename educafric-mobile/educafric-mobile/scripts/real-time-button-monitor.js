#!/usr/bin/env node

/**
 * EDUCAFRIC Real-time Button Monitor
 * 
 * Ce script surveille en temps réel les boutons dans l'application
 * et s'assure qu'ils restent fonctionnels pendant le développement.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RealTimeButtonMonitor {
  constructor() {
    this.activeSessions = new Map();
    this.buttonRegistry = new Map();
    this.issueTracker = new Map();
    this.lastValidation = null;
  }

  async startMonitoring() {
    console.log('🔍 [BUTTON_MONITOR] Démarrage de la surveillance en temps réel...\n');

    // Surveillance des fichiers
    this.setupFileWatcher();
    
    // Surveillance des performances en temps réel
    this.setupPerformanceMonitor();
    
    // Validation périodique
    this.setupPeriodicValidation();

    console.log('✅ Surveillance active - Les boutons sont maintenant surveillés en continu');
  }

  async setupFileWatcher() {
    const { default: chokidar } = await import('chokidar');
    const watcher = chokidar.watch('client/src/**/*.{tsx,jsx,ts,js}', {
      ignored: /node_modules/,
      persistent: true
    });

    watcher.on('change', async (filePath) => {
      console.log(`📝 [FILE_CHANGE] ${path.relative(process.cwd(), filePath)}`);
      await this.validateChangedFile(filePath);
    });

    watcher.on('add', async (filePath) => {
      console.log(`➕ [FILE_ADDED] ${path.relative(process.cwd(), filePath)}`);
      await this.validateChangedFile(filePath);
    });
  }

  async validateChangedFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      const buttons = this.extractButtonsFromContent(content);
      const issues = this.validateButtons(buttons);
      
      if (issues.length > 0) {
        console.log(`⚠️  [VALIDATION_ISSUES] ${relativePath}:`);
        issues.forEach(issue => {
          console.log(`   - ${issue.type}: ${issue.description}`);
          this.issueTracker.set(`${relativePath}:${issue.line}`, issue);
        });
        
        // Notification d'alerte
        this.sendAlert(relativePath, issues);
      } else {
        console.log(`✅ [VALIDATION_OK] ${relativePath} - Tous les boutons sont fonctionnels`);
        
        // Supprimer les anciens problèmes résolus
        for (const key of this.issueTracker.keys()) {
          if (key.startsWith(relativePath)) {
            this.issueTracker.delete(key);
          }
        }
      }
      
      // Mettre à jour le registre
      this.buttonRegistry.set(relativePath, {
        buttons: buttons,
        lastCheck: new Date(),
        issues: issues
      });
      
    } catch (error) {
      console.error(`❌ [VALIDATION_ERROR] ${filePath}:`, error.message);
    }
  }

  extractButtonsFromContent(content) {
    const buttons = [];
    const buttonRegex = /<(Button|button|a)[^>]*>/gi;
    let match;
    let lineNumber = 1;
    
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const buttonMatches = line.match(buttonRegex) || [];
      
      for (const buttonMatch of buttonMatches) {
        buttons.push({
          line: i + 1,
          content: buttonMatch,
          context: this.getButtonContext(lines, i),
          type: this.identifyButtonType(buttonMatch)
        });
      }
    }
    
    return buttons;
  }

  getButtonContext(lines, lineIndex) {
    const start = Math.max(0, lineIndex - 2);
    const end = Math.min(lines.length, lineIndex + 3);
    return lines.slice(start, end).join('\n');
  }

  identifyButtonType(buttonContent) {
    if (buttonContent.includes('onClick=')) return 'CLICK_HANDLER';
    if (buttonContent.includes('href=')) return 'LINK';
    if (buttonContent.includes('type="submit"')) return 'SUBMIT';
    return 'UNKNOWN';
  }

  validateButtons(buttons) {
    const issues = [];
    
    for (const button of buttons) {
      const buttonIssues = this.validateSingleButton(button);
      issues.push(...buttonIssues);
    }
    
    return issues;
  }

  validateSingleButton(button) {
    const issues = [];
    const content = button.content.toLowerCase();
    
    // Vérifications de base
    if (!content.includes('onclick') && !content.includes('href') && button.type !== 'SUBMIT') {
      issues.push({
        line: button.line,
        type: 'NO_HANDLER',
        description: 'Bouton sans gestionnaire onClick ou href',
        severity: 'HIGH'
      });
    }
    
    // Vérifications de placeholders
    const placeholderPatterns = [
      { pattern: 'alert(', type: 'ALERT_PLACEHOLDER', severity: 'MEDIUM' },
      { pattern: 'console.log', type: 'CONSOLE_PLACEHOLDER', severity: 'MEDIUM' },
      { pattern: 'todo', type: 'TODO_PLACEHOLDER', severity: 'LOW' },
      { pattern: 'href="#"', type: 'EMPTY_HREF', severity: 'MEDIUM' },
      { pattern: 'onclick=""', type: 'EMPTY_ONCLICK', severity: 'HIGH' },
      { pattern: 'onclick={}', type: 'EMPTY_ONCLICK', severity: 'HIGH' }
    ];
    
    for (const { pattern, type, severity } of placeholderPatterns) {
      if (button.context.toLowerCase().includes(pattern)) {
        issues.push({
          line: button.line,
          type: type,
          description: `Utilisation de placeholder: ${pattern}`,
          severity: severity
        });
      }
    }
    
    // Vérification de la cohérence
    if (content.includes('disabled') && content.includes('onclick')) {
      issues.push({
        line: button.line,
        type: 'DISABLED_WITH_HANDLER',
        description: 'Bouton désactivé avec gestionnaire onClick',
        severity: 'LOW'
      });
    }
    
    return issues;
  }

  sendAlert(filePath, issues) {
    const highSeverityIssues = issues.filter(i => i.severity === 'HIGH');
    
    if (highSeverityIssues.length > 0) {
      console.log('\n🚨 [ALERTE CRITIQUE] Boutons non-fonctionnels détectés!');
      console.log(`📄 Fichier: ${filePath}`);
      highSeverityIssues.forEach(issue => {
        console.log(`   🔴 Ligne ${issue.line}: ${issue.description}`);
      });
      console.log('');
      
      // Créer un fichier d'alerte
      this.createAlertFile(filePath, issues);
    }
  }

  createAlertFile(filePath, issues) {
    const alertContent = {
      timestamp: new Date().toISOString(),
      file: filePath,
      issues: issues,
      severity: Math.max(...issues.map(i => this.getSeverityLevel(i.severity))),
      recommendations: this.generateRecommendations(issues)
    };
    
    const alertPath = path.join(process.cwd(), 'button-alerts.json');
    let alerts = [];
    
    if (fs.existsSync(alertPath)) {
      try {
        alerts = JSON.parse(fs.readFileSync(alertPath, 'utf-8'));
      } catch (error) {
        alerts = [];
      }
    }
    
    alerts.push(alertContent);
    
    // Garder seulement les 50 dernières alertes
    if (alerts.length > 50) {
      alerts = alerts.slice(-50);
    }
    
    fs.writeFileSync(alertPath, JSON.stringify(alerts, null, 2));
  }

  getSeverityLevel(severity) {
    const levels = { LOW: 1, MEDIUM: 2, HIGH: 3 };
    return levels[severity] || 1;
  }

  generateRecommendations(issues) {
    const recommendations = [];
    
    if (issues.some(i => i.type === 'NO_HANDLER')) {
      recommendations.push('Ajoutez des gestionnaires onClick ou href aux boutons');
    }
    
    if (issues.some(i => i.type.includes('PLACEHOLDER'))) {
      recommendations.push('Remplacez les fonctions placeholder par de vraies implémentations');
    }
    
    if (issues.some(i => i.type === 'EMPTY_HREF')) {
      recommendations.push('Utilisez des URLs valides ou des gestionnaires de navigation');
    }
    
    return recommendations;
  }

  setupPerformanceMonitor() {
    // Surveillance de la performance des validations
    setInterval(() => {
      const totalButtons = Array.from(this.buttonRegistry.values())
        .reduce((sum, entry) => sum + entry.buttons.length, 0);
      
      const totalIssues = this.issueTracker.size;
      
      if (totalButtons > 0) {
        const healthScore = ((totalButtons - totalIssues) / totalButtons * 100).toFixed(1);
        console.log(`📊 [HEALTH_CHECK] ${totalButtons} boutons | ${totalIssues} problèmes | Santé: ${healthScore}%`);
      }
    }, 30000); // Toutes les 30 secondes
  }

  setupPeriodicValidation() {
    // Validation complète toutes les 5 minutes
    setInterval(async () => {
      console.log('🔄 [PERIODIC_VALIDATION] Validation complète...');
      await this.runFullValidation();
    }, 300000); // 5 minutes
  }

  async runFullValidation() {
    const { ButtonFunctionalityValidator } = await import('./button-functionality-validator.js');
    const validator = new ButtonFunctionalityValidator();
    
    try {
      const success = await validator.validateProject();
      
      if (success) {
        console.log('✅ [PERIODIC_VALIDATION] Tous les boutons sont fonctionnels');
      } else {
        console.log('⚠️  [PERIODIC_VALIDATION] Problèmes détectés - Voir le rapport');
      }
      
      this.lastValidation = {
        timestamp: new Date(),
        success: success,
        issueCount: validator.issues.length
      };
      
    } catch (error) {
      console.error('❌ [PERIODIC_VALIDATION] Erreur:', error.message);
    }
  }

  generateStatusReport() {
    return {
      timestamp: new Date().toISOString(),
      monitoring: {
        filesWatched: this.buttonRegistry.size,
        totalButtons: Array.from(this.buttonRegistry.values())
          .reduce((sum, entry) => sum + entry.buttons.length, 0),
        activeIssues: this.issueTracker.size,
        lastValidation: this.lastValidation
      },
      issues: Array.from(this.issueTracker.entries()).map(([key, issue]) => ({
        location: key,
        ...issue
      }))
    };
  }
}

// Auto-monitoring pour développement
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new RealTimeButtonMonitor();
  
  monitor.startMonitoring().catch(error => {
    console.error('❌ Erreur fatale du moniteur:', error);
    process.exit(1);
  });
  
  // Gestionnaire de fermeture propre
  process.on('SIGINT', () => {
    console.log('\n🔴 [MONITOR_SHUTDOWN] Arrêt de la surveillance...');
    
    // Sauvegarder le rapport final
    const finalReport = monitor.generateStatusReport();
    fs.writeFileSync('button-monitoring-report.json', JSON.stringify(finalReport, null, 2));
    
    console.log('💾 Rapport final sauvegardé: button-monitoring-report.json');
    process.exit(0);
  });
}

export { RealTimeButtonMonitor };
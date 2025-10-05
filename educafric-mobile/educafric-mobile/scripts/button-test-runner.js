#!/usr/bin/env node

/**
 * EDUCAFRIC Button Test Runner
 * 
 * Ce script exécute des tests automatisés sur les boutons dans le navigateur
 * pour vérifier qu'ils s'ouvrent vraiment quand on clique dessus.
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ButtonTestRunner {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.baseUrl = 'http://localhost:3000';
  }

  async initialize() {
    console.log('🚀 [BUTTON_TESTER] Initialisation du navigateur de test...');
    
    this.browser = await puppeteer.launch({
      headless: false, // Visible pour debug
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    
    // Intercepter les erreurs JavaScript
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Erreur JS:', msg.text());
      }
    });

    // Intercepter les erreurs de navigation
    this.page.on('pageerror', error => {
      console.log('💥 Erreur page:', error.message);
    });
  }

  async testAllButtons() {
    console.log('🔍 Démarrage des tests de boutons...\n');

    const pages = [
      '/',
      '/login',
      '/demo',
      '/sandbox',
    ];

    for (const pagePath of pages) {
      try {
        await this.testButtonsOnPage(pagePath);
      } catch (error) {
        console.error(`❌ Erreur sur la page ${pagePath}:`, error.message);
      }
    }

    this.generateReport();
  }

  async testButtonsOnPage(pagePath) {
    const url = `${this.baseUrl}${pagePath}`;
    console.log(`📄 Test des boutons sur: ${url}`);

    try {
      await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
      
      // Attendre que la page soit complètement chargée
      await this.page.waitForTimeout(2000);

      // Trouver tous les boutons et liens
      const clickableElements = await this.page.evaluate(() => {
        const elements = [];
        
        // Sélectionner tous les éléments cliquables
        const selectors = [
          'button',
          'a[href]',
          '[role="button"]',
          '[onClick]',
          '[data-testid*="button"]',
          '.cursor-pointer'
        ];

        selectors.forEach(selector => {
          document.querySelectorAll(selector).forEach((el, index) => {
            if (el.offsetParent !== null) { // Élément visible
              elements.push({
                selector: selector,
                index: index,
                text: el.textContent?.trim().substring(0, 50) || '',
                id: el.id || '',
                testId: el.getAttribute('data-testid') || '',
                href: el.href || '',
                className: el.className || ''
              });
            }
          });
        });

        return elements;
      });

      console.log(`  🔘 ${clickableElements.length} éléments cliquables trouvés`);

      // Tester chaque élément
      for (let i = 0; i < Math.min(clickableElements.length, 20); i++) {
        const element = clickableElements[i];
        await this.testSingleButton(element, pagePath, i);
        await this.page.waitForTimeout(500); // Pause entre les tests
      }

    } catch (error) {
      console.error(`❌ Impossible de charger ${url}:`, error.message);
      this.testResults.push({
        page: pagePath,
        status: 'PAGE_ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async testSingleButton(element, pagePath, index) {
    try {
      const elementInfo = `${element.text || element.id || element.testId || `Element ${index}`}`;
      
      // Construire un sélecteur unique
      let selector = element.selector;
      if (element.testId) {
        selector = `[data-testid="${element.testId}"]`;
      } else if (element.id) {
        selector = `#${element.id}`;
      } else {
        selector = `${element.selector}:nth-child(${index + 1})`;
      }

      console.log(`    🔘 Test: ${elementInfo}`);

      // Enregistrer l'état avant le clic
      const beforeUrl = this.page.url();
      const beforeTitle = await this.page.title();

      // Intercepter les événements
      let eventsFired = [];
      await this.page.evaluateOnNewDocument(() => {
        window.testEvents = [];
        ['click', 'navigate', 'change'].forEach(eventType => {
          document.addEventListener(eventType, (e) => {
            window.testEvents.push({
              type: eventType,
              target: e.target.tagName,
              timestamp: Date.now()
            });
          });
        });
      });

      // Faire défiler vers l'élément
      await this.page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, selector);

      await this.page.waitForTimeout(500);

      // Cliquer sur l'élément
      await this.page.click(selector, { timeout: 3000 });
      
      // Attendre les changements potentiels
      await this.page.waitForTimeout(2000);

      // Vérifier les changements
      const afterUrl = this.page.url();
      const afterTitle = await this.page.title();
      
      // Récupérer les événements déclenchés
      const events = await this.page.evaluate(() => window.testEvents || []);

      // Analyser les résultats
      const hasUrlChange = beforeUrl !== afterUrl;
      const hasTitleChange = beforeTitle !== afterTitle;
      const hasEvents = events.length > 0;
      const hasModalOrDialog = await this.checkForModalsOrDialogs();

      const testResult = {
        page: pagePath,
        element: elementInfo,
        selector: selector,
        status: this.determineButtonStatus(hasUrlChange, hasTitleChange, hasEvents, hasModalOrDialog),
        details: {
          urlChanged: hasUrlChange,
          titleChanged: hasTitleChange,
          eventsTriggered: events.length,
          modalOpened: hasModalOrDialog,
          beforeUrl: beforeUrl,
          afterUrl: afterUrl
        },
        timestamp: new Date().toISOString()
      };

      this.testResults.push(testResult);

      // Log du résultat
      const statusIcon = testResult.status === 'FUNCTIONAL' ? '✅' : 
                        testResult.status === 'PARTIAL' ? '⚠️' : '❌';
      console.log(`      ${statusIcon} ${testResult.status}`);

      // Revenir à l'état initial si nécessaire
      if (hasUrlChange && afterUrl !== beforeUrl) {
        await this.page.goBack({ waitUntil: 'networkidle2' });
        await this.page.waitForTimeout(1000);
      }

    } catch (error) {
      console.log(`      ❌ ERREUR: ${error.message}`);
      this.testResults.push({
        page: pagePath,
        element: elementInfo,
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  determineButtonStatus(urlChange, titleChange, hasEvents, hasModal) {
    if (urlChange || hasModal) {
      return 'FUNCTIONAL'; // Changement visible
    } else if (titleChange || hasEvents) {
      return 'PARTIAL'; // Activité détectée
    } else {
      return 'NON_FUNCTIONAL'; // Aucun changement
    }
  }

  async checkForModalsOrDialogs() {
    try {
      const modals = await this.page.evaluate(() => {
        const modalSelectors = [
          '[role="dialog"]',
          '.modal',
          '.dialog',
          '.popup',
          '[data-testid*="modal"]',
          '[data-testid*="dialog"]'
        ];

        return modalSelectors.some(selector => {
          const elements = document.querySelectorAll(selector);
          return Array.from(elements).some(el => 
            el.offsetParent !== null && 
            getComputedStyle(el).display !== 'none'
          );
        });
      });

      return modals;
    } catch (error) {
      return false;
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RAPPORT DE TEST DES BOUTONS');
    console.log('='.repeat(60));

    const totalTests = this.testResults.length;
    const functional = this.testResults.filter(r => r.status === 'FUNCTIONAL').length;
    const partial = this.testResults.filter(r => r.status === 'PARTIAL').length;
    const nonFunctional = this.testResults.filter(r => r.status === 'NON_FUNCTIONAL').length;
    const errors = this.testResults.filter(r => r.status === 'ERROR').length;

    console.log(`🔘 Total tests: ${totalTests}`);
    console.log(`✅ Fonctionnels: ${functional} (${((functional/totalTests)*100).toFixed(1)}%)`);
    console.log(`⚠️  Partiels: ${partial} (${((partial/totalTests)*100).toFixed(1)}%)`);
    console.log(`❌ Non-fonctionnels: ${nonFunctional} (${((nonFunctional/totalTests)*100).toFixed(1)}%)`);
    console.log(`💥 Erreurs: ${errors} (${((errors/totalTests)*100).toFixed(1)}%)`);

    // Détails des problèmes
    const problems = this.testResults.filter(r => 
      r.status === 'NON_FUNCTIONAL' || r.status === 'ERROR'
    );

    if (problems.length > 0) {
      console.log('\n❌ BOUTONS PROBLÉMATIQUES:');
      console.log('-'.repeat(40));
      
      problems.forEach(problem => {
        console.log(`📄 Page: ${problem.page}`);
        console.log(`🔘 Élément: ${problem.element}`);
        console.log(`⚠️  Statut: ${problem.status}`);
        if (problem.error) {
          console.log(`💥 Erreur: ${problem.error}`);
        }
        console.log('');
      });
    }

    // Sauvegarder le rapport
    this.saveReport();
  }

  saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.testResults.length,
        functional: this.testResults.filter(r => r.status === 'FUNCTIONAL').length,
        partial: this.testResults.filter(r => r.status === 'PARTIAL').length,
        nonFunctional: this.testResults.filter(r => r.status === 'NON_FUNCTIONAL').length,
        errors: this.testResults.filter(r => r.status === 'ERROR').length
      },
      results: this.testResults
    };

    const reportPath = path.join(process.cwd(), 'button-test-results.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`💾 Rapport sauvegardé: ${reportPath}`);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Script principal
async function main() {
  const tester = new ButtonTestRunner();
  
  try {
    await tester.initialize();
    await tester.testAllButtons();
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  } finally {
    await tester.cleanup();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ButtonTestRunner };
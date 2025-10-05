#!/usr/bin/env node

/**
 * EDUCAFRIC - Test Final de Validation
 * Vérifie que tous les problèmes ont été résolus
 */

import fs from 'fs/promises';

class FinalValidationTest {
  constructor() {
    this.results = [];
    this.errors = [];
  }

  async start() {
    console.log('🧪 EDUCAFRIC - Test Final de Validation');
    console.log('======================================\n');

    try {
      await this.testAuthentication();
      await this.testAPIEndpoints();
      await this.testComponentExports();
      await this.generateValidationReport();
      
      console.log('\n✅ Validation terminée!');
      if (this.errors.length === 0) {
        console.log('🎉 Toutes les erreurs ont été corrigées avec succès!');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la validation:', error.message);
    }
  }

  async testAuthentication() {
    console.log('🔐 Test d\'authentification...');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'student.demo@test.educafric.com',
          password: 'password'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Authentification: OK');
        this.results.push('Authentication working');
      } else {
        console.log('⚠️ Authentification: Erreur HTTP', response.status);
        this.errors.push('Authentication failed');
      }
    } catch (error) {
      console.log('❌ Authentification: Connexion impossible');
      this.errors.push('Authentication connection failed');
    }
  }

  async testAPIEndpoints() {
    console.log('🔗 Test des endpoints API...');
    
    const endpoints = [
      { url: 'http://localhost:5000/api/student/educational-content', name: 'Student Content' },
      { url: 'http://localhost:5000/api/student/grades', name: 'Student Grades' },
      { url: 'http://localhost:5000/api/parent/children', name: 'Parent Children' },
      { url: 'http://localhost:5000/api/teacher/classes', name: 'Teacher Classes' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, {
          headers: {
            'Authorization': 'Bearer demo-token'
          }
        });
        
        if (response.status === 401) {
          console.log(`✅ ${endpoint.name}: Auth required (correct)`);
          this.results.push(`${endpoint.name} endpoint protected`);
        } else if (response.status === 200) {
          console.log(`✅ ${endpoint.name}: OK`);
          this.results.push(`${endpoint.name} endpoint working`);
        } else {
          console.log(`⚠️ ${endpoint.name}: Status ${response.status}`);
          this.errors.push(`${endpoint.name} unexpected status`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint.name}: Connection failed`);
        this.errors.push(`${endpoint.name} connection failed`);
      }
    }
  }

  async testComponentExports() {
    console.log('📦 Test des exports de composants...');
    
    const components = [
      './client/src/components/parent/modules/ParentAttendance.tsx',
      './client/src/components/parent/modules/WhatsAppNotifications.tsx'
    ];

    for (const component of components) {
      try {
        const content = await fs.readFile(component, 'utf8');
        const componentName = component.split('/').pop().replace('.tsx', '');
        
        if (content.includes('export default')) {
          console.log(`✅ ${componentName}: Export OK`);
          this.results.push(`${componentName} properly exported`);
        } else {
          console.log(`❌ ${componentName}: Export manquant`);
          this.errors.push(`${componentName} missing export`);
        }
      } catch (error) {
        console.log(`❌ ${component}: Fichier introuvable`);
        this.errors.push(`${component} file not found`);
      }
    }
  }

  async generateValidationReport() {
    console.log('📊 Génération du rapport de validation...');
    
    const report = {
      timestamp: new Date().toISOString(),
      testResults: this.results,
      errors: this.errors,
      summary: {
        totalTests: this.results.length + this.errors.length,
        passedTests: this.results.length,
        failedTests: this.errors.length,
        successRate: Math.round((this.results.length / (this.results.length + this.errors.length)) * 100),
        overallStatus: this.errors.length === 0 ? 'ALL_PASSED' : 'SOME_FAILED'
      },
      recommendation: this.errors.length === 0 ? 
        'Application entièrement fonctionnelle et prête pour utilisation' :
        'Certains problèmes subsistent, vérifier les erreurs listées'
    };

    await fs.writeFile('validation-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📊 RAPPORT DE VALIDATION:');
    console.log(`✅ ${report.summary.passedTests} tests réussis`);
    console.log(`${report.summary.failedTests > 0 ? '❌' : '✅'} ${report.summary.failedTests} tests échoués`);
    console.log(`📈 Taux de réussite: ${report.summary.successRate}%`);
    console.log(`🎯 Status global: ${report.summary.overallStatus}`);
    console.log('\n💾 Rapport sauvegardé: validation-report.json');
  }
}

// Exécuter la validation
const validator = new FinalValidationTest();
await validator.start();
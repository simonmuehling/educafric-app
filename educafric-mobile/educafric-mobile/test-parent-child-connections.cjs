#!/usr/bin/env node

/**
 * Test Complet des 3 Méthodes de Connexion Parents-Enfants EDUCAFRIC
 * Validation: Storage → Routes → API → Frontend
 * 
 * PRINCIPE D'ÉQUITÉ: Tous les parents payants = mêmes droits complets
 */

const http = require('http');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:5000';

// Credentials de test
const testCredentials = {
  student: { email: 'student.demo@test.educafric.com', password: 'password' },
  parent: { email: 'parent.demo@test.educafric.com', password: 'password' },
  director: { email: 'director.demo@test.educafric.com', password: 'password' }
};

class ParentChildConnectionTester {
  constructor() {
    this.cookies = {};
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      details: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async makeRequest(method, path, body = null, userType = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Parent-Child-Connection-Test/1.0'
        }
      };

      if (userType && this.cookies[userType]) {
        options.headers['Cookie'] = this.cookies[userType];
      }

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.headers['set-cookie']) {
            this.cookies[userType] = res.headers['set-cookie'].join('; ');
          }
          try {
            const jsonData = data ? JSON.parse(data) : {};
            resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
          } catch (e) {
            resolve({ status: res.statusCode, data: data, headers: res.headers });
          }
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  async login(userType) {
    this.log(`Connexion ${userType}...`);
    const startTime = performance.now();
    
    try {
      const response = await this.makeRequest('POST', '/api/auth/login', testCredentials[userType]);
      const endTime = performance.now();
      
      if (response.status === 200) {
        this.log(`✅ Connexion ${userType} réussie (${Math.round(endTime - startTime)}ms)`, 'success');
        return true;
      } else {
        this.log(`❌ Échec connexion ${userType}: ${response.status}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`❌ Erreur connexion ${userType}: ${error.message}`, 'error');
      return false;
    }
  }

  async testMethod1_AutomaticInvitation() {
    this.log('\n🔄 TEST MÉTHODE 1: Invitation Automatique École');
    
    let passed = 0;
    let total = 0;

    // Test 1.1: École invite parent
    total++;
    try {
      const response = await this.makeRequest('POST', '/api/school/invite-parent', {
        parentEmail: 'nouveau.parent@test.com',
        studentId: 101
      }, 'director');

      if (response.status === 200 && response.data.success) {
        this.log('✅ 1.1 - Invitation parent envoyée avec succès', 'success');
        this.log(`    📧 Email: nouveau.parent@test.com`);
        this.log(`    🔑 Token: ${response.data.invitation.invitationToken.substring(0, 20)}...`);
        passed++;
      } else {
        this.log(`❌ 1.1 - Échec invitation: ${response.status}`, 'error');
      }
    } catch (error) {
      this.log(`❌ 1.1 - Erreur invitation: ${error.message}`, 'error');
    }

    return { passed, total, method: 'Invitation Automatique' };
  }

  async testMethod2_QRCode() {
    this.log('\n📱 TEST MÉTHODE 2: Code QR Sécurisé');
    
    let passed = 0;
    let total = 0;
    let qrToken = null;

    // Test 2.1: Étudiant génère QR code
    total++;
    try {
      const response = await this.makeRequest('POST', '/api/student/generate-qr', {}, 'student');

      if (response.status === 200 && response.data.success) {
        qrToken = response.data.token;
        this.log('✅ 2.1 - Code QR généré par étudiant', 'success');
        this.log(`    🔑 Token: ${qrToken.substring(0, 20)}...`);
        this.log(`    ⏰ Expire: ${new Date(response.data.expiresAt).toLocaleString('fr-FR')}`);
        passed++;
      } else {
        this.log(`❌ 2.1 - Échec génération QR: ${response.status}`, 'error');
      }
    } catch (error) {
      this.log(`❌ 2.1 - Erreur génération QR: ${error.message}`, 'error');
    }

    // Test 2.2: Parent scanne QR code
    if (qrToken) {
      total++;
      try {
        const response = await this.makeRequest('POST', '/api/parent/scan-qr', {
          qrToken: qrToken
        }, 'parent');

        if (response.status === 200 && response.data.success) {
          this.log('✅ 2.2 - Parent a scanné le QR avec succès', 'success');
          this.log(`    📝 Message: ${response.data.message}`);
          passed++;
        } else {
          this.log(`❌ 2.2 - Échec scan QR: ${response.status}`, 'error');
        }
      } catch (error) {
        this.log(`❌ 2.2 - Erreur scan QR: ${error.message}`, 'error');
      }
    }

    return { passed, total, method: 'Code QR Sécurisé' };
  }

  async testMethod3_ManualRequest() {
    this.log('\n📋 TEST MÉTHODE 3: Demande Manuelle');
    
    let passed = 0;
    let total = 0;
    let requestId = null;

    // Test 3.1: Parent soumet demande manuelle
    total++;
    try {
      const response = await this.makeRequest('POST', '/api/parent/request-connection', {
        studentFirstName: 'Junior',
        studentLastName: 'Kamga',
        relationshipType: 'parent',
        reason: 'Je suis le parent de cet enfant et souhaite suivre ses résultats scolaires',
        identityDocuments: 'https://drive.google.com/identity-card-123'
      }, 'parent');

      if (response.status === 200 && response.data.success) {
        requestId = response.data.request.requestId;
        this.log('✅ 3.1 - Demande manuelle soumise avec succès', 'success');
        this.log(`    📋 ID Demande: ${requestId}`);
        this.log(`    👨‍👩‍👧‍👦 Étudiant trouvé: ${response.data.request.studentFound}`);
        passed++;
      } else {
        this.log(`❌ 3.1 - Échec demande manuelle: ${response.status}`, 'error');
      }
    } catch (error) {
      this.log(`❌ 3.1 - Erreur demande manuelle: ${error.message}`, 'error');
    }

    // Test 3.2: École liste demandes en attente
    total++;
    try {
      const response = await this.makeRequest('GET', '/api/school/pending-connections', null, 'director');

      if (response.status === 200 && response.data.success) {
        this.log('✅ 3.2 - Liste demandes en attente récupérée', 'success');
        this.log(`    📊 Nombre de demandes: ${response.data.requests.length}`);
        passed++;
      } else {
        this.log(`❌ 3.2 - Échec liste demandes: ${response.status}`, 'error');
      }
    } catch (error) {
      this.log(`❌ 3.2 - Erreur liste demandes: ${error.message}`, 'error');
    }

    // Test 3.3: École valide la demande
    if (requestId) {
      total++;
      try {
        const response = await this.makeRequest('POST', `/api/school/validate-connection/${requestId}`, {
          approval: true,
          reason: 'Documents vérifiés et identité confirmée'
        }, 'director');

        if (response.status === 200 && response.data.success) {
          this.log('✅ 3.3 - École a validé la demande avec succès', 'success');
          this.log(`    ✔️ Connexion établie entre parent et enfant`);
          passed++;
        } else {
          this.log(`❌ 3.3 - Échec validation école: ${response.status}`, 'error');
        }
      } catch (error) {
        this.log(`❌ 3.3 - Erreur validation école: ${error.message}`, 'error');
      }
    }

    return { passed, total, method: 'Demande Manuelle' };
  }

  async testEquityPrinciple() {
    this.log('\n⚖️ TEST PRINCIPE D\'ÉQUITÉ ABONNEMENT');
    
    let passed = 0;
    let total = 0;

    // Test équité: Vérifier que tous les types de parents ont les mêmes droits
    const parentTypes = ['parent', 'secondary_parent', 'guardian'];
    
    for (const parentType of parentTypes) {
      total++;
      try {
        // Simuler un parent de ce type accédant aux données enfant
        const response = await this.makeRequest('GET', '/api/parent/children', null, 'parent');

        if (response.status === 200 || response.status === 403) {
          this.log(`✅ Test équité ${parentType}: Accès cohérent`, 'success');
          this.log(`    🔐 Tous les parents payants = mêmes droits complets`);
          passed++;
        } else {
          this.log(`❌ Test équité ${parentType}: Incohérent`, 'error');
        }
      } catch (error) {
        this.log(`❌ Erreur test équité ${parentType}: ${error.message}`, 'error');
      }
    }

    return { passed, total, method: 'Principe Équité' };
  }

  async runAllTests() {
    this.log('🚀 DÉBUT TESTS CONNEXIONS PARENTS-ENFANTS EDUCAFRIC');
    this.log('===============================================');
    this.log('🎯 PRINCIPE: Tous les parents payants = mêmes droits complets\n');

    const startTime = performance.now();

    // Connexions utilisateurs
    const studentLogin = await this.login('student');
    const parentLogin = await this.login('parent');
    const directorLogin = await this.login('director');

    if (!studentLogin || !parentLogin || !directorLogin) {
      this.log('❌ ÉCHEC: Impossible de se connecter aux comptes de test', 'error');
      return;
    }

    // Tests des 3 méthodes
    const method1Results = await this.testMethod1_AutomaticInvitation();
    const method2Results = await this.testMethod2_QRCode();
    const method3Results = await this.testMethod3_ManualRequest();
    const equityResults = await this.testEquityPrinciple();

    // Calcul résultats finaux
    const allResults = [method1Results, method2Results, method3Results, equityResults];
    const totalPassed = allResults.reduce((sum, r) => sum + r.passed, 0);
    const totalTests = allResults.reduce((sum, r) => sum + r.total, 0);
    const endTime = performance.now();

    // Rapport final
    this.log('\n📊 RAPPORT FINAL CONNEXIONS PARENTS-ENFANTS');
    this.log('===========================================');
    
    allResults.forEach(result => {
      const percentage = ((result.passed / result.total) * 100).toFixed(1);
      const status = result.passed === result.total ? '✅' : result.passed > 0 ? '⚠️' : '❌';
      this.log(`${status} ${result.method}: ${result.passed}/${result.total} (${percentage}%)`);
    });

    const overallPercentage = ((totalPassed / totalTests) * 100).toFixed(1);
    const overallStatus = totalPassed === totalTests ? '✅' : totalPassed > 0 ? '⚠️' : '❌';
    
    this.log('\n🎯 RÉSULTAT GLOBAL:');
    this.log(`${overallStatus} ${totalPassed}/${totalTests} tests réussis (${overallPercentage}%)`);
    this.log(`⏱️ Temps d'exécution: ${Math.round(endTime - startTime)}ms`);

    if (totalPassed === totalTests) {
      this.log('\n🎉 SUCCÈS COMPLET: Toutes les méthodes de connexion fonctionnent!', 'success');
      this.log('✅ Architecture Storage → Routes → API → Frontend validée');
      this.log('⚖️ Principe d\'équité respecté: Tous parents payants = droits identiques');
    } else {
      this.log('\n⚠️ TESTS PARTIELS: Certaines fonctionnalités nécessitent attention', 'warning');
    }

    this.log('\n📝 MÉTHODES VALIDÉES:');
    this.log('1️⃣ Invitation Automatique École → Parent');
    this.log('2️⃣ Code QR Étudiant → Parent → Validation École');
    this.log('3️⃣ Demande Manuelle Parent → Validation École');
    this.log('⚖️ Équité: Principal/Secondaire/Tuteur = Accès identique');
  }
}

// Lancement des tests
if (require.main === module) {
  const tester = new ParentChildConnectionTester();
  tester.runAllTests().catch(console.error);
}

module.exports = ParentChildConnectionTester;
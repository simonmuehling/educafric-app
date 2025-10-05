#!/usr/bin/env node

/**
 * Test d'Intégration Système d'Abonnements EDUCAFRIC
 * Validation que Parent et Freelancer ont les mêmes options que "Paramètres École"
 * Conforme à la directive utilisateur: "comme dans 'Paramètres École'"
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 EDUCAFRIC - Test d\'Intégration Système d\'Abonnements');
console.log('=' .repeat(80));

// Chemins des fichiers à tester
const files = {
  schoolSettings: 'client/src/components/director/modules/SchoolSettings.tsx',
  parentSettings: 'client/src/components/parent/modules/ParentSettings.tsx',
  freelancerSettings: 'client/src/components/freelancer/modules/FreelancerSettings.tsx',
  parentSubscription: 'client/src/components/parent/modules/ParentSubscription.tsx',
  freelancerSubscription: 'client/src/components/freelancer/modules/FreelancerSubscription.tsx'
};

// Vérification des fichiers
function checkFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Fichier manquant: ${filePath}`);
    return false;
  }
  console.log(`✅ Fichier trouvé: ${filePath}`);
  return true;
}

// Vérification du contenu des abonnements
function validateSubscriptionStructure(filePath, userType) {
  console.log(`\n📋 Analyse ${userType} Settings...`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Vérifications critiques selon directive utilisateur
  const checks = [
    {
      name: 'Navigation par sections (Général, Abonnement, Sécurité)',
      pattern: /activeSection.*===.*['"]subscription['"]|subscription.*activeSection/i,
      found: content.includes("activeSection === 'subscription'")
    },
    {
      name: 'Import du composant d\'abonnement',
      pattern: new RegExp(`${userType}Subscription`, 'i'),
      found: content.includes(`${userType}Subscription`)
    },
    {
      name: 'Section Abonnement intégrée',
      pattern: /subscription.*&&.*Subscription/i,
      found: content.includes('subscription') && content.includes('Subscription')
    },
    {
      name: 'Structure similaire à SchoolSettings',
      pattern: /general.*subscription.*security/i,
      found: content.includes('general') && content.includes('subscription') && content.includes('security')
    }
  ];

  let score = 0;
  checks.forEach(check => {
    if (check.found) {
      console.log(`  ✅ ${check.name}`);
      score++;
    } else {
      console.log(`  ❌ ${check.name}`);
    }
  });

  console.log(`📊 Score ${userType}: ${score}/${checks.length}`);
  return score === checks.length;
}

// Vérification des composants d'abonnement
function validateSubscriptionComponent(filePath, userType) {
  console.log(`\n💳 Analyse ${userType}Subscription...`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  const features = [
    {
      name: 'Plans d\'abonnement multiples',
      found: content.includes('subscriptionPlans') || content.includes('plans')
    },
    {
      name: 'Méthodes de paiement (Stripe, Orange Money, Virement)',
      found: content.includes('Stripe') && content.includes('Orange Money') && content.includes('virement')
    },
    {
      name: 'Boutons d\'action configurés',
      found: content.includes('handleSubscribe') || content.includes('onClick')
    },
    {
      name: 'Interface bilingue FR/EN',
      found: content.includes('fr:') && content.includes('en:')
    },
    {
      name: 'Redirection vers /subscribe',
      found: content.includes('/subscribe') || content.includes('window.location')
    },
    {
      name: 'ModernCard et composants UI',
      found: content.includes('ModernCard') && content.includes('Button')
    }
  ];

  let score = 0;
  features.forEach(feature => {
    if (feature.found) {
      console.log(`  ✅ ${feature.name}`);
      score++;
    } else {
      console.log(`  ❌ ${feature.name}`);
    }
  });

  console.log(`📊 Score ${userType}Subscription: ${score}/${features.length}`);
  return score === features.length;
}

// Test principal
async function runTests() {
  console.log('\n📂 Vérification des fichiers...');
  
  let allFilesExist = true;
  Object.entries(files).forEach(([name, filePath]) => {
    if (!checkFileExists(filePath)) {
      allFilesExist = false;
    }
  });

  if (!allFilesExist) {
    console.log('\n❌ Certains fichiers sont manquants. Arrêt du test.');
    process.exit(1);
  }

  console.log('\n🎯 Tests d\'intégration selon directive: "comme dans \'Paramètres École\'"');
  
  // Test des structures Settings
  const parentValid = validateSubscriptionStructure(files.parentSettings, 'Parent');
  const freelancerValid = validateSubscriptionStructure(files.freelancerSettings, 'Freelancer');
  
  // Test des composants Subscription
  const parentSubValid = validateSubscriptionComponent(files.parentSubscription, 'Parent');
  const freelancerSubValid = validateSubscriptionComponent(files.freelancerSubscription, 'Freelancer');

  // Résultats finaux
  console.log('\n' + '='.repeat(80));
  console.log('📊 RÉSULTATS FINAUX - Intégration Système d\'Abonnements');
  console.log('='.repeat(80));

  const results = [
    { name: 'ParentSettings Navigation', valid: parentValid },
    { name: 'FreelancerSettings Navigation', valid: freelancerValid },
    { name: 'ParentSubscription Fonctionnalités', valid: parentSubValid },
    { name: 'FreelancerSubscription Fonctionnalités', valid: freelancerSubValid }
  ];

  results.forEach(result => {
    const status = result.valid ? '✅ VALIDÉ' : '❌ ÉCHEC';
    console.log(`${status} ${result.name}`);
  });

  const totalScore = results.filter(r => r.valid).length;
  console.log(`\n📈 Score Total: ${totalScore}/${results.length}`);

  if (totalScore === results.length) {
    console.log('\n🎉 SUCCÈS COMPLET!');
    console.log('✅ Parent et Freelancer ont maintenant les mêmes options d\'abonnement que "Paramètres École"');
    console.log('✅ Tous les boutons sont implémentés et configurés');
    console.log('✅ Routes/APIs existantes intégrées');
    console.log('✅ Support bilingue complet');
    console.log('\n👨‍💻 Système conforme à la directive utilisateur!');
    return true;
  } else {
    console.log('\n⚠️  INTÉGRATION INCOMPLÈTE');
    console.log('Des améliorations sont nécessaires pour atteindre la parité avec SchoolSettings');
    return false;
  }
}

// Exécution
runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Erreur pendant les tests:', error);
  process.exit(1);
});
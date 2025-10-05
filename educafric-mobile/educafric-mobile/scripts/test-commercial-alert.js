#!/usr/bin/env node

/**
 * Script de test pour l'alerte email de connexion commercial
 * Simule une connexion commerciale et teste l'envoi d'email
 */

const { hostingerMailService } = require('../dist/server/services/hostingerMailService');

async function testCommercialAlert() {
  console.log('🧪 TESTANT L\'ALERTE EMAIL COMMERCIALE...\n');
  
  // Données test d'un commercial type
  const testCommercialData = {
    name: 'Demo Commercial Test',
    email: 'commercial.demo@test.educafric.com',
    loginTime: new Date().toLocaleString('fr-FR', { 
      timeZone: 'Africa/Douala',
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    ip: '127.0.0.1',
    schoolId: 1
  };
  
  console.log('📋 Données du test :');
  console.log(`   👤 Nom: ${testCommercialData.name}`);
  console.log(`   📧 Email: ${testCommercialData.email}`);
  console.log(`   🕐 Heure: ${testCommercialData.loginTime}`);
  console.log(`   🌐 IP: ${testCommercialData.ip}`);
  console.log(`   🏫 École: ${testCommercialData.schoolId}\n`);
  
  try {
    console.log('📤 Envoi de l\'alerte email via Hostinger...');
    const success = await hostingerMailService.sendCommercialLoginAlert(testCommercialData);
    
    if (success) {
      console.log('✅ SUCCÈS: Alerte email commerciale envoyée avec succès!');
      console.log('📬 Destinataire: admin@educafric.com');
      console.log('📝 L\'email contient tous les détails de la connexion commercial.');
    } else {
      console.log('❌ ÉCHEC: L\'alerte email n\'a pas pu être envoyée.');
    }
  } catch (error) {
    console.error('🚨 ERREUR lors du test:', error.message);
    console.error('📝 Détails:', error);
  }
  
  console.log('\n🏁 Test terminé.');
}

// Lancer le test si le script est exécuté directement
if (require.main === module) {
  testCommercialAlert().catch(console.error);
}

module.exports = { testCommercialAlert };
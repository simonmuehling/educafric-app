#!/usr/bin/env node

/**
 * 📧 TEST SCRIPT - SYSTÈME EMAIL DE BIENVENUE HOSTINGER
 * 
 * Ce script teste manuellement l'envoi d'emails de bienvenue
 * via le système Hostinger SMTP configuré dans Educafric.
 * 
 * Usage: node scripts/test-welcome-email.js
 */

const { welcomeEmailService } = require('../server/services/welcomeEmailService');

async function testSchoolWelcomeEmail() {
  console.log('🧪 TESTING SCHOOL WELCOME EMAIL SYSTEM');
  console.log('=====================================\n');

  const testSchoolData = {
    schoolName: "École Test Bilingue Excellence",
    adminName: "Dr. Marie Test Nkomo",
    adminEmail: "test@educafric.com", // Remplacez par un email de test réel
    subscriptionPlan: "Plan École Premium",
    registrationDate: new Date().toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  };

  console.log('📋 Données de test:');
  console.log('- École:', testSchoolData.schoolName);
  console.log('- Admin:', testSchoolData.adminName);
  console.log('- Email:', testSchoolData.adminEmail);
  console.log('- Plan:', testSchoolData.subscriptionPlan);
  console.log('- Date:', testSchoolData.registrationDate);
  console.log('\n🚀 Envoi en cours...\n');

  try {
    const result = await welcomeEmailService.sendSchoolWelcomeEmail(testSchoolData);
    
    if (result) {
      console.log('✅ SUCCESS: School welcome email sent successfully!');
      console.log('📧 Check the recipient email inbox for the welcome message.');
      console.log('📬 Admin notification should also be sent to admin@educafric.com');
    } else {
      console.log('❌ FAILED: School welcome email was not sent.');
      console.log('🔍 Check the server logs for error details.');
    }
  } catch (error) {
    console.error('💥 ERROR during email sending:', error.message);
    console.log('\n🛠️  Troubleshooting steps:');
    console.log('1. Verify Hostinger SMTP credentials in hostingerMailService.ts');
    console.log('2. Check internet connectivity');
    console.log('3. Verify recipient email address is valid');
    console.log('4. Check server logs for detailed error information');
  }

  console.log('\n=====================================');
  console.log('🏁 Test completed. Check results above.');
}

async function testUserWelcomeEmail() {
  console.log('\n🧪 TESTING USER WELCOME EMAIL SYSTEM');
  console.log('=====================================\n');

  const testUserData = {
    name: "Prof. Jean Test Mbarga",
    email: "teacher-test@educafric.com", // Remplacez par un email de test réel
    role: "Teacher",
    schoolName: "École Test Bilingue Excellence"
  };

  console.log('📋 Données de test utilisateur:');
  console.log('- Nom:', testUserData.name);
  console.log('- Email:', testUserData.email);
  console.log('- Rôle:', testUserData.role);
  console.log('- École:', testUserData.schoolName);
  console.log('\n🚀 Envoi en cours...\n');

  try {
    const result = await welcomeEmailService.sendUserWelcomeEmail(testUserData);
    
    if (result) {
      console.log('✅ SUCCESS: User welcome email sent successfully!');
      console.log('📧 Check the recipient email inbox for the welcome message.');
    } else {
      console.log('❌ FAILED: User welcome email was not sent.');
    }
  } catch (error) {
    console.error('💥 ERROR during user email sending:', error.message);
  }
}

// Fonction principale
async function runTests() {
  console.log('📧 EDUCAFRIC - HOSTINGER EMAIL SYSTEM TEST');
  console.log('==========================================\n');
  console.log('⚠️  IMPORTANT: Make sure to replace test email addresses');
  console.log('    with real email addresses you can access for testing.\n');

  // Test 1: École welcome email
  await testSchoolWelcomeEmail();
  
  // Attendre 2 secondes entre les tests
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: User welcome email  
  await testUserWelcomeEmail();

  console.log('\n🎯 SUMMARY:');
  console.log('- School welcome email: Test completed');
  console.log('- User welcome email: Test completed');
  console.log('- Check your email inbox for received messages');
  console.log('- Check server console for detailed logs');
  console.log('\n💡 NOTE: Emails are sent via Hostinger SMTP (not SendGrid)');
  console.log('📧 From: no-reply@educafric.com');
  console.log('🏥 SMTP: smtp.hostinger.com:465 (SSL)');
}

// Exécuter les tests
if (require.main === module) {
  runTests().catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
  });
}

module.exports = { testSchoolWelcomeEmail, testUserWelcomeEmail };
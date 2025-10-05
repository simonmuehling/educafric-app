// Script de test automatisé pour vérifier l'accès premium dans tous les dashboards sandbox
// Teste TOUS les modules premium pour s'assurer qu'il n'y a aucun blocage dans l'environnement sandbox

const SANDBOX_TEST_ACCOUNTS = [
  { email: 'school.admin@test.educafric.com', role: 'Admin' },
  { email: 'director.demo@test.educafric.com', role: 'Director' },
  { email: 'teacher.demo@test.educafric.com', role: 'Teacher' },
  { email: 'parent.demo@test.educafric.com', role: 'Parent' },
  { email: 'student.demo@test.educafric.com', role: 'Student' },
  { email: 'freelancer.demo@test.educafric.com', role: 'Freelancer' },
  { email: 'commercial.demo@test.educafric.com', role: 'Commercial' },
  { email: 'admin.demo@test.educafric.com', role: 'SiteAdmin' }
];

const PREMIUM_MODULES_TO_TEST = {
  Director: [
    'teachers', 'students', 'classes', 'timetable', 'grade-reports', 
    'attendance', 'communications', 'teacher-absences', 'parent-requests', 
    'premium-services', 'bulletin-approval', 'administrators'
  ],
  Freelancer: [
    'my-students', 'timetable', 'learning-modules', 'communications',
    'student-progress', 'analytics', 'geolocation', 'attendance'
  ],
  Parent: [
    'communications', 'payments', 'whatsapp', 'attendance', 'geolocation', 'services'
  ]
};

// Fonction pour détecter les blocages premium sur une page
function detectPremiumBlocks() {
  const blocks = [];
  
  // Rechercher tous les éléments indiquant un blocage premium
  const premiumBlocks = document.querySelectorAll('[class*="premium"], [class*="upgrade"], [class*="lock"]');
  premiumBlocks.forEach(block => {
    const text = block.textContent?.toLowerCase() || '';
    if (text.includes('premium') || text.includes('upgrade') || text.includes('mettre à niveau')) {
      blocks.push({
        element: block.tagName,
        text: text.substring(0, 100),
        className: block.className
      });
    }
  });
  
  // Rechercher spécifiquement les overlays premium
  const overlays = document.querySelectorAll('.absolute.inset-0, [class*="backdrop-blur"]');
  overlays.forEach(overlay => {
    if (overlay.textContent?.includes('Premium') || overlay.textContent?.includes('Upgrade')) {
      blocks.push({
        element: 'PREMIUM_OVERLAY',
        text: overlay.textContent?.substring(0, 150),
        className: overlay.className
      });
    }
  });
  
  return blocks;
}

console.log('🔬 SANDBOX PREMIUM ACCESS TEST SCRIPT');
console.log('====================================');
console.log('Ce script détecte automatiquement tous les blocages premium inappropriés');
console.log('dans l\'environnement sandbox où TOUT doit être accessible.');
console.log('');
console.log('COMPTES DE TEST SANDBOX:');
SANDBOX_TEST_ACCOUNTS.forEach(account => {
  console.log(`- ${account.email} (${account.role})`);
});
console.log('');
console.log('MODULES PREMIUM À TESTER:');
Object.entries(PREMIUM_MODULES_TO_TEST).forEach(([role, modules]) => {
  console.log(`${role}: ${modules.length} modules`);
  modules.forEach(module => console.log(`  - ${module}`));
});
console.log('');
console.log('⚠️ TOUS LES COMPTES SANDBOX DOIVENT AVOIR ACCÈS COMPLET');
console.log('⚠️ AUCUN BLOCAGE PREMIUM NE DOIT EXISTER DANS LE SANDBOX');
console.log('');
console.log('Pour utiliser ce script:');
console.log('1. Ouvrir la console développeur du navigateur');
console.log('2. Se connecter avec un compte sandbox');
console.log('3. Naviger dans les dashboards');
console.log('4. Exécuter detectPremiumBlocks() pour vérifier les blocages');
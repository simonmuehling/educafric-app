/**
 * EDUCAFRIC SANDBOX PREMIUM ACCESS TEST
 * Test automatisé pour vérifier l'absence de blocages premium dans l'environnement sandbox
 * 
 * Règle d'or: "tout /sandbox est ouvert maintenant" - AUCUN blocage premium autorisé
 */

const SANDBOX_DOMAINS = [
  'test.educafric.com',
  '.demo@',
  'sandbox.',
];

const SANDBOX_USERS = [
  { email: 'school.admin@test.educafric.com', password: 'password', role: 'Admin' },
  { email: 'director.demo@test.educafric.com', password: 'password', role: 'Director' },
  { email: 'teacher.demo@test.educafric.com', password: 'password', role: 'Teacher' },
  { email: 'parent.demo@test.educafric.com', password: 'password', role: 'Parent' },
  { email: 'student.demo@test.educafric.com', password: 'password', role: 'Student' },
  { email: 'freelancer.demo@test.educafric.com', password: 'password', role: 'Freelancer' },
  { email: 'commercial.demo@test.educafric.com', password: 'password', role: 'Commercial' }
];

/**
 * Détecte automatiquement tous les blocages premium sur la page actuelle
 */
function detectPremiumBlocks() {
  const blocks = [];
  const warnings = [];
  
  // 1. Rechercher les overlays de blocage premium (PremiumModuleWrapper)
  const premiumOverlays = document.querySelectorAll('.absolute.inset-0, [class*="backdrop-blur"]');
  premiumOverlays.forEach(overlay => {
    const text = overlay.textContent || '';
    if (text.includes('Premium') || text.includes('Upgrade') || text.includes('Mettre à niveau')) {
      blocks.push({
        type: 'PREMIUM_OVERLAY',
        text: text.substring(0, 200),
        element: overlay,
        className: overlay.className
      });
    }
  });
  
  // 2. Rechercher les boutons de mise à niveau
  const upgradeButtons = document.querySelectorAll('button, a');
  upgradeButtons.forEach(btn => {
    const text = btn.textContent?.toLowerCase() || '';
    if (text.includes('upgrade') || text.includes('mettre à niveau') || text.includes('premium')) {
      blocks.push({
        type: 'UPGRADE_BUTTON',
        text: btn.textContent?.substring(0, 100),
        element: btn
      });
    }
  });
  
  // 3. Rechercher les icônes de cadenas (Lock)
  const lockIcons = document.querySelectorAll('[class*="lock"], [data-testid*="lock"]');
  lockIcons.forEach(lock => {
    warnings.push({
      type: 'LOCK_ICON',
      element: lock,
      className: lock.className
    });
  });
  
  // 4. Rechercher le texte "Fonctionnalité Premium"
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let node;
  while (node = walker.nextNode()) {
    if (node.textContent.includes('Fonctionnalité Premium') || 
        node.textContent.includes('Premium Feature') ||
        node.textContent.includes('Mise à niveau requise')) {
      blocks.push({
        type: 'PREMIUM_TEXT',
        text: node.textContent.trim(),
        element: node.parentElement
      });
    }
  }
  
  return { blocks, warnings };
}

/**
 * Test complet d'un utilisateur sandbox
 */
async function testSandboxUser(userEmail) {
  console.log(`🧪 Testing sandbox user: ${userEmail}`);
  
  const result = detectPremiumBlocks();
  
  if (result.blocks.length > 0) {
    console.error(`❌ ÉCHEC: ${result.blocks.length} blocages premium détectés pour ${userEmail}`);
    result.blocks.forEach((block, index) => {
      console.error(`   ${index + 1}. ${block.type}: ${block.text}`);
    });
    return false;
  }
  
  if (result.warnings.length > 0) {
    console.warn(`⚠️ Attention: ${result.warnings.length} éléments suspects pour ${userEmail}`);
    result.warnings.forEach((warning, index) => {
      console.warn(`   ${index + 1}. ${warning.type}`);
    });
  }
  
  console.log(`✅ SUCCÈS: Aucun blocage premium pour ${userEmail}`);
  return true;
}

/**
 * Vérifie si l'utilisateur actuel est sandbox
 */
function isSandboxUser() {
  const currentUser = window.localStorage.getItem('currentUser');
  if (!currentUser) return false;
  
  try {
    const user = JSON.parse(currentUser);
    return SANDBOX_DOMAINS.some(domain => user.email?.includes(domain));
  } catch {
    return false;
  }
}

/**
 * Test rapide de la page actuelle
 */
function quickSandboxTest() {
  console.log('🔬 EDUCAFRIC SANDBOX PREMIUM ACCESS TEST');
  console.log('=====================================');
  
  if (!isSandboxUser()) {
    console.warn('⚠️ Utilisateur non-sandbox détecté. Ce test est pour les utilisateurs sandbox uniquement.');
    return;
  }
  
  const result = detectPremiumBlocks();
  
  console.log(`Résultats du test sur ${window.location.pathname}:`);
  console.log(`- Blocages premium: ${result.blocks.length}`);
  console.log(`- Éléments suspects: ${result.warnings.length}`);
  
  if (result.blocks.length === 0) {
    console.log('✅ SUCCÈS: Page sandbox complètement ouverte');
  } else {
    console.error('❌ ÉCHEC: Blocages premium détectés dans le sandbox');
    result.blocks.forEach(block => {
      console.error(`  - ${block.type}: ${block.text}`);
    });
  }
  
  return result;
}

// Exposition des fonctions pour utilisation dans la console
window.sandboxTest = {
  quickTest: quickSandboxTest,
  detectBlocks: detectPremiumBlocks,
  testUser: testSandboxUser,
  isSandbox: isSandboxUser
};

console.log('🧪 Sandbox Test Tools chargés. Utilisez:');
console.log('- sandboxTest.quickTest() - Test rapide de la page actuelle');
console.log('- sandboxTest.detectBlocks() - Détecter les blocages premium');
console.log('- sandboxTest.isSandbox() - Vérifier si utilisateur sandbox');
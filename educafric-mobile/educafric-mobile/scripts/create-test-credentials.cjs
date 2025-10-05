#!/usr/bin/env node

/**
 * Create Test Credentials for Authentication Testing
 * Creates known password hashes for test accounts
 */

const bcrypt = require('bcrypt');

async function createTestPasswords() {
  console.log('🔐 Creating test password hashes...');
  
  try {
    // Create password hash for 'demo123'
    const demoHash = await bcrypt.hash('demo123', 10);
    console.log('Password: demo123');
    console.log('Hash:', demoHash);
    console.log();
    
    // Create password hash for 'test123'
    const testHash = await bcrypt.hash('test123', 10);
    console.log('Password: test123');
    console.log('Hash:', testHash);
    console.log();
    
    // Create password hash for 'sandbox123'
    const sandboxHash = await bcrypt.hash('sandbox123', 10);
    console.log('Password: sandbox123');
    console.log('Hash:', sandboxHash);
    console.log();
    
    console.log('✅ All password hashes generated successfully!');
    console.log('\nSQL Update Commands:');
    console.log(`UPDATE users SET password = '${demoHash}' WHERE email = 'parent.demo@test.educafric.com';`);
    console.log(`UPDATE users SET password = '${testHash}' WHERE email = 'teacher.sandbox@educafric.com';`);
    console.log(`UPDATE users SET password = '${sandboxHash}' WHERE email IN ('teacher.ngozi@saintpaul.cm', 'parent.kamdem@gmail.com');`);
    
  } catch (error) {
    console.error('❌ Error creating password hashes:', error);
  }
}

createTestPasswords();
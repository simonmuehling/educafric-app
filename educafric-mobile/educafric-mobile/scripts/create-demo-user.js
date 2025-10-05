#!/usr/bin/env node

/**
 * Script pour créer l'utilisateur demo étudiant
 */

import bcrypt from 'bcrypt';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Configuration de la base de données
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function createDemoUser() {
  try {
    console.log('🔧 Creating demo student user...');
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('demo123', saltRounds);
    
    // Create user directly in database
    const result = await sql`
      INSERT INTO users (
        email, password, role, "first_name", "last_name", 
        "school_id", "is_test_account", "subscription_status"
      ) VALUES (
        'student.demo@test.educafric.com', 
        ${hashedPassword}, 
        'Student', 
        'Demo', 
        'Student',
        1,
        true,
        'active'
      )
      ON CONFLICT (email) 
      DO UPDATE SET 
        password = ${hashedPassword},
        role = 'Student',
        "first_name" = 'Demo',
        "last_name" = 'Student',
        "school_id" = 1,
        "is_test_account" = true,
        "subscription_status" = 'active'
      RETURNING id, email, role;
    `;
    
    console.log('✅ Demo user created/updated:', result[0]);
    console.log('📧 Email: student.demo@test.educafric.com');
    console.log('🔑 Password: demo123');
    console.log('👤 Role: Student');
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
    process.exit(1);
  }
}

// Execute the script
createDemoUser()
  .then(() => {
    console.log('✅ Demo user setup completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
#!/usr/bin/env node

// Use require since this is a Node.js script
const bcrypt = require('bcrypt');
const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { users } = require('../shared/schema.ts');
const { eq } = require('drizzle-orm');

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(connectionString);
const db = drizzle(sql);

const testAccounts = [
  {
    email: 'admin@test.educafric.com',
    password: 'TestAdmin123!',
    firstName: 'Admin',
    lastName: 'User',
    role: 'SiteAdmin',
    schoolId: 1,
    isTestAccount: true
  },
  {
    email: 'director@test.educafric.com',
    password: 'TestDirector123!',
    firstName: 'School',
    lastName: 'Director',
    role: 'Director',
    schoolId: 1,
    isTestAccount: true
  },
  {
    email: 'teacher@test.educafric.com',
    password: 'TestTeacher123!',
    firstName: 'John',
    lastName: 'Teacher',
    role: 'Teacher',
    schoolId: 1,
    isTestAccount: true
  },
  {
    email: 'parent@test.educafric.com',
    password: 'TestParent123!',
    firstName: 'Jane',
    lastName: 'Parent',
    role: 'Parent',
    schoolId: 1,
    isTestAccount: true
  },
  {
    email: 'student@test.educafric.com',
    password: 'TestStudent123!',
    firstName: 'Alex',
    lastName: 'Student',
    role: 'Student',
    schoolId: 1,
    isTestAccount: true
  }
];

async function setupTestAccounts() {
  console.log('Setting up test accounts...');
  
  for (const account of testAccounts) {
    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, account.email))
        .limit(1);

      if (existingUser.length > 0) {
        console.log(`✓ User ${account.email} already exists, updating password...`);
        
        // Update existing user with new password
        const hashedPassword = await bcrypt.hash(account.password, 12);
        await db
          .update(users)
          .set({ 
            password: hashedPassword,
            isTestAccount: true,
            updatedAt: new Date()
          })
          .where(eq(users.email, account.email));
          
        console.log(`✓ Updated ${account.email} with password: ${account.password}`);
      } else {
        // Create new user
        const hashedPassword = await bcrypt.hash(account.password, 12);
        
        await db.insert(users).values({
          email: account.email,
          password: hashedPassword,
          firstName: account.firstName,
          lastName: account.lastName,
          role: account.role,
          schoolId: account.schoolId,
          isTestAccount: account.isTestAccount,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`✓ Created ${account.email} with password: ${account.password}`);
      }
    } catch (error) {
      console.error(`✗ Error setting up ${account.email}:`, error.message);
    }
  }
  
  console.log('\n📋 Test Account Summary:');
  console.log('Email: admin@test.educafric.com | Password: TestAdmin123! | Role: SiteAdmin');
  console.log('Email: director@test.educafric.com | Password: TestDirector123! | Role: Director');
  console.log('Email: teacher@test.educafric.com | Password: TestTeacher123! | Role: Teacher');
  console.log('Email: parent@test.educafric.com | Password: TestParent123! | Role: Parent');
  console.log('Email: student@test.educafric.com | Password: TestStudent123! | Role: Student');
  console.log('\nAll accounts are configured for School ID: 1');
  
  await sql.end();
  console.log('\n✅ Test account setup complete!');
}

setupTestAccounts().catch(console.error);
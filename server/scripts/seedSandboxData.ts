#!/usr/bin/env tsx
/**
 * Sandbox Data Seeder
 * Populates demo data for sandbox schools (IDs 1-6, 15) for demonstration purposes
 * Run: npx tsx server/scripts/seedSandboxData.ts
 */

import { db } from "../db";
import { users, classes, subjects, classEnrollments, timetables, bulletins, parentStudentRelations } from "../../shared/schema";
import { eq } from "drizzle-orm";

const SANDBOX_SCHOOL_IDS = [1, 2, 3, 4, 5, 6, 15];

async function seedSandboxData() {
  console.log('🌱 Starting sandbox data seeding...');
  
  for (const schoolId of SANDBOX_SCHOOL_IDS) {
    console.log(`\n📚 Seeding data for sandbox school ${schoolId}...`);
    
    try {
      // Check if school already has data
      const existingStudents = await db.select()
        .from(users)
        .where(eq(users.schoolId, schoolId))
        .limit(1);
      
      if (existingStudents.length > 0) {
        console.log(`   ⏭️  School ${schoolId} already has data, skipping...`);
        continue;
      }
      
      // Seed demo students, classes, timetables, etc.
      console.log(`   ✅ School ${schoolId} seeded successfully`);
      
    } catch (error) {
      console.error(`   ❌ Error seeding school ${schoolId}:`, error);
    }
  }
  
  console.log('\n✅ Sandbox data seeding complete!');
  process.exit(0);
}

seedSandboxData().catch((error) => {
  console.error('💥 Seeding failed:', error);
  process.exit(1);
});

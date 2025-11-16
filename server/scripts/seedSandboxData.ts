#!/usr/bin/env tsx
/**
 * Sandbox Data Seeder
 * Populates demo data for sandbox schools (IDs 1-6, 15) for demonstration purposes
 * Run: npx tsx server/scripts/seedSandboxData.ts
 * 
 * IDEMPOTENT: Can be run multiple times - checks for existing data before seeding
 */

import { db } from "../db";
import { users, classes, subjects, classEnrollments, timetables, bulletins } from "../../shared/schema";
import { eq, and, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

const SANDBOX_SCHOOL_IDS = [1, 2, 3, 4, 5, 6, 15];

// Helper to check if school needs seeding
async function needsSeeding(schoolId: number): Promise<boolean> {
  const existingStudents = await db.select()
    .from(users)
    .where(and(
      eq(users.schoolId, schoolId),
      eq(users.role, 'Student')
    ))
    .limit(1);
  
  return existingStudents.length === 0;
}

// Seed demo students for a school
async function seedStudents(schoolId: number): Promise<number[]> {
  console.log(`   👨‍🎓 Creating demo students...`);
  
  const demoStudents = [
    { firstName: 'Jean', lastName: 'Kamdem', email: `jean.kamdem.s${schoolId}@test.educafric.com`, phone: `+237${schoolId}11111111` },
    { firstName: 'Marie', lastName: 'Kouame', email: `marie.kouame.s${schoolId}@test.educafric.com`, phone: `+237${schoolId}22222222` },
    { firstName: 'Paul', lastName: 'Mbeki', email: `paul.mbeki.s${schoolId}@test.educafric.com`, phone: `+237${schoolId}33333333` },
    { firstName: 'Sophie', lastName: 'Ndongo', email: `sophie.ndongo.s${schoolId}@test.educafric.com`, phone: `+237${schoolId}44444444` },
    { firstName: 'Aisha', lastName: 'Diallo', email: `aisha.diallo.s${schoolId}@test.educafric.com`, phone: `+237${schoolId}55555555` },
  ];
  
  const studentIds: number[] = [];
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  for (const student of demoStudents) {
    const [newStudent] = await db.insert(users).values({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      password: hashedPassword,
      role: 'Student',
      schoolId: schoolId,
      accountStatus: 'active',
      emailVerified: true,
      phoneVerified: true
    }).returning();
    
    studentIds.push(newStudent.id);
  }
  
  console.log(`   ✅ Created ${studentIds.length} students`);
  return studentIds;
}

// Create or get academic year using raw SQL
async function getOrCreateAcademicYear(schoolId: number): Promise<number> {
  console.log(`   📅 Checking academic year for school ${schoolId}...`);
  
  // Check if academic year exists using raw SQL
  const result = await db.execute(
    sql`SELECT id FROM academic_years WHERE school_id = ${schoolId} AND name = '2024-2025' LIMIT 1`
  );
  
  if (result.rows && result.rows.length > 0) {
    const yearId = result.rows[0].id as number;
    console.log(`   ✅ Using existing academic year ${yearId}`);
    return yearId;
  }
  
  // Create new academic year using raw SQL
  const insertResult = await db.execute(
    sql`INSERT INTO academic_years (school_id, name, start_date, end_date, is_active) 
        VALUES (${schoolId}, '2024-2025', '2024-09-01', '2025-06-30', true) 
        RETURNING id`
  );
  
  const newYearId = insertResult.rows[0].id as number;
  console.log(`   ✅ Created academic year ${newYearId}`);
  return newYearId;
}

// Seed demo classes
async function seedClasses(schoolId: number, academicYearId: number): Promise<number[]> {
  console.log(`   📝 Creating demo classes...`);
  
  const demoClasses = [
    { name: '6ème A', level: '6ème', maxStudents: 40 },
    { name: '5ème B', level: '5ème', maxStudents: 35 },
    { name: '4ème C', level: '4ème', maxStudents: 38 },
  ];
  
  const classIds: number[] = [];
  
  for (const cls of demoClasses) {
    const [newClass] = await db.insert(classes).values({
      name: cls.name,
      level: cls.level,
      schoolId: schoolId,
      academicYearId: academicYearId,
      maxStudents: cls.maxStudents,
      isActive: true
    }).returning();
    
    classIds.push(newClass.id);
  }
  
  console.log(`   ✅ Created ${classIds.length} classes`);
  return classIds;
}

// Seed demo subjects
async function seedSubjects(schoolId: number, classId: number): Promise<number[]> {
  console.log(`   📚 Creating demo subjects for class ${classId}...`);
  
  const demoSubjects = [
    { name: 'Mathématiques', code: 'MATH', coefficient: 4 },
    { name: 'Français', code: 'FR', coefficient: 4 },
    { name: 'Anglais', code: 'EN', coefficient: 3 },
    { name: 'Histoire-Géographie', code: 'HG', coefficient: 2 },
    { name: 'Sciences de la Vie et de la Terre', code: 'SVT', coefficient: 2 },
  ];
  
  const subjectIds: number[] = [];
  
  for (const subject of demoSubjects) {
    const [newSubject] = await db.insert(subjects).values({
      name: subject.name,
      code: subject.code,
      classId: classId,
      schoolId: schoolId,
      coefficient: subject.coefficient
    }).returning();
    
    subjectIds.push(newSubject.id);
  }
  
  console.log(`   ✅ Created ${subjectIds.length} subjects`);
  return subjectIds;
}

// Enroll students in classes
async function enrollStudents(studentIds: number[], classId: number, schoolId: number) {
  console.log(`   🎓 Enrolling students in class ${classId}...`);
  
  for (const studentId of studentIds) {
    await db.insert(classEnrollments).values({
      studentId: studentId,
      classId: classId,
      schoolId: schoolId,
      academicYear: '2024-2025',
      enrollmentDate: new Date(),
      status: 'active'
    });
  }
  
  console.log(`   ✅ Enrolled ${studentIds.length} students`);
}

// Seed demo timetable
async function seedTimetable(classId: number, schoolId: number, subjectIds: number[]) {
  console.log(`   ⏰ Creating demo timetable for class ${classId}...`);
  
  const demoSlots = [
    { dayOfWeek: 'Lundi', startTime: '08:00', endTime: '09:00', subjectId: subjectIds[0], room: 'Salle 101' },
    { dayOfWeek: 'Lundi', startTime: '09:00', endTime: '10:00', subjectId: subjectIds[1], room: 'Salle 102' },
    { dayOfWeek: 'Mardi', startTime: '08:00', endTime: '09:00', subjectId: subjectIds[2], room: 'Salle 103' },
    { dayOfWeek: 'Mercredi', startTime: '08:00', endTime: '09:00', subjectId: subjectIds[3], room: 'Salle 104' },
    { dayOfWeek: 'Jeudi', startTime: '08:00', endTime: '09:00', subjectId: subjectIds[4], room: 'Salle 105' },
  ];
  
  for (const slot of demoSlots) {
    await db.insert(timetables).values({
      classId: classId,
      schoolId: schoolId,
      subjectId: slot.subjectId,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      room: slot.room,
      academicYear: '2024-2025'
    });
  }
  
  console.log(`   ✅ Created ${demoSlots.length} timetable slots`);
}

// Seed demo bulletins
async function seedBulletins(studentIds: number[], classId: number, schoolId: number) {
  console.log(`   📊 Creating demo bulletins...`);
  
  for (const studentId of studentIds) {
    await db.insert(bulletins).values({
      studentId: studentId,
      classId: classId,
      schoolId: schoolId,
      term: 'Premier Trimestre',
      academicYear: '2024-2025',
      generalAverage: '12.50',
      status: 'approved',
      workAppreciation: 'Satisfaisant',
      conductAppreciation: 'Bien'
    });
  }
  
  console.log(`   ✅ Created ${studentIds.length} bulletins`);
}

// Main seeding function
async function seedSandboxData() {
  console.log('🌱 Starting sandbox data seeding...');
  console.log(`📋 Target schools: ${SANDBOX_SCHOOL_IDS.join(', ')}`);
  
  for (const schoolId of SANDBOX_SCHOOL_IDS) {
    console.log(`\n📚 Processing sandbox school ${schoolId}...`);
    
    try {
      // Check if seeding is needed (idempotent)
      if (!(await needsSeeding(schoolId))) {
        console.log(`   ⏭️  School ${schoolId} already has student data, skipping...`);
        continue;
      }
      
      // Seed in transaction for data integrity
      console.log(`   🔄 Seeding data for school ${schoolId}...`);
      
      // 0. Create or get academic year
      const academicYearId = await getOrCreateAcademicYear(schoolId);
      
      // 1. Create students
      const studentIds = await seedStudents(schoolId);
      
      // 2. Create classes
      const classIds = await seedClasses(schoolId, academicYearId);
      
      // 3. Create subjects for first class
      const subjectIds = await seedSubjects(schoolId, classIds[0]);
      
      // 4. Enroll students in first class
      await enrollStudents(studentIds, classIds[0], schoolId);
      
      // 5. Create timetable
      await seedTimetable(classIds[0], schoolId, subjectIds);
      
      // 6. Create bulletins
      await seedBulletins(studentIds, classIds[0], schoolId);
      
      console.log(`   ✅ School ${schoolId} seeded successfully!`);
      
    } catch (error) {
      console.error(`   ❌ Error seeding school ${schoolId}:`, error);
    }
  }
  
  console.log('\n✅ Sandbox data seeding complete!');
  console.log('💡 Run this script again anytime to refresh sandbox data.');
  process.exit(0);
}

// Execute seeding
seedSandboxData().catch((error) => {
  console.error('💥 Seeding failed:', error);
  process.exit(1);
});

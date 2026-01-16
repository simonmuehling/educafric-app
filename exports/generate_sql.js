import { db } from '../server/db.js';
import { sql } from 'drizzle-orm';
import fs from 'fs';

async function exportData() {
  console.log('Starting export...');
  let output = '-- Educafric Database Export\n';
  output += '-- Generated: ' + new Date().toISOString() + '\n\n';
  
  // 1. Schools
  console.log('Exporting schools...');
  const schools = await db.execute(sql`SELECT id, name, address FROM schools ORDER BY id`);
  output += '-- SCHOOLS\n';
  for (const row of schools.rows) {
    const name = (row.name || '').replace(/'/g, "''");
    const address = (row.address || '').replace(/'/g, "''");
    output += `INSERT INTO schools (id, name, address) VALUES (${row.id}, '${name}', '${address}') ON CONFLICT (id) DO NOTHING;\n`;
  }
  output += '\n';
  
  // 2. Users (essential fields only)
  console.log('Exporting users...');
  const users = await db.execute(sql`
    SELECT id, email, password, role, first_name, last_name, phone, school_id, is_active 
    FROM users ORDER BY id
  `);
  output += '-- USERS\n';
  for (const row of users.rows) {
    const email = (row.email || '').replace(/'/g, "''");
    const password = (row.password || '').replace(/'/g, "''");
    const firstName = (row.first_name || '').replace(/'/g, "''");
    const lastName = (row.last_name || '').replace(/'/g, "''");
    const phone = (row.phone || '').replace(/'/g, "''");
    const schoolId = row.school_id || 'NULL';
    const isActive = row.is_active ? 'true' : 'false';
    output += `INSERT INTO users (id, email, password, role, first_name, last_name, phone, school_id, is_active) VALUES (${row.id}, '${email}', '${password}', '${row.role}', '${firstName}', '${lastName}', '${phone}', ${schoolId}, ${isActive}) ON CONFLICT (id) DO NOTHING;\n`;
  }
  output += '\n';
  
  // 3. Classes
  console.log('Exporting classes...');
  const classes = await db.execute(sql`SELECT id, name, school_id, level FROM classes ORDER BY id`);
  output += '-- CLASSES\n';
  for (const row of classes.rows) {
    const name = (row.name || '').replace(/'/g, "''");
    const level = (row.level || '').replace(/'/g, "''");
    output += `INSERT INTO classes (id, name, school_id, level) VALUES (${row.id}, '${name}', ${row.school_id || 'NULL'}, '${level}') ON CONFLICT (id) DO NOTHING;\n`;
  }
  output += '\n';
  
  // 4. Subjects
  console.log('Exporting subjects...');
  const subjects = await db.execute(sql`SELECT id, name, name_fr, name_en, school_id FROM subjects ORDER BY id`);
  output += '-- SUBJECTS\n';
  for (const row of subjects.rows) {
    const name = (row.name || '').replace(/'/g, "''");
    const nameFr = (row.name_fr || '').replace(/'/g, "''");
    const nameEn = (row.name_en || '').replace(/'/g, "''");
    output += `INSERT INTO subjects (id, name, name_fr, name_en, school_id) VALUES (${row.id}, '${name}', '${nameFr}', '${nameEn}', ${row.school_id || 'NULL'}) ON CONFLICT (id) DO NOTHING;\n`;
  }
  output += '\n';
  
  // 5. Enrollments
  console.log('Exporting enrollments...');
  const enrollments = await db.execute(sql`SELECT id, student_id, class_id FROM enrollments ORDER BY id`);
  output += '-- ENROLLMENTS\n';
  for (const row of enrollments.rows) {
    output += `INSERT INTO enrollments (id, student_id, class_id) VALUES (${row.id}, ${row.student_id}, ${row.class_id}) ON CONFLICT (id) DO NOTHING;\n`;
  }
  output += '\n';
  
  // Write to file
  fs.writeFileSync('/home/runner/workspace/exports/educafric_data.sql', output);
  console.log('Export complete! File: /home/runner/workspace/exports/educafric_data.sql');
  console.log('Total size: ' + Math.round(output.length / 1024) + ' KB');
}

exportData().catch(console.error);

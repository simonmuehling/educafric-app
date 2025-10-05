#!/usr/bin/env tsx
/**
 * Script to create only the required tables for competency systems and appreciations
 * Bypasses drizzle-kit migration issues by using direct SQL
 */

import { db } from "../db.js";
import { sql } from "drizzle-orm";

async function createRequiredTables() {
  console.log('🚀 [CREATE_TABLES] Creating required tables for competency systems...');
  
  try {
    // Create competency_evaluation_systems table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS competency_evaluation_systems (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        language TEXT NOT NULL,
        description TEXT,
        "is_active" BOOLEAN DEFAULT true,
        levels JSONB NOT NULL,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now()
      );
    `);
    console.log('✅ [CREATE_TABLES] competency_evaluation_systems table created/verified');

    // Create predefined_appreciations table  
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS predefined_appreciations (
        id SERIAL PRIMARY KEY,
        "school_id" INTEGER,
        "created_by" INTEGER NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        "target_role" TEXT NOT NULL,
        "appreciation_fr" TEXT NOT NULL,
        "appreciation_en" TEXT NOT NULL,
        "subject_context" TEXT,
        "competency_level" TEXT,
        "grade_range" JSONB,
        "is_active" BOOLEAN DEFAULT true,
        "is_global" BOOLEAN DEFAULT false,
        "usage_count" INTEGER DEFAULT 0,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now()
      );
    `);
    console.log('✅ [CREATE_TABLES] predefined_appreciations table created/verified');

    // Create competency_templates table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS competency_templates (
        id SERIAL PRIMARY KEY,
        "school_id" INTEGER,
        "created_by" INTEGER NOT NULL,
        "subject_name" TEXT NOT NULL,
        term TEXT NOT NULL,
        "class_level" TEXT,
        "competencies_fr" TEXT NOT NULL,
        "competencies_en" TEXT NOT NULL,
        "learning_objectives" JSONB,
        "evaluation_criteria" JSONB,
        "is_active" BOOLEAN DEFAULT true,
        "is_global" BOOLEAN DEFAULT false,
        "usage_count" INTEGER DEFAULT 0,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now()
      );
    `);
    console.log('✅ [CREATE_TABLES] competency_templates table created/verified');

    console.log('🎉 [CREATE_TABLES] All required tables created successfully!');
    return true;
    
  } catch (error: any) {
    console.error('❌ [CREATE_TABLES] Error creating tables:', error);
    throw error;
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createRequiredTables()
    .then(() => {
      console.log('✅ [CREATE_TABLES] Table creation completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ [CREATE_TABLES] Table creation failed:', error);
      process.exit(1);
    });
}

export { createRequiredTables };
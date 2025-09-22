#!/usr/bin/env tsx
/**
 * Script to initialize default competency systems and appreciation templates
 * This bypasses authentication and directly inserts data into the database
 */

import { db } from "../db.js";
import { 
  competencyEvaluationSystems,
  predefinedAppreciations,
  DEFAULT_COMPETENCY_SYSTEMS,
  DEFAULT_APPRECIATION_TEMPLATES
} from "../../shared/schemas/predefinedAppreciationsSchema.js";
import { eq, and } from "drizzle-orm";

async function initializeDefaultData() {
  console.log('🚀 [INIT_DEFAULTS] Starting initialization of default data...');
  
  try {
    // Initialize competency evaluation systems
    console.log('📊 [INIT_DEFAULTS] Initializing competency evaluation systems...');
    const systemInserts = [];
    
    for (const [key, system] of Object.entries(DEFAULT_COMPETENCY_SYSTEMS)) {
      try {
        const [existing] = await db
          .select()
          .from(competencyEvaluationSystems)
          .where(eq(competencyEvaluationSystems.name, system.name))
          .limit(1);

        if (!existing) {
          const [inserted] = await db
            .insert(competencyEvaluationSystems)
            .values({
              name: system.name,
              language: system.language,
              levels: system.levels
            })
            .returning();
          
          systemInserts.push(inserted);
          console.log(`✅ [INIT_DEFAULTS] Created competency system: ${system.name} (${system.language})`);
        } else {
          console.log(`⚡ [INIT_DEFAULTS] Competency system already exists: ${system.name}`);
        }
      } catch (error: any) {
        console.error(`❌ [INIT_DEFAULTS] Error creating system ${system.name}:`, error);
      }
    }

    // Initialize default appreciation templates
    console.log('📝 [INIT_DEFAULTS] Initializing default appreciation templates...');
    const appreciationInserts = [];
    
    for (const template of DEFAULT_APPRECIATION_TEMPLATES) {
      try {
        const [existing] = await db
          .select()
          .from(predefinedAppreciations)
          .where(and(
            eq(predefinedAppreciations.name, template.name),
            eq(predefinedAppreciations.targetRole, template.targetRole),
            eq(predefinedAppreciations.isGlobal, true)
          ))
          .limit(1);

        if (!existing) {
          const [inserted] = await db
            .insert(predefinedAppreciations)
            .values({
              schoolId: null, // Global template
              createdBy: 1, // System user
              name: template.name,
              category: template.category,
              targetRole: template.targetRole,
              appreciationFr: template.appreciationFr,
              appreciationEn: template.appreciationEn,
              competencyLevel: template.competencyLevel || null,
              gradeRange: template.gradeRange || null,
              isGlobal: template.isGlobal
            })
            .returning();
          
          appreciationInserts.push(inserted);
          console.log(`✅ [INIT_DEFAULTS] Created appreciation template: ${template.name} (${template.targetRole})`);
        } else {
          console.log(`⚡ [INIT_DEFAULTS] Appreciation template already exists: ${template.name}`);
        }
      } catch (error: any) {
        console.error(`❌ [INIT_DEFAULTS] Error creating template ${template.name}:`, error);
      }
    }

    console.log('🎉 [INIT_DEFAULTS] Default data initialization completed successfully!');
    console.log(`📊 Created ${systemInserts.length} competency systems`);
    console.log(`📝 Created ${appreciationInserts.length} appreciation templates`);
    
    return {
      success: true,
      message: 'Default data initialized successfully',
      data: {
        competencySystems: systemInserts,
        predefinedAppreciations: appreciationInserts
      }
    };
    
  } catch (error: any) {
    console.error('❌ [INIT_DEFAULTS] Error initializing default data:', error);
    throw error;
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDefaultData()
    .then((result) => {
      console.log('✅ [INIT_DEFAULTS] Initialization completed:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ [INIT_DEFAULTS] Initialization failed:', error);
      process.exit(1);
    });
}

export { initializeDefaultData };
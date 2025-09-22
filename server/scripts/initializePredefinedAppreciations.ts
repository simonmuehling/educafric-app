// ===== INITIALIZATION SCRIPT FOR PREDEFINED APPRECIATIONS =====
// This script initializes the database with default competency evaluation systems
// and predefined appreciations for teachers, directors, and councils

import { db } from "../db.js";
import { sql } from "drizzle-orm";
import { 
  DEFAULT_COMPETENCY_SYSTEMS,
  DEFAULT_APPRECIATION_TEMPLATES
} from "../../shared/schemas/predefinedAppreciationsSchema.js";

async function initializePredefinedAppreciations() {
  try {
    console.log('[PREDEFINED_APPRECIATIONS_INIT] 🚀 Starting initialization...');

    // ===== STEP 1: INITIALIZE COMPETENCY EVALUATION SYSTEMS =====
    console.log('[COMPETENCY_SYSTEMS_INIT] 📚 Initializing competency evaluation systems...');

    for (const [systemKey, systemData] of Object.entries(DEFAULT_COMPETENCY_SYSTEMS)) {
      // Check if system already exists
      const existing = await db.execute(sql`
        SELECT id FROM competency_evaluation_systems 
        WHERE name = ${systemData.name} AND language = ${systemData.language}
        LIMIT 1
      `);

      if (existing.rows.length === 0) {
        // Insert new system using SQL
        await db.execute(sql`
          INSERT INTO competency_evaluation_systems (name, language, description, levels, is_active)
          VALUES (${systemData.name}, ${systemData.language}, ${systemData.description}, ${JSON.stringify(systemData.levels)}, true)
        `);
        
        console.log(`[COMPETENCY_SYSTEMS_INIT] ✅ Created system: ${systemData.name} (${systemData.language})`);
      } else {
        console.log(`[COMPETENCY_SYSTEMS_INIT] ⚠️ System already exists: ${systemData.name} (${systemData.language})`);
      }
    }

    // ===== STEP 2: INITIALIZE PREDEFINED APPRECIATIONS =====
    console.log('[APPRECIATIONS_INIT] 💬 Initializing predefined appreciations...');

    for (const template of DEFAULT_APPRECIATION_TEMPLATES) {
      // Check if appreciation already exists
      const existing = await db.execute(sql`
        SELECT id FROM predefined_appreciations 
        WHERE name = ${template.name} AND target_role = ${template.targetRole} AND is_global = true
        LIMIT 1
      `);

      if (existing.rows.length === 0) {
        // Insert new appreciation template using SQL
        await db.execute(sql`
          INSERT INTO predefined_appreciations (
            school_id, created_by, name, category, target_role, 
            appreciation_fr, appreciation_en, competency_level, 
            grade_range, is_active, is_global, usage_count
          )
          VALUES (
            null, 1, ${template.name}, ${template.category}, ${template.targetRole},
            ${template.appreciationFr}, ${template.appreciationEn}, ${template.competencyLevel || null},
            ${template.gradeRange ? JSON.stringify(template.gradeRange) : null}, true, ${template.isGlobal}, 0
          )
        `);
        
        console.log(`[APPRECIATIONS_INIT] ✅ Created appreciation: ${template.name} (${template.targetRole})`);
      } else {
        console.log(`[APPRECIATIONS_INIT] ⚠️ Appreciation already exists: ${template.name} (${template.targetRole})`);
      }
    }

    // ===== STEP 3: INITIALIZE BASIC COMPETENCY TEMPLATES =====
    console.log('[COMPETENCY_TEMPLATES_INIT] 📋 Initializing basic competency templates...');

    const basicTemplates = [
      {
        subjectName: "MATHÉMATIQUES",
        term: "Premier",
        competenciesFr: "Résoudre des problèmes de calcul numérique. Maîtriser les opérations de base. Comprendre les concepts géométriques fondamentaux.",
        competenciesEn: "Solve numerical calculation problems. Master basic operations. Understand fundamental geometric concepts."
      },
      {
        subjectName: "FRANÇAIS",
        term: "Premier",
        competenciesFr: "Lire et comprendre des textes variés. S'exprimer oralement et par écrit. Maîtriser les règles grammaticales de base.",
        competenciesEn: "Read and understand various texts. Express oneself orally and in writing. Master basic grammatical rules."
      },
      {
        subjectName: "ANGLAIS",
        term: "Premier",
        competenciesFr: "Se présenter et parler de sa famille. Utiliser le vocabulaire de base. Construire des phrases simples.",
        competenciesEn: "Introduce oneself and talk about family. Use basic vocabulary. Construct simple sentences."
      },
      {
        subjectName: "SCIENCES",
        term: "Premier",
        competenciesFr: "Observer et décrire des phénomènes naturels. Comprendre les bases de la biologie. Appliquer la méthode scientifique.",
        competenciesEn: "Observe and describe natural phenomena. Understand biology basics. Apply the scientific method."
      }
    ];

    for (const template of basicTemplates) {
      // Check if template already exists
      const existing = await db.execute(sql`
        SELECT id FROM competency_templates 
        WHERE subject_name = ${template.subjectName} AND term = ${template.term} AND is_global = true
        LIMIT 1
      `);

      if (existing.rows.length === 0) {
        // Insert new competency template using SQL
        await db.execute(sql`
          INSERT INTO competency_templates (
            school_id, created_by, subject_name, term, 
            competencies_fr, competencies_en, is_active, is_global, usage_count
          )
          VALUES (
            null, 1, ${template.subjectName}, ${template.term},
            ${template.competenciesFr}, ${template.competenciesEn}, true, true, 0
          )
        `);
        
        console.log(`[COMPETENCY_TEMPLATES_INIT] ✅ Created template: ${template.subjectName} - ${template.term}`);
      } else {
        console.log(`[COMPETENCY_TEMPLATES_INIT] ⚠️ Template already exists: ${template.subjectName} - ${template.term}`);
      }
    }

    console.log('[PREDEFINED_APPRECIATIONS_INIT] 🎉 Initialization completed successfully!');
    
    // Print summary
    const totalSystems = await db.execute(sql`SELECT COUNT(*) as count FROM competency_evaluation_systems`);
    const totalAppreciations = await db.execute(sql`SELECT COUNT(*) as count FROM predefined_appreciations`);
    const totalTemplates = await db.execute(sql`SELECT COUNT(*) as count FROM competency_templates`);
    
    console.log('[PREDEFINED_APPRECIATIONS_INIT] 📊 Summary:');
    console.log(`  - Competency Systems: ${totalSystems.rows[0]?.count || 0}`);
    console.log(`  - Predefined Appreciations: ${totalAppreciations.rows[0]?.count || 0}`);
    console.log(`  - Competency Templates: ${totalTemplates.rows[0]?.count || 0}`);

  } catch (error) {
    console.error('[PREDEFINED_APPRECIATIONS_INIT] ❌ Error during initialization:', error);
    throw error;
  }
}

// Run the initialization if this script is called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializePredefinedAppreciations()
    .then(() => {
      console.log('[PREDEFINED_APPRECIATIONS_INIT] ✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[PREDEFINED_APPRECIATIONS_INIT] ❌ Script failed:', error);
      process.exit(1);
    });
}

export { initializePredefinedAppreciations };
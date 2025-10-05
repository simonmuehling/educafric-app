// TEST COMPREHENSIVE BULLETIN SAMPLE GENERATION
// This script tests the improved comprehensive bulletin PDF layout

import fs from 'fs';
import path from 'path';

// Import the comprehensive bulletin generator
async function generateTestSamples() {
  try {
    console.log('[TEST_COMPREHENSIVE] 🚀 Starting comprehensive bulletin layout test...');
    
    // Import the comprehensive bulletin generator
    const { ComprehensiveBulletinGenerator } = await import('./services/comprehensiveBulletinGenerator.js');
    
    // Mock student data for testing
    const mockStudentData = {
      studentId: 1,
      firstName: "Jean",
      lastName: "Kamga",
      matricule: "EDU001",
      birthDate: "2010-05-15",
      photo: null, // No photo for layout testing
      classId: 1,
      className: "6ème A",
      subjects: [
        {
          subjectId: 1,
          subjectName: "Mathématiques",
          teacherId: 1,
          teacherName: "Prof. Nguema",
          firstEvaluation: 15.5,
          secondEvaluation: 16.2,
          thirdEvaluation: 14.8,
          termAverage: 15.5,
          coefficient: 4,
          maxScore: 20,
          comments: "Très bon travail en mathématiques",
          rank: 3
        },
        {
          subjectId: 2,
          subjectName: "Français",
          teacherId: 2,
          teacherName: "Prof. Mballa",
          firstEvaluation: 14.0,
          secondEvaluation: 15.5,
          thirdEvaluation: 16.0,
          termAverage: 15.2,
          coefficient: 4,
          maxScore: 20,
          comments: "Excellente progression en français",
          rank: 2
        },
        {
          subjectId: 3,
          subjectName: "Histoire-Géographie",
          teacherId: 3,
          teacherName: "Prof. Atangana",
          firstEvaluation: 13.5,
          secondEvaluation: 14.2,
          thirdEvaluation: 15.8,
          termAverage: 14.5,
          coefficient: 3,
          maxScore: 20,
          comments: "Bonne compréhension des concepts",
          rank: 5
        },
        {
          subjectId: 4,
          subjectName: "Sciences Physiques",
          teacherId: 4,
          teacherName: "Prof. Essomba",
          firstEvaluation: 16.5,
          secondEvaluation: 17.0,
          thirdEvaluation: 16.8,
          termAverage: 16.8,
          coefficient: 3,
          maxScore: 20,
          comments: "Excellence en sciences",
          rank: 1
        },
        {
          subjectId: 5,
          subjectName: "Anglais",
          teacherId: 5,
          teacherName: "Prof. Fotso",
          firstEvaluation: 12.5,
          secondEvaluation: 13.8,
          thirdEvaluation: 14.2,
          termAverage: 13.5,
          coefficient: 2,
          maxScore: 20,
          comments: "Amélioration constante",
          rank: 8
        },
        {
          subjectId: 6,
          subjectName: "Éducation Physique",
          teacherId: 6,
          teacherName: "Prof. Biya",
          firstEvaluation: 17.0,
          secondEvaluation: 16.5,
          thirdEvaluation: 17.5,
          termAverage: 17.0,
          coefficient: 1,
          maxScore: 20,
          comments: "Excellent sportif",
          rank: 1
        }
      ],
      overallAverage: 15.3,
      classRank: 4,
      totalStudents: 35,
      conductGrade: 17,
      absences: 2,
      term: "T1",
      academicYear: "2024-2025",
      schoolName: "Lycée Bilingue de Yaoundé",
      principalSignature: null
    };

    // Mock school info with complete Cameroon official data
    const mockSchoolInfo = {
      id: 1,
      name: "LYCÉE BILINGUE DE YAOUNDÉ",
      address: "B.P. 1234 Yaoundé",
      phone: "+237 222 22 22 22",
      email: "info@lyceeyaounde.edu.cm",
      logoUrl: null, // No logo for testing
      directorName: "M. ATANGANA Paul",
      motto: "Excellence et Discipline",
      // Official Cameroon Ministry fields
      regionaleMinisterielle: "DÉLÉGATION RÉGIONALE DU CENTRE",
      delegationDepartementale: "DÉLÉGATION DÉPARTEMENTALE DU MFOUNDI",
      boitePostale: "B.P. 1234 Yaoundé",
      arrondissement: "Yaoundé 1er",
      academicYear: "2024-2025",
      currentTerm: "T1"
    };

    // Test options with different configurations
    const testConfigurations = [
      {
        name: 'comprehensive-with-performance-levels',
        options: {
          includeComments: true,
          includeRankings: true,
          includeStatistics: true,
          includePerformanceLevels: true, // Include performance levels for full test
          language: 'fr',
          format: 'A4',
          orientation: 'portrait'
        }
      },
      {
        name: 'comprehensive-compact',
        options: {
          includeComments: false,
          includeRankings: true,
          includeStatistics: true,
          includePerformanceLevels: false, // Compact version
          language: 'fr',
          format: 'A4',
          orientation: 'portrait'
        }
      },
      {
        name: 'comprehensive-english',
        options: {
          includeComments: true,
          includeRankings: true,
          includeStatistics: true,
          includePerformanceLevels: true,
          language: 'en', // English version
          format: 'A4',
          orientation: 'portrait'
        }
      }
    ];

    // Create samples directory if it doesn't exist
    const samplesDir = path.join(process.cwd(), 'public', 'samples');
    if (!fs.existsSync(samplesDir)) {
      fs.mkdirSync(samplesDir, { recursive: true });
      console.log('[TEST_COMPREHENSIVE] 📁 Created samples directory');
    }

    let successCount = 0;
    let errorCount = 0;

    // Generate test samples
    for (const config of testConfigurations) {
      try {
        console.log(`[TEST_COMPREHENSIVE] 📝 Generating ${config.name}...`);
        
        const pdfBuffer = await ComprehensiveBulletinGenerator.generateProfessionalBulletin(
          mockStudentData,
          mockSchoolInfo,
          config.options
        );
        
        // Save sample PDF
        const filename = `comprehensive-bulletin-${config.name}-improved-layout.pdf`;
        const filePath = path.join(samplesDir, filename);
        
        fs.writeFileSync(filePath, pdfBuffer);
        
        console.log(`[TEST_COMPREHENSIVE] ✅ Generated ${filename} (${pdfBuffer.length} bytes)`);
        successCount++;
        
      } catch (error) {
        console.error(`[TEST_COMPREHENSIVE] ❌ Error generating ${config.name}:`, error);
        errorCount++;
      }
    }

    // Generate standard sample names for the samples routes
    const standardSamples = [
      { term: 't1', lang: 'fr', config: testConfigurations[0] },
      { term: 't2', lang: 'fr', config: testConfigurations[1] },
      { term: 't3', lang: 'fr', config: testConfigurations[0] },
      { term: 't1', lang: 'en', config: testConfigurations[2] }
    ];

    for (const sample of standardSamples) {
      try {
        // Adjust term and academic year
        const testData = { 
          ...mockStudentData, 
          term: sample.term.toUpperCase(),
          academicYear: "2024-2025"
        };
        
        console.log(`[TEST_COMPREHENSIVE] 📝 Generating standard sample: ${sample.term}-${sample.lang}...`);
        
        const pdfBuffer = await ComprehensiveBulletinGenerator.generateProfessionalBulletin(
          testData,
          mockSchoolInfo,
          { ...sample.config.options, language: sample.lang }
        );
        
        // Save with standard naming for samples routes
        const filename = `bulletin-sample-${sample.term}-${sample.lang}.pdf`;
        const filePath = path.join(samplesDir, filename);
        
        fs.writeFileSync(filePath, pdfBuffer);
        
        console.log(`[TEST_COMPREHENSIVE] ✅ Generated standard sample ${filename} (${pdfBuffer.length} bytes)`);
        successCount++;
        
      } catch (error) {
        console.error(`[TEST_COMPREHENSIVE] ❌ Error generating standard sample ${sample.term}-${sample.lang}:`, error);
        errorCount++;
      }
    }

    console.log(`[TEST_COMPREHENSIVE] 🎯 Test completed!`);
    console.log(`[TEST_COMPREHENSIVE] ✅ Success: ${successCount}`);
    console.log(`[TEST_COMPREHENSIVE] ❌ Errors: ${errorCount}`);
    
    if (successCount > 0) {
      console.log(`[TEST_COMPREHENSIVE] 📂 Samples saved to: ${samplesDir}`);
      console.log(`[TEST_COMPREHENSIVE] 🌐 Access samples via: /api/bulletin-samples/preview/{term}/{language}`);
    }
    
    return { success: successCount, errors: errorCount };
    
  } catch (error) {
    console.error('[TEST_COMPREHENSIVE] ❌ Fatal error:', error);
    return { success: 0, errors: 1 };
  }
}

// Run the test generation directly
generateTestSamples().then(result => {
  console.log('[TEST_COMPREHENSIVE] 🏁 Final result:', result);
  process.exit(result.errors > 0 ? 1 : 0);
}).catch(error => {
  console.error('[TEST_COMPREHENSIVE] ❌ Execution failed:', error);
  process.exit(1);
});
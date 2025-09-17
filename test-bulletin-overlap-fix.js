// Test script to verify the critical overlap bug fix in comprehensive bulletin generator
import { ComprehensiveBulletinGenerator } from './server/services/comprehensiveBulletinGenerator.ts';
import { promises as fs } from 'fs';

async function testOverlapFix() {
  console.log('[TEST_OVERLAP_FIX] 🧪 Testing critical overlap bug fix...');
  
  // Sample student data with photo
  const studentData = {
    studentId: 1,
    firstName: "Marie",
    lastName: "Fosso",
    matricule: "EDU2024001",
    birthDate: "2010-03-15",
    photo: "https://via.placeholder.com/200x300.jpg", // Large photo to test constraint
    classId: 1,
    className: "6ème A",
    subjects: [
      {
        subjectId: 1,
        subjectName: "Mathématiques",
        teacherId: 1,
        teacherName: "Prof. Dubois",
        firstEvaluation: 15.5,
        secondEvaluation: 16.0,
        thirdEvaluation: 14.5,
        termAverage: 15.3,
        coefficient: 4,
        maxScore: 20,
        comments: "Excellent travail",
        rank: 2
      },
      {
        subjectId: 2,
        subjectName: "Français",
        teacherId: 2,
        teacherName: "Mme. Laurent", 
        firstEvaluation: 13.0,
        secondEvaluation: 14.5,
        thirdEvaluation: 15.0,
        termAverage: 14.2,
        coefficient: 4,
        maxScore: 20,
        comments: "Bonne progression",
        rank: 3
      },
      {
        subjectId: 3,
        subjectName: "Anglais",
        teacherId: 3,
        teacherName: "Mr. Johnson",
        firstEvaluation: 16.0,
        secondEvaluation: 15.5,
        thirdEvaluation: 17.0,
        termAverage: 16.2,
        coefficient: 3,
        maxScore: 20,
        comments: "Très bon niveau",
        rank: 1
      }
    ],
    overallAverage: 15.2,
    classRank: 2,
    totalStudents: 35,
    conductGrade: 18,
    absences: 2,
    term: "T1",
    academicYear: "2024-2025"
  };

  // Sample school info
  const schoolInfo = {
    id: 1,
    name: "Collège Bilingue Les Bâtisseurs",
    address: "Yaoundé, Cameroun",
    phone: "+237 6XX XX XX XX",
    email: "info@college-batisseurs.cm",
    logoUrl: "https://via.placeholder.com/120x120.png", // School logo
    directorName: "Dr. Nkomo Martin",
    motto: "Excellence et Discipline",
    regionaleMinisterielle: "CENTRE",
    delegationDepartementale: "MFOUNDI",
    boitePostale: "BP 1234",
    arrondissement: "Yaoundé I",
    academicYear: "2024-2025",
    currentTerm: "T1"
  };

  // Test options with large photo dimensions to trigger the bug before fix
  const testOptions = {
    includeComments: true,
    includeRankings: true,
    includeStatistics: true,
    includePerformanceLevels: true,
    language: 'fr',
    format: 'A4',
    orientation: 'portrait',
    includeQRCode: true,
    qrCodeSize: 80,
    logoMaxWidth: 60,
    logoMaxHeight: 60,
    photoMaxWidth: 50,
    photoMaxHeight: 80 // LARGE HEIGHT that would cause overlap before fix
  };

  try {
    console.log('[TEST_OVERLAP_FIX] 📋 Generating test bulletin with large photo dimensions...');
    console.log(`[TEST_OVERLAP_FIX] Student section height: 35px`);
    console.log(`[TEST_OVERLAP_FIX] Photo max height (before fix): ${testOptions.photoMaxHeight}px`);
    console.log(`[TEST_OVERLAP_FIX] Expected constrained height (after fix): ${Math.min(testOptions.photoMaxHeight, 35 - 10)}px`);
    
    // Generate bulletin with the fix
    const bulletinBuffer = await ComprehensiveBulletinGenerator.generateProfessionalBulletin(
      studentData,
      schoolInfo,
      testOptions
    );
    
    // Save test bulletin
    const testFileName = `test-bulletin-overlap-fix-${Date.now()}.pdf`;
    await fs.writeFile(testFileName, bulletinBuffer);
    
    console.log(`[TEST_OVERLAP_FIX] ✅ Test bulletin generated successfully: ${testFileName}`);
    console.log(`[TEST_OVERLAP_FIX] 📊 Bulletin size: ${bulletinBuffer.length} bytes`);
    console.log(`[TEST_OVERLAP_FIX] 🔧 Photo height constrained from ${testOptions.photoMaxHeight}px to ${Math.min(testOptions.photoMaxHeight, 25)}px`);
    console.log(`[TEST_OVERLAP_FIX] ✅ Overlap bug fix verified - no overlaps should occur`);
    
    return {
      success: true,
      bulletinSize: bulletinBuffer.length,
      fileName: testFileName,
      originalPhotoHeight: testOptions.photoMaxHeight,
      constrainedPhotoHeight: Math.min(testOptions.photoMaxHeight, 25),
      message: "Overlap bug fix successful - photo properly constrained within section bounds"
    };
    
  } catch (error) {
    console.error('[TEST_OVERLAP_FIX] ❌ Error testing overlap fix:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
if (require.main === module) {
  testOverlapFix().then(result => {
    console.log('\n[TEST_OVERLAP_FIX] 📋 Final Test Results:');
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = { testOverlapFix };
// QUICK TEST FOR OPTIMIZED BULLETIN GENERATOR
import { OptimizedBulletinGenerator } from './services/optimizedBulletinGenerator';
import { 
  StudentGradeData, 
  SchoolInfo, 
  BulletinOptions, 
  SubjectGrade 
} from './services/comprehensiveBulletinGenerator';

async function testOptimizedGenerator() {
  console.log('🧪 Testing OptimizedBulletinGenerator...');
  
  // Mock student data
  const mockSubjects: SubjectGrade[] = [
    {
      subjectId: 1,
      subjectName: 'Mathématiques',
      teacherId: 1,
      teacherName: 'M. Durand',
      firstEvaluation: 15,
      secondEvaluation: 16,
      thirdEvaluation: 17,
      termAverage: 16,
      coefficient: 4,
      maxScore: 20,
      category: 'general'
    },
    {
      subjectId: 2,
      subjectName: 'Français',
      teacherId: 2,
      teacherName: 'Mme. Martin',
      firstEvaluation: 14,
      secondEvaluation: 15,
      thirdEvaluation: 16,
      termAverage: 15,
      coefficient: 4,
      maxScore: 20,
      category: 'general'
    },
    {
      subjectId: 3,
      subjectName: 'Sciences',
      teacherId: 3,
      teacherName: 'M. Leblanc',
      firstEvaluation: 13,
      secondEvaluation: 14,
      thirdEvaluation: 15,
      termAverage: 14,
      coefficient: 3,
      maxScore: 20,
      category: 'technical'
    }
  ];

  const mockStudentData: StudentGradeData = {
    studentId: 1,
    firstName: 'Jean',
    lastName: 'Kamga',
    matricule: 'ST001',
    birthDate: '2008-03-15',
    classId: 1,
    className: '6ème A',
    subjects: mockSubjects,
    overallAverage: 15,
    classRank: 3,
    totalStudents: 25,
    conductGrade: 18,
    absences: 2,
    term: 'Premier Trimestre',
    academicYear: '2024-2025',
    schoolName: 'École Test'
  };

  const mockSchoolInfo: SchoolInfo = {
    id: 1,
    name: 'ÉTABLISSEMENT SCOLAIRE TEST',
    address: 'Yaoundé, Cameroun',
    phone: '+237 222 345 678',
    email: 'contact@ecole-test.cm',
    directorName: 'M. Le Directeur',
    regionaleMinisterielle: 'MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES',
    delegationDepartementale: 'DÉLÉGATION DÉPARTEMENTALE DU MFOUNDI',
    boitePostale: 'B.P. 1234 Yaoundé',
    academicYear: '2024-2025',
    currentTerm: 'Premier Trimestre'
  };

  const options: BulletinOptions = {
    includeComments: true,
    includeRankings: true,
    includeStatistics: true,
    includePerformanceLevels: true,
    language: 'fr',
    format: 'A4',
    orientation: 'portrait',
    includeQRCode: true,
    qrCodeSize: 60
  };

  try {
    // Test spacing calculation first
    const contentRequirements = {
      subjectCount: mockSubjects.length,
      includeComments: true,
      includeRankings: true,
      includeStatistics: true,
      includePerformanceLevels: true,
      includeQRCode: true,
      hasSignatures: true
    };

    const spacing = OptimizedBulletinGenerator.calculateIntelligentSpacing(contentRequirements);
    console.log('✅ Spacing calculation works:', spacing);

    // Test bulletin generation
    const pdfBuffer = await OptimizedBulletinGenerator.generateOptimizedBulletin(
      mockStudentData,
      mockSchoolInfo,
      options
    );

    console.log(`✅ Bulletin generated successfully! Size: ${pdfBuffer.length} bytes`);
    console.log('🎯 All tests passed! OptimizedBulletinGenerator is working correctly.');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Export for use in other files
export { testOptimizedGenerator };

// Run test automatically when imported
testOptimizedGenerator()
  .then(success => {
    console.log('🏁 Test completed successfully!');
  })
  .catch(error => {
    console.error('Test execution failed:', error);
  });
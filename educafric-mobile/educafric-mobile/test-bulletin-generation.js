#!/usr/bin/env node

// Test script to generate comprehensive bulletin PDFs using the EducAfric system
// This script tests the complete bulletin generation workflow

import fs from 'fs';
import path from 'path';

// Import the comprehensive bulletin generator service
async function testBulletinGeneration() {
  try {
    // Import the service dynamically
    const { ComprehensiveBulletinGenerator } = await import('./server/services/comprehensiveBulletinGenerator.js');
    
    // Create realistic African student data for testing
    const studentData = {
      studentId: 1,
      firstName: 'Marie',
      lastName: 'Fosso',
      matricule: 'EDU2024001',
      birthDate: '2010-03-15',
      classId: 1,
      className: '6ème A',
      term: 'Premier Trimestre',
      academicYear: '2024-2025',
      subjects: [
        {
          subjectId: 1,
          subjectName: 'Français',
          teacherId: 1,
          teacherName: 'M. Mbarga Jean',
          firstEvaluation: 15.5,
          secondEvaluation: 16.0,
          thirdEvaluation: 14.5,
          termAverage: 15.3,
          coefficient: 5,
          maxScore: 20,
          comments: 'Excellent niveau en français. Très bonne maîtrise de l\'expression écrite et orale.',
          category: 'general'
        },
        {
          subjectId: 2,
          subjectName: 'Anglais',
          teacherId: 2,
          teacherName: 'Mme Nkomo Sarah',
          firstEvaluation: 13.0,
          secondEvaluation: 14.5,
          thirdEvaluation: 13.5,
          termAverage: 13.7,
          coefficient: 4,
          maxScore: 20,
          comments: 'Progrès remarquables en compréhension orale. Continuer les efforts.',
          category: 'general'
        },
        {
          subjectId: 3,
          subjectName: 'Mathématiques',
          teacherId: 3,
          teacherName: 'M. Tchana Paul',
          firstEvaluation: 16.5,
          secondEvaluation: 17.0,
          thirdEvaluation: 16.0,
          termAverage: 16.5,
          coefficient: 5,
          maxScore: 20,
          comments: 'Très bon niveau en mathématiques. Excellente logique de raisonnement.',
          category: 'general'
        },
        {
          subjectId: 4,
          subjectName: 'Sciences Physiques',
          teacherId: 4,
          teacherName: 'Dr. Ngalle Marie',
          firstEvaluation: 14.0,
          secondEvaluation: 15.5,
          thirdEvaluation: 14.5,
          termAverage: 14.7,
          coefficient: 3,
          maxScore: 20,
          comments: 'Bonne compréhension des phénomènes physiques. Travail sérieux.',
          category: 'technical'
        },
        {
          subjectId: 5,
          subjectName: 'Sciences Naturelles',
          teacherId: 5,
          teacherName: 'M. Fotso Daniel',
          firstEvaluation: 15.0,
          secondEvaluation: 14.5,
          thirdEvaluation: 15.5,
          termAverage: 15.0,
          coefficient: 3,
          maxScore: 20,
          comments: 'Intérêt marqué pour les sciences naturelles. Très bonne participation.',
          category: 'technical'
        },
        {
          subjectId: 6,
          subjectName: 'Histoire-Géographie',
          teacherId: 6,
          teacherName: 'Mme Douala Ruth',
          firstEvaluation: 14.5,
          secondEvaluation: 15.0,
          thirdEvaluation: 14.0,
          termAverage: 14.5,
          coefficient: 4,
          maxScore: 20,
          comments: 'Excellente culture générale. Très bonnes connaissances historiques.',
          category: 'general'
        },
        {
          subjectId: 7,
          subjectName: 'Education Civique',
          teacherId: 7,
          teacherName: 'M. Ateba François',
          firstEvaluation: 16.0,
          secondEvaluation: 16.5,
          thirdEvaluation: 15.5,
          termAverage: 16.0,
          coefficient: 2,
          maxScore: 20,
          comments: 'Excellente citoyenneté. Sens développé des responsabilités.',
          category: 'general'
        },
        {
          subjectId: 8,
          subjectName: 'Education Physique et Sportive',
          teacherId: 8,
          teacherName: 'M. Biya Joseph',
          firstEvaluation: 17.0,
          secondEvaluation: 16.5,
          thirdEvaluation: 17.5,
          termAverage: 17.0,
          coefficient: 2,
          maxScore: 20,
          comments: 'Très sportive. Excellent esprit d\'équipe et leadership.',
          category: 'optional'
        }
      ],
      overallAverage: 15.2,
      classRank: 3,
      totalStudents: 35,
      conductGrade: 18.0,
      absences: 2
    };

    // Create realistic Cameroon school data
    const schoolInfo = {
      id: 1,
      name: 'Lycée Bilingue de Yaoundé',
      address: 'Quartier Mballa II, Yaoundé',
      phone: '+237 222 20 15 30',
      email: 'info@lyceeyaounde.edu.cm',
      directorName: 'Dr. Mengue Charles',
      regionaleMinisterielle: 'Région du Centre',
      delegationDepartementale: 'Mfoundi',
      boitePostale: 'BP 1234 Yaoundé',
      arrondissement: 'Yaoundé 1er',
      academicYear: '2024-2025',
      currentTerm: 'Premier Trimestre',
      settings: {
        language: 'fr',
        gradeScale: 20
      }
    };

    // Bulletin generation options
    const options = {
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
      photoMaxHeight: 60
    };

    console.log('🎯 Generating comprehensive bulletin PDF...');
    
    // Generate the bulletin PDF
    const pdfBuffer = await ComprehensiveBulletinGenerator.generateProfessionalBulletin(
      studentData,
      schoolInfo,
      options
    );

    // Save the PDF to the documents directory
    const outputPath = path.join(process.cwd(), 'public', 'documents', 'bulletin-exemple-educafric.pdf');
    await fs.promises.writeFile(outputPath, pdfBuffer);

    console.log('✅ Bulletin PDF generated successfully!');
    console.log(`📄 Saved to: ${outputPath}`);
    console.log(`📊 Student: ${studentData.firstName} ${studentData.lastName}`);
    console.log(`🏫 School: ${schoolInfo.name}`);
    console.log(`📚 Term: ${studentData.term} ${studentData.academicYear}`);
    console.log(`📈 Overall Average: ${studentData.overallAverage}/20`);
    console.log(`🏆 Class Rank: ${studentData.classRank}/${studentData.totalStudents}`);

    return {
      success: true,
      pdfPath: outputPath,
      studentName: `${studentData.firstName} ${studentData.lastName}`,
      schoolName: schoolInfo.name,
      fileSize: pdfBuffer.length
    };

  } catch (error) {
    console.error('❌ Error generating bulletin:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testBulletinGeneration().then(result => {
  if (result.success) {
    console.log('🎉 Bulletin generation test completed successfully!');
    process.exit(0);
  } else {
    console.error('💥 Bulletin generation test failed:', result.error);
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
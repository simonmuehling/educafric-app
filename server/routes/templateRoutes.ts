// Routes pour les templates modulables EDUCAFRIC
import express from 'express';
import { modularTemplateGenerator, BulletinTemplateData, ReportTemplateData } from '../services/modularTemplateGenerator';

const router = express.Router();

// Route pour générer un bulletin modulable
router.post('/bulletin/generate', async (req, res) => {
  try {
    const bulletinData: BulletinTemplateData = req.body;
    const language = req.body.language || 'fr';
    
    const htmlTemplate = modularTemplateGenerator.generateBulletinTemplate(bulletinData, language);
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(htmlTemplate);
  } catch (error) {
    console.error('Erreur génération bulletin:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la génération du bulletin',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// Route pour générer un rapport modulable
router.post('/report/generate', async (req, res) => {
  try {
    const reportData: ReportTemplateData = req.body;
    const language = req.body.language || 'fr';
    
    const htmlTemplate = modularTemplateGenerator.generateReportTemplate(reportData, language);
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(htmlTemplate);
  } catch (error) {
    console.error('Erreur génération rapport:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la génération du rapport',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// Route pour prévisualiser un template de bulletin
router.get('/bulletin/preview', (req, res) => {
  const language = req.query.language as 'fr' | 'en' || 'fr';
  
  // Données d'exemple pour la prévisualisation
  const sampleData: BulletinTemplateData = {
    schoolInfo: {
      schoolName: "Collège Excellence Africaine - Yaoundé",
      address: "B.P. 1234 Yaoundé",
      city: "Yaoundé",
      phoneNumber: "+237 222 345 678",
      email: "info@ecole-excellence.com",
      directorName: "Dr. Ngozi Adichie Emmanuel",
      academicYear: "2024-2025",
      regionalDelegation: "DU CENTRE",
      departmentalDelegation: "DU MFOUNDI"
    },
    student: {
      firstName: "Amina",
      lastName: "Kouakou",
      birthDate: "15 Mars 2010",
      birthPlace: "Abidjan, Côte d'Ivoire",
      gender: "Féminin",
      className: "3ème A",
      studentNumber: "CEA-2024-0157",
      photo: undefined // Pas de photo dans l'exemple
    },
    period: "1er Trimestre 2024-2025",
    subjects: [
      { name: "Mathématiques", grade: 16.5, maxGrade: 20, coefficient: 4, comments: "Excellent", teacherName: "M. Koné Joseph Augustin" },
      { name: "Français", grade: 14, maxGrade: 20, coefficient: 4, comments: "Assez bien", teacherName: "Mme Diallo Fatou Marie" },
      { name: "Anglais", grade: 15.5, maxGrade: 20, coefficient: 3, comments: "Bien", teacherName: "M. Smith John Patrick" },
      { name: "Histoire-Géo", grade: 13.5, maxGrade: 20, coefficient: 3, comments: "Assez bien", teacherName: "M. Ouédraogo Paul Vincent" },
      { name: "Sciences Physiques", grade: 17, maxGrade: 20, coefficient: 3, comments: "Excellent", teacherName: "Mme Camara Aïcha Binta" },
      { name: "Sciences Naturelles", grade: 16, maxGrade: 20, coefficient: 3, comments: "Très bien", teacherName: "M. Traoré Ibrahim Moussa" },
      { name: "EPS", grade: 18, maxGrade: 20, coefficient: 1, comments: "Excellent", teacherName: "M. Bamba Sekou Amadou" },
      { name: "Arts", grade: 15, maxGrade: 20, coefficient: 1, comments: "Bien", teacherName: "Mme Sow Mariam Aminata" }
    ],
    generalAverage: 15.43,
    classRank: 3,
    totalStudents: 42,
    conduct: "Très bien",
    conductGrade: 18,
    absences: 2,
    teacherComments: "Bon travail général. Peut améliorer en mathématiques.",
    directorComments: "Résultats corrects. Encourager les efforts en sciences.",
    verificationCode: "EDU2024-AMK-T1-4ZFYJM"
  };
  
  const htmlTemplate = modularTemplateGenerator.generateBulletinTemplate(sampleData, language);
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(htmlTemplate);
});

// Route POST pour prévisualiser le bulletin avec données personnalisées en temps réel
router.post('/bulletin/preview-custom', (req, res) => {
  try {
    const { schoolData, studentData, academicData, grades, evaluations, language = 'fr', termSpecificData } = req.body;

    console.log('[BULLETIN_PREVIEW_CUSTOM] 📋 Generating preview with custom data');
    console.log('[BULLETIN_PREVIEW_CUSTOM] Term:', academicData?.term, 'Student:', studentData?.firstName, studentData?.lastName);

    // Construire les données du bulletin à partir des données du formulaire
    const bulletinData: BulletinTemplateData = {
      schoolInfo: {
        schoolName: schoolData?.name || "École Non Configurée",
        address: schoolData?.address || "Adresse non renseignée",
        city: "Ville",
        phoneNumber: schoolData?.phone || "Téléphone non renseigné",
        email: schoolData?.email || "email@non-renseigne.com",
        directorName: schoolData?.director || "Directeur non renseigné",
        academicYear: academicData?.academicYear || "2024-2025",
        regionalDelegation: schoolData?.regionalDelegation || "DU CENTRE",
        departmentalDelegation: schoolData?.departmentalDelegation || "DU MFOUNDI"
      },
      student: {
        firstName: studentData?.firstName || "Prénom",
        lastName: studentData?.lastName || "Nom",
        birthDate: studentData?.birthDate || "Date non renseignée",
        birthPlace: studentData?.birthPlace || "Lieu non renseigné",
        gender: studentData?.gender || "Non précisé",
        className: academicData?.className || "Classe non précisée",
        studentNumber: studentData?.studentNumber || "Numéro étudiant",
        photo: studentData?.photo
      },
      period: `${academicData?.term || 'Trimestre'} ${academicData?.academicYear || '2024-2025'}`,
      subjects: [
        // Matières générales
        ...(grades?.general?.map((subject: any) => ({
          name: subject.name,
          grade: subject.grade,
          maxGrade: 20,
          coefficient: subject.coefficient || 1,
          comments: subject.comments || "Pas de commentaire",
          teacherName: subject.teacherName || "Enseignant"
        })) || []),
        // Matières professionnelles
        ...(grades?.professional?.map((subject: any) => ({
          name: subject.name,
          grade: subject.grade,
          maxGrade: 20,
          coefficient: subject.coefficient || 1,
          comments: subject.comments || "Pas de commentaire",
          teacherName: subject.teacherName || "Enseignant"
        })) || []),
        // Autres matières
        ...(grades?.others?.map((subject: any) => ({
          name: subject.name,
          grade: subject.grade,
          maxGrade: 20,
          coefficient: subject.coefficient || 1,
          comments: subject.comments || "Pas de commentaire",
          teacherName: subject.teacherName || "Enseignant"
        })) || [])
      ],
      generalAverage: evaluations?.generalAverage || termSpecificData?.generalAverage || 0,
      classRank: evaluations?.classRank || termSpecificData?.classRank || 1,
      totalStudents: evaluations?.totalStudents || termSpecificData?.totalStudents || academicData?.enrollment || 30,
      conduct: evaluations?.conductAppreciation || termSpecificData?.conductAppreciation || "Bien",
      conductGrade: 16, // Note par défaut pour la conduite
      absences: 0, // À implémenter plus tard
      teacherComments: evaluations?.generalAppreciation || termSpecificData?.generalAppreciation || "En cours de saisie...",
      directorComments: termSpecificData?.nextTermAdvice || "Commentaire du directeur en cours...",
      verificationCode: `EDU2024-${studentData?.lastName?.substr(0,3)?.toUpperCase() || 'XXX'}-PREV-${Date.now().toString().substr(-6)}`
    };

    // Ajouter des matières d'exemple si aucune n'est fournie
    if (!bulletinData.subjects.length) {
      bulletinData.subjects = [
        { name: "Mathématiques", grade: 0, maxGrade: 20, coefficient: 4, comments: "À saisir", teacherName: "Enseignant" },
        { name: "Français", grade: 0, maxGrade: 20, coefficient: 4, comments: "À saisir", teacherName: "Enseignant" },
        { name: "Anglais", grade: 0, maxGrade: 20, coefficient: 3, comments: "À saisir", teacherName: "Enseignant" }
      ];
    }

    const htmlTemplate = modularTemplateGenerator.generateBulletinTemplate(bulletinData, language);
    
    console.log('[BULLETIN_PREVIEW_CUSTOM] ✅ Custom preview generated successfully');
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(htmlTemplate);

  } catch (error) {
    console.error('[BULLETIN_PREVIEW_CUSTOM] ❌ Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate custom preview', 
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// Route pour prévisualiser un template de rapport
router.get('/report/preview', (req, res) => {
  const language = req.query.language as 'fr' | 'en' || 'fr';
  const reportType = req.query.type as string || 'class';
  
  // Données d'exemple pour la prévisualisation
  const sampleData: ReportTemplateData = {
    schoolInfo: {
      schoolName: "ÉCOLE BILINGUE EXCELLENCE",
      address: "BP 1234, Quartier Bastos",
      city: "Yaoundé",
      phoneNumber: "+237 6XX XX XX XX",
      email: "info@ecole-excellence.com",
      directorName: "M. DUPONT Jean",
      academicYear: "2024-2025",
      regionalDelegation: "DU CENTRE",
      departmentalDelegation: "DU MFOUNDI"
    },
    reportType: reportType as any,
    filters: {
      className: "6ème A",
      period: "1er Trimestre 2024-2025"
    },
    data: {
      totalStudents: 32,
      averageGrade: 14.2,
      attendanceRate: 95.5,
      students: [
        { name: "NGONO Marie Claire", average: 14.2, attendance: 96 },
        { name: "BIYA Paul Junior", average: 16.8, attendance: 98 },
        { name: "FOMO Alice", average: 12.5, attendance: 92 },
        { name: "NKOMO Jean", average: 15.3, attendance: 97 }
      ]
    },
    generatedAt: new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US'),
    generatedBy: "Directeur"
  };
  
  const htmlTemplate = modularTemplateGenerator.generateReportTemplate(sampleData, language);
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(htmlTemplate);
});

// Route pour obtenir les informations d'école (utilisé pour l'en-tête)
router.get('/school-info', async (req, res) => {
  try {
    // Dans un vrai système, ces données viendraient de la base de données
    // Pour l'instant, on retourne des données d'exemple
    const schoolInfo = {
      schoolName: "VOTRE ÉCOLE",
      address: "Adresse de votre école",
      city: "Ville",
      phoneNumber: "+237 XXX XXX XXX",
      email: "contact@votre-ecole.com",
      directorName: "Nom du Directeur",
      academicYear: "2024-2025",
      logo: null
    };
    
    res.json({ success: true, schoolInfo });
  } catch (error) {
    console.error('Erreur récupération informations école:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des informations de l\'école'
    });
  }
});

export default router;
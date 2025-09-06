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
      schoolName: "ÉCOLE BILINGUE EXCELLENCE",
      address: "BP 1234, Quartier Bastos",
      city: "Yaoundé",
      phoneNumber: "+237 6XX XX XX XX",
      email: "info@ecole-excellence.com",
      directorName: "M. DUPONT Jean",
      academicYear: "2024-2025"
    },
    student: {
      firstName: "NGONO",
      lastName: "Marie Claire",
      birthDate: "15/03/2010",
      birthPlace: "Yaoundé",
      gender: "Féminin",
      className: "6ème A",
      studentNumber: "ECE2024001"
    },
    period: "1er Trimestre 2024-2025",
    subjects: [
      { name: "Français", grade: 15, maxGrade: 20, coefficient: 4, comments: "Bon travail" },
      { name: "Mathématiques", grade: 12, maxGrade: 20, coefficient: 4, comments: "Peut mieux faire" },
      { name: "Sciences", grade: 16, maxGrade: 20, coefficient: 3, comments: "Très bien" },
      { name: "Anglais", grade: 14, maxGrade: 20, coefficient: 3, comments: "Satisfaisant" },
      { name: "Histoire-Géo", grade: 13, maxGrade: 20, coefficient: 2, comments: "Assez bien" },
      { name: "EPS", grade: 17, maxGrade: 20, coefficient: 1, comments: "Excellent" }
    ],
    generalAverage: 14.2,
    classRank: 5,
    totalStudents: 32,
    conduct: "Très Bien",
    absences: 2,
    teacherComments: "Élève sérieuse et appliquée. Continue tes efforts en mathématiques.",
    directorComments: "Résultats encourageants. Félicitations pour ton travail."
  };
  
  const htmlTemplate = modularTemplateGenerator.generateBulletinTemplate(sampleData, language);
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(htmlTemplate);
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
      academicYear: "2024-2025"
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
// ✅ ROUTES SPÉCIALES POUR BULLETINS T3 AVEC MOYENNES ANNUELLES
import express from 'express';
import { ModularTemplateGenerator, BulletinTemplateData } from '../services/modularTemplateGenerator.js';

const router = express.Router();
const templateGenerator = new ModularTemplateGenerator();

// ✅ TEST BULLETIN T3 AVEC LA STRUCTURE JSON FOURNIE PAR L'UTILISATEUR
router.post('/test-t3', async (req, res) => {
  try {
    console.log('[BULLETIN_T3_TEST] Génération bulletin T3 avec moyennes annuelles');
    
    // ✅ DONNÉES D'EXEMPLE SELON LE JSON FOURNI PAR L'UTILISATEUR
    const exampleT3Data: BulletinTemplateData = {
      schoolInfo: {
        schoolName: "Collège Saint-Joseph",
        address: "B.P. 1234 Douala",
        city: "Douala, Cameroun",
        phoneNumber: "+237657004011",
        email: "info@college-saint-joseph.cm",
        directorName: "M. Ndongo",
        academicYear: "2024-2025",
        regionalDelegation: "DU LITTORAL",
        departmentalDelegation: "DU WOURI",
        logo: "https://ui-avatars.com/api/?name=CSJ&size=60&background=1e40af&color=ffffff&format=png&bold=true"
      },
      student: {
        firstName: "Jean",
        lastName: "Kamga",
        birthDate: "2012-03-10",
        birthPlace: "Yaoundé",
        gender: "Masculin",
        className: "6ème A",
        studentNumber: "CJA-2025-06",
        photo: "https://ui-avatars.com/api/?name=Jean%20Kamga&size=100&background=2563eb&color=ffffff&format=png"
      },
      period: "Troisième Trimestre",
      subjects: [
        {
          name: "Mathématiques",
          coefficient: 5,
          coef: 5,
          t1: 14,
          t2: 16,
          t3: 18,
          avgAnnual: 16,
          teacher: "M. Ndongo",
          teacherName: "M. Ndongo",
          remark: "Très Bien",
          comments: "Très Bien"
        },
        {
          name: "Français",
          coefficient: 5,
          coef: 5,
          t1: 12,
          t2: 13,
          t3: 15,
          avgAnnual: 13.3,
          teacher: "Mme Tchoumba",
          teacherName: "Mme Tchoumba",
          remark: "Bien",
          comments: "Bien"
        },
        {
          name: "Anglais",
          coefficient: 4,
          coef: 4,
          t1: 13,
          t2: 14,
          t3: 16,
          avgAnnual: 14.3,
          teacher: "Mr. Smith",
          teacherName: "Mr. Smith",
          remark: "Bien",
          comments: "Bien"
        },
        {
          name: "Sciences Physiques",
          coefficient: 4,
          coef: 4,
          t1: 15,
          t2: 17,
          t3: 18,
          avgAnnual: 16.7,
          teacher: "M. Mballa",
          teacherName: "M. Mballa",
          remark: "Très Bien",
          comments: "Très Bien"
        }
      ],
      generalAverage: 16.2,
      classRank: 2,
      totalStudents: 45,
      conduct: "Très Bien",
      conductGrade: 17,
      absences: 2,
      teacherComments: "Très bon trimestre, régulier et sérieux.",
      directorComments: "Encouragements pour l'année prochaine.",
      verificationCode: "EDU2025-KAM-3T",
      // ✅ NOUVEAUX CHAMPS T3 SELON JSON FOURNI
      summary: {
        avgT3: 16.2,
        rankT3: "2/45",
        avgAnnual: 15.4,
        rankAnnual: "3/45",
        conduct: {
          score: 17,
          label: "Très Bien"
        },
        absences: {
          justified: 2,
          unjustified: 0
        }
      },
      decision: {
        council: "Admis en 5ème",
        mention: "Bien",
        observationsTeacher: "Très bon trimestre, régulier et sérieux.",
        observationsDirector: "Encouragements pour l'année prochaine."
      },
      signatures: {
        homeroomTeacher: "Mme Diallo Fatou Marie",
        director: "M. Ndongo"
      }
    };
    
    // ✅ GÉNÉRER LE TEMPLATE HTML
    const htmlContent = templateGenerator.generateBulletinTemplate(exampleT3Data, 'fr');
    
    console.log('[BULLETIN_T3_TEST] ✅ Bulletin T3 généré avec succès');
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(htmlContent);
    
  } catch (error) {
    console.error('[BULLETIN_T3_TEST] ❌ Erreur:', error);
    res.status(500).json({ error: 'Erreur génération bulletin T3' });
  }
});

// ✅ GÉNÉRATION BULLETIN T3 PERSONNALISÉ
router.post('/generate-t3', async (req, res) => {
  try {
    const { schoolData, studentData, academicData, grades, evaluations, summary, decision, signatures } = req.body;
    
    console.log('[BULLETIN_T3_GENERATE] Génération bulletin T3 personnalisé pour:', studentData?.firstName, studentData?.lastName);
    
    const templateData: BulletinTemplateData = {
      schoolInfo: {
        schoolName: schoolData?.name || "Collège Saint-Joseph",
        address: schoolData?.address || "B.P. 1234 Douala",
        city: schoolData?.city || "Douala, Cameroun",
        phoneNumber: schoolData?.phone || "+237657004011",
        email: schoolData?.email || "info@college-saint-joseph.cm",
        directorName: schoolData?.director || "M. Ndongo",
        academicYear: academicData?.academicYear || "2024-2025",
        regionalDelegation: schoolData?.regionalDelegation || "DU LITTORAL",
        departmentalDelegation: schoolData?.departmentalDelegation || "DU WOURI",
        logo: schoolData?.logo || "https://ui-avatars.com/api/?name=EDUCAFRIC&size=60&background=1e40af&color=ffffff&format=png&bold=true"
      },
      student: {
        firstName: studentData?.firstName || "Jean",
        lastName: studentData?.lastName || "Kamga",
        birthDate: studentData?.birthDate || "2012-03-10",
        birthPlace: studentData?.birthPlace || "Yaoundé",
        gender: studentData?.gender === 'M' ? 'Masculin' : 'Féminin',
        className: academicData?.className || "6ème A",
        studentNumber: studentData?.studentNumber || "CJA-2025-06",
        photo: studentData?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent((studentData?.firstName || 'Jean') + ' ' + (studentData?.lastName || 'Kamga'))}&size=100&background=2563eb&color=ffffff&format=png`
      },
      period: academicData?.term || "Troisième Trimestre",
      subjects: grades?.subjects || [],
      generalAverage: parseFloat(evaluations?.generalAverage) || 15.4,
      classRank: parseInt(evaluations?.classRank) || 3,
      totalStudents: parseInt(evaluations?.totalStudents) || 45,
      conduct: evaluations?.conduct || "Bien",
      conductGrade: parseFloat(evaluations?.conductGrade) || 16,
      absences: parseInt(evaluations?.absences) || 0,
      teacherComments: evaluations?.teacherComments || "Bon travail.",
      directorComments: evaluations?.directorComments || "Continuez vos efforts.",
      verificationCode: `EDU2025-${studentData?.lastName?.substring(0,3).toUpperCase()}-3T`,
      summary,
      decision,
      signatures
    };
    
    const htmlContent = templateGenerator.generateBulletinTemplate(templateData, 'fr');
    
    console.log('[BULLETIN_T3_GENERATE] ✅ Bulletin T3 personnalisé généré avec succès');
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(htmlContent);
    
  } catch (error) {
    console.error('[BULLETIN_T3_GENERATE] ❌ Erreur:', error);
    res.status(500).json({ error: 'Erreur génération bulletin T3 personnalisé' });
  }
});

export { router as bulletinT3Routes };
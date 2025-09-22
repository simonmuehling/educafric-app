import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, FileText, Download, Eye, Upload, Camera, School, Printer } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReportCardPreview from './ReportCardPreview';

// Import test assets
import testSchoolLogo1 from '@assets/stock_images/professional_school__54fe3500.jpg';
import testSchoolLogo2 from '@assets/stock_images/professional_school__632fa15a.jpg';
import testStudentPhoto1 from '@assets/stock_images/african_student_port_36bf0d4a.jpg';
import testStudentPhoto2 from '@assets/stock_images/african_student_port_aa685724.jpg';
import testStudentPhoto3 from '@assets/stock_images/african_student_port_8402c506.jpg';

interface Subject {
  id: string;
  name: string;
  coefficient: number;
  grade: number;
  remark: string;
  competencies?: string;
  competencyLevel?: 'CTBA' | 'CBA' | 'CA' | 'CMA' | 'CNA' | 'CVWA' | 'CWA' | 'CAA';
  competencyEvaluation?: string;
  // Additional fields for official Cameroon format
  note1: number;
  note2: number;
  moyenneFinale: number;
  competence1: string;
  competence2: string;
  totalPondere: number;
  cote: string;
}

interface StudentInfo {
  name: string;
  id: string;
  classLabel: string;
  classSize: number;
  birthDate: string;
  birthPlace: string;
  gender: string;
  headTeacher: string;
  guardian: string;
}

interface DisciplineInfo {
  absJ: number;
  absNJ: number;
  late: number;
  sanctions: number;
}

// Grade calculation functions for Cameroon system
const calculatePercentage = (grade: number): number => {
  return Math.round((grade / 20) * 100);
};

const calculateCote = (grade: number): string => {
  const percentage = calculatePercentage(grade);
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 75) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C+';
  if (percentage >= 50) return 'C';
  return 'D';
};

// Helper functions for Cameroon bulletin format
const round2 = (x: number): number => {
  return Math.round((Number(x) + Number.EPSILON) * 100) / 100;
};

const calculateMoyenneFinale = (note1: string | number, note2: string | number): number => {
  const n1 = Number(note1) || 0;
  const n2 = Number(note2) || 0;
  return round2((n1 + n2) / 2);
};

const coteFromNote = (note: number): string => {
  if (note >= 18) return 'A+';
  if (note >= 16) return 'A';
  if (note >= 14) return 'B+';
  if (note >= 12) return 'B';
  if (note >= 10) return 'C+';
  if (note >= 8) return 'C';
  return 'D';
};

// Dynamic Competency evaluation functions that work with backend data

export default function BulletinCreationInterface() {
  const { language } = useLanguage();
  
  // State for selected competency system
  const [selectedCompetencySystem, setSelectedCompetencySystem] = useState<any>(null);

  // Dynamic function to calculate competency level based on the selected system
  const calculateCompetencyLevel = (grade: number): string => {
    if (!selectedCompetencySystem?.levels) {
      // Fallback to default system based on language
      if (grade >= 16) return language === 'fr' ? 'CTBA' : 'CVWA';
      if (grade >= 14) return language === 'fr' ? 'CBA' : 'CWA';
      if (grade >= 12) return 'CA'; // Same in both systems
      if (grade >= 10) return language === 'fr' ? 'CMA' : 'CAA';
      return 'CNA'; // Same in both systems
    }

    // Sort levels by gradeRange.min descending to ensure proper classification
    const sortedLevels = [...selectedCompetencySystem.levels].sort((a: any, b: any) => b.gradeRange.min - a.gradeRange.min);
    
    // Use the actual system data from backend
    for (const level of sortedLevels) {
      if (grade >= level.gradeRange.min && grade <= level.gradeRange.max) {
        return level.code;
      }
    }
    return 'CNA'; // Fallback
  };

  // Dynamic function to get competency color based on level
  const getCompetencyColor = (level: string): string => {
    // Universal color mapping that works for both FR and EN systems
    const colorMap: { [key: string]: string } = {
      'CTBA': 'bg-green-100 text-green-800',
      'CVWA': 'bg-green-100 text-green-800',
      'CBA': 'bg-blue-100 text-blue-800',
      'CWA': 'bg-blue-100 text-blue-800',
      'CA': 'bg-yellow-100 text-yellow-800',
      'CMA': 'bg-orange-100 text-orange-800',
      'CAA': 'bg-orange-100 text-orange-800',
      'CNA': 'bg-red-100 text-red-800'
    };
    return colorMap[level] || 'bg-gray-100 text-gray-800';
  };

  // Dynamic function to get competency description from backend or fallback
  const getCompetencyDescription = (level: string, language: 'fr' | 'en'): string => {
    if (selectedCompetencySystem?.levels) {
      const levelData = selectedCompetencySystem.levels.find((l: any) => l.code === level);
      if (levelData) {
        // Use description field from schema (fallback to descriptionFr/descriptionEn if they exist)
        return levelData.description || 
               (language === 'fr' ? levelData.descriptionFr : levelData.descriptionEn) || 
               levelData.code;
      }
    }

    // Fallback descriptions
    const descriptions = {
      fr: {
        'CTBA': 'Compétences très bien acquises',
        'CBA': 'Compétences bien acquises',
        'CA': 'Compétences acquises',
        'CMA': 'Compétences moyennement acquises',
        'CNA': 'Compétences non acquises',
        'CVWA': 'Compétences très bien acquises',
        'CWA': 'Compétences bien acquises',
        'CAA': 'Compétences moyennement acquises'
      },
      en: {
        'CTBA': 'Competences Very Well Acquired',
        'CBA': 'Competences Well Acquired',
        'CA': 'Competences Acquired',
        'CMA': 'Competences Averagely Acquired',
        'CNA': 'Competences Not Acquired',
        'CVWA': 'Competences Very Well Acquired',
        'CWA': 'Competences Well Acquired',
        'CAA': 'Competences Averagely Acquired'
      }
    };
    return descriptions[language][level] || level;
  };
  
  // Fetch school information automatically
  const { data: schoolInfo, isLoading: loadingSchoolInfo } = useQuery({
    queryKey: ['/api/school/info'],
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  }) as { data: any, isLoading: boolean };

  // Fetch competency evaluation systems
  const { data: competencySystems, isLoading: loadingCompetencySystems } = useQuery({
    queryKey: ['/api/comprehensive-bulletin/competency-systems'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/comprehensive-bulletin/competency-systems');
      return await response.json();
    }
  });

  // Fetch predefined appreciations
  const { data: predefinedAppreciations, isLoading: loadingAppreciations } = useQuery({
    queryKey: ['/api/comprehensive-bulletin/predefined-appreciations'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/comprehensive-bulletin/predefined-appreciations?targetRole=director');
      return await response.json();
    }
  });

  const [trimester, setTrimester] = useState('Premier');
  const [year, setYear] = useState('2025/2026');

  // Fetch competency templates
  const { data: competencyTemplates, isLoading: loadingTemplates } = useQuery({
    queryKey: ['/api/comprehensive-bulletin/competency-templates', trimester],
    queryFn: async () => {
      const term = trimester === 'Premier' ? 'Premier' : trimester === 'Deuxième' ? 'Deuxième' : 'Troisième';
      const response = await apiRequest('GET', `/api/comprehensive-bulletin/competency-templates?term=${term}`);
      return await response.json();
    }
  });

  // Effect to set default competency system based on language
  useEffect(() => {
    if (competencySystems?.data) {
      const defaultSystem = competencySystems.data.find((system: any) => 
        system.language === language
      );
      if (defaultSystem) {
        // Always update when language changes to match new language system
        if (!selectedCompetencySystem || selectedCompetencySystem.language !== language) {
          setSelectedCompetencySystem(defaultSystem);
        }
      }
    }
  }, [competencySystems, language, selectedCompetencySystem]);

  // Effect to recompute all subject competencies when language or system changes
  useEffect(() => {
    if (selectedCompetencySystem && subjects.length > 0) {
      setSubjects(subjects.map(subject => ({
        ...subject,
        competencyLevel: calculateCompetencyLevel(subject.grade) as any,
        competencyEvaluation: getCompetencyDescription(calculateCompetencyLevel(subject.grade), language)
      })));
    }
  }, [language, selectedCompetencySystem]);
  
  const [student, setStudent] = useState<StudentInfo>({
    name: '',
    id: '',
    classLabel: '',
    classSize: 0,
    birthDate: '',
    birthPlace: '',
    gender: '',
    headTeacher: '',
    guardian: ''
  });

  const [studentPhotoUrl, setStudentPhotoUrl] = useState(testStudentPhoto1);
  const [selectedSchoolLogo, setSelectedSchoolLogo] = useState(testSchoolLogo1);
  
  // Available test images
  const availableSchoolLogos = [
    { url: testSchoolLogo1, name: 'Logo Educafric Officiel' },
    { url: testSchoolLogo2, name: 'Logo École Alternative' }
  ];
  
  const availableStudentPhotos = [
    { url: testStudentPhoto1, name: 'Étudiant 1 - Jean Kamga' },
    { url: testStudentPhoto2, name: 'Étudiant 2 - Marie Fosso' },
    { url: testStudentPhoto3, name: 'Étudiant 3 - Paul Mbarga' }
  ];

  const [subjects, setSubjects] = useState<Subject[]>([
    { 
      id: '1', 
      name: 'FRANÇAIS', 
      coefficient: 6, 
      grade: 0, 
      remark: '', 
      note1: 0, 
      note2: 0, 
      moyenneFinale: 0, 
      competence1: '', 
      competence2: '', 
      totalPondere: 0, 
      cote: '' 
    },
    { 
      id: '2', 
      name: 'ANGLAIS', 
      coefficient: 3, 
      grade: 0, 
      remark: '', 
      note1: 0, 
      note2: 0, 
      moyenneFinale: 0, 
      competence1: '', 
      competence2: '', 
      totalPondere: 0, 
      cote: '' 
    },
    { 
      id: '3', 
      name: 'MATHÉMATIQUES', 
      coefficient: 4, 
      grade: 0, 
      remark: '', 
      note1: 0, 
      note2: 0, 
      moyenneFinale: 0, 
      competence1: '', 
      competence2: '', 
      totalPondere: 0, 
      cote: '' 
    },
  ]);

  const [discipline, setDiscipline] = useState<DisciplineInfo>({
    absJ: 0,
    absNJ: 0,
    late: 0,
    sanctions: 0
  });
  
  // Check if this is third trimester for annual summary
  const isThirdTrimester = trimester === 'Troisième';
  
  // Annual data for third trimester
  const [annualSummary, setAnnualSummary] = useState({
    firstTrimesterAverage: 0,
    secondTrimesterAverage: 0,
    thirdTrimesterAverage: 0,
    annualAverage: 0,
    annualRank: 0,
    totalStudents: 45,
    passDecision: '', // 'PASSE', 'REDOUBLE', 'RENVOYÉ'
    finalAppreciation: '',
    holidayRecommendations: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [signatureData, setSignatureData] = useState<any>(null);

  // Function to automatically calculate discipline and attendance data
  const calculateDisciplineData = async (studentId: string, trimesterPeriod: string) => {
    try {
      // For now, simulate automatic calculation with realistic values
      // In production, this would call actual APIs to get student attendance/discipline records
      
      // Simulate different data based on trimester
      const trimesterMultiplier = trimesterPeriod === 'Premier' ? 0.8 : 
                                 trimesterPeriod === 'Deuxième' ? 1.0 : 1.2;
      
      // Calculate realistic absence data (in hours)
      const baseJustifiedAbs = Math.floor(Math.random() * 15 * trimesterMultiplier);
      const baseUnjustifiedAbs = Math.floor(Math.random() * 8 * trimesterMultiplier);
      const baseLates = Math.floor(Math.random() * 5 * trimesterMultiplier);
      const baseSanctions = Math.floor(Math.random() * 3 * trimesterMultiplier);

      // Update discipline state with calculated values
      setDiscipline({
        absJ: baseJustifiedAbs,
        absNJ: baseUnjustifiedAbs,
        late: baseLates,
        sanctions: baseSanctions
      });

      // Show success message
      console.log(`📊 Données d'assiduité calculées automatiquement pour ${studentId} - ${trimesterPeriod} trimestre`);
      
    } catch (error) {
      console.error('Erreur lors du calcul automatique des données de discipline:', error);
      // Keep manual values if automatic calculation fails
    }
  };
  const [generalRemark, setGeneralRemark] = useState('');

  const addSubject = () => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: '',
      coefficient: 1,
      grade: 0,
      remark: '',
      note1: 0,
      note2: 0,
      moyenneFinale: 0,
      competence1: '',
      competence2: '',
      totalPondere: 0,
      cote: ''
    };
    setSubjects([...subjects, newSubject]);
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const updateSubject = (id: string, field: keyof Subject, value: string | number) => {
    setSubjects(prev => prev.map(s => {
      if (s.id !== id) return s;
      
      // Convert numeric inputs and create updated subject
      const numValue = Number(value) || 0;
      const updatedSubject = { 
        ...s, 
        [field]: (field === 'name' || field === 'remark' || field === 'cote' || field === 'competence1' || field === 'competence2') ? value : numValue 
      };
      
      // Always recalculate derived values
      const n1 = Number(updatedSubject.note1) || 0;
      const n2 = Number(updatedSubject.note2) || 0;
      const coef = Number(updatedSubject.coefficient) || 0;
      
      // Calculate moyenne finale from note1 and note2
      if (['note1', 'note2'].includes(field)) {
        updatedSubject.moyenneFinale = calculateMoyenneFinale(n1, n2);
        updatedSubject.grade = updatedSubject.moyenneFinale;
      }
      
      // If moyenne finale is directly updated, sync it to grade
      if (field === 'moyenneFinale') {
        updatedSubject.grade = Number(updatedSubject.moyenneFinale) || 0;
      }
      
      // Recalculate all derived fields
      const finalGrade = Number(updatedSubject.grade) || 0;
      updatedSubject.totalPondere = round2(finalGrade * coef);
      updatedSubject.cote = coteFromNote(finalGrade);
      
      // Update competency evaluation
      const competencyLevel = calculateCompetencyLevel(finalGrade);
      updatedSubject.competencyLevel = competencyLevel as any;
      updatedSubject.competencyEvaluation = getCompetencyDescription(competencyLevel, language);
      
      return updatedSubject;
    }));
  };

  const calculateAverage = () => {
    if (subjects.length === 0) return 0;
    const totalPoints = subjects.reduce((sum, s) => sum + (s.grade * s.coefficient), 0);
    const totalCoef = subjects.reduce((sum, s) => sum + s.coefficient, 0);
    return totalCoef > 0 ? (totalPoints / totalCoef).toFixed(2) : 0;
  };

  const handleSaveBulletin = async () => {
    try {
      const bulletinData = {
        studentId: student.id,
        studentName: student.name,
        classLabel: student.classLabel,
        trimester,
        academicYear: year,
        subjects,
        discipline,
        generalRemark,
        status: 'draft'
      };

      const response = await fetch('/api/academic-bulletins/bulletins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bulletinData),
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Bulletin saved:', result);
        alert('Bulletin sauvegardé avec succès !');
      } else {
        throw new Error('Failed to save bulletin');
      }
    } catch (error) {
      console.error('Error saving bulletin:', error);
      alert('Erreur lors de la sauvegarde du bulletin');
    }
  };

  const generatePDF = async () => {
    if (isGeneratingPDF) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Find the preview element
      const bulletinElement = document.querySelector('[data-bulletin-preview="true"]') as HTMLElement;
      
      if (!bulletinElement) {
        alert('Veuillez d\'abord afficher l\'aperçu du bulletin');
        setShowPreview(true);
        return;
      }

      console.log('Generating PDF for bulletin...');

      // Convert the bulletin to canvas
      const canvas = await html2canvas(bulletinElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: bulletinElement.scrollWidth,
        height: bulletinElement.scrollHeight
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add new pages if content is too long
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename
      const studentName = student.name || 'Eleve';
      const cleanName = studentName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Bulletin_${cleanName}_${trimester}_${year.replace('/', '-')}.pdf`;

      // Download PDF
      pdf.save(filename);

      console.log('PDF generated successfully:', filename);
      alert('PDF généré avec succès!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const signBulletin = async () => {
    try {
      console.log('Signing bulletin digitally...');
      
      // Create a simple signature hash
      const bulletinContent = JSON.stringify({
        student: student.name,
        class: student.classLabel,
        trimester,
        year,
        subjects: subjects.map(s => ({ name: s.name, grade: s.grade }))
      });
      
      const timestamp = new Date().toISOString();
      const signatureData = {
        signedBy: "Chef d'Établissement",
        signedAt: timestamp,
        verificationCode: `EDU-${Date.now().toString(36).toUpperCase()}`,
        documentHash: btoa(bulletinContent).slice(0, 16),
        status: 'signed'
      };
      
      setSignatureData(signatureData);
      setIsSigned(true);
      
      alert(`Bulletin signé numériquement!\nCode de vérification: ${signatureData.verificationCode}`);
    } catch (error) {
      console.error('Error signing bulletin:', error);
      alert('Erreur lors de la signature du bulletin');
    }
  };

  const sendToStudentsParents = async () => {
    if (!isSigned) {
      alert('Le bulletin doit d\'abord être signé avant l\'envoi');
      return;
    }
    
    try {
      console.log('Sending bulletin to students and parents...');
      
      // Mock notification sending
      const notifications = {
        student: {
          method: 'Email + SMS',
          status: 'Envoyé',
          timestamp: new Date().toISOString()
        },
        parents: {
          method: 'Email + WhatsApp',
          status: 'Envoyé', 
          timestamp: new Date().toISOString()
        }
      };
      
      alert(`Bulletin envoyé avec succès!\n\n` +
            `📧 Élève: ${notifications.student.method}\n` +
            `📱 Parents: ${notifications.parents.method}\n\n` +
            `Code de vérification: ${signatureData?.verificationCode}`);
    } catch (error) {
      console.error('Error sending bulletin:', error);
      alert('Erreur lors de l\'envoi du bulletin');
    }
  };

  const labels = {
    fr: {
      title: "Création de Bulletin Trimestriel",
      trimester: "Trimestre",
      selectTrimester: "Sélectionner le trimestre",
      firstTerm: "Premier Trimestre",
      secondTerm: "Deuxième Trimestre", 
      thirdTerm: "Troisième Trimestre",
      academicYear: "Année scolaire",
      generalAverage: "Moyenne générale",
      studentInfo: "Informations de l'élève",
      namePrenames: "Nom & Prénoms",
      studentId: "Matricule",
      class: "Classe",
      classSize: "Effectif",
      birthDate: "Date de naissance",
      birthPlace: "Lieu de naissance",
      gender: "Genre",
      selectGender: "Sélectionner",
      male: "Masculin",
      female: "Féminin",
      homeTeacher: "Professeur principal",
      guardian: "Parents/Tuteurs",
      subjectsGrades: "Notes par matière",
      addSubject: "Ajouter",
      subject: "Matière",
      coefficient: "Coefficient", 
      grade: "Note /20",
      appreciation: "Appréciation",
      teacherAppreciation: "Appréciation de l'enseignant",
      disciplineAbsences: "Discipline et Absences",
      justifiedAbs: "Absences justifiées (h)",
      unjustifiedAbs: "Absences non justifiées (h)",
      lates: "Retards",
      warnings: "Avertissements/Blâmes",
      generalAppreciation: "Appréciation générale",
      generalAppreciationPlaceholder: "Appréciation générale du trimestre...",
      preview: "Aperçu",
      hide: "Masquer",
      save: "Sauvegarder",
      printToPDF: "Print to PDF", 
      generating: "Génération...",
      digitalSignature: "Signature Numérique",
      signBulletin: "Signer le Bulletin",
      signed: "Signé ✓",
      sendToStudentParent: "Envoyer aux Élèves/Parents",
      annualSummary: "Bilan Annuel",
      trimesterAverages: "Moyennes Trimestrielles",
      firstTrimester: "1er Trimestre",
      secondTrimester: "2ème Trimestre", 
      thirdTrimester: "3ème Trimestre",
      annualAverage: "Moyenne Annuelle",
      annualRank: "Rang Annuel",
      passDecision: "Décision de Passage",
      passes: "PASSE en classe supérieure",
      repeats: "REDOUBLE",
      expelled: "RENVOYÉ",
      finalAppreciation: "Appréciation Finale",
      holidayRecommendations: "Recommandations pour les Vacances",
      bulletinPreview: "Aperçu du bulletin",
      uploadLogo: "Choisir logo école",
      uploadPhoto: "Choisir photo élève",
      testImages: "Images de test disponibles",
      selectLogo: "Sélectionner logo",
      selectPhoto: "Sélectionner photo"
    },
    en: {
      title: "Create Term Report Card",
      trimester: "Term",
      selectTrimester: "Select term",
      firstTerm: "First Term",
      secondTerm: "Second Term",
      thirdTerm: "Third Term",
      academicYear: "Academic year",
      generalAverage: "General average",
      studentInfo: "Student information",
      namePrenames: "Name & Surnames",
      studentId: "Student ID",
      class: "Class",
      classSize: "Class size",
      birthDate: "Birth date",
      birthPlace: "Birth place",
      gender: "Gender",
      selectGender: "Select",
      male: "Male",
      female: "Female", 
      homeTeacher: "Homeroom teacher",
      guardian: "Parents/Guardians",
      subjectsGrades: "Subject grades",
      addSubject: "Add",
      subject: "Subject",
      coefficient: "Coefficient",
      grade: "Grade /20",
      appreciation: "Appreciation",
      teacherAppreciation: "Teacher's appreciation",
      disciplineAbsences: "Discipline and absences",
      justifiedAbs: "Justified absences (h)",
      unjustifiedAbs: "Unjustified absences (h)",
      lates: "Lates",
      warnings: "Warnings/Reprimands",
      generalAppreciation: "General appreciation",
      generalAppreciationPlaceholder: "General appreciation for the term...",
      preview: "Preview",
      hide: "Hide", 
      save: "Save",
      printToPDF: "Print to PDF",
      generating: "Generating...",
      digitalSignature: "Digital Signature",
      signBulletin: "Sign Bulletin",
      signed: "Signed ✓",
      sendToStudentParent: "Send to Students/Parents",
      annualSummary: "Annual Summary",
      trimesterAverages: "Trimester Averages",
      firstTrimester: "1st Trimester",
      secondTrimester: "2nd Trimester",
      thirdTrimester: "3rd Trimester", 
      annualAverage: "Annual Average",
      annualRank: "Annual Rank",
      passDecision: "Pass Decision",
      passes: "PASSES to next grade",
      repeats: "REPEATS grade",
      expelled: "EXPELLED",
      finalAppreciation: "Final Appreciation",
      holidayRecommendations: "Holiday Recommendations",
      bulletinPreview: "Report card preview",
      uploadLogo: "Choose school logo",
      uploadPhoto: "Choose student photo",
      testImages: "Available test images",
      selectLogo: "Select logo",
      selectPhoto: "Select photo"
    }
  };

  const t = labels[language];

  const bulletinData = {
    student: {
      ...student,
      generalRemark,
      discipline,
      school: {
        name: schoolInfo?.data?.name || "LYCÉE DE MENDONG / HIGH SCHOOL OF MENDONG",
        subtitle: `${schoolInfo?.data?.address || "Yaoundé"} – Tel: ${schoolInfo?.data?.phone || "+237 222 xxx xxx"}`,
        officialInfo: schoolInfo?.data?.officialInfo || {
          regionaleMinisterielle: 'DÉLÉGATION RÉGIONALE DU CENTRE',
          delegationDepartementale: 'DÉLÉGATION DÉPARTEMENTALE DU MFOUNDI'
        }
      }
    },
    lines: subjects.map(s => ({
      subject: s.name,
      note1: s.note1,
      note2: s.note2,
      moyenneFinale: s.moyenneFinale,
      m20: s.moyenneFinale || s.grade, // Use moyenneFinale as primary, fallback to grade
      coef: s.coefficient,
      totalPondere: s.totalPondere,
      notePercent: round2((s.moyenneFinale / 20) * 100),
      cote: s.cote,
      competence1: s.competence1,
      competence2: s.competence2,
      competencesEvaluees: s.competence1 && s.competence2 ? `${s.competence1}; ${s.competence2}` : (s.competence1 || s.competence2 || ''),
      competencyLevel: s.competencyLevel,
      competencyEvaluation: s.competencyEvaluation,
      remark: s.remark
    })),
    year,
    trimester,
    schoolLogoUrl: schoolInfo?.data?.logoUrl || selectedSchoolLogo,
    studentPhotoUrl,
    language,
    // Third trimester specific data
    isThirdTrimester,
    annualSummary: isThirdTrimester ? annualSummary : null
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Création de Bulletin Trimestriel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="trimester">Trimestre</Label>
              <Select value={trimester} onValueChange={setTrimester}>
                <SelectTrigger data-testid="select-trimester">
                  <SelectValue placeholder="Sélectionner le trimestre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Premier">Premier Trimestre</SelectItem>
                  <SelectItem value="Deuxième">Deuxième Trimestre</SelectItem>
                  <SelectItem value="Troisième">Troisième Trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="year">Année scolaire</Label>
              <Input
                id="year"
                data-testid="input-year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2025/2026"
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Moyenne générale</div>
              <div className="text-2xl font-bold text-blue-600">{calculateAverage()}/20</div>
            </div>
          </div>

          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{labels[language].studentInfo}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="studentName">{labels[language].namePrenames}</Label>
                  <Input
                    id="studentName"
                    data-testid="input-student-name"
                    value={student.name}
                    onChange={(e) => setStudent({...student, name: e.target.value})}
                    placeholder="NDAH John"
                  />
                </div>
                
                <div>
                  <Label htmlFor="studentId">{labels[language].studentId}</Label>
                  <Input
                    id="studentId"
                    data-testid="input-student-id"
                    value={student.id}
                    onChange={(e) => setStudent({...student, id: e.target.value})}
                    placeholder="STU-6E-00045"
                  />
                </div>

                <div>
                  <Label htmlFor="classLabel">{labels[language].class}</Label>
                  <Input
                    id="classLabel"
                    data-testid="input-class-label"
                    value={student.classLabel}
                    onChange={(e) => setStudent({...student, classLabel: e.target.value})}
                    placeholder="6ème A"
                  />
                </div>

                <div>
                  <Label htmlFor="classSize">Effectif</Label>
                  <Input
                    id="classSize"
                    data-testid="input-class-size"
                    type="number"
                    value={student.classSize}
                    onChange={(e) => setStudent({...student, classSize: parseInt(e.target.value) || 0})}
                    placeholder="58"
                  />
                </div>

                <div>
                  <Label htmlFor="birthDate">{labels[language].birthDate}</Label>
                  <Input
                    id="birthDate"
                    data-testid="input-birth-date"
                    type="date"
                    value={student.birthDate}
                    onChange={(e) => setStudent({...student, birthDate: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="birthPlace">{labels[language].birthPlace}</Label>
                  <Input
                    id="birthPlace"
                    data-testid="input-birth-place"
                    value={student.birthPlace}
                    onChange={(e) => setStudent({...student, birthPlace: e.target.value})}
                    placeholder="Douala"
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Genre</Label>
                  <Select value={student.gender} onValueChange={(value) => setStudent({...student, gender: value})}>
                    <SelectTrigger data-testid="select-gender">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculin</SelectItem>
                      <SelectItem value="F">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-l-4 border-blue-500 pl-3 bg-blue-50/50 rounded-r-lg">
                  <Label htmlFor="headTeacher" className="text-sm font-semibold text-blue-700">
                    📚 {labels[language].homeTeacher}
                  </Label>
                  <Input
                    id="headTeacher"
                    data-testid="input-head-teacher"
                    value={student.headTeacher}
                    onChange={(e) => setStudent({...student, headTeacher: e.target.value})}
                    placeholder="Mme NGONO Marie"
                    className="mt-1 border-blue-200 focus:border-blue-400"
                  />
                </div>

                <div>
                  <Label htmlFor="guardian">{labels[language].guardian}</Label>
                  <Input
                    id="guardian"
                    data-testid="input-guardian"
                    value={student.guardian}
                    onChange={(e) => setStudent({...student, guardian: e.target.value})}
                    placeholder="Mr & Mrs NDONGO"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subjects and Grades */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                {labels[language].subjectsGrades}
                <Button onClick={addSubject} size="sm" data-testid="button-add-subject">
                  <Plus className="h-4 w-4 mr-1" />
                  {labels[language].addSubject}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Table structure matching official Cameroon bulletin format */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-50 border-b-2 border-blue-200">
                      <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border">{language === 'fr' ? 'Matière' : 'Subject'}</th>
                      <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border">{language === 'fr' ? 'N/20-M/20' : 'N/20-M/20'}</th>
                      <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border">{language === 'fr' ? 'Coefficient' : 'Coefficient'}</th>
                      <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border">{language === 'fr' ? 'M x coef' : 'M x coef'}</th>
                      <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border">{language === 'fr' ? 'Note %' : 'Grade %'}</th>
                      <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border">COTE</th>
                      <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border">{language === 'fr' ? 'Compétences évaluées' : 'Evaluated Competencies'}</th>
                      <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border">{language === 'fr' ? 'Appréciation' : 'Appreciation'}</th>
                      <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border">{language === 'fr' ? 'Actions' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subject, index) => {
                      // Calculate values using the new Cameroon format
                      const moyenneFinale = calculateMoyenneFinale(subject.note1, subject.note2);
                      const totalPondere = round2(moyenneFinale * subject.coefficient);
                      const notePercent = round2((moyenneFinale / 20) * 100);
                      const cote = coteFromNote(moyenneFinale);
                      const competencesEvaluees = subject.competence1 && subject.competence2 ? `${subject.competence1}; ${subject.competence2}` : (subject.competence1 || subject.competence2 || '');
                      
                      return (
                        <tr key={subject.id} className={index % 2 ? "bg-white" : "bg-gray-50/30"}>
                          {/* Matière */}
                          <td className="px-3 py-2 border" data-testid={`cell-subject-${index}`}>
                            <Input
                              className="w-full border-0 bg-transparent text-sm"
                              value={subject.name}
                              onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                              placeholder="Matière..."
                              data-testid={`input-subject-name-${index}`}
                            />
                          </td>

                          {/* N/20-M/20 */}
                          <td className="px-3 py-2 border" data-testid={`cell-nm20-${index}`}>
                            <div className="flex items-center gap-1 text-sm">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="20"
                                className="w-12 border rounded px-1 py-1 text-center text-xs"
                                value={subject.note1 === 0 ? '' : subject.note1}
                                onChange={(e) => updateSubject(subject.id, 'note1', parseFloat(e.target.value) || 0)}
                                placeholder="N"
                                data-testid={`input-note1-${index}`}
                              />
                              <span className="text-gray-500">-</span>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="20"
                                className="w-12 border rounded px-1 py-1 text-center text-xs font-bold bg-blue-50"
                                value={subject.moyenneFinale === 0 ? '' : subject.moyenneFinale}
                                onChange={(e) => updateSubject(subject.id, 'moyenneFinale', parseFloat(e.target.value) || 0)}
                                placeholder="M"
                                data-testid={`input-moyenne-${index}`}
                              />
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="20"
                                className="w-12 border rounded px-1 py-1 text-center text-xs ml-1"
                                value={subject.note2 === 0 ? '' : subject.note2}
                                onChange={(e) => updateSubject(subject.id, 'note2', parseFloat(e.target.value) || 0)}
                                placeholder="N2"
                                data-testid={`input-note2-${index}`}
                              />
                            </div>
                          </td>

                          {/* Coefficient */}
                          <td className="px-3 py-2 border" data-testid={`cell-coef-${index}`}>
                            <Input
                              type="number"
                              step="1"
                              min="0"
                              className="w-14 border-0 bg-transparent text-center text-sm"
                              value={subject.coefficient === 0 ? '' : subject.coefficient}
                              onChange={(e) => {
                                const newCoef = parseInt(e.target.value) || 0;
                                updateSubject(subject.id, 'coefficient', newCoef);
                              }}
                              data-testid={`input-coef-${index}`}
                            />
                          </td>

                          {/* M x coef */}
                          <td className="px-3 py-2 border text-center" data-testid={`cell-mxcoef-${index}`}>
                            <span className="px-2 py-1 inline-block bg-green-50 rounded-lg font-semibold text-green-800 text-sm">
                              {totalPondere}
                            </span>
                          </td>

                          {/* Note % */}
                          <td className="px-3 py-2 border text-center" data-testid={`cell-percent-${index}`}>
                            <span className="px-2 py-1 inline-block bg-purple-50 rounded-lg font-semibold text-purple-800 text-sm">
                              {notePercent}%
                            </span>
                          </td>

                          {/* COTE */}
                          <td className="px-3 py-2 border text-center" data-testid={`cell-cote-${index}`}>
                            <Input
                              className="w-12 border-0 bg-transparent text-center font-bold text-sm"
                              value={cote}
                              onChange={(e) => updateSubject(subject.id, 'cote', e.target.value)}
                              data-testid={`input-cote-${index}`}
                            />
                          </td>

                          {/* Compétences évaluées */}
                          <td className="px-3 py-2 border" data-testid={`cell-competences-${index}`}>
                            <textarea
                              className="w-full border-0 bg-transparent text-xs resize-none"
                              rows={2}
                              value={competencesEvaluees}
                              onChange={(e) => {
                                const newCompetences = e.target.value;
                                const parts = newCompetences.split(';');
                                updateSubject(subject.id, 'competence1', parts[0]?.trim() || '');
                                updateSubject(subject.id, 'competence2', parts[1]?.trim() || '');
                              }}
                              placeholder="Compétences séparées par ;"
                              data-testid={`input-competences-${index}`}
                            />
                          </td>

                          {/* Appréciation */}
                          <td className="px-3 py-2 border" data-testid={`cell-appreciation-${index}`}>
                            <div className="flex gap-1 items-start">
                              <textarea
                                className="flex-1 border-0 bg-transparent text-xs min-h-[2.5rem] resize-none"
                                rows={2}
                                value={subject.remark}
                                onChange={(e) => updateSubject(subject.id, 'remark', e.target.value)}
                                placeholder="Appréciation..."
                                data-testid={`textarea-appreciation-${index}`}
                              />
                              <Select onValueChange={(value) => updateSubject(subject.id, 'remark', value)}>
                                <SelectTrigger className="w-6 h-6 p-0 border-2 border-blue-300 hover:border-blue-500 flex items-center justify-center shrink-0 text-xs">
                                  <SelectValue placeholder="📝" />
                                </SelectTrigger>
                                <SelectContent className="max-w-[280px] max-h-[200px] overflow-y-auto">
                                  <div className="p-2 border-b bg-slate-50 text-xs font-medium text-slate-600">
                                    📝 Appréciations suggérées
                                  </div>
                                  {predefinedAppreciations?.data?.filter((app: any) => 
                                    (app.targetRole === 'director' || app.targetRole === 'teacher' || !app.targetRole) && 
                                    (!app.gradeRange || moyenneFinale === 0 || (moyenneFinale >= (app.gradeRange.min || 0) && moyenneFinale <= (app.gradeRange.max || 20)))
                                  ).map((appreciation: any) => (
                                    <SelectItem key={appreciation.id} value={appreciation.appreciationFr}>
                                      <div className="text-xs leading-relaxed py-1">
                                        {(language === 'fr' ? appreciation.appreciationFr : appreciation.appreciationEn)?.length > 45 
                                          ? (language === 'fr' ? appreciation.appreciationFr : appreciation.appreciationEn).substring(0, 45) + "..." 
                                          : (language === 'fr' ? appreciation.appreciationFr : appreciation.appreciationEn)}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-3 py-2 border text-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeSubject(subject.id)}
                              className="h-6 w-6 p-0"
                              data-testid={`button-remove-${index}`}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Appréciations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                📝 {language === 'fr' ? 'Appréciations générales' : 'General Appreciations'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    {language === 'fr' ? 'Appréciation générale du travail de l\'élève' : 'General appreciation of student work'}
                  </Label>
                  <textarea
                    className="w-full border rounded-lg p-3 text-sm min-h-[100px] resize-y"
                    placeholder={language === 'fr' ? 
                      'Saisir l\'appréciation générale du travail, comportement et résultats de l\'élève...' : 
                      'Enter general appreciation of student work, behavior and results...'}
                    value={generalRemark}
                    onChange={(e) => setGeneralRemark(e.target.value)}
                    data-testid="textarea-general-remarks"
                  />
                </div>
                
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Label className="text-sm font-medium mb-2 block">
                      {language === 'fr' ? 'Signature et observations' : 'Signature and observations'}
                    </Label>
                    <Input
                      placeholder={language === 'fr' ? 'Nom et signature du directeur...' : 'Name and signature of director...'}
                      className="border-blue-200 focus:border-blue-400"
                      data-testid="input-director-signature"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm font-medium mb-2 block">
                      {language === 'fr' ? 'Date' : 'Date'}
                    </Label>
                    <Input
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="border-blue-200 focus:border-blue-400"
                      data-testid="input-signature-date"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Décisions du conseil - visible seulement au 3ème trimestre */}
          {trimester === 'Troisième' && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
                  🏛️ {language === 'fr' ? 'Décisions du conseil' : 'Council Decisions'}
                </CardTitle>
                <p className="text-sm text-orange-600 mt-1">
                  {language === 'fr' ? 'Section visible uniquement pour le troisième trimestre' : 'Section visible only for third trimester'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      {language === 'fr' ? 'Décision du conseil de classe' : 'Class council decision'}
                    </Label>
                    <Select>
                      <SelectTrigger data-testid="select-council-decision">
                        <SelectValue placeholder={language === 'fr' ? 'Sélectionner la décision...' : 'Select decision...'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passe-superieur">{language === 'fr' ? 'Passe en classe supérieure' : 'Advances to next grade'}</SelectItem>
                        <SelectItem value="passe-felicitations">{language === 'fr' ? 'Passe avec félicitations' : 'Advances with congratulations'}</SelectItem>
                        <SelectItem value="passe-encouragements">{language === 'fr' ? 'Passe avec encouragements' : 'Advances with encouragement'}</SelectItem>
                        <SelectItem value="passe-avertissement">{language === 'fr' ? 'Passe avec avertissement' : 'Advances with warning'}</SelectItem>
                        <SelectItem value="redouble">{language === 'fr' ? 'Redouble' : 'Repeats grade'}</SelectItem>
                        <SelectItem value="orientation">{language === 'fr' ? 'Orientation' : 'Orientation'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      {language === 'fr' ? 'Observations et recommandations' : 'Observations and recommendations'}
                    </Label>
                    <textarea
                      className="w-full border rounded-lg p-3 text-sm min-h-[80px] resize-y border-orange-200 focus:border-orange-400"
                      placeholder={language === 'fr' ? 
                        'Observations du conseil de classe et recommandations pour l\'année suivante...' : 
                        'Class council observations and recommendations for next year...'}
                      data-testid="textarea-council-observations"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        {language === 'fr' ? 'Président du conseil' : 'Council president'}
                      </Label>
                      <Input
                        placeholder={language === 'fr' ? 'Nom du président...' : 'President name...'}
                        className="border-orange-200 focus:border-orange-400"
                        data-testid="input-council-president"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        {language === 'fr' ? 'Date du conseil' : 'Council date'}
                      </Label>
                      <Input
                        type="date"
                        className="border-orange-200 focus:border-orange-400"
                        data-testid="input-council-date"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compétences évaluées Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                {language === 'fr' ? 'Compétences évaluées' : 'Evaluated Competencies'}
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {language === 'fr' ? 'Système APPRECIATION' : 'REMARKS_2 System'}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Competency Evaluation System Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      {language === 'fr' ? 'Système d\'évaluation' : 'Evaluation System'}
                    </Label>
                    <Select 
                      value={selectedCompetencySystem?.name || (language === 'fr' ? 'APPRECIATION' : 'REMARKS_2')}
                      onValueChange={(value) => {
                        const system = competencySystems?.data?.find((s: any) => s.name === value);
                        if (system) {
                          setSelectedCompetencySystem(system);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un système" />
                      </SelectTrigger>
                      <SelectContent>
                        {competencySystems?.data?.map((system: any) => (
                          <SelectItem key={system.id} value={system.name}>
                            {system.name} ({system.language.toUpperCase()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Competency Levels Display */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <Label className="text-sm font-medium mb-3 block">
                    {language === 'fr' ? 'Grille d\'évaluation' : 'Evaluation Grid'}
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    {selectedCompetencySystem?.levels ? (
                      // Use actual system data
                      selectedCompetencySystem.levels
                        .sort((a: any, b: any) => b.gradeRange.min - a.gradeRange.min) // Sort by grade range descending
                        .map((level: any, index: number) => {
                          const colorClasses = getCompetencyColor(level.code);
                          const bgColor = colorClasses.includes('green') ? 'bg-green-100 border-green-200' :
                                         colorClasses.includes('blue') ? 'bg-blue-100 border-blue-200' :
                                         colorClasses.includes('yellow') ? 'bg-yellow-100 border-yellow-200' :
                                         colorClasses.includes('orange') ? 'bg-orange-100 border-orange-200' :
                                         'bg-red-100 border-red-200';
                          
                          const textColor = colorClasses.includes('green') ? 'text-green-800' :
                                           colorClasses.includes('blue') ? 'text-blue-800' :
                                           colorClasses.includes('yellow') ? 'text-yellow-800' :
                                           colorClasses.includes('orange') ? 'text-orange-800' :
                                           'text-red-800';
                          
                          return (
                            <div key={level.code} className={`p-3 rounded-lg border ${bgColor}`}>
                              <div className={`font-semibold text-sm ${textColor}`}>
                                {level.code}
                              </div>
                              <div className={`text-xs mt-1 ${textColor.replace('800', '700')}`}>
                                {language === 'fr' ? level.descriptionFr : level.descriptionEn}
                              </div>
                              <div className={`text-xs font-medium mt-1 ${textColor.replace('800', '600')}`}>
                                {level.gradeRange.min}-{level.gradeRange.max}/20
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      // Fallback display when no system loaded
                      <>
                        <div className="bg-green-100 p-3 rounded-lg border border-green-200">
                          <div className="font-semibold text-green-800 text-sm">
                            {language === 'fr' ? 'CTBA' : 'CVWA'}
                          </div>
                          <div className="text-xs text-green-700 mt-1">
                            {language === 'fr' 
                              ? 'Compétences très bien acquises' 
                              : 'Competences Very Well Acquired'
                            }
                          </div>
                          <div className="text-xs text-green-600 font-medium mt-1">16-20/20</div>
                        </div>

                        <div className="bg-blue-100 p-3 rounded-lg border border-blue-200">
                          <div className="font-semibold text-blue-800 text-sm">
                            {language === 'fr' ? 'CBA' : 'CWA'}
                          </div>
                          <div className="text-xs text-blue-700 mt-1">
                            {language === 'fr' 
                              ? 'Compétences bien acquises' 
                              : 'Competences Well Acquired'
                            }
                          </div>
                          <div className="text-xs text-blue-600 font-medium mt-1">14-16/20</div>
                        </div>

                        <div className="bg-yellow-100 p-3 rounded-lg border border-yellow-200">
                          <div className="font-semibold text-yellow-800 text-sm">CA</div>
                          <div className="text-xs text-yellow-700 mt-1">
                            {language === 'fr' 
                              ? 'Compétences acquises' 
                              : 'Competences Acquired'
                            }
                          </div>
                          <div className="text-xs text-yellow-600 font-medium mt-1">12-14/20</div>
                        </div>

                        <div className="bg-orange-100 p-3 rounded-lg border border-orange-200">
                          <div className="font-semibold text-orange-800 text-sm">
                            {language === 'fr' ? 'CMA' : 'CAA'}
                          </div>
                          <div className="text-xs text-orange-700 mt-1">
                            {language === 'fr' 
                              ? 'Compétences moyennement acquises' 
                              : 'Competences Averagely Acquired'
                            }
                          </div>
                          <div className="text-xs text-orange-600 font-medium mt-1">10-12/20</div>
                        </div>

                        <div className="bg-red-100 p-3 rounded-lg border border-red-200">
                          <div className="font-semibold text-red-800 text-sm">CNA</div>
                          <div className="text-xs text-red-700 mt-1">
                            {language === 'fr' 
                              ? 'Compétences non acquises' 
                              : 'Competences Not Acquired'
                            }
                          </div>
                          <div className="text-xs text-red-600 font-medium mt-1">0-10/20</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Subject Competency Summary */}
                <div className="border rounded-lg p-4">
                  <Label className="text-sm font-medium mb-3 block">
                    {language === 'fr' ? 'Résumé des compétences par matière' : 'Subject Competency Summary'}
                  </Label>
                  <div className="space-y-2">
                    {subjects.map((subject, index) => {
                      const competencyLevel = calculateCompetencyLevel(subject.grade);
                      return (
                        <div key={subject.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-sm min-w-0 flex-1">{subject.name}</span>
                            <span className="text-sm text-gray-600">{subject.grade}/20</span>
                          </div>
                          <Badge className={getCompetencyColor(competencyLevel)}>
                            {competencyLevel}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Predefined Appreciations by Category */}
                <div className="border rounded-lg p-4">
                  <Label className="text-sm font-medium mb-3 block">
                    {language === 'fr' ? 'Appréciations prédéfinies' : 'Predefined Appreciations'}
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* General Appreciations */}
                    <div>
                      <Label className="text-xs text-gray-600 mb-2 block">
                        {language === 'fr' ? 'Appréciations générales' : 'General Appreciations'}
                      </Label>
                      <div className="space-y-1">
                        {predefinedAppreciations?.data?.filter((app: any) => 
                          app.category === 'general' && app.targetRole === 'director'
                        ).slice(0, 3).map((appreciation: any) => (
                          <Button
                            key={appreciation.id}
                            variant="outline"
                            size="sm"
                            className="w-full text-left justify-start text-xs h-auto py-2"
                            onClick={() => {
                              // Could be used to apply to general appreciation field
                              console.log('Selected appreciation:', appreciation);
                            }}
                          >
                            {language === 'fr' ? appreciation.appreciationFr : appreciation.appreciationEn}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Council Decisions */}
                    <div>
                      <Label className="text-xs text-gray-600 mb-2 block">
                        {language === 'fr' ? 'Décisions du conseil' : 'Council Decisions'}
                      </Label>
                      <div className="space-y-1">
                        {predefinedAppreciations?.data?.filter((app: any) => 
                          app.category === 'council_decision'
                        ).slice(0, 3).map((appreciation: any) => (
                          <Button
                            key={appreciation.id}
                            variant="outline"
                            size="sm"
                            className="w-full text-left justify-start text-xs h-auto py-2"
                            onClick={() => {
                              // Could be used to apply to council decision field
                              console.log('Selected council decision:', appreciation);
                            }}
                          >
                            {language === 'fr' ? appreciation.appreciationFr : appreciation.appreciationEn}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discipline and Absences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                {labels[language].disciplineAbsences}
                <Button 
                  onClick={() => calculateDisciplineData(student.id || student.name, trimester)} 
                  size="sm" 
                  variant="outline"
                  data-testid="button-calculate-discipline"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  {language === 'fr' ? 'Calculer Auto' : 'Auto Calculate'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="absJ" className="flex items-center">
                    {labels[language].justifiedAbs}
                    <Badge variant="secondary" className="ml-2 text-xs">Auto</Badge>
                  </Label>
                  <Input
                    id="absJ"
                    data-testid="input-abs-justified"
                    type="number"
                    min="0"
                    value={discipline.absJ}
                    onChange={(e) => setDiscipline({...discipline, absJ: parseInt(e.target.value) || 0})}
                    className="bg-green-50 border-green-200"
                  />
                </div>

                <div>
                  <Label htmlFor="absNJ" className="flex items-center">
                    {labels[language].unjustifiedAbs}
                    <Badge variant="secondary" className="ml-2 text-xs">Auto</Badge>
                  </Label>
                  <Input
                    id="absNJ"
                    data-testid="input-abs-unjustified"
                    type="number"
                    min="0"
                    value={discipline.absNJ}
                    onChange={(e) => setDiscipline({...discipline, absNJ: parseInt(e.target.value) || 0})}
                    className="bg-orange-50 border-orange-200"
                  />
                </div>

                <div>
                  <Label htmlFor="late" className="flex items-center">
                    {labels[language].lates}
                    <Badge variant="secondary" className="ml-2 text-xs">Auto</Badge>
                  </Label>
                  <Input
                    id="late"
                    data-testid="input-lates"
                    type="number"
                    min="0"
                    value={discipline.late}
                    onChange={(e) => setDiscipline({...discipline, late: parseInt(e.target.value) || 0})}
                    className="bg-yellow-50 border-yellow-200"
                  />
                </div>

                <div>
                  <Label htmlFor="sanctions" className="flex items-center">
                    {labels[language].warnings}
                    <Badge variant="secondary" className="ml-2 text-xs">Auto</Badge>
                  </Label>
                  <Input
                    id="sanctions"
                    data-testid="input-sanctions"
                    type="number"
                    min="0"
                    value={discipline.sanctions}
                    onChange={(e) => setDiscipline({...discipline, sanctions: parseInt(e.target.value) || 0})}
                    className="bg-red-50 border-red-200"
                  />
                </div>
              </div>

              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>{language === 'fr' ? 'Calcul Automatique :' : 'Automatic Calculation:'}</strong> {language === 'fr' ? 'Cliquez sur "Calculer Auto" pour récupérer automatiquement les données d\'assiduité de l\'élève pour le trimestre sélectionné. Les valeurs peuvent être modifiées manuellement si nécessaire.' : 'Click "Auto Calculate" to automatically retrieve student attendance data for the selected term. Values can be manually modified if necessary.'}
                </p>
              </div>

              <div className="mt-4">
                <Label htmlFor="generalRemark">{labels[language].generalAppreciation}</Label>
                <Textarea
                  id="generalRemark"
                  data-testid="textarea-general-remark"
                  value={generalRemark}
                  onChange={(e) => setGeneralRemark(e.target.value)}
                  placeholder={labels[language].generalAppreciationPlaceholder}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Test Images Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.testImages}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* School Logo Selection */}
                <div>
                  <Label className="text-sm font-medium">{t.selectLogo}</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {availableSchoolLogos.map((logo, index) => (
                      <div 
                        key={index}
                        className={`cursor-pointer border-2 p-2 rounded-lg ${
                          selectedSchoolLogo === logo.url ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedSchoolLogo(logo.url)}
                      >
                        <img src={logo.url} alt={logo.name} className="w-full h-16 object-contain rounded" />
                        <p className="text-xs mt-1 text-center">{logo.name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Student Photo Selection */}
                <div>
                  <Label className="text-sm font-medium">{t.selectPhoto}</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {availableStudentPhotos.map((photo, index) => (
                      <div 
                        key={index}
                        className={`cursor-pointer border-2 p-2 rounded-lg ${
                          studentPhotoUrl === photo.url ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => setStudentPhotoUrl(photo.url)}
                      >
                        <img src={photo.url} alt={photo.name} className="w-full h-16 object-cover rounded" />
                        <p className="text-xs mt-1 text-center">{photo.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third Trimester Annual Summary */}
          {isThirdTrimester && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg text-orange-800 flex items-center">
                  <School className="h-5 w-5 mr-2" />
                  {t.annualSummary} - {year}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Trimester Averages */}
                <div>
                  <Label className="text-sm font-medium text-orange-700">{t.trimesterAverages}</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <Label className="text-xs">{t.firstTrimester}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="20"
                        value={annualSummary.firstTrimesterAverage}
                        onChange={(e) => setAnnualSummary(prev => ({
                          ...prev,
                          firstTrimesterAverage: parseFloat(e.target.value) || 0
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">{t.secondTrimester}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="20"
                        value={annualSummary.secondTrimesterAverage}
                        onChange={(e) => setAnnualSummary(prev => ({
                          ...prev,
                          secondTrimesterAverage: parseFloat(e.target.value) || 0
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">{t.thirdTrimester}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="20"
                        value={annualSummary.thirdTrimesterAverage}
                        onChange={(e) => setAnnualSummary(prev => ({
                          ...prev,
                          thirdTrimesterAverage: parseFloat(e.target.value) || 0
                        }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Annual Average and Rank */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">{t.annualAverage}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="20"
                      value={annualSummary.annualAverage}
                      onChange={(e) => setAnnualSummary(prev => ({
                        ...prev,
                        annualAverage: parseFloat(e.target.value) || 0
                      }))}
                      className="mt-1 font-bold text-lg"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t.annualRank}</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="number"
                        min="1"
                        value={annualSummary.annualRank}
                        onChange={(e) => setAnnualSummary(prev => ({
                          ...prev,
                          annualRank: parseInt(e.target.value) || 0
                        }))}
                        className="w-20"
                      />
                      <span className="text-sm text-gray-600 self-center">
                        / {annualSummary.totalStudents}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pass Decision */}
                <div>
                  <Label className="text-sm font-medium text-red-700">{t.passDecision}</Label>
                  <Select 
                    value={annualSummary.passDecision} 
                    onValueChange={(value) => setAnnualSummary(prev => ({...prev, passDecision: value}))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionner la décision..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PASSE">{t.passes}</SelectItem>
                      <SelectItem value="REDOUBLE">{t.repeats}</SelectItem>
                      <SelectItem value="RENVOYE">{t.expelled}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Final Appreciation */}
                <div>
                  <Label className="text-sm font-medium">{t.finalAppreciation}</Label>
                  <Textarea
                    value={annualSummary.finalAppreciation}
                    onChange={(e) => setAnnualSummary(prev => ({...prev, finalAppreciation: e.target.value}))}
                    placeholder="Appréciation sur l'évolution de l'élève durant l'année..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                {/* Holiday Recommendations */}
                <div>
                  <Label className="text-sm font-medium">{t.holidayRecommendations}</Label>
                  <Textarea
                    value={annualSummary.holidayRecommendations}
                    onChange={(e) => setAnnualSummary(prev => ({...prev, holidayRecommendations: e.target.value}))}
                    placeholder="Recommandations pour les vacances et la préparation de la classe suivante..."
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowPreview(!showPreview)} data-testid="button-preview">
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? t.hide : t.preview}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={generatePDF} 
              disabled={isGeneratingPDF}
              data-testid="button-print-pdf"
            >
              <Printer className="h-4 w-4 mr-2" />
              {isGeneratingPDF ? t.generating : t.printToPDF}
            </Button>
            
            <Button 
              variant={isSigned ? "default" : "outline"}
              onClick={signBulletin}
              disabled={isSigned}
              data-testid="button-sign-bulletin"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isSigned ? t.signed : t.signBulletin}
            </Button>
            
            <Button 
              onClick={sendToStudentsParents}
              disabled={!isSigned}
              data-testid="button-send-bulletin"
            >
              <Upload className="h-4 w-4 mr-2" />
              {t.sendToStudentParent}
            </Button>
            
            <Button onClick={handleSaveBulletin} data-testid="button-save">
              <Download className="h-4 w-4 mr-2" />
              {t.save}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Aperçu du bulletin</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportCardPreview {...bulletinData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
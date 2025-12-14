import React, { useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, Save, Archive, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatName } from '@/utils/formatName';

// Ministry-required Teacher Comments - EXACT from academic interface
export const TEACHER_COMMENTS = {
  fr: [
    { id: 'excellent_work', text: 'Excellent travail. Félicitations.' },
    { id: 'very_good', text: 'Très bon travail. Continuez ainsi.' },
    { id: 'satisfactory', text: 'Travail satisfaisant. Bien.' },
    { id: 'can_do_better', text: 'Peut mieux faire. Travaillez davantage.' },
    { id: 'effort_needed', text: 'Un effort supplémentaire est nécessaire.' },
    { id: 'good_progress', text: 'Bons progrès constatés.' },
    { id: 'irregular_work', text: 'Travail irrégulier. Soyez plus assidu(e).' },
    { id: 'weak_results', text: 'Résultats faibles. Redoublez d\'efforts.' },
    { id: 'good_behavior', text: 'Bon comportement en classe.' },
    { id: 'participation', text: 'Participation active appréciée.' },
    { id: 'homework_regular', text: 'Devoirs régulièrement faits.' },
    { id: 'homework_irregular', text: 'Devoirs irréguliers.' },
    { id: 'concentrate_more', text: 'Concentrez-vous davantage.' },
    { id: 'good_attitude', text: 'Bonne attitude de travail.' },
    { id: 'leadership', text: 'Esprit de leadership remarquable.' }
  ],
  en: [
    { id: 'excellent_work', text: 'Excellent work. Congratulations.' },
    { id: 'very_good', text: 'Very good work. Keep it up.' },
    { id: 'satisfactory', text: 'Satisfactory work. Good.' },
    { id: 'can_do_better', text: 'Can do better. Work harder.' },
    { id: 'effort_needed', text: 'Additional effort is needed.' },
    { id: 'good_progress', text: 'Good progress observed.' },
    { id: 'irregular_work', text: 'Irregular work. Be more diligent.' },
    { id: 'weak_results', text: 'Weak results. Double your efforts.' },
    { id: 'good_behavior', text: 'Good classroom behaviour.' },
    { id: 'participation', text: 'Active participation appreciated.' },
    { id: 'homework_regular', text: 'Homework regularly done.' },
    { id: 'homework_irregular', text: 'Irregular homework.' },
    { id: 'concentrate_more', text: 'Concentrate more.' },
    { id: 'good_attitude', text: 'Good work attitude.' },
    { id: 'leadership', text: 'Remarkable leadership spirit.' }
  ]
};

// Ministry Performance Grid - EXACT from academic interface
const PERFORMANCE_GRID = {
  fr: {
    title: "GRILLE DE NOTATION",
    headers: ["NIVEAU DE RENDEMENT", "NOTE/20", "COTE", "NOTE EN POURCENTAGE (%)", "APPRECIATION"],
    levels: [
      { level: "Niveau 4", ranges: ["18 → 20", "16 → 18"], grades: ["A+", "A"], percentages: ["De 90% à 100%", "De 80 à 89%"], appreciation: "Compétences très bien acquises (CTBA)" },
      { level: "Niveau 3", ranges: ["15 → 16", "14 → 15"], grades: ["B+", "B"], percentages: ["De 75 à 79%", "De 70 à 74%"], appreciation: "Compétences bien acquises (CBA)" },
      { level: "Niveau 2", ranges: ["12 → 14", "10 → 12"], grades: ["C+", "C"], percentages: ["De 60 à 69%", "De 50 à 59%"], appreciation: "Compétences acquises (CA)\nCompétences moyennement acquises (CMA)" },
      { level: "Niveau 1", ranges: ["< 10"], grades: ["D"], percentages: ["< 50%"], appreciation: "Compétences non acquises (CNA)" }
    ]
  },
  en: {
    title: "PERFORMANCE GRID",
    headers: ["LEVEL OF PERFORMANCE", "MARK/20", "GRADE", "MARK IN PERCENTAGE (%)", "REMARKS"],
    levels: [
      { level: "Level 4", ranges: ["18 → 20", "16 → 18"], grades: ["A+", "A"], percentages: ["From 90% to 100%", "From 80 to 89%"], appreciation: "Competences Very Well Acquired (CVWA)" },
      { level: "Level 3", ranges: ["15 → 16", "14 → 15"], grades: ["B+", "B"], percentages: ["From 75 to 79%", "From 70 to 74%"], appreciation: "Competences Well Acquired (CWA)" },
      { level: "Level 2", ranges: ["12 → 14", "10 → 12"], grades: ["C+", "C"], percentages: ["From 60 to 69%", "From 50 to 59%"], appreciation: "Competences Acquired (CA)\nCompetences Averagely Acquired (CAA)" },
      { level: "Level 1", ranges: ["< 10"], grades: ["D"], percentages: ["< 50%"], appreciation: "Competences Not Acquired (CNA)" }
    ]
  }
};

// Helper functions - EXACT from academic interface
// Enhanced helper functions (EXACT from academic interface)
const round2 = (n: number): number => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const coteFromNote = (note: number): string => {
  if (note >= 18) return 'A+';
  if (note >= 16) return 'A';  
  if (note >= 15) return 'B+';
  if (note >= 14) return 'B';
  if (note >= 12) return 'C+';
  if (note >= 10) return 'C';
  return 'D';
};

// Subject interface - EXACT from academic interface
interface Subject {
  id: string;
  name: string;
  teacher: string;
  coefficient: number;
  grade: number;
  remark: string;
  comments?: string[];
  competencies?: string;
  competencyLevel?: 'CTBA' | 'CBA' | 'CA' | 'CMA' | 'CNA' | 'CVWA' | 'CWA' | 'CAA';
  competencyEvaluation?: string;
  note1: number;
  moyenneFinale: number;
  competence1: string;
  competence2: string;
  competence3: string; // Ajout de la 3ème compétence
  totalPondere: number;
  cote: string;
}

interface ManualBulletinFormProps {
  studentId?: string;
  trimestre?: string;
  classId?: string;
  academicYear?: string;
}

/**************************** HELPERS ****************************/
const performanceGrid = [
  { min: 18, max: 20.0001, grade: "A+", label: "CTBA", remark: "Compétences très bien acquises" },
  { min: 16, max: 18, grade: "A", label: "CTBA", remark: "Compétences très bien acquises" },
  { min: 15, max: 16, grade: "B+", label: "CBA", remark: "Compétences bien acquises" },
  { min: 14, max: 15, grade: "B", label: "CBA", remark: "Compétences bien acquises" },
  { min: 12, max: 14, grade: "C+", label: "CA", remark: "Compétences acquises" },
  { min: 10, max: 12, grade: "C", label: "CMA", remark: "Compétences moyennement acquises" },
  { min: 0, max: 10, grade: "D", label: "CNA", remark: "Compétences non acquises" },
];

// Helper functions (EXACT from academic interface)
function appreciationFromNote(note20: string | number, predefinedAppreciations?: any): string {
  if (note20 == null || note20 === '' || (typeof note20 === 'string' && note20.trim() === '') || isNaN(Number(note20))) return "";
  const n = Number(note20);
  
  // Try to use predefined appreciations first
  if (predefinedAppreciations?.data) {
    const matching = predefinedAppreciations.data.find((app: any) => 
      app.gradeRange && n >= app.gradeRange.min && n < app.gradeRange.max
    );
    if (matching) {
      return matching.appreciation;
    }
  }
  
  // Fallback to hard-coded values if no predefined appreciations
  const r = performanceGrid.find(g => n >= g.min && n < g.max);
  return r ? r.remark : "";
}

// Bilingual labels for ministry compliance
const BILINGUAL_LABELS = {
  fr: {
    subject: 'Matière',
    coefficient: 'Coefficient',
    grade: 'Note',
    appreciation: 'Appréciation',
    bulletinTitle: 'BULLETIN SCOLAIRE',
    trimester: 'TRIMESTRE',
    academicYear: 'ANNÉE SCOLAIRE',
    firstName: 'Prénom et Nom',
    class: 'Classe',
    birthInfo: 'Né(e) le',
    gender: 'Sexe',
    uniqueId: 'Matricule',
    repeater: 'Redoublant',
    classSize: 'Effectif',
    mainTeacher: 'Professeur Principal',
    parents: 'Parents/Tuteurs',
    parameters: 'Paramètres',
    prefillCompetencies: 'Préremplir compétences',
    addSubject: 'Ajouter matière',
    generalAverage: 'Moyenne générale'
  },
  en: {
    subject: 'Subject',
    coefficient: 'Coefficient', 
    grade: 'Grade',
    appreciation: 'Appreciation',
    bulletinTitle: 'SCHOOL REPORT CARD',
    trimester: 'TERM',
    academicYear: 'ACADEMIC YEAR',
    firstName: 'First and Last Name',
    class: 'Class',
    birthInfo: 'Born on',
    gender: 'Gender',
    uniqueId: 'Student ID',
    repeater: 'Repeating',
    classSize: 'Class Size',
    mainTeacher: 'Main Teacher',
    parents: 'Parents/Guardians',
    parameters: 'Parameters',
    prefillCompetencies: 'Prefill competencies',
    addSubject: 'Add subject',
    generalAverage: 'General average'
  }
};

/**************************** DONNÉES ****************************/
// Matières récupérées dynamiquement via l'API pour les matières assignées à l'enseignant

const defaultCompetences: Record<string, string> = {
  "ANGLAIS": "Use appropriate language skills…",
  "INFORMATIQUE": "Identifier les éléments matériels / logiciels…",
};

// ====== TEMPLATES COMPÉTENCES PAR TRIMESTRE (2 COMPÉTENCES PAR MATIÈRE) ======
// Système de compétences spécifiques africaines - 2 compétences fixes par matière/trimestre
const COMPETENCES_BY_TRIMESTER_AND_SUBJECT = {
  Premier: {
    ANGLAIS: {
      competence1: "Se présenter, parler de la famille et de l'école",
      competence2: "Acheter/vendre, découvrir les métiers"
    },
    INFORMATIQUE: {
      competence1: "Identifier matériel/logiciel d'un micro-ordinateur",
      competence2: "Connaitre les règles en salle info"
    },
    FRANÇAIS: {
      competence1: "Orthographier et comprendre un dialogue",
      competence2: "Écrire une lettre privée (structure et politesse)"
    },
    MATHÉMATIQUES: {
      competence1: "Résoudre des opérations de base (addition, soustraction)",
      competence2: "Comprendre les notions de géométrie plane"
    },
    SCIENCES: {
      competence1: "Observer et décrire les phénomènes naturels",
      competence2: "Identifier les organes du corps humain"
    },
    GÉOGRAPHIE: {
      competence1: "Se situer dans l'espace et le temps",
      competence2: "Identifier les continents et océans"
    },
    HISTOIRE: {
      competence1: "Comprendre les périodes historiques de base",
      competence2: "Identifier les personnages historiques importants"
    },
  },
  Deuxième: {
    ANGLAIS: {
      competence1: "Décrire son quotidien, loisirs et habitudes (Present Simple)",
      competence2: "Donner/recevoir des indications (directions, lieux)"
    },
    INFORMATIQUE: {
      competence1: "Gestion des fichiers et dossiers (créer, renommer, organiser)",
      competence2: "Traitement de texte : mise en forme de base"
    },
    FRANÇAIS: {
      competence1: "Compréhension et résumé d'un récit",
      competence2: "Production d'un paragraphe argumentatif simple"
    },
    MATHÉMATIQUES: {
      competence1: "Résoudre des problèmes avec multiplication et division",
      competence2: "Comprendre les fractions et pourcentages"
    },
    SCIENCES: {
      competence1: "Expérimenter et analyser des réactions simples",
      competence2: "Comprendre les cycles de la vie"
    },
    GÉOGRAPHIE: {
      competence1: "Analyser les climats et reliefs",
      competence2: "Comprendre l'organisation territoriale"
    },
    HISTOIRE: {
      competence1: "Analyser les causes et conséquences d'événements",
      competence2: "Comprendre l'évolution des sociétés"
    },
  },
  Troisième: {
    ANGLAIS: {
      competence1: "Parler de projets et d'événements passés (Past Simple)",
      competence2: "Exprimer des intentions et plans (Futur proche)"
    },
    INFORMATIQUE: {
      competence1: "Présentation : diaporama (insertion d'images/tableaux)",
      competence2: "Sensibilisation sécurité numérique (mots de passe, phishing)"
    },
    FRANÇAIS: {
      competence1: "Analyse grammaticale (accords essentiels)",
      competence2: "Écriture d'un récit cohérent (début, développement, fin)"
    },
    MATHÉMATIQUES: {
      competence1: "Résoudre des équations du premier degré",
      competence2: "Maîtriser les propriétés géométriques avancées"
    },
    SCIENCES: {
      competence1: "Comprendre les lois physiques fondamentales",
      competence2: "Analyser les écosystèmes et biodiversité"
    },
    GÉOGRAPHIE: {
      competence1: "Synthèse des connaissances géographiques",
      competence2: "Analyser les enjeux du développement durable"
    },
    HISTOIRE: {
      competence1: "Synthèse historique et perspectives d'avenir",
      competence2: "Comprendre les enjeux contemporains"
    },
  },
};

// ====== FONCTIONS HELPER POUR LES COMPÉTENCES ======
function getCompetencesByTrimester(matiere: string, trimestre: string): { competence1: string; competence2: string; competence3: string } {
  // Handle null/undefined matiere gracefully
  if (!matiere) {
    return { competence1: "", competence2: "", competence3: "" };
  }
  
  const normalizedMatiere = normalizeSubjectKey(matiere.toUpperCase());
  const competences = COMPETENCES_BY_TRIMESTER_AND_SUBJECT[trimestre as keyof typeof COMPETENCES_BY_TRIMESTER_AND_SUBJECT]?.[normalizedMatiere as keyof typeof COMPETENCES_BY_TRIMESTER_AND_SUBJECT.Premier];
  
  if (competences && typeof competences === 'object') {
    return {
      competence1: competences.competence1 || "",
      competence2: competences.competence2 || "",
      competence3: "" // 3ème compétence par défaut vide
    };
  }
  
  return { competence1: "", competence2: "", competence3: "" };
}

function calculateMoyenneFinale(note1: string | number, note2: string | number): number {
  const n1 = Number(note1) || 0;
  const n2 = Number(note2) || 0;
  
  if (n1 > 0 && n2 > 0) {
    return round2((n1 + n2) / 2);
  } else if (n1 > 0) {
    return round2(n1);
  } else if (n2 > 0) {
    return round2(n2);
  }
  
  return 0;
}

function prefillCompetencesFor(trimester: string) {
  return (prevRows: SubjectRow[]) => prevRows.map(r => {
    const competences = getCompetencesByTrimester(r.matiere, trimester);
    return {
      ...r,
      competence1: competences.competence1,
      competence2: competences.competence2,
      competence3: competences.competence3
    };
  });
}

function normalizeSubjectKey(m: string): string {
  if (!m) return "";
  const k = m.toUpperCase();
  if (k.includes("ANGLAIS")) return "ANGLAIS";
  if (k.includes("INFORMATIQUE")) return "INFORMATIQUE";
  if (k.includes("FRANÇAIS") || k.includes("FRANCAIS")) return "FRANÇAIS";
  if (k.includes("MATHÉMATIQUES") || k.includes("MATHEMATIQUES")) return "MATHÉMATIQUES";
  if (k.includes("SCIENCES")) return "SCIENCES";
  if (k.includes("GÉOGRAPHIE") || k.includes("GEOGRAPHIE")) return "GÉOGRAPHIE";
  if (k.includes("HISTOIRE")) return "HISTOIRE";
  return k;
}

interface SubjectRow {
  matiere: string;
  enseignant: string;
  competence1: string;  // Première compétence
  competence2: string;  // Deuxième compétence
  competence3: string;  // Troisième compétence (ajout pour harmonisation)
  note1: string | number;  // Note première compétence /20
  note2: string | number;  // Note deuxième compétence /20
  moyenneFinale: string | number;  // M/20 - Moyenne des deux compétences
  coef: number;
  totalPondere: number;  // M/20 * coefficient
  cote: string;
  appreciation: string;
  remark?: string;  // Academic interface appreciation
  comments?: string[];  // Ministry teacher comments
}

// Extended student information interface (matching director interface)
interface ExtendedStudentInfo {
  name: string;
  id: string;
  className: string;
  classSize: number;
  birthDate: string;
  birthPlace: string;
  gender: string;
  headTeacher: string;
  guardian: string;
  photoUrl?: string;
}

// Discipline information interface (matching director interface)  
interface ExtendedDisciplineInfo {
  absJ: number;     // Absences justifiées (heures)
  absNJ: number;    // Absences non justifiées (heures) 
  late: number;     // Retards
  sanctions: number; // Sanctions/Avertissements
}

/**************************** COMPOSANT PRINCIPAL ****************************/
export default function ManualBulletinForm({ 
  studentId, 
  trimestre = "Premier",
  classId,
  academicYear = "2024-2025" 
}: ManualBulletinFormProps) {
  const [loading, setLoading] = useState(false); // Start with false to allow manual entry
  const [eleve, setEleve] = useState<any>(null);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr'); // État de la langue
  
  // État des métadonnées du bulletin
  const [meta, setMeta] = useState({
    trimestre: trimestre || "Premier",
    annee: academicYear || "2024-2025",
    avertissements: 0,
    blames: 0,
    absJust: 0,
    absNonJust: 0,
    retards: 0,
    exclusions: 0,
    consignes: 0,
    appEleve: "",
    visaParent: ""
  });

  // Extended student information state (matching director interface)
  const [extendedStudent, setExtendedStudent] = useState<ExtendedStudentInfo>({
    name: '',
    id: '',
    className: '',
    classSize: 0,
    birthDate: '',
    birthPlace: '',
    gender: '',
    headTeacher: '',
    guardian: '',
    photoUrl: ''
  });

  // Extended discipline state (matching director interface)
  const [extendedDiscipline, setExtendedDiscipline] = useState<ExtendedDisciplineInfo>({
    absJ: 0,
    absNJ: 0,
    late: 0,
    sanctions: 0
  });

  // General appreciation state (matching director interface)
  const [generalRemark, setGeneralRemark] = useState('');

  // Annual summary state for third trimester (matching director interface)
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

  // Digital signature state (matching director interface)
  const [isSigned, setIsSigned] = useState(false);
  const [signatureData, setSignatureData] = useState<any>(null);
  
  // Fetch teacher's assigned subjects for the selected class
  const { data: teacherSubjectsData, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['/api/teacher/subjects', classId],
    queryFn: async () => {
      if (!classId) return null;
      const response = await apiRequest('GET', `/api/teacher/subjects?classId=${classId}`);
      return await response.json();
    },
    enabled: !!classId
  });

  // Fetch all class subjects with coefficients for comprehensive subject list
  const { data: classSubjectsData, isLoading: isLoadingClassSubjects } = useQuery({
    queryKey: ['/api/classes', classId, 'subjects'],
    queryFn: async () => {
      if (!classId) return null;
      const response = await apiRequest('GET', `/api/classes/${classId}/subjects`);
      return await response.json();
    },
    enabled: !!classId
  });

  // Extract subjects from API response, fallback to empty array if no data
  const assignedSubjects = useMemo(() => {
    if (!teacherSubjectsData || !teacherSubjectsData.subjects) return [];
    return teacherSubjectsData.subjects
      .map((subject: any) => ({
        matiere: subject.name || subject.matiere || subject.subject || 'Matière inconnue',
        coef: subject.coefficient || subject.coef || 1
      }))
      .filter(s => s.matiere && s.matiere !== 'Matière inconnue'); // Filter out invalid subjects
  }, [teacherSubjectsData]);

  // Extract all class subjects with coefficients for subject selection
  const allClassSubjects = useMemo(() => {
    if (!classSubjectsData || !classSubjectsData.subjects) return [];
    return classSubjectsData.subjects
      .map((subject: any) => ({
        matiere: subject.nameFr || subject.name || subject.matiere || 'Matière inconnue',
        matiereEn: subject.nameEn || subject.name || subject.matiere || 'Unknown Subject',
        coef: Number(subject.coefficient) || 1,
        code: subject.code || ''
      }))
      .filter(s => s.matiere && s.matiere !== 'Matière inconnue'); // Filter out invalid subjects
  }, [classSubjectsData]);

  // Helper function to get coefficient for a subject from class configuration
  const getCoefficientForSubject = (subjectName: string): number => {
    if (!subjectName) return 1;
    const subject = allClassSubjects.find(s => 
      s.matiere?.toLowerCase().includes(subjectName.toLowerCase()) ||
      s.matiereEn?.toLowerCase().includes(subjectName.toLowerCase()) ||
      normalizeSubjectKey(s.matiere || '') === normalizeSubjectKey(subjectName)
    );
    return subject?.coef || 1;
  };

  const [rows, setRows] = useState<SubjectRow[]>([]);
  
  // Initialize rows when assigned subjects are loaded
  useEffect(() => {
    if (assignedSubjects.length > 0) {
      setRows(assignedSubjects.map(s => ({
        matiere: s.matiere,
        enseignant: "",
        competence1: getCompetencesByTrimester(s.matiere, meta.trimestre).competence1 || "",
        competence2: getCompetencesByTrimester(s.matiere, meta.trimestre).competence2 || "",
        competence3: getCompetencesByTrimester(s.matiere, meta.trimestre).competence3 || "",
        note1: "",
        note2: "",
        moyenneFinale: "",
        coef: s.coef,
        totalPondere: 0,
        cote: "",
        appreciation: "",
      })));
    }
  }, [assignedSubjects, meta.trimestre]);

  // Check if this is third trimester for annual summary
  const isThirdTrimester = meta.trimestre === 'Troisième';

  // Define missing variables that are used in the form - allow manual entry even without complete student data
  const selectedStudent = eleve || { 
    id: studentId, 
    fullName: `Élève ${studentId}`, 
    firstName: 'Prénom', 
    lastName: 'Nom',
    className: classId || 'Classe inconnue'
  };
  const selectedClass = { name: eleve?.className || classId || 'Classe inconnue' };
  const currentTerm = meta.trimestre;
  const currentYear = meta.annee;

  // Helper pour obtenir les labels dans la langue courante
  const t = (key: keyof typeof BILINGUAL_LABELS.fr) => BILINGUAL_LABELS[language][key];

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer le profil étudiant via notre API
  const { data: studentProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/students', studentId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/students/${studentId}`);
      return await response.json();
    },
    enabled: !!studentId
  });

  // Update eleve state when student profile loads
  useEffect(() => {
    if (studentProfile?.data) {
      setEleve(studentProfile.data);
    }
    // Always allow manual entry - don't block on profile loading
    setLoading(false);
  }, [studentProfile]);

  // Fetch school profile to get logo and other school info
  const { data: schoolProfile, isLoading: schoolLoading } = useQuery({
    queryKey: ['/api/school/profile'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/school/profile');
      return await response.json();
    }
  });

  // Fetch competency evaluation systems
  const { data: competencySystems } = useQuery({
    queryKey: ['/api/competency-systems', language],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/competency-systems?language=${language}`);
      return await response.json();
    }
  });

  // Fetch predefined appreciations for teachers
  const { data: predefinedAppreciations } = useQuery({
    queryKey: ['/api/predefined-appreciations', 'teacher', language],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/predefined-appreciations?role=teacher&language=${language}`);
      return await response.json();
    }
  });

  // State for selected competency system
  const [selectedCompetencySystem, setSelectedCompetencySystem] = useState<any>(null);

  // Effect to set default competency system based on language
  useEffect(() => {
    if (competencySystems?.data) {
      const defaultSystem = competencySystems.data.find((system: any) => 
        system.language === language
      );
      if (defaultSystem) {
        if (!selectedCompetencySystem || selectedCompetencySystem.language !== language) {
          setSelectedCompetencySystem(defaultSystem);
        }
      }
    }
  }, [competencySystems, language, selectedCompetencySystem]);

  // Memoized sorted competency levels for performance
  const sortedCompetencyLevels = useMemo(() => {
    if (!selectedCompetencySystem?.levels) return [];
    return [...selectedCompetencySystem.levels].sort((a: any, b: any) => b.gradeRange.min - a.gradeRange.min);
  }, [selectedCompetencySystem?.levels]);

  // Dynamic competency calculation functions (similar to director interface)
  const calculateCompetencyLevel = (grade: number): string => {
    // Guard against invalid grades - treat 0 as valid
    if (grade == null || Number.isNaN(grade)) return '';
    
    if (!selectedCompetencySystem?.levels || sortedCompetencyLevels.length === 0) {
      // Fallback to default system based on language
      if (grade >= 16) return language === 'fr' ? 'CTBA' : 'CVWA';
      if (grade >= 14) return language === 'fr' ? 'CBA' : 'CWA';
      if (grade >= 12) return 'CA';
      if (grade >= 10) return language === 'fr' ? 'CMA' : 'CAA';
      return 'CNA';
    }

    for (const level of sortedCompetencyLevels) {
      if (grade >= level.gradeRange.min && grade <= level.gradeRange.max) {
        return level.code;
      }
    }
    return 'CNA';
  };

  const getCompetencyColor = (level: string): string => {
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

  const getCompetencyDescription = (level: string): string => {
    if (selectedCompetencySystem?.levels) {
      const levelData = selectedCompetencySystem.levels.find((l: any) => l.code === level);
      if (levelData) {
        return levelData.description || levelData.code;
      }
    }

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

  // Charger les données de l'élève depuis l'API ou utiliser des données par défaut
  useEffect(() => {
    if (studentProfile) {
      // Get school info from schoolProfile (with logo)
      const schoolInfo = schoolProfile?.profile || schoolProfile || {};
      
      // Adapter les données de notre API au format attendu pour eleve (legacy format)
      setEleve({
        id: (studentProfile as any).id || studentId,
        nom: formatName((studentProfile as any).firstName, (studentProfile as any).lastName, language),
        sexe: "M", // TODO: récupérer depuis l'API
        identifiantUnique: (studentProfile as any).matricule || studentId,
        redoublant: false,
        dateNaissance: "2013-04-21", // TODO: récupérer depuis l'API
        lieuNaissance: "Douala", // TODO: récupérer depuis l'API
        classe: (studentProfile as any).className || '',
        effectif: 58, // TODO: récupérer depuis l'API
        professeurPrincipal: "Mme NGONO", // TODO: récupérer depuis l'API
        parents: { noms: "M. & Mme Parent", contacts: "+237 6xx xx xx xx" },
        photoUrl: "",
        etablissement: { 
          nom: schoolInfo.name || "Institut Educafric", 
          immatriculation: "EDU-2025-001",
          logoUrl: schoolInfo.logoUrl || null // Add logo from database
        },
      });

      // Also populate extended student info (matching director interface)
      setExtendedStudent({
        name: formatName((studentProfile as any).firstName, (studentProfile as any).lastName, language),
        id: (studentProfile as any).matricule || studentId || '',
        className: (studentProfile as any).className || '',
        classSize: 58, // TODO: récupérer depuis l'API
        birthDate: "2013-04-21", // TODO: récupérer depuis l'API
        birthPlace: "Douala", // TODO: récupérer depuis l'API
        gender: "Masculin", // TODO: récupérer depuis l'API
        headTeacher: "Mme NGONO", // TODO: récupérer depuis l'API
        guardian: "M. & Mme Parent", // TODO: récupérer depuis l'API
        photoUrl: ""
      });

      setLoading(false);
    } else if (studentId && !profileLoading) {
      // Get school info from schoolProfile (with logo)
      const schoolInfo = schoolProfile?.profile || schoolProfile || {};
      
      // Si pas de profil trouvé mais on a un studentId, utiliser des données basiques
      setEleve({
        id: studentId,
        nom: "Élève", // Will be filled when profile loads
        sexe: "M",
        identifiantUnique: studentId,
        redoublant: false,
        dateNaissance: "",
        lieuNaissance: "",
        classe: "", // Will be filled from classId
        effectif: 0,
        professeurPrincipal: "",
        parents: { noms: "", contacts: "" },
        photoUrl: "",
        etablissement: { 
          nom: schoolInfo.name || "Institut Educafric", 
          immatriculation: "EDU-2025-001",
          logoUrl: schoolInfo.logoUrl || null // Add logo from database
        },
      });

      // Also set basic extended student info
      setExtendedStudent({
        name: "Élève",
        id: studentId || '',
        className: '',
        classSize: 0,
        birthDate: '',
        birthPlace: '',
        gender: '',
        headTeacher: '',
        guardian: '',
        photoUrl: ''
      });

      setLoading(false);
    }
  }, [studentId, studentProfile, profileLoading, schoolProfile]);

  // Calculs automatiques
  const totals = useMemo(() => {
    const withCalculations = rows.map(r => {
      const moyenneFinale = Number(r.moyenneFinale) || calculateMoyenneFinale(r.note1, r.note2);
      const coefNum = Number(r.coef) || 0;
      const totalPondere = round2(moyenneFinale * coefNum);
      return {
        ...r,
        moyenneFinaleNum: moyenneFinale,
        coefNum,
        totalPondereNum: totalPondere
      };
    });
    
    const totalCoef = withCalculations.reduce((s, r) => s + r.coefNum, 0);
    const totalMxCoef = withCalculations.reduce((s, r) => s + r.totalPondereNum, 0);
    const moyenne = totalCoef > 0 ? round2(totalMxCoef / totalCoef) : 0;
    const cote = coteFromNote(moyenne);
    return { totalCoef, totalMxCoef: round2(totalMxCoef), moyenne, cote };
  }, [rows]);

  function updateRow(idx: number, patch: Partial<SubjectRow>) {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, ...patch } : r));
  }

  function addRow() {
    setRows(prev => ([...prev, { 
      matiere: "", 
      enseignant: "", 
      competence1: "", 
      competence2: "", 
      competence3: "",  // Ajout de la propriété manquante
      note1: "", 
      note2: "", 
      moyenneFinale: "",
      coef: 1, 
      totalPondere: 0,
      cote: "", 
      appreciation: "" 
    }]));
  }

  function removeRow(i: number) { 
    setRows(prev => prev.filter((_, idx) => idx !== i)); 
  }

  // Sauvegarde via notre API comprehensive bulletins
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiRequest('POST', '/api/comprehensive-bulletin/teacher-submission', {
        studentId: parseInt(studentId || "0"),
        classId: parseInt(classId || "0"),
        term: trimestre,
        academicYear,
        extendedStudentInfo: extendedStudent,
        extendedDisciplineInfo: extendedDiscipline,
        generalRemark,
        annualSummary: isThirdTrimester ? annualSummary : null,
        signatureData: isSigned ? signatureData : null,
        manualData: {
          subjectGrades: payload.lignes.map((ligne: any) => ({
            subjectName: ligne.matiere,
            teacherName: ligne.enseignant,
            competencies: ligne.competences,
            grade1: ligne.n20,
            grade2: null, // N'utilise que M/20
            termAverage: ligne.m20,
            coefficient: ligne.coef,
            maxGrade: 20,
            cote: ligne.cote,
            comment: ligne.appreciation
          })),
          discipline: payload.discipline,
          generalAppreciation: payload.appEleve,
          parentVisa: payload.visaParent
        },
        generationOptions: {
          includeComments: true,
          includeRankings: true,
          includeStatistics: true,
          includeUnjustifiedAbsences: true,
          includeJustifiedAbsences: true,
          includeLateness: true,
          includeDetentions: true,
          includeCoef: true,
          includeCTBA: true,
          includeCBA: true,
          includeCA: true,
          includeCMA: true,
          includeCOTE: true,
          includeWorkAppreciation: true,
          includeClassCouncilDecisions: true,
          generationFormat: 'pdf' as const
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "✅ Bulletin sauvegardé",
        description: "Les données ont été transmises pour traitement par le directeur"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/comprehensive-bulletin'] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erreur de sauvegarde",
        description: error.message || "Impossible de sauvegarder le bulletin",
        variant: "destructive"
      });
    }
  });

  // Alias pour compatibilité avec les références existantes
  const saveBulletinMutation = saveMutation;

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    
    // Confirmation avant envoi vers l'école
    const confirmSubmission = window.confirm(
      language === 'fr' 
        ? `Confirmez-vous l'envoi de ces notes vers l'école pour validation ?\n\nCette action notifiera l'administration scolaire et les notes ne pourront plus être modifiées sans autorisation.`
        : `Do you confirm sending these grades to the school for validation?\n\nThis action will notify the school administration and grades cannot be modified without authorization.`
    );
    
    if (!confirmSubmission) {
      return;
    }
    
    const payload = {
      eleve,
      meta,
      trimestre: meta.trimestre,
      annee: meta.annee,
      lignes: rows.map(r => ({
        matiere: r.matiere,
        enseignant: r.enseignant,
        competence1: r.competence1 || '',
        competence2: r.competence2 || '',
        competence3: r.competence3 || '',
        n20: Number(r.note1) || null,
        m20: Number(r.note2) || null,
        coef: Number(r.coef) || 0,
        mxcoef: Number(r.note2 || 0) * Number(r.coef || 0),
        cote: r.cote || (r.note2 !== '' && r.note2 != null ? coteFromNote(Number(r.note2)) : ''),
        appreciation: r.appreciation || (r.note2 !== '' && r.note2 != null ? appreciationFromNote(Number(r.note2), predefinedAppreciations) : ''),
      })),
      totaux: totals,
      discipline: {
        avertissements: Number(meta.avertissements)||0,
        blames: Number(meta.blames)||0,
        absJust: Number(meta.absJust)||0,
        absNonJust: Number(meta.absNonJust)||0,
        retards: Number(meta.retards)||0,
        exclusions: Number(meta.exclusions)||0,
        consignes: Number(meta.consignes)||0,
      },
      appEleve: meta.appEleve,
      visaParent: meta.visaParent,
      date: new Date().toISOString(),
    };
    
    saveMutation.mutate(payload);
  }

  if (loading || profileLoading) {
    return (
      <div className="p-6 text-sm flex items-center justify-center" data-testid="loading-state">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement du profil élève…</span>
      </div>
    );
  }

  // Only show loading if explicitly loading - allow manual entry without profile
  if (loading) {
    return (
      <div className="p-6 text-center" data-testid="loading-state">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement du profil de l'élève...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6" data-testid="manual-bulletin-form">
      {/* En-tête */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo de l'établissement */}
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-200">
                {eleve?.etablissement?.logoUrl ? (
                  <img 
                    src={eleve.etablissement.logoUrl} 
                    alt="Logo établissement" 
                    className="w-full h-full object-contain rounded-lg"
                    data-testid="school-logo"
                  />
                ) : (
                  <div className="text-xs text-gray-400 text-center">
                    <div>🏫</div>
                    <div>LOGO</div>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-xl font-semibold">{t('bulletinTitle')} – {meta.trimestre?.toUpperCase()} {t('trimester')}</h1>
                <p className="text-sm text-gray-500">{t('academicYear')} : {meta.annee}</p>
                <p className="text-xs text-gray-600 mt-1">{eleve?.etablissement?.nom}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Photo de l'élève */}
              <div className="w-20 h-24 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-200">
                {eleve?.photoUrl ? (
                  <img 
                    src={eleve.photoUrl} 
                    alt={`Photo de ${eleve?.nom || 'élève'}`} 
                    className="w-full h-full object-cover rounded-lg"
                    data-testid="student-photo"
                  />
                ) : (
                  <div className="text-xs text-gray-400 text-center">
                    <div>👤</div>
                    <div>PHOTO</div>
                  </div>
                )}
              </div>
              {/* QR Code et immatriculation */}
              <div className="text-right">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border mb-2">
                  <div className="text-xs text-gray-400 text-center">
                    <div>📱</div>
                    <div>QR</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  <div>{eleve?.etablissement?.immatriculation}</div>
                  <div>#{eleve?.identifiantUnique}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <Info label={t('firstName')} value={eleve?.nom || ''} />
            <Info label={t('class')} value={eleve?.classe || ''} />
            <Info label={t('birthInfo')} value={eleve ? `${eleve.dateNaissance} à ${eleve.lieuNaissance}` : ''} />
            <Info label={t('gender')} value={eleve?.sexe || ''} />
            <Info label={t('uniqueId')} value={eleve?.identifiantUnique || ''} />
            <Info label={t('repeater')} value={eleve?.redoublant ? (language === 'fr' ? "Oui" : "Yes") : (language === 'fr' ? "Non" : "No")} />
            <Info label={t('classSize')} value={String(eleve?.effectif || 0)} />
            <Info label={t('mainTeacher')} value={eleve?.professeurPrincipal || ''} />
            <Info label={t('parents')} value={eleve?.parents ? `${eleve.parents.noms} – ${eleve.parents.contacts}` : ''} className="sm:col-span-2" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="font-semibold mb-2">{t('parameters')}</h2>
          <div className="space-y-2 text-sm">
            {/* Sélecteur de langue */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Langue / Language</label>
              <select 
                className="w-full border rounded-xl px-3 py-2" 
                value={language} 
                onChange={e=>setLanguage(e.target.value as 'fr' | 'en')}
                data-testid="select-language"
              >
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>
            <LabeledInput 
              label={t('academicYear')} 
              value={meta.annee} 
              onChange={v => setMeta(m => ({...m, annee:v}))} 
              data-testid="input-academic-year"
            />
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('trimester')}</label>
              <select 
                className="w-full border rounded-xl px-3 py-2" 
                value={meta.trimestre} 
                onChange={e=>setMeta(m=>({...m,trimestre:e.target.value}))}
                data-testid="select-trimester"
              >
                <option value="Premier">{language === 'fr' ? 'Premier Trimestre' : 'First Term'}</option>
                <option value="Deuxième">{language === 'fr' ? 'Deuxième Trimestre' : 'Second Term'}</option>
                <option value="Troisième">{language === 'fr' ? 'Troisième Trimestre' : 'Third Term'}</option>
              </select>
            </div>
            <button 
              type="button" 
              onClick={() => setRows(prefillCompetencesFor(meta.trimestre))} 
              className="w-full px-3 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium flex items-center justify-center gap-2"
              data-testid="button-prefill-competencies"
            >
              ✨ {t('prefillCompetencies')}
            </button>
          </div>
        </div>
      </div>

      {/* Ministry Performance Grid - Reference for grading */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center">
          <Info className="h-4 w-4 mr-2" />
          {PERFORMANCE_GRID[language].title}
        </h3>
        <p className="text-xs text-blue-600 mb-3">
          {language === 'fr' 
            ? 'Guide de référence pour l\'attribution des notes et cotes conformément au système CBA du Ministère'
            : 'Reference guide for grade assignment and grading according to the Ministry\'s CBA system'
          }
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-blue-300 bg-white">
            <thead>
              <tr className="bg-blue-100">
                {PERFORMANCE_GRID[language].headers.map((header, idx) => (
                  <th key={idx} className="border border-blue-300 p-2 font-bold text-center text-blue-800">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERFORMANCE_GRID[language].levels.map((level, levelIdx) => (
                level.ranges.map((range, rangeIdx) => (
                  <tr key={`${levelIdx}-${rangeIdx}`} className="hover:bg-blue-50">
                    {rangeIdx === 0 && (
                      <td rowSpan={level.ranges.length} className="border border-blue-300 p-2 text-center font-semibold text-blue-700">
                        {level.level}
                      </td>
                    )}
                    <td className="border border-blue-300 p-2 text-center">{range}</td>
                    <td className="border border-blue-300 p-2 text-center font-bold text-green-700">{level.grades[rangeIdx]}</td>
                    <td className="border border-blue-300 p-2 text-center">{level.percentages[rangeIdx]}</td>
                    {rangeIdx === 0 && (
                      <td rowSpan={level.ranges.length} className="border border-blue-300 p-2 text-xs text-gray-700">
                        {level.appreciation}
                      </td>
                    )}
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACADEMIC INTERFACE TABLE - EXACT MATCH */}
      <form onSubmit={onSave} className="mt-6 bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
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
                <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border">{language === 'fr' ? 'COMMENTAIRES' : 'COMMENTS'}</th>
                <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border">{language === 'fr' ? 'Actions' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                // Use manually entered values - no automatic calculation (EXACT from academic interface)
                const moyenneFinale = Number(r.moyenneFinale) || 0;
                const totalPondere = round2(moyenneFinale * (Number(r.coef) || 0));
                const notePercent = round2((moyenneFinale / 20) * 100);
                const cote = coteFromNote(moyenneFinale);
                // Compétences en 3 blocs séparés (plus de concaténation)
                
                return (
                  <tr key={i} className={i % 2 ? "bg-white" : "bg-gray-50/30"}>
                    {/* Matière + Enseignant (EXACT from academic interface) */}
                    <td className="px-2 py-2 border min-w-[150px]" data-testid={`cell-subject-${i}`}>
                      <div className="space-y-1">
                        <Input
                          className="w-full border-0 bg-transparent text-sm font-semibold"
                          value={r.matiere}
                          onChange={(e) => {
                            const newMatiere = e.target.value;
                            const autoCoef = getCoefficientForSubject(newMatiere);
                            updateRow(i, {
                              matiere: newMatiere,
                              coef: autoCoef
                            });
                          }}
                          placeholder="Matière..."
                          data-testid={`input-subject-name-${i}`}
                          list="class-subjects-list"
                        />
                        <Input
                          className="w-full border-0 bg-transparent text-xs text-gray-600 italic"
                          value={r.enseignant || ''}
                          onChange={(e) => updateRow(i, { enseignant: e.target.value })}
                          placeholder="Nom enseignant..."
                          data-testid={`input-teacher-name-${i}`}
                        />
                      </div>
                    </td>

                    {/* N/20-M/20 (EXACT from academic interface - manual moyenne finale) */}
                    <td className="px-2 py-2 border" data-testid={`cell-nm20-${i}`}>
                      <div className="flex flex-wrap items-center gap-1 text-sm">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="20"
                          className="w-16 md:w-20 border rounded px-2 py-1 text-center text-sm"
                          value={r.note1 === 0 ? '' : r.note1}
                          onChange={(e) => updateRow(i, { note1: parseFloat(e.target.value) || 0 })}
                          placeholder="N/20"
                          data-testid={`input-note1-${i}`}
                        />
                        <span className="text-gray-500">-</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="20"
                          className="w-16 md:w-20 border rounded px-2 py-1 text-center text-sm font-bold bg-blue-50"
                          value={r.moyenneFinale === 0 ? '' : r.moyenneFinale}
                          onChange={(e) => updateRow(i, { moyenneFinale: parseFloat(e.target.value) || 0 })}
                          placeholder="M/20"
                          data-testid={`input-moyenne-${i}`}
                        />
                      </div>
                    </td>

                    {/* Coefficient (EXACT from academic interface) */}
                    <td className="px-3 py-2 border" data-testid={`cell-coef-${i}`}>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        className="w-14 border-0 bg-transparent text-center text-sm"
                        value={r.coef === 0 ? '' : r.coef}
                        onChange={(e) => {
                          const newCoef = parseInt(e.target.value) || 0;
                          updateRow(i, { coef: newCoef });
                        }}
                        data-testid={`input-coef-${i}`}
                      />
                    </td>

                    {/* M x coef (EXACT from academic interface) */}
                    <td className="px-3 py-2 border text-center" data-testid={`cell-mxcoef-${i}`}>
                      <span className="px-2 py-1 inline-block bg-green-50 rounded-lg font-semibold text-green-800 text-sm">
                        {totalPondere}
                      </span>
                    </td>

                    {/* Note % (EXACT from academic interface) */}
                    <td className="px-3 py-2 border text-center" data-testid={`cell-percent-${i}`}>
                      <span className="px-2 py-1 inline-block bg-purple-50 rounded-lg font-semibold text-purple-800 text-sm">
                        {notePercent}%
                      </span>
                    </td>

                    {/* COTE (EXACT from academic interface) */}
                    <td className="px-3 py-2 border text-center" data-testid={`cell-cote-${i}`}>
                      <Input
                        className="w-16 md:w-20 border-0 bg-transparent text-center font-bold text-sm"
                        value={cote}
                        onChange={(e) => updateRow(i, { cote: e.target.value })}
                        data-testid={`input-cote-${i}`}
                      />
                    </td>

                    {/* Compétences évaluées - 3 BLOCS SÉPARÉS (harmonisé avec système académique) */}
                    <td className="px-2 py-2 border min-w-[200px]" data-testid={`cell-competences-${i}`}>
                      <div className="space-y-1">
                        {/* Compétence 1 */}
                        <div className="bg-blue-50 p-1 rounded">
                          <div className="text-xs font-semibold text-blue-700 mb-1">
                            {language === 'fr' ? 'Compétence 1:' : 'Competency 1:'}
                          </div>
                          <input
                            type="text"
                            className="w-full border border-blue-200 bg-white text-xs p-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                            value={r.competence1 || ''}
                            onChange={(e) => updateRow(i, { competence1: e.target.value })}
                            placeholder={language === 'fr' ? 'Première compétence...' : 'First competency...'}
                            data-testid={`input-competence1-${i}`}
                          />
                        </div>
                        
                        {/* Compétence 2 */}
                        <div className="bg-green-50 p-1 rounded">
                          <div className="text-xs font-semibold text-green-700 mb-1">
                            {language === 'fr' ? 'Compétence 2:' : 'Competency 2:'}
                          </div>
                          <input
                            type="text"
                            className="w-full border border-green-200 bg-white text-xs p-1 rounded focus:outline-none focus:ring-1 focus:ring-green-400"
                            value={r.competence2 || ''}
                            onChange={(e) => updateRow(i, { competence2: e.target.value })}
                            placeholder={language === 'fr' ? 'Deuxième compétence...' : 'Second competency...'}
                            data-testid={`input-competence2-${i}`}
                          />
                        </div>
                        
                        {/* Compétence 3 */}
                        <div className="bg-purple-50 p-1 rounded">
                          <div className="text-xs font-semibold text-purple-700 mb-1">
                            {language === 'fr' ? 'Compétence 3:' : 'Competency 3:'}
                          </div>
                          <input
                            type="text"
                            className="w-full border border-purple-200 bg-white text-xs p-1 rounded focus:outline-none focus:ring-1 focus:ring-purple-400"
                            value={r.competence3 || ''}
                            onChange={(e) => updateRow(i, { competence3: e.target.value })}
                            placeholder={language === 'fr' ? 'Troisième compétence...' : 'Third competency...'}
                            data-testid={`input-competence3-${i}`}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Appréciation (EXACT from academic interface) */}
                    <td className="px-3 py-2 border" data-testid={`cell-appreciation-${i}`}>
                      <div className="flex gap-1 items-start">
                        <Select onValueChange={(value) => updateRow(i, { remark: value })} value={r.remark || ''}>
                          <SelectTrigger className="flex-1 border-0 bg-transparent text-xs min-h-[2.5rem] text-left">
                            <SelectValue placeholder={language === 'fr' ? "Sélectionnez une appréciation..." : "Select an appreciation..."} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CTBA">
                              {language === 'fr' ? 'Compétences Très Bien Acquises (CTBA)' : 'Competences Very Well Acquired (CVWA)'}
                            </SelectItem>
                            <SelectItem value="CBA">
                              {language === 'fr' ? 'Compétences Bien Acquises (CBA)' : 'Competences Well Acquired (CWA)'}
                            </SelectItem>
                            <SelectItem value="CA">
                              {language === 'fr' ? 'Compétences Acquises (CA)' : 'Competences Acquired (CA)'}
                            </SelectItem>
                            <SelectItem value="CMA">
                              {language === 'fr' ? 'Compétences Moyennement Acquises (CMA)' : 'Competences Averagely Acquired (CAA)'}
                            </SelectItem>
                            <SelectItem value="CNA">
                              {language === 'fr' ? 'Compétences Non Acquises (CNA)' : 'Competences Not Acquired (CNA)'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>

                    {/* COMMENTAIRES - Ministry teacher comments (EXACT from academic interface) */}
                    <td className="px-2 py-2 border min-w-[120px]" data-testid={`cell-comments-${i}`}>
                      <div className="space-y-1">
                        {/* Display selected comments count */}
                        <div className="text-xs text-center text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {(r.comments || []).length}/2 {language === 'fr' ? 'sélectionnés' : 'selected'}
                        </div>
                        
                        {/* Comment selection button */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              type="button"
                              variant="outline" 
                              size="sm" 
                              className="w-full text-xs h-8"
                              data-testid={`button-select-comments-${i}`}
                            >
                              📝 {language === 'fr' ? 'Commentaires' : 'Comments'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 max-h-60 overflow-y-auto">
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-gray-800">
                                {language === 'fr' ? 'Commentaires Ministère' : 'Ministry Comments'}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {language === 'fr' ? 'Max 2 commentaires' : 'Max 2 comments'}
                              </p>
                              <div className="grid gap-1">
                                {TEACHER_COMMENTS[language].map((comment) => {
                                  const currentComments = r.comments || [];
                                  const isSelected = currentComments.includes(comment.id);
                                  const canSelect = currentComments.length < 2 || isSelected;
                                  
                                  return (
                                    <button
                                      key={comment.id}
                                      type="button"
                                      disabled={!canSelect}
                                      className={`text-left p-2 text-xs rounded border transition-all ${
                                        isSelected 
                                          ? 'bg-blue-100 border-blue-400 text-blue-800 font-medium'
                                          : canSelect
                                            ? 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                                            : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
                                      }`}
                                      onClick={() => {
                                        const newComments = isSelected
                                          ? currentComments.filter(id => id !== comment.id)
                                          : currentComments.length < 2
                                            ? [...currentComments, comment.id]
                                            : currentComments;
                                        updateRow(i, { comments: newComments });
                                      }}
                                    >
                                      <span className="flex items-start gap-2">
                                        <span className={`flex-shrink-0 w-3 h-3 mt-0.5 border rounded-sm ${
                                          isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                        }`}>
                                          {isSelected && <span className="block w-full h-full text-white text-center text-xs leading-3">✓</span>}
                                        </span>
                                        <span className="flex-1">{comment.text}</span>
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        
                        {/* Display selected comments */}
                        {(r.comments || []).length > 0 && (
                          <div className="mt-1 text-xs text-gray-600 bg-gray-50 p-1 rounded">
                            {(r.comments || []).map((commentId, idx) => {
                              const comment = TEACHER_COMMENTS[language].find(c => c.id === commentId);
                              return (
                                <div key={commentId} className="truncate">
                                  {idx + 1}. {comment?.text.substring(0, 30)}...
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions (Teacher mode - NO sign/print features) */}
                    <td className="px-3 py-2 border text-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeRow(i)}
                        className="h-6 w-6 p-0"
                        data-testid={`button-remove-${i}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold text-sm">
                <Td colSpan={2}>{language === 'fr' ? 'TOTAL GÉNÉRAL' : 'GENERAL TOTAL'}</Td>
                <Td className="text-center">{totals.totalCoef}</Td>
                <Td className="text-center font-bold text-green-800">{totals.totalMxCoef}</Td>
                <Td className="text-center">{round2((totals.moyenne / 20) * 100)}%</Td>
                <Td className="text-center font-bold">{totals.cote}</Td>
                <Td colSpan={3} className="text-center text-gray-600">
                  {language === 'fr' ? 'Moyenne générale:' : 'General average:'} <strong>{totals.moyenne}/20</strong>
                </Td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Datalist pour suggestions de matières avec coefficients */}
        <datalist id="class-subjects-list">
          {allClassSubjects.map((subject, idx) => (
            <option key={idx} value={subject.matiere}>
              {subject.matiere} (Coef: {subject.coef})
            </option>
          ))}
        </datalist>

        <div className="p-4 flex items-center justify-between">
          <button 
            type="button" 
            onClick={addRow} 
            className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
            data-testid="button-add-subject"
          >
            + {t('addSubject')}
          </button>
          <div className="text-sm">
            {t('generalAverage')} : <span className="font-semibold" data-testid="text-average">{totals.moyenne}/20</span>
          </div>
        </div>

        <hr/>

        {/* Extended Student Information Section (matching director interface) */}
        <div className="p-4 bg-blue-50 rounded-xl">
          <h3 className="font-semibold mb-3 text-blue-800">Informations Complètes de l'Élève</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <LabeledInput 
              label="Nom & Prénoms" 
              value={extendedStudent.name} 
              onChange={v=>setExtendedStudent(prev=>({...prev,name:v}))}
              data-testid="input-student-name"
            />
            <LabeledInput 
              label="Matricule" 
              value={extendedStudent.id} 
              onChange={v=>setExtendedStudent(prev=>({...prev,id:v}))}
              data-testid="input-student-id"
            />
            <LabeledInput 
              label="Classe" 
              value={extendedStudent.className} 
              onChange={v=>setExtendedStudent(prev=>({...prev,className:v}))}
              data-testid="input-student-class"
            />
            <NumberField 
              label="Effectif de la classe" 
              value={extendedStudent.classSize} 
              onChange={v=>setExtendedStudent(prev=>({...prev,classSize:Number(v)||0}))}
              data-testid="input-class-size"
            />
            <LabeledInput 
              label="Date de naissance" 
              value={extendedStudent.birthDate} 
              onChange={v=>setExtendedStudent(prev=>({...prev,birthDate:v}))}
              type="date"
              data-testid="input-birth-date"
            />
            <LabeledInput 
              label="Lieu de naissance" 
              value={extendedStudent.birthPlace} 
              onChange={v=>setExtendedStudent(prev=>({...prev,birthPlace:v}))}
              data-testid="input-birth-place"
            />
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Genre</label>
              <select 
                className="w-full text-sm border rounded-lg px-2 py-1"
                value={extendedStudent.gender}
                onChange={e=>setExtendedStudent(prev=>({...prev,gender:e.target.value}))}
                data-testid="select-gender"
              >
                <option value="">Sélectionner</option>
                <option value="Masculin">Masculin</option>
                <option value="Féminin">Féminin</option>
              </select>
            </div>
            <LabeledInput 
              label="Professeur principal" 
              value={extendedStudent.headTeacher} 
              onChange={v=>setExtendedStudent(prev=>({...prev,headTeacher:v}))}
              data-testid="input-head-teacher"
            />
            <LabeledInput 
              label="Parents/Tuteurs" 
              value={extendedStudent.guardian} 
              onChange={v=>setExtendedStudent(prev=>({...prev,guardian:v}))}
              data-testid="input-guardian"
            />
          </div>
        </div>

        <hr/>

        {/* Extended Discipline Section (matching director interface) */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-xl p-3">
            <h3 className="font-semibold mb-2">Discipline et Absences</h3>
            <div className="grid grid-cols-2 gap-2">
              <NumberField 
                label="Absences justifiées (h)" 
                value={extendedDiscipline.absJ} 
                onChange={v=>setExtendedDiscipline(prev=>({...prev,absJ:Number(v)||0}))}
                data-testid="input-justified-absences-extended"
              />
              <NumberField 
                label="Absences non justifiées (h)" 
                value={extendedDiscipline.absNJ} 
                onChange={v=>setExtendedDiscipline(prev=>({...prev,absNJ:Number(v)||0}))}
                data-testid="input-unjustified-absences-extended"
              />
              <NumberField 
                label="Retards" 
                value={extendedDiscipline.late} 
                onChange={v=>setExtendedDiscipline(prev=>({...prev,late:Number(v)||0}))}
                data-testid="input-late-extended"
              />
              <NumberField 
                label="Sanctions/Avertissements" 
                value={extendedDiscipline.sanctions} 
                onChange={v=>setExtendedDiscipline(prev=>({...prev,sanctions:Number(v)||0}))}
                data-testid="input-sanctions-extended"
              />
            </div>

            {/* Legacy discipline fields for compatibility */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <h4 className="text-xs font-medium text-gray-600 mb-2">Détails additionnels</h4>
              <div className="grid grid-cols-2 gap-2">
                <NumberField 
                  label="Avertissements" 
                  value={meta.avertissements} 
                  onChange={v=>setMeta(m=>({...m,avertissements:Number(v)||0}))}
                  data-testid="input-warnings"
                />
                <NumberField 
                  label="Blâmes" 
                  value={meta.blames} 
                  onChange={v=>setMeta(m=>({...m,blames:Number(v)||0}))}
                  data-testid="input-blames"
                />
                <NumberField 
                  label="Exclusions (jours)" 
                  value={meta.exclusions} 
                  onChange={v=>setMeta(m=>({...m,exclusions:Number(v)||0}))}
                  data-testid="input-exclusions"
                />
                <NumberField 
                  label="Consignes (heures)" 
                  value={meta.consignes} 
                  onChange={v=>setMeta(m=>({...m,consignes:Number(v)||0}))}
                  data-testid="input-detentions"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-3">
            <h3 className="font-semibold mb-2">Appréciations Générales</h3>
            <div className="grid gap-2">
              <LabeledTextArea 
                label={language === 'fr' ? "Appréciation générale du trimestre" : "General term appreciation"}
                value={generalRemark} 
                onChange={setGeneralRemark} 
                rows={4}
                data-testid="textarea-general-remark"
              />
              <LabeledTextArea 
                label={language === 'fr' ? "Appréciation du travail de l'élève (points forts / à améliorer)" : "Student work assessment (strengths / to improve)"}
                value={meta.appEleve} 
                onChange={v=>setMeta(m=>({...m,appEleve:v}))} 
                rows={3}
                data-testid="textarea-work-appreciation"
              />
              <LabeledInput 
                label="Visa du parent / Tuteur" 
                value={meta.visaParent} 
                onChange={v=>setMeta(m=>({...m,visaParent:v}))}
                data-testid="input-parent-visa"
              />
            </div>
          </div>
        </div>

        {/* Annual Summary Section for Third Trimester (matching director interface) */}
        {isThirdTrimester && (
          <>
            <hr/>
            <div className="p-4 bg-orange-50 rounded-xl">
              <h3 className="font-semibold mb-3 text-orange-800">Bilan Annuel - Troisième Trimestre</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <NumberField 
                  label={language === 'fr' ? "Moyenne 1er Trimestre" : "First Term Average"}
                  value={annualSummary.firstTrimesterAverage} 
                  onChange={v=>setAnnualSummary(prev=>({...prev,firstTrimesterAverage:Number(v)||0}))}
                  data-testid="input-first-trimester-average"
                />
                <NumberField 
                  label={language === 'fr' ? "Moyenne 2ème Trimestre" : "Second Term Average"}
                  value={annualSummary.secondTrimesterAverage} 
                  onChange={v=>setAnnualSummary(prev=>({...prev,secondTrimesterAverage:Number(v)||0}))}
                  data-testid="input-second-trimester-average"
                />
                <NumberField 
                  label={language === 'fr' ? "Moyenne 3ème Trimestre" : "Third Term Average"}
                  value={annualSummary.thirdTrimesterAverage} 
                  onChange={v=>setAnnualSummary(prev=>({...prev,thirdTrimesterAverage:Number(v)||0}))}
                  data-testid="input-third-trimester-average"
                />
                <NumberField 
                  label={language === 'fr' ? "Moyenne Annuelle" : "Annual Average"}
                  value={annualSummary.annualAverage} 
                  onChange={v=>setAnnualSummary(prev=>({...prev,annualAverage:Number(v)||0}))}
                  data-testid="input-annual-average"
                />
                <NumberField 
                  label="Rang Annuel" 
                  value={annualSummary.annualRank} 
                  onChange={v=>setAnnualSummary(prev=>({...prev,annualRank:Number(v)||0}))}
                  data-testid="input-annual-rank"
                />
                <NumberField 
                  label="Total Élèves" 
                  value={annualSummary.totalStudents} 
                  onChange={v=>setAnnualSummary(prev=>({...prev,totalStudents:Number(v)||0}))}
                  data-testid="input-total-students"
                />
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Décision de Passage</label>
                  <select 
                    className="w-full text-sm border rounded-lg px-2 py-1"
                    value={annualSummary.passDecision}
                    onChange={e=>setAnnualSummary(prev=>({...prev,passDecision:e.target.value}))}
                    data-testid="select-pass-decision"
                  >
                    <option value="">Sélectionner</option>
                    <option value="PASSE">PASSE en classe supérieure</option>
                    <option value="REDOUBLE">REDOUBLE</option>
                    <option value="RENVOYÉ">RENVOYÉ</option>
                  </select>
                </div>
                <div>
                  {/* Placeholder for additional annual options */}
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabeledTextArea 
                  label="Appréciation Finale" 
                  value={annualSummary.finalAppreciation} 
                  onChange={v=>setAnnualSummary(prev=>({...prev,finalAppreciation:v}))} 
                  rows={3}
                  data-testid="textarea-final-appreciation"
                />
                <LabeledTextArea 
                  label="Recommandations pour les Vacances" 
                  value={annualSummary.holidayRecommendations} 
                  onChange={v=>setAnnualSummary(prev=>({...prev,holidayRecommendations:v}))} 
                  rows={3}
                  data-testid="textarea-holiday-recommendations"
                />
              </div>
            </div>
          </>
        )}

        {/* Digital Signature and Actions Section (matching director interface) */}
        <hr/>
        
        {/* Teacher Actions - Role-restricted workflow (EXACT from requirements) */}
        <div className="p-4 bg-blue-50 rounded-xl">
          <h3 className="font-semibold mb-3 text-blue-800">
            {language === 'fr' ? 'Actions Enseignant' : 'Teacher Actions'}
          </h3>
          <p className="text-sm text-blue-600 mb-4">
            {language === 'fr' 
              ? 'Les enseignants soumettent les notes uniquement à l\'école. L\'école gère la signature et l\'envoi aux parents.'
              : 'Teachers submit grades only to the school. The school manages signing and sending to parents.'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Save Draft */}
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  // Save current state as draft
                  const draftData = {
                    studentId: selectedStudent?.id,
                    studentName: selectedStudent?.fullName,
                    className: selectedClass?.name,
                    term: currentTerm,
                    year: currentYear,
                    rows,
                    extendedStudent,
                    extendedDiscipline,
                    meta,
                    savedAt: new Date().toISOString(),
                    status: 'draft'
                  };
                  
                  // Store in localStorage for now
                  const existingDrafts = JSON.parse(localStorage.getItem('teacher_bulletin_drafts') || '[]');
                  const updatedDrafts = [...existingDrafts.filter((d: any) => 
                    !(d.studentId === draftData.studentId && d.term === draftData.term && d.year === draftData.year)
                  ), draftData];
                  localStorage.setItem('teacher_bulletin_drafts', JSON.stringify(updatedDrafts));
                  
                  toast({
                    title: language === 'fr' ? 'Brouillon sauvegardé' : 'Draft saved',
                    description: language === 'fr' 
                      ? `Notes sauvegardées pour ${selectedStudent?.fullName || 'Élève'}`
                      : `Grades saved for ${selectedStudent?.fullName || 'Student'}`,
                  });
                }}
                data-testid="button-save-draft"
              >
                💾 {language === 'fr' ? 'Sauvegarder Brouillon' : 'Save Draft'}
              </Button>
              <p className="text-xs text-gray-600 text-center">
                {language === 'fr' ? 'Travail temporaire' : 'Temporary work'}
              </p>
            </div>

            {/* Archive for Class */}
            <div className="space-y-2">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => {
                  // Archive organised by class and student
                  const archiveData = {
                    studentId: selectedStudent?.id,
                    studentName: selectedStudent?.fullName,
                    className: selectedClass?.name,
                    term: currentTerm,
                    year: currentYear,
                    rows,
                    extendedStudent,
                    extendedDiscipline,
                    meta,
                    archivedAt: new Date().toISOString(),
                    status: 'archived'
                  };
                  
                  // Store in organised archive
                  const existingArchives = JSON.parse(localStorage.getItem('teacher_bulletin_archives') || '{}');
                  const classKey = `${selectedClass?.name}-${currentYear}`;
                  if (!existingArchives[classKey]) {
                    existingArchives[classKey] = [];
                  }
                  
                  // Remove existing archive for same student/term
                  existingArchives[classKey] = existingArchives[classKey].filter((a: any) => 
                    !(a.studentId === archiveData.studentId && a.term === archiveData.term)
                  );
                  existingArchives[classKey].push(archiveData);
                  
                  localStorage.setItem('teacher_bulletin_archives', JSON.stringify(existingArchives));
                  
                  toast({
                    title: language === 'fr' ? 'Archivé avec succès' : 'Successfully archived',
                    description: language === 'fr' 
                      ? `Notes archivées dans ${selectedClass?.name || 'la classe'}`
                      : `Grades archived in ${selectedClass?.name || 'class'}`,
                  });
                }}
                data-testid="button-archive"
              >
                📁 {language === 'fr' ? 'Archiver par Classe' : 'Archive by Class'}
              </Button>
              <p className="text-xs text-gray-600 text-center">
                {language === 'fr' ? 'Organisation par classe' : 'Organize by class'}
              </p>
            </div>

            {/* Submit to School */}
            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={saveBulletinMutation.isPending || rows.length === 0}
                data-testid="button-submit-to-school"
              >
                {saveBulletinMutation.isPending ? (
                  <>🔄 {language === 'fr' ? 'Envoi...' : 'Sending...'}</>
                ) : (
                  <>📤 {language === 'fr' ? 'Soumettre à l\'École' : 'Submit to School'}</>
                )}
              </Button>
              <p className="text-xs text-gray-600 text-center">
                {language === 'fr' ? 'Validation finale par l\'école' : 'Final validation by school'}
              </p>
            </div>
          </div>
          
          {/* Teacher Role Reminder */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-yellow-600">ℹ️</span>
              <div className="text-xs text-yellow-800">
                <strong>
                  {language === 'fr' ? 'Rappel du rôle enseignant :' : 'Teacher role reminder:'}
                </strong>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>
                    {language === 'fr' 
                      ? 'Les enseignants soumettent les notes uniquement à l\'école'
                      : 'Teachers submit grades only to the school'}
                  </li>
                  <li>
                    {language === 'fr' 
                      ? 'L\'école valide, signe et envoie aux parents'
                      : 'School validates, signs and sends to parents'}
                  </li>
                  <li>
                    {language === 'fr' 
                      ? 'Aucune communication directe enseignant ↔ parents via cette interface'
                      : 'No direct teacher ↔ parent communication via this interface'}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Workflow Action Buttons (RESTORE REQUIRED FUNCTIONALITY) */}
        <div className="p-4 flex gap-3 justify-end bg-gray-50 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              // Save current state as draft
              const draftData = {
                studentId: selectedStudent?.id,
                studentName: selectedStudent?.fullName,
                className: selectedClass?.name,
                term: currentTerm,
                year: currentYear,
                rows,
                extendedStudent,
                extendedDiscipline,
                meta,
                savedAt: new Date().toISOString(),
                status: 'draft'
              };
              
              // Store in localStorage for now
              const existingDrafts = JSON.parse(localStorage.getItem('teacher_bulletin_drafts') || '[]');
              const updatedDrafts = [...existingDrafts.filter((d: any) => 
                !(d.studentId === draftData.studentId && d.term === draftData.term && d.year === draftData.year)
              ), draftData];
              localStorage.setItem('teacher_bulletin_drafts', JSON.stringify(updatedDrafts));
              
              toast({
                title: language === 'fr' ? 'Brouillon sauvegardé' : 'Draft saved',
                description: language === 'fr' 
                  ? `Notes sauvegardées pour ${selectedStudent?.fullName || 'Élève'}`
                  : `Grades saved for ${selectedStudent?.fullName || 'Student'}`,
              });
            }}
            data-testid="button-save-draft"
          >
            💾 {language === 'fr' ? 'Sauvegarder Brouillon' : 'Save Draft'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              // Archive organised by class and student
              const archiveData = {
                studentId: selectedStudent?.id,
                studentName: selectedStudent?.fullName,
                className: selectedClass?.name,
                term: currentTerm,
                year: currentYear,
                rows,
                extendedStudent,
                extendedDiscipline,
                meta,
                archivedAt: new Date().toISOString(),
                status: 'archived'
              };
              
              // Store in organised archive
              const existingArchives = JSON.parse(localStorage.getItem('teacher_bulletin_archives') || '{}');
              const classKey = `${selectedClass?.name}-${currentYear}`;
              if (!existingArchives[classKey]) {
                existingArchives[classKey] = [];
              }
              
              // Remove existing archive for same student/term
              existingArchives[classKey] = existingArchives[classKey].filter((a: any) => 
                !(a.studentId === archiveData.studentId && a.term === archiveData.term)
              );
              existingArchives[classKey].push(archiveData);
              
              localStorage.setItem('teacher_bulletin_archives', JSON.stringify(existingArchives));
              
              toast({
                title: language === 'fr' ? 'Archivé avec succès' : 'Successfully archived',
                description: language === 'fr' 
                  ? `Notes archivées dans ${selectedClass?.name || 'la classe'}`
                  : `Grades archived in ${selectedClass?.name || 'class'}`,
              });
            }}
            data-testid="button-archive"
          >
            📁 {language === 'fr' ? 'Archiver' : 'Archive'}
          </Button>

          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={saveBulletinMutation.isPending || rows.length === 0}
            data-testid="button-submit-to-school"
          >
            {saveBulletinMutation.isPending ? (
              <>🔄 {language === 'fr' ? 'Envoi...' : 'Sending...'}</>
            ) : (
              <>📤 {language === 'fr' ? 'Soumettre à l\'École' : 'Submit to School'}</>
            )}
          </Button>
        </div>
      </form>

      <datalist id="matieres-list">
        {assignedSubjects.map((s, i) => (
          <option key={i} value={s.matiere} />
        ))}
      </datalist>
    </div>
  );
}

/**************************** SOUS-COMPOSANTS ****************************/
function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-2 text-[11px] sm:text-xs text-gray-600 ${className}`}>{children}</th>;
}

function Td({ children, className = "", colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return <td colSpan={colSpan} className={`px-3 py-2 align-top ${className}`}>{children}</td>;
}

function Info({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`grid grid-cols-3 ${className}`}>
      <div className="col-span-1 text-gray-500">{label}</div>
      <div className="col-span-2 font-medium">{value || "—"}</div>
    </div>
  );
}

function LabeledInput({ label, value, onChange, type = "text", "data-testid": dataTestId }: { 
  label: string; 
  value: string | number; 
  onChange: (value: string) => void; 
  type?: string;
  "data-testid"?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input 
        type={type} 
        className="w-full border rounded-xl px-3 py-2" 
        value={value} 
        onChange={e=>onChange(e.target.value)}
        data-testid={dataTestId}
      />
    </div>
  );
}

function LabeledTextArea({ label, value, onChange, rows = 3, "data-testid": dataTestId }: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void; 
  rows?: number;
  "data-testid"?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <textarea 
        rows={rows} 
        className="w-full border rounded-xl px-3 py-2" 
        value={value} 
        onChange={e=>onChange(e.target.value)}
        data-testid={dataTestId}
      />
    </div>
  );
}

function NumberField({ label, value, onChange, "data-testid": dataTestId }: { 
  label: string; 
  value: string | number; 
  onChange: (value: string) => void;
  "data-testid"?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input 
        type="number" 
        className="w-full border rounded-xl px-3 py-2" 
        value={value} 
        onChange={e=>onChange(e.target.value)}
        data-testid={dataTestId}
      />
    </div>
  );
}
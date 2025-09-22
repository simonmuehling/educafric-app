import React, { useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// Support bilingue FR/EN
const BILINGUAL_LABELS = {
  fr: {
    bulletinTitle: "BULLETIN SCOLAIRE",
    trimester: "TRIMESTRE",
    academicYear: "Année scolaire",
    student: "Élève",
    class: "Classe",
    subject: "MATIÈRE",
    teacher: "Enseignant",
    competencies: "Compétences évaluées",
    grade1: "N/20",
    grade2: "M/20",
    coefficient: "Coef",
    total: "M x coef",
    cote: "COTE",
    appreciation: "Appréciations (visa enseignant)",
    generalAverage: "Moyenne générale",
    discipline: "Discipline",
    parameters: "Paramètres",
    prefillCompetencies: "Préremplir les compétences du trimestre",
    addSubject: "Ajouter une matière",
    save: "Enregistrer",
    print: "Imprimer",
    firstName: "Nom & Prénoms",
    birthInfo: "Date & Lieu de naissance",
    gender: "Genre",
    uniqueId: "Identifiant Unique",
    repeater: "Redoublant",
    classSize: "Effectif",
    mainTeacher: "Professeur principal",
    parents: "Parents / Tuteurs"
  },
  en: {
    bulletinTitle: "SCHOOL REPORT CARD",
    trimester: "TERM",
    academicYear: "Academic year",
    student: "Student",
    class: "Class",
    subject: "SUBJECT",
    teacher: "Teacher",
    competencies: "Skills assessed",
    grade1: "G1/20",
    grade2: "G2/20",
    coefficient: "Coef",
    total: "Total",
    cote: "GRADE",
    appreciation: "Comments (teacher signature)",
    generalAverage: "Overall average",
    discipline: "Discipline",
    parameters: "Settings",
    prefillCompetencies: "Prefill term competencies",
    addSubject: "Add subject",
    save: "Save",
    print: "Print",
    firstName: "Full Name",
    birthInfo: "Date & Place of birth",
    gender: "Gender",
    uniqueId: "Student ID",
    repeater: "Repeater",
    classSize: "Class size",
    mainTeacher: "Main teacher",
    parents: "Parents / Guardians"
  }
};

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

function coteFromNote(note20: string | number): string {
  if (note20 == null || note20 === '' || (typeof note20 === 'string' && note20.trim() === '') || isNaN(Number(note20))) return "";
  const n = Number(note20);
  const r = performanceGrid.find(g => n >= g.min && n < g.max);
  return r ? r.grade : "";
}

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

function round2(x: number): number { 
  return Math.round((Number(x) + Number.EPSILON) * 100) / 100; 
}

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
function getCompetencesByTrimester(matiere: string, trimestre: string): { competence1: string; competence2: string } {
  const normalizedMatiere = normalizeSubjectKey(matiere.toUpperCase());
  const competences = COMPETENCES_BY_TRIMESTER_AND_SUBJECT[trimestre as keyof typeof COMPETENCES_BY_TRIMESTER_AND_SUBJECT]?.[normalizedMatiere as keyof typeof COMPETENCES_BY_TRIMESTER_AND_SUBJECT.Premier];
  
  if (competences && typeof competences === 'object') {
    return {
      competence1: competences.competence1 || "",
      competence2: competences.competence2 || ""
    };
  }
  
  return { competence1: "", competence2: "" };
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
      competence2: competences.competence2
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
  note1: string | number;  // Note première compétence /20
  note2: string | number;  // Note deuxième compétence /20
  moyenneFinale: string | number;  // M/20 - Moyenne des deux compétences
  coef: number;
  totalPondere: number;  // M/20 * coefficient
  cote: string;
  appreciation: string;
}

/**************************** COMPOSANT PRINCIPAL ****************************/
export default function ManualBulletinForm({ 
  studentId, 
  trimestre = "Premier",
  classId,
  academicYear = "2024-2025" 
}: ManualBulletinFormProps) {
  const [loading, setLoading] = useState(true);
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
    return teacherSubjectsData.subjects.map((subject: any) => ({
      matiere: subject.name || subject.matiere || subject.subject,
      coef: subject.coefficient || subject.coef || 1
    }));
  }, [teacherSubjectsData]);

  // Extract all class subjects with coefficients for subject selection
  const allClassSubjects = useMemo(() => {
    if (!classSubjectsData || !classSubjectsData.subjects) return [];
    return classSubjectsData.subjects.map((subject: any) => ({
      matiere: subject.nameFr || subject.name || subject.matiere,
      matiereEn: subject.nameEn || subject.name || subject.matiere,
      coef: Number(subject.coefficient) || 1,
      code: subject.code || ''
    }));
  }, [classSubjectsData]);

  // Helper function to get coefficient for a subject from class configuration
  const getCoefficientForSubject = (subjectName: string): number => {
    const subject = allClassSubjects.find(s => 
      s.matiere.toLowerCase().includes(subjectName.toLowerCase()) ||
      s.matiereEn.toLowerCase().includes(subjectName.toLowerCase()) ||
      normalizeSubjectKey(s.matiere) === normalizeSubjectKey(subjectName)
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
      // Adapter les données de notre API au format attendu
      setEleve({
        id: (studentProfile as any).id || studentId,
        nom: `${(studentProfile as any).firstName || ''} ${(studentProfile as any).lastName || ''}`,
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
        etablissement: { nom: "Institut Educafric", immatriculation: "EDU-2025-001" },
      });
      setLoading(false);
    } else if (studentId && !profileLoading) {
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
        etablissement: { nom: "Institut Educafric", immatriculation: "EDU-2025-001" },
      });
      setLoading(false);
    }
  }, [studentId, studentProfile, profileLoading]);

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
        competences: r.competences,
        n20: Number(r.n20) || null,
        m20: Number(r.m20) || null,
        coef: Number(r.coef) || 0,
        mxcoef: Number(r.m20 || 0) * Number(r.coef || 0),
        cote: r.cote || (r.m20 !== '' && r.m20 != null ? coteFromNote(r.m20) : ''),
        appreciation: r.appreciation || (r.m20 !== '' && r.m20 != null ? appreciationFromNote(r.m20, predefinedAppreciations) : ''),
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

  if (!eleve) {
    return (
      <div className="p-6 text-sm text-red-600" data-testid="error-state">
        Erreur: Impossible de charger le profil de l'élève
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
                    alt={`Photo de ${eleve.nom}`} 
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
            <Info label={t('firstName')} value={eleve.nom} />
            <Info label={t('class')} value={eleve.classe} />
            <Info label={t('birthInfo')} value={`${eleve.dateNaissance} à ${eleve.lieuNaissance}`} />
            <Info label={t('gender')} value={eleve.sexe} />
            <Info label={t('uniqueId')} value={eleve.identifiantUnique} />
            <Info label={t('repeater')} value={eleve.redoublant ? (language === 'fr' ? "Oui" : "Yes") : (language === 'fr' ? "Non" : "No")} />
            <Info label={t('classSize')} value={String(eleve.effectif)} />
            <Info label={t('mainTeacher')} value={eleve.professeurPrincipal} />
            <Info label={t('parents')} value={`${eleve.parents.noms} – ${eleve.parents.contacts}`} className="sm:col-span-2" />
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
                <option value="Premier">{language === 'fr' ? 'Premier' : 'First'}</option>
                <option value="Deuxième">{language === 'fr' ? 'Deuxième' : 'Second'}</option>
                <option value="Troisième">{language === 'fr' ? 'Troisième' : 'Third'}</option>
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

      {/* Table de saisie */}
      <form onSubmit={onSave} className="mt-6 bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <Th className="w-40">{language === 'fr' ? 'Matière' : 'Subject'}</Th>
                <Th className="w-32">{language === 'fr' ? 'N/20-M/20' : 'Mark/20-Avg/20'}</Th>
                <Th className="w-20">{language === 'fr' ? 'Coef' : 'Coeff'}</Th>
                <Th className="w-24">{language === 'fr' ? 'M x coef' : 'M x coeff'}</Th>
                <Th className="w-20">{language === 'fr' ? 'Note %' : 'Mark %'}</Th>
                <Th className="w-20">{language === 'fr' ? 'COTE' : 'GRADE'}</Th>
                <Th className="w-80">{language === 'fr' ? 'Compétences évaluées' : 'Competencies assessed'}</Th>
                <Th className="w-64">{language === 'fr' ? 'Appréciation' : 'Comments'}</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                // Calcul automatique de la moyenne finale des 2 compétences
                const moyenneCalculee = calculateMoyenneFinale(r.note1, r.note2);
                const moyenneFinale = Number(r.moyenneFinale) || moyenneCalculee;
                const totalPondere = round2(moyenneFinale * (Number(r.coef)||0));
                const cote = r.cote || coteFromNote(moyenneFinale);
                const notePercent = round2((moyenneFinale / 20) * 100);
                const competencesEvaluees = r.competence1 && r.competence2 ? `${r.competence1}; ${r.competence2}` : (r.competence1 || r.competence2 || '');
                
                return (
                  <tr key={i} className={i % 2 ? "bg-white" : "bg-gray-50/30"}>
                    {/* Matière */}
                    <Td data-testid={`cell-subject-${i}`}>
                      <input 
                        className="w-36 border rounded-lg px-2 py-1 text-sm" 
                        value={r.matiere} 
                        onChange={e=>{
                          const newMatiere = e.target.value;
                          const autoCoef = getCoefficientForSubject(newMatiere);
                          updateRow(i,{
                            matiere: newMatiere,
                            coef: autoCoef
                          });
                        }}
                        list="class-subjects-list"
                        placeholder="Matière..."
                        data-testid={`input-subject-${i}`}
                      />
                    </Td>

                    {/* N/20-M/20 */}
                    <Td data-testid={`cell-nm20-${i}`}>
                      <div className="flex items-center gap-1 text-sm">
                        <input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          max="20" 
                          className="w-12 border rounded px-1 py-1 text-center text-xs" 
                          value={r.note1} 
                          onChange={e=>{
                            const newNote1 = e.target.value;
                            const newMoyenne = calculateMoyenneFinale(newNote1, r.note2);
                            updateRow(i,{
                              note1: newNote1,
                              moyenneFinale: newMoyenne,
                              totalPondere: round2(newMoyenne * (Number(r.coef)||0))
                            });
                          }}
                          placeholder="N"
                          data-testid={`input-note1-${i}`}
                        />
                        <span className="text-gray-500">-</span>
                        <span className="w-12 text-center text-xs font-bold bg-blue-50 px-1 py-1 rounded border">
                          {moyenneFinale || '0'}
                        </span>
                        <input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          max="20" 
                          className="w-12 border rounded px-1 py-1 text-center text-xs ml-1" 
                          value={r.note2} 
                          onChange={e=>{
                            const newNote2 = e.target.value;
                            const newMoyenne = calculateMoyenneFinale(r.note1, newNote2);
                            updateRow(i,{
                              note2: newNote2,
                              moyenneFinale: newMoyenne,
                              totalPondere: round2(newMoyenne * (Number(r.coef)||0))
                            });
                          }}
                          placeholder="N2"
                          data-testid={`input-note2-${i}`}
                        />
                      </div>
                    </Td>

                    {/* Coefficient */}
                    <Td data-testid={`cell-coef-${i}`}>
                      <input 
                        type="number" 
                        step="1" 
                        min="0" 
                        className="w-14 border rounded-lg px-2 py-1 text-center text-sm" 
                        value={r.coef} 
                        onChange={e=>{
                          const newCoef = parseInt(e.target.value) || 0;
                          updateRow(i,{
                            coef: newCoef,
                            totalPondere: round2(moyenneFinale * newCoef)
                          });
                        }}
                        data-testid={`input-coef-${i}`}
                      />
                    </Td>

                    {/* M x coef */}
                    <Td data-testid={`cell-mxcoef-${i}`}>
                      <span className="px-2 py-1 inline-block bg-green-50 rounded-lg font-semibold text-green-800 text-sm">
                        {totalPondere}
                      </span>
                    </Td>

                    {/* Note % */}
                    <Td data-testid={`cell-percent-${i}`}>
                      <span className="px-2 py-1 inline-block bg-purple-50 rounded-lg font-semibold text-purple-800 text-sm">
                        {notePercent}%
                      </span>
                    </Td>

                    {/* COTE */}
                    <Td data-testid={`cell-cote-${i}`}>
                      <input 
                        className="w-12 border rounded-lg px-2 py-1 text-center font-bold text-sm" 
                        value={cote} 
                        onChange={e=>updateRow(i,{cote:e.target.value})}
                        data-testid={`input-cote-${i}`}
                      />
                    </Td>

                    {/* Compétences évaluées */}
                    <Td data-testid={`cell-competences-${i}`}>
                      <textarea 
                        className="w-full border rounded-lg px-2 py-1 text-xs" 
                        rows={2} 
                        value={competencesEvaluees}
                        onChange={e=>{
                          const newCompetences = e.target.value;
                          // Split by semicolon and update both competencies
                          const parts = newCompetences.split(';');
                          updateRow(i,{
                            competence1: parts[0]?.trim() || '',
                            competence2: parts[1]?.trim() || ''
                          });
                        }}
                        placeholder="Compétences séparées par ;"
                        data-testid={`input-competences-${i}`}
                      />
                    </Td>

                    {/* Appréciation */}
                    <Td data-testid={`cell-appreciation-${i}`}>
                      <div className="flex gap-1 items-start">
                        <textarea 
                          className="flex-1 border rounded-lg px-2 py-1 text-xs min-h-[2.5rem]" 
                          rows={2} 
                          value={r.appreciation} 
                          onChange={e=>updateRow(i,{appreciation:e.target.value})} 
                          placeholder={appreciationFromNote(moyenneFinale, predefinedAppreciations)}
                          data-testid={`textarea-appreciation-${i}`}
                        />
                        
                        {/* Compact Predefined Appreciations Selector - Mobile Optimized */}
                        <Select 
                          onValueChange={(value) => updateRow(i, {appreciation: value})}
                        >
                          <SelectTrigger 
                            className="w-6 h-6 p-0 border-2 border-blue-300 hover:border-blue-500 flex items-center justify-center shrink-0 text-xs"
                            disabled={!predefinedAppreciations?.data}
                            data-testid={`button-open-appreciations-${i}`}
                            title={predefinedAppreciations?.data ? "Choisir une appréciation" : "Chargement..."}
                          >
                            <SelectValue placeholder="📝" />
                          </SelectTrigger>
                          <SelectContent className="max-w-[280px] max-h-[200px] overflow-y-auto">
                            <div className="p-2 border-b bg-slate-50 text-xs font-medium text-slate-600">
                              📝 Appréciations suggérées
                            </div>
                            {predefinedAppreciations?.data?.filter((app: any) => 
                              (!app.gradeRange || (Number(moyenneFinale) >= app.gradeRange.min && Number(moyenneFinale) < app.gradeRange.max))
                            ).slice(0, 8).map((appreciation: any) => (
                              <SelectItem 
                                key={appreciation.id} 
                                value={appreciation.appreciation}
                                data-testid={`option-appreciation-${appreciation.id}`}
                                className="cursor-pointer hover:bg-blue-50"
                              >
                                <div className="text-xs leading-relaxed py-1">
                                  {appreciation.appreciation?.length > 45 
                                    ? appreciation.appreciation.substring(0, 45) + "..." 
                                    : appreciation.appreciation}
                                </div>
                              </SelectItem>
                            ))}
                            {!predefinedAppreciations?.data?.length && (
                              <div className="p-2 text-xs text-slate-500 italic">
                                Aucune appréciation disponible
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </Td>
                    <Td>
                      <button 
                        type="button" 
                        onClick={()=>removeRow(i)} 
                        className="text-red-600 hover:underline"
                        data-testid={`button-remove-${i}`}
                      >
                        Suppr.
                      </button>
                    </Td>
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

        {/* Discipline / Profil classe */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-xl p-3">
            <h3 className="font-semibold mb-2">Discipline</h3>
            <div className="grid grid-cols-2 gap-2">
              <NumberField 
                label="Absences justifiées (h)" 
                value={meta.absJust} 
                onChange={v=>setMeta(m=>({...m,absJust:Number(v)||0}))}
                data-testid="input-justified-absences"
              />
              <NumberField 
                label="Absences non justifiées (h)" 
                value={meta.absNonJust} 
                onChange={v=>setMeta(m=>({...m,absNonJust:Number(v)||0}))}
                data-testid="input-unjustified-absences"
              />
              <NumberField 
                label="Retards (fois)" 
                value={meta.retards} 
                onChange={v=>setMeta(m=>({...m,retards:Number(v)||0}))}
                data-testid="input-lateness"
              />
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
          <div className="bg-gray-50 rounded-xl p-3">
            <h3 className="font-semibold mb-2">Appréciations générales</h3>
            <div className="grid gap-2">
              <LabeledTextArea 
                label="Appréciation du travail de l'élève (points forts / à améliorer)" 
                value={meta.appEleve} 
                onChange={v=>setMeta(m=>({...m,appEleve:v}))} 
                rows={4}
                data-testid="textarea-general-appreciation"
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

        <div className="p-4 flex gap-3 justify-end">
          <button 
            type="button" 
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200" 
            onClick={()=>window.print?.()}
            data-testid="button-print"
          >
            {t('print')}
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90"
            disabled={saveMutation.isPending}
            data-testid="button-save"
          >
            {saveMutation.isPending ? (language === 'fr' ? 'Sauvegarde...' : 'Saving...') : t('save')}
          </button>
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
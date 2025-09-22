import React, { useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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
  if (note20 == null || isNaN(Number(note20))) return "";
  const n = Number(note20);
  const r = performanceGrid.find(g => n >= g.min && n < g.max);
  return r ? r.grade : "";
}

function appreciationFromNote(note20: string | number): string {
  if (note20 == null || isNaN(Number(note20))) return "";
  const n = Number(note20);
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

// ====== TEMPLATES COMPÉTENCES PAR TRIMESTRE ======
// Compétences pré-remplies selon le référentiel africain
const COMPETENCE_TEMPLATES = {
  Premier: {
    ANGLAIS: [
      "Se présenter, parler de la famille et de l'école",
      "Acheter/vendre, découvrir les métiers",
    ].join("\n"),
    INFORMATIQUE: [
      "Identifier matériel/logiciel d'un micro-ordinateur",
      "Connaitre les règles en salle info",
    ].join("\n"),
    FRANÇAIS: [
      "Orthographier et comprendre un dialogue",
      "Écrire une lettre privée (structure et politesse)",
    ].join("\n"),
    MATHÉMATIQUES: [
      "Résoudre des opérations de base (addition, soustraction)",
      "Comprendre les notions de géométrie plane",
    ].join("\n"),
    SCIENCES: [
      "Observer et décrire les phénomènes naturels",
      "Identifier les organes du corps humain",
    ].join("\n"),
    GÉOGRAPHIE: [
      "Se situer dans l'espace et le temps",
      "Identifier les continents et océans",
    ].join("\n"),
    HISTOIRE: [
      "Comprendre les périodes historiques de base",
      "Identifier les personnages historiques importants",
    ].join("\n"),
  },
  Deuxième: {
    ANGLAIS: [
      "Décrire son quotidien, loisirs et habitudes (Present Simple)",
      "Donner/recevoir des indications (directions, lieux)",
    ].join("\n"),
    INFORMATIQUE: [
      "Gestion des fichiers et dossiers (créer, renommer, organiser)",
      "Traitement de texte : mise en forme de base",
    ].join("\n"),
    FRANÇAIS: [
      "Compréhension et résumé d'un récit",
      "Production d'un paragraphe argumentatif simple",
    ].join("\n"),
    MATHÉMATIQUES: [
      "Résoudre des problèmes avec multiplication et division",
      "Comprendre les fractions et pourcentages",
    ].join("\n"),
    SCIENCES: [
      "Expérimenter et analyser des réactions simples",
      "Comprendre les cycles de la vie",
    ].join("\n"),
    GÉOGRAPHIE: [
      "Analyser les climats et reliefs",
      "Comprendre l'organisation territoriale",
    ].join("\n"),
    HISTOIRE: [
      "Analyser les causes et conséquences d'événements",
      "Comprendre l'évolution des sociétés",
    ].join("\n"),
  },
  Troisième: {
    ANGLAIS: [
      "Parler de projets et d'événements passés (Past Simple)",
      "Exprimer des intentions et plans (Futur proche)",
    ].join("\n"),
    INFORMATIQUE: [
      "Présentation : diaporama (insertion d'images/tableaux)",
      "Sensibilisation sécurité numérique (mots de passe, phishing)",
    ].join("\n"),
    FRANÇAIS: [
      "Analyse grammaticale (accords essentiels)",
      "Écriture d'un récit cohérent (début, développement, fin)",
    ].join("\n"),
    MATHÉMATIQUES: [
      "Résoudre des équations du premier degré",
      "Maîtriser les propriétés géométriques avancées",
    ].join("\n"),
    SCIENCES: [
      "Comprendre les lois physiques fondamentales",
      "Analyser les écosystèmes et biodiversité",
    ].join("\n"),
    GÉOGRAPHIE: [
      "Synthèse des connaissances géographiques",
      "Analyser les enjeux du développement durable",
    ].join("\n"),
    HISTOIRE: [
      "Synthèse historique et perspectives d'avenir",
      "Comprendre les enjeux contemporains",
    ].join("\n"),
  },
};

function prefillCompetencesFor(trimester: string) {
  return (prevRows: SubjectRow[]) => prevRows.map(r => ({
    ...r,
    competences: (COMPETENCE_TEMPLATES?.[trimester as keyof typeof COMPETENCE_TEMPLATES]?.[normalizeKey(r.matiere)] || r.competences || "")
  }));
}

function normalizeKey(m: string): string {
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
  competences: string;
  n20: string | number;
  m20: string | number;
  coef: number;
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

  // Extract subjects from API response, fallback to empty array if no data
  const assignedSubjects = useMemo(() => {
    if (!teacherSubjectsData || !teacherSubjectsData.subjects) return [];
    return teacherSubjectsData.subjects.map((subject: any) => ({
      matiere: subject.name || subject.matiere || subject.subject,
      coef: subject.coefficient || subject.coef || 1
    }));
  }, [teacherSubjectsData]);

  const [rows, setRows] = useState<SubjectRow[]>([]);
  
  // Initialize rows when assigned subjects are loaded
  useEffect(() => {
    if (assignedSubjects.length > 0) {
      setRows(assignedSubjects.map(s => ({
        matiere: s.matiere,
        enseignant: "",
        competences: defaultCompetences[s.matiere] || "",
        n20: "",
        m20: "",
        coef: s.coef,
        cote: "",
        appreciation: "",
      })));
    }
  }, [assignedSubjects]);

  const [meta, setMeta] = useState({
    annee: academicYear,
    trimestre: trimestre || "Premier",
    avertissements: 0,
    blames: 0,
    absJust: 0,
    absNonJust: 0,
    retards: 0,
    exclusions: 0,
    consignes: 0,
    appEleve: "",
    visaParent: "",
  });

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
    const withMx = rows.map(r => ({
      ...r,
      m20Num: Number(r.m20) || 0,
      coefNum: Number(r.coef) || 0,
    }));
    const totalCoef = withMx.reduce((s, r) => s + r.coefNum, 0);
    const totalMxCoef = withMx.reduce((s, r) => s + r.m20Num * r.coefNum, 0);
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
      competences: "", 
      n20: "", 
      m20: "", 
      coef: 1, 
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
      return apiRequest('POST', '/api/comprehensive-bulletins/teacher-submission', {
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
      queryClient.invalidateQueries({ queryKey: ['/api/comprehensive-bulletins'] });
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
        cote: r.cote || coteFromNote(r.m20),
        appreciation: r.appreciation || appreciationFromNote(r.m20),
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
                <Th>{t('subject')}</Th>
                <Th>{t('teacher')}</Th>
                <Th className="w-80">{t('competencies')}</Th>
                <Th>{t('grade1')}</Th>
                <Th>{t('grade2')}</Th>
                <Th>{t('coefficient')}</Th>
                <Th>{t('total')}</Th>
                <Th>{t('cote')}</Th>
                <Th className="w-64">{t('appreciation')}</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const mx = round2((Number(r.m20)||0) * (Number(r.coef)||0));
                const cote = r.cote || coteFromNote(r.m20);
                return (
                  <tr key={i} className={i % 2 ? "bg-white" : "bg-gray-50/30"}>
                    <Td>
                      <input 
                        className="w-44 border rounded-lg px-2 py-1" 
                        value={r.matiere} 
                        onChange={e=>updateRow(i,{matiere:e.target.value})} 
                        list="matieres-list"
                        data-testid={`input-subject-${i}`}
                      />
                    </Td>
                    <Td>
                      <input 
                        className="w-44 border rounded-lg px-2 py-1" 
                        value={r.enseignant} 
                        onChange={e=>updateRow(i,{enseignant:e.target.value})} 
                        placeholder="M/Mme…"
                        data-testid={`input-teacher-${i}`}
                      />
                    </Td>
                    <Td>
                      <textarea 
                        className="w-full border rounded-lg px-2 py-1" 
                        rows={2} 
                        value={r.competences} 
                        onChange={e=>updateRow(i,{competences:e.target.value})}
                        data-testid={`textarea-competencies-${i}`}
                      />
                    </Td>
                    <Td>
                      <input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        max="20" 
                        className="w-20 border rounded-lg px-2 py-1" 
                        value={r.n20} 
                        onChange={e=>updateRow(i,{n20:e.target.value})}
                        data-testid={`input-n20-${i}`}
                      />
                    </Td>
                    <Td>
                      <input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        max="20" 
                        className="w-20 border rounded-lg px-2 py-1" 
                        value={r.m20} 
                        onChange={e=>updateRow(i,{m20:e.target.value})}
                        data-testid={`input-m20-${i}`}
                      />
                    </Td>
                    <Td>
                      <input 
                        type="number" 
                        step="1" 
                        min="0" 
                        className="w-16 border rounded-lg px-2 py-1" 
                        value={r.coef} 
                        onChange={e=>updateRow(i,{coef:parseInt(e.target.value) || 0})}
                        data-testid={`input-coef-${i}`}
                      />
                    </Td>
                    <Td>
                      <span className="px-2 py-1 inline-block bg-gray-100 rounded-lg">{mx}</span>
                    </Td>
                    <Td>
                      <input 
                        className="w-16 border rounded-lg px-2 py-1" 
                        value={cote} 
                        onChange={e=>updateRow(i,{cote:e.target.value})}
                        data-testid={`input-cote-${i}`}
                      />
                    </Td>
                    <Td>
                      <textarea 
                        className="w-full border rounded-lg px-2 py-1" 
                        rows={2} 
                        value={r.appreciation} 
                        onChange={e=>updateRow(i,{appreciation:e.target.value})} 
                        placeholder={appreciationFromNote(r.m20)}
                        data-testid={`textarea-appreciation-${i}`}
                      />
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
              <tr className="bg-gray-100 font-semibold">
                <Td colSpan={5}>{language === 'fr' ? 'TOTAL' : 'TOTAL'}</Td>
                <Td>{totals.totalCoef}</Td>
                <Td>{totals.totalMxCoef}</Td>
                <Td>{totals.cote}</Td>
                <Td colSpan={2}></Td>
              </tr>
            </tfoot>
          </table>
        </div>

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
                onChange={v=>setMeta(m=>({...m,absJust:v}))}
                data-testid="input-justified-absences"
              />
              <NumberField 
                label="Absences non justifiées (h)" 
                value={meta.absNonJust} 
                onChange={v=>setMeta(m=>({...m,absNonJust:v}))}
                data-testid="input-unjustified-absences"
              />
              <NumberField 
                label="Retards (fois)" 
                value={meta.retards} 
                onChange={v=>setMeta(m=>({...m,retards:v}))}
                data-testid="input-lateness"
              />
              <NumberField 
                label="Avertissements" 
                value={meta.avertissements} 
                onChange={v=>setMeta(m=>({...m,avertissements:v}))}
                data-testid="input-warnings"
              />
              <NumberField 
                label="Blâmes" 
                value={meta.blames} 
                onChange={v=>setMeta(m=>({...m,blames:v}))}
                data-testid="input-blames"
              />
              <NumberField 
                label="Exclusions (jours)" 
                value={meta.exclusions} 
                onChange={v=>setMeta(m=>({...m,exclusions:v}))}
                data-testid="input-exclusions"
              />
              <NumberField 
                label="Consignes (heures)" 
                value={meta.consignes} 
                onChange={v=>setMeta(m=>({...m,consignes:v}))}
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
// EXACT Ministry of Education CBA Report Card - Pixel Perfect Implementation
import React, { useMemo } from "react";
import { TEACHER_COMMENTS } from './BulletinCreationInterface';

// Smart text compression utilities for single-page fit with 20 subjects
const compressCompetence = (text: string): string => {
  if (!text) return '';
  return text
    .toUpperCase()
    .replace(/\b(DE|DU|LA|LE|LES|UN|UNE|ET|OU|DANS|AVEC|POUR|PAR)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 14);
};

const compressName = (name: string): string => {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].substring(0, 12);
  const initials = parts.slice(0, -1).map(p => p[0]).join('.');
  return `${initials} ${parts[parts.length - 1]}`.substring(0, 12);
};

// ---- Ministry Official Format Compliance ----
const TRIMESTER_TITLES = {
  fr: (t: string) => `${String(t || "PREMIER").toUpperCase()} TRIMESTRE`,
  en: (t: string) => {
    const termMap: Record<string, string> = {
      'PREMIER': 'FIRST',
      'DEUXIÈME': 'SECOND', 
      'TROISIÈME': 'THIRD'
    };
    const englishTerm = termMap[String(t || "PREMIER").toUpperCase()] || 'FIRST';
    return `${englishTerm} TERM PROGRESS RECORD`;
  }
};

// Ministry-required Teacher Comments - imported from BulletinCreationInterface to avoid duplication

// Ministry Performance Grid - EXACT from documents
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

// Bilingual appreciation mapping
const getAppreciationText = (code: string, lang: 'fr' | 'en'): string => {
  const appreciations: Record<string, { fr: string; en: string }> = {
    'CTBA': { fr: 'Compétences Très Bien Acquises', en: 'Competences Very Well Acquired' },
    'CVWA': { fr: 'Compétences Très Bien Acquises', en: 'Competences Very Well Acquired' },
    'CBA': { fr: 'Compétences Bien Acquises', en: 'Competences Well Acquired' },
    'CWA': { fr: 'Compétences Bien Acquises', en: 'Competences Well Acquired' },
    'CA': { fr: 'Compétences Acquises', en: 'Competences Acquired' },
    'CMA': { fr: 'Compétences Moyennement Acquises', en: 'Competences Averagely Acquired' },
    'CAA': { fr: 'Compétences Moyennement Acquises', en: 'Competences Averagely Acquired' },
    'CNA': { fr: 'Compétences Non Acquises', en: 'Competences Not Acquired' }
  };
  return appreciations[code]?.[lang] || code;
};

// EXACT Ministry Header Format - Bilingual Side by Side
const MINISTRY_HEADER = {
  line1: { fr: "RÉPUBLIQUE DU CAMEROUN", en: "REPUBLIC OF CAMEROON" },
  line2: { fr: "Paix – Travail – Patrie", en: "Peace – Work – Fatherland" },
  line3: { fr: "MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES", en: "MINISTRY OF SECONDARY EDUCATION" },
  line4: { fr: "DÉLÉGATION RÉGIONALE DE …", en: "REGIONAL DELEGATION OF…." },
  line5: { fr: "DÉLÉGATION DÉPARTEMENTALE DE…", en: "DIVISIONAL DELEGATION…." },
  line6: { fr: "LYCÉE DE……….", en: "HIGH SCHOOL" }
};

const LABELS = {
  fr: {
    student: "Élève",
    studentId: "Matricule", 
    class: "Classe",
    gender: "Genre",
    birthInfo: "Naissance",
    repeater: "Redoublant",
    homeTeacher: "Prof. principal",
    classSize: "Effectif",
    guardian: "Parents/Tuteurs",
    schoolReg: "Matr. École",
    subject: "Discipline",
    teacher: "Professeur",
    competencies: "Compétences",
    mark: "Note /20",
    coef: "Coef",
    weight: "Poids",
    grade: "Mention",
    remarks: "Appréciations",
    totalCoef: "Total Coef",
    totalWt: "Total Poids",
    overallAvg: "Moy. Gén.",
    overallGrade: "Mention Gén.",
    discipline: "Discipline",
    classProfile: "Profil Classe",
    classCouncil: "Conseil & Visas",
    justifiedAbs: "Abs. just. (h)",
    unjustifiedAbs: "Abs. non just. (h)", 
    lates: "Retards",
    warnings: "Avert.",
    reprimands: "Blâmes",
    exclusions: "Excl. (j)",
    detentions: "Ret. (h)",
    classAvg: "Moy. Classe",
    best: "Meilleur",
    lowest: "Plus faible",
    rank: "Rang",
    decision: "Décision",
    observations: "Observations",
    principal: "Chef d'établissement",
    homeTeacherSig: "Professeur principal",
    parentSig: "Parent/Tuteur",
    schoolStamp: "Cachet École"
  },
  en: {
    student: "Student",
    studentId: "Student ID",
    class: "Class", 
    gender: "Gender",
    birthInfo: "Date & Place of Birth",
    repeater: "Repeater",
    homeTeacher: "Homeroom Teacher",
    classSize: "Class Size",
    guardian: "Guardian / Phone",
    schoolReg: "School Reg.",
    subject: "Subject",
    teacher: "Teacher",
    competencies: "Competencies",
    mark: "Mark /20",
    coef: "Coef",
    weight: "Wt.",
    grade: "Grade",
    remarks: "Remarks",
    totalCoef: "Total Coef",
    totalWt: "Total Wt.",
    overallAvg: "Overall Avg",
    overallGrade: "Overall Grade",
    discipline: "Discipline", 
    classProfile: "Class Profile",
    classCouncil: "Class Council & Visas",
    justifiedAbs: "Justified Absences (h)",
    unjustifiedAbs: "Unjustified Absences (h)",
    lates: "Lates",
    warnings: "Warnings",
    reprimands: "Reprimands", 
    exclusions: "Exclusions (days)",
    detentions: "Detentions (hours)",
    classAvg: "Class Average",
    best: "Best",
    lowest: "Lowest", 
    rank: "Rank",
    decision: "Decision",
    observations: "Observations",
    principal: "Principal / Head of School",
    homeTeacherSig: "Homeroom Teacher", 
    parentSig: "Parent / Guardian", 
    schoolStamp: "School Stamp",
    annualSummary: "Annual Summary",
    trimesterAverages: "Trimester Averages",
    firstTrimester: "1st T.",
    secondTrimester: "2nd T.",
    thirdTrimester: "3rd T.",
    annualAverage: "Annual Average",
    annualRank: "Annual Rank",
    passDecision: "Pass Decision",
    finalAppreciation: "Final Appreciation",
    holidayRecommendations: "Holiday Recommendations"
  }
};

const round2 = (x: number) => Math.round((Number(x) + Number.EPSILON) * 100) / 100;
const QRImg = ({ value = "https://www.educafric.com", size = 64 }: { value?: string; size?: number }) => (
  <img alt="QR" src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`} style={{ width: size, height: size }} />
);
const A4Sheet = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto bg-white" style={{ width: "210mm", minHeight: "297mm" }}>
    {children}
  </div>
);
const Th = ({ children }: { children: React.ReactNode }) => <th className="px-3 py-2 text-left text-[11px] sm:text-xs text-gray-600">{children}</th>;
const Td = ({ children, colSpan, className = "" }: { children: React.ReactNode; colSpan?: number; className?: string }) => <td colSpan={colSpan} className={`px-3 py-2 align-top ${className}`}>{children}</td>;
const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="grid grid-cols-3 text-xs">
    <div className="text-gray-500">{label}</div>
    <div className="col-span-2 font-medium">{value || "—"}</div>
  </div>
);

// Ministry Student Data Format - EXACT requirements
interface StudentData {
  name?: string;
  id?: string; // Unique Identification number
  classLabel?: string;
  classSize?: number; // Class enrolment
  birthDate?: string;
  birthPlace?: string;
  gender?: string;
  headTeacher?: string; // Class master
  guardian?: string; // Parent's/Guardian's name and contact
  generalRemark?: string;
  // NEW: Ministry required fields
  isRepeater?: boolean; // Repeater: Yes/No
  numberOfSubjects?: number; // Number of subjects
  numberOfPassed?: number; // Number passed
  school?: {
    name?: string;
    subtitle?: string;
    officialInfo?: {
      regionaleMinisterielle?: string; // DÉLÉGATION RÉGIONALE DE
      delegationDepartementale?: string; // DÉLÉGATION DÉPARTEMENTALE DE
      boitePostale?: string;
      arrondissement?: string;
    };
  };
  discipline?: {
    absJ?: number; // Justified Abs (h)
    absNJ?: number; // Unjustified Abs. (h)
    late?: number; // Late (nbr of times)
    sanctions?: number; // Conduct Warning/Reprimand/Suspension/Dismissed
    punishmentHours?: number; // Punishment (hours)
  };
}

// Ministry Subject Line Format - EXACT from documents
interface SubjectLine {
  subject: string;
  teacher?: string; // Teacher name - REQUIRED in ministry format
  competenciesEvaluated?: string; // EXACT column from ministry docs
  competence1?: string; // Individual competency 1
  competence2?: string; // Individual competency 2
  competence3?: string; // Individual competency 3
  mk20?: number; // MK/20 column
  av20?: number; // AV/20 column  
  coef: number;
  avXcoef?: number; // AV x coef column
  grade?: string; // GRADE [Min – Max] 
  minMax?: string; // [Min – Max] range
  remarksAndSignature?: string; // Remarks and Teacher's signature
  teacherComments?: string[]; // Per-subject teacher comments (Ministry)
  subjectType?: 'general' | 'scientific' | 'literary' | 'technical' | 'other'; // Subject type for technical schools (5 sections)
  bulletinSection?: 'general' | 'scientific' | 'technical'; // Manual bulletin section mapping for technical schools (overrides subjectType for bulletin grouping)
  // Legacy fields for backward compatibility
  note1?: number;
  moyenneFinale?: number;
  m20: number | string;
  totalPondere?: number;
  notePercent?: number;
  cote?: string;
  competencesEvaluees?: string;
  remark?: string;
}

interface ReportCardProps {
  student?: StudentData;
  lines?: SubjectLine[];
  year?: string;
  trimester?: string;
  schoolLogoUrl?: string;
  studentPhotoUrl?: string;
  qrValue?: string;
  language?: 'fr' | 'en'; // NEW: Language support
  isThirdTrimester?: boolean;
  isTechnicalSchool?: boolean; // DEPRECATED: Use bulletinType instead
  bulletinType?: 'general-fr' | 'general-en' | 'technical-fr' | 'technical-en'; // NEW: Explicit bulletin type selection
  registrationNumber?: string; // School registration number (EDUCAFRIC or government)
  // selectedTeacherComments removed - now using per-subject comments in SubjectLine
  annualSummary?: {
    firstTrimesterAverage: number;
    secondTrimesterAverage: number;
    thirdTrimesterAverage: number;
    annualAverage: number;
    annualRank: number;
    totalStudents: number;
    passDecision: string;
    finalAppreciation: string;
    holidayRecommendations: string;
  } | null;
}

export default function ReportCardPreview({
  student = {},
  lines = [], // [{ subject: "FRANÇAIS", m20: 14.5, coef: 6, remark: "..." }]
  year = "2025/2026",
  trimester = "Premier",
  schoolLogoUrl = "",
  studentPhotoUrl = "",
  qrValue = "https://www.educafric.com",
  language = 'fr', // Default to French
  isThirdTrimester = false,
  isTechnicalSchool = false, // DEPRECATED: Use bulletinType instead
  bulletinType, // NEW: Explicit bulletin type selection
  registrationNumber = "",
  annualSummary = null,
}: ReportCardProps) {
  // Determine effective bulletin type
  const effectiveBulletinType = bulletinType || (isTechnicalSchool ? 'technical-fr' : 'general-fr');
  const entries = useMemo(() => (lines || []).map(x => ({ ...x, coef: Number(x.coef ?? 1) })), [lines]);
  
  // Determine if this is a technical bulletin (shows 3 sections: General, Scientific, Technical only)
  const isTechnicalBulletin = effectiveBulletinType === 'technical-fr' || effectiveBulletinType === 'technical-en';
  
  // Determine if we show 2 columns (only for general-en)
  const showTwoColumns = effectiveBulletinType === 'general-en';
  
  // Group subjects by type for technical schools (3 sections ONLY: General, Scientific, Technical)
  const groupedEntries = useMemo(() => {
    if (!isTechnicalBulletin) {
      return { all: entries };
    }
    
    // Technical bulletins: Only 3 sections (Général, Scientifique, Technique)
    // Literary and Other are NOT displayed
    // Use bulletinSection if defined (manual mapping), otherwise fallback to subjectType
    const general = entries.filter(e => {
      const section = e.bulletinSection || e.subjectType;
      return section === 'general' || !section;
    });
    const scientific = entries.filter(e => {
      const section = e.bulletinSection || e.subjectType;
      return section === 'scientific';
    });
    const technical = entries.filter(e => {
      const section = e.bulletinSection || e.subjectType;
      return section === 'technical';
    });
    
    return { general, scientific, technical };
  }, [entries, isTechnicalBulletin]);
  
  const totalCoef = entries.reduce((s, x) => s + (x.coef || 0), 0);
  const totalMxCoef = entries.reduce((s, x) => s + (Number(x.m20) || 0) * (x.coef || 0), 0);
  const moyenne = totalCoef ? round2(totalMxCoef / totalCoef) : 0;

  // DEBUG LOGS
  console.log('[PREVIEW] effectiveBulletinType:', effectiveBulletinType);
  console.log('[PREVIEW] First line data:', entries[0]);
  console.log('[PREVIEW] Sample mk20:', entries[0]?.mk20);
  console.log('[PREVIEW] Sample av20:', entries[0]?.av20);

  const labels = LABELS[language];

  return (
    <div className="bg-white rounded-2xl shadow p-6 print:shadow-none print:p-0 bulletin-compact print:w-[210mm] print:h-[297mm] print:overflow-hidden print:text-[8px]" data-bulletin-preview="true">
      <A4Sheet>
        <div className="p-2">
          {/* EXACT Ministry Header - Bilingual 3-Column Layout (EN - Logo - FR) */}
          <div className="text-center mb-3 relative header-section">
            <div className="grid grid-cols-3 gap-4">
              {/* Left Column: English */}
              <div className="text-[9px] text-center leading-tight">
                <div className="font-bold mb-0.5">{MINISTRY_HEADER.line1.en}</div>
                <div className="italic mb-1 text-[8px]">{MINISTRY_HEADER.line2.en}</div>
                <div className="mb-1">*************</div>
                <div className="font-semibold mb-1">{MINISTRY_HEADER.line3.en}</div>
                <div className="mb-1">*************</div>
                <div className="font-semibold mb-0.5">{MINISTRY_HEADER.line4.en}</div>
                <div className="mb-1">***********</div>
                <div className="font-semibold mb-0.5">{MINISTRY_HEADER.line5.en}</div>
                <div className="mb-1">*************</div>
                <div className="font-semibold">{MINISTRY_HEADER.line6.en}</div>
              </div>

              {/* Center Column: School Logo and Registration Number */}
              <div className="flex flex-col items-center justify-start gap-1">
                {schoolLogoUrl ? (
                  <img 
                    src={schoolLogoUrl} 
                    alt="School logo" 
                    className="w-20 h-20 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-[7px] text-gray-400 bg-gray-50">
                    LOGO<br/>SCHOOL
                  </div>
                )}
                {registrationNumber && (
                  <div className="text-[8px] font-semibold text-gray-700 mt-1">
                    {registrationNumber}
                  </div>
                )}
              </div>

              {/* Right Column: French */}
              <div className="text-[9px] text-center leading-tight">
                <div className="font-bold mb-0.5">{MINISTRY_HEADER.line1.fr}</div>
                <div className="italic mb-1 text-[8px]">{MINISTRY_HEADER.line2.fr}</div>
                <div className="mb-1">*************</div>
                <div className="font-semibold mb-1">{MINISTRY_HEADER.line3.fr}</div>
                <div className="mb-1">*************</div>
                <div className="font-semibold mb-0.5">{student.school?.officialInfo?.regionaleMinisterielle || MINISTRY_HEADER.line4.fr}</div>
                <div className="mb-1">*************</div>
                <div className="font-semibold mb-0.5">{student.school?.officialInfo?.delegationDepartementale || MINISTRY_HEADER.line5.fr}</div>
                <div className="mb-1">*************</div>
                <div className="font-semibold">{student.school?.name || MINISTRY_HEADER.line6.fr}</div>
              </div>
            </div>
          </div>

          {/* Ministry Required Report Card Title and Year */}
          <div className="text-center mb-3">
            <div className="text-sm font-bold mb-2">{TRIMESTER_TITLES[language](trimester)}</div>
            <div className="text-xs mb-2">{language === 'fr' ? 'Année scolaire' : 'School Year'}: {year}</div>
          </div>

          {/* Ministry Student Information Layout - Photo on LEFT as per PDF */}
          <div className="flex justify-between items-start mb-3 student-info gap-3">
            {/* LEFT: Student Photo - EXACT position as ministry PDF */}
            <div className="flex-shrink-0">
              {studentPhotoUrl ? (
                <img src={studentPhotoUrl} alt="Student's photograph" className="w-20 h-28 object-cover border-2 border-black" onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }} />
              ) : (
                <div className="w-20 h-28 border-2 border-black flex items-center justify-center text-[7px] text-gray-500 bg-gray-50">
                  <div className="text-center">
                    {language === 'fr' ? 'Photo de l\'élève' : 'Student\'s photograph'}
                  </div>
                </div>
              )}
            </div>
            
            {/* RIGHT: Student Information in compact rows */}
            <div className="flex-1 text-[9px] leading-tight">
              {/* First Row */}
              <div className="grid grid-cols-3 gap-3 mb-1.5">
                <div><strong>{language === 'fr' ? 'Nom de l\'élève' : 'Name of Student'}:</strong> {student.name || ""}</div>
                <div><strong>{language === 'fr' ? 'Classe' : 'Class'}:</strong> {student.classLabel || ""}</div>
                <div><strong>{language === 'fr' ? 'Effectif de la classe' : 'Class enrolment'}:</strong> {student.classSize || ""}</div>
              </div>
              
              {/* Second Row */}
              <div className="grid grid-cols-3 gap-3 mb-1.5">
                <div><strong>{language === 'fr' ? 'Date et lieu de naissance' : 'Date and place of birth'}:</strong> {student.birthPlace || ""}</div>
                <div><strong>{language === 'fr' ? 'Genre' : 'Gender'}:</strong> {student.gender || ""}</div>
                <div><strong>{language === 'fr' ? 'Nombre de matières' : 'Number of subjects'}:</strong> {entries.length}</div>
              </div>
              
              {/* Third Row */}
              <div className="grid grid-cols-3 gap-3 mb-1.5">
                <div><strong>{language === 'fr' ? 'Numéro d\'identification unique' : 'Unique Identification number'}:</strong> {student.id || ""}</div>
                <div><strong>{language === 'fr' ? 'Redoublant' : 'Repeater'}:</strong> {student.isRepeater ? (language === 'fr' ? 'Oui' : 'Yes') : (language === 'fr' ? 'Non' : 'No')}</div>
                <div><strong>{language === 'fr' ? 'Nombre réussi' : 'Number passed'}:</strong> {student.numberOfPassed || ""}</div>
              </div>
              
              {/* Fourth Row */}
              <div className="grid grid-cols-2 gap-3">
                <div><strong>{language === 'fr' ? 'Nom et contact des parents/tuteurs' : 'Parent\'s/Guardian\'s name and contact'}:</strong> {student.guardian || ""}</div>
                <div><strong>{language === 'fr' ? 'Professeur principal' : 'Class master'}:</strong> {student.headTeacher || ""}</div>
              </div>
            </div>
          </div>


          {/* TYPE INDICATOR - Visible only on screen, not in print */}
          <div className="mb-2 print:hidden flex items-center gap-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${isTechnicalBulletin ? 'bg-purple-100 text-purple-900 border border-purple-300' : 'bg-blue-100 text-blue-900 border border-blue-300'}`}>
              <span className="font-bold">
                {isTechnicalBulletin ? '🔧' : '📚'}
              </span>
              <span>
                {isTechnicalBulletin 
                  ? (language === 'fr' ? 'École TECHNIQUE - 3 sections (Général, Scientifique, Technique)' : 'TECHNICAL School - 3 sections (General, Scientific, Technical)')
                  : (showTwoColumns 
                    ? (language === 'fr' ? 'École GÉNÉRALE - Deux colonnes N/20 et M/20' : 'GENERAL School - Two columns N/20 and M/20')
                    : (language === 'fr' ? 'École GÉNÉRALE - Une colonne Note/20' : 'GENERAL School - Single Note/20 column')
                  )
                }
              </span>
            </div>
          </div>

          {/* EXACT Ministry Subject Table - MUST match documents precisely */}
          <div className="mt-2 overflow-auto">
            <table className="w-full print:text-[7px] border border-black" style={{lineHeight: isTechnicalBulletin ? '1.0' : '1.3', tableLayout: 'fixed'}}>
              {/* Fixed Column Widths for A4 Fit - Conditional for Technical vs General Schools */}
              {showTwoColumns ? (
                <colgroup>
                  <col style={{ width: '30mm' }} /> {/* Subject+Teacher */}
                  <col style={{ width: '45mm' }} /> {/* Competencies */}
                  <col style={{ width: '10mm' }} /> {/* MK/20 */}
                  <col style={{ width: '10mm' }} /> {/* AV/20 */}
                  <col style={{ width: '8mm' }} />  {/* Coef */}
                  <col style={{ width: '12mm' }} /> {/* AV×Coef */}
                  <col style={{ width: '10mm' }} /> {/* Grade */}
                  <col style={{ width: '16mm' }} /> {/* Remarks */}
                  <col style={{ width: '38mm' }} /> {/* Comments */}
                </colgroup>
              ) : (
                <colgroup>
                  <col style={{ width: '35mm' }} /> {/* Subject+Teacher */}
                  <col style={{ width: '65mm' }} /> {/* Competencies */}
                  <col style={{ width: '16mm' }} /> {/* Note/20 (combined) */}
                  <col style={{ width: '10mm' }} />  {/* Coef */}
                  <col style={{ width: '14mm' }} /> {/* AV×Coef */}
                  <col style={{ width: '14mm' }} /> {/* Grade */}
                  <col style={{ width: '22mm' }} /> {/* Remarks */}
                  <col style={{ width: '24mm' }} /> {/* Comments */}
                </colgroup>
              )}
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-0.5 font-bold text-center text-[5px] print:text-[4px]">
                    {language === 'fr' ? 'Disciplines et noms des enseignants' : 'Subject and Teacher\'s Names'}
                  </th>
                  <th className="border border-black p-0.5 font-bold text-center text-[5px] print:text-[4px]">
                    {language === 'fr' ? 'COMPÉTENCES ÉVALUÉES' : 'COMPETENCIES EVALUATED'}
                  </th>
                  {showTwoColumns ? (
                    <>
                      <th className="border border-black p-0.5 font-bold text-center text-[5px] print:text-[4px]">
                        {language === 'fr' ? 'N/20' : 'MK/20'}
                      </th>
                      <th className="border border-black p-0.5 font-bold text-center text-[5px] print:text-[4px]">
                        {language === 'fr' ? 'M/20' : 'AV/20'}
                      </th>
                    </>
                  ) : (
                    <th className="border border-black p-0.5 font-bold text-center text-[5px] print:text-[4px]">
                      {language === 'fr' ? 'Note/20' : 'Mark/20'}
                    </th>
                  )}
                  <th className="border border-black p-0.5 font-bold text-center text-[5px] print:text-[4px]">
                    Coef
                  </th>
                  <th className="border border-black p-0.5 font-bold text-center text-[5px] print:text-[4px]">
                    {language === 'fr' ? 'M x coef' : 'AV x coef'}
                  </th>
                  <th className="border border-black p-0.5 font-bold text-center text-[5px] print:text-[4px]">
                    {language === 'fr' ? 'COTE [Min - Max]' : 'GRADE [Min - Max]'}
                  </th>
                  <th className="border border-black p-0.5 font-bold text-center text-[5px] print:text-[4px]">
                    {language === 'fr' ? 'Appréciations' : 'Remarks'}
                  </th>
                  <th className="border border-black p-0.5 font-bold text-center text-[5px] print:text-[4px]">
                    {language === 'fr' ? 'COMMENTAIRES' : 'COMMENTS'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Helper function to render a section of subjects */}
                {(() => {
                  const renderSubjectRow = (r: SubjectLine, rowKey: string | number) => {
                    const mk20 = r.mk20 || r.note1 || 0;
                    const av20 = r.av20 || r.moyenneFinale || r.m20 || 0;
                    const avXcoef = round2(Number(av20) * (r.coef || 0));
                    const grade = Number(av20) || 0;
                  
                  // Ministry CBA Grade Calculation
                  const getCBAGrade = (g: number) => {
                    const pct = Math.round((g / 20) * 100);
                    if (pct >= 90) return 'A+';
                    if (pct >= 80) return 'A';
                    if (pct >= 75) return 'B+';
                    if (pct >= 70) return 'B';
                    if (pct >= 60) return 'C+';
                    if (pct >= 50) return 'C';
                    return 'D';
                  };
                  
                  const cote = getCBAGrade(grade);
                  const minMax = r.minMax || '[Min - Max]';
                  
                  const cellPadding = isTechnicalSchool ? "p-0.5" : "p-2";
                  
                  return (
                    <tr key={rowKey}>
                      <td className={`border border-black ${cellPadding} text-[6px]`}>
                        <div className="font-bold">{r.subject}</div>
                        <div className="text-[6px] text-gray-600">{r.teacher || ''}</div>
                      </td>
                      <td className={`border border-black ${cellPadding} text-[6px] leading-tight`}>
                        <div className="space-y-1">
                          {(() => {
                            // Use individual competencies if available, fallback to splitting concatenated string
                            const comp1 = r.competence1;
                            const comp2 = r.competence2;
                            const comp3 = r.competence3;
                            const fallbackParts = !comp1 && !comp2 && !comp3 
                              ? (r.competenciesEvaluated || r.competencesEvaluees || '').split(/;|,/).map(p => p.trim()).filter(Boolean)
                              : [];
                            
                            return (
                              <>
                                {(comp1 || fallbackParts[0]) && (
                                  <div className="text-[6px] font-medium border-b border-gray-200 pb-0.5">
                                    {comp1 || fallbackParts[0]}
                                  </div>
                                )}
                                {(comp2 || fallbackParts[1]) && (
                                  <div className="text-[6px] font-medium border-b border-gray-200 pb-0.5">
                                    {comp2 || fallbackParts[1]}
                                  </div>
                                )}
                                {(comp3 || fallbackParts[2]) && (
                                  <div className="text-[6px] font-medium">
                                    {comp3 || fallbackParts[2]}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </td>
                      {showTwoColumns ? (
                        <>
                          <td className={`border border-black ${cellPadding} text-center text-[6px]`}>
                            {mk20}
                          </td>
                          <td className={`border border-black ${cellPadding} text-center text-[6px] font-bold ${Number(av20) < 10 ? 'text-red-600' : ''}`}>
                            {av20}
                          </td>
                        </>
                      ) : (
                        <td className={`border border-black ${cellPadding} text-center text-[6px] font-bold ${Number(av20) < 10 ? 'text-red-600' : ''}`}>
                          {av20}
                        </td>
                      )}
                      <td className={`border border-black ${cellPadding} text-center text-[6px]`}>
                        {r.coef}
                      </td>
                      <td className={`border border-black ${cellPadding} text-center text-[6px]`}>
                        {r.avXcoef || avXcoef}
                      </td>
                      <td className={`border border-black ${cellPadding} text-center text-[6px] font-bold`}>
                        <div>{r.grade || cote}</div>
                        <div className="text-[5px]">{minMax}</div>
                      </td>
                      <td className={`border border-black ${cellPadding} text-[5px]`}>
                        {(() => {
                          // Hybrid appreciation: Manual custom > Predefined bilingual > Legacy
                          const customApp = (r as any).customAppreciation;
                          if (customApp) return customApp;
                          
                          const remarkCode = r.remark;
                          if (remarkCode) return getAppreciationText(remarkCode, language);
                          
                          return r.remarksAndSignature || '';
                        })()}
                      </td>
                      <td className={`border border-black ${cellPadding} text-[5px] align-top`}>
                        {r.teacherComments && r.teacherComments.length > 0 ? (
                          <ul className="list-decimal list-inside space-y-0.5">
                            {r.teacherComments.map((commentText, index) => (
                              <li key={index} className="text-[4px]">{commentText}</li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-[4px] text-gray-400 italic">
                            {language === 'fr' ? 'Aucun commentaire sélectionné' : 'No comments selected'}
                          </div>
                        )}
                      </td>
                    </tr>
                    );
                  };

                  const renderSectionSubtotal = (sectionName: string, sectionEntries: SubjectLine[]) => {
                    if (sectionEntries.length === 0) return null;
                    
                    const sectionTotalCoef = sectionEntries.reduce((sum, r) => sum + Number(r.coef || 0), 0);
                    const sectionTotalMxCoef = sectionEntries.reduce((sum, r) => {
                      const av20 = r.av20 || r.moyenneFinale || r.m20 || 0;
                      return sum + (Number(av20) * Number(r.coef || 0));
                    }, 0);
                    const sectionMoyenne = sectionTotalCoef > 0 ? round2(sectionTotalMxCoef / sectionTotalCoef) : 0;

                    return (
                      <tr className="bg-blue-50 font-semibold">
                        <td colSpan={2} className="border border-black p-0.5 text-[7px] italic text-blue-700">
                          {language === 'fr' ? `Sous-total - ${sectionName}` : `Subtotal - ${sectionName}`}
                        </td>
                        {showTwoColumns ? (
                          <>
                            <td className="border border-black p-0.5"></td>
                            <td className="border border-black p-0.5"></td>
                          </>
                        ) : (
                          <td className="border border-black p-0.5"></td>
                        )}
                        <td className="border border-black p-0.5 text-center text-[6px] font-bold">{sectionTotalCoef}</td>
                        <td className="border border-black p-0.5 text-center text-[6px] font-bold">{round2(sectionTotalMxCoef)}</td>
                        <td className="border border-black p-0.5 text-center text-[6px] font-bold">{sectionMoyenne}/20</td>
                        <td colSpan={2} className="border border-black p-0.5"></td>
                      </tr>
                    );
                  };

                  // For technical bulletins, render 3 separate sections with subtotals (General, Scientific, Technical ONLY)
                  if (isTechnicalBulletin) {
                    const sectionTitles = {
                      general: language === 'fr' ? 'Matières Générales' : 'General Subjects',
                      scientific: language === 'fr' ? 'Matières Scientifiques' : 'Scientific Subjects',
                      literary: language === 'fr' ? 'Matières Littéraires' : 'Literary Subjects',
                      technical: language === 'fr' ? 'Matières Techniques' : 'Technical Subjects',
                      other: language === 'fr' ? 'Autres Matières' : 'Other Subjects'
                    };

                    let globalIndex = 0;

                    return (
                      <>
                        {/* General Subjects Section */}
                        {groupedEntries.general && groupedEntries.general.length > 0 && (
                          <>
                            <tr className="bg-green-100" key="section-general-header">
                              <td colSpan={9} className="border border-black p-1 font-bold text-[8px] text-green-800">
                                📚 {sectionTitles.general}
                              </td>
                            </tr>
                            {groupedEntries.general.map((r, idx) => {
                              const uniqueKey = `general-${globalIndex++}`;
                              return renderSubjectRow(r, uniqueKey);
                            })}
                            {renderSectionSubtotal(sectionTitles.general, groupedEntries.general)}
                          </>
                        )}

                        {/* Scientific Subjects Section */}
                        {groupedEntries.scientific && groupedEntries.scientific.length > 0 && (
                          <>
                            <tr className="bg-blue-100" key="section-scientific-header">
                              <td colSpan={9} className="border border-black p-1 font-bold text-[8px] text-blue-800">
                                🔬 {sectionTitles.scientific}
                              </td>
                            </tr>
                            {groupedEntries.scientific.map((r, idx) => {
                              const uniqueKey = `scientific-${globalIndex++}`;
                              return renderSubjectRow(r, uniqueKey);
                            })}
                            {renderSectionSubtotal(sectionTitles.scientific, groupedEntries.scientific)}
                          </>
                        )}

                        {/* Technical Subjects Section */}
                        {groupedEntries.technical && groupedEntries.technical.length > 0 && (
                          <>
                            <tr className="bg-orange-100" key="section-technical-header">
                              <td colSpan={9} className="border border-black p-1 font-bold text-[8px] text-orange-800">
                                🔧 {sectionTitles.technical}
                              </td>
                            </tr>
                            {groupedEntries.technical.map((r, idx) => {
                              const uniqueKey = `technical-${globalIndex++}`;
                              return renderSubjectRow(r, uniqueKey);
                            })}
                            {renderSectionSubtotal(sectionTitles.technical, groupedEntries.technical)}
                          </>
                        )}
                      </>
                    );
                  }

                  // For general schools, render all subjects without sections
                  return entries.map((r, idx) => renderSubjectRow(r, `subject-${idx}`));
                })()}
              </tbody>
              <tfoot>
                <tr className="bg-gray-200">
                  <td className="border border-black p-0.5 font-bold text-[6px] text-center">TOTAL</td>
                  <td className="border border-black p-1"></td>
                  {showTwoColumns ? (
                    <>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1"></td>
                    </>
                  ) : (
                    <td className="border border-black p-1"></td>
                  )}
                  <td className="border border-black p-0.5 text-center font-bold text-[6px]">{totalCoef}</td>
                  <td className="border border-black p-0.5 text-center font-bold text-[6px]">{round2(totalMxCoef)}</td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1"></td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="border border-black p-1 font-bold text-[8px]">
                    {language === 'fr' ? 'MOYENNE DE L\'\u00c9LÈVE :' : 'STUDENT AVERAGE :'}
                  </td>
                  <td className={`border border-black p-1 text-center font-bold text-[10px] ${moyenne < 10 ? 'text-red-600' : ''}`}>
                    {moyenne}/20
                  </td>
                  <td colSpan={7} className="border border-black p-1"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Ministry Discipline and Class Profile Section - EXACT format */}
          <div className={isTechnicalBulletin ? "mt-6" : "mt-4"}>
            <table className="w-full text-[8px] border border-black">
              <tbody>
                <tr>
                  <td rowSpan={2} className="border border-black p-1 font-bold text-center w-16">
                    {language === 'fr' ? 'Discipline' : 'Discipline'}
                  </td>
                  <td rowSpan={2} className="border border-black p-1 font-bold text-center w-24">
                    {language === 'fr' ? 'Performance de l\'\u00e9lève' : 'Student performance'}
                  </td>
                  <td rowSpan={2} className="border border-black p-1 font-bold text-center w-24">
                    {language === 'fr' ? 'Profil de la classe' : 'Class Profile'}
                  </td>
                  <td className="border border-black p-1 text-center text-[7px]">
                    {language === 'fr' ? 'Abs. non justifiées (h)' : 'Unjustified Abs. (h)'}
                  </td>
                  <td className="border border-black p-1 text-center font-bold">
                    {student.discipline?.absNJ || 0}
                  </td>
                  <td className="border border-black p-1 text-center text-[7px]">
                    {language === 'fr' ? 'Avertissement' : 'Conduct Warning'}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {(student.discipline as any)?.conductWarning || 0}
                  </td>
                  <td rowSpan={2} className="border border-black p-1 font-bold text-center w-20">
                    {language === 'fr' ? 'SCORE TOTAL' : 'TOTAL SCORE'}
                  </td>
                  <td rowSpan={2} className="border border-black p-1 font-bold text-center w-16">
                    {round2(totalMxCoef)}
                  </td>
                  <td rowSpan={2} className="border border-black p-1 font-bold text-center w-20">
                    {language === 'fr' ? 'OBSERVATION' : 'REMARK'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1 text-center text-[7px]">
                    {language === 'fr' ? 'Abs. justifiées (h)' : 'Justified Abs (h)'}
                  </td>
                  <td className="border border-black p-1 text-center font-bold">
                    {student.discipline?.absJ || 0}
                  </td>
                  <td className="border border-black p-1 text-center text-[7px]">
                    {language === 'fr' ? 'Blâme' : 'Reprimand'}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {(student.discipline as any)?.conductBlame || 0}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold text-center">
                    {language === 'fr' ? 'Moyenne de la classe' : 'Class Average'}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {/* Class average would come from API */}
                    15.2/20
                  </td>
                  <td className="border border-black p-1 text-center">
                    COEF
                  </td>
                  <td className="border border-black p-1 text-center text-[7px]">
                    {language === 'fr' ? 'Retards (nombre)' : 'Late (nbr of times)'}
                  </td>
                  <td className="border border-black p-1 text-center font-bold">
                    {student.discipline?.late || 0}
                  </td>
                  <td className="border border-black p-1 text-center text-[7px]">
                    {language === 'fr' ? 'Suspension' : 'Suspension'}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {(student.discipline as any)?.suspension || 0}
                  </td>
                  <td className="border border-black p-1 font-bold text-center">
                    {language === 'fr' ? 'MOYENNE DU TRIMESTRE' : 'TERM AVERAGE'}
                  </td>
                  <td className={`border border-black p-1 text-center font-bold text-lg ${moyenne < 10 ? 'text-red-600' : 'text-green-700'}`}>
                    {moyenne}/20
                  </td>
                  <td rowSpan={3} className="border border-black p-1 text-[6px] align-top">
                    {student.generalRemark || (language === 'fr' ? 'Observations sur la performance de l\'\u00e9lève' : 'Remarks on student performance')}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1 text-center text-[7px]">
                    {language === 'fr' ? 'Nombre réussi' : 'Number passed'}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {student.numberOfPassed || entries.filter(e => Number(e.m20 || e.av20) >= 10).length}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {totalCoef}
                  </td>
                  <td className="border border-black p-1 text-center text-[7px]">
                    {language === 'fr' ? 'Punition (heures)' : 'Punishment (hours)'}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {student.discipline?.punishmentHours || 0}
                  </td>
                  <td className="border border-black p-1 text-center text-[7px]">
                    {language === 'fr' ? 'Renvoi' : 'Dismissed'}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {(student.discipline as any)?.dismissal || 0}
                  </td>
                  <td className="border border-black p-1 font-bold text-center">
                    {language === 'fr' ? 'Mention' : 'Grade'}
                  </td>
                  <td className="border border-black p-1 text-center font-bold">
                    {moyenne >= 16 ? 'A' : moyenne >= 14 ? 'B' : moyenne >= 12 ? 'C+' : moyenne >= 10 ? 'C' : 'D'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1 text-center text-[7px]">
                    {language === 'fr' ? 'Taux de réussite (%)' : 'Success rate (%)'}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {entries.length ? Math.round((entries.filter(e => Number(e.m20 || e.av20) >= 10).length / entries.length) * 100) : 0}%
                  </td>
                  <td className="border border-black p-1 text-center font-bold">
                    CVWA: {entries.filter(e => Number(e.m20 || e.av20) >= 18).length}<br/>
                    CWA: {entries.filter(e => Number(e.m20 || e.av20) >= 14 && Number(e.m20 || e.av20) < 18).length}<br/>
                    CA: {entries.filter(e => Number(e.m20 || e.av20) >= 10 && Number(e.m20 || e.av20) < 14).length}<br/>
                    CAA: {entries.filter(e => Number(e.m20 || e.av20) < 10).length}
                  </td>
                  <td colSpan={2} className="border border-black p-1 text-[6px] align-top">
                    <div className="font-bold mb-1">
                      {language === 'fr' ? 'Conseil de Classe:' : 'Class Council:'}
                    </div>
                    <div className="text-[5px] space-y-1">
                      <div>{language === 'fr' ? 'Décision:' : 'Decision:'} ____________</div>
                      <div>{language === 'fr' ? 'Date:' : 'Date:'} ____________</div>
                    </div>
                  </td>
                  <td className="border border-black p-1 text-[6px] align-top">
                    <div className="font-bold mb-1">
                      {language === 'fr' ? 'Signatures Directeur:' : 'Principal Signatures:'}
                    </div>
                    <div className="text-[5px] space-y-1">
                      <div>{language === 'fr' ? 'Directeur:' : 'Principal:'} ____________</div>
                    </div>
                  </td>
                  <td colSpan={2} className="border border-black p-1 text-[6px] align-top">
                    <div className="font-bold mb-1">
                      {language === 'fr' ? 'Signature Parent:' : 'Parent Signature:'}
                    </div>
                    <div className="text-[5px] space-y-1">
                      <div>{language === 'fr' ? 'Parent:' : 'Parent:'} ____________</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>


          {/* Third Trimester Annual Summary */}
          {isThirdTrimester && annualSummary && (
            <div className={`${isTechnicalBulletin ? "mt-6" : "mt-10"} border-2 border-orange-300 rounded-xl p-4 bg-orange-50`}>
              <h3 className="text-lg font-semibold text-orange-800 mb-3">
                {language === 'fr' ? 'Résumé Annuel' : 'Annual Summary'}
              </h3>
              
              {/* Trimester Averages */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-xs text-gray-600">
                    {language === 'fr' ? '1er T.' : '1st T.'}
                  </div>
                  <div className={`text-sm font-semibold ${annualSummary.firstTrimesterAverage < 10 ? 'text-red-600' : ''}`}>{annualSummary.firstTrimesterAverage}/20</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600">
                    {language === 'fr' ? '2e T.' : '2nd T.'}
                  </div>
                  <div className={`text-sm font-semibold ${annualSummary.secondTrimesterAverage < 10 ? 'text-red-600' : ''}`}>{annualSummary.secondTrimesterAverage}/20</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600">
                    {language === 'fr' ? '3e T.' : '3rd T.'}
                  </div>
                  <div className={`text-sm font-semibold ${annualSummary.thirdTrimesterAverage < 10 ? 'text-red-600' : ''}`}>{annualSummary.thirdTrimesterAverage}/20</div>
                </div>
                <div className="text-center bg-white rounded border p-2">
                  <div className="text-xs text-orange-700 font-medium">
                    {language === 'fr' ? 'Moyenne Annuelle' : 'Annual Average'}
                  </div>
                  <div className={`text-lg font-bold ${annualSummary.annualAverage < 10 ? 'text-red-600' : 'text-orange-800'}`}>{annualSummary.annualAverage}/20</div>
                </div>
              </div>

              {/* Annual Rank and Pass Decision */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center border rounded p-2">
                  <div className="text-xs text-gray-600">
                    {language === 'fr' ? 'Rang Annuel' : 'Annual Rank'}
                  </div>
                  <div className="text-sm font-semibold">{annualSummary.annualRank}e / {annualSummary.totalStudents}</div>
                </div>
                <div className="text-center border rounded p-2">
                  <div className="text-xs text-gray-600">
                    {language === 'fr' ? 'Décision de Passage' : 'Pass Decision'}
                  </div>
                  <div className={`text-sm font-bold ${
                    annualSummary.passDecision === 'PASSE' ? 'text-green-700' : 
                    annualSummary.passDecision === 'REDOUBLE' ? 'text-orange-700' : 'text-red-700'
                  }`}>
                    {annualSummary.passDecision}
                  </div>
                </div>
              </div>

              {/* Final Appreciation */}
              {annualSummary.finalAppreciation && (
                <div className="mb-3">
                  <div className="text-xs text-gray-600 font-medium">
                    {language === 'fr' ? 'Appréciation Finale' : 'Final Appreciation'}
                  </div>
                  <div className="text-sm italic bg-white border rounded p-2">{annualSummary.finalAppreciation}</div>
                </div>
              )}

              {/* Holiday Recommendations */}
              {annualSummary.holidayRecommendations && (
                <div>
                  <div className="text-xs text-gray-600 font-medium">
                    {language === 'fr' ? 'Recommandations pour les Vacances' : 'Holiday Recommendations'}
                  </div>
                  <div className="text-sm bg-white border rounded p-2">{annualSummary.holidayRecommendations}</div>
                </div>
              )}
            </div>
          )}

          {/* Verification Code */}
          {(student as any).verificationCode && (
            <div className={`${isTechnicalBulletin ? "mt-4" : "mt-6"} flex justify-center`}>
              <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-3 w-64">
                <div className="text-xs text-blue-700 text-center font-medium">{language === 'fr' ? 'Code de Vérification' : 'Verification Code'}</div>
                <div className="text-lg font-bold text-blue-800 text-center">{(student as any).verificationCode}</div>
                <div className="text-xs text-blue-600 text-center mt-1">{language === 'fr' ? 'Vérifiez sur educafric.com/verify' : 'Verify on educafric.com/verify'}</div>
              </div>
            </div>
          )}

        </div>
      </A4Sheet>

    </div>
  );
}
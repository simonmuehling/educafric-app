// EXACT Ministry of Education CBA Report Card - Pixel Perfect Implementation
import React, { useMemo } from "react";
import { TEACHER_COMMENTS } from './BulletinCreationInterface';
import { EducafricFooterCompact } from '../shared/EducafricFooter';

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
  <div className="mx-auto bg-white a4-container" style={{ 
    width: "210mm", 
    minHeight: "297mm",
    maxHeight: "297mm",
    overflow: "hidden",
    boxSizing: "border-box"
  }}>
    {children}
  </div>
);
const Th = ({ children }: { children: React.ReactNode }) => <th className="px-3 py-2 text-left text-[13px] sm:text-sm text-gray-600">{children}</th>;
const Td = ({ children, colSpan, className = "" }: { children: React.ReactNode; colSpan?: number; className?: string }) => <td colSpan={colSpan} className={`px-3 py-2 align-top text-[12px] ${className}`}>{children}</td>;
const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="grid grid-cols-3 text-sm">
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
  subjectType?: 'general' | 'scientific' | 'literary' | 'professional' | 'other'; // Subject type for technical schools (5 sections)
  bulletinSection?: 'general' | 'scientific' | 'literary' | 'professional' | 'other'; // Manual bulletin section mapping for technical schools (overrides subjectType for bulletin grouping)
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
  
  // Group subjects by type for technical schools (5 distinct sections)
  const groupedEntries = useMemo(() => {
    if (!isTechnicalBulletin) {
      return { all: entries };
    }
    
    // Technical bulletins: 5 distinct sections based on bulletinSection/subjectType
    // Each type displays as its own section (no mapping)
    const general = entries.filter(e => {
      const section = e.bulletinSection || e.subjectType;
      return section === 'general';
    });
    const literary = entries.filter(e => {
      const section = e.bulletinSection || e.subjectType;
      return section === 'literary';
    });
    const scientific = entries.filter(e => {
      const section = e.bulletinSection || e.subjectType;
      return section === 'scientific';
    });
    const professional = entries.filter(e => {
      const section = e.bulletinSection || e.subjectType;
      return section === 'professional';
    });
    const other = entries.filter(e => {
      const section = e.bulletinSection || e.subjectType;
      return section === 'other';
    });
    
    return { general, literary, scientific, professional, other };
  }, [entries, isTechnicalBulletin]);
  
  const totalCoef = entries.reduce((s, x) => s + (x.coef || 0), 0);
  const totalMxCoef = entries.reduce((s, x) => s + (Number(x.m20) || 0) * (x.coef || 0), 0);
  const moyenne = totalCoef ? round2(totalMxCoef / totalCoef) : 0;

  // DEBUG LOGS
  console.log('[PREVIEW] effectiveBulletinType:', effectiveBulletinType);
  console.log('[PREVIEW] First line data:', entries[0]);
  console.log('[PREVIEW] Sample mk20:', entries[0]?.mk20);
  console.log('[PREVIEW] Sample av20:', entries[0]?.av20);
  console.log('[PREVIEW] Competence1:', entries[0]?.competence1);
  console.log('[PREVIEW] Competence2:', entries[0]?.competence2);
  console.log('[PREVIEW] Competence3:', entries[0]?.competence3);
  console.log('[PREVIEW] All entries competences:', entries.map(e => ({ subject: e.subject, c1: e.competence1, c2: e.competence2, c3: e.competence3 })));

  const labels = LABELS[language];

  return (
    <div className="bg-white rounded-2xl shadow p-4 print:shadow-none print:p-0 bulletin-a4-optimized print:w-[198mm] print:max-h-[285mm] print:overflow-hidden" data-bulletin-preview="true">
      <A4Sheet>
        <div className="p-2 print:p-[2mm]">
          {/* EXACT Ministry Header - Bilingual 3-Column Layout (EN - Logo - FR) - PRINT OPTIMIZED */}
          <div className="text-center mb-2 relative ministry-header">
            <div className="grid grid-cols-3 gap-2">
              {/* Left Column: English */}
              <div className="ministry-header-text text-[10px] text-center leading-snug">
                <div className="ministry-header-title font-bold">{MINISTRY_HEADER.line1.en}</div>
                <div className="italic text-[9px]">{MINISTRY_HEADER.line2.en}</div>
                <div className="text-[8px]">***</div>
                <div className="font-semibold text-[9px]">{MINISTRY_HEADER.line3.en}</div>
                <div className="text-[8px]">***</div>
                <div className="font-semibold text-[9px]">{MINISTRY_HEADER.line4.en}</div>
                <div className="font-semibold text-[9px]">{MINISTRY_HEADER.line5.en}</div>
                <div className="font-bold text-[10px]">{MINISTRY_HEADER.line6.en}</div>
              </div>

              {/* Center Column: School Logo and Registration Number */}
              <div className="flex flex-col items-center justify-center">
                {schoolLogoUrl ? (
                  <img 
                    src={schoolLogoUrl} 
                    alt="School logo" 
                    className="school-logo w-16 h-16 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="school-logo w-16 h-16 border border-dashed border-gray-300 rounded flex items-center justify-center text-[8px] text-gray-400 bg-gray-50">
                    LOGO
                  </div>
                )}
                {registrationNumber && (
                  <div className="text-[9px] font-semibold text-gray-700 mt-1">
                    {registrationNumber}
                  </div>
                )}
              </div>

              {/* Right Column: French */}
              <div className="ministry-header-text text-[10px] text-center leading-snug">
                <div className="ministry-header-title font-bold">{MINISTRY_HEADER.line1.fr}</div>
                <div className="italic text-[9px]">{MINISTRY_HEADER.line2.fr}</div>
                <div className="text-[8px]">***</div>
                <div className="font-semibold text-[9px]">{MINISTRY_HEADER.line3.fr}</div>
                <div className="text-[8px]">***</div>
                <div className="font-semibold text-[9px]">{student.school?.officialInfo?.regionaleMinisterielle || MINISTRY_HEADER.line4.fr}</div>
                <div className="font-semibold text-[9px]">{student.school?.officialInfo?.delegationDepartementale || MINISTRY_HEADER.line5.fr}</div>
                <div className="font-bold text-[10px]">{student.school?.name || MINISTRY_HEADER.line6.fr}</div>
              </div>
            </div>
          </div>

          {/* Ministry Required Report Card Title and Year */}
          <div className="text-center mb-2 bulletin-title">
            <div className="text-[12px] font-bold">{TRIMESTER_TITLES[language](trimester)}</div>
            <div className="text-[10px]">{language === 'fr' ? 'Année scolaire' : 'School Year'}: {year}</div>
          </div>

          {/* Ministry Student Information Layout - Photo on LEFT - COMPACT */}
          <div className="flex items-start mb-2 student-info-grid gap-2 border border-gray-300 p-2 rounded">
            {/* LEFT: Student Photo */}
            <div className="flex-shrink-0">
              {studentPhotoUrl ? (
                <img src={studentPhotoUrl} alt="Student's photograph" className="student-photo w-16 h-20 object-cover border border-black" onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }} />
              ) : (
                <div className="student-photo w-16 h-20 border border-black flex items-center justify-center text-[8px] text-gray-500 bg-gray-50">
                  <div className="text-center">PHOTO</div>
                </div>
              )}
            </div>
            
            {/* RIGHT: Student Information - COMPACT 2 columns */}
            <div className="flex-1 text-[10px] leading-snug">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div><strong>{language === 'fr' ? 'Nom' : 'Name'}:</strong> {student.name || ""}</div>
                <div><strong>{language === 'fr' ? 'Classe' : 'Class'}:</strong> {student.classLabel || ""} ({student.classSize || ""})</div>
                <div><strong>{language === 'fr' ? 'Né(e) le' : 'Born'}:</strong> {student.birthPlace || ""}</div>
                <div><strong>{language === 'fr' ? 'Genre' : 'Gender'}:</strong> {student.gender || ""}</div>
                <div><strong>{language === 'fr' ? 'Matricule' : 'ID'}:</strong> {student.id || ""}</div>
                <div><strong>{language === 'fr' ? 'Redoublant' : 'Repeater'}:</strong> {student.isRepeater ? (language === 'fr' ? 'Oui' : 'Yes') : (language === 'fr' ? 'Non' : 'No')}</div>
                <div><strong>{language === 'fr' ? 'Parent/Tuteur' : 'Guardian'}:</strong> {student.guardian || ""}</div>
                <div><strong>{language === 'fr' ? 'Prof. principal' : 'Class master'}:</strong> {student.headTeacher || ""}</div>
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

          {/* MAIN CONTENT - Flex grow to fill A4 page */}
          <div className="bulletin-main-content">
          {/* EXACT Ministry Subject Table - A4 PRINT OPTIMIZED */}
          <div className="mt-1 grades-table-wrapper">
            <table className="w-full border border-black" style={{lineHeight: '1.2', tableLayout: 'fixed', borderCollapse: 'collapse'}}>
              {/* Fixed Column Widths for A4 Fit - Optimized for readability */}
              {showTwoColumns ? (
                <colgroup><col style={{ width: '22%' }} /><col style={{ width: '24%' }} /><col style={{ width: '7%' }} /><col style={{ width: '7%' }} /><col style={{ width: '6%' }} /><col style={{ width: '8%' }} /><col style={{ width: '8%' }} /><col style={{ width: '9%' }} /><col style={{ width: '9%' }} /></colgroup>
              ) : (
                <colgroup><col style={{ width: '20%' }} /><col style={{ width: '28%' }} /><col style={{ width: '8%' }} /><col style={{ width: '7%' }} /><col style={{ width: '9%' }} /><col style={{ width: '10%' }} /><col style={{ width: '9%' }} /><col style={{ width: '9%' }} /></colgroup>
              )}
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black px-1 py-0.5 font-bold text-center text-[9px]">
                    {language === 'fr' ? 'Matière / Enseignant' : 'Subject / Teacher'}
                  </th>
                  <th className="border border-black px-1 py-0.5 font-bold text-center text-[9px]">
                    {language === 'fr' ? 'Compétences' : 'Competencies'}
                  </th>
                  {showTwoColumns ? (
                    <>
                      <th className="border border-black px-0.5 py-0.5 font-bold text-center text-[9px]">
                        N/20
                      </th>
                      <th className="border border-black px-0.5 py-0.5 font-bold text-center text-[9px]">
                        M/20
                      </th>
                    </>
                  ) : (
                    <th className="border border-black px-0.5 py-0.5 font-bold text-center text-[9px]">
                      {language === 'fr' ? 'Note' : 'Mark'}
                    </th>
                  )}
                  <th className="border border-black px-0.5 py-0.5 font-bold text-center text-[9px]">
                    Coef
                  </th>
                  <th className="border border-black px-0.5 py-0.5 font-bold text-center text-[9px]">
                    {language === 'fr' ? 'Total' : 'Total'}
                  </th>
                  <th className="border border-black px-0.5 py-0.5 font-bold text-center text-[9px]">
                    {language === 'fr' ? 'Cote' : 'Grade'}
                  </th>
                  <th className="border border-black px-0.5 py-0.5 font-bold text-center text-[9px]">
                    {language === 'fr' ? 'Appréciation' : 'Remarks'}
                  </th>
                  <th className="border border-black px-0.5 py-0.5 font-bold text-center text-[9px]">
                    {language === 'fr' ? 'Obs.' : 'Comments'}
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
                  
                  return (
                    <tr key={rowKey}>
                      <td className="border border-black px-1 py-0.5">
                        <div className="subject-name text-[9px] font-semibold">{r.subject}</div>
                        <div className="teacher-name text-[8px] text-gray-600">{r.teacher || ''}</div>
                      </td>
                      <td className="border border-black px-1 py-0.5 competency-text text-[8px] leading-tight">
                        {(() => {
                          const comp1 = r.competence1;
                          const comp2 = r.competence2;
                          const comp3 = r.competence3;
                          const fallbackParts = !comp1 && !comp2 && !comp3 
                            ? (r.competenciesEvaluated || r.competencesEvaluees || '').split(/;|,/).map(p => p.trim()).filter(Boolean)
                            : [];
                          
                          return (
                            <div className="space-y-0.5">
                              {(comp1 || fallbackParts[0]) && <div>{comp1 || fallbackParts[0]}</div>}
                              {(comp2 || fallbackParts[1]) && <div>{comp2 || fallbackParts[1]}</div>}
                              {(comp3 || fallbackParts[2]) && <div>{comp3 || fallbackParts[2]}</div>}
                            </div>
                          );
                        })()}
                      </td>
                      {showTwoColumns ? (
                        <>
                          <td className="border border-black px-0.5 py-0.5 text-center grade-value text-[9px]">
                            {mk20}
                          </td>
                          <td className={`border border-black px-0.5 py-0.5 text-center grade-value text-[9px] font-bold ${Number(av20) < 10 ? 'grade-fail text-red-600' : ''}`}>
                            {av20}
                          </td>
                        </>
                      ) : (
                        <td className={`border border-black px-0.5 py-0.5 text-center grade-value text-[9px] font-bold ${Number(av20) < 10 ? 'grade-fail text-red-600' : ''}`}>
                          {av20}
                        </td>
                      )}
                      <td className="border border-black px-0.5 py-0.5 text-center text-[9px]">
                        {r.coef}
                      </td>
                      <td className="border border-black px-0.5 py-0.5 text-center text-[9px] font-semibold">
                        {r.avXcoef || avXcoef}
                      </td>
                      <td className="border border-black px-0.5 py-0.5 text-center text-[9px] font-bold">
                        {r.grade || cote}
                      </td>
                      <td className="border border-black px-0.5 py-0.5 appreciation-text text-[8px]">
                        {(() => {
                          const customApp = (r as any).customAppreciation;
                          if (customApp) return customApp;
                          const remarkCode = r.remark;
                          if (remarkCode) return getAppreciationText(remarkCode, language);
                          return r.remarksAndSignature || '';
                        })()}
                      </td>
                      <td className="border border-black px-0.5 py-0.5 text-[8px] align-top">
                        {r.teacherComments && r.teacherComments.length > 0 ? (
                          <div className="text-[8px] leading-tight">
                            {r.teacherComments.slice(0, 2).map((c, i) => (
                              <div key={i}>{i + 1}. {c}</div>
                            ))}
                          </div>
                        ) : null}
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
                        <td colSpan={2} className="border border-black px-1 py-0.5 text-[9px] italic text-blue-700">
                          {language === 'fr' ? `Sous-total ${sectionName}` : `Subtotal ${sectionName}`}
                        </td>
                        {showTwoColumns ? (
                          <>
                            <td className="border border-black px-0.5 py-0.5"></td>
                            <td className="border border-black px-0.5 py-0.5"></td>
                          </>
                        ) : (
                          <td className="border border-black px-0.5 py-0.5"></td>
                        )}
                        <td className="border border-black px-0.5 py-0.5 text-center text-[9px] font-bold">{sectionTotalCoef}</td>
                        <td className="border border-black px-0.5 py-0.5 text-center text-[9px] font-bold">{round2(sectionTotalMxCoef)}</td>
                        <td className="border border-black px-0.5 py-0.5 text-center text-[9px] font-bold">{sectionMoyenne}/20</td>
                        <td colSpan={2} className="border border-black px-0.5 py-0.5"></td>
                      </tr>
                    );
                  };

                  // For technical bulletins, render 3 separate sections with subtotals (General, Scientific, Technical ONLY)
                  if (isTechnicalBulletin) {
                    const sectionTitles = {
                      general: language === 'fr' ? 'Matières Générales' : 'General Subjects',
                      scientific: language === 'fr' ? 'Matières Scientifiques' : 'Scientific Subjects',
                      literary: language === 'fr' ? 'Matières Littéraires' : 'Literary Subjects',
                      professional: language === 'fr' ? 'Matières Professionnelles' : 'Professional Subjects',
                      other: language === 'fr' ? 'Autres Matières' : 'Other Subjects'
                    };

                    let globalIndex = 0;

                    return (
                      <>
                        {/* General Subjects Section */}
                        {groupedEntries.general && groupedEntries.general.length > 0 && (
                          <>
                            <tr className="bg-green-100" key="section-general-header">
                              <td colSpan={9} className="border border-black px-1 py-0.5 font-bold text-[9px] text-green-800">
                                {sectionTitles.general}
                              </td>
                            </tr>
                            {groupedEntries.general.map((r, idx) => {
                              const uniqueKey = `general-${globalIndex++}`;
                              return renderSubjectRow(r, uniqueKey);
                            })}
                            {renderSectionSubtotal(sectionTitles.general, groupedEntries.general)}
                          </>
                        )}

                        {/* Literary Subjects Section */}
                        {groupedEntries.literary && groupedEntries.literary.length > 0 && (
                          <>
                            <tr className="bg-purple-100" key="section-literary-header">
                              <td colSpan={9} className="border border-black px-1 py-0.5 font-bold text-[9px] text-purple-800">
                                {sectionTitles.literary}
                              </td>
                            </tr>
                            {groupedEntries.literary.map((r, idx) => {
                              const uniqueKey = `literary-${globalIndex++}`;
                              return renderSubjectRow(r, uniqueKey);
                            })}
                            {renderSectionSubtotal(sectionTitles.literary, groupedEntries.literary)}
                          </>
                        )}

                        {/* Scientific Subjects Section */}
                        {groupedEntries.scientific && groupedEntries.scientific.length > 0 && (
                          <>
                            <tr className="bg-blue-100" key="section-scientific-header">
                              <td colSpan={9} className="border border-black px-1 py-0.5 font-bold text-[9px] text-blue-800">
                                {sectionTitles.scientific}
                              </td>
                            </tr>
                            {groupedEntries.scientific.map((r, idx) => {
                              const uniqueKey = `scientific-${globalIndex++}`;
                              return renderSubjectRow(r, uniqueKey);
                            })}
                            {renderSectionSubtotal(sectionTitles.scientific, groupedEntries.scientific)}
                          </>
                        )}

                        {/* Professional Subjects Section */}
                        {groupedEntries.professional && groupedEntries.professional.length > 0 && (
                          <>
                            <tr className="bg-orange-100" key="section-professional-header">
                              <td colSpan={9} className="border border-black px-1 py-0.5 font-bold text-[9px] text-orange-800">
                                {sectionTitles.professional}
                              </td>
                            </tr>
                            {groupedEntries.professional.map((r, idx) => {
                              const uniqueKey = `professional-${globalIndex++}`;
                              return renderSubjectRow(r, uniqueKey);
                            })}
                            {renderSectionSubtotal(sectionTitles.professional, groupedEntries.professional)}
                          </>
                        )}

                        {/* Other Subjects Section */}
                        {groupedEntries.other && groupedEntries.other.length > 0 && (
                          <>
                            <tr className="bg-pink-100" key="section-other-header">
                              <td colSpan={9} className="border border-black px-1 py-0.5 font-bold text-[9px] text-pink-800">
                                {sectionTitles.other}
                              </td>
                            </tr>
                            {groupedEntries.other.map((r, idx) => {
                              const uniqueKey = `other-${globalIndex++}`;
                              return renderSubjectRow(r, uniqueKey);
                            })}
                            {renderSectionSubtotal(sectionTitles.other, groupedEntries.other)}
                          </>
                        )}
                      </>
                    );
                  }

                  // For general schools, render all subjects without sections
                  const subjectRows = entries.map((r, idx) => renderSubjectRow(r, `subject-${idx}`));
                  
                  // Add filler rows to fill A4 page (minimum 15 rows for proper page fill)
                  const MIN_ROWS = 15;
                  const fillerRowsNeeded = Math.max(0, MIN_ROWS - entries.length);
                  const fillerRows = Array.from({ length: fillerRowsNeeded }, (_, idx) => (
                    <tr key={`filler-${idx}`} className="empty-filler-row">
                      <td className="border border-black px-1 py-2 text-[9px]">&nbsp;</td>
                      <td className="border border-black px-1 py-2 text-[8px]">&nbsp;</td>
                      {showTwoColumns ? (
                        <>
                          <td className="border border-black px-0.5 py-2 text-center">&nbsp;</td>
                          <td className="border border-black px-0.5 py-2 text-center">&nbsp;</td>
                        </>
                      ) : (
                        <td className="border border-black px-0.5 py-2 text-center">&nbsp;</td>
                      )}
                      <td className="border border-black px-0.5 py-2 text-center">&nbsp;</td>
                      <td className="border border-black px-0.5 py-2 text-center">&nbsp;</td>
                      <td className="border border-black px-0.5 py-2 text-center">&nbsp;</td>
                      <td className="border border-black px-0.5 py-2">&nbsp;</td>
                      <td className="border border-black px-0.5 py-2">&nbsp;</td>
                    </tr>
                  ));
                  
                  return [...subjectRows, ...fillerRows];
                })()}
              </tbody>
              <tfoot>
                <tr className="bg-gray-200">
                  <td className="border border-black px-1 py-0.5 font-bold text-[10px] text-center">TOTAL</td>
                  <td className="border border-black px-0.5 py-0.5"></td>
                  {showTwoColumns ? (
                    <>
                      <td className="border border-black px-0.5 py-0.5"></td>
                      <td className="border border-black px-0.5 py-0.5"></td>
                    </>
                  ) : (
                    <td className="border border-black px-0.5 py-0.5"></td>
                  )}
                  <td className="border border-black px-0.5 py-0.5 text-center font-bold text-[10px]">{totalCoef}</td>
                  <td className="border border-black px-0.5 py-0.5 text-center font-bold text-[10px]">{round2(totalMxCoef)}</td>
                  <td className="border border-black px-0.5 py-0.5"></td>
                  <td className="border border-black px-0.5 py-0.5"></td>
                  <td className="border border-black px-0.5 py-0.5"></td>
                </tr>
                <tr className="bg-yellow-50">
                  <td colSpan={2} className="border border-black px-1 py-1 font-bold text-[11px]">
                    {language === 'fr' ? 'MOYENNE GÉNÉRALE' : 'OVERALL AVERAGE'}
                  </td>
                  <td colSpan={showTwoColumns ? 3 : 2} className={`border border-black px-1 py-1 text-center font-bold text-[12px] ${moyenne < 10 ? 'text-red-600 bg-red-50' : 'text-green-700 bg-green-50'}`}>
                    {moyenne}/20
                  </td>
                  <td colSpan={4} className="border border-black px-1 py-1 text-[10px]">
                    <strong>{language === 'fr' ? 'Mention:' : 'Grade:'}</strong> {moyenne >= 16 ? 'A' : moyenne >= 14 ? 'B' : moyenne >= 12 ? 'C+' : moyenne >= 10 ? 'C' : 'D'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Ministry Discipline and Class Profile Section - COMPACT A4 */}
          <div className="mt-2 summary-section">
            <table className="w-full text-[9px] border border-black" style={{borderCollapse: 'collapse', tableLayout: 'fixed'}}>
              <colgroup>
                <col style={{width: '8%'}} />
                <col style={{width: '12%'}} />
                <col style={{width: '10%'}} />
                <col style={{width: '8%'}} />
                <col style={{width: '6%'}} />
                <col style={{width: '8%'}} />
                <col style={{width: '6%'}} />
                <col style={{width: '12%'}} />
                <col style={{width: '10%'}} />
                <col style={{width: '20%'}} />
              </colgroup>
              <tbody>
                <tr>
                  <td rowSpan={2} className="border border-black p-1 font-bold text-center">
                    {language === 'fr' ? 'Discipline' : 'Discipline'}
                  </td>
                  <td rowSpan={2} className="border border-black p-1 font-bold text-center">
                    {language === 'fr' ? 'Performance' : 'Performance'}
                  </td>
                  <td rowSpan={2} className="border border-black p-1 font-bold text-center">
                    {language === 'fr' ? 'Profil' : 'Profile'}
                  </td>
                  <td className="border border-black p-1 text-center text-[8px]">
                    {language === 'fr' ? 'Abs. NJ' : 'Unj. Abs'}
                  </td>
                  <td className="border border-black p-1 text-center font-bold text-[8px]">
                    {student.discipline?.absNJ || 0}
                  </td>
                  <td className="border border-black p-1 text-center text-[8px]">
                    {language === 'fr' ? 'Avert.' : 'Warn'}
                  </td>
                  <td className="border border-black p-1 text-center text-[8px]">
                    {(student.discipline as any)?.conductWarning || 0}
                  </td>
                  <td rowSpan={2} className="border border-black p-1 font-bold text-center">
                    {language === 'fr' ? 'SCORE' : 'SCORE'}
                  </td>
                  <td rowSpan={2} className="border border-black p-1 font-bold text-center text-[10px]">
                    {round2(totalMxCoef)}
                  </td>
                  <td rowSpan={2} className="border border-black p-1 font-bold text-center">
                    {language === 'fr' ? 'OBSERVATION' : 'REMARK'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1 text-center text-[8px]">
                    {language === 'fr' ? 'Abs. J (h)' : 'Just. Abs'}
                  </td>
                  <td className="border border-black p-1 text-center font-bold text-[8px]">
                    {student.discipline?.absJ || 0}
                  </td>
                  <td className="border border-black p-1 text-center text-[8px]">
                    {language === 'fr' ? 'Blâme' : 'Blame'}
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
                  <td className="border border-black p-1 text-center text-[8px]">
                    {language === 'fr' ? 'Retards' : 'Late'}
                  </td>
                  <td className="border border-black p-1 text-center font-bold text-[8px]">
                    {student.discipline?.late || 0}
                  </td>
                  <td className="border border-black p-1 text-center text-[8px]">
                    {language === 'fr' ? 'Susp.' : 'Susp.'}
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
                  <td rowSpan={3} className="border border-black p-1 text-[8px] align-top">
                    {student.generalRemark || (language === 'fr' ? 'Observations' : 'Remarks')}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1 text-center text-[8px]">
                    {language === 'fr' ? 'Réussi' : 'Passed'}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {student.numberOfPassed || entries.filter(e => Number(e.m20 || e.av20) >= 10).length}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {totalCoef}
                  </td>
                  <td className="border border-black p-1 text-center text-[8px]">
                    {language === 'fr' ? 'Punit.' : 'Pun.'}
                  </td>
                  <td className="border border-black p-1 text-center text-[8px]">
                    {student.discipline?.punishmentHours || 0}
                  </td>
                  <td className="border border-black p-1 text-center text-[8px]">
                    {language === 'fr' ? 'Renvoi' : 'Dismiss'}
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
                  <td className="border border-black p-1 text-center text-[8px]">
                    {language === 'fr' ? 'Taux (%)' : 'Rate (%)'}
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
                  <td colSpan={2} className="border border-black p-1 text-[8px] align-top">
                    <div className="font-bold">
                      {language === 'fr' ? 'Conseil:' : 'Council:'}
                    </div>
                    <div className="text-[8px]">
                      <div>________________</div>
                    </div>
                  </td>
                  <td className="border border-black p-1 text-[8px] align-top">
                    <div className="font-bold">
                      {language === 'fr' ? 'Directeur:' : 'Principal:'}
                    </div>
                    <div className="text-[8px]">
                      <div>________________</div>
                    </div>
                  </td>
                  <td colSpan={2} className="border border-black p-1 text-[8px] align-top">
                    <div className="font-bold">
                      {language === 'fr' ? 'Parent:' : 'Parent:'}
                    </div>
                    <div className="text-[8px]">
                      <div>________________</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>

          {/* FOOTER SECTION - Pushed to bottom via margin-top: auto */}
          <div className="bulletin-footer-section">
          {/* Third Trimester Annual Summary - Compact for Print */}
          {isThirdTrimester && annualSummary && (
            <div className={`${isTechnicalBulletin ? "mt-2" : "mt-3"} border border-orange-300 rounded p-2 bg-orange-50 print:hidden`}>
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

          {/* Verification Code - Compact */}
          {(student as any).verificationCode && (
            <div className={`${isTechnicalBulletin ? "mt-1" : "mt-2"} flex justify-center print:mt-1`}>
              <div className="rounded border border-blue-200 bg-blue-50 p-1 w-48 print:w-40">
                <div className="text-[8px] text-blue-700 text-center font-medium print:text-[6pt]">{language === 'fr' ? 'Code Vérification' : 'Verification Code'}</div>
                <div className="text-sm font-bold text-blue-800 text-center print:text-[8pt]">{(student as any).verificationCode}</div>
                <div className="text-[7px] text-blue-600 text-center print:text-[5pt]">educafric.com/verify</div>
              </div>
            </div>
          )}

          {/* Educafric Footer - Bilingual - Compact */}
          <EducafricFooterCompact language={language} className="mt-2 print:mt-1" />
          </div>

        </div>
      </A4Sheet>

    </div>
  );
}
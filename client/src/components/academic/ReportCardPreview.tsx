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
  mk20?: number; // MK/20 column (CBA format)
  av20?: number; // AV/20 column (CBA format)
  coef: number;
  avXcoef?: number; // AV x coef column
  grade?: string; // GRADE [Min – Max] 
  minMax?: string; // [Min – Max] range
  remarksAndSignature?: string; // Remarks and Teacher's signature
  teacherComments?: string[]; // Per-subject teacher comments (Ministry)
  subjectType?: 'general' | 'scientific' | 'literary' | 'professional' | 'other'; // Subject type for technical schools (5 sections)
  bulletinSection?: 'general' | 'scientific' | 'literary' | 'professional' | 'other'; // Manual bulletin section mapping for technical schools (overrides subjectType for bulletin grouping)
  // N/20-M/20 format fields (francophone general secondary)
  classAverage?: number; // M/20 - Class average for this subject
  m20ClassAvg?: number; // Alternative field name for class average
  subjectRank?: string; // Rang - Student's rank in this subject
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
  bulletinType?: 'general-fr' | 'general-en' | 'literary-fr' | 'scientific-fr' | 'professional-fr' | 'technical-en'; // Bulletin types for different series
  registrationNumber?: string; // School registration number (EDUCAFRIC or government)
  principalSignatureUrl?: string; // Director/Principal digital signature image
  principalSignatureName?: string; // Director name to display
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
  principalSignatureUrl = "",
  principalSignatureName = "",
  annualSummary = null,
}: ReportCardProps) {
  // Determine effective bulletin type
  const effectiveBulletinType = bulletinType || (isTechnicalSchool ? 'professional-fr' : 'general-fr');
  const entries = useMemo(() => (lines || []).map(x => ({ ...x, coef: Number(x.coef ?? 1) })), [lines]);
  
  // Determine bulletin characteristics based on bulletin format
  // CBA format (anglophone): general-en, technical-en → showCBAColumns = true (MK/20, AV/20, AV×coef, Min-Max)
  // N/20-M/20 format (francophone general): general-fr, literary-fr, scientific-fr → N/20, M/20, Rang columns
  // Simple format (primaire, technique FR): professional-fr → Note × Coef = Total
  const isSectionedBulletin = ['literary-fr', 'scientific-fr', 'professional-fr', 'technical-en'].includes(effectiveBulletinType);
  const showCBAColumns = ['general-en', 'technical-en'].includes(effectiveBulletinType); // CBA format for anglophone
  const showN20M20Columns = ['general-fr', 'literary-fr', 'scientific-fr'].includes(effectiveBulletinType); // N/20-M/20 format for francophone general
  // Legacy alias for backward compatibility
  const showTwoColumns = showCBAColumns;
  
  // Determine which sections to show based on bulletin type
  const bulletinSections = useMemo(() => {
    switch (effectiveBulletinType) {
      case 'literary-fr':
        return { primary: 'literary', sections: ['general', 'literary', 'other'] };
      case 'scientific-fr':
        return { primary: 'scientific', sections: ['general', 'scientific', 'other'] };
      case 'professional-fr':
      case 'technical-en':
        return { primary: 'professional', sections: ['general', 'professional', 'other'] };
      default:
        return { primary: null, sections: [] };
    }
  }, [effectiveBulletinType]);
  
  // Group subjects by type for sectioned bulletins (3 sections each)
  const groupedEntries = useMemo(() => {
    if (!isSectionedBulletin) {
      return { all: entries };
    }
    
    // Group by section based on bulletinSection/subjectType
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
      return section === 'other' || !section;
    });
    
    return { general, literary, scientific, professional, other };
  }, [entries, isSectionedBulletin]);
  
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
              {/* Left Column: English - Using actual school data with English fallbacks */}
              <div className="ministry-header-text text-[10px] text-center leading-snug">
                <div className="ministry-header-title font-bold">{MINISTRY_HEADER.line1.en}</div>
                <div className="italic text-[9px]">{MINISTRY_HEADER.line2.en}</div>
                <div className="text-[8px]">***</div>
                <div className="font-semibold text-[9px]">{MINISTRY_HEADER.line3.en}</div>
                <div className="text-[8px]">***</div>
                <div className="font-semibold text-[9px]">
                  {(() => {
                    const region = student.school?.officialInfo?.regionaleMinisterielle;
                    if (!region) return MINISTRY_HEADER.line4.en;
                    // If data already contains DÉLÉGATION, extract just the region name and translate
                    const match = region.match(/(?:DÉLÉGATION RÉGIONALE|REGIONAL DELEGATION)\s*(?:DU|DE|OF)?\s*(.+)/i);
                    return match ? `REGIONAL DELEGATION OF ${match[1]}` : `REGIONAL DELEGATION OF ${region}`;
                  })()}
                </div>
                <div className="font-semibold text-[9px]">
                  {(() => {
                    const dept = student.school?.officialInfo?.delegationDepartementale;
                    if (!dept) return MINISTRY_HEADER.line5.en;
                    // If data already contains DÉLÉGATION, extract just the department name and translate
                    const match = dept.match(/(?:DÉLÉGATION DÉPARTEMENTALE|DIVISIONAL DELEGATION)\s*(?:DU|DE|OF)?\s*(.+)/i);
                    return match ? `DIVISIONAL DELEGATION OF ${match[1]}` : `DIVISIONAL DELEGATION OF ${dept}`;
                  })()}
                </div>
                <div className="font-bold text-[10px]">{student.school?.name || MINISTRY_HEADER.line6.en}</div>
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

              {/* Right Column: French - Using actual school data with French fallbacks */}
              <div className="ministry-header-text text-[10px] text-center leading-snug">
                <div className="ministry-header-title font-bold">{MINISTRY_HEADER.line1.fr}</div>
                <div className="italic text-[9px]">{MINISTRY_HEADER.line2.fr}</div>
                <div className="text-[8px]">***</div>
                <div className="font-semibold text-[9px]">{MINISTRY_HEADER.line3.fr}</div>
                <div className="text-[8px]">***</div>
                <div className="font-semibold text-[9px]">
                  {(() => {
                    const region = student.school?.officialInfo?.regionaleMinisterielle;
                    if (!region) return MINISTRY_HEADER.line4.fr;
                    // If data already contains prefix, use as-is; otherwise add prefix
                    if (region.toUpperCase().startsWith('DÉLÉGATION') || region.toUpperCase().startsWith('DELEGATION')) {
                      return region;
                    }
                    return `DÉLÉGATION RÉGIONALE DU ${region}`;
                  })()}
                </div>
                <div className="font-semibold text-[9px]">
                  {(() => {
                    const dept = student.school?.officialInfo?.delegationDepartementale;
                    if (!dept) return MINISTRY_HEADER.line5.fr;
                    // If data already contains prefix, use as-is; otherwise add prefix
                    if (dept.toUpperCase().startsWith('DÉLÉGATION') || dept.toUpperCase().startsWith('DELEGATION')) {
                      return dept;
                    }
                    return `DÉLÉGATION DÉPARTEMENTALE DU ${dept}`;
                  })()}
                </div>
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
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${isSectionedBulletin ? 'bg-purple-100 text-purple-900 border border-purple-300' : 'bg-blue-100 text-blue-900 border border-blue-300'}`}>
              <span className="font-bold">
                {isSectionedBulletin ? '🔧' : '📚'}
              </span>
              <span>
                {(() => {
                  const bulletinLabels: Record<string, { fr: string; en: string }> = {
                    'general-fr': { fr: 'Bulletin GÉNÉRAL', en: 'GENERAL Report Card' },
                    'general-en': { fr: 'Bulletin GÉNÉRAL (Anglophone)', en: 'GENERAL Report Card (Anglophone)' },
                    'literary-fr': { fr: 'Bulletin LITTÉRAIRE (Série A) - 3 sections', en: 'LITERARY Report Card (Series A) - 3 sections' },
                    'scientific-fr': { fr: 'Bulletin SCIENTIFIQUE (Séries C/D/E) - 3 sections', en: 'SCIENTIFIC Report Card (Series C/D/E) - 3 sections' },
                    'professional-fr': { fr: 'Bulletin TECHNIQUE (STT/TI/TAG) - 3 sections', en: 'TECHNICAL Report Card (STT/TI/TAG) - 3 sections' },
                    'technical-en': { fr: 'Bulletin TECHNIQUE (Anglophone) - 3 sections', en: 'TECHNICAL Report Card (Anglophone) - 3 sections' },
                  };
                  const label = bulletinLabels[effectiveBulletinType] || bulletinLabels['general-fr'];
                  return label[language];
                })()}
              </span>
            </div>
          </div>

          {/* MAIN CONTENT - Flex grow to fill A4 page */}
          <div className="bulletin-main-content">
          {/* EXACT Ministry Subject Table - A4 PRINT OPTIMIZED */}
          <div className="mt-1 grades-table-wrapper">
            <table className="w-full border border-black" style={{lineHeight: '1.2', tableLayout: 'fixed', borderCollapse: 'collapse'}}>
              {/* Fixed Column Widths for A4 Fit - Format-Specific */}
              {showCBAColumns ? (
                /* Anglophone CBA: Subject/Teacher | Competencies | MK/20 | AV/20 | Coef | AV x coef | GRADE | [Min-Max] | Remarks */
                <colgroup><col style={{ width: '18%' }} /><col style={{ width: '20%' }} /><col style={{ width: '7%' }} /><col style={{ width: '7%' }} /><col style={{ width: '6%' }} /><col style={{ width: '8%' }} /><col style={{ width: '7%' }} /><col style={{ width: '10%' }} /><col style={{ width: '17%' }} /></colgroup>
              ) : showN20M20Columns ? (
                /* Francophone N/20-M/20: Subject/Teacher | Competencies | N/20 | M/20 | Coef | Total | Rang | Cote | Appréciation */
                <colgroup><col style={{ width: '18%' }} /><col style={{ width: '22%' }} /><col style={{ width: '7%' }} /><col style={{ width: '7%' }} /><col style={{ width: '6%' }} /><col style={{ width: '8%' }} /><col style={{ width: '6%' }} /><col style={{ width: '7%' }} /><col style={{ width: '19%' }} /></colgroup>
              ) : (
                /* Simple format: Subject/Teacher | Competencies | Note | Coef | Total | Cote | Appréciation | Obs. */
                <colgroup><col style={{ width: '20%' }} /><col style={{ width: '28%' }} /><col style={{ width: '8%' }} /><col style={{ width: '7%' }} /><col style={{ width: '9%' }} /><col style={{ width: '10%' }} /><col style={{ width: '9%' }} /><col style={{ width: '9%' }} /></colgroup>
              )}
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black px-1 py-0.5 font-bold text-center text-[9px]">
                    {language === 'fr' ? 'Matière / Enseignant' : "Subject and Teacher's Names"}
                  </th>
                  <th className="border border-black px-1 py-0.5 font-bold text-center text-[9px]">
                    {language === 'fr' ? 'Compétences' : 'COMPETENCIES EVALUATED'}
                  </th>
                  {showCBAColumns ? (
                    <>
                      <th className="border border-black px-0.5 py-0.5 font-bold text-center text-[9px]">
                        MK/20
                      </th>
                      <th className="border border-black px-0.5 py-0.5 font-bold text-center text-[9px]">
                        AV/20
                      </th>
                    </>
                  ) : showN20M20Columns ? (
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
                    {showCBAColumns ? 'AV x coef' : (language === 'fr' ? 'Total' : 'Total')}
                  </th>
                  {showN20M20Columns && (
                    <th className="border border-black px-0.5 py-0.5 font-bold text-center text-[9px]">
                      Rang
                    </th>
                  )}
                  <th className="border border-black px-0.5 py-0.5 font-bold text-center text-[9px]">
                    {language === 'fr' ? 'Cote' : 'GRADE'}
                  </th>
                  {showCBAColumns && (
                    <th className="border border-black px-0.5 py-0.5 font-bold text-center text-[9px]">
                      [Min - Max]
                    </th>
                  )}
                  <th className="border border-black px-0.5 py-0.5 font-bold text-center text-[9px]">
                    {showCBAColumns ? "Remarks and Teacher's signature" : (language === 'fr' ? 'Appréciation' : 'Remarks')}
                  </th>
                  {!showCBAColumns && !showN20M20Columns && (
                    <th className="border border-black px-0.5 py-0.5 font-bold text-center text-[9px]">
                      {language === 'fr' ? 'Obs.' : 'Comments'}
                    </th>
                  )}
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
                      {showCBAColumns ? (
                        <>
                          <td className="border border-black px-0.5 py-0.5 text-center grade-value text-[9px]">
                            {mk20}
                          </td>
                          <td className={`border border-black px-0.5 py-0.5 text-center grade-value text-[9px] font-bold ${Number(av20) < 10 ? 'grade-fail text-red-600' : ''}`}>
                            {av20}
                          </td>
                        </>
                      ) : showN20M20Columns ? (
                        <>
                          <td className={`border border-black px-0.5 py-0.5 text-center grade-value text-[9px] font-bold ${Number(av20) < 10 ? 'grade-fail text-red-600' : ''}`}>
                            {av20}
                          </td>
                          <td className="border border-black px-0.5 py-0.5 text-center grade-value text-[9px]">
                            {r.classAverage || r.m20ClassAvg || '-'}
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
                      {showN20M20Columns && (
                        <td className="border border-black px-0.5 py-0.5 text-center text-[9px]">
                          {r.subjectRank || '-'}
                        </td>
                      )}
                      <td className="border border-black px-0.5 py-0.5 text-center text-[9px] font-bold">
                        {r.grade || cote}
                      </td>
                      {showCBAColumns && (
                        <td className="border border-black px-0.5 py-0.5 text-center text-[8px]">
                          {r.minMax || `${Math.max(0, Number(av20) - 2).toFixed(1)} - ${Math.min(20, Number(av20) + 2).toFixed(1)}`}
                        </td>
                      )}
                      <td className="border border-black px-0.5 py-0.5 appreciation-text text-[8px]">
                        {(() => {
                          const customApp = (r as any).customAppreciation;
                          if (customApp) return customApp;
                          const remarkCode = r.remark;
                          if (remarkCode) return getAppreciationText(remarkCode, language);
                          if (showCBAColumns) {
                            const remark = r.remarksAndSignature || '';
                            const comments = r.teacherComments?.slice(0, 1).join('; ') || '';
                            return remark + (comments ? ` - ${comments}` : '');
                          }
                          return r.remarksAndSignature || '';
                        })()}
                      </td>
                      {!showCBAColumns && !showN20M20Columns && (
                        <td className="border border-black px-0.5 py-0.5 text-[8px] align-top">
                          {r.teacherComments && r.teacherComments.length > 0 ? (
                            <div className="text-[8px] leading-tight">
                              {r.teacherComments.slice(0, 2).map((c, i) => (
                                <div key={i}>{i + 1}. {c}</div>
                              ))}
                            </div>
                          ) : null}
                        </td>
                      )}
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
                        {(showCBAColumns || showN20M20Columns) ? (
                          <>
                            <td className="border border-black px-0.5 py-0.5"></td>
                            <td className="border border-black px-0.5 py-0.5"></td>
                          </>
                        ) : (
                          <td className="border border-black px-0.5 py-0.5"></td>
                        )}
                        <td className="border border-black px-0.5 py-0.5 text-center text-[9px] font-bold">{sectionTotalCoef}</td>
                        <td className="border border-black px-0.5 py-0.5 text-center text-[9px] font-bold">{round2(sectionTotalMxCoef)}</td>
                        {showN20M20Columns && <td className="border border-black px-0.5 py-0.5"></td>}
                        <td className="border border-black px-0.5 py-0.5 text-center text-[9px] font-bold">{sectionMoyenne}/20</td>
                        {showCBAColumns && <td className="border border-black px-0.5 py-0.5"></td>}
                        <td colSpan={(showCBAColumns || showN20M20Columns) ? 1 : 2} className="border border-black px-0.5 py-0.5"></td>
                      </tr>
                    );
                  };

                  // For sectioned bulletins (literary, scientific, professional/technical), render 3 sections
                  if (isSectionedBulletin) {
                    const sectionTitles: Record<string, { fr: string; en: string; color: string; textColor: string }> = {
                      general: { fr: 'Matières Générales', en: 'General Subjects', color: 'bg-green-100', textColor: 'text-green-800' },
                      literary: { fr: 'Matières Littéraires', en: 'Literary Subjects', color: 'bg-purple-100', textColor: 'text-purple-800' },
                      scientific: { fr: 'Matières Scientifiques', en: 'Scientific Subjects', color: 'bg-blue-100', textColor: 'text-blue-800' },
                      professional: { fr: 'Matières Professionnelles', en: 'Professional Subjects', color: 'bg-orange-100', textColor: 'text-orange-800' },
                      other: { fr: 'Autres Matières', en: 'Other Subjects', color: 'bg-pink-100', textColor: 'text-pink-800' }
                    };

                    let globalIndex = 0;
                    
                    // Only render sections that are in bulletinSections.sections
                    const sectionsToRender = bulletinSections.sections;

                    return (
                      <>
                        {sectionsToRender.map(sectionKey => {
                          const sectionData = groupedEntries[sectionKey as keyof typeof groupedEntries];
                          const sectionInfo = sectionTitles[sectionKey];
                          
                          if (!sectionData || !Array.isArray(sectionData) || sectionData.length === 0) return null;
                          
                          return (
                            <React.Fragment key={`section-${sectionKey}`}>
                              <tr className={sectionInfo.color} key={`section-${sectionKey}-header`}>
                                <td colSpan={9} className={`border border-black px-1 py-0.5 font-bold text-[9px] ${sectionInfo.textColor}`}>
                                  {language === 'fr' ? sectionInfo.fr : sectionInfo.en}
                                </td>
                              </tr>
                              {sectionData.map((r, idx) => {
                                const uniqueKey = `${sectionKey}-${globalIndex++}`;
                                return renderSubjectRow(r, uniqueKey);
                              })}
                              {renderSectionSubtotal(language === 'fr' ? sectionInfo.fr : sectionInfo.en, sectionData)}
                            </React.Fragment>
                          );
                        })}
                      </>
                    );
                  }

                  // For general schools, render all subjects without sections
                  const subjectRows = entries.map((r, idx) => renderSubjectRow(r, `subject-${idx}`));
                  
                  // Add filler rows to fill A4 page (minimum 12 rows for proper page fill)
                  const MIN_ROWS = 12;
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
                      {showTwoColumns && <td className="border border-black px-0.5 py-2 text-center">&nbsp;</td>}
                      <td className="border border-black px-0.5 py-2">&nbsp;</td>
                      {!showTwoColumns && <td className="border border-black px-0.5 py-2">&nbsp;</td>}
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
                  {showTwoColumns && <td className="border border-black px-0.5 py-0.5"></td>}
                  <td className="border border-black px-0.5 py-0.5"></td>
                  {!showTwoColumns && <td className="border border-black px-0.5 py-0.5"></td>}
                </tr>
                <tr className="bg-yellow-50">
                  <td colSpan={2} className="border border-black px-1 py-1 font-bold text-[11px]">
                    {showTwoColumns ? 'ANNUAL AVERAGE' : (language === 'fr' ? 'MOYENNE GÉNÉRALE' : 'OVERALL AVERAGE')}
                  </td>
                  <td colSpan={showTwoColumns ? 3 : 2} className={`border border-black px-1 py-1 text-center font-bold text-[12px] ${moyenne < 10 ? 'text-red-600 bg-red-50' : 'text-green-700 bg-green-50'}`}>
                    {moyenne}/20
                  </td>
                  <td colSpan={showTwoColumns ? 4 : 4} className="border border-black px-1 py-1 text-[10px]">
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
                      {principalSignatureUrl ? (
                        <div className="flex flex-col items-center">
                          <img 
                            src={principalSignatureUrl} 
                            alt="Signature" 
                            className="h-6 max-w-[50px] object-contain"
                            style={{ maxHeight: '24px' }}
                          />
                          {principalSignatureName && (
                            <div className="text-[6px] mt-0.5 text-center">{principalSignatureName}</div>
                          )}
                        </div>
                      ) : (
                        <div>________________</div>
                      )}
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
          {/* Third Trimester Annual Summary - Ministry Required for 3rd Term / Annual Report Sheet */}
          {isThirdTrimester && annualSummary && (
            <div className={`${isSectionedBulletin ? "mt-2" : "mt-3"} border border-orange-300 rounded p-2 bg-orange-50 annual-summary-print print:border-black print:bg-white`}>
              <h3 className="text-lg font-semibold text-orange-800 mb-3 print:text-black print:text-sm print:mb-1">
                {language === 'fr' ? 'RÉSUMÉ ANNUEL / ANNUAL SUMMARY' : 'ANNUAL SUMMARY / RÉSUMÉ ANNUEL'}
              </h3>
              
              {/* Trimester Averages - Ministry Format */}
              <div className="grid grid-cols-4 gap-3 mb-4 print:gap-1 print:mb-2">
                <div className="text-center print:border print:border-black print:p-1">
                  <div className="text-xs text-gray-600 print:text-black print:text-[8px]">
                    {language === 'fr' ? '1er T.' : '1st T.'}
                  </div>
                  <div className={`text-sm font-semibold print:text-[10px] ${annualSummary.firstTrimesterAverage < 10 ? 'text-red-600 print:text-red-600' : 'print:text-black'}`}>{annualSummary.firstTrimesterAverage}/20</div>
                </div>
                <div className="text-center print:border print:border-black print:p-1">
                  <div className="text-xs text-gray-600 print:text-black print:text-[8px]">
                    {language === 'fr' ? '2e T.' : '2nd T.'}
                  </div>
                  <div className={`text-sm font-semibold print:text-[10px] ${annualSummary.secondTrimesterAverage < 10 ? 'text-red-600 print:text-red-600' : 'print:text-black'}`}>{annualSummary.secondTrimesterAverage}/20</div>
                </div>
                <div className="text-center print:border print:border-black print:p-1">
                  <div className="text-xs text-gray-600 print:text-black print:text-[8px]">
                    {language === 'fr' ? '3e T.' : '3rd T.'}
                  </div>
                  <div className={`text-sm font-semibold print:text-[10px] ${annualSummary.thirdTrimesterAverage < 10 ? 'text-red-600 print:text-red-600' : 'print:text-black'}`}>{annualSummary.thirdTrimesterAverage}/20</div>
                </div>
                <div className="text-center bg-white rounded border p-2 print:border-2 print:border-black print:p-1 print:bg-yellow-50">
                  <div className="text-xs text-orange-700 font-medium print:text-black print:text-[8px]">
                    {language === 'fr' ? 'Moy. Annuelle' : 'Annual Avg.'}
                  </div>
                  <div className={`text-lg font-bold print:text-[12px] ${annualSummary.annualAverage < 10 ? 'text-red-600 print:text-red-600' : 'text-orange-800 print:text-black'}`}>{annualSummary.annualAverage}/20</div>
                </div>
              </div>

              {/* Annual Rank and Pass Decision - Ministry CLASS COUNCIL DECISION Format */}
              <div className="grid grid-cols-2 gap-4 mb-4 print:gap-2 print:mb-2">
                <div className="text-center border rounded p-2 print:border-black print:p-1">
                  <div className="text-xs text-gray-600 print:text-black print:text-[8px]">
                    {language === 'fr' ? 'Rang Annuel' : 'Annual Rank'}
                  </div>
                  <div className="text-sm font-semibold print:text-[10px]">{annualSummary.annualRank}{language === 'fr' ? 'e' : 'th'} / {annualSummary.totalStudents}</div>
                </div>
                <div className="text-center border rounded p-2 print:border-black print:p-1">
                  <div className="text-xs text-gray-600 print:text-black print:text-[8px]">
                    {language === 'fr' ? 'Décision Conseil de Classe' : 'CLASS COUNCIL DECISION'}
                  </div>
                  <div className={`text-sm font-bold print:text-[10px] ${
                    annualSummary.passDecision === 'PASSE' || annualSummary.passDecision === 'Promoted' ? 'text-green-700' : 
                    annualSummary.passDecision === 'REDOUBLE' || annualSummary.passDecision === 'Repeat' ? 'text-orange-700' : 'text-red-700'
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
            <div className={`${isSectionedBulletin ? "mt-1" : "mt-2"} flex justify-center print:mt-1`}>
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
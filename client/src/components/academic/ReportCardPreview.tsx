// Bilingual Cameroon-style report card component
import React, { useMemo } from "react";

// ---- Bilingual helpers (FR/EN) ----
const TRIMESTER_TITLES = {
  fr: (t: string) => `BULLETIN SCOLAIRE – ${String(t || "Premier").toUpperCase()} TRIMESTRE`,
  en: (t: string) => `${String(t || "First").toUpperCase()} TERM REPORT CARD`
};

const OFFICIAL_HEADER = {
  fr: {
    country: "RÉPUBLIQUE DU CAMEROUN",
    motto: "Paix – Travail – Patrie", 
    ministry: "MINISTÈRE DE L'ENSEIGNEMENT SECONDAIRE",
    regional: "DÉLÉGATION RÉGIONALE DU CENTRE",
    departmental: "DÉLÉGATION DÉPARTEMENTALE DU MFOUNDI"
  },
  en: {
    country: "REPUBLIC OF CAMEROON",
    motto: "Peace – Work – Fatherland",
    ministry: "MINISTRY OF SECONDARY EDUCATION", 
    regional: "REGIONAL DELEGATION OF CENTRE REGION",
    departmental: "DIVISIONAL DELEGATION OF MFOUNDI DIVISION"
  }
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
    <style>{`@page { size: A4; margin: 12mm; } @media print { .print\\:hidden{ display:none } }`}</style>
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

interface StudentData {
  name?: string;
  id?: string;
  classLabel?: string;
  classSize?: number;
  birthDate?: string;
  birthPlace?: string;
  gender?: string;
  headTeacher?: string;
  guardian?: string;
  generalRemark?: string;
  school?: {
    name?: string;
    subtitle?: string;
    officialInfo?: {
      regionaleMinisterielle?: string;
      delegationDepartementale?: string;
      boitePostale?: string;
      arrondissement?: string;
    };
  };
  discipline?: {
    absJ?: number;
    absNJ?: number;
    late?: number;
    sanctions?: number;
  };
}

interface SubjectLine {
  subject: string;
  m20: number | string;
  coef: number;
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
  annualSummary = null,
}: ReportCardProps) {
  const entries = useMemo(() => (lines || []).map(x => ({ ...x, coef: Number(x.coef ?? 1) })), [lines]);
  const totalCoef = entries.reduce((s, x) => s + (x.coef || 0), 0);
  const totalMxCoef = entries.reduce((s, x) => s + (Number(x.m20) || 0) * (x.coef || 0), 0);
  const moyenne = totalCoef ? round2(totalMxCoef / totalCoef) : 0;

  const labels = LABELS[language];
  const header = OFFICIAL_HEADER[language];
  
  // Use school's official info if available, otherwise use defaults
  const officialHeader = student.school?.officialInfo ? {
    country: header.country,
    motto: header.motto,
    ministry: header.ministry,
    regional: student.school.officialInfo.regionaleMinisterielle || header.regional,
    departmental: student.school.officialInfo.delegationDepartementale || header.departmental
  } : header;

  return (
    <div className="bg-white rounded-2xl shadow p-6 print:shadow-none print:p-0" data-bulletin-preview="true">
      <A4Sheet>
        <div className="p-4">
          {/* Official Cameroon Government Header */}
          <div className="text-center mb-6 text-xs">
            <div className="font-bold">{officialHeader.country}</div>
            <div className="italic">{officialHeader.motto}</div>
            <div className="font-semibold mt-2">{officialHeader.ministry}</div>
            <div className="font-semibold">{officialHeader.regional}</div>
            <div className="font-semibold mb-4">{officialHeader.departmental}</div>
          </div>

          {/* School Header with Logo and Photo */}
          <div className="grid grid-cols-12 gap-3 items-center mb-4">
            <div className="col-span-2">
              {schoolLogoUrl ? (
                <img src={schoolLogoUrl} alt="School Logo" className="h-16 object-contain" onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }} />
              ) : (
                <div className="h-16 border rounded-xl flex items-center justify-center text-[10px] text-gray-500">School Logo</div>
              )}
            </div>
            <div className="col-span-8 text-center">
              <div className="text-lg font-semibold">{student.school?.name || "LYCÉE DE MENDONG / HIGH SCHOOL OF MENDONG"}</div>
              <div className="text-xs text-gray-600">{student.school?.subtitle || "LDM-2025-001 – Yaoundé – Tel: +237 222 xxx xxx"}</div>
            </div>
            <div className="col-span-2 flex items-center justify-end gap-2">
              {studentPhotoUrl ? (
                <img src={studentPhotoUrl} alt="Photo" className="h-16 w-16 object-cover rounded-lg border" onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }} />
              ) : (
                <div className="h-16 w-16 border rounded-xl flex items-center justify-center text-[10px] text-gray-500">Photo</div>
              )}
              <div className="bg-white p-1 rounded-md border"><QRImg value={qrValue} size={48} /></div>
            </div>
          </div>

          {/* Report Card Title */}
          <div className="mt-4 text-center">
            <h1 className="text-lg font-semibold">{TRIMESTER_TITLES[language](trimester)}</h1>
            <p className="text-xs text-gray-600">{language === 'fr' ? 'Année scolaire' : 'Academic Year'}: {year}</p>
          </div>

          {/* Student info */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            <Info label={labels.student} value={student.name || ""} />
            <Info label={labels.studentId} value={student.id || ""} />
            <Info label={labels.class} value={student.classLabel || ""} />
            <Info label={labels.classSize} value={String(student.classSize || 0)} />
            <Info label={labels.birthInfo} value={`${student.birthDate || "—"} ${language === 'fr' ? 'à' : 'in'} ${student.birthPlace || "—"}`} />
            <Info label={labels.gender} value={student.gender || "—"} />
            <Info label={labels.homeTeacher} value={student.headTeacher || "—"} />
            <Info label={labels.guardian} value={student.guardian || "—"} />
          </div>

          {/* Marks table */}
          <div className="mt-4 overflow-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <Th>{labels.subject}</Th>
                  <Th>{labels.coef}</Th>
                  <Th>{labels.mark}</Th>
                  <Th>{labels.weight}</Th>
                  <Th>{labels.remarks}</Th>
                </tr>
              </thead>
              <tbody>
                {entries.map((r, idx) => {
                  const mx = round2((Number(r.m20) || 0) * (r.coef || 0));
                  return (
                    <tr key={idx} className={idx % 2 ? "bg-white" : "bg-gray-50/50"}>
                      <Td>{r.subject}</Td>
                      <Td className="text-center">{r.coef}</Td>
                      <Td className="text-center font-medium">{r.m20}</Td>
                      <Td className="text-center">{mx}</Td>
                      <Td>{r.remark || ""}</Td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <Td colSpan={1}>{labels.totalCoef}</Td>
                  <Td className="text-center">{totalCoef}</Td>
                  <Td className="text-center">—</Td>
                  <Td className="text-center">{round2(totalMxCoef)}</Td>
                  <Td className="text-center">—</Td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Third Trimester Annual Summary */}
          {isThirdTrimester && annualSummary && (
            <div className="mt-4 border-2 border-orange-300 rounded-xl p-4 bg-orange-50">
              <h3 className="text-lg font-semibold text-orange-800 mb-3">{labels.annualSummary}</h3>
              
              {/* Trimester Averages */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-xs text-gray-600">{labels.firstTrimester}</div>
                  <div className="text-sm font-semibold">{annualSummary.firstTrimesterAverage}/20</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600">{labels.secondTrimester}</div>
                  <div className="text-sm font-semibold">{annualSummary.secondTrimesterAverage}/20</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600">{labels.thirdTrimester}</div>
                  <div className="text-sm font-semibold">{annualSummary.thirdTrimesterAverage}/20</div>
                </div>
                <div className="text-center bg-white rounded border p-2">
                  <div className="text-xs text-orange-700 font-medium">{labels.annualAverage}</div>
                  <div className="text-lg font-bold text-orange-800">{annualSummary.annualAverage}/20</div>
                </div>
              </div>

              {/* Annual Rank and Pass Decision */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center border rounded p-2">
                  <div className="text-xs text-gray-600">{labels.annualRank}</div>
                  <div className="text-sm font-semibold">{annualSummary.annualRank}e / {annualSummary.totalStudents}</div>
                </div>
                <div className="text-center border rounded p-2">
                  <div className="text-xs text-gray-600">{labels.passDecision}</div>
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
                  <div className="text-xs text-gray-600 font-medium">{labels.finalAppreciation}</div>
                  <div className="text-sm italic bg-white border rounded p-2">{annualSummary.finalAppreciation}</div>
                </div>
              )}

              {/* Holiday Recommendations */}
              {annualSummary.holidayRecommendations && (
                <div>
                  <div className="text-xs text-gray-600 font-medium">{labels.holidayRecommendations}</div>
                  <div className="text-sm bg-white border rounded p-2">{annualSummary.holidayRecommendations}</div>
                </div>
              )}
            </div>
          )}

          {/* Averages & discipline */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-gray-500">{labels.overallAvg}</div>
              <div className="text-2xl font-semibold">{moyenne}/20</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-gray-500">{language === 'fr' ? 'Appréciation générale' : 'General Comments'}</div>
              <div className="min-h-10 text-sm">{student.generalRemark || ""}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-gray-500">{labels.discipline}</div>
              <div className="text-xs grid grid-cols-2 gap-x-2 gap-y-1">
                <span>{labels.justifiedAbs}</span><b>{student.discipline?.absJ || 0} h</b>
                <span>{labels.unjustifiedAbs}</span><b>{student.discipline?.absNJ || 0} h</b>
                <span>{labels.lates}</span><b>{student.discipline?.late || 0}</b>
                <span>{labels.warnings}/{labels.reprimands}</span><b>{student.discipline?.sanctions || 0}</b>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-10 grid grid-cols-3 gap-4 text-xs">
            <div className="text-center"><div>{labels.principal}</div><div className="h-14"/><div className="font-medium">{language === 'fr' ? 'Visa' : 'Signature'}</div></div>
            <div className="text-center"><div>{labels.homeTeacherSig}</div><div className="h-14"/><div className="font-medium">{language === 'fr' ? 'Visa' : 'Signature'}</div></div>
            <div className="text-center"><div>{labels.parentSig}</div><div className="h-14"/><div className="font-medium">{language === 'fr' ? 'Visa' : 'Signature'}</div></div>
          </div>
        </div>
      </A4Sheet>

      <div className="mt-3 flex justify-end gap-2 print:hidden">
        <button className="px-3 py-2 rounded-xl bg-gray-100" onClick={() => window.print?.()}>{language === 'fr' ? 'Imprimer' : 'Print'}</button>
      </div>
    </div>
  );
}
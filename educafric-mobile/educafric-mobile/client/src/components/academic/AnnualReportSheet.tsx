// MINISTRY OFFICIAL ANNUAL REPORT SHEET - Bilingual Implementation
// FICHE DE RAPPORT ANNUEL - Implementation Bilingue Officielle
import React from "react";

interface AnnualReportSheetProps {
  student: {
    name: string;
    id: string;
    class: string;
    classLabel: string;
    gender: string;
    birthDate?: string;
    birthPlace?: string;
    guardian?: string;
    schoolMatricule?: string;
    photoUrl?: string;
  };
  schoolInfo?: {
    name: string;
    region?: string;
    department?: string;
    code?: string;
    logo?: string;
  };
  academicYear: string;
  trimesterData: {
    trimester1: {
      average: number;
      rank: string;
      totalStudents: number;
      subjectCount: number;
      passedSubjects: number;
      discipline: {
        absJ: number;
        absNJ: number;
        lates: number;
        sanctions: number;
      };
      teacherObservations: string;
    };
    trimester2: {
      average: number;
      rank: string;
      totalStudents: number;
      subjectCount: number;
      passedSubjects: number;
      discipline: {
        absJ: number;
        absNJ: number;
        lates: number;
        sanctions: number;
      };
      teacherObservations: string;
    };
    trimester3: {
      average: number;
      rank: string;
      totalStudents: number;
      subjectCount: number;
      passedSubjects: number;
      discipline: {
        absJ: number;
        absNJ: number;
        lates: number;
        sanctions: number;
      };
      teacherObservations: string;
    };
  };
  annualSummary: {
    annualAverage: number;
    annualRank: string;
    finalDecision: 'PASSE' | 'REDOUBLE' | 'RENVOYE';
    principalObservations: string;
    parentObservations?: string;
    holidayRecommendations: string;
  };
  language: 'fr' | 'en';
}

const AnnualReportSheet: React.FC<AnnualReportSheetProps> = ({
  student,
  schoolInfo,
  academicYear,
  trimesterData,
  annualSummary,
  language
}) => {

  // Ministry Official Headers - Bilingual
  const MINISTRY_HEADER = {
    line1: { fr: "RÉPUBLIQUE DU CAMEROUN", en: "REPUBLIC OF CAMEROON" },
    line2: { fr: "Paix – Travail – Patrie", en: "Peace – Work – Fatherland" },
    line3: { fr: "MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES", en: "MINISTRY OF SECONDARY EDUCATION" },
    line4: { fr: `DÉLÉGATION RÉGIONALE DE ${schoolInfo?.region || '…'}`, en: `REGIONAL DELEGATION OF ${schoolInfo?.region || '…'}.` },
    line5: { fr: `DÉLÉGATION DÉPARTEMENTALE DE ${schoolInfo?.department || '…'}`, en: `DIVISIONAL DELEGATION OF ${schoolInfo?.department || '…'}.` },
    line6: { fr: schoolInfo?.name || "LYCÉE DE……….", en: schoolInfo?.name || "HIGH SCHOOL" }
  };

  const labels = {
    fr: {
      title: "FICHE DE RAPPORT ANNUEL",
      academicYear: "ANNÉE SCOLAIRE",
      studentInfo: "INFORMATIONS DE L'ÉLÈVE",
      student: "Élève",
      matricule: "Matricule",
      class: "Classe",
      born: "Né(e) le",
      at: "à",
      guardian: "Parent/Tuteur",
      trimesterProgression: "PROGRESSION TRIMESTRIELLE",
      trimester: "TRIMESTRE",
      first: "PREMIER",
      second: "DEUXIÈME", 
      third: "TROISIÈME",
      average: "Moyenne",
      rank: "Rang",
      outOf: "sur",
      subjects: "Matières",
      passed: "Réussies",
      discipline: "DISCIPLINE",
      justifiedAbs: "Abs. Just.",
      unjustifiedAbs: "Abs. Non Just.",
      lates: "Retards",
      sanctions: "Sanctions",
      observations: "Observations du Professeur Principal",
      annualSummary: "RÉSUMÉ ANNUEL",
      annualAverage: "Moyenne Annuelle",
      annualRank: "Rang Annuel",
      finalDecision: "Décision Finale",
      principalObservations: "Observations du Chef d'Établissement",
      parentComments: "Observations des Parents",
      recommendations: "Recommandations pour les Vacances",
      signatures: "SIGNATURES",
      parentSignature: "Signature du Parent/Tuteur",
      principalSignature: "Le Chef d'Établissement",
      schoolStamp: "Cachet de l'École",
      date: "Date"
    },
    en: {
      title: "ANNUAL REPORT SHEET",
      academicYear: "ACADEMIC YEAR",
      studentInfo: "STUDENT INFORMATION",
      student: "Student",
      matricule: "Student ID",
      class: "Class",
      born: "Born on",
      at: "at",
      guardian: "Parent/Guardian",
      trimesterProgression: "TRIMESTER PROGRESSION",
      trimester: "TERM",
      first: "FIRST",
      second: "SECOND",
      third: "THIRD", 
      average: "Average",
      rank: "Rank",
      outOf: "out of",
      subjects: "Subjects",
      passed: "Passed",
      discipline: "DISCIPLINE",
      justifiedAbs: "Just. Abs.",
      unjustifiedAbs: "Unjust. Abs.",
      lates: "Lates",
      sanctions: "Sanctions",
      observations: "Class Master's Observations",
      annualSummary: "ANNUAL SUMMARY",
      annualAverage: "Annual Average",
      annualRank: "Annual Rank",
      finalDecision: "Final Decision",
      principalObservations: "Principal's Observations",
      parentComments: "Parent's Comments",
      recommendations: "Holiday Recommendations",
      signatures: "SIGNATURES",
      parentSignature: "Parent's/Guardian's Signature",
      principalSignature: "The PRINCIPAL",
      schoolStamp: "School Stamp",
      date: "Date"
    }
  };

  const t = labels[language];

  return (
    <div className="annual-report-compact max-w-4xl mx-auto bg-white p-6 text-black print:p-2" data-annual-report="true">
      {/* Ministry Official Header - Bilingual */}
      <div className="ministry-header text-center mb-6 border-b-2 border-black pb-4">
        <div className="grid grid-cols-2 gap-8 mb-4">
          {/* French Side */}
          <div className="text-xs leading-tight">
            <div className="font-bold">{MINISTRY_HEADER.line1.fr}</div>
            <div className="italic">{MINISTRY_HEADER.line2.fr}</div>
            <div className="font-bold mt-2">{MINISTRY_HEADER.line3.fr}</div>
            <div>{MINISTRY_HEADER.line4.fr}</div>
            <div>{MINISTRY_HEADER.line5.fr}</div>
            <div className="font-bold mt-1">{MINISTRY_HEADER.line6.fr}</div>
          </div>
          
          {/* English Side */}
          <div className="text-xs leading-tight">
            <div className="font-bold">{MINISTRY_HEADER.line1.en}</div>
            <div className="italic">{MINISTRY_HEADER.line2.en}</div>
            <div className="font-bold mt-2">{MINISTRY_HEADER.line3.en}</div>
            <div>{MINISTRY_HEADER.line4.en}</div>
            <div>{MINISTRY_HEADER.line5.en}</div>
            <div className="font-bold mt-1">{MINISTRY_HEADER.line6.en}</div>
          </div>
        </div>

        {/* School Logo */}
        {schoolInfo?.logo && (
          <div className="flex justify-center mb-4">
            <img 
              src={schoolInfo.logo} 
              alt="School Logo" 
              className="school-logo w-16 h-16 object-contain"
            />
          </div>
        )}

        {/* Document Title - Bilingual */}
        <div className="text-lg font-bold mt-4">
          <div>{labels.fr.title}</div>
          <div className="text-sm">{labels.en.title}</div>
          <div className="text-sm mt-2">
            {labels.fr.academicYear} / {labels.en.academicYear}: <span className="underline">{academicYear}</span>
          </div>
        </div>
      </div>

      {/* Student Information - Bilingual */}
      <div className="student-header mb-6">
        <h3 className="font-bold text-sm mb-3 bg-gray-100 p-2">
          {t.studentInfo}
        </h3>
        <div className="flex gap-6">
          <div className="flex-1 grid grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <div><strong>{t.student}:</strong> {student.name}</div>
              <div><strong>{t.matricule}:</strong> {student.id}</div>
              <div><strong>{t.class}:</strong> {student.classLabel}</div>
            </div>
            <div className="space-y-2">
              <div><strong>{t.born}:</strong> {student.birthDate} {t.at} {student.birthPlace}</div>
              <div><strong>Genre/Gender:</strong> {student.gender}</div>
              <div><strong>{t.guardian}:</strong> {student.guardian}</div>
            </div>
          </div>
          
          {/* Student Photo - Ministry Standard (24mm x 32mm) */}
          <div className="flex-shrink-0">
            {student.photoUrl ? (
              <div className="border-2 border-black p-1 bg-white">
                <img 
                  src={student.photoUrl} 
                  alt="Photo de l'élève / Student Photo" 
                  className="student-photo-annual-report w-16 h-20 object-cover"
                  style={{ width: '24mm', height: '32mm' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="border-2 border-black p-1 bg-gray-50 w-16 h-20 flex items-center justify-center text-center">
                <div className="text-xs text-gray-500" style={{ width: '24mm', height: '32mm', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <div>📷</div>
                  <div>PHOTO</div>
                  <div>ÉLÈVE</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trimester Progression Table */}
      <div className="trimester-section mb-6">
        <h3 className="font-bold text-sm mb-3 bg-gray-100 p-2">
          {t.trimesterProgression}
        </h3>
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-2 font-bold">{t.trimester}</th>
              <th className="border border-black p-2 font-bold">{t.first}</th>
              <th className="border border-black p-2 font-bold">{t.second}</th>
              <th className="border border-black p-2 font-bold">{t.third}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 font-medium">{t.average} /20</td>
              <td className="border border-black p-2 text-center">{trimesterData.trimester1.average.toFixed(2)}</td>
              <td className="border border-black p-2 text-center">{trimesterData.trimester2.average.toFixed(2)}</td>
              <td className="border border-black p-2 text-center">{trimesterData.trimester3.average.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-medium">{t.rank}</td>
              <td className="border border-black p-2 text-center">{trimesterData.trimester1.rank} / {trimesterData.trimester1.totalStudents}</td>
              <td className="border border-black p-2 text-center">{trimesterData.trimester2.rank} / {trimesterData.trimester2.totalStudents}</td>
              <td className="border border-black p-2 text-center">{trimesterData.trimester3.rank} / {trimesterData.trimester3.totalStudents}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-medium">{t.subjects} {t.passed}</td>
              <td className="border border-black p-2 text-center">{trimesterData.trimester1.passedSubjects} / {trimesterData.trimester1.subjectCount}</td>
              <td className="border border-black p-2 text-center">{trimesterData.trimester2.passedSubjects} / {trimesterData.trimester2.subjectCount}</td>
              <td className="border border-black p-2 text-center">{trimesterData.trimester3.passedSubjects} / {trimesterData.trimester3.subjectCount}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Discipline Summary Table */}
      <div className="trimester-section mb-6">
        <h3 className="font-bold text-sm mb-3 bg-gray-100 p-2">
          {t.discipline}
        </h3>
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-2 font-bold">{t.trimester}</th>
              <th className="border border-black p-2 font-bold">{t.first}</th>
              <th className="border border-black p-2 font-bold">{t.second}</th>
              <th className="border border-black p-2 font-bold">{t.third}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 font-medium">{t.justifiedAbs} (h)</td>
              <td className="border border-black p-2 text-center">{trimesterData.trimester1.discipline.absJ}</td>
              <td className="border border-black p-2 text-center">{trimesterData.trimester2.discipline.absJ}</td>
              <td className="border border-black p-2 text-center">{trimesterData.trimester3.discipline.absJ}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-medium">{t.unjustifiedAbs} (h)</td>
              <td className="border border-black p-2 text-center">{trimesterData.trimester1.discipline.absNJ}</td>
              <td className="border border-black p-2 text-center">{trimesterData.trimester2.discipline.absNJ}</td>
              <td className="border border-black p-2 text-center">{trimesterData.trimester3.discipline.absNJ}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-medium">{t.lates}</td>
              <td className="border border-black p-2 text-center">{trimesterData.trimester1.discipline.lates}</td>
              <td className="border border-black p-2 text-center">{trimesterData.trimester2.discipline.lates}</td>
              <td className="border border-black p-2 text-center">{trimesterData.trimester3.discipline.lates}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-medium">{t.sanctions}</td>
              <td className="border border-black p-2 text-center">{trimesterData.trimester1.discipline.sanctions}</td>
              <td className="border border-black p-2 text-center">{trimesterData.trimester2.discipline.sanctions}</td>
              <td className="border border-black p-2 text-center">{trimesterData.trimester3.discipline.sanctions}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Annual Summary */}
      <div className="annual-summary mb-6">
        <h3 className="font-bold text-sm mb-3 bg-orange-100 p-2">
          {t.annualSummary}
        </h3>
        <div className="stats-row grid grid-cols-3 gap-4 text-sm">
          <div className="decision-section text-center border border-black p-3">
            <div className="font-bold">{t.annualAverage}</div>
            <div className="text-2xl font-bold text-blue-700">{annualSummary.annualAverage.toFixed(2)}/20</div>
          </div>
          <div className="decision-section text-center border border-black p-3">
            <div className="font-bold">{t.annualRank}</div>
            <div className="text-xl font-bold text-green-700">{annualSummary.annualRank}</div>
          </div>
          <div className="decision-section text-center border border-black p-3">
            <div className="font-bold">{t.finalDecision}</div>
            <div className={`text-xl font-bold ${
              annualSummary.finalDecision === 'PASSE' ? 'text-green-700' : 
              annualSummary.finalDecision === 'REDOUBLE' ? 'text-orange-700' : 'text-red-700'
            }`}>
              {annualSummary.finalDecision}
            </div>
          </div>
        </div>
      </div>

      {/* Observations */}
      <div className="observations mb-6 space-y-4">
        <div>
          <h4 className="font-bold text-sm mb-2">{t.principalObservations}</h4>
          <div className="border border-black p-3 min-h-[80px] text-sm">
            {annualSummary.principalObservations}
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-sm mb-2">{t.recommendations}</h4>
          <div className="border border-black p-3 min-h-[60px] text-sm">
            {annualSummary.holidayRecommendations}
          </div>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-2">{t.parentComments}</h4>
          <div className="border border-black p-3 min-h-[60px] text-sm">
            {annualSummary.parentObservations || ''}
          </div>
        </div>
      </div>

      {/* Signatures Section */}
      <div className="signatures-section mt-8">
        <h3 className="font-bold text-sm mb-4 bg-gray-100 p-2">
          {t.signatures}
        </h3>
        <div className="grid grid-cols-3 gap-6 text-xs">
          <div className="signature-box text-center">
            <div className="h-20 border-b border-black mb-2"></div>
            <div className="font-bold">{t.parentSignature}</div>
            <div className="mt-1">{t.date}: ___________</div>
          </div>
          <div className="signature-box text-center">
            <div className="h-20 border-b border-black mb-2"></div>
            <div className="font-bold">{t.principalSignature}</div>
            <div className="mt-1">{t.date}: ___________</div>
          </div>
          <div className="signature-box text-center">
            <div className="h-20 border border-black mb-2 flex items-center justify-center">
              <span className="text-gray-500">{t.schoolStamp}</span>
            </div>
            <div className="font-bold">{t.schoolStamp}</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-600 border-t pt-4">
        {language === 'fr' 
          ? 'Document officiel du Ministère des Enseignements Secondaires - République du Cameroun'
          : 'Official document of the Ministry of Secondary Education - Republic of Cameroon'
        }
      </div>
    </div>
  );
};

export default AnnualReportSheet;
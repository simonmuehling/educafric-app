// Standalone, no external deps. Drop into src/components/ReportCardPreview.clean.jsx
import React, { useMemo } from "react";

// ---- tiny helpers (self-contained) ----
const TRIMESTER_TITLE = (t: string) => `BULLETIN SCOLAIRE – ${String(t || "Premier").toUpperCase()} TRIMESTRE`;
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
}

export default function ReportCardPreview({
  student = {},
  lines = [], // [{ subject: "FRANÇAIS", m20: 14.5, coef: 6, remark: "..." }]
  year = "2025/2026",
  trimester = "Premier",
  schoolLogoUrl = "",
  studentPhotoUrl = "",
  qrValue = "https://www.educafric.com",
}: ReportCardProps) {
  const entries = useMemo(() => (lines || []).map(x => ({ ...x, coef: Number(x.coef ?? 1) })), [lines]);
  const totalCoef = entries.reduce((s, x) => s + (x.coef || 0), 0);
  const totalMxCoef = entries.reduce((s, x) => s + (Number(x.m20) || 0) * (x.coef || 0), 0);
  const moyenne = totalCoef ? round2(totalMxCoef / totalCoef) : 0;

  return (
    <div className="bg-white rounded-2xl shadow p-6 print:shadow-none print:p-0">
      <A4Sheet>
        <div className="p-6">
          {/* Header with branding */}
          <div className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-3">
              {schoolLogoUrl ? (
                <img src={schoolLogoUrl} alt="Logo école" className="h-16 object-contain" />
              ) : (
                <div className="h-16 border rounded-xl flex items-center justify-center text-[10px] text-gray-500">Logo École</div>
              )}
            </div>
            <div className="col-span-6 text-center">
              <div className="text-lg font-semibold">{student.school?.name || "Nom de l'Établissement"}</div>
              <div className="text-xs text-gray-600">{student.school?.subtitle || "Adresse – Contacts"}</div>
            </div>
            <div className="col-span-3 flex items-center justify-end gap-3">
              {studentPhotoUrl ? (
                <img src={studentPhotoUrl} alt="Photo élève" className="h-16 w-16 object-cover rounded-lg border" />
              ) : (
                <div className="h-16 w-16 border rounded-xl flex items-center justify-center text-[10px] text-gray-500">Photo</div>
              )}
              <div className="bg-white p-1 rounded-md border"><QRImg value={qrValue} size={64} /></div>
            </div>
          </div>

          {/* Titles */}
          <div className="mt-4">
            <h1 className="text-xl font-semibold text-center">{TRIMESTER_TITLE(trimester)}</h1>
            <p className="text-center text-xs text-gray-600">Année scolaire : {year}</p>
          </div>

          {/* Student info */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            <Info label="Nom & Prénoms" value={student.name || ""} />
            <Info label="Matricule" value={student.id || ""} />
            <Info label="Classe" value={student.classLabel || ""} />
            <Info label="Effectif" value={String(student.classSize || 0)} />
            <Info label="Naissance" value={`${student.birthDate || "—"} à ${student.birthPlace || "—"}`} />
            <Info label="Genre" value={student.gender || "—"} />
            <Info label="Prof. principal" value={student.headTeacher || "—"} />
            <Info label="Parents/Tuteurs" value={student.guardian || "—"} />
          </div>

          {/* Marks table */}
          <div className="mt-4 overflow-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <Th>Discipline</Th>
                  <Th>Coef</Th>
                  <Th>Note /20</Th>
                  <Th>M × coef</Th>
                  <Th>Appréciation</Th>
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
                  <Td colSpan={1}>TOTAL</Td>
                  <Td className="text-center">{totalCoef}</Td>
                  <Td></Td>
                  <Td className="text-center">{round2(totalMxCoef)}</Td>
                  <Td></Td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Averages & discipline */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-gray-500">Moyenne générale</div>
              <div className="text-2xl font-semibold">{moyenne}/20</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-gray-500">Appréciation générale</div>
              <div className="min-h-10 text-sm">{student.generalRemark || ""}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-gray-500">Discipline</div>
              <div className="text-xs grid grid-cols-2 gap-x-2 gap-y-1">
                <span>Abs. just.</span><b>{student.discipline?.absJ || 0} h</b>
                <span>Abs. non just.</span><b>{student.discipline?.absNJ || 0} h</b>
                <span>Retards</span><b>{student.discipline?.late || 0}</b>
                <span>Avert./Blâmes</span><b>{student.discipline?.sanctions || 0}</b>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-10 grid grid-cols-3 gap-4 text-xs">
            <div className="text-center"><div>Le Chef d'établissement</div><div className="h-14"/><div className="font-medium">Visa</div></div>
            <div className="text-center"><div>Le Professeur principal</div><div className="h-14"/><div className="font-medium">Visa</div></div>
            <div className="text-center"><div>Le Parent / Tuteur</div><div className="h-14"/><div className="font-medium">Visa</div></div>
          </div>
        </div>
      </A4Sheet>

      <div className="mt-3 flex justify-end gap-2 print:hidden">
        <button className="px-3 py-2 rounded-xl bg-gray-100" onClick={() => window.print?.()}>Imprimer</button>
      </div>
    </div>
  );
}
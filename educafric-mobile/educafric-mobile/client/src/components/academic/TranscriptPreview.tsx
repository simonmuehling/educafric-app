// Standalone, no external deps. Drop into src/components/TranscriptPreview.clean.jsx
import React, { useMemo } from "react";

// ---- helpers ----
const TRIMESTERS = ["Premier", "Deuxième", "Troisième"]; 
const round2 = (x: number) => Math.round((Number(x) + Number.EPSILON) * 100) / 100;
const computeWeightedAverage = (entries: any[] = []) => {
  let sum = 0, coefSum = 0;
  for (const it of entries) {
    const c = Number(it.coef ?? 1);
    const v = Number(it.m20);
    if (!isNaN(v)) { sum += v * c; coefSum += c; }
  }
  return coefSum ? round2(sum / coefSum) : 0;
};
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

interface StudentData {
  name?: string;
  id?: string;
  classLabel?: string;
  school?: {
    name?: string;
    subtitle?: string;
  };
}

interface TranscriptItem {
  trimester: string;
  subject: string;
  coef: number;
  m20: number;
}

interface TranscriptProps {
  student?: StudentData;
  items?: TranscriptItem[]; // [{ trimester:"Premier", subject:"FRANÇAIS", coef:6, m20:14.5 }]
  year?: string;
  schoolLogoUrl?: string;
  studentPhotoUrl?: string;
  qrValue?: string;
}

export default function TranscriptPreview({
  student = {},
  items = [], // [{ trimester:"Premier", subject:"FRANÇAIS", coef:6, m20:14.5 }]
  year = "2025/2026",
  schoolLogoUrl = "",
  studentPhotoUrl = "",
  qrValue = "https://www.educafric.com",
}: TranscriptProps) {
  const byTrimester = useMemo(() => {
    const m: { [key: string]: TranscriptItem[] } = {}; 
    for (const t of TRIMESTERS) m[t] = [];
    for (const it of items) m[it.trimester]?.push(it);
    return m;
  }, [items]);
  const trimesterAverages = TRIMESTERS.map(t => computeWeightedAverage(byTrimester[t]));
  const annualAverage = round2(trimesterAverages.reduce((a, b) => a + b, 0) / TRIMESTERS.length);

  return (
    <div className="bg-white rounded-2xl shadow p-6 print:shadow-none print:p-0">
      <A4Sheet>
        <div className="p-6">
          {/* Header */}
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

          <div className="mt-4">
            <h2 className="text-xl font-semibold text-center">RELEVÉ / TRANSCRIPT</h2>
            <p className="text-center text-xs text-gray-600">{student.name || "—"} • {student.id || "—"} • {student.classLabel || "—"} • Année {year}</p>
          </div>

          {TRIMESTERS.map(trim => (
            <section key={trim} className="mt-4">
              <h3 className="font-semibold mb-2 text-sm">{trim} trimestre</h3>
              <table className="w-full text-xs">
                <thead className="bg-gray-50"><tr><Th>Discipline</Th><Th>Coef</Th><Th>Note /20</Th></tr></thead>
                <tbody>
                  {(byTrimester[trim] || []).map((it, i) => (
                    <tr key={i} className={i % 2 ? "bg-white" : "bg-gray-50/50"}>
                      <Td>{it.subject}</Td>
                      <Td className="text-center">{it.coef ?? 1}</Td>
                      <Td className="text-center">{it.m20}</Td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-semibold">
                    <Td colSpan={2}>Moyenne trimestrielle</Td>
                    <Td className="text-center">{computeWeightedAverage(byTrimester[trim] || [])}</Td>
                  </tr>
                </tfoot>
              </table>
            </section>
          ))}

          <div className="mt-4 p-3 rounded-xl border flex items-center justify-between text-sm">
            <div>Moyenne annuelle : <b>{annualAverage}/20</b></div>
            <div>Décision : <b>{annualAverage >= 10 ? "Admis / Passage" : "Redoublement à l'étude"}</b></div>
          </div>
        </div>
      </A4Sheet>
      <div className="mt-3 flex justify-end gap-2 print:hidden">
        <button className="px-3 py-2 rounded-xl bg-gray-100" onClick={() => window.print?.()}>Imprimer</button>
      </div>
    </div>
  );
}
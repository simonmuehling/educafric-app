// Standalone, no external deps. Drop into src/components/AttendanceRegisterPreview.clean.jsx
import React, { useState } from "react";

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
const downloadCSV = (content: string, filename: string) => { 
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" }); 
  const url = URL.createObjectURL(blob); 
  const a = document.createElement("a"); 
  a.href = url; 
  a.download = filename; 
  a.click(); 
  URL.revokeObjectURL(url); 
};

interface Student {
  id: string;
  name: string;
}

interface AttendanceProps {
  classId?: string;
  month?: number;
  year?: number;
  students?: Student[];
  schoolLogoUrl?: string;
  qrValue?: string;
}

export default function AttendanceRegisterPreview({
  classId = "6e-A",
  month = 9,
  year = 2025,
  students = [
    { id: "STU-001", name: "AKOA Clarisse" },
    { id: "STU-002", name: "BAMBA Idriss" },
    { id: "STU-003", name: "NDAH John" },
  ],
  schoolLogoUrl = "",
  qrValue = "https://www.educafric.com",
}: AttendanceProps) {
  const [matrix, setMatrix] = useState<{ [key: string]: { [key: number]: string } }>({});
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  function setMark(studentId: string, day: number, value: string) { 
    setMatrix(prev => ({ 
      ...prev, 
      [studentId]: { 
        ...(prev[studentId] || {}), 
        [day]: value 
      } 
    })); 
  }
  
  function exportCSVAttendance() {
    const headers = ["Matricule", "Élève", ...days.map(d => `J${d}`), "Total A", "Total L"]; 
    const out = [headers.join(",")];
    for (const s of students) {
      const row = matrix[s.id] || {}; 
      const A = Object.values(row).filter(v => v === 'A').length; 
      const L = Object.values(row).filter(v => v === 'L').length;
      out.push([s.id, `"${s.name}"`, ...days.map(d => row[d] || ""), A, L].join(","));
    }
    downloadCSV(out.join("\n"), `Attendance-${classId}-${month}-${year}.csv`);
  }

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
              <div className="text-lg font-semibold">Registre de présence</div>
              <div className="text-xs text-gray-600">Classe {classId} • {month}/{year}</div>
            </div>
            <div className="col-span-3 flex items-center justify-end gap-3">
              <div className="bg-white p-1 rounded-md border"><QRImg value={qrValue} size={64} /></div>
            </div>
          </div>

          <div className="mt-4 overflow-auto">
            <table className="min-w-[900px] text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <Th>Matricule</Th>
                  <Th>Élève</Th>
                  {days.map(d => <Th key={d}>{d}</Th>)}
                  <Th>Total A</Th><Th>Total L</Th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, rIdx) => {
                  const row = matrix[s.id] || {}; 
                  const totalA = Object.values(row).filter(v => v === 'A').length; 
                  const totalL = Object.values(row).filter(v => v === 'L').length;
                  return (
                    <tr key={s.id} className={rIdx % 2 ? "bg-white" : "bg-gray-50/50"}>
                      <Td>{s.id}</Td>
                      <Td className="font-medium">{s.name}</Td>
                      {days.map(d => (
                        <Td key={d}>
                          <select className="border rounded-lg px-1 py-1" value={row[d] || ""} onChange={e => setMark(s.id, d, e.target.value)}>
                            <option value=""></option>
                            <option value="P">P</option>
                            <option value="A">A</option>
                            <option value="L">L</option>
                          </select>
                        </Td>
                      ))}
                      <Td className="text-center">{totalA}</Td>
                      <Td className="text-center">{totalL}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </A4Sheet>
      <div className="mt-3 flex justify-end gap-2 print:hidden">
        <button className="px-3 py-2 rounded-xl bg-gray-100" onClick={() => window.print?.()}>Imprimer</button>
        <button className="px-3 py-2 rounded-xl bg-gray-100" onClick={exportCSVAttendance}>Exporter CSV</button>
      </div>
    </div>
  );
}
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Calendar, 
  Users, 
  BookOpen, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Timer
} from "lucide-react";

/**************************** CONFIG ****************************/
const SUBJECTS_CONFIG = [
  { key: "FRANCAIS", label: "FRANÇAIS", labelEN: "FRENCH", coef: 6 },
  { key: "ANGLAIS", label: "ANGLAIS", labelEN: "ENGLISH", coef: 3 },
  { key: "INFORMATIQUE", label: "INFORMATIQUE", labelEN: "COMPUTER SCIENCE", coef: 2 },
  { key: "MATHS", label: "MATHÉMATIQUES", labelEN: "MATHEMATICS", coef: 4 },
  { key: "HISTOIRE", label: "HISTOIRE", labelEN: "HISTORY", coef: 2 },
  { key: "GEO", label: "GÉOGRAPHIE", labelEN: "GEOGRAPHY", coef: 2 },
  { key: "SCIENCES", label: "SCIENCES", labelEN: "SCIENCES", coef: 2 },
  { key: "ECM", label: "ECM", labelEN: "CIVIC EDUCATION", coef: 2 },
  { key: "EAC", label: "ÉDUC. ART. & CULT.", labelEN: "ARTS & CULTURE", coef: 1 },
  { key: "EPS", label: "EPS", labelEN: "PHYSICAL EDUCATION", coef: 2 },
  { key: "ESF", label: "ESF", labelEN: "FAMILY EDUCATION", coef: 1 },
  { key: "TM", label: "TRAVAIL MANUEL", labelEN: "MANUAL WORK", coef: 1 },
  { key: "CN", label: "CULTURES NAT.", labelEN: "NATIONAL CULTURES", coef: 1 },
  { key: "LN", label: "LANGUES NAT.", labelEN: "NATIONAL LANGUAGES", coef: 1 },
  { key: "LATIN", label: "LETTRES CLASSIQUES (LATIN)", labelEN: "CLASSICAL LETTERS (LATIN)", coef: 2 },
];

const TRIMESTERS = [
  { key: "T1", labelFR: "Premier Trimestre", labelEN: "First Term" },
  { key: "T2", labelFR: "Deuxième Trimestre", labelEN: "Second Term" }, 
  { key: "T3", labelFR: "Troisième Trimestre", labelEN: "Third Term" }
];

/**************************** UTILS ****************************/
function round2(x: number): number { 
  return Math.round((Number(x) + Number.EPSILON) * 100) / 100; 
}

function computeAverageForRow(row: any, subjects: any[]): number {
  const entries = Object.entries(row).filter(([k]) => subjects.find(s => s.name === k || s.id.toString() === k));
  let sum = 0, coefSum = 0;
  
  for (const [k, v] of entries) {
    const m = Number(v);
    if (!isNaN(m) && m > 0) {
      const subject = subjects.find(s => s.name === k || s.id.toString() === k);
      const c = subject?.coefficient || 1;
      sum += m * c;
      coefSum += c;
    }
  }
  return coefSum ? round2(sum / coefSum) : 0;
}

function rank(values: number[]): number[] {
  const withIndex = values.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v);
  const ranks = Array(values.length).fill(0);
  let currentRank = 1;
  
  for (let idx = 0; idx < withIndex.length; idx++) {
    if (idx > 0 && withIndex[idx].v < withIndex[idx - 1].v) {
      currentRank = idx + 1;
    }
    ranks[withIndex[idx].i] = currentRank;
  }
  return ranks;
}

function exportCSV(data: any[], filename: string): void {
  const headers = Object.keys(data[0] || {});
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**************************** TABLE COMPONENTS ****************************/
const Th = ({ children, sticky = false, className = "", ...props }: any) => (
  <th className={`px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b ${sticky ? 'sticky left-0 bg-gray-50 z-10' : ''} ${className}`} {...props}>
    {children}
  </th>
);

const Td = ({ children, sticky = false, className = "", ...props }: any) => (
  <td className={`px-2 py-2 text-xs border-b border-gray-200 ${sticky ? 'sticky left-0 bg-inherit z-10' : ''} ${className}`} {...props}>
    {children}
  </td>
);

/**************************** MASTER SHEET COMPONENT ****************************/
export function MasterSheet({ selectedClass, selectedTerm }: { selectedClass: string; selectedTerm: string }) {
  const { language } = useLanguage();
  
  // Fetch students for the selected class
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/director/students', selectedClass],
    enabled: !!selectedClass,
  });

  // Fetch subjects
  const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
    queryKey: ['/api/director/subjects'],
  });

  // Fetch grades for the selected class and term
  const { data: gradesData, isLoading: gradesLoading } = useQuery({
    queryKey: ['/api/director/grades', selectedClass, selectedTerm],
    enabled: !!selectedClass && !!selectedTerm,
  });

  const students = studentsData?.students || [];
  const subjects = subjectsData?.subjects || [];
  const grades = gradesData?.grades || [];

  const rows = useMemo(() => {
    const memo: any = {};
    
    // Initialize with students
    for (const student of students) {
      memo[student.id] = { 
        studentId: student.id, 
        name: student.name, 
        gender: student.gender 
      };
    }
    
    // Add grades
    for (const grade of grades) {
      if (memo[grade.studentId]) {
        const subject = subjects.find((s: any) => s.id === grade.subjectId);
        if (subject) {
          memo[grade.studentId][subject.name] = parseFloat(grade.grade);
        }
      }
    }
    
    // Calculate averages
    return Object.values(memo).map((r: any) => ({ 
      ...r, 
      avg: computeAverageForRow(r, subjects) 
    }));
  }, [students, subjects, grades]);

  const ranksAvg = useMemo(() => rank(rows.map(r => r.avg)), [rows]);

  const isLoading = studentsLoading || subjectsLoading || gradesLoading;

  if (isLoading) {
    return (
      <div className="p-4 text-sm text-center">
        {language === 'fr' ? 'Chargement...' : 'Loading...'}
      </div>
    );
  }

  const termLabel = TRIMESTERS.find(t => t.key === selectedTerm)?.[language === 'fr' ? 'labelFR' : 'labelEN'] || selectedTerm;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              {language === 'fr' ? 'Feuille Maîtresse' : 'Master Sheet'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {language === 'fr' 
                ? `Classe ${selectedClass} • ${termLabel}`
                : `Class ${selectedClass} • ${termLabel}`
              }
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print?.()}
            >
              <Printer className="h-4 w-4 mr-2" />
              {language === 'fr' ? 'Imprimer' : 'Print'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportCSV(rows, `feuille-maitresse-${selectedClass}-${selectedTerm}.csv`)}
            >
              <Download className="h-4 w-4 mr-2" />
              {language === 'fr' ? 'Exporter CSV' : 'Export CSV'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <Th sticky>{language === 'fr' ? 'Matricule' : 'Student ID'}</Th>
                <Th sticky>{language === 'fr' ? 'Nom & Prénoms' : 'Full Name'}</Th>
                {subjects.map((subject: any) => (
                  <Th key={subject.id} className="text-center">
                    {language === 'fr' ? subject.name : subject.nameEN || subject.name}
                    <br />
                    <span className="text-[10px] text-gray-500">
                      {language === 'fr' ? 'coef' : 'coef'} {subject.coefficient || 1}
                    </span>
                  </Th>
                ))}
                <Th className="text-center">{language === 'fr' ? 'MOY /20' : 'AVG /20'}</Th>
                <Th className="text-center">{language === 'fr' ? 'RANG' : 'RANK'}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any, idx: number) => (
                <tr key={row.studentId} className={idx % 2 ? "bg-white" : "bg-gray-50/50"}>
                  <Td sticky>{row.studentId}</Td>
                  <Td sticky className="font-medium">{row.name}</Td>
                  {subjects.map((subject: any) => (
                    <Td key={subject.id} className="text-center">
                      {row[subject.name] ?? "—"}
                    </Td>
                  ))}
                  <Td className="text-center font-semibold">{row.avg}</Td>
                  <Td className="text-center">{ranksAvg[idx]}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/**************************** TRANSCRIPT COMPONENT ****************************/
export function Transcript({ selectedStudentId }: { selectedStudentId: string }) {
  const { language } = useLanguage();

  // Fetch student data
  const { data: studentData, isLoading: studentLoading } = useQuery({
    queryKey: ['/api/director/students', selectedStudentId],
    enabled: !!selectedStudentId,
  });

  // Fetch all grades for this student across all terms
  const { data: transcriptData, isLoading: transcriptLoading } = useQuery({
    queryKey: ['/api/director/student-transcript', selectedStudentId],
    enabled: !!selectedStudentId,
  });

  // Fetch subjects
  const { data: subjectsData } = useQuery({
    queryKey: ['/api/director/subjects'],
  });

  const student = studentData?.student;
  const grades = transcriptData?.grades || [];
  const subjects = subjectsData?.subjects || [];

  const byTrimester = useMemo(() => {
    const grouped: any = {};
    TRIMESTERS.forEach(t => { grouped[t.key] = []; });
    
    for (const grade of grades) {
      if (grouped[grade.term]) {
        const subject = subjects.find((s: any) => s.id === grade.subjectId);
        if (subject) {
          grouped[grade.term].push({
            ...grade,
            subjectName: subject.name,
            subjectCoefficient: subject.coefficient || 1
          });
        }
      }
    }
    return grouped;
  }, [grades, subjects]);

  function avgForTrimester(gradesList: any[]): number {
    if (!gradesList.length) return 0;
    let sum = 0, coefSum = 0;
    
    for (const grade of gradesList) {
      const m = parseFloat(grade.grade);
      if (!isNaN(m)) {
        const c = grade.subjectCoefficient || 1;
        sum += m * c;
        coefSum += c;
      }
    }
    return coefSum ? round2(sum / coefSum) : 0;
  }

  const trimesterAverages = TRIMESTERS.map(t => avgForTrimester(byTrimester[t.key] || []));
  const annualAverage = round2(trimesterAverages.reduce((a, b) => a + b, 0) / TRIMESTERS.length);

  const isLoading = studentLoading || transcriptLoading;

  if (isLoading) {
    return (
      <div className="p-4 text-sm text-center">
        {language === 'fr' ? 'Chargement...' : 'Loading...'}
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-4 text-sm text-center text-muted-foreground">
        {language === 'fr' ? 'Sélectionnez un élève' : 'Select a student'}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {language === 'fr' ? 'Relevé de Notes' : 'Transcript'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {student.name} • {student.className} • {new Date().getFullYear()}/{new Date().getFullYear() + 1}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print?.()}
            >
              <Printer className="h-4 w-4 mr-2" />
              {language === 'fr' ? 'Imprimer' : 'Print'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportCSV(grades, `releve-${student.name}-${new Date().getFullYear()}.csv`)}
            >
              <Download className="h-4 w-4 mr-2" />
              {language === 'fr' ? 'Exporter CSV' : 'Export CSV'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {TRIMESTERS.map(trim => (
          <section key={trim.key}>
            <h3 className="font-semibold mb-3">
              {language === 'fr' ? trim.labelFR : trim.labelEN}
            </h3>
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <Th>{language === 'fr' ? 'Discipline' : 'Subject'}</Th>
                  <Th className="text-center">{language === 'fr' ? 'Coef' : 'Coef'}</Th>
                  <Th className="text-center">{language === 'fr' ? 'Note /20' : 'Grade /20'}</Th>
                </tr>
              </thead>
              <tbody>
                {(byTrimester[trim.key] || []).map((grade: any, i: number) => (
                  <tr key={i} className={i % 2 ? "bg-white" : "bg-gray-50/50"}>
                    <Td>{grade.subjectName}</Td>
                    <Td className="text-center">{grade.subjectCoefficient}</Td>
                    <Td className="text-center">{grade.grade}</Td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100">
                <tr className="font-semibold">
                  <Td colSpan={2}>
                    {language === 'fr' ? 'Moyenne trimestrielle' : 'Term Average'}
                  </Td>
                  <Td className="text-center">{avgForTrimester(byTrimester[trim.key] || [])}</Td>
                </tr>
              </tfoot>
            </table>
          </section>
        ))}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-sm font-medium">
                {language === 'fr' ? 'Moyenne annuelle :' : 'Annual Average:'}
              </span>
              <span className="ml-2 text-lg font-semibold">{annualAverage}/20</span>
            </div>
          </div>
          <div>
            <span className="text-sm font-medium">
              {language === 'fr' ? 'Décision :' : 'Decision:'}
            </span>
            <Badge 
              variant={annualAverage >= 10 ? "default" : "destructive"}
              className="ml-2"
            >
              {annualAverage >= 10 
                ? (language === 'fr' ? 'Admis' : 'Passed')
                : (language === 'fr' ? 'Redoublement' : 'Repeat Year')
              }
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**************************** ACADEMIC MANAGEMENT SUITE MAIN COMPONENT ****************************/
export default function AcademicManagementSuite() {
  const { language } = useLanguage();
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("T1");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  // Fetch available classes
  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ['/api/director/classes'],
  });

  // Fetch students for transcript selection
  const { data: studentsData } = useQuery({
    queryKey: ['/api/director/students'],
  });

  const classes = classesData?.classes || [];
  const students = studentsData?.students || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {language === 'fr' ? 'Gestion Académique' : 'Academic Management'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'fr' 
              ? 'Feuilles maîtresses, relevés de notes et gestion de classe'
              : 'Master sheets, transcripts and class management'
            }
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {language === 'fr' ? 'Paramètres' : 'Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'fr' ? 'Classe' : 'Class'}
              </label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'fr' ? 'Sélectionner une classe' : 'Select a class'} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'fr' ? 'Trimestre' : 'Term'}
              </label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIMESTERS.map((term) => (
                    <SelectItem key={term.key} value={term.key}>
                      {language === 'fr' ? term.labelFR : term.labelEN}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'fr' ? 'Élève (pour relevé)' : 'Student (for transcript)'}
              </label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'fr' ? 'Sélectionner un élève' : 'Select a student'} />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student: any) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="mastersheet" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mastersheet" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            {language === 'fr' ? 'Feuille Maîtresse' : 'Master Sheet'}
          </TabsTrigger>
          <TabsTrigger value="transcript" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {language === 'fr' ? 'Relevé de Notes' : 'Transcript'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mastersheet" className="space-y-4">
          {selectedClass ? (
            <MasterSheet selectedClass={selectedClass} selectedTerm={selectedTerm} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {language === 'fr' 
                    ? 'Sélectionnez une classe pour voir la feuille maîtresse'
                    : 'Select a class to view the master sheet'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transcript" className="space-y-4">
          {selectedStudentId ? (
            <Transcript selectedStudentId={selectedStudentId} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {language === 'fr' 
                    ? 'Sélectionnez un élève pour voir son relevé de notes'
                    : 'Select a student to view their transcript'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
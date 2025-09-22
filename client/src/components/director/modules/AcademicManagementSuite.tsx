import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import BulletinCreationInterface from "@/components/academic/BulletinCreationInterface";
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
  Timer,
  FileText,
  Archive,
  Eye,
  Search
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
    queryFn: () => fetch(`/api/director/students?classId=${selectedClass}`).then(res => res.json()),
    enabled: !!selectedClass,
  });

  // Fetch subjects
  const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
    queryKey: ['/api/director/subjects'],
    queryFn: () => fetch('/api/director/subjects').then(res => res.json()),
  });

  // Fetch grades for the selected class and term
  const { data: gradesData, isLoading: gradesLoading } = useQuery({
    queryKey: ['/api/director/grades', selectedClass, selectedTerm],
    queryFn: () => fetch(`/api/director/grades?classId=${selectedClass}&term=${selectedTerm}`).then(res => res.json()),
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
    queryFn: () => fetch(`/api/director/students?studentId=${selectedStudentId}`).then(res => res.json()),
    enabled: !!selectedStudentId,
  });

  // Fetch all grades for this student across all terms
  const { data: transcriptData, isLoading: transcriptLoading } = useQuery({
    queryKey: ['/api/director/student-transcript', selectedStudentId],
    queryFn: () => fetch(`/api/director/student-transcript?studentId=${selectedStudentId}`).then(res => res.json()),
    enabled: !!selectedStudentId,
  });

  // Fetch subjects
  const { data: subjectsData } = useQuery({
    queryKey: ['/api/director/subjects'],
    queryFn: () => fetch('/api/director/subjects').then(res => res.json()),
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

/**************************** TIMETABLE COMPONENT ****************************/
export function TimeTable({ selectedClass }: { selectedClass: string }) {
  const { language } = useLanguage();
  
  const DAYS = language === 'fr' 
    ? ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
    : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
  const PERIODS = ["07:30-08:20", "08:20-09:10", "09:20-10:10", "10:10-11:00", "11:10-12:00", "12:00-12:50"];

  const [grid, setGrid] = useState(() => {
    const obj: any = {};
    DAYS.forEach(d => { obj[d] = PERIODS.map(() => ""); });
    return obj;
  });

  function updateCell(day: string, idx: number, value: string) {
    setGrid((prev: any) => ({ 
      ...prev, 
      [day]: prev[day].map((v: string, i: number) => (i === idx ? value : v)) 
    }));
  }

  function clearAll() {
    setGrid((prev: any) => {
      const o: any = {};
      for (const d of DAYS) o[d] = prev[d].map(() => "");
      return o;
    });
  }

  if (!selectedClass) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {language === 'fr' 
              ? 'Sélectionnez une classe pour configurer l\'emploi du temps'
              : 'Select a class to configure the timetable'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {language === 'fr' ? 'Emploi du Temps' : 'Timetable'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {language === 'fr' 
                ? `Classe ${selectedClass} • Cliquez pour saisir les matières et salles`
                : `Class ${selectedClass} • Click to enter subjects and rooms`
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
              onClick={clearAll}
            >
              {language === 'fr' ? 'Vider' : 'Clear'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <Th>{language === 'fr' ? 'Jour / Heure' : 'Day / Time'}</Th>
                {PERIODS.map(p => <Th key={p}>{p}</Th>)}
              </tr>
            </thead>
            <tbody>
              {Object.entries(grid).map(([day, slots], rIndex) => (
                <tr key={day} className={rIndex % 2 ? "bg-white" : "bg-gray-50/50"}>
                  <Td className="font-medium">{day}</Td>
                  {(slots as string[]).map((value, idx) => (
                    <Td key={idx}>
                      <Input
                        className="w-full h-8 text-xs"
                        placeholder={language === 'fr' ? "Ex: MATHS – Salle 3" : "Ex: MATH – Room 3"}
                        value={value}
                        onChange={e => updateCell(day, idx, e.target.value)}
                      />
                    </Td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/**************************** ARCHIVE MANAGEMENT COMPONENT ****************************/
export function ArchiveManagement() {
  const { language } = useLanguage();
  const [filters, setFilters] = useState({
    academicYear: '',
    classId: '',
    term: '',
    type: '',
    search: '',
    page: 1,
    limit: 20
  });

  // Fetch archives with filters
  const { data: archivesData, isLoading: archivesLoading, refetch } = useQuery({
    queryKey: ['/api/director/archives', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      return fetch(`/api/director/archives?${params}`).then(res => res.json());
    },
  });

  // Fetch archive statistics
  const { data: statsData } = useQuery({
    queryKey: ['/api/director/archives/stats', filters.academicYear],
    queryFn: () => {
      const url = filters.academicYear 
        ? `/api/director/archives/stats?academicYear=${filters.academicYear}`
        : '/api/director/archives/stats';
      return fetch(url).then(res => res.json());
    },
  });

  const archives = archivesData?.documents || archivesData?.data?.documents || [];
  const stats = statsData?.data || statsData || {};
  
  const handleDownload = async (archiveId: number, filename: string) => {
    try {
      const response = await fetch(`/api/director/archives/${archiveId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return language === 'fr' 
      ? date.toLocaleDateString('fr-FR')
      : date.toLocaleDateString('en-US');
  };

  const getTermLabel = (termCode: string): string => {
    const termMap = {
      'T1': language === 'fr' ? 'Premier' : 'First',
      'T2': language === 'fr' ? 'Deuxième' : 'Second', 
      'T3': language === 'fr' ? 'Troisième' : 'Third',
      'Premier': language === 'fr' ? 'Premier' : 'First',
      'Deuxième': language === 'fr' ? 'Deuxième' : 'Second',
      'Troisième': language === 'fr' ? 'Troisième' : 'Third'
    };
    return termMap[termCode as keyof typeof termMap] || termCode;
  };

  const handleViewDetails = (archive: any) => {
    // TODO: Implement archive details modal
    console.log('View archive details:', archive);
    alert(`Archive: ${archive.filename}\nType: ${archive.type}\nClass: ${archive.classId}\nTerm: ${getTermLabel(archive.term)}\nYear: ${archive.academicYear}`);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'fr' ? 'Total Documents' : 'Total Documents'}
                </p>
                <p className="text-2xl font-bold">{stats.totalDocuments || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'fr' ? 'Bulletins' : 'Bulletins'}
                </p>
                <p className="text-2xl font-bold">{stats.totalBulletins || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'fr' ? 'Feuilles Maîtresses' : 'Master Sheets'}
                </p>
                <p className="text-2xl font-bold">{stats.totalMastersheets || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'fr' ? 'Taille Totale' : 'Total Size'}
                </p>
                <p className="text-2xl font-bold">{formatFileSize(stats.totalSizeBytes || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {language === 'fr' ? 'Filtres de Recherche' : 'Search Filters'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Input
              placeholder={language === 'fr' ? 'Année académique...' : 'Academic year...'}
              value={filters.academicYear}
              onChange={(e) => setFilters(prev => ({ ...prev, academicYear: e.target.value }))}
              data-testid="input-academic-year-filter"
            />
            
            <Input
              placeholder={language === 'fr' ? 'ID Classe...' : 'Class ID...'}
              value={filters.classId}
              onChange={(e) => setFilters(prev => ({ ...prev, classId: e.target.value }))}
              data-testid="input-class-id-filter"
            />
            
            <Select value={filters.term} onValueChange={(value) => setFilters(prev => ({ ...prev, term: value }))} data-testid="select-term-filter">
              <SelectTrigger>
                <SelectValue placeholder={language === 'fr' ? 'Trimestre' : 'Term'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  {language === 'fr' ? 'Tous les trimestres' : 'All terms'}
                </SelectItem>
                <SelectItem value="T1">
                  {language === 'fr' ? 'Premier Trimestre' : 'First Term'}
                </SelectItem>
                <SelectItem value="T2">
                  {language === 'fr' ? 'Deuxième Trimestre' : 'Second Term'}
                </SelectItem>
                <SelectItem value="T3">
                  {language === 'fr' ? 'Troisième Trimestre' : 'Third Term'}
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))} data-testid="select-type-filter">
              <SelectTrigger>
                <SelectValue placeholder={language === 'fr' ? 'Type' : 'Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  {language === 'fr' ? 'Tous les types' : 'All types'}
                </SelectItem>
                <SelectItem value="bulletin">
                  {language === 'fr' ? 'Bulletins' : 'Bulletins'}
                </SelectItem>
                <SelectItem value="mastersheet">
                  {language === 'fr' ? 'Feuilles Maîtresses' : 'Master Sheets'}
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              data-testid="input-search-filter"
            />
            
            <Button onClick={() => refetch()} data-testid="button-search-archives">
              <Search className="h-4 w-4 mr-2" />
              {language === 'fr' ? 'Actualiser' : 'Refresh'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Archives List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            {language === 'fr' ? 'Archives des Documents' : 'Document Archives'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {archivesLoading ? (
            <div className="p-8 text-center" data-testid="loading-archives">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              {language === 'fr' ? 'Chargement des archives...' : 'Loading archives...'}
            </div>
          ) : archives.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground" data-testid="empty-archives">
              <Archive className="h-12 w-12 mx-auto mb-4" />
              <p>{language === 'fr' ? 'Aucune archive trouvée' : 'No archives found'}</p>
              <p className="text-sm mt-2">
                {language === 'fr' 
                  ? 'Les documents archivés apparaîtront ici après envoi'
                  : 'Archived documents will appear here after sending'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>{language === 'fr' ? 'Nom du Fichier' : 'Filename'}</Th>
                    <Th>{language === 'fr' ? 'Type' : 'Type'}</Th>
                    <Th>{language === 'fr' ? 'Classe' : 'Class'}</Th>
                    <Th>{language === 'fr' ? 'Trimestre' : 'Term'}</Th>
                    <Th>{language === 'fr' ? 'Année' : 'Year'}</Th>
                    <Th>{language === 'fr' ? 'Taille' : 'Size'}</Th>
                    <Th>{language === 'fr' ? 'Envoyé le' : 'Sent Date'}</Th>
                    <Th>{language === 'fr' ? 'Actions' : 'Actions'}</Th>
                  </tr>
                </thead>
                <tbody>
                  {archives.map((archive: any, index: number) => (
                    <tr key={archive.id} className={index % 2 ? "bg-white" : "bg-gray-50/50"} data-testid={`row-archive-${archive.id}`}>
                      <Td className="font-medium" data-testid={`text-filename-${archive.id}`}>{archive.filename}</Td>
                      <Td data-testid={`badge-type-${archive.id}`}>
                        <Badge variant={archive.type === 'bulletin' ? 'default' : 'secondary'}>
                          {archive.type === 'bulletin' 
                            ? (language === 'fr' ? 'Bulletin' : 'Bulletin')
                            : (language === 'fr' ? 'Feuille M.' : 'Master Sheet')
                          }
                        </Badge>
                      </Td>
                      <Td data-testid={`text-class-${archive.id}`}>{archive.classId}</Td>
                      <Td data-testid={`text-term-${archive.id}`}>{getTermLabel(archive.term)}</Td>
                      <Td data-testid={`text-year-${archive.id}`}>{archive.academicYear}</Td>
                      <Td data-testid={`text-size-${archive.id}`}>{formatFileSize(archive.sizeBytes)}</Td>
                      <Td data-testid={`text-date-${archive.id}`}>{formatDate(archive.sentAt)}</Td>
                      <Td>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(archive.id, archive.filename)}
                            data-testid={`button-download-archive-${archive.id}`}
                            title={language === 'fr' ? 'Télécharger' : 'Download'}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(archive)}
                            data-testid={`button-view-archive-${archive.id}`}
                            title={language === 'fr' ? 'Voir détails' : 'View details'}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**************************** ATTENDANCE REGISTER COMPONENT ****************************/
export function AttendanceRegister({ selectedClass }: { selectedClass: string }) {
  const { language } = useLanguage();
  
  // Get current month and year
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  
  // Fetch students for the selected class
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/director/students', selectedClass],
    queryFn: () => fetch(`/api/director/students?classId=${selectedClass}`).then(res => res.json()),
    enabled: !!selectedClass,
  });

  const students = studentsData?.students || [];
  
  // Attendance matrix: { studentId: { dayNumber: "P"|"A"|"L" } }
  const [matrix, setMatrix] = useState<{ [key: string]: { [key: string]: string } }>({});

  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  function setMark(studentId: number, day: number, value: string) {
    setMatrix(prev => ({ 
      ...prev, 
      [studentId]: { ...(prev[studentId] || {}), [day]: value } 
    }));
  }

  const monthNames = language === 'fr' 
    ? ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  if (!selectedClass) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {language === 'fr' 
              ? 'Sélectionnez une classe pour gérer les présences'
              : 'Select a class to manage attendance'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  if (studentsLoading) {
    return (
      <div className="p-4 text-sm text-center">
        {language === 'fr' ? 'Chargement...' : 'Loading...'}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {language === 'fr' ? 'Registre de Présence' : 'Attendance Register'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {language === 'fr' 
                ? `Classe ${selectedClass} • ${monthNames[month - 1]} ${year}`
                : `Class ${selectedClass} • ${monthNames[month - 1]} ${year}`
              }
            </p>
            <p className="text-xs text-muted-foreground">
              {language === 'fr' 
                ? 'P = Présent, A = Absent, L = Retard'
                : 'P = Present, A = Absent, L = Late'
              }
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportCSV(
                students.map((s: any) => {
                  const row = matrix[s.id] || {};
                  const totalA = Object.values(row).filter(v => v === "A").length;
                  const totalL = Object.values(row).filter(v => v === "L").length;
                  return {
                    matricule: s.id,
                    nom: s.name,
                    ...Object.fromEntries(days.map(d => [`J${d}`, row[d] || ""])),
                    totalA,
                    totalL
                  };
                }),
                `attendance-${selectedClass}-${year}-${month}.csv`
              )}
            >
              <Download className="h-4 w-4 mr-2" />
              {language === 'fr' ? 'Exporter CSV' : 'Export CSV'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Month/Year Selector */}
        <div className="flex gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === 'fr' ? 'Mois' : 'Month'}
            </label>
            <Select value={month.toString()} onValueChange={(value) => setMonth(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((name, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === 'fr' ? 'Année' : 'Year'}
            </label>
            <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026].map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <Th sticky>{language === 'fr' ? 'Matricule' : 'Student ID'}</Th>
                <Th sticky>{language === 'fr' ? 'Élève' : 'Student'}</Th>
                {days.map(d => <Th key={d} className="text-center">{d}</Th>)}
                <Th className="text-center">{language === 'fr' ? 'Total A' : 'Total A'}</Th>
                <Th className="text-center">{language === 'fr' ? 'Total L' : 'Total L'}</Th>
              </tr>
            </thead>
            <tbody>
              {students.map((student: any, rIdx: number) => {
                const row = matrix[student.id] || {};
                const totalA = Object.values(row).filter(v => v === "A").length;
                const totalL = Object.values(row).filter(v => v === "L").length;
                
                return (
                  <tr key={student.id} className={rIdx % 2 ? "bg-white" : "bg-gray-50/50"}>
                    <Td sticky>{student.id}</Td>
                    <Td sticky className="font-medium">{student.name}</Td>
                    {days.map(d => (
                      <Td key={d} className="text-center">
                        <Select
                          value={row[d] || ""}
                          onValueChange={(value) => setMark(student.id, d, value)}
                        >
                          <SelectTrigger className="w-12 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">-</SelectItem>
                            <SelectItem value="P">P</SelectItem>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="L">L</SelectItem>
                          </SelectContent>
                        </Select>
                      </Td>
                    ))}
                    <Td className="text-center font-medium text-red-600">{totalA}</Td>
                    <Td className="text-center font-medium text-orange-600">{totalL}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/**************************** TEACHER SUBMISSIONS MANAGER ****************************/
function TeacherSubmissionsManager({ selectedClass, selectedTerm }: { selectedClass: string; selectedTerm: string }) {
  const { language } = useLanguage();
  
  // Fetch pending teacher submissions
  const { data: submissionsData, isLoading: submissionsLoading, refetch } = useQuery({
    queryKey: ['/api/comprehensive-bulletins/teacher-submissions', selectedClass, selectedTerm],
    queryFn: () => fetch(`/api/comprehensive-bulletins/teacher-submissions?classId=${selectedClass}&term=${selectedTerm}`).then(res => res.json()),
    enabled: !!selectedClass && !!selectedTerm,
  });

  const handleApproveSubmission = async (submissionId: string) => {
    try {
      const response = await fetch(`/api/comprehensive-bulletins/approve-submission/${submissionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        refetch();
      }
    } catch (error) {
      console.error('Failed to approve submission:', error);
    }
  };

  const handleRejectSubmission = async (submissionId: string, reason: string) => {
    try {
      const response = await fetch(`/api/comprehensive-bulletins/reject-submission/${submissionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      
      if (response.ok) {
        refetch();
      }
    } catch (error) {
      console.error('Failed to reject submission:', error);
    }
  };

  if (!selectedClass || !selectedTerm) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Timer className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {language === 'fr' 
              ? 'Sélectionnez une classe et un trimestre pour voir les soumissions des enseignants'
              : 'Select a class and term to view teacher submissions'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  if (submissionsLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {language === 'fr' ? 'Chargement des soumissions...' : 'Loading submissions...'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const submissions = submissionsData?.data || [];

  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Timer className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {language === 'fr' 
              ? 'Aucune soumission en attente pour cette classe et ce trimestre'
              : 'No pending submissions for this class and term'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            {language === 'fr' ? 'Soumissions Enseignants en Attente' : 'Pending Teacher Submissions'}
            <Badge variant="secondary">{submissions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {submissions.map((submission: any) => (
              <Card key={submission.id} className="border-l-4 border-yellow-400">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold text-lg">{submission.studentName}</h4>
                      <p className="text-sm text-muted-foreground">{submission.className}</p>
                      <p className="text-sm">
                        <strong>{language === 'fr' ? 'Enseignant:' : 'Teacher:'}</strong> {submission.teacherName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">
                        <strong>{language === 'fr' ? 'Trimestre:' : 'Term:'}</strong> {submission.term}
                      </p>
                      <p className="text-sm">
                        <strong>{language === 'fr' ? 'Année:' : 'Year:'}</strong> {submission.academicYear}
                      </p>
                      <p className="text-sm">
                        <strong>{language === 'fr' ? 'Soumis le:' : 'Submitted:'}</strong> {' '}
                        {new Date(submission.submittedAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleApproveSubmission(submission.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                        data-testid={`approve-submission-${submission.id}`}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {language === 'fr' ? 'Approuver' : 'Approve'}
                      </Button>
                      <Button
                        onClick={() => handleRejectSubmission(submission.id, 'Needs revision')}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        size="sm"
                        data-testid={`reject-submission-${submission.id}`}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {language === 'fr' ? 'Rejeter' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                  
                  {submission.subjectGrades && submission.subjectGrades.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="font-medium mb-2">
                        {language === 'fr' ? 'Notes soumises:' : 'Submitted Grades:'}
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {submission.subjectGrades.map((grade: any, index: number) => (
                          <div key={index} className="bg-gray-50 p-2 rounded">
                            <p className="font-medium">{grade.subjectName}</p>
                            <p className="text-blue-600 font-bold">{grade.grade}/20</p>
                            {grade.coefficient && (
                              <p className="text-xs text-muted-foreground">Coef: {grade.coefficient}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
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
      <Tabs defaultValue="transcript" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="transcript" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {language === 'fr' ? 'Relevé de Notes' : 'Transcript'}
          </TabsTrigger>
          <TabsTrigger value="bulletins" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {language === 'fr' ? 'Création Bulletins' : 'Create Bulletins'}
          </TabsTrigger>
          <TabsTrigger value="mastersheet" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            {language === 'fr' ? 'Feuille Maîtresse' : 'Master Sheet'}
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            {language === 'fr' ? 'Soumissions Enseignants' : 'Teacher Submissions'}
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {language === 'fr' ? 'Présences' : 'Attendance'}
          </TabsTrigger>
          <TabsTrigger value="archives" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            {language === 'fr' ? 'Archives' : 'Archives'}
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

        <TabsContent value="bulletins" className="space-y-4">
          <BulletinCreationInterface />
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <TeacherSubmissionsManager selectedClass={selectedClass} selectedTerm={selectedTerm} />
        </TabsContent>


        <TabsContent value="attendance" className="space-y-4">
          <AttendanceRegister selectedClass={selectedClass} />
        </TabsContent>

        <TabsContent value="archives" className="space-y-4">
          <ArchiveManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
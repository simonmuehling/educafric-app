import React, { useEffect, useMemo, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import BulletinCreationInterface from "@/components/academic/BulletinCreationInterface";
import TeacherSubmittedBulletins from "./TeacherSubmittedBulletins";
import TeacherGradeReview from "./TeacherGradeReview";
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
  Search,
  School,
  UserCheck
} from "lucide-react";
import { Label } from "@/components/ui/label";

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

/**************************** COMPILE BULLETINS FROM GRADES COMPONENT ****************************/
function CompileBulletinsFromGrades() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedTerm, setSelectedTerm] = useState('T1');
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [compilingStudent, setCompilingStudent] = useState<number | null>(null);

  // Fetch available classes
  const { data: classesData } = useQuery({
    queryKey: ['/api/director/classes']
  });
  const classes = classesData?.classes || [];

  // Fetch students ready for compilation
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: [`/api/director/students-ready-for-compilation?classId=${selectedClass}&term=${selectedTerm}&academicYear=${selectedYear}`],
    enabled: !!selectedClass && !!selectedTerm && !!selectedYear
  });

  const readyStudents = studentsData?.students || [];

  const text = {
    fr: {
      title: 'Compiler des Bulletins depuis Notes Approuvées',
      subtitle: 'Les élèves dont toutes les notes sont approuvées peuvent avoir leur bulletin compilé automatiquement',
      selectClass: 'Sélectionner une classe',
      selectTerm: 'Sélectionner un trimestre',
      selectYear: 'Année académique',
      noStudents: 'Aucun élève prêt',
      noStudentsDesc: 'Aucun élève n\'a toutes ses notes approuvées pour les filtres sélectionnés',
      studentName: 'Élève',
      notesCount: 'Notes',
      compile: 'Compiler',
      compiling: 'Compilation...',
      compileSuccess: 'Bulletin compilé',
      compileSuccessDesc: 'Le bulletin a été compilé avec succès et apparaît maintenant dans "Bulletins Soumis"',
      compileError: 'Erreur de compilation',
      loading: 'Chargement...'
    },
    en: {
      title: 'Compile Bulletins from Approved Grades',
      subtitle: 'Students with all approved grades can have their bulletin automatically compiled',
      selectClass: 'Select a class',
      selectTerm: 'Select a term',
      selectYear: 'Academic year',
      noStudents: 'No students ready',
      noStudentsDesc: 'No students have all their grades approved for the selected filters',
      studentName: 'Student',
      notesCount: 'Grades',
      compile: 'Compile',
      compiling: 'Compiling...',
      compileSuccess: 'Bulletin compiled',
      compileSuccessDesc: 'The bulletin was successfully compiled and now appears in "Submitted Bulletins"',
      compileError: 'Compilation error',
      loading: 'Loading...'
    }
  };

  const t = text[language as keyof typeof text];

  // Compile mutation
  const compileMutation = useMutation({
    mutationFn: async (data: { studentId: number; classId: number; term: string; academicYear: string; studentName: string }) => {
      setCompilingStudent(data.studentId);
      const response = await apiRequest('POST', '/api/director/compile-approved-grades', {
        studentId: data.studentId,
        classId: data.classId,
        term: data.term,
        academicYear: data.academicYear
      });
      return { ...await response.json(), studentName: data.studentName };
    },
    onSuccess: (data) => {
      toast({
        title: t.compileSuccess,
        description: `${t.compileSuccessDesc} (${data.studentName})`,
      });
      // Invalidate both queries
      queryClient.invalidateQueries({ queryKey: ['/api/director/teacher-bulletins'] });
      queryClient.invalidateQueries({ queryKey: [`/api/director/students-ready-for-compilation?classId=${selectedClass}&term=${selectedTerm}&academicYear=${selectedYear}`] });
      setCompilingStudent(null);
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to compile bulletin';
      const isDuplicate = errorMessage.includes('already exists') || errorMessage.includes('already compiled');
      
      toast({
        title: isDuplicate 
          ? (language === 'fr' ? 'Bulletin déjà compilé' : 'Bulletin already compiled')
          : t.compileError,
        description: isDuplicate
          ? (language === 'fr' 
              ? 'Un bulletin compilé existe déjà pour cet élève et ce trimestre. Consultez la section "Bulletins Soumis".'
              : 'A compiled bulletin already exists for this student and term. Check the "Submitted Bulletins" section.')
          : errorMessage,
        variant: 'destructive'
      });
      setCompilingStudent(null);
    }
  });

  return (
    <Card data-testid="card-compile-bulletins">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-blue-600" />
          {t.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label>{t.selectClass}</Label>
            <Select value={selectedClass?.toString() || ''} onValueChange={(val) => setSelectedClass(parseInt(val))}>
              <SelectTrigger data-testid="select-class">
                <SelectValue placeholder={t.selectClass} />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls: any) => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    {cls.name} ({cls.level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t.selectTerm}</Label>
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger data-testid="select-term">
                <SelectValue placeholder={t.selectTerm} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="T1">Trimestre 1</SelectItem>
                <SelectItem value="T2">Trimestre 2</SelectItem>
                <SelectItem value="T3">Trimestre 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t.selectYear}</Label>
            <Input
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              placeholder="2024-2025"
              data-testid="input-academic-year"
            />
          </div>
        </div>

        {/* Students list */}
        {studentsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">{t.loading}</span>
          </div>
        ) : readyStudents.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">{t.noStudents}</p>
            <p className="text-sm text-gray-500 mt-1">{t.noStudentsDesc}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              {language === 'fr' 
                ? `${readyStudents.length} élève(s) avec toutes les notes approuvées :`
                : `${readyStudents.length} student(s) with all grades approved:`
              }
            </p>
            {readyStudents.map((student: any) => (
              <div key={student.studentId} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{student.studentName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {student.approvedGradesCount} {language === 'fr' ? 'notes approuvées' : 'approved grades'}
                  </p>
                </div>
                <Button
                  onClick={() => compileMutation.mutate({
                    studentId: student.studentId,
                    classId: selectedClass!,
                    term: selectedTerm,
                    academicYear: selectedYear,
                    studentName: student.studentName
                  })}
                  disabled={compilingStudent === student.studentId}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  data-testid={`button-compile-${student.studentId}`}
                >
                  {compilingStudent === student.studentId ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t.compiling}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t.compile}
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**************************** ARCHIVE MANAGEMENT COMPONENT ****************************/
function ArchiveManagementContent() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    academicYear: 'all',
    classId: 'all',
    term: 'all',
    type: 'all',
    search: '',
    page: 1,
    limit: 20
  });

  // Build URL with query params for archives
  const archivesUrl = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') params.append(key, value.toString());
    });
    const queryString = params.toString();
    return queryString ? `/api/director/archives?${queryString}` : '/api/director/archives';
  }, [filters]);

  // Build URL with query params for stats
  const statsUrl = useMemo(() => {
    return filters.academicYear && filters.academicYear !== 'all'
      ? `/api/director/archives/stats?academicYear=${filters.academicYear}`
      : '/api/director/archives/stats';
  }, [filters.academicYear]);

  // Fetch archives with filters - using default fetcher
  const { data: archivesData, isLoading: archivesLoading, error: archivesError, refetch } = useQuery({
    queryKey: [archivesUrl],
  });

  // Fetch archive statistics - using default fetcher
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: [statsUrl],
  });

  // Show error toast if queries fail
  useEffect(() => {
    if (archivesError) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' 
          ? 'Impossible de charger les archives' 
          : 'Failed to load archives',
        variant: 'destructive',
      });
    }
    if (statsError) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' 
          ? 'Impossible de charger les statistiques' 
          : 'Failed to load statistics',
        variant: 'destructive',
      });
    }
  }, [archivesError, statsError, language, toast]);

  const archives = archivesData?.documents || archivesData?.data?.documents || [];
  const stats = statsData?.data || statsData || {};
  const isLoading = archivesLoading || statsLoading;
  
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

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Archive className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {language === 'fr' ? 'Total Archives' : 'Total Archives'}
                </p>
                <p className="text-lg font-semibold" data-testid="stat-total-archives">
                  {stats.totalArchives || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {language === 'fr' ? 'Bulletins' : 'Report Cards'}
                </p>
                <p className="text-lg font-semibold" data-testid="stat-bulletins">
                  {stats.bulletinCount || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {language === 'fr' ? 'Relevés' : 'Transcripts'}
                </p>
                <p className="text-lg font-semibold" data-testid="stat-transcripts">
                  {stats.transcriptCount || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {language === 'fr' ? 'Taille Total' : 'Total Size'}
                </p>
                <p className="text-lg font-semibold" data-testid="stat-total-size">
                  {formatFileSize(stats.totalSize || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'fr' ? 'Filtres' : 'Filters'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div>
              <Label>{language === 'fr' ? 'Année Scolaire' : 'Academic Year'}</Label>
              <Select value={filters.academicYear} onValueChange={(value) => setFilters(prev => ({ ...prev, academicYear: value }))}>
                <SelectTrigger data-testid="select-academic-year-filter">
                  <SelectValue placeholder={language === 'fr' ? 'Sélectionner...' : 'Select...'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                  <SelectItem value="2023-2024">2023-2024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{language === 'fr' ? 'Type' : 'Type'}</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger data-testid="select-type-filter">
                  <SelectValue placeholder={language === 'fr' ? 'Sélectionner...' : 'Select...'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="bulletin">Bulletins</SelectItem>
                  <SelectItem value="transcript">Relevés</SelectItem>
                  <SelectItem value="annual-report">Rapports Annuels</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{language === 'fr' ? 'Recherche' : 'Search'}</Label>
              <Input
                placeholder={language === 'fr' ? 'Nom du fichier...' : 'Filename...'}
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                data-testid="input-search-filter"
              />
            </div>
            
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
          {isLoading ? (
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
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <Th>{language === 'fr' ? 'Nom du Fichier' : 'Filename'}</Th>
                    <Th>{language === 'fr' ? 'Type' : 'Type'}</Th>
                    <Th>{language === 'fr' ? 'Taille' : 'Size'}</Th>
                    <Th>{language === 'fr' ? 'Année' : 'Year'}</Th>
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
                            ? (language === 'fr' ? 'Bulletin' : 'Report Card')
                            : archive.type === 'transcript'
                            ? (language === 'fr' ? 'Relevé' : 'Transcript')
                            : (language === 'fr' ? 'Rapport Annuel' : 'Annual Report')
                          }
                        </Badge>
                      </Td>
                      <Td data-testid={`text-filesize-${archive.id}`}>{formatFileSize(archive.fileSize || 0)}</Td>
                      <Td data-testid={`text-year-${archive.id}`}>{archive.academicYear}</Td>
                      <Td data-testid={`text-date-${archive.id}`}>{formatDate(archive.sentAt || archive.createdAt)}</Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownload(archive.id, archive.filename)}
                            data-testid={`button-download-${archive.id}`}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            {language === 'fr' ? 'Télécharger' : 'Download'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => window.open(archive.previewUrl, '_blank')}
                            data-testid={`button-preview-${archive.id}`}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            {language === 'fr' ? 'Voir' : 'View'}
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

/**************************** PRINT HANDLER ****************************/
const handlePrint = (el: HTMLElement | null) => {
  if (!el) return;
  const cleanup = () => { 
    el.removeAttribute('data-print-active'); 
    window.removeEventListener('afterprint', cleanup); 
  };
  el.setAttribute('data-print-active', 'true');
  window.addEventListener('afterprint', cleanup, { once: true });
  requestAnimationFrame(() => window.print());
};

/**************************** REPORT CARDS LIST COMPONENT (Shows created bulletins) ****************************/
export function ReportCardsList({ selectedClass, selectedTerm, className }: { selectedClass: string; selectedTerm: string; className?: string }) {
  const { language } = useLanguage();

  // Fetch school information from database
  const { data: schoolData, isLoading: schoolLoading } = useQuery({
    queryKey: ['/api/director/settings'],
    queryFn: async () => {
      const response = await fetch('/api/director/settings', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch school settings');
      const data = await response.json();
      console.log('[REPORT_CARDS] ✅ School settings data:', data);
      return data;
    }
  });

  // Fetch created bulletins from database
  const { data: bulletinsData, isLoading: bulletinsLoading } = useQuery({
    queryKey: ['/api/director/bulletins/list', selectedClass, selectedTerm],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (selectedClass) params.append('classId', selectedClass);
        if (selectedTerm) params.append('term', selectedTerm);
        
        const response = await fetch(`/api/director/bulletins/list?${params}`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch bulletins');
        const data = await response.json();
        
        console.log('[REPORT_CARDS] ✅ Fetched bulletins from database:', data.bulletins?.length || 0);
        return data;
      } catch (error) {
        console.error('[REPORT_CARDS] Error fetching bulletins:', error);
        return { bulletins: [] };
      }
    },
    enabled: !!selectedClass && !!selectedTerm,
  });

  const school = schoolData?.settings?.school || schoolData?.school || {};
  const bulletins = bulletinsData?.bulletins || [];

  const isLoading = schoolLoading || bulletinsLoading;

  if (isLoading) {
    return (
      <div className="p-4 text-sm text-center">
        {language === 'fr' ? 'Chargement...' : 'Loading...'}
      </div>
    );
  }

  const termLabel = TRIMESTERS.find(t => t.key === selectedTerm)?.[language === 'fr' ? 'labelFR' : 'labelEN'] || selectedTerm;

  return (
    <div className="space-y-6">
      {/* School Information Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <School className="h-5 w-5" />
            {language === 'fr' ? 'Informations de l\'École' : 'School Information'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-blue-700">
                {language === 'fr' ? 'Nom de l\'École' : 'School Name'}
              </Label>
              <p className="text-sm font-semibold">{school?.name || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-blue-700">
                {language === 'fr' ? 'Adresse' : 'Address'}
              </Label>
              <p className="text-sm">{school?.address || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-blue-700">
                {language === 'fr' ? 'Email' : 'Email'}
              </Label>
              <p className="text-sm">{school?.email || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-blue-700">
                {language === 'fr' ? 'Téléphone' : 'Phone'}
              </Label>
              <p className="text-sm">{school?.phone || 'N/A'}</p>
            </div>
          </div>
          
          {/* Always show official info section */}
          <div className="mt-4 pt-4 border-t border-blue-200">
            <Label className="text-sm font-medium text-blue-700">
              {language === 'fr' ? 'Informations Officielles' : 'Official Information'}
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <p className="text-sm">
                <span className="font-medium">{language === 'fr' ? 'Délégation Régionale:' : 'Regional Delegation:'}</span> {school?.regionaleMinisterielle || school?.officialInfo?.regionaleMinisterielle || 'DÉLÉGATION RÉGIONALE DU CENTRE'}
              </p>
              <p className="text-sm">
                <span className="font-medium">{language === 'fr' ? 'Délégation Départementale:' : 'Departmental Delegation:'}</span> {school?.delegationDepartementale || school?.officialInfo?.delegationDepartementale || 'DÉLÉGATION DÉPARTEMENTALE DU MFOUNDI'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Created Bulletins Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <FileText className="h-5 w-5" />
            {language === 'fr' ? 'Bulletins Créés' : 'Created Bulletins'}
          </CardTitle>
          <p className="text-sm text-green-600">
            {language === 'fr' 
              ? `${bulletins.length} bulletin(s) pour ${className || selectedClass} - ${termLabel}`
              : `${bulletins.length} bulletin(s) for ${className || selectedClass} - ${termLabel}`
            }
          </p>
        </CardHeader>
        <CardContent>
          {bulletins.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-green-100">
                  <tr>
                    <Th className="text-green-800">{language === 'fr' ? 'Élève' : 'Student'}</Th>
                    <Th className="text-green-800">{language === 'fr' ? 'Matricule' : 'ID'}</Th>
                    <Th className="text-green-800">{language === 'fr' ? 'Moyenne' : 'Average'}</Th>
                    <Th className="text-green-800">{language === 'fr' ? 'Statut' : 'Status'}</Th>
                    <Th className="text-green-800">{language === 'fr' ? 'Code Vérification' : 'Verification Code'}</Th>
                    <Th className="text-green-800">{language === 'fr' ? 'Créé le' : 'Created'}</Th>
                  </tr>
                </thead>
                <tbody>
                  {bulletins.map((bulletin: any) => (
                    <tr key={bulletin.id} className="border-b border-green-100">
                      <Td className="font-medium">{bulletin.studentName}</Td>
                      <Td>{bulletin.studentId}</Td>
                      <Td className="text-center font-semibold">{bulletin.average}/20</Td>
                      <Td>
                        <Badge 
                          variant={bulletin.status === 'completed' ? 'default' : bulletin.status === 'pending' ? 'secondary' : 'outline'}
                          className={bulletin.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {language === 'fr' 
                            ? (bulletin.status === 'completed' ? 'Terminé' : bulletin.status === 'pending' ? 'En attente' : 'Brouillon')
                            : bulletin.status === 'completed' ? 'Completed' : bulletin.status === 'pending' ? 'Pending' : 'Draft'
                          }
                        </Badge>
                      </Td>
                      <Td className="font-mono text-center">{bulletin.verificationCode}</Td>
                      <Td>{new Date(bulletin.createdAt).toLocaleDateString()}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-green-600">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{language === 'fr' ? 'Aucun bulletin créé pour cette classe et ce trimestre' : 'No bulletins created for this class and term'}</p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

/**************************** TRUE MASTERSHEET COMPONENT (Class-wide grade grid) ****************************/
export function MasterSheet({ selectedClass, selectedTerm, className }: { selectedClass: string; selectedTerm: string; className?: string }) {
  const { language } = useLanguage();
  const printRef = useRef<HTMLDivElement>(null);
  
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

  // Fetch school information from database (DATABASE-ONLY)
  const { data: schoolData, isLoading: schoolLoading } = useQuery({
    queryKey: ['/api/director/settings'],
    queryFn: async () => {
      const response = await fetch('/api/director/settings', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch school settings');
      const data = await response.json();
      console.log('[MASTERSHEET] ✅ School settings data:', data);
      return data;
    }
  });

  const students = studentsData?.students || [];
  const subjects = subjectsData?.subjects || [];
  const grades = gradesData?.grades || [];
  const school = schoolData?.settings?.school || schoolData?.school || {};

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

  const isLoading = studentsLoading || subjectsLoading || gradesLoading || schoolLoading;

  if (isLoading) {
    return (
      <div className="p-4 text-sm text-center">
        {language === 'fr' ? 'Chargement...' : 'Loading...'}
      </div>
    );
  }

  const termLabel = TRIMESTERS.find(t => t.key === selectedTerm)?.[language === 'fr' ? 'labelFR' : 'labelEN'] || selectedTerm;

  return (
    <div className="space-y-6">
      {/* Main Master Sheet with Ministry Header */}
      <Card className="w-full" ref={printRef}>
        <CardHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                {language === 'fr' ? 'Fiche Scolaire' : 'Mastersheet'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {language === 'fr' 
                  ? `Classe ${className || selectedClass} • ${termLabel}`
                  : `Class ${className || selectedClass} • ${termLabel}`
                }
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePrint(printRef.current)}
              >
                <Printer className="h-4 w-4 mr-2" />
                {language === 'fr' ? 'Imprimer' : 'Print'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCSV(rows, `fiche-scolaire-${selectedClass}-${selectedTerm}.csv`)}
              >
                <Download className="h-4 w-4 mr-2" />
                {language === 'fr' ? 'Exporter CSV' : 'Export CSV'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Ministry Official Header for Print */}
        <div className="hidden print:block p-4 border-b-2 border-black">
          <div className="text-center space-y-1">
            {/* School Logo - Centered Above */}
            {school?.logoUrl && (
              <div className="flex justify-center mb-2">
                <img 
                  src={school.logoUrl} 
                  alt={language === 'fr' ? 'Logo de l\'établissement' : 'School Logo'}
                  className="h-20 w-20 object-contain"
                />
              </div>
            )}
            
            {/* Bilingual Header */}
            <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase">
              <div className="text-left">
                <div>RÉPUBLIQUE DU CAMEROUN</div>
                <div className="italic">Paix – Travail – Patrie</div>
                <div className="mt-2">MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES</div>
                <div>DÉLÉGATION RÉGIONALE DE {school?.regionaleMinisterielle || school?.officialInfo?.regionaleMinisterielle || '…'}</div>
                <div>DÉLÉGATION DÉPARTEMENTALE DE {school?.delegationDepartementale || school?.officialInfo?.delegationDepartementale || '…'}</div>
                <div className="mt-1 font-bold">{school?.name || 'LYCÉE DE……….'}</div>
              </div>
              <div className="text-right">
                <div>REPUBLIC OF CAMEROON</div>
                <div className="italic">Peace – Work – Fatherland</div>
                <div className="mt-2">MINISTRY OF SECONDARY EDUCATION</div>
                <div>REGIONAL DELEGATION OF {school?.regionaleMinisterielle || school?.officialInfo?.regionaleMinisterielle || '….'}</div>
                <div>DIVISIONAL DELEGATION {school?.delegationDepartementale || school?.officialInfo?.delegationDepartementale || '….'}</div>
                <div className="mt-1 font-bold">HIGH SCHOOL</div>
              </div>
            </div>
            
            {/* Title */}
            <div className="mt-6 pt-4 border-t-2 border-black">
              <h1 className="text-lg font-bold uppercase">
                {language === 'fr' ? 'FICHE SCOLAIRE' : 'MASTERSHEET'}
              </h1>
              <p className="text-sm font-semibold mt-2">
                {language === 'fr' 
                  ? `Classe: ${className || selectedClass} • ${termLabel} • Année ${new Date().getFullYear()}/${new Date().getFullYear() + 1}`
                  : `Class: ${className || selectedClass} • ${termLabel} • Year ${new Date().getFullYear()}/${new Date().getFullYear() + 1}`
                }
              </p>
            </div>
          </div>
        </div>
        
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border border-black print:border-2">
            <thead className="bg-gray-50 print:bg-gray-200">
              <tr>
                <Th sticky className="border-r border-black">{language === 'fr' ? 'Matricule' : 'Student ID'}</Th>
                <Th sticky className="border-r border-black">{language === 'fr' ? 'Nom & Prénoms' : 'Full Name'}</Th>
                {subjects.map((subject: any) => (
                  <Th key={subject.id} className="text-center border-r border-black">
                    {language === 'fr' ? subject.name : subject.nameEN || subject.name}
                    <br />
                    <span className="text-[10px] text-gray-500">
                      {language === 'fr' ? 'coef' : 'coef'} {subject.coefficient || 1}
                    </span>
                  </Th>
                ))}
                <Th className="text-center border-r border-black">{language === 'fr' ? 'MOY /20' : 'AVG /20'}</Th>
                <Th className="text-center">{language === 'fr' ? 'RANG' : 'RANK'}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any, idx: number) => (
                <tr key={row.studentId} className={idx % 2 ? "bg-white" : "bg-gray-50/50"}>
                  <Td sticky className="border-r border-black">{row.studentId}</Td>
                  <Td sticky className="font-medium border-r border-black">{row.name}</Td>
                  {subjects.map((subject: any) => (
                    <Td key={subject.id} className="text-center border-r border-black">
                      {row[subject.name] ?? "—"}
                    </Td>
                  ))}
                  <Td className="text-center font-semibold border-r border-black">{row.avg}</Td>
                  <Td className="text-center">{ranksAvg[idx]}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**************************** TRANSCRIPT COMPONENT ****************************/
export function Transcript({ selectedStudentId }: { selectedStudentId: string }) {
  const { language } = useLanguage();
  const transcriptPrintRef = useRef<HTMLDivElement>(null);

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

  // Fetch school information for ministry header (same as MasterSheet)
  const { data: schoolData, isLoading: schoolLoading } = useQuery({
    queryKey: ['/api/director/settings'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/director/settings', {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch school settings');
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching school settings for transcript:', error);
        return {
          success: true,
          settings: {
            school: {
              name: 'LYCÉE DE MENDONG',
              address: 'Yaoundé, Cameroun',
              regionaleMinisterielle: 'CENTRE',
              delegationDepartementale: 'MFOUNDI'
            }
          }
        };
      }
    }
  });

  const student = studentData?.student;
  const grades = transcriptData?.grades || [];
  const subjects = subjectsData?.subjects || [];
  const school = schoolData?.settings?.school || schoolData?.school || {};

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
    <Card className="w-full" ref={transcriptPrintRef}>
      <CardHeader className="print:hidden">
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
              onClick={() => handlePrint(transcriptPrintRef.current)}
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
      
      {/* Ministry Official Header for Print */}
      <div className="hidden print:block p-4 border-b-2 border-black">
        <div className="text-center space-y-1">
          {/* Bilingual Header */}
          <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase">
            <div className="text-left">
              <div>RÉPUBLIQUE DU CAMEROUN</div>
              <div className="italic">Paix – Travail – Patrie</div>
              <div className="mt-2">MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES</div>
              <div>DÉLÉGATION RÉGIONALE DE {school?.regionaleMinisterielle || school?.officialInfo?.regionaleMinisterielle || '…'}</div>
              <div>DÉLÉGATION DÉPARTEMENTALE DE {school?.delegationDepartementale || school?.officialInfo?.delegationDepartementale || '…'}</div>
              <div className="mt-1 font-bold">{school?.name || 'LYCÉE DE……….'}</div>
            </div>
            <div className="text-right">
              <div>REPUBLIC OF CAMEROON</div>
              <div className="italic">Peace – Work – Fatherland</div>
              <div className="mt-2">MINISTRY OF SECONDARY EDUCATION</div>
              <div>REGIONAL DELEGATION OF {school?.regionaleMinisterielle || school?.officialInfo?.regionaleMinisterielle || '….'}</div>
              <div>DIVISIONAL DELEGATION {school?.delegationDepartementale || school?.officialInfo?.delegationDepartementale || '….'}</div>
              <div className="mt-1 font-bold">HIGH SCHOOL</div>
            </div>
          </div>
          
          {/* Title */}
          <div className="mt-6 pt-4 border-t-2 border-black">
            <h1 className="text-lg font-bold uppercase">
              {language === 'fr' ? 'RELEVÉ DE NOTES' : 'TRANSCRIPT'}
            </h1>
            <p className="text-sm font-semibold mt-2">
              {language === 'fr' 
                ? `Élève: ${student.name} • Matricule: ${student.matricule} • Année ${new Date().getFullYear()}/${new Date().getFullYear() + 1}`
                : `Student: ${student.name} • ID: ${student.matricule} • Year ${new Date().getFullYear()}/${new Date().getFullYear() + 1}`
              }
            </p>
          </div>
        </div>
      </div>
      
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
export function TimeTable({ selectedClass, className }: { selectedClass: string; className?: string }) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const printRef = useRef<HTMLDivElement>(null);
  
  const DAYS = language === 'fr' 
    ? ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
    : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
  const PERIODS = ["07:30-08:20", "08:20-09:10", "09:20-10:10", "10:10-11:00", "11:10-12:00", "12:00-12:50"];

  const [grid, setGrid] = useState(() => {
    const obj: any = {};
    DAYS.forEach(d => { obj[d] = PERIODS.map(() => ""); });
    return obj;
  });

  const [timetableName, setTimetableName] = useState('');
  const [savedTimetables, setSavedTimetables] = useState<any[]>([]);
  const [selectedTimetable, setSelectedTimetable] = useState<string | null>(null);

  // Fetch saved timetables
  const { data: timetablesData, refetch: refetchTimetables } = useQuery({
    queryKey: ['/api/director/timetables', selectedClass],
    queryFn: async () => {
      const response = await fetch(`/api/director/timetables?classId=${selectedClass}`, { credentials: 'include' });
      if (!response.ok) return { timetables: [] };
      return response.json();
    },
    enabled: !!selectedClass,
  });

  useEffect(() => {
    if (timetablesData?.timetables) {
      setSavedTimetables(timetablesData.timetables);
    }
  }, [timetablesData]);

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

  async function saveTimetable() {
    if (!timetableName.trim()) {
      toast({
        title: language === 'fr' ? "Nom requis" : "Name required",
        description: language === 'fr' ? "Donnez un nom à cet emploi du temps" : "Please provide a timetable name",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/director/timetables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: timetableName,
          classId: selectedClass,
          grid: grid,
          isActive: true
        })
      });

      if (!response.ok) throw new Error('Failed to save');
      
      toast({
        title: language === 'fr' ? "✅ Enregistré" : "✅ Saved",
        description: language === 'fr' ? `Emploi du temps "${timetableName}" créé` : `Timetable "${timetableName}" created`
      });
      
      setTimetableName('');
      clearAll();
      refetchTimetables();
    } catch (error) {
      toast({
        title: language === 'fr' ? "Erreur" : "Error",
        description: language === 'fr' ? "Impossible d'enregistrer l'emploi du temps" : "Failed to save timetable",
        variant: "destructive"
      });
    }
  }

  async function deleteTimetable(id: string) {
    try {
      const response = await fetch(`/api/director/timetables/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete');
      
      toast({
        title: language === 'fr' ? "✅ Supprimé" : "✅ Deleted",
        description: language === 'fr' ? "Emploi du temps supprimé" : "Timetable deleted"
      });
      
      refetchTimetables();
      setSelectedTimetable(null);
    } catch (error) {
      toast({
        title: language === 'fr' ? "Erreur" : "Error",
        description: language === 'fr' ? "Impossible de supprimer" : "Failed to delete",
        variant: "destructive"
      });
    }
  }

  function loadTimetable(timetable: any) {
    setSelectedTimetable(timetable.id);
    setGrid(timetable.grid || grid);
    setTimetableName(timetable.name);
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
    <div className="space-y-4" ref={printRef}>
      {/* Saved Timetables List */}
      {savedTimetables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {language === 'fr' ? "Emplois du temps enregistrés" : "Saved Timetables"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {savedTimetables.map(tt => (
                <div key={tt.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <button
                    onClick={() => loadTimetable(tt)}
                    className="flex-1 text-left text-sm hover:text-blue-600 cursor-pointer"
                  >
                    📅 {tt.name}
                  </button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteTimetable(tt.id)}
                    className="ml-2"
                  >
                    {language === 'fr' ? 'Supprimer' : 'Delete'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timetable Editor */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {language === 'fr' ? 'Emploi du Temps' : 'Timetable'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {language === 'fr' 
                  ? `Classe ${className || selectedClass} • Entrez les matières (optionnel: salle/enseignant)`
                  : `Class ${className || selectedClass} • Enter subjects (optional: room/teacher)`
                }
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder={language === 'fr' ? "Nom emploi du temps..." : "Timetable name..."}
                value={timetableName}
                onChange={e => setTimetableName(e.target.value)}
                className="w-48"
              />
              <Button
                onClick={saveTimetable}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {language === 'fr' ? 'Enregistrer' : 'Save'}
              </Button>
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
                          value={row[d] || "none"}
                          onValueChange={(value) => setMark(student.id, d, value === "none" ? "" : value)}
                        >
                          <SelectTrigger className="w-12 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">-</SelectItem>
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
                        onClick={() => handleRejectSubmission(submission.id, language === 'fr' ? 'Nécessite une révision' : 'Needs revision')}
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
  const [activeTab, setActiveTab] = useState<string>("bulletins");
  const tabsContainerRef = React.useRef<HTMLDivElement>(null);
  const tabsListRef = React.useRef<HTMLDivElement>(null);

  // Track tab changes with detailed logging
  React.useEffect(() => {
    console.log(`[ACADEMIC_MGMT] 🔄 Tab changed to: ${activeTab}`);
  }, [activeTab]);

  // Prevent module collapse when clicking tabs - only block on TabsList, not content
  React.useEffect(() => {
    const handleGlobalPointer = (e: PointerEvent) => {
      // Only block propagation if clicking on the tabs list (triggers), not the content
      if (tabsListRef.current?.contains(e.target as Node)) {
        console.log(`[ACADEMIC_MGMT] 🛡️ Blocking propagation for click on tab trigger`);
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };

    document.addEventListener('pointerdown', handleGlobalPointer, { capture: true });
    document.addEventListener('click', handleGlobalPointer, { capture: true });
    document.addEventListener('mousedown', handleGlobalPointer, { capture: true });

    return () => {
      document.removeEventListener('pointerdown', handleGlobalPointer, { capture: true });
      document.removeEventListener('click', handleGlobalPointer, { capture: true });
      document.removeEventListener('mousedown', handleGlobalPointer, { capture: true });
    };
  }, []);

  // Fetch available classes
  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ['/api/director/classes'],
  });

  // Fetch students for transcript selection
  const { data: studentsData } = useQuery({
    queryKey: ['/api/director/students'],
  });

  const classes = (classesData as any)?.classes || [];
  const students = (studentsData as any)?.students || [];
  
  // Get the selected class name for display
  const selectedClassName = classes.find((c: any) => c.id.toString() === selectedClass)?.name || '';

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
              ? 'Fiches scolaires, relevés de notes et gestion de classe'
              : 'Mastersheets, transcripts and class management'
            }
          </p>
        </div>
      </div>

      {/* Selectors for Class, Term, and Academic Year */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Class Selector */}
            <div className="space-y-2">
              <Label htmlFor="class-select" className="text-sm font-medium">
                {language === 'fr' ? 'Classe' : 'Class'}
              </Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="bg-white border-gray-300" id="class-select" data-testid="select-class">
                  <SelectValue placeholder={
                    language === 'fr' ? 'Sélectionner une classe...' : 'Select a class...'
                  } />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {classesLoading ? (
                    <SelectItem value="loading" disabled>
                      {language === 'fr' ? 'Chargement...' : 'Loading...'}
                    </SelectItem>
                  ) : classes.length === 0 ? (
                    <SelectItem value="no-classes" disabled>
                      {language === 'fr' ? 'Aucune classe trouvée' : 'No classes found'}
                    </SelectItem>
                  ) : (
                    classes.map((cls: any) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Term Selector */}
            <div className="space-y-2">
              <Label htmlFor="term-select" className="text-sm font-medium">
                {language === 'fr' ? 'Trimestre' : 'Term'}
              </Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="bg-white border-gray-300" id="term-select" data-testid="select-term">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {TRIMESTERS.map((term) => (
                    <SelectItem key={term.key} value={term.key}>
                      {language === 'fr' ? term.labelFR : term.labelEN}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Academic Year Selector */}
            <div className="space-y-2">
              <Label htmlFor="year-select" className="text-sm font-medium">
                {language === 'fr' ? 'Année Académique' : 'Academic Year'}
              </Label>
              <Select value="2024-2025" onValueChange={() => {}}>
                <SelectTrigger className="bg-white border-gray-300" id="year-select" data-testid="select-year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                  <SelectItem value="2023-2024">2023-2024</SelectItem>
                  <SelectItem value="2022-2023">2022-2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Student Selector for Transcript (only show on transcript tab) */}
          <div className="mt-4 space-y-2">
            <Label htmlFor="student-select" className="text-sm font-medium">
              {language === 'fr' ? 'Élève (pour relevé de notes)' : 'Student (for transcript)'}
            </Label>
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger id="student-select" data-testid="select-student">
                <SelectValue placeholder={
                  language === 'fr' ? 'Sélectionner un élève...' : 'Select a student...'
                } />
              </SelectTrigger>
              <SelectContent>
                {students.length === 0 ? (
                  <SelectItem value="no-students" disabled>
                    {language === 'fr' ? 'Aucun élève trouvé' : 'No students found'}
                  </SelectItem>
                ) : (
                  students.map((student: any) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name}{student.className ? ` - ${student.className}` : ''}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs - Clean Rebuild */}
      <div ref={tabsContainerRef}>
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardHeader className="pb-3">
            <TabsList ref={tabsListRef} className="grid w-full grid-cols-6">
              <TabsTrigger value="grade-review" className="flex items-center gap-2" data-testid="tab-grade-review">
                <UserCheck className="h-4 w-4" />
                <span className="hidden sm:inline">{language === 'fr' ? 'Révision Notes' : 'Grade Review'}</span>
              </TabsTrigger>
              <TabsTrigger value="bulletins" className="flex items-center gap-2" data-testid="tab-bulletins">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">{language === 'fr' ? 'Bulletins' : 'Report Cards'}</span>
              </TabsTrigger>
              <TabsTrigger value="report-cards" className="flex items-center gap-2" data-testid="tab-report-cards">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden sm:inline">{language === 'fr' ? 'Fiche Scolaire' : 'Mastersheet'}</span>
              </TabsTrigger>
              <TabsTrigger value="mastersheet" className="flex items-center gap-2" data-testid="tab-mastersheet">
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">{language === 'fr' ? 'Liste Bulletins' : 'Bulletins List'}</span>
              </TabsTrigger>
              <TabsTrigger value="transcript" className="flex items-center gap-2" data-testid="tab-transcript">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">{language === 'fr' ? 'Relevé' : 'Marksheet'}</span>
              </TabsTrigger>
              <TabsTrigger value="archives" className="flex items-center gap-2" data-testid="tab-archives">
                <Archive className="h-4 w-4" />
                <span className="hidden sm:inline">{language === 'fr' ? 'Archives' : 'Archives'}</span>
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            <TabsContent value="grade-review" className="mt-0">
              <TeacherGradeReview />
            </TabsContent>

            <TabsContent value="bulletins" className="mt-0 space-y-4">
              {/* Compilation Manager - Convert approved grades to bulletins */}
              <CompileBulletinsFromGrades />
              
              {/* Bulletins soumis par les enseignants */}
              <TeacherSubmittedBulletins />
              
              {/* Interface de création de bulletins */}
              <TeacherSubmissionsManager selectedClass={selectedClass} selectedTerm={selectedTerm} />
              <BulletinCreationInterface 
                defaultClass={selectedClass}
                defaultTerm={selectedTerm}
                defaultYear="2025/2026"
                userRole="director"
              />
            </TabsContent>

            <TabsContent value="report-cards" className="mt-0">
              {selectedClass ? (
                <MasterSheet selectedClass={selectedClass} selectedTerm={selectedTerm} className={selectedClassName} />
              ) : (
                <div className="p-8 text-center">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {language === 'fr' 
                      ? 'Sélectionnez une classe pour voir la grille de notes'
                      : 'Select a class to view the grade grid'
                    }
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="mastersheet" className="mt-0">
              {selectedClass ? (
                <ReportCardsList selectedClass={selectedClass} selectedTerm={selectedTerm} className={selectedClassName} />
              ) : (
                <div className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {language === 'fr' 
                      ? 'Sélectionnez une classe pour voir la fiche scolaire'
                      : 'Select a class to view the mastersheet'
                    }
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="transcript" className="mt-0">
              {selectedStudentId ? (
                <Transcript selectedStudentId={selectedStudentId} />
              ) : (
                <div className="p-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {language === 'fr' 
                      ? 'Sélectionnez un élève'
                      : 'Select a student'
                    }
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="archives" className="mt-0">
              <ArchiveManagementContent />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
      </div>
    </div>
  );
}
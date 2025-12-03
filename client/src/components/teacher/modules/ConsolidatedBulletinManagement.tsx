import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import BulletinCreationInterface from '@/components/academic/BulletinCreationInterface';
import TeacherGradeSubmission from '../TeacherGradeSubmission';
import { 
  FileText, 
  Edit3, 
  Database,
  RefreshCw,
  Users,
  Download,
  Eye,
  Plus,
  Calculator,
  Award,
  TrendingUp,
  CheckSquare,
  ClipboardEdit,
  Send,
  ChevronRight,
  School,
  GraduationCap,
  Calendar,
  Filter,
  Menu
} from 'lucide-react';

/**
 * Module consolidé de gestion des bulletins pour les enseignants
 * VERSION MOBILE-FIRST - Adapté complètement aux smartphones
 */
const ConsolidatedBulletinManagement: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<'T1' | 'T2' | 'T3'>('T1');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [activeTab, setActiveTab] = useState('submit-grades');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Bilingual text
  const text = {
    fr: {
      title: 'Gestion Bulletins',
      titleFull: 'Gestion des Bulletins - Format CBA',
      subtitle: 'Bulletins scolaires format CBA officiel',
      subtitleFull: 'Création et suivi des bulletins scolaires selon le format CBA officiel camerounais',
      selectSchool: 'École',
      selectClass: 'Classe',
      selectTerm: 'Trimestre',
      manualDataEntry: 'Saisie',
      bulletinInterface: 'Bulletins',
      submitGrades: 'Notes',
      overview: 'Élèves',
      classStatistics: 'Statistiques de classe',
      selectStudentForEntry: 'Sélectionner un élève',
      loadTestData: 'Charger données test',
      regenerateTestData: 'Régénérer données',
      generatingInProgress: 'Génération...',
      loadTestDataDescription: 'Chargez des données de test pour commencer.',
      regenerateTestDataDescription: 'Régénérez les données pour tester.',
      testDataSummary: 'Données de test CBA',
      student: 'Élève',
      average: 'Moyenne',
      status: 'Statut',
      rank: 'Rang',
      createBulletin: 'Créer',
      viewBulletin: 'Voir',
      downloadPdf: 'PDF',
      generateAll: 'Générer tous',
      exportClass: 'Exporter',
      generalAverage: 'Moyenne',
      successRate: 'Réussite',
      studentsTotal: 'Élèves',
      bulletinsComplete: 'Terminés',
      filters: 'Filtres',
      noDataAvailable: 'Aucune donnée',
      selectSchoolFirst: 'Sélectionnez une école',
      selectClassToStart: 'Sélectionnez une classe',
      term1: 'T1',
      term2: 'T2', 
      term3: 'T3',
      term1Full: '1er Trimestre',
      term2Full: '2ème Trimestre',
      term3Full: '3ème Trimestre',
      done: 'Terminé',
      pending: 'En attente',
      noStudents: 'Aucun élève'
    },
    en: {
      title: 'Report Cards',
      titleFull: 'Report Card Management - CBA Format',
      subtitle: 'Official CBA format report cards',
      subtitleFull: 'Creation and tracking of report cards according to official Cameroonian CBA format',
      selectSchool: 'School',
      selectClass: 'Class',
      selectTerm: 'Term',
      manualDataEntry: 'Entry',
      bulletinInterface: 'Reports',
      submitGrades: 'Grades',
      overview: 'Students',
      classStatistics: 'Class Statistics',
      selectStudentForEntry: 'Select a student',
      loadTestData: 'Load test data',
      regenerateTestData: 'Regenerate data',
      generatingInProgress: 'Generating...',
      loadTestDataDescription: 'Load test data to start.',
      regenerateTestDataDescription: 'Regenerate data to test.',
      testDataSummary: 'CBA test data',
      student: 'Student',
      average: 'Average',
      status: 'Status',
      rank: 'Rank',
      createBulletin: 'Create',
      viewBulletin: 'View',
      downloadPdf: 'PDF',
      generateAll: 'Generate all',
      exportClass: 'Export',
      generalAverage: 'Average',
      successRate: 'Success',
      studentsTotal: 'Students',
      bulletinsComplete: 'Complete',
      filters: 'Filters',
      noDataAvailable: 'No data',
      selectSchoolFirst: 'Select a school',
      selectClassToStart: 'Select a class',
      term1: 'T1',
      term2: 'T2',
      term3: 'T3',
      term1Full: '1st Term',
      term2Full: '2nd Term',
      term3Full: '3rd Term',
      done: 'Done',
      pending: 'Pending',
      noStudents: 'No students'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch teacher classes 
  const { data: classesData, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['/api/teacher/classes'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/teacher/classes');
      return await response.json();
    },
    enabled: !!user
  });

  // Extract schools and classes from response
  const schoolsWithClasses = useMemo(() => {
    if (!classesData) return [];
    
    if (classesData.schoolsWithClasses && Array.isArray(classesData.schoolsWithClasses)) {
      return classesData.schoolsWithClasses;
    }
    
    let allClasses = [];
    if (Array.isArray(classesData)) {
      allClasses = classesData;
    } else if (classesData.classes && Array.isArray(classesData.classes)) {
      allClasses = classesData.classes;
    }
    
    if (allClasses.length > 0) {
      return [{
        schoolId: user?.schoolId || 1,
        schoolName: 'École Principale',
        classes: allClasses
      }];
    }
    return [];
  }, [classesData, user]);

  const schools = useMemo(() => {
    return schoolsWithClasses.map((school: any) => ({
      id: String(school.schoolId),
      name: school.schoolName
    }));
  }, [schoolsWithClasses]);

  const availableClasses = useMemo(() => {
    if (!selectedSchool) return [];
    const school = schoolsWithClasses.find((s: any) => String(s.schoolId) === selectedSchool);
    return school?.classes || [];
  }, [schoolsWithClasses, selectedSchool]);

  const classes = useMemo(() => {
    return schoolsWithClasses.flatMap((school: any) => 
      (school.classes || []).map((cls: any) => ({
        ...cls,
        schoolName: school.schoolName,
        schoolId: school.schoolId
      }))
    );
  }, [schoolsWithClasses]);

  const isSandboxMode = user?.email?.includes('sandbox') || user?.email?.includes('@test.educafric.com');
  const hasNoData = !isLoadingClasses && classes.length === 0;

  // Mutation for loading test data
  const loadTestDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/sandbox/seed');
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Données chargées',
        description: `${data.data.students} élèves et ${data.data.classes} classes`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/classes'] });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
      });
    }
  });

  // Fetch students for selected class
  const { data: studentsData } = useQuery({
    queryKey: ['/api/teacher/students', selectedClass],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/teacher/students?classId=${selectedClass}`);
      return await response.json();
    },
    enabled: !!selectedClass
  });

  const students = Array.isArray(studentsData) ? studentsData : (studentsData?.students || []);
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    return students.filter((student: any) => 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.matricule?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const handleSchoolChange = useCallback((schoolId: string) => {
    setSelectedSchool(schoolId);
    setSelectedClass('');
    setSearchQuery('');
  }, []);

  const handleClassChange = useCallback((classId: string) => {
    setSelectedClass(classId);
    setSearchQuery('');
  }, []);

  const classStats = useMemo(() => {
    if (!students.length) return { average: 0, successRate: 0, total: 0, completed: 0 };
    
    const totalAverage = students.reduce((sum: number, student: any) => sum + (student.average || 0), 0) / students.length;
    const passing = students.filter((student: any) => (student.average || 0) >= 10).length;
    const successRate = (passing / students.length) * 100;
    const completed = students.filter((student: any) => student.bulletinStatus === 'complete').length;
    
    return {
      average: totalAverage,
      successRate,
      total: students.length,
      completed
    };
  }, [students]);

  const getTrimesterLabel = (term: string) => {
    switch (term) {
      case 'T1': return 'Premier';
      case 'T2': return 'Deuxième';
      case 'T3': return 'Troisième';
      default: return 'Premier';
    }
  };

  // Get current class and school names for display
  const currentSchoolName = schools.find((s: any) => s.id === selectedSchool)?.name || '';
  const currentClassName = availableClasses.find((c: any) => String(c.id) === selectedClass)?.name || '';

  return (
    <div className="space-y-3 sm:space-y-6 p-2 sm:p-4 max-w-full overflow-x-hidden">
      {/* Mobile-Optimized Header */}
      <div className="flex flex-col gap-2 sm:gap-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
              <span className="sm:hidden">{t.title}</span>
              <span className="hidden sm:inline">{t.titleFull}</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 sm:line-clamp-1">
              <span className="sm:hidden">{t.subtitle}</span>
              <span className="hidden sm:inline">{t.subtitleFull}</span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 shrink-0">
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-0.5">
              <CheckSquare className="w-3 h-3 mr-1 hidden sm:inline" />
              CBA
            </Badge>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs px-2 py-0.5">
              {filteredStudents.length} {language === 'fr' ? 'él.' : 'st.'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Test Data Section (Sandbox Mode) - Mobile Optimized */}
      {isSandboxMode && hasNoData && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <Database className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-400" />
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                {t.loadTestDataDescription}
              </p>
              <Button 
                onClick={() => loadTestDataMutation.mutate()}
                disabled={loadTestDataMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                size="sm"
                data-testid="load-test-data-button"
              >
                {loadTestDataMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {t.generatingInProgress}
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    {t.loadTestData}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile Filter Sheet + Desktop Inline Filters */}
      <Card className="overflow-hidden">
        <CardContent className="p-2 sm:p-4">
          {/* Mobile: Compact filter display with sheet */}
          <div className="sm:hidden">
            <div className="flex items-center gap-2">
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 justify-start">
                    <Filter className="h-4 w-4 mr-2" />
                    <span className="truncate">
                      {selectedSchool && selectedClass 
                        ? `${currentClassName} • ${selectedTerm}`
                        : t.filters
                      }
                    </span>
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
                  <SheetHeader className="pb-4">
                    <SheetTitle>{t.filters}</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-4">
                    {/* School Selection */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <School className="h-4 w-4 text-blue-600" />
                        {t.selectSchool}
                      </Label>
                      <Select value={selectedSchool} onValueChange={handleSchoolChange}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder={t.selectSchool} />
                        </SelectTrigger>
                        <SelectContent>
                          {schools.map((school: any) => (
                            <SelectItem key={school.id} value={String(school.id)} className="py-3">
                              <span className="flex items-center gap-2">
                                <School className="h-4 w-4" />
                                {school.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Class Selection */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <GraduationCap className="h-4 w-4 text-green-600" />
                        {t.selectClass}
                      </Label>
                      <Select 
                        value={selectedClass} 
                        onValueChange={(val) => {
                          handleClassChange(val);
                          setShowFilters(false);
                        }} 
                        disabled={!selectedSchool}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder={selectedSchool ? t.selectClass : t.selectSchoolFirst} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableClasses.map((cls: any) => (
                            <SelectItem key={cls.id} value={String(cls.id)} className="py-3">
                              <span className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" />
                                {cls.name} - {cls.level}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Term Selection - Large touch targets */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        {t.selectTerm}
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['T1', 'T2', 'T3'] as const).map((term) => (
                          <Button
                            key={term}
                            variant={selectedTerm === term ? "default" : "outline"}
                            className={`h-14 flex flex-col items-center justify-center ${
                              selectedTerm === term ? 'bg-purple-600 hover:bg-purple-700' : ''
                            }`}
                            onClick={() => {
                              setSelectedTerm(term);
                            }}
                          >
                            <span className="text-lg font-bold">{term}</span>
                            <span className="text-xs opacity-80">
                              {term === 'T1' ? t.term1Full : term === 'T2' ? t.term2Full : t.term3Full}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button 
                      className="w-full h-12 mt-4" 
                      onClick={() => setShowFilters(false)}
                      disabled={!selectedSchool || !selectedClass}
                    >
                      <CheckSquare className="h-4 w-4 mr-2" />
                      {language === 'fr' ? 'Appliquer' : 'Apply'}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Quick Term Selector on Mobile */}
              <div className="flex gap-1">
                {(['T1', 'T2', 'T3'] as const).map((term) => (
                  <Button
                    key={term}
                    variant={selectedTerm === term ? "default" : "ghost"}
                    size="sm"
                    className={`px-3 ${selectedTerm === term ? 'bg-purple-600' : ''}`}
                    onClick={() => setSelectedTerm(term)}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: Inline grid filters */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t.selectSchool}</Label>
              <Select value={selectedSchool} onValueChange={handleSchoolChange} data-testid="select-school">
                <SelectTrigger>
                  <SelectValue placeholder={t.selectSchool} />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school: any) => (
                    <SelectItem key={school.id} value={String(school.id)}>
                      <School className="w-4 h-4 inline mr-2" />
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.selectClass}</Label>
              <Select 
                value={selectedClass} 
                onValueChange={handleClassChange} 
                disabled={!selectedSchool}
                data-testid="select-class"
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedSchool ? t.selectClass : t.selectSchoolFirst} />
                </SelectTrigger>
                <SelectContent>
                  {availableClasses.map((cls: any) => (
                    <SelectItem key={cls.id} value={String(cls.id)}>
                      {cls.name} - {cls.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>{t.selectTerm}</Label>
              <Select value={selectedTerm} onValueChange={(value: 'T1' | 'T2' | 'T3') => setSelectedTerm(value)} data-testid="select-term">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="T1">{t.term1Full}</SelectItem>
                  <SelectItem value="T2">{t.term2Full}</SelectItem>
                  <SelectItem value="T3">{t.term3Full}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile-Optimized Statistics Cards */}
      {selectedClass && students.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <Card className="p-2 sm:p-4 text-center bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
            <div className="text-xl sm:text-2xl font-bold text-blue-800 dark:text-blue-200">
              {classStats.total}
            </div>
            <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 truncate">
              {t.studentsTotal}
            </div>
          </Card>
          <Card className="p-2 sm:p-4 text-center bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
            <div className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-200">
              {classStats.average.toFixed(1)}
            </div>
            <div className="text-xs sm:text-sm text-green-600 dark:text-green-400 truncate">
              {t.generalAverage}
            </div>
          </Card>
          <Card className="p-2 sm:p-4 text-center bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800">
            <div className="text-xl sm:text-2xl font-bold text-purple-800 dark:text-purple-200">
              {classStats.successRate.toFixed(0)}%
            </div>
            <div className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 truncate">
              {t.successRate}
            </div>
          </Card>
          <Card className="p-2 sm:p-4 text-center bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800">
            <div className="text-xl sm:text-2xl font-bold text-orange-800 dark:text-orange-200">
              {classStats.completed}/{classStats.total}
            </div>
            <div className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 truncate">
              {t.bulletinsComplete}
            </div>
          </Card>
        </div>
      )}

      {/* Mobile-Optimized Tabs Interface */}
      {selectedSchool && selectedClass && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-4">
          {/* Mobile: Scrollable compact tabs */}
          <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto min-w-full sm:w-full sm:grid sm:grid-cols-3 h-auto p-1 gap-1">
              <TabsTrigger 
                value="submit-grades" 
                className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                data-testid="tab-submit-grades"
              >
                <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="sm:hidden">{t.submitGrades}</span>
                <span className="hidden sm:inline">{language === 'fr' ? 'Soumettre Notes' : 'Submit Grades'}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="bulletin-interface" 
                className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                data-testid="tab-bulletin-interface"
              >
                <ClipboardEdit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="sm:hidden">{t.bulletinInterface}</span>
                <span className="hidden sm:inline">{language === 'fr' ? 'Interface Bulletins' : 'Bulletin Interface'}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="overview" 
                className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                data-testid="tab-overview"
              >
                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="sm:hidden">{t.overview}</span>
                <span className="hidden sm:inline">{language === 'fr' ? 'Vue d\'ensemble' : 'Overview'}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Submit Grades Tab */}
          <TabsContent value="submit-grades" className="space-y-3 sm:space-y-4 mt-0">
            <TeacherGradeSubmission />
          </TabsContent>

          {/* Overview Tab - Mobile Optimized Student Cards */}
          <TabsContent value="overview" className="space-y-3 sm:space-y-4 mt-0">
            <Card>
              <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  {t.classStatistics}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-6 pt-0">
                {filteredStudents.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {filteredStudents.map((student: any) => (
                      <div 
                        key={student.id} 
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 gap-2 sm:gap-3"
                      >
                        {/* Student Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                            {student.matricule?.slice(-2) || student.id}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base truncate">
                              {student.firstName} {student.lastName}
                            </p>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              <span className="truncate">{student.matricule}</span>
                              <span className="shrink-0">•</span>
                              <span className="shrink-0 font-medium">
                                {(student.average || 0).toFixed(1)}/20
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions - Mobile optimized */}
                        <div className="flex items-center gap-2 justify-end sm:justify-start pl-12 sm:pl-0">
                          <Badge 
                            variant={student.bulletinStatus === 'complete' ? 'default' : 'outline'}
                            className="text-xs shrink-0"
                          >
                            {student.bulletinStatus === 'complete' ? t.done : t.pending}
                          </Badge>
                          <Button 
                            size="sm" 
                            className="h-8 px-2 sm:px-3 text-xs sm:text-sm shrink-0"
                            onClick={() => setActiveTab('bulletin-interface')}
                          >
                            <Edit3 className="w-3.5 h-3.5 sm:mr-1" />
                            <span className="hidden sm:inline">{t.createBulletin}</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">{t.noStudents}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulletin Interface Tab */}
          <TabsContent value="bulletin-interface" className="space-y-3 sm:space-y-4 mt-0">
            <BulletinCreationInterface 
              defaultClass={selectedClass}
              defaultTerm={getTrimesterLabel(selectedTerm)}
              defaultYear={academicYear}
              userRole="teacher"
            />
          </TabsContent>
        </Tabs>
      )}

      {/* No Selection State - Mobile Optimized */}
      {(!selectedSchool || !selectedClass) && !hasNoData && (
        <Card className="text-center py-8 sm:py-12">
          <CardContent className="px-4">
            <FileText className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-400" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {!selectedSchool ? t.selectSchool : t.selectClass}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
              {!selectedSchool 
                ? t.selectSchoolFirst
                : t.selectClassToStart
              }
            </p>
            
            {/* Mobile: Show filter button */}
            <Button 
              variant="outline" 
              className="mt-4 sm:hidden"
              onClick={() => setShowFilters(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {t.filters}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsolidatedBulletinManagement;

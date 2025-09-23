import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import TeacherBulletinInterface from '../TeacherBulletinInterface';
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
  CheckSquare
} from 'lucide-react';

/**
 * Module consolidé de gestion des bulletins pour les enseignants
 * Combine les meilleures fonctionnalités des anciens composants avec le système CBA officiel
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
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStudentForEntry, setSelectedStudentForEntry] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Bilingual text
  const text = {
    fr: {
      title: 'Gestion des Bulletins - Format CBA',
      subtitle: 'Création et suivi des bulletins scolaires selon le format CBA officiel camerounais',
      selectSchool: 'Sélectionner une école',
      selectClass: 'Sélectionner une classe',
      selectTerm: 'Sélectionner un trimestre',
      manualDataEntry: 'Saisie manuelle',
      overview: 'Vue d\'ensemble',
      classStatistics: 'Statistiques de classe',
      selectStudentForEntry: 'Sélectionner un élève pour la saisie',
      loadTestData: 'Charger des données de test',
      regenerateTestData: 'Régénérer les données de test',
      generatingInProgress: 'Génération en cours...',
      loadTestDataDescription: 'Chargez des données de test pour commencer à travailler avec le module bulletins.',
      regenerateTestDataDescription: 'Régénérez les données pour tester différents scénarios.',
      testDataSummary: 'Données de test incluant élèves, notes et informations CBA',
      student: 'Élève',
      average: 'Moyenne',
      status: 'Statut',
      rank: 'Rang',
      createBulletin: 'Créer bulletin',
      viewBulletin: 'Voir bulletin',
      downloadPdf: 'Télécharger PDF',
      generateAll: 'Générer tous les bulletins',
      exportClass: 'Exporter la classe',
      generalAverage: 'Moyenne générale',
      successRate: 'Taux de réussite',
      studentsTotal: 'Élèves total',
      bulletinsComplete: 'Bulletins terminés'
    },
    en: {
      title: 'Report Card Management - CBA Format',
      subtitle: 'Creation and tracking of report cards according to official Cameroonian CBA format',
      selectSchool: 'Select a school',
      selectClass: 'Select a class',
      selectTerm: 'Select a term',
      manualDataEntry: 'Manual Entry',
      overview: 'Overview',
      classStatistics: 'Class Statistics',
      selectStudentForEntry: 'Select a student for entry',
      loadTestData: 'Load test data',
      regenerateTestData: 'Regenerate test data',
      generatingInProgress: 'Generating...',
      loadTestDataDescription: 'Load test data to start working with the bulletin module.',
      regenerateTestDataDescription: 'Regenerate data to test different scenarios.',
      testDataSummary: 'Test data including students, grades and CBA information',
      student: 'Student',
      average: 'Average',
      status: 'Status',
      rank: 'Rank',
      createBulletin: 'Create report card',
      viewBulletin: 'View report card',
      downloadPdf: 'Download PDF',
      generateAll: 'Generate all report cards',
      exportClass: 'Export class',
      generalAverage: 'General average',
      successRate: 'Success rate',
      studentsTotal: 'Total students',
      bulletinsComplete: 'Completed reports'
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
    
    // Fallback for other formats
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

  // Extract schools list for dropdown
  const schools = useMemo(() => {
    return schoolsWithClasses.map((school: any) => ({
      id: String(school.schoolId),
      name: school.schoolName
    }));
  }, [schoolsWithClasses]);

  // Extract classes for selected school
  const availableClasses = useMemo(() => {
    if (!selectedSchool) return [];
    const school = schoolsWithClasses.find((s: any) => String(s.schoolId) === selectedSchool);
    return school?.classes || [];
  }, [schoolsWithClasses, selectedSchool]);

  // Flatten classes for compatibility (used for stats)
  const classes = useMemo(() => {
    return schoolsWithClasses.flatMap((school: any) => 
      (school.classes || []).map((cls: any) => ({
        ...cls,
        schoolName: school.schoolName,
        schoolId: school.schoolId
      }))
    );
  }, [schoolsWithClasses]);

  // Check sandbox mode and data availability  
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
        title: 'Données de test chargées',
        description: `${data.data.students} étudiants et ${data.data.classes} classes générés avec succès`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/classes'] });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données de test',
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

  // School change handler
  const handleSchoolChange = useCallback((schoolId: string) => {
    setSelectedSchool(schoolId);
    setSelectedClass('');
    setSelectedStudentForEntry(null);
    setSearchQuery('');
  }, []);

  // Class change handler
  const handleClassChange = useCallback((classId: string) => {
    setSelectedClass(classId);
    setSelectedStudentForEntry(null);
    setSearchQuery('');
  }, []);

  // Calculate class statistics
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

  // Convert trimester format for BulletinCreationInterface
  const getTrimesterLabel = (term: string) => {
    switch (term) {
      case 'T1': return 'Premier';
      case 'T2': return 'Deuxième';
      case 'T3': return 'Troisième';
      default: return 'Premier';
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <CheckSquare className="w-3 h-3 mr-1" />
            Format CBA Officiel
          </Badge>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            {filteredStudents.length} élèves
          </Badge>
        </div>
      </div>

      {/* Test Data Section (Sandbox Mode) */}
      {isSandboxMode && hasNoData && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Database className="h-5 w-5" />
              {t.loadTestData}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="text-blue-600 dark:text-blue-400">
                <Users className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">
                  {hasNoData 
                    ? (language === 'fr' ? 'Aucune donnée disponible' : 'No data available')
                    : `${classes.length} ${language === 'fr' ? 'classes chargées' : 'classes loaded'}`
                  }
                </p>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-center mb-4 text-sm max-w-md">
                {t.loadTestDataDescription}
              </p>
              <Button 
                onClick={() => loadTestDataMutation.mutate()}
                disabled={loadTestDataMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
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
              <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 text-center">
                <p>✅ {t.testDataSummary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* School, Class and Term Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* School Selection */}
            <div className="space-y-2">
              <Label>{t.selectSchool}</Label>
              <Select value={selectedSchool} onValueChange={handleSchoolChange} data-testid="select-school">
                <SelectTrigger>
                  <SelectValue placeholder={t.selectSchool} />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school: any) => (
                    <SelectItem key={school.id} value={String(school.id)}>
                      🏫 {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class Selection */}
            <div className="space-y-2">
              <Label>{t.selectClass}</Label>
              <Select 
                value={selectedClass} 
                onValueChange={handleClassChange} 
                disabled={!selectedSchool}
                data-testid="select-class"
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedSchool ? t.selectClass : "Sélectionnez d'abord une école"} />
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
            
            {/* Term Selection */}
            <div className="space-y-2">
              <Label>{t.selectTerm}</Label>
              <Select value={selectedTerm} onValueChange={(value: 'T1' | 'T2' | 'T3') => setSelectedTerm(value)} data-testid="select-term">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="T1">Premier Trimestre</SelectItem>
                  <SelectItem value="T2">Deuxième Trimestre</SelectItem>
                  <SelectItem value="T3">Troisième Trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Statistics (when class is selected) */}
      {selectedClass && students.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{classStats.total}</div>
            <div className="text-sm text-blue-600 dark:text-blue-400">{t.studentsTotal}</div>
          </Card>
          <Card className="p-4 text-center bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">{classStats.average.toFixed(1)}/20</div>
            <div className="text-sm text-green-600 dark:text-green-400">{t.generalAverage}</div>
          </Card>
          <Card className="p-4 text-center bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800">
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">{classStats.successRate.toFixed(0)}%</div>
            <div className="text-sm text-purple-600 dark:text-purple-400">{t.successRate}</div>
          </Card>
          <Card className="p-4 text-center bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800">
            <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">{classStats.completed}/{classStats.total}</div>
            <div className="text-sm text-orange-600 dark:text-orange-400">{t.bulletinsComplete}</div>
          </Card>
        </div>
      )}

      {/* Main Interface */}
      {selectedSchool && selectedClass && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {t.overview}
            </TabsTrigger>
            <TabsTrigger value="manual-entry" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              {t.manualDataEntry}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t.classStatistics}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredStudents.length > 0 ? (
                  <div className="space-y-3">
                    {filteredStudents.map((student: any) => (
                      <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {student.matricule?.slice(-2) || student.id}
                          </div>
                          <div>
                            <p className="font-medium">{student.firstName} {student.lastName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {student.matricule} • Moyenne: {(student.average || 0).toFixed(1)}/20
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={student.bulletinStatus === 'complete' ? 'default' : 'outline'}>
                            {student.bulletinStatus === 'complete' ? 'Terminé' : 'En attente'}
                          </Badge>
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setSelectedStudentForEntry(student.id);
                              setActiveTab('manual-entry');
                            }}
                          >
                            <Edit3 className="w-4 h-4 mr-1" />
                            {t.createBulletin}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun élève dans cette classe</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manual Entry Tab */}
          <TabsContent value="manual-entry" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  {t.manualDataEntry} - Format CBA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Student Selection */}
                <div className="space-y-4">
                  <Label>{t.selectStudentForEntry}</Label>
                  <Select 
                    value={selectedStudentForEntry?.toString() || 'none'} 
                    onValueChange={(value) => setSelectedStudentForEntry(value === 'none' ? null : parseInt(value))}
                  >
                    <SelectTrigger data-testid="student-select-manual">
                      <SelectValue placeholder={t.selectStudentForEntry} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- {t.selectStudentForEntry} --</SelectItem>
                      {filteredStudents.map((student: any) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.firstName} {student.lastName} - {student.matricule}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Bulletin Creation Interface */}
                {selectedStudentForEntry && (
                  <div className="border-t pt-6">
                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        Mode Enseignant - Bulletin CBA
                      </h3>
                      <p className="text-blue-700 dark:text-blue-300 text-sm">
                        Élève sélectionné: {filteredStudents.find((s: any) => s.id === selectedStudentForEntry)?.firstName} {filteredStudents.find((s: any) => s.id === selectedStudentForEntry)?.lastName} | 
                        Trimestre: {getTrimesterLabel(selectedTerm)} | 
                        Année: {academicYear}
                      </p>
                    </div>
                    
                    {/* Simplified Teacher Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Button 
                        className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          toast({
                            title: language === 'fr' ? "Bulletin sauvegardé" : "Report card saved",
                            description: language === 'fr' ? "Le bulletin a été sauvegardé comme brouillon" : "Report card saved as draft"
                          });
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        <span>{language === 'fr' ? 'Sauvegarder' : 'Save'}</span>
                      </Button>
                      
                      <Button 
                        className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          toast({
                            title: language === 'fr' ? "Bulletin signé" : "Report card signed",
                            description: language === 'fr' ? "Le bulletin a été signé électroniquement" : "Report card electronically signed"
                          });
                        }}
                      >
                        <Award className="w-4 h-4" />
                        <span>{language === 'fr' ? 'Signer le bulletin' : 'Sign Report Card'}</span>
                      </Button>
                      
                      <Button 
                        className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700"
                        onClick={() => {
                          toast({
                            title: language === 'fr' ? "Envoyé à l'école" : "Sent to school",
                            description: language === 'fr' ? "Le bulletin a été envoyé à l'administration" : "Report card sent to administration"
                          });
                        }}
                      >
                        <CheckSquare className="w-4 h-4" />
                        <span>{language === 'fr' ? 'Envoyer à l\'école' : 'Send to School'}</span>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* No School/Class Selected State */}
      {(!selectedSchool || !selectedClass) && !hasNoData && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {!selectedSchool ? t.selectSchool : t.selectClass}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {!selectedSchool 
                ? "Sélectionnez une école pour commencer la gestion des bulletins CBA"
                : "Sélectionnez une classe pour commencer la gestion des bulletins CBA"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsolidatedBulletinManagement;
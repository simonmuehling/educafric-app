import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ManualBulletinForm from '../ManualBulletinForm';
import { 
  FileText, 
  Edit3, 
  Database,
  RefreshCw
} from 'lucide-react';

const ReportCardManagement: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management - Class and student selection
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<'T1' | 'T2' | 'T3'>('T1');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [activeTab, setActiveTab] = useState('manual-data-entry');
  const [selectedStudentForEntry, setSelectedStudentForEntry] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch teacher classes 
  const { data: classesData, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['/api/teacher/classes'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/teacher/classes');
      return await response.json();
    },
    enabled: !!user
  });

  // Extract classes from response
  const classes = useMemo(() => {
    if (!classesData) return [];
    if (Array.isArray(classesData)) return classesData;
    if (classesData.classes && Array.isArray(classesData.classes)) return classesData.classes;
    // Handle schoolsWithClasses format
    if (classesData.schoolsWithClasses && Array.isArray(classesData.schoolsWithClasses)) {
      const allClasses = classesData.schoolsWithClasses.flatMap((school: any) => school.classes || []);
      return allClasses;
    }
    return [];
  }, [classesData]);

  // Check if sandbox mode and no data available  
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
      // Refresh teacher classes
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/classes'] });
    },
    onError: (error) => {
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

  // Event handlers 
  const handleClassChange = useCallback((classId: string) => {
    setSelectedClass(classId);
    setSelectedStudentForEntry(null);
    setSearchQuery('');
  }, []);

  // Translations
  const t = {
    title: language === 'fr' ? 'Gestion des Bulletins' : 'Report Card Management',
    manualDataEntry: language === 'fr' ? 'Saisie manuelle' : 'Manual Data Entry',
    selectClass: language === 'fr' ? 'Sélectionner une classe' : 'Select a class',
    selectTerm: language === 'fr' ? 'Sélectionner un trimestre' : 'Select a term',
    selectStudentForEntry: language === 'fr' ? 'Sélectionner un élève' : 'Select a student',
    loadTestData: language === 'fr' ? 'Charger les données de test' : 'Load test data',
    regenerateTestData: language === 'fr' ? 'Regénérer les données de test' : 'Regenerate test data',
    loadTestDataDescription: language === 'fr' ? 'Chargez des données de test pour explorer le système de bulletins unifié.' : 'Load test data to explore the unified bulletin system.',
    regenerateTestDataDescription: language === 'fr' ? 'Rechargez des données fraîches pour tester le système avec de nouvelles informations.' : 'Reload fresh data to test the system with new information.',
    generatingInProgress: language === 'fr' ? 'Génération en cours...' : 'Generation in progress...',
    testDataSummary: language === 'fr' ? '2 classes • 16 étudiants • 6 matières • Données cohérentes' : '2 classes • 16 students • 6 subjects • Consistent data'
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t.title}</h2>
            <p className="text-sm sm:text-base text-gray-600">Saisir les notes et transmettre au système de bulletins</p>
          </div>
        </div>
      </div>

      {/* Sandbox Test Data Button - Always show in sandbox mode */}
      {isSandboxMode && (
        <Card className="border-dashed border-2 border-blue-300 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {language === 'fr' ? 'Mode Sandbox - Données de Test' : 'Sandbox Mode - Test Data'}
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {hasNoData 
                    ? (language === 'fr' ? 'Aucune donnée disponible' : 'No data available')
                    : `${classes.length} ${language === 'fr' ? 'classes chargées' : 'classes loaded'}`
                  }
                </p>
              </div>
            </div>
            <p className="text-blue-700 dark:text-blue-300 text-center mb-4 text-sm max-w-md">
              {hasNoData 
                ? t.loadTestDataDescription
                : t.regenerateTestDataDescription
              }
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
                  {hasNoData ? t.loadTestData : t.regenerateTestData}
                </>
              )}
            </Button>
            <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 text-center">
              <p>✅ {t.testDataSummary}</p>
              <p>🔄 {language === 'fr' ? 'Données temporaires en mémoire (redémarrage = reset)' : 'Temporary data in memory (restart = reset)'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Class and Term Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.selectClass}</Label>
              <Select value={selectedClass} onValueChange={handleClassChange} data-testid="select-class">
                <SelectTrigger>
                  <SelectValue placeholder={t.selectClass} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
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
                  <SelectItem value="T1">Premier Trimestre</SelectItem>
                  <SelectItem value="T2">Deuxième Trimestre</SelectItem>
                  <SelectItem value="T3">Troisième Trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs Interface */}
      {selectedClass && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="manual-data-entry" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              <span className="hidden sm:inline">{t.manualDataEntry}</span>
              <span className="sm:hidden">Saisie</span>
            </TabsTrigger>
          </TabsList>

          {/* Manual Data Entry Tab */}
          <TabsContent value="manual-data-entry" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  {t.manualDataEntry}
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
                
                {/* Manual Data Entry Form - Now using ManualBulletinForm component */}
                {selectedStudentForEntry && (
                  <ManualBulletinForm
                    studentId={selectedStudentForEntry.toString()}
                    classId={selectedClass}
                    trimestre={selectedTerm === 'T1' ? 'Premier' : selectedTerm === 'T2' ? 'Deuxième' : 'Troisième'}
                    academicYear={academicYear}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ReportCardManagement;
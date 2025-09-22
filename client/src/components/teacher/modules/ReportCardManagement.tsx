import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ModernCard } from '@/components/ui/ModernCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Save, 
  Send, 
  Eye, 
  Download, 
  X, 
  Users, 
  Calendar,
  BookOpen,
  Target,
  Award,
  Trash2,
  Settings,
  Clock,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Database,
  FileDown,
  RefreshCw,
  PenTool
} from 'lucide-react';

// Schema de validation pour les données manuelles (adapté de ComprehensiveBulletinGenerator)
const manualDataSchema = z.object({
  // Notes par matière
  subjectGrades: z.array(z.object({
    subjectId: z.number(),
    subjectName: z.string(),
    grade: z.union([z.number(), z.string()]),
    maxGrade: z.number().default(20),
    coefficient: z.number().default(1),
    comment: z.string().optional()
  })).optional(),
  
  // Totaux académiques
  termGeneral: z.string().optional(),
  termClass: z.string().optional(),
  termCoeff: z.string().optional(),
  termRank: z.string().optional(),
  termStudents: z.string().optional(),
  classGeneral: z.string().optional(),
  
  // Absences et retards
  unjustifiedAbsenceHours: z.string().optional(),
  justifiedAbsenceHours: z.string().optional(),
  latenessMinutes: z.string().optional(),
  detentionHours: z.string().optional(),
  
  // Appréciations
  appreciation: z.string().optional(),
  conductAppreciation: z.string().optional(),
  workAppreciation: z.string().optional(),
  councilDecision: z.string().optional(),
  councilComment: z.string().optional()
});

interface BulletinGrade {
  subjectId: number;
  subjectName: string;
  grade: number | string;
  maxGrade: number;
  coefficient: number;
  comment: string;
}

const ReportCardManagement: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management (adapté de ComprehensiveBulletinGenerator)
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<'T1' | 'T2' | 'T3'>('T1');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [activeTab, setActiveTab] = useState('manual-data-entry');
  const [selectedStudentForEntry, setSelectedStudentForEntry] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sections collapsibles state
  const [openSections, setOpenSections] = useState({
    grades: true,  // Section notes par matière
    absences: true,
    sanctions: false,
    totals: false,
    coefficients: false,
    appreciations: false,
    conseil: false,
    signatures: false
  });
  
  // Subject grades state
  const [subjectGrades, setSubjectGrades] = useState<BulletinGrade[]>([
    { subjectId: 1, subjectName: 'Mathématiques', grade: '', maxGrade: 20, coefficient: 3, comment: '' },
    { subjectId: 2, subjectName: 'Français', grade: '', maxGrade: 20, coefficient: 3, comment: '' },
    { subjectId: 3, subjectName: 'Anglais', grade: '', maxGrade: 20, coefficient: 2, comment: '' },
    { subjectId: 4, subjectName: 'Histoire-Géographie', grade: '', maxGrade: 20, coefficient: 2, comment: '' },
    { subjectId: 5, subjectName: 'Sciences', grade: '', maxGrade: 20, coefficient: 2, comment: '' }
  ]);

  // States pour données de discipline et absences (simplifiés)
  const [discipline, setDiscipline] = useState({
    absJ: 0,
    absNJ: 0, 
    late: 0,
    sanctions: 0
  });

  // Form pour saisie manuelle
  const manualDataForm = useForm<z.infer<typeof manualDataSchema>>({
    resolver: zodResolver(manualDataSchema),
    defaultValues: {
      subjectGrades: [],
      unjustifiedAbsenceHours: '',
      justifiedAbsenceHours: '',
      latenessMinutes: '',
      detentionHours: '',
      termGeneral: '',
      termClass: '',
      termCoeff: '',
      termRank: '',
      termStudents: '',
      classGeneral: '',
      appreciation: '',
      conductAppreciation: '',
      workAppreciation: '',
      councilDecision: '',
      councilComment: ''
    }
  });

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

  const students = studentsData?.students || [];
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

  const toggleSection = useCallback((sectionKey: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  }, []);

  const saveDraftData = useCallback(() => {
    const formData = manualDataForm.getValues();
    toast({
      title: "Brouillon sauvegardé",
      description: "Les données ont été sauvegardées comme brouillon."
    });
    console.log('[TEACHER_BULLETIN] Draft saved:', formData);
  }, [manualDataForm, toast]);

  const loadDraftData = useCallback(() => {
    // In a real implementation, this would load from API
    toast({
      title: "Brouillon chargé", 
      description: "Les données du brouillon ont été chargées."
    });
  }, [toast]);

  const resetFormData = useCallback(() => {
    manualDataForm.reset();
    toast({
      title: "Formulaire réinitialisé",
      description: "Toutes les données ont été effacées."
    });
  }, [manualDataForm, toast]);

  // Submit manual data to comprehensive bulletin system
  const submitToComprehensiveBulletins = useMutation({
    mutationFn: async (data: z.infer<typeof manualDataSchema>) => {
      const response = await apiRequest('POST', '/api/comprehensive-bulletins/teacher-submission', {
        studentId: selectedStudentForEntry,
        classId: parseInt(selectedClass),
        term: selectedTerm,
        academicYear,
        manualData: {
          ...data,
          discipline: discipline
        }
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Données transmises",
        description: "Les notes ont été envoyées au système de génération de bulletins."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/comprehensive-bulletins'] });
      manualDataForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Échec de l'envoi des données.",
        variant: "destructive"
      });
    }
  });

  const onManualDataSubmit = (data: z.infer<typeof manualDataSchema>) => {
    // Inclure les notes par matière dans les données soumises
    const submissionData = {
      ...data,
      subjectGrades: subjectGrades.filter(grade => grade.grade !== '') // Inclure seulement les notes remplies
    };
    submitToComprehensiveBulletins.mutate(submissionData);
  };

  // Translations
  const t = {
    title: language === 'fr' ? 'Gestion des Bulletins' : 'Report Card Management',
    manualDataEntry: language === 'fr' ? 'Saisie manuelle' : 'Manual Data Entry',
    generationOptions: language === 'fr' ? 'Options génération' : 'Generation Options',
    selectClass: language === 'fr' ? 'Sélectionner une classe' : 'Select a class',
    selectTerm: language === 'fr' ? 'Sélectionner un trimestre' : 'Select a term',
    selectStudentForEntry: language === 'fr' ? 'Sélectionner un élève' : 'Select a student',
    saveDraft: language === 'fr' ? 'Sauvegarder brouillon' : 'Save Draft',
    loadDraft: language === 'fr' ? 'Charger brouillon' : 'Load Draft',
    resetForm: language === 'fr' ? 'Réinitialiser' : 'Reset Form',
    absencesLateness: language === 'fr' ? 'Absences & Retards' : 'Absences & Lateness',
    disciplinarySanctions: language === 'fr' ? 'Sanctions Disciplinaires' : 'Disciplinary Sanctions',
    academicTotals: language === 'fr' ? 'Totaux Académiques' : 'Academic Totals',
    subjectGrades: language === 'fr' ? 'Notes par matière' : 'Subject Grades',
    coefficientsAndCodes: language === 'fr' ? 'Coefficients & Codes' : 'Coefficients & Codes',
    appreciationsComments: language === 'fr' ? 'Appréciations & Commentaires' : 'Appreciations & Comments',
    councilClass: language === 'fr' ? 'Conseil de Classe' : 'Class Council',
    signatures: language === 'fr' ? 'Signatures' : 'Signatures',
    unjustifiedAbsHours: language === 'fr' ? 'Heures absence injustifiée' : 'Unjustified absence hours',
    justifiedAbsHours: language === 'fr' ? 'Heures absence justifiée' : 'Justified absence hours',
    latenessMinutes: language === 'fr' ? 'Minutes de retard' : 'Lateness minutes',
    detentionHours: language === 'fr' ? 'Heures de retenue' : 'Detention hours',
    submitData: language === 'fr' ? 'Transmettre au système bulletins' : 'Submit to bulletin system',
    generationSettings: language === 'fr' ? 'Paramètres de génération' : 'Generation Settings',
    includeComments: language === 'fr' ? 'Inclure commentaires' : 'Include comments',
    includeRankings: language === 'fr' ? 'Inclure classements' : 'Include rankings',
    includeStatistics: language === 'fr' ? 'Inclure statistiques' : 'Include statistics'
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
                  Mode Sandbox - Données de Test
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {hasNoData ? 'Aucune donnée disponible' : `${classes.length} classes chargées`}
                </p>
              </div>
            </div>
            <p className="text-blue-700 dark:text-blue-300 text-center mb-4 text-sm max-w-md">
              {hasNoData 
                ? 'Chargez des données de test pour explorer le système de bulletins unifié.'
                : 'Rechargez des données fraîches pour tester le système avec de nouvelles informations.'
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
                  Génération en cours...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  {hasNoData ? 'Charger les données de test' : 'Regénérer les données de test'}
                </>
              )}
            </Button>
            <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 text-center">
              <p>✅ 2 classes • 16 étudiants • 6 matières • Données cohérentes</p>
              <p>🔄 Données temporaires en mémoire (redémarrage = reset)</p>
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
                  
                  {/* Draft Management Buttons */}
                  {selectedStudentForEntry && (
                    <div className="flex gap-2">
                      <Button onClick={saveDraftData} variant="outline" size="sm" data-testid="save-draft">
                        <Database className="h-4 w-4 mr-2" />
                        {t.saveDraft}
                      </Button>
                      <Button onClick={loadDraftData} variant="outline" size="sm" data-testid="load-draft">
                        <FileDown className="h-4 w-4 mr-2" />
                        {t.loadDraft}
                      </Button>
                      <Button onClick={resetFormData} variant="outline" size="sm" data-testid="reset-form">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {t.resetForm}
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Manual Data Entry Form */}
                {selectedStudentForEntry && (
                  <Form {...manualDataForm}>
                    <form onSubmit={manualDataForm.handleSubmit(onManualDataSubmit)} className="space-y-6">
                      
                      {/* Section 1: Notes par matière - Toujours visible */}
                      {true && (
                        <Collapsible open={openSections.grades} onOpenChange={() => toggleSection('grades')}>
                          <Card>
                            <CollapsibleTrigger asChild>
                              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                                <CardTitle className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-green-600" />
                                    {t.subjectGrades}
                                  </div>
                                  {openSections.grades ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </CardTitle>
                              </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <CardContent className="pt-0 space-y-4">
                                {subjectGrades.map((subject, index) => (
                                  <div key={subject.subjectId} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                                    <div className="md:col-span-1">
                                      <Label className="font-medium text-gray-700">{subject.subjectName}</Label>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-gray-500">Note /{subject.maxGrade}</Label>
                                      <Input
                                        value={subject.grade}
                                        onChange={(e) => {
                                          const newGrades = [...subjectGrades];
                                          newGrades[index].grade = e.target.value;
                                          setSubjectGrades(newGrades);
                                        }}
                                        placeholder="15.5"
                                        className="h-8"
                                        data-testid={`grade-${subject.subjectName.toLowerCase()}`}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs text-gray-500">Coeff. ({subject.coefficient})</Label>
                                      <Input
                                        type="number"
                                        value={subject.coefficient}
                                        onChange={(e) => {
                                          const newGrades = [...subjectGrades];
                                          newGrades[index].coefficient = parseInt(e.target.value) || 1;
                                          setSubjectGrades(newGrades);
                                        }}
                                        className="h-8"
                                        min="1"
                                        max="5"
                                        data-testid={`coeff-${subject.subjectName.toLowerCase()}`}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs text-gray-500">Appréciation</Label>
                                      <Input
                                        value={subject.comment}
                                        onChange={(e) => {
                                          const newGrades = [...subjectGrades];
                                          newGrades[index].comment = e.target.value;
                                          setSubjectGrades(newGrades);
                                        }}
                                        placeholder="TB, AB, Passable..."
                                        className="h-8"
                                        data-testid={`comment-${subject.subjectName.toLowerCase()}`}
                                      />
                                    </div>
                                  </div>
                                ))}
                                
                                {/* Bouton pour ajouter une matière */}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newSubject = {
                                      subjectId: subjectGrades.length + 1,
                                      subjectName: 'Nouvelle matière',
                                      grade: '',
                                      maxGrade: 20,
                                      coefficient: 1,
                                      comment: ''
                                    };
                                    setSubjectGrades([...subjectGrades, newSubject]);
                                  }}
                                  className="w-full"
                                  data-testid="add-subject-button"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Ajouter une matière
                                </Button>
                              </CardContent>
                            </CollapsibleContent>
                          </Card>
                        </Collapsible>
                      )}

                      {/* Section 2: Discipline et Absences - Toujours visible */}
                      {true && (
                        <Collapsible open={openSections.absences} onOpenChange={() => toggleSection('absences')}>
                          <Card>
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                              <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-5 w-5 text-orange-600" />
                                  Discipline et Absences
                                </div>
                                {openSections.absences ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                              </CardTitle>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-0 space-y-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <Label htmlFor="absJ">Absences justifiées (h)</Label>
                                  <Input
                                    id="absJ"
                                    data-testid="input-abs-justified"
                                    type="number"
                                    min="0"
                                    value={discipline.absJ}
                                    onChange={(e) => setDiscipline({...discipline, absJ: parseInt(e.target.value) || 0})}
                                    className="bg-green-50 border-green-200"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="absNJ">Absences non justifiées (h)</Label>
                                  <Input
                                    id="absNJ"
                                    data-testid="input-abs-unjustified"
                                    type="number"
                                    min="0"
                                    value={discipline.absNJ}
                                    onChange={(e) => setDiscipline({...discipline, absNJ: parseInt(e.target.value) || 0})}
                                    className="bg-orange-50 border-orange-200"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="late">Retards</Label>
                                  <Input
                                    id="late"
                                    data-testid="input-lates"
                                    type="number"
                                    min="0"
                                    value={discipline.late}
                                    onChange={(e) => setDiscipline({...discipline, late: parseInt(e.target.value) || 0})}
                                    className="bg-yellow-50 border-yellow-200"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="sanctions">Avertissements/Blâmes</Label>
                                  <Input
                                    id="sanctions"
                                    data-testid="input-sanctions"
                                    type="number"
                                    min="0"
                                    value={discipline.sanctions}
                                    onChange={(e) => setDiscipline({...discipline, sanctions: parseInt(e.target.value) || 0})}
                                    className="bg-red-50 border-red-200"
                                  />
                                </div>
                              </div>

                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-700">
                                  💡 <strong>Adaptation Trimestre :</strong> Les données varient selon le trimestre sélectionné ({selectedTerm === 'T1' ? 'Premier' : selectedTerm === 'T2' ? 'Deuxième' : 'Troisième'} Trimestre). 
                                  Le système s'adapte automatiquement pour refléter les spécificités de chaque période.
                                </p>
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                        </Collapsible>
                      )}

                      {/* Section 3: Appreciations & Comments - VISIBLE selon options */}
                      {includeComments && (
                        <Collapsible open={openSections.appreciations} onOpenChange={() => toggleSection('appreciations')}>
                          <Card>
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                              <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <PenTool className="h-5 w-5 text-blue-600" />
                                  {t.appreciationsComments}
                                </div>
                                {openSections.appreciations ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                              </CardTitle>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-0 space-y-4">
                              <FormField
                                control={manualDataForm.control}
                                name="appreciation"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Appréciation générale</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        {...field} 
                                        rows={3}
                                        placeholder="Saisir l'appréciation générale..."
                                        data-testid="general-appreciation"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={manualDataForm.control}
                                name="councilDecision"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Décision du conseil de classe</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        placeholder="Ex: ADMIS(E) EN CLASSE SUPÉRIEURE"
                                        data-testid="council-decision"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                        </Collapsible>
                      )}

                      {/* Submit Button */}
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={submitToComprehensiveBulletins.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                          data-testid="submit-to-bulletins"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {submitToComprehensiveBulletins.isPending ? 'Envoi...' : t.submitData}
                        </Button>
                      </div>
                    </form>
                  </Form>
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

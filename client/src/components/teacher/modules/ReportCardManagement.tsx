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

  // Generation options state (adapté de ComprehensiveBulletinGenerator)
  const [includeComments, setIncludeComments] = useState(true);
  const [includeRankings, setIncludeRankings] = useState(true);
  const [includeStatistics, setIncludeStatistics] = useState(true);
  const [includePerformanceLevels, setIncludePerformanceLevels] = useState(true);
  const [generationFormat, setGenerationFormat] = useState<'pdf' | 'batch_pdf'>('pdf');
  
  // Sections d'évaluation
  const [includeFirstTrimester, setIncludeFirstTrimester] = useState(false);
  const [includeDiscipline, setIncludeDiscipline] = useState(false);
  const [includeStudentWork, setIncludeStudentWork] = useState(false);
  const [includeClassProfile, setIncludeClassProfile] = useState(false);
  
  // Sections absences & retards
  const [includeUnjustifiedAbsences, setIncludeUnjustifiedAbsences] = useState(false);
  const [includeJustifiedAbsences, setIncludeJustifiedAbsences] = useState(false);
  const [includeLateness, setIncludeLateness] = useState(false);
  const [includeDetentions, setIncludeDetentions] = useState(false);

  // 🎯 SECTIONS MANQUANTES - IDENTIQUES À L'ÉCOLE
  // Section Sanctions Disciplinaires
  const [includeConductWarning, setIncludeConductWarning] = useState(false);
  const [includeConductBlame, setIncludeConductBlame] = useState(false);
  const [includeExclusions, setIncludeExclusions] = useState(false);
  const [includePermanentExclusion, setIncludePermanentExclusion] = useState(false);
  
  // Section Moyennes & Totaux
  const [includeTotalGeneral, setIncludeTotalGeneral] = useState(false);
  const [includeAppreciations, setIncludeAppreciations] = useState(false);
  const [includeGeneralAverage, setIncludeGeneralAverage] = useState(false);
  const [includeTrimesterAverage, setIncludeTrimesterAverage] = useState(false);
  const [includeNumberOfAverages, setIncludeNumberOfAverages] = useState(false);
  const [includeSuccessRate, setIncludeSuccessRate] = useState(false);
  
  // Section Coefficients & Codes
  const [includeCoef, setIncludeCoef] = useState(false);
  const [includeCTBA, setIncludeCTBA] = useState(false);
  const [includeMinMax, setIncludeMinMax] = useState(false);
  const [includeCBA, setIncludeCBA] = useState(false);
  const [includeCA, setIncludeCA] = useState(false);
  const [includeCMA, setIncludeCMA] = useState(false);
  const [includeCOTE, setIncludeCOTE] = useState(false);
  const [includeCNA, setIncludeCNA] = useState(false);
  
  // Section Appréciations & Signatures
  const [includeWorkAppreciation, setIncludeWorkAppreciation] = useState(false);
  const [includeParentVisa, setIncludeParentVisa] = useState(false);
  const [includeTeacherVisa, setIncludeTeacherVisa] = useState(false);
  const [includeHeadmasterVisa, setIncludeHeadmasterVisa] = useState(false);
  
  // Section Conseil de Classe
  const [includeClassCouncilDecisions, setIncludeClassCouncilDecisions] = useState(false);
  const [includeClassCouncilMentions, setIncludeClassCouncilMentions] = useState(false);
  const [includeOrientationRecommendations, setIncludeOrientationRecommendations] = useState(false);
  const [includeCouncilDate, setIncludeCouncilDate] = useState(false);

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
        manualData: data,
        generationOptions: {
          // 🎯 TOUTES LES OPTIONS - IDENTIQUES À L'ÉCOLE
          includeComments,
          includeRankings,
          includeStatistics,
          includePerformanceLevels,
          includeFirstTrimester,
          includeDiscipline,
          includeStudentWork,
          includeClassProfile,
          
          // Absences & Retards
          includeUnjustifiedAbsences,
          includeJustifiedAbsences,
          includeLateness,
          includeDetentions,
          
          // Sanctions Disciplinaires
          includeConductWarning,
          includeConductBlame,
          includeExclusions,
          includePermanentExclusion,
          
          // Moyennes & Totaux
          includeTotalGeneral,
          includeAppreciations,
          includeGeneralAverage,
          includeTrimesterAverage,
          includeNumberOfAverages,
          includeSuccessRate,
          
          // Coefficients & Codes
          includeCoef,
          includeCTBA,
          includeMinMax,
          includeCBA,
          includeCA,
          includeCMA,
          includeCOTE,
          includeCNA,
          
          // Appréciations & Signatures
          includeWorkAppreciation,
          includeParentVisa,
          includeTeacherVisa,
          includeHeadmasterVisa,
          
          // Conseil de Classe
          includeClassCouncilDecisions,
          includeClassCouncilMentions,
          includeOrientationRecommendations,
          includeCouncilDate,
          
          generationFormat
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual-data-entry" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              <span className="hidden sm:inline">{t.manualDataEntry}</span>
              <span className="sm:hidden">Saisie</span>
            </TabsTrigger>
            <TabsTrigger value="generation-options" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{t.generationOptions}</span>
              <span className="sm:hidden">Options</span>
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
                      
                      {/* Section 1: Notes par matière - VISIBLE selon options */}
                      {includeComments && (
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

                      {/* Section 2: Absences & Lateness - VISIBLE selon options */}
                      {(includeUnjustifiedAbsences || includeJustifiedAbsences || includeLateness || includeDetentions) && (
                        <Collapsible open={openSections.absences} onOpenChange={() => toggleSection('absences')}>
                          <Card>
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                              <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-5 w-5 text-orange-600" />
                                  {t.absencesLateness}
                                </div>
                                {openSections.absences ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                              </CardTitle>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-0 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={manualDataForm.control}
                                  name="unjustifiedAbsenceHours"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{t.unjustifiedAbsHours}</FormLabel>
                                      <FormControl>
                                        <Input 
                                          {...field} 
                                          type="number" 
                                          step="0.5" 
                                          min="0" 
                                          placeholder="0.0"
                                          data-testid="unjustified-abs-hours"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={manualDataForm.control}
                                  name="justifiedAbsenceHours"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{t.justifiedAbsHours}</FormLabel>
                                      <FormControl>
                                        <Input 
                                          {...field} 
                                          type="number" 
                                          step="0.5" 
                                          min="0" 
                                          placeholder="0.0"
                                          data-testid="justified-abs-hours"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={manualDataForm.control}
                                  name="latenessMinutes"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{t.latenessMinutes}</FormLabel>
                                      <FormControl>
                                        <Input 
                                          {...field} 
                                          type="number" 
                                          min="0" 
                                          placeholder="0"
                                          data-testid="lateness-minutes"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={manualDataForm.control}
                                  name="detentionHours"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{t.detentionHours}</FormLabel>
                                      <FormControl>
                                        <Input 
                                          {...field} 
                                          type="number" 
                                          step="0.5" 
                                          min="0" 
                                          placeholder="0.0"
                                          data-testid="detention-hours"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
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

          {/* Generation Options Tab - Contrôle les sections visibles */}
          <TabsContent value="generation-options" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {t.generationSettings}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Options principales */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800">Sections à inclure</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="include-comments"
                        checked={includeComments}
                        onCheckedChange={(checked) => setIncludeComments(checked === true)}
                        data-testid="include-comments-checkbox"
                      />
                      <Label htmlFor="include-comments" className="font-medium">
                        Notes par matière & Appréciations
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="include-rankings"
                        checked={includeRankings}
                        onCheckedChange={(checked) => setIncludeRankings(checked === true)}
                        data-testid="include-rankings-checkbox"
                      />
                      <Label htmlFor="include-rankings" className="font-medium">
                        {t.includeRankings}
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="include-statistics"
                        checked={includeStatistics}
                        onCheckedChange={(checked) => setIncludeStatistics(checked === true)}
                        data-testid="include-statistics-checkbox"
                      />
                      <Label htmlFor="include-statistics" className="font-medium">
                        {t.includeStatistics}
                      </Label>
                    </div>
                  </div>
                </div>
                
                {/* Options d'absences/retards */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800">Absences & Retards</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="include-unjustified-absences"
                        checked={includeUnjustifiedAbsences}
                        onCheckedChange={(checked) => setIncludeUnjustifiedAbsences(checked === true)}
                        data-testid="include-unjustified-absences-checkbox"
                      />
                      <Label htmlFor="include-unjustified-absences">
                        Absences injustifiées
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="include-justified-absences"
                        checked={includeJustifiedAbsences}
                        onCheckedChange={(checked) => setIncludeJustifiedAbsences(checked === true)}
                        data-testid="include-justified-absences-checkbox"
                      />
                      <Label htmlFor="include-justified-absences">
                        Absences justifiées
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="include-lateness"
                        checked={includeLateness}
                        onCheckedChange={(checked) => setIncludeLateness(checked === true)}
                        data-testid="include-lateness-checkbox"
                      />
                      <Label htmlFor="include-lateness">
                        Retards
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="include-detentions"
                        checked={includeDetentions}
                        onCheckedChange={(checked) => setIncludeDetentions(checked === true)}
                        data-testid="include-detentions-checkbox"
                      />
                      <Label htmlFor="include-detentions">
                        Retenues
                      </Label>
                    </div>
                  </div>
                </div>

                {/* 🎯 SECTIONS COMPLÈTES - IDENTIQUES À L'ÉCOLE */}
                
                {/* Section Sanctions Disciplinaires */}
                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Sanctions Disciplinaires
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-conduct-warning"
                        checked={includeConductWarning}
                        onCheckedChange={(checked) => setIncludeConductWarning(checked === true)}
                        data-testid="include-conduct-warning"
                      />
                      <Label htmlFor="include-conduct-warning">Avertissement conduite</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-conduct-blame"
                        checked={includeConductBlame}
                        onCheckedChange={(checked) => setIncludeConductBlame(checked === true)}
                        data-testid="include-conduct-blame"
                      />
                      <Label htmlFor="include-conduct-blame">Blâme conduite</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-exclusions"
                        checked={includeExclusions}
                        onCheckedChange={(checked) => setIncludeExclusions(checked === true)}
                        data-testid="include-exclusions"
                      />
                      <Label htmlFor="include-exclusions">Exclusions temporaires</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-permanent-exclusion"
                        checked={includePermanentExclusion}
                        onCheckedChange={(checked) => setIncludePermanentExclusion(checked === true)}
                        data-testid="include-permanent-exclusion"
                      />
                      <Label htmlFor="include-permanent-exclusion">Exclusion définitive</Label>
                    </div>
                  </div>
                </div>

                {/* Section Moyennes & Totaux */}
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Moyennes & Totaux
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-total-general"
                        checked={includeTotalGeneral}
                        onCheckedChange={(checked) => setIncludeTotalGeneral(checked === true)}
                        data-testid="include-total-general"
                      />
                      <Label htmlFor="include-total-general">Total général</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-general-average"
                        checked={includeGeneralAverage}
                        onCheckedChange={(checked) => setIncludeGeneralAverage(checked === true)}
                        data-testid="include-general-average"
                      />
                      <Label htmlFor="include-general-average">Moyenne générale</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-trimester-average"
                        checked={includeTrimesterAverage}
                        onCheckedChange={(checked) => setIncludeTrimesterAverage(checked === true)}
                        data-testid="include-trimester-average"
                      />
                      <Label htmlFor="include-trimester-average">Moyenne trimestre</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-success-rate"
                        checked={includeSuccessRate}
                        onCheckedChange={(checked) => setIncludeSuccessRate(checked === true)}
                        data-testid="include-success-rate"
                      />
                      <Label htmlFor="include-success-rate">Taux de réussite</Label>
                    </div>
                  </div>
                </div>

                {/* Section Coefficients & Codes */}
                <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Coefficients & Codes
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-coef"
                        checked={includeCoef}
                        onCheckedChange={(checked) => setIncludeCoef(checked === true)}
                        data-testid="include-coef"
                      />
                      <Label htmlFor="include-coef">COEF</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-ctba"
                        checked={includeCTBA}
                        onCheckedChange={(checked) => setIncludeCTBA(checked === true)}
                        data-testid="include-ctba"
                      />
                      <Label htmlFor="include-ctba">CTBA</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-cba"
                        checked={includeCBA}
                        onCheckedChange={(checked) => setIncludeCBA(checked === true)}
                        data-testid="include-cba"
                      />
                      <Label htmlFor="include-cba">CBA</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-ca"
                        checked={includeCA}
                        onCheckedChange={(checked) => setIncludeCA(checked === true)}
                        data-testid="include-ca"
                      />
                      <Label htmlFor="include-ca">CA</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-cma"
                        checked={includeCMA}
                        onCheckedChange={(checked) => setIncludeCMA(checked === true)}
                        data-testid="include-cma"
                      />
                      <Label htmlFor="include-cma">CMA</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-cote"
                        checked={includeCOTE}
                        onCheckedChange={(checked) => setIncludeCOTE(checked === true)}
                        data-testid="include-cote"
                      />
                      <Label htmlFor="include-cote">COTE</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-cna"
                        checked={includeCNA}
                        onCheckedChange={(checked) => setIncludeCNA(checked === true)}
                        data-testid="include-cna"
                      />
                      <Label htmlFor="include-cna">CNA</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-min-max"
                        checked={includeMinMax}
                        onCheckedChange={(checked) => setIncludeMinMax(checked === true)}
                        data-testid="include-min-max"
                      />
                      <Label htmlFor="include-min-max">Min/Max</Label>
                    </div>
                  </div>
                </div>

                {/* Section Appréciations & Signatures */}
                <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    Appréciations & Signatures
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-work-appreciation"
                        checked={includeWorkAppreciation}
                        onCheckedChange={(checked) => setIncludeWorkAppreciation(checked === true)}
                        data-testid="include-work-appreciation"
                      />
                      <Label htmlFor="include-work-appreciation">Appréciation du travail</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-parent-visa"
                        checked={includeParentVisa}
                        onCheckedChange={(checked) => setIncludeParentVisa(checked === true)}
                        data-testid="include-parent-visa"
                      />
                      <Label htmlFor="include-parent-visa">Visa des parents</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-teacher-visa"
                        checked={includeTeacherVisa}
                        onCheckedChange={(checked) => setIncludeTeacherVisa(checked === true)}
                        data-testid="include-teacher-visa"
                      />
                      <Label htmlFor="include-teacher-visa">Visa du professeur</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-headmaster-visa"
                        checked={includeHeadmasterVisa}
                        onCheckedChange={(checked) => setIncludeHeadmasterVisa(checked === true)}
                        data-testid="include-headmaster-visa"
                      />
                      <Label htmlFor="include-headmaster-visa">Visa du directeur</Label>
                    </div>
                  </div>
                </div>

                {/* Section Conseil de Classe */}
                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Conseil de Classe
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-council-decisions"
                        checked={includeClassCouncilDecisions}
                        onCheckedChange={(checked) => setIncludeClassCouncilDecisions(checked === true)}
                        data-testid="include-council-decisions"
                      />
                      <Label htmlFor="include-council-decisions">Décisions du conseil</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-council-mentions"
                        checked={includeClassCouncilMentions}
                        onCheckedChange={(checked) => setIncludeClassCouncilMentions(checked === true)}
                        data-testid="include-council-mentions"
                      />
                      <Label htmlFor="include-council-mentions">Mentions du conseil</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-orientation-recommendations"
                        checked={includeOrientationRecommendations}
                        onCheckedChange={(checked) => setIncludeOrientationRecommendations(checked === true)}
                        data-testid="include-orientation-recommendations"
                      />
                      <Label htmlFor="include-orientation-recommendations">Recommandations d'orientation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-council-date"
                        checked={includeCouncilDate}
                        onCheckedChange={(checked) => setIncludeCouncilDate(checked === true)}
                        data-testid="include-council-date"
                      />
                      <Label htmlFor="include-council-date">Date du conseil</Label>
                    </div>
                  </div>
                </div>
                
                {/* Aperçu des sections actives - COMPLET */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-800 mb-2">✅ Aperçu des sections actives :</h5>
                  <div className="flex flex-wrap gap-2">
                    {includeComments && (
                      <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm">
                        Notes & Appréciations
                      </span>
                    )}
                    {(includeUnjustifiedAbsences || includeJustifiedAbsences || includeLateness || includeDetentions) && (
                      <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded text-sm">
                        Absences & Retards
                      </span>
                    )}
                    {(includeConductWarning || includeConductBlame || includeExclusions || includePermanentExclusion) && (
                      <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-sm">
                        Sanctions Disciplinaires
                      </span>
                    )}
                    {(includeTotalGeneral || includeGeneralAverage || includeTrimesterAverage || includeSuccessRate) && (
                      <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-sm">
                        Moyennes & Totaux
                      </span>
                    )}
                    {(includeCoef || includeCTBA || includeCBA || includeCA || includeCMA || includeCOTE || includeCNA || includeMinMax) && (
                      <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded text-sm">
                        Coefficients & Codes
                      </span>
                    )}
                    {(includeWorkAppreciation || includeParentVisa || includeTeacherVisa || includeHeadmasterVisa) && (
                      <span className="bg-indigo-200 text-indigo-800 px-2 py-1 rounded text-sm">
                        Appréciations & Signatures
                      </span>
                    )}
                    {(includeClassCouncilDecisions || includeClassCouncilMentions || includeOrientationRecommendations || includeCouncilDate) && (
                      <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-sm">
                        Conseil de Classe
                      </span>
                    )}
                    {includeRankings && (
                      <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-sm">
                        Classements
                      </span>
                    )}
                    {includeStatistics && (
                      <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded text-sm">
                        Statistiques
                      </span>
                    )}
                  </div>
                </div>
                
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      )}
    </div>
  );
};

export default ReportCardManagement;

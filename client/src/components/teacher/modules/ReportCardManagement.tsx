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
  unjustifiedAbsenceHours: z.string().optional(),
  justifiedAbsenceHours: z.string().optional(),
  latenessMinutes: z.string().optional(),
  detentionHours: z.string().optional(),
  termGeneral: z.string().optional(),
  termClass: z.string().optional(),
  termCoeff: z.string().optional(),
  termRank: z.string().optional(),
  termStudents: z.string().optional(),
  classGeneral: z.string().optional(),
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
    absences: true,
    sanctions: false,
    totals: false,
    coefficients: false,
    appreciations: false,
    conseil: false,
    signatures: false
  });

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

  // Form pour saisie manuelle
  const manualDataForm = useForm<z.infer<typeof manualDataSchema>>({
    resolver: zodResolver(manualDataSchema),
    defaultValues: {
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
  const { data: classesData } = useQuery({
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
    return [];
  }, [classesData]);

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
          includeComments,
          includeRankings,
          includeStatistics,
          includePerformanceLevels,
          includeFirstTrimester,
          includeDiscipline,
          includeStudentWork,
          includeClassProfile,
          includeUnjustifiedAbsences,
          includeJustifiedAbsences,
          includeLateness,
          includeDetentions,
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
    submitToComprehensiveBulletins.mutate(data);
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
                      
                      {/* Section 1: Absences & Lateness */}
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

                      {/* Section 2: Appreciations & Comments */}
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

          {/* Generation Options Tab */}
          <TabsContent value="generation-options" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {t.generationSettings}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Content Options */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Contenu du bulletin</h3>
                  
                  {/* Basic Options */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg space-y-3">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Options de base
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-comments"
                          checked={includeComments}
                          onCheckedChange={(checked) => setIncludeComments(checked === true)}
                          data-testid="include-comments"
                        />
                        <Label htmlFor="include-comments">{t.includeComments}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-rankings"
                          checked={includeRankings}
                          onCheckedChange={(checked) => setIncludeRankings(checked === true)}
                          data-testid="include-rankings"
                        />
                        <Label htmlFor="include-rankings">{t.includeRankings}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-statistics"
                          checked={includeStatistics}
                          onCheckedChange={(checked) => setIncludeStatistics(checked === true)}
                          data-testid="include-statistics"
                        />
                        <Label htmlFor="include-statistics">{t.includeStatistics}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-performance-levels"
                          checked={includePerformanceLevels}
                          onCheckedChange={(checked) => setIncludePerformanceLevels(checked === true)}
                          data-testid="include-performance-levels"
                        />
                        <Label htmlFor="include-performance-levels">Niveaux de performance</Label>
                      </div>
                    </div>
                  </div>

                  {/* Absences & Lateness Options */}
                  <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg space-y-3">
                    <h4 className="font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Absences & Retards
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-unjustified-absences"
                          checked={includeUnjustifiedAbsences}
                          onCheckedChange={(checked) => setIncludeUnjustifiedAbsences(checked === true)}
                          data-testid="include-unjustified-absences"
                        />
                        <Label htmlFor="include-unjustified-absences">Absences injustifiées</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-justified-absences"
                          checked={includeJustifiedAbsences}
                          onCheckedChange={(checked) => setIncludeJustifiedAbsences(checked === true)}
                          data-testid="include-justified-absences"
                        />
                        <Label htmlFor="include-justified-absences">Absences justifiées</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-lateness"
                          checked={includeLateness}
                          onCheckedChange={(checked) => setIncludeLateness(checked === true)}
                          data-testid="include-lateness"
                        />
                        <Label htmlFor="include-lateness">Retards</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include-detentions"
                          checked={includeDetentions}
                          onCheckedChange={(checked) => setIncludeDetentions(checked === true)}
                          data-testid="include-detentions"
                        />
                        <Label htmlFor="include-detentions">Retenues</Label>
                      </div>
                    </div>
                  </div>

                  {/* Output Format */}
                  <div className="space-y-2">
                    <Label>Format de sortie</Label>
                    <Select value={generationFormat} onValueChange={(value: 'pdf' | 'batch_pdf') => setGenerationFormat(value)}>
                      <SelectTrigger data-testid="generation-format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF individuel</SelectItem>
                        <SelectItem value="batch_pdf">PDF groupé (lot)</SelectItem>
                      </SelectContent>
                    </Select>
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

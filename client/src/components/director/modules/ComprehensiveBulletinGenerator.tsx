import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/queryClient';
import { 
  FileText, 
  Download, 
  User, 
  BookOpen, 
  Save,
  CheckCircle,
  Loader2,
  GraduationCap,
  Users,
  Calculator,
  Eye,
  RefreshCw,
  AlertTriangle,
  Check,
  X,
  BarChart3,
  Calendar,
  School,
  FileDown,
  PlayCircle,
  StopCircle,
  Trash2,
  Star,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Types for bulletin generation
interface ApprovedGrade {
  id: number;
  studentId: number;
  subjectId: number;
  subjectName: string;
  teacherId: number;
  teacherName: string;
  firstEvaluation: number | null;
  secondEvaluation: number | null;
  thirdEvaluation: number | null;
  termAverage: number | null;
  coefficient: number;
  subjectComments: string | null;
  reviewStatus: 'approved';
  reviewedAt: string;
}

interface StudentData {
  id: number;
  firstName: string;
  lastName: string;
  matricule: string;
  classId: number;
  className: string;
  birthDate?: string;
  photo?: string;
  approvedGrades: ApprovedGrade[];
  overallAverage?: number;
  classRank?: number;
  totalStudents?: number;
}

interface ClassData {
  id: number;
  name: string;
  studentCount: number;
  approvedStudents: number;
  pendingStudents: number;
  completionRate: number;
}

interface BulletinGenerationRequest {
  studentIds: number[];
  classId: number;
  term: string;
  academicYear: string;
  includeComments: boolean;
  includeRankings: boolean;
  includeStatistics: boolean;
  format: 'pdf' | 'batch_pdf';
}

interface GenerationProgress {
  total: number;
  completed: number;
  current: string;
  errors: string[];
  downloadUrls: string[];
}

export default function ComprehensiveBulletinGenerator() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<'T1' | 'T2' | 'T3'>('T1');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Generation options
  const [includeComments, setIncludeComments] = useState(true);
  const [includeRankings, setIncludeRankings] = useState(true);
  const [includeStatistics, setIncludeStatistics] = useState(true);
  const [generationFormat, setGenerationFormat] = useState<'pdf' | 'batch_pdf'>('pdf');
  
  // Dialog states
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [previewStudentId, setPreviewStudentId] = useState<number | null>(null);
  
  // Generation tracking
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const text = {
    fr: {
      title: 'Générateur de Bulletins Complet',
      subtitle: 'Système avancé de génération de bulletins avec notes approuvées',
      
      // Tabs
      classSelection: 'Sélection de Classe',
      studentManagement: 'Gestion des Élèves',
      generationOptions: 'Options de Génération',
      bulkOperations: 'Opérations Groupées',
      
      // Class selection
      selectClass: 'Sélectionner une classe',
      selectTerm: 'Trimestre',
      academicYear: 'Année scolaire',
      loadStudents: 'Charger les élèves',
      classStatistics: 'Statistiques de la classe',
      
      // Student management
      studentsWithGrades: 'Élèves avec notes approuvées',
      selectAll: 'Sélectionner tout',
      deselectAll: 'Désélectionner tout',
      selectedStudents: 'élèves sélectionnés',
      searchStudents: 'Rechercher élèves...',
      
      // Generation options
      generationSettings: 'Paramètres de génération',
      includeComments: 'Inclure les commentaires des professeurs',
      includeRankings: 'Inclure les classements',
      includeStatistics: 'Inclure les statistiques de classe',
      outputFormat: 'Format de sortie',
      individualPdf: 'PDF individuels',
      batchPdf: 'PDF groupé (un fichier)',
      
      // Actions
      previewBulletin: 'Aperçu du bulletin',
      generateSelected: 'Générer pour les sélectionnés',
      generateAll: 'Générer pour toute la classe',
      downloadResults: 'Télécharger les résultats',
      
      // Status and progress
      generating: 'Génération en cours...',
      completed: 'Terminé',
      failed: 'Échec',
      progress: 'Progression',
      currentStudent: 'Élève actuel',
      
      // Validation and errors
      noClassSelected: 'Veuillez sélectionner une classe',
      noStudentsSelected: 'Veuillez sélectionner au moins un élève',
      insufficientGrades: 'Notes insuffisantes pour générer le bulletin',
      generationError: 'Erreur lors de la génération',
      
      // Quality control
      qualityCheck: 'Vérification qualité',
      gradesComplete: 'Notes complètes',
      gradesIncomplete: 'Notes incomplètes',
      readyForGeneration: 'Prêt pour génération',
      needsAttention: 'Nécessite attention',
      
      // Messages
      loadingClasses: 'Chargement des classes...',
      loadingStudents: 'Chargement des élèves...',
      generationSuccess: 'Bulletins générés avec succès',
      downloadReady: 'Téléchargement prêt',
      confirmGeneration: 'Confirmer la génération',
      confirmationMessage: 'Générer les bulletins pour {count} élève(s) sélectionné(s) ?',
      
      // Stats
      totalStudents: 'Total élèves',
      approvedGrades: 'Notes approuvées', 
      completionRate: 'Taux de complétion',
      averageGrade: 'Moyenne générale',
      
      // Common actions
      cancel: 'Annuler',
      confirm: 'Confirmer',
      close: 'Fermer',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès'
    },
    en: {
      title: 'Comprehensive Bulletin Generator',
      subtitle: 'Advanced bulletin generation system with approved grades',
      
      // Tabs
      classSelection: 'Class Selection',
      studentManagement: 'Student Management',
      generationOptions: 'Generation Options',
      bulkOperations: 'Bulk Operations',
      
      // Class selection
      selectClass: 'Select a class',
      selectTerm: 'Term',
      academicYear: 'Academic year',
      loadStudents: 'Load students',
      classStatistics: 'Class statistics',
      
      // Student management
      studentsWithGrades: 'Students with approved grades',
      selectAll: 'Select all',
      deselectAll: 'Deselect all',
      selectedStudents: 'students selected',
      searchStudents: 'Search students...',
      
      // Generation options
      generationSettings: 'Generation settings',
      includeComments: 'Include teacher comments',
      includeRankings: 'Include rankings',
      includeStatistics: 'Include class statistics',
      outputFormat: 'Output format',
      individualPdf: 'Individual PDFs',
      batchPdf: 'Batch PDF (single file)',
      
      // Actions
      previewBulletin: 'Preview bulletin',
      generateSelected: 'Generate for selected',
      generateAll: 'Generate for entire class',
      downloadResults: 'Download results',
      
      // Status and progress
      generating: 'Generating...',
      completed: 'Completed',
      failed: 'Failed',
      progress: 'Progress',
      currentStudent: 'Current student',
      
      // Validation and errors
      noClassSelected: 'Please select a class',
      noStudentsSelected: 'Please select at least one student',
      insufficientGrades: 'Insufficient grades to generate bulletin',
      generationError: 'Generation error',
      
      // Quality control
      qualityCheck: 'Quality check',
      gradesComplete: 'Grades complete',
      gradesIncomplete: 'Grades incomplete',
      readyForGeneration: 'Ready for generation',
      needsAttention: 'Needs attention',
      
      // Messages
      loadingClasses: 'Loading classes...',
      loadingStudents: 'Loading students...',
      generationSuccess: 'Bulletins generated successfully',
      downloadReady: 'Download ready',
      confirmGeneration: 'Confirm generation',
      confirmationMessage: 'Generate bulletins for {count} selected student(s)?',
      
      // Stats
      totalStudents: 'Total students',
      approvedGrades: 'Approved grades',
      completionRate: 'Completion rate',
      averageGrade: 'Overall average',
      
      // Common actions
      cancel: 'Cancel',
      confirm: 'Confirm',
      close: 'Close',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success'
    }
  };

  const t = text[language as keyof typeof text];

  // Load classes on component mount
  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: ['director-classes'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/director/classes');
      const data = await response.json();
      return data.success ? data.classes : [];
    }
  });

  // Load students with approved grades for selected class
  const { data: studentsData, isLoading: loadingStudents, refetch: refetchStudents } = useQuery({
    queryKey: ['approved-grades-students', selectedClass, selectedTerm, academicYear],
    queryFn: async () => {
      if (!selectedClass) return null;
      
      const response = await apiRequest('GET', 
        `/api/grade-review/approved-students?classId=${selectedClass}&term=${selectedTerm}&academicYear=${academicYear}`
      );
      const data = await response.json();
      return data.success ? data.data : null;
    },
    enabled: !!selectedClass
  });

  // Class statistics
  const { data: classStats } = useQuery({
    queryKey: ['class-stats', selectedClass, selectedTerm, academicYear],
    queryFn: async () => {
      if (!selectedClass) return null;
      
      const response = await apiRequest('GET', 
        `/api/grade-review/class-statistics?classId=${selectedClass}&term=${selectedTerm}&academicYear=${academicYear}`
      );
      const data = await response.json();
      return data.success ? data.data : null;
    },
    enabled: !!selectedClass
  });

  // Preview bulletin data
  const { data: previewData, isLoading: loadingPreview } = useQuery({
    queryKey: ['bulletin-preview', previewStudentId, selectedClass, selectedTerm, academicYear],
    queryFn: async () => {
      if (!previewStudentId) return null;
      
      const response = await apiRequest('GET', 
        `/api/bulletins/preview?studentId=${previewStudentId}&classId=${selectedClass}&term=${selectedTerm}&academicYear=${academicYear}`
      );
      const data = await response.json();
      return data.success ? data.data : null;
    },
    enabled: !!previewStudentId && showPreviewDialog
  });

  // Bulletin generation mutation
  const generateMutation = useMutation({
    mutationFn: async (request: BulletinGenerationRequest) => {
      const response = await apiRequest('POST', '/api/bulletins/generate-comprehensive', request);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setGenerationProgress(data.progress);
        setShowProgressDialog(true);
        toast({
          title: t.success,
          description: t.generationSuccess,
          variant: 'default'
        });
      }
    },
    onError: (error: any) => {
      console.error('Generation error:', error);
      toast({
        title: t.error,
        description: error.message || t.generationError,
        variant: 'destructive'
      });
      setIsGenerating(false);
    }
  });

  // Helper functions
  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    setSelectedStudents([]);
    setSearchQuery('');
  };

  const handleStudentSelection = (studentId: number, selected: boolean) => {
    if (selected) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  const handleSelectAll = () => {
    if (!studentsData?.students) return;
    
    const eligibleStudents = studentsData.students.filter((student: StudentData) => 
      student.approvedGrades.length > 0
    );
    
    if (selectedStudents.length === eligibleStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(eligibleStudents.map((s: StudentData) => s.id));
    }
  };

  const getStudentQualityStatus = (student: StudentData) => {
    const subjectCount = student.approvedGrades.length;
    const hasAverage = student.overallAverage && student.overallAverage > 0;
    
    if (subjectCount >= 6 && hasAverage) {
      return { status: 'complete', color: 'text-green-600', icon: CheckCircle };
    } else if (subjectCount >= 3) {
      return { status: 'partial', color: 'text-yellow-600', icon: AlertTriangle };
    } else {
      return { status: 'insufficient', color: 'text-red-600', icon: X };
    }
  };

  const handleGeneration = () => {
    if (!selectedClass) {
      toast({
        title: t.error,
        description: t.noClassSelected,
        variant: 'destructive'
      });
      return;
    }

    if (selectedStudents.length === 0) {
      toast({
        title: t.error,
        description: t.noStudentsSelected,
        variant: 'destructive'
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmGeneration = () => {
    setShowConfirmDialog(false);
    setIsGenerating(true);

    const request: BulletinGenerationRequest = {
      studentIds: selectedStudents,
      classId: parseInt(selectedClass),
      term: selectedTerm,
      academicYear,
      includeComments,
      includeRankings,
      includeStatistics,
      format: generationFormat
    };

    generateMutation.mutate(request);
  };

  const filteredStudents = studentsData?.students?.filter((student: StudentData) =>
    student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.matricule.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6" data-testid="comprehensive-bulletin-generator">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            {t.title}
          </CardTitle>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </CardHeader>
      </Card>

      {/* Main Interface */}
      <Tabs defaultValue="class-selection" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="class-selection">{t.classSelection}</TabsTrigger>
          <TabsTrigger value="student-management" disabled={!selectedClass}>
            {t.studentManagement}
          </TabsTrigger>
          <TabsTrigger value="generation-options" disabled={!selectedClass}>
            {t.generationOptions}
          </TabsTrigger>
          <TabsTrigger value="bulk-operations" disabled={selectedStudents.length === 0}>
            {t.bulkOperations}
          </TabsTrigger>
        </TabsList>

        {/* Class Selection Tab */}
        <TabsContent value="class-selection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                {t.classSelection}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Class Selection */}
                <div className="space-y-2">
                  <Label htmlFor="class-select">{t.selectClass}</Label>
                  <Select value={selectedClass} onValueChange={handleClassChange}>
                    <SelectTrigger id="class-select" data-testid="class-select">
                      <SelectValue placeholder={t.selectClass} />
                    </SelectTrigger>
                    <SelectContent>
                      {classes?.map((cls: any) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Term Selection */}
                <div className="space-y-2">
                  <Label htmlFor="term-select">{t.selectTerm}</Label>
                  <Select value={selectedTerm} onValueChange={(value: 'T1' | 'T2' | 'T3') => setSelectedTerm(value)}>
                    <SelectTrigger id="term-select" data-testid="term-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="T1">Trimestre 1</SelectItem>
                      <SelectItem value="T2">Trimestre 2</SelectItem>
                      <SelectItem value="T3">Trimestre 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Academic Year */}
                <div className="space-y-2">
                  <Label htmlFor="year-input">{t.academicYear}</Label>
                  <Input 
                    id="year-input"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    data-testid="academic-year-input"
                  />
                </div>
              </div>

              {/* Class Statistics */}
              {classStats && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">{t.classStatistics}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold">{classStats.totalStudents}</div>
                        <div className="text-sm text-muted-foreground">{t.totalStudents}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold">{classStats.approvedStudents}</div>
                        <div className="text-sm text-muted-foreground">{t.approvedGrades}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                        <div className="text-2xl font-bold">{classStats.completionRate}%</div>
                        <div className="text-sm text-muted-foreground">{t.completionRate}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                        <div className="text-2xl font-bold">{classStats.averageGrade?.toFixed(1)}/20</div>
                        <div className="text-sm text-muted-foreground">{t.averageGrade}</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Management Tab */}
        <TabsContent value="student-management" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t.studentsWithGrades}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSelectAll}
                    variant="outline"
                    size="sm"
                    data-testid="select-all-button"
                  >
                    {selectedStudents.length === filteredStudents.filter(s => s.approvedGrades.length > 0).length 
                      ? t.deselectAll 
                      : t.selectAll}
                  </Button>
                  <Badge variant="secondary">
                    {selectedStudents.length} {t.selectedStudents}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t.searchStudents}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="search-students"
                />
              </div>

              {/* Students List */}
              {loadingStudents ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>{t.loadingStudents}</span>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredStudents.map((student: StudentData) => {
                    const qualityStatus = getStudentQualityStatus(student);
                    const isSelected = selectedStudents.includes(student.id);
                    const hasApprovedGrades = student.approvedGrades.length > 0;
                    
                    return (
                      <Card 
                        key={student.id} 
                        className={`transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''} ${!hasApprovedGrades ? 'opacity-50' : ''}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => handleStudentSelection(student.id, !!checked)}
                                disabled={!hasApprovedGrades}
                                data-testid={`student-checkbox-${student.id}`}
                              />
                              <div className="flex items-center gap-3">
                                <User className="h-8 w-8 text-gray-400" />
                                <div>
                                  <div className="font-medium">
                                    {student.firstName} {student.lastName}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {student.matricule} • {student.className}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {/* Quality Status */}
                              <div className={`flex items-center gap-1 ${qualityStatus.color}`}>
                                <qualityStatus.icon className="h-4 w-4" />
                                <span className="text-sm">
                                  {student.approvedGrades.length} matières
                                </span>
                              </div>
                              
                              {/* Average */}
                              {student.overallAverage && (
                                <Badge variant="outline">
                                  {student.overallAverage.toFixed(1)}/20
                                </Badge>
                              )}
                              
                              {/* Ranking */}
                              {student.classRank && (
                                <Badge variant="secondary">
                                  #{student.classRank}/{student.totalStudents}
                                </Badge>
                              )}
                              
                              {/* Preview Button */}
                              {hasApprovedGrades && (
                                <Button
                                  onClick={() => {
                                    setPreviewStudentId(student.id);
                                    setShowPreviewDialog(true);
                                  }}
                                  variant="outline"
                                  size="sm"
                                  data-testid={`preview-button-${student.id}`}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  {t.previewBulletin}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generation Options Tab */}
        <TabsContent value="generation-options" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t.generationSettings}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Content Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contenu du bulletin</h3>
                <div className="grid gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-comments"
                      checked={includeComments}
                      onCheckedChange={setIncludeComments}
                      data-testid="include-comments"
                    />
                    <Label htmlFor="include-comments">{t.includeComments}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-rankings"
                      checked={includeRankings}
                      onCheckedChange={setIncludeRankings}
                      data-testid="include-rankings"
                    />
                    <Label htmlFor="include-rankings">{t.includeRankings}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-statistics"
                      checked={includeStatistics}
                      onCheckedChange={setIncludeStatistics}
                      data-testid="include-statistics"
                    />
                    <Label htmlFor="include-statistics">{t.includeStatistics}</Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Output Format */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t.outputFormat}</h3>
                <Select value={generationFormat} onValueChange={(value: 'pdf' | 'batch_pdf') => setGenerationFormat(value)}>
                  <SelectTrigger data-testid="format-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">{t.individualPdf}</SelectItem>
                    <SelectItem value="batch_pdf">{t.batchPdf}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Operations Tab */}
        <TabsContent value="bulk-operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                {t.bulkOperations}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Generation Summary */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">Résumé de la génération</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Classe sélectionnée: {classes?.find((c: any) => c.id.toString() === selectedClass)?.name}</div>
                  <div>Trimestre: {selectedTerm}</div>
                  <div>Année scolaire: {academicYear}</div>
                  <div>Élèves sélectionnés: {selectedStudents.length}</div>
                  <div>Format: {generationFormat === 'pdf' ? t.individualPdf : t.batchPdf}</div>
                  <div>Options: {[includeComments && 'Commentaires', includeRankings && 'Classements', includeStatistics && 'Statistiques'].filter(Boolean).join(', ')}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handleGeneration}
                  disabled={selectedStudents.length === 0 || isGenerating}
                  className="flex-1"
                  data-testid="generate-selected-button"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4 mr-2" />
                  )}
                  {t.generateSelected} ({selectedStudents.length})
                </Button>
                
                <Button
                  onClick={() => {
                    if (studentsData?.students) {
                      const eligibleStudents = studentsData.students.filter((s: StudentData) => s.approvedGrades.length > 0);
                      setSelectedStudents(eligibleStudents.map((s: StudentData) => s.id));
                      handleGeneration();
                    }
                  }}
                  variant="outline"
                  disabled={!studentsData?.students || isGenerating}
                  data-testid="generate-all-button"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t.generateAll}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aperçu du bulletin</DialogTitle>
            <DialogDescription>
              Aperçu du bulletin pour l'élève sélectionné
            </DialogDescription>
          </DialogHeader>
          
          {loadingPreview ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Chargement de l'aperçu...</span>
            </div>
          ) : previewData ? (
            <div className="space-y-4">
              {/* Student Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold">Informations élève</h3>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>Nom: {previewData.student.firstName} {previewData.student.lastName}</div>
                  <div>Classe: {previewData.student.className}</div>
                  <div>Matricule: {previewData.student.matricule}</div>
                  <div>Moyenne: {previewData.overallAverage?.toFixed(2)}/20</div>
                </div>
              </div>
              
              {/* Grades Preview */}
              <div className="space-y-2">
                <h3 className="font-semibold">Notes approuvées</h3>
                <div className="space-y-1">
                  {previewData.subjects?.map((subject: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                      <span>{subject.name}</span>
                      <span>{subject.grade}/20 (Coef. {subject.coefficient})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucune donnée d'aperçu disponible
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowPreviewDialog(false)}>
              {t.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progress Dialog */}
      <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.generating}</DialogTitle>
            <DialogDescription>
              {t.progress}: {generationProgress?.completed || 0}/{generationProgress?.total || 0}
            </DialogDescription>
          </DialogHeader>
          
          {generationProgress && (
            <div className="space-y-4">
              <Progress 
                value={(generationProgress.completed / generationProgress.total) * 100} 
                className="w-full"
              />
              <div className="text-sm text-muted-foreground">
                {t.currentStudent}: {generationProgress.current}
              </div>
              
              {generationProgress.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-red-600">Erreurs:</h4>
                  {generationProgress.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              )}
              
              {generationProgress.downloadUrls.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-green-600">Téléchargements prêts:</h4>
                  {generationProgress.downloadUrls.map((url, index) => (
                    <Button
                      key={index}
                      onClick={() => window.open(url, '_blank')}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger bulletin {index + 1}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowProgressDialog(false)}>
              {t.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.confirmGeneration}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.confirmationMessage.replace('{count}', selectedStudents.length.toString())}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmGeneration} data-testid="confirm-generation">
              {t.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
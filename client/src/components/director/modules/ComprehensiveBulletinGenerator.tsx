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
  Search,
  Clock
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

// Texte des niveaux de rendement (bilingue)
export const PERFORMANCE_LEVELS_TEXT = {
  fr: `NIVEAU DE RENDEMENT:
DESCRIPTION DES NIVEAUX DE RENDEMENT DE L'ÉLÈVE
Le niveau de rendement est déterminé par les résultats obtenus après l'évaluation des apprentissages. 
Le niveau 1 indique un rendement non satisfaisant. L'élève est en dessous de la moyenne, Il a besoin d'un accompagnement particulier pour les compétences non acquises (tutorat, devoirs supplémentaires…).
Le niveau 2, bien qu'il indique une réussite, la cote C correspond à un niveau de rendement qui ne donne pas entièrement satisfaction. L'élève démontre avec une efficacité limitée l'habileté à mobiliser des ressources pour développer la compétence. Un rendement à ce niveau exige que l'élève s'améliore considérablement pour combler des insuffisances spécifiques dans ses apprentissages (accompagnement par des travaux supplémentaires).
Par ailleurs, la cote C+ correspond à un niveau de rendement assez satisfaisant. À ce stade, l'élève démontre avec une certaine efficacité l'habileté à mobiliser des ressources pour développer la compétence. Un rendement à ce niveau indique que l'élève devrait s'efforcer de corriger les insuffisances identifiées dans ses apprentissages. 
Le niveau 3 indique un rendement satisfaisant. L'élève démontre avec efficacité l'habileté à mobiliser des ressources pour développer la compétence. Un rendement à ce niveau montre que l'élève mène bien ses apprentissages.
Le niveau 4 signifie que le rendement de l'élève est très élevé. L'élève démontre avec beaucoup d'efficacité l'habileté à mobiliser des ressources pour développer la compétence. Ce niveau montre que l'élève a mené avec brio ses apprentissages.`,
  
  en: `PERFORMANCE LEVELS:
DESCRIPTION OF STUDENT PERFORMANCE LEVELS
The level of performance is determined by the score obtained in the summative assessment.
Level 1 indicates unsatisfactory performance. The student performance is below average and will require assistance where competences were not acquired (mentoring, extra homework).
Level 2, while indicating success, C means performance that is not entirely satisfactory. The student demonstrates, with limited effectiveness, the ability to mobilise resources to develop the competence. Performance at this level shows that the student needs to improve considerably to overcome specific shortcomings in his/her learning (extra support needed).
C+ means the performance is fairly satisfactory. The student demonstrates, with certain effectiveness, the ability to mobilise resources to develop the competence. Performance at this level shows that the student should strive to overcome specific shortcomings in his/her learning.
Level 3 shows satisfactory performance. The student demonstrates, with effectiveness, the ability to mobilise resources to develop the competence. Performance at this level shows that the student is learning successfully.
Level 4 means that the student's performance is very high. The student demonstrates, with a great deal of effectiveness, the ability to mobilise resources to develop the competence. This level shows that the student excellently mastered his/her learning.`
};

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
  includePerformanceLevels: boolean;
  format: 'pdf' | 'batch_pdf';
  
  // Section Évaluation & Trimestre
  includeFirstTrimester: boolean;
  includeDiscipline: boolean;
  includeStudentWork: boolean;
  includeClassProfile: boolean;
  
  // Section Absences & Retards
  includeUnjustifiedAbsences: boolean;
  includeJustifiedAbsences: boolean;
  includeLateness: boolean;
  includeDetentions: boolean;
  
  // Section Sanctions Disciplinaires
  includeConductWarning: boolean;
  includeConductBlame: boolean;
  includeExclusions: boolean;
  includePermanentExclusion: boolean;
  
  // Section Moyennes & Totaux
  includeTotalGeneral: boolean;
  includeAppreciations: boolean;
  includeGeneralAverage: boolean;
  includeTrimesterAverage: boolean;
  includeNumberOfAverages: boolean;
  includeSuccessRate: boolean;
  
  // Section Coefficients & Codes
  includeCoef: boolean;
  includeCTBA: boolean;
  includeMinMax: boolean;
  includeCBA: boolean;
  includeCA: boolean;
  includeCMA: boolean;
  includeCOTE: boolean;
  includeCNA: boolean;
  
  // Section Appréciations & Signatures
  includeWorkAppreciation: boolean;
  includeParentVisa: boolean;
  includeTeacherVisa: boolean;
  includeHeadmasterVisa: boolean;
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
  const [includePerformanceLevels, setIncludePerformanceLevels] = useState(true);
  const [generationFormat, setGenerationFormat] = useState<'pdf' | 'batch_pdf'>('pdf');
  
  // Section Évaluation & Trimestre
  const [includeFirstTrimester, setIncludeFirstTrimester] = useState(false);
  const [includeDiscipline, setIncludeDiscipline] = useState(false);
  const [includeStudentWork, setIncludeStudentWork] = useState(false);
  const [includeClassProfile, setIncludeClassProfile] = useState(false);
  
  // Section Absences & Retards
  const [includeUnjustifiedAbsences, setIncludeUnjustifiedAbsences] = useState(false);
  const [includeJustifiedAbsences, setIncludeJustifiedAbsences] = useState(false);
  const [includeLateness, setIncludeLateness] = useState(false);
  const [includeDetentions, setIncludeDetentions] = useState(false);
  
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
      includePerformanceLevels: 'Inclure les niveaux de rendement',
      outputFormat: 'Format de sortie',
      individualPdf: 'PDF individuels',
      batchPdf: 'PDF groupé (un fichier)',
      
      // Section Évaluation & Trimestre
      sectionEvaluation: 'Évaluation & Trimestre',
      includeFirstTrimester: '1er trimestre',
      includeDiscipline: 'Discipline',
      includeStudentWork: 'Travail de l\'élève',
      includeClassProfile: 'Profil de la classe',
      
      // Section Absences & Retards
      sectionAbsences: 'Absences & Retards',
      includeUnjustifiedAbsences: 'Abs. non. J. (h)',
      includeJustifiedAbsences: 'Abs just. (h)',
      includeLateness: 'Retards (nombre de fois)',
      includeDetentions: 'Consignes (heures)',
      
      // Section Sanctions Disciplinaires
      sectionSanctions: 'Sanctions Disciplinaires',
      includeConductWarning: 'Avertissement de conduite',
      includeConductBlame: 'Blâme de conduite',
      includeExclusions: 'Exclusions (jours)',
      includePermanentExclusion: 'Exclusion définitive',
      
      // Section Moyennes & Totaux
      sectionAverages: 'Moyennes & Totaux',
      includeTotalGeneral: 'TOTAL GÉNÉRAL',
      includeAppreciations: 'APPRÉCIATIONS',
      includeGeneralAverage: 'Moyenne Générale',
      includeTrimesterAverage: 'MOYENNE TRIM',
      includeNumberOfAverages: 'Nombre de moyennes',
      includeSuccessRate: 'Taux de réussite',
      
      // Section Coefficients & Codes
      sectionCoefficients: 'Coefficients & Codes',
      includeCoef: 'COEF',
      includeCTBA: 'CTBA',
      includeMinMax: '[Min – Max]',
      includeCBA: 'CBA',
      includeCA: 'CA',
      includeCMA: 'CMA',
      includeCOTE: 'COTE',
      includeCNA: 'CNA',
      
      // Section Appréciations & Signatures
      sectionSignatures: 'Appréciations & Signatures',
      includeWorkAppreciation: 'Appréciation du travail de l\'élève (points forts et points à améliorer)',
      includeParentVisa: 'Visa du parent / Tuteur',
      includeTeacherVisa: 'Nom et visa du professeur principal',
      includeHeadmasterVisa: 'Le Chef d\'établissement',
      
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
      includePerformanceLevels: 'Include performance levels',
      outputFormat: 'Output format',
      individualPdf: 'Individual PDFs',
      batchPdf: 'Batch PDF (single file)',
      
      // Section Évaluation & Trimestre
      sectionEvaluation: 'Evaluation & Term',
      includeFirstTrimester: 'First term',
      includeDiscipline: 'Discipline',
      includeStudentWork: 'Student work',
      includeClassProfile: 'Class profile',
      
      // Section Absences & Retards
      sectionAbsences: 'Absences & Lateness',
      includeUnjustifiedAbsences: 'Unjust. Abs. (h)',
      includeJustifiedAbsences: 'Just. Abs. (h)',
      includeLateness: 'Lateness (number of times)',
      includeDetentions: 'Detentions (hours)',
      
      // Section Sanctions Disciplinaires
      sectionSanctions: 'Disciplinary Sanctions',
      includeConductWarning: 'Conduct warning',
      includeConductBlame: 'Conduct blame',
      includeExclusions: 'Exclusions (days)',
      includePermanentExclusion: 'Permanent exclusion',
      
      // Section Moyennes & Totaux
      sectionAverages: 'Averages & Totals',
      includeTotalGeneral: 'GENERAL TOTAL',
      includeAppreciations: 'APPRECIATIONS',
      includeGeneralAverage: 'General Average',
      includeTrimesterAverage: 'TERM AVERAGE',
      includeNumberOfAverages: 'Number of averages',
      includeSuccessRate: 'Success rate',
      
      // Section Coefficients & Codes
      sectionCoefficients: 'Coefficients & Codes',
      includeCoef: 'COEF',
      includeCTBA: 'CTBA',
      includeMinMax: '[Min – Max]',
      includeCBA: 'CBA',
      includeCA: 'CA',
      includeCMA: 'CMA',
      includeCOTE: 'GRADE',
      includeCNA: 'CNA',
      
      // Section Appréciations & Signatures
      sectionSignatures: 'Appreciations & Signatures',
      includeWorkAppreciation: 'Student work appreciation (strengths and areas to improve)',
      includeParentVisa: 'Parent/Guardian visa',
      includeTeacherVisa: 'Main teacher name and visa',
      includeHeadmasterVisa: 'The School Head',
      
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
      includePerformanceLevels,
      format: generationFormat,
      
      // Section Évaluation & Trimestre
      includeFirstTrimester,
      includeDiscipline,
      includeStudentWork,
      includeClassProfile,
      
      // Section Absences & Retards
      includeUnjustifiedAbsences,
      includeJustifiedAbsences,
      includeLateness,
      includeDetentions,
      
      // Section Sanctions Disciplinaires
      includeConductWarning,
      includeConductBlame,
      includeExclusions,
      includePermanentExclusion,
      
      // Section Moyennes & Totaux
      includeTotalGeneral,
      includeAppreciations,
      includeGeneralAverage,
      includeTrimesterAverage,
      includeNumberOfAverages,
      includeSuccessRate,
      
      // Section Coefficients & Codes
      includeCoef,
      includeCTBA,
      includeMinMax,
      includeCBA,
      includeCA,
      includeCMA,
      includeCOTE,
      includeCNA,
      
      // Section Appréciations & Signatures
      includeWorkAppreciation,
      includeParentVisa,
      includeTeacherVisa,
      includeHeadmasterVisa
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
              {/* Content Options - Organized in Logical Sections */}
              <div className="space-y-8">
                <h3 className="text-lg font-semibold">Contenu du bulletin</h3>
                
                {/* Basic Options (Keep existing) */}
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
                      <Label htmlFor="include-performance-levels">{t.includePerformanceLevels}</Label>
                    </div>
                  </div>
                </div>

                {/* Section Évaluation & Trimestre */}
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t.sectionEvaluation}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-first-trimester"
                        checked={includeFirstTrimester}
                        onCheckedChange={(checked) => setIncludeFirstTrimester(checked === true)}
                        data-testid="include-first-trimester"
                      />
                      <Label htmlFor="include-first-trimester">{t.includeFirstTrimester}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-discipline"
                        checked={includeDiscipline}
                        onCheckedChange={(checked) => setIncludeDiscipline(checked === true)}
                        data-testid="include-discipline"
                      />
                      <Label htmlFor="include-discipline">{t.includeDiscipline}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-student-work"
                        checked={includeStudentWork}
                        onCheckedChange={(checked) => setIncludeStudentWork(checked === true)}
                        data-testid="include-student-work"
                      />
                      <Label htmlFor="include-student-work">{t.includeStudentWork}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-class-profile"
                        checked={includeClassProfile}
                        onCheckedChange={(checked) => setIncludeClassProfile(checked === true)}
                        data-testid="include-class-profile"
                      />
                      <Label htmlFor="include-class-profile">{t.includeClassProfile}</Label>
                    </div>
                  </div>
                </div>

                {/* Section Absences & Retards */}
                <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t.sectionAbsences}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-unjustified-absences"
                        checked={includeUnjustifiedAbsences}
                        onCheckedChange={(checked) => setIncludeUnjustifiedAbsences(checked === true)}
                        data-testid="include-unjustified-absences"
                      />
                      <Label htmlFor="include-unjustified-absences">{t.includeUnjustifiedAbsences}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-justified-absences"
                        checked={includeJustifiedAbsences}
                        onCheckedChange={(checked) => setIncludeJustifiedAbsences(checked === true)}
                        data-testid="include-justified-absences"
                      />
                      <Label htmlFor="include-justified-absences">{t.includeJustifiedAbsences}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-lateness"
                        checked={includeLateness}
                        onCheckedChange={(checked) => setIncludeLateness(checked === true)}
                        data-testid="include-lateness"
                      />
                      <Label htmlFor="include-lateness">{t.includeLateness}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-detentions"
                        checked={includeDetentions}
                        onCheckedChange={(checked) => setIncludeDetentions(checked === true)}
                        data-testid="include-detentions"
                      />
                      <Label htmlFor="include-detentions">{t.includeDetentions}</Label>
                    </div>
                  </div>
                </div>

                {/* Section Sanctions Disciplinaires */}
                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    {t.sectionSanctions}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-conduct-warning"
                        checked={includeConductWarning}
                        onCheckedChange={(checked) => setIncludeConductWarning(checked === true)}
                        data-testid="include-conduct-warning"
                      />
                      <Label htmlFor="include-conduct-warning">{t.includeConductWarning}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-conduct-blame"
                        checked={includeConductBlame}
                        onCheckedChange={(checked) => setIncludeConductBlame(checked === true)}
                        data-testid="include-conduct-blame"
                      />
                      <Label htmlFor="include-conduct-blame">{t.includeConductBlame}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-exclusions"
                        checked={includeExclusions}
                        onCheckedChange={(checked) => setIncludeExclusions(checked === true)}
                        data-testid="include-exclusions"
                      />
                      <Label htmlFor="include-exclusions">{t.includeExclusions}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-permanent-exclusion"
                        checked={includePermanentExclusion}
                        onCheckedChange={(checked) => setIncludePermanentExclusion(checked === true)}
                        data-testid="include-permanent-exclusion"
                      />
                      <Label htmlFor="include-permanent-exclusion">{t.includePermanentExclusion}</Label>
                    </div>
                  </div>
                </div>

                {/* Section Moyennes & Totaux */}
                <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    {t.sectionAverages}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-total-general"
                        checked={includeTotalGeneral}
                        onCheckedChange={(checked) => setIncludeTotalGeneral(checked === true)}
                        data-testid="include-total-general"
                      />
                      <Label htmlFor="include-total-general">{t.includeTotalGeneral}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-appreciations"
                        checked={includeAppreciations}
                        onCheckedChange={(checked) => setIncludeAppreciations(checked === true)}
                        data-testid="include-appreciations"
                      />
                      <Label htmlFor="include-appreciations">{t.includeAppreciations}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-general-average"
                        checked={includeGeneralAverage}
                        onCheckedChange={(checked) => setIncludeGeneralAverage(checked === true)}
                        data-testid="include-general-average"
                      />
                      <Label htmlFor="include-general-average">{t.includeGeneralAverage}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-trimester-average"
                        checked={includeTrimesterAverage}
                        onCheckedChange={(checked) => setIncludeTrimesterAverage(checked === true)}
                        data-testid="include-trimester-average"
                      />
                      <Label htmlFor="include-trimester-average">{t.includeTrimesterAverage}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-number-of-averages"
                        checked={includeNumberOfAverages}
                        onCheckedChange={(checked) => setIncludeNumberOfAverages(checked === true)}
                        data-testid="include-number-of-averages"
                      />
                      <Label htmlFor="include-number-of-averages">{t.includeNumberOfAverages}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-success-rate"
                        checked={includeSuccessRate}
                        onCheckedChange={(checked) => setIncludeSuccessRate(checked === true)}
                        data-testid="include-success-rate"
                      />
                      <Label htmlFor="include-success-rate">{t.includeSuccessRate}</Label>
                    </div>
                  </div>
                </div>

                {/* Section Coefficients & Codes */}
                <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    {t.sectionCoefficients}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-coef"
                        checked={includeCoef}
                        onCheckedChange={(checked) => setIncludeCoef(checked === true)}
                        data-testid="include-coef"
                      />
                      <Label htmlFor="include-coef">{t.includeCoef}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-ctba"
                        checked={includeCTBA}
                        onCheckedChange={(checked) => setIncludeCTBA(checked === true)}
                        data-testid="include-ctba"
                      />
                      <Label htmlFor="include-ctba">{t.includeCTBA}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-min-max"
                        checked={includeMinMax}
                        onCheckedChange={(checked) => setIncludeMinMax(checked === true)}
                        data-testid="include-min-max"
                      />
                      <Label htmlFor="include-min-max">{t.includeMinMax}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-cba"
                        checked={includeCBA}
                        onCheckedChange={(checked) => setIncludeCBA(checked === true)}
                        data-testid="include-cba"
                      />
                      <Label htmlFor="include-cba">{t.includeCBA}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-ca"
                        checked={includeCA}
                        onCheckedChange={(checked) => setIncludeCA(checked === true)}
                        data-testid="include-ca"
                      />
                      <Label htmlFor="include-ca">{t.includeCA}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-cma"
                        checked={includeCMA}
                        onCheckedChange={(checked) => setIncludeCMA(checked === true)}
                        data-testid="include-cma"
                      />
                      <Label htmlFor="include-cma">{t.includeCMA}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-cote"
                        checked={includeCOTE}
                        onCheckedChange={(checked) => setIncludeCOTE(checked === true)}
                        data-testid="include-cote"
                      />
                      <Label htmlFor="include-cote">{t.includeCOTE}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-cna"
                        checked={includeCNA}
                        onCheckedChange={(checked) => setIncludeCNA(checked === true)}
                        data-testid="include-cna"
                      />
                      <Label htmlFor="include-cna">{t.includeCNA}</Label>
                    </div>
                  </div>
                </div>

                {/* Section Appréciations & Signatures */}
                <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {t.sectionSignatures}
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-work-appreciation"
                        checked={includeWorkAppreciation}
                        onCheckedChange={(checked) => setIncludeWorkAppreciation(checked === true)}
                        data-testid="include-work-appreciation"
                      />
                      <Label htmlFor="include-work-appreciation">{t.includeWorkAppreciation}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-parent-visa"
                        checked={includeParentVisa}
                        onCheckedChange={(checked) => setIncludeParentVisa(checked === true)}
                        data-testid="include-parent-visa"
                      />
                      <Label htmlFor="include-parent-visa">{t.includeParentVisa}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-teacher-visa"
                        checked={includeTeacherVisa}
                        onCheckedChange={(checked) => setIncludeTeacherVisa(checked === true)}
                        data-testid="include-teacher-visa"
                      />
                      <Label htmlFor="include-teacher-visa">{t.includeTeacherVisa}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-headmaster-visa"
                        checked={includeHeadmasterVisa}
                        onCheckedChange={(checked) => setIncludeHeadmasterVisa(checked === true)}
                        data-testid="include-headmaster-visa"
                      />
                      <Label htmlFor="include-headmaster-visa">{t.includeHeadmasterVisa}</Label>
                    </div>
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
                  <div>Options: {[includeComments && 'Commentaires', includeRankings && 'Classements', includeStatistics && 'Statistiques', includePerformanceLevels && 'Niveaux de rendement'].filter(Boolean).join(', ')}</div>
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
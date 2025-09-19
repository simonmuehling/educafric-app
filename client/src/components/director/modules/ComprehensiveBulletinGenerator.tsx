import React, { useState, useEffect, Suspense, lazy, useMemo, useCallback, useDeferredValue } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/queryClient';
import { 
  bulletinComprehensiveValidationSchema, 
  insertBulletinSubjectCodesSchema,
  type InsertBulletinComprehensive,
  type InsertBulletinSubjectCodes
} from '@shared/schemas/bulletinComprehensiveSchema';
import { 
  sanctionFormSchema, 
  SANCTION_TYPES, 
  SANCTION_SEVERITY,
  type SanctionForm 
} from '@shared/schemas/sanctionsSchema';
import { useStudentSanctions, useCreateSanction, useDeleteSanction, useRevokeSanction } from '@/hooks/useSanctions';
import { 
  bulletinTemplateInsertSchema, 
  templateElementSchema,
  type BulletinTemplate,
  type InsertBulletinTemplate,
  type TemplateElement,
  type ElementProperties,
  ELEMENT_CATEGORIES,
  ELEMENT_TYPES 
} from '@shared/schemas/bulletinTemplateSchema';

// Drag and Drop imports
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  Clock,
  ChevronDown,
  ChevronUp,
  Edit3,
  Database,
  UserCheck,
  FileSignature,
  Settings,
  BookMarked,
  PieChart,
  LineChart,
  Plus,
  Image,
  Layout,
  Palette,
  Square,
  RotateCcw,
  Timer,
  XCircle,
  AlertCircle,
  Target,
  Type,
  PenTool,
  Activity,
  Zap,
  Mail,
  MessageSquare,
  Phone,
  CheckCircle2,
  History,
  CalendarDays,
  Users2,
  TrendingDown,
  Move,
  Copy,
  Grid
} from 'lucide-react';

// Lazy loaded components
const BulkSignatureModal = lazy(() => import('@/components/shared/BulkSignatureModal'));
const ReportsTab = lazy(() => import('./components/ReportsTab'));
// LoadingSkeleton is NOT lazy to avoid waterfalls when used as Suspense fallback
import LoadingSkeleton from './components/LoadingSkeleton';
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
  
  // Section Conseil de Classe
  includeClassCouncilDecisions: boolean;
  includeClassCouncilMentions: boolean;
  includeOrientationRecommendations: boolean;
  includeCouncilDate: boolean;
}

interface GenerationProgress {
  total: number;
  completed: number;
  current: string;
  errors: string[];
  downloadUrls: string[];
}

// Manual data entry validation schema
const manualDataValidationSchema = z.object({
  // Absences & Lateness
  unjustifiedAbsenceHours: z.string().optional().refine((val) => !val || !isNaN(parseFloat(val)), "Must be a valid number"),
  justifiedAbsenceHours: z.string().optional().refine((val) => !val || !isNaN(parseFloat(val)), "Must be a valid number"),
  latenessCount: z.number().min(0, "Must be >= 0").optional(),
  detentionHours: z.string().optional().refine((val) => !val || !isNaN(parseFloat(val)), "Must be a valid number"),
  
  // Disciplinary Sanctions
  conductWarning: z.boolean().optional(),
  conductBlame: z.boolean().optional(),
  exclusionDays: z.number().min(0, "Must be >= 0").optional(),
  permanentExclusion: z.boolean().optional(),
  
  // Academic Totals
  totalGeneral: z.string().optional().refine((val) => !val || !isNaN(parseFloat(val)), "Must be a valid number"),
  numberOfAverages: z.number().min(0, "Must be >= 0").optional(),
  successRate: z.string().optional().refine((val) => !val || !isNaN(parseFloat(val)), "Must be a valid number"),
  
  // Appreciations
  workAppreciation: z.string().max(500, "Maximum 500 characters").optional(),
  generalComment: z.string().max(300, "Maximum 300 characters").optional(),
  
  // Signatures
  parentVisaName: z.string().optional(),
  parentVisaDate: z.string().optional(),
  teacherVisaName: z.string().optional(),
  teacherVisaDate: z.string().optional(),
  headmasterVisaName: z.string().optional(),
  headmasterVisaDate: z.string().optional(),
  
  // Conseil de Classe
  classCouncilDecisions: z.string().max(1000, "Maximum 1000 characters").optional(),
  classCouncilMentions: z.enum(["Félicitations", "Encouragements", "Satisfaisant", "Mise en garde", "Blâme", ""]).optional(),
  orientationRecommendations: z.string().max(1000, "Maximum 1000 characters").optional(),
  councilDate: z.string().optional(),
  councilParticipants: z.string().max(500, "Maximum 500 characters").optional(),
  
  // Subject Coefficients (dynamic fields will be added based on subjects)
  subjectCoefficients: z.record(z.object({
    CTBA: z.string().optional().refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 20), "Must be a valid number between 0-20"),
    CBA: z.string().optional().refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 20), "Must be a valid number between 0-20"),
    CA: z.string().optional().refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 20), "Must be a valid number between 0-20"),
    CMA: z.string().optional().refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 20), "Must be a valid number between 0-20"),
    COTE: z.enum(["A", "B", "C", "D", "E", "F", ""]).optional(),
    CNA: z.string().max(50).optional(),
    minGrade: z.string().optional().refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 20), "Must be a valid number between 0-20"),
    maxGrade: z.string().optional().refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 20), "Must be a valid number between 0-20")
  })).optional()
});

type ManualDataForm = z.infer<typeof manualDataValidationSchema>;

export default function ComprehensiveBulletinGenerator() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<'T1' | 'T2' | 'T3'>('T1');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  
  // Lazy loading state for tabs (mount-on-enter pattern)
  const [activeTab, setActiveTab] = useState('class-selection');
  const [mountedTabs, setMountedTabs] = useState<Set<string>>(new Set(['class-selection']));
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // ===== PERFORMANCE OPTIMIZATIONS =====
  // Defer search query to avoid re-rendering on every keystroke
  const deferredSearchQuery = useDeferredValue(searchQuery);
  
  // Bulk selection state for bulletins
  const [selectedBulletins, setSelectedBulletins] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Bulk signature modal state
  const [showBulkSignatureModal, setShowBulkSignatureModal] = useState(false);
  const [selectedBulletinsForSigning, setSelectedBulletinsForSigning] = useState<any[]>([]);
  
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
  
  // Section Conseil de Classe
  const [includeClassCouncilDecisions, setIncludeClassCouncilDecisions] = useState(false);
  const [includeClassCouncilMentions, setIncludeClassCouncilMentions] = useState(false);
  const [includeOrientationRecommendations, setIncludeOrientationRecommendations] = useState(false);
  const [includeCouncilDate, setIncludeCouncilDate] = useState(false);
  
  // Dialog states
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showLoadDraftDialog, setShowLoadDraftDialog] = useState(false);
  const [showResetConfirmDialog, setShowResetConfirmDialog] = useState(false);
  const [previewStudentId, setPreviewStudentId] = useState<number | null>(null);
  const [availableDrafts, setAvailableDrafts] = useState<Array<{key: string, studentName: string, date: string, classId: string, term: string}>>([]);
  
  // Distribution tracking states
  const [showDistributionDialog, setShowDistributionDialog] = useState(false);
  const [selectedBulletinForDistribution, setSelectedBulletinForDistribution] = useState<number | null>(null);
  const [distributionStatus, setDistributionStatus] = useState<any>(null);
  const [loadingDistributionStatus, setLoadingDistributionStatus] = useState(false);
  
  // ===== REPORTING STATES =====
  // Report filters state
  const [reportFilters, setReportFilters] = useState({
    reportType: 'overview',
    term: selectedTerm,
    academicYear: academicYear,
    classId: selectedClass,
    startDate: '',
    endDate: '',
    status: '',
    channel: ''
  });
  
  // Report data states
  const [reportData, setReportData] = useState<any>(null);
  const [loadingReportData, setLoadingReportData] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  
  // Timeline and export states
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [exportingReport, setExportingReport] = useState(false);
  
  // NOUVEAU : Handle distribution status viewing
  const handleViewDistributionStatus = async (bulletinId: number) => {
    try {
      setSelectedBulletinForDistribution(bulletinId);
      setLoadingDistributionStatus(true);
      setShowDistributionDialog(true);
      
      console.log('[DISTRIBUTION_STATUS] Fetching status for bulletin:', bulletinId);
      
      const response = await fetch(`/api/comprehensive-bulletins/${bulletinId}/distribution-status`);
      const data = await response.json();
      
      if (response.ok) {
        setDistributionStatus(data);
        console.log('[DISTRIBUTION_STATUS] Status loaded:', data);
        
        toast({
          title: 'Statut de distribution chargé',
          description: 'Les détails de distribution ont été chargés avec succès.',
        });
      } else {
        throw new Error(data.message || 'Erreur lors du chargement du statut');
      }
    } catch (error: any) {
      console.error('[DISTRIBUTION_STATUS] Error loading status:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de charger le statut de distribution',
        variant: 'destructive'
      });
      setShowDistributionDialog(false);
    } finally {
      setLoadingDistributionStatus(false);
    }
  };
  
  // Helper function to render recipient status badge
  const renderRecipientStatusBadge = (status: string, sent: boolean, error?: string) => {
    if (sent && status === 'sent') {
      return (
        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
          <CheckCircle className="h-3 w-3 mr-1" />
          Envoyé ✅
        </Badge>
      );
    } else if (error || status === 'failed') {
      return (
        <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
          <X className="h-3 w-3 mr-1" />
          Échec ❌
        </Badge>
      );
    } else if (status === 'retrying') {
      return (
        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry 🔄
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
          <Clock className="h-3 w-3 mr-1" />
          En attente ⏳
        </Badge>
      );
    }
  };
  
  // Generation tracking
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Manual data entry state
  const [selectedStudentForEntry, setSelectedStudentForEntry] = useState<number | null>(null);
  const [isManualEntryMode, setIsManualEntryMode] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<Record<string, ManualDataForm>>({});
  
  // Collapsible sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    absences: true,
    sanctions: false,
    totals: false,
    subjectCoefficients: false,
    appreciations: false,
    classCouncil: false,
    signatures: false
  });
  
  // Subject coefficients data state
  const [subjectCoefficients, setSubjectCoefficients] = useState<Record<string, any>>({});
  
  // ===== TEMPLATE CREATOR STATES =====
  // Current template being edited
  const [currentTemplate, setCurrentTemplate] = useState<BulletinTemplate | null>(null);
  const [templateElements, setTemplateElements] = useState<TemplateElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  
  // Advanced template editor states
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(10);
  const [showGuides, setShowGuides] = useState(true);
  const [alignmentGuides, setAlignmentGuides] = useState<Array<{x?: number, y?: number}>>([]);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [activeElementTool, setActiveElementTool] = useState<'select' | 'move' | 'delete' | 'duplicate'>('select');
  
  // Template history for undo/redo
  const [templateHistory, setTemplateHistory] = useState<TemplateElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
  // Preview and export states
  const [templatePreviewDialog, setTemplatePreviewDialog] = useState(false);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [isExporting, setIsExporting] = useState(false);
  
  // Layers panel state
  const [showLayersPanel, setShowLayersPanel] = useState(true);
  const [layersExpanded, setLayersExpanded] = useState(true);
  
  // Template form state
  const templateForm = useForm<InsertBulletinTemplate>({
    resolver: zodResolver(bulletinTemplateInsertSchema),
    defaultValues: {
      name: '',
      description: '',
      templateType: 'custom',
      pageFormat: 'A4',
      orientation: 'portrait',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      elements: [],
      globalStyles: {
        fontFamily: 'Arial',
        fontSize: 12,
        lineHeight: 1.4,
        colors: {
          primary: '#1f2937',
          secondary: '#6b7280',
          text: '#374151',
          background: '#ffffff'
        }
      },
      schoolId: 0, // Will be set dynamically
      createdBy: 0, // Will be set dynamically
      isActive: true,
      isDefault: false,
      version: 1
    }
  });
  
  // Drag and drop sensors with enhanced configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  // Canvas dimensions and zoom
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 794, height: 1123 }); // A4 size in pixels at 72 DPI
  
  // ===== SANCTIONS DISCIPLINAIRES STATES =====
  const [selectedStudentForSanctions, setSelectedStudentForSanctions] = useState<number | null>(null);
  
  // React Hook Form for sanctions - replaces sanctionsForm useState
  const sanctionsForm = useForm<SanctionForm>({
    resolver: zodResolver(sanctionFormSchema),
    defaultValues: {
      sanctionType: 'conduct_warning',
      date: new Date().toISOString().split('T')[0],
      description: '',
      severity: 'medium',
      duration: 1,
      academicYear: academicYear || '2024-2025',
      term: selectedTerm || 'Premier Trimestre',
      studentId: selectedStudentForSanctions || 0,
      classId: selectedClass ? parseInt(selectedClass) : 0,
      schoolId: user?.schoolId || 0,
      issueBy: user?.id || 0
    }
  });
  
  // React Query hooks for sanctions
  const { data: studentSanctions, isLoading: isLoadingSanctions, refetch: refetchSanctions } = useStudentSanctions(
    selectedStudentForSanctions,
    {
      academicYear: academicYear,
      term: selectedTerm
    }
  );
  
  const createSanctionMutation = useCreateSanction();
  const deleteSanctionMutation = useDeleteSanction();
  const revokeSanctionMutation = useRevokeSanction();
  
  // API optimization: Control data loading manually
  const [dataLoadingEnabled, setDataLoadingEnabled] = useState(false);
  
  // Handler for tab changes with mount-on-enter pattern - OPTIMIZED WITH useCallback below
  
  // Derived boolean instead of state - fixes gating logic
  const hasValidSelection = !!selectedClass && !!selectedTerm && !!academicYear;
  
  // Composant CanvasArea local pour encapsuler entièrement DndContext
  const CanvasArea = () => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Element Palette */}
        <div className="lg:col-span-1 border rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Palette className="h-4 w-4" />
            {t.elementPalette}
          </h3>
          <div className="space-y-4 overflow-y-auto max-h-[500px]">
            {/* Student Information Category */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="h-3 w-3" />
                {t.studentInfoCategory}
              </h4>
              <div className="space-y-2">
                {renderPaletteElement(ELEMENT_TYPES.STUDENT_NAME, t.studentName, User)}
                {renderPaletteElement(ELEMENT_TYPES.STUDENT_MATRICULE, t.studentMatricule, FileSignature)}
                {renderPaletteElement(ELEMENT_TYPES.STUDENT_CLASS, t.studentClass, GraduationCap)}
                {renderPaletteElement(ELEMENT_TYPES.STUDENT_PHOTO, t.studentPhoto, Image)}
              </div>
            </div>
            {/* Grades Category */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <BookOpen className="h-3 w-3" />
                {t.gradesCategory}
              </h4>
              <div className="space-y-2">
                {renderPaletteElement(ELEMENT_TYPES.SUBJECT_GRADES, t.subjectGrades, BarChart3)}
                {renderPaletteElement(ELEMENT_TYPES.GENERAL_AVERAGE, t.generalAverage, TrendingUp)}
                {renderPaletteElement(ELEMENT_TYPES.CLASS_RANK, t.classRank, Star)}
                {renderPaletteElement(ELEMENT_TYPES.PERFORMANCE_LEVEL, 'Niveau de performance', Target)}
              </div>
            </div>
            {/* Attendance Category */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="h-3 w-3" />
                {t.attendanceCategory}
              </h4>
              <div className="space-y-2">
                {renderPaletteElement(ELEMENT_TYPES.UNJUSTIFIED_ABSENCES, t.unjustifiedAbsences, XCircle)}
                {renderPaletteElement(ELEMENT_TYPES.JUSTIFIED_ABSENCES, t.justifiedAbsences, CheckCircle)}
                {renderPaletteElement(ELEMENT_TYPES.LATENESS_COUNT, t.latenessCount, Timer)}
                {renderPaletteElement(ELEMENT_TYPES.DETENTION_HOURS, 'Consignes', AlertTriangle)}
              </div>
            </div>
            {/* Sanctions Category */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-3 w-3" />
                {t.sanctionsCategory}
              </h4>
              <div className="space-y-2">
                {renderPaletteElement(ELEMENT_TYPES.CONDUCT_WARNING, t.conductWarning, AlertCircle)}
                {renderPaletteElement(ELEMENT_TYPES.CONDUCT_BLAME, 'Blâme de conduite', XCircle)}
                {renderPaletteElement(ELEMENT_TYPES.EXCLUSION_DAYS, 'Exclusions', X)}
              </div>
            </div>
            {/* Signatures Category */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <PenTool className="h-3 w-3" />
                {t.signaturesCategory}
              </h4>
              <div className="space-y-2">
                {renderPaletteElement(ELEMENT_TYPES.PARENT_SIGNATURE, t.parentSignature, Users)}
                {renderPaletteElement(ELEMENT_TYPES.TEACHER_SIGNATURE, t.teacherSignature, UserCheck)}
                {renderPaletteElement(ELEMENT_TYPES.HEADMASTER_SIGNATURE, t.headmasterSignature, School)}
              </div>
            </div>
            {/* Text & Layout Category */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Type className="h-3 w-3" />
                {t.textCategory}
              </h4>
              <div className="space-y-2">
                {renderPaletteElement(ELEMENT_TYPES.FREE_TEXT, t.freeText, Type)}
                {renderPaletteElement(ELEMENT_TYPES.TEXT_LABEL, 'Étiquette', Type)}
                {renderPaletteElement(ELEMENT_TYPES.SCHOOL_LOGO, t.schoolLogo, Image)}
              </div>
            </div>
          </div>
        </div>
        {/* Design Canvas */}
        <div className="lg:col-span-1 border rounded-lg relative bg-white" id="design-canvas">
          <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-10">
            <h3 className="font-semibold flex items-center gap-2 bg-white px-2 py-1 rounded shadow-sm">
              <Layout className="h-4 w-4" />
              {t.designCanvas}
            </h3>
            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded shadow-sm">
              <Button variant="outline" size="sm" onClick={() => setCanvasZoom(canvasZoom - 0.1)}>
                <span className="text-xs">-</span>
              </Button>
              <span className="text-xs px-2">{Math.round(canvasZoom * 100)}%</span>
              <Button variant="outline" size="sm" onClick={() => setCanvasZoom(canvasZoom + 0.1)}>
                <span className="text-xs">+</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCanvasZoom(1)}>
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div 
            className="w-full h-full overflow-auto p-8 pt-16"
            style={{ 
              backgroundImage: 'radial-gradient(circle, #e5e5e5 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          >
            <div
              className="mx-auto bg-white shadow-lg border relative"
              style={{
                width: canvasSize.width * canvasZoom,
                height: canvasSize.height * canvasZoom,
                transform: `scale(${canvasZoom})`,
                transformOrigin: 'top left'
              }}
              data-testid="design-canvas-area"
            >
              <div 
                id="canvas-drop-zone"
                className="w-full h-full relative"
                onDrop={(e) => {
                  e.preventDefault();
                  const elementType = e.dataTransfer.getData('text/plain');
                  if (elementType) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / canvasZoom;
                    const y = (e.clientY - rect.top) / canvasZoom;
                    const newElement: TemplateElement = {
                      id: generateElementId(),
                      type: elementType,
                      category: getCategoryForType(elementType),
                      position: { x, y, width: 200, height: 40 },
                      properties: {
                        fontSize: 12,
                        fontFamily: 'Arial',
                        color: '#374151',
                        backgroundColor: 'transparent',
                        label: getElementDisplayName(elementType),
                        visible: true
                      },
                      zIndex: templateElements.length + 1
                    };
                    setTemplateElements(prev => [...prev, newElement]);
                    setSelectedElement(newElement.id);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <SortableContext items={templateElements.map(el => el.id)} strategy={verticalListSortingStrategy}>
                  {templateElements.map((element) => (
                    <SortableTemplateElement
                      key={element.id}
                      element={element}
                      isSelected={selectedElement === element.id}
                      onSelect={() => setSelectedElement(element.id)}
                      getElementDisplayName={getElementDisplayName}
                    />
                  ))}
                </SortableContext>
                {showGrid && (
                  <div className="absolute inset-0 pointer-events-none opacity-20">
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                          <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="#e5e5e5" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>
                )}
                {showGuides && alignmentGuides.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none">
                    <svg width="100%" height="100%">
                      {alignmentGuides.map((guide, index) => (
                        <g key={index}>
                          {guide.x !== undefined && (
                            <line
                              x1={guide.x}
                              y1="0"
                              x2={guide.x}
                              y2="100%"
                              stroke="#3b82f6"
                              strokeWidth="1"
                              strokeDasharray="4,4"
                            />
                          )}
                          {guide.y !== undefined && (
                            <line
                              x1="0"
                              y1={guide.y}
                              x2="100%"
                              y2={guide.y}
                              stroke="#3b82f6"
                              strokeWidth="1"
                              strokeDasharray="4,4"
                            />
                          )}
                        </g>
                      ))}
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Properties Panel */}
        <div className="lg:col-span-1 border rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t.elementProperties}
          </h3>
          
          {selectedElement ? (
            <div className="space-y-4">
              {(() => {
                const element = templateElements.find(el => el.id === selectedElement);
                if (!element) return null;
                
                return (
                  <>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700">{t.position}</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <Label className="text-xs">X</Label>
                          <Input
                            type="number"
                            value={Math.round(element.position.x)}
                            onChange={(e) => handleUpdateElement(element.id, {
                              position: { ...element.position, x: parseInt(e.target.value) || 0 }
                            })}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Y</Label>
                          <Input
                            type="number"
                            value={Math.round(element.position.y)}
                            onChange={(e) => handleUpdateElement(element.id, {
                              position: { ...element.position, y: parseInt(e.target.value) || 0 }
                            })}
                            className="h-7 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs font-semibold text-gray-700">{t.size}</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <Label className="text-xs">{t.width}</Label>
                          <Input
                            type="number"
                            value={element.position.width}
                            onChange={(e) => handleUpdateElement(element.id, {
                              position: { ...element.position, width: parseInt(e.target.value) || 100 }
                            })}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">{t.height}</Label>
                          <Input
                            type="number"
                            value={element.position.height}
                            onChange={(e) => handleUpdateElement(element.id, {
                              position: { ...element.position, height: parseInt(e.target.value) || 40 }
                            })}
                            className="h-7 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs font-semibold text-gray-700">{t.content}</Label>
                      <Input
                        value={element.properties.label || ''}
                        onChange={(e) => handleUpdateElement(element.id, {
                          properties: { ...element.properties, label: e.target.value }
                        })}
                        className="h-7 text-xs mt-1"
                        placeholder="Texte à afficher..."
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs font-semibold text-gray-700">{t.style}</Label>
                      <div className="space-y-2 mt-1">
                        <div>
                          <Label className="text-xs">{t.fontSize}</Label>
                          <Input
                            type="number"
                            value={element.properties.fontSize || 12}
                            onChange={(e) => handleUpdateElement(element.id, {
                              properties: { ...element.properties, fontSize: parseInt(e.target.value) || 12 }
                            })}
                            className="h-7 text-xs"
                            min="8"
                            max="72"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">{t.color}</Label>
                          <Input
                            type="color"
                            value={element.properties.color || '#374151'}
                            onChange={(e) => handleUpdateElement(element.id, {
                              properties: { ...element.properties, color: e.target.value }
                            })}
                            className="h-7 w-full"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setTemplateElements(prev => prev.filter(el => el.id !== element.id));
                          setSelectedElement(null);
                          
                          toast({
                            title: 'Élément supprimé',
                            description: 'L\'élément a été retiré du modèle'
                          });
                        }}
                        className="w-full"
                        data-testid="delete-element-btn"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Square className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Sélectionnez un élément pour modifier ses propriétés</p>
            </div>
          )}
        </div>
      </div>
      {/* Drag Overlay */}
      <DragOverlay>
        {draggedElement ? (
          <div className="bg-blue-100 border-2 border-blue-300 p-2 rounded shadow-lg">
            {getElementDisplayName(draggedElement)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
  
  // React Hook Form setup for manual data entry
  const manualDataForm = useForm<ManualDataForm>({
    resolver: zodResolver(manualDataValidationSchema),
    defaultValues: {
      unjustifiedAbsenceHours: '',
      justifiedAbsenceHours: '',
      latenessCount: 0,
      detentionHours: '',
      conductWarning: false,
      conductBlame: false,
      exclusionDays: 0,
      permanentExclusion: false,
      totalGeneral: '',
      numberOfAverages: 0,
      successRate: '',
      workAppreciation: '',
      generalComment: '',
      parentVisaName: '',
      parentVisaDate: new Date().toISOString().split('T')[0],
      teacherVisaName: '',
      teacherVisaDate: new Date().toISOString().split('T')[0],
      headmasterVisaName: '',
      headmasterVisaDate: new Date().toISOString().split('T')[0],
      classCouncilDecisions: '',
      classCouncilMentions: '',
      orientationRecommendations: '',
      councilDate: new Date().toISOString().split('T')[0],
      councilParticipants: ''
    }
  });

  const text = {
    fr: {
      title: 'Générateur de Bulletins Complet',
      subtitle: 'Système avancé de génération de bulletins avec notes approuvées',
      
      // Tabs
      classSelection: 'Sélection de Classe',
      studentManagement: 'Gestion des Élèves',
      generationOptions: 'Options de Génération',
      bulkOperations: 'Opérations Groupées',
      templateCreator: 'Créateur de Modèles',
      
      // Subject Coefficients Section
      subjectCoefficientsSection: 'Coefficients par Matière',
      subjectCoefficientsDescription: 'Configurez les coefficients et codes pour chaque matière de cet élève.',
      fillDefaultValues: 'Valeurs par défaut',
      clearAll: 'Effacer tout',
      selectStudentToConfigureCoefficients: 'Sélectionnez un élève pour configurer les coefficients par matière.',
      
      // Sanctions Disciplinaires Tab
      sanctionsDisciplinaires: 'Sanctions Disciplinaires',
      sanctionsManagement: 'Gestion des Sanctions Disciplinaires',
      sanctionsDescription: 'Gérez les sanctions disciplinaires pour chaque élève de la classe.',
      selectStudentForSanctions: 'Sélectionner un élève',
      selectStudentPlaceholder: 'Choisissez un élève...',
      sanctionHistory: 'Historique des sanctions',
      noSanctionsHistory: 'Aucune sanction enregistrée pour cet élève',
      addNewSanction: 'Ajouter une nouvelle sanction',
      sanctionType: 'Type de sanction',
      sanctionDate: 'Date de la sanction',
      sanctionReason: 'Motif de la sanction',
      exclusionDays: 'Nombre de jours d\'exclusion',
      conductWarning: 'Avertissement de conduite',
      conductBlame: 'Blâme de conduite', 
      exclusionTemporary: 'Exclusion temporaire',
      exclusionPermanent: 'Exclusion définitive',
      saveSanction: 'Enregistrer la sanction',
      deleteSanction: 'Supprimer',
      confirmDeleteSanction: 'Êtes-vous sûr de vouloir supprimer cette sanction ?',
      sanctionSaved: 'Sanction enregistrée avec succès',
      sanctionDeleted: 'Sanction supprimée avec succès',
      sanctionError: 'Erreur lors de l\'enregistrement de la sanction',
      pleaseSelectStudent: 'Veuillez sélectionner un élève',
      pleaseSelectSanctionType: 'Veuillez sélectionner un type de sanction',
      pleaseEnterReason: 'Veuillez saisir un motif',
      warningCount: 'avertissement(s)',
      blameCount: 'blâme(s)', 
      exclusionCount: 'exclusion(s)',
      permanent: 'Définitive',
      
      // New sanctions terms
      severity: 'Gravité',
      severityLow: 'Faible',
      severityMedium: 'Moyenne',
      severityHigh: 'Élevée',
      severityCritical: 'Critique',
      duration: 'Durée',
      days: 'jour(s)',
      revoke: 'Révoquer',
      delete: 'Supprimer',
      saving: 'Enregistrement...',
      loading: 'Chargement...',
      selectSanctionType: 'Sélectionnez un type de sanction',
      sanctionReasonPlaceholder: 'Décrivez le motif de la sanction...',
      sanctionReasonDescription: 'Description détaillée de la sanction (minimum 10 caractères)',
      exclusionDaysDescription: 'Nombre de jours d\'exclusion (1-365 jours)',
      
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
      
      // Section Conseil de Classe
      sectionClassCouncil: 'Conseil de Classe',
      includeClassCouncilDecisions: 'Décisions du conseil',
      includeClassCouncilMentions: 'Mentions du conseil',
      includeOrientationRecommendations: 'Recommandations d\'orientation',
      includeCouncilDate: 'Date du conseil',
      
      // Template Creator
      templateCreatorTitle: 'Créateur de Modèles de Bulletins',
      templateCreatorDescription: 'Concevez des modèles personnalisés de bulletins avec un éditeur drag-and-drop intuitif.',
      createNewTemplate: 'Créer un nouveau modèle',
      editTemplate: 'Modifier le modèle',
      saveTemplate: 'Enregistrer le modèle',
      templateName: 'Nom du modèle',
      templateDescription: 'Description du modèle',
      elementPalette: 'Palette d\'éléments',
      designCanvas: 'Zone de conception',
      elementProperties: 'Propriétés de l\'élément',
      
      // Element Categories
      studentInfoCategory: 'Informations Élève',
      gradesCategory: 'Notes et Moyennes',
      attendanceCategory: 'Absences et Retards',
      sanctionsCategory: 'Sanctions Disciplinaires',
      classCouncilCategory: 'Conseil de Classe',
      signaturesCategory: 'Signatures',
      textCategory: 'Zones de Texte',
      imagesCategory: 'Images et Logos',
      layoutCategory: 'Éléments de Mise en Page',
      
      // Element Types
      studentName: 'Nom de l\'élève',
      studentMatricule: 'Matricule',
      studentClass: 'Classe',
      studentPhoto: 'Photo de l\'élève',
      subjectGrades: 'Notes par matière',
      generalAverage: 'Moyenne générale',
      classRank: 'Rang de classe',
      unjustifiedAbsences: 'Absences non justifiées',
      justifiedAbsences: 'Absences justifiées',
      latenessCount: 'Nombre de retards',
      conductWarning: 'Avertissement de conduite',
      parentSignature: 'Signature parent',
      teacherSignature: 'Signature professeur',
      headmasterSignature: 'Signature directeur',
      freeText: 'Texte libre',
      schoolLogo: 'Logo de l\'école',
      
      // Properties Panel
      position: 'Position',
      size: 'Taille',
      style: 'Style',
      content: 'Contenu',
      font: 'Police',
      color: 'Couleur',
      backgroundColor: 'Couleur de fond',
      border: 'Bordure',
      alignment: 'Alignement',
      left: 'Gauche',
      center: 'Centre',
      right: 'Droite',
      width: 'Largeur',
      height: 'Hauteur',
      fontSize: 'Taille de police',
      fontFamily: 'Police',
      fontWeight: 'Poids de police',
      padding: 'Espacement interne',
      margin: 'Espacement externe',
      classCouncilDecisions: 'Décisions du conseil de classe',
      classCouncilMentions: 'Mentions du conseil de classe',
      orientationRecommendations: 'Recommandations d\'orientation',
      councilDate: 'Date du conseil de classe',
      councilParticipants: 'Participants du conseil',
      classCouncilMentions: 'Mentions',
      orientationRecommendations: 'Recommandations d\'orientation',
      councilDate: 'Date du conseil',
      councilParticipants: 'Participants au conseil',
      selectMention: 'Sélectionner une mention',
      mentionFelicitations: 'Félicitations',
      mentionEncouragements: 'Encouragements',
      mentionSatisfaisant: 'Satisfaisant',
      mentionMiseEnGarde: 'Mise en garde',
      mentionBlame: 'Blâme',
      classCouncilDecisionsPlaceholder: 'Saisissez les décisions prises par le conseil de classe...',
      orientationRecommendationsPlaceholder: 'Saisissez les recommandations d\'orientation...',
      councilParticipantsPlaceholder: 'Noms des participants au conseil (optionnel)...',
      classCouncilSection: 'Conseil de Classe',
      classCouncilDecisionsField: 'Décisions du conseil de classe',
      classCouncilMentionsField: 'Mentions',
      orientationRecommendationsField: 'Recommandations d\'orientation',
      councilDateField: 'Date du conseil',
      councilParticipantsField: 'Participants au conseil',
      
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
      success: 'Succès',
      
      // Bulk Operations specific
      generationSummary: 'Résumé de la génération',
      selectedClass: 'Classe sélectionnée',
      term: 'Trimestre',
      academicYearLabel: 'Année scolaire',
      selectedStudentsLabel: 'Élèves sélectionnés',
      format: 'Format',
      options: 'Options',
      comments: 'Commentaires',
      rankings: 'Classements',
      statistics: 'Statistiques',
      performanceLevels: 'Niveaux de rendement',
      
      // Preview Dialog
      previewTitle: 'Aperçu du bulletin',
      previewDescription: 'Aperçu du bulletin pour l\'élève sélectionné',
      loadingPreview: 'Chargement de l\'aperçu...',
      studentInfo: 'Informations élève',
      name: 'Nom',
      class: 'Classe',
      studentId: 'Matricule',
      average: 'Moyenne',
      noPreviewData: 'Aucune donnée d\'aperçu disponible',
      
      // Progress Dialog
      errors: 'Erreurs',
      downloadsReady: 'Téléchargements prêts',
      downloadBulletin: 'Télécharger bulletin',
      
      // Manual data entry
      manualDataEntry: 'Saisie Manuelle',
      selectStudentForEntry: 'Sélectionner un élève pour la saisie',
      saveDraft: 'Sauvegarder le brouillon',
      loadDraft: 'Charger le brouillon',
      resetForm: 'Réinitialiser le formulaire',
      draftSaved: 'Brouillon sauvegardé avec succès',
      draftLoaded: 'Brouillon chargé avec succès',
      formReset: 'Formulaire réinitialisé',
      noDraftsFound: 'Aucun brouillon trouvé pour cet élève',
      selectDraftToLoad: 'Sélectionnez un brouillon à charger',
      availableDrafts: 'Brouillons disponibles',
      resetConfirmTitle: 'Confirmer la réinitialisation',
      resetConfirmMessage: 'Êtes-vous sûr de vouloir réinitialiser le formulaire ? Toutes les données non sauvegardées seront perdues.',
      loadDraftDialogTitle: 'Charger un brouillon',
      loadDraftDialogDescription: 'Choisissez le brouillon que vous souhaitez charger pour cet élève.',
      
      // Form sections
      absencesLateness: 'Absences & Retards',
      disciplinarySanctions: 'Sanctions Disciplinaires',
      academicTotals: 'Moyennes & Totaux',
      appreciationsComments: 'Appréciations & Commentaires',
      signaturesSection: 'Signatures',
      
      // Form fields
      unjustifiedAbsHours: 'Abs. non J. (heures)',
      justifiedAbsHours: 'Abs. just. (heures)',
      latenessCountField: 'Retards (nombre)',
      detentionHoursField: 'Consignes (heures)',
      conductWarningField: 'Avertissement de conduite',
      conductBlameField: 'Blâme de conduite',
      exclusionDaysField: 'Exclusions (jours)',
      permanentExclusionField: 'Exclusion définitive',
      totalGeneralField: 'Total général',
      numberOfAveragesField: 'Nombre de moyennes',
      successRateField: 'Taux de réussite (%)',
      workAppreciationField: 'Appréciation du travail (500 car. max)',
      generalCommentField: 'Commentaire général (300 car. max)',
      parentVisaNameField: 'Nom parent/tuteur',
      parentVisaDateField: 'Date visa parent',
      teacherVisaNameField: 'Nom professeur principal',
      teacherVisaDateField: 'Date visa professeur',
      headmasterVisaNameField: 'Nom chef d\'établissement',
      headmasterVisaDateField: 'Date visa chef',
      
      // Workflow Tabs
      pendingBulletins: 'En Attente d\'Approbation',
      approvedBulletins: 'Bulletins Approuvés',
      sentBulletins: 'Bulletins Envoyés',
      
      // Workflow Actions
      waitingApproval: 'En attente d\'approbation',
      approved: 'Approuvé',
      sentToParents: 'Envoyé aux parents',
      approve: 'Approuver',
      send: 'Envoyer',
      viewDetails: 'Voir détails',
      
      // Counts
      pendingCount: 'bulletins en attente',
      approvedCount: 'bulletins approuvés',
      sentCount: 'bulletins envoyés'
    },
    en: {
      title: 'Comprehensive Bulletin Generator',
      subtitle: 'Advanced bulletin generation system with approved grades',
      
      // Tabs
      classSelection: 'Class Selection',
      studentManagement: 'Student Management',
      generationOptions: 'Generation Options',
      bulkOperations: 'Bulk Operations',
      templateCreator: 'Template Creator',
      
      // Subject Coefficients Section
      subjectCoefficientsSection: 'Subject Coefficients',
      subjectCoefficientsDescription: 'Configure coefficients and codes for each subject of this student.',
      fillDefaultValues: 'Default Values',
      clearAll: 'Clear All',
      selectStudentToConfigureCoefficients: 'Select a student to configure subject coefficients.',
      
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
      
      // Section Conseil de Classe
      sectionClassCouncil: 'Class Council',
      includeClassCouncilDecisions: 'Council decisions',
      includeClassCouncilMentions: 'Mentions',
      includeOrientationRecommendations: 'Orientation recommendations',
      includeCouncilDate: 'Council date',
      classCouncilDecisions: 'Class council decisions',
      classCouncilMentions: 'Mentions',
      orientationRecommendations: 'Orientation recommendations',
      councilDate: 'Council date',
      councilParticipants: 'Council participants',
      selectMention: 'Select a mention',
      mentionFelicitations: 'Congratulations',
      mentionEncouragements: 'Encouragements',
      mentionSatisfaisant: 'Satisfactory',
      mentionMiseEnGarde: 'Warning',
      mentionBlame: 'Blame',
      classCouncilDecisionsPlaceholder: 'Enter the decisions made by the class council...',
      orientationRecommendationsPlaceholder: 'Enter orientation recommendations...',
      councilParticipantsPlaceholder: 'Names of council participants (optional)...',
      classCouncilSection: 'Class Council',
      classCouncilDecisionsField: 'Class council decisions',
      classCouncilMentionsField: 'Mentions',
      orientationRecommendationsField: 'Orientation recommendations',
      councilDateField: 'Council date',
      councilParticipantsField: 'Council participants',
      
      // Section Conseil de Classe - English
      sectionClassCouncil: 'Class Council',
      includeClassCouncilDecisions: 'Council decisions',
      includeClassCouncilMentions: 'Council mentions',
      includeOrientationRecommendations: 'Orientation recommendations',
      includeCouncilDate: 'Council date',
      classCouncilDecisions: 'Class council decisions',
      classCouncilMentions: 'Class council mentions',
      orientationRecommendations: 'Orientation recommendations',
      councilDate: 'Class council date',
      councilParticipants: 'Council participants',
      classCouncilDecisionsPlaceholder: 'Enter the decisions made by the class council...',
      orientationRecommendationsPlaceholder: 'Enter orientation recommendations...',
      councilParticipantsPlaceholder: 'Names of council participants (optional)...',
      
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
      success: 'Success',
      
      // Bulk Operations specific
      generationSummary: 'Generation Summary',
      selectedClass: 'Selected class',
      term: 'Term',
      academicYearLabel: 'Academic year',
      selectedStudentsLabel: 'Selected students',
      format: 'Format',
      options: 'Options',
      comments: 'Comments',
      rankings: 'Rankings',
      statistics: 'Statistics',
      performanceLevels: 'Performance levels',
      
      // Preview Dialog
      previewTitle: 'Bulletin Preview',
      previewDescription: 'Preview of the bulletin for the selected student',
      loadingPreview: 'Loading preview...',
      studentInfo: 'Student Information',
      name: 'Name',
      class: 'Class',
      studentId: 'Student ID',
      average: 'Average',
      noPreviewData: 'No preview data available',
      
      // Progress Dialog
      errors: 'Errors',
      downloadsReady: 'Downloads ready',
      downloadBulletin: 'Download bulletin',
      
      // Manual data entry
      manualDataEntry: 'Manual Data Entry',
      selectStudentForEntry: 'Select a student for data entry',
      saveDraft: 'Save Draft',
      loadDraft: 'Load Draft',
      resetForm: 'Reset Form',
      draftSaved: 'Draft saved successfully',
      
      // Sanctions Disciplinaires Tab
      sanctionsDisciplinaires: 'Disciplinary Sanctions',
      sanctionsManagement: 'Disciplinary Sanctions Management',
      sanctionsDescription: 'Manage disciplinary sanctions for each student in the class.',
      selectStudentForSanctions: 'Select a student',
      selectStudentPlaceholder: 'Choose a student...',
      sanctionHistory: 'Sanctions history',
      noSanctionsHistory: 'No sanctions recorded for this student',
      addNewSanction: 'Add new sanction',
      sanctionType: 'Sanction type',
      sanctionDate: 'Sanction date',
      sanctionReason: 'Sanction reason',
      exclusionDays: 'Number of exclusion days',
      conductWarning: 'Conduct warning',
      conductBlame: 'Conduct blame', 
      exclusionTemporary: 'Temporary exclusion',
      exclusionPermanent: 'Permanent exclusion',
      saveSanction: 'Save sanction',
      deleteSanction: 'Delete',
      confirmDeleteSanction: 'Are you sure you want to delete this sanction?',
      sanctionSaved: 'Sanction saved successfully',
      sanctionDeleted: 'Sanction deleted successfully',
      sanctionError: 'Error saving sanction',
      pleaseSelectStudent: 'Please select a student',
      pleaseSelectSanctionType: 'Please select a sanction type',
      pleaseEnterReason: 'Please enter a reason',
      warningCount: 'warning(s)',
      blameCount: 'blame(s)', 
      exclusionCount: 'exclusion(s)',
      permanent: 'Permanent',
      
      // New sanctions terms
      severity: 'Severity',
      severityLow: 'Low',
      severityMedium: 'Medium',
      severityHigh: 'High',
      severityCritical: 'Critical',
      duration: 'Duration',
      days: 'day(s)',
      revoke: 'Revoke',
      delete: 'Delete',
      saving: 'Saving...',
      loading: 'Loading...',
      selectSanctionType: 'Select a sanction type',
      sanctionReasonPlaceholder: 'Describe the reason for the sanction...',
      sanctionReasonDescription: 'Detailed description of the sanction (minimum 10 characters)',
      exclusionDaysDescription: 'Number of exclusion days (1-365 days)',
      draftLoaded: 'Draft loaded successfully',
      formReset: 'Form reset',
      noDraftsFound: 'No drafts found for this student',
      selectDraftToLoad: 'Select a draft to load',
      availableDrafts: 'Available drafts',
      resetConfirmTitle: 'Confirm Reset',
      resetConfirmMessage: 'Are you sure you want to reset the form? All unsaved data will be lost.',
      loadDraftDialogTitle: 'Load Draft',
      loadDraftDialogDescription: 'Choose the draft you want to load for this student.',
      
      // Form sections
      absencesLateness: 'Absences & Lateness',
      disciplinarySanctions: 'Disciplinary Sanctions',
      academicTotals: 'Averages & Totals',
      appreciationsComments: 'Appreciations & Comments',
      signaturesSection: 'Signatures',
      
      // Form fields
      unjustifiedAbsHours: 'Unjust. Abs. (hours)',
      justifiedAbsHours: 'Just. Abs. (hours)',
      latenessCountField: 'Lateness (count)',
      detentionHoursField: 'Detentions (hours)',
      conductWarningField: 'Conduct warning',
      conductBlameField: 'Conduct blame',
      exclusionDaysField: 'Exclusions (days)',
      permanentExclusionField: 'Permanent exclusion',
      totalGeneralField: 'General total',
      numberOfAveragesField: 'Number of averages',
      successRateField: 'Success rate (%)',
      workAppreciationField: 'Work appreciation (500 char. max)',
      generalCommentField: 'General comment (300 char. max)',
      parentVisaNameField: 'Parent/Guardian name',
      parentVisaDateField: 'Parent visa date',
      teacherVisaNameField: 'Main teacher name',
      teacherVisaDateField: 'Teacher visa date',
      headmasterVisaNameField: 'School head name',
      headmasterVisaDateField: 'Headmaster visa date',
      
      // Workflow Tabs
      pendingBulletins: 'Pending Approval',
      approvedBulletins: 'Approved Bulletins',
      sentBulletins: 'Sent Bulletins',
      
      // Workflow Actions
      waitingApproval: 'Waiting for approval',
      approved: 'Approved',
      sentToParents: 'Sent to parents',
      approve: 'Approve',
      send: 'Send',
      viewDetails: 'View details',
      
      // Counts
      pendingCount: 'pending bulletins',
      approvedCount: 'approved bulletins',
      sentCount: 'sent bulletins',
      
      // Template Creator
      templateCreatorTitle: 'Bulletin Template Creator',
      templateCreatorDescription: 'Design custom bulletin templates with an intuitive drag-and-drop editor.',
      createNewTemplate: 'Create new template',
      editTemplate: 'Edit template',
      saveTemplate: 'Save template',
      templateName: 'Template name',
      templateDescription: 'Template description',
      elementPalette: 'Element Palette',
      designCanvas: 'Design Canvas',
      elementProperties: 'Element Properties',
      
      // Element Categories
      studentInfoCategory: 'Student Information',
      gradesCategory: 'Grades and Averages',
      attendanceCategory: 'Attendance and Tardiness',
      sanctionsCategory: 'Disciplinary Sanctions',
      classCouncilCategory: 'Class Council',
      signaturesCategory: 'Signatures',
      textCategory: 'Text Zones',
      imagesCategory: 'Images and Logos',
      layoutCategory: 'Layout Elements',
      
      // Element Types
      studentName: 'Student name',
      studentMatricule: 'Student ID',
      studentClass: 'Class',
      studentPhoto: 'Student photo',
      subjectGrades: 'Subject grades',
      generalAverage: 'General average',
      classRank: 'Class rank',
      unjustifiedAbsences: 'Unjustified absences',
      justifiedAbsences: 'Justified absences',
      latenessCount: 'Tardiness count',
      conductWarning: 'Conduct warning',
      parentSignature: 'Parent signature',
      teacherSignature: 'Teacher signature',
      headmasterSignature: 'Principal signature',
      freeText: 'Free text',
      schoolLogo: 'School logo',
      
      // Properties Panel
      position: 'Position',
      size: 'Size',
      style: 'Style',
      content: 'Content',
      font: 'Font',
      color: 'Color',
      backgroundColor: 'Background color',
      border: 'Border',
      alignment: 'Alignment',
      left: 'Left',
      center: 'Center',
      right: 'Right',
      width: 'Width',
      height: 'Height',
      fontSize: 'Font size',
      fontFamily: 'Font family',
      fontWeight: 'Font weight',
      padding: 'Padding',
      margin: 'Margin'
    }
  };

  const t = text[language as keyof typeof text];
  
  // ===== TEMPLATE CREATOR HELPER FUNCTIONS =====
  
  // Generate unique ID for new elements
  const generateElementId = () => `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Snap position to grid
  const snapToGridPosition = (x: number, y: number) => {
    if (!snapToGrid) return { x, y };
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  };
  
  // Calculate alignment guides
  const calculateAlignmentGuides = (element: TemplateElement, allElements: TemplateElement[]) => {
    if (!showGuides || allElements.length <= 1) return [];
    
    const guides: Array<{x?: number, y?: number}> = [];
    const threshold = 5; // Pixels tolerance for guide detection
    
    allElements.forEach(otherElement => {
      if (otherElement.id === element.id) return;
      
      // Vertical alignment guides
      if (Math.abs(element.position.x - otherElement.position.x) < threshold) {
        guides.push({ x: otherElement.position.x });
      }
      if (Math.abs((element.position.x + element.position.width/2) - (otherElement.position.x + otherElement.position.width/2)) < threshold) {
        guides.push({ x: otherElement.position.x + otherElement.position.width/2 });
      }
      if (Math.abs((element.position.x + element.position.width) - (otherElement.position.x + otherElement.position.width)) < threshold) {
        guides.push({ x: otherElement.position.x + otherElement.position.width });
      }
      
      // Horizontal alignment guides  
      if (Math.abs(element.position.y - otherElement.position.y) < threshold) {
        guides.push({ y: otherElement.position.y });
      }
      if (Math.abs((element.position.y + element.position.height/2) - (otherElement.position.y + otherElement.position.height/2)) < threshold) {
        guides.push({ y: otherElement.position.y + otherElement.position.height/2 });
      }
      if (Math.abs((element.position.y + element.position.height) - (otherElement.position.y + otherElement.position.height)) < threshold) {
        guides.push({ y: otherElement.position.y + otherElement.position.height });
      }
    });
    
    return guides;
  };
  
  // Add to history for undo/redo
  const addToHistory = (elements: TemplateElement[]) => {
    const newHistory = templateHistory.slice(0, historyIndex + 1);
    newHistory.push([...elements]);
    setTemplateHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // Limit history size
    if (newHistory.length > 50) {
      setTemplateHistory(newHistory.slice(-50));
      setHistoryIndex(49);
    }
  };
  
  // Undo/Redo functions
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setTemplateElements([...templateHistory[historyIndex - 1]]);
      
      toast({
        title: 'Action annulée',
        description: 'La dernière action a été annulée'
      });
    }
  };
  
  const handleRedo = () => {
    if (historyIndex < templateHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setTemplateElements([...templateHistory[historyIndex + 1]]);
      
      toast({
        title: 'Action rétablie',
        description: 'L\'action a été rétablie'
      });
    }
  };
  
  // Auto-save functionality
  const autoSaveTemplate = useCallback(() => {
    if (!autoSaveEnabled || templateElements.length === 0) return;
    
    const formData = templateForm.getValues();
    if (!formData.name.trim()) return;
    
    try {
      const templateData = {
        ...formData,
        elements: templateElements,
        lastModified: new Date().toISOString()
      };
      
      localStorage.setItem(
        `template_autosave_${formData.name}`, 
        JSON.stringify(templateData)
      );
      
      setLastSaveTime(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [autoSaveEnabled, templateElements, templateForm]);
  
  // Auto-save effect
  useEffect(() => {
    if (autoSaveEnabled && templateElements.length > 0) {
      const timer = setTimeout(autoSaveTemplate, 2000); // Auto-save after 2 seconds of inactivity
      return () => clearTimeout(timer);
    }
  }, [templateElements, autoSaveTemplate]);
  
  // Duplicate element
  const handleDuplicateElement = (elementId: string) => {
    const element = templateElements.find(el => el.id === elementId);
    if (!element) return;
    
    const newElement: TemplateElement = {
      ...element,
      id: generateElementId(),
      position: {
        ...element.position,
        x: element.position.x + 20,
        y: element.position.y + 20
      },
      zIndex: Math.max(...templateElements.map(el => el.zIndex)) + 1
    };
    
    const newElements = [...templateElements, newElement];
    setTemplateElements(newElements);
    addToHistory(newElements);
    setSelectedElement(newElement.id);
    
    toast({
      title: 'Élément dupliqué',
      description: 'L\'élément a été dupliqué avec succès'
    });
  };
  
  // Render palette element
  const renderPaletteElement = (type: string, label: string, IconComponent: any) => {
    return (
      <div
        key={type}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', type);
          setDraggedElement(type);
        }}
        onDragEnd={() => setDraggedElement(null)}
        className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded cursor-move hover:bg-gray-50 transition-colors"
        data-testid={`palette-element-${type}`}
      >
        <IconComponent className="h-4 w-4 text-gray-600" />
        <span className="text-sm truncate">{label}</span>
      </div>
    );
  };
  
  // Get element display name
  const getElementDisplayName = (type: string) => {
    const elementMap: Record<string, string> = {
      [ELEMENT_TYPES.STUDENT_NAME]: t.studentName,
      [ELEMENT_TYPES.STUDENT_MATRICULE]: t.studentMatricule,
      [ELEMENT_TYPES.STUDENT_CLASS]: t.studentClass,
      [ELEMENT_TYPES.STUDENT_PHOTO]: t.studentPhoto,
      [ELEMENT_TYPES.SUBJECT_GRADES]: t.subjectGrades,
      [ELEMENT_TYPES.GENERAL_AVERAGE]: t.generalAverage,
      [ELEMENT_TYPES.CLASS_RANK]: t.classRank,
      [ELEMENT_TYPES.UNJUSTIFIED_ABSENCES]: t.unjustifiedAbsences,
      [ELEMENT_TYPES.JUSTIFIED_ABSENCES]: t.justifiedAbsences,
      [ELEMENT_TYPES.LATENESS_COUNT]: t.latenessCount,
      [ELEMENT_TYPES.CONDUCT_WARNING]: t.conductWarning,
      [ELEMENT_TYPES.PARENT_SIGNATURE]: t.parentSignature,
      [ELEMENT_TYPES.TEACHER_SIGNATURE]: t.teacherSignature,
      [ELEMENT_TYPES.HEADMASTER_SIGNATURE]: t.headmasterSignature,
      [ELEMENT_TYPES.FREE_TEXT]: t.freeText,
      [ELEMENT_TYPES.SCHOOL_LOGO]: t.schoolLogo,
    };
    return elementMap[type] || type;
  };
  
  // SortableTemplateElement component
  const SortableTemplateElement = ({ element, isSelected, onSelect, getElementDisplayName }: {
    element: TemplateElement;
    isSelected: boolean;
    onSelect: () => void;
    getElementDisplayName: (type: string) => string;
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: element.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      left: element.position.x,
      top: element.position.y,
      width: element.position.width,
      height: element.position.height,
      fontSize: element.properties.fontSize,
      fontFamily: element.properties.fontFamily,
      color: element.properties.color,
      backgroundColor: element.properties.backgroundColor,
      zIndex: element.zIndex,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`absolute border-2 cursor-move transition-all ${
          isSelected 
            ? 'border-blue-500 shadow-lg' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={onSelect}
        data-testid={`canvas-element-${element.id}`}
      >
        <div className="p-2 h-full flex items-center">
          {element.properties.label || getElementDisplayName(element.type)}
        </div>
        {/* Selection handles */}
        {isSelected && (
          <>
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          </>
        )}
      </div>
    );
  };

  // Enhanced drag and drop event handlers
  const handleDragStart = (event: DragStartEvent) => {
    setDraggedElement(event.active.id as string);
    
    // Calculate alignment guides for the dragged element if it's already on canvas
    const draggedEl = templateElements.find(el => el.id === event.active.id);
    if (draggedEl) {
      const guides = calculateAlignmentGuides(draggedEl, templateElements);
      setAlignmentGuides(guides);
    }
  };
  
  const handleDragOver = (event: DragOverEvent) => {
    // Real-time guide calculation during drag
    if (event.over?.id === 'canvas-drop-zone') {
      const draggedEl = templateElements.find(el => el.id === event.active.id);
      if (draggedEl && event.delta) {
        const updatedElement = {
          ...draggedEl,
          position: {
            ...draggedEl.position,
            x: draggedEl.position.x + event.delta.x,
            y: draggedEl.position.y + event.delta.y
          }
        };
        const guides = calculateAlignmentGuides(updatedElement, templateElements);
        setAlignmentGuides(guides);
      }
    }
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setAlignmentGuides([]); // Clear guides
    setDraggedElement(null);
    
    if (!over) {
      return;
    }
    
    // Handle element reordering within the same container
    if (active.id !== over.id) {
      const activeIndex = templateElements.findIndex(el => el.id === active.id);
      const overIndex = templateElements.findIndex(el => el.id === over.id);
      
      if (activeIndex !== -1 && overIndex !== -1) {
        const newElements = arrayMove(templateElements, activeIndex, overIndex);
        setTemplateElements(newElements);
        addToHistory(newElements);
        return;
      }
    }
    
    // Check if dropped on canvas
    if (over.id === 'design-canvas' || over.id === 'canvas-drop-zone') {
      const elementType = active.id as string;
      
      // Check if it's a new element from palette or existing element on canvas
      const existingElement = templateElements.find(el => el.id === elementType);
      
      if (existingElement) {
        // Moving existing element
        const rect = document.getElementById('canvas-drop-zone')?.getBoundingClientRect();
        if (rect) {
          const rawX = (event.activatorEvent as any).clientX - rect.left;
          const rawY = (event.activatorEvent as any).clientY - rect.top;
          
          // Apply snap to grid
          const snappedPos = snapToGridPosition(rawX / canvasZoom, rawY / canvasZoom);
          
          const updatedElements = templateElements.map(el => 
            el.id === elementType 
              ? { ...el, position: { ...el.position, x: snappedPos.x, y: snappedPos.y } }
              : el
          );
          
          setTemplateElements(updatedElements);
          addToHistory(updatedElements);
        }
      } else {
        // Creating new element from palette
        const rect = document.getElementById('canvas-drop-zone')?.getBoundingClientRect();
        let dropX = 100, dropY = 100; // Default position
        
        if (rect && event.activatorEvent) {
          const rawX = (event.activatorEvent as any).clientX - rect.left;
          const rawY = (event.activatorEvent as any).clientY - rect.top;
          const snappedPos = snapToGridPosition(rawX / canvasZoom, rawY / canvasZoom);
          dropX = snappedPos.x;
          dropY = snappedPos.y;
        }
        
        const newElement: TemplateElement = {
          id: generateElementId(),
          type: elementType,
          category: getCategoryForType(elementType),
          position: {
            x: dropX,
            y: dropY,
            width: 200,
            height: 40
          },
          properties: {
            fontSize: 12,
            fontFamily: 'Arial',
            color: '#374151',
            backgroundColor: 'transparent',
            label: getElementDisplayName(elementType),
            visible: true
          },
          zIndex: templateElements.length + 1
        };
        
        const newElements = [...templateElements, newElement];
        setTemplateElements(newElements);
        addToHistory(newElements);
        setSelectedElement(newElement.id);
        
        toast({
          title: 'Élément ajouté',
          description: `${getElementDisplayName(elementType)} a été ajouté au modèle`
        });
      }
    }
    
    setDraggedElement(null);
  };
  
  // Get category for element type
  const getCategoryForType = (type: string): string => {
    if ([ELEMENT_TYPES.STUDENT_NAME, ELEMENT_TYPES.STUDENT_MATRICULE, ELEMENT_TYPES.STUDENT_CLASS, ELEMENT_TYPES.STUDENT_PHOTO].includes(type as any)) {
      return ELEMENT_CATEGORIES.STUDENT_INFO;
    }
    if ([ELEMENT_TYPES.SUBJECT_GRADES, ELEMENT_TYPES.GENERAL_AVERAGE, ELEMENT_TYPES.CLASS_RANK].includes(type as any)) {
      return ELEMENT_CATEGORIES.GRADES;
    }
    if ([ELEMENT_TYPES.UNJUSTIFIED_ABSENCES, ELEMENT_TYPES.JUSTIFIED_ABSENCES, ELEMENT_TYPES.LATENESS_COUNT].includes(type as any)) {
      return ELEMENT_CATEGORIES.ATTENDANCE;
    }
    if ([ELEMENT_TYPES.CONDUCT_WARNING, ELEMENT_TYPES.CONDUCT_BLAME].includes(type as any)) {
      return ELEMENT_CATEGORIES.SANCTIONS;
    }
    if ([ELEMENT_TYPES.PARENT_SIGNATURE, ELEMENT_TYPES.TEACHER_SIGNATURE, ELEMENT_TYPES.HEADMASTER_SIGNATURE].includes(type as any)) {
      return ELEMENT_CATEGORIES.SIGNATURES;
    }
    if ([ELEMENT_TYPES.FREE_TEXT, ELEMENT_TYPES.TEXT_LABEL].includes(type as any)) {
      return ELEMENT_CATEGORIES.TEXT;
    }
    if ([ELEMENT_TYPES.SCHOOL_LOGO].includes(type as any)) {
      return ELEMENT_CATEGORIES.IMAGES;
    }
    return ELEMENT_CATEGORIES.LAYOUT;
  };
  
  // Update element properties with history tracking
  const handleUpdateElement = (elementId: string, updates: Partial<TemplateElement>) => {
    const newElements = templateElements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    );
    setTemplateElements(newElements);
    
    // Add to history for significant changes
    if (updates.position || updates.properties) {
      addToHistory(newElements);
    }
  };
  
  // Resize handle functionality
  const handleResizeStart = (elementId: string, handle: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setSelectedElement(elementId);
  };
  
  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizeHandle(null);
  };
  
  // Element selection and manipulation
  const handleElementClick = (elementId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedElement(elementId);
    
    // Double-click to edit text content
    if (event.detail === 2) {
      const element = templateElements.find(el => el.id === elementId);
      if (element && [ELEMENT_TYPES.FREE_TEXT, ELEMENT_TYPES.TEXT_LABEL].includes(element.type as any)) {
        // Enable inline editing
        const newLabel = prompt('Nouveau texte:', element.properties.label || '');
        if (newLabel !== null) {
          handleUpdateElement(elementId, {
            properties: { ...element.properties, label: newLabel }
          });
        }
      }
    }
  };
  
  const handleCanvasClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setSelectedElement(null);
    }
  };
  
  // Layer management
  const moveElementToFront = (elementId: string) => {
    const maxZ = Math.max(...templateElements.map(el => el.zIndex));
    handleUpdateElement(elementId, { zIndex: maxZ + 1 });
  };
  
  const moveElementToBack = (elementId: string) => {
    const minZ = Math.min(...templateElements.map(el => el.zIndex));
    handleUpdateElement(elementId, { zIndex: minZ - 1 });
  };
  
  const moveElementUp = (elementId: string) => {
    const element = templateElements.find(el => el.id === elementId);
    if (!element) return;
    
    const higherElements = templateElements.filter(el => el.zIndex > element.zIndex);
    if (higherElements.length > 0) {
      const nextZ = Math.min(...higherElements.map(el => el.zIndex));
      const swapElement = templateElements.find(el => el.zIndex === nextZ);
      
      if (swapElement) {
        const newElements = templateElements.map(el => {
          if (el.id === elementId) return { ...el, zIndex: nextZ };
          if (el.id === swapElement.id) return { ...el, zIndex: element.zIndex };
          return el;
        });
        setTemplateElements(newElements);
        addToHistory(newElements);
      }
    }
  };
  
  const moveElementDown = (elementId: string) => {
    const element = templateElements.find(el => el.id === elementId);
    if (!element) return;
    
    const lowerElements = templateElements.filter(el => el.zIndex < element.zIndex);
    if (lowerElements.length > 0) {
      const prevZ = Math.max(...lowerElements.map(el => el.zIndex));
      const swapElement = templateElements.find(el => el.zIndex === prevZ);
      
      if (swapElement) {
        const newElements = templateElements.map(el => {
          if (el.id === elementId) return { ...el, zIndex: prevZ };
          if (el.id === swapElement.id) return { ...el, zIndex: element.zIndex };
          return el;
        });
        setTemplateElements(newElements);
        addToHistory(newElements);
      }
    }
  };
  
  // Template management functions
  const handleNewTemplate = () => {
    setCurrentTemplate(null);
    setTemplateElements([]);
    setSelectedElement(null);
    templateForm.reset();
    
    toast({
      title: 'Nouveau modèle',
      description: 'Un nouveau modèle vide a été créé'
    });
  };
  
  const handleLoadTemplate = () => {
    // This would open a dialog to load existing templates
    toast({
      title: 'Charger modèle',
      description: 'Fonctionnalité de chargement à implémenter'
    });
  };
  
  const handlePreviewTemplate = () => {
    if (templateElements.length === 0) {
      toast({
        title: 'Aperçu impossible',
        description: 'Ajoutez des éléments au modèle pour voir l\'aperçu',
        variant: 'destructive'
      });
      return;
    }
    
    toast({
      title: 'Aperçu du modèle',
      description: 'Fonctionnalité d\'aperçu à implémenter'
    });
  };
  
  const handleSaveTemplate = () => {
    const formData = templateForm.getValues();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Nom requis',
        description: 'Veuillez donner un nom au modèle',
        variant: 'destructive'
      });
      return;
    }
    
    if (templateElements.length === 0) {
      toast({
        title: 'Modèle vide',
        description: 'Ajoutez des éléments au modèle avant de sauvegarder',
        variant: 'destructive'
      });
      return;
    }
    
    // Here you would save to database via API
    console.log('Saving template:', {
      ...formData,
      elements: templateElements
    });
    
    toast({
      title: 'Modèle sauvegardé',
      description: `Le modèle "${formData.name}" a été sauvegardé avec succès`
    });
  };
  
  // Manual data entry utility functions - OPTIMIZED WITH useCallback below
  
  const fillDefaultCoefficients = () => {
    console.log('[COEFFICIENTS] 🔧 Fill default coefficients called');
    console.log('[COEFFICIENTS] 📋 Selected student ID:', selectedStudentForEntry);
    console.log('[COEFFICIENTS] 👥 Filtered students:', filteredStudents);
    
    if (!selectedStudentForEntry) {
      console.log('[COEFFICIENTS] ❌ No student selected');
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un élève d'abord",
        variant: 'destructive'
      });
      return;
    }
    
    const student = filteredStudents.find(s => s.id === selectedStudentForEntry);
    console.log('[COEFFICIENTS] 🎯 Found student:', student);
    console.log('[COEFFICIENTS] 📊 Student approved grades:', student?.approvedGrades);
    
    if (!student?.approvedGrades) {
      console.log('[COEFFICIENTS] ❌ No approved grades found');
      toast({
        title: "Erreur",
        description: "Aucune note approuvée trouvée pour cet élève",
        variant: 'destructive'
      });
      return;
    }
    
    const defaultCoefficients: Record<number, any> = {};
    student.approvedGrades.forEach(grade => {
      const baseAverage = grade.termAverage || 12;
      defaultCoefficients[grade.subjectId] = {
        CTBA: (baseAverage + (Math.random() - 0.5) * 2).toFixed(1),
        CBA: (baseAverage + (Math.random() - 0.5) * 1.5).toFixed(1),
        CA: (baseAverage + (Math.random() - 0.5) * 2.5).toFixed(1),
        CMA: (baseAverage + (Math.random() - 0.5) * 1.8).toFixed(1),
        COTE: baseAverage >= 16 ? 'A' : baseAverage >= 14 ? 'B' : baseAverage >= 12 ? 'C' : baseAverage >= 10 ? 'D' : 'E',
        CNA: baseAverage < 10 ? 'Non acquis' : '',
        minGrade: Math.max(0, baseAverage - 3).toFixed(1),
        maxGrade: Math.min(20, baseAverage + 2).toFixed(1)
      };
    });
    
    setSubjectCoefficients(defaultCoefficients);
    
    toast({
      title: "Coefficients remplis",
      description: "Les valeurs par défaut ont été appliquées à toutes les matières."
    });
  };
  
  const clearAllCoefficients = () => {
    setSubjectCoefficients({});
    
    toast({
      title: "Coefficients effacés",
      description: "Tous les coefficients ont été supprimés."
    });
  };
  
  const saveDraftData = () => {
    if (!selectedStudentForEntry || !selectedClass) {
      toast({
        title: t.error,
        description: 'Veuillez sélectionner un élève et une classe',
        variant: 'destructive'
      });
      return;
    }
    
    const currentData = manualDataForm.getValues();
    const draftKey = `bulletin_draft_${selectedStudentForEntry}_${selectedClass}_${selectedTerm}_${academicYear}`;
    
    try {
      // Get existing drafts from localStorage
      const existingDrafts = JSON.parse(localStorage.getItem('educafric-bulletin-drafts') || '{}');
      
      // Add current draft with timestamp
      const draftWithTimestamp = {
        ...currentData,
        savedAt: new Date().toISOString(),
        studentId: selectedStudentForEntry,
        classId: selectedClass,
        term: selectedTerm,
        academicYear: academicYear
      };
      
      const updatedDrafts = {
        ...existingDrafts,
        [draftKey]: draftWithTimestamp
      };
      
      // Save to localStorage
      localStorage.setItem('educafric-bulletin-drafts', JSON.stringify(updatedDrafts));
      
      // Update state
      setSavedDrafts(updatedDrafts);
      
      toast({
        title: t.success,
        description: t.draftSaved
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: t.error,
        description: 'Erreur lors de la sauvegarde du brouillon',
        variant: 'destructive'
      });
    }
  };
  
  const loadDraftData = () => {
    if (!selectedStudentForEntry) return;
    
    try {
      // Get all drafts from localStorage
      const storedDrafts = JSON.parse(localStorage.getItem('educafric-bulletin-drafts') || '{}');
      
      // Filter drafts for current context (student/class/term/year)
      const contextualDrafts = Object.entries(storedDrafts).filter(([key, draft]: [string, any]) => {
        const keyParts = key.split('_');
        if (keyParts.length !== 6) return false; // bulletin_draft_studentId_classId_term_year
        
        const [prefix1, prefix2, studentId, classId, term, year] = keyParts;
        return prefix1 === 'bulletin' && prefix2 === 'draft' && 
               parseInt(studentId) === selectedStudentForEntry &&
               classId === selectedClass &&
               term === selectedTerm &&
               year === academicYear;
      }).map(([key, draft]: [string, any]) => {
        const student = filteredStudents.find(s => s.id === selectedStudentForEntry);
        return {
          key,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Élève inconnu',
          date: draft.savedAt ? new Date(draft.savedAt).toLocaleString('fr-FR') : 'Date inconnue',
          classId: selectedClass || '',
          term: selectedTerm
        };
      });
      
      if (contextualDrafts.length === 0) {
        toast({
          title: t.error,
          description: t.noDraftsFound,
          variant: 'destructive'
        });
        return;
      }
      
      // If only one draft, load it directly
      if (contextualDrafts.length === 1) {
        const draftData = storedDrafts[contextualDrafts[0].key];
        manualDataForm.reset(draftData);
        toast({
          title: t.success,
          description: t.draftLoaded
        });
        return;
      }
      
      // Multiple drafts - show selection modal
      setAvailableDrafts(contextualDrafts);
      setShowLoadDraftDialog(true);
      
    } catch (error) {
      console.error('Error loading drafts:', error);
      toast({
        title: t.error,
        description: 'Erreur lors du chargement des brouillons',
        variant: 'destructive'
      });
    }
  };
  
  const resetFormData = () => {
    setShowResetConfirmDialog(true);
  };
  
  const confirmResetFormData = () => {
    try {
      manualDataForm.reset();
      setShowResetConfirmDialog(false);
      toast({
        title: t.success,
        description: t.formReset
      });
    } catch (error) {
      console.error('Error resetting form:', error);
      toast({
        title: t.error,
        description: 'Erreur lors de la réinitialisation du formulaire',
        variant: 'destructive'
      });
    }
  };
  
  const handleLoadSelectedDraft = (draftKey: string) => {
    try {
      const storedDrafts = JSON.parse(localStorage.getItem('educafric-bulletin-drafts') || '{}');
      const draftData = storedDrafts[draftKey];
      
      if (draftData) {
        manualDataForm.reset(draftData);
        setShowLoadDraftDialog(false);
        toast({
          title: t.success,
          description: t.draftLoaded
        });
      } else {
        toast({
          title: t.error,
          description: 'Brouillon introuvable',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error loading selected draft:', error);
      toast({
        title: t.error,
        description: 'Erreur lors du chargement du brouillon',
        variant: 'destructive'
      });
    }
  };
  
  // Save manual data mutation
  const saveManualDataMutation = useMutation({
    mutationFn: async (data: ManualDataForm) => {
      if (!selectedStudentForEntry || !selectedClass) {
        throw new Error('Student and class selection required');
      }
      
      // Prepare comprehensive data with proper mapping
      const comprehensiveData = {
        studentId: selectedStudentForEntry,
        classId: selectedClass && selectedClass.trim() !== '' ? parseInt(selectedClass) : 0,
        term: selectedTerm,
        academicYear,
        
        // Map form data to schema
        unjustifiedAbsenceHours: data.unjustifiedAbsenceHours || '',
        justifiedAbsenceHours: data.justifiedAbsenceHours || '',
        latenessCount: data.latenessCount || 0,
        detentionHours: data.detentionHours || '',
        
        conductWarning: data.conductWarning || false,
        conductBlame: data.conductBlame || false,
        exclusionDays: data.exclusionDays || 0,
        permanentExclusion: data.permanentExclusion || false,
        
        totalGeneral: data.totalGeneral || '',
        numberOfAverages: data.numberOfAverages || 0,
        successRate: data.successRate || '',
        
        workAppreciation: data.workAppreciation || '',
        generalComment: data.generalComment || '',
        
        // Map signature fields to JSON format
        parentVisaName: data.parentVisaName || '',
        parentVisaDate: data.parentVisaDate || '',
        teacherVisaName: data.teacherVisaName || '',
        teacherVisaDate: data.teacherVisaDate || '',
        headmasterVisaName: data.headmasterVisaName || '',
        headmasterVisaDate: data.headmasterVisaDate || '',
        
        // Include subject coefficients
        subjectCoefficients
      };
      
      console.log('[MANUAL_SAVE] 💾 Saving comprehensive data:', comprehensiveData);
      
      // CRITICAL FIX: Explicit parameter isolation to prevent mixing
      const httpMethod = 'POST';
      const apiEndpoint = '/api/comprehensive-bulletins/save';
      const requestPayload = comprehensiveData;
      
      // Strict validation before API call
      if (typeof httpMethod !== 'string') {
        throw new Error('HTTP method must be a string');
      }
      if (typeof apiEndpoint !== 'string') {
        throw new Error('API endpoint must be a string');
      }
      if (!requestPayload || typeof requestPayload !== 'object') {
        throw new Error('Request payload must be an object');
      }
      
      console.log('[MANUAL_SAVE] 🔧 Validated parameters:', {
        method: httpMethod,
        url: apiEndpoint,
        payloadType: typeof requestPayload,
        hasPayload: !!requestPayload
      });
      
      // Call apiRequest with explicit, validated parameters
      const response = await apiRequest(httpMethod, apiEndpoint, requestPayload);
      console.log('[MANUAL_SAVE] ✅ API request successful');
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: 'Données du bulletin sauvegardées avec succès'
      });
      
      // Refresh the saved drafts
      const draftKey = `${selectedStudentForEntry}_${selectedClass}_${selectedTerm}_${academicYear}`;
      setSavedDrafts(prev => ({ ...prev, [draftKey]: manualDataForm.getValues() }));
    },
    onError: (error: any) => {
      console.error('[MANUAL_SAVE] ❌ Save error:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Échec de la sauvegarde des données'
      });
    }
  });
  
  const onManualDataSubmit = (data: ManualDataForm) => {
    saveManualDataMutation.mutate(data);
  };

  // Load classes on component mount automatically (not restricted by dataLoadingEnabled)
  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: ['director-classes'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/director/classes');
      const data = await response.json();
      return data.success ? data.classes : [];
    },
    enabled: true
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
    enabled: dataLoadingEnabled && hasValidSelection
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
    enabled: dataLoadingEnabled && hasValidSelection
  });

  // Preview bulletin data
  const { data: previewData, isLoading: loadingPreview } = useQuery({
    queryKey: ['bulletin-preview', previewStudentId, selectedClass, selectedTerm, academicYear],
    queryFn: async () => {
      if (!previewStudentId) return null;
      
      const response = await apiRequest('GET', 
        `/api/comprehensive-bulletins/preview?studentId=${previewStudentId}&classId=${selectedClass}&term=${selectedTerm}&academicYear=${academicYear}`
      );
      const data = await response.json();
      return data.success ? data.data : null;
    },
    enabled: !!previewStudentId && showPreviewDialog && hasValidSelection
  });

  // Workflow bulletins queries
  const { data: pendingBulletins, isLoading: loadingPending, refetch: refetchPending } = useQuery({
    queryKey: ['comprehensive-bulletins', 'pending'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/comprehensive-bulletins/pending');
      const data = await response.json();
      return data.success ? data.data : [];
    },
    enabled: dataLoadingEnabled && hasValidSelection
  });

  const { data: approvedBulletins, isLoading: loadingApproved, refetch: refetchApproved } = useQuery({
    queryKey: ['comprehensive-bulletins', 'approved'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/comprehensive-bulletins/approved');
      const data = await response.json();
      return data.success ? data.data : [];
    },
    enabled: dataLoadingEnabled && hasValidSelection
  });

  const { data: sentBulletins, isLoading: loadingSent, refetch: refetchSent } = useQuery({
    queryKey: ['comprehensive-bulletins', 'sent'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/comprehensive-bulletins/sent');
      const data = await response.json();
      return data.success ? data.data : [];
    },
    enabled: dataLoadingEnabled && hasValidSelection
  });

  // ===== REPORTING QUERIES =====
  
  // Check if reportFilters are complete for reporting queries
  const reportFiltersComplete = !!(reportFilters.reportType && reportFilters.term && reportFilters.academicYear);
  
  // Overview report data
  const { data: overviewReport, isLoading: loadingOverview, refetch: refetchOverview } = useQuery({
    queryKey: ['comprehensive-reports', 'overview', reportFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (reportFilters.term) params.set('term', reportFilters.term);
      if (reportFilters.academicYear) params.set('academicYear', reportFilters.academicYear);
      if (reportFilters.classId) params.set('classId', reportFilters.classId);
      if (reportFilters.startDate) params.set('startDate', reportFilters.startDate);
      if (reportFilters.endDate) params.set('endDate', reportFilters.endDate);
      
      const response = await apiRequest('GET', `/api/comprehensive-bulletins/reports/overview?${params.toString()}`);
      const data = await response.json();
      return data.success ? data.data : null;
    },
    enabled: dataLoadingEnabled && reportFiltersComplete
  });
  
  // Distribution statistics data
  const { data: distributionStats, isLoading: loadingDistribution, refetch: refetchDistribution } = useQuery({
    queryKey: ['comprehensive-reports', 'distribution', reportFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (reportFilters.term) params.set('term', reportFilters.term);
      if (reportFilters.academicYear) params.set('academicYear', reportFilters.academicYear);
      if (reportFilters.classId) params.set('classId', reportFilters.classId);
      if (reportFilters.channel) params.set('channel', reportFilters.channel);
      
      const response = await apiRequest('GET', `/api/comprehensive-bulletins/reports/distribution-stats?${params.toString()}`);
      const data = await response.json();
      return data.success ? data.data : null;
    },
    enabled: dataLoadingEnabled && reportFiltersComplete
  });
  
  // Timeline data  
  const { data: timelineReport, isLoading: loadingTimelineReport, refetch: refetchTimeline } = useQuery({
    queryKey: ['comprehensive-reports', 'timeline', reportFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (reportFilters.term) params.set('term', reportFilters.term);
      if (reportFilters.academicYear) params.set('academicYear', reportFilters.academicYear);
      if (reportFilters.classId) params.set('classId', reportFilters.classId);
      if (reportFilters.startDate) params.set('startDate', reportFilters.startDate);
      if (reportFilters.endDate) params.set('endDate', reportFilters.endDate);
      params.set('limit', '50');
      params.set('offset', '0');
      
      const response = await apiRequest('GET', `/api/comprehensive-bulletins/reports/timeline?${params.toString()}`);
      const data = await response.json();
      return data.success ? data.data : null;
    },
    enabled: dataLoadingEnabled && reportFiltersComplete
  });

  // Reset selection when pendingBulletins change
  useEffect(() => {
    setSelectedBulletins([]);
    setSelectAll(false);
  }, [pendingBulletins]);
  
  // Reset data loading state when selection changes
  useEffect(() => {
    if (!hasValidSelection) {
      setDataLoadingEnabled(false);
    }
  }, [hasValidSelection]);
  
  // Manual data loading functions
  const handleLoadData = () => {
    if (!hasValidSelection) {
      toast({
        title: 'Sélection incomplète',
        description: 'Veuillez sélectionner une classe, un trimestre et une année scolaire avant de charger les données.',
        variant: 'destructive'
      });
      return;
    }
    
    setDataLoadingEnabled(true);
    toast({
      title: 'Chargement des données',
      description: 'Les données sont en cours de chargement...',
    });
  };
  
  const handleResetData = () => {
    setDataLoadingEnabled(false);
    setSelectedStudents([]);
    setSelectedBulletins([]);
    setSelectAll(false);
    queryClient.invalidateQueries({ queryKey: ['director-classes'] });
    queryClient.invalidateQueries({ queryKey: ['approved-grades-students'] });
    queryClient.invalidateQueries({ queryKey: ['class-stats'] });
    queryClient.invalidateQueries({ queryKey: ['comprehensive-bulletins'] });
    queryClient.invalidateQueries({ queryKey: ['comprehensive-reports'] });
    
    toast({
      title: 'Données réinitialisées',
      description: 'Toutes les données ont été effacées du cache.',
    });
  };

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

  // Bulk approve mutation
  const bulkApproveMutation = useMutation({
    mutationFn: (bulletinIds: number[]) => 
      apiRequest('POST', '/api/comprehensive-bulletins/bulk-approve', {
        bulletinIds
      }),
    onSuccess: (data, variables) => {
      // Calculer le count AVANT de vider la sélection
      const count = variables.length;
      queryClient.invalidateQueries({ queryKey: ['comprehensive-bulletins'] });
      setSelectedBulletins([]);
      setSelectAll(false);
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' 
          ? `${count} bulletin${count > 1 ? 's' : ''} approuvé${count > 1 ? 's' : ''} avec succès`
          : `${count} bulletin${count > 1 ? 's' : ''} approved successfully`,
        variant: 'default'
      });
    },
    onError: (error: any) => {
      console.error('Bulk approve error:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message || (language === 'fr' ? 'Erreur lors de l\'approbation en lot' : 'Bulk approval error'),
        variant: 'destructive'
      });
    }
  });

  // Helper functions

  const handleBulkApprove = () => {
    if (selectedBulletins.length === 0) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez sélectionner au moins un bulletin' : 'Please select at least one bulletin',
        variant: 'destructive'
      });
      return;
    }

    // Confirmation dialog
    const count = selectedBulletins.length;
    const confirmMessage = language === 'fr' 
      ? `Approuver ${count} bulletin${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''} ?`
      : `Approve ${count} selected bulletin${count > 1 ? 's' : ''}?`;

    if (window.confirm(confirmMessage)) {
      bulkApproveMutation.mutate(selectedBulletins);
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
      classId: selectedClass && selectedClass.trim() !== '' ? parseInt(selectedClass) : 0,
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

  // ===== MEMOIZED COMPUTED VALUES =====
  
  // Memoize filtered students to avoid re-filtering on every render
  const filteredStudents = useMemo(() => {
    if (!studentsData?.students) return [];
    
    if (!deferredSearchQuery.trim()) {
      return studentsData.students;
    }
    
    const query = deferredSearchQuery.toLowerCase();
    return studentsData.students.filter((student: StudentData) =>
      student.firstName.toLowerCase().includes(query) ||
      student.lastName.toLowerCase().includes(query) ||
      student.matricule.toLowerCase().includes(query)
    );
  }, [studentsData?.students, deferredSearchQuery]);
  
  // Memoize subject mappings based on filtered students
  const subjectMappings = useMemo(() => {
    if (!filteredStudents.length) return {};
    
    const mappings: Record<number, { id: number; name: string; coefficient: number }[]> = {};
    filteredStudents.forEach(student => {
      mappings[student.id] = student.approvedGrades.map(grade => ({
        id: grade.subjectId,
        name: grade.subjectName,
        coefficient: grade.coefficient
      }));
    });
    
    return mappings;
  }, [filteredStudents]);
  
  // Memoize class statistics with derived calculations
  const memoizedClassStats = useMemo(() => {
    if (!classStats || !filteredStudents.length) return null;
    
    const studentsWithGrades = filteredStudents.filter(s => s.approvedGrades.length > 0);
    const totalAverage = studentsWithGrades.reduce((sum, s) => sum + (s.overallAverage || 0), 0) / (studentsWithGrades.length || 1);
    const completionPercentage = (studentsWithGrades.length / filteredStudents.length) * 100;
    
    return {
      ...classStats,
      filtered: {
        totalStudents: filteredStudents.length,
        studentsWithGrades: studentsWithGrades.length,
        averageGrade: totalAverage,
        completionRate: completionPercentage
      }
    };
  }, [classStats, filteredStudents]);
  
  // Memoize generation options object to prevent unnecessary recreation
  const generationOptions = useMemo(() => ({
    includeComments,
    includeRankings,
    includeStatistics,
    includePerformanceLevels,
    generationFormat,
    includeFirstTrimester,
    includeDiscipline,
    includeStudentWork,
    includeClassProfile,
    includeUnjustifiedAbsences,
    includeJustifiedAbsences,
    includeLateness,
    includeDetentions,
    includeConductWarning,
    includeConductBlame,
    includeExclusions,
    includePermanentExclusion,
    includeTotalGeneral,
    includeAppreciations,
    includeGeneralAverage,
    includeTrimesterAverage,
    includeNumberOfAverages,
    includeSuccessRate,
    includeCoef,
    includeCTBA,
    includeMinMax,
    includeCBA,
    includeCA,
    includeCMA,
    includeCOTE,
    includeCNA,
    includeWorkAppreciation,
    includeParentVisa,
    includeTeacherVisa,
    includeHeadmasterVisa
  }), [
    includeComments, includeRankings, includeStatistics, includePerformanceLevels,
    generationFormat, includeFirstTrimester, includeDiscipline, includeStudentWork,
    includeClassProfile, includeUnjustifiedAbsences, includeJustifiedAbsences,
    includeLateness, includeDetentions, includeConductWarning, includeConductBlame,
    includeExclusions, includePermanentExclusion, includeTotalGeneral,
    includeAppreciations, includeGeneralAverage, includeTrimesterAverage,
    includeNumberOfAverages, includeSuccessRate, includeCoef, includeCTBA,
    includeMinMax, includeCBA, includeCA, includeCMA, includeCOTE, includeCNA,
    includeWorkAppreciation, includeParentVisa, includeTeacherVisa, includeHeadmasterVisa
  ]);

  // ===== ADDITIONAL MEMOIZED TRANSFORMATIONS =====
  
  // Memoize form data for manual entry to avoid unnecessary recalculations
  const memoizedFormData = useMemo(() => {
    if (!selectedStudentForEntry || !filteredStudents.length) return null;
    
    const student = filteredStudents.find(s => s.id === selectedStudentForEntry);
    if (!student) return null;
    
    return {
      student,
      subjects: student.approvedGrades.map(grade => ({
        id: grade.subjectId,
        name: grade.subjectName,
        coefficient: grade.coefficient,
        termAverage: grade.termAverage,
        hasCoefficients: !!subjectCoefficients[grade.subjectId]
      })),
      hasSubjects: student.approvedGrades.length > 0
    };
  }, [selectedStudentForEntry, filteredStudents, subjectCoefficients]);
  
  // Memoize eligible students for bulk operations
  const eligibleStudentsForGeneration = useMemo(() => {
    return filteredStudents.filter(student => student.approvedGrades.length > 0);
  }, [filteredStudents]);
  
  // Memoize selection state calculations
  const selectionState = useMemo(() => {
    const totalEligible = eligibleStudentsForGeneration.length;
    const selectedCount = selectedStudents.length;
    const allSelected = selectedCount === totalEligible && totalEligible > 0;
    const someSelected = selectedCount > 0;
    
    return {
      totalEligible,
      selectedCount,
      allSelected,
      someSelected,
      canGenerate: selectedCount > 0,
      selectionPercentage: totalEligible > 0 ? Math.round((selectedCount / totalEligible) * 100) : 0
    };
  }, [eligibleStudentsForGeneration.length, selectedStudents.length]);
  
  // Memoize bulletin generation request object
  const generationRequest = useMemo(() => {
    // Guard against empty string, NaN, or missing classId
    const classId = selectedClass && selectedClass.trim() !== '' ? parseInt(selectedClass) : null;
    if (!classId || isNaN(classId) || !selectedTerm || !academicYear || selectedStudents.length === 0) {
      return null;
    }
    
    return {
      studentIds: selectedStudents,
      classId: classId,
      term: selectedTerm,
      academicYear,
      format: generationFormat,
      ...generationOptions
    };
  }, [selectedClass, selectedTerm, academicYear, selectedStudents, generationFormat, generationOptions]);

  // ===== SANCTIONS DISCIPLINAIRES FUNCTIONS =====
  
  const handleSanctionStudentChange = useCallback((studentId: number) => {
    setSelectedStudentForSanctions(studentId);
    // In a real implementation, this would load sanctions data from API
    // For now, we initialize with empty data
    setSanctionsData({
      conductWarnings: [],
      conductBlames: [],
      exclusions: [],
      permanentExclusion: null
    });
  }, []);
  
  const addSanction = useCallback((sanctionData: any) => {
    const newId = Date.now().toString();
    const newCreatedAt = new Date().toISOString();
    
    setSanctionsData(prev => {
      const updated = { ...prev };
      
      switch (sanctionData.type) {
        case 'conductWarning':
          updated.conductWarnings.push({
            id: newId,
            date: sanctionData.date,
            reason: sanctionData.reason,
            createdAt: newCreatedAt
          });
          break;
        case 'conductBlame':
          updated.conductBlames.push({
            id: newId,
            date: sanctionData.date,
            reason: sanctionData.reason,
            createdAt: newCreatedAt
          });
          break;
        case 'exclusionTemporary':
          const endDate = new Date(sanctionData.date);
          endDate.setDate(endDate.getDate() + sanctionData.exclusionDays - 1);
          updated.exclusions.push({
            id: newId,
            startDate: sanctionData.date,
            endDate: endDate.toISOString().split('T')[0],
            days: sanctionData.exclusionDays,
            reason: sanctionData.reason,
            createdAt: newCreatedAt
          });
          break;
        case 'exclusionPermanent':
          updated.permanentExclusion = {
            isExcluded: true,
            date: sanctionData.date,
            reason: sanctionData.reason,
            createdAt: newCreatedAt
          };
          break;
      }
      
      return updated;
    });
  }, []);
  
  const deleteSanction = useCallback((type: string, index?: number) => {
    setSanctionsData(prev => {
      const updated = { ...prev };
      
      switch (type) {
        case 'conductWarning':
          if (index !== undefined) updated.conductWarnings.splice(index, 1);
          break;
        case 'conductBlame':
          if (index !== undefined) updated.conductBlames.splice(index, 1);
          break;
        case 'exclusionTemporary':
          if (index !== undefined) updated.exclusions.splice(index, 1);
          break;
        case 'exclusionPermanent':
          updated.permanentExclusion = null;
          break;
      }
      
      return updated;
    });
  }, []);

  // ===== MEMOIZED EVENT HANDLERS =====
  
  // Optimize handlers to prevent unnecessary re-renders of child components
  const handleClassChange = useCallback((classId: string) => {
    setSelectedClass(classId);
    setSelectedStudents([]);
    setSearchQuery('');
    // Reset sanctions selection when class changes
    setSelectedStudentForSanctions(null);
    setSanctionsData({
      conductWarnings: [],
      conductBlames: [],
      exclusions: [],
      permanentExclusion: null
    });
  }, []);

  const handleStudentSelection = useCallback((studentId: number, selected: boolean) => {
    setSelectedStudents(prev => 
      selected 
        ? [...prev, studentId]
        : prev.filter(id => id !== studentId)
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (!studentsData?.students) return;
    
    const eligibleStudents = studentsData.students.filter((student: StudentData) => 
      student.approvedGrades.length > 0
    );
    
    setSelectedStudents(prev => 
      prev.length === eligibleStudents.length
        ? []
        : eligibleStudents.map((s: StudentData) => s.id)
    );
  }, [studentsData?.students]);

  const handleTabChange = useCallback((tabValue: string) => {
    setActiveTab(tabValue);
    setMountedTabs(prev => new Set([...Array.from(prev), tabValue]));
  }, []);

  const toggleSection = useCallback((sectionKey: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  }, []);

  const updateSubjectCoefficient = useCallback((subjectId: number, field: string, value: string) => {
    setSubjectCoefficients(prev => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [field]: value
      }
    }));
  }, []);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setReportFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const handleBulletinSelectAll = useCallback(() => {
    if (!pendingBulletins) return;
    
    setSelectedBulletins(prev => 
      prev.length === pendingBulletins.length
        ? []
        : pendingBulletins.map((b: any) => b.id)
    );
    setSelectAll(prev => !prev);
  }, [pendingBulletins]);

  const handleBulletinSelect = useCallback((bulletinId: number) => {
    setSelectedBulletins(prev => {
      const isSelected = prev.includes(bulletinId);
      const newSelection = isSelected
        ? prev.filter(id => id !== bulletinId)
        : [...prev, bulletinId];
      
      // Update selectAll state based on new selection
      if (pendingBulletins) {
        setSelectAll(newSelection.length === pendingBulletins.length);
      }
      
      return newSelection;
    });
  }, [pendingBulletins]);

  // ===== REPORTING FUNCTIONS =====

  // Export report function
  const handleExportReport = async (format: 'csv' | 'pdf', reportType: string) => {
    try {
      setExportingReport(true);
      
      const params = new URLSearchParams();
      params.set('format', format);
      params.set('reportType', reportType);
      if (reportFilters.term) params.set('term', reportFilters.term);
      if (reportFilters.academicYear) params.set('academicYear', reportFilters.academicYear);
      if (reportFilters.classId) params.set('classId', reportFilters.classId);
      if (reportFilters.startDate) params.set('startDate', reportFilters.startDate);
      if (reportFilters.endDate) params.set('endDate', reportFilters.endDate);
      
      const response = await apiRequest('GET', `/api/comprehensive-bulletins/reports/export?${params.toString()}`);
      
      if (response.ok && format === 'csv') {
        // Handle CSV download
        const csvData = await response.text();
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: 'Export réussi',
          description: 'Le rapport a été exporté en CSV avec succès',
        });
      } else if (format === 'pdf') {
        const data = await response.json();
        toast({
          title: 'Information',
          description: data.message || 'L\'export PDF sera implémenté prochainement',
          variant: 'default'
        });
      }
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: 'Erreur d\'export',
        description: error.message || 'Échec de l\'export du rapport',
        variant: 'destructive'
      });
    } finally {
      setExportingReport(false);
    }
  };

  // Color schemes for charts
  const statusColors = {
    draft: '#94a3b8',
    submitted: '#f59e0b', 
    approved: '#3b82f6',
    signed: '#8b5cf6',
    sent: '#10b981'
  };

  const channelColors = {
    email: '#3b82f6',
    sms: '#f59e0b',
    whatsapp: '#10b981'
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6" data-testid="comprehensive-bulletin-generator">
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
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <div className="w-full overflow-x-auto">
          <TabsList className="flex w-max min-w-full h-auto p-1 gap-1 bg-muted rounded-lg">
            <TabsTrigger value="class-selection" className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
              <School className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t.classSelection}</span>
              <span className="sm:hidden">Classes</span>
            </TabsTrigger>
            <TabsTrigger value="student-management" disabled={!selectedClass} className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t.studentManagement}</span>
              <span className="sm:hidden">Élèves</span>
            </TabsTrigger>
            <TabsTrigger value="manual-data-entry" disabled={!selectedClass} className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
              <Edit3 className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t.manualDataEntry}</span>
              <span className="sm:hidden">Saisie</span>
            </TabsTrigger>
            <TabsTrigger value="sanctions-disciplinaires" disabled={!selectedClass} className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t.sanctionsDisciplinaires}</span>
              <span className="sm:hidden">Sanctions</span>
            </TabsTrigger>
            <TabsTrigger value="generation-options" disabled={!selectedClass} className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
              <Settings className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t.generationOptions}</span>
              <span className="sm:hidden">Options</span>
            </TabsTrigger>
            <TabsTrigger value="bulk-operations" disabled={selectedStudents.length === 0} className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
              <Download className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t.bulkOperations}</span>
              <span className="sm:hidden">Lots</span>
            </TabsTrigger>
            <TabsTrigger value="pending-bulletins" className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t.pendingBulletins}</span>
              <span className="sm:hidden">En Cours</span>
            </TabsTrigger>
            <TabsTrigger value="approved-bulletins" className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t.approvedBulletins}</span>
              <span className="sm:hidden">Approuvés</span>
            </TabsTrigger>
            <TabsTrigger value="sent-bulletins" className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
              <FileDown className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t.sentBulletins}</span>
              <span className="sm:hidden">Envoyés</span>
            </TabsTrigger>
            <TabsTrigger value="template-creator" className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
              <Edit3 className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Créateur de Modèles</span>
              <span className="sm:hidden">Modèles</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
              <BarChart3 className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Rapports</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>
        </div>

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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
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
              
              {/* Data Loading Control Section */}
              <div className="space-y-4">
                <Separator />
                
                {!dataLoadingEnabled && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Database className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <h4 className="font-medium text-blue-900">Chargement des données requis</h4>
                        <p className="text-sm text-blue-700">
                          Sélectionnez une classe, un trimestre et une année, puis cliquez sur "Charger les données" pour commencer.
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Button 
                            onClick={handleLoadData}
                            disabled={!hasValidSelection}
                            className="bg-blue-600 hover:bg-blue-700"
                            data-testid="load-data-button"
                          >
                            <Database className="h-4 w-4 mr-2" />
                            Charger les données
                          </Button>
                          {hasValidSelection && (
                            <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Sélection complète
                            </Badge>
                          )}
                          {!hasValidSelection && (
                            <Badge variant="outline" className="text-orange-700 border-orange-200 bg-orange-50">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Sélection incomplète
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {dataLoadingEnabled && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <h4 className="font-medium text-green-900">Données chargées avec succès</h4>
                        <p className="text-sm text-green-700">
                          Les données sont disponibles. Vous pouvez maintenant naviguer entre les onglets.
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Button 
                            onClick={handleResetData}
                            variant="outline"
                            size="sm"
                            data-testid="reset-data-button"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Réinitialiser les données
                          </Button>
                          <Badge variant="outline" className="text-green-700 border-green-200 bg-green-100">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Données actives
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Class Statistics */}
              {classStats && dataLoadingEnabled && (
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

        {/* Manual Data Entry Tab */}
        {mountedTabs.has('manual-data-entry') && (
          <TabsContent value="manual-data-entry" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                {t.manualDataEntry}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Student Selection for Manual Entry */}
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
                    {filteredStudents.map((student) => (
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
                                name="latenessCount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t.latenessCountField}</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        type="number" 
                                        min="0" 
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        data-testid="lateness-count"
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
                                    <FormLabel>{t.detentionHoursField}</FormLabel>
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
                    
                    {/* Section 2: Disciplinary Sanctions */}
                    <Collapsible open={openSections.sanctions} onOpenChange={() => toggleSection('sanctions')}>
                      <Card>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                            <CardTitle className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                {t.disciplinarySanctions}
                              </div>
                              {openSections.sanctions ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </CardTitle>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="pt-0 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={manualDataForm.control}
                                name="conductWarning"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        data-testid="conduct-warning"
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>{t.conductWarningField}</FormLabel>
                                    </div>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={manualDataForm.control}
                                name="conductBlame"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        data-testid="conduct-blame"
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>{t.conductBlameField}</FormLabel>
                                    </div>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={manualDataForm.control}
                                name="exclusionDays"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t.exclusionDaysField}</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        type="number" 
                                        min="0" 
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        data-testid="exclusion-days"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={manualDataForm.control}
                                name="permanentExclusion"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        data-testid="permanent-exclusion"
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="text-red-600 font-semibold">{t.permanentExclusionField}</FormLabel>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                    
                    {/* Section 3: Academic Totals */}
                    <Collapsible open={openSections.totals} onOpenChange={() => toggleSection('totals')}>
                      <Card>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                            <CardTitle className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-blue-600" />
                                {t.academicTotals}
                              </div>
                              {openSections.totals ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </CardTitle>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="pt-0 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                              <FormField
                                control={manualDataForm.control}
                                name="totalGeneral"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t.totalGeneralField}</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        type="number" 
                                        step="0.01" 
                                        min="0" 
                                        placeholder="0.00"
                                        data-testid="total-general"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={manualDataForm.control}
                                name="numberOfAverages"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t.numberOfAveragesField}</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        type="number" 
                                        min="0" 
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        data-testid="number-of-averages"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={manualDataForm.control}
                                name="successRate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t.successRateField}</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        type="number" 
                                        step="0.01" 
                                        min="0" 
                                        max="100" 
                                        placeholder="0.00"
                                        data-testid="success-rate"
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
                    
                    {/* Section 4: Subject Coefficients & Codes */}
                    <Collapsible open={openSections.subjectCoefficients} onOpenChange={() => toggleSection('subjectCoefficients')}>
                      <Card>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                            <CardTitle className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-indigo-600" />
                                {t.subjectCoefficientsSection}
                              </div>
                              {openSections.subjectCoefficients ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </CardTitle>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="pt-0 space-y-4">
                            {selectedStudentForEntry && filteredStudents.find(s => s.id === selectedStudentForEntry)?.approvedGrades?.length > 0 ? (
                              <div className="space-y-4">
                                <p className="text-sm text-muted-foreground mb-4">
                                  {t.subjectCoefficientsDescription}
                                </p>
                                
                                {/* Explications des colonnes en français et anglais */}
                                <div className="bg-blue-50 p-4 rounded-lg mb-4 space-y-3">
                                  <h4 className="font-semibold text-blue-900 mb-3">
                                    📝 Significations / Meanings:
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div className="space-y-2">
                                      <h5 className="font-medium text-blue-800">🇫🇷 Français:</h5>
                                      <p><strong>N/20:</strong> Note sur 20</p>
                                      <p><strong>M/20:</strong> Moyenne sur 20</p>
                                      <p><strong>Coef:</strong> Coefficient de la matière</p>
                                      <p><strong>M*Coef:</strong> Moyenne × Coefficient</p>
                                      <p><strong>Cote:</strong> Cote d'appréciation (A-F)</p>
                                      <p><strong>Remarks:</strong> Niveau d'acquisition des compétences</p>
                                      <div className="mt-3 p-2 bg-white rounded border">
                                        <p className="text-xs font-medium mb-1">Niveaux de compétences :</p>
                                        <p className="text-xs"><strong>CVWA:</strong> Compétences Très Bien Acquises</p>
                                        <p className="text-xs"><strong>CWA:</strong> Compétences Bien Acquises</p>
                                        <p className="text-xs"><strong>CA:</strong> Compétences Acquises</p>
                                        <p className="text-xs"><strong>CAA:</strong> Compétences Moyennement Acquises</p>
                                        <p className="text-xs"><strong>CNA:</strong> Compétences Non Acquises</p>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <h5 className="font-medium text-blue-800">🇺🇸 English:</h5>
                                      <p><strong>N/20:</strong> Grade out of 20</p>
                                      <p><strong>M/20:</strong> Average out of 20</p>
                                      <p><strong>Coef:</strong> Subject coefficient</p>
                                      <p><strong>M*Coef:</strong> Average × Coefficient</p>
                                      <p><strong>Cote:</strong> Achievement Grade (A-F)</p>
                                      <p><strong>Remarks:</strong> Competency acquisition level</p>
                                      <div className="mt-3 p-2 bg-white rounded border">
                                        <p className="text-xs font-medium mb-1">Competency levels:</p>
                                        <p className="text-xs"><strong>CVWA:</strong> Competences Very Well Acquired</p>
                                        <p className="text-xs"><strong>CWA:</strong> Competences Well Acquired</p>
                                        <p className="text-xs"><strong>CA:</strong> Competences Acquired</p>
                                        <p className="text-xs"><strong>CAA:</strong> Competences Averagely Acquired</p>
                                        <p className="text-xs"><strong>CNA:</strong> Competences Not Acquired</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                      <tr className="bg-gray-50">
                                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Matière</th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-sm font-semibold">N/20</th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-sm font-semibold">M/20</th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-sm font-semibold">Coef</th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-sm font-semibold">M*Coef</th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-sm font-semibold">Cote</th>
                                        <th className="border border-gray-300 px-2 py-2 text-center text-sm font-semibold">Remarks</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {filteredStudents.find(s => s.id === selectedStudentForEntry)?.approvedGrades?.map((grade, index) => (
                                        <tr key={grade.subjectId} className="hover:bg-gray-50">
                                          <td className="border border-gray-300 px-3 py-2 text-sm">
                                            <div className="font-medium text-gray-900">{grade.subjectName}</div>
                                            <div className="text-xs text-gray-500 mt-1">Prof: {grade.teacherName || 'Non assigné'}</div>
                                          </td>
                                          <td className="border border-gray-300 px-1 py-1">
                                            <Input
                                              type="number"
                                              step="0.1"
                                              min="0"
                                              max="20"
                                              placeholder="0.0"
                                              className="h-8 text-center text-xs"
                                              value={subjectCoefficients[grade.subjectId]?.noteOn20 || ''}
                                              onChange={(e) => updateSubjectCoefficient(grade.subjectId, 'noteOn20', e.target.value)}
                                              data-testid={`note-${grade.subjectId}`}
                                            />
                                          </td>
                                          <td className="border border-gray-300 px-1 py-1">
                                            <Input
                                              type="number"
                                              step="0.1"
                                              min="0"
                                              max="20"
                                              placeholder="0.0"
                                              className="h-8 text-center text-xs"
                                              value={subjectCoefficients[grade.subjectId]?.averageOn20 || ''}
                                              onChange={(e) => updateSubjectCoefficient(grade.subjectId, 'averageOn20', e.target.value)}
                                              data-testid={`average-${grade.subjectId}`}
                                            />
                                          </td>
                                          <td className="border border-gray-300 px-1 py-1">
                                            <Input
                                              type="number"
                                              step="1"
                                              min="1"
                                              max="10"
                                              placeholder="1"
                                              className="h-8 text-center text-xs"
                                              value={subjectCoefficients[grade.subjectId]?.coefficient || grade.coefficient || ''}
                                              onChange={(e) => updateSubjectCoefficient(grade.subjectId, 'coefficient', e.target.value)}
                                              data-testid={`coef-${grade.subjectId}`}
                                            />
                                          </td>
                                          <td className="border border-gray-300 px-1 py-1">
                                            <Input
                                              type="number"
                                              step="0.1"
                                              placeholder="0.0"
                                              className="h-8 text-center text-xs bg-gray-50"
                                              value={
                                                (() => {
                                                  const avg = parseFloat(subjectCoefficients[grade.subjectId]?.averageOn20 || '0');
                                                  const coef = parseFloat(subjectCoefficients[grade.subjectId]?.coefficient || grade.coefficient || '1');
                                                  return !isNaN(avg) && !isNaN(coef) ? (avg * coef).toFixed(1) : '';
                                                })()
                                              }
                                              readOnly
                                              data-testid={`weighted-${grade.subjectId}`}
                                            />
                                          </td>
                                          <td className="border border-gray-300 px-1 py-1">
                                            <Select
                                              value={subjectCoefficients[grade.subjectId]?.cote || ''}
                                              onValueChange={(value) => updateSubjectCoefficient(grade.subjectId, 'cote', value === 'none' ? '' : value)}
                                            >
                                              <SelectTrigger className="h-8 text-xs bg-white text-black border-gray-300 focus:border-blue-500" data-testid={`cote-${grade.subjectId}`} style={{color: '#000000', backgroundColor: '#ffffff'}}>
                                                <SelectValue placeholder="-" className="text-black" style={{color: '#000000'}}>
                                                  {subjectCoefficients[grade.subjectId]?.cote || '-'}
                                                </SelectValue>
                                              </SelectTrigger>
                                              <SelectContent className="bg-white border border-gray-300" style={{backgroundColor: '#ffffff'}}>
                                                <SelectItem value="none" className="text-black hover:bg-gray-100" style={{color: '#000000'}}>-</SelectItem>
                                                <SelectItem value="A" className="text-black hover:bg-gray-100" style={{color: '#000000'}}>A</SelectItem>
                                                <SelectItem value="B" className="text-black hover:bg-gray-100" style={{color: '#000000'}}>B</SelectItem>
                                                <SelectItem value="C" className="text-black hover:bg-gray-100" style={{color: '#000000'}}>C</SelectItem>
                                                <SelectItem value="D" className="text-black hover:bg-gray-100" style={{color: '#000000'}}>D</SelectItem>
                                                <SelectItem value="E" className="text-black hover:bg-gray-100" style={{color: '#000000'}}>E</SelectItem>
                                                <SelectItem value="F" className="text-black hover:bg-gray-100" style={{color: '#000000'}}>F</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </td>
                                          <td className="border border-gray-300 px-1 py-1">
                                            <Select
                                              value={subjectCoefficients[grade.subjectId]?.remarks || ''}
                                              onValueChange={(value) => updateSubjectCoefficient(grade.subjectId, 'remarks', value === 'none' ? '' : value)}
                                            >
                                              <SelectTrigger className="h-8 text-xs bg-white text-black border-gray-300 focus:border-blue-500" data-testid={`remarks-${grade.subjectId}`} style={{color: '#000000', backgroundColor: '#ffffff'}}>
                                                <SelectValue placeholder="-" className="text-black" style={{color: '#000000'}}>
                                                  {subjectCoefficients[grade.subjectId]?.remarks || '-'}
                                                </SelectValue>
                                              </SelectTrigger>
                                              <SelectContent className="bg-white border border-gray-300" style={{backgroundColor: '#ffffff'}}>
                                                <SelectItem value="none" className="text-black hover:bg-gray-100" style={{color: '#000000'}}>-</SelectItem>
                                                <SelectItem value="CVWA" className="text-black hover:bg-gray-100" style={{color: '#000000'}}>CVWA - Competences Very Well Acquired</SelectItem>
                                                <SelectItem value="CWA" className="text-black hover:bg-gray-100" style={{color: '#000000'}}>CWA - Competences Well Acquired</SelectItem>
                                                <SelectItem value="CA" className="text-black hover:bg-gray-100" style={{color: '#000000'}}>CA - Competences Acquired</SelectItem>
                                                <SelectItem value="CAA" className="text-black hover:bg-gray-100" style={{color: '#000000'}}>CAA - Competences Averagely Acquired</SelectItem>
                                                <SelectItem value="CNA" className="text-black hover:bg-gray-100" style={{color: '#000000'}}>CNA - Competences Not Acquired</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      fillDefaultCoefficients();
                                    }}
                                    data-testid="fill-default-coefficients"
                                  >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    {t.fillDefaultValues}
                                  </Button>
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      clearAllCoefficients();
                                    }}
                                    data-testid="clear-coefficients"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    {t.clearAll}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>{t.selectStudentToConfigureCoefficients}</p>
                              </div>
                            )}
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                    
                    {/* Section 5: Appreciations & Comments */}
                    <Collapsible open={openSections.appreciations} onOpenChange={() => toggleSection('appreciations')}>
                      <Card>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                            <CardTitle className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <BookMarked className="h-5 w-5 text-green-600" />
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
                              name="workAppreciation"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t.workAppreciationField}</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      placeholder="Entrez l'appréciation détaillée du travail de l'élève..."
                                      className="min-h-[100px]"
                                      maxLength={500}
                                      data-testid="work-appreciation"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    {field.value?.length || 0}/500 caractères
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={manualDataForm.control}
                              name="generalComment"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t.generalCommentField}</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      placeholder="Commentaire général sur le trimestre..."
                                      className="min-h-[80px]"
                                      maxLength={300}
                                      data-testid="general-comment"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    {field.value?.length || 0}/300 caractères
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                    
                    {/* Section 6: Conseil de Classe */}
                    <Collapsible open={openSections.classCouncil} onOpenChange={() => toggleSection('classCouncil')}>
                      <Card>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                            <CardTitle className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-indigo-600" />
                                {t.classCouncilSection}
                              </div>
                              {openSections.classCouncil ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </CardTitle>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="pt-0 space-y-6">
                            {/* Décisions du conseil */}
                            <FormField
                              control={manualDataForm.control}
                              name="classCouncilDecisions"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t.classCouncilDecisionsField}</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      placeholder={t.classCouncilDecisionsPlaceholder}
                                      className="min-h-[120px]"
                                      maxLength={1000}
                                      data-testid="class-council-decisions"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    {field.value?.length || 0}/1000 caractères
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            {/* Mentions */}
                            <FormField
                              control={manualDataForm.control}
                              name="classCouncilMentions"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t.classCouncilMentionsField}</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="class-council-mentions">
                                        <SelectValue placeholder={t.selectMention} />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="">{t.selectMention}</SelectItem>
                                      <SelectItem value="Félicitations">{t.mentionFelicitations}</SelectItem>
                                      <SelectItem value="Encouragements">{t.mentionEncouragements}</SelectItem>
                                      <SelectItem value="Satisfaisant">{t.mentionSatisfaisant}</SelectItem>
                                      <SelectItem value="Mise en garde">{t.mentionMiseEnGarde}</SelectItem>
                                      <SelectItem value="Blâme">{t.mentionBlame}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            {/* Recommandations d'orientation */}
                            <FormField
                              control={manualDataForm.control}
                              name="orientationRecommendations"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t.orientationRecommendationsField}</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      placeholder={t.orientationRecommendationsPlaceholder}
                                      className="min-h-[100px]"
                                      maxLength={1000}
                                      data-testid="orientation-recommendations"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    {field.value?.length || 0}/1000 caractères
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Date du conseil */}
                              <FormField
                                control={manualDataForm.control}
                                name="councilDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t.councilDateField}</FormLabel>
                                    <FormControl>
                                      <Input {...field} type="date" data-testid="council-date" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            {/* Participants au conseil (optionnel) */}
                            <FormField
                              control={manualDataForm.control}
                              name="councilParticipants"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t.councilParticipantsField}</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      placeholder={t.councilParticipantsPlaceholder}
                                      className="min-h-[80px]"
                                      maxLength={500}
                                      data-testid="council-participants"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    {field.value?.length || 0}/500 caractères
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                    
                    {/* Section 7: Signatures */}
                    <Collapsible open={openSections.signatures} onOpenChange={() => toggleSection('signatures')}>
                      <Card>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                            <CardTitle className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileSignature className="h-5 w-5 text-purple-600" />
                                {t.signaturesSection}
                              </div>
                              {openSections.signatures ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </CardTitle>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="pt-0 space-y-6">
                            {/* Parent Visa */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-sm text-muted-foreground">VISA PARENT/TUTEUR</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={manualDataForm.control}
                                  name="parentVisaName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{t.parentVisaNameField}</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="Nom du parent/tuteur" data-testid="parent-visa-name" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={manualDataForm.control}
                                  name="parentVisaDate"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{t.parentVisaDateField}</FormLabel>
                                      <FormControl>
                                        <Input {...field} type="date" data-testid="parent-visa-date" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                            
                            {/* Teacher Visa */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-sm text-muted-foreground">VISA PROFESSEUR PRINCIPAL</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={manualDataForm.control}
                                  name="teacherVisaName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{t.teacherVisaNameField}</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="Nom du professeur principal" data-testid="teacher-visa-name" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={manualDataForm.control}
                                  name="teacherVisaDate"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{t.teacherVisaDateField}</FormLabel>
                                      <FormControl>
                                        <Input {...field} type="date" data-testid="teacher-visa-date" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                            
                            {/* Headmaster Visa */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-sm text-muted-foreground">VISA CHEF D'ÉTABLISSEMENT</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={manualDataForm.control}
                                  name="headmasterVisaName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{t.headmasterVisaNameField}</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="Nom du chef d'établissement" data-testid="headmaster-visa-name" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={manualDataForm.control}
                                  name="headmasterVisaDate"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{t.headmasterVisaDateField}</FormLabel>
                                      <FormControl>
                                        <Input {...field} type="date" data-testid="headmaster-visa-date" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                    
                    {/* Form Submit Button */}
                    <div className="flex justify-center pt-6">
                      <Button type="submit" size="lg" data-testid="save-manual-data">
                        <Save className="h-5 w-5 mr-2" />
                        Sauvegarder les données
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
              
              {!selectedStudentForEntry && (
                <div className="text-center py-12 text-muted-foreground">
                  <Edit3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t.selectStudentForEntry}</p>
                </div>
              )}
            </CardContent>
          </Card>
          </TabsContent>
        )}
        
        {/* Student Management Tab */}
        {mountedTabs.has('student-management') && (
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
                          <div className="space-y-3">
                            {/* Desktop Layout - Ligne complète */}
                            <div className="hidden sm:flex items-center justify-between">
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

                            {/* Mobile Layout - Disposition verticale */}
                            <div className="sm:hidden space-y-3">
                              {/* Ligne 1: Checkbox + Info élève */}
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) => handleStudentSelection(student.id, !!checked)}
                                  disabled={!hasApprovedGrades}
                                  data-testid={`student-checkbox-${student.id}`}
                                />
                                <User className="h-8 w-8 text-gray-400" />
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {student.firstName} {student.lastName}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {student.matricule} • {student.className}
                                  </div>
                                </div>
                              </div>

                              {/* Ligne 2: Stats + Bouton Aperçu */}
                              <div className="pl-11 space-y-2">
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
                                </div>
                                
                                {/* Aperçu Bulletin - Sous le nom sur mobile */}
                                {hasApprovedGrades && (
                                  <Button
                                    onClick={() => {
                                      setPreviewStudentId(student.id);
                                      setShowPreviewDialog(true);
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    data-testid={`preview-button-${student.id}`}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    {t.previewBulletin}
                                  </Button>
                                )}
                              </div>
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
        )}

        {/* Sanctions Disciplinaires Tab */}
        {mountedTabs.has('sanctions-disciplinaires') && (
          <TabsContent value="sanctions-disciplinaires" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {t.sanctionsManagement}
                </CardTitle>
                <p className="text-muted-foreground">{t.sanctionsDescription}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Student Selection */}
                <div className="space-y-2">
                  <Label htmlFor="sanctions-student-select">{t.selectStudentForSanctions}</Label>
                  <Select 
                    value={selectedStudentForSanctions?.toString() || ''} 
                    onValueChange={(value) => {
                      const studentId = parseInt(value);
                      setSelectedStudentForSanctions(studentId);
                      // Update form with student ID
                      sanctionsForm.setValue('studentId', studentId);
                      // Refetch sanctions for new student
                      if (studentId) {
                        refetchSanctions();
                      }
                    }}
                  >
                    <SelectTrigger id="sanctions-student-select" data-testid="sanctions-student-select">
                      <SelectValue placeholder={t.selectStudentPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredStudents?.map((student: StudentData) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.firstName} {student.lastName} ({student.matricule})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedStudentForSanctions && (
                  <div className="space-y-6">
                    {/* Sanctions History */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <History className="h-5 w-5" />
                        {t.sanctionHistory}
                      </h3>
                      
                      {isLoadingSanctions ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span className="ml-2">{t.loading}</span>
                        </div>
                      ) : !studentSanctions || studentSanctions.length === 0 ? (
                        <Card className="bg-green-50 border-green-200" data-testid="no-sanctions-card">
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-green-700">
                              <CheckCircle className="h-5 w-5" />
                              <p>{t.noSanctionsHistory}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="space-y-4" data-testid="sanctions-list">
                          {studentSanctions.map((sanction) => (
                            <Card key={sanction.id} className={`border-l-4 ${
                              sanction.sanctionType === 'conduct_warning' ? 'border-l-yellow-500 bg-yellow-50' :
                              sanction.sanctionType === 'conduct_blame' ? 'border-l-orange-500 bg-orange-50' :
                              sanction.sanctionType === 'exclusion_temporary' ? 'border-l-red-500 bg-red-50' :
                              'border-l-gray-500 bg-gray-50'
                            }`}>
                              <CardContent className="pt-4">
                                <div className="flex justify-between items-start">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      {sanction.sanctionType === 'conduct_warning' && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                                      {sanction.sanctionType === 'conduct_blame' && <XCircle className="h-4 w-4 text-orange-600" />}
                                      {sanction.sanctionType === 'exclusion_temporary' && <X className="h-4 w-4 text-red-600" />}
                                      {sanction.sanctionType === 'exclusion_permanent' && <X className="h-4 w-4 text-gray-600" />}
                                      <span className="font-semibold capitalize">
                                        {sanction.sanctionType.replace('_', ' ')}
                                      </span>
                                      <Badge variant={sanction.severity === 'high' || sanction.severity === 'critical' ? 'destructive' : 'secondary'}>
                                        {sanction.severity}
                                      </Badge>
                                      <Badge variant={sanction.status === 'active' ? 'default' : 'secondary'}>
                                        {sanction.status}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      <strong>{t.sanctionDate}:</strong> {new Date(sanction.date).toLocaleDateString()}
                                    </p>
                                    {sanction.duration && (
                                      <p className="text-sm text-muted-foreground">
                                        <strong>{t.duration}:</strong> {sanction.duration} {t.days}
                                      </p>
                                    )}
                                    <p className="text-sm">
                                      <strong>{t.sanctionReason}:</strong> {sanction.description}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    {sanction.status === 'active' && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          revokeSanctionMutation.mutate({
                                            id: sanction.id,
                                            reason: "Révoquée par le directeur"
                                          });
                                        }}
                                        disabled={revokeSanctionMutation.isPending}
                                        data-testid={`revoke-sanction-${sanction.id}`}
                                      >
                                        <X className="h-4 w-4" />
                                        {t.revoke}
                                      </Button>
                                    )}
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => {
                                        deleteSanctionMutation.mutate({
                                          id: sanction.id,
                                          studentId: sanction.studentId,
                                          classId: sanction.classId,
                                          schoolId: sanction.schoolId
                                        });
                                      }}
                                      disabled={deleteSanctionMutation.isPending}
                                      data-testid={`delete-sanction-${sanction.id}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      {t.delete}
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add New Sanction Form */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Plus className="h-5 w-5" />
                          {t.addNewSanction}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Form {...sanctionsForm}>
                          <form 
                            onSubmit={sanctionsForm.handleSubmit((data) => {
                              // Update form data with current context
                              const sanctionData = {
                                ...data,
                                studentId: selectedStudentForSanctions!,
                                classId: selectedClass ? parseInt(selectedClass) : 0,
                                schoolId: user?.schoolId || 0,
                                issueBy: user?.id || 0,
                                academicYear: academicYear || '2024-2025',
                                term: selectedTerm || 'Premier Trimestre'
                              };
                              
                              createSanctionMutation.mutate(sanctionData, {
                                onSuccess: () => {
                                  sanctionsForm.reset({
                                    sanctionType: 'conduct_warning',
                                    date: new Date().toISOString().split('T')[0],
                                    description: '',
                                    severity: 'medium',
                                    duration: 1
                                  });
                                }
                              });
                            })}
                            className="space-y-4"
                            data-testid="add-sanction-form"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={sanctionsForm.control}
                                name="sanctionType"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t.sanctionType}</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger data-testid="sanction-type-select">
                                          <SelectValue placeholder={t.selectSanctionType} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="conduct_warning" data-testid="sanction-type-warning">
                                          {t.conductWarning}
                                        </SelectItem>
                                        <SelectItem value="conduct_blame" data-testid="sanction-type-blame">
                                          {t.conductBlame}
                                        </SelectItem>
                                        <SelectItem value="exclusion_temporary" data-testid="sanction-type-temp-exclusion">
                                          {t.exclusionTemporary}
                                        </SelectItem>
                                        <SelectItem value="exclusion_permanent" data-testid="sanction-type-perm-exclusion">
                                          {t.exclusionPermanent}
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={sanctionsForm.control}
                                name="severity"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t.severity}</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger data-testid="sanction-severity-select">
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="low">{t.severityLow}</SelectItem>
                                        <SelectItem value="medium">{t.severityMedium}</SelectItem>
                                        <SelectItem value="high">{t.severityHigh}</SelectItem>
                                        <SelectItem value="critical">{t.severityCritical}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={sanctionsForm.control}
                                name="date"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t.sanctionDate}</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="date" 
                                        {...field} 
                                        data-testid="sanction-date-input"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              {(sanctionsForm.watch('sanctionType') === 'exclusion_temporary') && (
                                <FormField
                                  control={sanctionsForm.control}
                                  name="duration"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{t.exclusionDays}</FormLabel>
                                      <FormControl>
                                        <Input 
                                          type="number" 
                                          min="1" 
                                          max="365" 
                                          {...field} 
                                          value={field.value || ''}
                                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                                          data-testid="sanction-duration-input"
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        {t.exclusionDaysDescription}
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}
                            </div>
                            
                            <FormField
                              control={sanctionsForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t.sanctionReason}</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder={t.sanctionReasonPlaceholder} 
                                      rows={3}
                                      {...field} 
                                      data-testid="sanction-description-textarea"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    {t.sanctionReasonDescription}
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="flex justify-end pt-4">
                              <Button 
                                type="submit" 
                                disabled={createSanctionMutation.isPending}
                                className="min-w-[150px]"
                                data-testid="save-sanction-button"
                              >
                                {createSanctionMutation.isPending ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {t.saving}
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-4 w-4 mr-2" />
                                    {t.saveSanction}
                                  </>
                                )}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {!selectedStudentForSanctions && (
                  <Card className="bg-muted" data-testid="select-student-prompt">
                    <CardContent className="pt-6">
                      <div className="text-center text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>{t.pleaseSelectStudent}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* ===== TEMPLATE CREATOR TAB ===== */}
        {mountedTabs.has('template-creator') && (
          <TabsContent value="template-creator" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  {t.templateCreatorTitle}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t.templateCreatorDescription}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Template Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">{t.templateName}</Label>
                    <Input
                      id="template-name"
                      placeholder="Mon modèle de bulletin personnalisé"
                      data-testid="template-name-input"
                      {...templateForm.register('name')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-description">{t.templateDescription}</Label>
                    <Input
                      id="template-description"
                      placeholder="Description du modèle..."
                      data-testid="template-description-input"
                      {...templateForm.register('description')}
                    />
                  </div>
                </div>

                {/* Drag and Drop Context - Restructuré selon solution architecturale */}
                {templateElements.length > 0 ? (
                  <CanvasArea />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Utilisez la palette d'éléments pour commencer à créer votre modèle
                  </div>
                )}

                {/* Template Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleNewTemplate} data-testid="new-template-btn">
                      <Plus className="h-4 w-4 mr-2" />
                      {t.createNewTemplate}
                    </Button>
                    <Button variant="outline" onClick={handleLoadTemplate} data-testid="load-template-btn">
                      <FileText className="h-4 w-4 mr-2" />
                      Charger modèle
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePreviewTemplate} data-testid="preview-template-btn">
                      <Eye className="h-4 w-4 mr-2" />
                      Aperçu
                    </Button>
                    <Button onClick={handleSaveTemplate} disabled={isSavingTemplate} data-testid="save-template-btn">
                      {isSavingTemplate ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {t.saveTemplate}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Sanctions Tab */}
        {mountedTabs.has('sanctions') && (
          <TabsContent value="sanctions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {t.sanctionsTitle}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t.sanctionsDescription}
                </p>
              </CardHeader>
              <CardContent>
                {/* Contenu des sanctions sera ajouté ici */}
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Gestion des sanctions disciplinaires</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* ===== REPORTS TAB ===== */}
        {mountedTabs.has('reports') && (
          <TabsContent value="reports" className="space-y-4">
            <Suspense fallback={<LoadingSkeleton />}>
              <ReportsTab 
                reportFilters={reportFilters}
                setReportFilters={setReportFilters}
                reportData={reportData}
                setReportData={setReportData}
                loadingReportData={loadingReportData}
                setLoadingReportData={setLoadingReportData}
                reportError={reportError}
                setReportError={setReportError}
                timelineData={timelineData}
                setTimelineData={setTimelineData}
                loadingTimeline={loadingTimeline}
                setLoadingTimeline={setLoadingTimeline}
                exportingReport={exportingReport}
                setExportingReport={setExportingReport}
                selectedClass={selectedClass}
                selectedTerm={selectedTerm}
                academicYear={academicYear}
              />
            </Suspense>
          </TabsContent>
        )}

        {/* ===== SANCTIONS DISCIPLINAIRES TAB ===== */}
        {mountedTabs.has('sanctions-disciplinaires') && (
          <TabsContent value="sanctions-disciplinaires" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  {t.sanctionsManagement}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Student Selection */}
                <div className="space-y-3">
                  <Label htmlFor="student-select-sanctions">{t.selectStudentForSanctions}</Label>
                  <Select 
                    value={selectedStudentForSanctions?.toString() || ''} 
                    onValueChange={(value) => setSelectedStudentForSanctions(value ? parseInt(value) : null)}
                  >
                    <SelectTrigger id="student-select-sanctions" data-testid="student-select-sanctions">
                      <SelectValue placeholder={t.selectStudentPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.firstName} {student.lastName} - {student.matricule}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Student Sanctions Content */}
                {selectedStudentForSanctions && (
                  <div className="space-y-6">
                    {/* Sanctions History */}
                    {isLoadingSanctions ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2">Chargement des sanctions...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <History className="h-5 w-5" />
                          {t.sanctionHistory}
                        </h3>
                        
                        {studentSanctions && studentSanctions.length > 0 ? (
                          <div className="space-y-3">
                            {studentSanctions.map((sanction) => (
                              <Card key={sanction.id} className="border-orange-200">
                                <CardContent className="pt-4">
                                  <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline">{SANCTION_TYPES[sanction.sanctionType as keyof typeof SANCTION_TYPES]}</Badge>
                                        <Badge variant={sanction.severity === 'high' ? 'destructive' : sanction.severity === 'medium' ? 'default' : 'secondary'}>
                                          {SANCTION_SEVERITY[sanction.severity as keyof typeof SANCTION_SEVERITY]}
                                        </Badge>
                                      </div>
                                      <p className="text-sm font-medium">{sanction.description}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(sanction.date).toLocaleDateString('fr-FR')} - {sanction.term}
                                      </p>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => revokeSanctionMutation.mutate(sanction.id)}
                                        disabled={revokeSanctionMutation.isPending}
                                      >
                                        <RotateCcw className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => deleteSanctionMutation.mutate(sanction.id)}
                                        disabled={deleteSanctionMutation.isPending}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <Card className="bg-green-50 border-green-200">
                            <CardContent className="pt-6">
                              <div className="text-center text-green-700">
                                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                                <p>Aucune sanction disciplinaire pour cet élève</p>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}

                    {/* Add New Sanction Form */}
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        {t.addNewSanction}
                      </h3>
                      
                      <Card className="border-2 border-dashed">
                        <CardContent className="pt-6">
                          <Form {...sanctionsForm}>
                            <form onSubmit={sanctionsForm.handleSubmit((data) => {
                              createSanctionMutation.mutate(data, {
                                onSuccess: () => {
                                  toast({ title: t.success, description: t.sanctionSaved });
                                  sanctionsForm.reset();
                                  refetchSanctions();
                                },
                                onError: (error: any) => {
                                  toast({ 
                                    title: t.error, 
                                    description: error.message || 'Erreur lors de la sauvegarde', 
                                    variant: 'destructive' 
                                  });
                                }
                              });
                            })} className="space-y-4">
                              {/* Sanction Type */}
                              <FormField
                                control={sanctionsForm.control}
                                name="sanctionType"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t.sanctionType} *</FormLabel>
                                    <FormControl>
                                      <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger data-testid="sanction-type-select">
                                          <SelectValue placeholder={t.pleaseSelectSanctionType} />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="conduct_warning">{t.conductWarning}</SelectItem>
                                          <SelectItem value="conduct_blame">{t.conductBlame}</SelectItem>
                                          <SelectItem value="temporary_exclusion">{t.exclusionTemporary}</SelectItem>
                                          <SelectItem value="permanent_exclusion">{t.exclusionPermanent}</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Sanction Date */}
                              <FormField
                                control={sanctionsForm.control}
                                name="date"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t.sanctionDate} *</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="date"
                                        {...field}
                                        data-testid="sanction-date"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Exclusion Days (only for temporary exclusions) */}
                              <FormField
                                control={sanctionsForm.control}
                                name="duration"
                                render={({ field }) => {
                                  const sanctionType = sanctionsForm.watch('sanctionType');
                                  if (sanctionType !== 'temporary_exclusion') return null;
                                  return (
                                    <FormItem>
                                      <FormLabel>{t.exclusionDays} *</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min="1"
                                          max="30"
                                          {...field}
                                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                          data-testid="exclusion-days"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  );
                                }}
                              />

                              {/* Sanction Reason */}
                              <FormField
                                control={sanctionsForm.control}
                                name="description"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t.sanctionReason} *</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder={t.pleaseEnterReason}
                                        className="min-h-[100px]"
                                        data-testid="sanction-reason"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Submit Button */}
                              <div className="flex justify-end pt-4">
                                <Button 
                                  type="submit"
                                  disabled={createSanctionMutation.isPending}
                                  className="min-w-[150px]"
                                  data-testid="save-sanction"
                                >
                                  {createSanctionMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      {t.saving}
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-4 w-4 mr-2" />
                                      {t.saveSanction}
                                    </>
                                  )}
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {!selectedStudentForSanctions && (
                  <Card className="bg-muted">
                    <CardContent className="pt-6">
                      <div className="text-center text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>{t.pleaseSelectStudent}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Generation Options Tab */}
        {mountedTabs.has('generation-options') && (
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

                {/* Section Conseil de Classe */}
                <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {t.sectionClassCouncil}
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-class-council-decisions"
                        checked={includeClassCouncilDecisions}
                        onCheckedChange={(checked) => setIncludeClassCouncilDecisions(checked === true)}
                        data-testid="include-class-council-decisions"
                      />
                      <Label htmlFor="include-class-council-decisions">{t.includeClassCouncilDecisions}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-class-council-mentions"
                        checked={includeClassCouncilMentions}
                        onCheckedChange={(checked) => setIncludeClassCouncilMentions(checked === true)}
                        data-testid="include-class-council-mentions"
                      />
                      <Label htmlFor="include-class-council-mentions">{t.includeClassCouncilMentions}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-orientation-recommendations"
                        checked={includeOrientationRecommendations}
                        onCheckedChange={(checked) => setIncludeOrientationRecommendations(checked === true)}
                        data-testid="include-orientation-recommendations"
                      />
                      <Label htmlFor="include-orientation-recommendations">{t.includeOrientationRecommendations}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-council-date"
                        checked={includeCouncilDate}
                        onCheckedChange={(checked) => setIncludeCouncilDate(checked === true)}
                        data-testid="include-council-date"
                      />
                      <Label htmlFor="include-council-date">{t.includeCouncilDate}</Label>
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
        )}

        {/* Bulk Operations Tab */}
        {mountedTabs.has('bulk-operations') && (
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
                <h3 className="font-semibold mb-2">{t.generationSummary}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>{t.selectedClass}: {classes?.find((c: any) => c.id.toString() === selectedClass)?.name}</div>
                  <div>{t.term}: {selectedTerm}</div>
                  <div>{t.academicYearLabel}: {academicYear}</div>
                  <div>{t.selectedStudentsLabel}: {selectedStudents.length}</div>
                  <div>{t.format}: {generationFormat === 'pdf' ? t.individualPdf : t.batchPdf}</div>
                  <div>{t.options}: {[includeComments && t.comments, includeRankings && t.rankings, includeStatistics && t.statistics, includePerformanceLevels && t.performanceLevels].filter(Boolean).join(', ')}</div>
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
        )}

        {/* Pending Bulletins Tab */}
        {mountedTabs.has('pending-bulletins') && (
          <TabsContent value="pending-bulletins" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  {t.pendingBulletins} ({pendingBulletins?.length || 0})
                </CardTitle>
                
                {pendingBulletins && pendingBulletins.length > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all-bulletins"
                        checked={selectAll}
                        onCheckedChange={handleBulletinSelectAll}
                        data-testid="select-all-bulletins"
                      />
                      <Label htmlFor="select-all-bulletins" className="text-sm font-medium">
                        {language === 'fr' ? 'Sélectionner tout' : 'Select all'}
                      </Label>
                    </div>
                    
                    {selectedBulletins.length > 0 && (
                      <Button
                        onClick={handleBulkApprove}
                        disabled={bulkApproveMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        data-testid="bulk-approve-button"
                      >
                        {bulkApproveMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        {language === 'fr' ? 'Approuver la sélection' : 'Approve selection'} ({selectedBulletins.length})
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loadingPending ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>{t.loading}</span>
                </div>
              ) : !pendingBulletins || pendingBulletins.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun bulletin en attente d'approbation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBulletins.map((bulletin: any) => {
                    const isSelected = selectedBulletins.includes(bulletin.id);
                    return (
                      <Card 
                        key={bulletin.id} 
                        className={`border-l-4 border-l-orange-500 transition-colors ${
                          isSelected ? 'bg-orange-50 border-orange-300' : ''
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            {/* Checkbox de sélection */}
                            <Checkbox
                              id={`select-bulletin-${bulletin.id}`}
                              checked={isSelected}
                              onCheckedChange={() => handleBulletinSelect(bulletin.id)}
                              data-testid={`select-bulletin-${bulletin.id}`}
                              className="flex-shrink-0"
                            />
                            
                            {/* Contenu du bulletin */}
                            <div className="flex-1 flex items-center justify-between">
                              <div className="space-y-1">
                                <h4 className="font-semibold">
                                  {bulletin.studentFirstName} {bulletin.studentLastName}
                                </h4>
                                <div className="text-sm text-muted-foreground">
                                  <span>{bulletin.className} - {bulletin.term} - {bulletin.academicYear}</span>
                                </div>
                                <Badge variant="outline" className="text-orange-600 border-orange-200">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {t.waitingApproval}
                                </Badge>
                              </div>
                              
                              {/* Boutons d'action */}
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  data-testid={`approve-bulletin-${bulletin.id}`}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  {t.approve}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  data-testid={`view-bulletin-${bulletin.id}`}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  {t.viewDetails}
                                </Button>
                              </div>
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
        )}

        {/* Approved Bulletins Tab - Enhanced with Bulk Signature System */}
        {mountedTabs.has('approved-bulletins') && (
          <TabsContent value="approved-bulletins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  {t.approvedBulletins} ({approvedBulletins?.length || 0})
                </div>
                
                {/* Bulk Signature Controls */}
                {approvedBulletins && approvedBulletins.length > 0 && (
                  <div className="flex items-center gap-2">
                    {selectedBulletins.length > 0 && (
                      <>
                        <Badge variant="secondary">
                          {selectedBulletins.length} sélectionné{selectedBulletins.length > 1 ? 's' : ''}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => {
                            const bulletinsForSigning = approvedBulletins
                              .filter((b: any) => selectedBulletins.includes(b.id))
                              .map((b: any) => ({
                                id: b.id,
                                studentId: b.studentId,
                                studentName: `${b.studentFirstName} ${b.studentLastName}`,
                                className: b.className,
                                term: b.term,
                                academicYear: b.academicYear,
                                hasSignature: !!(b.headmasterVisa && (b.headmasterVisa as any).signatureUrl)
                              }));
                            setSelectedBulletinsForSigning(bulletinsForSigning);
                            setShowBulkSignatureModal(true);
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          data-testid="button-bulk-sign"
                        >
                          <FileSignature className="h-4 w-4 mr-2" />
                          Signer la Sélection
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBulletins([]);
                            setSelectAll(false);
                          }}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Désélectionner
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingApproved ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>{t.loading}</span>
                </div>
              ) : !approvedBulletins || approvedBulletins.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun bulletin approuvé</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Select All Checkbox */}
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={(checked) => {
                        setSelectAll(!!checked);
                        if (checked) {
                          setSelectedBulletins(approvedBulletins.map((b: any) => b.id));
                        } else {
                          setSelectedBulletins([]);
                        }
                      }}
                      data-testid="checkbox-select-all-approved"
                    />
                    <Label className="text-sm font-medium cursor-pointer">
                      Sélectionner tous ({approvedBulletins.length})
                    </Label>
                    {selectedBulletins.length > 0 && (
                      <Badge variant="outline" className="ml-auto">
                        {selectedBulletins.length}/{approvedBulletins.length} sélectionnés
                      </Badge>
                    )}
                  </div>

                  {/* Bulletins List */}
                  {approvedBulletins.map((bulletin: any) => {
                    const hasSignature = !!(bulletin.headmasterVisa && (bulletin.headmasterVisa as any).signatureUrl);
                    const signatureData = bulletin.headmasterVisa as any;
                    
                    return (
                      <Card key={bulletin.id} className={`border-l-4 ${hasSignature ? 'border-l-purple-500' : 'border-l-green-500'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            {/* Selection Checkbox */}
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={selectedBulletins.includes(bulletin.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedBulletins(prev => [...prev, bulletin.id]);
                                  } else {
                                    setSelectedBulletins(prev => prev.filter(id => id !== bulletin.id));
                                    setSelectAll(false);
                                  }
                                }}
                                data-testid={`checkbox-bulletin-${bulletin.id}`}
                              />
                              
                              <div className="space-y-2">
                                <h4 className="font-semibold">
                                  {bulletin.studentFirstName} {bulletin.studentLastName}
                                </h4>
                                <div className="text-sm text-muted-foreground">
                                  <span>{bulletin.className} - {bulletin.term} - {bulletin.academicYear}</span>
                                </div>
                                
                                {/* Status Badges */}
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline" className="text-green-600 border-green-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    {t.approved}
                                  </Badge>
                                  
                                  {/* Signature Status Badge */}
                                  {hasSignature ? (
                                    <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                                      <FileSignature className="h-3 w-3 mr-1" />
                                      Signé
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Non Signé
                                    </Badge>
                                  )}
                                </div>
                                
                                {/* Signature Details */}
                                {hasSignature && signatureData && (
                                  <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded border">
                                    <div className="flex items-center gap-2">
                                      <FileSignature className="h-3 w-3" />
                                      <span>
                                        Signé par: <strong>{signatureData.name}</strong>
                                      </span>
                                    </div>
                                    {signatureData.signedAt && (
                                      <div className="mt-1 text-gray-600">
                                        Le: {new Date(signatureData.signedAt).toLocaleDateString('fr-FR', {
                                          day: '2-digit',
                                          month: '2-digit', 
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  data-testid={`send-bulletin-${bulletin.id}`}
                                >
                                  <FileDown className="h-4 w-4 mr-1" />
                                  {t.send}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  data-testid={`view-approved-bulletin-${bulletin.id}`}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  {t.viewDetails}
                                </Button>
                              </div>
                              
                              {/* Individual Signature Button */}
                              <Button
                                size="sm"
                                variant={hasSignature ? "secondary" : "outline"}
                                className={hasSignature ? "text-purple-600" : "text-orange-600 border-orange-200 hover:bg-orange-50"}
                                onClick={() => {
                                  const bulletinForSigning = [{
                                    id: bulletin.id,
                                    studentId: bulletin.studentId,
                                    studentName: `${bulletin.studentFirstName} ${bulletin.studentLastName}`,
                                    className: bulletin.className,
                                    term: bulletin.term,
                                    academicYear: bulletin.academicYear,
                                    hasSignature
                                  }];
                                  setSelectedBulletinsForSigning(bulletinForSigning);
                                  setShowBulkSignatureModal(true);
                                }}
                                data-testid={`individual-sign-bulletin-${bulletin.id}`}
                              >
                                <FileSignature className="h-4 w-4 mr-1" />
                                {hasSignature ? 'Re-signer' : 'Signer'}
                              </Button>
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
        )}

        {/* Sent Bulletins Tab */}
        {mountedTabs.has('sent-bulletins') && (
          <TabsContent value="sent-bulletins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileDown className="h-5 w-5 text-blue-500" />
                {t.sentBulletins} ({sentBulletins?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSent ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>{t.loading}</span>
                </div>
              ) : !sentBulletins || sentBulletins.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun bulletin envoyé</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentBulletins.map((bulletin: any) => (
                    <Card key={bulletin.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="font-semibold">
                              {bulletin.studentFirstName} {bulletin.studentLastName}
                            </h4>
                            <div className="text-sm text-muted-foreground">
                              <span>{bulletin.className} - {bulletin.term} - {bulletin.academicYear}</span>
                              {bulletin.sentAt && (
                                <div className="text-xs mt-1">
                                  Envoyé le: {new Date(bulletin.sentAt).toLocaleDateString('fr-FR')}
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                              <FileDown className="h-3 w-3 mr-1" />
                              {t.sentToParents}
                            </Badge>
                            
                            {/* Statut Distribution - Badges colorés pour chaque canal */}
                            <div className="mt-2">
                              <div className="text-xs text-muted-foreground mb-1">Statut Distribution:</div>
                              <div className="flex flex-wrap gap-1">
                                {/* Email Status Badge */}
                                {bulletin.notificationsSent?.email ? (
                                  bulletin.notificationsSent.email.sent ? (
                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Email ✅
                                    </Badge>
                                  ) : bulletin.notificationsSent.email.error ? (
                                    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                                      <X className="h-3 w-3 mr-1" />
                                      Email ❌
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                                      <Clock className="h-3 w-3 mr-1" />
                                      Email ⏳
                                    </Badge>
                                  )
                                ) : (
                                  <Badge variant="outline" className="text-gray-500 border-gray-200">
                                    Email -
                                  </Badge>
                                )}
                                
                                {/* SMS Status Badge */}
                                {bulletin.notificationsSent?.sms ? (
                                  bulletin.notificationsSent.sms.sent ? (
                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      SMS ✅
                                    </Badge>
                                  ) : bulletin.notificationsSent.sms.error ? (
                                    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                                      <X className="h-3 w-3 mr-1" />
                                      SMS ❌
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                                      <Clock className="h-3 w-3 mr-1" />
                                      SMS ⏳
                                    </Badge>
                                  )
                                ) : (
                                  <Badge variant="outline" className="text-gray-500 border-gray-200">
                                    SMS -
                                  </Badge>
                                )}
                                
                                {/* WhatsApp Status Badge */}
                                {bulletin.notificationsSent?.whatsapp ? (
                                  bulletin.notificationsSent.whatsapp.sent ? (
                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      WhatsApp ✅
                                    </Badge>
                                  ) : bulletin.notificationsSent.whatsapp.error ? (
                                    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                                      <X className="h-3 w-3 mr-1" />
                                      WhatsApp ❌
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                                      <Clock className="h-3 w-3 mr-1" />
                                      WhatsApp ⏳
                                    </Badge>
                                  )
                                ) : (
                                  <Badge variant="outline" className="text-gray-500 border-gray-200">
                                    WhatsApp -
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                data-testid={`view-sent-bulletin-${bulletin.id}`}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                {t.viewDetails}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                data-testid={`download-bulletin-${bulletin.id}`}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                PDF
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-purple-600 border-purple-200 hover:bg-purple-50"
                              onClick={() => handleViewDistributionStatus(bulletin.id)}
                              data-testid={`view-distribution-status-${bulletin.id}`}
                            >
                              <BarChart3 className="h-4 w-4 mr-1" />
                              Voir Détails Distribution
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          </TabsContent>
        )}

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.previewTitle}</DialogTitle>
            <DialogDescription>
              {t.previewDescription}
            </DialogDescription>
          </DialogHeader>
          
          <>
            {loadingPreview ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>{t.loadingPreview}</span>
              </div>
            ) : previewData ? (
              <div className="space-y-4">
                {/* Student Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Informations Étudiant</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Nom:</span> {previewData.studentName}</div>
                    <div><span className="font-medium">Classe:</span> {previewData.className}</div>
                    <div><span className="font-medium">Matricule:</span> {previewData.matricule}</div>
                    <div><span className="font-medium">Période:</span> {previewData.term}</div>
                  </div>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-2 p-4 border-b">
                  <span className="text-sm font-medium">Zoom:</span>
                  <Button variant="outline" size="sm" onClick={() => setCanvasZoom(Math.max(0.1, canvasZoom - 0.1))}>
                    <span className="text-xs">-</span>
                  </Button>
                  <span className="text-sm min-w-[60px] text-center">{Math.round(canvasZoom * 100)}%</span>
                  <Button variant="outline" size="sm" onClick={() => setCanvasZoom(canvasZoom + 0.1)}>
                    <span className="text-xs">+</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCanvasZoom(1)}>
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
                        
                <div 
                        className="w-full h-full overflow-auto p-8 pt-16"
                        style={{ 
                          backgroundImage: 'radial-gradient(circle, #e5e5e5 1px, transparent 1px)',
                          backgroundSize: '20px 20px'
                        }}
                      >
                        <div
                          className="mx-auto bg-white shadow-lg border relative"
                          style={{
                            width: canvasSize.width * canvasZoom,
                            height: canvasSize.height * canvasZoom,
                            transform: `scale(${canvasZoom})`,
                            transformOrigin: 'top left'
                          }}
                          data-testid="design-canvas-area"
                        >
                          {/* Canvas Drop Zone */}
                          <div 
                            id="canvas-drop-zone"
                            className="w-full h-full relative"
                            onDrop={(e) => {
                              e.preventDefault();
                              const elementType = e.dataTransfer.getData('text/plain');
                              if (elementType) {
                                // Calculate position relative to canvas
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = (e.clientX - rect.left) / canvasZoom;
                                const y = (e.clientY - rect.top) / canvasZoom;
                                
                                const newElement: TemplateElement = {
                                  id: generateElementId(),
                                  type: elementType,
                                  category: getCategoryForType(elementType),
                                  position: { x, y, width: 200, height: 40 },
                                  properties: {
                                    fontSize: 12,
                                    fontFamily: 'Arial',
                                    color: '#374151',
                                    backgroundColor: 'transparent',
                                    label: getElementDisplayName(elementType),
                                    visible: true
                                  },
                                  zIndex: templateElements.length + 1
                                };
                                
                                setTemplateElements(prev => [...prev, newElement]);
                                setSelectedElement(newElement.id);
                              }
                            }}
                            onDragOver={(e) => e.preventDefault()}
                          >
                            {/* Render template elements with SortableContext */}
                            <SortableContext items={templateElements.map(el => el.id)} strategy={verticalListSortingStrategy}>
                              {templateElements.map((element) => (
                                <SortableTemplateElement
                                  key={element.id}
                                  element={element}
                                  isSelected={selectedElement === element.id}
                                  onSelect={() => setSelectedElement(element.id)}
                                  getElementDisplayName={getElementDisplayName}
                                />
                              ))}
                            </SortableContext>
                            
                            {/* Grid overlay */}
                            {showGrid && (
                              <div className="absolute inset-0 pointer-events-none opacity-20">
                                <svg width="100%" height="100%">
                                  <defs>
                                    <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                                      <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="#e5e5e5" strokeWidth="1"/>
                                    </pattern>
                                  </defs>
                                  <rect width="100%" height="100%" fill="url(#grid)" />
                                </svg>
                              </div>
                            )}
                            
                            {/* Alignment guides overlay */}
                            {showGuides && alignmentGuides.length > 0 && (
                              <div className="absolute inset-0 pointer-events-none">
                                <svg width="100%" height="100%">
                                  {alignmentGuides.map((guide, index) => (
                                    <g key={index}>
                                      {guide.x !== undefined && (
                                        <line
                                          x1={guide.x}
                                          y1="0"
                                          x2={guide.x}
                                          y2="100%"
                                          stroke="#3b82f6"
                                          strokeWidth="1"
                                          strokeDasharray="4,4"
                                        />
                                      )}
                                      {guide.y !== undefined && (
                                        <line
                                          x1="0"
                                          y1={guide.y}
                                          x2="100%"
                                          y2={guide.y}
                                          stroke="#3b82f6"
                                          strokeWidth="1"
                                          strokeDasharray="4,4"
                                        />
                                      )}
                                    </g>
                                  ))}
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {t.noPreviewData}
                  </div>
                )}
                <>
                <DragOverlay>
                    {draggedElement ? (
                      <div className="bg-blue-100 border-2 border-blue-300 p-2 rounded shadow-lg">
                        {getElementDisplayName(draggedElement)}
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>

                {/* Template Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleNewTemplate} data-testid="new-template-btn">
                      <Plus className="h-4 w-4 mr-2" />
                      {t.createNewTemplate}
                    </Button>
                    <Button variant="outline" onClick={handleLoadTemplate} data-testid="load-template-btn">
                      <FileText className="h-4 w-4 mr-2" />
                      Charger modèle
                    </Button>
                    {/* Undo/Redo buttons */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleUndo} 
                      disabled={historyIndex <= 0}
                      data-testid="undo-btn"
                      title="Annuler (Ctrl+Z)"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleRedo} 
                      disabled={historyIndex >= templateHistory.length - 1}
                      data-testid="redo-btn"
                      title="Refaire (Ctrl+Y)"
                    >
                      <RotateCcw className="h-4 w-4 scale-x-[-1]" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePreviewTemplate} data-testid="preview-template-btn">
                      <Eye className="h-4 w-4 mr-2" />
                      Aperçu
                    </Button>
                    <Button onClick={handleSaveTemplate} data-testid="save-template-btn">
                      <Save className="h-4 w-4 mr-2" />
                      {t.saveTemplate}
                    </Button>
                  </div>
                </div>
                </>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* ===== REPORTS TAB ===== */}
        {mountedTabs.has('reports') && (
          <TabsContent value="reports" className="space-y-4">
            <Suspense fallback={
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Rapports et Statistiques
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Chargement des rapports et statistiques...
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="animate-pulse bg-gray-200 rounded-lg flex items-center justify-center" style={{ height: 400 }}>
                    <div className="text-gray-500 flex items-center gap-2">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                      <span>Chargement des rapports...</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            }>
              <ReportsTab
                reportFilters={reportFilters}
                handleFilterChange={handleFilterChange}
                classes={classes}
                overviewReport={overviewReport}
                distributionStats={distributionStats}
                timelineReport={timelineReport}
                loadingOverview={loadingOverview}
                loadingDistribution={loadingDistribution}
                loadingTimelineReport={loadingTimelineReport}
                exportingReport={exportingReport}
                handleExportReport={handleExportReport}
              />
            </Suspense>
          </TabsContent>
        )}

        {/* ===== STATISTICS TAB ===== */}
        {mountedTabs.has('statistics') && (
          <TabsContent value="statistics" className="space-y-4">
            <Suspense fallback={
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Rapports et Statistiques
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Chargement des rapports et statistiques...
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="animate-pulse bg-gray-200 rounded-lg flex items-center justify-center" style={{ height: 400 }}>
                    <div className="text-gray-500 flex items-center gap-2">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                      <span>Chargement des rapports...</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            }>
              <ReportsTab
                reportFilters={reportFilters}
                handleFilterChange={handleFilterChange}
                classes={classes}
                overviewReport={overviewReport}
                distributionStats={distributionStats}
                timelineReport={timelineReport}
                loadingOverview={loadingOverview}
                loadingDistribution={loadingDistribution}
                loadingTimelineReport={loadingTimelineReport}
                exportingReport={exportingReport}
                handleExportReport={handleExportReport}
              />
            </Suspense>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
                                    </div>
                                    <div>
                                      <Label className="text-xs">{t.height}</Label>
                                      <Input
                                        type="number"
                                        value={element.position.height}
                                        onChange={(e) => handleUpdateElement(element.id, {
                                          position: { ...element.position, height: parseInt(e.target.value) || 40 }
                                        })}
                                        className="h-7 text-xs"
                                      />
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label className="text-xs font-semibold text-gray-700">{t.content}</Label>
                                  <Input
                                    value={element.properties.label || ''}
                                    onChange={(e) => handleUpdateElement(element.id, {
                                      properties: { ...element.properties, label: e.target.value }
                                    })}
                                    className="h-7 text-xs mt-1"
                                    placeholder="Texte à afficher..."
                                  />
                                </div>
                                
                                <div>
                                  <Label className="text-xs font-semibold text-gray-700">{t.style}</Label>
                                  <div className="space-y-2 mt-1">
                                    <div>
                                      <Label className="text-xs">{t.fontSize}</Label>
                                      <Input
                                        type="number"
                                        value={element.properties.fontSize || 12}
                                        onChange={(e) => handleUpdateElement(element.id, {
                                          properties: { ...element.properties, fontSize: parseInt(e.target.value) || 12 }
                                        })}
                                        className="h-7 text-xs"
                                        min="8"
                                        max="72"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">{t.color}</Label>
                                      <Input
                                        type="color"
                                        value={element.properties.color || '#374151'}
                                        onChange={(e) => handleUpdateElement(element.id, {
                                          properties: { ...element.properties, color: e.target.value }
                                        })}
                                        className="h-7 w-full"
                                      />
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="pt-2 border-t">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      setTemplateElements(prev => prev.filter(el => el.id !== element.id));
                                      setSelectedElement(null);
                                      
                                      toast({
                                        title: 'Élément supprimé',
                                        description: 'L\'élément a été retiré du modèle'
                                      });
                                    }}
                                    className="w-full"
                                    data-testid="delete-element-btn"
                                  >
                                    <Trash2 className="h-3 w-3 mr-2" />
                                    Supprimer
                                  </Button>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Square className="h-12 w-12 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">Sélectionnez un élément pour modifier ses propriétés</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>

                  {/* Drag Overlay */}
                  <DragOverlay>
                    {draggedElement ? (
                      <div className="bg-blue-100 border-2 border-blue-300 p-2 rounded shadow-lg">
                        {getElementDisplayName(draggedElement)}
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>

                {/* Template Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleNewTemplate} data-testid="new-template-btn">
                      <Plus className="h-4 w-4 mr-2" />
                      {t.createNewTemplate}
                    </Button>
                    <Button variant="outline" onClick={handleLoadTemplate} data-testid="load-template-btn">
                      <FileText className="h-4 w-4 mr-2" />
                      Charger modèle
                    </Button>
                    {/* Undo/Redo buttons */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleUndo} 
                      disabled={historyIndex <= 0}
                      data-testid="undo-btn"
                      title="Annuler (Ctrl+Z)"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleRedo} 
                      disabled={historyIndex >= templateHistory.length - 1}
                      data-testid="redo-btn"
                      title="Refaire (Ctrl+Y)"
                    >
                      <RotateCcw className="h-4 w-4 scale-x-[-1]" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePreviewTemplate} data-testid="preview-template-btn">
                      <Eye className="h-4 w-4 mr-2" />
                      Aperçu
                    </Button>
                    <Button onClick={handleSaveTemplate} data-testid="save-template-btn">
                      <Save className="h-4 w-4 mr-2" />
                      {t.saveTemplate}
                    </Button>
                  </div>
                </div>
                </>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* ===== REPORTS TAB ===== */}
        {mountedTabs.has('reports') && (
          <TabsContent value="reports" className="space-y-4">
            <Suspense fallback={
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Rapports et Statistiques
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Chargement des rapports et statistiques...
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="animate-pulse bg-gray-200 rounded-lg flex items-center justify-center" style={{ height: 400 }}>
                    <div className="text-gray-500 flex items-center gap-2">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                      <span>Chargement des rapports...</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            }>
              <ReportsTab
                reportFilters={reportFilters}
                handleFilterChange={handleFilterChange}
                classes={classes}
                overviewReport={overviewReport}
                distributionStats={distributionStats}
                timelineReport={timelineReport}
                loadingOverview={loadingOverview}
                loadingDistribution={loadingDistribution}
                loadingTimelineReport={loadingTimelineReport}
                exportingReport={exportingReport}
                handleExportReport={handleExportReport}
                refetchOverview={refetchOverview}
              />
            </Suspense>
          </TabsContent>
        )}
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.previewTitle}</DialogTitle>
            <DialogDescription>
              {t.previewDescription}
            </DialogDescription>
          </DialogHeader>
          
          {loadingPreview ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>{t.loadingPreview}</span>
            </div>
          ) : previewData ? (
            <div className="space-y-4">
              {/* Student Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold">{t.studentInfo}</h3>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>{t.name}: {previewData.student.firstName} {previewData.student.lastName}</div>
                  <div>{t.class}: {previewData.student.className}</div>
                  <div>{t.studentId}: {previewData.student.matricule}</div>
                  <div>{t.average}: {previewData.overallAverage?.toFixed(2)}/20</div>
                </div>
              </div>
              
              {/* Grades Preview */}
              <div className="space-y-2">
                <h3 className="font-semibold">{t.approvedGrades}</h3>
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
              {t.noPreviewData}
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
                  <h4 className="text-sm font-semibold text-red-600">{t.errors}:</h4>
                  {generationProgress.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              )}
              
              {generationProgress.downloadUrls.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-green-600">{t.downloadsReady}:</h4>
                  {generationProgress.downloadUrls.map((url, index) => (
                    <Button
                      key={index}
                      onClick={() => window.open(url, '_blank')}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t.downloadBulletin} {index + 1}
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
        <AlertDialogContent className="bg-white dark:bg-gray-900 border shadow-lg">
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

      {/* Load Draft Dialog */}
      <Dialog open={showLoadDraftDialog} onOpenChange={setShowLoadDraftDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.loadDraftDialogTitle}</DialogTitle>
            <DialogDescription>
              {t.loadDraftDialogDescription}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {availableDrafts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t.noDraftsFound}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>{t.selectDraftToLoad}</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableDrafts.map((draft, index) => (
                    <Card
                      key={draft.key}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleLoadSelectedDraft(draft.key)}
                      data-testid={`draft-option-${index}`}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-sm">
                              {draft.studentName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {draft.term} - {draft.classId}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {draft.date}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoadDraftDialog(false)}>
              {t.cancel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Form Confirmation Dialog */}
      <AlertDialog open={showResetConfirmDialog} onOpenChange={setShowResetConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.resetConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.resetConfirmMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmResetFormData} data-testid="confirm-reset">
              {t.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* NOUVEAU : Distribution Status Details Dialog */}
      <Dialog open={showDistributionDialog} onOpenChange={setShowDistributionDialog}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Détails de Distribution - Bulletin #{selectedBulletinForDistribution}
            </DialogTitle>
            <DialogDescription>
              Statut détaillé des envois de notifications par destinataire et par canal
            </DialogDescription>
          </DialogHeader>
          
          {loadingDistributionStatus ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <span className="text-lg">Chargement du statut de distribution...</span>
            </div>
          ) : distributionStatus ? (
            <div className="space-y-6">
              {/* Bulletin Info Header */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-blue-800">Étudiant:</span>
                    <div className="text-blue-700">{distributionStatus.bulletinInfo.studentName}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-800">Classe:</span>
                    <div className="text-blue-700">{distributionStatus.bulletinInfo.className}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-800">Période:</span>
                    <div className="text-blue-700">{distributionStatus.bulletinInfo.term} {distributionStatus.bulletinInfo.academicYear}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-800">Moyenne:</span>
                    <div className="text-blue-700">{distributionStatus.bulletinInfo.generalAverage}/20</div>
                  </div>
                </div>
              </div>

              {/* Global Summary - Nouveau Format */}
              {distributionStatus.distributionTracking.format === 'perRecipient' && distributionStatus.distributionTracking.globalSummary && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-3">📊 Résumé Global (Format Amélioré)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{distributionStatus.distributionTracking.globalSummary.totalRecipients}</div>
                      <div className="text-green-700">Destinataires</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{distributionStatus.distributionTracking.globalSummary.totalNotificationsSent}</div>
                      <div className="text-green-700">Envois Réussis</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{distributionStatus.distributionTracking.globalSummary.totalNotificationsFailed}</div>
                      <div className="text-red-700">Envois Échoués</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{distributionStatus.distributionTracking.globalSummary.overallSuccessRate}%</div>
                      <div className="text-blue-700">Taux de Succès</div>
                    </div>
                  </div>
                  {distributionStatus.distributionTracking.globalSummary.failedRecipients.length > 0 && (
                    <div className="mt-3 p-2 bg-red-100 rounded">
                      <span className="text-red-800 font-semibold">Destinataires en échec: </span>
                      <span className="text-red-700">{distributionStatus.distributionTracking.globalSummary.failedRecipients.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Channel Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Email Channel */}
                <Card className="border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Database className="h-4 w-4 text-blue-600" />
                      📧 Email
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Configuré:</span>
                        <span className={distributionStatus.distributionTracking.channels.email.configured ? 'text-green-600' : 'text-gray-500'}>
                          {distributionStatus.distributionTracking.channels.email.configured ? '✅' : '➖'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span>{distributionStatus.distributionTracking.channels.email.totalRecipients}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Réussis:</span>
                        <span className="text-green-600 font-semibold">{distributionStatus.distributionTracking.channels.email.successCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Échoués:</span>
                        <span className="text-red-600 font-semibold">{distributionStatus.distributionTracking.channels.email.failedCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taux:</span>
                        <span className="font-semibold">{distributionStatus.distributionTracking.channels.email.successRate}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* SMS Channel */}
                <Card className="border-orange-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Database className="h-4 w-4 text-orange-600" />
                      📱 SMS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Configuré:</span>
                        <span className={distributionStatus.distributionTracking.channels.sms.configured ? 'text-green-600' : 'text-gray-500'}>
                          {distributionStatus.distributionTracking.channels.sms.configured ? '✅' : '➖'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span>{distributionStatus.distributionTracking.channels.sms.totalRecipients}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Réussis:</span>
                        <span className="text-green-600 font-semibold">{distributionStatus.distributionTracking.channels.sms.successCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Échoués:</span>
                        <span className="text-red-600 font-semibold">{distributionStatus.distributionTracking.channels.sms.failedCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taux:</span>
                        <span className="font-semibold">{distributionStatus.distributionTracking.channels.sms.successRate}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* WhatsApp Channel */}
                <Card className="border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Database className="h-4 w-4 text-green-600" />
                      💬 WhatsApp
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Configuré:</span>
                        <span className={distributionStatus.distributionTracking.channels.whatsapp.configured ? 'text-green-600' : 'text-gray-500'}>
                          {distributionStatus.distributionTracking.channels.whatsapp.configured ? '✅' : '➖'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span>{distributionStatus.distributionTracking.channels.whatsapp.totalRecipients}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Réussis:</span>
                        <span className="text-green-600 font-semibold">{distributionStatus.distributionTracking.channels.whatsapp.successCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Échoués:</span>
                        <span className="text-red-600 font-semibold">{distributionStatus.distributionTracking.channels.whatsapp.failedCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taux:</span>
                        <span className="font-semibold">{distributionStatus.distributionTracking.channels.whatsapp.successRate}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Recipients Status - Nouveau Format */}
              {distributionStatus.distributionTracking.format === 'perRecipient' && distributionStatus.distributionTracking.recipientDetails && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-lg">📋 Statuts par Destinataire (Nouveau Format Détaillé)</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(distributionStatus.distributionTracking.recipientDetails).map(([recipientId, recipientData]: [string, any]) => (
                      <Card key={recipientId} className="border-purple-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <User className="h-4 w-4 text-purple-600" />
                              Destinataire: {recipientId}
                            </span>
                            <span className="text-xs text-gray-500">
                              Dernière mise à jour: {recipientData.lastUpdated ? new Date(recipientData.lastUpdated).toLocaleString('fr-FR') : 'N/A'}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Email Status for this recipient */}
                            {recipientData.email && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-blue-600">📧 Email</h4>
                                <div className="space-y-1">
                                  {renderRecipientStatusBadge(recipientData.email.status, recipientData.email.sent, recipientData.email.error)}
                                  {recipientData.email.sentAt && (
                                    <div className="text-xs text-gray-600">Envoyé: {new Date(recipientData.email.sentAt).toLocaleString('fr-FR')}</div>
                                  )}
                                  {recipientData.email.attempts > 0 && (
                                    <div className="text-xs text-gray-600">Tentatives: {recipientData.email.attempts}</div>
                                  )}
                                  {recipientData.email.error && (
                                    <div className="text-xs text-red-600 bg-red-50 p-1 rounded">Erreur: {recipientData.email.error}</div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* SMS Status for this recipient */}
                            {recipientData.sms && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-orange-600">📱 SMS</h4>
                                <div className="space-y-1">
                                  {renderRecipientStatusBadge(recipientData.sms.status, recipientData.sms.sent, recipientData.sms.error)}
                                  {recipientData.sms.sentAt && (
                                    <div className="text-xs text-gray-600">Envoyé: {new Date(recipientData.sms.sentAt).toLocaleString('fr-FR')}</div>
                                  )}
                                  {recipientData.sms.attempts > 0 && (
                                    <div className="text-xs text-gray-600">Tentatives: {recipientData.sms.attempts}</div>
                                  )}
                                  {recipientData.sms.error && (
                                    <div className="text-xs text-red-600 bg-red-50 p-1 rounded">Erreur: {recipientData.sms.error}</div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* WhatsApp Status for this recipient */}
                            {recipientData.whatsapp && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-green-600">💬 WhatsApp</h4>
                                <div className="space-y-1">
                                  {renderRecipientStatusBadge(recipientData.whatsapp.status, recipientData.whatsapp.sent, recipientData.whatsapp.error)}
                                  {recipientData.whatsapp.sentAt && (
                                    <div className="text-xs text-gray-600">Envoyé: {new Date(recipientData.whatsapp.sentAt).toLocaleString('fr-FR')}</div>
                                  )}
                                  {recipientData.whatsapp.attempts > 0 && (
                                    <div className="text-xs text-gray-600">Tentatives: {recipientData.whatsapp.attempts}</div>
                                  )}
                                  {recipientData.whatsapp.error && (
                                    <div className="text-xs text-red-600 bg-red-50 p-1 rounded">Erreur: {recipientData.whatsapp.error}</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Recipient Summary */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-600">
                              Total tentatives pour ce destinataire: {recipientData.totalAttempts || 0}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Legacy Format Compatibility */}
              {distributionStatus.distributionTracking.format === 'legacy' && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">Mode de Compatibilité Legacy</span>
                  </div>
                  <p className="text-yellow-700 text-sm mb-3">
                    Ce bulletin utilise l'ancien format de tracking. Les détails par destinataire ne sont pas disponibles.
                  </p>
                  <div className="text-sm text-yellow-700">
                    Format détaillé sera disponible après migration vers le nouveau système de tracking.
                  </div>
                </div>
              )}

              {/* Technical Info */}
              <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-3 w-3" />
                  <span className="font-semibold">Informations Techniques</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>Format: {distributionStatus.distributionTracking.format}</div>
                  <div>Dernière mise à jour: {distributionStatus.distributionTracking.lastUpdated ? new Date(distributionStatus.distributionTracking.lastUpdated).toLocaleString('fr-FR') : 'N/A'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Aucune donnée de distribution disponible</p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={() => {
                setShowDistributionDialog(false);
                setDistributionStatus(null);
                setSelectedBulletinForDistribution(null);
              }}
              className="w-full"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Signature Modal */}
      <BulkSignatureModal
        isOpen={showBulkSignatureModal}
        onClose={() => {
          setShowBulkSignatureModal(false);
          setSelectedBulletinsForSigning([]);
        }}
        selectedBulletins={selectedBulletinsForSigning}
        onSignatureComplete={(results) => {
          console.log('[BULK_SIGNATURE_COMPLETED] ✅ Signature results:', results);
          
          // Refresh the approved bulletins query to show updated signature status
          queryClient.invalidateQueries({ queryKey: ['/api/comprehensive-bulletins/approved-students'] });
          
          // Clear selection after successful signature
          setSelectedBulletins([]);
          setSelectAll(false);
          setSelectedBulletinsForSigning([]);
          setShowBulkSignatureModal(false);
          
          // Show success message
          toast({
            title: 'Signatures appliquées',
            description: `${results.summary?.successfullySigned || 0} bulletin(s) signé(s) avec succès`,
          });
        }}
        directorName={`Director`} // You can customize this based on user data
      />
    </div>
  );
}
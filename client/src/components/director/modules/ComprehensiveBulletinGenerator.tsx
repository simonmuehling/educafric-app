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
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
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
  Activity,
  Target,
  Zap,
  Mail,
  MessageSquare,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  History,
  CalendarDays,
  Timer,
  Users2,
  TrendingDown,
  Plus,
  Pencil
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

// Labels bilingues pour l'interface
const BILINGUAL_LABELS = {
  fr: {
    // Navigation et tabs
    comprehensiveBulletinGenerator: 'Générateur de Bulletins Complet',
    classSelection: 'Sélection de Classe',
    studentManagement: 'Gestion des Élèves',
    manualDataEntry: 'Saisie Manuelle',
    generationOptions: 'Options de Génération',
    bulkOperations: 'Opérations en Lot',
    pendingBulletins: 'Bulletins en Attente',
    approvedBulletins: 'Bulletins Approuvés',
    reports: 'Rapports',
    
    // Sélecteurs et options
    language: 'Langue',
    selectClass: 'Sélectionner une classe',
    selectTerm: 'Sélectionner le trimestre',
    academicYear: 'Année scolaire',
    trimester: 'Trimestre',
    firstTrimester: 'Premier Trimestre',
    secondTrimester: 'Deuxième Trimestre',
    thirdTrimester: 'Troisième Trimestre',
    
    // Actions
    generateBulletins: 'Générer les Bulletins',
    previewBulletin: 'Aperçu du Bulletin',
    downloadBulletin: 'Télécharger le Bulletin',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    reset: 'Réinitialiser',
    selectAll: 'Tout sélectionner',
    refresh: 'Actualiser',
    
    // Informations étudiant
    studentInfo: 'Informations de l\'Élève',
    firstName: 'Nom & Prénoms',
    lastName: 'Nom de famille',
    class: 'Classe',
    matricule: 'Matricule',
    birthDate: 'Date de naissance',
    
    // Notes et évaluations
    grades: 'Notes',
    subjects: 'Matières',
    coefficient: 'Coefficient',
    average: 'Moyenne',
    generalAverage: 'Moyenne générale',
    classRank: 'Rang',
    
    // Options de génération
    includeComments: 'Inclure les commentaires',
    includeRankings: 'Inclure les classements',
    includeStatistics: 'Inclure les statistiques',
    includePerformanceLevels: 'Inclure les niveaux de performance',
    
    // Sections
    absencesAndLateness: 'Absences et Retards',
    disciplinarySanctions: 'Sanctions Disciplinaires',
    averagesAndTotals: 'Moyennes et Totaux',
    coefficientsAndCodes: 'Coefficients et Codes',
    appreciationsAndSignatures: 'Appréciations et Signatures',
    classCouncil: 'Conseil de Classe',
    
    // Messages
    noDataAvailable: 'Aucune donnée disponible',
    loadingData: 'Chargement des données...',
    generationInProgress: 'Génération en cours...',
    operationSuccessful: 'Opération réussie',
    errorOccurred: 'Une erreur s\'est produite',
    
    // Statuts
    pending: 'En attente',
    approved: 'Approuvé',
    rejected: 'Rejeté',
    draft: 'Brouillon',
    submitted: 'Soumis',
    signed: 'Signé',
    sent: 'Envoyé',
    
    // Messages système
    error: 'Erreur',
    success: 'Succès',
    warning: 'Avertissement',
    info: 'Information',
    
    // Actions détaillées
    viewDetails: 'Voir les détails',
    edit: 'Modifier',
    delete: 'Supprimer',
    close: 'Fermer',
    confirm: 'Confirmer',
    
    // Titres et sections
    title: 'Générateur de Bulletins Complet',
    subtitle: 'Gérez la génération complète des bulletins scolaires',
    
    // Formulaires
    draftSaved: 'Brouillon sauvegardé',
    formReset: 'Formulaire réinitialisé',
    noDraftsFound: 'Aucun brouillon trouvé',
    
    // Génération
    generationSuccess: 'Génération réussie',
    generationError: 'Erreur de génération',
    generating: 'Génération en cours',
    progress: 'Progression',
    currentStudent: 'Élève actuel',
    errors: 'Erreurs',
    downloadsReady: 'Téléchargements prêts',
    
    // Sélections
    noClassSelected: 'Aucune classe sélectionnée',
    noStudentsSelected: 'Aucun élève sélectionné',
    
    // Statistiques
    classStatistics: 'Statistiques de la classe',
    totalStudents: 'Total élèves',
    completionRate: 'Taux de completion',
    
    // Email
    emailSent: 'Email envoyé',
    emailFailed: 'Échec email',
    
    // Dialogues
    previewTitle: 'Aperçu du bulletin',
    previewDescription: 'Prévisualisation du bulletin avant génération',
    loadingPreview: 'Chargement de l\'aperçu...',
    noPreviewData: 'Aucune donnée d\'aperçu disponible',
    confirmGeneration: 'Confirmer la génération',
    confirmationMessage: 'Voulez-vous générer {count} bulletins ?',
    loadDraftDialogTitle: 'Charger un brouillon',
    loadDraftDialogDescription: 'Sélectionnez un brouillon à charger',
    
    // Données additionnelles
    name: 'Nom',
    studentId: 'ID Élève',
    sentBulletins: 'Bulletins Envoyés',
    sanctionsDisciplinaires: 'Sanctions Disciplinaires'
  },
  
  en: {
    // Navigation et tabs
    comprehensiveBulletinGenerator: 'Comprehensive Bulletin Generator',
    classSelection: 'Class Selection',
    studentManagement: 'Student Management',
    manualDataEntry: 'Manual Data Entry',
    generationOptions: 'Generation Options',
    bulkOperations: 'Bulk Operations',
    pendingBulletins: 'Pending Bulletins',
    approvedBulletins: 'Approved Bulletins',
    reports: 'Reports',
    
    // Sélecteurs et options
    language: 'Language',
    selectClass: 'Select a class',
    selectTerm: 'Select term',
    academicYear: 'Academic year',
    trimester: 'Term',
    firstTrimester: 'First Term',
    secondTrimester: 'Second Term',
    thirdTrimester: 'Third Term',
    
    // Actions
    generateBulletins: 'Generate Bulletins',
    previewBulletin: 'Preview Bulletin',
    downloadBulletin: 'Download Bulletin',
    save: 'Save',
    cancel: 'Cancel',
    reset: 'Reset',
    selectAll: 'Select All',
    refresh: 'Refresh',
    
    // Informations étudiant
    studentInfo: 'Student Information',
    firstName: 'First & Last Name',
    lastName: 'Last Name',
    class: 'Class',
    matricule: 'Student ID',
    birthDate: 'Birth Date',
    
    // Notes et évaluations
    grades: 'Grades',
    subjects: 'Subjects',
    coefficient: 'Coefficient',
    average: 'Average',
    generalAverage: 'General Average',
    classRank: 'Rank',
    
    // Options de génération
    includeComments: 'Include comments',
    includeRankings: 'Include rankings',
    includeStatistics: 'Include statistics',
    includePerformanceLevels: 'Include performance levels',
    
    // Sections
    absencesAndLateness: 'Absences and Lateness',
    disciplinarySanctions: 'Disciplinary Sanctions',
    averagesAndTotals: 'Averages and Totals',
    coefficientsAndCodes: 'Coefficients and Codes',
    appreciationsAndSignatures: 'Appreciations and Signatures',
    classCouncil: 'Class Council',
    
    // Messages
    noDataAvailable: 'No data available',
    loadingData: 'Loading data...',
    generationInProgress: 'Generation in progress...',
    operationSuccessful: 'Operation successful',
    errorOccurred: 'An error occurred',
    
    // Statuts
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    draft: 'Draft',
    submitted: 'Submitted',
    signed: 'Signed',
    sent: 'Sent',
    
    // Messages système
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    
    // Actions détaillées
    viewDetails: 'View details',
    edit: 'Edit',
    delete: 'Delete',
    close: 'Close',
    confirm: 'Confirm',
    
    // Titres et sections
    title: 'Comprehensive Bulletin Generator',
    subtitle: 'Manage complete school bulletin generation',
    
    // Formulaires
    draftSaved: 'Draft saved',
    formReset: 'Form reset',
    noDraftsFound: 'No drafts found',
    
    // Génération
    generationSuccess: 'Generation successful',
    generationError: 'Generation error',
    generating: 'Generating',
    progress: 'Progress',
    currentStudent: 'Current student',
    errors: 'Errors',
    downloadsReady: 'Downloads ready',
    
    // Sélections
    noClassSelected: 'No class selected',
    noStudentsSelected: 'No students selected',
    
    // Statistiques
    classStatistics: 'Class statistics',
    totalStudents: 'Total students',
    completionRate: 'Completion rate',
    
    // Email
    emailSent: 'Email sent',
    emailFailed: 'Email failed',
    
    // Dialogues
    previewTitle: 'Bulletin preview',
    previewDescription: 'Preview bulletin before generation',
    loadingPreview: 'Loading preview...',
    noPreviewData: 'No preview data available',
    confirmGeneration: 'Confirm generation',
    confirmationMessage: 'Do you want to generate {count} bulletins?',
    loadDraftDialogTitle: 'Load draft',
    loadDraftDialogDescription: 'Select a draft to load',
    
    // Données additionnelles
    name: 'Name',
    studentId: 'Student ID',
    sentBulletins: 'Sent Bulletins',
    sanctionsDisciplinaires: 'Disciplinary Sanctions'
  }
};

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
  templateType: 'standard' | 'cameroon_official_compact';
  
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
  // Student Identity (for Cameroon official template)
  studentGender: z.enum(['M', 'F']).optional(),
  studentDateOfBirth: z.string().optional().refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), "Must be a valid date format (YYYY-MM-DD)"),
  studentPlaceOfBirth: z.string().optional().refine((val) => !val || val.trim().length > 0, "Place of birth cannot be empty"),
  studentNationality: z.string().optional().refine((val) => !val || val.trim().length > 0, "Nationality cannot be empty"),
  schoolRegion: z.string().optional().refine((val) => !val || val.trim().length > 0, "Region cannot be empty"),
  schoolSubdivision: z.string().optional().refine((val) => !val || val.trim().length > 0, "Subdivision cannot be empty"),
  isRepeater: z.boolean().optional(),
  guardianPhone: z.string().optional().refine((val) => !val || /^[\+]?[1-9][\d]{0,15}$/.test(val), "Must be a valid phone number"),
  
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
  const { user } = useAuth();

  // Helper pour obtenir les labels dans la langue courante
  const t = (key: keyof typeof BILINGUAL_LABELS.fr) => BILINGUAL_LABELS[language][key];

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
  const [templateType, setTemplateType] = useState<'standard' | 'cameroon_official_compact'>('standard');
  
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
    identity: true,
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
  
  // ===== SANCTIONS DISCIPLINAIRES STATES =====
  const [selectedStudentForSanctions, setSelectedStudentForSanctions] = useState<number | null>(null);
  const [sanctionsData, setSanctionsData] = useState({
    conductWarnings: [],
    conductBlames: [],
    exclusions: [],
    permanentExclusion: null
  });
  
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
  
  // React Hook Form setup for manual data entry
  const manualDataForm = useForm<ManualDataForm>({
    resolver: zodResolver(manualDataValidationSchema),
    defaultValues: {
      // Student identity fields
      studentGender: undefined,
      studentDateOfBirth: '',
      studentPlaceOfBirth: '',
      studentNationality: '',
      schoolRegion: '',
      schoolSubdivision: '',
      isRepeater: false,
      guardianPhone: '',
      
      // Absences & Lateness
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
      classCouncilDecisions: 'Décisions du conseil de classe',
      classCouncilMentions: 'Mentions du conseil de classe',
      orientationRecommendations: 'Recommandations d\'orientation',
      councilDate: 'Date du conseil de classe',
      councilParticipants: 'Participants du conseil',
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
      noDraftsFound: 'Aucun brouillon trouvé pour cet élève',
      draftLoaded: 'Brouillon chargé avec succès',
      formReset: 'Formulaire réinitialisé',
      emailSent: 'Email envoyé avec succès',
      emailFailed: 'Échec de l\'envoi de l\'email',
      
      // Student Identity fields
      identityInformation: 'Informations d\'Identité',
      studentGender: 'Sexe',
      studentDateOfBirth: 'Date de naissance',
      studentPlaceOfBirth: 'Lieu de naissance',
      studentNationality: 'Nationalité',
      schoolRegion: 'Région de l\'école',
      schoolSubdivision: 'Subdivision de l\'école',
      isRepeater: 'Redoublant',
      guardianPhone: 'Téléphone du parent/tuteur',
      male: 'Masculin',
      female: 'Féminin',
      selectGender: 'Sélectionner le sexe',
      enterPlaceOfBirth: 'Entrer le lieu de naissance',
      enterNationality: 'Entrer la nationalité',
      enterRegion: 'Entrer la région',
      enterSubdivision: 'Entrer la subdivision',
      enterPhoneNumber: 'Entrer le numéro de téléphone',
      studentRepeatingGrade: 'Cet élève redouble cette classe',
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
      sendEmail: 'Envoyer par Email',
      sendBulkEmail: 'Envoi Emails en Masse',
      emailInProgress: 'Envoi en cours...',
      selectStudentsForEmail: 'Sélectionnez des élèves pour l\'envoi email',
      confirmEmailSend: 'Confirmer l\'envoi des emails',
      emailBulletins: 'Envoyer les Bulletins par Email',
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
      noDraftsFound: 'No drafts found for this student',
      draftLoaded: 'Draft loaded successfully',
      formReset: 'Form reset successfully',
      emailSent: 'Email sent successfully',
      emailFailed: 'Failed to send email',
      
      // Student Identity fields
      identityInformation: 'Identity Information',
      studentGender: 'Gender',
      studentDateOfBirth: 'Date of Birth',
      studentPlaceOfBirth: 'Place of Birth',
      studentNationality: 'Nationality',
      schoolRegion: 'School Region',
      schoolSubdivision: 'School Subdivision',
      isRepeater: 'Repeater',
      guardianPhone: 'Guardian Phone',
      male: 'Male',
      female: 'Female',
      selectGender: 'Select gender',
      enterPlaceOfBirth: 'Enter place of birth',
      enterNationality: 'Enter nationality',
      enterRegion: 'Enter region',
      enterSubdivision: 'Enter subdivision',
      enterPhoneNumber: 'Enter phone number',
      studentRepeatingGrade: 'This student is repeating this grade',
      
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
      selectSanctionType: 'Select a sanction type',
      sanctionReasonPlaceholder: 'Describe the reason for the sanction...',
      sanctionReasonDescription: 'Detailed description of the sanction (minimum 10 characters)',
      exclusionDaysDescription: 'Number of exclusion days (1-365 days)',
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
      sendEmail: 'Send via Email',
      sendBulkEmail: 'Send Bulk Emails',
      emailInProgress: 'Sending emails...',
      selectStudentsForEmail: 'Select students for email sending',
      confirmEmailSend: 'Confirm email sending',
      emailBulletins: 'Email Bulletins',
      viewDetails: 'View details',
      
      // Counts
      pendingCount: 'pending bulletins',
      approvedCount: 'approved bulletins',
      sentCount: 'sent bulletins'
    }
  };

  const textLabels = text[language as keyof typeof text];
  
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

  // ============= EMAIL SHARING MUTATIONS =============
  
  // Send individual bulletin via email
  const sendBulletinEmailMutation = useMutation({
    mutationFn: async (bulletinData: {
      bulletinId?: number;
      studentName: string;
      studentClass: string;
      term: string;
      academicYear: string;
      schoolName: string;
      parentEmail: string;
      bulletinPdfUrl?: string;
      schoolLogo?: string;
      teacherName?: string;
      directorName?: string;
      grades?: Array<{
        subject: string;
        grade: number;
        coefficient: number;
        appreciation?: string;
      }>;
      generalAppreciation?: string;
      rank?: number;
      totalStudents?: number;
      average?: number;
      classAverage?: number;
    }) => {
      const response = await apiRequest('POST', '/api/comprehensive-bulletins/send-email', bulletinData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t.emailSent,
        description: data.message || 'Email envoyé avec succès',
      });
      
      // Optionally refresh bulletin data
      queryClient.invalidateQueries({ queryKey: ['comprehensive-bulletins'] });
    },
    onError: (error: any) => {
      console.error('[EMAIL] Error sending bulletin email:', error);
      toast({
        title: t.emailFailed,
        description: error.message || 'Erreur lors de l\'envoi de l\'email',
        variant: 'destructive'
      });
    }
  });

  // Send bulk bulletins via email
  const sendBulkEmailMutation = useMutation({
    mutationFn: async (bulletins: Array<{
      bulletinId?: number;
      studentName: string;
      studentClass: string;
      term: string;
      academicYear: string;
      schoolName: string;
      parentEmail: string;
      bulletinPdfUrl?: string;
      schoolLogo?: string;
      teacherName?: string;
      directorName?: string;
      grades?: Array<{
        subject: string;
        grade: number;
        coefficient: number;
        appreciation?: string;
      }>;
      generalAppreciation?: string;
      rank?: number;
      totalStudents?: number;
      average?: number;
      classAverage?: number;
    }>) => {
      const response = await apiRequest('POST', '/api/comprehensive-bulletins/send-bulk-email', { bulletins });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t.emailSent,
        description: data.message || `${data.data?.successful || 0} emails envoyés avec succès`,
      });
      
      // Refresh bulletin data
      queryClient.invalidateQueries({ queryKey: ['comprehensive-bulletins'] });
    },
    onError: (error: any) => {
      console.error('[EMAIL] Error sending bulk emails:', error);
      toast({
        title: t.emailFailed,
        description: error.message || 'Erreur lors de l\'envoi des emails en masse',
        variant: 'destructive'
      });
    }
  });

  // Helper function to extract email data from bulletin
  const extractEmailDataFromBulletin = (bulletin: any) => {
    return {
      bulletinId: bulletin.id,
      studentName: bulletin.studentName || bulletin.student?.firstName + ' ' + bulletin.student?.lastName,
      studentClass: bulletin.className || bulletin.class?.name || 'Non spécifiée',
      term: bulletin.term || selectedTerm,
      academicYear: bulletin.academicYear || academicYear,
      schoolName: bulletin.schoolName || 'École',
      parentEmail: bulletin.parentEmail || bulletin.student?.parentEmail || '',
      bulletinPdfUrl: bulletin.pdfUrl,
      schoolLogo: bulletin.schoolLogo,
      teacherName: bulletin.teacherName,
      directorName: bulletin.directorName,
      grades: bulletin.grades,
      generalAppreciation: bulletin.generalAppreciation,
      rank: bulletin.rank,
      totalStudents: bulletin.totalStudents,
      average: bulletin.average,
      classAverage: bulletin.classAverage
    };
  };

  // Handle individual email send
  const handleSendEmail = (bulletin: any) => {
    const emailData = extractEmailDataFromBulletin(bulletin);
    
    if (!emailData.parentEmail) {
      toast({
        title: 'Email manquant',
        description: 'Aucune adresse email trouvée pour ce parent',
        variant: 'destructive'
      });
      return;
    }
    
    sendBulletinEmailMutation.mutate(emailData);
  };

  // Handle bulk email send
  const handleSendBulkEmails = (bulletins: any[]) => {
    const emailBulletins = bulletins
      .map(extractEmailDataFromBulletin)
      .filter(bulletin => bulletin.parentEmail); // Only include bulletins with email
    
    if (emailBulletins.length === 0) {
      toast({
        title: 'Aucun email',
        description: 'Aucune adresse email trouvée pour les bulletins sélectionnés',
        variant: 'destructive'
      });
      return;
    }
    
    if (emailBulletins.length !== bulletins.length) {
      const missing = bulletins.length - emailBulletins.length;
      toast({
        title: 'Emails manquants',
        description: `${missing} bulletin(s) n'ont pas d'adresse email et seront ignorés`,
      });
    }
    
    sendBulkEmailMutation.mutate(emailBulletins);
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
        `/api/comprehensive-bulletins/approved-students?classId=${selectedClass}&term=${selectedTerm}&academicYear=${academicYear}`
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
        `/api/comprehensive-bulletins/class-statistics?classId=${selectedClass}&term=${selectedTerm}&academicYear=${academicYear}`
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
      templateType: templateType,
      
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
      includeHeadmasterVisa,
      
      // Section Conseil de Classe
      includeClassCouncilDecisions,
      includeClassCouncilMentions,
      includeOrientationRecommendations,
      includeCouncilDate
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
    templateType,
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
    generationFormat, templateType, includeFirstTrimester, includeDiscipline, includeStudentWork,
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
            {language === 'fr' ? 'Générateur de Bulletins Complet' : 'Comprehensive Bulletin Generator'}
          </CardTitle>
          <p className="text-muted-foreground">{language === 'fr' ? 'Gérez la génération complète des bulletins scolaires' : 'Manage complete school bulletin generation'}</p>
        </CardHeader>
      </Card>

      {/* Sélecteur de langue */}

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <div className="w-full overflow-x-auto">
          <TabsList className="flex w-max min-w-full h-auto p-1 gap-1 bg-muted rounded-lg">
            <TabsTrigger value="class-selection" className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
              <School className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Sélection de Classe' : 'Class Selection'}</span>
              <span className="sm:hidden">{language === 'fr' ? 'Classes' : 'Classes'}</span>
            </TabsTrigger>
            <TabsTrigger value="student-management" disabled={!selectedClass} className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Gestion des Élèves' : 'Student Management'}</span>
              <span className="sm:hidden">{language === 'fr' ? 'Élèves' : 'Students'}</span>
            </TabsTrigger>
            <TabsTrigger value="generation-options" disabled={!selectedClass} className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
              <Settings className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Options de Génération' : 'Generation Options'}</span>
              <span className="sm:hidden">{language === 'fr' ? 'Options' : 'Options'}</span>
            </TabsTrigger>
            <TabsTrigger value="manual-data-entry" disabled={!selectedClass} className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
              <Edit3 className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Saisie Manuelle' : 'Manual Data Entry'}</span>
              <span className="sm:hidden">{language === 'fr' ? 'Saisie' : 'Entry'}</span>
            </TabsTrigger>
            <TabsTrigger value="bulk-operations" disabled={selectedStudents.length === 0} className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
              <Download className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Opérations en Lot' : 'Bulk Operations'}</span>
              <span className="sm:hidden">{language === 'fr' ? 'Lots' : 'Bulk'}</span>
            </TabsTrigger>
            <TabsTrigger value="pending-bulletins" className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Bulletins en Attente' : 'Pending Bulletins'}</span>
              <span className="sm:hidden">{language === 'fr' ? 'En Cours' : 'Pending'}</span>
            </TabsTrigger>
            <TabsTrigger value="approved-bulletins" className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Bulletins Approuvés' : 'Approved Bulletins'}</span>
              <span className="sm:hidden">{language === 'fr' ? 'Approuvés' : 'Approved'}</span>
            </TabsTrigger>
            <TabsTrigger value="sent-bulletins" className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
              <FileDown className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Bulletins Envoyés' : 'Sent Bulletins'}</span>
              <span className="sm:hidden">{language === 'fr' ? 'Envoyés' : 'Sent'}</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
              <BarChart3 className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Rapports' : 'Reports'}</span>
              <span className="sm:hidden">{language === 'fr' ? 'Stats' : 'Reports'}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Class Selection Tab */}
        <TabsContent value="class-selection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                {language === 'fr' ? 'Sélection de Classe' : 'Class Selection'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {/* Class Selection */}
                <div className="space-y-2">
                  <Label htmlFor="class-select">{language === 'fr' ? 'Sélectionner une classe' : 'Select a class'}</Label>
                  <Select value={selectedClass} onValueChange={handleClassChange}>
                    <SelectTrigger id="class-select" data-testid="class-select">
                      <SelectValue placeholder={language === 'fr' ? 'Sélectionner une classe' : 'Select a class'} />
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
                  <Label htmlFor="term-select">{language === 'fr' ? 'Sélectionner le trimestre' : 'Select term'}</Label>
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
                  <Label htmlFor="year-input">{language === 'fr' ? 'Année scolaire' : 'Academic Year'}</Label>
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
                  <h3 className="text-lg font-semibold mb-3">{language === 'fr' ? 'Statistiques de la Classe' : 'Class Statistics'}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold">{classStats.totalStudents}</div>
                        <div className="text-sm text-muted-foreground">{language === 'fr' ? 'Total Élèves' : 'Total Students'}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold">{classStats.approvedStudents}</div>
                        <div className="text-sm text-muted-foreground">{language === 'fr' ? 'Notes Approuvées' : 'Approved Grades'}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                        <div className="text-2xl font-bold">{classStats.completionRate}%</div>
                        <div className="text-sm text-muted-foreground">{language === 'fr' ? 'Taux de Complétion' : 'Completion Rate'}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                        <div className="text-2xl font-bold">{classStats.averageGrade?.toFixed(1)}/20</div>
                        <div className="text-sm text-muted-foreground">{language === 'fr' ? 'Moyenne Générale' : 'Average Grade'}</div>
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
                {language === 'fr' ? 'Saisie Manuelle de Données' : 'Manual Data Entry'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Student Selection for Manual Entry */}
              <div className="space-y-4">
                <Label>{language === 'fr' ? 'Sélectionner un élève pour la saisie' : 'Select student for entry'}</Label>
                <Select 
                  value={selectedStudentForEntry?.toString() || 'none'} 
                  onValueChange={(value) => setSelectedStudentForEntry(value === 'none' ? null : parseInt(value))}
                >
                  <SelectTrigger data-testid="student-select-manual">
                    <SelectValue placeholder={language === 'fr' ? 'Sélectionner un élève...' : 'Select a student...'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- {language === 'fr' ? 'Sélectionner un élève' : 'Select a student'} --</SelectItem>
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
                      {language === 'fr' ? 'Sauvegarder le Brouillon' : 'Save Draft'}
                    </Button>
                    <Button onClick={loadDraftData} variant="outline" size="sm" data-testid="load-draft">
                      <FileDown className="h-4 w-4 mr-2" />
                      {language === 'fr' ? 'Charger le Brouillon' : 'Load Draft'}
                    </Button>
                    <Button onClick={resetFormData} variant="outline" size="sm" data-testid="reset-form">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {language === 'fr' ? 'Réinitialiser le Formulaire' : 'Reset Form'}
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Manual Data Entry Form */}
              {selectedStudentForEntry && (
                <Form {...manualDataForm}>
                  <form onSubmit={manualDataForm.handleSubmit(onManualDataSubmit)} className="space-y-6">
                    
                    {/* Section 1: Student Identity Information */}
                    <Collapsible open={openSections.identity} onOpenChange={() => toggleSection('identity')}>
                      <Card>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                            <CardTitle className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-600" />
                                <span>{t('identityInformation')}</span>
                              </div>
                              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.identity ? 'rotate-180' : ''}`} />
                            </CardTitle>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={manualDataForm.control}
                                name="studentGender"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t('studentGender')}</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger data-testid="select-student-gender">
                                          <SelectValue placeholder={t('selectGender')} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="M">{t('male')}</SelectItem>
                                        <SelectItem value="F">{t('female')}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={manualDataForm.control}
                                name="studentDateOfBirth"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t('studentDateOfBirth')}</FormLabel>
                                    <FormControl>
                                      <Input {...field} type="date" data-testid="input-student-birth-date" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={manualDataForm.control}
                                name="studentPlaceOfBirth"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t('studentPlaceOfBirth')}</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder={t('enterPlaceOfBirth')} data-testid="input-student-birth-place" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={manualDataForm.control}
                                name="studentNationality"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t('studentNationality')}</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder={t('enterNationality')} data-testid="input-student-nationality" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={manualDataForm.control}
                                name="schoolRegion"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t('schoolRegion')}</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder={t('enterRegion')} data-testid="input-school-region" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={manualDataForm.control}
                                name="schoolSubdivision"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t('schoolSubdivision')}</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder={t('enterSubdivision')} data-testid="input-school-subdivision" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={manualDataForm.control}
                                name="guardianPhone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t('guardianPhone')}</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder={t('enterPhoneNumber')} data-testid="input-guardian-phone" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={manualDataForm.control}
                                name="isRepeater"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">
                                        {t('isRepeater')}
                                      </FormLabel>
                                      <FormDescription>
                                        {t('studentRepeatingGrade')}
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        data-testid="switch-is-repeater"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                    
                    {/* Section 2: Absences & Lateness */}
                    <Collapsible open={openSections.absences} onOpenChange={() => toggleSection('absences')}>
                      <Card>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                            <CardTitle className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-orange-600" />
                                {language === 'fr' ? 'Absences et Retards' : 'Absences and Lateness'}
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
                                    <FormLabel>{language === 'fr' ? 'Heures d\'absence injustifiées' : 'Unjustified absence hours'}</FormLabel>
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
                                    <FormLabel>{language === 'fr' ? 'Heures d\'absence justifiées' : 'Justified absence hours'}</FormLabel>
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
                                    <FormLabel>{language === 'fr' ? 'Nombre de retards' : 'Lateness count'}</FormLabel>
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
                                    <FormLabel>{language === 'fr' ? 'Heures de retenue' : 'Detention hours'}</FormLabel>
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
                                {language === 'fr' ? 'Sanctions Disciplinaires' : 'Disciplinary Sanctions'}
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
                                      <FormLabel>{language === 'fr' ? 'Avertissement de conduite' : 'Conduct warning'}</FormLabel>
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
                                      <FormLabel>{language === 'fr' ? 'Blâme de conduite' : 'Conduct blame'}</FormLabel>
                                    </div>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={manualDataForm.control}
                                name="exclusionDays"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{language === 'fr' ? 'Jours d\'exclusion' : 'Exclusion days'}</FormLabel>
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
                                      <FormLabel className="text-red-600 font-semibold">{language === 'fr' ? 'Exclusion définitive' : 'Permanent exclusion'}</FormLabel>
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
                                {language === 'fr' ? 'Totaux Académiques' : 'Academic Totals'}
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
                                    <FormLabel>{language === 'fr' ? 'Total général' : 'General total'}</FormLabel>
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
                                    <FormLabel>{language === 'fr' ? 'Nombre de moyennes' : 'Number of averages'}</FormLabel>
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
                                    <FormLabel>{language === 'fr' ? 'Taux de réussite' : 'Success rate'}</FormLabel>
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
                                {language === 'fr' ? 'Coefficients par Matière' : 'Subject Coefficients'}
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
                                  {language === 'fr' ? 'Configurez les coefficients et codes pour chaque matière de cet élève.' : 'Configure coefficients and codes for each subject of this student.'}
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
                                    {language === 'fr' ? 'Valeurs par défaut' : 'Default values'}
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
                                    {language === 'fr' ? 'Effacer tout' : 'Clear all'}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>{language === 'fr' ? 'Sélectionnez un élève pour configurer les coefficients par matière.' : 'Select a student to configure subject coefficients.'}</p>
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
                                {language === 'fr' ? 'Appréciations et Commentaires' : 'Appreciations and Comments'}
                              </div>
                              {openSections.appreciations ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </CardTitle>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="pt-0 space-y-4">
                            {/* General Comment - SEUL CHAMP À GARDER */}
                            <FormField
                              control={manualDataForm.control}
                              name="generalComment"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{language === 'fr' ? 'Commentaire général' : 'General comment'}</FormLabel>
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
                                {language === 'fr' ? 'Section Conseil de Classe' : 'Class Council Section'}
                              </div>
                              {openSections.classCouncil ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </CardTitle>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="pt-0 space-y-6">
                            {/* Décisions du conseil - SEUL CHAMP À GARDER */}
                            <FormField
                              control={manualDataForm.control}
                              name="classCouncilDecisions"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{language === 'fr' ? 'Décisions du conseil de classe' : 'Class council decisions'}</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      placeholder={language === 'fr' ? 'Décisions du conseil de classe...' : 'Class council decisions...'}
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
                                {language === 'fr' ? 'Section Signatures' : 'Signatures Section'}
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
                                      <FormLabel>{language === 'fr' ? 'Nom du visa parent' : 'Parent visa name'}</FormLabel>
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
                                      <FormLabel>{language === 'fr' ? 'Date du visa parent' : 'Parent visa date'}</FormLabel>
                                      <FormControl>
                                        <Input {...field} type="date" data-testid="parent-visa-date" />
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
                                      <FormLabel>{language === 'fr' ? 'Nom du visa directeur' : 'Headmaster visa name'}</FormLabel>
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
                                      <FormLabel>{language === 'fr' ? 'Date du visa directeur' : 'Headmaster visa date'}</FormLabel>
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
                  <p>{language === 'fr' ? 'Sélectionnez un élève pour la saisie de données.' : 'Select a student for data entry.'}</p>
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
                  {language === 'fr' ? 'Élèves avec notes' : 'Students with grades'}
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
                    {selectedStudents.length} {language === 'fr' ? 'élèves sélectionnés' : 'selected students'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={language === 'fr' ? 'Rechercher les élèves...' : 'Search students...'}
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
                  <span>{language === 'fr' ? 'Chargement des élèves...' : 'Loading students...'}</span>
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
                                    {language === 'fr' ? 'Aperçu du bulletin' : 'Preview bulletin'}
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
                                    {language === 'fr' ? 'Aperçu du bulletin' : 'Preview bulletin'}
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
                  
                  {/* Template Selector */}
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg space-y-3 mt-4">
                    <h4 className="font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {language === 'fr' ? 'Modèle de bulletin' : 'Report Card Template'}
                    </h4>
                    <div className="space-y-2">
                      <Label htmlFor="template-selector">
                        {language === 'fr' ? 'Sélectionner le modèle de bulletin' : 'Select report card template'}
                      </Label>
                      <Select value={templateType} onValueChange={(value: 'standard' | 'cameroon_official_compact') => setTemplateType(value)}>
                        <SelectTrigger id="template-selector" data-testid="template-selector" className="w-full">
                          <SelectValue placeholder={language === 'fr' ? 'Choisir un modèle...' : 'Choose a template...'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">
                            {language === 'fr' ? '📄 Standard Educafric' : '📄 Standard Educafric'}
                          </SelectItem>
                          <SelectItem value="cameroon_official_compact">
                            {language === 'fr' ? '🇨🇲 Officiel Cameroun (Compact)' : '🇨🇲 Cameroon Official (Compact)'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        {templateType === 'cameroon_official_compact' 
                          ? (language === 'fr' 
                            ? '✓ Modèle officiel conforme aux normes du Ministère de l\'Éducation du Cameroun'
                            : '✓ Official template compliant with Cameroon Ministry of Education standards'
                          )
                          : (language === 'fr'
                            ? 'Modèle standard avec toutes les fonctionnalités Educafric'
                            : 'Standard template with all Educafric features'
                          )
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </TabsContent>
        )}

        {/* Manual Data Entry Tab */}
        {mountedTabs.has('manual-data-entry') && (
          <TabsContent value="manual-data-entry" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pencil className="h-5 w-5" />
                  {t.manualDataEntry}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  {t.manualDataEntryDescription || "Configuration et saisie manuelle des données du bulletin."}
                </p>
                
                {/* Student Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t.selectStudent || "Sélectionner un élève"}</h3>
                  <Select value={selectedStudentForEntry?.toString() || ''} onValueChange={(value) => setSelectedStudentForEntry(value ? parseInt(value) : null)}>
                    <SelectTrigger data-testid="student-selector">
                      <SelectValue placeholder={t.pleaseSelectStudent} />
                    </SelectTrigger>
                    <SelectContent>
                      {classStudents?.map((student) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.firstName} {student.lastName}
                        </SelectItem>
                      ))}
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
                  <Package className="h-5 w-5" />
                  {t.bulkOperations}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  {t.bulkOperationsDescription || "Opérations en lot sur les bulletins."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Pending Bulletins Tab */}
        {mountedTabs.has('pending-bulletins') && (
          <TabsContent value="pending-bulletins" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t.pendingBulletins}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  {t.pendingBulletinsDescription || "Bulletins en attente d'approbation."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Approved Bulletins Tab */}
        {mountedTabs.has('approved-bulletins') && (
          <TabsContent value="approved-bulletins" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  {t.approvedBulletins}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  {t.approvedBulletinsDescription || "Bulletins approuvés et finalisés."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Reports Tab */}
        {mountedTabs.has('reports') && (
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t.reports}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  {t.reportsDescription || "Rapports et statistiques des bulletins."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

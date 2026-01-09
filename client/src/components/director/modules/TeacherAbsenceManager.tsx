import React from 'react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StandardFormHeader from '@/components/shared/StandardFormHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatName } from '@/utils/formatName';
import { 
  CalendarDays, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  UserCheck,
  MessageSquare,
  TrendingUp,
  FileText,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Download,
  BarChart3,
  Calendar as CalendarIcon
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TeacherAbsence {
  id: number;
  teacherId: number;
  teacherName: string;
  schoolId: number;
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
  absenceDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  reasonCategory: string;
  isPlanned: boolean;
  status: string;
  priority: string;
  totalAffectedStudents: number;
  affectedClasses: Array<{
    classId: number;
    className: string;
    subjectId: number;
    subjectName: string;
    period: string;
  }>;
  parentsNotified: boolean;
  studentsNotified: boolean;
  adminNotified: boolean;
  replacementTeacherId?: number;
  substituteName?: string;
  substituteConfirmed: boolean;
  substituteInstructions?: string;
  isResolved: boolean;
  impactAssessment: string;
  createdAt: string;
  updatedAt: string;
}

interface AbsenceStats {
  totalAbsences: number;
  thisMonth: number;
  lastMonth: number;
  trend: string;
  averagePerWeek: number;
  byCategory: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  byStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  impactMetrics: {
    totalStudentsAffected: number;
    averageStudentsPerAbsence: number;
    totalNotificationsSent: number;
    substituteSuccessRate: number;
  };
  performance: {
    averageResolutionTime: number;
    notificationSpeed: number;
    substituteAssignmentSpeed: number;
  };
}

interface SubstituteTeacher {
  id: number;
  name: string;
  subject: string;
  phone: string;
  email: string;
  availability: string;
  canTeachSubject: boolean;
  experienceLevel: string;
  rating: number;
  lastSubstitution: string;
  note?: string;
}

const TeacherAbsenceManager: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('current');
  const [selectedAbsence, setSelectedAbsence] = useState<TeacherAbsence | null>(null);
  const [showQuickActions, setShowQuickActions] = useState<number | null>(null);
  const [showAbsenceForm, setShowAbsenceForm] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSubstituteDialog, setShowSubstituteDialog] = useState(false);
  const [selectedSubstituteAbsence, setSelectedSubstituteAbsence] = useState<TeacherAbsence | null>(null);
  const [selectedSubstitute, setSelectedSubstitute] = useState<SubstituteTeacher | null>(null);
  const [substituteInstructions, setSubstituteInstructions] = useState('');
  const [notifyParentsForSubstitute, setNotifyParentsForSubstitute] = useState(true);
  const [notifyStudentsForSubstitute, setNotifyStudentsForSubstitute] = useState(true);
  const [pendingAbsenceData, setPendingAbsenceData] = useState<any>(null);
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  const text = {
    fr: {
      title: 'Gestion des Absences Enseignants',
      subtitle: 'Suivez et gérez les absences des enseignants',
      currentAbsences: 'Absences en cours de traitement',
      declareAbsence: 'Déclarer absence',
      declareTeacherAbsence: 'Déclarer une absence enseignant',
      urgentAbsences: 'absence(s) urgente(s)',
      needsAttention: 'nécessitent une attention immédiate',
      current: 'En cours',
      resolved: 'Résolues',
      analytics: 'Analyses',
      reports: 'Rapports',
      reported: 'Signalée',
      notified: 'Notifiée',
      substituteAssigned: 'Remplaçant assigné',
      resolvedStatus: 'Résolue',
      studentsAffected: 'élèves impactés',
      affectedClasses: 'Classes concernées:',
      teacherName: 'Nom de l\'enseignant',
      selectTeacher: 'Sélectionner un enseignant',
      loadingTeachers: 'Chargement des enseignants...',
      noTeachersFound: 'Aucun enseignant trouvé',
      notSpecified: 'Non spécifié',
      absenceDate: 'Date d\'absence',
      priority: 'Priorité',
      low: 'Faible',
      medium: 'Moyenne',
      high: 'Élevée',
      urgent: 'Urgente',
      startTime: 'Heure début',
      endTime: 'Heure fin',
      reasonCategory: 'Catégorie du motif',
      sick: 'Maladie',
      personal: 'Personnel',
      family: 'Famille',
      training: 'Formation',
      other: 'Autre',
      reason: 'Motif détaillé',
      describeSituation: 'Décrivez la situation...',
      plannedAbsence: 'Absence planifiée',
      cancel: 'Annuler',
      submit: 'Déclarer',
      requiredFields: 'Champs requis',
      fillAllFields: 'Veuillez remplir tous les champs obligatoires.',
      substituteAssignedSuccess: 'Remplaçant assigné avec succès',
      substituteWillBeNotified: 'a été assigné et sera notifié.',
      error: 'Erreur',
      cannotAssignSubstitute: 'Impossible d\'assigner le remplaçant. Veuillez réessayer.',
      actionPerformed: 'Action effectuée',
      actionSuccess: 'L\'action a été réalisée avec succès.',
      actionFailed: 'Échec de l\'action',
      noCurrentAbsences: 'Aucune absence en cours',
      allAbsencesResolved: 'Toutes les absences ont été traitées.',
      noResolvedAbsences: 'Aucune absence résolue',
      noPastAbsences: 'Pas d\'absences passées à afficher.',
      confirmAbsenceDeclaration: 'Confirmer la déclaration d\'absence',
      confirmMessage: 'Êtes-vous sûr de vouloir déclarer cette absence ? Cette action enverra des notifications automatiques aux parents, élèves et administration.',
      confirm: 'Confirmer',
      findSubstitute: 'Trouver remplaçant',
      notifyParents: 'Notifier parents',
      notifyStudents: 'Notifier élèves',
      markResolved: 'Marquer résolu',
      viewDetails: 'Voir détails',
      exportReport: 'Exporter rapport',
      selectSubstitute: 'Sélectionner un remplaçant',
      availableSubstitutes: 'Remplaçants disponibles',
      noSubstitutesAvailable: 'Aucun remplaçant disponible',
      loadingSubstitutes: 'Chargement des remplaçants...',
      instructions: 'Instructions pour le remplaçant',
      instructionsPlaceholder: 'Instructions spécifiques pour le cours...',
      assignSubstitute: 'Assigner le remplaçant',
      statsThisMonth: 'Ce mois',
      statsLastMonth: 'Mois dernier',
      statsTrend: 'Tendance',
      statsAvgPerWeek: 'Moyenne/semaine',
      totalAbsences: 'Total absences',
      byCategory: 'Par catégorie',
      byStatus: 'Par statut',
      impactMetrics: 'Métriques d\'impact',
      totalStudentsAffected: 'Total élèves affectés',
      avgStudentsPerAbsence: 'Moy. élèves/absence',
      totalNotifications: 'Total notifications',
      substituteSuccessRate: 'Taux de remplacement',
      performance: 'Performance',
      avgResolutionTime: 'Temps résolution moy.',
      notificationSpeed: 'Vitesse notification',
      substituteSpeed: 'Vitesse remplacement',
      generateReport: 'Générer rapport',
      downloadPDF: 'Télécharger PDF',
      downloadExcel: 'Télécharger Excel',
      periodSelector: 'Sélectionner période'
    },
    en: {
      title: 'Teacher Absence Management',
      subtitle: 'Track and manage teacher absences',
      currentAbsences: 'Absences being processed',
      declareAbsence: 'Declare absence',
      declareTeacherAbsence: 'Declare a teacher absence',
      urgentAbsences: 'urgent absence(s)',
      needsAttention: 'require immediate attention',
      current: 'Current',
      resolved: 'Resolved',
      analytics: 'Analytics',
      reports: 'Reports',
      reported: 'Reported',
      notified: 'Notified',
      substituteAssigned: 'Substitute assigned',
      resolvedStatus: 'Resolved',
      studentsAffected: 'students affected',
      affectedClasses: 'Affected classes:',
      teacherName: 'Teacher name',
      selectTeacher: 'Select a teacher',
      loadingTeachers: 'Loading teachers...',
      noTeachersFound: 'No teachers found',
      notSpecified: 'Not specified',
      absenceDate: 'Absence date',
      priority: 'Priority',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
      startTime: 'Start time',
      endTime: 'End time',
      reasonCategory: 'Reason category',
      sick: 'Sick',
      personal: 'Personal',
      family: 'Family',
      training: 'Training',
      other: 'Other',
      reason: 'Detailed reason',
      describeSituation: 'Describe the situation...',
      plannedAbsence: 'Planned absence',
      cancel: 'Cancel',
      submit: 'Submit',
      requiredFields: 'Required fields',
      fillAllFields: 'Please fill in all required fields.',
      substituteAssignedSuccess: 'Substitute assigned successfully',
      substituteWillBeNotified: 'has been assigned and will be notified.',
      error: 'Error',
      cannotAssignSubstitute: 'Unable to assign substitute. Please try again.',
      actionPerformed: 'Action performed',
      actionSuccess: 'The action was completed successfully.',
      actionFailed: 'Action failed',
      noCurrentAbsences: 'No current absences',
      allAbsencesResolved: 'All absences have been processed.',
      noResolvedAbsences: 'No resolved absences',
      noPastAbsences: 'No past absences to display.',
      confirmAbsenceDeclaration: 'Confirm absence declaration',
      confirmMessage: 'Are you sure you want to declare this absence? This action will send automatic notifications to parents, students and administration.',
      confirm: 'Confirm',
      findSubstitute: 'Find substitute',
      notifyParents: 'Notify parents',
      notifyStudents: 'Notify students',
      markResolved: 'Mark resolved',
      viewDetails: 'View details',
      exportReport: 'Export report',
      selectSubstitute: 'Select a substitute',
      availableSubstitutes: 'Available substitutes',
      noSubstitutesAvailable: 'No substitutes available',
      loadingSubstitutes: 'Loading substitutes...',
      instructions: 'Instructions for substitute',
      instructionsPlaceholder: 'Specific instructions for the class...',
      assignSubstitute: 'Assign substitute',
      statsThisMonth: 'This month',
      statsLastMonth: 'Last month',
      statsTrend: 'Trend',
      statsAvgPerWeek: 'Avg/week',
      totalAbsences: 'Total absences',
      byCategory: 'By category',
      byStatus: 'By status',
      impactMetrics: 'Impact metrics',
      totalStudentsAffected: 'Total students affected',
      avgStudentsPerAbsence: 'Avg students/absence',
      totalNotifications: 'Total notifications',
      substituteSuccessRate: 'Substitute success rate',
      performance: 'Performance',
      avgResolutionTime: 'Avg resolution time',
      notificationSpeed: 'Notification speed',
      substituteSpeed: 'Substitute speed',
      generateReport: 'Generate report',
      downloadPDF: 'Download PDF',
      downloadExcel: 'Download Excel',
      periodSelector: 'Select period'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch school teachers for dropdown selection
  const { data: schoolTeachersData = [], isLoading: teachersLoading } = useQuery<any[]>({
    queryKey: ['/api/school/teachers'],
    queryFn: async () => {
      const response = await fetch('/api/school/teachers', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch teachers');
      const result = await response.json();
      return result.teachers || [];
    }
  });

  // Fetch teacher absences - UPDATED TO USE SCHOOL ROUTES
  const { data: absences = [], isLoading: absencesLoading } = useQuery<TeacherAbsence[]>({
    queryKey: ['/api/schools/teacher-absences'],
    queryFn: async () => {
      const response = await fetch('/api/schools/teacher-absences', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch teacher absences');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  // Fetch absence statistics - UPDATED TO USE SCHOOL ROUTES
  const { data: stats } = useQuery<AbsenceStats>({
    queryKey: ['/api/schools/teacher-absences-stats'],
    queryFn: async () => {
      const response = await fetch('/api/schools/teacher-absences-stats', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch absence statistics');
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch available substitute teachers
  const { data: availableSubstitutes = [], isLoading: substitutesLoading } = useQuery<SubstituteTeacher[]>({
    queryKey: ['/api/schools/available-substitutes', selectedSubstituteAbsence?.subjectId, selectedSubstituteAbsence?.absenceDate, selectedSubstituteAbsence?.startTime, selectedSubstituteAbsence?.endTime],
    queryFn: async () => {
      if (!selectedSubstituteAbsence) return [];
      const params = new URLSearchParams({
        subjectId: selectedSubstituteAbsence.subjectId.toString(),
        date: selectedSubstituteAbsence.absenceDate,
        startTime: selectedSubstituteAbsence.startTime,
        endTime: selectedSubstituteAbsence.endTime
      });
      const response = await fetch(`/api/schools/available-substitutes?${params}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch substitutes');
      const result = await response.json();
      return result.substitutes || [];
    },
    enabled: !!selectedSubstituteAbsence && showSubstituteDialog
  });

  // Assign substitute mutation
  const assignSubstituteMutation = useMutation({
    mutationFn: async ({ absenceId, substitute, instructions, notifyParents, notifyStudents }: {
      absenceId: number;
      substitute: SubstituteTeacher;
      instructions: string;
      notifyParents: boolean;
      notifyStudents: boolean;
    }) => {
      const response = await fetch(`/api/schools/teacher-absences/${absenceId}/assign-substitute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          substituteTeacherId: substitute.id,
          substituteName: substitute.name,
          substituteInstructions: instructions,
          notifyParents,
          notifyStudents
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to assign substitute');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/schools/teacher-absences'] });
      setShowSubstituteDialog(false);
      setSelectedSubstituteAbsence(null);
      setSelectedSubstitute(null);
      setSubstituteInstructions('');
      toast({
        title: t.substituteAssignedSuccess,
        description: `${data.substitute.name} ${t.substituteWillBeNotified}`
      });
    },
    onError: (error: any) => {
      toast({
        title: t.error,
        description: t.cannotAssignSubstitute,
        variant: 'destructive'
      });
    }
  });

  // Quick action mutation
  const performActionMutation = useMutation({
    mutationFn: async ({ absenceId, actionType, actionData }: {
      absenceId: number;
      actionType: string;
      actionData: any;
    }) => {
      const response = await fetch(`/api/schools/teacher-absences/${absenceId}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ actionType, actionData })
      });
      
      if (!response.ok) {
        throw new Error('Action failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schools/teacher-absences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/schools/teacher-absences-stats'] });
      setShowQuickActions(null);
      toast({
        title: t.actionPerformed,
        description: t.actionSuccess,
      });
    },
    onError: (error: any) => {
      toast({
        title: t.error,
        description: error.message || t.actionFailed,
        variant: "destructive",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'notified': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'substitute_assigned': return 'bg-green-100 text-green-800 border-green-200';
      case 'resolved': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleQuickAction = async (absenceId: number, actionType: string, actionData: any = {}) => {
    performActionMutation.mutate({ absenceId, actionType, actionData });
  };

  // Create teacher absence mutation
  const createAbsenceMutation = useMutation({
    mutationFn: async (absenceData: any) => {
      const response = await apiRequest('/api/teacher/absence/declare', 'POST', absenceData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schools/teacher-absences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/schools/teacher-absences-stats'] });
      setShowAbsenceForm(false);
      toast({
        title: "Absence déclarée",
        description: "L'absence de l'enseignant a été déclarée avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Échec de la déclaration d'absence",
        variant: "destructive",
      });
    }
  });

  const handleDeclareAbsence = () => {
    setShowAbsenceForm(true);
  };

  const handleSubmitAbsence = (absenceData: any) => {
    setPendingAbsenceData(absenceData);
    setShowConfirmDialog(true);
  };

  const confirmAbsenceSubmission = () => {
    if (pendingAbsenceData) {
      createAbsenceMutation.mutate(pendingAbsenceData);
      setShowConfirmDialog(false);
      setPendingAbsenceData(null);
    }
  };

  // Teacher Absence Form Component
  const AbsenceDeclarationForm = () => {
    const [formData, setFormData] = useState({
      teacherId: '',
      teacherName: '',
      classId: '',
      subjectId: '',
      absenceDate: '',
      startTime: '',
      endTime: '',
      reason: '',
      reasonCategory: 'other',
      isPlanned: false,
      priority: 'medium'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Validate required fields
      if (!formData.teacherId || !formData.absenceDate || !formData.startTime || !formData.endTime || !formData.reason) {
        toast({
          title: t.requiredFields,
          description: t.fillAllFields,
          variant: "destructive",
        });
        return;
      }

      const absenceData = {
        ...formData,
        teacherId: parseInt(formData.teacherId) || 1, // Default for demo
        classId: parseInt(formData.classId) || 1,     // Default for demo
        subjectId: parseInt(formData.subjectId) || 1, // Default for demo
        status: 'reported',
        totalAffectedStudents: 30, // Will be calculated on backend
        affectedClasses: [{
          classId: parseInt(formData.classId) || 1,
          className: 'Classe Demo',
          subjectId: parseInt(formData.subjectId) || 1,
          subjectName: 'Matière Demo',
          period: `${formData.startTime}-${formData.endTime}`
        }]
      };

      handleSubmitAbsence(absenceData);
    };

    return (
      <Dialog open={showAbsenceForm} onOpenChange={setShowAbsenceForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.declareTeacherAbsence}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teacherName">{t.teacherName} *</Label>
              <Select 
                value={formData.teacherId} 
                onValueChange={(value) => {
                  const selectedTeacher = schoolTeachersData.find(teacher => teacher.id.toString() === value);
                  setFormData(prev => ({ 
                    ...prev, 
                    teacherId: value,
                    teacherName: selectedTeacher ? formatName(selectedTeacher.firstName, selectedTeacher.lastName, language as 'fr' | 'en') : ''
                  }));
                }}
              >
                <SelectTrigger data-testid="select-teacher-name">
                  <SelectValue placeholder={t.selectTeacher} />
                </SelectTrigger>
                <SelectContent>
                  {teachersLoading ? (
                    <SelectItem value="loading" disabled>
                      {t.loadingTeachers}
                    </SelectItem>
                  ) : schoolTeachersData.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      {t.noTeachersFound}
                    </SelectItem>
                  ) : (
                    schoolTeachersData.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        {formatName(teacher.firstName, teacher.lastName, language as 'fr' | 'en')} - {teacher.subject || t.notSpecified}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="absenceDate">{t.absenceDate} *</Label>
                <Input
                  id="absenceDate"
                  type="date"
                  value={formData.absenceDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, absenceDate: e.target.value }))}
                  required
                  data-testid="input-absence-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">{t.priority}</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger data-testid="select-priority">
                    <SelectValue placeholder={t.priority} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t.low}</SelectItem>
                    <SelectItem value="medium">{t.medium}</SelectItem>
                    <SelectItem value="high">{t.high}</SelectItem>
                    <SelectItem value="urgent">{t.urgent}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startTime">{t.startTime} *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                  data-testid="input-start-time"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">{t.endTime} *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                  data-testid="input-end-time"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reasonCategory">{t.reasonCategory}</Label>
              <Select 
                value={formData.reasonCategory} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, reasonCategory: value }))}
              >
                <SelectTrigger data-testid="select-reason-category" className="bg-blue-50 border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder={t.reasonCategory} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">{t.sick}</SelectItem>
                  <SelectItem value="personal">{t.personal}</SelectItem>
                  <SelectItem value="official">{language === 'fr' ? 'Officiel' : 'Official'}</SelectItem>
                  <SelectItem value="emergency">{t.urgent}</SelectItem>
                  <SelectItem value="training">{t.training}</SelectItem>
                  <SelectItem value="other">{t.other}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">{t.reason} *</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder={t.describeSituation}
                required
                data-testid="textarea-reason"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAbsenceForm(false)}
                data-testid="button-cancel-absence"
              >
                {t.cancel}
              </Button>
              <Button 
                type="submit" 
                disabled={createAbsenceMutation.isPending}
                data-testid="button-submit-absence"
              >
                {createAbsenceMutation.isPending ? (language === 'fr' ? 'Déclaration...' : 'Submitting...') : t.submit}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const formatDateTime = (dateStr: string, timeStr?: string) => {
    const date = new Date(dateStr);
    let formatted = date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
    
    if (timeStr) {
      formatted += language === 'fr' ? ` à ${timeStr}` : ` at ${timeStr}`;
    }
    
    return formatted;
  };

  const translateReason = (reason: string): string => {
    const reasonTranslations: Record<string, { fr: string; en: string }> = {
      'maladie': { fr: 'Maladie', en: 'Illness' },
      'urgence-familiale': { fr: 'Urgence familiale', en: 'Family emergency' },
      'rendez-vous-medical': { fr: 'Rendez-vous médical', en: 'Medical appointment' },
      'formation': { fr: 'Formation professionnelle', en: 'Professional training' },
      'conges': { fr: 'Congés', en: 'Leave' },
      'autre': { fr: 'Autre', en: 'Other' },
      'medical': { fr: 'Médical', en: 'Medical' },
      'personal': { fr: 'Personnel', en: 'Personal' },
      'official': { fr: 'Officiel', en: 'Official' },
      'emergency': { fr: 'Urgence', en: 'Emergency' },
      'training': { fr: 'Formation', en: 'Training' },
      'other': { fr: 'Autre', en: 'Other' }
    };
    const translation = reasonTranslations[reason.toLowerCase()];
    if (translation) {
      return translation[language as 'fr' | 'en'] || translation.fr;
    }
    return reason;
  };

  if (absencesLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            <span>{language === 'fr' ? 'Chargement des absences...' : 'Loading absences...'}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentAbsences = absences.filter((a) => !a.isResolved);
  const resolvedAbsences = absences.filter((a) => a.isResolved);
  const urgentAbsences = absences.filter((a) => 
    a.priority === 'urgent' || a.priority === 'high'
  );

  return (
    <div className="w-full space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CalendarDays className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total ce mois</p>
                  <p className="text-2xl font-bold">{stats.thisMonth}</p>
                  <p className={`text-xs ${stats.trend === 'increasing' ? 'text-red-500' : 'text-green-500'}`}>
                    {stats.trend === 'increasing' ? '↗' : '↘'} {Math.abs(stats.thisMonth - stats.lastMonth)} vs mois dernier
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Élèves impactés</p>
                  <p className="text-2xl font-bold">{stats.impactMetrics.totalStudentsAffected}</p>
                  <p className="text-xs text-gray-500">
                    Moy. {stats.impactMetrics.averageStudentsPerAbsence} par absence
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Taux remplaçants</p>
                  <p className="text-2xl font-bold">{stats.impactMetrics.substituteSuccessRate}%</p>
                  <p className="text-xs text-gray-500">
                    Temps moyen: {stats.performance.substituteAssignmentSpeed}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Résolution moy.</p>
                  <p className="text-2xl font-bold">{stats.performance.averageResolutionTime}h</p>
                  <p className="text-xs text-gray-500">
                    Notification: {stats.performance.notificationSpeed}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Urgent Alerts */}
      {urgentAbsences.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{urgentAbsences.length} {t.urgentAbsences}</strong> {t.needsAttention}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1.5 bg-[#F3F5F7] rounded-xl gap-1">
          <TabsTrigger value="current" className="flex items-center justify-center gap-2 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline truncate">{t.current} ({currentAbsences.length})</span>
          </TabsTrigger>
          <TabsTrigger value="resolved" className="flex items-center justify-center gap-2 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline truncate">{t.resolved} ({resolvedAbsences.length})</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center justify-center gap-2 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm">
            <TrendingUp className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline truncate">{t.analytics}</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center justify-center gap-2 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm">
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline truncate">{t.reports}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t.currentAbsences}</h3>
            <Button 
              size="sm" 
              className="flex items-center space-x-2"
              onClick={handleDeclareAbsence}
              data-testid="button-declare-absence"
            >
              <Plus className="w-4 h-4" />
              <span>{t.declareAbsence}</span>
            </Button>
          </div>

          <div className="grid gap-4">
            {currentAbsences.map((absence: TeacherAbsence) => (
              <Card key={absence.id} className="relative">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-lg">{absence.teacherName}</h4>
                          <Badge className={getPriorityColor(absence.priority)}>
                            {absence.priority ? absence.priority.toUpperCase() : 'NORMAL'}
                          </Badge>
                          <Badge className={getStatusColor(absence.status)}>
                            {absence.status === 'reported' && t.reported}
                            {absence.status === 'notified' && t.notified}
                            {absence.status === 'substitute_assigned' && t.substituteAssigned}
                            {absence.status === 'resolved' && t.resolvedStatus}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowQuickActions(
                            showQuickActions === absence.id ? null : absence.id
                          )}
                          data-testid={`button-actions-${absence.id}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <CalendarDays className="w-4 h-4 text-gray-500" />
                          <span>{formatDateTime(absence.absenceDate)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{absence.startTime} - {absence.endTime}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span>{absence.totalAffectedStudents} {t.studentsAffected}</span>
                        </div>
                      </div>

                      {/* Affected Classes */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">{t.affectedClasses}</p>
                        <div className="flex flex-wrap gap-2">
                          {absence.affectedClasses.map((cls, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {cls.className} - {cls.subjectName} ({cls.period})
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Reason */}
                      <div>
                        <p className="text-sm text-gray-600">
                          <strong>{language === 'fr' ? 'Motif:' : 'Reason:'}</strong> {translateReason(absence.reason)}
                        </p>
                      </div>

                      {/* Notifications Status */}
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={`flex items-center space-x-1 ${absence.parentsNotified ? 'text-green-600' : 'text-gray-500'}`}>
                          {absence.parentsNotified ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          <span>{language === 'fr' ? 'Parents notifiés' : 'Parents notified'}</span>
                        </span>
                        <span className={`flex items-center space-x-1 ${absence.studentsNotified ? 'text-green-600' : 'text-gray-500'}`}>
                          {absence.studentsNotified ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          <span>{language === 'fr' ? 'Élèves notifiés' : 'Students notified'}</span>
                        </span>
                        {absence.substituteName && (
                          <span className="flex items-center space-x-1 text-blue-600">
                            <UserCheck className="w-4 h-4" />
                            <span>Remplaçant: {absence.substituteName}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions Panel */}
                    {showQuickActions === absence.id && (
                      <div className="absolute top-4 right-12 bg-white border rounded-lg shadow-lg p-4 z-10 min-w-64">
                        <h5 className="font-semibold mb-3">Actions rapides</h5>
                        <div className="space-y-2">
                          {!absence.parentsNotified && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => handleQuickAction(absence.id, 'notify_parents', {
                                targetAudience: 'parents',
                                notificationMethod: 'sms',
                                recipientCount: absence.totalAffectedStudents
                              })}
                              disabled={performActionMutation.isPending}
                              data-testid={`button-notify-parents-${absence.id}`}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Notifier les parents
                            </Button>
                          )}
                          
                          {!absence.studentsNotified && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => handleQuickAction(absence.id, 'notify_students', {
                                targetAudience: 'students',
                                notificationMethod: 'app',
                                recipientCount: absence.totalAffectedStudents
                              })}
                              disabled={performActionMutation.isPending}
                              data-testid={`button-notify-students-${absence.id}`}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Notifier les élèves
                            </Button>
                          )}
                          
                          {!absence.replacementTeacherId && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => {
                                setSelectedSubstituteAbsence(absence);
                                setShowSubstituteDialog(true);
                                setShowQuickActions(null);
                              }}
                              disabled={assignSubstituteMutation.isPending}
                              data-testid={`button-assign-substitute-${absence.id}`}
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Assigner remplaçant
                            </Button>
                          )}
                          
                          {absence.status !== 'resolved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => handleQuickAction(absence.id, 'mark_resolved', {
                                notes: 'Absence traitée avec succès'
                              })}
                              disabled={performActionMutation.isPending}
                              data-testid={`button-mark-resolved-${absence.id}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Marquer comme résolue
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {currentAbsences.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h4 className="font-semibold text-lg mb-2">Aucune absence en cours</h4>
                  <p className="text-gray-600">Toutes les absences ont été traitées avec succès.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          <h3 className="text-lg font-semibold">Absences résolues</h3>
          
          <div className="grid gap-4">
            {resolvedAbsences.map((absence: TeacherAbsence) => (
              <Card key={absence.id} className="opacity-75">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold">{absence.teacherName}</h4>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Résolue
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{formatDateTime(absence.absenceDate)}</span>
                        <span>{absence.startTime} - {absence.endTime}</span>
                        <span>{absence.subjectName} - {absence.className}</span>
                      </div>
                      {absence.substituteName && (
                        <p className="text-sm text-blue-600">
                          Remplaçant: {absence.substituteName}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      Résolu le {formatDateTime(absence.updatedAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {resolvedAbsences.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="font-semibold text-lg mb-2">Aucune absence résolue</h4>
                  <p className="text-gray-600">L'historique des absences résolues apparaîtra ici.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h3 className="text-lg font-semibold">Analyses et statistiques</h3>
          
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Category Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Répartition par catégorie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.byCategory.map((cat, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{cat.category}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded">
                            <div 
                              className="h-full bg-blue-500 rounded"
                              style={{ width: `${cat.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{cat.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* By Status Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Répartition par statut</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.byStatus.map((status, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm capitalize">
                          {status.status === 'resolved' && 'Résolues'}
                          {status.status === 'substitute_assigned' && 'Remplaçant assigné'}
                          {status.status === 'reported' && 'Signalées'}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded">
                            <div 
                              className="h-full bg-green-500 rounded"
                              style={{ width: `${status.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{status.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportsTab 
            absences={absences}
            stats={stats}
            isLoading={teachersLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Teacher Absence Declaration Form Dialog */}
      <AbsenceDeclarationForm />

      {/* Substitute Teacher Selection Dialog */}
      <Dialog open={showSubstituteDialog} onOpenChange={setShowSubstituteDialog}>
        <DialogContent className="bg-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Assigner un remplaçant
            </DialogTitle>
            <p className="text-sm text-gray-600">
              {selectedSubstituteAbsence && `Pour ${selectedSubstituteAbsence.teacherName} - ${selectedSubstituteAbsence.subjectName}`}
            </p>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Available Substitutes */}
            <div>
              <Label className="text-base font-medium mb-3 block">
                Remplaçants disponibles
              </Label>
              
              {substitutesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Recherche des remplaçants disponibles...</p>
                </div>
              ) : availableSubstitutes.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Aucun remplaçant disponible pour ce créneau</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {availableSubstitutes.map((substitute) => (
                    <div
                      key={substitute.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedSubstitute?.id === substitute.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedSubstitute(substitute)}
                      data-testid={`substitute-option-${substitute.id}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{substitute.name}</h4>
                          <p className="text-sm text-gray-600">{substitute.subject}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <span>⭐</span>
                              <span>{substitute.rating}</span>
                            </span>
                            <span>{substitute.experienceLevel}</span>
                            <span>Dernier rempl.: {substitute.lastSubstitution}</span>
                          </div>
                          {substitute.note && (
                            <p className="text-xs text-amber-600 mt-1">{substitute.note}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge 
                            className={
                              substitute.availability === 'disponible' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {substitute.availability}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div>
              <Label htmlFor="instructions">Instructions pour le remplaçant (optionnel)</Label>
              <Textarea
                id="instructions"
                placeholder="Instructions spécifiques, chapitre en cours, matériel nécessaire..."
                value={substituteInstructions}
                onChange={(e) => setSubstituteInstructions(e.target.value)}
                className="mt-2"
                data-testid="input-substitute-instructions"
              />
            </div>

            {/* Notification Options */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Options de notification</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notify-parents-substitute"
                  checked={notifyParentsForSubstitute}
                  onChange={(e) => setNotifyParentsForSubstitute(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="notify-parents-substitute" className="text-sm">
                  Notifier les parents du changement
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notify-students-substitute"
                  checked={notifyStudentsForSubstitute}
                  onChange={(e) => setNotifyStudentsForSubstitute(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="notify-students-substitute" className="text-sm">
                  Notifier les élèves du remplaçant
                </Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setShowSubstituteDialog(false)}
              disabled={assignSubstituteMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (selectedSubstitute && selectedSubstituteAbsence) {
                  assignSubstituteMutation.mutate({
                    absenceId: selectedSubstituteAbsence.id,
                    substitute: selectedSubstitute,
                    instructions: substituteInstructions,
                    notifyParents: notifyParentsForSubstitute,
                    notifyStudents: notifyStudentsForSubstitute
                  });
                }
              }}
              disabled={!selectedSubstitute || assignSubstituteMutation.isPending}
              data-testid="button-confirm-substitute"
            >
              {assignSubstituteMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Attribution...
                </>
              ) : (
                'Assigner le remplaçant'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'fr' ? 'Confirmer la déclaration d\'absence' : 'Confirm Absence Declaration'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'fr' 
                ? 'Êtes-vous sûr de vouloir déclarer cette absence ? Cette action enverra des notifications automatiques aux parents, élèves et administration.'
                : 'Are you sure you want to declare this absence? This action will send automatic notifications to parents, students and administration.'}
              <br /><br />
              {pendingAbsenceData && (
                <>
                  <strong>{language === 'fr' ? 'Enseignant:' : 'Teacher:'}</strong> {pendingAbsenceData.teacherName}
                  <br />
                  <strong>{language === 'fr' ? 'Date:' : 'Date:'}</strong> {pendingAbsenceData.absenceDate}
                  <br />
                  <strong>{language === 'fr' ? 'Période:' : 'Period:'}</strong> {pendingAbsenceData.startTime} - {pendingAbsenceData.endTime}
                  <br />
                  <strong>{language === 'fr' ? 'Raison:' : 'Reason:'}</strong> {pendingAbsenceData.reason}
                  <br />
                  <strong>{language === 'fr' ? 'Élèves affectés:' : 'Affected Students:'}</strong> ~{pendingAbsenceData.totalAffectedStudents || 30} {language === 'fr' ? 'élèves' : 'students'}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'fr' ? 'Annuler' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAbsenceSubmission} disabled={createAbsenceMutation.isPending}>
              {createAbsenceMutation.isPending 
                ? (language === 'fr' ? 'Déclaration...' : 'Declaring...') 
                : (language === 'fr' ? 'Confirmer la déclaration' : 'Confirm Declaration')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ============================
// COMPOSANT REPORTS TAB
// ============================

interface ReportsTabProps {
  absences: TeacherAbsence[];
  stats: any;
  isLoading: boolean;
}

const ReportsTab: React.FC<ReportsTabProps> = ({ absences, stats, isLoading }) => {
  const { language } = useLanguage();
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);

  const translateReason = (reason: string): string => {
    const reasonTranslations: Record<string, { fr: string; en: string }> = {
      'maladie': { fr: 'Maladie', en: 'Illness' },
      'urgence-familiale': { fr: 'Urgence familiale', en: 'Family emergency' },
      'rendez-vous-medical': { fr: 'Rendez-vous médical', en: 'Medical appointment' },
      'formation': { fr: 'Formation professionnelle', en: 'Professional training' },
      'conges': { fr: 'Congés', en: 'Leave' },
      'autre': { fr: 'Autre', en: 'Other' },
      'medical': { fr: 'Médical', en: 'Medical' },
      'personal': { fr: 'Personnel', en: 'Personal' },
      'official': { fr: 'Officiel', en: 'Official' },
      'emergency': { fr: 'Urgence', en: 'Emergency' },
      'training': { fr: 'Formation', en: 'Training' },
      'other': { fr: 'Autre', en: 'Other' }
    };
    const translation = reasonTranslations[reason.toLowerCase()];
    if (translation) {
      return translation[language as 'fr' | 'en'] || translation.fr;
    }
    return reason;
  };

  // Import des dépendances pour PDF et Excel
  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const jsPDF = (await import('jspdf')).default;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 20;

      // En-tête du rapport
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RAPPORT D\'ABSENCES ENSEIGNANTS', pageWidth/2, yPosition, { align: 'center' });
      
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Période: ${getReportPeriodText()}`, pageWidth/2, yPosition, { align: 'center' });
      
      yPosition += 15;

      // Statistiques générales
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('STATISTIQUES GÉNÉRALES', 20, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const filteredAbsences = getFilteredAbsences();
      pdf.text(`Total des absences: ${filteredAbsences.length}`, 20, yPosition);
      yPosition += 5;
      pdf.text(`Absences résolues: ${filteredAbsences.filter(a => a.isResolved).length}`, 20, yPosition);
      yPosition += 5;
      pdf.text(`Remplaçants assignés: ${filteredAbsences.filter(a => a.substituteName).length}`, 20, yPosition);
      yPosition += 5;
      pdf.text(`En attente: ${filteredAbsences.filter(a => !a.isResolved && !a.substituteName).length}`, 20, yPosition);
      
      yPosition += 15;

      // Liste détaillée des absences
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DÉTAIL DES ABSENCES', 20, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      
      // En-têtes de colonnes
      pdf.text('Date', 20, yPosition);
      pdf.text('Enseignant', 50, yPosition);
      pdf.text('Matière', 90, yPosition);
      pdf.text('Raison', 120, yPosition);
      pdf.text('Statut', 160, yPosition);
      
      yPosition += 5;
      pdf.setFont('helvetica', 'normal');

      // Données des absences
      filteredAbsences.slice(0, 30).forEach((absence) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.text(new Date(absence.absenceDate).toLocaleDateString('fr-FR'), 20, yPosition);
        pdf.text(absence.teacherName.substring(0, 20), 50, yPosition);
        pdf.text(absence.subjectName.substring(0, 15), 90, yPosition);
        pdf.text(absence.reason.substring(0, 20), 120, yPosition);
        
        const status = absence.isResolved ? 'Résolue' : 
                      absence.substituteName ? 'Remplaçant' : 'En attente';
        pdf.text(status, 160, yPosition);
        
        yPosition += 4;
      });

      // Pied de page
      const pageCount = pdf.getNumberOfPages ? pdf.getNumberOfPages() : 1;
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(`Page ${i}/${pageCount}`, pageWidth - 30, pdf.internal.pageSize.getHeight() - 10);
        pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} par EDUCAFRIC`, 20, pdf.internal.pageSize.getHeight() - 10);
      }

      // Téléchargement
      const fileName = `rapport-absences-${reportPeriod}-${selectedMonth}-${selectedYear}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "✅ Rapport PDF généré",
        description: `Le rapport d'absences a été téléchargé avec succès.`,
      });
      
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de générer le rapport PDF.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generateExcel = async () => {
    setIsGeneratingExcel(true);
    try {
      const XLSX = await import('xlsx');
      
      const filteredAbsences = getFilteredAbsences();
      
      // Préparer les données pour Excel
      const excelData = filteredAbsences.map((absence) => ({
        'Date': new Date(absence.absenceDate).toLocaleDateString('fr-FR'),
        'Enseignant': absence.teacherName,
        'Matière': absence.subjectName,
        'Classe': absence.className,
        'Heure début': absence.startTime,
        'Heure fin': absence.endTime,
        'Raison': absence.reason,
        'Catégorie': absence.reasonCategory,
        'Statut': absence.isResolved ? 'Résolue' : 
                 absence.substituteName ? 'Remplaçant assigné' : 'En attente',
        'Remplaçant': absence.substituteName || 'Aucun',
        'Date de déclaration': new Date(absence.createdAt || absence.absenceDate).toLocaleDateString('fr-FR')
      }));

      // Créer le classeur
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Définir la largeur des colonnes
      const columnWidths = [
        { wch: 12 }, // Date
        { wch: 20 }, // Enseignant
        { wch: 15 }, // Matière
        { wch: 10 }, // Classe
        { wch: 10 }, // Heure début
        { wch: 10 }, // Heure fin
        { wch: 25 }, // Raison
        { wch: 12 }, // Catégorie
        { wch: 15 }, // Statut
        { wch: 20 }, // Remplaçant
        { wch: 15 }  // Date déclaration
      ];
      worksheet['!cols'] = columnWidths;

      // Ajouter la feuille au classeur
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Absences Enseignants');
      
      // Ajouter une feuille de statistiques
      const statsData = [
        { 'Métrique': 'Total des absences', 'Valeur': filteredAbsences.length },
        { 'Métrique': 'Absences résolues', 'Valeur': filteredAbsences.filter(a => a.isResolved).length },
        { 'Métrique': 'Remplaçants assignés', 'Valeur': filteredAbsences.filter(a => a.substituteName).length },
        { 'Métrique': 'En attente', 'Valeur': filteredAbsences.filter(a => !a.isResolved && !a.substituteName).length },
        { 'Métrique': 'Période du rapport', 'Valeur': getReportPeriodText() },
        { 'Métrique': 'Date de génération', 'Valeur': new Date().toLocaleDateString('fr-FR') }
      ];
      
      const statsWorksheet = XLSX.utils.json_to_sheet(statsData);
      XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Statistiques');
      
      // Télécharger le fichier
      const fileName = `rapport-absences-${reportPeriod}-${selectedMonth}-${selectedYear}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast({
        title: "✅ Rapport Excel généré",
        description: `Le rapport d'absences a été exporté avec succès.`,
      });
      
    } catch (error) {
      console.error('Erreur génération Excel:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de générer le rapport Excel.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  const getFilteredAbsences = () => {
    if (!absences) return [];
    
    return absences.filter(absence => {
      const absenceDate = new Date(absence.absenceDate);
      const absenceMonth = absenceDate.getMonth() + 1;
      const absenceYear = absenceDate.getFullYear();
      
      if (reportPeriod === 'monthly') {
        return absenceMonth === selectedMonth && absenceYear === selectedYear;
      } else if (reportPeriod === 'quarterly') {
        const quarter = Math.ceil(selectedMonth / 3);
        const absenceQuarter = Math.ceil(absenceMonth / 3);
        return absenceQuarter === quarter && absenceYear === selectedYear;
      } else if (reportPeriod === 'annual') {
        return absenceYear === selectedYear;
      }
      
      return true;
    });
  };

  const getReportPeriodText = () => {
    if (reportPeriod === 'monthly') {
      const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                         'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
      return `${monthNames[selectedMonth - 1]} ${selectedYear}`;
    } else if (reportPeriod === 'quarterly') {
      const quarter = Math.ceil(selectedMonth / 3);
      return `Trimestre ${quarter} ${selectedYear}`;
    } else if (reportPeriod === 'annual') {
      return `Année ${selectedYear}`;
    }
    return '';
  };

  const filteredAbsences = getFilteredAbsences();

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-sm text-gray-600 mt-2">Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête et contrôles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Rapports d'Absences</h3>
          <p className="text-sm text-gray-600">Générez des rapports PDF ou Excel des absences enseignants</p>
        </div>
        
        {/* Contrôles de période */}
        <div className="flex items-center space-x-3">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensuel</SelectItem>
              <SelectItem value="quarterly">Trimestriel</SelectItem>
              <SelectItem value="annual">Annuel</SelectItem>
            </SelectContent>
          </Select>
          
          {reportPeriod !== 'annual' && (
            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {new Date(2024, i).toLocaleDateString('fr-FR', { month: 'short' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 3 }, (_, i) => (
                <SelectItem key={2024 - i} value={(2024 - i).toString()}>
                  {2024 - i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistiques de la période */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{filteredAbsences.length}</p>
                <p className="text-sm text-gray-600">Total absences</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{filteredAbsences.filter(a => a.isResolved).length}</p>
                <p className="text-sm text-gray-600">Résolues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{filteredAbsences.filter(a => a.substituteName).length}</p>
                <p className="text-sm text-gray-600">Remplaçants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{filteredAbsences.filter(a => !a.isResolved && !a.substituteName).length}</p>
                <p className="text-sm text-gray-600">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions de génération */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={generatePDF}
          disabled={isGeneratingPDF || filteredAbsences.length === 0}
          className="flex items-center space-x-2"
          data-testid="button-generate-pdf-report"
        >
          {isGeneratingPDF ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          <span>{isGeneratingPDF ? 'Génération PDF...' : 'Générer PDF'}</span>
        </Button>
        
        <Button 
          onClick={generateExcel}
          disabled={isGeneratingExcel || filteredAbsences.length === 0}
          variant="outline"
          className="flex items-center space-x-2"
          data-testid="button-generate-excel-report"
        >
          {isGeneratingExcel ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{isGeneratingExcel ? 'Export Excel...' : 'Exporter Excel'}</span>
        </Button>
      </div>

      {/* Aperçu des données */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5" />
            <span>Aperçu - {getReportPeriodText()}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAbsences.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">{language === 'fr' ? 'Aucune absence trouvée pour cette période' : 'No absences found for this period'}</p>
              <p className="text-sm text-gray-500 mt-1">
                {language === 'fr' ? 'Sélectionnez une autre période ou attendez que des absences soient déclarées' : 'Select another period or wait for absences to be declared'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {filteredAbsences.slice(0, 10).map((absence) => (
                <div key={absence.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{absence.teacherName}</span>
                      <Badge variant="outline" className="text-xs">
                        {absence.subjectName}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(absence.absenceDate).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')} • {absence.startTime}-{absence.endTime}
                    </p>
                    <p className="text-xs text-gray-500">{translateReason(absence.reason)}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={absence.isResolved ? "default" : absence.substituteName ? "secondary" : "destructive"}>
                      {absence.isResolved ? (language === 'fr' ? 'Résolue' : 'Resolved') : absence.substituteName ? (language === 'fr' ? 'Remplaçant' : 'Substitute') : (language === 'fr' ? 'En attente' : 'Pending')}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {filteredAbsences.length > 10 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  {language === 'fr' ? `... et ${filteredAbsences.length - 10} autres absences` : `... and ${filteredAbsences.length - 10} more absences`}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherAbsenceManager;
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
  CheckCheck,
  User,
  BookOpen,
  Calendar,
  TrendingUp,
  History,
  Bell,
  BarChart3,
  PieChart,
  Trash2,
  FileText
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import GradeAnalyticsTab from './GradeAnalyticsTab';

// Bilingual trimesters config
const TRIMESTERS = [
  { key: 'T1', labelFR: 'Trimestre 1', labelEN: 'Term 1' },
  { key: 'T2', labelFR: 'Trimestre 2', labelEN: 'Term 2' },
  { key: 'T3', labelFR: 'Trimestre 3', labelEN: 'Term 3' }
];

interface GradeSubmission {
  id: number;
  teacherId: number;
  teacherFirstName: string;
  teacherLastName: string;
  studentId: number;
  studentFirstName: string;
  studentLastName: string;
  subjectId: number;
  subjectName: string;
  classId: number;
  className: string;
  term: string;
  academicYear: string;
  firstEvaluation: string;
  secondEvaluation: string;
  thirdEvaluation: string;
  termAverage: string;
  coefficient: number;
  maxScore: string;
  subjectComments: string;
  studentRank: number | null;
  isSubmitted: boolean;
  submittedAt: string | null;
  reviewStatus: string;
  reviewedBy: number | null;
  reviewedAt: string | null;
  reviewFeedback: string | null;
  returnReason: string | null;
  reviewPriority: string;
  requiresAttention: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TeacherGradeReview() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [activeTab, setActiveTab] = useState<string>('pending');

  // Selection state
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<number>>(new Set());
  
  // Review dialogs
  const [reviewingSubmission, setReviewingSubmission] = useState<GradeSubmission | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'return'>('approve');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [returnReason, setReturnReason] = useState('');
  
  // History modal
  const [historySubmissionId, setHistorySubmissionId] = useState<number | null>(null);
  
  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState<GradeSubmission | null>(null);

  // Text translations
  const text = {
    fr: {
      title: 'Révision des Notes Enseignants',
      subtitle: 'Consultez et approuvez les notes soumises par les enseignants',
      filters: 'Filtres',
      class: 'Classe',
      subject: 'Matière',
      term: 'Trimestre',
      status: 'Statut',
      allClasses: 'Toutes les classes',
      allSubjects: 'Toutes les matières',
      allTerms: 'Tous les trimestres',
      pending: 'En attente',
      approved: 'Approuvé',
      returned: 'Retourné',
      all: 'Tous',
      stats: 'Statistiques',
      totalSubmissions: 'Total',
      pendingCount: 'En attente',
      approvedCount: 'Approuvés',
      returnedCount: 'Retournés',
      selectAll: 'Tout sélectionner',
      bulkApprove: 'Approuver sélection',
      teacher: 'Enseignant',
      student: 'Élève',
      grade: 'Note',
      coefficient: 'Coef.',
      comments: 'Commentaires',
      actions: 'Actions',
      approve: 'Approuver',
      return: 'Retourner',
      reviewTitle: 'Réviser la note',
      approveTitle: 'Approuver la note',
      returnTitle: 'Retourner la note',
      feedback: 'Feedback (optionnel)',
      returnReasonLabel: 'Raison du retour (requis)',
      confirmApprove: 'Confirmer l\'approbation',
      confirmReturn: 'Confirmer le retour',
      cancel: 'Annuler',
      noSubmissions: 'Aucune soumission trouvée',
      noSubmissionsDesc: 'Il n\'y a pas de notes soumises correspondant aux filtres sélectionnés.',
      approvedSuccessfully: 'Note approuvée avec succès',
      returnedSuccessfully: 'Note retournée avec succès',
      bulkApproveSuccess: 'Notes approuvées en masse',
      bulkApproveDesc: '{count} notes ont été approuvées avec succès',
      error: 'Erreur',
      errorApproving: 'Erreur lors de l\'approbation',
      errorReturning: 'Erreur lors du retour',
      selectItems: 'Sélectionner des éléments',
      selectItemsDesc: 'Veuillez sélectionner au moins une note à approuver',
      firstEval: 'Eval 1',
      termAverage: 'Moyenne',
      submittedAt: 'Soumis le',
      reviewedAt: 'Révisé le',
      reviewFeedbackLabel: 'Feedback de révision',
      loading: 'Chargement...',
      history: 'Historique',
      notify: 'Notifier',
      historyTitle: 'Historique de Révision',
      historyDesc: 'Toutes les actions effectuées sur cette soumission',
      action: 'Action',
      reviewer: 'Réviseur',
      date: 'Date',
      noHistory: 'Aucun historique',
      notificationSent: 'Notification envoyée',
      notificationSentDesc: 'L\'enseignant a été notifié',
      errorSendingNotification: 'Erreur lors de l\'envoi',
      returnReason: 'Raison du retour',
      analytics: 'Analytiques',
      analyticsTitle: 'Statistiques Avancées',
      analyticsDesc: 'Analyse détaillée des soumissions de notes',
      approvalRate: 'Taux d\'approbation',
      byTeacher: 'Par enseignant',
      bySubject: 'Par matière',
      byClass: 'Par classe',
      noData: 'Aucune donnée disponible',
      delete: 'Supprimer',
      deleteTitle: 'Supprimer la note',
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer cette note approuvée?',
      deleteWarning: 'Cette action est irréversible. La note sera définitivement supprimée du système.',
      deleteSuccess: 'Note supprimée avec succès',
      deleteError: 'Erreur lors de la suppression'
    },
    en: {
      title: 'Teacher Grade Review',
      subtitle: 'Review and approve grades submitted by teachers',
      filters: 'Filters',
      class: 'Class',
      subject: 'Subject',
      term: 'Term',
      status: 'Status',
      allClasses: 'All classes',
      allSubjects: 'All subjects',
      allTerms: 'All terms',
      pending: 'Pending',
      approved: 'Approved',
      returned: 'Returned',
      all: 'All',
      stats: 'Statistics',
      totalSubmissions: 'Total',
      pendingCount: 'Pending',
      approvedCount: 'Approved',
      returnedCount: 'Returned',
      selectAll: 'Select all',
      bulkApprove: 'Approve selected',
      teacher: 'Teacher',
      student: 'Student',
      grade: 'Grade',
      coefficient: 'Coef.',
      comments: 'Comments',
      actions: 'Actions',
      approve: 'Approve',
      return: 'Return',
      reviewTitle: 'Review grade',
      approveTitle: 'Approve grade',
      returnTitle: 'Return grade',
      feedback: 'Feedback (optional)',
      returnReasonLabel: 'Return reason (required)',
      confirmApprove: 'Confirm approval',
      confirmReturn: 'Confirm return',
      cancel: 'Cancel',
      noSubmissions: 'No submissions found',
      noSubmissionsDesc: 'There are no grade submissions matching the selected filters.',
      approvedSuccessfully: 'Grade approved successfully',
      returnedSuccessfully: 'Grade returned successfully',
      bulkApproveSuccess: 'Bulk approval successful',
      bulkApproveDesc: '{count} grades have been approved successfully',
      error: 'Error',
      errorApproving: 'Error approving grade',
      errorReturning: 'Error returning grade',
      selectItems: 'Select items',
      selectItemsDesc: 'Please select at least one grade to approve',
      firstEval: 'Eval 1',
      termAverage: 'Average',
      submittedAt: 'Submitted on',
      reviewedAt: 'Reviewed on',
      reviewFeedbackLabel: 'Review feedback',
      loading: 'Loading...',
      history: 'History',
      notify: 'Notify',
      historyTitle: 'Review History',
      historyDesc: 'All actions performed on this submission',
      action: 'Action',
      reviewer: 'Reviewer',
      date: 'Date',
      noHistory: 'No history',
      notificationSent: 'Notification sent',
      notificationSentDesc: 'The teacher has been notified',
      errorSendingNotification: 'Error sending notification',
      returnReason: 'Return reason',
      analytics: 'Analytics',
      analyticsTitle: 'Advanced Statistics',
      analyticsDesc: 'Detailed analysis of grade submissions',
      approvalRate: 'Approval Rate',
      byTeacher: 'By Teacher',
      bySubject: 'By Subject',
      byClass: 'By Class',
      noData: 'No data available',
      delete: 'Delete',
      deleteTitle: 'Delete Grade',
      deleteConfirm: 'Are you sure you want to delete this approved grade?',
      deleteWarning: 'This action is irreversible. The grade will be permanently removed from the system.',
      deleteSuccess: 'Grade deleted successfully',
      deleteError: 'Error deleting grade'
    }
  };

  const t = text[language];

  // Fetch grade submissions
  const { data: submissionsData, isLoading } = useQuery({
    queryKey: ['/api/director/teacher-grade-submissions', selectedClass, selectedSubject, selectedTerm, selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedClass) params.append('classId', selectedClass);
      if (selectedSubject) params.append('subjectId', selectedSubject);
      if (selectedTerm) params.append('term', selectedTerm);
      if (selectedStatus) params.append('reviewStatus', selectedStatus);

      const response = await fetch(`/api/director/teacher-grade-submissions?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch submissions');
      return response.json();
    }
  });

  const submissions: GradeSubmission[] = submissionsData?.submissions || [];
  const stats = submissionsData?.stats || { total: 0, byStatus: {} };

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, feedback }: { id: number; feedback?: string }) => {
      return apiRequest('POST', `/api/director/teacher-grade-submissions/${id}/approve`, { feedback });
    },
    onSuccess: () => {
      // ✅ FIX: Invalidate ALL teacher-grade-submissions queries to ensure approved grades refresh everywhere
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0]?.toString().includes('teacher-grade-submissions');
        }
      });
      // Also invalidate direct queries
      queryClient.invalidateQueries({ queryKey: ['/api/director/teacher-grade-submissions'] });
      toast({
        title: t.approvedSuccessfully,
        description: language === 'fr' ? 'La note a été approuvée et est maintenant disponible pour la création de bulletins.' : 'The grade has been approved and is now available for report card creation.'
      });
      setReviewingSubmission(null);
      setReviewFeedback('');
    },
    onError: () => {
      toast({
        title: t.error,
        description: t.errorApproving,
        variant: 'destructive'
      });
    }
  });

  // Return mutation
  const returnMutation = useMutation({
    mutationFn: async ({ id, returnReason, feedback }: { id: number; returnReason: string; feedback?: string }) => {
      return apiRequest('POST', `/api/director/teacher-grade-submissions/${id}/return`, { returnReason, feedback });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/director/teacher-grade-submissions'] });
      toast({
        title: t.returnedSuccessfully,
        description: language === 'fr' ? 'La note a été retournée à l\'enseignant pour révision.' : 'The grade has been returned to the teacher for revision.'
      });
      setReviewingSubmission(null);
      setReturnReason('');
      setReviewFeedback('');
    },
    onError: () => {
      toast({
        title: t.error,
        description: t.errorReturning,
        variant: 'destructive'
      });
    }
  });

  // Bulk approve mutation
  const bulkApproveMutation = useMutation({
    mutationFn: async (submissionIds: number[]) => {
      return apiRequest('POST', '/api/director/teacher-grade-submissions/bulk-approve', { submissionIds });
    },
    onSuccess: (data: any) => {
      // ✅ FIX: Invalidate ALL teacher-grade-submissions queries to ensure approved grades refresh everywhere
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0]?.toString().includes('teacher-grade-submissions');
        }
      });
      queryClient.invalidateQueries({ queryKey: ['/api/director/teacher-grade-submissions'] });
      const approvedCount = data.approvedCount || selectedSubmissions.size;
      toast({
        title: t.bulkApproveSuccess,
        description: t.bulkApproveDesc.replace('{count}', approvedCount.toString())
      });
      setSelectedSubmissions(new Set());
    },
    onError: () => {
      toast({
        title: t.error,
        description: t.errorApproving,
        variant: 'destructive'
      });
    }
  });

  // Handle selection
  const toggleSelection = (id: number) => {
    const newSelection = new Set(selectedSubmissions);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedSubmissions(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedSubmissions.size === submissions.length) {
      setSelectedSubmissions(new Set());
    } else {
      setSelectedSubmissions(new Set(submissions.map(s => s.id)));
    }
  };

  const handleBulkApprove = () => {
    if (selectedSubmissions.size === 0) {
      toast({
        title: t.selectItems,
        description: t.selectItemsDesc,
        variant: 'destructive'
      });
      return;
    }
    bulkApproveMutation.mutate(Array.from(selectedSubmissions));
  };

  // Fetch history for a specific submission
  const { data: historyData } = useQuery({
    queryKey: ['/api/director/teacher-grade-submissions', historySubmissionId, 'history'],
    queryFn: async () => {
      if (!historySubmissionId) return null;
      const response = await apiRequest('GET', `/api/director/teacher-grade-submissions/${historySubmissionId}/history`);
      return await response.json();
    },
    enabled: !!historySubmissionId
  });

  const history = historyData?.history || [];

  // Notify teacher mutation
  const notifyMutation = useMutation({
    mutationFn: async (submissionId: number) => {
      return apiRequest('POST', `/api/director/teacher-grade-submissions/${submissionId}/notify`);
    },
    onSuccess: () => {
      toast({
        title: t.notificationSent,
        description: t.notificationSentDesc,
      });
    },
    onError: () => {
      toast({
        title: t.error,
        description: t.errorSendingNotification,
        variant: 'destructive'
      });
    }
  });

  // Delete grade mutation
  const deleteMutation = useMutation({
    mutationFn: async (submissionId: number) => {
      return apiRequest('DELETE', `/api/director/teacher-grade-submissions/${submissionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0]?.toString().includes('teacher-grade-submissions');
        }
      });
      queryClient.invalidateQueries({ queryKey: ['/api/director/teacher-grade-submissions'] });
      toast({
        title: t.deleteSuccess,
        description: language === 'fr' ? 'La note a été supprimée du système.' : 'The grade has been removed from the system.'
      });
      setDeleteConfirmOpen(false);
      setGradeToDelete(null);
    },
    onError: () => {
      toast({
        title: t.error,
        description: t.deleteError,
        variant: 'destructive'
      });
    }
  });

  const handleDeleteClick = (submission: GradeSubmission) => {
    setGradeToDelete(submission);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (gradeToDelete) {
      deleteMutation.mutate(gradeToDelete.id);
    }
  };

  // Fetch analytics
  const { data: analyticsData } = useQuery({
    queryKey: ['/api/director/teacher-grade-submissions', 'analytics'],
    queryFn: async () => {
      const response = await fetch('/api/director/teacher-grade-submissions/analytics', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    enabled: activeTab === 'analytics'
  });

  const analytics = analyticsData?.stats || null;

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" />{t.pending}</Badge>,
      approved: <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />{t.approved}</Badge>,
      returned: <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />{t.returned}</Badge>
    };
    return badges[status as keyof typeof badges] || status;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
        <p className="text-sm text-gray-600 mt-1">{t.subtitle}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.totalSubmissions}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.pendingCount}</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.byStatus?.pending || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.approvedCount}</p>
                <p className="text-2xl font-bold text-green-600">{stats.byStatus?.approved || 0}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.returnedCount}</p>
                <p className="text-2xl font-bold text-red-600">{stats.byStatus?.returned || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        if (value !== 'analytics') {
          setSelectedStatus(value === 'all' ? '' : value);
        }
      }}>
        <TabsList className="grid w-full grid-cols-5 h-auto p-1.5 bg-[#F3F5F7] rounded-xl gap-1">
          <TabsTrigger value="all" className="flex items-center justify-center gap-2 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm">
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span className="hidden lg:inline truncate">{t.all}</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center justify-center gap-2 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="hidden lg:inline truncate">{t.pending}</span>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center justify-center gap-2 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="hidden lg:inline truncate">{t.approved}</span>
          </TabsTrigger>
          <TabsTrigger value="returned" className="flex items-center justify-center gap-2 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span className="hidden lg:inline truncate">{t.returned}</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center justify-center gap-2 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm">
            <BarChart3 className="w-4 h-4 flex-shrink-0" />
            <span className="hidden lg:inline truncate">{t.analytics}</span>
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab Content */}
        <TabsContent value="analytics" className="mt-6">
          <GradeAnalyticsTab analytics={analytics} />
        </TabsContent>

        {/* Submissions Tabs Content (All, Pending, Approved, Returned) */}
        {['all', 'pending', 'approved', 'returned'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6 space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  {t.filters}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>{t.class}</Label>
                    <Input
                      placeholder={t.allClasses}
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>{t.subject}</Label>
                    <Input
                      placeholder={t.allSubjects}
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>{t.term}</Label>
                    <Select value={selectedTerm || undefined} onValueChange={setSelectedTerm}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.allTerms} />
                      </SelectTrigger>
                      <SelectContent>
                        {TRIMESTERS.map((term) => (
                          <SelectItem key={term.key} value={term.key}>
                            {language === 'fr' ? term.labelFR : term.labelEN}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

      {/* Bulk Actions */}
      {selectedSubmissions.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-800">
                {selectedSubmissions.size} {language === 'fr' ? 'notes sélectionnées' : 'grades selected'}
              </p>
              <Button
                onClick={handleBulkApprove}
                disabled={bulkApproveMutation.isPending}
                data-testid="button-bulk-approve"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                {t.bulkApprove}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{language === 'fr' ? 'Soumissions de notes' : 'Grade submissions'}</CardTitle>
            {submissions.length > 0 && (
              <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                <Checkbox checked={selectedSubmissions.size === submissions.length} className="mr-2" />
                {t.selectAll}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">{t.loading}</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">{t.noSubmissions}</p>
              <p className="text-sm text-gray-500 mt-1">{t.noSubmissionsDesc}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">
                      <Checkbox 
                        checked={selectedSubmissions.size === submissions.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">{t.teacher}</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">{t.student}</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">{t.subject}</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">{t.class}</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">{t.term}</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">{t.firstEval}</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">{t.termAverage}</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">{t.coefficient}</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">{t.status}</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedSubmissions.has(submission.id)}
                          onCheckedChange={() => toggleSelection(submission.id)}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{submission.teacherFirstName} {submission.teacherLastName}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">{submission.studentFirstName} {submission.studentLastName}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{submission.subjectName}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">{submission.className}</td>
                      <td className="p-3 text-sm">{submission.term}</td>
                      <td className="p-3 text-sm font-medium">{submission.firstEvaluation}</td>
                      <td className="p-3 text-sm font-bold text-blue-600">{submission.termAverage}</td>
                      <td className="p-3 text-sm">{submission.coefficient}</td>
                      <td className="p-3">{getStatusBadge(submission.reviewStatus)}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {submission.reviewStatus === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setReviewingSubmission(submission);
                                  setReviewAction('approve');
                                }}
                                data-testid={`button-approve-${submission.id}`}
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setReviewingSubmission(submission);
                                  setReviewAction('return');
                                }}
                                data-testid={`button-return-${submission.id}`}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setHistorySubmissionId(submission.id)}
                            title={t.history}
                            data-testid={`button-history-${submission.id}`}
                          >
                            <History className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => notifyMutation.mutate(submission.id)}
                            title={t.notify}
                            disabled={notifyMutation.isPending}
                            data-testid={`button-notify-${submission.id}`}
                          >
                            <Bell className="h-4 w-4 text-purple-600" />
                          </Button>
                          {submission.reviewStatus === 'approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteClick(submission)}
                              title={t.delete}
                              disabled={deleteMutation.isPending}
                              data-testid={`button-delete-${submission.id}`}
                              className="border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!reviewingSubmission} onOpenChange={() => setReviewingSubmission(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? t.approveTitle : t.returnTitle}
            </DialogTitle>
            <DialogDescription>
              {reviewingSubmission && (
                <div className="mt-4 space-y-2 text-sm">
                  <p><strong>{t.teacher}:</strong> {reviewingSubmission.teacherFirstName} {reviewingSubmission.teacherLastName}</p>
                  <p><strong>{t.student}:</strong> {reviewingSubmission.studentFirstName} {reviewingSubmission.studentLastName}</p>
                  <p><strong>{t.subject}:</strong> {reviewingSubmission.subjectName}</p>
                  <p><strong>{t.grade}:</strong> {reviewingSubmission.termAverage}/20</p>
                  {reviewingSubmission.subjectComments && (
                    <p><strong>{t.comments}:</strong> {reviewingSubmission.subjectComments}</p>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {reviewAction === 'return' && (
              <div>
                <Label>{t.returnReasonLabel}</Label>
                <Textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder={language === 'fr' ? 'Expliquez pourquoi cette note est retournée...' : 'Explain why this grade is being returned...'}
                  rows={3}
                />
              </div>
            )}
            <div>
              <Label>{t.feedback}</Label>
              <Textarea
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                placeholder={language === 'fr' ? 'Feedback additionnel...' : 'Additional feedback...'}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewingSubmission(null)}>
              {t.cancel}
            </Button>
            <Button
              onClick={() => {
                if (reviewingSubmission) {
                  if (reviewAction === 'approve') {
                    approveMutation.mutate({ 
                      id: reviewingSubmission.id, 
                      feedback: reviewFeedback 
                    });
                  } else {
                    if (!returnReason.trim()) {
                      toast({
                        title: t.error,
                        description: t.returnReasonLabel,
                        variant: 'destructive'
                      });
                      return;
                    }
                    returnMutation.mutate({ 
                      id: reviewingSubmission.id, 
                      returnReason, 
                      feedback: reviewFeedback 
                    });
                  }
                }
              }}
              disabled={approveMutation.isPending || returnMutation.isPending}
            >
              {reviewAction === 'approve' ? t.confirmApprove : t.confirmReturn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={!!historySubmissionId} onOpenChange={() => setHistorySubmissionId(null)}>
        <DialogContent className="max-w-3xl bg-white">
          <DialogHeader>
            <DialogTitle>{t.historyTitle}</DialogTitle>
            <DialogDescription>{t.historyDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>{t.noHistory}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((entry: any, index: number) => (
                  <div 
                    key={index}
                    className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {entry.reviewAction === 'approved' && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {t.approved}
                          </Badge>
                        )}
                        {entry.reviewAction === 'returned' && (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            {t.returned}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(entry.createdAt).toLocaleString(
                          language === 'fr' ? 'fr-FR' : 'en-US',
                          { dateStyle: 'medium', timeStyle: 'short' }
                        )}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>{t.reviewer}:</strong>{' '}
                        {entry.reviewerFirstName} {entry.reviewerLastName}
                      </p>
                      
                      {entry.previousStatus && entry.newStatus && (
                        <p>
                          <strong>{t.status}:</strong>{' '}
                          <span className="text-gray-600">{entry.previousStatus}</span>
                          {' → '}
                          <span className="font-medium">{entry.newStatus}</span>
                        </p>
                      )}
                      
                      {entry.feedback && (
                        <p>
                          <strong>{t.feedback}:</strong>{' '}
                          <span className="text-gray-700 dark:text-gray-300">{entry.feedback}</span>
                        </p>
                      )}
                      
                      {entry.returnReason && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 mt-2">
                          <p className="font-medium text-red-800 dark:text-red-300 mb-1">
                            {t.returnReason}:
                          </p>
                          <p className="text-red-700 dark:text-red-400">{entry.returnReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setHistorySubmissionId(null)}
              data-testid="button-close-history"
            >
              {t.cancel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {gradeToDelete && (
                <div className="space-y-3">
                  <p className="text-red-600 font-medium">{t.deleteConfirm}</p>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
                    <p><strong>{t.student}:</strong> {gradeToDelete.studentFirstName} {gradeToDelete.studentLastName}</p>
                    <p><strong>{t.subject}:</strong> {gradeToDelete.subjectName}</p>
                    <p><strong>{t.class}:</strong> {gradeToDelete.className}</p>
                    <p><strong>{t.term}:</strong> {gradeToDelete.term}</p>
                    <p><strong>{t.grade}:</strong> {gradeToDelete.termAverage}/20</p>
                  </div>
                  <p className="text-sm text-gray-500">{t.deleteWarning}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              {t.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending 
                ? (language === 'fr' ? 'Suppression...' : 'Deleting...') 
                : t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

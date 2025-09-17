import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  BookOpen, 
  Calendar, 
  Filter, 
  Search,
  MoreHorizontal,
  Eye,
  MessageSquare,
  RefreshCw,
  Download,
  Upload,
  AlertCircleIcon,
  TrendingUp,
  BarChart3,
  Users,
  FileText,
  Send,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  StarIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Types for grade submissions
interface GradeSubmission {
  id: number;
  teacherId: number;
  studentId: number;
  subjectId: number;
  classId: number;
  term: string;
  academicYear: string;
  
  // Grade data
  firstEvaluation: number | null;
  secondEvaluation: number | null;
  thirdEvaluation: number | null;
  termAverage: number | null;
  coefficient: number;
  subjectComments: string | null;
  
  // Review fields
  reviewStatus: 'pending' | 'under_review' | 'approved' | 'returned' | 'changes_requested';
  reviewPriority: 'urgent' | 'normal' | 'low';
  requiresAttention: boolean;
  reviewFeedback: string | null;
  returnReason: string | null;
  
  // Timestamps
  submittedAt: string;
  reviewedAt: string | null;
  lastStatusChange: string;
  
  // Related data
  teacherName: string;
  teacherEmail: string;
  subjectName: string;
  className: string;
}

interface ReviewQueueData {
  submissions: GradeSubmission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics: {
    pending: number;
    under_review: number;
    approved: number;
    returned: number;
    changes_requested: number;
  };
}

interface BulkReviewAction {
  submissionIds: number[];
  reviewAction: 'approved' | 'returned' | 'changes_requested';
  feedback?: string;
  returnReason?: string;
}

const GradeReviewQueue: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for filtering and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [teacherFilter, setTeacherFilter] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('');
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // State for bulk operations
  const [selectedSubmissions, setSelectedSubmissions] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<'approved' | 'returned' | 'changes_requested' | null>(null);
  const [bulkFeedback, setBulkFeedback] = useState('');
  const [bulkReturnReason, setBulkReturnReason] = useState('');
  
  // Dialog states
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<GradeSubmission | null>(null);

  // Bilingual text content
  const text = {
    fr: {
      // Page titles
      title: 'Queue de Révision des Notes',
      subtitle: 'Examinez et approuvez les soumissions de notes des enseignants',
      
      // Tabs
      pending: 'En Attente',
      underReview: 'En Révision',
      approved: 'Approuvées',
      returned: 'Retournées',
      changesRequested: 'Modifications Demandées',
      all: 'Toutes',
      
      // Filters
      filterBy: 'Filtrer par',
      teacher: 'Enseignant',
      class: 'Classe',
      subject: 'Matière',
      priority: 'Priorité',
      search: 'Rechercher...',
      urgent: 'Urgent',
      normal: 'Normal',
      low: 'Faible',
      
      // Actions
      selectAll: 'Sélectionner tout',
      selected: 'sélectionnés',
      bulkActions: 'Actions groupées',
      approve: 'Approuver',
      return: 'Retourner',
      requestChanges: 'Demander modifications',
      viewDetails: 'Voir détails',
      refresh: 'Actualiser',
      
      // Status badges
      statusPending: 'En attente',
      statusUnderReview: 'En révision',
      statusApproved: 'Approuvé',
      statusReturned: 'Retourné',
      statusChangesRequested: 'Modifications demandées',
      
      // Priority badges
      priorityUrgent: 'Urgent',
      priorityNormal: 'Normal',
      priorityLow: 'Faible',
      
      // Table headers
      submission: 'Soumission',
      submittedBy: 'Soumis par',
      submittedAt: 'Soumis le',
      status: 'Statut',
      actions: 'Actions',
      grades: 'Notes',
      comments: 'Commentaires',
      
      // Bulk dialog
      bulkReviewTitle: 'Révision Groupée',
      bulkReviewDescription: 'Appliquer une action à {count} soumissions sélectionnées',
      selectAction: 'Sélectionner une action',
      feedback: 'Commentaire (optionnel)',
      returnReason: 'Raison du retour (optionnel)',
      cancel: 'Annuler',
      apply: 'Appliquer',
      
      // Detail dialog
      submissionDetails: 'Détails de la Soumission',
      gradeDetails: 'Détails des Notes',
      reviewHistory: 'Historique de Révision',
      
      // Statistics
      totalSubmissions: 'Total des soumissions',
      pendingReview: 'En attente de révision',
      completedToday: 'Complétées aujourd\'hui',
      averageTime: 'Temps moyen de révision',
      
      // Messages
      noSubmissions: 'Aucune soumission trouvée',
      loadingSubmissions: 'Chargement des soumissions...',
      reviewSuccess: 'Révision effectuée avec succès',
      bulkReviewSuccess: 'Révision groupée effectuée avec succès',
      errorLoading: 'Erreur lors du chargement',
      errorReviewing: 'Erreur lors de la révision',
      
      // Notifications
      approvedNotification: 'Soumission approuvée',
      returnedNotification: 'Soumission retournée',
      changesRequestedNotification: 'Modifications demandées',
      bulkApprovedNotification: '{count} soumissions approuvées',
      bulkReturnedNotification: '{count} soumissions retournées',
      
      // Pagination
      page: 'Page',
      of: 'sur',
      previous: 'Précédent',
      next: 'Suivant',
      showing: 'Affichage de',
      to: 'à',
      results: 'résultats'
    },
    en: {
      // Page titles
      title: 'Grade Review Queue',
      subtitle: 'Review and approve teacher grade submissions',
      
      // Tabs
      pending: 'Pending',
      underReview: 'Under Review',
      approved: 'Approved',
      returned: 'Returned',
      changesRequested: 'Changes Requested',
      all: 'All',
      
      // Filters
      filterBy: 'Filter by',
      teacher: 'Teacher',
      class: 'Class',
      subject: 'Subject',
      priority: 'Priority',
      search: 'Search...',
      urgent: 'Urgent',
      normal: 'Normal',
      low: 'Low',
      
      // Actions
      selectAll: 'Select All',
      selected: 'selected',
      bulkActions: 'Bulk Actions',
      approve: 'Approve',
      return: 'Return',
      requestChanges: 'Request Changes',
      viewDetails: 'View Details',
      refresh: 'Refresh',
      
      // Status badges
      statusPending: 'Pending',
      statusUnderReview: 'Under Review',
      statusApproved: 'Approved',
      statusReturned: 'Returned',
      statusChangesRequested: 'Changes Requested',
      
      // Priority badges
      priorityUrgent: 'Urgent',
      priorityNormal: 'Normal',
      priorityLow: 'Low',
      
      // Table headers
      submission: 'Submission',
      submittedBy: 'Submitted by',
      submittedAt: 'Submitted at',
      status: 'Status',
      actions: 'Actions',
      grades: 'Grades',
      comments: 'Comments',
      
      // Bulk dialog
      bulkReviewTitle: 'Bulk Review',
      bulkReviewDescription: 'Apply action to {count} selected submissions',
      selectAction: 'Select an action',
      feedback: 'Feedback (optional)',
      returnReason: 'Return reason (optional)',
      cancel: 'Cancel',
      apply: 'Apply',
      
      // Detail dialog
      submissionDetails: 'Submission Details',
      gradeDetails: 'Grade Details',
      reviewHistory: 'Review History',
      
      // Statistics
      totalSubmissions: 'Total submissions',
      pendingReview: 'Pending review',
      completedToday: 'Completed today',
      averageTime: 'Average review time',
      
      // Messages
      noSubmissions: 'No submissions found',
      loadingSubmissions: 'Loading submissions...',
      reviewSuccess: 'Review completed successfully',
      bulkReviewSuccess: 'Bulk review completed successfully',
      errorLoading: 'Error loading submissions',
      errorReviewing: 'Error processing review',
      
      // Notifications
      approvedNotification: 'Submission approved',
      returnedNotification: 'Submission returned',
      changesRequestedNotification: 'Changes requested',
      bulkApprovedNotification: '{count} submissions approved',
      bulkReturnedNotification: '{count} submissions returned',
      
      // Pagination
      page: 'Page',
      of: 'of',
      previous: 'Previous',
      next: 'Next',
      showing: 'Showing',
      to: 'to',
      results: 'results'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch review queue data
  const { data: reviewData, isLoading, error, refetch } = useQuery<ReviewQueueData>({
    queryKey: ['gradeReviewQueue', {
      page: currentPage,
      status: statusFilter,
      teacher: teacherFilter,
      class: classFilter,
      subject: subjectFilter,
      priority: priorityFilter,
      search: searchQuery,
      sortBy,
      sortOrder
    }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy,
        sortOrder,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(teacherFilter && { teacherId: teacherFilter }),
        ...(classFilter && { classId: classFilter }),
        ...(subjectFilter && { subjectId: subjectFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter })
      });

      const response = await fetch(`/api/grade-review/queue?${params}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch review queue');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch review queue');
      }

      return result.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Single submission review mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ submissionId, reviewAction, feedback, returnReason }: {
      submissionId: number;
      reviewAction: 'approved' | 'returned' | 'changes_requested';
      feedback?: string;
      returnReason?: string;
    }) => {
      const response = await fetch('/api/grade-review/review', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          reviewAction,
          feedback,
          returnReason,
          reviewPriority: 'normal'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process review');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gradeReviewQueue'] });
      toast({
        title: t.reviewSuccess,
        description: `${t[data.data.reviewAction === 'approved' ? 'approvedNotification' : 
                       data.data.reviewAction === 'returned' ? 'returnedNotification' : 
                       'changesRequestedNotification']}`
      });
    },
    onError: (error) => {
      console.error('Review error:', error);
      toast({
        title: t.errorReviewing,
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Bulk review mutation
  const bulkReviewMutation = useMutation({
    mutationFn: async (bulkData: BulkReviewAction) => {
      const response = await fetch('/api/grade-review/bulk-review', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkData)
      });

      if (!response.ok) {
        throw new Error('Failed to process bulk review');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gradeReviewQueue'] });
      setSelectedSubmissions([]);
      setShowBulkDialog(false);
      setBulkFeedback('');
      setBulkReturnReason('');
      
      toast({
        title: t.bulkReviewSuccess,
        description: t[data.data.reviewAction === 'approved' ? 'bulkApprovedNotification' : 'bulkReturnedNotification']
          .replace('{count}', data.data.processed.toString())
      });
    },
    onError: (error) => {
      console.error('Bulk review error:', error);
      toast({
        title: t.errorReviewing,
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Helper functions
  const getStatusBadge = (status: GradeSubmission['reviewStatus']) => {
    const variants = {
      pending: 'secondary',
      under_review: 'outline', 
      approved: 'default',
      returned: 'destructive',
      changes_requested: 'secondary'
    } as const;

    const labels = {
      pending: t.statusPending,
      under_review: t.statusUnderReview,
      approved: t.statusApproved,
      returned: t.statusReturned,
      changes_requested: t.statusChangesRequested
    };

    return (
      <Badge variant={variants[status]} data-testid={`status-badge-${status}`}>
        {labels[status]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: GradeSubmission['reviewPriority']) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      normal: 'bg-blue-100 text-blue-800 border-blue-200',
      low: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const labels = {
      urgent: t.priorityUrgent,
      normal: t.priorityNormal,
      low: t.priorityLow
    };

    return (
      <Badge className={colors[priority]} variant="outline" data-testid={`priority-badge-${priority}`}>
        {labels[priority]}
      </Badge>
    );
  };

  const handleSingleReview = (submissionId: number, action: 'approved' | 'returned' | 'changes_requested') => {
    reviewMutation.mutate({
      submissionId,
      reviewAction: action
    });
  };

  const handleBulkReview = () => {
    if (!bulkAction || selectedSubmissions.length === 0) return;

    bulkReviewMutation.mutate({
      submissionIds: selectedSubmissions,
      reviewAction: bulkAction,
      feedback: bulkFeedback || undefined,
      returnReason: bulkReturnReason || undefined
    });
  };

  const handleSelectAll = () => {
    if (!reviewData?.submissions) return;
    
    if (selectedSubmissions.length === reviewData.submissions.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(reviewData.submissions.map(s => s.id));
    }
  };

  const isAllSelected = reviewData?.submissions && selectedSubmissions.length === reviewData.submissions.length;

  // Statistics summary
  const statisticsCards = reviewData?.statistics ? [
    {
      label: t.pendingReview,
      value: reviewData.statistics.pending,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      label: t.statusUnderReview,
      value: reviewData.statistics.under_review,
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: t.statusApproved,
      value: reviewData.statistics.approved,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: t.statusReturned,
      value: reviewData.statistics.returned,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ] : [];

  return (
    <div className="space-y-6" data-testid="grade-review-queue">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="page-title">
          {t.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400" data-testid="page-subtitle">
          {t.subtitle}
        </p>
      </div>

      {/* Statistics Cards */}
      {reviewData?.statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statisticsCards.map((stat, index) => (
            <Card key={index} data-testid={`stat-card-${index}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters and Actions */}
      <Card data-testid="filters-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>{t.filterBy}</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                data-testid="refresh-button"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {t.refresh}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="status-filter">{t.status}</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all}</SelectItem>
                  <SelectItem value="pending">{t.pending}</SelectItem>
                  <SelectItem value="under_review">{t.underReview}</SelectItem>
                  <SelectItem value="approved">{t.approved}</SelectItem>
                  <SelectItem value="returned">{t.returned}</SelectItem>
                  <SelectItem value="changes_requested">{t.changesRequested}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority-filter">{t.priority}</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger data-testid="priority-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all}</SelectItem>
                  <SelectItem value="urgent">{t.urgent}</SelectItem>
                  <SelectItem value="normal">{t.normal}</SelectItem>
                  <SelectItem value="low">{t.low}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <Label htmlFor="search">{t.search}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder={t.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setCurrentPage(1);
                  refetch();
                }}
                className="w-full"
                data-testid="apply-filters-button"
              >
                <Filter className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Appliquer' : 'Apply'}
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedSubmissions.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">
                  {selectedSubmissions.length} {t.selected}
                </span>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setBulkAction('approved');
                      setShowBulkDialog(true);
                    }}
                    data-testid="bulk-approve-button"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {t.approve}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setBulkAction('returned');
                      setShowBulkDialog(true);
                    }}
                    data-testid="bulk-return-button"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    {t.return}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setBulkAction('changes_requested');
                      setShowBulkDialog(true);
                    }}
                    data-testid="bulk-changes-button"
                  >
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {t.requestChanges}
                  </Button>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedSubmissions([])}
                data-testid="clear-selection-button"
              >
                {language === 'fr' ? 'Effacer sélection' : 'Clear Selection'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submissions List */}
      <Card data-testid="submissions-list">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {reviewData && `${reviewData.pagination.total} ${t.results}`}
            </CardTitle>
            {reviewData?.submissions && reviewData.submissions.length > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  data-testid="select-all-checkbox"
                />
                <span className="text-sm">{t.selectAll}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8" data-testid="loading-state">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span>{t.loadingSubmissions}</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600" data-testid="error-state">
              <AlertCircleIcon className="w-12 h-12 mx-auto mb-4" />
              <p>{t.errorLoading}</p>
              <Button onClick={() => refetch()} className="mt-4">
                {t.refresh}
              </Button>
            </div>
          ) : !reviewData?.submissions || reviewData.submissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500" data-testid="empty-state">
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <p>{t.noSubmissions}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewData.submissions.map((submission) => (
                <Card 
                  key={submission.id} 
                  className={`transition-all duration-200 ${selectedSubmissions.includes(submission.id) ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/10' : ''}`}
                  data-testid={`submission-card-${submission.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <Checkbox
                        checked={selectedSubmissions.includes(submission.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSubmissions(prev => [...prev, submission.id]);
                          } else {
                            setSelectedSubmissions(prev => prev.filter(id => id !== submission.id));
                          }
                        }}
                        data-testid={`submission-checkbox-${submission.id}`}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                          <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{submission.teacherName}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <BookOpen className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {submission.className} - {submission.subjectName}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {getPriorityBadge(submission.reviewPriority)}
                            {getStatusBadge(submission.reviewStatus)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                          <div>
                            <span className="text-sm text-gray-500">{t.grades}:</span>
                            <div className="text-sm">
                              T1: {submission.firstEvaluation || '--'} | 
                              T2: {submission.secondEvaluation || '--'} | 
                              T3: {submission.thirdEvaluation || '--'}
                            </div>
                            {submission.termAverage && (
                              <div className="text-sm font-medium">
                                {language === 'fr' ? 'Moyenne' : 'Average'}: {submission.termAverage}
                              </div>
                            )}
                          </div>

                          <div>
                            <span className="text-sm text-gray-500">{t.submittedAt}:</span>
                            <div className="text-sm">
                              {new Date(submission.submittedAt).toLocaleDateString(language)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(submission.submittedAt).toLocaleTimeString(language)}
                            </div>
                          </div>

                          <div>
                            {submission.subjectComments && (
                              <>
                                <span className="text-sm text-gray-500">{t.comments}:</span>
                                <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                  {submission.subjectComments}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            {language === 'fr' ? 'ID' : 'ID'}: {submission.id} | 
                            {language === 'fr' ? ' Trimestre' : ' Term'}: {submission.term} | 
                            {language === 'fr' ? ' Année' : ' Year'}: {submission.academicYear}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setShowDetailDialog(true);
                              }}
                              data-testid={`view-details-${submission.id}`}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              {t.viewDetails}
                            </Button>

                            {submission.reviewStatus === 'pending' && (
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleSingleReview(submission.id, 'approved')}
                                  disabled={reviewMutation.isPending}
                                  data-testid={`approve-${submission.id}`}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  {t.approve}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSingleReview(submission.id, 'returned')}
                                  disabled={reviewMutation.isPending}
                                  data-testid={`return-${submission.id}`}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  {t.return}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSingleReview(submission.id, 'changes_requested')}
                                  disabled={reviewMutation.isPending}
                                  data-testid={`changes-${submission.id}`}
                                >
                                  <AlertTriangle className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {reviewData?.pagination && reviewData.pagination.totalPages > 1 && (
        <Card data-testid="pagination">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {t.showing} {((reviewData.pagination.page - 1) * 20) + 1} {t.to} {Math.min(reviewData.pagination.page * 20, reviewData.pagination.total)} {t.of} {reviewData.pagination.total} {t.results}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  data-testid="previous-page"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  {t.previous}
                </Button>
                
                <span className="text-sm">
                  {t.page} {currentPage} {t.of} {reviewData.pagination.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(reviewData.pagination.totalPages, prev + 1))}
                  disabled={currentPage >= reviewData.pagination.totalPages}
                  data-testid="next-page"
                >
                  {t.next}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Review Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent data-testid="bulk-review-dialog">
          <DialogHeader>
            <DialogTitle>{t.bulkReviewTitle}</DialogTitle>
            <DialogDescription>
              {t.bulkReviewDescription.replace('{count}', selectedSubmissions.length.toString())}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>{t.selectAction}</Label>
              <Select value={bulkAction || ''} onValueChange={(value) => setBulkAction(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">{t.approve}</SelectItem>
                  <SelectItem value="returned">{t.return}</SelectItem>
                  <SelectItem value="changes_requested">{t.requestChanges}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t.feedback}</Label>
              <Textarea
                placeholder={t.feedback}
                value={bulkFeedback}
                onChange={(e) => setBulkFeedback(e.target.value)}
                data-testid="bulk-feedback-input"
              />
            </div>

            {(bulkAction === 'returned' || bulkAction === 'changes_requested') && (
              <div>
                <Label>{t.returnReason}</Label>
                <Textarea
                  placeholder={t.returnReason}
                  value={bulkReturnReason}
                  onChange={(e) => setBulkReturnReason(e.target.value)}
                  data-testid="bulk-return-reason-input"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkDialog(false)}
              data-testid="bulk-cancel-button"
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleBulkReview}
              disabled={!bulkAction || bulkReviewMutation.isPending}
              data-testid="bulk-apply-button"
            >
              {bulkReviewMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {t.apply}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submission Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="detail-dialog">
          <DialogHeader>
            <DialogTitle>{t.submissionDetails}</DialogTitle>
            {selectedSubmission && (
              <DialogDescription>
                {selectedSubmission.teacherName} - {selectedSubmission.className} - {selectedSubmission.subjectName}
              </DialogDescription>
            )}
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{t.gradeDetails}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>T1:</span>
                        <span className="font-mono">{selectedSubmission.firstEvaluation || '--'}/20</span>
                      </div>
                      <div className="flex justify-between">
                        <span>T2:</span>
                        <span className="font-mono">{selectedSubmission.secondEvaluation || '--'}/20</span>
                      </div>
                      <div className="flex justify-between">
                        <span>T3:</span>
                        <span className="font-mono">{selectedSubmission.thirdEvaluation || '--'}/20</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>{language === 'fr' ? 'Moyenne' : 'Average'}:</span>
                        <span className="font-mono">{selectedSubmission.termAverage || '--'}/20</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{language === 'fr' ? 'Coefficient' : 'Coefficient'}:</span>
                        <span>{selectedSubmission.coefficient}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{language === 'fr' ? 'Informations' : 'Information'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">{language === 'fr' ? 'Statut' : 'Status'}:</span>
                        <div className="mt-1">{getStatusBadge(selectedSubmission.reviewStatus)}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">{language === 'fr' ? 'Priorité' : 'Priority'}:</span>
                        <div className="mt-1">{getPriorityBadge(selectedSubmission.reviewPriority)}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">{t.submittedAt}:</span>
                        <div className="text-sm">
                          {new Date(selectedSubmission.submittedAt).toLocaleDateString(language)} {new Date(selectedSubmission.submittedAt).toLocaleTimeString(language)}
                        </div>
                      </div>
                      {selectedSubmission.reviewedAt && (
                        <div>
                          <span className="text-sm text-gray-500">{language === 'fr' ? 'Révisé le' : 'Reviewed at'}:</span>
                          <div className="text-sm">
                            {new Date(selectedSubmission.reviewedAt).toLocaleDateString(language)} {new Date(selectedSubmission.reviewedAt).toLocaleTimeString(language)}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedSubmission.subjectComments && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{t.comments}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedSubmission.subjectComments}</p>
                  </CardContent>
                </Card>
              )}

              {(selectedSubmission.reviewFeedback || selectedSubmission.returnReason) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{language === 'fr' ? 'Commentaires de révision' : 'Review Feedback'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedSubmission.reviewFeedback && (
                      <div>
                        <span className="text-sm text-gray-500">{t.feedback}:</span>
                        <p className="text-sm">{selectedSubmission.reviewFeedback}</p>
                      </div>
                    )}
                    {selectedSubmission.returnReason && (
                      <div>
                        <span className="text-sm text-gray-500">{t.returnReason}:</span>
                        <p className="text-sm">{selectedSubmission.returnReason}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailDialog(false)}
              data-testid="close-detail-button"
            >
              {language === 'fr' ? 'Fermer' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GradeReviewQueue;
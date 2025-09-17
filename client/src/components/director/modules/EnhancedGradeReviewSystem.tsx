import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, XCircle, Clock, Eye, Users, BookOpen, MessageSquare,
  Activity, Wifi, WifiOff, RefreshCw, AlertTriangle, Info, Bell,
  Filter, Search, Calendar, BarChart3, TrendingUp, User,
  ChevronDown, ChevronRight, CheckSquare, RotateCcw, Send,
  Zap, Clock3, UserCheck, AlertCircle, Inbox, Archive
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Types for review system
interface GradeSubmission {
  id: number;
  teacherId: number;
  teacherName: string;
  teacherEmail: string;
  studentId: number;
  subjectId: number;
  subjectName: string;
  classId: number;
  className: string;
  term: string;
  academicYear: string;
  firstEvaluation: number | null;
  secondEvaluation: number | null;
  thirdEvaluation: number | null;
  termAverage: number | null;
  coefficient: number;
  subjectComments: string | null;
  reviewStatus: 'pending' | 'under_review' | 'approved' | 'returned' | 'changes_requested';
  reviewPriority: 'urgent' | 'normal' | 'low';
  requiresAttention: boolean;
  reviewFeedback: string | null;
  returnReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  lastStatusChange: string;
}

interface ConnectedUser {
  userId: number;
  userName: string;
  userRole: string;
  currentModule?: string;
  workingOn?: {
    type: string;
    id: number;
    description: string;
  };
}

interface ReviewStats {
  pending: number;
  under_review: number;
  approved: number;
  returned: number;
  changes_requested: number;
}

const EnhancedGradeReviewSystem: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<number>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');
  const [expandedSubmission, setExpandedSubmission] = useState<number | null>(null);
  const [reviewingSubmissions, setReviewingSubmissions] = useState<Set<number>>(new Set());

  // Real-time integration
  const {
    isConnected,
    isConnecting,
    hasError,
    connectedUsers,
    notifyActivity,
    notifyReviewStart,
    notifyReviewEnd,
    requestSync,
    connect
  } = useRealTimeUpdates({
    onReviewQueueUpdate: handleReviewQueueUpdate,
    onGradeStatusUpdate: handleGradeStatusUpdate,
    onUserPresenceUpdate: handleUserPresenceUpdate,
    enableToasts: true
  });

  // Filter connected directors working on reviews
  const reviewingUsers = useMemo(() => {
    return connectedUsers.filter((user: ConnectedUser) => 
      user.currentModule === 'grade-review' || 
      user.workingOn?.type === 'GRADE_REVIEW'
    );
  }, [connectedUsers]);

  // Fetch review queue with real-time updates
  const { data: reviewData, isLoading: reviewLoading, refetch: refetchQueue } = useQuery({
    queryKey: ['/api/grade-review/queue', selectedStatus, selectedPriority, selectedTeacher, page, limit, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        status: selectedStatus,
        priority: selectedPriority !== 'all' ? selectedPriority : '',
        teacherId: selectedTeacher !== 'all' ? selectedTeacher : '',
        page: page.toString(),
        limit: limit.toString(),
        search: searchQuery
      });

      const response = await fetch(`/api/grade-review/queue?${params}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch review queue');
      return response.json();
    },
    enabled: !!user,
    refetchInterval: isConnected ? false : 30000 // Only auto-refresh if not connected to real-time
  });

  // Fetch review statistics
  const { data: statsData } = useQuery({
    queryKey: ['/api/grade-review/statistics'],
    queryFn: async () => {
      const response = await fetch('/api/grade-review/statistics', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch statistics');
      return response.json();
    },
    enabled: !!user,
    refetchInterval: 60000 // Refresh stats every minute
  });

  // Real-time event handlers
  function handleReviewQueueUpdate(payload: any) {
    const { action, submissionId, priority } = payload;
    
    // Refresh queue data
    refetchQueue();
    
    // Update statistics
    queryClient.invalidateQueries({ queryKey: ['/api/grade-review/statistics'] });

    // Show notification based on action and priority
    if (action === 'ADD') {
      toast({
        title: language === 'fr' ? 'Nouvelle soumission' : 'New submission',
        description: language === 'fr' 
          ? `Une nouvelle note à réviser${priority === 'urgent' ? ' (URGENT)' : ''}` 
          : `New grade submission for review${priority === 'urgent' ? ' (URGENT)' : ''}`,
        variant: priority === 'urgent' ? 'destructive' : 'default'
      });
    }
  }

  function handleGradeStatusUpdate(payload: any) {
    const { submissionId, oldStatus, newStatus } = payload;
    
    // Update local state if submission is in current view
    refetchQueue();
    
    // Remove from reviewing set if it was being reviewed
    setReviewingSubmissions(prev => {
      const updated = new Set(prev);
      updated.delete(submissionId);
      return updated;
    });
  }

  function handleUserPresenceUpdate(payload: any) {
    // Handle user presence changes - already managed by the hook
    console.log('User presence update in review system:', payload);
  }

  // Notify activity when component loads
  useEffect(() => {
    notifyActivity('grade-review', {
      type: 'GRADE_REVIEW',
      id: 0,
      description: 'Reviewing grade submissions'
    });
  }, [notifyActivity]);

  // Review single submission mutation
  const reviewSubmissionMutation = useMutation({
    mutationFn: async ({ submissionId, action, feedback, returnReason }: {
      submissionId: number;
      action: string;
      feedback?: string;
      returnReason?: string;
    }) => {
      // Notify start of review
      notifyReviewStart(submissionId);
      setReviewingSubmissions(prev => new Set([...prev, submissionId]));

      const response = await fetch('/api/grade-review/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          submissionId,
          reviewAction: action,
          feedback,
          returnReason
        })
      });
      if (!response.ok) throw new Error('Failed to review submission');
      return response.json();
    },
    onSuccess: (data) => {
      const { submissionId, reviewAction } = data.data;
      
      // Notify end of review
      notifyReviewEnd(submissionId);
      setReviewingSubmissions(prev => {
        const updated = new Set(prev);
        updated.delete(submissionId);
        return updated;
      });

      toast({
        title: language === 'fr' ? 'Révision terminée' : 'Review completed',
        description: language === 'fr' 
          ? `Soumission ${reviewAction === 'approved' ? 'approuvée' : 'retournée'}` 
          : `Submission ${reviewAction}`,
        variant: reviewAction === 'approved' ? 'default' : 'destructive'
      });
      
      refetchQueue();
    },
    onError: (error) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de réviser la soumission' : 'Failed to review submission',
        variant: 'destructive'
      });
      
      // Remove from reviewing set on error
      setReviewingSubmissions(prev => {
        const updated = new Set(prev);
        Array.from(prev).forEach(id => updated.delete(id));
        return updated;
      });
    }
  });

  // Bulk review mutation
  const bulkReviewMutation = useMutation({
    mutationFn: async ({ submissionIds, action, feedback }: {
      submissionIds: number[];
      action: string;
      feedback?: string;
    }) => {
      const response = await fetch('/api/grade-review/bulk-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          submissionIds,
          reviewAction: action,
          feedback
        })
      });
      if (!response.ok) throw new Error('Failed to bulk review');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: language === 'fr' ? 'Révision groupée terminée' : 'Bulk review completed',
        description: language === 'fr' 
          ? `${data.data.processed} soumissions traitées` 
          : `${data.data.processed} submissions processed`
      });
      
      setSelectedSubmissions(new Set());
      setBulkAction('');
      refetchQueue();
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de traiter les soumissions' : 'Failed to process submissions',
        variant: 'destructive'
      });
    }
  });

  // Handle individual review actions
  const handleReview = useCallback((submissionId: number, action: string, feedback?: string, returnReason?: string) => {
    reviewSubmissionMutation.mutate({ submissionId, action, feedback, returnReason });
  }, [reviewSubmissionMutation]);

  // Handle bulk review actions
  const handleBulkReview = useCallback(() => {
    if (selectedSubmissions.size === 0 || !bulkAction) return;
    
    const submissionIds = Array.from(selectedSubmissions);
    bulkReviewMutation.mutate({ submissionIds, action: bulkAction });
  }, [selectedSubmissions, bulkAction, bulkReviewMutation]);

  // Toggle submission selection
  const toggleSubmissionSelection = useCallback((submissionId: number) => {
    setSelectedSubmissions(prev => {
      const updated = new Set(prev);
      if (updated.has(submissionId)) {
        updated.delete(submissionId);
      } else {
        updated.add(submissionId);
      }
      return updated;
    });
  }, []);

  // Get submissions data
  const submissions = reviewData?.data?.submissions || [];
  const pagination = reviewData?.data?.pagination;
  const statistics: ReviewStats = reviewData?.data?.statistics || statsData?.data?.statusSummary || {
    pending: 0,
    under_review: 0,
    approved: 0,
    returned: 0,
    changes_requested: 0
  };

  // Render connection status
  const renderConnectionStatus = () => (
    <div className="flex items-center space-x-2">
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-600">
            {language === 'fr' ? 'Temps réel activé' : 'Real-time enabled'}
          </span>
        </>
      ) : isConnecting ? (
        <>
          <Activity className="w-4 h-4 text-yellow-500 animate-pulse" />
          <span className="text-sm text-yellow-600">
            {language === 'fr' ? 'Connexion...' : 'Connecting...'}
          </span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-600">
            {language === 'fr' ? 'Hors ligne' : 'Offline'}
          </span>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={connect}
            className="ml-2"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            {language === 'fr' ? 'Reconnecter' : 'Reconnect'}
          </Button>
        </>
      )}
    </div>
  );

  // Render active reviewers
  const renderActiveReviewers = () => {
    if (reviewingUsers.length === 0) return null;

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">
              {language === 'fr' ? 'Réviseurs actifs' : 'Active reviewers'}
            </span>
            <Badge variant="secondary">{reviewingUsers.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {reviewingUsers.map((user: ConnectedUser) => (
              <TooltipProvider key={user.userId}>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Activity className="w-3 h-3" />
                      <span>{user.userName}</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user.userRole} - {user.currentModule}</p>
                    {user.workingOn && (
                      <p className="text-xs text-gray-500">{user.workingOn.description}</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render submission status badge
  const renderStatusBadge = (status: string, isBeingReviewed = false) => {
    if (isBeingReviewed) {
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
          <Activity className="w-3 h-3 mr-1 animate-pulse" />
          {language === 'fr' ? 'En cours de révision' : 'Being reviewed'}
        </Badge>
      );
    }

    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock, label: language === 'fr' ? 'En attente' : 'Pending' },
      under_review: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Eye, label: language === 'fr' ? 'En révision' : 'Under review' },
      approved: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle2, label: language === 'fr' ? 'Approuvé' : 'Approved' },
      returned: { color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle, label: language === 'fr' ? 'Retourné' : 'Returned' },
      changes_requested: { color: 'bg-orange-100 text-orange-800 border-orange-300', icon: RotateCcw, label: language === 'fr' ? 'Changements demandés' : 'Changes requested' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Render priority badge
  const renderPriorityBadge = (priority: string) => {
    const priorityConfig = {
      urgent: { color: 'bg-red-100 text-red-800 border-red-300', icon: AlertTriangle },
      normal: { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: Info },
      low: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Clock3 }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.color} border text-xs`}>
        <Icon className="w-3 h-3 mr-1" />
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6" data-testid="enhanced-grade-review-system">
      {/* Header with real-time status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {language === 'fr' ? 'Système de Révision en Temps Réel' : 'Real-time Review System'}
          </h2>
          <p className="text-gray-600">
            {language === 'fr' 
              ? 'Révision collaborative des notes avec mises à jour en direct' 
              : 'Collaborative grade review with live updates'}
          </p>
        </div>
        {renderConnectionStatus()}
      </div>

      {/* Real-time notifications */}
      {hasError && (
        <Alert variant="destructive" data-testid="connection-error">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{language === 'fr' ? 'Erreur de connexion' : 'Connection error'}</AlertTitle>
          <AlertDescription>
            {language === 'fr' 
              ? 'Impossible de se connecter au service temps réel. Les mises à jour peuvent être retardées.' 
              : 'Unable to connect to real-time service. Updates may be delayed.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Active reviewers */}
      {renderActiveReviewers()}

      {/* Statistics cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(statistics).map(([status, count]) => {
          const statusConfig = {
            pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
            under_review: { icon: Eye, color: 'text-blue-600', bg: 'bg-blue-100' },
            approved: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
            returned: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
            changes_requested: { icon: RotateCcw, color: 'text-orange-600', bg: 'bg-orange-100' }
          };

          const config = statusConfig[status as keyof typeof statusConfig];
          if (!config) return null;

          const Icon = config.icon;
          
          return (
            <Card 
              key={status} 
              className={`${selectedStatus === status ? 'ring-2 ring-blue-500' : ''} cursor-pointer hover:shadow-md transition-all`}
              onClick={() => setSelectedStatus(status)}
              data-testid={`stats-card-${status}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${config.bg}`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {status.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-wrap gap-4">
              <div>
                <Label htmlFor="priority-filter">
                  {language === 'fr' ? 'Priorité' : 'Priority'}
                </Label>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="w-32" data-testid="select-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === 'fr' ? 'Toutes' : 'All'}</SelectItem>
                    <SelectItem value="urgent">{language === 'fr' ? 'Urgent' : 'Urgent'}</SelectItem>
                    <SelectItem value="normal">{language === 'fr' ? 'Normal' : 'Normal'}</SelectItem>
                    <SelectItem value="low">{language === 'fr' ? 'Faible' : 'Low'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="search-input">
                  {language === 'fr' ? 'Rechercher' : 'Search'}
                </Label>
                <Input
                  id="search-input"
                  placeholder={language === 'fr' ? 'Nom du professeur...' : 'Teacher name...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48"
                  data-testid="input-search"
                />
              </div>
            </div>

            {selectedSubmissions.size > 0 && (
              <div className="flex items-center space-x-2">
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-40" data-testid="select-bulk-action">
                    <SelectValue placeholder={language === 'fr' ? 'Action groupée' : 'Bulk action'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">{language === 'fr' ? 'Approuver' : 'Approve'}</SelectItem>
                    <SelectItem value="returned">{language === 'fr' ? 'Retourner' : 'Return'}</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleBulkReview}
                  disabled={!bulkAction || bulkReviewMutation.isPending}
                  data-testid="button-bulk-review"
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Appliquer' : 'Apply'} ({selectedSubmissions.size})
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Submissions list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Inbox className="w-5 h-5" />
            <span>{language === 'fr' ? 'Queue de révision' : 'Review queue'}</span>
            {!isConnected && (
              <Badge variant="outline" className="ml-2">
                <RefreshCw className="w-3 h-3 mr-1" />
                {language === 'fr' ? 'Mode hors ligne' : 'Offline mode'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviewLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Activity className="w-6 h-6 mx-auto mb-2 animate-spin" />
                <p>{language === 'fr' ? 'Chargement des soumissions...' : 'Loading submissions...'}</p>
              </div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8">
              <Archive className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {language === 'fr' ? 'Aucune soumission' : 'No submissions'}
              </h3>
              <p className="text-gray-500">
                {language === 'fr' 
                  ? 'Aucune soumission à réviser pour le moment' 
                  : 'No submissions to review at this time'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission: GradeSubmission) => {
                const isBeingReviewed = reviewingSubmissions.has(submission.id);
                const isSelected = selectedSubmissions.has(submission.id);
                const isExpanded = expandedSubmission === submission.id;

                return (
                  <div 
                    key={submission.id} 
                    className={`
                      border rounded-lg p-4 transition-all
                      ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}
                      ${isBeingReviewed ? 'border-blue-500 bg-blue-50' : ''}
                    `}
                    data-testid={`submission-${submission.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSubmissionSelection(submission.id)}
                          className="rounded"
                          data-testid={`checkbox-${submission.id}`}
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{submission.teacherName}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-sm text-gray-600">{submission.subjectName}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-sm text-gray-600">{submission.className}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            {renderStatusBadge(submission.reviewStatus, isBeingReviewed)}
                            {renderPriorityBadge(submission.reviewPriority)}
                            {submission.requiresAttention && (
                              <Badge variant="destructive" className="text-xs">
                                <Bell className="w-3 h-3 mr-1" />
                                {language === 'fr' ? 'Attention' : 'Attention'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {submission.reviewStatus === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReview(submission.id, 'approved')}
                              disabled={reviewSubmissionMutation.isPending || isBeingReviewed}
                              data-testid={`button-approve-${submission.id}`}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              {language === 'fr' ? 'Approuver' : 'Approve'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReview(submission.id, 'returned', '', 'Needs correction')}
                              disabled={reviewSubmissionMutation.isPending || isBeingReviewed}
                              data-testid={`button-return-${submission.id}`}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              {language === 'fr' ? 'Retourner' : 'Return'}
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setExpandedSubmission(isExpanded ? null : submission.id)}
                          data-testid={`button-expand-${submission.id}`}
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm font-medium">
                              {language === 'fr' ? 'Notes' : 'Grades'}
                            </Label>
                            <div className="mt-1 space-y-1 text-sm">
                              <div>T1: {submission.firstEvaluation || '-'}</div>
                              <div>T2: {submission.secondEvaluation || '-'}</div>
                              <div>T3: {submission.thirdEvaluation || '-'}</div>
                              <div className="font-medium">
                                {language === 'fr' ? 'Moyenne' : 'Average'}: {submission.termAverage || '-'}
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">
                              {language === 'fr' ? 'Informations' : 'Information'}
                            </Label>
                            <div className="mt-1 space-y-1 text-sm">
                              <div>{language === 'fr' ? 'Coefficient' : 'Coefficient'}: {submission.coefficient}</div>
                              <div>{language === 'fr' ? 'Soumis le' : 'Submitted'}: {new Date(submission.submittedAt).toLocaleDateString()}</div>
                              {submission.reviewedAt && (
                                <div>{language === 'fr' ? 'Révisé le' : 'Reviewed'}: {new Date(submission.reviewedAt).toLocaleDateString()}</div>
                              )}
                            </div>
                          </div>

                          {(submission.subjectComments || submission.reviewFeedback) && (
                            <div>
                              <Label className="text-sm font-medium">
                                {language === 'fr' ? 'Commentaires' : 'Comments'}
                              </Label>
                              <div className="mt-1 space-y-2 text-sm">
                                {submission.subjectComments && (
                                  <div>
                                    <div className="font-medium text-gray-600">
                                      {language === 'fr' ? 'Professeur' : 'Teacher'}:
                                    </div>
                                    <div className="text-gray-800">{submission.subjectComments}</div>
                                  </div>
                                )}
                                {submission.reviewFeedback && (
                                  <div>
                                    <div className="font-medium text-gray-600">
                                      {language === 'fr' ? 'Directeur' : 'Director'}:
                                    </div>
                                    <div className="text-gray-800">{submission.reviewFeedback}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                {language === 'fr' ? 'Page' : 'Page'} {pagination.page} {language === 'fr' ? 'sur' : 'of'} {pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  data-testid="button-prev-page"
                >
                  {language === 'fr' ? 'Précédent' : 'Previous'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                  disabled={page === pagination.totalPages}
                  data-testid="button-next-page"
                >
                  {language === 'fr' ? 'Suivant' : 'Next'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedGradeReviewSystem;
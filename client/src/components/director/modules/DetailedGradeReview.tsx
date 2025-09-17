import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Eye,
  MessageSquare,
  RefreshCw,
  ArrowLeft,
  BarChart3,
  Info,
  FileText,
  Send,
  History,
  Star
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Types for detailed review data
interface DetailedSubmission {
  id: number;
  teacherId: number;
  studentId: number;
  subjectId: number;
  classId: number;
  schoolId: number;
  term: string;
  academicYear: string;
  
  // Grade data
  firstEvaluation: number | null;
  secondEvaluation: number | null;
  thirdEvaluation: number | null;
  termAverage: number | null;
  coefficient: number;
  maxScore: number;
  subjectComments: string | null;
  studentRank: number | null;
  
  // Review data
  reviewStatus: 'pending' | 'under_review' | 'approved' | 'returned' | 'changes_requested';
  reviewedBy: number | null;
  reviewedAt: string | null;
  reviewFeedback: string | null;
  returnReason: string | null;
  reviewPriority: 'urgent' | 'normal' | 'low';
  requiresAttention: boolean;
  
  // Timestamps
  submittedAt: string;
  lastStatusChange: string;
  createdAt: string;
  updatedAt: string;
  
  // Related data
  teacherName: string;
  teacherEmail: string;
  subjectName: string;
  subjectCode: string;
  className: string;
  reviewerName: string | null;
}

interface ReviewHistoryEntry {
  id: number;
  reviewAction: 'approved' | 'returned' | 'changes_requested' | 'under_review';
  previousStatus: string;
  newStatus: string;
  feedback: string | null;
  returnReason: string | null;
  reviewPriority: string;
  createdAt: string;
  reviewerName: string;
}

interface DetailedReviewData {
  submission: DetailedSubmission;
  reviewHistory: ReviewHistoryEntry[];
}

interface GradeComparison {
  current: number | null;
  previous: number | null;
  change: number;
  changePercentage: number;
  isOutlier: boolean;
  classAverage: number;
  classMedian: number;
}

interface DetailedGradeReviewProps {
  submissionId: number;
  onClose: () => void;
  onReviewComplete?: () => void;
}

const DetailedGradeReview: React.FC<DetailedGradeReviewProps> = ({
  submissionId,
  onClose,
  onReviewComplete
}) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for review actions
  const [reviewAction, setReviewAction] = useState<'approved' | 'returned' | 'changes_requested' | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [reviewPriority, setReviewPriority] = useState<'urgent' | 'normal' | 'low'>('normal');
  const [showActionDialog, setShowActionDialog] = useState(false);

  // Bilingual text content
  const text = {
    fr: {
      // Page titles
      title: 'Révision Détaillée des Notes',
      backToQueue: 'Retour à la queue',
      
      // Tabs
      gradeAnalysis: 'Analyse des Notes',
      comparison: 'Comparaison',
      history: 'Historique',
      feedbackTab: 'Commentaires',
      
      // Grade analysis
      currentGrades: 'Notes Actuelles',
      previousGrades: 'Notes Précédentes',
      gradeChange: 'Changement',
      classStatistics: 'Statistiques de Classe',
      outlierDetection: 'Détection d\'Anomalies',
      
      // Statistics
      classAverage: 'Moyenne de classe',
      classMedian: 'Médiane de classe',
      studentRank: 'Rang étudiant',
      coefficient: 'Coefficient',
      maxScore: 'Note maximale',
      
      // Grade changes
      improvement: 'Amélioration',
      decline: 'Baisse',
      stable: 'Stable',
      outlierAlert: 'Attention: Note atypique détectée',
      significantChange: 'Changement significatif',
      
      // Actions
      approve: 'Approuver',
      return: 'Retourner',
      requestChanges: 'Demander modifications',
      markUrgent: 'Marquer urgent',
      addComment: 'Ajouter commentaire',
      
      // Review forms
      reviewDecision: 'Décision de Révision',
      selectAction: 'Sélectionner une action',
      reviewFeedback: 'Commentaires',
      returnReason: 'Raison du retour',
      priority: 'Priorité',
      urgent: 'Urgent',
      normal: 'Normal',
      low: 'Faible',
      
      // Status
      currentStatus: 'Statut actuel',
      submittedAt: 'Soumis le',
      submittedBy: 'Soumis par',
      lastModified: 'Dernière modification',
      
      // History
      reviewHistory: 'Historique de Révision',
      previousReviewer: 'Réviseur précédent',
      actionTaken: 'Action effectuée',
      noHistory: 'Aucun historique de révision',
      
      // Buttons
      cancel: 'Annuler',
      submit: 'Soumettre',
      close: 'Fermer',
      processing: 'Traitement...',
      
      // Messages
      loadingSubmission: 'Chargement de la soumission...',
      errorLoading: 'Erreur lors du chargement',
      reviewSuccess: 'Révision effectuée avec succès',
      confirmAction: 'Confirmer l\'action',
      actionDescription: 'Cette action mettra à jour le statut de la soumission',
      
      // Validation warnings
      highGradeWarning: 'Note élevée - Vérifier la précision',
      lowGradeWarning: 'Note faible - Vérifier si justifiée',
      missingGradeWarning: 'Notes manquantes détectées',
      inconsistentWarning: 'Incohérence dans les notes',
      
      // Comments and feedback
      teacherComments: 'Commentaires de l\'enseignant',
      reviewComments: 'Commentaires de révision',
      previousFeedback: 'Commentaires précédents',
      addFeedback: 'Ajouter des commentaires'
    },
    en: {
      // Page titles
      title: 'Detailed Grade Review',
      backToQueue: 'Back to Queue',
      
      // Tabs
      gradeAnalysis: 'Grade Analysis',
      comparison: 'Comparison',
      history: 'History',
      feedbackTab: 'Feedback',
      
      // Grade analysis
      currentGrades: 'Current Grades',
      previousGrades: 'Previous Grades',
      gradeChange: 'Grade Change',
      classStatistics: 'Class Statistics',
      outlierDetection: 'Outlier Detection',
      
      // Statistics
      classAverage: 'Class average',
      classMedian: 'Class median',
      studentRank: 'Student rank',
      coefficient: 'Coefficient',
      maxScore: 'Max score',
      
      // Grade changes
      improvement: 'Improvement',
      decline: 'Decline',
      stable: 'Stable',
      outlierAlert: 'Alert: Unusual grade detected',
      significantChange: 'Significant change',
      
      // Actions
      approve: 'Approve',
      return: 'Return',
      requestChanges: 'Request Changes',
      markUrgent: 'Mark Urgent',
      addComment: 'Add Comment',
      
      // Review forms
      reviewDecision: 'Review Decision',
      selectAction: 'Select an action',
      reviewFeedback: 'Feedback',
      returnReason: 'Return reason',
      priority: 'Priority',
      urgent: 'Urgent',
      normal: 'Normal',
      low: 'Low',
      
      // Status
      currentStatus: 'Current status',
      submittedAt: 'Submitted at',
      submittedBy: 'Submitted by',
      lastModified: 'Last modified',
      
      // History
      reviewHistory: 'Review History',
      previousReviewer: 'Previous reviewer',
      actionTaken: 'Action taken',
      noHistory: 'No review history',
      
      // Buttons
      cancel: 'Cancel',
      submit: 'Submit',
      close: 'Close',
      processing: 'Processing...',
      
      // Messages
      loadingSubmission: 'Loading submission...',
      errorLoading: 'Error loading submission',
      reviewSuccess: 'Review completed successfully',
      confirmAction: 'Confirm Action',
      actionDescription: 'This action will update the submission status',
      
      // Validation warnings
      highGradeWarning: 'High grade - Verify accuracy',
      lowGradeWarning: 'Low grade - Verify if justified',
      missingGradeWarning: 'Missing grades detected',
      inconsistentWarning: 'Inconsistent grades detected',
      
      // Comments and feedback
      teacherComments: 'Teacher comments',
      reviewComments: 'Review comments',
      previousFeedback: 'Previous feedback',
      addFeedback: 'Add feedback'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch detailed submission data
  const { data: reviewData, isLoading, error } = useQuery<DetailedReviewData>({
    queryKey: ['gradeSubmissionDetail', submissionId],
    queryFn: async () => {
      const response = await fetch(`/api/grade-review/submission/${submissionId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch submission details');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch submission details');
      }

      return result.data;
    }
  });

  // Review submission mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ action, feedback, reason, priority }: {
      action: 'approved' | 'returned' | 'changes_requested';
      feedback?: string;
      reason?: string;
      priority?: 'urgent' | 'normal' | 'low';
    }) => {
      const response = await fetch('/api/grade-review/review', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          reviewAction: action,
          feedback,
          returnReason: reason,
          reviewPriority: priority ?? 'normal'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process review');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gradeSubmissionDetail', submissionId] });
      queryClient.invalidateQueries({ queryKey: ['gradeReviewQueue'] });
      
      // Safe action label derivation to prevent TypeScript index errors
      const getActionLabel = () => {
        switch (reviewAction) {
          case 'approved': return t.approve;
          case 'returned': return t.return;
          case 'changes_requested': return t.requestChanges;
          default: return 'Action';
        }
      };
      
      toast({
        title: t.reviewSuccess,
        description: `${getActionLabel()} completed`
      });

      setShowActionDialog(false);
      if (onReviewComplete) {
        onReviewComplete();
      }
    },
    onError: (error) => {
      console.error('Review error:', error);
      toast({
        title: t.errorLoading,
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Helper functions
  const getGradeChangeIndicator = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null;
    
    const change = current - previous;
    const changePercentage = (change / previous) * 100;
    
    if (Math.abs(change) < 0.5) {
      return { icon: Minus, color: 'text-gray-500', text: t.stable };
    } else if (change > 0) {
      return { icon: TrendingUp, color: 'text-green-600', text: `+${change.toFixed(1)} (${changePercentage.toFixed(1)}%)` };
    } else {
      return { icon: TrendingDown, color: 'text-red-600', text: `${change.toFixed(1)} (${changePercentage.toFixed(1)}%)` };
    }
  };

  const getGradeWarnings = (submission: DetailedSubmission) => {
    const warnings = [];
    
    // Check for missing grades
    const grades = [submission.firstEvaluation, submission.secondEvaluation, submission.thirdEvaluation];
    const missingGrades = grades.filter(g => g === null).length;
    if (missingGrades > 0) {
      warnings.push({ type: 'warning', text: t.missingGradeWarning });
    }

    // Check for outlier grades
    grades.forEach((grade, index) => {
      if (grade !== null) {
        if (grade > 18) {
          warnings.push({ type: 'info', text: `${t.highGradeWarning} (T${index + 1}: ${grade})` });
        } else if (grade < 5) {
          warnings.push({ type: 'warning', text: `${t.lowGradeWarning} (T${index + 1}: ${grade})` });
        }
      }
    });

    return warnings;
  };

  const handleSubmitReview = () => {
    if (!reviewAction) return;

    reviewMutation.mutate({
      action: reviewAction,
      feedback: reviewFeedback || undefined,
      reason: returnReason || undefined,
      priority: reviewPriority
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" data-testid="loading-detailed-review">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>{t.loadingSubmission}</span>
      </div>
    );
  }

  if (error || !reviewData) {
    return (
      <div className="text-center py-8 text-red-600" data-testid="error-detailed-review">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <p>{t.errorLoading}</p>
      </div>
    );
  }

  const { submission, reviewHistory } = reviewData;
  const warnings = getGradeWarnings(submission);

  return (
    <div className="space-y-6" data-testid="detailed-grade-review">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            data-testid="back-to-queue-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.backToQueue}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {submission.teacherName} - {submission.className} - {submission.subjectName}
            </p>
          </div>
        </div>

        {submission.reviewStatus === 'pending' && (
          <div className="flex space-x-2">
            <Button
              onClick={() => {
                setReviewAction('approved');
                setShowActionDialog(true);
              }}
              data-testid="approve-detailed-button"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {t.approve}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setReviewAction('returned');
                setShowActionDialog(true);
              }}
              data-testid="return-detailed-button"
            >
              <XCircle className="w-4 h-4 mr-2" />
              {t.return}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setReviewAction('changes_requested');
                setShowActionDialog(true);
              }}
              data-testid="changes-detailed-button"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {t.requestChanges}
            </Button>
          </div>
        )}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((warning, index) => (
            <div
              key={index}
              className={`flex items-center p-3 rounded-lg ${
                warning.type === 'warning' 
                  ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' 
                  : 'bg-blue-50 border border-blue-200 text-blue-800'
              }`}
              data-testid={`warning-${index}`}
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span className="text-sm">{warning.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis" data-testid="analysis-tab">{t.gradeAnalysis}</TabsTrigger>
          <TabsTrigger value="comparison" data-testid="comparison-tab">{t.comparison}</TabsTrigger>
          <TabsTrigger value="history" data-testid="history-tab">{t.history}</TabsTrigger>
          <TabsTrigger value="feedback" data-testid="feedback-tab">{t.feedbackTab}</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Grades */}
            <Card data-testid="current-grades-card">
              <CardHeader>
                <CardTitle>{t.currentGrades}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {submission.firstEvaluation || '--'}
                      </div>
                      <div className="text-sm text-gray-500">T1</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {submission.secondEvaluation || '--'}
                      </div>
                      <div className="text-sm text-gray-500">T2</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {submission.thirdEvaluation || '--'}
                      </div>
                      <div className="text-sm text-gray-500">T3</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{language === 'fr' ? 'Moyenne' : 'Average'}:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {submission.termAverage?.toFixed(2) || '--'}/20
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span>{t.coefficient}:</span>
                      <span className="font-medium">{submission.coefficient}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t.maxScore}:</span>
                      <span className="font-medium">{submission.maxScore}</span>
                    </div>
                  </div>

                  {submission.studentRank && (
                    <div className="flex justify-between">
                      <span>{t.studentRank}:</span>
                      <Badge variant="outline">#{submission.studentRank}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submission Info */}
            <Card data-testid="submission-info-card">
              <CardHeader>
                <CardTitle>{language === 'fr' ? 'Informations' : 'Information'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.currentStatus}:</span>
                    <Badge
                      variant={
                        submission.reviewStatus === 'approved' ? 'default' :
                        submission.reviewStatus === 'returned' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {submission.reviewStatus}
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.submittedBy}:</span>
                    <span className="font-medium">{submission.teacherName}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.submittedAt}:</span>
                    <span className="text-sm">
                      {new Date(submission.submittedAt).toLocaleDateString(language)} 
                      {' '}
                      {new Date(submission.submittedAt).toLocaleTimeString(language)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.lastModified}:</span>
                    <span className="text-sm">
                      {new Date(submission.updatedAt).toLocaleDateString(language)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">{language === 'fr' ? 'Terme' : 'Term'}:</span>
                    <span className="font-medium">{submission.term}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">{language === 'fr' ? 'Année' : 'Year'}:</span>
                    <span className="font-medium">{submission.academicYear}</span>
                  </div>

                  {submission.reviewedAt && submission.reviewerName && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t.previousReviewer}:</span>
                        <span className="font-medium">{submission.reviewerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{language === 'fr' ? 'Révisé le' : 'Reviewed at'}:</span>
                        <span className="text-sm">
                          {new Date(submission.reviewedAt).toLocaleDateString(language)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card data-testid="grade-comparison-card">
            <CardHeader>
              <CardTitle>{t.comparison}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500">
                {language === 'fr' ? 'Fonctionnalité de comparaison à venir' : 'Comparison feature coming soon'}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card data-testid="review-history-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="w-5 h-5" />
                <span>{t.reviewHistory}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviewHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4" />
                  <p>{t.noHistory}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviewHistory.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      data-testid={`history-entry-${index}`}
                    >
                      <div className={`p-2 rounded-full ${
                        entry.reviewAction === 'approved' ? 'bg-green-100 text-green-600' :
                        entry.reviewAction === 'returned' ? 'bg-red-100 text-red-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {entry.reviewAction === 'approved' ? <CheckCircle className="w-4 h-4" /> :
                         entry.reviewAction === 'returned' ? <XCircle className="w-4 h-4" /> :
                         <AlertTriangle className="w-4 h-4" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{entry.reviewerName}</div>
                            <div className="text-sm text-gray-600">
                              {t.actionTaken}: {entry.reviewAction}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(entry.createdAt).toLocaleDateString(language)} {new Date(entry.createdAt).toLocaleTimeString(language)}
                            </div>
                          </div>
                        </div>
                        
                        {(entry.feedback || entry.returnReason) && (
                          <div className="mt-2 text-sm">
                            {entry.feedback && (
                              <div>
                                <span className="font-medium">{t.reviewFeedback}:</span> {entry.feedback}
                              </div>
                            )}
                            {entry.returnReason && (
                              <div>
                                <span className="font-medium">{t.returnReason}:</span> {entry.returnReason}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Teacher Comments */}
            {submission.subjectComments && (
              <Card data-testid="teacher-comments-card">
                <CardHeader>
                  <CardTitle>{t.teacherComments}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{submission.subjectComments}</p>
                </CardContent>
              </Card>
            )}

            {/* Previous Feedback */}
            {(submission.reviewFeedback || submission.returnReason) && (
              <Card data-testid="previous-feedback-card">
                <CardHeader>
                  <CardTitle>{t.previousFeedback}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {submission.reviewFeedback && (
                    <div>
                      <Label className="text-sm font-medium">{t.reviewComments}:</Label>
                      <p className="text-sm mt-1">{submission.reviewFeedback}</p>
                    </div>
                  )}
                  {submission.returnReason && (
                    <div>
                      <Label className="text-sm font-medium">{t.returnReason}:</Label>
                      <p className="text-sm mt-1">{submission.returnReason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Review Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent data-testid="review-action-dialog">
          <DialogHeader>
            <DialogTitle>{t.confirmAction}</DialogTitle>
            <DialogDescription>
              {t.actionDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>{t.reviewDecision}</Label>
              <Select value={reviewAction || ''} onValueChange={(value) => setReviewAction(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectAction} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">{t.approve}</SelectItem>
                  <SelectItem value="returned">{t.return}</SelectItem>
                  <SelectItem value="changes_requested">{t.requestChanges}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t.reviewFeedback}</Label>
              <Textarea
                placeholder={t.addFeedback}
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                data-testid="review-feedback-input"
              />
            </div>

            {(reviewAction === 'returned' || reviewAction === 'changes_requested') && (
              <div>
                <Label>{t.returnReason}</Label>
                <Textarea
                  placeholder={t.returnReason}
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  data-testid="return-reason-input"
                />
              </div>
            )}

            <div>
              <Label>{t.priority}</Label>
              <Select value={reviewPriority} onValueChange={(value) => setReviewPriority(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">{t.urgent}</SelectItem>
                  <SelectItem value="normal">{t.normal}</SelectItem>
                  <SelectItem value="low">{t.low}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowActionDialog(false)}
              data-testid="cancel-review-button"
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={!reviewAction || reviewMutation.isPending}
              data-testid="submit-review-button"
            >
              {reviewMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {reviewMutation.isPending ? t.processing : t.submit}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DetailedGradeReview;
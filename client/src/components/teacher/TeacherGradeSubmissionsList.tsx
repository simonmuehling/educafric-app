import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  Edit,
  MessageSquare,
  Filter,
  RefreshCw,
  Archive,
  FileText,
  XCircle
} from 'lucide-react';
import ArchivesTab from './ArchivesTab';

interface GradeSubmission {
  id: number;
  studentId: number;
  studentFirstName: string;
  studentLastName: string;
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
  reviewStatus: 'pending' | 'approved' | 'returned';
  reviewFeedback: string | null;
  returnReason: string | null;
  requiresAttention: boolean;
  submittedAt: string;
  reviewedAt: string | null;
}

export default function TeacherGradeSubmissionsList() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'returned' | 'archives'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'returned'>('all');
  const [editingSubmission, setEditingSubmission] = useState<GradeSubmission | null>(null);
  const [editForm, setEditForm] = useState({
    firstEvaluation: '',
    secondEvaluation: '',
    thirdEvaluation: '',
    subjectComments: ''
  });

  const text = {
    fr: {
      title: 'Mes Soumissions de Notes',
      subtitle: 'Consultez vos soumissions et corrigez celles retournées',
      allSubmissions: 'Toutes',
      pending: 'En attente',
      approved: 'Approuvées',
      returned: 'Retournées',
      archives: 'Archives',
      student: 'Élève',
      subject: 'Matière',
      class: 'Classe',
      term: 'Trimestre',
      status: 'Statut',
      actions: 'Actions',
      eval1: 'Eval 1',
      eval2: 'Eval 2',
      eval3: 'Eval 3',
      average: 'Moyenne',
      comments: 'Commentaires',
      directorFeedback: 'Retour du Directeur',
      returnReason: 'Raison du retour',
      edit: 'Corriger',
      resubmit: 'Re-soumettre',
      cancel: 'Annuler',
      correctAndResubmit: 'Corriger et Re-soumettre',
      submittedOn: 'Soumis le',
      reviewedOn: 'Révisé le',
      noSubmissions: 'Aucune soumission',
      noSubmissionsDesc: 'Vous n\'avez pas encore soumis de notes',
      resubmitSuccess: 'Notes re-soumises',
      resubmitSuccessDesc: 'Vos corrections ont été envoyées pour révision',
      errorResubmitting: 'Erreur lors de la re-soumission',
      requiresAttention: 'Nécessite votre attention'
    },
    en: {
      title: 'My Grade Submissions',
      subtitle: 'View your submissions and correct returned ones',
      allSubmissions: 'All',
      pending: 'Pending',
      approved: 'Approved',
      returned: 'Returned',
      archives: 'Archives',
      student: 'Student',
      subject: 'Subject',
      class: 'Class',
      term: 'Term',
      status: 'Status',
      actions: 'Actions',
      eval1: 'Eval 1',
      eval2: 'Eval 2',
      eval3: 'Eval 3',
      average: 'Average',
      comments: 'Comments',
      directorFeedback: 'Director Feedback',
      returnReason: 'Return Reason',
      edit: 'Edit',
      resubmit: 'Resubmit',
      cancel: 'Cancel',
      correctAndResubmit: 'Correct and Resubmit',
      submittedOn: 'Submitted on',
      reviewedOn: 'Reviewed on',
      noSubmissions: 'No submissions',
      noSubmissionsDesc: 'You haven\'t submitted any grades yet',
      resubmitSuccess: 'Grades resubmitted',
      resubmitSuccessDesc: 'Your corrections have been sent for review',
      errorResubmitting: 'Error resubmitting grades',
      requiresAttention: 'Requires your attention'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch all submissions
  const { data, isLoading } = useQuery({
    queryKey: ['/api/teacher/grade-submissions', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await apiRequest('GET', `/api/teacher/grade-submissions${params}`);
      return await response.json();
    }
  });

  const submissions: GradeSubmission[] = data?.submissions || [];
  const stats = data?.stats || { total: 0, byStatus: {}, requiresAttention: 0 };

  // Resubmit mutation
  const resubmitMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest('PATCH', `/api/teacher/grade-submissions/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t.resubmitSuccess,
        description: t.resubmitSuccessDesc,
      });
      setEditingSubmission(null);
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/grade-submissions'] });
    },
    onError: () => {
      toast({
        title: t.errorResubmitting,
        variant: 'destructive',
      });
    }
  });

  const handleEditClick = (submission: GradeSubmission) => {
    setEditingSubmission(submission);
    setEditForm({
      firstEvaluation: submission.firstEvaluation?.toString() || '',
      secondEvaluation: submission.secondEvaluation?.toString() || '',
      thirdEvaluation: submission.thirdEvaluation?.toString() || '',
      subjectComments: submission.subjectComments || ''
    });
  };

  const handleResubmit = () => {
    if (!editingSubmission) return;

    const average = calculateAverage();
    
    resubmitMutation.mutate({
      id: editingSubmission.id,
      data: {
        firstEvaluation: editForm.firstEvaluation ? parseFloat(editForm.firstEvaluation) : null,
        secondEvaluation: editForm.secondEvaluation ? parseFloat(editForm.secondEvaluation) : null,
        thirdEvaluation: editForm.thirdEvaluation ? parseFloat(editForm.thirdEvaluation) : null,
        termAverage: average,
        subjectComments: editForm.subjectComments || null
      }
    });
  };

  const calculateAverage = () => {
    const evals = [
      editForm.firstEvaluation ? parseFloat(editForm.firstEvaluation) : null,
      editForm.secondEvaluation ? parseFloat(editForm.secondEvaluation) : null,
      editForm.thirdEvaluation ? parseFloat(editForm.thirdEvaluation) : null
    ].filter(v => v !== null) as number[];

    if (evals.length === 0) return null;
    return evals.reduce((a, b) => a + b, 0) / evals.length;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      approved: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      returned: { variant: 'destructive' as const, icon: AlertCircle, color: 'text-red-600' }
    };

    const config = variants[status as keyof typeof variants];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {t[status as keyof typeof t]}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.title}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t.subtitle}</p>
        </div>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/teacher/grade-submissions'] })}
          variant="outline"
          data-testid="button-refresh-submissions"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t.allSubmissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.byStatus.pending || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.byStatus.approved || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.byStatus.returned || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t.returned}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => {
        setActiveTab(v as any);
        if (v !== 'archives') {
          setStatusFilter(v as any);
        }
      }}>
        <TabsList className="grid w-full grid-cols-5 h-auto p-1.5 bg-[#F3F5F7] rounded-xl gap-1">
          <TabsTrigger value="all" data-testid="tab-all" className="flex items-center justify-center gap-2 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm">
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span className="hidden lg:inline truncate">{t.allSubmissions}</span>
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending" className="flex items-center justify-center gap-2 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="hidden lg:inline truncate">{t.pending}</span>
          </TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-approved" className="flex items-center justify-center gap-2 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="hidden lg:inline truncate">{t.approved}</span>
          </TabsTrigger>
          <TabsTrigger value="returned" data-testid="tab-returned" className="flex items-center justify-center gap-2 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span className="hidden lg:inline truncate">{t.returned}</span>
          </TabsTrigger>
          <TabsTrigger value="archives" data-testid="tab-archives" className="flex items-center justify-center gap-2 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm">
            <Archive className="w-4 h-4 flex-shrink-0" />
            <span className="hidden lg:inline truncate">{t.archives}</span>
          </TabsTrigger>
        </TabsList>

        {/* Archives Tab Content */}
        <TabsContent value="archives" className="mt-6">
          <ArchivesTab />
        </TabsContent>

        {/* Active Submissions Tabs Content */}
        {['all', 'pending', 'approved', 'returned'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            {/* Submissions Table */}
            <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : submissions.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t.noSubmissions}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.noSubmissionsDesc}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">{t.student}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">{t.subject}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">{t.class}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">{t.term}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">{t.eval1}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">{t.eval2}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">{t.eval3}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">{t.average}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">{t.status}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {submissions.map((submission) => (
                    <tr 
                      key={submission.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                        submission.requiresAttention ? 'bg-red-50 dark:bg-red-950/20' : ''
                      }`}
                      data-testid={`row-submission-${submission.id}`}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {submission.studentFirstName} {submission.studentLastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {submission.subjectName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {submission.className}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                        {submission.term}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium">
                        {submission.firstEvaluation?.toFixed(2) || '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium">
                        {submission.secondEvaluation?.toFixed(2) || '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium">
                        {submission.thirdEvaluation?.toFixed(2) || '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-bold text-blue-600">
                        {submission.termAverage?.toFixed(2) || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(submission.reviewStatus)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {submission.reviewStatus === 'returned' && (
                          <Button
                            size="sm"
                            onClick={() => handleEditClick(submission)}
                            data-testid={`button-edit-${submission.id}`}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            {t.edit}
                          </Button>
                        )}
                        {submission.reviewFeedback && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-2"
                            title={submission.reviewFeedback}
                          >
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                        )}
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

      {/* Edit Dialog */}
      <Dialog open={!!editingSubmission} onOpenChange={(open) => !open && setEditingSubmission(null)}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>{t.correctAndResubmit}</DialogTitle>
          </DialogHeader>

          {editingSubmission && (
            <div className="space-y-4">
              {/* Director Feedback */}
              {editingSubmission.reviewFeedback && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                        {t.directorFeedback}
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {editingSubmission.reviewFeedback}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Return Reason */}
              {editingSubmission.returnReason && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                        {t.returnReason}
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {editingSubmission.returnReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>{t.eval1}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    step="0.25"
                    value={editForm.firstEvaluation}
                    onChange={(e) => setEditForm({ ...editForm, firstEvaluation: e.target.value })}
                    data-testid="input-eval1"
                  />
                </div>
                <div>
                  <Label>{t.eval2}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    step="0.25"
                    value={editForm.secondEvaluation}
                    onChange={(e) => setEditForm({ ...editForm, secondEvaluation: e.target.value })}
                    data-testid="input-eval2"
                  />
                </div>
                <div>
                  <Label>{t.eval3}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    step="0.25"
                    value={editForm.thirdEvaluation}
                    onChange={(e) => setEditForm({ ...editForm, thirdEvaluation: e.target.value })}
                    data-testid="input-eval3"
                  />
                </div>
              </div>

              <div>
                <Label>{t.average}</Label>
                <div className="text-2xl font-bold text-blue-600">
                  {calculateAverage()?.toFixed(2) || '-'} / 20
                </div>
              </div>

              <div>
                <Label>{t.comments}</Label>
                <Textarea
                  value={editForm.subjectComments}
                  onChange={(e) => setEditForm({ ...editForm, subjectComments: e.target.value })}
                  rows={3}
                  data-testid="textarea-comments"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingSubmission(null)}
              data-testid="button-cancel-edit"
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleResubmit}
              disabled={resubmitMutation.isPending}
              data-testid="button-resubmit"
            >
              {resubmitMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {t.resubmit}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

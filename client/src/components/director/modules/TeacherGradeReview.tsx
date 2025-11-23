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
  TrendingUp
} from 'lucide-react';

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

  // Selection state
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<number>>(new Set());
  
  // Review dialogs
  const [reviewingSubmission, setReviewingSubmission] = useState<GradeSubmission | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'return'>('approve');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [returnReason, setReturnReason] = useState('');

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
      loading: 'Chargement...'
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
      loading: 'Loading...'
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t.filters}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder={t.allTerms} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t.allTerms}</SelectItem>
                  <SelectItem value="T1">Trimestre 1</SelectItem>
                  <SelectItem value="T2">Trimestre 2</SelectItem>
                  <SelectItem value="T3">Trimestre 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t.status}</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t.all}</SelectItem>
                  <SelectItem value="pending">{t.pending}</SelectItem>
                  <SelectItem value="approved">{t.approved}</SelectItem>
                  <SelectItem value="returned">{t.returned}</SelectItem>
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
    </div>
  );
}

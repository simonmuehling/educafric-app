import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  FileText,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface TeacherBulletin {
  id: number;
  teacherId: number;
  teacherName?: string;
  teacherEmail?: string;
  studentId: number;
  studentName?: string;
  classId: number;
  term: string;
  academicYear: string;
  studentInfo: any;
  subjects: any[];
  discipline: any;
  bulletinType?: string;
  language: string;
  status: string;
  reviewStatus?: string;
  reviewComments?: string;
  sentToSchoolAt?: string;
  reviewedAt?: string;
}

const TeacherSubmittedBulletins: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBulletin, setSelectedBulletin] = useState<TeacherBulletin | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [activeTab, setActiveTab] = useState<string>('pending');

  const text = {
    fr: {
      title: 'Bulletins Soumis par les Enseignants',
      subtitle: 'Consultez et validez les bulletins créés par vos enseignants',
      pending: 'En Attente',
      approved: 'Approuvés',
      rejected: 'Rejetés',
      all: 'Tous',
      teacher: 'Enseignant',
      student: 'Élève',
      class: 'Classe',
      term: 'Trimestre',
      sentOn: 'Envoyé le',
      status: 'Statut',
      actions: 'Actions',
      view: 'Voir',
      approve: 'Approuver',
      reject: 'Rejeter',
      reviewComments: 'Commentaires de révision',
      reviewCommentsPlaceholder: 'Ajoutez vos commentaires ici...',
      cancel: 'Annuler',
      submit: 'Soumettre',
      noBulletins: 'Aucun bulletin trouvé',
      bulletinDetails: 'Détails du Bulletin',
      studentInfo: 'Informations Élève',
      disciplineInfo: 'Discipline',
      subjects: 'Matières',
      absences: 'Absences Justifiées',
      absencesNotJustified: 'Absences Non Justifiées',
      tardiness: 'Retards',
      sanctions: 'Sanctions',
      approveSuccess: 'Bulletin approuvé avec succès',
      rejectSuccess: 'Bulletin rejeté avec succès',
      error: 'Erreur',
      loading: 'Chargement...',
      noData: 'Aucune donnée disponible',
      close: 'Fermer',
      backToList: 'Retour à la liste',
      syncGrades: 'Synchroniser Notes',
      syncGradesDesc: 'Synchroniser les notes des bulletins approuvés vers le système de notes',
      syncSuccess: 'Notes synchronisées avec succès',
      syncing: 'Synchronisation en cours...'
    },
    en: {
      title: 'Teacher-Submitted Bulletins',
      subtitle: 'Review and validate bulletins created by your teachers',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      all: 'All',
      teacher: 'Teacher',
      student: 'Student',
      class: 'Class',
      term: 'Term',
      sentOn: 'Sent on',
      status: 'Status',
      actions: 'Actions',
      view: 'View',
      approve: 'Approve',
      reject: 'Reject',
      reviewComments: 'Review Comments',
      reviewCommentsPlaceholder: 'Add your comments here...',
      cancel: 'Cancel',
      submit: 'Submit',
      noBulletins: 'No bulletins found',
      bulletinDetails: 'Bulletin Details',
      studentInfo: 'Student Information',
      disciplineInfo: 'Discipline',
      subjects: 'Subjects',
      absences: 'Justified Absences',
      absencesNotJustified: 'Unjustified Absences',
      tardiness: 'Tardiness',
      sanctions: 'Sanctions',
      approveSuccess: 'Bulletin approved successfully',
      rejectSuccess: 'Bulletin rejected successfully',
      error: 'Error',
      loading: 'Loading...',
      noData: 'No data available',
      close: 'Close',
      backToList: 'Back to list',
      syncGrades: 'Sync Grades',
      syncGradesDesc: 'Sync grades from approved bulletins to the grades system',
      syncSuccess: 'Grades synced successfully',
      syncing: 'Syncing grades...'
    }
  };

  const t = text[language as keyof typeof text];

  // Sync grades mutation
  const syncGradesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/director/sync-approved-bulletin-grades');
      if (!response.ok) throw new Error('Sync failed');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t.syncSuccess,
        description: `${data.gradesInserted} ${language === 'fr' ? 'notes synchronisées' : 'grades synced'}`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/director/teacher-bulletins'] });
      queryClient.invalidateQueries({ queryKey: ['approved-grades-students'] });
    },
    onError: () => {
      toast({
        title: t.error,
        variant: 'destructive'
      });
    }
  });

  // Fetch teacher bulletins
  const { data: bulletinsData, isLoading } = useQuery({
    queryKey: ['/api/director/teacher-bulletins'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const bulletins: TeacherBulletin[] = bulletinsData?.bulletins || [];

  // Review bulletin mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ bulletinId, reviewStatus, comments }: { bulletinId: number; reviewStatus: string; comments: string }) => {
      const response = await apiRequest('POST', `/api/director/teacher-bulletins/${bulletinId}/review`, {
        reviewStatus,
        reviewComments: comments
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/director/teacher-bulletins'] });
      toast({
        title: t.approveSuccess,
        variant: 'default'
      });
      setSelectedBulletin(null);
      setReviewComments('');
    },
    onError: () => {
      toast({
        title: t.error,
        variant: 'destructive'
      });
    }
  });

  const handleApprove = () => {
    if (!selectedBulletin) return;
    reviewMutation.mutate({
      bulletinId: selectedBulletin.id,
      reviewStatus: 'approved',
      comments: reviewComments
    });
  };

  const handleReject = () => {
    if (!selectedBulletin) return;
    reviewMutation.mutate({
      bulletinId: selectedBulletin.id,
      reviewStatus: 'rejected',
      comments: reviewComments
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500" data-testid="badge-approved"><CheckCircle className="w-3 h-3 mr-1" />{language === 'fr' ? 'Approuvé' : 'Approved'}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500" data-testid="badge-rejected"><XCircle className="w-3 h-3 mr-1" />{language === 'fr' ? 'Rejeté' : 'Rejected'}</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500" data-testid="badge-pending"><Clock className="w-3 h-3 mr-1" />{language === 'fr' ? 'En Attente' : 'Pending'}</Badge>;
    }
  };

  const filteredBulletins = bulletins.filter((b) => {
    if (activeTab === 'all') return true;
    return b.reviewStatus === activeTab;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t.loading}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedBulletin) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold" data-testid="title-bulletin-details">
              {t.bulletinDetails}
            </CardTitle>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedBulletin(null);
                setReviewComments('');
              }}
              data-testid="button-back-to-list"
            >
              {t.backToList}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student and Teacher Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2" data-testid="heading-student-info">
                <User className="w-5 h-5" />
                {t.studentInfo}
              </h3>
              <div className="pl-7 space-y-1">
                <p data-testid="text-student-name"><strong>{t.student}:</strong> {selectedBulletin.studentName || selectedBulletin.studentInfo?.name || t.noData}</p>
                <p data-testid="text-class"><strong>{t.class}:</strong> {selectedBulletin.studentInfo?.classLabel || t.noData}</p>
                <p data-testid="text-term"><strong>{t.term}:</strong> {selectedBulletin.term}</p>
                <p data-testid="text-academic-year"><strong>{language === 'fr' ? 'Année Académique' : 'Academic Year'}:</strong> {selectedBulletin.academicYear}</p>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2" data-testid="heading-teacher-info">
                <User className="w-5 h-5" />
                {t.teacher}
              </h3>
              <div className="pl-7 space-y-1">
                <p data-testid="text-teacher-name"><strong>{language === 'fr' ? 'Nom' : 'Name'}:</strong> {selectedBulletin.teacherName || t.noData}</p>
                <p data-testid="text-teacher-email"><strong>Email:</strong> {selectedBulletin.teacherEmail || t.noData}</p>
                <p data-testid="text-sent-date"><strong>{t.sentOn}:</strong> {selectedBulletin.sentToSchoolAt ? format(new Date(selectedBulletin.sentToSchoolAt), 'PPp', { locale: language === 'fr' ? fr : enUS }) : t.noData}</p>
              </div>
            </div>
          </div>

          {/* Discipline Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg flex items-center gap-2" data-testid="heading-discipline">
              <AlertCircle className="w-5 h-5" />
              {t.disciplineInfo}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pl-7">
              <div data-testid="discipline-absences">
                <p className="text-sm text-gray-600">{t.absences}</p>
                <p className="text-lg font-semibold">{selectedBulletin.discipline?.absJ || 0}</p>
              </div>
              <div data-testid="discipline-absences-not-justified">
                <p className="text-sm text-gray-600">{t.absencesNotJustified}</p>
                <p className="text-lg font-semibold">{selectedBulletin.discipline?.absNJ || 0}</p>
              </div>
              <div data-testid="discipline-tardiness">
                <p className="text-sm text-gray-600">{t.tardiness}</p>
                <p className="text-lg font-semibold">{selectedBulletin.discipline?.late || 0}</p>
              </div>
              <div data-testid="discipline-sanctions">
                <p className="text-sm text-gray-600">{t.sanctions}</p>
                <p className="text-lg font-semibold">{selectedBulletin.discipline?.sanctions || 0}</p>
              </div>
            </div>
          </div>

          {/* Subjects Table - COMPLETE DATA DISPLAY */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg flex items-center gap-2" data-testid="heading-subjects">
              <FileText className="w-5 h-5" />
              {t.subjects}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left" rowSpan={2}>{language === 'fr' ? 'Matière' : 'Subject'}</th>
                    <th className="border p-2 text-center" colSpan={3}>{language === 'fr' ? 'Évaluations' : 'Evaluations'}</th>
                    <th className="border p-2 text-center" rowSpan={2}>{language === 'fr' ? 'Moy.' : 'Avg.'}</th>
                    <th className="border p-2 text-center" rowSpan={2}>{language === 'fr' ? 'Coef.' : 'Coef.'}</th>
                    <th className="border p-2 text-left" rowSpan={2}>{language === 'fr' ? 'Compétences' : 'Competencies'}</th>
                    <th className="border p-2 text-left" rowSpan={2}>{language === 'fr' ? 'Appréciation' : 'Appreciation'}</th>
                    <th className="border p-2 text-left" rowSpan={2}>{language === 'fr' ? 'Remarque' : 'Remark'}</th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="border p-1 text-center text-xs">N/20</th>
                    <th className="border p-1 text-center text-xs">M/20</th>
                    <th className="border p-1 text-center text-xs">N3/20</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBulletin.subjects && selectedBulletin.subjects.length > 0 ? (
                    selectedBulletin.subjects.map((subject: any, idx: number) => (
                      <tr key={idx} data-testid={`subject-row-${idx}`} className="hover:bg-blue-50">
                        <td className="border p-2 font-medium">{subject.name || subject.id}</td>
                        <td className="border p-2 text-center">{subject.note1 ?? subject.grade ?? '-'}</td>
                        <td className="border p-2 text-center">{subject.note2 ?? '-'}</td>
                        <td className="border p-2 text-center">{subject.note3 ?? '-'}</td>
                        <td className="border p-2 text-center font-bold text-blue-700">{subject.moyenneFinale ?? subject.average ?? subject.grade ?? '-'}</td>
                        <td className="border p-2 text-center">{subject.coefficient || 1}</td>
                        <td className="border p-2 text-xs">
                          {subject.competencies && Array.isArray(subject.competencies) && subject.competencies.length > 0 ? (
                            <ul className="list-disc pl-3 space-y-0.5">
                              {subject.competencies.slice(0, 3).map((comp: any, i: number) => (
                                <li key={i} className="text-gray-600">
                                  {typeof comp === 'string' ? comp : (comp?.name || comp?.code || `C${i+1}`)}
                                  {comp?.score && <span className="ml-1 text-blue-600">({comp.score})</span>}
                                </li>
                              ))}
                              {subject.competencies.length > 3 && (
                                <li className="text-gray-400">+{subject.competencies.length - 3} {language === 'fr' ? 'autres' : 'more'}</li>
                              )}
                            </ul>
                          ) : subject.evaluatedCompetencies ? (
                            <span className="text-gray-600">{subject.evaluatedCompetencies}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="border p-2 text-xs max-w-[150px] truncate" title={subject.appreciation || ''}>
                          {subject.appreciation || '-'}
                        </td>
                        <td className="border p-2 text-xs max-w-[150px]">
                          {subject.remark || subject.comment || subject.remarks || '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="border p-4 text-center text-gray-500">{t.noData}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Bulletin Type and Language Info */}
            {(selectedBulletin.bulletinType || selectedBulletin.language) && (
              <div className="flex gap-4 mt-3 text-sm text-gray-600">
                {selectedBulletin.bulletinType && (
                  <div>
                    <span className="font-medium">{language === 'fr' ? 'Type:' : 'Type:'}</span>{' '}
                    <Badge variant="outline" className="ml-1">{selectedBulletin.bulletinType}</Badge>
                  </div>
                )}
                {selectedBulletin.language && (
                  <div>
                    <span className="font-medium">{language === 'fr' ? 'Langue:' : 'Language:'}</span>{' '}
                    <Badge variant="outline" className="ml-1">{selectedBulletin.language === 'fr' ? 'Français' : 'English'}</Badge>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Review Section */}
          {selectedBulletin.reviewStatus === 'pending' && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="review-comments">{t.reviewComments}</Label>
                <Textarea
                  id="review-comments"
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder={t.reviewCommentsPlaceholder}
                  rows={4}
                  data-testid="textarea-review-comments"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={reviewMutation.isPending}
                  data-testid="button-approve"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  {t.approve}
                </Button>
                <Button
                  onClick={handleReject}
                  variant="destructive"
                  disabled={reviewMutation.isPending}
                  data-testid="button-reject"
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  {t.reject}
                </Button>
              </div>
            </div>
          )}

          {/* Reviewed Info */}
          {selectedBulletin.reviewStatus && selectedBulletin.reviewStatus !== 'pending' && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                {getStatusBadge(selectedBulletin.reviewStatus)}
                {selectedBulletin.reviewedAt && (
                  <span className="text-sm text-gray-600">
                    {language === 'fr' ? 'le' : 'on'} {format(new Date(selectedBulletin.reviewedAt), 'PPp', { locale: language === 'fr' ? fr : enUS })}
                  </span>
                )}
              </div>
              {selectedBulletin.reviewComments && (
                <div className="mt-2">
                  <p className="text-sm font-semibold text-gray-700">{t.reviewComments}:</p>
                  <p className="text-sm text-gray-600 mt-1" data-testid="text-review-comments">{selectedBulletin.reviewComments}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold" data-testid="title-teacher-bulletins">{t.title}</CardTitle>
            <p className="text-sm text-gray-600" data-testid="subtitle-teacher-bulletins">{t.subtitle}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncGradesMutation.mutate()}
            disabled={syncGradesMutation.isPending}
            className="flex items-center gap-2"
            data-testid="button-sync-grades"
            title={t.syncGradesDesc}
          >
            <RefreshCw className={`w-4 h-4 ${syncGradesMutation.isPending ? 'animate-spin' : ''}`} />
            {syncGradesMutation.isPending ? t.syncing : t.syncGrades}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending" data-testid="tab-pending">
              <Clock className="w-4 h-4 mr-2" />
              {t.pending} ({bulletins.filter(b => b.reviewStatus === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="approved" data-testid="tab-approved">
              <CheckCircle className="w-4 h-4 mr-2" />
              {t.approved} ({bulletins.filter(b => b.reviewStatus === 'approved').length})
            </TabsTrigger>
            <TabsTrigger value="rejected" data-testid="tab-rejected">
              <XCircle className="w-4 h-4 mr-2" />
              {t.rejected} ({bulletins.filter(b => b.reviewStatus === 'rejected').length})
            </TabsTrigger>
            <TabsTrigger value="all" data-testid="tab-all">
              <FileText className="w-4 h-4 mr-2" />
              {t.all} ({bulletins.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredBulletins.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600" data-testid="text-no-bulletins">{t.noBulletins}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBulletins.map((bulletin) => (
                  <Card key={bulletin.id} className="hover:shadow-md transition-shadow" data-testid={`bulletin-card-${bulletin.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-lg" data-testid={`student-name-${bulletin.id}`}>{bulletin.studentName || bulletin.studentInfo?.name || t.noData}</h4>
                            {getStatusBadge(bulletin.reviewStatus)}
                            {bulletin.status === 'compiled_from_grades' && (
                              <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 border-indigo-300" data-testid="badge-compiled">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {language === 'fr' ? 'Compilé depuis Notes' : 'Compiled from Grades'}
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">{t.teacher}:</span> {bulletin.teacherName || t.noData}
                            </div>
                            <div>
                              <span className="font-medium">{t.class}:</span> {bulletin.studentInfo?.classLabel || t.noData}
                            </div>
                            <div>
                              <span className="font-medium">{t.term}:</span> {bulletin.term}
                            </div>
                            <div>
                              <span className="font-medium">{t.sentOn}:</span>{' '}
                              {bulletin.sentToSchoolAt ? format(new Date(bulletin.sentToSchoolAt), 'PP', { locale: language === 'fr' ? fr : enUS }) : t.noData}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedBulletin(bulletin)}
                          className="ml-4"
                          data-testid={`button-view-${bulletin.id}`}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {t.view}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TeacherSubmittedBulletins;

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ClipboardList, CheckCircle, Clock, XCircle, FileText, Eye, 
  Download, Send, User, Calendar, GraduationCap, BookOpen,
  MessageSquare, AlertCircle, ThumbsUp, ThumbsDown, Trophy
} from 'lucide-react';

interface Bulletin {
  id: number;
  studentId: number;
  studentName: string;
  classId: number;
  className: string;
  period: string;
  academicYear: string;
  generalAverage: number;
  classRank: number;
  totalStudentsInClass: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'published' | 'sent';
  submittedBy?: number;
  submittedByName?: string;
  approvedBy?: number;
  approvedByName?: string;
  submittedAt?: string;
  approvedAt?: string;
  publishedAt?: string;
  grades: Array<{
    subjectId: number;
    subjectName: string;
    grade: number;
    maxGrade: number;
    coefficient: number;
    comment?: string;
  }>;
  generalComment?: string;
  recommendations?: string;
  conduct?: string;
  attendanceRate?: number;
  lastApprovalComment?: string;
}

const BulletinApprovalNew: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedBulletin, setSelectedBulletin] = useState<Bulletin | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalComment, setApprovalComment] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  const text = {
    fr: {
      title: 'Validation Bulletins',
      subtitle: 'Système d\'approbation et distribution des bulletins scolaires',
      pendingApproval: 'En Attente d\'Approbation',
      approved: 'Approuvés',
      sent: 'Envoyés',
      myBulletins: 'Mes Bulletins',
      totalBulletins: 'Bulletins Totaux',
      studentName: 'Élève',
      class: 'Classe',
      period: 'Période',
      teacher: 'Enseignant',
      status: 'Statut',
      average: 'Moyenne',
      rank: 'Rang',
      actions: 'Actions',
      draft: 'Brouillon',
      submitted: 'Soumis',
      pending: 'En attente',
      approvedStatus: 'Approuvé',
      rejected: 'Rejeté',
      published: 'Publié',
      distributed: 'Distribué',
      approve: 'Approuver',
      reject: 'Rejeter',
      view: 'Voir',
      download: 'Télécharger',
      send: 'Envoyer',
      comment: 'Commentaire',
      addComment: 'Ajouter un commentaire',
      approvalComment: 'Commentaire d\'approbation',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      bulletinApproved: 'Bulletin approuvé avec succès!',
      bulletinRejected: 'Bulletin rejeté',
      bulletinSent: 'Bulletin envoyé aux parents',
      submittedBy: 'Soumis par',
      submittedOn: 'Soumis le',
      approvedBy: 'Approuvé par',
      approvedOn: 'Approuvé le',
      conduct: 'Conduite',
      attendance: 'Assiduité',
      subjects: 'Matières',
      generalComment: 'Commentaire général',
      recommendations: 'Recommandations',
      noBulletins: 'Aucun bulletin dans cette catégorie',
      loadingBulletins: 'Chargement des bulletins...'
    },
    en: {
      title: 'Bulletin Approval',
      subtitle: 'School report card approval and distribution system',
      pendingApproval: 'Pending Approval',
      approved: 'Approved',
      sent: 'Sent',
      myBulletins: 'My Bulletins',
      totalBulletins: 'Total Bulletins',
      studentName: 'Student',
      class: 'Class',
      period: 'Period',
      teacher: 'Teacher',
      status: 'Status',
      average: 'Average',
      rank: 'Rank',
      actions: 'Actions',
      draft: 'Draft',
      submitted: 'Submitted',
      pending: 'Pending',
      approvedStatus: 'Approved',
      rejected: 'Rejected',
      published: 'Published',
      distributed: 'Distributed',
      approve: 'Approve',
      reject: 'Reject',
      view: 'View',
      download: 'Download',
      send: 'Send',
      comment: 'Comment',
      addComment: 'Add comment',
      approvalComment: 'Approval comment',
      cancel: 'Cancel',
      confirm: 'Confirm',
      bulletinApproved: 'Bulletin approved successfully!',
      bulletinRejected: 'Bulletin rejected',
      bulletinSent: 'Bulletin sent to parents',
      submittedBy: 'Submitted by',
      submittedOn: 'Submitted on',
      approvedBy: 'Approved by',
      approvedOn: 'Approved on',
      conduct: 'Conduct',
      attendance: 'Attendance',
      subjects: 'Subjects',
      generalComment: 'General comment',
      recommendations: 'Recommendations',
      noBulletins: 'No bulletins in this category',
      loadingBulletins: 'Loading bulletins...'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch all bulletins
  const { data: bulletins = [], isLoading } = useQuery({
    queryKey: ['/api/bulletins'],
    queryFn: async () => {
      const response = await fetch('/api/bulletins');
      if (!response.ok) throw new Error('Failed to fetch bulletins');
      return response.json();
    }
  });

  // Approve bulletin mutation
  const approveBulletinMutation = useMutation({
    mutationFn: async ({ bulletinId, comment }: { bulletinId: number; comment: string }) => {
      const response = await fetch(`/api/bulletins/${bulletinId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', comment })
      });
      if (!response.ok) throw new Error('Failed to approve bulletin');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bulletins'] });
      setShowApprovalDialog(false);
      setApprovalComment('');
      toast({ title: t.bulletinApproved });
    },
    onError: () => {
      toast({ 
        title: 'Erreur', 
        description: 'Impossible d\'approuver le bulletin',
        variant: 'destructive'
      });
    }
  });

  // Reject bulletin mutation
  const rejectBulletinMutation = useMutation({
    mutationFn: async ({ bulletinId, comment }: { bulletinId: number; comment: string }) => {
      const response = await fetch(`/api/bulletins/${bulletinId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', comment })
      });
      if (!response.ok) throw new Error('Failed to reject bulletin');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bulletins'] });
      setShowApprovalDialog(false);
      setApprovalComment('');
      toast({ title: t.bulletinRejected });
    },
    onError: () => {
      toast({ 
        title: 'Erreur', 
        description: 'Impossible de rejeter le bulletin',
        variant: 'destructive'
      });
    }
  });

  // Send bulletin mutation
  const sendBulletinMutation = useMutation({
    mutationFn: async (bulletinId: number) => {
      const response = await fetch(`/api/bulletins/${bulletinId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to send bulletin');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bulletins'] });
      toast({ title: t.bulletinSent });
    },
    onError: () => {
      toast({ 
        title: 'Erreur', 
        description: 'Impossible d\'envoyer le bulletin',
        variant: 'destructive'
      });
    }
  });

  const handleApprovalAction = (bulletin: Bulletin, action: 'approve' | 'reject') => {
    setSelectedBulletin(bulletin);
    setApprovalAction(action);
    setShowApprovalDialog(true);
  };

  const confirmApproval = () => {
    if (!selectedBulletin) return;
    
    if (approvalAction === 'approve') {
      approveBulletinMutation.mutate({
        bulletinId: selectedBulletin.id,
        comment: approvalComment
      });
    } else {
      rejectBulletinMutation.mutate({
        bulletinId: selectedBulletin.id,
        comment: approvalComment
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-500', text: t.draft },
      submitted: { color: 'bg-blue-500', text: t.submitted },
      pending: { color: 'bg-yellow-500', text: t.pending },
      approved: { color: 'bg-green-500', text: t.approved },
      rejected: { color: 'bg-red-500', text: t.rejected },
      published: { color: 'bg-purple-500', text: t.published },
      sent: { color: 'bg-emerald-500', text: t.distributed }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge className={`${config.color} text-white text-xs`}>
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const filterBulletinsByStatus = (status: string[]) => {
    return (Array.isArray(bulletins) ? bulletins : []).filter((bulletin: Bulletin) => status.includes(bulletin.status));
  };

  // Statistics
  const pendingBulletins = filterBulletinsByStatus(['submitted', 'pending']);
  const approvedBulletins = filterBulletinsByStatus(['approved', 'published']);
  const sentBulletins = filterBulletinsByStatus(['sent']);

  const BulletinCard = ({ bulletin }: { bulletin: Bulletin }) => (
    <div className="border rounded-lg p-4 space-y-3 bg-white dark:bg-gray-800">
      {/* Bulletin Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-lg" data-testid={`bulletin-student-${bulletin.id}`}>
            {bulletin.studentName}
          </h3>
          <p className="text-sm text-gray-500" data-testid={`bulletin-class-${bulletin.id}`}>
            {bulletin.className} • {bulletin.period} • {bulletin.academicYear}
          </p>
        </div>
        {getStatusBadge(bulletin.status)}
      </div>

      {/* Academic Info */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-blue-500" />
          <span>Moyenne: <strong data-testid={`bulletin-average-${bulletin.id}`}>{bulletin.generalAverage}/20</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span>Rang: <strong data-testid={`bulletin-rank-${bulletin.id}`}>{bulletin.classRank}/{bulletin.totalStudentsInClass}</strong></span>
        </div>
      </div>

      {/* Workflow Info */}
      {bulletin.submittedByName && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 text-sm">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-300">
              {t.submittedBy}: <strong>{bulletin.submittedByName}</strong>
            </span>
          </div>
          {bulletin.submittedAt && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">
                {t.submittedOn}: {formatDate(bulletin.submittedAt)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Last Approval Comment */}
      {bulletin.lastApprovalComment && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Dernier commentaire:</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300" data-testid={`bulletin-comment-${bulletin.id}`}>
                {bulletin.lastApprovalComment}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="flex items-center gap-1"
          data-testid={`button-view-${bulletin.id}`}
          onClick={() => setSelectedBulletin(bulletin)}
        >
          <Eye className="w-3 h-3" />
          {t.view}
        </Button>

        {bulletin.status === 'submitted' && (
          <>
            <Button 
              size="sm" 
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
              data-testid={`button-approve-${bulletin.id}`}
              onClick={() => handleApprovalAction(bulletin, 'approve')}
            >
              <ThumbsUp className="w-3 h-3" />
              {t.approve}
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              className="flex items-center gap-1"
              data-testid={`button-reject-${bulletin.id}`}
              onClick={() => handleApprovalAction(bulletin, 'reject')}
            >
              <ThumbsDown className="w-3 h-3" />
              {t.reject}
            </Button>
          </>
        )}

        {bulletin.status === 'approved' && (
          <Button 
            size="sm" 
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
            data-testid={`button-send-${bulletin.id}`}
            onClick={() => sendBulletinMutation.mutate(bulletin.id)}
            disabled={sendBulletinMutation.isPending}
          >
            <Send className="w-3 h-3" />
            {sendBulletinMutation.isPending ? 'Envoi...' : t.send}
          </Button>
        )}

        <Button 
          size="sm" 
          variant="outline"
          className="flex items-center gap-1"
          data-testid={`button-download-${bulletin.id}`}
        >
          <Download className="w-3 h-3" />
          PDF
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.title || ''}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t.totalBulletins}</p>
                <p className="text-2xl font-bold" data-testid="stat-total-bulletins">{(Array.isArray(bulletins) ? bulletins.length : 0)}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t.pendingApproval}</p>
                <p className="text-2xl font-bold text-yellow-600" data-testid="stat-pending-bulletins">{(Array.isArray(pendingBulletins) ? pendingBulletins.length : 0)}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t.approved}</p>
                <p className="text-2xl font-bold text-green-600" data-testid="stat-approved-bulletins">{(Array.isArray(approvedBulletins) ? approvedBulletins.length : 0)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t.sent}</p>
                <p className="text-2xl font-bold text-emerald-600" data-testid="stat-sent-bulletins">{(Array.isArray(sentBulletins) ? sentBulletins.length : 0)}</p>
              </div>
              <Send className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" data-testid="tab-pending">
            {t.pendingApproval} ({(Array.isArray(pendingBulletins) ? pendingBulletins.length : 0)})
          </TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-approved">
            {t.approved} ({(Array.isArray(approvedBulletins) ? approvedBulletins.length : 0)})
          </TabsTrigger>
          <TabsTrigger value="sent" data-testid="tab-sent">
            {t.sent} ({(Array.isArray(sentBulletins) ? sentBulletins.length : 0)})
          </TabsTrigger>
          <TabsTrigger value="my-bulletins" data-testid="tab-my-bulletins">
            {t.myBulletins}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                {t.pendingApproval}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">{t.loadingBulletins}</div>
              ) : (Array.isArray(pendingBulletins) ? pendingBulletins.length : 0) === 0 ? (
                <div className="text-center py-8 text-gray-500">{t.noBulletins}</div>
              ) : (
                <div className="space-y-4">
                  {(Array.isArray(pendingBulletins) ? pendingBulletins : []).map((bulletin: Bulletin) => (
                    <BulletinCard key={bulletin.id} bulletin={bulletin} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                {t.approved}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">{t.loadingBulletins}</div>
              ) : (Array.isArray(approvedBulletins) ? approvedBulletins.length : 0) === 0 ? (
                <div className="text-center py-8 text-gray-500">{t.noBulletins}</div>
              ) : (
                <div className="space-y-4">
                  {(Array.isArray(approvedBulletins) ? approvedBulletins : []).map((bulletin: Bulletin) => (
                    <BulletinCard key={bulletin.id} bulletin={bulletin} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-500" />
                {t.sent}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">{t.loadingBulletins}</div>
              ) : (Array.isArray(sentBulletins) ? sentBulletins.length : 0) === 0 ? (
                <div className="text-center py-8 text-gray-500">{t.noBulletins}</div>
              ) : (
                <div className="space-y-4">
                  {(Array.isArray(sentBulletins) ? sentBulletins : []).map((bulletin: Bulletin) => (
                    <BulletinCard key={bulletin.id} bulletin={bulletin} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-bulletins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                {t.myBulletins}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Fonctionnalité disponible pour les enseignants
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? t.approve : t.reject} - {selectedBulletin?.studentName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t.approvalComment}</Label>
              <Textarea
                value={approvalComment}
                onChange={(e) => setApprovalComment(e?.target?.value)}
                placeholder={approvalAction === 'approve' ? 'Commentaire d\'approbation (optionnel)' : 'Raison du rejet (requis)'}
                rows={3}
                data-testid="textarea-approval-comment"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowApprovalDialog(false)} data-testid="button-cancel-approval">
                {t.cancel}
              </Button>
              <Button 
                onClick={confirmApproval} 
                disabled={approveBulletinMutation.isPending || rejectBulletinMutation.isPending}
                className={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                variant={approvalAction === 'reject' ? 'destructive' : 'default'}
                data-testid="button-confirm-approval"
              >
                {approveBulletinMutation.isPending || rejectBulletinMutation.isPending ? 'Traitement...' : t.confirm}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BulletinApprovalNew;
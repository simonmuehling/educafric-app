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
  MessageSquare, AlertCircle, ThumbsUp, ThumbsDown, Trophy, 
  Languages, Printer, TestTube, Upload, Stamp, Users, Bell, Signature
} from 'lucide-react';
import { generateBulletinPDF } from '@/utils/bulletinPdfGenerator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

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
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewLanguage, setPreviewLanguage] = useState<'fr' | 'en'>('fr');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showBulkSignDialog, setShowBulkSignDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [signerName, setSignerName] = useState<string>('');
  const [signerPosition, setSignerPosition] = useState<string>('');
  const [schoolStamp, setSchoolStamp] = useState<File | null>(null);
  const [isNotifying, setIsNotifying] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [previewType, setPreviewType] = useState<'bulletin' | 'transcript'>('bulletin');

  const text = {
    fr: {
      title: 'Bulletins',
      subtitle: 'Génération, validation et distribution des bulletins scolaires bilingues avec QR code',
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
      previewPDF: 'Prévisualiser PDF',
      generateBilingual: 'Générer Bilingue',
      testBulletin: 'Tester Bulletin',
      french: 'Français',
      english: 'Anglais',
      both: 'Les deux',
      bulkSign: 'Signature en Lot',
      uploadStamp: 'Télécharger Cachet',
      signerName: 'Nom du Signataire',
      signerPosition: 'Position dans l\'École',
      selectClass: 'Sélectionner Classe',
      notifyParents: 'Notifier Parents',
      sendBulletins: 'Envoyer Bulletins',
      signAndSend: 'Signer et Envoyer',
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
      title: 'Bulletins',
      subtitle: 'Generation, validation and distribution of bilingual school bulletins with QR code',
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
      previewPDF: 'Preview PDF',
      generateBilingual: 'Generate Bilingual',
      testBulletin: 'Test Bulletin',
      french: 'French',
      english: 'English',
      both: 'Both',
      bulkSign: 'Bulk Sign',
      uploadStamp: 'Upload Stamp',
      signerName: 'Signer Name',
      signerPosition: 'Position in School',
      selectClass: 'Select Class',
      notifyParents: 'Notify Parents',
      sendBulletins: 'Send Bulletins',
      signAndSend: 'Sign and Send',
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

  // Fetch school template preview data
  const { data: schoolTemplateData, isLoading: isLoadingTemplate } = useQuery({
    queryKey: ['/api/bulletins/school-template-preview'],
    queryFn: async () => {
      const response = await fetch('/api/bulletins/school-template-preview');
      if (!response.ok) throw new Error('Failed to fetch school template preview');
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

  // Fonction pour tester le bulletin (prévisualisation)
  const handleTestBulletin = (bulletin: Bulletin) => {
    setSelectedBulletin(bulletin);
    setShowPreviewDialog(true);
  };

  // Fonction pour signature en lot par classe
  const handleBulkSignClass = async () => {
    if (!selectedClass || !signerName || !signerPosition) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' 
          ? 'Veuillez remplir tous les champs obligatoires'
          : 'Please fill all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/bulletins/bulk-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          className: selectedClass,
          signerName,
          signerPosition,
          hasStamp: !!schoolStamp
        })
      });

      if (!response.ok) throw new Error('Failed to bulk sign');

      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' 
          ? `Bulletins de la classe ${selectedClass} signés avec succès`
          : `Bulletins for class ${selectedClass} signed successfully`
      });

      setShowBulkSignDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/bulletins'] });
    } catch (error) {
      console.error('Error bulk signing:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' 
          ? 'Erreur lors de la signature en lot'
          : 'Error during bulk signing',
        variant: 'destructive'
      });
    }
  };

  // Fonction pour envoyer les bulletins avec notifications
  const handleSendBulletinsWithNotifications = async (classNames: string[]) => {
    setIsNotifying(true);
    try {
      const response = await fetch('/api/bulletins/send-with-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          classNames,
          notificationTypes: ['sms', 'whatsapp', 'email', 'push'],
          language: language
        })
      });

      if (!response.ok) throw new Error('Failed to send bulletins');

      const result = await response.json();

      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: language === 'fr' 
          ? `${result.sent} bulletins envoyés avec notifications`
          : `${result.sent} bulletins sent with notifications`
      });

      queryClient.invalidateQueries({ queryKey: ['/api/bulletins'] });
    } catch (error) {
      console.error('Error sending bulletins:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' 
          ? 'Erreur lors de l\'envoi des bulletins'
          : 'Error sending bulletins',
        variant: 'destructive'
      });
    } finally {
      setIsNotifying(false);
    }
  };

  // Upload du cachet de l'école
  const handleStampUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: language === 'fr' 
            ? 'Le fichier doit faire moins de 5MB'
            : 'File must be less than 5MB',
          variant: 'destructive'
        });
        return;
      }
      setSchoolStamp(file);
    }
  };

  // Handlers pour les boutons de preview
  const handlePreviewBulletin = () => {
    setPreviewType('bulletin');
    setShowTemplatePreview(true);
    
    toast({
      title: language === 'fr' ? '📄 Aperçu Bulletin' : '📄 Bulletin Preview',
      description: language === 'fr' 
        ? 'Génération de l\'aperçu personnalisé de votre école...'
        : 'Generating your school\'s customized preview...'
    });
  };

  const handlePreviewTranscript = () => {
    setPreviewType('transcript');
    setShowTemplatePreview(true);
    
    toast({
      title: language === 'fr' ? '🎓 Aperçu Relevé' : '🎓 Transcript Preview',
      description: language === 'fr' 
        ? 'Génération de l\'aperçu du relevé de notes officiel...'
        : 'Generating official transcript preview...'
    });
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
          data-testid={`button-test-${bulletin.id}`}
          onClick={() => handleTestBulletin(bulletin)}
        >
          <TestTube className="w-3 h-3" />
          {t.testBulletin}
        </Button>
        
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

      {/* School Template Preview */}
      <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <Eye className="w-5 h-5 text-indigo-600" />
            </div>
            {language === 'fr' ? '📄 Aperçu Template École' : '📄 School Template Preview'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bulletin Preview */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {language === 'fr' ? 'Modèle Bulletin' : 'Bulletin Template'}
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{language === 'fr' ? 'En-tête école:' : 'School header:'}</span>
                  <span className="font-medium text-green-600">✅ Personnalisé</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{language === 'fr' ? 'Logo école:' : 'School logo:'}</span>
                  <span className="font-medium text-green-600">✅ Inclus</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{language === 'fr' ? 'Couleurs école:' : 'School colors:'}</span>
                  <span className="font-medium text-green-600">✅ Appliquées</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">QR Code:</span>
                  <span className="font-medium text-green-600">✅ Sécurisé</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1" 
                  data-testid="button-preview-bulletin"
                  onClick={handlePreviewBulletin}
                  disabled={isLoadingTemplate}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {isLoadingTemplate ? 
                    (language === 'fr' ? 'Chargement...' : 'Loading...') :
                    (language === 'fr' ? 'Voir Aperçu' : 'View Preview')
                  }
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                  data-testid="button-view-full-template"
                  onClick={() => {
                    window.open('/documents/template-bulletin-educafric.html', '_blank');
                    toast({
                      title: language === 'fr' ? '📋 Template Complet' : '📋 Full Template',
                      description: language === 'fr' 
                        ? 'Ouverture du template complet dans un nouvel onglet'
                        : 'Opening complete template in new tab'
                    });
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Template Complet' : 'Full Template'}
                </Button>
              </div>
            </div>

            {/* Transcript Preview */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {language === 'fr' ? 'Modèle Relevé' : 'Transcript Template'}
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{language === 'fr' ? 'Format officiel:' : 'Official format:'}</span>
                  <span className="font-medium text-green-600">✅ Conforme</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{language === 'fr' ? 'Signature digitale:' : 'Digital signature:'}</span>
                  <span className="font-medium text-green-600">✅ Intégrée</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{language === 'fr' ? 'Cachet école:' : 'School seal:'}</span>
                  <span className="font-medium text-green-600">✅ Automatique</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{language === 'fr' ? 'Bilingue:' : 'Bilingual:'}</span>
                  <span className="font-medium text-green-600">✅ FR/EN</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-3" 
                data-testid="button-preview-transcript"
                onClick={handlePreviewTranscript}
                disabled={isLoadingTemplate}
              >
                <Eye className="w-4 h-4 mr-2" />
                {isLoadingTemplate ? 
                  (language === 'fr' ? 'Chargement...' : 'Loading...') :
                  (language === 'fr' ? 'Voir Aperçu' : 'View Preview')
                }
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200">
            <Trophy className="w-6 h-6 text-amber-600" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {language === 'fr' 
                ? '🎨 Templates personnalisés pour votre école avec logo, couleurs et signature officielle'
                : '🎨 Customized templates for your school with logo, colors and official signature'
              }
            </span>
          </div>
        </CardContent>
      </Card>

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

      {/* QR Code & Validation Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="2" width="3" height="3"/>
                <rect x="7" y="2" width="3" height="3"/>
                <rect x="12" y="2" width="3" height="3"/>
                <rect x="17" y="2" width="3" height="3"/>
                <rect x="2" y="7" width="3" height="3"/>
                <rect x="7" y="7" width="3" height="3"/>
                <rect x="12" y="7" width="3" height="3"/>
                <rect x="17" y="7" width="3" height="3"/>
                <rect x="2" y="12" width="3" height="3"/>
                <rect x="7" y="12" width="3" height="3"/>
                <rect x="12" y="12" width="3" height="3"/>
                <rect x="17" y="12" width="3" height="3"/>
                <rect x="2" y="17" width="3" height="3"/>
                <rect x="7" y="17" width="3" height="3"/>
                <rect x="12" y="17" width="3" height="3"/>
                <rect x="17" y="17" width="3" height="3"/>
              </svg>
            </div>
            🔐 {language === 'fr' ? 'Authentification QR Code - ACTIF' : 'QR Code Authentication - ACTIVE'}
          </CardTitle>
          <p className="text-sm text-green-600 font-medium">
            ✅ {language === 'fr' 
              ? 'Chaque bulletin généré inclut automatiquement un QR code sécurisé pour vérification d\'authenticité'
              : 'Each generated bulletin automatically includes a secure QR code for authenticity verification'
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {language === 'fr' ? 'Auto-génération' : 'Auto-generation'}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {language === 'fr' ? 'QR unique par bulletin' : 'Unique QR per bulletin'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12l-6-6 1.41-1.41L10 9.17l8.59-8.58L20 2l-10 10z"/>
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {language === 'fr' ? 'Vérification publique' : 'Public verification'}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {language === 'fr' ? 'Route: /api/bulletin-validation/bulletins/verify-qr' : 'Route: /api/bulletin-validation/bulletins/verify-qr'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Stamp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  {language === 'fr' ? 'Hash sécurisé' : 'Secure hash'}
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  {language === 'fr' ? 'Anti-contrefaçon' : 'Anti-counterfeit'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {language === 'fr' ? 'Actions en Lot - École Uniquement' : 'Bulk Actions - School Only'}
          </CardTitle>
          <p className="text-sm text-blue-600 font-medium">
            ⚡ {language === 'fr' 
              ? 'Validation uniquement par l\'école - Plus de validation professeur principal requise'
              : 'School validation only - No principal teacher validation required'
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => setShowBulkSignDialog(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Signature className="w-4 h-4" />
              {t.bulkSign || (language === 'fr' ? 'Signature en Lot par Classe' : 'Bulk Sign by Class')}
            </Button>
            <Button
              onClick={() => handleSendBulletinsWithNotifications([])}
              disabled={isNotifying}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Bell className="w-4 h-4" />
              {isNotifying ? (language === 'fr' ? 'Envoi...' : 'Sending...') : (t.sendBulletins || (language === 'fr' ? 'Envoyer avec Notifications' : 'Send with Notifications'))}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" data-testid="tab-pending" className="flex-col sm:flex-row">
            <Clock className="w-4 h-4 sm:mr-2 mb-1 sm:mb-0" />
            <span className="hidden sm:inline">
              {t.pendingApproval} ({(Array.isArray(pendingBulletins) ? pendingBulletins.length : 0)})
            </span>
            <span className="text-xs sm:hidden">
              {(Array.isArray(pendingBulletins) ? pendingBulletins.length : 0)}
            </span>
          </TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-approved" className="flex-col sm:flex-row">
            <CheckCircle className="w-4 h-4 sm:mr-2 mb-1 sm:mb-0" />
            <span className="hidden sm:inline">
              {t.approved} ({(Array.isArray(approvedBulletins) ? approvedBulletins.length : 0)})
            </span>
            <span className="text-xs sm:hidden">
              {(Array.isArray(approvedBulletins) ? approvedBulletins.length : 0)}
            </span>
          </TabsTrigger>
          <TabsTrigger value="sent" data-testid="tab-sent" className="flex-col sm:flex-row">
            <Send className="w-4 h-4 sm:mr-2 mb-1 sm:mb-0" />
            <span className="hidden sm:inline">
              {t.sent} ({(Array.isArray(sentBulletins) ? sentBulletins.length : 0)})
            </span>
            <span className="text-xs sm:hidden">
              {(Array.isArray(sentBulletins) ? sentBulletins.length : 0)}
            </span>
          </TabsTrigger>
          <TabsTrigger value="my-bulletins" data-testid="tab-my-bulletins" className="flex-col sm:flex-row">
            <User className="w-4 h-4 sm:mr-2 mb-1 sm:mb-0" />
            <span className="hidden sm:inline">
              {t.myBulletins}
            </span>
            <span className="text-xs sm:hidden">
              Mes
            </span>
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

      {/* Bulk Sign Dialog */}
      <Dialog open={showBulkSignDialog} onOpenChange={setShowBulkSignDialog}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Signature className="w-5 h-5" />
              {language === 'fr' ? 'Signature en Lot par Classe' : 'Bulk Sign by Class'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t.selectClass || (language === 'fr' ? 'Sélectionner Classe' : 'Select Class')}</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'fr' ? 'Choisir une classe...' : 'Choose a class...'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6ème A">6ème A</SelectItem>
                  <SelectItem value="6ème B">6ème B</SelectItem>
                  <SelectItem value="5ème A">5ème A</SelectItem>
                  <SelectItem value="4ème A">4ème A</SelectItem>
                  <SelectItem value="3ème A">3ème A</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>{t.signerName || (language === 'fr' ? 'Nom du Signataire' : 'Signer Name')}</Label>
              <Input
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder={language === 'fr' ? 'Ex: Dr. Jean Dupont' : 'Ex: Dr. John Smith'}
              />
            </div>
            
            <div>
              <Label>{t.signerPosition || (language === 'fr' ? 'Position dans l\'École' : 'Position in School')}</Label>
              <Input
                value={signerPosition}
                onChange={(e) => setSignerPosition(e.target.value)}
                placeholder={language === 'fr' ? 'Ex: Directeur Général' : 'Ex: Principal'}
              />
            </div>
            
            <div>
              <Label className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                {t.uploadStamp || (language === 'fr' ? 'Télécharger Cachet (Optionnel)' : 'Upload Stamp (Optional)')}
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleStampUpload}
                className="file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {schoolStamp && (
                <p className="text-sm text-green-600 mt-1">
                  ✅ {schoolStamp.name}
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowBulkSignDialog(false)}>
                {t.cancel || (language === 'fr' ? 'Annuler' : 'Cancel')}
              </Button>
              <Button 
                onClick={handleBulkSignClass}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Signature className="w-4 h-4 mr-2" />
                {t.signAndSend || (language === 'fr' ? 'Signer et Continuer' : 'Sign and Continue')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              {language === 'fr' ? 'Prévisualisation Bulletin' : 'Bulletin Preview'} - {selectedBulletin?.studentName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="flex gap-2 mb-4">
              <Button
                size="sm"
                variant={previewLanguage === 'fr' ? 'default' : 'outline'}
                onClick={() => setPreviewLanguage('fr')}
                className="flex items-center gap-1"
              >
                <Languages className="w-3 h-3" />
                Français
              </Button>
              <Button
                size="sm"
                variant={previewLanguage === 'en' ? 'default' : 'outline'}
                onClick={() => setPreviewLanguage('en')}
                className="flex items-center gap-1"
              >
                <Languages className="w-3 h-3" />
                English
              </Button>
            </div>
            
            {selectedBulletin && (
              <div className="border rounded p-4 bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">
                  🔐 {language === 'fr' 
                    ? 'Ce bulletin sera généré avec QR code sécurisé et signature digitale'
                    : 'This bulletin will be generated with secure QR code and digital signature'
                  }
                </p>
                <div className="bg-white p-4 rounded border">
                  <h3 className="font-bold text-lg">
                    {previewLanguage === 'fr' ? 'BULLETIN SCOLAIRE' : 'SCHOOL REPORT CARD'}
                  </h3>
                  <p><strong>{previewLanguage === 'fr' ? 'Élève' : 'Student'}:</strong> {selectedBulletin.studentName}</p>
                  <p><strong>{previewLanguage === 'fr' ? 'Classe' : 'Class'}:</strong> {selectedBulletin.className}</p>
                  <p><strong>{previewLanguage === 'fr' ? 'Période' : 'Period'}:</strong> {selectedBulletin.period}</p>
                  <p><strong>{previewLanguage === 'fr' ? 'Moyenne Générale' : 'Overall Average'}:</strong> {selectedBulletin.generalAverage}/20</p>
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                {t.cancel || (language === 'fr' ? 'Fermer' : 'Close')}
              </Button>
              <Button 
                onClick={async () => {
                  if (selectedBulletin) {
                    setIsGeneratingPDF(true);
                    try {
                      // Convert Bulletin to BulletinData format
                      const bulletinData = {
                        student: {
                          id: selectedBulletin.studentId,
                          name: selectedBulletin.studentName,
                          class: selectedBulletin.className
                        },
                        subjects: selectedBulletin.grades.map(grade => ({
                          name: grade.subjectName,
                          grade: grade.grade,
                          coefficient: grade.coefficient,
                          teacher: 'Teacher', // Default teacher name
                          comment: grade.comment
                        })),
                        period: selectedBulletin.period,
                        academicYear: selectedBulletin.academicYear,
                        generalAverage: selectedBulletin.generalAverage,
                        classRank: selectedBulletin.classRank,
                        totalStudents: selectedBulletin.totalStudentsInClass,
                        teacherComments: selectedBulletin.generalComment,
                        directorComments: selectedBulletin.recommendations
                      };
                      await generateBulletinPDF(bulletinData, previewLanguage);
                    } catch (error) {
                      console.error('Error generating PDF:', error);
                    } finally {
                      setIsGeneratingPDF(false);
                    }
                  }
                }}
                className="bg-green-600 hover:bg-green-700"
                disabled={isGeneratingPDF}
              >
                <Printer className="w-4 h-4 mr-2" />
                {isGeneratingPDF ? (language === 'fr' ? 'Génération...' : 'Generating...') : (language === 'fr' ? 'Générer PDF' : 'Generate PDF')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={showTemplatePreview} onOpenChange={setShowTemplatePreview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {previewType === 'bulletin' ? (
                <>
                  <FileText className="w-5 h-5 text-blue-600" />
                  {language === 'fr' ? '📄 Aperçu Template Bulletin' : '📄 Bulletin Template Preview'}
                </>
              ) : (
                <>
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                  {language === 'fr' ? '🎓 Aperçu Template Relevé' : '🎓 Transcript Template Preview'}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* School Info */}
            {schoolTemplateData?.data && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-4 rounded-lg border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Trophy className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {schoolTemplateData.data.schoolName}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'fr' 
                    ? 'Template personnalisé avec branding spécifique à votre école'
                    : 'Customized template with your school-specific branding'
                  }
                </p>
              </div>
            )}

            {/* Template Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {language === 'fr' ? 'Fonctionnalités' : 'Features'}
                </h4>
                {schoolTemplateData?.data && (
                  <div className="space-y-2">
                    {(previewType === 'bulletin' ? 
                      schoolTemplateData.data.bulletinTemplate.features : 
                      schoolTemplateData.data.transcriptTemplate.features
                    ).map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Stamp className="w-4 h-4" />
                  {language === 'fr' ? 'Sécurité' : 'Security'}
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {language === 'fr' ? 'QR Code unique' : 'Unique QR Code'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {language === 'fr' ? 'Hash cryptographique' : 'Cryptographic hash'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {language === 'fr' ? 'Signature digitale' : 'Digital signature'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* COMPLETE BULLETIN TEMPLATE PREVIEW */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-8">
              <div className="space-y-6">
                {/* Complete Bulletin Template */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl mx-auto">
                  {/* Header with School Branding */}
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                          <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-center flex-1 mx-6">
                          <h1 className="text-2xl font-bold mb-1">
                            {schoolTemplateData?.data?.schoolName || 'ÉCOLE PRIMAIRE EDUCAFRIC'}
                          </h1>
                          <p className="text-white/90 text-sm">Excellence • Innovation • Leadership</p>
                          <p className="text-white/80 text-xs mt-1">📍 République du Cameroun | 📞 +237 123 456 789</p>
                        </div>
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded border-2 border-dashed border-white/50 flex items-center justify-center">
                          <div className="text-center">
                            <span className="text-xs block">QR</span>
                            <span className="text-[8px] block">🔐</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full">
                          <h2 className="text-lg font-bold">
                            📋 {previewType === 'bulletin' ? 
                              (language === 'fr' ? 'BULLETIN SCOLAIRE' : 'SCHOOL BULLETIN') :
                              (language === 'fr' ? 'RELEVÉ DE NOTES OFFICIEL' : 'OFFICIAL TRANSCRIPT')
                            }
                          </h2>
                          <p className="text-white/90 text-sm">1er Trimestre 2024-2025</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Student Information */}
                  <div className="p-6 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">👩‍🎓 KOUAME Marie Célestine</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><span className="font-semibold">🎯 Classe:</span> 6ème A</div>
                          <div><span className="font-semibold">🎂 Âge:</span> 12 ans</div>
                          <div><span className="font-semibold">📅 Né(e) le:</span> 15 Mars 2012</div>
                          <div><span className="font-semibold">🏫 Matricule:</span> ESJ-2024-001</div>
                        </div>
                      </div>
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-800 dark:to-indigo-900 rounded-lg flex items-center justify-center border-4 border-emerald-500">
                        <span className="text-2xl">👩‍🎓</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Summary Cards */}
                  <div className="p-6">
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-4 text-center border border-green-200 dark:border-green-700">
                        <div className="text-2xl mb-1">📊</div>
                        <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">14.5/20</div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Moyenne Générale</div>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg p-4 text-center border border-yellow-200 dark:border-yellow-700">
                        <div className="text-2xl mb-1">🏆</div>
                        <div className="text-lg font-bold text-orange-700 dark:text-orange-300">8ème/32</div>
                        <div className="text-xs text-orange-600 dark:text-orange-400 uppercase tracking-wide">Rang en Classe</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-700">
                        <div className="text-2xl mb-1">⚡</div>
                        <div className="text-lg font-bold text-blue-700 dark:text-blue-300">16/20</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide">Conduite</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-4 text-center border border-purple-200 dark:border-purple-700">
                        <div className="text-2xl mb-1">📅</div>
                        <div className="text-lg font-bold text-purple-700 dark:text-purple-300">2 jours</div>
                        <div className="text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wide">Absences</div>
                      </div>
                    </div>

                    {/* Grades Table Preview */}
                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-emerald-600" />
                        📚 NOTES PAR MATIÈRE
                      </h4>
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-600 overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Matière</th>
                              <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Note/20</th>
                              <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Coeff</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Professeur</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-4 py-3 font-semibold">Mathématiques</td>
                              <td className="px-4 py-3 text-center font-bold text-blue-600">15.0</td>
                              <td className="px-4 py-3 text-center">4</td>
                              <td className="px-4 py-3">M. KOUAME Paul</td>
                            </tr>
                            <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-4 py-3 font-semibold">Français</td>
                              <td className="px-4 py-3 text-center font-bold text-yellow-600">13.0</td>
                              <td className="px-4 py-3 text-center">4</td>
                              <td className="px-4 py-3">Mme DIALLO Aïcha</td>
                            </tr>
                            <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-4 py-3 font-semibold">Sciences</td>
                              <td className="px-4 py-3 text-center font-bold text-green-600">16.5</td>
                              <td className="px-4 py-3 text-center">3</td>
                              <td className="px-4 py-3">Dr. NGOZI Emmanuel</td>
                            </tr>
                            <tr className="bg-emerald-50 dark:bg-emerald-900/20 font-semibold">
                              <td className="px-4 py-3">TOTAL</td>
                              <td className="px-4 py-3 text-center font-bold text-emerald-700 dark:text-emerald-300">14.5</td>
                              <td className="px-4 py-3 text-center">20</td>
                              <td className="px-4 py-3 text-emerald-700 dark:text-emerald-300">Moyenne Générale</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Comments Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <h5 className="font-semibold text-blue-800 dark:text-blue-300">👨‍🏫 Professeur Principal</h5>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                          "Marie est une élève sérieuse qui montre de bonnes capacités. Excellents résultats en sciences..."
                        </p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                        <div className="flex items-center gap-2 mb-2">
                          <GraduationCap className="w-4 h-4 text-green-600" />
                          <h5 className="font-semibold text-green-800 dark:text-green-300">🎓 Directeur</h5>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                          "Résultats satisfaisants. Marie fait preuve de discipline et de régularité..."
                        </p>
                      </div>
                    </div>

                    {/* Signatures Section */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">👨‍🏫 PROFESSEUR</div>
                        <div className="h-8 border-t border-gray-400 mt-6"></div>
                        <div className="text-xs text-gray-500 mt-1">M. KOUAME Paul</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">🎓 DIRECTEUR</div>
                        <div className="h-8 border-t border-gray-400 mt-6"></div>
                        <div className="text-xs text-gray-500 mt-1">Dr. MENDOMO Gabriel</div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-center border-2 border-blue-300 dark:border-blue-600">
                        <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">🔍 QR AUTHENTIFICATION</div>
                        <div className="w-12 h-12 mx-auto bg-white border-2 border-blue-400 rounded flex items-center justify-center text-xs text-blue-600">
                          QR<br/>🔐
                        </div>
                        <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 font-mono">EDU-2024-001</div>
                      </div>
                    </div>

                    {/* Security Features */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700">
                      <div className="flex items-center justify-center gap-8 text-xs">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-emerald-700 dark:text-emerald-300 font-medium">✅ Signature digitale</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Stamp className="w-3 h-3 text-blue-500" />
                          <span className="text-emerald-700 dark:text-emerald-300 font-medium">🔵 Cachet école</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Languages className="w-3 h-3 text-purple-500" />
                          <span className="text-emerald-700 dark:text-emerald-300 font-medium">🟣 Support FR/EN</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-orange-500" />
                          <span className="text-emerald-700 dark:text-emerald-300 font-medium">🟠 Anti-falsification</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Brand */}
                  <div className="bg-emerald-600 text-white p-3 text-center">
                    <div className="text-xs">
                      📱 <strong>EDUCAFRIC Platform</strong> - Technologie Éducative Africaine<br/>
                      🌐 www.educafric.com | 📧 support@educafric.com | 📞 +237 657 004 011
                    </div>
                    <div className="text-[10px] opacity-80 mt-1">
                      ✅ Document authentifié électroniquement • 🔒 Sécurisé par QR Code • 📅 Généré le {new Date().toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mb-2">
                    {language === 'fr' 
                      ? '👆 APERÇU COMPLET DU BULLETIN DE VOTRE ÉCOLE'
                      : '👆 COMPLETE PREVIEW OF YOUR SCHOOL BULLETIN'
                    }
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {language === 'fr' 
                      ? 'Template personnalisé avec vos couleurs, logo et informations école • Format professionnel sécurisé'
                      : 'Customized template with your colors, logo and school information • Secure professional format'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowTemplatePreview(false)} className="flex-1">
                <XCircle className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Fermer' : 'Close'}
              </Button>
              <Button 
                variant="outline"
                className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-400"
                onClick={() => {
                  const url = '/api/bulletins/template-preview/pdf';
                  window.open(url, '_blank');
                  toast({
                    title: language === 'fr' ? '📋 Document 12 PDF' : '📋 Document 12 PDF',
                    description: language === 'fr' 
                      ? 'Téléchargement du template PDF complet format Document 12'
                      : 'Downloading complete PDF template in Document 12 format'
                  });
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'PDF Complet' : 'Full PDF'}
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={() => {
                  toast({
                    title: language === 'fr' ? '✅ Template Validé' : '✅ Template Validated',
                    description: language === 'fr' 
                      ? 'Le template de votre école est prêt pour la génération de documents'
                      : 'Your school template is ready for document generation'
                  });
                  setShowTemplatePreview(false);
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Valider' : 'Validate'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BulletinApprovalNew;
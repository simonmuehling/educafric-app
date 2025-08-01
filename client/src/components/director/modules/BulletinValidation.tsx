import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Send, 
  Eye, 
  FileText, 
  Search,
  Filter,
  AlertCircle,
  Calendar,
  User,
  BookOpen,
  Star,
  MessageSquare,
  ArrowRight,
  Check,
  X,
  TrendingUp,
  Mail
} from 'lucide-react';
import MobileActionsOverlay from '@/components/mobile/MobileActionsOverlay';

interface BulletinItem {
  id: number;
  studentId: number;
  studentName: string;
  classId: number;
  className: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'sent';
  generalAverage: number;
  classRank: number;
  totalStudentsInClass: number;
  submittedBy: number;
  submittedAt?: string;
  submissionComment?: string;
  approvedBy?: number;
  approvedAt?: string;
  approvalComment?: string;
  rejectedBy?: number;
  rejectedAt?: string;
  rejectionComment?: string;
  sentBy?: number;
  sentAt?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  teacherName?: string;
}

interface BulletinGrade {
  id: number;
  subjectId: number;
  subjectName: string;
  grade: number;
  coefficient: number;
  points: number;
  teacherId: number;
  teacherName: string;
  teacherComment?: string;
  status: string;
}

interface BulletinDetails extends BulletinItem {
  grades: BulletinGrade[];
}

const BulletinValidation: React.FC = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'sent'>('pending');
  const [bulletins, setBulletins] = useState<BulletinItem[]>([]);
  const [selectedBulletin, setSelectedBulletin] = useState<BulletinDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'send' | null>(null);
  const [actionComment, setActionComment] = useState('');

  const t = {
    fr: {
      title: 'Validation des Bulletins',
      subtitle: 'Processus de validation et distribution des bulletins scolaires',
      pending: 'En Attente',
      approved: 'Approuvés',
      rejected: 'Rejetés',
      sent: 'Envoyés',
      search: 'Rechercher un bulletin...',
      filter: 'Filtrer',
      studentName: 'Nom de l\'élève',
      class: 'Classe',
      average: 'Moyenne',
      rank: 'Rang',
      submittedBy: 'Soumis par',
      submittedAt: 'Date de soumission',
      trackingNumber: 'N° de suivi',
      viewDetails: 'Voir Détails',
      approve: 'Approuver',
      reject: 'Rejeter',
      send: 'Envoyer aux Parents',
      comment: 'Commentaire',
      approvalComment: 'Commentaire d\'approbation',
      rejectionComment: 'Commentaire de rejet',
      submitComment: 'Commenter...',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      bulletinDetails: 'Détails du Bulletin',
      grades: 'Notes',
      subject: 'Matière',
      grade: 'Note',
      coefficient: 'Coeff.',
      teacher: 'Enseignant',
      teacherComment: 'Commentaire',
      generalInfo: 'Informations Générales',
      validationHistory: 'Historique de Validation',
      submissionComment: 'Commentaire de soumission',
      validationActions: 'Actions de Validation',
      backToList: 'Retour à la Liste',
      processing: 'Traitement en cours...',
      success: 'Opération réussie',
      error: 'Erreur lors de l\'opération',
      confirmApproval: 'Confirmer l\'approbation de ce bulletin ?',
      confirmRejection: 'Confirmer le rejet de ce bulletin ?',
      confirmSend: 'Confirmer l\'envoi de ce bulletin aux parents ?',
      approveAction: 'Approuver le Bulletin',
      rejectAction: 'Rejeter le Bulletin',
      sendAction: 'Envoyer aux Parents',
      noData: 'Aucun bulletin trouvé',
      totalStudents: 'Total élèves',
      bulletinApproved: 'Bulletin approuvé avec succès',
      bulletinRejected: 'Bulletin rejeté avec succès',
      bulletinSent: 'Bulletin envoyé aux parents avec succès'
    },
    en: {
      title: 'Bulletin Validation',
      subtitle: 'School bulletin validation and distribution process',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      sent: 'Sent',
      search: 'Search bulletin...',
      filter: 'Filter',
      studentName: 'Student Name',
      class: 'Class',
      average: 'Average',
      rank: 'Rank',
      submittedBy: 'Submitted by',
      submittedAt: 'Submission Date',
      trackingNumber: 'Tracking Number',
      viewDetails: 'View Details',
      approve: 'Approve',
      reject: 'Reject',
      send: 'Send to Parents',
      comment: 'Comment',
      approvalComment: 'Approval comment',
      rejectionComment: 'Rejection comment',
      submitComment: 'Add comment...',
      cancel: 'Cancel',
      confirm: 'Confirm',
      bulletinDetails: 'Bulletin Details',
      grades: 'Grades',
      subject: 'Subject',
      grade: 'Grade',
      coefficient: 'Coeff.',
      teacher: 'Teacher',
      teacherComment: 'Comment',
      generalInfo: 'General Information',
      validationHistory: 'Validation History',
      submissionComment: 'Submission comment',
      validationActions: 'Validation Actions',
      backToList: 'Back to List',
      processing: 'Processing...',
      success: 'Operation successful',
      error: 'Operation error',
      confirmApproval: 'Confirm approval of this bulletin?',
      confirmRejection: 'Confirm rejection of this bulletin?',
      confirmSend: 'Confirm sending this bulletin to parents?',
      approveAction: 'Approve Bulletin',
      rejectAction: 'Reject Bulletin',
      sendAction: 'Send to Parents',
      noData: 'No bulletins found',
      totalStudents: 'Total students',
      bulletinApproved: 'Bulletin approved successfully',
      bulletinRejected: 'Bulletin rejected successfully',
      bulletinSent: 'Bulletin sent to parents successfully'
    }
  };

  const text = t[language];

  // Fetch bulletins by status
  const fetchBulletins = async (status: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/bulletins/status/${status}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setBulletins(data);
      } else {
        console.error('Error fetching bulletins:', response.statusText);
        setBulletins([]);
      }
    } catch (error) {
      console.error('Error fetching bulletins:', error);
      setBulletins([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bulletin details
  const fetchBulletinDetails = async (bulletinId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/bulletins/${bulletinId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedBulletin(data);
      } else {
        console.error('Error fetching bulletin details:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching bulletin details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle bulletin action (approve/reject/send)
  const handleBulletinAction = async (bulletinId: number, action: 'approve' | 'reject' | 'send', comment?: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/bulletins/${bulletinId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          [`${action}Comment`]: comment || `${action} par le directeur`,
          [`${action}alComment`]: comment || `${action} par le directeur`
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`[BULLETIN_VALIDATION] ✅ ${action} successful:`, result);
        
        // Refresh data
        await fetchBulletins(activeTab);
        if (selectedBulletin) {
          await fetchBulletinDetails(selectedBulletin.id);
        }
        
        setActionModalOpen(false);
        setActionComment('');
        setActionType(null);
        
        // Show success message
        alert(text[`bulletin${action.charAt(0).toUpperCase() + action.slice(1)}ed` as keyof typeof text]);
      } else {
        console.error(`Error ${action}ing bulletin:`, response.statusText);
        alert(text.error);
      }
    } catch (error) {
      console.error(`Error ${action}ing bulletin:`, error);
      alert(text.error);
    } finally {
      setLoading(false);
    }
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case 'pending':
          return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: text.pending };
        case 'approved':
          return { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: text.approved };
        case 'rejected':
          return { color: 'bg-red-100 text-red-800', icon: XCircle, text: text.rejected };
        case 'sent':
          return { color: 'bg-blue-100 text-blue-800', icon: Send, text: text.sent };
        default:
          return { color: 'bg-gray-100 text-gray-800', icon: Clock, text: status };
      }
    };

    const config = getStatusConfig(status);
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  // Load data when tab changes
  useEffect(() => {
    fetchBulletins(activeTab);
  }, [activeTab]);

  // Filter bulletins based on search term
  const filteredBulletins = (Array.isArray(bulletins) ? bulletins : []).filter(bulletin =>
    bulletin?.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bulletin?.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bulletin.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedBulletin) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-blue-600" />
              {text.bulletinDetails}
            </h2>
            <p className="text-gray-600 mt-1">
              {selectedBulletin.studentName} - {selectedBulletin.className}
            </p>
          </div>
          <Button
            onClick={() => setSelectedBulletin(null)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            {text.backToList}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* General Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {text.generalInfo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">{text.studentName}</label>
                  <p className="text-lg font-semibold">{selectedBulletin.studentName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">{text.class}</label>
                  <p className="text-lg font-semibold">{selectedBulletin.className}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">{text.average}</label>
                  <p className="text-2xl font-bold text-blue-600">{selectedBulletin.generalAverage}/20</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">{text.rank}</label>
                  <p className="text-lg font-semibold">
                    {selectedBulletin.classRank}/{selectedBulletin.totalStudentsInClass}
                  </p>
                </div>
              </div>
              
              {selectedBulletin.trackingNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-600">{text.trackingNumber}</label>
                  <p className="text-lg font-mono bg-gray-100 p-2 rounded">
                    {selectedBulletin.trackingNumber}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600">Statut</label>
                <div className="mt-1">
                  <StatusBadge status={selectedBulletin.status} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {text.validationActions}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedBulletin.status === 'pending' && (
                <>
                  <Button
                    onClick={() => {
                      setActionType('approve');
                      setActionModalOpen(true);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {text.approve}
                  </Button>
                  <Button
                    onClick={() => {
                      setActionType('reject');
                      setActionModalOpen(true);
                    }}
                    variant="destructive"
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    {text.reject}
                  </Button>
                </>
              )}
              
              {selectedBulletin.status === 'approved' && (
                <Button
                  onClick={() => {
                    setActionType('send');
                    setActionModalOpen(true);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {text.send}
                </Button>
              )}

              {selectedBulletin.status === 'sent' && (
                <div className="text-center text-green-600 font-medium">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  Bulletin envoyé avec succès
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Grades Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {text.grades}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">{text.subject}</th>
                    <th className="text-center p-2">{text.grade}</th>
                    <th className="text-center p-2">{text.coefficient}</th>
                    <th className="text-center p-2">Points</th>
                    <th className="text-left p-2">{text.teacher}</th>
                    <th className="text-left p-2">{text.teacherComment}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBulletin.grades?.map((grade) => (
                    <tr key={grade.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{grade.subjectName}</td>
                      <td className="text-center p-2">
                        <span className={`font-bold ${(grade.grade >= 10) ? 'text-green-600' : 'text-red-600'}`}>
                          {grade.grade}/20
                        </span>
                      </td>
                      <td className="text-center p-2">{grade.coefficient}</td>
                      <td className="text-center p-2">{grade.points}</td>
                      <td className="p-2">{grade.teacherName}</td>
                      <td className="p-2 text-sm text-gray-600">{grade.teacherComment || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Action Modal */}
        {actionModalOpen && actionType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                {actionType === 'approve' && text.approveAction}
                {actionType === 'reject' && text.rejectAction}
                {actionType === 'send' && text.sendAction}
              </h3>
              <p className="text-gray-600 mb-4">
                {actionType === 'approve' && text.confirmApproval}
                {actionType === 'reject' && text.confirmRejection}
                {actionType === 'send' && text.confirmSend}
              </p>
              <Textarea
                placeholder={text.submitComment}
                value={actionComment}
                onChange={(e) => setActionComment(e?.target?.value)}
                className="mb-4"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setActionModalOpen(false);
                    setActionComment('');
                    setActionType(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  {text.cancel}
                </Button>
                <Button
                  onClick={() => handleBulletinAction(selectedBulletin.id, actionType, actionComment)}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? text.processing : text.confirm}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <CheckCircle className="w-6 h-6 mr-3 text-blue-600" />
          {text.title || ''}
        </h2>
        <p className="text-gray-600 mt-1">{text.subtitle}</p>
      </div>

      {/* Quick Actions - Mobile Optimized */}
      <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          {language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
        </h3>
        <MobileActionsOverlay
          title={language === 'fr' ? 'Actions Validation' : 'Validation Actions'}
          maxVisibleButtons={3}
          actions={[
            {
              id: 'view-pending',
              label: language === 'fr' ? 'En Attente' : 'Pending',
              icon: <Clock className="w-5 h-5" />,
              onClick: () => setActiveTab('pending'),
              color: 'bg-yellow-600 hover:bg-yellow-700'
            },
            {
              id: 'view-approved',
              label: language === 'fr' ? 'Approuvés' : 'Approved',
              icon: <Check className="w-5 h-5" />,
              onClick: () => setActiveTab('approved'),
              color: 'bg-green-600 hover:bg-green-700'
            },
            {
              id: 'view-sent',
              label: language === 'fr' ? 'Envoyés' : 'Sent',
              icon: <Send className="w-5 h-5" />,
              onClick: () => setActiveTab('sent'),
              color: 'bg-blue-600 hover:bg-blue-700'
            },
            {
              id: 'view-rejected',
              label: language === 'fr' ? 'Rejetés' : 'Rejected',
              icon: <XCircle className="w-5 h-5" />,
              onClick: () => setActiveTab('rejected'),
              color: 'bg-red-600 hover:bg-red-700'
            },
            {
              id: 'export-report',
              label: language === 'fr' ? 'Rapport PDF' : 'PDF Report',
              icon: <FileText className="w-5 h-5" />,
              onClick: () => console.log('Export bulletin report'),
              color: 'bg-purple-600 hover:bg-purple-700'
            }
          ]}
        />
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'pending', label: text.pending, icon: Clock, color: 'text-yellow-600' },
            { key: 'approved', label: text.approved, icon: CheckCircle, color: 'text-green-600' },
            { key: 'rejected', label: text.rejected, icon: XCircle, color: 'text-red-600' },
            { key: 'sent', label: text.sent, icon: Send, color: 'text-blue-600' }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.key
                    ? `border-blue-500 ${tab.color}`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={text.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          {text.filter}
        </Button>
      </div>

      {/* Bulletins List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">{text.processing}</span>
            </div>
          ) : (Array.isArray(filteredBulletins) ? filteredBulletins.length : 0) === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{text.noData}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4">{text.studentName}</th>
                    <th className="text-left p-4">{text.class}</th>
                    <th className="text-center p-4">{text.average}</th>
                    <th className="text-center p-4">{text.rank}</th>
                    <th className="text-left p-4">{text.submittedAt}</th>
                    <th className="text-left p-4">{text.trackingNumber}</th>
                    <th className="text-center p-4">Statut</th>
                    <th className="text-center p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(filteredBulletins) ? filteredBulletins : []).map((bulletin) => (
                    <tr key={bulletin.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium">{bulletin.studentName}</div>
                      </td>
                      <td className="p-4">{bulletin.className}</td>
                      <td className="text-center p-4">
                        <span className={`font-bold ${(bulletin.generalAverage >= 10) ? 'text-green-600' : 'text-red-600'}`}>
                          {bulletin.generalAverage}/20
                        </span>
                      </td>
                      <td className="text-center p-4">
                        {bulletin.classRank}/{bulletin.totalStudentsInClass}
                      </td>
                      <td className="p-4">
                        {bulletin.submittedAt ? new Date(bulletin.submittedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {bulletin.trackingNumber || '-'}
                        </span>
                      </td>
                      <td className="text-center p-4">
                        <StatusBadge status={bulletin.status} />
                      </td>
                      <td className="text-center p-4">
                        <Button
                          onClick={() => fetchBulletinDetails(bulletin.id)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          {text.viewDetails}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BulletinValidation;
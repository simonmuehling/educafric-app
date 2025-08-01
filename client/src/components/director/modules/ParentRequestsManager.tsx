import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Clock, CheckCircle, X, AlertTriangle, User, FileText, TrendingUp, Send, Eye } from 'lucide-react';
import MobileActionsOverlay from '@/components/mobile/MobileActionsOverlay';

const ParentRequestsManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [responseText, setResponseText] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Mock data for demonstration
  const requestStats = {
    total: 47,
    pending: 12,
    resolved: 32,
    urgent: 3
  };

  const parentRequests = [
    {
      id: 1,
      parentName: 'Marie Kamga',
      studentName: 'Junior Kamga',
      class: '3ème A',
      category: 'Academic',
      subject: 'Demande de rattrapage en mathématiques',
      message: 'Bonjour, mon fils Junior a des difficultés en mathématiques. Pourriez-vous organiser des cours de rattrapage?',
      status: 'pending',
      priority: 'normal',
      date: '2025-01-29',
      time: '09:30',
      email: 'marie.kamga@gmail.com',
      phone: '+237654321987'
    },
    {
      id: 2,
      parentName: 'Paul Essomba',
      studentName: 'Grace Essomba',
      class: 'CE2 B',
      category: 'Administrative',
      subject: 'Certificat de scolarité',
      message: 'Je demande un certificat de scolarité pour ma fille Grace pour un dossier administratif.',
      status: 'resolved',
      priority: 'normal',
      date: '2025-01-28',
      time: '14:15',
      email: 'paul.essomba@yahoo.com',
      phone: '+237658741269'
    },
    {
      id: 3,
      parentName: 'Françoise Nkomo',
      studentName: 'Emmanuel Nkomo',
      class: 'Terminale C',
      category: 'Behavioral',
      subject: 'Problème comportemental urgent',
      message: 'Mon fils Emmanuel a eu des altercations avec ses camarades. J\'aimerais discuter avec vous rapidement.',
      status: 'pending',
      priority: 'urgent',
      date: '2025-01-29',
      time: '11:45',
      email: 'francoise.nkomo@hotmail.com',
      phone: '+237677123456'
    },
    {
      id: 4,
      parentName: 'Jean-Baptiste Mvondo',
      studentName: 'Sarah Mvondo',
      class: '6ème A',
      category: 'Health',
      subject: 'Allergie alimentaire',
      message: 'Ma fille Sarah est allergique aux arachides. Merci de bien vouloir en informer la cantine.',
      status: 'resolved',
      priority: 'normal',
      date: '2025-01-27',
      time: '16:20',
      email: 'jb.mvondo@educafric.com',
      phone: '+237691456789'
    }
  ];

  const filteredRequests = (Array.isArray(parentRequests) ? parentRequests : []).filter(request => {
    if (!request) return false;
    const matchesSearch = request?.parentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request?.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request?.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || request?.category?.toLowerCase() === selectedCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleApprove = (requestId: number) => {
    toast({
      title: language === 'fr' ? 'Demande approuvée' : 'Request approved',
      description: language === 'fr' ? 'La demande a été approuvée avec succès.' : 'The request has been approved successfully.'
    });
  };

  const handleReject = (requestId: number) => {
    toast({
      title: language === 'fr' ? 'Demande rejetée' : 'Request rejected',
      description: language === 'fr' ? 'La demande a été rejetée.' : 'The request has been rejected.'
    });
  };

  const handleSendResponse = () => {
    if (!responseText.trim()) return;
    
    toast({
      title: language === 'fr' ? 'Réponse envoyée' : 'Response sent',
      description: language === 'fr' ? 'Votre réponse a été envoyée au parent.' : 'Your response has been sent to the parent.'
    });
    setShowResponseModal(false);
    setResponseText('');
    setSelectedRequest(null);
  };

  const handleMarkUrgent = (requestId: number) => {
    toast({
      title: language === 'fr' ? 'Marqué urgent' : 'Marked urgent',
      description: language === 'fr' ? 'La demande a été marquée comme urgente.' : 'The request has been marked as urgent.'
    });
  };

  const handleBulkAction = (action: string) => {
    toast({
      title: language === 'fr' ? 'Action groupée' : 'Bulk action',
      description: language === 'fr' ? `Action "${action}" appliquée aux demandes sélectionnées.` : `Action "${action}" applied to selected requests.`
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {language === 'fr' ? 'Gestion des Demandes Parents' : 'Parent Requests Management'}
        </h1>
        <Badge variant="outline" className="text-sm">
          {(Array.isArray(filteredRequests) ? filteredRequests.length : 0)} {language === 'fr' ? 'demandes' : 'requests'}
        </Badge>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{language === 'fr' ? 'Total' : 'Total'}</p>
                <p className="text-2xl font-bold text-blue-600">{requestStats.total}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{language === 'fr' ? 'En attente' : 'Pending'}</p>
                <p className="text-2xl font-bold text-orange-600">{requestStats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{language === 'fr' ? 'Résolues' : 'Resolved'}</p>
                <p className="text-2xl font-bold text-green-600">{requestStats.resolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{language === 'fr' ? 'Urgentes' : 'Urgent'}</p>
                <p className="text-2xl font-bold text-red-600">{requestStats.urgent}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Mobile Optimized */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            {language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MobileActionsOverlay
            title={language === 'fr' ? 'Actions Demandes Parents' : 'Parent Request Actions'}
            maxVisibleButtons={3}
            actions={[
              {
                id: 'approve-all',
                label: language === 'fr' ? 'Approuver Toutes' : 'Approve All',
                icon: <CheckCircle className="w-5 h-5" />,
                onClick: () => handleBulkAction('approve'),
                color: 'bg-blue-600 hover:bg-blue-700'
              },
              {
                id: 'auto-response',
                label: language === 'fr' ? 'Réponse Auto' : 'Auto Response',
                icon: <Send className="w-5 h-5" />,
                onClick: () => handleBulkAction('response'),
                color: 'bg-green-600 hover:bg-green-700'
              },
              {
                id: 'mark-urgent',
                label: language === 'fr' ? 'Marquer Urgent' : 'Mark Urgent',
                icon: <AlertTriangle className="w-5 h-5" />,
                onClick: () => handleBulkAction('priority'),
                color: 'bg-orange-600 hover:bg-orange-700'
              },
              {
                id: 'export-report',
                label: language === 'fr' ? 'Exporter Rapport' : 'Export Report',
                icon: <FileText className="w-5 h-5" />,
                onClick: () => handleBulkAction('export'),
                color: 'bg-purple-600 hover:bg-purple-700'
              }
            ]}
          />
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder={language === 'fr' ? 'Rechercher par nom ou sujet...' : 'Search by name or subject...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="md:w-auto flex-1"
            />
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="md:w-auto">
                <SelectValue placeholder={language === 'fr' ? 'Statut' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'fr' ? 'Tous les statuts' : 'All statuses'}</SelectItem>
                <SelectItem value="pending">{language === 'fr' ? 'En attente' : 'Pending'}</SelectItem>
                <SelectItem value="resolved">{language === 'fr' ? 'Résolues' : 'Resolved'}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="md:w-auto">
                <SelectValue placeholder={language === 'fr' ? 'Catégorie' : 'Category'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'fr' ? 'Toutes catégories' : 'All categories'}</SelectItem>
                <SelectItem value="academic">{language === 'fr' ? 'Académique' : 'Academic'}</SelectItem>
                <SelectItem value="administrative">{language === 'fr' ? 'Administrative' : 'Administrative'}</SelectItem>
                <SelectItem value="behavioral">{language === 'fr' ? 'Comportemental' : 'Behavioral'}</SelectItem>
                <SelectItem value="health">{language === 'fr' ? 'Santé' : 'Health'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {(Array.isArray(filteredRequests) ? filteredRequests : []).map((request) => (
          <Card key={request.id} className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-semibold text-lg">{request.subject}</h3>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status === 'resolved' 
                        ? (language === 'fr' ? 'Résolue' : 'Resolved')
                        : (language === 'fr' ? 'En attente' : 'Pending')
                      }
                    </Badge>
                    {request.priority === 'urgent' && (
                      <Badge className={getPriorityColor(request.priority)}>
                        {language === 'fr' ? 'URGENT' : 'URGENT'}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        <strong>{language === 'fr' ? 'Parent' : 'Parent'}:</strong> {request.parentName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>{language === 'fr' ? 'Élève' : 'Student'}:</strong> {request.studentName} ({request.class})
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>{language === 'fr' ? 'Catégorie' : 'Category'}:</strong> {request.category}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <strong>{language === 'fr' ? 'Date' : 'Date'}:</strong> {request.date} à {request.time}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Email:</strong> {request.email || ''}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>{language === 'fr' ? 'Téléphone' : 'Phone'}:</strong> {request.phone}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-700">{request.message}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowResponseModal(true);
                    }}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    {language === 'fr' ? 'Répondre' : 'Respond'}
                  </Button>
                  
                  {request.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(request.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {language === 'fr' ? 'Approuver' : 'Approve'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(request.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        {language === 'fr' ? 'Rejeter' : 'Reject'}
                      </Button>
                    </>
                  )}
                  
                  {request.priority !== 'urgent' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkUrgent(request.id)}
                    >
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {language === 'fr' ? 'Urgent' : 'Urgent'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>
                {language === 'fr' ? 'Répondre à' : 'Respond to'} {selectedRequest.parentName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{selectedRequest.subject}</p>
                <p className="text-sm text-gray-600 mt-2">{selectedRequest.message}</p>
              </div>
              
              <Textarea
                placeholder={language === 'fr' ? 'Tapez votre réponse ici...' : 'Type your response here...'}
                value={responseText}
                onChange={(e) => setResponseText(e?.target?.value)}
                rows={6}
              />
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResponseModal(false);
                    setResponseText('');
                    setSelectedRequest(null);
                  }}
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </Button>
                <Button onClick={handleSendResponse}>
                  <Send className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Envoyer' : 'Send'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ParentRequestsManager;
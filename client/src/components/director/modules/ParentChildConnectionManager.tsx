import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard, ModernStatsCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  FileText, 
  Eye, 
  Send, 
  UserPlus,
  Shield,
  Search,
  Phone,
  Mail,
  Calendar,
  School
} from 'lucide-react';

// Types for parent-child connection requests
interface ParentChildRequest {
  id: number;
  requestType: 'parent_to_child' | 'child_to_parent';
  parentName: string;
  parentEmail?: string;
  parentPhone?: string;
  childFirstName: string;
  childLastName: string;
  childClass?: string;
  relationshipType: 'parent' | 'guardian' | 'emergency_contact';
  status: 'pending' | 'approved' | 'rejected' | 'verified';
  requestDate: string;
  verificationDocuments?: string[];
  reason?: string;
  schoolVerificationRequired: boolean;
  contactMethod: 'email' | 'phone';
}

const ParentChildConnectionManager: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedRequest, setSelectedRequest] = useState<ParentChildRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject' | 'verify'>('verify');

  // Translations
  const text = {
    fr: {
      title: 'Gestion Connexions Parents-Élèves',
      subtitle: 'Validation et gestion des demandes de connexion familiale',
      pendingRequests: 'Demandes en Attente',
      approvedToday: 'Approuvées Aujourd\'hui',
      rejectedToday: 'Refusées Aujourd\'hui',
      totalConnections: 'Connexions Totales',
      requestDetails: 'Détails de la Demande',
      verificationRequired: 'Vérification Requise',
      parentInfo: 'Informations Parent',
      childInfo: 'Informations Élève',
      contactMethod: 'Méthode de Contact',
      relationshipType: 'Type de Relation',
      requestDate: 'Date de Demande',
      status: 'Statut',
      reason: 'Raison',
      documents: 'Documents Fournis',
      verificationNotes: 'Notes de Vérification',
      approve: 'Approuver',
      reject: 'Rejeter',
      verify: 'Vérifier',
      viewDetails: 'Voir Détails',
      close: 'Fermer',
      save: 'Enregistrer',
      pending: 'En Attente',
      approved: 'Approuvée',
      rejected: 'Refusée',
      verified: 'Vérifiée',
      parent: 'Parent',
      guardian: 'Tuteur',
      emergency_contact: 'Contact d\'Urgence',
      email: 'Email',
      phone: 'Téléphone',
      parent_to_child: 'Parent → Enfant',
      child_to_parent: 'Enfant → Parent',
      noRequests: 'Aucune demande en attente',
      noRequestsDesc: 'Toutes les demandes de connexion ont été traitées',
      verificationSuccess: 'Demande vérifiée avec succès',
      approvalSuccess: 'Connexion approuvée avec succès',
      rejectionSuccess: 'Demande rejetée',
      actionRequired: 'Action Requise',
      urgent: 'Urgent',
      normal: 'Normal'
    },
    en: {
      title: 'Parent-Child Connection Management',
      subtitle: 'Validation and management of family connection requests',
      pendingRequests: 'Pending Requests',
      approvedToday: 'Approved Today',
      rejectedToday: 'Rejected Today',
      totalConnections: 'Total Connections',
      requestDetails: 'Request Details',
      verificationRequired: 'Verification Required',
      parentInfo: 'Parent Information',
      childInfo: 'Child Information',
      contactMethod: 'Contact Method',
      relationshipType: 'Relationship Type',
      requestDate: 'Request Date',
      status: 'Status',
      reason: 'Reason',
      documents: 'Provided Documents',
      verificationNotes: 'Verification Notes',
      approve: 'Approve',
      reject: 'Reject',
      verify: 'Verify',
      viewDetails: 'View Details',
      close: 'Close',
      save: 'Save',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      verified: 'Verified',
      parent: 'Parent',
      guardian: 'Guardian',
      emergency_contact: 'Emergency Contact',
      email: 'Email',
      phone: 'Phone',
      parent_to_child: 'Parent → Child',
      child_to_parent: 'Child → Parent',
      noRequests: 'No pending requests',
      noRequestsDesc: 'All connection requests have been processed',
      verificationSuccess: 'Request verified successfully',
      approvalSuccess: 'Connection approved successfully',
      rejectionSuccess: 'Request rejected',
      actionRequired: 'Action Required',
      urgent: 'Urgent',
      normal: 'Normal'
    }
  };

  const t = text[language];

  // Mock data - Replace with real API calls
  const mockStats = {
    pending: 8,
    approvedToday: 12,
    rejectedToday: 2,
    totalConnections: 156
  };

  const mockRequests: ParentChildRequest[] = [
    {
      id: 1,
      requestType: 'parent_to_child',
      parentName: 'Marie Kamdem',
      parentEmail: 'marie.kamdem@gmail.com',
      parentPhone: '+237657004011',
      childFirstName: 'Jean',
      childLastName: 'Kamdem', 
      childClass: 'CM2 A',
      relationshipType: 'parent',
      status: 'pending',
      requestDate: '2025-01-13T10:30:00Z',
      reason: 'Je suis la mère de Jean Kamdem, élève en CM2 A. Je souhaite me connecter pour suivre sa scolarité.',
      schoolVerificationRequired: true,
      contactMethod: 'email',
      verificationDocuments: ['birth_certificate', 'id_card']
    },
    {
      id: 2,
      requestType: 'child_to_parent',
      parentName: 'Paul Essomba',
      parentEmail: 'paul.essomba@yahoo.com',
      childFirstName: 'Grace',
      childLastName: 'Essomba',
      childClass: '6ème B',
      relationshipType: 'guardian',
      status: 'pending',
      requestDate: '2025-01-13T14:15:00Z',
      reason: 'Demande de connexion avec mon tuteur Paul Essomba.',
      schoolVerificationRequired: true,
      contactMethod: 'email'
    },
    {
      id: 3,
      requestType: 'parent_to_child',
      parentName: 'Françoise Nkomo',
      parentPhone: '+237698765432',
      childFirstName: 'Emmanuel',
      childLastName: 'Nkomo',
      childClass: 'Terminale C',
      relationshipType: 'parent',
      status: 'pending',
      requestDate: '2025-01-13T16:45:00Z',
      reason: 'Connexion urgente pour suivi scolaire de mon fils Emmanuel.',
      schoolVerificationRequired: true,
      contactMethod: 'phone'
    }
  ];

  // Query for connection requests
  const { data: requests = mockRequests, isLoading } = useQuery({
    queryKey: ['/api/director/parent-child-requests'],
    enabled: false // Disable for now, using mock data
  });

  // Mutation for processing requests
  const processRequestMutation = useMutation({
    mutationFn: async ({ requestId, action, notes }: { 
      requestId: number; 
      action: 'approve' | 'reject' | 'verify'; 
      notes?: string 
    }) => {
      return apiRequest(`/api/director/parent-child-requests/${requestId}/${action}`, 'POST', { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/director/parent-child-requests'] });
      setShowDetailsDialog(false);
      setShowVerificationDialog(false);
      setVerificationNotes('');
      
      const successMessage = currentAction === 'approve' ? t.approvalSuccess :
                            currentAction === 'reject' ? t.rejectionSuccess :
                            t.verificationSuccess;
      
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: successMessage,
      });
    },
    onError: (error) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: `Failed to process request: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const handleProcessRequest = (action: 'approve' | 'reject' | 'verify') => {
    if (!selectedRequest) return;
    
    setCurrentAction(action);
    if (action === 'verify') {
      setShowVerificationDialog(true);
    } else {
      processRequestMutation.mutate({
        requestId: selectedRequest.id,
        action,
        notes: verificationNotes
      });
    }
  };

  const handleVerificationSubmit = () => {
    if (!selectedRequest) return;
    
    processRequestMutation.mutate({
      requestId: selectedRequest.id,
      action: currentAction,
      notes: verificationNotes
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestTypeIcon = (type: string) => {
    return type === 'parent_to_child' ? <UserPlus className="w-4 h-4" /> : <Users className="w-4 h-4" />;
  };

  const getPriorityBadge = (request: ParentChildRequest) => {
    const isUrgent = request.schoolVerificationRequired && request.status === 'pending';
    return isUrgent ? (
      <Badge className="bg-orange-100 text-orange-800">
        <AlertTriangle className="w-3 h-3 mr-1" />
        {t.urgent}
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-600">
        {t.normal}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModernStatsCard
          title={t.pendingRequests}
          value={mockStats.pending}
          icon={<Clock className="w-8 h-8" />}
          trend={{ value: 12, isPositive: false }}
          color="yellow"
        />
        <ModernStatsCard
          title={t.approvedToday}
          value={mockStats.approvedToday}
          icon={<CheckCircle className="w-8 h-8" />}
          trend={{ value: 25, isPositive: true }}
          color="green"
        />
        <ModernStatsCard
          title={t.rejectedToday}
          value={mockStats.rejectedToday}
          icon={<XCircle className="w-8 h-8" />}
          trend={{ value: 8, isPositive: false }}
          color="red"
        />
        <ModernStatsCard
          title={t.totalConnections}
          value={mockStats.totalConnections}
          icon={<Users className="w-8 h-8" />}
          trend={{ value: 15, isPositive: true }}
          color="blue"
        />
      </div>

      {/* Requests List */}
      <ModernCard>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t.pendingRequests}</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noRequests}</h3>
              <p className="text-gray-500">{t.noRequestsDesc}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getRequestTypeIcon(request.requestType)}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {request.parentName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {t[request.requestType]} • {request.childFirstName} {request.childLastName}
                            {request.childClass && ` (${request.childClass})`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-3">
                        <Badge className={getStatusBadgeVariant(request.status)}>
                          {t[request.status]}
                        </Badge>
                        {getPriorityBadge(request)}
                        <span className="text-xs text-gray-500">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {new Date(request.requestDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          {request.contactMethod === 'email' ? <Mail className="w-4 h-4 mr-1" /> : <Phone className="w-4 h-4 mr-1" />}
                          {request.contactMethod === 'email' ? request.parentEmail : request.parentPhone}
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {t[request.relationshipType]}
                        </div>
                      </div>

                      {request.reason && (
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          {request.reason}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailsDialog(true);
                        }}
                        variant="outline"
                        size="sm"
                        data-testid={`button-view-details-${request.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {t.viewDetails}
                      </Button>
                      
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => {
                              setSelectedRequest(request);
                              handleProcessRequest('approve');
                            }}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            data-testid={`button-approve-${request.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {t.approve}
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedRequest(request);
                              handleProcessRequest('reject');
                            }}
                            size="sm"
                            variant="destructive"
                            data-testid={`button-reject-${request.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            {t.reject}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ModernCard>

      {/* Request Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.requestDetails}</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Parent Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t.parentInfo}</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{language === 'fr' ? 'Nom' : 'Name'}:</span>
                    <span className="font-medium">{selectedRequest.parentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.contactMethod}:</span>
                    <span className="font-medium">
                      {selectedRequest.contactMethod === 'email' ? selectedRequest.parentEmail : selectedRequest.parentPhone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.relationshipType}:</span>
                    <span className="font-medium">{t[selectedRequest.relationshipType]}</span>
                  </div>
                </div>
              </div>

              {/* Child Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t.childInfo}</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{language === 'fr' ? 'Nom complet' : 'Full Name'}:</span>
                    <span className="font-medium">{selectedRequest.childFirstName} {selectedRequest.childLastName}</span>
                  </div>
                  {selectedRequest.childClass && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{language === 'fr' ? 'Classe' : 'Class'}:</span>
                      <span className="font-medium">{selectedRequest.childClass}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Request Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{language === 'fr' ? 'Détails de la demande' : 'Request Details'}</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.requestDate}:</span>
                    <span className="font-medium">{new Date(selectedRequest.requestDate).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{language === 'fr' ? 'Type' : 'Type'}:</span>
                    <span className="font-medium">{t[selectedRequest.requestType]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.status}:</span>
                    <Badge className={getStatusBadgeVariant(selectedRequest.status)}>
                      {t[selectedRequest.status]}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Reason */}
              {selectedRequest.reason && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">{t.reason}</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedRequest.reason}</p>
                  </div>
                </div>
              )}

              {/* Documents */}
              {selectedRequest.verificationDocuments && selectedRequest.verificationDocuments.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">{t.documents}</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest.verificationDocuments.map((doc, index) => (
                        <Badge key={index} variant="outline">
                          <FileText className="w-3 h-3 mr-1" />
                          {doc.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedRequest.status === 'pending' && (
                <div className="flex justify-end space-x-3">
                  <Button
                    onClick={() => handleProcessRequest('reject')}
                    variant="destructive"
                    data-testid="button-reject-request"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {t.reject}
                  </Button>
                  <Button
                    onClick={() => handleProcessRequest('verify')}
                    variant="outline"
                    data-testid="button-verify-request"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {t.verify}
                  </Button>
                  <Button
                    onClick={() => handleProcessRequest('approve')}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-approve-request"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t.approve}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.verificationRequired}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="verification-notes">{t.verificationNotes}</Label>
              <Textarea
                id="verification-notes"
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder={language === 'fr' ? 
                  'Ajoutez vos notes de vérification...' : 
                  'Add your verification notes...'}
                rows={4}
                data-testid="textarea-verification-notes"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button onClick={() => setShowVerificationDialog(false)} variant="outline">
                {t.close}
              </Button>
              <Button onClick={handleVerificationSubmit} data-testid="button-submit-verification">
                <Send className="w-4 h-4 mr-2" />
                {t.save}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentChildConnectionManager;
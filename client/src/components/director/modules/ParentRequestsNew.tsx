import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard, ModernStatsCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, CheckCircle, XCircle, Clock, User, FileText, Eye, AlertTriangle, Send, Reply } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Mobile Action Button Component
interface MobileActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'success' | 'danger' | 'warning';
  iconOnly?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const MobileActionButton: React.FC<MobileActionButtonProps> = ({
  icon,
  label,
  onClick,
  variant = 'primary',
  iconOnly = false,
  disabled = false,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs min-w-[36px] min-h-[36px]',
    md: 'px-3 py-2 text-sm min-w-[44px] min-h-[44px]',
    lg: 'px-4 py-3 text-base min-w-[52px] min-h-[52px]'
  };
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white', 
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-orange-600 hover:bg-orange-700 text-white'
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center rounded-md font-medium transition-colors ${sizeClasses[size]} ${variantClasses[variant]} ${iconOnly ? 'aspect-square' : 'space-x-2'}`}
      data-testid={`button-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <span className="w-4 h-4">{icon}</span>
      {!iconOnly && <span className="hidden sm:inline whitespace-nowrap">{label}</span>}
    </Button>
  );
};

// Mobile Actions Container - Positioned below each request
interface MobileActionsProps {
  actions: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'success' | 'danger' | 'warning';
  }>;
  maxVisibleActions?: number;
}

const MobileActions: React.FC<MobileActionsProps> = ({ 
  actions, 
  maxVisibleActions = 2 
}) => {
  const shouldUseIconsOnly = (Array.isArray(actions) ? actions.length : 0) > maxVisibleActions;
  
  return (
    <div className="flex flex-wrap gap-2 mt-4 w-full border-t pt-3 bg-gray-50 rounded-b-lg px-3 pb-3">
      {(Array.isArray(actions) ? actions : []).map((action, index) => (
        <MobileActionButton
          key={index}
          icon={action.icon}
          label={action.label}
          onClick={action.onClick}
          variant={action.variant}
          iconOnly={shouldUseIconsOnly}
          size="md"
        />
      ))}
    </div>
  );
};

const ParentRequestsNew = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject' | 'respond'>('respond');
  const queryClient = useQueryClient();

  // Multilingual text content
  const text = {
    fr: {
      title: 'Gestion des Demandes Parents',
      subtitle: 'Système complet de gestion des demandes et communications parents',
      totalRequests: 'Demandes Totales',
      pendingRequests: 'En Attente',
      approvedRequests: 'Approuvées',
      rejectedRequests: 'Refusées',
      view: 'Voir',
      approve: 'Approuver',
      reject: 'Rejeter',
      respond: 'Répondre',
      urgent: 'Urgent',
      pending: 'En attente',
      approved: 'Approuvée',
      rejected: 'Refusée',
      in_progress: 'En cours',
      resolved: 'Résolue',
      absence_request: 'Demande d\'absence',
      permission: 'Autorisation',
      complaint: 'Réclamation',
      information: 'Information',
      meeting: 'Rendez-vous',
      document: 'Document',
      other: 'Autre',
      requestDetails: 'Détails de la demande',
      responseMessage: 'Message de réponse',
      sendResponse: 'Envoyer réponse',
      cancel: 'Annuler',
      requestProcessed: 'Demande traitée!',
      responseRequired: 'Veuillez écrire une réponse',
      markUrgent: 'Marquer urgent',
      loading: 'Chargement des demandes...',
      noRequests: 'Aucune demande parent trouvée',
      student: 'Élève',
      class: 'Classe',
      requestSubmitted: 'Demande soumise le',
      processRequest: 'Traiter la demande',
      priority: 'Priorité',
      subject: 'Sujet',
      description: 'Description',
      createdAt: 'Créée le',
      low: 'Faible',
      medium: 'Moyenne',
      high: 'Haute'
    },
    en: {
      title: 'Parent Requests Management',
      subtitle: 'Comprehensive parent requests and communications management system',
      totalRequests: 'Total Requests',
      pendingRequests: 'Pending',
      approvedRequests: 'Approved',
      rejectedRequests: 'Rejected',
      view: 'View',
      approve: 'Approve',
      reject: 'Reject',
      respond: 'Respond',
      urgent: 'Urgent',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      absence_request: 'Leave request',
      permission: 'Permission',
      complaint: 'Complaint',
      information: 'Information',
      meeting: 'Meeting',
      document: 'Document',
      other: 'Other',
      requestDetails: 'Request details',
      responseMessage: 'Response message',
      sendResponse: 'Send response',
      cancel: 'Cancel',
      requestProcessed: 'Request processed!',
      responseRequired: 'Please write a response',
      markUrgent: 'Mark urgent',
      loading: 'Loading requests...',
      noRequests: 'No parent requests found',
      student: 'Student',
      class: 'Class',
      requestSubmitted: 'Request submitted on',
      processRequest: 'Process request',
      priority: 'Priority',
      subject: 'Subject',
      description: 'Description',
      createdAt: 'Created on',
      low: 'Low',
      medium: 'Medium',
      high: 'High'
    }
  };

  const t = text[language as keyof typeof text];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case 'absence_request':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'permission':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'complaint':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'meeting':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'document':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'information':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Fetch parent requests with test API (temporarily for diagnosis)
  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ['/api/parent-requests-test'],
    queryFn: async () => {
      const response = await fetch('/api/parent-requests-test');
      if (!response.ok) throw new Error('Failed to fetch parent requests');
      return response.json();
    }
  });

  // Process request mutation
  const processRequestMutation = useMutation({
    mutationFn: async ({ requestId, status, response }: any) => {
      const res = await fetch('/api/parent-requests/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          status,
          response
        }),
      });
      if (!res.ok) throw new Error('Failed to process request');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parent-requests'] });
      toast({
        title: language === 'fr' ? 'Demande traitée' : 'Request processed',
        description: language === 'fr' ? 'La demande a été traitée avec succès.' : 'The request has been processed successfully.'
      });
      setShowResponseDialog(false);
      setSelectedRequest(null);
      setResponseMessage('');
    },
    onError: (error: any) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur lors du traitement de la demande.' : 'Error processing request.',
        variant: 'destructive'
      });
    }
  });

  // Mark request as urgent mutation
  const markUrgentMutation = useMutation({
    mutationFn: async ({ requestId, isUrgent }: { requestId: number; isUrgent: boolean }) => {
      const res = await fetch('/api/parent-requests/mark-urgent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId, isUrgent }),
      });
      if (!res.ok) throw new Error('Failed to mark request as urgent');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parent-requests'] });
      toast({
        title: language === 'fr' ? 'Demande marquée urgente' : 'Request marked urgent',
        description: language === 'fr' ? 'La demande a été marquée comme urgente.' : 'The request has been marked as urgent.'
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur lors du marquage urgent.' : 'Error marking request as urgent.',
        variant: 'destructive'
      });
    }
  });

  // Calculate statistics
  const totalRequests = (Array.isArray(requests) ? requests.length : 0);
  const pendingRequests = (Array.isArray(requests) ? requests : []).filter((r: any) => r.status === 'pending').length;
  const approvedRequests = (Array.isArray(requests) ? requests : []).filter((r: any) => r.status === 'approved').length;
  const rejectedRequests = (Array.isArray(requests) ? requests : []).filter((r: any) => r.status === 'rejected').length;

  const stats = [
    {
      title: t.totalRequests,
      value: totalRequests,
      icon: <FileText className="w-6 h-6" />,
      trend: { value: 12, isPositive: true },
      gradient: 'blue' as const,
    },
    {
      title: t.pendingRequests,
      value: pendingRequests,
      icon: <Clock className="w-6 h-6" />,
      trend: { value: 5, isPositive: false },
      gradient: 'orange' as const,
    },
    {
      title: t.approvedRequests,
      value: approvedRequests,
      icon: <CheckCircle className="w-6 h-6" />,
      trend: { value: 15, isPositive: true },
      gradient: 'green' as const,
    },
    {
      title: t.rejectedRequests,
      value: rejectedRequests,
      icon: <XCircle className="w-6 h-6" />,
      trend: { value: 8, isPositive: false },
      gradient: 'purple' as const,
    }
  ];

  const handleProcessRequest = (status: 'approved' | 'rejected') => {
    if (!responseMessage.trim()) {
      toast({
        title: language === 'fr' ? 'Réponse requise' : 'Response required',
        description: t.responseRequired,
        variant: 'destructive'
      });
      return;
    }
    
    processRequestMutation.mutate({
      requestId: selectedRequest.id,
      status,
      response: responseMessage
    });
  };

  const openResponseDialog = (request: any, action: 'approve' | 'reject' | 'respond') => {
    setSelectedRequest(request);
    setCurrentAction(action);
    setShowResponseDialog(true);
  };

  const handleMarkUrgent = (requestId: number) => {
    markUrgentMutation.mutate({ requestId, isUrgent: true });
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          {language === 'fr' ? 'Erreur lors du chargement des demandes' : 'Error loading requests'}
        </div>
        <Button onClick={() => window?.location?.reload()}>
          {language === 'fr' ? 'Réessayer' : 'Retry'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t.title || ''}</h2>
        <p className="text-gray-600 mb-6">{t.subtitle}</p>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {(Array.isArray(stats) ? stats : []).map((stat, index) => (
            <ModernStatsCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Parent Requests List */}
      <ModernCard className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-4 animate-spin" />
            {t.loading}
          </div>
        ) : (Array.isArray(requests) ? requests.length : 0) === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-8 h-8 mx-auto mb-4" />
            {t.noRequests}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {(Array.isArray(requests) ? requests : []).map((request: any) => (
              <div key={request.id} className="bg-white">
                {/* Request Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {request.parent_name || 'Parent'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {t.student}: {request.student_name || 'Élève'} 
                          {request.class_name && ` - ${request.class_name}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t.createdAt}: {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(request.status)}>
                        {(t as any)[request.status] || request.status}
                      </Badge>
                      {request.priority && (
                        <Badge className={getPriorityColor(request.priority)}>
                          {(t as any)[request.priority] || request.priority}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getRequestTypeColor(request.type)}>
                        {(t as any)[request.type] || request.type}
                      </Badge>
                      {request.category && (
                        <span className="text-sm text-gray-500">
                          {request.category}
                        </span>
                      )}
                    </div>
                    
                    {request.subject && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">{t.subject}:</h5>
                        <p className="text-sm text-gray-700">{request.subject}</p>
                      </div>
                    )}
                    
                    {request.description && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">{t.description || ''}:</h5>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                          {request.description || ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Action Buttons - Positioned Below Request */}
                <MobileActions
                  actions={[
                    {
                      icon: <Eye className="w-4 h-4" />,
                      label: t.view,
                      onClick: () => openResponseDialog(request, 'respond'),
                      variant: 'primary'
                    },
                    {
                      icon: <CheckCircle className="w-4 h-4" />,
                      label: t.approve,
                      onClick: () => openResponseDialog(request, 'approve'),
                      variant: 'success'
                    },
                    {
                      icon: <XCircle className="w-4 h-4" />,
                      label: t.reject,
                      onClick: () => openResponseDialog(request, 'reject'),
                      variant: 'danger'
                    },
                    {
                      icon: <AlertTriangle className="w-4 h-4" />,
                      label: t.urgent,
                      onClick: () => handleMarkUrgent(request.id),
                      variant: 'warning'
                    }
                  ]}
                  maxVisibleActions={2}
                />
              </div>
            ))}
          </div>
        )}
      </ModernCard>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-md mx-auto bg-white">
          <DialogHeader>
            <DialogTitle>
              {currentAction === 'approve' ? t.approve : 
               currentAction === 'reject' ? t.reject : t.respond}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRequest && (
              <div className="bg-gray-50 p-4 rounded border">
                <h4 className="font-medium mb-2">{selectedRequest.subject}</h4>
                <p className="text-sm text-gray-600">
                  {selectedRequest.description || ''}
                </p>
              </div>
            )}
            <Textarea
              value={responseMessage}
              onChange={(e) => setResponseMessage(e?.target?.value)}
              placeholder={t.responseMessage}
              rows={4}
              data-testid="textarea-response-message"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => setShowResponseDialog(false)}
                variant="outline"
                className="flex-1"
                data-testid="button-cancel"
              >
                {t.cancel}
              </Button>
              {currentAction === 'respond' ? (
                <Button
                  onClick={() => handleProcessRequest('approved')}
                  disabled={processRequestMutation.isPending}
                  className="flex-1"
                  data-testid="button-send-response"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {t.sendResponse}
                </Button>
              ) : (
                <Button
                  onClick={() => handleProcessRequest(currentAction === 'approve' ? 'approved' : 'rejected')}
                  disabled={processRequestMutation.isPending}
                  className="flex-1"
                  variant={currentAction === 'approve' ? 'default' : 'destructive'}
                  data-testid={`button-${currentAction}`}
                >
                  {currentAction === 'approve' ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  {currentAction === 'approve' ? t.approve : t.reject}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentRequestsNew;
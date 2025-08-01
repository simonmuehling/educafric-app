import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard, ModernStatsCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

// Mobile Actions Container for Parent Requests
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
    <div className="flex flex-wrap gap-2 mt-4 w-full border-t pt-3">
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

const ParentRequests = () => {
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
      title: 'Demandes Parents',
      subtitle: 'Gestion des demandes et communications parents',
      totalRequests: 'Demandes Totales',
      pendingRequests: 'En Attente',
      approvedRequests: 'Approuvées',
      rejectedRequests: 'Refusées',
      parentName: 'Parent',
      studentName: 'Élève',
      requestType: 'Type Demande',
      date: 'Date',
      status: 'Statut',
      actions: 'Actions',
      view: 'Voir',
      approve: 'Approuver',
      reject: 'Rejeter',
      respond: 'Répondre',
      pending: 'En attente',
      approved: 'Approuvée',
      rejected: 'Refusée',
      leaveRequest: 'Demande congé',
      meetingRequest: 'Demande RDV',
      transferRequest: 'Demande transfert',
      complaintRequest: 'Réclamation',
      otherRequest: 'Autre demande',
      requestDetails: 'Détails de la demande',
      responseMessage: 'Message de réponse',
      sendResponse: 'Envoyer réponse',
      cancel: 'Annuler',
      requestProcessed: 'Demande traitée!',
      responseRequired: 'Veuillez écrire une réponse'
    },
    en: {
      title: 'Parent Requests',
      subtitle: 'Parent requests and communications management',
      totalRequests: 'Total Requests',
      pendingRequests: 'Pending',
      approvedRequests: 'Approved',
      rejectedRequests: 'Rejected',
      parentName: 'Parent',
      studentName: 'Student',
      requestType: 'Request Type',
      date: 'Date',
      status: 'Status',
      actions: 'Actions',
      view: 'View',
      approve: 'Approve',
      reject: 'Reject',
      respond: 'Respond',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      leaveRequest: 'Leave request',
      meetingRequest: 'Meeting request',
      transferRequest: 'Transfer request',
      complaintRequest: 'Complaint',
      otherRequest: 'Other request',
      requestDetails: 'Request details',
      responseMessage: 'Response message',
      sendResponse: 'Send response',
      cancel: 'Cancel',
      requestProcessed: 'Request processed!',
      responseRequired: 'Please write a response'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch parent requests
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['/api/parent-requests'],
    queryFn: async () => {
      const response = await fetch('/api/parent-requests');
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
      alert(t.requestProcessed);
      setSelectedRequest(null);
      setResponseMessage('');
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
      value: totalRequests.toString(),
      icon: <MessageSquare className="w-5 h-5" />,
      trend: { value: 3, isPositive: true },
      gradient: 'blue' as const
    },
    {
      title: t.pendingRequests,
      value: pendingRequests.toString(),
      icon: <Clock className="w-5 h-5" />,
      trend: { value: 2, isPositive: false },
      gradient: 'orange' as const
    },
    {
      title: t.approvedRequests,
      value: approvedRequests.toString(),
      icon: <CheckCircle className="w-5 h-5" />,
      trend: { value: 5, isPositive: true },
      gradient: 'green' as const
    },
    {
      title: t.rejectedRequests,
      value: rejectedRequests.toString(),
      icon: <XCircle className="w-5 h-5" />,
      trend: { value: 1, isPositive: false },
      gradient: 'red' as const
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case 'leave':
        return 'bg-blue-100 text-blue-800';
      case 'meeting':
        return 'bg-green-100 text-green-800';
      case 'transfer':
        return 'bg-purple-100 text-purple-800';
      case 'complaint':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleProcessRequest = (status: 'approved' | 'rejected') => {
    if (!responseMessage.trim()) {
      alert(t.responseRequired);
      return;
    }
    
    processRequestMutation.mutate({
      requestId: selectedRequest.id,
      status,
      response: responseMessage
    });
  };

  return (
    <div className="space-y-6">
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

      {/* Requests List */}
      <ModernCard className="p-6">
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Chargement des demandes...
            </div>
          ) : (Array.isArray(requests) ? requests.length : 0) === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune demande parent trouvée
            </div>
          ) : (
            (Array.isArray(requests) ? requests : []).map((request: any) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {request.parentName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Élève: {request.studentName} - {request.className}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(request.status)}>
                      {t[request.status as keyof typeof t] || request.status}
                    </Badge>
                    <Badge className={getRequestTypeColor(request.type)}>
                      {t[`${request.type}Request` as keyof typeof t] || request.type}
                    </Badge>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {request.message}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>{t.date}: {new Date(request.createdAt).toLocaleDateString()}</span>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                      variant="outline"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {t.respond}
                    </Button>
                  </div>
                )}

                {request.response && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm font-medium text-blue-900 mb-1">Réponse de l'administration:</p>
                    <p className="text-sm text-blue-800">{request.response}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ModernCard>

      {/* Response Modal */}
      {selectedRequest && (
        <ModernCard className="p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t.requestDetails}
            </h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSelectedRequest(null);
                setResponseMessage('');
              }}
            >
              {t.cancel}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">{t.parentName}:</span> {selectedRequest.parentName}
                </div>
                <div>
                  <span className="font-medium">{t.studentName}:</span> {selectedRequest.studentName}
                </div>
                <div>
                  <span className="font-medium">{t.requestType}:</span> 
                  <Badge className={`ml-2 ${getRequestTypeColor(selectedRequest.type)}`}>
                    {t[`${selectedRequest.type}Request` as keyof typeof t] || selectedRequest.type}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">{t.date}:</span> {new Date(selectedRequest.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="mt-3">
                <span className="font-medium">Message:</span>
                <p className="mt-1 text-gray-700">{selectedRequest.message}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.responseMessage}
              </label>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e?.target?.value)}
                placeholder="Tapez votre réponse ici..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-32 resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => handleProcessRequest('approved')}
                disabled={processRequestMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {t.approve}
              </Button>
              <Button 
                onClick={() => handleProcessRequest('rejected')}
                disabled={processRequestMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {t.reject}
              </Button>
            </div>
          </div>
        </ModernCard>
      )}
    </div>
  );
};

export default ParentRequests;
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, User, FileText, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ConnectionRequest {
  id: number;
  parentName: string;
  parentEmail: string;
  studentName: string;
  relationshipType: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

interface ConnectionRequestManagerProps {
  language: 'fr' | 'en';
}

const ConnectionRequestManager: React.FC<ConnectionRequestManagerProps> = ({ language }) => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const texts = {
    fr: {
      title: 'Gestion Connexions Parents-Enfants',
      subtitle: 'Validez et gérez les demandes de connexion parent-enfant',
      pendingRequests: 'Demandes en Attente',
      inviteParent: 'Inviter un Parent',
      parentEmail: 'Email du Parent',
      studentId: 'ID Étudiant',
      sendInvite: 'Envoyer Invitation',
      approve: 'Approuver',
      reject: 'Rejeter',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      pending: 'En Attente',
      requestDate: 'Date Demande',
      relationshipType: 'Type Relation',
      actions: 'Actions',
      noRequests: 'Aucune demande en attente',
      inviteSuccess: 'Invitation envoyée avec succès',
      approveSuccess: 'Demande approuvée avec succès',
      rejectSuccess: 'Demande rejetée',
      error: 'Erreur',
      processing: 'Traitement...',
      relationships: {
        parent: 'Parent Principal',
        secondary_parent: 'Parent Secondaire', 
        guardian: 'Tuteur/Responsable',
        emergency_contact: 'Contact Urgence'
      }
    },
    en: {
      title: 'Parent-Child Connection Management',
      subtitle: 'Validate and manage parent-child connection requests',
      pendingRequests: 'Pending Requests',
      inviteParent: 'Invite Parent',
      parentEmail: 'Parent Email',
      studentId: 'Student ID',
      sendInvite: 'Send Invitation',
      approve: 'Approve',
      reject: 'Reject', 
      approved: 'Approved',
      rejected: 'Rejected',
      pending: 'Pending',
      requestDate: 'Request Date',
      relationshipType: 'Relationship Type',
      actions: 'Actions',
      noRequests: 'No pending requests',
      inviteSuccess: 'Invitation sent successfully',
      approveSuccess: 'Request approved successfully',
      rejectSuccess: 'Request rejected',
      error: 'Error',
      processing: 'Processing...',
      relationships: {
        parent: 'Primary Parent',
        secondary_parent: 'Secondary Parent',
        guardian: 'Guardian/Responsible', 
        emergency_contact: 'Emergency Contact'
      }
    }
  };

  const t = texts[language];

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      console.log('[CONNECTION_MANAGER] Loading pending connection requests');
      
      const response = await apiRequest('GET', '/api/school/pending-connections');
      
      if (response.ok) {
        const result = await response.json();
        console.log('[CONNECTION_MANAGER] ✅ Pending requests loaded:', result);
        setRequests(result.requests || []);
      }
    } catch (error: any) {
      console.error('[CONNECTION_MANAGER] ❌ Error loading requests:', error);
      toast({
        title: t.error,
        description: error.message || 'Failed to load requests',
        variant: 'destructive'
      });
    }
  };

  const handleInviteParent = async () => {
    if (!inviteEmail.trim() || !selectedStudentId) {
      toast({
        title: t.error,
        description: language === 'fr' ? 'Email parent et ID étudiant requis' : 'Parent email and student ID required',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      console.log('[INVITE_PARENT] Sending invitation:', { inviteEmail, selectedStudentId });
      
      const response = await apiRequest('POST', '/api/school/invite-parent', {
        parentEmail: inviteEmail.trim(),
        studentId: selectedStudentId
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[INVITE_PARENT] ✅ Invitation sent:', result);
        
        toast({
          title: t.inviteSuccess,
          description: result.message || t.inviteSuccess,
          variant: 'default'
        });

        setInviteEmail('');
        setSelectedStudentId(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invitation failed');
      }
    } catch (error: any) {
      console.error('[INVITE_PARENT] ❌ Error:', error);
      toast({
        title: t.error,
        description: error.message || 'Invitation error',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleValidateRequest = async (requestId: number, approval: boolean) => {
    setLoading(true);
    try {
      console.log('[VALIDATE_REQUEST] Validating request:', { requestId, approval });
      
      const response = await apiRequest('POST', `/api/school/validate-connection/${requestId}`, {
        approval,
        reason: approval ? 'Approved by school admin' : 'Rejected by school admin'
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[VALIDATE_REQUEST] ✅ Request validated:', result);
        
        toast({
          title: approval ? t.approveSuccess : t.rejectSuccess,
          description: result.message || (approval ? t.approveSuccess : t.rejectSuccess),
          variant: 'default'
        });

        // Mettre à jour la liste locale
        setRequests(prev => (Array.isArray(prev) ? prev : []).map(req => 
          req.id === requestId 
            ? { ...req, status: approval ? 'approved' : 'rejected' }
            : req
        ));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Validation failed');
      }
    } catch (error: any) {
      console.error('[VALIDATE_REQUEST] ❌ Error:', error);
      toast({
        title: t.error,
        description: error.message || 'Validation error',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300"><Clock className="h-3 w-3 mr-1" />{t.pending}</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />{t.approved}</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-300"><XCircle className="h-3 w-3 mr-1" />{t.rejected}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3 text-indigo-800">
            <User className="h-6 w-6" />
            <span>{t.title || ''}</span>
          </CardTitle>
          <p className="text-indigo-600">{t.subtitle}</p>
        </CardHeader>
      </Card>

      {/* ÉQUITÉ PRINCIPE */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-800">
              {language === 'fr' ? 'PRINCIPE D\'ÉQUITÉ VALIDÉ' : 'VALIDATED EQUITY PRINCIPLE'}
            </h3>
          </div>
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <p className="text-green-700 font-medium text-center">
              {language === 'fr' 
                ? '⚡ TOUS LES PARENTS VALIDÉS REÇOIVENT ACCÈS COMPLET IDENTIQUE' 
                : '⚡ ALL VALIDATED PARENTS RECEIVE IDENTICAL FULL ACCESS'
              }
            </p>
            <p className="text-green-600 text-sm text-center mt-2">
              {language === 'fr'
                ? 'Aucune hiérarchie - Principal, Secondaire, Tuteur: mêmes droits si payants'
                : 'No hierarchy - Primary, Secondary, Guardian: same rights if paying'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Parent Invitation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <span>{t.inviteParent}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t.parentEmail}</label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e?.target?.value)}
                placeholder="parent@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t.studentId}</label>
              <Input
                type="number"
                value={selectedStudentId || ''}
                onChange={(e) => setSelectedStudentId(parseInt(e?.target?.value) || null)}
                placeholder="101"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleInviteParent}
                disabled={loading || !inviteEmail.trim() || !selectedStudentId}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                {loading ? t.processing : t.sendInvite}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-orange-600" />
            <span>{t.pendingRequests}</span>
            <Badge variant="outline" className="ml-2">
              {(Array.isArray(requests) ? requests : []).filter(r => r.status === 'pending').length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(Array.isArray(requests) ? requests.length : 0) === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>{t.noRequests}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(Array.isArray(requests) ? requests : []).map((request) => (
                <div key={request.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium text-gray-900">{request.parentName}</h4>
                      <p className="text-sm text-gray-600">{request.parentEmail}</p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        {language === 'fr' ? 'Étudiant:' : 'Student:'}
                      </span>
                      <p className="text-gray-600">{request.studentName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">{t.relationshipType}:</span>
                      <p className="text-gray-600">{t.relationships[request.relationshipType as keyof typeof t.relationships] || request.relationshipType}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">{t.requestDate}:</span>
                      <p className="text-gray-600">{formatDate(request.requestDate)}</p>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleValidateRequest(request.id, true)}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t.approve}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleValidateRequest(request.id, false)}
                        disabled={loading}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        {t.reject}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-yellow-200">
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-medium text-yellow-800">
              {(Array.isArray(requests) ? requests : []).filter(r => r.status === 'pending').length}
            </h3>
            <p className="text-sm text-yellow-600">{t.pending}</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium text-green-800">
              {(Array.isArray(requests) ? requests : []).filter(r => r.status === 'approved').length}
            </h3>
            <p className="text-sm text-green-600">{t.approved}</p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <h3 className="font-medium text-red-800">
              {(Array.isArray(requests) ? requests : []).filter(r => r.status === 'rejected').length}
            </h3>
            <p className="text-sm text-red-600">{t.rejected}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConnectionRequestManager;
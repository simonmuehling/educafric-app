import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, User, FileText, Mail, Phone, AlertTriangle, Users2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ConnectionRequest {
  id: number;
  parentName: string;
  parentEmail: string;
  parentPhone?: string;
  studentName: string;
  studentId: number;
  relationshipType: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  searchMethod: 'email' | 'phone';
  currentParentCount?: number;
  maxParentsReached?: boolean;
  verificationRequired?: boolean;
}

interface ConnectionRequestManagerProps {
  language: 'fr' | 'en';
}

const ConnectionRequestManager: React.FC<ConnectionRequestManagerProps> = ({ language }) => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteMethod, setInviteMethod] = useState<'email' | 'phone'>('email');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const texts = {
    fr: {
      title: 'Gestion Connexions Parents-Enfants',
      subtitle: 'Validez et gérez les demandes de connexion parent-enfant (Max 2 parents/tuteurs par élève)',
      pendingRequests: 'Demandes en Attente',
      inviteParent: 'Inviter un Parent',
      parentEmail: 'Email du Parent',
      parentPhone: 'Téléphone du Parent',
      studentId: 'ID Étudiant',
      sendInvite: 'Envoyer Invitation',
      approve: 'Approuver',
      reject: 'Rejeter',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      pending: 'En Attente',
      requestDate: 'Date Demande',
      relationshipType: 'Type Relation',
      searchMethod: 'Méthode de Recherche',
      currentParents: 'Parents Actuels',
      maxReached: 'Limite Atteinte (2/2)',
      actions: 'Actions',
      noRequests: 'Aucune demande en attente',
      inviteSuccess: 'Invitation envoyée avec succès',
      approveSuccess: 'Demande approuvée avec succès',
      rejectSuccess: 'Demande rejetée',
      maxParentsError: 'ERREUR: Cet élève a déjà 2 parents/tuteurs connectés',
      error: 'Erreur',
      processing: 'Traitement...',
      verificationRequired: 'Vérification requise',
      warning: 'Attention',
      relationships: {
        parent: 'Parent Principal',
        secondary_parent: 'Parent Secondaire', 
        guardian: 'Tuteur/Responsable',
        emergency_contact: 'Contact Urgence'
      }
    },
    en: {
      title: 'Parent-Child Connection Management',
      subtitle: 'Validate and manage parent-child connection requests (Max 2 parents/guardians per student)',
      pendingRequests: 'Pending Requests',
      inviteParent: 'Invite Parent',
      parentEmail: 'Parent Email',
      parentPhone: 'Parent Phone',
      studentId: 'Student ID',
      sendInvite: 'Send Invitation',
      approve: 'Approve',
      reject: 'Reject', 
      approved: 'Approved',
      rejected: 'Rejected',
      pending: 'Pending',
      requestDate: 'Request Date',
      relationshipType: 'Relationship Type',
      searchMethod: 'Search Method',
      currentParents: 'Current Parents',
      maxReached: 'Limit Reached (2/2)',
      actions: 'Actions',
      noRequests: 'No pending requests',
      inviteSuccess: 'Invitation sent successfully',
      approveSuccess: 'Request approved successfully',
      rejectSuccess: 'Request rejected',
      maxParentsError: 'ERROR: This student already has 2 parents/guardians connected',
      error: 'Error',
      processing: 'Processing...',
      verificationRequired: 'Verification required',
      warning: 'Warning',
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
    const contactInfo = inviteMethod === 'email' ? inviteEmail.trim() : invitePhone.trim();
    
    if (!contactInfo || !selectedStudentId) {
      toast({
        title: t.error,
        description: language === 'fr' 
          ? `${inviteMethod === 'email' ? 'Email' : 'Téléphone'} parent et ID étudiant requis` 
          : `Parent ${inviteMethod} and student ID required`,
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      console.log('[INVITE_PARENT] Sending invitation:', { contactInfo, selectedStudentId, method: inviteMethod });
      
      const requestData = {
        studentId: selectedStudentId,
        searchMethod: inviteMethod,
        ...(inviteMethod === 'email' ? { parentEmail: contactInfo } : { parentPhone: contactInfo })
      };
      
      const response = await apiRequest('POST', '/api/school/invite-parent', requestData);

      if (response.ok) {
        const result = await response.json();
        console.log('[INVITE_PARENT] ✅ Invitation sent:', result);
        
        // Check if max parents reached
        if (result.warning && result.warning.includes('max')) {
          toast({
            title: t.warning,
            description: result.warning,
            variant: 'destructive'
          });
        } else {
          toast({
            title: t.inviteSuccess,
            description: result.message || t.inviteSuccess,
            variant: 'default'
          });
        }

        setInviteEmail('');
        setInvitePhone('');
        setSelectedStudentId(null);
        loadPendingRequests(); // Refresh requests
      } else {
        const errorData = await response.json();
        if (errorData.message?.includes('maximum') || errorData.message?.includes('2 parents')) {
          toast({
            title: t.error,
            description: t.maxParentsError,
            variant: 'destructive'
          });
        } else {
          throw new Error(errorData.message || 'Invitation failed');
        }
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
        
        // Check if approval failed due to max parents
        if (!approval || !result.error) {
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
          // Handle max parents error
          toast({
            title: t.error,
            description: result.error || t.maxParentsError,
            variant: 'destructive'
          });
        }
      } else {
        const errorData = await response.json();
        if (errorData.message?.includes('maximum') || errorData.message?.includes('2 parents')) {
          toast({
            title: t.error,
            description: t.maxParentsError,
            variant: 'destructive'
          });
        } else {
          throw new Error(errorData.message || 'Validation failed');
        }
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

      {/* LIMITATION & ÉQUITÉ PRINCIPE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users2 className="h-6 w-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-orange-800">
                {language === 'fr' ? 'LIMITATION PARENTS/TUTEURS' : 'PARENTS/GUARDIANS LIMIT'}
              </h3>
            </div>
            <div className="bg-white p-4 rounded-lg border border-orange-200">
              <p className="text-orange-700 font-medium text-center">
                {language === 'fr' 
                  ? '🚨 MAXIMUM 2 PARENTS/TUTEURS PAR ÉLÈVE' 
                  : '🚨 MAXIMUM 2 PARENTS/GUARDIANS PER STUDENT'
                }
              </p>
              <p className="text-orange-600 text-sm text-center mt-2">
                {language === 'fr'
                  ? 'Contrôle automatique lors des demandes de connexion'
                  : 'Automatic control during connection requests'
                }
              </p>
            </div>
          </CardContent>
        </Card>

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
      </div>

      {/* Parent Invitation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <span>{t.inviteParent}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Method Selection */}
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setInviteMethod('email')}
              variant={inviteMethod === 'email' ? 'default' : 'outline'}
              size="sm"
              data-testid="button-email-method"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button
              onClick={() => setInviteMethod('phone')}
              variant={inviteMethod === 'phone' ? 'default' : 'outline'}
              size="sm"
              data-testid="button-phone-method"
            >
              <Phone className="h-4 w-4 mr-2" />
              Téléphone
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {inviteMethod === 'email' ? t.parentEmail : t.parentPhone}
              </label>
              {inviteMethod === 'email' ? (
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e?.target?.value)}
                  placeholder="parent@email.com"
                  data-testid="input-parent-email"
                />
              ) : (
                <Input
                  type="tel"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e?.target?.value)}
                  placeholder="+237657004011"
                  data-testid="input-parent-phone"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t.studentId}</label>
              <Input
                type="number"
                value={selectedStudentId || ''}
                onChange={(e) => setSelectedStudentId(parseInt(e?.target?.value) || null)}
                placeholder="101"
                data-testid="input-student-id"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleInviteParent}
                disabled={loading || (!inviteEmail.trim() && !invitePhone.trim()) || !selectedStudentId}
                className="w-full"
                data-testid="button-send-invite"
              >
                {inviteMethod === 'email' ? <Mail className="h-4 w-4 mr-2" /> : <Phone className="h-4 w-4 mr-2" />}
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
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
                      <span className="font-medium text-gray-700">{t.searchMethod}:</span>
                      <p className="text-gray-600 flex items-center">
                        {request.searchMethod === 'email' ? (
                          <>
                            <Mail className="h-3 w-3 mr-1" />
                            {request.parentEmail}
                          </>
                        ) : (
                          <>
                            <Phone className="h-3 w-3 mr-1" />
                            {request.parentPhone}
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">{t.requestDate}:</span>
                      <p className="text-gray-600">{formatDate(request.requestDate)}</p>
                    </div>
                  </div>

                  {/* Parents Count Warning */}
                  {request.currentParentCount !== undefined && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{t.currentParents}:</span>
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${request.currentParentCount >= 2 ? 'text-red-600' : 'text-green-600'}`}>
                            {request.currentParentCount}/2
                          </span>
                          {request.maxParentsReached && (
                            <div className="ml-2 flex items-center">
                              <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                              <span className="text-xs text-red-600 font-medium">{t.maxReached}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Verification Required */}
                  {request.verificationRequired && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-800">{t.verificationRequired}</span>
                      </div>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleValidateRequest(request.id, true)}
                        disabled={loading || request.maxParentsReached}
                        className={`${request.maxParentsReached ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                        data-testid={`button-approve-${request.id}`}
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
                        data-testid={`button-reject-${request.id}`}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        {t.reject}
                      </Button>
                    </div>
                  )}
                  
                  {request.maxParentsReached && request.status === 'pending' && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-center">
                      <p className="text-xs text-red-700 font-medium">
                        {t.maxParentsError}
                      </p>
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
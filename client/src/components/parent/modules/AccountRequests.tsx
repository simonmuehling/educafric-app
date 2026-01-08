import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Check, X, Clock, User, Inbox } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface AccountDeletionRequest {
  id: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'declined';
}

export function AccountRequests() {
  const { language } = useLanguage();
  const [requests, setRequests] = useState<AccountDeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const t = {
    title: language === 'fr' ? 'Demandes de Suppression' : 'Deletion Requests',
    subtitle: language === 'fr' ? 'Gérez les demandes de suppression de compte de vos enfants' : 'Manage your children\'s account deletion requests',
    noRequests: language === 'fr' ? 'Aucune demande de suppression de compte en attente.' : 'No pending account deletion requests.',
    email: 'Email',
    requestDate: language === 'fr' ? 'Date de demande' : 'Request date',
    warning: language === 'fr' ? 'Attention' : 'Warning',
    warningMessage: language === 'fr' 
      ? 'demande la suppression de son compte EDUCAFRIC. Cette action est irréversible et toutes ses données seront définitivement supprimées.'
      : 'is requesting deletion of their EDUCAFRIC account. This action is irreversible and all their data will be permanently deleted.',
    approve: language === 'fr' ? 'Approuver la suppression' : 'Approve deletion',
    decline: language === 'fr' ? 'Refuser' : 'Decline',
    confirmTitle: language === 'fr' ? 'Confirmer la suppression' : 'Confirm deletion',
    confirmMessage: language === 'fr' 
      ? 'Êtes-vous sûr de vouloir approuver la suppression du compte de'
      : 'Are you sure you want to approve the deletion of the account of',
    confirmWarning: language === 'fr'
      ? 'Cette action est irréversible et toutes les données de l\'élève seront définitivement supprimées.'
      : 'This action is irreversible and all student data will be permanently deleted.',
    cancel: language === 'fr' ? 'Annuler' : 'Cancel',
    confirm: language === 'fr' ? 'Confirmer la suppression' : 'Confirm deletion',
    approved: language === 'fr' ? 'Demande approuvée' : 'Request approved',
    approvedDesc: language === 'fr' ? 'Le compte de l\'élève a été supprimé avec succès.' : 'The student\'s account has been successfully deleted.',
    declined: language === 'fr' ? 'Demande refusée' : 'Request declined',
    declinedDesc: language === 'fr' ? 'L\'élève a été notifié du refus.' : 'The student has been notified of the refusal.',
    error: language === 'fr' ? 'Erreur' : 'Error',
    errorApprove: language === 'fr' ? 'Impossible d\'approuver la demande.' : 'Unable to approve request.',
    errorDecline: language === 'fr' ? 'Impossible de refuser la demande.' : 'Unable to decline request.',
    statusPending: language === 'fr' ? 'En attente' : 'Pending',
    statusApproved: language === 'fr' ? 'Approuvée' : 'Approved',
    statusDeclined: language === 'fr' ? 'Refusée' : 'Declined',
    loading: language === 'fr' ? 'Chargement...' : 'Loading...'
  };

  useEffect(() => {
    fetchAccountRequests();
  }, []);

  const fetchAccountRequests = async () => {
    try {
      const response = await fetch('/api/parent/account-deletion-requests', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching account requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (studentId: number) => {
    try {
      const response = await fetch('/api/parent/approve-account-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ studentId, approve: true }),
      });

      if (response.ok) {
        toast({ title: t.approved, description: t.approvedDesc });
        fetchAccountRequests();
      } else {
        throw new Error('Failed to approve request');
      }
    } catch (error) {
      toast({ title: t.error, description: t.errorApprove, variant: 'destructive' });
    }
  };

  const handleDeclineRequest = async (studentId: number) => {
    try {
      const response = await fetch('/api/parent/approve-account-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ studentId, approve: false }),
      });

      if (response.ok) {
        toast({ title: t.declined, description: t.declinedDesc });
        fetchAccountRequests();
      } else {
        throw new Error('Failed to decline request');
      }
    } catch (error) {
      toast({ title: t.error, description: t.errorDecline, variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t.statusPending;
      case 'approved': return t.statusApproved;
      case 'declined': return t.statusDeclined;
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <AlertTriangle className="h-6 w-6" />
              <span>{t.title}</span>
            </CardTitle>
            <p className="text-orange-600">{t.subtitle}</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-800">
            <AlertTriangle className="h-6 w-6" />
            <span>{t.title}</span>
          </CardTitle>
          <p className="text-orange-600">{t.subtitle}</p>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <Inbox className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">{t.noRequests}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {requests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-orange-400">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="w-5 h-5" />
                        {request.studentName}
                      </CardTitle>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusText(request.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">{t.email}:</span>
                        <p className="text-gray-600">{request.studentEmail}</p>
                      </div>
                      <div>
                        <span className="font-medium">{t.requestDate}:</span>
                        <p className="text-gray-600">
                          {new Date(request.requestDate).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                        </p>
                      </div>
                    </div>

                    <Alert className="bg-orange-50 border-orange-200">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        <strong>{t.warning}:</strong> {request.studentName} {t.warningMessage}
                      </AlertDescription>
                    </Alert>

                    {request.status === 'pending' && (
                      <div className="flex gap-3 pt-4">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="flex-1" data-testid="button-approve-deletion">
                              <Check className="h-4 w-4 mr-2" />
                              {t.approve}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t.confirmTitle}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t.confirmMessage} {request.studentName}? {t.confirmWarning}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-testid="button-cancel-approve">{t.cancel}</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleApproveRequest(request.studentId)}
                                className="bg-red-600 hover:bg-red-700"
                                data-testid="button-confirm-approve"
                              >
                                {t.confirm}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleDeclineRequest(request.studentId)}
                          data-testid="button-decline-deletion"
                        >
                          <X className="h-4 w-4 mr-2" />
                          {t.decline}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AccountRequests;

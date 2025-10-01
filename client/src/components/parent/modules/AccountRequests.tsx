import React, { useState, useEffect } from 'react';
import { ModuleContainer } from '../../shared/ModuleContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Check, X, Clock, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

interface AccountDeletionRequest {
  id: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'declined';
}

export function AccountRequests() {
  const [requests, setRequests] = useState<AccountDeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccountRequests();
  }, []);

  const fetchAccountRequests = async () => {
    try {
      // Pour l'instant, utiliser des données de démonstration
      // Dans une vraie implémentation, récupérer depuis /api/parent/account-deletion-requests
      setRequests([
        {
          id: 'req_001',
          studentId: 15,
          studentName: 'Marie Kamga',
          studentEmail: 'marie.kamga@student.educafric.com',
          requestDate: '2025-01-18',
          status: 'pending'
        }
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching account requests:', error);
      setLoading(false);
    }
  };

  const handleApproveRequest = async (studentId: number) => {
    try {
      const response = await fetch('/api/parent/approve-account-deletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          studentId,
          approve: true
        }),
      });

      if (response.ok) {
        toast({
          title: "Demande approuvée",
          description: "Le compte de l'élève a été supprimé avec succès.",
        });
        fetchAccountRequests();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to approve request');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver la demande.",
        variant: "destructive",
      });
    }
  };

  const handleDeclineRequest = async (studentId: number) => {
    try {
      const response = await fetch('/api/parent/approve-account-deletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          studentId,
          approve: false
        }),
      });

      if (response.ok) {
        toast({
          title: "Demande refusée",
          description: "L'élève a été notifié du refus.",
        });
        fetchAccountRequests();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to decline request');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de refuser la demande.",
        variant: "destructive",
      });
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
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvée';
      case 'declined': return 'Refusée';
      default: return status;
    }
  };

  if (loading) {
    return (
      <ModuleContainer
        title="Demandes de Suppression"
        subtitle="Gérez les demandes de suppression de compte de vos enfants"
        icon={<AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />}
      >
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ModuleContainer>
    );
  }

  return (
    <ModuleContainer
      title="Demandes de Suppression"
      subtitle="Gérez les demandes de suppression de compte de vos enfants"
      icon={<AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />}
    >
      <div className="space-y-6">
        {requests.length === 0 ? (
          <Alert>
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            <AlertDescription>
              Aucune demande de suppression de compte en attente.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4">
            {requests.map((request) => (
              <Card key={request.id} className="border-l-4 border-l-orange-400">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 sm:w-6 sm:h-6" />
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
                      <span className="font-medium">Email:</span>
                      <p className="text-gray-600">{request.studentEmail}</p>
                    </div>
                    <div>
                      <span className="font-medium">Date de demande:</span>
                      <p className="text-gray-600">
                        {new Date(request.requestDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <Alert className="bg-orange-50 border-orange-200">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <strong>Attention:</strong> Votre enfant {request.studentName} demande la suppression de son compte EDUCAFRIC. 
                      Cette action est irréversible et toutes ses données seront définitivement supprimées.
                    </AlertDescription>
                  </Alert>

                  {request.status === 'pending' && (
                    <div className="flex gap-3 pt-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            className="flex-1"
                            data-testid="button-approve-deletion"
                          >
                            <Check className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            Approuver la suppression
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir approuver la suppression du compte de {request.studentName}? 
                              Cette action est irréversible et toutes les données de l'élève seront définitivement supprimées.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-testid="button-cancel-approve">
                              Annuler
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleApproveRequest(request.studentId)}
                              className="bg-red-600 hover:bg-red-700"
                              data-testid="button-confirm-approve"
                            >
                              Confirmer la suppression
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
                        <X className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Refuser
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ModuleContainer>
  );
}
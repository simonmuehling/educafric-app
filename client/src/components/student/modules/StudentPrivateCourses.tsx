import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Mail, 
  Check, 
  X, 
  GraduationCap,
  Calendar,
  Clock,
  Video,
  BookOpen,
  User,
  ExternalLink
} from 'lucide-react';

interface TeacherInvitation {
  id: number;
  teacherId: number;
  targetType: 'student' | 'parent';
  targetId: number;
  studentId?: number;
  subjects: string[];
  level?: string;
  message?: string;
  pricePerHour?: number;
  pricePerSession?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  responseMessage?: string;
  createdAt: string;
  expiresAt?: string;
}

interface PrivateTeacher {
  id: number;
  teacherId: number;
  teacherName: string;
  subjects: string[];
  level?: string;
  status: 'active' | 'paused' | 'ended';
  createdAt: string;
}

interface PrivateSession {
  id: number;
  teacherId: number;
  teacherName: string;
  title: string;
  subject: string;
  scheduledStart: string;
  scheduledEnd?: string;
  sessionType: 'online' | 'in_person' | 'hybrid';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  jitsiLink?: string;
}

const StudentPrivateCourses: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<'invitations' | 'teachers' | 'sessions'>('invitations');
  const [selectedInvitation, setSelectedInvitation] = useState<TeacherInvitation | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const text = {
    fr: {
      title: 'Mes Cours Privés',
      subtitle: 'Gérez vos cours particuliers et professeurs privés',
      invitationsTab: 'Invitations',
      teachersTab: 'Mes Professeurs',
      sessionsTab: 'Sessions',
      noInvitations: 'Aucune invitation reçue',
      noInvitationsDesc: 'Vous n\'avez pas encore reçu d\'invitations de professeurs privés',
      noTeachers: 'Aucun professeur privé',
      noTeachersDesc: 'Vous n\'avez pas encore de professeurs particuliers',
      noSessions: 'Aucune session programmée',
      noSessionsDesc: 'Vous n\'avez pas de cours privés programmés',
      teacher: 'Professeur',
      subjects: 'Matières',
      level: 'Niveau',
      pricePerHour: 'Prix/heure',
      pricePerSession: 'Prix/session',
      message: 'Message',
      expiresOn: 'Expire le',
      accept: 'Accepter',
      reject: 'Refuser',
      pending: 'En attente',
      accepted: 'Acceptée',
      rejected: 'Refusée',
      expired: 'Expirée',
      acceptInvitation: 'Accepter l\'invitation',
      rejectInvitation: 'Refuser l\'invitation',
      responseMessage: 'Message de réponse (optionnel)',
      responsePlaceholder: 'Votre message au professeur...',
      confirm: 'Confirmer',
      cancel: 'Annuler',
      invitationAccepted: 'Invitation acceptée avec succès',
      invitationRejected: 'Invitation rejetée',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      active: 'Actif',
      paused: 'En pause',
      ended: 'Terminé',
      scheduled: 'Programmé',
      ongoing: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé',
      online: 'En ligne',
      inPerson: 'En présentiel',
      hybrid: 'Hybride',
      joinClass: 'Rejoindre',
      sessionDetails: 'Détails de la session'
    },
    en: {
      title: 'My Private Courses',
      subtitle: 'Manage your tutoring and private teachers',
      invitationsTab: 'Invitations',
      teachersTab: 'My Teachers',
      sessionsTab: 'Sessions',
      noInvitations: 'No invitations received',
      noInvitationsDesc: 'You haven\'t received any invitations from private teachers yet',
      noTeachers: 'No private teachers',
      noTeachersDesc: 'You don\'t have any private teachers yet',
      noSessions: 'No sessions scheduled',
      noSessionsDesc: 'You don\'t have any private lessons scheduled',
      teacher: 'Teacher',
      subjects: 'Subjects',
      level: 'Level',
      pricePerHour: 'Price/hour',
      pricePerSession: 'Price/session',
      message: 'Message',
      expiresOn: 'Expires on',
      accept: 'Accept',
      reject: 'Reject',
      pending: 'Pending',
      accepted: 'Accepted',
      rejected: 'Rejected',
      expired: 'Expired',
      acceptInvitation: 'Accept Invitation',
      rejectInvitation: 'Reject Invitation',
      responseMessage: 'Response message (optional)',
      responsePlaceholder: 'Your message to the teacher...',
      confirm: 'Confirm',
      cancel: 'Cancel',
      invitationAccepted: 'Invitation accepted successfully',
      invitationRejected: 'Invitation rejected',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      active: 'Active',
      paused: 'Paused',
      ended: 'Ended',
      scheduled: 'Scheduled',
      ongoing: 'Ongoing',
      completed: 'Completed',
      cancelled: 'Cancelled',
      online: 'Online',
      inPerson: 'In Person',
      hybrid: 'Hybrid',
      joinClass: 'Join',
      sessionDetails: 'Session Details'
    }
  };

  const t = text[language];

  // Fetch received invitations
  const { data: invitationsData, isLoading: invitationsLoading } = useQuery({
    queryKey: ['/api/teacher/independent/invitations/received'],
    queryFn: async () => {
      return await apiRequest('GET', '/api/teacher/independent/invitations/received');
    }
  });

  // Accept invitation mutation
  const acceptInvitationMutation = useMutation({
    mutationFn: async ({ id, message }: { id: number; message: string }) => {
      return await apiRequest('POST', `/api/teacher/independent/invitations/${id}/accept`, {
        responseMessage: message
      });
    },
    onSuccess: () => {
      toast({
        title: t.success,
        description: t.invitationAccepted
      });
      setShowAcceptDialog(false);
      setSelectedInvitation(null);
      setResponseMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/independent/invitations/received'] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t.error,
        description: error.message
      });
    }
  });

  // Reject invitation mutation
  const rejectInvitationMutation = useMutation({
    mutationFn: async ({ id, message }: { id: number; message: string }) => {
      return await apiRequest('POST', `/api/teacher/independent/invitations/${id}/reject`, {
        responseMessage: message
      });
    },
    onSuccess: () => {
      toast({
        title: t.success,
        description: t.invitationRejected
      });
      setShowRejectDialog(false);
      setSelectedInvitation(null);
      setResponseMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/independent/invitations/received'] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t.error,
        description: error.message
      });
    }
  });

  const handleAccept = (invitation: TeacherInvitation) => {
    setSelectedInvitation(invitation);
    setShowAcceptDialog(true);
  };

  const handleReject = (invitation: TeacherInvitation) => {
    setSelectedInvitation(invitation);
    setShowRejectDialog(true);
  };

  const confirmAccept = () => {
    if (selectedInvitation) {
      acceptInvitationMutation.mutate({
        id: selectedInvitation.id,
        message: responseMessage
      });
    }
  };

  const confirmReject = () => {
    if (selectedInvitation) {
      rejectInvitationMutation.mutate({
        id: selectedInvitation.id,
        message: responseMessage
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-500',
      accepted: 'bg-green-500',
      rejected: 'bg-red-500',
      expired: 'bg-gray-500',
      active: 'bg-green-500',
      paused: 'bg-yellow-500',
      ended: 'bg-gray-500',
      scheduled: 'bg-blue-500',
      ongoing: 'bg-green-500',
      completed: 'bg-gray-500',
      cancelled: 'bg-red-500'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-500'}>
        {t[status as keyof typeof t] || status}
      </Badge>
    );
  };

  // Invitations Section
  const InvitationsSection = () => {
    if (invitationsLoading) {
      return <div className="text-center py-8">{t.loading}</div>;
    }

    const invitations = (invitationsData?.invitations || []) as TeacherInvitation[];
    const studentInvitations = invitations.filter(inv => inv.targetType === 'student');

    return (
      <div className="space-y-4">
        {studentInvitations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Mail className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t.noInvitations}</h3>
              <p className="text-gray-600">{t.noInvitationsDesc}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {studentInvitations.map((invitation) => (
              <Card key={invitation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="w-5 h-5 text-blue-500" />
                        <span className="font-semibold">{t.teacher} ID: {invitation.teacherId}</span>
                        {getStatusBadge(invitation.status)}
                      </div>

                      <div className="text-sm text-gray-600 space-y-1 mt-2">
                        <p><strong>{t.subjects}:</strong> {invitation.subjects.join(', ')}</p>
                        {invitation.level && <p><strong>{t.level}:</strong> {invitation.level}</p>}
                        {invitation.message && (
                          <p className="italic border-l-2 border-blue-300 pl-2 py-1 mt-2">
                            "{invitation.message}"
                          </p>
                        )}
                        
                        {(invitation.pricePerHour || invitation.pricePerSession) && (
                          <p className="text-green-600 font-medium mt-2">
                            {invitation.pricePerHour && `${invitation.pricePerHour} CFA/h`}
                            {invitation.pricePerHour && invitation.pricePerSession && ' • '}
                            {invitation.pricePerSession && `${invitation.pricePerSession} CFA/session`}
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-500 mt-2">
                          {t.expiresOn}: {new Date(invitation.expiresAt || '').toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                        </p>
                      </div>
                    </div>
                    
                    {invitation.status === 'pending' && (
                      <div className="flex flex-col gap-2 ml-4">
                        <Button 
                          size="sm" 
                          onClick={() => handleAccept(invitation)}
                          className="bg-green-600 hover:bg-green-700"
                          data-testid={`button-accept-invitation-${invitation.id}`}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          {t.accept}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleReject(invitation)}
                          className="border-red-500 text-red-500 hover:bg-red-50"
                          data-testid={`button-reject-invitation-${invitation.id}`}
                        >
                          <X className="w-4 h-4 mr-1" />
                          {t.reject}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Teachers Section (Placeholder)
  const TeachersSection = () => {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t.noTeachers}</h3>
          <p className="text-gray-600">{t.noTeachersDesc}</p>
        </CardContent>
      </Card>
    );
  };

  // Sessions Section (Placeholder)
  const SessionsSection = () => {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t.noSessions}</h3>
          <p className="text-gray-600">{t.noSessionsDesc}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t.title}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invitations" data-testid="tab-invitations">{t.invitationsTab}</TabsTrigger>
          <TabsTrigger value="teachers" data-testid="tab-teachers">{t.teachersTab}</TabsTrigger>
          <TabsTrigger value="sessions" data-testid="tab-sessions">{t.sessionsTab}</TabsTrigger>
        </TabsList>

        <TabsContent value="invitations" className="mt-6">
          <InvitationsSection />
        </TabsContent>

        <TabsContent value="teachers" className="mt-6">
          <TeachersSection />
        </TabsContent>

        <TabsContent value="sessions" className="mt-6">
          <SessionsSection />
        </TabsContent>
      </Tabs>

      {/* Accept Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.acceptInvitation}</DialogTitle>
            <DialogDescription>
              Confirmer l'acceptation de cette invitation de cours privé
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>{t.responseMessage}</Label>
              <Textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder={t.responsePlaceholder}
                data-testid="textarea-accept-message"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAcceptDialog(false);
                setResponseMessage('');
              }}
              data-testid="button-cancel-accept"
            >
              {t.cancel}
            </Button>
            <Button 
              onClick={confirmAccept} 
              disabled={acceptInvitationMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-accept"
            >
              <Check className="w-4 h-4 mr-2" />
              {t.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.rejectInvitation}</DialogTitle>
            <DialogDescription>
              Confirmer le rejet de cette invitation de cours privé
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>{t.responseMessage}</Label>
              <Textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder={t.responsePlaceholder}
                data-testid="textarea-reject-message"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowRejectDialog(false);
                setResponseMessage('');
              }}
              data-testid="button-cancel-reject"
            >
              {t.cancel}
            </Button>
            <Button 
              onClick={confirmReject} 
              disabled={rejectInvitationMutation.isPending}
              variant="destructive"
              data-testid="button-confirm-reject"
            >
              <X className="w-4 h-4 mr-2" />
              {t.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentPrivateCourses;

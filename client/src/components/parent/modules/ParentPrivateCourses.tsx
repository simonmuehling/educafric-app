import { useState } from 'react';
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
  User,
  Calendar,
  Clock,
  BookOpen,
  DollarSign,
  Video,
  MapPin,
  Star
} from 'lucide-react';

interface TeacherInvitation {
  id: number;
  teacherId: number;
  teacherName?: string;
  targetType: 'student' | 'parent';
  targetId: number;
  studentId?: number;
  studentName?: string | null;
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

interface PrivateSession {
  id: number;
  studentId: number;
  studentName: string;
  teacherId: number;
  teacherName: string;
  title: string;
  subject: string;
  description?: string;
  scheduledStart: string;
  scheduledEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  sessionType: 'online' | 'in_person' | 'hybrid';
  location?: string;
  meetingUrl?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  rating?: number;
  createdAt: string;
}

interface InvitationsResponse {
  success: boolean;
  invitations: TeacherInvitation[];
}

interface SessionsResponse {
  success: boolean;
  sessions: PrivateSession[];
}

const ParentPrivateCourses = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<'invitations' | 'sessions'>('invitations');
  const [selectedInvitation, setSelectedInvitation] = useState<TeacherInvitation | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const text = {
    fr: {
      title: 'Cours Privés de mes Enfants',
      subtitle: 'Gérez les cours privés et tuteurs de vos enfants',
      invitationsTab: 'Invitations',
      sessionsTab: 'Sessions',
      noInvitations: 'Aucune invitation reçue',
      noInvitationsDesc: 'Vous n\'avez pas encore reçu d\'invitations de professeurs privés',
      noSessions: 'Aucune session programmée',
      noSessionsDesc: 'Vos enfants n\'ont pas encore de cours privés programmés',
      teacher: 'Professeur',
      forChild: 'Pour',
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
      scheduled: 'Programmé',
      ongoing: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé',
      online: 'En ligne',
      inPerson: 'En présentiel',
      hybrid: 'Hybride',
      sessionDetails: 'Détails de la session',
      joinSession: 'Rejoindre',
      child: 'Enfant',
      date: 'Date',
      time: 'Heure',
      location: 'Lieu',
      rating: 'Note'
    },
    en: {
      title: 'My Children\'s Private Courses',
      subtitle: 'Manage your children\'s private courses and tutors',
      invitationsTab: 'Invitations',
      sessionsTab: 'Sessions',
      noInvitations: 'No invitations received',
      noInvitationsDesc: 'You haven\'t received any invitations from private teachers yet',
      noSessions: 'No sessions scheduled',
      noSessionsDesc: 'Your children don\'t have any private lessons scheduled yet',
      teacher: 'Teacher',
      forChild: 'For',
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
      scheduled: 'Scheduled',
      ongoing: 'Ongoing',
      completed: 'Completed',
      cancelled: 'Cancelled',
      online: 'Online',
      inPerson: 'In Person',
      hybrid: 'Hybrid',
      sessionDetails: 'Session Details',
      joinSession: 'Join',
      child: 'Child',
      date: 'Date',
      time: 'Time',
      location: 'Location',
      rating: 'Rating'
    }
  };

  const t = text[language];

  // Fetch received invitations
  const { data: invitationsData, isLoading: invitationsLoading } = useQuery<InvitationsResponse>({
    queryKey: ['/api/teacher/independent/invitations/received']
  });

  // Fetch sessions for children
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery<SessionsResponse>({
    queryKey: ['/api/teacher/independent/parent/sessions']
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
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/independent/parent/sessions'] });
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
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-500',
      accepted: 'bg-green-500',
      rejected: 'bg-red-500',
      expired: 'bg-gray-500',
      scheduled: 'bg-blue-500',
      ongoing: 'bg-purple-500',
      completed: 'bg-green-600',
      cancelled: 'bg-red-600'
    };
    
    const statusText: Record<string, string> = {
      pending: t.pending,
      accepted: t.accepted,
      rejected: t.rejected,
      expired: t.expired,
      scheduled: t.scheduled,
      ongoing: t.ongoing,
      completed: t.completed,
      cancelled: t.cancelled
    };
    
    return (
      <Badge className={statusColors[status] || 'bg-gray-500'}>
        {statusText[status] || status}
      </Badge>
    );
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'online': return <Video className="w-4 h-4 text-blue-500" />;
      case 'in_person': return <MapPin className="w-4 h-4 text-green-500" />;
      case 'hybrid': return <BookOpen className="w-4 h-4 text-purple-500" />;
      default: return null;
    }
  };

  const getSessionTypeText = (type: string) => {
    switch (type) {
      case 'online': return t.online;
      case 'in_person': return t.inPerson;
      case 'hybrid': return t.hybrid;
      default: return type;
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  // Invitations Section
  const InvitationsSection = () => {
    if (invitationsLoading) {
      return <div className="text-center py-8">{t.loading}</div>;
    }

    const invitations = invitationsData?.invitations || [];

    return (
      <div className="space-y-4">
        {invitations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Mail className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t.noInvitations}</h3>
              <p className="text-gray-600">{t.noInvitationsDesc}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <Card key={invitation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="w-5 h-5 text-blue-500" />
                        <span className="font-semibold">
                          {invitation.teacherName || `${t.teacher} #${invitation.teacherId}`}
                        </span>
                        {getStatusBadge(invitation.status)}
                      </div>
                      
                      {invitation.studentName && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <User className="w-4 h-4" />
                          <span>{t.forChild}: {invitation.studentName}</span>
                        </div>
                      )}

                      <div className="text-sm text-gray-600 space-y-1 mt-2">
                        <p><strong>{t.subjects}:</strong> {invitation.subjects.join(', ')}</p>
                        {invitation.level && <p><strong>{t.level}:</strong> {invitation.level}</p>}
                        {invitation.message && (
                          <p className="italic border-l-2 border-blue-300 pl-2 py-1 mt-2">
                            "{invitation.message}"
                          </p>
                        )}
                        
                        {(invitation.pricePerHour || invitation.pricePerSession) && (
                          <div className="flex items-center gap-3 mt-2 text-green-600 font-medium">
                            <DollarSign className="w-4 h-4" />
                            <span>
                              {invitation.pricePerHour && `${invitation.pricePerHour.toLocaleString()} CFA/h`}
                              {invitation.pricePerHour && invitation.pricePerSession && ' • '}
                              {invitation.pricePerSession && `${invitation.pricePerSession.toLocaleString()} CFA/session`}
                            </span>
                          </div>
                        )}
                        
                        {invitation.expiresAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            {t.expiresOn}: {new Date(invitation.expiresAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                          </p>
                        )}
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

  // Sessions Section
  const SessionsSection = () => {
    if (sessionsLoading) {
      return <div className="text-center py-8">{t.loading}</div>;
    }

    const sessions = sessionsData?.sessions || [];

    if (sessions.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t.noSessions}</h3>
            <p className="text-gray-600">{t.noSessionsDesc}</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {sessions.map((session) => {
          const { date, time } = formatDateTime(session.scheduledStart);
          
          return (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    {session.title}
                  </CardTitle>
                  {getStatusBadge(session.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-500" />
                      <span><strong>{t.child}:</strong> {session.studentName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="w-4 h-4 text-gray-500" />
                      <span><strong>{t.teacher}:</strong> {session.teacherName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="w-4 h-4 text-gray-500" />
                      <span><strong>{t.subjects}:</strong> {session.subject}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span><strong>{t.date}:</strong> {date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span><strong>{t.time}:</strong> {time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {getSessionTypeIcon(session.sessionType)}
                      <span>{getSessionTypeText(session.sessionType)}</span>
                      {session.location && <span className="text-gray-500">- {session.location}</span>}
                    </div>
                  </div>
                </div>

                {session.description && (
                  <p className="text-sm text-gray-600 mt-3 border-t pt-3">
                    {session.description}
                  </p>
                )}

                {session.rating && (
                  <div className="flex items-center gap-1 mt-3">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{session.rating}/5</span>
                  </div>
                )}

                {session.status === 'scheduled' && session.sessionType === 'online' && session.meetingUrl && (
                  <div className="mt-4">
                    <Button 
                      onClick={() => window.open(session.meetingUrl, '_blank')}
                      className="bg-blue-600 hover:bg-blue-700"
                      data-testid={`button-join-session-${session.id}`}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      {t.joinSession}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invitations" data-testid="tab-invitations">{t.invitationsTab}</TabsTrigger>
          <TabsTrigger value="sessions" data-testid="tab-sessions">{t.sessionsTab}</TabsTrigger>
        </TabsList>

        <TabsContent value="invitations" className="mt-6">
          <InvitationsSection />
        </TabsContent>

        <TabsContent value="sessions" className="mt-6">
          <SessionsSection />
        </TabsContent>
      </Tabs>

      {/* Accept Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>{t.acceptInvitation}</DialogTitle>
            <DialogDescription>
              {language === 'fr' 
                ? 'Confirmer l\'acceptation de cette invitation de cours privé'
                : 'Confirm acceptance of this private lesson invitation'}
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
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>{t.rejectInvitation}</DialogTitle>
            <DialogDescription>
              {language === 'fr'
                ? 'Confirmer le rejet de cette invitation de cours privé'
                : 'Confirm rejection of this private lesson invitation'}
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

export default ParentPrivateCourses;

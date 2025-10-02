import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Video, 
  Calendar, 
  Clock,
  Play,
  ExternalLink,
  MonitorPlay,
  BookOpen,
  Users,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  MessageCircle,
  Hand,
  User,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface ClassSession {
  id: number;
  title: string;
  description?: string;
  scheduledStart: string;
  scheduledEnd?: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  roomName: string;
  courseId: number;
  courseName?: string;
  teacherName?: string;
  maxDuration: number;
  lobbyEnabled: boolean;
  chatEnabled: boolean;
  screenShareEnabled: boolean;
  createdAt: string;
}

interface SessionsResponse {
  sessions: ClassSession[];
}

const StudentOnlineClasses: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'past'>('upcoming');

  const text = {
    fr: {
      title: 'Cours en Ligne',
      subtitle: 'Rejoignez vos sessions de cours virtuels',
      upcomingClasses: 'Cours à Venir',
      liveClasses: 'En Direct',
      pastClasses: 'Historique',
      joinClass: 'Rejoindre',
      classStarting: 'Cours qui commence',
      classEnded: 'Cours terminé',
      teacher: 'Professeur',
      duration: 'Durée',
      participants: 'participants',
      scheduled: 'Programmé',
      live: 'En Direct',
      ended: 'Terminé',
      cancelled: 'Annulé',
      noUpcoming: 'Aucun cours à venir',
      noLive: 'Aucun cours en direct',
      noPast: 'Aucun cours dans l\'historique',
      loading: 'Chargement...',
      minutes: 'minutes',
      chatAvailable: 'Chat disponible',
      screenShare: 'Partage d\'écran',
      lobby: 'Salle d\'attente activée',
      joinNow: 'Rejoindre Maintenant',
      startsIn: 'Commence dans',
      startedAgo: 'Commencé il y a',
      error: 'Erreur',
      accessDenied: 'Accès refusé',
      sessionNotFound: 'Session introuvable'
    },
    en: {
      title: 'Online Classes',
      subtitle: 'Join your virtual classroom sessions',
      upcomingClasses: 'Upcoming Classes',
      liveClasses: 'Live Now',
      pastClasses: 'Past Classes',
      joinClass: 'Join Class',
      classStarting: 'Class Starting',
      classEnded: 'Class Ended',
      teacher: 'Teacher',
      duration: 'Duration',
      participants: 'participants',
      scheduled: 'Scheduled',
      live: 'Live',
      ended: 'Ended',
      cancelled: 'Cancelled',
      noUpcoming: 'No upcoming classes',
      noLive: 'No live classes',
      noPast: 'No past classes',
      loading: 'Loading...',
      minutes: 'minutes',
      chatAvailable: 'Chat available',
      screenShare: 'Screen sharing',
      lobby: 'Waiting room enabled',
      joinNow: 'Join Now',
      startsIn: 'Starts in',
      startedAgo: 'Started',
      error: 'Error',
      accessDenied: 'Access denied',
      sessionNotFound: 'Session not found'
    }
  };

  const t = text[language];

  // Fetch student's available sessions
  const { data: sessionsData, isLoading: sessionsLoading, error } = useQuery<SessionsResponse>({
    queryKey: ['/api/online-classes/school/sessions'],
    queryFn: async () => {
      console.log('[STUDENT_ONLINE_CLASSES] 🔍 Fetching sessions from /api/online-classes/school/sessions');
      try {
        const response = await apiRequest('GET', '/api/online-classes/school/sessions') as unknown as SessionsResponse;
        console.log('[STUDENT_ONLINE_CLASSES] ✅ Sessions fetched:', response);
        return response;
      } catch (err) {
        console.error('[STUDENT_ONLINE_CLASSES] ❌ Error fetching sessions:', err);
        throw err;
      }
    },
    refetchInterval: 30000 // Refetch every 30 seconds for live updates
  });

  // Log loading and error states
  console.log('[STUDENT_ONLINE_CLASSES] Loading:', sessionsLoading, 'Error:', error, 'Data:', sessionsData);

  // Join session mutation
  const joinSessionMutation = useMutation({
    mutationFn: (sessionId: number) => 
      apiRequest('POST', `/api/online-classes/sessions/${sessionId}/join`),
    onSuccess: (response: any) => {
      if (response?.joinUrl) {
        window.open(response.joinUrl, '_blank');
      }
    },
    onError: (error: any) => {
      toast({
        title: t.error,
        description: error?.message || 'Échec de la connexion au cours',
        variant: "destructive"
      });
    }
  });

  const handleJoinSession = (sessionId: number) => {
    joinSessionMutation.mutate(sessionId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilStart = (scheduledStart: string) => {
    const now = new Date();
    const start = new Date(scheduledStart);
    const diffMs = start.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 0) return null;
    if (diffMinutes < 60) return `${diffMinutes} minutes`;
    
    const hours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const getStatusBadge = (status: string, scheduledStart?: string) => {
    const statusConfig = {
      scheduled: { 
        color: 'bg-blue-100 text-blue-800', 
        text: t.scheduled,
        icon: <Calendar className="w-3 h-3 mr-1" />
      },
      live: { 
        color: 'bg-green-100 text-green-800', 
        text: t.live,
        icon: <Play className="w-3 h-3 mr-1" />
      },
      ended: { 
        color: 'bg-gray-100 text-gray-800', 
        text: t.ended,
        icon: <CheckCircle className="w-3 h-3 mr-1" />
      },
      cancelled: { 
        color: 'bg-red-100 text-red-800', 
        text: t.cancelled,
        icon: <AlertCircle className="w-3 h-3 mr-1" />
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    
    // Show countdown for scheduled sessions starting within next hour
    if (status === 'scheduled' && scheduledStart) {
      const timeUntil = getTimeUntilStart(scheduledStart);
      const diffMs = new Date(scheduledStart).getTime() - new Date().getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      if (diffMinutes <= 60 && diffMinutes > 0) {
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            {t.startsIn} {timeUntil}
          </Badge>
        );
      }
    }
    
    return (
      <Badge className={config.color}>
        {config.icon}
        {config.text}
      </Badge>
    );
  };

  const filterSessions = (sessions: ClassSession[]) => {
    if (!sessions) return [];
    
    const now = new Date();
    
    switch (activeTab) {
      case 'upcoming':
        return sessions.filter(session => 
          session.status === 'scheduled' && new Date(session.scheduledStart) > now
        );
      case 'live':
        return sessions.filter(session => session.status === 'live');
      case 'past':
        return sessions.filter(session => 
          session.status === 'ended' || 
          (session.status === 'scheduled' && new Date(session.scheduledStart) < now)
        );
      default:
        return [];
    }
  };

  const renderSessionCard = (session: ClassSession) => {
    const canJoin = session.status === 'live' || 
      (session.status === 'scheduled' && 
       new Date(session.scheduledStart).getTime() - new Date().getTime() <= 15 * 60 * 1000); // 15 minutes before

    return (
      <ModernCard key={session.id} className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MonitorPlay className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{session.title}</h3>
                {getStatusBadge(session.status, session.scheduledStart)}
              </div>
              {session.description && (
                <p className="text-sm text-gray-600 mb-2">{session.description}</p>
              )}
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(session.scheduledStart)}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {session.maxDuration} {t.minutes}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center font-medium">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {session.courseName}
                  </span>
                  {session.teacherName && (
                    <span className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {session.teacherName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {session.chatEnabled && (
                    <span className="flex items-center text-green-600">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      {t.chatAvailable}
                    </span>
                  )}
                  {session.screenShareEnabled && (
                    <span className="flex items-center text-blue-600">
                      <MonitorPlay className="w-3 h-3 mr-1" />
                      {t.screenShare}
                    </span>
                  )}
                  {session.lobbyEnabled && (
                    <span className="flex items-center text-orange-600">
                      <Users className="w-3 h-3 mr-1" />
                      {t.lobby}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {canJoin && (
              <Button
                size="sm"
                onClick={() => handleJoinSession(session.id)}
                disabled={joinSessionMutation.isPending}
                className={session.status === 'live' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                {session.status === 'live' ? t.joinNow : t.joinClass}
              </Button>
            )}
          </div>
        </div>
      </ModernCard>
    );
  };

  const filteredSessions = filterSessions(sessionsData?.sessions || []);

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'upcoming':
        return t.noUpcoming;
      case 'live':
        return t.noLive;
      case 'past':
        return t.noPast;
      default:
        return t.noUpcoming;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Video className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t.title}</h2>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
        </div>
      </ModernCard>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === 'upcoming'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('upcoming')}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          {t.upcomingClasses}
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === 'live'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('live')}
        >
          <Play className="w-4 h-4 inline mr-2" />
          {t.liveClasses}
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === 'past'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('past')}
        >
          <CheckCircle className="w-4 h-4 inline mr-2" />
          {t.pastClasses}
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {sessionsLoading ? (
          <div className="text-center py-8">{t.loading}</div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-4 bg-gray-50 rounded-lg">
              <MonitorPlay className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">{getEmptyMessage()}</p>
            </div>
          </div>
        ) : (
          filteredSessions.map(renderSessionCard)
        )}
      </div>

      {/* Live sessions notification */}
      {activeTab === 'upcoming' && sessionsData?.sessions && sessionsData.sessions.some((s: ClassSession) => s.status === 'live') && (
        <ModernCard className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Play className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Cours en direct disponible !</h3>
              <p className="text-sm text-green-700">Il y a des cours qui sont actuellement en direct.</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="ml-auto border-green-300 text-green-700 hover:bg-green-100"
              onClick={() => setActiveTab('live')}
            >
              Voir les cours live
            </Button>
          </div>
        </ModernCard>
      )}
    </div>
  );
};

export default StudentOnlineClasses;
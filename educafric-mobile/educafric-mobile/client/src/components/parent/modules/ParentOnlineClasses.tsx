import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Video, 
  Calendar, 
  Clock,
  ExternalLink,
  MonitorPlay,
  BookOpen,
  Users,
  AlertCircle,
  CheckCircle,
  User,
  Eye
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
  studentName?: string;
  maxDuration: number;
  lobbyEnabled: boolean;
  chatEnabled: boolean;
  screenShareEnabled: boolean;
  createdAt: string;
}

const ParentOnlineClasses: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'past'>('upcoming');

  const text = {
    fr: {
      title: 'Cours en Ligne',
      subtitle: 'Suivez les sessions de cours virtuels de vos enfants',
      upcomingClasses: 'Cours à Venir',
      liveClasses: 'En Direct',
      pastClasses: 'Historique',
      observe: 'Observer',
      classStarting: 'Cours qui commence',
      classEnded: 'Cours terminé',
      teacher: 'Professeur',
      student: 'Élève',
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
      startsIn: 'Commence dans',
      startedAgo: 'Commencé il y a',
      error: 'Erreur',
      accessDenied: 'Accès refusé',
      sessionNotFound: 'Session introuvable'
    },
    en: {
      title: 'Online Classes',
      subtitle: 'Monitor your children\'s virtual classroom sessions',
      upcomingClasses: 'Upcoming Classes',
      liveClasses: 'Live Now',
      pastClasses: 'Past Classes',
      observe: 'Observe',
      classStarting: 'Class Starting',
      classEnded: 'Class Ended',
      teacher: 'Teacher',
      student: 'Student',
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
      startsIn: 'Starts in',
      startedAgo: 'Started',
      error: 'Error',
      accessDenied: 'Access denied',
      sessionNotFound: 'Session not found'
    }
  };

  const t = text[language];

  // Fetch children's sessions
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/online-classes/parent/sessions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/online-classes/parent/sessions');
      return response.json();
    },
    refetchInterval: 30000 // Refetch every 30 seconds for live updates
  });

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
    if (diffMinutes < 60) return `${diffMinutes} ${t.minutes}`;
    
    const hours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: t.scheduled, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      live: { label: t.live, className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      ended: { label: t.ended, className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
      cancelled: { label: t.cancelled, className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const filterSessions = (status: 'upcoming' | 'live' | 'past') => {
    if (!sessionsData?.sessions) return [];
    const now = new Date();
    
    return sessionsData.sessions.filter((session: ClassSession) => {
      const sessionStart = new Date(session.scheduledStart);
      const sessionEnd = session.scheduledEnd ? new Date(session.scheduledEnd) : new Date(sessionStart.getTime() + session.maxDuration * 60000);
      
      if (status === 'upcoming') return sessionStart > now && session.status === 'scheduled';
      if (status === 'live') return session.status === 'live';
      if (status === 'past') return sessionEnd < now || session.status === 'ended';
      
      return false;
    });
  };

  const SessionCard = ({ session }: { session: ClassSession }) => {
    const timeUntil = getTimeUntilStart(session.scheduledStart);
    
    return (
      <ModernCard className="overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white" data-testid={`text-session-title-${session.id}`}>
                  {session.title}
                </h3>
                {getStatusBadge(session.status)}
              </div>
              {session.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3" data-testid={`text-session-description-${session.id}`}>
                  {session.description}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Calendar className="w-4 h-4" />
              <span data-testid={`text-session-date-${session.id}`}>{formatDate(session.scheduledStart)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Clock className="w-4 h-4" />
              <span data-testid={`text-session-time-${session.id}`}>{formatTime(session.scheduledStart)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <BookOpen className="w-4 h-4" />
              <span data-testid={`text-teacher-${session.id}`}>{t.teacher}: {session.teacherName || 'N/A'}</span>
            </div>
            {session.studentName && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <User className="w-4 h-4" />
                <span data-testid={`text-student-${session.id}`}>{t.student}: {session.studentName}</span>
              </div>
            )}
          </div>

          {timeUntil && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                <AlertCircle className="w-4 h-4" />
                <span>{t.startsIn} {timeUntil}</span>
              </div>
            </div>
          )}

          {session.status === 'live' && (
            <div className="mt-4">
              <Button 
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                data-testid={`button-observe-${session.id}`}
              >
                <Eye className="w-4 h-4 mr-2" />
                {t.observe}
              </Button>
            </div>
          )}
        </div>
      </ModernCard>
    );
  };

  const upcomingSessions = filterSessions('upcoming');
  const liveSessions = filterSessions('live');
  const pastSessions = filterSessions('past');

  if (sessionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Video className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-300">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" data-testid="text-title">
          {t.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300" data-testid="text-subtitle">
          {t.subtitle}
        </p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'upcoming'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
          data-testid="button-tab-upcoming"
        >
          {t.upcomingClasses} ({upcomingSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'live'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
          data-testid="button-tab-live"
        >
          {t.liveClasses} ({liveSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'past'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
          data-testid="button-tab-past"
        >
          {t.pastClasses} ({pastSessions.length})
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'upcoming' && (
          <>
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t.noUpcoming}</p>
              </div>
            ) : (
              upcomingSessions.map((session: ClassSession) => (
                <SessionCard key={session.id} session={session} />
              ))
            )}
          </>
        )}

        {activeTab === 'live' && (
          <>
            {liveSessions.length === 0 ? (
              <div className="text-center py-12">
                <MonitorPlay className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t.noLive}</p>
              </div>
            ) : (
              liveSessions.map((session: ClassSession) => (
                <SessionCard key={session.id} session={session} />
              ))
            )}
          </>
        )}

        {activeTab === 'past' && (
          <>
            {pastSessions.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t.noPast}</p>
              </div>
            ) : (
              pastSessions.map((session: ClassSession) => (
                <SessionCard key={session.id} session={session} />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ParentOnlineClasses;

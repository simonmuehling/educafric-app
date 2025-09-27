import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Video, 
  Plus, 
  Calendar, 
  Users, 
  Clock,
  Play,
  Square,
  ExternalLink,
  Settings,
  Trash2,
  Eye,
  RefreshCw,
  BookOpen,
  MonitorPlay,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  MessageCircle,
  Share2
} from 'lucide-react';

interface OnlineCourse {
  id: number;
  title: string;
  description?: string;
  language: string;
  maxParticipants: number;
  allowRecording: boolean;
  isActive: boolean;
  createdAt: string;
}

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
  maxDuration: number;
  lobbyEnabled: boolean;
  chatEnabled: boolean;
  screenShareEnabled: boolean;
  createdAt: string;
}

const TeacherOnlineClasses: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  // Component states
  const [showCreateCourseDialog, setShowCreateCourseDialog] = useState(false);
  const [showCreateSessionDialog, setShowCreateSessionDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<OnlineCourse | null>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'sessions'>('courses');

  // Course creation state
  const [newCourseData, setNewCourseData] = useState({
    title: '',
    description: '',
    language: 'fr',
    maxParticipants: 30,
    allowRecording: true,
    requireApproval: false
  });

  // Session creation state
  const [newSessionData, setNewSessionData] = useState({
    title: '',
    description: '',
    scheduledStart: '',
    scheduledEnd: '',
    maxDuration: 120,
    lobbyEnabled: true,
    chatEnabled: true,
    screenShareEnabled: true,
    startNow: false
  });

  const text = {
    fr: {
      title: 'Cours en Ligne',
      subtitle: 'Gérer vos cours virtuels et sessions live',
      createCourse: 'Créer un Cours',
      createSession: 'Nouvelle Session',
      myCourses: 'Mes Cours',
      upcomingSessions: 'Sessions Prochaines',
      courseTitle: 'Titre du Cours',
      courseDescription: 'Description',
      language: 'Langue',
      maxParticipants: 'Max Participants',
      allowRecording: 'Autoriser Enregistrement',
      requireApproval: 'Nécessite Approbation',
      sessionTitle: 'Titre de la Session',
      sessionDescription: 'Description de la Session',
      scheduledStart: 'Début Programmé',
      scheduledEnd: 'Fin Programmée',
      maxDuration: 'Durée Max (minutes)',
      lobbyEnabled: 'Activer Salle d\'Attente',
      chatEnabled: 'Activer Chat',
      screenShareEnabled: 'Partage d\'Écran',
      startNow: 'Commencer Maintenant',
      save: 'Enregistrer',
      cancel: 'Annuler',
      join: 'Rejoindre',
      start: 'Démarrer',
      end: 'Terminer',
      delete: 'Supprimer',
      settings: 'Paramètres',
      participants: 'participants',
      duration: 'durée',
      scheduled: 'Programmé',
      live: 'En Direct',
      ended: 'Terminé',
      cancelled: 'Annulé',
      french: 'Français',
      english: 'Anglais',
      yes: 'Oui',
      no: 'Non',
      loading: 'Chargement...',
      noCourses: 'Aucun cours créé',
      noSessions: 'Aucune session programmée',
      courseCreated: 'Cours créé avec succès',
      sessionCreated: 'Session créée avec succès',
      sessionStarted: 'Session démarrée',
      sessionEnded: 'Session terminée',
      error: 'Erreur'
    },
    en: {
      title: 'Online Classes',
      subtitle: 'Manage your virtual courses and live sessions',
      createCourse: 'Create Course',
      createSession: 'New Session',
      myCourses: 'My Courses',
      upcomingSessions: 'Upcoming Sessions',
      courseTitle: 'Course Title',
      courseDescription: 'Description',
      language: 'Language',
      maxParticipants: 'Max Participants',
      allowRecording: 'Allow Recording',
      requireApproval: 'Require Approval',
      sessionTitle: 'Session Title',
      sessionDescription: 'Session Description',
      scheduledStart: 'Scheduled Start',
      scheduledEnd: 'Scheduled End',
      maxDuration: 'Max Duration (minutes)',
      lobbyEnabled: 'Enable Lobby',
      chatEnabled: 'Enable Chat',
      screenShareEnabled: 'Screen Sharing',
      startNow: 'Start Now',
      save: 'Save',
      cancel: 'Cancel',
      join: 'Join',
      start: 'Start',
      end: 'End',
      delete: 'Delete',
      settings: 'Settings',
      participants: 'participants',
      duration: 'duration',
      scheduled: 'Scheduled',
      live: 'Live',
      ended: 'Ended',
      cancelled: 'Cancelled',
      french: 'French',
      english: 'English',
      yes: 'Yes',
      no: 'No',
      loading: 'Loading...',
      noCourses: 'No courses created',
      noSessions: 'No sessions scheduled',
      courseCreated: 'Course created successfully',
      sessionCreated: 'Session created successfully',
      sessionStarted: 'Session started',
      sessionEnded: 'Session ended',
      error: 'Error'
    }
  };

  const t = text[language];

  // Fetch teacher's courses
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/online-classes/courses'],
    queryFn: () => apiRequest('GET', '/api/online-classes/courses')
  });

  // Fetch upcoming sessions
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/online-classes/school/sessions'],
    queryFn: () => apiRequest('GET', '/api/online-classes/school/sessions')
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: (courseData: typeof newCourseData) => 
      apiRequest('POST', '/api/online-classes/courses', courseData),
    onSuccess: (response: any) => {
      toast({
        title: 'Succès',
        description: t.courseCreated
      });
      setShowCreateCourseDialog(false);
      setNewCourseData({
        title: '',
        description: '',
        language: 'fr',
        maxParticipants: 30,
        allowRecording: true,
        requireApproval: false
      });
      queryClient.invalidateQueries({ queryKey: ['/api/online-classes/courses'] });
    },
    onError: () => {
      toast({
        title: t.error,
        description: 'Échec de la création du cours',
        variant: "destructive"
      });
    }
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: ({ courseId, sessionData }: { courseId: number; sessionData: typeof newSessionData }) => 
      apiRequest('POST', `/api/online-classes/courses/${courseId}/sessions`, sessionData),
    onSuccess: (response: any) => {
      toast({
        title: 'Succès',
        description: t.sessionCreated
      });
      setShowCreateSessionDialog(false);
      setSelectedCourse(null);
      setNewSessionData({
        title: '',
        description: '',
        scheduledStart: '',
        scheduledEnd: '',
        maxDuration: 120,
        lobbyEnabled: true,
        chatEnabled: true,
        screenShareEnabled: true,
        startNow: false
      });
      queryClient.invalidateQueries({ queryKey: ['/api/online-classes/school/sessions'] });

      // If session was started immediately, open join URL
      if (response?.joinUrl) {
        window.open(response.joinUrl, '_blank');
      }
    },
    onError: () => {
      toast({
        title: t.error,
        description: 'Échec de la création de la session',
        variant: "destructive"
      });
    }
  });

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: (sessionId: number) => 
      apiRequest('POST', `/api/online-classes/sessions/${sessionId}/start`),
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: t.sessionStarted
      });
      queryClient.invalidateQueries({ queryKey: ['/api/online-classes/school/sessions'] });
    },
    onError: () => {
      toast({
        title: t.error,
        description: 'Échec du démarrage de la session',
        variant: "destructive"
      });
    }
  });

  // Join session mutation  
  const joinSessionMutation = useMutation({
    mutationFn: (sessionId: number) => 
      apiRequest('POST', `/api/online-classes/sessions/${sessionId}/join`),
    onSuccess: (response: any) => {
      if (response?.joinUrl) {
        window.open(response.joinUrl, '_blank');
      }
    },
    onError: () => {
      toast({
        title: t.error,
        description: 'Échec de la génération du lien',
        variant: "destructive"
      });
    }
  });

  const handleCreateCourse = () => {
    createCourseMutation.mutate(newCourseData);
  };

  const handleCreateSession = () => {
    if (!selectedCourse) return;
    
    createSessionMutation.mutate({
      courseId: selectedCourse.id,
      sessionData: newSessionData
    });
  };

  const handleStartSession = (sessionId: number) => {
    startSessionMutation.mutate(sessionId);
  };

  const handleJoinSession = (sessionId: number) => {
    joinSessionMutation.mutate(sessionId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: 'bg-blue-100 text-blue-800', text: t.scheduled },
      live: { color: 'bg-green-100 text-green-800', text: t.live },
      ended: { color: 'bg-gray-100 text-gray-800', text: t.ended },
      cancelled: { color: 'bg-red-100 text-red-800', text: t.cancelled }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const renderCoursesList = () => (
    <div className="space-y-4">
      {coursesLoading ? (
        <div className="text-center py-8">{t.loading}</div>
      ) : !coursesData?.courses || coursesData.courses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">{t.noCourses}</div>
      ) : (
        coursesData.courses.map((course: OnlineCourse) => (
          <ModernCard key={course.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{course.title}</h3>
                  <p className="text-sm text-gray-600">{course.description}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span>{course.maxParticipants} {t.participants} max</span>
                    <span>{course.language === 'fr' ? t.french : t.english}</span>
                    {course.allowRecording && <span>📹 Recording</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedCourse(course);
                    setShowCreateSessionDialog(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Session
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </ModernCard>
        ))
      )}
    </div>
  );

  const renderSessionsList = () => (
    <div className="space-y-4">
      {sessionsLoading ? (
        <div className="text-center py-8">{t.loading}</div>
      ) : !sessionsData?.sessions || sessionsData.sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">{t.noSessions}</div>
      ) : (
        sessionsData.sessions.map((session: ClassSession) => (
          <ModernCard key={session.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MonitorPlay className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{session.title}</h3>
                  <p className="text-sm text-gray-600">{session.description}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span><Calendar className="w-3 h-3 inline mr-1" />{formatDate(session.scheduledStart)}</span>
                    <span><Clock className="w-3 h-3 inline mr-1" />{session.maxDuration}min</span>
                    <span className="font-medium">{session.courseName}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(session.status)}
                <div className="flex items-center gap-2">
                  {session.status === 'scheduled' && (
                    <Button
                      size="sm"
                      onClick={() => handleStartSession(session.id)}
                      disabled={startSessionMutation.isPending}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      {t.start}
                    </Button>
                  )}
                  {(session.status === 'live' || session.status === 'scheduled') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleJoinSession(session.id)}
                      disabled={joinSessionMutation.isPending}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      {t.join}
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </ModernCard>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <ModernCard className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{t.title}</h2>
              <p className="text-gray-600">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={showCreateCourseDialog} onOpenChange={setShowCreateCourseDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t.createCourse}
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      </ModernCard>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === 'courses'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('courses')}
        >
          <BookOpen className="w-4 h-4 inline mr-2" />
          {t.myCourses}
        </button>
        <button
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === 'sessions'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('sessions')}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          {t.upcomingSessions}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'courses' && renderCoursesList()}
      {activeTab === 'sessions' && renderSessionsList()}

      {/* Create Course Dialog */}
      <Dialog open={showCreateCourseDialog} onOpenChange={setShowCreateCourseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.createCourse}</DialogTitle>
            <DialogDescription>
              Créer un nouveau cours en ligne pour vos élèves
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="courseTitle">{t.courseTitle}</Label>
              <Input
                id="courseTitle"
                value={newCourseData.title}
                onChange={(e) => setNewCourseData({...newCourseData, title: e.target.value})}
                placeholder="Ex: Mathématiques Niveau 6ème"
              />
            </div>
            <div>
              <Label htmlFor="courseDesc">{t.courseDescription}</Label>
              <Textarea
                id="courseDesc"
                value={newCourseData.description}
                onChange={(e) => setNewCourseData({...newCourseData, description: e.target.value})}
                placeholder="Description du cours et objectifs..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="language">{t.language}</Label>
                <Select 
                  value={newCourseData.language} 
                  onValueChange={(value) => setNewCourseData({...newCourseData, language: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">{t.french}</SelectItem>
                    <SelectItem value="en">{t.english}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maxParticipants">{t.maxParticipants}</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={newCourseData.maxParticipants}
                  onChange={(e) => setNewCourseData({...newCourseData, maxParticipants: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allowRecording"
                checked={newCourseData.allowRecording}
                onChange={(e) => setNewCourseData({...newCourseData, allowRecording: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="allowRecording">{t.allowRecording}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateCourseDialog(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleCreateCourse} disabled={createCourseMutation.isPending}>
              {createCourseMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Session Dialog */}
      <Dialog open={showCreateSessionDialog} onOpenChange={setShowCreateSessionDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.createSession}</DialogTitle>
            <DialogDescription>
              Programmer une nouvelle session pour "{selectedCourse?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sessionTitle">{t.sessionTitle}</Label>
              <Input
                id="sessionTitle"
                value={newSessionData.title}
                onChange={(e) => setNewSessionData({...newSessionData, title: e.target.value})}
                placeholder="Ex: Leçon 1 - Introduction aux fractions"
              />
            </div>
            <div>
              <Label htmlFor="sessionDesc">{t.sessionDescription}</Label>
              <Textarea
                id="sessionDesc"
                value={newSessionData.description}
                onChange={(e) => setNewSessionData({...newSessionData, description: e.target.value})}
                placeholder="Contenu de la session..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduledStart">{t.scheduledStart}</Label>
                <Input
                  id="scheduledStart"
                  type="datetime-local"
                  value={newSessionData.scheduledStart}
                  onChange={(e) => setNewSessionData({...newSessionData, scheduledStart: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="maxDuration">{t.maxDuration}</Label>
                <Input
                  id="maxDuration"
                  type="number"
                  value={newSessionData.maxDuration}
                  onChange={(e) => setNewSessionData({...newSessionData, maxDuration: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="lobbyEnabled"
                  checked={newSessionData.lobbyEnabled}
                  onChange={(e) => setNewSessionData({...newSessionData, lobbyEnabled: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="lobbyEnabled">{t.lobbyEnabled}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="chatEnabled"
                  checked={newSessionData.chatEnabled}
                  onChange={(e) => setNewSessionData({...newSessionData, chatEnabled: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="chatEnabled">{t.chatEnabled}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="screenShare"
                  checked={newSessionData.screenShareEnabled}
                  onChange={(e) => setNewSessionData({...newSessionData, screenShareEnabled: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="screenShare">{t.screenShareEnabled}</Label>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="startNow"
                checked={newSessionData.startNow}
                onChange={(e) => setNewSessionData({...newSessionData, startNow: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="startNow" className="text-sm font-medium text-blue-600">{t.startNow}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateSessionDialog(false);
              setSelectedCourse(null);
            }}>
              {t.cancel}
            </Button>
            <Button onClick={handleCreateSession} disabled={createSessionMutation.isPending}>
              {createSessionMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Calendar className="w-4 h-4 mr-2" />}
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherOnlineClasses;
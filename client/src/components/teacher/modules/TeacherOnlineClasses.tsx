import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { OnlineClassPayment } from '@/components/teacher/OnlineClassPayment';
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
  Share2,
  GraduationCap,
  User,
  Book,
  CheckCircle,
  UserCheck,
  CreditCard,
  Info
} from 'lucide-react';

interface OnlineCourse {
  id: number;
  title: string;
  description?: string;
  language: string;
  classId?: number;
  className?: string;
  subjectId?: number;
  subjectName?: string;
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
  creatorType?: 'teacher' | 'school';
  className?: string;
  subjectName?: string;
}

const TeacherOnlineClasses: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // CHECK ACCESS TO ONLINE CLASSES MODULE
  const { data: accessData, isLoading: accessLoading } = useQuery({
    queryKey: ['/api/online-class-activations/check-access'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/online-class-activations/check-access');
      return response.json();
    }
  });

  // Component states
  const [step, setStep] = useState<'selection' | 'course-creation' | 'course-management'>('selection');
  const [showCreateSessionDialog, setShowCreateSessionDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<OnlineCourse | null>(null);
  const [activeTab, setActiveTab] = useState<'my-courses' | 'upcoming-sessions' | 'create-course'>('my-courses');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [starting, setStarting] = useState(false);
  const [isIndependentCourse, setIsIndependentCourse] = useState(false);

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

  // Purchase duration state for teachers
  const [purchaseDuration, setPurchaseDuration] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semestral' | 'yearly'>('yearly');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Calculate price based on duration (fixed prices)
  const calculatePrice = (duration: typeof purchaseDuration) => {
    switch (duration) {
      case 'daily': return 2500;
      case 'weekly': return 10000;
      case 'monthly': return 25000;
      case 'quarterly': return 73000;
      case 'semestral': return 105000;
      case 'yearly': return 150000;
      default: return 150000;
    }
  };

  const getDurationLabel = (duration: typeof purchaseDuration) => {
    const labels = {
      daily: { fr: 'Journalier (1 jour)', en: 'Daily (1 day)' },
      weekly: { fr: 'Hebdomadaire (1 semaine)', en: 'Weekly (1 week)' },
      monthly: { fr: 'Mensuel (1 mois)', en: 'Monthly (1 month)' },
      quarterly: { fr: 'Trimestriel (3 mois)', en: 'Quarterly (3 months)' },
      semestral: { fr: 'Semestriel (6 mois)', en: 'Semestral (6 months)' },
      yearly: { fr: 'Annuel (1 an)', en: 'Yearly (1 year)' }
    };
    return labels[duration][language as 'fr' | 'en'];
  };

  // Silence Replit dev noise
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (typeof e.origin === 'string' && e.origin.includes('.replit.dev')) return;
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const text = {
    fr: {
      title: 'Classes en Ligne',
      subtitle: 'Créez et gérez vos cours virtuels avec vos élèves',
      myCoursesTab: 'Mes Cours',
      upcomingSessionsTab: 'Sessions Programmées',
      createCourseTab: 'Créer un Cours',
      selectionTitle: 'Configuration du Cours',
      selectionDesc: 'Choisissez la classe et la matière pour créer votre cours en ligne',
      selectClass: 'Sélectionner une classe',
      selectSubject: 'Sélectionner une matière',
      continue: 'Continuer',
      back: 'Retour',
      createCourse: 'Créer le Cours',
      createSession: 'Nouvelle Session',
      myCourses: 'Mes Cours',
      upcomingSessions: 'Sessions Prochaines',
      scheduledSessions: 'Toutes mes Sessions',
      startNow: 'Démarrer Maintenant',
      scheduleCourse: 'Programmer une Session',
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
      error: 'Erreur',
      noData: 'Aucune donnée disponible',
      schoolCreated: 'École',
      teacherCreated: 'Vous',
      class: 'Classe',
      subject: 'Matière'
    },
    en: {
      title: 'Online Classes',
      subtitle: 'Create and manage your virtual classes with students',
      myCoursesTab: 'My Courses',
      upcomingSessionsTab: 'Scheduled Sessions',
      createCourseTab: 'Create Course',
      selectionTitle: 'Course Setup',
      selectionDesc: 'Choose class and subject to create your online course',
      selectClass: 'Select a class',
      selectSubject: 'Select a subject',
      continue: 'Continue',
      back: 'Back',
      createCourse: 'Create Course',
      createSession: 'New Session',
      myCourses: 'My Courses',
      upcomingSessions: 'Upcoming Sessions',
      scheduledSessions: 'All my Sessions',
      startNow: 'Start Now',
      scheduleCourse: 'Schedule Session',
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
      error: 'Error',
      noData: 'No data available',
      schoolCreated: 'School',
      teacherCreated: 'You',
      class: 'Class',
      subject: 'Subject'
    }
  };

  const t = text[language];

  // Fetch teacher's classes
  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ['/api/teacher/classes'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/teacher/classes');
      return response.json();
    }
  });

  // Get ALL classes from ALL schools (multi-school support)
  const allClasses = classesData?.schoolsWithClasses?.flatMap((school: any) => 
    school.classes?.map((cls: any) => ({
      ...cls,
      schoolName: school.schoolName,
      schoolId: school.schoolId
    })) || []
  ) || [];

  // Get subjects from the selected class (from teacherSubjectAssignments)
  const selectedClassData = allClasses.find((cls: any) => cls.id?.toString() === selectedClass);
  const classSubjects = selectedClassData?.subjects?.map((subjectName: string, index: number) => ({
    id: index + 1,
    name: subjectName
  })) || [];

  // Fetch teacher's courses
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/online-classes/courses'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/online-classes/courses');
      return response.json();
    },
    enabled: step !== 'selection' // Only fetch when we're past the selection step
  });

  // Fetch teacher's sessions
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/online-classes/teacher/sessions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/online-classes/teacher/sessions');
      return response.json();
    }
  });

  // Fetch school-scheduled sessions for this teacher
  const { data: schoolSessionsData, isLoading: schoolSessionsLoading } = useQuery({
    queryKey: ['/api/online-class-scheduler/teacher', user?.id, 'sessions'],
    queryFn: async () => {
      if (!user?.id) return { sessions: [] };
      const response = await apiRequest('GET', `/api/online-class-scheduler/teacher/${user.id}/sessions`);
      return response.json();
    },
    enabled: !!user?.id && !!accessData?.allowed
  });

  // Fetch course-specific sessions for better granularity (matches director module)
  const { data: courseSessions, isLoading: courseSessionsLoading } = useQuery({
    queryKey: ['/api/online-classes/courses', selectedCourse?.id, 'sessions'],
    queryFn: async () => {
      if (!selectedCourse?.id) return null;
      const response = await apiRequest('GET', `/api/online-classes/courses/${selectedCourse.id}/sessions`);
      return response.json();
    },
    enabled: !!selectedCourse?.id
  });

  // Create course mutation with teacher context
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: typeof newCourseData) => {
      let enrichedCourseData: any;
      
      // Handle independent courses vs school-linked courses
      if (isIndependentCourse) {
        // Independent course - no class/subject required
        enrichedCourseData = {
          ...courseData,
          isIndependent: true,
          language: language
        };
        console.log('[TEACHER_ONLINE_CLASSES] Creating INDEPENDENT course with data:', enrichedCourseData);
      } else {
        // School-linked course - validate selection
        if (!selectedClass || !selectedSubject) {
          throw new Error('Class and subject must be selected');
        }
        
        const classId = parseInt(selectedClass, 10);
        
        if (isNaN(classId)) {
          throw new Error('Invalid class selection');
        }
        
        // Now selectedSubject contains the subject NAME, not ID
        enrichedCourseData = {
          ...courseData,
          classId,
          subjectName: selectedSubject, // Send subject name instead of ID
          isIndependent: false,
          language: language
        };
        console.log('[TEACHER_ONLINE_CLASSES] Creating SCHOOL-LINKED course with data:', enrichedCourseData);
      }
      
      const response = await apiRequest('POST', '/api/online-classes/courses', enrichedCourseData);
      return response.json();
    },
    onSuccess: (response: any) => {
      const course = response.course || response;
      setSelectedCourse(course);
      
      toast({
        title: language === 'fr' ? 'Cours créé' : 'Course created',
        description: t.courseCreated
      });
      setStep('course-management');
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
    onError: (error) => {
      console.error('[TEACHER_ONLINE_CLASSES] Course creation error:', error);
      toast({
        title: t.error,
        description: language === 'fr' ? 'Échec de la création du cours' : 'Failed to create course',
        variant: "destructive"
      });
    }
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async ({ courseId, sessionData }: { courseId: number; sessionData: typeof newSessionData }) => {
      const response = await apiRequest('POST', `/api/online-classes/courses/${courseId}/sessions`, sessionData);
      return response.json(); // Properly parse JSON response
    },
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
      
      // Properly invalidate teacher sessions and course-specific sessions
      queryClient.invalidateQueries({ queryKey: ['/api/online-classes/teacher/sessions'] });
      if (selectedCourse) {
        queryClient.invalidateQueries({ queryKey: ['/api/online-classes/courses', selectedCourse.id, 'sessions'] });
      }

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
    mutationFn: async (sessionId: number) => {
      const response = await apiRequest('POST', `/api/online-classes/sessions/${sessionId}/start`);
      return response.json();
    },
    onSuccess: (response: any) => {
      toast({
        title: 'Succès',
        description: t.sessionStarted
      });
      // Properly invalidate teacher sessions and course-specific sessions
      queryClient.invalidateQueries({ queryKey: ['/api/online-classes/teacher/sessions'] });
      if (selectedCourse) {
        queryClient.invalidateQueries({ queryKey: ['/api/online-classes/courses', selectedCourse.id, 'sessions'] });
      }
      
      // If join URL is provided, open it
      if (response?.joinUrl) {
        window.open(response.joinUrl, '_blank');
      }
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
    mutationFn: async (sessionId: number) => {
      const response = await apiRequest('POST', `/api/online-classes/sessions/${sessionId}/join`);
      return response.json();
    },
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

  // End session mutation
  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await apiRequest('POST', `/api/online-classes/sessions/${sessionId}/end`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Succès',
        description: t.sessionEnded
      });
      // Properly invalidate teacher sessions and course-specific sessions
      queryClient.invalidateQueries({ queryKey: ['/api/online-classes/teacher/sessions'] });
      if (selectedCourse) {
        queryClient.invalidateQueries({ queryKey: ['/api/online-classes/courses', selectedCourse.id, 'sessions'] });
      }
    },
    onError: () => {
      toast({
        title: t.error,
        description: 'Échec de la terminaison de la session',
        variant: "destructive"
      });
    }
  });

  // Handle selection completion
  const handleContinueSelection = () => {
    if (selectedClass && selectedSubject) {
      setStep('course-creation');
    } else {
      toast({
        title: language === 'fr' ? 'Sélection incomplète' : 'Incomplete selection',
        description: language === 'fr' ? 'Veuillez sélectionner une classe et une matière' : 'Please select a class and subject',
        variant: 'destructive'
      });
    }
  };

  // Handle course creation form submission
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const courseData = {
      title: String(formData.get('title') || ''),
      description: String(formData.get('description') || ''),
      language: language,
      maxParticipants: parseInt(String(formData.get('maxParticipants')) || '30'),
      allowRecording: Boolean(formData.get('allowRecording')),
      requireApproval: Boolean(formData.get('requireApproval'))
    };
    createCourseMutation.mutate(courseData);
  };

  const handleCreateSession = () => {
    if (!selectedCourse) return;
    
    createSessionMutation.mutate({
      courseId: selectedCourse.id,
      sessionData: newSessionData
    });
  };

  // Handle start session immediately
  const handleStartNow = useCallback(async () => {
    console.log('[TEACHER_ONLINE_CLASSES] Starting session immediately...');
    if (!selectedCourse) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez d\'abord créer un cours' : 'Please create a course first',
        variant: 'destructive'
      });
      return;
    }
    
    if (starting) return; // Prevent multiple clicks
    setStarting(true);

    try {
      console.log('[TEACHER_ONLINE_CLASSES] Creating session for course', selectedCourse.id);

      const response = await fetch(`/api/online-classes/courses/${selectedCourse.id}/sessions`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `Session - ${selectedCourse.title}`,
          description: `Session immédiate pour le cours ${selectedCourse.title}`,
          scheduledStart: new Date().toISOString(),
          startNow: true,
          maxDuration: 120,
          lobbyEnabled: true,
          chatEnabled: true,
          screenShareEnabled: true
        })
      });

      const text = await response.text();
      if (!response.ok) {
        console.error('[TEACHER_ONLINE_CLASSES] StartNow failed', response.status, text);
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: `${language === 'fr' ? 'Impossible de démarrer la session' : 'Could not start session'}: ${response.status}`,
          variant: 'destructive'
        });
        return;
      }

      const sessionData = JSON.parse(text);
      console.log('[TEACHER_ONLINE_CLASSES] Session created:', sessionData);

      // Invalidate caches for consistency
      queryClient.invalidateQueries({ queryKey: ['/api/online-classes/teacher/sessions'] });
      if (selectedCourse) {
        queryClient.invalidateQueries({ queryKey: ['/api/online-classes/courses', selectedCourse.id, 'sessions'] });
      }

      // Open Jitsi meeting room if join URL is provided
      if (sessionData.joinUrl) {
        console.log('[TEACHER_ONLINE_CLASSES] Opening Jitsi meeting room:', sessionData.joinUrl);
        
        const meetingWindow = window.open(sessionData.joinUrl, '_blank', 'noopener,noreferrer');
        
        if (!meetingWindow) {
          console.warn('[TEACHER_ONLINE_CLASSES] Pop-up blocked, redirecting in current tab');
          window.location.href = sessionData.joinUrl;
          return;
        }
        
        toast({
          title: language === 'fr' ? 'Classe démarrée !' : 'Class started!',
          description: language === 'fr' ? 
            `La salle de classe virtuelle est maintenant ouverte` :
            `Virtual classroom is now open`
        });
      } else {
        toast({
          title: language === 'fr' ? 'Session créée !' : 'Session created!',
          description: language === 'fr' ? 
            `Session "${sessionData.session?.title}" créée avec succès` :
            `Session "${sessionData.session?.title}" created successfully`
        });
      }

    } catch (error) {
      console.error('[TEACHER_ONLINE_CLASSES] handleStartNow error', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur inattendue lors du démarrage de la session' : 'Unexpected error starting session',
        variant: 'destructive'
      });
    } finally {
      setStarting(false);
    }
  }, [selectedCourse, language, toast, starting]);

  // Handle join session
  const handleJoinSession = useCallback(async (session: any) => {
    console.log('[TEACHER_ONLINE_CLASSES] Joining session:', session.id, session.roomName);
    
    try {
      const jwtResponse = await fetch(`/api/online-classes/sessions/${session.id}/join`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const jwtData = await jwtResponse.json();
      
      if (!jwtResponse.ok || !jwtData.joinUrl) {
        throw new Error(jwtData.error || 'Failed to generate join URL');
      }
      
      console.log('[TEACHER_ONLINE_CLASSES] Opening Jitsi meeting room:', jwtData.joinUrl);
      
      const meetingWindow = window.open(jwtData.joinUrl, '_blank', 'noopener,noreferrer');
      
      if (!meetingWindow) {
        window.location.href = jwtData.joinUrl;
        return;
      }
      
      toast({
        title: language === 'fr' ? 'Session rejointe !' : 'Session joined!',
        description: language === 'fr' ? 
          'La salle de classe virtuelle est maintenant ouverte' :
          'Virtual classroom is now open'
      });
      
    } catch (error: any) {
      console.error('[TEACHER_ONLINE_CLASSES] handleJoinSession error', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message || (language === 'fr' ? 
          'Erreur lors de la connexion à la session' : 
          'Error joining the session'),
        variant: 'destructive'
      });
    }
  }, [language, toast]);

  const handleStartSession = (sessionId: number) => {
    startSessionMutation.mutate(sessionId);
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

  // Handle independent course creation
  const handleContinueIndependent = () => {
    setIsIndependentCourse(true);
    setStep('course-creation');
  };

  // Render selection interface
  const renderSelection = () => (
    <div className="space-y-6">
      {/* Option 1: Independent Course - No class/school affiliation */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-6 h-6 text-green-600" />
            <span>{language === 'fr' ? 'Cours Indépendant' : 'Independent Course'}</span>
            <Badge className="bg-green-100 text-green-700 ml-2">
              {language === 'fr' ? 'Recommandé' : 'Recommended'}
            </Badge>
          </CardTitle>
          <CardDescription>
            {language === 'fr' 
              ? 'Créez votre propre cours sans être lié à une école. Invitez qui vous voulez.'
              : 'Create your own course without being tied to a school. Invite anyone you want.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleContinueIndependent}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            data-testid="button-create-independent-course"
          >
            <Plus className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Créer un Cours Indépendant' : 'Create Independent Course'}
          </Button>
        </CardContent>
      </Card>

      {/* Option 2: School-linked Course */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="w-6 h-6 text-purple-600" />
            <span>{language === 'fr' ? 'Cours lié à une École' : 'School-linked Course'}</span>
          </CardTitle>
          <CardDescription>
            {language === 'fr' 
              ? 'Créez un cours pour une classe spécifique d\'une école où vous enseignez.'
              : 'Create a course for a specific class at a school where you teach.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Class Selection */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4" />
              <span>{t.selectClass}</span>
            </Label>
            <Select value={selectedClass} onValueChange={(val) => { setSelectedClass(val); setSelectedSubject(''); setIsIndependentCourse(false); }}>
              <SelectTrigger data-testid="select-class">
                <SelectValue placeholder={t.selectClass} />
              </SelectTrigger>
              <SelectContent>
                {classesLoading ? (
                  <SelectItem value="loading" disabled>{t.loading}</SelectItem>
                ) : allClasses.length > 0 ? (
                  allClasses.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name} {cls.schoolName ? `(${cls.schoolName})` : ''}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-data" disabled>{t.noData}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Book className="w-4 h-4" />
              <span>{t.selectSubject}</span>
            </Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
              <SelectTrigger data-testid="select-subject">
                <SelectValue placeholder={!selectedClass ? (language === 'fr' ? 'Sélectionnez d\'abord une classe' : 'Select a class first') : t.selectSubject} />
              </SelectTrigger>
              <SelectContent>
                {classSubjects.length > 0 ? (
                  classSubjects.map((subject: any) => (
                    <SelectItem key={subject.id} value={subject.name}>
                      {subject.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-subjects" disabled>
                    {language === 'fr' ? 'Aucune matière assignée à cette classe' : 'No subjects assigned to this class'}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Continue Button */}
          <Button 
            onClick={handleContinueSelection}
            disabled={!selectedClass || !selectedSubject}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            data-testid="button-continue-selection"
          >
            <Play className="w-4 h-4 mr-2" />
            {t.continue}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // Render course creation form
  const renderCourseCreation = () => (
    <div className="space-y-6">
      <Card className={isIndependentCourse ? "border-2 border-green-200" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              {isIndependentCourse ? (
                <User className="w-6 h-6 text-green-600" />
              ) : (
                <Video className="w-6 h-6 text-purple-600" />
              )}
              <span>{isIndependentCourse 
                ? (language === 'fr' ? 'Créer un Cours Indépendant' : 'Create Independent Course')
                : t.createCourse
              }</span>
            </span>
            <Button variant="outline" onClick={() => { setStep('selection'); setIsIndependentCourse(false); }}>
              {t.back}
            </Button>
          </CardTitle>
          <CardDescription>
            {isIndependentCourse ? (
              language === 'fr' 
                ? 'Ce cours n\'est lié à aucune école. Vous pouvez inviter qui vous voulez.' 
                : 'This course is not linked to any school. You can invite anyone.'
            ) : (
              language === 'fr' ? 
                `Classe: ${selectedClassData?.name || ''} ${selectedClassData?.schoolName ? `(${selectedClassData.schoolName})` : ''} | Matière: ${selectedSubject || ''}` :
                `Class: ${selectedClassData?.name || ''} ${selectedClassData?.schoolName ? `(${selectedClassData.schoolName})` : ''} | Subject: ${selectedSubject || ''}`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <Label htmlFor="title">{t.courseTitle}</Label>
              <Input name="title" id="title" required data-testid="input-course-title" />
            </div>
            <div>
              <Label htmlFor="description">{t.courseDescription}</Label>
              <Textarea name="description" id="description" data-testid="input-course-description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxParticipants">{t.maxParticipants}</Label>
                <Input name="maxParticipants" id="maxParticipants" type="number" defaultValue="30" />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <input type="checkbox" name="allowRecording" id="allowRecording" defaultChecked className="rounded" />
                <Label htmlFor="allowRecording">{t.allowRecording}</Label>
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={createCourseMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              data-testid="button-create-course"
            >
              {createCourseMutation.isPending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'fr' ? 'Création...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {t.createCourse}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  // Render course management with immediate start option
  const renderCourseManagement = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span>{language === 'fr' ? 'Cours Créé !' : 'Course Created!'}</span>
            </span>
            <Button variant="outline" onClick={() => {
              setStep('selection');
              setSelectedCourse(null);
              setSelectedClass('');
              setSelectedSubject('');
            }}>
              {language === 'fr' ? 'Nouveau Cours' : 'New Course'}
            </Button>
          </CardTitle>
          <CardDescription>
            {selectedCourse ? 
              `${selectedCourse.title} - ${language === 'fr' ? 'Prêt pour vos sessions' : 'Ready for your sessions'}` :
              ''
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleStartNow}
              disabled={starting}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              data-testid="button-start-now"
            >
              {starting ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'fr' ? 'Démarrage...' : 'Starting...'}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  {t.startNow}
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowCreateSessionDialog(true)}
              data-testid="button-schedule-session"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {t.scheduleCourse}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCoursesList = () => (
    <div className="space-y-4">
      {coursesLoading ? (
        <div className="text-center py-8">{t.loading}</div>
      ) : !coursesData?.courses || coursesData.courses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">{t.noCourses}</div>
      ) : (
        coursesData.courses.map((course: OnlineCourse) => (
          <Card key={course.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{course.title}</h3>
                  <p className="text-sm text-gray-600">{course.description}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span>{course.className || ''}</span>
                    <span>{course.subjectName || ''}</span>
                    <span>{course.maxParticipants} {t.participants} max</span>
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
          </Card>
        ))
      )}
    </div>
  );

  const renderSessionsList = () => {
    const isLoading = sessionsLoading || schoolSessionsLoading;
    
    // Normalize status to lowercase for consistent UI comparisons
    const teacherSessions = (sessionsData?.sessions || []).map((s: ClassSession) => ({
      ...s,
      status: (s.status?.toLowerCase?.() || 'scheduled') as ClassSession['status'],
      creatorType: 'teacher' as const
    }));
    
    const schoolSessions = (schoolSessionsData?.sessions || []).map((s: ClassSession) => ({
      ...s,
      status: (s.status?.toLowerCase?.() || 'scheduled') as ClassSession['status'],
      creatorType: 'school' as const
    }));
    
    const allSessions = [...teacherSessions, ...schoolSessions].sort((a, b) => 
      new Date(b.scheduledStart).getTime() - new Date(a.scheduledStart).getTime()
    );

    return (
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8" data-testid="loading-sessions">{t.loading}</div>
        ) : allSessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500" data-testid="no-sessions">{t.noSessions}</div>
        ) : (
          allSessions.map((session: ClassSession) => (
            <Card key={`${session.creatorType}-${session.id}`} className="p-4" data-testid={`session-card-${session.id}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MonitorPlay className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold" data-testid={`session-title-${session.id}`}>{session.title}</h3>
                      <Badge 
                        className={session.creatorType === 'school' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}
                        data-testid={`session-creator-badge-${session.id}`}
                      >
                        {session.creatorType === 'school' ? t.schoolCreated : t.teacherCreated}
                      </Badge>
                    </div>
                    {session.description && (
                      <p className="text-sm text-gray-600" data-testid={`session-description-${session.id}`}>{session.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span data-testid={`session-date-${session.id}`}>
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {formatDate(session.scheduledStart)}
                      </span>
                      <span data-testid={`session-duration-${session.id}`}>
                        <Clock className="w-3 h-3 inline mr-1" />
                        {session.maxDuration}min
                      </span>
                      {session.className && (
                        <span className="font-medium" data-testid={`session-class-${session.id}`}>
                          <GraduationCap className="w-3 h-3 inline mr-1" />
                          {session.className}
                        </span>
                      )}
                      {session.subjectName && (
                        <span className="font-medium" data-testid={`session-subject-${session.id}`}>
                          <Book className="w-3 h-3 inline mr-1" />
                          {session.subjectName}
                        </span>
                      )}
                      {session.courseName && !session.className && (
                        <span className="font-medium" data-testid={`session-course-${session.id}`}>{session.courseName}</span>
                      )}
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
                        data-testid={`button-start-session-${session.id}`}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        {t.start}
                      </Button>
                    )}
                    {(session.status === 'live' || session.status === 'scheduled') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleJoinSession(session)}
                        disabled={joinSessionMutation.isPending}
                        data-testid={`button-join-session-${session.id}`}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        {t.join}
                      </Button>
                    )}
                    <Button size="sm" variant="outline" data-testid={`button-settings-session-${session.id}`}>
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    );
  };

  // Determine access permissions based on activation type
  const hasSchoolAccess = accessData?.activationType === 'school';
  // ✅ FIXED: Sandbox users (activationType null/undefined) AND teacher subscribers get personal access
  const isSandboxOrTest = accessData?.reason === 'sandbox_exemption' || accessData?.activationType === null;
  const hasPersonalSubscription = accessData?.activationType === 'teacher' || isSandboxOrTest;
  const canCreateCourses = hasPersonalSubscription; // Only personal subscribers can create courses
  const canViewSchoolSessions = hasSchoolAccess || hasPersonalSubscription; // Both can view school sessions
  
  // Debug log
  console.log('[TEACHER_ONLINE_CLASSES] Access check:', { 
    allowed: accessData?.allowed, 
    activationType: accessData?.activationType, 
    reason: accessData?.reason,
    hasPersonalSubscription,
    isSandboxOrTest
  });

  // Show loading state while checking access
  if (accessLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  // Show access denied / purchase interface if no access
  if (!accessData?.allowed) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{t.title}</h2>
              <p className="text-gray-600">{t.subtitle}</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="text-center mb-6">
              <Video className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'fr' ? 'Module Cours en Ligne Non Activé' : 'Online Classes Module Not Activated'}
              </h3>
              <p className="text-gray-700">
                {language === 'fr' 
                  ? accessData?.reason === 'no_school_activation' 
                    ? 'Votre école n\'a pas encore activé le module de cours en ligne. Vous pouvez acheter un accès personnel.'
                    : 'Votre accès aux cours en ligne est actuellement restreint. Contactez votre administrateur ou achetez un accès personnel.'
                  : accessData?.reason === 'no_school_activation'
                    ? 'Your school has not activated the online classes module. You can purchase personal access.'
                    : 'Your access to online classes is currently restricted. Contact your administrator or purchase personal access.'
                }
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              {/* Duration Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  {language === 'fr' ? 'Choisir la durée d\'abonnement' : 'Choose subscription duration'}
                </Label>
                <Select value={purchaseDuration} onValueChange={(value: any) => setPurchaseDuration(value)}>
                  <SelectTrigger data-testid="select-purchase-duration" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{getDurationLabel('daily')}</SelectItem>
                    <SelectItem value="weekly">{getDurationLabel('weekly')}</SelectItem>
                    <SelectItem value="monthly">{getDurationLabel('monthly')}</SelectItem>
                    <SelectItem value="quarterly">{getDurationLabel('quarterly')}</SelectItem>
                    <SelectItem value="semestral">{getDurationLabel('semestral')}</SelectItem>
                    <SelectItem value="yearly">{getDurationLabel('yearly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Display */}
              <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">
                    {language === 'fr' ? 'Prix' : 'Price'}
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {calculatePrice(purchaseDuration).toLocaleString('fr-FR')} CFA
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getDurationLabel(purchaseDuration)}
                  </p>
                </div>
              </div>

              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  console.log('[PAYMENT_DEBUG] Purchase button clicked, opening payment modal');
                  setIsPaymentOpen(true);
                }}
                data-testid="button-purchase-access"
              >
                {language === 'fr' 
                  ? `Acheter l'Accès (${calculatePrice(purchaseDuration).toLocaleString('fr-FR')} CFA)` 
                  : `Purchase Access (${calculatePrice(purchaseDuration).toLocaleString('fr-FR')} CFA)`
                }
              </Button>
            </div>
          </div>
        </Card>

        {/* Payment Modal - Required for purchase flow when no access */}
        <OnlineClassPayment
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          durationType={purchaseDuration}
          amount={calculatePrice(purchaseDuration)}
          language={language}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
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
          
          {/* HYBRID ACCESS: Personal subscription purchase button - always visible */}
          <Button
            variant="outline"
            className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
            onClick={() => setIsPaymentOpen(true)}
            data-testid="button-buy-personal-subscription"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {language === 'fr' ? 'Acheter Abonnement Personnel' : 'Buy Personal Subscription'}
          </Button>
        </div>
        
        {/* Access type indicator with subscription details */}
        {accessData?.activationType && (
          <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${
            accessData.subscriptionDetails?.isExpiringSoon 
              ? 'bg-orange-50 border border-orange-200' 
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <Info className={`w-4 h-4 mt-0.5 ${accessData.subscriptionDetails?.isExpiringSoon ? 'text-orange-600' : 'text-blue-600'}`} />
            <div className="flex-1">
              <p className={`text-sm ${accessData.subscriptionDetails?.isExpiringSoon ? 'text-orange-800' : 'text-blue-800'}`}>
                {accessData.activationType === 'school' 
                  ? (language === 'fr' ? '🏫 Accès fourni par votre école - Vous pouvez rejoindre les sessions assignées' : '🏫 Access provided by your school - You can join assigned sessions')
                  : accessData.activationType === 'teacher'
                    ? (language === 'fr' ? '👤 Abonnement personnel actif - Vous pouvez créer vos propres cours' : '👤 Personal subscription active - You can create your own courses')
                    : (language === 'fr' ? '✅ Accès complet actif' : '✅ Full access active')
                }
              </p>
              
              {/* Subscription details for personal subscription */}
              {accessData.activationType === 'teacher' && accessData.subscriptionDetails && (
                <div className={`mt-2 pt-2 border-t ${accessData.subscriptionDetails.isExpiringSoon ? 'border-orange-200' : 'border-blue-200'}`}>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <span className={accessData.subscriptionDetails.isExpiringSoon ? 'text-orange-700' : 'text-blue-700'}>
                      <strong>{language === 'fr' ? 'Durée:' : 'Duration:'}</strong> {accessData.subscriptionDetails.durationType}
                    </span>
                    <span className={accessData.subscriptionDetails.isExpiringSoon ? 'text-orange-700' : 'text-blue-700'}>
                      <strong>{language === 'fr' ? 'Expire:' : 'Expires:'}</strong> {new Date(accessData.subscriptionDetails.endDate).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className={`font-semibold ${accessData.subscriptionDetails.isExpiringSoon ? 'text-orange-800' : 'text-blue-800'}`}>
                      {accessData.subscriptionDetails.isExpiringSoon && '⚠️ '}
                      {accessData.subscriptionDetails.daysRemaining} {language === 'fr' ? 'jours restants' : 'days remaining'}
                    </span>
                  </div>
                  
                  {/* Countdown for expiring soon */}
                  {accessData.subscriptionDetails.isExpiringSoon && (
                    <div className="mt-2 p-2 bg-orange-100 rounded text-xs text-orange-900">
                      {language === 'fr' 
                        ? `⏰ Votre abonnement expire bientôt! Renouvelez avant le ${new Date(accessData.subscriptionDetails.endDate).toLocaleDateString('fr-FR')} pour continuer à créer des cours.`
                        : `⏰ Your subscription is expiring soon! Renew before ${new Date(accessData.subscriptionDetails.endDate).toLocaleDateString('en-US')} to continue creating courses.`
                      }
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* School-only access restriction notice */}
        {hasSchoolAccess && !hasPersonalSubscription && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-900 mb-1">
                  {language === 'fr' ? 'Accès limité' : 'Limited Access'}
                </h3>
                <p className="text-sm text-yellow-800 mb-2">
                  {language === 'fr' 
                    ? 'Avec l\'accès fourni par votre école, vous pouvez rejoindre les sessions assignées par le directeur. Pour créer vos propres cours en ligne, veuillez acheter un abonnement personnel.'
                    : 'With school-provided access, you can join sessions assigned by the director. To create your own online courses, please purchase a personal subscription.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* SCHOOL-ONLY ACCESS: Show tabbed interface with countdown and sessions */}
      {hasSchoolAccess && !hasPersonalSubscription && (
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-courses" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {t.myCoursesTab}
            </TabsTrigger>
            <TabsTrigger value="upcoming-sessions" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t.upcomingSessionsTab}
              {(schoolSessionsData?.sessions?.length || 0) > 0 && (
                <Badge className="ml-2 bg-purple-500 text-white" data-testid="school-sessions-count">
                  {schoolSessionsData.sessions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="create-course" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t.createCourseTab}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-courses" className="space-y-4">
            <Card className="p-6">
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium mb-2">
                  {language === 'fr' ? 'Pas de cours personnels' : 'No personal courses'}
                </p>
                <p className="text-sm">
                  {language === 'fr' 
                    ? 'Achetez un abonnement personnel pour créer vos propres cours'
                    : 'Purchase a personal subscription to create your own courses'
                  }
                </p>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="upcoming-sessions" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold">
                    {language === 'fr' ? 'Sessions Assignées par l\'École' : 'School-Assigned Sessions'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'fr' 
                      ? 'Rejoignez les cours en ligne programmés par votre école'
                      : 'Join online classes scheduled by your school'
                    }
                  </p>
                </div>
              </div>
              {renderSessionsList()}
            </Card>
          </TabsContent>
          
          <TabsContent value="create-course" className="space-y-4">
            <Card className="p-6">
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-orange-400" />
                <h3 className="font-semibold text-lg mb-2">
                  {language === 'fr' ? 'Abonnement Personnel Requis' : 'Personal Subscription Required'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {language === 'fr' 
                    ? 'Pour créer vos propres cours en ligne, vous devez acheter un abonnement personnel.'
                    : 'To create your own online courses, you need to purchase a personal subscription.'
                  }
                </p>
                <Button 
                  onClick={() => setIsPaymentOpen(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Acheter un Abonnement' : 'Buy Subscription'}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* PERSONAL SUBSCRIPTION: Full access - show all features */}
      {hasPersonalSubscription && (
        <>
          {/* Main Content with Enhanced Structure */}
          {step === 'selection' && renderSelection()}
          {step === 'course-creation' && renderCourseCreation()}
          {step === 'course-management' && renderCourseManagement()}
          
          {/* Tabbed Interface for existing courses */}
          {step === 'course-management' && (
            <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="my-courses" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {t.myCoursesTab}
                </TabsTrigger>
                <TabsTrigger value="upcoming-sessions" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t.upcomingSessionsTab}
                  {(schoolSessionsData?.sessions?.length || 0) > 0 && (
                    <Badge className="ml-2 bg-purple-500 text-white" data-testid="school-sessions-count">
                      {schoolSessionsData.sessions.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="create-course" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {t.createCourseTab}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="my-courses" className="space-y-4">
                {renderCoursesList()}
              </TabsContent>
              
              <TabsContent value="upcoming-sessions" className="space-y-4">
                {renderSessionsList()}
              </TabsContent>
              
              <TabsContent value="create-course" className="space-y-4">
                <Button 
                  onClick={() => {
                    setStep('selection');
                    setSelectedCourse(null);
                    setSelectedClass('');
                    setSelectedSubject('');
                  }}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  data-testid="button-start-create-course"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Créer un Nouveau Cours' : 'Create New Course'}
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </>
      )}


      {/* Create Session Dialog */}
      <Dialog open={showCreateSessionDialog} onOpenChange={setShowCreateSessionDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.createSession}</DialogTitle>
            <DialogDescription>
              {language === 'fr' ? 
                `Programmer une nouvelle session pour "${selectedCourse?.title}"` :
                `Schedule a new session for "${selectedCourse?.title}"`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sessionTitle">{t.sessionTitle}</Label>
              <Input
                id="sessionTitle"
                value={newSessionData.title}
                onChange={(e) => setNewSessionData({...newSessionData, title: e.target.value})}
                placeholder={language === 'fr' ? "Ex: Leçon 1 - Introduction aux fractions" : "Ex: Lesson 1 - Introduction to fractions"}
              />
            </div>
            <div>
              <Label htmlFor="sessionDesc">{t.sessionDescription}</Label>
              <Textarea
                id="sessionDesc"
                value={newSessionData.description}
                onChange={(e) => setNewSessionData({...newSessionData, description: e.target.value})}
                placeholder={language === 'fr' ? "Contenu de la session..." : "Session content..."}
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

      {/* Payment Modal */}
      <OnlineClassPayment
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        durationType={purchaseDuration}
        amount={calculatePrice(purchaseDuration)}
        language={language}
      />
    </div>
  );
};

export default TeacherOnlineClasses;
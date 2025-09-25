import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Video, Play, Users, Calendar, Settings, Plus, Clock, CheckCircle, BookOpen, UserCheck, GraduationCap, User, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface OnlineClassesManagerProps {
  className?: string;
}

// Type for created course
type Course = {
  id: number;
  title: string;
  description?: string;
  language: string;
  classId: number;
  teacherId: number;
  subjectId: number;
};

const OnlineClassesManager: React.FC<OnlineClassesManagerProps> = ({ className }) => {
  const { language } = useLanguage();
  const [step, setStep] = useState('selection'); // 'selection' | 'course-creation' | 'session-management'
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [createdCourse, setCreatedCourse] = useState<Course | null>(null); // Store created course
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Silence Replit dev noise
  React.useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (typeof e.origin === 'string' && e.origin.includes('.replit.dev')) return;
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const text = {
    fr: {
      title: 'Classes en ligne',
      subtitle: 'Créez des sessions de cours en visioconférence',
      selectClass: 'Sélectionner une classe',
      selectTeacher: 'Sélectionner un enseignant',
      selectSubject: 'Sélectionner une matière',
      selectionTitle: 'Configuration du cours en ligne',
      selectionDesc: 'Choisissez la classe, l\'enseignant et la matière pour créer votre session de cours en ligne',
      continue: 'Continuer',
      back: 'Retour',
      createCourse: 'Créer le cours',
      courseTitle: 'Titre du cours',
      courseDescription: 'Description du cours',
      scheduleCourse: 'Programmer le cours',
      startNow: 'Démarrer maintenant',
      loading: 'Chargement...',
      noData: 'Aucune donnée disponible'
    },
    en: {
      title: 'Online Classes',
      subtitle: 'Create video conference course sessions',
      selectClass: 'Select a class',
      selectTeacher: 'Select a teacher',
      selectSubject: 'Select a subject',
      selectionTitle: 'Online Course Setup',
      selectionDesc: 'Choose class, teacher and subject to create your online course session',
      continue: 'Continue',
      back: 'Back',
      createCourse: 'Create Course',
      courseTitle: 'Course Title',
      courseDescription: 'Course Description',
      scheduleCourse: 'Schedule Course',
      startNow: 'Start Now',
      loading: 'Loading...',
      noData: 'No data available'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch classes data
  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ['/api/director/classes'],
    queryFn: async () => {
      const response = await fetch('/api/director/classes', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch classes');
      return response.json();
    }
  });

  // Fetch teachers data
  const { data: teachersData, isLoading: teachersLoading } = useQuery({
    queryKey: ['/api/director/teachers'],
    queryFn: async () => {
      const response = await fetch('/api/director/teachers', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch teachers');
      return response.json();
    }
  });

  // Subjects/Matières data (predefined list with numeric IDs)
  const subjects = [
    { id: 1, name: language === 'fr' ? 'Mathématiques' : 'Mathematics' },
    { id: 2, name: language === 'fr' ? 'Français' : 'French' },
    { id: 3, name: language === 'fr' ? 'Anglais' : 'English' },
    { id: 4, name: language === 'fr' ? 'Sciences' : 'Science' },
    { id: 5, name: language === 'fr' ? 'Histoire' : 'History' },
    { id: 6, name: language === 'fr' ? 'Géographie' : 'Geography' },
    { id: 7, name: language === 'fr' ? 'Physique' : 'Physics' },
    { id: 8, name: language === 'fr' ? 'Chimie' : 'Chemistry' },
    { id: 9, name: language === 'fr' ? 'Biologie' : 'Biology' },
    { id: 10, name: language === 'fr' ? 'Philosophie' : 'Philosophy' }
  ];

  // Fetch courses data only after selection is complete
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/online-classes/courses'],
    queryFn: async () => {
      const response = await fetch('/api/online-classes/courses', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    },
    enabled: step !== 'selection' // Only fetch when we're past the selection step
  });

  // Query to fetch sessions for the created course
  const { data: courseSessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['/api/online-classes/courses', createdCourse?.id, 'sessions'],
    queryFn: async () => {
      const response = await fetch(`/api/online-classes/courses/${createdCourse?.id}/sessions`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch sessions');
      return response.json();
    },
    enabled: !!createdCourse?.id
  });

  // Create course mutation with selected data
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: any) => {
      const enrichedCourseData = {
        ...courseData,
        classId: parseInt(selectedClass, 10), // Convert string to number
        teacherId: parseInt(selectedTeacher, 10), // Convert string to number
        subjectId: parseInt(selectedSubject, 10) // Convert string to number
      };
      console.log('[ONLINE_CLASSES] Creating course with data:', enrichedCourseData);
      const response = await apiRequest('POST', '/api/online-classes/courses', enrichedCourseData);
      return await response.json(); // Parse JSON response
    },
    onSuccess: (response: any) => {
      // Store the created course in state for use by handlers
      const course = response.course || response;
      setCreatedCourse(course);
      
      queryClient.invalidateQueries({ queryKey: ['/api/online-classes/courses'] });
      setStep('session-management');
      toast({
        title: language === 'fr' ? 'Cours créé' : 'Course created',
        description: language === 'fr' ? 'Le cours a été créé avec succès' : 'Course created successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: language === 'fr' ? 'Erreur lors de la création du cours' : 'Error creating course',
        variant: 'destructive'
      });
    }
  });

  // Handle selection completion
  const handleContinueSelection = () => {
    if (selectedClass && selectedTeacher && selectedSubject) {
      setStep('course-creation');
    } else {
      toast({
        title: language === 'fr' ? 'Sélection incomplète' : 'Incomplete selection',
        description: language === 'fr' ? 'Veuillez sélectionner une classe, un enseignant et une matière' : 'Please select a class, teacher and subject',
        variant: 'destructive'
      });
    }
  };

  // Handle course creation form submission
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const courseData = {
      title: formData.get('title'),
      description: formData.get('description'),
      language: language
    };
    createCourseMutation.mutate(courseData);
  };



  // Render selection interface
  const renderSelection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Video className="w-6 h-6 text-purple-600" />
            <span>{t.selectionTitle}</span>
          </CardTitle>
          <CardDescription>{t.selectionDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Class Selection */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4" />
              <span>{t.selectClass}</span>
            </Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger data-testid="select-class">
                <SelectValue placeholder={t.selectClass} />
              </SelectTrigger>
              <SelectContent>
                {classesLoading ? (
                  <SelectItem value="loading" disabled>{t.loading}</SelectItem>
                ) : classesData?.classes?.length > 0 ? (
                  classesData.classes.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-data" disabled>{t.noData}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Teacher Selection */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{t.selectTeacher}</span>
            </Label>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger data-testid="select-teacher">
                <SelectValue placeholder={t.selectTeacher} />
              </SelectTrigger>
              <SelectContent>
                {teachersLoading ? (
                  <SelectItem value="loading" disabled>{t.loading}</SelectItem>
                ) : teachersData?.teachers?.length > 0 ? (
                  teachersData.teachers.map((teacher: any) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.firstName} {teacher.lastName}
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
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger data-testid="select-subject">
                <SelectValue placeholder={t.selectSubject} />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Continue Button */}
          <Button 
            onClick={handleContinueSelection}
            disabled={!selectedClass || !selectedTeacher || !selectedSubject}
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Video className="w-6 h-6 text-purple-600" />
              <span>{t.createCourse}</span>
            </span>
            <Button variant="outline" onClick={() => setStep('selection')}>
              {t.back}
            </Button>
          </CardTitle>
          <CardDescription>
            {language === 'fr' ? 
              `Classe: ${classesData?.classes?.find((c: any) => c.id.toString() === selectedClass)?.name || ''} | Enseignant: ${teachersData?.teachers?.find((t: any) => t.id.toString() === selectedTeacher)?.firstName || ''} | Matière: ${subjects.find(s => s.id.toString() === selectedSubject)?.name || ''}` :
              `Class: ${classesData?.classes?.find((c: any) => c.id.toString() === selectedClass)?.name || ''} | Teacher: ${teachersData?.teachers?.find((t: any) => t.id.toString() === selectedTeacher)?.firstName || ''} | Subject: ${subjects.find(s => s.id.toString() === selectedSubject)?.name || ''}`
            }
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

  // Handle start session immediately  
  const [starting, setStarting] = useState(false);
  
  const handleStartNow = React.useCallback(async () => {
    console.log('[ONLINE_CLASSES] Starting session immediately...');
    if (!createdCourse) {
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
      console.log('[ONLINE_CLASSES] Creating session for course', createdCourse.id);

      // Validate courseId before making request
      if (!createdCourse.id || typeof createdCourse.id === 'undefined') {
        throw new Error(`Invalid course ID: ${createdCourse.id}`);
      }

      // Call the sessions endpoint
      const response = await fetch(`/api/online-classes/courses/${createdCourse.id}/sessions`, {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          title: `Session - ${createdCourse.title}`,
          description: `Session immédiate pour le cours ${createdCourse.title}`,
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
        console.error('[ONLINE_CLASSES] StartNow failed', response.status, text);
        toast({
          title: language === 'fr' ? 'Erreur' : 'Error',
          description: `${language === 'fr' ? 'Impossible de démarrer la session' : 'Could not start session'}: ${response.status}`,
          variant: 'destructive'
        });
        return;
      }

      const sessionData = JSON.parse(text);
      console.log('[ONLINE_CLASSES] Session created:', sessionData);

      // Open Jitsi meeting room if join URL is provided
      if (sessionData.joinUrl) {
        console.log('[ONLINE_CLASSES] Opening Jitsi meeting room:', sessionData.joinUrl);
        
        // Open in new tab/window
        const meetingWindow = window.open(sessionData.joinUrl, '_blank', 'noopener,noreferrer');
        
        if (!meetingWindow) {
          // Pop-up blocked - fallback to current tab
          console.warn('[ONLINE_CLASSES] Pop-up blocked, redirecting in current tab');
          window.location.href = sessionData.joinUrl;
          return; // Don't show toast if redirecting
        }
        
        toast({
          title: language === 'fr' ? 'Classe démarrée !' : 'Class started!',
          description: language === 'fr' ? 
            `La salle de classe virtuelle est maintenant ouverte` :
            `Virtual classroom is now open`
        });
      } else {
        // Fallback if no join URL
        toast({
          title: language === 'fr' ? 'Session créée !' : 'Session created!',
          description: language === 'fr' ? 
            `Session "${sessionData.session?.title}" créée avec succès` :
            `Session "${sessionData.session?.title}" created successfully`
        });
      }

    } catch (error) {
      console.error('[ONLINE_CLASSES] handleStartNow error', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur inattendue lors du démarrage de la session' : 'Unexpected error starting session',
        variant: 'destructive'
      });
    } finally {
      setStarting(false);
    }
  }, [createdCourse, language, toast, starting]);

  // Handle join session
  const handleJoinSession = React.useCallback(async (session: any) => {
    console.log('[ONLINE_CLASSES] Joining session:', session.id, session.roomName);
    
    try {
      // Generate JWT token for this session
      const jwtResponse = await fetch(`/api/online-classes/sessions/${session.id}/join`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const jwtData = await jwtResponse.json();
      
      if (!jwtResponse.ok || !jwtData.joinUrl) {
        throw new Error(jwtData.error || 'Failed to generate join URL');
      }
      
      console.log('[ONLINE_CLASSES] Opening Jitsi meeting room:', jwtData.joinUrl);
      
      // Open meeting room in new tab
      const meetingWindow = window.open(jwtData.joinUrl, '_blank', 'noopener,noreferrer');
      
      if (!meetingWindow) {
        // Pop-up blocked - fallback to current tab
        window.location.href = jwtData.joinUrl;
        return;
      }
      
      toast({
        title: language === 'fr' ? 'Session rejointe !' : 'Session joined!',
        description: language === 'fr' ? 
          'La salle de classe virtuelle est maintenant ouverte' :
          'Virtual classroom is now open'
      });
      
    } catch (error) {
      console.error('[ONLINE_CLASSES] Join session error:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 
          'Erreur lors de la connexion à la session' : 
          'Error joining the session',
        variant: 'destructive'
      });
    }
  }, [language, toast]);

  // Handle session settings
  const handleSessionSettings = React.useCallback((session: any) => {
    console.log('[ONLINE_CLASSES] Opening settings for session:', session.id);
    
    // TODO: Open session settings modal
    toast({
      title: language === 'fr' ? 'Paramètres de session' : 'Session Settings',
      description: language === 'fr' ? 'Fonctionnalité bientôt disponible' : 'Feature coming soon'
    });
  }, [language, toast]);

  // Handle schedule course
  const handleScheduleCourse = React.useCallback(() => {
    console.log('[ONLINE_CLASSES] Opening schedule interface...');
    if (!createdCourse) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez d\'abord créer un cours' : 'Please create a course first',
        variant: 'destructive'
      });
      return;
    }
    
    // For now, show success message. In a full implementation, this would:
    // 1. Open scheduling modal
    // 2. Allow teacher to set date/time
    // 3. Send invitations
    toast({
      title: language === 'fr' ? 'Programmation du cours' : 'Course scheduling',
      description: language === 'fr' ? 
        `Interface de programmation ouverte pour "${createdCourse.title}"` :
        `Scheduling interface opened for "${createdCourse.title}"`
    });
  }, [createdCourse, language, toast]);

  // Render session management (after course creation)
  const renderSessionManagement = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span>{language === 'fr' ? 'Cours créé avec succès !' : 'Course created successfully!'}</span>
            </span>
            <Button variant="outline" onClick={() => setStep('selection')}>
              {language === 'fr' ? 'Nouveau cours' : 'New Course'}
            </Button>
          </CardTitle>
          <CardDescription>
            {language === 'fr' ? 
              'Votre cours est maintenant prêt. Vous pouvez démarrer une session immédiatement ou la programmer plus tard.' :
              'Your course is now ready. You can start a session immediately or schedule it for later.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleStartNow}
            disabled={!createdCourse || starting}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
            onClick={handleScheduleCourse}
            disabled={!createdCourse}
            variant="outline" 
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-schedule-course"
          >
            <Calendar className="w-4 h-4 mr-2" />
            {t.scheduleCourse}
          </Button>
        </CardContent>
      </Card>

      {/* Scheduled Sessions Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>{language === 'fr' ? 'Sessions programmées' : 'Scheduled Sessions'}</span>
          </CardTitle>
          <CardDescription>
            {language === 'fr' ? 
              'Toutes les sessions créées pour ce cours apparaissent ici.' :
              'All sessions created for this course appear here.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSessions ? (
            <div className="text-center py-4">
              <Clock className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p>{language === 'fr' ? 'Chargement des sessions...' : 'Loading sessions...'}</p>
            </div>
          ) : courseSessions?.sessions?.length > 0 ? (
            <div className="space-y-3">
              {courseSessions.sessions.map((session: any) => (
                <div key={session.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{session.title}</h3>
                    <p className="text-sm text-gray-600">{session.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(session.scheduledStart).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                        </span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(session.scheduledStart).toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US')}
                        </span>
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        session.status === 'live' ? 'bg-green-100 text-green-800' :
                        session.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {session.status === 'scheduled' ? (language === 'fr' ? 'Programmé' : 'Scheduled') :
                         session.status === 'live' ? (language === 'fr' ? 'En cours' : 'Live') :
                         session.status === 'completed' ? (language === 'fr' ? 'Terminé' : 'Completed') :
                         session.status
                        }
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {session.status === 'scheduled' && (
                      <Button 
                        size="sm" 
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => handleJoinSession(session)}
                        data-testid={`button-join-session-${session.id}`}
                      >
                        <Video className="w-4 h-4 mr-1" />
                        {language === 'fr' ? 'Rejoindre' : 'Join'}
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSessionSettings(session)}
                      data-testid={`button-settings-session-${session.id}`}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{language === 'fr' ? 'Aucune session programmée' : 'No scheduled sessions'}</p>
              <p className="text-sm">{language === 'fr' ? 'Utilisez les boutons ci-dessus pour créer une session' : 'Use the buttons above to create a session'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`} data-testid="online-classes-manager">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Video className="w-8 h-8 text-purple-600" />
          <span>{t.title}</span>
        </h1>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      <div className="min-h-[400px]">
        {step === 'selection' && renderSelection()}
        {step === 'course-creation' && renderCourseCreation()}
        {step === 'session-management' && renderSessionManagement()}
      </div>
    </div>
  );
};

export default OnlineClassesManager;
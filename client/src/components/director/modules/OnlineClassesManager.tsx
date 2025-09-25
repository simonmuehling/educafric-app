import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Video, Play, Users, Calendar, Settings, Plus, Clock, CheckCircle, BookOpen, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface OnlineClassesManagerProps {
  className?: string;
}

const OnlineClassesManager: React.FC<OnlineClassesManagerProps> = ({ className }) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const text = {
    fr: {
      title: 'Classes en ligne',
      subtitle: 'Gestion complète des sessions de visioconférence éducatives',
      overview: 'Vue d\'ensemble',
      create: 'Créer une session',
      manage: 'Gérer les sessions',
      settings: 'Paramètres',
      welcomeTitle: 'Bienvenue dans le module Classes en ligne',
      welcomeDesc: 'Créez et gérez des sessions de cours en visioconférence avec une technologie moderne. Interface sécurisée et optimisée pour l\'éducation.',
      features: {
        unlimited: 'Sessions illimitées',
        secure: 'Connexions sécurisées',
        recording: 'Enregistrement intégré',
        attendance: 'Suivi de présence',
        bilingual: 'Interface bilingue',
        support: 'Support 24/7'
      },
      createSession: 'Créer une nouvelle session',
      noSessions: 'Aucune session active',
      comingSoon: 'Fonctionnalités complètes bientôt disponibles'
    },
    en: {
      title: 'Online Classes',
      subtitle: 'Complete management of educational video conference sessions',
      overview: 'Overview',
      create: 'Create session',
      manage: 'Manage sessions',
      settings: 'Settings',
      welcomeTitle: 'Welcome to Online Classes Module',
      welcomeDesc: 'Create and manage video conference course sessions with modern technology. Secure and education-optimized interface.',
      features: {
        unlimited: 'Unlimited sessions',
        secure: 'Secure connections',
        recording: 'Integrated recording',
        attendance: 'Attendance tracking',
        bilingual: 'Bilingual interface',
        support: '24/7 Support'
      },
      createSession: 'Create new session',
      noSessions: 'No active sessions',
      comingSoon: 'Complete features coming soon'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch courses data
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/online-classes/courses'],
    queryFn: async () => {
      const response = await fetch('/api/online-classes/courses', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    }
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: any) => {
      return apiRequest('/api/online-classes/courses', 'POST', courseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/online-classes/courses'] });
      setShowCreateCourse(false);
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

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async ({ courseId, sessionData }: { courseId: number, sessionData: any }) => {
      return apiRequest(`/api/online-classes/courses/${courseId}/sessions`, 'POST', sessionData);
    },
    onSuccess: () => {
      setShowCreateSession(false);
      toast({
        title: language === 'fr' ? 'Session créée' : 'Session created',
        description: language === 'fr' ? 'La session a été créée avec succès' : 'Session created successfully'
      });
    }
  });

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const courseData = {
      title: formData.get('title'),
      description: formData.get('description'),
      language: language,
      maxParticipants: 50,
      allowRecording: true,
      requireApproval: false
    };
    createCourseMutation.mutate(courseData);
  };

  const handleCreateSession = (e: React.FormEvent, courseId: number) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const now = new Date();
    const sessionData = {
      title: formData.get('title'),
      description: formData.get('description'),
      scheduledStart: new Date(now.getTime() + 5 * 60000).toISOString(), // Start in 5 minutes
      maxDuration: 120,
      lobbyEnabled: true,
      chatEnabled: true,
      screenShareEnabled: true
    };
    createSessionMutation.mutate({ courseId, sessionData });
  };

  const features = [
    {
      icon: <Video className="w-6 h-6" />,
      title: t.features.unlimited,
      color: 'bg-blue-500'
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: t.features.secure,
      color: 'bg-green-500'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: t.features.recording,
      color: 'bg-purple-500'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: t.features.attendance,
      color: 'bg-orange-500'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Video className="w-6 h-6 text-purple-600" />
            <span>{t.welcomeTitle}</span>
          </CardTitle>
          <CardDescription>{t.welcomeDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-4 rounded-lg bg-gray-50">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center text-white mx-auto mb-2`}>
                  {feature.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{feature.title}</span>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => setShowCreateCourse(true)}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Créer un cours' : 'Create Course'}
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setActiveTab('settings')}>
              <Settings className="w-4 h-4 mr-2" />
              {t.settings}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{language === 'fr' ? 'Mes cours' : 'My Courses'}</span>
            <Button variant="outline" size="sm" onClick={() => setShowCreateCourse(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Nouveau' : 'New'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coursesLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{language === 'fr' ? 'Chargement...' : 'Loading...'}</p>
            </div>
          ) : coursesData?.courses?.length > 0 ? (
            <div className="grid gap-4">
              {coursesData.courses.map((course: any) => (
                <div key={course.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{course.title}</h3>
                        <p className="text-sm text-gray-500">{course.description}</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setActiveTab('create');
                        // Set course ID for session creation
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {language === 'fr' ? 'Session' : 'Session'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{language === 'fr' ? 'Aucun cours créé' : 'No courses created'}</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => setShowCreateCourse(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Créer votre premier cours' : 'Create your first course'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderCreateCourseModal = () => {
    if (!showCreateCourse) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">
            {language === 'fr' ? 'Créer un nouveau cours' : 'Create New Course'}
          </h3>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <Label htmlFor="title">{language === 'fr' ? 'Titre du cours' : 'Course Title'}</Label>
              <Input name="title" id="title" required />
            </div>
            <div>
              <Label htmlFor="description">{language === 'fr' ? 'Description' : 'Description'}</Label>
              <Textarea name="description" id="description" />
            </div>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateCourse(false)}
                className="flex-1"
              >
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
              <Button 
                type="submit" 
                disabled={createCourseMutation.isPending}
                className="flex-1"
              >
                {createCourseMutation.isPending 
                  ? (language === 'fr' ? 'Création...' : 'Creating...') 
                  : (language === 'fr' ? 'Créer' : 'Create')
                }
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Video className="w-8 h-8 text-purple-600" />
            <span>{t.title}</span>
          </h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>

        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'overview', label: t.overview, icon: <Video className="w-4 h-4" /> },
            { id: 'create', label: t.create, icon: <Plus className="w-4 h-4" /> },
            { id: 'manage', label: t.manage, icon: <Calendar className="w-4 h-4" /> },
            { id: 'settings', label: t.settings, icon: <Settings className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'create' && (
          <Card>
            <CardHeader>
              <CardTitle>{language === 'fr' ? 'Créer une session de cours' : 'Create Course Session'}</CardTitle>
              <CardDescription>
                {language === 'fr' 
                  ? 'Créez une nouvelle session de visioconférence pour vos élèves'
                  : 'Create a new video conference session for your students'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {coursesData?.courses?.length > 0 ? (
                <div className="space-y-4">
                  {coursesData.courses.map((course: any) => (
                    <div key={course.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{course.title}</h3>
                          <p className="text-sm text-gray-500">{course.description}</p>
                        </div>
                        <Button
                          onClick={() => {
                            const sessionData = {
                              title: `Session ${course.title}`,
                              description: `Session de cours pour ${course.title}`,
                            };
                            createSessionMutation.mutate({ 
                              courseId: course.id, 
                              sessionData 
                            });
                          }}
                          disabled={createSessionMutation.isPending}
                        >
                          <Video className="w-4 h-4 mr-2" />
                          {createSessionMutation.isPending 
                            ? (language === 'fr' ? 'Création...' : 'Creating...') 
                            : (language === 'fr' ? 'Créer session' : 'Create Session')
                          }
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{language === 'fr' ? 'Créez d\'abord un cours pour organiser des sessions' : 'Create a course first to organize sessions'}</p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => {
                      setActiveTab('overview');
                      setShowCreateCourse(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Créer un cours' : 'Create Course'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {activeTab === 'manage' && (
          <Card>
            <CardHeader>
              <CardTitle>{language === 'fr' ? 'Gestion des sessions' : 'Session Management'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{language === 'fr' ? 'Gestion avancée des sessions - Fonctionnalité en développement' : 'Advanced session management - Feature in development'}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <CardTitle>{language === 'fr' ? 'Paramètres des classes en ligne' : 'Online Classes Settings'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      {language === 'fr' ? 'Visioconférence configurée' : 'Video conferencing configured'}
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    {language === 'fr' 
                      ? 'Domain: meet.educafric.com - Prêt pour les visioconférences sécurisées'
                      : 'Domain: meet.educafric.com - Ready for secure video conferences'
                    }
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">{language === 'fr' ? 'Fonctionnalités activées' : 'Enabled Features'}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      language === 'fr' ? 'Sessions illimitées' : 'Unlimited sessions',
                      language === 'fr' ? 'Enregistrement' : 'Recording',
                      language === 'fr' ? 'Partage d\'écran' : 'Screen sharing',
                      language === 'fr' ? 'Chat intégré' : 'Integrated chat',
                      language === 'fr' ? 'Salle d\'attente' : 'Waiting room',
                      language === 'fr' ? 'Contrôle modérateur' : 'Moderator control'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {renderCreateCourseModal()}
    </div>
  );
};

export default OnlineClassesManager;
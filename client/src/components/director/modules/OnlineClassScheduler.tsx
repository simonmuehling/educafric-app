import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, queryClient as globalQueryClient } from '@/lib/queryClient';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Trash2,
  Pause,
  Play,
  Users,
  BookOpen,
  Loader2,
  AlertCircle,
  CalendarDays,
  Repeat
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface OnlineCourse {
  id: number;
  title: string;
  teacherId: number;
  teacherName?: string;
  classId?: number;
  className?: string;
  subjectId?: number;
  subjectName?: string;
}

interface OnlineClassSession {
  id: number;
  courseId: number;
  courseName?: string;
  teacherId: number;
  teacherName?: string;
  classId?: number;
  className?: string;
  subjectId?: number;
  subjectName?: string;
  title: string;
  description?: string;
  scheduledStart: string;
  durationMinutes: number;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  creatorType: 'school' | 'teacher';
  recurrenceId?: number;
}

interface RecurrenceRule {
  id: number;
  courseId: number;
  courseName?: string;
  teacherId: number;
  teacherName?: string;
  classId?: number;
  className?: string;
  title: string;
  ruleType: 'daily' | 'weekly' | 'biweekly' | 'custom';
  interval: number;
  byDay?: string[];
  startTime: string;
  durationMinutes: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  pausedAt?: string;
  pauseReason?: string;
  generatedCount: number;
  lastGenerated?: string;
}

interface CoursesResponse {
  courses: OnlineCourse[];
}

interface SessionsResponse {
  sessions: OnlineClassSession[];
}

interface RecurrencesResponse {
  recurrences: RecurrenceRule[];
}

const sessionFormSchema = z.object({
  courseId: z.string().min(1, 'Course is required'),
  classId: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  scheduledStart: z.string().min(1, 'Scheduled start is required'),
  durationMinutes: z.coerce.number().min(15, 'Duration must be at least 15 minutes').max(240, 'Duration cannot exceed 240 minutes'),
  autoNotify: z.boolean().default(true)
});

const recurrenceFormSchema = z.object({
  courseId: z.string().min(1, 'Course is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  ruleType: z.enum(['daily', 'weekly', 'biweekly', 'custom']),
  interval: z.coerce.number().min(1),
  byDay: z.array(z.string()).optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format'),
  durationMinutes: z.coerce.number().min(15, 'Duration must be at least 15 minutes').max(240, 'Duration cannot exceed 240 minutes'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  autoNotify: z.boolean().default(true)
}).refine((data) => {
  if (data.ruleType !== 'daily' && (!data.byDay || data.byDay.length === 0)) {
    return false;
  }
  return true;
}, {
  message: 'Please select at least one day of the week for non-daily recurrence',
  path: ['byDay']
});

type SessionFormValues = z.infer<typeof sessionFormSchema>;
type RecurrenceFormValues = z.infer<typeof recurrenceFormSchema>;

const OnlineClassScheduler: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'sessions' | 'create-session' | 'recurrences' | 'create-recurrence' | 'calendar'>('sessions');

  const sessionForm = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      courseId: '',
      classId: '',
      title: '',
      description: '',
      scheduledStart: '',
      durationMinutes: 120,
      autoNotify: true
    }
  });

  const recurrenceForm = useForm<RecurrenceFormValues>({
    resolver: zodResolver(recurrenceFormSchema),
    defaultValues: {
      courseId: '',
      title: '',
      description: '',
      ruleType: 'weekly',
      interval: 1,
      byDay: [],
      startTime: '08:00',
      durationMinutes: 120,
      startDate: '',
      endDate: '',
      autoNotify: true
    }
  });

  const translations = {
    fr: {
      title: "Planification des Sessions en Ligne",
      subtitle: "Gérez les sessions de cours en ligne de votre école",
      description: "Planifiez des sessions individuelles ou créez des règles de récurrence pour générer automatiquement les sessions",
      tabs: {
        sessions: "Sessions Planifiées",
        createSession: "Créer une Session",
        recurrences: "Règles de Récurrence",
        createRecurrence: "Créer une Règle",
        calendar: "Calendrier"
      },
      sessions: {
        title: "Sessions Planifiées",
        noSessions: "Aucune session planifiée",
        status: {
          scheduled: "Planifiée",
          live: "En cours",
          ended: "Terminée",
          cancelled: "Annulée"
        },
        creatorType: {
          school: "École",
          teacher: "Enseignant"
        },
        cancel: "Annuler",
        cancelConfirm: "Êtes-vous sûr de vouloir annuler cette session ?",
        cancelSuccess: "Session annulée avec succès",
        cancelError: "Erreur lors de l'annulation de la session"
      },
      createSession: {
        title: "Créer une Session",
        selectCourse: "Sélectionner un cours",
        selectClass: "Sélectionner une classe (optionnel)",
        selectClassPlaceholder: "Sélectionner une classe pour notifier les élèves/parents",
        sessionTitle: "Titre de la session",
        description: "Description",
        scheduledStart: "Date et heure de début",
        durationMinutes: "Durée (minutes)",
        autoNotify: "Notifier automatiquement les élèves et parents",
        submit: "Créer la session",
        cancel: "Annuler",
        success: "Session créée avec succès",
        error: "Erreur lors de la création de la session"
      },
      recurrences: {
        title: "Règles de Récurrence",
        noRecurrences: "Aucune règle de récurrence",
        ruleType: {
          daily: "Quotidien",
          weekly: "Hebdomadaire",
          biweekly: "Bi-hebdomadaire",
          custom: "Personnalisé"
        },
        status: {
          active: "Active",
          paused: "En pause"
        },
        pause: "Mettre en pause",
        resume: "Reprendre",
        edit: "Modifier",
        delete: "Supprimer",
        pauseSuccess: "Règle mise en pause",
        resumeSuccess: "Règle reprise",
        deleteSuccess: "Règle supprimée",
        deleteConfirm: "Êtes-vous sûr de vouloir supprimer cette règle ?",
        generatedCount: "Sessions générées",
        lastGenerated: "Dernière génération"
      },
      createRecurrence: {
        title: "Créer une Règle de Récurrence",
        selectCourse: "Sélectionner un cours",
        ruleTitle: "Titre de la règle",
        description: "Description",
        ruleType: "Type de récurrence",
        interval: "Intervalle",
        byDay: "Jours de la semaine",
        startTime: "Heure de début",
        durationMinutes: "Durée (minutes)",
        startDate: "Date de début",
        endDate: "Date de fin (optionnel)",
        autoNotify: "Notifier automatiquement",
        days: {
          monday: "Lundi",
          tuesday: "Mardi",
          wednesday: "Mercredi",
          thursday: "Jeudi",
          friday: "Vendredi",
          saturday: "Samedi",
          sunday: "Dimanche"
        },
        submit: "Créer la règle",
        cancel: "Annuler",
        success: "Règle de récurrence créée avec succès",
        error: "Erreur lors de la création de la règle"
      },
      courses: {
        title: "Cours en Ligne",
        noCourses: "Aucun cours disponible",
        teacher: "Enseignant",
        class: "Classe",
        subject: "Matière"
      },
      loading: "Chargement...",
      error: "Erreur"
    },
    en: {
      title: "Online Class Scheduling",
      subtitle: "Manage your school's online class sessions",
      description: "Schedule individual sessions or create recurrence rules to automatically generate sessions",
      tabs: {
        sessions: "Scheduled Sessions",
        createSession: "Create Session",
        recurrences: "Recurrence Rules",
        createRecurrence: "Create Rule",
        calendar: "Calendar"
      },
      sessions: {
        title: "Scheduled Sessions",
        noSessions: "No scheduled sessions",
        status: {
          scheduled: "Scheduled",
          live: "Live",
          ended: "Ended",
          cancelled: "Cancelled"
        },
        creatorType: {
          school: "School",
          teacher: "Teacher"
        },
        cancel: "Cancel",
        cancelConfirm: "Are you sure you want to cancel this session?",
        cancelSuccess: "Session cancelled successfully",
        cancelError: "Error cancelling session"
      },
      createSession: {
        title: "Create Session",
        selectCourse: "Select a course",
        selectClass: "Select a class (optional)",
        selectClassPlaceholder: "Select a class to notify students/parents",
        sessionTitle: "Session title",
        description: "Description",
        scheduledStart: "Start date and time",
        durationMinutes: "Duration (minutes)",
        autoNotify: "Automatically notify students and parents",
        submit: "Create session",
        cancel: "Cancel",
        success: "Session created successfully",
        error: "Error creating session"
      },
      recurrences: {
        title: "Recurrence Rules",
        noRecurrences: "No recurrence rules",
        ruleType: {
          daily: "Daily",
          weekly: "Weekly",
          biweekly: "Bi-weekly",
          custom: "Custom"
        },
        status: {
          active: "Active",
          paused: "Paused"
        },
        pause: "Pause",
        resume: "Resume",
        edit: "Edit",
        delete: "Delete",
        pauseSuccess: "Rule paused",
        resumeSuccess: "Rule resumed",
        deleteSuccess: "Rule deleted",
        deleteConfirm: "Are you sure you want to delete this rule?",
        generatedCount: "Generated sessions",
        lastGenerated: "Last generated"
      },
      createRecurrence: {
        title: "Create Recurrence Rule",
        selectCourse: "Select a course",
        ruleTitle: "Rule title",
        description: "Description",
        ruleType: "Recurrence type",
        interval: "Interval",
        byDay: "Days of week",
        startTime: "Start time",
        durationMinutes: "Duration (minutes)",
        startDate: "Start date",
        endDate: "End date (optional)",
        autoNotify: "Automatically notify",
        days: {
          monday: "Monday",
          tuesday: "Tuesday",
          wednesday: "Wednesday",
          thursday: "Thursday",
          friday: "Friday",
          saturday: "Saturday",
          sunday: "Sunday"
        },
        submit: "Create rule",
        cancel: "Cancel",
        success: "Recurrence rule created successfully",
        error: "Error creating rule"
      },
      courses: {
        title: "Online Courses",
        noCourses: "No courses available",
        teacher: "Teacher",
        class: "Class",
        subject: "Subject"
      },
      loading: "Loading...",
      error: "Error"
    }
  };

  const t = translations[language];

  const { data: coursesData, isLoading: coursesLoading } = useQuery<CoursesResponse>({
    queryKey: ['/api/school-scheduler/courses']
  });

  const { data: sessionsData, isLoading: sessionsLoading } = useQuery<SessionsResponse>({
    queryKey: ['/api/school-scheduler/sessions']
  });

  const { data: recurrencesData, isLoading: recurrencesLoading } = useQuery<RecurrencesResponse>({
    queryKey: ['/api/school-scheduler/recurrences']
  });

  const { data: classesData } = useQuery({
    queryKey: ['/api/director/classes']
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/school-scheduler/sessions', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/school-scheduler/sessions'] });
      toast({
        title: t.createSession.success,
        variant: 'default'
      });
      sessionForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: t.createSession.error,
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const createRecurrenceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/school-scheduler/recurrences', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/school-scheduler/recurrences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/school-scheduler/sessions'] });
      toast({
        title: t.createRecurrence.success,
        variant: 'default'
      });
      recurrenceForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: t.createRecurrence.error,
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const cancelSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await apiRequest('DELETE', `/api/school-scheduler/sessions/${sessionId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/school-scheduler/sessions'] });
      toast({
        title: t.sessions.cancelSuccess,
        variant: 'default'
      });
    },
    onError: (error: any) => {
      toast({
        title: t.sessions.cancelError,
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const toggleRecurrenceMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest('PATCH', `/api/school-scheduler/recurrences/${id}`, {
        isActive,
        pausedAt: isActive ? null : new Date().toISOString(),
        pausedBy: user?.id,
        pauseReason: isActive ? null : 'Manually paused by director'
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/school-scheduler/recurrences'] });
      toast({
        title: variables.isActive ? t.recurrences.resumeSuccess : t.recurrences.pauseSuccess,
        variant: 'default'
      });
    },
    onError: (error: any) => {
      toast({
        title: t.error,
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const deleteRecurrenceMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/school-scheduler/recurrences/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/school-scheduler/recurrences'] });
      toast({
        title: t.recurrences.deleteSuccess,
        variant: 'default'
      });
    },
    onError: (error: any) => {
      toast({
        title: t.error,
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const onSessionSubmit = (values: SessionFormValues) => {
    const selectedCourse = coursesData?.courses?.find((c: OnlineCourse) => c.id === parseInt(values.courseId));
    if (!selectedCourse) return;

    // Use selected class if provided, otherwise use course's class
    const classIdToUse = values.classId ? parseInt(values.classId) : selectedCourse.classId;

    createSessionMutation.mutate({
      courseId: parseInt(values.courseId),
      teacherId: selectedCourse.teacherId,
      classId: classIdToUse,
      subjectId: selectedCourse.subjectId,
      title: values.title,
      description: values.description,
      scheduledStart: values.scheduledStart,
      durationMinutes: values.durationMinutes,
      autoNotify: values.autoNotify
    });
  };

  const onRecurrenceSubmit = (values: RecurrenceFormValues) => {
    const selectedCourse = coursesData?.courses?.find((c: OnlineCourse) => c.id === parseInt(values.courseId));
    if (!selectedCourse) return;

    createRecurrenceMutation.mutate({
      courseId: parseInt(values.courseId),
      teacherId: selectedCourse.teacherId,
      classId: selectedCourse.classId,
      subjectId: selectedCourse.subjectId,
      title: values.title,
      description: values.description,
      ruleType: values.ruleType,
      interval: values.interval,
      byDay: values.byDay && values.byDay.length > 0 ? values.byDay : undefined,
      startTime: values.startTime,
      durationMinutes: values.durationMinutes,
      startDate: values.startDate,
      endDate: values.endDate || undefined,
      autoNotify: values.autoNotify
    });
  };

  const handleCancelSession = (sessionId: number) => {
    if (window.confirm(t.sessions.cancelConfirm)) {
      cancelSessionMutation.mutate(sessionId);
    }
  };

  const handleToggleRecurrence = (recurrence: RecurrenceRule) => {
    toggleRecurrenceMutation.mutate({
      id: recurrence.id,
      isActive: !recurrence.isActive
    });
  };

  const handleDeleteRecurrence = (id: number) => {
    if (window.confirm(t.recurrences.deleteConfirm)) {
      deleteRecurrenceMutation.mutate(id);
    }
  };

  const toggleDaySelection = (day: string) => {
    const currentDays = recurrenceForm.getValues('byDay') || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    recurrenceForm.setValue('byDay', newDays);
  };

  const courses: OnlineCourse[] = coursesData?.courses || [];
  const sessions: OnlineClassSession[] = sessionsData?.sessions || [];
  const recurrences: RecurrenceRule[] = recurrencesData?.recurrences || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="bg-white/80 backdrop-blur-md shadow-xl border border-white/30">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
                  <Video className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {t.title}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">{t.subtitle}</p>
                  <p className="text-sm text-gray-500 mt-1">{t.description}</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-white/90 backdrop-blur-md shadow-xl border border-white/30">
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="sessions" data-testid="tab-sessions" className="flex items-center justify-center">
                  <Calendar className="h-5 w-5 md:h-4 md:w-4 md:mr-2" />
                  <span className="hidden md:inline">{t.tabs.sessions}</span>
                </TabsTrigger>
                <TabsTrigger value="create-session" data-testid="tab-create-session" className="flex items-center justify-center">
                  <Plus className="h-5 w-5 md:h-4 md:w-4 md:mr-2" />
                  <span className="hidden md:inline">{t.tabs.createSession}</span>
                </TabsTrigger>
                <TabsTrigger value="recurrences" data-testid="tab-recurrences" className="flex items-center justify-center">
                  <Repeat className="h-5 w-5 md:h-4 md:w-4 md:mr-2" />
                  <span className="hidden md:inline">{t.tabs.recurrences}</span>
                </TabsTrigger>
                <TabsTrigger value="create-recurrence" data-testid="tab-create-recurrence" className="flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 md:h-4 md:w-4 md:mr-2" />
                  <span className="hidden md:inline">{t.tabs.createRecurrence}</span>
                </TabsTrigger>
                <TabsTrigger value="calendar" data-testid="tab-calendar" className="flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 md:h-4 md:w-4 md:mr-2" />
                  <span className="hidden md:inline">{t.tabs.calendar}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sessions" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{t.sessions.title}</h3>
                  {sessionsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>

                {sessions.length === 0 ? (
                  <Card className="bg-gray-50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600">{t.sessions.noSessions}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sessions.map((session) => (
                      <Card key={session.id} className="hover:shadow-lg transition-shadow" data-testid={`session-card-${session.id}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{session.title}</CardTitle>
                              <CardDescription className="mt-1">
                                {session.courseName}
                              </CardDescription>
                            </div>
                            <Badge 
                              variant={
                                session.status === 'scheduled' ? 'default' :
                                session.status === 'live' ? 'default' :
                                session.status === 'ended' ? 'secondary' :
                                'destructive'
                              }
                              data-testid={`session-status-${session.id}`}
                            >
                              {t.sessions.status[session.status]}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(session.scheduledStart).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>{session.teacherName}</span>
                          </div>
                          {session.className && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <BookOpen className="h-4 w-4" />
                              <span>{session.className}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" data-testid={`session-creator-${session.id}`}>
                              {t.sessions.creatorType[session.creatorType]}
                            </Badge>
                          </div>
                          {session.status === 'scheduled' && session.creatorType === 'school' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full mt-2"
                              onClick={() => handleCancelSession(session.id)}
                              disabled={cancelSessionMutation.isPending}
                              data-testid={`button-cancel-session-${session.id}`}
                            >
                              {cancelSessionMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                              )}
                              {t.sessions.cancel}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="create-session" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t.createSession.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...sessionForm}>
                      <form onSubmit={sessionForm.handleSubmit(onSessionSubmit)} className="space-y-4">
                        <FormField
                          control={sessionForm.control}
                          name="courseId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.createSession.selectCourse}</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-session-course">
                                    <SelectValue placeholder={t.createSession.selectCourse} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {courses.map((course) => (
                                    <SelectItem key={course.id} value={course.id.toString()}>
                                      {course.title} - {course.teacherName} {course.className ? `(${course.className})` : ''}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={sessionForm.control}
                          name="classId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.createSession.selectClass}</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-session-class">
                                    <SelectValue placeholder={t.createSession.selectClassPlaceholder} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">
                                    {language === 'fr' ? 'Aucune classe (utiliser celle du cours)' : 'No class (use course class)'}
                                  </SelectItem>
                                  {classesData?.classes?.map((cls: any) => (
                                    <SelectItem key={cls.id} value={cls.id.toString()}>
                                      {cls.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={sessionForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.createSession.sessionTitle}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t.createSession.sessionTitle}
                                  {...field}
                                  data-testid="input-session-title"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={sessionForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.createSession.description}</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={t.createSession.description}
                                  {...field}
                                  data-testid="input-session-description"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={sessionForm.control}
                          name="scheduledStart"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.createSession.scheduledStart}</FormLabel>
                              <FormControl>
                                <Input
                                  type="datetime-local"
                                  {...field}
                                  data-testid="input-session-start"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={sessionForm.control}
                          name="durationMinutes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.createSession.durationMinutes}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={15}
                                  max={240}
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  data-testid="input-session-duration"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={sessionForm.control}
                          name="autoNotify"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-session-notify"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {t.createSession.autoNotify}
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={createSessionMutation.isPending}
                            className="flex-1"
                            data-testid="button-create-session"
                          >
                            {createSessionMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Plus className="h-4 w-4 mr-2" />
                            )}
                            {t.createSession.submit}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => sessionForm.reset()}
                            data-testid="button-reset-session"
                          >
                            {t.createSession.cancel}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recurrences" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{t.recurrences.title}</h3>
                  {recurrencesLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>

                {recurrences.length === 0 ? (
                  <Card className="bg-gray-50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600">{t.recurrences.noRecurrences}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {recurrences.map((recurrence) => (
                      <Card key={recurrence.id} className="hover:shadow-lg transition-shadow" data-testid={`recurrence-card-${recurrence.id}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{recurrence.title}</CardTitle>
                              <CardDescription className="mt-1">
                                {recurrence.courseName}
                              </CardDescription>
                            </div>
                            <Badge 
                              variant={recurrence.isActive ? 'default' : 'secondary'}
                              data-testid={`recurrence-status-${recurrence.id}`}
                            >
                              {recurrence.isActive ? t.recurrences.status.active : t.recurrences.status.paused}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Repeat className="h-4 w-4" />
                            <span>{t.recurrences.ruleType[recurrence.ruleType]}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{recurrence.startTime} ({recurrence.durationMinutes} min)</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>{recurrence.teacherName}</span>
                          </div>
                          {recurrence.byDay && recurrence.byDay.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {recurrence.byDay.map(day => (
                                <Badge key={day} variant="outline" className="text-xs">
                                  {day}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>{t.recurrences.generatedCount}: {recurrence.generatedCount}</div>
                            {recurrence.lastGenerated && (
                              <div>{t.recurrences.lastGenerated}: {new Date(recurrence.lastGenerated).toLocaleDateString()}</div>
                            )}
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant={recurrence.isActive ? "outline" : "default"}
                              size="sm"
                              className="flex-1"
                              onClick={() => handleToggleRecurrence(recurrence)}
                              disabled={toggleRecurrenceMutation.isPending}
                              data-testid={`button-toggle-recurrence-${recurrence.id}`}
                            >
                              {recurrence.isActive ? (
                                <><Pause className="h-4 w-4 mr-2" />{t.recurrences.pause}</>
                              ) : (
                                <><Play className="h-4 w-4 mr-2" />{t.recurrences.resume}</>
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteRecurrence(recurrence.id)}
                              disabled={deleteRecurrenceMutation.isPending}
                              data-testid={`button-delete-recurrence-${recurrence.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="create-recurrence" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t.createRecurrence.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...recurrenceForm}>
                      <form onSubmit={recurrenceForm.handleSubmit(onRecurrenceSubmit)} className="space-y-4">
                        <FormField
                          control={recurrenceForm.control}
                          name="courseId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.createRecurrence.selectCourse}</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-recurrence-course">
                                    <SelectValue placeholder={t.createRecurrence.selectCourse} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {courses.map((course) => (
                                    <SelectItem key={course.id} value={course.id.toString()}>
                                      {course.title} - {course.teacherName} {course.className ? `(${course.className})` : ''}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={recurrenceForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.createRecurrence.ruleTitle}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t.createRecurrence.ruleTitle}
                                  {...field}
                                  data-testid="input-recurrence-title"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={recurrenceForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.createRecurrence.description}</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={t.createRecurrence.description}
                                  {...field}
                                  data-testid="input-recurrence-description"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={recurrenceForm.control}
                          name="ruleType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.createRecurrence.ruleType}</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-recurrence-type">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="daily">{t.recurrences.ruleType.daily}</SelectItem>
                                  <SelectItem value="weekly">{t.recurrences.ruleType.weekly}</SelectItem>
                                  <SelectItem value="biweekly">{t.recurrences.ruleType.biweekly}</SelectItem>
                                  <SelectItem value="custom">{t.recurrences.ruleType.custom}</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {recurrenceForm.watch('ruleType') !== 'daily' && (
                          <FormField
                            control={recurrenceForm.control}
                            name="byDay"
                            render={() => (
                              <FormItem>
                                <FormLabel>{t.createRecurrence.byDay}</FormLabel>
                                <div className="grid grid-cols-2 gap-2">
                                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                                    <FormField
                                      key={day}
                                      control={recurrenceForm.control}
                                      name="byDay"
                                      render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(day)}
                                              onCheckedChange={() => toggleDaySelection(day)}
                                              data-testid={`checkbox-day-${day}`}
                                            />
                                          </FormControl>
                                          <FormLabel className="text-sm font-normal cursor-pointer">
                                            {t.createRecurrence.days[day as keyof typeof t.createRecurrence.days]}
                                          </FormLabel>
                                        </FormItem>
                                      )}
                                    />
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={recurrenceForm.control}
                            name="startTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t.createRecurrence.startTime}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="time"
                                    {...field}
                                    data-testid="input-recurrence-start-time"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={recurrenceForm.control}
                            name="durationMinutes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t.createRecurrence.durationMinutes}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={15}
                                    max={240}
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    data-testid="input-recurrence-duration"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={recurrenceForm.control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t.createRecurrence.startDate}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    {...field}
                                    data-testid="input-recurrence-start-date"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={recurrenceForm.control}
                            name="endDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t.createRecurrence.endDate}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    {...field}
                                    data-testid="input-recurrence-end-date"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={recurrenceForm.control}
                          name="autoNotify"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-recurrence-notify"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {t.createRecurrence.autoNotify}
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={createRecurrenceMutation.isPending}
                            className="flex-1"
                            data-testid="button-create-recurrence"
                          >
                            {createRecurrenceMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Plus className="h-4 w-4 mr-2" />
                            )}
                            {t.createRecurrence.submit}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => recurrenceForm.reset()}
                            data-testid="button-reset-recurrence"
                          >
                            {t.createRecurrence.cancel}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendar" className="space-y-4">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CalendarDays className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">Calendar view coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnlineClassScheduler;

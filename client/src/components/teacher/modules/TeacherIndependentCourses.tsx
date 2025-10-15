import React, { useState } from 'react';
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
import { 
  Users, 
  Plus, 
  Calendar, 
  Clock,
  Video,
  BookOpen,
  CheckCircle,
  XCircle,
  CreditCard,
  AlertCircle,
  GraduationCap,
  Pencil,
  Trash2,
  Eye
} from 'lucide-react';

interface IndependentStudent {
  id: number;
  studentId: number;
  studentName: string;
  subjects: string[];
  level: string;
  objectives: string;
  status: 'active' | 'paused' | 'ended';
  createdAt: string;
}

interface IndependentSession {
  id: number;
  studentId: number;
  studentName: string;
  title: string;
  description?: string;
  subject: string;
  scheduledStart: string;
  scheduledEnd?: string;
  sessionType: 'online' | 'in_person' | 'hybrid';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  rating?: number;
}

const TeacherIndependentCourses: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<'students' | 'sessions' | 'activation'>('activation');
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  const [showCreateSessionDialog, setShowCreateSessionDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  
  // New student form
  const [newStudent, setNewStudent] = useState({
    studentId: '',
    subjects: [] as string[],
    level: '',
    objectives: ''
  });
  
  // New session form
  const [newSession, setNewSession] = useState({
    studentId: '',
    title: '',
    description: '',
    subject: '',
    scheduledStart: '',
    scheduledEnd: '',
    sessionType: 'online' as 'online' | 'in_person' | 'hybrid'
  });

  const text = {
    fr: {
      title: 'Mes Cours Privés',
      subtitle: 'Gérez vos cours de répétiteur indépendant',
      activationTab: 'Activation',
      studentsTab: 'Mes Élèves',
      sessionsTab: 'Sessions',
      activationStatus: 'Statut Activation',
      daysRemaining: 'jours restants',
      activateNow: 'Activer Maintenant',
      purchaseRequired: 'Achat Requis',
      purchaseDescription: 'Pour utiliser le mode répétiteur indépendant, vous devez acheter une activation.',
      price: 'Prix: 25,000 CFA / an',
      purchaseButton: 'Acheter Activation',
      addStudent: 'Ajouter Élève',
      createSession: 'Nouvelle Session',
      noStudents: 'Aucun élève privé',
      noStudentsDesc: 'Commencez par ajouter vos premiers élèves privés',
      noSessions: 'Aucune session programmée',
      noSessionsDesc: 'Créez votre première session de cours privé',
      studentName: 'Nom de l\'élève',
      studentId: 'ID Élève',
      subjects: 'Matières',
      level: 'Niveau',
      objectives: 'Objectifs',
      status: 'Statut',
      active: 'Actif',
      paused: 'En Pause',
      ended: 'Terminé',
      sessionTitle: 'Titre de la Session',
      sessionDescription: 'Description',
      subject: 'Matière',
      scheduledStart: 'Début',
      scheduledEnd: 'Fin',
      sessionType: 'Type',
      online: 'En Ligne',
      inPerson: 'En Présentiel',
      hybrid: 'Hybride',
      scheduled: 'Programmé',
      ongoing: 'En Cours',
      completed: 'Terminé',
      cancelled: 'Annulé',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      view: 'Voir',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      studentAdded: 'Élève ajouté avec succès',
      sessionCreated: 'Session créée avec succès',
      expired: 'Expiré',
      notActivated: 'Non Activé',
      activationExpired: 'Votre activation a expiré',
      renewNow: 'Renouveler Maintenant'
    },
    en: {
      title: 'My Private Courses',
      subtitle: 'Manage your independent tutoring courses',
      activationTab: 'Activation',
      studentsTab: 'My Students',
      sessionsTab: 'Sessions',
      activationStatus: 'Activation Status',
      daysRemaining: 'days remaining',
      activateNow: 'Activate Now',
      purchaseRequired: 'Purchase Required',
      purchaseDescription: 'To use independent tutor mode, you must purchase an activation.',
      price: 'Price: 25,000 CFA / year',
      purchaseButton: 'Purchase Activation',
      addStudent: 'Add Student',
      createSession: 'New Session',
      noStudents: 'No private students',
      noStudentsDesc: 'Start by adding your first private students',
      noSessions: 'No sessions scheduled',
      noSessionsDesc: 'Create your first private lesson session',
      studentName: 'Student Name',
      studentId: 'Student ID',
      subjects: 'Subjects',
      level: 'Level',
      objectives: 'Objectives',
      status: 'Status',
      active: 'Active',
      paused: 'Paused',
      ended: 'Ended',
      sessionTitle: 'Session Title',
      sessionDescription: 'Description',
      subject: 'Subject',
      scheduledStart: 'Start',
      scheduledEnd: 'End',
      sessionType: 'Type',
      online: 'Online',
      inPerson: 'In Person',
      hybrid: 'Hybrid',
      scheduled: 'Scheduled',
      ongoing: 'Ongoing',
      completed: 'Completed',
      cancelled: 'Cancelled',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      studentAdded: 'Student added successfully',
      sessionCreated: 'Session created successfully',
      expired: 'Expired',
      notActivated: 'Not Activated',
      activationExpired: 'Your activation has expired',
      renewNow: 'Renew Now'
    }
  };

  const t = text[language];

  // Check activation status
  const { data: activationData, isLoading: activationLoading } = useQuery({
    queryKey: ['/api/teacher/independent/activation/status'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/teacher/independent/activation/status');
      return response.json();
    }
  });

  // Fetch independent students
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/teacher/independent/students'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/teacher/independent/students');
      return response.json();
    },
    enabled: activationData?.isActive
  });

  // Fetch independent sessions
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/teacher/independent/sessions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/teacher/independent/sessions');
      return response.json();
    },
    enabled: activationData?.isActive
  });

  // Add student mutation
  const addStudentMutation = useMutation({
    mutationFn: async (data: typeof newStudent) => {
      const response = await apiRequest('POST', '/api/teacher/independent/students', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t.success,
        description: t.studentAdded
      });
      setShowAddStudentDialog(false);
      setNewStudent({ studentId: '', subjects: [], level: '', objectives: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/independent/students'] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t.error,
        description: error.message
      });
    }
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: typeof newSession) => {
      const response = await apiRequest('POST', '/api/teacher/independent/sessions', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t.success,
        description: t.sessionCreated
      });
      setShowCreateSessionDialog(false);
      setNewSession({
        studentId: '',
        title: '',
        description: '',
        subject: '',
        scheduledStart: '',
        scheduledEnd: '',
        sessionType: 'online'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/independent/sessions'] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t.error,
        description: error.message
      });
    }
  });

  const handleAddStudent = () => {
    addStudentMutation.mutate(newStudent);
  };

  const handleCreateSession = () => {
    createSessionMutation.mutate(newSession);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
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

  // Activation Status Section
  const ActivationSection = () => {
    if (activationLoading) {
      return <div className="text-center py-8">{t.loading}</div>;
    }

    const isActive = activationData?.isActive;
    const daysRemaining = activationData?.daysRemaining || 0;
    const isExpired = activationData?.isExpired;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {t.activationStatus}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isActive || isExpired ? (
            <div className="text-center py-8 space-y-4">
              <AlertCircle className="w-16 h-16 mx-auto text-orange-500" />
              <h3 className="text-xl font-bold">{isExpired ? t.activationExpired : t.purchaseRequired}</h3>
              <p className="text-gray-600">{t.purchaseDescription}</p>
              <p className="text-2xl font-bold text-primary">{t.price}</p>
              <Button 
                size="lg" 
                className="mt-4"
                onClick={() => window.location.href = '/teacher/activation-purchase'}
                data-testid="button-purchase-activation"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {isExpired ? t.renewNow : t.purchaseButton}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <h3 className="text-xl font-bold text-green-600">{t.active}</h3>
              <p className="text-3xl font-bold text-primary">
                {daysRemaining} {t.daysRemaining}
              </p>
              <div className="flex gap-2 justify-center mt-4">
                <Button 
                  onClick={() => setActiveTab('students')}
                  data-testid="button-view-students"
                >
                  <Users className="w-4 h-4 mr-2" />
                  {t.studentsTab}
                </Button>
                <Button 
                  onClick={() => setActiveTab('sessions')}
                  data-testid="button-view-sessions"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {t.sessionsTab}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Students Section
  const StudentsSection = () => {
    const students = studentsData?.students || [];

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{t.studentsTab}</h3>
          <Button onClick={() => setShowAddStudentDialog(true)} data-testid="button-add-student">
            <Plus className="w-4 h-4 mr-2" />
            {t.addStudent}
          </Button>
        </div>

        {students.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t.noStudents}</h3>
              <p className="text-gray-600 mb-4">{t.noStudentsDesc}</p>
              <Button onClick={() => setShowAddStudentDialog(true)} data-testid="button-add-first-student">
                <Plus className="w-4 h-4 mr-2" />
                {t.addStudent}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {students.map((student: IndependentStudent) => (
              <Card key={student.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      {student.studentName}
                    </span>
                    {getStatusBadge(student.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">{t.subjects}: </span>
                    <span className="text-sm text-gray-600">{student.subjects.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">{t.level}: </span>
                    <span className="text-sm text-gray-600">{student.level}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">{t.objectives}: </span>
                    <span className="text-sm text-gray-600">{student.objectives}</span>
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
    const sessions = sessionsData?.sessions || [];

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{t.sessionsTab}</h3>
          <Button onClick={() => setShowCreateSessionDialog(true)} data-testid="button-create-session">
            <Plus className="w-4 h-4 mr-2" />
            {t.createSession}
          </Button>
        </div>

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t.noSessions}</h3>
              <p className="text-gray-600 mb-4">{t.noSessionsDesc}</p>
              <Button onClick={() => setShowCreateSessionDialog(true)} data-testid="button-create-first-session">
                <Plus className="w-4 h-4 mr-2" />
                {t.createSession}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions.map((session: IndependentSession) => (
              <Card key={session.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold flex items-center gap-2">
                        {session.sessionType === 'online' && <Video className="w-4 h-4" />}
                        {session.sessionType === 'in_person' && <BookOpen className="w-4 h-4" />}
                        {session.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{session.studentName} • {session.subject}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(session.scheduledStart).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(session.status)}
                      <Badge variant="outline">{t[session.sessionType as keyof typeof t]}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activation" data-testid="tab-activation">{t.activationTab}</TabsTrigger>
          <TabsTrigger value="students" data-testid="tab-students" disabled={!activationData?.isActive}>{t.studentsTab}</TabsTrigger>
          <TabsTrigger value="sessions" data-testid="tab-sessions" disabled={!activationData?.isActive}>{t.sessionsTab}</TabsTrigger>
        </TabsList>

        <TabsContent value="activation" className="mt-6">
          <ActivationSection />
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <StudentsSection />
        </TabsContent>

        <TabsContent value="sessions" className="mt-6">
          <SessionsSection />
        </TabsContent>
      </Tabs>

      {/* Add Student Dialog */}
      <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.addStudent}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>{t.studentId}</Label>
              <Input
                value={newStudent.studentId}
                onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })}
                placeholder="ID"
                data-testid="input-student-id"
              />
            </div>
            <div>
              <Label>{t.subjects}</Label>
              <Input
                value={newStudent.subjects.join(', ')}
                onChange={(e) => setNewStudent({ ...newStudent, subjects: e.target.value.split(',').map(s => s.trim()) })}
                placeholder="Mathématiques, Physique"
                data-testid="input-subjects"
              />
            </div>
            <div>
              <Label>{t.level}</Label>
              <Input
                value={newStudent.level}
                onChange={(e) => setNewStudent({ ...newStudent, level: e.target.value })}
                placeholder="Seconde, Première, etc."
                data-testid="input-level"
              />
            </div>
            <div>
              <Label>{t.objectives}</Label>
              <Textarea
                value={newStudent.objectives}
                onChange={(e) => setNewStudent({ ...newStudent, objectives: e.target.value })}
                placeholder="Objectifs pédagogiques"
                data-testid="input-objectives"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStudentDialog(false)} data-testid="button-cancel-add-student">
              {t.cancel}
            </Button>
            <Button onClick={handleAddStudent} disabled={addStudentMutation.isPending} data-testid="button-save-student">
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Session Dialog */}
      <Dialog open={showCreateSessionDialog} onOpenChange={setShowCreateSessionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.createSession}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>{t.studentName}</Label>
              <Select value={newSession.studentId} onValueChange={(v) => setNewSession({ ...newSession, studentId: v })}>
                <SelectTrigger data-testid="select-session-student">
                  <SelectValue placeholder={t.studentName} />
                </SelectTrigger>
                <SelectContent>
                  {(studentsData?.students || []).map((student: IndependentStudent) => (
                    <SelectItem key={student.id} value={student.studentId.toString()}>
                      {student.studentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t.sessionTitle}</Label>
              <Input
                value={newSession.title}
                onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                placeholder="Titre de la session"
                data-testid="input-session-title"
              />
            </div>
            <div>
              <Label>{t.subject}</Label>
              <Input
                value={newSession.subject}
                onChange={(e) => setNewSession({ ...newSession, subject: e.target.value })}
                placeholder="Matière"
                data-testid="input-session-subject"
              />
            </div>
            <div>
              <Label>{t.sessionDescription}</Label>
              <Textarea
                value={newSession.description}
                onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                placeholder="Description"
                data-testid="input-session-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.scheduledStart}</Label>
                <Input
                  type="datetime-local"
                  value={newSession.scheduledStart}
                  onChange={(e) => setNewSession({ ...newSession, scheduledStart: e.target.value })}
                  data-testid="input-session-start"
                />
              </div>
              <div>
                <Label>{t.scheduledEnd}</Label>
                <Input
                  type="datetime-local"
                  value={newSession.scheduledEnd}
                  onChange={(e) => setNewSession({ ...newSession, scheduledEnd: e.target.value })}
                  data-testid="input-session-end"
                />
              </div>
            </div>
            <div>
              <Label>{t.sessionType}</Label>
              <Select value={newSession.sessionType} onValueChange={(v: any) => setNewSession({ ...newSession, sessionType: v })}>
                <SelectTrigger data-testid="select-session-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">{t.online}</SelectItem>
                  <SelectItem value="in_person">{t.inPerson}</SelectItem>
                  <SelectItem value="hybrid">{t.hybrid}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateSessionDialog(false)} data-testid="button-cancel-create-session">
              {t.cancel}
            </Button>
            <Button onClick={handleCreateSession} disabled={createSessionMutation.isPending} data-testid="button-save-session">
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherIndependentCourses;

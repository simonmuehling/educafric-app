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
  Eye,
  Send,
  User
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

const TeacherIndependentCourses: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<'students' | 'sessions' | 'activation' | 'invitations'>('activation');
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  const [showCreateSessionDialog, setShowCreateSessionDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'mtn' | ''>('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
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

  // New invitation form
  const [newInvitation, setNewInvitation] = useState({
    targetType: 'student' as 'student' | 'parent',
    targetId: '',
    studentId: '',
    subjects: [] as string[],
    level: '',
    message: '',
    pricePerHour: '',
    pricePerSession: ''
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
      renewNow: 'Renouveler Maintenant',
      invitationsTab: 'Invitations',
      inviteStudent: 'Inviter Élève',
      inviteParent: 'Inviter Parent',
      sendInvitation: 'Envoyer Invitation',
      targetType: 'Inviter',
      student: 'Élève',
      parent: 'Parent',
      selectStudent: 'Sélectionner élève',
      selectParent: 'Sélectionner parent',
      invitationMessage: 'Message d\'invitation',
      pricePerHour: 'Prix/heure (CFA)',
      pricePerSession: 'Prix/session (CFA)',
      noInvitations: 'Aucune invitation envoyée',
      noInvitationsDesc: 'Invitez des élèves ou parents pour commencer',
      pending: 'En attente',
      accepted: 'Acceptée',
      rejected: 'Refusée',
      sentTo: 'Envoyé à',
      expiresOn: 'Expire le',
      invitationSent: 'Invitation envoyée avec succès',
      paymentMethod: 'Méthode de paiement',
      selectPaymentMethod: 'Sélectionner une méthode',
      stripe: 'Carte bancaire (Stripe)',
      mtn: 'MTN Mobile Money',
      processing: 'Traitement...',
      paymentProcessing: 'Traitement du paiement en cours...',
      paymentSuccess: 'Paiement réussi!',
      paymentFailed: 'Le paiement a échoué',
      proceedToPayment: 'Procéder au paiement',
      paymentMethodRequired: 'Veuillez sélectionner une méthode de paiement'
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
      renewNow: 'Renew Now',
      invitationsTab: 'Invitations',
      inviteStudent: 'Invite Student',
      inviteParent: 'Invite Parent',
      sendInvitation: 'Send Invitation',
      targetType: 'Invite',
      student: 'Student',
      parent: 'Parent',
      selectStudent: 'Select student',
      selectParent: 'Select parent',
      invitationMessage: 'Invitation message',
      pricePerHour: 'Price/hour (CFA)',
      pricePerSession: 'Price/session (CFA)',
      noInvitations: 'No invitations sent',
      noInvitationsDesc: 'Invite students or parents to get started',
      pending: 'Pending',
      accepted: 'Accepted',
      rejected: 'Rejected',
      sentTo: 'Sent to',
      expiresOn: 'Expires on',
      invitationSent: 'Invitation sent successfully',
      paymentMethod: 'Payment method',
      selectPaymentMethod: 'Select a method',
      stripe: 'Credit Card (Stripe)',
      mtn: 'MTN Mobile Money',
      processing: 'Processing...',
      paymentProcessing: 'Processing payment...',
      paymentSuccess: 'Payment successful!',
      paymentFailed: 'Payment failed',
      proceedToPayment: 'Proceed to payment',
      paymentMethodRequired: 'Please select a payment method'
    }
  };

  const t = text[language];

  // Check activation status
  const { data: activationData, isLoading: activationLoading } = useQuery({
    queryKey: ['/api/teacher/independent/activation/status'],
    queryFn: async () => {
      return await apiRequest('GET', '/api/teacher/independent/activation/status');
    }
  });

  // Fetch independent students
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/teacher/independent/students'],
    queryFn: async () => {
      return await apiRequest('GET', '/api/teacher/independent/students');
    },
    enabled: activationData?.isActive
  });

  // Fetch independent sessions
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/teacher/independent/sessions'],
    queryFn: async () => {
      return await apiRequest('GET', '/api/teacher/independent/sessions');
    },
    enabled: activationData?.isActive
  });

  // Fetch invitations
  const { data: invitationsData, isLoading: invitationsLoading } = useQuery({
    queryKey: ['/api/teacher/independent/invitations'],
    queryFn: async () => {
      return await apiRequest('GET', '/api/teacher/independent/invitations');
    },
    enabled: activationData?.isActive
  });

  // Add student mutation
  const addStudentMutation = useMutation({
    mutationFn: async (data: typeof newStudent) => {
      return await apiRequest('POST', '/api/teacher/independent/students', data);
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
      return await apiRequest('POST', '/api/teacher/independent/sessions', data);
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

  // Create invitation mutation
  const createInvitationMutation = useMutation({
    mutationFn: async (data: typeof newInvitation) => {
      const payload = {
        targetType: data.targetType,
        targetId: parseInt(data.targetId),
        studentId: data.targetType === 'parent' ? parseInt(data.studentId) : parseInt(data.targetId),
        subjects: data.subjects,
        level: data.level,
        message: data.message,
        pricePerHour: data.pricePerHour ? parseFloat(data.pricePerHour) : undefined,
        pricePerSession: data.pricePerSession ? parseFloat(data.pricePerSession) : undefined
      };
      return await apiRequest('POST', '/api/teacher/independent/invitations', payload);
    },
    onSuccess: () => {
      toast({
        title: t.success,
        description: t.invitationSent
      });
      setShowInviteDialog(false);
      setNewInvitation({
        targetType: 'student',
        targetId: '',
        studentId: '',
        subjects: [],
        level: '',
        message: '',
        pricePerHour: '',
        pricePerSession: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/independent/invitations'] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t.error,
        description: error.message
      });
    }
  });

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: async (method: 'stripe' | 'mtn') => {
      if (method === 'stripe') {
        const response = await apiRequest('POST', '/api/teacher-independent-payments/create-stripe-payment');
        return { method: 'stripe', ...response };
      } else {
        const response = await apiRequest('POST', '/api/teacher-independent-payments/create-mtn-payment');
        return { method: 'mtn', ...response };
      }
    },
    onSuccess: async (data) => {
      if (data.method === 'stripe') {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        // Redirect to MTN payment page
        window.location.href = data.payment_url;
      }
    },
    onError: (error: any) => {
      setPaymentProcessing(false);
      toast({
        variant: 'destructive',
        title: t.paymentFailed,
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

  const handleSendInvitation = () => {
    createInvitationMutation.mutate(newInvitation);
  };

  const handlePayment = () => {
    if (!paymentMethod) {
      toast({
        variant: 'destructive',
        title: t.error,
        description: t.paymentMethodRequired
      });
      return;
    }
    setPaymentProcessing(true);
    paymentMutation.mutate(paymentMethod as 'stripe' | 'mtn');
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
                onClick={() => setShowPaymentDialog(true)}
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

  // Invitations Section
  const InvitationsSection = () => {
    if (invitationsLoading) {
      return <div className="text-center py-8">{t.loading}</div>;
    }

    const invitations = (invitationsData?.invitations || []) as TeacherInvitation[];

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{t.invitationsTab}</h3>
          <Button onClick={() => setShowInviteDialog(true)} data-testid="button-send-invitation">
            <Send className="w-4 h-4 mr-2" />
            {t.sendInvitation}
          </Button>
        </div>

        {invitations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Send className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t.noInvitations}</h3>
              <p className="text-gray-600 mb-4">{t.noInvitationsDesc}</p>
              <Button onClick={() => setShowInviteDialog(true)} data-testid="button-send-first-invitation">
                <Send className="w-4 h-4 mr-2" />
                {t.sendInvitation}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <Card key={invitation.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {invitation.targetType === 'student' ? (
                          <User className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Users className="w-4 h-4 text-purple-500" />
                        )}
                        <span className="font-semibold">
                          {invitation.targetType === 'student' ? t.student : t.parent} (ID: {invitation.targetId})
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>{t.subjects}:</strong> {invitation.subjects.join(', ')}</p>
                        {invitation.level && <p><strong>{t.level}:</strong> {invitation.level}</p>}
                        {invitation.message && <p className="italic">"{invitation.message}"</p>}
                        {(invitation.pricePerHour || invitation.pricePerSession) && (
                          <p className="text-green-600 font-medium">
                            {invitation.pricePerHour && `${invitation.pricePerHour} CFA/h`}
                            {invitation.pricePerHour && invitation.pricePerSession && ' • '}
                            {invitation.pricePerSession && `${invitation.pricePerSession} CFA/session`}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {t.expiresOn}: {new Date(invitation.expiresAt || '').toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(invitation.status)}
                      {invitation.responseMessage && (
                        <p className="text-xs text-gray-500 max-w-[150px] text-right">{invitation.responseMessage}</p>
                      )}
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activation" data-testid="tab-activation">{t.activationTab}</TabsTrigger>
          <TabsTrigger value="students" data-testid="tab-students" disabled={!activationData?.isActive}>{t.studentsTab}</TabsTrigger>
          <TabsTrigger value="sessions" data-testid="tab-sessions" disabled={!activationData?.isActive}>{t.sessionsTab}</TabsTrigger>
          <TabsTrigger value="invitations" data-testid="tab-invitations" disabled={!activationData?.isActive}>{t.invitationsTab}</TabsTrigger>
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

        <TabsContent value="invitations" className="mt-6">
          <InvitationsSection />
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

      {/* Send Invitation Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.sendInvitation}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>{t.targetType}</Label>
              <Select 
                value={newInvitation.targetType} 
                onValueChange={(v: 'student' | 'parent') => setNewInvitation({ ...newInvitation, targetType: v })}
              >
                <SelectTrigger data-testid="select-target-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">{t.student}</SelectItem>
                  <SelectItem value="parent">{t.parent}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{newInvitation.targetType === 'student' ? t.selectStudent : t.selectParent} ID</Label>
              <Input
                type="number"
                value={newInvitation.targetId}
                onChange={(e) => setNewInvitation({ ...newInvitation, targetId: e.target.value })}
                placeholder={newInvitation.targetType === 'student' ? 'ID Élève' : 'ID Parent'}
                data-testid="input-target-id"
              />
            </div>

            {newInvitation.targetType === 'parent' && (
              <div>
                <Label>{t.selectStudent} ID</Label>
                <Input
                  type="number"
                  value={newInvitation.studentId}
                  onChange={(e) => setNewInvitation({ ...newInvitation, studentId: e.target.value })}
                  placeholder="ID de l'élève concerné"
                  data-testid="input-student-id-for-parent"
                />
              </div>
            )}

            <div>
              <Label>{t.subjects}</Label>
              <Input
                value={newInvitation.subjects.join(', ')}
                onChange={(e) => setNewInvitation({ 
                  ...newInvitation, 
                  subjects: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                })}
                placeholder="Mathématiques, Physique, Chimie"
                data-testid="input-invitation-subjects"
              />
            </div>

            <div>
              <Label>{t.level}</Label>
              <Input
                value={newInvitation.level}
                onChange={(e) => setNewInvitation({ ...newInvitation, level: e.target.value })}
                placeholder="6ème, Terminale, etc."
                data-testid="input-invitation-level"
              />
            </div>

            <div>
              <Label>{t.invitationMessage}</Label>
              <Textarea
                value={newInvitation.message}
                onChange={(e) => setNewInvitation({ ...newInvitation, message: e.target.value })}
                placeholder="Message personnalisé pour l'invitation..."
                data-testid="textarea-invitation-message"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.pricePerHour}</Label>
                <Input
                  type="number"
                  value={newInvitation.pricePerHour}
                  onChange={(e) => setNewInvitation({ ...newInvitation, pricePerHour: e.target.value })}
                  placeholder="5000"
                  data-testid="input-price-per-hour"
                />
              </div>
              <div>
                <Label>{t.pricePerSession}</Label>
                <Input
                  type="number"
                  value={newInvitation.pricePerSession}
                  onChange={(e) => setNewInvitation({ ...newInvitation, pricePerSession: e.target.value })}
                  placeholder="10000"
                  data-testid="input-price-per-session"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowInviteDialog(false)} 
              data-testid="button-cancel-invitation"
            >
              {t.cancel}
            </Button>
            <Button 
              onClick={handleSendInvitation} 
              disabled={createInvitationMutation.isPending} 
              data-testid="button-submit-invitation"
            >
              <Send className="w-4 h-4 mr-2" />
              {t.sendInvitation}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {t.purchaseButton}
            </DialogTitle>
            <DialogDescription>
              {t.price}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>{t.paymentMethod}</Label>
              <Select 
                value={paymentMethod} 
                onValueChange={(value) => setPaymentMethod(value as 'stripe' | 'mtn')}
              >
                <SelectTrigger data-testid="select-payment-method">
                  <SelectValue placeholder={t.selectPaymentMethod} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe" data-testid="option-stripe">
                    💳 {t.stripe}
                  </SelectItem>
                  <SelectItem value="mtn" data-testid="option-mtn">
                    📱 {t.mtn}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {paymentProcessing && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">{t.paymentProcessing}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowPaymentDialog(false);
                setPaymentMethod('');
                setPaymentProcessing(false);
              }}
              disabled={paymentProcessing}
              data-testid="button-cancel-payment"
            >
              {t.cancel}
            </Button>
            <Button 
              onClick={handlePayment}
              disabled={!paymentMethod || paymentProcessing}
              data-testid="button-proceed-payment"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {t.proceedToPayment}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherIndependentCourses;

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ModernStatsCard } from '@/components/ui/ModernCard';
import { 
  MessageSquare, Send, Users, User, School, Mail, Phone,
  Plus, Search, Filter, Reply, Forward, Archive,
  Clock, CheckCircle2, AlertCircle, Star
} from 'lucide-react';

interface Message {
  id: number;
  from: string;
  to: string;
  subject: string;
  content: string;
  type: 'parent' | 'student' | 'teacher' | 'direction';
  priority: 'normal' | 'urgent';
  status: 'sent' | 'delivered' | 'read' | 'unread';
  date: string;
  recipientIds: number[];
}

const EnhancedTeacherCommunications: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTab, setSelectedTab] = useState<string>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    type: 'parent',
    schoolId: '',
    recipientIds: [] as number[],
    subject: '',
    content: '',
    priority: 'normal' as 'normal' | 'urgent'
  });

  const translations = {
    fr: {
      title: 'Communications Enseignant',
      subtitle: 'Messagerie avec parents, élèves et administration',
      inbox: 'Messages reçus',
      sent: 'Messages envoyés',
      compose: 'Nouveau message',
      composeMessage: 'Composer un message',
      messageType: 'Type de destinataire',
      toParents: 'Aux parents',
      toStudents: 'Aux élèves',
      toTeachers: 'Aux collègues',
      toDirection: 'À la direction',
      selectSchool: 'Sélectionner l\'établissement',
      allSchools: 'Tous les établissements',
      selectRecipients: 'Sélectionner destinataires',
      allParentsMyClass: 'Tous les parents de mes classes',
      specificParents: 'Parents spécifiques',
      allStudentsMyClass: 'Tous les élèves de mes classes',
      specificStudents: 'Élèves spécifiques',
      allTeachers: 'Tous les collègues enseignants',
      direction: 'Direction de l\'établissement',
      subject: 'Sujet',
      content: 'Contenu du message',
      priority: 'Priorité',
      normal: 'Normal',
      urgent: 'Urgent',
      send: 'Envoyer',
      cancel: 'Annuler',
      reply: 'Répondre',
      forward: 'Transférer',
      archive: 'Archiver',
      from: 'De',
      to: 'À',
      date: 'Date',
      status: 'Statut',
      unread: 'Non lu',
      totalMessages: 'Messages totaux',
      unreadMessages: 'Non lus',
      sentToday: 'Envoyés aujourd\'hui',
      recipients: 'Destinataires',
      messageSent: 'Message envoyé avec succès',
      noMessages: 'Aucun message'
    },
    en: {
      title: 'Teacher Communications',
      subtitle: 'Messaging with parents, students and administration',
      inbox: 'Inbox',
      sent: 'Sent',
      compose: 'New message',
      composeMessage: 'Compose message',
      messageType: 'Recipient type',
      toParents: 'To parents',
      toStudents: 'To students',
      toTeachers: 'To colleagues',
      toDirection: 'To administration',
      selectSchool: 'Select school',
      allSchools: 'All schools',
      selectRecipients: 'Select recipients',
      allParentsMyClass: 'All parents in my classes',
      specificParents: 'Specific parents',
      allStudentsMyClass: 'All students in my classes',
      specificStudents: 'Specific students',
      allTeachers: 'All teacher colleagues',
      direction: 'School administration',
      subject: 'Subject',
      content: 'Message content',
      priority: 'Priority',
      normal: 'Normal',
      urgent: 'Urgent',
      send: 'Send',
      cancel: 'Cancel',
      reply: 'Reply',
      forward: 'Forward',
      archive: 'Archive',
      from: 'From',
      to: 'To',
      date: 'Date',
      status: 'Status',
      unread: 'Unread',
      totalMessages: 'Total messages',
      unreadMessages: 'Unread',
      sentToday: 'Sent today',
      recipients: 'Recipients',
      messageSent: 'Message sent successfully',
      noMessages: 'No messages'
    }
  };

  const t = translations[language as keyof typeof translations];

  // Fetch teacher's communications
  const { data: communications = [], isLoading } = useQuery({
    queryKey: ['/api/teacher/communications'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/communications', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch communications');
      return response.json();
    }
  });

  // Fetch teacher's schools and classes
  const { data: teacherSchools = [] } = useQuery({
    queryKey: ['/api/teacher/schools'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/schools', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch schools');
      return response.json();
    }
  });

  // Fetch teacher's classes across all schools
  const { data: myClasses = [] } = useQuery({
    queryKey: ['/api/teacher/classes'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/classes', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch classes');
      return response.json();
    }
  });

  // Fetch all parents for teacher's students
  const { data: parents = [] } = useQuery({
    queryKey: ['/api/teacher/parents'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/parents', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch parents');
      return response.json();
    }
  });

  // Fetch all students in teacher's classes
  const { data: students = [] } = useQuery({
    queryKey: ['/api/teacher/students'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/students', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch students');
      return response.json();
    }
  });

  // Fetch all teachers across all schools where this teacher works
  const { data: teachers = [] } = useQuery({
    queryKey: ['/api/teacher/colleagues'],
    queryFn: async () => {
      const response = await fetch('/api/teacher/colleagues', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch colleagues');
      return response.json();
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await fetch('/api/teacher/communications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(messageData)
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/communications'] });
      toast({
        title: t.messageSent,
        description: language === 'fr' ? 'Votre message a été envoyé et les destinataires seront notifiés' : 'Your message has been sent and recipients will be notified'
      });
      setShowCompose(false);
      setComposeData({
        type: 'parent',
        schoolId: '',
        recipientIds: [],
        subject: '',
        content: '',
        priority: 'normal'
      });
    },
    onError: (error) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Échec de l\'envoi du message' : 'Failed to send message',
        variant: 'destructive'
      });
    }
  });

  // Calculate statistics
  const stats = [
    {
      title: t.totalMessages,
      value: communications.length.toString(),
      icon: <MessageSquare className="w-5 h-5" />,
      gradient: 'blue' as const
    },
    {
      title: t.unreadMessages,
      value: communications.filter((m: Message) => m.status === 'unread').length.toString(),
      icon: <AlertCircle className="w-5 h-5" />,
      gradient: 'orange' as const
    },
    {
      title: t.sentToday,
      value: communications.filter((m: Message) => 
        m.date.startsWith(new Date().toISOString().split('T')[0])
      ).length.toString(),
      icon: <Send className="w-5 h-5" />,
      gradient: 'green' as const
    },
    {
      title: t.recipients,
      value: (parents.length + students.length + teachers.length).toString(),
      icon: <Users className="w-5 h-5" />,
      gradient: 'purple' as const
    }
  ];

  const handleSendMessage = () => {
    if (!composeData.subject.trim() || !composeData.content.trim() || composeData.recipientIds.length === 0) {
      toast({
        title: language === 'fr' ? 'Champs requis' : 'Required fields',
        description: language === 'fr' ? 'Veuillez remplir tous les champs obligatoires' : 'Please fill all required fields',
        variant: 'destructive'
      });
      return;
    }

    sendMessageMutation.mutate({
      ...composeData,
      senderId: user?.id,
      senderName: (user as any)?.name || 'Teacher',
      senderRole: 'Teacher'
    });
  };

  const getRecipientOptions = () => {
    switch (composeData.type) {
      case 'parent':
        const parentOptions = [
          { id: 'all-parents', name: 'Tous les parents', label: t.allParentsMyClass },
          ...parents.map((parent: any) => ({
            id: parent.id,
            name: parent.name,
            label: `${parent.name} (Parent de ${parent.studentName})`
          }))
        ];
        return parentOptions;
      case 'student':
        const studentOptions = [
          { id: 'all-students', name: 'Tous les élèves', label: t.allStudentsMyClass },
          ...students.map((student: any) => ({
            id: student.id,
            name: student.name,
            label: `${student.name} (${student.className})`
          }))
        ];
        return studentOptions;
      case 'teacher':
        const teacherOptions = [
          { id: 'all-teachers', name: 'Tous les enseignants', label: t.allTeachers },
          ...teachers.map((teacher: any) => ({
            id: teacher.id,
            name: teacher.name,
            label: `${teacher.name} (${teacher.subject || teacher.schoolName})`
          }))
        ];
        return teacherOptions;
      case 'direction':
        return [
          { id: 'direction-main', name: 'Direction principale', label: 'Direction de l\'école principale' },
          { id: 'all-directions', name: 'Toutes les directions', label: 'Directions de tous les établissements' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowCompose(true)}
          data-testid="button-compose-message"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.compose}
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <ModernStatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="inbox" data-testid="tab-inbox">{t.inbox}</TabsTrigger>
          <TabsTrigger value="sent" data-testid="tab-sent">{t.sent}</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t.inbox}</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" data-testid="button-search">
                    <Search className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-filter">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {communications.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noMessages}</h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {communications.map((message: Message) => (
                    <div
                      key={message.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedMessage(message)}
                      data-testid={`message-${message.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold">{message.from}</span>
                            <Badge variant="outline">{message.type}</Badge>
                            {message.priority === 'urgent' && (
                              <Badge variant="destructive">
                                <Star className="w-3 h-3 mr-1" />
                                Urgent
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-medium mb-1">{message.subject}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{new Date(message.date).toLocaleDateString()}</p>
                          <Badge variant={message.status === 'unread' ? 'destructive' : 'secondary'}>
                            {message.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">{t.sent}</h3>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Messages envoyés</h3>
                <p className="text-gray-600">Vos messages envoyés apparaîtront ici</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{t.composeMessage}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCompose(false)}
                  data-testid="button-close-compose"
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.selectSchool}</label>
                  <Select 
                    value={composeData.schoolId} 
                    onValueChange={(value) => setComposeData({...composeData, schoolId: value, recipientIds: []})}
                  >
                    <SelectTrigger data-testid="select-school">
                      <SelectValue placeholder={t.selectSchool} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.allSchools}</SelectItem>
                      {teacherSchools.map((school: any) => (
                        <SelectItem key={school.id} value={school.id.toString()}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.messageType}</label>
                  <Select 
                    value={composeData.type} 
                    onValueChange={(value) => setComposeData({...composeData, type: value, recipientIds: []})}
                  >
                    <SelectTrigger data-testid="select-message-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">{t.toParents}</SelectItem>
                      <SelectItem value="student">{t.toStudents}</SelectItem>
                      <SelectItem value="teacher">{t.toTeachers}</SelectItem>
                      <SelectItem value="direction">{t.toDirection}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.selectRecipients}</label>
                  <Select 
                    value={composeData.recipientIds[0]?.toString() || ''} 
                    onValueChange={(value) => {
                      // Handle special group selections
                      if (value.startsWith('all-') || value.includes('direction')) {
                        setComposeData({...composeData, recipientIds: [value as any]});
                      } else {
                        setComposeData({...composeData, recipientIds: [parseInt(value)]});
                      }
                    }}
                  >
                    <SelectTrigger data-testid="select-recipients">
                      <SelectValue placeholder={t.selectRecipients} />
                    </SelectTrigger>
                    <SelectContent>
                      {getRecipientOptions().map((option: any) => (
                        <SelectItem key={option.id} value={option.id.toString()}>
                          <span className={option.id.toString().startsWith('all-') ? 'font-semibold text-blue-600' : ''}>
                            {option.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">{t.subject}</label>
                  <Input
                    value={composeData.subject}
                    onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
                    placeholder={t.subject}
                    data-testid="input-subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.priority}</label>
                  <Select 
                    value={composeData.priority} 
                    onValueChange={(value: 'normal' | 'urgent') => setComposeData({...composeData, priority: value})}
                  >
                    <SelectTrigger data-testid="select-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">{t.normal}</SelectItem>
                      <SelectItem value="urgent">{t.urgent}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">{t.content}</label>
                  <Textarea
                    value={composeData.content}
                    onChange={(e) => setComposeData({...composeData, content: e.target.value})}
                    rows={6}
                    placeholder={t.content}
                    data-testid="textarea-content"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCompose(false)}
                    className="flex-1"
                    data-testid="button-cancel"
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={sendMessageMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    data-testid="button-send"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sendMessageMutation.isPending ? 'Envoi...' : t.send}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTeacherCommunications;
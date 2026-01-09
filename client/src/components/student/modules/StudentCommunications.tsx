import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, Eye, RefreshCw, 
  AlertCircle, CheckCircle, Clock, Users, Send, Heart,
  GraduationCap, Building2, Inbox
} from 'lucide-react';

interface Parent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  relationship: string;
  displayName: string;
}

interface Message {
  id: number;
  from: string;
  fromRole: string;
  subject: string;
  message: string;
  content: string;
  date: string;
  read: boolean;
  isRead: boolean;
  type: string;
  priority: string;
  status: string;
}

const StudentCommunications: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isParentMessageOpen, setIsParentMessageOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [parentForm, setParentForm] = useState({
    parentId: '',
    subject: '',
    message: ''
  });

  const text = {
    fr: {
      title: 'Mes Messages',
      subtitle: 'Recevez des messages de toute l\'école, répondez à vos parents',
      loading: 'Chargement des messages...',
      error: 'Erreur lors du chargement des messages',
      noMessages: 'Aucun message',
      noParents: 'Aucun parent lié à votre compte',
      noParentsInfo: 'Contactez l\'administration de votre école pour lier vos parents à votre compte.',
      refresh: 'Actualiser',
      markRead: 'Marquer comme lu',
      from: 'De',
      subject: 'Objet',
      date: 'Date',
      writeToParent: 'Écrire à mes parents',
      selectParent: 'Choisir un parent',
      messageSubject: 'Sujet du message',
      messageContent: 'Votre message',
      send: 'Envoyer',
      sending: 'Envoi en cours...',
      subjectPlaceholder: 'Ex: Besoin de matériel scolaire',
      contentPlaceholder: 'Tapez votre message ici...',
      selectRecipient: 'Veuillez sélectionner un destinataire',
      messageSent: 'Message envoyé',
      messageSentDesc: 'Votre message a été envoyé à votre parent',
      cancel: 'Annuler',
      allMessages: 'Tous',
      fromParents: 'Parents',
      fromTeachers: 'Enseignants',
      fromSchool: 'École',
      sendInfo: 'Vous pouvez uniquement envoyer des messages à vos parents',
      priority: {
        urgent: 'Urgent',
        high: 'Important',
        normal: 'Normal',
        low: 'Info'
      },
      status: {
        read: 'Lu',
        unread: 'Non lu'
      },
      notificationInfo: 'Notification: Email + Application',
      parentRelationship: {
        father: 'Père',
        mother: 'Mère',
        guardian: 'Tuteur',
        Parent: 'Parent'
      },
      roles: {
        Parent: 'Parent',
        Teacher: 'Enseignant',
        Director: 'Directeur',
        Admin: 'Administration',
        School: 'École'
      }
    },
    en: {
      title: 'My Messages',
      subtitle: 'Receive messages from everyone, reply only to your parents',
      loading: 'Loading messages...',
      error: 'Error loading messages',
      noMessages: 'No messages',
      noParents: 'No parents linked to your account',
      noParentsInfo: 'Contact your school administration to link your parents to your account.',
      refresh: 'Refresh',
      markRead: 'Mark as read',
      from: 'From',
      subject: 'Subject',
      date: 'Date',
      writeToParent: 'Write to my parents',
      selectParent: 'Choose a parent',
      messageSubject: 'Message subject',
      messageContent: 'Your message',
      send: 'Send',
      sending: 'Sending...',
      subjectPlaceholder: 'Ex: Need school supplies',
      contentPlaceholder: 'Type your message here...',
      selectRecipient: 'Please select a recipient',
      messageSent: 'Message sent',
      messageSentDesc: 'Your message has been sent to your parent',
      cancel: 'Cancel',
      allMessages: 'All',
      fromParents: 'Parents',
      fromTeachers: 'Teachers',
      fromSchool: 'School',
      sendInfo: 'You can only send messages to your parents',
      priority: {
        urgent: 'Urgent',
        high: 'Important',
        normal: 'Normal',
        low: 'Info'
      },
      status: {
        read: 'Read',
        unread: 'Unread'
      },
      notificationInfo: 'Notification: Email + App',
      parentRelationship: {
        father: 'Father',
        mother: 'Mother',
        guardian: 'Guardian',
        Parent: 'Parent'
      },
      roles: {
        Parent: 'Parent',
        Teacher: 'Teacher',
        Director: 'Director',
        Admin: 'Administration',
        School: 'School'
      }
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch parents for this student - REAL DATABASE
  const { data: parents = [], isLoading: parentsLoading } = useQuery<Parent[]>({
    queryKey: ['/api/student/parents'],
    enabled: !!user
  });

  // Fetch ALL messages from API - REAL DATABASE (from all senders)
  const { data: messages = [], isLoading: messagesLoading, error, refetch } = useQuery<Message[]>({
    queryKey: ['/api/student/messages'],
    enabled: !!user
  });

  // Filter messages by sender type for tabs
  const allMessages = messages || [];
  const parentMessages = allMessages.filter((msg: Message) => 
    msg.fromRole === 'Parent' || msg.type === 'family'
  );
  const teacherMessages = allMessages.filter((msg: Message) => 
    msg.fromRole === 'Teacher'
  );
  const schoolMessages = allMessages.filter((msg: Message) => 
    msg.fromRole === 'Director' || msg.fromRole === 'Admin' || msg.fromRole === 'School' || msg.type === 'school'
  );

  // Get messages for current tab
  const getFilteredMessages = () => {
    switch (activeTab) {
      case 'parents': return parentMessages;
      case 'teachers': return teacherMessages;
      case 'school': return schoolMessages;
      default: return allMessages;
    }
  };

  const filteredMessages = getFilteredMessages();

  // Send message to parent mutation (ONLY TO PARENTS)
  const sendParentMessageMutation = useMutation({
    mutationFn: async (messageData: { parentId: string; subject: string; message: string }) => {
      const response = await fetch('/api/student/messages/parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...messageData,
          notificationChannels: ['pwa', 'email']
        }),
        credentials: 'include'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message to parent');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/student/messages'] });
      setIsParentMessageOpen(false);
      setParentForm({ parentId: '', subject: '', message: '' });
      toast({
        title: t.messageSent,
        description: t.messageSentDesc
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer le message.',
        variant: 'destructive'
      });
    }
  });

  const handleSendToParent = () => {
    if (parentForm.parentId && parentForm.subject && parentForm.message) {
      sendParentMessageMutation.mutate(parentForm);
    } else {
      toast({
        title: 'Information manquante',
        description: t.selectRecipient,
        variant: 'destructive'
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Parent': return <Heart className="w-4 h-4 text-pink-500" />;
      case 'Teacher': return <GraduationCap className="w-4 h-4 text-blue-500" />;
      case 'Director':
      case 'Admin':
      case 'School': return <Building2 className="w-4 h-4 text-purple-500" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role: string) => {
    const key = role as keyof typeof t.roles;
    return t.roles[key] || role;
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: t.refresh,
      description: language === 'fr' ? 'Messages actualisés' : 'Messages refreshed'
    });
  };

  const handleMarkRead = async (messageId: number) => {
    try {
      await fetch(`/api/student/messages/${messageId}/read`, {
        method: 'POST',
        credentials: 'include'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/student/messages'] });
      toast({
        title: t.markRead,
        description: language === 'fr' ? 'Message marqué comme lu' : 'Message marked as read'
      });
    } catch {
      // Silent fail - already attempted
    }
  };

  const getRelationshipLabel = (relationship: string) => {
    const key = relationship as keyof typeof t.parentRelationship;
    return t.parentRelationship[key] || relationship;
  };

  const isLoading = parentsLoading || messagesLoading;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>{t.loading}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{t.error}</p>
            <Button onClick={handleRefresh} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t.refresh}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl md:text-3xl font-bold">{t.title}</h1>
          </div>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t.refresh}
        </Button>
      </div>

      {/* Write to Parents Section - ONLY SEND TO PARENTS */}
      <Card className="mb-6 border-pink-200 bg-gradient-to-r from-pink-50 to-white">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              <h3 className="text-lg font-semibold text-pink-700">{t.writeToParent}</h3>
            </div>
            <Badge variant="outline" className="text-xs text-pink-600 border-pink-300">
              {t.sendInfo}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {parents.length === 0 ? (
            <div className="text-center py-6">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">{t.noParents}</p>
              <p className="text-sm text-gray-500 mt-1">{t.noParentsInfo}</p>
            </div>
          ) : (
            <Dialog open={isParentMessageOpen} onOpenChange={setIsParentMessageOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-pink-500 hover:bg-pink-600 w-full" 
                  data-testid="button-write-parent"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {t.writeToParent}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-white">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    {t.writeToParent}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{t.selectParent}</label>
                    <Select 
                      value={parentForm.parentId} 
                      onValueChange={(value) => setParentForm(prev => ({ ...prev, parentId: value }))}
                    >
                      <SelectTrigger data-testid="select-parent">
                        <SelectValue placeholder={t.selectParent} />
                      </SelectTrigger>
                      <SelectContent>
                        {parents.map((parent: Parent) => (
                          <SelectItem key={parent.id} value={parent.id.toString()}>
                            {parent.displayName} ({getRelationshipLabel(parent.relationship)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t.messageSubject}</label>
                    <Input
                      value={parentForm.subject}
                      onChange={(e) => setParentForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder={t.subjectPlaceholder}
                      data-testid="input-parent-subject"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t.messageContent}</label>
                    <Textarea
                      value={parentForm.message}
                      onChange={(e) => setParentForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder={t.contentPlaceholder}
                      rows={4}
                      data-testid="textarea-parent-message"
                    />
                  </div>
                  <div className="text-xs text-pink-600 flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {t.notificationInfo}
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleSendToParent}
                      disabled={sendParentMessageMutation.isPending || !parentForm.parentId || !parentForm.subject || !parentForm.message}
                      className="flex-1 bg-pink-500 hover:bg-pink-600"
                      data-testid="button-send-parent"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {sendParentMessageMutation.isPending ? t.sending : t.send}
                    </Button>
                    <Button variant="outline" onClick={() => setIsParentMessageOpen(false)}>
                      {t.cancel}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>

      {/* Messages List - FROM ALL PROFILES */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {language === 'fr' ? 'Messages reçus' : 'Received messages'}
          </h3>
        </CardHeader>
        <CardContent>
          {/* Filter Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1.5 bg-[#F3F5F7] rounded-xl gap-1">
              <TabsTrigger value="all" className="flex items-center justify-center gap-1 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm">
                <Inbox className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline truncate">{t.allMessages}</span>
                <Badge variant="secondary" className="ml-1 text-xs">{allMessages.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="parents" className="flex items-center justify-center gap-1 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm">
                <Heart className="w-4 h-4 text-pink-500 flex-shrink-0" />
                <span className="hidden sm:inline truncate">{t.fromParents}</span>
                <Badge variant="secondary" className="ml-1 text-xs">{parentMessages.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="teachers" className="flex items-center justify-center gap-1 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm">
                <GraduationCap className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="hidden sm:inline truncate">{t.fromTeachers}</span>
                <Badge variant="secondary" className="ml-1 text-xs">{teacherMessages.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="school" className="flex items-center justify-center gap-1 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm">
                <Building2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <span className="hidden sm:inline truncate">{t.fromSchool}</span>
                <Badge variant="secondary" className="ml-1 text-xs">{schoolMessages.length}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{t.noMessages}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((message: Message) => (
                <div 
                  key={message.id} 
                  className={`p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                    !message.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : 'bg-white'
                  }`}
                  onClick={() => setSelectedMessage(message)}
                  data-testid={`message-item-${message.id}`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex-1">
                      {/* Message Header */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {getRoleIcon(message.fromRole)}
                          <span className="font-semibold text-gray-900">{message.from}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {getRoleLabel(message.fromRole)}
                        </Badge>
                        <Badge variant="outline" className={`${getPriorityColor(message.priority)} text-white text-xs`}>
                          {t.priority[message.priority as keyof typeof t.priority] || message.priority}
                        </Badge>
                        {!message.isRead && (
                          <Badge className="bg-blue-500 text-white text-xs">
                            {t.status.unread}
                          </Badge>
                        )}
                      </div>

                      {/* Subject */}
                      <h4 className="font-medium text-gray-900 mb-1">
                        {message.subject}
                      </h4>

                      {/* Message Preview */}
                      <p className="text-gray-600 text-sm mb-2">
                        {(message.message || message.content)?.length > 100 
                          ? `${(message.message || message.content).substring(0, 100)}...` 
                          : (message.message || message.content)
                        }
                      </p>

                      {/* Date */}
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {message.date}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!message.isRead && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkRead(message.id);
                          }}
                          className="text-xs"
                          data-testid={`button-mark-read-${message.id}`}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t.markRead}
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMessage(message);
                        }}
                        className="text-xs"
                        data-testid={`button-view-${message.id}`}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        {language === 'fr' ? 'Voir' : 'View'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="sm:max-w-[600px] bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getRoleIcon(selectedMessage.fromRole)}
                {selectedMessage.subject}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">{t.from}:</span> {selectedMessage.from}
                  <Badge variant="outline" className="ml-2 text-xs">
                    {getRoleLabel(selectedMessage.fromRole)}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">{t.date}:</span> {selectedMessage.date}
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="whitespace-pre-wrap">{selectedMessage.message || selectedMessage.content}</p>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                {/* Only show reply for parent messages */}
                {selectedMessage.fromRole === 'Parent' && parents.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const parentMatch = parents.find(p => 
                        selectedMessage.from.includes(p.firstName) || selectedMessage.from.includes(p.lastName)
                      );
                      if (parentMatch) {
                        setParentForm({
                          parentId: parentMatch.id.toString(),
                          subject: `Re: ${selectedMessage.subject}`,
                          message: ''
                        });
                        setSelectedMessage(null);
                        setIsParentMessageOpen(true);
                      }
                    }}
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Répondre' : 'Reply'}
                  </Button>
                )}
                <Button onClick={() => setSelectedMessage(null)}>
                  {language === 'fr' ? 'Fermer' : 'Close'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StudentCommunications;

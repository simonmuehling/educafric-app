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
import { 
  MessageSquare, Eye, Reply, RefreshCw, 
  AlertCircle, CheckCircle, Clock, Users, Send, Heart
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
  const [parentForm, setParentForm] = useState({
    parentId: '',
    subject: '',
    message: ''
  });

  const text = {
    fr: {
      title: 'Messages Famille',
      subtitle: 'Communiquer avec mes parents',
      loading: 'Chargement des messages...',
      error: 'Erreur lors du chargement des messages',
      noMessages: 'Aucun message',
      noParents: 'Aucun parent lié à votre compte',
      noParentsInfo: 'Contactez l\'administration de votre école pour lier vos parents à votre compte.',
      refresh: 'Actualiser',
      markRead: 'Marquer comme lu',
      reply: 'Répondre',
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
      }
    },
    en: {
      title: 'Family Messages',
      subtitle: 'Communicate with my parents',
      loading: 'Loading messages...',
      error: 'Error loading messages',
      noMessages: 'No messages',
      noParents: 'No parents linked to your account',
      noParentsInfo: 'Contact your school administration to link your parents to your account.',
      refresh: 'Refresh',
      markRead: 'Mark as read',
      reply: 'Reply',
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
      }
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch parents for this student - REAL DATABASE
  const { data: parents = [], isLoading: parentsLoading } = useQuery<Parent[]>({
    queryKey: ['/api/student/parents'],
    enabled: !!user
  });

  // Fetch messages from API - REAL DATABASE
  const { data: messages = [], isLoading: messagesLoading, error, refetch } = useQuery<Message[]>({
    queryKey: ['/api/student/messages'],
    enabled: !!user
  });

  // Filter messages to show only parent messages
  const parentMessages = (messages || []).filter((msg: Message) => 
    msg.fromRole === 'Parent' || msg.type === 'family'
  );

  // Send message to parent mutation
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

  const handleRefresh = () => {
    refetch();
    toast({
      title: t.refresh,
      description: language === 'fr' ? 'Messages actualisés' : 'Messages refreshed'
    });
  };

  const handleMarkRead = (messageId: number) => {
    toast({
      title: t.markRead,
      description: language === 'fr' ? 'Message marqué comme lu' : 'Message marked as read'
    });
  };

  const handleReply = (message: Message) => {
    // Pre-fill form with parent info for reply
    const parentMatch = parents.find(p => 
      message.from.includes(p.firstName) || message.from.includes(p.lastName)
    );
    if (parentMatch) {
      setParentForm({
        parentId: parentMatch.id.toString(),
        subject: `Re: ${message.subject}`,
        message: ''
      });
      setIsParentMessageOpen(true);
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
            <Heart className="w-8 h-8 text-pink-500" />
            <h1 className="text-2xl md:text-3xl font-bold">{t.title}</h1>
          </div>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
          <p className="text-xs text-blue-600 mt-1">{t.notificationInfo}</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t.refresh}
        </Button>
      </div>

      {/* Write to Parents Section */}
      <Card className="mb-6 border-pink-200 bg-gradient-to-r from-pink-50 to-white">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-500" />
            <h3 className="text-lg font-semibold text-pink-700">{t.writeToParent}</h3>
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

      {/* Messages List - Only from Parents */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {language === 'fr' ? 'Messages de mes parents' : 'Messages from my parents'}
          </h3>
        </CardHeader>
        <CardContent>
          {parentMessages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{t.noMessages}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {parentMessages.map((message: Message) => (
                <div 
                  key={message.id} 
                  className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                    !message.isRead ? 'border-l-4 border-l-pink-500 bg-pink-50' : 'bg-white'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex-1">
                      {/* Message Header */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-pink-500" />
                          <span className="font-semibold text-gray-900">{message.from}</span>
                        </div>
                        <Badge variant="outline" className={`${getPriorityColor(message.priority)} text-white text-xs`}>
                          {t.priority[message.priority as keyof typeof t.priority]}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {message.isRead ? t.status.read : t.status.unread}
                        </Badge>
                      </div>

                      {/* Subject */}
                      <h4 className="font-medium text-gray-900 mb-1">
                        {message.subject}
                      </h4>

                      {/* Message Preview */}
                      <p className="text-gray-600 text-sm mb-2">
                        {message.message?.length > 100 
                          ? `${message.message.substring(0, 100)}...` 
                          : message.message
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
                          onClick={() => handleMarkRead(message.id)}
                          className="text-xs"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t.markRead}
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleReply(message)}
                        className="text-xs"
                      >
                        <Reply className="w-3 h-3 mr-1" />
                        {t.reply}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedMessage(message)}
                        className="text-xs"
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
                <Heart className="w-5 h-5 text-pink-500" />
                {selectedMessage.subject}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">{t.from}:</span> {selectedMessage.from}
                </div>
                <div>
                  <span className="font-medium">{t.date}:</span> {selectedMessage.date}
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="whitespace-pre-wrap">{selectedMessage.message || selectedMessage.content}</p>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleReply(selectedMessage)}
                >
                  <Reply className="w-4 h-4 mr-2" />
                  {t.reply}
                </Button>
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

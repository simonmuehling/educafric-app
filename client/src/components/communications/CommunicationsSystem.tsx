import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MessageSquare, Send, Users, User, School, Bell, Mail, Phone, 
  MessageCircle, Filter, Search, Plus, Eye, Reply, Forward, 
  Trash2, Star, Archive, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  recipientType: 'individual' | 'class' | 'all_teachers' | 'all_parents' | 'all_students' | 'all';
  recipientIds: number[];
  subject: string;
  content: string;
  category: 'academic' | 'administrative' | 'urgent' | 'general';
  channels: ('email' | 'sms' | 'app')[];
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments?: string[];
  sentAt: string;
  readAt?: string;
  replies?: Message[];
}

interface CommunicationsSystemProps {
  userRole: 'Director' | 'Teacher' | 'Student' | 'Parent' | 'Admin';
}

const CommunicationsSystem: React.FC<CommunicationsSystemProps> = ({ userRole }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('inbox');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const [newMessage, setNewMessage] = useState({
    recipientType: 'individual',
    recipientIds: [],
    subject: '',
    content: '',
    category: 'general',
    channels: ['app'],
    priority: 'medium'
  });

  // Fetch messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/messages', activeTab, filterCategory, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({ 
        type: activeTab,
        ...(filterCategory !== 'all' && { category: filterCategory }),
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await fetch(`/api/messages?${params}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    }
  });

  // Fetch recipients
  const { data: recipients = [] } = useQuery({
    queryKey: ['/api/recipients', newMessage.recipientType],
    queryFn: async () => {
      const response = await fetch(`/api/recipients?type=${newMessage.recipientType}`);
      if (!response.ok) throw new Error('Failed to fetch recipients');
      return response.json();
    },
    enabled: showComposeModal && newMessage.recipientType === 'individual'
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      setShowComposeModal(false);
      setNewMessage({
        recipientType: 'individual',
        recipientIds: [],
        subject: '',
        content: '',
        category: 'general',
        channels: ['app'],
        priority: 'medium'
      });
      toast({
        title: language === 'fr' ? 'Message envoyé' : 'Message sent',
        description: language === 'fr' ? 'Votre message a été envoyé avec succès' : 'Your message has been sent successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur lors de l\'envoi du message' : 'Error sending message',
        variant: 'destructive'
      });
    }
  });

  // Mark message as read mutation  
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.subject || !newMessage.content) {
      toast({
        title: language === 'fr' ? 'Champs requis' : 'Required fields',
        description: language === 'fr' ? 'Veuillez remplir le sujet et le contenu' : 'Please fill in subject and content',
        variant: 'destructive'
      });
      return;
    }

    sendMessageMutation.mutate(newMessage);
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
    
    // Mark as read if not already read
    if (!message.isRead) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const text = {
    fr: {
      title: 'Communications',
      subtitle: 'Système de messagerie avancé multi-canaux',
      tabs: {
        inbox: 'Boîte de réception',
        sent: 'Envoyés',
        drafts: 'Brouillons',
        archived: 'Archivés'
      },
      compose: 'Nouveau Message',
      reply: 'Répondre',
      forward: 'Transférer',
      archive: 'Archiver',
      delete: 'Supprimer',
      markRead: 'Marquer comme lu',
      markUnread: 'Marquer comme non lu',
      
      // Compose form
      recipient: 'Destinataire',
      recipientTypes: {
        individual: 'Individuel',
        class: 'Classe',
        all_teachers: 'Tous les enseignants',
        all_parents: 'Tous les parents',
        all_students: 'Tous les étudiants',
        all: 'Tous'
      },
      subject: 'Sujet',
      content: 'Message',
      category: 'Catégorie',
      categories: {
        academic: 'Académique',
        administrative: 'Administratif',
        urgent: 'Urgent',
        general: 'Général'
      },
      channels: 'Canaux de communication',
      channelOptions: {
        app: 'Application',
        email: 'Email',
        sms: 'SMS'
      },
      priority: 'Priorité',
      priorities: {
        low: 'Faible',
        medium: 'Moyenne',
        high: 'Élevée',
        urgent: 'Urgente'
      },
      send: 'Envoyer',
      cancel: 'Annuler',
      sending: 'Envoi...',
      
      // Messages
      from: 'De',
      to: 'À',
      sentAt: 'Envoyé le',
      readAt: 'Lu le',
      unread: 'Non lu',
      noMessages: 'Aucun message',
      
      // Stats
      totalMessages: 'Total Messages',
      unreadCount: 'Non lus',
      sentToday: 'Envoyés aujourd\'hui',
      pendingReplies: 'Réponses en attente'
    },
    en: {
      title: 'Communications',
      subtitle: 'Advanced multi-channel messaging system',
      tabs: {
        inbox: 'Inbox',
        sent: 'Sent',
        drafts: 'Drafts',
        archived: 'Archived'
      },
      compose: 'New Message',
      reply: 'Reply',
      forward: 'Forward',
      archive: 'Archive',
      delete: 'Delete',
      markRead: 'Mark as read',
      markUnread: 'Mark as unread',
      
      // Compose form
      recipient: 'Recipient',
      recipientTypes: {
        individual: 'Individual',
        class: 'Class',
        all_teachers: 'All Teachers',
        all_parents: 'All Parents',
        all_students: 'All Students',
        all: 'Everyone'
      },
      subject: 'Subject',
      content: 'Message',
      category: 'Category',
      categories: {
        academic: 'Academic',
        administrative: 'Administrative',
        urgent: 'Urgent',
        general: 'General'
      },
      channels: 'Communication Channels',
      channelOptions: {
        app: 'Application',
        email: 'Email',
        sms: 'SMS'
      },
      priority: 'Priority',
      priorities: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        urgent: 'Urgent'
      },
      send: 'Send',
      cancel: 'Cancel',
      sending: 'Sending...',
      
      // Messages
      from: 'From',
      to: 'To',
      sentAt: 'Sent at',
      readAt: 'Read at',
      unread: 'Unread',
      noMessages: 'No messages',
      
      // Stats
      totalMessages: 'Total Messages',
      unreadCount: 'Unread',
      sentToday: 'Sent Today',
      pendingReplies: 'Pending Replies'
    }
  };

  const t = text[language as keyof typeof text];

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      academic: 'bg-green-100 text-green-800',
      administrative: 'bg-purple-100 text-purple-800',
      urgent: 'bg-red-100 text-red-800',
      general: 'bg-blue-100 text-blue-800'
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  // Statistics
  const unreadCount = (Array.isArray(messages) ? messages : []).filter((m: Message) => !m.isRead).length;
  const todayMessages = (Array.isArray(messages) ? messages : []).filter((m: Message) => 
    new Date(m.sentAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                {t.title || ''}
              </h2>
              <p className="text-purple-100 mt-1">{t.subtitle}</p>
            </div>
            <Button 
              onClick={() => setShowComposeModal(true)}
              className="bg-white text-purple-600 hover:bg-purple-50"
              data-testid="button-compose-message"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t.compose}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t.totalMessages}</p>
                <p className="text-xl font-bold">{(Array.isArray(messages) ? messages.length : 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Bell className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t.unreadCount}</p>
                <p className="text-xl font-bold">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Send className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t.sentToday}</p>
                <p className="text-xl font-bold">{todayMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Reply className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t.pendingReplies}</p>
                <p className="text-xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={language === 'fr' ? 'Rechercher des messages...' : 'Search messages...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e?.target?.value)}
                  className="pl-10"
                  data-testid="input-search-messages"
                />
              </div>
            </div>
            <div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40" data-testid="select-filter-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'fr' ? 'Toutes catégories' : 'All categories'}</SelectItem>
                  {Object.entries(t.categories).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages Tabs */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              {Object.entries(t.tabs).map(([key, label]) => (
                <TabsTrigger key={key} value={key} data-testid={`tab-${key}`}>
                  {label}
                  {key === 'inbox' && unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="space-y-3">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-20"></div>
                    ))}
                  </div>
                ) : (Array.isArray(messages) ? messages.length : 0) === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t.noMessages}</p>
                  </div>
                ) : (
                  (Array.isArray(messages) ? messages : []).map((message: Message) => (
                    <div
                      key={message.id}
                      onClick={() => handleMessageClick(message)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        !message.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white'
                      }`}
                      data-testid={`message-${message.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{message.senderName}</span>
                            <Badge variant="outline" className="text-xs">
                              {message.senderRole}
                            </Badge>
                          </div>
                          {!message.isRead && (
                            <Badge variant="destructive" className="text-xs">
                              {t.unread}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(message.priority)}>
                            {t.priorities[message.priority as keyof typeof t.priorities]}
                          </Badge>
                          <Badge className={getCategoryColor(message.category)}>
                            {t.categories[message.category as keyof typeof t.categories]}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(message.sentAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold mb-1">{message.subject}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{message.content}</p>
                      
                      <div className="flex items-center gap-2 mt-3">
                        {(Array.isArray(message.channels) ? message.channels : []).map((channel) => (
                          <Badge key={channel} variant="secondary" className="text-xs">
                            {channel === 'email' && <Mail className="w-3 h-3 mr-1" />}
                            {channel === 'sms' && <Phone className="w-3 h-3 mr-1" />}
                            {channel === 'app' && <MessageCircle className="w-3 h-3 mr-1" />}
                            {t.channelOptions[channel as keyof typeof t.channelOptions]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Compose Message Modal */}
      <Dialog open={showComposeModal} onOpenChange={setShowComposeModal}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              {t.compose}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t.recipient}</Label>
                <Select 
                  value={newMessage.recipientType} 
                  onValueChange={(value) => setNewMessage({...newMessage, recipientType: value, recipientIds: []})}
                >
                  <SelectTrigger data-testid="select-recipient-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(t.recipientTypes).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t.priority}</Label>
                <Select 
                  value={newMessage.priority} 
                  onValueChange={(value) => setNewMessage({...newMessage, priority: value})}
                >
                  <SelectTrigger data-testid="select-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(t.priorities).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>{t.subject}</Label>
              <Input
                value={newMessage.subject}
                onChange={(e) => setNewMessage({...newMessage, subject: e?.target?.value})}
                placeholder={language === 'fr' ? 'Objet du message' : 'Message subject'}
                data-testid="input-message-subject"
              />
            </div>

            <div>
              <Label>{t.category}</Label>
              <Select 
                value={newMessage.category} 
                onValueChange={(value) => setNewMessage({...newMessage, category: value})}
              >
                <SelectTrigger data-testid="select-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(t.categories).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t.content}</Label>
              <Textarea
                value={newMessage.content}
                onChange={(e) => setNewMessage({...newMessage, content: e?.target?.value})}
                placeholder={language === 'fr' ? 'Tapez votre message ici...' : 'Type your message here...'}
                rows={6}
                data-testid="textarea-message-content"
              />
            </div>

            <div>
              <Label>{t.channels}</Label>
              <div className="flex gap-4 mt-2">
                {Object.entries(t.channelOptions).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={newMessage?.channels?.includes(key as any)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewMessage({
                            ...newMessage,
                            channels: [...newMessage.channels, key as any]
                          });
                        } else {
                          setNewMessage({
                            ...newMessage,
                            channels: (Array.isArray(newMessage.channels) ? newMessage.channels : []).filter(c => c !== key)
                          });
                        }
                      }}
                      data-testid={`checkbox-channel-${key}`}
                    />
                    <Label htmlFor={key} className="text-sm">{label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending}
                className="flex-1"
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4 mr-2" />
                {sendMessageMutation.isPending ? t.sending : t.send}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowComposeModal(false)}
                className="flex-1"
                data-testid="button-cancel-message"
              >
                {t.cancel}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="max-w-2xl bg-white">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    {selectedMessage.subject}
                  </span>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(selectedMessage.priority)}>
                      {t.priorities[selectedMessage.priority as keyof typeof t.priorities]}
                    </Badge>
                    <Badge className={getCategoryColor(selectedMessage.category)}>
                      {t.categories[selectedMessage.category as keyof typeof t.categories]}
                    </Badge>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{selectedMessage.senderName}</span>
                      <Badge variant="outline">{selectedMessage.senderRole}</Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(selectedMessage.sentAt).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {(Array.isArray(selectedMessage.channels) ? selectedMessage.channels : []).map((channel) => (
                      <Badge key={channel} variant="secondary" className="text-xs">
                        {channel === 'email' && <Mail className="w-3 h-3 mr-1" />}
                        {channel === 'sms' && <Phone className="w-3 h-3 mr-1" />}
                        {channel === 'app' && <MessageCircle className="w-3 h-3 mr-1" />}
                        {t.channelOptions[channel as keyof typeof t.channelOptions]}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1">
                    <Reply className="w-4 h-4 mr-2" />
                    {t.reply}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Forward className="w-4 h-4 mr-2" />
                    {t.forward}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Archive className="w-4 h-4 mr-2" />
                    {t.archive}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunicationsSystem;
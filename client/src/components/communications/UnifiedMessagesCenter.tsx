import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Mail, 
  Bell, 
  Users, 
  Search, 
  Plus, 
  CheckCircle, 
  Clock,
  Smartphone,
  Globe,
  Leaf,
  BarChart3,
  Filter,
  Star,
  Archive,
  Reply,
  Forward
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface UnifiedMessage {
  id: string;
  channel: 'sms' | 'whatsapp' | 'email' | 'pwa' | 'app';
  from: {
    name: string;
    role?: string;
    avatar?: string;
  };
  to: {
    name: string;
    role?: string;
  };
  subject?: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'academic' | 'administrative' | 'financial' | 'security' | 'general';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  attachments?: string[];
  isRead: boolean;
  isStarred?: boolean;
  threadId?: string;
}

interface UnifiedMessagesCenterProps {
  className?: string;
}

const UnifiedMessagesCenter: React.FC<UnifiedMessagesCenterProps> = ({ className = '' }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChannel, setFilterChannel] = useState('all');
  const [showComposer, setShowComposer] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<UnifiedMessage | null>(null);

  const [newMessage, setNewMessage] = useState({
    recipients: '',
    subject: '',
    content: '',
    channel: 'app' as const,
    priority: 'medium' as const,
    category: 'general' as const
  });

  const text = {
    fr: {
      title: 'Messages Unifiés',
      subtitle: 'Tous vos canaux de communication en un seul endroit - Simple et efficace',
      environmental: 'Réduisons l\'usage du papier ensemble',
      
      tabs: {
        all: 'Tous les Messages',
        inbox: 'Boîte de Réception',
        sent: 'Envoyés',
        starred: 'Favoris',
        archived: 'Archivés'
      },
      
      channels: {
        all: 'Tous les Canaux',
        sms: 'SMS',
        whatsapp: 'WhatsApp',
        email: 'Email',
        pwa: 'Notifications PWA',
        app: 'Application'
      },
      
      stats: {
        totalMessages: 'Messages Totaux',
        unreadCount: 'Non Lus',
        sentToday: 'Envoyés Aujourd\'hui',
        savedPaper: 'Papier Économisé'
      },
      
      composer: {
        title: 'Nouveau Message',
        recipients: 'Destinataires',
        subject: 'Sujet',
        content: 'Message',
        channel: 'Canal',
        priority: 'Priorité',
        category: 'Catégorie',
        send: 'Envoyer',
        cancel: 'Annuler',
        sending: 'Envoi...'
      },
      
      actions: {
        compose: 'Composer',
        reply: 'Répondre',
        forward: 'Transférer',
        star: 'Favori',
        archive: 'Archiver',
        delete: 'Supprimer',
        markRead: 'Marquer Lu'
      },
      
      categories: {
        academic: 'Académique',
        administrative: 'Administratif', 
        financial: 'Financier',
        security: 'Sécurité',
        general: 'Général'
      },
      
      priorities: {
        low: 'Faible',
        medium: 'Moyenne',
        high: 'Élevée',
        urgent: 'Urgent'
      },
      
      status: {
        sent: 'Envoyé',
        delivered: 'Livré',
        read: 'Lu',
        failed: 'Échec'
      },
      
      placeholders: {
        search: 'Rechercher des messages...',
        recipients: 'Entrer les destinataires...',
        subject: 'Sujet du message...',
        content: 'Tapez votre message ici...'
      },
      
      noMessages: 'Aucun message trouvé',
      environmentalImpact: 'feuilles économisées ce mois'
    },
    
    en: {
      title: 'Unified Messages',
      subtitle: 'All your communication channels in one place - Simple and efficient',
      environmental: 'Let\'s reduce paper usage together',
      
      tabs: {
        all: 'All Messages',
        inbox: 'Inbox',
        sent: 'Sent',
        starred: 'Starred',
        archived: 'Archived'
      },
      
      channels: {
        all: 'All Channels',
        sms: 'SMS',
        whatsapp: 'WhatsApp',
        email: 'Email',
        pwa: 'PWA Notifications',
        app: 'Application'
      },
      
      stats: {
        totalMessages: 'Total Messages',
        unreadCount: 'Unread',
        sentToday: 'Sent Today',
        savedPaper: 'Paper Saved'
      },
      
      composer: {
        title: 'New Message',
        recipients: 'Recipients',
        subject: 'Subject',
        content: 'Message',
        channel: 'Channel',
        priority: 'Priority',
        category: 'Category',
        send: 'Send',
        cancel: 'Cancel',
        sending: 'Sending...'
      },
      
      actions: {
        compose: 'Compose',
        reply: 'Reply',
        forward: 'Forward',
        star: 'Star',
        archive: 'Archive',
        delete: 'Delete',
        markRead: 'Mark Read'
      },
      
      categories: {
        academic: 'Academic',
        administrative: 'Administrative',
        financial: 'Financial',
        security: 'Security',
        general: 'General'
      },
      
      priorities: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        urgent: 'Urgent'
      },
      
      status: {
        sent: 'Sent',
        delivered: 'Delivered',
        read: 'Read',
        failed: 'Failed'
      },
      
      placeholders: {
        search: 'Search messages...',
        recipients: 'Enter recipients...',
        subject: 'Message subject...',
        content: 'Type your message here...'
      },
      
      noMessages: 'No messages found',
      environmentalImpact: 'sheets saved this month'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch unified messages from all channels
  const { data: messages = [], isLoading } = useQuery<UnifiedMessage[]>({
    queryKey: ['/api/messages/unified', activeTab, filterChannel, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        tab: activeTab,
        ...(filterChannel !== 'all' && { channel: filterChannel }),
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await fetch(`/api/messages/unified?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: typeof newMessage) => {
      const response = await fetch('/api/messages/unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/unified'] });
      setShowComposer(false);
      setNewMessage({
        recipients: '',
        subject: '',
        content: '',
        channel: 'app',
        priority: 'medium',
        category: 'general'
      });
      toast({
        title: language === 'fr' ? 'Message envoyé' : 'Message sent',
        description: language === 'fr' ? 'Votre message a été envoyé avec succès' : 'Your message has been sent successfully'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Erreur lors de l\'envoi du message' : 'Error sending message',
        variant: 'destructive'
      });
    }
  });

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'sms': return Phone;
      case 'whatsapp': return MessageSquare;
      case 'email': return Mail;
      case 'pwa': return Bell;
      case 'app': return Smartphone;
      default: return MessageSquare;
    }
  };

  const getChannelColor = (channel: string) => {
    const colors = {
      sms: 'bg-green-100 text-green-800',
      whatsapp: 'bg-green-100 text-green-800',
      email: 'bg-blue-100 text-blue-800',
      pwa: 'bg-orange-100 text-orange-800',
      app: 'bg-purple-100 text-purple-800'
    };
    return colors[channel as keyof typeof colors] || colors.app;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      read: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.sent;
  };

  // Statistics
  const stats = {
    totalMessages: messages.length,
    unreadCount: messages.filter(m => !m.isRead).length,
    sentToday: messages.filter(m => 
      new Date(m.timestamp).toDateString() === new Date().toDateString()
    ).length,
    savedPaper: Math.floor(messages.length * 0.3) // Estimate: 0.3 sheets per digital message
  };

  const handleSendMessage = () => {
    if (!newMessage.content.trim()) {
      toast({
        title: language === 'fr' ? 'Message requis' : 'Message required',
        description: language === 'fr' ? 'Veuillez saisir votre message' : 'Please enter your message',
        variant: 'destructive'
      });
      return;
    }

    sendMessageMutation.mutate(newMessage);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Klapp-inspired design */}
      <Card className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <MessageSquare className="w-8 h-8" />
                {t.title}
              </h2>
              <p className="text-blue-100 mt-1 text-lg">{t.subtitle}</p>
              <div className="flex items-center gap-2 mt-2 text-green-100">
                <Leaf className="w-4 h-4" />
                <span className="text-sm">{t.environmental}</span>
              </div>
            </div>
            <Button 
              onClick={() => setShowComposer(true)}
              className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3"
              size="lg"
              data-testid="button-compose-unified-message"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t.actions.compose}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Klapp-style Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalMessages.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{t.stats.totalMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-full">
                <Bell className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.unreadCount}</p>
                <p className="text-sm text-gray-600">{t.stats.unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <Send className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.sentToday}</p>
                <p className="text-sm text-gray-600">{t.stats.sentToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{stats.savedPaper}</p>
                <p className="text-sm text-green-600">{t.environmentalImpact}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder={t.placeholders.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 text-base py-3"
                  data-testid="input-search-unified-messages"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={filterChannel} onValueChange={setFilterChannel}>
                <SelectTrigger className="w-48" data-testid="select-filter-channel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(t.channels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages Tabs */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              {Object.entries(t.tabs).map(([key, label]) => (
                <TabsTrigger key={key} value={key} data-testid={`tab-${key}`}>
                  {label}
                  {key === 'inbox' && stats.unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {stats.unreadCount > 99 ? '99+' : stats.unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-24"></div>
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg">{t.noMessages}</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const ChannelIcon = getChannelIcon(message.channel);
                      
                      return (
                        <Card
                          key={message.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            !message.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'bg-white'
                          }`}
                          onClick={() => setSelectedMessage(message)}
                          data-testid={`unified-message-${message.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  <ChannelIcon className="w-5 h-5 text-gray-600" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900">
                                      {message.from.name}
                                    </span>
                                    {message.from.role && (
                                      <Badge variant="outline" className="text-xs">
                                        {message.from.role}
                                      </Badge>
                                    )}
                                    {!message.isRead && (
                                      <Badge variant="destructive" className="text-xs">
                                        Nouveau
                                      </Badge>
                                    )}
                                    {message.isStarred && (
                                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className={getChannelColor(message.channel)}>
                                      {t.channels[message.channel]}
                                    </Badge>
                                    <Badge className={getPriorityColor(message.priority)}>
                                      {t.priorities[message.priority]}
                                    </Badge>
                                    <Badge className={getStatusColor(message.status)}>
                                      {t.status[message.status]}
                                    </Badge>
                                  </div>
                                  
                                  {message.subject && (
                                    <h4 className="font-semibold text-gray-900 mb-1">
                                      {message.subject}
                                    </h4>
                                  )}
                                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                                    {message.content}
                                  </p>
                                  
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatDistanceToNow(new Date(message.timestamp), {
                                        addSuffix: true,
                                        locale: language === 'fr' ? fr : enUS
                                      })}
                                    </span>
                                    <span>→ {message.to.name}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex gap-2 ml-4">
                                <Button variant="ghost" size="sm">
                                  <Reply className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Forward className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Archive className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Simplified Composer Modal - Klapp Style */}
      {showComposer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                {t.composer.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.composer.channel}</label>
                  <Select 
                    value={newMessage.channel} 
                    onValueChange={(value) => setNewMessage({...newMessage, channel: value as any})}
                  >
                    <SelectTrigger data-testid="select-composer-channel">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(t.channels).filter(([key]) => key !== 'all').map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.composer.priority}</label>
                  <Select 
                    value={newMessage.priority} 
                    onValueChange={(value) => setNewMessage({...newMessage, priority: value as any})}
                  >
                    <SelectTrigger data-testid="select-composer-priority">
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
                <label className="block text-sm font-medium mb-2">{t.composer.recipients}</label>
                <Input
                  value={newMessage.recipients}
                  onChange={(e) => setNewMessage({...newMessage, recipients: e.target.value})}
                  placeholder={t.placeholders.recipients}
                  data-testid="input-composer-recipients"
                />
              </div>

              {['email', 'app'].includes(newMessage.channel) && (
                <div>
                  <label className="block text-sm font-medium mb-2">{t.composer.subject}</label>
                  <Input
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                    placeholder={t.placeholders.subject}
                    data-testid="input-composer-subject"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">{t.composer.content}</label>
                <Textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                  placeholder={t.placeholders.content}
                  rows={6}
                  data-testid="textarea-composer-content"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isPending}
                  className="flex-1"
                  data-testid="button-send-unified-message"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sendMessageMutation.isPending ? t.composer.sending : t.composer.send}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowComposer(false)}
                  className="flex-1"
                >
                  {t.composer.cancel}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UnifiedMessagesCenter;
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  MessageSquare, Send, Reply, Star, 
  Plus, Search, Filter, Eye, 
  Calendar, AlertCircle, CheckCircle, Clock, 
  Users, BookOpen, Paperclip, Phone
} from 'lucide-react';

interface ParentMessage {
  id: number;
  subject: string;
  content: string;
  senderName: string;
  senderRole: string;
  recipientName: string;
  childName: string;
  priority: string;
  status: string;
  sentAt: string;
  readAt: string;
  category: string;
  hasAttachment: boolean;
  requiresResponse: boolean;
}

const FunctionalParentMessages: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    recipient: '',
    content: '',
    priority: 'medium',
    notificationChannels: ['pwa', 'email'] // Only PWA notifications and email, no SMS
  });

  // Fetch parent messages data - TEMPORAIRE: utiliser données réelles de l'API
  const { data: messages = [], isLoading } = useQuery<ParentMessage[]>({
    queryKey: ['/api/parent/messages'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/parent/messages', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.warn('[PARENT_MESSAGES] API failed, using mock data');
          // Données mock pour affichage
          return [
            {
              id: 1,
              subject: "Réunion parent-professeur",
              content: "Nous aimerions organiser une réunion pour discuter des progrès de votre enfant.",
              senderName: "Mme Kouam",
              senderRole: "Enseignant",
              recipientName: "Parent Kamga",
              childName: "Junior Kamga", 
              priority: "medium",
              status: "unread",
              sentAt: "2025-08-25T10:30:00Z",
              readAt: "",
              category: "education",
              hasAttachment: false,
              requiresResponse: true
            },
            {
              id: 2,
              subject: "Absence justifiée",
              content: "Merci d'avoir signalé l'absence de votre enfant. C'est bien noté.",
              senderName: "M. Mballa",
              senderRole: "Directeur",
              recipientName: "Parent Kamga",
              childName: "Junior Kamga",
              priority: "low", 
              status: "read",
              sentAt: "2025-08-24T14:15:00Z",
              readAt: "2025-08-24T15:30:00Z",
              category: "administrative",
              hasAttachment: false,
              requiresResponse: false
            }
          ];
        }
        
        const data = await response.json();
        return data.messages || [];
      } catch (error) {
        console.error('[PARENT_MESSAGES] Error:', error);
        return [];
      }
    },
    enabled: !!user
  });

  // Create message mutation - unified system
  const createMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await fetch('/api/unified-messaging/messages/student-parent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          connectionId: messageData.connectionId || 1,
          message: messageData.content,
          messageType: 'text',
          priority: messageData.priority || 'normal'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parent/messages'] });
      setIsNewMessageOpen(false);
      setNewMessage({ subject: '', recipient: '', content: '', priority: 'medium', notificationChannels: ['pwa', 'email'] });
      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (newMessage.subject && newMessage.recipient && newMessage.content) {
      createMessageMutation.mutate(newMessage);
    }
  };

  const text = {
    fr: {
      title: 'Messages École',
      subtitle: 'Communications avec l\'équipe éducative',
      loading: 'Chargement des messages...',
      noData: 'Aucun message reçu',
      stats: {
        totalMessages: 'Messages Totaux',
        unread: 'Non lus',
        important: 'Importants',
        needsResponse: 'Réponse requise'
      },
      priority: {
        high: 'Urgent',
        medium: 'Important',
        low: 'Normal'
      },
      status: {
        read: 'Lu',
        unread: 'Non lu',
        replied: 'Répondu',
        archived: 'Archivé'
      },
      category: {
        academic: 'Académique',
        behavior: 'Comportement',
        attendance: 'Présence',
        general: 'Général',
        urgent: 'Urgent',
        event: 'Événement'
      },
      senderRole: {
        teacher: 'Enseignant',
        director: 'Directeur',
        admin: 'Administration',
        nurse: 'Infirmière',
        counselor: 'Conseiller'
      },
      actions: {
        newMessage: 'Nouveau Message',
        reply: 'Répondre',
        forward: 'Transférer',
        markRead: 'Marquer lu',
        archive: 'Archiver',
        star: 'Favori'
      },
      filters: {
        all: 'Tous',
        unread: 'Non lus',
        starred: 'Favoris',
        academic: 'Académique',
        urgent: 'Urgents'
      },
      message: {
        from: 'De',
        to: 'À',
        child: 'Enfant',
        subject: 'Sujet',
        sent: 'Envoyé le',
        priority: 'Priorité',
        category: 'Catégorie',
        attachment: 'Pièce jointe'
      }
    },
    en: {
      title: 'School Messages',
      subtitle: 'Communications with the educational team',
      loading: 'Loading messages...',
      noData: 'No messages received',
      stats: {
        totalMessages: 'Total Messages',
        unread: 'Unread',
        important: 'Important',
        needsResponse: 'Needs Response'
      },
      priority: {
        high: 'Urgent',
        medium: 'Important',
        low: 'Normal'
      },
      status: {
        read: 'Read',
        unread: 'Unread',
        replied: 'Replied',
        archived: 'Archived'
      },
      category: {
        academic: 'Academic',
        behavior: 'Behavior',
        attendance: 'Attendance',
        general: 'General',
        urgent: 'Urgent',
        event: 'Event'
      },
      senderRole: {
        teacher: 'Teacher',
        director: 'Director',
        admin: 'Administration',
        nurse: 'Nurse',
        counselor: 'Counselor'
      },
      actions: {
        newMessage: 'New Message',
        reply: 'Reply',
        forward: 'Forward',
        markRead: 'Mark Read',
        archive: 'Archive',
        star: 'Star'
      },
      filters: {
        all: 'All',
        unread: 'Unread',
        starred: 'Starred',
        academic: 'Academic',
        urgent: 'Urgent'
      },
      message: {
        from: 'From',
        to: 'To',
        child: 'Child',
        subject: 'Subject',
        sent: 'Sent on',
        priority: 'Priority',
        category: 'Category',
        attachment: 'Attachment'
      }
    }
  };

  const t = text[language as keyof typeof text];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      </div>
    );
  }

  // Filter and search messages
  const filteredMessages = (Array.isArray(messages) ? messages : []).filter(message => {
    if (!message || typeof message !== 'object') return false;
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'unread' && message.status === 'unread') ||
                         (selectedFilter === 'urgent' && message.priority === 'high') ||
                         message.category === selectedFilter;
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = (message.subject && message.subject.toLowerCase().includes(searchTermLower)) ||
                         (message.senderName && message.senderName.toLowerCase().includes(searchTermLower)) ||
                         (message.childName && message.childName.toLowerCase().includes(searchTermLower));
    return matchesFilter && matchesSearch;
  });

  // Calculate statistics
  const totalMessages = (Array.isArray(messages) ? messages.length : 0);
  const unreadMessages = (Array.isArray(messages) ? messages : []).filter(m => m.status === 'unread').length;
  const importantMessages = (Array.isArray(messages) ? messages : []).filter(m => m.priority === 'high').length;
  const needsResponse = (Array.isArray(messages) ? messages : []).filter(m => m.requiresResponse && m.status !== 'replied').length;

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };

    return (
      <Badge className={variants[priority] || 'bg-gray-100 text-gray-800'}>
        {t.priority[priority as keyof typeof t.priority]}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'read':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'replied':
        return <Reply className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      academic: 'bg-blue-500',
      behavior: 'bg-orange-500',
      attendance: 'bg-green-500',
      urgent: 'bg-red-500',
      general: 'bg-gray-500',
      event: 'bg-purple-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
      </div>

      {/* Nouveau Message Section - Moved Up */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              <Plus className="w-5 h-5 mr-2 inline" />
              {t?.actions?.newMessage}
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 w-full" data-testid="button-new-message">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Message
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Nouveau Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Destinataire</label>
                  <Select onValueChange={(value) => setNewMessage(prev => ({ ...prev, recipient: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un destinataire" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="director">Directeur</SelectItem>
                      <SelectItem value="teacher">Enseignant de Junior</SelectItem>
                      <SelectItem value="admin">Administration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Sujet</label>
                  <Input
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Entrez le sujet du message"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Priorité</label>
                  <Select value={newMessage.priority} onValueChange={(value) => setNewMessage(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Normal</SelectItem>
                      <SelectItem value="medium">Important</SelectItem>
                      <SelectItem value="high">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={newMessage.content}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Tapez votre message ici..."
                    rows={4}
                  />
                </div>
                <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                  📢 Canaux: Notifications PWA + Email (pas de SMS)
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleSendMessage}
                    disabled={createMessageMutation.isPending || !newMessage.subject || !newMessage.recipient || !newMessage.content}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {createMessageMutation.isPending ? 'Envoi...' : 'Envoyer'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsNewMessageOpen(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.totalMessages}</p>
                <p className="text-2xl font-bold">{totalMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.unread}</p>
                <p className="text-2xl font-bold text-orange-600">{unreadMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Star className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.important}</p>
                <p className="text-2xl font-bold text-red-600">{importantMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Reply className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">{t?.stats?.needsResponse}</p>
                <p className="text-2xl font-bold text-purple-600">{needsResponse}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Boîte de Réception - Moved Up */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Boîte de Réception</h3>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Fields - Moved Under Boîte de Réception */}
          <div className="flex items-center justify-between mb-6 space-x-3">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher un message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
                className="border rounded-md px-3 py-1 text-sm w-64"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e?.target?.value)}
                className="border rounded-md px-3 py-1 text-sm"
              >
                <option value="all">{t?.filters?.all}</option>
                <option value="unread">{t?.filters?.unread}</option>
                <option value="urgent">{t?.filters?.urgent}</option>
                <option value="academic">{t?.filters?.academic}</option>
              </select>
            </div>
          </div>

          {/* Messages List Content */}
          {(Array.isArray(filteredMessages) ? filteredMessages.length : 0) === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noData}</h3>
              <p className="text-gray-600">Aucun message ne correspond à vos critères.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(Array.isArray(filteredMessages) ? filteredMessages : []).map((message) => (
                <Card key={message.id} className={`border hover:shadow-md transition-shadow ${message.status === 'unread' ? 'bg-blue-50 border-blue-200' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`p-2 ${getCategoryColor(message.category)} rounded-lg`}>
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                {message.subject}
                              </h4>
                              {getStatusIcon(message.status)}
                              {message.hasAttachment && <Paperclip className="w-4 h-4 text-gray-500" />}
                            </div>
                            <p className="text-sm text-gray-600">
                              {t?.message?.from}: {message.senderName} ({t.senderRole[message.senderRole as keyof typeof t.senderRole]})
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            {getPriorityBadge(message.priority)}
                            <Badge variant="outline">
                              {t.category[message.category as keyof typeof t.category]}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">{t?.message?.child}</p>
                            <p className="font-medium">{message.childName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{t?.message?.sent}</p>
                            <p className="font-medium">{new Date(message.sentAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Statut</p>
                            <p className="font-medium">{t.status[message.status as keyof typeof t.status]}</p>
                          </div>
                        </div>

                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 line-clamp-3">{message.content}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Lire
                          </Button>
                          <Button variant="outline" size="sm">
                            <Reply className="w-4 h-4 mr-2" />
                            {t?.actions?.reply}
                          </Button>
                          {message.requiresResponse && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <Send className="w-4 h-4 mr-2" />
                              Répondre
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Star className="w-4 h-4 mr-2" />
                            {t?.actions?.star}
                          </Button>
                          {message.senderRole === 'teacher' && (
                            <Button variant="outline" size="sm">
                              <Phone className="w-4 h-4 mr-2" />
                              Appeler
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FunctionalParentMessages;
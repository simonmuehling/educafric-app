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
  readAt: string | null;
  category: string;
  hasAttachment: boolean;
  requiresResponse: boolean;
  isRead: boolean;
  read: boolean;
}

const FunctionalParentMessages: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ParentMessage | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [newMessage, setNewMessage] = useState({
    subject: '',
    recipient: '',
    content: '',
    priority: 'medium',
    notificationChannels: ['pwa', 'email'] // Only PWA notifications and email, no SMS
  });

  // Fetch parent messages data from PostgreSQL - DATABASE ONLY
  const { data: messages = [], isLoading } = useQuery<ParentMessage[]>({
    queryKey: ['/api/parent/messages'],
    queryFn: async () => {
      const response = await fetch('/api/parent/messages', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('[PARENT_MESSAGES] API failed:', response.status);
        return [];
      }
      
      const data = await response.json();
      return data.messages || [];
    },
    enabled: !!user
  });

  // Fetch real recipients from database (children, teachers, schools)
  interface Recipient {
    id: string;
    name: string;
    type: 'child' | 'teacher' | 'school';
    details: string;
    schoolId?: number;
  }

  const { data: recipientsData } = useQuery({
    queryKey: ['/api/parent/communications/recipients'],
    queryFn: async () => {
      const response = await fetch('/api/parent/communications/recipients', {
        credentials: 'include'
      });
      if (!response.ok) return { recipients: [] };
      return response.json();
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5
  });

  const recipients: Recipient[] = (recipientsData as any)?.recipients || [];
  const childRecipients = recipients.filter(r => r.type === 'child');
  const teacherRecipients = recipients.filter(r => r.type === 'teacher');
  const schoolRecipients = recipients.filter(r => r.type === 'school');

  // Create message mutation - using parent communications endpoint
  const createMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      // Parse recipient type from the ID format (e.g., "teacher_123", "school_456")
      const recipientParts = messageData.recipient.split('_');
      const recipientType = recipientParts[0]; // 'teacher', 'school', 'child'
      const recipientId = recipientParts.slice(1).join('_');
      
      const response = await fetch('/api/parent/communications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          recipientId,
          recipientType,
          subject: messageData.subject,
          content: messageData.content,
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

  // Mark message as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await fetch(`/api/parent/messages/${messageId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parent/messages'] });
    }
  });

  // Reply to message mutation
  const replyMutation = useMutation({
    mutationFn: async ({ messageId, content }: { messageId: number; content: string }) => {
      const response = await fetch('/api/parent/messages/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ originalMessageId: messageId, content })
      });
      if (!response.ok) throw new Error('Failed to send reply');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parent/messages'] });
      setIsReplyDialogOpen(false);
      setReplyContent('');
      setSelectedMessage(null);
      toast({
        title: language === 'fr' ? 'Réponse envoyée' : 'Reply sent',
        description: language === 'fr' ? 'Votre réponse a été envoyée avec succès.' : 'Your reply was sent successfully.'
      });
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'envoyer la réponse.' : 'Could not send reply.',
        variant: 'destructive'
      });
    }
  });

  // Handle view message
  const handleViewMessage = (message: ParentMessage) => {
    setSelectedMessage(message);
    setIsViewDialogOpen(true);
    if (!message.isRead) {
      markReadMutation.mutate(message.id);
    }
  };

  // Handle reply
  const handleReply = (message: ParentMessage) => {
    setSelectedMessage(message);
    setIsReplyDialogOpen(true);
  };

  // Handle send reply
  const handleSendReply = () => {
    if (selectedMessage && replyContent.trim()) {
      replyMutation.mutate({ messageId: selectedMessage.id, content: replyContent });
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = (messageId: number) => {
    setFavoriteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
    toast({
      title: favoriteIds.has(messageId) 
        ? (language === 'fr' ? 'Retiré des favoris' : 'Removed from favorites')
        : (language === 'fr' ? 'Ajouté aux favoris' : 'Added to favorites')
    });
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
        behavior: 'Behaviour',
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
        return <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500" />;
      case 'read':
        return <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />;
      case 'replied':
        return <Reply className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />;
      default:
        return <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />;
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
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 mr-2 inline" />
              {t?.actions?.newMessage}
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 w-full" data-testid="button-new-message">
                <Plus className="h-4 w-4 sm:h-5 sm:h-5 mr-2" />
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
                      {/* Écoles */}
                      {schoolRecipients.length > 0 && (
                        <>
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-gray-50">
                            Écoles
                          </div>
                          {schoolRecipients.map((school) => (
                            <SelectItem key={school.id} value={school.id}>
                              {school.name} - {school.details}
                            </SelectItem>
                          ))}
                        </>
                      )}
                      {/* Enseignants */}
                      {teacherRecipients.length > 0 && (
                        <>
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-gray-50 border-t mt-1">
                            Enseignants
                          </div>
                          {teacherRecipients.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.name} - {teacher.details}
                            </SelectItem>
                          ))}
                        </>
                      )}
                      {/* Enfants */}
                      {childRecipients.length > 0 && (
                        <>
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-gray-50 border-t mt-1">
                            Mes Enfants
                          </div>
                          {childRecipients.map((child) => (
                            <SelectItem key={child.id} value={child.id}>
                              {child.name} - {child.details}
                            </SelectItem>
                          ))}
                        </>
                      )}
                      {/* Fallback if no recipients */}
                      {recipients.length === 0 && (
                        <div className="px-2 py-4 text-sm text-center text-gray-500">
                          Aucun destinataire disponible
                        </div>
                      )}
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
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
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
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
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
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
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
                <Reply className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
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
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher un message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
                className="border rounded-md px-3 py-1 text-sm w-64"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
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
              <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
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
                            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                {message.subject}
                              </h4>
                              {getStatusIcon(message.status)}
                              {message.hasAttachment && <Paperclip className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />}
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewMessage(message)}
                            data-testid={`button-view-message-${message.id}`}
                          >
                            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                            {language === 'fr' ? 'Lire' : 'Read'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReply(message)}
                            data-testid={`button-reply-message-${message.id}`}
                          >
                            <Reply className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                            {t?.actions?.reply}
                          </Button>
                          {message.requiresResponse && (
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleReply(message)}
                              data-testid={`button-reply-required-${message.id}`}
                            >
                              <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                              {language === 'fr' ? 'Répondre' : 'Reply'}
                            </Button>
                          )}
                          <Button 
                            variant={favoriteIds.has(message.id) ? "default" : "outline"} 
                            size="sm"
                            onClick={() => handleToggleFavorite(message.id)}
                            className={favoriteIds.has(message.id) ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                            data-testid={`button-favorite-message-${message.id}`}
                          >
                            <Star className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 ${favoriteIds.has(message.id) ? 'fill-white' : ''}`} />
                            {t?.actions?.star}
                          </Button>
                          {message.senderRole === 'teacher' && (
                            <Button variant="outline" size="sm" data-testid={`button-call-teacher-${message.id}`}>
                              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                              {language === 'fr' ? 'Appeler' : 'Call'}
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

      {/* View Message Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject || 'Message'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              <p><strong>{language === 'fr' ? 'De' : 'From'}:</strong> {selectedMessage?.senderName} ({selectedMessage?.senderRole})</p>
              <p><strong>{language === 'fr' ? 'Date' : 'Date'}:</strong> {selectedMessage?.sentAt ? new Date(selectedMessage.sentAt).toLocaleDateString() : '-'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="whitespace-pre-wrap">{selectedMessage?.content}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                {language === 'fr' ? 'Fermer' : 'Close'}
              </Button>
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedMessage) handleReply(selectedMessage);
              }} className="bg-green-600 hover:bg-green-700 text-white">
                <Reply className="h-4 w-4 mr-2" />
                {language === 'fr' ? 'Répondre' : 'Reply'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{language === 'fr' ? 'Répondre au message' : 'Reply to message'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedMessage?.subject}</p>
              <p className="text-xs mt-1">{language === 'fr' ? 'De' : 'From'}: {selectedMessage?.senderName}</p>
              <p className="mt-2 line-clamp-2">{selectedMessage?.content}</p>
            </div>
            <Textarea
              placeholder={language === 'fr' ? 'Tapez votre réponse...' : 'Type your reply...'}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={4}
              data-testid="textarea-reply-content"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsReplyDialogOpen(false);
                setReplyContent('');
              }}>
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
              <Button 
                onClick={handleSendReply}
                disabled={!replyContent.trim() || replyMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
                data-testid="button-send-reply"
              >
                {replyMutation.isPending ? (
                  <span className="animate-pulse">{language === 'fr' ? 'Envoi...' : 'Sending...'}</span>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {language === 'fr' ? 'Envoyer' : 'Send'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FunctionalParentMessages;
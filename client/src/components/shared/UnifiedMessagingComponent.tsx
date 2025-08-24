/**
 * COMPOSANT DE MESSAGERIE UNIFIÉ EDUCAFRIC
 * Compatible avec tous les profils d'utilisateurs (Parent, Teacher, Student, Commercial, Director)
 * Utilise le nouveau système de messagerie consolidé
 */

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
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Search, 
  Plus, 
  CheckCircle, 
  Clock,
  Reply,
  Forward,
  Archive,
  Star
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface UnifiedMessage {
  id: number;
  connectionId: number;
  connectionType: 'student-parent' | 'teacher-student' | 'family' | 'partnership';
  senderId: number;
  message: string;
  messageType: 'text' | 'file' | 'image';
  priority: 'normal' | 'high' | 'urgent';
  isRead: boolean;
  readAt: string | null;
  parentCcEnabled: boolean;
  teacherCcEnabled: boolean;
  geolocationShared: boolean;
  messageData: any;
  sentAt: string;
}

interface UnifiedConnection {
  id: number;
  connectionType: 'student-parent' | 'teacher-student' | 'family' | 'partnership';
  initiatorId: number;
  targetId: number;
  status: 'pending' | 'approved' | 'rejected';
  connectionData: any;
  createdAt: string;
  approvedAt: string | null;
}

interface UnifiedMessagingComponentProps {
  userRole: 'parent' | 'teacher' | 'student' | 'commercial' | 'director' | 'admin';
  connectionTypes?: string[];
  className?: string;
}

const UnifiedMessagingComponent: React.FC<UnifiedMessagingComponentProps> = ({ 
  userRole, 
  connectionTypes = ['student-parent', 'teacher-student', 'family', 'partnership'],
  className = '' 
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeConnectionType, setActiveConnectionType] = useState(connectionTypes[0]);
  const [selectedConnection, setSelectedConnection] = useState<UnifiedConnection | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'text' | 'file' | 'image'>('text');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');

  const text = {
    fr: {
      title: 'Messagerie Unifiée',
      subtitle: 'Communication centralisée pour tous vos contacts',
      connections: 'Connexions',
      messages: 'Messages',
      newMessage: 'Nouveau message',
      send: 'Envoyer',
      reply: 'Répondre',
      forward: 'Transférer',
      archive: 'Archiver',
      star: 'Favoris',
      search: 'Rechercher...',
      noConnections: 'Aucune connexion trouvée',
      noMessages: 'Aucun message',
      typing: 'Saisir votre message...',
      connectionTypes: {
        'student-parent': 'Élève-Parent',
        'teacher-student': 'Enseignant-Élève', 
        'family': 'Famille',
        'partnership': 'Partenariat'
      },
      priority: {
        normal: 'Normal',
        high: 'Important',
        urgent: 'Urgent'
      },
      status: {
        pending: 'En attente',
        approved: 'Approuvé',
        rejected: 'Rejeté'
      }
    },
    en: {
      title: 'Unified Messaging',
      subtitle: 'Centralized communication for all your contacts',
      connections: 'Connections',
      messages: 'Messages',
      newMessage: 'New message',
      send: 'Send',
      reply: 'Reply',
      forward: 'Forward',
      archive: 'Archive',
      star: 'Star',
      search: 'Search...',
      noConnections: 'No connections found',
      noMessages: 'No messages',
      typing: 'Type your message...',
      connectionTypes: {
        'student-parent': 'Student-Parent',
        'teacher-student': 'Teacher-Student',
        'family': 'Family',
        'partnership': 'Partnership'
      },
      priority: {
        normal: 'Normal',
        high: 'High',
        urgent: 'Urgent'
      },
      status: {
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected'
      }
    }
  };

  const t = text[language as keyof typeof text];

  // Récupérer les connexions pour le type sélectionné
  const { data: connectionsResponse, isLoading: connectionsLoading } = useQuery({
    queryKey: ['unified-connections', activeConnectionType],
    queryFn: async () => {
      const response = await fetch(`/api/unified-messaging/connections/${activeConnectionType}`, {
        credentials: 'include'
      });
      return response.json();
    },
    enabled: !!user
  });

  const connections = connectionsResponse?.data || [];

  // Récupérer les messages pour la connexion sélectionnée
  const { data: messagesResponse, isLoading: messagesLoading } = useQuery({
    queryKey: ['unified-messages', activeConnectionType, selectedConnection?.id],
    queryFn: async () => {
      if (!selectedConnection) return { data: [] };
      const response = await fetch(`/api/unified-messaging/messages/${activeConnectionType}/${selectedConnection.id}`, {
        credentials: 'include'
      });
      return response.json();
    },
    enabled: !!selectedConnection
  });

  const messages = messagesResponse?.data || [];

  // Mutation pour envoyer un message
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: {
      connectionId: number;
      message: string;
      messageType: 'text' | 'file' | 'image';
      priority: 'normal' | 'high' | 'urgent';
    }) => {
      const response = await fetch(`/api/unified-messaging/messages/${activeConnectionType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(messageData)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'fr' ? 'Message envoyé' : 'Message sent',
        description: language === 'fr' ? 'Votre message a été envoyé avec succès' : 'Your message has been sent successfully'
      });
      setNewMessage('');
      // Actualiser les messages
      queryClient.invalidateQueries({ queryKey: ['unified-messages', activeConnectionType, selectedConnection?.id] });
    },
    onError: (error: any) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'envoyer le message' : 'Failed to send message',
        variant: 'destructive'
      });
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConnection) return;

    sendMessageMutation.mutate({
      connectionId: selectedConnection.id,
      message: newMessage,
      messageType,
      priority
    });
  };

  // Marquer message comme lu
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await fetch(`/api/unified-messaging/messages/${activeConnectionType}/${messageId}/read`, {
        method: 'PUT',
        credentials: 'include'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-messages'] });
    }
  });

  return (
    <div className={`unified-messaging-component ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sélection du type de connexion et liste des connexions */}
            <div className="lg:col-span-1">
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Type de connexion</label>
                <Select value={activeConnectionType} onValueChange={setActiveConnectionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {connectionTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {t.connectionTypes[type as keyof typeof t.connectionTypes]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Liste des connexions */}
              <ScrollArea className="h-96">
                {connectionsLoading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Chargement...
                  </div>
                ) : connections.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {t.noConnections}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {connections.map((connection: UnifiedConnection) => (
                      <Card 
                        key={connection.id}
                        className={`cursor-pointer transition-colors ${
                          selectedConnection?.id === connection.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedConnection(connection)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">
                                {connection.connectionData?.studentName || connection.connectionData?.teacherName || 'Connexion'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {connection.connectionData?.parentName || connection.connectionData?.subject || connection.connectionType}
                              </p>
                            </div>
                            <Badge variant={connection.status === 'approved' ? 'default' : 'secondary'}>
                              {t.status[connection.status as keyof typeof t.status]}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Zone de messages */}
            <div className="lg:col-span-2">
              {selectedConnection ? (
                <div className="flex flex-col h-96">
                  {/* En-tête de conversation */}
                  <div className="border-b p-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {selectedConnection.connectionData?.studentName || selectedConnection.connectionData?.teacherName || 'Conversation'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t.connectionTypes[selectedConnection.connectionType as keyof typeof t.connectionTypes]}
                      </p>
                    </div>
                  </div>

                  {/* Liste des messages */}
                  <ScrollArea className="flex-1 p-3">
                    {messagesLoading ? (
                      <div className="text-center text-sm text-muted-foreground">
                        Chargement des messages...
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-sm text-muted-foreground">
                        {t.noMessages}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((message: UnifiedMessage) => (
                          <div 
                            key={message.id}
                            className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] p-3 rounded-lg ${
                              message.senderId === user?.id 
                                ? 'bg-primary text-primary-foreground ml-4' 
                                : 'bg-muted mr-4'
                            }`}>
                              <p className="text-sm">{message.message}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs opacity-70">
                                  {new Date(message.sentAt).toLocaleString()}
                                </span>
                                {message.priority !== 'normal' && (
                                  <Badge variant="outline" className="text-xs">
                                    {t.priority[message.priority]}
                                  </Badge>
                                )}
                                {message.senderId === user?.id && (
                                  <div className="text-xs opacity-70">
                                    {message.isRead ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Zone de saisie */}
                  <div className="border-t p-3 space-y-3">
                    <div className="flex gap-2">
                      <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">{t.priority.normal}</SelectItem>
                          <SelectItem value="high">{t.priority.high}</SelectItem>
                          <SelectItem value="urgent">{t.priority.urgent}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder={t.typing}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 min-h-[80px]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        className="self-end"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Sélectionnez une connexion pour commencer</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedMessagingComponent;
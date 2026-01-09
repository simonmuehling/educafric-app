import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  MessageCircle, Send, Users, Search, 
  ArrowLeft, User, Check, CheckCheck,
  Loader2, RefreshCw, Phone, GraduationCap, BookOpen
} from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  role: string;
  phone?: string;
  profilePhoto?: string;
  subject?: string;
  className?: string;
  studentId?: number;
  studentName?: string;
}

interface Conversation {
  id: number;
  participantOneId: number;
  participantTwoId: number;
  studentId?: number;
  lastMessageAt: string;
  lastMessagePreview?: string;
  unreadCount: number;
  otherParticipant: {
    id: number;
    name: string;
    role: string;
    profilePhoto?: string;
    phone?: string;
  } | null;
}

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  content: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
}

const ParentInstantChat: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('conversations');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = {
    fr: {
      title: 'Messagerie Instantanée',
      subtitle: 'Communiquez avec les enseignants de vos enfants',
      conversations: 'Conversations',
      contacts: 'Enseignants',
      noConversations: 'Aucune conversation',
      startChatting: 'Sélectionnez un enseignant pour commencer',
      noContacts: 'Aucun enseignant disponible',
      noContactsDesc: 'Les enseignants de vos enfants apparaîtront ici',
      typeMessage: 'Tapez votre message...',
      send: 'Envoyer',
      back: 'Retour',
      loading: 'Chargement...',
      teacher: 'Enseignant',
      teaches: 'Enseigne',
      inClass: 'en',
      unread: 'non lu(s)',
      today: 'Aujourd\'hui',
      yesterday: 'Hier',
      messageSent: 'Message envoyé',
      errorSending: 'Erreur lors de l\'envoi',
      search: 'Rechercher...',
      refresh: 'Actualiser',
      noMessages: 'Aucun message',
      startConversation: 'Envoyez le premier message',
      forChild: 'pour'
    },
    en: {
      title: 'Instant Messaging',
      subtitle: 'Communicate with your children\'s teachers',
      conversations: 'Conversations',
      contacts: 'Teachers',
      noConversations: 'No conversations',
      startChatting: 'Select a teacher to start',
      noContacts: 'No teachers available',
      noContactsDesc: 'Your children\'s teachers will appear here',
      typeMessage: 'Type your message...',
      send: 'Send',
      back: 'Back',
      loading: 'Loading...',
      teacher: 'Teacher',
      teaches: 'Teaches',
      inClass: 'in',
      unread: 'unread',
      today: 'Today',
      yesterday: 'Yesterday',
      messageSent: 'Message sent',
      errorSending: 'Error sending message',
      search: 'Search...',
      refresh: 'Refresh',
      noMessages: 'No messages',
      startConversation: 'Send the first message',
      forChild: 'for'
    }
  };

  const labels = t[language as keyof typeof t] || t.fr;

  // Fetch conversations
  const { data: conversationsData, isLoading: loadingConversations, refetch: refetchConversations } = useQuery({
    queryKey: ['/api/chat/conversations'],
    queryFn: async () => {
      const response = await fetch('/api/chat/conversations', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      return data.conversations || [];
    },
    enabled: !!user,
    refetchInterval: 10000
  });

  const conversations: Conversation[] = conversationsData || [];

  // Fetch contacts (teachers of parent's children)
  const { data: contactsData, isLoading: loadingContacts } = useQuery({
    queryKey: ['/api/chat/contacts'],
    queryFn: async () => {
      const response = await fetch('/api/chat/contacts', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch contacts');
      const data = await response.json();
      return data.contacts || [];
    },
    enabled: !!user
  });

  const contacts: Contact[] = contactsData || [];

  // Fetch messages for selected conversation
  const { data: messagesData, isLoading: loadingMessages, refetch: refetchMessages } = useQuery({
    queryKey: ['/api/chat/conversations', selectedConversation?.id, 'messages'],
    queryFn: async () => {
      if (!selectedConversation) return { messages: [] };
      const response = await fetch(`/api/chat/conversations/${selectedConversation.id}/messages`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!selectedConversation,
    refetchInterval: 5000
  });

  const messages: Message[] = messagesData?.messages || [];

  // Fetch unread count
  const { data: unreadData } = useQuery({
    queryKey: ['/api/chat/unread-count'],
    queryFn: async () => {
      const response = await fetch('/api/chat/unread-count', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) return { unreadCount: 0 };
      return response.json();
    },
    enabled: !!user,
    refetchInterval: 15000
  });

  const totalUnread = unreadData?.unreadCount || 0;

  // Create or get conversation with a contact
  const createConversationMutation = useMutation({
    mutationFn: async (contact: Contact) => {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: contact.id,
          studentId: contact.studentId
        })
      });
      if (!response.ok) throw new Error('Failed to create conversation');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.conversation) {
        const conv = data.conversation;
        const contact = contacts.find(c => c.id === conv.participantTwoId || c.id === conv.participantOneId);
        setSelectedConversation({
          ...conv,
          unreadCount: 0,
          otherParticipant: contact ? {
            id: contact.id,
            name: contact.name,
            role: contact.role,
            phone: contact.phone
          } : null
        });
        setActiveTab('conversations');
        queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      }
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: number; content: string }) => {
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, messageType: 'text' })
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      setNewMessage('');
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
    },
    onError: () => {
      toast({
        title: labels.errorSending,
        variant: 'destructive'
      });
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!selectedConversation || !newMessage.trim()) return;
    sendMessageMutation.mutate({
      conversationId: selectedConversation.id,
      content: newMessage.trim()
    });
  };

  const handleSelectContact = (contact: Contact) => {
    const existingConv = conversations.find(c => 
      c.otherParticipant?.id === contact.id
    );
    
    if (existingConv) {
      setSelectedConversation(existingConv);
      setActiveTab('conversations');
    } else {
      createConversationMutation.mutate(contact);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return date.toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    if (isYesterday) {
      return labels.yesterday;
    }
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short'
    });
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.studentName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConversations = conversations.filter(c =>
    c.otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessagePreview?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Chat view when conversation is selected
  if (selectedConversation) {
    return (
      <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-lg shadow-sm border">
        {/* Chat header */}
        <div className="flex items-center gap-3 p-4 border-b bg-gray-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedConversation(null)}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {selectedConversation.otherParticipant?.name.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {selectedConversation.otherParticipant?.name || 'Unknown'}
            </h3>
            <p className="text-sm text-gray-500">
              {labels.teacher}
            </p>
          </div>
          {selectedConversation.otherParticipant?.phone && (
            <a
              href={`tel:${selectedConversation.otherParticipant.phone}`}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Phone className="w-5 h-5 text-gray-600" />
            </a>
          )}
        </div>

        {/* Messages area */}
        <ScrollArea className="flex-1 p-4">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-[#7C5CFC]" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageCircle className="w-12 h-12 mb-2 text-gray-300" />
              <p>{labels.noMessages}</p>
              <p className="text-sm">{labels.startConversation}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const isOwn = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      isOwn ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2",
                        isOwn 
                          ? "bg-green-500 text-white rounded-br-md" 
                          : "bg-gray-100 text-gray-900 rounded-bl-md"
                      )}
                    >
                      <p className="text-sm break-words">{msg.content}</p>
                      <div className={cn(
                        "flex items-center gap-1 mt-1",
                        isOwn ? "justify-end" : "justify-start"
                      )}>
                        <span className={cn(
                          "text-xs",
                          isOwn ? "text-white/70" : "text-gray-500"
                        )}>
                          {formatTime(msg.createdAt)}
                        </span>
                        {isOwn && (
                          msg.isRead 
                            ? <CheckCheck className="w-3 h-3 text-white/70" />
                            : <Check className="w-3 h-3 text-white/70" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Message input */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={labels.typeMessage}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              className="bg-green-500 hover:bg-green-600"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main view with tabs
  return (
    <div className="space-y-4">
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-green-500" />
                {labels.title}
                {totalUnread > 0 && (
                  <Badge className="bg-red-500 text-white ml-2">
                    {totalUnread}
                  </Badge>
                )}
              </h2>
              <p className="text-sm text-gray-500">{labels.subtitle}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetchConversations()}
              className="text-gray-500"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={labels.search}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 h-auto p-1.5 bg-[#F3F5F7] rounded-xl gap-1">
              <TabsTrigger 
                value="conversations"
                className="flex items-center justify-center gap-2 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm"
              >
                <MessageCircle className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline truncate">{labels.conversations}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="contacts"
                className="flex items-center justify-center gap-2 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm"
              >
                <GraduationCap className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline truncate">{labels.contacts}</span>
              </TabsTrigger>
            </TabsList>

            {/* Conversations Tab */}
            <TabsContent value="conversations" className="mt-4">
              {loadingConversations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                  <span className="ml-2 text-gray-500">{labels.loading}</span>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">{labels.noConversations}</p>
                  <p className="text-sm">{labels.startChatting}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {conv.otherParticipant?.name.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {conv.otherParticipant?.name || 'Unknown'}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatTime(conv.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {conv.lastMessagePreview || '...'}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <Badge className="bg-red-500 text-white">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Contacts Tab */}
            <TabsContent value="contacts" className="mt-4">
              {loadingContacts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                  <span className="ml-2 text-gray-500">{labels.loading}</span>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">{labels.noContacts}</p>
                  <p className="text-sm">{labels.noContactsDesc}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredContacts.map((contact) => (
                    <div
                      key={`${contact.id}-${contact.studentId}`}
                      onClick={() => handleSelectContact(contact)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {contact.name}
                        </h4>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          {contact.subject && (
                            <>
                              <BookOpen className="w-3 h-3" />
                              <span className="truncate">{contact.subject}</span>
                            </>
                          )}
                          {contact.studentName && (
                            <span className="truncate">
                              {' '}• {labels.forChild} {contact.studentName}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        {labels.teacher}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentInstantChat;

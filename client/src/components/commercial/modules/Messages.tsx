import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageSquare, Search, Send, Plus, User, Phone, Mail, Calendar, Clock } from 'lucide-react';

const Messages = () => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);

  const text = {
    fr: {
      title: 'Messages Équipe',
      subtitle: 'Communications internes et coordination commerciale',
      searchPlaceholder: 'Rechercher conversation...',
      newMessage: 'Nouveau Message',
      teamChat: 'Chat Équipe',
      clientCommunications: 'Communications Clients',
      send: 'Envoyer',
      reply: 'Répondre',
      typing: 'En train d\'écrire...',
      online: 'En ligne',
      offline: 'Hors ligne',
      lastSeen: 'Vu dernièrement',
      newLead: 'Nouveau Lead',
      success: 'Succès',
      meeting: 'Réunion',
      urgent: 'Urgent',
      general: 'Général'
    },
    en: {
      title: 'Team Messages',
      subtitle: 'Internal communications and commercial coordination',
      searchPlaceholder: 'Search conversations...',
      newMessage: 'New Message',
      teamChat: 'Team Chat',
      clientCommunications: 'Client Communications',
      send: 'Send',
      reply: 'Reply',
      typing: 'Typing...',
      online: 'Online',
      offline: 'Offline',
      lastSeen: 'Last seen',
      newLead: 'New Lead',
      success: 'Success',
      meeting: 'Meeting',
      urgent: 'Urgent',
      general: 'General'
    }
  };

  const t = text[language as keyof typeof text];

  // Mock conversations data
  const conversations = [
    {
      id: 1,
      type: 'team',
      name: 'Équipe Commerciale',
      participants: ['Marc Dupont', 'Sophie Martin', 'Jean Kouassi', 'Carine Nguetsop'],
      lastMessage: 'Nouvelle lead École Internationale Abidjan - très intéressée',
      lastMessageTime: '14:30',
      unreadCount: 3,
      status: 'active',
      category: 'general'
    },
    {
      id: 2,
      type: 'client',
      name: 'Sarah Nkomo',
      role: 'École Primaire Bilingue Yaoundé',
      lastMessage: 'Merci pour la présentation, nous validons l\'extension premium',
      lastMessageTime: '13:45',
      unreadCount: 1,
      status: 'online',
      category: 'success'
    },
    {
      id: 3,
      type: 'team',
      name: 'Réunion Hebdomadaire',
      participants: ['Sophie Martin', 'Marc Dupont'],
      lastMessage: 'Planning de la semaine prochaine à valider',
      lastMessageTime: '12:20',
      unreadCount: 0,
      status: 'active',
      category: 'meeting'
    },
    {
      id: 4,
      type: 'client',
      name: 'Paul Mbarga',
      role: 'Lycée Excellence Douala',
      lastMessage: 'Question sur les modalités de paiement annuel',
      lastMessageTime: '11:15',
      unreadCount: 2,
      status: 'offline',
      category: 'urgent'
    }
  ];

  // Mock messages for selected conversation
  const messages = [
    {
      id: 1,
      sender: 'Marc Dupont',
      content: 'Nouvelle lead École Internationale Abidjan - très intéressée par notre solution',
      time: '14:30',
      type: 'text',
      isOwn: false
    },
    {
      id: 2,
      sender: 'Sophie Martin',
      content: 'Excellente nouvelle ! Quel est leur budget approximatif ?',
      time: '14:32',
      type: 'text',
      isOwn: false
    },
    {
      id: 3,
      sender: 'Vous',
      content: 'Je prépare un RDV pour demain, ils ont 800 élèves',
      time: '14:35',
      type: 'text',
      isOwn: true
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'newLead': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'offline': return 'bg-gray-400';
      case 'active': return 'bg-blue-400';
      default: return 'bg-gray-400';
    }
  };

  const filteredConversations = (Array.isArray(conversations) ? conversations : []).filter(conv =>
    conv?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conv.role && conv?.role?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    conv?.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      {/* Search and New Message */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="pl-10"
          />
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t.newMessage}
        </Button>
      </div>

      {/* Messages Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <h3 className="font-semibold">{language === 'fr' ? 'Conversations' : 'Conversations'}</h3>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {(Array.isArray(filteredConversations) ? filteredConversations : []).map((conv) => (
                  <div
                    key={conv.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer border-b"
                    onClick={() => setSelectedConversation(conv.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {conv.type === 'team' ? <User className="w-5 h-5" /> : conv?.name?.charAt(0)}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(conv.status)}`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 truncate">{conv.name || ''}</h4>
                          {conv.unreadCount > 0 && (
                            <Badge className="bg-red-500 text-white text-xs">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {conv.role && (
                          <p className="text-xs text-gray-500 truncate">{conv.role}</p>
                        )}
                        <p className="text-sm text-gray-600 truncate mt-1">{conv.lastMessage}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">{conv.lastMessageTime}</span>
                          <Badge className={getCategoryColor(conv.category)}>
                            {conv.category === 'success' ? t.success :
                             conv.category === 'urgent' ? t.urgent :
                             conv.category === 'meeting' ? t.meeting :
                             conv.category === 'newLead' ? t.newLead : t.general}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message View */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            {selectedConversation ? (
              <div className="flex flex-col h-full">
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      S
                    </div>
                    <div>
                      <h3 className="font-semibold">Sophie Martin</h3>
                      <p className="text-sm text-gray-500">{t.online}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-4">
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {(Array.isArray(messages) ? messages : []).map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isOwn 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          {!message.isOwn && (
                            <p className="text-xs font-medium mb-1">{message.sender}</p>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${message.isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                            {message.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder={language === 'fr' ? 'Tapez votre message...' : 'Type your message...'}
                      className="flex-1"
                    />
                    <Button size="sm" className="flex items-center gap-1">
                      <Send className="w-3 h-3" />
                      {t.send}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{language === 'fr' ? 'Sélectionnez une conversation' : 'Select a conversation'}</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-blue-600">
              {(Array.isArray(conversations) ? conversations : []).filter(c => c.unreadCount > 0).length}
            </div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Messages Non Lus' : 'Unread Messages'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <User className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-green-600">
              {(Array.isArray(conversations) ? conversations : []).filter(c => c.status === 'online').length}
            </div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Membres En Ligne' : 'Members Online'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-purple-600">5</div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Réunions Aujourd\'hui' : 'Meetings Today'}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Messages;
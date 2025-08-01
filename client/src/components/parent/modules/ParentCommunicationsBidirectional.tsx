import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, Send, Users, Clock, CheckCircle2, Edit3, 
  User, Building, Mail, Phone, AlertCircle, Star, Reply
} from 'lucide-react';

const ParentCommunicationsBidirectional = () => {
  const { language } = useLanguage();
  const [selectedTab, setSelectedTab] = useState('inbox');
  const [newMessage, setNewMessage] = useState({
    recipient: '',
    subject: '',
    content: '',
    priority: 'normal'
  });

  const text = {
    fr: {
      title: 'Communications Parent',
      subtitle: 'Échanges bidirectionnels avec l\'école',
      inbox: 'Messages reçus',
      compose: 'Nouveau message',
      sent: 'Messages envoyés',
      writeToTeacher: 'Écrire à l\'enseignant',
      writeToDirection: 'Écrire à la direction',
      recipient: 'Destinataire',
      selectTeacher: 'Sélectionner un enseignant',
      direction: 'Direction de l\'école',
      subject: 'Sujet',
      message: 'Message',
      priority: 'Priorité',
      normal: 'Normal',
      urgent: 'Urgent',
      send: 'Envoyer',
      reply: 'Répondre',
      from: 'De',
      to: 'À',
      date: 'Date',
      status: 'Statut',
      read: 'Lu',
      unread: 'Non lu',
      noMessages: 'Aucun message',
      teachers: 'Enseignants disponibles',
      recentConversations: 'Conversations récentes',
      quickActions: 'Actions rapides'
    },
    en: {
      title: 'Parent Communications',
      subtitle: 'Bidirectional exchanges with school',
      inbox: 'Received Messages',
      compose: 'New Message',
      sent: 'Sent Messages',
      writeToTeacher: 'Write to Teacher',
      writeToDirection: 'Write to Administration',
      recipient: 'Recipient',
      selectTeacher: 'Select a teacher',
      direction: 'School Administration',
      subject: 'Subject',
      message: 'Message',
      priority: 'Priority',
      normal: 'Normal',
      urgent: 'Urgent',
      send: 'Send',
      reply: 'Reply',
      from: 'From',
      to: 'To',
      date: 'Date',
      status: 'Status',
      read: 'Read',
      unread: 'Unread',
      noMessages: 'No messages',
      teachers: 'Available Teachers',
      recentConversations: 'Recent Conversations',
      quickActions: 'Quick Actions'
    }
  };

  const t = text[language as keyof typeof text];

  // Données d'exemple pour la démo
  const teachers = [
    { id: 1, name: 'Mme Marie Ntamack', subject: 'Mathématiques', class: '3ème A' },
    { id: 2, name: 'M. Paul Mbarga', subject: 'Français', class: '3ème A' },
    { id: 3, name: 'Mme Sophie Onana', subject: 'Anglais', class: '3ème A' }
  ];

  const receivedMessages = [
    {
      id: 1,
      from: 'Mme Marie Ntamack',
      subject: 'Résultats de Junior en mathématiques',
      content: 'Bonsoir Mme Kamga, Je vous écris pour vous informer des excellents résultats de Junior en mathématiques...',
      date: '2025-01-28 14:30',
      status: 'unread',
      priority: 'normal'
    },
    {
      id: 2,
      from: 'Direction - M. Essono',
      subject: 'Réunion parents-professeurs',
      content: 'Chers parents, Nous organisons une réunion parents-professeurs le 15 février...',
      date: '2025-01-27 09:15',
      status: 'read',
      priority: 'urgent'
    }
  ];

  const sentMessages = [
    {
      id: 1,
      to: 'Mme Marie Ntamack',
      subject: 'Question sur les devoirs de mathématiques',
      content: 'Bonjour Madame, J\'aimerais avoir des précisions sur les exercices 15-20...',
      date: '2025-01-26 16:45',
      status: 'read'
    }
  ];

  const handleSendMessage = () => {
    console.log('Message envoyé:', newMessage);
    // Reset form
    setNewMessage({
      recipient: '',
      subject: '',
      content: '',
      priority: 'normal'
    });
    // Afficher notification de succès
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title || ''}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{t.writeToTeacher}</p>
                  <p className="text-sm text-gray-600">Communication directe</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Building className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">{t.writeToDirection}</p>
                  <p className="text-sm text-gray-600">Questions administratives</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">{t.recentConversations}</p>
                  <Badge variant="secondary">3 actives</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets principaux */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inbox" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {t.inbox}
              <Badge variant="destructive" className="ml-1">2</Badge>
            </TabsTrigger>
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              {t.compose}
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              {t.sent}
            </TabsTrigger>
          </TabsList>

          {/* Messages reçus */}
          <TabsContent value="inbox" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  {t.inbox}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(Array.isArray(receivedMessages) ? receivedMessages : []).map((message) => (
                    <div 
                      key={message.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        message.status === 'unread' ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{message.from}</p>
                          <p className="text-sm text-gray-600">{message.subject}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {message.priority === 'urgent' && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Urgent
                            </Badge>
                          )}
                          <Badge variant={message.status === 'unread' ? 'default' : 'secondary'}>
                            {message.status === 'unread' ? t.unread : t.read}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">{message.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{message.date}</span>
                        <Button variant="outline" size="sm">
                          <Reply className="w-4 h-4 mr-1" />
                          {t.reply}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nouveau message */}
          <TabsContent value="compose" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  {t.compose}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.recipient}</label>
                  <Select value={newMessage.recipient} onValueChange={(value) => 
                    setNewMessage({...newMessage, recipient: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectTeacher} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direction">{t.direction}</SelectItem>
                      {(Array.isArray(teachers) ? teachers : []).map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher?.id?.toString()}>
                          {teacher.name || ''} - {teacher.subject} ({teacher.class})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.subject}</label>
                  <Input
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({...newMessage, subject: e?.target?.value})}
                    placeholder="Objet du message..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.priority}</label>
                  <Select value={newMessage.priority} onValueChange={(value) => 
                    setNewMessage({...newMessage, priority: value})
                  }>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">{t.normal}</SelectItem>
                      <SelectItem value="urgent">{t.urgent}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.message}</label>
                  <Textarea
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({...newMessage, content: e?.target?.value})}
                    placeholder="Tapez votre message ici..."
                    rows={6}
                  />
                </div>

                <Button 
                  onClick={handleSendMessage}
                  className="w-full"
                  disabled={!newMessage.recipient || !newMessage.subject || !newMessage.content}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {t.send}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages envoyés */}          
          <TabsContent value="sent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  {t.sent}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(Array.isArray(sentMessages) ? sentMessages : []).map((message) => (
                    <div key={message.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">À: {message.to}</p>
                          <p className="text-sm text-gray-600">{message.subject}</p>
                        </div>
                        <Badge variant="outline">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Envoyé
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">{message.content}</p>
                      <span className="text-xs text-gray-500">{message.date}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enseignants disponibles */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t.teachers}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Array.isArray(teachers) ? teachers : []).map((teacher) => (
                <div key={teacher.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{teacher.name || ''}</p>
                      <p className="text-xs text-gray-600">{teacher.subject}</p>
                      <p className="text-xs text-gray-500">{teacher.class}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentCommunicationsBidirectional;
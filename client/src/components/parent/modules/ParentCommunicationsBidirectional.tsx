import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { 
  MessageSquare, Send, Users, Clock, CheckCircle2, Edit3, 
  User, Building, Mail, Phone, AlertCircle, Star, Reply, Loader2
} from 'lucide-react';

const ParentCommunicationsBidirectional = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('inbox');
  const [newMessage, setNewMessage] = useState({
    recipientId: '',
    recipientType: '',
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

  // Fetch authorized recipients from API
  const { data: recipientsData, isLoading: recipientsLoading } = useQuery({
    queryKey: ['/api/parent/communications/recipients'],
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const recipients = (recipientsData as any)?.recipients || [];
  const children = recipients.filter(r => r.type === 'child');
  const teachers = recipients.filter(r => r.type === 'teacher');
  const schools = recipients.filter(r => r.type === 'school');

  // Fetch messages from API
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/parent/messages'],
    staleTime: 1000 * 60 * 2 // 2 minutes
  });

  const receivedMessages = (messagesData as any)?.messages || [];
  const sentMessages = []; // Will be implemented when needed

  // Send message mutation with PWA notifications
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await fetch('/api/parent/communications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(messageData)
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: language === 'fr' ? 'Message envoyé' : 'Message sent',
        description: language === 'fr' 
          ? `Message envoyé avec succès via ${(data as any).notificationMethod}`
          : `Message sent successfully via ${(data as any).notificationMethod}`
      });
      // Reset form
      setNewMessage({
        recipientId: '',
        recipientType: '',
        subject: '',
        content: '',
        priority: 'normal'
      });
      // Refresh messages
      queryClient.invalidateQueries({ queryKey: ['/api/parent/messages'] });
    },
    onError: (error: any) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' 
          ? 'Erreur lors de l\'envoi du message'
          : 'Error sending message',
        variant: 'destructive'
      });
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.recipientId || !newMessage.subject || !newMessage.content) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' 
          ? 'Veuillez remplir tous les champs'
          : 'Please fill all required fields',
        variant: 'destructive'
      });
      return;
    }

    sendMessageMutation.mutate({
      recipientId: newMessage.recipientId,
      recipientType: newMessage.recipientType,
      subject: newMessage.subject,
      content: newMessage.content,
      priority: newMessage.priority
    });
  };

  const handleRecipientChange = (value: string) => {
    const recipient = recipients.find(r => r.id === value);
    if (recipient) {
      setNewMessage({
        ...newMessage,
        recipientId: value,
        recipientType: recipient.type
      });
    }
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
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
                  <Building className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
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
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
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
          <TabsList className="grid w-full grid-cols-3 h-auto p-1.5 bg-[#F3F5F7] rounded-xl gap-1">
            <TabsTrigger value="inbox" className="flex items-center justify-center gap-2 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="hidden sm:inline truncate">{t.inbox}</span>
              <Badge variant="destructive" className="ml-1 text-xs">2</Badge>
            </TabsTrigger>
            <TabsTrigger value="compose" className="flex items-center justify-center gap-2 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm">
              <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="hidden sm:inline truncate">{t.compose}</span>
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center justify-center gap-2 min-h-[44px] px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#7C5CFC] data-[state=active]:shadow-sm">
              <Send className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="hidden sm:inline truncate">{t.sent}</span>
            </TabsTrigger>
          </TabsList>

          {/* Messages reçus */}
          <TabsContent value="inbox" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                  {t.inbox}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {messagesLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">
                      {language === 'fr' ? 'Chargement des messages...' : 'Loading messages...'}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {receivedMessages.length === 0 ? (
                      <div className="text-center p-8 text-muted-foreground">
                        <Mail className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                        <p>{language === 'fr' ? 'Aucun message reçu' : 'No messages received'}</p>
                      </div>
                    ) : (
                      receivedMessages.map((message) => (
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
                                  <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
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
                              <Reply className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                              {t.reply}
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nouveau message */}
          <TabsContent value="compose" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 sm:w-6 sm:h-6" />
                  {t.compose}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.recipient}</label>
                  {recipientsLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Chargement des destinataires...</span>
                    </div>
                  ) : (
                    <Select 
                      value={newMessage.recipientId} 
                      onValueChange={handleRecipientChange}
                      data-testid="select-recipient"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'fr' ? 'Sélectionner un destinataire' : 'Select recipient'} />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Children */}
                        {children.length > 0 && (
                          <>
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                              {language === 'fr' ? 'Mes enfants' : 'My children'}
                            </div>
                            {children.map((child) => (
                              <SelectItem key={child.id} value={child.id}>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                                  {child.name} - {child.details}
                                </div>
                              </SelectItem>
                            ))}
                          </>
                        )}
                        
                        {/* Schools */}
                        {schools.length > 0 && (
                          <>
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">
                              {language === 'fr' ? 'Écoles' : 'Schools'}
                            </div>
                            {schools.map((school) => (
                              <SelectItem key={school.id} value={school.id}>
                                <div className="flex items-center gap-2">
                                  <Building className="h-4 w-4 sm:h-5 sm:w-5" />
                                  {school.name} - {school.details}
                                </div>
                              </SelectItem>
                            ))}
                          </>
                        )}
                        
                        {/* Teachers */}
                        {teachers.length > 0 && (
                          <>
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">
                              {language === 'fr' ? 'Enseignants' : 'Teachers'}
                            </div>
                            {teachers.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                                  {teacher.name} - {teacher.details}
                                </div>
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  )}
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
                  disabled={!newMessage.recipientId || !newMessage.subject || !newMessage.content || sendMessageMutation.isPending}
                  data-testid="button-send-message"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  )}
                  {sendMessageMutation.isPending 
                    ? (language === 'fr' ? 'Envoi...' : 'Sending...') 
                    : t.send
                  }
                </Button>
                
                <div className="text-xs text-muted-foreground text-center mt-2">
                  📱 {language === 'fr' 
                    ? 'Notifications envoyées via PWA (pas de SMS)'
                    : 'Notifications sent via PWA (no SMS)'
                  }
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages envoyés */}          
          <TabsContent value="sent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 sm:w-6 sm:h-6" />
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
                          <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
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

        {/* Destinataires autorisés */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              {language === 'fr' ? 'Destinataires autorisés' : 'Authorized Recipients'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {language === 'fr' 
                ? 'Vous pouvez uniquement communiquer avec les écoles de vos enfants, leurs enseignants et vos enfants'
                : 'You can only communicate with your children\'s schools, their teachers, and your children'
              }
            </p>
          </CardHeader>
          <CardContent>
            {recipientsLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">
                  {language === 'fr' ? 'Chargement...' : 'Loading...'}
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{children.length}</div>
                    <div className="text-xs text-muted-foreground">
                      {language === 'fr' ? 'Enfants' : 'Children'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{schools.length}</div>
                    <div className="text-xs text-muted-foreground">
                      {language === 'fr' ? 'Écoles' : 'Schools'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{teachers.length}</div>
                    <div className="text-xs text-muted-foreground">
                      {language === 'fr' ? 'Enseignants' : 'Teachers'}
                    </div>
                  </div>
                </div>
                
                {/* Recipients Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {recipients.map((recipient) => (
                    <div key={recipient.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          recipient.type === 'child' ? 'bg-blue-100' :
                          recipient.type === 'school' ? 'bg-green-100' :
                          'bg-purple-100'
                        }`}>
                          {recipient.type === 'child' ? (
                            <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                          ) : recipient.type === 'school' ? (
                            <Building className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                          ) : (
                            <User className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{recipient.name}</p>
                          <p className="text-xs text-gray-600 truncate">{recipient.details}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {recipient.type === 'child' ? (language === 'fr' ? 'Enfant' : 'Child') :
                             recipient.type === 'school' ? (language === 'fr' ? 'École' : 'School') :
                             (language === 'fr' ? 'Enseignant' : 'Teacher')
                            }
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentCommunicationsBidirectional;
import React, { useState } from 'react';
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
  MessageSquare, Eye, Reply, Trash2, RefreshCw, 
  AlertCircle, CheckCircle, Clock, User 
} from 'lucide-react';

const StudentCommunications: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isTeacherMessageOpen, setIsTeacherMessageOpen] = useState(false);
  const [isParentMessageOpen, setIsParentMessageOpen] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    teacherId: '',
    subject: '',
    message: ''
  });
  const [parentForm, setParentForm] = useState({
    parentId: '',
    subject: '',
    message: ''
  });

  const text = {
    fr: {
      title: 'Messages École',
      subtitle: 'Communiquer avec mes enseignants et mes parents',
      loading: 'Chargement des messages...',
      error: 'Erreur lors du chargement des messages',
      noMessages: 'Aucun message',
      refresh: 'Actualiser',
      markRead: 'Marquer comme lu',
      reply: 'Répondre',
      delete: 'Supprimer',
      from: 'De',
      subject: 'Objet',
      date: 'Date',
      writeToTeacher: 'Écrire à mes enseignants',
      writeToParents: 'Écrire à mes parents',
      selectTeacher: 'Choisir un enseignant',
      selectParent: 'Choisir un parent',
      messageSubject: 'Sujet du message',
      messageContent: 'Votre message',
      send: 'Envoyer',
      sending: 'Envoi en cours...',
      subjectPlaceholder: 'Ex: Question sur le cours de mathématiques',
      contentPlaceholder: 'Tapez votre message ici...',
      selectRecipient: 'Veuillez sélectionner un destinataire',
      messageSent: 'Message envoyé',
      messageSentDesc: 'Votre message a été envoyé avec succès',
      priority: {
        urgent: 'Urgent',
        high: 'Important',
        normal: 'Normal',
        low: 'Info'
      },
      status: {
        read: 'Lu',
        unread: 'Non lu'
      }
    },
    en: {
      title: 'School Messages',
      subtitle: 'Communicate with my teachers and parents',
      loading: 'Loading messages...',
      error: 'Error loading messages',
      noMessages: 'No messages',
      refresh: 'Refresh',
      markRead: 'Mark as read',
      reply: 'Reply',
      delete: 'Delete',
      from: 'From',
      subject: 'Subject',
      date: 'Date',
      writeToTeacher: 'Write to my teachers',
      writeToParents: 'Write to my parents',
      selectTeacher: 'Choose a teacher',
      selectParent: 'Choose a parent',
      messageSubject: 'Message subject',
      messageContent: 'Your message',
      send: 'Send',
      sending: 'Sending...',
      subjectPlaceholder: 'Ex: Question about math lesson',
      contentPlaceholder: 'Type your message here...',
      selectRecipient: 'Please select a recipient',
      messageSent: 'Message sent',
      messageSentDesc: 'Your message has been sent successfully',
      priority: {
        urgent: 'Urgent',
        high: 'Important',
        normal: 'Normal',
        low: 'Info'
      },
      status: {
        read: 'Read',
        unread: 'Unread'
      }
    }
  };

  const t = text[language as keyof typeof text];

  // Send message to teacher mutation
  const sendTeacherMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await fetch('/api/student/messages/teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to send message to teacher');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/student/messages'] });
      setIsTeacherMessageOpen(false);
      setTeacherForm({ teacherId: '', subject: '', message: '' });
      toast({
        title: t.messageSent,
        description: t.messageSentDesc
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message.',
        variant: 'destructive'
      });
    }
  });

  // Send message to parent mutation
  const sendParentMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await fetch('/api/student/messages/parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to send message to parent');
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
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message.',
        variant: 'destructive'
      });
    }
  });

  const handleSendToTeacher = () => {
    if (teacherForm.teacherId && teacherForm.subject && teacherForm.message) {
      sendTeacherMessageMutation.mutate(teacherForm);
    } else {
      toast({
        title: 'Information manquante',
        description: t.selectRecipient,
        variant: 'destructive'
      });
    }
  };

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

  // Fetch messages from PostgreSQL API
  const { data: messages = [], isLoading, error, refetch } = useQuery<any[]>({
    queryKey: ['/api/student/messages'],
    enabled: !!user
  });

  // Fetch teachers list
  const { data: teachers = [] } = useQuery({
    queryKey: ['/api/student/teachers'],
    queryFn: async () => {
      const response = await fetch('/api/student/teachers', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch teachers');
      return response.json();
    },
    enabled: !!user
  });

  // Fetch parents list
  const { data: parents = [] } = useQuery({
    queryKey: ['/api/student/parents'],
    queryFn: async () => {
      const response = await fetch('/api/student/parents', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch parents');
      return response.json();
    },
    enabled: !!user
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Teacher': return <User className="w-4 h-4" />;
      case 'Admin': return <AlertCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
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
    // TODO: Implement mark as read API call
    toast({
      title: t.markRead,
      description: language === 'fr' ? 'Message marqué comme lu' : 'Message marked as read'
    });
  };

  const handleReply = (message: any) => {
    // TODO: Implement reply functionality
    toast({
      title: t.reply,
      description: language === 'fr' ? `Réponse à ${message.from}` : `Reply to ${message.from}`
    });
  };

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
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t.title || ''}</h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t.refresh}
        </Button>
      </div>

      {/* Communication Sections */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Write to Teachers */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">
              <User className="w-5 h-5 mr-2 inline" />
              {t.writeToTeacher}
            </h3>
          </CardHeader>
          <CardContent>
            <Dialog open={isTeacherMessageOpen} onOpenChange={setIsTeacherMessageOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 w-full" data-testid="button-write-teacher">
                  <User className="w-4 h-4 mr-2" />
                  {t.writeToTeacher}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{t.writeToTeacher}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{t.selectTeacher}</label>
                    <Select value={teacherForm.teacherId} onValueChange={(value) => setTeacherForm(prev => ({ ...prev, teacherId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectTeacher} />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher: any) => (
                          <SelectItem key={teacher.id} value={teacher.id.toString()}>
                            {teacher.firstName} {teacher.lastName} - {teacher.subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t.messageSubject}</label>
                    <Input
                      value={teacherForm.subject}
                      onChange={(e) => setTeacherForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder={t.subjectPlaceholder}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t.messageContent}</label>
                    <Textarea
                      value={teacherForm.message}
                      onChange={(e) => setTeacherForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder={t.contentPlaceholder}
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleSendToTeacher}
                      disabled={sendTeacherMessageMutation.isPending || !teacherForm.teacherId || !teacherForm.subject || !teacherForm.message}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {sendTeacherMessageMutation.isPending ? t.sending : t.send}
                    </Button>
                    <Button variant="outline" onClick={() => setIsTeacherMessageOpen(false)}>
                      {language === 'fr' ? 'Annuler' : 'Cancel'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Write to Parents */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">
              <User className="w-5 h-5 mr-2 inline" />
              {t.writeToParents}
            </h3>
          </CardHeader>
          <CardContent>
            <Dialog open={isParentMessageOpen} onOpenChange={setIsParentMessageOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 w-full" data-testid="button-write-parent">
                  <User className="w-4 h-4 mr-2" />
                  {t.writeToParents}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{t.writeToParents}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{t.selectParent}</label>
                    <Select value={parentForm.parentId} onValueChange={(value) => setParentForm(prev => ({ ...prev, parentId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectParent} />
                      </SelectTrigger>
                      <SelectContent>
                        {parents.map((parent: any) => (
                          <SelectItem key={parent.id} value={parent.id.toString()}>
                            {parent.firstName} {parent.lastName} - {parent.relationship}
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
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t.messageContent}</label>
                    <Textarea
                      value={parentForm.message}
                      onChange={(e) => setParentForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder={t.contentPlaceholder}
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleSendToParent}
                      disabled={sendParentMessageMutation.isPending || !parentForm.parentId || !parentForm.subject || !parentForm.message}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {sendParentMessageMutation.isPending ? t.sending : t.send}
                    </Button>
                    <Button variant="outline" onClick={() => setIsParentMessageOpen(false)}>
                      {language === 'fr' ? 'Annuler' : 'Cancel'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Messages List */}
      {(Array.isArray(messages) ? messages.length : 0) === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">{t.noMessages}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(Array.isArray(messages) ? messages : []).map((message: any) => (
            <Card key={message.id} className={`p-6 transition-all hover:shadow-lg ${!message.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Message Header */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(message.fromRole)}
                      <span className="font-semibold text-gray-900">{message.from}</span>
                    </div>
                    <Badge variant="outline" className={`${getPriorityColor(message.priority)} text-white`}>
                      {t.priority[message.priority as keyof typeof t.priority]}
                    </Badge>
                    <Badge variant="outline">
                      {message.isRead ? t?.status?.read : t?.status?.unread}
                    </Badge>
                  </div>

                  {/* Subject */}
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {message.subject}
                  </h3>

                  {/* Message Preview */}
                  <p className="text-gray-600 mb-3">
                    {message?.message?.length > 150 
                      ? `${message?.message?.substring(0, 150)}...` 
                      : message.message
                    }
                  </p>

                  {/* Date */}
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {message.date}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  {!message.isRead && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleMarkRead(message.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {t.markRead}
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleReply(message)}
                  >
                    <Reply className="w-4 h-4 mr-1" />
                    {t.reply}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedMessage(message)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {language === 'fr' ? 'Voir' : 'View'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{selectedMessage.subject}</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedMessage(null)}
              >
                ✕
              </Button>
            </div>
            
            <div className="mb-4">
              <p><strong>{t.from}:</strong> {selectedMessage.from}</p>
              <p><strong>{t.date}:</strong> {selectedMessage.date}</p>
              <Badge className={`${getPriorityColor(selectedMessage.priority)} text-white mt-2`}>
                {t.priority[selectedMessage.priority as keyof typeof t.priority]}
              </Badge>
            </div>
            
            <div className="mb-6 bg-gray-50 p-4 rounded">
              <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button onClick={() => handleReply(selectedMessage)}>
                <Reply className="w-4 h-4 mr-2" />
                {t.reply}
              </Button>
              {!selectedMessage.isRead && (
                <Button variant="outline" onClick={() => handleMarkRead(selectedMessage.id)}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t.markRead}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCommunications;
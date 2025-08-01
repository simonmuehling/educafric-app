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
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportForm, setSupportForm] = useState({
    subject: '',
    category: 'academic',
    description: '',
    priority: 'medium'
  });

  const text = {
    fr: {
      title: 'Mes Messages',
      subtitle: 'Communications de l\'école et des enseignants',
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
      title: 'My Messages',
      subtitle: 'Communications from school and teachers',
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

  // Submit support request mutation
  const submitSupportMutation = useMutation({
    mutationFn: async (supportData: any) => {
      const response = await fetch('/api/student/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supportData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to submit support request');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/student/messages'] });
      setIsSupportOpen(false);
      setSupportForm({ subject: '', category: 'academic', description: '', priority: 'medium' });
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande d\'aide a été soumise avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer la demande.',
        variant: 'destructive'
      });
    }
  });

  const handleSubmitSupport = () => {
    if (supportForm.subject && supportForm.description) {
      submitSupportMutation.mutate(supportForm);
    }
  };

  // Fetch messages from PostgreSQL API
  const { data: messages = [], isLoading, error, refetch } = useQuery<any[]>({
    queryKey: ['/api/student/messages'],
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

      {/* Demande d'Aide Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              <AlertCircle className="w-5 h-5 mr-2 inline" />
              Demander de l'Aide
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700 w-full" data-testid="button-request-support">
                <AlertCircle className="w-4 h-4 mr-2" />
                Demander de l'Aide
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Demande d'Aide</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Sujet</label>
                  <Input
                    value={supportForm.subject}
                    onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Objet de votre demande"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Catégorie</label>
                  <Select value={supportForm.category} onValueChange={(value) => setSupportForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Aide académique</SelectItem>
                      <SelectItem value="technical">Problème technique</SelectItem>
                      <SelectItem value="personal">Aide personnelle</SelectItem>
                      <SelectItem value="administrative">Question administrative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priorité</label>
                  <Select value={supportForm.priority} onValueChange={(value) => setSupportForm(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="medium">Normale</SelectItem>
                      <SelectItem value="high">Importante</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={supportForm.description || ''}
                    onChange={(e) => setSupportForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez votre problème ou votre question..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleSubmitSupport}
                    disabled={submitSupportMutation.isPending || !supportForm.subject || !supportForm.description}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    {submitSupportMutation.isPending ? 'Envoi...' : 'Envoyer la Demande'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsSupportOpen(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

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
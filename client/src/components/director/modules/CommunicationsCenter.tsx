import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModernStatsCard } from '@/components/ui/ModernCard';
import { 
  MessageSquare, Send, Users, Bell, Phone, Mail, 
  AlertTriangle, Calendar, CheckCircle, Plus, Eye, Clock, History
} from 'lucide-react';
import MobileActionsOverlay from '@/components/mobile/MobileActionsOverlay';

const CommunicationsCenter: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [messageText, setMessageText] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('all-parents');
  const [messageType, setMessageType] = useState('general');
  const [sending, setSending] = useState(false);
  const [communicationsHistory, setCommunicationsHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Load communications history from API
  useEffect(() => {
    const loadCommunicationsHistory = async () => {
      setLoadingHistory(true);
      try {
        console.log('[COMMUNICATIONS_CENTER] 📋 Loading communications history...');
        
        const response = await fetch('/api/communications/history?limit=10', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.communications) {
            console.log('[COMMUNICATIONS_CENTER] ✅ History loaded:', (Array.isArray(result.communications) ? result.communications.length : 0), 'items');
            setCommunicationsHistory(result.communications);
          } else {
            console.warn('[COMMUNICATIONS_CENTER] ⚠️ No communications data in API response');
            setCommunicationsHistory([]);
          }
        } else {
          console.error('[COMMUNICATIONS_CENTER] ❌ Failed to load history:', response.status);
          setCommunicationsHistory([]);
        }
      } catch (error: any) {
        console.error('[COMMUNICATIONS_CENTER] ❌ History API error:', error);
        setCommunicationsHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadCommunicationsHistory();
  }, []);

  const text = {
    fr: {
      title: 'Centre de Communications',
      subtitle: 'Gestion complète des communications avec parents, élèves et enseignants',
      stats: {
        totalMessages: 'Messages Totaux',
        unreadMessages: 'Non Lus',
        sentToday: 'Envoyés Aujourd\'hui',
        recipients: 'Destinataires'
      },
      actions: {
        composeMessage: 'Composer Message',
        sendMessage: 'Envoyer Message',
        newAnnouncement: 'Nouvelle Annonce',
        urgentAlert: 'Alerte Urgente'
      },
      recipients: {
        everyone: 'Tout le Monde',
        allParents: 'Tous les Parents',
        allTeachers: 'Tous les Enseignants',
        specificClass: 'Classe Spécifique',
        allStudents: 'Tous les Élèves'
      },
      messageTypes: {
        general: 'Information Générale',
        urgent: 'Annonce Urgente',
        academic: 'Information Académique',
        event: 'Événement École'
      },
      recent: 'Messages Récents',
      placeholder: 'Tapez votre message ici...',
      selectRecipient: 'Sélectionner les destinataires',
      selectType: 'Type de message'
    },
    en: {
      title: 'Communications Center',
      subtitle: 'Complete management of communications with parents, students and teachers',
      stats: {
        totalMessages: 'Total Messages',
        unreadMessages: 'Unread',
        sentToday: 'Sent Today',
        recipients: 'Recipients'
      },
      actions: {
        composeMessage: 'Compose Message',
        sendMessage: 'Send Message',
        newAnnouncement: 'New Announcement',
        urgentAlert: 'Urgent Alert'
      },
      recipients: {
        everyone: 'Everyone',
        allParents: 'All Parents',
        allTeachers: 'All Teachers',
        specificClass: 'Specific Class',
        allStudents: 'All Students'
      },
      messageTypes: {
        general: 'General Information',
        urgent: 'Urgent Announcement',
        academic: 'Academic Information',
        event: 'School Event'
      },
      recent: 'Recent Messages', 
      placeholder: 'Type your message here...',
      selectRecipient: 'Select recipients',
      selectType: 'Message type'
    }
  };

  const t = text[language as keyof typeof text];

  const communicationStats = [
    {
      title: t?.stats?.totalMessages,
      value: '1,247',
      icon: <MessageSquare className="w-5 h-5" />,
      trend: { value: 15, isPositive: true },
      gradient: 'blue' as const
    },
    {
      title: t?.stats?.unreadMessages,
      value: '34',
      icon: <Bell className="w-5 h-5" />,
      trend: { value: 8, isPositive: false },
      gradient: 'orange' as const
    },
    {
      title: t?.stats?.sentToday,
      value: '89',
      icon: <Send className="w-5 h-5" />,
      trend: { value: 12, isPositive: true },
      gradient: 'green' as const
    },
    {
      title: t?.stats?.recipients,
      value: '456',
      icon: <Users className="w-5 h-5" />,
      trend: { value: 3, isPositive: true },
      gradient: 'purple' as const
    }
  ];

  // Load recent messages from API
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch communications history
  useEffect(() => {
    const fetchCommunications = async () => {
      try {
        console.log('[COMMUNICATIONS_CENTER] 📋 Fetching communications history');
        const response = await fetch('/api/communications/history?limit=10', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[COMMUNICATIONS_CENTER] ✅ Communications loaded:', data.communications?.length || 0);
          setRecentMessages(data.communications || []);
        } else {
          console.error('[COMMUNICATIONS_CENTER] ❌ Failed to load communications:', response.status);
        }
      } catch (error) {
        console.error('[COMMUNICATIONS_CENTER] ❌ API Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunications();
  }, []);

  // Function to show confirmation dialog
  const handleSendMessage = () => {
    if (!messageText.trim()) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Veuillez saisir un message' : 'Please enter a message',
        variant: 'destructive'
      });
      return;
    }

    // Show confirmation dialog instead of sending immediately
    setShowConfirmDialog(true);
  };

  // Actual send function after confirmation
  const confirmSendMessage = async () => {
    setSending(true);
    
    try {
      console.log('[COMMUNICATIONS_CENTER] 📨 Sending message via API:', {
        messageText: messageText.substring(0, 50) + '...',
        selectedRecipient,
        messageType
      });

      const response = await fetch('/api/communications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          messageText,
          selectedRecipient,
          messageType,
          priority: messageType === 'urgent' ? 'high' : 'normal'
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('[COMMUNICATIONS_CENTER] ✅ Message sent successfully:', result);
        
        toast({
          title: language === 'fr' ? 'Message Envoyé' : 'Message Sent',
          description: result.message || (language === 'fr' ? 
            `Message envoyé à ${result.communication?.recipients || 0} destinataires` :
            `Message sent to ${result.communication?.recipients || 0} recipients`)
        });
        
        setMessageText('');
        setShowConfirmDialog(false);
        
        // Reload communications history after sending message
        try {
          const historyResponse = await fetch('/api/communications/history?limit=10', {
            method: 'GET',
            credentials: 'include'
          });
          
          if (historyResponse.ok) {
            const historyResult = await historyResponse.json();
            if (historyResult.success && historyResult.communications) {
              setRecentMessages(historyResult.communications);
              console.log('[COMMUNICATIONS_CENTER] 🔄 History reloaded after sending message');
            }
          }
        } catch (error) {
          console.warn('[COMMUNICATIONS_CENTER] ⚠️ Failed to reload history after sending');
        }
      } else {
        console.error('[COMMUNICATIONS_CENTER] ❌ Send message failed:', result);
        toast({
          title: language === 'fr' ? 'Erreur d\'envoi' : 'Send Error',
          description: result.message || (language === 'fr' ? 
            'Impossible d\'envoyer le message' : 'Failed to send message'),
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('[COMMUNICATIONS_CENTER] ❌ Send message API error:', error);
      toast({
        title: language === 'fr' ? 'Erreur Réseau' : 'Network Error',
        description: language === 'fr' ? 
          'Erreur de connexion. Veuillez réessayer.' : 
          'Connection error. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const handleQuickAction = (actionType: string) => {
    switch (actionType) {
      case 'urgent':
        setMessageType('urgent');
        setMessageText(language === 'fr' ? 
          'URGENT: Information importante de la direction...' :
          'URGENT: Important information from administration...'
        );
        break;
      case 'event':
        setMessageType('event');
        setMessageText(language === 'fr' ?
          'Événement école: Nous avons le plaisir de vous annoncer...' :
          'School event: We are pleased to announce...'
        );
        break;
      case 'academic':
        setMessageType('academic');
        setMessageText(language === 'fr' ?
          'Information académique: Veuillez prendre note que...' :
          'Academic information: Please note that...'
        );
        break;
    }
  };

  const getMessageTypeColor = (type: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      urgent: 'bg-red-100 text-red-800',
      academic: 'bg-green-100 text-green-800',
      event: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || colors.general;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'sent') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'delivered') return <CheckCircle className="w-4 h-4 text-blue-500" />;
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              {t.title || ''}
            </h1>
            <p className="text-gray-600 mt-2">{t.subtitle}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {(Array.isArray(communicationStats) ? communicationStats : []).map((stat, index) => (
            <ModernStatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              {language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
            </h2>
          </CardHeader>
          <CardContent>
            <MobileActionsOverlay
              title={language === 'fr' ? 'Actions Communications' : 'Communication Actions'}
              maxVisibleButtons={3}
              actions={[
                {
                  id: 'urgent-broadcast',
                  label: language === 'fr' ? 'Diffusion Urgente' : 'Urgent Broadcast',
                  icon: <AlertTriangle className="w-5 h-5" />,
                  onClick: () => {
                    setMessageType('urgent');
                    setSelectedRecipient('all-parents');
                    setMessageText(language === 'fr' ? 
                      'URGENT: Information importante de la direction...' :
                      'URGENT: Important information from administration...'
                    );
                  },
                  color: 'bg-red-600 hover:bg-red-700'
                },
                {
                  id: 'parent-notification',
                  label: language === 'fr' ? 'Notifier Parents' : 'Notify Parents',
                  icon: <Users className="w-5 h-5" />,
                  onClick: () => {
                    setSelectedRecipient('all-parents');
                    setMessageType('general');
                    setMessageText(language === 'fr' ?
                      'Chers parents, nous souhaitons vous informer que...' :
                      'Dear parents, we would like to inform you that...'
                    );
                  },
                  color: 'bg-blue-600 hover:bg-blue-700'
                },
                {
                  id: 'teacher-memo',
                  label: language === 'fr' ? 'Mémo Enseignants' : 'Teacher Memo',
                  icon: <Mail className="w-5 h-5" />,
                  onClick: () => {
                    setSelectedRecipient('all-teachers');
                    setMessageType('academic');
                    setMessageText(language === 'fr' ?
                      'Chers collègues enseignants, veuillez prendre note...' :
                      'Dear teaching colleagues, please note...'
                    );
                  },
                  color: 'bg-green-600 hover:bg-green-700'
                },
                {
                  id: 'event-announcement',
                  label: language === 'fr' ? 'Annonce Événement' : 'Event Announcement',
                  icon: <Calendar className="w-5 h-5" />,
                  onClick: () => {
                    setMessageType('event');
                    setSelectedRecipient('all-parents');
                    setMessageText(language === 'fr' ?
                      'Événement école: Nous avons le plaisir de vous annoncer...' :
                      'School event: We are pleased to announce...'
                    );
                  },
                  color: 'bg-purple-600 hover:bg-purple-700'
                },
                {
                  id: 'sms-alert',
                  label: language === 'fr' ? 'Alerte SMS' : 'SMS Alert',
                  icon: <Phone className="w-5 h-5" />,
                  onClick: async () => {
                    try {
                      console.log('[COMMUNICATIONS_CENTER] 🚨 Sending SMS Alert via API');
                      
                      const response = await fetch('/api/communications/sms-alert', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                          recipients: selectedRecipient,
                          urgencyLevel: 'high',
                          alertType: 'emergency'
                        })
                      });

                      const result = await response.json();

                      if (response.ok && result.success) {
                        console.log('[COMMUNICATIONS_CENTER] ✅ SMS Alert sent:', result);
                        toast({
                          title: language === 'fr' ? 'Alerte SMS Envoyée' : 'SMS Alert Sent',
                          description: result.message || (language === 'fr' ? 
                            `Alerte envoyée à ${result.alert?.recipientCount || 0} destinataires` :
                            `Alert sent to ${result.alert?.recipientCount || 0} recipients`)
                        });
                      } else {
                        console.error('[COMMUNICATIONS_CENTER] ❌ SMS Alert failed:', result);
                        toast({
                          title: language === 'fr' ? 'Erreur SMS' : 'SMS Error',
                          description: result.message || (language === 'fr' ? 
                            'Impossible d\'envoyer l\'alerte SMS' : 'Failed to send SMS alert'),
                          variant: 'destructive'
                        });
                      }
                    } catch (error: any) {
                      console.error('[COMMUNICATIONS_CENTER] ❌ SMS Alert API error:', error);
                      toast({
                        title: language === 'fr' ? 'Erreur SMS' : 'SMS Error',
                        description: language === 'fr' ? 
                          'Erreur lors de l\'envoi de l\'alerte SMS' : 
                          'Error sending SMS alert',
                        variant: 'destructive'
                      });
                    }
                  },
                  color: 'bg-orange-600 hover:bg-orange-700'
                }
              ]}
            />
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-500" />
              {t?.actions?.composeMessage}
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">{t.selectRecipient}</label>
                <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                  <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                    <SelectItem value="everyone" className="hover:bg-gray-50 focus:bg-gray-50 font-semibold text-blue-700">
                      {language === 'fr' ? '📢 Envoyer à Tout le Monde' : '📢 Send to Everyone'}
                    </SelectItem>
                    <SelectItem value="all-parents" className="hover:bg-gray-50 focus:bg-gray-50">{t?.recipients?.allParents}</SelectItem>
                    <SelectItem value="all-teachers" className="hover:bg-gray-50 focus:bg-gray-50">{t?.recipients?.allTeachers}</SelectItem>
                    <SelectItem value="all-students" className="hover:bg-gray-50 focus:bg-gray-50">{t?.recipients?.allStudents}</SelectItem>
                    
                    {/* Separateur pour convocations individuelles */}
                    <SelectItem value="separator-1" disabled className="text-xs text-gray-400 font-semibold">
                      ──── {language === 'fr' ? 'CONVOCATIONS INDIVIDUELLES' : 'INDIVIDUAL SUMMONS'} ────
                    </SelectItem>
                    
                    {/* Parents/Tuteurs spécifiques */}
                    <SelectItem value="parent-marie-kamga" className="hover:bg-gray-50 focus:bg-gray-50">
                      {language === 'fr' ? '👥 Marie Kamga (Parent - Junior Kamga)' : '👥 Marie Kamga (Parent - Junior Kamga)'}
                    </SelectItem>
                    <SelectItem value="parent-jean-fosso" className="hover:bg-gray-50 focus:bg-gray-50">
                      {language === 'fr' ? '👥 Jean Fosso (Parent - Aline Fosso)' : '👥 Jean Fosso (Parent - Aline Fosso)'}
                    </SelectItem>
                    <SelectItem value="parent-marie-ewondo" className="hover:bg-gray-50 focus:bg-gray-50">
                      {language === 'fr' ? '👥 Marie Ewondo (Parent - Carlos Ewondo)' : '👥 Marie Ewondo (Parent - Carlos Ewondo)'}
                    </SelectItem>
                    
                    {/* Enseignants spécifiques */}
                    <SelectItem value="teacher-paul-mbarga" className="hover:bg-gray-50 focus:bg-gray-50">
                      {language === 'fr' ? '👨‍🏫 Prof. Jean Paul Mbarga (Mathématiques)' : '👨‍🏫 Prof. Jean Paul Mbarga (Mathematics)'}
                    </SelectItem>
                    <SelectItem value="teacher-marie-essono" className="hover:bg-gray-50 focus:bg-gray-50">
                      {language === 'fr' ? '👩‍🏫 Mme Marie Claire Essono (Français)' : '👩‍🏫 Mrs. Marie Claire Essono (French)'}
                    </SelectItem>
                    <SelectItem value="teacher-paul-atangana" className="hover:bg-gray-50 focus:bg-gray-50">
                      {language === 'fr' ? '👨‍🏫 M. Paul Atangana (Histoire-Géo)' : '👨‍🏫 Mr. Paul Atangana (History-Geography)'}
                    </SelectItem>
                    
                    {/* Separateur pour classes */}
                    <SelectItem value="separator-2" disabled className="text-xs text-gray-400 font-semibold">
                      ──── {language === 'fr' ? 'CLASSES SPÉCIFIQUES' : 'SPECIFIC CLASSES'} ────
                    </SelectItem>
                    <SelectItem value="6eme-a" className="hover:bg-gray-50 focus:bg-gray-50">6ème A (32 élèves)</SelectItem>
                    <SelectItem value="5eme-b" className="hover:bg-gray-50 focus:bg-gray-50">5ème B (28 élèves)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t.selectType}</label>
                <Select value={messageType} onValueChange={setMessageType}>
                  <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                    <SelectItem value="general" className="hover:bg-gray-50 focus:bg-gray-50">{t?.messageTypes?.general}</SelectItem>
                    <SelectItem value="urgent" className="hover:bg-gray-50 focus:bg-gray-50">{t?.messageTypes?.urgent}</SelectItem>
                    <SelectItem value="academic" className="hover:bg-gray-50 focus:bg-gray-50">{t?.messageTypes?.academic}</SelectItem>
                    <SelectItem value="event" className="hover:bg-gray-50 focus:bg-gray-50">{t?.messageTypes?.event}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e?.target?.value)}
                placeholder={t.placeholder}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={handleSendMessage}
                disabled={sending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {sending ? (language === 'fr' ? 'Envoi...' : 'Sending...') : t?.actions?.sendMessage}
              </Button>
              
              <Button 
                onClick={() => handleQuickAction('urgent')}
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {t?.actions?.urgentAlert}
              </Button>
              
              <Button 
                onClick={() => handleQuickAction('event')}
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {t?.actions?.newAnnouncement}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <History className="w-5 h-5 text-blue-500" />
              {language === 'fr' ? 'Historique des Communications' : 'Communications History'}
            </h2>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  {language === 'fr' ? 'Chargement...' : 'Loading...'}
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                {(Array.isArray(communicationsHistory) ? communicationsHistory.length : 0) > 0 ? (
                  (Array.isArray(communicationsHistory) ? communicationsHistory : []).map((message) => (
                <div key={message.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{message.subject}</h3>
                        <p className="text-sm text-gray-600">{message.from} → {message.to}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getMessageTypeColor(message.type)}>
                        {t.messageTypes[message.type as keyof typeof t.messageTypes]}
                      </Badge>
                      {getStatusIcon(message.status)}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{message.content}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{message.date} à {message.time}</span>
                    <span>{message.recipients} destinataires</span>
                  </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>
                      {language === 'fr' ? 
                        'Aucune communication récente trouvée' : 
                        'No recent communications found'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'fr' ? 'Confirmer l\'envoi du message' : 'Confirm Message Send'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'fr' ? 
                'Êtes-vous sûr de vouloir envoyer ce message ?' : 
                'Are you sure you want to send this message?'}
              <br />
              <br />
              <strong>{language === 'fr' ? 'Destinataires' : 'Recipients'}:</strong> {selectedRecipient}
              <br />
              <strong>{language === 'fr' ? 'Type' : 'Type'}:</strong> {t.messageTypes[messageType as keyof typeof t.messageTypes]}
              <br />
              <strong>{language === 'fr' ? 'Message' : 'Message'}:</strong> {messageText.substring(0, 100)}{messageText.length > 100 ? '...' : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'fr' ? 'Annuler' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSendMessage} disabled={sending}>
              {sending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'fr' ? 'Envoi...' : 'Sending...'}
                </>
              ) : (
                language === 'fr' ? 'Confirmer l\'envoi' : 'Confirm Send'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CommunicationsCenter;
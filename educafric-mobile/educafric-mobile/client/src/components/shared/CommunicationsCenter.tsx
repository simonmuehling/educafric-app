import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard, ModernStatsCard } from '@/components/ui/ModernCard';
import { MessageSquare, Send, Users, Bell, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const CommunicationsCenter = () => {
  const { language } = useLanguage();
  const [selectedRecipient, setSelectedRecipient] = useState('all');
  const [messageText, setMessageText] = useState('');
  const [showComposer, setShowComposer] = useState(false);

  const text = {
    fr: {
      title: 'Centre de Communications',
      subtitle: 'Gestion des communications avec parents, élèves et enseignants',
      totalMessages: 'Messages Totaux',
      unreadMessages: 'Non Lus',
      sentToday: 'Envoyés Aujourd\'hui',
      recipients: 'Destinataires',
      composeMessage: 'Composer Message',
      sendMessage: 'Envoyer Message',
      selectRecipient: 'Sélectionner Destinataires',
      messageContent: 'Contenu du Message',
      allParents: 'Tous les Parents',
      allTeachers: 'Tous les Enseignants',
      specificClass: 'Classe Spécifique',
      recentMessages: 'Messages Récents',
      from: 'De',
      to: 'À',
      sent: 'Envoyé',
      read: 'Lu',
      unread: 'Non Lu',
      emergency: 'Urgence',
      general: 'Général',
      academic: 'Académique',
      messageSent: 'Message envoyé avec succès!'
    },
    en: {
      title: 'Communications Center',
      subtitle: 'Manage communications with parents, students and teachers',
      totalMessages: 'Total Messages',
      unreadMessages: 'Unread',
      sentToday: 'Sent Today',
      recipients: 'Recipients',
      composeMessage: 'Compose Message',
      sendMessage: 'Send Message',
      selectRecipient: 'Select Recipients',
      messageContent: 'Message Content',
      allParents: 'All Parents',
      allTeachers: 'All Teachers',
      specificClass: 'Specific Class',
      recentMessages: 'Recent Messages',
      from: 'From',
      to: 'To',
      sent: 'Sent',
      read: 'Read',
      unread: 'Unread',
      emergency: 'Emergency',
      general: 'General',
      academic: 'Academic',
      messageSent: 'Message sent successfully!'
    }
  };

  const t = text[language as keyof typeof text];

  const communicationStats = [
    {
      title: t.totalMessages,
      value: '1,247',
      icon: <MessageSquare className="w-5 h-5" />,
      trend: { value: 15, isPositive: true },
      gradient: 'blue' as const
    },
    {
      title: t.unreadMessages,
      value: '34',
      icon: <Bell className="w-5 h-5" />,
      trend: { value: 8, isPositive: false },
      gradient: 'orange' as const
    },
    {
      title: t.sentToday,
      value: '89',
      icon: <Send className="w-5 h-5" />,
      trend: { value: 12, isPositive: true },
      gradient: 'green' as const
    },
    {
      title: t.recipients,
      value: '456',
      icon: <Users className="w-5 h-5" />,
      trend: { value: 3, isPositive: true },
      gradient: 'purple' as const
    }
  ];

  const recentMessages = [
    {
      id: 1,
      from: 'Direction École',
      to: 'Tous les Parents',
      subject: 'Réunion Parents-Professeurs',
      content: 'Nous organisons une réunion parents-professeurs le 30 janvier...',
      type: 'general',
      status: 'sent',
      date: '2025-01-24',
      time: '14:30'
    },
    {
      id: 2,
      from: 'Direction École',
      to: 'Classe 6ème A',
      subject: 'Sortie Éducative',
      content: 'Une sortie éducative est prévue au musée national...',
      type: 'academic',
      status: 'sent',
      date: '2025-01-23',
      time: '09:15'
    },
    {
      id: 3,
      from: 'Administration',
      to: 'Tous les Enseignants',
      subject: 'Formation Pédagogique',
      content: 'Formation obligatoire en pédagogie moderne...',
      type: 'academic',
      status: 'read',
      date: '2025-01-22',
      time: '16:45'
    }
  ];

  const recipientOptions = [
    { value: 'all', label: 'Tous' },
    { value: 'parents', label: t.allParents },
    { value: 'teachers', label: t.allTeachers },
    { value: 'class', label: t.specificClass }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'academic':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'read':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'unread':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    console.log('Sending message to:', selectedRecipient);
    console.log('Message:', messageText);
    
    setMessageText('');
    setShowComposer(false);
    alert(t.messageSent);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t.title || ''}</h2>
        <p className="text-gray-600 mb-6">{t.subtitle}</p>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {(Array.isArray(communicationStats) ? communicationStats : []).map((stat, index) => (
            <ModernStatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Compose Message Button */}
        <div className="flex justify-end mb-6">
          <Button 
            onClick={() => setShowComposer(!showComposer)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {t.composeMessage}
          </Button>
        </div>
      </div>

      {/* Message Composer */}
      {showComposer && (
        <ModernCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.composeMessage}</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.selectRecipient}
              </label>
              <select
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e?.target?.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(Array.isArray(recipientOptions) ? recipientOptions : []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.messageContent}
              </label>
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e?.target?.value)}
                placeholder="Tapez votre message ici..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4">
              <Button onClick={handleSendMessage} className="bg-green-600 hover:bg-green-700 text-white">
                <Send className="w-4 h-4 mr-2" />
                {t.sendMessage}
              </Button>
              <Button onClick={() => setShowComposer(false)} variant="outline">
                Annuler
              </Button>
            </div>
          </div>
        </ModernCard>
      )}

      {/* Recent Messages */}
      <ModernCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.recentMessages}</h3>
        
        <div className="space-y-4">
          {(Array.isArray(recentMessages) ? recentMessages : []).map((message) => (
            <div key={message.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{message.subject}</h4>
                  <p className="text-sm text-gray-600">
                    {t.from}: {message.from} • {t.to}: {message.to}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getTypeColor(message.type)}>
                    {message.type}
                  </Badge>
                  <Badge className={getStatusColor(message.status)}>
                    {message.status}
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-3">
                {message.content}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{message.date} à {message.time}</span>
                <Button size="sm" variant="outline">
                  Voir Détails
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ModernCard>
    </div>
  );
};

export default CommunicationsCenter;
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, Phone, Mail, Bell, Send, Users, School, BookOpen,
  Eye, Clock, AlertTriangle, CheckCircle, User, Settings, Target
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: number;
  sender: { role: string; name: string; avatar?: string };
  recipient: { role: string; name: string };
  category: 'academic' | 'general' | 'urgent' | 'administrative';
  subject: string;
  content: string;
  channel: 'sms' | 'email' | 'app' | 'sms+email';
  isRead: boolean;
  sentAt: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

const InterProfileCommunications = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inbox');
  const [showComposeForm, setShowComposeForm] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const [newMessage, setNewMessage] = useState({
    recipientRole: 'parents',
    recipients: [] as string[],
    category: 'general',
    subject: '',
    content: '',
    channel: 'app',
    priority: 'normal'
  });

  const text = {
    fr: {
      title: 'Communications Inter-Profils',
      subtitle: 'Système de Communication Institutionnel Avancé',
      
      tabs: {
        inbox: 'Messages Reçus',
        sent: 'Messages Envoyés',
        compose: 'Nouveau Message',
        templates: 'Modèles',
        history: 'Historique'
      },
      
      communicationTypes: {
        institutional: 'Communications Institutionnelles',
        individual: 'Messages Individuels', 
        urgent: 'Notifications Urgentes',
        reports: 'Rapports & Suivis',
        freelancer: 'Communications Freelancer',
        commercial: 'CRM Commercial'
      },
      
      roles: {
        students: 'Étudiants',
        parents: 'Parents',
        teachers: 'Enseignants',
        directors: 'Direction',
        freelancers: 'Répétiteurs',
        commercial: 'Équipe Commerciale',
        admin: 'Administration',
        all: 'Tous les Profils'
      },
      
      channels: {
        sms: 'SMS (Mobile)',
        email: 'Email',
        app: 'Application',
        'sms+email': 'SMS + Email',
        whatsapp: 'WhatsApp Business'
      },
      
      categories: {
        academic: 'Académique',
        general: 'Général',
        urgent: 'Urgent',
        administrative: 'Administratif',
        behavioral: 'Comportemental',
        financial: 'Financier'
      },
      
      priorities: {
        low: 'Faible',
        normal: 'Normal',
        high: 'Élevée',
        urgent: 'Urgent'
      },
      
      actions: {
        compose: 'Rédiger',
        send: 'Envoyer',
        reply: 'Répondre',
        forward: 'Transférer',
        delete: 'Supprimer',
        markRead: 'Marquer Lu',
        archive: 'Archiver'
      },
      
      placeholders: {
        subject: 'Sujet du message',
        content: 'Contenu du message...',
        search: 'Rechercher dans les messages'
      }
    },
    
    en: {
      title: 'Inter-Profile Communications',
      subtitle: 'Advanced Institutional Communication System',
      
      tabs: {
        inbox: 'Inbox',
        sent: 'Sent Messages',
        compose: 'Compose',
        templates: 'Templates',
        history: 'History'
      },
      
      communicationTypes: {
        institutional: 'Institutional Communications',
        individual: 'Individual Messages',
        urgent: 'Urgent Notifications',
        reports: 'Reports & Follow-ups',
        freelancer: 'Freelancer Communications',
        commercial: 'Commercial CRM'
      },
      
      roles: {
        students: 'Students',
        parents: 'Parents',
        teachers: 'Teachers',
        directors: 'Management',
        freelancers: 'Tutors',
        commercial: 'Sales Team',
        admin: 'Administration',
        all: 'All Profiles'
      },
      
      channels: {
        sms: 'SMS (Mobile)',
        email: 'Email',
        app: 'Application',
        'sms+email': 'SMS + Email',
        whatsapp: 'WhatsApp Business'
      },
      
      categories: {
        academic: 'Academic',
        general: 'General',
        urgent: 'Urgent',
        administrative: 'Administrative',
        behavioral: 'Behavioral',
        financial: 'Financial'
      },
      
      priorities: {
        low: 'Low',
        normal: 'Normal',
        high: 'High',
        urgent: 'Urgent'
      },
      
      actions: {
        compose: 'Compose',
        send: 'Send',
        reply: 'Reply',
        forward: 'Forward',
        delete: 'Delete',
        markRead: 'Mark Read',
        archive: 'Archive'
      },
      
      placeholders: {
        subject: 'Message subject',
        content: 'Message content...',
        search: 'Search messages'
      }
    }
  };

  const t = text[language as keyof typeof text];

  // Messages d'exemple selon les différents flux de communication
  const sampleMessages: Message[] = [
    // École → Parents/Étudiants
    {
      id: 1,
      sender: { role: 'director', name: 'M. Directeur Tchamba' },
      recipient: { role: 'parents', name: 'Tous les Parents' },
      category: 'urgent',
      subject: 'Réunion Parents-Enseignants - 25 Janvier',
      content: 'Chers parents, nous organisons une réunion importante le vendredi 25 janvier à 15h en salle polyvalente. Présence obligatoire pour discuter des résultats du trimestre.',
      channel: 'sms+email',
      priority: 'high',
      sentAt: '2025-01-24 14:30',
      isRead: false
    },
    
    // Teacher → Students/Parents
    {
      id: 2,
      sender: { role: 'teacher', name: 'Mme Martin (Français)' },
      recipient: { role: 'parents', name: 'Parents 6ème A' },
      category: 'academic',
      subject: 'Résultats Contrôle Français - 6ème A',
      content: 'Bonjour, les résultats du contrôle de français du 22 janvier sont disponibles. Moyenne de la classe: 13.5/20. Félicitations aux élèves qui se sont améliorés!',
      channel: 'app',
      priority: 'normal',
      sentAt: '2025-01-24 16:15',
      isRead: true
    },
    
    // Freelancer → Students/Parents
    {
      id: 3,
      sender: { role: 'freelancer', name: 'M. Ngom (Mathématiques)' },
      recipient: { role: 'students', name: 'Élèves Cours Particuliers' },
      category: 'academic',
      subject: 'Rapport Session - Mathématiques Avancées',
      content: 'Session du 24/01: Révision équations du second degré. Progrès notable chez tous les élèves. Exercices supplémentaires recommandés pour consolider.',
      channel: 'sms',
      priority: 'normal',
      sentAt: '2025-01-24 18:00',
      isRead: false
    },
    
    // Parent → École
    {
      id: 4,
      sender: { role: 'parent', name: 'Mme Kouam (Parent)' },
      recipient: { role: 'admin', name: 'Administration' },
      category: 'administrative',
      subject: 'Demande Certificat Scolarité',
      content: 'Bonjour, je souhaiterais obtenir un certificat de scolarité pour mon fils Paul Kouam (6ème A) pour constituer un dossier administratif.',
      channel: 'email',
      priority: 'normal',
      sentAt: '2025-01-24 09:30',
      isRead: true
    },
    
    // Commercial → Prospects
    {
      id: 5,
      sender: { role: 'commercial', name: 'M. Djomo (Commercial)' },
      recipient: { role: 'directors', name: 'École Sainte-Marie' },
      category: 'general',
      subject: 'Proposition Partenariat Educafric',
      content: 'Bonjour M. le Directeur, suite à notre entretien téléphonique, voici notre proposition de partenariat pour la digitalisation de votre établissement.',
      channel: 'email',
      priority: 'high',
      sentAt: '2025-01-24 11:45',
      isRead: false
    }
  ];

  const getMessageIcon = (channel: string) => {
    switch (channel) {
      case 'sms': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'app': return <MessageSquare className="w-4 h-4" />;
      case 'sms+email': return <Bell className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const handleSendMessage = () => {
    console.log('Sending inter-profile message:', newMessage);
    
    // API call simulation
    const messageData = {
      ...newMessage,
      sender: { role: user?.role || 'user', name: user?.email || 'Utilisateur' },
      sentAt: new Date().toISOString(),
      id: Math.random()
    };
    
    setShowComposeForm(false);
    setNewMessage({
      recipientRole: 'parents',
      recipients: [],
      category: 'general',
      subject: '',
      content: '',
      channel: 'app',
      priority: 'normal'
    });
  };

  const renderInboxTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Messages Reçus</h3>
        <div className="flex gap-2">
          <Input placeholder={t?.placeholders?.search} className="w-64" />
          <Button variant="outline">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {(Array.isArray(sampleMessages) ? sampleMessages : []).map((message) => (
        <Card key={message.id} className={`cursor-pointer hover:bg-gray-50 ${!message.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={message.priority === 'urgent' ? 'destructive' : 'secondary'}>
                    {t.categories[message.category]}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getMessageIcon(message.channel)}
                    {t.channels[message.channel as keyof typeof t.channels]}
                  </Badge>
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(message.priority)}`} />
                  {!message.isRead && <Badge variant="default">Nouveau</Badge>}
                </div>
                
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{message?.sender?.name}</span>
                  <span className="text-xs text-gray-500">→ {message?.recipient?.name}</span>
                </div>
                
                <h4 className="font-medium text-gray-900 mb-1">{message.subject}</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {message.sentAt}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <Button size="sm" variant="outline" onClick={() => setSelectedMessage(message)}>
                  <Eye className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderComposeTab = () => (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Rédiger un Nouveau Message</h3>
        <p className="text-sm text-gray-600">Communication Inter-Profils Sécurisée</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Destinataires</label>
            <Select value={newMessage.recipientRole} onValueChange={(value) => setNewMessage(prev => ({ ...prev, recipientRole: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(t.roles).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Canal de Communication</label>
            <Select value={newMessage.channel} onValueChange={(value) => setNewMessage(prev => ({ ...prev, channel: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(t.channels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Catégorie</label>
            <Select value={newMessage.category} onValueChange={(value) => setNewMessage(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(t.categories).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Priorité</label>
            <Select value={newMessage.priority} onValueChange={(value) => setNewMessage(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(t.priorities).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sujet</label>
          <Input 
            value={newMessage.subject} 
            onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e?.target?.value }))}
            placeholder={t?.placeholders?.subject}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <Textarea 
            value={newMessage.content} 
            onChange={(e) => setNewMessage(prev => ({ ...prev, content: e?.target?.value }))}
            placeholder={t?.placeholders?.content}
            rows={6}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSendMessage} className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            {t?.actions?.send}
          </Button>
          <Button variant="outline">Enregistrer comme Modèle</Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCommunicationTypesOverview = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Types de Communications Disponibles</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(t.communicationTypes).map(([key, label]) => (
          <Card key={key} className="p-4 hover:bg-gray-50 cursor-pointer">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                {key === 'institutional' && <School className="w-6 h-6 text-blue-500" />}
                {key === 'individual' && <User className="w-6 h-6 text-green-500" />}
                {key === 'urgent' && <AlertTriangle className="w-6 h-6 text-red-500" />}
                {key === 'reports' && <BookOpen className="w-6 h-6 text-purple-500" />}
                {key === 'freelancer' && <Users className="w-6 h-6 text-orange-500" />}
                {key === 'commercial' && <Target className="w-6 h-6 text-indigo-500" />}
              </div>
              <h4 className="font-medium mb-2">{label}</h4>
              <p className="text-xs text-gray-600">
                {key === 'institutional' && 'Annonces générales, messages par classe, notifications urgentes'}
                {key === 'individual' && 'Communication personnalisée un-à-un entre profils'}
                {key === 'urgent' && 'Alertes prioritaires avec accusé de réception'}
                {key === 'reports' && 'Rapports académiques et suivis pédagogiques'}
                {key === 'freelancer' && 'Messages tuteurs-étudiants et rapports de session'}
                {key === 'commercial' && 'CRM prospects, suivi équipe commerciale'}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{t.title || ''}</h2>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            {t?.tabs?.inbox}
          </TabsTrigger>
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            {t?.tabs?.compose}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {t?.tabs?.sent}
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            {t?.tabs?.templates}
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Types
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          {renderInboxTab()}
        </TabsContent>

        <TabsContent value="compose">
          {renderComposeTab()}
        </TabsContent>

        <TabsContent value="sent">
          <div className="text-center py-12">
            <p className="text-gray-600">Messages envoyés (fonctionnalité en cours d'implémentation)</p>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="text-center py-12">
            <p className="text-gray-600">Modèles de messages (fonctionnalité en cours d'implémentation)</p>
          </div>
        </TabsContent>

        <TabsContent value="overview">
          {renderCommunicationTypesOverview()}
        </TabsContent>
      </Tabs>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{selectedMessage.subject}</h3>
                  <p className="text-sm text-gray-600">
                    De: {selectedMessage?.sender?.name} • {selectedMessage.sentAt}
                  </p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedMessage(null)}>×</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant={selectedMessage.priority === 'urgent' ? 'destructive' : 'secondary'}>
                    {t.categories[selectedMessage.category]}
                  </Badge>
                  <Badge variant="outline">
                    {t.channels[selectedMessage.channel as keyof typeof t.channels]}
                  </Badge>
                </div>
                <p className="text-gray-900 leading-relaxed">{selectedMessage.content}</p>
                <div className="flex gap-2 pt-4">
                  <Button size="sm">Répondre</Button>
                  <Button size="sm" variant="outline">Transférer</Button>
                  <Button size="sm" variant="outline">Archiver</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InterProfileCommunications;
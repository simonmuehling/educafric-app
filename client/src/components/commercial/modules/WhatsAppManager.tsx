import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ModernCard } from '@/components/ui/ModernCard';
import { 
  MessageSquare, Send, Users, BarChart3, Settings, 
  Phone, Clock, CheckCircle, AlertCircle, RefreshCw,
  Plus, Edit, Trash2, Eye
} from 'lucide-react';

interface WhatsAppTemplate {
  id: string;
  name: string;
  type: 'welcome' | 'demo' | 'pricing' | 'follow_up' | 'support';
  language: 'fr' | 'en';
  content: string;
  variables: string[];
  status: 'active' | 'pending' | 'rejected';
  createdAt: string;
}

interface WhatsAppMessage {
  id: string;
  recipient: string;
  type: string;
  content: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
}

const WhatsAppManager = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('send');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messageType, setMessageType] = useState('welcome');
  const [customMessage, setCustomMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [stats, setStats] = useState({
    totalSent: 0,
    delivered: 0,
    read: 0,
    failed: 0
  });

  const t = {
    fr: {
      title: 'Gestionnaire WhatsApp Business',
      subtitle: 'Communication client via WhatsApp',
      sendMessage: 'Envoyer Message',
      templates: 'Modèles',
      history: 'Historique',
      statistics: 'Statistiques',
      phoneNumber: 'Numéro WhatsApp',
      messageType: 'Type de Message',
      recipientName: 'Nom du Contact',
      companyName: 'Nom de l\'École',
      customMessage: 'Message Personnalisé',
      send: 'Envoyer',
      sending: 'Envoi...',
      messageTypes: {
        welcome: 'Message de Bienvenue',
        demo: 'Lien de Démo',
        pricing: 'Informations Tarifaires',
        follow_up: 'Suivi Commercial',
        support: 'Support Technique',
        custom: 'Message Personnalisé'
      },
      placeholder: {
        phone: '+237 6XX XXX XXX',
        name: 'Jean Dupont',
        company: 'École Primaire de Yaoundé',
        message: 'Tapez votre message ici...'
      },
      status: {
        sent: 'Envoyé',
        delivered: 'Livré',
        read: 'Lu',
        failed: 'Échec'
      },
      stats: {
        totalSent: 'Total Envoyés',
        delivered: 'Livrés',
        read: 'Lus',
        failed: 'Échecs'
      },
      noMessages: 'Aucun message envoyé',
      sendFirst: 'Envoyez votre premier message WhatsApp',
      success: 'Message WhatsApp envoyé avec succès!',
      error: 'Erreur lors de l\'envoi du message',
      invalidPhone: 'Numéro de téléphone invalide'
    },
    en: {
      title: 'WhatsApp Business Manager',
      subtitle: 'Client communication via WhatsApp',
      sendMessage: 'Send Message',
      templates: 'Templates',
      history: 'History',
      statistics: 'Statistics',
      phoneNumber: 'WhatsApp Number',
      messageType: 'Message Type',
      recipientName: 'Contact Name',
      companyName: 'School Name',
      customMessage: 'Custom Message',
      send: 'Send',
      sending: 'Sending...',
      messageTypes: {
        welcome: 'Welcome Message',
        demo: 'Demo Link',
        pricing: 'Pricing Information',
        follow_up: 'Sales Follow-up',
        support: 'Technical Support',
        custom: 'Custom Message'
      },
      placeholder: {
        phone: '+237 6XX XXX XXX',
        name: 'John Doe',
        company: 'Yaoundé Primary School',
        message: 'Type your message here...'
      },
      status: {
        sent: 'Sent',
        delivered: 'Delivered',
        read: 'Read',
        failed: 'Failed'
      },
      stats: {
        totalSent: 'Total Sent',
        delivered: 'Delivered',
        read: 'Read',
        failed: 'Failed'
      },
      noMessages: 'No messages sent',
      sendFirst: 'Send your first WhatsApp message',
      success: 'WhatsApp message sent successfully!',
      error: 'Error sending message',
      invalidPhone: 'Invalid phone number'
    }
  };

  const text = t[language as keyof typeof t];

  // Load message history and stats
  useEffect(() => {
    fetchMessageHistory();
    fetchStats();
  }, []);

  const fetchMessageHistory = async () => {
    // Mock data - in real implementation, fetch from API
    const mockMessages: WhatsAppMessage[] = [
      {
        id: '1',
        recipient: '+237656789012',
        type: 'welcome',
        content: 'Welcome to Educafric! Thank you for your interest...',
        status: 'read',
        timestamp: '2025-01-24T10:30:00Z'
      },
      {
        id: '2',
        recipient: '+237677654321',
        type: 'demo',
        content: 'Your Educafric demo is ready! Access your personalized demo...',
        status: 'delivered',
        timestamp: '2025-01-24T09:15:00Z'
      },
      {
        id: '3',
        recipient: '+237698765432',
        type: 'pricing',
        content: 'Educafric Pricing - Africa Special...',
        status: 'read',
        timestamp: '2025-01-23T16:45:00Z'
      }
    ];
    setMessages(mockMessages);
  };

  const fetchStats = async () => {
    // Mock stats - in real implementation, fetch from API
    setStats({
      totalSent: 47,
      delivered: 43,
      read: 31,
      failed: 4
    });
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add Cameroon country code if not present
    if ((Array.isArray(cleaned) ? cleaned.length : 0) === 9 && cleaned.startsWith('6')) {
      return `237${cleaned}`;
    } else if ((Array.isArray(cleaned) ? cleaned.length : 0) === 12 && cleaned.startsWith('237')) {
      return cleaned;
    }
    
    return cleaned;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const formatted = formatPhoneNumber(phone);
    return (Array.isArray(formatted) ? formatted.length : 0) === 12 && formatted.startsWith('237');
  };

  const sendWhatsAppMessage = async () => {
    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      alert(text.invalidPhone);
      return;
    }

    if (messageType === 'custom' && !customMessage.trim()) {
      alert(text.error);
      return;
    }

    setIsSending(true);

    try {
      const data: any = {};
      
      if (messageType === 'welcome') {
        data.companyName = companyName || 'École';
      } else if (messageType === 'demo') {
        data.contactName = recipientName || 'Client';
        data.demoLink = 'https://www?.educafric?.com/demo';
      } else if (messageType === 'pricing') {
        data.contactName = recipientName || 'Client';
      } else if (messageType === 'follow_up') {
        data.contactName = recipientName || 'Client';
        data.daysSince = 3;
      } else if (messageType === 'support') {
        data.contactName = recipientName || 'Client';
        data.issueType = 'Demande générale';
      } else if (messageType === 'custom') {
        data.message = customMessage;
      }

      const response = await fetch('/api/whatsapp/send-commercial-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formatPhoneNumber(phoneNumber),
          type: messageType === 'custom' ? 'welcome' : messageType,
          data,
          language
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(text.success);
        
        // Add to message history
        const newMessage: WhatsAppMessage = {
          id: Date.now().toString(),
          recipient: formatPhoneNumber(phoneNumber),
          type: messageType,
          content: messageType === 'custom' ? customMessage : `${text.messageTypes[messageType as keyof typeof text.messageTypes]} envoyé`,
          status: 'sent',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [newMessage, ...prev]);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalSent: prev.totalSent + 1
        }));

        // Reset form
        setPhoneNumber('');
        setRecipientName('');
        setCompanyName('');
        setCustomMessage('');
      } else {
        alert(`${text.error}: ${result.error}`);
      }
    } catch (error) {
      console.error('WhatsApp send error:', error);
      alert(text.error);
    } finally {
      setIsSending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'read': return <Eye className="w-4 h-4 text-purple-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const tabs = [
    { id: 'send', label: text.sendMessage, icon: <Send className="w-4 h-4" /> },
    { id: 'history', label: text.history, icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'stats', label: text.statistics, icon: <BarChart3 className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{text.title || ''}</h2>
          <p className="text-gray-600">{text.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <MessageSquare className="w-3 h-3 mr-1" />
            WhatsApp Business
          </Badge>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            {(Array.isArray(tabs) ? tabs : []).map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2"
              >
                {tab.icon}
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Send Message Tab */}
      {activeTab === 'send' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Send className="w-5 h-5 text-green-500" />
              {text.sendMessage}
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{text.phoneNumber}</label>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e?.target?.value)}
                  placeholder={text?.placeholder?.phone}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{text.messageType}</label>
                <select
                  value={messageType}
                  onChange={(e) => setMessageType(e?.target?.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="welcome">{text?.messageTypes?.welcome}</option>
                  <option value="demo">{text?.messageTypes?.demo}</option>
                  <option value="pricing">{text?.messageTypes?.pricing}</option>
                  <option value="follow_up">{text?.messageTypes?.follow_up}</option>
                  <option value="support">{text?.messageTypes?.support}</option>
                  <option value="custom">{text?.messageTypes?.custom}</option>
                </select>
              </div>
            </div>

            {messageType !== 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{text.recipientName}</label>
                  <Input
                    value={recipientName}
                    onChange={(e) => setRecipientName(e?.target?.value)}
                    placeholder={text?.placeholder?.name}
                  />
                </div>
                {(messageType === 'welcome' || messageType === 'demo') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">{text.companyName}</label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e?.target?.value)}
                      placeholder={text?.placeholder?.company}
                    />
                  </div>
                )}
              </div>
            )}

            {messageType === 'custom' && (
              <div>
                <label className="block text-sm font-medium mb-2">{text.customMessage}</label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e?.target?.value)}
                  placeholder={text?.placeholder?.message}
                  rows={4}
                />
              </div>
            )}

            <Button
              onClick={sendWhatsAppMessage}
              disabled={isSending}
              className="w-full md:w-auto flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {text.sending}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {text.send}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Message History Tab */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              {text.history}
            </h3>
          </CardHeader>
          <CardContent>
            {(Array.isArray(messages) ? messages.length : 0) === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-600 mb-2">
                  {text.noMessages}
                </h4>
                <p className="text-gray-500">{text.sendFirst}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(Array.isArray(messages) ? messages : []).map(message => (
                  <ModernCard key={message.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{message.recipient}</Badge>
                          <Badge variant="secondary">{text.messageTypes[message.type as keyof typeof text.messageTypes] || message.type}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(message.status)}
                          <span className="text-sm text-gray-500">
                            {text.status[message.status as keyof typeof text.status]}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{message.content}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')}
                      </p>
                    </CardContent>
                  </ModernCard>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalSent}</div>
                <div className="text-sm text-gray-600">{text?.stats?.totalSent}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
                <div className="text-sm text-gray-600">{text?.stats?.delivered}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.read}</div>
                <div className="text-sm text-gray-600">{text?.stats?.read}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-sm text-gray-600">{text?.stats?.failed}</div>
              </CardContent>
            </Card>
          </div>

          {/* Delivery Rate */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">
                {language === 'fr' ? 'Taux de Livraison' : 'Delivery Rate'}
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>{language === 'fr' ? 'Taux de livraison' : 'Delivery rate'}</span>
                  <span className="font-semibold">
                    {((stats.delivered / Math.max(stats.totalSent, 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.delivered / Math.max(stats.totalSent, 1)) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>{language === 'fr' ? 'Taux de lecture' : 'Read rate'}</span>
                  <span className="font-semibold">
                    {((stats.read / Math.max(stats.totalSent, 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.read / Math.max(stats.totalSent, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WhatsAppManager;
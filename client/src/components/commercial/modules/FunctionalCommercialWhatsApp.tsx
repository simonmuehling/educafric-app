import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, Send, FileText, History,
  Plus, Edit, Trash2, Eye, CheckCircle,
  Phone, Building2, Clock, User
} from 'lucide-react';

interface WhatsAppMessage {
  id: number;
  phoneNumber: string;
  recipientName: string;
  companyName: string;
  messageType: string;
  content?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sentAt: Date;
}

interface WhatsAppTemplate {
  id: number;
  name: string;
  type: string;
  content: string;
}

const FunctionalCommercialWhatsApp: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'send' | 'history' | 'templates'>('send');
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const [messageForm, setMessageForm] = useState({
    phoneNumber: '',
    recipientName: '',
    companyName: '',
    messageType: 'custom',
    customMessage: ''
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'custom',
    content: ''
  });

  // Fetch WhatsApp history
  const { data: history = [], isLoading: historyLoading } = useQuery<WhatsAppMessage[]>({
    queryKey: ['/api/commercial/whatsapp/history'],
    enabled: !!user
  });

  // Fetch WhatsApp templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery<WhatsAppTemplate[]>({
    queryKey: ['/api/commercial/whatsapp/templates'],
    enabled: !!user
  });

  // Send WhatsApp message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await fetch('/api/commercial/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to send WhatsApp message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/whatsapp/history'] });
      resetMessageForm();
      toast({
        title: 'Message envoyé',
        description: 'Le message WhatsApp a été envoyé avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur d\'envoi',
        description: 'Impossible d\'envoyer le message WhatsApp.',
        variant: 'destructive'
      });
    }
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      const response = await fetch('/api/commercial/whatsapp/template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/whatsapp/templates'] });
      setIsTemplateModalOpen(false);
      resetTemplateForm();
      toast({
        title: 'Modèle créé',
        description: 'Le modèle de message a été créé avec succès.'
      });
    }
  });

  const resetMessageForm = () => {
    setMessageForm({
      phoneNumber: '',
      recipientName: '',
      companyName: '',
      messageType: 'custom',
      customMessage: ''
    });
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      type: 'custom',
      content: ''
    });
  };

  const handleSendMessage = () => {
    if (messageForm.phoneNumber && messageForm.recipientName && 
        (messageForm.messageType !== 'custom' || messageForm.customMessage)) {
      sendMessageMutation.mutate(messageForm);
    }
  };

  const handleCreateTemplate = () => {
    if (templateForm.name && templateForm.content) {
      createTemplateMutation.mutate(templateForm);
    }
  };

  const useTemplate = (template: WhatsAppTemplate) => {
    setMessageForm({
      ...messageForm,
      messageType: template.type,
      customMessage: template.content
    });
    setActiveTab('send');
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      read: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || variants.sent;
  };

  const predefinedTemplates = [
    {
      type: 'welcome',
      name: 'Message de Bienvenue',
      content: 'Bonjour {name}, bienvenue dans EDUCAFRIC! Nous sommes ravis de vous accompagner dans votre transformation numérique éducative.'
    },
    {
      type: 'demo',
      name: 'Lien de Démo',
      content: 'Bonjour {name}, découvrez EDUCAFRIC en action avec notre démo personnalisée: https://educafric.com/demo - Code d\'accès: DEMO2024'
    },
    {
      type: 'pricing',
      name: 'Informations Tarifaires',
      content: 'Bonjour {name}, voici nos tarifs préférentiels pour {company}: École Basic 50.000 CFA/an, Premium 75.000 CFA/an. Contactez-nous pour plus d\'informations.'
    },
    {
      type: 'follow_up',
      name: 'Relance Commercial',
      content: 'Bonjour {name}, j\'espère que vous allez bien. Avez-vous eu l\'occasion d\'examiner notre proposition EDUCAFRIC pour {company}? Je suis disponible pour répondre à vos questions.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manager WhatsApp</h2>
          <p className="text-gray-600">Gérez vos communications WhatsApp commerciales</p>
        </div>
        <Button 
          onClick={() => setIsTemplateModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
          data-testid="button-create-template"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Modèle
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Messages Envoyés</p>
                <p className="text-2xl font-bold text-gray-900">{history.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Livrés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {history.filter(m => m.status === 'delivered' || m.status === 'read').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Modèles</p>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taux de Lecture</p>
                <p className="text-2xl font-bold text-gray-900">
                  {history.length > 0 ? Math.round((history.filter(m => m.status === 'read').length / history.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'send', label: 'Envoyer Message', icon: Send },
            { id: 'history', label: 'Historique', icon: History },
            { id: 'templates', label: 'Modèles', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Send Message Tab */}
      {activeTab === 'send' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Envoyer un Message WhatsApp</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone *</label>
                <input
                  type="tel"
                  value={messageForm.phoneNumber}
                  onChange={(e) => setMessageForm({...messageForm, phoneNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+237 6XX XXX XXX"
                  data-testid="input-phone-number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du contact *</label>
                <input
                  type="text"
                  value={messageForm.recipientName}
                  onChange={(e) => setMessageForm({...messageForm, recipientName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom du destinataire"
                  data-testid="input-recipient-name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise/École</label>
                <input
                  type="text"
                  value={messageForm.companyName}
                  onChange={(e) => setMessageForm({...messageForm, companyName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom de l'établissement"
                  data-testid="input-company-name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de message</label>
                <select
                  value={messageForm.messageType}
                  onChange={(e) => setMessageForm({...messageForm, messageType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="select-message-type"
                >
                  <option value="custom">Message personnalisé</option>
                  <option value="welcome">Bienvenue</option>
                  <option value="demo">Lien de démo</option>
                  <option value="pricing">Informations tarifaires</option>
                  <option value="follow_up">Relance commerciale</option>
                </select>
              </div>
            </div>

            {/* Quick Templates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Modèles rapides</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {predefinedTemplates.map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setMessageForm({
                      ...messageForm,
                      messageType: template.type,
                      customMessage: template.content
                    })}
                    className="justify-start"
                    data-testid={`button-template-${template.type}`}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea
                value={messageForm.customMessage}
                onChange={(e) => setMessageForm({...messageForm, customMessage: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="Tapez votre message ici... Utilisez {name} et {company} comme variables."
                data-testid="textarea-message-content"
              />
              <p className="text-xs text-gray-500 mt-1">
                Variables disponibles: {'{name}'} pour le nom, {'{company}'} pour l'entreprise
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4 mr-2" />
                {sendMessageMutation.isPending ? 'Envoi...' : 'Envoyer'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Historique des Messages</h3>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun message envoyé</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((message) => (
                  <div key={message.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold text-gray-900">{message.recipientName}</h4>
                        <Badge className={getStatusBadge(message.status)}>
                          {message.status}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(message.sentAt).toLocaleString('fr-FR')}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{message.phoneNumber}</span>
                      </div>
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-2" />
                        <span>{message.companyName}</span>
                      </div>
                    </div>
                    
                    {message.content && (
                      <div className="bg-gray-50 rounded-md p-3 text-sm">
                        <p className="text-gray-700">{message.content}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Modèles de Messages</h3>
          </CardHeader>
          <CardContent>
            {templatesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Predefined Templates */}
                {predefinedTemplates.map((template, index) => (
                  <div key={`predefined-${index}`} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{template.name}</h4>
                      <Badge className="bg-blue-100 text-blue-800">Prédéfini</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">{template.content}</p>
                    <Button
                      size="sm"
                      onClick={() => useTemplate(template as WhatsAppTemplate)}
                      className="w-full"
                      data-testid={`button-use-template-${template.type}`}
                    >
                      Utiliser ce modèle
                    </Button>
                  </div>
                ))}
                
                {/* Custom Templates */}
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{template.name}</h4>
                      <Badge className="bg-green-100 text-green-800">Personnalisé</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">{template.content}</p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => useTemplate(template)}
                        className="flex-1"
                        data-testid={`button-use-custom-template-${template.id}`}
                      >
                        Utiliser
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        data-testid={`button-delete-template-${template.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {templates.length === 0 && (
                  <div className="col-span-2 text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun modèle personnalisé créé</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Template Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Créer un Modèle</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du modèle *</label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Suivi commercial mensuel"
                  data-testid="input-template-name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={templateForm.type}
                  onChange={(e) => setTemplateForm({...templateForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="select-template-type"
                >
                  <option value="custom">Personnalisé</option>
                  <option value="welcome">Bienvenue</option>
                  <option value="demo">Démo</option>
                  <option value="pricing">Tarification</option>
                  <option value="follow_up">Suivi</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenu du message *</label>
                <textarea
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="Contenu du modèle... Utilisez {name} et {company} comme variables."
                  data-testid="textarea-template-content"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Variables disponibles: {'{name}'} pour le nom, {'{company}'} pour l'entreprise
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsTemplateModalOpen(false);
                  resetTemplateForm();
                }}
                data-testid="button-cancel-template"
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateTemplate}
                disabled={createTemplateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-save-template"
              >
                {createTemplateMutation.isPending ? 'Création...' : 'Créer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FunctionalCommercialWhatsApp;
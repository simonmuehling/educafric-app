import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Bell, Mail, MessageSquare, Smartphone, 
  AlertTriangle, CheckCircle, Info, Clock,
  Send, Settings, Eye, RefreshCw, Download
} from 'lucide-react';

interface NotificationPreview {
  id: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  recipient: string;
  timestamp: Date;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
}

const NotificationTestInterface = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedType, setSelectedType] = useState<'email' | 'sms' | 'whatsapp' | 'push' | 'system'>('email');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [selectedRole, setSelectedRole] = useState('parent');
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [testRecipient, setTestRecipient] = useState('demo@educafric.com');
  
  const [previews, setPreviews] = useState<NotificationPreview[]>([]);

  // Mutation pour envoyer une notification test
  const sendTestNotificationMutation = useMutation({
    mutationFn: async (notificationData: any) => {
      return await apiRequest('/api/sandbox/test-notification', 'POST', notificationData);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      toast({
        title: language === 'fr' ? 'Notification envoyée' : 'Notification sent',
        description: language === 'fr' 
          ? `Test ${selectedType} envoyé avec succès` 
          : `${selectedType} test sent successfully`,
        duration: 3000,
      });
      
      // Ajouter à l'aperçu
      const newPreview: NotificationPreview = {
        id: data.notificationId || Date.now().toString(),
        type: selectedType,
        priority: selectedPriority,
        title: customTitle || data.title,
        message: customMessage || data.message,
        recipient: testRecipient,
        timestamp: new Date(),
        status: 'sent'
      };
      setPreviews(prev => [newPreview, ...prev.slice(0, 9)]);
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'envoyer la notification' : 'Failed to send notification',
        variant: 'destructive'
      });
    }
  });

  // Mutation pour générer un aperçu de notification
  const generatePreviewMutation = useMutation({
    mutationFn: async (previewData: any) => {
      return await apiRequest('/api/sandbox/notification-preview', 'POST', previewData);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      const newPreview: NotificationPreview = {
        id: Date.now().toString(),
        type: selectedType,
        priority: selectedPriority,
        title: data.title,
        message: data.message,
        recipient: testRecipient,
        timestamp: new Date(),
        status: 'pending'
      };
      setPreviews(prev => [newPreview, ...prev.slice(0, 9)]);
    }
  });

  // Templates de notifications par rôle et type
  const notificationTemplates = {
    parent: {
      email: {
        attendance: {
          title: language === 'fr' ? 'Absence de votre enfant' : 'Your child\'s absence',
          message: language === 'fr' 
            ? 'Votre enfant Jean Dupont a été marqué absent aujourd\'hui à 08:00. Veuillez contacter l\'école si nécessaire.'
            : 'Your child Jean Dupont was marked absent today at 08:00. Please contact the school if necessary.'
        },
        grades: {
          title: language === 'fr' ? 'Nouvelle note disponible' : 'New grade available',
          message: language === 'fr' 
            ? 'Une nouvelle note de 16/20 en Mathématiques a été ajoutée pour Jean Dupont.'
            : 'A new grade of 16/20 in Mathematics has been added for Jean Dupont.'
        },
        payment: {
          title: language === 'fr' ? 'Rappel de paiement' : 'Payment reminder',
          message: language === 'fr' 
            ? 'La scolarité du mois de janvier (50,000 CFA) arrive à échéance dans 3 jours.'
            : 'January tuition (50,000 CFA) is due in 3 days.'
        }
      },
      sms: {
        urgent: {
          title: language === 'fr' ? 'URGENT - École' : 'URGENT - School',
          message: language === 'fr' 
            ? 'URGENT: Votre enfant Jean a eu un petit accident. Veuillez venir le récupérer. École Sainte-Marie.'
            : 'URGENT: Your child Jean had a minor accident. Please come pick him up. Sainte-Marie School.'
        },
        location: {
          title: language === 'fr' ? 'Alerte géolocalisation' : 'Location alert',
          message: language === 'fr' 
            ? 'ALERTE: Jean a quitté la zone sécurisée (École) à 15:30. Position actuelle: Marché Central.'
            : 'ALERT: Jean left the safe zone (School) at 15:30. Current position: Central Market.'
        }
      },
      whatsapp: {
        bulletin: {
          title: language === 'fr' ? '📊 Bulletin disponible' : '📊 Report card available',
          message: language === 'fr' 
            ? '📊 Le bulletin de Jean Dupont (CE2) est maintenant disponible.\n\n📈 Moyenne générale: 14,5/20\n🏆 Rang: 3ème/25\n\nConsultez l\'application pour plus de détails.'
            : '📊 Jean Dupont\'s report card (Grade 3) is now available.\n\n📈 Overall average: 14.5/20\n🏆 Rank: 3rd/25\n\nCheck the app for more details.'
        }
      }
    },
    teacher: {
      email: {
        reminder: {
          title: language === 'fr' ? 'Rappel - Notes à saisir' : 'Reminder - Grades to enter',
          message: language === 'fr' 
            ? 'Vous avez 15 notes en attente de saisie pour la classe de CE2A. Date limite: 25 janvier.'
            : 'You have 15 grades pending entry for CE2A class. Deadline: January 25th.'
        }
      },
      system: {
        backup: {
          title: language === 'fr' ? 'Sauvegarde automatique' : 'Automatic backup',
          message: language === 'fr' 
            ? 'Sauvegarde automatique de vos données effectuée avec succès à 03:00.'
            : 'Automatic backup of your data completed successfully at 03:00.'
        }
      }
    },
    student: {
      push: {
        homework: {
          title: language === 'fr' ? 'Nouveau devoir' : 'New homework',
          message: language === 'fr' 
            ? 'Mathématiques: Exercices page 45-47 pour demain. N\'oubliez pas votre calculatrice!'
            : 'Mathematics: Exercises pages 45-47 for tomorrow. Don\'t forget your calculator!'
        }
      }
    }
  };

  const handleSendTest = () => {
    const title = customTitle || getTemplateData().title;
    const message = customMessage || getTemplateData().message;
    
    sendTestNotificationMutation.mutate({
      type: selectedType,
      priority: selectedPriority,
      role: selectedRole,
      title,
      message,
      recipient: testRecipient,
      isTest: true
    });
  };

  const handleGeneratePreview = () => {
    generatePreviewMutation.mutate({
      type: selectedType,
      priority: selectedPriority,
      role: selectedRole,
      template: 'auto'
    });
  };

  const getTemplateData = () => {
    const roleTemplates = notificationTemplates[selectedRole as keyof typeof notificationTemplates];
    if (!roleTemplates) return { title: '', message: '' };
    
    const typeTemplates = roleTemplates[selectedType as keyof typeof roleTemplates];
    if (!typeTemplates) return { title: '', message: '' };
    
    const firstTemplate = Object.values(typeTemplates)[0] as any;
    return firstTemplate || { title: '', message: '' };
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <Smartphone className="w-4 h-4" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />;
      case 'push': return <Bell className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <CardTitle>
              {language === 'fr' ? 'Interface de Test des Notifications' : 'Notification Test Interface'}
            </CardTitle>
          </div>
          <CardDescription>
            {language === 'fr' 
              ? 'Testez et prévisualisez tous les types de notifications Educafric' 
              : 'Test and preview all types of Educafric notifications'}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration des notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {language === 'fr' ? 'Configuration' : 'Configuration'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'fr' ? 'Type de notification' : 'Notification type'}
                </label>
                <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                  <SelectTrigger data-testid="select-notification-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">📧 Email</SelectItem>
                    <SelectItem value="sms">📱 SMS</SelectItem>
                    <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                    <SelectItem value="push">🔔 Push</SelectItem>
                    <SelectItem value="system">⚙️ System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'fr' ? 'Priorité' : 'Priority'}
                </label>
                <Select value={selectedPriority} onValueChange={(value: any) => setSelectedPriority(value)}>
                  <SelectTrigger data-testid="select-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 {language === 'fr' ? 'Faible' : 'Low'}</SelectItem>
                    <SelectItem value="medium">🟡 {language === 'fr' ? 'Moyenne' : 'Medium'}</SelectItem>
                    <SelectItem value="high">🟠 {language === 'fr' ? 'Haute' : 'High'}</SelectItem>
                    <SelectItem value="urgent">🔴 {language === 'fr' ? 'Urgent' : 'Urgent'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'fr' ? 'Rôle destinataire' : 'Recipient role'}
              </label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger data-testid="select-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">👨‍👩‍👧‍👦 {language === 'fr' ? 'Parent' : 'Parent'}</SelectItem>
                  <SelectItem value="teacher">👩‍🏫 {language === 'fr' ? 'Enseignant' : 'Teacher'}</SelectItem>
                  <SelectItem value="student">🎓 {language === 'fr' ? 'Élève' : 'Student'}</SelectItem>
                  <SelectItem value="director">👔 {language === 'fr' ? 'Directeur' : 'Director'}</SelectItem>
                  <SelectItem value="admin">⚙️ {language === 'fr' ? 'Administrateur' : 'Admin'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'fr' ? 'Destinataire test' : 'Test recipient'}
              </label>
              <Input 
                value={testRecipient} 
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder={selectedType === 'email' ? 'email@exemple.com' : '+237600000000'}
                data-testid="input-recipient"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'fr' ? 'Titre personnalisé' : 'Custom title'}
              </label>
              <Input 
                value={customTitle} 
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={getTemplateData().title}
                data-testid="input-title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'fr' ? 'Message personnalisé' : 'Custom message'}
              </label>
              <Textarea 
                value={customMessage} 
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder={getTemplateData().message}
                rows={4}
                data-testid="textarea-message"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleGeneratePreview} 
                variant="outline"
                className="flex-1"
                disabled={generatePreviewMutation.isPending}
                data-testid="button-preview"
              >
                <Eye className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Aperçu' : 'Preview'}
              </Button>
              
              <Button 
                onClick={handleSendTest}
                disabled={sendTestNotificationMutation.isPending}
                className="flex-1"
                data-testid="button-send-test"
              >
                <Send className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Envoyer test' : 'Send test'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Aperçu en temps réel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {language === 'fr' ? 'Aperçu des notifications' : 'Notification preview'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {previews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>{language === 'fr' ? 'Aucun aperçu pour le moment' : 'No previews yet'}</p>
                  <p className="text-xs mt-1">
                    {language === 'fr' ? 'Cliquez sur "Aperçu" pour générer' : 'Click "Preview" to generate'}
                  </p>
                </div>
              ) : (
                previews.map((preview) => (
                  <div 
                    key={preview.id} 
                    className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    data-testid={`preview-${preview.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(preview.type)}
                        <span className="font-medium text-sm">{preview.title}</span>
                        {getStatusIcon(preview.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getPriorityColor(preview.priority)}`}>
                          {preview.priority}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {preview.message}
                    </p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{preview.recipient}</span>
                      <span>{preview.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {previews.length > 0 && (
              <div className="mt-4 pt-3 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPreviews([])}
                  className="w-full"
                  data-testid="button-clear-previews"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Effacer les aperçus' : 'Clear previews'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Exemples de templates par type */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'fr' ? 'Templates par type de notification' : 'Templates by notification type'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="email">📧 Email</TabsTrigger>
              <TabsTrigger value="sms">📱 SMS</TabsTrigger>
              <TabsTrigger value="whatsapp">💬 WhatsApp</TabsTrigger>
              <TabsTrigger value="push">🔔 Push</TabsTrigger>
              <TabsTrigger value="system">⚙️ System</TabsTrigger>
            </TabsList>
            
            {Object.entries(notificationTemplates).map(([role, templates]) => (
              Object.entries(templates).map(([type, typeTemplates]) => (
                <TabsContent key={`${role}-${type}`} value={type} className="mt-4">
                  <div className="space-y-4">
                    <h4 className="font-semibold capitalize">{role} - {type}</h4>
                    {Object.entries(typeTemplates).map(([templateName, template]: [string, any]) => (
                      <div key={templateName} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm capitalize">{templateName}</span>
                          <Badge variant="outline">{role}</Badge>
                        </div>
                        <p className="font-medium text-sm mb-1">{template.title}</p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{template.message}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationTestInterface;
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Mail, MessageSquare, Phone, Send, CheckCircle, AlertCircle, 
  Clock, Users, Bell, Smartphone, Globe, Zap, Settings, 
  TestTube, FileText, Eye, RefreshCw, Download, Activity
} from 'lucide-react';

interface NotificationTest {
  id: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  recipient: string;
  subject?: string;
  message: string;
  timestamp: string;
  deliveryTime?: string;
}

const NotificationTester = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTestType, setActiveTestType] = useState('email');
  const [testHistory, setTestHistory] = useState<NotificationTest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form states for different notification types
  const [emailForm, setEmailForm] = useState({
    recipient: 'test@educafric.demo',
    subject: '',
    message: '',
    template: 'custom'
  });

  const [smsForm, setSmsForm] = useState({
    recipient: '+237600000000',
    message: '',
    template: 'custom'
  });

  const [whatsappForm, setWhatsappForm] = useState({
    recipient: '+237600000000',
    message: '',
    template: 'custom'
  });

  const [pushForm, setPushForm] = useState({
    title: '',
    message: '',
    targetRole: 'all',
    priority: 'normal'
  });

  // Predefined templates
  const emailTemplates = {
    welcome: {
      subject: language === 'fr' ? 'Bienvenue sur Educafric' : 'Welcome to Educafric',
      message: language === 'fr' 
        ? 'Bienvenue sur la plateforme Educafric. Votre compte a été créé avec succès.' 
        : 'Welcome to Educafric platform. Your account has been created successfully.'
    },
    reminder: {
      subject: language === 'fr' ? 'Rappel Important' : 'Important Reminder',
      message: language === 'fr' 
        ? 'Ceci est un rappel concernant votre dernière activité sur Educafric.' 
        : 'This is a reminder about your recent activity on Educafric.'
    },
    alert: {
      subject: language === 'fr' ? 'Alerte Système' : 'System Alert',
      message: language === 'fr' 
        ? 'Une activité importante nécessite votre attention.' 
        : 'An important activity requires your attention.'
    }
  };

  const smsTemplates = {
    welcome: language === 'fr' 
      ? 'Bienvenue sur Educafric! Votre compte est activé.' 
      : 'Welcome to Educafric! Your account is activated.',
    reminder: language === 'fr' 
      ? 'Rappel: Vous avez des notifications en attente sur Educafric.' 
      : 'Reminder: You have pending notifications on Educafric.',
    alert: language === 'fr' 
      ? 'Alerte Educafric: Action requise sur votre compte.' 
      : 'Educafric Alert: Action required on your account.'
  };

  // Mutation for sending test notifications
  const testNotificationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/sandbox/test-notification', 'POST', data);
      return await response.json();
    },
    onSuccess: (result, variables) => {
      const newTest: NotificationTest = {
        id: Date.now().toString(),
        type: variables.type,
        status: result.success ? 'sent' : 'failed',
        recipient: variables.recipient || variables.targetRole,
        subject: variables.subject || variables.title,
        message: variables.message,
        timestamp: new Date().toLocaleTimeString(),
        deliveryTime: result.deliveryTime
      };
      
      setTestHistory(prev => [newTest, ...prev.slice(0, 19)]); // Keep last 20 tests
      
      toast({
        title: language === 'fr' ? 'Test envoyé' : 'Test sent',
        description: result.success 
          ? (language === 'fr' ? 'Notification envoyée avec succès' : 'Notification sent successfully')
          : (language === 'fr' ? 'Échec de l\'envoi' : 'Failed to send'),
        variant: result.success ? 'default' : 'destructive'
      });
    },
    onError: (error) => {
      console.error('Notification test error:', error);
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'envoyer le test' : 'Failed to send test',
        variant: 'destructive'
      });
    }
  });

  const handleEmailTest = () => {
    testNotificationMutation.mutate({
      type: 'email',
      recipient: emailForm.recipient,
      subject: emailForm.subject,
      message: emailForm.message,
      template: emailForm.template
    });
  };

  const handleSmsTest = () => {
    testNotificationMutation.mutate({
      type: 'sms',
      recipient: smsForm.recipient,
      message: smsForm.message,
      template: smsForm.template
    });
  };

  const handleWhatsAppTest = () => {
    testNotificationMutation.mutate({
      type: 'whatsapp',
      recipient: whatsappForm.recipient,
      message: whatsappForm.message,
      template: whatsappForm.template
    });
  };

  const handlePushTest = () => {
    testNotificationMutation.mutate({
      type: 'push',
      title: pushForm.title,
      message: pushForm.message,
      targetRole: pushForm.targetRole,
      priority: pushForm.priority
    });
  };

  const applyTemplate = (type: string, templateKey: string) => {
    if (type === 'email' && emailTemplates[templateKey as keyof typeof emailTemplates]) {
      const template = emailTemplates[templateKey as keyof typeof emailTemplates];
      setEmailForm(prev => ({ ...prev, subject: template.subject, message: template.message }));
    } else if (type === 'sms' && smsTemplates[templateKey as keyof typeof smsTemplates]) {
      const template = smsTemplates[templateKey as keyof typeof smsTemplates];
      setSmsForm(prev => ({ ...prev, message: template }));
    } else if (type === 'whatsapp' && smsTemplates[templateKey as keyof typeof smsTemplates]) {
      const template = smsTemplates[templateKey as keyof typeof smsTemplates];
      setWhatsappForm(prev => ({ ...prev, message: template }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const t = {
    title: language === 'fr' ? 'Testeur de Notifications' : 'Notification Tester',
    subtitle: language === 'fr' ? 'Testez tous les types de notifications en temps réel' : 'Test all notification types in real-time',
    email: language === 'fr' ? 'Email' : 'Email',
    sms: language === 'fr' ? 'SMS' : 'SMS',
    whatsapp: language === 'fr' ? 'WhatsApp' : 'WhatsApp',
    push: language === 'fr' ? 'Push' : 'Push',
    recipient: language === 'fr' ? 'Destinataire' : 'Recipient',
    subject: language === 'fr' ? 'Sujet' : 'Subject',
    message: language === 'fr' ? 'Message' : 'Message',
    template: language === 'fr' ? 'Modèle' : 'Template',
    custom: language === 'fr' ? 'Personnalisé' : 'Custom',
    welcome: language === 'fr' ? 'Bienvenue' : 'Welcome',
    reminder: language === 'fr' ? 'Rappel' : 'Reminder',
    alert: language === 'fr' ? 'Alerte' : 'Alert',
    sendTest: language === 'fr' ? 'Envoyer Test' : 'Send Test',
    testHistory: language === 'fr' ? 'Historique des Tests' : 'Test History',
    status: language === 'fr' ? 'Statut' : 'Status',
    time: language === 'fr' ? 'Heure' : 'Time',
    clearHistory: language === 'fr' ? 'Effacer' : 'Clear',
    title_field: language === 'fr' ? 'Titre' : 'Title',
    targetRole: language === 'fr' ? 'Rôle Cible' : 'Target Role',
    priority: language === 'fr' ? 'Priorité' : 'Priority',
    all: language === 'fr' ? 'Tous' : 'All',
    normal: language === 'fr' ? 'Normal' : 'Normal',
    high: language === 'fr' ? 'Élevé' : 'High',
    urgent: language === 'fr' ? 'Urgent' : 'Urgent'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Bell className="w-6 h-6" />
            </div>
            {t.title}
          </CardTitle>
          <CardDescription className="text-lg">
            {t.subtitle}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Notification Type Tabs */}
      <Tabs value={activeTestType} onValueChange={setActiveTestType} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-100 border shadow-sm">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {t.email}
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            {t.sms}
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            {t.whatsapp}
          </TabsTrigger>
          <TabsTrigger value="push" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            {t.push}
          </TabsTrigger>
        </TabsList>

        {/* Email Testing */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                {t.email} Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email-recipient">{t.recipient}</Label>
                  <Input
                    id="email-recipient"
                    type="email"
                    value={emailForm.recipient}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, recipient: e.target.value }))}
                    placeholder="test@educafric.demo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-template">{t.template}</Label>
                  <Select
                    value={emailForm.template}
                    onValueChange={(value) => {
                      setEmailForm(prev => ({ ...prev, template: value }));
                      if (value !== 'custom') applyTemplate('email', value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">{t.custom}</SelectItem>
                      <SelectItem value="welcome">{t.welcome}</SelectItem>
                      <SelectItem value="reminder">{t.reminder}</SelectItem>
                      <SelectItem value="alert">{t.alert}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email-subject">{t.subject}</Label>
                <Input
                  id="email-subject"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder={language === 'fr' ? 'Sujet du test' : 'Test subject'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email-message">{t.message}</Label>
                <Textarea
                  id="email-message"
                  value={emailForm.message}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder={language === 'fr' ? 'Contenu du message de test...' : 'Test message content...'}
                  rows={4}
                />
              </div>
              
              <Button 
                onClick={handleEmailTest}
                disabled={testNotificationMutation.isPending || !emailForm.recipient || !emailForm.subject || !emailForm.message}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Send className="w-4 h-4 mr-2" />
                {testNotificationMutation.isPending ? (language === 'fr' ? 'Envoi...' : 'Sending...') : t.sendTest}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS Testing */}
        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-600" />
                {t.sms} Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sms-recipient">{t.recipient}</Label>
                  <Input
                    id="sms-recipient"
                    type="tel"
                    value={smsForm.recipient}
                    onChange={(e) => setSmsForm(prev => ({ ...prev, recipient: e.target.value }))}
                    placeholder="+237600000000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sms-template">{t.template}</Label>
                  <Select
                    value={smsForm.template}
                    onValueChange={(value) => {
                      setSmsForm(prev => ({ ...prev, template: value }));
                      if (value !== 'custom') applyTemplate('sms', value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">{t.custom}</SelectItem>
                      <SelectItem value="welcome">{t.welcome}</SelectItem>
                      <SelectItem value="reminder">{t.reminder}</SelectItem>
                      <SelectItem value="alert">{t.alert}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sms-message">{t.message}</Label>
                <Textarea
                  id="sms-message"
                  value={smsForm.message}
                  onChange={(e) => setSmsForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder={language === 'fr' ? 'Message SMS de test...' : 'Test SMS message...'}
                  rows={3}
                  maxLength={160}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {smsForm.message.length}/160
                </div>
              </div>
              
              <Button 
                onClick={handleSmsTest}
                disabled={testNotificationMutation.isPending || !smsForm.recipient || !smsForm.message}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
              >
                <Send className="w-4 h-4 mr-2" />
                {testNotificationMutation.isPending ? (language === 'fr' ? 'Envoi...' : 'Sending...') : t.sendTest}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Testing */}
        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                {t.whatsapp} Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-recipient">{t.recipient}</Label>
                  <Input
                    id="whatsapp-recipient"
                    type="tel"
                    value={whatsappForm.recipient}
                    onChange={(e) => setWhatsappForm(prev => ({ ...prev, recipient: e.target.value }))}
                    placeholder="+237600000000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-template">{t.template}</Label>
                  <Select
                    value={whatsappForm.template}
                    onValueChange={(value) => {
                      setWhatsappForm(prev => ({ ...prev, template: value }));
                      if (value !== 'custom') applyTemplate('whatsapp', value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">{t.custom}</SelectItem>
                      <SelectItem value="welcome">{t.welcome}</SelectItem>
                      <SelectItem value="reminder">{t.reminder}</SelectItem>
                      <SelectItem value="alert">{t.alert}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatsapp-message">{t.message}</Label>
                <Textarea
                  id="whatsapp-message"
                  value={whatsappForm.message}
                  onChange={(e) => setWhatsappForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder={language === 'fr' ? 'Message WhatsApp de test...' : 'Test WhatsApp message...'}
                  rows={4}
                />
              </div>
              
              <Button 
                onClick={handleWhatsAppTest}
                disabled={testNotificationMutation.isPending || !whatsappForm.recipient || !whatsappForm.message}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
              >
                <Send className="w-4 h-4 mr-2" />
                {testNotificationMutation.isPending ? (language === 'fr' ? 'Envoi...' : 'Sending...') : t.sendTest}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Push Notification Testing */}
        <TabsContent value="push">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-orange-600" />
                {t.push} Notification Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="push-target">{t.targetRole}</Label>
                  <Select
                    value={pushForm.targetRole}
                    onValueChange={(value) => setPushForm(prev => ({ ...prev, targetRole: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.all}</SelectItem>
                      <SelectItem value="Parent">Parent</SelectItem>
                      <SelectItem value="Teacher">Teacher</SelectItem>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Director">Director</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="push-priority">{t.priority}</Label>
                  <Select
                    value={pushForm.priority}
                    onValueChange={(value) => setPushForm(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">{t.normal}</SelectItem>
                      <SelectItem value="high">{t.high}</SelectItem>
                      <SelectItem value="urgent">{t.urgent}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="push-title">{t.title_field}</Label>
                <Input
                  id="push-title"
                  value={pushForm.title}
                  onChange={(e) => setPushForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={language === 'fr' ? 'Titre de la notification' : 'Notification title'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="push-message">{t.message}</Label>
                <Textarea
                  id="push-message"
                  value={pushForm.message}
                  onChange={(e) => setPushForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder={language === 'fr' ? 'Contenu de la notification...' : 'Notification content...'}
                  rows={3}
                />
              </div>
              
              <Button 
                onClick={handlePushTest}
                disabled={testNotificationMutation.isPending || !pushForm.title || !pushForm.message}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Send className="w-4 h-4 mr-2" />
                {testNotificationMutation.isPending ? (language === 'fr' ? 'Envoi...' : 'Sending...') : t.sendTest}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {t.testHistory}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTestHistory([])}
              disabled={testHistory.length === 0}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t.clearHistory}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {testHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TestTube className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{language === 'fr' ? 'Aucun test effectué' : 'No tests performed yet'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {testHistory.map((test) => (
                <div key={test.id} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {test.type.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{test.recipient}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        {test.subject ? `${test.subject}: ` : ''}{test.message}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`text-xs ${getStatusColor(test.status)}`}>
                      {test.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{test.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationTester;
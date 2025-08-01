import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Bell, 
  Send, 
  TestTube, 
  Check, 
  X, 
  Mail, 
  MessageSquare, 
  Smartphone,
  AlertTriangle,
  Info,
  CheckCircle,
  GraduationCap,
  Calendar,
  DollarSign,
  MapPin
} from 'lucide-react';

interface NotificationTest {
  id: string;
  type: string;
  title: string;
  message: string;
  channels: string[];
  priority: string;
  result?: {
    success: boolean;
    details: any;
  };
}

const ParentNotificationTester: React.FC = () => {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [testForm, setTestForm] = useState({
    type: 'info',
    title: 'Test de Notification Parent',
    message: 'Ceci est un test de notification pour les parents.',
    channels: ['app'],
    priority: 'medium'
  });
  const [testResults, setTestResults] = useState<NotificationTest[]>([]);

  const text = {
    fr: {
      title: 'Testeur de Notifications Parent',
      subtitle: 'Testez tous les types de notifications pour les parents',
      notificationType: 'Type de Notification',
      channels: 'Canaux de Diffusion',
      priority: 'Priorité',
      title_field: 'Titre',
      message_field: 'Message',
      send: 'Envoyer Test',
      sequence: 'Test Séquence',
      clear: 'Effacer Résultats',
      results: 'Résultats des Tests',
      success: 'Succès',
      failed: 'Échec',
      sending: 'Envoi en cours...',
      running: 'Exécution...',
      educational: 'Scénarios Éducatifs',
      custom: 'Test Personnalisé'
    },
    en: {
      title: 'Parent Notification Tester',
      subtitle: 'Test all types of notifications for parents',
      notificationType: 'Notification Type',
      channels: 'Delivery Channels',
      priority: 'Priority',
      title_field: 'Title',
      message_field: 'Message',
      send: 'Send Test',
      sequence: 'Sequence Test',
      clear: 'Clear Results',
      results: 'Test Results',
      success: 'Success',
      failed: 'Failed',
      sending: 'Sending...',
      running: 'Running...',
      educational: 'Educational Scenarios',
      custom: 'Custom Test'
    }
  };

  const t = text[language as keyof typeof text];

  const notificationTypes = [
    { value: 'info', label: 'Information', icon: <Info className="w-4 h-4" /> },
    { value: 'success', label: language === 'fr' ? 'Succès' : 'Success', icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'warning', label: language === 'fr' ? 'Attention' : 'Warning', icon: <AlertTriangle className="w-4 h-4" /> },
    { value: 'error', label: language === 'fr' ? 'Erreur' : 'Error', icon: <X className="w-4 h-4" /> },
    { value: 'grade', label: language === 'fr' ? 'Note' : 'Grade', icon: <GraduationCap className="w-4 h-4" /> },
    { value: 'attendance', label: language === 'fr' ? 'Présence' : 'Attendance', icon: <Calendar className="w-4 h-4" /> },
    { value: 'payment', label: language === 'fr' ? 'Paiement' : 'Payment', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'location', label: language === 'fr' ? 'Localisation' : 'Location', icon: <MapPin className="w-4 h-4" /> }
  ];

  const channels = [
    { id: 'app', label: 'In-App', icon: <Bell className="w-4 h-4" /> },
    { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
    { id: 'sms', label: 'SMS', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  const priorities = [
    { value: 'low', label: language === 'fr' ? 'Basse' : 'Low', color: 'bg-gray-500' },
    { value: 'medium', label: language === 'fr' ? 'Moyenne' : 'Medium', color: 'bg-blue-500' },
    { value: 'high', label: language === 'fr' ? 'Haute' : 'High', color: 'bg-orange-500' },
    { value: 'urgent', label: language === 'fr' ? 'Urgente' : 'Urgent', color: 'bg-red-500' }
  ];

  const educationalScenarios = [
    {
      type: 'grade',
      title: language === 'fr' ? 'Nouvelle Note Disponible' : 'New Grade Available',
      message: language === 'fr' 
        ? 'Votre enfant Junior a reçu une note de 16/20 en Mathématiques.'
        : 'Your child Junior received a grade of 16/20 in Mathematics.',
      channels: ['app', 'email'],
      priority: 'medium'
    },
    {
      type: 'attendance',
      title: language === 'fr' ? 'Absence Signalée' : 'Absence Reported',
      message: language === 'fr' 
        ? 'Votre enfant Junior était absent aujourd\'hui. Veuillez justifier cette absence.'
        : 'Your child Junior was absent today. Please justify this absence.',
      channels: ['app', 'sms'],
      priority: 'high'
    },
    {
      type: 'payment',
      title: language === 'fr' ? 'Rappel de Paiement' : 'Payment Reminder',
      message: language === 'fr' 
        ? 'Les frais de scolarité pour le mois prochain sont dus. Montant: 75,000 CFA.'
        : 'School fees for next month are due. Amount: 75,000 CFA.',
      channels: ['app', 'email', 'sms'],
      priority: 'high'
    },
    {
      type: 'location',
      title: language === 'fr' ? 'Alerte Géolocalisation' : 'Location Alert',
      message: language === 'fr' 
        ? 'Votre enfant a quitté la zone sécurisée de l\'école à 15:30.'
        : 'Your child left the school safe zone at 15:30.',
      channels: ['app', 'sms'],
      priority: 'urgent'
    },
    {
      type: 'success',
      title: language === 'fr' ? 'Félicitations' : 'Congratulations',
      message: language === 'fr' 
        ? 'Votre enfant Junior a été sélectionné pour représenter l\'école au concours de mathématiques.'
        : 'Your child Junior has been selected to represent the school in the mathematics competition.',
      channels: ['app', 'email'],
      priority: 'medium'
    }
  ];

  const handleChannelToggle = (channelId: string) => {
    setTestForm(prev => ({
      ...prev,
      channels: prev.channels.includes(channelId)
        ? prev.channels.filter(c => c !== channelId)
        : [...prev.channels, channelId]
    }));
  };

  const handleSingleTest = async () => {
    if (!testForm.title || !testForm.message || testForm.channels.length === 0) {
      toast({
        title: language === 'fr' ? "Erreur de Test" : "Test Error",
        description: language === 'fr' 
          ? "Veuillez remplir tous les champs requis et sélectionner au moins un canal."
          : "Please fill in all required fields and select at least one channel.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(testForm)
      });

      const result = await response.json();
      
      const newTest: NotificationTest = {
        id: `test_${Date.now()}`,
        ...testForm,
        result: {
          success: result.success,
          details: result
        }
      };

      setTestResults(prev => [newTest, ...prev]);

      if (result.success) {
        toast({
          title: language === 'fr' ? "✅ Test Envoyé" : "✅ Test Sent",
          description: language === 'fr' 
            ? `Notification ${testForm.type} envoyée via ${testForm.channels.join(', ')}`
            : `${testForm.type} notification sent via ${testForm.channels.join(', ')}`
        });
      } else {
        toast({
          title: language === 'fr' ? "❌ Test Échoué" : "❌ Test Failed",
          description: result.message || (language === 'fr' ? "Échec d'envoi" : "Failed to send"),
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: language === 'fr' ? "❌ Erreur Test" : "❌ Test Error",
        description: error.message || (language === 'fr' ? "Erreur réseau" : "Network error"),
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleEducationalScenario = async (scenario: typeof educationalScenarios[0]) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(scenario)
      });

      const result = await response.json();
      
      const newTest: NotificationTest = {
        id: `scenario_${Date.now()}`,
        ...scenario,
        result: {
          success: result.success,
          details: result
        }
      };

      setTestResults(prev => [newTest, ...prev]);

      if (result.success) {
        toast({
          title: language === 'fr' ? "✅ Scénario Testé" : "✅ Scenario Tested",
          description: scenario.title
        });
      }
    } catch (error) {
      toast({
        title: language === 'fr' ? "❌ Échec Scénario" : "❌ Scenario Failed",
        description: scenario.title,
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleSequenceTest = async () => {
    setIsLoading(true);
    const results: NotificationTest[] = [];

    for (const scenario of educationalScenarios) {
      try {
        const response = await fetch('/api/notifications/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(scenario)
        });

        const result = await response.json();
        
        results.push({
          id: `sequence_${Date.now()}_${scenario.type}`,
          ...scenario,
          result: {
            success: result.success,
            details: result
          }
        });

        // Delay between tests
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        results.push({
          id: `sequence_${Date.now()}_${scenario.type}`,
          ...scenario,
          result: {
            success: false,
            details: { error: error instanceof Error ? error.message : 'Unknown error' }
          }
        });
      }
    }

    setTestResults(prev => [...results, ...prev]);
    setIsLoading(false);

    const successCount = (Array.isArray(results) ? results : []).filter(r => r.result?.success).length;
    toast({
      title: language === 'fr' ? 'Test Séquence Terminé' : 'Sequence Test Complete',
      description: `${successCount}/${results.length} ${language === 'fr' ? 'tests réussis' : 'tests passed'}`,
      variant: successCount === results.length ? "default" : "destructive"
    });
  };

  const clearResults = () => {
    setTestResults([]);
    toast({
      title: language === 'fr' ? 'Résultats Effacés' : 'Results Cleared',
      description: language === 'fr' ? 'Tous les résultats ont été supprimés' : 'All results have been cleared'
    });
  };

  return (
    <div className="space-y-6" data-testid="parent-notification-tester">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-blue-500" />
            {t.title || ''}
          </CardTitle>
          <p className="text-sm text-gray-600">{t.subtitle}</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="scenarios" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scenarios">{t.educational}</TabsTrigger>
              <TabsTrigger value="custom">{t.custom}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="scenarios" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Array.isArray(educationalScenarios) ? educationalScenarios : []).map((scenario, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {notificationTypes.find(t => t.value === scenario.type)?.icon}
                          <h4 className="font-medium">{scenario.title || ''}</h4>
                        </div>
                        <Badge variant="outline" className={priorities.find(p => p.value === scenario.priority)?.color}>
                          {priorities.find(p => p.value === scenario.priority)?.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{scenario.message}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {scenario.channels.map(channel => (
                            <Badge key={channel} variant="secondary" className="text-xs">
                              {channels.find(c => c.id === channel)?.label}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleEducationalScenario(scenario)}
                          disabled={isLoading}
                          data-testid={`scenario-${scenario.type}-test`}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Test
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-center gap-4">
                <Button
                  onClick={handleSequenceTest}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  data-testid="sequence-test-button"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {isLoading ? t.running : t.sequence}
                </Button>
                <Button
                  onClick={clearResults}
                  variant="outline"
                  data-testid="clear-results-button"
                >
                  <X className="w-4 h-4 mr-2" />
                  {t.clear}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Form */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type">{t.notificationType}</Label>
                    <Select value={testForm.type} onValueChange={(value) => setTestForm(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger data-testid="notification-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Array.isArray(notificationTypes) ? notificationTypes : []).map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {type.icon}
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="title">{t.title_field}</Label>
                    <Input
                      id="title"
                      value={testForm.title || ''}
                      onChange={(e) => setTestForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={language === 'fr' ? 'Entrez le titre' : 'Enter title'}
                      data-testid="notification-title-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">{t.message_field}</Label>
                    <Textarea
                      id="message"
                      value={testForm.message}
                      onChange={(e) => setTestForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder={language === 'fr' ? 'Entrez le message' : 'Enter message'}
                      rows={3}
                      data-testid="notification-message-input"
                    />
                  </div>

                  <div>
                    <Label>{t.priority}</Label>
                    <Select value={testForm.priority} onValueChange={(value) => setTestForm(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger data-testid="notification-priority-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Array.isArray(priorities) ? priorities : []).map(priority => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${priority.color}`}></div>
                              {priority.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Right Column - Channels */}
                <div className="space-y-4">
                  <Label>{t.channels}</Label>
                  <div className="space-y-3">
                    {(Array.isArray(channels) ? channels : []).map(channel => (
                      <div key={channel.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          {channel.icon}
                          <span>{channel.label}</span>
                        </div>
                        <Switch
                          checked={testForm.channels.includes(channel.id)}
                          onCheckedChange={() => handleChannelToggle(channel.id)}
                          data-testid={`channel-${channel.id}-toggle`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleSingleTest}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      data-testid="send-test-button"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isLoading ? t.sending : t.send}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {t.results}
              <Badge variant="outline">{testResults.length} tests</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(Array.isArray(testResults) ? testResults : []).map((test) => (
                <div
                  key={test.id}
                  className={`p-4 border rounded-lg ${
                    test.result?.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {test.result?.success ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-medium">{test.title || ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={test.result?.success ? "default" : "destructive"}>
                        {test.type}
                      </Badge>
                      <Badge variant="outline">
                        {test.channels.join(', ')}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{test.message}</p>
                  {test.result?.details && (
                    <details className="text-xs text-gray-500">
                      <summary className="cursor-pointer">
                        {language === 'fr' ? 'Voir Détails' : 'View Details'}
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                        {JSON.stringify(test.result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ParentNotificationTester;
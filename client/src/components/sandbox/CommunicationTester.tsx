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
  MessageSquare, Mail, Smartphone, 
  Send, Settings, Eye, RefreshCw, TestTube
} from 'lucide-react';

interface CommunicationTest {
  id: string;
  type: 'email' | 'sms' | 'whatsapp';
  recipient: string;
  subject: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  timestamp: Date;
}

const CommunicationTester = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedType, setSelectedType] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [testRecipient, setTestRecipient] = useState('test@example.com');
  const [testSubject, setTestSubject] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [testHistory, setTestHistory] = useState<CommunicationTest[]>([]);

  // Mutation pour tester la communication
  const testCommunicationMutation = useMutation({
    mutationFn: async (testData: any) => {
      return await apiRequest('/api/sandbox/test-communication', 'POST', testData);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      toast({
        title: language === 'fr' ? 'Test envoyé' : 'Test sent',
        description: language === 'fr' 
          ? `Test ${selectedType} envoyé avec succès` 
          : `${selectedType} test sent successfully`,
        duration: 3000,
      });
      
      // Ajouter à l'historique
      const newTest: CommunicationTest = {
        id: Date.now().toString(),
        type: selectedType,
        recipient: testRecipient,
        subject: testSubject,
        message: testMessage,
        status: 'sent',
        timestamp: new Date()
      };
      setTestHistory(prev => [newTest, ...prev.slice(0, 9)]);
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'envoyer le test' : 'Failed to send test',
        variant: 'destructive'
      });
    }
  });

  const handleSendTest = () => {
    if (!testRecipient || !testMessage) return;
    
    testCommunicationMutation.mutate({
      type: selectedType,
      recipient: testRecipient,
      subject: testSubject,
      message: testMessage,
      isTest: true
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <Smartphone className="w-4 h-4" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const templates = {
    email: {
      subject: language === 'fr' ? 'Test Email Educafric' : 'Educafric Email Test',
      message: language === 'fr' 
        ? 'Ceci est un email de test depuis l\'environnement sandbox d\'Educafric. Tous les systèmes fonctionnent correctement.'
        : 'This is a test email from Educafric sandbox environment. All systems are working correctly.'
    },
    sms: {
      subject: '',
      message: language === 'fr' 
        ? 'Test SMS Educafric: Système opérationnel ✓'
        : 'Educafric SMS Test: System operational ✓'
    },
    whatsapp: {
      subject: '',
      message: language === 'fr' 
        ? '📱 Test WhatsApp Educafric\n\nSystème de communication opérationnel ✓\nEnvironnement: Sandbox\nHeure: ' + new Date().toLocaleTimeString()
        : '📱 Educafric WhatsApp Test\n\nCommunication system operational ✓\nEnvironment: Sandbox\nTime: ' + new Date().toLocaleTimeString()
    }
  };

  const loadTemplate = () => {
    const template = templates[selectedType];
    setTestSubject(template.subject);
    setTestMessage(template.message);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-blue-600" />
            <CardTitle>
              {language === 'fr' ? 'Testeur de Communication' : 'Communication Tester'}
            </CardTitle>
          </div>
          <CardDescription>
            {language === 'fr' 
              ? 'Testez les systèmes de communication Email, SMS et WhatsApp' 
              : 'Test Email, SMS and WhatsApp communication systems'}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {language === 'fr' ? 'Configuration du Test' : 'Test Configuration'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'fr' ? 'Type de communication' : 'Communication type'}
              </label>
              <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                <SelectTrigger data-testid="select-communication-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">📧 Email</SelectItem>
                  <SelectItem value="sms">📱 SMS</SelectItem>
                  <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'fr' ? 'Destinataire' : 'Recipient'}
              </label>
              <Input 
                value={testRecipient} 
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder={selectedType === 'email' ? 'test@example.com' : '+237600000000'}
                data-testid="input-recipient"
              />
            </div>

            {selectedType === 'email' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'fr' ? 'Sujet' : 'Subject'}
                </label>
                <Input 
                  value={testSubject} 
                  onChange={(e) => setTestSubject(e.target.value)}
                  placeholder={templates.email.subject}
                  data-testid="input-subject"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                {language === 'fr' ? 'Message' : 'Message'}
              </label>
              <Textarea 
                value={testMessage} 
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder={templates[selectedType].message}
                rows={4}
                data-testid="textarea-message"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={loadTemplate} 
                variant="outline"
                className="flex-1"
                data-testid="button-load-template"
              >
                {language === 'fr' ? 'Charger template' : 'Load template'}
              </Button>
              
              <Button 
                onClick={handleSendTest}
                disabled={testCommunicationMutation.isPending || !testRecipient || !testMessage}
                className="flex-1"
                data-testid="button-send-test"
              >
                <Send className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Envoyer test' : 'Send test'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Historique des tests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {language === 'fr' ? 'Historique des tests' : 'Test history'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TestTube className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>{language === 'fr' ? 'Aucun test effectué' : 'No tests performed'}</p>
                  <p className="text-xs mt-1">
                    {language === 'fr' ? 'Envoyez un test pour commencer' : 'Send a test to get started'}
                  </p>
                </div>
              ) : (
                testHistory.map((test) => (
                  <div 
                    key={test.id} 
                    className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    data-testid={`test-history-${test.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(test.type)}
                        <span className="font-medium text-sm">{test.subject || test.type.toUpperCase()}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {test.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {test.message}
                    </p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{test.recipient}</span>
                      <span>{test.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {testHistory.length > 0 && (
              <div className="mt-4 pt-3 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setTestHistory([])}
                  className="w-full"
                  data-testid="button-clear-history"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Effacer l\'historique' : 'Clear history'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Templates disponibles */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'fr' ? 'Templates de Communication' : 'Communication Templates'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email">📧 Email</TabsTrigger>
              <TabsTrigger value="sms">📱 SMS</TabsTrigger>
              <TabsTrigger value="whatsapp">💬 WhatsApp</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="mt-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-2">{language === 'fr' ? 'Template Email' : 'Email Template'}</h4>
                <p className="text-sm font-medium mb-1">{templates.email.subject}</p>
                <p className="text-sm text-gray-600">{templates.email.message}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="sms" className="mt-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-2">{language === 'fr' ? 'Template SMS' : 'SMS Template'}</h4>
                <p className="text-sm text-gray-600">{templates.sms.message}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="whatsapp" className="mt-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-2">{language === 'fr' ? 'Template WhatsApp' : 'WhatsApp Template'}</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{templates.whatsapp.message}</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunicationTester;
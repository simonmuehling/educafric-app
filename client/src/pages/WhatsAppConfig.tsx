/**
 * WhatsApp Configuration & Test Page
 * Complete setup and testing for WhatsApp Click-to-Chat
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Info, MessageCircle, CheckCircle, XCircle } from 'lucide-react';
import WhatsAppNotify from '@/components/whatsapp/WhatsAppNotify';
import { useWhatsAppToken } from '@/hooks/useWhatsAppToken';

export default function WhatsAppConfig() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [whatsappE164, setWhatsappE164] = useState('');
  const [waOptIn, setWaOptIn] = useState(false);
  const [waLanguage, setWaLanguage] = useState<'fr' | 'en'>('fr');
  
  const [testToken, setTestToken] = useState<string | null>(null);
  const [testTemplate, setTestTemplate] = useState('payment_due');
  
  const { generateToken, loading: tokenLoading } = useWhatsAppToken();

  // Fetch current configuration
  const { data: config, isLoading: configLoading } = useQuery<any>({
    queryKey: ['/api/user/whatsapp-config'],
    enabled: !!user
  });

  // Update form when config is loaded
  useEffect(() => {
    if (config?.config) {
      setWhatsappE164(config.config.whatsappE164 || '');
      setWaOptIn(config.config.waOptIn || false);
      setWaLanguage(config.config.waLanguage || 'fr');
    }
  }, [config]);

  // Save configuration mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/user/whatsapp-config', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/whatsapp-config'] });
      toast({
        title: 'Configuration sauvegardée',
        description: 'Votre configuration WhatsApp a été mise à jour',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de sauvegarder la configuration',
        variant: 'destructive'
      });
    }
  });

  const handleSave = () => {
    if (waOptIn && !whatsappE164) {
      toast({
        title: 'Numéro requis',
        description: 'Veuillez entrer votre numéro WhatsApp',
        variant: 'destructive'
      });
      return;
    }

    saveMutation.mutate({
      whatsappE164: whatsappE164 || undefined,
      waOptIn,
      waLanguage
    });
  };

  const handleTest = async () => {
    if (!user?.id) return;
    
    const templateData = {
      parent_name: `${user.firstName} ${user.lastName}`,
      student_name: 'Élève Test',
      term: 'Trimestre 1',
      due_date: new Date().toLocaleDateString('fr-FR'),
      invoice_no: 'TEST-001',
      amount: '50000',
      subject: 'Mathématiques',
      average: '15',
      class_name: 'CM2 A',
      start_time: '10:30',
      room: 'B2'
    };

    const result = await generateToken({
      recipientId: user.id,
      templateId: testTemplate,
      templateData,
      lang: waLanguage,
      campaign: 'config-test'
    });

    if (result?.success && result.token) {
      setTestToken(result.token);
      toast({
        title: 'Lien de test généré',
        description: 'Cliquez sur le bouton WhatsApp pour tester',
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Veuillez vous connecter pour accéder à cette page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isConfigured = waOptIn && whatsappE164;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Configuration WhatsApp</h1>
        <p className="text-muted-foreground">
          Configurez vos paramètres WhatsApp pour recevoir des notifications
        </p>
      </div>

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Paramètres WhatsApp
          </CardTitle>
          <CardDescription>
            Activez WhatsApp et configurez votre numéro pour recevoir des notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="wa-optin">Activer WhatsApp</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des notifications via WhatsApp
              </p>
            </div>
            <Switch
              id="wa-optin"
              checked={waOptIn}
              onCheckedChange={setWaOptIn}
              data-testid="switch-wa-optin"
            />
          </div>

          {waOptIn && (
            <>
              <div className="space-y-2">
                <Label htmlFor="whatsapp-number">Numéro WhatsApp (Format E.164)</Label>
                <Input
                  id="whatsapp-number"
                  type="tel"
                  placeholder="+237612345678"
                  value={whatsappE164}
                  onChange={(e) => setWhatsappE164(e.target.value)}
                  data-testid="input-whatsapp-number"
                />
                <p className="text-xs text-muted-foreground">
                  Format international : +237612345678 (Cameroun), +33612345678 (France)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wa-language">Langue préférée</Label>
                <Select value={waLanguage} onValueChange={(v) => setWaLanguage(v as 'fr' | 'en')}>
                  <SelectTrigger id="wa-language" data-testid="select-wa-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending || configLoading}
              data-testid="button-save-config"
            >
              {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
            
            <div className="flex items-center gap-2 text-sm">
              {isConfigured ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">Configuré</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-orange-600">Non configuré</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Card */}
      {isConfigured && (
        <Card>
          <CardHeader>
            <CardTitle>Tester WhatsApp</CardTitle>
            <CardDescription>
              Générez un lien de test pour vérifier votre configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-template">Template de test</Label>
              <Select value={testTemplate} onValueChange={setTestTemplate}>
                <SelectTrigger id="test-template" data-testid="select-test-template">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment_due">Paiement dû</SelectItem>
                  <SelectItem value="grade_available">Notes disponibles</SelectItem>
                  <SelectItem value="bulletin_ready">Bulletin prêt</SelectItem>
                  <SelectItem value="class_reminder">Rappel de cours</SelectItem>
                  <SelectItem value="homework">Devoir</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleTest}
              disabled={tokenLoading}
              variant="outline"
              className="w-full"
              data-testid="button-generate-test"
            >
              {tokenLoading ? 'Génération...' : 'Générer un lien de test'}
            </Button>

            {testToken && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-3">Lien de test généré :</h3>
                <WhatsAppNotify 
                  token={testToken} 
                  label="Ouvrir le test sur WhatsApp"
                  variant="default"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Comment ça marche ?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div>
            <strong className="text-foreground">1. Activez WhatsApp :</strong>
            <p>Cochez la case pour activer les notifications WhatsApp</p>
          </div>
          <div>
            <strong className="text-foreground">2. Entrez votre numéro :</strong>
            <p>Format international E.164 (ex: +237612345678 pour le Cameroun)</p>
          </div>
          <div>
            <strong className="text-foreground">3. Choisissez la langue :</strong>
            <p>Les messages seront envoyés dans votre langue préférée</p>
          </div>
          <div>
            <strong className="text-foreground">4. Testez :</strong>
            <p>Générez un lien de test et cliquez pour ouvrir WhatsApp avec un message pré-rempli</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

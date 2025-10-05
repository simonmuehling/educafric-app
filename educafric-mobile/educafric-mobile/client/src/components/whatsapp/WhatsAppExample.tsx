/**
 * WhatsApp Click-to-Chat Example Component
 * Demonstrates how to use the WhatsApp notification system
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import WhatsAppNotify from './WhatsAppNotify';
import { useWhatsAppToken } from '@/hooks/useWhatsAppToken';
import { useToast } from '@/hooks/use-toast';

export default function WhatsAppExample() {
  const [recipientId, setRecipientId] = useState('');
  const [templateId, setTemplateId] = useState('payment_due');
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [token, setToken] = useState<string | null>(null);
  
  const { generateToken, loading, error } = useWhatsAppToken();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!recipientId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un ID de destinataire',
        variant: 'destructive'
      });
      return;
    }

    // Example template data
    const templateData = {
      parent_name: 'Mme. Nkou',
      student_name: 'Emile',
      term: 'Trimestre 1',
      due_date: '20 Oct 2025',
      invoice_no: 'INV-8742',
      amount: '50000',
      subject: 'Mathématiques',
      average: '15',
      date: new Date().toLocaleDateString('fr-FR'),
      class_name: 'CM2 A',
      start_time: '10:30',
      room: 'B2'
    };

    const result = await generateToken({
      recipientId: parseInt(recipientId),
      templateId,
      templateData,
      lang
    });

    if (result?.success && result.token) {
      setToken(result.token);
      toast({
        title: 'Token généré',
        description: 'Le lien WhatsApp est prêt',
      });
    } else {
      toast({
        title: 'Erreur',
        description: error || 'Impossible de générer le token',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6" data-testid="whatsapp-example-container">
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Click-to-Chat - Démo</CardTitle>
          <CardDescription>
            Testez la notification WhatsApp avec des liens wa.me (Option A)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="recipient-id">ID Destinataire</Label>
              <Input
                id="recipient-id"
                type="number"
                placeholder="Ex: 123"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                data-testid="input-recipient-id"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger id="template" data-testid="select-template">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment_due">Paiement dû</SelectItem>
                  <SelectItem value="payment_reminder">Rappel paiement</SelectItem>
                  <SelectItem value="grade_available">Notes disponibles</SelectItem>
                  <SelectItem value="bulletin_ready">Bulletin prêt</SelectItem>
                  <SelectItem value="absence_alert">Alerte absence</SelectItem>
                  <SelectItem value="class_reminder">Rappel cours</SelectItem>
                  <SelectItem value="homework">Devoir</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Langue</Label>
              <Select value={lang} onValueChange={(v) => setLang(v as 'fr' | 'en')}>
                <SelectTrigger id="language" data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleGenerate}
                disabled={loading || !recipientId}
                className="w-full"
                data-testid="button-generate-token"
              >
                {loading ? 'Génération...' : 'Générer le lien'}
              </Button>
            </div>
          </div>

          {token && (
            <div className="mt-6 p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-3">Lien généré :</h3>
              <WhatsAppNotify 
                token={token} 
                label="Ouvrir WhatsApp"
                variant="default"
              />
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 border border-red-200 bg-red-50 text-red-700 rounded-lg" data-testid="error-message">
              <p className="text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comment ça marche ?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>1. Générer un token :</strong> Le backend crée un token signé avec les données du message
          </p>
          <p>
            <strong>2. Afficher le bouton :</strong> Le composant WhatsAppNotify affiche un bouton + QR code (desktop)
          </p>
          <p>
            <strong>3. Redirection :</strong> Au clic, l'utilisateur est redirigé vers /wa/:token
          </p>
          <p>
            <strong>4. Tracking + WhatsApp :</strong> Le serveur log le clic puis redirige vers wa.me avec le message pré-rempli
          </p>
          <p className="pt-2 border-t">
            <strong>✅ Avantages :</strong> Pas d'API Meta Cloud nécessaire, fonctionne immédiatement, QR code pour desktop, tracking intégré
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

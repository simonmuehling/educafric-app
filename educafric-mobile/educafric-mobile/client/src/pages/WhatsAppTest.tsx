/**
 * WhatsApp Click-to-Chat Test Page
 * Test the WhatsApp notification system
 */

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import WhatsAppExample from '@/components/whatsapp/WhatsAppExample';

export default function WhatsAppTest() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Veuillez vous connecter pour accéder à cette page de test.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">WhatsApp Click-to-Chat - Test</h1>
        <p className="text-muted-foreground">
          Testez le système de notification WhatsApp avec des liens wa.me
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations utilisateur</CardTitle>
          <CardDescription>Vérifiez votre configuration WhatsApp</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">ID:</span> {user.id}
            </div>
            <div>
              <span className="font-semibold">Rôle:</span> {user.role}
            </div>
            <div>
              <span className="font-semibold">Nom:</span> {user.firstName} {user.lastName}
            </div>
            <div>
              <span className="font-semibold">Email:</span> {user.email}
            </div>
          </div>
        </CardContent>
      </Card>

      <WhatsAppExample />

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Pour activer les notifications WhatsApp</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>1. Numéro WhatsApp (E.164) :</strong>
            <p className="text-muted-foreground">Format: +237612345678</p>
          </div>
          <div>
            <strong>2. Opt-in :</strong>
            <p className="text-muted-foreground">L'utilisateur doit accepter les notifications WhatsApp</p>
          </div>
          <div>
            <strong>3. Langue préférée :</strong>
            <p className="text-muted-foreground">FR (Français) ou EN (English)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

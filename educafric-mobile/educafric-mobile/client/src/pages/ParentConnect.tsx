import React, { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  Users, 
  Smartphone, 
  CheckCircle2, 
  ArrowRight,
  School,
  Shield,
  Zap
} from 'lucide-react';

const ParentConnect: React.FC = () => {
  const [, params] = useRoute('/parent-connect');
  const [location] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<'info' | 'register' | 'success'>('info');
  const [parentData, setParentData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    relationship: 'parent'
  });

  // Extraire les paramètres de l'URL
  const urlParams = new URLSearchParams(location.split('?')[1]);
  const studentId = urlParams.get('student');
  const token = urlParams.get('token');
  const ref = urlParams.get('ref');

  const handleRegister = async () => {
    try {
      const response = await fetch('/api/parent/connect-via-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...parentData,
          studentId,
          token,
          connectionMethod: 'firebase_link'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setStep('success');
        toast({
          title: 'Connexion réussie !',
          description: 'Votre compte parent a été créé avec succès'
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: 'Erreur de connexion',
        description: error.message || 'Impossible de créer le compte parent',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Card className="mb-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-3 text-2xl">
              <Zap className="h-8 w-8 text-yellow-300" />
              <span>EDUCAFRIC</span>
              <Heart className="h-8 w-8 text-pink-300" />
            </CardTitle>
            <p className="text-purple-100">
              Plateforme Éducative Africaine - Connexion Parent
            </p>
          </CardHeader>
        </Card>

        {step === 'info' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-blue-600" />
                <span>Invitation à rejoindre EDUCAFRIC</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Student Info */}
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-medium text-blue-800 mb-2">
                  🎓 Votre enfant vous invite à rejoindre EDUCAFRIC
                </h3>
                <p className="text-blue-700 text-sm">
                  Suivez les progrès scolaires, communiquez avec les enseignants, 
                  et participez activement à l'éducation de votre enfant.
                </p>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium text-green-800">Suivi en Temps Réel</h4>
                  <p className="text-sm text-green-600">Notes, présence, devoirs</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Smartphone className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-medium text-purple-800">App Mobile</h4>
                  <p className="text-sm text-purple-600">Notifications push</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Shield className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <h4 className="font-medium text-orange-800">Sécurisé</h4>
                  <p className="text-sm text-orange-600">Validé par l'école</p>
                </div>
              </div>

              {/* Connection Info */}
              {token && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Informations de connexion :</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Code de connexion :</span>
                      <span className="font-mono ml-2 text-blue-600">{token.substring(0, 6)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Méthode :</span>
                      <span className="ml-2 text-green-600">🔥 Firebase Link</span>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={() => setStep('register')} 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
              >
                <ArrowRight className="h-5 w-5 mr-2" />
                Créer mon compte parent
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'register' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <School className="h-6 w-6 text-blue-600" />
                <span>Créer votre compte parent</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={parentData.firstName}
                    onChange={(e) => setParentData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Votre prénom"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    value={parentData.lastName}
                    onChange={(e) => setParentData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={parentData.email}
                  onChange={(e) => setParentData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={parentData.phone}
                  onChange={(e) => setParentData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+237656200472"
                />
              </div>

              <div>
                <Label htmlFor="relationship">Relation avec l'élève</Label>
                <select
                  id="relationship"
                  value={parentData.relationship}
                  onChange={(e) => setParentData(prev => ({ ...prev, relationship: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="parent">Parent Principal</option>
                  <option value="guardian">Tuteur/Responsable</option>
                  <option value="emergency_contact">Contact d'Urgence</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <Button 
                  onClick={() => setStep('info')} 
                  variant="outline"
                  className="flex-1"
                >
                  Retour
                </Button>
                <Button 
                  onClick={handleRegister} 
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  disabled={!parentData.firstName || !parentData.lastName || !parentData.email}
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Créer compte
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'success' && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-4">
                🎉 Félicitations !
              </h2>
              <p className="text-green-700 mb-6">
                Votre compte parent a été créé avec succès. L'école va valider votre connexion 
                et vous recevrez une notification de confirmation.
              </p>
              <div className="bg-white p-4 rounded-lg mb-6">
                <h3 className="font-medium text-gray-800 mb-2">Prochaines étapes :</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>✅ Compte créé et en attente de validation</p>
                  <p>📧 Email de confirmation envoyé</p>
                  <p>🔔 Notifications activées</p>
                  <p>📱 Téléchargez l'app EDUCAFRIC</p>
                </div>
              </div>
              <Button 
                onClick={() => window.location.href = 'https://www.educafric.com'}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Retour à EDUCAFRIC
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ParentConnect;
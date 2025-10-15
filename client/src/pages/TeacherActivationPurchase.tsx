import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { 
  CheckCircle, 
  CreditCard, 
  Smartphone, 
  ArrowLeft,
  Shield,
  Clock,
  Users,
  BookOpen,
  Zap
} from 'lucide-react';

const TeacherActivationPurchase: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'mtn'>('stripe');
  const [mtnPhone, setMtnPhone] = useState('');
  const [processing, setProcessing] = useState(false);

  const PRICE = 25000; // CFA

  const text = {
    fr: {
      title: 'Activation Répétiteur Indépendant',
      subtitle: 'Devenez répétiteur indépendant et gérez vos cours privés',
      price: 'Prix',
      perYear: 'par an',
      features: 'Fonctionnalités Incluses',
      feature1: 'Gestion illimitée d\'élèves privés',
      feature2: 'Planning de sessions personnalisé',
      feature3: 'Cours en ligne et en présentiel',
      feature4: 'Suivi des progrès des élèves',
      feature5: 'Support technique prioritaire',
      selectPayment: 'Choisissez votre mode de paiement',
      creditCard: 'Carte Bancaire (Stripe)',
      mtnMoney: 'MTN Mobile Money',
      phoneNumber: 'Numéro de téléphone MTN',
      phonePlaceholder: '+237 6XX XX XX XX',
      processPayment: 'Procéder au Paiement',
      processing: 'Traitement en cours...',
      backToDashboard: 'Retour au Dashboard',
      securePayment: 'Paiement 100% Sécurisé',
      instantActivation: 'Activation Instantanée',
      yearlySubscription: 'Abonnement Annuel',
      success: 'Succès!',
      activationSuccess: 'Votre activation répétiteur a été effectuée avec succès',
      error: 'Erreur',
      paymentError: 'Une erreur est survenue lors du paiement'
    },
    en: {
      title: 'Independent Tutor Activation',
      subtitle: 'Become an independent tutor and manage your private courses',
      price: 'Price',
      perYear: 'per year',
      features: 'Included Features',
      feature1: 'Unlimited private students management',
      feature2: 'Personalized session scheduling',
      feature3: 'Online and in-person classes',
      feature4: 'Student progress tracking',
      feature5: 'Priority technical support',
      selectPayment: 'Choose your payment method',
      creditCard: 'Credit Card (Stripe)',
      mtnMoney: 'MTN Mobile Money',
      phoneNumber: 'MTN Phone Number',
      phonePlaceholder: '+237 6XX XX XX XX',
      processPayment: 'Process Payment',
      processing: 'Processing...',
      backToDashboard: 'Back to Dashboard',
      securePayment: '100% Secure Payment',
      instantActivation: 'Instant Activation',
      yearlySubscription: 'Yearly Subscription',
      success: 'Success!',
      activationSuccess: 'Your tutor activation has been completed successfully',
      error: 'Error',
      paymentError: 'An error occurred during payment'
    }
  };

  const t = text[language];

  // Check if already activated
  const { data: activationData } = useQuery({
    queryKey: ['/api/teacher/independent/activation/status'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/teacher/independent/activation/status');
      return response.json();
    }
  });

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: async (data: { method: string; phoneNumber?: string }) => {
      const response = await apiRequest('POST', '/api/teacher/independent/purchase-activation', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: t.success,
          description: t.activationSuccess
        });
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          setLocation('/teacher');
        }, 2000);
      }
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t.error,
        description: error.message || t.paymentError
      });
      setProcessing(false);
    }
  });

  const handlePayment = async () => {
    if (paymentMethod === 'mtn' && !mtnPhone) {
      toast({
        variant: 'destructive',
        title: t.error,
        description: 'Veuillez entrer votre numéro MTN'
      });
      return;
    }

    setProcessing(true);
    paymentMutation.mutate({
      method: paymentMethod,
      phoneNumber: paymentMethod === 'mtn' ? mtnPhone : undefined
    });
  };

  // If already activated, show message
  if (activationData?.isActive && !activationData?.isExpired) {
    return (
      <div className="container max-w-4xl mx-auto p-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              {language === 'fr' ? 'Déjà Activé' : 'Already Activated'}
            </h2>
            <p className="text-gray-600 mb-6">
              {language === 'fr' 
                ? `Votre activation est valide jusqu'au ${new Date(activationData.endDate).toLocaleDateString('fr-FR')}`
                : `Your activation is valid until ${new Date(activationData.endDate).toLocaleDateString('en-US')}`
              }
            </p>
            <Button onClick={() => setLocation('/teacher')} data-testid="button-back-dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.backToDashboard}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation('/teacher')} data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.backToDashboard}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - Features */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm opacity-80 mb-2">{t.price}</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold">25,000</span>
                  <span className="text-xl">CFA</span>
                </div>
                <p className="text-sm opacity-80 mt-2">{t.perYear}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.features}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-green-500 mt-0.5" />
                <span>{t.feature1}</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                <span>{t.feature2}</span>
              </div>
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-purple-500 mt-0.5" />
                <span>{t.feature3}</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                <span>{t.feature4}</span>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-500 mt-0.5" />
                <span>{t.feature5}</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>{t.securePayment}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>{t.instantActivation}</span>
            </div>
          </div>
        </div>

        {/* Right Column - Payment */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t.selectPayment}</CardTitle>
              <CardDescription>{t.yearlySubscription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="stripe" id="stripe" data-testid="radio-stripe" />
                  <Label htmlFor="stripe" className="flex items-center gap-3 cursor-pointer flex-1">
                    <CreditCard className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="font-medium">{t.creditCard}</div>
                      <div className="text-sm text-gray-500">Visa, Mastercard, etc.</div>
                    </div>
                    <Badge>Recommandé</Badge>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="mtn" id="mtn" data-testid="radio-mtn" />
                  <Label htmlFor="mtn" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Smartphone className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="font-medium">{t.mtnMoney}</div>
                      <div className="text-sm text-gray-500">Paiement mobile</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === 'mtn' && (
                <div className="space-y-2">
                  <Label>{t.phoneNumber}</Label>
                  <Input
                    type="tel"
                    value={mtnPhone}
                    onChange={(e) => setMtnPhone(e.target.value)}
                    placeholder={t.phonePlaceholder}
                    data-testid="input-mtn-phone"
                  />
                </div>
              )}

              <Button 
                className="w-full" 
                size="lg"
                onClick={handlePayment}
                disabled={processing || paymentMutation.isPending}
                data-testid="button-pay"
              >
                {processing || paymentMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t.processing}
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    {t.processPayment} - 25,000 CFA
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-gray-500">
                {language === 'fr' 
                  ? 'En procédant au paiement, vous acceptez nos conditions d\'utilisation.'
                  : 'By proceeding with payment, you agree to our terms of service.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherActivationPurchase;

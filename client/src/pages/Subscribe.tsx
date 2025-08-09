import React, { useState, useEffect } from 'react';
import { useStripe, useElements, Elements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, CreditCard, Shield, Users, MapPin } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Initialiser Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'semester';
  features: string[];
  category: 'parent' | 'school' | 'freelancer';
}

// Composant de formulaire de paiement
const PaymentForm: React.FC<{ planId: string; plan: SubscriptionPlan; onSuccess: () => void }> = ({ 
  planId, 
  plan,
  onSuccess 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');

  // Créer le PaymentIntent dès le chargement
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        console.log('[SUBSCRIBE] Creating payment intent for plan:', planId);
        const response = await apiRequest('POST', '/api/stripe/create-payment-intent', { planId });
        const data = await response.json();
        
        if (data.success) {
          setClientSecret(data.clientSecret);
          console.log('[SUBSCRIBE] ✅ Payment intent created successfully');
        } else {
          toast({
            title: "Erreur de paiement",
            description: data.message || "Impossible de créer l'intention de paiement",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error('[SUBSCRIBE] ❌ Error creating payment intent:', error);
        toast({
          title: "Erreur de connexion",
          description: "Impossible de se connecter au service de paiement",
          variant: "destructive",
        });
      }
    };

    if (planId) {
      createPaymentIntent();
    }
  }, [planId, toast]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);

    try {
      console.log('[SUBSCRIBE] Processing payment...');
      
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
        redirect: 'if_required'
      });

      if (error) {
        console.error('[SUBSCRIBE] ❌ Payment error:', error);
        toast({
          title: "Erreur de paiement",
          description: error.message || "Le paiement a échoué",
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('[SUBSCRIBE] ✅ Payment succeeded');
        
        // Confirmer le paiement côté serveur
        try {
          const confirmResponse = await apiRequest('POST', '/api/stripe/confirm-payment', {
            paymentIntentId: paymentIntent.id,
            planId: planId
          });
          
          const confirmData = await confirmResponse.json();
          
          if (confirmData.success) {
            toast({
              title: "🎉 Paiement réussi !",
              description: `Votre abonnement ${plan.name} est maintenant actif`,
            });
            onSuccess();
          } else {
            throw new Error(confirmData.message);
          }
        } catch (confirmError: any) {
          console.error('[SUBSCRIBE] ❌ Confirmation error:', confirmError);
          toast({
            title: "Paiement effectué",
            description: "Le paiement a réussi mais la confirmation est en cours. Veuillez patienter.",
            variant: "default",
          });
        }
      }
    } catch (error: any) {
      console.error('[SUBSCRIBE] ❌ Payment processing error:', error);
      toast({
        title: "Erreur inattendue",
        description: "Une erreur s'est produite lors du traitement du paiement",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Préparation du paiement...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">💳 Récapitulatif de votre commande</h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">{plan.name}</span>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {plan.price.toLocaleString()} {plan.currency.toUpperCase()}
            <span className="text-sm font-normal">/{plan.interval === 'month' ? 'mois' : plan.interval === 'year' ? 'an' : 'semestre'}</span>
          </span>
        </div>
      </div>

      <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <PaymentElement 
          options={{
            layout: 'tabs'
          }}
        />
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || !elements || isProcessing}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
        data-testid="button-confirm-payment"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Confirmer le paiement de {plan.price.toLocaleString()} {plan.currency.toUpperCase()}
          </>
        )}
      </Button>

      <div className="flex items-center justify-center text-sm text-gray-500">
        <Shield className="mr-1 h-4 w-4" />
        Paiement sécurisé par Stripe
      </div>
    </form>
  );
};

// Composant principal d'abonnement
const Subscribe: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'parent' | 'school' | 'freelancer'>('parent');

  // Récupérer les plans disponibles
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ['/api/stripe/plans', selectedCategory],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/stripe/plans?category=${selectedCategory}`);
      return response.json();
    }
  });

  // Vérifier le statut d'abonnement actuel
  const { data: subscriptionStatus } = useQuery({
    queryKey: ['/api/stripe/subscription-status'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/stripe/subscription-status');
      return response.json();
    }
  });

  const handlePaymentSuccess = () => {
    setSelectedPlan(null);
    queryClient.invalidateQueries({ queryKey: ['/api/stripe/subscription-status'] });
    toast({
      title: "🎉 Bienvenue dans EDUCAFRIC Premium !",
      description: "Votre abonnement est maintenant actif. Profitez de toutes nos fonctionnalités !",
    });
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('gps') || feature.includes('tracking')) return <MapPin className="h-4 w-4" />;
    if (feature.includes('support')) return <Users className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getFeatureLabel = (feature: string) => {
    const labels: Record<string, string> = {
      'student_tracking': '📍 Suivi des élèves',
      'real_time_notifications': '🔔 Notifications en temps réel',
      'grade_access': '📊 Accès aux notes',
      'teacher_communication': '💬 Communication enseignants',
      'bilingual_support': '🌍 Support bilingue',
      'priority_support': '⭐ Support prioritaire',
      'advanced_gps': '🛰️ GPS avancé',
      'emergency_button': '🚨 Bouton d\'urgence',
      'gps_tracking': '📍 Géolocalisation GPS',
      'safety_zones': '🛡️ Zones de sécurité',
      'real_time_alerts': '⚡ Alertes temps réel',
      'location_history': '📅 Historique des positions',
      'advanced_analytics': '📈 Analytics avancés',
      'unlimited_students': '👥 Élèves illimités',
      'class_management': '🏫 Gestion des classes',
      'attendance_system': '✅ Système de présence',
      'digital_reports': '📄 Rapports numériques',
      'parent_communication': '👨‍👩‍👧‍👦 Communication parents',
      'admin_dashboard': '🎛️ Tableau de bord admin',
      'whatsapp_integration': '📱 Intégration WhatsApp',
      'payment_processing': '💳 Traitement des paiements',
      'tutoring_interface': '🎓 Interface tutorat',
      'schedule_management': '📅 Gestion planning',
      'tutoring_tracking': '👨‍🎓 Suivi étudiant',
      'billing_system': '💰 Système facturation',
      'session_verification': '✅ Vérification sessions',
      'safety_monitoring': '🛡️ Surveillance sécurité',
      'location_reports': '📊 Rapports localisation'
    };
    return labels[feature] || feature;
  };

  if (subscriptionStatus?.success && subscriptionStatus?.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-4">
        <div className="container mx-auto max-w-4xl pt-8">
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-green-200 dark:border-green-800">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl text-green-800 dark:text-green-200">
                🎉 Abonnement Actif !
              </CardTitle>
              <CardDescription className="text-lg">
                Votre abonnement <span className="font-semibold text-green-600">{subscriptionStatus.planName}</span> est actuellement actif
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {subscriptionStatus.expiresAt && (
                <p className="text-gray-600 dark:text-gray-300">
                  Expire le : <span className="font-semibold">{new Date(subscriptionStatus.expiresAt).toLocaleDateString('fr-FR')}</span>
                </p>
              )}
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                data-testid="button-go-dashboard"
              >
                📊 Accéder à mon tableau de bord
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-4">
        <div className="container mx-auto max-w-2xl pt-8">
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedPlan(null)}
                className="w-fit mb-4"
                data-testid="button-back-plans"
              >
                ← Retour aux plans
              </Button>
              <CardTitle className="text-center">
                💳 Finaliser votre abonnement
              </CardTitle>
              <CardDescription className="text-center">
                {selectedPlan.name} - {selectedPlan.price.toLocaleString()} {selectedPlan.currency.toUpperCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements 
                stripe={stripePromise} 
                options={{ 
                  mode: 'payment',
                  currency: 'usd', // Stripe requiert USD
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#3b82f6',
                    }
                  }
                }}
              >
                <PaymentForm 
                  planId={selectedPlan.id}
                  plan={selectedPlan}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-4">
      <div className="container mx-auto max-w-6xl pt-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🚀 EDUCAFRIC Premium
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Débloquez toutes les fonctionnalités premium pour une expérience éducative complète
          </p>
          
          {/* Sélecteur de catégorie */}
          <div className="flex justify-center space-x-4 mb-8">
            {(['parent', 'school', 'freelancer'] as const).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
                data-testid={`button-category-${category}`}
              >
                {category === 'parent' && '👨‍👩‍👧‍👦 Parents'}
                {category === 'school' && '🏫 Écoles'}
                {category === 'freelancer' && '🎓 Freelancers'}
              </Button>
            ))}
          </div>
        </div>

        {/* Alerte pour utilisateurs sandbox */}
        <Alert className="mb-8 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Mode Démonstration :</strong> Les utilisateurs sandbox ont accès à toutes les fonctionnalités gratuitement. 
            Les vrais clients doivent souscrire un abonnement pour accéder aux fonctionnalités premium.
          </AlertDescription>
        </Alert>

        {/* Plans d'abonnement */}
        {plansLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement des plans...</span>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plansData?.plans?.map((plan: SubscriptionPlan) => (
              <Card 
                key={plan.id} 
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {plan.interval === 'month' ? 'Mensuel' : plan.interval === 'year' ? 'Annuel' : 'Semestriel'}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {plan.price.toLocaleString()}
                    <span className="text-sm text-gray-500 ml-1">{plan.currency.toUpperCase()}</span>
                  </div>
                  <CardDescription>
                    Par {plan.interval === 'month' ? 'mois' : plan.interval === 'year' ? 'an' : 'semestre'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        {getFeatureIcon(feature)}
                        <span>{getFeatureLabel(feature)}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={() => setSelectedPlan(plan)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    data-testid={`button-select-plan-${plan.id}`}
                  >
                    🚀 Choisir ce plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Avantages premium */}
        <div className="mt-12 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-6">✨ Pourquoi choisir EDUCAFRIC Premium ?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Géolocalisation en temps réel</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Suivez vos enfants en temps réel avec notre technologie GPS avancée
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">Sécurité maximale</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Zones de sécurité, alertes d'urgence et surveillance continue
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">Support prioritaire</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Assistance dédiée et support technique 24/7 pour nos abonnés premium
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
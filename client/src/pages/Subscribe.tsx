import React, { useState, useEffect } from 'react';
import { useStripe, useElements, Elements, PaymentElement } from '@stripe/react-stripe-js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, CreditCard, Shield, Users, MapPin } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import PaymentMethodSelector, { PaymentMethod } from '@/components/PaymentMethodSelector';

// 🚀 LAZY LOADING STRIPE - Ne charge que quand nécessaire pour éviter cookies warnings
let stripePromise: Promise<any> | null = null;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = import('@stripe/stripe-js').then(({ loadStripe }) =>
      loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '')
    );
  }
  return stripePromise;
};

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'semester' | 'quarter';
  features: string[];
  category: 'parent' | 'school' | 'freelancer';
}

// Composant interne pour le formulaire (à l'intérieur d'Elements)
const PaymentFormInner: React.FC<{ planId: string; plan: SubscriptionPlan; onSuccess: () => void }> = ({ 
  planId, 
  plan,
  onSuccess 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Créer le PaymentIntent dès le chargement
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        console.log('[SUBSCRIBE] Creating payment intent for plan:', planId);
        
        // Include sandbox flag if user is in sandbox mode
        const requestBody: any = { planId };
        const cachedUser = localStorage.getItem('educafric_user');
        if (cachedUser) {
          try {
            const userData = JSON.parse(cachedUser);
            if (userData.sandboxMode) {
              console.log('[SUBSCRIBE] 🧪 Sandbox mode detected - creating USD payment intent');
              await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for realism
              requestBody.sandbox = true;
              requestBody.userId = userData.id;
              requestBody.currency = 'usd'; // Force USD for sandbox
            }
          } catch (parseError) {
            console.log('[SUBSCRIBE] Failed to parse cached user data');
          }
        }
        
        const response = await apiRequest('POST', '/api/stripe/create-payment-intent', requestBody);
        const data = await response.json();
        
        if (data.success) {
          setClientSecret(data.clientSecret);
          console.log('[SUBSCRIBE] ✅ Payment intent created successfully');
        } else {
          toast({
            title: t('payment.subscription.paymentError'),
            description: data.message || t('payment.subscription.cannotCreateIntent'),
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error('[SUBSCRIBE] ❌ Error creating payment intent:', error);
        
        // If authentication fails, check if sandbox user and handle differently
        if (error.message?.includes('401')) {
          const cachedUser = localStorage.getItem('educafric_user');
          if (cachedUser) {
            try {
              const userData = JSON.parse(cachedUser);
              if (userData.sandboxMode) {
                // For sandbox users, continue with cached data instead of redirecting
                console.log('[SUBSCRIBE] 🧪 Sandbox user detected, continuing with cached authentication');
                toast({
                  title: "Mode Sandbox",
                  description: "Test en cours avec compte sandbox - paiement simulé",
                  variant: "default",
                });
                return; // Don't redirect, continue with the flow
              }
            } catch (parseError) {
              console.log('[SUBSCRIBE] Failed to parse cached user data');
            }
          }
          
          toast({
            title: t('payment.subscription.sessionExpired'),
            description: t('payment.subscription.reconnectPrompt'),
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          toast({
            title: t('payment.subscription.connectionError'),
            description: t('payment.subscription.cannotConnect'),
            variant: "destructive",
          });
        }
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
      console.log('[SUBSCRIBE] Using clientSecret:', clientSecret ? 'Present' : 'Missing');
      
      // Submit the elements first (required by newer Stripe versions)
      const submitResult = await elements.submit();
      if (submitResult.error) {
        throw submitResult.error;
      }
      
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/subscription-success?plan=${planId}`,
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
        
        // Show immediate success feedback
        toast({
          title: "🎉 Paiement réussi !",
          description: `Votre abonnement ${plan.name} est maintenant actif`,
        });
        
        // For real clients: redirect to success page
        setTimeout(() => {
          window.location.href = `/subscription-success?plan=${planId}`;
        }, 1500);
        
        // Also confirm payment on server side for account activation
        try {
          const confirmResponse = await apiRequest('POST', '/api/stripe/confirm-payment', {
            paymentIntentId: paymentIntent.id,
            planId: planId
          });
          
          const confirmData = await confirmResponse.json();
          console.log('[SUBSCRIBE] ✅ Server confirmation:', confirmData.success);
          
          // Force refresh user data and subscription status
          if (confirmData.success) {
            // Refresh auth context and user subscription data
            setTimeout(() => {
              window.location.reload(); // Force full page reload to refresh all data
            }, 1000);
          }
        } catch (confirmError: any) {
          console.log('[SUBSCRIBE] ⚠️ Server confirmation pending:', confirmError.message);
          // Even if confirmation fails, try to refresh after delay
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      }
    } catch (error: any) {
      console.error('[SUBSCRIBE] ❌ Payment processing error:', error);
      toast({
        title: t('payment.subscription.unexpectedError'),
        description: t('payment.subscription.paymentProcessingError'),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-2">
          <CreditCard className="h-8 w-8 text-blue-500 animate-pulse" />
          <div className="w-32 bg-gray-200 rounded-lg h-2">
            <div className="bg-blue-500 h-2 rounded-lg animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
        <span className="ml-2">{t('payment.subscription.preparingPayment')}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">💳 {t('payment.subscription.orderSummary')}</h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">{plan.name}</span>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {plan.price.toLocaleString()} {plan.currency.toUpperCase()}
            <span className="text-sm font-normal">/{plan.interval === 'month' ? t('payment.subscription.perMonth') : plan.interval === 'year' ? t('payment.subscription.perYear') : t('payment.subscription.perSemester')}</span>
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
            <CreditCard className="mr-2 h-4 w-4 text-white animate-pulse" />
            {t('payment.subscription.processingPayment')}
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            {t('payment.subscription.confirmPayment')} {plan.price.toLocaleString()} {plan.currency.toUpperCase()}
          </>
        )}
      </Button>

      <div className="flex items-center justify-center text-sm text-gray-500">
        <Shield className="mr-1 h-4 w-4" />
        {t('payment.subscription.securedBy')}
      </div>
    </form>
  );
};

// Composant wrapper qui gère Elements et clientSecret
const PaymentForm: React.FC<{ planId: string; plan: SubscriptionPlan; onSuccess: () => void }> = ({ 
  planId, 
  plan,
  onSuccess 
}) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [clientSecret, setClientSecret] = useState<string>('');

  // Créer le PaymentIntent dès le chargement
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        console.log('[SUBSCRIBE] Creating payment intent for plan:', planId);
        
        // Include sandbox flag if user is in sandbox mode
        const requestBody: any = { planId };
        const cachedUser = localStorage.getItem('educafric_user');
        if (cachedUser) {
          try {
            const userData = JSON.parse(cachedUser);
            if (userData.sandboxMode) {
              console.log('[SUBSCRIBE] 🧪 Sandbox mode detected - creating USD payment intent');
              await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for realism
              requestBody.sandbox = true;
              requestBody.userId = userData.id;
              requestBody.currency = 'usd'; // Force USD for sandbox
            }
          } catch (parseError) {
            console.log('[SUBSCRIBE] Failed to parse cached user data');
          }
        }
        
        const response = await apiRequest('POST', '/api/stripe/create-payment-intent', requestBody);
        const data = await response.json();
        
        if (data.success) {
          setClientSecret(data.clientSecret);
          console.log('[SUBSCRIBE] ✅ Payment intent created successfully');
        } else {
          toast({
            title: t('payment.subscription.paymentError'),
            description: data.message || t('payment.subscription.cannotCreateIntent'),
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error('[SUBSCRIBE] ❌ Error creating payment intent:', error);
        
        // If authentication fails, check if sandbox user and handle differently
        if (error.message?.includes('401')) {
          const cachedUser = localStorage.getItem('educafric_user');
          if (cachedUser) {
            try {
              const userData = JSON.parse(cachedUser);
              if (userData.sandboxMode) {
                // For sandbox users, continue with cached data instead of redirecting
                console.log('[SUBSCRIBE] 🧪 Sandbox user detected, continuing with cached authentication');
                toast({
                  title: "Mode Sandbox",
                  description: "Test en cours avec compte sandbox - paiement simulé",
                  variant: "default",
                });
                return; // Don't redirect, continue with the flow
              }
            } catch (parseError) {
              console.log('[SUBSCRIBE] Failed to parse cached user data');
            }
          }
          
          toast({
            title: t('payment.subscription.sessionExpired'),
            description: t('payment.subscription.reconnectPrompt'),
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          toast({
            title: t('payment.subscription.connectionError'),
            description: t('payment.subscription.cannotConnect'),
            variant: "destructive",
          });
        }
      }
    };

    if (planId) {
      createPaymentIntent();
    }
  }, [planId, toast]);

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-2">
          <CreditCard className="h-8 w-8 text-blue-500 animate-pulse" />
          <div className="w-32 bg-gray-200 rounded-lg h-2">
            <div className="bg-blue-500 h-2 rounded-lg animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
        <span className="ml-2">{t('payment.subscription.preparingPayment')}</span>
      </div>
    );
  }

  return (
    <Elements 
      stripe={getStripe()} 
      options={{ 
        clientSecret: clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#3b82f6',
          }
        }
      }}
    >
      <PaymentFormInner planId={planId} plan={plan} onSuccess={onSuccess} />
    </Elements>
  );
};

// Composant principal d'abonnement
const Subscribe: React.FC = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'parent' | 'school' | 'freelancer'>('parent');
  const [stripeLoaded, setStripeLoaded] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

  // 🚀 Charger Stripe uniquement quand on utilise la carte de crédit
  useEffect(() => {
    if (selectedPlan && selectedPaymentMethod === 'card' && !stripeLoaded) {
      console.log('[STRIPE_OPTIMIZATION] 🔄 Loading Stripe on-demand...');
      getStripe().then((stripe) => {
        setStripeLoaded(stripe);
        console.log('[STRIPE_OPTIMIZATION] ✅ Stripe loaded successfully');
      }).catch((error) => {
        console.error('[STRIPE_OPTIMIZATION] ❌ Error loading Stripe:', error);
        toast({
          title: t('payment.subscription.loadingError'),
          description: t('payment.subscription.cannotLoadPayment'),
          variant: "destructive",
        });
      });
    }
  }, [selectedPlan, selectedPaymentMethod, stripeLoaded, toast]);

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
    setSelectedPaymentMethod(null);
    queryClient.invalidateQueries({ queryKey: ['/api/stripe/subscription-status'] });
    toast({
      title: `🎉 ${t('payment.subscription.welcome')}`,
      description: t('payment.subscription.enjoyFeatures'),
    });
  };

  const handleBackToPaymentMethods = () => {
    setSelectedPaymentMethod(null);
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
          {/* Language Toggle */}
          <div className="flex justify-end mb-4">
            <LanguageToggle variant="buttons" size="md" />
          </div>
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-green-200 dark:border-green-800">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl text-green-800 dark:text-green-200">
                🎉 {t('payment.subscription.activeTitle')}
              </CardTitle>
              <CardDescription className="text-lg">
                <span className="font-semibold text-green-600">{subscriptionStatus.planName}</span> {t('payment.subscription.activeSubtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {subscriptionStatus.expiresAt && (
                <p className="text-gray-600 dark:text-gray-300">
                  {t('payment.subscription.expiresOn')} <span className="font-semibold">{new Date(subscriptionStatus.expiresAt).toLocaleDateString()}</span>
                </p>
              )}
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                data-testid="button-go-dashboard"
              >
                📊 {t('payment.subscription.goDashboard')}
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
        <div className="container mx-auto max-w-4xl pt-8">
          {/* Language Toggle */}
          <div className="flex justify-end mb-4">
            <LanguageToggle variant="buttons" size="md" />
          </div>
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSelectedPlan(null);
                  setSelectedPaymentMethod(null);
                }}
                className="w-fit mb-4"
                data-testid="button-back-plans"
              >
                ← {t('payment.subscription.backToPlans')}
              </Button>
              <CardTitle className="text-center">
                💳 {t('payment.subscription.title')}
              </CardTitle>
              <CardDescription className="text-center">
                {selectedPlan.name} - {selectedPlan.price.toLocaleString()} {selectedPlan.currency.toUpperCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedPaymentMethod ? (
                // Étape 1: Sélection de la méthode de paiement
                <PaymentMethodSelector
                  selectedMethod={selectedPaymentMethod}
                  onMethodSelect={setSelectedPaymentMethod}
                  planName={selectedPlan.name}
                  amount={selectedPlan.price}
                  currency={selectedPlan.currency}
                />
              ) : selectedPaymentMethod === 'card' ? (
                // Étape 2: Paiement par carte (Stripe)
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Button 
                      variant="ghost" 
                      onClick={handleBackToPaymentMethods}
                      className="w-fit"
                      data-testid="button-back-payment-methods"
                    >
                      ← {t('payment.subscription.backToPaymentMethods')}
                    </Button>
                  </div>
                  {!stripeLoaded ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="flex flex-col items-center space-y-2">
          <CreditCard className="h-8 w-8 text-blue-500 animate-pulse" />
          <div className="w-32 bg-gray-200 rounded-lg h-2">
            <div className="bg-blue-500 h-2 rounded-lg animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
                      <span className="ml-2">{t('payment.subscription.loadingPayment')}</span>
                    </div>
                  ) : (
                    <PaymentForm 
                      planId={selectedPlan.id}
                      plan={selectedPlan}
                      onSuccess={handlePaymentSuccess}
                    />
                  )}
                </div>
              ) : (
                // Étape 2: Instructions pour paiements locaux (Orange Money ou Virement)
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Button 
                      variant="ghost" 
                      onClick={handleBackToPaymentMethods}
                      className="w-fit"
                      data-testid="button-back-payment-methods"
                    >
                      ← {t('payment.subscription.backToPaymentMethods')}
                    </Button>
                  </div>
                  {/* ⚠️ NOTIFICATION IMPORTANTE - CRÉER PROFIL AVANT PAIEMENT */}
                  <Alert className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <AlertDescription className="text-amber-800 dark:text-amber-200">
                      <div className="space-y-2">
                        <div className="font-semibold text-lg">
                          ⚠️ Important : Créez votre profil AVANT le paiement
                        </div>
                        <div className="text-sm">
                          <strong>Pour faciliter l'activation rapide de votre abonnement :</strong>
                          <ol className="list-decimal list-inside mt-2 space-y-1">
                            <li>📝 <strong>Créez d'abord votre profil complet</strong> sur EDUCAFRIC</li>
                            <li>💳 Ensuite effectuez votre transfert d'argent ou virement bancaire</li>
                            <li>📧 Envoyez la preuve de paiement avec vos informations de profil</li>
                          </ol>
                          <div className="mt-3 p-2 bg-amber-100 dark:bg-amber-900/30 rounded text-xs">
                            💡 <strong>Pourquoi ?</strong> Un profil complet nous permet d'activer votre abonnement 
                            automatiquement et rapidement dès réception de votre paiement.
                          </div>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                    <div className="text-center">
                      <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-green-800 mb-2">
                        {t('payment.subscription.instructionsSent')}
                      </h3>
                      <p className="text-green-700 mb-4">
                        {t('payment.subscription.makePayment')} {selectedPaymentMethod === 'orange_money' ? t('payment.subscription.orangeMoneyPayment') : t('payment.subscription.bankTransferPayment')} 
                        {t('payment.subscription.withInfoBelow')}
                      </p>
                      
                      {/* Afficher les informations détaillées selon la méthode */}
                      {selectedPaymentMethod === 'orange_money' ? (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-orange-800 mb-3">📱 {t('payment.subscription.orangeTransfer')}</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">{t('payment.subscription.beneficiary')}</span>
                              <span className="font-medium">ABANDA AKAK</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{t('payment.subscription.number')}</span>
                              <span className="font-medium text-orange-600">677 004 011</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{t('payment.subscription.amount')}</span>
                              <span className="font-medium text-green-600">{selectedPlan.price.toLocaleString()} XAF</span>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-orange-700 bg-orange-100 p-2 rounded">
                            💡 <strong>{t('payment.subscription.quickCode')}</strong> Composez #150# → 1 → 1 → 677004011 → {selectedPlan.price} XAF
                          </div>
                        </div>
                      ) : (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-blue-800 mb-3">🏦 {t('payment.subscription.bankTransfer')}</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">{t('payment.subscription.beneficiary')}</span>
                              <span className="font-medium">AFRO METAVERSE MARKETING</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{t('payment.subscription.bank')}</span>
                              <span className="font-medium">Afriland First Bank</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{t('payment.subscription.fullRib')}</span>
                              <span className="font-medium text-blue-600">10033 00368 31500012045 68</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{t('payment.subscription.amount')}</span>
                              <span className="font-medium text-green-600">{selectedPlan.price.toLocaleString()} XAF</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{t('payment.subscription.reason')}</span>
                              <span className="font-medium">{t('payment.subscription.subscriptionPrefix')} {selectedPlan.name}</span>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-blue-700 bg-blue-100 p-2 rounded">
                            🏦 <strong>{t('payment.subscription.bankDetails')}</strong> Code banque: 10033 | Code guichet: 00368 | N° compte: 31500012045 | Clé: 68
                          </div>
                        </div>
                      )}
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <h4 className="font-semibold text-gray-900 mb-2">📧 {t('payment.subscription.nextSteps')}</h4>
                        <ol className="text-left text-sm text-gray-700 space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="font-semibold text-green-600">1.</span>
                            {t('payment.subscription.step1Transfer')} {selectedPaymentMethod === 'orange_money' ? t('payment.subscription.step1Orange') : t('payment.subscription.step1Bank')} {t('payment.subscription.step1According')}
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-semibold text-green-600">2.</span>
                            {t('payment.subscription.step2Send')} {selectedPaymentMethod === 'orange_money' ? t('payment.subscription.step2Screenshot') : t('payment.subscription.step2Receipt')} {t('payment.subscription.step2Email')} <strong>support@educafric.com</strong>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-semibold text-green-600">3.</span>
                            {t('payment.subscription.step3Validate')} {selectedPaymentMethod === 'orange_money' ? t('payment.subscription.step3Orange') : t('payment.subscription.step3Bank')}
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-semibold text-green-600">4.</span>
                            {t('payment.subscription.step4Notification')}
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      {t('payment.subscription.needHelp')}
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button variant="outline" className="flex items-center gap-2">
                        📧 support@educafric.com
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        📱 +237 657 004 011
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-4">
      <div className="container mx-auto max-w-6xl pt-8">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <LanguageToggle variant="buttons" size="md" />
        </div>
        
        {/* Bouton retour */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center gap-2"
            data-testid="button-back-dashboard"
          >
            ← {t('nav.dashboard')}
          </Button>
        </div>
        
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
            <div className="flex flex-col items-center space-y-2">
          <CreditCard className="h-8 w-8 text-blue-500 animate-pulse" />
          <div className="w-32 bg-gray-200 rounded-lg h-2">
            <div className="bg-blue-500 h-2 rounded-lg animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
            <span className="ml-2">{t('payment.subscription.preparingPayment')}</span>
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
                      {plan.interval === 'month' ? 'Mensuel' : plan.interval === 'year' ? 'Annuel' : plan.interval === 'semester' ? 'Semestriel' : 'Trimestriel'}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {plan.price.toLocaleString()}
                    <span className="text-sm text-gray-500 ml-1">{plan.currency.toUpperCase()}</span>
                  </div>
                  <CardDescription>
                    Par {plan.interval === 'month' ? 'mois' : plan.interval === 'year' ? 'an' : plan.interval === 'semester' ? 'semestre' : 'trimestre'}
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
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Géolocalisation en temps réel</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Suivez vos enfants en temps réel avec notre technologie GPS avancée
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">Sécurité maximale</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Zones de sécurité, alertes d'urgence et surveillance continue
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl mx-auto mb-4 flex items-center justify-center">
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
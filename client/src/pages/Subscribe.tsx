import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  GraduationCap, 
  BookOpen, 
  Check, 
  ArrowLeft, 
  CreditCard,
  Smartphone,
  Building,
  Users,
  School,
  Briefcase,
  MapPin,
  Star,
  Shield,
  Zap,
  Eye,
  Globe
} from 'lucide-react';
import FrontpageNavbar from '@/components/FrontpageNavbar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useCurrency } from '@/contexts/CurrencyContext';
import CountryPaymentButtons from '@/components/payment/CountryPaymentButtons';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { apiRequest } from '@/lib/queryClient';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

export default function Subscribe() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { currency, formatPrice, convertFromCFA } = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [showFeatures, setShowFeatures] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const text = {
    fr: {
      title: 'Abonnements EDUCAFRIC',
      subtitle: 'Choisissez le plan parfait pour vos besoins éducatifs',
      categories: {
        parents: 'Parents',
        schools: 'Écoles',
        freelancers: 'Freelancers'
      },
      categoryDescriptions: {
        parents: `6 plans disponibles - De ${formatPrice(convertFromCFA(1000))}/mois à ${formatPrice(convertFromCFA(18000))}/an`,
        schools: `3 plans disponibles - De ${formatPrice(convertFromCFA(50000))} à ${formatPrice(convertFromCFA(75000))}/an`,
        freelancers: `3 plans disponibles - De ${formatPrice(convertFromCFA(12000))} à ${formatPrice(convertFromCFA(25000))}/an`
      },
      planTypes: {
        parent_public_monthly: 'Parent École Publique (Mensuel)',
        parent_public_annual: 'Parent École Publique (Annuel)',
        parent_private_monthly: 'Parent École Privée (Mensuel)',
        parent_private_annual: 'Parent École Privée (Annuel)',
        parent_geolocation_monthly: 'Parent GPS (Mensuel)',
        parent_geolocation_annual: 'Parent GPS (Annuel)',
        school_public: 'École Publique',
        school_private: 'École Privée',
        school_geolocation: 'École GPS',
        freelancer_annual: 'Freelancer Annuel',
        freelancer_semester: 'Freelancer Semestriel',
        freelancer_geolocation: 'Freelancer GPS'
      },
      paymentMethods: {
        stripe: 'Paiement par Carte',
        orange: 'Orange Money',
        bank: 'Virement Bancaire'
      },
      selectPlan: 'Choisir ce Plan',
      viewFeatures: 'Voir les Fonctionnalités',
      backToCategories: 'Retour aux Catégories',
      backToPlans: 'Retour aux Plans',
      orderSummary: 'Récapitulatif de votre commande',
      paymentInstructions: 'Instructions de Paiement',
      processingPayment: 'Traitement...',
      paymentSuccess: 'Paiement réussi !',
      paymentError: 'Erreur de paiement',
      perMonth: '/mois',
      perYear: '/an',
      perSemester: '/semestre',
      mostPopular: 'Plus Populaire',
      recommended: 'Recommandé',
      features: {
        basic: 'Gratuit',
        premium: 'Premium',
        advanced: 'Avancé'
      }
    },
    en: {
      title: 'EDUCAFRIC Subscriptions',
      subtitle: 'Choose the perfect plan for your educational needs',
      categories: {
        parents: 'Parents',
        schools: 'Schools',
        freelancers: 'Freelancers'
      },
      categoryDescriptions: {
        parents: '6 plans available - From 1,000 CFA/month to 18,000 CFA/year',
        schools: '3 plans available - From 50,000 to 75,000 CFA/year',
        freelancers: '3 plans available - From 12,000 to 25,000 CFA/year'
      },
      planTypes: {
        parent_public_monthly: 'Public School Parent (Monthly)',
        parent_public_annual: 'Public School Parent (Annual)',
        parent_private_monthly: 'Private School Parent (Monthly)',
        parent_private_annual: 'Private School Parent (Annual)',
        parent_geolocation_monthly: 'Parent GPS (Monthly)',
        parent_geolocation_annual: 'Parent GPS (Annual)',
        school_public: 'Public School',
        school_private: 'Private School',
        school_geolocation: 'School GPS',
        freelancer_annual: 'Freelancer Annual',
        freelancer_semester: 'Freelancer Semester',
        freelancer_geolocation: 'Freelancer GPS'
      },
      paymentMethods: {
        stripe: 'Card Payment',
        orange: 'Orange Money',
        bank: 'Bank Transfer'
      },
      selectPlan: 'Choose this Plan',
      viewFeatures: 'View Features',
      backToCategories: 'Back to Categories',
      backToPlans: 'Back to Plans',
      orderSummary: 'Order Summary',
      paymentInstructions: 'Payment Instructions',
      processingPayment: 'Processing...',
      paymentSuccess: 'Payment successful!',
      paymentError: 'Payment error',
      perMonth: '/month',
      perYear: '/year',
      perSemester: '/semester',
      mostPopular: 'Most Popular',
      recommended: 'Recommended',
      features: {
        basic: 'Free',
        premium: 'Premium',
        advanced: 'Advanced'
      }
    }
  };

  const t = text[language];

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <FrontpageNavbar />
        <div className="container mx-auto px-4 max-w-4xl pt-20">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-8">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {language === 'fr' ? 'Connexion Requise' : 'Login Required'}
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed mb-12 max-w-2xl mx-auto">
              {language === 'fr' 
                ? 'Vous devez vous connecter à votre compte EDUCAFRIC pour acheter un abonnement et accéder à toutes les fonctionnalités premium.'
                : 'You must login to your EDUCAFRIC account to purchase a subscription and access all premium features.'
              }
            </p>
            <div className="space-y-4">
              <Button 
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 px-8 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                {language === 'fr' ? '🔐 SE CONNECTER' : '🔐 LOGIN'}
              </Button>
              <div className="text-blue-200 text-sm">
                {language === 'fr' ? 'Pas de compte ?' : "Don't have an account?"}{' '}
                <button 
                  onClick={() => navigate('/register')}
                  className="text-yellow-300 hover:text-yellow-200 underline font-semibold"
                >
                  {language === 'fr' ? 'Créer un compte' : 'Create account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subscriptionPlans = {
    parents: [
      {
        id: 'parent_public_monthly',
        name: t.planTypes.parent_public_monthly,
        price: 1000,
        period: 'monthly',
        popular: false,
        features: ['student_tracking', 'real_time_notifications', 'grade_access', 'teacher_communication', 'bilingual_support']
      },
      {
        id: 'parent_public_annual',
        name: t.planTypes.parent_public_annual,
        price: 12000,
        period: 'annual',
        popular: true,
        savings: 2000,
        features: ['student_tracking', 'real_time_notifications', 'grade_access', 'teacher_communication', 'bilingual_support', 'priority_support']
      },
      {
        id: 'parent_private_monthly',
        name: t.planTypes.parent_private_monthly,
        price: 1500,
        period: 'monthly',
        popular: false,
        features: ['student_tracking', 'real_time_notifications', 'advanced_gps', 'emergency_button', 'grade_access', 'priority_communication']
      },
      {
        id: 'parent_private_annual',
        name: t.planTypes.parent_private_annual,
        price: 18000,
        period: 'annual',
        popular: false,
        savings: 3000,
        features: ['student_tracking', 'real_time_notifications', 'advanced_gps', 'emergency_button', 'grade_access', 'priority_communication', 'premium_support']
      },
      {
        id: 'parent_geolocation_monthly',
        name: t.planTypes.parent_geolocation_monthly,
        price: 1000,
        period: 'monthly',
        popular: false,
        features: ['gps_tracking', 'safety_zones', 'real_time_alerts', 'location_history']
      },
      {
        id: 'parent_geolocation_annual',
        name: t.planTypes.parent_geolocation_annual,
        price: 12000,
        period: 'annual',
        popular: false,
        savings: 2000,
        features: ['gps_tracking', 'safety_zones', 'real_time_alerts', 'location_history', 'advanced_analytics']
      }
    ],
    schools: [
      {
        id: 'school_public',
        name: t.planTypes.school_public,
        price: 50000,
        period: 'annual',
        popular: true,
        features: ['unlimited_students', 'class_management', 'attendance_system', 'digital_reports', 'parent_communication', 'admin_dashboard']
      },
      {
        id: 'school_private',
        name: t.planTypes.school_private,
        price: 75000,
        period: 'annual',
        popular: false,
        features: ['unlimited_students', 'advanced_analytics', 'custom_reports', 'whatsapp_integration', 'payment_processing', 'priority_support']
      },
      {
        id: 'school_geolocation',
        name: t.planTypes.school_geolocation,
        price: 25000,
        period: 'annual',
        popular: false,
        features: ['student_gps_tracking', 'school_zone_monitoring', 'safety_alerts', 'location_analytics']
      }
    ],
    freelancers: [
      {
        id: 'freelancer_annual',
        name: t.planTypes.freelancer_annual,
        price: 25000,
        period: 'annual',
        popular: true,
        features: ['tutoring_interface', 'schedule_management', 'student_tracking', 'parent_communication', 'billing_system']
      },
      {
        id: 'freelancer_semester',
        name: t.planTypes.freelancer_semester,
        price: 12500,
        period: 'semester',
        popular: false,
        features: ['tutoring_interface', 'schedule_management', 'student_tracking', 'parent_communication']
      },
      {
        id: 'freelancer_geolocation',
        name: t.planTypes.freelancer_geolocation,
        price: 12000,
        period: 'annual',
        popular: false,
        features: ['student_location_tracking', 'session_verification', 'safety_monitoring', 'location_reports']
      }
    ]
  };

  const categoryIcons = {
    parents: Heart,
    schools: GraduationCap,
    freelancers: BookOpen
  };

  const categoryColors = {
    parents: 'from-pink-500 to-rose-500',
    schools: 'from-blue-500 to-indigo-500',
    freelancers: 'from-green-500 to-emerald-500'
  };

  const getCurrentPlanDetails = () => {
    if (!selectedPlan) return null;
    
    for (const category of Object.values(subscriptionPlans)) {
      const plan = category.find(p => p.id === selectedPlan);
      if (plan) return plan;
    }
    return null;
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setSelectedPlan('');
    setShowFeatures(false);
    setShowPayment(false);
  };

  const handleSelectPlan = (planId: string) => {
    // Check if user is authenticated before allowing payment
    if (!user) {
      toast({
        title: language === 'fr' ? 'Connexion requise' : 'Login Required',
        description: language === 'fr' ? 'Vous devez vous connecter pour acheter un abonnement.' : 'You must login to purchase a subscription.',
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    setSelectedPlan(planId);
    setShowPayment(true);
  };

  const handlePaymentInitiated = (methodId: string, paymentData: any) => {
    console.log('[PAYMENT] Payment initiated:', { methodId, paymentData });
    
    if (paymentData.clientSecret) {
      // Redirect to Stripe checkout for card payments
      if (window?.location) {
        window.location.href = `/checkout?client_secret=${paymentData.clientSecret}`;
      }
    } else {
      // Show success message for other payment methods
      toast({
        title: language === 'fr' ? 'Paiement Initié' : 'Payment Initiated',
        description: language === 'fr' 
          ? 'Veuillez suivre les instructions pour compléter votre paiement.'
          : 'Please follow the instructions to complete your payment.',
      });
    }
  };

  // Function to automatically activate subscription after payment
  const activateSubscriptionAutomatically = async (planId: string, paymentIntentId: string, duration: string) => {
    try {
      console.log(`[EDUCAFRIC] Activating subscription automatically for plan ${planId}`);
      
      // Store subscription info in localStorage for now
      const subscriptionData = {
        planId,
        paymentIntentId,
        duration,
        activatedAt: new Date().toISOString(),
        status: 'active'
      };
      
      localStorage.setItem('educafric_subscription', JSON.stringify(subscriptionData));
      localStorage.setItem('educafric_subscription_active', 'true');
      
      console.log(`[EDUCAFRIC] Subscription ${planId} activated successfully`);
    } catch (error) {
      console.error('[EDUCAFRIC] Error activating subscription:', error);
    }
  };

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
    
    if (method !== 'stripe') {
      // Store payment info for alternative methods
      const planDetails = getCurrentPlanDetails();
      if (planDetails) {
        localStorage.setItem('lastPaymentMethod', method);
        localStorage.setItem('lastPaymentAmount', planDetails?.price?.toString());
        localStorage.setItem('lastPaymentPlan', selectedPlan);
      }
    }
  };

  // Stripe Payment Component
  const StripeCheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();

      if (!stripe || !elements) {
        return;
      }

      const planDetails = getCurrentPlanDetails();
      if (!planDetails) return;

      setIsProcessing(true);

      try {
        // Create payment intent using existing route
        const response = await apiRequest('POST', '/api/create-payment-intent', {
          amount: planDetails.price / 100, // Convert CFA to EUR equivalent for Stripe
          planId: selectedPlan,
          planName: planDetails.name,
          customerEmail: user.email
        });

        const data = await response.json();
        const { clientSecret } = data;

        // Confirm payment
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement)!,
          }
        });

        if (result.error) {
          toast({
            title: t.paymentError,
            description: result.error?.message || 'Payment error occurred',
            variant: "destructive",
          });
        } else {
          // Automatically activate subscription after successful payment
          await activateSubscriptionAutomatically(selectedPlan, result.paymentIntent?.id, planDetails.period);

          toast({
            title: t.paymentSuccess,
            description: `${planDetails.name} activé avec succès!`,
          });

          // Reset form
          setSelectedCategory('');
          setSelectedPlan('');
          setShowPayment(false);
        }
      } catch (error) {
        toast({
          title: t.paymentError,
          description: 'Erreur lors du traitement du paiement',
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 border rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="w-full"
        >
          {isProcessing ? t.processingPayment : `Payer ${getCurrentPlanDetails()?.price.toLocaleString()} CFA`}
        </Button>
      </form>
    );
  };

  // Alternative Payment Instructions
  const AlternativePaymentInstructions = () => {
    const planDetails = getCurrentPlanDetails();
    if (!planDetails) return null;

    return (
      <div className="space-y-6">
        {paymentMethod === 'orange' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Instructions Orange Money
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Composez <strong>#150#</strong> sur votre téléphone</li>
                  <li>Sélectionnez "Transfert d'argent"</li>
                  <li>Entrez le nom: <strong>ABANDA AKAK SIMON</strong></li>
                  <li>Montant: <strong>{planDetails.price.toLocaleString()} CFA</strong></li>
                  <li>Référence: <strong>EDUCAFRIC-{selectedPlan.toUpperCase()}</strong></li>
                  <li>Confirmez avec votre code PIN Orange Money</li>
                </ol>
              </div>
              <p className="text-sm text-muted-foreground">
                Votre abonnement sera activé automatiquement dans les 24h suivant la réception du paiement.
              </p>
            </CardContent>
          </Card>
        )}

        {paymentMethod === 'bank' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Instructions Virement Bancaire
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div><strong>Nom/Raison sociale:</strong></div>
                    <div>EDUCAFRIC PAYMENT SERVICES</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><strong>Banque du bénéficiaire:</strong></div>
                    <div>Afriland First Bank</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><strong>IBAN:</strong></div>
                    <div className="font-mono">CM21 10005 00024 08750211001-91</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><strong>Code SWIFT/BIC:</strong></div>
                    <div className="font-mono">CCEICMCX</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><strong>Code Banque:</strong></div>
                    <div className="font-mono">10005</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><strong>Code Guichet:</strong></div>
                    <div className="font-mono">00024</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><strong>Numéro de compte:</strong></div>
                    <div className="font-mono">08750211001</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><strong>Clé RIB:</strong></div>
                    <div className="font-mono">91</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><strong>Montant:</strong></div>
                    <div className="text-green-600 font-semibold">{planDetails.price.toLocaleString()} CFA</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><strong>Motif du virement:</strong></div>
                    <div className="font-semibold text-blue-600">educafric</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><strong>Pays:</strong></div>
                    <div>Cameroun</div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Veuillez conserver votre reçu de transaction. Votre abonnement sera activé dans les 48h suivant la réception du paiement.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Main Category Selection Screen
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <FrontpageNavbar />
        <div className="container mx-auto px-4 pt-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {Object.entries(t.categories).map(([key, name]) => {
              const Icon = categoryIcons[key as keyof typeof categoryIcons];
              const gradient = categoryColors[key as keyof typeof categoryColors];
              
              return (
                <Card 
                  key={key}
                  className="group transform hover:scale-105 transition-all duration-500 cursor-pointer border-0 bg-white/10 backdrop-blur-md hover:bg-white/20 shadow-2xl hover:shadow-3xl"
                  onClick={() => handleSelectCategory(key)}
                >
                  <CardContent className="p-10 text-center">
                    <div className={`w-24 h-24 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                      <Icon className="h-12 w-12 text-white drop-shadow-md" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-blue-200 transition-colors">
                      {name}
                    </h3>
                    <p className="text-blue-100 leading-relaxed text-lg">
                      {t.categoryDescriptions[key as keyof typeof t.categoryDescriptions]}
                    </p>
                    <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded mx-auto"></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Plans Selection Screen
  if (selectedCategory && !showPayment) {
    const plans = subscriptionPlans[selectedCategory as keyof typeof subscriptionPlans];
    const Icon = categoryIcons[selectedCategory as keyof typeof categoryIcons];

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <FrontpageNavbar />
        <div className="container mx-auto px-4 pt-20">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline" 
              onClick={() => setSelectedCategory('')}
              className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.backToCategories}
            </Button>
          </div>

          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                <Icon className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                {t.categories[selectedCategory as keyof typeof t.categories]}
              </h1>
            </div>
            <p className="text-xl text-blue-100 leading-relaxed">
              {t.categoryDescriptions[selectedCategory as keyof typeof t.categoryDescriptions]}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {(Array.isArray(plans) ? plans : []).map((plan) => (
              <Card 
                key={plan.id}
                className={`relative ${plan.popular ? 'border-2 border-primary shadow-2xl scale-105' : 'border border-gray-200 shadow-lg'} bg-white hover:shadow-xl transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      {t.mostPopular}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  
                  <div className="mb-4">
                    <div className="text-4xl font-bold text-gray-900">
                      {plan.price.toLocaleString()} <span className="text-lg text-gray-500">CFA</span>
                    </div>
                    <div className="text-gray-600">
                      {plan.period === 'monthly' ? t.perMonth : 
                       plan.period === 'semester' ? t.perSemester : t.perYear}
                    </div>
                    {plan.savings && (
                      <div className="text-sm text-green-600 font-medium mt-1">
                        Économisez {plan.savings.toLocaleString()} CFA
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {(Array.isArray(plan.features) ? plan.features : []).map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">
                          {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    size="lg"
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    💳 ACHETER MAINTENANT
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Payment Screen
  if (showPayment) {
    const planDetails = getCurrentPlanDetails();
    if (!planDetails) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <FrontpageNavbar />
        <div className="container mx-auto px-4 max-w-4xl pt-20">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline" 
              onClick={() => setShowPayment(false)}
              className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.backToPlans}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl">{t.orderSummary}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div>
                    <h3 className="font-semibold text-xl text-white">{planDetails.name}</h3>
                    <p className="text-blue-200">
                      {planDetails.period === 'monthly' ? t.perMonth : 
                       planDetails.period === 'semester' ? t.perSemester : t.perYear}
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-white bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    {formatPrice(convertFromCFA(planDetails.price))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Country-Specific Payment Methods */}
            <CountryPaymentButtons
              planId={planDetails.id}
              planName={planDetails.name}
              amount={convertFromCFA(planDetails.price)}
              onPaymentInitiated={handlePaymentInitiated}
              className="bg-white/10 backdrop-blur-md border-white/20"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
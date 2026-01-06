import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, Bell, MapPin, Check, Loader2, 
  Users, Navigation, Shield, Star, Phone
} from 'lucide-react';

const ParentSubscription = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [subscribingTo, setSubscribingTo] = useState<string | null>(null);

  // Fetch dynamic pricing from school settings
  const { data: pricingData, isLoading: pricingLoading } = useQuery({
    queryKey: ['/api/parent/pricing', user?.id],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/parent/pricing');
      return response.json();
    },
    enabled: !!user?.id
  });

  // Fetch current subscription status
  const { data: subscriptionData, isLoading: subLoading } = useQuery({
    queryKey: ['/api/parent/subscription', user?.id],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/parent/subscription');
      return response.json();
    },
    enabled: !!user?.id
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async ({ planType }: { planType: string }) => {
      const response = await apiRequest('POST', '/api/parent/subscribe', { planType, paymentMethod: 'pending' });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/parent/subscription'] });
      queryClient.invalidateQueries({ queryKey: ['/api/parent/pricing'] });
      toast({
        title: language === 'fr' ? 'Succès' : 'Success',
        description: data.message
      });
      setSubscribingTo(null);
    },
    onError: () => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Échec de l\'abonnement' : 'Subscription failed',
        variant: 'destructive'
      });
      setSubscribingTo(null);
    }
  });

  const text = {
    fr: {
      title: 'Mon Abonnement',
      subtitle: 'Gérer vos abonnements pour le suivi de vos enfants',
      communication: 'Communication',
      communicationDesc: 'Ouvrir la passerelle de communication avec l\'école',
      geolocation: 'Géolocalisation',
      geolocationDesc: 'Suivre la position de votre enfant en temps réel',
      perYear: '/an',
      free: 'Gratuit',
      subscribe: 'S\'abonner',
      active: 'Actif',
      inactive: 'Inactif',
      discount: 'Réduction',
      children: 'enfants',
      child: 'enfant',
      familyDiscount: 'Réduction Famille',
      features: 'Fonctionnalités incluses',
      commFeature1: 'Notifications de l\'école (SMS/Email/WhatsApp)',
      commFeature2: 'Messages des enseignants',
      commFeature3: 'Alertes de présence',
      commFeature4: 'Réception des bulletins',
      commFeature5: 'Support bilingue',
      geoFeature1: 'Position en temps réel',
      geoFeature2: 'Historique des déplacements',
      geoFeature3: 'Zones de sécurité',
      geoFeature4: 'Alertes d\'entrée/sortie',
      geoFeature5: 'Bouton d\'urgence',
      noChildren: 'Connectez d\'abord vos enfants pour voir les tarifs',
      loading: 'Chargement...',
      yourChildren: 'Vos enfants',
      finalPrice: 'Prix final',
      basePrice: 'Prix de base'
    },
    en: {
      title: 'My Subscription',
      subtitle: 'Manage your subscriptions for tracking your children',
      communication: 'Communication',
      communicationDesc: 'Open the communication gateway with the school',
      geolocation: 'Geolocation',
      geolocationDesc: 'Track your child\'s location in real-time',
      perYear: '/year',
      free: 'Free',
      subscribe: 'Subscribe',
      active: 'Active',
      inactive: 'Inactive',
      discount: 'Discount',
      children: 'children',
      child: 'child',
      familyDiscount: 'Family Discount',
      features: 'Included features',
      commFeature1: 'School notifications (SMS/Email/WhatsApp)',
      commFeature2: 'Teacher messages',
      commFeature3: 'Attendance alerts',
      commFeature4: 'Bulletin reception',
      commFeature5: 'Bilingual support',
      geoFeature1: 'Real-time location',
      geoFeature2: 'Movement history',
      geoFeature3: 'Safety zones',
      geoFeature4: 'Entry/exit alerts',
      geoFeature5: 'Emergency button',
      noChildren: 'Connect your children first to see pricing',
      loading: 'Loading...',
      yourChildren: 'Your children',
      finalPrice: 'Final price',
      basePrice: 'Base price'
    }
  };

  const t = text[language as keyof typeof text] || text.fr;

  const isLoading = pricingLoading || subLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">{t.loading}</span>
      </div>
    );
  }

  const pricing = pricingData?.pricing || {
    communication: { enabled: true, price: 5000, period: 'annual' },
    geolocation: { enabled: true, price: 5000, period: 'annual' },
    discounts: { twoChildren: 20, threePlusChildren: 40 }
  };
  const childCount = pricingData?.childCount || 0;

  // Calculate discount
  let discountPercent = 0;
  if (childCount === 2) {
    discountPercent = pricing.discounts.twoChildren;
  } else if (childCount >= 3) {
    discountPercent = pricing.discounts.threePlusChildren;
  }

  const calcFinalPrice = (basePrice: number) => {
    if (basePrice === 0) return 0;
    return Math.round(basePrice * (1 - discountPercent / 100));
  };

  const formatPrice = (price: number) => {
    if (price === 0) return t.free;
    return `${price.toLocaleString()} CFA${t.perYear}`;
  };

  const handleSubscribe = (planType: string) => {
    setSubscribingTo(planType);
    subscribeMutation.mutate({ planType });
  };

  // Check if already subscribed
  const hasCommunication = subscriptionData?.hasCommunication || false;
  const hasGeolocation = subscriptionData?.hasGeolocation || false;

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
        <p className="text-gray-600 mt-1">{t.subtitle}</p>
      </div>

      {/* Children Count & Discount Info */}
      {childCount > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="font-semibold text-purple-900">
                    {t.yourChildren}: {childCount} {childCount > 1 ? t.children : t.child}
                  </p>
                  {discountPercent > 0 && (
                    <p className="text-sm text-purple-700">
                      {t.familyDiscount}: -{discountPercent}%
                    </p>
                  )}
                </div>
              </div>
              {discountPercent > 0 && (
                <Badge className="bg-purple-600 text-white">
                  -{discountPercent}% {t.discount}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {childCount === 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <p className="text-yellow-800 text-center">{t.noChildren}</p>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Communication Plan */}
        {pricing.communication.enabled && (
          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors" data-testid="card-plan-communication">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                {t.communication}
              </CardTitle>
              <p className="text-blue-100 text-sm">{t.communicationDesc}</p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Pricing */}
              <div className="text-center py-4 bg-blue-50 rounded-lg">
                {discountPercent > 0 && pricing.communication.price > 0 && (
                  <p className="text-sm text-gray-500 line-through">
                    {t.basePrice}: {pricing.communication.price.toLocaleString()} CFA
                  </p>
                )}
                <p className="text-3xl font-bold text-blue-600">
                  {formatPrice(calcFinalPrice(pricing.communication.price))}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <p className="font-medium text-gray-700">{t.features}:</p>
                <ul className="space-y-2">
                  {[t.commFeature1, t.commFeature2, t.commFeature3, t.commFeature4, t.commFeature5].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Subscribe Button */}
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={hasCommunication || subscribingTo === 'communication' || childCount === 0}
                onClick={() => handleSubscribe('communication')}
                data-testid="button-subscribe-communication"
              >
                {subscribingTo === 'communication' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : hasCommunication ? (
                  <Shield className="w-4 h-4 mr-2" />
                ) : null}
                {hasCommunication ? t.active : t.subscribe}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Geolocation Plan */}
        {pricing.geolocation.enabled && (
          <Card className="border-2 border-green-200 hover:border-green-400 transition-colors" data-testid="card-plan-geolocation">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-6 h-6" />
                {t.geolocation}
              </CardTitle>
              <p className="text-green-100 text-sm">{t.geolocationDesc}</p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Pricing */}
              <div className="text-center py-4 bg-green-50 rounded-lg">
                {discountPercent > 0 && pricing.geolocation.price > 0 && (
                  <p className="text-sm text-gray-500 line-through">
                    {t.basePrice}: {pricing.geolocation.price.toLocaleString()} CFA
                  </p>
                )}
                <p className="text-3xl font-bold text-green-600">
                  {formatPrice(calcFinalPrice(pricing.geolocation.price))}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <p className="font-medium text-gray-700">{t.features}:</p>
                <ul className="space-y-2">
                  {[t.geoFeature1, t.geoFeature2, t.geoFeature3, t.geoFeature4, t.geoFeature5].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Subscribe Button */}
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={hasGeolocation || subscribingTo === 'geolocation' || childCount === 0}
                onClick={() => handleSubscribe('geolocation')}
                data-testid="button-subscribe-geolocation"
              >
                {subscribingTo === 'geolocation' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : hasGeolocation ? (
                  <Shield className="w-4 h-4 mr-2" />
                ) : null}
                {hasGeolocation ? t.active : t.subscribe}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Family Discount Info */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-900">{t.familyDiscount}</p>
              <p className="text-sm text-amber-700">
                2 {t.children}: -{pricing.discounts.twoChildren}% | 3+ {t.children}: -{pricing.discounts.threePlusChildren}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact for Help */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600">
                {language === 'fr' ? 'Besoin d\'aide ?' : 'Need help?'}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => window.open('https://wa.me/237699999999?text=Bonjour, j\'ai besoin d\'aide avec mon abonnement Educafric', '_blank')}
              data-testid="button-contact-whatsapp"
            >
              WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentSubscription;

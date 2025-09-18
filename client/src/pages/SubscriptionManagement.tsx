import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Shield, 
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpCircle,
  Phone,
  Mail,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionInfo {
  subscription: any;
  features: {
    features: string[];
    restrictions: string[];
    planName: string;
    isFreemium: boolean;
  };
  isSandbox: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'school' | 'freelancer';
  price: number;
  currency: string;
  billing: 'annual' | 'monthly';
  features: string[];
  limitations?: {
    maxStudents?: number;
    maxTeachers?: number;
    maxClasses?: number;
  };
  isActive: boolean;
}

interface UsageStats {
  students: number;
  teachers: number;
  classes: number;
  parents: number;
}

export default function SubscriptionManagement() {
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats>({ students: 0, teachers: 0, classes: 0, parents: 0 });
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptionInfo();
    fetchAvailablePlans();
  }, []);

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await fetch('/api/subscription/info');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription info:', error);
    }
  };

  const fetchAvailablePlans = async () => {
    try {
      const response = await fetch('/api/subscription/plans');
      if (response.ok) {
        const data = await response.json();
        setAvailablePlans(data.plans);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setUpgradeLoading(true);
    try {
      const response = await fetch('/api/subscription/create-upgrade-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        const error = await response.json();
        toast({
          title: 'Erreur de mise à niveau',
          description: error.message || 'Impossible de créer la session de paiement',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à niveau',
        variant: 'destructive'
      });
    } finally {
      setUpgradeLoading(false);
    }
  };

  const getPlanIcon = (type: string) => {
    switch (type) {
      case 'school': return <GraduationCap className="h-6 w-6" />;
      case 'freelancer': return <BookOpen className="h-6 w-6" />;
      default: return <Crown className="h-6 w-6" />;
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === 'XAF' ? 'EUR' : currency,
      minimumFractionDigits: 0
    }).format(currency === 'XAF' ? price : price / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Abonnements</h1>
            <p className="text-gray-600 mt-2">
              Gérez votre abonnement et découvrez les fonctionnalités premium
            </p>
          </div>
          {subscriptionInfo?.isSandbox && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Shield className="h-4 w-4 mr-1" />
              Mode Sandbox
            </Badge>
          )}
        </div>

        {/* Current Subscription Status */}
        {subscriptionInfo && (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="h-8 w-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-xl">
                      {subscriptionInfo.features.planName}
                    </CardTitle>
                    <CardDescription>
                      {subscriptionInfo.features.isFreemium 
                        ? 'Plan gratuit avec fonctionnalités limitées'
                        : 'Plan premium avec toutes les fonctionnalités'}
                    </CardDescription>
                  </div>
                </div>
                <Badge 
                  variant={subscriptionInfo.features.isFreemium ? 'secondary' : 'default'}
                  className="text-lg px-4 py-2"
                >
                  {subscriptionInfo.features.isFreemium ? 'Freemium' : 'Premium'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Features */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Fonctionnalités incluses
                  </h3>
                  <ul className="space-y-2">
                    {subscriptionInfo.features.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Restrictions */}
                {subscriptionInfo.features.restrictions.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      Limitations
                    </h3>
                    <ul className="space-y-2">
                      {subscriptionInfo.features.restrictions.map((restriction, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                          {restriction}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {subscriptionInfo.features.isFreemium && !subscriptionInfo.isSandbox && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <ArrowUpCircle className="h-6 w-6 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-blue-900">Passez en Premium</h4>
                      <p className="text-blue-700 text-sm">
                        Débloquez toutes les fonctionnalités avancées et supprimez les limitations
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Plans Available */}
        <Tabs defaultValue="school" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="school" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Plans École
            </TabsTrigger>
            <TabsTrigger value="freelancer" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Plans Répétiteur
            </TabsTrigger>
          </TabsList>

          <TabsContent value="school" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePlans
                .filter(plan => plan.type === 'school')
                .map((plan) => (
                  <Card key={plan.id} className="relative hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getPlanIcon(plan.type)}
                          <div>
                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                            <CardDescription>Plan annuel</CardDescription>
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatPrice(plan.price, plan.currency)}
                        <span className="text-sm font-normal text-gray-600">/an</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        {plan.features.slice(0, 6).map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                        {plan.features.length > 6 && (
                          <li className="text-sm text-gray-600">
                            +{plan.features.length - 6} autres fonctionnalités
                          </li>
                        )}
                      </ul>
                      
                      {!subscriptionInfo?.isSandbox && (
                        <Button 
                          className="w-full"
                          onClick={() => handleUpgrade(plan.id)}
                          disabled={upgradeLoading}
                          data-testid={`button-upgrade-${plan.id}`}
                        >
                          {upgradeLoading ? (
                            <CreditCard className="h-4 w-4 text-blue-600 animate-pulse" />
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Choisir ce plan
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="freelancer" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availablePlans
                .filter(plan => plan.type === 'freelancer')
                .map((plan) => (
                  <Card key={plan.id} className="relative hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getPlanIcon(plan.type)}
                          <div>
                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                            <CardDescription>
                              Plan {plan.billing === 'monthly' ? 'mensuel' : 'annuel'}
                              {plan.billing === 'annual' && (
                                <Badge variant="outline" className="ml-2 text-green-600">
                                  2 mois gratuits
                                </Badge>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatPrice(plan.price, plan.currency)}
                        <span className="text-sm font-normal text-gray-600">
                          /{plan.billing === 'monthly' ? 'mois' : 'an'}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {plan.limitations && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Limites du plan :</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {plan.limitations.maxStudents && (
                              <li>• Jusqu'à {plan.limitations.maxStudents} élèves</li>
                            )}
                            {plan.limitations.maxClasses && (
                              <li>• Jusqu'à {plan.limitations.maxClasses} classes</li>
                            )}
                          </ul>
                        </div>
                      )}
                      
                      {!subscriptionInfo?.isSandbox && (
                        <Button 
                          className="w-full"
                          onClick={() => handleUpgrade(plan.id)}
                          disabled={upgradeLoading}
                          data-testid={`button-upgrade-${plan.id}`}
                        >
                          {upgradeLoading ? (
                            <CreditCard className="h-4 w-4 text-blue-600 animate-pulse" />
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Choisir ce plan
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Besoin d'aide ?
            </CardTitle>
            <CardDescription>
              Contactez notre équipe pour plus d'informations sur nos plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-600" />
                <span className="font-medium">+237 657 004 011</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="font-medium">admin@educafric.com</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sandbox Warning */}
        {subscriptionInfo?.isSandbox && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                <div>
                  <h3 className="font-medium text-orange-900">Mode Sandbox</h3>
                  <p className="text-orange-700 text-sm">
                    Vous êtes en mode démonstration avec toutes les fonctionnalités débloquées. 
                    Les mises à niveau ne sont pas disponibles en mode sandbox.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
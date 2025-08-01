import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  MapPin, 
  Users, 
  GraduationCap, 
  UserCheck, 
  Clock, 
  Shield, 
  Bell,
  BarChart3,
  CheckCircle
} from 'lucide-react';

const GeolocationPricingPlans = () => {
  const { language } = useLanguage();

  const text = {
    fr: {
      title: 'Tarifs Géolocalisation EDUCAFRIC',
      subtitle: 'Solutions de suivi GPS pour l\'éducation africaine',
      description: 'Sécurisez vos enfants et élèves avec notre système de géolocalisation avancé',
      parentPlan: 'Plan Parents',
      schoolPlan: 'Plan Écoles',
      freelancerPlan: 'Plan Freelancers',
      monthly: 'Mensuel',
      annually: 'Annuel',
      choosePlan: 'Choisir ce Plan',
      savings: 'Économie de 2 000 CFA',
      features: {
        parent: [
          'Suivi temps réel des enfants',
          'Alertes SMS automatiques',
          'Zones de sécurité personnalisées',
          'Historique des déplacements',
          'Notifications d\'arrivée/départ',
          'Bouton panique d\'urgence',
          'Support technique 24/7'
        ],
        school: [
          'Surveillance complète du campus',
          'Suivi de tous les élèves',
          'Rapports de présence automatiques',
          'Alertes de sécurité avancées',
          'Tableaux de bord administratifs',
          'Intégration avec système scolaire',
          'Formation équipe incluse'
        ],
        freelancer: [
          'Suivi élèves à domicile',
          'Calcul automatique des distances',
          'Vérification de présence',
          'Rapports pour parents',
          'Planning optimisé par localisation',
          'Facturation basée sur déplacements',
          'Interface mobile optimisée'
        ]
      }
    },
    en: {
      title: 'EDUCAFRIC Geolocation Pricing',
      subtitle: 'GPS tracking solutions for African education',
      description: 'Secure your children and students with our advanced geolocation system',
      parentPlan: 'Parent Plan',
      schoolPlan: 'School Plan',
      freelancerPlan: 'Freelancer Plan',
      monthly: 'Monthly',
      annually: 'Annually',
      choosePlan: 'Choose This Plan',
      savings: 'Save 2,000 CFA',
      features: {
        parent: [
          'Real-time child tracking',
          'Automatic SMS alerts',
          'Personalized safety zones',
          'Movement history',
          'Arrival/departure notifications',
          'Emergency panic button',
          '24/7 technical support'
        ],
        school: [
          'Complete campus surveillance',
          'Track all students',
          'Automatic attendance reports',
          'Advanced security alerts',
          'Administrative dashboards',
          'School system integration',
          'Team training included'
        ],
        freelancer: [
          'Home student tracking',
          'Automatic distance calculation',
          'Attendance verification',
          'Parent reports',
          'Location-optimized scheduling',
          'Travel-based billing',
          'Mobile-optimized interface'
        ]
      }
    }
  };

  const t = text[language];

  const plans = [
    {
      id: 'parent',
      name: t.parentPlan,
      icon: <Users className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      monthlyPrice: '1 500',
      annualPrice: '15 000',
      duration: '1 mois',
      annualDuration: '1 an',
      features: t?.features?.parent,
      stripeIds: {
        monthly: 'parent_geolocation_monthly',
        annual: 'parent_geolocation_annual'
      }
    },
    {
      id: 'school',
      name: t.schoolPlan,
      icon: <GraduationCap className="w-8 h-8" />,
      color: 'from-green-500 to-green-600',
      annualPrice: '35 000',
      duration: '1 an',
      features: t?.features?.school,
      stripeIds: {
        annual: 'school_geolocation'
      },
      recommended: true
    },
    {
      id: 'freelancer',
      name: t.freelancerPlan,
      icon: <UserCheck className="w-8 h-8" />,
      color: 'from-purple-500 to-purple-600',
      annualPrice: '20 000',
      duration: '1 an',
      features: t?.features?.freelancer,
      stripeIds: {
        annual: 'freelancer_geolocation'
      }
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full mb-6">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Géolocalisation GPS
            </span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t.title || ''}
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {t.description || ''}
          </p>
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
            📊 Comparaison des Plans
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Profil</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Tarif</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Durée</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Fonctionnalités</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 font-medium text-blue-600">Parent</td>
                  <td className="px-6 py-4 text-gray-900">1 500 CFA</td>
                  <td className="px-6 py-4 text-gray-600">1 mois</td>
                  <td className="px-6 py-4 text-gray-600">Suivi enfants, alertes SMS, zones sécurité</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="px-6 py-4 font-medium text-green-600">École</td>
                  <td className="px-6 py-4 text-gray-900">35 000 CFA</td>
                  <td className="px-6 py-4 text-gray-600">1 an</td>
                  <td className="px-6 py-4 text-gray-600">Surveillance campus, tous élèves, rapports</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-purple-600">Freelancer</td>
                  <td className="px-6 py-4 text-gray-900">20 000 CFA</td>
                  <td className="px-6 py-4 text-gray-600">1 an</td>
                  <td className="px-6 py-4 text-gray-600">Suivi domicile, calcul distances, présence</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {(Array.isArray(plans) ? plans : []).map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.recommended ? 'border-2 border-green-400 shadow-2xl scale-105' : 'border border-gray-200 shadow-lg'} bg-white`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Recommandé
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-full flex items-center justify-center mb-4 mx-auto text-white`}>
                  {plan.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900">{plan.name || ''}</h3>
                
                <div className="mt-4">
                  {plan.monthlyPrice && (
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-gray-900">
                        {plan.monthlyPrice} <span className="text-lg text-gray-500">CFA</span>
                      </div>
                      <div className="text-gray-600">/{t.monthly}</div>
                    </div>
                  )}
                  
                  <div className={plan.monthlyPrice ? 'border-t pt-4' : ''}>
                    <div className="text-3xl font-bold text-gray-900">
                      {plan.annualPrice} <span className="text-lg text-gray-500">CFA</span>
                    </div>
                    <div className="text-gray-600">/{plan.annualDuration || t.annually}</div>
                    {plan.monthlyPrice && (
                      <div className="text-sm text-green-600 font-medium mt-1">
                        {t.savings}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {(Array.isArray(plan.features) ? plan.features : []).map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-semibold py-3`}
                  size="lg"
                >
                  {t.choosePlan}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Sécurité Maximale</h4>
                <p className="text-gray-600 text-sm">Cryptage end-to-end et conformité RGPD</p>
              </div>
              
              <div className="text-center">
                <Bell className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Alertes Temps Réel</h4>
                <p className="text-gray-600 text-sm">Notifications instantanées SMS et push</p>
              </div>
              
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Rapports Détaillés</h4>
                <p className="text-gray-600 text-sm">Analytics et statistiques avancées</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GeolocationPricingPlans;
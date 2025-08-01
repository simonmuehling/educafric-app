import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Check, Star, Users, School, Briefcase } from 'lucide-react';
import { Link } from 'wouter';

export default function ModernSubscriptionPlans() {
  const { language } = useLanguage();

  // Scroll to this section if URL has #pricing hash
  React.useEffect(() => {
    if (window?.location?.hash === '#pricing') {
      setTimeout(() => {
        document.getElementById('pricing-section')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, []);

  const text = {
    en: {
      title: 'Choose Your Plan',
      subtitle: 'Promotional launch pricing for Cameroon - Valid until December 31, 2025',
      mostPopular: 'Most Popular',
      getStarted: 'Get Started',
      contactSales: 'Contact Sales',
      perMonth: '/month',
      perYear: '/year',
      publicSchoolParent: 'Public School Parent',
      privateSchoolParent: 'Private School Parent',
      independentTeacher: 'Independent Teacher',
      publicSchool: 'Public School',
      privateSchool: 'Private School',
      gpsTracking: 'GPS Tracking Included',
      features: {
        publicParent: [
          'Individual student tracking',
          'Real-time notifications (absences, grades)', 
          'GPS location tracking & safety zones',
          'Digital report cards access',
          'Direct teacher communication',
          'School calendar events',
          '20% discount for 2+ children'
        ],
        privateParent: [
          'Individual student tracking',
          'Real-time notifications (absences, grades)',
          'Advanced GPS tracking & geofencing',
          'Emergency panic button alerts',
          'Digital report cards access', 
          'Priority parent-teacher communication',
          'School calendar events',
          '20% discount for 2+ children'
        ],
        teacher: [
          'Private tutoring interface',
          'Schedule management & planning',
          'Student location tracking during sessions',
          'Personalized progress tracking',
          'Direct parent communication',
          'Integrated billing system',
          'Semester or annual payment options'
        ],
        publicSchool: [
          'Unlimited student access',
          'Complete class & subject management',
          'Attendance system with notifications',
          'Digital report cards',
          'Parent-teacher communication',
          'Complete administrative dashboard',
          'Priority technical support'
        ],
        privateSchool: [
          'Unlimited student access',
          'Complete class & subject management',
          'Attendance system with notifications',
          'Digital report cards',
          'Parent-teacher communication',
          'Complete administrative dashboard',
          'Priority technical support'
        ]
      }
    },
    fr: {
      title: 'Choisissez Votre Formule',
      subtitle: 'Tarifs promotionnels de lancement pour le Cameroun - Valable jusqu\'au 31 décembre 2025',
      mostPopular: 'Le Plus Populaire',
      getStarted: 'Commencer',
      contactSales: 'Contacter les Ventes',
      perMonth: '/mois',
      perYear: '/an',
      publicSchoolParent: 'Parents École Publique',
      privateSchoolParent: 'Parents École Privée',
      independentTeacher: 'Enseignant Indépendant',
      publicSchool: 'Établissement Public',
      privateSchool: 'Établissement Privé',
      geolocalisationGPS: 'Géolocalisation GPS Incluse',
      features: {
        parent: [
          'Surveiller plusieurs enfants',
          'Notifications SMS/WhatsApp en temps réel',
          'Bulletins de notes et présence',
          'Messagerie parent-enseignant',
          'Support bilingue (FR/EN)'
        ],
        school: [
          'Étudiants et enseignants illimités',
          'Tableau de bord analytique avancé',
          'Bulletins africains personnalisés',
          'SMS et WhatsApp en masse',
          'Traitement des paiements',
          'Support multi-langues',
          'Support prioritaire 24/7'
        ],
        publicParent: [
          'Suivi individuel de l\'élève',
          'Notifications en temps réel (absences, notes)',
          'Géolocalisation GPS et zones de sécurité',
          'Accès aux bulletins numériques',
          'Communication directe avec les enseignants',
          'Calendrier des événements scolaires',
          'Réduction de 20% pour 2+ enfants'
        ],
        privateParent: [
          'Suivi individuel de l\'élève',
          'Notifications en temps réel (absences, notes)',
          'GPS avancé et géofencing',
          'Bouton panique d\'urgence',
          'Accès aux bulletins numériques',
          'Communication prioritaire parent-enseignant',
          'Calendrier des événements scolaires',
          'Réduction de 20% pour 2+ enfants'
        ],
        teacher: [
          'Interface dédiée aux cours particuliers',
          'Gestion des horaires et planification',
          'Géolocalisation des élèves pendant les sessions',
          'Suivi personnalisé des progrès',
          'Communication directe avec les parents',
          'Facturation intégrée',
          'Choix de paiement : annuel ou semestriel'
        ],
        publicSchool: [
          'Accès illimité pour tous les élèves',
          'Gestion complète des classes et matières',
          'Géolocalisation de tous les élèves',
          'Système d\'appel avec notifications automatiques',
          'Bulletins de notes numériques',
          'Communication parents-enseignants',
          'Tableau de bord administratif complet',
          'Support technique prioritaire'
        ],
        privateSchool: [
          'Accès illimité pour tous les élèves',
          'Gestion complète des classes et matières',
          'Géolocalisation avancée avec alertes',
          'Système d\'appel avec notifications automatiques',
          'Bulletins de notes numériques',
          'Communication parents-enseignants',
          'Tableau de bord administratif complet',
          'Support technique prioritaire premium'
        ]
      }
    }
  };

  const t = text[language];

  const plans = [
    {
      id: 'public-parent',
      name: t.publicSchoolParent,
      price: 1000,
      priceAnnual: 12000,
      currency: 'CFA',
      period: 'month',
      icon: <Users className="w-8 h-8" />,
      features: t?.features?.publicParent,
      popular: false,
      gradient: 'from-blue-500 to-cyan-500',
      href: '/subscribe',
      stripeProductId: 'price_public_parent_monthly'
    },
    {
      id: 'private-parent',
      name: t.privateSchoolParent,
      price: 1500,
      priceAnnual: 18000,
      currency: 'CFA',
      period: 'month',
      icon: <Users className="w-8 h-8" />,
      features: t?.features?.privateParent,
      popular: true,
      gradient: 'from-purple-500 to-pink-500',
      href: '/subscribe',
      stripeProductId: 'price_private_parent_monthly'
    },
    {
      id: 'teacher',
      name: t.independentTeacher,
      price: 25000,
      priceSemester: 12500,
      currency: 'CFA',
      period: 'year',
      icon: <Briefcase className="w-8 h-8" />,
      features: t?.features?.teacher,
      popular: false,
      gradient: 'from-green-500 to-teal-500',
      href: '/subscribe',
      stripeProductId: 'price_teacher_annual'
    },
    {
      id: 'public-school',
      name: t.publicSchool,
      price: 50000,
      currency: 'CFA',
      period: 'year',
      icon: <School className="w-8 h-8" />,
      features: t?.features?.publicSchool,
      popular: false,
      gradient: 'from-orange-500 to-red-500',
      href: '/subscribe',
      stripeProductId: 'price_public_school_annual'
    },
    {
      id: 'private-school',
      name: t.privateSchool,
      price: 100000,
      currency: 'CFA',
      period: 'year',
      icon: <School className="w-8 h-8" />,
      features: t?.features?.privateSchool,
      popular: false,
      gradient: 'from-indigo-500 to-purple-500',
      href: '/subscribe',
      stripeProductId: 'price_private_school_annual'
    }
  ];

  return (
    <section id="pricing-section" className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">{t.title || ''}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* GPS Tracking Feature Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-center text-white mb-12 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-2">
            {language === 'fr' ? 'Géolocalisation GPS Incluse' : 'GPS Tracking Included'}
          </h3>
          <p className="text-blue-100 mb-4">
            {language === 'fr' 
              ? 'Suivi en temps réel • Zones de sécurité • Notifications d\'urgence • Optimisé pour les réseaux africains'
              : 'Real-time tracking • Safety zones • Emergency alerts • Optimized for African networks'
            }
          </p>
          <a 
            href="/geolocation-pricing" 
            className="inline-block bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-blue-50 transition-colors"
          >
            {language === 'fr' ? 'Voir les Options GPS' : 'View GPS Options'}
          </a>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {(Array.isArray(plans) ? plans : []).map((plan, index) => (
            <div
              key={plan.id}
              className={`modern-card p-8 text-center relative ${
                plan.popular ? 'scale-105 ring-2 ring-purple-500' : ''
              }`}
              style={{ 
                background: `var(--card-gradient-${index + 1})`,
                animationDelay: `${index * 200}ms`
              }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                    <Star className="w-4 h-4" />
                    <span>{t.mostPopular}</span>
                  </div>
                </div>
              )}

              {/* Plan Icon */}
              <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r ${plan.gradient} rounded-2xl flex items-center justify-center text-white`}>
                {plan.icon}
              </div>

              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {plan.name || ''}
              </h3>

              {/* Price */}
              <div className="mb-8">
                <div className="text-4xl font-bold text-gray-800 mb-2">
                  <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md">
                    {plan?.price?.toLocaleString()} {plan.currency}
                  </span>
                </div>
                <div className="text-gray-600">
                  {language === 'fr' ? '/' : '/'}
                  {plan.period === 'month' ? t.perMonth?.replace('/', '') : t.perYear?.replace('/', '')}
                  {plan.period === 'month' && plan.priceAnnual && (
                    <div className="text-sm text-green-600 mt-1">
                      ({plan?.priceAnnual?.toLocaleString()} {plan.currency}{t.perYear})
                    </div>
                  )}
                  {plan.priceSemester && (
                    <div className="text-sm text-blue-600 mt-1">
                      {language === 'fr' ? 'ou' : 'or'} {plan?.priceSemester?.toLocaleString()} {plan.currency}/semestre
                    </div>
                  )}
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8 text-left">
                {(Array.isArray(plan.features) ? plan.features : []).map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link href={plan.href}>
                <Button 
                  className={`gradient-btn w-full ${
                    plan.popular ? 'pulse-animation' : ''
                  }`}
                >
                  {plan.popular ? t.contactSales : t.getStarted}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Family Pricing Examples */}
        <div className="bg-white rounded-2xl p-8 mt-12 max-w-4xl mx-auto border border-gray-200">
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
            {language === 'fr' ? 'Structure Tarifaire Familiale' : 'Family Pricing Structure'}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-blue-600 mb-4">
                {language === 'fr' ? 'École Publique' : 'Public School'}
              </h4>
              <ul className="space-y-2 text-sm">
                <li>1 {language === 'fr' ? 'enfant' : 'child'}: <span className="font-bold text-red-600">12,000 CFA</span>/an</li>
                <li>2 {language === 'fr' ? 'enfants' : 'children'}: <span className="font-bold text-red-600">19,200 CFA</span>/an (-20%)</li>
                <li>3+ {language === 'fr' ? 'enfants' : 'children'}: <span className="font-bold text-red-600">21,600 CFA</span>/an (-40%)</li>
              </ul>
            </div>
            
            <div className="text-center">
              <h4 className="text-lg font-semibold text-purple-600 mb-4">
                {language === 'fr' ? 'École Privée' : 'Private School'}
              </h4>
              <ul className="space-y-2 text-sm">
                <li>1 {language === 'fr' ? 'enfant' : 'child'}: <span className="font-bold text-red-600">18,000 CFA</span>/an</li>
                <li>2 {language === 'fr' ? 'enfants' : 'children'}: <span className="font-bold text-red-600">28,800 CFA</span>/an (-20%)</li>
                <li>3+ {language === 'fr' ? 'enfants' : 'children'}: <span className="font-bold text-red-600">32,400 CFA</span>/an (-40%)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-2">
            <strong className="text-green-600">
              {language === 'fr' 
                ? 'TARIFS PROMOTIONNELS DE LANCEMENT - Valable jusqu\'au 31 décembre 2025'
                : 'PROMOTIONAL LAUNCH PRICING - Valid until December 31, 2025'
              }
            </strong>
          </p>
          <p className="text-gray-600">
            {language === 'fr' 
              ? 'Tous les plans incluent le support bilingue français/anglais et sont optimisés pour les réseaux camerounais.'
              : 'All plans include French/English bilingual support and are optimized for Cameroonian networks.'
            }
          </p>
        </div>
      </div>
    </section>
  );
}
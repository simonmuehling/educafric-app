import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Check, Crown, School, Users, BookOpen, MessageCircle, Bell, Shield, Smartphone, Cloud } from 'lucide-react';
import { Link } from 'wouter';

export default function FreemiumPricingPlans() {
  const { language } = useLanguage();

  const text = {
    en: {
      title: 'Freemium Information for African Schools',
      subtitle: 'Educational Freemium Model',
      freeAccess: 'TARIFS ÉCOLES',
      freeDescription: 'Plan Premium pour écoles africaines :',
      premiumSubscription: 'PREMIUM SUBSCRIPTION (50,000 CFA/year)',
      premiumDescription: 'Unlock all school management features:',
      getStarted: 'Commencer',
      upgradeToPremium: 'Upgrade to Premium',
      features: {
        free: [
          'Complete user management - Teachers, students, parents',
          'Academic system - Grades, timetables, attendance',
          'Professional communication - SMS, notifications, messaging',
          'Financial management - Fees tracking, payment management',
          'Advanced technology - Mobile PWA, cloud storage',
          'Fonctionnalités premium complètes',
          'Paiement annuel : 50,000 CFA',
          'Support technique inclus'
        ],
        premium: {
          userManagement: {
            title: 'Complete User Management',
            items: [
              'Teacher, student and parent management',
              'User account creation and modification',
              'Transfer users between schools',
              'Account blocking/unblocking',
              'User status management'
            ]
          },
          academicSystem: {
            title: 'Complete Academic System',
            items: [
              'Grade management and digital report cards',
              'Interactive timetables',
              'Student attendance tracking',
              'Curriculum management',
              'Basic academic reports',
              'Performance analytics'
            ]
          },
          communication: {
            title: 'Professional Communication',
            items: [
              'Direct parent-school communication',
              'Automatic SMS messages',
              'Advanced push notifications',
              'Teaching team communication',
              'System announcements'
            ]
          },
          financial: {
            title: 'Financial Management',
            items: [
              'General financial overview',
              'School fees tracking',
              'Basic financial reports',
              'Parent payment management'
            ]
          },
          technology: {
            title: 'Advanced Technology',
            items: [
              'Mobile PWA interface',
              'Secure cloud storage',
              'Standard technical support',
              'Automatic backup'
            ]
          }
        }
      }
    },
    fr: {
      title: 'Information Freemium pour les Écoles Africaines',
      subtitle: 'Modèle Freemium Éducatif',
      freeAccess: 'TARIFS ÉCOLES',
      freeDescription: 'Plan Premium pour écoles africaines :',
      premiumSubscription: 'ABONNEMENT PREMIUM (50,000 CFA/an)',
      premiumDescription: 'Débloquez toutes les fonctionnalités de gestion scolaire :',
      getStarted: 'Commencer',
      upgradeToPremium: 'Passer au Premium',
      features: {
        free: [
          'Gestion complète des utilisateurs - Enseignants, élèves, parents',
          'Système académique - Notes, emplois du temps, présences',
          'Communication professionnelle - SMS, notifications, messagerie',
          'Gestion financière - Suivi des frais, gestion des paiements',
          'Technologie avancée - PWA mobile, stockage cloud',
          'Fonctionnalités premium complètes',
          'Paiement annuel : 50,000 CFA',
          'Support technique inclus'
        ],
        premium: {
          userManagement: {
            title: 'Gestion Complète des Utilisateurs',
            items: [
              'Gestion des enseignants, élèves et parents',
              'Création et modification des comptes utilisateurs',
              'Transfert d\'utilisateurs entre écoles',
              'Blocage/déblocage des comptes',
              'Gestion des statuts utilisateurs'
            ]
          },
          academicSystem: {
            title: 'Système Académique Complet',
            items: [
              'Gestion des notes et bulletins numériques',
              'Emploi du temps interactif',
              'Suivi des présences élèves',
              'Gestion du curriculum',
              'Rapports académiques de base',
              'Analytiques de performance'
            ]
          },
          communication: {
            title: 'Communication Professionnelle',
            items: [
              'Communication directe parents-école',
              'Messages SMS automatiques',
              'Notifications push avancées',
              'Communication équipe enseignante',
              'Annonces système'
            ]
          },
          financial: {
            title: 'Gestion Financière',
            items: [
              'Aperçu financier général',
              'Suivi des frais scolaires',
              'Rapports financiers de base',
              'Gestion des paiements parents'
            ]
          },
          technology: {
            title: 'Technologie Avancée',
            items: [
              'Interface mobile PWA',
              'Stockage cloud sécurisé',
              'Support technique standard',
              'Sauvegarde automatique'
            ]
          }
        }
      }
    }
  };

  const t = text[language];

  const premiumSections = [
    {
      key: 'userManagement',
      icon: <Users className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      key: 'academicSystem',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      key: 'communication',
      icon: <MessageCircle className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      key: 'financial',
      icon: <Shield className="w-6 h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      key: 'technology',
      icon: <Cloud className="w-6 h-6" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">{t.title || ''}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Freemium Plans Grid */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          
          {/* FREE TRIAL */}
          <div className="modern-card p-8 relative">
            {/* Free Plan Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white">
                <School className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {t.freeAccess}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {t.freeDescription}
              </p>
            </div>

            {/* Free Features List */}
            <div className="space-y-4 mb-8">
              {t.features.free.map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>

            {/* Free CTA Button */}
            <Link href="/register">
              <Button className="gradient-btn w-full">
                {t.getStarted}
              </Button>
            </Link>
          </div>

          {/* PREMIUM PLAN */}
          <div className="modern-card p-8 relative scale-105 ring-2 ring-purple-500">
            {/* Premium Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                <Crown className="w-4 h-4" />
                <span>Premium</span>
              </div>
            </div>

            {/* Premium Plan Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white">
                <School className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {t.premiumSubscription}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {t.premiumDescription}
              </p>
            </div>

            {/* Premium Features Sections */}
            <div className="space-y-6 mb-8">
              {(Array.isArray(premiumSections) ? premiumSections : []).map((section, idx) => {
                const sectionData = t.features.premium[section.key as keyof typeof t.features.premium];
                return (
                  <div key={idx} className={`${section.bgColor} rounded-lg p-4`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`${section.color}`}>
                        {section.icon}
                      </div>
                      <h4 className={`font-semibold ${section.color}`}>
                        {sectionData.title || ''}
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {sectionData.items .map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-start space-x-2">
                          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                          <span className="text-gray-700 text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Premium CTA Button */}
            <Link href="/subscribe?plan=school-premium">
              <Button className="gradient-btn w-full pulse-animation">
                {t.upgradeToPremium}
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-2">
            <strong className="text-green-600">
              {language === 'fr' 
                ? '1 MOIS GRATUIT pour tout nouveau client'
                : '1 MONTH FREE for all new customers'
              }
            </strong>
          </p>
          <p className="text-gray-600">
            {language === 'fr' 
              ? 'Aucune obligation d\'engagement • Accès complet à toutes les fonctionnalités • Support technique inclus • Formation gratuite pour la prise en main'
              : 'No commitment required • Full access to all features • Technical support included • Free training for getting started'
            }
          </p>
        </div>
      </div>
    </section>
  );
}
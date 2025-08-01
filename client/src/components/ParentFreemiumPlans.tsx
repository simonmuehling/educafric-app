import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Check, Crown, Users, MessageCircle, Bell, BookOpen, Calendar, CreditCard, BarChart } from 'lucide-react';
import { Link } from 'wouter';

export default function ParentFreemiumPlans() {
  const { language } = useLanguage();

  const text = {
    en: {
      title: 'Freemium Information for African Parents',
      subtitle: 'Parent Freemium Model',
      freeAccess: 'TARIFS PARENTS',
      freeDescription: 'Choisissez le plan adapté à votre école :',
      publicSchoolPlan: 'Public School Parents',
      privateSchoolPlan: 'Private School Parents',
      getStarted: 'Commencer',
      upgradeToPremium: 'Choose Plan',
      monthlyPrice: '/month',
      annualPrice: '/year',
      annualSavings: 'Save 2,000 CFA/year',
      features: {
        free: [
          'Profile creation - Create and manage your parent profile',
          'Profile management - Edit your personal information',
          'Basic communication - Basic messaging system',
          'View announcements - Check school announcements',
          'Basic notifications - Essential notifications',
          'Password reset - Account recovery',
          'Language switching - French/English',
          'Basic support - Standard customer support'
        ],
        publicSchool: [
          'Child progress tracking - Real-time academic monitoring',
          'Teacher communication - Direct messaging with teachers',
          'SMS notifications - Important alerts via SMS',
          'Real-time grades - Instant grade updates',
          'Attendance tracking - Monitor student absences',
          'Homework tracking - Assignment monitoring',
          'School calendar access - Events and schedules',
          'Payment tracking - Manage school fees',
          'Basic reports - Student performance reports',
          'French/English support - Bilingual interface'
        ],
        privateSchool: [
          'All Public School features PLUS:',
          'Premium SMS notifications - Enhanced messaging',
          'Priority support - Faster response times',
          'Detailed reports - Complete analytics',
          'Advanced parent dashboard - Enhanced parent interface'
        ]
      }
    },
    fr: {
      title: 'Information Freemium pour les Parents Africains',
      subtitle: 'Modèle Freemium Parents',
      freeAccess: 'TARIFS PARENTS',
      freeDescription: 'Choisissez le plan adapté à votre école :',
      publicSchoolPlan: 'Parents École Publique',
      privateSchoolPlan: 'Parents École Privée',
      getStarted: 'Commencer',
      upgradeToPremium: 'Choisir un Plan',
      monthlyPrice: '/mois',
      annualPrice: '/an',
      annualSavings: 'Économie 2,000 CFA/an',
      features: {
        free: [
          'Création de profil - Créez et gérez votre profil parent',
          'Gestion du profil - Modifiez vos informations personnelles',
          'Communication de base - Système de messagerie basique',
          'Voir les annonces - Consultez les annonces de l\'école',
          'Notifications de base - Notifications essentielles',
          'Réinitialisation du mot de passe - Récupération de compte',
          'Basculement de langue - Français/Anglais',
          'Support de base - Support client standard'
        ],
        publicSchool: [
          'Suivi des progrès de l\'enfant - Surveillance académique en temps réel',
          'Communication avec les enseignants - Messagerie directe avec les enseignants',
          'Notifications SMS - Alertes importantes via SMS',
          'Notes en temps réel - Mises à jour instantanées des notes',
          'Suivi des présences - Surveillance des absences élèves',
          'Suivi des devoirs - Suivi des assignments',
          'Accès au calendrier scolaire - Événements et horaires',
          'Suivi des paiements - Gestion des frais scolaires',
          'Rapports de base - Rapports de performance élève',
          'Support français/anglais - Interface bilingue'
        ],
        privateSchool: [
          'Toutes les fonctionnalités École Publique PLUS :',
          'Notifications SMS premium - Messagerie améliorée',
          'Support prioritaire - Temps de réponse plus rapides',
          'Rapports détaillés - Analytics complètes',
          'Tableau de bord avancé - Interface parent améliorée'
        ]
      }
    }
  };

  const t = text[language];

  return (
    <section className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">{t.title || ''}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Parent Freemium Plans Grid */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {/* FREE TRIAL */}
          <div className="modern-card p-8 relative">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white">
                <Users className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {t.freeAccess}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {t.freeDescription}
              </p>
            </div>

            {/* Free Features List */}
            <div className="space-y-3 mb-8">
              {t.features.free.map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>

            <Link href="/register?role=parent">
              <Button className="gradient-btn w-full">
                {t.getStarted}
              </Button>
            </Link>
          </div>

          {/* PUBLIC SCHOOL PARENTS */}
          <div className="modern-card p-8 relative">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white">
                <BookOpen className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {t.publicSchoolPlan}
              </h3>
              
              {/* Pricing */}
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md">
                    1,500 CFA
                  </span>
                  <span className="text-lg text-gray-600 ml-2">{t.monthlyPrice}</span>
                </div>
                <div className="text-sm text-green-600">
                  15,000 CFA{t.annualPrice} • {t.annualSavings}
                </div>
              </div>
            </div>

            {/* Public School Features */}
            <div className="space-y-3 mb-8">
              {t.features.publicSchool.map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>

            <Link href="/subscribe?plan=public-parent">
              <Button className="gradient-btn w-full">
                {t.upgradeToPremium}
              </Button>
            </Link>
          </div>

          {/* PRIVATE SCHOOL PARENTS */}
          <div className="modern-card p-8 relative scale-105 ring-2 ring-purple-500">
            {/* Premium Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                <Crown className="w-4 h-4" />
                <span>Premium</span>
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white">
                <BarChart className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {t.privateSchoolPlan}
              </h3>
              
              {/* Pricing */}
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md">
                    2,000 CFA
                  </span>
                  <span className="text-lg text-gray-600 ml-2">{t.monthlyPrice}</span>
                </div>
                <div className="text-sm text-green-600">
                  20,000 CFA{t.annualPrice}
                </div>
              </div>
            </div>

            {/* Private School Features */}
            <div className="space-y-3 mb-8">
              {t.features.privateSchool.map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <Link href="/subscribe?plan=private-parent">
              <Button className="gradient-btn w-full pulse-animation">
                {t.upgradeToPremium}
              </Button>
            </Link>
          </div>
        </div>

        {/* Family Discount Information */}
        <div className="bg-white rounded-2xl p-8 mt-12 max-w-4xl mx-auto border border-gray-200">
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
            {language === 'fr' ? 'Réductions Familiales' : 'Family Discounts'}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-blue-600 mb-4">
                {language === 'fr' ? 'École Publique' : 'Public School'}
              </h4>
              <ul className="space-y-2 text-sm">
                <li>1 {language === 'fr' ? 'enfant' : 'child'}: <span className="font-bold text-red-600">15,000 CFA</span>/an</li>
                <li>2 {language === 'fr' ? 'enfants' : 'children'}: <span className="font-bold text-red-600">24,000 CFA</span>/an (-20%)</li>
                <li>3+ {language === 'fr' ? 'enfants' : 'children'}: <span className="font-bold text-red-600">27,000 CFA</span>/an (-40%)</li>
              </ul>
            </div>
            
            <div className="text-center">
              <h4 className="text-lg font-semibold text-purple-600 mb-4">
                {language === 'fr' ? 'École Privée' : 'Private School'}
              </h4>
              <ul className="space-y-2 text-sm">
                <li>1 {language === 'fr' ? 'enfant' : 'child'}: <span className="font-bold text-red-600">20,000 CFA</span>/an</li>
                <li>2 {language === 'fr' ? 'enfants' : 'children'}: <span className="font-bold text-red-600">32,000 CFA</span>/an (-20%)</li>
                <li>3+ {language === 'fr' ? 'enfants' : 'children'}: <span className="font-bold text-red-600">36,000 CFA</span>/an (-40%)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-2">
            <strong className="text-green-600">
              {language === 'fr' 
                ? '1 MOIS GRATUIT pour tout nouveau parent'
                : '1 MONTH FREE for all new parents'
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
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Check, Crown, BookOpen, Users, MessageCircle, BarChart, Calendar, CreditCard, FileText, GraduationCap } from 'lucide-react';
import { Link } from 'wouter';

export default function TeacherFreelanceFreemiumPlans() {
  const { language } = useLanguage();

  const text = {
    en: {
      title: 'Freemium Information for African Freelance Teachers',
      subtitle: 'Freelance Teacher Freemium Model',
      freeAccess: 'TARIFS ENSEIGNANTS',
      freeDescription: 'Plans pour enseignants freelance africains :',
      semesterPlan: 'Freelance Teacher Semester',
      annualPlan: 'Freelance Teacher Annual',
      getStarted: 'Commencer',
      choosePlan: 'Choose Plan',
      perSemester: '/semester (6 months)',
      perYear: '/year',
      savings: 'Save 2 months',
      features: {
        free: [
          'Profile creation - Create and manage your freelance teacher profile',
          'Profile management - Edit your professional information',
          'Basic communication - Basic messaging system',
          'View announcements - Check teaching opportunities',
          'Basic notifications - Essential notifications',
          'Password reset - Account recovery',
          'Language switching - French/English',
          'Basic support - Standard customer support'
        ],
        semester: [
          'Class management - Complete course and session organization',
          'Grade tracking - Student evaluation and grading system',
          'Parent communication - Direct messaging with families',
          'Progress reports - Detailed student progress reports',
          'Lesson planning - Planning and organization tools',
          'Student management - Complete student database',
          'Payment tracking - Fee and invoice management',
          'Integrated calendar - Session and appointment scheduling',
          'Teaching materials - Resource storage and sharing',
          'French/English support - Complete bilingual interface'
        ],
        annual: [
          'All Semester features PLUS:',
          'Priority support - Privileged technical assistance',
          'Advanced analytics - Detailed performance insights',
          'Enhanced teaching tools - Premium educational resources',
          'Extended storage - Increased material storage capacity'
        ]
      }
    },
    fr: {
      title: 'Information Freemium pour les Enseignants Freelance Africains',
      subtitle: 'Modèle Freemium Enseignants Freelance',
      freeAccess: 'TARIFS ENSEIGNANTS',
      freeDescription: 'Plans pour enseignants freelance africains :',
      semesterPlan: 'Enseignant Freelance Semestriel',
      annualPlan: 'Enseignant Freelance Annuel',
      getStarted: 'Commencer',
      choosePlan: 'Choisir un Plan',
      perSemester: '/semestre (6 mois)',
      perYear: '/an',
      savings: 'Économie de 2 mois',
      features: {
        free: [
          'Création de profil - Créez et gérez votre profil enseignant freelance',
          'Gestion du profil - Modifiez vos informations professionnelles',
          'Communication de base - Système de messagerie basique',
          'Voir les annonces - Consultez les opportunités d\'enseignement',
          'Notifications de base - Notifications essentielles',
          'Réinitialisation du mot de passe - Récupération de compte',
          'Basculement de langue - Français/Anglais',
          'Support de base - Support client standard'
        ],
        semester: [
          'Gestion des classes - Organisation complète des cours et sessions',
          'Suivi des notes - Système d\'évaluation et notation des élèves',
          'Communication avec les parents - Messagerie directe avec les familles',
          'Rapports de progression - Rapports détaillés sur les progrès des élèves',
          'Planification des cours - Outils de planification et organisation',
          'Gestion des élèves - Base de données complète des élèves',
          'Suivi des paiements - Gestion des honoraires et factures',
          'Calendrier intégré - Planification des sessions et rendez-vous',
          'Matériel pédagogique - Stockage et partage de ressources',
          'Support français/anglais - Interface bilingue complète'
        ],
        annual: [
          'Toutes les fonctionnalités Semestrielles PLUS :',
          'Support prioritaire - Assistance technique privilégiée',
          'Analyses avancées - Aperçus détaillés des performances',
          'Outils d\'enseignement améliorés - Ressources éducatives premium',
          'Stockage étendu - Capacité de stockage accrue pour le matériel'
        ]
      }
    }
  };

  const t = text[language];

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">{t.title || ''}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Teacher Freelance Plans Grid */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {/* FREE TRIAL */}
          <div className="modern-card p-8 relative">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white">
                <GraduationCap className="w-8 h-8" />
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
              {(Array.isArray(t.features.free) ? t.features.free : []).map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>

            <Link href="/register?role=teacher">
              <Button className="gradient-btn w-full">
                {t.getStarted}
              </Button>
            </Link>
          </div>

          {/* SEMESTER PLAN */}
          <div className="modern-card p-8 relative">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white">
                <BookOpen className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {t.semesterPlan}
              </h3>
              
              {/* Pricing */}
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md">
                    15,000 CFA
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {t.perSemester}
                </div>
              </div>
            </div>

            {/* Semester Features */}
            <div className="space-y-3 mb-8">
              {(Array.isArray(t.features.semester) ? t.features.semester : []).map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>

            <Link href="/subscribe?plan=teacher-semester">
              <Button className="gradient-btn w-full">
                {t.choosePlan}
              </Button>
            </Link>
          </div>

          {/* ANNUAL PLAN */}
          <div className="modern-card p-8 relative scale-105 ring-2 ring-green-500">
            {/* Premium Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                <Crown className="w-4 h-4" />
                <span>{t.savings}</span>
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white">
                <BarChart className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {t.annualPlan}
              </h3>
              
              {/* Pricing */}
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md">
                    30,000 CFA
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {t.perYear}
                </div>
                <div className="text-sm text-green-600 font-medium mt-1">
                  Économie de 5,000 CFA vs 2x semestre
                </div>
              </div>
            </div>

            {/* Annual Features */}
            <div className="space-y-3 mb-8">
              {(Array.isArray(t.features.annual) ? t.features.annual : []).map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <Link href="/subscribe?plan=teacher-annual">
              <Button className="gradient-btn w-full pulse-animation">
                {t.choosePlan}
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-white rounded-2xl p-8 mt-12 max-w-5xl mx-auto border border-gray-200">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-800">
            {language === 'fr' ? 'Fonctionnalités Clés pour Enseignants Freelance' : 'Key Features for Freelance Teachers'}
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">
                {language === 'fr' ? 'Gestion Élèves' : 'Student Management'}
              </h4>
              <p className="text-sm text-gray-600">
                {language === 'fr' 
                  ? 'Base de données complète des élèves avec suivi personnalisé'
                  : 'Complete student database with personalized tracking'
                }
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">
                {language === 'fr' ? 'Communication Parents' : 'Parent Communication'}
              </h4>
              <p className="text-sm text-gray-600">
                {language === 'fr' 
                  ? 'Messagerie directe avec les familles pour un suivi optimal'
                  : 'Direct messaging with families for optimal follow-up'
                }
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">
                {language === 'fr' ? 'Planification' : 'Planning'}
              </h4>
              <p className="text-sm text-gray-600">
                {language === 'fr' 
                  ? 'Outils de planification et calendrier intégré'
                  : 'Planning tools and integrated calendar'
                }
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">
                {language === 'fr' ? 'Gestion Paiements' : 'Payment Management'}
              </h4>
              <p className="text-sm text-gray-600">
                {language === 'fr' 
                  ? 'Suivi des honoraires et gestion des factures'
                  : 'Fee tracking and invoice management'
                }
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto mb-4 bg-teal-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">
                {language === 'fr' ? 'Rapports' : 'Reports'}
              </h4>
              <p className="text-sm text-gray-600">
                {language === 'fr' 
                  ? 'Rapports détaillés sur les progrès des élèves'
                  : 'Detailed reports on student progress'
                }
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto mb-4 bg-indigo-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">
                {language === 'fr' ? 'Matériel Pédagogique' : 'Teaching Materials'}
              </h4>
              <p className="text-sm text-gray-600">
                {language === 'fr' 
                  ? 'Stockage et partage de ressources éducatives'
                  : 'Storage and sharing of educational resources'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-2">
            <strong className="text-green-600">
              {language === 'fr' 
                ? '1 MOIS GRATUIT pour tout nouvel enseignant freelance'
                : '1 MONTH FREE for all new freelance teachers'
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
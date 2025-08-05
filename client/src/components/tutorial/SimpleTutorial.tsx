import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Users, Calendar, ClipboardCheck, BarChart3, FileText, BookOpen, MessageCircle, User, Building2, DollarSign, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface SimpleTutorialProps {
  isVisible: boolean;
  userRole: string;
  onClose: () => void;
}

export function SimpleTutorial({ isVisible, userRole, onClose }: SimpleTutorialProps) {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isVisible) return null;

  // Role-specific tutorial content based on EDUCAFRIC 2025 presentation
  const getStepsForRole = (role: string) => {
    const roleSteps = {
      'Teacher': [
        {
          title: { 
            fr: '👨‍🏫 Bienvenue, Enseignant !', 
            en: '👨‍🏫 Welcome, Teacher!' 
          },
          content: { 
            fr: 'Accédez à 8 modules puissants : Mes Classes, Emploi du Temps, Présences, Notes, Devoirs, Bulletins (Premium), Communications et Mon Profil.',
            en: 'Access 8 powerful modules: My Classes, Timetable, Attendance, Grades, Assignments, Report Cards (Premium), Communications, and My Profile.'
          },
          icon: Users,
          color: 'bg-blue-500'
        },
        {
          title: { 
            fr: '📊 Gestion des Classes', 
            en: '📊 Class Management' 
          },
          content: { 
            fr: 'Mes Classes : Gérez tous vos élèves assignés, consultez les statistiques de classe et accédez rapidement aux profils étudiants.',
            en: 'My Classes: Manage all your assigned students, view class statistics, and quickly access student profiles.'
          },
          icon: Users,
          color: 'bg-blue-500'
        },
        {
          title: { 
            fr: '✅ Suivi Présences', 
            en: '✅ Attendance Tracking' 
          },
          content: { 
            fr: 'Présences : Marquez les présences quotidiennes, suivez les retards et générez des rapports d\'assiduité automatiquement.',
            en: 'Attendance: Mark daily attendance, track tardiness, and generate attendance reports automatically.'
          },
          icon: ClipboardCheck,
          color: 'bg-orange-500'
        },
        {
          title: { 
            fr: '📝 Notes & Devoirs', 
            en: '📝 Grades & Assignments' 
          },
          content: { 
            fr: 'Notes : Saisissez les notes, créez des évaluations et notifiez automatiquement les parents. Devoirs : Créez et gérez les devoirs avec pièces jointes.',
            en: 'Grades: Enter grades, create assessments, and automatically notify parents. Assignments: Create and manage homework with file attachments.'
          },
          icon: BarChart3,
          color: 'bg-red-500'
        },
        {
          title: { 
            fr: '💼 Fonctionnalités Premium', 
            en: '💼 Premium Features' 
          },
          content: { 
            fr: 'Bulletins Premium : Générez des bulletins détaillés avec commentaires et évaluations comportementales. 7 fonctions gratuites + 1 premium.',
            en: 'Premium Report Cards: Generate detailed report cards with comments and behavioral assessments. 7 free features + 1 premium.'
          },
          icon: BookOpen,
          color: 'bg-purple-500'
        }
      ],
      'Student': [
        {
          title: { 
            fr: '🎓 Bienvenue, Étudiant !', 
            en: '🎓 Welcome, Student!' 
          },
          content: { 
            fr: 'Découvrez vos 13 modules : 5 gratuits (Paramètres, Emploi du Temps, Notes de base, Devoirs de base, Guide) et 8 premium avancés.',
            en: 'Discover your 13 modules: 5 free (Settings, Schedule View, Basic Grades, Basic Homework, User Guide) and 8 advanced premium features.'
          },
          icon: User,
          color: 'bg-green-500'
        },
        {
          title: { 
            fr: '📚 Fonctions Gratuites', 
            en: '📚 Free Features' 
          },
          content: { 
            fr: 'Accès gratuit : Consultez votre emploi du temps, vos notes de base, vos devoirs et gérez votre profil personnel.',
            en: 'Free access: View your timetable, basic grades, basic homework, and manage your personal profile.'
          },
          icon: Calendar,
          color: 'bg-blue-500'
        },
        {
          title: { 
            fr: '⭐ Premium Avancé', 
            en: '⭐ Advanced Premium' 
          },
          content: { 
            fr: 'Premium : Notes détaillées, devoirs complets avec soumission, bulletins officiels, suivi de progression et géolocalisation sécurisée.',
            en: 'Premium: Detailed grades, complete homework with submission, official report cards, progress tracking, and secure geolocation.'
          },
          icon: BarChart3,
          color: 'bg-purple-500'
        },
        {
          title: { 
            fr: '💬 Communications', 
            en: '💬 Communications' 
          },
          content: { 
            fr: 'Communications Premium : Échangez avec vos enseignants, recevez des notifications instantanées et accédez aux modules d\'apprentissage.',
            en: 'Premium Communications: Chat with your teachers, receive instant notifications, and access learning modules.'
          },
          icon: MessageCircle,
          color: 'bg-teal-500'
        },
        {
          title: { 
            fr: '🏆 Réussite Académique', 
            en: '🏆 Academic Success' 
          },
          content: { 
            fr: 'Suivi complet : Analysez vos progrès, consultez vos présences en temps réel et utilisez les outils d\'apprentissage avancés.',
            en: 'Complete tracking: Analyze your progress, view real-time attendance, and use advanced learning tools.'
          },
          icon: BarChart3,
          color: 'bg-indigo-500'
        }
      ],
      'Commercial': [
        {
          title: { 
            fr: '💼 Bienvenue, Commercial !', 
            en: '💼 Welcome, Sales Rep!' 
          },
          content: { 
            fr: 'Accédez à 6 modules commerciaux essentiels : Mes Écoles, Contacts, Paiements, Documents & Contrats, Statistiques et Rendez-vous.',
            en: 'Access 6 essential commercial modules: My Schools, Contacts, Payments, Documents & Contracts, Statistics, and Appointments.'
          },
          icon: Building2,
          color: 'bg-blue-600'
        },
        {
          title: { 
            fr: '🏫 Gestion CRM', 
            en: '🏫 CRM Management' 
          },
          content: { 
            fr: 'Mes Écoles : Gérez les écoles partenaires, suivez les prospects et optimisez vos relations clients avec un CRM complet.',
            en: 'My Schools: Manage partner schools, track prospects, and optimize client relationships with complete CRM.'
          },
          icon: Building2,
          color: 'bg-blue-500'
        },
        {
          title: { 
            fr: '💰 Paiements & Contrats', 
            en: '💰 Payments & Contracts' 
          },
          content: { 
            fr: 'Confirmez les paiements, gérez les transactions, accédez aux documents commerciaux et suivez les contrats actifs.',
            en: 'Confirm payments, manage transactions, access commercial documents, and track active contracts.'
          },
          icon: DollarSign,
          color: 'bg-green-500'
        },
        {
          title: { 
            fr: '📊 Analytics Avancés', 
            en: '📊 Advanced Analytics' 
          },
          content: { 
            fr: 'Statistiques : Suivez les nouveaux prospects, taux de conversion, revenus et performances avec des métriques détaillées.',
            en: 'Statistics: Track new leads, conversion rates, revenue, and performance with detailed metrics.'
          },
          icon: BarChart3,
          color: 'bg-purple-500'
        },
        {
          title: { 
            fr: '🎯 Outils Professionnels', 
            en: '🎯 Professional Tools' 
          },
          content: { 
            fr: 'Rendez-vous : Planifiez des meetings clients, suivez les appels et gérez votre pipeline commercial avec efficacité.',
            en: 'Appointments: Schedule client meetings, track calls, and manage your sales pipeline efficiently.'
          },
          icon: Calendar,
          color: 'bg-orange-500'
        }
      ],
      'Parent': [
        {
          title: { 
            fr: '👨‍👩‍👧‍👦 Bienvenue, Parent !', 
            en: '👨‍👩‍👧‍👦 Welcome, Parent!' 
          },
          content: { 
            fr: 'Suivez la scolarité de vos enfants avec 11 modules : 4 gratuits de base et 7 premium pour un suivi complet.',
            en: 'Track your children\'s education with 11 modules: 4 basic free features and 7 premium for complete monitoring.'
          },
          icon: Users,
          color: 'bg-pink-500'
        },
        {
          title: { 
            fr: '🔒 Sécurité & Localisation', 
            en: '🔒 Safety & Location' 
          },
          content: { 
            fr: 'Géolocalisation Premium : Suivez la position de vos enfants en temps réel, recevez des alertes de sécurité et définissez des zones sûres.',
            en: 'Premium Geolocation: Track your children\'s location in real-time, receive safety alerts, and set safe zones.'
          },
          icon: MessageCircle,
          color: 'bg-red-500'
        },
        {
          title: { 
            fr: '📚 Suivi Académique', 
            en: '📚 Academic Monitoring' 
          },
          content: { 
            fr: 'Surveillez les notes, présences, devoirs et bulletins de vos enfants. Communiquez directement avec les enseignants.',
            en: 'Monitor your children\'s grades, attendance, homework, and report cards. Communicate directly with teachers.'
          },
          icon: BarChart3,
          color: 'bg-blue-500'
        },
        {
          title: { 
            fr: '💳 Gestion Financière', 
            en: '💳 Financial Management' 
          },
          content: { 
            fr: 'Paiements Premium : Gérez les frais scolaires, recevez des rappels automatiques et suivez l\'historique des paiements.',
            en: 'Premium Payments: Manage school fees, receive automatic reminders, and track payment history.'
          },
          icon: DollarSign,
          color: 'bg-green-500'
        },
        {
          title: { 
            fr: '📱 Notifications Intelligentes', 
            en: '📱 Smart Notifications' 
          },
          content: { 
            fr: 'Recevez des notifications SMS, WhatsApp et PWA pour rester informé en temps réel de la scolarité de vos enfants.',
            en: 'Receive SMS, WhatsApp, and PWA notifications to stay informed in real-time about your children\'s education.'
          },
          icon: MessageCircle,
          color: 'bg-indigo-500'
        }
      ]
    };

    return roleSteps[role as keyof typeof roleSteps] || roleSteps['Student'];
  };

  const steps = getStepsForRole(userRole);

  const currentStepData = steps[currentStep];
  const t = currentStepData.title[language as keyof typeof currentStepData.title];
  const content = currentStepData.content[language as keyof typeof currentStepData.content];
  const IconComponent = currentStepData.icon;
  const iconColor = currentStepData.color;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2">
      <Card className="w-[95vw] sm:w-[420px] max-w-[95vw] shadow-2xl border-2 border-blue-200 bg-white">
        <CardHeader className="pb-2 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 ${iconColor} rounded-xl flex items-center justify-center shadow-md`}>
                <IconComponent className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-gray-900 leading-tight">
                  {t}
                </h3>
                <span className="text-xs text-gray-500">
                  {language === 'fr' ? `Étape ${currentStep + 1}/${steps.length}` : `Step ${currentStep + 1}/${steps.length}`}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
              data-testid="button-close-tutorial"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Enhanced Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ease-in-out ${iconColor.replace('bg-', 'bg-gradient-to-r from-').replace('-500', '-400 to-'+ iconColor.split('-')[1] + '-600')}`}
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          
          {/* Step indicators */}
          <div className="flex justify-between mt-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index <= currentStep ? iconColor : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="px-4 py-3">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-800 leading-relaxed">
              {content}
            </p>
          </div>

          {/* Enhanced Navigation buttons */}
          <div className="flex justify-between items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2 text-xs h-8 px-3 border-gray-300 hover:border-gray-400 disabled:opacity-50"
              data-testid="button-previous-step"
            >
              <ArrowLeft className="h-3 w-3" />
              {language === 'fr' ? 'Précédent' : 'Previous'}
            </Button>

            {/* Role indicator */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-gray-600">
                {userRole === 'Teacher' ? (language === 'fr' ? 'Enseignant' : 'Teacher') :
                 userRole === 'Student' ? (language === 'fr' ? 'Étudiant' : 'Student') :
                 userRole === 'Parent' ? (language === 'fr' ? 'Parent' : 'Parent') :
                 userRole === 'Commercial' ? (language === 'fr' ? 'Commercial' : 'Sales') :
                 userRole}
              </span>
              <span className="text-xs text-gray-400">
                {currentStep + 1} / {steps.length}
              </span>
            </div>

            <Button
              onClick={handleNext}
              size="sm"
              className={`flex items-center gap-2 text-xs h-8 px-3 text-white transition-all duration-200 ${iconColor} hover:shadow-lg`}
              data-testid="button-next-step"
            >
              {currentStep === steps.length - 1 
                ? (language === 'fr' ? 'Terminer' : 'Finish')
                : (language === 'fr' ? 'Suivant' : 'Next')
              }
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Users, Calendar, ClipboardCheck, BarChart3, FileText, BookOpen, MessageCircle, MessageSquare, User, Building2, DollarSign, Settings, UserCheck, Clock, CheckCircle, UserX, Bell, Shield, Video } from 'lucide-react';
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

  // Role-specific tutorial content - UPDATED AUTOMATICALLY for EDUCAFRIC 2025
  const getStepsForRole = (role: string) => {
    const roleSteps = {
      'Director': [
        {
          title: { 
            fr: '🏫 Bienvenue dans EDUCAFRIC 2025', 
            en: '🏫 Welcome to EDUCAFRIC 2025' 
          },
          content: { 
            fr: 'Ce tutoriel vous présente les 18 modules du tableau de bord Directeur. Cliquez sur "Suivant" pour découvrir chaque module et ses fonctionnalités.',
            en: 'This tutorial presents the 18 modules of the Director dashboard. Click "Next" to discover each module and its features.'
          },
          icon: Building2,
          color: 'bg-gradient-to-r from-blue-600 to-purple-600'
        },
        {
          title: { 
            fr: '⚙️ Profil Directeur', 
            en: '⚙️ Director Profile' 
          },
          content: { 
            fr: 'Gérez votre profil personnel : informations de contact, photo, préférences de notification, sécurité du compte, et paramètres de langue (Français/English).',
            en: 'Manage your personal profile: contact information, photo, notification preferences, account security, and language settings (Français/English).'
          },
          icon: Settings,
          color: 'bg-gray-500'
        },
        {
          title: { 
            fr: '📚 Classes', 
            en: '📚 Classes' 
          },
          content: { 
            fr: 'Créez et gérez les classes de votre école : niveaux personnalisables, salles, effectifs, matières enseignées. Import Excel massif disponible avec validation automatique.',
            en: 'Create and manage your school classes: customizable levels, rooms, class sizes, subjects taught. Bulk Excel import available with automatic validation.'
          },
          icon: BookOpen,
          color: 'bg-orange-500'
        },
        {
          title: { 
            fr: '👨‍🏫 Enseignants', 
            en: '👨‍🏫 Teachers' 
          },
          content: { 
            fr: 'Ajoutez et gérez les enseignants : coordonnées, matières enseignées, classes assignées, horaires. Import Excel pour ajout massif. Les enseignants reçoivent automatiquement leurs identifiants.',
            en: 'Add and manage teachers: contact details, subjects taught, assigned classes, schedules. Excel import for bulk addition. Teachers automatically receive their credentials.'
          },
          icon: UserCheck,
          color: 'bg-green-500'
        },
        {
          title: { 
            fr: '👥 Élèves', 
            en: '👥 Students' 
          },
          content: { 
            fr: 'Gérez les élèves de votre école : inscription, informations personnelles, classe assignée, coordonnées des parents. Import Excel massif avec validation automatique des données.',
            en: 'Manage your school students: enrollment, personal information, assigned class, parent contact details. Bulk Excel import with automatic data validation.'
          },
          icon: Users,
          color: 'bg-purple-500'
        },
        {
          title: { 
            fr: '🕐 Emploi du temps', 
            en: '🕐 Schedule' 
          },
          content: { 
            fr: 'Créez l\'emploi du temps de votre école : horaires par classe, enseignants assignés, salles, matières. Visualisation graphique et notifications automatiques aux enseignants.',
            en: 'Create your school schedule: timetables by class, assigned teachers, rooms, subjects. Graphical visualization and automatic teacher notifications.'
          },
          icon: Clock,
          color: 'bg-pink-500'
        },
        {
          title: { 
            fr: '📅 Export Calendrier', 
            en: '📅 Calendar Export' 
          },
          content: { 
            fr: 'Exportez les événements scolaires au format iCal/ICS : cours, examens, réunions. Compatible avec Google Calendar, Outlook, Apple Calendar. Synchronisation automatique.',
            en: 'Export school events in iCal/ICS format: classes, exams, meetings. Compatible with Google Calendar, Outlook, Apple Calendar. Automatic synchronization.'
          },
          icon: Calendar,
          color: 'bg-blue-500'
        },
        {
          title: { 
            fr: '✅ Présence École', 
            en: '✅ School Attendance' 
          },
          content: { 
            fr: 'Suivez les présences à l\'échelle de l\'école : statistiques par classe, élèves absents, retards. Rapports quotidiens, hebdomadaires et mensuels. Notifications automatiques aux parents.',
            en: 'Track school-wide attendance: statistics by class, absent students, tardiness. Daily, weekly and monthly reports. Automatic parent notifications.'
          },
          icon: CheckCircle,
          color: 'bg-yellow-500'
        },
        {
          title: { 
            fr: '💬 Communications', 
            en: '💬 Communications' 
          },
          content: { 
            fr: 'Envoyez des messages à toute la communauté scolaire : annonces générales, alertes urgentes, newsletters. Multicanal : Email, WhatsApp, notifications PWA. Historique complet.',
            en: 'Send messages to the entire school community: general announcements, urgent alerts, newsletters. Multi-channel: Email, WhatsApp, PWA notifications. Complete history.'
          },
          icon: MessageSquare,
          color: 'bg-indigo-500'
        },
        {
          title: { 
            fr: '👤❌ Absences Profs', 
            en: '👤❌ Teacher Absences' 
          },
          content: { 
            fr: 'Gérez les absences des enseignants : déclaration, justificatifs, remplacement automatique, notification aux classes concernées. Statistiques et rapports d\'assiduité.',
            en: 'Manage teacher absences: declaration, supporting documents, automatic replacement, notification to affected classes. Statistics and attendance reports.'
          },
          icon: UserX,
          color: 'bg-red-500'
        },
        {
          title: { 
            fr: '📄 Demandes Parents', 
            en: '📄 Parent Requests' 
          },
          content: { 
            fr: 'Traitez les demandes des parents : rendez-vous, certificats, autorisations, réclamations. Système de tickets avec suivi, notifications automatiques et historique complet.',
            en: 'Process parent requests: appointments, certificates, authorizations, complaints. Ticket system with tracking, automatic notifications and complete history.'
          },
          icon: FileText,
          color: 'bg-teal-500'
        },
        {
          title: { 
            fr: '📖 Contenu Pédagogique', 
            en: '📖 Educational Content' 
          },
          content: { 
            fr: 'Validez et gérez le contenu pédagogique soumis par les enseignants : cours, exercices, ressources. Approbation avant publication, commentaires, révisions.',
            en: 'Validate and manage educational content submitted by teachers: lessons, exercises, resources. Approval before publication, comments, revisions.'
          },
          icon: BookOpen,
          color: 'bg-emerald-500'
        },
        {
          title: { 
            fr: '🔔 Notifications', 
            en: '🔔 Notifications' 
          },
          content: { 
            fr: 'Centre de notifications : événements importants, alertes système, demandes en attente, nouveaux messages. Filtrage par type, marquage lu/non lu, actions rapides.',
            en: 'Notification center: important events, system alerts, pending requests, new messages. Filter by type, mark read/unread, quick actions.'
          },
          icon: Bell,
          color: 'bg-blue-600'
        },
        {
          title: { 
            fr: '🛡️ Administrateurs Délégués', 
            en: '🛡️ Delegate Administrators' 
          },
          content: { 
            fr: 'Déléguez des tâches administratives : créez des sous-comptes avec permissions spécifiques, surveilleurs, responsables de niveau, coordinateurs matières.',
            en: 'Delegate administrative tasks: create sub-accounts with specific permissions, supervisors, level coordinators, subject coordinators.'
          },
          icon: Shield,
          color: 'bg-amber-500'
        },
        {
          title: { 
            fr: '📊 Rapports', 
            en: '📊 Reports' 
          },
          content: { 
            fr: 'Consultez les rapports analytiques : statistiques présences, performances académiques, finance, communications. Export PDF et Excel. Tableaux de bord interactifs.',
            en: 'Consult analytical reports: attendance statistics, academic performance, finance, communications. PDF and Excel export. Interactive dashboards.'
          },
          icon: BarChart3,
          color: 'bg-violet-500'
        },
        {
          title: { 
            fr: '📋 Guide Configuration', 
            en: '📋 Configuration Guide' 
          },
          content: { 
            fr: 'Guide pas-à-pas pour configurer votre école : création des niveaux, classes, enseignants, emploi du temps. Liste de vérification et conseils de démarrage rapide.',
            en: 'Step-by-step guide to configure your school: creating levels, classes, teachers, schedule. Checklist and quick start tips.'
          },
          icon: Settings,
          color: 'bg-indigo-500'
        },
        {
          title: { 
            fr: '🏢 Paramètres École', 
            en: '🏢 School Settings' 
          },
          content: { 
            fr: 'Configurez votre établissement : informations générales, logo, coordonnées, années académiques, trimestres, bulletins (CBA/traditionnel), notifications automatiques.',
            en: 'Configure your institution: general information, logo, contact details, academic years, terms, report cards (CBA/traditional), automatic notifications.'
          },
          icon: Building2,
          color: 'bg-slate-600'
        },
        {
          title: { 
            fr: '🎓 Gestion Académique', 
            en: '🎓 Academic Management' 
          },
          content: { 
            fr: 'Gérez l\'aspect académique : matières, coefficients, niveaux scolaires personnalisables, compétences CBA, grilles d\'évaluation, bulletins intelligents.',
            en: 'Manage academic aspects: subjects, coefficients, customizable school levels, CBA competencies, evaluation grids, smart report cards.'
          },
          icon: BookOpen,
          color: 'bg-gradient-to-r from-blue-500 to-cyan-500'
        },
        {
          title: { 
            fr: '📹 Classes en ligne', 
            en: '📹 Online Classes' 
          },
          content: { 
            fr: 'Organisez des cours en ligne avec Jitsi Meet : salles virtuelles, planification, accès sécurisé, enregistrements. Suivi des présences et statistiques d\'engagement.',
            en: 'Organize online classes with Jitsi Meet: virtual rooms, scheduling, secure access, recordings. Attendance tracking and engagement statistics.'
          },
          icon: Video,
          color: 'bg-gradient-to-r from-purple-500 to-pink-500'
        }
      ],
      'Teacher': [
        {
          title: { 
            fr: '👨‍🏫 Bienvenue, Enseignant !', 
            en: '👨‍🏫 Welcome, Teacher!' 
          },
          content: { 
            fr: 'Accédez à vos modules EDUCAFRIC 2025 : Mes Classes avec analytics, Emploi du Temps, Présences automatisées, Notes temps réel, Devoirs numériques, Bulletins intelligents, Communications multicanal et Profil enseignant.',
            en: 'Access your EDUCAFRIC 2025 modules: My Classes with analytics, Schedule, Automated Attendance, Real-time Grades, Digital Assignments, Smart Report Cards, Multi-channel Communications and Teacher Profile.'
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
            fr: 'Mes Classes 2025 : Gérez vos élèves avec intelligence artificielle, analytics avancées, groupes adaptatifs, profils enrichis avec géolocalisation et suivi comportemental automatisé.',
            en: 'My Classes 2025: Manage your students with artificial intelligence, advanced analytics, adaptive groups, enriched profiles with geolocation and automated behavioral tracking.'
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
            fr: 'Présences 2025 : Marquage automatique via géolocalisation, reconnaissance faciale optionnelle, suivi des retards avec notifications parents instantanées SMS/WhatsApp, rapports d\'assiduité intelligents avec prédictions IA.',
            en: 'Attendance 2025: Automatic marking via geolocation, optional facial recognition, tardiness tracking with instant SMS/WhatsApp parent notifications, smart attendance reports with AI predictions.'
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
            fr: 'Notes 2025 : Saisie vocale intelligente, évaluations interactives multimédia, notifications automatiques SMS/WhatsApp parents. Devoirs : Création multimédia avancée, soumissions temps réel, correction IA assistée, feedback personnalisé automatique.',
            en: 'Grades 2025: Intelligent voice input, interactive multimedia assessments, automatic SMS/WhatsApp parent notifications. Assignments: Advanced multimedia creation, real-time submissions, AI-assisted correction, automatic personalised feedback.'
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
            fr: 'Bulletins Premium 2025 : IA générative pour commentaires personnalisés, évaluations comportementales avancées, graphiques de progression interactifs, recommandations pédagogiques automatiques, export PDF personnalisable, interface bilingue complète.',
            en: 'Premium Report Cards 2025: Generative AI for personalised comments, advanced behavioral assessments, interactive progress charts, automatic pedagogical recommendations, customisable PDF export, complete bilingual interface.'
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
            fr: 'Découvrez EDUCAFRIC 2025 : 13 modules évolués avec 5 gratuits (Paramètres avancés, Emploi du Temps interactif, Notes temps réel, Devoirs collaboratifs, Guide IA) et 8 premium avec géolocalisation, bulletins intelligents et analytics prédictifs.',
            en: 'Discover EDUCAFRIC 2025: 13 evolved modules with 5 free (Advanced Settings, Interactive Schedule, Real-time Grades, Collaborative Homework, AI Guide) and 8 premium with geolocation, smart reports, and predictive analytics.'
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
            fr: 'Premium 2025 : Notes avec analytics IA, devoirs interactifs multimédias, bulletins avec commentaires génératifs, suivi comportemental avancé, géolocalisation intelligente avec zones sécurisées et alertes automatiques.',
            en: 'Premium 2025: AI analytics grades, interactive multimedia homework, reports with generative comments, advanced behavioral tracking, smart geolocation with secure zones and automatic alerts.'
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
            fr: 'Communications 2025 : Messagerie instantanée multicanal (chat, SMS, WhatsApp), notifications intelligentes personnalisées, visioconférence intégrée, traduction automatique et modules d\'apprentissage adaptatifs avec IA.',
            en: 'Communications 2025: Multi-channel instant messaging (chat, SMS, WhatsApp), personalised smart notifications, integrated video conferencing, automatic translation, and adaptive AI learning modules.'
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
            en: 'Complete tracking: Analyse your progress, view real-time attendance, and use advanced learning tools.'
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
            fr: 'EDUCAFRIC 2025 Commercial : 6 modules CRM avancés avec IA prédictive - Mes Écoles (analytics 360°), Contacts intelligents, Paiements automatisés, Documents numériques sécurisés, Statistiques temps réel et Rendez-vous avec visioconférence.',
            en: 'EDUCAFRIC 2025 Commercial: 6 advanced CRM modules with predictive AI - My Schools (360° analytics), Smart Contacts, Automated Payments, Secure Digital Documents, Real-time Statistics, and Video Conferencing Appointments.'
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
            fr: 'EDUCAFRIC 2025 Parents : Suivi intelligent avec 11 modules évolués - 4 gratuits (profils enfants, notifications de base, communications simples, planning) et 7 premium (géolocalisation temps réel, analytics comportementales, bulletins IA, alertes prédictives).',
            en: 'EDUCAFRIC 2025 Parents: Smart tracking with 11 evolved modules - 4 free (children profiles, basic notifications, simple communications, schedule) and 7 premium (real-time geolocation, behavioral analytics, AI reports, predictive alerts).'
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
            fr: 'Géolocalisation 2025 : Suivi IA avancé avec prédiction de trajets, zones dynamiques adaptatives, alertes comportementales intelligentes, historique détaillé, reconnaissance d\'activités et notifications multicanal (SMS, WhatsApp, PWA).',
            en: 'Geolocation 2025: Advanced AI tracking with route prediction, adaptive dynamic zones, intelligent behavioral alerts, detailed history, activity recognition, and multi-channel notifications (SMS, WhatsApp, PWA).'
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
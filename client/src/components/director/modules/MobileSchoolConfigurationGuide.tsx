import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '../../../contexts/LanguageContext';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Settings, 
  Users, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  UserCheck, 
  MapPin, 
  CreditCard,
  Smartphone,
  ArrowLeft,
  Info,
  Play,
  Target,
  UserX,
  ClipboardList,
  Bell,
  Shield,
  BarChart3,
  Award,
  Video,
  FileText,
  GraduationCap
} from 'lucide-react';

interface ConfigStep {
  id: string;
  status: 'completed' | 'pending' | 'missing';
  priority: 'urgent' | 'important' | 'essential' | 'useful';
}

interface ConfigStatus {
  schoolId: number;
  overallProgress: number;
  steps: { [key: string]: string };
  missingElements: string[];
  nextRecommendedStep: string;
}

const MobileSchoolConfigurationGuide: React.FC = () => {
  const { language } = useLanguage();
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchConfigurationStatus();
  }, []);

  const fetchConfigurationStatus = async () => {
    try {
      setLoading(true);
      
      // Configuration statique pour l'affichage immédiat des guides
      const staticConfigStatus = {
        schoolId: 999,
        overallProgress: 75,
        steps: {
          'director-profile': 'completed',
          'classes': 'completed',
          'teachers': 'completed',
          'students': 'completed',
          'timetable': 'pending',
          'attendance': 'completed',
          'communications': 'pending',
          'teacher-absences': 'pending',
          'parent-requests': 'completed',
          'educational-content': 'pending',
          'notifications': 'completed',
          'administrators': 'pending',
          'school-settings': 'completed',
          'reports': 'pending',
          'academic-management': 'completed',
          'online-classes': 'pending'
        },
        missingElements: [
          'timetable',
          'communications',
          'teacher-absences',
          'educational-content',
          'administrators',
          'reports',
          'online-classes'
        ],
        nextRecommendedStep: 'timetable'
      };
      
      setConfigStatus(staticConfigStatus);
      console.log('[MOBILE_CONFIG_GUIDE] ✅ Configuration guides loaded with static data');
      
    } catch (error) {
      console.error('[MOBILE_CONFIG_GUIDE] Error loading configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const text = {
    fr: {
      title: 'Configuration École',
      subtitle: 'Guide interactif pour configurer votre école',
      progress: 'Progression',
      completed: 'Terminé',
      pending: 'En attente',
      missing: 'Manquant',
      configure: 'Configurer',
      view: 'Voir',
      backToOverview: 'Retour à la vue d\'ensemble',
      nextStep: 'Étape suivante',
      startNow: 'Commencer',
      priority: 'Priorité',
      estimatedTime: 'Temps estimé',
      description: 'Description',
      urgentPriority: 'Urgent',
      importantPriority: 'Important',
      essentialPriority: 'Essentiel',
      usefulPriority: 'Utile',
      missingElements: 'Éléments manquants',
      allConfigured: 'Tout est configuré !',
      steps: {
        'director-profile': {
          title: 'Profil Directeur',
          description: 'Configuration du profil administrateur',
          details: 'Configurez votre profil de directeur : informations personnelles, photo, signature numérique, préférences de notification et paramètres de sécurité. Définissez vos permissions d\'accès et votre rôle dans l\'établissement.',
          time: '10 min',
          instructions: [
            '1. Accédez au module "Profil Directeur"',
            '2. Complétez vos informations personnelles',
            '3. Ajoutez une photo professionnelle',
            '4. Configurez votre signature numérique',
            '5. Définissez vos préférences de notification',
            '6. Vérifiez vos paramètres de sécurité'
          ]
        },
        'classes': {
          title: 'Classes',
          description: 'Création et organisation des classes',
          details: 'Organisez votre structure pédagogique : créez les classes par niveau (6ème à Terminale), définissez les effectifs maximums, assignez les enseignants titulaires et organisez les salles de classe.',
          time: '15 min',
          instructions: [
            '1. Cliquez sur "Ajouter une classe"',
            '2. Sélectionnez le niveau (6ème, 5ème, etc.)',
            '3. Nommez la classe (ex: 6ème A, 5ème Sciences)',
            '4. Définissez l\'effectif maximum',
            '5. Assignez un enseignant titulaire',
            '6. Associez une salle de classe',
            '7. Répétez pour toutes vos classes'
          ]
        },
        'teachers': {
          title: 'Enseignants',
          description: 'Gestion du personnel enseignant',
          details: 'Enregistrez tous vos enseignants avec leurs informations complètes : matières enseignées, classes assignées, horaires, qualifications et contacts. Gérez leurs permissions d\'accès à la plateforme.',
          time: '20 min',
          instructions: [
            '1. Cliquez sur "Ajouter un enseignant"',
            '2. Saisissez les informations personnelles',
            '3. Sélectionnez les matières enseignées',
            '4. Assignez les classes',
            '5. Définissez les horaires de travail',
            '6. Ajoutez les qualifications',
            '7. Configurez l\'accès à la plateforme',
            '8. Envoyez les identifiants de connexion'
          ]
        },
        'students': {
          title: 'Élèves',
          description: 'Inscription et gestion des élèves',
          details: 'Inscrivez vos élèves dans leurs classes respectives avec toutes les informations nécessaires : état civil, contacts parents, dossier médical de base, et informations académiques. Organisez les groupes et sections.',
          time: '30 min',
          instructions: [
            '1. Préparez la liste des nouveaux élèves',
            '2. Cliquez sur "Inscrire un élève"',
            '3. Complétez l\'état civil complet',
            '4. Assignez à une classe',
            '5. Ajoutez les contacts des parents',
            '6. Renseignez les informations médicales',
            '7. Configurez les options de transport',
            '8. Validez l\'inscription'
          ]
        },
        'timetable': {
          title: 'Emploi du temps',
          description: 'Planification des horaires scolaires',
          details: 'Créez les emplois du temps pour chaque classe et enseignant. Définissez les créneaux horaires, assignez les matières, gérez les salles et évitez les conflits d\'horaires.',
          time: '25 min',
          instructions: [
            '1. Définissez la grille horaire (8h-17h)',
            '2. Créez les créneaux par matière',
            '3. Assignez les enseignants aux créneaux',
            '4. Vérifiez la disponibilité des salles',
            '5. Évitez les conflits d\'horaires',
            '6. Générez les emplois du temps',
            '7. Validez et publiez'
          ]
        },
        'attendance': {
          title: 'Présence École',
          description: 'Suivi des présences et absences',
          details: 'Activez le système de suivi des présences quotidiennes. Configurez les notifications automatiques aux parents, gérez les justificatifs d\'absence et générez les rapports d\'assiduité.',
          time: '8 min',
          instructions: [
            '1. Activez le module de présences',
            '2. Configurez les horaires de pointage',
            '3. Paramétrez les notifications parents',
            '4. Définissez les types d\'absences',
            '5. Configurez la validation des justificatifs',
            '6. Testez le système de pointage'
          ]
        },
        'communications': {
          title: 'Communications',
          description: 'Messagerie avec les parents et élèves',
          details: 'Configurez les systèmes de communication multi-canaux : SMS, emails, et notifications push. Créez des modèles de messages, gérez les listes de diffusion et suivez les accusés de réception.',
          time: '10 min',
          instructions: [
            '1. Configurez les canaux de communication',
            '2. Créez des modèles de messages type',
            '3. Organisez les listes de diffusion',
            '4. Paramétrez les notifications automatiques',
            '5. Testez l\'envoi de messages',
            '6. Vérifiez les accusés de réception'
          ]
        },
        'teacher-absences': {
          title: 'Absences Enseignants',
          description: 'Gestion des absences du personnel',
          details: 'Gérez les demandes d\'absence des enseignants, organisez les remplacements, suivez les congés et planifiez la continuité pédagogique. Notifiez automatiquement les changements aux élèves et parents.',
          time: '12 min',
          instructions: [
            '1. Configurez les types d\'absences',
            '2. Paramétrez les demandes d\'absence',
            '3. Organisez le système de remplacements',
            '4. Configurez les notifications automatiques',
            '5. Planifiez la continuité des cours',
            '6. Suivez les statistiques d\'absence'
          ]
        },
        'parent-requests': {
          title: 'Demandes Parents',
          description: 'Traitement des demandes parentales',
          details: 'Centralisez toutes les demandes des parents : rendez-vous, certificats, informations scolaires, réclamations. Organisez le workflow de traitement et assurez un suivi optimal.',
          time: '8 min',
          instructions: [
            '1. Configurez les types de demandes',
            '2. Définissez le workflow de validation',
            '3. Assignez les responsables de traitement',
            '4. Paramétrez les délais de réponse',
            '5. Configurez les notifications de suivi',
            '6. Testez le processus complet'
          ]
        },
        'educational-content': {
          title: 'Contenu Pédagogique',
          description: 'Gestion des ressources éducatives',
          details: 'Organisez la bibliothèque de ressources pédagogiques : cours, exercices, évaluations, supports multimédia. Gérez les permissions d\'accès et la validation du contenu par niveau.',
          time: '15 min',
          instructions: [
            '1. Créez la structure des matières',
            '2. Organisez par niveaux et chapitres',
            '3. Uploadez les ressources pédagogiques',
            '4. Définissez les permissions d\'accès',
            '5. Validez le contenu pédagogique',
            '6. Partagez avec les enseignants'
          ]
        },
        'notifications': {
          title: 'Notifications',
          description: 'Système de notifications intégré',
          details: 'Configurez le centre de notifications pour toutes les activités importantes : nouvelles notes, absences, événements, urgences. Personnalisez les alertes par utilisateur et canal.',
          time: '10 min',
          instructions: [
            '1. Configurez les types de notifications',
            '2. Définissez les priorités (urgent/normal)',
            '3. Paramétrez les canaux de diffusion',
            '4. Créez des règles automatiques',
            '5. Testez les notifications push',
            '6. Vérifiez la réception sur tous appareils'
          ]
        },
        'administrators': {
          title: 'Administrateurs Délégués',
          description: 'Gestion des comptes administrateurs',
          details: 'Créez et gérez les comptes des administrateurs délégués : directeur adjoint, coordinateur académique, surveillant général. Définissez leurs permissions et domaines d\'intervention.',
          time: '10 min',
          instructions: [
            '1. Identifiez les rôles administratifs',
            '2. Créez les comptes délégués',
            '3. Définissez les permissions spécifiques',
            '4. Assignez les domaines d\'intervention',
            '5. Configurez les niveaux d\'accès',
            '6. Envoyez les identifiants de connexion'
          ]
        },
        'school-settings': {
          title: 'Paramètres École',
          description: 'Configuration générale de l\'établissement',
          details: 'Configurez tous les paramètres de votre école : informations générales, logo, couleurs, horaires officiels, périodes scolaires, systèmes de notation et règlements internes.',
          time: '15 min',
          instructions: [
            '1. Complétez les informations générales',
            '2. Uploadez le logo de l\'école',
            '3. Personnalisez les couleurs',
            '4. Définissez les horaires officiels',
            '5. Configurez les périodes scolaires',
            '6. Paramétrez le système de notation',
            '7. Ajoutez les règlements internes'
          ]
        },
        'reports': {
          title: 'Rapports',
          description: 'Génération de rapports administratifs',
          details: 'Configurez la génération automatique de tous les rapports : bulletins, statistiques de présence, performances par classe, rapports financiers et tableaux de bord analytiques.',
          time: '12 min',
          instructions: [
            '1. Configurez les modèles de rapports',
            '2. Définissez les périodes de génération',
            '3. Paramétrez les destinataires',
            '4. Configurez l\'envoi automatique',
            '5. Testez la génération de rapports',
            '6. Vérifiez les formats d\'export'
          ]
        },
        'academic-management': {
          title: 'Gestion Académique',
          description: 'Administration des activités pédagogiques',
          details: 'Gérez tous les aspects académiques : programmes scolaires, évaluations, bulletins de notes, conseils de classe, orientations et suivi pédagogique personnalisé.',
          time: '20 min',
          instructions: [
            '1. Configurez les programmes par niveau',
            '2. Paramétrez les systèmes d\'évaluation',
            '3. Organisez les périodes de notation',
            '4. Configurez les bulletins automatiques',
            '5. Planifiez les conseils de classe',
            '6. Activez le suivi pédagogique'
          ]
        },
        'online-classes': {
          title: 'Classes en ligne',
          description: 'Plateforme d\'apprentissage virtuel',
          details: 'Configurez la plateforme de classes virtuelles pour l\'enseignement à distance : création de cours, planification des sessions, gestion des participants et suivi des présences en ligne.',
          time: '15 min',
          instructions: [
            '1. Activez le module classes en ligne',
            '2. Configurez les salles virtuelles',
            '3. Paramétrez les permissions d\'accès',
            '4. Testez la qualité audio/vidéo',
            '5. Formez les enseignants à l\'utilisation',
            '6. Planifiez les premières sessions'
          ]
        }
      }
    },
    en: {
      title: 'School Configuration',
      subtitle: 'Interactive guide to configure your school',
      progress: 'Progress',
      completed: 'Completed',
      pending: 'Pending',
      missing: 'Missing',
      configure: 'Configure',
      view: 'View',
      backToOverview: 'Back to overview',
      nextStep: 'Next step',
      startNow: 'Start now',
      priority: 'Priority',
      estimatedTime: 'Estimated time',
      description: 'Description',
      urgentPriority: 'Urgent',
      importantPriority: 'Important',
      essentialPriority: 'Essential',
      usefulPriority: 'Useful',
      missingElements: 'Missing elements',
      allConfigured: 'Everything is configured!',
      steps: {
        'director-profile': {
          title: 'Director Profile',
          description: 'Administrator profile configuration',
          details: 'Configure your director profile: personal information, photo, digital signature, notification preferences and security settings. Define your access permissions and role in the institution.',
          time: '10 min',
          instructions: [
            '1. Access the "Director Profile" module',
            '2. Complete your personal information',
            '3. Add a professional photo',
            '4. Configure your digital signature',
            '5. Set your notification preferences',
            '6. Review your security settings'
          ]
        },
        'classes': {
          title: 'Classes',
          description: 'Class creation and organization',
          details: 'Organize your educational structure: create classes by level (6th to 12th grade), define maximum capacity, assign homeroom teachers and organize classrooms.',
          time: '15 min',
          instructions: [
            '1. Click "Add a class"',
            '2. Select the level (6th, 7th, etc.)',
            '3. Name the class (e.g., 6th A, 7th Sciences)',
            '4. Define maximum capacity',
            '5. Assign a homeroom teacher',
            '6. Associate a classroom',
            '7. Repeat for all your classes'
          ]
        },
        'teachers': {
          title: 'Teachers',
          description: 'Teaching staff management',
          details: 'Register all your teachers with complete information: subjects taught, assigned classes, schedules, qualifications and contacts. Manage their platform access permissions.',
          time: '20 min',
          instructions: [
            '1. Click "Add a teacher"',
            '2. Enter personal information',
            '3. Select subjects taught',
            '4. Assign classes',
            '5. Define work schedules',
            '6. Add qualifications',
            '7. Configure platform access',
            '8. Send login credentials'
          ]
        },
        'students': {
          title: 'Students',
          description: 'Student enrollment and management',
          details: 'Enroll your students in their respective classes with all necessary information: civil status, parent contacts, basic medical records, and academic information. Organize groups and sections.',
          time: '30 min',
          instructions: [
            '1. Prepare the list of new students',
            '2. Click "Enroll a student"',
            '3. Complete full civil status',
            '4. Assign to a class',
            '5. Add parent contacts',
            '6. Enter medical information',
            '7. Configure transportation options',
            '8. Validate enrollment'
          ]
        },
        'timetable': {
          title: 'Schedule',
          description: 'School schedule planning',
          details: 'Create timetables for each class and teacher. Define time slots, assign subjects, manage rooms and avoid schedule conflicts.',
          time: '25 min',
          instructions: [
            '1. Define the time grid (8am-5pm)',
            '2. Create slots by subject',
            '3. Assign teachers to slots',
            '4. Check room availability',
            '5. Avoid schedule conflicts',
            '6. Generate timetables',
            '7. Validate and publish'
          ]
        },
        'attendance': {
          title: 'School Attendance',
          description: 'Attendance and absence tracking',
          details: 'Enable the daily attendance tracking system. Configure automatic notifications to parents, manage absence justifications and generate attendance reports.',
          time: '8 min',
          instructions: [
            '1. Enable the attendance module',
            '2. Configure check-in times',
            '3. Set up parent notifications',
            '4. Define absence types',
            '5. Configure justification validation',
            '6. Test the check-in system'
          ]
        },
        'communications': {
          title: 'Communications',
          description: 'Messaging with parents and students',
          details: 'Configure multi-channel communication systems: SMS, emails, and push notifications. Create message templates, manage distribution lists and track delivery receipts.',
          time: '10 min',
          instructions: [
            '1. Configure communication channels',
            '2. Create standard message templates',
            '3. Organize distribution lists',
            '4. Set up automatic notifications',
            '5. Test message sending',
            '6. Check delivery receipts'
          ]
        },
        'teacher-absences': {
          title: 'Teacher Absences',
          description: 'Staff absence management',
          details: 'Manage teacher absence requests, organize substitutions, track leave and plan educational continuity. Automatically notify students and parents of changes.',
          time: '12 min',
          instructions: [
            '1. Configure absence types',
            '2. Set up absence requests',
            '3. Organize substitution system',
            '4. Configure automatic notifications',
            '5. Plan lesson continuity',
            '6. Track absence statistics'
          ]
        },
        'parent-requests': {
          title: 'Parent Requests',
          description: 'Parent request processing',
          details: 'Centralize all parent requests: appointments, certificates, school information, complaints. Organize the processing workflow and ensure optimal follow-up.',
          time: '8 min',
          instructions: [
            '1. Configure request types',
            '2. Define validation workflow',
            '3. Assign processing managers',
            '4. Set response deadlines',
            '5. Configure follow-up notifications',
            '6. Test the complete process'
          ]
        },
        'educational-content': {
          title: 'Educational Content',
          description: 'Educational resource management',
          details: 'Organize the educational resource library: lessons, exercises, assessments, multimedia content. Manage access permissions and content validation by level.',
          time: '15 min',
          instructions: [
            '1. Create subject structure',
            '2. Organize by levels and chapters',
            '3. Upload educational resources',
            '4. Define access permissions',
            '5. Validate educational content',
            '6. Share with teachers'
          ]
        },
        'notifications': {
          title: 'Notifications',
          description: 'Integrated notification system',
          details: 'Configure the notification center for all important activities: new grades, absences, events, emergencies. Customize alerts by user and channel.',
          time: '10 min',
          instructions: [
            '1. Configure notification types',
            '2. Define priorities (urgent/normal)',
            '3. Set up distribution channels',
            '4. Create automatic rules',
            '5. Test push notifications',
            '6. Verify reception on all devices'
          ]
        },
        'administrators': {
          title: 'Delegate Administrators',
          description: 'Administrator account management',
          details: 'Create and manage delegate administrator accounts: deputy director, academic coordinator, general supervisor. Define their permissions and areas of intervention.',
          time: '10 min',
          instructions: [
            '1. Identify administrative roles',
            '2. Create delegate accounts',
            '3. Define specific permissions',
            '4. Assign intervention areas',
            '5. Configure access levels',
            '6. Send login credentials'
          ]
        },
        'school-settings': {
          title: 'School Settings',
          description: 'General institution configuration',
          details: 'Configure all your school settings: general information, logo, colors, official hours, school periods, grading systems and internal regulations.',
          time: '15 min',
          instructions: [
            '1. Complete general information',
            '2. Upload school logo',
            '3. Customize colors',
            '4. Define official hours',
            '5. Configure school periods',
            '6. Set up grading system',
            '7. Add internal regulations'
          ]
        },
        'reports': {
          title: 'Reports',
          description: 'Administrative report generation',
          details: 'Configure automatic generation of all reports: report cards, attendance statistics, class performance, financial reports and analytical dashboards.',
          time: '12 min',
          instructions: [
            '1. Configure report templates',
            '2. Define generation periods',
            '3. Set up recipients',
            '4. Configure automatic sending',
            '5. Test report generation',
            '6. Check export formats'
          ]
        },
        'academic-management': {
          title: 'Academic Management',
          description: 'Educational activity administration',
          details: 'Manage all academic aspects: curricula, assessments, report cards, class councils, guidance and personalized educational tracking.',
          time: '20 min',
          instructions: [
            '1. Configure programs by level',
            '2. Set up evaluation systems',
            '3. Organize grading periods',
            '4. Configure automatic report cards',
            '5. Plan class councils',
            '6. Enable educational tracking'
          ]
        },
        'online-classes': {
          title: 'Online Classes',
          description: 'Virtual learning platform',
          details: 'Configure the virtual classroom platform for distance learning: course creation, session scheduling, participant management and online attendance tracking.',
          time: '15 min',
          instructions: [
            '1. Enable online classes module',
            '2. Configure virtual rooms',
            '3. Set up access permissions',
            '4. Test audio/video quality',
            '5. Train teachers on usage',
            '6. Schedule first sessions'
          ]
        }
      }
    }
  };

  const t = text[language as keyof typeof text];

  const stepConfig = {
    'director-profile': { icon: Settings, priority: 'urgent' },
    'classes': { icon: BookOpen, priority: 'essential' },
    'teachers': { icon: GraduationCap, priority: 'essential' },
    'students': { icon: Users, priority: 'essential' },
    'timetable': { icon: Calendar, priority: 'important' },
    'attendance': { icon: CheckCircle, priority: 'useful' },
    'communications': { icon: MessageSquare, priority: 'useful' },
    'teacher-absences': { icon: UserX, priority: 'important' },
    'parent-requests': { icon: ClipboardList, priority: 'useful' },
    'educational-content': { icon: FileText, priority: 'important' },
    'notifications': { icon: Bell, priority: 'useful' },
    'administrators': { icon: Shield, priority: 'important' },
    'school-settings': { icon: Settings, priority: 'essential' },
    'reports': { icon: BarChart3, priority: 'useful' },
    'academic-management': { icon: Award, priority: 'essential' },
    'online-classes': { icon: Video, priority: 'useful' }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'important': return 'text-orange-600 bg-orange-50';
      case 'essential': return 'text-blue-600 bg-blue-50';
      case 'useful': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return t.urgentPriority;
      case 'important': return t.importantPriority;
      case 'essential': return t.essentialPriority;
      case 'useful': return t.usefulPriority;
      default: return priority;
    }
  };

  const navigateToModule = (moduleKey: string) => {
    console.log(`[MOBILE_CONFIG_GUIDE] ⚡ Button clicked for: ${moduleKey}`);
    
    const moduleMap: { [key: string]: string } = {
      'director-profile': 'director-settings',
      'classes': 'classes',
      'teachers': 'teachers',
      'students': 'students',
      'timetable': 'director-timetable',
      'attendance': 'director-attendance',
      'communications': 'director-communications',
      'teacher-absences': 'teacher-absence',
      'parent-requests': 'parent-requests',
      'educational-content': 'content-approval',
      'notifications': 'notifications',
      'administrators': 'school-administrators',
      'school-settings': 'school-settings',
      'reports': 'reports',
      'academic-management': 'academic-management',
      'online-classes': 'online-classes'
    };

    const targetModule = moduleMap[moduleKey];
    if (targetModule) {
      console.log(`[MOBILE_CONFIG_GUIDE] 🎯 Switching to module: ${targetModule}`);
      
      // Dispatche l'événement de changement de module
      const moduleEvent = new CustomEvent('switchModule', { 
        detail: { 
          moduleId: targetModule,
          source: 'mobile-config-guide',
          originalKey: moduleKey
        } 
      });
      window.dispatchEvent(moduleEvent);
      
      console.log(`[MOBILE_CONFIG_GUIDE] ✅ Module switch event dispatched for: ${targetModule}`);
    } else {
      console.warn(`[MOBILE_CONFIG_GUIDE] ❌ No module mapping found for: ${moduleKey}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return t.completed;
      case 'pending': return t.pending;
      default: return t.missing;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Smartphone className="w-6 h-6 text-blue-600" />
              <CardTitle className="text-lg">{t.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vue détaillée d'une étape
  if (showDetails && selectedStep) {
    const stepData = t.steps[selectedStep as keyof typeof t.steps];
    const status = configStatus?.steps[selectedStep] || 'missing';
    const config = stepConfig[selectedStep as keyof typeof stepConfig];
    const Icon = config?.icon || Settings;
    const priority = config?.priority || 'useful';

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(false)}
                className="p-2"
                data-testid="button-back-overview"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg leading-tight">{stepData?.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {getStatusIcon(status)}
              <span className="text-sm font-medium">{getStatusText(status)}</span>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Priorité */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{t.priority}</span>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
                {getPriorityText(priority)}
              </span>
            </div>

            {/* Temps estimé */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{t.estimatedTime}</span>
              </div>
              <span className="text-sm text-gray-600">{stepData?.time}</span>
            </div>

            {/* Description détaillée */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{t.description}</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{stepData?.details}</p>
            </div>

            {/* Instructions étape par étape */}
            {stepData?.instructions && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{language === 'fr' ? 'Instructions' : 'Instructions'}</span>
                </div>
                <div className="space-y-1">
                  {stepData.instructions.map((instruction: string, index: number) => (
                    <div key={index} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-4 h-4 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span>{instruction}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bouton d'action */}
            <div className="pt-4">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log(`[MOBILE_CONFIG_GUIDE] 🖱️ Button clicked for step: ${selectedStep}`);
                  console.log(`[MOBILE_CONFIG_GUIDE] 🔍 Status: ${status}, Text: ${status === 'completed' ? t.view : t.startNow}`);
                  
                  navigateToModule(selectedStep);
                }}
                className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-lg transform active:scale-95 transition-transform"
                data-testid={`button-configure-${selectedStep}`}
              >
                <Play className="w-4 h-4 mr-2" />
                {status === 'completed' ? t.view : t.startNow}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vue d'ensemble principale
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Smartphone className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-lg text-center">{t.title}</CardTitle>
          </div>
          <p className="text-sm text-gray-600 text-center">{t.subtitle}</p>
          
          {configStatus && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t.progress}</span>
                <span className="text-sm text-gray-600">{configStatus.overallProgress}%</span>
              </div>
              <Progress value={configStatus.overallProgress} className="w-full h-2" />
            </div>
          )}
        </CardHeader>

        <CardContent>
          {configStatus ? (
            <div className="space-y-3">
              {Object.entries(configStatus.steps).map(([stepKey, status]) => {
                const stepData = t.steps[stepKey as keyof typeof t.steps];
                const config = stepConfig[stepKey as keyof typeof stepConfig];
                
                if (!stepData || !config) return null;

                const Icon = config.icon;
                const priority = config.priority;
                
                return (
                  <div
                    key={stepKey}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Icon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{stepData.title}</div>
                        <div className="text-xs text-gray-600 truncate">{stepData.description}</div>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(status)}
                          <span className="text-xs">{getStatusText(status)}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(priority)}`}>
                            {getPriorityText(priority)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedStep(stepKey);
                        setShowDetails(true);
                      }}
                      className="ml-2 p-2 flex-shrink-0"
                      data-testid={`button-details-${stepKey}`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
              
              {(Array.isArray(configStatus.missingElements) ? configStatus.missingElements.length : 0) > 0 ? (
                <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <h4 className="font-medium text-orange-800 text-sm">{t.missingElements}</h4>
                  </div>
                  <p className="text-xs text-orange-700">
                    {(Array.isArray(configStatus.missingElements) ? configStatus.missingElements.length : 0)} éléments à configurer
                  </p>
                </div>
              ) : (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-800">{t.allConfigured}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 text-sm mb-4">
                Impossible de charger le statut de configuration
              </p>
              <Button 
                onClick={fetchConfigurationStatus} 
                size="sm"
                data-testid="button-retry-config"
              >
                Réessayer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileSchoolConfigurationGuide;
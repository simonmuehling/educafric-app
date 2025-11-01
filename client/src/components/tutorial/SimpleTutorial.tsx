import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Users, Calendar, ClipboardCheck, BarChart3, FileText, BookOpen, MessageCircle, MessageSquare, User, Building2, DollarSign, Settings, UserCheck, Clock, CheckCircle, UserX, Bell, Shield, Video, HelpCircle, CheckSquare, PenTool, Star, Heart, CheckCircle2, CreditCard, MapPin, GraduationCap, Target, Award } from 'lucide-react';
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
            fr: '👨‍🏫 Bienvenue dans EDUCAFRIC 2025', 
            en: '👨‍🏫 Welcome to EDUCAFRIC 2025' 
          },
          content: { 
            fr: 'Ce tutoriel vous présente les 16 modules du tableau de bord Enseignant. Cliquez sur "Suivant" pour découvrir chaque module et ses fonctionnalités.',
            en: 'This tutorial presents the 16 modules of the Teacher dashboard. Click "Next" to discover each module and its features.'
          },
          icon: Users,
          color: 'bg-gradient-to-r from-blue-500 to-purple-500'
        },
        {
          title: { 
            fr: '🎓 Mes Cours Privés', 
            en: '🎓 My Private Courses' 
          },
          content: { 
            fr: 'Pour enseignants indépendants ou en mode hybride : créez et gérez vos cours particuliers, planning personnalisé, facturation, suivi des élèves privés. Système de paiement intégré.',
            en: 'For independent or hybrid teachers: create and manage your private lessons, personalized schedule, billing, private student tracking. Integrated payment system.'
          },
          icon: User,
          color: 'bg-orange-500'
        },
        {
          title: { 
            fr: '👥 Mes Classes', 
            en: '👥 My Classes' 
          },
          content: { 
            fr: 'Visualisez toutes vos classes : liste des élèves, effectifs, matières enseignées. Accès rapide aux notes, présences et devoirs. Statistiques de performance par classe.',
            en: 'View all your classes: student list, class sizes, subjects taught. Quick access to grades, attendance and assignments. Performance statistics per class.'
          },
          icon: Users,
          color: 'bg-blue-500'
        },
        {
          title: { 
            fr: '🕐 Emploi du temps', 
            en: '🕐 Timetable' 
          },
          content: { 
            fr: 'Consultez votre emploi du temps personnalisé : horaires de cours, salles assignées, classes. Vue hebdomadaire et quotidienne. Synchronisation avec votre calendrier personnel.',
            en: 'View your personalized timetable: class times, assigned rooms, classes. Weekly and daily view. Sync with your personal calendar.'
          },
          icon: Clock,
          color: 'bg-green-500'
        },
        {
          title: { 
            fr: '📅 Export Calendrier', 
            en: '📅 Calendar Export' 
          },
          content: { 
            fr: 'Exportez votre emploi du temps au format iCal/ICS : cours, réunions, événements. Compatible avec Google Calendar, Outlook, Apple Calendar. Mise à jour automatique.',
            en: 'Export your schedule in iCal/ICS format: classes, meetings, events. Compatible with Google Calendar, Outlook, Apple Calendar. Automatic updates.'
          },
          icon: Calendar,
          color: 'bg-cyan-500'
        },
        {
          title: { 
            fr: '✅ Présences', 
            en: '✅ Attendance' 
          },
          content: { 
            fr: 'Marquez les présences de vos élèves : saisie rapide par classe, historique complet, statistiques d\'assiduité. Notifications automatiques aux parents pour absences/retards.',
            en: 'Mark student attendance: quick class entry, complete history, attendance statistics. Automatic parent notifications for absences/tardiness.'
          },
          icon: CheckSquare,
          color: 'bg-purple-500'
        },
        {
          title: { 
            fr: '📝 Devoirs', 
            en: '📝 Assignments' 
          },
          content: { 
            fr: 'Créez et gérez les devoirs : texte, fichiers, liens, multimédia. Définissez dates limites, suivez les soumissions en temps réel. Correction en ligne avec feedback personnalisé.',
            en: 'Create and manage assignments: text, files, links, multimedia. Set deadlines, track real-time submissions. Online grading with personalized feedback.'
          },
          icon: FileText,
          color: 'bg-pink-500'
        },
        {
          title: { 
            fr: '✏️ Contenu Pédagogique', 
            en: '✏️ Educational Content' 
          },
          content: { 
            fr: 'Créez du contenu pédagogique : cours, exercices, ressources multimédia. Partagez avec vos classes, organisez par matière et niveau. Système de version et approbation.',
            en: 'Create educational content: lessons, exercises, multimedia resources. Share with your classes, organize by subject and level. Version system and approval.'
          },
          icon: BookOpen,
          color: 'bg-yellow-500'
        },
        {
          title: { 
            fr: '📚 Bibliothèque', 
            en: '📚 Library' 
          },
          content: { 
            fr: 'Accédez à la bibliothèque de ressources partagées : contenus validés par l\'école, ressources ministérielles, documents de référence. Recherche avancée par matière/niveau.',
            en: 'Access the shared resource library: school-validated content, ministerial resources, reference documents. Advanced search by subject/level.'
          },
          icon: BookOpen,
          color: 'bg-emerald-500'
        },
        {
          title: { 
            fr: '📊 Bulletins', 
            en: '📊 Report Cards' 
          },
          content: { 
            fr: 'Gérez les bulletins de vos classes : saisie des notes par trimestre, calculs automatiques (moyennes, rangs), commentaires. Support CBA et traditionnel. Export PDF professionnel.',
            en: 'Manage class report cards: grade entry by term, automatic calculations (averages, ranks), comments. CBA and traditional support. Professional PDF export.'
          },
          icon: Calendar,
          color: 'bg-indigo-500'
        },
        {
          title: { 
            fr: '💬 Communications', 
            en: '💬 Communications' 
          },
          content: { 
            fr: 'Communiquez avec parents et élèves : messages individuels ou groupes, annonces de classe, alertes urgentes. Multicanal : Email, WhatsApp, notifications. Historique complet.',
            en: 'Communicate with parents and students: individual or group messages, class announcements, urgent alerts. Multi-channel: Email, WhatsApp, notifications. Complete history.'
          },
          icon: MessageSquare,
          color: 'bg-red-500'
        },
        {
          title: { 
            fr: '📹 Cours en Ligne', 
            en: '📹 Online Classes' 
          },
          content: { 
            fr: 'Organisez des cours en ligne avec Jitsi Meet : créez des salles virtuelles, planifiez des sessions, invitez vos élèves. Enregistrements automatiques et suivi des présences.',
            en: 'Organize online classes with Jitsi Meet: create virtual rooms, schedule sessions, invite students. Automatic recordings and attendance tracking.'
          },
          icon: Video,
          color: 'bg-purple-600'
        },
        {
          title: { 
            fr: '🤒 Déclarer Absence', 
            en: '🤒 Declare Absence' 
          },
          content: { 
            fr: 'Déclarez vos absences : motif, dates, justificatif. Notification automatique à la direction et aux classes concernées. Historique des absences et statistiques.',
            en: 'Declare your absences: reason, dates, supporting document. Automatic notification to management and affected classes. Absence history and statistics.'
          },
          icon: UserX,
          color: 'bg-orange-600'
        },
        {
          title: { 
            fr: '🔔 Notifications', 
            en: '🔔 Notifications' 
          },
          content: { 
            fr: 'Centre de notifications : nouveaux devoirs soumis, messages reçus, événements importants, rappels. Filtrage par type, marquage lu/non lu, actions rapides.',
            en: 'Notification center: new submitted assignments, received messages, important events, reminders. Filter by type, mark read/unread, quick actions.'
          },
          icon: Bell,
          color: 'bg-blue-600'
        },
        {
          title: { 
            fr: '👥 Multi-Rôles', 
            en: '👥 Multi-Roles' 
          },
          content: { 
            fr: 'Basculez entre vos rôles si vous en avez plusieurs : Enseignant, Parent, Élève. Interface unique, changement de contexte rapide. Préférences sauvegardées par rôle.',
            en: 'Switch between your roles if you have multiple: Teacher, Parent, Student. Single interface, quick context switching. Preferences saved per role.'
          },
          icon: Users,
          color: 'bg-purple-600'
        },
        {
          title: { 
            fr: '❓ Aide', 
            en: '❓ Help' 
          },
          content: { 
            fr: 'Centre d\'aide et support : guides d\'utilisation, FAQ, tutoriels vidéo, contact support. Documentation complète en français et anglais. Recherche intelligente.',
            en: 'Help and support center: user guides, FAQ, video tutorials, support contact. Complete documentation in French and English. Smart search.'
          },
          icon: HelpCircle,
          color: 'bg-emerald-500'
        },
        {
          title: { 
            fr: '⚙️ Profil', 
            en: '⚙️ Profile' 
          },
          content: { 
            fr: 'Gérez votre profil enseignant : informations personnelles, photo, matières enseignées, mode de travail (école/indépendant/hybride). Sécurité et préférences de notification.',
            en: 'Manage your teacher profile: personal information, photo, subjects taught, work mode (school/independent/hybrid). Security and notification preferences.'
          },
          icon: Settings,
          color: 'bg-gray-500'
        }
      ],
      'Student': [
        {
          title: { 
            fr: '🎓 Bienvenue dans EDUCAFRIC 2025', 
            en: '🎓 Welcome to EDUCAFRIC 2025' 
          },
          content: { 
            fr: 'Ce tutoriel vous présente les 17 modules du tableau de bord Étudiant. Cliquez sur "Suivant" pour découvrir chaque module et ses fonctionnalités.',
            en: 'This tutorial presents the 17 modules of the Student dashboard. Click "Next" to discover each module and its features.'
          },
          icon: User,
          color: 'bg-gradient-to-r from-green-500 to-blue-500'
        },
        {
          title: { 
            fr: '🕐 Emploi du temps', 
            en: '🕐 Timetable' 
          },
          content: { 
            fr: 'Consultez votre emploi du temps personnalisé : horaires de cours, salles, enseignants, matières. Vue quotidienne et hebdomadaire. Notifications avant chaque cours. Synchronisation calendrier.',
            en: 'View your personalized timetable: class times, rooms, teachers, subjects. Daily and weekly view. Notifications before each class. Calendar synchronization.'
          },
          icon: Clock,
          color: 'bg-blue-500'
        },
        {
          title: { 
            fr: '📊 Notes', 
            en: '📊 Grades' 
          },
          content: { 
            fr: 'Consultez vos notes en temps réel : notes par matière, moyennes, coefficients, progression. Graphiques de performance, comparaison avec la classe. Notifications pour chaque nouvelle note.',
            en: 'View your grades in real-time: grades by subject, averages, coefficients, progression. Performance charts, comparison with class. Notifications for each new grade.'
          },
          icon: BarChart3,
          color: 'bg-green-500'
        },
        {
          title: { 
            fr: '📝 Devoirs', 
            en: '📝 Assignments' 
          },
          content: { 
            fr: 'Gérez vos devoirs : consultez les devoirs assignés, dates limites, instructions détaillées. Soumettez vos travaux en ligne (texte, fichiers, liens). Suivez vos soumissions et corrections.',
            en: 'Manage your assignments: view assigned homework, deadlines, detailed instructions. Submit your work online (text, files, links). Track your submissions and corrections.'
          },
          icon: FileText,
          color: 'bg-purple-500'
        },
        {
          title: { 
            fr: '📋 Mes Notes (Bulletins)', 
            en: '📋 My Notes (Report Cards)' 
          },
          content: { 
            fr: 'Accédez à vos bulletins scolaires : notes par trimestre, moyennes générales, rangs, commentaires des enseignants. Téléchargement PDF. Graphiques de progression académique.',
            en: 'Access your report cards: grades by term, overall averages, ranks, teacher comments. PDF download. Academic progression charts.'
          },
          icon: FileText,
          color: 'bg-orange-500'
        },
        {
          title: { 
            fr: '📚 Bibliothèque', 
            en: '📚 Library' 
          },
          content: { 
            fr: 'Accédez aux ressources pédagogiques : cours, exercices, documents partagés par vos enseignants. Recherche par matière et niveau. Téléchargement et consultation en ligne.',
            en: 'Access educational resources: lessons, exercises, documents shared by your teachers. Search by subject and level. Download and online consultation.'
          },
          icon: BookOpen,
          color: 'bg-emerald-500'
        },
        {
          title: { 
            fr: '✅ Présences', 
            en: '✅ Attendance' 
          },
          content: { 
            fr: 'Suivez vos présences : historique complet des absences, retards, justificatifs. Statistiques d\'assiduité par matière. Alertes pour absences non justifiées. Vos parents sont notifiés automatiquement.',
            en: 'Track your attendance: complete history of absences, tardiness, justifications. Attendance statistics by subject. Alerts for unjustified absences. Your parents are automatically notified.'
          },
          icon: Calendar,
          color: 'bg-pink-500'
        },
        {
          title: { 
            fr: '🎯 Mon Progrès', 
            en: '🎯 My Progress' 
          },
          content: { 
            fr: 'Analysez votre progression académique : évolution des notes, points forts et faibles, recommandations personnalisées. Objectifs d\'apprentissage, badges de réussite, suivi de performance.',
            en: 'Analyze your academic progress: grade evolution, strengths and weaknesses, personalized recommendations. Learning goals, achievement badges, performance tracking.'
          },
          icon: Target,
          color: 'bg-yellow-500'
        },
        {
          title: { 
            fr: '💬 Messages', 
            en: '💬 Messages' 
          },
          content: { 
            fr: 'Communiquez avec vos enseignants : messages individuels, questions sur les cours, demandes d\'aide. Notifications en temps réel. Historique complet des conversations.',
            en: 'Communicate with your teachers: individual messages, questions about classes, requests for help. Real-time notifications. Complete conversation history.'
          },
          icon: MessageSquare,
          color: 'bg-indigo-500'
        },
        {
          title: { 
            fr: '📹 Cours en Ligne', 
            en: '📹 Online Classes' 
          },
          content: { 
            fr: 'Participez aux cours en ligne : rejoignez les salles virtuelles Jitsi Meet, accédez aux enregistrements des sessions passées. Interaction en temps réel avec vos enseignants.',
            en: 'Participate in online classes: join Jitsi Meet virtual rooms, access recordings of past sessions. Real-time interaction with your teachers.'
          },
          icon: Video,
          color: 'bg-purple-600'
        },
        {
          title: { 
            fr: '🎓 Mes Cours Privés', 
            en: '🎓 My Private Courses' 
          },
          content: { 
            fr: 'Gérez vos cours particuliers : consultez vos sessions avec enseignants indépendants, planning personnalisé, progression, paiements. Notes et recommandations des tuteurs.',
            en: 'Manage your private lessons: view your sessions with independent teachers, personalized schedule, progression, payments. Notes and tutor recommendations.'
          },
          icon: GraduationCap,
          color: 'bg-indigo-600'
        },
        {
          title: { 
            fr: '❤️ Trouver mes parents', 
            en: '❤️ Find my parents' 
          },
          content: { 
            fr: 'Connectez-vous avec vos parents : générez un code de connexion unique pour que vos parents puissent vous ajouter. Validation sécurisée. Vos parents pourront suivre votre scolarité.',
            en: 'Connect with your parents: generate a unique connection code for your parents to add you. Secure validation. Your parents can track your education.'
          },
          icon: Heart,
          color: 'bg-pink-600'
        },
        {
          title: { 
            fr: '🏆 Réussites', 
            en: '🏆 Achievements' 
          },
          content: { 
            fr: 'Consultez vos réussites et badges : meilleures notes, assiduité parfaite, progrès remarquables, participations actives. Système de gamification pour motiver votre apprentissage.',
            en: 'View your achievements and badges: best grades, perfect attendance, remarkable progress, active participation. Gamification system to motivate your learning.'
          },
          icon: Award,
          color: 'bg-red-500'
        },
        {
          title: { 
            fr: '⚙️ Paramètres Étudiant', 
            en: '⚙️ Student Settings' 
          },
          content: { 
            fr: 'Gérez votre profil étudiant : informations personnelles, photo, classe, préférences de notification, langue (Français/English). Sécurité du compte et confidentialité.',
            en: 'Manage your student profile: personal information, photo, class, notification preferences, language (Français/English). Account security and privacy.'
          },
          icon: User,
          color: 'bg-teal-500'
        },
        {
          title: { 
            fr: '❓ Aide', 
            en: '❓ Help' 
          },
          content: { 
            fr: 'Centre d\'aide étudiant : guides d\'utilisation, FAQ, tutoriels vidéo, conseils d\'apprentissage. Documentation complète bilingue. Contact support pour assistance.',
            en: 'Student help center: user guides, FAQ, video tutorials, learning tips. Complete bilingual documentation. Support contact for assistance.'
          },
          icon: HelpCircle,
          color: 'bg-slate-500'
        },
        {
          title: { 
            fr: '🔔 Notifications', 
            en: '🔔 Notifications' 
          },
          content: { 
            fr: 'Centre de notifications : nouveaux devoirs, notes ajoutées, messages enseignants, cours en ligne, rappels. Filtrage par type, marquage lu/non lu, actions rapides.',
            en: 'Notification center: new assignments, added grades, teacher messages, online classes, reminders. Filter by type, mark read/unread, quick actions.'
          },
          icon: Bell,
          color: 'bg-blue-600'
        },
        {
          title: { 
            fr: '📍 Géolocalisation', 
            en: '📍 Geolocation' 
          },
          content: { 
            fr: 'Service de sécurité partagé avec vos parents : localisation en temps réel, zones de sécurité (école, maison), alertes automatiques. Respect de votre vie privée avec contrôle parental.',
            en: 'Security service shared with your parents: real-time location, safety zones (school, home), automatic alerts. Privacy respected with parental control.'
          },
          icon: MapPin,
          color: 'bg-emerald-500'
        },
        {
          title: { 
            fr: '👥 Multi-Rôles', 
            en: '👥 Multi-Roles' 
          },
          content: { 
            fr: 'Basculez entre vos rôles si vous en avez plusieurs : Étudiant, Parent (si vous êtes aussi parent), etc. Interface unique, changement de contexte rapide.',
            en: 'Switch between your roles if you have multiple: Student, Parent (if you are also a parent), etc. Single interface, quick context switching.'
          },
          icon: User,
          color: 'bg-purple-600'
        }
      ],
      'Commercial': [
        {
          title: { 
            fr: '💼 Bienvenue dans EDUCAFRIC 2025', 
            en: '💼 Welcome to EDUCAFRIC 2025' 
          },
          content: { 
            fr: 'Ce tutoriel vous présente les 15 modules du tableau de bord Commercial. Cliquez sur "Suivant" pour découvrir chaque module et ses fonctionnalités.',
            en: 'This tutorial presents the 15 modules of the Commercial dashboard. Click "Next" to discover each module and its features.'
          },
          icon: Building2,
          color: 'bg-gradient-to-r from-blue-600 to-indigo-600'
        },
        {
          title: { 
            fr: '🏫 Mes Écoles', 
            en: '🏫 My Schools' 
          },
          content: { 
            fr: 'Gérez votre portefeuille d\'écoles clientes : informations complètes, statut d\'abonnement, historique de paiements, contacts associés. CRM complet avec notes, rappels et suivi d\'activité.',
            en: 'Manage your portfolio of client schools: complete information, subscription status, payment history, associated contacts. Complete CRM with notes, reminders and activity tracking.'
          },
          icon: Building2,
          color: 'bg-blue-500'
        },
        {
          title: { 
            fr: '🎯 Prospects', 
            en: '🎯 Leads' 
          },
          content: { 
            fr: 'Gérez vos prospects : nouvelles écoles potentielles, suivi du pipeline de vente, qualification des leads, conversion. Assignez priorités, statuts et étapes du processus commercial.',
            en: 'Manage your leads: new potential schools, sales pipeline tracking, lead qualification, conversion. Assign priorities, statuses and sales process stages.'
          },
          icon: Building2,
          color: 'bg-orange-500'
        },
        {
          title: { 
            fr: '👥 Contacts', 
            en: '👥 Contacts' 
          },
          content: { 
            fr: 'Gérez vos contacts professionnels : directeurs d\'école, décideurs, administrateurs. Coordonnées complètes, historique des interactions, notes de réunions, rappels de suivi.',
            en: 'Manage your professional contacts: school directors, decision makers, administrators. Complete contact details, interaction history, meeting notes, follow-up reminders.'
          },
          icon: Users,
          color: 'bg-green-500'
        },
        {
          title: { 
            fr: '💳 Paiements', 
            en: '💳 Payments' 
          },
          content: { 
            fr: 'Gérez les paiements des écoles : confirmation de transactions, suivi des abonnements, historique complet, factures. Paiements en ligne (Stripe, MTN Mobile Money). Alertes de renouvellement.',
            en: 'Manage school payments: transaction confirmation, subscription tracking, complete history, invoices. Online payments (Stripe, MTN Mobile Money). Renewal alerts.'
          },
          icon: CreditCard,
          color: 'bg-purple-500'
        },
        {
          title: { 
            fr: '📄 Documents', 
            en: '📄 Documents' 
          },
          content: { 
            fr: 'Accédez aux documents commerciaux : contrats, propositions commerciales, présentations, brochures, conditions générales. Téléchargement PDF, partage sécurisé, suivi des consultations.',
            en: 'Access commercial documents: contracts, business proposals, presentations, brochures, terms and conditions. PDF download, secure sharing, consultation tracking.'
          },
          icon: FileText,
          color: 'bg-orange-500'
        },
        {
          title: { 
            fr: '📊 Statistiques', 
            en: '📊 Statistics' 
          },
          content: { 
            fr: 'Tableaux de bord analytiques : nombre d\'écoles actives, revenus mensuels, taux de conversion prospects, performances par région. Graphiques interactifs, export Excel/PDF.',
            en: 'Analytical dashboards: number of active schools, monthly revenue, lead conversion rate, performance by region. Interactive charts, Excel/PDF export.'
          },
          icon: BarChart3,
          color: 'bg-red-500'
        },
        {
          title: { 
            fr: '📈 Rapports', 
            en: '📈 Reports' 
          },
          content: { 
            fr: 'Rapports d\'activité détaillés : performances commerciales, objectifs atteints, analyse des tendances, prévisions. Rapports hebdomadaires, mensuels, trimestriels. Export et partage.',
            en: 'Detailed activity reports: sales performance, targets achieved, trend analysis, forecasts. Weekly, monthly, quarterly reports. Export and sharing.'
          },
          icon: BarChart3,
          color: 'bg-pink-500'
        },
        {
          title: { 
            fr: '📅 Rendez-vous', 
            en: '📅 Calls & Appointments' 
          },
          content: { 
            fr: 'Planifiez et suivez vos rendez-vous clients : meetings, appels téléphoniques, visioconférences. Calendrier intégré, rappels automatiques, notes de réunion, compte-rendus.',
            en: 'Schedule and track client appointments: meetings, phone calls, video conferences. Integrated calendar, automatic reminders, meeting notes, reports.'
          },
          icon: Calendar,
          color: 'bg-indigo-500'
        },
        {
          title: { 
            fr: '💬 WhatsApp Business', 
            en: '💬 WhatsApp Business' 
          },
          content: { 
            fr: 'Communication WhatsApp professionnelle : envoyez des messages groupés aux écoles, campagnes marketing, suivi des conversations, modèles de messages, réponses rapides.',
            en: 'Professional WhatsApp communication: send bulk messages to schools, marketing campaigns, conversation tracking, message templates, quick replies.'
          },
          icon: MessageSquare,
          color: 'bg-green-600'
        },
        {
          title: { 
            fr: '✉️ Lettres d\'Offres', 
            en: '✉️ Offer Letters' 
          },
          content: { 
            fr: 'Créez et envoyez des lettres d\'offre commerciale : modèles personnalisables, tarification, conditions, avantages. Génération PDF professionnelle, envoi Email automatique, suivi d\'ouverture.',
            en: 'Create and send commercial offer letters: customizable templates, pricing, conditions, benefits. Professional PDF generation, automatic email sending, open tracking.'
          },
          icon: FileText,
          color: 'bg-yellow-500'
        },
        {
          title: { 
            fr: '📊 Mon Activité', 
            en: '📊 My Activity' 
          },
          content: { 
            fr: 'Résumé de votre activité commerciale : actions récentes, écoles contactées, rendez-vous du jour, tâches en attente, objectifs personnels. Vue d\'ensemble quotidienne.',
            en: 'Summary of your sales activity: recent actions, schools contacted, today\'s appointments, pending tasks, personal goals. Daily overview.'
          },
          icon: BarChart3,
          color: 'bg-indigo-500'
        },
        {
          title: { 
            fr: '🔔 Notifications', 
            en: '🔔 Notifications' 
          },
          content: { 
            fr: 'Centre de notifications : nouveaux prospects, paiements reçus, renouvellements proches, rendez-vous à venir, messages clients. Filtrage par type, actions rapides.',
            en: 'Notification center: new leads, payments received, upcoming renewals, upcoming appointments, client messages. Filter by type, quick actions.'
          },
          icon: Bell,
          color: 'bg-orange-600'
        },
        {
          title: { 
            fr: '⚙️ Paramètres', 
            en: '⚙️ Settings' 
          },
          content: { 
            fr: 'Gérez votre profil commercial : informations personnelles, photo, région assignée, objectifs de vente, préférences de notification, langue (Français/English). Sécurité du compte.',
            en: 'Manage your sales profile: personal information, photo, assigned region, sales targets, notification preferences, language (Français/English). Account security.'
          },
          icon: Settings,
          color: 'bg-gray-600'
        },
        {
          title: { 
            fr: '👥 Multi-Rôles', 
            en: '👥 Multi-Roles' 
          },
          content: { 
            fr: 'Basculez entre vos rôles si vous en avez plusieurs : Commercial, Directeur, Enseignant, etc. Interface unique, changement de contexte rapide. Préférences sauvegardées par rôle.',
            en: 'Switch between your roles if you have multiple: Commercial, Director, Teacher, etc. Single interface, quick context switching. Preferences saved per role.'
          },
          icon: User,
          color: 'bg-purple-600'
        },
        {
          title: { 
            fr: '❓ Aide', 
            en: '❓ Help' 
          },
          content: { 
            fr: 'Centre d\'aide commerciale : guides de vente, meilleures pratiques, FAQ, tutoriels vidéo, contact support. Documentation complète bilingue. Chat en ligne avec équipe support.',
            en: 'Commercial help center: sales guides, best practices, FAQ, video tutorials, support contact. Complete bilingual documentation. Online chat with support team.'
          },
          icon: HelpCircle,
          color: 'bg-gray-500'
        }
      ],
      'Parent': [
        {
          title: { 
            fr: '👨‍👩‍👧‍👦 Bienvenue dans EDUCAFRIC 2025', 
            en: '👨‍👩‍👧‍👦 Welcome to EDUCAFRIC 2025' 
          },
          content: { 
            fr: 'Ce tutoriel vous présente les 17 modules du tableau de bord Parent. Cliquez sur "Suivant" pour découvrir chaque module et ses fonctionnalités.',
            en: 'This tutorial presents the 17 modules of the Parent dashboard. Click "Next" to discover each module and its features.'
          },
          icon: Users,
          color: 'bg-gradient-to-r from-pink-500 to-purple-500'
        },
        {
          title: { 
            fr: '⭐ Mon Abonnement', 
            en: '⭐ My Subscription' 
          },
          content: { 
            fr: 'Gérez votre abonnement premium : consultation du plan actuel, renouvellement automatique, historique de facturation, fonctionnalités débloquées. Passez à premium pour accéder à toutes les fonctionnalités.',
            en: 'Manage your premium subscription: current plan overview, automatic renewal, billing history, unlocked features. Upgrade to premium to access all features.'
          },
          icon: Star,
          color: 'bg-gradient-to-r from-purple-500 to-pink-500'
        },
        {
          title: { 
            fr: '❤️ Connexions Familiales', 
            en: '❤️ Family Connections' 
          },
          content: { 
            fr: 'Gérez les connexions familiales : ajoutez vos enfants via code de connexion, validez les liens parents-enfants, partagez l\'accès avec conjoint/tuteurs. Système de vérification sécurisé.',
            en: 'Manage family connections: add your children via connection code, validate parent-child links, share access with spouse/guardians. Secure verification system.'
          },
          icon: MessageCircle,
          color: 'bg-pink-500'
        },
        {
          title: { 
            fr: '👥 Mes Enfants', 
            en: '👥 My Children' 
          },
          content: { 
            fr: 'Vue d\'ensemble de vos enfants : profils complets, classes, écoles, performances académiques. Accès rapide aux notes, présences, devoirs. Suivi individualisé pour chaque enfant.',
            en: 'Overview of your children: complete profiles, classes, schools, academic performance. Quick access to grades, attendance, assignments. Individualized tracking for each child.'
          },
          icon: Users,
          color: 'bg-blue-500'
        },
        {
          title: { 
            fr: '💬 Communications', 
            en: '💬 Communications' 
          },
          content: { 
            fr: 'Communiquez avec les enseignants et l\'école : messages individuels, annonces de classe, alertes importantes. Historique complet des conversations. Réponses multicanal : Email, WhatsApp, notifications.',
            en: 'Communicate with teachers and school: individual messages, class announcements, important alerts. Complete conversation history. Multi-channel responses: Email, WhatsApp, notifications.'
          },
          icon: MessageSquare,
          color: 'bg-purple-500'
        },
        {
          title: { 
            fr: '📊 Résultats & Bulletins', 
            en: '📊 Results & Report Cards' 
          },
          content: { 
            fr: 'Consultez les bulletins de vos enfants : notes par trimestre, moyennes, rangs en classe, commentaires des enseignants. Téléchargement PDF. Suivi de progression graphique et analytiques.',
            en: 'View your children\'s report cards: grades by term, averages, class ranks, teacher comments. PDF download. Graphical progress tracking and analytics.'
          },
          icon: BarChart3,
          color: 'bg-green-500'
        },
        {
          title: { 
            fr: '📚 Bibliothèque', 
            en: '📚 Library' 
          },
          content: { 
            fr: 'Accédez aux ressources pédagogiques de vos enfants : cours, exercices, documents de référence. Consultez le matériel utilisé en classe. Recherche par matière et niveau.',
            en: 'Access your children\'s educational resources: lessons, exercises, reference documents. View materials used in class. Search by subject and level.'
          },
          icon: BookOpen,
          color: 'bg-purple-600'
        },
        {
          title: { 
            fr: '📹 Classes en Ligne', 
            en: '📹 Online Classes' 
          },
          content: { 
            fr: 'Suivez les cours en ligne de vos enfants : emploi du temps des sessions virtuelles, enregistrements disponibles, suivi de participation. Accès aux salles Jitsi Meet.',
            en: 'Follow your children\'s online classes: virtual session schedule, available recordings, participation tracking. Access to Jitsi Meet rooms.'
          },
          icon: Video,
          color: 'bg-purple-600'
        },
        {
          title: { 
            fr: '🎓 Cours Privés Enfants', 
            en: '🎓 Children Private Courses' 
          },
          content: { 
            fr: 'Gérez les cours particuliers de vos enfants : réservation de sessions avec enseignants indépendants, planning personnalisé, paiements sécurisés, suivi des progrès. Système de notation enseignants.',
            en: 'Manage your children\'s private lessons: book sessions with independent teachers, personalized schedule, secure payments, progress tracking. Teacher rating system.'
          },
          icon: User,
          color: 'bg-indigo-600'
        },
        {
          title: { 
            fr: '✅ Présences', 
            en: '✅ Attendance' 
          },
          content: { 
            fr: 'Suivez les présences de vos enfants en temps réel : absences, retards, justificatifs. Historique complet par enfant. Notifications automatiques pour chaque absence/retard. Statistiques d\'assiduité.',
            en: 'Track your children\'s attendance in real-time: absences, tardiness, justifications. Complete history per child. Automatic notifications for each absence/tardiness. Attendance statistics.'
          },
          icon: CheckCircle2,
          color: 'bg-orange-500'
        },
        {
          title: { 
            fr: '💳 Paiements', 
            en: '💳 Payments' 
          },
          content: { 
            fr: 'Gérez les paiements scolaires : frais de scolarité, cantine, transport, activités. Paiement en ligne sécurisé (Stripe, MTN Mobile Money). Historique complet et reçus PDF. Rappels automatiques.',
            en: 'Manage school payments: tuition fees, canteen, transport, activities. Secure online payment (Stripe, MTN Mobile Money). Complete history and PDF receipts. Automatic reminders.'
          },
          icon: CreditCard,
          color: 'bg-red-500'
        },
        {
          title: { 
            fr: '📅 Emploi du Temps Enfants', 
            en: '📅 Children Timetable' 
          },
          content: { 
            fr: 'Consultez l\'emploi du temps de chaque enfant : horaires de cours, salles, enseignants, matières. Vue quotidienne et hebdomadaire. Export iCal pour synchronisation calendrier.',
            en: 'View each child\'s timetable: class times, rooms, teachers, subjects. Daily and weekly view. iCal export for calendar synchronization.'
          },
          icon: Calendar,
          color: 'bg-purple-500'
        },
        {
          title: { 
            fr: '📍 Géolocalisation', 
            en: '📍 Geolocation' 
          },
          content: { 
            fr: 'Suivez la localisation de vos enfants en temps réel : position actuelle, historique des déplacements, zones de sécurité (maison, école). Alertes automatiques sortie de zone. Respect de la vie privée.',
            en: 'Track your children\'s location in real-time: current position, movement history, safety zones (home, school). Automatic zone exit alerts. Privacy respected.'
          },
          icon: MapPin,
          color: 'bg-emerald-500'
        },
        {
          title: { 
            fr: '🔔 Notifications', 
            en: '🔔 Notifications' 
          },
          content: { 
            fr: 'Centre de notifications : absences, nouveaux bulletins, messages enseignants, paiements dus, alertes géolocalisation. Filtrage par type et par enfant. Marquage lu/non lu.',
            en: 'Notification center: absences, new report cards, teacher messages, payments due, geolocation alerts. Filter by type and child. Mark read/unread.'
          },
          icon: Bell,
          color: 'bg-blue-600'
        },
        {
          title: { 
            fr: '📄 Demandes', 
            en: '📄 Requests' 
          },
          content: { 
            fr: 'Soumettez des demandes à l\'école : rendez-vous, certificats de scolarité, autorisations de sortie, réclamations. Suivi du statut en temps réel. Notifications de réponse. Historique complet.',
            en: 'Submit requests to the school: appointments, school certificates, exit authorizations, complaints. Real-time status tracking. Response notifications. Complete history.'
          },
          icon: FileText,
          color: 'bg-orange-500'
        },
        {
          title: { 
            fr: '⚙️ Paramètres Parent', 
            en: '⚙️ Parent Settings' 
          },
          content: { 
            fr: 'Gérez votre profil parent : informations personnelles, photo, préférences de notification (SMS/Email/WhatsApp), langue (Français/English). Sécurité du compte et gestion de la vie privée.',
            en: 'Manage your parent profile: personal information, photo, notification preferences (SMS/Email/WhatsApp), language (Français/English). Account security and privacy management.'
          },
          icon: User,
          color: 'bg-gray-500'
        },
        {
          title: { 
            fr: '👥 Multi-Rôles', 
            en: '👥 Multi-Roles' 
          },
          content: { 
            fr: 'Basculez entre vos rôles : Parent, Enseignant, Élève si vous en avez plusieurs. Interface unique, changement de contexte instantané. Préférences sauvegardées par rôle.',
            en: 'Switch between your roles: Parent, Teacher, Student if you have multiple. Single interface, instant context switching. Preferences saved per role.'
          },
          icon: User,
          color: 'bg-purple-600'
        },
        {
          title: { 
            fr: '❓ Aide', 
            en: '❓ Help' 
          },
          content: { 
            fr: 'Centre d\'aide : guides d\'utilisation pour parents, FAQ, tutoriels vidéo, contact support. Documentation complète bilingue. Chat en ligne avec support technique.',
            en: 'Help center: user guides for parents, FAQ, video tutorials, support contact. Complete bilingual documentation. Online chat with technical support.'
          },
          icon: HelpCircle,
          color: 'bg-cyan-500'
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
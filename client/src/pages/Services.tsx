import { useLanguage } from '@/contexts/LanguageContext';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  CreditCard,
  MapPin,
  FileText,
  Video,
  Shield,
  BarChart3,
  Bell
} from 'lucide-react';

export default function Services() {
  const { language } = useLanguage();

  const content = {
    en: {
      title: 'Our Services',
      subtitle: 'Comprehensive Educational Technology Solutions for Africa',
      description: 'Educafric provides a complete suite of digital tools designed specifically for African schools, teachers, parents, and students.',
      
      services: [
        {
          icon: GraduationCap,
          title: 'Academic Management',
          description: 'Complete school administration system including student enrollment, class management, grade tracking, and report card generation tailored to African curricula.'
        },
        {
          icon: Users,
          title: 'Multi-Role Platform',
          description: 'Dedicated dashboards for Directors, Teachers, Students, Parents, Freelancers, and Commercial teams with role-specific features and permissions.'
        },
        {
          icon: BookOpen,
          title: 'Grade & Bulletin Management',
          description: 'Digital grade entry, automatic calculation, African-style report cards (bulletins), competency-based assessments, and parent notifications.'
        },
        {
          icon: Calendar,
          title: 'Attendance Tracking',
          description: 'Real-time attendance monitoring, absence alerts, parent notifications via email and WhatsApp, and comprehensive attendance reports.'
        },
        {
          icon: FileText,
          title: 'Homework & Assignments',
          description: 'Assignment creation, distribution, submission tracking, grading, and feedback system for teachers and students.'
        },
        {
          icon: Video,
          title: 'Online Classes',
          description: 'Secure video conferencing with Jitsi Meet, timetable integration, attendance tracking, and recording capabilities for remote learning.'
        },
        {
          icon: MessageSquare,
          title: 'Communication System',
          description: 'Multi-channel notifications (Email, WhatsApp, Push), bilingual messaging, parent-teacher communication, and emergency alerts.'
        },
        {
          icon: CreditCard,
          title: 'Payment Management',
          description: 'Stripe integration for international payments, MTN Mobile Money for local transactions, subscription management, and payment tracking.'
        },
        {
          icon: MapPin,
          title: 'Geolocation Services',
          description: 'GPS tracking for student safety, geofencing, safe zone monitoring, real-time location updates, and emergency alerts for parents.'
        },
        {
          icon: Shield,
          title: 'Security & Privacy',
          description: 'Role-based access control, data encryption, GDPR compliance, secure authentication, and EU geo-blocking regulation compliance.'
        },
        {
          icon: BarChart3,
          title: 'Reports & Analytics',
          description: 'Performance analytics, attendance reports, academic progress tracking, school-wide statistics, and data-driven insights.'
        },
        {
          icon: Bell,
          title: 'PWA Notifications',
          description: 'Progressive Web App with offline capabilities, push notifications, mobile-first design, and cross-platform compatibility.'
        }
      ],

      features: 'Key Features',
      featuresList: [
        'Bilingual Support (French/English)',
        'Mobile-First Design',
        'Offline Capability',
        'Cloud-Based Storage',
        'Real-Time Synchronization',
        'Digital Signatures',
        'PDF Export & Generation',
        'WhatsApp Integration',
        'Email Notifications',
        'Bulk Import/Export',
        'Academic Calendar',
        'Timetable Management'
      ],

      cta: 'Ready to Transform Your School?',
      ctaText: 'Join hundreds of schools across Africa already using Educafric',
      contact: 'Contact Us Today',
      demo: 'Request a Demo'
    },
    fr: {
      title: 'Nos Services',
      subtitle: 'Solutions Complètes de Technologie Éducative pour l\'Afrique',
      description: 'Educafric fournit une suite complète d\'outils numériques conçus spécifiquement pour les écoles, enseignants, parents et élèves africains.',
      
      services: [
        {
          icon: GraduationCap,
          title: 'Gestion Académique',
          description: 'Système complet d\'administration scolaire incluant inscription des élèves, gestion des classes, suivi des notes et génération de bulletins adaptés aux curricula africains.'
        },
        {
          icon: Users,
          title: 'Plateforme Multi-Rôles',
          description: 'Tableaux de bord dédiés pour Directeurs, Enseignants, Élèves, Parents, Freelancers et équipes Commerciales avec fonctionnalités et permissions spécifiques.'
        },
        {
          icon: BookOpen,
          title: 'Gestion Notes & Bulletins',
          description: 'Saisie numérique des notes, calcul automatique, bulletins de style africain, évaluations par compétences et notifications aux parents.'
        },
        {
          icon: Calendar,
          title: 'Suivi des Présences',
          description: 'Surveillance en temps réel des présences, alertes d\'absence, notifications aux parents via email et WhatsApp, et rapports complets.'
        },
        {
          icon: FileText,
          title: 'Devoirs & Travaux',
          description: 'Création de travaux, distribution, suivi des soumissions, notation et système de feedback pour enseignants et élèves.'
        },
        {
          icon: Video,
          title: 'Cours en Ligne',
          description: 'Visioconférence sécurisée avec Jitsi Meet, intégration emploi du temps, suivi des présences et enregistrement pour apprentissage à distance.'
        },
        {
          icon: MessageSquare,
          title: 'Système de Communication',
          description: 'Notifications multi-canaux (Email, WhatsApp, Push), messagerie bilingue, communication parent-enseignant et alertes d\'urgence.'
        },
        {
          icon: CreditCard,
          title: 'Gestion des Paiements',
          description: 'Intégration Stripe pour paiements internationaux, MTN Mobile Money pour transactions locales, gestion abonnements et suivi paiements.'
        },
        {
          icon: MapPin,
          title: 'Services de Géolocalisation',
          description: 'Suivi GPS pour sécurité des élèves, géofencing, surveillance zones sûres, mises à jour en temps réel et alertes d\'urgence pour parents.'
        },
        {
          icon: Shield,
          title: 'Sécurité & Confidentialité',
          description: 'Contrôle d\'accès basé sur les rôles, chiffrement des données, conformité RGPD, authentification sécurisée et conformité réglementation UE.'
        },
        {
          icon: BarChart3,
          title: 'Rapports & Analyses',
          description: 'Analyses de performance, rapports de présence, suivi progrès académique, statistiques scolaires et insights basés sur les données.'
        },
        {
          icon: Bell,
          title: 'Notifications PWA',
          description: 'Application Web Progressive avec capacités hors ligne, notifications push, design mobile-first et compatibilité multi-plateforme.'
        }
      ],

      features: 'Fonctionnalités Clés',
      featuresList: [
        'Support Bilingue (Français/Anglais)',
        'Design Mobile-First',
        'Capacité Hors Ligne',
        'Stockage Cloud',
        'Synchronisation en Temps Réel',
        'Signatures Numériques',
        'Export & Génération PDF',
        'Intégration WhatsApp',
        'Notifications Email',
        'Import/Export en Masse',
        'Calendrier Académique',
        'Gestion Emploi du Temps'
      ],

      cta: 'Prêt à Transformer Votre École ?',
      ctaText: 'Rejoignez des centaines d\'écoles à travers l\'Afrique utilisant déjà Educafric',
      contact: 'Contactez-nous Aujourd\'hui',
      demo: 'Demander une Démo'
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
            {t.subtitle}
          </p>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
            {t.description}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div 
                  key={index} 
                  className="bg-card p-6 rounded-2xl shadow-lg border border-border hover:shadow-xl hover:border-primary/50 transition-all duration-300"
                  data-testid={`service-${index}`}
                >
                  <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">{t.features}</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {t.featuresList.map((feature, index) => (
              <div 
                key={index} 
                className="bg-card p-4 rounded-xl border border-border flex items-center gap-3 hover:border-primary/50 transition-colors"
                data-testid={`feature-${index}`}
              >
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.cta}</h2>
          <p className="text-xl mb-8 opacity-90">{t.ctaText}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:info@educafric.com" 
              className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              data-testid="button-contact"
            >
              {t.contact}
            </a>
            <a 
              href="https://wa.me/237656200472" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              data-testid="button-demo"
            >
              {t.demo}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

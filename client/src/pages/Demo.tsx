import { useState } from 'react';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import FrontpageNavbar from '@/components/FrontpageNavbar';
import FreemiumPricingPlans from '@/components/FreemiumPricingPlans';
import ParentFreemiumPlans from '@/components/ParentFreemiumPlans';
import TeacherFreelanceFreemiumPlans from '@/components/TeacherFreelanceFreemiumPlans';
import ModernSubscriptionPlans from '@/components/ModernSubscriptionPlans';
import GeolocationPricingPlans from '@/components/GeolocationPricingPlans';
import CurrencyDisplay from '@/components/currency/CurrencyDisplay';
// Demo video removed for GitHub build compatibility
// const demoVideo = '/demo-placeholder.mp4'; // Future: Add demo video to public folder

import { 
  Play, 
  Pause,
  Users, 
  GraduationCap, 
  BarChart3, 
  MessageCircle, 
  CreditCard, 
  Smartphone,
  ArrowRight,
  CheckCircle,
  Monitor,
  Tablet,
  Clock,
  Shield
} from 'lucide-react';

const Demo = () => {
  const { language } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);

  const text = {
    fr: {
      title: "Découvrez Educafric en Action",
      subtitle: "Démo Interactive",
      description: "Explorez notre plateforme éducative complète conçue spécifiquement pour les écoles africaines. Testez toutes les fonctionnalités dans un environnement de démonstration sécurisé.",
      watchDemo: "Regarder la Démo",
      tryLive: "Essayer en Direct",
      keyFeatures: "Fonctionnalités Clés",
      demoSteps: "Étapes de la Démo",
      getStarted: "Commencer",
      features: [
        {
          title: "Tableau de Bord Multi-Rôles",
          description: "Tableaux de bord séparés pour étudiants, enseignants, parents et administrateurs"
        },
        {
          title: "Gestion des Notes",
          description: "Système de notation complet avec bulletins de style africain"
        },
        {
          title: "Suivi de Présence",
          description: "Présence en temps réel avec notifications SMS aux parents"
        },
        {
          title: "Centre de Communication",
          description: "Intégration SMS, WhatsApp et email pour une communication fluide"
        },
        {
          title: "Intégration de Paiement",
          description: "Traitement de paiement sécurisé optimisé pour les marchés africains"
        },
        {
          title: "Conception Mobile-First",
          description: "Application Web Progressive avec capacités hors ligne"
        }
      ],
      steps: [
        {
          title: "Connexion avec Différents Rôles",
          description: "Découvrez la plateforme du point de vue étudiant, enseignant, parent ou administrateur"
        },
        {
          title: "Explorer la Gestion des Notes", 
          description: "Voyez comment les enseignants saisissent les notes et les parents reçoivent des notifications"
        },
        {
          title: "Tester les Fonctionnalités de Communication",
          description: "Envoyez des SMS de test et voyez les notifications en temps réel"
        },
        {
          title: "Essayer l'Expérience Mobile",
          description: "Installez comme PWA et découvrez la fonctionnalité hors ligne"
        }
      ]
    },
    en: {
      title: "Experience Educafric in Action",
      subtitle: "Interactive Demo",
      description: "Explore our comprehensive educational platform designed specifically for African schools. Test all features in a secure demonstration environment.",
      watchDemo: "Watch Demo",
      tryLive: "Try Live Demo",
      keyFeatures: "Key Features",
      demoSteps: "Demo Steps",
      getStarted: "Get Started",
      features: [
        {
          title: "Multi-Role Dashboard",
          description: "Separate dashboards for students, teachers, parents, and administrators"
        },
        {
          title: "Grade Management",
          description: "Comprehensive grading system with African-style report cards"
        },
        {
          title: "Attendance Tracking",
          description: "Real-time attendance with SMS notifications to parents"
        },
        {
          title: "Communication Hub",
          description: "SMS, WhatsApp, and email integration for seamless communication"
        },
        {
          title: "Payment Integration",
          description: "Secure payment processing optimized for African markets"
        },
        {
          title: "Mobile-First Design",
          description: "Progressive Web App with offline capabilities"
        }
      ],
      steps: [
        {
          title: "Login as Different Roles",
          description: "Experience the platform from student, teacher, parent, or admin perspective"
        },
        {
          title: "Explore Grade Management",
          description: "See how teachers input grades and parents receive notifications"
        },
        {
          title: "Test Communication Features",
          description: "Send test SMS and see real-time notifications in action"
        },
        {
          title: "Try Mobile Experience",
          description: "Install as PWA and experience offline functionality"
        }
      ]
    }
  };

  const t = text[language];

  const featureIcons = [
    Users,
    BarChart3,
    Clock,
    MessageCircle,
    CreditCard,
    Smartphone
  ];

  const stepIcons = [
    GraduationCap,
    BarChart3,
    MessageCircle,
    Monitor
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <FrontpageNavbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 gradient-hero">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-black/10 px-4 py-2 rounded-full mb-6">
              <Play className="w-5 h-5 text-black" />
              <span className="text-sm font-medium text-black">
                {t.subtitle}
              </span>
            </div>
            
            <h1 className="h1 text-black mb-6">
              {t.title || ''}
            </h1>
            
            <p className="text-xl text-black/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              {t.description || ''}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="btn btn-secondary bg-white text-primary border-white hover:bg-white/90 flex items-center space-x-3"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{t.watchDemo}</span>
              </button>
              
              <Link href="/login" className="btn btn-secondary text-black border-black hover:bg-black/10">
                {t.tryLive}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-20 bg-white-2 dark:bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="h2 text-black dark:text-foreground mb-4">
              {language === 'fr' ? 'Vidéo de Démonstration' : 'Demo Video'}
            </h2>
            <p className="text-lg text-black dark:text-muted-foreground max-w-3xl mx-auto">
              {language === 'fr' 
                ? 'Regardez une présentation complète de toutes les fonctionnalités de la plateforme Educafric en action.'
                : 'Watch a comprehensive walkthrough of all Educafric platform features in action.'
              }
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-card-foreground/5 rounded-2xl shadow-2xl overflow-hidden border border-border">
              <div className="aspect-video relative group">
                {!isPlaying ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center cursor-pointer transition-all duration-300 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700" onClick={() => setIsPlaying(true)}>
                    {/* Video thumbnail/preview background */}
                    <div className="absolute inset-0 bg-black/40">
                      {/* Video preview placeholder */}
                      <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                        <div className="text-center">
                          <GraduationCap className="w-20 h-20 text-white/50 mx-auto mb-4" />
                          <p className="text-white/70 text-lg">EDUCAFRIC Platform Preview</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center relative z-10">
                      <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 mx-auto hover:bg-white/30 hover:scale-110 transition-all duration-300 border-2 border-white/30">
                        <Play className="w-12 h-12 text-white ml-1 drop-shadow-lg" />
                      </div>
                      <p className="text-white text-xl font-bold mb-2 drop-shadow-lg">
                        {t.watchDemo}
                      </p>
                      <p className="text-white/90 text-base mb-4 drop-shadow-lg">
                        {language === 'fr' ? 'Présentation complète de la plateforme' : 'Comprehensive platform walkthrough'}
                      </p>
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-white text-sm font-medium">
                          {language === 'fr' ? 'Cliquez pour regarder' : 'Click to watch'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Floating play indicators */}
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-white text-sm font-medium">
                        {language === 'fr' ? 'Démo Vidéo' : 'Video Demo'}
                      </span>
                    </div>
                  </div>
                ) : (
                  // Demo video placeholder - actual video can be added to public folder
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center">
                    <div className="text-center">
                      <GraduationCap className="w-32 h-32 text-white/80 mx-auto mb-6" />
                      <h3 className="text-2xl font-bold text-white mb-4">EDUCAFRIC Demo</h3>
                      <p className="text-white/90 text-lg mb-6">Interactive platform demonstration</p>
                      <Link href="/login" className="btn btn-secondary bg-white text-purple-600 hover:bg-white/90">
                        Try Live Demo Instead
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setIsPlaying(false)}
                      className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
                    >
                      <Pause className="w-4 h-4" />
                      <span className="text-sm font-medium">Reset</span>
                    </button>
                  </div>
                  <Link href="/login">
                    <button className="btn btn-primary flex items-center space-x-2">
                      <span>{t.tryLive}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="h2 text-black dark:text-foreground mb-4">
              {t.keyFeatures}
            </h2>
            <p className="text-lg text-black dark:text-muted-foreground max-w-3xl mx-auto">
              Discover the comprehensive features that make Educafric the perfect solution for African educational institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(Array.isArray(t?.features) ? t.features : []).map((feature, index) => {
              const IconComponent = featureIcons[index];
              return (
                <div key={index} className="card-enhanced text-center group">
                  <div className="card-icon mb-6">
                    <IconComponent className="w-12 h-12" />
                  </div>
                  <h3 className="h3 mb-4 text-black dark:text-foreground group-hover:text-primary transition-colors">
                    {feature.title || ''}
                  </h3>
                  <p className="text-black dark:text-muted-foreground leading-relaxed">
                    {feature.description || ''}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Demo Steps Section */}
      <section className="py-20 bg-white-2 dark:bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="h2 text-black dark:text-foreground mb-4">
              {t.demoSteps}
            </h2>
            <p className="text-lg text-black dark:text-muted-foreground max-w-3xl mx-auto">
              Follow these steps to get the most out of your Educafric demo experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {(Array.isArray(t?.steps) ? t.steps : []).map((step, index) => {
              const IconComponent = stepIcons[index];
              return (
                <div key={index} className="flex items-start space-x-4 p-6 bg-background rounded-xl border border-border hover:shadow-lg transition-all duration-200">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {index + 1}
                      </span>
                      <h3 className="h4 text-black dark:text-foreground">
                        {step.title || ''}
                      </h3>
                    </div>
                    <p className="text-black dark:text-muted-foreground leading-relaxed">
                      {step.description || ''}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Demo Features */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="h2 text-black dark:text-foreground mb-4">
              {language === 'fr' ? 'Environnement de Démo Interactif' : 'Interactive Demo Environment'}
            </h2>
            <p className="text-lg text-black dark:text-muted-foreground max-w-3xl mx-auto">
              {language === 'fr' 
                ? 'Testez les fonctionnalités réelles de la plateforme dans un environnement sandbox sécurisé conçu spécifiquement pour l\'exploration.'
                : 'Test real platform features in a safe sandbox environment designed specifically for exploration.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-8 bg-background rounded-xl border border-border">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="h4 mb-4 text-black dark:text-foreground">
                {language === 'fr' ? 'Environnement Sécurisé' : 'Safe Environment'}
              </h3>
              <p className="text-black dark:text-muted-foreground">
                {language === 'fr' 
                  ? 'Toutes les données de démonstration sont temporaires et sécurisées. Aucune information réelle d\'étudiant n\'est utilisée.'
                  : 'All demo data is temporary and secure. No real student information is used.'
                }
              </p>
            </div>

            <div className="text-center p-8 bg-background rounded-xl border border-border">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Tablet className="w-8 h-8 text-primary" />
              </div>
              <h3 className="h4 mb-4 text-black dark:text-foreground">
                {language === 'fr' ? 'Multi-Appareils' : 'Multi-Device'}
              </h3>
              <p className="text-black dark:text-muted-foreground">
                {language === 'fr' 
                  ? 'Testez le design réactif sur ordinateur de bureau, tablette et appareils mobiles.'
                  : 'Test the responsive design on desktop, tablet, and mobile devices.'
                }
              </p>
            </div>

            <div className="text-center p-8 bg-background rounded-xl border border-border">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="h4 mb-4 text-black dark:text-foreground">
                {language === 'fr' ? 'Fonctionnalités Complètes' : 'Full Features'}
              </h3>
              <p className="text-black dark:text-muted-foreground">
                {language === 'fr' 
                  ? 'Accédez à toutes les fonctionnalités de la plateforme y compris les notifications, paiements et rapports.'
                  : 'Access all platform features including notifications, payments, and reports.'
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* All Subscription Plans - Choisissez Votre Formule */}
      <div id="pricing">
        <ModernSubscriptionPlans />
      </div>
      
      {/* Geolocation Pricing */}
      <GeolocationPricingPlans />
      
      {/* Additional Freemium Plans */}
      <FreemiumPricingPlans />
      <ParentFreemiumPlans />
      <TeacherFreelanceFreemiumPlans />

      {/* Call to Action */}
      <section className="py-20 gradient-primary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="h2 text-black dark:text-white mb-6">
            {language === 'fr' ? 'Prêt à Transformer Votre École ?' : 'Ready to Transform Your School?'}
          </h2>
          <p className="text-xl text-black dark:text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            {language === 'fr' 
              ? 'Découvrez comment Educafric peut révolutionner l\'éducation dans votre institution avec nos tarifs adaptés au marché africain.'
              : 'Start your free trial today and discover how Educafric can revolutionize education at your institution.'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/register" className="btn btn-secondary text-lg px-8 py-4 bg-white text-primary border-white hover:bg-white/90">
              {t.getStarted}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link href="/login" className="btn btn-secondary text-lg px-8 py-4 text-white border-white hover:bg-white/10">
              {t.tryLive}
            </Link>
          </div>
        </div>
      </section>


    </div>
  );
};

export default Demo;
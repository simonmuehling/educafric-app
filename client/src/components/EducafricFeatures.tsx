import { useLanguage } from '@/contexts/LanguageContext';
import { 
  BookOpen, 
  Users, 
  MessageCircle, 
  BarChart3, 
  Globe, 
  Shield,
  Smartphone,
  CreditCard,
  Award,
  Clock,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

export default function EducafricFeatures() {
  const { language } = useLanguage();

  const text = {
    fr: {
      title: "Pourquoi choisir Educafric ?",
      subtitle: "Construit spécifiquement pour les contextes éducatifs africains avec les fonctionnalités qui comptent le plus.",
      features: [
        {
          icon: BookOpen,
          title: "Gestion éducative complète",
          description: "Des notes à l'assiduité, des devoirs aux communications - tout dans une seule plateforme."
        },
        {
          icon: Globe,
          title: "Support bilingue",
          description: "Interfaces français et anglais avec contexte culturel pour l'éducation africaine."
        },
        {
          icon: Smartphone,
          title: "Optimisé mobile",
          description: "Intégration SMS et WhatsApp pour une communication transparente parent-enseignant."
        },
        {
          icon: Shield,
          title: "Sécurisé et fiable",
          description: "Sécurité de niveau entreprise avec protection des données et confidentialité."
        },
        {
          icon: Users,
          title: "Multi-rôle",
          description: "8 rôles utilisateurs différents avec des expériences sur mesure pour chaque type d'utilisateur."
        },
        {
          icon: BarChart3,
          title: "Analytiques avancées",
          description: "Tableaux de bord complets et rapports pour suivre les performances et la croissance."
        }
      ],
      stats: [
        { number: "1,200+", label: "Écoles desservies" },
        { number: "15,000+", label: "Enseignants actifs" },
        { number: "450,000+", label: "Étudiants gérés" },
        { number: "12", label: "Pays africains" }
      ]
    },
    en: {
      title: "Why Choose Educafric?",
      subtitle: "Built specifically for African educational contexts with features that matter most to schools, teachers, parents, and students.",
      features: [
        {
          icon: BookOpen,
          title: "Complete Education Management",
          description: "From grades to attendance, homework to communications - everything in one platform."
        },
        {
          icon: Globe,
          title: "Bilingual Support",
          description: "French and English interfaces with cultural context for African education."
        },
        {
          icon: Smartphone,
          title: "Mobile-Optimized",
          description: "SMS and WhatsApp integration for seamless parent-teacher communication."
        },
        {
          icon: Shield,
          title: "Secure & Reliable",
          description: "Enterprise-grade security with data protection and user privacy."
        },
        {
          icon: Users,
          title: "Multi-Role Support",
          description: "8 different user roles with tailored experiences for each type of user."
        },
        {
          icon: BarChart3,
          title: "Advanced Analytics",
          description: "Comprehensive dashboards and reports to track performance and growth."
        }
      ],
      stats: [
        { number: "1,200+", label: "Schools Served" },
        { number: "15,000+", label: "Active Teachers" },
        { number: "450,000+", label: "Students Managed" },
        { number: "12", label: "African Countries" }
      ]
    }
  };

  const t = text[language];

  return (
    <section className="py-20 bg-white-2 dark:bg-card">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="h2 text-foreground mb-4">
            {t.title || ''}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {t.features .map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="card-enhanced text-center group hover:shadow-xl transition-all duration-300">
                <div className="card-icon mb-6">
                  <IconComponent className="w-12 h-12" />
                </div>
                <h3 className="h3 mb-4 group-hover:text-primary transition-colors">
                  {feature.title || ''}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description || ''}
                </p>
              </div>
            );
          })}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {t.stats .map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold african-orange-text mb-2">
                {stat.number}
              </div>
              <div className="text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
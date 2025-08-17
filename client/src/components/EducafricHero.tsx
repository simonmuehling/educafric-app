import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight, BookOpen, Users, Globe, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EducafricHero() {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const text = {
    fr: {
      title: "Révolutionnez l'éducation africaine",
      subtitle: "avec la technologie numérique",
      description: "Plateforme éducative complète pour les écoles, enseignants, parents et étudiants à travers l'Afrique. Gestion scolaire moderne, communication multicanal et excellence pédagogique.",
      getStarted: "Commencer maintenant",
      watchDemo: "Voir la démo",
      features: {
        schools: "Écoles connectées",
        teachers: "Enseignants formés",
        students: "Étudiants actifs",
        countries: "Pays africains"
      },
      stats: {
        schools: "1,200+",
        teachers: "15,000+",
        students: "450,000+",
        countries: "12"
      }
    },
    en: {
      title: "Revolutionize African education",
      subtitle: "with digital technology",
      description: "Comprehensive educational platform for schools, teachers, parents and students across Africa. Modern school management, multi-channel communication and educational excellence.",
      getStarted: "Get Started Now",
      watchDemo: "Watch Demo",
      features: {
        schools: "Connected Schools",
        teachers: "Trained Teachers", 
        students: "Active Students",
        countries: "African Countries"
      },
      stats: {
        schools: "1,200+",
        teachers: "15,000+",
        students: "450,000+",
        countries: "12"
      }
    }
  };

  const t = text[language];

  if (!mounted) return null;

  return (
    <section className="relative min-h-screen flex items-center justify-center gradient-hero overflow-hidden">
      {/* Background Patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-20 h-20 african-orange-bg rounded-full blur-xl"></div>
        <div className="absolute top-32 right-20 w-32 h-32 african-purple-bg rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 african-orange-bg rounded-full blur-xl"></div>
        <div className="absolute bottom-32 right-10 w-16 h-16 african-purple-bg rounded-full blur-lg"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-6 pt-20 pb-16 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {t.title || ''}
            <span className="block african-orange-text">
              {t.subtitle}
            </span>
          </h1>
          
          {/* Description */}
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            {t.description || ''}
          </p>
          
          {/* Action Button */}
          <div className="flex justify-center items-center mb-16">
            <Link
              href="/demo"
              className="btn btn-secondary text-lg px-8 py-4 text-white border-white hover:bg-white/10"
            >
              {t.watchDemo}
            </Link>
          </div>
          
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="card-icon mb-4">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {t?.stats?.schools}
              </div>
              <div className="text-white/80 font-medium">
                {t?.features?.schools}
              </div>
            </div>
            
            <div className="text-center">
              <div className="card-icon mb-4">
                <Users className="w-12 h-12 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {t?.stats?.teachers}
              </div>
              <div className="text-white/80 font-medium">
                {t?.features?.teachers}
              </div>
            </div>
            
            <div className="text-center">
              <div className="card-icon mb-4">
                <Award className="w-12 h-12 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {t?.stats?.students}
              </div>
              <div className="text-white/80 font-medium">
                {t?.features?.students}
              </div>
            </div>
            
            <div className="text-center">
              <div className="card-icon mb-4">
                <Globe className="w-12 h-12 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {t?.stats?.countries}
              </div>
              <div className="text-white/80 font-medium">
                {t?.features?.countries}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
import FrontpageNavbar from '@/components/FrontpageNavbar';
import SandboxBanner from '@/components/SandboxBanner';
import FrontPagePWAInstallPrompt from '@/components/pwa/FrontPagePWAInstallPrompt';

// Lazy load heavy components for faster initial page load
import { lazy, Suspense } from 'react';
const ModernEducafricHero = lazy(() => import('@/components/ModernEducafricHero'));
const ModernFeatureSlider = lazy(() => import('@/components/ModernFeatureSlider'));
const ModernStatsSection = lazy(() => import('@/components/ModernStatsSection'));

import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'wouter';
import EducafricFooter from '@/components/EducafricFooter';

export default function Home() {
  const { language } = useLanguage();

  const text = {
    fr: {
      learnMore: 'En savoir plus',
      ctaTitle: 'Prêt à transformer l\'éducation africaine ?',
      ctaDescription: 'Rejoignez des milliers d\'écoles africaines qui utilisent déjà Educafric pour améliorer leur expérience éducative avec une technologie moderne, un support bilingue et des outils de gestion complets.'
    },
    en: {
      learnMore: 'Learn More',
      ctaTitle: 'Ready to Transform African Education?',
      ctaDescription: 'Join thousands of African schools already using Educafric to enhance their educational experience with modern technology, bilingual support, and comprehensive management tools.'
    }
  };

  const t = text[language];

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <FrontpageNavbar />
      
      {/* Hero Section */}
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 animate-pulse"></div>}>
        <ModernEducafricHero />
      </Suspense>

      {/* Sandbox Demo Banner */}
      <div className="container mx-auto px-6 -mt-8">
        <SandboxBanner />
      </div>

      {/* Features Section */}
      <Suspense fallback={<div className="py-20 bg-white"><div className="container mx-auto px-6 text-center"><div className="w-12 h-12 mx-auto border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div></div></div>}>
        <ModernFeatureSlider />
      </Suspense>

      {/* Stats Section */}
      <Suspense fallback={<div className="py-20 bg-white"><div className="container mx-auto px-6 text-center"><div className="w-12 h-12 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div></div>}>
        <ModernStatsSection />
      </Suspense>





      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            {t.ctaTitle}
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            {t.ctaDescription}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/demo">
              <button className="glass-card px-8 py-4 text-lg text-white border border-white/30 hover:bg-white/10 rounded-xl font-semibold transition-all">
                {t.learnMore}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* PWA Installation Prompt */}
      <FrontPagePWAInstallPrompt />

    </div>
  );
}
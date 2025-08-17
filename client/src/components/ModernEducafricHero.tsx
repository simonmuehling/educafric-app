import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Globe } from 'lucide-react';
import { Link } from 'wouter';

export default function ModernEducafricHero() {
  const { t, language } = useLanguage();

  return (
    <div className="hero-section relative min-h-screen">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 animate-bounce delay-300"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-gradient-to-r from-green-400 to-yellow-400 rounded-full opacity-20 animate-ping delay-700"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Sparkles className="w-4 h-4 mr-2 text-yellow-300" />
              <span className="text-white text-sm font-medium">
                {language === 'fr' ? 'Nouveau' : 'New'} · 
                {language === 'fr' ? 'Technologie Éducative Africaine' : 'African Education Technology'}
              </span>
            </div>

            {/* Main Title */}
            <h1 className="hero-title leading-tight">
              {language === 'fr' 
                ? 'Révolutionnez l\'éducation africaine avec la technologie numérique'
                : 'Revolutionize African education with digital technology'
              }
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-white/90 leading-relaxed">
              {language === 'fr'
                ? 'Plateforme éducative complète pour les écoles, enseignants, parents et étudiants à travers l\'Afrique. Gestion scolaire moderne, communication multicanal et excellence éducative.'
                : 'Comprehensive educational platform for schools, teachers, parents and students across Africa. Modern school management, multi-channel communication and educational excellence.'
              }
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/demo">
                <Button variant="outline" className="glass-card px-8 py-4 text-lg text-white border-white/30 hover:bg-white/10">
                  <Zap className="mr-2 w-5 h-5" />
                  {language === 'fr' ? 'Voir la Démo' : 'View Demo'}
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">2,847</div>
                <div className="text-sm text-white/70">
                  {language === 'fr' ? 'Étudiants' : 'Students'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">324</div>
                <div className="text-sm text-white/70">
                  {language === 'fr' ? 'Enseignants' : 'Teachers'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">45</div>
                <div className="text-sm text-white/70">
                  {language === 'fr' ? 'Écoles' : 'Schools'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              {/* Main 3D Card */}
              <div className="modern-card p-8 transform rotate-3 hover:rotate-0 transition-transform duration-700">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {language === 'fr' ? 'Plateforme Educafric' : 'Educafric Platform'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {language === 'fr' ? 'L\'Avenir de l\'Éducation en Afrique' : 'Africa\'s Education Future'}
                      </p>
                    </div>
                  </div>

                  {/* Feature Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="feature-card p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">📚</span>
                      </div>
                      <div className="text-xs font-semibold text-gray-700">
                        {language === 'fr' ? 'Gestion des Notes' : 'Grade Management'}
                      </div>
                    </div>

                    <div className="feature-card p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl">
                      <div className="w-8 h-8 bg-green-500 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">📱</span>
                      </div>
                      <div className="text-xs font-semibold text-gray-700">
                        {language === 'fr' ? 'Alertes SMS' : 'SMS Alerts'}
                      </div>
                    </div>

                    <div className="feature-card p-4 bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">📍</span>
                      </div>
                      <div className="text-xs font-semibold text-gray-700">
                        {language === 'fr' ? 'Géolocalisation' : 'Geolocation'}
                      </div>
                    </div>

                    <div className="feature-card p-4 bg-gradient-to-br from-orange-50 to-red-100 rounded-xl">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">💬</span>
                      </div>
                      <div className="text-xs font-semibold text-gray-700">
                        {language === 'fr' ? 'Communication' : 'Communication'}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>
                        {language === 'fr' ? 'Utilisation de la Plateforme' : 'Platform Usage'}
                      </span>
                      <span>94%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full w-[94%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center transform rotate-12 animate-bounce">
                <span className="text-2xl">🎓</span>
              </div>

              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center transform -rotate-12 animate-pulse">
                <span className="text-xl">🌍</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto">
          <path 
            fill="white" 
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,96C1248,75,1344,53,1392,42.7L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>
    </div>
  );
}
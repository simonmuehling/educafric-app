import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Globe, WifiOff, CloudOff, Signal, MapPin, Shield, FileText, School, GraduationCap } from 'lucide-react';
import { Link } from 'wouter';

export default function ModernEducafricHero() {
  const { t, language } = useLanguage();

  return (
    <div className="hero-section relative min-h-screen">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-20 bg-gradient-to-r from-pink-400 to-purple-400 rounded-lg opacity-20 animate-pulse transform rotate-12"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg opacity-20 animate-bounce delay-300 transform -rotate-6"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-12 bg-gradient-to-r from-green-400 to-yellow-400 rounded-lg opacity-20 animate-pulse delay-700 transform rotate-45"></div>
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

            {/* Slogan */}
            <div className="inline-block">
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent mb-6">
                {language === 'fr' 
                  ? 'Révolutionner l\'École, Transformer l\'Avenir'
                  : 'Revolutionize School, Transform the Future'
                }
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-xl text-white/90 leading-relaxed">
              {language === 'fr'
                ? 'Plateforme éducative complète pour les écoles, enseignants, parents et étudiants à travers l\'Afrique. Gestion scolaire moderne, communication multicanal et excellence éducative.'
                : 'Comprehensive educational platform for schools, teachers, parents and students across Africa. Modern school management, multi-channel communication and educational excellence.'
              }
            </p>

            {/* Offline Feature Banner - Highlighted */}
            <div className="glass-card p-5 rounded-2xl border-2 border-purple-400/50 bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-blue-600/30 backdrop-blur-sm shadow-lg shadow-purple-500/20">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                    <WifiOff className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-white font-bold text-xl">
                      {language === 'fr' 
                        ? '📴 Mode Hors-Ligne Premium' 
                        : '📴 Premium Offline Mode'
                      }
                    </h3>
                    <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full animate-bounce">
                      {language === 'fr' ? 'NOUVEAU' : 'NEW'}
                    </span>
                  </div>
                  <p className="text-purple-100 text-sm leading-relaxed">
                    {language === 'fr'
                      ? 'Travaillez sans connexion internet ! Gérez les notes, la présence, les bulletins et bien plus, même dans les zones rurales. Synchronisation automatique dès que vous êtes en ligne.'
                      : 'Work without internet connection! Manage grades, attendance, report cards and more, even in rural areas. Automatic sync when you\'re back online.'
                    }
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                    <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-white">
                      <CloudOff className="w-3 h-3" />
                      {language === 'fr' ? '12 Modules Hors-Ligne' : '12 Offline Modules'}
                    </span>
                    <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-white">
                      <Signal className="w-3 h-3" />
                      {language === 'fr' ? 'Sync Automatique' : 'Auto Sync'}
                    </span>
                    <span className="bg-green-400/30 px-2 py-1 rounded-full text-green-200 font-semibold">
                      {language === 'fr' ? '✓ Zones Rurales' : '✓ Rural Areas'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Geolocation Parent-Student Feature */}
              <div className="glass-card p-4 rounded-2xl border border-blue-400/40 bg-gradient-to-r from-blue-600/25 to-cyan-600/25 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold text-base">
                        {language === 'fr' 
                          ? '📍 Géolocalisation Parent-Élève' 
                          : '📍 Parent-Student Geolocation'
                        }
                      </h3>
                    </div>
                    <p className="text-blue-100 text-xs leading-relaxed mb-2">
                      {language === 'fr'
                        ? 'Suivez vos enfants en temps réel ! Alertes automatiques d\'arrivée/départ, zones de sécurité géofencing, et historique des déplacements.'
                        : 'Track your children in real-time! Automatic arrival/departure alerts, geofencing safety zones, and movement history.'
                      }
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-white">
                        <Shield className="w-3 h-3" />
                        {language === 'fr' ? 'Sécurité' : 'Safety'}
                      </span>
                      <span className="bg-cyan-400/30 px-2 py-0.5 rounded-full text-cyan-200">
                        {language === 'fr' ? '✓ Temps Réel' : '✓ Real-Time'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-Establishment Bulletin Feature */}
              <div className="glass-card p-4 rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-600/25 to-teal-600/25 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold text-base">
                        {language === 'fr' 
                          ? '📋 Bulletins Multi-Établissements' 
                          : '📋 Multi-Establishment Bulletins'
                        }
                      </h3>
                    </div>
                    <p className="text-emerald-100 text-xs leading-relaxed mb-2">
                      {language === 'fr'
                        ? 'Générez des bulletins conformes pour tous types d\'établissements : Général, Technique, Professionnel, Bilingue. Format ministère camerounais inclus.'
                        : 'Generate compliant report cards for all establishment types: General, Technical, Professional, Bilingual. Cameroon ministry format included.'
                      }
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-white">
                        <School className="w-3 h-3" />
                        {language === 'fr' ? 'Général' : 'General'}
                      </span>
                      <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-white">
                        <GraduationCap className="w-3 h-3" />
                        {language === 'fr' ? 'Technique' : 'Technical'}
                      </span>
                      <span className="bg-teal-400/30 px-2 py-0.5 rounded-full text-teal-200">
                        {language === 'fr' ? '✓ APC' : '✓ CBA'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/demo">
                <Button variant="outline" className="glass-card px-8 py-4 text-lg text-white border-white/30 hover:bg-white/10">
                  <Zap className="mr-2 w-5 h-5" />
                  {language === 'fr' ? 'Voir la Démo' : 'View Demo'}
                </Button>
              </Link>
            </div>

            {/* Stats - Enhanced with Offline Feature */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
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
              <div className="text-center bg-purple-500/20 rounded-lg p-3 border border-purple-300/30">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <WifiOff className="w-4 h-4 text-purple-300" />
                  <div className="text-3xl font-bold text-purple-300">12</div>
                </div>
                <div className="text-xs text-purple-200">
                  {language === 'fr' ? 'Modules Hors-Ligne' : 'Offline Modules'}
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
                  <div className="grid grid-cols-2 gap-3">
                    <div className="feature-card p-3 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">📚</span>
                      </div>
                      <div className="text-xs font-semibold text-gray-700">
                        {language === 'fr' ? 'Gestion des Notes' : 'Grade Management'}
                      </div>
                    </div>

                    <div className="feature-card p-3 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl">
                      <div className="w-8 h-8 bg-green-500 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">📱</span>
                      </div>
                      <div className="text-xs font-semibold text-gray-700">
                        {language === 'fr' ? 'Alertes SMS' : 'SMS Alerts'}
                      </div>
                    </div>

                    <div className="feature-card p-3 bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">📍</span>
                      </div>
                      <div className="text-xs font-semibold text-gray-700">
                        {language === 'fr' ? 'Géolocalisation' : 'Geolocation'}
                      </div>
                    </div>

                    <div className="feature-card p-3 bg-gradient-to-br from-orange-50 to-red-100 rounded-xl">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">💬</span>
                      </div>
                      <div className="text-xs font-semibold text-gray-700">
                        {language === 'fr' ? 'Communication' : 'Communication'}
                      </div>
                    </div>

                    <div className="feature-card p-3 bg-gradient-to-br from-cyan-50 to-teal-100 rounded-xl">
                      <div className="w-8 h-8 bg-cyan-500 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">🎥</span>
                      </div>
                      <div className="text-xs font-semibold text-gray-700">
                        {language === 'fr' ? 'Classes en Ligne' : 'Online Classes'}
                      </div>
                    </div>

                    <div className="feature-card p-3 bg-gradient-to-br from-rose-50 to-pink-100 rounded-xl">
                      <div className="w-8 h-8 bg-rose-500 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">📋</span>
                      </div>
                      <div className="text-xs font-semibold text-gray-700">
                        {language === 'fr' ? 'Bulletins de Notes' : 'Report Cards'}
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
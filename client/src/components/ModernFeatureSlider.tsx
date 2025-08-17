import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

interface FeatureCard {
  id: string;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  icon: string;
  gradient: string;
  primaryAction: string;
  primaryActionFr: string;
  href: string;
}

export default function ModernFeatureSlider() {
  const { t, language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const features: FeatureCard[] = [
    {
      id: 'grades',
      title: 'Grade Management',
      titleFr: 'Gestion des Notes',
      description: 'Comprehensive grading system with African-style report cards and automatic parent notifications.',
      descriptionFr: 'Système de notation complet avec bulletins de style africain et notifications automatiques aux parents.',
      icon: '📊',
      gradient: 'var(--card-gradient-1)',
      primaryAction: 'Manage Grades',
      primaryActionFr: 'Gérer les Notes',
      href: '/grades'
    },
    {
      id: 'communication',
      title: 'Communication Hub',
      titleFr: 'Centre de Communication',
      description: 'Connect with parents and students through SMS, WhatsApp, and email in French and English.',
      descriptionFr: 'Connectez-vous avec les parents et étudiants via SMS, WhatsApp et email en français et anglais.',
      icon: '💬',
      gradient: 'var(--card-gradient-2)',
      primaryAction: 'Send Messages',
      primaryActionFr: 'Envoyer Messages',
      href: '/communications'
    },
    {
      id: 'attendance',
      title: 'Attendance Tracking',
      titleFr: 'Suivi de Présence',
      description: 'Real-time attendance monitoring with instant SMS notifications to parents.',
      descriptionFr: 'Surveillance de présence en temps réel avec notifications SMS instantanées aux parents.',
      icon: '✅',
      gradient: 'var(--card-gradient-3)',
      primaryAction: 'Track Attendance',
      primaryActionFr: 'Suivre Présence',
      href: '/attendance'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % (Array.isArray(features) ? features.length : 0));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + (Array.isArray(features) ? features.length : 0)) % (Array.isArray(features) ? features.length : 0));
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">
            {language === 'fr' ? 'Fonctionnalités Puissantes' : 'Powerful Features'}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Découvrez les outils complets pour transformer l\'éducation africaine'
              : 'Discover comprehensive tools to transform African education'
            }
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative max-w-6xl mx-auto">
          <div className="slider overflow-hidden rounded-3xl">
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {(Array.isArray(features) ? features : []).map((feature, index) => (
                <div key={feature.id} className="card min-w-full">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Visual */}
                    <div className="visual relative">
                      <div className="modern-card p-12 h-full flex items-center justify-center">
                        <div className="text-center space-y-6">
                          <div className="text-8xl mb-8 animate-bounce">
                            {feature.icon}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="stats-card">
                              <div className="text-2xl font-bold text-purple-600">94%</div>
                              <div className="text-sm text-gray-600">{language === 'fr' ? 'Taux de Réussite' : 'Success Rate'}</div>
                            </div>
                            <div className="stats-card">
                              <div className="text-2xl font-bold text-blue-600">2.8k+</div>
                              <div className="text-sm text-gray-600">{language === 'fr' ? 'Utilisateurs Actifs' : 'Active Users'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="content">
                      <div className="meta space-y-6">
                        <h3 className="title">
                          {language === 'fr' ? feature.titleFr : feature.title}
                        </h3>
                        <p className="desc text-gray-600">
                          {language === 'fr' ? feature.descriptionFr : feature.description}
                        </p>
                      </div>

                      <div className="card-actions mt-8">
                        <Link href={feature.href}>
                          <Button className="gradient-btn group">
                            {language === 'fr' ? feature.primaryActionFr : feature.primaryAction}
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                        
                        <Link href="/demo">
                          <Button variant="outline" className="mt-4 lg:mt-0 lg:ml-4">
                            {language === 'fr' ? 'Voir Démo' : 'View Demo'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="slider-controls">
            <div className="slider-controls-wrapper">
              <Button
                variant="outline"
                size="icon"
                className="control-button prev glass-card"
                onClick={prevSlide}
                disabled={currentSlide === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="pagination">
                <div className="pagination-wrapper">
                  {(Array.isArray(features) ? features : []).map((_, index) => (
                    <button
                      key={index}
                      className={`marker ${index === currentSlide ? 'opacity-100' : 'opacity-30'}`}
                      onClick={() => setCurrentSlide(index)}
                    />
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="control-button next glass-card"
                onClick={nextSlide}
                disabled={currentSlide === (Array.isArray(features) ? features.length : 0) - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .slider {
          scroll-behavior: smooth;
        }
        
        .card {
          background: var(--card-gradient-1);
          border-radius: 24px;
          padding: 48px;
          box-shadow: var(--shadow-medium);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .visual {
          aspect-ratio: 1;
          border-radius: 24px;
          box-shadow: var(--shadow-strong);
          overflow: hidden;
        }
        
        .pagination {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin: 24px 0;
        }
        
        .marker {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--primary-gradient);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .control-button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .control-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }
        
        .control-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
          .card {
            padding: 24px;
          }
          
          .slider-controls-wrapper {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, School, GraduationCap, Globe, Zap, Shield } from 'lucide-react';

export default function ModernStatsSection() {
  const { language } = useLanguage();

  const stats = [
    {
      icon: <Users className="w-8 h-8" />,
      number: '2,847',
      label: language === 'fr' ? 'Étudiants Actifs' : 'Active Students',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      number: '324',
      label: language === 'fr' ? 'Enseignants' : 'Teachers',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: <School className="w-8 h-8" />,
      number: '45',
      label: language === 'fr' ? 'Écoles Partenaires' : 'Partner Schools',
      gradient: 'from-purple-500 to-violet-500'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      number: '12',
      label: language === 'fr' ? 'Pays Africains' : 'African Countries',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      number: '98.5%',
      label: language === 'fr' ? 'Temps de Disponibilité' : 'Uptime',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      number: '100%',
      label: language === 'fr' ? 'Sécurisé' : 'Secure',
      gradient: 'from-teal-500 to-green-500'
    }
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-purple-500 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-blue-500 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-500 rounded-full animate-ping delay-700"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">
            {language === 'fr' ? 'L\'Impact d\'Educafric' : 'Educafric\'s Impact'}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Des chiffres qui témoignent de notre engagement pour l\'excellence éducative en Afrique'
              : 'Numbers that speak to our commitment to educational excellence across Africa'
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {(Array.isArray(stats) ? stats : []).map((stat, index) => (
            <div 
              key={index}
              className="stats-card group hover:scale-105 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              
              <div className="text-3xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                {stat.number}
              </div>
              
              <div className="text-sm text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}
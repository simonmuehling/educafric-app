import React from 'react';
import { Button } from '@/components/ui/button';
import { TestTube, Play, Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SandboxBanner() {
  const { language } = useLanguage();

  const text = {
    en: {
      title: 'Test EDUCAFRIC for Free',
      subtitle: 'All premium features unlocked in demo mode',
      testNow: 'Test Platform',
      demo: 'Live Demo'
    },
    fr: {
      title: 'Testez EDUCAFRIC Gratuitement',
      subtitle: 'Toutes les fonctionnalités premium débloquées en mode démo',
      testNow: 'Tester la Plateforme',
      demo: 'Démo Live'
    }
  };

  const t = text[language];

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl shadow-lg mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <TestTube className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{t.title || ''}</h3>
            <p className="text-sm opacity-90">{t.subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center text-sm bg-white/20 px-3 py-1 rounded-full">
            <Eye className="w-4 h-4 mr-1" />
            {t.demo}
          </div>
          <Button
            onClick={() => {
              if (window && window.location) {
                window.location.href = '/sandbox-demo';
              }
            }}
            className="bg-white text-green-600 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>{t.testNow}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
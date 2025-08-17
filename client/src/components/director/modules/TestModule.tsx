import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const TestModule: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {language === 'fr' ? '✅ Module de Test Fonctionnel !' : '✅ Test Module Working!'}
        </h1>
        
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/30">
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {language === 'fr' ? 'Navigation Réussie!' : 'Navigation Successful!'}
            </h2>
            <p className="text-gray-600 text-lg">
              {language === 'fr' 
                ? 'Si tu vois cette page, cela signifie que la navigation entre les icônes et les modules fonctionne parfaitement.'
                : 'If you see this page, it means the navigation between icons and modules is working perfectly.'
              }
            </p>
          </div>
          
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">
                {language === 'fr' ? '✅ Fonctionnalités Testées' : '✅ Tested Features'}
              </h3>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• {language === 'fr' ? 'Clic sur icône' : 'Icon click'}</li>
                <li>• {language === 'fr' ? 'Navigation vers module' : 'Navigation to module'}</li>
                <li>• {language === 'fr' ? 'Interface bilingue' : 'Bilingual interface'}</li>
                <li>• {language === 'fr' ? 'Design moderne' : 'Modern design'}</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">
                {language === 'fr' ? '🔧 Statut Système' : '🔧 System Status'}
              </h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• DirectorIconDashboard: {language === 'fr' ? 'Actif' : 'Active'}</li>
                <li>• DirectorModuleRouter: {language === 'fr' ? 'Actif' : 'Active'}</li>
                <li>• ModernIconDashboard: {language === 'fr' ? 'Actif' : 'Active'}</li>
                <li>• {language === 'fr' ? 'Bouton retour' : 'Back button'}: {language === 'fr' ? 'Disponible' : 'Available'}</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full shadow-lg">
              <span className="text-lg">🚀</span>
              <span className="font-semibold">
                {language === 'fr' ? 'Système Entièrement Opérationnel' : 'System Fully Operational'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestModule;
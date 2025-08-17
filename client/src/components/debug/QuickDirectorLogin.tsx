import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const QuickDirectorLogin: React.FC = () => {
  const { login } = useAuth();
  const { language } = useLanguage();

  const handleDirectorLogin = async () => {
    try {
      console.log('🎯 Quick Director Login starting...');
      await login('director.demo@test?.educafric?.com', 'password');
      console.log('✅ Director login successful - should redirect automatically');
    } catch (error) {
      console.error('❌ Director login failed:', error);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto mt-8 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold text-green-800">
          🎯 Test Dashboard Directeur
        </h2>
        <p className="text-gray-600 text-sm">
          {language === 'fr' 
            ? 'Cliquez pour vous connecter directement en tant que directeur et voir les 14 icônes du dashboard école.'
            : 'Click to login directly as director and see the 14 school dashboard icons.'
          }
        </p>
        <Button 
          onClick={handleDirectorLogin}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
        >
          🏫 Connexion Directeur Immédiate
        </Button>
        <div className="text-xs text-gray-500 border-t pt-2">
          director.demo@test?.educafric?.com
        </div>
      </div>
    </Card>
  );
};

export default QuickDirectorLogin;
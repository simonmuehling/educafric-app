import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { GraduationCap, School, UserPlus, LogIn, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SandboxBanner() {
  const { language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const text = {
    en: {
      title: 'Test EDUCAFRIC for Free',
      subtitle: 'All premium features unlocked in demo mode',
      testNow: 'Test Platform',
      demo: 'Live Demo',
      dialogTitle: 'Account Required',
      dialogDescription: 'To test the EDUCAFRIC platform, you need to create an account or log in. This allows us to personalize your experience and save your progress.',
      createAccount: 'Create Account',
      login: 'Log In',
      cancel: 'Cancel'
    },
    fr: {
      title: 'Testez EDUCAFRIC Gratuitement',
      subtitle: 'Toutes les fonctionnalités premium débloquées en mode démo',
      testNow: 'Tester la Plateforme',
      demo: 'Démo Live',
      dialogTitle: 'Compte Requis',
      dialogDescription: 'Pour tester la plateforme EDUCAFRIC, vous devez créer un compte ou vous connecter. Cela nous permet de personnaliser votre expérience et de sauvegarder votre progression.',
      createAccount: 'Créer un Compte',
      login: 'Se Connecter',
      cancel: 'Annuler'
    }
  };

  const t = text[language];

  const handleTestPlatform = () => {
    setIsDialogOpen(true);
  };

  const handleCreateAccount = () => {
    setIsDialogOpen(false);
    if (window && window.location) {
      window.location.href = '/login?mode=register&redirect=/sandbox-demo';
    }
  };

  const handleLogin = () => {
    setIsDialogOpen(false);
    if (window && window.location) {
      window.location.href = '/login?redirect=/sandbox-demo';
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl shadow-lg mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{t.title || ''}</h3>
              <p className="text-sm opacity-90">{t.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center text-sm bg-white/20 px-3 py-1 rounded-full">
              <School className="w-4 h-4 mr-1" />
              {t.demo}
            </div>
            <Button
              onClick={handleTestPlatform}
              className="bg-white text-green-600 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
              data-testid="button-test-platform"
            >
              <span>{t.testNow}</span>
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white w-[95vw] max-w-[420px] mx-auto rounded-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              {t.dialogTitle}
            </h2>
            <p className="text-white/80 text-sm">EDUCAFRIC</p>
          </div>
          
          <div className="p-5 sm:p-6">
            <p className="text-gray-600 text-center text-sm sm:text-base leading-relaxed mb-6">
              {t.dialogDescription}
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={handleCreateAccount}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02]"
                data-testid="button-create-account-dialog"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                {t.createAccount}
              </Button>
              
              <Button
                onClick={handleLogin}
                variant="outline"
                className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 py-3 text-base font-semibold rounded-xl transition-all duration-200"
                data-testid="button-login-dialog"
              >
                <LogIn className="w-5 h-5 mr-2" />
                {t.login}
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 py-2 text-sm rounded-xl"
                data-testid="button-cancel-dialog"
              >
                {t.cancel}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
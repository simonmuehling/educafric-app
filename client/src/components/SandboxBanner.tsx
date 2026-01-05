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
      window.location.href = '/register';
    }
  };

  const handleLogin = () => {
    setIsDialogOpen(false);
    if (window && window.location) {
      window.location.href = '/login';
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
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <GraduationCap className="w-6 h-6 text-green-600" />
              {t.dialogTitle}
            </DialogTitle>
            <DialogDescription className="text-gray-600 pt-2">
              {t.dialogDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="w-full sm:w-auto"
              data-testid="button-cancel-dialog"
            >
              <X className="w-4 h-4 mr-2" />
              {t.cancel}
            </Button>
            <Button
              onClick={handleLogin}
              variant="outline"
              className="w-full sm:w-auto border-green-600 text-green-600 hover:bg-green-50"
              data-testid="button-login-dialog"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {t.login}
            </Button>
            <Button
              onClick={handleCreateAccount}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
              data-testid="button-create-account-dialog"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {t.createAccount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
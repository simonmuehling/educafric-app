import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, CreditCard, Zap } from 'lucide-react';

export default function SubscriptionSuccess() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();

  // Get plan from URL parameters
  const urlParams = new URLSearchParams(window?.location?.search);
  const planId = urlParams.get('plan');

  const text = {
    en: {
      title: 'Subscription Activated Successfully!',
      subtitle: 'Your payment has been processed and your subscription is now active',
      welcomeMessage: 'Welcome to Educafric Premium',
      activatedFeatures: 'Your premium features are now available',
      accessDashboard: 'Access Your Dashboard',
      supportMessage: 'If you have any questions, our support team is here to help',
      thankYou: 'Thank you for choosing Educafric',
      benefits: {
        instant: 'Instant activation',
        features: 'Full premium access',
        support: '24/7 customer support'
      }
    },
    fr: {
      title: 'Abonnement Activé avec Succès !',
      subtitle: 'Votre paiement a été traité et votre abonnement est maintenant actif',
      welcomeMessage: 'Bienvenue dans Educafric Premium',
      activatedFeatures: 'Vos fonctionnalités premium sont maintenant disponibles',
      accessDashboard: 'Accéder à Votre Tableau de Bord',
      supportMessage: 'Si vous avez des questions, notre équipe de support est là pour vous aider',
      thankYou: 'Merci d\'avoir choisi Educafric',
      benefits: {
        instant: 'Activation instantanée',
        features: 'Accès premium complet',
        support: 'Support client 24/7'
      }
    }
  };

  const t = text[language];

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user) {
      navigate('/login');
      return;
    }

    // Auto-redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      const roleRoutes = {
        'Parent': '/parents',
        'Teacher': '/teachers',
        'Student': '/students',
        'Freelancer': '/freelancer',
        'Commercial': '/commercial',
        'Admin': '/director',
        'Director': '/director',
        'SiteAdmin': '/admin'
      };
      navigate(roleRoutes[user.role as keyof typeof roleRoutes] || '/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  const handleAccessDashboard = () => {
    if (!user) return;
    
    const roleRoutes = {
      'Parent': '/parents',
      'Teacher': '/teachers',
      'Student': '/students',
      'Freelancer': '/freelancer',
      'Commercial': '/commercial',
      'Admin': '/director',
      'Director': '/director',
      'SiteAdmin': '/admin'
    };
    navigate(roleRoutes[user.role as keyof typeof roleRoutes] || '/');
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 mx-auto mb-8 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t.title || ''}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            {t.subtitle}
          </p>

          {/* Welcome Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t.welcomeMessage}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {t.activatedFeatures}
            </p>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <Zap className="w-6 h-6 text-green-500" />
                <span className="font-medium text-gray-800">{t?.benefits?.instant}</span>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-500" />
                <span className="font-medium text-gray-800">{t?.benefits?.features}</span>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-500" />
                <span className="font-medium text-gray-800">{t?.benefits?.support}</span>
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleAccessDashboard}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center justify-center space-x-2">
                <span>{t.accessDashboard}</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </Button>
          </div>

          {/* Support Message */}
          <div className="bg-gray-50 rounded-xl p-6">
            <p className="text-gray-600 mb-2">{t.supportMessage}</p>
            <p className="text-sm text-gray-500">
              {t.thankYou} 🎉
            </p>
          </div>

          {/* Auto-redirect notice */}
          <div className="mt-6 text-sm text-gray-500">
            {language === 'fr' 
              ? 'Redirection automatique vers votre tableau de bord dans quelques secondes...'
              : 'Automatically redirecting to your dashboard in a few seconds...'
            }
          </div>
        </div>
      </div>
    </div>
  );
}
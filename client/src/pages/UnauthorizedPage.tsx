import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'wouter';
import { Shield, ArrowLeft } from 'lucide-react';

const UnauthorizedPage = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const t = {
    title: language === 'fr' ? 'Accès Non Autorisé' : 'Unauthorized Access',
    message: language === 'fr' 
      ? 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.'
      : 'You do not have the necessary permissions to access this page.',
    roleInfo: language === 'fr'
      ? 'Votre rôle actuel'
      : 'Your current role',
    requiredRoles: language === 'fr'
      ? 'Rôles requis: Administrateur Site, Administrateur, Directeur'
      : 'Required roles: Site Admin, Admin, Director',
    backToDashboard: language === 'fr' ? 'Retour au Tableau de Bord' : 'Back to Dashboard',
    contactAdmin: language === 'fr' 
      ? 'Contactez votre administrateur pour obtenir l\'accès.'
      : 'Contact your administrator to request access.'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t.title || ''}</h1>
        
        <p className="text-gray-600 mb-6">{t.message}</p>
        
        {user && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-2">
              <strong>{t.roleInfo}:</strong> {user.role}
            </p>
            <p className="text-sm text-gray-600">{t.requiredRoles}</p>
          </div>
        )}
        
        <p className="text-sm text-gray-600 mb-6">{t.contactAdmin}</p>
        
        <Link href="/dashboard">
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto">
            <ArrowLeft className="w-4 h-4" />
            {t.backToDashboard}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
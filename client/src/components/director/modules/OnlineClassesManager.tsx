import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Video, Play, Users, Calendar, Settings, Plus, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface OnlineClassesManagerProps {
  className?: string;
}

const OnlineClassesManager: React.FC<OnlineClassesManagerProps> = ({ className }) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  const text = {
    fr: {
      title: 'Classes en ligne',
      subtitle: 'Gestion complète des sessions de visioconférence avec Jitsi Meet',
      overview: 'Vue d\'ensemble',
      create: 'Créer une session',
      manage: 'Gérer les sessions',
      settings: 'Paramètres',
      welcomeTitle: 'Bienvenue dans le module Classes en ligne',
      welcomeDesc: 'Créez et gérez des sessions de cours en visioconférence avec la technologie Jitsi Meet. Interface sécurisée et optimisée pour l\'éducation.',
      features: {
        unlimited: 'Sessions illimitées',
        secure: 'Connexions sécurisées',
        recording: 'Enregistrement intégré',
        attendance: 'Suivi de présence',
        bilingual: 'Interface bilingue',
        support: 'Support 24/7'
      },
      createSession: 'Créer une nouvelle session',
      noSessions: 'Aucune session active',
      comingSoon: 'Fonctionnalités complètes bientôt disponibles'
    },
    en: {
      title: 'Online Classes',
      subtitle: 'Complete management of video conference sessions with Jitsi Meet',
      overview: 'Overview',
      create: 'Create session',
      manage: 'Manage sessions',
      settings: 'Settings',
      welcomeTitle: 'Welcome to Online Classes Module',
      welcomeDesc: 'Create and manage video conference course sessions with Jitsi Meet technology. Secure and education-optimized interface.',
      features: {
        unlimited: 'Unlimited sessions',
        secure: 'Secure connections',
        recording: 'Integrated recording',
        attendance: 'Attendance tracking',
        bilingual: 'Bilingual interface',
        support: '24/7 Support'
      },
      createSession: 'Create new session',
      noSessions: 'No active sessions',
      comingSoon: 'Complete features coming soon'
    }
  };

  const t = text[language as keyof typeof text];

  const features = [
    {
      icon: <Video className="w-6 h-6" />,
      title: t.features.unlimited,
      color: 'bg-blue-500'
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: t.features.secure,
      color: 'bg-green-500'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: t.features.recording,
      color: 'bg-purple-500'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: t.features.attendance,
      color: 'bg-orange-500'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Video className="w-6 h-6 text-purple-600" />
            <span>{t.welcomeTitle}</span>
          </CardTitle>
          <CardDescription>{t.welcomeDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-4 rounded-lg bg-gray-50">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center text-white mx-auto mb-2`}>
                  {feature.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{feature.title}</span>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Plus className="w-4 h-4 mr-2" />
              {t.createSession}
            </Button>
            <Button variant="outline" className="flex-1">
              <Settings className="w-4 h-4 mr-2" />
              {t.settings}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{language === 'fr' ? 'Sessions actives' : 'Active Sessions'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t.noSessions}</p>
            <p className="text-sm mt-2">{t.comingSoon}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Video className="w-8 h-8 text-purple-600" />
            <span>{t.title}</span>
          </h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>

        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'overview', label: t.overview, icon: <Video className="w-4 h-4" /> },
            { id: 'create', label: t.create, icon: <Plus className="w-4 h-4" /> },
            { id: 'manage', label: t.manage, icon: <Calendar className="w-4 h-4" /> },
            { id: 'settings', label: t.settings, icon: <Settings className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'create' && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{language === 'fr' ? 'Création de session - Bientôt disponible' : 'Session Creation - Coming Soon'}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {activeTab === 'manage' && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{language === 'fr' ? 'Gestion des sessions - Bientôt disponible' : 'Session Management - Coming Soon'}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {activeTab === 'settings' && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{language === 'fr' ? 'Paramètres - Bientôt disponible' : 'Settings - Coming Soon'}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OnlineClassesManager;
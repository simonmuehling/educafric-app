import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageSquare, Lock, Crown, Users, Send, Bell, FileText, Calendar } from 'lucide-react';

const FreelancerCommunications = () => {
  const { language } = useLanguage();

  const text = {
    fr: {
      title: 'Communications',
      subtitle: 'Messagerie professionnelle avec élèves et parents',
      premiumRequired: 'Fonctionnalité Premium Requise',
      upgradeToPremium: 'Passer au Premium',
      features: [
        'Messagerie directe avec parents et élèves',
        'Rapports de progrès automatisés',
        'Notifications de séances et rappels',
        'Partage de documents et ressources',
        'Communication de groupe par classe',
        'Feedback détaillé post-séance',
        'Alertes d\'urgence et importantes',
        'Historique complet des échanges'
      ]
    },
    en: {
      title: 'Communications',
      subtitle: 'Professional messaging with students and parents',
      premiumRequired: 'Premium Feature Required',
      upgradeToPremium: 'Upgrade to Premium',
      features: [
        'Direct messaging with parents and students',
        'Automated progress reports',
        'Session notifications and reminders',
        'Document and resource sharing',
        'Group communication by class',
        'Detailed post-session feedback',
        'Emergency and important alerts',
        'Complete exchange history'
      ]
    }
  };

  const t = text[language as keyof typeof text];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-yellow-100 rounded-full">
              <Lock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.premiumRequired}</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {language === 'fr' 
              ? 'Communiquez efficacement avec les familles et maintenez un suivi professionnel.'
              : 'Communicate effectively with families and maintain professional follow-up.'}
          </p>
          <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8">
            <Crown className="w-5 h-5 mr-2" />
            {t.upgradeToPremium}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">
            {language === 'fr' ? 'Fonctionnalités de Communication' : 'Communication Features'}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Array.isArray(t.features) ? t.features : []).map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FreelancerCommunications;
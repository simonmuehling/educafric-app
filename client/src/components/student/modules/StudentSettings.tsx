import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Settings } from 'lucide-react';
import AccountManagement from '@/components/settings/AccountManagement';

const StudentSettings = () => {
  const { language } = useLanguage();

  const text = {
    fr: {
      title: 'Paramètres',
      subtitle: 'Gérez vos paramètres de compte'
    },
    en: {
      title: 'Settings',
      subtitle: 'Manage your account settings'
    }
  };

  const t = text[language as keyof typeof text];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title || ''}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      <ModernCard className="p-6">
        <AccountManagement />
      </ModernCard>
    </div>
  );
};

export default StudentSettings;
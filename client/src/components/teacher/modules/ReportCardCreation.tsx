import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const ReportCardCreation: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        {language === 'fr' ? 'Création de Bulletins' : 'Report Card Creation'}
      </h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-600">
          {language === 'fr' ? 'Créez et gérez les bulletins scolaires.' : 'Create and manage school report cards.'}
        </p>
      </div>
    </div>
  );
};

export default ReportCardCreation;
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const ParentRequestsManagement: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        {language === 'fr' ? 'Gestion Demandes Parents' : 'Parent Requests Management'}
      </h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-600">
          {language === 'fr' ? 'Gérez les demandes des parents d\'élèves.' : 'Manage parent requests.'}
        </p>
      </div>
    </div>
  );
};

export default ParentRequestsManagement;
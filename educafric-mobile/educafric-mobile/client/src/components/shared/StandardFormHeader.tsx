import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';

interface SchoolInfo {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  directorName?: string;
  officialInfo?: {
    regionaleMinisterielle?: string;
    delegationDepartementale?: string;
    arrondissement?: string;
    codeEtablissement?: string;
  };
}

interface StandardFormHeaderProps {
  title: string;
  documentType?: string;
  showLogo?: boolean;
  showOfficialInfo?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const StandardFormHeader: React.FC<StandardFormHeaderProps> = ({
  title,
  documentType,
  showLogo = true,
  showOfficialInfo = true,
  className = "",
  children
}) => {
  const { language } = useLanguage();

  // Fetch school information from settings (same source as bulletin)
  const { data: schoolData, isLoading } = useQuery({
    queryKey: ['/api/director/settings'],
    queryFn: async () => {
      const response = await fetch('/api/director/settings', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch school settings');
      const data = await response.json();
      console.log('[STANDARD_HEADER] School settings loaded:', data);
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2
  });

  const school: SchoolInfo = schoolData?.settings?.school || schoolData?.school || {};

  const text = {
    fr: {
      republic: 'RÉPUBLIQUE DU CAMEROUN',
      peace: 'Paix – Travail – Patrie',
      ministry: 'MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES',
      loading: 'Chargement des informations...'
    },
    en: {
      republic: 'REPUBLIC OF CAMEROON',
      peace: 'Peace – Work – Fatherland',
      ministry: 'MINISTRY OF SECONDARY EDUCATION',
      loading: 'Loading information...'
    }
  };

  const t = text[language as keyof typeof text] || text.fr;

  if (isLoading) {
    return (
      <div className={`standard-form-header ${className}`}>
        <div className="flex items-center justify-center p-4">
          <div className="text-center text-gray-600">
            {t.loading}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`standard-form-header bg-white border-b ${className}`}>
      {/* En-tête officiel Cameroun */}
      {showOfficialInfo && (
        <div className="text-center py-3 border-b bg-gray-50">
          <div className="text-sm font-semibold text-gray-800">
            {t.republic}
          </div>
          <div className="text-xs text-gray-600 italic">
            {t.peace}
          </div>
          <div className="text-sm font-medium text-gray-700 mt-1">
            {t.ministry}
          </div>
          {school.officialInfo?.regionaleMinisterielle && (
            <div className="text-xs text-gray-600 mt-1">
              {school.officialInfo.regionaleMinisterielle}
            </div>
          )}
          {school.officialInfo?.delegationDepartementale && (
            <div className="text-xs text-gray-600">
              {school.officialInfo.delegationDepartementale}
            </div>
          )}
        </div>
      )}

      {/* Informations de l'école */}
      <div className="flex items-center justify-between p-4">
        {showLogo && school.logoUrl && (
          <div className="flex-shrink-0">
            <img 
              src={school.logoUrl} 
              alt={`Logo ${school.name}`}
              className="h-16 w-16 object-contain"
            />
          </div>
        )}
        
        <div className="flex-1 text-center">
          <h1 className="text-xl font-bold text-gray-900">
            {school.name || "École"}
          </h1>
          {school.address && (
            <p className="text-sm text-gray-600 mt-1">
              {school.address}
            </p>
          )}
          <div className="flex justify-center items-center gap-4 mt-2 text-sm text-gray-600">
            {school.phone && (
              <span>Tel: {school.phone}</span>
            )}
            {school.email && (
              <span>Email: {school.email}</span>
            )}
          </div>
          
          {/* Titre du document */}
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-blue-800 uppercase">
              {title}
            </h2>
            {documentType && (
              <p className="text-sm text-gray-600 mt-1">
                {documentType}
              </p>
            )}
          </div>
        </div>

        {showLogo && !school.logoUrl && (
          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
            <span className="text-gray-400 text-xs text-center">Logo</span>
          </div>
        )}
      </div>

      {/* Contenu supplémentaire */}
      {children && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default StandardFormHeader;
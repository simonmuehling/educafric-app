import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DirectorDashboard from '@/components/director/DirectorDashboard';

const SchoolStats = () => {
  const { language } = useLanguage();
  
  // Forward to unified director dashboard
  return <DirectorDashboard />;
};

export default SchoolStats;
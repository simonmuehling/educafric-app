import React from 'react';
import { useParams } from 'wouter';
import DirectorDashboard from '@/components/director/DirectorDashboard';
import { OfflineWarningBanner } from '@/components/offline/OfflineWarningBanner';

const DirectorPage: React.FC = () => {
  const { module } = useParams<{ module?: string }>();
  
  return (
    <div>
      <OfflineWarningBanner />
      <DirectorDashboard activeModule={module} />
    </div>
  );
};

export default DirectorPage;
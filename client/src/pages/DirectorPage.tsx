import React from 'react';
import { useParams } from 'wouter';
import DirectorDashboard from '@/components/director/DirectorDashboard';

const DirectorPage: React.FC = () => {
  const { module } = useParams<{ module?: string }>();
  
  return <DirectorDashboard activeModule={module} />;
};

export default DirectorPage;
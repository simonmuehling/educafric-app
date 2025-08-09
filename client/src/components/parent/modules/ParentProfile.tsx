import React from 'react';
import UnifiedProfileManager from '@/components/shared/UnifiedProfileManager';

const ParentProfile = () => {
  return (
    <UnifiedProfileManager 
      userType="parent"
      showPhotoUpload={true} // Photos autorisées pour les parents
    />
  );
};

export default ParentProfile;
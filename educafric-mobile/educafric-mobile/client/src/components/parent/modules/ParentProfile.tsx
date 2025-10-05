import React from 'react';
import UnifiedProfileManager from '@/components/shared/UnifiedProfileManager';

const ParentProfile: React.FC = () => {
  return (
    <div className="p-4">
      <UnifiedProfileManager 
        userType="parent"
        showPhotoUpload={true} // Photos autorisées pour les parents
      />
    </div>
  );
};

export default ParentProfile;
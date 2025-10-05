import React from 'react';
import UnifiedProfileManager from '@/components/shared/UnifiedProfileManager';

const StudentProfile = () => {
  return (
    <UnifiedProfileManager 
      userType="student"
      showPhotoUpload={true} // Photos autorisées pour les étudiants
    />
  );
};

export default StudentProfile;
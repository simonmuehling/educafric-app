import React from 'react';
import UnifiedProfileManager from '@/components/shared/UnifiedProfileManager';

const FunctionalTeacherProfile = () => {
  return (
    <UnifiedProfileManager 
      userType="teacher"
      showPhotoUpload={false} // Pas de téléchargement de photos pour les enseignants
    />
  );
};

export default FunctionalTeacherProfile;
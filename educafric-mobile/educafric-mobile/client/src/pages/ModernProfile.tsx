import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UnifiedProfileManager from '@/components/shared/UnifiedProfileManager';

const ModernProfile = () => {
  const { user } = useAuth();
  
  // Déterminer le type d'utilisateur basé sur le rôle
  const getUserType = () => {
    if (!user?.role) return 'student';
    
    if (user.role.toLowerCase().includes('teacher') || 
        user.role.toLowerCase().includes('enseignant')) {
      return 'teacher';
    }
    
    if (user.role.toLowerCase().includes('parent')) {
      return 'parent';
    }
    
    return 'student';
  };

  const userType = getUserType();

  return (
    <div className="container mx-auto px-4 py-8">
      <UnifiedProfileManager 
        userType={userType as 'teacher' | 'student' | 'parent'}
        showPhotoUpload={userType !== 'teacher'} // Pas de photo pour les enseignants
      />
    </div>
  );
};

export default ModernProfile;
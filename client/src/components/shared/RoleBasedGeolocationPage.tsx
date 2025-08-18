import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ParentGeolocation } from '@/components/parent/modules/ParentGeolocation';
import { SchoolGeolocation } from '@/components/geolocation/SchoolGeolocation';

const RoleBasedGeolocationPage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
          <p className="text-gray-600 mt-2">Please wait while we load your geolocation interface</p>
        </div>
      </div>
    );
  }

  // Parents use the specialized parent interface
  if (user.role === 'Parent') {
    return <ParentGeolocation />;
  }

  // École roles don't have access to geolocation
  if (['Admin', 'Director', 'Teacher'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Géolocalisation non disponible</h2>
          <p className="text-gray-600 mb-4">
            Cette fonctionnalité est réservée aux parents pour le suivi de leurs enfants.
          </p>
          <p className="text-sm text-gray-500">
            Les écoles n'ont pas accès au système de géolocalisation des élèves pour des raisons de confidentialité.
          </p>
        </div>
      </div>
    );
  }

  // All other roles use the generic school geolocation interface
  return <SchoolGeolocation userRole={user.role} userId={user.id} schoolId={user.schoolId || 1} />;
};

export default RoleBasedGeolocationPage;
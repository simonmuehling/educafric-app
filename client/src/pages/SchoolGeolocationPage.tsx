import React from 'react';
import { useQuery } from '@tanstack/react-query';
import SchoolGeolocation from '@/components/geolocation/SchoolGeolocation';

function SchoolGeolocationPage() {
  const { data: user } = useQuery({ 
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const userRole = (user as any).role as 'Parent' | 'Teacher' | 'Director' | 'Admin' | 'SiteAdmin' | 'Freelancer';
  const schoolId = (user as any).schoolId || 1;

  return (
    <SchoolGeolocation 
      userRole={userRole} 
      userId={(user as any).id} 
      schoolId={schoolId} 
    />
  );
}

export default SchoolGeolocationPage;
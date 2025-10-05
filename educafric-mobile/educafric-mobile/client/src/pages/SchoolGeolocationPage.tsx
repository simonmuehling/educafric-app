import React from 'react';
import { useQuery } from '@tanstack/react-query';
import SchoolGeolocation from '@/components/geolocation/SchoolGeolocation';
import { GraduationCap } from 'lucide-react';

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
          <div className="flex flex-col items-center space-y-3">
            <GraduationCap className="h-12 w-12 text-blue-500 animate-pulse" />
            <div className="w-48 bg-gray-200 rounded-lg h-2">
              <div className="bg-blue-500 h-2 rounded-lg animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
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
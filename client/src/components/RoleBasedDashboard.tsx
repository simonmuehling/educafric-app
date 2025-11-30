import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'wouter';
import { GraduationCap } from 'lucide-react';

export default function RoleBasedDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // This component handles automatic redirection to role-specific dashboards
    
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <GraduationCap className="w-8 h-8 text-primary animate-pulse" />
          <div className="w-48 bg-gray-200 rounded-lg h-2">
            <div className="bg-primary h-2 rounded-lg animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-sm text-gray-600 animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Redirect to="/login" />;
  }

  // Redirect to role-specific dashboard
  const roleRoutes = {
    'Teacher': '/teacher',
    'Student': '/student', 
    'Parent': '/parent',
    'Commercial': '/commercial',
    'Admin': '/director',
    'Director': '/director',
    'SiteAdmin': '/admin'
  };

  const redirectPath = roleRoutes[user.role as keyof typeof roleRoutes] || '/student';
  
  // Debug logging for school admin redirection
  console.log(`🔄 RoleBasedDashboard redirect: ${user.role} → ${redirectPath}`);
  
  return <Redirect to={redirectPath} />;
}
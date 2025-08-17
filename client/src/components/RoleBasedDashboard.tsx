import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'wouter';

export default function RoleBasedDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // This component handles automatic redirection to role-specific dashboards
    
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
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
    'Freelancer': '/freelancer',
    'Commercial': '/commercial',
    'Admin': '/director',  // School Admin uses Director Dashboard
    'Director': '/director',
    'SiteAdmin': '/admin'  // Only SiteAdmin uses Admin Dashboard
  };

  const redirectPath = roleRoutes[user.role as keyof typeof roleRoutes] || '/student';
  
  // Debug logging for school admin redirection
  console.log(`🔄 RoleBasedDashboard redirect: ${user.role} → ${redirectPath}`);
  
  return <Redirect to={redirectPath} />;
}
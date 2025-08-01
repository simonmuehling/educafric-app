import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'wouter';
import UpdatedSandboxDashboard from '@/components/sandbox/UpdatedSandboxDashboard';
import { SandboxPremiumProvider } from '@/components/sandbox/SandboxPremiumProvider';

const SandboxPage = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // Allow access to sandbox for all authenticated users for comprehensive testing
  // Convert role to lowercase for comparison
  const userRole = user?.role?.toLowerCase();
  const allowedRoles = ['siteadmin', 'admin', 'director', 'teacher', 'parent', 'freelancer', 'student', 'commercial'];
  
  if (!user || !userRole || !allowedRoles.includes(userRole)) {
    // Debug: Log the role to help troubleshoot
    console.log('Sandbox access denied. User role:', user?.role, 'Allowed roles:', allowedRoles);
    return <Redirect to="/dashboard" />;
  }

  // Sandbox environment provides full premium access with realistic family/school relationships
  console.log(`🔬 Sandbox Access: ${user.email || ''} (${user.role}) - Full Premium Features Enabled`);

  return (
    <SandboxPremiumProvider>
      <UpdatedSandboxDashboard />
    </SandboxPremiumProvider>
  );
};

export default SandboxPage;
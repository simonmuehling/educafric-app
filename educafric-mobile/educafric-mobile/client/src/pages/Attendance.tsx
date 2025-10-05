import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'wouter';

export default function Attendance() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Redirect to="/login" />;
  }

  // Redirect to role-specific dashboard that contains attendance functionality
  const roleRoutes = {
    'Teacher': '/teacher',
    'Student': '/student', 
    'Parent': '/parent',
    'Admin': '/director',
    'Director': '/director',
    'SiteAdmin': '/admin'
  };

  const redirectPath = roleRoutes[user.role as keyof typeof roleRoutes] || '/student';
  
  return <Redirect to={redirectPath} />;
}
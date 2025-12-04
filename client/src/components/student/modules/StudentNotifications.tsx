/**
 * STUDENT NOTIFICATIONS MODULE
 * Uses the UnifiedNotificationCenter to display all notifications
 * Includes grade alerts, homework reminders, attendance notifications, etc.
 */

import { useAuth } from '@/contexts/AuthContext';
import UnifiedNotificationCenter from '@/components/shared/UnifiedNotificationCenter';

export const StudentNotifications = () => {
  const { user } = useAuth();

  return (
    <UnifiedNotificationCenter 
      userId={user?.id || 0} 
      userRole={user?.role || 'Student'} 
    />
  );
};

export default StudentNotifications;

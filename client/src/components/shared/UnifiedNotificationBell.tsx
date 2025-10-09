/**
 * UNIFIED NOTIFICATION BELL
 * Single notification bell component for all user profiles
 * Replaces duplicate implementations in DashboardNavbar and ModernDashboardLayout
 * Fully bilingual and mobile-responsive
 */

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications } from '@/contexts/NotificationContext';
import UnifiedNotificationCenter from './UnifiedNotificationCenter';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

interface UnifiedNotificationBellProps {
  className?: string;
  iconSize?: number;
  badgeSize?: 'sm' | 'md';
}

export const UnifiedNotificationBell = ({ 
  className = '', 
  iconSize = 5,
  badgeSize = 'md'
}: UnifiedNotificationBellProps) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user?.id) return null;

  const badgeSizeClasses = {
    sm: 'min-w-[16px] h-[16px] text-[10px]',
    md: 'min-w-[18px] h-[18px] text-xs'
  };

  return (
    <Popover open={showNotifications} onOpenChange={setShowNotifications}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative p-1 sm:p-2 ${className}`}
          data-testid="button-notifications"
          aria-label="Notifications"
        >
          <Bell className={`h-${iconSize} w-${iconSize} text-gray-600`} />
          {unreadCount > 0 && (
            <span 
              className={`absolute -top-1 -right-1 ${badgeSizeClasses[badgeSize]} bg-red-500 rounded-full flex items-center justify-center`}
              aria-label={`${unreadCount} unread notifications`}
            >
              <span className="text-white font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[min(95vw,420px)] p-0 max-h-[85vh] overflow-auto sm:rounded-lg rounded-none" 
        align="end"
        sideOffset={8}
        data-testid="notifications-popover"
      >
        <UnifiedNotificationCenter
          userId={user.id}
          userRole={user.role || 'Student'}
          className="border-0 shadow-none"
        />
      </PopoverContent>
    </Popover>
  );
};

export default UnifiedNotificationBell;

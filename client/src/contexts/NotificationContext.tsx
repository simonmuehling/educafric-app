/**
 * UNIFIED NOTIFICATION CONTEXT
 * Centralized notification state management for all user profiles
 * Supports bilingual content and safe action routing
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { useLocation } from 'wouter';

interface UnifiedNotification {
  id: number;
  userId: number;
  userRole: string;
  titleFr: string;
  titleEn: string;
  messageFr: string;
  messageEn: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  isRead: boolean;
  readAt?: string;
  actionRequired: boolean;
  actionType?: string;
  actionEntityId?: number;
  actionTargetRole?: string;
  actionIsExternal?: boolean;
  actionExternalUrl?: string;
  actionUrl?: string; // Legacy support
  actionText?: string; // Legacy support
  metadata?: any;
  senderRole?: string;
  senderId?: number;
  relatedEntityType?: string;
  relatedEntityId?: number;
  createdAt: string;
}

interface NotificationContextType {
  notifications: UnifiedNotification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  executeAction: (notification: UnifiedNotification) => void;
  getLocalizedTitle: (notification: UnifiedNotification) => string;
  getLocalizedMessage: (notification: UnifiedNotification) => string;
  refetch: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading, refetch } = useQuery<UnifiedNotification[]>({
    queryKey: ['/pwa/notifications/pending', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const response = await fetch(`/pwa/notifications/pending/${user.id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('[UNIFIED_NOTIFICATIONS] Failed to fetch:', response.status);
        return [];
      }
      
      const data = await response.json();
      return data || [];
    },
    enabled: !!user?.id,
    refetchInterval: 15000, // Poll every 15 seconds
  });

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(`/api/notifications/${notificationId}/mark-read`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/pwa/notifications/pending', user?.id] });
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to mark all notifications as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/pwa/notifications/pending', user?.id] });
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete notification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/pwa/notifications/pending', user?.id] });
    }
  });

  // Safe action routing based on actionType
  const executeAction = useCallback((notification: UnifiedNotification) => {
    console.log('[UNIFIED_NOTIFICATIONS] Executing action:', notification.actionType, notification);
    
    // Mark as read when action is clicked
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    // Handle external links
    if (notification.actionIsExternal && notification.actionExternalUrl) {
      window.open(notification.actionExternalUrl, '_blank');
      return;
    }

    // Route based on actionType (safe routing, no 404s)
    if (notification.actionType) {
      const routes = getActionRoute(notification.actionType, notification.actionEntityId, user?.role || '');
      if (routes) {
        navigate(routes);
        return;
      }
    }

    // Fallback to legacy actionUrl if available
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  }, [markAsReadMutation, navigate, user?.role]);

  // Get localized title
  const getLocalizedTitle = useCallback((notification: UnifiedNotification) => {
    return language === 'fr' ? notification.titleFr : notification.titleEn;
  }, [language]);

  // Get localized message
  const getLocalizedMessage = useCallback((notification: UnifiedNotification) => {
    return language === 'fr' ? notification.messageFr : notification.messageEn;
  }, [language]);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: (id: number) => markAsReadMutation.mutateAsync(id),
    markAllAsRead: () => markAllAsReadMutation.mutateAsync(),
    deleteNotification: (id: number) => deleteNotificationMutation.mutateAsync(id),
    executeAction,
    getLocalizedTitle,
    getLocalizedMessage,
    refetch
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Safe action routing helper - maps actionType to actual routes
function getActionRoute(actionType: string, entityId?: number, userRole?: string): string | null {
  const rolePrefix = userRole ? `/${userRole.toLowerCase()}` : '';
  
  // Role-specific routing for bulletin submissions
  const roleRoutes: Record<string, Record<string, string>> = {
    director: {
      'bulletin_submission': 'academic-management',
      'view_bulletin': 'academic-management',
      'review_bulletin': 'academic-management',
    },
    teacher: {
      'bulletin_submission': 'teacher-bulletins',
      'view_bulletin': 'teacher-bulletins',
    },
    siteadmin: {
      'bulletin_submission': 'siteadmin-schools',
      'view_bulletin': 'siteadmin-schools',
    }
  };
  
  // Check for role-specific routes first
  const lowerRole = (userRole || '').toLowerCase();
  if (roleRoutes[lowerRole] && roleRoutes[lowerRole][actionType]) {
    return `/${lowerRole}?module=${roleRoutes[lowerRole][actionType]}`;
  }
  
  const routeMap: Record<string, string> = {
    // Academic actions
    'view_grade': entityId ? `/grades/${entityId}` : '/grades',
    'view_bulletin': entityId ? `/bulletins/${entityId}` : '/bulletins',
    'view_homework': entityId ? `/homework/${entityId}` : '/homework',
    'view_attendance': entityId ? `/attendance/${entityId}` : '/attendance',
    
    // Bulletin submission for Director - navigate to academic management module
    'bulletin_submission': '/director?module=academic-management',
    'review_bulletin': '/director?module=academic-management',
    
    // Financial actions
    'view_payment': entityId ? `/payments/${entityId}` : '/payments',
    'pay_invoice': entityId ? `/payments/pay/${entityId}` : '/payments',
    'view_subscription': '/subscription',
    
    // Communication actions
    'view_message': entityId ? `/messages/${entityId}` : '/messages',
    'reply_message': entityId ? `/messages/${entityId}/reply` : '/messages',
    
    // Geolocation actions
    'view_location': entityId ? `/geolocation/${entityId}` : '/geolocation',
    'view_safe_zone': entityId ? `/safe-zones/${entityId}` : '/safe-zones',
    
    // Notification center
    'view_notifications': '/notifications',
    
    // System actions
    'view_settings': '/settings',
    'verify_email': '/verify-email',
    'view_details': entityId ? `/details/${entityId}` : '/details',
  };

  return routeMap[actionType] || null;
}

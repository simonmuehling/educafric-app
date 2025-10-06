import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  BookOpen, 
  DollarSign, 
  Users, 
  Calendar,
  MessageSquare,
  Shield,
  Clock,
  ExternalLink,
  Filter,
  Trash2,
  Smartphone,
  Settings
} from 'lucide-react';
// Removed apiRequest import - using fetch with credentials instead
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import notificationService from '@/services/notificationService';
import PWANotificationManager from './PWANotificationManager';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  isRead: boolean;
  readAt?: string;
  actionRequired: boolean;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  senderRole?: string;
  relatedEntityType?: string;
}

interface NotificationCenterProps {
  userRole: 'Director' | 'Teacher' | 'Parent' | 'Student' | 'Freelancer';
  userId: number;
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  userRole, 
  userId, 
  className = '' 
}) => {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  const text = {
    fr: {
      title: 'Centre de Notifications',
      subtitle: 'Toutes vos notifications importantes',
      markAllRead: 'Tout marquer comme lu',
      markRead: 'Marquer comme lu',
      delete: 'Supprimer',
      viewAll: 'Voir tout',
      filterUnread: 'Non lues seulement',
      filterAll: 'Toutes',
      noNotifications: 'Aucune notification',
      noNotificationsDesc: 'Vous êtes à jour ! Aucune nouvelle notification.',
      categories: {
        all: 'Toutes',
        academic: 'Académique',
        administrative: 'Administratif',
        financial: 'Financier',
        security: 'Sécurité',
        communication: 'Communication'
      },
      priorities: {
        low: 'Faible',
        medium: 'Moyenne',
        high: 'Élevée',
        urgent: 'Urgent'
      },
      types: {
        grade: 'Note',
        attendance: 'Présence',
        homework: 'Devoir',
        payment: 'Paiement',
        announcement: 'Annonce',
        meeting: 'Réunion',
        emergency: 'Urgence',
        system: 'Système',
        geolocation: 'Géolocalisation',
        safe_zone_created: 'Zone créée',
        safe_zone_updated: 'Zone modifiée',
        safe_zone_deleted: 'Zone supprimée',
        zone_entry: 'Entrée zone',
        zone_exit: 'Sortie zone',
        location_alert: 'Alerte position',
        device_status: 'Statut appareil'
      },
      timeAgo: 'il y a'
    },
    en: {
      title: 'Notification Centre',
      subtitle: 'All your important notifications',
      markAllRead: 'Mark all as read',
      markRead: 'Mark as read',
      delete: 'Delete',
      viewAll: 'View all',
      filterUnread: 'Unread only',
      filterAll: 'All',
      noNotifications: 'No notifications',
      noNotificationsDesc: 'You\'re all caught up! No new notifications.',
      categories: {
        all: 'All',
        academic: 'Academic',
        administrative: 'Administrative',
        financial: 'Financial',
        security: 'Security',
        communication: 'Communication'
      },
      priorities: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        urgent: 'Urgent'
      },
      types: {
        grade: 'Grade',
        attendance: 'Attendance',
        homework: 'Homework',
        payment: 'Payment',
        announcement: 'Announcement',
        meeting: 'Meeting',
        emergency: 'Emergency',
        system: 'System',
        geolocation: 'Geolocation',
        safe_zone_created: 'Zone Created',
        safe_zone_updated: 'Zone Updated',
        safe_zone_deleted: 'Zone Deleted',
        zone_entry: 'Zone Entry',
        zone_exit: 'Zone Exit',
        location_alert: 'Location Alert',
        device_status: 'Device Status'
      },
      timeAgo: 'ago'
    }
  };

  const t = text[language as keyof typeof text];

  // State for PWA notifications
  const [showPWAManager, setShowPWAManager] = useState(false);
  const [realTimeNotifications, setRealTimeNotifications] = useState<Notification[]>([]);

  // Fetch notifications - FIXED: Use PWA endpoints that work!
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/pwa/notifications/pending', userId],
    queryFn: async () => {
      
      const response = await fetch(`/pwa/notifications/pending/${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('[NOTIFICATIONS_UI] ❌ PWA endpoint failed:', response.status);
        return [];
      }
      
      const data = await response.json();
      return data || [];
    },
    enabled: !!userId,
    refetchInterval: 10000 // Poll every 10 seconds like a real PWA
  });

  // Combine real-time and fetched notifications
  const allNotifications = [...realTimeNotifications, ...(notifications || [])];

  // Initialize notification service and listen for real-time notifications
  useEffect(() => {
    const initializeNotifications = async () => {
      await notificationService.initialize();
      
      // Listen for real-time notifications
      const unsubscribe = notificationService.onNotification((notification) => {
        setRealTimeNotifications(prev => {
          // Avoid duplicates
          const exists = prev.some(n => n.id === notification.id);
          if (!exists) {
            return [notification, ...prev];
          }
          return prev;
        });
        
        // Refresh the query to get updated data
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      });

      return unsubscribe;
    };

    initializeNotifications();
  }, [queryClient]);

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
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'grade': return BookOpen;
      case 'attendance': return Users;
      case 'homework': return BookOpen;
      case 'payment': return DollarSign;
      case 'announcement': return MessageSquare;
      case 'meeting': return Calendar;
      case 'emergency': return AlertTriangle;
      case 'system': return Info;
      case 'geolocation':
      case 'safe_zone_created':
      case 'safe_zone_updated':
      case 'safe_zone_deleted':
      case 'zone_entry':
      case 'zone_exit':
      case 'location_alert':
      case 'device_status': return Shield;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredNotifications = allNotifications.filter((notification: Notification) => {
    const categoryMatch = selectedCategory === 'all' || notification.category === selectedCategory;
    const readMatch = !showOnlyUnread || !notification.isRead;
    return categoryMatch && readMatch;
  });

  const unreadCount = allNotifications.filter((n: Notification) => !n.isRead).length;

  const formatTimeAgo = (dateString: string) => {
    // Validation de la date pour éviter "Invalid time value"
    if (!dateString) {
      return language === 'fr' ? 'Il y a quelques instants' : 'A few moments ago';
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return language === 'fr' ? 'Date inconnue' : 'Unknown date';
    }
    
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: language === 'fr' ? fr : enUS
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center text-xs bg-red-500 text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t.title}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPWAManager(!showPWAManager)}
            data-testid="button-toggle-pwa-manager"
          >
            <Smartphone className="w-4 h-4 mr-2" />
            PWA
          </Button>
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              data-testid="button-mark-all-read"
            >
              <Check className="w-4 h-4 mr-2" />
              {t.markAllRead}
            </Button>
          )}
        </div>
      </div>

      {/* Filters - Sticky sur mobile */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
        <Filter className="w-4 h-4 text-gray-500" />
        
        {/* Category filter */}
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1 border rounded-md text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          data-testid="select-category-filter"
        >
          {Object.entries(t.categories).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        {/* Read status filter */}
        <Button
          variant={showOnlyUnread ? "default" : "outline"}
          size="sm"
          onClick={() => setShowOnlyUnread(!showOnlyUnread)}
          data-testid="button-filter-unread"
        >
          {showOnlyUnread ? t.filterUnread : t.filterAll}
        </Button>
        </div>
      </div>

      {/* PWA Notification Manager */}
      {showPWAManager && (
        <div className="mb-6">
          <PWANotificationManager 
            userId={userId} 
            userRole={userRole}
            onNotificationPermissionChange={(granted) => {
              console.log('PWA notification permission:', granted);
            }}
          />
        </div>
      )}

      {/* Notifications List */}
      <ModernCard>
        <ScrollArea 
          className="max-h-[70vh] sm:max-h-[60vh] h-auto overflow-y-auto overscroll-contain touch-pan-y scroll-smooth" 
          data-testid="notifications-scroll-area"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <Bell className="w-12 h-12 mb-4 opacity-50" />
              <h3 className="font-medium">{t.noNotifications}</h3>
              <p className="text-sm">{t.noNotificationsDesc}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification: Notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                
                return (
                  <div
                    key={notification.id}
                    className={`p-3 sm:p-4 rounded-lg border transition-colors ${
                      notification.isRead 
                        ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                    }`}
                    data-testid={`notification-item-${notification.id}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        notification.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                        notification.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2 ml-2">
                            <Badge className={getPriorityColor(notification.priority)}>
                              {t.priorities[notification.priority as keyof typeof t.priorities]}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm line-clamp-2 sm:line-clamp-none">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 sm:w-3 sm:h-3 mr-1" />
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {notification.type && (
                              <Badge variant="secondary" className="text-xs">
                                {t.types[notification.type as keyof typeof t.types] || notification.type}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {notification.actionRequired && notification.actionUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                data-testid={`button-action-${notification.id}`}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                {notification.actionText || 'Action'}
                              </Button>
                            )}
                            
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="min-h-[44px] sm:min-h-auto"
                                onClick={() => markAsReadMutation.mutate(notification.id)}
                                disabled={markAsReadMutation.isPending}
                                data-testid={`button-mark-read-${notification.id}`}
                                aria-label="Marquer comme lu"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="min-h-[44px] sm:min-h-auto text-red-600 hover:text-red-700"
                              onClick={() => deleteNotificationMutation.mutate(notification.id)}
                              disabled={deleteNotificationMutation.isPending}
                              data-testid={`button-delete-${notification.id}`}
                              aria-label="Supprimer la notification"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </ModernCard>
    </div>
  );
};

export default NotificationCenter;
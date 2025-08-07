import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Trash2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

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
        system: 'Système'
      },
      timeAgo: 'il y a'
    },
    en: {
      title: 'Notification Center',
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
        system: 'System'
      },
      timeAgo: 'ago'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications', userRole, userId, selectedCategory, showOnlyUnread],
    enabled: !!userId
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest('POST', `/api/notifications/${notificationId}/mark-read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => 
      apiRequest('POST', '/api/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest('DELETE', `/api/notifications/${notificationId}`),
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

  const filteredNotifications = (notifications as Notification[]).filter((notification: Notification) => {
    const categoryMatch = selectedCategory === 'all' || notification.category === selectedCategory;
    const readMatch = !showOnlyUnread || !notification.isRead;
    return categoryMatch && readMatch;
  });

  const unreadCount = (notifications as Notification[]).filter((n: Notification) => !n.isRead).length;

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
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

      {/* Filters */}
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

      {/* Notifications List */}
      <ModernCard>
        <ScrollArea className="h-[600px]" data-testid="notifications-scroll-area">
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
                    className={`p-4 rounded-lg border transition-colors ${
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
                        
                        <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
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
                                onClick={() => markAsReadMutation.mutate(notification.id)}
                                disabled={markAsReadMutation.isPending}
                                data-testid={`button-mark-read-${notification.id}`}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotificationMutation.mutate(notification.id)}
                              disabled={deleteNotificationMutation.isPending}
                              className="text-red-600 hover:text-red-700"
                              data-testid={`button-delete-${notification.id}`}
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
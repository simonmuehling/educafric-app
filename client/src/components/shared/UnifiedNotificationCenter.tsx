/**
 * UNIFIED BILINGUAL NOTIFICATION CENTER
 * Consolidated notification center using NotificationContext
 * Mobile-responsive with safe action routing
 */

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotifications } from '@/contexts/NotificationContext';
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
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface UnifiedNotificationCenterProps {
  userId: number;
  userRole: string;
  className?: string;
}

const UnifiedNotificationCenter = ({ className = '' }: UnifiedNotificationCenterProps) => {
  const { language } = useLanguage();
  const { 
    notifications, 
    unreadCount, 
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    executeAction,
    getLocalizedTitle,
    getLocalizedMessage
  } = useNotifications();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  const text = {
    fr: {
      title: 'Centre de Notifications',
      subtitle: 'Toutes vos notifications importantes',
      markAllRead: 'Tout marquer comme lu',
      delete: 'Supprimer',
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
        communication: 'Communication',
        system: 'Système'
      },
      priorities: {
        low: 'Faible',
        medium: 'Moyenne',
        high: 'Élevée',
        urgent: 'Urgent'
      }
    },
    en: {
      title: 'Notification Center',
      subtitle: 'All your important notifications',
      markAllRead: 'Mark all as read',
      delete: 'Delete',
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
        communication: 'Communication',
        system: 'System'
      },
      priorities: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        urgent: 'Urgent'
      }
    }
  };

  const t = text[language as keyof typeof text];

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      grade: BookOpen,
      attendance: Users,
      homework: BookOpen,
      payment: DollarSign,
      announcement: MessageSquare,
      meeting: Calendar,
      emergency: AlertTriangle,
      system: Info,
      geolocation: Shield,
      safe_zone_created: Shield,
      safe_zone_updated: Shield,
      safe_zone_deleted: Shield,
      zone_entry: Shield,
      zone_exit: Shield,
      location_alert: Shield,
      device_status: Shield
    };
    return iconMap[type] || Bell;
  };

  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      urgent: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
      high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      medium: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      low: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
    };
    return colorMap[priority] || colorMap.low;
  };

  const filteredNotifications = notifications.filter(notification => {
    const categoryMatch = selectedCategory === 'all' || notification.category === selectedCategory;
    const readMatch = !showOnlyUnread || !notification.isRead;
    return categoryMatch && readMatch;
  });

  const formatTimeAgo = (dateString: string) => {
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
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs bg-red-500 text-white px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-200">{t.title}</h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t.subtitle}</p>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs sm:text-sm"
            data-testid="button-mark-all-read"
          >
            <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            {t.markAllRead}
          </Button>
        )}
      </div>

      {/* Filters - Mobile optimized */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 pb-3 sm:pb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-4 h-4 text-gray-500" />
          
          {/* Category filter */}
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 min-w-[120px] px-2 sm:px-3 py-1 border rounded-md text-xs sm:text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
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
            className="text-xs sm:text-sm"
            data-testid="button-filter-unread"
          >
            {showOnlyUnread ? t.filterUnread : t.filterAll}
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <ModernCard className="p-0">
        <ScrollArea 
          className="max-h-[calc(85vh-200px)] sm:max-h-[60vh] h-auto overflow-y-auto overscroll-contain touch-pan-y scroll-smooth" 
          data-testid="notifications-scroll-area"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400 p-4">
              <Bell className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 opacity-50" />
              <h3 className="font-medium text-sm sm:text-base">{t.noNotifications}</h3>
              <p className="text-xs sm:text-sm mt-1">{t.noNotificationsDesc}</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4">
              {filteredNotifications.map(notification => {
                const IconComponent = getNotificationIcon(notification.type);
                const title = getLocalizedTitle(notification);
                const message = getLocalizedMessage(notification);
                
                return (
                  <div
                    key={notification.id}
                    className={`p-3 sm:p-4 rounded-lg border transition-all ${
                      notification.isRead 
                        ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 shadow-sm'
                    }`}
                    data-testid={`notification-item-${notification.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        notification.priority === 'urgent' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                        notification.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}>
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">
                            {title}
                          </h4>
                          <Badge className={`${getPriorityColor(notification.priority)} text-[10px] sm:text-xs flex-shrink-0`}>
                            {t.priorities[notification.priority as keyof typeof t.priorities]}
                          </Badge>
                        </div>
                        
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 break-words">
                          {message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimeAgo(notification.createdAt)}
                          </div>
                          
                          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                            {notification.actionRequired && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-8 sm:h-9 min-w-[44px]"
                                onClick={() => executeAction(notification)}
                                data-testid={`button-action-${notification.id}`}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                {notification.actionText || (language === 'fr' ? 'Action' : 'Action')}
                              </Button>
                            )}
                            
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 sm:h-9 w-8 sm:w-9 p-0"
                                onClick={() => markAsRead(notification.id)}
                                data-testid={`button-mark-read-${notification.id}`}
                                aria-label={language === 'fr' ? 'Marquer comme lu' : 'Mark as read'}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 sm:h-9 w-8 sm:w-9 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => deleteNotification(notification.id)}
                              data-testid={`button-delete-${notification.id}`}
                              aria-label={language === 'fr' ? 'Supprimer' : 'Delete'}
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

export default UnifiedNotificationCenter;

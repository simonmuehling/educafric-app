import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, CheckCircle, Eye, EyeOff, Trash2, Mail, MessageSquare, 
  Calendar, DollarSign, Users, AlertTriangle, Info, CheckIcon,
  MoreVertical, Filter, Search, RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { apiRequest } from '@/lib/queryClient';

interface CommercialNotification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'lead' | 'appointment' | 'payment' | 'school' | 'document' | 'system' | 'info';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isRead: boolean;
  isDelivered?: boolean;
  timestamp: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: any;
  createdAt: string;
}

const FunctionalCommercialNotifications: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const text = {
    fr: {
      title: 'Centre de Notifications',
      subtitle: 'Gérez toutes vos notifications commerciales',
      noNotifications: 'Aucune notification',
      noNotificationsDesc: 'Vous n\'avez aucune notification pour le moment.',
      markAllRead: 'Tout marquer comme lu',
      refresh: 'Actualiser',
      search: 'Rechercher...',
      filterType: 'Filtrer par type',
      filterStatus: 'Filtrer par statut',
      all: 'Tout',
      unread: 'Non lus',
      read: 'Lus',
      markRead: 'Marquer comme lu',
      markUnread: 'Marquer comme non lu',
      delete: 'Supprimer',
      view: 'Voir',
      types: {
        lead: 'Prospect',
        appointment: 'Rendez-vous',
        payment: 'Paiement',
        school: 'École',
        document: 'Document',
        system: 'Système',
        info: 'Information'
      },
      priority: {
        low: 'Faible',
        normal: 'Normal',
        high: 'Élevé',
        urgent: 'Urgent'
      },
      notificationMarkedRead: 'Notification marquée comme lue',
      notificationMarkedUnread: 'Notification marquée comme non lue',
      notificationDeleted: 'Notification supprimée',
      allMarkedRead: 'Toutes les notifications marquées comme lues',
      loadingNotifications: 'Chargement des notifications...'
    },
    en: {
      title: 'Notification Centre',
      subtitle: 'Manage all your commercial notifications',
      noNotifications: 'No notifications',
      noNotificationsDesc: 'You have no notifications at the moment.',
      markAllRead: 'Mark all as read',
      refresh: 'Refresh',
      search: 'Search...',
      filterType: 'Filter by type',
      filterStatus: 'Filter by status',
      all: 'All',
      unread: 'Unread',
      read: 'Read',
      markRead: 'Mark as read',
      markUnread: 'Mark as unread',
      delete: 'Delete',
      view: 'View',
      types: {
        lead: 'Lead',
        appointment: 'Appointment',
        payment: 'Payment',
        school: 'School',
        document: 'Document',
        system: 'System',
        info: 'Information'
      },
      priority: {
        low: 'Low',
        normal: 'Normal',
        high: 'High',
        urgent: 'Urgent'
      },
      notificationMarkedRead: 'Notification marked as read',
      notificationMarkedUnread: 'Notification marked as unread',
      notificationDeleted: 'Notification deleted',
      allMarkedRead: 'All notifications marked as read',
      loadingNotifications: 'Loading notifications...'
    }
  };

  const t = text[language as keyof typeof text];

  // Fetch notifications
  const { data: notifications = [], isLoading, refetch } = useQuery<CommercialNotification[]>({
    queryKey: ['/api/commercial/notifications'],
    queryFn: async () => {
      const response = await fetch('/api/commercial/notifications', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    enabled: !!user,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Mark notification as read/unread
  const markNotificationMutation = useMutation({
    mutationFn: async ({ id, isRead }: { id: number; isRead: boolean }) => {
      const response = await fetch(`/api/commercial/notifications/${id}/mark-read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to mark notification');
      return response.json();
    },
    onSuccess: (_, { isRead }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/notifications'] });
      toast({
        title: isRead ? t.notificationMarkedRead : t.notificationMarkedUnread
      });
    }
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/commercial/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete notification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/notifications'] });
      toast({
        title: t.notificationDeleted
      });
    }
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/commercial/notifications/mark-all-read', {
        method: 'PATCH',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to mark all as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commercial/notifications'] });
      toast({
        title: t.allMarkedRead
      });
    }
  });

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchQuery === '' || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || notification.type === filterType;
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'read' && notification.isRead) ||
      (filterStatus === 'unread' && !notification.isRead);

    return matchesSearch && matchesType && matchesStatus;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'lead': return Users;
      case 'appointment': return Calendar;
      case 'payment': return DollarSign;
      case 'school': return Users;
      case 'document': return Mail;
      case 'system': return AlertTriangle;
      default: return Info;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-6xl mx-auto p-6" data-testid="commercial-notifications-center">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="w-8 h-8 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900" data-testid="text-notifications-title">
                {t.title}
              </h1>
              <p className="text-gray-600" data-testid="text-notifications-subtitle">
                {t.subtitle}
              </p>
            </div>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2" data-testid="badge-unread-count">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              data-testid="button-refresh-notifications"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t.refresh}
            </Button>
            
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                data-testid="button-mark-all-read"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {t.markAllRead}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                data-testid="input-search-notifications"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-filter-type">
                <SelectValue placeholder={t.filterType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="lead">{t.types.lead}</SelectItem>
                <SelectItem value="appointment">{t.types.appointment}</SelectItem>
                <SelectItem value="payment">{t.types.payment}</SelectItem>
                <SelectItem value="school">{t.types.school}</SelectItem>
                <SelectItem value="document">{t.types.document}</SelectItem>
                <SelectItem value="system">{t.types.system}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-filter-status">
                <SelectValue placeholder={t.filterStatus} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="unread">{t.unread}</SelectItem>
                <SelectItem value="read">{t.read}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            {t.title} ({filteredNotifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600" data-testid="text-loading-notifications">
                {t.loadingNotifications}
              </p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2" data-testid="text-no-notifications">
                {t.noNotifications}
              </h3>
              <p className="text-gray-600" data-testid="text-no-notifications-desc">
                {t.noNotificationsDesc}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="divide-y">
                {filteredNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      data-testid={`notification-item-${notification.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`p-2 rounded-lg ${
                            !notification.isRead ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              !notification.isRead ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className={`font-medium ${
                                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                              }`} data-testid={`text-notification-title-${notification.id}`}>
                                {notification.title}
                              </h3>
                              
                              <Badge 
                                variant="outline" 
                                className={getPriorityColor(notification.priority)}
                                data-testid={`badge-priority-${notification.id}`}
                              >
                                {t.priority[notification.priority as keyof typeof t.priority]}
                              </Badge>
                              
                              <Badge variant="secondary" data-testid={`badge-type-${notification.id}`}>
                                {t.types[notification.type as keyof typeof t.types]}
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-2" data-testid={`text-notification-message-${notification.id}`}>
                              {notification.message}
                            </p>
                            
                            <p className="text-xs text-gray-500" data-testid={`text-notification-time-${notification.id}`}>
                              {new Date(notification.createdAt).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')}
                            </p>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" data-testid={`button-notification-menu-${notification.id}`}>
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => markNotificationMutation.mutate({
                                id: notification.id,
                                isRead: !notification.isRead
                              })}
                              data-testid={`button-toggle-read-${notification.id}`}
                            >
                              {notification.isRead ? (
                                <>
                                  <EyeOff className="w-4 h-4 mr-2" />
                                  {t.markUnread}
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  {t.markRead}
                                </>
                              )}
                            </DropdownMenuItem>
                            
                            {notification.actionUrl && (
                              <DropdownMenuItem
                                onClick={() => window.location.href = notification.actionUrl!}
                                data-testid={`button-view-${notification.id}`}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                {notification.actionText || t.view}
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem
                              onClick={() => deleteNotificationMutation.mutate(notification.id)}
                              className="text-red-600"
                              data-testid={`button-delete-${notification.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t.delete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FunctionalCommercialNotifications;
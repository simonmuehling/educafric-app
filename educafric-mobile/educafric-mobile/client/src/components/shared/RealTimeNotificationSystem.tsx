import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, BellOff, CheckCircle2, XCircle, Clock, AlertTriangle,
  Users, Activity, Wifi, WifiOff, Settings, X, Volume2, VolumeX
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

// Notification types
interface RealTimeNotification {
  id: string;
  type: 'GRADE_STATUS_UPDATE' | 'REVIEW_QUEUE_UPDATE' | 'CONFLICT_ALERT' | 'BULLETIN_PROGRESS' | 'SYSTEM_MESSAGE';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  actionRequired?: boolean;
  relatedId?: number;
  relatedType?: string;
}

interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  gradeUpdates: boolean;
  reviewQueue: boolean;
  conflicts: boolean;
  bulletinProgress: boolean;
}

const RealTimeNotificationSystem: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  // State management
  const [notifications, setNotifications] = useState<RealTimeNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    sound: true,
    desktop: true,
    gradeUpdates: true,
    reviewQueue: true,
    conflicts: true,
    bulletinProgress: true
  });

  // Real-time integration
  const {
    isConnected,
    hasError,
    connectedUsers,
    lastEventTime
  } = useRealTimeUpdates({
    onGradeStatusUpdate: handleGradeStatusUpdate,
    onReviewQueueUpdate: handleReviewQueueUpdate,
    onConflictAlert: handleConflictAlert,
    onBulletinProgress: handleBulletinProgress,
    enableToasts: false // We'll handle toasts manually for better control
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('realtime-notification-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('realtime-notification-settings', JSON.stringify(settings));
  }, [settings]);

  // Request desktop notification permission
  useEffect(() => {
    if (settings.desktop && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [settings.desktop]);

  // Real-time event handlers
  function handleGradeStatusUpdate(payload: any) {
    if (!settings.gradeUpdates) return;

    const { submissionId, oldStatus, newStatus, feedback } = payload;
    
    const notification: RealTimeNotification = {
      id: `grade-${submissionId}-${Date.now()}`,
      type: 'GRADE_STATUS_UPDATE',
      title: language === 'fr' ? 'Statut de note mis à jour' : 'Grade status updated',
      message: language === 'fr' 
        ? `Note ${submissionId}: ${oldStatus} → ${newStatus}${feedback ? ` - ${feedback}` : ''}` 
        : `Grade ${submissionId}: ${oldStatus} → ${newStatus}${feedback ? ` - ${feedback}` : ''}`,
      timestamp: new Date(),
      priority: newStatus === 'returned' ? 'high' : 'normal',
      read: false,
      relatedId: submissionId,
      relatedType: 'grade_submission'
    };

    addNotification(notification);

    // Show desktop notification for important updates
    if (newStatus === 'approved' || newStatus === 'returned') {
      showDesktopNotification(notification);
    }
  }

  function handleReviewQueueUpdate(payload: any) {
    if (!settings.reviewQueue || user?.role !== 'Director') return;

    const { action, submissionId, priority } = payload;
    
    const notification: RealTimeNotification = {
      id: `queue-${submissionId}-${Date.now()}`,
      type: 'REVIEW_QUEUE_UPDATE',
      title: language === 'fr' ? 'Queue de révision mise à jour' : 'Review queue updated',
      message: language === 'fr' 
        ? `${action === 'ADD' ? 'Nouvelle soumission' : 'Soumission mise à jour'} ${submissionId}${priority === 'urgent' ? ' (URGENT)' : ''}` 
        : `${action === 'ADD' ? 'New submission' : 'Updated submission'} ${submissionId}${priority === 'urgent' ? ' (URGENT)' : ''}`,
      timestamp: new Date(),
      priority: priority === 'urgent' ? 'urgent' : action === 'ADD' ? 'high' : 'normal',
      read: false,
      actionRequired: action === 'ADD',
      relatedId: submissionId,
      relatedType: 'review_queue'
    };

    addNotification(notification);

    if (action === 'ADD' && priority === 'urgent') {
      showDesktopNotification(notification);
    }
  }

  function handleConflictAlert(payload: any) {
    if (!settings.conflicts) return;

    const { conflictType, resourceId, conflictingUserName, message } = payload;
    
    const notification: RealTimeNotification = {
      id: `conflict-${resourceId}-${Date.now()}`,
      type: 'CONFLICT_ALERT',
      title: language === 'fr' ? 'Conflit détecté' : 'Conflict detected',
      message: message || (language === 'fr' 
        ? `Conflit avec ${conflictingUserName} sur la ressource ${resourceId}` 
        : `Conflict with ${conflictingUserName} on resource ${resourceId}`),
      timestamp: new Date(),
      priority: 'urgent',
      read: false,
      actionRequired: true,
      relatedId: resourceId,
      relatedType: 'conflict'
    };

    addNotification(notification);
    showDesktopNotification(notification);
    playNotificationSound('urgent');
  }

  function handleBulletinProgress(payload: any) {
    if (!settings.bulletinProgress) return;

    const { classId, progressPercentage } = payload;
    
    // Only notify on significant progress milestones
    if (progressPercentage % 25 === 0 || progressPercentage === 100) {
      const notification: RealTimeNotification = {
        id: `bulletin-${classId}-${Date.now()}`,
        type: 'BULLETIN_PROGRESS',
        title: language === 'fr' ? 'Progrès des bulletins' : 'Bulletin progress',
        message: language === 'fr' 
          ? `Classe ${classId}: ${progressPercentage}% terminé` 
          : `Class ${classId}: ${progressPercentage}% complete`,
        timestamp: new Date(),
        priority: progressPercentage === 100 ? 'high' : 'normal',
        read: false,
        relatedId: classId,
        relatedType: 'bulletin_progress'
      };

      addNotification(notification);

      if (progressPercentage === 100) {
        showDesktopNotification(notification);
      }
    }
  }

  // Add notification to state
  const addNotification = (notification: RealTimeNotification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep only last 50 notifications
    
    // Play sound
    if (notification.priority === 'urgent') {
      playNotificationSound('urgent');
    } else if (notification.priority === 'high') {
      playNotificationSound('high');
    }

    // Show toast for important notifications
    if (notification.priority === 'urgent' || notification.actionRequired) {
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.priority === 'urgent' ? 'destructive' : 'default'
      });
    }
  };

  // Show desktop notification
  const showDesktopNotification = (notification: RealTimeNotification) => {
    if (!settings.desktop || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const desktopNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/android-chrome-192x192.png',
      tag: notification.id,
      requireInteraction: notification.priority === 'urgent'
    });

    desktopNotification.onclick = () => {
      window.focus();
      setIsOpen(true);
      markAsRead(notification.id);
      desktopNotification.close();
    };

    // Auto-close after 5 seconds for non-urgent notifications
    if (notification.priority !== 'urgent') {
      setTimeout(() => {
        desktopNotification.close();
      }, 5000);
    }
  };

  // Play notification sound
  const playNotificationSound = (priority: string) => {
    if (!settings.sound) return;

    try {
      const audio = new Audio();
      
      if (priority === 'urgent') {
        // High priority sound - multiple beeps
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUIEy2A0/TVfS4KG2m98+aKOgYNUKvl8K9jHgo2htj0xnksDSt+zPLIjDQLGGS56+yWUQoLUKLm7bFiFg0xhtv1v3EsDSl+zvDPfC8LABqpAAAAAAAAAAAAAAABAAAAAAABAAAAAAABAAAAAAACaLTAIBgAAuQAAAAACL...';
      } else if (priority === 'high') {
        // Medium priority sound - single beep
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUIEy2A0/TVfS4KG2m98+aKOgYNUKvl8K9jHgo2htj0xnksDSt+zPLIjDQLGGS56+yWUQoLUKLm7bFiFg0xhtv1v3EsDSl+zvDPfC8LABqpAAAAAAAAAAAAAAABAAAAAAABAAAAAAAA...';
      }
      
      audio.volume = 0.3;
      audio.play().catch(console.error);
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  };

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Get notification icon
  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'urgent') {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }

    switch (type) {
      case 'GRADE_STATUS_UPDATE':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'REVIEW_QUEUE_UPDATE':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'CONFLICT_ALERT':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'BULLETIN_PROGRESS':
        return <Activity className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => !n.read && n.priority === 'urgent').length;

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative"
            data-testid="notification-trigger"
          >
            {isConnected ? (
              <Bell className="w-5 h-5" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
            
            {unreadCount > 0 && (
              <Badge 
                className={`absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center ${
                  urgentCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
                }`}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-96 p-0" align="end" data-testid="notification-panel">
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <h3 className="font-semibold">
                  {language === 'fr' ? 'Notifications' : 'Notifications'}
                </h3>
                {!isConnected && (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  data-testid="button-mark-all-read"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                  data-testid="button-toggle-notifications"
                >
                  {settings.enabled ? (
                    <Bell className="w-4 h-4" />
                  ) : (
                    <BellOff className="w-4 h-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            
            {hasError && (
              <Alert className="mt-2" variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {language === 'fr' 
                    ? 'Connexion temps réel interrompue' 
                    : 'Real-time connection interrupted'}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">
                  {language === 'fr' 
                    ? 'Aucune notification' 
                    : 'No notifications'}
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`
                      p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors
                      ${!notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
                      ${notification.priority === 'urgent' ? 'bg-red-50 border-l-4 border-l-red-500' : ''}
                    `}
                    onClick={() => markAsRead(notification.id)}
                    data-testid={`notification-${notification.id}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-1">
                            {notification.actionRequired && (
                              <Badge variant="destructive" className="text-xs">
                                {language === 'fr' ? 'Action' : 'Action'}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {notification.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllNotifications}
                className="w-full"
                data-testid="button-clear-all"
              >
                <X className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Tout effacer' : 'Clear all'}
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default RealTimeNotificationSystem;
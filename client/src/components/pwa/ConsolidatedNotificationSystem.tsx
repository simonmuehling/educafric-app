import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { X, Bell, CheckCircle, AlertTriangle, Info, AlertCircle, BookOpen, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { unifiedNotificationService, UnifiedNotification, NotificationType } from '@/services/unifiedNotificationService';

// Context for unified notifications
interface NotificationContextValue {
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
  sendGrade: (studentName: string, subject: string, grade: string) => void;
  sendAttendance: (studentName: string, status: 'present' | 'absent') => void;
  sendHomework: (subject: string, dueDate: string) => void;
  sendEmergency: (message: string) => void;
  sendTest: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const useUnifiedNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useUnifiedNotifications must be used within ConsolidatedNotificationProvider');
  }
  return context;
};

// Unified notification component with modern design
interface ConsolidatedNotificationProps {
  notification: UnifiedNotification;
  onClose: (id: string) => void;
}

const ConsolidatedNotification: React.FC<ConsolidatedNotificationProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const getIcon = () => {
    const iconMap: Record<NotificationType, JSX.Element> = {
      'success': <CheckCircle className="w-5 h-5" />,
      'error': <AlertCircle className="w-5 h-5" />,
      'warning': <AlertTriangle className="w-5 h-5" />,
      'info': <Info className="w-5 h-5" />,
      'grade': <BookOpen className="w-5 h-5" />,
      'attendance': <Users className="w-5 h-5" />,
      'homework': <CheckCircle className="w-5 h-5" />,
      'emergency': <AlertTriangle className="w-5 h-5" />
    };
    return iconMap[notification.type] || <Bell className="w-5 h-5" />;
  };

  const getStyles = () => {
    const styleMap: Record<NotificationType, string> = {
      'success': 'bg-green-50 border-green-200 text-green-800',
      'error': 'bg-red-50 border-red-200 text-red-800',
      'warning': 'bg-yellow-50 border-yellow-200 text-yellow-800',
      'info': 'bg-blue-50 border-blue-200 text-blue-800',
      'grade': 'bg-purple-50 border-purple-200 text-purple-800',
      'attendance': 'bg-indigo-50 border-indigo-200 text-indigo-800',
      'homework': 'bg-orange-50 border-orange-200 text-orange-800',
      'emergency': 'bg-red-50 border-red-200 text-red-800'
    };
    return styleMap[notification.type] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const getIconColor = () => {
    const colorMap: Record<NotificationType, string> = {
      'success': 'text-green-500',
      'error': 'text-red-500',
      'warning': 'text-yellow-500',
      'info': 'text-blue-500',
      'grade': 'text-purple-500',
      'attendance': 'text-indigo-500',
      'homework': 'text-orange-500',
      'emergency': 'text-red-500'
    };
    return colorMap[notification.type] || 'text-gray-500';
  };

  useEffect(() => {
    const timer1 = setTimeout(() => setIsVisible(true), 50);
    const timer2 = setTimeout(() => handleClose(), notification.duration || 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [notification.duration]);

  const handleClose = () => {
    if (notification.persistent) return; // Don't auto-close persistent notifications
    setIsExiting(true);
    setTimeout(() => onClose(notification.id), 150);
  };

  return (
    <div
      className={`fixed top-6 right-6 w-80 max-w-sm transform transition-all duration-300 ease-out z-50 ${
        isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{ filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.1))' }}
    >
      <div className={`${getStyles()} border rounded-lg p-4 backdrop-blur-sm`}>
        <div className="flex items-start gap-3">
          <div className={`${getIconColor()} flex-shrink-0 mt-0.5`}>
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-semibold text-sm">{notification.title || ''}</h4>
              
              {/* Priority indicator */}
              {notification.priority === 'urgent' && (
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-2 mt-1"></div>
              )}
            </div>
            
            <p className="text-sm opacity-90 leading-relaxed mb-2">{notification.message}</p>
            
            {/* Category and priority info */}
            <div className="flex items-center gap-2 text-xs opacity-75">
              <span className="capitalize">{notification.category}</span>
              <span>•</span>
              <span className="capitalize">{notification.priority}</span>
            </div>
          </div>
          
          {!notification.persistent && (
            <button
              onClick={() => onClose(notification.id)}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-150 p-1 -m-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Progress bar for non-persistent notifications */}
        {!notification.persistent && (
          <div className="mt-3 h-1 bg-black bg-opacity-10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-current opacity-30 rounded-full transition-all ease-linear"
              style={{
                animation: `shrink ${notification.duration || 5000}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Consolidated provider component
interface ConsolidatedNotificationProviderProps {
  children: ReactNode;
}

export const ConsolidatedNotificationProvider: React.FC<ConsolidatedNotificationProviderProps> = ({ children }) => {
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => (Array.isArray(prev) ? prev : []).filter(n => n.id !== id));
  }, []);

  // Register callback with unified service
  useEffect(() => {
    const callback = (notification: UnifiedNotification) => {
      setNotifications(prev => [...prev, notification]);
    };

    unifiedNotificationService.registerInAppCallback(callback);
    return () => unifiedNotificationService.unregisterInAppCallback(callback);
  }, []);

  // Context methods
  const showSuccess = useCallback((title: string, message: string) => {
    unifiedNotificationService.success(title, message);
  }, []);

  const showError = useCallback((title: string, message: string) => {
    unifiedNotificationService.error(title, message);
  }, []);

  const showWarning = useCallback((title: string, message: string) => {
    unifiedNotificationService.warning(title, message);
  }, []);

  const showInfo = useCallback((title: string, message: string) => {
    unifiedNotificationService.info(title, message);
  }, []);

  const sendGrade = useCallback((studentName: string, subject: string, grade: string) => {
    unifiedNotificationService.grade(studentName, subject, grade, language);
  }, [language]);

  const sendAttendance = useCallback((studentName: string, status: 'present' | 'absent') => {
    unifiedNotificationService.attendance(studentName, status, language);
  }, [language]);

  const sendHomework = useCallback((subject: string, dueDate: string) => {
    unifiedNotificationService.homework(subject, dueDate, language);
  }, [language]);

  const sendEmergency = useCallback((message: string) => {
    unifiedNotificationService.emergency(message, language);
  }, [language]);

  const sendTest = useCallback(() => {
    unifiedNotificationService.test(language);
  }, [language]);

  return (
    <NotificationContext.Provider value={{
      showSuccess,
      showError,
      showWarning,
      showInfo,
      sendGrade,
      sendAttendance,
      sendHomework,
      sendEmergency,
      sendTest
    }}>
      {children}
      
      {/* Render consolidated notifications */}
      <div className="fixed top-0 right-0 z-50 p-6 pointer-events-none">
        <div className="space-y-4 pointer-events-auto">
          {(Array.isArray(notifications) ? notifications : []).map((notification, index) => (
            <div key={notification.id} style={{ animationDelay: `${index * 100}ms` }}>
              <ConsolidatedNotification
                notification={notification}
                onClose={removeNotification}
              />
            </div>
          ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
};
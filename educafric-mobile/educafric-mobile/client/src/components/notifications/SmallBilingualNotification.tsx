import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export interface SmallNotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  titleKey: string;
  messageKey: string;
  onClose: (id: string) => void;
  autoClose?: number;
}

const SmallBilingualNotification: React.FC<SmallNotificationProps> = ({
  id,
  type,
  titleKey,
  messageKey,
  onClose,
  autoClose = 4000
}) => {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);

  // Bilingual content mapping
  const content = {
    fr: {
      // Geolocation notifications
      'gps.safe_arrival': 'Arrivée sécurisée',
      'gps.safe_arrival_msg': 'Jean est arrivé à l\'école',
      'gps.zone_exit': 'Sortie de zone',
      'gps.zone_exit_msg': 'Marie a quitté la zone scolaire',
      'gps.emergency': 'Urgence',
      'gps.emergency_msg': 'Alerte panic activée',
      
      // Academic notifications
      'grade.new': 'Nouvelle note',
      'grade.new_msg': 'Note ajoutée en Mathématiques',
      'attendance.present': 'Présence confirmée',
      'attendance.present_msg': 'Élève marqué présent',
      'homework.assigned': 'Devoir assigné',
      'homework.assigned_msg': 'Nouveau devoir en Français',
      
      // System notifications
      'system.saved': 'Sauvegardé',
      'system.saved_msg': 'Données enregistrées',
      'system.error': 'Erreur',
      'system.error_msg': 'Une erreur s\'est produite',
      'system.warning': 'Attention',
      'system.warning_msg': 'Vérifiez les informations'
    },
    en: {
      // Geolocation notifications
      'gps.safe_arrival': 'Safe Arrival',
      'gps.safe_arrival_msg': 'Jean arrived at school',
      'gps.zone_exit': 'Zone Exit',
      'gps.zone_exit_msg': 'Marie left school zone',
      'gps.emergency': 'Emergency',
      'gps.emergency_msg': 'Panic alert activated',
      
      // Academic notifications
      'grade.new': 'New Grade',
      'grade.new_msg': 'Grade added in Mathematics',
      'attendance.present': 'Attendance Confirmed',
      'attendance.present_msg': 'Student marked present',
      'homework.assigned': 'Homework Assigned',
      'homework.assigned_msg': 'New homework in French',
      
      // System notifications
      'system.saved': 'Saved',
      'system.saved_msg': 'Data saved successfully',
      'system.error': 'Error',
      'system.error_msg': 'An error occurred',
      'system.warning': 'Warning',
      'system.warning_msg': 'Please check information'
    }
  };

  const t = content[language as keyof typeof content];

  const getIcon = () => {
    const iconMap = {
      success: <CheckCircle className="notification-icon text-green-500" />,
      error: <AlertCircle className="notification-icon text-red-500" />,
      warning: <AlertTriangle className="notification-icon text-yellow-500" />,
      info: <Info className="notification-icon text-blue-500" />
    };
    return iconMap[type];
  };

  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`notification-item ${type}`}>
      <div className="notification-content">
        {getIcon()}
        <div className="notification-text">
          <div className="notification-title">
            {(t as any)[titleKey] || titleKey}
          </div>
          <div className="notification-message">
            {(t as any)[messageKey] || messageKey}
          </div>
        </div>
      </div>
      <button 
        className="notification-close"
        onClick={handleClose}
        aria-label="Close notification"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

export default SmallBilingualNotification;
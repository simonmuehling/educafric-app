import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/CardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ModernCard } from '@/components/ui/ModernCard';
import { 
  MessageSquare, Settings, Bell, User, Phone, 
  CheckCircle, AlertCircle, Clock, Volume2, VolumeX
} from 'lucide-react';

interface NotificationPreference {
  type: 'grade' | 'absence' | 'payment' | 'announcement' | 'meeting' | 'emergency';
  enabled: boolean;
  smsEnabled: boolean;
  appEnabled: boolean;
}

interface WhatsAppNotification {
  id: string;
  type: string;
  studentName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

const WhatsAppNotifications = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('settings');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [notifications, setNotifications] = useState<WhatsAppNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);

  const t = {
    fr: {
      title: 'WhatsApp (Bientôt Accessible)',
      subtitle: 'Service de messagerie WhatsApp en cours de développement',
      settings: 'Paramètres',
      history: 'Historique',
      whatsappNumber: 'Numéro WhatsApp',
      verify: 'Vérifier',
      verified: 'Vérifié',
      notVerified: 'Non vérifié',
      enableNotifications: 'Activer les notifications',
      notificationTypes: {
        grade: 'Nouvelles Notes',
        absence: 'Absences',
        payment: 'Paiements École',
        announcement: 'Annonces École',
        meeting: 'Convocations',
        emergency: 'Urgences'
      },
      channels: {
        sms: 'SMS',
        app: 'Application'
      },
      placeholder: {
        phone: '+237 6XX XXX XXX'
      },
      recentNotifications: 'Récentes Notifications',
      noNotifications: 'Aucune notification',
      markAllRead: 'Tout marquer lu',
      testNotification: 'Tester Notification',
      save: 'Sauvegarder',
      saved: 'Paramètres sauvegardés!'
    },
    en: {
      title: 'WhatsApp (Coming Soon)',
      subtitle: 'WhatsApp messaging service under development',
      settings: 'Settings',
      history: 'History',
      whatsappNumber: 'WhatsApp Number',
      verify: 'Verify',
      verified: 'Verified',
      notVerified: 'Not Verified',
      enableNotifications: 'Enable notifications',
      notificationTypes: {
        grade: 'New Grades',
        absence: 'Absences',
        payment: 'School Payments',
        announcement: 'School Announcements',
        meeting: 'Meeting Requests',
        emergency: 'Emergencies'
      },
      channels: {
        sms: 'SMS',
        app: 'Application'
      },
      placeholder: {
        phone: '+237 6XX XXX XXX'
      },
      recentNotifications: 'Recent Notifications',
      noNotifications: 'No notifications',
      markAllRead: 'Mark All Read',
      testNotification: 'Test Notification',
      save: 'Save',
      saved: 'Settings saved!'
    }
  };

  const text = t[language as keyof typeof t];

  // Initialize preferences
  useEffect(() => {
    const defaultPreferences: NotificationPreference[] = [
      { type: 'grade', enabled: true, smsEnabled: false, appEnabled: true },
      { type: 'absence', enabled: true, smsEnabled: true, appEnabled: true },
      { type: 'payment', enabled: true, smsEnabled: false, appEnabled: true },
      { type: 'announcement', enabled: true, smsEnabled: false, appEnabled: true },
      { type: 'meeting', enabled: true, smsEnabled: true, appEnabled: true },
      { type: 'emergency', enabled: true, smsEnabled: true, appEnabled: true }
    ];
    setPreferences(defaultPreferences);

    // Load existing WhatsApp number - using phone as fallback
    setWhatsappNumber(user?.phone || '');
    setIsVerified(!!user?.phone);

    // Load recent notifications
    loadNotifications();
  }, [user]);

  const loadNotifications = () => {
    // Mock notifications - in real implementation, fetch from API
    const mockNotifications: WhatsAppNotification[] = [
      {
        id: '1',
        type: 'grade',
        studentName: 'Jean Dupont',
        content: '📚 Nouvelle Note - Mathématiques: 16/20',
        timestamp: '2025-01-24T10:30:00Z',
        read: false
      },
      {
        id: '2',
        type: 'absence',
        studentName: 'Marie Dupont',
        content: '⚠️ Absence signalée - 24 Jan 2025, Matin',
        timestamp: '2025-01-24T08:15:00Z',
        read: true
      },
      {
        id: '3',
        type: 'announcement',
        studentName: 'École Primaire',
        content: '📢 Réunion parents-professeurs - 30 janvier',
        timestamp: '2025-01-23T16:45:00Z',
        read: true
      }
    ];
    setNotifications(mockNotifications);
  };

  const updatePreference = (type: string, field: string, value: boolean) => {
    setPreferences(prev => (Array.isArray(prev) ? prev : []).map(pref => 
      pref.type === type ? { ...pref, [field]: value } : pref
    ));
  };

  const verifyWhatsAppNumber = async () => {
    if (!whatsappNumber) return;

    try {
      // In real implementation, send verification code
      const response = await fetch('/api/whatsapp/verify-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: whatsappNumber })
      });

      if (response.ok) {
        setIsVerified(true);
        alert(language === 'fr' ? 'Code de vérification envoyé!' : 'Verification code sent!');
      }
    } catch (error) {
      console.error('Verification error:', error);
    }
  };

  const testNotification = async () => {
    if (!isVerified) {
      alert(language === 'fr' ? 'Veuillez d\'abord vérifier votre numéro' : 'Please verify your number first');
      return;
    }

    try {
      const response = await fetch('/api/whatsapp/send-education-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: whatsappNumber,
          type: 'announcement',
          data: {
            title: 'Test Notification',
            message: language === 'fr' 
              ? 'Ceci est un test de notification WhatsApp Educafric!' 
              : 'This is an Educafric WhatsApp notification test!'
          },
          language
        })
      });

      const result = await response.json();
      if (result.success) {
        alert(language === 'fr' ? 'Notification test envoyée!' : 'Test notification sent!');
      }
    } catch (error) {
      console.error('Test notification error:', error);
    }
  };

  const savePreferences = async () => {
    setIsLoading(true);
    try {
      const settingsData = (Array.isArray(preferences) ? preferences : []).map(pref => ({
        notificationType: pref.type,
        enabled: pref.enabled,
        emailEnabled: false, // WhatsApp focus
        smsEnabled: pref.smsEnabled,
        pushEnabled: pref.appEnabled,
        whatsappEnabled: pref.enabled,
        priority: pref.type === 'emergency' ? 'urgent' : 'medium'
      }));

      const response = await fetch('/api/notification-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ settings: settingsData })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(language === 'fr' ? 'Préférences WhatsApp sauvegardées avec succès!' : 'WhatsApp preferences saved successfully!');
      } else {
        throw new Error(result.message || 'Failed to save preferences');
      }
    } catch (error: any) {
      console.error('Error saving WhatsApp preferences:', error);
      alert(language === 'fr' ? 'Erreur lors de la sauvegarde' : 'Error saving preferences');
    }
    setIsLoading(false);
  };

  const markAllAsRead = () => {
    setNotifications(prev => (Array.isArray(prev) ? prev : []).map(notif => ({ ...notif, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'grade': return '📚';
      case 'absence': return '⚠️';
      case 'payment': return '💳';
      case 'announcement': return '📢';
      case 'meeting': return '🤝';
      case 'emergency': return '🚨';
      default: return '📱';
    }
  };

  const tabs = [
    { id: 'settings', label: text.settings, icon: <Settings className="w-4 h-4" /> },
    { id: 'history', label: text.history, icon: <MessageSquare className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Coming Soon Notice */}
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Clock className="w-8 h-8 text-yellow-500" />
          <h2 className="text-xl font-semibold text-yellow-800">
            {language === 'fr' ? 'Fonctionnalité en Développement' : 'Feature Under Development'}
          </h2>
        </div>
        <p className="text-yellow-700 text-center mb-4">
          {language === 'fr' 
            ? 'Notre équipe travaille actuellement sur l\'intégration WhatsApp Business pour vous offrir des notifications instantanées. Cette fonctionnalité sera bientôt disponible!'
            : 'Our team is currently working on WhatsApp Business integration to provide you with instant notifications. This feature will be available soon!'}
        </p>
        <div className="flex justify-center">
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            {language === 'fr' ? 'Bientôt disponible' : 'Coming soon'}
          </Badge>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{text.title || ''}</h2>
          <p className="text-gray-600">{text.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isVerified ? "default" : "secondary"} className={isVerified ? "bg-green-100 text-green-700" : ""}>
            <MessageSquare className="w-3 h-3 mr-1" />
            {isVerified ? text.verified : text.notVerified}
          </Badge>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            {(Array.isArray(tabs) ? tabs : []).map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2"
              >
                {tab.icon}
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* WhatsApp Number Configuration */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-500" />
                {text.whatsappNumber}
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e?.target?.value)}
                  placeholder={text?.placeholder?.phone}
                  className="flex-1"
                />
                <Button 
                  onClick={verifyWhatsAppNumber}
                  variant={isVerified ? "outline" : "default"}
                  disabled={!whatsappNumber || isVerified}
                >
                  {isVerified ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {text.verified}
                    </>
                  ) : (
                    text.verify
                  )}
                </Button>
              </div>
              
              {isVerified && (
                <div className="flex gap-2">
                  <Button onClick={testNotification} variant="outline" size="sm">
                    <Bell className="w-4 h-4 mr-2" />
                    {text.testNotification}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" />
                {text.enableNotifications}
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {(Array.isArray(preferences) ? preferences : []).map(pref => (
                <div key={pref.type} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getNotificationIcon(pref.type)}</span>
                      <span className="font-medium">
                        {text.notificationTypes[pref.type as keyof typeof text.notificationTypes]}
                      </span>
                    </div>
                    <Switch
                      checked={pref.enabled}
                      onCheckedChange={(checked) => updatePreference(pref.type, 'enabled', checked)}
                    />
                  </div>
                  
                  {pref.enabled && (
                    <div className="grid grid-cols-2 gap-4 ml-8">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={pref.smsEnabled}
                          onCheckedChange={(checked) => updatePreference(pref.type, 'smsEnabled', checked)}
                        />
                        <span className="text-sm">{text?.channels?.sms}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={pref.appEnabled}
                          onCheckedChange={(checked) => updatePreference(pref.type, 'appEnabled', checked)}
                        />
                        <span className="text-sm">{text?.channels?.app}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <Button onClick={savePreferences} className="w-full">
                {text.save}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                {text.recentNotifications}
              </h3>
              {notifications.some(n => !n.read) && (
                <Button onClick={markAllAsRead} variant="outline" size="sm">
                  {text.markAllRead}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {(Array.isArray(notifications) ? notifications.length : 0) === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-600 mb-2">
                  {text.noNotifications}
                </h4>
              </div>
            ) : (
              <div className="space-y-3">
                {(Array.isArray(notifications) ? notifications : []).map(notification => (
                  <ModernCard 
                    key={notification.id} 
                    className={`hover:shadow-md transition-shadow ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline">
                              <User className="w-3 h-3 mr-1" />
                              {notification.studentName}
                            </Badge>
                            {!notification.read && (
                              <Badge variant="default" className="bg-blue-100 text-blue-700">
                                Nouveau
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{notification.content}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(notification.timestamp).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {notification.read ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </ModernCard>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { WhatsAppNotifications };
export default WhatsAppNotifications;
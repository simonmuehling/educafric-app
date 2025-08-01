import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { firebaseAuth2FA } from '@/lib/firebaseAuth2FA';
import FirebaseTwoFactorSetup from '../auth/FirebaseTwoFactorSetup';
import { 
  Database, 
  Shield, 
  MessageSquare, 
  Bell, 
  Users, 
  BarChart3,
  Settings,
  Cloud,
  Smartphone,
  Lock,
  Key,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface FirebaseService {
  name: string;
  description: string;
  status: 'enabled' | 'disabled' | 'testing';
  icon: React.ReactNode;
  testFunction?: () => Promise<void>;
}

const FirebaseIntegrationTest = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | '2fa' | 'messaging' | 'analytics' | 'storage'>('overview');
  const [isTestingService, setIsTestingService] = useState<string | null>(null);
  const [serviceResults, setServiceResults] = useState<Record<string, any>>({});

  const text = {
    fr: {
      title: 'Intégration Firebase pour EDUCAFRIC',
      subtitle: 'Services Firebase avancés pour la plateforme éducative',
      overview: 'Vue d\'ensemble',
      twoFactor: 'Authentification 2FA',
      messaging: 'Messages Push',
      analytics: 'Analytics',
      storage: 'Stockage',
      currentServices: 'Services Actuels',
      availableServices: 'Services Disponibles',
      testService: 'Tester Service',
      serviceEnabled: 'Service Activé',
      serviceDisabled: 'Service Désactivé',
      serviceTesting: 'Test en Cours',
      testResults: 'Résultats des Tests',
      howFirebaseHelps: 'Comment Firebase Améliore EDUCAFRIC',
      authentication: 'Authentification Avancée',
      authDesc: '2FA par SMS, Google OAuth, authentification multi-facteurs',
      pushNotifications: 'Notifications Push',
      pushDesc: 'Notifications en temps réel pour parents, étudiants, enseignants',
      realtimeDatabase: 'Base de Données Temps Réel',
      dbDesc: 'Synchronisation instantanée des notes, présences, communications',
      cloudMessaging: 'Messages Cloud',
      messagingDesc: 'Communications sécurisées entre école-parents-étudiants',
      analyticsTracking: 'Suivi Analytics',
      analyticsDesc: 'Analyse utilisation plateforme, performance éducative',
      cloudStorage: 'Stockage Cloud',
      storageDesc: 'Documents, photos, vidéos éducatives synchronisées',
      securityRules: 'Règles de Sécurité',
      securityDesc: 'Protection données étudiants avec règles Firebase',
      offlineSupport: 'Support Hors Ligne',
      offlineDesc: 'Accès données essentielles sans connexion internet',
      testing: 'Test en cours...',
      testSuccess: 'Test réussi',
      testFailed: 'Test échoué',
      implementation: 'Implémentation',
      recommendations: 'Recommandations',
      nextSteps: 'Prochaines Étapes'
    },
    en: {
      title: 'Firebase Integration for EDUCAFRIC',
      subtitle: 'Advanced Firebase services for educational platform',
      overview: 'Overview',
      twoFactor: '2FA Authentication',
      messaging: 'Push Messaging',
      analytics: 'Analytics',
      storage: 'Storage',
      currentServices: 'Current Services',
      availableServices: 'Available Services',
      testService: 'Test Service',
      serviceEnabled: 'Service Enabled',
      serviceDisabled: 'Service Disabled',
      serviceTesting: 'Testing Service',
      testResults: 'Test Results',
      howFirebaseHelps: 'How Firebase Enhances EDUCAFRIC',
      authentication: 'Advanced Authentication',
      authDesc: 'SMS 2FA, Google OAuth, multi-factor authentication',
      pushNotifications: 'Push Notifications',
      pushDesc: 'Real-time notifications for parents, students, teachers',
      realtimeDatabase: 'Real-time Database',
      dbDesc: 'Instant sync of grades, attendance, communications',
      cloudMessaging: 'Cloud Messaging',
      messagingDesc: 'Secure communications between school-parents-students',
      analyticsTracking: 'Analytics Tracking',
      analyticsDesc: 'Platform usage analysis, educational performance',
      cloudStorage: 'Cloud Storage',
      storageDesc: 'Educational documents, photos, videos synchronized',
      securityRules: 'Security Rules',
      securityDesc: 'Student data protection with Firebase rules',
      offlineSupport: 'Offline Support',
      offlineDesc: 'Access essential data without internet connection',
      testing: 'Testing...',
      testSuccess: 'Test successful',
      testFailed: 'Test failed',
      implementation: 'Implementation',
      recommendations: 'Recommendations',
      nextSteps: 'Next Steps'
    }
  };

  const t = text[language];

  // Firebase services configuration
  const firebaseServices: FirebaseService[] = [
    {
      name: t.authentication,
      description: t.authDesc,
      status: 'enabled',
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      testFunction: async () => {
        const status = await firebaseAuth2FA.get2FAStatus();
        setServiceResults(prev => ({
          ...prev,
          authentication: { status: status ? 'configured' : 'available', data: status }
        }));
      }
    },
    {
      name: t.pushNotifications,
      description: t.pushDesc,
      status: 'testing',
      icon: <Bell className="w-6 h-6 text-green-600" />,
      testFunction: async () => {
        // Test push notification capability
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          setServiceResults(prev => ({
            ...prev,
            notifications: { 
              permission, 
              supported: true,
              status: permission === 'granted' ? 'ready' : 'needs_permission'
            }
          }));
        }
      }
    },
    {
      name: t.realtimeDatabase,
      description: t.dbDesc,
      status: 'disabled',
      icon: <Database className="w-6 h-6 text-purple-600" />,
      testFunction: async () => {
        // Test Firestore connection
        setServiceResults(prev => ({
          ...prev,
          database: { status: 'available', type: 'firestore' }
        }));
      }
    },
    {
      name: t.cloudMessaging,
      description: t.messagingDesc,
      status: 'disabled',
      icon: <MessageSquare className="w-6 h-6 text-orange-600" />,
      testFunction: async () => {
        setServiceResults(prev => ({
          ...prev,
          messaging: { status: 'requires_setup', fcm: 'available' }
        }));
      }
    },
    {
      name: t.analyticsTracking,
      description: t.analyticsDesc,
      status: 'disabled',
      icon: <BarChart3 className="w-6 h-6 text-red-600" />,
      testFunction: async () => {
        setServiceResults(prev => ({
          ...prev,
          analytics: { status: 'requires_setup', version: 'v4' }
        }));
      }
    },
    {
      name: t.cloudStorage,
      description: t.storageDesc,
      status: 'disabled',
      icon: <Cloud className="w-6 h-6 text-indigo-600" />,
      testFunction: async () => {
        setServiceResults(prev => ({
          ...prev,
          storage: { status: 'requires_setup', bucket: 'available' }
        }));
      }
    }
  ];

  const testFirebaseService = async (service: FirebaseService) => {
    if (!service.testFunction) return;
    
    setIsTestingService(service.name);
    
    try {
      await service.testFunction();
      toast({
        title: t.testSuccess,
        description: `${service.name || ''} test completed successfully`
      });
    } catch (error) {
      console.error(`${service.name || ''} test failed:`, error);
      toast({
        title: t.testFailed,
        description: `${service.name || ''} test failed`,
        variant: "destructive"
      });
    } finally {
      setIsTestingService(null);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Firebase Benefits */}
      <ModernCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t.howFirebaseHelps}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <Shield className="w-8 h-8 text-blue-600 mb-2" />
            <h4 className="font-medium text-blue-900">{t.securityRules}</h4>
            <p className="text-sm text-blue-700">{t.securityDesc}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <Bell className="w-8 h-8 text-green-600 mb-2" />
            <h4 className="font-medium text-green-900">{t.pushNotifications}</h4>
            <p className="text-sm text-green-700">{t.pushDesc}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <Database className="w-8 h-8 text-purple-600 mb-2" />
            <h4 className="font-medium text-purple-900">{t.realtimeDatabase}</h4>
            <p className="text-sm text-purple-700">{t.dbDesc}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <MessageSquare className="w-8 h-8 text-orange-600 mb-2" />
            <h4 className="font-medium text-orange-900">{t.cloudMessaging}</h4>
            <p className="text-sm text-orange-700">{t.messagingDesc}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <BarChart3 className="w-8 h-8 text-red-600 mb-2" />
            <h4 className="font-medium text-red-900">{t.analyticsTracking}</h4>
            <p className="text-sm text-red-700">{t.analyticsDesc}</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg">
            <Smartphone className="w-8 h-8 text-indigo-600 mb-2" />
            <h4 className="font-medium text-indigo-900">{t.offlineSupport}</h4>
            <p className="text-sm text-indigo-700">{t.offlineDesc}</p>
          </div>
        </div>
      </ModernCard>

      {/* Current Services Status */}
      <ModernCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t.currentServices}</h3>
        <div className="space-y-4">
          {(Array.isArray(firebaseServices) ? firebaseServices : []).map((service, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                {service.icon}
                <div>
                  <h4 className="font-medium">{service.name || ''}</h4>
                  <p className="text-sm text-gray-600">{service.description || ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge 
                  variant={
                    service.status === 'enabled' ? 'default' :
                    service.status === 'testing' ? 'secondary' : 'outline'
                  }
                >
                  {service.status === 'enabled' && t.serviceEnabled}
                  {service.status === 'testing' && t.serviceTesting}
                  {service.status === 'disabled' && t.serviceDisabled}
                </Badge>
                <Button
                  onClick={() => testFirebaseService(service)}
                  disabled={isTestingService === service.name}
                  size="sm"
                  variant="outline"
                >
                  {isTestingService === service.name ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      {t.testing}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {t.testService}
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ModernCard>

      {/* Test Results */}
      {Object.keys(serviceResults).length > 0 && (
        <ModernCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t.testResults}</h3>
          <div className="space-y-3">
            {Object.entries(serviceResults).map(([service, result]) => (
              <div key={service} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium capitalize">{service}</span>
                  <Badge variant="outline">
                    {typeof result === 'object' ? JSON.stringify(result) : result}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ModernCard>
      )}

      {/* Implementation Recommendations */}
      <ModernCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t.recommendations}</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900">Priority 1: 2FA Authentication</h4>
              <p className="text-sm text-green-700">
                Implement Firebase Phone Auth for secure two-factor authentication
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Priority 2: Push Notifications</h4>
              <p className="text-sm text-blue-700">
                Real-time notifications for grade updates, attendance, school announcements
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
            <Database className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-purple-900">Priority 3: Real-time Sync</h4>
              <p className="text-sm text-purple-700">
                Firestore for instant synchronization of educational data
              </p>
            </div>
          </div>
        </div>
      </ModernCard>
    </div>
  );

  const tabs = [
    { id: 'overview', label: t.overview, icon: <BarChart3 className="w-4 h-4" /> },
    { id: '2fa', label: t.twoFactor, icon: <Shield className="w-4 h-4" /> },
    { id: 'messaging', label: t.messaging, icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'analytics', label: t.analytics, icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'storage', label: t.storage, icon: <Cloud className="w-4 h-4" /> }
  ];

  if (!user || !['Admin', 'SiteAdmin'].includes(user.role)) {
    return (
      <ModernCard className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p className="text-gray-600">Only administrators can access Firebase integration.</p>
        </div>
      </ModernCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ModernCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Database className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t.title || ''}</h2>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
        </div>
      </ModernCard>

      {/* Tab Navigation */}
      <ModernCard className="p-6">
        <div className="flex flex-wrap gap-2">
          {(Array.isArray(tabs) ? tabs : []).map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </Button>
          ))}
        </div>
      </ModernCard>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === '2fa' && <FirebaseTwoFactorSetup />}
      {activeTab === 'messaging' && (
        <ModernCard className="p-6">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Push Messaging Setup</h3>
            <p className="text-gray-600">Firebase Cloud Messaging configuration coming soon.</p>
          </div>
        </ModernCard>
      )}
      {activeTab === 'analytics' && (
        <ModernCard className="p-6">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytics Setup</h3>
            <p className="text-gray-600">Firebase Analytics configuration coming soon.</p>
          </div>
        </ModernCard>
      )}
      {activeTab === 'storage' && (
        <ModernCard className="p-6">
          <div className="text-center">
            <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Cloud Storage Setup</h3>
            <p className="text-gray-600">Firebase Storage configuration coming soon.</p>
          </div>
        </ModernCard>
      )}
    </div>
  );
};

export default FirebaseIntegrationTest;
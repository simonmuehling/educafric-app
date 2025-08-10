import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Bell, Calendar, Clock, Mail, MessageSquare, 
  Users, AlertTriangle, CheckCircle, PlayCircle,
  RefreshCw, Settings, Smartphone
} from 'lucide-react';

interface SubscriptionStatus {
  subscriptionStatus: string;
  subscriptionPlan: string;
  subscriptionStart: string;
  subscriptionEnd: string;
  daysUntilExpiry: number;
  needsRenewal: boolean;
  isActive: boolean;
}

const SubscriptionReminderTest = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [testUserId, setTestUserId] = useState('37'); // Marie Kamga par défaut
  const [isTestingReminder, setIsTestingReminder] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isProcessingRenewal, setIsProcessingRenewal] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  const text = {
    fr: {
      title: 'Test Système Rappels d\'Abonnement',
      subtitle: 'Tester les notifications SMS et email 1 semaine avant expiration',
      testReminderTitle: 'Test Rappel d\'Abonnement',
      testReminderDesc: 'Envoie SMS + Email de rappel d\'expiration',
      testReminderButton: '📱 Tester Rappel SMS + Email',
      userIdLabel: 'ID Utilisateur à tester',
      checkStatusTitle: 'Statut Abonnement',
      checkStatusDesc: 'Vérifier le statut d\'abonnement d\'un utilisateur',
      checkStatusButton: '📊 Vérifier Statut',
      renewalLogicTitle: 'Logique de Renouvellement',
      renewalLogicDesc: 'Le renouvellement commence à la fin de l\'abonnement actuel',
      renewalTestButton: '🔄 Tester Renouvellement',
      systemConfigTitle: 'Configuration Système',
      systemConfigDesc: 'Le service vérifie automatiquement toutes les heures',
      reminderSent: 'Rappel envoyé avec succès',
      reminderSentDesc: 'SMS et email de rappel envoyés à l\'utilisateur',
      reminderError: 'Erreur d\'envoi',
      reminderErrorDesc: 'Impossible d\'envoyer le rappel',
      statusLoaded: 'Statut chargé',
      statusLoadedDesc: 'Informations d\'abonnement récupérées',
      statusError: 'Erreur de statut',
      statusErrorDesc: 'Impossible de récupérer le statut',
      testing: 'Test en cours...',
      checking: 'Vérification...',
      processing: 'Traitement...',
      subscriptionPlan: 'Plan d\'abonnement',
      subscriptionEnd: 'Fin d\'abonnement',
      daysLeft: 'Jours restants',
      active: 'Actif',
      inactive: 'Inactif',
      needsRenewal: 'Renouvellement requis',
      reminderFrequency: 'Fréquence de vérification: Toutes les heures',
      reminderWindow: 'Fenêtre de rappel: 7 jours avant expiration',
      renewalLogic: 'Nouveau abonnement commence à la fin de l\'actuel'
    },
    en: {
      title: 'Subscription Reminder System Test',
      subtitle: 'Test SMS and email notifications 1 week before expiration',
      testReminderTitle: 'Test Subscription Reminder',
      testReminderDesc: 'Send SMS + Email expiration reminder',
      testReminderButton: '📱 Test SMS + Email Reminder',
      userIdLabel: 'User ID to test',
      checkStatusTitle: 'Subscription Status',
      checkStatusDesc: 'Check user subscription status',
      checkStatusButton: '📊 Check Status',
      renewalLogicTitle: 'Renewal Logic',
      renewalLogicDesc: 'Renewal starts when current subscription ends',
      renewalTestButton: '🔄 Test Renewal',
      systemConfigTitle: 'System Configuration',
      systemConfigDesc: 'Service automatically checks every hour',
      reminderSent: 'Reminder sent successfully',
      reminderSentDesc: 'SMS and email reminder sent to user',
      reminderError: 'Send error',
      reminderErrorDesc: 'Unable to send reminder',
      statusLoaded: 'Status loaded',
      statusLoadedDesc: 'Subscription information retrieved',
      statusError: 'Status error',
      statusErrorDesc: 'Unable to retrieve status',
      testing: 'Testing...',
      checking: 'Checking...',
      processing: 'Processing...',
      subscriptionPlan: 'Subscription plan',
      subscriptionEnd: 'Subscription end',
      daysLeft: 'Days left',
      active: 'Active',
      inactive: 'Inactive',
      needsRenewal: 'Renewal required',
      reminderFrequency: 'Check frequency: Every hour',
      reminderWindow: 'Reminder window: 7 days before expiration',
      renewalLogic: 'New subscription starts when current ends'
    }
  };

  const t = text[language];

  const handleTestReminder = async () => {
    if (!testUserId) return;
    
    setIsTestingReminder(true);
    try {
      const response = await apiRequest('POST', '/api/admin/test-subscription-reminder', {
        userId: parseInt(testUserId)
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: t.reminderSent,
          description: t.reminderSentDesc,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error testing reminder:', error);
      toast({
        title: t.reminderError,
        description: t.reminderErrorDesc,
        variant: "destructive",
      });
    } finally {
      setIsTestingReminder(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const response = await apiRequest('GET', '/api/subscription/status');
      const data = await response.json();
      setSubscriptionStatus(data);
      
      toast({
        title: t.statusLoaded,
        description: t.statusLoadedDesc,
      });
    } catch (error) {
      console.error('Error checking status:', error);
      toast({
        title: t.statusError,
        description: t.statusErrorDesc,
        variant: "destructive",
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleTestRenewal = async () => {
    setIsProcessingRenewal(true);
    try {
      const response = await apiRequest('POST', '/api/subscription/renew', {
        planId: 'parent-private',
        paymentIntentId: 'test_renewal_' + Date.now()
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Renouvellement testé",
          description: data.message,
        });
        // Recharger le statut
        handleCheckStatus();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error testing renewal:', error);
      toast({
        title: "Erreur de renouvellement",
        description: "Impossible de tester le renouvellement",
        variant: "destructive",
      });
    } finally {
      setIsProcessingRenewal(false);
    }
  };

  if (!user || !['Admin', 'SiteAdmin'].includes(user.role)) {
    return (
      <ModernCard className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
          <p className="text-gray-600">Seuls les administrateurs peuvent accéder à ce module.</p>
        </div>
      </ModernCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ModernCard className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{t.title || ''}</h2>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <Clock className="w-5 h-5 text-green-600" />
            <div className="text-sm">
              <div className="font-medium text-green-800">{t.reminderFrequency}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div className="text-sm">
              <div className="font-medium text-blue-800">{t.reminderWindow}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
            <RefreshCw className="w-5 h-5 text-purple-600" />
            <div className="text-sm">
              <div className="font-medium text-purple-800">{t.renewalLogic}</div>
            </div>
          </div>
        </div>
      </ModernCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Reminder */}
        <ModernCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">{t.testReminderTitle}</h3>
          </div>
          <p className="text-gray-600 mb-4">{t.testReminderDesc}</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t.userIdLabel}</label>
              <Input
                type="number"
                value={testUserId}
                onChange={(e) => setTestUserId(e?.target?.value)}
                placeholder="37"
                className="w-full"
              />
            </div>
            
            <Button 
              onClick={handleTestReminder}
              disabled={isTestingReminder || !testUserId}
              className="w-full"
            >
              {isTestingReminder ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t.testing}
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t.testReminderButton}
                </>
              )}
            </Button>
          </div>
        </ModernCard>

        {/* Check Status */}
        <ModernCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">{t.checkStatusTitle}</h3>
          </div>
          <p className="text-gray-600 mb-4">{t.checkStatusDesc}</p>
          
          <Button 
            onClick={handleCheckStatus}
            disabled={isCheckingStatus}
            className="w-full mb-4"
            variant="outline"
          >
            {isCheckingStatus ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {t.checking}
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {t.checkStatusButton}
              </>
            )}
          </Button>

          {subscriptionStatus && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t.subscriptionPlan}:</span>
                <Badge variant="secondary">{subscriptionStatus.subscriptionPlan}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={subscriptionStatus.isActive ? "default" : "destructive"}>
                  {subscriptionStatus.isActive ? t.active : t.inactive}
                </Badge>
              </div>
              {subscriptionStatus.subscriptionEnd && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t.subscriptionEnd}:</span>
                  <span className="text-sm">
                    {new Date(subscriptionStatus.subscriptionEnd).toLocaleDateString()}
                  </span>
                </div>
              )}
              {subscriptionStatus.daysUntilExpiry !== null && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t.daysLeft}:</span>
                  <Badge variant={subscriptionStatus.daysUntilExpiry <= 7 ? "destructive" : "default"}>
                    {subscriptionStatus.daysUntilExpiry} jours
                  </Badge>
                </div>
              )}
              {subscriptionStatus.needsRenewal && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t.needsRenewal}:</span>
                  <Badge variant="destructive">Oui</Badge>
                </div>
              )}
            </div>
          )}
        </ModernCard>
      </div>

      {/* Test Renewal Logic */}
      <ModernCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <PlayCircle className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">{t.renewalLogicTitle}</h3>
        </div>
        <p className="text-gray-600 mb-4">{t.renewalLogicDesc}</p>
        
        <Button 
          onClick={handleTestRenewal}
          disabled={isProcessingRenewal}
          className="w-full"
          variant="outline"
        >
          {isProcessingRenewal ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              {t.processing}
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t.renewalTestButton}
            </>
          )}
        </Button>
      </ModernCard>
    </div>
  );
};

export default SubscriptionReminderTest;
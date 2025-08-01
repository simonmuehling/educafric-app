import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { BilingualTwoFactorSetup } from './BilingualTwoFactorSetup';
import { UniversalSecuritySettings } from './UniversalSecuritySettings';
import { ModernCard } from '@/components/ui/ModernCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Settings, HelpCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ConsolidatedTwoFactorManagerProps {
  userRole?: string;
  showFullSettings?: boolean;
}

export const ConsolidatedTwoFactorManager: React.FC<ConsolidatedTwoFactorManagerProps> = ({
  userRole = 'user',
  showFullSettings = false
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const translations = {
    fr: {
      title: 'Gestion de la Sécurité',
      subtitle: 'Configuration complète de l\'authentification à deux facteurs',
      setup: 'Configuration 2FA',
      security: 'Paramètres de Sécurité',
      help: 'Aide & Récupération',
      status: 'Statut Actuel',
      enabled: 'Activé',
      disabled: 'Désactivé',
      quickSetup: 'Configuration Rapide',
      fullSettings: 'Paramètres Complets',
      recoveryGuide: 'Guide de Récupération',
      downloadGuide: 'Télécharger le Guide',
      supportInfo: 'Informations de Support',
      emergencyContact: 'Contact d\'Urgence',
      backupMethods: 'Méthodes de Sauvegarde',
      loading: 'Chargement...',
      error: 'Erreur lors du chargement'
    },
    en: {
      title: 'Security Management',
      subtitle: 'Complete two-factor authentication configuration',
      setup: '2FA Setup',
      security: 'Security Settings',
      help: 'Help & Recovery',
      status: 'Current Status',
      enabled: 'Enabled',
      disabled: 'Disabled',
      quickSetup: 'Quick Setup',
      fullSettings: 'Full Settings',
      recoveryGuide: 'Recovery Guide',
      downloadGuide: 'Download Guide',
      supportInfo: 'Support Information',
      emergencyContact: 'Emergency Contact',
      backupMethods: 'Backup Methods',
      loading: 'Loading...',
      error: 'Error loading'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.fr;

  // Vérifier le statut 2FA au chargement
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('GET', '/api/2fa/status');
        const data = await response.json();
        
        if (data.success) {
          setIs2FAEnabled(data?.data?.enabled);
        }
      } catch (error) {
        console.error('Failed to fetch 2FA status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const downloadRecoveryGuide = () => {
    const guideContent = `
EDUCAFRIC - ${t.recoveryGuide}
${'='.repeat(50)}

${t.emergencyContact}: +237 656 200 472
Support Email: support@educafric.com
WhatsApp: +237 656 200 472

${t.backupMethods}:
1. Codes de sauvegarde (8 codes à usage unique)
2. Récupération par SMS
3. Contact administrateur
4. Support EDUCAFRIC

Utilisateur: ${user?.firstName} ${user?.lastName}
Email: ${user?.email}
Rôle: ${userRole}
Date: ${new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}

En cas de perte de téléphone, utilisez d'abord vos codes
de sauvegarde, puis contactez le support si nécessaire.
    `;

    const blob = new Blob([guideContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `educafric-2fa-recovery-${userRole}-${language}.txt`;
    document?.body?.appendChild(a);
    a.click();
    document?.body?.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: language === 'fr' ? 'Téléchargement' : 'Download',
      description: language === 'fr' ? 'Guide téléchargé avec succès' : 'Guide downloaded successfully'
    });
  };

  if (loading) {
    return (
      <ModernCard className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>{t.loading}</span>
        </div>
      </ModernCard>
    );
  }

  // Interface simple pour intégration dans les dashboards
  if (!showFullSettings) {
    return (
      <ModernCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className={`w-5 h-5 ${is2FAEnabled ? 'text-green-500' : 'text-gray-400'}`} />
            <span className="font-medium">2FA</span>
            <span className={`text-sm px-2 py-1 rounded ${
              is2FAEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {is2FAEnabled ? t.enabled : t.disabled}
            </span>
          </div>
          <Button
            onClick={downloadRecoveryGuide}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-1" />
            {t.recoveryGuide}
          </Button>
        </div>
        
        <BilingualTwoFactorSetup 
          isEnabled={is2FAEnabled} 
          onToggle={setIs2FAEnabled}
        />
      </ModernCard>
    );
  }

  // Interface complète avec onglets
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t.title || ''}</h2>
        <p className="text-gray-600 mb-6">{t.subtitle}</p>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {t.setup}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {t.security}
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            {t.help}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="mt-6">
          <ModernCard className="p-6">
            <BilingualTwoFactorSetup 
              isEnabled={is2FAEnabled} 
              onToggle={setIs2FAEnabled}
            />
          </ModernCard>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <UniversalSecuritySettings 
            userRole={userRole}
            onSecurityUpdate={(data) => {
              if (data.twoFactorEnabled !== undefined) {
                setIs2FAEnabled(data.twoFactorEnabled);
              }
            }}
          />
        </TabsContent>

        <TabsContent value="help" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ModernCard className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-500" />
                {t.recoveryGuide}
              </h3>
              
              <div className="space-y-4 text-sm">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    {language === 'fr' ? 'En cas de perte de téléphone' : 'If you lose your phone'}
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800">
                    <li>{language === 'fr' ? 'Utilisez vos codes de sauvegarde' : 'Use your backup codes'}</li>
                    <li>{language === 'fr' ? 'Demandez un code par SMS' : 'Request SMS code'}</li>
                    <li>{language === 'fr' ? 'Contactez le support' : 'Contact support'}</li>
                  </ol>
                </div>
                
                <Button 
                  onClick={downloadRecoveryGuide}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.downloadGuide}
                </Button>
              </div>
            </ModernCard>

            <ModernCard className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                {t.supportInfo}
              </h3>
              
              <div className="space-y-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Cameroun:</span>
                    <span>+237 656 200 472</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">International:</span>
                    <span>+41 768 017 000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>support@educafric.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">WhatsApp:</span>
                    <span>+237 656 200 472</span>
                  </div>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-green-800 text-xs">
                    {language === 'fr' 
                      ? 'Support disponible 24h/24, 7j/7 pour les urgences sécuritaires'
                      : '24/7 support available for security emergencies'
                    }
                  </p>
                </div>
              </div>
            </ModernCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConsolidatedTwoFactorManager;
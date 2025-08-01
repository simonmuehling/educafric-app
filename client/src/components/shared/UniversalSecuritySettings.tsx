import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import SimpleTwoFactorDemo from '@/components/shared/SimpleTwoFactorDemo';
import { ModernCard } from '@/components/ui/ModernCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Eye, EyeOff, Key, Download, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface UniversalSecuritySettingsProps {
  userRole: string;
  onPasswordChange?: (data: any) => void;
  onSecurityUpdate?: (data: any) => void;
}

export const UniversalSecuritySettings: React.FC<UniversalSecuritySettingsProps> = ({
  userRole,
  onPasswordChange,
  onSecurityUpdate
}) => {
  const { language } = useLanguage();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const t = {
    fr: {
      title: 'Paramètres de Sécurité',
      subtitle: 'Gérez la sécurité de votre compte EDUCAFRIC',
      changePassword: 'Changer le Mot de Passe',
      currentPassword: 'Mot de passe actuel',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      twoFactorAuth: 'Authentification à Deux Facteurs (2FA)',
      enable2FA: 'Activer 2FA',
      disable2FA: 'Désactiver 2FA',
      backupCodes: 'Codes de Sauvegarde',
      downloadCodes: 'Télécharger les Codes',
      generateNewCodes: 'Générer Nouveaux Codes',
      recoveryMethods: 'Méthodes de Récupération',
      smsRecovery: 'Récupération par SMS',
      emergencyContact: 'Contact d\'Urgence',
      securityTips: 'Conseils de Sécurité',
      saveChanges: 'Enregistrer les Modifications',
      passwordChanged: 'Mot de passe modifié avec succès!',
      redirectingToLogin: 'Redirection vers la connexion...',
      twoFactorEnabled: '2FA activé avec succès!',
      security: 'Sécurité',
      emergencyHelp: 'Aide d\'Urgence',
      lostPhone: 'Téléphone Perdu?',
      recoveryGuide: 'Guide de Récupération'
    },
    en: {
      title: 'Security Settings',
      subtitle: 'Manage your EDUCAFRIC account security',
      changePassword: 'Change Password',
      currentPassword: 'Current password',
      newPassword: 'New password',
      confirmPassword: 'Confirm password',
      twoFactorAuth: 'Two-Factor Authentication (2FA)',
      enable2FA: 'Enable 2FA',
      disable2FA: 'Disable 2FA',
      backupCodes: 'Backup Codes',
      downloadCodes: 'Download Codes',
      generateNewCodes: 'Generate New Codes',
      recoveryMethods: 'Recovery Methods',
      smsRecovery: 'SMS Recovery',
      emergencyContact: 'Emergency Contact',
      securityTips: 'Security Tips',
      saveChanges: 'Save Changes',
      passwordChanged: 'Password changed successfully!',
      redirectingToLogin: 'Redirecting to login...',
      twoFactorEnabled: '2FA enabled successfully!',
      security: 'Security',
      emergencyHelp: 'Emergency Help',
      lostPhone: 'Lost Phone?',
      recoveryGuide: 'Recovery Guide'
    }
  };

  const currentT = t[language as keyof typeof t] || t.fr;
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.(Array.isArray(newPassword) ? newPassword.length : 0) < 8) {
      toast({
        title: "Erreur", 
        description: "Le mot de passe doit contenir au moins 8 caractères",
        variant: "destructive"
      });
      return;
    }

    try {
      // Call API to change password
      await apiRequest('POST', '/api/auth/change-password', passwordData);
      
      toast({
        title: "Succès",
        description: currentT.passwordChanged + " Redirection vers la connexion..."
      });
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Wait 2 seconds then logout and redirect to login
      setTimeout(async () => {
        await logout();
        setLocation('/');
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Échec du changement de mot de passe",
        variant: "destructive"
      });
    }
  };

  // Handle 2FA toggle - simplified for new component
  const handle2FAToggle = (enabled: boolean) => {
    setIs2FAEnabled(enabled);
    if (onSecurityUpdate) {
      onSecurityUpdate({ twoFactorEnabled: enabled });
    }
  };

  const downloadRecoveryGuide = () => {
    const guideContent = `
EDUCAFRIC - Guide de Récupération 2FA
====================================

🚨 EN CAS DE PERTE DE TÉLÉPHONE :

1. CODES DE SAUVEGARDE
   - Utilisez un de vos 8 codes de sauvegarde
   - Chaque code ne peut être utilisé qu'une seule fois
   - Gardez-les en lieu sûr

2. RÉCUPÉRATION SMS
   - Demandez un code par SMS
   - Code valide 5 minutes
   - Nécessite numéro vérifié

3. CONTACT SUPPORT
   - Email: support@educafric.com
   - Téléphone: +237 656 200 472
   - WhatsApp: +237 656 200 472

INFORMATIONS IMPORTANTES :
- Rôle: ${userRole}
- Date: ${new Date().toLocaleDateString('fr-FR')}
- Établissement: [Votre école]

Gardez ce document en lieu sûr!
    `;

    const blob = new Blob([guideContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `educafric-recovery-guide-${userRole.toLowerCase()}.txt`;
    document?.body?.appendChild(a);
    a.click();
    document?.body?.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Téléchargement",
      description: "Guide de récupération téléchargé avec succès"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{currentT.title || ''}</h2>
        <p className="text-gray-600 mb-6">{currentT.subtitle}</p>
      </div>

      {/* Password Change */}
      <ModernCard className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-500" />
          {currentT.changePassword}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{currentT.currentPassword}</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e?.target?.value}))}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">{currentT.newPassword}</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e?.target?.value}))}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{currentT.confirmPassword}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e?.target?.value}))}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handlePasswordChange} 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
        >
          <Lock className="w-4 h-4 mr-2" />
          {currentT.changePassword}
        </Button>
      </ModernCard>

      {/* Two-Factor Authentication */}
      <SimpleTwoFactorDemo language={language} />

        {/* Recovery Methods */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-3 flex items-center gap-2">
            <Key className="w-4 h-4" />
            {currentT.recoveryMethods}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
            <div>
              <strong>1. {currentT.backupCodes}</strong>
              <p>8 codes à usage unique pour récupération</p>
            </div>
            <div>
              <strong>2. {currentT.smsRecovery}</strong>
              <p>Code par SMS sur votre téléphone vérifié</p>
            </div>
            <div>
              <strong>3. {currentT.emergencyContact}</strong>
              <p>Contact administrateur: +237 656 200 472</p>
            </div>
            <div>
              <strong>4. Support EDUCAFRIC</strong>
              <p>Email: support@educafric.com</p>
            </div>
          </div>
          
          <div className="mt-4 flex gap-3">
            <Button 
              onClick={downloadRecoveryGuide}
              variant="outline"
              size="sm"
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            >
              <Download className="w-4 h-4 mr-2" />
              {currentT.recoveryGuide}
            </Button>
          </div>
        </div>
      </ModernCard>

      {/* Security Tips */}
      <ModernCard className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-500" />
          {currentT.securityTips}
        </h3>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <ul className="space-y-2 text-sm text-purple-700">
            <li>✅ <strong>Stockez vos codes de sauvegarde</strong> en lieu sûr (coffre-fort, gestionnaire de mots de passe)</li>
            <li>✅ <strong>Utilisez Authy</strong> au lieu de Google Authenticator (synchronisation cloud)</li>
            <li>✅ <strong>Configurez 2FA sur 2 appareils</strong> (téléphone + tablette)</li>
            <li>✅ <strong>Vérifiez votre numéro de téléphone</strong> pour la récupération SMS</li>
            <li>✅ <strong>Changez votre mot de passe</strong> régulièrement (tous les 3 mois)</li>
            <li>⚠️ <strong>NE PERDEZ JAMAIS vos codes de sauvegarde</strong> - imprimez-les!</li>
          </ul>
        </div>
      </ModernCard>
    </div>
  );
};

export default UniversalSecuritySettings;